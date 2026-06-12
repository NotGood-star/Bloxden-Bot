require('dotenv').config();
const { Client, GatewayIntentBits, Collection, EmbedBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const express = require('express');

// --- 1. Web Dashboard Server ---
const app = express();
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => res.send('<h2>BloxDen Status: Online</h2><p>Dashboard ready for configuration.</p>'));
app.listen(PORT, () => console.log(`🌐 Web Dashboard running on port ${PORT}`));

// --- 2. Bot Initialization ---
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();
client.colors = { info: '#3498DB', success: '#2ECC71', error: '#E74C3C' };

// --- 3. Load Commands ---
const foldersPath = path.join(__dirname, 'commands');
if (fs.existsSync(foldersPath)) {
    for (const folder of fs.readdirSync(foldersPath)) {
        const commandsPath = path.join(__dirname, 'commands', folder);
        if (fs.statSync(commandsPath).isDirectory()) {
            for (const file of fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'))) {
                const command = require(path.join(commandsPath, file));
                if ('data' in command && 'execute' in command) client.commands.set(command.data.name, command);
            }
        }
    }
}

// --- 4. Bot Events ---
client.once('ready', () => {
    console.log(`🚀 Online as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
    // Command Handling
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (command) try { await command.execute(interaction); } catch (e) { console.error(e); }
    }

    // Button Interaction Handling
    if (interaction.isButton()) {
        // Database removed: Using hardcoded name
        const botName = 'BloxDen';

        if (interaction.customId === 'create_ticket') {
            await interaction.deferReply({ ephemeral: true });
            const ticketChannel = await interaction.guild.channels.create({
                name: `ticket-${interaction.user.username}`,
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                    { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }
                ]
            });

            const embed = new EmbedBuilder()
                .setColor(client.colors.success)
                .setAuthor({ name: botName }) 
                .setTitle('🎫 Ticket Opened')
                .setDescription(`Support request created for ${interaction.user}. A staff member will be with you shortly.`);
            
            await ticketChannel.send({ embeds: [embed] });
            await interaction.editReply({ content: `✅ Ticket created: ${ticketChannel}` });
        }
    }
});

// --- 5. Start Everything ---
async function start() {
    try {
        // Database connection logic removed
        await client.login(process.env.TOKEN);
        console.log('✅ Bot logged in successfully');
    } catch (err) {
        console.error('❌ Startup Error:', err);
    }
}

start();
