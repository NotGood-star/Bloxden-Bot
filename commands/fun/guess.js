const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('guess')
        .setDescription('Guess a scrambled hidden word matrix.'),
    async execute(interaction) {
        const pool = ['roblox', 'developer', 'render', 'discord', 'giveaway', 'economy'];
        const chosen = pool[Math.floor(Math.random() * pool.length)];
        const scrambled = chosen.split('').sort(() => Math.random() - 0.5).join('');

        await interaction.reply(`🧩 **Word Scramble Active!** Unscramble this string to win: **\`${scrambled}\`**\nType answers in chat! You have 30 seconds.`);

        const collector = interaction.channel.createMessageCollector({
            filter: m => !m.author.bot && m.content.toLowerCase() === chosen,
            time: 30000,
            max: 1
        });

        collector.on('collect', m => {
            m.reply(`🎉 **CORRECT!** ${m.author} decrypted the structure! The word was **${chosen}**.`);
            collector.stop();
        });
    }
};
