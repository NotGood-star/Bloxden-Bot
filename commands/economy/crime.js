const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
// Import both the data maps and the save function
const db = require('../../database.js'); 

module.exports = {
    data: new SlashCommandBuilder()
        .setName('crime')
        .setDescription('Commit a high-risk crime for big payouts or heavy losses.'),
    async execute(interaction) {
        const userId = interaction.user.id;
        const cooldownTime = 120000; // 2 minutes
        const now = Date.now();

        // 1. Check Cooldown
        if (db.crimeCooldowns.has(userId)) {
            const expirationTime = db.crimeCooldowns.get(userId) + cooldownTime;
            if (now < expirationTime) {
                const timeLeft = Math.round((expirationTime - now) / 1000);
                return interaction.reply({ 
                    content: `❌ The police are watching! Wait **${timeLeft}** seconds before committing another crime.`, 
                    ephemeral: true 
                });
            }
        }

        // 2. Logic
        const success = Math.random() > 0.5; // 50/50 chance
        const currentBal = db.balances.get(userId) || 0;
        
        // Update state
        db.crimeCooldowns.set(userId, now);

        let resultEmbed;
        if (!success) {
            // Failure logic
            const loss = Math.floor(Math.random() * 401) + 200;
            const finalBal = Math.max(0, currentBal - loss);
            db.balances.set(userId, finalBal);

            resultEmbed = new EmbedBuilder()
                .setColor(interaction.client.colors?.error || '#E74C3C')
                .setTitle('🚨 Caught by Security!')
                .setDescription(`You tried to bypass security but failed miserably. You were fined **🪙 ${loss}** coins.\nBalance: **${finalBal.toLocaleString()}** coins.`);
        } else {
            // Success logic
            const reward = Math.floor(Math.random() * 701) + 500;
            db.balances.set(userId, currentBal + reward);

            resultEmbed = new EmbedBuilder()
                .setColor(interaction.client.colors?.success || '#2ECC71')
                .setTitle('😈 Crime Successful!')
                .setDescription(`You successfully breached a digital asset vault and made off with **🪙 ${reward}** coins!\nBalance: **${(currentBal + reward).toLocaleString()}** coins.`);
        }

        // 3. Save to disk so data persists after restart
        db.saveDatabase();

        return interaction.reply({ embeds: [resultEmbed] });
    }
};
