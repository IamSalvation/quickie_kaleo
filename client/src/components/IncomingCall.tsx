import { Phone, PhoneOff } from "lucide-react";
import { Logo } from "./Logo";

interface Props {
    from: string;
    video: boolean;
    onAccept: () => void;
    onDecline: () => void;
}

export function IncomingCall({ from, video, onAccept, onDecline }: Props) {
    return (
        <div className="fixed inset-0 bg-kaleo-bg/95 backdrop-blur flex items-center justify-center z-50 animate-fade-in p-6">
            <div className="w-full max-w-sm flex flex-col items-center">
                <div className="relative mb-6 w-28 h-28">
                    <span className="absolute inset-0 rounded-full bg-kaleo-primary/40 animate-pulse-ring" />
                    <div className="relative w-28 h-28 rounded-full bg-kaleo-primary flex items-center justify-center">
                        <Logo size={56} />
                    </div>
                </div>

                <h2 className="text-2xl font-display font-bold text-center">
                    {video ? "Kaleo Video Call" : "Kaleo Voice Call"}
                </h2>
                <p className="text-kaleo-muted mt-1 text-center">
                    <span className="text-white font-medium">{from}</span> is calling
                </p>

                <div className="flex items-center justify-center gap-8 mt-14">
                    <div className="flex flex-col items-center gap-2">
                        <button
                            onClick={onDecline}
                            aria-label="Decline"
                            className="flex items-center justify-center w-16 h-16 rounded-full bg-kaleo-danger hover:bg-red-600 text-white transition"
                        >
                            <PhoneOff size={26} />
                        </button>
                        <span className="text-xs text-kaleo-muted">Decline</span>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        <button
                            onClick={onAccept}
                            aria-label="Accept"
                            className="flex items-center justify-center w-16 h-16 rounded-full bg-kaleo-success hover:bg-green-600 text-white transition"
                        >
                            <Phone size={26} />
                        </button>
                        <span className="text-xs text-kaleo-muted">Accept</span>
                    </div>
                </div>
            </div>
        </div>
    );
}