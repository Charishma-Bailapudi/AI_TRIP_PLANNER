# Train Search Skill

## Purpose
The Train Search Skill enables the AI Trip Planner to query, filter, rank, and recommend rail transit options. It assesses routes, evaluates seat/berth availability, checks multiple passenger classes, and ranks schedules according to cost, class preference, and ticket availability.

## Responsibilities
- Parse rail search parameters including station codes, route preferences, departure windows, and passenger counts.
- Fetch real-time schedule, availability, and fare data from national or private rail operator APIs (e.g., National Rail, DB, SNCF, IRCTC, Amtrak).
- Resolve transit station names to official rail station codes.
- Rank trains dynamically using a multi-factor score emphasizing cost, availability state, and ticket class alignment.
- Handle multi-leg rail journeys when direct connections are unavailable.
- Provide warnings regarding booking rules, reservation windows, and refund/cancellation policies.

## Inputs (JSON Schema & Example)

### JSON Schema
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "TrainSearchInput",
  "type": "object",
  "properties": {
    "originStation": {
      "type": "string",
      "description": "Station code or standardized station name (e.g., 'PAD' for London Paddington, 'NDLS' for New Delhi)"
    },
    "destinationStation": {
      "type": "string",
      "description": "Station code or standardized station name (e.g., 'KGX' for London King's Cross)"
    },
    "departureDate": {
      "type": "string",
      "format": "date",
      "description": "Departure date in YYYY-MM-DD format"
    },
    "departureTimeWindow": {
      "type": "object",
      "properties": {
        "start": { "type": "string", "pattern": "^[0-2][0-9]:[0-5][0-9]$" },
        "end": { "type": "string", "pattern": "^[0-2][0-9]:[0-5][0-9]$" }
      }
    },
    "passengers": {
      "type": "object",
      "properties": {
        "adults": { "type": "integer", "minimum": 1, "default": 1 },
        "children": { "type": "integer", "minimum": 0, "default": 0 }
      },
      "required": ["adults"]
    },
    "preferences": {
      "type": "object",
      "properties": {
        "preferredClasses": {
          "type": "array",
          "items": { "type": "string" },
          "description": "List of preferred class codes (e.g., '1ST', '2ND', 'AC1', 'AC2', 'SL')"
        },
        "maxPrice": { "type": "number", "minimum": 0 },
        "currency": { "type": "string", "pattern": "^[A-Z]{3}$", "default": "USD" },
        "rankingWeight": {
          "type": "object",
          "properties": {
            "cost": { "type": "number", "minimum": 0.0, "maximum": 1.0 },
            "availability": { "type": "number", "minimum": 0.0, "maximum": 1.0 },
            "class": { "type": "number", "minimum": 0.0, "maximum": 1.0 }
          },
          "required": ["cost", "availability", "class"]
        }
      }
    }
  },
  "required": ["originStation", "destinationStation", "departureDate", "passengers"]
}
```

### JSON Input Example
```json
{
  "originStation": "PARIS_GARE_LYON",
  "destinationStation": "NICE_VILLE",
  "departureDate": "2026-08-01",
  "departureTimeWindow": {
    "start": "08:00",
    "end": "14:00"
  },
  "passengers": {
    "adults": 2,
    "children": 0
  },
  "preferences": {
    "preferredClasses": ["1ST", "2ND"],
    "maxPrice": 300.00,
    "currency": "EUR",
    "rankingWeight": {
      "cost": 0.4,
      "availability": 0.4,
      "class": 0.2
    }
  }
}
```

## Outputs (JSON Schema & Example)

### JSON Schema
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "TrainSearchOutput",
  "type": "object",
  "properties": {
    "searchId": { "type": "string", "format": "uuid" },
    "searchResults": {
      "type": "array",
      "items": { "$ref": "#/definitions/TrainOption" }
    },
    "confidenceScore": { "type": "number", "minimum": 0.0, "maximum": 1.0 },
    "notes": { "type": "string" }
  },
  "required": ["searchId", "searchResults", "confidenceScore"],
  "definitions": {
    "TrainOption": {
      "type": "object",
      "properties": {
        "trainNumber": { "type": "string" },
        "trainName": { "type": "string" },
        "operator": { "type": "string" },
        "departureStation": { "type": "string" },
        "arrivalStation": { "type": "string" },
        "departureTime": { "type": "string", "format": "date-time" },
        "arrivalTime": { "type": "string", "format": "date-time" },
        "durationMinutes": { "type": "integer" },
        "rankingScore": { "type": "number" },
        "classes": {
          "type": "array",
          "items": { "$ref": "#/definitions/TrainClassOption" }
        }
      },
      "required": [
        "trainNumber", 
        "departureStation", 
        "arrivalStation", 
        "departureTime", 
        "arrivalTime", 
        "durationMinutes", 
        "rankingScore", 
        "classes"
      ]
    },
    "TrainClassOption": {
      "type": "object",
      "properties": {
        "classCode": { "type": "string" },
        "className": { "type": "string" },
        "pricePerPassenger": { "type": "number" },
        "currency": { "type": "string" },
        "availabilityStatus": { 
          "type": "string", 
          "enum": ["AVAILABLE", "LIMITED", "WAITLISTED", "UNAVAILABLE"] 
        },
        "availableSeats": { "type": "integer" }
      },
      "required": ["classCode", "className", "pricePerPassenger", "currency", "availabilityStatus"]
    }
  }
}
```

