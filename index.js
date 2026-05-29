require("dotenv").config();

const express = require("express");

const {
Client,
GatewayIntentBits,
Partials
} = require("discord.js");

/* ========================= */
/* EXPRESS SERVER */
/* ========================= */

const app = express();

app.get("/", (req, res) => {
res.send("✅ BloxDen Bot is Running");
});

app.listen(3000, () => {
console.log("🌐 Web server running on port 3000");
});

/* ========================= */
/* DISCORD CLIENT */
/* ========================= */

const client = new Client({

intents: [

GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMessages,
GatewayIntentBits.GuildMembers,
GatewayIntentBits.MessageContent,
GatewayIntentBits.GuildMessageReactions

],

partials: [

Partials.Message,
Partials.Channel,
Partials.Reaction

]

});

/* ========================= */
/* BOT READY */
/* ========================= */

client.once("clientReady", () => {

console.log(
`🤖 Logged in as ${client.user.tag}`
);

});

/* ========================= */
/* LOAD EVENT FILES */
/* ========================= */

require("./events/economy")(client);

require("./events/leveling")(client);

require("./events/moderation")(client);

require("./events/ticket")(client);

require("./events/giveaway")(client);

require("./events/welcome")(client);

require("./events/automod")(client);

require("./events/fun")(client);

require("./events/utility")(client);

/* ========================= */
/* ERROR HANDLER */
/* ========================= */

process.on("unhandledRejection", err => {

console.log("❌ Unhandled Rejection");
console.error(err);

});

process.on("uncaughtException", err => {

console.log("❌ Uncaught Exception");
console.error(err);

});

/* ========================= */
/* LOGIN */
/* ========================= */

client.login(process.env.TOKEN);
