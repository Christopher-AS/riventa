import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();

// (opcional) log pra debug
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} | Origin: ${req.headers.origin || "-"}`);
  next();
});

// ===== CORS: produção + previews da Vercel + localhost =====
const allowedHosts = new Set([
  "riventa.vercel.app", // produção
  "localhost",
  "127.0.0.1",
]);

function isAllowedOrigin(origin) {
  if (!origin) return true; // healthchecks / server-to-server
  try {
    const host = new URL(origin).hostname;
    return allowedHosts.has(host) || host.endsWith(".vercel.app");
  } catch {
    return false;
  }
}

const corsOptions = {
  origin(origin, cb) {
    if (isAllowedOrigin(origin)) return cb(null, true);
    return cb(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

// Preflight OPTIONS (sem wildcard, compatível com Express 5)
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    const origin = req.headers.origin || "";
    if (!isAllowedOrigin(origin)) return res.status(403).send("CORS preflight blocked");
    res.set("Access-Control-Allow-Origin", origin || "*");
    res.set("Vary", "Origin");
    res.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json());

// ===== OpenAI client (opcional: funciona com fallback se não setar a chave) =====
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

app.get("/health", (_, res) => res.json({ ok: true }));

app.post("/search", async (req, res) => {
  try {
    const { q } = req.body || {};
    if (!q) return res.status(400).json({ error: "Missing q" });

    // Se não houver chave, devolve fallback simples
    if (!openai) {
      const answer = `Resumo inteligente para: ${q}`;
      return res.json({ answer, note: "OPENAI_API_KEY não configurada (usando fallback)." });
    }

    const prompt = `Você é o assistente do Riventa. Responda de forma clara, curta e em pt-BR.
Pergunta do usuário: "${q}"`;

    const resp = await openai.responses.create({
      model: "gpt-4o-mini",
      input: prompt,
    });

    const answer = (resp?.output_text || "").trim() || "Sem resposta.";
    res.json({ answer });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal error" });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`API on :${port}`));
