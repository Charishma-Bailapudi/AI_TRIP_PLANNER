# Epics 11 & 12: AI Agent Orchestration, Monitoring & Logging - Detailed Tasks

This document details the step-by-step implementation tasks required to deliver the user stories in Epic 11: AI Agent Orchestration and Epic 12: Administration & Monitoring.

---

## TSK-AGNT-01: AI Orchestrator Agent & Parallel Subagent Execution Engine
*   **Epic:** Epic 11: AI Agent Orchestration
*   **Related User Story:** AGNT-001, AGNT-009, AGNT-010
*   **Priority:** High
*   **Purpose:** Build the central AI Orchestrator service class that manages trip generation pipelines, executes specialized subagents in parallel, monitors timeouts, and aggregates responses.
*   **Inputs:**
    *   Trip inputs (destinations list, origins, dates, budget tier, travel styles)
*   **Process Steps:**
    1.  Create an `AIOrchestrator` service module managing the planning state machine.
    2.  Write asynchronous coordination logic using Promise arrays to invoke subagents (Segment Builder, Flight, Train, Connectivity, Budget, Itinerary, Explanation) in parallel where appropriate.
    3.  Implement a strict 10-second timeout wrapper around each subagent thread.
    4.  Implement a schema validator and confidence score parser checking each subagent's output.
    5.  Build fallback routing: If a subagent times out or returns a `confidenceScore` below 0.6, query `CachedRoutes` or default templates, inject warning messages into the final response, and log to telemetry.
    6.  Aggregate outputs into a single JSON object matching the `TripItinerary` schema.
*   **Outputs:**
    *   `AIOrchestrator` class and helper methods
    *   `/api/v1/analyze-trip` POST endpoint
*   **Validation Rules:**
    *   Total API runtime must not exceed 15 seconds.
    *   Every subagent must return a `confidenceScore` (0.0 to 1.0) and match predefined output structures.
*   **Dependencies:** None
*   **Acceptance Criteria:**
    *   Submitting a trip query coordinates subagents concurrently.
    *   Hanging API calls trigger caching fallback paths and continue compiling the response.
    *   Low confidence scores are rejected in favor of cached/fallback details.
*   **Estimated Complexity:** Large
*   **Estimated Effort:** 5 Days

---

## TSK-AGNT-02: Route Analysis Subagents (Segment Builder, Flight, Train, Connectivity)
*   **Epic:** Epic 11: AI Agent Orchestration
*   **Related User Story:** AGNT-002, AGNT-003, AGNT-004, AGNT-005
*   **Priority:** High
*   **Purpose:** Implement the subagents responsible for dividing multi-destination itineraries, searching flight and train records, and estimating last-mile transfers.
*   **Inputs:**
    *   Locations list
    *   Segment travel dates
*   **Process Steps:**
    1.  Build the **Segment Builder Agent**: Divide user destination lists into chronological, non-overlapping segment blocks.
    2.  Build the **Flight Search Agent**: Geocode cities, find nearest IATA airport codes, query Amadeus/Skyscanner flight listings, and implement 3x exponential backoffs.
    3.  Build the **Train Search Agent**: Query Rome2Rio or railway APIs for train schedules, caching results in `CachedRoutes` with a 24-hour TTL.
    4.  Build the **Connectivity Agent**: If a destination lacks an airport or station, search for hubs within 150km (airports) or 100km (stations) and estimate transfer times and fares using the Mapbox Matrix API.
*   **Outputs:**
    *   Route subagent modules (`segmentBuilderAgent.js`, `flightSearchAgent.js`, `trainSearchAgent.js`, `connectivityAgent.js`)
*   **Validation Rules:**
    *   Segment date bounds must align chronologically without overlap (Segment N end = Segment N+1 start).
    *   Radius bounds for connectivity searches must automatically scale to 300km with warnings if primary searches yield no results.
