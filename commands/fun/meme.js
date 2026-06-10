const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('meme')
        .setDescription('Fetch a fresh gaming or community meme from Reddit.'),
    async execute(interaction) {
        // Defer answer so the API request doesn't timeout the interaction
        await interaction.deferReply();

        try {
            const response = await fetch('https://meme-api.com/gimme/memes');
            const data = await response.json();

            if (data.nsfw) {
                return interaction.editReply({ content: '🔄 Captured an unsafe meme image. Try running the command again!' });
            }

            const embed = new EmbedBuilder()
                .setColor(interaction.client.colors.info)
                .setTitle(data.title)
                .setURL(data.postLink)
                .setImage(data.url)
                .setFooter({ text: `👍 ${data.ups} upvotes | Subreddit: r/${data.subreddit}` });

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            await interaction.editReply({ content: '❌ Failed to connect to the meme database matrix.' });
        }
    }
};
