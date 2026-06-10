const { SlashCommandBuilder } = require('discord.js');
const { tickets } = require('../../database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('close')
        .setDescription('Close and archive the current support ticket.'),
    async execute(interaction) {
        const channel = interaction.channel;
        
        let ticketOwnerId = null;
        for (const [userId, chId] of tickets.entries()) {
            if (chId === channel.id) {
                ticketOwnerId = userId;
                break;
            }
        }

        if (!ticketOwnerId && !channel.name.startsWith('ticket-')) {
            return interaction.reply({ content: '❌ This command can only be used inside an active ticket channel.', ephemeral: true });
        }

        await interaction.reply({ content: '🔒 Closing ticket channel. Self-destructing in 5 seconds...' });
        
        if (ticketOwnerId) tickets.delete(ticketOwnerId);

        setTimeout(() => {
            channel.delete().catch(() => null);
        }, 5000);
    }
};
