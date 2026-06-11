// ==========================================
// CENTRAL CONFIGURATION & MODULE IMPORTS
// ==========================================
const { Client, GatewayIntentBits, Collection, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, ChannelType } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config(); // Loads token keys from secure server environment configuration vars

// Initialize client with proper intent flags required for message monitoring, guild interactions, and target reactions
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildBans
    ]
});

// Structural data maps attached directly to global client scope
client.commands = new Collection();
client.snipes = new Map();         // Internal memory register tracking the /snipe deletion footprints
client.warnRegistry = new Map();   // Local volatile database map holding active server infractions

// Universal brand color palette accents accessible via interaction pointers
client.colors = {
    info: '#3498DB',    // Radiant blue
    success: '#2ECC71', // Emerald green
    error: '#E74C3C',   // Crimson red
    warn: '#F1C40F'     // Amber yellow
};

// ==========================================
// DYNAMIC COMMAND HANDLER & DIRECTORY LOADER
// ==========================================
const foldersPath = path.join(__dirname, 'commands');
if (fs.existsSync(foldersPath)) {
    const commandFolders = fs.readdirSync(foldersPath);

    for (const folder of commandFolders) {
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
            
            // Validate essential structural criteria keys before loading command node
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
    
    // Set custom activity dashboard presence profile
    client.user.setActivity('over BloxDen Community', { type: 3 }); // Type 3 = Watching
});

// ==========================================
// EVENT: MESSAGE DELETE HOOK (For /snipe)
// ==========================================
client.on('messageDelete', message => {
    // Drop execution immediately if item is system-based, from a bot, or detached from server space
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

    // Isolate instances where the text strictly includes the bot's direct target ping
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
            .setFooter({ text: 'Answering pings instantly • Powered by Render' })
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

            // Safeguard to ensure a user only registers a maximum of 1 ticket instance at any single time
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
                    .setTitle(`🎫 Ticket Created: ${interaction.user.username}`)
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
                .setDescription(`This support system thread was locked by ${interaction.user}. Use commands to purge completely if cleanup is finished.`);

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
                } catch (e) { /* Channel was dropped manually ahead of schedule */ }
            }, 5000);
        }
    }
});

// ==========================================
// STARTUP BOOT INITIALIZATION INITIALIZER
// ==========================================
client.login(process.env.TOKEN);
