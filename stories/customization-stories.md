# Epic 8: Trip Customization & Collaboration User Stories

This document compiles the 10 detailed user stories for Epic 8: Trip Customization & Collaboration.

---

Story ID: CUST-001
Epic: Epic 8: Trip Customization & Collaboration
Priority: High

As a traveler,
I want to manually add a custom activity to a specific day's timeline,
So that I can include personal bookings, reservations, or spots not recommended by the AI.

Acceptance Criteria:
* Given an authenticated user is on the Itinerary View Page
* When they click the "Add Activity" button on a daily timeline container (#activity-timeline)
* Then a modal dialog should open containing fields for Title, Category (sightseeing/dining/accommodation), Time Slot, Duration, Cost, Description, and Location Search.
* When they input valid activity details and click "Confirm"
* Then the system must write the activity to the database, render the new activity card in chronological order in the timeline pane, plot the marker pin on the map, and update the budget summary widget.

Business Rules:
* New custom activities must default to an active state.
* The location field must autocomplete using Mapbox geocoding to resolve coordinates.
* The activity cost must be added to the daily and overall trip budgets.

Dependencies: ITIN-001, MAPS-002
API References: POST /api/v1/trips/:tripId/activities
Database References: Activities, Itineraries, Trips
UI References: #activity-timeline, #btn-add-activity, #modal-add-activity
Estimate: Medium

---

Story ID: CUST-002
Epic: Epic 8: Trip Customization & Collaboration
Priority: High

As a traveler,
I want to delete any activity card from my daily schedule,
So that I can remove unwanted sights and optimize my time.

Acceptance Criteria:
* Given an activity card is displayed on the timeline pane
* When the user clicks the "Delete" trash icon on the card (#btn-delete-activity-${itemId})
* Then a confirmation popover must appear asking "Are you sure you want to remove this activity?".
* When the user clicks "Confirm"
* Then the activity card must fade out, the corresponding map marker pin must be removed from the viewport, the route polylines must re-calculate, and the trip budget summary must deduct the activity's cost.

Business Rules:
* Soft delete strategy: Deleted activities must be marked as deleted or permanently removed from the active Itinerary document.
* Recalculations of daily route travel lines must run instantly upon deletion confirmation.

Dependencies: ITIN-001, MAPS-003
API References: DELETE /api/v1/activities/:activityId
Database References: Activities, Itineraries, Trips
UI References: #activity-timeline, #btn-delete-activity
Estimate: Small

---

Story ID: CUST-003
Epic: Epic 8: Trip Customization & Collaboration
Priority: High

As a traveler,
I want to drag and drop activity cards to reorder their daily schedule,
So that I can adjust the pacing and order of my day easily.

Acceptance Criteria:
* Given the daily activity timeline is displayed
* When the user clicks and drags an activity card vertically
* Then the timeline list must display placeholder gaps showing potential landing drop zones.
* When the user drops the card in a new position
* Then the timeline must re-sequence all items, update their estimated start/end time slots, recalculate the map route paths to connect the locations in the new order, and save the sequence order to the database.

Business Rules:
* Drag-and-drop interactions must use Framer Motion and react-beautiful-dnd.
* Reordering must update the sequence field (`sequenceOrder` or index) in the database to persist across sessions.
* Time slots (e.g., "09:00 - 11:30") must be recalculated automatically based on the new order and duration of items.

Dependencies: CUST-001, MAPS-008
API References: PUT /api/v1/trips/:tripId/itinerary/reorder
Database References: Activities, Itineraries
UI References: #activity-timeline, #timeline-card-drag-handle
Estimate: Large

---

Story ID: CUST-004
Epic: Epic 8: Trip Customization & Collaboration
Priority: High

As a traveler,
I want to edit the travel mode or choose alternate transit legs for a segment on the Route Analysis Screen,
So that I can customize how I travel between destinations based on price, speed, or preference.

Acceptance Criteria:
* Given the user is on the Route Analysis Screen review flow
* When the Segment Tabs show transit options
* Then the system must display the "Recommended Route" card along with alternative "Flight Options" and "Train Options" grids.
* When the user selects a train option instead of the recommended flight
* Then the segment total cost and duration must immediately update, and the confirm route action button (#btn-confirm-routes) must save the selected alternative transit option as primary.

Business Rules:
* Changing transit options must instantly update the total cost in the database schema.
* The explainable recommendation text card must update to show comparison metrics (e.g., "You selected Train: Saves $85, but adds 8 hours travel time").

Dependencies: ROUTE-005, CONN-004
API References: PUT /api/v1/trips/:tripId/segments/:segmentId
Database References: TripSegments, TransportOptions, Trips
UI References: #route-analysis-screen, #flight-options, #train-options, #btn-confirm-routes
Estimate: Medium

---

Story ID: CUST-005
Epic: Epic 8: Trip Customization & Collaboration
Priority: Medium

As a traveler,
I want to edit the details of an existing activity card (duration, time slot, cost, and description),
So that I can update it with accurate booking details or notes.

Acceptance Criteria:
* Given a timeline activity card is visible
* When the user clicks the "Edit" pencil icon on the card
* Then an edit form modal must display the pre-filled fields of the activity.
* When the user changes the duration from "120 minutes" to "60 minutes" and inputs a manual cost of "$15" and clicks "Save"
* Then the timeline card must update, the subsequent activity cards must adjust their start times, the total trip budget must increase by $15, and changes must persist in the database.

Business Rules:
* Edits must trigger validation checks: duration and cost must be non-negative numbers.
* The time slot boundary ranges must update chronologically for all subsequent activities on the same day.

Dependencies: CUST-001
API References: PUT /api/v1/activities/:activityId
Database References: Activities, Itineraries, Trips
UI References: #activity-timeline, #btn-edit-activity, #modal-edit-activity
Estimate: Small

---

Story ID: CUST-006
Epic: Epic 8: Trip Customization & Collaboration
Priority: Medium

As a traveler,
I want to move an activity card to another day in the itinerary,
So that I can rearrange which day I visit specific sights depending on local conditions or exhaustion.

Acceptance Criteria:
* Given the user is looking at an activity card on Day 1
* When they click the card actions dropdown and select "Move to Day 2"
* Then the card must be removed from the Day 1 timeline container and appended to the end of the Day 2 timeline.
* When the change completes
* Then both Day 1 and Day 2 map routes and active pins must re-render, and the database must reflect the new day association.

Business Rules:
* Moving an activity must update its `dayNumber` property in the database.
* The system must trigger an automatic recalculation of travel times for both affected days.

Dependencies: CUST-005, MAPS-003
API References: PUT /api/v1/activities/:activityId/move
Database References: Activities, Itineraries
UI References: #activity-timeline, #day-tabs, #btn-move-activity
Estimate: Medium

---

Story ID: CUST-007
Epic: Epic 8: Trip Customization & Collaboration
Priority: Low

As a co-traveler,
I want to see live presence indicators and active avatars of other collaborators viewing the same trip,
So that we can coordinate on planning in real-time without overlapping actions.

Acceptance Criteria:
* Given user Alice is viewing the Trip Dashboard
* When user Bob (invited collaborator) logs in and opens the same Trip Dashboard URL
* Then Alice's screen must display Bob's avatar badge (with name tooltip) in the collaborative toolbar header.
* When Bob moves his cursor or clicks on Day 2
* Then Bob's cursor position or active day focus must render as a color-coded highlight with his name tag on Alice's screen.

Business Rules:
* Live synchronization must utilize WebSockets (Socket.io) with connection heartbeats every 10 seconds.
* Collaborator active statuses must fade out if no socket actions occur within 1 minute.

Dependencies: AUTH-001, TRIP-003
API References: None (WebSocket Event Gateway)
Database References: Trips, Users
UI References: #nav-header, #collaborator-list-bar
Estimate: Large

---

Story ID: CUST-008
Epic: Epic 8: Trip Customization & Collaboration
Priority: Low

As a co-traveler,
I want the system to lock an activity card when another collaborator is currently editing it,
So that we do not overwrite each other's changes.

Acceptance Criteria:
* Given Alice and Bob are collaborating on a trip in real-time
* When Alice clicks "Edit" on the "Sai Baba Temple" activity card
* Then Bob's screen must display a lock icon overlay on that card, and the card's "Edit" and "Delete" buttons must be disabled for Bob.
* When Alice saves her edits or cancels the form
* Then the lock overlay on Bob's screen must disappear, and the card's actions must become clickable again.

Business Rules:
* Lock states must be distributed via WebSockets and expires automatically after 2 minutes if the editing user disconnects or goes idle.
* If a lock is active, any PUT request to that activity from other users must be rejected at the API gateway with a 409 Conflict code.

Dependencies: CUST-005, CUST-007
API References: PUT /api/v1/activities/:activityId (Lock Validation)
Database References: Activities
UI References: #activity-timeline, #lock-overlay-${itemId}
Estimate: Medium

---

Story ID: CUST-009
Epic: Epic 8: Trip Customization & Collaboration
Priority: Medium

As a traveler,
I want to ask the AI to regenerate the recommendations for a single day while keeping my custom activities locked,
So that I can see alternative suggestions without losing my manual adjustments.

Acceptance Criteria:
* Given a trip itinerary contains both AI-generated and custom-added activities on Day 3
* When the user clicks the "Regenerate Day 3" button (#btn-regenerate-day)
* Then the system must lock and protect the custom-added activities.
* When the AI Itinerary agent completes regeneration
* Then all original AI-generated activities on Day 3 must be replaced by new suggestions, while custom-added activities remain in their original chronological order, and the map plots the new coordinate path.

Business Rules:
* The Itinerary Agent prompt must be fed the list of custom activities to ensure the new AI recommendations fit chronologically around the locked items.
* Custom items must not be modified or deleted during the regeneration pipeline.

Dependencies: ITIN-001, CUST-001
API References: POST /api/v1/itinerary/generate (with lockedItems parameter)
Database References: Activities, Itineraries
UI References: #timeline-pane, #btn-regenerate-day
Estimate: Large

---

Story ID: CUST-010
Epic: Epic 8: Trip Customization & Collaboration
Priority: Low

As a traveler,
I want to view a history of edits made to my trip and revert to previous versions,
So that I can recover from accidental deletions or restore the original AI-generated plan.

Acceptance Criteria:
* Given a user has customized their itinerary multiple times
* When they click the "Version History" button in the menu
* Then a slide-over panel must display a chronological log of changes (e.g., "Bob added Sai Heritage Park", "Alice deleted Hotel Shirdi").
* When the user clicks "Restore to original AI plan" and confirms
* Then the system must overwrite all edits, resetting the itinerary and budget metrics to the initial AI-generated output.

Business Rules:
* Reverting must restore the state in both the database and client-side memory.
* Version histories must record the editor's user ID, timestamp, and a snapshot of changes.

Dependencies: CUST-002, CUST-005
API References: GET /api/v1/trips/:tripId/versions, POST /api/v1/trips/:tripId/versions/:versionId/restore
Database References: Itineraries, Activities, Trips
UI References: #sidebar-menu, #version-history-panel
Estimate: Large
