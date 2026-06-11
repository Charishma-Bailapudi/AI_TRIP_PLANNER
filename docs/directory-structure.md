# Project Directory Structure - AI Trip Planner

This document defines the production-grade folder structure for the AI Trip Planner application. It implements a **Feature-Based Clean Architecture** to isolate business logic, decouple external dependencies, and optimize development in the monorepo.

---

## 1. Global Project Layout

The repository is organized into three main directories: `client` (React frontend), `server` (Node/Express backend), and `shared` (shared schemas and interfaces).

```
AI-TRIP-PLANNER/
├── client/                 # React.js Frontend Application
├── server/                 # Node.js/Express.js Backend Application
├── shared/                 # Shared Types, DTOs & Validation Schemas
├── docs/                   # Architectural & System Specifications
├── epics/                  # Project Epics
├── skills/                 # AI Agent Skills Definitions
├── tasks/                  # Implementation Task lists
└── stories/                # User Stories
```

---

## 2. Shared Workspace Structure (`/shared`)

Houses schemas, models, and type definitions shared across the HTTP layer. This prevents duplicate validation code and ensures client-server contract synchronization.

```
shared/
├── src/
│   ├── dto/                # Data Transfer Objects (Request/Response schemas)
│   │   ├── auth.dto.ts     # Login/Register payload validation types
│   │   ├── trip.dto.ts     # Trip creation, segments update payload types
│   │   └── sync.dto.ts     # Offline queue synchronization payloads
│   ├── types/              # Static TypeScript interfaces
│   │   ├── index.ts        # Global exports
│   │   ├── user.ts         # User properties interfaces
│   │   ├── trip.ts         # Trip, Segment, and Itinerary models
│   │   └── transit.ts      # Flight, Train, and Local Transit shapes
│   └── validation/         # Zod schemas for input validation
│       ├── auth.schema.ts  # Zod validation rule bindings for registration
│       └── trip.schema.ts  # Zod validation rules for trip parameters
└── package.json
```

---

## 3. Frontend Architecture (`/client`)

The frontend React application follows a strict modular structure. Reusable atomic UI components are isolated, while business features reside in domain-specific folders containing their own components, state management, and tests.

```
client/
├── public/                 # Static assets (favicons, manifest.json)
├── src/
│   ├── assets/             # Brand logos, fonts, global images
│   ├── components/         # Reusable Global UI Elements
│   │   ├── ui/             # Core UI elements (Button, Input, Card, Modal)
│   │   ├── layout/         # Layout modules (Header, Sidebar, Footer)
│   │   └── feedback/       # UX loading states (Skeleton, Spinner, ErrorBoundary)
│   ├── context/            # React Context Providers for global state
│   │   ├── AuthContext.tsx # User active session state
│   │   └── ThemeContext.tsx# Dark/Light mode theme state
│   ├── features/           # Feature Modules (Domain Encapsulated)
│   │   ├── auth/           # Login, Register, Profile Management
│   │   │   ├── components/ # LoginForm.tsx, SignupCard.tsx
│   │   │   ├── hooks/      # useAuthMutation.ts
│   │   │   ├── services/   # authService.ts (API wrappers)
│   │   │   └── __tests__/  # LoginForm.test.tsx
│   │   ├── trip-planning/  # Trip Wizard, Multi-Destination onboarding
│   │   │   ├── components/ # DestinationInputs.tsx, WizardForm.tsx
│   │   │   ├── hooks/      # useCreateTrip.ts
│   │   │   └── services/   # tripService.ts
│   │   ├── route-analysis/ # Segment transit comparisons, flight/rail grids
│   │   │   ├── components/ # RouteGrid.tsx, SegmentTabs.tsx, TransitCard.tsx
│   │   │   ├── hooks/      # useRouteSearch.ts
│   │   │   └── services/   # routeService.ts
│   │   ├── itinerary/      # Timeline rendering, Custom edits
│   │   │   ├── components/ # TimelineCard.tsx, DaySelector.tsx, ActionMenu.tsx
│   │   │   ├── hooks/      # useItineraryEditor.ts
│   │   │   └── services/   # itineraryService.ts
│   │   └── maps/           # Mapbox integrations
│   │       ├── components/ # MapViewport.tsx, MarkerPin.tsx
│   │       ├── hooks/      # useMapDirections.ts
│   │       └── services/   # mapboxClient.ts
│   ├── hooks/              # Global React hooks
│   │   ├── useDebounce.ts  # Input autocomplete throttling
│   │   └── useLocalStorage.ts# Local persistence hook
│   ├── routes/             # App routing configs
│   │   ├── AppRoutes.tsx   # React Router routing tables
│   │   └── ProtectedRoute.tsx# Auth guards
│   ├── services/           # Global Axios API clients
│   │   └── apiClient.ts    # Fetch wrapper with interceptors for JWT
│   ├── styles/             # Stylesheets
│   │   └── index.css       # Tailwind CSS base imports
│   ├── App.tsx             # Root React node
│   ├── main.tsx            # DOM mounting target
│   └── vite-env.d.ts       # Type bindings for env variables
├── package.json
├── tailwind.config.js      # Styling design token configurations
├── tsconfig.json           # Compiler rules
└── vite.config.ts          # Bundler rules
```

