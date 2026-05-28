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

/* LEVEL + MESSAGE SYSTEM */

client.on("messageCreate", async message => {

if (message.author.bot) return;

messages[message.author.id] ||= 0;
messages[message.author.id]++;

fs.writeFileSync(
"messages.json",
JSON.stringify(messages, null, 2)
);

levels[message.author.id] ||= {
xp: 0,
level: 1
};

levels[message.author.id].xp += 10;

if (levels[message.author.id].xp >= 100) {

levels[message.author.id].xp = 0;
levels[message.author.id].level++;

message.channel.send(
`🎉 ${message.author} leveled up to Level ${levels[message.author.id].level}`
);

}

fs.writeFileSync(
"levels.json",
JSON.stringify(levels, null, 2)
);

});

/* INTERACTIONS */

client.on("interactionCreate", async interaction => {

try {

if (interaction.isChatInputCommand()) {

/* PING */

if (interaction.commandName === "ping") {

await interaction.reply("🏓 Pong!");

}

/* HELP */

else if (interaction.commandName === "help") {

await interaction.reply(`
📜 BloxDen Commands

🎮 Fun:
/ping
/joke
/dice
/coinflip
/quote
/funfact

💰 Economy:
/balance
/daily
/pay
/shop
/buy

🏆 Levels:
/rank
/leaderboard

🎫 Tickets:
/ticket
/closeticket

📨 Invites:
/invite
/inviteleaderboard

💬 Messages:
/messages
/messageleaderboard

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
/reroll
/endgiveaway
`);

}

/* FUN FACT */

else if (interaction.commandName === "funfact") {

const facts = [
"🤖 This Bot is Made by Not_Good 💻",
"🔥 Never Give Up Until You Win 🏆",
"⚡ This Bot is made in 2 Days 🚀",
"😵 Making Bot is frustrating 😂",
"📚 To Make Bot You must know Coding 👨‍💻",
"👑 Our Helping Team Has 3 Members!\n\n👑 Owner — Not_Good\n⚡ Co-Owner — Vornycs\n🌟 Co-Owner — Zerphy"
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

/* PAY */

else if (interaction.commandName === "pay") {

const target =
interaction.options.getUser("user");

const amount =
interaction.options.getInteger("amount");

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
economy[interaction.user.id].coins
< amount
) {

return interaction.reply(
"❌ Not enough coins"
);

}

economy[interaction.user.id].coins -= amount;
economy[target.id].coins += amount;

fs.writeFileSync(
"economy.json",
JSON.stringify(economy, null, 2)
);

await interaction.reply(
`💸 Sent ${amount} coins to ${target.username}`
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

/* RANK */

else if (interaction.commandName === "rank") {

levels[interaction.user.id] ||= {
xp: 0,
level: 1
};

await interaction.reply(
`🏆 Level ${levels[interaction.user.id].level}\n⭐ XP ${levels[interaction.user.id].xp}`
);

}

/* LEADERBOARD */

else if (interaction.commandName === "leaderboard") {

const sorted =
Object.entries(levels)
.sort((a,b) => b[1].level - a[1].level)
.slice(0,10);

let text = "";

for (let i = 0; i < sorted.length; i++) {

const user =
await client.users.fetch(sorted[i][0]);

text += `${i+1}. ${user.username} — Level ${sorted[i][1].level}\n`;

}

await interaction.reply(
`🏆 Leaderboard\n\n${text || "No data"}`
);

}

/* TICKET */

else if (interaction.commandName === "ticket") {

const ticket =
await interaction.guild.channels.create({
name: `ticket-${interaction.user.username}`,
type: ChannelType.GuildText
});

await ticket.permissionOverwrites.create(
interaction.guild.roles.everyone,
{
ViewChannel: false
}
);

await ticket.permissionOverwrites.create(
interaction.user.id,
{
ViewChannel: true,
SendMessages: true
}
);

await ticket.send(
`🎫 Welcome ${interaction.user}`
);

await interaction.reply({
content: `✅ Ticket created: ${ticket}`,
ephemeral: true
});

}

/* CLOSE TICKET */

else if (interaction.commandName === "closeticket") {

await interaction.reply(
"🔒 Closing ticket..."
);

setTimeout(() => {
interaction.channel.delete();
}, 3000);

}

/* REACTION ROLE */

else if (interaction.commandName === "reactionrole") {

const role =
interaction.options.getRole("role");

const button =
new ButtonBuilder()
.setCustomId(`rr_${role.id}`)
.setLabel(`Get ${role.name}`)
.setStyle(ButtonStyle.Success);

const row =
new ActionRowBuilder()
.addComponents(button);

await interaction.reply({
content: "🎭 Click button for role",
components: [row]
});

}

/* MODERATION */

else if (interaction.commandName === "ban") {

const user =
interaction.options.getUser("user");

const member =
interaction.guild.members.cache.get(user.id);

await member.ban();

await interaction.reply(
`🔨 Banned ${user.username}`
);

}

else if (interaction.commandName === "kick") {

const user =
interaction.options.getUser("user");

const member =
interaction.guild.members.cache.get(user.id);

await member.kick();

await interaction.reply(
`👢 Kicked ${user.username}`
);

}

else if (interaction.commandName === "clear") {

const amount =
interaction.options.getInteger("amount");

await interaction.channel.bulkDelete(amount);

await interaction.reply({
content: `🧹 Deleted ${amount} messages`,
ephemeral: true
});

}

}

/* BUTTONS */

else if (interaction.isButton()) {

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