### JSON Output Example
```json
{
  "searchId": "9d1b7a2f-119c-482d-8e43-e690f05cbfa8",
  "searchResults": [
    {
      "trainNumber": "TGV-6173",
      "trainName": "TGV INOUI",
      "operator": "SNCF",
      "departureStation": "Paris Gare de Lyon",
      "arrivalStation": "Nice Ville",
      "departureTime": "2026-08-01T09:07:00Z",
      "arrivalTime": "2026-08-01T14:55:00Z",
      "durationMinutes": 348,
      "rankingScore": 0.94,
      "classes": [
        {
          "classCode": "2ND",
          "className": "Second Class",
          "pricePerPassenger": 85.00,
          "currency": "EUR",
          "availabilityStatus": "AVAILABLE",
          "availableSeats": 45
        },
        {
          "classCode": "1ST",
          "className": "First Class",
          "pricePerPassenger": 130.00,
          "currency": "EUR",
          "availabilityStatus": "AVAILABLE",
          "availableSeats": 12
        }
      ]
    }
  ],
  "confidenceScore": 0.99,
  "notes": "Direct high-speed rail service available with abundant seat inventory."
}
```

## Decision Rules

1. **Ranking Score Algorithm:**
   Trains are graded using three vectors: Cost ($C$), Availability ($A$), and Class Match ($L$).
   - **Cost Factor ($C$):** Let $C_{\text{norm}} = \frac{\text{Price} - \text{Price}_{\text{min}}}{\text{Price}_{\text{max}} - \text{Price}_{\text{min}}}$. If only one price is available, $C_{\text{norm}} = 0.5$.
   - **Availability Factor ($A$):**
     - `AVAILABLE` (Seats $\ge 10$) $\rightarrow A = 1.0$
     - `LIMITED` (Seats $< 10$) $\rightarrow A = 0.8$
     - `WAITLISTED` (Waitlist number $\le 10$) $\rightarrow A = 0.4$
     - `WAITLISTED` (Waitlist number $> 10$) $\rightarrow A = 0.1$
     - `UNAVAILABLE` $\rightarrow A = 0.0$
   - **Class Match ($L$):**
     - First preferred class $\rightarrow L = 1.0$
     - Alternative preferred class $\rightarrow L = 0.8$
     - Non-preferred class $\rightarrow L = 0.3$
   - **Weighted Score Calculation:**
     $P = (w_{\text{cost}} \times C_{\text{norm}}) + (w_{\text{availability}} \times (1.0 - A)) + (w_{\text{class}} \times (1.0 - L))$
     $\text{RankingScore} = 1.0 - P$ (higher is better, scale $[0.0, 1.0]$).

2. **Waitlist Threshold Handling:**
   If a train option is waitlisted, the agent will filter it out if the waitlist position exceeds 25, as the probability of confirmation falls below acceptable travel risk parameters.

3. **Booking Horizon Policy:**
   If the query date exceeds the rail operator's advance booking window (e.g., 90 days for DB/SNCF, 120 days for IRCTC):
   - Do not throw an error.
   - Return historical schedule tables and estimate price based on average historical fare trends.
   - Reduce the overall output `confidenceScore` to `0.50` and append a warning note regarding the booking reservation window opening date.

