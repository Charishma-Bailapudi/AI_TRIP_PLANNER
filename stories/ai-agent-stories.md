# Epic 11: AI Agent Orchestration - User Stories

This document outlines the detailed user stories, acceptance criteria, business rules, dependencies, and reference specifications for **Epic 11: AI Agent Orchestration**.

---

## Story ID: AGNT-001
### Epic: Epic 11: AI Agent Orchestration
### Priority: High

**User Story:**
As the system,  
I want the Orchestrator Agent to receive the primary user prompt, delegate tasks to subagents in parallel, and aggregate the results,  
So that the user receives a fully integrated itinerary.

**Acceptance Criteria:**
* Given a user submits a trip request containing origins, destinations, dates, budget tier, and travel style tags
* When the backend gateway receives the payload
* Then the Orchestrator Agent must parse the input, initialize the state machine, spawn specialized subagents (Segment Builder, Flight Search, Train Search, Connectivity, Budget, Itinerary, and Recommendation Explanation agents)
* Given all subagents return successful responses
* When the Orchestrator processes the subagents' outputs
* Then it must aggregate the data into a single JSON response that strictly conforms to the `TripItinerary` schema and return it to the API gateway

**Business Rules:**
* The Orchestrator is the sole entry and exit point for itinerary generation requests.
* All data exchanges between the Orchestrator and subagents must run using structured JSON payloads; free-form strings are forbidden.

**Dependencies:** None (Foundational Orchestration Core)
**API References:** `/api/analyze-trip` (POST), `/api/generate-itinerary` (POST)
**Database References:** Trips, TripSegments, CachedRoutes
**UI References:** Onboarding & Search Screen, Trip Planner Dashboard
**Estimate:** Large

---

## Story ID: AGNT-002
### Epic: Epic 11: AI Agent Orchestration
### Priority: High

**User Story:**
As a traveler,  
I want the Segment Builder Agent to parse my list of destinations and dates into chronological segments,  
So that each segment can be analyzed independently.

**Acceptance Criteria:**
* Given the Orchestrator receives a destination list `[Shirdi, Tirupati, Hyderabad]` and origin `Anakapalle` with a trip start date and end date
* When the Orchestrator triggers the Segment Builder Agent
* Then the agent must return a structured JSON array of segment objects: Segment 1 (Anakapalle → Shirdi), Segment 2 (Shirdi → Tirupati), and Segment 3 (Tirupati → Hyderabad)
* Given the segment list is generated
* When setting date ranges for each segment
* Then the agent must assign non-overlapping start/end dates for each destination that sum up to the total trip duration

**Business Rules:**
* Segment generation must follow the exact sequential order defined in the user's destination list.
* Segment date bounds must align with check-in/check-out rules (e.g. Segment N end date equals Segment N+1 start date).

**Dependencies:** AGNT-001
**API References:** Internal Segment Builder microservice
**Database References:** TripSegments
**UI References:** `#destination-list`
**Estimate:** Medium

---

## Story ID: AGNT-003
### Epic: Epic 11: AI Agent Orchestration
### Priority: High

**User Story:**
As a traveler,  
I want the Flight Search Agent to look up flights between segment endpoints,  
So that I can choose the best flights fitting my schedule and budget.

**Acceptance Criteria:**
* Given a segment with source and destination coordinates
* When the Flight Search Agent receives a request from the Orchestrator
* Then it must identify the nearest commercial airports (using IATA codes) for both source and destination
* Given the airports are identified
* When querying flight databases and APIs (Amadeus/Skyscanner)
* Then the agent must filter and return a structured JSON list of flights, including airline name, flight number, departure/arrival times, layovers, and total price in the target currency

**Business Rules:**
* External flight requests must have a strict 10-second timeout limit.
* The agent must retry failed requests up to 3 times using exponential backoff logic before returning an empty array.

**Dependencies:** AGNT-001, AGNT-002
**API References:** `/api/find-flights` (POST), Flight APIs (Amadeus/Skyscanner)
**Database References:** CachedRoutes
**UI References:** `#flight-options`
**Estimate:** Medium

---

