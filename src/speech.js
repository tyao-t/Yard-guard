const speech = require("@google-cloud/speech");
require('dotenv').config();
const CREDENTIALS = JSON.parse(process.env.GOOGLE_CREDENTIALS);
const fs = require('fs')

async function main(uri) {
    const client = new speech.SpeechClient({
        credentials: CREDENTIALS  
    })
    const fileName = uri;
    const file = fs.readFileSync(fileName)
    const audioBytes = file.toString('base64')

    const config = {
        encoding: 'MP3',
        sampleRateHertz: 16000,
        languageCode: 'en-US'
    }

    const audio = {
        content: audioBytes
    }

    const request = {
        audio: audio, 
        config: config
    }

    const [response] = await client.recognize(request); 
    const transcription = response.results.map(result => 
        result.alternatives[0].transcript).join('\n');
    console.log(`Transcription ${transcription}`)
    return `Transcription ${transcription}`;
}

main("./wrath_of_man.mp3");
exports.parseAudio = main