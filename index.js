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

dotenv.config();

// Initialize the Discord Client with required gateway permissions
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

// Global Brand Palette for Bot Embed Layouts
client.colors = {
    success: 0x2ECC71, // Green
    error: 0xE74C3C,   // Red
    info: 0x3498DB,    // Blue
    warning: 0xF1C40F  // Yellow
};

// Dynamically read and load command files from subfolders
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    
    // Skip any plain files inside the commands folder to prevent crashing
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

// Client Connected Event (Upgraded from 'ready' to 'ClientReady')
client.once(Events.ClientReady, () => {
    console.log(`🚀 ${client.user.tag} is online and running with Embeds!`);
});

// Interaction Listener for Slash Commands
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error('Command Execution Error:', error);
        
        const errorEmbed = new EmbedBuilder()
            .setColor(client.colors.error)
            .setTitle('💥 Execution Error')
            .setDescription('There was an internal error while trying to run this command.')
            .setTimestamp();

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
        } else {
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
});

// 🤖 AUTOMOD & LOGGING ENGINE
client.on(Events.MessageCreate, async message => {
    if (message.author.bot || !message.guild) return;

    // Anti-Link Protection Rule
    if (message.content.includes('http://') || message.content.includes('https://')) {
        try {
            await message.delete();
            
            const warnEmbed = new EmbedBuilder()
                .setColor(client.colors.warning)
                .setAuthor({ name: 'AutoMod Protection', iconURL: client.user.displayAvatarURL() })
                .setDescription(`⚠️ ${message.author}, posting links is restricted in this channel.`)
                .setTimestamp();

            const warningMsg = await message.channel.send({ embeds: [warnEmbed] });
            // Automatically clean up the bot's warning message after 6 seconds
            setTimeout(() => warningMsg.delete().catch(() => null), 6000);
        } catch (err) {
            console.error('Failed to manage AutoMod deletion:', err.message);
        }
    }
});

client.login(process.env.TOKEN);
