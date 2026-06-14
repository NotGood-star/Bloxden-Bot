require('dotenv').config();
const { Client, GatewayIntentBits, Collection, Events, EmbedBuilder, ChannelType } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const express = require('express');
const cron = require('node-cron');
const db = require('./database.js');

// 1. Web Server (Keep-Alive)
const app = express();
app.get('/', (req, res) => res.send('Bot is active!'));
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
        for (const file of fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'))) {
            const command = require(path.join(commandsPath, file));
            if ('data' in command && 'execute' in command) client.commands.set(command.data.name, command);
        }
    }
}

// 4. Events
client.once(Events.ClientReady, () => {
    db.loadDatabase();
    console.log(`🚀 Online as ${client.user.tag}`);
});

// A. Leveling System
client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot || !message.guild) return;
    const userId = message.author.id;
    if (db.xpCooldowns.has(userId)) return;

    const newXp = (db.xp.get(userId) || 0) + Math.floor(Math.random() * 10) + 5;
    db.xp.set(userId, newXp);
    
    const lvl = db.levels.get(userId) || 1;
    if (newXp >= lvl * 500) {
        db.levels.set(userId, lvl + 1);
        db.xp.set(userId, 0);
        const chanId = db.systemChannels.get(`${message.guild.id}-levels`);
        const chan = message.guild.channels.cache.get(chanId);
        if (chan) chan.send(`🎉 ${message.author} leveled up to **Level ${lvl + 1}**!`);
    }

    db.xpCooldowns.set(userId, true);
    setTimeout(() => db.xpCooldowns.delete(userId), 60000);
    db.saveDatabase();
});

// B. Welcome / Goodbye
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

// C. Weekly Leaderboard (Sunday at 12:00 PM)
cron.schedule('0 12 * * 0', async () => {
    client.guilds.cache.forEach(async (guild) => {
        const chan = guild.channels.cache.get(db.systemChannels.get(`${guild.id}-levels`));
        if (!chan) return;
        const sorted = [...db.levels.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
        const desc = sorted.map((u, i) => `${i + 1}. <@${u[0]}> - Level ${u[1]}`).join('\n');
        chan.send({ embeds: [new EmbedBuilder().setTitle('🏆 Weekly XP Leaderboard').setDescription(desc || 'No data')] });
    });
});

// D. Interaction Handler
client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isChatInputCommand()) {
        const cmd = client.commands.get(interaction.commandName);
        if (cmd) try { await cmd.execute(interaction); } catch (e) { console.error(e); }
    } else if (interaction.isButton() && interaction.customId === 'create_ticket') {
        await interaction.deferReply({ ephemeral: true });
        const ch = await interaction.guild.channels.create({ name: `ticket-${interaction.user.username}`, type: ChannelType.GuildText });
        await interaction.editReply({ content: `✅ Ticket created: ${ch}` });
    }
});

client.login(process.env.TOKEN);
