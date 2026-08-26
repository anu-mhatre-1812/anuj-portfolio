import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

const GLYPHS = 'anujmhatre$_>/~';

export default function FallingParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const [on, setOn] = useState(true);

  useEffect(() => {
    const t = () => setOn((o) => !o);
    window.addEventListener('am:toggle-matrix', t);
    return () => window.removeEventListener('am:toggle-matrix', t);
  }, []);

  useEffect(() => {
    if (reduced || !on) return;
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    let cols: number[] = [];
    let W = 0;
    let H = 0;
    const CELL = 20;

    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      cv.width = W * dpr;
      cv.height = H * dpr;
      cv.style.width = `${W}px`;
      cv.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Array.from({ length: Math.floor(W / CELL) }, () =>
        Math.floor(Math.random() * -50)
      );
    };
    fit();
    window.addEventListener('resize', fit);

    const ink = 'rgba(23,21,18,0.16)';
    const accents = [
      'rgba(255,153,51,0.42)',
      'rgba(255,111,94,0.34)',
      'rgba(201,232,255,0.55)',
      'rgba(255,210,63,0.4)',
    ];

    const id = setInterval(() => {
      ctx.clearRect(0, 0, W, H);
      ctx.font = '600 14px "JetBrains Mono", monospace';
      for (let i = 0; i < cols.length; i++) {
        const ch = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        const accent = i % 5 === 0;
        ctx.fillStyle = accent ? accents[i % accents.length] : ink;
        ctx.fillText(ch, i * CELL, cols[i] * CELL);
        if (cols[i] * CELL > H && Math.random() > 0.972) {
          cols[i] = Math.floor(Math.random() * -30);
        }
        cols[i]++;
      }
    }, 66);

    return () => {
      clearInterval(id);
      window.removeEventListener('resize', fit);
    };
  }, [reduced, on]);

  if (reduced || !on) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[1]"
    />
  );
}
