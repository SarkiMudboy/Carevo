const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const sysPrompt = process.env.SYSTEM_PROMPT || 'You are a helpful assistant.';

export default async function generateResponse(
  userPrompt: string
): Promise<string | null> {
  const prompt = sysPrompt.replace('{question}', userPrompt);

  const openrouterResponse = await fetch(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b:free',
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
      }),
    }
  );
  const completion: any = await openrouterResponse.json();
  console.log('OpenRouter Response:', completion);
  const response = completion.choices[0].message;
  console.log(response.content);
  return response.content || null;
}
