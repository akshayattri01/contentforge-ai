const axios = require("axios");
const Content = require("../models/Content");

const generateContent = async (req, res, next) => {
  console.log("🔥 GENERATE API HIT");

  try {
    const topic = String(req.body.topic || "").trim();
    const type = String(req.body.type || "").trim().toLowerCase();
    const tone = String(req.body.tone || "").trim().toLowerCase();

    if (!topic || !type || !tone) {
      return res.status(400).json({
        message: "Topic, type, and tone are required",
      });
    }

    const aiResponse = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
    model: "openai/gpt-oss-20b:free",
        messages: [
          {
            role: "system",
            content:
              "You are ContentForge AI, an expert content strategist and copywriter.",
          },
          {
            role: "user",
            content: `Create high-quality ${type} content for the topic: "${topic}". Use a ${tone} tone. Make it clear, useful, and ready to publish.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 900,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://contentforge-ai-seven.vercel.app",
          "X-Title": "ContentForge AI",
        },
        timeout: 30000,
      }
    );

    const generatedContent =
      aiResponse.data?.choices?.[0]?.message?.content?.trim();

    if (!generatedContent) {
      return res.status(502).json({
        message: "AI provider returned empty response",
      });
    }

    const content = await Content.create({
      topic,
      type,
      tone,
      generatedContent,
    });

    return res.status(201).json({
      success: true,
      topic: content.topic,
      type: content.type,
      tone: content.tone,
      generatedContent: content.generatedContent,
      createdAt: content.createdAt,
    });
  } catch (error) {
    console.error("Generate Content Error:", error.response?.data || error);

    return res.status(500).json({
      success: false,
      message:
        error.response?.data?.error?.message ||
        error.message ||
        "Something went wrong",
    });
  }
};

module.exports = { generateContent };