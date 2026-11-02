'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Stethoscope } from 'lucide-react';

// Sibling to FloatingWhatsAppButton — stacked directly above it, same fixed-position pattern.
// Does not modify FloatingWhatsAppButton itself. Yellow to match VeterinarySection (#veterinary)
// and to visually differentiate from the green WhatsApp button. Desktop only (lg+), like it.
export default function FloatingVeterinaryButton() {
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    if (pathname === '/') {
      document.getElementById('veterinary')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      router.push('/#veterinary');
    }
  };

  return (
    <a
      href="/#veterinary"
      onClick={handleClick}
      aria-label="Veterinary Services"
      title="Veterinary Services"
      className="group fixed bottom-[92px] right-5 z-50 hidden h-14 w-14 items-center justify-center rounded-full bg-vet-yellow-500 text-vet-yellow-900 shadow-lg outline-none transition hover:scale-105 focus-visible:ring-4 focus-visible:ring-vet-yellow-500/40 focus-visible:ring-offset-2 sm:bottom-[104px] sm:right-6 lg:flex"
    >
      <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-md bg-vet-yellow-900 px-2 py-1 text-xs font-medium text-vet-yellow-50 opacity-0 transition group-hover:opacity-100 sm:block">
        Veterinary Services
      </span>

      <Stethoscope className="h-7 w-7" strokeWidth={1.75} aria-hidden="true" />
    </a>
  );
}
