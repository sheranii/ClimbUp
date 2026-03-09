const { GoogleGenAI } = require("@google/genai");

// @desc    Generate a quiz based on a topic
// @route   POST /api/quiz/generate
const generateQuiz = async (req, res) => {
    let topic = req.body.topic;
    let count = req.body.count || 4; // Default to 4
    let difficulty = req.body.difficulty || 'medium'; // Default to medium

    try {
        if (!topic) {
            return res.status(400).json({ message: 'Please provide a topic' });
        }

        // Initialize the client after environment variables are confirmed loaded
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
  "answer": 0 // The zero-based index of the correct option
}`;

        // Generate content using the new SDK syntax
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt
        });

        console.log("Quiz Generated:", response.text);
        
        let text = response.text.trim();
        
        // Clean up markdown markers if present
        if (text.startsWith('```json')) text = text.substring(7);
        if (text.startsWith('```')) text = text.substring(3);
        if (text.endsWith('```')) text = text.substring(0, text.length - 3);
        text = text.trim();
        
        const quizData = JSON.parse(text);

        res.status(200).json({ quizData });
    } catch (error) {
        console.error("Error generating quiz:", error.message);
        
        // Fallback mechanism if API limit or error is hit
        console.log("Serving fallback questions due to API error.");
        
        const fallbackQuiz = Array.from({ length: count }, (_, i) => ({
            "q": `[${difficulty.toUpperCase()}] Fallback Question ${i + 1} about ${topic}?`,
            "options": ["A core principle", "A random idea", "A historical event", "None of the above"],
            "answer": 0
        }));
        
        res.status(200).json({ quizData: fallbackQuiz });
    }
};

module.exports = {
    generateQuiz
};
