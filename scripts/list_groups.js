const axios = require('axios');
const config = require('./config');

async function listGroups() {
    const url = `${config.ULTRAMSG_API_URL}groups?token=${config.ULTRAMSG_TOKEN}`;
    try {
        const response = await axios.get(url);
        console.log("Groups Found:");
        response.data.forEach(g => {
            console.log(`- Name: ${g.name}, ID: ${g.id}`);
        });
    } catch (error) {
        console.error("Error fetching groups:", error.message);
    }
}

listGroups();
