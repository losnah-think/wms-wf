# WMS - Warehouse Management System

A modern, low-fidelity warehouse management system built with Next.js 14, TypeScript, and React.

## Overview

WMS is a comprehensive warehouse management solution designed to streamline inventory tracking, picking operations, returns processing, and shipping management. The application features a clean, grayscale interface focusing on functionality and usability.

## Features

- **Dashboard**: Real-time overview of warehouse operations
- **Inventory Management**: Track products, stock status, and warehouse locations
- **Picking & Packing**: Manage picking tasks and worker assignments
- **Returns Processing**: Handle return requests and track status
- **Shipping Management**: Track shipments and manage carriers
- **Reports & Analytics**: Generate current reports and analyze data
- **System Configuration**: Manage operational rules and settings

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI Library**: React 18
- **Styling**: CSS Modules
- **Font**: Comfortaa (Google Fonts)
- **Design System**: Low-fidelity grayscale UI
- **Deployment**: Vercel

## Project Structure

```
wms-nextjs/
├── app/                          # Next.js app directory
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Dashboard page
│   ├── globals.css              # Global styles
│   ├── products/                # Product management
│   ├── warehouse/               # Warehouse management
│   ├── stock-status/            # Stock status tracking
│   ├── stock-settings/          # Stock configuration
│   ├── inbound-outbound/        # Inbound/outbound operations
│   ├── advanced-inventory/      # Advanced inventory features
│   ├── return-picking/          # Return picking operations
│   ├── picking/                 # Picking management
│   ├── packing/                 # Packing operations
│   ├── workers/                 # Worker management
│   ├── returns/                 # Returns processing
│   │   ├── request/            # Return requests
│   │   ├── process/            # Process returns
│   │   └── status/             # Return status
│   ├── shipping/                # Shipping management
│   │   └── settings/           # Shipping settings
│   ├── reports/                 # Reports and analytics
│   │   ├── current/            # Current reports
│   │   └── analysis/           # Data analysis
│   └── system/                  # System configuration
│       └── rules/              # Operation rules
├── components/                   # Reusable components
│   ├── UI.tsx                   # UI component library
│   ├── UI.module.css            # UI component styles
│   ├── Layout.tsx               # Main layout component
│   ├── Layout.module.css        # Layout styles
│   ├── Header.tsx               # Header component
│   ├── Header.module.css        # Header styles
│   ├── Sidebar.tsx              # Sidebar navigation
│   └── Sidebar.module.css       # Sidebar styles
├── lib/                         # Utility functions
│   └── navigation.ts            # Navigation configuration
├── public/                      # Static assets
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript configuration
├── next.config.js               # Next.js configuration
└── README.md                    # Project documentation
```

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd wms-nextjs
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## UI Components

The application includes a comprehensive set of reusable UI components:

- **Card**: Basic card container with optional title
- **StatCard**: Statistical display card with label, value, and subtitle
- **Badge**: Status badges with type variants (default, success, warning, danger)
- **Button**: Buttons with variants (primary, secondary) and sizes (sm, md, lg)
- **Table**: Data tables with custom column rendering
- **Section**: Section wrapper with title and action buttons
- **Grid**: Responsive grid layout (1-4 columns)
- **Input**: Form input fields with labels and error states
- **Select**: Dropdown select with options
- **SearchBar**: Search input with submit functionality

## Design System

### Color Palette (Grayscale)

- White: `#ffffff`
- Black: `#333333`
- Gray Dark: `#666666`
- Gray Medium: `#999999`
- Gray Light: `#cccccc`
- Gray Lighter: `#e8e8e8`
- Background: `#f5f5f5`

### Typography

- **Font Family**: Comfortaa (Google Fonts)
- **Headings**: 600-700 weight
- **Body**: 400-500 weight

### Layout

- **Sidebar Width**: 220px
- **Header Height**: 60px
- **Max Content Width**: 1400px
- **Responsive Breakpoint**: 768px

## Deployment

### Deploy to Vercel

The easiest way to deploy this application is using Vercel:

1. Push your code to GitHub
2. Import the repository in Vercel
3. Vercel will auto-detect Next.js and configure the build settings
4. Click "Deploy"

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=<your-repo-url>)

### Manual Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm run start
```

The application will be available at `http://localhost:3000`.

## Navigation Structure

The application includes 8 main sections with 21 total pages:

1. **Dashboard** (1 page)
2. **Inventory** (7 pages)
3. **Picking** (3 pages)
4. **Returns** (3 pages)
5. **Shipping** (2 pages)
6. **Reports** (2 pages)
7. **System** (1 page)

See `lib/navigation.ts` for the complete navigation structure.

## Documentation

### Wireframes

- **[Inbound Management Wireframe](./WIREFRAME_INBOUND_MANAGEMENT.md)** - Low-fidelity ASCII wireframe showing:
  - Approval List tab (inbound request management)
  - Zone Move tab (warehouse zone allocation)
  - Invoice History tab (invoice generation and OMS sync)
  - 5-step status timeline workflow
  - Complete API endpoint documentation
  - End-to-end user interaction scenarios
  - Error handling cases

### Design Documentation

- **[Error Handling Guide](./ERROR_HANDLING_GUIDE.md)** - Comprehensive error management strategy
- **[Error Pages Documentation](./ERROR_HANDLING.md)** - Error page components and WMS error codes

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the GitHub repository.

---

Built with ❤️ using Next.js and TypeScript