---

## 4. Backend Architecture (`/server`)

The backend Node/Express application enforces **Clean Architecture** layers. The Presentation layer (Controllers, Routers) delegates to the Application layer (Services), which fetches data through the Infrastructure layer (Repositories, External API integrations).

```
server/
├── src/
│   ├── core/               # Global Configuration & Middlewares
│   │   ├── config/         # System configurations
│   │   │   ├── db.ts       # MongoDB Mongoose connection handler
│   │   │   └── env.ts      # Zod validation schema for process.env
│   │   ├── middleware/     # Express HTTP interceptors
│   │   │   ├── auth.ts     # JWT Authorization checks
│   │   │   ├── error.ts    # Centered Exception Handling middleware
│   │   │   ├── limit.ts    # Rate-limiter settings
│   │   │   └── validate.ts # Request body parser validations
│   │   └── utils/          # System utilities
│   │       ├── logger.ts   # Winston logging interface
│   │       └── errors.ts   # Custom error boundary subclasses (AppError)
│   ├── features/           # Feature Modules (Domain Encapsulated)
│   │   ├── auth/           # Authentication domain
│   │   │   ├── auth.controller.ts  # HTTP input parsing & output mapping
│   │   │   ├── auth.service.ts     # Encryption & JWT generation logic
│   │   │   ├── auth.repository.ts  # User Collection Mongoose queries
│   │   │   ├── auth.model.ts       # Mongoose User Schema
│   │   │   ├── auth.routes.ts      # Express routes for login/register
│   │   │   └── __tests__/          # auth.service.test.ts
│   │   ├── trip/           # Trip domain
│   │   │   ├── trip.controller.ts
│   │   │   ├── trip.service.ts
│   │   │   ├── trip.repository.ts  # Mongoose repository for Trip collection
│   │   │   ├── trip.model.ts       # Mongoose Trip Schema
│   │   │   ├── trip.routes.ts
│   │   │   └── __tests__/
│   │   ├── segment/        # Trip Segments domain
│   │   │   ├── segment.controller.ts
│   │   │   ├── segment.service.ts
│   │   │   ├── segment.repository.ts
│   │   │   ├── segment.model.ts    # Mongoose Segment Schema
│   │   │   └── segment.routes.ts
│   │   └── ai-orchestrator/# Multi-Agent AI system
│   │       ├── agents/             # Agent definitions
│   │       │   ├── orchestrator.agent.ts
│   │       │   ├── segment.agent.ts
│   │       │   ├── transit.agent.ts
│   │       │   ├── connectivity.agent.ts
│   │       │   ├── budget.agent.ts
│   │       │   └── itinerary.agent.ts
│   │       ├── orchestrator.service.ts# Agent orchestration logic
│   │       ├── ai.controller.ts    # AI endpoint handler
│   │       ├── ai.routes.ts        # AI routing mappings
│   │       └── __tests__/
│   ├── integrations/       # External SDK / Third-party API Clients
│   │   ├── flight/         # Amadeus/Skyscanner API wrappers
│   │   │   └── flight.client.ts
│   │   ├── train/          # Rome2Rio API wrappers
│   │   │   └── train.client.ts
│   │   ├── map/            # Mapbox API wrappers
│   │   │   └── mapbox.client.ts
│   │   └── gemini/         # Google Gemini LLM API client bindings
│   │       └── gemini.client.ts
│   ├── app.ts              # Express App setup & middleware binding
│   └── server.ts           # HTTP server startup port listener
├── .env.example            # Environment variables placeholder
├── package.json
└── tsconfig.json           # Compiler rules
```
