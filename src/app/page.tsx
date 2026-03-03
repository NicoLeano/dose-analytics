import { KPICard } from "@/components/KPICard";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
      <p className="text-zinc-500 mb-8">DOSE OF Analytics Overview</p>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <KPICard
          label="This Month Revenue"
          value="--"
          subtitle="Connect data to see metrics"
        />
        <KPICard
          label="Meta Ad Spend"
          value="--"
        />
        <KPICard
          label="Blended ROAS"
          value="--"
        />
        <KPICard
          label="Total Orders"
          value="--"
        />
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-3 gap-6">
        <Link href="/pnl" className="block">
          <div className="bg-white rounded-xl border border-zinc-200 p-6 hover:shadow-lg transition-shadow">
            <div className="text-lg font-semibold mb-2">P&L Dashboard</div>
            <p className="text-sm text-zinc-500">
              Monthly and daily profit & loss by platform
            </p>
          </div>
        </Link>

        <Link href="/creatives" className="block">
          <div className="bg-white rounded-xl border border-zinc-200 p-6 hover:shadow-lg transition-shadow">
            <div className="text-lg font-semibold mb-2">Creative Analytics</div>
            <p className="text-sm text-zinc-500">
              Meta ad performance by creative with ROAS, CPA, CTR
            </p>
          </div>
        </Link>

        <Link href="/halo" className="block">
          <div className="bg-white rounded-xl border border-zinc-200 p-6 hover:shadow-lg transition-shadow">
            <div className="text-lg font-semibold mb-2">Halo Effect</div>
            <p className="text-sm text-zinc-500">
              Cross-channel correlation analysis
            </p>
          </div>
        </Link>
      </div>

      {/* Setup Instructions */}
      <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-amber-800 mb-2">Setup Required</h2>
        <p className="text-sm text-amber-700 mb-4">
          To see data in this dashboard, complete the following:
        </p>
        <ol className="list-decimal list-inside text-sm text-amber-700 space-y-2">
          <li>Configure Airbyte Cloud to sync data to Supabase <code className="bg-amber-100 px-1 rounded">raw.*</code> schema</li>
          <li>Run <code className="bg-amber-100 px-1 rounded">dbt run</code> to transform data into marts</li>
          <li>Add your Supabase anon key to <code className="bg-amber-100 px-1 rounded">.env.local</code></li>
          <li>Enable RLS policies on <code className="bg-amber-100 px-1 rounded">fct_*</code> tables for public read</li>
        </ol>
      </div>
    </div>
  );
}
