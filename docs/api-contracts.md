# API Contracts Document - AI Trip Planner

This document defines the REST API endpoints, DTO schemas, authentication parameters, validation rules, rate limits, and error handling policies for the AI Trip Planner backend services.

---

## 1. Versioning & Global Specifications

### 1.1. Versioning Strategy
We use **URI Path Versioning**. All production endpoints are prefixed with `/api/v1/` (e.g., `/api/v1/auth/login`). This document displays paths relative to the `/api/v1` base URL.

### 1.2. Global Response Formats

#### Success Response (200 OK, 201 Created)
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

#### Error Response (400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 429 Too Many Requests, 500 Internal Server Error)
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "body.email",
      "message": "Invalid email address format"
    }
  ]
}
```

### 1.3. Global Error Codes
*   `BAD_REQUEST`: Input validation failure.
*   `UNAUTHORIZED`: Missing or expired Access Token.
*   `FORBIDDEN`: Refresh token invalid or insufficient permissions.
*   `NOT_FOUND`: Resource could not be found.
*   `RATE_LIMIT_EXCEEDED`: API rate limit reached.
*   `AI_GEN_FAILED`: Gemini model parsing error.
*   `INTERNAL_ERROR`: General server-side failure.

---

## 2. Authentication Endpoints

### 2.1. POST `/auth/register`
*   **Purpose:** Register a new user profile.
*   **HTTP Method:** `POST`
*   **Endpoint:** `/api/v1/auth/register`
*   **Request Headers:**
    *   `Content-Type: application/json`
*   **Path Parameters:** None
*   **Query Parameters:** None
*   **Request Body (DTO):**
    ```json
    {
      "email": "user@example.com",
      "password": "Password123!",
      "name": "John Doe"
    }
    ```
*   **Success Response (201 Created):**
    *   `Status Code: 201`
    ```json
    {
      "success": true,
      "message": "User registered successfully",
      "data": {
        "userId": "usr_6f8b2c4d9a1e",
        "email": "user@example.com",
        "name": "John Doe",
        "createdAt": "2026-06-10T21:13:20.000Z"
      }
    }
    ```
*   **Error Response (400 Bad Request):**
    *   `Status Code: 400`
    ```json
    {
      "success": false,
      "message": "Validation failed",
      "errors": [
        {
          "field": "body.password",
          "message": "Password must be at least 8 characters long and contain one uppercase letter, one lowercase letter, one number, and one special character."
        }
      ]
    }
    ```
*   **Validation Rules:**
    *   `email`: String, required, valid email format, max 255 chars.
    *   `password`: String, required, min 8 chars, max 72 chars, must contain uppercase, lowercase, digit, and special char.
    *   `name`: String, required, min 2 chars, max 100 chars, alphanumeric/spaces only.
*   **Authentication Requirements:** None (Public)
*   **Rate Limit:** 5 requests per 15 minutes per IP.
*   **Example Request:**
    ```bash
    curl -X POST https://api.aitripplanner.com/api/v1/auth/register \
      -H "Content-Type: application/json" \
      -d '{"email":"user@example.com","password":"Password123!","name":"John Doe"}'
    ```
*   **Example Response:** (See Success Response)

---

### 2.2. POST `/auth/login`
*   **Purpose:** Authenticate credentials and establish an active session.
*   **HTTP Method:** `POST`
*   **Endpoint:** `/api/v1/auth/login`
*   **Request Headers:**
    *   `Content-Type: application/json`
*   **Path Parameters:** None
*   **Query Parameters:** None
*   **Request Body (DTO):**
    ```json
    {
      "email": "user@example.com",
      "password": "Password123!"
    }
    ```
*   **Success Response (200 OK):**
    *   `Status Code: 200`
    *   *Headers:* `Set-Cookie: refreshToken=rt_8b3f...; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`
    ```json
    {
      "success": true,
      "message": "Login successful",
      "data": {
        "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c3JfNmY4YjJjNGQ5YTFlIn0...",
        "expiresInSeconds": 900,
        "user": {
          "userId": "usr_6f8b2c4d9a1e",
          "email": "user@example.com",
          "name": "John Doe"
        }
      }
    }
    ```
*   **Error Response (401 Unauthorized):**
    *   `Status Code: 401`
    ```json
    {
      "success": false,
      "message": "Invalid email or password",
      "errors": []
    }
    ```
*   **Validation Rules:**
    *   `email`: String, required, valid email format.
    *   `password`: String, required.
*   **Authentication Requirements:** None (Public)
*   **Rate Limit:** 10 requests per 15 minutes per IP.
*   **Example Request:**
    ```bash
    curl -X POST https://api.aitripplanner.com/api/v1/auth/login \
      -H "Content-Type: application/json" \
      -d '{"email":"user@example.com","password":"Password123!"}'
    ```
*   **Example Response:** (See Success Response)

---

### 2.3. POST `/auth/logout`
*   **Purpose:** Terminate user session and invalidate refresh tokens.
*   **HTTP Method:** `POST`
*   **Endpoint:** `/api/v1/auth/logout`
*   **Request Headers:**
    *   `Authorization: Bearer <accessToken>`
    *   `Cookie: refreshToken=<refreshToken>`
*   **Path Parameters:** None
*   **Query Parameters:** None
*   **Request Body:** None
*   **Success Response (200 OK):**
    *   `Status Code: 200`
    *   *Headers:* `Set-Cookie: refreshToken=; HttpOnly; Secure; SameSite=Strict; Max-Age=0`
    ```json
    {
      "success": true,
      "message": "Logout successful",
      "data": {}
    }
    ```
*   **Error Response (401 Unauthorized):**
    *   `Status Code: 401`
    ```json
    {
      "success": false,
      "message": "Access token expired or missing",
      "errors": []
    }
    ```
*   **Validation Rules:** None
*   **Authentication Requirements:** Access Token and HTTP-Only Cookie Refresh Token required.
*   **Rate Limit:** 30 requests per minute.
*   **Example Request:**
    ```bash
    curl -X POST https://api.aitripplanner.com/api/v1/auth/logout \
      -H "Authorization: Bearer eyJhbGciOiJIUzI1Ni..." \
      -H "Cookie: refreshToken=rt_8b3f..."
    ```
*   **Example Response:** (See Success Response)

---

### 2.4. POST `/auth/refresh`
*   **Purpose:** Rotate access tokens using a valid refresh token.
*   **HTTP Method:** `POST`
*   **Endpoint:** `/api/v1/auth/refresh`
*   **Request Headers:**
    *   `Cookie: refreshToken=<refreshToken>`
*   **Path Parameters:** None
*   **Query Parameters:** None
*   **Request Body:** None
*   **Success Response (200 OK):**
    *   `Status Code: 200`
    *   *Headers:* `Set-Cookie: refreshToken=rt_new9823...; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`
    ```json
    {
      "success": true,
      "message": "Token refreshed successfully",
      "data": {
        "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c3JfNmY4YjJjNGQ5YTFlIn0...",
        "expiresInSeconds": 900
      }
    }
    ```
*   **Error Response (403 Forbidden):**
    *   `Status Code: 403`
    ```json
    {
      "success": false,
      "message": "Refresh token invalid or expired",
      "errors": []
    }
    ```
*   **Validation Rules:** None
*   **Authentication Requirements:** HTTP-Only Refresh Token Cookie must be present.
*   **Rate Limit:** 30 requests per minute.
*   **Example Request:**
    ```bash
    curl -X POST https://api.aitripplanner.com/api/v1/auth/refresh \
      -H "Cookie: refreshToken=rt_8b3f..."
    ```
*   **Example Response:** (See Success Response)

---

### 2.5. GET `/auth/profile`
*   **Purpose:** Get profile details of the authenticated user.
*   **HTTP Method:** `GET`
*   **Endpoint:** `/api/v1/auth/profile`
*   **Request Headers:**
    *   `Authorization: Bearer <accessToken>`
*   **Path Parameters:** None
*   **Query Parameters:** None
*   **Request Body:** None
*   **Success Response (200 OK):**
    *   `Status Code: 200`
    ```json
    {
      "success": true,
      "message": "Profile fetched successfully",
      "data": {
        "userId": "usr_6f8b2c4d9a1e",
        "email": "user@example.com",
        "name": "John Doe",
        "createdAt": "2026-06-10T21:13:20.000Z"
      }
    }
    ```
*   **Error Response (401 Unauthorized):**
    *   `Status Code: 401`
    ```json
    {
      "success": false,
      "message": "Access token expired or missing",
      "errors": []
    }
    ```
*   **Validation Rules:** None
*   **Authentication Requirements:** Valid Access Token in Auth Header.
*   **Rate Limit:** 60 requests per minute.
*   **Example Request:**
    ```bash
    curl -H "Authorization: Bearer eyJhbGciOiJIUzI1Ni..." https://api.aitripplanner.com/api/v1/auth/profile
    ```
*   **Example Response:** (See Success Response)

---

## 3. Trip Management Endpoints

### 3.1. POST `/trips`
*   **Purpose:** Create a new trip profile entry.
*   **HTTP Method:** `POST`
*   **Endpoint:** `/api/v1/trips`
*   **Request Headers:**
    *   `Authorization: Bearer <accessToken>`
    *   `Content-Type: application/json`
*   **Path Parameters:** None
*   **Query Parameters:** None
*   **Request Body (DTO):**
    ```json
    {
      "origin": "Anakapalle",
      "destinationList": ["Shirdi", "Tirupati", "Hyderabad"],
      "startDate": "2026-08-01",
      "endDate": "2026-08-10",
      "budgetTier": "Moderate"
    }
    ```
*   **Success Response (211 Created):**
    *   `Status Code: 201`
    ```json
    {
      "success": true,
      "message": "Trip created successfully",
      "data": {
        "tripId": "trp_9d8e7c6b5a4f",
        "origin": "Anakapalle",
        "destinationList": ["Shirdi", "Tirupati", "Hyderabad"],
        "startDate": "2026-08-01T00:00:00.000Z",
        "endDate": "2026-08-10T00:00:00.000Z",
        "budgetTier": "Moderate",
        "totalCost": 0,
        "segments": [],
        "days": [],
        "createdAt": "2026-06-10T21:13:20.000Z"
      }
    }
    ```
*   **Error Response (400 Bad Request):**
    *   `Status Code: 400`
    ```json
    {
      "success": false,
      "message": "Validation failed",
      "errors": [
        {
          "field": "body.destinationList",
          "message": "Destination list must contain at least 1 destination."
        }
      ]
    }
    ```
*   **Validation Rules:**
    *   `origin`: String, required, non-empty, max 100 chars.
    *   `destinationList`: Array of Strings, required, min length 1.
    *   `startDate`: Date string (ISO 8601), required, must be in the future.
    *   `endDate`: Date string (ISO 8601), required, must be after `startDate`.
    *   `budgetTier`: String, required, enum: `["Budget", "Moderate", "Luxury"]`.
*   **Authentication Requirements:** Valid Access Token.
*   **Rate Limit:** 20 requests per minute.
*   **Example Request:**
    ```bash
    curl -X POST https://api.aitripplanner.com/api/v1/trips \
      -H "Authorization: Bearer eyJhbGciOiJIUzI1Ni..." \
      -H "Content-Type: application/json" \
      -d '{"origin":"Anakapalle","destinationList":["Shirdi","Tirupati","Hyderabad"],"startDate":"2026-08-01","endDate":"2026-08-10","budgetTier":"Moderate"}'
    ```
*   **Example Response:** (See Success Response)

---

### 3.2. GET `/trips`
*   **Purpose:** Retrieve a paginated list of trips saved by the user.
*   **HTTP Method:** `GET`
*   **Endpoint:** `/api/v1/trips`
*   **Request Headers:**
    *   `Authorization: Bearer <accessToken>`
*   **Path Parameters:** None
*   **Query Parameters:**
    *   `page`: Number, optional, default: `1`
    *   `limit`: Number, optional, default: `10`
*   **Request Body:** None
*   **Success Response (200 OK):**
    *   `Status Code: 200`
    ```json
    {
      "success": true,
      "message": "Trips fetched successfully",
      "data": {
        "trips": [
          {
            "tripId": "trp_9d8e7c6b5a4f",
            "origin": "Anakapalle",
            "destinationList": ["Shirdi", "Tirupati"],
            "startDate": "2026-08-01T00:00:00.000Z",
            "endDate": "2026-08-10T00:00:00.000Z",
            "budgetTier": "Moderate"
          }
        ],
        "pagination": {
          "totalItems": 1,
          "totalPages": 1,
          "currentPage": 1,
          "limit": 10
        }
      }
    }
    ```
*   **Error Response (401 Unauthorized):**
    *   `Status Code: 401`
    ```json
    {
      "success": false,
      "message": "Access token expired or missing",
      "errors": []
    }
    ```
*   **Validation Rules:**
    *   `page`: Optional, minimum value 1.
    *   `limit`: Optional, value between 1 and 100.
*   **Authentication Requirements:** Valid Access Token.
*   **Rate Limit:** 60 requests per minute.
*   **Example Request:**
    ```bash
    curl -H "Authorization: Bearer eyJhbGciOiJIUzI1Ni..." "https://api.aitripplanner.com/api/v1/trips?page=1&limit=10"
    ```
*   **Example Response:** (See Success Response)

---

### 3.3. GET `/trips/:tripId`
*   **Purpose:** Fetch the full parameters and items of a specific trip.
*   **HTTP Method:** `GET`
*   **Endpoint:** `/api/v1/trips/:tripId`
*   **Request Headers:**
    *   `Authorization: Bearer <accessToken>`
*   **Path Parameters:**
    *   `tripId`: String, required. Format: `trp_[a-f0-9]{12}`.
*   **Query Parameters:** None
*   **Request Body:** None
*   **Success Response (200 OK):**
    *   `Status Code: 200`
    ```json
    {
      "success": true,
      "message": "Trip fetched successfully",
      "data": {
        "tripId": "trp_9d8e7c6b5a4f",
        "origin": "Anakapalle",
        "destinationList": ["Shirdi", "Tirupati", "Hyderabad"],
        "startDate": "2026-08-01T00:00:00.000Z",
        "endDate": "2026-08-10T00:00:00.000Z",
        "budgetTier": "Moderate",
        "totalCost": 350.00,
        "segments": [
          {
            "segmentId": "sg_1",
            "source": "Anakapalle",
            "destination": "Shirdi",
            "estimatedCost": 150.00,
            "estimatedDuration": 360
          }
        ],
        "days": []
      }
    }
    ```
*   **Error Response (404 Not Found):**
    *   `Status Code: 404`
    ```json
    {
      "success": false,
      "message": "Trip not found",
      "errors": []
    }
    ```
*   **Validation Rules:**
    *   `tripId`: Must match MongoDB ID structure or system trip key template.
*   **Authentication Requirements:** Valid Access Token. Requires ownership of the trip or matching read token.
*   **Rate Limit:** 100 requests per minute.
*   **Example Request:**
    ```bash
    curl -H "Authorization: Bearer eyJhbGciOiJIUzI1Ni..." https://api.aitripplanner.com/api/v1/trips/trp_9d8e7c6b5a4f
    ```
*   **Example Response:** (See Success Response)

---

### 3.4. PUT `/trips/:tripId`
*   **Purpose:** Modify overall trip parameters (dates, budget, properties).
*   **HTTP Method:** `PUT`
*   **Endpoint:** `/api/v1/trips/:tripId`
*   **Request Headers:**
    *   `Authorization: Bearer <accessToken>`
    *   `Content-Type: application/json`
*   **Path Parameters:**
    *   `tripId`: String, required.
*   **Query Parameters:** None
*   **Request Body (DTO):**
    ```json
    {
      "startDate": "2026-08-05",
      "endDate": "2026-08-15",
      "budgetTier": "Luxury"
    }
    ```
*   **Success Response (200 OK):**
    *   `Status Code: 200`
    ```json
    {
      "success": true,
      "message": "Trip updated successfully",
      "data": {
        "tripId": "trp_9d8e7c6b5a4f",
        "origin": "Anakapalle",
        "destinationList": ["Shirdi", "Tirupati", "Hyderabad"],
        "startDate": "2026-08-05T00:00:00.000Z",
        "endDate": "2026-08-15T00:00:00.000Z",
        "budgetTier": "Luxury",
        "totalCost": 0
      }
    }
    ```
*   **Error Response (403 Forbidden):**
    *   `Status Code: 403`
    ```json
    {
      "success": false,
      "message": "You are not authorized to modify this trip",
      "errors": []
    }
    ```
*   **Validation Rules:**
    *   `startDate`: Optional, ISO 8601 Date.
    *   `endDate`: Optional, ISO 8601 Date, must be after `startDate`.
    *   `budgetTier`: Optional, enum `["Budget", "Moderate", "Luxury"]`.
*   **Authentication Requirements:** Valid Access Token (Owner only).
*   **Rate Limit:** 30 requests per minute.
*   **Example Request:**
    ```bash
    curl -X PUT https://api.aitripplanner.com/api/v1/trips/trp_9d8e7c6b5a4f \
      -H "Authorization: Bearer eyJhbGciOiJIUzI1Ni..." \
      -H "Content-Type: application/json" \
      -d '{"startDate":"2026-08-05","endDate":"2026-08-15","budgetTier":"Luxury"}'
    ```
*   **Example Response:** (See Success Response)

---

### 3.5. DELETE `/trips/:tripId`
*   **Purpose:** Soft-delete a trip entry from the system.
*   **HTTP Method:** `DELETE`
*   **Endpoint:** `/api/v1/trips/:tripId`
*   **Request Headers:**
    *   `Authorization: Bearer <accessToken>`
*   **Path Parameters:**
    *   `tripId`: String, required.
*   **Query Parameters:** None
*   **Request Body:** None
*   **Success Response (200 OK):**
    *   `Status Code: 200`
    ```json
    {
      "success": true,
      "message": "Trip deleted successfully",
      "data": {}
    }
    ```
*   **Error Response (404 Not Found):**
    *   `Status Code: 404`
    ```json
    {
      "success": false,
      "message": "Trip not found or already deleted",
      "errors": []
    }
    ```
*   **Validation Rules:** None
*   **Authentication Requirements:** Valid Access Token (Owner only).
*   **Rate Limit:** 20 requests per minute.
*   **Example Request:**
    ```bash
    curl -X DELETE https://api.aitripplanner.com/api/v1/trips/trp_9d8e7c6b5a4f \
      -H "Authorization: Bearer eyJhbGciOiJIUzI1Ni..."
    ```
*   **Example Response:** (See Success Response)

---

## 4. Trip Segment Endpoints

### 4.1. POST `/trips/:tripId/segments`
*   **Purpose:** Appends a new travel segment dynamically to a trip.
*   **HTTP Method:** `POST`
*   **Endpoint:** `/api/v1/trips/:tripId/segments`
*   **Request Headers:**
    *   `Authorization: Bearer <accessToken>`
    *   `Content-Type: application/json`
*   **Path Parameters:**
    *   `tripId`: String, required.
*   **Query Parameters:** None
*   **Request Body (DTO):**
    ```json
    {
      "source": "Anakapalle",
      "destination": "Shirdi"
    }
    ```
*   **Success Response (201 Created):**
    *   `Status Code: 201`
    ```json
    {
      "success": true,
      "message": "Segment added successfully",
      "data": {
        "segmentId": "sg_1",
        "source": "Anakapalle",
        "destination": "Shirdi",
        "recommendedRoute": {},
        "alternativeRoutes": [],
        "estimatedCost": 0,
        "estimatedDuration": 0
      }
    }
    ```
*   **Error Response (400 Bad Request):**
    *   `Status Code: 400`
    ```json
    {
      "success": false,
      "message": "Validation failed",
      "errors": [
        {
          "field": "body.destination",
          "message": "Destination location is required."
        }
      ]
    }
    ```
*   **Validation Rules:**
    *   `source`: String, required.
    *   `destination`: String, required.
*   **Authentication Requirements:** Valid Access Token (Owner only).
*   **Rate Limit:** 30 requests per minute.
*   **Example Request:**
    ```bash
    curl -X POST https://api.aitripplanner.com/api/v1/trips/trp_9d8e7c6b5a4f/segments \
      -H "Authorization: Bearer eyJhbGciOiJIUzI1Ni..." \
      -H "Content-Type: application/json" \
      -d '{"source":"Anakapalle","destination":"Shirdi"}'
    ```
*   **Example Response:** (See Success Response)

---

### 4.2. PUT `/trips/:tripId/segments/:segmentId`
*   **Purpose:** Update segment details or custom transport arrangements manually.
*   **HTTP Method:** `PUT`
*   **Endpoint:** `/api/v1/trips/:tripId/segments/:segmentId`
*   **Request Headers:**
    *   `Authorization: Bearer <accessToken>`
    *   `Content-Type: application/json`
*   **Path Parameters:**
    *   `tripId`: String, required.
    *   `segmentId`: String, required.
*   **Query Parameters:** None
*   **Request Body (DTO):**
    ```json
    {
      "estimatedCost": 120.00,
      "estimatedDuration": 320
    }
    ```
*   **Success Response (200 OK):**
    *   `Status Code: 200`
    ```json
    {
      "success": true,
      "message": "Segment updated successfully",
      "data": {
        "segmentId": "sg_1",
        "source": "Anakapalle",
        "destination": "Shirdi",
        "estimatedCost": 120.00,
        "estimatedDuration": 320
      }
    }
    ```
*   **Error Response (404 Not Found):**
    *   `Status Code: 404`
    ```json
    {
      "success": false,
      "message": "Segment not found",
      "errors": []
    }
    ```
*   **Validation Rules:**
    *   `estimatedCost`: Optional, positive number.
    *   `estimatedDuration`: Optional, positive integer (minutes).
*   **Authentication Requirements:** Valid Access Token (Owner only).
*   **Rate Limit:** 30 requests per minute.
*   **Example Request:**
    ```bash
    curl -X PUT https://api.aitripplanner.com/api/v1/trips/trp_9d8e7c6b5a4f/segments/sg_1 \
      -H "Authorization: Bearer eyJhbGciOiJIUzI1Ni..." \
      -H "Content-Type: application/json" \
      -d '{"estimatedCost":120.00,"estimatedDuration":320}'
    ```
*   **Example Response:** (See Success Response)

---

### 4.3. DELETE `/trips/:tripId/segments/:segmentId`
*   **Purpose:** Delete a segment from a trip.
*   **HTTP Method:** `DELETE`
*   **Endpoint:** `/api/v1/trips/:tripId/segments/:segmentId`
*   **Request Headers:**
    *   `Authorization: Bearer <accessToken>`
*   **Path Parameters:**
    *   `tripId`: String, required.
    *   `segmentId`: String, required.
*   **Query Parameters:** None
*   **Request Body:** None
*   **Success Response (200 OK):**
    *   `Status Code: 200`
    ```json
    {
      "success": true,
      "message": "Segment deleted successfully",
      "data": {}
    }
    ```
*   **Error Response (404 Not Found):**
    *   `Status Code: 404`
    ```json
    {
      "success": false,
      "message": "Segment not found",
      "errors": []
    }
    ```
*   **Validation Rules:** None
*   **Authentication Requirements:** Valid Access Token (Owner only).
*   **Rate Limit:** 30 requests per minute.
*   **Example Request:**
    ```bash
    curl -X DELETE https://api.aitripplanner.com/api/v1/trips/trp_9d8e7c6b5a4f/segments/sg_1 \
      -H "Authorization: Bearer eyJhbGciOiJIUzI1Ni..."
    ```
*   **Example Response:** (See Success Response)

---

## 5. Transport Analysis Endpoints

### 5.1. POST `/transport/analyze`
*   **Purpose:** Run a comprehensive transportation analysis across a single segment to get flight, rail, and driving plans.
*   **HTTP Method:** `POST`
*   **Endpoint:** `/api/v1/transport/analyze`
*   **Request Headers:**
    *   `Content-Type: application/json`
*   **Path Parameters:** None
*   **Query Parameters:** None
*   **Request Body (DTO):**
    ```json
    {
      "source": "Anakapalle",
      "destination": "Shirdi",
      "travelDate": "2026-08-01",
      "travelers": 1
    }
    ```
*   **Success Response (200 OK):**
    *   `Status Code: 200`
    ```json
    {
      "success": true,
      "message": "Transportation analysis completed",
      "data": {
        "recommendedRoute": {
          "routeId": "rt_rec_01",
          "steps": [
            "Taxi from Anakapalle to Vizag Airport (VTZ)",
            "Flight from VTZ to Hyderabad (HYD)",
            "Flight from HYD to Shirdi Airport (SAG)",
            "Taxi from SAG to Shirdi"
          ],
          "reason": "Fastest route, saves 8 hours of travel time within moderate budget constraints.",
          "cost": 135.00,
          "duration": 360
        },
        "flightOptions": [
          {
            "flightNumber": "AI-829",
            "departure": "VTZ 08:00",
            "arrival": "SAG 14:00",
            "price": 110.00,
            "duration": 360
          }
        ],
        "trainOptions": [
          {
            "trainNumber": "17206",
            "name": "COA SNSI EXP",
            "departure": "Vizag 09:20",
            "arrival": "Kopargaon 08:45 (+1 day)",
            "price": 25.00,
            "duration": 1405
          }
        ],
        "alternativeRoutes": [
          {
            "routeId": "rt_alt_01",
            "steps": [
              "Train from Anakapalle to Kopargaon Station",
              "Local Bus from Kopargaon to Shirdi"
            ],
            "cost": 28.00,
            "duration": 1440
          }
        ]
      }
    }
    ```
*   **Error Response (400 Bad Request):**
    *   `Status Code: 400`
    ```json
    {
      "success": false,
      "message": "Validation failed",
      "errors": [
        {
          "field": "body.travelers",
          "message": "Travelers count must be at least 1."
        }
      ]
    }
    ```
*   **Validation Rules:**
    *   `source`: String, required.
    *   `destination`: String, required.
    *   `travelDate`: ISO 8601 Date string, required, future date.
    *   `travelers`: Integer, required, minimum: 1.
*   **Authentication Requirements:** None (Public / Authenticated)
*   **Rate Limit:** 10 requests per minute.
*   **Example Request:**
    ```bash
    curl -X POST https://api.aitripplanner.com/api/v1/transport/analyze \
      -H "Content-Type: application/json" \
      -d '{"source":"Anakapalle","destination":"Shirdi","travelDate":"2026-08-01","travelers":1}'
    ```
*   **Example Response:** (See Success Response)

---

## 6. Flight Search Endpoints

### 6.1. POST `/flights/search`
*   **Purpose:** Look up active flight offers between city/airport pairs.
*   **HTTP Method:** `POST`
*   **Endpoint:** `/api/v1/flights/search`
*   **Request Headers:**
    *   `Content-Type: application/json`
*   **Path Parameters:** None
*   **Query Parameters:** None
*   **Request Body (DTO):**
    ```json
    {
      "source": "Vizag (VTZ)",
      "destination": "Shirdi (SAG)",
      "date": "2026-08-01"
    }
    ```
*   **Success Response (200 OK):**
    *   `Status Code: 200`
    ```json
    {
      "success": true,
      "message": "Flights fetched successfully",
      "data": {
        "flights": [
          {
            "flightId": "fl_9832",
            "airline": "IndiGo",
            "flightNumber": "6E-7281",
            "departureAirport": "VTZ",
            "arrivalAirport": "SAG",
            "departureTime": "2026-08-01T08:00:00.000Z",
            "arrivalTime": "2026-08-01T14:00:00.000Z",
            "stops": 1,
            "layoverDetails": ["HYD"],
            "price": 110.00,
            "currency": "USD"
          }
        ]
      }
    }
    ```
*   **Error Response (400 Bad Request):**
    *   `Status Code: 400`
    ```json
    {
      "success": false,
      "message": "Invalid date format",
      "errors": []
    }
    ```
*   **Validation Rules:**
    *   `source`: String, required.
    *   `destination`: String, required.
    *   `date`: ISO 8601 Date format, required.
*   **Authentication Requirements:** None
*   **Rate Limit:** 15 requests per minute.
*   **Example Request:**
    ```bash
    curl -X POST https://api.aitripplanner.com/api/v1/flights/search \
      -H "Content-Type: application/json" \
      -d '{"source":"Vizag (VTZ)","destination":"Shirdi (SAG)","date":"2026-08-01"}'
    ```
*   **Example Response:** (See Success Response)

---

## 7. Train Search Endpoints

### 7.1. POST `/trains/search`
*   **Purpose:** Look up operating train connection schedules.
*   **HTTP Method:** `POST`
*   **Endpoint:** `/api/v1/trains/search`
*   **Request Headers:**
    *   `Content-Type: application/json`
*   **Path Parameters:** None
*   **Query Parameters:** None
*   **Request Body (DTO):**
    ```json
    {
      "source": "Anakapalle",
      "destination": "Kopargaon",
      "date": "2026-08-01"
    }
    ```
*   **Success Response (200 OK):**
    *   `Status Code: 200`
    ```json
    {
      "success": true,
      "message": "Trains fetched successfully",
      "data": {
        "trains": [
          {
            "trainNumber": "17206",
            "trainName": "COA SNSI EXPRESS",
            "sourceStation": "AKP",
            "destinationStation": "KPG",
            "departureTime": "09:20",
            "arrivalTime": "08:45 (+1 day)",
            "runsOn": ["Sat", "Mon", "Wed"],
            "classes": ["2A", "3A", "SL"],
            "price": 25.00
          }
        ]
      }
    }
    ```
*   **Error Response (503 Service Unavailable):**
    *   `Status Code: 503`
    ```json
    {
      "success": false,
      "message": "National Rail Database API unavailable",
      "errors": []
    }
    ```
*   **Validation Rules:**
    *   `source`: String, required.
    *   `destination`: String, required.
    *   `date`: ISO 8601 Date, required.
*   **Authentication Requirements:** None
*   **Rate Limit:** 20 requests per minute.
*   **Example Request:**
    ```bash
    curl -X POST https://api.aitripplanner.com/api/v1/trains/search \
      -H "Content-Type: application/json" \
      -d '{"source":"Anakapalle","destination":"Kopargaon","date":"2026-08-01"}'
    ```
*   **Example Response:** (See Success Response)

---

## 8. Connectivity Analysis Endpoints

### 8.1. POST `/connectivity/analyze`
*   **Purpose:** Find the nearest airports/railway stations and suggest local transfers if the destination lacks direct commercial routes.
*   **HTTP Method:** `POST`
*   **Endpoint:** `/api/v1/connectivity/analyze`
*   **Request Headers:**
    *   `Content-Type: application/json`
*   **Path Parameters:** None
*   **Query Parameters:** None
*   **Request Body (DTO):**
    ```json
    {
      "destination": "Shirdi"
    }
    ```
*   **Success Response (200 OK):**
    *   `Status Code: 200`
    ```json
    {
      "success": true,
      "message": "Connectivity analysis finished",
      "data": {
        "nearestAirport": {
          "name": "Shirdi Airport",
          "code": "SAG",
          "distanceKm": 14.2
        },
        "nearestRailwayStation": {
          "name": "Kopargaon Station",
          "code": "KPG",
          "distanceKm": 16.0
        },
        "localTransportOptions": [
          {
            "mode": "Taxi",
            "estimatedCost": 8.00,
            "estimatedDurationMinutes": 25,
            "frequency": "On-Demand"
          },
          {
            "mode": "Local Shared Auto",
            "estimatedCost": 1.50,
            "estimatedDurationMinutes": 40,
            "frequency": "Every 15 minutes"
          }
        ],
        "recommendation": {
          "steps": [
            "Arrive at Kopargaon Station via train",
            "Take local Taxi from station exit to Shirdi Temple Area (16 km)"
          ],
          "reason": "Most cost-effective last-mile transfer. Safe and readily available."
        }
      }
    }
    ```
*   **Error Response (400 Bad Request):**
    *   `Status Code: 400`
    ```json
    {
      "success": false,
      "message": "Destination cannot be blank",
      "errors": []
    }
    ```
*   **Validation Rules:**
    *   `destination`: String, required, non-empty.
*   **Authentication Requirements:** None
*   **Rate Limit:** 30 requests per minute.
*   **Example Request:**
    ```bash
    curl -X POST https://api.aitripplanner.com/api/v1/connectivity/analyze \
      -H "Content-Type: application/json" \
      -d '{"destination":"Shirdi"}'
    ```
*   **Example Response:** (See Success Response)

---

## 9. AI Itinerary Generation Endpoints

### 9.1. POST `/itinerary/generate`
*   **Purpose:** Query the Gemini AI multi-agent engine to build a daily itinerary of sightseeing, dining, and pacing details.
*   **HTTP Method:** `POST`
*   **Endpoint:** `/api/v1/itinerary/generate`
*   **Request Headers:**
    *   `Authorization: Bearer <accessToken>`
    *   `Content-Type: application/json`
*   **Path Parameters:** None
*   **Query Parameters:** None
*   **Request Body (DTO):**
    ```json
    {
      "tripId": "trp_9d8e7c6b5a4f"
    }
    ```
*   **Success Response (200 OK):**
    *   `Status Code: 200`
    ```json
    {
      "success": true,
      "message": "Itinerary generated successfully",
      "data": {
        "days": [
          {
            "dayNumber": 1,
            "date": "2026-08-02",
            "theme": "Exploring Divine Shirdi",
            "items": [
              {
                "itemId": "itm_1",
                "itemType": "activity",
                "title": "Sai Baba Temple Sai Samadhi Temple",
                "description": "Attend the morning kakad aarti and visit the main temple shrine.",
                "estimatedDurationMinutes": 120,
                "estimatedCost": 0,
                "category": "sightseeing",
                "location": {
                  "name": "Sai Baba Samadhi Temple",
                  "latitude": 19.7712,
                  "longitude": 74.4771
                }
              }
            ]
          }
        ]
      }
    }
    ```
*   **Error Response (500 Internal Server Error / AI Fail):**
    *   `Status Code: 500`
    ```json
    {
      "success": false,
      "message": "AI Generation engine failed to parse response structure. Please try again.",
      "errors": []
    }
    ```
*   **Validation Rules:**
    *   `tripId`: String, required.
*   **Authentication Requirements:** Valid Access Token (Owner only).
*   **Rate Limit:** 3 requests per minute per user.
*   **Example Request:**
    ```bash
    curl -X POST https://api.aitripplanner.com/api/v1/itinerary/generate \
      -H "Authorization: Bearer eyJhbGciOiJIUzI1Ni..." \
      -H "Content-Type: application/json" \
      -d '{"tripId":"trp_9d8e7c6b5a4f"}'
    ```
*   **Example Response:** (See Success Response)

---

## 10. Budget Estimation Endpoints

### 10.1. POST `/budget/calculate`
*   **Purpose:** Calculate the aggregated cost breakdown of a planned trip across all days, activities, and transport legs.
*   **HTTP Method:** `POST`
*   **Endpoint:** `/api/v1/budget/calculate`
*   **Request Headers:**
    *   `Authorization: Bearer <accessToken>`
    *   `Content-Type: application/json`
*   **Path Parameters:** None
*   **Query Parameters:** None
*   **Request Body (DTO):**
    ```json
    {
      "tripId": "trp_9d8e7c6b5a4f"
    }
    ```
*   **Success Response (200 OK):**
    *   `Status Code: 200`
    ```json
    {
      "success": true,
      "message": "Budget calculated successfully",
      "data": {
        "transportCost": 135.00,
        "hotelCost": 150.00,
        "foodCost": 45.00,
        "miscCost": 20.00,
        "totalCost": 350.00
      }
    }
    ```
*   **Error Response (404 Not Found):**
    *   `Status Code: 404`
    ```json
    {
      "success": false,
      "message": "Trip not found",
      "errors": []
    }
    ```
*   **Validation Rules:**
    *   `tripId`: String, required.
*   **Authentication Requirements:** Valid Access Token.
*   **Rate Limit:** 30 requests per minute.
*   **Example Request:**
    ```bash
    curl -X POST https://api.aitripplanner.com/api/v1/budget/calculate \
      -H "Authorization: Bearer eyJhbGciOiJIUzI1Ni..." \
      -H "Content-Type: application/json" \
      -d '{"tripId":"trp_9d8e7c6b5a4f"}'
    ```
*   **Example Response:** (See Success Response)

---

## 11. Maps Endpoints

### 11.1. GET `/maps/route`
*   **Purpose:** Fetch route coordinates (Mapbox-compatible GeoJSON line) between consecutive points on a day timeline.
*   **HTTP Method:** `GET`
*   **Endpoint:** `/api/v1/maps/route`
*   **Request Headers:** None
*   **Path Parameters:** None
*   **Query Parameters:**
    *   `coordinates`: String, required. Format: `lon1,lat1;lon2,lat2` (semicolon-separated).
    *   `profile`: String, optional. Enum: `driving`, `walking`, `cycling`. Default: `driving`.
*   **Request Body:** None
*   **Success Response (200 OK):**
    *   `Status Code: 200`
    ```json
    {
      "success": true,
      "message": "Route coordinates fetched successfully",
      "data": {
        "distanceMeters": 16400,
        "durationSeconds": 1500,
        "geometry": {
          "type": "LineString",
          "coordinates": [
            [74.4771, 19.7712],
            [74.4812, 19.7788],
            [74.5245, 19.8821]
          ]
        }
      }
    }
    ```
*   **Error Response (400 Bad Request):**
    *   `Status Code: 400`
    ```json
    {
      "success": false,
      "message": "Invalid coordinates format",
      "errors": []
    }
    ```
*   **Validation Rules:**
    *   `coordinates`: Regular expression check for coordinate segments.
*   **Authentication Requirements:** None
*   **Rate Limit:** 100 requests per minute.
*   **Example Request:**
    ```bash
    curl "https://api.aitripplanner.com/api/v1/maps/route?coordinates=74.4771,19.7712;74.5245,19.8821&profile=driving"
    ```
*   **Example Response:** (See Success Response)

---

### 11.2. GET `/maps/places`
*   **Purpose:** Autocomplete suggestions/search for landmarks and cities.
*   **HTTP Method:** `GET`
*   **Endpoint:** `/api/v1/maps/places`
*   **Request Headers:** None
*   **Path Parameters:** None
*   **Query Parameters:**
    *   `query`: String, required. Search string (min 3 chars).
    *   `proximity`: String, optional. Format: `lon,lat`.
*   **Request Body:** None
*   **Success Response (200 OK):**
    *   `Status Code: 200`
    ```json
    {
      "success": true,
      "message": "Places fetched successfully",
      "data": {
        "results": [
          {
            "name": "Shirdi, Maharashtra, India",
            "latitude": 19.7662,
            "longitude": 74.4762,
            "address": "Ahmednagar District, MH, India"
          }
        ]
      }
    }
    ```
*   **Error Response (400 Bad Request):**
    *   `Status Code: 400`
    ```json
    {
      "success": false,
      "message": "Query parameter must be at least 3 characters",
      "errors": []
    }
    ```
*   **Validation Rules:**
    *   `query`: Min length 3 characters, max 100.
*   **Authentication Requirements:** None
*   **Rate Limit:** 120 requests per minute.
*   **Example Request:**
    ```bash
    curl "https://api.aitripplanner.com/api/v1/maps/places?query=Shirdi"
    ```
*   **Example Response:** (See Success Response)

---

## 12. PDF Export Endpoints

### 12.1. POST `/export/pdf`
*   **Purpose:** Trigger the generation of a styled PDF document from trip data, returning a downloadable URL.
*   **HTTP Method:** `POST`
*   **Endpoint:** `/api/v1/export/pdf`
*   **Request Headers:**
    *   `Authorization: Bearer <accessToken>`
    *   `Content-Type: application/json`
*   **Path Parameters:** None
*   **Query Parameters:** None
*   **Request Body (DTO):**
    ```json
    {
      "tripId": "trp_9d8e7c6b5a4f"
    }
    ```
*   **Success Response (200 OK):**
    *   `Status Code: 200`
    ```json
    {
      "success": true,
      "message": "PDF exported successfully",
      "data": {
        "downloadUrl": "https://storage.aitripplanner.com/exports/pdfs/trp_9d8e7c6b5a4f_20260610.pdf"
      }
    }
    ```
*   **Error Response (404 Not Found):**
    *   `Status Code: 404`
    ```json
    {
      "success": false,
      "message": "Trip not found",
      "errors": []
    }
    ```
*   **Validation Rules:**
    *   `tripId`: String, required.
*   **Authentication Requirements:** Valid Access Token.
*   **Rate Limit:** 5 requests per minute.
*   **Example Request:**
    ```bash
    curl -X POST https://api.aitripplanner.com/api/v1/export/pdf \
      -H "Authorization: Bearer eyJhbGciOiJIUzI1Ni..." \
      -H "Content-Type: application/json" \
      -d '{"tripId":"trp_9d8e7c6b5a4f"}'
    ```
*   **Example Response:** (See Success Response)

---

## 13. Trip Sharing Endpoints

### 13.1. POST `/share/:tripId`
*   **Purpose:** Set trip access status to shared and return a public read-only link.
*   **HTTP Method:** `POST`
*   **Endpoint:** `/api/v1/share/:tripId`
*   **Request Headers:**
    *   `Authorization: Bearer <accessToken>`
*   **Path Parameters:**
    *   `tripId`: String, required.
*   **Query Parameters:** None
*   **Request Body:** None
*   **Success Response (200 OK):**
    *   `Status Code: 200`
    ```json
    {
      "success": true,
      "message": "Trip sharing active",
      "data": {
        "shareUrl": "https://aitripplanner.com/shared/trip_9d8e7c6b5a4f?token=sh_tkn89a3c20e11"
      }
    }
    ```
*   **Error Response (403 Forbidden):**
    *   `Status Code: 403`
    ```json
    {
      "success": false,
      "message": "Access denied",
      "errors": []
    }
    ```
*   **Validation Rules:** None
*   **Authentication Requirements:** Valid Access Token (Owner only).
*   **Rate Limit:** 30 requests per minute.
*   **Example Request:**
    ```bash
    curl -X POST https://api.aitripplanner.com/api/v1/share/trp_9d8e7c6b5a4f \
      -H "Authorization: Bearer eyJhbGciOiJIUzI1Ni..."
    ```
*   **Example Response:** (See Success Response)

---

## 14. Offline Sync Endpoints

### 14.1. POST `/sync`
*   **Purpose:** Synchronize client-side offline-created trips or edits (queued in IndexedDB) with the server database.
*   **HTTP Method:** `POST`
*   **Endpoint:** `/api/v1/sync`
*   **Request Headers:**
    *   `Authorization: Bearer <accessToken>`
    *   `Content-Type: application/json`
*   **Path Parameters:** None
*   **Query Parameters:** None
*   **Request Body (DTO):**
    ```json
    {
      "syncQueue": [
        {
          "action": "CREATE_TRIP",
          "tempId": "tmp_991823",
          "payload": {
            "origin": "Anakapalle",
            "destinationList": ["Shirdi"],
            "startDate": "2026-08-01",
            "endDate": "2026-08-05",
            "budgetTier": "Moderate"
          }
        }
      ]
    }
    ```
*   **Success Response (200 OK):**
    *   `Status Code: 200`
    ```json
    {
      "success": true,
      "message": "Synchronization completed",
      "data": {
        "resolvedItems": [
          {
            "tempId": "tmp_991823",
            "status": "SYNCED",
            "realId": "trp_9d8e7c6b5a4f"
          }
        ]
      }
    }
    ```
*   **Error Response (400 Bad Request):**
    *   `Status Code: 400`
    ```json
    {
      "success": false,
      "message": "Invalid sync payload format",
      "errors": []
    }
    ```
*   **Validation Rules:**
    *   `syncQueue`: Array of Objects, required.
*   **Authentication Requirements:** Valid Access Token.
*   **Rate Limit:** 10 requests per minute.
*   **Example Request:**
    ```bash
    curl -X POST https://api.aitripplanner.com/api/v1/sync \
      -H "Authorization: Bearer eyJhbGciOiJIUzI1Ni..." \
      -H "Content-Type: application/json" \
      -d '{"syncQueue":[{"action":"CREATE_TRIP","tempId":"tmp_991823","payload":{"origin":"Anakapalle","destinationList":["Shirdi"],"startDate":"2026-08-01","endDate":"2026-08-05","budgetTier":"Moderate"}}]}'
    ```
*   **Example Response:** (See Success Response)

---

### 14.2. GET `/sync/status`
*   **Purpose:** Check sync configuration parameters, schema versions, and pending server updates.
*   **HTTP Method:** `GET`
*   **Endpoint:** `/api/v1/sync/status`
*   **Request Headers:**
    *   `Authorization: Bearer <accessToken>`
*   **Path Parameters:** None
*   **Query Parameters:** None
*   **Request Body:** None
*   **Success Response (200 OK):**
    *   `Status Code: 200`
    ```json
    {
      "success": true,
      "message": "Sync status retrieved",
      "data": {
        "schemaVersion": 2.1,
        "isSyncEnabled": true,
        "lastDatabaseUpdate": "2026-06-10T21:13:20.000Z"
      }
    }
    ```
*   **Error Response (401 Unauthorized):**
    *   `Status Code: 401`
    ```json
    {
      "success": false,
      "message": "Access token expired or missing",
      "errors": []
    }
    ```
*   **Validation Rules:** None
*   **Authentication Requirements:** Valid Access Token.
*   **Rate Limit:** 60 requests per minute.
*   **Example Request:**
    ```bash
    curl -H "Authorization: Bearer eyJhbGciOiJIUzI1Ni..." https://api.aitripplanner.com/api/v1/sync/status
    ```
*   **Example Response:** (See Success Response)

---

## 15. OpenAPI / Swagger Component Schemas

Below are YAML compatible definitions for the primary models in our database.

```yaml
components:
  schemas:
    User:
      type: object
      required:
        - userId
        - email
        - name
      properties:
        userId:
          type: string
          example: usr_6f8b2c4d9a1e
        email:
          type: string
          format: email
          example: user@example.com
        name:
          type: string
          example: John Doe

    Trip:
      type: object
      required:
        - tripId
        - origin
        - destinationList
        - startDate
        - endDate
        - budgetTier
      properties:
        tripId:
          type: string
          example: trp_9d8e7c6b5a4f
        origin:
          type: string
          example: Anakapalle
        destinationList:
          type: array
          items:
            type: string
          example: ["Shirdi", "Tirupati", "Hyderabad"]
        startDate:
          type: string
          format: date-time
          example: "2026-08-01T00:00:00.000Z"
        endDate:
          type: string
          format: date-time
          example: "2026-08-10T00:00:00.000Z"
        budgetTier:
          type: string
          enum: [Budget, Moderate, Luxury]
          example: Moderate
        totalCost:
          type: number
          example: 350.00

    Segment:
      type: object
      required:
        - segmentId
        - source
        - destination
        - estimatedCost
        - estimatedDuration
      properties:
        segmentId:
          type: string
          example: sg_1
        source:
          type: string
          example: Anakapalle
        destination:
          type: string
          example: Shirdi
        estimatedCost:
          type: number
          example: 120.00
        estimatedDuration:
          type: integer
          description: duration in minutes
          example: 320
```
