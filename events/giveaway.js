const {
ActionRowBuilder,
ButtonBuilder,
ButtonStyle
} = require("discord.js");

module.exports = (client) => {

client.giveaways = new Map();

client.on("interactionCreate", async interaction => {

if (!interaction.isChatInputCommand() &&
!interaction.isButton()) return;

try {

if (
interaction.isChatInputCommand() &&
interaction.commandName === "giveaway"
) {

const prize =
interaction.options.getString("prize");

const duration =
interaction.options.getInteger("duration");

const winners =
interaction.options.getInteger("winners");

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
content:
`🎉 GIVEAWAY 🎉

🏆 Prize: ${prize}
👑 Winners: ${winners}
⏰ Ends in: ${duration} seconds

Click button below to join!`,
components: [row],
fetchReply: true
});

client.giveaways.set(msg.id, {
users: [],
prize,
winners
});

setTimeout(async () => {

const data =
client.giveaways.get(msg.id);

if (!data) return;

if (data.users.length === 0) {

interaction.channel.send(
"❌ No one joined giveaway."
);

return;

}

const winner =
data.users[
Math.floor(Math.random() * data.users.length)
];

interaction.channel.send(
`🎉 Winner: <@${winner}> won **${prize}**`
);

client.giveaways.delete(msg.id);

}, duration * 1000);

}

if (
interaction.isButton() &&
interaction.customId === "giveaway_join"
) {

const giveaway =
client.giveaways.get(
interaction.message.id
);

if (!giveaway) {

return interaction.reply({
content: "❌ Giveaway ended.",
ephemeral: true
});

}

if (
giveaway.users.includes(
interaction.user.id
)
) {

return interaction.reply({
content: "⚠️ You already joined!",
ephemeral: true
});

}

giveaway.users.push(
interaction.user.id
);

interaction.reply({
content: "🎉 You joined giveaway!",
ephemeral: true
});

}

} catch (err) {

console.error(err);

}

});

};
