import type { Role, Permission } from "@/lib/types";

export interface NavItem {
  name: string;
  href: string;
  icon: string;
  section: "principal" | "finance" | "medical" | "system";
  permissions: Permission[];
}

export const ALL_NAV: NavItem[] = [
  { name: "Tableau de bord", href: "/dashboard", icon: "LayoutDashboard", section: "principal", permissions: ["dashboard.view"] },
  { name: "Patients", href: "/patients", icon: "Users", section: "principal", permissions: ["patients.view"] },
  { name: "Rendez-vous", href: "/rendez-vous", icon: "CalendarDays", section: "principal", permissions: ["appointments.view"] },
  { name: "Services", href: "/services", icon: "Stethoscope", section: "principal", permissions: ["services.view"] },
  { name: "Personnel", href: "/personnel", icon: "UserCog", section: "principal", permissions: ["staff.view"] },
  { name: "Prestations", href: "/prestations", icon: "ClipboardList", section: "principal", permissions: ["prestations.view", "prestations.create"] },
  { name: "Caisse", href: "/caisse", icon: "HandCoins", section: "principal", permissions: ["caisse.view", "caisse.transact"] },
  { name: "Facturation", href: "/facturation", icon: "Receipt", section: "principal", permissions: ["invoices.view"] },
  { name: "Paiements", href: "/paiements", icon: "CreditCard", section: "finance", permissions: ["payments.view"] },
  { name: "Stock", href: "/stock", icon: "Package", section: "finance", permissions: ["stock.view"] },
  { name: "Fournisseurs", href: "/fournisseurs", icon: "Truck", section: "finance", permissions: ["suppliers.view"] },
  { name: "Analyses", href: "/analyses", icon: "FlaskConical", section: "medical", permissions: ["analyses.view"] },
  { name: "Documents", href: "/documents", icon: "FolderOpen", section: "medical", permissions: ["documents.view"] },
  { name: "Notes internes", href: "/notes-internes", icon: "StickyNote", section: "medical", permissions: ["notes.view"] },
  { name: "Rapports", href: "/rapports", icon: "BarChart3", section: "medical", permissions: ["reports.view"] },
  { name: "Notifications", href: "/notifications", icon: "Bell", section: "system", permissions: ["notifications.view"] },
  { name: "Utilisateurs", href: "/utilisateurs", icon: "ShieldCheck", section: "system", permissions: ["users.view"] },
  { name: "Rôles & permissions", href: "/roles", icon: "KeyRound", section: "system", permissions: ["roles.manage"] },
  { name: "Journal d'audit", href: "/audit", icon: "History", section: "system", permissions: ["audit.view"] },
  { name: "Paramètres", href: "/parametres", icon: "Settings", section: "system", permissions: ["settings.view"] },
];

export const SECTIONS: { id: NavItem["section"]; label: string }[] = [
  { id: "principal", label: "Principal" },
  { id: "finance", label: "Finance" },
  { id: "medical", label: "Médical" },
  { id: "system", label: "Système" },
];

export function navForPermissions(perms: Permission[], isAdmin = false): { item: NavItem; index: number }[] {
  return ALL_NAV.map((item, index) => ({ item, index })).filter(({ item }) =>
    isAdmin || item.permissions.some((p) => perms.includes(p))
  );
}