import express from "express";
import cors from "cors";

const app = express();

// --- CORS robusto: permite seu domínio da Vercel, qualquer preview *.vercel.app e localhost ---
const PROD_ORIGIN = "https://riventa.vercel.app";

const corsOptions = {
  origin(origin, cb) {
    try {
      if (!origin) return cb(null, true); // server-to-server, healthcheck etc.
      if (origin === PROD_ORIGIN) return cb(null, true);

      // permitir previews da Vercel e dev local
      const { hostname } = new URL(origin);
      if (hostname === "localhost" || hostname === "127.0.0.1") return cb(null, true);
      if (hostname.endsWith(".vercel.app")) return cb(null, true);

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
// --- fim CORS ---

app.use(express.json());

app.get("/health", (_, res) => res.json({ ok: true }));

app.post("/search", async (req, res) => {
  try {
    const { q } = req.body || {};
    if (!q) return res.status(400).json({ error: "Missing q" });

    // TODO: integre sua IA/Buscas aqui
    const answer = `Resumo inteligente para: ${q}`;
    res.json({ answer });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal error" });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`API on :${port}`));
