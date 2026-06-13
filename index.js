require('dotenv').config();
const { Client, GatewayIntentBits, Collection, EmbedBuilder, ChannelType, PermissionFlagsBits, Events } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const express = require('express');
const db = require('./database.js'); 

// 1. Web Server (Keeps Render service alive)
const app = express();
app.listen(process.env.PORT || 10000);

// 2. Client Initialization
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();
client.colors = { info: '#3498DB', success: '#2ECC71', error: '#E74C3C' };

// 3. Command Loader
const foldersPath = path.join(__dirname, 'commands');
for (const folder of fs.readdirSync(foldersPath)) {
    const commandsPath = path.join(foldersPath, folder);
    if (fs.statSync(commandsPath).isDirectory()) {
        for (const file of fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'))) {
            const command = require(path.join(commandsPath, file));
            if ('data' in command && 'execute' in command) client.commands.set(command.data.name, command);
        }
    }
}

// 4. Event Handlers
client.once(Events.ClientReady, () => {
    console.log(`🚀 Online as ${client.user.tag}`);
});

// A. Leveling System
client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot || !message.guild) return;
    const userId = message.author.id;
    if (db.xpCooldowns.has(userId)) return;

    db.xp.set(userId, (db.xp.get(userId) || 0) + Math.floor(Math.random() * 10) + 5);
    db.xpCooldowns.set(userId, true);
    setTimeout(() => db.xpCooldowns.delete(userId), 60000);
    db.saveDatabase();
});

// B. Welcome / Goodbye System
client.on(Events.GuildMemberAdd, async (member) => {
    const channelId = db.systemChannels.get(`${member.guild.id}-welcome`);
    const channel = member.guild.channels.cache.get(channelId);
    if (channel) {
        const embed = new EmbedBuilder().setColor(client.colors.success).setTitle('👋 Welcome!').setDescription(`Welcome to the server, ${member}!`).setThumbnail(member.user.displayAvatarURL());
        channel.send({ embeds: [embed] });
    }
});

client.on(Events.GuildMemberRemove, async (member) => {
    const channelId = db.systemChannels.get(`${member.guild.id}-goodbye`);
    const channel = member.guild.channels.cache.get(channelId);
    if (channel) {
        const embed = new EmbedBuilder().setColor(client.colors.error).setTitle('🚪 Farewell').setDescription(`**${member.user.tag}** has left.`);
        channel.send({ embeds: [embed] });
    }
});

// C. Interaction Handler (Commands & Tickets)
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

client.login(process.env.TOKEN);
