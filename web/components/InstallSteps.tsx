import type { LatestRelease } from "@/lib/release";
import { DownloadButtons } from "./DownloadButtons";

type Props = {
  release: LatestRelease;
};

export function InstallSteps({ release }: Props) {
  return (
    <section className="border-y border-border bg-bg-2/60">
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-[1fr_1.2fr] md:gap-16">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Install in a minute.
            </h2>
            <p className="mt-4 text-lg text-muted">
              The app is ad-hoc signed, so macOS will warn you about the
              developer the first time you open it. These steps walk you past
              the warning.
            </p>
            <div className="mt-8">
              <DownloadButtons release={release} variant="compact" />
            </div>
          </div>
          <ol className="flex flex-col gap-6">
            <Step
              n={1}
              title="Download the right DMG"
              body="Apple Silicon (M1/M2/M3/M4) Macs get the aarch64 build. Older Intel Macs get the x64 build."
            />
            <Step
              n={2}
              title="Drag to Applications"
              body="Open the DMG and drag Ghostty Config Editor into your Applications folder."
            />
            <Step
              n={3}
              title="First launch: right-click → Open"
              body={
                <>
                  Don&apos;t double-click — macOS will say &quot;unidentified
                  developer&quot;. Instead, right-click the app and choose{" "}
                  <span className="font-mono text-fg">Open</span>, then click{" "}
                  <span className="font-mono text-fg">Open</span> again in the
                  dialog. After this once, you can launch it normally.
                </>
              }
            />
            <Step
              n={4}
              title="Point it at your config"
              body={
                <>
                  The app auto-discovers{" "}
                  <span className="font-mono text-fg">
                    ~/.config/ghostty/config
                  </span>
                  . If yours lives elsewhere, use the file picker on first
                  launch.
                </>
              }
            />
          </ol>
        </div>
      </div>
    </section>
  );
}

function Step({
  n,
  title,
  body,
}: {
  n: number;
  title: string;
  body: React.ReactNode;
}) {
  return (
    <li className="flex gap-5">
      <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full border border-border-strong bg-surface font-mono text-sm text-accent">
        {n}
      </div>
      <div className="pt-1">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted">{body}</p>
      </div>
    </li>
  );
}
