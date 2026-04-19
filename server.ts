import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "./src/lib/prisma";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(cors());
  app.use(express.json());

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.status(401).json({ error: "Access denied" });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: "Invalid token" });
      req.user = user;
      next();
    });
  };

  // Auth Routes
  app.post("/api/auth/register", async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: role || "member",
        },
      });
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
      res.status(201).json({ user, token });
    } catch (error: any) {
      if (error.code === "P2002") {
        return res.status(400).json({ error: "Email already exists" });
      }
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
      res.json({ user, token });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
    try {
      const user = await prisma.user.findUnique({ where: { id: req.user.id } });
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // API Routes
  app.get("/api/prds", authenticateToken, async (req: any, res) => {
    try {
      const prds = await prisma.project.findMany({
        where: req.user.role === "admin" ? {} : { userId: req.user.id },
        orderBy: { createdAt: "desc" },
      });
      res.json(prds);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch PRDs" });
    }
  });

  app.post("/api/prds", authenticateToken, async (req: any, res) => {
    const { content, name, concept } = req.body;
    if (!content) {
      return res.status(400).json({ error: "PRD content is required" });
    }

    try {
      const newProject = await prisma.project.create({
        data: {
          name: name || "Untitled PRD",
          concept: concept || "",
          content: content,
          userId: req.user.id,
        },
      });
      res.status(201).json(newProject);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to save PRD" });
    }
  });

  // Admin Middleware
  const isAdmin = (req: any, res: any, next: any) => {
    if (req.user && req.user.role === "admin") {
      next();
    } else {
      res.status(403).json({ error: "Require Admin role" });
    }
  };

  // User Management
  app.get("/api/admin/users", authenticateToken, isAdmin, async (req, res) => {
    try {
      const users = await prisma.user.findMany({
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      });
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.delete("/api/admin/users/:id", authenticateToken, isAdmin, async (req, res) => {
    try {
      await prisma.user.delete({ where: { id: req.params.id } });
      res.json({ message: "User deleted" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  app.patch("/api/admin/users/:id", authenticateToken, isAdmin, async (req, res) => {
    const { role } = req.body;
    try {
      const updatedUser = await prisma.user.update({
        where: { id: req.params.id },
        data: { role },
      });
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  // Feature Management
  app.get("/api/admin/features", authenticateToken, isAdmin, async (req, res) => {
    try {
      const features = await prisma.feature.findMany();
      res.json(features);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch features" });
    }
  });

  app.post("/api/admin/features", authenticateToken, isAdmin, async (req, res) => {
    const { name, description, type } = req.body;
    try {
      const feature = await prisma.feature.create({
        data: { name, description, type },
      });
      res.status(201).json(feature);
    } catch (error) {
      res.status(500).json({ error: "Failed to create feature" });
    }
  });

  app.patch("/api/admin/features/:id", authenticateToken, isAdmin, async (req, res) => {
    const { name, description, type } = req.body;
    try {
      const feature = await prisma.feature.update({
        where: { id: req.params.id },
        data: { name, description, type },
      });
      res.json(feature);
    } catch (error) {
      res.status(500).json({ error: "Failed to update feature" });
    }
  });

  app.delete("/api/admin/features/:id", authenticateToken, isAdmin, async (req, res) => {
    try {
      await prisma.feature.delete({ where: { id: req.params.id } });
      res.json({ message: "Feature deleted" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete feature" });
    }
  });

  // Learning Content
  app.get("/api/learning-content", async (req, res) => {
    try {
      const contents = await prisma.learningContent.findMany({
        where: { isPublished: true },
      });
      res.json(contents);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch content" });
    }
  });

  app.get("/api/admin/learning-content", authenticateToken, isAdmin, async (req, res) => {
    try {
      const contents = await prisma.learningContent.findMany();
      res.json(contents);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch admin content" });
    }
  });

  app.post("/api/admin/learning-content", authenticateToken, isAdmin, async (req, res) => {
    const { title, description, category, url, isPublished } = req.body;
    try {
      const content = await prisma.learningContent.create({
        data: { title, description, category, url, isPublished },
      });
      res.status(201).json(content);
    } catch (error) {
      res.status(500).json({ error: "Failed to create content" });
    }
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
