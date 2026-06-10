const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Isolate and mute a user using communication temporary timeouts.')
        .addUserOption(option => option.setName('target').setDescription('User to mute').setRequired(true))
        .addIntegerOption(option => option.setName('duration').setDescription('Timeout length').addChoices(
            { name: '60 Seconds', value: 60 },
            { name: '5 Minutes', value: 300 },
            { name: '10 Minutes', value: 600 },
            { name: '1 Hour', value: 3600 },
            { name: '1 Day', value: 86400 }
        ).setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('Reason for the mute')),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return interaction.reply({ content: '❌ Missing permission structural flags.', ephemeral: true });
        }

        const target = interaction.options.getMember('target');
        const duration = interaction.options.getInteger('duration');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (!target) return interaction.reply({ content: '❌ User missing.', ephemeral: true });
        if (!target.moderatable) return interaction.reply({ content: '❌ Cannot isolate this profile.', ephemeral: true });

        await target.timeout(duration * 1000, reason);

        const embed = new EmbedBuilder()
            .setColor('#E67E22')
            .setTitle('🤫 Member Timed Out')
            .setDescription(`**User:** ${target}\n**Length:** ${duration}s\n**Reason:** ${reason}`)
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
};
