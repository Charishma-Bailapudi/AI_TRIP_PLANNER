# Epic 4: Connectivity Analysis & Last-Mile Transport - User Stories

---

Story ID: CONN-001
Epic: Epic 4: Connectivity Analysis & Last-Mile Transport
Priority: High

As a Traveler,
I want the system to automatically detect the nearest airport within a 150km radius for destinations that lack direct flight connectivity,
So that I can plan flight travel to the closest transit hub.

Acceptance Criteria:
* Given a user enters a destination city that does not have an active commercial airport in the database
* When the connectivity analysis is run
* Then the system scans all airports within a 150km radius of the destination's geo-coordinates and returns the nearest one, including its name, IATA code, and distance in kilometers.
* Given no airports are found within a 150km radius
* When the system executes the search
* Then it expands the search radius to 300km, tags the returned airport as "Remote Region Hub", and outputs a warning status.

Business Rules:
- Haversine formula must be used to calculate straight-line distances between geo-coordinates.
- If multiple airports are equidistant, prioritize the one with the higher passenger traffic class.
- The default search radius is hardcoded to 150km, and the maximum fallback is 300km.
Dependencies: ROUTE-001, ROUTE-005
API References: `/api/analyze-connectivity` (POST)
Database References: `Airports` table, `Destinations` table
UI References: `#route-analysis-screen`, `#flight-options`, `#recommended-route`
Estimate: Medium

---

Story ID: CONN-002
Epic: Epic 4: Connectivity Analysis & Last-Mile Transport
Priority: High

As a Traveler,
I want the system to automatically identify the nearest operational railway station within a 100km radius for destinations without direct railway access,
So that I can explore rail connectivity options to the nearest hub.

Acceptance Criteria:
* Given a destination city that does not have a direct railway station serving national routes
* When the connectivity analysis runs
* Then the system searches for active railway stations within a 100km radius of the destination coordinates and lists the nearest station with its name, station code, and distance.
* Given no active railway station is found within 100km
* When the system executes the search
* Then it returns an empty station reference and flags the segment as "No Rail Access".

Business Rules:
- Only stations servicing long-distance passenger or express trains are considered active for last-mile rail lookup.
- Search radius is capped at 100km.
Dependencies: ROUTE-003, ROUTE-005
API References: `/api/analyze-connectivity` (POST)
Database References: `RailwayStations` table, `Destinations` table
UI References: `#route-analysis-screen`, `#train-options`, `#recommended-route`
Estimate: Medium

---

Story ID: CONN-003
Epic: Epic 4: Connectivity Analysis & Last-Mile Transport
Priority: Medium

As a Budget-conscious Traveler,
I want to search and view regional public/private bus routing schedules between the nearest transit hub and my final destination,
So that I can save money on last-mile travel using public transit.

Acceptance Criteria:
* Given the distance between a selected transit hub (airport/railway station) and the destination is greater than 15km
* When the user views regional travel options on the Route Analysis screen
* Then the system displays available regional bus routes with operator name, schedule, travel duration, and ticket fare.
* Given the external bus schedule API times out or returns no results
* When the user views regional travel options
* Then the system displays a fallback message suggesting local municipal transit guides and an estimated default fare.

Business Rules:
- Bus route data is fetched from regional transit aggregators and cached locally for 24 hours.
- Only show bus routes that operate within 4 hours of the incoming transit arrival.
Dependencies: CONN-001, CONN-002
API References: `/api/analyze-connectivity` (POST)
Database References: `BusRoutes` table, `Cache` (for API schedules)
UI References: `#route-analysis-screen`, `#train-options`, `#recommended-route`
Estimate: Large

---

Story ID: CONN-004
Epic: Epic 4: Connectivity Analysis & Last-Mile Transport
Priority: High

As a Comfort-oriented Traveler,
I want to see estimated taxi fares from the nearest transit hub to my final destination,
So that I can budget for private last-mile rides and avoid overcharging.

