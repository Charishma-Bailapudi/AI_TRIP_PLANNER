# Epic 12: Administration & Monitoring - User Stories

This document outlines the detailed user stories, acceptance criteria, business rules, dependencies, and reference specifications for **Epic 12: Administration & Monitoring**.

---

## Story ID: ADMN-001
### Epic: Epic 12: Administration & Monitoring
### Priority: High

**User Story:**
As an administrator,  
I want a visual dashboard showing active sessions, registered users, and system uptime,  
So that I can monitor the application's overall status.

**Acceptance Criteria:**
* Given the user is successfully authenticated and has the 'admin' role
* When the user navigates to `/admin/dashboard`
* Then the dashboard screen must render interactive charts showing real-time concurrent active sessions, user registration rates, and API success/failure rates over time
* Given the dashboard is active on screen
* When the metric interval triggers
* Then it must query the metrics API `/api/admin/metrics` every 60 seconds to pull and refresh the graph lines without reloading the page

**Business Rules:**
* Access to admin routes must be locked behind JWT authentication with role-based checks.
* Dashboard telemetry must be served over encrypted SSL connections.

**Dependencies:** AUTH-001, AUTH-002, ADMN-010
**API References:** `/api/admin/metrics` (GET)
**Database References:** Users, Session logs
**UI References:** `/admin/dashboard`
**Estimate:** Medium

---

## Story ID: ADMN-002
### Epic: Epic 12: Administration & Monitoring
### Priority: High

**User Story:**
As an administrator,  
I want to track and count API requests made to third-party services (Gemini, Mapbox, Flight APIs),  
So that we can prevent quota exhaustion and abuse.

**Acceptance Criteria:**
* Given any outbound API request is sent to a third-party partner (Gemini, Mapbox, Amadeus, Rome2Rio)
* When the request completes (success or failure)
* Then the gateway logger must write the provider name, endpoint URL, HTTP response code, and request timestamp into the `ApiUsageLogs` database collection
* Given a user account executes a trip generation query
* When checking usage limits
* Then the system must verify their API usage count, block the transaction with an HTTP 429 error if it exceeds the hourly quota, and increment the violation counter

**Business Rules:**
* Standard users are capped at 100 external API request cycles per hour.
* Retain logs in `ApiUsageLogs` for 90 days before automated deletion.

**Dependencies:** None
**API References:** `/api/admin/usage` (GET)
**Database References:** ApiUsageLogs
**UI References:** `/admin/dashboard` (API usage analytics tab)
**Estimate:** Medium

---

## Story ID: ADMN-003
### Epic: Epic 12: Administration & Monitoring
### Priority: High

**User Story:**
As an administrator,  
I want the system to capture backend/frontend errors, log them centrally, and trigger alerts for critical issues,  
So that we can diagnose and resolve bugs quickly.

**Acceptance Criteria:**
* Given a backend exception or uncaught client crash occurs
* When the global error-handling middleware intercepts the event
* Then the error tracker must save the stack trace, user ID, request payload, and timestamp to the `SystemErrors` database collection
* Given the log entry contains a critical severity level (e.g. database disconnect, third-party authentication failures)
* When the log is written
* Then the system must immediately trigger an outbound alert webhook to the developer Slack channel or engineering email list

**Business Rules:**
* Alert triggers must be throttled to prevent spamming; send a maximum of one notification email per 15 minutes for identical critical stack traces.
* Mask sensitive fields (passwords, auth headers, private keys) from the error payload before writing to the database.

**Dependencies:** None
**API References:** `/api/admin/errors` (GET)
**Database References:** SystemErrors
**UI References:** `/admin/dashboard` (Error logging grid)
**Estimate:** Medium

---

## Story ID: ADMN-004
### Epic: Epic 12: Administration & Monitoring
### Priority: Medium

**User Story:**
As an administrator,  
I want to monitor dollar costs incurred per user session from Gemini and Mapbox,  
So that we can keep operational costs within budget.

