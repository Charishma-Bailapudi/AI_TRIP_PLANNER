# Sprint Plan (Sprints 1-5) - AI Trip Planner

This document establishes a 5-sprint implementation schedule (10 weeks total development timeline) for a team size of **1 Developer** with **2-week sprint cycles**. The plan is prioritized to deliver a Minimum Viable Product (MVP) by Sprint 5.

---

## Sprint 1: Project Setup & Authentication (Weeks 1-2)

*   **Goal:** Establish monorepo workspace configurations, database schemas, and a secure user login/signup authentication boundary.
*   **Stories:**
    *   `AUTH-001`: Register user profile.
    *   `AUTH-002`: Login with email and password.
    *   `AUTH-003`: JWT token authentication.
    *   `AUTH-006`: Session logout.
*   **Tasks:**
    *   `TSK-MON-01`: Setup logging middleware and global Express error boundary handlers.
    *   `TSK-AUTH-01`: Configure MongoDB Atlas connection pool and User schema.
    *   `TSK-AUTH-02`: Implement `/api/auth/register` with bcrypt hashing and validation.
    *   `TSK-AUTH-03`: Implement `/api/auth/login` and HTTP-only cookie refresh token rotation.
    *   `TSK-AUTH-04`: Create React auth pages (Login/Register) and `AuthContext` state.
*   **Deliverables:**
    *   Working monorepo skeleton (Express server and Vite/React client).
    *   Working User authentication endpoints and login forms.
    *   Secured routing components in React (`ProtectedRoute.tsx`).
*   **Success Criteria:**
    *   Developers can register a user, login to acquire an access token, persist session details on reload, and logout successfully.

---

## Sprint 2: Trip Management & Transit Search (Weeks 3-4)

*   **Goal:** Implement multi-destination onboarding forms, segment splitting, and flight/train search integrations.
*   **Stories:**
    *   `TRIP-001`: Create new trip (origin, dates, budget tier).
    *   `TRIP-003`: View trip timeline details.
    *   `TRIP-004`: Input multi-destination list.
    *   `ROUTE-001`: Search flight options between segment pairs.
    *   `ROUTE-003`: Search train options between segment pairs.
*   **Tasks:**
    *   `TSK-TRIP-01`: Create Mongoose schemas for Trips and TripSegments collections.
    *   `TSK-TRIP-02`: Create POST `/api/trips` and GET `/api/trips/:tripId` endpoints.
    *   `TSK-TRIP-03`: Implement React Create-Trip multi-destination wizard form.
    *   `TSK-ROUTE-01`: Integrate Skyscanner/Amadeus API flight search clients.
    *   `TSK-ROUTE-02`: Integrate Rome2Rio railway search wrappers.
    *   `TSK-ROUTE-03`: Create the Route Analysis UI view displaying transit options.
*   **Deliverables:**
    *   Mongoose schemas and CRUD controllers for Trip data.
    *   Linear onboarding wizard in React client.
    *   Route Analysis Screen comparing flight and train availability.
*   **Success Criteria:**
    *   Submitting a multi-city route (e.g. Anakapalle → Shirdi → Tirupati) successfully saves segments to the DB and retrieves flight/train estimates.

---

## Sprint 3: Last-Mile Connectivity & AI Itinerary Generation (Weeks 5-6)

*   **Goal:** Resolve last-mile transport for remote destinations and compile day-by-day travel schedules using the Gemini LLM.
*   **Stories:**
    *   `CONN-001`: Resolve nearest airport for remote destinations.
    *   `CONN-002`: Resolve nearest train station.
    *   `CONN-004`: Estimate taxi fares from transit hubs.
    *   `ITIN-001`: Trigger day-by-day sightseeing planning.
    *   `ITIN-002`: Output structured attraction descriptions.
    *   `ITIN-005`: Formulate daily chronological schedules.
*   **Tasks:**
    *   `TSK-CONN-01`: Write the Nearest Hub lookup algorithm (detecting closest airport/station within a radius).
    *   `TSK-CONN-02`: Write local ground transport transfer rules (taxis, shuttles, local buses).
    *   `TSK-ITIN-01`: Integrate Gemini API using strict JSON schema outputs.
    *   `TSK-ITIN-02`: Create the timeline list UI container in the Dashboard view.
*   **Deliverables:**
    *   Connectivity fallback logic inside segment APIs.
    *   AI prompt builders generating structured daily attraction nodes.
    *   Scrollable timeline list pane rendering daily activities.
*   **Success Criteria:**
    *   Planning a trip to a city without an airport successfully appends last-mile transit cards and renders a complete multi-day schedule.

---

## Sprint 4: Budget Rollups & Interactive Maps (Weeks 7-8)

*   **Goal:** Integrate Mapbox GL JS to plot routes, build the cost estimation widget, and allow schedule customization.
*   **Stories:**
    *   `BUDG-001`: Aggregate total flight and train transit costs.
    *   `BUDG-002`: Aggregate daily activity cost estimates.
    *   `MAPS-001`: Plot segment travel lines on vector map.
    *   `MAPS-002`: Display custom marker pins for daily activities.
    *   `CUST-001`: Add new custom activity card to timeline.
    *   `CUST-002`: Delete activity card from timeline.
*   **Tasks:**
    *   `TSK-BUDG-01`: Implement server budget calculations and update notifications.
    *   `TSK-MAPS-01`: Setup MapboxGL canvas and draw segment/activity polylines.
    *   `TSK-MAPS-02`: Implement coordinate pin fly-to transitions on timeline hover.
    *   `TSK-MAPS-03`: Create timeline custom additions/deletions action UI.
*   **Deliverables:**
    *   Dynamic cost-tracking widgets updating on changes.
    *   Synchronized split-screen React Dashboard view (Timeline + Mapbox).
    *   Interactive marker popups on maps.
*   **Success Criteria:**
    *   Map renders route lines matching the timeline order, and removing an activity re-draws map directions and updates budget summaries.

---

## Sprint 5: Exporting, Sharing & Production Deploy (Weeks 9-10)

*   **Goal:** Implement read-only sharing links, PDF download compile tools, and deploy the application to cloud servers.
*   **Stories:**
    *   `EXPT-001`: Generate unique shareable read-only URLs.
    *   `EXPT-002`: Export itinerary details as basic PDF prints.
    *   `ADMN-001`: Visual user metrics and active sessions dashboard.
    *   `ADMN-002`: Track API limits and count usage cycles.
*   **Tasks:**
    *   `TSK-EXPT-01`: Create tokenized shared trip database schema and endpoints.
    *   `TSK-EXPT-02`: Configure print CSS sheets and Puppeteer/PDFKit compile setups.
    *   `TSK-MON-02`: Implement system telemetry tracking Amadeus/Mapbox limits.
    *   `TSK-MON-03`: Deploy Frontend build to Vercel/Render, and Express server to AWS/Render.
*   **Deliverables:**
    *   Public sharing url generator and Shared Itinerary dashboard view.
    *   Styled PDF export file compiler.
    *   Live URL running production databases and clients.
*   **Success Criteria:**
    *   The app is running publicly on a cloud URL. Guest users can access shared itineraries, download styled PDF documents, and verify performance in under 2 seconds.
