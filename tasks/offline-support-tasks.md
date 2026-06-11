# Epic 10: Offline Access & Synchronization - Detailed Implementation Tasks

This document details the step-by-step implementation tasks required to deliver the user stories in Epic 10: Offline Access & Synchronization.

---

## TSK-OFFL-01: Local Storage & IndexedDB Data Caching Infrastructure
*   **Epic:** Epic 10: Offline Access & Synchronization
*   **Related User Story:** OFFL-001, OFFL-002, OFFL-010
*   **Priority:** High
*   **Purpose:** Set up client-side local caching using LocalStorage (for the active trip layout) and IndexedDB (for complex segments and rich content) with size limit checks and purge controls.
*   **Inputs:**
    *   Trip itinerary JSON records
    *   Cache size query requests
*   **Process Steps:**
    1.  Create helper functions to save the active trip JSON into the browser's `localStorage` under `active_trip_itinerary`.
    2.  Write clear-cache functions that wipe `active_trip_itinerary` immediately upon user logouts.
    3.  Configure IndexedDB schemas with object stores for `trips_cache` (storing complete itinerary arrays and base64 images).
    4.  Implement a Least Recently Used (LRU) cache eviction policy restricting cache size to 10 itineraries, with a 30-day data TTL.
    5.  Build an "Offline Storage" configuration panel in Settings showing total MB used, with a "Clear Cache" button that wipes local caches without altering server databases.
*   **Outputs:**
    *   LocalStorage and IndexedDB setup files (`localStorage.js`, `indexedDb.js`)
    *   Settings cache manager view component
*   **Validation Rules:**
    *   `localStorage` operations must stay under 5MB to avoid browser quota errors.
    *   Clear cache confirmation dialog must warn about unsynced transactions.
*   **Dependencies:** TSK-TRIP-02, TSK-ITIN-02
*   **Acceptance Criteria:**
    *   Running app without internet loads the active itinerary from cache, displaying an "Viewing Offline Cached Data" status banner.
    *   IndexedDB stores up to 10 detailed itineraries with descriptions and images.
    *   Clicking clear cache wipes browser data and resets usage label to "0.00 MB used".
*   **Estimated Complexity:** Medium
*   **Estimated Effort:** 2 Days

---

## TSK-OFFL-02: Network Status Detection, Heartbeat & Offline Banner UI
*   **Epic:** Epic 10: Offline Access & Synchronization
*   **Related User Story:** OFFL-003
*   **Priority:** High
*   **Purpose:** Build a network status notification banner utilizing window events and a periodic heartbeat api request to confirm genuine internet access.
*   **Inputs:**
    *   `window.navigator.onLine` state
    *   Heartbeat ping results
*   **Process Steps:**
    1.  Design a banner component (`#offline-status-banner`) conforming to WCAG AA colors (contrast ratio >= 4.5:1).
    2.  Add event listeners for `online` and `offline` status changes.
    3.  Implement a 5-second interval ping scheduler querying GET `/api/health`. If the ping fails despite `navigator.onLine` showing true (detecting fake Wi-Fi connections), flag the app as offline.
    4.  Update banner: When offline, render a warning banner in orange/yellow; upon reconnecting, display a green success message, starting sync operations, and slide the banner out after 3 seconds.
*   **Outputs:**
    *   Network status React hook/service
    *   `#offline-status-banner` global visual layout component
*   **Validation Rules:**
    *   Ping scheduler must be suspended when the app tab runs in the background.
*   **Dependencies:** None
*   **Acceptance Criteria:**
    *   Losing internet shows the warning banner with text: "You are offline. Viewing cached data. Changes will be saved locally and synced later."
    *   Reconnecting and passing api checks shows a green success banner and slides out in 3 seconds.
*   **Estimated Complexity:** Small
*   **Estimated Effort:** 1 Day

---

## TSK-OFFL-03: Offline Modifications & Local Sync Queue Management
*   **Epic:** Epic 10: Offline Access & Synchronization
*   **Related User Story:** OFFL-005, OFFL-006
*   **Priority:** Medium
*   **Purpose:** Enable users to add, edit, and delete itinerary activities while offline, storing changes in an IndexedDB transaction queue.
*   **Inputs:**
    *   Activity creation/modification form inputs
    *   Active offline mode state
