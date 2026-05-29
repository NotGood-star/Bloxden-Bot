const {
ActionRowBuilder,
ButtonBuilder,
ButtonStyle,
ChannelType,
PermissionsBitField
} = require("discord.js");

module.exports = (client) => {

client.on("interactionCreate", async interaction => {

try {

/* ========================= */
/* SLASH COMMANDS */
/* ========================= */

if (interaction.isChatInputCommand()) {

/* ========================= */
/* TICKET PANEL */
/* ========================= */

if (interaction.commandName === "ticketpanel") {

if (
!interaction.member.permissions.has(
PermissionsBitField.Flags.Administrator
)
) {

return interaction.reply({
content:
"❌ You need Administrator permission",
ephemeral: true
});

}

const button =
new ButtonBuilder()
.setCustomId("create_ticket")
.setLabel("🎫 Create Ticket")
.setStyle(ButtonStyle.Primary);

const row =
new ActionRowBuilder()
.addComponents(button);

return interaction.reply({
content:
"🎫 BloxDen Support Panel\n\nClick the button below to create a support ticket.",
components: [row]
});

}

/* ========================= */
/* CLOSE TICKET */
/* ========================= */

if (interaction.commandName === "closeticket") {

if (
!interaction.channel.name.startsWith(
"ticket-"
)
) {

return interaction.reply({
content:
"❌ This is not a ticket channel",
ephemeral: true
});

}

await interaction.reply(
"🔒 Closing ticket in 5 seconds..."
);

setTimeout(() => {

interaction.channel.delete();

}, 5000);

}

}

/* ========================= */
/* BUTTONS */
/* ========================= */

if (interaction.isButton()) {

/* ========================= */
/* CREATE TICKET */
/* ========================= */

if (
interaction.customId === "create_ticket"
) {

const existing =
interaction.guild.channels.cache.find(
c =>
c.name ===
`ticket-${interaction.user.id}`
);

if (existing) {

return interaction.reply({
content:
`❌ You already have a ticket: ${existing}`,
ephemeral: true
});

}

const ticket =
await interaction.guild.channels.create({
name: `ticket-${interaction.user.id}`,
type: ChannelType.GuildText,

permissionOverwrites: [

{
id: interaction.guild.id,
deny: ["ViewChannel"]
},

{
id: interaction.user.id,
allow: [
"ViewChannel",
"SendMessages",
"ReadMessageHistory"
]
}

]

});

const closeButton =
new ButtonBuilder()
.setCustomId("close_ticket")
.setLabel("🔒 Close Ticket")
.setStyle(ButtonStyle.Danger);

const row =
new ActionRowBuilder()
.addComponents(closeButton);

await ticket.send({
content:
`🎫 Welcome ${interaction.user}

Please explain your issue and staff will help you soon.`,
components: [row]
});

return interaction.reply({
content:
`✅ Ticket created: ${ticket}`,
ephemeral: true
});

}

/* ========================= */
/* CLOSE BUTTON */
/* ========================= */

if (
interaction.customId === "close_ticket"
) {

await interaction.reply(
"🔒 Closing ticket in 5 seconds..."
);

setTimeout(() => {

interaction.channel.delete();

}, 5000);

}

}

} catch (err) {

console.error(err);

if (!interaction.replied) {

interaction.reply({
content: "❌ Ticket Error",
ephemeral: true
});

}

}

});

};
