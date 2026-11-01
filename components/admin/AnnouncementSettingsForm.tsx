'use client';

import { useEffect, useState } from 'react';

export default function AnnouncementSettingsForm() {
  const [message, setMessage] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let cancelled = false;

    fetch('/api/admin/announcement')
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data?.success && data.data) {
          setMessage(data.data.message || '');
          setIsActive(data.data.isActive !== false);
        }
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load current announcement.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/announcement', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, isActive }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to save announcement.');
      }

      setSuccess('Announcement saved.');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to save announcement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-divider bg-surface p-5 shadow-sm sm:p-6">
      <div>
        <h2 className="font-display text-xl text-brand-500">Announcement Bar</h2>
        <p className="mt-1 text-sm text-secondary/70">Message shown in the scrolling bar above the homepage hero.</p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-brand-500" htmlFor="announcement-message">
          Message
        </label>
        <textarea
          id="announcement-message"
          name="message"
          rows={3}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          disabled={isLoading}
          maxLength={500}
          placeholder="e.g. Free shipping on orders over Rs. 2000!"
          className="w-full rounded-2xl border border-divider px-3 py-2 disabled:opacity-60"
        />
      </div>

      <div className="flex items-center gap-2 rounded-2xl border border-divider p-3">
        <input
          id="announcement-active"
          name="isActive"
          type="checkbox"
          checked={isActive}
          onChange={(event) => setIsActive(event.target.checked)}
          disabled={isLoading}
        />
        <label htmlFor="announcement-active" className="text-sm font-semibold text-brand-500">
          Active (visible on homepage)
        </label>
      </div>

      {error ? <p className="text-sm text-error">{error}</p> : null}
      {success ? <p className="text-sm text-success">{success}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting || isLoading}
        className="rounded-full bg-brand-500 px-4 py-2 font-semibold text-surface transition hover:opacity-90 disabled:opacity-70"
      >
        {isSubmitting ? 'Saving...' : 'Save Announcement'}
      </button>
    </form>
  );
}
