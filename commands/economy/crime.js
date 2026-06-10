const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { balances, crimeCooldowns } = require('../../database.js'); 

module.exports = {
    data: new SlashCommandBuilder()
        .setName('crime')
        .setDescription('Commit a high-risk crime for big payouts or heavy losses.'),
    async execute(interaction) {
        const userId = interaction.user.id;
        const cooldownTime = 120000; // 2 minutes
        const now = Date.now();

        if (crimeCooldowns.has(userId)) {
            const expirationTime = crimeCooldowns.get(userId) + cooldownTime;
            if (now < expirationTime) {
                const timeLeft = Math.round((expirationTime - now) / 1000);
                return interaction.reply({ 
                    content: `❌ The police are watching! Wait **${timeLeft}** seconds before committing another crime.`, 
                    ephemeral: true 
                });
            }
        }

        const success = Math.random() > 0.5; // 50/50 chance
        const currentBal = balances.get(userId) || 0;
        crimeCooldowns.set(userId, now);

        if (!success) {
            // Lose a random chunk of cash between 200 and 600 coins
            const loss = Math.floor(Math.random() * 401) + 200;
            const finalBal = Math.max(0, currentBal - loss); // Prevent going into negative balance
            balances.set(userId, finalBal);

            const failEmbed = new EmbedBuilder()
                .setColor(interaction.client.colors?.error || '#E74C3C')
                .setTitle('🚨 Caught by Security!')
                .setDescription(`You tried to bypass security but failed miserably. You were fined **🪙 ${loss}** coins.\nBalance: **${finalBal.toLocaleString()}** coins.`);
            return interaction.reply({ embeds: [failEmbed] });
        }

        // Win a random chunk of cash between 500 and 1200 coins
        const reward = Math.floor(Math.random() * 701) + 500;
        balances.set(userId, currentBal + reward);

        const successEmbed = new EmbedBuilder()
            .setColor(interaction.client.colors?.success || '#2ECC71')
            .setTitle('😈 Crime Successful!')
            .setDescription(`You successfully breached a digital asset vault and made off with **🪙 ${reward}** coins!\nBalance: **${(currentBal + reward).toLocaleString()}** coins.`);
        return interaction.reply({ embeds: [successEmbed] });
    }
};
