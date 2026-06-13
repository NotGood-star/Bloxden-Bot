const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
// IMPORT SHARED DATA FROM DATABASE.JS
const { balances, begCooldowns, saveDatabase } = require('../../database.js'); 

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Claim your daily Bloxden coins!'),
        
    async execute(interaction) {
        const userId = interaction.user.id;
        const now = Date.now();
        const COOLDOWN_TIME = 86400000; // 24 hours
        const dailyReward = 500;

        // Use the shared map for cooldowns
        const lastClaim = begCooldowns.get(userId) || 0;
        
        if (now - lastClaim < COOLDOWN_TIME) {
            const timeRemaining = COOLDOWN_TIME - (now - lastClaim);
            const hours = Math.ceil(timeRemaining / 3600000);
            return interaction.reply({ content: `⏱️ Come back in **${hours} hours**.`, ephemeral: true });
        }

        // Update shared balance
        const currentBalance = balances.get(userId) || 0;
        balances.set(userId, currentBalance + dailyReward);
        
        // Update shared cooldown
        begCooldowns.set(userId, now);
        
        // Save to JSON
        saveDatabase();

        const dailyEmbed = new EmbedBuilder()
            .setColor(interaction.client.colors.success)
            .setTitle('💵 Daily Reward Claimed!')
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true, size: 256 })) // Added Profile Picture
            .setDescription(`You deposited **$${dailyReward}** coins.`)
            .addFields({ name: 'Wallet Balance', value: `$${balances.get(userId).toLocaleString()}`, inline: true })
            .setTimestamp();

        await interaction.reply({ embeds: [dailyEmbed] });
    },
};
