# User Stories: Epic 2 - Trip Creation & Management

This document outlines the detailed user stories, acceptance criteria, business rules, technical dependencies, database collections, and UI targets for Epic 2.

---

### Story TRIP-001: Create a Multi-City Trip Profile
**Story ID:** TRIP-001  
**Epic:** Epic 2: Trip Creation & Management  
**Priority:** High  

As an authenticated traveler,  
I want to create a new multi-city trip by specifying an origin, a chronological list of destinations, a start date, an end date, and a budget tier,  
So that the system can initialize a trip profile and begin analyzing the travel segments.  

**Acceptance Criteria:**  
*   Given an authenticated user is on the Create Trip onboarding page,  
*   When they enter an origin, add two or more destinations, choose future dates where the end date is after the start date, select a budget tier (Budget, Moderate, or Luxury), and click the create button,  
*   Then the system creates a new trip document in the database, generates the corresponding chronological segment structures, and returns a 201 Created response.  
*   Given a user is trying to create a trip,  
*   When they submit the form without any destinations or with an end date preceding the start date,  
*   Then the system rejects the submission with a 400 Bad Request status code and displays field-specific error messages.  

**Business Rules:**  
*   The start date must be a valid ISO 8601 date set in the future.  
*   The destination list must contain at least 1 destination.  
*   Upon creation, the trip's initial `totalCost` must default to 0.  

**Dependencies:** AUTH-002 (User Login).  
**API References:** POST `/api/v1/trips`  
**Database References:** Trips Collection (`TripSchema` fields: `userId`, `origin`, `destinationList`, `startDate`, `endDate`, `budgetTier`, `totalCost`, `isDeleted`)  
**UI References:** Create Trip Page, `#autocomplete-places`, `#input-dates`, `#select-budget`, `#btn-new-trip`, `#wizard-progress`  
**Estimate:** Large  

---

### Story TRIP-002: Retrieve Saved Trips List
**Story ID:** TRIP-002  
**Epic:** Epic 2: Trip Creation & Management  
**Priority:** High  

As an authenticated traveler,  
I want to view a paginated list of my saved active trips on my dashboard,  
So that I can quickly select and review my upcoming and past travel itineraries.  

**Acceptance Criteria:**  
*   Given an authenticated user is on the Dashboard page,  
*   When the dashboard loads,  
*   Then the system queries the database for all non-deleted trips matching the user's ID, paginates them, and renders them in the Saved Trips Grid.  
*   Given a user has no saved trips in their account,  
*   When the dashboard loads,  
*   Then the system displays an empty state panel prompting the user to create their first trip.  

**Business Rules:**  
*   Standard pagination limits must be between 1 and 100 items, defaulting to 10 per page.  
*   Trips where `isDeleted: true` must be completely omitted from the retrieved list using query middleware.  

**Dependencies:** TRIP-001.  
**API References:** GET `/api/v1/trips` (Query parameters: `page`, `limit`)  
**Database References:** Trips Collection, Index: `{ userId: 1 }`  
**UI References:** Dashboard Page, `#saved-trips-grid`, `#btn-new-trip`  
**Estimate:** Medium  

---

### Story TRIP-003: Fetch Single Trip Details (Hydrated)
**Story ID:** TRIP-003  
**Epic:** Epic 2: Trip Creation & Management  
**Priority:** High  

As an authenticated traveler,  
I want to load all details of a specific trip by its ID,  
So that I can view the complete schedule, transit segments, and daily itinerary activities.  

**Acceptance Criteria:**  
*   Given an authenticated user is on the Dashboard,  
*   When they click on a specific trip card,  
*   Then the system executes an aggregation pipeline to fetch the trip metadata and joins all corresponding segments, daily itinerary theme summaries, and activities, rendering the split Timeline/Map layout.  
*   Given a user attempts to view a trip ID that does not exist or belongs to another user without share permissions,  
*   When the request is processed,  
*   Then the system returns a 404 Not Found error.  

**Business Rules:**  
*   The system must hydrate the trip details using a MongoDB lookup aggregation pipeline.  
*   The segments returned must be sorted in ascending order of their `sequenceOrder`.  

