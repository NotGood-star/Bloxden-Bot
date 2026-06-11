const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban-list')
        .setDescription('Fetch the current server ban logs.')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    async execute(interaction) {
        await interaction.deferReply();
        
        const bans = await interaction.guild.bans.fetch({ limit: 15 });
        if (bans.size === 0) return interaction.editReply('🕊️ This guild currently maintains a clean block ledger (0 total bans).');

        const bannedUsers = bans.map(b => `• **${b.user.tag}** (${b.user.id}) | Reason: *${b.reason || 'None stated'}*`).join('\n');

        const embed = new EmbedBuilder()
            .setColor('#2C3E50')
            .setTitle('🚫 Blacklisted Server Profiles')
            .setDescription(bannedUsers.substring(0, 4000))
            .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
    }
};
