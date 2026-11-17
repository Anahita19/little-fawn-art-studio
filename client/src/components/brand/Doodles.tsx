interface DoodleProps {
  className?: string;
  stroke?: string;
}

export function SparkleDoodle({ className, stroke = "#E39A4E" }: DoodleProps) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <g stroke={stroke} strokeWidth="2.6" strokeLinecap="round" fill="none">
        <path d="M20 6c0 7 3 10 10 10-7 0-10 3-10 10 0-7-3-10-10-10 7 0 10-3 10-10z" />
        <path d="M31 26c0 3.4 1.4 4.8 4.8 4.8-3.4 0-4.8 1.4-4.8 4.8 0-3.4-1.4-4.8-4.8-4.8 3.4 0 4.8-1.4 4.8-4.8z" />
      </g>
    </svg>
  );
}

export function SquiggleDoodle({ className, stroke = "#95C9A0" }: DoodleProps) {
  return (
    <svg viewBox="0 0 120 24" className={className} aria-hidden="true">
      <path
        d="M3 16c9-11 17-11 26 0s17 11 26 0 17-11 26 0 17 11 26 0"
        stroke={stroke}
        strokeWidth="3.4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function SunDoodle({ className, stroke = "#F0B45E" }: DoodleProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <g stroke={stroke} strokeWidth="2.8" strokeLinecap="round" fill="none">
        <circle cx="32" cy="32" r="12" />
        <path d="M32 8v7M32 49v7M8 32h7M49 32h7M15 15l5 5M44 44l5 5M49 15l-5 5M20 44l-5 5" />
      </g>
    </svg>
  );
}

export function HeartDoodle({ className, stroke = "#F0A6B6" }: DoodleProps) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <path
        d="M20 33C11 26 5 21 5 15.5 5 11 8.4 8 12.2 8c3 0 5.7 1.8 7.8 5 2.1-3.2 4.8-5 7.8-5C31.6 8 35 11 35 15.5 35 21 29 26 20 33z"
        stroke={stroke}
        strokeWidth="2.6"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function TapeStrip({ className }: { className?: string }) {
  return <span className={className} aria-hidden="true" />;
}
