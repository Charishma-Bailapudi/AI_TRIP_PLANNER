# User Stories: Epic 1 - User Authentication & Profile Management

This document outlines the detailed user stories, acceptance criteria, business rules, technical dependencies, database collections, and UI targets for Epic 1.

---

### Story AUTH-001: User Registration
**Story ID:** AUTH-001  
**Epic:** Epic 1: User Authentication & Profile Management  
**Priority:** High  

As a new traveler,  
I want to register for a new account with my name, email, and password,  
So that I can securely save and manage my trip plans.  

**Acceptance Criteria:**  
*   Given a guest user is on the Registration page,  
*   When they enter a valid name, unique email address, and a strong password, and click the Register button,  
*   Then the system creates a new user record in the database with the hashed password, and returns a success status with the user details (excluding password hash) and a status code of 201 Created.  
*   Given a guest user is on the Registration page,  
*   When they submit an email that is already registered in the system,  
*   Then the system returns a validation error indicating that the email is already in use.  

**Business Rules:**  
*   Email addresses must be saved in lowercase and trimmed of trailing or leading spaces.  
*   Passwords must be hashed using a strong hashing algorithm (bcrypt with a minimum cost factor of 10).  
*   User registration requests must be rate-limited to 5 requests per 15 minutes per IP.  

**Dependencies:** None.  
**API References:** POST `/api/v1/auth/register`  
**Database References:** Users Collection (`UserSchema` fields: `name`, `email`, `passwordHash`, `isDeleted`)  
**UI References:** Register Page, `#reg-name`, `#reg-email`, `#reg-password`, `#btn-register-submit`, `#password-strength`  
**Estimate:** Medium  

---

### Story AUTH-002: User Login
**Story ID:** AUTH-002  
**Epic:** Epic 1: User Authentication & Profile Management  
**Priority:** High  

As a registered traveler,  
I want to log in using my email and password,  
So that I can retrieve my saved trip itineraries and dashboard configurations.  

**Acceptance Criteria:**  
*   Given a registered user is on the Login page,  
*   When they enter their correct email and password and click the Login button,  
*   Then the system validates their credentials, returns a short-lived JSON Web Token (JWT) as an access token in the response body, sets a secure HTTP-Only cookie containing the refresh token, and redirects the user to their Dashboard.  
*   Given a user is on the Login page,  
*   When they enter incorrect credentials and submit the form,  
*   Then the system returns a status code of 401 Unauthorized and displays an error message: "Invalid email or password" on the screen.  

**Business Rules:**  
*   The Access Token must expire in 15 minutes (900 seconds).  
*   The Refresh Token must be stored in a cookie configured as: `HttpOnly`, `Secure`, `SameSite=Strict`, with a max-age of 7 days (604,800 seconds).  
*   Login attempts must be rate-limited to 10 requests per 15 minutes per IP address.  

**Dependencies:** AUTH-001 (User Registration must exist).  
**API References:** POST `/api/v1/auth/login`  
**Database References:** Users Collection (`UserSchema` fields: `email`, `passwordHash`), Index: `{ email: 1 }`  
**UI References:** Login Page, `#login-email`, `#login-password`, `#btn-login-submit`  
**Estimate:** Medium  

---

### Story AUTH-003: JWT Token Refresh
**Story ID:** AUTH-003  
**Epic:** Epic 1: User Authentication & Profile Management  
**Priority:** High  

As an active authenticated user,  
I want the application to automatically refresh my access token behind the scenes,  
So that my session remains uninterrupted without prompting me to log in again.  

**Acceptance Criteria:**  
*   Given a user has an active session and their local access token is nearing expiration,  
*   When the client application sends a request to the token refresh endpoint with the valid HTTP-only refresh token cookie,  
*   Then the system verifies the refresh token, rotates it by generating a new access token and a new refresh token, updates the refresh cookie, and returns the new access token.  
*   Given a user session has been idle and the refresh token is expired or revoked,  
*   When a refresh request is executed,  
*   Then the system returns a status code of 403 Forbidden and forces a redirect to the Login page.  

**Business Rules:**  
*   Refresh tokens must be rotated on every single use to prevent replay attacks.  
*   The database must track or cache active sessions, or the system must use cryptographic token verification.  

**Dependencies:** AUTH-002 (User Login).  
**API References:** POST `/api/v1/auth/refresh`  
**Database References:** Users Collection, Session verification logic  
**UI References:** Global Session Provider, background client interceptors  
**Estimate:** Medium  

