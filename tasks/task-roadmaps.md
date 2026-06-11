# Task Roadmaps and Matrices - AI Trip Planner

This document compiles the implementation maps, dependency trees, execution order, and release phase groupings for all development tasks.

---

## 1. Task Dependency Matrix

The table below defines dependencies between major code tasks. Implementation of target modules requires the completion of their dependent task IDs.

| Task ID | Task Description | Dependent On Task IDs | Reason |
| :--- | :--- | :--- | :--- |
| **TSK-AUTH-01** | User Schema & DB Setup | None | Database foundations. |
| **TSK-AUTH-02** | Registration & Hashing API | TSK-AUTH-01 | Requires active DB connection and user schema. |
| **TSK-AUTH-03** | Login & JWT Token issuance | TSK-AUTH-02 | Verifies credentials against registered records. |
| **TSK-TRIP-01** | Trip & Segment Schema Setup | TSK-AUTH-01 | Requires references to user object IDs. |
| **TSK-TRIP-02** | Create Trip Endpoint | TSK-TRIP-01, TSK-AUTH-03 | Requires auth headers and schema parameters. |
| **TSK-ROUTE-01** | Flight Search Integration | TSK-TRIP-02 | Search arguments require trip segment parameters. |
| **TSK-ROUTE-02** | Train Search Integration | TSK-TRIP-02 | Search arguments require trip segment parameters. |
| **TSK-ROUTE-03** | Multi-Modal Route Optimizer | TSK-ROUTE-01, TSK-ROUTE-02 | Compares flights and trains to pick optimal paths. |
| **TSK-CONN-01** | Nearest Hub & Last-Mile Analyzer | TSK-ROUTE-03 | Triggers if direct airport/station lookup fails. |
| **TSK-ITIN-01** | AI Itinerary Generator (Gemini) | TSK-CONN-01, TSK-TRIP-02 | Generation parameters require location/dates data. |
| **TSK-BUDG-01** | Budget Estimation Calculator | TSK-ROUTE-03, TSK-ITIN-01 | Computes transit costs + activity fee estimations. |
| **TSK-MAPS-01** | Mapbox Layer Integration | TSK-ITIN-01 | Map requires itinerary coordinate points. |
| **TSK-EXPT-01** | Sharing Token Generation API | TSK-TRIP-02 | Sharing targets active trip profiles. |
| **TSK-EXPT-02** | PDF Generation Engine | TSK-ITIN-01 | Requires fully compiled itinerary items. |
| **TSK-OFFL-01** | IndexedDB Offline State Cache | TSK-TRIP-02, TSK-ITIN-01 | Caches verified trip data in browser. |
| **TSK-AGNT-01** | AI Orchestrator Middleware | TSK-ROUTE-03, TSK-CONN-01, TSK-ITIN-01 | Controls and routes agent requests. |
| **TSK-MON-01** | Central Logger & Monitoring | None | Diagnostic logger has zero dependencies. |

---

## 2. Task Execution Order (Gantt Sequence)

Implement modules in the following order to maximize build velocity and prevent integration bottlenecks:

```
[Phase 1: Foundations]
  TSK-MON-01 (Logging) --> TSK-AUTH-01 (DB Setup) --> TSK-AUTH-02/03 (Auth APIs)

[Phase 2: Core Data]
  TSK-TRIP-01 (Trip Schema) --> TSK-TRIP-02 (Create Trip) --> TSK-TRIP-03 (Segments)

[Phase 3: Transit & Optimization]
  TSK-ROUTE-01/02 (Flight/Train Search) --> TSK-ROUTE-03 (Optimizer) --> TSK-CONN-01 (Last Mile)

[Phase 4: Schedule & Presentation]
  TSK-ITIN-01 (AI Generator) --> TSK-BUDG-01 (Budget Calculator) --> TSK-MAPS-01 (Maps)

[Phase 5: Exports & Offline]
  TSK-EXPT-01/02 (Sharing & PDF) --> TSK-OFFL-01 (IndexedDB Caching) --> TSK-OFFL-02 (Sync Queue)

[Phase 6: Multi-Agent System]
  TSK-AGNT-01 (Orchestration Engine) --> TSK-AGNT-02 (Subagent definitions)
```

---

## 3. MVP Tasks (Release Phase 1)

These tasks construct the basic structural pipeline of the application.

*   **Authentication & Database:**
    *   `TSK-AUTH-01`: Setup MongoDB connection and write User/Auth schemas.
    *   `TSK-AUTH-02`: Write `/api/auth/register` (hashing, sanitization).
    *   `TSK-AUTH-03`: Write `/api/auth/login` (JWT token signatures, headers).
*   **Trip Management:**
    *   `TSK-TRIP-01`: Write Trip and TripSegment schemas.
    *   `TSK-TRIP-02`: Write POST `/api/trips` and GET `/api/trips/:tripId` endpoints.
*   **Transit Searches:**
    *   `TSK-ROUTE-01`: Integrate external Flight API search clients.
    *   `TSK-ROUTE-02`: Integrate external Railway API search clients.
*   **Last-Mile Analysis:**
    *   `TSK-CONN-01`: Write nearest airport/station discovery logic.
    *   `TSK-CONN-02`: Write taxi estimation module for transfer legs.
*   **Schedule Generation:**
    *   `TSK-ITIN-01`: Write Gemini prompt templates and JSON structured generation code.
*   **Aesthetics & Visuals:**
    *   `TSK-MAPS-01`: Set up Mapbox GL JS map canvas, render markers and route lines.
    *   `TSK-BUDG-01`: Write the budget rollup logic and floating card UI.
*   **Utility & Actions:**
    *   `TSK-EXPT-01`: Write the tokenized public trip sharing endpoint.

---

## 4. Future Tasks (Phase 2 & Phase 3)

These tasks introduce offline sync queues, agent orchestration, telemetry monitoring, and performance optimizations.

*   **Offline Access & Reconnect Sync:**
    *   `TSK-OFFL-01`: Set up IndexedDB schemas for offline trips.
    *   `TSK-OFFL-02`: Write client-side modification queue and the `/api/sync` handler.
    *   `TSK-OFFL-03`: Cache static maps and compiled PDFs locally for access without network.
*   **Multi-Agent Orchestration Engine:**
    *   `TSK-AGNT-01`: Implement the AI orchestrator agent routing logic.
    *   `TSK-AGNT-02`: Configure the 7 specialized subagent prompt schemas.
    *   `TSK-AGNT-03`: Implement confidence validation logic on agent output JSONs.
*   **Operations & Health Telemetry:**
    *   `TSK-MON-01`: Write the global Express error boundary middleware.
    *   `TSK-MON-02`: Integrate logging systems to count API call metrics.
    *   `TSK-MON-03`: Implement circuit breaker patterns on Amadeus/Skyscanner API queries.
    *   `TSK-MON-04`: Write cost-monitoring dashboard for Gemini API usage logs.
