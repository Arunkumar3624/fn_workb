import { useRef } from "react";

// Inspired by React Bits' "Chroma Grid" — the grid renders in true color as
// normal; a duplicate grayscale layer sits on top of it, masked by a radial
// "spotlight" that follows the cursor, so color only shows through in a
// small circle around the pointer and everything else reads muted. Pure
// CSS custom properties updated on pointer move (see wb-chroma-grid* rules
// in main.css) — no per-frame React state, so this is cheap enough to run
// on every mousemove without re-rendering anything.
export function ChromaGrid({ children, gridClassName = "", radius = 220 }) {
  const rootRef = useRef(null);

  const handleMove = (event) => {
    const node = rootRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    node.style.setProperty("--chroma-x", `${event.clientX - rect.left}px`);
    node.style.setProperty("--chroma-y", `${event.clientY - rect.top}px`);
  };

  return (
    <div
      ref={rootRef}
      className="wb-chroma-grid"
      onMouseMove={handleMove}
      onMouseEnter={() => rootRef.current?.style.setProperty("--chroma-radius", `${radius}px`)}
      onMouseLeave={() => rootRef.current?.style.setProperty("--chroma-radius", "0px")}
    >
      <div className={gridClassName}>{children}</div>
      <div className={`${gridClassName} wb-chroma-grid-gray`.trim()} aria-hidden="true">
        {children}
      </div>
    </div>
  );
}
