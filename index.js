const { Client, GatewayIntentBits, Collection, EmbedBuilder } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const dotenv = require('dotenv');

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

// Dynamically read and load commands from folders
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        }
    }
}

// 🤖 ON READY
client.once('ready', () => {
    console.log(`🚀 ${client.user.tag} is online and guarding Bloxden!`);
});

// ⚡ INTERACTION HANDLER (Executes Slash Commands)
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error executing this command!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error executing this command!', ephemeral: true });
        }
    }
});

// 🛡️ AUTOMOD & LOGGING SYSTEM (Example Triggers)
client.on('messageCreate', async message => {
    if (message.author.bot) return;

    // Basic Anti-Link System
    if (message.content.includes('http://') || message.content.includes('https://')) {
        // Exclude trusted links if necessary
        await message.delete();
        return message.channel.send(`⚠️ ${message.author}, links are not allowed here! (Anti-Link System)`);
    }

    // Basic Anti-Spam System (Caps Spam Example)
    const capsCount = message.content.replace(/[^A-Z]/g, "").length;
    if (capsCount > 15 && message.content.length > 20) {
        await message.delete();
        return message.channel.send(`⚠️ ${message.author}, please stop spamming caps.`);
    }
});

// 💬 LOG SYSTEM: Message Delete Logs
client.on('messageDelete', async message => {
    if (!message.guild || message.author?.bot) return;
    console.log(`🗑️ Message by ${message.author.tag} was deleted in #${message.channel.name}: "${message.content}"`);
    // In production, you would fetch a saved log channel ID and send an embed here.
});

client.login(process.env.TOKEN);