Acceptance Criteria:
* Given a recommended route involves transit from an airport or train station to a remote destination
* When the Route Analysis screen is displayed
* Then the system calculates the driving distance and outputs a private taxi fare estimate in the active currency.
* Given a destination has a dynamic taxi rate coefficient (e.g. night travel or mountainous terrain)
* When calculating the fare
* Then the system applies the multiplier and displays the estimated range with a "Dynamic Pricing" label.

Business Rules:
- Fare Formula: Base Fare + (Distance in km * Per-km Rate) * Time-of-Day Multiplier.
- Time-of-day multiplier is 1.5x for departures between 22:00 and 05:00.
Dependencies: CONN-001, CONN-002
API References: `/api/analyze-connectivity` (POST), External Distance Matrix API
Database References: `RegionalTaxiRates` table, `Trips` table
UI References: `#route-analysis-screen`, `#recommended-route`
Estimate: Medium

---

Story ID: CONN-005
Epic: Epic 4: Connectivity Analysis & Last-Mile Transport
Priority: High

As a Traveler,
I want the AI to display a natural language explanation of why a particular last-mile route was chosen over alternatives,
So that I can make informed decisions about comfort, cost, and time tradeoffs.

Acceptance Criteria:
* Given a multi-segment route has been analyzed
* When the user reviews the Recommended Route Card
* Then the card displays a text explanation (e.g., "Fastest Route: Saves 8 hours compared to train. Within budget limit.") under the `#recommended-route` section.
* Given a change in route preferences (e.g. switching to "Cheapest")
* When the route is updated
* Then the AI recalculates and updates the explanation string dynamically.

Business Rules:
- Rationale must mention: transfer count, estimated time saved vs. secondary option, and budget compliance.
- Explanation generation must execute within 2 seconds.
Dependencies: CONN-001, CONN-002, CONN-004
API References: `/api/analyze-trip` (POST)
Database References: `Trips` table (stores segment JSON)
UI References: `#route-analysis-screen`, `#recommended-route`
Estimate: Medium

---

Story ID: CONN-006
Epic: Epic 4: Connectivity Analysis & Last-Mile Transport
Priority: Low

As an Island/Coastal Traveler,
I want the system to suggest ferry or water transport schedules for destinations separated by water bodies,
So that I can plan transfers to coastal or island resorts that are inaccessible by road.

Acceptance Criteria:
* Given a destination is identified as an island or coastal site lacking direct road connectivity
* When the connectivity analysis runs
* Then the system searches for nearby passenger ferry terminals within a 100km radius and returns active ferry departures, operators, durations, and costs.
* Given no ferry schedule is available for the selected date
* When the search is processed
* Then the system lists the nearest port and displays a message: "Water transit required. Check local harbor schedules."

Business Rules:
- Marine transit analysis triggers if road routing queries return a "No Route Found" error code.
- Port search radius defaults to 100km.
Dependencies: CONN-001, CONN-005
API References: `/api/analyze-connectivity` (POST), Marine Transit API
Database References: `Ports` table, `FerrySchedules` table
UI References: `#route-analysis-screen`, `#recommended-route`
Estimate: Large

---

Story ID: CONN-007
Epic: Epic 4: Connectivity Analysis & Last-Mile Transport
Priority: Medium

As a Traveler,
I want to toggle between "Private Only" and "Public Only" last-mile transit preferences on the Route Analysis screen,
So that the system only recommends transport options that match my preferred travel style.

Acceptance Criteria:
* Given a user is on the Route Analysis screen reviewing recommended segments
* When the user toggles the travel preference filter (e.g., switching to "Public Only")
* Then the system recalculates the recommended route and filters out private taxi/cab segments in favor of regional buses or shuttle connections.
* Given no public transit option exists for a remote destination
* When "Public Only" is toggled
* Then the system displays a warning message stating that a private taxi is mandatory for this segment, showing the taxi option as a fallback.

