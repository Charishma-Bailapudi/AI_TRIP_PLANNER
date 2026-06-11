# Authentication Implementation Tasks - Epic 1

This document outlines the detailed backend and frontend implementation tasks for User Authentication & Profile Management.

---

## Task List Summary

| Task ID | Task Name | Priority | Complexity | Effort | Dependencies |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TSK-AUTH-01** | User Database Setup & Mongoose Schemas | Critical | Small | 1 Day | None |
| **TSK-AUTH-02** | Registration & Hashing API | High | Medium | 1 Day | TSK-AUTH-01 |
| **TSK-AUTH-03** | Login & JWT Token Issuance API | High | Medium | 1 Day | TSK-AUTH-02 |
| **TSK-AUTH-04** | JWT Token Refresh & Rotation API | High | Medium | 2 Days | TSK-AUTH-03 |
| **TSK-AUTH-05** | User Logout & Session Invalidation API | Medium | Small | 1 Day | TSK-AUTH-03, TSK-AUTH-04 |
| **TSK-AUTH-06** | User Profile Retrieval API | Medium | Small | 1 Day | TSK-AUTH-03 |
| **TSK-AUTH-07** | User Profile Update API | Medium | Small | 1 Day | TSK-AUTH-06 |
| **TSK-AUTH-08** | User Password Change API | Medium | Medium | 1 Day | TSK-AUTH-03 |
| **TSK-AUTH-09** | Soft Delete User Account API | Low | Medium | 1 Day | TSK-AUTH-05 |
| **TSK-AUTH-10** | Authentication Rate Limiting Middleware | High | Small | 1 Day | TSK-AUTH-02, TSK-AUTH-03, TSK-AUTH-04 |
| **TSK-AUTH-11** | Client-Side Authentication UI & Session Handling | High | Large | 3 Days | TSK-AUTH-02, TSK-AUTH-03, TSK-AUTH-04 |

---

## Detailed Task Specifications

### TSK-AUTH-01: User Database Setup & Mongoose Schemas
*   **Task ID:** TSK-AUTH-01
*   **Task Name:** User Database Setup & Mongoose Schemas
*   **Epic:** Epic 1: User Authentication & Profile Management
*   **Related User Story:** None (Technical Foundation)
*   **Priority:** Critical / High
*   **Purpose:** Connect the Express server backend to the MongoDB database using Mongoose, and define the user data schema and model with indexes and soft-delete filters.
*   **Inputs:**
    *   Database connection string environment variable (`MONGODB_URI`)
    *   Mongoose library dependency
*   **Process Steps:**
    1. Define connection module in `src/config/db.js` with reconnection logic and logging listeners (`connected`, `error`, `disconnected`).
    2. Create `UserSchema` mapping inside `src/models/User.js`.
    3. Configure automatic timestamps option (`createdAt`, `updatedAt`).
    4. Register schema-level indices, establishing email lookup speed.
    5. Register Mongoose pre-query hook middleware on `find`, `findOne`, `findOneAndUpdate`, and `countDocuments` to automatically filter out documents where `isDeleted: true`.
*   **Outputs:**
    *   `src/config/db.js` (Database connection helper)
    *   `src/models/User.js` (Mongoose Model & Schema)
*   **Validation Rules:**
    *   `email`: string, required, unique, lowercase, trimmed, min length 5, max 255. Must match regex: `/^\S+@\S+\.\S+$/`.
    *   `passwordHash`: string, required, exact 60-character bcrypt output string limit.
    *   `name`: string, required, trimmed, min length 2, max 100. Must contain only alphanumeric characters and spaces.
    *   `isDeleted`: boolean, default `false`.
    *   `deletedAt`: date, default `null`.
*   **Dependencies:** None.
*   **Acceptance Criteria:**
    *   Successfully connects to the MongoDB cluster on server startup.
    *   Mongoose validations throw errors for invalid names, bad emails, or duplicate email submissions.
    *   Querying all users or single profiles automatically excludes soft-deleted records.
*   **Estimated Complexity:** Small
*   **Estimated Effort:** 1 Day

---

### TSK-AUTH-02: Registration & Hashing API
*   **Task ID:** TSK-AUTH-02
*   **Task Name:** Registration & Hashing API
*   **Epic:** Epic 1: User Authentication & Profile Management
*   **Related User Story:** AUTH-001 (User Registration), AUTH-009 (Input Validation)
*   **Priority:** High
*   **Purpose:** Create user registration endpoint POST `/api/v1/auth/register` to validate inputs, hash passwords using bcrypt, and save documents to database.
*   **Inputs:**
    *   JSON payload: `email`, `password`, `name`
