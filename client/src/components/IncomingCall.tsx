import { Logo } from "./Logo";

interface Props {
    from: string;
    video: boolean;
    onAccept: () => void;
    onDecline: () => void;
}

export function IncomingCall({ from, video, onAccept, onDecline }: Props) {
    return (
        <div className="fixed inset-0 bg-kaleo-bg/95 backdrop-blur flex items-center justify-center z-50 animate-fade-in">
            <div className="w-full max-w-sm p-6 text-center">
                <div className="relative mx-auto mb-6 w-24 h-24">
                    <span className="absolute inset-0 rounded-full bg-kaleo-primary/40 animate-pulse-ring" />
                    <div className="relative w-24 h-24 rounded-full bg-kaleo-primary flex items-center justify-center">
                        <Logo size={48} />
                    </div>
                </div>

                <h2 className="text-2xl font-display font-bold">
                    {video ? "Kaleo Video Call" : "Kaleo Voice Call"}
                </h2>
                <p className="text-kaleo-muted mt-1">
                    <span className="text-white font-medium">{from}</span> is calling
                </p>

                <div className="flex gap-4 mt-10">
                    <button
                        onClick={onDecline}
                        className="flex-1 bg-kaleo-danger hover:bg-red-600 py-4 rounded-2xl font-medium transition"
                    >
                        Decline
                    </button>
                    <button
                        onClick={onAccept}
                        className="flex-1 bg-kaleo-success hover:bg-green-600 py-4 rounded-2xl font-medium transition"
                    >
                        Accept
                    </button>
                </div>
            </div>
        </div>
    );
}