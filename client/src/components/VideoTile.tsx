import { useEffect, useRef } from "react";

interface Props {
    stream: MediaStream | null;
    muted?: boolean;
    label?: string;
    className?: string;
}

export function VideoTile({ stream, muted, label, className = "" }: Props) {
    const ref = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (ref.current && stream) {
            ref.current.srcObject = stream;
        }
    }, [stream]);

    const initials = label
        ? label
            .split(" ")
            .map((w) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()
        : "?";

    return (
        <div
            className={`relative bg-kaleo-surface border border-kaleo-border rounded-2xl overflow-hidden ${className}`}
        >
            {stream ? (
                <video
                    ref={ref}
                    autoPlay
                    playsInline
                    muted={muted}
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-kaleo-primary/20 text-kaleo-primary flex items-center justify-center font-display font-bold text-xl">
                        {initials}
                    </div>
                </div>
            )}
            {label && (
                <span className="absolute bottom-2 left-2 bg-black/60 backdrop-blur text-white text-xs px-2.5 py-1 rounded-lg">
                    {label}
                </span>
            )}
        </div>
    );
}