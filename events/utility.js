const fs = require("fs");

module.exports = (client) => {

/* ========================= */
/* AFK DATABASE */
/* ========================= */

let afkData = {};

if (fs.existsSync("afk.json")) {

afkData = JSON.parse(
fs.readFileSync("afk.json")
);

}

/* ========================= */
/* SAVE */
/* ========================= */

function saveData() {

fs.writeFileSync(
"afk.json",
JSON.stringify(afkData, null, 2)
);

}

/* ========================= */
/* MESSAGE EVENT */
/* ========================= */

client.on("messageCreate", async message => {

if (!message.guild) return;
if (message.author.bot) return;

/* ========================= */
/* REMOVE AFK */
/* ========================= */

if (afkData[message.author.id]) {

delete afkData[message.author.id];

saveData();

message.channel.send(
`✅ ${message.author} AFK removed`
);

}

/* ========================= */
/* AFK MENTION */
/* ========================= */

const mentioned =
message.mentions.users.first();

if (
mentioned &&
afkData[mentioned.id]
) {

message.reply(
`🌙 ${mentioned.username} is AFK

📄 Reason:
${afkData[mentioned.id]}`
);

}

});

/* ========================= */
/* INTERACTIONS */
/* ========================= */

client.on("interactionCreate", async interaction => {

if (!interaction.isChatInputCommand()) return;

try {

/* ========================= */
/* AVATAR */
/* ========================= */

if (interaction.commandName === "avatar") {

const user =
interaction.options.getUser("user") ||
interaction.user;

return interaction.reply(
user.displayAvatarURL({
size: 4096
})
);

}

/* ========================= */
/* USER INFO */
/* ========================= */

if (interaction.commandName === "userinfo") {

const user =
interaction.options.getUser("user") ||
interaction.user;

const member =
interaction.guild.members.cache.get(
user.id
);

return interaction.reply(
`👤 User Info

📝 Username: ${user.tag}

🆔 ID: ${user.id}

📅 Joined Server:
${member.joinedAt.toDateString()}

🤖 Bot:
${user.bot ? "Yes" : "No"}`
);

}

/* ========================= */
/* SERVER INFO */
/* ========================= */

if (interaction.commandName === "serverinfo") {

const guild =
interaction.guild;

return interaction.reply(
`🌍 Server Info

🏷 Name: ${guild.name}

🆔 ID: ${guild.id}

👥 Members: ${guild.memberCount}

👑 Owner:
<@${guild.ownerId}>

📅 Created:
${guild.createdAt.toDateString()}`
);

}

/* ========================= */
/* AFK */
/* ========================= */

if (interaction.commandName === "afk") {

const reason =
interaction.options.getString("reason") ||
"No reason";

afkData[
interaction.user.id
] = reason;

saveData();

return interaction.reply(
`🌙 You are now AFK

📄 Reason:
${reason}`
);

}

/* ========================= */
/* POLL */
/* ========================= */

if (interaction.commandName === "poll") {

const question =
interaction.options.getString("question");

const msg =
await interaction.reply({
content:
`📊 POLL

❓ ${question}

👍 = Yes
👎 = No`,
fetchReply: true
});

await msg.react("👍");
await msg.react("👎");

}

/* ========================= */
/* SUGGEST */
/* ========================= */

if (interaction.commandName === "suggest") {

const suggestion =
interaction.options.getString(
"suggestion"
);

const msg =
await interaction.reply({
content:
`💡 Suggestion

👤 By: ${interaction.user}

📄 ${suggestion}`,
fetchReply: true
});

await msg.react("✅");
await msg.react("❌");

}

} catch (err) {

console.error(err);

if (!interaction.replied) {

interaction.reply({
content:
"❌ Utility System Error",
ephemeral: true
});

}

}

});

};
