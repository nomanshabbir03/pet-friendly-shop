export default function Loading() {
  return (
    <main className="mx-auto max-w-7xl animate-pulse px-4 py-6 sm:px-6 lg:px-8">
      <div className="h-8 w-48 rounded-full bg-brand-50" />
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="overflow-hidden rounded-2xl border border-divider">
            <div className="aspect-square bg-brand-50" />
            <div className="space-y-2 p-3">
              <div className="h-3 w-1/2 rounded-full bg-brand-100" />
              <div className="h-4 w-full rounded-full bg-brand-50" />
              <div className="h-5 w-1/3 rounded-full bg-brand-100" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
