const fs = require("fs");

module.exports = (client) => {

/* ========================= */
/* DATABASE */
/* ========================= */

let automod = {};

if (fs.existsSync("automod.json")) {

automod = JSON.parse(
fs.readFileSync("automod.json")
);

}

/* ========================= */
/* BAD WORDS */
/* ========================= */

const badWords = [
"fuck",
"bitch",
"nigga",
"asshole",
"shit",
"mf"
];

/* ========================= */
/* SPAM CACHE */
/* ========================= */

const spamMap = new Map();

/* ========================= */
/* SAVE */
/* ========================= */

function saveData() {

fs.writeFileSync(
"automod.json",
JSON.stringify(automod, null, 2)
);

}

/* ========================= */
/* CREATE GUILD */
/* ========================= */

function createGuild(id) {

if (!automod[id]) {

automod[id] = {
enabled: false,
logChannel: null
};

}

}

/* ========================= */
/* MESSAGE EVENT */
/* ========================= */

client.on("messageCreate", async message => {

if (!message.guild) return;
if (message.author.bot) return;

createGuild(message.guild.id);

if (!automod[message.guild.id].enabled)
return;

const logChannelId =
automod[message.guild.id].logChannel;

const logChannel =
message.guild.channels.cache.get(
logChannelId
);

/* ========================= */
/* BAD WORD FILTER */
/* ========================= */

const content =
message.content.toLowerCase();

if (
badWords.some(word =>
content.includes(word)
)
) {

await message.delete();

message.channel.send(
`🚫 ${message.author}, bad words are not allowed!`
);

if (logChannel) {

logChannel.send(
`🚫 Bad Word Detected

👤 User: ${message.author.tag}

💬 Message:
${message.content}`
);

}

return;

}

/* ========================= */
/* ANTI SPAM */
/* ========================= */

if (!spamMap.has(message.author.id)) {

spamMap.set(message.author.id, []);

}

const userMessages =
spamMap.get(message.author.id);

userMessages.push(Date.now());

const filtered =
userMessages.filter(
time => Date.now() - time < 5000
);

spamMap.set(
message.author.id,
filtered
);

if (filtered.length >= 5) {

await message.delete();

message.channel.send(
`⚠️ ${message.author}, stop spamming!`
);

if (logChannel) {

logChannel.send(
`⚠️ Spam Detected

👤 User: ${message.author.tag}`
);

}

}

});

/* ========================= */
/* INTERACTIONS */
/* ========================= */

client.on("interactionCreate", async interaction => {

if (!interaction.isChatInputCommand()) return;

try {

/* ========================= */
/* SET LOG CHANNEL */
/* ========================= */

if (
interaction.commandName ===
"automodsetchannel"
) {

if (
!interaction.member.permissions.has(
"Administrator"
)
) {

return interaction.reply({
content:
"❌ You need Administrator permission",
ephemeral: true
});

}

const channel =
interaction.options.getChannel(
"channel"
);

createGuild(interaction.guild.id);

automod[
interaction.guild.id
].logChannel = channel.id;

saveData();

return interaction.reply(
`✅ AutoMod log channel set to ${channel}`
);

}

/* ========================= */
/* AUTOMOD ON */
/* ========================= */

if (
interaction.commandName ===
"automodon"
) {

if (
!interaction.member.permissions.has(
"Administrator"
)
) {

return interaction.reply({
content:
"❌ You need Administrator permission",
ephemeral: true
});

}

createGuild(interaction.guild.id);

automod[
interaction.guild.id
].enabled = true;

saveData();

return interaction.reply(
"✅ AutoMod Enabled"
);

}

/* ========================= */
/* AUTOMOD OFF */
/* ========================= */

if (
interaction.commandName ===
"automodoff"
) {

if (
!interaction.member.permissions.has(
"Administrator"
)
) {

return interaction.reply({
content:
"❌ You need Administrator permission",
ephemeral: true
});

}

createGuild(interaction.guild.id);

automod[
interaction.guild.id
].enabled = false;

saveData();

return interaction.reply(
"❌ AutoMod Disabled"
);

}

} catch (err) {

console.error(err);

if (!interaction.replied) {

interaction.reply({
content:
"❌ AutoMod Error",
ephemeral: true
});

}

}

});

};
