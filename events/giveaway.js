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
embeds: [
new EmbedBuilder()
.setColor("#ED4245")
.setTitle("❌ Invalid Duration")
.setDescription(
"Use formats like:\n`10s` `5m` `1h` `1d`"
)
],
ephemeral: true
});

}

const endTime =
Date.now() + ms;

const button =
new ButtonBuilder()
.setCustomId("giveaway_join")
.setLabel("🎉 Join (0)")
.setStyle(ButtonStyle.Success);

const row =
new ActionRowBuilder()
.addComponents(button);

const embed =
new EmbedBuilder()
.setColor("#5865F2")
.setTitle("🎉 BloxDen Giveaway")
.setThumbnail(
client.user.displayAvatarURL()
)
.setDescription(
`🏆 **Prize**
${prize}

👑 **Winner(s)**
${winners}

🎟️ **Entries**
0

⏰ **Ends**
<t:${Math.floor(endTime / 1000)}:R>

🎊 Click the button below to enter!`
)
.addFields(
{
name: "📢 Hosted By",
value: `${interaction.user}`,
inline: true
}
)
.setFooter({
text: "BloxDen Giveaway System"
})
.setTimestamp();

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

setTimeout(async () => {

const data =
client.giveaways.get(msg.id);

if (!data || data.ended)
return;

data.ended = true;

const disabledButton =
new ButtonBuilder()
.setCustomId("giveaway_ended")
.setLabel(
`🎉 Entries (${data.users.length})`
)
.setStyle(ButtonStyle.Secondary)
.setDisabled(true);

await msg.edit({
components: [
new ActionRowBuilder()
.addComponents(disabledButton)
]
});

if (
data.users.length === 0
) {

const noWinnerEmbed =
new EmbedBuilder()
.setColor("#ED4245")
.setTitle("❌ Giveaway Ended")
.setDescription(
`🏆 Prize

${prize}

No one joined the giveaway.`
)
.setTimestamp();

return interaction.channel.send({
embeds: [noWinnerEmbed]
});

}

const shuffled =
[...data.users].sort(
() => 0.5 - Math.random()
);

const selected =
shuffled.slice(
0,
Math.min(
data.winners,
data.users.length
)
);

const winnerEmbed =
new EmbedBuilder()
.setColor("#57F287")
.setTitle("🎉 Giveaway Ended")
.setDescription(
`🏆 **Prize**
${prize}

🎊 **Winner(s)**

${selected.map(
u => `<@${u}>`
).join("\n")}

👥 **Entries**
${data.users.length}`
)
.setFooter({
text: "Congratulations!"
})
.setTimestamp();

interaction.channel.send({
content:
selected.map(
u => `<@${u}>`
).join(" "),
embeds: [winnerEmbed]
});

}, ms);

  }

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

const endEmbed = new EmbedBuilder()
.setColor("#57F287")
.setTitle("🎉 Giveaway Ended")
.setDescription(
`🏆 Prize
**${prize}**

🎊 Winner(s)

${selected.map(
u => `<@${u}>`
).join(", ")}`
)
.setFooter({
text: "BloxDen Giveaway System"
})
.setTimestamp();

interaction.channel.send({
embeds: [endEmbed]
});

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
embeds: [
new EmbedBuilder()
.setColor("#ED4245")
.setTitle("❌ No Participants")
.setDescription(
"No one joined this giveaway."
)
],
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

const rerollEmbed =
new EmbedBuilder()
.setColor("#57F287")
.setTitle("🔄 Giveaway Rerolled")
.setDescription(
`🎉 New Winner

<@${winner}>

🏆 Prize
**${data.prize}**`
)
.setFooter({
text: `Message ID: ${messageId}`
})
.setTimestamp();

return interaction.reply({
embeds: [rerollEmbed]
});

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
return interaction.reply({
embeds: [
new EmbedBuilder()
.setColor("#ED4245")
.setTitle("❌ Giveaway Not Found")
.setDescription(
"No giveaway exists with that Message ID."
)
],
ephemeral: true
});

}

data.ended = true;

if (data.users.length === 0) {

return interaction.reply({
embeds: [
new EmbedBuilder()
.setColor("#ED4245")
.setTitle("❌ Giveaway Ended")
.setDescription(
"No one joined this giveaway."
)
]
});

}

const shuffled =
data.users.sort(
() => 0.5 - Math.random()
);

const selected =
shuffled.slice(0, data.winners);

const endEmbed =
new EmbedBuilder()
.setColor("#5865F2")
.setTitle("🎉 Giveaway Ended")
.setDescription(
`🏆 Prize

**${data.prize}**

🎊 Winner(s)

${selected.map(
u => `<@${u}>`
).join("\n")}

👥 Entries

**${data.users.length}**`
)
.setFooter({
text: "BloxDen Giveaway System"
})
.setTimestamp();

return interaction.reply({
embeds: [endEmbed]
});

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
embeds: [
new EmbedBuilder()
.setColor("#ED4245")
.setTitle("❌ Giveaway Not Found")
.setDescription(
"This giveaway no longer exists."
)
],
ephemeral: true
});

}

if (giveaway.ended) {

return interaction.reply({
embeds: [
new EmbedBuilder()
.setColor("#ED4245")
.setTitle("❌ Giveaway Ended")
.setDescription(
"This giveaway has already ended."
)
],
ephemeral: true
});

}

if (
giveaway.users.includes(
interaction.user.id
)
) {

return interaction.reply({
embeds: [
new EmbedBuilder()
.setColor("#FEE75C")
.setTitle("⚠️ Already Joined")
.setDescription(
"You have already entered this giveaway."
)
],
ephemeral: true
});

}

giveaway.users.push(
interaction.user.id
);

return interaction.reply({
embeds: [
new EmbedBuilder()
.setColor("#57F287")
.setTitle("🎉 Giveaway Joined")
.setDescription(
`Successfully entered the giveaway!

🏆 Prize
**${giveaway.prize}**

🎟️ Total Entries
**${giveaway.users.length}**`
)
.setFooter({
text: "Good luck!"
})
.setTimestamp()
],
ephemeral: true
});

}
