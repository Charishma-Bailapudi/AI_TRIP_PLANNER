# Epic 5: AI Itinerary Generation - Detailed Implementation Tasks

This document details the step-by-step implementation tasks required to deliver the user stories in Epic 5: AI Itinerary Generation.

---

## TSK-ITIN-01: AI Itinerary Generation Core (Gemini Integration)
*   **Epic:** Epic 5: AI Itinerary Generation
*   **Related User Story:** ITIN-001, ITIN-008, ITIN-009
*   **Priority:** High
*   **Purpose:** Build the backend routing logic and Gemini API prompt templates to generate complete, structured day-wise itinerary JSON arrays based on destinations, dates, travel style tags, pacing, and budget.
*   **Inputs:**
    *   `destination` coordinates / city names
    *   `startDate` and `endDate`
    *   `styleTags` (e.g., Nature, Adventure, History, Food)
    *   `budgetTier` (Budget, Moderate, Luxury)
    *   `pacing` (Relaxed, Moderate, Packed)
*   **Process Steps:**
    1.  Design structured prompt templates for Gemini Flash API that explicitly request output matching a predefined JSON schema (no extra Markdown markdown wrappers, only pure JSON).
    2.  Incorporate the `pacing` limits into the prompt dynamically:
        *   **Relaxed:** Max 2 activities, 2 dining items, minimum 1-hour gaps.
        *   **Moderate:** Max 4 activities, 3 dining items, minimum 30-minute gaps.
        *   **Packed:** Max 6 activities, 3 dining items, minimum 15-minute gaps.
    3.  Implement validation logic to compile an exclusion list of already recommended Place IDs and names within the active trip segment to guarantee attraction uniqueness (prevent duplicates).
    4.  Geocode target coordinates returned from Gemini using a geospatial boundary validator to verify place existence.
    5.  Implement backoff retry logic (up to 3 retries) and define a fallback default template containing regional highlights if the API fails or returns invalid schemas.
*   **Outputs:**
    *   `/api/v1/generate-itinerary` (POST endpoint)
    *   Saved records in `ItineraryItems` and `Days` collections
*   **Validation Rules:**
    *   Result dates must match segment bounds exactly.
    *   Every place record must contain valid longitude (-180 to 180) and latitude (-90 to 90) coordinates.
    *   No placeholder text is allowed in descriptions.
*   **Dependencies:** TSK-CONN-01, TSK-TRIP-02
*   **Acceptance Criteria:**
    *   Clicking the routes confirmation triggers the generation API.
    *   JSON schema is validated; errors trigger fallback template with visual notification.
    *   No sightseeing attraction is duplicated on the same trip.
*   **Estimated Complexity:** Large
*   **Estimated Effort:** 3 Days

---

## TSK-ITIN-02: Structured Day-by-Day Timeline UI Rendering
*   **Epic:** Epic 5: AI Itinerary Generation
*   **Related User Story:** ITIN-002, ITIN-005, ITIN-007
*   **Priority:** High
*   **Purpose:** Develop a premium, responsive timeline panel showing activities in chronological order with expansion capability and client-side style tag filtering.
*   **Inputs:**
    *   Itinerary JSON payload (Days and ItineraryItems)
    *   Style filter selections (Nature, Food, etc.)
*   **Process Steps:**
    1.  Create the CSS layout for `#timeline-pane` and timeline node cards (activities, transit, dining, check-ins).
    2.  Write the card component to display name, category icon, duration, cost, and start/end time.
    3.  Add click-to-expand details showing descriptive text (minimum 2 sentences), cost, and a "Show on Map" button.
    4.  Implement client-side style tag filters above the timeline panel. Hide non-matching activity cards visually using CSS transitions.
    5.  Implement client-side sequential sorting by start time.
*   **Outputs:**
    *   Timeline components in the main dashboard UI (`#timeline-pane`)
*   **Validation Rules:**
    *   Filters must execute instantly (sub-second response) without API calls.
    *   Timeline items must not display overlaps in the list order.
*   **Dependencies:** TSK-ITIN-01
*   **Acceptance Criteria:**
    *   Daily timeline lists items in chronological order.
    *   Clicking a card expands it. Selecting filter chips toggles visibility instantly.
*   **Estimated Complexity:** Medium
*   **Estimated Effort:** 2 Days

---

