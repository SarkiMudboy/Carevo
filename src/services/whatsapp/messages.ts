// import generateResponse from '#services/inference/mistral.js';
import generateResponse from '#services/inference/openrouter.js';
import { parseIncomingWhatAppMessageData } from './utils.js';

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const RECIPIENT_WAID = process.env.RECIPIENT_WAID;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const VERSION = process.env.VERSION || 'v22.0';

async function sendMessage(message: string) {
  const url = `https://graph.facebook.com/${VERSION}/${PHONE_NUMBER_ID}/messages`;
  console.log(url);
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: RECIPIENT_WAID,
      recepient_type: 'individual',
      type: 'text',
      text: { preview_url: false, body: message },
    }),
  });
  console.log(`Response status: ${response.status}`);
  console.log(`Response status text: ${response.statusText}`);

  return response.json();
}

export const processMessage = async (data: any) => {
  const messageData = parseIncomingWhatAppMessageData(data);

  if (messageData?.text) {
    const responseText = await generateResponse(messageData.text);

    const response = await sendMessage(
      responseText || 'Sorry, I did not understand that.'
    );
  }
};
