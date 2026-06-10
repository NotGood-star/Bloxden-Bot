const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
// In a real project, this map should be imported from a central file or database,
// but for our local system, we'll keep it matching your starter structure.
const balances = new Map(); 

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Check your current Bloxden wallet balance.')
        .addUserOption(option => option.setName('target').setDescription('The user to check (optional)')),
    async execute(interaction) {
        const user = interaction.options.getUser('target') || interaction.user;
        const balance = balances.get(user.id) || 0;

        const balEmbed = new EmbedBuilder()
            .setColor(interaction.client.colors.info)
            .setAuthor({ name: `${user.username}'s Financial Profile`, iconURL: user.displayAvatarURL({ dynamic: true }) })
            .addFields(
                { name: '💵 Wallet', value: `\`$${balance}\``, inline: true },
                { name: '🏦 Bank', value: `\`$0\` *(Use /deposit to save!)*`, inline: true }
            )
            .setThumbnail('https://i.imgur.com/vHkWg6A.png')
            .setTimestamp();

        await interaction.reply({ embeds: [balEmbed] });
    },
};