## TSK-ITIN-03: Dining & Lodging Recommendations Integration
*   **Epic:** Epic 5: AI Itinerary Generation
*   **Related User Story:** ITIN-003, ITIN-004
*   **Priority:** Medium
*   **Purpose:** Fetch and render budget-appropriate dining suggestions and hotel options to complete the traveler's schedule.
*   **Inputs:**
    *   Destination city coordinates
    *   User budget settings (Budget, Moderate, Luxury)
    *   Google Places API/Lodging API credentials
*   **Process Steps:**
    1.  Configure Google Places/Lodging lookup clients to fetch restaurants and hotels near destination coordinates.
    2.  Filter results by budget criteria:
        *   **Budget:** Meal <$15, Hotel <$50/night.
        *   **Moderate:** Meal $15-$50, Hotel $50-$200/night.
        *   **Luxury:** Meal >$50, Hotel >$200/night.
    3.  Insert a lodging card at the start of each destination segment stay.
    4.  Schedule dining recommendations chronologically: Breakfast (08:00), Lunch (12:00), Dinner (19:00).
*   **Outputs:**
    *   Dining and lodging entries added to `ItineraryItems`
*   **Validation Rules:**
    *   Hotel suggestions must be within 15km of the city center.
    *   Cost estimates must align with the user's budget tier.
*   **Dependencies:** TSK-ITIN-01, TSK-BUDG-01
*   **Acceptance Criteria:**
    *   Timeline shows hotel details on Day 1 of each destination.
    *   Meal choices correspond to selected budget thresholds.
    *   Updating budget tier dynamically regenerates suggestions.
*   **Estimated Complexity:** Medium
*   **Estimated Effort:** 2 Days

---

## TSK-ITIN-04: AI-Powered Activity Regeneration & Custom Editing
*   **Epic:** Epic 5: AI Itinerary Generation
*   **Related User Story:** ITIN-006, ITIN-005 (conflict warnings)
*   **Priority:** Medium
*   **Purpose:** Allow travelers to replace specific activities using the AI service and manually adjust activity durations with auto-shifting timelines and overlap warning notifications.
*   **Inputs:**
    *   Single activity ID
    *   Exclusion list of already recommended Place IDs
    *   User-defined duration updates
*   **Process Steps:**
    1.  Create POST API endpoint `/api/v1/regenerate-activity` taking the trip ID, activity ID, and exclusion list.
    2.  Query Gemini to retrieve a new alternative activity matching the original start time, duration, and budget.
    3.  Add "Regenerate" controls to the UI timeline cards.
    4.  Build an edit form for duration. Write shifting logic to adjust start/end times of downstream activities automatically.
    5.  Implement a warning modal indicating timeline conflicts if a manual adjustment causes overlaps.
*   **Outputs:**
    *   `/api/v1/regenerate-activity` API endpoint
    *   Interactive duration controls and conflict warning overlays
*   **Validation Rules:**
    *   Max 5 regenerations per card per user session.
    *   Maintain a 15-minute buffer between adjacent activities.
*   **Dependencies:** TSK-ITIN-02
*   **Acceptance Criteria:**
    *   Clicking regenerate swaps card content with a new unique alternative.
    *   Changing duration shifts downstream activities or shows conflict warnings if overlapping.
*   **Estimated Complexity:** Medium
*   **Estimated Effort:** 2 Days

---

## TSK-ITIN-05: Local Destination Guides & Safety Information
*   **Epic:** Epic 5: AI Itinerary Generation
*   **Related User Story:** ITIN-010
*   **Priority:** Low
*   **Purpose:** Display country-specific emergency contacts, local customs, safety guidelines, and tipping norms at the beginning of each destination timeline.
*   **Inputs:**
    *   Destination country code
    *   Database collections for guide metrics
*   **Process Steps:**
    1.  Create the `LocalGuides` database schema (storing country codes, emergency contacts, tipping conventions, custom warnings).
    2.  Write `/api/v1/guides/:cityId` endpoint to fetch destination details.
    3.  Design and render a "Local Guide & Safety" card component at the top of the day's timeline.
    4.  Implement an expandable detail view with direct call buttons for emergency hotlines (Police, Ambulance).
*   **Outputs:**
    *   `LocalGuides` schema and database tables
    *   `/api/v1/guides/:cityId` GET endpoint
    *   Local Guide UI card component
*   **Validation Rules:**
    *   Must display emergency numbers for Police, Ambulance, Fire, and Tourism Helpline.
*   **Dependencies:** TSK-ITIN-01
*   **Acceptance Criteria:**
    *   Top of timeline displays guide card for country.
    *   Clicking expands card, showing accurate tipping rules and verified hotline contacts.
*   **Estimated Complexity:** Small
*   **Estimated Effort:** 1 Day
