# Trip Management & Trip Segments Implementation Tasks - Epic 2

This document outlines the detailed backend and frontend implementation tasks for Trip Creation & Management, destination segments, and public read-only sharing configurations.

---

## Task List Summary

| Task ID | Task Name | Priority | Complexity | Effort | Dependencies |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TSK-TRIP-01** | Database Schema Design & Mongoose Setup | Critical | Medium | 1 Day | TSK-AUTH-01 |
| **TSK-TRIP-02** | Create Trip API | High | Medium | 2 Days | TSK-TRIP-01, TSK-AUTH-03 |
| **TSK-TRIP-03** | Get Saved Trips List API | High | Small | 1 Day | TSK-TRIP-02 |
| **TSK-TRIP-04** | Fetch Hydrated Trip Details API | High | Large | 2 Days | TSK-TRIP-03 |
| **TSK-TRIP-05** | Update Trip Parameters API | Medium | Medium | 1 Day | TSK-TRIP-04 |
| **TSK-TRIP-06** | Soft Delete Trip API | Medium | Small | 1 Day | TSK-TRIP-03, TSK-TRIP-04 |
| **TSK-TRIP-07** | Add Destination Segment API | Medium | Medium | 1 Day | TSK-TRIP-04 |
| **TSK-TRIP-08** | Remove Segment API | Medium | Medium | 1 Day | TSK-TRIP-07 |
| **TSK-TRIP-09** | Generate Public Share Link API | High | Small | 1 Day | TSK-TRIP-04 |
| **TSK-TRIP-10** | Fetch Shared Trip API (Public View) | High | Medium | 1 Day | TSK-TRIP-09 |
| **TSK-TRIP-11** | Toggle Public Share Link API | Medium | Small | 1 Day | TSK-TRIP-09, TSK-TRIP-10 |
| **TSK-TRIP-12** | Client-Side Trip Dashboard & Onboarding Wizard | High | Large | 3 Days | TSK-TRIP-02, TSK-TRIP-03, TSK-TRIP-04, TSK-TRIP-09, TSK-TRIP-10 |

---

## Detailed Task Specifications

### TSK-TRIP-01: Database Schema Design & Mongoose Setup
*   **Task ID:** TSK-TRIP-01
*   **Task Name:** Database Schema Design & Mongoose Setup
*   **Epic:** Epic 2: Trip Creation & Management
*   **Related User Story:** None (Technical Foundation)
*   **Priority:** Critical / High
*   **Purpose:** Define the MongoDB collection schemas (`TripSchema`, `TripSegmentSchema`, `SharedTripSchema`) using Mongoose, establishing indices, reference relations, and soft-delete pre-hooks.
*   **Inputs:**
    *   Mongoose library dependency
    *   Database connection context
*   **Process Steps:**
    1. Define `TripSchema` inside `src/models/Trip.js` with fields: `userId`, `origin`, `destinationList`, `startDate`, `endDate`, `budgetTier`, `totalCost`, `isDeleted`, `deletedAt`. Add compound index `{ userId: 1 }` and temporal index `{ startDate: 1, endDate: 1 }`.
    2. Define `TripSegmentSchema` inside `src/models/TripSegment.js` with fields: `tripId`, `sequenceOrder`, `source`, `destination`, `estimatedCost`, `estimatedDuration`. Add compound index `{ tripId: 1, sequenceOrder: 1 }`.
    3. Define `SharedTripSchema` inside `src/models/SharedTrip.js` with fields: `tripId`, `shareToken`, `isActive`. Add unique index `{ shareToken: 1 }`.
    4. Implement Mongoose query middleware pre-hooks on `find`, `findOne`, `findOneAndUpdate`, and `countDocuments` for the `TripSchema` to automatically filter out documents where `isDeleted: true`.
*   **Outputs:**
    *   `src/models/Trip.js` (Trip Mongoose model)
    *   `src/models/TripSegment.js` (TripSegment Mongoose model)
    *   `src/models/SharedTrip.js` (SharedTrip Mongoose model)
