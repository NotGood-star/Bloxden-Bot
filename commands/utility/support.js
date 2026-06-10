// commands/utility/support.js
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('support')
        .setDescription('Get the invite link to the official BloxDen Support Server.'),
    async execute(interaction) {
        const inviteLink = 'https://discord.gg/XAkH6QfFEG';
        const embedColor = interaction.client.colors?.info || '#3498DB';

        // Create an attractive embed displaying info about the server
        const embed = new EmbedBuilder()
            .setColor(embedColor)
            .setTitle('🛠️ BloxDen Support Hub')
            .setDescription('Need help with commands, found a bug, or want to suggest a new feature? Join our official community support server!')
            .addFields(
                { name: '🌐 Invite Link', value: inviteLink },
                { name: '💬 What we offer', value: '• Bug reporting channels\n• Feature suggestions\n• Direct developer assistance\n• Economy event updates' }
            )
            .setTimestamp();

        // 🛠️ FIX: Changed .Label to .setLabel (lowercase 's', uppercase 'L')
        const button = new ButtonBuilder()
            .setLabel('Join Support Server')
            .setURL(inviteLink)
            .setStyle(ButtonStyle.Link);

        const row = new ActionRowBuilder().addComponents(button);

        // Send the response
        await interaction.reply({ embeds: [embed], components: [row] });
    }
};
