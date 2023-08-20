// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs');
const util = require('util');

type Data = {
  name: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const TTS = async () => {
    await authenticateImplicitWithAdc().then(async () => {
      const client = new textToSpeech.TextToSpeechClient();

      const text = 'When You Go, And What have you turn to say, i dont love you, like i did yesterday?';

      const request = {
        input: { text: text },
        voice: { languageCode: 'en-GB', name: 'en-GB-Wavenet-A' },
        audioConfig: {
          "audioEncoding": "MP3",
          "effectsProfileId": [
            "headphone-class-device"
          ],
          "pitch": 1.20,
          "speakingRate": 0.75
        },
      };
      const [response] = await client.synthesizeSpeech(request);
      const writeFile = util.promisify(fs.writeFile);
      await writeFile('public/audio/outputFile.mp3', response.audioContent, 'binary');
      console.log(`Audio content written to file: ${'public/audio/outputFile'}`);
      res.status(200).json(response)
    });
  }
  await TTS().then(() => {
    // res.status(200).json({ name: 'John Doe' })
  });
}

const projectId = 'effortless-gate-392302';

const { Storage } = require('@google-cloud/storage');

async function authenticateImplicitWithAdc() {
  // This snippet demonstrates how to list buckets.
  // NOTE: Replace the client created below with the client required for your application.
  // Note that the credentials are not specified when constructing the client.
  // The client library finds your credentials using ADC.
  const storage = new Storage({
    projectId,
  });
  const [buckets] = await storage.getBuckets();
  console.log('Buckets:');

  for (const bucket of buckets) {
    console.log(`- ${bucket.name}`);
  }

  console.log('Listed all storage buckets.');
}

authenticateImplicitWithAdc();


