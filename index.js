// ==========================================
// CENTRAL CONFIGURATION & MODULE IMPORTS
// ==========================================
const { Client, GatewayIntentBits, Collection, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, ChannelType } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai'); // Fixed constructor layout
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

// Initialize the Google AI client using your secure Render Environment variable
let aiEngine;
if (process.env.GEMINI_API_KEY) {
    aiEngine = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); // Fixed initialization syntax
} else {
    console.error("⚠️ [WARNING] GEMINI_API_KEY environment variable is missing from Render settings!");
}

// ==========================================
// 📡 RENDER PORT BINDER (KEEP-ALIVE ENGINE)
// ==========================================
const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => {
    res.send('📡 BloxDen Bot Engine Status: FULLY OPERATIONAL 24/7');
});

app.listen(PORT, () => {
    console.log(`📡 Render Port Binder: Successfully listening on port ${PORT}`);
});

// ==========================================
// DISCORD BOT CLIENT INITIALIZATION
// ==========================================
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildBans
    ]
});

client.commands = new Collection();
client.snipes = new Map();

client.colors = {
    info: '#3498DB',
    success: '#2ECC71',
    error: '#E74C3C',
    warn: '#F1C40F'
};

// ==========================================
// PERSISTENT JSON DATABASE ENGINE (Anti-Wipe)
// ==========================================
const dbPath = path.join(__dirname, 'database.json');

function readDatabase() {
    try {
        if (!fs.existsSync(dbPath)) {
            fs.writeFileSync(dbPath, JSON.stringify({ balances: {}, warnings: {}, cooldowns: {}, jobs: {} }, null, 2));
        }
        return JSON.parse(fs.readFileSync(dbPath, 'utf8') || '{}');
    } catch (error) {
        return { balances: {}, warnings: {}, cooldowns: {}, jobs: {} };
    }
}

function writeDatabase(data) {
    try { fs.writeFileSync(dbPath, JSON.stringify(data, null, 2)); } catch (e) {}
}

client.db = {
    getBalance: (userId) => { const db = readDatabase(); return db.balances?.[userId] ?? 0; },
    setBalance: (userId, amount) => { const db = readDatabase(); if(!db.balances) db.balances = {}; db.balances[userId] = amount; writeDatabase(db); }
};

// ==========================================
// DYNAMIC COMMAND HANDLER & DIRECTORY LOADER
// ==========================================
const foldersPath = path.join(__dirname, 'commands');
if (fs.existsSync(foldersPath)) {
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
}

client.once('ready', () => {
    console.log(`🚀 System Online! Authenticated as: ${client.user.tag}`);
    client.user.setActivity('over BloxDen Community', { type: 3 });
});

client.on('messageDelete', message => {
    if (message.author?.bot || !message.guild) return;
    client.snipes.set(message.channelId, {
        content: message.content,
        author: message.author.tag,
        avatar: message.author.displayAvatarURL({ dynamic: true }),
        time: new Date().toLocaleTimeString()
    });
});

// ==========================================
// EVENT: NATURAL CONVERSATIONAL AI PING HANDLER
// ==========================================
client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return;

    // Trigger chat response only if the bot is directly mentioned/pinged
    if (message.mentions.has(client.user.id) && !message.mentions.everyone) {
        
        // Safety lock check if the key was forgotten or misconfigured
        if (!process.env.GEMINI_API_KEY || !aiEngine) {
            return message.reply("⚙️ My AI conversational core isn't turned on yet. Please verify that the `GEMINI_API_KEY` variable is added to Render!");
        }

        await message.channel.sendTyping();

        // Strip out the bot ping format to leave pure prompt text
        const userPrompt = message.content.replace(/<@!?\d+>/g, '').trim();

        if (!userPrompt) {
            return message.reply("👋 Hey! What's on your mind? Mention me along with your message to chat!");
        }

        try {
            // Using stable Gemini generation methods
            const model = aiEngine.getGenerativeModel({ 
                model: 'gemini-1.5-flash',
                systemInstruction: "You are BloxDen Bot, a helpful, witty, and friendly AI community assistant for the BloxDen Roblox community. Answer conversationally, clearly, and keep messages concise enough to fit naturally within a Discord chat environment."
            });

            const result = await model.generateContent(userPrompt);
            const aiResponse = result.response.text();

            if (aiResponse.length > 2000) {
                return message.reply(aiResponse.substring(0, 1999));
            }
            return message.reply(aiResponse);

        } catch (error) {
            console.error('Gemini Interaction Fault:', error);
            return message.reply("🤖 *Bzzzt...* My conversational neural core encountered an issue reaching Google. Try talking to me again in a moment!");
        }
    }
});

