# Skinova — Bespoke Dermatological Diagnostic Suite

Skinova is a premium, full-stack, AI-informed clinical dermatology and personalized formulation advisor. Built with React and an Express.js server, it maps skin diagnostics, evaluates barrier integrity, designs targeted morning/night routines, and synthesizes dynamic compound skincare recommendations.

---

## ✦ Key Features

- **Clinical Diagnostics Overview**: Visually stunning dashboard mapping parameters like hydration, elasticity, lipid barrier, UV damage, and melanin indices.
- **Guest Session Auto-Reset**: A privacy-first design instantly purging Guest Explorer diagnostic histories upon any browser reload (`/api/auth/guest/reset`).
- **Trial-Limited Explorer**: Guest accounts are strictly protected and limited to **5 trial scans** to encourage registration or premium upgrades.
- **Micro-Formulation Engine**: Synthesizes custom skincare compound formulas (e.g., *Formula S-04* or *Formula S-08*) calibrated by real-time score parameters.
- **Elegant Themes & Animations**: Fluid transition layers powered by `motion` and custom glassmorphic styling adaptive to dark/light modes.

---

## 🚀 Can I Deploy to GitHub Pages?

**No, not directly under standard static configuration.** 

Since **Skinova is a full-stack, dynamic Node.js/Express application** with active server APIs (handling authentication, session storage, and database state through `database.json` / `server.ts`), static-only environments like GitHub Pages cannot execute the required server.

### Recommended Production Deployment
To host this full-stack application in production, use a containerized or Node-capable PaaS:
- **Google Cloud Run** *(Highly Recommended)*
- **Render** (as a Web Service)
- **Heroku** or **Fly.io**

---

## 🛠️ How to Deploy & Push to GitHub

Here is the step-by-step guide to push this application to your GitHub repository and build it locally.

### 1. Initialize Git & Push to GitHub
Open your terminal in the application root directory and run:

```bash
# Initialize git repository
git init

# Add all files to staging, excluding ignored files (node_modules, dist, etc.)
git add .

# Create your initial commit
git commit -m "feat: skinova clinical diagnostics and automated guest reset"

# Create a new, empty repository on GitHub first, then link it:
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git

# Push your code to GitHub
git push -u origin main
```

### 2. Run Locally
Ensure you have **Node.js (v18+)** installed.

```bash
# 1. Install dependencies
npm install

# 2. Start the development server (runs with hot reload tools)
npm run dev
```
The application will boot on **`http://localhost:3000`** (Express server orchestration proxies development frontend assets beautifully).

### 3. Build & Production Start
To compile and execute production-ready minimized builds:

```bash
# Compile client bundles and transpile backend into dist/server.cjs
npm run build

# Launch the production-ready compiled bundle
npm start
```

---

## ⚙️ Project Architecture

- **Frontend**: React 18 / Vite with Tailwind CSS styling and `motion` layout micro-animations.
- **Backend Orchestration**: Express.js server managing REST APIs (`/api/auth/*`, `/api/scans/*`).
- **Data Layer**: JSON-based physical state engine (`database.json`) mapping accounts and histories.
- **Security Protocols**: Salted password hashing via Bcrypt for regular accounts, with isolated trial-checking middleware.
