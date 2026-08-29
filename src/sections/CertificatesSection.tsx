import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const certs = [
  { title: 'Introduction to Python', provider: 'IBM', image: '/ibm-python-cert.png', pdf: '/ibm-python-cert.pdf' },
  { title: 'Data Visualization', provider: 'IBM', image: '/ibm-dataviz-cert.png', pdf: '/ibm-dataviz-cert.pdf' },
];

export default function CertificatesSection() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.cert-card', {
        y: 40,
        opacity: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: { trigger: rootRef.current, start: 'top 80%' },
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="certificates" ref={rootRef} className="relative py-24 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink/60">~/certificates</p>
        <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
          Certifications
        </h2>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-ink/60">
          Professional certifications from IBM.
        </p>

        <div className="mt-10 grid gap-8 md:grid-cols-2">
          {certs.map((cert) => (
            <div
              key={cert.title}
              className="cert-card group cursor-hover border-[3px] border-ink bg-white p-5 transition-transform hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0_#171512]"
            >
              <div className="overflow-hidden border-2 border-ink/20">
                <img
                  src={cert.image}
                  alt={cert.title}
                  className="h-auto w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <h3 className="font-display text-lg font-bold uppercase">{cert.title}</h3>
                  <p className="font-mono text-xs text-ink/50">{cert.provider}</p>
                </div>
                <a
                  href={cert.pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-[2px] border-ink bg-cream px-4 py-2 font-mono text-xs font-bold uppercase transition-colors hover:bg-yolk"
                >
                  View PDF
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
