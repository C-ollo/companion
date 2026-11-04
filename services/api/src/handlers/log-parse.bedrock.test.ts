import type { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { describe, expect, it } from 'vitest';

import { handler } from './log-parse';

/**
 * Live test against Bedrock. Costs a fraction of a cent, so it only runs when asked:
 *   RUN_BEDROCK_TESTS=1 AWS_REGION=us-east-1 npx vitest run log-parse.bedrock
 */
describe.skipIf(!process.env.RUN_BEDROCK_TESTS)('POST /log/parse (live Bedrock)', () => {
  it('maps a plain-language log to the laundry skill', { timeout: 60_000 }, async () => {
    const event = {
      routeKey: 'POST /log/parse',
      body: JSON.stringify({ text: 'I washed my clothes by myself today', passport: [] }),
      isBase64Encoded: false,
    } as unknown as APIGatewayProxyEventV2;

    const res = (await handler(event)) as APIGatewayProxyStructuredResultV2;
    const body = JSON.parse(res.body ?? '{}');
    console.log(body);

    expect(res.statusCode).toBe(200);
    expect(body.skill_id).toBe('laundry');
    expect(body.support_level).toBe('on_my_own');
  });
});