**Dependencies:** TRIP-001, TRIP-002.  
**API References:** GET `/api/v1/trips/:tripId`  
**Database References:** Trips, TripSegments, Itineraries, and Activities Collections; Aggregation Pipeline: `tripDetailPipeline`  
**UI References:** Itinerary View Page, `#activity-timeline`, `#day-tabs`, `#mapbox-viewport`  
**Estimate:** Large  

---

### Story TRIP-004: Update Trip Parameters
**Story ID:** TRIP-004  
**Epic:** Epic 2: Trip Creation & Management  
**Priority:** Medium  

As an authenticated traveler,  
I want to update overall parameters of my trip (such as dates and budget tier),  
So that the system can recalculate transit constraints and budget indicators.  

**Acceptance Criteria:**  
*   Given a user is viewing their Trip Details dashboard,  
*   When they modify the dates or select a different budget tier (e.g., from Moderate to Luxury) and confirm,  
*   Then the system updates the trip document in the database, triggers a recalculation warning, and returns the updated trip object.  

**Business Rules:**  
*   Only the owner of the trip (matching `userId`) can modify its parameters.  
*   Changing dates must trigger validation to verify that the start and end dates remain logically ordered.  

**Dependencies:** TRIP-003.  
**API References:** PUT `/api/v1/trips/:tripId`  
**Database References:** Trips Collection (`TripSchema` fields: `startDate`, `endDate`, `budgetTier`)  
**UI References:** Itinerary View Page, Settings Modal, Budget Selector  
**Estimate:** Medium  

---

### Story TRIP-005: Soft Delete a Trip
**Story ID:** TRIP-005  
**Epic:** Epic 2: Trip Creation & Management  
**Priority:** Medium  

As an authenticated traveler,  
I want to delete a trip that I no longer need,  
So that my dashboard is organized and does not display canceled travel plans.  

**Acceptance Criteria:**  
*   Given a user is on their Dashboard or Trip details page,  
*   When they click the delete trip option and confirm,  
*   Then the system updates the trip's `isDeleted` flag to `true`, records the current timestamp in `deletedAt`, returns a success message, and redirects the user to the Dashboard.  

**Business Rules:**  
*   A soft-deleted trip must not be fetched in standard user dashboard queries.  
*   The delete operation is a soft-delete to allow data restoration if requested within policy thresholds.  

**Dependencies:** TRIP-002, TRIP-003.  
**API References:** DELETE `/api/v1/trips/:tripId`  
**Database References:** Trips Collection (`TripSchema` fields: `isDeleted`, `deletedAt`), Mongoose pre-query filter middleware  
**UI References:** Dashboard Page, Trip Card overlay delete button, confirm dialog  
**Estimate:** Small  

---

### Story TRIP-006: Add a Destination Segment dynamically
**Story ID:** TRIP-006  
**Epic:** Epic 2: Trip Creation & Management  
**Priority:** Medium  

As an authenticated traveler,  
I want to append a new destination segment to my existing trip,  
So that I can expand my multi-city itinerary without starting over.  

**Acceptance Criteria:**  
*   Given a user is viewing a trip details dashboard,  
*   When they click "Add Segment" and enter a source and a destination,  
*   Then the system calculates the correct sequence order, appends a new segment document to the TripSegments collection, triggers route analysis for the new segment, and returns the segment details with a 201 Created status.  

**Business Rules:**  
*   The sequence order must be calculated automatically as `N` where `N` is the current count of segments.  
*   The source of the new segment must default to the destination of the previous segment.  

**Dependencies:** TRIP-003.  
**API References:** POST `/api/v1/trips/:tripId/segments`  
**Database References:** TripSegments Collection (`TripSegmentSchema` fields: `tripId`, `sequenceOrder`, `source`, `destination`, `estimatedCost`, `estimatedDuration`)  
**UI References:** Itinerary View Page, Add Destination Form  
**Estimate:** Medium  

---

### Story TRIP-007: Remove a Segment from Trip
**Story ID:** TRIP-007  
**Epic:** Epic 2: Trip Creation & Management  
**Priority:** Medium  

As an authenticated traveler,  
I want to remove a segment from my multi-city trip,  
So that I can shorten my route if my travel plans change.  

**Acceptance Criteria:**  
*   Given a user is on their Trip Details page reviewing their routing list,  
*   When they click the delete icon on a segment card,  
*   Then the system deletes the corresponding document from the TripSegments collection, updates the sequence order of the remaining segments, and recalculates the overall trip cost.  

