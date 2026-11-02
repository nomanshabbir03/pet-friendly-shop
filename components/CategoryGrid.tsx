'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import CategoryCard from '@/components/CategoryCard';

export type CategoryItem = {
  name: string;
  productCount: number;
  image: string;
  href: string;
};

type CategoryGridProps = {
  categories: CategoryItem[];
};

const GAP = 24;

export default function CategoryGrid({ categories }: CategoryGridProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(1);
  const [slideWidth, setSlideWidth] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);

  /*
   * Clone cards at both ends for infinite looping.
   *
   * Example:
   * C D | A B C D | A B
   */
  const extendedCategories =
    categories.length > 0
      ? [
          ...categories.slice(-visibleCount),
          ...categories,
          ...categories.slice(0, visibleCount),
        ]
      : [];

  const startIndex = visibleCount;

  /*
   * Determine how many cards should be visible.
   */
  const updateVisibleCount = useCallback(() => {
    if (typeof window === 'undefined') return;

    if (window.innerWidth >= 1024) {
      setVisibleCount(3);
    } else if (window.innerWidth >= 640) {
      setVisibleCount(2);
    } else {
      setVisibleCount(1);
    }
  }, []);

  /*
   * Calculate actual card width.
   */
  const updateSlideWidth = useCallback(() => {
    if (!containerRef.current) return;

    const containerWidth = containerRef.current.offsetWidth;

    const width =
      (containerWidth - GAP * (visibleCount - 1)) / visibleCount;

    setSlideWidth(width);
  }, [visibleCount]);

  /*
   * Set responsive visible count.
   */
  useEffect(() => {
    updateVisibleCount();

    window.addEventListener('resize', updateVisibleCount);

    return () => {
      window.removeEventListener('resize', updateVisibleCount);
    };
  }, [updateVisibleCount]);

  /*
   * Recalculate card width whenever visible count changes.
   */
  useEffect(() => {
    updateSlideWidth();

    window.addEventListener('resize', updateSlideWidth);

    return () => {
      window.removeEventListener('resize', updateSlideWidth);
    };
  }, [updateSlideWidth]);

  /*
   * Reset carousel when visible count changes.
   */
  useEffect(() => {
    setIsTransitioning(false);
    setCurrentIndex(startIndex);

    const timer = setTimeout(() => {
      setIsTransitioning(true);
    }, 50);

    return () => clearTimeout(timer);
  }, [visibleCount, categories.length]);

  /*
   * Move to next slide.
   */
  const nextSlide = useCallback(() => {
    if (categories.length <= visibleCount) return;

    setCurrentIndex((prev) => prev + 1);
    setIsTransitioning(true);
  }, [categories.length, visibleCount]);

  /*
   * Move to previous slide.
   */
  const previousSlide = useCallback(() => {
    if (categories.length <= visibleCount) return;

    setCurrentIndex((prev) => prev - 1);
    setIsTransitioning(true);
  }, [categories.length, visibleCount]);

  /*
   * Automatic slider.
   */
  useEffect(() => {
    if (categories.length <= visibleCount) return;

    const timer = setInterval(() => {
      nextSlide();
    }, 4000);

    return () => clearInterval(timer);
  }, [nextSlide, categories.length, visibleCount]);

  /*
   * Handle infinite loop.
   */
  const handleTransitionEnd = () => {
    if (currentIndex >= categories.length + visibleCount) {
      setIsTransitioning(false);
      setCurrentIndex(startIndex);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsTransitioning(true);
        });
      });
    }

    /*
     * Handle backwards infinite loop.
     */
    if (currentIndex < startIndex) {
      setIsTransitioning(false);
      setCurrentIndex(categories.length + currentIndex);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsTransitioning(true);
        });
      });
    }
  };

  if (categories.length === 0) return null;

  /*
   * Only show arrows when there are enough cards
   * to actually create a carousel.
   */
  const shouldShowArrows = categories.length > visibleCount;

  /*
   * Use cloned cards for infinite carousel.
   */
  const cards =
    categories.length > visibleCount
      ? extendedCategories
      : categories;

  const actualIndex =
    categories.length > visibleCount ? currentIndex : 0;

  const translateX =
    slideWidth > 0
      ? actualIndex * (slideWidth + GAP)
      : 0;

  return (
    <section className="mt-6 lg:mt-12">
      {/* Section Header */}
      <div className="mb-4 lg:mb-10 lg:text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500 lg:text-sm">
          Browse categories
        </p>

        <h2 className="mt-1 font-display text-xl font-bold text-foreground lg:mt-3 lg:text-4xl">
          Shop by category
        </h2>
        <span className="mx-auto mt-4 hidden h-1 w-16 rounded-full bg-brand-500 lg:block" />
      </div>

      {/* Mobile — swipe row of small circles */}
      <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:hidden">
        {categories.map((category) => (
          <Link key={category.name} href={category.href} className="w-[76px] shrink-0 text-center">
            <span className="relative mx-auto block h-[72px] w-[72px] overflow-hidden rounded-full border-2 border-brand-100 bg-brand-50">
              <Image src={category.image} alt={category.name} fill sizes="72px" className="object-cover" />
            </span>
            <span className="mt-2 line-clamp-2 block text-xs font-medium leading-4 text-foreground">{category.name}</span>
          </Link>
        ))}
      </div>

      {/* lg — Slider */}
      <div
        ref={containerRef}
        className="relative hidden w-full overflow-hidden lg:block"
      >
        {/* Previous Arrow */}
        {shouldShowArrows && (
          <button
            type="button"
            onClick={previousSlide}
            aria-label="Previous categories"
            className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/90 text-foreground shadow-md backdrop-blur-sm transition-all duration-200 hover:bg-muted hover:shadow-lg active:scale-95"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
        )}

        {/* Cards */}
        <div
          className={`flex ${
            isTransitioning
              ? 'transition-transform duration-700 ease-out'
              : ''
          }`}
          style={{
            gap: `${GAP}px`,
            transform: `translate3d(-${translateX}px, 0, 0)`,
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {cards.map((category, index) => (
            <div
              key={`${category.name}-${index}`}
              className="shrink-0"
              style={{
                width: `${slideWidth}px`,
              }}
            >
              <CategoryCard {...category} />
            </div>
          ))}
        </div>

        {/* Next Arrow */}
        {shouldShowArrows && (
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next categories"
            className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/90 text-foreground shadow-md backdrop-blur-sm transition-all duration-200 hover:bg-muted hover:shadow-lg active:scale-95"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        )}
      </div>
    </section>
  );
}