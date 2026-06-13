require('dotenv').config();
const { Client, GatewayIntentBits, Collection, Events, EmbedBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const express = require('express');
const db = require('./database.js');

// 1. Web Server for Render
const app = express();
app.get('/', (req, res) => res.send('Bot is online!'));
app.listen(process.env.PORT || 10000);

// 2. Client Setup
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();
client.colors = { success: '#2ECC71', error: '#E74C3C', info: '#3498DB' };

// 3. Load Commands
const foldersPath = path.join(__dirname, 'commands');
for (const folder of fs.readdirSync(foldersPath)) {
    const commandsPath = path.join(foldersPath, folder);
    if (fs.statSync(commandsPath).isDirectory()) {
        const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
        for (const file of commandFiles) {
            const command = require(path.join(commandsPath, file));
            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
            }
        }
    }
}

// 4. Events
client.once(Events.ClientReady, () => {
    db.loadDatabase();
    console.log(`🚀 Online as ${client.user.tag}`);
});

// A. Leveling
client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot || !message.guild) return;
    const userId = message.author.id;
    if (db.xpCooldowns.has(userId)) return;

    db.xp.set(userId, (db.xp.get(userId) || 0) + Math.floor(Math.random() * 10) + 5);
    db.xpCooldowns.set(userId, true);
    setTimeout(() => db.xpCooldowns.delete(userId), 60000);
    db.saveDatabase();
});

// B. Member Join/Leave
client.on(Events.GuildMemberAdd, async (member) => {
    const channelId = db.systemChannels.get(`${member.guild.id}-welcome`);
    const channel = member.guild.channels.cache.get(channelId);
    if (channel) {
        const embed = new EmbedBuilder().setColor(client.colors.success).setTitle('👋 Welcome!').setDescription(`Welcome ${member} to the server!`);
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

// C. Interaction Handler
client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (command) try { await command.execute(interaction); } catch (e) { console.error(e); }
    } else if (interaction.isButton() && interaction.customId === 'create_ticket') {
        await interaction.deferReply({ ephemeral: true });
        const channel = await interaction.guild.channels.create({
            name: `ticket-${interaction.user.username}`,
            type: ChannelType.GuildText
        });
        await interaction.editReply({ content: `✅ Ticket created: ${channel}` });
        await channel.send({ embeds: [new EmbedBuilder().setTitle('Support Ticket').setDescription('Describe your issue.')] });
    }
});

client.login(process.env.TOKEN);
