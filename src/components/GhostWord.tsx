export default function GhostWord({
  text,
  speed,
  align = 'right',
  className = '',
  variant = 'strip',
}: {
  text: string;
  speed: string;
  align?: 'left' | 'right';
  className?: string;
  variant?: 'ghost' | 'strip';
}) {
  if (variant === 'ghost') {
    return (
      <span
        aria-hidden
        data-speed={speed}
        className="pointer-events-none absolute select-none font-display text-[20vw] font-bold uppercase leading-none"
        style={{
          WebkitTextStroke: '1.5px #171512',
          color: 'transparent',
          opacity: 0.07,
        }}
      >
        {text}
      </span>
    );
  }

  return (
    <div
      aria-hidden
      className={`relative flex overflow-hidden px-5 md:px-8 ${
        align === 'right' ? 'justify-end' : 'justify-start'
      } ${className}`}
    >
      <span
        data-speed={speed}
        className="select-none whitespace-nowrap font-display text-[15vw] font-bold uppercase leading-[0.85] tracking-tight md:text-[6.5rem]"
        style={{ WebkitTextStroke: '2px #171512', color: 'transparent' }}
      >
        {text}
      </span>
    </div>
  );
}
