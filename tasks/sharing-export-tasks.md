# Epic 9: Sharing & Export - Detailed Implementation Tasks

This document details the step-by-step implementation tasks required to deliver the user stories in Epic 9: Sharing & Export.

---

## TSK-EXPT-01: Cryptographic Trip Sharing & Revocation API
*   **Epic:** Epic 9: Sharing & Export
*   **Related User Story:** EXPT-001, EXPT-004
*   **Priority:** High
*   **Purpose:** Build backend endpoints and schema controls to generate cryptographically secure read-only shared links and handle instant revocation.
*   **Inputs:**
    *   `tripId` of the target trip
    *   Authentication headers of the owner
    *   State flag (`isActive`)
*   **Process Steps:**
    1.  Create the `SharedTrips` database schema referencing `tripId` with fields for `shareToken` (cryptographically random string), `isActive` (boolean), and timestamps.
    2.  Write POST `/api/v1/share/:tripId` to generate a new crypto share token and save it to the collection.
    3.  Write POST `/api/v1/share/:tripId/revoke` (or DELETE `/api/v1/share/:tripId`) to update `isActive` to false, disabling the token immediately.
    4.  Develop routing middleware that resolves shareToken requests and fetches associated Trip data, skipping any token validation for owners but checking `isActive` status for anonymous visitors.
*   **Outputs:**
    *   `SharedTrips` schema definition
    *   `/api/v1/share/:tripId` (POST) and `/api/v1/share/:tripId/revoke` (POST) API endpoints
*   **Validation Rules:**
    *   Share tokens must be generated using `crypto.randomBytes(32).toString('hex')` or equivalent.
    *   Invalidated or inactive tokens must instantly return HTTP 404 / Forbidden.
*   **Dependencies:** TSK-TRIP-02, TSK-ITIN-01
*   **Acceptance Criteria:**
    *   Toggling "Share Trip" on generates a valid, unique URL containing the token.
    *   Revoking the link instantly blocks access to that URL.
*   **Estimated Complexity:** Medium
*   **Estimated Effort:** 2 Days

---

## TSK-EXPT-02: Read-Only Shared Trip Dashboard & Template Duplication
*   **Epic:** Epic 9: Sharing & Export
*   **Related User Story:** EXPT-001, EXPT-009
*   **Priority:** High
*   **Purpose:** Build a read-only viewer dashboard layout for shared links, and implement duplicate logic so logged-in visitors can clone the trip.
*   **Inputs:**
    *   `shareToken`
    *   Viewer's authenticated session (optional)
*   **Process Steps:**
    1.  Create a dashboard layout variant (`#shared-trip-view`) that strips out all edit buttons, draghandles, delete options, settings toggles, and adding forms.
    2.  Render the chronological daily timeline pane and Mapbox canvas in read-only mode.
    3.  Implement a "Copy Trip to My Profile" button (`#btn-copy-trip`) that shows only if a visitor JWT is present.
    4.  Write POST `/api/v1/trips/copy` to duplicate the Trip details, TripSegments, and Activities records, generating a new `tripId` linked to the visitor's `userId`.
*   **Outputs:**
    *   `#shared-trip-view` frontend component layout
    *   `/api/v1/trips/copy` POST endpoint
*   **Validation Rules:**
    *   Copied trips must have new unique Mongo ObjectIDs.
    *   All edits must be blocked on the shared layout.
*   **Dependencies:** TSK-EXPT-01
*   **Acceptance Criteria:**
    *   Non-logged-in users can load the read-only dashboard without authentication screens.
    *   Clicking the copy button successfully adds an identical editable trip to the viewer's profile.
*   **Estimated Complexity:** Medium
*   **Estimated Effort:** 2 Days

---

## TSK-EXPT-03: Server-Side PDF Generation Engine
*   **Epic:** Epic 9: Sharing & Export
*   **Related User Story:** EXPT-002, EXPT-005
*   **Priority:** High
*   **Purpose:** Establish server-side Puppeteer rendering to download detailed itinerary PDFs and design clean CSS print sheets.
*   **Inputs:**
    *   `tripId`
    *   CSS Print stylesheet rules
*   **Process Steps:**
    1.  Install Puppeteer dependencies on the backend server.
    2.  Implement `/api/v1/export/pdf` endpoint which launches a headless Chromium instance, navigates to a print-optimized dashboard layout, and extracts a PDF stream buffer.
    3.  Configure server-side cache headers on the PDF buffer, invalidating on itinerary modifications.
    4.  Create print-style stylesheets using CSS `@media print` rules.
    5.  Force `#sidebar-menu`, `#mapbox-viewport`, and `#btn-add-activity` to `display: none !important`. Set page margins to 1.5cm and split timeline days cleanly for A4 paper.