## Reasoning Strategy
The agent proceeds through the following query path:
1. **Station Translation:** Resolve raw text or geographical coordinates into specific railway station IDs (e.g. "Paris" to "PARIS_GARE_LYON", "PARIS_MONTPARNASSE", etc.).
2. **Schedule Retrieval:** Query the rail distributor API for matching timetables on the target date.
3. **Availability & Fare Parsing:** Inspect class-specific ticket availabilities and exact price structures.
4. **Ranking Calculation:** Apply the three-factor scoring weights.
5. **Leg Consolidation:** If no direct train exists, check major junction nodes to construct a 2-leg transfer itinerary.

## Data Sources
- **National Rail / Deutsche Bahn / SNCF API Integrators:** Direct APIs or aggregators (like SilverRail, Distrail) for European rail inventory.
- **IRCTC API / Indian Rail Gateway:** Primary source for Indian Railways routes, ticket classes (1A, 2A, 3A, CC, SL), and waitlist tracking.
- **Amtrak API:** For North American inter-city passenger rail networks.

## Error Handling
- **Operator API Outage:** Switch to an offline cached route timetable database to fetch typical schedules. Set `confidenceScore` to `0.40` and return options with a notice: "Timetables are estimated; real-time seat availability is currently offline."
- **Station Name Ambiguity:** If the user specifies "London", the agent queries all major London terminals (King's Cross, Paddington, Euston, Waterloo) and groups results, highlighting which stations serve the route.
- **Immediate Departure Warning:** If booking occurs within 2 hours of departure, check if online ticketing has closed. If closed, supply station counter ticketing advice.

## Validation Rules
- `departureDate` must be within 365 days in the future.
- `originStation` and `destinationStation` must not resolve to the same railway terminal.
- Time window parameters must use 24-hour military notation (`HH:MM`).

## Confidence Score
The output's `confidenceScore` represents the accuracy of booking:
- **Base Score (1.0):** If real-time tickets are confirmed available for purchase under the budget.
- **Deductions:**
  - Historical schedules utilized (booking window not open): `-0.50`
  - Ticket availability is in `WAITLISTED` state: `-0.40`
  - Route contains transfer legs (multi-hop train): `-0.15`
  - Cached fare data older than 1 hour: `-0.10`

## Example Scenarios

### Scenario 1: High-Speed Route with Cabin Preference (Paris to Nice)
- **Input:** Origin: Paris, Destination: Nice, Date: 2026-08-01, Preferences: 1st Class, Budget: 300 EUR.
- **Process:** Checks TGV schedules. Finds 1st Class seats available at 130 EUR (TGV-6173) and 2nd Class at 85 EUR.
- **Output:** Outputs TGV-6173 with both classes. Because 1st Class matches the preference, it receives the top rank. `confidenceScore` is `1.0`.

### Scenario 2: High Demand Waitlisted Booking (New Delhi to Mumbai)
- **Input:** Origin: NDLS, Destination: BCT, Date: 2026-10-12, Preferences: AC2, AC3 Class.
- **Process:** Queries Indian Rail. The Rajdhani Express AC2 class is waitlisted (WL-3). AC3 class has 15 available seats.
- **Output:** The agent computes scores. The AC3 option receives a higher ranking due to guaranteed availability ($A=1.0$), while AC2 is penalized ($A=0.4$) for being waitlisted. Returns both with AC3 prioritized. `confidenceScore` is `0.90`.

### Scenario 3: Booking Window Not Yet Opened (London to Edinburgh)
- **Input:** Origin: London King's Cross, Destination: Edinburgh Waverley, Date: 2026-12-25, Preferences: 1st Class.
- **Process:** Search date is beyond the standard LNER 90-day booking window.
- **Output:** Returns standard timetable schedules. Fares are flagged as "Estimated Historical Price (~150 GBP)". `confidenceScore` is set to `0.50` with an alert message: "Booking window opens on 2026-09-26. Please set a reminder."

## Dependencies
- **Rail Station Geographic Database:** Maps stations to latitude/longitude coordinates to support spatial transit logic.
- **Timezone DB:** To handle schedules spanning multiple regional time zones.

## Success Criteria
- Query completes and returns ranked results within 2500ms under standard network conditions.
- 100% of train station codes map to validated international databases.
- The rank algorithm correctly assigns higher priority to available seats over waitlisted seats of identical class when weights are equal.
