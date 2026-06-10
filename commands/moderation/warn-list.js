const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn-list')
        .setDescription('View the active moderation infractions logged against a specific user.')
        .addUserOption(option => option.setName('target').setDescription('The user to look up').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const warnRegistry = interaction.client.warnRegistry;
        const userWarns = warnRegistry ? warnRegistry.get(target.id) : null;

        if (!userWarns || userWarns.length === 0) {
            return interaction.reply({ content: `✅ **${target.username}** has a completely clean record (0 warnings).` });
        }

        const embed = new EmbedBuilder()
            .setColor('#F1C40F')
            .setTitle(`📂 Infraction Dossier: ${target.username}`)
            .setThumbnail(target.displayAvatarURL());

        userWarns.forEach((warn, index) => {
            embed.addFields({
                name: `Warning #${index + 1}`,
                value: `**Reason:** ${warn.reason}\n**Mod:** ${warn.moderator}\n**Date:** ${warn.timestamp}`
            });
        });

        return interaction.reply({ embeds: [embed] });
    }
};
