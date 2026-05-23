const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  REST,
  Routes,
  PermissionFlagsBits
} = require('discord.js');

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions
  ]
});

const commands = [

  // FUN

  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!'),

  new SlashCommandBuilder()
    .setName('8ball')
    .setDescription('Ask the magic 8ball')
    .addStringOption(option =>
      option.setName('question')
        .setDescription('Your question')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('joke')
    .setDescription('Get a random joke'),

  new SlashCommandBuilder()
    .setName('rps')
    .setDescription('Rock Paper Scissors')
    .addStringOption(option =>
      option.setName('choice')
        .setDescription('rock, paper, scissors')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('coinflip')
    .setDescription('Flip a coin'),

  new SlashCommandBuilder()
    .setName('dice')
    .setDescription('Roll a dice'),

  new SlashCommandBuilder()
    .setName('guess')
    .setDescription('Guess a number')
    .addIntegerOption(option =>
      option.setName('number')
        .setDescription('1-5')
        .setRequired(true)
    ),

  // MODERATION

  new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a member')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a member')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Timeout a member')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  // UTILITY

  new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Show server info'),

  new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Show avatar')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User')
        .setRequired(true)
    ),

  // ROBLOX

  new SlashCommandBuilder()
    .setName('robloxuser')
    .setDescription('Check Roblox username')
    .addStringOption(option =>
      option.setName('username')
        .setDescription('Username')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('bloxfruitstock')
    .setDescription('Check Blox Fruits stock'),

  // GIVEAWAYS

  new SlashCommandBuilder()
    .setName('gstart')
    .setDescription('Start giveaway')
    .addStringOption(option =>
      option.setName('prize')
        .setDescription('Prize')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('gend')
    .setDescription('End giveaway'),

  new SlashCommandBuilder()
    .setName('greroll')
    .setDescription('Reroll giveaway')

].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {

    console.log('Registering slash commands...');

    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );

    console.log('Slash commands registered!');

  } catch (err) {
    console.error(err);
  }
})();

client.once('ready', () => {
  console.log(`${client.user.tag} is online!`);
});

client.on('interactionCreate', async interaction => {

  if (!interaction.isChatInputCommand()) return;

  // FUN

  if (interaction.commandName === 'ping') {
    await interaction.reply('🏓 Pong!');
  }

  if (interaction.commandName === '8ball') {

    const replies = [
      'Yes',
      'No',
      'Maybe',
      'Definitely',
      'Never'
    ];

    const response =
      replies[Math.floor(Math.random() * replies.length)];

    await interaction.reply(`🎱 ${response}`);
  }

  if (interaction.commandName === 'joke') {

    await interaction.reply(
      '😂 Why did the developer go broke? Because he used up all his cache!'
    );
  }

  if (interaction.commandName === 'rps') {

    const userChoice =
      interaction.options.getString('choice');

    const choices = ['rock', 'paper', 'scissors'];

    const botChoice =
      choices[Math.floor(Math.random() * choices.length)];

    await interaction.reply(
      `You chose ${userChoice} | Bot chose ${botChoice}`
    );
  }

  if (interaction.commandName === 'coinflip') {

    const result =
      Math.random() < 0.5 ? 'Heads' : 'Tails';

    await interaction.reply(`🪙 ${result}`);
  }

  if (interaction.commandName === 'dice') {

    const dice =
      Math.floor(Math.random() * 6) + 1;

    await interaction.reply(`🎲 You rolled ${dice}`);
  }

  if (interaction.commandName === 'guess') {

    const user =
      interaction.options.getInteger('number');

    const random =
      Math.floor(Math.random() * 5) + 1;

    if (user === random) {

      await interaction.reply(
        `🎉 Correct! Number was ${random}`
      );

    } else {

      await interaction.reply(
        `❌ Wrong! Number was ${random}`
      );
    }
  }

  // MODERATION

  if (interaction.commandName === 'ban') {

    const user =
      interaction.options.getUser('user');

    const member =
      interaction.guild.members.cache.get(user.id);

    if (!member)
      return interaction.reply('User not found.');

    await member.ban();

    await interaction.reply(
      `${user.tag} has been banned.`
    );
  }

  if (interaction.commandName === 'kick') {

    const user =
      interaction.options.getUser('user');

    const member =
      interaction.guild.members.cache.get(user.id);

    if (!member)
      return interaction.reply('User not found.');

    await member.kick();

    await interaction.reply(
      `${user.tag} has been kicked.`
    );
  }

  if (interaction.commandName === 'timeout') {

    const user =
      interaction.options.getUser('user');

    const member =
      interaction.guild.members.cache.get(user.id);

    if (!member)
      return interaction.reply('User not found.');

    await member.timeout(60000);

    await interaction.reply(
      `${user.tag} timed out for 1 minute.`
    );
  }

  // UTILITY

  if (interaction.commandName === 'serverinfo') {

    await interaction.reply(
      `Server: ${interaction.guild.name}\nMembers: ${interaction.guild.memberCount}`
    );
  }

  if (interaction.commandName === 'avatar') {

    const user =
      interaction.options.getUser('user');

    await interaction.reply(
      user.displayAvatarURL()
    );
  }

  // ROBLOX

  if (interaction.commandName === 'robloxuser') {

    const username =
      interaction.options.getString('username');

    await interaction.reply(
      `👤 Roblox User: ${username}`
    );
  }

  if (interaction.commandName === 'bloxfruitstock') {

    await interaction.reply(
      '🍎 Current Stock:\nRocket\nIce\nLight\nMagma'
    );
  }

  // GIVEAWAYS

  if (interaction.commandName === 'gstart') {

    const prize =
      interaction.options.getString('prize');

    const msg = await interaction.reply({
      content:
`🎉 GIVEAWAY STARTED 🎉

Prize: ${prize}

React with 🎉 to enter!`,
      fetchReply: true
    });

    await msg.react('🎉');
  }

  if (interaction.commandName === 'gend') {

    const messages =
      await interaction.channel.messages.fetch();

    const giveawayMsg =
      messages.find(m =>
        m.content.includes('GIVEAWAY STARTED')
      );

    if (!giveawayMsg)
      return interaction.reply(
        '❌ No giveaway found.'
      );

    const reaction =
      giveawayMsg.reactions.cache.get('🎉');

    const users =
      await reaction.users.fetch();

    const filtered =
      users.filter(u => !u.bot);

    if (filtered.size === 0)
      return interaction.reply(
        '❌ No participants.'
      );

    const winner =
      filtered.random();

    await interaction.reply(
      `🏆 Winner: ${winner}`
    );
  }

  if (interaction.commandName === 'greroll') {

    const messages =
      await interaction.channel.messages.fetch();

    const giveawayMsg =
      messages.find(m =>
        m.content.includes('GIVEAWAY STARTED')
      );

    if (!giveawayMsg)
      return interaction.reply(
        '❌ No giveaway found.'
      );

    const reaction =
      giveawayMsg.reactions.cache.get('🎉');

    const users =
      await reaction.users.fetch();

    const filtered =
      users.filter(u => !u.bot);

    if (filtered.size === 0)
      return interaction.reply(
        '❌ No participants.'
      );

    const winner =
      filtered.random();

    await interaction.reply(
      `🔄 New Winner: ${winner}`
    );
  }

});

client.login(TOKEN);
