import { useEffect, useRef, useState } from 'react';
import { gsap } from '../lib/gsap';
import { useReducedMotion } from '../hooks/useReducedMotion';

const NODES = [
  'Airoli', 'Belapur', 'Dronagiri', 'Ghansoli', 'Kamothe', 'Kharghar',
  'Nerul', 'Panvel', 'Sanpada', 'Seawoods', 'Taloja', 'Ulwe', 'Vashi',
];

const PREDICT_URL = '/api/predict';

export default function PriceDemo() {
  const rootRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLParagraphElement>(null);
  const reduced = useReducedMotion();

  const [node, setNode] = useState('Vashi');
  const [sqft, setSqft] = useState(900);
  const [bhk, setBhk] = useState(2);
  const [isNew, setIsNew] = useState(true);
  const [amenities, setAmenities] = useState(6);

  const [loading, setLoading] = useState(false);
  const [price, setPrice] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (reduced || price === null) return;
    const el = resultRef.current;
    if (!el) return;
    const obj = { val: 0 };
    gsap.to(obj, {
      val: price,
      duration: 1.4,
      ease: 'power2.out',
      onUpdate: () => {
        el.textContent = '₹ ' + Math.round(obj.val).toLocaleString('en-IN');
      },
    });
  }, [price, reduced]);

  useEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.from('.pd-row', {
        y: 14,
        opacity: 0,
        stagger: 0.06,
        duration: 0.45,
        ease: 'power2.out',
        scrollTrigger: { trigger: rootRef.current, start: 'top 85%', toggleActions: 'play none none reverse' },
      });
    }, rootRef);
    return () => ctx.revert();
  }, [reduced]);

  const predict = async () => {
    setLoading(true);
    setError(null);
    setPrice(null);
    try {
      const r = await fetch(PREDICT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ node, sqft, bhk, is_new: isNew, amenities }),
      });
      if (!r.ok) throw new Error(`API ${r.status}`);
      const d = await r.json();
      const val =
        typeof d === 'number'
          ? d
          : d.predicted_price ?? d.price ?? d.prediction ?? d.result;
      if (val === undefined || val === null || Number.isNaN(Number(val))) {
        throw new Error('unexpected response');
      }
      setPrice(Number(val));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'prediction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={rootRef} className="card-base p-5 shadow-[5px_5px_0_#FFD23F] md:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink/60">
          $ python predict.py --live
        </p>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-yolk bg-yolk/20 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest">
          ⚡ live demo
        </span>
      </div>

      <p className="mb-5 max-w-lg font-mono text-[11px] leading-relaxed text-ink/55">
        └─ this form hits my deployed gradient-boosted API on Render and predicts real
        Navi Mumbai home prices. first call may take ~40s (free tier cold start).
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="pd-row block">
          <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.16em] text-ink/55">node</span>
          <select
            value={node}
            onChange={(e) => setNode(e.target.value)}
            className="w-full cursor-pointer rounded-btn border-[1.5px] border-ink/30 bg-cream px-3 py-2 font-mono text-sm outline-none focus:border-ink"
          >
            {NODES.map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </label>

        <label className="pd-row block">
          <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.16em] text-ink/55">
            sqft (50–10000)
          </span>
          <input
            type="number"
            min={50}
            max={10000}
            value={sqft}
            onChange={(e) => setSqft(Number(e.target.value))}
            className="w-full rounded-btn border-[1.5px] border-ink/30 bg-cream px-3 py-2 font-mono text-sm outline-none focus:border-ink"
          />
        </label>

        <label className="pd-row block">
          <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.16em] text-ink/55">
            bhk (1–7)
          </span>
          <input
            type="number"
            min={1}
            max={7}
            value={bhk}
            onChange={(e) => setBhk(Number(e.target.value))}
            className="w-full rounded-btn border-[1.5px] border-ink/30 bg-cream px-3 py-2 font-mono text-sm outline-none focus:border-ink"
          />
        </label>

        <label className="pd-row block">
          <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.16em] text-ink/55">
            amenities (0–14)
          </span>
          <input
            type="range"
            min={0}
            max={14}
            value={amenities}
            onChange={(e) => setAmenities(Number(e.target.value))}
            className="mt-2 w-full accent-saffron"
          />
          <span className="font-mono text-[11px] text-ink/55">{amenities} amenities</span>
        </label>

        <label className="pd-row flex cursor-pointer items-center gap-2.5 font-mono text-sm">
          <input
            type="checkbox"
            checked={isNew}
            onChange={(e) => setIsNew(e.target.checked)}
            className="h-4 w-4 accent-saffron"
          />
          new property
        </label>
      </div>

      <button
        onClick={predict}
        disabled={loading}
        className="btn-control cursor-hover mt-6 bg-ink px-6 py-3 text-sm text-cream disabled:opacity-50"
        data-cursor-label="run"
        onMouseEnter={(e) => !loading && gsap.to(e.currentTarget, { scale: 1.03, duration: 0.12 })}
        onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, duration: 0.18 })}
        onMouseDown={(e) => gsap.to(e.currentTarget, { scale: 0.97, duration: 0.08 })}
        onMouseUp={(e) => gsap.to(e.currentTarget, { scale: 1, duration: 0.2, ease: 'back.out(2)' })}
      >
        {loading ? 'predicting…' : '$ predict price'}
      </button>

      {loading && (
        <p className="mt-4 animate-none font-mono text-xs text-ink/60">
          ▸ waking the render instance<span ref={(el) => { if (el && !reduced) gsap.to(el, { opacity: 0, repeat: -1, yoyo: true, duration: 0.5, ease: 'sine.inOut' }); }}>…</span>
        </p>
      )}

      {error && (
        <p className="mt-4 font-mono text-xs text-coral">
          ✕ {error} — cold start? wait a moment & retry
        </p>
      )}

      {price !== null && !loading && (
        <div className="mt-6 border-t-[1.5px] border-dashed border-ink/25 pt-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink/50">
            predicted price · {node} · {bhk}bhk · {sqft}sqft{isNew ? ' · new' : ''}
          </p>
          <p
            ref={resultRef}
            className="mt-1 font-display text-4xl font-bold text-saffron md:text-5xl"
          >
            ₹ {price.toLocaleString('en-IN')}
          </p>
        </div>
      )}
    </div>
  );
}
