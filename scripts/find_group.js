const axios = require('axios');
const config = require('./config');

async function listGroups() {
    console.log("--- Fetching UltraMsg Groups ---");
    const url = `${config.ULTRAMSG_API_URL}groups`;

    try {
        const response = await axios.get(url, {
            params: {
                token: config.ULTRAMSG_TOKEN
            }
        });

        const groups = response.data;
        console.log(`Found ${groups.length} groups.`);

        const targetName = "טיקטק 🔥 לידים חמים 🔥";
        const found = groups.find(g => g.name.includes("טיקטק") || g.name.includes("לידים"));

        if (found) {
            console.log("\n✅ FOUND POTENTIAL MATCH:");
            console.log(`Name: ${found.name}`);
            console.log(`ID: ${found.id}`);
            console.log("--------------------------------");
        } else {
            console.log("\n❌ NO MATCH FOUND for 'טיקטק' or 'לידים'.");
            console.log("Listing all groups:");
            groups.forEach(g => console.log(`- [${g.id}] ${g.name}`));
        }

    } catch (error) {
        console.error("Error fetching groups:", error.message);
    }
}

listGroups();
