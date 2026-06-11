# Maps Integration & Rendering - Task Implementation Documents

This document defines the detailed technical implementation tasks for **Epic 7: Interactive Maps & Visualization**. These tasks cover base map canvas integration, rendering of marker pins and route polylines, auto-zoom logic, directions caching, style selection, state synchronization, geocoding autocomplete, and offline tiles caching.

---

## Task List

### TSK-MAPS-01: Mapbox GL JS Base Canvas & Multi-City Segment Path Visualizer
* **Task ID:** `TSK-MAPS-01`
* **Task Name:** Mapbox GL JS Base Canvas & Multi-City Segment Path Visualizer
* **Epic:** Epic 7: Interactive Maps & Visualization
* **Related User Story:** `MAPS-001`
* **Priority:** High
* **Purpose:** Sets up the Mapbox GL JS map container canvas and draws polyline vector paths representing travel connections across multi-city segments.
* **Inputs:** 
  * `tripId` (MongoDB ObjectId)
  * `TripSegments` collection records (filtered by `tripId`)
  * Mapbox API access token
* **Process Steps:**
  1. Initialize the Mapbox GL JS map instance on the `#mapbox-viewport` element with default style set to dark vector mode.
  2. Write API retrieval logic inside the UI to query `GET /api/v1/maps/route` for segment geometries.
  3. Load returned route coordinate lists and convert them to GeoJSON FeatureCollections containing LineStrings.
  4. Append the LineString sources to the map layout as layers and style them with the primary accent color gradient (indigo-cyan HSL 230 to 180).
  5. Set up dynamic watchers in the React context state; if selected transit routes are updated, trigger immediate redrawing of that specific segment.
* **Outputs:** 
  * Active vector map displaying inter-city path routes on `#mapbox-viewport`.
* **Validation Rules:**
  * Coordinate arrays must consist of valid float arrays: `[longitude, latitude]`.
  * Geometries returned from the API must be saved locally to MongoDB (`CachedRoutes` collection) to minimize external API costs.
* **Dependencies:** `TSK-TRIP-01` (Trip Schema), `TSK-ROUTE-03` (Optimizer)
* **Acceptance Criteria:**
  * The map renders route polyline lines connecting all trip segments.
  * Adjusting transit routes updates the map coordinates instantly without a full page reload.
* **Estimated Complexity:** Medium
* **Estimated Effort:** 2 Days

---

### TSK-MAPS-02: Custom Activity Marker Pins Rendering
* **Task ID:** `TSK-MAPS-02`
* **Task Name:** Custom Activity Marker Pins Rendering
* **Epic:** Epic 7: Interactive Maps & Visualization
* **Related User Story:** `MAPS-002`
* **Priority:** High
* **Purpose:** Plots custom color-coded and icon-coded marker pins on the map view to represent scheduled daily activities.
* **Inputs:** 
  * `itineraryId` (MongoDB ObjectId)
  * `Activities` collection records containing `location.coordinates` and `category`
* **Process Steps:**
  1. Query all activities matching the current `itineraryId` from the database.
  2. Create custom HTML marker elements using React/DOM manipulation.
  3. Apply styling and icons matching the activity category:
     * **Dining:** Green pin with fork/knife icon.
     * **Sightseeing:** Blue pin with historic building icon.
     * **Lodging:** Purple pin with suitcase/bed icon.
     * **Transit Hubs:** Grey pin with train/plane icon.
  4. Instantiate and position Mapbox GL JS `Marker` objects on the viewport map.
  5. Add click event handlers to markers to trigger scroll-focus and highlight states on the corresponding timeline card.
* **Outputs:** 
  * Color-coded category markers rendered at geographic coordinates.
* **Validation Rules:**
  * Coordinates must match GeoJSON `[longitude, latitude]` format.
  * Latitude must range between `[-90, 90]` and longitude between `[-180, 180]`.
* **Dependencies:** `TSK-ITIN-01` (AI Itinerary Generator), `TSK-MAPS-01` (Base Canvas)
* **Acceptance Criteria:**
  * Markers display correct colors and icons matching activity categories.
  * Clicking a map pin correctly links to and highlights the target timeline element.
* **Estimated Complexity:** Medium
* **Estimated Effort:** 2 Days

---

