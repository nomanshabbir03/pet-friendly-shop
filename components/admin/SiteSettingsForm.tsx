'use client';

import { useEffect, useState } from 'react';

type SocialLinks = {
  facebook: string;
  instagram: string;
  twitter: string;
  tiktok: string;
  youtube: string;
};

type FormValues = {
  email: string;
  phone: string;
  whatsappNumber: string;
  address: string;
  socialLinks: SocialLinks;
  deliveryInfo: string;
  shopInfo: string;
};

const blankValues: FormValues = {
  email: '',
  phone: '',
  whatsappNumber: '',
  address: '',
  socialLinks: { facebook: '', instagram: '', twitter: '', tiktok: '', youtube: '' },
  deliveryInfo: '',
  shopInfo: '',
};

export default function SiteSettingsForm() {
  const [values, setValues] = useState<FormValues>(blankValues);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let cancelled = false;

    fetch('/api/admin/site-settings')
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data?.success && data.data) {
          setValues({
            ...blankValues,
            ...data.data,
            socialLinks: { ...blankValues.socialLinks, ...(data.data.socialLinks || {}) },
          });
        }
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load current site settings.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  };

  const handleSocialChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, socialLinks: { ...current.socialLinks, [name]: value } }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to save site settings.');
      }

      setSuccess('Site settings saved.');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to save site settings.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-divider bg-surface p-5 shadow-sm sm:p-6">
      <div>
        <h2 className="font-display text-xl text-brand-500">Contact &amp; Shop Info</h2>
        <p className="mt-1 text-sm text-secondary/70">
          Shown in the Footer, Contact page, the info bar below the hero slider, and the floating WhatsApp button.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-brand-500">Email</label>
          <input name="email" value={values.email} onChange={handleChange} disabled={isLoading} placeholder="you@example.com" className="w-full rounded-2xl border border-divider px-3 py-2 disabled:opacity-60" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-brand-500">Phone</label>
          <input name="phone" value={values.phone} onChange={handleChange} disabled={isLoading} placeholder="+923014288772" className="w-full rounded-2xl border border-divider px-3 py-2 disabled:opacity-60" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-brand-500">WhatsApp Number</label>
          <input name="whatsappNumber" value={values.whatsappNumber} onChange={handleChange} disabled={isLoading} placeholder="923014288772" className="w-full rounded-2xl border border-divider px-3 py-2 disabled:opacity-60" />
          <p className="mt-1 text-xs text-secondary/60">Digits only, with country code, no + or spaces (e.g. 923014288772).</p>
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-brand-500">Address / Shop Location</label>
          <input name="address" value={values.address} onChange={handleChange} disabled={isLoading} placeholder="Punjab Co-Operative Housing Society, Lahore, Pakistan" className="w-full rounded-2xl border border-divider px-3 py-2 disabled:opacity-60" />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-brand-500">Shop Info</label>
        <input name="shopInfo" value={values.shopInfo} onChange={handleChange} disabled={isLoading} placeholder="e.g. Call us in 09:00-22:00h" className="w-full rounded-2xl border border-divider px-3 py-2 disabled:opacity-60" />
        <p className="mt-1 text-xs text-secondary/60">Short line shown in the info bar and as business hours on the Contact page.</p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-brand-500">Delivery Info</label>
        <textarea name="deliveryInfo" rows={2} value={values.deliveryInfo} onChange={handleChange} disabled={isLoading} placeholder="e.g. Cash on Delivery, across Pakistan" className="w-full rounded-2xl border border-divider px-3 py-2 disabled:opacity-60" />
        <p className="mt-1 text-xs text-secondary/60">Not yet wired to a page — reserved for future use.</p>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-brand-500">Social Links</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-brand-500">Facebook</label>
            <input name="facebook" value={values.socialLinks.facebook} onChange={handleSocialChange} disabled={isLoading} placeholder="https://facebook.com/..." className="w-full rounded-2xl border border-divider px-3 py-2 disabled:opacity-60" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-brand-500">Instagram</label>
            <input name="instagram" value={values.socialLinks.instagram} onChange={handleSocialChange} disabled={isLoading} placeholder="https://instagram.com/..." className="w-full rounded-2xl border border-divider px-3 py-2 disabled:opacity-60" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-brand-500">TikTok</label>
            <input name="tiktok" value={values.socialLinks.tiktok} onChange={handleSocialChange} disabled={isLoading} placeholder="https://tiktok.com/@..." className="w-full rounded-2xl border border-divider px-3 py-2 disabled:opacity-60" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-brand-500">Twitter / X</label>
            <input name="twitter" value={values.socialLinks.twitter} onChange={handleSocialChange} disabled={isLoading} placeholder="https://x.com/..." className="w-full rounded-2xl border border-divider px-3 py-2 disabled:opacity-60" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-brand-500">YouTube</label>
            <input name="youtube" value={values.socialLinks.youtube} onChange={handleSocialChange} disabled={isLoading} placeholder="https://youtube.com/@..." className="w-full rounded-2xl border border-divider px-3 py-2 disabled:opacity-60" />
          </div>
        </div>
        <p className="mt-2 text-xs text-secondary/60">Leave any of these empty to hide that icon on the site.</p>
      </div>

      {error ? <p className="text-sm text-error">{error}</p> : null}
      {success ? <p className="text-sm text-success">{success}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting || isLoading}
        className="rounded-full bg-brand-500 px-4 py-2 font-semibold text-surface transition hover:opacity-90 disabled:opacity-70"
      >
        {isSubmitting ? 'Saving...' : 'Save Settings'}
      </button>
    </form>
  );
}
