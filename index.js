require("dotenv").config();

const express = require("express");

const {
Client,
GatewayIntentBits,
Partials
} = require("discord.js");

/* ========================= */
/* CLIENT */
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
/* EXPRESS SERVER */
/* ========================= */

const app = express();

app.get("/", (req, res) => {
res.send("✅ BloxDen Bot Online");
});

app.listen(3000, () => {
console.log("🌐 Web Server Running");
});

/* ========================= */
/* READY */
/* ========================= */

client.once("clientReady", () => {

console.log(
`🤖 Logged in as ${client.user.tag}`
);

});

/* ========================= */
/* LOAD EVENTS */
/* ========================= */

require("./events/economy")(client);

require("./events/leveling")(client);

require("./events/moderation")(client);

require("./events/ticket")(client);

require("./events/giveaway")(client);

require("./events/welcome")(client);

require("./events/automod")(client);

require("./events/reputation")(client);

require("./events/fun")(client);

require("./events/utility")(client);

/* ========================= */
/* ERROR HANDLER */
/* ========================= */

process.on("unhandledRejection", err => {

console.error(
"❌ Unhandled Rejection:",
err
);

});

process.on("uncaughtException", err => {

console.error(
"❌ Uncaught Exception:",
err
);

});

/* ========================= */
/* LOGIN */
/* ========================= */

client.login(process.env.TOKEN);
