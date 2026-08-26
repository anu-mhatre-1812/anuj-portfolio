import { useEffect } from 'react';
import { isMatrixOn, toast, toggleMatrix } from '../lib/bus';

export default function EasterEggs() {
  useEffect(() => {
    let seq = '';
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;

      const k = e.key.toLowerCase();
      seq = (seq + k).slice(-7);

      if (seq.endsWith('dracor1')) {
        toast('🐉 you found me — DracoR1');
        seq = '';
      }
      if (e.key === '?') {
        toast('⌨ [M] matrix rain · type [dracor1] · [ctrl+K] palette');
      }
      if (k === 'm' && !e.repeat) {
        const on = toggleMatrix();
        toast(on ? '🌧 matrix rain: ON' : '🌧 matrix rain: OFF');
      }
    };
    window.addEventListener('keydown', onKey);
    if (isMatrixOn()) {
      // warm-up toast so users discover the shortcut once
      const t = setTimeout(() => toast('⌨ press [?] for secrets'), 6000);
      return () => {
        window.removeEventListener('keydown', onKey);
        clearTimeout(t);
      };
    }
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return null;
}
