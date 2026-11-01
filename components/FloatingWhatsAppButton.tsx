'use client';

const DEFAULT_MESSAGE = 'Hi, I have a question about Pet’s Friendly Shop';

type FloatingWhatsAppButtonProps = {
  // From SiteSettings (lib/site-settings.ts), passed down from app/layout.tsx. Digits only,
  // no +/spaces, matching the wa.me URL format already used site-wide.
  whatsappNumber: string;
};

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
      className="floating-whatsapp-button fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg outline-none transition hover:scale-105 focus-visible:ring-4 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2 sm:bottom-6 sm:right-6"
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

      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12.001 2C6.478 2 2 6.477 2 11.999c0 2.096.66 4.037 1.788 5.63L2 22l4.53-1.746A9.94 9.94 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12.001 2zm0 18.209c-1.702 0-3.323-.5-4.719-1.443l-.338-.222-3.007 1.16.99-3.037-.221-.335A8.192 8.192 0 013.79 12c0-4.523 3.687-8.209 8.211-8.209 4.522 0 8.207 3.686 8.207 8.209 0 4.523-3.685 8.209-8.207 8.209z" />
      </svg>
    </a>
  );
}
