// Pose decorativa padrão do app — mesma usada no header antes de calcular a
// hora real do usuário. Serve como pose fixa em contextos estáticos (impressão).
const POSE_ESTATICA = { hourDeg: 300, minuteDeg: 60 };

export function ClockLogoIcon({
  className,
  hourDeg = POSE_ESTATICA.hourDeg,
  minuteDeg = POSE_ESTATICA.minuteDeg,
  animado = false,
}: {
  className?: string;
  hourDeg?: number;
  minuteDeg?: number;
  animado?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="24" cy="24" r="21" stroke="currentColor" strokeWidth="2.5" />
      <path d="M24 4V7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M24 41V44" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line
        x1="24"
        y1="24"
        x2="24"
        y2="17"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        transform={`rotate(${hourDeg} 24 24)`}
        style={animado ? { transition: "transform 0.3s ease-out" } : undefined}
      />
      <line
        x1="24"
        y1="24"
        x2="24"
        y2="13"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        transform={`rotate(${minuteDeg} 24 24)`}
        style={animado ? { transition: "transform 0.3s ease-out" } : undefined}
      />
      <circle cx="24" cy="24" r="1.8" fill="currentColor" />
    </svg>
  );
}
