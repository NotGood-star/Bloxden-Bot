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
ButtonStyle
} = require("discord.js");

const app = express();

const client = new Client({
intents: [
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMessages,
GatewayIntentBits.GuildMembers
]
});

const giveaways = new Map();

let warnings = {};

if (fs.existsSync("warnings.json")) {
warnings = JSON.parse(fs.readFileSync("warnings.json"));
}

let economy = {};

if (fs.existsSync("economy.json")) {
economy = JSON.parse(fs.readFileSync("economy.json"));
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

try {

if (interaction.isChatInputCommand()) {

if (interaction.commandName === "help") {

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

📊 Info:
/serverinfo
`);

}

else if (interaction.commandName === "ping") {

await interaction.reply("🏓 Pong!");

}

else if (interaction.commandName === "joke") {

const jokes = [
"😂 Discord mods never sleep.",
"🤣 Roblox lag stronger than WIFI.",
"😂 Chicken escaped campers."
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

else if (interaction.commandName === "rps") {

const userChoice =
interaction.options.getString("choice");

const choices = ["rock", "paper", "scissors"];

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

else if (interaction.commandName === "giveaway") {

const prize =
interaction.options.getString("prize");

const duration =
interaction.options.getInteger("duration");

const winners =
interaction.options.getInteger("winners");

const endTime =
Date.now() + duration * 60 * 1000;

const embed = new EmbedBuilder()
.setTitle("🎉 GIVEAWAY 🎉")
.setDescription(`
Prize: **${prize}**

Winners: **${winners}**

Ends: <t:${Math.floor(endTime / 1000)}:R>

Click button below to join!
`)
.setFooter({
text: `Hosted by ${interaction.user.tag}`
});

const button =
new ButtonBuilder()
.setCustomId("join_giveaway")
.setLabel("🎉 Join Giveaway")
.setStyle(ButtonStyle.Primary);

const row =
new ActionRowBuilder().addComponents(button);

const message =
await interaction.reply({
embeds: [embed],
components: [row],
fetchReply: true
});

giveaways.set(message.id, {
prize,
winners,
entries: [],
ended: false
});

setTimeout(async () => {

const giveaway =
giveaways.get(message.id);

if (!giveaway || giveaway.ended) return;

giveaway.ended = true;

if (giveaway.entries.length === 0) {

return interaction.followUp(
`❌ No participants for ${prize}`
);

}

const shuffled =
giveaway.entries.sort(() => 0.5 - Math.random());

const winnersList =
shuffled.slice(0, winners);

interaction.followUp(
`🎉 Winners of ${prize}:\n${winnersList.join("\n")}`
);

}, duration * 60 * 1000);

}

else if (interaction.commandName === "reroll") {

const messageId =
interaction.options.getString("messageid");

const giveaway =
giveaways.get(messageId);

if (!giveaway) {
return interaction.reply("❌ Giveaway not found.");
}

if (giveaway.entries.length === 0) {
return interaction.reply("❌ No entries.");
}

const winner =
giveaway.entries[
Math.floor(Math.random() * giveaway.entries.length)
];

await interaction.reply(
`🎉 New winner: ${winner}`
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
new ActionRowBuilder()
.addComponents(button);

const embed =
new EmbedBuilder()
.setTitle("🎭 Reaction Roles")
.setDescription(
`Click button below to get/remove ${role}`
);

await interaction.reply({
embeds: [embed],
components: [row]
});

}

else if (interaction.commandName === "balance") {

const target =
interaction.options.getUser("user") ||
interaction.user;

if (!economy[target.id]) {

economy[target.id] = {
coins: 0,
lastDaily: 0
};

}

await interaction.reply(
`💰 ${target.username} has ${economy[target.id].coins} coins`
);

}

else if (interaction.commandName === "daily") {

if (!economy[interaction.user.id]) {

economy[interaction.user.id] = {
coins: 0,
lastDaily: 0
};

}

const now = Date.now();

const cooldown =
24 * 60 * 60 * 1000;

if (
now - economy[interaction.user.id].lastDaily
< cooldown
) {

return interaction.reply({
content: "⏳ Daily already claimed.",
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
"💰 You got 500 coins!"
);

}

else if (interaction.commandName === "pay") {

const target =
interaction.options.getUser("user");

const amount =
interaction.options.getInteger("amount");

if (amount <= 0) {

return interaction.reply({
content: "❌ Invalid amount.",
ephemeral: true
});

}

if (!economy[interaction.user.id]) {

economy[interaction.user.id] = {
coins: 0,
lastDaily: 0
};

}

if (!economy[target.id]) {

economy[target.id] = {
coins: 0,
lastDaily: 0
};

}

if (
economy[interaction.user.id].coins
< amount
) {

return interaction.reply({
content: "❌ Not enough coins.",
ephemeral: true
});

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

}

else if (interaction.isButton()) {

if (interaction.customId === "join_giveaway") {

const giveaway =
giveaways.get(interaction.message.id);

if (!giveaway) {

return interaction.reply({
content: "❌ Giveaway expired.",
ephemeral: true
});

}

if (giveaway.entries.includes(interaction.user.toString())) {

return interaction.reply({
content: "❌ Already joined.",
ephemeral: true
});

}

giveaway.entries.push(
interaction.user.toString()
);

await interaction.reply({
content: "🎉 Joined giveaway!",
ephemeral: true
});

}

else if (interaction.customId.startsWith("rr_")) {

const roleId =
interaction.customId.replace("rr_", "");

const role =
interaction.guild.roles.cache.get(roleId);

if (!role) {

return interaction.reply({
content: "❌ Role not found.",
ephemeral: true
});

}

const member = interaction.member;

if (member.roles.cache.has(role.id)) {

await member.roles.remove(role);

return interaction.reply({
content: `❌ Removed ${role.name}`,
ephemeral: true
});

}

await member.roles.add(role);

await interaction.reply({
content: `✅ Added ${role.name}`,
ephemeral: true
});

}

}

} catch (error) {

console.error(error);

if (!interaction.replied) {

interaction.reply({
content: "❌ Error occurred.",
ephemeral: true
});

}

}

});

client.login(process.env.TOKEN);
