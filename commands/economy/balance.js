const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
// Import shared database objects and the persistence function
const { balances, begCooldowns, saveDatabase } = require('../../database.js'); 

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Claim your daily Bloxden coins!'),
        
    async execute(interaction) {
        const userId = interaction.user.id;
        const now = Date.now();
        const COOLDOWN_TIME = 86400000; // 24 hours in milliseconds
        const dailyReward = 500;

        // Check for cooldown from shared database
        const lastClaim = begCooldowns.get(userId) || 0;
        
        if (now - lastClaim < COOLDOWN_TIME) {
            const timeRemaining = COOLDOWN_TIME - (now - lastClaim);
            const hours = Math.ceil(timeRemaining / 3600000);

            const cooldownEmbed = new EmbedBuilder()
                .setColor(interaction.client.colors.error)
                .setTitle('⏱️ Cooldown Active')
                .setDescription(`You have already claimed your daily reward. Please come back in **${hours} hours**.`);
                
            return interaction.reply({ embeds: [cooldownEmbed], ephemeral: true });
        }

        // Update balance in shared memory
        const currentBalance = balances.get(userId) || 0;
        balances.set(userId, currentBalance + dailyReward);
        
        // Update cooldown in shared memory
        begCooldowns.set(userId, now);
        
        // Save to JSON immediately to ensure persistence
        saveDatabase();

        const dailyEmbed = new EmbedBuilder()
            .setColor(interaction.client.colors.success)
            .setTitle('💵 Daily Reward Claimed!')
            .setDescription(`You successfully deposited **$${dailyReward}** Bloxden coins into your wallet.`)
            .addFields(
                { name: 'Current Balance', value: `$${balances.get(userId).toLocaleString()}`, inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [dailyEmbed] });
    },
};
