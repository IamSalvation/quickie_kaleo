import { useState } from "react";
import { useCall } from "./hooks/useCall";
import { VideoTile } from "./components/VideoTile";
import { Controls } from "./components/Controls";
import { IncomingCall } from "./components/IncomingCall";
import { Logo } from "./components/Logo";

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

  // ---------- Call screen ----------
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
          <span className="font-display font-bold tracking-tight">Kaleo</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-kaleo-muted">
          <span
            className={`h-2 w-2 rounded-full ${call.state === "connected"
                ? "bg-kaleo-success"
                : "bg-kaleo-muted"
              }`}
          />
          <span className="capitalize">{call.state}</span>
        </div>
      </header>

      <main className="flex-1 p-4">
        {inCall ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 h-full">
            <VideoTile
              stream={call.localStream}
              muted
              label="You"
              className="aspect-video"
            />
            <VideoTile
              stream={call.remoteStream}
              label={peerId || "Peer"}
              className="aspect-video"
            />
          </div>
        ) : (
          <div className="max-w-md mx-auto mt-12 space-y-4">
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
              className="w-full px-4 py-3 rounded-xl bg-kaleo-surface border border-kaleo-border outline-none focus:border-kaleo-primary transition"
            />

            <div className="flex gap-3">
              <button
                onClick={() => call.startCall(peerId.trim(), true)}
                className="flex-1 bg-kaleo-primary hover:bg-indigo-500 transition py-3 rounded-xl font-medium flex items-center justify-center gap-2"
              >
                📹 Video
              </button>
              <button
                onClick={() => call.startCall(peerId.trim(), false)}
                className="flex-1 bg-kaleo-surface border border-kaleo-border hover:border-kaleo-accent transition py-3 rounded-xl font-medium flex items-center justify-center gap-2"
              >
                📞 Voice
              </button>
            </div>
          </div>
        )}
      </main>

      {inCall && (
        <Controls
          muted={call.muted}
          camOff={call.camOff}
          onToggleMute={call.toggleMute}
          onToggleCam={call.toggleCam}
          onHangup={call.hangup}
        />
      )}
    </div>
  );
}