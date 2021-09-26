require("dotenv").config()
const gt = require("./src/google_translate.js")
const gnl = require("./src/google_natural_language.js")
const gv = require("./src/vision.js")
const gs = require("./src/speech.js")
const gfs = require("./src/firestore.js")
//import {dL, tT} from "./google_translate.js"
//console.log(process.env.DISCORD_BOT_TOKEN)
//console.log(process.env.GOOGLE_CREDENTIALS)
const {Client, Intents} = require("discord.js")
const { mybusinessaccountmanagement } = require("googleapis/build/src/apis/mybusinessaccountmanagement")
const CREDENTIALS = JSON.parse(process.env.GOOGLE_CREDENTIALS) 
const calendarId = process.env.GOOGLE_CALENDAR_ID
//console.log(Intents.FLAGS)

const myIntents = new Intents();

for (let key in Intents.FLAGS){
    //console.log(key + ' ' + Intents.FLAGS[key])
    myIntents.add(Intents.FLAGS[key])
}

//console.log(Intents.FLAGS)
const client = new Client({ intents: myIntents, partials: ['MESSAGE', 'CHANNEL', 'REACTION'] 
});


client.login(process.env.DISCORD_BOT_TOKEN)

client.on("ready", () => {
    console.log("The bot is ready")
})

client.on("messageCreate", async function (message) { 

    let text_proh = await gfs.retrieve_proh("text_proh")
    let label_proh = await gfs.retrieve_proh("label_proh")
    if (message.content === "") {
        message.attachments.forEach(async (key, value) => {
            //console.log(key.url)
            let transcription = await gs.parseAudio("./wrath_of_man.mp3")
            //console.log(transcription)
            for (let i=0;i<text_proh.length;++i) {
                if (transcription.toLowerCase().indexOf(text_proh[i]) != -1) {
                    message.delete()
                    message.author.send(`Please mind what you upload! Do not upload any file that contains inappropriate speech (${text_proh[i]})!`)
                    let cnt = await gfs.vioa(message.author.username)
                    if (cnt >= 3) {
                        const rrole = message.guild.roles.cache.find(
                            (role) => role.name === "Authorized"
                        );
                        const user = message.guild.members.cache.find(
                            (member) => member.displayName === message.author.username
                        )
                        user.roles.remove(rrole)
                        user.send("You have been banned from sending messages in tyao's server due to your recent repeated inappropriate behaviour!")
                    }
                    return;
                }
            }
        })
        return;
    }
    //console.log(text_proh)
    //console.log(label_proh)
    if (message.author.username === "Yard Guard") return;
    let csplit = message.content.split(" ")

    const document = {
        content: message.content,
        type: "PLAIN_TEXT"
    }
        
    gnl.gclient.analyzeSentiment({document: document}).then((result) => {
        if (result[0].documentSentiment.score <= -0.67) {
                let mod_channel = message.guild.channels.cache.find(c => c.name.toLowerCase() 
                === "moderator-only" && c.type === "GUILD_TEXT")

                const name = message.author.username
                let str = message.author.tag + " sent a message with sentiment " + 
                        result[0].documentSentiment.score + ": " + message.content;
                mod_channel.send(str)
        }
    })

    if (csplit[0] == "-add") {
        await gfs.add_proh(csplit[1], csplit[2]);
        return;
    }
    
    for (let i=0;i<text_proh.length;++i) {
        if (message.content.toLowerCase().indexOf(text_proh[i]) != -1) {
            message.delete()
            message.author.send(`Please mind your language! Word like \'${text_proh[i]}\' is not accepted in tyao's server!`)
            let cnt = await gfs.vioa(message.author.username)
            if (cnt >= 3) {
                const rrole = message.guild.roles.cache.find(
                    (role) => role.name === "Authorized"
                );
                const user = message.guild.members.cache.find(
                    (member) => member.displayName === message.author.username
                )
                user.roles.remove(rrole)
                user.send("You have been banned from sending messages in tyao's server due to your recent repeated inappropriate behaviour!")
            }
            return;
        }
    }

    if (csplit[0] == '-reset') {
        gfs.clear_all()
        return;
    }

    if ((message.content.indexOf('jpg') != -1) || (message.content.indexOf('png') != -1)) {
        let res = await gv.lD(message.content)
        res.forEach(t => {
            if ((text_proh.indexOf(t.toLowerCase()) != -1) || (label_proh.indexOf(t.toLowerCase()) != -1)) {
                message.delete()
                message.author.send(`Please don't send any improper images that contains ${t.toLowerCase()} in tyao's server! The community forbids this!`)
            }
        })
        return;
    }

    let language = await gt.dL(message.content);
    
    if (language != "en") {
        gt.tT(message.content, 'en').then(res2 => {
            message.reply(res2);
        })
    }

})

