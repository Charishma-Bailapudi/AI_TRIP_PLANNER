# Epic 10: Offline Access & Synchronization - User Stories

This document outlines the detailed user stories, acceptance criteria, business rules, dependencies, and reference specifications for **Epic 10: Offline Access & Synchronization**.

---

## Story ID: OFFL-001
### Epic: Epic 10: Offline Access & Synchronization
### Priority: High

**User Story:**
As a traveler,  
I want my active itinerary saved to local storage,  
So that I can view it when I lose internet connectivity.

**Acceptance Criteria:**
* Given the traveler has successfully generated or loaded an itinerary in the browser
* When the application finishes rendering the itinerary data
* Then the application must write the complete itinerary JSON object to `localStorage` under the key `active_trip_itinerary`
* Given the traveler opens the app without internet connection
* When the application attempts to fetch the active itinerary
* Then it must check `localStorage`, retrieve `active_trip_itinerary`, and render it on screen with a visual label indicating "Viewing Offline Cached Data"

**Business Rules:**
* The offline local storage cache must only store the active trip itinerary. Older itineraries should be replaced to prevent exceeding the browser's 5MB localStorage limit.
* The local cache must be securely cleared immediately when the user logs out.

**Dependencies:** TRIP-001, TRIP-003, AUTH-001, AUTH-002
**API References:** None (client-side implementation)
**Database References:** Browser `localStorage`
**UI References:** `#dashboard-view`, `#timeline-pane`, `#offline-status-banner`
**Estimate:** Small

---

## Story ID: OFFL-002
### Epic: Epic 10: Offline Access & Synchronization
### Priority: Medium

**User Story:**
As a traveler with complex multi-city trips,  
I want my full itinerary details (including images and activity descriptions) cached in IndexedDB,  
So that I don't run into LocalStorage size limits and can access rich content offline.

**Acceptance Criteria:**
* Given the browser supports IndexedDB
* When a trip itinerary with more than 3 segments is successfully loaded from the server
* Then the application must write the complete itinerary data structure, including base64 encoded activity images, to an IndexedDB object store named `trips_cache`
* Given the traveler has no network connection
* When the traveler navigates through the multi-city itinerary timeline and expand details
* Then the application must query the `trips_cache` object store and render the rich activity descriptions and cached images without lag

**Business Rules:**
* The IndexedDB cache must support a maximum of 10 saved itineraries. When the limit is exceeded, the oldest-modified itinerary must be evicted (Least Recently Used policy).
* Cache entries must expire and be marked for refresh after 30 days.

**Dependencies:** OFFL-001
**API References:** Local asset cache endpoints
**Database References:** IndexedDB (`trips_cache` store)
**UI References:** `#dashboard-view`, `#timeline-pane`
**Estimate:** Medium

---

## Story ID: OFFL-003
### Epic: Epic 10: Offline Access & Synchronization
### Priority: High

**User Story:**
As a traveler,  
I want a visual status banner showing whether the app is offline or online,  
So that I know when I am viewing cached data and when changes will be queued.

**Acceptance Criteria:**
* Given the application is currently running in the browser
* When the browser's `navigator.onLine` status changes to `false` or a server heartbeat ping fails
* Then the application must immediately display a notification banner at the top of the screen reading: "You are offline. Viewing cached data. Changes will be saved locally and synced later."
* Given the offline banner is active
* When network connectivity is restored and a heartbeat ping to `/api/health` succeeds
* Then the banner must change color to green, show "Back online. Syncing changes...", and automatically slide out of view after 3 seconds

**Business Rules:**
* The status banner must meet WCAG AA contrast requirements (minimum 4.5:1 ratio) and use distinct visual indicators (icons and color) for usability.
* Network status detection must combine `navigator.onLine` check with a 5-second interval heartbeat request to handle "lie-fi" situations (connected to Wi-Fi but without internet).

**Dependencies:** None
**API References:** `/api/health` (GET)
**Database References:** None
**UI References:** `#offline-status-banner`
**Estimate:** Small

---

## Story ID: OFFL-004
### Epic: Epic 10: Offline Access & Synchronization
### Priority: High

**User Story:**
As a traveler,  
I want to download my itinerary as a PDF and access it directly within the app offline,  
So that I have a reliable print-friendly fallback.

