interface Props {
    size?: number;
    className?: string;
}

export function Logo({ size = 40, className = "" }: Props) {
    return (
        <img
            src="/kaleo.svg"
            alt="Kaleo"
            width={size}
            height={size}
            className={className}
            style={{ objectFit: "contain" }}
            draggable={false}
        />
    );
}