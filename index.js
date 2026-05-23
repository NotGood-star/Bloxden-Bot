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
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

const commands = [
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
    .setName('ban')
    .setDescription('Ban a member')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to ban')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a member')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to kick')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    console.log('Registering slash commands...');

    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );

    console.log('Slash commands registered!');
  } catch (error) {
    console.error(error);
  }
})();

client.once('ready', () => {
  console.log(`${client.user.tag} is online!`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'ping') {
    await interaction.reply('Pong!');
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

    await interaction.reply(response);
  }

  if (interaction.commandName === 'joke') {
    await interaction.reply(
      'Why did the developer go broke? Because he used up all his cache!'
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

  if (interaction.commandName === 'ban') {
    const user = interaction.options.getUser('user');

    const member =
      interaction.guild.members.cache.get(user.id);

    if (!member) {
      return interaction.reply('User not found.');
    }

    await member.ban();

    await interaction.reply(`${user.tag} has been banned.`);
  }

  if (interaction.commandName === 'kick') {
    const user = interaction.options.getUser('user');

    const member =
      interaction.guild.members.cache.get(user.id);

    if (!member) {
      return interaction.reply('User not found.');
    }

    await member.kick();

    await interaction.reply(`${user.tag} has been kicked.`);
  }
});

client.login(TOKEN);
