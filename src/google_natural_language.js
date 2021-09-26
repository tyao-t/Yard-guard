const language = require('@google-cloud/language');
require('dotenv').config();

// Your credentials
const CREDENTIALS = JSON.parse(process.env.GOOGLE_CREDENTIALS);

const client = new language.LanguageServiceClient({
    credentials: CREDENTIALS
});

//console.log(client)

const text = "I am sexy."
const document = {
    content: text,
    type: "PLAIN_TEXT"
}

//client.analyzeSentiment({document: document}).then((result) => {
//    console.log(result)
//})

exports.gclient = client