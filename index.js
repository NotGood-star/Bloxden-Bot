require('dotenv').config();
const { Client, GatewayIntentBits, Collection, EmbedBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const mongoose = require('mongoose');
const express = require('express');

// --- 1. Database Setup ---
const SettingsSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    customBotName: { type: String, default: 'BloxDen' }
});
const Settings = mongoose.model('Settings', SettingsSchema);

// --- 2. Web Dashboard Server ---
const app = express();
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => res.send('<h2>BloxDen Status: Online</h2><p>Dashboard ready for configuration.</p>'));
app.listen(PORT, () => console.log(`🌐 Web Dashboard running on port ${PORT}`));

// --- 3. Bot Initialization ---
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();
client.colors = { info: '#3498DB', success: '#2ECC71', error: '#E74C3C' };

// --- 4. Load Commands ---
const foldersPath = path.join(__dirname, 'commands');
if (fs.existsSync(foldersPath)) {
    for (const folder of fs.readdirSync(foldersPath)) {
        const commandsPath = path.join(foldersPath, folder);
        if (fs.statSync(commandsPath).isDirectory()) {
            for (const file of fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'))) {
                const command = require(path.join(commandsPath, file));
                if ('data' in command && 'execute' in command) client.commands.set(command.data.name, command);
            }
        }
    }
}

// --- 5. Bot Events ---
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
        // Fetch custom name from Database
        const settings = await Settings.findOne({ guildId: interaction.guild.id });
        const botName = settings ? settings.customBotName : 'BloxDen';

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
                .setAuthor({ name: botName }) // Uses database name
                .setTitle('🎫 Ticket Opened')
                .setDescription(`Support request created for ${interaction.user}. A staff member will be with you shortly.`);
            
            await ticketChannel.send({ embeds: [embed] });
            await interaction.editReply({ content: `✅ Ticket created: ${ticketChannel}` });
        }
    }
});

// --- 6. Start Everything ---
async function start() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');
        await client.login(process.env.TOKEN);
    } catch (err) {
        console.error('❌ Startup Error:', err);
    }
}

start();
