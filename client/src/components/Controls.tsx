interface Props {
    muted: boolean;
    camOff: boolean;
    onToggleMute: () => void;
    onToggleCam: () => void;
    onHangup: () => void;
}

export function Controls({
    muted,
    camOff,
    onToggleMute,
    onToggleCam,
    onHangup,
}: Props) {
    return (
        <div className="flex gap-3 justify-center p-4 bg-kaleo-surface/80 backdrop-blur border-t border-kaleo-border">
            <button
                onClick={onToggleMute}
                aria-label={muted ? "Unmute" : "Mute"}
                className={`px-5 py-3 rounded-full text-white font-medium transition ${muted
                        ? "bg-kaleo-danger hover:bg-red-600"
                        : "bg-kaleo-border hover:bg-slate-700"
                    }`}
            >
                {muted ? "🔇" : "🎤"}
            </button>
            <button
                onClick={onToggleCam}
                aria-label={camOff ? "Turn camera on" : "Turn camera off"}
                className={`px-5 py-3 rounded-full text-white font-medium transition ${camOff
                        ? "bg-kaleo-danger hover:bg-red-600"
                        : "bg-kaleo-border hover:bg-slate-700"
                    }`}
            >
                {camOff ? "📷" : "📹"}
            </button>
            <button
                onClick={onHangup}
                className="px-6 py-3 rounded-full bg-kaleo-danger hover:bg-red-600 text-white font-medium transition"
            >
                End
            </button>
        </div>
    );
}