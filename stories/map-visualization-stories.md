# Epic 7: Interactive Maps & Visualization User Stories

This document compiles the 10 detailed user stories for Epic 7: Interactive Maps & Visualization.

---

Story ID: MAPS-001
Epic: Epic 7: Interactive Maps & Visualization
Priority: High

As a traveler,
I want to see my trip segments plotted as path lines on a map,
So that I can visualize the overall geography and transit routes of my multi-city vacation.

Acceptance Criteria:
* Given an authenticated traveler has created a multi-city trip with segments "Anakapalle → Shirdi" and "Shirdi → Tirupati"
* When the user loads the Trip Planner Dashboard or Route Analysis Screen
* Then the Mapbox map should retrieve route coordinates and draw connected polyline paths representing the travel route between Anakapalle, Shirdi, and Tirupati.
* Given a segment has multiple transit route options
* When the user selects an alternative transit option on the Route Analysis Screen
* Then the map polyline path for that segment should immediately update to reflect the new transit route coordinates.

Business Rules:
* Map rendering must be powered by Mapbox GL JS in the web browser.
* Travel paths must use the primary accent color gradient (indigo-cyan HSL 230 to 180) to indicate the active travel leg.
* Geometries returned from the Mapbox Directions API must be cached in the CachedRoutes collection to minimize external API costs.

Dependencies: TRIP-001, ROUTE-005
API References: GET /api/v1/maps/route
Database References: TripSegments, CachedRoutes
UI References: #map-pane, #mapbox-viewport
Estimate: Medium

---

Story ID: MAPS-002
Epic: Epic 7: Interactive Maps & Visualization
Priority: High

As a traveler,
I want to see custom marker pins on the map for my scheduled daily activities,
So that I can identify where sightseeing and dining spots are located relative to each other.

Acceptance Criteria:
* Given a user has selected a specific day from the timeline
* When the dashboard loads the activities list
* Then the map must render a distinct marker pin for each activity that contains geo-coordinates.
* Given the activity list includes different categories
* When pins are rendered on the map viewport
* Then each pin must display a distinct color-coded icon matching its category (e.g., green fork/knife for dining, blue historic building for sightseeing, purple suitcase for lodging).

Business Rules:
* Activity coordinates must conform to the standard GeoJSON [longitude, latitude] array format.
* Markers must be clickable and highlight the matching timeline card on the timeline pane when clicked.

Dependencies: ITIN-001, MAPS-001
API References: GET /api/v1/trips/:tripId
Database References: Activities, Itineraries
UI References: #mapbox-viewport, #activity-timeline
Estimate: Medium

---

Story ID: MAPS-003
Epic: Epic 7: Interactive Maps & Visualization
Priority: High

As a traveler,
I want the map to automatically filter pins and paths based on the active day I am viewing in the timeline,
So that I do not see a cluttered map with locations from other days.

Acceptance Criteria:
* Given a trip itinerary spanning multiple days is loaded
* When the user clicks on "Day 2" in the day scroller header
* Then the map must hide all marker pins and route lines for Day 1 and Day 3, displaying only the markers and travel routes corresponding to the activities scheduled for Day 2.
* Given no activities are scheduled for a selected day
* When the user switches to that empty day
* Then the map should clear all marker pins and display only a general overview map of the city.

Business Rules:
* The active day filter state must be synchronized across the state provider (Context API) to ensure instant updates.
* Switching days must trigger a smooth transition animation for visible markers.

Dependencies: ITIN-005, MAPS-002
API References: GET /api/v1/trips/:tripId
Database References: Activities, Itineraries
UI References: #day-tabs, #mapbox-viewport, #timeline-pane
Estimate: Small

---

Story ID: MAPS-004
Epic: Epic 7: Interactive Maps & Visualization
Priority: Medium

As a traveler,
I want to click on a map marker pin to see a popup tooltip card with key details about the activity,
So that I can quickly review descriptions, pricing, and transit times without scrolling the timeline.

Acceptance Criteria:
* Given a map marker pin is visible on the Mapbox viewport
* When the user clicks or taps on the pin
* Then a glassmorphic tooltip card must open directly above the marker.
* Given the tooltip is open
* Then it must display the activity title, category, description snippet, estimated duration, cost, and a link to view details in the timeline.
* Given the tooltip is open
* When the user clicks the close icon or clicks anywhere else on the map
* Then the tooltip card must close.

Business Rules:
* Tooltips must use Mapbox GL JS native Popup objects.
* Stylings must match the global design system (Surface styling: Glassmorphic Blue-Grey rgba(17, 25, 40, 0.75) with backdrop-filter: blur(12px) and Translucent Silver border).

Dependencies: MAPS-002
API References: None
Database References: Activities
UI References: #mapbox-viewport, #activity-card-popup
Estimate: Small

---

Story ID: MAPS-005
Epic: Epic 7: Interactive Maps & Visualization
Priority: Medium

As a traveler,
I want the map viewport to automatically adjust its zoom level and center coordinates to fit all daily activities,
So that I don't have to manually zoom and pan to see where things are.

Acceptance Criteria:
* Given a day has multiple activities spread across a city
* When the day is selected or loaded
* Then the map must calculate the bounding box containing all activity coordinates for that day.
* When the bounding box calculation completes
* Then the map viewport must smoothly animate zoom and center parameters to frame all marker pins with a minimum padding of 40 pixels on all sides.

Business Rules:
* The bounding box must be calculated using Mapbox's `LngLatBounds` helper class.
* Viewport adjustments must run using the `.fitBounds()` method with a duration of 800ms.

