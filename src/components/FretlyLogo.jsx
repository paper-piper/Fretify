/**
 * FretlyLogo
 * Icon mark: 3 curved strings + 3 straight frets, rotated ~28° CCW
 * 3 gold dots diagonally at string-fret intersections
 * Brand brief spec: strings = #6B5CE7, frets = #2A2545, dots = #EF9F27
 */
export default function FretlyLogo({ size = 32, withWordmark = false, className = '' }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Icon mark */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Icon background rounded square */}
        <rect width="40" height="40" rx="9" fill="#1E1B30" />

        {/* Group rotated ~28° CCW around centre */}
        <g transform="rotate(-28, 20, 20)">
          {/* === 3 FRETS (horizontal straight lines) === */}
          {/* Fret 1 – top */}
          <line x1="8" y1="13" x2="32" y2="13" stroke="#2A2545" strokeWidth="1.6" strokeLinecap="round" />
          {/* Fret 2 – middle */}
          <line x1="8" y1="20" x2="32" y2="20" stroke="#2A2545" strokeWidth="1.6" strokeLinecap="round" />
          {/* Fret 3 – bottom */}
          <line x1="8" y1="27" x2="32" y2="27" stroke="#2A2545" strokeWidth="1.6" strokeLinecap="round" />

          {/* === 3 STRINGS (curved vertical paths) === */}
          {/* String 1 – left, faded */}
          <path
            d="M 13 8 C 12.5 14 13.5 26 13 32"
            stroke="#6B5CE7"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.55"
          />
          {/* String 2 – centre, brightest */}
          <path
            d="M 20 8 C 19 14 21 26 20 32"
            stroke="#6B5CE7"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="1"
          />
          {/* String 3 – right, faded */}
          <path
            d="M 27 8 C 27.5 14 26.5 26 27 32"
            stroke="#6B5CE7"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.55"
          />

          {/* === 3 GOLD DOTS — diagonal: top-left, centre, bottom-right === */}
          {/* Dot 1: string 1 × fret 1 */}
          <circle cx="13" cy="13" r="2.8" fill="#EF9F27" />
          {/* Dot 2: string 2 × fret 2 */}
          <circle cx="20" cy="20" r="2.8" fill="#EF9F27" />
          {/* Dot 3: string 3 × fret 3 */}
          <circle cx="27" cy="27" r="2.8" fill="#EF9F27" />
        </g>
      </svg>

      {/* Wordmark — Syne Bold, lowercase, -0.5px tracking */}
      {withWordmark && (
        <span
          className="font-syne font-bold text-text-primary tracking-wordmark select-none"
          style={{ fontSize: size * 0.6 }}
        >
          fretly
        </span>
      )}
    </div>
  );
}
