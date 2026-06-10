const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a member from the server.')
        .addUserOption(option => option.setName('target').setDescription('The member to kick').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('Reason for the kick'))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
    async execute(interaction) {
        const target = interaction.options.getMember('target');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (!target) return interaction.reply({ content: '❌ That user is not in this server.', ephemeral: true });
        if (!target.kickable) return interaction.reply({ content: '❌ I cannot kick this user. They may have a higher role than me.', ephemeral: true });

        await target.kick(reason);

        const embed = new EmbedBuilder()
            .setColor(interaction.client.colors?.error || '#E74C3C')
            .setTitle('👢 Member Kicked')
            .setDescription(`**User:** ${target.user.tag} (${target.id})\n**Moderator:** ${interaction.user}\n**Reason:** ${reason}`)
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
};
