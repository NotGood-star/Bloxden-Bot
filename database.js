// database.js

// ========================================================================
// 💵 CORE ECONOMY ENGINE MAPS
// ========================================================================
const balances = new Map();       // User wallets -> Key: userId, Value: integer (coins)
const userJobs = new Map();       // Active careers -> Key: userId, Value: string (jobId)
const inventories = new Map();    // Purchased shop items -> Key: userId, Value: array of strings
const workCooldowns = new Map();  // Cooldown timestamps for shift routines
const crimeCooldowns = new Map(); // Cooldown timestamps for risky operations
const robCooldowns = new Map();   // Cooldown timestamps for picking pockets
const begCooldowns = new Map();   // Cooldown timestamps for low-tier coin drops

// ========================================================================
// 🎟️ TICKET HELP DESK INFRASTRUCTURE MAP
// ========================================================================
const tickets = new Map();        // Ongoing support rooms -> Key: userId, Value: channelId

// ========================================================================
// 📈 LEVELING & CHAT PROGRESSION MAPS
// ========================================================================
const xp = new Map();             // Message reward points -> Key: userId, Value: integer
const levels = new Map();         // User ranking milestones -> Key: userId, Value: integer
const xpCooldowns = new Map();    // Throttles to protect against rapid message spamming

// ========================================================================
// ⚙️ AUTOMATED REGIONAL MESSAGE REDIRECTION CHANNELS
// ========================================================================
const systemChannels = new Map(); // Setup hooks -> Keys: 'guildId-welcome', 'guildId-goodbye', 'guildId-levelUp'

// ========================================================================
// 🎉 OPERATIONAL GIVEAWAY DATA MAP
// ========================================================================
const activeGiveaways = new Map(); // Monitors ongoing giveaway data pools -> Key: messageId, Value: giveaway metadata object

// ========================================================================
// 💼 CONFIGURATION DATA: THE 12 CUSTOM CAREER TRACKS
// ========================================================================
const JOB_LIST = {
    astronaut: { name: 'Astronaut 🚀', min: 800, max: 1500 },
    scientist: { name: 'Scientist 🧪', min: 600, max: 1100 },
    youtuber: { name: 'Youtuber 🎥', min: 200, max: 2000 },
    wrestler: { name: 'Wrestler 🤼', min: 400, max: 900 },
    developer: { name: 'Developer 💻', min: 500, max: 1000 },
    hacker: { name: 'Hacker 🧑‍💻', min: 300, max: 1400 },
    teacher: { name: 'Teacher 🍎', min: 300, max: 600 },
    doctor: { name: 'Doctor 🩺', min: 700, max: 1300 },
    cab_driver: { name: 'Cab Driver 🚖', min: 200, max: 500 },
    director: { name: 'Director 🎬', min: 500, max: 1100 },
    actor: { name: 'Actor 🎭', min: 400, max: 1200 },
    musician: { name: 'Musician 🎸', min: 300, max: 900 }
};

// ========================================================================
// 🛒 CONFIGURATION DATA: ECONOMY PREMIUM BADGE SHOP
// ========================================================================
const SHOP_ITEMS = {
    vip: { name: 'VIP Role', price: 35000 },
    king: { name: 'King Role', price: 50000 },
    legend: { name: 'Legend Role', price: 100000 },
    god: { name: 'God Role', price: 200000 }
};

// ========================================================================
// 📦 MODULE EXPORTS FOR CORE SYSTEM LOADING
// ========================================================================
module.exports = { 
    balances, 
    userJobs, 
    inventories, 
    workCooldowns, 
    crimeCooldowns, 
    robCooldowns, 
    begCooldowns, 
    tickets,
    xp,
    levels,
    xpCooldowns,
    systemChannels,
    activeGiveaways,
    JOB_LIST, 
    SHOP_ITEMS 
};