**Acceptance Criteria:**
* Given an API query to Gemini or Mapbox is logged in the system
* When saving the log metadata
* Then the cost analyzer must compute the estimated dollar cost based on Gemini input/output tokens or Mapbox tile count using preset pricing tiers
* Given a monthly cost scheduler runs
* When the aggregate cost of third-party APIs exceeds 80% of our monthly budget limit
* Then the system must dispatch a warning notification to the administrator

**Business Rules:**
* Hard monthly budget limit: $500.00.
* API cost multipliers: Gemini Flash ($0.075/1M input tokens, $0.30/1M output tokens), Mapbox ($5.00/1,000 requests).

**Dependencies:** ADMN-002
**API References:** `/api/admin/costs` (GET)
**Database References:** ApiUsageLogs
**UI References:** `/admin/dashboard` (Cost telemetry card)
**Estimate:** Medium

---

## Story ID: ADMN-005
### Epic: Epic 12: Administration & Monitoring
### Priority: Medium

**User Story:**
As an administrator,  
I want to analyze the hit rate of CachedRoutes and trigger manual TTL invalidations,  
So that I can optimize database/caching costs and ensure fresh data.

**Acceptance Criteria:**
* Given a traveler runs a segment search
* When the query is resolved from `CachedRoutes` (cache hit) or fetched from external APIs (cache miss)
* Then the system must increment the cache counters in the usage logging collection
* Given an administrator wants to purge stale data from the cache
* When they input a city keyword and click "Invalidate Cache" on the admin dashboard
* Then the system must execute a delete query on matching key patterns in `CachedRoutes` and show a confirmation toast showing the number of invalidated rows

**Business Rules:**
* Default caching TTL is 7 days.
* Cache deletion operations require admin authentication and authorization checks.

**Dependencies:** ADMN-001, ADMN-002
**API References:** `/api/admin/cache/invalidate` (POST), `/api/admin/cache/stats` (GET)
**Database References:** CachedRoutes, ApiUsageLogs
**UI References:** `/admin/dashboard` (Cache management panel)
**Estimate:** Medium

---

## Story ID: ADMN-006
### Epic: Epic 12: Administration & Monitoring
### Priority: Medium

**User Story:**
As an administrator,  
I want to search, view, and suspend user accounts,  
So that I can moderate platform use and handle security violations.

**Acceptance Criteria:**
* Given the administrator is on the User Management section
* When they search for a user profile by email or user ID
* Then the table must load matching profiles with account status (Active, Suspended), registration timestamp, and count of generated trips
* Given a user profile is selected
* When the admin clicks "Suspend Account" and submits a justification
* Then the backend must update the user database status to `Suspended`, terminate their active JWT sessions, reject future logins with a message "Your account has been suspended", and log the moderation action

**Business Rules:**
* User moderation actions must require super-admin permissions to modify administrator accounts.
* All moderation actions must be written to `AuditLogs` containing the admin ID, user ID, action, and reasoning.

**Dependencies:** AUTH-001, AUTH-002, ADMN-010
**API References:** `/api/admin/users` (GET), `/api/admin/users/[userId]/suspend` (POST)
**Database References:** Users, AuditLogs
**UI References:** `/admin/dashboard` (User moderator pane)
**Estimate:** Medium

---

## Story ID: ADMN-007
### Epic: Epic 12: Administration & Monitoring
### Priority: High

**User Story:**
As an administrator,  
I want to view the status of external API circuit breakers and manually trigger overrides,  
So that I can manage outages of third-party APIs.

**Acceptance Criteria:**
* Given a circuit breaker tracks third-party connections (e.g. Flight API)
* When the API failure rate crosses 50% in a 5-minute tracking window
* Then the breaker state must shift to `OPEN` (blocking external requests), and the Admin dashboard status icon must turn red with label "OPEN"
* Given a breaker is `OPEN`
* When the administrator clicks the "Force Close" override button
* Then the breaker state must reset to `CLOSED` (restoring active connections) and log the override event to the database

