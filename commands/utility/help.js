const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Displays a comprehensive menu of all available BloxDen commands.'),
    async execute(interaction) {
        // Universal embed styling configuration palette
        const brandColor = '#3498DB';
        const botIcon = interaction.client.user.displayAvatarURL();

        // 🏠 Dynamic Home Panel View Layout Configuration
        const mainEmbed = new EmbedBuilder()
            .setColor(brandColor)
            .setTitle('🛡️ BloxDen Core Command Central Panel')
            .setDescription(
                `Welcome to the support terminal, **${interaction.user.username}**!\n\n` +
                `Use the dropdown selection interface directly below to scan through my full catalog of features, management systems, and conversational layers.\n\n` +
                `💡 *Did you know? You can query the chat AI system at any time simply by pinging the bot directly with an interactive prompt message thread!*`
            )
            .addFields(
                { name: '📊 Summary Matrix', value: '⚙️ **47 Operational Endpoints Linked**\n📚 **5 Core Structural Framework Modules**', inline: true },
                { name: '⚡ Core Latency Core', value: `\`${interaction.client.ws.ping}ms Link Rate\``, inline: true }
            )
            .setThumbnail(botIcon)
            .setFooter({ text: 'BloxDen Assistant Suite • Select a menu group to read commands', iconURL: botIcon })
            .setTimestamp();

        // 📑 Constructing Selector Row Framework Array
        const selectionMenuRow = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('help_category_select')
                .setPlaceholder('📂 Click here to browse command categories...')
                .addOptions([
                    { label: 'Economy Matrix & Ledger', description: 'Coins, transactional systems, bets, profiles, and daily tasks.', value: 'help_eco', emoji: '🪙' },
                    { label: 'Levels & XP Progress', description: 'Monitor rank progression, grant XP pools, and track leaderboards.', value: 'help_lvl', emoji: '📈' },
                    { label: 'Moderation & Protection', description: 'Warn structures, logs, locks, bans, and community management.', value: 'help_mod', emoji: '🛡️' },
                    { label: 'Interactive Ticket Desks', description: 'Provision or close isolated user help channels.', value: 'help_tix', emoji: '🎫' },
                    { label: 'Utility, Fun & AI Tasks', description: 'Games, public community polls, and core tools.', value: 'help_util', emoji: '⚙️' }
                ])
        );

        // Render standard interface panel to active user thread
        const helpMessageInstance = await interaction.reply({
            embeds: [mainEmbed],
            components: [selectionMenuRow],
            fetchReply: true
        });

        // 📡 Internal Interactive Matrix Hook Collector Endpoint Loop
        const interactiveMenuCollector = helpMessageInstance.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            time: 300000 // UI operational lifespan threshold (5 Minutes)
        });

        interactiveMenuCollector.on('collect', async menuInteraction => {
            // Security verification checkpoint gate layer
            if (menuInteraction.user.id !== interaction.user.id) {
                return menuInteraction.reply({ content: '❌ You must launch your own standalone `/help` dashboard context frame to adjust values!', ephemeral: true });
            }

            const activeCategorySelection = menuInteraction.values[0];
            const updatedCategoryEmbed = new EmbedBuilder().setColor(brandColor).setThumbnail(botIcon).setTimestamp();

            switch (activeCategorySelection) {
                case 'help_eco':
                    updatedCategoryEmbed
                        .setTitle('🪙 Economy Matrix & Ledger Commands')
                        .setDescription('Manage user point tracking loops, balances, and server trade spaces.')
                        .addFields(
                            { name: '`/balance`', value: 'Displays your current cash reserves or a target wallet balance.' },
                            { name: '`/profile`', value: 'Shows an integrated summary card detailing economic statuses.' },
                            { name: '`/daily`', value: 'Claim your daily coin stipend award sequence.' },
                            { name: '`/beg`', value: 'Ask community channels for a handful of loose spare change.' },
                            { name: '`/work`', value: 'Execute labor tasks inside your active trade occupation path.' },
                            { name: '`/work-apply`', value: 'Browse openings and bind your profile to a new corporate job loop.' },
                            { name: '`/crime`', value: 'Attempt risky low-profile activities for a high coin payout.' },
                            { name: '`/rob`', value: 'Attempt to swipe items directly out of a target user\'s balance.' },
                            { name: '`/pay`', value: 'Wire a set amount of coins directly over to another player.' },
                            { name: '`/shop`', value: 'View available custom roles and inventory perk cards.' },
                            { name: '`/buy`', value: 'Purchase a specific perk designation list node out of the main shop.' }
                        );
                    break;

                case 'help_lvl':
                    updatedCategoryEmbed
                        .setTitle('📈 Levels & XP Progression Systems')
                        .setDescription('Track activity indexes, manage progression parameters, and reward top posters.')
                        .addFields(
                            { name: '`/rank`', value: 'Displays your active progress rank metrics card graphical overview.' },
                            { name: '`/xp add`', value: '🛡️ Grants an explicit integer volume of XP directly to a user.' },
                            { name: '`/xp remove`', value: '🛡️ Deducts an integer volume of XP out of a target profile repository.' },
                            { name: '`/weekly leaderboard-set`', value: '🛡️ Sets or overrides manual competitive point values for tracking pools.' },
                            { name: '`/level set-channel`', value: '🛡️ Locks level-up celebration alerts down to a specific tracking log channel.' }
                        );
                    break;

                case 'help_mod':
                    updatedCategoryEmbed
                        .setTitle('🛡️ Moderation & Guild Protection System')
                        .setDescription('Administrative tools to safely maintain order, discipline, and security across public chat spaces.')
                        .addFields(
                            { name: '`/warn`', value: '🛡️ Issues a formal strike warning against a disruptive user profile.' },
                            { name: '`/warn-list`', value: '🛡️ Displays historical violation strike logs compiled against a user account.' },
                            { name: '`/timeout`', value: '🛡️ Mutes a targeted profile, completely blocking message drafting capacities.' },
                            { name: '`/clear`', value: '🛡️ Purges up to 100 historical message strings out of an active room line.' },
                            { name: '`/kick`', value: '🛡️ Instantly boots a disruptive user out of the active guild server roster.' },
                            { name: '`/ban`', value: '🛡️ Hard-excludes an account record, completely blacklisting reconnects.' },
                            { name: '`/ban-list`', value: '🛡️ Lists out all user profile identifiers inside the current global restriction manifest.' },
                            { name: '`/lock`', value: '🛡️ Strips writing clearances away from the `@everyone` role on a targeted text channel.' },
                            { name: '`/unlock`', value: '🛡️ Restores writing clearances back to normal status for standard channels.' },
                            { name: '`/snipe`', value: 'Recalls the exact content layer of the most recently deleted text string in this channel room.' }
                        );
                    break;

                case 'help_tix':
                    updatedCategoryEmbed
                        .setTitle('🎫 Isolated Support Ticket System')
                        .setDescription('Manage isolated administrative consultation windows.')
                        .addFields(
                            { name: '`/ticket-panel`', value: '🛡️ Deploys the static button view widget where members click to launch a support workspace.' },
                            { name: '`/ticket`', value: 'Direct slash command configuration tool to spawn an active support workspace.' },
                            { name: '`/close`', value: 'Locks user typing access clearances inside an active help console channel room frame.' }
                        );
                    break;

                case 'help_util':
                    updatedCategoryEmbed
                        .setTitle('⚙️ Utility, Arcade Fun & Conversational AI')
                        .setDescription('Standard diagnostic features, text-to-video generators, and entertainment arrays.')
                        .addFields(
                            { name: '`/ping`', value: 'Executes a network check to determine current engine loop API response latency rates.' },
                            { name: '`/help`', value: 'Launches this multi-page visual interactive index module system.' },
                            { name: '`/support`', value: 'Provides invite coordinates linking users to the BloxDen Developer Support Server.' },
                            { name: '`/welcome-goodbye`', value: '🛡️ Binds automated membership greeting headers down to target rooms.' },
                            { name: '`/vouch add`', value: 'Log a formal trust credential vouch verification mark against a reputable dealer.' },
                            { name: '`/vouch leaderboard`', value: 'Ranks the highest trusted or certified marketplace traders on the server.' },
                            { name: '`/poll`', value: 'Builds a multi-choice public ballot box embed frame with automatic reaction tracking selectors.' },
                            { name: '`/ai`', value: 'Passes manual prompt strings directly through to your configured AI core block configuration.' },
                            { name: '`/meme`', value: 'Pulls a trending comedic image file out of community gaming subreddits.' },
                            { name: '`/rps`', value: 'Initiate a classic multi-choice Rock, Paper, Scissors game loop against the system.' },
                            { name: '`/gtn`', value: 'Spawns an interactive Guess the Number arcade sequence framework.' },
                            { name: '`/guess`', value: 'Submit an integer tracking hypothesis inside an active GTN number arcade challenge.' },
                            { name: '`/2048`', value: 'Spawns a tile sliding sequence block matrix minigame frame.' },
                            { name: '`/say`', value: '🛡️ Forces the automated bot process to repeat a provided phrase block back into the chat space.' },
                            { name: '`/giveaway`', value: '🛡️ Starts an automated prize distribution sequence framework.' },
                            { name: '`/giveaway-end`', value: '🛡️ Terminates a giveaway countdown timer early and calculates victors.' },
                            { name: '`/giveaway-reroll`', value: '🛡️ Selects a fresh random winning name out of an historical prize drawing pool.' }
                        );
                    break;
            }

            // Sync visual content modifications directly back over the parent interaction panel 
            await menuInteraction.update({ embeds: [updatedCategoryEmbed] });
        });

        // ⏱️ Auto-expire component structures to free up server RAM footprints
        interactiveMenuCollector.on('end', () => {
            const expiredRow = new ActionRowBuilder().addComponents(
                selectionMenuRow.components[0].setDisabled(true).setPlaceholder('🛑 Menu expired. Re-run /help to re-engage controls.')
            );
            helpMessageInstance.edit({ components: [expiredRow] }).catch(() => {});
        });
    }
};
