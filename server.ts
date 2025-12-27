import "dotenv/config";
import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import express from "express";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = express();
    const httpServer = createServer(server);
    const io = new Server(httpServer, {
        cors: {
            origin: "*", // Allow all for dev
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        console.log("Client connected", socket.id);

        // Permission Updates
        socket.on("PERMISSION_UPDATE", (data) => {
            io.emit("PERMISSION_UPDATE", data);
        });

        // New Permission Requests
        socket.on("NEW_PERMISSION", (data) => {
            io.emit("NEW_PERMISSION", data);
        });

        // Seat Updates
        socket.on("SEAT_UPDATE", (data) => {
            io.emit("SEAT_UPDATE", data);
        });

        socket.on("disconnect", () => {
            console.log("Client disconnected", socket.id);
        });
    });

    server.use((req, res) => {
        return handle(req, res);
    });

    httpServer.listen(port, "0.0.0.0", () => {
        console.log(`> Ready on http://${hostname}:${port}`);
        console.log(`> WebSocket Server Active`);
    });
});
