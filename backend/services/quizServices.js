const { GoogleGenAI } = require("@google/genai");
const generateQuizService = async (topic, count, difficulty) => {
    if (!topic) {
        throw new Error('Please provide a topic');
    }
    const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY
    });
    const model = "gemma-3-27b-it";
    const prompt = `Generate a ${count}-question multiple-choice quiz about "${topic}". The difficulty level should be ${difficulty}.
Return ONLY a raw, valid JSON array of objects. Do not use markdown blocks or backticks.
Each object should have this exact structure:
{
  "q": "The question text",
  "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
  "answer": 0 
}`;
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt
        });
        console.log("Quiz Generated:", response.text);
        let text = response.text.trim();
        if (text.startsWith('```json')) text = text.substring(7);
        if (text.startsWith('```')) text = text.substring(3);
        if (text.endsWith('```')) text = text.substring(0, text.length - 3);
        text = text.trim();
        return JSON.parse(text);
    } catch (error) {
        console.error("Error generating quiz:", error.message);
        console.log("Serving fallback questions due to API error.");
        return Array.from({ length: count }, (_, i) => ({
            "q": `[${difficulty.toUpperCase()}] Fallback Question ${i + 1} about ${topic}?`,
            "options": ["A core principle", "A random idea", "A historical event", "None of the above"],
            "answer": 0
        }));
    }
};
module.exports = {
    generateQuizService
};