**Business Rules:**
* Failures counted towards circuit breaking are: network timeouts, connection refused, and HTTP 5xx responses.
* The system must wait 5 minutes before shifting an OPEN breaker to HALF-OPEN for auto-testing. Manual override bypasses this wait period.

**Dependencies:** ADMN-001, ADMN-003
**API References:** `/api/admin/circuit-breakers` (GET/POST)
**Database References:** AuditLogs
**UI References:** `/admin/dashboard` (Circuit breaker panel)
**Estimate:** Medium

---

## Story ID: ADMN-008
### Epic: Epic 12: Administration & Monitoring
### Priority: Low

**User Story:**
As an administrator,  
I want to view slow Mongoose queries and database performance statistics,  
So that I can identify query bottlenecks and optimize collection indexes.

**Acceptance Criteria:**
* Given a Mongoose database operation takes longer than 500 milliseconds to complete
* When the database middleware detects the slow transaction
* Then the query hook must write the query filter, execution duration, and collection name to the `DatabaseSlowLogs` collection
* Given the administrator visits the DB tuning tab
* When the table loads
* Then it must display a list of slow queries sorted descending by execution duration and frequency

**Business Rules:**
* Slow query threshold must be configurable via the environment variable `DB_SLOW_LOG_MS` (defaulting to 500ms).
* Query filters containing passwords or user authentication hashes must be scrubbed before logging.

**Dependencies:** ADMN-001
**API References:** `/api/admin/db/slow-logs` (GET)
**Database References:** DatabaseSlowLogs
**UI References:** `/admin/dashboard` (Database tuning pane)
**Estimate:** Small

---

## Story ID: ADMN-009
### Epic: Epic 12: Administration & Monitoring
### Priority: Low

**User Story:**
As an administrator,  
I want to view anonymous audit logs of segment requests and generated itineraries,  
So that I can analyze travel trends and optimize prompt templates.

**Acceptance Criteria:**
* Given a new trip itinerary is successfully saved on the platform
* When the itinerary data transaction completes
* Then the system must create a record containing destination city list, travel style tags, date duration, and budget tier in the `ItineraryAudits` database collection
* Given the admin opens the Analytics panel
* When fetching trend graphs
* Then the backend must run aggregation queries on `ItineraryAudits` and return statistics for top 10 destination pairs and travel styles

**Business Rules:**
* Absolute anonymity is required: zero user IDs, names, emails, or personal tracking information must be saved to the `ItineraryAudits` collection.
* The analytics collection must be write-once, read-only; records cannot be updated or deleted by admins.

**Dependencies:** TRIP-001, ITIN-001, ADMN-001
**API References:** `/api/admin/analytics/trends` (GET)
**Database References:** ItineraryAudits
**UI References:** `/admin/dashboard` (Analytics panel)
**Estimate:** Small

---

## Story ID: ADMN-010
### Epic: Epic 12: Administration & Monitoring
### Priority: High

**User Story:**
As an administrator,  
I want a secure login flow and role-based access control for administrative routes,  
So that sensitive monitoring and control endpoints are protected.

**Acceptance Criteria:**
* Given a user attempts to access any route prefixed with `/api/admin/*` or `/admin/*`
* When the request router intercepts the call
* Then the authentication middleware must verify the JWT access token and validate that the user record contains `role: "admin"`
* Given the user lacks administrative permissions
* When they hit an admin route
* Then the server must respond with an HTTP 403 Forbidden error and write an unauthorized access log to the database

**Business Rules:**
* Administrative session JWTs must have a maximum lifespan of 15 minutes and must not use sliding expiration.
* Administrator passwords must be checked for minimum complexity: at least 12 characters, including uppercase, lowercase, numbers, and symbols.

**Dependencies:** AUTH-001, AUTH-002, AUTH-003
**API References:** `/api/auth/login` (POST), admin middleware
**Database References:** Users
**UI References:** `/admin/login`, `/admin/dashboard`
**Estimate:** Medium