---

### Story AUTH-004: User Logout
**Story ID:** AUTH-004  
**Epic:** Epic 1: User Authentication & Profile Management  
**Priority:** Medium  

As a logged-in user,  
I want to log out of my account,  
So that my active session is terminated and unauthorized users cannot access my travel plans on shared devices.  

**Acceptance Criteria:**  
*   Given a logged-in user clicks on the "Logout" button,  
*   When the logout request is sent with the current access token and refresh token,  
*   Then the system deletes or invalidates the refresh token on the server, clears the client-side HTTP-Only refresh token cookie (sets max-age to 0), discards the client-side access token, and redirects the user to the Landing page.  

**Business Rules:**  
*   The logout endpoint must set the cookie header `Set-Cookie` with an expired date to guarantee browser cleanup.  
*   Subsequent requests with the old access token or refresh token must be rejected.  

**Dependencies:** AUTH-002, AUTH-003.  
**API References:** POST `/api/v1/auth/logout`  
**Database References:** Users Collection, Session/Token blacklist  
**UI References:** Dashboard Navigation Bar, Sidebar Menu (`#sidebar-menu`) logout button  
**Estimate:** Small  

---

### Story AUTH-005: Retrieve User Profile
**Story ID:** AUTH-005  
**Epic:** Epic 1: User Authentication & Profile Management  
**Priority:** Medium  

As a logged-in user,  
I want to view my profile details on my settings panel,  
So that I can verify that my account information is accurate.  

**Acceptance Criteria:**  
*   Given a user is authenticated,  
*   When they navigate to the profile section or when the application initializes,  
*   Then the system fetches and displays the user's name, email, and registration date.  
*   Given an unauthenticated guest user attempts to load the profile endpoint,  
*   When the request is processed without a valid Bearer token,  
*   Then the system returns a status code of 401 Unauthorized.  

**Business Rules:**  
*   The response must never return the `passwordHash` field or any other sensitive user credentials.  
*   Profile queries must yield 404 if the user account is soft-deleted (`isDeleted: true`).  

**Dependencies:** AUTH-002.  
**API References:** GET `/api/v1/auth/profile`  
**Database References:** Users Collection (`UserSchema` fields: `_id`, `name`, `email`, `createdAt`, `isDeleted`)  
**UI References:** Sidebar Menu (`#sidebar-menu`), Settings Modal/Panel  
**Estimate:** Small  

---

### Story AUTH-006: Update User Profile
**Story ID:** AUTH-006  
**Epic:** Epic 1: User Authentication & Profile Management  
**Priority:** Medium  

As an authenticated user,  
I want to edit my name in my profile settings,  
So that my personal details remain up to date on the platform.  

**Acceptance Criteria:**  
*   Given an authenticated user is on the Settings panel,  
*   When they type a new name and click the "Save Settings" button,  
*   Then the system updates the name in the Users database collection, updates the active session, and returns the modified profile document.  
*   Given a user is modifying their profile,  
*   When they submit a name containing invalid special characters or leaving it blank,  
*   Then the system rejects the update with a 400 Bad Request status code and displays a validation error message.  

**Business Rules:**  
*   Names must be alphanumeric with spaces only, containing between 2 and 100 characters.  
*   The email field is primary and cannot be modified via the standard profile update endpoint (requires specific email change verification flow).  

**Dependencies:** AUTH-005.  
**API References:** PUT `/api/v1/auth/profile`  
**Database References:** Users Collection (`UserSchema` fields: `name`, `updatedAt`)  
**UI References:** Settings Modal/Panel, Name input field, "Save Settings" button  
**Estimate:** Small  

---

### Story AUTH-007: Change Password
**Story ID:** AUTH-007  
**Epic:** Epic 1: User Authentication & Profile Management  
**Priority:** Medium  

As a logged-in user,  
I want to change my password by verifying my current password,  
So that I can keep my account secure or replace compromised credentials.  

**Acceptance Criteria:**  
*   Given an authenticated user is on the Security settings page,  
*   When they provide their current password, a new password that matches strength requirements, and confirm the new password, then click "Update Password",  
*   Then the system verifies the current password against the database, hashes the new password, saves it to the user's record, invalidates all other active refresh sessions, and returns a success response.  
*   Given a user is trying to change their password,  
*   When they enter an incorrect current password,  
*   Then the system rejects the modification and displays: "Current password verification failed."  

