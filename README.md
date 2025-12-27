# Carlsson Spa Cashier

A modern, responsive management dashboard and Point-of-Sale (POS) interface for Carlsson Spa & Wellness Center. Built with Next.js 15, this application serves as the primary tool for staff and administration.

## Features

- **Dynamic Dashboard** - Real-time business metrics and sales visualizations.
- **PWA & Push Notifications** - Fully persistent Progressive Web App with desktop/mobile notifications for attendance and session updates.
- **Unified CRUD Pattern** - Type-safe data management using the enhanced `useModel` hook and Zod schemas.
- **Operation Management** - Real-time tracking of spa sessions, room occupancy, and treatment assignments.
- **HR & Attendance** - Manage employee schedules, attendance records, and performance (integrated with ZKTeco devices).
- **Financial Tracking** - Comprehensive view of income, expenses, and automated journal records.
- **Global Search & Master Data** - Centralized management of customers, employees, branches, and treatments.

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **State Management**: [TanStack Query v5](https://tanstack.com/query) (React Query)
- **Styling**: Tailwind CSS
- **Components**: [Shadcn UI](https://ui.shadcn.com/) / Radix UI
- **Notifications**: [Sonner](https://react-hot-toast.com/sonner) (Global rich toasts)
- **Form Management**: React Hook Form + Zod

## Getting Started

### Prerequisites

- Node.js 20+
- Running [SpaSystem-API](file:///Users/lbert/Herd/SpaSystem-API) backend

### Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure environment variables (copy `.env.local.example` to `.env.local`):

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_key
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Development Features

### `useModel` Hook

We use a standardized `useModel` hook for all API interactions. It provides:

- Automatic cache invalidation on mutations.
- Global error handling with toasts.
- Full CRUD support (`items`, `create`, `update`, `remove`).

Example:

```tsx
const { items, create } = useModel("treatment");
```

## System Integration

This dashboard is part of the **Carlsson Spa Information System**:

- **[SpaSystem-API](file:///Users/lbert/Herd/SpaSystem-API)**: The central business logic and data store.
- **[SpaBooking](file:///Users/lbert/Herd/SpaBooking)**: The customer-facing booking portal.

## License

This project is licensed under the MIT License.
