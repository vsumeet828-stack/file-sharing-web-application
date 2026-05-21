import express from "express";
import path from "path";
import fs from "fs";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import os from "os";

dotenv.config();

function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const devName in interfaces) {
    const iface = interfaces[devName];
    if (iface) {
      for (let i = 0; i < iface.length; i++) {
        const alias = iface[i];
        if (alias.family === 'IPv4' && !alias.internal) {
          return alias.address;
        }
      }
    }
  }
  return 'localhost';
}

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = 3000;

  // Basic API routes with extended payload limit for base64 file sharing uploads
  app.use(express.json({ limit: "100mb" }));
  app.use(express.urlencoded({ limit: "100mb", extended: true }));

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Local storage upload fallback endpoint
  app.post("/api/upload/local", (req, res) => {
    try {
      const { fileName, fileType, fileData } = req.body;
      if (!fileName || !fileData) {
        return res.status(400).json({ error: "Incomplete file upload parameters" });
      }

      const buffer = Buffer.from(fileData, 'base64');
      const uploadsDir = path.join(process.cwd(), "public", "uploads");

      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const fileId = Date.now() + "_" + Math.random().toString(36).substring(2, 7);
      const safeFileName = `${fileId}_${path.basename(fileName)}`;
      const filePath = path.join(uploadsDir, safeFileName);

      fs.writeFileSync(filePath, buffer);

      const downloadURL = `${req.protocol}://${req.get("host")}/uploads/${safeFileName}`;
      
      console.log(`[Local Upload] Successfully saved file: ${fileName} -> ${filePath}`);
      res.json({
        url: downloadURL,
        path: `uploads/${safeFileName}`
      });
    } catch (err: any) {
      console.error("[Local Upload Error]", err);
      res.status(500).json({ error: err.message || "Failed to process file locally" });
    }
  });

  // Local storage sharing lookup endpoint
  app.get("/api/share/:id", (req, res) => {
    try {
      const { id } = req.params;
      const uploadsDir = path.join(process.cwd(), "public", "uploads");

      if (!fs.existsSync(uploadsDir)) {
        return res.status(404).json({ error: "No uploads found" });
      }

      const files = fs.readdirSync(uploadsDir);
      const matchedFile = files.find(file => file.startsWith(`${id}_`));

      if (!matchedFile) {
        return res.status(404).json({ error: "Shared file not found or expired" });
      }

      const filePath = path.join(uploadsDir, matchedFile);
      const stats = fs.statSync(filePath);
      const originalName = matchedFile.substring(id.length + 1);

      // Construct download URL using the host header (e.g. localhost or local network IP)
      const host = req.get("host");
      const downloadURL = `${req.protocol}://${host}/uploads/${matchedFile}`;

      // Infer type
      const ext = path.extname(originalName).toLowerCase();
      let type = "application/octet-stream";
      if ([".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"].includes(ext)) {
        type = `image/${ext.replace(".", "")}`;
      } else if ([".mp4", ".webm", ".ogg"].includes(ext)) {
        type = `video/${ext.replace(".", "")}`;
      } else if ([".pdf"].includes(ext)) {
        type = "application/pdf";
      }

      res.json({
        id: id,
        name: originalName,
        size: stats.size,
        type: type,
        url: downloadURL,
        createdAt: stats.birthtime
      });
    } catch (err: any) {
      console.error("[Share Lookup Error]", err);
      res.status(500).json({ error: "Failed to retrieve share details" });
    }
  });

  // Local server IP configuration endpoint
  app.get("/api/ip", (req, res) => {
    res.json({ ip: getLocalIpAddress() });
  });

  // Socket.IO logic
  const rooms = new Map();

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("join-room", (roomId) => {
      // Store roomId on the socket to track it on disconnect
      (socket as any).roomId = roomId;

      // Get list of users already in this room before we join
      const clients = io.sockets.adapter.rooms.get(roomId);
      const existingUsers = clients ? Array.from(clients) : [];

      socket.join(roomId);
      console.log(`User ${socket.id} joined room ${roomId}`);
      
      // Notify others in the room
      socket.to(roomId).emit("user-connected", socket.id);

      // Send the list of existing users to this new client
      socket.emit("user-list", existingUsers);
    });

    socket.on("file-metadata", ({ roomId, metadata }) => {
      socket.to(roomId).emit("incoming-file", { metadata, from: socket.id });
    });

    socket.on("file-chunk", ({ roomId, chunk, index, total }) => {
      socket.to(roomId).emit("file-chunk-received", { chunk, index, total });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      const roomId = (socket as any).roomId;
      if (roomId) {
        // Notify others in the room that this user left
        socket.to(roomId).emit("user-disconnected", socket.id);
      }
    });
  });

  // Static serving for uploaded files
  app.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads")));

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

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
