require("dotenv").config();

const fs = require("fs");
const express = require("express");

const {
Client,
GatewayIntentBits,
PermissionsBitField,
ChannelType,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle
} = require("discord.js");

const app = express();

const client = new Client({
intents: [
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMessages,
GatewayIntentBits.GuildMembers,
GatewayIntentBits.MessageContent
]
});

/* WEB SERVER */

app.get("/", (req, res) => {
res.send("Bot Running");
});

app.listen(3000, () => {
console.log("Web server running on port 3000");
});

/* DATABASES */

let economy = {};
let levels = {};
let invites = {};
let messages = {};
let levelChannel = null;

if (fs.existsSync("economy.json")) {
economy = JSON.parse(fs.readFileSync("economy.json"));
}

if (fs.existsSync("levels.json")) {
levels = JSON.parse(fs.readFileSync("levels.json"));
}

if (fs.existsSync("invites.json")) {
invites = JSON.parse(fs.readFileSync("invites.json"));
}

if (fs.existsSync("messages.json")) {
messages = JSON.parse(fs.readFileSync("messages.json"));
}

/* READY */

client.once("clientReady", () => {
console.log(`${client.user.tag} is Online!`);
});

/* MESSAGE SYSTEM */

client.on("messageCreate", async message => {

if (message.author.bot) return;

/* AUTO MOD */

const badWords = [
"badword1",
"badword2"
];

if (
badWords.some(word =>
message.content.toLowerCase().includes(word)
)
) {

await message.delete();

return message.channel.send(
`🚫 ${message.author}, bad words are not allowed!`
);

}

/* MESSAGE COUNT */

messages[message.author.id] ||= 0;
messages[message.author.id]++;

fs.writeFileSync(
"messages.json",
JSON.stringify(messages, null, 2)
);

/* LEVEL SYSTEM */

levels[message.author.id] ||= {
xp: 0,
level: 1
};

levels[message.author.id].xp += 10;

if (levels[message.author.id].xp >= 100) {

levels[message.author.id].xp = 0;
levels[message.author.id].level++;

const level =
levels[message.author.id].level;

if (levelChannel) {

const channel =
message.guild.channels.cache.get(levelChannel);

if (channel) {

channel.send(
`🎉 ${message.author} reached Level ${level} 🏆`
);

}

} else {

message.channel.send(
`🎉 ${message.author} reached Level ${level} 🏆`
);

}

/* LEVEL REWARDS */

if (level === 5) {

const role =
message.guild.roles.cache.find(
r => r.name === "Level 5"
);

if (role) {
await message.member.roles.add(role);
}

}

if (level === 10) {

const role =
message.guild.roles.cache.find(
r => r.name === "Level 10"
);

if (role) {
await message.member.roles.add(role);
}

}

}

fs.writeFileSync(
"levels.json",
JSON.stringify(levels, null, 2)
);

});

/* INTERACTIONS */

