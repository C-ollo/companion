import { AnthropicBedrockMantle } from '@anthropic-ai/bedrock-sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import type Anthropic from '@anthropic-ai/sdk';
import type { z } from 'zod';

import sharedStyle from '../../../../prompts/shared-style.md';

/**
 * One client per Lambda container. Credentials come from the Lambda execution role
 * (default AWS credential chain); region from AWS_REGION.
 */
const client = new AnthropicBedrockMantle();

export const MODEL_ID = process.env.BEDROCK_MODEL_ID ?? 'anthropic.claude-opus-5-5';

export type Effort = 'low' | 'medium' | 'high';

/** Thrown when the model declines; handlers turn this into a safe "not sure" reply. */
export class ModelRefusalError extends Error {}

/** Thrown when the model's output didn't match the schema. */
export class ModelOutputError extends Error {}

interface AskOptions<T extends z.ZodType> {
  /** Task-specific system prompt; the shared style rules are prepended. */
  system: string;
  content: Anthropic.MessageParam['content'];
  schema: T;
  effort: Effort;
  maxTokens?: number;
}

/**
 * One structured-output call to Claude. The system prompt is cached, since it is the
 * same for every request to a given endpoint.
 */
export async function askClaude<T extends z.ZodType>({
  system,
  content,
  schema,
  effort,
  maxTokens = 16000,
}: AskOptions<T>): Promise<z.infer<T>> {
  const response = await client.messages.parse({
    model: MODEL_ID,
    max_tokens: maxTokens,
    system: [
      {
        type: 'text',
        text: `${sharedStyle}\n\n${system}`,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [{ role: 'user', content }],
    output_config: { effort, format: zodOutputFormat(schema) },
  });

  if (response.stop_reason === 'refusal') {
    throw new ModelRefusalError('Model declined the request');
  }
  if (response.parsed_output == null) {
    throw new ModelOutputError(`No parsed output (stop_reason: ${response.stop_reason})`);
  }
  return response.parsed_output as z.infer<T>;
}

/** Image block for a base64 JPEG from the phone camera. */
export function jpegBlock(base64: string): Anthropic.ImageBlockParam {
  return { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: base64 } };
}
