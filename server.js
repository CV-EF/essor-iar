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
Réponds en français simple, clair et encourageant.
Aide les élèves, parents et enseignants à comprendre les cours.
Explique étape par étape.
N’encourage pas la triche.
`;

app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Essor IA</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background: #f6f7ff;
      padding: 20px;
      margin: 0;
    }
    .chat {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border-radius: 24px;
      padding: 24px;
      box-shadow: 0 10px 30px rgba(33,41,92,0.12);
    }
    h1 {
      color: #1A2DF3;
      margin-top: 0;
    }
    #messages {
      min-height: 280px;
      margin-bottom: 16px;
    }
    .msg {
      padding: 12px 14px;
      border-radius: 14px;
      margin: 10px 0;
      line-height: 1.5;
    }
    .user {
      background: #EEF1FF;
    }
    .bot {
      background: #F5F5F5;
    }
    textarea {
      width: 100%;
      height: 90px;
      padding: 12px;
      border-radius: 14px;
      border: 1px solid #ccc;
      font-size: 16px;
      box-sizing: border-box;
    }
    button {
      margin-top: 12px;
      background: #1A2DF3;
      color: white;
      border: none;
      padding: 14px 22px;
      border-radius: 14px;
      font-weight: bold;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="chat">
    <h1>🤖 Essor IA</h1>
    <p>Pose ta question sur un cours, une leçon ou un exercice.</p>

    <div id="messages"></div>

    <textarea id="question" placeholder="Écris ta question ici..."></textarea>
    <button onclick="sendMessage()">Envoyer</button>
  </div>

  <script>
    async function sendMessage() {
      const questionBox = document.getElementById("question");
      const question = questionBox.value.trim();
      if (!question) return;

      const messages = document.getElementById("messages");

      messages.innerHTML += '<div class="msg user"><strong>Vous :</strong><br>' + question + '</div>';
      questionBox.value = "";

      messages.innerHTML += '<div class="msg bot" id="loading"><strong>Essor IA :</strong><br>Je réfléchis...</div>';

      try {
        const response = await fetch("/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question })
        });

        const data = await response.json();

        document.getElementById("loading").remove();

        messages.innerHTML += '<div class="msg bot"><strong>Essor IA :</strong><br>' + data.answer.replace(/\\n/g, "<br>") + '</div>';
        messages.scrollTop = messages.scrollHeight;
      } catch (error) {
        document.getElementById("loading").remove();
        messages.innerHTML += '<div class="msg bot"><strong>Essor IA :</strong><br>Erreur de connexion.</div>';
      }
    }
  </script>
</body>
</html>
  `);
});

app.post("/chat", async (req, res) => {
  try {
    const question = req.body.question;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: SYSTEM_PROMPT + "\\n\\nQuestion : " + question
    });

    res.json({ answer: response.text });
  } catch (error) {
    console.error(error);
    res.json({
      answer: "Désolé, Essor IA rencontre un problème technique."
    });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Essor IA is running");
});
