import { useEffect, useRef, useState, useCallback } from 'react';

interface NodeData {
  x: number;
  y: number;
  el: HTMLElement;
  lit: boolean;
}

function catmullRom2bezier(points: { x: number; y: number }[]): string {
  if (points.length < 2) return '';
  let d = `M ${points[0].x} ${points[0].y} `;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += `C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y} `;
  }
  return d;
}

export default function ScrollTrace() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const bgPathRef = useRef<SVGPathElement>(null);
  const fgPathRef = useRef<SVGPathElement>(null);
  const nodesGroupRef = useRef<SVGGElement>(null);
  const [pct, setPct] = useState(0);
  const nodeElsRef = useRef<NodeData[]>([]);
  const rafRef = useRef<number | null>(null);

  const buildPath = useCallback(() => {
    const wrap = wrapRef.current;
    const svg = svgRef.current;
    const bgPath = bgPathRef.current;
    const fgPath = fgPathRef.current;
    const nodesGroup = nodesGroupRef.current;
    if (!wrap || !svg || !bgPath || !fgPath || !nodesGroup) return;

    const sections = document.querySelectorAll<HTMLElement>('[data-trace-node]');
    if (sections.length === 0) return;

    const totalHeight = document.documentElement.scrollHeight;
    svg.setAttribute('height', String(totalHeight));
    wrap.style.height = totalHeight + 'px';

    const scrollY = window.scrollY || window.pageYOffset;

    const points: { x: number; y: number }[] = [];

    // Start point — top-left area
    points.push({ x: 40, y: scrollY + 120 });

    // Nodes from sections
    sections.forEach((section) => {
      const r = section.getBoundingClientRect();
      const isLeft = section.dataset.traceNode === 'left';
      points.push({
        x: isLeft ? 40 : window.innerWidth - 40,
        y: r.top + scrollY + r.height / 2,
      });
    });

    // End point — bottom
    points.push({ x: 40, y: totalHeight - 80 });

    const d = catmullRom2bezier(points);
    bgPath.setAttribute('d', d);
    fgPath.setAttribute('d', d);

    const len = fgPath.getTotalLength();
    fgPath.style.strokeDasharray = String(len);
    fgPath.style.strokeDashoffset = String(len);

    // Rebuild node circles
    nodesGroup.innerHTML = '';
    nodeElsRef.current = points.slice(1, -1).map((pt) => {
      const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c.setAttribute('cx', String(pt.x));
      c.setAttribute('cy', String(pt.y));
      c.setAttribute('r', '5');
      c.setAttribute('class', 'scroll-trace-node');
      nodesGroup.appendChild(c);
      return { x: pt.x, y: pt.y, el: c as unknown as HTMLElement, lit: false };
    });

    updateScroll();
  }, []);

  const updateScroll = useCallback(() => {
    const fgPath = fgPathRef.current;
    if (!fgPath) return;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const frac = docHeight > 0 ? Math.min(1, Math.max(0, window.scrollY / docHeight)) : 0;
    const len = fgPath.getTotalLength();
    fgPath.style.strokeDashoffset = String(len * (1 - frac));
    setPct(Math.round(frac * 100));
  }, []);

  const onScroll = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      updateScroll();
      rafRef.current = null;
    });
  }, [updateScroll]);

  const resizeTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const onResize = useCallback(() => {
    clearTimeout(resizeTimerRef.current);
    resizeTimerRef.current = setTimeout(buildPath, 150);
  }, [buildPath]);

  useEffect(() => {
    buildPath();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    document.fonts?.ready.then(buildPath);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [buildPath, onScroll, onResize]);

  // IntersectionObserver to light up nodes + cards
  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>('[data-trace-node]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const idx = Number(el.dataset.traceIndex);
            el.classList.add('is-active');
            if (nodeElsRef.current[idx]) {
              const node = nodeElsRef.current[idx];
              if (!node.lit) {
                node.lit = true;
                node.el.classList.add('is-lit');
              }
            }
          }
        });
      },
      { threshold: 0.3 }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* HUD */}
      <div className="scroll-trace-hud" aria-hidden="true">
        progress: <span>{pct}%</span>
      </div>

      {/* SVG Trace */}
      <div ref={wrapRef} className="scroll-trace-wrap" aria-hidden="true">
        <svg ref={svgRef} className="scroll-trace-svg">
          <path ref={bgPathRef} className="scroll-trace-bg" d="" />
          <path ref={fgPathRef} className="scroll-trace-fg" d="" />
          <g ref={nodesGroupRef} />
        </svg>
      </div>
    </>
  );
}
