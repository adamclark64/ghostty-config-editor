import type { SVGProps } from "react";

export type IconName =
  | "palette"
  | "type"
  | "cursor"
  | "window"
  | "keys"
  | "mouse"
  | "render"
  | "scroll"
  | "shell"
  | "clipboard"
  | "app"
  | "gear"
  | "search"
  | "terminal"
  | "check"
  | "x"
  | "chevron"
  | "expand"
  | "save"
  | "undo"
  | "diff"
  | "dot"
  | "sun"
  | "moon"
  | "system"
  | "panel-left"
  | "panel-right";

interface IconProps extends Omit<SVGProps<SVGSVGElement>, "stroke"> {
  name: IconName;
  size?: number;
  stroke?: number;
}

export function Icon({ name, size = 16, stroke = 1.5, ...rest }: IconProps) {
  const base: SVGProps<SVGSVGElement> = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: stroke,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    ...rest,
  };
  switch (name) {
    case "palette":
      return (
        <svg {...base}>
          <circle cx="13.5" cy="6.5" r="1.5" />
          <circle cx="17.5" cy="10.5" r="1.5" />
          <circle cx="8.5" cy="7.5" r="1.5" />
          <circle cx="6.5" cy="12.5" r="1.5" />
          <path d="M12 2a10 10 0 1 0 0 20 2.5 2.5 0 0 0 2.5-2.5A2.5 2.5 0 0 1 17 17h2a3 3 0 0 0 3-3 10 10 0 0 0-10-10Z" />
        </svg>
      );
    case "type":
      return (
        <svg {...base}>
          <polyline points="4 7 4 4 20 4 20 7" />
          <line x1="9" x2="15" y1="20" y2="20" />
          <line x1="12" x2="12" y1="4" y2="20" />
        </svg>
      );
    case "cursor":
      return (
        <svg {...base}>
          <rect x="9" y="4" width="6" height="16" rx="1" />
          <line x1="9" y1="4" x2="6" y2="4" />
          <line x1="15" y1="4" x2="18" y2="4" />
          <line x1="9" y1="20" x2="6" y2="20" />
          <line x1="15" y1="20" x2="18" y2="20" />
        </svg>
      );
    case "window":
      return (
        <svg {...base}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
        </svg>
      );
    case "keys":
      return (
        <svg {...base}>
          <rect x="2" y="7" width="20" height="10" rx="2" />
          <line x1="6" y1="11" x2="6" y2="11" />
          <line x1="10" y1="11" x2="10" y2="11" />
          <line x1="14" y1="11" x2="14" y2="11" />
          <line x1="18" y1="11" x2="18" y2="11" />
          <line x1="7" y1="14" x2="17" y2="14" />
        </svg>
      );
    case "mouse":
      return (
        <svg {...base}>
          <rect x="6" y="3" width="12" height="18" rx="6" />
          <line x1="12" y1="7" x2="12" y2="11" />
        </svg>
      );
    case "render":
      return (
        <svg {...base}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" />
        </svg>
      );
    case "scroll":
      return (
        <svg {...base}>
          <polyline points="7 10 12 5 17 10" />
          <polyline points="7 14 12 19 17 14" />
        </svg>
      );
    case "shell":
      return (
        <svg {...base}>
          <polyline points="5 9 9 12 5 15" />
          <line x1="12" y1="15" x2="18" y2="15" />
        </svg>
      );
    case "clipboard":
      return (
        <svg {...base}>
          <rect x="8" y="3" width="8" height="4" rx="1" />
          <path d="M16 5h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2" />
        </svg>
      );
    case "app":
      return (
        <svg {...base}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      );
    case "gear":
      return (
        <svg {...base}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
        </svg>
      );
    case "search":
      return (
        <svg {...base}>
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.5" y2="16.5" />
        </svg>
      );
    case "terminal":
      return (
        <svg {...base}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <polyline points="7 9 10 12 7 15" />
          <line x1="12" y1="15" x2="16" y2="15" />
        </svg>
      );
    case "check":
      return (
        <svg {...base}>
          <polyline points="5 12 10 17 19 8" />
        </svg>
      );
    case "x":
      return (
        <svg {...base}>
          <line x1="6" y1="6" x2="18" y2="18" />
          <line x1="18" y1="6" x2="6" y2="18" />
        </svg>
      );
    case "chevron":
      return (
        <svg {...base}>
          <polyline points="9 6 15 12 9 18" />
        </svg>
      );
    case "expand":
      return (
        <svg {...base}>
          <polyline points="15 3 21 3 21 9" />
          <polyline points="9 21 3 21 3 15" />
          <line x1="21" y1="3" x2="14" y2="10" />
          <line x1="3" y1="21" x2="10" y2="14" />
        </svg>
      );
    case "save":
      return (
        <svg {...base}>
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
          <polyline points="17 21 17 13 7 13 7 21" />
          <polyline points="7 3 7 8 15 8" />
        </svg>
      );
    case "undo":
      return (
        <svg {...base}>
          <path d="M3 7v6h6" />
          <path d="M21 17a9 9 0 0 0-15-6.7L3 13" />
        </svg>
      );
    case "diff":
      return (
        <svg {...base}>
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      );
    case "dot":
      return (
        <svg {...base} fill="currentColor" stroke="none">
          <circle cx="12" cy="12" r="4" />
        </svg>
      );
    case "sun":
      return (
        <svg {...base}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      );
    case "moon":
      return (
        <svg {...base}>
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
        </svg>
      );
    case "system":
      return (
        <svg {...base}>
          <rect x="3" y="4" width="18" height="12" rx="2" />
          <line x1="8" y1="20" x2="16" y2="20" />
          <line x1="12" y1="16" x2="12" y2="20" />
        </svg>
      );
    case "panel-left":
      return (
        <svg {...base}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <line x1="9" y1="4" x2="9" y2="20" />
        </svg>
      );
    case "panel-right":
      return (
        <svg {...base}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <line x1="15" y1="4" x2="15" y2="20" />
        </svg>
      );
  }
}