*   **Dependencies:** TSK-AGNT-01
*   **Acceptance Criteria:**
    *   User multi-destination arrays convert to structured segment lists.
    *   Flight and train options return names, times, classes, and prices.
    *   Remote locations generate connectivity cards containing transfers and warnings.
*   **Estimated Complexity:** Large
*   **Estimated Effort:** 3 Days

---

## TSK-AGNT-03: Content Generation Subagents (Itinerary, Budget, Explanation)
*   **Epic:** Epic 11: AI Agent Orchestration
*   **Related User Story:** AGNT-006, AGNT-007, AGNT-008
*   **Priority:** High
*   **Purpose:** Build the content subagents which prompt Gemini for sightseeing activities, manage budget restrictions, convert currencies, and write route justifications.
*   **Inputs:**
    *   Confirmed routes
    *   Style tags and budget tiers
*   **Process Steps:**
    1.  Build the **Itinerary Agent**: Formulate prompts for Gemini requesting daily activity listings, verify place coordinates against geospatial bounds, and place meal slots chronologically.
    2.  Build the **Budget Agent**: Fetch live currency rates (caching for 12 hours), convert prices, and flag segments where costs exceed budget ceilings (Budget: <$50/day; Moderate: <$150/day), requesting cheaper routes when exceeded.
    3.  Build the **Recommendation Explanation Agent**: Compile alternate choices and draft a concise natural-language justification (e.g., "Chosen to fit within the Budget tier").
*   **Outputs:**
    *   Content subagent modules (`itineraryAgent.js`, `budgetAgent.js`, `explanationAgent.js`)
*   **Validation Rules:**
    *   Activities must be scheduled between 09:00 and 18:00 local time.
    *   Explanation texts must be under 150 characters.
*   **Dependencies:** TSK-AGNT-01, TSK-AGNT-02
*   **Acceptance Criteria:**
    *   Daily activity sequences incorporate dining structures and unique attractions.
    *   Exceeded budgets trigger request adaptations to pick cheaper routes.
    *   Segments display route explanation rationales.
*   **Estimated Complexity:** Medium
*   **Estimated Effort:** 3 Days

---

## TSK-AGNT-04: Global Logging, Error Boundaries & Slack Webhook Alerting
*   **Epic:** Epic 12: Administration & Monitoring
*   **Related User Story:** ADMN-002, ADMN-003, ADMN-008
*   **Priority:** High
*   **Purpose:** Set up global logging and error handling, tracking server issues, database slow-queries, and dispatching webhook alerts.
*   **Inputs:**
    *   Exception stack traces
    *   Database execution metrics
*   **Process Steps:**
    1.  Write an Express error boundary middleware to intercept backend exceptions.
    2.  Save error stacks, User IDs, payloads, and request timestamps to the `SystemErrors` database collection. Scrub passwords and auth tokens beforehand.
    3.  Build alert handlers that trigger Slack webhooks or email alerts for critical severities (e.g., database disconnects, third-party authentication failures), throttled to 1 message per 15 minutes for duplicate stacks.
    4.  Implement database execution tracking hooks to log operations exceeding `DB_SLOW_LOG_MS` (default 500ms) to `DatabaseSlowLogs`.
*   **Outputs:**
    *   Error logging middleware and Slack webhook integrations
    *   `SystemErrors` and `DatabaseSlowLogs` schemas
*   **Validation Rules:**
    *   All sensitive data must be masked in the logged datasets.
*   **Dependencies:** None
*   **Acceptance Criteria:**
    *   Uncaught server exceptions write debug details to the database error log collection.
    *   Critical server/db issues post a notification to the Slack alerting channel.
    *   Mongoose queries exceeding 500ms save performance details.
*   **Estimated Complexity:** Medium
*   **Estimated Effort:** 2 Days

---