client.on("interactionCreate", async interaction => {

try {

/* CHAT COMMANDS */

if (interaction.isChatInputCommand()) {

/* HELP */

if (interaction.commandName === "help") {

await interaction.reply(`
📜 BloxDen Commands

🎮 Fun:
/ping
/help
/joke
/funfact
/dice
/coinflip
/quote

💰 Economy:
/balance
/daily
/pay
/shop
/buy
/work
/gamble
/rob

🏆 Levels:
/rank
/leaderboard
/setlevelchannel

🎫 Tickets:
/ticket
/ticketpanel
/closeticket

🎭 Roles:
/reactionrole

🛡️ Moderation:
/ban
/kick
/timeout
/clear
/warn

🎉 Giveaway:
/giveaway
`);

}

/* PING */

else if (interaction.commandName === "ping") {

await interaction.reply("🏓 Pong!");

}

/* FUN FACT */

else if (interaction.commandName === "funfact") {

const facts = [
"🤖 This Bot is Made by Not_Good 💻",
"🔥 Never Give Up Until You Win 🏆",
"⚡ This Bot is made in 2 Days 🚀",
"😵 Making Bot is frustrating 😂",
"📚 To Make Bot You must know Coding 👨‍💻"
];

await interaction.reply(
facts[Math.floor(Math.random() * facts.length)]
);

}

/* JOKE */

else if (interaction.commandName === "joke") {

const jokes = [
"😂 Discord mods never sleep.",
"🤣 Roblox lag again.",
"💸 Vornycs is richest person in Earth 🌍👑"
];

await interaction.reply(
jokes[Math.floor(Math.random() * jokes.length)]
);

}

/* DICE */

else if (interaction.commandName === "dice") {

await interaction.reply(
`🎲 You rolled ${Math.floor(Math.random() * 6) + 1}`
);

}

/* COINFLIP */

else if (interaction.commandName === "coinflip") {

await interaction.reply(
`🪙 ${Math.random() < 0.5 ? "Heads" : "Tails"}`
);

}

/* QUOTE */

else if (interaction.commandName === "quote") {

const quotes = [
"🔥 Never give up.",
"🚀 Dream big.",
"💪 Stay strong."
];

await interaction.reply(
quotes[Math.floor(Math.random() * quotes.length)]
);

}

/* BALANCE */

else if (interaction.commandName === "balance") {

const user =
interaction.options.getUser("user") ||
interaction.user;

economy[user.id] ||= {
coins: 0,
lastDaily: 0,
inventory: []
};

await interaction.reply(
`💰 ${user.username} has ${economy[user.id].coins} coins 🪙`
);

}

/* DAILY */

else if (interaction.commandName === "daily") {

economy[interaction.user.id] ||= {
coins: 0,
lastDaily: 0,
inventory: []
};

const now = Date.now();

const cooldown = 24 * 60 * 60 * 1000;

if (
now - economy[interaction.user.id].lastDaily
< cooldown
) {

return interaction.reply({
content: "⏰ You already claimed daily today!",
ephemeral: true
});

}

economy[interaction.user.id].coins += 500;

economy[interaction.user.id].lastDaily = now;

fs.writeFileSync(
"economy.json",
JSON.stringify(economy, null, 2)
);

await interaction.reply(
"💰 You claimed 500 coins!"
);

}

/* SHOP */

else if (interaction.commandName === "shop") {

await interaction.reply(`
🛒 BloxDen Shop

🟤 Merchant Role — 10,000 Coins 🪙
👑 King Role — 25,000 Coins 🪙
💎 VIP Role — 50,000 Coins 🪙
🚀 Booster Role — 75,000 Coins 🪙
🔥 Legend Role — 100,000 Coins 🪙
`);

}

/* BUY */

else if (interaction.commandName === "buy") {

const item =
interaction.options.getString("item");

economy[interaction.user.id] ||= {
coins: 0,
lastDaily: 0,
inventory: []
};

const prices = {
merchant: 10000,
king: 25000,
vip: 50000,
booster: 75000,
legend: 100000
};

if (!prices[item]) {

return interaction.reply(
"❌ Item not found"
);

}

if (
economy[interaction.user.id].coins
< prices[item]
) {

return interaction.reply(
"💸 You don't have enough coins!"
);

}

economy[interaction.user.id].coins -= prices[item];

economy[interaction.user.id].inventory.push(item);

fs.writeFileSync(
"economy.json",
JSON.stringify(economy, null, 2)
);

await interaction.reply(
`✅ You bought ${item} for ${prices[item]} coins 🪙`
);

}

/* WORK */

else if (interaction.commandName === "work") {

economy[interaction.user.id] ||= {
coins: 0,
lastDaily: 0,
inventory: []
};

const amount =
Math.floor(Math.random() * 500) + 100;

economy[interaction.user.id].coins += amount;

fs.writeFileSync(
"economy.json",
JSON.stringify(economy, null, 2)
);

await interaction.reply(
`💼 You worked and earned ${amount} coins 🪙`
);

}

/* GAMBLE */

else if (interaction.commandName === "gamble") {

const amount =
interaction.options.getInteger("amount");

economy[interaction.user.id] ||= {
coins: 0,
lastDaily: 0,
inventory: []
};

if (
economy[interaction.user.id].coins
< amount
) {

return interaction.reply(
"💸 Not enough coins"
);

}

const win =
Math.random() < 0.5;

if (win) {

economy[interaction.user.id].coins += amount;

await interaction.reply(
`🎰 You WON ${amount} coins 🪙`
);

} else {

economy[interaction.user.id].coins -= amount;

await interaction.reply(
`💀 You LOST ${amount} coins 🪙`
);

}

fs.writeFileSync(
"economy.json",
JSON.stringify(economy, null, 2)
);

}

/* ROB */

else if (interaction.commandName === "rob") {

const target =
interaction.options.getUser("user");

economy[interaction.user.id] ||= {
coins: 0,
lastDaily: 0,
inventory: []
};

economy[target.id] ||= {
coins: 0,
lastDaily: 0,
inventory: []
};

if (
economy[target.id].coins < 500
) {

return interaction.reply(
"💸 User too poor to rob"
);

}

const success =
Math.random() < 0.5;

if (success) {

const amount =
Math.floor(Math.random() * 1000) + 100;

economy[target.id].coins -= amount;
economy[interaction.user.id].coins += amount;

await interaction.reply(
`🦹 You robbed ${target.username} and stole ${amount} coins 🪙`
);

} else {

await interaction.reply(
`🚔 You got caught trying to rob ${target.username}`
);

}

fs.writeFileSync(
"economy.json",
JSON.stringify(economy, null, 2)
);

}

/* LEVEL CHANNEL */

else if (interaction.commandName === "setlevelchannel") {

const channel =
interaction.options.getChannel("channel");

levelChannel = channel.id;

await interaction.reply(
`✅ Level channel set to ${channel}`
);

}

}

/* BUTTONS */

else if (interaction.isButton()) {

/* REACTION ROLE */

if (interaction.customId.startsWith("rr_")) {

const roleId =
interaction.customId.replace("rr_", "");

const role =
interaction.guild.roles.cache.get(roleId);

if (
interaction.member.roles.cache.has(role.id)
) {

await interaction.member.roles.remove(role);

await interaction.reply({
content: `❌ Removed ${role.name}`,
ephemeral: true
});

} else {

await interaction.member.roles.add(role);

await interaction.reply({
content: `✅ Added ${role.name}`,
ephemeral: true
});

}

}

}

} catch (err) {

console.error(err);

if (!interaction.replied) {

await interaction.reply({
content: "❌ Error occurred",
ephemeral: true
});

}

}

});

/* EVENTS */

require("./events/welcome")(client);
require("./events/giveaway")(client);

/* LOGIN */

client.login(process.env.TOKEN);
