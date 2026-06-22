import { useScrollStore } from '@/lib/scrollStore';
import { SCENES } from '@/experience/flight';

/** Vertical scene timeline on the right edge — shows flight progress. */
export function ScrollProgress() {
  const scene = useScrollStore((s) => s.scene);

  return (
    <div className="scroll-progress" aria-hidden="true">
      {SCENES.map((s, i) => (
        <div key={s.id} className={`scroll-progress__dot ${i === scene ? 'is-active' : ''} ${i < scene ? 'is-done' : ''}`}>
          <span className="scroll-progress__label">{s.title}</span>
        </div>
      ))}
    </div>
  );
}
