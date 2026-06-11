# User Stories: Epic 3 - Route Analysis & Transportation Planning

This document outlines the detailed user stories, acceptance criteria, business rules, technical dependencies, database collections, and UI targets for Epic 3.

---

### Story ROUTE-001: Analyze Transportation Options for a Segment
**Story ID:** ROUTE-001  
**Epic:** Epic 3: Route Analysis & Transportation Planning  
**Priority:** High  

As an authenticated traveler,  
I want the system to run a comprehensive transportation analysis across each segment of my trip,  
So that I can review and select flight, railway, and driving options.  

**Acceptance Criteria:**  
*   Given a user has created a trip segment (e.g. Anakapalle to Shirdi),  
*   When the system triggers the transportation analysis engine,  
*   Then the system calls the internal lookup APIs to search for available flights, rail routes, and driving steps, compiles them, and returns a recommended route along with alternatives.  
*   Given a segment transit analysis fails due to an external API outage,  
*   When the analysis is triggered,  
*   Then the system returns a status code of 500 with the code `AI_GEN_FAILED` and falls back to a warning alert in the interface.  

**Business Rules:**  
*   The analysis must run flight searches and train searches concurrently to minimize latency.  
*   Options must be compiled into flight, rail, and driving categories and sorted by budget and duration.  

**Dependencies:** TRIP-001, TRIP-006.  
**API References:** POST `/api/v1/transport/analyze`  
**Database References:** TransportOptions Collection (`TransportOptionSchema` fields: `segmentId`, `optionType`, `isRecommended`, `steps`, `cost`, `durationMinutes`)  
**UI References:** Route Analysis Page (`#route-analysis-screen`), Segment Selector, Transit Options Grid (`#flight-options`, `#train-options`)  
**Estimate:** Large  

---

### Story ROUTE-002: Retrieve Segment Details with Recommendations
**Story ID:** ROUTE-002  
**Epic:** Epic 3: Route Analysis & Transportation Planning  
**Priority:** High  

As an authenticated traveler,  
I want to view details of transport recommendations for a specific segment,  
So that I can see the exact steps of my travel itinerary.  

**Acceptance Criteria:**  
*   Given a traveler is on the Route Analysis page,  
*   When they select a segment tab (e.g., "Segment 1: Anakapalle → Shirdi"),  
*   Then the system fetches the recommended route steps, duration, and cost from the database, displaying them in the Recommended Route Card.  

**Business Rules:**  
*   The segment details must always display a confidence score (from 0 to 1) indicating reliability.  
*   Steps must be rendered as a bulleted chronological sequence.  

**Dependencies:** ROUTE-001.  
**API References:** GET `/api/v1/trips/:tripId/segments/:segmentId`  
**Database References:** TripSegments Collection, TransportOptions Collection, Index: `{ segmentId: 1 }`  
**UI References:** Route Analysis Page, Recommended Route Card (`#recommended-route`)  
**Estimate:** Small  

---

### Story ROUTE-003: Filter/Toggle Transit Modes
**Story ID:** ROUTE-003  
**Epic:** Epic 3: Route Analysis & Transportation Planning  
**Priority:** Medium  

As a traveler,  
I want to toggle between different transport modes (such as flight-only, train-only, or combined multi-modal routes),  
So that I can see options that match my preferred style of travel.  

**Acceptance Criteria:**  
*   Given a user is reviewing transit options for a segment,  
*   When they click on the Flight Options or Train Options tab,  
*   Then the interface filters the available transport list to display only options of that selected type, updating the map polyline in real-time.  

**Business Rules:**  
*   If a segment does not have flight connectivity, the "Flight Options" tab must be disabled, and an informative tool-tip displayed.  

**Dependencies:** ROUTE-001.  
**API References:** GET `/api/v1/trips/:tripId/segments/:segmentId/options` (Filter query parameter: `type`)  
**Database References:** TransportOptions Collection (`TransportOptionSchema` fields: `optionType`, `steps`, `cost`)  
**UI References:** Route Analysis Page, Transit Options Grid, Flight/Train/Bus tabs  
**Estimate:** Medium  

---

### Story ROUTE-004: Explainable AI Recommendation Rationales
**Story ID:** ROUTE-004  
**Epic:** Epic 3: Route Analysis & Transportation Planning  
**Priority:** Medium  

