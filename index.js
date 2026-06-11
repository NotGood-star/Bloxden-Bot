const { Client, GatewayIntentBits, Collection, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, ChannelType } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000;
app.get('/', (req, res) => res.send('BloxDen Online'));
app.listen(PORT);

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.on('ready', () => console.log(`🚀 Online: ${client.user.tag}`));

client.on('messageCreate', async message => {
    if (message.author.bot || !message.mentions.has(client.user.id)) return;

    await message.channel.sendTyping();
    const userPrompt = message.content.replace(/<@!?\d+>/g, '').trim();

    try {
        // FINAL PRODUCTION ENDPOINT
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
        
        const systemPersona = "You are BloxDen Bot, a close friend and gaming enthusiast. Talk casually, use 'bro', be hype about games/anime, and keep answers concise.";

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `${systemPersona}\n\nUser: ${userPrompt}` }] }]
            })
        });

        const data = await response.json();
        const aiResponse = data.candidates[0].content.parts[0].text;

        const embed = new EmbedBuilder()
            .setColor('#3498DB')
            .setAuthor({ name: 'BloxDen Buddy', iconURL: client.user.displayAvatarURL() })
            .setDescription(aiResponse.substring(0, 4000));

        await message.reply({ embeds: [embed] });
    } catch (error) {
        console.error('Final Error Log:', error);
        await message.reply("Yo bro, I'm having a connection glitch. Check the logs!");
    }
});

client.login(process.env.TOKEN);
