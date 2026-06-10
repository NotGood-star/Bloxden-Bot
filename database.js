// database.js

// 💵 Economy Tracking Maps
const balances = new Map();
const userJobs = new Map();
const inventories = new Map();
const workCooldowns = new Map();
const crimeCooldowns = new Map();
const robCooldowns = new Map();
const begCooldowns = new Map();

// 🎟️ Ticket System Tracking Map
const tickets = new Map();

// 📈 Leveling & Progression System Maps
const xp = new Map();
const levels = new Map();
const xpCooldowns = new Map();

// ⚙️ System Channel Redirection Maps (Welcome, Goodbye, Logs)
const systemChannels = new Map();

// 💼 The 12 Custom Job Career Tracks
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

// 🛒 Premium Badge Shop Items
const SHOP_ITEMS = {
    vip: { name: 'VIP Role', price: 35000 },
    king: { name: 'King Role', price: 50000 },
    legend: { name: 'Legend Role', price: 100000 },
    god: { name: 'God Role', price: 200000 }
};

// Exporting clean references to index.js and all command nodes
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
    JOB_LIST, 
    SHOP_ITEMS 
};
