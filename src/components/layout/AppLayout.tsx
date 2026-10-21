"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import MobileNav from "@/components/layout/MobileNav";
import { X } from "lucide-react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[rgb(var(--bg-app))]">
      {/* Desktop fixed sidebar */}
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-noir-950/60 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[280px] max-w-[85vw] bg-[rgb(var(--surface))] shadow-2xl animate-slide-in-left flex flex-col overflow-y-auto">
            <div className="flex justify-end p-3 border-b border-[rgb(var(--border))]">
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-2 rounded-lg text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--surface-soft))]"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1">
              <Sidebar collapsed={false} onToggle={() => {}} onNavigate={() => setDrawerOpen(false)} mobile />
            </div>
          </div>
        </div>
      )}

      <div className={`transition-all duration-300 ${collapsed ? "lg:pl-[76px]" : "lg:pl-[264px]"}`}>
        <Header onMenuClick={() => setDrawerOpen(true)} />
        <main className="px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-8 max-w-[1600px] mx-auto">
          {children}
        </main>
      </div>

      <MobileNav />
    </div>
  );
}