Business Rules:
- Preference selections are saved to the user session.
- Recalculation must rerun the Route Optimization Pareto frontier search.
Dependencies: CONN-003, CONN-004
API References: `/api/analyze-trip` (POST)
Database References: `Sessions` table (stores user preference state)
UI References: `#route-analysis-screen`, `#recommended-route`
Estimate: Small

---

Story ID: CONN-008
Epic: Epic 4: Connectivity Analysis & Last-Mile Transport
Priority: Low

As an Advanced Traveler,
I want to customize the search radius for airports and railway stations in the settings panel,
So that I can discover flight or train options located further away from my destination.

Acceptance Criteria:
* Given a user opens the routing settings panel
* When the user adjusts the airport search radius slider (from 50km to 300km) or railway radius slider (from 20km to 150km) and saves
* Then the connectivity analysis reruns for all segments, utilizing the newly configured search boundaries.
* Given an invalid custom radius value is submitted
* When the settings are saved
* Then the system displays a validation error and defaults back to the previous settings.

Business Rules:
- Airport search radius boundary constraints: 50km minimum, 300km maximum.
- Railway search radius boundary constraints: 20km minimum, 150km maximum.
Dependencies: CONN-001, CONN-002
API References: `/api/analyze-connectivity` (POST)
Database References: `Sessions` table (stores radius settings)
UI References: `#route-analysis-screen`
Estimate: Small

---

Story ID: CONN-009
Epic: Epic 4: Connectivity Analysis & Last-Mile Transport
Priority: High

As a Visual Planner,
I want to see the last-mile driving or transit path drawn on the interactive map,
So that I can visualize the exact travel route from the arrival hub to my destination.

Acceptance Criteria:
* Given a multi-modal recommended route is displayed on the Route Analysis Screen
* When the user selects a segment
* Then the right map pane renders a dashed polyline connecting the arrival airport/railway station coordinates to the final destination coordinates along local road routes.
* Given the user switches the last-mile transport method (e.g. from Bus to Taxi)
* When the selection updates
* Then the map polyline redraws to reflect the updated route path.

Business Rules:
- Last-mile transit paths must be visually distinct from primary inter-city lines (e.g., blue dashed line for last-mile vs. solid orange line for flights).
- Polyline coordinates must be optimized to compress size before sending to the client browser.
Dependencies: CONN-001, CONN-002, MAPS-001
API References: Mapbox Directions API, Mapbox GL JS
Database References: `Trips` table (stores polyline coordinates)
UI References: `#route-analysis-screen`, `#map-pane`
Estimate: Medium

---

Story ID: CONN-010
Epic: Epic 4: Connectivity Analysis & Last-Mile Transport
Priority: High

As a Traveler,
I want the system to automatically adjust and validate last-mile departure schedules when I change my primary flight or train selections,
So that I have enough layover buffer time to catch my onward connection.

Acceptance Criteria:
* Given a segment has a flight arrival followed by a taxi transit step
* When the user selects a different arrival flight that lands 2 hours later
* Then the system automatically updates the scheduled taxi pickup time and validates that a minimum 30-minute buffer time is maintained.
* Given the new flight landing time leaves less than a 30-minute buffer before the scheduled last-mile departure (e.g. for a fixed bus schedule)
* When the user confirms the flight
* Then the system flags the connection with a red warning badge stating "Insufficient buffer time".

Business Rules:
- Airport transfer minimum buffer: 30 minutes.
- Railway station transfer minimum buffer: 15 minutes.
- Buffer time is defined as: Last-mile scheduled departure time minus Primary transit arrival time.
Dependencies: CONN-004, ROUTE-004
API References: `/api/analyze-trip` (POST)
Database References: `Trips` table (stores itinerary segments timeline)
UI References: `#route-analysis-screen`, `#recommended-route`
Estimate: Medium
