import { GlassCard } from '@/components/ui/glass-card';

export default function AdminPaymentsPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Payments</h1>
      <GlassCard>
        <p className="text-white/70">
          Revenue-Übersicht und Orders aus Lemon Squeezy API (optional: CSV-Export). 
          Daten können über Lemon Squeezy Dashboard oder API ergänzt werden.
        </p>
      </GlassCard>
    </div>
  );
}
