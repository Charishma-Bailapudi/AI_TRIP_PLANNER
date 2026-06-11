# Development Standards & Guidelines - AI Trip Planner

This document establishes the official development standards, naming conventions, architectural boundaries, testing guidelines, security controls, and Git workflows for the AI Trip Planner codebase.

---

## 1. Coding Standards

### 1.1. TypeScript & JavaScript Standards
*   **Strict Mode:** TypeScript `strict` mode must be enabled on both client and server configurations.
*   **No Implicit Any:** All variables, parameters, and return types must be explicitly typed. The use of `any` is prohibited. Use `unknown` if the type is dynamic, followed by explicit type guards.
*   **Explicit Returns:** All functions must declare their return types explicitly (e.g., `const fetchTrip = async (id: string): Promise<Trip> => { ... }`).
*   **Interfaces vs. Types:**
    *   Use `interface` for public APIs, database models, and components props (supports declaration merging).
    *   Use `type` for unions, intersections, and mapping aliases.

### 1.2. React Frontend Standards
*   **Functional Components Only:** Class components are forbidden. Use arrow functions typed with `React.FC<Props>`.
*   **Hooks-Only Side-Effects:** All side-effects (data fetching, local storage, map interactions) must be encapsulated in custom hooks.
*   **Destructuring Props:** Destructure props directly in the component argument list.
*   **State Colocation:** Keep React states as close as possible to their rendering targets. Do not elevate states to Context providers unless absolutely necessary for sibling component access.

### 1.3. Tailwind CSS Standards
*   **Utility Ordering:** Follow the standard visual layout order:
    1.  Layout / Positioning (flex, grid, block, absolute, relative, z-index)
    2.  Spacing / Sizing (margin, padding, width, height)
    3.  Typography (font, text-align, leading)
    4.  Visual / Background / Borders (bg-color, rounded, border, shadow)
    5.  Interactive / Animations / Hover states (transition, duration, hover:)
*   **Clean Markup:** Avoid long inline strings using helper functions (like `clsx` or `tailwind-merge`) when applying dynamic classes.

### 1.4. Node.js & Express Backend Standards
*   **Controller-Service-Repository Pattern:**
    *   *Controllers:* Read HTTP inputs, run request validation, call services, and return JSON responses. No database actions or calculations.
    *   *Services:* Run business logic, cost rollups, coordinate external searches. Zero Express middleware imports.
    *   *Repositories:* Isolated database collections interface queries (Mongoose).
*   **Async/Await Exclusively:** Avoid raw Promises (`.then().catch()`) or callbacks. Wrap async routes in custom catch-wrappers to automatically route exceptions to the global error middleware.

---

## 2. Naming Conventions

### 2.1. Code Elements
*   **Variables, Functions & Instances:** `camelCase` (e.g., `activeTripId`, `calculateTotalCost`).
*   **Classes, Interfaces, Types & Components:** `PascalCase` (e.g., `AuthRepository`, `TripCard`, `CreateTripDto`).
*   **Global Constants:** `UPPER_SNAKE_CASE` (e.g., `MAX_TRIP_DURATION_DAYS`, `GEMINI_RETRY_LIMIT`).
*   **Database Fields:** `camelCase` (e.g., `passwordHash`, `startDate`).

### 2.2. File & Folder Naming
*   **React Components:** `PascalCase` matching component name (e.g., `DayTimeline.tsx`, `MapViewport.tsx`).
*   **Services, Repositories, Controllers & Routers:** Feature prefix + suffix in `kebab-case` or dot-separated (e.g., `trip.controller.ts`, `auth.repository.ts`, `use-debounce.ts`).
*   **Folders:** `kebab-case` (e.g., `route-analysis`, `trip-planning`).

---

## 3. Folder Standards
We enforce a **Feature-Based** directory hierarchy. All components, hooks, services, and tests related to a specific domain (e.g. `auth`) must reside in that feature's directory.
*   **Colocation:** Test suites (`__tests__/`) and styles must live next to the target files they cover.
*   **Shared Path:** Shared models and validation schemas must reside in the `/shared` workspace path to prevent code duplication.

