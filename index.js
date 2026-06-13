require('dotenv').config();
const { Client, GatewayIntentBits, Collection, EmbedBuilder, ChannelType, PermissionFlagsBits, Events } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const express = require('express');

// Import your database maps
const db = require('./database.js'); 

// --- 1. Web Server (Keep-Alive) ---
const app = express();
app.listen(process.env.PORT || 10000);

// --- 2. Bot Initialization ---
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers, // Essential for Welcome
        GatewayIntentBits.GuildMessages, // Essential for Leveling
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();
client.colors = { info: '#3498DB', success: '#2ECC71', error: '#E74C3C' };

// --- 3. Load Commands ---
const foldersPath = path.join(__dirname, 'commands');
for (const folder of fs.readdirSync(foldersPath)) {
    const commandsPath = path.join(__dirname, 'commands', folder);
    if (fs.statSync(commandsPath).isDirectory()) {
        for (const file of fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'))) {
            const command = require(path.join(commandsPath, file));
            if ('data' in command && 'execute' in command) client.commands.set(command.data.name, command);
        }
    }
}

// --- 4. Event Listeners ---

// Handle Leveling (Message XP)
client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;
    
    // Simple XP Logic
    const userId = message.author.id;
    if (db.xpCooldowns.has(userId)) return; // Prevent spam

    const currentXp = db.xp.get(userId) || 0;
    db.xp.set(userId, currentXp + Math.floor(Math.random() * 10) + 5);
    
    // Set cooldown (60 seconds)
    db.xpCooldowns.set(userId, true);
    setTimeout(() => db.xpCooldowns.delete(userId), 60000);
});

// Handle Welcome Message
client.on(Events.GuildMemberAdd, async (member) => {
    const channelId = db.systemChannels.get(`${member.guild.id}-welcome`);
    if (!channelId) return;
    const channel = member.guild.channels.cache.get(channelId);
    if (channel) channel.send(`Welcome to the server, ${member.user}!`);
});

// Handle Interaction (Slash Commands + Buttons)
client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (command) try { await command.execute(interaction); } catch (e) { console.error(e); }
    }
    
    if (interaction.isButton() && interaction.customId === 'create_ticket') {
        await interaction.deferReply({ ephemeral: true });
        const ticketChannel = await interaction.guild.channels.create({
            name: `ticket-${interaction.user.username}`,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }
            ]
        });
        await interaction.editReply({ content: `✅ Ticket created: ${ticketChannel}` });
    }
});

client.once(Events.ClientReady, () => {
    console.log(`🚀 Online as ${client.user.tag}`);
});

client.login(process.env.TOKEN);
