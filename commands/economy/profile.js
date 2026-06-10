const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { balances, userJobs, inventories, JOB_LIST } = require('../../database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('View your complete bank balances, active jobs, and inventory roles.')
        .addUserOption(option => option.setName('target').setDescription('Target player profile')),
    async execute(interaction) {
        const user = interaction.options.getUser('target') || interaction.user;
        const userId = user.id;

        const balance = balances.get(userId) || 0;
        const jobId = userJobs.get(userId);
        const jobDisplay = jobId ? JOB_LIST[jobId].name : 'Unemployed 🚫';
        
        const inv = inventories.get(userId) || [];
        const inventoryDisplay = inv.length > 0 ? inv.map(item => `✨ ${item}`).join('\n') : '*No item badges owned yet.*';

        const embed = new EmbedBuilder()
            .setColor(interaction.client.colors.info)
            .setAuthor({ name: `${user.username}'s Financial Summary`, iconURL: user.displayAvatarURL({ dynamic: true }) })
            .addFields(
                { name: '💼 Profession', value: `\`${jobDisplay}\``, inline: true },
                { name: '🪙 Wallet Cash', value: `\`$${balance}\``, inline: true },
                { name: '🎒 Vault Badges', value: inventoryDisplay, inline: false }
            )
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
