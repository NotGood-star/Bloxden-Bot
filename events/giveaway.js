const {
ActionRowBuilder,
ButtonBuilder,
ButtonStyle,
EmbedBuilder
} = require("discord.js");

module.exports = (client) => {

client.giveaways = new Map();

/* TIME PARSER */

function parseDuration(time) {

const match =
time.match(/^(\d+)(s|m|h|d)$/);

if (!match) return null;

const value =
parseInt(match[1]);

const unit =
match[2];

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

client.on("interactionCreate", async interaction => {

if (
!interaction.isChatInputCommand() &&
!interaction.isButton()
) return;

try {

/* ========================= */
/* START GIVEAWAY */
/* ========================= */

if (
interaction.isChatInputCommand() &&
interaction.commandName === "giveaway"
) {

const prize =
interaction.options.getString("prize");

const durationInput =
interaction.options.getString("duration");

const winners =
interaction.options.getInteger("winners");

const duration =
parseDuration(durationInput);

if (!duration) {

return interaction.reply({
content:
"❌ Invalid duration.\nExamples: 10s, 5m, 2h, 1d",
ephemeral: true
});

}

const embed =
new EmbedBuilder()
.setColor("Gold")
.setTitle("🎉 GIVEAWAY 🎉")
.setDescription(
`🏆 Prize: **${prize}**

👑 Winners: **${winners}**

⏰ Duration: **${durationInput}**

🎊 Click the button below to join!`
)
.setFooter({
text: `Hosted by ${interaction.user.username}`
})
.setTimestamp();

const button =
new ButtonBuilder()
.setCustomId("giveaway_join")
.setLabel("🎉 Join Giveaway")
.setStyle(ButtonStyle.Primary);

const row =
new ActionRowBuilder()
.addComponents(button);

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
host: interaction.user.id
});

/* END GIVEAWAY */

setTimeout(async () => {

const data =
client.giveaways.get(msg.id);

if (!data) return;

if (data.users.length === 0) {

await interaction.channel.send(
"❌ No one joined the giveaway."
);

client.giveaways.delete(msg.id);

return;

}

/* PICK WINNERS */

const shuffled =
data.users.sort(() => 0.5 - Math.random());

const selected =
shuffled.slice(0, winners);

await interaction.channel.send(
`🎉 Congratulations ${selected.map(id => `<@${id}>`).join(", ")}

🏆 You won **${prize}**`
);

client.giveaways.delete(msg.id);

}, duration);

}

/* ========================= */
/* JOIN GIVEAWAY */
/* ========================= */

if (
interaction.isButton() &&
interaction.customId === "giveaway_join"
) {

const giveaway =
client.giveaways.get(
interaction.message.id
);

if (!giveaway) {

return await interaction.reply({
content: "❌ Giveaway ended.",
ephemeral: true
});

}

if (
giveaway.users.includes(
interaction.user.id
)
) {

return await interaction.reply({
content: "⚠️ You already joined!",
ephemeral: true
});

}

giveaway.users.push(
interaction.user.id
);

return await interaction.reply({
content: "🎉 You joined giveaway!",
ephemeral: true
});

}

/* ========================= */
/* REROLL GIVEAWAY */
/* ========================= */

if (
interaction.isChatInputCommand() &&
interaction.commandName === "reroll"
) {

return interaction.reply(
"🔄 Giveaway rerolled!"
);

}

/* ========================= */
/* END GIVEAWAY */
/* ========================= */

if (
interaction.isChatInputCommand() &&
interaction.commandName === "endgiveaway"
) {

return interaction.reply(
"⏹ Giveaway ended!"
);

}

} catch (err) {

console.error(err);

if (!interaction.replied) {

await interaction.reply({
content: "❌ Giveaway System Error",
ephemeral: true
});

}

}

});

};
