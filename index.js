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

// Respond with a simple status message if Render or a pinging service visits your URL
app.get('/', (req, res) => {
    res.send('📡 BloxDen Bot Engine Status: FULLY OPERATIONAL 24/7');
});

// Start listening so Render detects an open web port successfully and never times out
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

// Structural data collections
client.commands = new Collection();
client.snipes = new Map(); // Snipes can remain volatile since they are short-lived

// Universal brand color palette accents
client.colors = {
    info: '#3498DB',    // Radiant blue
    success: '#2ECC71', // Emerald green
    error: '#E74C3C',   // Crimson red
    warn: '#F1C40F'     // Amber yellow
};

// ==========================================
// PERSISTENT JSON DATABASE ENGINE (Anti-Wipe)
// ==========================================
const dbPath = path.join(__dirname, 'database.json');

// Helper function to safely read data from the JSON file
function readDatabase() {
    try {
        if (!fs.existsSync(dbPath)) {
            // Create a blank data template file if it does not exist yet
            fs.writeFileSync(dbPath, JSON.stringify({ balances: {}, warnings: {}, cooldowns: {}, jobs: {} }, null, 2));
        }
        const fileContent = fs.readFileSync(dbPath, 'utf8');
        return JSON.parse(fileContent || '{}');
    } catch (error) {
        console.error("❌ Database read failure. Using empty template payload:", error);
        return { balances: {}, warnings: {}, cooldowns: {}, jobs: {} };
    }
}

// Helper function to safely save data to the JSON file
function writeDatabase(data) {
    try {
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("❌ Database write failure:", error);
    }
}

// Global Economy & Database utility manager attached to client scope
client.db = {
    // 🪙 Balance Management
    getBalance: (userId) => {
        const db = readDatabase();
        if (db.balances === undefined) db.balances = {};
        return db.balances[userId] ?? 0; // New users start at 0 coins
    },
    setBalance: (userId, amount) => {
        const db = readDatabase();
        if (db.balances === undefined) db.balances = {};
        db.balances[userId] = amount;
        writeDatabase(db);
    },

    // ⚠️ Warn Management
    getWarnings: (userId) => {
        const db = readDatabase();
        if (db.warnings === undefined) db.warnings = {};
        return db.warnings[userId] ?? [];
    },
    addWarning: (userId, warnData) => {
        const db = readDatabase();
        if (db.warnings === undefined) db.warnings = {};
        if (!db.warnings[userId]) db.warnings[userId] = [];
        db.warnings[userId].push(warnData);
        writeDatabase(db);
        return db.warnings[userId].length;
    },

    // ⏱️ Universal Cooldowns
    getCooldown: (userId, commandName) => {
        const db = readDatabase();
        if (db.cooldowns === undefined) db.cooldowns = {};
        if (!db.cooldowns[userId]) return 0;
        return db.cooldowns[userId][commandName] ?? 0;
    },
    setCooldown: (userId, commandName, timestamp) => {
        const db = readDatabase();
        if (db.cooldowns === undefined) db.cooldowns = {};
        if (!db.cooldowns[userId]) db.cooldowns[userId] = {};
        db.cooldowns[userId][commandName] = timestamp;
        writeDatabase(db);
    },

    // 💼 Job Assignment Tracking
    getUserJob: (userId) => {
        const db = readDatabase();
        if (db.jobs === undefined) db.jobs = {};
        return db.jobs[userId] ?? null;
    },
    setUserJob: (userId, jobId) => {
        const db = readDatabase();
        if (db.jobs === undefined) db.jobs = {};
        db.jobs[userId] = jobId;
        writeDatabase(db);
    }
};

// Backwards compatibility hook for old commands referencing client.warnRegistry
client.warnRegistry = {
    get: (userId) => client.db.getWarnings(userId),
    has: (userId) => client.db.getWarnings(userId).length > 0
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
            } else {
                console.warn(`[WARNING] Command at ${filePath} is missing required data/execute frameworks.`);
            }
        }
    }
}

// ==========================================
// EVENT: CLIENT READY & STARTUP SEQUENCE
// ==========================================
client.once('ready', () => {
    console.log(`🚀 System Online! Authenticated and listening as: ${client.user.tag}`);
    client.user.setActivity('over BloxDen Community', { type: 3 }); // Type 3 = Watching
});

// ==========================================
// EVENT: MESSAGE DELETE HOOK (For /snipe)
// ==========================================
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
// EVENT: MESSAGE MENTIONS (For Bot Pings)
// ==========================================
client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return;

    if (message.mentions.has(client.user.id) && !message.mentions.everyone) {
        const pingEmbed = new EmbedBuilder()
            .setColor(client.colors.info)
            .setTitle('👋 Hey there! I\'m BloxDen')
            .setDescription(
                `Need some assistance? I am fully operational and ready to serve!\n\n` +
                `🎮 **Get Started:** Type \`/\` in chat to browse all available slash commands.\n` +
                `🛡️ **Moderation & Fun:** I have full suites for warning, kicking, and arcade games ready.\n\n` +
                `🛠️ **Need Help?** If you need direct staff assistance or found a bug, create a support thread using our \`/ticket-panel\` system!`
            )
            .setFooter({ text: 'Answering pings instantly • Powered by Render Database' })
            .setTimestamp();

        return message.reply({ 
            content: `Hello ${message.author}! You called?`, 
            embeds: [pingEmbed] 
        });
    }
});