---

## 4. API Design Standards

*   **RESTful Routing:** Use plural nouns and lowercase routes separated by hyphens (e.g., `POST /api/v1/trips`, `DELETE /api/v1/trips/:tripId/segments/:segmentId`).
*   **JSON Payloads:** Request and response bodies must match JSON specifications.
*   **Unified Responses:** (As specified in `api-contracts.md`)
    *   *Success:* `{ success: true, message: "...", data: {} }`
    *   *Failure:* `{ success: false, message: "...", errors: [{ field: "...", message: "..." }] }`
*   **HTTP Status Codes:**
    *   `200 OK`: Successful retrieval or update.
    *   `201 Created`: Successful creation.
    *   `400 Bad Request`: Input validation failed.
    *   `401 Unauthorized`: Authentication token expired or missing.
    *   `403 Forbidden`: Credentials invalid or permissions failed.
    *   `404 Not Found`: Resource cannot be located.
    *   `429 Too Many Requests`: Rate limit triggered.
    *   `500 Internal Server Error`: Unexpected server-side failure.

---

## 5. Testing Standards

*   **Coverage Threshold:** Minimum code coverage for all new feature code must equal or exceed **80%**.
*   **Testing Technologies:**
    *   *Frontend:* Jest + React Testing Library (RTL) + Mock Service Worker (MSW) for API mocks.
    *   *Backend:* Jest + Supertest (for integration endpoint tests).
*   **Fakes & Mocks:** Mock external databases at the Repository layer for Unit testing of services. Mock third-party APIs (Amadeus, Mapbox, Gemini) using standard test doubles.

---

## 6. Security Standards

*   **Access Token Storage:** Access Tokens must be stored in memory on the client-side (do not save in LocalStorage to prevent XSS).
*   **Refresh Token Cookie:** Refresh tokens must reside in HTTP-Only, Secure, SameSite=Strict cookies.
*   **Secrets Casing:** System credentials must remain in `.env` config files, parsed and validated at boot using a Zod environment schema.
*   **HTTP Security Headers:** Apply **Helmet** middleware on Express to block script injection and clickjacking.
*   **CORS Policies:** Restrict origin requests strictly to the clients production domain.

---

## 7. Git Workflow & Commit Guidelines

We follow the **GitHub Flow** branching model.

### 7.1. Branch Naming Rules
*   `feat/short-feature-name`: New features.
*   `fix/bug-description`: Bug fixes.
*   `docs/documentation-topic`: Writing docs.
*   `refactor/module-refactored`: Code refactoring.

### 7.2. Commit Message Format (Conventional Commits)
Format commits as: `<type>(<scope>): <description>`
*   `feat(auth): add email registration verification validation`
*   `fix(maps): resolve route polyline redraw bug on day toggle`
*   `docs(api): update travel planner payload example`

---

## 8. Pull Request (PR) Guidelines

*   **Scope Limitation:** A PR should only focus on a single concern (e.g. do not mix bug fixes with new feature code).
*   **PR Title:** Must match Conventional Commit format.
*   **Description Template:**
    *   *Summary:* Explain the change and technical rationale.
    *   *Testing:* List unit tests added and coverage results.
    *   *UI Screenshots:* Provide side-by-side screenshots for client UI edits.

---

## 9. Code Review Checklist

Reviewers must verify that code commits satisfy the checklist below prior to merging to `main`:

*   [ ] **Compilation:** Does the code compile cleanly with zero TypeScript compiler errors or linter warnings?
*   [ ] **Tests:** Are there unit tests covering new logic pathways, and does test coverage exceed 80%?
*   [ ] **Clean Architecture:** Are domain entities free of framework imports? Are database calls isolated to repositories?
*   [ ] **Security:** Is user input validated and sanitized? Are passwords hashed using bcrypt? Are secret tokens locked in environment config files?
*   [ ] **Performance:** Are database queries indexed? Are external API timeouts managed with retry fallbacks?
*   [ ] **UI/UX:** Does the interface align with design tokens (Dark mode first, glassmorphism)? Is it mobile-responsive?
