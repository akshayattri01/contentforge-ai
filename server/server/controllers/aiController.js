const axios = require("axios");
const Content = require("../models/Content");

const allowedTypes = ["blog", "caption", "email", "ad", "tweet", "marketing copy", "ad copy", "social media post", "product description", "other"];
const allowedTones = ["professional", "casual", "funny", "inspirational", "bold", "friendly", "persuasive", "witty", "luxury", "educational", "other"];

const normalizeInput = (value) => String(value || "").trim();

const buildPrompt = ({ topic, type, tone }) => {
  return [
    `Create high-quality ${type} content for the topic: "${topic}".`,
    `Use a ${tone} tone.`,
    "Make the output clear, useful, original, and ready to publish.",
    "Do not include markdown code fences.",
  ].join(" ");
};

const generateContent = async (req, res, next) => {
  try {
    const topic = normalizeInput(req.body.topic);
    const type = normalizeInput(req.body.type).toLowerCase();
    const tone = normalizeInput(req.body.tone).toLowerCase();

    if (!topic || !type || !tone) {
      res.status(400);
      throw new Error("Topic, type, and tone are required");
    }

    if (topic.length < 3 || topic.length > 300) {
      res.status(400);
      throw new Error("Topic must be between 3 and 300 characters");
    }

    if (!process.env.OPENROUTER_API_KEY) {
      res.status(500);
      throw new Error("OpenRouter API key is not configured");
    }

    const prompt = buildPrompt({ topic, type, tone });

    const aiResponse = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "mistralai/mistral-7b-instruct:free",
        messages: [
          {
            role: "system",
            content: "You are ContentForge AI, an expert content strategist and copywriter.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 900,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.APP_URL || "http://localhost:5000",
          "X-Title": "ContentForge AI",
        },
        timeout: 30000,
      }
    );

    const generatedContent = aiResponse.data?.choices?.[0]?.message?.content?.trim();

    if (!generatedContent) {
      res.status(502);
      throw new Error("AI provider returned an empty response");
    }

    const content = await Content.create({
      userId: "demo123", // ✅ Fixed
      topic,
      type,
      tone,
      generatedContent,
    });

    res.status(201).json({
      topic: content.topic,
      type: content.type,
      tone: content.tone,
      generatedContent: content.generatedContent,
      createdAt: content.createdAt,
    });

  } catch (error) {
    if (error.response) {
      error.statusCode = error.response.status || 502;
      error.message =
        error.response.data?.error?.message ||
        error.response.data?.message ||
        "AI provider request failed";
    } else if (error.code === "ECONNABUSED") {
      error.statusCode = 504;
      error.message = "AI provider request timed out";
    }
    next(error);
  }
};

module.exports = { generateContent };