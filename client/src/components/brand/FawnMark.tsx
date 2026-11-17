interface FawnMarkProps {
  className?: string;
  title?: string;
}

export function FawnMark({ className, title }: FawnMarkProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label={title ?? "Little Fawn"}>
      <g stroke="#3F342B" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23.5 15.5c-2.4-3.6-2.6-6.6-0.8-9.2" fill="none" />
        <path d="M19.6 9.4c1.9 0.4 3.2 1.2 4 2.4" fill="none" />
        <path d="M40.5 15.5c2.4-3.6 2.6-6.6 0.8-9.2" fill="none" />
        <path d="M44.4 9.4c-1.9 0.4-3.2 1.2-4 2.4" fill="none" />
        <ellipse cx="16.4" cy="21.6" rx="7.6" ry="4.4" transform="rotate(-26 16.4 21.6)" fill="#D99A5B" />
        <ellipse cx="47.6" cy="21.6" rx="7.6" ry="4.4" transform="rotate(26 47.6 21.6)" fill="#D99A5B" />
        <path
          d="M32 16.8c9.2 0 15.2 6.3 15.2 14.4 0 10-6.8 17-15.2 17s-15.2-7-15.2-17c0-8.1 6-14.4 15.2-14.4z"
          fill="#D99A5B"
        />
        <ellipse cx="32" cy="43.2" rx="7.4" ry="5.2" fill="#FBE9CF" />
        <path d="M23.4 32.2c1.3-1.8 3.4-1.8 4.7 0" fill="none" />
        <path d="M35.9 32.2c1.3-1.8 3.4-1.8 4.7 0" fill="none" />
        <path d="M29.8 41h4.4l-2.2 2.6z" fill="#3F342B" />
        <circle cx="26.2" cy="24.2" r="1.7" fill="#FBE9CF" stroke="none" />
        <circle cx="32" cy="22.4" r="1.5" fill="#FBE9CF" stroke="none" />
        <circle cx="37.8" cy="24.2" r="1.7" fill="#FBE9CF" stroke="none" />
        <circle cx="26" cy="24.2" r="1.7" fill="none" strokeWidth="1" opacity="0.35" />
        <circle cx="32" cy="22.4" r="1.5" fill="none" strokeWidth="1" opacity="0.35" />
        <circle cx="37.8" cy="24.2" r="1.7" fill="none" strokeWidth="1" opacity="0.35" />
      </g>
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={className}>
      <span className="block font-display text-[17px] font-extrabold leading-tight tracking-tight">
        Little Fawn
      </span>
      <span className="block text-[10px] font-bold uppercase tracking-[0.24em] text-ink-soft">
        Art Studio
      </span>
    </span>
  );
}
