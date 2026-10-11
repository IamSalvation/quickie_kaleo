export type CallState =
    | "idle"
    | "calling"
    | "ringing"
    | "connected"
    | "ended";

export interface IncomingCall {
    from: string;
    offer: RTCSessionDescriptionInit;
    video: boolean;
}

export interface AnswerPayload {
    answer: RTCSessionDescriptionInit;
}

export interface IcePayload {
    candidate: RTCIceCandidateInit;
}