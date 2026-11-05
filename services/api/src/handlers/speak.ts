import { PollyClient, SynthesizeSpeechCommand } from '@aws-sdk/client-polly';
import type { VoiceId } from '@aws-sdk/client-polly';
import { z } from 'zod';

import { json, parseBody, withErrors } from '../lib/http';

/**
 * POST /speak: read text aloud with Amazon Polly (natural neural voice), so
 * "Read aloud" sounds the same on every phone. The app falls back to the
 * phone's built-in voice if this fails or the phone is offline.
 */

const polly = new PollyClient({});
const VOICE = (process.env.POLLY_VOICE ?? 'Ruth') as VoiceId;

const SpeakSchema = z.object({ text: z.string().min(1).max(1500) });

// SSML needs these characters escaped.
const escapeSsml = (text: string) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

export const handler = withErrors(async (event) => {
  const { text } = parseBody(event, SpeakSchema);
  const out = await polly.send(
    new SynthesizeSpeechCommand({
      Engine: 'neural',
      VoiceId: VOICE,
      OutputFormat: 'mp3',
      TextType: 'ssml',
      // A little slower than normal, matching the app's built-in read-aloud.
      Text: `<speak><prosody rate="90%">${escapeSsml(text)}</prosody></speak>`,
    }),
  );
  if (!out.AudioStream) return json(502, { error: 'No audio' });
  const audio = Buffer.from(await out.AudioStream.transformToByteArray());
  return {
    statusCode: 200,
    headers: { 'content-type': 'audio/mpeg', 'cache-control': 'private, max-age=86400' },
    body: audio.toString('base64'),
    isBase64Encoded: true,
  };
});
