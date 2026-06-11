# Task Document: Epic 3 - Route Analysis & Transportation Planning

This document outlines the detailed development tasks required to implement Epic 3: Route Analysis & Transportation Planning. These tasks cover Flight Search integration, Train Search integration, and Route Comparison/Analysis features.

---

## Task 1: TSK-ROUTE-01 - Flight Search API Client & Service

* **Task ID:** TSK-ROUTE-01
* **Task Name:** Flight Search API Client & Service
* **Epic:** [Epic 3: Route Analysis & Transportation Planning](file:///C:/Users/HI/Desktop/AI-TRIP-PLANNER/epics/03-route-analysis.md)
* **Related User Story:** [ROUTE-001](file:///C:/Users/HI/Desktop/AI-TRIP-PLANNER/stories/route-analysis-stories.md#L7), [ROUTE-003](file:///C:/Users/HI/Desktop/AI-TRIP-PLANNER/stories/route-analysis-stories.md#L67)
* **Priority:** High
* **Purpose:** Establish a secure connection client to external flight aggregation services (such as Skyscanner or Amadeus API) to check availability, pricing, schedules, and carrier information between airports, mapping response payloads to our local application schemas.
* **Inputs:**
  * `originAirportCode` (string, e.g., "VTZ")
  * `destinationAirportCode` (string, e.g., "SAG")
  * `travelDate` (string, format `YYYY-MM-DD`)
  * `cabinClass` (string, enum: `Economy`, `Premium_Economy`, `Business`, `First`, default: `Economy`)
* **Process Steps:**
  1. Create the client file `src/infrastructure/transit/FlightApiClient.ts` implementing a generic interface `IFlightApiClient`.
  2. Implement authorization credentials retrieval (OAuth2 token access client with token expiration storage in memory).
  3. Formulate the Amadeus/Skyscanner flight offers HTTP request body and query parameters based on inputs.
  4. Fire asynchronous GET/POST queries to the remote endpoints, wrapping them in a strict 10-second timeout.
  5. Parse the returned raw JSON payload, filtering out routes that violate search constraints or exhibit negative durations.
  6. Map the raw response arrays to a unified application-level transit model (`FlightOffer` containing carrier, flight numbers, duration, price, layovers, and airport identifiers).
  7. Integrate exponential backoff retry logic (maximum of 3 attempts) for transient failures.
  8. Gracefully handle errors: return standard custom exceptions for HTTP 401 (expired token), HTTP 429 (rate-limited), and empty search results.
* **Outputs:**
  * Array of unified flight transit options conforming to the backend schema structure.
* **Validation Rules:**
  * `travelDate` must be a valid future calendar date.
  * Origin and destination airport strings must be exactly 3-character uppercase IATA codes.
  * Output structures must validate against a predefined Zod validator schema `FlightSearchResponseSchema`.
* **Dependencies:** None
* **Acceptance Criteria:**
  * A query for valid coordinates yields a JSON array sorted by price.
  * API lookup successfully times out if remote response exceeds 10 seconds, fallback to empty array.
  * Code coverage of unit tests mocking client responses (200 OK, 401 Unauthorized, 429 Too Many Requests, 500 Server Error) matches or exceeds 80%.
* **Estimated Complexity:** Medium
* **Estimated Effort:** 2 Days

---

## Task 2: TSK-ROUTE-02 - Train Search API Client & Service

* **Task ID:** TSK-ROUTE-02
* **Task Name:** Train Search API Client & Service
* **Epic:** [Epic 3: Route Analysis & Transportation Planning](file:///C:/Users/HI/Desktop/AI-TRIP-PLANNER/epics/03-route-analysis.md)
* **Related User Story:** [ROUTE-001](file:///C:/Users/HI/Desktop/AI-TRIP-PLANNER/stories/route-analysis-stories.md#L7), [ROUTE-003](file:///C:/Users/HI/Desktop/AI-TRIP-PLANNER/stories/route-analysis-stories.md#L67)
* **Priority:** High
* **Purpose:** Implement a railway routing connection client (e.g. Rome2Rio or Indian Railways API) to query national train routes, timetables, ticket class fares, and duration for travel segments.
* **Inputs:**
  * `originStationCode` or `originCoordinates` (string or geographic point)
  * `destinationStationCode` or `destinationCoordinates` (string or geographic point)
  * `travelDate` (string, format `YYYY-MM-DD`)
* **Process Steps:**
  1. Create the train service file `src/infrastructure/transit/TrainApiClient.ts` implementing the `ITrainApiClient` interface.
  2. Implement an authorization protocol client matching target railway provider rules.
  3. Resolve destination coordinates to the nearest local railway station codes using a geospatial lookup helper if text codes are absent.
  4. Query the rail API with segment parameters and date.
  5. Parse the returned raw railway schedules, filtering out closed routes.
  6. Map the rail results to the unified transport schema representation (`TrainRoute` containing train name, ticket classes, departures, duration, and price).
  7. Handle query failures and timeouts (strict 10-second limit) with exponential backoff.
* **Outputs:**
  * Array of unified train schedules matching the search parameters.
* **Validation Rules:**
  * Date must verify as valid future calendar day.
  * Fares must resolve to non-negative decimal numbers.
  * Request payload format validated using a Zod schema `TrainQuerySchema`.
* **Dependencies:** None
* **Acceptance Criteria:**
  * Query returns valid rail route options sorted by total transit duration.
  * Remote routes with no train coverage yield empty arrays rather than exceptions.
  * Unit tests with mocked responses achieve 80%+ code coverage.
* **Estimated Complexity:** Medium
* **Estimated Effort:** 2 Days

---

## Task 3: TSK-ROUTE-03 - Route Comparison & Multi-Modal Optimization Engine

* **Task ID:** TSK-ROUTE-03
* **Task Name:** Route Comparison & Multi-Modal Optimization Engine
* **Epic:** [Epic 3: Route Analysis & Transportation Planning](file:///C:/Users/HI/Desktop/AI-TRIP-PLANNER/epics/03-route-analysis.md)
* **Related User Story:** [ROUTE-001](file:///C:/Users/HI/Desktop/AI-TRIP-PLANNER/stories/route-analysis-stories.md#L7), [ROUTE-002](file:///C:/Users/HI/Desktop/AI-TRIP-PLANNER/stories/route-analysis-stories.md#L36), [ROUTE-004](file:///C:/Users/HI/Desktop/AI-TRIP-PLANNER/stories/route-analysis-stories.md#L87)
* **Priority:** High
* **Purpose:** Construct the core backend endpoint `/api/v1/transport/analyze` to handle multi-modal routing requests. The service coordinates the concurrent execution of flight and train searches, filters options based on target budget tiers, runs a Pareto frontier optimization, and stores recommendations in MongoDB.
* **Inputs:**
  * Request Body: `origin` (string), `destination` (string), `budgetTier` (enum: `Budget`, `Moderate`, `Luxury`), `travelDate` (string)
* **Process Steps:**
  1. Create the API routing endpoint under `src/presentation/routes/transportRouter.ts`.
  2. Implement HTTP validation middleware using Zod (`TransportAnalyzeRequestSchema`).
  3. Implement the controller logic in `src/presentation/controllers/TransportController.ts`.
  4. Create `src/application/services/RouteOptimizationService.ts` to coordinate search clients.
  5. Fire concurrent calls to `FlightApiClient` and `TrainApiClient` using `Promise.all`.
  6. Formulate the Pareto frontier algorithm to rank routes based on the user's `budgetTier`:
     * **Budget:** Minimize cost, accept multi-leg train or bus options.
     * **Moderate:** Balance total duration and expense, recommending faster options if they fall within moderate thresholds.
     * **Luxury:** Minimize total travel duration, recommending express flights, premium cabins, and direct transit.
  7. Formulate a natural-language reason/rationale string describing the recommendation tradeoffs.
  8. Calculate a recommendation confidence score (from `0.0` to `1.0`) based on scheduling buffer and pricing volatility.
  9. Save the compiled options to the `TransportOptions` database collection using `TransportOptionRepository`.
* **Outputs:**
  * JSON payload containing the recommended route, alternative routes, total segment cost, and travel duration.
* **Validation Rules:**
  * The response payload structure must exactly conform to the Segment schema defined in [functional-spec.md](file:///C:/Users/HI/Desktop/AI-TRIP-PLANNER/specs/functional-spec.md#L190).
  * If coordinate geolocation parameters fail, throw a 400 bad request error.
* **Dependencies:** TSK-ROUTE-01, TSK-ROUTE-02
* **Acceptance Criteria:**
  * Invoking the endpoint returns a valid 200 HTTP response with detailed route steps.
  * The concurrent execution completes in less than 2.5 seconds on cache-miss states.
  * System handles partial outages: if the flight search fails but the train search succeeds, the engine should recommend train routes and append a warning flag.
* **Estimated Complexity:** Large
* **Estimated Effort:** 3 Days

---

## Task 4: TSK-ROUTE-04 - Route Analysis & Override UI Dashboard

* **Task ID:** TSK-ROUTE-04
* **Task Name:** Route Analysis & Override UI Dashboard
* **Epic:** [Epic 3: Route Analysis & Transportation Planning](file:///C:/Users/HI/Desktop/AI-TRIP-PLANNER/epics/03-route-analysis.md)
* **Related User Story:** [ROUTE-002](file:///C:/Users/HI/Desktop/AI-TRIP-PLANNER/stories/route-analysis-stories.md#L36), [ROUTE-003](file:///C:/Users/HI/Desktop/AI-TRIP-PLANNER/stories/route-analysis-stories.md#L62), [ROUTE-009](file:///C:/Users/HI/Desktop/AI-TRIP-PLANNER/stories/route-analysis-stories.md#L216)
* **Priority:** High
* **Purpose:** Construct the frontend Route Analysis screen `#route-analysis-screen` allowing users to view multi-modal options, toggle transit tabs, review recommendation rationales, and manually override duration and cost estimates.
* **Inputs:**
  * UI state variables, segment list queries fetching data from GET `/api/v1/trips/:tripId/segments/:segmentId`
* **Process Steps:**
  1. Create the React screen component at `src/presentation/components/route-analysis/RouteAnalysisScreen.tsx`.
  2. Implement the Segment Selector Tabs to cycle through segments (e.g. Anakapalle → Shirdi).
  3. Create the Transit Options Grid (`#flight-options`, `#train-options`) to display specific itineraries, transit times, codes, and prices.
  4. Create the Recommended Route Card (`#recommended-route`) to highlight the optimized travel option, total price, and the AI explanation block.
  5. Implement toggle controls to filter by mode (e.g., flight-only vs. train-only), updating the active list.
  6. Build an Edit Override Modal overlay to support custom cost (positive decimal) and duration (positive integer) inputs.
  7. Implement a React Query mutation to call `PUT /api/v1/trips/:tripId/segments/:segmentId` to overwrite estimates.
* **Outputs:**
  * A responsive React UI component supporting mode switching, details expansion, and custom field overrides.
* **Validation Rules:**
  - Disable the "Flight Options" tab if flight routing connectivity is unavailable, displaying an informative tooltip.
  - Form validation: custom inputs must be positive numeric values.
* **Dependencies:** TSK-ROUTE-03
* **Acceptance Criteria:**
  * Interactive controls switch routes and update UI states immediately.
  * Overridden values are saved to the database, trigger a budget recalculation, and show updated figures instantly.
  * Component styling follows Tailwind CSS slate/dark-mode guidelines, including skeleton screens for loading segments.
* **Estimated Complexity:** Medium
* **Estimated Effort:** 3 Days

---

## Task 5: TSK-ROUTE-05 - Transit Route Search Caching Middleware

* **Task ID:** TSK-ROUTE-05
* **Task Name:** Transit Route Search Caching Middleware
* **Epic:** [Epic 3: Route Analysis & Transportation Planning](file:///C:/Users/HI/Desktop/AI-TRIP-PLANNER/epics/03-route-analysis.md)
* **Related User Story:** [ROUTE-010](file:///C:/Users/HI/Desktop/AI-TRIP-PLANNER/stories/route-analysis-stories.md#L242)
* **Priority:** Medium
* **Purpose:** Implement a database caching layer for identical transit queries to eliminate duplicate external API calls, minimize response latency, and control third-party billing costs.
* **Inputs:**
  * `origin`, `destination`, `travelDate`
* **Process Steps:**
  1. Create the Mongoose schema `CachedRouteSchema` matching the `CachedRoutes` collection requirements.
  2. Set fields: `cacheKey` (unique index, string), `routeData` (JSON format payload), and `createdAt` (date).
  3. Implement a TTL index on the `createdAt` timestamp with `expireAfterSeconds: 604800` (7 days).
  4. Create a middleware handler `src/infrastructure/middleware/routeCacheMiddleware.ts`.
  5. Generate a unique hash for `cacheKey` using MD5/SHA256 from normalized representations of `origin` + `destination` + `travelDate`.
  6. In the middleware logic, intercept requests to `/api/v1/transport/analyze`:
     * If key is found in cache: return the cached data immediately.
     * If key is not found: continue execution, capture the outgoing response payload, write it to `CachedRoutes`, and then send it to the client.
* **Outputs:**
  * Cache interceptor middleware and database schemas.
* **Validation Rules:**
  * Normalize names and dates to ensure variations in spaces and case do not create distinct keys.
* **Dependencies:** TSK-ROUTE-03
* **Acceptance Criteria:**
  * Cache-hit queries return cached results in less than 100ms.
  * Expired cache entries are successfully purged by MongoDB (TTL validation passes).
* **Estimated Complexity:** Small
* **Estimated Effort:** 1 Day