## TSK-AGNT-05: Usage Quotas, Cost Tracker & Circuit Breaker Middleware
*   **Epic:** Epic 12: Administration & Monitoring
*   **Related User Story:** ADMN-002 (quotas), ADMN-004, ADMN-007
*   **Priority:** Medium
*   **Purpose:** Build rate-limiting systems for outbound APIs, calculate usage cost logs, and write circuit breakers to manage outages of partner endpoints.
*   **Inputs:**
    *   Outbound API request details
    *   API response status codes
*   **Process Steps:**
    1.  Create the `ApiUsageLogs` schema to track outbound API requests (target, endpoint, response code, timestamp).
    2.  Write rate-limiter middleware: Limit users to 100 external API request cycles per hour, returning HTTP 429 if exceeded. Retain usage logs for 90 days.
    3.  Implement a cost estimator inside logs computing dollar values based on token counts (Gemini Flash: $0.075/1M inputs, $0.30/1M outputs) and requests (Mapbox: $5.00/1k requests). Trigger admin warnings when costs hit 80% of the $500 monthly budget limit.
    4.  Implement a circuit breaker helper class for external endpoints (Amadeus, Rome2Rio). Shift state to `OPEN` (blocking outbound connections) if failure rates exceed 50% in a 5-minute tracking block.
    5.  Build administrator API overrides to manually close circuit breakers.
*   **Outputs:**
    *   `ApiUsageLogs` schema
    *   API rate limiter and cost tracking hook
    *   Circuit breaker classes
*   **Validation Rules:**
    *   Standard user hourly limits must be strictly verified.
    *   Circuit breakers must auto-test using a `HALF-OPEN` state after 5 minutes of inactivity.
*   **Dependencies:** TSK-AGNT-04
*   **Acceptance Criteria:**
    *   Exceeding user usage quotas returns HTTP 429.
    *   Admin dashboard lists API transaction costs.
    *   Failing flight APIs open circuit breakers, redirecting queries to cached assets.
*   **Estimated Complexity:** Medium
*   **Estimated Effort:** 2 Days

---

## TSK-AGNT-06: Admin Dashboard API & Role-Based Access Controls
*   **Epic:** Epic 12: Administration & Monitoring
*   **Related User Story:** ADMN-001, ADMN-005, ADMN-006, ADMN-009, ADMN-010
*   **Priority:** Medium
*   **Purpose:** Build administrative control APIs, implementing role-based authentication, user account suspension tools, manual cache purges, and trends tracking.
*   **Inputs:**
    *   Admin credentials
    *   Moderator command requests
*   **Process Steps:**
    1.  Create route authorization middleware restricting paths under `/api/admin/*` to authenticated users with `role: "admin"`.
    2.  Enforce administrative JWT expiration times of 15 minutes without sliding resets. Require 12+ character complex passwords.
    3.  Write GET `/api/admin/metrics` returning session counts and success rates.
    4.  Write user moderation endpoints `/api/admin/users/:userId/suspend` to flag status as `Suspended` and terminate their active sessions, logging audits in `AuditLogs`.
    5.  Write cache endpoints: GET `/api/admin/cache/stats` and POST `/api/admin/cache/invalidate` to purge stale cached routes by city query.
    6.  Build `ItineraryAudits` aggregation pipelines to compile anonymous travel trends.
*   **Outputs:**
    *   Admin authorization middleware and login endpoints
    *   User control and cache purging APIs
    *   `AuditLogs` and `ItineraryAudits` collections
*   **Validation Rules:**
    *   All user identities must be stripped from trend analytics collections.
    *   User suspensions require super-admin checks if editing admin records.
*   **Dependencies:** TSK-AGNT-04, TSK-AGNT-05
*   **Acceptance Criteria:**
    *   Non-admin logins to administrative paths yield HTTP 403 Forbidden.
    *   Suspending an account terminates active sessions and blocks future requests.
    *   Purging cache deletes selected records instantly.
*   **Estimated Complexity:** Medium
*   **Estimated Effort:** 3 Days
