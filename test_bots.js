import fs from 'fs';
import FormData from 'form-data';
import path from 'path';
import axios from 'axios';

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const RECIPIENT_WAID = process.env.RECIPIENT_WAID;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const VERSION = process.env.VERSION || 'v22.0';

function getOutgoingMessageData(message) {
  const baseResponseData = {
    messaging_product: 'whatsapp',
    to: RECIPIENT_WAID,
    recepient_type: 'individual',
  };
  return { ...baseResponseData, ...message };
}

async function sendMessage(data) {
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

export const uploadMedia = async (filePath) => {
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

  if (response) {
    console.log(response.data);
    throw new Error(`Failed to upload media: ${response.statusText}`);
  }

  const file = await response.json();
  return file.id;
};

const main = async () => {
  const audioFile = path.resolve('output.ogg'); // Path to the audio file to be uploaded
  console.log('AUDIO FILE PATH: ', audioFile);
  const uploadedFileId = audioFile ? await uploadMedia(audioFile) : null;
  // const uploadedFileId = null; // Temporarily set to null for testing
  console.log('UPLOADED FILE ID: ', uploadedFileId);
  const message = {
    type: 'audio',
    audio: {
      id: uploadedFileId, // Use the uploaded file ID
    },
  };
  const outgoingMessageData = getOutgoingMessageData(message);
  const response = await sendMessage(outgoingMessageData);
  console.log(response.json());
};

await main();
