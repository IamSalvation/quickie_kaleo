import express from "express";
import http from "http";
import path from "path";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// In production, this will serve the built React app
const CLIENT_DIST = path.join(__dirname, "../client/dist");
app.use(express.static(CLIENT_DIST));

const users = new Map<string, string>(); // userId -> socketId

io.on("connection", (socket) => {
    console.log("🔌 connected:", socket.id);

    // A browser tells us its name (e.g. "alice")
    socket.on("register", (id: string) => {
        users.set(id, socket.id);
        console.log(`✅ registered: ${id}`);
    });

    // Caller sends an offer through us to the callee
    socket.on(
        "call-user",
        ({
            from,
            to,
            offer,
            video,
        }: {
            from: string;
            to: string;
            offer: unknown;
            video: boolean;
        }) => {
            const target = users.get(to);
            if (target) {
                io.to(target).emit("incoming-call", { from, offer, video });
                console.log(`📞 ${from} → ${to} (${video ? "video" : "voice"})`);
            } else {
                console.log(`⚠️  ${to} not found`);
            }
        }
    );

    // Callee sends back an answer
    socket.on(
        "answer-call",
        ({ to, answer }: { to: string; answer: unknown }) => {
            const target = users.get(to);
            if (target) io.to(target).emit("call-answered", { answer });
        }
    );

    // ICE candidates (network path discovery) flow both ways
    socket.on(
        "ice-candidate",
        ({ to, candidate }: { to: string; candidate: unknown }) => {
            const target = users.get(to);
            if (target) io.to(target).emit("ice-candidate", { candidate });
        }
    );

    // Either side can hang up
    socket.on("end-call", ({ to }: { to: string }) => {
        const target = users.get(to);
        if (target) io.to(target).emit("call-ended");
    });

    // Clean up when someone closes the tab
    socket.on("disconnect", () => {
        for (const [uid, sid] of users) {
            if (sid === socket.id) {
                users.delete(uid);
                console.log(`❌ disconnected: ${uid}`);
            }
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🟣 Kaleo signal server on :${PORT}`));