As a traveler,  
I want to read a natural-language rationale explaining why a specific route was recommended,  
So that I can understand the tradeoffs between travel speed, transfer counts, and costs.  

**Acceptance Criteria:**  
*   Given a user is looking at the Recommended Route Card,  
*   When the card renders,  
*   Then the system displays a text block containing the explanation field (e.g., "Fastest route. Saves 8 hours compared to rail. Within budget limit.").  

**Business Rules:**  
*   The system must calculate and output a natural language summary that explicitly mentions time savings, cost alignment, and transfers.  

**Dependencies:** ROUTE-001.  
**API References:** POST `/api/v1/transport/analyze` (Response includes `recommendedRoute.reason` or `explanation`)  
**Database References:** TransportOptions Collection (`TransportOptionSchema` fields: `explanation`, `confidenceScore`)  
**UI References:** Route Analysis Page, Recommended Route Card (`#recommended-route`) explanation container  
**Estimate:** Medium  

---

### Story ROUTE-005: Calculate Trip Expenses by Category
**Story ID:** ROUTE-005  
**Epic:** Epic 3: Route Analysis & Transportation Planning  
**Priority:** Medium  

As a traveler,  
I want to see a chart showing my total expenses categorized by transport and activities,  
So that I can visualize where my budget is being allocated.  

**Acceptance Criteria:**  
*   Given a user is on the Budget View page,  
*   When the page loads,  
*   Then the system runs an aggregation pipeline to sum up all transport options and activities costs, returning a breakdown of expenses, and renders a cost breakdown chart.  

**Business Rules:**  
*   The sum must combine both travel segment costs (`estimatedCost`) and daily itinerary item costs (`estimatedCost`).  
*   If a budget is exceeded, the system must trigger a red warning status.  

**Dependencies:** TRIP-003, ROUTE-001.  
**API References:** GET `/api/v1/trips/:tripId/budget-breakdown`  
**Database References:** Trips, TripSegments, Itineraries, Activities Collections; Aggregation Pipeline: `tripBudgetPipeline`  
**UI References:** Budget View Page, Total Summary Widget (`#budget-summary-panel`), `#budget-pie-chart`, `#budget-items-list`  
**Estimate:** Medium  

---

### Story ROUTE-006: Retrieve Nearest Airport/Railway Hub
**Story ID:** ROUTE-006  
**Epic:** Epic 3: Route Analysis & Transportation Planning  
**Priority:** High  

As the routing engine,  
I want to scan for the nearest commercial airports and railway stations within a radius of a destination,  
So that I can calculate transit links for cities without direct connections.  

**Acceptance Criteria:**  
*   Given a destination with no commercial terminal (e.g. Kopargaon or Anakapalle local area),  
*   When the connectivity engine resolves coordinates,  
*   Then the system queries commercial databases to identify the nearest airport within 150km and the nearest railway station within 100km, writing them to the ConnectivityAnalysis database collection.  

**Business Rules:**  
*   If no airport exists in a 150km radius, the search radius must expand dynamically to 300km.  
*   The distance in kilometers must be calculated using geospatial calculations.  

**Dependencies:** ROUTE-001.  
**API References:** POST `/api/v1/analyze-connectivity`  
**Database References:** ConnectivityAnalysis Collection (`nearestAirport`, `nearestRailwayStation`, `distanceKm`)  
**UI References:** Route Analysis Page, Warning overlays, nearby hub badges  
**Estimate:** Large  

---

### Story ROUTE-007: Propose Last-Mile Transport
**Story ID:** ROUTE-007  
**Epic:** Epic 3: Route Analysis & Transportation Planning  
**Priority:** High  

As a traveler going to a remote destination,  
I want the system to suggest local taxi, bus, or shuttle options to cover the gap between the nearest hub and my destination,  
So that I can plan my entire journey end-to-end.  

**Acceptance Criteria:**  
*   Given a user is reviewing segment connectivity details,  
*   When the destination requires traveling from a station or airport (e.g. Kopargaon Station to Shirdi),  
*   Then the system queries local transport routes and appends taxi/bus options with cost and duration to the segment details, displaying them in the list.  

