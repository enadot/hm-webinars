import Link from "next/link";
import { LayoutDashboard, Plus } from "lucide-react";
import { LogoutButton } from "./_components/logout-button";

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3 font-extrabold text-xl">
            <span className="size-9 rounded-xl bg-gradient-to-br from-brand-primary to-brand-purple text-white flex items-center justify-center">
              <LayoutDashboard className="size-5" />
            </span>
            לוח ניהול וובינרים
          </Link>
          <nav className="flex items-center gap-3">
            <Link
              href="/admin/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg font-bold hover:brightness-110 transition text-sm"
            >
              <Plus className="size-4" />
              קמפיין חדש
            </Link>
            <LogoutButton />
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 md:py-12">{children}</main>
    </div>
  );
}
