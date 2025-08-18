import express from "express";
import cors from "cors";

const app = express();
app.use(cors());            // depois podemos restringir ao domínio do frontend
app.use(express.json());

app.get("/health", (_, res) => res.json({ ok: true }));

app.post("/search", async (req, res) => {
  try {
    const { q } = req.body || {};
    if (!q) return res.status(400).json({ error: "Missing q" });
    const answer = `Resumo inteligente para: ${q}`;
    res.json({ answer });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal error" });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`API on :${port}`));
