import type { AnalysisReport, DocumentItem, Notification, AuditEntry, ActivityEntry, HealthMetric } from "@/lib/types";

export const analyses: AnalysisReport[] = [
  {
    id: "ana-001",
    patientName: "Adam Karim",
    type: "Bilan métabolique complet",
    date: "2026-09-14",
    status: "done",
    results: "Inclinaison : glycémie normale. Carences en magnésium détectées.",
    doctorName: "Dr. Mehdi Mernissi",
  },
  {
    id: "ana-002",
    patientName: "Fatima Zahra El Idrissi",
    type: "Profilage micronutritionnel (Oligocheck)",
    date: "2026-09-12",
    status: "done",
    results: "Carence en vitamine D et zinc. Plan de supplémentation recommandé.",
    doctorName: "Dr. Abdelali Mernissi",
  },
  {
    id: "ana-003",
    patientName: "Rachid Benkiran",
    type: "Bilan lipidique",
    date: "2026-09-10",
    status: "done",
    results: "Cholestérol LDL légèrement élevé. Suivi nutritionnel conseillé.",
    doctorName: "Dr. Mehdi Mernissi",
  },
  {
    id: "ana-004",
    patientName: "Lina Haddad",
    type: "Analyse morphologique",
    date: "2026-09-17",
    status: "pending",
    doctorName: "Youssef Alaoui",
  },
  {
    id: "ana-005",
    patientName: "Nora Fassi",
    type: "Profilage hormonal",
    date: "2026-09-16",
    status: "done",
    results: "Résultats dans les normes. Aucun déséquilibre détecté.",
    doctorName: "Dr. Mehdi Mernissi",
  },
  {
    id: "ana-006",
    patientName: "Mehdi Bouzidi",
    type: "Évaluation de la composition corporelle",
    date: "2026-09-18",
    status: "pending",
    doctorName: "Youssef Alaoui",
  },
];

export const healthMetrics: HealthMetric[] = [
  { patientName: "Adam Karim", test: "Glycémie à jeun", date: "2026-09-14", result: "0,92 g/L", reference: "0,70 – 1,10", status: "normal" },
  { patientName: "Adam Karim", test: "Magnésium", date: "2026-09-14", result: "16 mg/L", reference: "18 – 24", status: "attention" },
  { patientName: "Rachid Benkiran", test: "Cholestérol LDL", date: "2026-09-10", result: "1,42 g/L", reference: "< 1,30", status: "attention" },
  { patientName: "Fatima Zahra", test: "Vitamine D", date: "2026-09-12", result: "19 ng/mL", reference: "30 – 80", status: "critique" },
  { patientName: "Nora Fassi", test: "TSH", date: "2026-09-16", result: "2,1 mUI/L", reference: "0,4 – 4,0", status: "normal" },
  { patientName: "Meryem Fikri", test: "Ferritine", date: "2026-09-11", result: "95 ng/mL", reference: "30 – 300", status: "normal" },
];

export const documents: DocumentItem[] = [
  { id: "doc-001", name: "Ordonnance - Septembre 2026", type: "PDF", category: "Ordonnance", patientName: "Adam Karim", uploadedBy: "Dr. Mehdi Mernissi", date: "2026-09-14", size: "245 Ko" },
  { id: "doc-002", name: "Résultat Oligocheck - FZ El Idrissi", type: "PDF", category: "Résultat", patientName: "Fatima Zahra El Idrissi", uploadedBy: "Youssef Alaoui", date: "2026-09-12", size: "512 Ko" },
  { id: "doc-003", name: "Bilan lipidique - Rachid Benkiran", type: "PDF", category: "Analyse", patientName: "Rachid Benkiran", uploadedBy: "Dr. Mehdi Mernissi", date: "2026-09-10", size: "380 Ko" },
  { id: "doc-004", name: "Contrat d'abonnement - Amincissement", type: "PDF", category: "Administratif", patientName: "Meryem Fikri", uploadedBy: "Salma Idrissi", date: "2026-09-09", size: "180 Ko" },
  { id: "doc-005", name: "Consentement éclairé - HIFU", type: "PDF", category: "Administratif", patientName: "Sara El Amrani", uploadedBy: "Nadia Chraibi", date: "2026-09-08", size: "210 Ko" },
  { id: "doc-006", name: "Analyse morphologique - Lina Haddad", type: "XLSX", category: "Résultat", patientName: "Lina Haddad", uploadedBy: "Youssef Alaoui", date: "2026-09-17", size: "640 Ko" },
];

