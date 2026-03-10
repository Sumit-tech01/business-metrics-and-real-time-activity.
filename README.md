# ERP Dashboard Application (React + Vite)

A modular, production-ready ERP SaaS dashboard built with:

- React + Vite
- TailwindCSS
- React Router
- Firebase Authentication + Firestore
- Recharts
- Zustand

## Features

- SaaS-style shell with collapsible sidebar, top header, search, notifications, profile menu
- Responsive dashboard with KPI cards and analytics charts
- Finance module: add income/expense, history, profit analytics
- CRM module: add/edit/delete customers, notes system, history timeline
- Inventory module: products, stock updates, low stock alerts
- Appointments module: create/edit/delete + date agenda + dashboard upcoming widget
- Authentication: login, register, logout, protected routes
- Dark/light mode
- Clean architecture with reusable components, custom hooks, and service layer

## Folder Structure

```txt
src/
  app/
  components/
    charts/
    common/
    forms/
    widgets/
  firebase/
  hooks/
  layout/
  pages/
    auth/
  router/
  services/
  store/
  styles/
  utils/
```

## Firestore Collections

The app is designed around these collections:

- `users`
- `transactions`
- `customers`
- `inventory`
- `appointments`

## Setup

1. Create project:

```bash
npm create vite@latest erp-dashboard -- --template react
```

2. Install dependencies:

```bash
npm install
```

3. Copy Firebase env values:

```bash
cp .env.example .env
```

4. Start development server:

```bash
npm run dev
```

## Firebase Notes

- If Firebase env vars are present, app uses Firebase Auth + Firestore.
- If env vars are missing, app runs in local fallback mode so the UI is still fully functional.
# business-metrics-and-real-time-activity.