*   **Validation Rules:**
    *   `Trip.startDate`: valid date, in the future.
    *   `Trip.endDate`: valid date chronologically after `startDate`.
    *   `Trip.destinationList`: required, minimum length of 1 item.
    *   `Trip.budgetTier`: required, enum: `["Budget", "Moderate", "Luxury"]`.
    *   `TripSegment.sequenceOrder`: positive integer, min 0.
    *   `TripSegment.estimatedCost`: min 0.
    *   `TripSegment.estimatedDuration`: min 0.
*   **Dependencies:** TSK-AUTH-01
*   **Acceptance Criteria:**
    *   Schemas compile and register correctly in Mongoose on server initialize.
    *   Validation errors are thrown if any database schema validations are breached (e.g. invalid date sequences or negative segment costs).
    *   Soft delete filters work, hiding trips with `isDeleted: true` from standard find operations.
*   **Estimated Complexity:** Medium
*   **Estimated Effort:** 1 Day

---

### TSK-TRIP-02: Create Trip API
*   **Task ID:** TSK-TRIP-02
*   **Task Name:** Create Trip API
*   **Epic:** Epic 2: Trip Creation & Management
*   **Related User Story:** TRIP-001 (Create a Multi-City Trip Profile)
*   **Priority:** High
*   **Purpose:** Create POST `/api/v1/trips` endpoint allowing authenticated users to create a new trip profile and initialize the corresponding segment structures.
*   **Inputs:**
    *   HTTP Header: `Authorization: Bearer <accessToken>`
    *   JSON payload: `origin`, `destinationList`, `startDate`, `endDate`, `budgetTier`
*   **Process Steps:**
    1. Authenticate user request and fetch `userId` from payload.
    2. Write request body validators ensuring non-empty locations, date validations, and budget tier enums.
    3. Initialize a new Trip document in MongoDB setting `totalCost: 0` and `isDeleted: false`.
    4. Generate initial `TripSegment` documents based on the destinations array. For example, if origin is "Anakapalle" and destinations are `["Shirdi", "Tirupati", "Hyderabad"]`, generate segments:
        *   Segment 0: Anakapalle -> Shirdi
        *   Segment 1: Shirdi -> Tirupati
        *   Segment 2: Tirupati -> Hyderabad
    5. Save segments to `TripSegments` collection.
    6. Return 201 Created standard success response with the new trip object.
*   **Outputs:**
    *   `src/routes/trip.routes.js` (Trip routers)
    *   `src/controllers/trip.controller.js` (Trip controller handlers)
*   **Validation Rules:**
    *   `origin`: required, non-empty.
    *   `destinationList`: array of strings, required, min length 1.
    *   `startDate`: required, valid ISO 8601 date, future date.
    *   `endDate`: required, valid ISO 8601 date, after `startDate`.
    *   `budgetTier`: required, enum: `["Budget", "Moderate", "Luxury"]`.
*   **Dependencies:** TSK-TRIP-01, TSK-AUTH-03
*   **Acceptance Criteria:**
    *   POST `/api/v1/trips` returns 201 Created and standard JSON format on success.
    *   Rejects requests with 400 Bad Request if validation rules are violated.
    *   Generates the correct sequence of `TripSegment` documents in the database corresponding to destinations.
*   **Estimated Complexity:** Medium
*   **Estimated Effort:** 2 Days

---

### TSK-TRIP-03: Get Saved Trips List API
*   **Task ID:** TSK-TRIP-03
*   **Task Name:** Get Saved Trips List API
*   **Epic:** Epic 2: Trip Creation & Management
*   **Related User Story:** TRIP-002 (Retrieve Saved Trips List)
*   **Priority:** High
*   **Purpose:** Create GET `/api/v1/trips` endpoint returning a paginated, sorted list of saved, active trips owned by the user.
*   **Inputs:**
    *   HTTP Header: `Authorization: Bearer <accessToken>`
    *   Query parameters: `page`, `limit`
*   **Process Steps:**
    1. Authenticate request and extract `userId`.
    2. Extract parameters `page` (default 1) and `limit` (default 10, max 100).
    3. Execute query: `Trip.find({ userId, isDeleted: false })`.
    4. Apply pagination offsets (skip/limit) and sort results by `startDate` in ascending order.
    5. Perform count queries to find the total count of user's active trips.
    6. Return 200 OK standard success response containing the `trips` list and `pagination` details (current page, total items, limit, total pages).
