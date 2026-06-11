# Epic 9: Sharing & Export User Stories

This document compiles the 10 detailed user stories for Epic 9: Sharing & Export.

---

Story ID: EXPT-001
Epic: Epic 9: Sharing & Export
Priority: High

As a traveler,
I want to generate a public, read-only link for my trip,
So that I can share my plans with family and friends who don't have an account on the application.

Acceptance Criteria:
* Given an authenticated trip owner is on the Itinerary View Page
* When they click the "Share Trip" toggle button
* Then a unique cryptographic share link must be generated.
* When they copy and send the link to a recipient who is not logged in
* Then the recipient opening the URL must be able to view the read-only dashboard layout containing the chronological daily timeline pane and map pane.

Business Rules:
* Sharing links must utilize the SharedTrips collection to authenticate requests using a cryptographically random shareToken.
* Edit controls, draghandles, delete options, and settings buttons must be hidden or disabled on the shared page layout.

Dependencies: TRIP-003, ITIN-001
API References: POST /api/v1/share/:tripId
Database References: SharedTrips, Trips
UI References: #btn-copy-link, #read-only-timeline, #shared-trip-view
Estimate: Medium

---

Story ID: EXPT-002
Epic: Epic 9: Sharing & Export
Priority: High

As a traveler,
I want to download a PDF of my trip plan,
So that I can access my full itinerary details even when I have no internet access.

