import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

const SYSTEM_PROMPT = `
Tu es Essor IA, l’assistant pédagogique de CVEF Essor.
Réponds en français simple et aide les élèves à comprendre.
`;

app.get("/", (req, res) => {
  res.send("Essor IA fonctionne 🚀");
});

app.post("/chat", async (req, res) => {
  try {
    const question = req.body.question;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: SYSTEM_PROMPT + "\\n\\n" + question
    });

    res.json({ answer: response.text });
  } catch (e) {
    res.json({ answer: "Erreur serveur." });
  }
});

app.listen(3000, () => console.log("Server running"));
