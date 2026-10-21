export type Role =
  | "admin"
  | "directeur"
  | "medecin"
  | "reception"
  | "infirmier"
  | "laboratoire"
  | "comptabilite"
  | "coach"
  | "responsable"
  | "employe";

export type Permission =
  | "dashboard.view"
  | "patients.view"
  | "patients.create"
  | "patients.edit"
  | "patients.delete"
  | "appointments.view"
  | "appointments.create"
  | "appointments.edit"
  | "appointments.delete"
  | "services.view"
  | "services.create"
  | "services.edit"
  | "services.delete"
  | "staff.view"
  | "staff.create"
  | "staff.edit"
  | "staff.delete"
  | "prestations.view"
  | "prestations.create"
  | "prestations.edit"
  | "prestations.delete"
  | "prestations.export"
  | "caisse.view"
  | "caisse.transact"
  | "caisse.close"
  | "invoices.view"
  | "invoices.create"
  | "invoices.edit"
  | "invoices.delete"
  | "invoices.print"
  | "payments.view"
  | "payments.create"
  | "payments.refund"
  | "stock.view"
  | "stock.create"
  | "stock.edit"
  | "stock.delete"
  | "suppliers.view"
  | "suppliers.create"
  | "suppliers.edit"
  | "suppliers.delete"
  | "analyses.view"
  | "analyses.create"
  | "documents.view"
  | "documents.upload"
  | "documents.delete"
  | "notes.view"
  | "notes.create"
  | "notes.delete"
  | "reports.view"
  | "reports.export"
  | "users.view"
  | "users.create"
  | "users.edit"
  | "users.delete"
  | "roles.manage"
  | "settings.view"
  | "settings.edit"
  | "audit.view"
  | "notifications.view"
  | "notifications.send";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: Role;
  roleLabel: string;
  status: "active" | "inactive";
  lastLogin: string;
  avatar?: string;
  department?: string;
  serviceId?: string;
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  gender: "M" | "F";
  birthDate: string;
  address: string;
  notes?: string;
  status: "actif" | "inactif";
  totalSpent: number;
  lastVisit: string;
  nextAppointment: string | null;
  createdAt: string;
  tags?: string[];
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  serviceId: string;
  serviceName: string;
  staffId: string;
  staffName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "confirmed" | "pending" | "completed" | "cancelled" | "absent";
  notes?: string;
  room?: string;
  color?: string;
}

export interface Service {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  price: number;
  durationMinutes: number;
  durationLabel: string;
  currency: string;
  active: boolean;
  staffIds: string[];
  room?: string;
  wellnessCoinsReward?: number;
  image?: string;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  role: string;
  specialty: string;
  serviceId?: string;
  department: string;
  status: "active" | "absence" | "inactive";
  schedule: string[];
  services: string[];
  color: string;
  hireDate: string;
}

export interface Prestation {
  id: string;
  date: string;
  lastName: string;
  firstName: string;
  serviceId: string;
  serviceName: string;
  employeeId: string;
  employeeName: string;
  timeIn: string;
  timeOut: string;
  price: number;
  status: "submitted" | "validated";
  notes?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  salePrice: number;
  purchasePrice: number;
  supplierId: string;
  expirationDate?: string;
  active: boolean;
}

export interface Supplier {
  id: string;
  company: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
  products: string[];
}

export interface Invoice {
  id: string;
  number: string;
  clientName: string;
  date: string;
  dueDate: string;
  items: { label: string; qty: number; price: number }[];
  total: number;
  paid: number;
  status: "paid" | "partial" | "unpaid" | "cancelled";
  method?: string;
}

export interface Payment {
  id: string;
  reference: string;
  clientName: string;
  date: string;
  amount: number;
  method: "Espèces" | "Carte bancaire" | "Virement" | "WellnessCoins" | "Chèque";
  status: "paid" | "partial" | "unpaid" | "refunded";
  invoiceId?: string;
  serviceName?: string;
}

export interface AnalysisReport {
  id: string;
  patientName: string;
  type: string;
  date: string;
  status: "done" | "pending" | "cancelled";
  results?: string;
  doctorName: string;
}

export interface DocumentItem {
  id: string;
  name: string;
  type: string;
  category: string;
  patientName?: string;
  uploadedBy: string;
  date: string;
  size: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  date: string;
  module: string;
}

export interface AuditEntry {
  id: string;
  user: string;
  action: string;
  date: string;
  module: string;
  previousValue?: string;
  newValue?: string;
}

export interface ActivityEntry {
  id: string;
  type: string;
  text: string;
  date: string;
  user: string;
  color: string;
}

export interface HealthMetric {
  patientName: string;
  test: string;
  date: string;
  result: string;
  reference: string;
  status: "normal" | "attention" | "critique";
}