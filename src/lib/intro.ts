export const INTRO_REVEAL_EVENT = 'am:intro-reveal';

export function dispatchIntroReveal() {
  window.dispatchEvent(new Event(INTRO_REVEAL_EVENT));
}
