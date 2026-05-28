const fs = require("fs");

module.exports = (client) => {

/* ========================= */
/* DATABASE */
/* ========================= */

let automodData = {};

if (fs.existsSync("automod.json")) {

automodData = JSON.parse(
fs.readFileSync("automod.json")
);

}

/* ========================= */
/* MESSAGE EVENT */
/* ========================= */

client.on("messageCreate", async message => {

if (!message.guild) return;
if (message.author.bot) return;

const guildId = message.guild.id;

if (
!automodData[guildId] ||
!automodData[guildId].enabled
) return;

/* LOG CHANNEL */

const logChannel =
message.guild.channels.cache.get(
automodData[guildId].logChannel
);

/* ========================= */
/* BAD WORD FILTER */
/* ========================= */

const badWords = [
"badword1",
"badword2",
"badword3"
];

if (
badWords.some(word =>
message.content.toLowerCase().includes(word)
)
) {

await message.delete().catch(() => {});

if (logChannel) {

logChannel.send(
`🚫 Deleted bad word message from ${message.author}`
);

}

return message.channel.send(
`🚫 ${message.author}, bad words are not allowed!`
);

}

/* ========================= */
/* ANTI LINK */
/* ========================= */

const linkRegex =
/https?:\/\/[^\s]+/gi;

if (linkRegex.test(message.content)) {

await message.delete().catch(() => {});

if (logChannel) {

logChannel.send(
`🔗 Deleted link from ${message.author}`
);

}

return message.channel.send(
`🔗 ${message.author}, links are not allowed!`
);

}

/* ========================= */
/* ANTI CAPS */
/* ========================= */

const caps =
message.content.replace(/[^A-Z]/g, "").length;

if (
caps > 20 &&
message.content.length > 25
) {

await message.delete().catch(() => {});

if (logChannel) {

logChannel.send(
`📢 Deleted caps message from ${message.author}`
);

}

return message.channel.send(
`📢 ${message.author}, avoid excessive caps!`
);

}

/* ========================= */
/* ANTI SPAM */
/* ========================= */

if (message.content.length > 500) {

await message.delete().catch(() => {});

if (logChannel) {

logChannel.send(
`⚠️ Deleted spam/long message from ${message.author}`
);

}

return message.channel.send(
`⚠️ ${message.author}, message too long!`
);

}

});

/* ========================= */
/* INTERACTION COMMANDS */
/* ========================= */

client.on("interactionCreate", async interaction => {

if (!interaction.isChatInputCommand()) return;

try {

/* ========================= */
/* SET AUTOMOD CHANNEL */
/* ========================= */

if (
interaction.commandName === "automodsetchannel"
) {

const channel =
interaction.options.getChannel("channel");

if (!automodData[interaction.guild.id]) {

automodData[interaction.guild.id] = {};

}

automodData[
interaction.guild.id
].logChannel = channel.id;

automodData[
interaction.guild.id
].enabled = true;

fs.writeFileSync(
"automod.json",
JSON.stringify(automodData, null, 2)
);

return interaction.reply(
`✅ AutoMod log channel set to ${channel}`
);

}

/* ========================= */
/* ENABLE AUTOMOD */
/* ========================= */

if (
interaction.commandName === "automodon"
) {

if (!automodData[interaction.guild.id]) {

automodData[interaction.guild.id] = {};

}

automodData[
interaction.guild.id
].enabled = true;

fs.writeFileSync(
"automod.json",
JSON.stringify(automodData, null, 2)
);

return interaction.reply(
"✅ AutoMod enabled"
);

}

/* ========================= */
/* DISABLE AUTOMOD */
/* ========================= */

if (
interaction.commandName === "automodoff"
) {

if (!automodData[interaction.guild.id]) {

automodData[interaction.guild.id] = {};

}

automodData[
interaction.guild.id
].enabled = false;

fs.writeFileSync(
"automod.json",
JSON.stringify(automodData, null, 2)
);

return interaction.reply(
"❌ AutoMod disabled"
);

}

} catch (err) {

console.error(err);

if (!interaction.replied) {

interaction.reply({
content: "❌ AutoMod Error",
ephemeral: true
});

}

}

});

};
