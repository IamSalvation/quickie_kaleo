import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import type {
    CallState,
    IncomingCall,
    AnswerPayload,
    IcePayload,
} from "../types";

// In dev, Vite proxies /socket.io → localhost:3000 (see vite.config.ts)
// In prod, the same server serves both the app and signaling
const SIGNAL_URL =
    import.meta.env.VITE_SIGNAL_URL ??
    (import.meta.env.PROD
        ? "https://n9f2t2xmdvzj-production-5kpawjol.europe-west1.suga.run"
        : window.location.origin);

const ICE_CONFIG: RTCConfiguration = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        // TURN for production:
        // { urls: "turn:YOUR_TURN", username: "u", credential: "p" },
    ],
};

export function useCall(myId: string | null) {
    const socketRef = useRef<Socket | null>(null);
    const pcRef = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const remoteIdRef = useRef<string | null>(null);

    const [state, setState] = useState<CallState>("idle");
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [muted, setMuted] = useState(false);
    const [camOff, setCamOff] = useState(false);
    const [incoming, setIncoming] = useState<IncomingCall | null>(null);

    // ---------- Cleanup ----------
    const cleanup = useCallback(() => {
        pcRef.current?.close();
        pcRef.current = null;

        localStreamRef.current?.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;

        remoteIdRef.current = null;
        setLocalStream(null);
        setRemoteStream(null);
        setIncoming(null);
        setMuted(false);
        setCamOff(false);
        setState("idle");
    }, []);

    // ---------- Socket lifecycle ----------
    useEffect(() => {
        if (!myId) return;

        const socket = io(SIGNAL_URL);
        socketRef.current = socket;

        socket.emit("register", myId);

        socket.on("incoming-call", (payload: IncomingCall) => {
            remoteIdRef.current = payload.from;
            setIncoming(payload);
            setState("ringing");
        });

        socket.on("call-answered", async ({ answer }: AnswerPayload) => {
            try {
                await pcRef.current?.setRemoteDescription(answer);
                setState("connected");
            } catch (err) {
                console.error("setRemoteDescription(answer) failed:", err);
            }
        });

        socket.on("ice-candidate", async ({ candidate }: IcePayload) => {
            try {
                await pcRef.current?.addIceCandidate(candidate);
            } catch {
                /* ignore late/duplicate candidates */
            }
        });

        socket.on("call-ended", () => cleanup());

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [myId, cleanup]);

    // ---------- Media capture ----------
    const getMedia = useCallback(async (video: boolean) => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
            },
            video: video
                ? { width: 640, height: 360, frameRate: 24 } // low start = data saver
                : false,
        });
        localStreamRef.current = stream;
        setLocalStream(stream);
        return stream;
    }, []);

    // ---------- Peer connection ----------
    const createPeer = useCallback(
        (remoteId: string, stream: MediaStream) => {
            const pc = new RTCPeerConnection(ICE_CONFIG);
            pcRef.current = pc;

            stream.getTracks().forEach((track) => pc.addTrack(track, stream));

            pc.ontrack = (e) => {
                setRemoteStream(e.streams[0]);
            };

            pc.onicecandidate = (e) => {
                if (e.candidate) {
                    socketRef.current?.emit("ice-candidate", {
                        to: remoteId,
                        candidate: e.candidate,
                    });
                }
            };

            pc.onconnectionstatechange = () => {
                if (
                    ["failed", "disconnected", "closed"].includes(pc.connectionState)
                ) {
                    cleanup();
                }
            };

            // Prefer AV1 / VP9 for data savings (only matters if video)
            const caps = RTCRtpSender.getCapabilities("video");
            if (caps) {
                const efficient = caps.codecs.filter((c) =>
                    /AV1|VP9/.test(c.mimeType)
                );
                pc.getTransceivers().forEach((t) => {
                    if (t.sender.track?.kind === "video") {
                        t.setCodecPreferences([...efficient, ...caps.codecs]);
                    }
                });
            }

            return pc;
        },
        [cleanup]
    );

    // ---------- Outgoing call ----------
    const startCall = useCallback(
        async (remoteId: string, video: boolean) => {
            if (!myId) return;
            const stream = await getMedia(video);
            const pc = createPeer(remoteId, stream);
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            remoteIdRef.current = remoteId;
            socketRef.current?.emit("call-user", {
                from: myId,
                to: remoteId,
                offer,
                video, // ← tell the other side whether to grab a camera
            });
            setState("calling");
        },
        [myId, getMedia, createPeer]
    );

    // ---------- Accept incoming ----------
    // No more `video` parameter — we use whatever the caller requested.
    const acceptCall = useCallback(async () => {
        if (!incoming) return;
        const stream = await getMedia(incoming.video);
        const pc = createPeer(incoming.from, stream);
        await pc.setRemoteDescription(incoming.offer);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socketRef.current?.emit("answer-call", {
            to: incoming.from,
            answer,
        });
        setIncoming(null);
        setState("connected");
    }, [incoming, getMedia, createPeer]);

    // ---------- Decline incoming ----------
    const declineCall = useCallback(() => {
        if (incoming) {
            socketRef.current?.emit("end-call", { to: incoming.from });
        }
        cleanup();
    }, [incoming, cleanup]);

    // ---------- Controls ----------
    const toggleMute = useCallback(() => {
        localStreamRef.current?.getAudioTracks().forEach((t) => {
            t.enabled = !t.enabled;
        });
        setMuted((m) => !m);
    }, []);

    const toggleCam = useCallback(() => {
        localStreamRef.current?.getVideoTracks().forEach((t) => {
            t.enabled = !t.enabled;
        });
        setCamOff((c) => !c);
    }, []);

    // ---------- Hang up ----------
    const hangup = useCallback(() => {
        if (remoteIdRef.current) {
            socketRef.current?.emit("end-call", { to: remoteIdRef.current });
        }
        cleanup();
    }, [cleanup]);

    // ---------- Data saver: pause outgoing video when tab hidden ----------
    useEffect(() => {
        const onVis = () => {
            localStreamRef.current?.getVideoTracks().forEach((t) => {
                t.enabled = !document.hidden;
            });
        };
        document.addEventListener("visibilitychange", onVis);
        return () => document.removeEventListener("visibilitychange", onVis);
    }, []);

    return {
        state,
        localStream,
        remoteStream,
        muted,
        camOff,
        incoming,
        startCall,
        acceptCall,
        declineCall,
        toggleMute,
        toggleCam,
        hangup,
    };
}