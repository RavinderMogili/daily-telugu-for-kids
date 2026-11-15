import { useRef, useState } from "react";
import { Btn } from "./ui-kit";

type Pt = [number, number];
export function TraceCanvas({ glyph, onDone }: { glyph: string; onDone?: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [strokes, setStrokes] = useState<Pt[][]>([]);
  const drawing = useRef<Pt[] | null>(null);
  const redraw = (all: Pt[][]) => {
    const c = ref.current;
    if (!c) return;
    const x = c.getContext("2d")!;
    x.clearRect(0, 0, c.width, c.height);
    x.lineWidth = 18;
    x.lineCap = "round";
    x.lineJoin = "round";
    x.strokeStyle = getComputedStyle(c).color;
    for (const s of all) {
      x.beginPath();
      s.forEach(([a, b], i) => (i ? x.lineTo(a, b) : x.moveTo(a, b)));
      x.stroke();
    }
  };
  const pos = (e: React.PointerEvent): Pt => {
    const r = ref.current!.getBoundingClientRect();
    return [(e.clientX - r.left) * (500 / r.width), (e.clientY - r.top) * (500 / r.height)];
  };
  const set = (s: Pt[][]) => {
    setStrokes(s);
    redraw(s);
  };
  return (
    <div>
      <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-2xl bg-card ring-1 ring-border">
        <span
          aria-hidden
          className="te pointer-events-none absolute inset-0 grid select-none place-items-center text-[14rem] leading-none text-muted"
        >
          {glyph}
        </span>
        <canvas
          ref={ref}
          width={500}
          height={500}
          aria-label={`Trace ${glyph}`}
          className="absolute inset-0 size-full touch-none text-primary"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            drawing.current = [pos(e)];
          }}
          onPointerMove={(e) => {
            if (!drawing.current) return;
            drawing.current.push(pos(e));
            redraw([...strokes, drawing.current]);
          }}
          onPointerUp={() => {
            if (drawing.current) set([...strokes, drawing.current]);
            drawing.current = null;
          }}
        />
      </div>
      <div className="mx-auto mt-3 grid max-w-sm grid-cols-3 gap-2">
        <Btn v="s" onClick={() => set(strokes.slice(0, -1))} disabled={!strokes.length}>
          Undo
        </Btn>
        <Btn v="s" onClick={() => set([])} disabled={!strokes.length}>
          Clear
        </Btn>
        {onDone && (
          <Btn v="g" onClick={onDone} disabled={!strokes.length}>
            Done
          </Btn>
        )}
      </div>
    </div>
  );
}
