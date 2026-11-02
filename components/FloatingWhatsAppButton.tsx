'use client';

import WhatsAppIcon from '@/components/WhatsAppIcon';

const DEFAULT_MESSAGE = 'Hi, I have a question about Pet’s Friendly Shop';

type FloatingWhatsAppButtonProps = {
  // From SiteSettings (lib/site-settings.ts), passed down from app/layout.tsx. Digits only,
  // no +/spaces, matching the wa.me URL format already used site-wide.
  whatsappNumber: string;
};

// Desktop only (lg+) — on mobile, WhatsApp lives in MobileBottomNav instead.
export default function FloatingWhatsAppButton({ whatsappNumber }: FloatingWhatsAppButtonProps) {
  // Hide entirely rather than rendering a button that links to wa.me/ with no number.
  if (!whatsappNumber) return null;

  // Same wa.me URL pattern used by the order-confirmation and contact WhatsApp links elsewhere
  // in this codebase (https://wa.me/<number>?text=<encoded message>).
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="floating-whatsapp-button fixed bottom-5 right-5 z-50 hidden h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg outline-none transition hover:scale-105 focus-visible:ring-4 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2 sm:bottom-6 sm:right-6 lg:flex"
    >
      <style>{`
        .floating-whatsapp-button {
          animation: whatsapp-breathe 2.4s ease-in-out infinite;
        }
        @keyframes whatsapp-breathe {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.55);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(37, 211, 102, 0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .floating-whatsapp-button {
            animation: none;
          }
        }
      `}</style>

      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
