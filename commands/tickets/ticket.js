const { SlashCommandBuilder, ChannelType, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { tickets } = require('../../database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Open a private support ticket with staff.'),
    async execute(interaction) {
        const guild = interaction.guild;
        const userId = interaction.user.id;

        if (tickets.has(userId)) {
            return interaction.reply({ content: '❌ You already have an active support ticket open!', ephemeral: true });
        }

        // Create a secure channel override
        const channel = await guild.channels.create({
            name: `ticket-${interaction.user.username}`,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                { id: userId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }
            ]
        });

        tickets.set(userId, channel.id);

        const embed = new EmbedBuilder()
            .setColor(interaction.client.colors.info)
            .setTitle('🎟️ Support Ticket Created')
            .setDescription(`Hello ${interaction.user}, thank you for reaching out. Support staff will be with you shortly.\n\nUse \`/close\` to safely shut down this inquiry.`)
            .setTimestamp();

        await channel.send({ embeds: [embed] });
        await interaction.reply({ content: `✅ Ticket generated successfully! Go to ${channel}`, ephemeral: true });
    }
};
