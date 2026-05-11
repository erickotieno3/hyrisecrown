import { Router } from "express";
import multer from "multer";
import * as fs from "fs";
import * as path from "path";
import { generateAICompletion, analyzeImage, clearConversationHistory } from "../ai-service";

const upload = multer({ dest: "uploads/" });
const aiRouter = Router();

// Middleware to ensure uploads directory exists
aiRouter.use((req, res, next) => {
  const uploadsDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  next();
});

// Text completion endpoint
aiRouter.post("/completion", async (req, res) => {
  try {
    const { prompt, model, maxTokens, temperature, role, includeHistory, userId } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const completion = await generateAICompletion({
      prompt,
      model,
      maxTokens,
      temperature,
      role,
      includeHistory,
      userId: userId || req.ip, // Use IP as fallback user identifier
    });

    res.json({ completion });
  } catch (error) {
    console.error("AI completion error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Image analysis endpoint
aiRouter.post("/analyze-image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Image file is required" });
    }

    const imageBuffer = fs.readFileSync(req.file.path);
    const base64Image = imageBuffer.toString("base64");
    const prompt = req.body.prompt || "Analyze this image and provide detailed information about it";

    const analysis = await analyzeImage(base64Image, prompt);

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({ analysis });
  } catch (error) {
    console.error("Image analysis error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Multimodal completion endpoint (text + image)
aiRouter.post("/multimodal", upload.single("image"), async (req, res) => {
  try {
    const { prompt, model, maxTokens, temperature, role, includeHistory, userId } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    let attachmentBase64 = null;
    let attachmentType = null;

    if (req.file) {
      const imageBuffer = fs.readFileSync(req.file.path);
      attachmentBase64 = imageBuffer.toString("base64");
      attachmentType = req.file.mimetype;
    }

    const completion = await generateAICompletion({
      prompt,
      model,
      maxTokens,
      temperature,
      role,
      includeHistory,
      userId: userId || req.ip,
      attachmentBase64,
      attachmentType,
    });

    // Clean up uploaded file if exists
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }

    res.json({ completion });
  } catch (error) {
    console.error("Multimodal completion error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Clear conversation history
aiRouter.post("/clear-history", async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    await clearConversationHistory(userId);
    res.json({ message: "Conversation history cleared successfully" });
  } catch (error) {
    console.error("Clear history error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default aiRouter;