*   **Outputs:**
    *   `/api/v1/export/pdf` POST endpoint
    *   CSS print rules inside global stylesheet
*   **Validation Rules:**
    *   PDF download filenames must be formatted as `trip_[tripId]_itinerary.pdf`.
    *   Print preview text colors must enforce high-contrast black text on white backgrounds.
*   **Dependencies:** TSK-ITIN-01
*   **Acceptance Criteria:**
    *   Clicking "Download PDF" downloads a formatted document containing trip dates, segments, timeline events, and budgets.
    *   Ctrl+P print previews display cleanly without site navigation bars or blank map wrappers.
*   **Estimated Complexity:** Large
*   **Estimated Effort:** 3 Days

---

## TSK-EXPT-04: Multi-Format Export Utilities (iCalendar, CSV, Google Maps Link)
*   **Epic:** Epic 9: Sharing & Export
*   **Related User Story:** EXPT-003, EXPT-007, EXPT-008
*   **Priority:** Medium
*   **Purpose:** Write backend/frontend exporters for .ics calendar streams, CSV budget sheets, and direct Google Maps route links.
*   **Inputs:**
    *   Trip segment and activities data lists
    *   Trip ID
*   **Process Steps:**
    1.  Write GET `/api/v1/export/calendar/:tripId` using `ics` library to compile all flights, trains, hotel check-ins, and daily activities with timezone compliance.
    2.  Write GET `/api/v1/export/csv/:tripId` generating a CSV file with columns: Day Number, Date, Item Type, Category, Item Title, Details, and Estimated Cost.
    3.  Write client-side utility to compile all geocoded coordinates for a day and format a directional URL: `https://www.google.com/maps/dir/?api=1&origin=lat,lng&destination=lat,lng&waypoints=lat,lng|lat,lng...`.
    4.  Place trigger buttons `#btn-export-ics`, `#btn-export-csv`, and `#btn-google-maps-sync` in dashboard timeline.
*   **Outputs:**
    *   `/api/v1/export/calendar/:tripId` (GET) endpoint
    *   `/api/v1/export/csv/:tripId` (GET) endpoint
    *   Google Maps directions URL string generator
*   **Validation Rules:**
    *   ICS date formatting must adhere strictly to RFC 5545 standard.
    *   CSV files must be UTF-8 encoded.
*   **Dependencies:** TSK-ITIN-05, TSK-BUDG-01
*   **Acceptance Criteria:**
    *   Calendar ICS file imports into Google Calendar or Outlook without parsing errors.
    *   Budget CSV exports open cleanly in spreadsheet software.
    *   Clicking the navigation link correctly opens Google Maps in a new tab displaying the daily route.
*   **Estimated Complexity:** Medium
*   **Estimated Effort:** 2 Days

---

## TSK-EXPT-05: Background Mail Queue & Scheduled Trip Digest Cron
*   **Epic:** Epic 9: Sharing & Export
*   **Related User Story:** EXPT-006, EXPT-010
*   **Priority:** Medium
*   **Purpose:** Implement an email message queue (BullMQ/Redis) for invitations and set up a daily scheduled cron task to email PDF digests 24 hours prior to travel.
*   **Inputs:**
    *   Co-traveler email addresses
    *   Scheduled cron execution time (e.g., daily at 00:00)
*   **Process Steps:**
    1.  Integrate Redis-backed BullMQ service to handle asynchronous email dispatches.
    2.  Build HTML layouts for trip invitation emails and write API POST `/api/v1/share/:tripId/email` with rate limiting of 10 invites/hour.
    3.  Create a daily background worker (node-cron/agenda) that queries the database for trips starting in exactly 24 hours.
    4.  Verify that both the trip and the user are active (not marked deleted).
    5.  Trigger the PDF compilation engine, attach the file, and send it to the traveler's registered email address.
*   **Outputs:**
    *   BullMQ Redis config and workers
    *   Invitation API and email dispatch jobs
    *   Scheduled cron runner service
*   **Validation Rules:**
    *   Email address format must be verified before queuing.
    *   Rate limits must be enforced on invite endpoints.
*   **Dependencies:** TSK-EXPT-03, TSK-AUTH-01
*   **Acceptance Criteria:**
    *   Sending co-traveler invites finishes instantly while emails send in the background.
    *   Travelers receive a PDF digest in their email inbox 24 hours before their departure.
*   **Estimated Complexity:** Medium
*   **Estimated Effort:** 2 Days
