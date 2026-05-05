require('dotenv').config();

module.exports = {
    PORT: process.env.PORT || 3000,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    ULTRAMSG_INSTANCE_ID: process.env.ULTRAMSG_INSTANCE_ID,
    ULTRAMSG_TOKEN: process.env.ULTRAMSG_TOKEN,
    ULTRAMSG_API_URL: `https://api.ultramsg.com/${process.env.ULTRAMSG_INSTANCE_ID}/`,
    HOT_LEADS_GROUP_ID: process.env.HOT_LEADS_GROUP_ID,
    SMALL_LOANS_GROUP_ID: process.env.SMALL_LOANS_GROUP_ID,
};
