// commands/moderation/ticket-panel.js
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-panel')
        .setDescription('Deploy the BloxDen Support Ticket creation panel.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // Admin only can drop the panel
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#3498DB')
            .setTitle('📩 BloxDen Support Portal')
            .setDescription(
                'Need assistance, want to report a player, or have a billing inquiry?\n\n' +
                'Click the button below to open a private support terminal. Our staff team will assist you shortly.'
            )
            .setFooter({ text: 'BloxDen Automation v2 • Secure & Encrypted' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('create_ticket')
                .setLabel('Create Ticket')
                .setEmoji('📩')
                .setStyle(ButtonStyle.Primary)
        );

        await interaction.reply({ content: '✅ Ticket panel successfully deployed here.', ephemeral: true });
        return interaction.channel.send({ embeds: [embed], components: [row] });
    }
};
