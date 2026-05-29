const {
ActionRowBuilder,
ButtonBuilder,
ButtonStyle,
EmbedBuilder
} = require("discord.js");

module.exports = (client) => {

/* ========================= */
/* GIVEAWAY STORAGE */
/* ========================= */

client.giveaways = new Map();

/* ========================= */
/* TIME PARSER */
/* ========================= */

function parseTime(time) {

const match =
time.match(/^(\d+)(s|m|h|d)$/);

if (!match) return null;

const value = parseInt(match[1]);

const unit = match[2];

switch (unit) {

case "s":
return value * 1000;

case "m":
return value * 60 * 1000;

case "h":
return value * 60 * 60 * 1000;

case "d":
return value * 24 * 60 * 60 * 1000;

default:
return null;

}

}

/* ========================= */
/* FORMAT TIME */
/* ========================= */

function formatTime(ms) {

const seconds =
Math.floor(ms / 1000);

const minutes =
Math.floor(seconds / 60);

const hours =
Math.floor(minutes / 60);

const days =
Math.floor(hours / 24);

if (days > 0) return `${days}d`;
if (hours > 0) return `${hours}h`;
if (minutes > 0) return `${minutes}m`;

return `${seconds}s`;

}

/* ========================= */
/* INTERACTION EVENT */
/* ========================= */

client.on("interactionCreate", async interaction => {

try {

/* ========================= */
/* SLASH COMMANDS */
/* ========================= */

if (interaction.isChatInputCommand()) {

/* ========================= */
/* CREATE GIVEAWAY */
/* ========================= */

if (interaction.commandName === "giveaway") {

const prize =
interaction.options.getString("prize");

const duration =
interaction.options.getString("duration");

const winners =
interaction.options.getInteger("winners");

const ms =
parseTime(duration);

if (!ms) {

return interaction.reply({
content:
"❌ Invalid duration.\nUse: 10s, 5m, 2h, 1d",
ephemeral: true
});

}

const endTime =
Date.now() + ms;

const button =
new ButtonBuilder()
.setCustomId("giveaway_join")
.setLabel("🎉 Join Giveaway")
.setStyle(ButtonStyle.Primary);

const row =
new ActionRowBuilder()
.addComponents(button);

const embed =
new EmbedBuilder()
.setTitle("🎉 BloxDen Giveaway")
.setDescription(
`🏆 Prize: **${prize}**

👑 Winners: **${winners}**

⏰ Ends In: **${duration}**

🎊 Click the button below to join!`
)
.setFooter({
text:
`Hosted by ${interaction.user.username}`
});

const msg =
await interaction.reply({
embeds: [embed],
components: [row],
fetchReply: true
});

client.giveaways.set(msg.id, {
users: [],
prize,
winners,
ended: false,
messageId: msg.id,
channelId: interaction.channel.id
});

/* ========================= */
/* END GIVEAWAY */
/* ========================= */

setTimeout(async () => {

const data =
client.giveaways.get(msg.id);

if (!data) return;

if (data.ended) return;

data.ended = true;

if (data.users.length === 0) {

return interaction.channel.send(
"❌ No one joined the giveaway."
);

}

const shuffled =
data.users.sort(
() => 0.5 - Math.random()
);

const selected =
shuffled.slice(0, winners);

interaction.channel.send(
`🎉 Giveaway Ended!

🏆 Prize: **${prize}**

🎊 Winner(s):
${selected.map(
u => `<@${u}>`
).join(", ")}`
);

}, ms);

}

/* ========================= */
/* REROLL */
/* ========================= */

if (interaction.commandName === "reroll") {

const messageId =
interaction.options.getString(
"messageid"
);

const data =
client.giveaways.get(messageId);

if (!data) {

return interaction.reply({
content:
"❌ Giveaway not found",
ephemeral: true
});

}

if (data.users.length === 0) {

return interaction.reply({
content:
"❌ No users joined",
ephemeral: true
});

}

const winner =
data.users[
Math.floor(
Math.random() *
data.users.length
)
];

return interaction.reply(
`🎉 New Winner: <@${winner}>`
);

}

/* ========================= */
/* END GIVEAWAY COMMAND */
/* ========================= */

if (
interaction.commandName === "endgiveaway"
) {

const messageId =
interaction.options.getString(
"messageid"
);

const data =
client.giveaways.get(messageId);

if (!data) {

return interaction.reply({
content:
"❌ Giveaway not found",
ephemeral: true
});

}

data.ended = true;

if (data.users.length === 0) {

return interaction.reply(
"❌ No users joined"
);

}

const shuffled =
data.users.sort(
() => 0.5 - Math.random()
);

const selected =
shuffled.slice(0, data.winners);

return interaction.reply(
`🎉 Giveaway Ended!

🏆 Winner(s):
${selected.map(
u => `<@${u}>`
).join(", ")}`
);

}

}

/* ========================= */
/* BUTTONS */
/* ========================= */

if (interaction.isButton()) {

/* ========================= */
/* JOIN GIVEAWAY */
/* ========================= */

if (
interaction.customId ===
"giveaway_join"
) {

const giveaway =
client.giveaways.get(
interaction.message.id
);

if (!giveaway) {

return interaction.reply({
content:
"❌ Giveaway not found",
ephemeral: true
});

}

if (giveaway.ended) {

return interaction.reply({
content:
"❌ Giveaway already ended",
ephemeral: true
});

}

if (
giveaway.users.includes(
interaction.user.id
)
) {

return interaction.reply({
content:
"⚠️ You already joined this giveaway",
ephemeral: true
});

}

giveaway.users.push(
interaction.user.id
);

return interaction.reply({
content:
"🎉 You joined the giveaway!",
ephemeral: true
});

}

}

} catch (err) {

console.error(err);

if (!interaction.replied) {

interaction.reply({
content:
"❌ Giveaway System Error",
ephemeral: true
});

}

}

});

};
