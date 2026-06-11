const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gtn')
        .setDescription('Start a Guess the Number game inside the channel.')
        .addIntegerOption(option => option.setName('max').setDescription('Upper calculation cap (e.g. 100)').setRequired(true)),
    async execute(interaction) {
        const max = interaction.options.getInteger('max');
        const secretNum = Math.floor(Math.random() * max) + 1;

        await interaction.reply(`🎮 **Guess The Number Initiated!** I have rolled an item value between **1 and ${max}**. Type out numbers inside chat channels to guess it!`);

        const collector = interaction.channel.createMessageCollector({
            filter: m => !m.author.bot,
            time: 60000
        });

        collector.on('collect', m => {
            const guess = parseInt(m.content, 10);
            if (isNaN(guess)) return;

            if (guess === secretNum) {
                m.reply(`🎉 **WINNER!** ${m.author} correctly guessed **${secretNum}**! Game processing closed.`);
                collector.stop();
            } else if (guess < secretNum) {
                m.reply('📈 Higher!');
            } else {
                m.reply('📉 Lower!');
            }
        });
    }
};
