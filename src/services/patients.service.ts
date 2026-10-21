import type { Patient } from "@/lib/types";
import { db } from "@/lib/db";

export interface ServiceResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

export interface CreatePatientInput {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  gender: "M" | "F";
  birthDate: string;
  address: string;
  notes?: string;
}

// Bridge vers le backend Electron (MySQL) si disponible.
interface ElectronPatientApi {
  list: () => Promise<Patient[]>;
  get: (id: string) => Promise<Patient | null>;
  create: (data: CreatePatientInput) => Promise<Patient>;
  update: (id: string, patch: Partial<Patient>) => Promise<Patient | null>;
  remove: (id: string) => Promise<boolean>;
  count: () => Promise<number>;
}

function electronApi(): ElectronPatientApi | null {
  if (typeof window === "undefined") return null;
  const api = (window as unknown as { electronAPI?: { db?: { patients?: ElectronPatientApi } } }).electronAPI;
  return api?.db?.patients ?? null;
}

function validate(input: CreatePatientInput): string | null {
  if (!input.firstName.trim()) return "Le prénom est obligatoire.";
  if (!input.lastName.trim()) return "Le nom est obligatoire.";
  if (!input.phone.trim()) return "Le téléphone est obligatoire.";
  if (!/^\+?[\d\s-]{8,}$/.test(input.phone.trim())) return "Numéro de téléphone invalide.";
  if (!input.email.trim()) return "L'e-mail est obligatoire.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) return "Adresse e-mail invalide.";
  if (input.gender !== "M" && input.gender !== "F") return "Genre invalide.";
  if (!input.birthDate.trim()) return "La date de naissance est obligatoire.";
  if (!input.address.trim()) return "L'adresse est obligatoire.";
  return null;
}

export const patientsService = {
  async list(): Promise<Patient[]> {
    const api = electronApi();
    if (api) {
      try { return await api.list(); } catch { /* fallback */ }
    }
    return db.patients.all();
  },

  async get(id: string): Promise<Patient | undefined> {
    const api = electronApi();
    if (api) {
      try { const p = await api.get(id); return p ?? undefined; } catch { /* fallback */ }
    }
    return db.patients.byId(id);
  },

  async search(query: string): Promise<Patient[]> {
    const all = await this.list();
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      (p) =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
        p.phone.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q)
    );
  },

  async create(input: CreatePatientInput): Promise<ServiceResult<Patient>> {
    const error = validate(input);
    if (error) return { ok: false, error };

    const api = electronApi();
    if (api) {
      try {
        const patient = await api.create(input);
        return { ok: true, data: patient };
      } catch (e) {
        return { ok: false, error: (e as Error).message || "Erreur serveur." };
      }
    }

    // Fallback mock (dev / web / mobile)
    const duplicate = db.patients.all().find((p) => p.email.toLowerCase() === input.email.trim().toLowerCase());
    if (duplicate) return { ok: false, error: "Un patient avec cet e-mail existe déjà." };

    const now = new Date().toISOString().slice(0, 10);
    const patient: Patient = {
      id: `pat-${String(db.patients.count() + 1).padStart(3, "0")}`,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      phone: input.phone.trim(),
      email: input.email.trim(),
      gender: input.gender,
      birthDate: input.birthDate.trim(),
      address: input.address.trim(),
      notes: input.notes?.trim(),
      status: "actif",
      totalSpent: 0,
      lastVisit: now,
      nextAppointment: null,
      createdAt: now,
      tags: [],
    };
    db.patients.insert(patient);
    return { ok: true, data: patient };
  },

  async update(id: string, patch: Partial<Patient>): Promise<ServiceResult<Patient>> {
    const api = electronApi();
    if (api) {
      try {
        const patient = await api.update(id, patch);
        if (!patient) return { ok: false, error: "Patient introuvable." };
        return { ok: true, data: patient };
      } catch (e) {
        return { ok: false, error: (e as Error).message || "Erreur serveur." };
      }
    }
    const existing = db.patients.byId(id);
    if (!existing) return { ok: false, error: "Patient introuvable." };
    const updated = db.patients.update(id, patch);
    if (!updated) return { ok: false, error: "Mise à jour impossible." };
    return { ok: true, data: updated };
  },

  async remove(id: string): Promise<ServiceResult<true>> {
    const api = electronApi();
    if (api) {
      try {
        const ok = await api.remove(id);
        if (!ok) return { ok: false, error: "Patient introuvable." };
        return { ok: true, data: true };
      } catch (e) {
        return { ok: false, error: (e as Error).message || "Erreur serveur." };
      }
    }
    const ok = db.patients.remove(id);
    if (!ok) return { ok: false, error: "Patient introuvable." };
    return { ok: true, data: true };
  },

  async count(): Promise<number> {
    const api = electronApi();
    if (api) {
      try { return await api.count(); } catch { /* fallback */ }
    }
    return db.patients.count();
  },
};

export default patientsService;
