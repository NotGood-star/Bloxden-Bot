const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { balances, begCooldowns } = require('../../database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('beg')
        .setDescription('Beg bypassers on the street for extra spare coins.'),
    async execute(interaction) {
        const userId = interaction.user.id;
        const now = Date.now();

        if (begCooldowns.has(userId) && (now - begCooldowns.get(userId) < 30000)) {
            return interaction.reply({ content: '❌ Don\'t spam begging, it looks bad.', ephemeral: true });
        }

        begCooldowns.set(userId, now);
        const success = Math.random() > 0.35;
        
        if (success) {
            const cash = Math.floor(Math.random() * 120) + 20;
            balances.set(userId, (balances.get(userId) || 0) + cash);
            await interaction.reply({ embeds: [new EmbedBuilder().setColor(interaction.client.colors.success).setDescription(`🥺 A kind passerby looked at you and handed you **$${cash}** coins.`)] });
        } else {
            await interaction.reply({ embeds: [new EmbedBuilder().setColor(interaction.client.colors.error).setDescription('🥺 Everyone walked past you and ignored your pleas.')] });
        }
    }
};
