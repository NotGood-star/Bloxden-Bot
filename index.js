require("dotenv").config();

const express = require("express");
const app = express();

const fs = require("fs");

const {
Client,
GatewayIntentBits,
PermissionsBitField
} = require("discord.js");

const client = new Client({
intents: [
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMembers
]
});

let warnings = {};

if (fs.existsSync("warnings.json")) {
warnings = JSON.parse(fs.readFileSync("warnings.json"));
}

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
/serverinfo
/ban
/kick
/timeout
/warn
`);

}

else if (interaction.commandName === "ping") {

await interaction.reply("🏓 Pong!");

}

else if (interaction.commandName === "joke") {

const jokes = [
"😂 Discord mods never sleep.",
"🤣 Roblox lag stronger than WIFI.",
"😂 Chicken escaped Roblox campers."
];

const joke =
jokes[Math.floor(Math.random() * jokes.length)];

await interaction.reply(joke);

}

else if (interaction.commandName === "dice") {

const dice =
Math.floor(Math.random() * 6) + 1;

await interaction.reply(`🎲 You rolled ${dice}`);

}

else if (interaction.commandName === "coinflip") {

const result =
Math.random() < 0.5 ? "Heads" : "Tails";

await interaction.reply(`🪙 ${result}`);

}

else if (interaction.commandName === "quote") {

const quotes = [
"🔥 Never give up.",
"🚀 Dream big.",
"💪 Stay strong."
];

const quote =
quotes[Math.floor(Math.random() * quotes.length)];

await interaction.reply(quote);

}

else if (interaction.commandName === "serverinfo") {

await interaction.reply(`
🏠 Server Name: ${interaction.guild.name}
👥 Members: ${interaction.guild.memberCount}
`);

}

else if (interaction.commandName === "rps") {

const userChoice =
interaction.options.getString("choice");

const choices = [
"rock",
"paper",
"scissors"
];

const botChoice =
choices[Math.floor(Math.random() * choices.length)];

await interaction.reply(
`You chose ${userChoice}\nBot chose ${botChoice}`
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

else if (interaction.commandName === "ban") {

if (!interaction.member.permissions.has(
PermissionsBitField.Flags.BanMembers
)) {
return interaction.reply("❌ No permission.");
}

const user =
interaction.options.getUser("user");

const reason =
interaction.options.getString("reason") || "No reason";

const member =
interaction.guild.members.cache.get(user.id);

if (!member) {
return interaction.reply("❌ User not found.");
}

await member.ban({ reason });

await interaction.reply(
`🔨 ${user.tag} banned.\nReason: ${reason}`
);

}

else if (interaction.commandName === "kick") {

if (!interaction.member.permissions.has(
PermissionsBitField.Flags.KickMembers
)) {
return interaction.reply("❌ No permission.");
}

const user =
interaction.options.getUser("user");

const reason =
interaction.options.getString("reason") || "No reason";

const member =
interaction.guild.members.cache.get(user.id);

if (!member) {
return interaction.reply("❌ User not found.");
}

await member.kick(reason);

await interaction.reply(
`👢 ${user.tag} kicked.\nReason: ${reason}`
);

}

else if (interaction.commandName === "timeout") {

if (!interaction.member.permissions.has(
PermissionsBitField.Flags.ModerateMembers
)) {
return interaction.reply("❌ No permission.");
}

const user =
interaction.options.getUser("user");

const minutes =
interaction.options.getInteger("minutes");

const member =
interaction.guild.members.cache.get(user.id);

if (!member) {
return interaction.reply("❌ User not found.");
}

await member.timeout(minutes * 60 * 1000);

await interaction.reply(
`⏳ ${user.tag} timed out for ${minutes} minutes`
);

}

else if (interaction.commandName === "warn") {

const user =
interaction.options.getUser("user");

const reason =
interaction.options.getString("reason") || "No reason";

if (!warnings[user.id]) {
warnings[user.id] = [];
}

warnings[user.id].push(reason);

fs.writeFileSync(
"warnings.json",
JSON.stringify(warnings, null, 2)
);

await interaction.reply(
`⚠️ ${user.tag} warned.\nReason: ${reason}`
);

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
