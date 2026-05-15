require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.error("No API KEY found in environment!");
        return;
    }
    const genAI = new GoogleGenerativeAI(key);

    try {
        console.log("Fetching available models...");
        // Use the model endpoint directly via the generic request if getGenerativeModel doesn't have list
        // Actually, the SDK has a way, but let's try a simple generation on candidate models to see what works.
        // Or we can try to assume standard models.

        // Better approach: Test the specific failing model directly.
        const modelName = "gemini-1.5-flash";
        const model = genAI.getGenerativeModel({ model: modelName });
        console.log(`Testing generation with ${modelName}...`);
        const result = await model.generateContent("Hello");
        console.log(`Success with ${modelName}:`, result.response.text());

    } catch (error) {
        console.error("Error:", error.message);
    }

    try {
        const modelName2 = "gemini-1.5-flash-001";
        const model2 = genAI.getGenerativeModel({ model: modelName2 });
        console.log(`Testing generation with ${modelName2}...`);
        const result2 = await model2.generateContent("Hello");
        console.log(`Success with ${modelName2}:`, result2.response.text());
    } catch (error) {
        console.error(`Error with gemini-1.5-flash-001:`, error.message);
    }

    try {
        const modelName3 = "gemini-pro";
        const model3 = genAI.getGenerativeModel({ model: modelName3 });
        console.log(`Testing generation with ${modelName3}...`);
        const result3 = await model3.generateContent("Hello");
        console.log(`Success with ${modelName3}:`, result3.response.text());
    } catch (error) {
        console.error(`Error with gemini-pro:`, error.message);
    }
}

listModels();
