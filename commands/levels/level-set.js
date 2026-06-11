const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

const dbPath = path.join(__dirname, '../../database.json');
function readDB() { return JSON.parse(fs.readFileSync(dbPath, 'utf8') || '{}'); }
function writeDB(data) { fs.writeFileSync(dbPath, JSON.stringify(data, null, 2)); }

module.exports = {
    data: new SlashCommandBuilder()
        .setName('level')
        .setDescription('Configure leveling announcement variables')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(sub =>
            sub.setName('set-channel')
                .setDescription('Set the channel where level-up alerts are posted')
                .addChannelOption(opt => opt.setName('channel').setDescription('The chat feed channel').addChannelTypes(ChannelType.GuildText).setRequired(true))
        ),
    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');
        const db = readDB();
        
        if (!db.settings) db.settings = {};
        db.settings.levelChannel = channel.id;
        
        writeDB(db);
        return interaction.reply({ content: `🎯 Level up announcements will now be directed to ${channel}!` });
    }
};