## Story ID: AGNT-004
### Epic: Epic 11: AI Agent Orchestration
### Priority: High

**User Story:**
As a traveler,  
I want the Train Search Agent to search for rail connections between segment destinations,  
So that I can explore scenic or budget-friendly train options.

**Acceptance Criteria:**
* Given a segment source and destination
* When the Train Search Agent receives a request
* Then it must query the national railway API (or Rome2Rio) for matching rail routes on the segment date
* Given train routes are available
* When compiling the rail schedules
* Then the agent must return a JSON list of options containing train names/numbers, boarding and deboarding stations, class availability (e.g., Sleeper, AC), duration, departure times, and prices

**Business Rules:**
* Train searches must be cached in the database `CachedRoutes` collections with a 24-hour Time-To-Live (TTL) to avoid redundant API hits.
* If no direct train path is found, the agent must return an empty list.

**Dependencies:** AGNT-001, AGNT-002
**API References:** `/api/find-trains` (POST), Railway API (Rome2Rio)
**Database References:** CachedRoutes
**UI References:** `#train-options`
**Estimate:** Medium

---

## Story ID: AGNT-005
### Epic: Epic 11: AI Agent Orchestration
### Priority: High

**User Story:**
As a traveler visiting a remote location,  
I want the Connectivity Agent to identify nearest airports/railway stations and suggest last-mile taxi/shuttle routes,  
So that I don't get stranded.

**Acceptance Criteria:**
* Given a segment destination has no commercial airport or railway station directly in the city
* When the Connectivity Agent is invoked
* Then it must geocode the destination coordinates and scan for airports within a 150km radius and railway stations within a 100km radius
* Given the nearest hubs are identified
* When calculating last-mile transfers
* Then it must suggest regional public transport (shuttle, local bus) or taxi options, including estimated transfer durations, distances in kilometers, and cost estimates

**Business Rules:**
* The agent must compute routes using the Mapbox Matrix/Directions API.
* If no transit hub exists within primary bounds, the search radius must be expanded to 300km, and a warning flag must be appended to the output JSON.

**Dependencies:** AGNT-001, AGNT-003, AGNT-004
**API References:** `/api/analyze-connectivity` (POST), Mapbox Matrix API
**Database References:** ConnectivityAnalysis
**UI References:** `#recommended-route`
**Estimate:** Medium

---

## Story ID: AGNT-006
### Epic: Epic 11: AI Agent Orchestration
### Priority: Medium

**User Story:**
As a budget-conscious traveler,  
I want the Budget Agent to monitor segment and activity costs and convert currencies,  
So that the recommended trip stays within my specified budget tier.

**Acceptance Criteria:**
* Given the traveler selected a budget tier (Budget, Moderate, Luxury) and target currency (e.g. USD, INR)
* When the Budget Agent receives transit options and itinerary costs from other subagents
* Then it must convert all item prices to the target currency using live exchange rates and aggregate the total estimated cost of the trip
* Given the total cost exceeds the budget tier ceiling
* When compiling final recommendations
* Then the agent must flag the exceeded segments, request the Orchestrator to swap in cheaper transit options, or trim expensive optional activities

**Business Rules:**
* Daily budget ceilings (excluding inter-city flights): Budget (<$50/day), Moderate (<$150/day), Luxury (unlimited).
* Exchange rate data must be cached for 12 hours before fetching updates.

**Dependencies:** AGNT-001, AGNT-003, AGNT-004, AGNT-007
**API References:** `/api/calculate-budget` (POST), Exchange Rate API
**Database References:** Trips
**UI References:** `#select-budget`
**Estimate:** Medium

---

## Story ID: AGNT-007
### Epic: Epic 11: AI Agent Orchestration
### Priority: High

**User Story:**
As a traveler,  
I want the Itinerary Agent to create structured daily sightseeing and dining plans,  
So that I have a rich, personalized daily program.

**Acceptance Criteria:**
* Given a confirmed segment route and dates
* When the Itinerary Agent is triggered by the Orchestrator
* Then it must formulate structured prompts containing destination coordinates, travel style tags, and budget tier, and query the Gemini API
* Given the Gemini response is returned
* When parsing the recommendations
* Then the agent must format the output into a chronological daily array of activity cards, with latitude/longitude coordinates, descriptions, and duration estimates

