const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { xp, levels } = require('../../database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('View your current server activity level and XP progress.')
        .addUserOption(option => option.setName('target').setDescription('View another member\'s rank')),
    async execute(interaction) {
        const user = interaction.options.getUser('target') || interaction.user;
        
        const currentLevel = levels.get(user.id) || 1;
        const currentXP = xp.get(user.id) || 0;
        const xpNeeded = currentLevel * 150; // Dynamic formula scaling per level

        const embed = new EmbedBuilder()
            .setColor(interaction.client.colors.success)
            .setAuthor({ name: `${user.username}'s Progression Card`, iconURL: user.displayAvatarURL({ dynamic: true }) })
            .addFields(
                { name: '✨ Level', value: `\`${currentLevel}\``, inline: true },
                { name: '🧪 Experience Points (XP)', value: `\`${currentXP} / ${xpNeeded} XP\``, inline: true }
            )
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
