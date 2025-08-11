import { Mistral } from '@mistralai/mistralai';
import { ContentChunk } from '@mistralai/mistralai/models/components/contentchunk.js';

const apiKey = process.env.MISTRAL_API_KEY;
const client = new Mistral({ apiKey: apiKey });
const sysPrompt = process.env.PROMPT || 'You are a helpful assistant.';

/**
 * Generates a response using the Mistral AI model.
 * @param {string} prompt - The input prompt for the model.
 * @returns {Promise<string | null>} - The generated response or null if no response is generated.
 */
export default async function generateResponse(
  userPrompt: string
): Promise<string | null> {
  let response = null;
  const prompt = sysPrompt.replace('{question}', userPrompt);
  const chatResponse = await client.chat.complete({
    // model: 'magistral-small-2507',
    model: 'open-mistral-nemo',
    messages: [{ role: 'user', content: prompt }],
  });

  console.log('Chat:', chatResponse.choices?.[0]?.message?.content);

  const chunk = chatResponse.choices?.[0]?.message?.content || null;

  // check the shape of the chunk data.
  if (chunk && typeof chunk === 'object') {
    chunk.forEach((c: ContentChunk) => {
      if (c.type === 'text') {
        response = c.text;
      }
    });
  } else if (typeof chunk === 'string') {
    response = chunk;
  }
  return response;
}
