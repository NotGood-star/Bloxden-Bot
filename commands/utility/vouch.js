const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

const dbPath = path.join(__dirname, '../../database.json');
function readDB() { return JSON.parse(fs.readFileSync(dbPath, 'utf8') || '{}'); }
function writeDB(data) { fs.writeFileSync(dbPath, JSON.stringify(data, null, 2)); }

module.exports = {
    data: new SlashCommandBuilder()
        .setName('vouch')
        .setDescription('Vouch for trusted community members or check standard rankings')
        .addSubcommand(sub =>
            sub.setName('add')
                .setDescription('Vouch for a trusted user')
                .addUserOption(opt => opt.setName('user').setDescription('The user you are vouching for').setRequired(true))
                .addStringOption(opt => opt.setName('reason').setDescription('Why are you vouching for them?').setRequired(true))
        )
        .addSubcommand(sub =>
            sub.setName('leaderboard')
                .setDescription('Show the top vouched members')
        ),
    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const db = readDB();
        if (!db.vouches) db.vouches = {};

        if (sub === 'add') {
            const target = interaction.options.getUser('user');
            const reason = interaction.options.getString('reason');

            if (target.id === interaction.user.id) {
                return interaction.reply({ content: `❌ You cannot vouch for yourself!`, ephemeral: true });
            }
            if (target.bot) {
                return interaction.reply({ content: `❌ You cannot vouch for automation systems.`, ephemeral: true });
            }

            if (!db.vouches[target.id]) db.vouches[target.id] = { count: 0, logs: [] };
            
            db.vouches[target.id].count += 1;
            db.vouches[target.id].logs.push({ giver: interaction.user.tag, reason: reason, date: new Date().toLocaleDateString() });

            writeDB(db);
            return interaction.reply({ content: `🌟 **Vouch Added!** You vouched for ${target} for: *"${reason}"*. Total score: **${db.vouches[target.id].count}**.` });
        }

        if (sub === 'leaderboard') {
            const sorted = Object.entries(db.vouches)
                .sort((a, b) => b[1].count - a[1].count)
                .slice(0, 10);

            if (sorted.length === 0) {
                return interaction.reply({ content: "📜 No vouches have been submitted yet!" });
            }

            const embed = new EmbedBuilder()
                .setTitle('🌟 BloxDen Trust & Vouch Leaderboard')
                .setColor('#F1C40F')
                .setTimestamp();

            let description = "";
            for (let i = 0; i < sorted.length; i++) {
                const [userId, data] = sorted[i];
                description += `**#${i + 1}** <@${userId}> — \`${data.count} Vouches\`\n`;
            }
            embed.setDescription(description);

            return interaction.reply({ embeds: [embed] });
        }
    }
};
