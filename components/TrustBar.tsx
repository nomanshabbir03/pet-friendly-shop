import { Truck, Wallet, Phone, MessageCircle, type LucideIcon } from 'lucide-react';
import { getSiteSettings } from '@/lib/site-settings';

type TrustItem = {
  key: string;
  icon: LucideIcon;
  primary: string;
  secondary: string;
};

// Trust/info bar shown right below the Hero Slider. Follows the same card conventions as
// HowItWorks (border-divider card, bg-surface, rounded-2xl, icon in a tinted circle) rather
// than a solid tinted background block — accent yellow is reserved for the icon circles only,
// per the "no large accent background blocks" rule already applied elsewhere on the site.
//
// The shop location and "call us" items are admin-managed via Site Settings (address,
// shopInfo, phone) — see lib/site-settings.ts. Each is hidden individually if its underlying
// field is empty, same as everywhere else contact info is shown.
export default async function TrustBar() {
  const settings = await getSiteSettings();

  const items: TrustItem[] = [
    ...(settings.address
      ? [{ key: 'address', icon: Truck, primary: settings.address, secondary: '' }]
      : []),
    { key: 'cod', icon: Wallet, primary: 'Cash on Delivery', secondary: 'pay when it arrives' },
    ...(settings.shopInfo || settings.phone
      ? [{ key: 'call', icon: Phone, primary: settings.shopInfo, secondary: settings.phone }]
      : []),
    { key: 'message', icon: MessageCircle, primary: 'Message us,', secondary: 'respond same day!' },
  ];

  return (
    <section className="mt-8 lg:mt-10">
      <div className="grid grid-cols-2 gap-x-3 gap-y-5 rounded-2xl border border-divider bg-surface px-4 py-5 shadow-sm lg:grid-cols-4 lg:gap-0 lg:rounded-3xl lg:px-8 lg:py-9 lg:shadow-md">
        {items.map((item) => (
          <div
            key={item.key}
            className="flex min-w-0 items-center gap-2.5 lg:gap-4 lg:border-l lg:border-accent-100 lg:px-8 first:lg:border-l-0 first:lg:pl-0 last:lg:pr-0"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-100 lg:h-16 lg:w-16">
              <item.icon className="h-5 w-5 text-accent-600 lg:h-7 lg:w-7" strokeWidth={1.75} />
            </div>

            <div className="min-w-0">
              {item.primary ? <p className="line-clamp-2 text-sm font-semibold leading-snug text-foreground lg:text-lg">{item.primary}</p> : null}
              {item.secondary ? <p className="mt-0.5 truncate text-xs text-secondary lg:text-base">{item.secondary}</p> : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
