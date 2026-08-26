import { useRef, useEffect } from 'react';
import { gsap } from '../lib/gsap';

export default function GhostLogo({ className = '' }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none select-none ${className}`}
      aria-hidden
    >
      <img
        src="/clg-logo.jpeg"
        alt=""
        className="h-full w-full object-cover opacity-[0.04] rounded-full border-[3px] border-ink/8"
        draggable={false}
      />
    </div>
  );
}
