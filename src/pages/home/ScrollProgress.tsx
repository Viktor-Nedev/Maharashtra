import { useScrollStore } from '@/lib/scrollStore';
import { LANDMARKS } from '@/experience/mapRoute';

/** Vertical landmark timeline on the right edge — shows flight progress. */
export function ScrollProgress() {
  const scene = useScrollStore((s) => s.scene);

  return (
    <div className="scroll-progress" aria-hidden="true">
      {LANDMARKS.map((lm, i) => (
        <div
          key={lm.id}
          className={`scroll-progress__dot ${i === scene ? 'is-active' : ''} ${i < scene ? 'is-done' : ''}`}
        >
          <span className="scroll-progress__label">{lm.name}</span>
        </div>
      ))}
    </div>
  );
}