// ==========================================
// EVENT: INTERACTION EXECUTION GATEWAY
// ==========================================
client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
        }
    }

    // Ticket Button Interfaces
    if (interaction.isButton()) {
        if (interaction.customId === 'create_ticket') {
            await interaction.deferReply({ ephemeral: true });
            const cleanUserString = interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, '');
            const existingChannel = interaction.guild.channels.cache.find(c => c.name === `ticket-${cleanUserString}`);
            
            if (existingChannel) {
                return interaction.editReply({ content: `❌ You already have an open ticket here: ${existingChannel}` });
            }

            try {
                const ticketChannel = await interaction.guild.channels.create({
                    name: `ticket-${cleanUserString}`,
                    type: ChannelType.GuildText,
                    permissionOverwrites: [
                        { id: interaction.guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
                        { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles, PermissionFlagsBits.ReadMessageHistory] },
                        { id: client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels] }
                    ],
                });

                const controlEmbed = new EmbedBuilder()
                    .setColor(client.colors.success)
                    .setTitle('🎫 Ticket Created')
                    .setDescription(`Support console deployed. Describe your issue or request here, ${interaction.user}.`)
                    .setTimestamp();

                const controlRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('close_ticket').setLabel('Close').setEmoji('🔒').setStyle(ButtonStyle.Danger)
                );

                await ticketChannel.send({ content: `👋 ${interaction.user}`, embeds: [controlEmbed], components: [controlRow] });
                return interaction.editReply({ content: `🎉 Ticket created: ${ticketChannel}` });
            } catch (e) {
                return interaction.editReply({ content: '❌ Ticket initialization failed.' });
            }
        }

        if (interaction.customId === 'close_ticket') {
            await interaction.deferReply();
            const userField = interaction.channel.name.replace('ticket-', '');
            const targetMember = interaction.guild.members.cache.find(m => m.user.username.toLowerCase().replace(/[^a-z0-9]/g, '') === userField);
            if (targetMember) {
                await interaction.channel.permissionOverwrites.edit(targetMember.id, { SendMessages: false, ViewChannel: true });
            }
            const closedEmbed = new EmbedBuilder().setColor(client.colors.error).setTitle('🔒 Ticket Closed').setDescription('Thread locked.');
            const managementRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('reopen_ticket').setLabel('Reopen').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('delete_ticket').setLabel('Delete').setStyle(ButtonStyle.Danger)
            );
            return interaction.editReply({ embeds: [closedEmbed], components: [managementRow] });
        }

        if (interaction.customId === 'reopen_ticket') {
            await interaction.deferReply();
            const userField = interaction.channel.name.replace('ticket-', '');
            const targetMember = interaction.guild.members.cache.find(m => m.user.username.toLowerCase().replace(/[^a-z0-9]/g, '') === userField);
            if (targetMember) {
                await interaction.channel.permissionOverwrites.edit(targetMember.id, { SendMessages: true, ViewChannel: true });
            }
            await interaction.editReply({ content: '🔓 Ticket access restored.', components: [] });
        }

        if (interaction.customId === 'delete_ticket') {
            await interaction.reply({ content: '⚠️ Deleting in 5 seconds...' });
            setTimeout(async () => { try { await interaction.channel.delete(); } catch (e) {} }, 5000);
        }
    }
});

client.login(process.env.TOKEN);
