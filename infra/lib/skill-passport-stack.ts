import * as path from 'node:path';

import { CfnOutput, Duration, RemovalPolicy, Stack } from 'aws-cdk-lib';
import type { StackProps } from 'aws-cdk-lib';
import { CfnStage, CorsHttpMethod, HttpApi, HttpMethod } from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { AttributeType, Billing, TableV2 } from 'aws-cdk-lib/aws-dynamodb';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, OutputFormat } from 'aws-cdk-lib/aws-lambda-nodejs';
import type { NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import type { Construct } from 'constructs';

const REPO_ROOT = path.join(__dirname, '..', '..');
const HANDLERS = path.join(REPO_ROOT, 'services', 'api', 'src', 'handlers');

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
      description: "Set VITE_API_URL in apps/web to this value",
    });
  }
}
