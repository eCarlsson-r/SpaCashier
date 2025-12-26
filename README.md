# SpaCashier Frontend

A modern, responsive web application for spa and wellness center management. Built with Next.js 15, React, and Tailwind CSS, this frontend serves as the management dashboard and point-of-sale interface for the SpaSystem.

## Features

- **Dynamic Dashboard** - Real-time business metrics and sales charts
- **Operation Management** - Handle spa sessions, room occupancy, and treatment assignments
- **HR & Attendance** - Manage employee schedules, attendance records, and performance
- **Financial Tracking** - View income, expenses, and journal records
- **Master Data Management** - Manage customers, employees, branches, and treatments
- **Modern UI** - Premium design with dark mode support, glassmorphism, and responsive layouts

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: Radix UI / Shadcn UI
- **State Management**: React Hooks & Context API
- **Data Fetching**: Axios / SWR

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Running [SpaSystem-API](https://github.com/eCarlsson-r/SpaCashier-API) backend

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables (copy `.env.local.example` to `.env.local`)
4. Start the development server:
   ```bash
   npm run dev
   ```

### Connecting to the API

The frontend expects the backend API to be running at the URL specified in your `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Project Structure

```
spacashier/
├── src/
│   ├── app/             # Next.js App Router pages
│   ├── components/      # Reusable UI components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions and shared logic
│   └── types/           # TypeScript definitions
├── public/              # Static assets
└── ...
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