*   **Process Steps:**
    1. Create endpoint router in `src/routes/auth.routes.js` bound to `/auth/register`.
    2. Write request body schema validation middleware using Joi or express-validator.
    3. In controller `src/controllers/auth.controller.js`, extract and sanitize properties (lowercase and trim email).
    4. Verify email uniqueness by querying database. Throw a `BAD_REQUEST` 400 response with message "Email is already in use" if a duplicate is found.
    5. Hash the password using `bcrypt` with a minimum cost factor of 10.
    6. Save the new user record in MongoDB and return a 201 Created response containing standard success format.
*   **Outputs:**
    *   `src/routes/auth.routes.js` (Registration path setup)
    *   `src/controllers/auth.controller.js` (Registration controller handler)
    *   `src/middleware/validators/auth.validator.js` (Input validator validation rule)
*   **Validation Rules:**
    *   `email`: required, valid format.
    *   `password`: required, min 8, max 72 characters, must include at least one uppercase letter, one lowercase letter, one number, and one special character.
    *   `name`: required, min 2, max 100, alphanumeric and spaces only.
*   **Dependencies:** TSK-AUTH-01
*   **Acceptance Criteria:**
    *   POST `/api/v1/auth/register` returns 201 Created and standard JSON format on success.
    *   Saved password in database matches the hashed 60-character bcrypt format, not plaintext.
    *   Returns 400 Bad Request error if inputs are invalid or email is already registered.
*   **Estimated Complexity:** Medium
*   **Estimated Effort:** 1 Day

---

### TSK-AUTH-03: Login & JWT Token Issuance API
*   **Task ID:** TSK-AUTH-03
*   **Task Name:** Login & JWT Token Issuance API
*   **Epic:** Epic 1: User Authentication & Profile Management
*   **Related User Story:** AUTH-002 (User Login)
*   **Priority:** High
*   **Purpose:** Create POST `/api/v1/auth/login` endpoint to authenticate credentials, sign access tokens, set HTTP-Only cookies for refresh tokens, and rate-limit logins.
*   **Inputs:**
    *   JSON payload: `email`, `password`
*   **Process Steps:**
    1. Extract credentials, trim email, and look up matching active User record in database.
    2. Return 401 Unauthorized error with message "Invalid email or password" if user record is missing.
    3. Compare payload password with hashed password from database using `bcrypt.compare()`.
    4. If password comparison fails, return 401 Unauthorized error.
    5. Generate a JWT Access Token containing `userId` in the payload, signed with `JWT_SECRET` key, expiring in 15 minutes (900 seconds).
    6. Generate a cryptographically secure Refresh Token and store it in database or Redis session store with an expiration of 7 days.
    7. Set Refresh Token as an HTTP-Only, Secure, SameSite=Strict cookie named `refreshToken` with Max-Age of 7 days (604,800 seconds).
    8. Return 200 OK standard response format containing the `accessToken`, `expiresInSeconds`, and user details.
*   **Outputs:**
    *   `src/controllers/auth.controller.js` (Login controller handler)
    *   `src/utils/token.js` (JWT signing and helper utility)
*   **Validation Rules:**
    *   `email`: required, valid email format.
    *   `password`: required, non-empty.
*   **Dependencies:** TSK-AUTH-02
*   **Acceptance Criteria:**
    *   POST `/api/v1/auth/login` returns 200 OK and `accessToken` on correct credentials, setting `refreshToken` in HTTP-Only cookies.
    *   Returns 401 Unauthorized on incorrect credentials with message "Invalid email or password".
    *   The refresh token cookie is configured with `HttpOnly; Secure; SameSite=Strict`.
*   **Estimated Complexity:** Medium
*   **Estimated Effort:** 1 Day

---

### TSK-AUTH-04: JWT Token Refresh & Rotation API
*   **Task ID:** TSK-AUTH-04
*   **Task Name:** JWT Token Refresh & Rotation API
*   **Epic:** Epic 1: User Authentication & Profile Management
*   **Related User Story:** AUTH-003 (JWT Token Refresh)
*   **Priority:** High
*   **Purpose:** Create POST `/api/v1/auth/refresh` endpoint to rotate access tokens using a valid refresh token cookie, implementing token reuse prevention.
*   **Inputs:**
    *   HTTP Cookie: `refreshToken`
