'use client';

import { useEffect, useRef, useState } from 'react';

type ProductGalleryProps = {
  images: string[];
  alt: string;
};

const SWIPE_THRESHOLD_PX = 40;

export default function ProductGallery({ images, alt }: ProductGalleryProps) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const count = images.length;

  const goTo = (next: number) => setIndex(((next % count) + count) % count);

  // Keep the active thumbnail visible when the slide changes via arrows/swipe/keyboard.
  useEffect(() => {
    thumbRefs.current[index]?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
  }, [index]);

  if (count === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-lg border border-divider bg-brand-50 text-secondary">
        No image
      </div>
    );
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowLeft') goTo(index - 1);
    if (event.key === 'ArrowRight') goTo(index + 1);
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = event.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return;
    goTo(delta < 0 ? index + 1 : index - 1);
  };

  return (
    <div className="space-y-4">
      {/* Main slider */}
      <div
        className="relative flex aspect-square w-full max-w-full items-center justify-center overflow-hidden rounded-lg border border-divider bg-brand-50 lg:mx-auto lg:h-[calc(100vh-110px)] lg:w-[calc(100vh-110px)] lg:max-w-full"
        role="group"
        aria-roledescription="carousel"
        aria-label={`${alt} images`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onTouchStart={(event) => {
          touchStartX.current = event.touches[0].clientX;
        }}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex h-full w-full transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {images.map((image, i) => (
            <div
              key={`${image}-${i}`}
              className="flex h-full w-full flex-shrink-0 items-center justify-center"
              aria-hidden={i !== index}
            >
              <img
                src={image}
                alt={i === index ? alt : ''}
                draggable={false}
                className="h-full w-full select-none object-contain"
              />
            </div>
          ))}
        </div>

        {count > 1 ? (
          <>
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 text-xl text-brand-700 shadow transition hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              aria-label="Next image"
              className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 text-xl text-brand-700 shadow transition hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              ›
            </button>
            <span className="absolute bottom-2 right-2 rounded-full bg-foreground/70 px-2.5 py-0.5 text-xs font-semibold text-surface">
              {index + 1} / {count}
            </span>
          </>
        ) : null}
      </div>

      {/* Thumbnails */}
      {count > 1 ? (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {images.map((image, i) => (
            <button
              key={`${image}-${i}`}
              ref={(el) => {
                thumbRefs.current[i] = el;
              }}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show image ${i + 1}`}
              aria-current={i === index}
              className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border bg-brand-50 ${
                i === index ? 'border-brand-600 ring-2 ring-brand-600/20' : 'border-divider'
              }`}
            >
              <img src={image} alt={`${alt} thumbnail ${i + 1}`} className="h-full w-full object-contain" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
