import fs from 'fs';
import generateAudio from '#services/inference/gemini_tts.js';
import generateResponse from '#services/inference/openrouter.js';
import { checkMessageCache, parseIncomingWhatAppMessageData } from './utils.js';
import FormData from 'form-data';
import axios from 'axios';

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const RECIPIENT_WAID = process.env.RECIPIENT_WAID;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const VERSION = process.env.VERSION || 'v22.0';

type FileUploadResponse = { id: string };
type MessageResponse = {
  type: 'text' | 'audio';
  text?: { preview_url: boolean; body: string };
  audio?: { id: string };
};

/*
{
      messaging_product: 'whatsapp',
      to: RECIPIENT_WAID,
      recepient_type: 'individual',
      type: 'text',
      text: { preview_url: false, body: message },
    }

*/

function getOutgoingMessageData(message: MessageResponse) {
  const baseResponseData = {
    messaging_product: 'whatsapp',
    to: RECIPIENT_WAID,
    recepient_type: 'individual',
  };
  return { ...baseResponseData, ...message };
}

async function sendMessage(data: any) {
  const url = `https://graph.facebook.com/${VERSION}/${PHONE_NUMBER_ID}/messages`;
  console.log(url);
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  console.log(`Response status: ${response.status}`);
  console.log(`Response status text: ${response.statusText}`);

  return response.json();
}

export const uploadMedia = async (filePath: string) => {
  const url = `https://graph.facebook.com/${VERSION}/${PHONE_NUMBER_ID}/media`;
  const form = new FormData();

  form.append('file', fs.createReadStream(filePath), {
    contentType: 'audio/ogg',
    filename: filePath,
  });
  form.append('messaging_product', 'whatsapp');

  const response = await axios.post(url, form, {
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      ...form.getHeaders(), // Include FormData headers
    },
  });

  if (response.status !== 200) {
    console.log(response.data);
    throw new Error(`Failed to upload media: ${response.statusText}`);
  }
  const file: FileUploadResponse = response.data as FileUploadResponse;
  return file.id;
};

export const processMessage = async (data: any) => {
  const messageData = parseIncomingWhatAppMessageData(data);

  if (messageData?.text) {
    console.log('MESSAGE: ', messageData.text);

    if (checkMessageCache(messageData.text)) {
      console.log('STILL WARM: ', messageData.text);
      return;
    }

    const responseText = await generateResponse(messageData.text);

    const audioFile = await generateAudio(
      responseText || 'Sorry, I did not understand that.'
    );

    const uploadedFileId = audioFile ? await uploadMedia(audioFile) : null;
    // const uploadedFileId = null; // Temporarily set to null for testing
    console.log('UPLOADED FILE ID: ', uploadedFileId);

    const message: MessageResponse = uploadedFileId
      ? {
          type: 'audio',
          audio: { id: uploadedFileId || '' },
        }
      : {
          type: 'text',
          text: {
            preview_url: false,
            body: responseText || 'Sorry, I did not understand that.',
          },
        };

    const outgoingMessageData = getOutgoingMessageData(message);
    const response = await sendMessage(outgoingMessageData);
  } else {
    console.log('Could not extract message');
  }
};