*   **Process Steps:**
    1. Extract refresh token from request cookies. If missing, return 403 Forbidden.
    2. Decode token and verify signature. Check session cache or DB to confirm existence.
    3. Token Reuse Detection: If token is identified but marked as "used" or revoked, assume replay attack. Immediately delete all active refresh tokens for the associated user to force full logout, clear cookie, and return 403 Forbidden.
    4. Verify token expiry. If expired, return 403 Forbidden.
    5. Generate a new JWT Access Token (15 min) and a new Refresh Token (7 days).
    6. Remove old refresh token from database/cache, save new refresh token.
    7. Attach new refresh token to response header cookie with secure HTTP-only flags.
    8. Return 200 OK with new access token and expire time.
*   **Outputs:**
    *   `src/routes/auth.routes.js` (Refresh route path)
    *   `src/controllers/auth.controller.js` (Refresh handler logic)
*   **Validation Rules:**
    *   Request must include a valid refresh token in the cookie header.
*   **Dependencies:** TSK-AUTH-03
*   **Acceptance Criteria:**
    *   Valid refresh token cookie yields a new short-lived access token and rotates the refresh cookie.
    *   Reusing a previously used refresh token revokes all session states and returns 403 Forbidden.
    *   Expired refresh tokens return 403 Forbidden.
*   **Estimated Complexity:** Medium
*   **Estimated Effort:** 2 Days

---

### TSK-AUTH-05: User Logout & Session Invalidation API
*   **Task ID:** TSK-AUTH-05
*   **Task Name:** User Logout & Session Invalidation API
*   **Epic:** Epic 1: User Authentication & Profile Management
*   **Related User Story:** AUTH-004 (User Logout)
*   **Priority:** Medium
*   **Purpose:** Create POST `/api/v1/auth/logout` endpoint that revokes session refresh tokens and clears client cookies to guarantee secure logout.
*   **Inputs:**
    *   HTTP Header: `Authorization: Bearer <accessToken>`
    *   HTTP Cookie: `refreshToken`
*   **Process Steps:**
    1. Validate access token using authentication middleware.
    2. Extract refresh token from cookies.
    3. Invalidate or delete the refresh token from the database/session cache.
    4. Add access token signature to a blacklist cache (matching remaining TTL) to prevent subsequent reuse.
    5. Set `Set-Cookie` header for `refreshToken` with `Max-Age: 0` and an expired date.
    6. Return 200 OK standard success response.
*   **Outputs:**
    *   `src/controllers/auth.controller.js` (Logout controller handler)
    *   `src/middleware/auth.middleware.js` (Authentication checks & blacklists)
*   **Validation Rules:**
    *   Request must contain a valid access token in authorization header.
*   **Dependencies:** TSK-AUTH-03, TSK-AUTH-04
*   **Acceptance Criteria:**
    *   POST `/api/v1/auth/logout` clears `refreshToken` cookie and returns 200 OK.
    *   Subsequent requests using the old refresh token or blacklisted access token fail with authorization errors.
*   **Estimated Complexity:** Small
*   **Estimated Effort:** 1 Day

---

### TSK-AUTH-06: User Profile Retrieval API
*   **Task ID:** TSK-AUTH-06
*   **Task Name:** User Profile Retrieval API
*   **Epic:** Epic 1: User Authentication & Profile Management
*   **Related User Story:** AUTH-005 (Retrieve User Profile)
*   **Priority:** Medium
*   **Purpose:** Create GET `/api/v1/auth/profile` endpoint to retrieve personal profile details (name, email, registration date) for the logged-in user.
*   **Inputs:**
    *   HTTP Header: `Authorization: Bearer <accessToken>`
*   **Process Steps:**
    1. Authenticate user request and fetch `userId` from the decoded token payload.
    2. Execute lookup `User.findById(userId)`.
    3. Check if user document exists and is not soft-deleted. If soft-deleted or missing, return 404 Not Found.
    4. Construct response payload containing `userId`, `email`, `name`, and `createdAt` (omitting `passwordHash`).
    5. Return 200 OK standard success response.
*   **Outputs:**
    *   `src/controllers/auth.controller.js` (Profile fetch method)
*   **Validation Rules:**
    *   Valid access token in headers is required.
*   **Dependencies:** TSK-AUTH-03
*   **Acceptance Criteria:**
    *   GET `/api/v1/auth/profile` returns 200 OK and user details on valid token.
    *   Returns 401 Unauthorized if access token is missing, expired, or modified.
    *   Response payload never leaks the user's `passwordHash`.
*   **Estimated Complexity:** Small
*   **Estimated Effort:** 1 Day

---