*   **Outputs:**
    *   `src/controllers/trip.controller.js` (List trips method)
*   **Validation Rules:**
    *   `page`: positive integer, min 1.
    *   `limit`: positive integer, max 100.
*   **Dependencies:** TSK-TRIP-02
*   **Acceptance Criteria:**
    *   GET `/api/v1/trips` returns 200 OK and matching trips list on valid token.
    *   Returns empty list with 200 OK if user has no saved trips.
    *   Excluded soft-deleted trips from list.
*   **Estimated Complexity:** Small
*   **Estimated Effort:** 1 Day

---

### TSK-TRIP-04: Fetch Hydrated Trip Details API
*   **Task ID:** TSK-TRIP-04
*   **Task Name:** Fetch Hydrated Trip Details API
*   **Epic:** Epic 2: Trip Creation & Management
*   **Related User Story:** TRIP-003 (Fetch Single Trip Details (Hydrated))
*   **Priority:** High
*   **Purpose:** Create GET `/api/v1/trips/:tripId` endpoint returning detailed metadata, segments, itineraries, and activities joined together via MongoDB aggregation lookup.
*   **Inputs:**
    *   HTTP Header: `Authorization: Bearer <accessToken>`
    *   Path parameter: `tripId`
*   **Process Steps:**
    1. Authenticate user request and check `userId`.
    2. Validate `tripId` route param.
    3. Verify user ownership of the trip, or check if active sharing token permits read access. If unauthorized, return 404 Not Found.
    4. Implement and run aggregation pipeline (`tripDetailPipeline`):
        *   Match trip by ID.
        *   Lookup segments from `tripsegments` collection.
        *   Lookup itinerary from `itineraries` collection.
        *   Lookup activities from `activities` collection.
        *   Lookup sharing configuration from `sharedtrips` collection.
        *   Project formatted payload, sorting segments ascending by `sequenceOrder` and activities by `dayNumber`.
    5. Return 200 OK standard success response with hydrated trip payload.
*   **Outputs:**
    *   `src/queries/tripDetails.query.js` (Aggregation pipeline query logic)
    *   `src/controllers/trip.controller.js` (Retrieve single trip details method)
*   **Validation Rules:**
    *   `tripId`: must be a valid MongoDB ObjectId.
*   **Dependencies:** TSK-TRIP-03
*   **Acceptance Criteria:**
    *   Endpoint returns 200 OK with fully hydrated data (nested segments, activities, itinerary).
    *   Returns 404 Not Found if `tripId` is missing, invalid, or belongs to another user.
*   **Estimated Complexity:** Large
*   **Estimated Effort:** 2 Days

---

### TSK-TRIP-05: Update Trip Parameters API
*   **Task ID:** TSK-TRIP-05
*   **Task Name:** Update Trip Parameters API
*   **Epic:** Epic 2: Trip Creation & Management
*   **Related User Story:** TRIP-004 (Update Trip Parameters)
*   **Priority:** Medium
*   **Purpose:** Create PUT `/api/v1/trips/:tripId` endpoint allowing owners to update core trip metadata (dates, budget tier) and trigger budget recalculations.
*   **Inputs:**
    *   HTTP Header: `Authorization: Bearer <accessToken>`
    *   Path parameter: `tripId`
    *   JSON payload: `startDate`, `endDate`, `budgetTier`
*   **Process Steps:**
    1. Authenticate request and verify trip ownership.
    2. Validate incoming fields: check that `endDate` is chronologically after `startDate`.
    3. Update the trip document in database using `Trip.findByIdAndUpdate`.
    4. Return 200 OK standard success response containing the updated trip document.
*   **Outputs:**
    *   `src/controllers/trip.controller.js` (Trip update method)
*   **Validation Rules:**
    *   `startDate`: ISO 8601 date, optional.
    *   `endDate`: ISO 8601 date, optional, must be after `startDate`.
    *   `budgetTier`: optional, enum `["Budget", "Moderate", "Luxury"]`.
