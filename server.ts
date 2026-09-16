import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

function createWavHeader(dataLength: number, sampleRate = 24000, numChannels = 1, bitsPerSample = 16): Buffer {
  const header = Buffer.alloc(44);
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);

  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataLength, 4);
  header.write("WAVE", 8);

  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);

  header.write("data", 36);
  header.writeUInt32LE(dataLength, 40);

  return header;
}

let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // API Status
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      hasGeminiApiKey: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  // Gemini Text to Speech API endpoint
  app.post("/api/tts/generate", async (req, res) => {
    try {
      const { text, voice = "Kore", promptStyle } = req.body;

      if (!text || typeof text !== "string" || !text.trim()) {
        res.status(400).json({ error: "Text is required for speech generation." });
        return;
      }

      const ai = getAi();
      if (!ai) {
        res.status(503).json({
          error: "Gemini API key is not configured. You can still use the instant Web Speech voices!",
        });
        return;
      }

      // Valid prebuilt voices: Puck, Charon, Kore, Fenrir, Zephyr
      const validVoices = ["Puck", "Charon", "Kore", "Fenrir", "Zephyr"];
      const selectedVoice = validVoices.includes(voice) ? voice : "Kore";

      const spokenText = promptStyle ? `${promptStyle.trim()}: ${text.trim()}` : text.trim();

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [
          {
            parts: [{ text: spokenText }],
          },
        ],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: selectedVoice },
            },
          },
        },
      });

      const part = response.candidates?.[0]?.content?.parts?.[0];
      const base64Audio = part?.inlineData?.data;
      const mimeType = part?.inlineData?.mimeType || "audio/pcm;rate=24000";

      if (!base64Audio) {
        res.status(500).json({ error: "No audio data received from Gemini TTS." });
        return;
      }

      let audioDataUrl = "";
      if (mimeType.includes("pcm")) {
        const pcmBuffer = Buffer.from(base64Audio, "base64");
        const wavHeader = createWavHeader(pcmBuffer.length, 24000, 1, 16);
        const wavBuffer = Buffer.concat([wavHeader, pcmBuffer]);
        audioDataUrl = `data:audio/wav;base64,${wavBuffer.toString("base64")}`;
      } else {
        audioDataUrl = `data:${mimeType};base64,${base64Audio}`;
      }

      res.json({
        audioUrl: audioDataUrl,
        voice: selectedVoice,
        mimeType: "audio/wav",
      });
    } catch (err: unknown) {
      console.error("TTS generation error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to synthesize speech";
      res.status(500).json({ error: errorMessage });
    }
  });

  // Vite middleware in dev mode
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
