require("dotenv").config();

const express = require("express");
const app = express();

const {
Client,
GatewayIntentBits
} = require("discord.js");

const client = new Client({
intents: [GatewayIntentBits.Guilds]
});

app.get("/", (req, res) => {
res.send("Bot Running");
});

app.listen(3000, () => {
console.log("Web server running on port 3000");
});

client.once("clientReady", () => {
console.log(`${client.user.tag} is Online!`);
});

client.on("interactionCreate", async interaction => {

if (!interaction.isChatInputCommand()) return;

try {

if (interaction.commandName === "help") {

await interaction.reply(`
📜 BloxDen Commands

/help
/ping
/joke
/dice
/coinflip
/quote
/rps
/guess
`);

}

else if (interaction.commandName === "ping") {

await interaction.reply("🏓 Pong!");

}

else if (interaction.commandName === "joke") {

const jokes = [
"😂 Discord mods never sleep.",
"🤣 Roblox lag is stronger than WIFI.",
"😂 Chicken crossed road to escape campers."
];

const joke = jokes[Math.floor(Math.random() * jokes.length)];

await interaction.reply(joke);

}

else if (interaction.commandName === "dice") {

const dice = Math.floor(Math.random() * 6) + 1;

await interaction.reply(`🎲 You rolled ${dice}`);

}

else if (interaction.commandName === "coinflip") {

const result = Math.random() < 0.5 ? "Heads" : "Tails";

await interaction.reply(`🪙 ${result}`);

}

else if (interaction.commandName === "quote") {

const quotes = [
"🔥 Never give up.",
"💪 Stay strong.",
"🚀 Dream big."
];

const quote = quotes[Math.floor(Math.random() * quotes.length)];

await interaction.reply(quote);

}

else if (interaction.commandName === "rps") {

const userChoice = interaction.options.getString("choice");

const choices = ["rock", "paper", "scissors"];

const botChoice =
choices[Math.floor(Math.random() * choices.length)];

await interaction.reply(
`You chose **${userChoice}**\nBot chose **${botChoice}**`
);

}

else if (interaction.commandName === "guess") {

const userNumber =
interaction.options.getInteger("number");

const random =
Math.floor(Math.random() * 10) + 1;

if (userNumber === random) {

await interaction.reply(
`🎉 Correct! Number was ${random}`
);

} else {

await interaction.reply(
`❌ Wrong! Number was ${random}`
);

}

}

} catch (error) {

console.error(error);

if (!interaction.replied) {

await interaction.reply({
content: "❌ Error running command.",
ephemeral: true
});

}

}

});

client.login(process.env.TOKEN);