*   **Process Steps:**
    1.  Create an IndexedDB object store named `sync_queue`.
    2.  Implement offline activity creations: Validate inputs, generate temporary UUID (prefix `tmp_`), insert item into UI timeline with a "Pending Sync" warning badge, and add a `CREATE` transaction payload to the queue.
    3.  Implement offline deletes and updates: Update timeline UI, write `DELETE` or `UPDATE` transaction payloads to `sync_queue`.
    4.  Implement queue compression: If an offline-created card (UUID `tmp_...`) is deleted before syncing, delete its original `CREATE` step from the queue. Combine multiple edits of the same card into a single final update transaction.
*   **Outputs:**
    *   IndexedDB `sync_queue` store
    *   Offline mutations handler module
*   **Validation Rules:**
    *   Queued operations must undergo standard schema checks (non-empty title, valid numbers) before queue insertion.
*   **Dependencies:** TSK-OFFL-01
*   **Acceptance Criteria:**
    *   Timeline shows offline additions with a "Pending Sync" warning icon.
    *   Timeline applies deletes and updates instantly while offline.
    *   Transactions queue optimizes itself before sync.
*   **Estimated Complexity:** Medium
*   **Estimated Effort:** 2 Days

---

## TSK-OFFL-04: Web Worker Sync Engine & Server-First Conflict Resolution API
*   **Epic:** Epic 10: Offline Access & Synchronization
*   **Related User Story:** OFFL-007, OFFL-008
*   **Priority:** High
*   **Purpose:** Write a background Web Worker to push queued updates to the server when connection returns and handle timestamp conflict resolution.
*   **Inputs:**
    *   `sync_queue` transaction list
    *   Target database schemas (Trips, Itineraries)
*   **Process Steps:**
    1.  Write a Web Worker file to process `sync_queue` items asynchronously, avoiding interface freezes.
    2.  Write API route `/api/trips/[tripId]/sync` (POST) to receive and process a batch of operations.
    3.  Implement Server-First conflict resolution policy: If a server record has a newer modification timestamp than client's edit start time, reject client update, pull down server state, rewrite local caches, and trigger warning toast.
    4.  If a item has been deleted on the server, reject client changes and delete from client cache.
    5.  Map client temporary IDs (`tmp_`) to final Mongo IDs returned by server and update IndexedDB.
*   **Outputs:**
    *   `syncWorker.js` Web Worker service
    *   `/api/trips/[tripId]/sync` POST endpoint
*   **Validation Rules:**
    *   Sync processing must halt on unexpected network losses and resume from last successful transaction.
*   **Dependencies:** TSK-OFFL-02, TSK-OFFL-03
*   **Acceptance Criteria:**
    *   Going back online runs the sync worker, updates timeline cards to "Synced", and clears the sync queue.
    *   Conflict detection successfully drops outdated client modifications, pulls server data, and alerts the user with toast messages.
*   **Estimated Complexity:** Large
*   **Estimated Effort:** 3 Days

---

## TSK-OFFL-05: Offline Assets & Map Tiles Caching
*   **Epic:** Epic 10: Offline Access & Synchronization
*   **Related User Story:** OFFL-004, OFFL-009
*   **Priority:** Low
*   **Purpose:** Cache PDF documents and map details in IndexedDB to ensure offline accessibility.
*   **Inputs:**
    *   Mapbox tile requests
    *   PDF download streams
*   **Process Steps:**
    1.  Create an IndexedDB store named `map_cache` and register Service Worker cache match rules to intercept Mapbox request handles.
    2.  Restrict map tiles caching to the bounding box of active trip segments and limit zoom levels strictly under 15.
    3.  Update the Mapbox map component to pull cached tiles from `map_cache` when offline.
    4.  When downloading a PDF online, save the binary document Blob in the `trips_cache` IndexedDB store.
    5.  Render a "View PDF" button when offline that opens the cached Blob in the browser's PDF frame.
*   **Outputs:**
    *   IndexedDB `map_cache` store and service worker handlers
    *   Offline PDF retrieval hook
*   **Validation Rules:**
    *   Map caching must not store tiles higher than zoom level 15 to manage browser storage limits.
*   **Dependencies:** TSK-OFFL-01, TSK-EXPT-03
*   **Acceptance Criteria:**
    *   Map pane displays the route segment outlines when offline.
    *   PDF is downloadable online and is openable when offline in the browser viewer.
*   **Estimated Complexity:** Large
*   **Estimated Effort:** 3 Days
