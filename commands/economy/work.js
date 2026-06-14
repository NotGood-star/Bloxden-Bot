const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
// Import the central database object
const db = require('../../database.js'); 

module.exports = {
    data: new SlashCommandBuilder()
        .setName('work')
        .setDescription('Work a shift at your chosen job to earn a salary.'),
    async execute(interaction) {
        const userId = interaction.user.id;
        const cooldownTime = 3600000; // 1 hour cooldown
        const now = Date.now();

        // 💼 Check if they even have a job
        if (!db.userJobs.has(userId)) {
            return interaction.reply({ 
                content: '❌ You don\'t have a job yet! Use \`/work-apply\` to pick a career path first.', 
                ephemeral: true 
            });
        }

        // ⏱️ Check cooldown
        if (db.workCooldowns.has(userId)) {
            const expirationTime = db.workCooldowns.get(userId) + cooldownTime;
            if (now < expirationTime) {
                const timeLeft = Math.round((expirationTime - now) / 60000); // convert to minutes
                return interaction.reply({ 
                    content: `❌ Your shift ended recently. You can work again in **${timeLeft}** minutes.`, 
                    ephemeral: true 
                });
            }
        }

        const jobId = db.userJobs.get(userId);
        const jobConfig = db.JOB_LIST[jobId];

        // Fallback protection if job configuration disappeared
        if (!jobConfig) {
            return interaction.reply({ content: '❌ Your job data is corrupted. Please re-apply with `/work-apply`.', ephemeral: true });
        }

        // Calculate random payout based on job config limits
        const payout = Math.floor(Math.random() * (jobConfig.max - jobConfig.min + 1)) + jobConfig.min;
        const currentBal = db.balances.get(userId) || 0;

        // Update state
        db.balances.set(userId, currentBal + payout);
        db.workCooldowns.set(userId, now);

        // Persist data to the JSON file
        db.saveDatabase();

        const embedColor = interaction.client.colors?.success || '#2ECC71';
        const workEmbed = new EmbedBuilder()
            .setColor(embedColor)
            .setTitle('💼 Shift Completed!')
            .setDescription(`You worked hard as an **${jobConfig.name}** and earned **🪙 ${payout.toLocaleString()}** coins!\n\nYour new balance is **${(currentBal + payout).toLocaleString()}** coins.`)
            .setTimestamp();

        return interaction.reply({ embeds: [workEmbed] });
    }
};
