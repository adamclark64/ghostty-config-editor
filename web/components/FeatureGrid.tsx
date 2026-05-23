type Feature = {
  title: string;
  body: string;
  icon: React.ReactNode;
};

const FEATURES: Feature[] = [
  {
    title: "Sidebar search across ~580 keys",
    body: "Type and jump straight to any Ghostty config key. The full schema is parsed from your installed Ghostty — nothing is hardcoded or missed.",
    icon: <SearchIcon />,
  },
  {
    title: "Live preview with WCAG checks",
    body: "A mock terminal renders your colors in real time, flags contrast failures, and validates values before they ever touch your config file.",
    icon: <PreviewIcon />,
  },
  {
    title: "Theme gallery & iTerm2 palettes",
    body: "Browse a built-in gallery of community themes. Preview each one against your config, then apply with a single click.",
    icon: <PaletteIcon />,
  },
  {
    title: "Purpose-built editors",
    body: "An HSV color picker, a chord-capture modal for keybinds, a 256-color grid, and a keycap-style binding view — instead of editing raw strings.",
    icon: <ToolIcon />,
  },
  {
    title: "Timestamped backups",
    body: "Every save creates a `.bak-*` snapshot. Browse them in-app and restore any previous config with one click — no manual file shuffling.",
    icon: <ClockIcon />,
  },
  {
    title: "Hot-reload running Ghostty",
    body: "Send a reload signal to a running Ghostty session and watch your changes take effect without restarting the terminal.",
    icon: <BoltIcon />,
  },
];

export function FeatureGrid() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <div className="mb-12 max-w-2xl">
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Built around how you actually configure a terminal.
        </h2>
        <p className="mt-4 text-lg text-muted">
          Not a YAML editor with syntax highlighting — a real UI for every kind
          of setting Ghostty supports.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="rounded-2xl border border-border bg-surface p-6 transition hover:border-border-strong"
          >
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-bg-2 text-accent">
              {f.icon}
            </div>
            <h3 className="text-lg font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Stroke({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden
    >
      {children}
    </svg>
  );
}

function SearchIcon() {
  return (
    <Stroke>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </Stroke>
  );
}

function PreviewIcon() {
  return (
    <Stroke>
      <rect x="3" y="4" width="18" height="14" rx="2" />
      <path d="M7 9l2 2-2 2M11 13h4" />
    </Stroke>
  );
}

function PaletteIcon() {
  return (
    <Stroke>
      <path d="M12 3a9 9 0 1 0 0 18 3 3 0 0 0 0-6h-1a3 3 0 0 1 0-6h2a8 8 0 0 0-1-6Z" />
      <circle cx="7.5" cy="10.5" r="1" />
      <circle cx="12" cy="7.5" r="1" />
      <circle cx="16.5" cy="10.5" r="1" />
    </Stroke>
  );
}

function ToolIcon() {
  return (
    <Stroke>
      <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-2.4 2.6-2.6Z" />
    </Stroke>
  );
}

function ClockIcon() {
  return (
    <Stroke>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </Stroke>
  );
}

function BoltIcon() {
  return (
    <Stroke>
      <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
    </Stroke>
  );
}