**Business Rules:**  
*   Local transport suggestions must contain both a private option (taxi) and a public option (bus/shuttle) where available.  
*   Last-mile calculations must be included in the total estimated duration of the segment.  

**Dependencies:** ROUTE-006.  
**API References:** POST `/api/v1/analyze-connectivity` (Response contains `localTransportOptions` array)  
**Database References:** ConnectivityAnalysis Collection (`localTransportOptions` array fields: `mode`, `estimatedCost`, `estimatedDurationMinutes`)  
**UI References:** Route Analysis Page, Recommended Route Card (`#recommended-route`), Last-mile transport details panel  
**Estimate:** Medium  

---

### Story ROUTE-008: Map Route Vector Rendering
**Story ID:** ROUTE-008  
**Epic:** Epic 3: Route Analysis & Transportation Planning  
**Priority:** High  

As a traveler reviewing my routes,  
I want to see visual transit polyline vectors and marker pins representing my travel path on an interactive map,  
So that I can understand the geography and direction of my trip.  

**Acceptance Criteria:**  
*   Given a user is on the Route Analysis or Itinerary view page,  
*   When they toggle between segment tabs or day horizontal cards,  
*   Then the system sends the target coordinates to the Mapbox viewport, shifts focus to fit bounds, and renders active markers and route vectors.  

**Business Rules:**  
*   Coordinates must be represented in standard GeoJSON `[longitude, latitude]` format.  
*   Map routes must automatically fall back to city center coordinates if exact venue lookup fails.  

**Dependencies:** TRIP-003.  
**API References:** Mapbox GL JS API integration  
**Database References:** Activities Collection (`location.coordinates` 2dsphere index)  
**UI References:** Itinerary View Page, Right Map Pane (`#mapbox-viewport`), Route Analysis Page right pane (`#map-pane`)  
**Estimate:** Large  

---

### Story ROUTE-009: Update Segment Cost & Duration Manually
**Story ID:** ROUTE-009  
**Epic:** Epic 3: Route Analysis & Transportation Planning  
**Priority:** Low  

As a traveler who has booked private transit,  
I want to manually override and update a segment's cost and duration,  
So that my budget and timeline displays remain accurate.  

**Acceptance Criteria:**  
*   Given a user is viewing their segment details,  
*   When they click the edit button, enter a custom cost and duration, and save the settings,  
*   Then the system updates the segment record in the database, recalculates the trip's overall cost, and returns a successful response.  

**Business Rules:**  
*   Manual overrides take precedence over AI-generated estimates.  
*   Values entered must be positive numbers.  

**Dependencies:** ROUTE-002.  
**API References:** PUT `/api/v1/trips/:tripId/segments/:segmentId`  
**Database References:** TripSegments Collection (`TripSegmentSchema` fields: `estimatedCost`, `estimatedDuration`)  
**UI References:** Route Analysis Page, Segment Tab edit form, `#segment-selector-tabs`  
**Estimate:** Small  

---

### Story ROUTE-010: Cache Segment Transit Analysis Results
**Story ID:** ROUTE-010  
**Epic:** Epic 3: Route Analysis & Transportation Planning  
**Priority:** Medium  

As the system administrator,  
I want to cache transportation search results for 7 days,  
So that duplicate searches for identical routes do not trigger expensive third-party API lookups and cause latency.  

**Acceptance Criteria:**  
*   Given a user initiates a transportation search for a segment on a specific date,  
*   When the search query matches a cached key in the database,  
*   Then the system retrieves the routing data directly from the CachedRoutes collection, bypassing external API calls.  

**Business Rules:**  
*   A cache key must be a unique hash of the origin coordinates, destination coordinates, and travel date.  
*   The `CachedRoutes` collection must enforce a Time-To-Live (TTL) index of 7 days (604,800 seconds) on the `createdAt` timestamp.  

**Dependencies:** ROUTE-001.  
**API References:** POST `/api/v1/transport/analyze` (Internal handler middleware)  
**Database References:** CachedRoutes Collection (`cacheKey`, `routeData`, `createdAt`), TTL Index: `{ createdAt: 1 }` with `expireAfterSeconds: 604800`  
**UI References:** None (Background engine improvement)  
**Estimate:** Medium  
