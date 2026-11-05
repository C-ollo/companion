import * as fs from 'node:fs';
import * as path from 'node:path';

import { CfnOutput, Duration, RemovalPolicy, Stack } from 'aws-cdk-lib';
import type { StackProps } from 'aws-cdk-lib';
import { CfnStage, CorsHttpMethod, HttpApi, HttpMethod } from 'aws-cdk-lib/aws-apigatewayv2';
import { Distribution, ViewerProtocolPolicy } from 'aws-cdk-lib/aws-cloudfront';
import { S3BucketOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { AttributeType, Billing, TableV2 } from 'aws-cdk-lib/aws-dynamodb';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, OutputFormat } from 'aws-cdk-lib/aws-lambda-nodejs';
import type { NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { BlockPublicAccess, Bucket, BucketEncryption } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, CacheControl, Source } from 'aws-cdk-lib/aws-s3-deployment';
import type { Construct } from 'constructs';

const REPO_ROOT = path.join(__dirname, '..', '..');
const HANDLERS = path.join(REPO_ROOT, 'services', 'api', 'src', 'handlers');
const WEB_DIST = path.join(REPO_ROOT, 'apps', 'web', 'dist');

const MODEL_ID = 'anthropic.claude-opus-5-5';

export class SkillPassportStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Share snapshots the owner created. Nothing else is stored server-side.
    const shares = new TableV2(this, 'Shares', {
      partitionKey: { name: 'id', type: AttributeType.STRING },
      billing: Billing.onDemand(),
      timeToLiveAttribute: 'expiresAt',
      // Challenge prototype: tear down cleanly. Change to RETAIN before real users.
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const fn = (name: string, file: string, handler: string, extra: Partial<NodejsFunctionProps> = {}) =>
      new NodejsFunction(this, name, {
        entry: path.join(HANDLERS, file),
        handler,
        runtime: Runtime.NODEJS_22_X,
        architecture: Architecture.ARM_64,
        memorySize: 512,
        // API Gateway HTTP APIs time out at 30 seconds.
        timeout: Duration.seconds(29),
        projectRoot: REPO_ROOT,
        depsLockFilePath: path.join(REPO_ROOT, 'package-lock.json'),
        bundling: {
          format: OutputFormat.CJS,
          target: 'node22',
          sourceMap: true,
          minify: true,
          // Prompts in /prompts are bundled verbatim as strings.
          loader: { '.md': 'text' },
        },
        environment: {
          BEDROCK_MODEL_ID: MODEL_ID,
          NODE_OPTIONS: '--enable-source-maps',
        },
        logGroup: new LogGroup(this, `${name}Logs`, {
          retention: RetentionDays.TWO_WEEKS,
          removalPolicy: RemovalPolicy.DESTROY,
        }),
        ...extra,
      });

    // Functions that call Claude on Bedrock (Mantle endpoint).
    const aiFunctions = {
      logParse: fn('LogParse', 'log-parse.ts', 'handler'),
      pointAsk: fn('PointAsk', 'point-ask.ts', 'handler', { memorySize: 1024 }),
      pointAskIdentify: fn('PointAskIdentify', 'point-ask.ts', 'identify', { memorySize: 1024 }),
      pointAskSteps: fn('PointAskSteps', 'point-ask.ts', 'steps', { memorySize: 1024 }),
      checkStep: fn('CheckStep', 'check-step.ts', 'handler', { memorySize: 1024 }),
      summary: fn('Summary', 'summary.ts', 'handler'),
    };

    const mantleInference = new PolicyStatement({
      actions: ['bedrock-mantle:CreateInference', 'bedrock-mantle:Get*'],
      resources: [`arn:${this.partition}:bedrock-mantle:${this.region}:${this.account}:project/*`],
    });
    for (const f of Object.values(aiFunctions)) f.addToRolePolicy(mantleInference);

    // Share-link functions only touch DynamoDB.
    const shareEnv = { environment: { SHARES_TABLE: shares.tableName } };
    const shareCreate = fn('ShareCreate', 'share.ts', 'create', shareEnv);
    const shareGet = fn('ShareGet', 'share.ts', 'get', shareEnv);
    const shareRemove = fn('ShareRemove', 'share.ts', 'remove', shareEnv);
    shares.grantWriteData(shareCreate);
    shares.grantReadData(shareGet);
    shares.grantReadWriteData(shareRemove);

    const api = new HttpApi(this, 'Api', {
      description: 'Skill Passport API',
      corsPreflight: {
        allowOrigins: ['*'],
        allowMethods: [CorsHttpMethod.GET, CorsHttpMethod.POST, CorsHttpMethod.DELETE, CorsHttpMethod.OPTIONS],
        allowHeaders: ['content-type', 'x-delete-token'],
        maxAge: Duration.hours(1),
      },
    });

    const route = (p: string, method: HttpMethod, handler: NodejsFunction) =>
      api.addRoutes({
        path: p,
        methods: [method],
        integration: new HttpLambdaIntegration(`${handler.node.id}Integration`, handler),
      });

    route('/log/parse', HttpMethod.POST, aiFunctions.logParse);
    route('/point-ask', HttpMethod.POST, aiFunctions.pointAsk);
    route('/point-ask/identify', HttpMethod.POST, aiFunctions.pointAskIdentify);
    route('/point-ask/steps', HttpMethod.POST, aiFunctions.pointAskSteps);
    route('/check-step', HttpMethod.POST, aiFunctions.checkStep);
    route('/summary', HttpMethod.POST, aiFunctions.summary);
    route('/share', HttpMethod.POST, shareCreate);
    route('/share/{id}', HttpMethod.GET, shareGet);
    route('/share/{id}', HttpMethod.DELETE, shareRemove);

    // The API has no sign-in yet, so cap request rates to limit cost from misuse.
    const stage = api.defaultStage?.node.defaultChild as CfnStage;
    stage.defaultRouteSettings = { throttlingRateLimit: 5, throttlingBurstLimit: 10 };

    new CfnOutput(this, 'ApiUrl', {
      value: api.apiEndpoint,
      description: 'Set VITE_API_URL in apps/web to this value',
    });

    // The Companion web app: a private bucket served over HTTPS by CloudFront.
    // HTTPS is required for the phone camera and for installing the app.
    const webBucket = new Bucket(this, 'WebBucket', {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });
    const web = new Distribution(this, 'Web', {
      comment: 'Companion web app',
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: S3BucketOrigin.withOriginAccessControl(webBucket),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      errorResponses: [
        { httpStatus: 403, responseHttpStatus: 200, responsePagePath: '/index.html' },
        { httpStatus: 404, responseHttpStatus: 200, responsePagePath: '/index.html' },
      ],
    });

    // Upload the built app if it exists (build apps/web first; see README).
    // no-cache makes browsers re-check files, so design updates always reach people.
    if (fs.existsSync(path.join(WEB_DIST, 'index.html'))) {
      new BucketDeployment(this, 'WebDeploy', {
        sources: [Source.asset(WEB_DIST)],
        destinationBucket: webBucket,
        cacheControl: [CacheControl.fromString('no-cache')],
        distribution: web,
        distributionPaths: ['/*'],
      });
    }

    new CfnOutput(this, 'WebUrl', {
      value: `https://${web.distributionDomainName}`,
      description: 'Public link to the Companion app',
    });
  }
}
