    // index.js

// ==================== RENDER KEEP-ALIVE PORT BINDING ====================
const http = require('http');
const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bloxden Bot is online and healthy!\n');
});

server.listen(PORT, () => {
    console.log(`📡 Render Port Binder: Successfully listening on port ${PORT}`);
});
// ========================================================================

const { Client, GatewayIntentBits, Collection, EmbedBuilder, Events } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const dotenv = require('dotenv');

// Import runtime states from local module cache
const { xp, levels, xpCooldowns } = require('./database.js');

dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration
    ]
});

client.commands = new Collection();

// Global Color Identity System
client.colors = {
    success: 0x2ECC71,
    error: 0xE74C3C,
    info: 0x3498DB,
    warning: 0xF1C40F
};

// Deep Scan and Load Command Subdirectories
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    
    if (!fs.statSync(commandsPath).isDirectory()) continue;

    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        }
    }
}

// Client Gateway Ready Notification
client.once(Events.ClientReady, () => {
    console.log(`🚀 ${client.user.tag} is online and running with Embeds!`);
});

// Global Application (/) Interaction Router
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error('Command Router Exception:', error);
        
        const errorEmbed = new EmbedBuilder()
            .setColor(client.colors.error)
            .setTitle('💥 Execution Error')
            .setDescription('An unhandled exception was encountered during this application action.')
            .setTimestamp();

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
        } else {
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
});

// Message Listener (Automod Filters + Leveling Processor)
client.on(Events.MessageCreate, async message => {
    if (message.author.bot || !message.guild) return;

    // 🛡️ 1. AUTOMOD ENGINE: Anti-Link Protection Block
    if (message.content.includes('http://') || message.content.includes('https://')) {
        try {
            await message.delete();
            
            const warnEmbed = new EmbedBuilder()
                .setColor(client.colors.warning)
                .setAuthor({ name: 'AutoMod Protection', iconURL: client.user.displayAvatarURL() })
                .setDescription(`⚠️ ${message.author}, link distribution is prohibited inside this channel.`)
                .setTimestamp();

            const warningMsg = await message.channel.send({ embeds: [warnEmbed] });
            setTimeout(() => warningMsg.delete().catch(() => null), 6000);
            return; // Halt logic processing so users don't get XP for links
        } catch (err) {
            console.error('AutoMod core runtime issue:', err.message);
        }
    }

    // 📈 2. PROGRESSION ENGINE: Level XP Generator
    const userId = message.author.id;
    const now = Date.now();
    const xpCooldownTime = 60000; // 1-minute tracking window throttle

    if (!xpCooldowns.has(userId) || (now - xpCooldowns.get(userId) > xpCooldownTime)) {
        const currentXP = xp.get(userId) || 0;
        const currentLevel = levels.get(userId) || 1;
        
        const gainedXP = Math.floor(Math.random() * 16) + 10; // Random range 10-25 XP
        const newXP = currentXP + gainedXP;
        const xpNeeded = currentLevel * 150;

        xp.set(userId, newXP);
        xpCooldowns.set(userId, now);

        // Process Level Up Evaluation
        if (newXP >= xpNeeded) {
            levels.set(userId, currentLevel + 1);
            xp.set(userId, newXP - xpNeeded); // Retain rollover XP residue

            const lvlUpEmbed = new EmbedBuilder()
                .setColor(client.colors.warning)
                .setDescription(`🎉 **GG ${message.author}!** You have successfully elevated to **Level ${currentLevel + 1}**!`);
            
            message.channel.send({ embeds: [lvlUpEmbed] }).then(msg => {
                setTimeout(() => msg.delete().catch(() => null), 7000);
            });
        }
    }
});

client.login(process.env.TOKEN);
