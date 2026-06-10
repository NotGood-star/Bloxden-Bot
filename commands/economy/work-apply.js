const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { userJobs, JOB_LIST } = require('../../database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('work-apply')
        .setDescription('Apply for one of the 12 available careers.')
        .addStringOption(option =>
            option.setName('job')
                .setDescription('Pick your career path')
                .setRequired(true)
                .addChoices(
                    { name: 'Astronaut 🚀', value: 'astronaut' },
                    { name: 'Scientist 🧪', value: 'scientist' },
                    { name: 'Youtuber 🎥', value: 'youtuber' },
                    { name: 'Wrestler 🤼', value: 'wrestler' },
                    { name: 'Developer 💻', value: 'developer' },
                    { name: 'Hacker 🧑‍💻', value: 'hacker' },
                    { name: 'Teacher 🍎', value: 'teacher' },
                    { name: 'Doctor 🩺', value: 'doctor' },
                    { name: 'Cab Driver 🚖', value: 'cab_driver' },
                    { name: 'Director 🎬', value: 'director' },
                    { name: 'Actor 🎭', value: 'actor' },
                    { name: 'Musician 🎸', value: 'musician' }
                )),
    async execute(interaction) {
        const jobId = interaction.options.getString('job');
        userJobs.set(interaction.user.id, jobId);

        const embed = new EmbedBuilder()
            .setColor(interaction.client.colors.success)
            .setTitle('💼 Contract Signed!')
            .setDescription(`Congratulations ${interaction.user}! You are now hired as a **${JOB_LIST[jobId].name}**.\n\nRun \`/work\` to complete your first shift!`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
