"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeWebSocket = initializeWebSocket;
const socket_io_1 = require("socket.io");
const jwt_1 = require("../helpers/jwt");
const client_1 = __importDefault(require("../../prisma/client"));
const encryption_1 = require("../utils/encryption");
function initializeWebSocket(httpServer) {
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL,
            methods: ["GET", "POST"],
        },
    });
    // Auth middleware
    io.use((socket, next) => __awaiter(this, void 0, void 0, function* () {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error("Authentication error"));
        }
        try {
            const decoded = (0, jwt_1.verifyToken)(token);
            const user = yield client_1.default.user.findUnique({
                where: { id: decoded.id },
            });
            if (!user) {
                return next(new Error("User not found"));
            }
            socket.data.user = user;
            next();
        }
        catch (error) {
            next(new Error("Authentication error"));
        }
    }));
    // Connection handler
    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.data.user.id}`);
        // Join user's personal room
        socket.join(`user:${socket.data.user.id}`);
        // Şifreleme anahtarlarını oluştur/güncelle
        socket.on("encryption:init", () => __awaiter(this, void 0, void 0, function* () {
            const keyPair = encryption_1.E2EEncryption.generateKeyPair();
            yield client_1.default.user.update({
                where: { id: socket.data.user.id },
                data: {
                    publicKey: keyPair.publicKey,
                    privateKey: keyPair.privateKey,
                },
            });
            socket.emit("encryption:keys", keyPair);
        }));
        // Handle chat events
        socket.on("join:chat", (chatId) => {
            socket.join(`chat:${chatId}`);
        });
        socket.on("leave:chat", (chatId) => {
            socket.leave(`chat:${chatId}`);
        });
        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.data.user.id}`);
        });
    });
    return io;
}
