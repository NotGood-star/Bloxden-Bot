const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const balances = new Map(); 
const cooldowns = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Claim your daily Bloxden coins!'),
    async execute(interaction) {
        const userId = interaction.user.id;
        const cooldown = cooldowns.get(userId);
        const now = Date.now();
        
        if (cooldown && (now - cooldown < 86400000)) {
            const timeRemaining = 86400000 - (now - cooldown);
            const hours = Math.floor(timeRemaining / 3600000);

            const cooldownEmbed = new EmbedBuilder()
                .setColor(interaction.client.colors.warning)
                .setTitle('⏱️ Cooldown Active')
                .setDescription(`You have already claimed your daily reward. Come back in **${hours} hours**.`);
                
            return interaction.reply({ embeds: [cooldownEmbed], ephemeral: true });
        }

        const currentBalance = balances.get(userId) || 0;
        const dailyReward = 500;
        balances.set(userId, currentBalance + dailyReward);
        cooldowns.set(userId, now);

        const dailyEmbed = new EmbedBuilder()
            .setColor(interaction.client.colors.success)
            .setTitle('💵 Daily Reward Claimed!')
            .setDescription(`You safely deposited **$${dailyReward}** Bloxden coins into your account.`)
            .addFields(
                { name: 'Wallet Balance', value: `$${balances.get(userId)}`, inline: true }
            )
            .setThumbnail('https://i.imgur.com/vHkWg6A.png') // Optional: Drop a cool coin asset image link here
            .setTimestamp();

        await interaction.reply({ embeds: [dailyEmbed] });
    },
};