**Business Rules:**
* Sightseeing activities must be scheduled between 09:00 and 18:00 local time.
* Itinerary items must include designated meal slots: lunch (12:00-14:00) and dinner (19:00-21:00).
* Coordinates of all activity items must be verified against geospatial bounds to prevent AI hallucination of fake coordinates.

**Dependencies:** AGNT-001, AGNT-002, AGNT-006
**API References:** `/api/generate-itinerary` (POST), Gemini API
**Database References:** Itineraries
**UI References:** `#timeline-pane`
**Estimate:** Large

---

## Story ID: AGNT-008
### Epic: Epic 11: AI Agent Orchestration
### Priority: Medium

**User Story:**
As a traveler,  
I want the Recommendation Explanation Agent to write detailed rationales for why specific routes were chosen,  
So that I can understand the trade-offs of cost and duration.

**Acceptance Criteria:**
* Given the primary route recommendations have been selected
* When the Recommendation Explanation Agent is invoked with the recommended route and alternative routes
* Then the agent must write a short natural-language justification detailing speed advantages, cost savings, and layover reductions
* Given the explanation is generated
* When sending the final payload to the user interface
* Then the text must populate the `recommendedRoute.reason` field in the segment JSON

**Business Rules:**
* The explanation string must be concise, not exceeding 150 characters.
* If a route choice is driven entirely by a budget ceiling constraint, the rationale must explicitly state "Chosen to fit within the [BudgetTier] limit".

**Dependencies:** AGNT-001, AGNT-003, AGNT-004, AGNT-005
**API References:** Internal Explanation service, Gemini API
**Database References:** TransportOptions
**UI References:** `#recommended-route` (explanation label)
**Estimate:** Small

---

## Story ID: AGNT-009
### Epic: Epic 11: AI Agent Orchestration
### Priority: Medium

**User Story:**
As a system administrator,  
I want the Orchestrator to validate each agent's output JSON schema and confidence scores, falling back to cached or default choices if an agent fails or reports low confidence,  
So that the service remains reliable.

**Acceptance Criteria:**
* Given a subagent returns its output data payload to the Orchestrator
* When the Orchestrator runs schema validation and parses the `confidenceScore` float (0.0 to 1.0)
* Then if the JSON schema fails or the confidence score is below `0.6`, the Orchestrator must query the database `CachedRoutes` or default templates for that segment
* Given a fallback is successfully triggered
* When returning the response
* Then the response `errors` array must contain an info warning outlining the subagent fallback action, and the event must log in the system telemetry

**Business Rules:**
* Every subagent must return a `confidenceScore` float.
* Minimum acceptable confidence score threshold is `0.6`. Fallback is mandatory below this score.

**Dependencies:** AGNT-001
**API References:** `/api/analyze-trip` (POST)
**Database References:** CachedRoutes, System Logs
**UI References:** System logs / Developer notifications
**Estimate:** Medium

---

## Story ID: AGNT-010
### Epic: Epic 11: AI Agent Orchestration
### Priority: High

**User Story:**
As a traveler,  
I want the Orchestrator Agent to run subagents in parallel and enforce strict time limits (timeouts) on queries,  
So that I get my trip plan generated within 15 seconds.

**Acceptance Criteria:**
* Given the Orchestrator receives a multi-segment trip query
* When starting the analysis pipeline
* Then it must spawn the Flight Search and Train Search agents concurrently using asynchronous promise execution
* Given a subagent API call is hanging
* When the execution time exceeds 10 seconds
* Then the Orchestrator must abort that subagent thread, load cached segment records from the database, and compile the final payload using the fallback data

**Business Rules:**
* The maximum end-to-end response time for any itinerary request must not exceed 15 seconds.
* Subagent execution threads must have a hard timeout boundary at 10 seconds.

**Dependencies:** AGNT-001, AGNT-003, AGNT-004
**API References:** `/api/analyze-trip` (POST)
**Database References:** CachedRoutes
**UI References:** UI loading progress indicators
**Estimate:** Large
