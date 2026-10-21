export interface StatSerie {
  label: string;
  value: number;
  period: string;
}

export const revenueStats: StatSerie[] = [
  { label: "Jan", value: 42000, period: "" },
  { label: "Fév", value: 38500, period: "" },
  { label: "Mar", value: 51200, period: "" },
  { label: "Avr", value: 47800, period: "" },
  { label: "Mai", value: 58900, period: "" },
  { label: "Juin", value: 65100, period: "" },
  { label: "Juil", value: 72400, period: "" },
  { label: "Août", value: 68900, period: "" },
  { label: "Sep", value: 53200, period: "" },
];

export const appointmentsStats: StatSerie[] = [
  { label: "Lun", value: 14, period: "" },
  { label: "Mar", value: 18, period: "" },
  { label: "Mer", value: 16, period: "" },
  { label: "Jeu", value: 22, period: "" },
  { label: "Ven", value: 19, period: "" },
  { label: "Sam", value: 12, period: "" },
  { label: "Dim", value: 6, period: "" },
];

export const clientsGrowth: StatSerie[] = [
  { label: "Avr", value: 182, period: "" },
  { label: "Mai", value: 195, period: "" },
  { label: "Juin", value: 208, period: "" },
  { label: "Juil", value: 221, period: "" },
  { label: "Août", value: 236, period: "" },
  { label: "Sep", value: 247, period: "" },
];

export const servicePerformance = [
  { name: "Esthétique & Anti-âge", value: 28, color: "#d4af37" },
  { name: "Amincissement", value: 22, color: "#a68728" },
  { name: "Kinésithérapie", value: 18, color: "#0ea5e9" },
  { name: "SPA & Hammam", value: 14, color: "#a855f7" },
  { name: "Fitness", value: 10, color: "#84cc16" },
  { name: "Coiffure", value: 8, color: "#f59e0b" },
];

export const dashboardStats = {
  patientsToday: 13,
  patientsTodayDelta: "+8%",
  appointmentsToday: 7,
  appointmentsPending: 2,
  newPatients: 5,
  newPatientsDelta: "+23%",
  revenueToday: 2950,
  revenueMonth: 53200,
  pendingPayments: 3,
  pendingAmount: 2350,
  activeServices: 10,
  staffWorking: 8,
  lowStock: 4,
};

export const monthlyRevenue = [
  { month: "Jan", revenu: 42000, depenses: 28500 },
  { month: "Fév", revenu: 38500, depenses: 27500 },
  { month: "Mar", revenu: 51200, depenses: 31200 },
  { month: "Avr", revenu: 47800, depenses: 30000 },
  { month: "Mai", revenu: 58900, depenses: 33500 },
  { month: "Juin", revenu: 65100, depenses: 35800 },
  { month: "Juil", revenu: 72400, depenses: 38200 },
  { month: "Août", revenu: 68900, depenses: 37100 },
  { month: "Sep", revenu: 53200, depenses: 32500 },
];