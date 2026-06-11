# Task Document: Epic 4 - Connectivity Analysis & Last-Mile Transport

This document outlines the detailed development tasks required to implement Epic 4: Connectivity Analysis & Last-Mile Transport. These tasks address travel segments where direct train or flight connectivity is unavailable.

---

## Task 1: TSK-CONN-01 - Nearest Airport & Railway Hub Geolocation Engine

* **Task ID:** TSK-CONN-01
* **Task Name:** Nearest Airport & Railway Hub Geolocation Engine
* **Epic:** [Epic 4: Connectivity Analysis & Last-Mile Transport](file:///C:/Users/HI/Desktop/AI-TRIP-PLANNER/epics/04-connectivity-analysis.md)
* **Related User Story:** [CONN-001](file:///C:/Users/HI/Desktop/AI-TRIP-PLANNER/stories/connectivity-analysis-stories.md#L5), [CONN-002](file:///C:/Users/HI/Desktop/AI-TRIP-PLANNER/stories/connectivity-analysis-stories.md#L33), [CONN-008](file:///C:/Users/HI/Desktop/AI-TRIP-PLANNER/stories/connectivity-analysis-stories.md#L195)
* **Priority:** High
* **Purpose:** Implement a geospatial search utility that resolves the coordinates of target destinations and queries local collections of airports and railway stations to identify the nearest transit hubs within configurable search radii.
* **Inputs:**
  * Destination geo-coordinates `[longitude, latitude]`
  * `airportRadiusLimit` (number, default: 150km, min: 50km, max: 300km)
  * `railwayRadiusLimit` (number, default: 100km, min: 20km, max: 150km)
* **Process Steps:**
  1. Create a service file `src/domain/services/ConnectivityHubFinder.ts`.
  2. Write a mathematical utility implementing the Haversine formula to calculate the straight-line distance between two sets of GPS coordinates.
  3. Formulate MongoDB geospatial aggregation queries utilizing `$near` or `$geoWithin` operators over the `Airports` database collection (requires a `2dsphere` index on the coordinates field).
  4. Perform the query for airports within the default `airportRadiusLimit` (150km).
     * If no results are returned, dynamically expand the search radius to a maximum fallback limit of 300km and tag the returned hub as a "Remote Region Hub".
  5. Formulate similar queries over the `RailwayStations` collection (filtering for active stations serving national routes) within the `railwayRadiusLimit` (100km).
     * If no station is found, flag the destination segment as "No Rail Access".
  6. Return a normalized JSON object containing airport and railway stations metadata (name, code, distance in kilometers, coordinates).
* **Outputs:**
  * JSON object details listing the closest airport and railway hub coordinates and codes.
* **Validation Rules:**
  * Input coordinates must be valid float values representing latitude (-90 to 90) and longitude (-180 to 180).
  * Radius parameters must satisfy settings slider limits.
* **Dependencies:** None
* **Acceptance Criteria:**
  * Geolocation searches accurately return the closest commercial hub (e.g. Shirdi Airport SAG or Kopargaon railway station KPG when querying Shirdi coordinates).
  * Database queries resolve in under 200ms.
  * Unit tests cover boundary scenarios (no stations found, multiple stations at equal distances) with mock databases.
* **Estimated Complexity:** Medium
* **Estimated Effort:** 2 Days

---

## Task 2: TSK-CONN-02 - Last-Mile Transit Providers (Bus & Taxi API Services)

* **Task ID:** TSK-CONN-02
* **Task Name:** Last-Mile Transit Providers (Bus & Taxi API Services)
* **Epic:** [Epic 4: Connectivity Analysis & Last-Mile Transport](file:///C:/Users/HI/Desktop/AI-TRIP-PLANNER/epics/04-connectivity-analysis.md)
* **Related User Story:** [CONN-003](file:///C:/Users/HI/Desktop/AI-TRIP-PLANNER/stories/connectivity-analysis-stories.md#L60), [CONN-004](file:///C:/Users/HI/Desktop/AI-TRIP-PLANNER/stories/connectivity-analysis-stories.md#L87)
* **Priority:** High
* **Purpose:** Integrate regional bus aggregator services and write a private taxi pricing estimation service to cover transit needs between remote destination sites and their nearest transit hubs.
* **Inputs:**
  * `hubCoordinates` `[longitude, latitude]`
  * `destinationCoordinates` `[longitude, latitude]`
  * `arrivalDateTime` (string, ISO datetime format)
* **Process Steps:**
  1. Create a bus routing client `src/infrastructure/transit/BusRouteClient.ts` that interfaces with regional transit APIs (like redBus or Rome2Rio).
  2. Implement local API query caching (storing schedule schedules for 24 hours).
  3. Filter bus schedules to show only those departures operating within a 4-hour window from the target `arrivalDateTime`.
  4. Create a taxi fee calculator service `src/application/services/TaxiFareCalculator.ts` implementing the following rate formula:
     * `Fare = Base Fare + (Distance in km * Per-km Rate) * Time-of-Day Multiplier`
  5. Fetch driving distance via Google Distance Matrix or Mapbox Directions API.
  6. Apply a night multiplier of 1.5x on taxi fares for segments where the pickup time falls between 22:00 and 05:00.
  7. Handle dynamic pricing coefficients (e.g., multiplier flags for rugged terrain or bad weather seasons).
* **Outputs:**
  * Array of bus routes (operator, departures, duration, fares) and taxi pricing estimates.
* **Validation Rules:**
  * Distance calculations must yield positive numeric values.
  * Taxi per-km rate constants must be loaded from regional rate databases.
* **Dependencies:** TSK-CONN-01
* **Acceptance Criteria:**
  * System outputs public bus options and private taxi fares for segments exceeding 15km.
  * Timeout or failure of bus schedule lookup gracefully falls back to a warning alert showing estimated municipal transit fares.
* **Estimated Complexity:** Medium
* **Estimated Effort:** 2 Days

---

## Task 3: TSK-CONN-03 - Connectivity & Last-Mile Orchestrator Endpoint

* **Task ID:** TSK-CONN-03
* **Task Name:** Connectivity & Last-Mile Orchestrator Endpoint
* **Epic:** [Epic 4: Connectivity Analysis & Last-Mile Transport](file:///C:/Users/HI/Desktop/AI-TRIP-PLANNER/epics/04-connectivity-analysis.md)
* **Related User Story:** [CONN-005](file:///C:/Users/HI/Desktop/AI-TRIP-PLANNER/stories/connectivity-analysis-stories.md#L114), [CONN-007](file:///C:/Users/HI/Desktop/AI-TRIP-PLANNER/stories/connectivity-analysis-stories.md#L168)
* **Priority:** High
* **Purpose:** Implement the main Express server route `/api/v1/analyze-connectivity` and code the `ConnectivityAgent` class to orchestrate hub lookups, query last-mile transportation options, apply user preferences (private vs. public), and generate natural language recommendations using Gemini API templates.
* **Inputs:**
  * Request Body: `destinationCoordinates`, `hubCoordinates`, `preference` (enum: `Private Only`, `Public Only`, `Combined`), `arrivalDateTime`
* **Process Steps:**
  1. Define the routing path `/api/v1/analyze-connectivity` in `src/presentation/routes/connectivityRouter.ts`.
  2. Implement input checking within `src/presentation/controllers/ConnectivityController.ts` using Zod schemas.
  3. Create the specialized agent class `src/application/agents/ConnectivityAgent.ts` adhering to the system agent interfaces.
  4. Query the Geolocation Engine (TSK-CONN-01) and Last-Mile Providers (TSK-CONN-02) concurrently.
  5. Apply user preference filters:
     * **Private Only:** Exclude public bus results from the recommended route.
     * **Public Only:** Exclude taxi options, prioritizing municipal bus lines. If no public transport exists, fall back to a taxi, highlighting a warning badge.
     * **Combined:** Analyze both options and recommend the optimal balance.
  6. Generate a natural language explanation summary using a structured Gemini LLM prompt template.
  7. Store the computed results in the `ConnectivityAnalysis` database collection.
* **Outputs:**
  * Unified JSON response payload detailing hubs, options, and optimization reasons.
* **Validation Rules:**
  * Request payload must match standard validation schema parameters.
  * LLM generated text must be sanitized before output to prevent injection.
* **Dependencies:** TSK-CONN-01, TSK-CONN-02
* **Acceptance Criteria:**
  * Endpoint returns 200 HTTP status with valid schema layout.
  * Entire orchestration and reasoning step completes in under 2 seconds.
  * Session preferences correctly alter the outputs (e.g., "Public Only" hides taxi details).
* **Estimated Complexity:** Medium
* **Estimated Effort:** 2 Days

---

## Task 4: TSK-CONN-04 - Ferry & Marine Transit Extension

* **Task ID:** TSK-CONN-04
* **Task Name:** Ferry & Marine Transit Extension
* **Epic:** [Epic 4: Connectivity Analysis & Last-Mile Transport](file:///C:/Users/HI/Desktop/AI-TRIP-PLANNER/epics/04-connectivity-analysis.md)
* **Related User Story:** [CONN-006](file:///C:/Users/HI/Desktop/AI-TRIP-PLANNER/stories/connectivity-analysis-stories.md#L141)
* **Priority:** Low
* **Purpose:** Implement ferry/boat connection checks for coastal locations and island destinations separated by water bodies.
* **Inputs:**
  * Destination coordinates, travel date
* **Process Steps:**
  1. In the routing engine, check for water boundaries: if road routing calculations fail or return a "No Route Found" error code, trigger ferry lookup.
  2. Create a marine transit client `src/infrastructure/transit/FerryTransitClient.ts` querying public ferry operators or regional port databases.
  3. Scan for active passenger ferry terminals within a 100km radius of target coordinates.
  4. Parse the terminal schedules, operators, and ticket pricing.
  5. Map options to the last-mile transit format.
  6. Implement a fallback state: if no ferry schedules are indexed for the date, write a message: "Water transit required. Check local harbor schedules."
* **Outputs:**
  * Ferry options array added to last-mile transport data.
* **Validation Rules:**
  * Search boundary is hard-coded to 100km.
* **Dependencies:** TSK-CONN-03
* **Acceptance Criteria:**
  * Island targets (e.g., Havelock Island) correctly return ferry routes.
  * Standard overland routes bypass the marine check, ensuring zero performance impact.
* **Estimated Complexity:** Large
* **Estimated Effort:** 3 Days

---

## Task 5: TSK-CONN-05 - Departure Buffer & Connection Validation Engine

* **Task ID:** TSK-CONN-05
* **Task Name:** Departure Buffer & Connection Validation Engine
* **Epic:** [Epic 4: Connectivity Analysis & Last-Mile Transport](file:///C:/Users/HI/Desktop/AI-TRIP-PLANNER/epics/04-connectivity-analysis.md)
* **Related User Story:** [CONN-010](file:///C:/Users/HI/Desktop/AI-TRIP-PLANNER/stories/connectivity-analysis-stories.md#L249)
* **Priority:** High
* **Purpose:** Create a timeline validation service that evaluates multi-segment schedules and flags connections that do not meet minimum layover buffer time constraints.
* **Inputs:**
  * Chronological array of segment transit steps containing arrival times and scheduled onward departures.
* **Process Steps:**
  1. Create the validation class `src/domain/services/ConnectionValidator.ts`.
  2. Implement buffer check rules:
     * Airport transfers require a minimum layover buffer of 30 minutes.
     * Railway transfers require a minimum layover buffer of 15 minutes.
  3. Subtract the arrival time of the primary transit segment from the departure time of the onward last-mile segment.
  4. Validate: `Buffer Minutes = (Onward Departure Time - Primary Arrival Time) / 60000`.
  5. If `Buffer Minutes` falls below the threshold, set the segment state to invalid and return a warning code (`INSUFFICIENT_BUFFER`).
* **Outputs:**
  * Validation object containing boolean status, buffer time details, and user-facing warning strings.
* **Validation Rules:**
  * Validation runs automatically whenever a user switches a primary flight or train selection.
* **Dependencies:** TSK-CONN-03
* **Acceptance Criteria:**
  * Changing to a late-arriving flight instantly triggers a red warning badge in the UI timeline view.
  * Validation logic has 100% test coverage with robust unit tests.
* **Estimated Complexity:** Medium
* **Estimated Effort:** 2 Days

---

## Task 6: TSK-CONN-06 - Last-Mile Map Polyline Vector Rendering

* **Task ID:** TSK-CONN-06
* **Task Name:** Last-Mile Map Polyline Vector Rendering
* **Epic:** [Epic 4: Connectivity Analysis & Last-Mile Transport](file:///C:/Users/HI/Desktop/AI-TRIP-PLANNER/epics/04-connectivity-analysis.md)
* **Related User Story:** [CONN-009](file:///C:/Users/HI/Desktop/AI-TRIP-PLANNER/stories/connectivity-analysis-stories.md#L222)
* **Priority:** High
* **Purpose:** Integrate Mapbox GL JS on the frontend page to draw the last-mile driving or transit path from the arrival hub (station/airport) to the final destination destination point.
* **Inputs:**
  * Mapbox viewport element, transit hub and destination coordinate pairs
* **Process Steps:**
  1. Update the map rendering view component `#map-pane` at `src/presentation/components/dashboard/MapPane.tsx`.
  2. Fetch the detailed driving geometry coordinates between the transit hub and the destination using the Mapbox Directions API.
  3. Draw a dashed blue polyline vector on the Mapbox canvas. Ensure it is visually distinct from primary inter-city lines (solid orange).
  4. Implement coordinate compression (e.g. polyline encoding) to optimize payload sizes sent to the client.
  5. Bind events to redraw the polyline whenever the user switches transport methods (e.g., from Bus to Taxi).
* **Outputs:**
  * Visual polyline path overlays drawn on the interactive map pane.
* **Validation Rules:**
  * If the Mapbox Directions API fails, fall back to a straight-line dashed vector between the hub and destination.
* **Dependencies:** TSK-CONN-03
* **Acceptance Criteria:**
  * Dashed vector matches the road driving path.
  * The map viewport automatically shifts boundaries to show both the transit hub marker and the destination pin.
* **Estimated Complexity:** Medium
* **Estimated Effort:** 3 Days
