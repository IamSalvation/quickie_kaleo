import { useState } from "react";
import {
  Video as VideoIcon,
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  VideoOff,
} from "lucide-react";
import { useCall } from "./hooks/useCall";
import { VideoTile } from "./components/VideoTile";
import { IncomingCall } from "./components/IncomingCall";
import { Logo } from "./components/Logo";

function formatDuration(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const mm = m.toString().padStart(2, "0");
  const ss = s.toString().padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export default function App() {
  const [name, setName] = useState("");
  const [registered, setRegistered] = useState(false);
  const [peerId, setPeerId] = useState("");

  const call = useCall(registered ? name.trim() : null);

  // ---------- Join screen ----------
  if (!registered) {
    return (
      <div className="min-h-screen bg-kaleo-bg text-white flex items-center justify-center p-6 font-sans">
        <div className="w-full max-w-sm space-y-6">
          <div className="flex flex-col items-center gap-3">
            <Logo size={96} />
            <h1 className="text-4xl font-display font-bold tracking-tight">
              Kaleo
            </h1>
            <p className="text-kaleo-muted text-sm">Called. Connected.</p>
          </div>

          <div className="bg-kaleo-surface border border-kaleo-border rounded-2xl p-6 space-y-3">
            <label className="text-xs uppercase tracking-wider text-kaleo-muted">
              Your name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. alice"
              className="w-full px-4 py-3 rounded-xl bg-kaleo-bg border border-kaleo-border outline-none focus:border-kaleo-primary transition"
              onKeyDown={(e) =>
                e.key === "Enter" && name.trim() && setRegistered(true)
              }
            />
            <button
              onClick={() => name.trim() && setRegistered(true)}
              className="w-full bg-kaleo-primary hover:bg-indigo-500 transition py-3 rounded-xl font-medium"
            >
              Enter Kaleo
            </button>
          </div>

          <p className="text-center text-xs text-kaleo-muted">
            Encrypted peer-to-peer · Low data · High quality
          </p>
        </div>
      </div>
    );
  }

  const inCall = ["calling", "connected"].includes(call.state);
  const hasVideo = !!call.localStream?.getVideoTracks().length;

  // ---------- Ready screen ----------
  if (!inCall) {
    return (
      <div className="min-h-screen bg-kaleo-bg text-white flex flex-col font-sans">
        {call.incoming && (
          <IncomingCall
            from={call.incoming.from}
            video={call.incoming.video}
            onAccept={() => call.acceptCall()}
            onDecline={call.declineCall}
          />
        )}

        <header className="px-4 py-3 flex items-center justify-between border-b border-kaleo-border">
          <div className="flex items-center gap-2">
            <Logo size={28} />
            <span className="font-display font-bold tracking-tight">
              Kaleo
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-kaleo-muted">
            <span className="h-2 w-2 rounded-full bg-kaleo-muted" />
            <span className="capitalize">{call.state}</span>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="w-full max-w-md space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-display font-bold">
                Ready to call
              </h2>
              <p className="text-kaleo-muted text-sm">
                Enter who you want to reach
              </p>
            </div>

            <input
              value={peerId}
              onChange={(e) => setPeerId(e.target.value)}
              placeholder="Peer name (e.g. bob)"
              className="w-full px-4 py-3 rounded-xl bg-kaleo-surface border border-kaleo-border outline-none focus:border-kaleo-primary transition text-center"
            />

            <div className="flex items-center justify-center gap-10 pt-4">
              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={() => call.startCall(peerId.trim(), true)}
                  disabled={!peerId.trim()}
                  aria-label="Video call"
                  className="flex items-center justify-center w-20 h-20 rounded-full bg-kaleo-primary hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition shadow-lg shadow-kaleo-primary/30"
                >
                  <VideoIcon size={32} />
                </button>
                <span className="text-xs text-kaleo-muted">Video</span>
              </div>

              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={() => call.startCall(peerId.trim(), false)}
                  disabled={!peerId.trim()}
                  aria-label="Voice call"
                  className="flex items-center justify-center w-20 h-20 rounded-full bg-kaleo-success hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed text-white transition shadow-lg shadow-kaleo-success/30"
                >
                  <Phone size={32} />
                </button>
                <span className="text-xs text-kaleo-muted">Voice</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ---------- In-call screen ----------
  return (
    <div className="h-screen bg-kaleo-bg text-white flex flex-col font-sans overflow-hidden">
      {call.incoming && (
        <IncomingCall
          from={call.incoming.from}
          video={call.incoming.video}
          onAccept={() => call.acceptCall()}
          onDecline={call.declineCall}
        />
      )}

      {hasVideo ? (
        // ==================== VIDEO CALL LAYOUT ====================
        <div className="relative flex-1 min-h-0">
          {/* Remote stream — full screen */}
          <VideoTile
            stream={call.remoteStream}
            label={peerId || "Peer"}
            variant="fullscreen"
            className="absolute inset-0"
          />

          {/* Top bar overlay — logo + timer */}
          <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent">
            <div className="flex items-center gap-2">
              <Logo size={24} />
              <span className="font-display font-bold tracking-tight text-sm">
                Kaleo
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/90">
              <span
                className={`h-2 w-2 rounded-full ${call.state === "connected"
                    ? "bg-kaleo-success"
                    : "bg-yellow-400 animate-pulse"
                  }`}
              />
              <span className="capitalize font-medium">
                {call.state === "connected"
                  ? formatDuration(call.durationSeconds)
                  : call.state}
              </span>
            </div>
          </div>

          {/* Your own camera — PiP top-right */}
          <VideoTile
            stream={call.localStream}
            muted
            label="You"
            variant="pip"
            mirrored
            className="absolute top-20 right-4 w-28 h-40 sm:w-40 sm:h-56 z-10"
          />

          {/* Bottom controls overlay */}
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-4 sm:gap-6 p-4 pb-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
            <button
              onClick={call.toggleMute}
              aria-label={call.muted ? "Unmute" : "Mute"}
              className={`flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full transition ${call.muted
                  ? "bg-kaleo-danger hover:bg-red-600 text-white"
                  : "bg-white/15 hover:bg-white/25 backdrop-blur text-white"
                }`}
            >
              {call.muted ? <MicOff size={22} /> : <Mic size={22} />}
            </button>

            <button
              onClick={call.toggleCam}
              aria-label={call.camOff ? "Turn camera on" : "Turn camera off"}
              className={`flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full transition ${call.camOff
                  ? "bg-kaleo-danger hover:bg-red-600 text-white"
                  : "bg-white/15 hover:bg-white/25 backdrop-blur text-white"
                }`}
            >
              {call.camOff ? <VideoOff size={22} /> : <VideoIcon size={22} />}
            </button>

            <button
              onClick={call.hangup}
              aria-label="End call"
              className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-kaleo-danger hover:bg-red-600 text-white transition"
            >
              <PhoneOff size={22} />
            </button>
          </div>
        </div>
      ) : (
        // ==================== VOICE CALL LAYOUT ====================
        <div className="relative flex-1 min-h-0 flex flex-col">
          {/* Center: avatar + name + timer */}
          <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
            <div className="relative">
              <span className="absolute inset-0 rounded-full bg-kaleo-primary/30 animate-pulse-ring" />
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-kaleo-primary flex items-center justify-center shadow-2xl">
                <span className="text-white font-display font-bold text-4xl sm:text-5xl">
                  {(peerId || "?").slice(0, 2).toUpperCase()}
                </span>
              </div>
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-display font-bold">
                {peerId || "Unknown"}
              </h2>
              <p className="text-kaleo-muted text-sm">
                {call.state === "connected"
                  ? formatDuration(call.durationSeconds)
                  : call.state === "calling"
                    ? "Calling..."
                    : call.state}
              </p>
            </div>
          </div>

          {/* Bottom controls */}
          <div className="flex items-center justify-center gap-6 p-4 pb-10">
            <button
              onClick={call.toggleMute}
              aria-label={call.muted ? "Unmute" : "Mute"}
              className={`flex items-center justify-center w-16 h-16 rounded-full transition ${call.muted
                  ? "bg-kaleo-danger hover:bg-red-600 text-white"
                  : "bg-white/10 hover:bg-white/20 text-white"
                }`}
            >
              {call.muted ? <MicOff size={24} /> : <Mic size={24} />}
            </button>

            <button
              onClick={call.hangup}
              aria-label="End call"
              className="flex items-center justify-center w-16 h-16 rounded-full bg-kaleo-danger hover:bg-red-600 text-white transition"
            >
              <PhoneOff size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}