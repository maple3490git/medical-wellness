export const BUSINESS = {
  name: "Medical Wellness",
  tagline: "Là où la Science Rencontre la Sérénité",
  positioning: "Bien-Être Médical de Luxe",
  address: "Villa Mernissi, Bella Vista, à côté de Malabata Mall, Tanger, Maroc",
  phone: "+212 5 39 33 33 33",
  email: "contact@medical-wellness.ma",
  hours: "Lun–Sam : 9h00 – 20h00",
  currency: "DH",
  founder: "Dr. Abdelali Mernissi",
};

export const CURRENCY = "DH";

export const STATUS = {
  appointment: {
    confirmed: { label: "Confirmé", color: "emerald" },
    pending: { label: "En attente", color: "amber" },
    completed: { label: "Terminé", color: "sky" },
    cancelled: { label: "Annulé", color: "rose" },
    absent: { label: "Absent", color: "zinc" },
  },
  payment: {
    paid: { label: "Payé", color: "emerald" },
    partial: { label: "Partiellement payé", color: "amber" },
    unpaid: { label: "Impayé", color: "rose" },
    refunded: { label: "Remboursé", color: "zinc" },
  },
  invoice: {
    paid: { label: "Payée", color: "emerald" },
    partial: { label: "Partiellement payée", color: "amber" },
    unpaid: { label: "Impayée", color: "rose" },
    cancelled: { label: "Annulée", color: "zinc" },
  },
  employee: {
    active: { label: "Actif", color: "emerald" },
    absence: { label: "Absence", color: "amber" },
    inactive: { label: "Inactif", color: "zinc" },
  },
  stock: {
    in: { label: "Entrée", color: "emerald" },
    out: { label: "Sortie", color: "rose" },
  },
  prestation: {
    submitted: { label: "Soumise", color: "sky" },
    validated: { label: "Validée", color: "emerald" },
  },
};

export const NAVIGATION = [
  { name: "Tableau de bord", href: "/dashboard", icon: "LayoutDashboard", section: "principal" },
  { name: "Patients", href: "/patients", icon: "Users", section: "principal" },
  { name: "Rendez-vous", href: "/rendez-vous", icon: "CalendarDays", section: "principal" },
  { name: "Services", href: "/services", icon: "Stethoscope", section: "principal" },
  { name: "Personnel", href: "/personnel", icon: "UserCog", section: "principal" },
  { name: "Prestations", href: "/prestations", icon: "ClipboardList", section: "principal" },
  { name: "Caisse", href: "/caisse", icon: "HandCoins", section: "principal" },
  { name: "Facturation", href: "/facturation", icon: "Receipt", section: "principal" },
  { name: "Paiements", href: "/paiements", icon: "CreditCard", section: "finance" },
  { name: "Stock", href: "/stock", icon: "Package", section: "finance" },
  { name: "Fournisseurs", href: "/fournisseurs", icon: "Truck", section: "finance" },
  { name: "Analyses", href: "/analyses", icon: "FlaskConical", section: "medical" },
  { name: "Documents", href: "/documents", icon: "FolderOpen", section: "medical" },
  { name: "Notes internes", href: "/notes-internes", icon: "StickyNote", section: "medical" },
  { name: "Rapports", href: "/rapports", icon: "BarChart3", section: "medical" },
  { name: "Notifications", href: "/notifications", icon: "Bell", section: "system" },
  { name: "Utilisateurs", href: "/utilisateurs", icon: "ShieldCheck", section: "system" },
  { name: "Paramètres", href: "/parametres", icon: "Settings", section: "system" },
];

export const MOBILE_NAV = [
  { name: "Accueil", href: "/dashboard", icon: "Home" },
  { name: "RDV", href: "/rendez-vous", icon: "CalendarDays" },
  { name: "Patients", href: "/patients", icon: "Users" },
  { name: "Caisse", href: "/caisse", icon: "HandCoins" },
  { name: "Menu", href: "/plus", icon: "LayoutGrid" },
];

export const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: "Bonjour, {name}", subtitle: "Voici un aperçu de l'activité de Medical Wellness." },
  patients: { title: "Patients", subtitle: "Gérez le fichier clients de Medical Wellness." },
  "rendez-vous": { title: "Rendez-vous", subtitle: "Planifiez et suivez les rendez-vous du centre." },
  services: { title: "Services", subtitle: "Gérez les services et prestations proposés." },
  personnel: { title: "Personnel", subtitle: "Gérez l'équipe et les horaires." },
  prestations: { title: "Prestations", subtitle: "Saisie et suivi des prestations réalisées." },
  caisse: { title: "Caisse", subtitle: "Encaissements et clôture de caisse." },
  facturation: { title: "Facturation", subtitle: "Factures et devis de Medical Wellness." },
  paiements: { title: "Paiements", subtitle: "Historique des paiements reçus." },
  stock: { title: "Stock", subtitle: "Inventaire et alertes de réapprovisionnement." },
  fournisseurs: { title: "Fournisseurs", subtitle: "Gérez vos fournisseurs et produits." },
  analyses: { title: "Analyses", subtitle: "Analyses médicales et résultats." },
  documents: { title: "Documents", subtitle: "Gestion centralisée des documents." },
  "notes-internes": { title: "Notes internes", subtitle: "Notes privées de l'équipe." },
  rapports: { title: "Rapports", subtitle: "Statistiques et indicateurs de performance." },
  notifications: { title: "Notifications", subtitle: "Centre de notifications." },
  utilisateurs: { title: "Utilisateurs", subtitle: "Comptes et accès." },
  parametres: { title: "Paramètres", subtitle: "Configuration du logiciel." },
  profil: { title: "Mon Profil", subtitle: "Vos informations personnelles." },
};

export const SERVICE_CATEGORIES = [
  "Médical",
  "Esthétique",
  "Bien-être",
  "Fitness",
  "Coiffure",
  "Amincissement",
  "Analyse",
  "Consultation",
  "Autres",
];