### TSK-AUTH-07: User Profile Update API
*   **Task ID:** TSK-AUTH-07
*   **Task Name:** User Profile Update API
*   **Epic:** Epic 1: User Authentication & Profile Management
*   **Related User Story:** AUTH-006 (Update User Profile)
*   **Priority:** Medium
*   **Purpose:** Create PUT `/api/v1/auth/profile` endpoint allowing authenticated users to update their profile name after validation checks.
*   **Inputs:**
    *   HTTP Header: `Authorization: Bearer <accessToken>`
    *   JSON payload: `name`
*   **Process Steps:**
    1. Authenticate user request.
    2. Validate input payload: check `name` format, length, and content.
    3. Ensure input doesn't attempt to modify email address. If email field is present, ignore it.
    4. Update user document using `User.findByIdAndUpdate(userId, { name })` and save.
    5. Return 200 OK standard success response containing updated profile parameters.
*   **Outputs:**
    *   `src/controllers/auth.controller.js` (Profile update method)
*   **Validation Rules:**
    *   `name`: required, 2 to 100 characters, alphanumeric and spaces only.
*   **Dependencies:** TSK-AUTH-06
*   **Acceptance Criteria:**
    *   Successfully updates the name in the database and returns updated name on 200 OK.
    *   Invalid name formats (blank, special characters, too short/long) return 400 Bad Request.
    *   Attempts to modify the email address through this endpoint are ignored.
*   **Estimated Complexity:** Small
*   **Estimated Effort:** 1 Day

---

### TSK-AUTH-08: User Password Change API
*   **Task ID:** TSK-AUTH-08
*   **Task Name:** User Password Change API
*   **Epic:** Epic 1: User Authentication & Profile Management
*   **Related User Story:** AUTH-007 (Change Password)
*   **Priority:** Medium
*   **Purpose:** Create secure password changing endpoint POST `/api/v1/auth/change-password` requiring verification of the current password and invalidating other active refresh sessions.
*   **Inputs:**
    *   HTTP Header: `Authorization: Bearer <accessToken>`
    *   JSON payload: `currentPassword`, `newPassword`, `confirmPassword`
*   **Process Steps:**
    1. Authenticate user request and fetch the full User document from the database (including `passwordHash`).
    2. Validate parameters: check complexity rules of `newPassword`, verify `newPassword` matches `confirmPassword`, and check that `newPassword` is different from `currentPassword`.
    3. Verify `currentPassword` against database `passwordHash` using `bcrypt.compare()`.
    4. If verification fails, return 400 Bad Request with message "Current password verification failed."
    5. Hash `newPassword` using bcrypt.
    6. Save new password hash to the database.
    7. Invalidate all other active sessions/refresh tokens for this user in the session store or database.
    8. Return 200 OK standard success response.
*   **Outputs:**
    *   `src/controllers/auth.controller.js` (Password update method)
*   **Validation Rules:**
    *   `currentPassword`: required.
    *   `newPassword`: required, min 8, max 72 characters, must include uppercase, lowercase, digit, and special char.
    *   `confirmPassword`: must match `newPassword`.
*   **Dependencies:** TSK-AUTH-03
*   **Acceptance Criteria:**
    *   Successfully updates password and returns 200 OK.
    *   Incorrect current password returns 400 Bad Request.
    *   Changing password logs out other active sessions by invalidating their refresh tokens.
*   **Estimated Complexity:** Medium
*   **Estimated Effort:** 1 Day

---

### TSK-AUTH-09: Soft Delete User Account API
*   **Task ID:** TSK-AUTH-09
*   **Task Name:** Soft Delete User Account API
*   **Epic:** Epic 1: User Authentication & Profile Management
*   **Related User Story:** AUTH-008 (Soft Delete User Account)
*   **Priority:** Low
*   **Purpose:** Create DELETE `/api/v1/auth/profile` endpoint to deactivate user accounts by toggling the `isDeleted` flag, recording timestamps, and invalidating session keys.
*   **Inputs:**
    *   HTTP Header: `Authorization: Bearer <accessToken>`
    *   JSON payload: `password` (re-verification confirmation)
*   **Process Steps:**
    1. Authenticate user request and retrieve user record from database.
    2. Compare password payload with `passwordHash` from database. If verification fails, return 401 Unauthorized.
    3. Update user document: set `isDeleted` to `true` and `deletedAt` to current date-time.
    4. Invalidate all active refresh sessions for this user on the server.
    5. Blacklist current access token and clear refresh cookie.
    6. Return 200 OK standard success response.
