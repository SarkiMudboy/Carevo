import OpenAI from 'openai';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const sysPrompt = process.env.SYSTEM_PROMPT || 'You are a helpful assistant.';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: OPENROUTER_API_KEY,
  defaultHeaders: {},
});

export default async function generateResponse(
  userPrompt: string
): Promise<string | null> {
  const prompt = sysPrompt.replace('{question}', userPrompt);

  const completion = await openai.chat.completions.create({
    model: 'google/gemini-flash-1.5-8b',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: prompt,
          },
        ],
      },
    ],
  });

  const response = completion.choices[0].message;
  return response.content || null;
}
