import { Server } from "socket.io";
import { Server as HTTPServer } from "http";
import { verifyToken } from "../helpers/jwt";
import prisma from "../../prisma/client";
import { E2EEncryption } from "../utils/encryption";

export function initializeWebSocket(httpServer: HTTPServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST"],
    },
  });

  // Auth middleware
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error"));
    }

    try {
      const decoded = verifyToken(token);
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.data.user = user;
      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  // Connection handler
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.data.user.id}`);

    // Join user's personal room
    socket.join(`user:${socket.data.user.id}`);

    // Şifreleme anahtarlarını oluştur/güncelle
    socket.on("encryption:init", async () => {
      const keyPair = E2EEncryption.generateKeyPair();

      await prisma.user.update({
        where: { id: socket.data.user.id },
        data: {
          publicKey: keyPair.publicKey,
          privateKey: keyPair.privateKey,
        },
      });

      socket.emit("encryption:keys", keyPair);
    });

    // Handle chat events
    socket.on("join:chat", (chatId: string) => {
      socket.join(`chat:${chatId}`);
    });

    socket.on("leave:chat", (chatId: string) => {
      socket.leave(`chat:${chatId}`);
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.data.user.id}`);
    });
  });

  return io;
}
