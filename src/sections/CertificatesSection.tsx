import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const certs = [
  { title: 'Introduction to Python', provider: 'IBM', image: '/ibm-python-cert.png', pdf: '/ibm-python-cert.pdf' },
  { title: 'Data Visualization', provider: 'IBM', image: '/ibm-dataviz-cert.png', pdf: '/ibm-dataviz-cert.pdf' },
];

export default function CertificatesSection() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!rootRef.current) return;
    if (open) {
      gsap.fromTo(
        rootRef.current.querySelector('.certs-grid'),
        { height: 0, opacity: 0 },
        { height: 'auto', opacity: 1, duration: 0.5, ease: 'power3.out' }
      );
    }
  }, [open]);

  return (
    <section id="certificates" ref={rootRef} className="relative py-12 md:py-16">
      <div className="mx-auto max-w-5xl px-6">
        <button
          onClick={() => setOpen(!open)}
          className="cursor-hover flex items-center gap-3 border-[2px] border-ink bg-white px-5 py-3 font-mono text-sm font-bold uppercase transition-colors hover:bg-yolk"
        >
          <span className={`inline-block transition-transform duration-300 ${open ? 'rotate-90' : ''}`}>▶</span>
          Certificates
          <span className="text-ink/40">({certs.length})</span>
        </button>

        {open && (
          <div className="certs-grid mt-6 grid gap-6 overflow-hidden md:grid-cols-2">
            {certs.map((cert) => (
              <div
                key={cert.title}
                className="cert-card group cursor-hover border-[3px] border-ink bg-white p-4 transition-transform hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0_#171512]"
              >
                <div className="overflow-hidden border-2 border-ink/20">
                  <img
                    src={cert.image}
                    alt={cert.title}
                    className="h-auto w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-base font-bold uppercase">{cert.title}</h3>
                    <p className="font-mono text-xs text-ink/50">{cert.provider}</p>
                  </div>
                  <a
                    href={cert.pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border-[2px] border-ink bg-cream px-3 py-1.5 font-mono text-xs font-bold uppercase transition-colors hover:bg-yolk"
                  >
                    PDF
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
