import { useEffect, useRef, useState } from 'react';
import { gsap } from '../lib/gsap';

interface ToastItem {
  id: number;
  msg: string;
}

export default function Toasts() {
  const [items, setItems] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    const onToast = (e: Event) => {
      const msg = (e as CustomEvent<string>).detail;
      const id = ++idRef.current;
      setItems((prev) => [...prev, { id, msg }]);
      setTimeout(() => {
        setItems((prev) => prev.filter((t) => t.id !== id));
      }, 3600);
    };
    window.addEventListener('am:toast', onToast);
    return () => window.removeEventListener('am:toast', onToast);
  }, []);

  return (
    <div className="pointer-events-none fixed bottom-6 left-6 z-[210] flex flex-col gap-2.5">
      {items.map((t) => (
        <ToastChip key={t.id} msg={t.msg} />
      ))}
    </div>
  );
}

function ToastChip({ msg }: { msg: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    gsap.fromTo(
      el,
      { x: -130, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.32, ease: 'power3.out' }
    );
    const out = setTimeout(() => {
      gsap.to(el, { x: -130, opacity: 0, duration: 0.28, ease: 'power2.in' });
    }, 3200);
    return () => clearTimeout(out);
  }, []);

  return (
    <div
      ref={ref}
      className="rounded-[12px] border-[1.5px] border-cream/25 bg-ink px-4 py-3 font-mono text-xs font-medium text-cream shadow-[4px_4px_0_rgba(0,0,0,0.3)]"
    >
      {msg}
    </div>
  );
}
