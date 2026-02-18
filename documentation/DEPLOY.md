# Vercel-Deployment (Lizenz- & Account-App)

## Automatisch auf Vercel deployen

1. **Projekt bei Vercel anbinden**
   - [vercel.com](https://vercel.com) → **Add New** → **Project**
   - Repository auswählen (z. B. `gutenform-builder`)

2. **Root Directory setzen**
   - Unter **Root Directory** auf **Edit** klicken
   - `documentation` eintragen und übernehmen  
   → Vercel baut nur diesen Ordner.

3. **Build-Einstellungen** (werden meist automatisch erkannt)
   - **Framework Preset:** Next.js
   - **Build Command:** `npm run build`
   - **Output Directory:** nicht setzen / leer lassen – Vercel erkennt Static Export automatisch

4. **Deploy**
   - **Deploy** starten. Bei jedem Push in den gewählten Branch wird automatisch neu gebaut und deployed.

## Eigene Domain

- In Vercel: **Project** → **Settings** → **Domains** → Domain eintragen (z. B. `licenses.gutenform.com`).

## Lokal testen

```bash
cd documentation
npm install
npm run build
npm run start
# oder: npx serve out
```

Die App läuft unter **http://localhost:3000/** (kein `/gutenform` mehr).
