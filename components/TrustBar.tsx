import { Truck, Star, Phone, MessageCircle, type LucideIcon } from 'lucide-react';
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
    { key: 'rating', icon: Star, primary: 'Rating 4.9/5.0', secondary: 'from verified users' },
    ...(settings.shopInfo || settings.phone
      ? [{ key: 'call', icon: Phone, primary: settings.shopInfo, secondary: settings.phone }]
      : []),
    { key: 'message', icon: MessageCircle, primary: 'Message us,', secondary: 'respond same day!' },
  ];

  return (
    <section className="mt-10">
      <div className="grid grid-cols-1 gap-8 rounded-3xl border border-divider bg-surface px-8 py-9 shadow-md sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
        {items.map((item) => (
          <div
            key={item.key}
            className="flex items-center gap-4 lg:border-l lg:border-accent-100 lg:px-8 first:lg:border-l-0 first:lg:pl-0 last:lg:pr-0"
          >
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-accent-100">
              <item.icon className="h-7 w-7 text-accent-600" strokeWidth={1.75} />
            </div>

            <div className="min-w-0">
              {item.primary ? <p className="line-clamp-2 text-lg font-semibold leading-snug text-foreground">{item.primary}</p> : null}
              {item.secondary ? <p className="mt-0.5 truncate text-base text-secondary">{item.secondary}</p> : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
