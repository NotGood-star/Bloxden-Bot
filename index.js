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

// Brand colors for Bloxden Bot consistency
client.colors = {
    success: 0x2ECC71, // Green
    error: 0xE74C3C,   // Red
    info: 0x3498DB,    // Blue
    warning: 0xF1C40F  // Yellow
};

// Dynamically read and load commands
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

client.once('ready', () => {
    console.log(`🚀 ${client.user.tag} is online and running with Embeds!`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        
        const errorEmbed = new EmbedBuilder()
            .setColor(client.colors.error)
            .setTitle('💥 Execution Error')
            .setDescription('There was an internal error while running this command.')
            .setTimestamp();

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
        } else {
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
});

// 🤖 AUTOMOD SYSTEM (Upgraded with Embed Warning)
client.on('messageCreate', async message => {
    if (message.author.bot) return;

    // Anti-Link Rule
    if (message.content.includes('http://') || message.content.includes('https://')) {
        await message.delete();
        
        const warnEmbed = new EmbedBuilder()
            .setColor(client.colors.warning)
            .setAuthor({ name: 'AutoMod Protection', iconURL: client.user.displayAvatarURL() })
            .setDescription(`⚠️ ${message.author}, links are not permitted in this channel.`)
            .setTimestamp();

        return message.channel.send({ embeds: [warnEmbed] });
    }
});

client.login(process.env.TOKEN);