*   **Dependencies:** TSK-TRIP-04
*   **Acceptance Criteria:**
    *   Successfully updates the trip parameters in the database and returns 200 OK.
    *   Rejects requests with 400 Bad Request if validation rules are violated.
    *   Non-owners are blocked from updating with a 403 Forbidden.
*   **Estimated Complexity:** Medium
*   **Estimated Effort:** 1 Day

---

### TSK-TRIP-06: Soft Delete Trip API
*   **Task ID:** TSK-TRIP-06
*   **Task Name:** Soft Delete Trip API
*   **Epic:** Epic 2: Trip Creation & Management
*   **Related User Story:** TRIP-005 (Soft Delete a Trip)
*   **Priority:** Medium
*   **Purpose:** Create DELETE `/api/v1/trips/:tripId` endpoint to soft-delete trip records, recording deactivation timestamps and invalidating active share links.
*   **Inputs:**
    *   HTTP Header: `Authorization: Bearer <accessToken>`
    *   Path parameter: `tripId`
*   **Process Steps:**
    1. Authenticate request and verify trip ownership.
    2. Update trip document in database: set `isDeleted` to `true` and `deletedAt` to current date-time.
    3. Query database to find matching `SharedTrip` record and set `isActive` to `false`.
    4. Return 200 OK standard success response.
*   **Outputs:**
    *   `src/controllers/trip.controller.js` (Trip delete method)
*   **Validation Rules:**
    *   `tripId`: must be valid format.
*   **Dependencies:** TSK-TRIP-03, TSK-TRIP-04
*   **Acceptance Criteria:**
    *   Toggles `isDeleted: true` in database and returns 200 OK.
    *   Subsequent list or detail calls cannot retrieve this trip.
    *   Associated share links are deactivated and return 404/expired errors.
*   **Estimated Complexity:** Small
*   **Estimated Effort:** 1 Day

---

### TSK-TRIP-07: Add Destination Segment API
*   **Task ID:** TSK-TRIP-07
*   **Task Name:** Add Destination Segment API
*   **Epic:** Epic 2: Trip Creation & Management
*   **Related User Story:** TRIP-006 (Add a Destination Segment dynamically)
*   **Priority:** Medium
*   **Purpose:** Create POST `/api/v1/trips/:tripId/segments` endpoint to append travel legs dynamically to a trip, maintaining ordering sequences.
*   **Inputs:**
    *   HTTP Header: `Authorization: Bearer <accessToken>`
    *   Path parameter: `tripId`
    *   JSON payload: `source`, `destination`
*   **Process Steps:**
    1. Authenticate request and verify trip ownership.
    2. Count existing segments of the trip to assign sequence order `sequenceOrder = currentCount`.
    3. If `source` is empty, query database for the segment with the highest sequence order and use its `destination` as default source.
    4. Create and save the new `TripSegment` document in database.
    5. Recalculate trip total cost (`Trip.totalCost`) by including new segment's estimated cost.
    6. Return 211 Created standard success response with new segment document details.
*   **Outputs:**
    *   `src/controllers/segment.controller.js` (Segment create method)
*   **Validation Rules:**
    *   `source`: required string.
    *   `destination`: required string.
*   **Dependencies:** TSK-TRIP-04
*   **Acceptance Criteria:**
    *   Endpoint appends segment with correct auto-calculated sequence order.
    *   Rejects request with 400 Bad Request if inputs are missing.
*   **Estimated Complexity:** Medium
*   **Estimated Effort:** 1 Day

---

### TSK-TRIP-08: Remove Segment API
*   **Task ID:** TSK-TRIP-08
*   **Task Name:** Remove Segment API
*   **Epic:** Epic 2: Trip Creation & Management
*   **Related User Story:** TRIP-007 (Remove a Segment from Trip)
*   **Priority:** Medium
*   **Purpose:** Create DELETE `/api/v1/trips/:tripId/segments/:segmentId` endpoint to remove a travel segment and shift sequence orders of remaining legs.
*   **Inputs:**
    *   HTTP Header: `Authorization: Bearer <accessToken>`
    *   Path parameters: `tripId`, `segmentId`
