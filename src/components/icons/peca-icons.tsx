type IconProps = { className?: string };

export function CaixaIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M3 8L12 4L21 8L12 12L3 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M3 8V16L12 20V12" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M21 8V16L12 20" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function PulseiraIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <rect x="2" y="9" width="6.5" height="6" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="8.75" y="9" width="6.5" height="6" stroke="currentColor" strokeWidth="1.5" />
      <rect x="15.5" y="9" width="6.5" height="6" rx="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function VidroIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path
        d="M12 3C12 3 6 10.5 6 14.5C6 18.09 8.69 21 12 21C15.31 21 18 18.09 18 14.5C18 10.5 12 3 12 3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MostradorIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 5V6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 17.5V19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M5 12H6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M17.5 12H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  );
}