**Acceptance Criteria:**
* Given the user is on the Trip Planner Dashboard and is online
* When the user clicks the "Download PDF" button
* Then the client must request the PDF generation API and save the binary stream locally in the browser's persistent downloads
* Given the PDF has been downloaded once
* When the user is offline and clicks the "View PDF" button
* Then the application must retrieve the cached PDF blob from IndexedDB and open it in the built-in browser PDF viewer

**Business Rules:**
* The downloaded PDF file name format must be `trip_[tripId]_itinerary.pdf`.
* The PDF layout must automatically adjust to fit standard A4 paper size, with page margins at 1.5cm and numbered footers.

**Dependencies:** TRIP-003, EXPT-002
**API References:** `/api/generate-pdf` (POST)
**Database References:** Trips, IndexedDB (`trips_cache` store)
**UI References:** `#btn-download-pdf` on `#dashboard-view`
**Estimate:** Medium

---

## Story ID: OFFL-005
### Epic: Epic 10: Offline Access & Synchronization
### Priority: Medium

**User Story:**
As a traveler,  
I want to add custom activities to my timeline while offline,  
So that I can capture changes on the go without losing my edits.

**Acceptance Criteria:**
* Given the application is offline (detected via OFFL-003)
* When the user fills out and submits the "Add Custom Activity" form on the timeline
* Then the application must validate inputs client-side, generate a temporary UUID prefixed with `tmp_`, append the activity to the local UI view, and save the transaction object to the `sync_queue` IndexedDB store
* Given the activity is saved locally
* When the timeline pane renders the activity card
* Then it must display a "Pending Sync" warning icon and tooltip on the card

**Business Rules:**
* Offline-created activities must enforce all standard schema validation rules (e.g. non-empty title, positive duration, and numeric cost estimates) before being queued.
* The transaction object in the sync queue must contain the trip ID, action type (`CREATE`), timestamp, temporary ID, and the form data payload.

**Dependencies:** OFFL-002, CUST-001
**API References:** None (client-side validation only)
**Database References:** IndexedDB (`sync_queue` store)
**UI References:** `#modal-add-activity`, `#timeline-pane`
**Estimate:** Medium

---

## Story ID: OFFL-006
### Epic: Epic 10: Offline Access & Synchronization
### Priority: Medium

**User Story:**
As a traveler,  
I want to delete or edit existing activities in my itinerary while offline,  
So that I can keep my travel plans updated in real time.

**Acceptance Criteria:**
* Given the application is offline
* When the user clicks "Delete" on an activity card or edits its description
* Then the application must immediately apply the visual change to the UI timeline, and write an edit or deletion transaction object to the `sync_queue` IndexedDB store
* Given the timeline is displayed
* When an item has been deleted offline
* Then it must remain hidden, and if it was updated, it must display the updated values with a "Pending Sync" badge on its card

**Business Rules:**
* If a user deletes an activity that was created offline (having a `tmp_` ID) before syncing, the system must optimize the queue by deleting the corresponding `CREATE` transaction and skipping the `DELETE` transaction from the `sync_queue`.
* Multiple updates to the same activity card while offline must collapse into a single transaction representing the final state to minimize network payload.

**Dependencies:** OFFL-002, OFFL-005, CUST-002
**API References:** None
**Database References:** IndexedDB (`sync_queue` store)
**UI References:** `#timeline-pane`, `#btn-edit-activity`, `#btn-delete-activity`
**Estimate:** Medium

---

## Story ID: OFFL-007
### Epic: Epic 10: Offline Access & Synchronization
### Priority: High

**User Story:**
As a traveler,  
I want the app to automatically sync my queued offline changes to the backend when a network connection is re-established,  
So that my account is always up-to-date.

**Acceptance Criteria:**
* Given the application contains transactions in the `sync_queue` and was offline
* When the app detects that network connectivity is restored
* Then the sync manager must verify active connection by pinging `/api/health`
* Given the connection is active
* When the sync manager runs the queue processor sequentially
* Then it must POST the queue actions to `/api/trips/[tripId]/sync` in a single batch, receive a `success: true` response containing mapped server-generated IDs, remove successfully processed transactions from the `sync_queue`, and update the UI badges to "Synced"

