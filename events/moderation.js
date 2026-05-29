const fs = require("fs");

const {
PermissionsBitField
} = require("discord.js");

module.exports = (client) => {

/* ========================= */
/* WARN DATABASE */
/* ========================= */

let warns = {};

if (fs.existsSync("warns.json")) {

warns = JSON.parse(
fs.readFileSync("warns.json")
);

}

/* ========================= */
/* SAVE WARNS */
/* ========================= */

function saveWarns() {

fs.writeFileSync(
"warns.json",
JSON.stringify(warns, null, 2)
);

}

/* ========================= */
/* SNIPE */
/* ========================= */

const snipes = new Map();

client.on("messageDelete", async message => {

if (!message.guild) return;
if (!message.author) return;
if (message.author.bot) return;

snipes.set(message.channel.id, {
content: message.content,
author: message.author.tag
});

});

/* ========================= */
/* INTERACTIONS */
/* ========================= */

client.on("interactionCreate", async interaction => {

if (!interaction.isChatInputCommand()) return;

try {

/* ========================= */
/* BAN */
/* ========================= */

if (interaction.commandName === "ban") {

if (
!interaction.member.permissions.has(
PermissionsBitField.Flags.BanMembers
)
) {

return interaction.reply({
content: "❌ You don't have permission",
ephemeral: true
});

}

const user =
interaction.options.getUser("user");

const reason =
interaction.options.getString("reason") ||
"No reason";

const member =
interaction.guild.members.cache.get(user.id);

if (!member) {

return interaction.reply(
"❌ User not found"
);

}

await member.ban({
reason
});

return interaction.reply(
`🔨 Banned ${user.username}\n📄 Reason: ${reason}`
);

}

/* ========================= */
/* KICK */
/* ========================= */

if (interaction.commandName === "kick") {

if (
!interaction.member.permissions.has(
PermissionsBitField.Flags.KickMembers
)
) {

return interaction.reply({
content: "❌ You don't have permission",
ephemeral: true
});

}

const user =
interaction.options.getUser("user");

const reason =
interaction.options.getString("reason") ||
"No reason";

const member =
interaction.guild.members.cache.get(user.id);

if (!member) {

return interaction.reply(
"❌ User not found"
);

}

await member.kick(reason);

return interaction.reply(
`👢 Kicked ${user.username}\n📄 Reason: ${reason}`
);

}

/* ========================= */
/* TIMEOUT */
/* ========================= */

if (interaction.commandName === "timeout") {

if (
!interaction.member.permissions.has(
PermissionsBitField.Flags.ModerateMembers
)
) {

return interaction.reply({
content: "❌ You don't have permission",
ephemeral: true
});

}

const user =
interaction.options.getUser("user");

const minutes =
interaction.options.getInteger("minutes");

const reason =
interaction.options.getString("reason") ||
"No reason";

const member =
interaction.guild.members.cache.get(user.id);

if (!member) {

return interaction.reply(
"❌ User not found"
);

}

await member.timeout(
minutes * 60 * 1000,
reason
);

return interaction.reply(
`⏳ Timed out ${user.username} for ${minutes} minute(s)\n📄 Reason: ${reason}`
);

}

/* ========================= */
/* WARN */
/* ========================= */

if (interaction.commandName === "warn") {

if (
!interaction.member.permissions.has(
PermissionsBitField.Flags.ModerateMembers
)
) {

return interaction.reply({
content: "❌ You don't have permission",
ephemeral: true
});

}

const user =
interaction.options.getUser("user");

const reason =
interaction.options.getString("reason") ||
"No reason";

if (!warns[user.id]) {

warns[user.id] = [];

}

warns[user.id].push(reason);

saveWarns();

return interaction.reply(
`⚠️ Warned ${user.username}\n📄 Reason: ${reason}\n📚 Total Warns: ${warns[user.id].length}`
);

}

/* ========================= */
/* CLEAR */
/* ========================= */

if (interaction.commandName === "clear") {

if (
!interaction.member.permissions.has(
PermissionsBitField.Flags.ManageMessages
)
) {

return interaction.reply({
content: "❌ You don't have permission",
ephemeral: true
});

}

const amount =
interaction.options.getInteger("amount");

await interaction.channel.bulkDelete(
amount,
true
);

return interaction.reply({
content:
`🧹 Deleted ${amount} messages`,
ephemeral: true
});

}

/* ========================= */
/* SNIPE */
/* ========================= */

if (interaction.commandName === "snipe") {

const msg =
snipes.get(interaction.channel.id);

if (!msg) {

return interaction.reply(
"❌ Nothing to snipe"
);

}

return interaction.reply(
`🗑️ Last Deleted Message

👤 Author: ${msg.author}

💬 Message:
${msg.content}`
);

}

} catch (err) {

console.error(err);

if (!interaction.replied) {

interaction.reply({
content: "❌ Moderation Error",
ephemeral: true
});

}

}

});

};
