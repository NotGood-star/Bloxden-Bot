const commands = [

new SlashCommandBuilder()
.setName("help")
.setDescription("Help menu"),

new SlashCommandBuilder()
.setName("ping")
.setDescription("Ping bot"),

new SlashCommandBuilder()
.setName("joke")
.setDescription("Funny joke"),

new SlashCommandBuilder()
.setName("dice")
.setDescription("Roll dice"),

new SlashCommandBuilder()
.setName("coinflip")
.setDescription("Flip coin"),

new SlashCommandBuilder()
.setName("quote")
.setDescription("Random quote"),

new SlashCommandBuilder()
.setName("serverinfo")
.setDescription("Server info"),

new SlashCommandBuilder()
.setName("avatar")
.setDescription("Show avatar")
.addUserOption(option =>
option.setName("user")
.setDescription("User")
),

new SlashCommandBuilder()
.setName("rps")
.setDescription("Rock Paper Scissors")
.addStringOption(option =>
option.setName("choice")
.setDescription("Choice")
.setRequired(true)
.addChoices(
{ name: "rock", value: "rock" },
{ name: "paper", value: "paper" },
{ name: "scissors", value: "scissors" }
)
),

new SlashCommandBuilder()
.setName("guess")
.setDescription("Guess number")
.addIntegerOption(option =>
option.setName("number")
.setDescription("1-10")
.setRequired(true)
),

new SlashCommandBuilder()
.setName("ban")
.setDescription("Ban user")
.addUserOption(option =>
option.setName("user")
.setDescription("User")
.setRequired(true)
),

new SlashCommandBuilder()
.setName("kick")
.setDescription("Kick user")
.addUserOption(option =>
option.setName("user")
.setDescription("User")
.setRequired(true)
),

new SlashCommandBuilder()
.setName("timeout")
.setDescription("Timeout user")
.addUserOption(option =>
option.setName("user")
.setDescription("User")
.setRequired(true)
)
.addIntegerOption(option =>
option.setName("minutes")
.setDescription("Minutes")
.setRequired(true)
),

new SlashCommandBuilder()
.setName("warn")
.setDescription("Warn user")
.addUserOption(option =>
option.setName("user")
.setDescription("User")
.setRequired(true)
)
.addStringOption(option =>
option.setName("reason")
.setDescription("Reason")
),

new SlashCommandBuilder()
.setName("giveaway")
.setDescription("Start giveaway")
.addStringOption(option =>
option.setName("prize")
.setDescription("Prize")
.setRequired(true)
)
.addIntegerOption(option =>
option.setName("duration")
.setDescription("Minutes")
.setRequired(true)
)
.addIntegerOption(option =>
option.setName("winners")
.setDescription("Winners")
.setRequired(true)
),

new SlashCommandBuilder()
.setName("reroll")
.setDescription("Reroll giveaway")
.addStringOption(option =>
option.setName("messageid")
.setDescription("Message ID")
.setRequired(true)
),

new SlashCommandBuilder()
.setName("reactionrole")
.setDescription("Reaction role")
.addRoleOption(option =>
option.setName("role")
.setDescription("Role")
.setRequired(true)
),

new SlashCommandBuilder()
.setName("balance")
.setDescription("Check balance")
.addUserOption(option =>
option.setName("user")
.setDescription("User")
),

new SlashCommandBuilder()
.setName("daily")
.setDescription("Daily coins"),

new SlashCommandBuilder()
.setName("pay")
.setDescription("Pay coins")
.addUserOption(option =>
option.setName("user")
.setDescription("User")
.setRequired(true)
)
.addIntegerOption(option =>
option.setName("amount")
.setDescription("Amount")
.setRequired(true)
),

new SlashCommandBuilder()
.setName("rank")
.setDescription("Check level"),

new SlashCommandBuilder()
.setName("leaderboard")
.setDescription("Leaderboard"),

new SlashCommandBuilder()
.setName("addxp")
.setDescription("Add XP")
.addUserOption(option =>
option.setName("user")
.setDescription("User")
.setRequired(true)
)
.addIntegerOption(option =>
option.setName("amount")
.setDescription("XP")
.setRequired(true)
),

new SlashCommandBuilder()
.setName("removexp")
.setDescription("Remove XP")
.addUserOption(option =>
option.setName("user")
.setDescription("User")
.setRequired(true)
)
.addIntegerOption(option =>
option.setName("amount")
.setDescription("XP")
.setRequired(true)
),

new SlashCommandBuilder()
.setName("setlevelchannel")
.setDescription("Set level channel")
.addChannelOption(option =>
option.setName("channel")
.setDescription("Channel")
.setRequired(true)
),

new SlashCommandBuilder()
.setName("ticket")
.setDescription("Create ticket"),

new SlashCommandBuilder()
.setName("closeticket")
.setDescription("Close ticket"),

new SlashCommandBuilder()
.setName("setticketchannel")
.setDescription("Set ticket category")
.addChannelOption(option =>
option.setName("channel")
.setDescription("Channel")
.setRequired(true)
),

new SlashCommandBuilder()
.setName("invite")
.setDescription("Show invites")
.addUserOption(option =>
option.setName("user")
.setDescription("User")
),

new SlashCommandBuilder()
.setName("resetinvites")
.setDescription("Reset invites")
.addUserOption(option =>
option.setName("user")
.setDescription("User")
.setRequired(true)
),

new SlashCommandBuilder()
.setName("inviteleaderboard")
.setDescription("Invite leaderboard"),

new SlashCommandBuilder()
.setName("messages")
.setDescription("Show messages")
.addUserOption(option =>
option.setName("user")
.setDescription("User")
),

new SlashCommandBuilder()
.setName("messageleaderboard")
.setDescription("Message leaderboard")

].map(cmd => cmd.toJSON());
