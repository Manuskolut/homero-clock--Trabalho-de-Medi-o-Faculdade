type IconProps = { className?: string };

// Ícones usados nos cards de estatística do painel e em estados vazios —
// mesmo estilo de traço dos ícones de peça (peca-icons.tsx): viewBox 24,
// stroke currentColor, strokeWidth 1.5.

export function InboxIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path
        d="M3.5 12.5H8L9.5 15H14.5L16 12.5H20.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.5 8L3.5 12.5V18C3.5 18.83 4.17 19.5 5 19.5H19C19.83 19.5 20.5 18.83 20.5 18V12.5L19.5 8C19.3 6.98 18.4 6.25 17.36 6.25H6.64C5.6 6.25 4.7 6.98 4.5 8Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ClockAlertIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <circle cx="11" cy="13" r="7.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M11 9V13L13.5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 3H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M18.5 3.5L20 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function CalendarIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3.5 9.5H20.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 3V6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16 3V6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M7.5 13.5H9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M11 13.5H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M14.5 13.5H16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function TrayInIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M12 3.5V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 10L12 14L16 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M4 14V18C4 18.83 4.67 19.5 5.5 19.5H18.5C19.33 19.5 20 18.83 20 18V14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CheckCircleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8.5 12.3L10.6 14.5L15.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function WrenchOffIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path
        d="M14.5 6.5C15.7 5.3 17.5 4.9 19 5.6L16.3 8.3L16 10L17.7 10.3L20.4 7.6C21.1 9.1 20.7 10.9 19.5 12.1C18.3 13.3 16.5 13.7 15 13L8.5 19.5C7.8 20.2 6.6 20.2 5.9 19.5C5.2 18.8 5.2 17.6 5.9 16.9L12.4 10.4C11.7 8.9 12.1 7.1 13.3 5.9"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M4 4L20.5 20.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function EmptyBoxIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M3 8L12 4L21 8L12 12L3 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M3 8V16L12 20V12" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M21 8V16L12 20" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M9.5 9.5L15 6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}
