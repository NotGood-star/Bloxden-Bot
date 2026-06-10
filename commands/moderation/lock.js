const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lock')
        .setDescription('Lock the current chat room down to prevent message updates.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute(interaction) {
        const channel = interaction.channel;
        
        await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
            SendMessages: false
        });

        const embed = new EmbedBuilder()
            .setColor('#E74C3C')
            .setTitle('🔒 Channel Locked')
            .setDescription('Public typing rights have been revoked for this terminal point by administrative staff.');

        return interaction.reply({ embeds: [embed] });
    }
};