*   **Outputs:**
    *   `src/controllers/auth.controller.js` (Profile delete method)
*   **Validation Rules:**
    *   `password` confirmation is required.
*   **Dependencies:** TSK-AUTH-05
*   **Acceptance Criteria:**
    *   Soft deactivation flag and timestamp are correctly saved in database on correct credentials.
    *   Soft-deleted users are immediately signed out and blocked from logging in or refreshing tokens.
    *   Mongoose pre-query hook excludes soft-deleted profiles from standard searches.
*   **Estimated Complexity:** Medium
*   **Estimated Effort:** 1 Day

---

### TSK-AUTH-10: Authentication Rate Limiting Middleware
*   **Task ID:** TSK-AUTH-10
*   **Task Name:** Authentication Rate Limiting Middleware
*   **Epic:** Epic 1: User Authentication & Profile Management
*   **Related User Story:** AUTH-010 (Authentication Rate Limiting)
*   **Priority:** High
*   **Purpose:** Implement rate limiting middleware on authentication endpoints to secure the application against credential stuffing and brute-force attacks.
*   **Inputs:**
    *   Client IP address
    *   Requested endpoint path
*   **Process Steps:**
    1. Configure rate-limiting middleware (e.g. `express-rate-limit` using memory-store or Redis).
    2. Implement rule for Registration: 5 requests per 15 minutes per IP.
    3. Implement rule for Login: 10 requests per 15 minutes per IP.
    4. Implement rule for Token Refresh: 30 requests per minute per IP.
    5. Apply the rate limiters directly to the respective auth routes.
    6. Return 429 Too Many Requests with JSON error payload `RATE_LIMIT_EXCEEDED` on limit violation.
*   **Outputs:**
    *   `src/middleware/rateLimiter.js` (Rate limiting configurations)
*   **Validation Rules:**
    *   IP address and endpoint path key mapping.
*   **Dependencies:** TSK-AUTH-02, TSK-AUTH-03, TSK-AUTH-04
*   **Acceptance Criteria:**
    *   More than 10 login attempts within 15 minutes from the same IP returns 429 Too Many Requests.
    *   More than 5 register attempts within 15 minutes from the same IP returns 429 Too Many Requests.
    *   Error body contains `RATE_LIMIT_EXCEEDED` error code.
*   **Estimated Complexity:** Small
*   **Estimated Effort:** 1 Day

---

### TSK-AUTH-11: Client-Side Authentication UI & Session Handling
*   **Task ID:** TSK-AUTH-11
*   **Task Name:** Client-Side Authentication UI & Session Handling
*   **Epic:** Epic 1: User Authentication & Profile Management
*   **Related User Story:** AUTH-009 (Input Validation & Password Strength)
*   **Priority:** High
*   **Purpose:** Build frontend registration and login forms with dynamic input validation, password strength indicators, global session context providers, and Axios refresh interceptors.
*   **Inputs:**
    *   React/Vite client codebase
    *   CSS components
*   **Process Steps:**
    1. Create Login and Register components containing inputs and error indicators (`#reg-name`, `#reg-email`, `#reg-password`, `#btn-register-submit`, `#login-email`, `#login-password`, `#btn-login-submit`).
    2. Write client-side validations to mirror server-side validations.
    3. Add a dynamic password strength meter (`#password-strength`) updating color state (Weak/Moderate/Strong) based on regex complexity.
    4. Set up global authentication provider context checking session state on initialization.
    5. Configure Axios response interceptors: intercept 401 errors, execute token refresh POST `/api/v1/auth/refresh`, and retry failed request with new access token header.
    6. Redirect user to Login view on session expiry.
*   **Outputs:**
    *   `src/components/auth/Login.jsx` (Login page)
    *   `src/components/auth/Register.jsx` (Register page)
    *   `src/context/AuthContext.jsx` (Authentication state context)
    *   `src/services/api.js` (Axios configuration with interceptors)
*   **Validation Rules:**
    *   Name: required, min 2, alphanumeric/spaces only.
    *   Email: standard regex matching.
    *   Password: min 8, uppercase, lowercase, digit, special char.
*   **Dependencies:** TSK-AUTH-02, TSK-AUTH-03, TSK-AUTH-04
*   **Acceptance Criteria:**
    *   Frontend blocks submit buttons with error messages when input validation fails.
    *   Access token rotates transparently in the background on expiry.
    *   Expired session redirects user to Login page with notification banner.
*   **Estimated Complexity:** Large
*   **Estimated Effort:** 3 Days
