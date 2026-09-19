type ArtId = "food" | "photo" | "spark" | "music" | "court";

export function CourtLines({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 780 360" className={className} preserveAspectRatio="xMidYMid slice" aria-hidden>
      <g fill="none" stroke="currentColor" strokeWidth="2.2">
        <rect x="40" y="28" width="700" height="304" />
        <rect x="40" y="72" width="700" height="216" />
        <line x1="390" y1="28" x2="390" y2="332" />
        <line x1="214" y1="72" x2="214" y2="288" />
        <line x1="566" y1="72" x2="566" y2="288" />
        <line x1="214" y1="180" x2="566" y2="180" />
      </g>
    </svg>
  );
}

export function TennisBall({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <circle cx="24" cy="24" r="22" fill="#F8C828" />
      <path d="M7 16c9 7 9 17 0 24" fill="none" stroke="#1A2751" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M41 16c-9 7-9 17 0 24" fill="none" stroke="#1A2751" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

function FoodArt() {
  return (
    <g>
      <rect x="8" y="18" width="64" height="8" rx="1" fill="#F8C828" />
      <path d="M8 18h64l-6 10H14z" fill="#F8C828" />
      <rect x="12" y="28" width="18" height="32" rx="2" fill="#152448" />
      <rect x="31" y="28" width="18" height="32" rx="2" fill="#152448" />
      <rect x="50" y="28" width="18" height="32" rx="2" fill="#152448" />
      <rect x="15" y="34" width="12" height="8" rx="1" fill="#F8C828" />
      <rect x="34" y="34" width="12" height="8" rx="1" fill="#ffffff" fillOpacity="0.85" />
      <rect x="53" y="34" width="12" height="8" rx="1" fill="#F8C828" />
      <circle cx="21" cy="50" r="4" fill="#ffffff" fillOpacity="0.35" />
      <circle cx="40" cy="50" r="4" fill="#ffffff" fillOpacity="0.35" />
      <circle cx="59" cy="50" r="4" fill="#ffffff" fillOpacity="0.35" />
    </g>
  );
}

function PhotoArt() {
  return (
    <g>
      <rect x="14" y="28" width="52" height="34" rx="4" fill="#152448" />
      <path d="M22 28 26 20h12l4 8" fill="#F8C828" />
      <circle cx="40" cy="45" r="10" fill="#1A2751" />
      <circle cx="40" cy="45" r="6" fill="#F8C828" />
      <circle cx="56" cy="36" r="2.2" fill="#ffffff" />
    </g>
  );
}

function SparkArt() {
  return (
    <g>
      <rect x="24" y="34" width="32" height="26" rx="3" fill="#152448" />
      <path d="M24 34h32l-6-10H30z" fill="#F8C828" />
      <circle cx="40" cy="28" r="5" fill="#F8C828" />
      <path d="M40 8v8M32 12l4 5M48 12l-4 5" stroke="#F8C828" strokeWidth="2.2" strokeLinecap="round" />
    </g>
  );
}

function MusicArt() {
  return (
    <g>
      <rect x="14" y="18" width="24" height="44" rx="4" fill="#152448" />
      <rect x="42" y="26" width="24" height="36" rx="4" fill="#152448" />
      <rect x="18" y="48" width="6" height="10" rx="1" fill="#F8C828" />
      <rect x="26" y="40" width="6" height="18" rx="1" fill="#ffffff" fillOpacity="0.7" />
      <rect x="46" y="44" width="6" height="14" rx="1" fill="#F8C828" />
      <rect x="54" y="34" width="6" height="24" rx="1" fill="#ffffff" fillOpacity="0.7" />
      <circle cx="26" cy="24" r="4" fill="#F8C828" />
    </g>
  );
}

function CourtArt() {
  return (
    <g fill="none" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="2">
      <rect x="12" y="16" width="56" height="48" />
      <rect x="12" y="24" width="56" height="32" />
      <line x1="40" y1="16" x2="40" y2="64" stroke="#F8C828" strokeOpacity="1" strokeWidth="2.6" />
      <line x1="26" y1="24" x2="26" y2="56" />
      <line x1="54" y1="24" x2="54" y2="56" />
      <line x1="26" y1="40" x2="54" y2="40" />
    </g>
  );
}

const ARTS = {
  food: FoodArt,
  photo: PhotoArt,
  spark: SparkArt,
  music: MusicArt,
  court: CourtArt,
};

export function AttractionArt({ id, className = "" }: { id: ArtId; className?: string }) {
  const Art = ARTS[id];
  return (
    <svg viewBox="0 0 80 80" className={`h-full w-full ${className}`} aria-hidden>
      <rect width="80" height="80" fill="#1A2751" />
      <Art />
    </svg>
  );
}
