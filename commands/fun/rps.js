const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rps')
        .setDescription('Challenge the bot to an interactive game of Rock, Paper, Scissors.'),
    async execute(interaction) {
        const embed = new EmbedBuilder().setColor('#34495E').setTitle('✊ RPS Matchmaking Mat').setDescription('Make your selection choice below to deploy an operational vector strike.');
        
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('r').setLabel('Rock ✊').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('p').setLabel('Paper ✋').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('s').setLabel('Scissors ✌️').setStyle(ButtonStyle.Danger)
        );

        const response = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });
        
        const collector = response.createMessageComponentCollector({ time: 15000 });
        collector.on('collect', async i => {
            if (i.user.id !== interaction.user.id) return i.reply({ content: '❌ Not your game instance.', ephemeral: true });
            
            const weapons = ['r', 'p', 's'];
            const names = { r: 'Rock ✊', p: 'Paper ✋', s: 'Scissors ✌️' };
            const botChoice = weapons[Math.floor(Math.random() * 3)];
            const userChoice = i.customId;

            let finalState = 'Tie!';
            if ((userChoice === 'r' && botChoice === 's') || (userChoice === 'p' && botChoice === 'r') || (userChoice === 's' && botChoice === 'p')) {
                finalState = '🎉 You Win!';
            } else if (userChoice !== botChoice) {
                finalState = '🤖 Bot Wins!';
            }

            const endEmbed = new EmbedBuilder()
                .setColor('#2C3E50')
                .setTitle(finalState)
                .setDescription(`**You Selected:** ${names[userChoice]}\n**Bot Selected:** ${names[botChoice]}`);

            await i.update({ embeds: [endEmbed], components: [] });
            collector.stop();
        });
    }
};