**Business Rules:**
* Synchronization must run in a background Web Worker to avoid blocking main UI thread interactions.
* If a network interruption occurs mid-sync, the transaction processing must halt at the last completed action and resume once connection is verified again.

**Dependencies:** OFFL-003, OFFL-005, OFFL-006
**API References:** `/api/trips/[tripId]/sync` (POST), `/api/health` (GET)
**Database References:** Trips, TripSegments, Itineraries, IndexedDB (`sync_queue` store)
**UI References:** `#offline-status-banner` (status indicators during sync)
**Estimate:** Large

---

## Story ID: OFFL-008
### Epic: Epic 10: Offline Access & Synchronization
### Priority: Medium

**User Story:**
As a traveler using multiple devices,  
I want the system to handle conflicts gracefully if offline edits conflict with changes made on another device,  
So that my itinerary doesn't get corrupted.

**Acceptance Criteria:**
* Given the sync manager is pushing updates from the `sync_queue` to the server
* When the server determines that an activity has a last-modified timestamp newer than the user's offline edit session start (conflict detected)
* Then the server must respond with a conflict error code, and the client must discard the user's conflicting local update, pull down the latest server itinerary version, rewrite the local IndexedDB cache, and display a warning toast: "Synchronization conflict resolved. Timeline updated with server changes."

**Business Rules:**
* Conflict resolution policy is "Server-First" to protect the integrity of the centralized trip data.
* Deletions on the server always override modifications on the client. If an activity is modified offline but has been deleted on the server, the client must silently delete the item from the local cache and discard the offline edit.

**Dependencies:** OFFL-007
**API References:** `/api/trips/[tripId]/sync` (POST)
**Database References:** Trips, Itineraries, IndexedDB (`trips_cache` store)
**UI References:** Toast Notifications
**Estimate:** Medium

---

## Story ID: OFFL-009
### Epic: Epic 10: Offline Access & Synchronization
### Priority: Low

**User Story:**
As a traveler on the road,  
I want the map coordinates and basic static tiles of my active route segments cached,  
So that I can see my route outline on the map even without cellular service.

**Acceptance Criteria:**
* Given the traveler is online and loads a trip
* When the segment details are rendered
* Then the client must request Mapbox static images or vector tile coordinates matching the bounding box of the segment routes and save them in the IndexedDB `map_cache` store
* Given the app is offline
* When the traveler selects a segment tab and opens the map pane
* Then the map view must render the static boundary image or cached vector routes from `map_cache` and hide the live zoom controls

**Business Rules:**
* Do not cache map zooms higher than level 15 to keep local cache storage footprint low.
* Limit map caching to the active trip and its directly connected segments.

**Dependencies:** OFFL-002, MAPS-001, MAPS-002
**API References:** Mapbox Static Map API / Vector Tile API
**Database References:** IndexedDB (`map_cache` store)
**UI References:** `#map-pane`
**Estimate:** Large

---

## Story ID: OFFL-010
### Epic: Epic 10: Offline Access & Synchronization
### Priority: Low

**User Story:**
As a traveler concerned with device storage,  
I want a setting to clear my offline cached trip data,  
So that I can free up space once my trip is completed.

**Acceptance Criteria:**
* Given the user is on the Settings or Profile screen
* When the user views the "Offline Storage" section
* Then the application must query the storage API and display the total megabytes consumed by IndexedDB cache stores
* Given the display is active
* When the user clicks the "Clear Cache" button and confirms the popup confirmation
* Then the application must delete all records inside `trips_cache`, `map_cache`, and `sync_queue` in IndexedDB, clear `localStorage` active trip keys, and update the display label to "0.00 MB used"

**Business Rules:**
* Clearing the cache must only affect local browser storage; it must not delete or modify any trips, segments, or profiles saved on the server database.
* The confirmation popup must explicitly state that outstanding queued changes that have not synced will be lost.

**Dependencies:** OFFL-001, OFFL-002
**API References:** None
**Database References:** LocalStorage, IndexedDB (`trips_cache`, `map_cache`, `sync_queue`)
**UI References:** Settings/Profile Screen, `#btn-clear-cache`, `#storage-usage-lbl`
**Estimate:** Small