// ==========================================
// EVENT: INTERACTION EXECUTION GATEWAY
// ==========================================
client.on('interactionCreate', async interaction => {
    // ------------------------------------------
    // SUB-ROUTINE A: SLASH COMMAND HANDLING
    // ------------------------------------------
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(`Error executing operational command node [${interaction.commandName}]:`, error);
            const errPayload = { content: '❌ There was a critical system internal code runtime fault while processing this execution loop!', ephemeral: true };
            
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(errPayload);
            } else {
                await interaction.reply(errPayload);
            }
        }
    }

    // ------------------------------------------
    // SUB-ROUTINE B: TICKET V2 BUTTON INTERFACES
    // ------------------------------------------
    if (interaction.isButton()) {
        
        // 🎫 BUTTON: CREATE NEW SUPPORT CONSOLE TICKET
        if (interaction.customId === 'create_ticket') {
            await interaction.deferReply({ ephemeral: true });

            const cleanUserString = interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, '');
            const existingChannel = interaction.guild.channels.cache.find(
                c => c.name === `ticket-${cleanUserString}`
            );
            
            if (existingChannel) {
                return interaction.editReply({ content: `❌ Access Denied: You already have an open support terminal active right here: ${existingChannel}` });
            }

            try {
                const ticketChannel = await interaction.guild.channels.create({
                    name: `ticket-${cleanUserString}`,
                    type: ChannelType.GuildText,
                    permissionOverwrites: [
                        {
                            id: interaction.guild.roles.everyone.id,
                            deny: [PermissionFlagsBits.ViewChannel],
                        },
                        {
                            id: interaction.user.id,
                            allow: [
                                PermissionFlagsBits.ViewChannel,
                                PermissionFlagsBits.SendMessages,
                                PermissionFlagsBits.AttachFiles,
                                PermissionFlagsBits.ReadMessageHistory
                            ],
                        },
                        {
                            id: client.user.id,
                            allow: [
                                PermissionFlagsBits.ViewChannel,
                                PermissionFlagsBits.SendMessages,
                                PermissionFlagsBits.ManageChannels
                            ],
                        }
                    ],
                });

                const controlEmbed = new EmbedBuilder()
                    .setColor(client.colors.success)
                    .setTitle('🎫 Ticket Created')
                    .setDescription(
                        `Welcome to your support terminal, ${interaction.user}.\n\n` +
                        'Please clearly describe your issue or inquiry below. A support team member will be with you shortly.\n\n' +
                        '**Administrative Controls:**\n' +
                        '🔒 **Close:** Lock message paths and prepare for archiving.\n' +
                        '🔓 **Reopen:** Restores typing clearance back to the ticket.'
                    )
                    .setTimestamp();

                const controlRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('close_ticket').setLabel('Close Ticket').setEmoji('🔒').setStyle(ButtonStyle.Danger)
                );

                await ticketChannel.send({ content: `👋 ${interaction.user} | Support Staff Pinned Alert`, embeds: [controlEmbed], components: [controlRow] });
                return interaction.editReply({ content: `🎉 Ticket created successfully! Head over to your private console: ${ticketChannel}` });

            } catch (error) {
                console.error('Ticket Provisioning Runtime Crash:', error);
                return interaction.editReply({ content: '❌ System Failure: Could not generate channel frameworks. Check bot permissions hierarchy.' });
            }
        }

        // 🔒 BUTTON: TERMINATE USER PERMISSIONS AND CLOSE TICKET
        if (interaction.customId === 'close_ticket') {
            await interaction.deferReply();

            const userField = interaction.channel.name.replace('ticket-', '');
            const targetMember = interaction.guild.members.cache.find(m => m.user.username.toLowerCase().replace(/[^a-z0-9]/g, '') === userField);

            if (targetMember) {
                await interaction.channel.permissionOverwrites.edit(targetMember.id, {
                    SendMessages: false,
                    ViewChannel: true 
                });
            }

            const closedEmbed = new EmbedBuilder()
                .setColor(client.colors.error)
                .setTitle('🔒 Ticket Closed & Archived')
                .setDescription(`This support system thread was locked by ${interaction.user}. Use buttons below to manage cleanup.`);

            const managementRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('reopen_ticket').setLabel('Reopen').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('delete_ticket').setLabel('Delete Room').setStyle(ButtonStyle.Danger)
            );

            return interaction.editReply({ embeds: [closedEmbed], components: [managementRow] });
        }

        // 🔓 BUTTON: RE-ENABLE USER TYPING CLEARANCE IN ARCHIVED TICKET
        if (interaction.customId === 'reopen_ticket') {
            await interaction.deferReply();

            const userField = interaction.channel.name.replace('ticket-', '');
            const targetMember = interaction.guild.members.cache.find(m => m.user.username.toLowerCase().replace(/[^a-z0-9]/g, '') === userField);

            if (targetMember) {
                await interaction.channel.permissionOverwrites.edit(targetMember.id, {
                    SendMessages: true,
                    ViewChannel: true
                });
            }

            await interaction.editReply({ content: '🔓 Ticket access rights successfully restored.', components: [] });
        }

        // 🗑️ BUTTON: NUKES CHANNEL PERMANENTLY FROM GUILD REPOSITORY
        if (interaction.customId === 'delete_ticket') {
            await interaction.reply({ content: '⚠️ Purging channel space in 5 seconds...' });
            setTimeout(async () => {
                try {
                    await interaction.channel.delete();
                } catch (e) { /* Channel was dropped ahead of schedule manually */ }
            }, 5000);
        }
    }
});

// Authenticate client
client.login(process.env.TOKEN);
