import { useEffect } from 'react';
import { ScrollSmoother, smootherStore } from './lib/gsap';
import { useReducedMotion } from './hooks/useReducedMotion';
import { useGithubStats } from './hooks/useGithubStats';
import Nav from './components/Nav';
import Cursor from './components/Cursor';
import Preloader from './components/Preloader';
import ProgressBar from './components/ProgressBar';
import Marquee from './components/Marquee';
import Outro from './components/Outro';
import FallingParticles from './components/FallingParticles';
import EasterEggs from './components/EasterEggs';
import Toasts from './components/Toasts';
import CommandPalette from './components/CommandPalette';
import HeroSection from './sections/HeroSection';
import BuildingSection from './sections/BuildingSection';
import WorkSection from './sections/WorkSection';
import AboutSection from './sections/AboutSection';
import ContactSection from './sections/ContactSection';
import Lanyard from './components/Lanyard';
import ScrollTrace from './components/ScrollTrace';

export default function App() {
  const reduced = useReducedMotion();
  const { stats, loading, error, source, refetch } = useGithubStats();

  useEffect(() => {
    if (reduced) return;
    const smoother = ScrollSmoother.create({
      wrapper: '#smooth-wrapper',
      content: '#smooth-content',
      smooth: 1.5,
      effects: true,
    });
    smootherStore.current = smoother;
    return () => {
      smoother.kill();
      smootherStore.current = null;
    };
  }, [reduced]);

  return (
    <>
      <Preloader />
      <FallingParticles />
      <ProgressBar />
      <Cursor />
      <Nav />
      <ScrollTrace />
      <div id="smooth-wrapper" className="relative z-[2]">
        <div id="smooth-content">
          <main>
            <HeroSection stats={stats} loading={loading} />
            <Marquee items={['build', 'ship', 'learn', 'repeat', 'ai/ml', 'full-stack', 'hardware']} />
            <BuildingSection />
            <WorkSection stats={stats} loading={loading} error={error} source={source} refetch={refetch} />
            <Marquee items={['draco', 'dracor1', 'open source', 'frontier labs', 'navi mumbai']} />
            <AboutSection />
            <section className="relative flex flex-col items-center justify-center px-5 py-10">
              <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-ink/50 mb-4">My ID Card</h2>
              <Lanyard />
            </section>
            <ContactSection />
            <Outro />
          </main>
          <footer className="border-t border-ink/10">
            <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-5 py-8 font-mono text-[11px] text-ink/50 md:flex-row md:px-8">
              <span>© 2026 anuj mhatre</span>
              <span>react · vite · gsap</span>
              <span>navi mumbai, in</span>
            </div>
          </footer>
        </div>
      </div>
      <EasterEggs />
      <Toasts />
      <CommandPalette repos={stats?.repos ?? []} />
    </>
  );
}
