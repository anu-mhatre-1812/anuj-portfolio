import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { CustomEase } from 'gsap/CustomEase';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase, ScrollSmoother, ScrollToPlugin);

CustomEase.create('am-signature', 'M0,0 C0.25,0.1 0.25,1 1,1');

export const MOTION = {
  dur: {
    quick: 0.15,
    standard: 0.35,
    slow: 0.8,
  },
  ease: {
    signature: 'am-signature',
    out: 'power2.out',
    in: 'power2.in',
    inOut: 'power2.inOut',
    press: 'back.out(2)',
  },
} as const;

export const smootherStore: { current: ScrollSmoother | null } = { current: null };

export function scrollToSection(id: string, reduced = false) {
  const el = document.getElementById(id);
  if (!el) return;
  if (reduced) {
    el.scrollIntoView();
    return;
  }
  const smoother = smootherStore.current;
  if (smoother) {
    smoother.scrollTo(el, true, 'top 72px');
  } else {
    gsap.to(window, {
      duration: 1,
      scrollTo: { y: el, offsetY: 72 },
      ease: 'power2.inOut',
    });
  }
}

export { gsap, ScrollTrigger, SplitText, CustomEase, ScrollSmoother };
