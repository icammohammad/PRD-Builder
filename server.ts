import express, { Request, Response, NextFunction } from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "./src/lib/prisma.ts";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// Middleware to verify JWT
const authenticateToken = (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: "Forbidden" });
    req.user = user;
    next();
  });
};

// Middleware to check admin role
const isAdmin = (req: any, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- Auth Routes ---
  app.post("/api/auth/register", async (req, res) => {
    const { email, password, name } = req.body;
    console.log("Registering user:", { email, name });
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: email === "muhammad.hissamudin@gmail.com" ? "admin" : "member"
        }
      });
      console.log("User created successfully:", user.id);
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
      res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    } catch (err: any) {
      console.error("Registration error:", err);
      res.status(400).json({ error: "Email already exists or invalid data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    console.log("Login attempt:", email);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      console.log("Login failed for:", email);
      return res.status(401).json({ error: "Invalid credentials" });
    }
    console.log("Login successful:", user.id);
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role, prdGeneratedCount: user.prdGeneratedCount } });
  });

  app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ id: user.id, email: user.email, name: user.name, role: user.role, prdGeneratedCount: user.prdGeneratedCount });
  });

  // --- PRD Routes ---
  app.get("/api/prds", authenticateToken, async (req: any, res) => {
    const prds = await prisma.prd.findMany({
      where: req.user.role === 'admin' ? {} : { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(prds);
  });

  app.post("/api/prds", authenticateToken, async (req: any, res) => {
    const { prd, title } = req.body;
    try {
      const newPrd = await prisma.prd.create({
        data: {
          content: prd,
          title: title || "Untitled PRD",
          userId: req.user.id
        }
      });
      
      await prisma.user.update({
        where: { id: req.user.id },
        data: { prdGeneratedCount: { increment: 1 } }
      });

      res.status(201).json(newPrd);
    } catch (err) {
      res.status(500).json({ error: "Failed to save PRD" });
    }
  });

  // --- Admin Routes ---
  app.get("/api/admin/users", authenticateToken, isAdmin, async (req, res) => {
    const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(users);
  });

  app.get("/api/admin/packages", authenticateToken, async (req, res) => {
    const packages = await prisma.package.findMany();
    res.json(packages);
  });

  app.post("/api/admin/packages", authenticateToken, isAdmin, async (req, res) => {
    const { name, limit, price, description } = req.body;
    const pkg = await prisma.package.create({
      data: { name, limit, price, description }
    });
    res.json(pkg);
  });

  app.patch("/api/admin/packages/:id", authenticateToken, isAdmin, async (req, res) => {
    const pkg = await prisma.package.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(pkg);
  });

  app.get("/api/admin/config", authenticateToken, async (req, res) => {
    let config = await prisma.systemConfig.findUnique({ where: { id: "config" } });
    if (!config) {
      config = await prisma.systemConfig.create({ data: { id: "config" } });
    }
    res.json(config);
  });

  app.patch("/api/admin/config", authenticateToken, isAdmin, async (req, res) => {
    const config = await prisma.systemConfig.update({
      where: { id: "config" },
      data: req.body
    });
    res.json(config);
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Backend with Prisma is running" });
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
