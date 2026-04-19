import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cors from "cors";
import { prisma } from "./src/lib/prisma";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.get("/api/prds", async (req, res) => {
    // Basic local development check or just return all for now since Better Auth is removed
    try {
      const prds = await prisma.project.findMany({
        orderBy: { createdAt: "desc" },
      });
      res.json(prds);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch PRDs" });
    }
  });

  app.post("/api/prds", async (req, res) => {
    const { content, name, concept, userId } = req.body;
    if (!content) {
      return res.status(400).json({ error: "PRD content is required" });
    }

    try {
      // In a real app without Better Auth, you'd manage your own sessions
      // For this demo, we'll try to find any user or just create a mock one if needed
      // but the safest for now is to just ensure a user exists or handle missing userId
      let effectiveUserId = userId || "default-user";
      
      const newProject = await prisma.project.create({
        data: {
          name: name || "Untitled PRD",
          concept: concept || "",
          content: content,
          userId: effectiveUserId,
        },
      });
      res.status(201).json(newProject);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to save PRD" });
    }
  });

  // Admin Routes (Quick implementations)
  app.get("/api/admin/features", async (req, res) => {
    const features = await prisma.feature.findMany();
    res.json(features);
  });

  app.get("/api/learning-content", async (req, res) => {
    const contents = await prisma.learningContent.findMany({
      where: { isPublished: true },
    });
    res.json(contents);
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