*   **Process Steps:**
    1. Authenticate request and verify trip ownership.
    2. Retrieve target segment using `segmentId`. If not found, return 404.
    3. Record deleted segment's `sequenceOrder` and `estimatedCost`.
    4. Delete segment document from `TripSegments` collection.
    5. Run database update to decrement `sequenceOrder` by 1 for all remaining segments belonging to the trip where `sequenceOrder` is greater than the deleted segment's order.
    6. Recalculate trip total cost: subtract deleted segment's `estimatedCost` from `Trip.totalCost`.
    7. Return 200 OK standard success response.
*   **Outputs:**
    *   `src/controllers/segment.controller.js` (Segment delete method)
*   **Validation Rules:**
    *   `segmentId`: must belong to the specified `tripId`.
*   **Dependencies:** TSK-TRIP-07
*   **Acceptance Criteria:**
    *   Endpoint deletes segment, shifts subsequent segment sequence orders down, and updates trip total cost.
    *   Returns 404 Not Found if segment ID is invalid or missing.
*   **Estimated Complexity:** Medium
*   **Estimated Effort:** 1 Day

---

### TSK-TRIP-09: Generate Public Share Link API
*   **Task ID:** TSK-TRIP-09
*   **Task Name:** Generate Public Share Link API
*   **Epic:** Epic 2: Trip Creation & Management
*   **Related User Story:** TRIP-008 (Generate Shared Trip Link)
*   **Priority:** High
*   **Purpose:** Create POST `/api/v1/share/:tripId` endpoint to activate public sharing for a trip by creating a secure token mapping.
*   **Inputs:**
    *   HTTP Header: `Authorization: Bearer <accessToken>`
    *   Path parameter: `tripId`
*   **Process Steps:**
    1. Authenticate request and check trip ownership.
    2. Query database for an existing share record for this trip in `SharedTrips` collection.
    3. If active share record exists, reuse and return the existing token.
    4. Generate a cryptographically secure token using Node's `crypto` module (e.g. 16-byte random hex string).
    5. Save a new `SharedTrip` document mapping `tripId`, `shareToken`, and setting `isActive: true`.
    6. Construct public sharing URL: `https://aitripplanner.com/shared/trip_<tripId>?token=<shareToken>`.
    7. Return 200 OK standard success response containing `shareUrl` and `shareToken`.
*   **Outputs:**
    *   `src/controllers/share.controller.js` (Generate share token method)
*   **Validation Rules:**
    *   Token generation must be cryptographically secure and unique.
*   **Dependencies:** TSK-TRIP-04
*   **Acceptance Criteria:**
    *   Endpoint returns 200 OK and share details.
    *   Generating sharing details for the same trip multiple times returns the same token.
    *   Non-owner requests return 403 Forbidden.
*   **Estimated Complexity:** Small
*   **Estimated Effort:** 1 Day

---

### TSK-TRIP-10: Fetch Shared Trip API (Public View)
*   **Task ID:** TSK-TRIP-10
*   **Task Name:** Fetch Shared Trip API (Public View)
*   **Epic:** Epic 2: Trip Creation & Management
*   **Related User Story:** TRIP-009 (Fetch Shared Trip (Public View))
*   **Priority:** High
*   **Purpose:** Create public GET `/api/v1/shared-trips/:shareToken` endpoint to retrieve read-only hydrated details of shared trips.
*   **Inputs:**
    *   Path parameter: `shareToken`
