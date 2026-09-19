import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Svg({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  );
}

export function IconCalendar(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M3.5 10h17" />
      <path d="M8 3.5v4M16 3.5v4" />
      <path d="M8.5 14h.5M12 14h.5M15.5 14h.5M8.5 17h.5M12 17h.5" />
    </Svg>
  );
}

export function IconPlayers(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M7.2 5.4c3.4 2.6 3.4 10.6 0 13.2" />
      <path d="M16.8 5.4c-3.4 2.6-3.4 10.6 0 13.2" />
    </Svg>
  );
}

export function IconPin(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 21s6.5-5.6 6.5-10.2a6.5 6.5 0 1 0-13 0C5.5 15.4 12 21 12 21z" />
      <circle cx="12" cy="10.5" r="2.2" />
    </Svg>
  );
}

export function IconClub(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 20V9.2L12 4l8 5.2V20" />
      <path d="M9 20v-6h6v6" />
      <path d="M4 20h16" />
    </Svg>
  );
}

export function IconTrophy(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8 4h8v3.2a4 4 0 0 1-4 4 4 4 0 0 1-4-4V4z" />
      <path d="M8 6.2H5.5A2.5 2.5 0 0 0 8 8.6" />
      <path d="M16 6.2h2.5A2.5 2.5 0 0 1 16 8.6" />
      <path d="M12 11.2V15" />
      <path d="M9 20h6M10.5 15h3L14 20h-4l.5-5z" />
    </Svg>
  );
}

export function IconSpark(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 3.5 13.6 9l5.9 1.6-5.9 1.6L12 17.7l-1.6-5.5L4.5 10.6 10.4 9z" />
      <path d="M18.5 15.5 19.3 18l2.5.7-2.5.7-.8 2.5-.8-2.5-2.5-.7 2.5-.7z" />
    </Svg>
  );
}

export function IconMail(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3.5" y="5.5" width="17" height="13" rx="1.6" />
      <path d="m4.2 7.2 7.8 6.2 7.8-6.2" />
    </Svg>
  );
}

export function IconLive(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="3.2" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="6.5" />
      <circle cx="12" cy="12" r="9.5" />
    </Svg>
  );
}

export function IconPlay(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M10 8.8 16 12l-6 3.2V8.8z" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function IconMegaphone(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4.5 10.5v3h2.2L14 17.5V6.5L6.7 10.5H4.5z" />
      <path d="M16.5 9.2a3.2 3.2 0 0 1 0 5.6" />
      <path d="M7.2 13.6 8 18.2h2.2l-.6-4" />
    </Svg>
  );
}

export function IconNow(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4.5 10.8 12 4.5l7.5 6.3V20h-5.2v-5.2H9.7V20H4.5V10.8z" />
    </Svg>
  );
}

export function IconInfo(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11.2V17" />
      <path d="M12 7.6h.01" />
    </Svg>
  );
}

export function IconCar(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 15.5v2.2h2.2M18 17.7h2V15.5M4 15.5l1.4-5.2A2 2 0 0 1 7.3 8.8h9.4a2 2 0 0 1 1.9 1.5l1.4 5.2" />
      <circle cx="7.2" cy="17.7" r="1.5" />
      <circle cx="16.8" cy="17.7" r="1.5" />
    </Svg>
  );
}

export function IconFood(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4.8 11.5h14.4v7.2a1.6 1.6 0 0 1-1.6 1.6H6.4a1.6 1.6 0 0 1-1.6-1.6v-7.2z" />
      <path d="M8 11.5V7.8a4 4 0 0 1 8 0v3.7" />
    </Svg>
  );
}

export function IconSun(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="3.4" />
      <path d="M12 4.5v1.8M12 17.7v1.8M4.5 12h1.8M17.7 12h1.8M6.6 6.6l1.3 1.3M16.1 16.1l1.3 1.3M17.4 6.6l-1.3 1.3M7.9 16.1l-1.3 1.3" />
    </Svg>
  );
}

export function IconChild(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="8" r="2.4" />
      <path d="M7.5 19v-2.2A4.5 4.5 0 0 1 12 12.3a4.5 4.5 0 0 1 4.5 4.5V19" />
    </Svg>
  );
}

export function IconTicket(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 8.5h16v3a2 2 0 0 0 0 4v3H4v-3a2 2 0 0 0 0-4v-3z" />
      <path d="M9.5 8.5v10" strokeDasharray="1.6 2" />
    </Svg>
  );
}

export function IconShare(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="6.5" cy="12" r="2.2" />
      <circle cx="17" cy="6.8" r="2.2" />
      <circle cx="17" cy="17.2" r="2.2" />
      <path d="m8.4 11 6.2-3.2M8.4 13l6.2 3.2" />
    </Svg>
  );
}

export function IconPhone(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8 4.5h8A1.5 1.5 0 0 1 17.5 6v12a1.5 1.5 0 0 1-1.5 1.5H8A1.5 1.5 0 0 1 6.5 18V6A1.5 1.5 0 0 1 8 4.5z" />
      <path d="M10.5 17.2h3" />
    </Svg>
  );
}

export function IconCamera(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4.5 8.2h3.1l1.2-1.7h6.4l1.2 1.7h3.1v10.1H4.5V8.2z" />
      <circle cx="12" cy="13.1" r="2.8" />
    </Svg>
  );
}

export function IconBell(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 4.5a5 5 0 0 1 5 5c0 4.2 1.5 5.5 1.5 5.5H5.5S7 13.7 7 9.5a5 5 0 0 1 5-5z" />
      <path d="M10 19.2a2 2 0 0 0 4 0" />
    </Svg>
  );
}
