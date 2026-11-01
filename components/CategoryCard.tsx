'use client';

import Image from 'next/image';
import Link from 'next/link';

type CategoryCardProps = {
  name: string;
  productCount: number;
  image: string;
  href: string;
};

export default function CategoryCard({ name, productCount, image, href }: CategoryCardProps) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center text-center no-underline"
    >
      <div className="relative h-[200px] w-[200px] overflow-hidden rounded-full border-4 border-brand-50 bg-brand-50 shadow-sm sm:h-[220px] sm:w-[220px]">
        <Image
          src={image}
          alt={name}
          fill
          sizes="(min-width: 640px) 220px, 200px"
          className="object-cover object-center"
        />
      </div>

      <div className="mt-5">
        <p className="text-base font-semibold text-foreground">{name}</p>
        <p className="mt-2 text-sm text-secondary/70">
          {productCount > 0 ? `${productCount.toLocaleString()} Products` : 'Coming soon'}
        </p>
      </div>
    </Link>
  );
}
