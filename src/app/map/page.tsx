import { USMap } from '@/components/USMap';

export default function MapPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <h1 className="mb-6 text-center text-xl font-semibold text-slate-800">
        US Renewable Siting Map (test)
      </h1>
      <USMap />
    </main>
  );
}