*   **Process Steps:**
    1. Extract `shareToken` parameter.
    2. Query `SharedTrips` collection to find a document matching the token where `isActive: true`. If missing, return 404.
    3. Execute the `tripDetailPipeline` aggregation on the corresponding `tripId` to fetch hydrated metadata, segments, itineraries, and activities.
    4. Remove user sensitive parameters (such as owner's `userId`, email, name details) to guarantee privacy.
    5. Return 200 OK standard success response.
*   **Outputs:**
    *   `src/controllers/share.controller.js` (Fetch shared trip method)
*   **Validation Rules:**
    *   `shareToken`: must be alphanumeric.
*   **Dependencies:** TSK-TRIP-09
*   **Acceptance Criteria:**
    *   Unauthenticated guests can fetch shared trip details using a valid token.
    *   Disabled or non-existent tokens return 404 Not Found.
    *   Response contains no personal identification records.
*   **Estimated Complexity:** Medium
*   **Estimated Effort:** 1 Day

---

### TSK-TRIP-11: Toggle Public Share Link API
*   **Task ID:** TSK-TRIP-11
*   **Task Name:** Toggle Public Share Link API
*   **Epic:** Epic 2: Trip Creation & Management
*   **Related User Story:** TRIP-010 (Toggle/Deactivate Public Share Link)
*   **Priority:** Medium
*   **Purpose:** Create PUT `/api/v1/trips/:tripId/share` endpoint to let owners deactivate or reactivate public share tokens.
*   **Inputs:**
    *   HTTP Header: `Authorization: Bearer <accessToken>`
    *   Path parameter: `tripId`
    *   JSON payload: `isActive`
*   **Process Steps:**
    1. Authenticate request and check trip ownership.
    2. Query `SharedTrips` collection for a document matching the `tripId`. If missing, return 404.
    3. Update `isActive` flag in database.
    4. Return 200 OK standard success response.
*   **Outputs:**
    *   `src/controllers/share.controller.js` (Toggle share status method)
*   **Validation Rules:**
    *   `isActive`: boolean, required.
*   **Dependencies:** TSK-TRIP-09, TSK-TRIP-10
*   **Acceptance Criteria:**
    *   Updates the `isActive` status in database and returns 200 OK.
    *   If set to `false`, public GET requests with this token are blocked.
*   **Estimated Complexity:** Small
*   **Estimated Effort:** 1 Day

---

### TSK-TRIP-12: Client-Side Trip Dashboard & Onboarding Wizard
*   **Task ID:** TSK-TRIP-12
*   **Task Name:** Client-Side Trip Dashboard & Onboarding Wizard
*   **Epic:** Epic 2: Trip Creation & Management
*   **Related User Story:** TRIP-001, TRIP-002, TRIP-003, TRIP-009
*   **Priority:** High
*   **Purpose:** Build frontend dashboard components (saved trips grid, empty state panels), Create Trip wizard (place autocompletes, date picks, budget enums), and Itinerary timeline layouts.
*   **Inputs:**
    *   React/Vite client codebase
    *   Styling components
*   **Process Steps:**
    1. Build Dashboard page: query API to fetch saved trips, render card list grid (`#saved-trips-grid`), and render empty states if user has no trips.
    2. Build Create Trip multi-city wizard panel (`#autocomplete-places`, `#input-dates`, `#select-budget`, `#btn-new-trip`, `#wizard-progress`).
    3. Build hydrated single Itinerary View page including chronological timeline view (`#activity-timeline`), day navigation tabs (`#day-tabs`), Mapbox GL JS map viewport container (`#mapbox-viewport`), and sharing configuration modal (`#btn-copy-link`).
    4. Build public read-only Shared Trip view page displaying timeline layout and map viewport (hiding all edit, add, or delete action buttons).
*   **Outputs:**
    *   `src/components/dashboard/TripList.jsx` (Saved trips list view)
    *   `src/components/trips/CreateTripWizard.jsx` (Onboarding create wizard)
    *   `src/components/trips/ItineraryView.jsx` (Detailed hydrated trip view)
    *   `src/components/trips/SharedItineraryView.jsx` (Read-only shared trip view)
*   **Validation Rules:**
    *   Start date must be in future; end date must be after start date.
    *   Wizard requires origin and at least one destination.
*   **Dependencies:** TSK-TRIP-02, TSK-TRIP-03, TSK-TRIP-04, TSK-TRIP-09, TSK-TRIP-10
*   **Acceptance Criteria:**
    *   Frontend onboarding wizard blocks invalid dates and empty parameters with validation messages.
    *   Dashboard lists active user trips correctly.
    *   Shared public URL displays trip details in read-only mode, hiding all action controls.
*   **Estimated Complexity:** Large
*   **Estimated Effort:** 3 Days
