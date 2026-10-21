# Fiche de réponses — Audit (Medical Wellness)

Réponses rapides aux questions typiques d'un audit technique / métier.

## 1. Stack technique

- **Langage** : TypeScript (frontend + backend), JavaScript (Electron).
- **Frontend** : Next.js 15 (App Router), React 19, Tailwind CSS 3.
- **Bureau** : Electron 33 (application Windows portable).
- **Mobile** : Capacitor 6 (Android).
- **Données** : couche d'accès générique (`src/lib/db.ts`) + services métier (`src/services/`).
- **Graphiques** : Recharts. **Export** : xlsx. **Icônes** : lucide-react.

## 2. Architecture

- Application web statique exportée (Next.js `output: "export"`), servie localement par Electron.
- Couches : `components/ui` (UI), `services/` (logique métier), `lib/db.ts` (accès données), `data/` (seed).
- Routage par rôles (RBAC) : `src/lib/navigation.ts` + `RoleGuard`.
- Pas de backend distant : tout tourne en local (poste de travail).

## 3. État d'avancement

- **~40 %** : UI et workflows métier (patients, RDV, prestations, caisse, facturation, stock, analyses, documents, rapports, utilisateurs, rôles, audit) sont construits.
- **En cours** : couche base de données (interface `DbCollection` prête, seed en mémoire, migration vers une vraie DB prévue).
- **À faire** : persistance réelle, authentification forte, tests automatisés, déploiement multi-postes.

## 4. Base de données

- Actuellement : stockage **en mémoire** (données de démonstration) via `src/lib/db.ts`.
- Interface `DbCollection<T>` générique (all/byId/insert/update/remove/filter/count) → remplaçable par Prisma/Drizzle/pg sans toucher au reste.
- Schéma typé : `Patient`, `User`, `Appointment`, etc. (`src/lib/types.ts`).
- Migration prévue : SQLite (poste unique) ou PostgreSQL (multi-postes).

## 5. Sécurité & accès

- Authentification par e-mail + mot de passe (mock en démo).
- **RBAC** : 10 rôles (admin, directeur, médecin, réception, infirmier, labo, comptabilité, coach, responsable, employé), permissions granulaires (`roles.manage`, `audit.view`, ...).
- `RoleGuard` bloque l'accès aux pages non autorisées.
- Journal d'audit (`/audit`) : trace des actions utilisateur (qui, quoi, quand, module).
- Sessions persistées localement (`mw-user`).

## 6. Données & conformité

- Données patients : nom, téléphone, e-mail, adresse, date de naissance, notes médicales, allergies, tags.
- Pas de transmission réseau (tout local) → surface d'attaque réduite.
- Conformité RGPD / loi marocaine sur la protection des données : à formaliser (consentement, durée de conservation, droit à l'oubli) — prévu pour la suite.

## 7. Traçabilité

- Page `/audit` : journal des actions (utilisateur, action, module, date).
- Statuts des prestations (soumise / validée) avec workflow de validation.

## 8. Déploiement

- Bureau : exécutable Windows portable (`dist/Medical Wellness Logiciel.exe`), pas d'installation requise.
- Mobile : APK Android (`dist/Medical Wellness Logiciel.apk`).
- Pas de serveur à déployer.

## 9. Tests

- Vérification TypeScript (`tsc --noEmit`) + build Next.js.
- Smoke test automatisé Electron (chargement + routes).
- Tests unitaires : prévus (Jest/Vitest) pour la couche service.

## 10. Points à améliorer (transparence)

- Authentification à renforcer (hashage, 2FA) avant production.
- Persistance réelle (DB) en cours.
- Tests automatisés à ajouter.
- Signature de l'exécutable (certificat) pour éviter les alertes SmartScreen.
