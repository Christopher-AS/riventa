import express from "express";
import cors from "cors";

const app = express();

// CORS seguro: seu domínio na Vercel, previews *.vercel.app e localhost
const PROD_ORIGIN = "https://riventa.vercel.app";

const corsOptions = {
  origin(origin, cb) {
    try {
      if (!origin) return cb(null, true); // healthchecks/server-to-server
      if (origin === PROD_ORIGIN) return cb(null, true);
      const { hostname } = new URL(origin);
      if (hostname === "localhost" || hostname === "127.0.0.1") return cb(null, true);
      if (hostname.endsWith(".vercel.app")) return cb(null, true); // previews
      return cb(new Error("Not allowed by CORS"));
    } catch {
      return cb(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

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
