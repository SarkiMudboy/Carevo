import wav from 'wav';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

const API_KEY = process.env.GEMINI_API_KEY;
const TEXT = process.env.TEXT;

async function saveAsOpusFile(wavFile: string) {
  try {
    // Convert to Ogg/Opus using FFmpeg
    await execPromise(`ffmpeg -i ${wavFile} -c:a libopus -b:a 64k output.ogg`);
  } catch (error) {
    console.log('Error during conversion:', error);
    return '';
  } finally {
    // Clean up
    await fs.promises.unlink(wavFile);
  }

  return 'output.ogg';
}

async function saveWaveFile(
  filename: string,
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
) {
  return new Promise((resolve, reject) => {
    const writer = new wav.FileWriter(filename, {
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    writer.on('finish', resolve);
    writer.on('error', reject);

    writer.write(pcmData);
    writer.end();
  });
}

export default async function generateAudio(text: string) {
  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent',
    {
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': API_KEY,
      },
      method: 'POST',
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Say this in the native hausa tone/accent ${text}`,
              },
            ],
          },
        ],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: 'Kore',
              },
            },
          },
        },
        model: 'gemini-2.5-flash-preview-tts',
      }),
    }
  );

  const responseData: any = await response.json();
  const generatedContent =
    responseData.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  console.log(JSON.stringify(responseData, null, 2));
  console.log(generatedContent);

  const audioBuffer = Buffer.from(generatedContent, 'base64');

  const fileName = 'out.wav';
  await saveWaveFile(fileName, audioBuffer);
  const oggFile = await saveAsOpusFile(fileName);
  return oggFile;
}
