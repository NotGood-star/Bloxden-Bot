const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unlock')
        .setDescription('Restore regular messaging configuration keys back to a locked channel.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute(interaction) {
        const channel = interaction.channel;

        await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
            SendMessages: null
        });

        const embed = new EmbedBuilder()
            .setColor('#2ECC71')
            .setTitle('🔓 Channel Unlocked')
            .setDescription('Chat accessibility indices successfully cleared. Users may talk.');

        return interaction.reply({ embeds: [embed] });
    }
};
