import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { z } from 'zod';

export type Handler = (event: APIGatewayProxyEventV2) => Promise<APIGatewayProxyResultV2>;

export function json(statusCode: number, body: unknown): APIGatewayProxyResultV2 {
  return {
    statusCode,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  };
}

export class BadRequestError extends Error {}

/** Parse and validate a JSON request body against a schema. */
export function parseBody<T extends z.ZodType>(event: APIGatewayProxyEventV2, schema: T): z.infer<T> {
  let raw: unknown;
  try {
    const text = event.isBase64Encoded
      ? Buffer.from(event.body ?? '', 'base64').toString('utf8')
      : (event.body ?? '');
    raw = JSON.parse(text || '{}');
  } catch {
    throw new BadRequestError('Body must be valid JSON');
  }
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new BadRequestError(z.prettifyError(result.error));
  }
  return result.data;
}

/**
 * Wrap a handler with consistent error responses. Never log request bodies:
 * they can contain photos and personal logs.
 */
export function withErrors(handler: Handler): Handler {
  return async (event) => {
    try {
      return await handler(event);
    } catch (err) {
      if (err instanceof BadRequestError) return json(400, { error: err.message });
      console.error(JSON.stringify({ route: event.routeKey, error: String(err) }));
      return json(500, { error: 'Something went wrong. Please try again.' });
    }
  };
}
