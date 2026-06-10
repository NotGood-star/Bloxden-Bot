const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

// Local fallback memory register if database doesn't export warns
const warns = new Map(); 

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Issue a formal warning to a user.')
        .addUserOption(option => option.setName('target').setDescription('The user to warn').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('The infraction description').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason');

        if (target.bot) return interaction.reply({ content: '❌ You cannot warn a bot.', ephemeral: true });

        if (!warns.has(target.id)) warns.set(target.id, []);
        
        const userWarns = warns.get(target.id);
        const warnData = {
            moderator: interaction.user.tag,
            reason: reason,
            timestamp: new Date().toLocaleString()
        };
        userWarns.push(warnData);

        const embed = new EmbedBuilder()
            .setColor('#F1C40F')
            .setTitle('⚠️ User Warned')
            .setDescription(`**User:** ${target} (${target.id})\n**Moderator:** ${interaction.user}\n**Reason:** ${reason}\n\n*Total Warnings:* **${userWarns.length}**`)
            .setTimestamp();

        // Save back reference globally to interact with list command below
        interaction.client.warnRegistry = warns;

        try {
            await target.send(`⚠️ You received a warning in **${interaction.guild.name}**\n**Reason:** ${reason}`);
        } catch (e) { /* Ignore if DMs are closed */ }

        return interaction.reply({ embeds: [embed] });
    }
};
