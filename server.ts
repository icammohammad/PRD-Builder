import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory store for PRDs (mock database)
let prdStore: any[] = [];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/prds", (req, res) => {
    res.json(prdStore);
  });

  app.post("/api/prds", (req, res) => {
    const { prd, name, timestamp } = req.body;
    if (!prd) {
      return res.status(400).json({ error: "PRD content is required" });
    }
    const newEntry = { id: Date.now(), prd, name, timestamp: timestamp || new Date().toISOString() };
    prdStore.unshift(newEntry); // Add to beginning
    res.status(201).json(newEntry);
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Backend is running" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
