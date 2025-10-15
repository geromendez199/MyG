import { Metadata } from "next";
import { TokenGate } from "@/components/admin/token-gate";
import { AdminDashboard } from "@/components/admin/dashboard";
import { siteName } from "@/lib/config";

export const metadata: Metadata = {
  title: `Panel | ${siteName}`,
};

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 py-12">
      <header className="space-y-3 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Panel de vehículos</h1>
        <p className="text-sm text-slate-600">
          Cargá nuevas unidades, editá información existente y gestioná las imágenes desde un único lugar protegido por token.
        </p>
      </header>
      <TokenGate>
        {(token) => <AdminDashboard token={token} />}
      </TokenGate>
    </div>
  );
}