export const notifications: Notification[] = [
  { id: "ntf-001", title: "Nouvelle prestation soumise", message: "Nadia Chraibi a soumis une prestation Esthétique pour Meryem Fikri (750 DH).", type: "info", read: false, date: "2026-09-17T11:10:00", module: "Prestations" },
  { id: "ntf-002", title: "Paiement reçu", message: "Paiement de 300 DH reçu de Lina Haddad (Coiffure).", type: "success", read: false, date: "2026-09-17T10:05:00", module: "Paiements" },
  { id: "ntf-003", title: "Stock faible", message: "Compresses stériles : stock à 3, seuil minimum 10.", type: "warning", read: false, date: "2026-09-17T09:30:00", module: "Stock" },
  { id: "ntf-004", title: "Rendez-vous dans 30 min", message: "Youssef Benali - Kinésithérapie avec Sophie Laurent à 09:00.", type: "info", read: true, date: "2026-09-17T08:30:00", module: "Agenda" },
  { id: "ntf-005", title: "Résultat d'analyse disponible", message: "L'analyse de Lina Haddad est en cours de traitement par le laboratoire.", type: "info", read: true, date: "2026-09-17T08:15:00", module: "Analyses" },
  { id: "ntf-006", title: "Facture créée", message: "Facture FACT-2026-0247 pour Youssef Benali (350 DH).", type: "info", read: false, date: "2026-09-16T18:40:00", module: "Facturation" },
  { id: "ntf-007", title: "Rendez-vous confirmé", message: "Amina Tlemçani - SPA & Hammam confirmé pour demain 16:30.", type: "success", read: true, date: "2026-09-16T17:00:00", module: "Agenda" },
  { id: "ntf-008", title: "Paiement en attente", message: "Facture FACT-2026-0243 de Amina Tlemçani (1550 DH) est impayée depuis 2 jours.", type: "warning", read: true, date: "2026-09-16T15:00:00", module: "Paiements" },
];

export const auditLog: AuditEntry[] = [
  { id: "aud-001", user: "Admin", action: "Création patient", date: "2026-09-17T10:30:00", module: "Patients", newValue: "Nouveau patient : Hassan Tahiri" },
  { id: "aud-002", user: "Salma Idrissi", action: "Modification rendez-vous", date: "2026-09-17T10:12:00", module: "Agenda", previousValue: "RDV 14:00 → 15:00", newValue: "REdéplacé à 15:00" },
  { id: "aud-003", user: "Nadia Chraibi", action: "Saisie prestation", date: "2026-09-17T11:10:00", module: "Prestations", newValue: "Esthétique - Meryem Fikri - 750 DH" },
  { id: "aud-004", user: "Comptabilité", action: "Paiement enregistré", date: "2026-09-17T10:05:00", module: "Paiements", newValue: "300 DH - Lina Haddad" },
  { id: "aud-005", user: "Admin", action: "Facture créée", date: "2026-09-16T18:40:00", module: "Facturation", newValue: "FACT-2026-0247" },
  { id: "aud-006", user: "Youssef Alaoui", action: "Résultat d'analyse", date: "2026-09-16T17:00:00", module: "Analyses", newValue: "Profilage hormonal - Nora Fassi" },
  { id: "aud-007", user: "Admin", action: "Connexion", date: "2026-09-17T08:30:00", module: "Authentification", newValue: "Connexion réussie" },
  { id: "aud-008", user: "Directeur", action: "Modification stock", date: "2026-09-16T16:20:00", module: "Stock", previousValue: "12 unités", newValue: "Entrée de 20 unités (Huile d'argan)" },
];

export const activityFeed: ActivityEntry[] = [
  { id: "act-001", type: "patient", text: "Nouveau patient ajouté : Hassan Tahiri", date: "2026-09-17T10:30:00", user: "Admin", color: "bg-emerald-500" },
  { id: "act-002", type: "payment", text: "Paiement enregistré : 300 DH - Lina Haddad", date: "2026-09-17T10:05:00", user: "Comptabilité", color: "bg-gold-500" },
  { id: "act-003", type: "appointment", text: "Rendez-vous confirmé : SPA & Hammam - Amina Tlemçani", date: "2026-09-16T17:00:00", user: "Réception", color: "bg-sky-500" },
  { id: "act-004", type: "analysis", text: "Résultat d'analyse disponible : Nora Fassi", date: "2026-09-16T17:00:00", user: "Youssef Alaoui", color: "bg-violet-500" },
  { id: "act-005", type: "invoice", text: "Facture créée : FACT-2026-0247 - Youssef Benali", date: "2026-09-16T18:40:00", user: "Admin", color: "bg-rose-500" },
  { id: "act-006", type: "prestation", text: "Nouvelle prestation : Esthétique - Meryem Fikri", date: "2026-09-17T11:10:00", user: "Nadia Chraibi", color: "bg-amber-500" },
];