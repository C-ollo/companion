import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { z } from 'zod';

import { BadRequestError, json, parseBody, withErrors } from '../lib/http';

/**
 * Share links. The owner creates a read-only snapshot of what they chose to share,
 * gets back a link id and a private delete token, and can delete it any time.
 * Snapshots expire automatically after SHARE_TTL_DAYS.
 */

const TABLE = process.env.SHARES_TABLE ?? '';
const SHARE_TTL_DAYS = 90;
const MAX_SNAPSHOT_BYTES = 100_000;

const db = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const CreateShareSchema = z.object({
  /** Who it's for, e.g. ["Mom", "Jordan"]. Shown on the shared page. */
  recipients: z.array(z.string().max(60)).min(1).max(20),
  /** What the owner chose to share (summary, stamps). The app decides the shape. */
  snapshot: z.record(z.string(), z.unknown()),
});

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

function tokenMatches(token: string, storedHash: string) {
  const a = Buffer.from(hashToken(token), 'hex');
  const b = Buffer.from(storedHash, 'hex');
  return a.length === b.length && timingSafeEqual(a, b);
}

/** POST /share */
export const create = withErrors(async (event) => {
  const req = parseBody(event, CreateShareSchema);
  if (JSON.stringify(req.snapshot).length > MAX_SNAPSHOT_BYTES) {
    throw new BadRequestError('That is too much to share in one link.');
  }
  const id = randomBytes(12).toString('base64url');
  const deleteToken = randomBytes(24).toString('base64url');
  const now = Math.floor(Date.now() / 1000);

  await db.send(
    new PutCommand({
      TableName: TABLE,
      Item: {
        id,
        recipients: req.recipients,
        snapshot: req.snapshot,
        deleteTokenHash: hashToken(deleteToken),
        createdAt: new Date().toISOString(),
        expiresAt: now + SHARE_TTL_DAYS * 24 * 60 * 60,
      },
      ConditionExpression: 'attribute_not_exists(id)',
    }),
  );
  return json(201, { id, deleteToken });
});

/** GET /share/{id}: read-only view for the people the owner shared with. */
export const get = withErrors(async (event) => {
  const id = event.pathParameters?.id ?? '';
  const { Item } = await db.send(new GetCommand({ TableName: TABLE, Key: { id } }));
  const expired = Item && Item.expiresAt < Math.floor(Date.now() / 1000);
  if (!Item || expired) return json(404, { error: 'This link is no longer shared.' });
  return json(200, { recipients: Item.recipients, snapshot: Item.snapshot, createdAt: Item.createdAt });
});

/** DELETE /share/{id}: the owner stops sharing. Needs the delete token from creation. */
export const remove = withErrors(async (event) => {
  const id = event.pathParameters?.id ?? '';
  const token = event.headers['x-delete-token'] ?? '';
  const { Item } = await db.send(new GetCommand({ TableName: TABLE, Key: { id } }));
  if (!Item) return { statusCode: 204 };
  if (!token || !tokenMatches(token, Item.deleteTokenHash)) {
    return json(403, { error: 'Only the person who shared this can stop sharing it.' });
  }
  await db.send(new DeleteCommand({ TableName: TABLE, Key: { id } }));
  return { statusCode: 204 };
});
