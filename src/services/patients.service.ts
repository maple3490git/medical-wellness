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

function nextId(): string {
  const n = db.patients.count() + 1;
  return `pat-${String(n).padStart(3, "0")}`;
}

export const patientsService = {
  list(): Patient[] {
    return db.patients.all();
  },

  get(id: string): Patient | undefined {
    return db.patients.byId(id);
  },

  search(query: string): Patient[] {
    const q = query.trim().toLowerCase();
    if (!q) return db.patients.all();
    return db.patients.filter(
      (p) =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
        p.phone.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q)
    );
  },

  create(input: CreatePatientInput): ServiceResult<Patient> {
    const error = validate(input);
    if (error) return { ok: false, error };

    const duplicate = db.patients
      .all()
      .find((p) => p.email.toLowerCase() === input.email.trim().toLowerCase());
    if (duplicate) return { ok: false, error: "Un patient avec cet e-mail existe déjà." };

    const now = new Date().toISOString().slice(0, 10);
    const patient: Patient = {
      id: nextId(),
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

  update(id: string, patch: Partial<Patient>): ServiceResult<Patient> {
    const existing = db.patients.byId(id);
    if (!existing) return { ok: false, error: "Patient introuvable." };
    const updated = db.patients.update(id, patch);
    if (!updated) return { ok: false, error: "Mise à jour impossible." };
    return { ok: true, data: updated };
  },

  remove(id: string): ServiceResult<true> {
    const ok = db.patients.remove(id);
    if (!ok) return { ok: false, error: "Patient introuvable." };
    return { ok: true, data: true };
  },

  count(): number {
    return db.patients.count();
  },
};

export default patientsService;
