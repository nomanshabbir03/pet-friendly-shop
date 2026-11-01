'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export type HeroSlide = {
  id: string;
  eyebrow?: string;
  // Optional — a slide with no heading renders without one. See the render below.
  title?: string;
  subtitle?: string;
  image: string;
  // Optional — a slide with no button text/link renders without a CTA. See the render below.
  ctaLabel?: string;
  ctaHref?: string;
};

type HeroSliderProps = {
  slides: HeroSlide[];
  autoPlayMs?: number;
};

export default function HeroSlider({
  slides,
  autoPlayMs = 5000,
}: HeroSliderProps) {
  const [active, setActive] = useState(0);

  const goTo = useCallback(
    (index: number) => {
      if (slides.length === 0) return;

      setActive(
        ((index % slides.length) + slides.length) % slides.length
      );
    },
    [slides.length]
  );

  const next = useCallback(() => {
    setActive((current) => {
      if (slides.length === 0) return 0;
      return (current + 1) % slides.length;
    });
  }, [slides.length]);

  const prev = useCallback(() => {
    setActive((current) => {
      if (slides.length === 0) return 0;
      return (current - 1 + slides.length) % slides.length;
    });
  }, [slides.length]);

  useEffect(() => {
    if (autoPlayMs <= 0 || slides.length <= 1) return;

    const timer = setInterval(next, autoPlayMs);

    return () => clearInterval(timer);
  }, [next, autoPlayMs, slides.length]);

  if (slides.length === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-divider shadow-sm">

      {/* Slides */}
      <div
        className="flex transition-transform duration-700 ease-out"
        style={{
          transform: `translateX(-${active * 100}%)`,
        }}
      >
        {slides.map((slide) => (
          <div key={slide.id} className="relative min-w-full">
            <div className="relative h-[300px] w-full sm:h-[380px] md:h-[460px] lg:h-[clamp(420px,calc(100svh-180px),640px)]">

              {/* Background Image — desktop (lg+) keeps the original full-bleed cover crop
                  exactly as before, since that already looks correct there. Below lg, admin-
                  uploaded posters can be any aspect ratio, so cover would crop unpredictably —
                  see the letterboxed layer below instead. */}
              <Image
                src={slide.image}
                alt={slide.title || ''}
                fill
                priority
                className="hidden object-cover filter blur-[1px] lg:block"
                sizes="100vw"
              />

              {/* Mobile/tablet — a blurred, zoomed copy of the same image fills the frame
                  edge-to-edge for atmosphere (no gaps), while a second, uncropped copy sits on
                  top with object-contain so the full poster is always visible regardless of its
                  aspect ratio — nothing is ever cut off. */}
              <div className="absolute inset-0 lg:hidden">
                <Image
                  src={slide.image}
                  alt=""
                  aria-hidden="true"
                  fill
                  className="object-cover scale-110 blur-lg brightness-75"
                  sizes="100vw"
                />
                <Image
                  src={slide.image}
                  alt={slide.title || ''}
                  fill
                  priority
                  className="object-contain"
                  sizes="100vw"
                />
              </div>

              {/* Light Brand Red Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-brand-500/15 via-brand-500/5 to-brand-900/20" />

              {/* Content — centered */}
              <div className="absolute inset-0 flex flex-col items-center justify-start pt-6 text-center sm:pt-8 md:pt-12 lg:pt-24">
                {slide.eyebrow && (
                  <p className="text-xs font-extrabold uppercase tracking-wide text-surface sm:text-sm md:text-base lg:text-xl">
                    {slide.eyebrow}
                  </p>
                )}

                {slide.title && (
                  <h2 className="whitespace-pre-line font-display text-3xl font-extrabold uppercase leading-[0.95] text-surface drop-shadow-sm sm:text-4xl md:text-6xl lg:text-8xl">
                    {slide.title}
                  </h2>
                )}

                {slide.subtitle && (
                  <p className="mt-2 max-w-md px-4 text-sm leading-6 text-surface/90 sm:mt-3 sm:px-6 sm:text-base lg:mt-4">
                    {slide.subtitle}
                  </p>
                )}

                {slide.ctaLabel && slide.ctaHref && (
                  <Link
                    href={slide.ctaHref}
                    className="mt-4 inline-flex rounded-full bg-gradient-to-r from-brand-500 to-brand-700 px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-surface shadow-md transition hover:opacity-90 sm:mt-6 sm:px-6 sm:py-3 lg:mt-8 lg:px-8 lg:py-3.5"
                  >
                    {slide.ctaLabel}
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      {slides.length > 1 && (
        <>
          {/* Previous Button */}
          <button
            type="button"
            onClick={prev}
            aria-label="Previous slide"
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-surface/40 p-2 text-surface shadow-sm backdrop-blur-sm transition hover:bg-surface/60 sm:left-3 sm:p-2.5 lg:left-5 lg:top-[38%] lg:p-3"
          >
            <ChevronLeft className="h-4 w-4 lg:h-5 lg:w-5" />
          </button>

          {/* Next Button */}
          <button
            type="button"
            onClick={next}
            aria-label="Next slide"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-surface/40 p-2 text-surface shadow-sm backdrop-blur-sm transition hover:bg-surface/60 sm:right-3 sm:p-2.5 lg:right-5 lg:top-[38%] lg:p-3"
          >
            <ChevronRight className="h-4 w-4 lg:h-5 lg:w-5" />
          </button>

          {/* Slide Indicators */}
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 sm:bottom-4 sm:gap-2 lg:bottom-6">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => goTo(index)}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === active ? 'true' : undefined}
                className={`h-2 rounded-full transition-all ${
                  index === active
                    ? 'w-6 bg-surface'
                    : 'w-2 bg-surface/50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}