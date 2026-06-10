const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bans a user from the Bloxden server.')
        .addUserOption(option => option.setName('target').setDescription('The member to ban').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('The reason for the ban'))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    async execute(interaction) {
        const user = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        if (!member) {
            const noUserEmbed = new EmbedBuilder()
                .setColor(interaction.client.colors.error)
                .setDescription('❌ That user could not be found in this server.');
            return interaction.reply({ embeds: [noUserEmbed], ephemeral: true });
        }

        if (!member.bannable) {
            const immuneEmbed = new EmbedBuilder()
                .setColor(interaction.client.colors.error)
                .setDescription('❌ I cannot ban this user. They may have a higher role than me.');
            return interaction.reply({ embeds: [immuneEmbed], ephemeral: true });
        }

        await member.ban({ reason: reason });

        const successEmbed = new EmbedBuilder()
            .setColor(interaction.client.colors.success)
            .setTitle('🔨 Member Banned')
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: 'Target User', value: `${user.tag} (${user.id})`, inline: true },
                { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
                { name: 'Reason', value: reason }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [successEmbed] });
    },
};
