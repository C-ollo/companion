import { App } from 'aws-cdk-lib';

import { SkillPassportStack } from '../lib/skill-passport-stack';

const app = new App();

new SkillPassportStack(app, 'SkillPassport', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    // Claude Opus 5.5 is available on Bedrock in us-east-1 and us-west-2.
    region: process.env.CDK_DEFAULT_REGION ?? 'us-east-1',
  },
  description: 'Skill Passport backend: HTTP API, Lambda functions calling Claude on Bedrock, share links.',
  tags: { project: 'skill-passport' },
});
