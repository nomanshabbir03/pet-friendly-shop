import AdminLayoutShell from '@/components/admin/AdminLayoutShell';

// Every /admin/* page must always show live data — several of them (dashboard stats, the
// [id]/edit pages) read straight from MongoDB in a Server Component with no fetch()/dynamic API
// involved, which makes them eligible for Next.js's Full Route Cache (static, cached until
// redeploy) exactly like the public pages this task fixes. Scoped to this layout only — NOT the
// root layout — so the public site keeps its normal caching behavior.
export const dynamic = 'force-dynamic';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutShell>{children}</AdminLayoutShell>;
}
