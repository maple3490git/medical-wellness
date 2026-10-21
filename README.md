# Medical Wellness — Logiciel d'administration

Logiciel d'administration interne pour le centre médical **Medical Wellness**
(Tanger). Application web (Next.js) avec version bureau Windows (Electron) et
version mobile Android (Capacitor).

> Projet en cours de développement. Les données affichées sont pour l'instant des
> données de démonstration (en mémoire) ; la connexion à une base de données réelle
> est prévue pour la suite.

## Stack technique

- **Framework** : Next.js 15 (App Router), React 19, TypeScript
- **Styles** : Tailwind CSS 3, thème clair/sombre, design tokens (or/ivoire/noir)
- **Composants** : bibliothèque interne (`src/components/ui`)
- **Graphiques** : Recharts
- **Export** : xlsx
- **Icônes** : lucide-react
- **Bureau** : Electron 33 + electron-builder (portable Windows)
- **Mobile** : Capacitor 6 (Android)

## Démarrage (développement)

```bash
npm install
npm run dev        # serveur de dev Next.js
npm run desktop    # build + lancement bureau (Electron)
```

## Build de production

```bash
npm run build              # export statique Next.js -> out/
npm run dist:win           # construit l'executable Windows portable -> dist/
npx cap sync android       # synchronise l'export vers l'app Android
cd android && .\gradlew.bat assembleDebug   # APK de test
```

## Structure

```
src/
  app/            pages Next.js (App Router)
  components/     composants UI et layout
  context/        AuthContext, ThemeContext, ToastContext
  data/           données de démonstration (seed)
  lib/            utilitaires, constantes, navigation, db (couche d'accès aux données)
  services/       logique métier (patients.service, ...)
electron/         process principal Electron + serveur local
scripts/          scripts de build / maintenance
android/          projet Capacitor Android
```

## Accès démo

Identifiants de démonstration (à remplacer en production) :

- `admin@medical-wellness.ma` / `admin123`
- `compta@medical-wellness.ma` / `compta123`
- `nadia@medical-wellness.ma` / `employe123`

## Licence

Usage interne — Medical Wellness.
