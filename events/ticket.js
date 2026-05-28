const {
ChannelType,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle,
EmbedBuilder,
PermissionsBitField
} = require("discord.js");

module.exports = (client) => {

client.on("interactionCreate", async interaction => {

if (
!interaction.isChatInputCommand() &&
!interaction.isButton()
) return;

try {

/* ========================= */
/* TICKET PANEL COMMAND */
/* ========================= */

if (
interaction.isChatInputCommand() &&
interaction.commandName === "ticketpanel"
) {

const embed =
new EmbedBuilder()
.setColor("Blue")
.setTitle("🎫 BloxDen Support Panel")
.setDescription(
"Need help?\n\nClick the button below to create a support ticket."
)
.setFooter({
text: "BloxDen Ticket System"
});

const button =
new ButtonBuilder()
.setCustomId("create_ticket")
.setLabel("🎫 Create Ticket")
.setStyle(ButtonStyle.Primary);

const row =
new ActionRowBuilder()
.addComponents(button);

return interaction.reply({
embeds: [embed],
components: [row]
});

}

/* ========================= */
/* CREATE TICKET */
/* ========================= */

if (
interaction.isButton() &&
interaction.customId === "create_ticket"
) {

const existing =
interaction.guild.channels.cache.find(
c => c.name === `ticket-${interaction.user.id}`
);

if (existing) {

return interaction.reply({
content: "❌ You already have an open ticket!",
ephemeral: true
});

}

const ticket =
await interaction.guild.channels.create({
name: `ticket-${interaction.user.id}`,
type: ChannelType.GuildText,
permissionOverwrites: [
{
id: interaction.guild.roles.everyone,
deny: [
PermissionsBitField.Flags.ViewChannel
]
},
{
id: interaction.user.id,
allow: [
PermissionsBitField.Flags.ViewChannel,
PermissionsBitField.Flags.SendMessages,
PermissionsBitField.Flags.ReadMessageHistory
]
}
]
});

const closeButton =
new ButtonBuilder()
.setCustomId("close_ticket")
.setLabel("🔒 Close Ticket")
.setStyle(ButtonStyle.Danger);

const claimButton =
new ButtonBuilder()
.setCustomId("claim_ticket")
.setLabel("🛠 Claim Ticket")
.setStyle(ButtonStyle.Success);

const row =
new ActionRowBuilder()
.addComponents(
claimButton,
closeButton
);

const embed =
new EmbedBuilder()
.setColor("Green")
.setTitle("🎫 Ticket Created")
.setDescription(
`Welcome ${interaction.user} 👋

Please explain your issue and staff will help you soon.`
)
.setFooter({
text: "BloxDen Support"
});

await ticket.send({
content: `${interaction.user}`,
embeds: [embed],
components: [row]
});

return interaction.reply({
content: `✅ Ticket created: ${ticket}`,
ephemeral: true
});

}

/* ========================= */
/* CLAIM TICKET */
/* ========================= */

if (
interaction.isButton() &&
interaction.customId === "claim_ticket"
) {

await interaction.reply({
content:
`🛠 ${interaction.user} claimed this ticket!`
});

}

/* ========================= */
/* CLOSE TICKET */
/* ========================= */

if (
interaction.isButton() &&
interaction.customId === "close_ticket"
) {

await interaction.reply(
"🔒 Closing ticket in 5 seconds..."
);

setTimeout(() => {

interaction.channel.delete().catch(() => {});

}, 5000);

}

} catch (err) {

console.error(err);

if (!interaction.replied) {

interaction.reply({
content: "❌ Ticket System Error",
ephemeral: true
});

}

}

});

};
