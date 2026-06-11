// ==========================================
// CENTRAL CONFIGURATION & MODULE IMPORTS
// ==========================================
const { Client, GatewayIntentBits, Collection, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, ChannelType } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

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
            fs.writeFileSync(dbPath, JSON.stringify({ balances: {}, warnings: {}, cooldowns: {}, jobs: {}, levels: {}, vouches: {}, weeklyScores: {}, settings: {} }, null, 2));
        }
        return JSON.parse(fs.readFileSync(dbPath, 'utf8') || '{}');
    } catch (error) {
        return { balances: {}, warnings: {}, cooldowns: {}, jobs: {}, levels: {}, vouches: {}, weeklyScores: {}, settings: {} };
    }
}

function writeDatabase(data) {
    try { fs.writeFileSync(dbPath, JSON.stringify(data, null, 2)); } catch (e) {}
}

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
// EVENT: CONVERSATIONAL FRIENDLY AI EMBED HANDLER
// ==========================================
client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return;

    if (message.mentions.has(client.user.id) && !message.mentions.everyone) {
        
        if (!process.env.GEMINI_API_KEY) {
            const errorEmbed = new EmbedBuilder()
                .setColor(client.colors.error)
                .setDescription("⚙️ My AI conversational core isn't turned on yet! Make sure the \`GEMINI_API_KEY\` is saved in your Render Environment settings.");
            return message.reply({ embeds: [errorEmbed] });
        }

        await message.channel.sendTyping();

        const userPrompt = message.content.replace(/<@!?\d+>/g, '').trim();

        if (!userPrompt) {
            const waveEmbed = new EmbedBuilder()
                .setColor(client.colors.info)
                .setDescription("👋 Yo! What's up bro? Ask me anything about games, anime, Rivals, or whatever's on your mind! Just type your question alongside my ping!");
            return message.reply({ embeds: [waveEmbed] });// ==========================================
// EVENT: CONVERSATIONAL FRIENDLY AI EMBED HANDLER
// ==========================================
client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return;

    if (message.mentions.has(client.user.id) && !message.mentions.everyone) {
        
        if (!process.env.GEMINI_API_KEY) {
            const errorEmbed = new EmbedBuilder()
                .setColor(client.colors.error)
                .setDescription("⚙️ My AI conversational core isn't turned on yet! Make sure the `GEMINI_API_KEY` is saved in your Render Environment settings.");
            return message.reply({ embeds: [errorEmbed] });
        }

        await message.channel.sendTyping();

        const userPrompt = message.content.replace(/<@!?\d+>/g, '').trim();

        if (!userPrompt) {
            const waveEmbed = new EmbedBuilder()
                .setColor(client.colors.info)
                .setDescription("👋 Yo! What's up bro? Ask me anything about games, anime, Rivals, or whatever's on your mind! Just type your question alongside my ping!");
            return message.reply({ embeds: [waveEmbed] });
        }

        try {
            // FIXED ENDPOINT LINE RIGHT HERE: Added "-latest"
            const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`;
            
            const systemInstruction = "You are BloxDen Bot, but you talk exactly like a close friend, bro, or helpful peer. Do not talk like a rigid, robotic assistant. Be authentic, hype up gaming discussions (especially Roblox, Rivals, and anime), give witty, clear, and relaxed answers, and match the user's energy completely. Keep responses concise so they fit naturally in chat.";

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: userPrompt }] }],
                    systemInstruction: { parts: [{ text: systemInstruction }] }
                })
            });

            const data = await response.json();

            if (!response.ok || !data.candidates || !data.candidates[0]?.content?.parts[0]?.text) {
                throw new Error(data.error?.message || 'Empty or invalid payload architecture returned from Google Gateway.');
            }

            let aiResponse = data.candidates[0].content.parts[0].text;

            if (aiResponse.length > 4000) aiResponse = aiResponse.substring(0, 3995) + "...";

            // Format the friendly answer into your clean, modern Discord Embed frame
            const friendEmbed = new EmbedBuilder()
                .setColor('#3498DB')
                .setAuthor({ name: `BloxDen Buddy Core`, iconURL: client.user.displayAvatarURL() })
                .setDescription(aiResponse)
                .setFooter({ text: `Replying to ${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setTimestamp();

            return message.reply({ embeds: [friendEmbed] });

        } catch (error) {
            console.error('📊 [DETAILED AI LOG]:', error);

            const fallbackEmbed = new EmbedBuilder()
                .setColor(client.colors.warn)
                .setTitle('⚠️ Google Network Intercept')
                .setDescription(
                    `Yo! Google's server gateway is still actively dropping our hosting connection handshake.\n\n` +
                    `**How to fix this instantly:**\n` +
                    `1. Head over to [Google AI Studio](https://aistudio.google.com/).\n` +
                    `2. Look at your API key list. If the active key says it belongs to a pre-existing project space, delete it.\n` +
                    `3. Click **Create API Key ➡️ Create API Key in new project** to force-generate a completely fresh, unthrottled personal key payload.`
                );

            return message.reply({ embeds: [fallbackEmbed] });
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
