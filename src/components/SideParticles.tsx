import { useMemo } from 'react';

interface Props {
  /** Which edge to anchor the particle column to. */
  side: 'left' | 'right';
  count?: number;
}

/**
 * Lightweight CSS-driven floating particles pinned to one side of the page.
 * Pure DOM + keyframes (see `.side-particles` in _platform.scss) — no canvas,
 * no per-frame JS, so it stays cheap on mobile.
 */
export function SideParticles({ side, count = 14 }: Props) {
  const dots = useMemo(
    () =>
      Array.from({ length: count }).map(() => ({
        left: Math.random() * 100,
        size: 3 + Math.random() * 7,
        delay: -Math.random() * 16,
        duration: 12 + Math.random() * 14,
        drift: (Math.random() * 2 - 1) * 28,
        opacity: 0.25 + Math.random() * 0.5,
      })),
    [count],
  );

  return (
    <div className={`side-particles side-particles--${side}`} aria-hidden="true">
      {dots.map((d, i) => (
        <span
          key={i}
          className="side-particles__dot"
          style={{
            left: `${d.left}%`,
            width: `${d.size}px`,
            height: `${d.size}px`,
            opacity: d.opacity,
            // custom props consumed by the keyframes
            ['--drift' as string]: `${d.drift}px`,
            animationDelay: `${d.delay}s`,
            animationDuration: `${d.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