Dependencies: MAPS-002, MAPS-003
API References: None
Database References: Activities
UI References: #mapbox-viewport
Estimate: Small

---

Story ID: MAPS-006
Epic: Epic 7: Interactive Maps & Visualization
Priority: High

As a traveler,
I want the route line on the map to display road and rail paths rather than simple straight lines,
So that I can see the realistic travel paths and transit hubs.

Acceptance Criteria:
* Given the system is rendering transit legs between destinations or activities
* When coordinates are passed to the map component
* Then the system must query the Mapbox Directions API or display cached route geometries to draw the actual road paths.
* Given a segment includes transit stations (e.g. Kopargaon railway station to Shirdi Temple)
* When rendering the connection
* Then the map must plot the coordinate of the transit hub as a distinct transport icon marker (e.g., train icon) and connect it to the origin and destination.

Business Rules:
* Straight-line fallback: If the route directions API fails or fails to resolve, a dotted straight line must connect the points, and a console warning must be thrown.
* Road-routing queries must be throttled to avoid hitting Mapbox API limits.

Dependencies: CONN-001, CONN-002, MAPS-001
API References: GET /api/v1/maps/route
Database References: CachedRoutes, TripSegments, ConnectivityAnalysis
UI References: #mapbox-viewport
Estimate: Medium

---

Story ID: MAPS-007
Epic: Epic 7: Interactive Maps & Visualization
Priority: Low

As a traveler,
I want to toggle between satellite, terrain, and light/dark vector map themes,
So that I can view my trip plans against different visual details depending on my lighting environment or preference.

Acceptance Criteria:
* Given the user is looking at the map pane
* When the user clicks the map layer switcher control button
* Then a dropdown list containing "Dark Vector (Default)", "Satellite Imagery", and "Topographic Terrain" must expand.
* When the user clicks "Satellite Imagery"
* Then the map must swap its base tile layer to the Mapbox Satellite style while preserving all current custom polylines and markers.

Business Rules:
* The selected style key must be cached locally in browser local storage so it persists across page reloads.
* Swapping styles must preserve all dynamically loaded GeoJSON layers and marker coordinate sources.

Dependencies: MAPS-001
API References: None
Database References: None
UI References: #mapbox-viewport, #map-style-selector
Estimate: Small

---

Story ID: MAPS-008
Epic: Epic 7: Interactive Maps & Visualization
Priority: Medium

As a traveler,
I want the corresponding map pin to highlight or animate when I hover my cursor over a timeline card,
So that I can quickly match the card content to its geographic location.

Acceptance Criteria:
* Given the split-screen dashboard layout is visible
* When the user hovers their mouse pointer over the card for "Sai Baba Temple" in the timeline pane
* Then the marker pin for "Sai Baba Temple" on the map must scale up by 25% and trigger a bounce animation.
* Given a marker pin is hovered on the map viewport
* When the hover event fires
* Then the corresponding activity card in the timeline pane must be styled with a highlighted border.

Business Rules:
* State synchronization must use mouseover/mouseleave event handlers bound to unique IDs (e.g., `#timeline-card-${itemId}` and `#map-pin-${itemId}`).
* Animations must run smoothly using CSS transitions without affecting page scroll performance.

Dependencies: MAPS-002
API References: None
Database References: None
UI References: #activity-timeline, #mapbox-viewport
Estimate: Small

---

Story ID: MAPS-009
Epic: Epic 7: Interactive Maps & Visualization
Priority: High

As a traveler,
I want to search and select locations using autocomplete text boxes during trip onboarding,
So that I can ensure the correct city names and geographic coordinates are added to my itinerary.

Acceptance Criteria:
* Given the user is on the Onboarding/Create Trip screen
* When the user types "Shir" into the destination text box
* Then an autocomplete dropdown list must appear showing matches like "Shirdi, Maharashtra, India" and "Shiraz, Iran".
* When the user clicks on "Shirdi, Maharashtra, India" from the list
* Then the input field must fill with the selection, and the resolved longitude and latitude coordinates must be stored in the session state.

Business Rules:
* Autocomplete queries must trigger only after 3 characters are typed and must be debounced by 300ms to reduce API load.
* Locations must resolve coordinates using the Mapbox Geocoding API.

Dependencies: None
API References: GET /api/v1/maps/places
Database References: None
UI References: #autocomplete-places, #input-origin, #destination-list
Estimate: Medium

---

Story ID: MAPS-010
Epic: Epic 7: Interactive Maps & Visualization
Priority: Low

As a traveler,
I want the map to store and load cached map data and route coordinates offline,
So that I can view my routing maps while traveling in remote areas without cellular data.

Acceptance Criteria:
* Given the user has loaded their trip itinerary while connected to the internet
* When the user toggles the "Download Map Offline" switch
* Then the client application must pre-fetch map vector tiles for a 10km bounding radius around all scheduled activities and store them in the browser's Cache Storage or IndexedDB.
* Given the user is offline (no internet connectivity)
* When they open the itinerary dashboard
* Then the map component must load the cached vector tiles and plot pins and polylines successfully.

Business Rules:
* Vector tile caching must use the Service Worker and Cache API, adhering to storage limits (maximum 50MB per trip).
* A warning badge must appear showing "Offline Mode - Cached Map Data" when offline.

Dependencies: TRIP-001, OFFL-001
API References: None
Database References: CachedRoutes
UI References: #mapbox-viewport, #offline-map-toggle
Estimate: Large
