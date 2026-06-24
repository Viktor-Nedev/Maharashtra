import { useEffect, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface Props {
  images: string[];
  title: string;
}

export function PhotoGallery({ images, title }: Props) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  const prev = useCallback(() => {
    setLightbox((i) => (i === null ? null : (i - 1 + images.length) % images.length));
  }, [images.length]);

  const next = useCallback(() => {
    setLightbox((i) => (i === null ? null : (i + 1) % images.length));
  }, [images.length]);

  useEffect(() => {
    if (lightbox === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null);
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [lightbox, prev, next]);

  // Lock body scroll when lightbox open
  useEffect(() => {
    document.body.style.overflow = lightbox !== null ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [lightbox]);

  if (!images.length) return null;

  return (
    <section className="photo-gallery">
      <h2 className="photo-gallery__title">Gallery</h2>
      <div className="photo-gallery__grid">
        {images.map((src, i) => (
          <button
            key={src}
            className="photo-gallery__thumb"
            onClick={() => setLightbox(i)}
            aria-label={`View ${title} photo ${i + 1}`}
          >
            <img src={src} alt={`${title} ${i + 1}`} loading="lazy" />
            <span className="photo-gallery__zoom">⤢</span>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            className="photo-gallery__lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={() => setLightbox(null)}
          >
            {/* Content stops propagation so clicking image doesn't close */}
            <motion.div
              className="photo-gallery__lightbox-inner"
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 20 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={images[lightbox]}
                alt={`${title} ${lightbox + 1}`}
                className="photo-gallery__lightbox-img"
              />
              <div className="photo-gallery__lightbox-bar">
                <button
                  className="photo-gallery__lightbox-nav photo-gallery__lightbox-nav--prev"
                  onClick={prev}
                  aria-label="Previous"
                >
                  ←
                </button>
                <span className="photo-gallery__lightbox-counter">
                  {lightbox + 1} / {images.length}
                </span>
                <button
                  className="photo-gallery__lightbox-nav photo-gallery__lightbox-nav--next"
                  onClick={next}
                  aria-label="Next"
                >
                  →
                </button>
                <button
                  className="photo-gallery__lightbox-close"
                  onClick={() => setLightbox(null)}
                  aria-label="Close lightbox"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
