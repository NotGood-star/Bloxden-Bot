const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { balances, crimeCooldowns } = require('../../database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('crime')
        .setDescription('Commit a high-risk crime for big payouts.'),
    async execute(interaction) {
        const userId = interaction.user.id;
        const now = Date.now();
        const cooldownTime = 900000; // 15 Minutes

        if (crimeCooldowns.has(userId) && (now - crimeCooldowns.get(userId) < cooldownTime)) {
            const timeLeft = Math.ceil((cooldownTime - (now - crimeCooldowns.get(userId))) / 1000 / 60);
            return interaction.reply({ content: `🚨 The cops are hot on your tail. Hide out for another **${timeLeft} minutes**.`, ephemeral: true });
        }

        crimeCooldowns.set(userId, now);
        const success = Math.random() > 0.55; // 45% chance of winning
        const embed = new EmbedBuilder().setTimestamp();

        if (success) {
            const loot = Math.floor(Math.random() * 1500) + 500;
            balances.set(userId, (balances.get(userId) || 0) + loot);
            embed.setColor(interaction.client.colors.success)
                 .setTitle('💰 Heist Successful!')
                 .setDescription(`You successfully breached an ATM machine and got away clean with **$${loot}** coins!`);
        } else {
            const fine = 400;
            balances.set(userId, Math.max(0, (balances.get(userId) || 0) - fine));
            embed.setColor(interaction.client.colors.error)
                 .setTitle('🚔 Busted!')
                 .setDescription(`Your escape car stalled! You got caught and had to pay a **$${fine}** fine.`);
        }

        await interaction.reply({ embeds: [embed] });
    }
};
