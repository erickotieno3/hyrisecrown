import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface AICompletionOptions {
  prompt: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  role?: string;
  includeHistory?: boolean;
  userId?: string;
  attachmentBase64?: string | null;
  attachmentType?: string | null;
}

// Store conversation history for users
const conversationHistory: Record<string, Array<{ role: string; content: any[] }>> = {};

export async function generateAICompletion({
  prompt,
  model = "gpt-4o", // default to newest model
  maxTokens = 500,
  temperature = 0.7,
  role = "You are a helpful price comparison and shopping assistant",
  includeHistory = true,
  userId = "default",
  attachmentBase64 = null,
  attachmentType = null,
}: AICompletionOptions): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  try {
    // Initialize conversation history if not exists
    if (!conversationHistory[userId]) {
      conversationHistory[userId] = [];
    }

    // Prepare the messages array
    const messages = [
      { role: "system", content: [{ type: "text", text: role }] },
    ];

    // Add history if requested
    if (includeHistory && conversationHistory[userId].length > 0) {
      messages.push(...conversationHistory[userId]);
    }

    // Prepare user message content
    const userContent: any[] = [{ type: "text", text: prompt }];

    // Add image attachment if present
    if (attachmentBase64 && attachmentType) {
      userContent.push({
        type: "image_url",
        image_url: {
          url: `data:${attachmentType};base64,${attachmentBase64}`
        }
      });
    }

    // Add the current user message
    messages.push({ role: "user", content: userContent });

    // Call the OpenAI API
    const response = await openai.chat.completions.create({
      model,
      messages: messages as any,
      max_tokens: maxTokens,
      temperature,
    });

    const assistantResponse = response.choices[0].message.content || "";

    // Store the conversation in history (only text is stored in history)
    if (includeHistory) {
      conversationHistory[userId].push({ 
        role: "user", 
        content: [{ type: "text", text: prompt }]
      });
      
      conversationHistory[userId].push({ 
        role: "assistant", 
        content: [{ type: "text", text: assistantResponse }]
      });
      
      // Limit history to last 10 messages (5 exchanges)
      if (conversationHistory[userId].length > 10) {
        conversationHistory[userId] = conversationHistory[userId].slice(-10);
      }
    }

    return assistantResponse;
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw new Error(`AI service error: ${error.message}`);
  }
}

export async function clearConversationHistory(userId: string): Promise<void> {
  conversationHistory[userId] = [];
}

export async function analyzeImage(base64Image: string, prompt: string = "Analyze this image in detail"): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 500,
    });

    return response.choices[0].message.content || "";
  } catch (error) {
    console.error("Error analyzing image with OpenAI:", error);
    throw new Error(`Image analysis error: ${error.message}`);
  }
}

export async function generateEmbedding(text: string): Promise<number[]> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw new Error(`Embedding generation error: ${error.message}`);
  }
}