### TSK-MAPS-03: Active-Day Timeline Pin and Path Filter
* **Task ID:** `TSK-MAPS-03`
* **Task Name:** Active-Day Timeline Pin and Path Filter
* **Epic:** Epic 7: Interactive Maps & Visualization
* **Related User Story:** `MAPS-003`
* **Priority:** High
* **Purpose:** Automatically filters map elements to show only the pins and route paths belonging to the day active in the timeline UI.
* **Inputs:** 
  * Timeline state indicator `activeDay` (integer)
  * Activity lists mapped to travel days
* **Process Steps:**
  1. Subscribe the map component to the global state provider (Context API) tracking the active day number.
  2. When the user changes the active day in the scroller (`#day-tabs`), filter map data arrays:
     * Toggle visibility of markers (`marker.addTo(map)` or `marker.remove()`) depending on whether `activity.dayNumber === activeDay`.
     * Modify GeoJSON layer source parameters to show only the selected day's route paths.
  3. If no items are scheduled on the selected day, clear the map and display a centered general overview of the city.
* **Outputs:** 
  * Dynamically filtered map layout.
* **Validation Rules:**
  * Updates must run instantly (under 100ms) to ensure high responsiveness.
  * Day changes must trigger smooth transitions or fade animations on map markers.
* **Dependencies:** `TSK-ITIN-05` (Chronological Schedules), `TSK-MAPS-02` (Markers)
* **Acceptance Criteria:**
  * Switching days in the timeline shows only the markers and paths scheduled for that specific day.
  * View is cleared of unrelated markers, and transitions run smoothly without layout glitches.
* **Estimated Complexity:** Small
* **Estimated Effort:** 1 Day

---

### TSK-MAPS-04: Glassmorphic Interactive Detail Tooltip Popups
* **Task ID:** `TSK-MAPS-04`
* **Task Name:** Glassmorphic Interactive Detail Tooltip Popups
* **Epic:** Epic 7: Interactive Maps & Visualization
* **Related User Story:** `MAPS-004`
* **Priority:** Medium
* **Purpose:** Renders detail overlay tooltips when travelers click on map marker pins.
* **Inputs:** 
  * Marker click event
  * Activity metadata fields: `title`, `category`, `description`, `estimatedDurationMinutes`, `estimatedCost`
* **Process Steps:**
  1. Bind click listeners to Mapbox GL JS markers.
  2. On click, instantiate a Mapbox `Popup` element at the marker location.
  3. Design the popup template using HTML/CSS conforming to the global UI specifications:
     * Surface: Glassmorphic Blue-Grey (`rgba(17, 25, 40, 0.75)`)
     * Backdrop blur filter: `blur(12px)`
     * Border: Translucent Silver
     * Text elements: Title, category badge, short description snippet, duration, cost, and a link to view details in the timeline.
  4. Ensure only one popup can stay open at a time.
  5. Close popup if the close button (`X`) is clicked or if the user clicks anywhere else on the map canvas.
* **Outputs:** 
  * Stylized tooltip box positioned above selected pins.
* **Validation Rules:**
  * Tooltip coordinates must align precisely with the marker anchor point.
  * Text truncation must apply to long description snippets (maximum 80 characters).
* **Dependencies:** `TSK-MAPS-02` (Markers)
* **Acceptance Criteria:**
  * Clicking a pin renders a glassmorphic tooltip with accurate activity details.
  * Popups close successfully on close triggers or background clicks.
* **Estimated Complexity:** Small
* **Estimated Effort:** 1 Day

---

### TSK-MAPS-05: Dynamic Viewport Auto-Fitting (fitBounds)
* **Task ID:** `TSK-MAPS-05`
* **Task Name:** Dynamic Viewport Auto-Fitting (fitBounds)
* **Epic:** Epic 7: Interactive Maps & Visualization
* **Related User Story:** `MAPS-005`
* **Priority:** Medium
* **Purpose:** Automatically adjusts the map camera center and zoom boundaries to fit all daily activities comfortably inside the screen window.
* **Inputs:** 
  * Active day's activity coordinates list
* **Process Steps:**
  1. Collect all coordinate points for the selected day's activities.
  2. If the coordinates list has items, instantiate Mapbox's `LngLatBounds` class.
  3. Loop through and add (`extend`) each coordinate pair to the bounding box.
  4. Call the map instance `.fitBounds()` method, passing the bounds object.
  5. Configure options: `padding: 40` (pixels of spacing on all edges) and `duration: 800` (milliseconds transition time).
* **Outputs:** 
  * Animated camera zoom/pan updates on the map viewport.
