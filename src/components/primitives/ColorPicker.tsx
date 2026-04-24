import { useEffect, useRef, useState } from "react";
import { hexToHsv, hsvToHex, isValidHex } from "@/lib/color";

interface ColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
}

/**
 * HSV saturation-value plane + hue slider + hex input.
 *
 * We use HSV (not HSL) because the gradient overlay — white-to-hue horizontal
 * blended with transparent-to-black vertical — visually suggests HSV: the
 * top-right corner reads as "pure hue" to users. HSL state would map that
 * corner to pure white regardless of hue (since L=100% is always white).
 */
export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const seed = isValidHex(value) ? value : "#c6a0f6";
  const init = hexToHsv(seed);
  const [h, setH] = useState(init.h);
  const [s, setS] = useState(init.s);
  const [v, setV] = useState(init.v);
  const [hexInput, setHexInput] = useState(seed);

  const hex = hsvToHex(h, s, v);

  useEffect(() => {
    onChange(hex);
    setHexInput(hex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hex]);

  const plane = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const applyPlane = (clientX: number, clientY: number) => {
    const el = plane.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
    const y = Math.max(0, Math.min(1, (clientY - r.top) / r.height));
    setS(x * 100);
    setV((1 - y) * 100);
  };

  useEffect(() => {
    const up = () => {
      dragging.current = false;
    };
    const mv = (e: MouseEvent) => {
      if (dragging.current) applyPlane(e.clientX, e.clientY);
    };
    window.addEventListener("mouseup", up);
    window.addEventListener("mousemove", mv);
    return () => {
      window.removeEventListener("mouseup", up);
      window.removeEventListener("mousemove", mv);
    };
  }, []);

  const onPlaneKey = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 1;
    if (e.key === "ArrowLeft") setS((c) => Math.max(0, c - step));
    else if (e.key === "ArrowRight") setS((c) => Math.min(100, c + step));
    else if (e.key === "ArrowUp") setV((c) => Math.min(100, c + step));
    else if (e.key === "ArrowDown") setV((c) => Math.max(0, c - step));
    else return;
    e.preventDefault();
  };

  return (
    <div
      className="w-[240px] p-3 rounded-xl"
      style={{
        background: "var(--surface-raised)",
        border: "1px solid var(--border)",
        color: "var(--fg)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,0,0,0.2)",
      }}
    >
      <div
        ref={plane}
        role="slider"
        tabIndex={0}
        aria-label="Saturation and value"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(s)}
        onMouseDown={(e) => {
          dragging.current = true;
          applyPlane(e.clientX, e.clientY);
        }}
        onKeyDown={onPlaneKey}
        className="relative w-full h-[140px] rounded-lg cursor-crosshair outline-none focus-visible:ring-2"
        style={{
          background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${h}, 100%, 50%))`,
        }}
      >
        <div
          className="absolute w-3 h-3 rounded-full"
          style={{
            left: `${s}%`,
            top: `${100 - v}%`,
            transform: "translate(-50%, -50%)",
            background: hex,
            border: "2px solid #fff",
            boxShadow: "0 0 0 1px rgba(0,0,0,0.4)",
            pointerEvents: "none",
          }}
        />
      </div>
      <div
        className="relative mt-2.5 h-3 rounded-full"
        style={{
          background:
            "linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)",
        }}
      >
        <input
          type="range"
          min={0}
          max={360}
          value={h}
          onChange={(e) => setH(parseFloat(e.target.value))}
          aria-label="Hue"
          className="absolute inset-0 w-full opacity-0 cursor-ew-resize"
        />
        <div
          className="absolute w-3.5 h-3.5 rounded-full pointer-events-none"
          style={{
            left: `${(h / 360) * 100}%`,
            top: "50%",
            transform: "translate(-50%, -50%)",
            background: `hsl(${h}, 100%, 50%)`,
            border: "2px solid #fff",
            boxShadow: "0 0 0 1px rgba(0,0,0,0.4)",
          }}
        />
      </div>
      <div className="mt-2.5 flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-md flex-shrink-0"
          style={{
            background: hex,
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        />
        <input
          value={hexInput}
          onChange={(e) => {
            const next = e.target.value;
            setHexInput(next);
            if (isValidHex(next)) {
              const parsed = hexToHsv(next);
              setH(parsed.h);
              setS(parsed.s);
              setV(parsed.v);
            }
          }}
          aria-label="Hex value"
          className="flex-1 min-w-0 px-2 py-1.5 rounded-md font-mono text-[12px] outline-none"
          style={{
            background: "var(--input-bg)",
            border: "1px solid var(--border)",
            color: "var(--fg)",
          }}
        />
      </div>
    </div>
  );
}