**Business Rules:**  
*   New password must not be identical to the current password.  
*   All other active sessions (other refresh tokens) must be deleted from the database to enforce logout across other devices.  

**Dependencies:** AUTH-002.  
**API References:** POST `/api/v1/auth/change-password`  
**Database References:** Users Collection (`UserSchema` fields: `passwordHash`, `updatedAt`)  
**UI References:** Security Settings Panel, Current Password field, New Password field, Confirm Password field, Submit button  
**Estimate:** Medium  

---

### Story AUTH-008: Soft Delete User Account
**Story ID:** AUTH-008  
**Epic:** Epic 1: User Authentication & Profile Management  
**Priority:** Low  

As a registered user,  
I want to deactivate and delete my account,  
So that my profile and personal details are removed from active access while retaining historical records in accordance with data policies.  

**Acceptance Criteria:**  
*   Given an authenticated user navigates to the Account Deactivation tab,  
*   When they click "Delete My Account" and confirm their action via a password re-entry prompt,  
*   Then the system sets the user's `isDeleted` flag to `true`, writes the current date/time to `deletedAt`, invalidates all active sessions, and signs them out.  

**Business Rules:**  
*   This is a soft-delete operation. The user record is not purged from the database immediately.  
*   Once `isDeleted` is set to `true`, the email address is removed from the unique index lookup or appended with a deletion timestamp to allow reuse of the email, or login using the email must be permanently disabled.  
*   Middlewares must automatically filter out soft-deleted users in all active queries.  

**Dependencies:** AUTH-002, AUTH-004.  
**API References:** DELETE `/api/v1/auth/profile`  
**Database References:** Users Collection (`UserSchema` fields: `isDeleted`, `deletedAt`), Mongoose soft delete pre-query middleware  
**UI References:** Account Settings Tab, "Delete Account" button, Confirm password modal  
**Estimate:** Medium  

---

### Story AUTH-009: Input Validation & Password Strength
**Story ID:** AUTH-009  
**Epic:** Epic 1: User Authentication & Profile Management  
**Priority:** High  

As a user signing up for the platform,  
I want real-time validation feedback and password strength indicators,  
So that I can create a secure password and avoid submission errors.  

**Acceptance Criteria:**  
*   Given a user is typing in the password field of the registration form,  
*   When they type,  
*   Then the password strength meter dynamically updates its status (Red/Weak, Yellow/Moderate, Green/Strong) based on character composition.  
*   Given a user attempts to submit the registration form,  
*   When the email is invalid (e.g. missing "@" or domain) or the password is under 8 characters,  
*   Then the submit button is disabled and inline error messages display target validations underneath each input.  

**Business Rules:**  
*   Client-side validation must mirror server-side validation.  
*   Password complexity criteria: minimum 8 characters, maximum 72 characters, must include at least one uppercase letter, one lowercase letter, one number, and one special character.  

**Dependencies:** AUTH-001.  
**API References:** POST `/api/v1/auth/register` (Returns 400 Bad Request with field-level validation on failure)  
**Database References:** Users Collection validation constraints  
**UI References:** Register Page, `#reg-email`, `#reg-password`, `#password-strength` meter bar, inline error fields  
**Estimate:** Small  

---

### Story AUTH-010: Authentication Rate Limiting
**Story ID:** AUTH-010  
**Epic:** Epic 1: User Authentication & Profile Management  
**Priority:** High  

As the system administrator,  
I want to limit the rate of registration and login requests,  
So that the platform is protected from brute-force authentication attacks and credential stuffing.  

**Acceptance Criteria:**  
*   Given a client or script is making repeated login requests,  
*   When they exceed 10 login attempts within a 15-minute window from the same IP address,  
*   Then the system rejects subsequent requests with a status code of 429 Too Many Requests and returns a JSON error payload with the code `RATE_LIMIT_EXCEEDED` and a message: "Too many login attempts. Please try again after 15 minutes."  

**Business Rules:**  
*   Rate limiting must be tracked on the server (using Redis or in-memory stores).  
*   Registration must be restricted to 5 attempts per 15 minutes per IP.  
*   Token refresh operations must be limited to 30 requests per minute.  

**Dependencies:** AUTH-001, AUTH-002.  
**API References:** `/api/v1/auth/login`, `/api/v1/auth/register`, `/api/v1/auth/refresh`  
**Database References:** Rate limiting tracking store (e.g., Redis or memory cache)  
**UI References:** Login Page, Register Page, alert notification displaying rate limit countdown  
**Estimate:** Medium  
