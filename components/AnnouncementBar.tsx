'use client';

import { useEffect, useState } from 'react';

type AnnouncementData = {
  message: string;
  isActive: boolean;
};

export default function AnnouncementBar() {
  const [announcement, setAnnouncement] = useState<AnnouncementData | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/announcement')
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data?.success && data.data?.isActive && data.data?.message) {
          setAnnouncement(data.data);
        }
      })
      .catch(() => {
        // Fail silently — the bar simply doesn't render if the fetch fails.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!announcement || !announcement.isActive || !announcement.message) {
    return null;
  }

  // Repeat the message so the marquee track can loop seamlessly at -50%.
  const track = [0, 1].map((copy) => (
    <span key={copy} className="announcement-bar__item">
      {announcement.message}
    </span>
  ));

  return (
    <div className="announcement-bar w-full max-w-full">
      <style>{`
        .announcement-bar {
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  background: var(--color-brand-500);
  color: #ffffff;
  white-space: nowrap;
}
        .announcement-bar__track {
          display: inline-flex;
          width: max-content;
          animation: announcement-bar-scroll 22s linear infinite;
        }
        .announcement-bar:hover .announcement-bar__track {
          animation-play-state: paused;
        }
        .announcement-bar__item {
  display: inline-block;
  padding: 0.4rem 2rem;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}
        @keyframes announcement-bar-scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .announcement-bar__track {
            animation: none;
          }
        }
      `}</style>
      <div className="announcement-bar__track">{track}</div>
    </div>
  );
}
