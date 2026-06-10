const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { userJobs, balances, workCooldowns, JOB_LIST } = require('../../database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('work')
        .setDescription('Clock in and complete a shift to earn money.'),
    async execute(interaction) {
        const userId = interaction.user.id;
        const now = Date.now();
        const cooldownTime = 1800000; // 30 Minutes

        if (workCooldowns.has(userId) && (now - workCooldowns.get(userId) < cooldownTime)) {
            const timeLeft = Math.ceil((cooldownTime - (now - workCooldowns.get(userId))) / 1000 / 60);
            const cdEmbed = new EmbedBuilder()
                .setColor(interaction.client.colors.warning)
                .setDescription(`⏱️ Rest up! You can work again in **${timeLeft} minutes**.`);
            return interaction.reply({ embeds: [cdEmbed], ephemeral: true });
        }

        const jobId = userJobs.get(userId);
        if (!jobId) {
            const noJobEmbed = new EmbedBuilder()
                .setColor(interaction.client.colors.error)
                .setDescription('❌ You don\'t have a job yet! Use \`/work-apply\` to choose a career path.');
            return interaction.reply({ embeds: [noJobEmbed], ephemeral: true });
        }

        const job = JOB_LIST[jobId];
        const payout = Math.floor(Math.random() * (job.max - job.min + 1)) + job.min;

        const currentBal = balances.get(userId) || 0;
        balances.set(userId, currentBal + payout);
        workCooldowns.set(userId, now);

        const embed = new EmbedBuilder()
            .setColor(interaction.client.colors.success)
            .setTitle('👷 Shift Complete!')
            .setDescription(`You put in hard work as a **${job.name}** and earned **$${payout}** Bloxden coins.`)
            .addFields({ name: 'Total Wallet Balance', value: `🪙 \`$${balances.get(userId)}\`` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
