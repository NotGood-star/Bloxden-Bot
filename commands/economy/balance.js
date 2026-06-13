const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
// Import the shared balances map from your centralized database
const { balances } = require('../../database.js'); 

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Check your current wallet balance.')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('The user whose balance you want to check')),
        
    async execute(interaction) {
        // Fetch target user (or default to the person running the command)
        const targetUser = interaction.options.getUser('target') || interaction.user;
        
        // Get balance from shared memory; default to 0 if user not found
        const currentBalance = balances.get(targetUser.id) || 0;
        
        // Prepare Embed
        const embedColor = interaction.client.colors?.info || '#3498DB';
        const balEmbed = new EmbedBuilder()
            .setColor(embedColor)
            .setTitle(`💰 ${targetUser.username}'s Wealth`)
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 256 }))
            .setDescription(`**Wallet:** 🪙 ${currentBalance.toLocaleString()} coins`)
            .setFooter({ text: 'BloxDen Economy System' })
            .setTimestamp();

        return interaction.reply({ embeds: [balEmbed] });
    }
};