**Business Rules:**  
*   Removing a segment must trigger an updates pipeline that shifts the `sequenceOrder` of subsequent segments down by 1.  
*   The overall trip `totalCost` in the Trips collection must be decremented by the estimated cost of the deleted segment.  

**Dependencies:** TRIP-006.  
**API References:** DELETE `/api/v1/trips/:tripId/segments/:segmentId`  
**Database References:** TripSegments Collection, Trips Collection (`totalCost` modification)  
**UI References:** Route Analysis Page, Segment Tab close button, `#segment-selector-tabs`  
**Estimate:** Medium  

---

### Story TRIP-008: Generate Shared Trip Link
**Story ID:** TRIP-008  
**Epic:** Epic 2: Trip Creation & Management  
**Priority:** High  

As an authenticated traveler,  
I want to generate a shareable link for a trip,  
So that my friends and family can view my travel itinerary without requiring an account.  

**Acceptance Criteria:**  
*   Given a user is on their Trip Planner Dashboard,  
*   When they click the "Share Trip" button,  
*   Then the system generates a cryptographically secure token, creates a record in the SharedTrips collection mapping the token to the trip ID, and returns a unique public URL containing the token.  

**Business Rules:**  
*   The share token must be a cryptographically strong random string to prevent URL enumeration.  
*   A trip can only have one active share token. If a token already exists, the system returns the existing active token.  

**Dependencies:** TRIP-003.  
**API References:** POST `/api/v1/trips/:tripId/share`  
**Database References:** SharedTrips Collection (`SharedTripSchema` fields: `tripId`, `shareToken`, `isActive`)  
**UI References:** Itinerary View Page, `#btn-copy-link` modal  
**Estimate:** Small  

---

### Story TRIP-009: Fetch Shared Trip (Public View)
**Story ID:** TRIP-009  
**Epic:** Epic 2: Trip Creation & Management  
**Priority:** High  

As a public viewer (unauthenticated guest),  
I want to open a shared trip link,  
So that I can view the detailed daily itinerary and route map on a read-only dashboard.  

**Acceptance Criteria:**  
*   Given a guest user accesses a shared trip URL (containing the share token),  
*   When the page loads,  
*   Then the system verifies the token, queries the hydrated trip details, and displays the read-only Timeline and Map interface.  
*   Given a guest user accesses a link with an invalid or disabled share token,  
*   When the page loads,  
*   Then the system displays a warning message: "This shared trip link has expired or is invalid."  

**Business Rules:**  
*   The shared view must be strictly read-only. Add, edit, or delete buttons must be hidden.  
*   No personal user information (such as owner's email or other trips) should be exposed.  

**Dependencies:** TRIP-008.  
**API References:** GET `/api/v1/shared-trips/:shareToken`  
**Database References:** SharedTrips Collection, Trips, Itineraries, Activities Collections  
**UI References:** Shared Trip View Page, `#read-only-timeline`, `#mapbox-viewport`, `#btn-download-pdf`  
**Estimate:** Medium  

---

### Story TRIP-010: Toggle/Deactivate Public Share Link
**Story ID:** TRIP-010  
**Epic:** Epic 2: Trip Creation & Management  
**Priority:** Medium  

As the owner of a shared trip,  
I want to deactivate my shared link,  
So that the public URL is disabled and no longer allows public access.  

**Acceptance Criteria:**  
*   Given a logged-in user is viewing the share settings for their trip,  
*   When they toggle off the "Public Link Active" control,  
*   Then the system updates the `isActive` flag of the SharedTrips record to `false` and returns a success response.  
*   Given the link is deactivated,  
*   When a guest attempts to visit the link,  
*   Then they receive a 404/expired error card.  

**Business Rules:**  
*   Only the owner of the trip (matching `userId`) can deactivate the share token.  
*   The SharedTrips record is not deleted, but its `isActive` flag is marked as `false`.  

**Dependencies:** TRIP-008, TRIP-009.  
**API References:** PUT `/api/v1/trips/:tripId/share` (Body: `{ "isActive": false }`)  
**Database References:** SharedTrips Collection (`SharedTripSchema` fields: `isActive`)  
**UI References:** Itinerary View Page, Share settings dialog  
**Estimate:** Small  
