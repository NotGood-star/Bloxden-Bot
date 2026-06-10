const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { balances, begCooldowns } = require('../../database.js'); 

module.exports = {
    data: new SlashCommandBuilder()
        .setName('beg')
        .setDescription('Beg generous passersby for a few spare coins.'),
    async execute(interaction) {
        const userId = interaction.user.id;
        const cooldownTime = 30000; // 30 seconds
        const now = Date.now();

        if (begCooldowns.has(userId)) {
            const expirationTime = begCooldowns.get(userId) + cooldownTime;
            if (now < expirationTime) {
                const timeLeft = Math.round((expirationTime - now) / 1000);
                return interaction.reply({ 
                    content: `❌ Slow down! You can beg again in **${timeLeft}** seconds.`, 
                    ephemeral: true 
                });
            }
        }

        const success = Math.random() > 0.3; // 70% success rate
        const embedColor = interaction.client.colors?.success || '#2ECC71';

        if (!success) {
            begCooldowns.set(userId, now);
            return interaction.reply({ content: '😢 **A stranger looked at you, sighed, and kept walking.** No coins for you this time!' });
        }

        const amountGained = Math.floor(Math.random() * 81) + 20; // 20 - 100 coins
        const currentBal = balances.get(userId) || 0;
        
        balances.set(userId, currentBal + amountGained);
        begCooldowns.set(userId, now);

        const begEmbed = new EmbedBuilder()
            .setColor(embedColor)
            .setDescription(`🪙 A kind passerby handed you **${amountGained}** coins! Total balance: **${(currentBal + amountGained).toLocaleString()}** coins.`);

        return interaction.reply({ embeds: [begEmbed] });
    }
};