* **Validation Rules:**
  * Do not call `.fitBounds()` if the activity list is empty (default to centering on city coordinates).
  * Minimum padding on all edges must be exactly 40 pixels.
* **Dependencies:** `TSK-MAPS-02` (Markers), `TSK-MAPS-03` (Pin Filter)
* **Acceptance Criteria:**
  * The map adjusts zoom and center automatically when a new day loads, positioning all active pins within view.
  * Zoom transitions execute as smooth animations lasting exactly 800ms.
* **Estimated Complexity:** Small
* **Estimated Effort:** 1 Day

---

### TSK-MAPS-06: Mapbox Directions API Integration for Actual Transit Routing
* **Task ID:** `TSK-MAPS-06`
* **Task Name:** Mapbox Directions API Integration for Actual Transit Routing
* **Epic:** Epic 7: Interactive Maps & Visualization
* **Related User Story:** `MAPS-006`
* **Priority:** High
* **Purpose:** Queries realistic road path coordinates rather than simple straight lines to render true travel paths between activities.
* **Inputs:** 
  * Origin coordinates and destination coordinates of consecutive timeline events
  * External Mapbox Directions API endpoint
* **Process Steps:**
  1. Write a server-side endpoint `GET /api/v1/maps/route` that takes coordinates, calls the Mapbox Directions API, and returns geometry details.
  2. Implement caching: before query, hash the coordinates string to search `CachedRoutes` MongoDB collection. Serve cached results if present.
  3. Parse the Directions API response to draw the actual road path geometry on the map canvas.
  4. If the destination requires transit hubs (e.g. airport transfers), plot a train/bus icon marker at the transfer coordinate point.
  5. Implement fallback: if the API query fails, connect points using a dashed straight line.
* **Outputs:** 
  * Detailed road/rail coordinates rendering on the map layer.
* **Validation Rules:**
  * API requests must be throttled to avoid exceeding rate limits.
  * Coordinates must be validated before calling the external API.
* **Dependencies:** `TSK-CONN-01` (Hub Discovery), `TSK-CONN-02` (Taxi Estimation), `TSK-MAPS-01` (Base Canvas)
* **Acceptance Criteria:**
  * Route paths follow real roads instead of direct straight lines.
  * Transit hub nodes are plotted as distinct icons during transfers.
  * Dotted fallback lines connect locations if API requests fail.
* **Estimated Complexity:** Medium
* **Estimated Effort:** 2 Days

---

### TSK-MAPS-07: Map Style Layer Switcher Control
* **Task ID:** `TSK-MAPS-07`
* **Task Name:** Map Style Layer Switcher Control
* **Epic:** Epic 7: Interactive Maps & Visualization
* **Related User Story:** `MAPS-007`
* **Priority:** Low
* **Purpose:** Implements a style switcher control allowing users to toggle the base map style layer (satellite, terrain, vector dark/light styles).
* **Inputs:** 
  * Selected style layer click event
  * Mapbox Style URLs
* **Process Steps:**
  1. Render a layer style control widget (`#map-style-selector`) on the top-right corner of the map viewport.
  2. Implement styling options: "Dark Vector", "Satellite Imagery", "Topographic Terrain".
  3. When a user clicks a style, call the map instance `.setStyle()` method with the corresponding URL style key.
  4. Write style preservation logic: after changing style, re-inject all custom GeoJSON route layers and activity markers so that the user's trip structure stays visible.
  5. Store the selected style code locally in LocalStorage to persist preferences across sessions.
* **Outputs:** 
  * Updated base map layer tiles.
* **Validation Rules:**
  * Styles must swap without losing dynamically drawn route layers or custom marker locations.
* **Dependencies:** `TSK-MAPS-01` (Base Canvas)
* **Acceptance Criteria:**
  * Toggling a selection swaps the base map style.
  * Active route lines and pins remain visible after the style transition.
  * Selected options are cached and restored on next reload.
* **Estimated Complexity:** Small
* **Estimated Effort:** 1 Day

---

### TSK-MAPS-08: Bidirectional Hover Highlighting between Map & Timeline
* **Task ID:** `TSK-MAPS-08`
* **Task Name:** Bidirectional Hover Highlighting between Map & Timeline
* **Epic:** Epic 7: Interactive Maps & Visualization
* **Related User Story:** `MAPS-008`
* **Priority:** Medium
* **Purpose:** Synchronizes hover states between the timeline list cards and map pins to help travelers match activities to coordinates.
* **Inputs:** 
  * Mouseover and mouseleave hover events on map marker elements
  * Mouseover and mouseleave hover events on timeline cards
