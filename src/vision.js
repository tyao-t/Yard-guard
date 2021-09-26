async function main(link) {
    // Imports the Google Cloud client library
    const vision = require('@google-cloud/vision');
    require('dotenv').config();
    const CREDENTIALS = JSON.parse(process.env.GOOGLE_CREDENTIALS);

    // Creates a client
    const client = new vision.ImageAnnotatorClient({
        credentials: CREDENTIALS
    });
  
    // Performs label detection on the image file
    //const [result] = await client.textDetection() Normal Text detection
    //const [result] = await client.documentTextDetection() Hand-writing text detection 
    const [result] = await client.labelDetection(link);
    //const [result] = await client.documentTextDetection(fileName);
    const labels = result.labelAnnotations;
    //console.log(labels)
    let retV = []
    labels.forEach(label => {
        //console.log(label.description)
        retV.push(label.description.toLowerCase())
    });

    const [result2] = await client.logoDetection(link);
    const logos = result2.logoAnnotations;
    logos.forEach(logo => retV.push(logo.description));

    const [result3] = await client.documentTextDetection(link);
    const text = result3.fullTextAnnotation.text;
    //console.log(typeof text)
    let csplit = text.split("\n")
    csplit.forEach(t => {
        retV.push(t);
    })
    //console.log(retV)
    return retV
}

exports.lD = main
main("https://cdn5.vectorstock.com/i/1000x1000/31/94/nazi-flag-vector-14743194.jpg")