const { Client, GatewayIntentBits, Collection, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, ChannelType } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => res.send('📡 System Operational'));
app.listen(PORT);

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.commands = new Collection();
client.colors = { info: '#3498DB', success: '#2ECC71', error: '#E74C3C' };

// Load Commands
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

client.once('ready', () => console.log(`🚀 Online: ${client.user.tag}`));

client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (command) try { await command.execute(interaction); } catch (e) { console.error(e); }
    }

    if (interaction.isButton()) {
        // TICKET SYSTEM WITH EMBEDS
        if (interaction.customId === 'create_ticket') {
            await interaction.deferReply({ ephemeral: true });
            
            const ticketChannel = await interaction.guild.channels.create({
                name: `ticket-${interaction.user.username}`,
                type: ChannelType.GuildText,
                permissionOverwrites: [{ id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] }, { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }]
            });

            const embed = new EmbedBuilder()
                .setColor(client.colors.success)
                .setTitle('🎫 Ticket Opened')
                .setDescription(`Support request created for ${interaction.user}. A staff member will be with you shortly.`);
            
            await ticketChannel.send({ embeds: [embed] });
            await interaction.editReply({ content: `✅ Ticket created: ${ticketChannel}` });
        }

        if (interaction.customId === 'close_ticket') {
            await interaction.deferReply();
            const embed = new EmbedBuilder()
                .setColor(client.colors.error)
                .setTitle('🔒 Ticket Closed')
                .setDescription('This ticket has been locked by staff.');
            await interaction.editReply({ embeds: [embed] });
        }
    }
});

client.login(process.env.TOKEN);
