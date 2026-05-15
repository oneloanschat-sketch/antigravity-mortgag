require('dotenv').config();

module.exports = {
    PORT: process.env.PORT || 3000,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    ULTRAMSG_INSTANCE_ID: process.env.ULTRAMSG_INSTANCE_ID,
    ULTRAMSG_TOKEN: process.env.ULTRAMSG_TOKEN,
    ULTRAMSG_API_URL: `https://api.ultramsg.com/${process.env.ULTRAMSG_INSTANCE_ID}/`,
    HOT_LEADS_GROUP_ID: process.env.HOT_LEADS_GROUP_ID,
    SMALL_LOANS_GROUP_ID: process.env.SMALL_LOANS_GROUP_ID,
    BASE_URL: process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
};