* **Process Steps:**
  1. In the React timeline container, attach hover listeners (`onMouseEnter`, `onMouseLeave`) to each card using unique item IDs: `#timeline-card-${itemId}`.
  2. When hovered, look up the matching map pin `#map-pin-${itemId}` and trigger styling changes: scale up size by 25% and trigger a CSS bounce animation.
  3. Bind hover events to map marker elements. When hovered, locate the timeline card and apply high-contrast border styles.
  4. Ensure animations are managed via hardware-accelerated CSS properties to prevent performance drops during scroll.
* **Outputs:** 
  * Real-time synchronized hover visual states.
* **Validation Rules:**
  * Highlight states must clear completely when mouse pointer leaves the elements.
* **Dependencies:** `TSK-MAPS-02` (Markers)
* **Acceptance Criteria:**
  * Hovering a timeline card scales up and bounces the corresponding map marker.
  * Hovering a map marker highlights the border of the corresponding timeline card.
* **Estimated Complexity:** Small
* **Estimated Effort:** 1 Day

---

### TSK-MAPS-09: Mapbox Geocoding Autocomplete Location Search Engine
* **Task ID:** `TSK-MAPS-09`
* **Task Name:** Mapbox Geocoding Autocomplete Location Search Engine
* **Epic:** Epic 7: Interactive Maps & Visualization
* **Related User Story:** `MAPS-009`
* **Priority:** High
* **Purpose:** Resolves destinations and coordinates during onboarding using an autocomplete text field powered by Mapbox Geocoding.
* **Inputs:** 
  * User search string (entered in `#autocomplete-places`)
  * Mapbox Geocoding API endpoint
* **Process Steps:**
  1. Build a backend endpoint `GET /api/v1/maps/places` that calls the Mapbox Geocoding API.
  2. Apply debouncing: on the onboarding form field, wait 300ms after user typings stop before sending API requests.
  3. Send request only if the input has 3 or more characters.
  4. Parse geocoding results to extract city names, country details, latitudes, and longitudes.
  5. Render results in a dropdown list. Clicking an entry fills the field, sets the state, and caches coordinates in session storage.
* **Outputs:** 
  * Autocomplete result list containing city names and coordinate metadata.
* **Validation Rules:**
  * Debounce timer must reset on new key inputs.
  * Store resolved longitude and latitude values securely in the onboarding state.
* **Dependencies:** None
* **Acceptance Criteria:**
  * Inputting 3+ characters displays autocomplete matches.
  * Selecting a city resolves and stores its exact coordinates for the trip record.
* **Estimated Complexity:** Medium
* **Estimated Effort:** 2 Days

---

### TSK-MAPS-10: Offline Map Tiles Caching
* **Task ID:** `TSK-MAPS-10`
* **Task Name:** Offline Map Tiles Caching
* **Epic:** Epic 7: Interactive Maps & Visualization
* **Related User Story:** `MAPS-010`
* **Priority:** Low
* **Purpose:** Pre-downloads and stores map vector tiles and routes locally in the browser cache, enabling offline map loading in remote areas.
* **Inputs:** 
  * Bounding coordinates of all scheduled daily activities
  * Download map command trigger
* **Process Steps:**
  1. Implement a Service Worker file configured to intercept network requests.
  2. When the traveler clicks "Download Map Offline", calculate the bounding coordinates of all activity centers.
  3. Pre-fetch vector map tiles for a 10km radius around these coordinate points.
  4. Write vector tiles, style sheets, and route geometry responses into the browser Cache Storage or IndexedDB.
  5. If the application detects offline status, intercept Mapbox requests and serve cached assets from the Service Worker cache.
  6. Display a status bar `#offline-map-toggle` with a badge: "Offline Mode - Cached Map Data".
* **Outputs:** 
  * Local cache files and offline map availability state.
* **Validation Rules:**
  * Limit offline cached map data size to a maximum of 50MB per trip.
  * Offline map features must trigger automatically if network detection queries fail.
* **Dependencies:** `TSK-TRIP-01` (Trip Schema), `TSK-OFFL-01` (Offline Support Cache)
* **Acceptance Criteria:**
  * Map tiles and routes can be successfully pre-downloaded.
  * Disconnecting from the internet and opening the trip page loads cached map coordinates and renders paths successfully.
* **Estimated Complexity:** Large
* **Estimated Effort:** 3 Days