Acceptance Criteria:
* Given a user is looking at their itinerary dashboard
* When they click the "Download PDF" trigger button (#btn-download-pdf)
* Then a styled PDF document of their itinerary must download to their local device.
* Given the PDF document is opened
* Then it must contain a summary page of travel dates, multi-city segment travel details, day-by-day attraction timelines, and budget breakdown summaries.

Business Rules:
* PDFs must be generated server-side using a headless browser (Puppeteer) or a PDF generation engine to ensure pixel-perfect rendering matching the design tokens.
* The download URL must be cached to prevent high server resource consumption on repeated download clicks.

Dependencies: TRIP-003, ITIN-001
API References: POST /api/v1/export/pdf
Database References: Trips, Itineraries, Activities
UI References: #btn-download-pdf
Estimate: Large

---

Story ID: EXPT-003
Epic: Epic 9: Sharing & Export
Priority: High

As a traveler,
I want to export my trip events as an iCalendar file,
So that I can sync my travel schedule and flights with my personal calendar app (Google Calendar, Apple Calendar, Outlook).

Acceptance Criteria:
* Given a user is looking at their itinerary dashboard
* When they click "Export to Calendar" in the dashboard menu (#btn-export-ics)
* Then a standard `.ics` file containing all flight details, train departure schedules, check-in times, and daily activities must be generated and downloaded.
* When the user imports this `.ics` file into Google Calendar
* Then all events must parse correctly, displaying the correct times, location names, and description details.

Business Rules:
* Calendar events must specify start time, end time, location coordinates/address, and summary description.
* Time zones must be resolved relative to local destination coordinates to prevent timezone shift issues.

Dependencies: TRIP-003, ITIN-005
API References: GET /api/v1/export/calendar/:tripId
Database References: Trips, Itineraries, Activities
UI References: #sidebar-menu, #btn-export-ics
Estimate: Medium

---

Story ID: EXPT-004
Epic: Epic 9: Sharing & Export
Priority: Medium

As a traveler,
I want to deactivate a shared link or generate a new access token,
So that I can revoke public access to my trip itinerary.

Acceptance Criteria:
* Given the trip owner has sharing active on a trip
* When they toggle off the share switch or click "Revoke Link" (#sharing-status-toggle)
* Then the `isActive` state of the share token in the SharedTrips collection must be set to false.
* When a visitor tries to access the old shared URL
* Then the system must deny access and render a warning page showing: "This shared trip link has expired or is invalid."

Business Rules:
* Revoked tokens must be invalidated instantly at the database gateway.
* If sharing is toggled back on, a brand new cryptographically random token must be generated.

Dependencies: EXPT-001
API References: POST /api/v1/share/:tripId/revoke, DELETE /api/v1/share/:tripId
Database References: SharedTrips
UI References: #btn-copy-link, #sharing-status-toggle
Estimate: Small

---

Story ID: EXPT-005
Epic: Epic 9: Sharing & Export
Priority: Medium

As a traveler,
I want to view a print-friendly version of my timeline and budget on a dedicated web page,
So that I can easily print it on paper without website UI elements like navigation bars.

Acceptance Criteria:
* Given the user is on the shared or owner's itinerary view
* When the user triggers the browser print command (Ctrl+P) or clicks "Print View"
* Then the web page layout must dynamically hide navigation sidebars, headers, map containers, zoom buttons, and interactive forms.
* When the print preview displays
* Then the daily timeline cards and budget lists must adjust font sizes, convert to standard black text, and split page boundaries cleanly for A4 paper.

Business Rules:
* Print styling modifications must be handled via CSS `@media print` rules.
* Element displays for `#sidebar-menu`, `#mapbox-viewport`, and `#btn-add-activity` must be forced to `display: none !important;` during prints.

Dependencies: TRIP-003, ITIN-001
API References: None
Database References: None
UI References: #timeline-pane, #budget-summary-panel, CSS class `.print-only`
Estimate: Small

---

Story ID: EXPT-006
Epic: Epic 9: Sharing & Export
Priority: Medium

As a traveler,
I want to send my itinerary directly to co-travelers via email,
So that they receive a direct invitation link to view or collaborate on the trip.

Acceptance Criteria:
* Given a user is looking at their trip dashboard
* When they click "Invite via Email", type "friend@example.com" into the text box, select permissions "View Only", and click "Send"
* Then the backend must send a styled HTML invitation email to friend@example.com containing the trip overview description, dates, and a click link to open the read-only view.

Business Rules:
* Emails must be dispatched via a background message queue (e.g. BullMQ) to avoid blocking main thread API requests.
* Rate limits of 10 invitations per trip per hour must be enforced to prevent spamming.

Dependencies: TRIP-001, EXPT-001
API References: POST /api/v1/share/:tripId/email
Database References: Trips, Users
UI References: #modal-invite-collaborator, #input-invite-email
Estimate: Medium

---

Story ID: EXPT-007
Epic: Epic 9: Sharing & Export
Priority: Low

As a traveler,
I want to export my budget details as a CSV spreadsheet,
So that I can analyze my travel expenses in Excel or Google Sheets.

Acceptance Criteria:
* Given a user is on the Budget View Page
* When they click "Export to CSV" (#btn-export-csv)
* Then a CSV file must download to their local device.
* Given the downloaded CSV is opened in Excel
* Then it must contain columns for Day Number, Date, Item Type (Transit/Activity), Category, Item Title, Details, and Estimated Cost in the selected currency.

Business Rules:
* Costs must be compiled dynamically by querying TripSegments and Activities collections.
* The CSV file must use standard UTF-8 encoding to support international characters for locations.

Dependencies: BUDG-001, BUDG-002
API References: GET /api/v1/export/csv/:tripId
Database References: Trips, TripSegments, Activities
UI References: #budget-summary-panel, #btn-export-csv
Estimate: Small

---

Story ID: EXPT-008
Epic: Epic 9: Sharing & Export
Priority: Medium

As a traveler,
I want to click a link that opens all my daily activity locations as a route in Google Maps,
So that I can easily navigate using my mobile phone's GPS while traveling.

Acceptance Criteria:
* Given the daily activity timeline is open
* When the user clicks the "Open in Google Maps" link on the day scroller header (#btn-google-maps-sync)
* Then a new browser tab must open pointing to Google Maps.
* When the Google Maps page loads
* Then it must display a route connecting all coordinates of that day's activities in chronological order.

Business Rules:
* The coordinates of that day's active pins must be concatenated using the Google Maps direction URL scheme: `https://www.google.com/maps/dir/?api=1&origin=lat,lng&destination=lat,lng&waypoints=lat,lng|lat,lng...`.

Dependencies: ITIN-001, MAPS-002
API References: None
Database References: Activities
UI References: #day-tabs, #btn-google-maps-sync
Estimate: Small

---

Story ID: EXPT-009
Epic: Epic 9: Sharing & Export
Priority: High

As a logged-in visitor,
I want to copy a shared trip itinerary to my own profile as a new editable trip,
So that I can use someone else's trip plan as a starting template for my own vacation.

Acceptance Criteria:
* Given a logged-in user is viewing a read-only shared trip page
* When they click the "Copy Trip to My Profile" button (#btn-copy-trip)
* Then the system must duplicate all database documents associated with the trip (Trip details, Segments, and Activities) and assign them to the visitor's `userId`.
* When the copy finishes
* Then the visitor must be redirected to their new editable itinerary dashboard showing the copied trip parameters.

Business Rules:
* Copied trips must be generated with a new unique `tripId`.
* Start/End dates must default to the original dates or allow the visitor to specify a offset offset index.

Dependencies: EXPT-001, TRIP-001
API References: POST /api/v1/trips/copy
Database References: Trips, TripSegments, Activities, Itineraries
UI References: #nav-header, #btn-copy-trip
Estimate: Medium

---

Story ID: EXPT-010
Epic: Epic 9: Sharing & Export
Priority: Low

As a traveler,
I want to automatically receive a PDF digest of my finalized trip via email 24 hours before my departure,
So that I have a copy ready in my inbox right before my journey starts.

Acceptance Criteria:
* Given a user has a planned trip with departure scheduled in 24 hours
* When the background system scheduling event triggers
* Then a cron worker must compile the trip itinerary into a PDF.
* When PDF generation finishes
* Then the system must email the PDF as an attachment to the user's registered email address.

Business Rules:
* The system must check the `isDeleted` field of both user and trip before sending the email.
* Email triggers must run daily using a Node-schedule cron runner.

Dependencies: EXPT-002, ADMN-005
API References: None (Background system event scheduler)
Database References: Trips, Users
UI References: #user-settings, #checkbox-pdf-digest
Estimate: Medium
