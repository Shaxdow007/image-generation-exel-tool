# Image Generation Excel Tool

A modern invoicing dashboard built with React, TypeScript, and Tailwind CSS. The application streamlines the creation, preview, and export of professional invoices while keeping a full audit trail of edits.

## Features

- **Interactive invoice editor** with client, company, and line-item management driven by persistent local storage. Users can tweak values and immediately see recalculated totals and status updates.
- **Rich document preview** rendered side-by-side with the form, including print-friendly layouts and a dedicated print view for high-quality paper exports.
- **History tracking** that records every change made to an invoice, making it easy to review previous versions or audit updates.
- **Export and import center** supporting CSV and JSON workflows, date filtering, and validation helpers to avoid corrupt data. Backup utilities allow exporting the full dataset for safekeeping.
- **Theme switching** between light and dark modes to suit different work environments.

## Tech Stack

- [React](https://react.dev/) with TypeScript for predictable, component-driven UIs
- [Vite](https://vitejs.dev/) for fast development server and optimized builds
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- [Lucide React](https://lucide.dev/) for icons

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Start the development server**
   ```bash
   npm run dev
   ```
   The application runs on the Vite dev server. Visit the URL shown in the terminal to access the dashboard.
3. **Run quality checks**
   ```bash
   npm run lint
   npm run typecheck
   ```
4. **Create a production build**
   ```bash
   npm run build
   ```

## Project Structure

```
├── public/                # Static assets (including the application logo)
├── src/
│   ├── components/        # Feature-specific UI components
│   ├── hooks/             # Custom React hooks for local storage, history, and export logic
│   ├── types/             # Shared TypeScript definitions
│   ├── App.tsx            # Main application layout and state orchestration
│   └── main.tsx           # Application entry point
├── index.html             # Base HTML template served by Vite
├── package.json           # Scripts and dependencies
└── README.md              # Project documentation (this file)
```

## Contributing

1. Fork the repository and create a new feature branch.
2. Make your changes and ensure all tests and linters pass.
3. Submit a pull request with a detailed description of your updates.
