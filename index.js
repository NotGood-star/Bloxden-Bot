require("dotenv").config();

const express = require("express");
const fs = require("fs");

const {
Client,
GatewayIntentBits,
PermissionsBitField,
EmbedBuilder,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle,
ChannelType
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

let economy = {};
let levels = {};
let invites = {};
let messages = {};
let warnings = {};
let settings = {};

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

if (fs.existsSync("warnings.json")) {
warnings = JSON.parse(fs.readFileSync("warnings.json"));
}

if (fs.existsSync("settings.json")) {
settings = JSON.parse(fs.readFileSync("settings.json"));
}

const giveaways = new Map();

app.get("/", (req, res) => {
res.send("Bot Running");
});

app.listen(3000, () => {
console.log("Web server running on port 3000");
});

client.once("clientReady", () => {
console.log(`${client.user.tag} is Online!`);
});

client.on("messageCreate", async message => {

if (message.author.bot) return;

if (!messages[message.author.id]) {
messages[message.author.id] = 0;
}

messages[message.author.id]++;

fs.writeFileSync(
"messages.json",
JSON.stringify(messages, null, 2)
);

if (!levels[message.author.id]) {
levels[message.author.id] = {
xp: 0,
level: 1
};
}

levels[message.author.id].xp += 10;

const neededXP =
levels[message.author.id].level * 100;

if (levels[message.author.id].xp >= neededXP) {

levels[message.author.id].xp = 0;
levels[message.author.id].level++;

if (settings.levelChannel) {

const channel =
message.guild.channels.cache.get(
settings.levelChannel
);

if (channel) {
channel.send(
`🎉 ${message.author} leveled up to Level ${levels[message.author.id].level}`
);
}

}

}

fs.writeFileSync(
"levels.json",
JSON.stringify(levels, null, 2)
);

});

client.on("guildMemberAdd", member => {

const inviter =
member.guild.members.cache.random();

if (!invites[inviter.id]) {
invites[inviter.id] = 0;
}

invites[inviter.id]++;

fs.writeFileSync(
"invites.json",
JSON.stringify(invites, null, 2)
);

});

client.on("interactionCreate", async interaction => {

try {

if (interaction.isChatInputCommand()) {

if (interaction.commandName === "ping") {

await interaction.reply("🏓 Pong!");

}

else if (interaction.commandName === "help") {

await interaction.reply(`
📜 BloxDen Commands

🎮 Fun:
/ping
/joke
/dice
/coinflip
/quote
/rps
/guess

🛡️ Moderation:
/ban
/kick
/timeout
/warn

🎁 Giveaway:
/giveaway
/reroll

🎭 Roles:
/reactionrole

💰 Economy:
/balance
/daily
/pay

🏆 Levels:
/rank
/leaderboard
/addxp
/removexp
/setlevelchannel

🎫 Tickets:
/ticket
/closeticket
/setticketchannel

📨 Invites:
/invite
/resetinvites
/inviteleaderboard

💬 Messages:
/messages
/messageleaderboard

🖼️ Utility:
/avatar
/serverinfo
`);

}

else if (interaction.commandName === "joke") {

const jokes = [
"😂 Discord mods never sleep.",
"🤣 Roblox lag again.",
"😂 Chicken crossed the road."
];

await interaction.reply(
jokes[Math.floor(Math.random() * jokes.length)]
);

}

else if (interaction.commandName === "dice") {

await interaction.reply(
`🎲 You rolled ${Math.floor(Math.random() * 6) + 1}`
);

}

else if (interaction.commandName === "coinflip") {

await interaction.reply(
`🪙 ${Math.random() < 0.5 ? "Heads" : "Tails"}`
);

}

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

else if (interaction.commandName === "serverinfo") {

await interaction.reply(`
🏠 Server: ${interaction.guild.name}
👥 Members: ${interaction.guild.memberCount}
`);

}

else if (interaction.commandName === "avatar") {

const user =
interaction.options.getUser("user") ||
interaction.user;

await interaction.reply(
user.displayAvatarURL({ dynamic: true, size: 1024 })
);

}

else if (interaction.commandName === "rps") {

const userChoice =
interaction.options.getString("choice");

const choices =
["rock", "paper", "scissors"];

const botChoice =
choices[Math.floor(Math.random() * choices.length)];

await interaction.reply(
`You chose ${userChoice}\nBot chose ${botChoice}`
);

}

else if (interaction.commandName === "guess") {

const number =
interaction.options.getInteger("number");

const random =
Math.floor(Math.random() * 10) + 1;

if (number === random) {

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

const user =
interaction.options.getUser("user");

const member =
interaction.guild.members.cache.get(user.id);

await member.ban();

await interaction.reply(
`🔨 ${user.tag} banned`
);

}

else if (interaction.commandName === "kick") {

const user =
interaction.options.getUser("user");

const member =
interaction.guild.members.cache.get(user.id);

await member.kick();

await interaction.reply(
`👢 ${user.tag} kicked`
);

}

else if (interaction.commandName === "timeout") {

const user =
interaction.options.getUser("user");

const minutes =
interaction.options.getInteger("minutes");

const member =
interaction.guild.members.cache.get(user.id);

await member.timeout(minutes * 60 * 1000);

await interaction.reply(
`⏳ ${user.tag} timed out`
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
`⚠️ Warned ${user.tag}`
);

}

else if (interaction.commandName === "reactionrole") {

const role =
interaction.options.getRole("role");

const button =
new ButtonBuilder()
.setCustomId(`rr_${role.id}`)
.setLabel(`Get ${role.name}`)
.setStyle(ButtonStyle.Success);

const row =
new ActionRowBuilder().addComponents(button);

await interaction.reply({
content: "🎭 Click button for role",
components: [row]
});

}

else if (interaction.commandName === "balance") {

const user =
interaction.options.getUser("user") ||
interaction.user;

if (!economy[user.id]) {
economy[user.id] = {
coins: 0
};
}

await interaction.reply(
`💰 ${user.username} has ${economy[user.id].coins} coins`
);

}

else if (interaction.commandName === "daily") {

if (!economy[interaction.user.id]) {
economy[interaction.user.id] = {
coins: 0
};
}

economy[interaction.user.id].coins += 500;

fs.writeFileSync(
"economy.json",
JSON.stringify(economy, null, 2)
);

await interaction.reply(
"💰 You got 500 coins"
);

}

else if (interaction.commandName === "pay") {

const user =
interaction.options.getUser("user");

const amount =
interaction.options.getInteger("amount");

if (!economy[interaction.user.id]) {
economy[interaction.user.id] = {
coins: 0
};
}

if (!economy[user.id]) {
economy[user.id] = {
coins: 0
};
}

economy[interaction.user.id].coins -= amount;
economy[user.id].coins += amount;

fs.writeFileSync(
"economy.json",
JSON.stringify(economy, null, 2)
);

await interaction.reply(
`💸 Paid ${amount} coins`
);

}

else if (interaction.commandName === "rank") {

if (!levels[interaction.user.id]) {
levels[interaction.user.id] = {
xp: 0,
level: 1
};
}

await interaction.reply(
`🏆 Level ${levels[interaction.user.id].level}\n⭐ XP ${levels[interaction.user.id].xp}`
);

}

else if (interaction.commandName === "leaderboard") {

const sorted =
Object.entries(levels)
.sort((a, b) => b[1].level - a[1].level)
.slice(0, 10);

let text = "";

for (let i = 0; i < sorted.length; i++) {

const user =
await client.users.fetch(sorted[i][0]);

text += `${i + 1}. ${user.username} — Level ${sorted[i][1].level}\n`;

}

await interaction.reply(
`🏆 Leaderboard\n\n${text || "No data"}`
);

}

}
else if (interaction.commandName === "addxp") {

const user =
interaction.options.getUser("user");

const amount =
interaction.options.getInteger("amount");

if (!levels[user.id]) {
levels[user.id] = {
xp: 0,
level: 1
};
}

levels[user.id].xp += amount;

fs.writeFileSync(
"levels.json",
JSON.stringify(levels, null, 2)
);

await interaction.reply(`✅ Added ${amount} XP`);

}

else if (interaction.commandName === "removexp") {

const user =
interaction.options.getUser("user");

const amount =
interaction.options.getInteger("amount");

if (!levels[user.id]) {
levels[user.id] = {
xp: 0,
level: 1
};
}

levels[user.id].xp -= amount;

if (levels[user.id].xp < 0)
levels[user.id].xp = 0;

fs.writeFileSync(
"levels.json",
JSON.stringify(levels, null, 2)
);

await interaction.reply(`❌ Removed ${amount} XP`);

}

else if (interaction.commandName === "setlevelchannel") {

const channel =
interaction.options.getChannel("channel");

settings.levelChannel = channel.id;

fs.writeFileSync(
"settings.json",
JSON.stringify(settings, null, 2)
);

await interaction.reply(
`✅ Level channel set to ${channel}`
);

}

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

else if (interaction.commandName === "closeticket") {

await interaction.reply("🔒 Closing ticket...");

setTimeout(() => {
interaction.channel.delete();
}, 3000);

}

else if (interaction.commandName === "setticketchannel") {

const channel =
interaction.options.getChannel("channel");

settings.ticketCategory = channel.id;

fs.writeFileSync(
"settings.json",
JSON.stringify(settings, null, 2)
);

await interaction.reply(
`✅ Ticket category set`
);

}

else if (interaction.commandName === "invite") {

const user =
interaction.options.getUser("user") ||
interaction.user;

if (!invites[user.id]) {
invites[user.id] = 0;
}

await interaction.reply(
`📨 ${user.username} has ${invites[user.id]} invites`
);

}

else if (interaction.commandName === "resetinvites") {

const user =
interaction.options.getUser("user");

invites[user.id] = 0;

fs.writeFileSync(
"invites.json",
JSON.stringify(invites, null, 2)
);

await interaction.reply(
`♻️ Reset invites for ${user.username}`
);

}

else if (interaction.commandName === "inviteleaderboard") {

const sorted =
Object.entries(invites)
.sort((a,b) => b[1] - a[1])
.slice(0,10);

let text = "";

for (let i = 0; i < sorted.length; i++) {

const user =
await client.users.fetch(sorted[i][0]);

text += `${i+1}. ${user.username} — ${sorted[i][1]} invites\n`;

}

await interaction.reply(
`🏆 Invite Leaderboard\n\n${text || "No data"}`
);

}

else if (interaction.commandName === "messages") {

const user =
interaction.options.getUser("user") ||
interaction.user;

if (!messages[user.id]) {
messages[user.id] = 0;
}

await interaction.reply(
`💬 ${user.username} has ${messages[user.id]} messages`
);

}

else if (interaction.commandName === "messageleaderboard") {

const sorted =
Object.entries(messages)
.sort((a,b) => b[1] - a[1])
.slice(0,10);

let text = "";

for (let i = 0; i < sorted.length; i++) {

const user =
await client.users.fetch(sorted[i][0]);

text += `${i+1}. ${user.username} — ${sorted[i][1]} messages\n`;

}

await interaction.reply(
`🏆 Message Leaderboard\n\n${text || "No data"}`
);

}
else if (interaction.isButton()) {

if (interaction.customId.startsWith("rr_")) {

const roleId =
interaction.customId.replace("rr_", "");

const role =
interaction.guild.roles.cache.get(roleId);

if (interaction.member.roles.cache.has(role.id)) {

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

interaction.reply({
content: "❌ Error",
ephemeral: true
});

}

}

});

client.login(process.env.TOKEN);
