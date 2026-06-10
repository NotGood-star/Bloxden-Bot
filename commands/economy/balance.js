const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { balances } = require('../../database.js'); 

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Check your current wallet balance.')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('The user whose balance you want to check')
                .setRequired(false)),
    async execute(interaction) {
        const targetUser = interaction.options.getUser('target') || interaction.user;
        
        if (!balances.has(targetUser.id)) {
            balances.set(targetUser.id, 0);
        }

        const currentBalance = balances.get(targetUser.id);
        const embedColor = interaction.client.colors?.info || '#3498DB';

        const balEmbed = new EmbedBuilder()
            .setColor(embedColor)
            .setTitle(`💰 ${targetUser.username}'s Wealth`)
            .setDescription(`**Wallet:** 🪙 ${currentBalance.toLocaleString()} coins`)
            .setTimestamp();

        return interaction.reply({ embeds: [balEmbed] });
    }
};
