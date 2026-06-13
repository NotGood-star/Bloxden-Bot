const fs = require('fs');
const path = './database.json';

// --- 1. CORE DATA MAPS (Memory) ---
const balances = new Map();
const userJobs = new Map();
const inventories = new Map();
const xp = new Map();
const levels = new Map();
const systemChannels = new Map();

// --- 2. PERSISTENCE LOGIC ---
function saveDatabase() {
    const data = {
        balances: Object.fromEntries(balances),
        userJobs: Object.fromEntries(userJobs),
        inventories: Object.fromEntries(inventories),
        xp: Object.fromEntries(xp),
        levels: Object.fromEntries(levels),
        systemChannels: Object.fromEntries(systemChannels)
    };
    try {
        fs.writeFileSync(path, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('❌ Error saving database:', err);
    }
}

function loadDatabase() {
    if (!fs.existsSync(path)) return;
    try {
        const raw = fs.readFileSync(path, 'utf8');
        const data = JSON.parse(raw);
        
        // Populate maps from saved file
        Object.entries(data.balances || {}).forEach(([k, v]) => balances.set(k, v));
        Object.entries(data.userJobs || {}).forEach(([k, v]) => userJobs.set(k, v));
        Object.entries(data.inventories || {}).forEach(([k, v]) => inventories.set(k, v));
        Object.entries(data.xp || {}).forEach(([k, v]) => xp.set(k, v));
        Object.entries(data.levels || {}).forEach(([k, v]) => levels.set(k, v));
        Object.entries(data.systemChannels || {}).forEach(([k, v]) => systemChannels.set(k, v));
        
        console.log('✅ Database loaded successfully.');
    } catch (err) {
        console.error('❌ Failed to load database:', err);
    }
}

// --- 3. STATIC CONFIGURATIONS ---
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

const SHOP_ITEMS = {
    vip: { name: 'VIP Role', price: 35000 },
    king: { name: 'King Role', price: 50000 },
    legend: { name: 'Legend Role', price: 100000 },
    god: { name: 'God Role', price: 200000 }
};

// --- 4. EXPORTS ---
module.exports = {
    balances, userJobs, inventories, xp, levels, systemChannels,
    saveDatabase, loadDatabase,
    JOB_LIST, SHOP_ITEMS
};
