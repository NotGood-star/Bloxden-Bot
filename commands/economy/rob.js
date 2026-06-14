const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../database.js'); 

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rob')
        .setDescription('Pickpocket another server member\'s wallet.')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('The user you want to rob')
                .setRequired(true)),
    async execute(interaction) {
        const userId = interaction.user.id;
        const target = interaction.options.getUser('target');
        const cooldownTime = 300000; // 5 minutes
        const now = Date.now();

        if (target.id === userId) {
            return interaction.reply({ content: '❌ You can\'t rob yourself, silly!', ephemeral: true });
        }
        if (target.bot) {
            return interaction.reply({ content: '❌ Bots don\'t carry wallets.', ephemeral: true });
        }

        // Check cooldown
        if (db.robCooldowns.has(userId)) {
            const expirationTime = db.robCooldowns.get(userId) + cooldownTime;
            if (now < expirationTime) {
                const timeLeft = Math.round((expirationTime - now) / 60000);
                return interaction.reply({ 
                    content: `❌ You need to lay low. Try robbing again in **${timeLeft}** minutes.`, 
                    ephemeral: true 
                });
            }
        }

        const userBal = db.balances.get(userId) || 0;
        const targetBal = db.balances.get(target.id) || 0;

        if (targetBal < 200) {
            return interaction.reply({ content: `❌ ${target.username} is too poor to rob! They have less than 200 coins.`, ephemeral: true });
        }
        if (userBal < 100) {
            return interaction.reply({ content: '❌ You need at least 100 coins in your wallet to pay court fees if you get caught!', ephemeral: true });
        }

        // Update Cooldown
        db.robCooldowns.set(userId, now);
        
        const success = Math.random() > 0.6; // 40% chance of a successful heist

        if (!success) {
            // Get caught and pay the target a fine
            const fine = Math.floor(Math.random() * 101) + 50; // fine 50-150 coins
            db.balances.set(userId, Math.max(0, userBal - fine));
            db.balances.set(target.id, targetBal + fine);

            // Persist the change
            db.saveDatabase();

            const fineEmbed = new EmbedBuilder()
                .setColor(interaction.client.colors?.error || '#E74C3C')
                .setDescription(`👮 **You got caught trying to rob ${target}!** You were forced to pay them a **${fine}** coin settlement fee.`);
            return interaction.reply({ embeds: [fineEmbed] });
        }

        // Steal a percentage of their wallet (between 10% and 40%)
        const percentage = Math.floor(Math.random() * 31) + 10; 
        const stolenAmount = Math.floor(targetBal * (percentage / 100));

        db.balances.set(userId, userBal + stolenAmount);
        db.balances.set(target.id, targetBal - stolenAmount);

        // Persist the change
        db.saveDatabase();

        const successEmbed = new EmbedBuilder()
            .setColor(interaction.client.colors?.success || '#2ECC71')
            .setDescription(`🥷 **Heist Success!** You sneakily pickpocketed ${target} and stole **${stolenAmount}** coins (${percentage}% of their wallet)!`);
        return interaction.reply({ embeds: [successEmbed] });
    }
};
