import { Search, ShoppingCart, MessageCircleMore, Truck, type LucideIcon } from 'lucide-react';

type Step = {
  number: number;
  icon: LucideIcon;
  title: string;
  shortTitle: string;
  description: string;
};

const steps: Step[] = [
  {
    number: 1,
    icon: Search,
    title: 'Browse Products',
    shortTitle: 'Browse',
    description: 'Explore our full range of pet food, toys, and accessories.',
  },
  {
    number: 2,
    icon: ShoppingCart,
    title: 'Add to Cart',
    shortTitle: 'Add to Cart',
    description: 'Pick your items and quantities, then review your cart.',
  },
  {
    number: 3,
    icon: MessageCircleMore,
    title: 'Order on WhatsApp',
    shortTitle: 'WhatsApp Order',
    description: 'Confirm your order instantly with us over WhatsApp.',
  },
  {
    number: 4,
    icon: Truck,
    title: 'Cash on Delivery',
    shortTitle: 'Cash on Delivery',
    description: 'Sit back and pay when your order arrives at your door.',
  },
];

const formatStepNumber = (number: number) => String(number).padStart(2, '0');

export default function HowItWorks() {
  return (
    <section className="mt-8 lg:mt-12">
      {/* Mobile — one compact strip instead of four tall cards */}
      <div className="rounded-2xl border border-divider bg-brand-50 px-2 py-4 lg:hidden">
        <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">How it works</p>
        <ol className="grid grid-cols-4 gap-1">
          {steps.map((step) => (
            <li key={step.number} className="flex flex-col items-center text-center">
              <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-surface shadow-sm">
                <step.icon className="h-5 w-5 text-brand-500" strokeWidth={1.75} />
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[9px] font-bold text-white">
                  {step.number}
                </span>
              </span>
              <span className="mt-2 text-[11px] font-medium leading-tight text-foreground">{step.shortTitle}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="mb-8 hidden lg:flex items-center justify-center gap-4 text-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-500">
            Simple &amp; easy
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-vet-yellow-600">How It Works</h2>
        </div>
      </div>

      <div className="hidden gap-6 lg:grid lg:grid-cols-4">
        {steps.map((step) => (
          <div
            key={step.number}
            className="overflow-hidden rounded-2xl border border-divider bg-surface shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            {/* Tinted top block */}
            <div className="relative overflow-hidden bg-brand-50 px-5 pt-5 pb-8">
              <div className="relative z-10">
                <span className="inline-flex rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-600">
                  Step {formatStepNumber(step.number)}
                </span>

                <div className="mt-5 flex justify-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface shadow-sm">
                    <step.icon className="h-6 w-6 text-brand-500" strokeWidth={1.75} />
                  </div>
                </div>
              </div>

              {/* Decorative oversized number, bleeding off the right edge */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-2 -right-0 z-0 select-none font-display text-8xl font-bold leading-none text-brand-500/5 sm:text-9xl"
              >
                {formatStepNumber(step.number)}
              </span>
            </div>

            {/* White bottom block */}
            <div className="p-5">
              <h3 className="font-display text-lg font-bold text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-secondary">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
