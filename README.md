<div align="center">

<img src="./public/icons/icon-512.png" alt="Cellar" width="120" height="120" style="border-radius: 24px;" />

# Cellar

### A premium spirits inventory, in your pocket.

Scan. Catalog. Pour. Remember every bottle.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FYOUR_USERNAME%2Fcellar-app)
[![License: MIT](https://img.shields.io/badge/License-MIT-D4A574.svg?style=flat-square)](./LICENSE)
[![PWA](https://img.shields.io/badge/PWA-installable-000?style=flat-square&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)

[**Live Demo**](https://your-deployment.vercel.app) · [**Report Bug**](../../issues) · [**Request Feature**](../../issues)

</div>

---

<div align="center">

![Cellar Demo](./docs/demo.gif)

*Live barcode scanning · Real-time sync · Built for serious collectors*

</div>

---

## ✨ The Idea

Most inventory apps treat a bottle of Pappy 15 the same as a bottle of Smirnoff. Cellar doesn't.

Built at the intersection of a master bartender's domain knowledge and Apple-grade mobile design, Cellar is a Progressive Web App that lives on your phone's home screen, scans barcodes through your camera, and tracks the things actual collectors care about — proof, mash bills, allocation status, days-since-opened, cost per pour.

It's the catalog you've always meant to keep, finally enjoyable to maintain.

## 📸 Screenshots

<div align="center">
  <img src="./docs/screenshots/cellar.png" width="240" alt="Cellar view" />
  <img src="./docs/screenshots/scanner.png" width="240" alt="Barcode scanner" />
  <img src="./docs/screenshots/detail.png" width="240" alt="Bottle detail" />
</div>
<div align="center">
  <img src="./docs/screenshots/stats.png" width="240" alt="Stats dashboard" />
  <img src="./docs/screenshots/tasting.png" width="240" alt="Tasting notes" />
  <img src="./docs/screenshots/locations.png" width="240" alt="Locations" />
</div>

## 🥃 Features

### Built for collectors
- **Real spirit taxonomy** — Bourbon vs. Rye vs. Tennessee, Single Malt vs. Blended, Blanco vs. Añejo. Not a generic "Type" dropdown.
- **Whiskey-specific fields** — Mash bill, cask type, age statement, proof, distillery, region, batch and barrel numbers
- **Allocation flag** — Mark BTAC, Pappy, Birthday Bourbon, etc. with a badge
- **Bottle lifecycle** — Sealed → Opened → In Use → Finished, with timestamps for each transition
- **Structured tasting notes** — Color swatches, nose/palate/finish chips, 100-point scale or letter grades

### Mobile-first UX
- **Live barcode scanning** — Full-screen camera with cinematic overlay, animated scan line, haptic feedback on detection
- **Cascading UPC lookup** — Local cache → curated premium DB → Open Food Facts → UPCItemDB → smart fuzzy match
- **Bottom sheets** — Native iOS-feel detail views, drag to dismiss
- **Pull to refresh, swipe to delete, long-press for quick actions** — All the gestures you expect
- **PWA installable** — Add to home screen, runs like a native app, works offline

### Intelligence
- **Cost per pour** — Configurable pour size (default 1.5 oz), live cost calculation
- **Drinking-down alerts** — Bottles below 20% remaining
- **Days-open warnings** — Gin past 6 months, whiskey past 2 years
- **Cellar value tracking** — Total worth based on cost basis × remaining
- **Pour log** — Optional logging of every pour for analytics
- **Real-time sync** — Open the app on two devices, watch changes appear instantly

### Design
- True OLED black background — battery-friendly, premium feel
- Amber/whiskey accent palette (`#D4A574`)
- Fraunces (display) + Inter (body) + JetBrains Mono (numerics)
- Spring physics on every interaction
- Skeleton loaders, optimistic UI, animated counters

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| Framework | React 18 + Vite |
| Styling | TailwindCSS + custom theme |
| Animation | Framer Motion |
| Backend | Supabase (Postgres + Auth + Realtime + Storage) |
| Barcode | Quagga.js |
| PWA | vite-plugin-pwa + Workbox |
| Charts | Recharts |
| Icons | Lucide React |
| Hosting | Vercel (one-click deploy) |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- A free [Supabase](https://supabase.com) account
- A modern mobile browser (Safari iOS 16+, Chrome Android)

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/cellar-app.git
cd cellar-app
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com/dashboard)
2. Open the SQL Editor and run the migrations in order:
```bash
   # In the Supabase SQL editor, paste and run:
   supabase/migrations/001_initial_schema.sql
   supabase/migrations/002_rls_policies.sql
```
3. Enable Realtime on the `bottles` table (Database → Replication)
4. Create a Storage bucket named `bottle-photos` (Storage → New bucket, public: false)
5. Grab your **Project URL** and **anon key** from Settings → API

### 3. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 4. Run

```bash
npm run dev
```

Open `http://localhost:5173` on your phone (same Wi-Fi) — sign up with email and start scanning.

> 💡 **Tip:** For barcode scanning to work, your dev server must be HTTPS or localhost. Use `vite --host` to expose on your LAN, or deploy to Vercel for proper HTTPS on mobile.

## 📦 Build & Deploy

### Build for production
```bash
npm run build
npm run preview  # test the production build locally
```

### Deploy to Vercel (recommended)

Click the button at the top of this README, or:

```bash
npm install -g vercel
vercel
```

Set the same env vars in Vercel's dashboard. PWA installability works out-of-the-box on Vercel's HTTPS.

### Deploy elsewhere
The `dist/` folder is a static site — drop it on Netlify, Cloudflare Pages, GitHub Pages, or any static host. Just make sure HTTPS is enabled (required for camera access).

## 📱 Install on iPhone

1. Open the deployed URL in **Safari** (not Chrome — iOS PWAs require Safari)
2. Tap the **Share** button
3. Scroll down, tap **Add to Home Screen**
4. Launch from your home screen — it runs full-screen, no browser chrome

## 🏗 Project Structure

```
cellar-app/
├── public/
│   ├── icons/              # iOS app icons (all sizes)
│   ├── splash/             # iOS splash screens
│   └── manifest.json
├── src/
│   ├── components/         # Reusable UI (BottleCard, Scanner, etc.)
│   ├── screens/            # Top-level routes (Cellar, Scan, Stats, etc.)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Supabase client, UPC lookup, taxonomy
│   ├── styles/             # Global CSS, theme tokens
│   └── App.jsx
├── supabase/
│   ├── migrations/         # SQL schema + RLS policies
│   └── seed.sql            # Sample data
└── docs/                   # Screenshots, demo GIF
```

## 🔐 Privacy

- All bottle data is stored in **your** Supabase project — no third party sees it
- Row-level security ensures users only see their own data
- Camera access is local only; barcode images are never uploaded
- UPC lookups are anonymous (no user data sent to lookup APIs)

## 🗺 Roadmap

- [ ] OCR for label text (when barcode isn't available)
- [ ] Apple Wallet pass for rare bottles
- [ ] Cocktail builder using current inventory
- [ ] Friend sharing (read-only cellar view)
- [ ] Auction/secondary market price tracking
- [ ] Apple Health integration (weekly pour totals)
- [ ] Export to PDF (for insurance documentation)

## 🤝 Contributing

Contributions welcome — see [CONTRIBUTING.md](./CONTRIBUTING.md).

For major changes, please open an issue first to discuss.

## 📝 License

MIT — see [LICENSE](./LICENSE)

## 🙏 Acknowledgments

- [Open Food Facts](https://world.openfoodfacts.org) for the open product database
- [Supabase](https://supabase.com) for the backend that just works
- [Quagga.js](https://serratus.github.io/quaggaJS/) for barcode magic in the browser
- The bourbon community for teaching me what mash bills actually are

---

<div align="center">

**Built by a collector, for collectors.** 🥃

⭐ Star this repo if you find it useful

</div>