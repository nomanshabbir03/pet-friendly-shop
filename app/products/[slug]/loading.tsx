export default function Loading() {
  return (
    <main className="mx-auto max-w-7xl animate-pulse px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
        <div className="aspect-square rounded-2xl bg-brand-50" />
        <div className="space-y-4">
          <div className="h-4 w-24 rounded-full bg-brand-100" />
          <div className="h-8 w-3/4 rounded-full bg-brand-50" />
          <div className="h-7 w-32 rounded-full bg-brand-100" />
          <div className="h-24 rounded-2xl bg-brand-50" />
          <div className="h-12 rounded-full bg-brand-50" />
        </div>
      </div>
    </main>
  );
}
