# Trip Validation Skill

## Purpose
The Trip Validation Skill serves as the quality assurance engine for the trip planner. It analyzes itineraries and travel segments to ensure they satisfy mathematical, physical, chronological, and policy constraints. It checks that date sequences are logical, transit speeds are physically possible, budget thresholds are realistic, and local regulations are respected.

## Responsibilities
- Audit date and time chronology (e.g., verify that departure times follow arrival times, check-out dates succeed check-in dates).
- Perform spatial-temporal speed checks to ensure travel times are physically achievable between consecutive geolocations.
- Enforce business logic boundaries (e.g., maximum group sizes, valid currency codes, minimum and maximum trip durations).
- Detect and flag inefficiencies such as geographic backtracking or excessive transit durations.
- Generate a comprehensive validation report containing error codes, warnings, and remediation suggestions.

## Inputs (JSON schema/example)

### JSON Schema
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "TripValidationInput",
  "type": "object",
  "properties": {
    "tripId": { "type": "string" },
    "startDate": { "type": "string", "format": "date" },
    "endDate": { "type": "string", "format": "date" },
    "travelers": {
      "type": "object",
      "properties": {
        "adultsCount": { "type": "integer", "minimum": 1 },
        "childrenCount": { "type": "integer", "minimum": 0 },
        "infantsCount": { "type": "integer", "minimum": 0 }
      },
      "required": ["adultsCount"]
    },
    "segments": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "segmentId": { "type": "string" },
          "sequence": { "type": "integer" },
          "type": { "type": "string", "enum": ["travel", "lodging"] },
          "details": {
            "type": "object",
            "properties": {
              "mode": { "type": "string" },
              "originLocation": { "type": "string" },
              "destinationLocation": { "type": "string" },
              "departureTime": { "type": "string", "format": "date-time" },
              "arrivalTime": { "type": "string", "format": "date-time" },
              "cost": {
                "type": "object",
                "properties": {
                  "amount": { "type": "number" },
                  "currency": { "type": "string" }
                },
                "required": ["amount", "currency"]
              },
              "coordinates": {
                "type": "object",
                "properties": {
                  "origin": {
                    "type": "object",
                    "properties": {
                      "lat": { "type": "number" },
                      "lng": { "type": "number" }
                    },
                    "required": ["lat", "lng"]
                  },
                  "destination": {
                    "type": "object",
                    "properties": {
                      "lat": { "type": "number" },
                      "lng": { "type": "number" }
                    },
                    "required": ["lat", "lng"]
                  }
                }
              }
            },
            "required": ["mode", "departureTime", "arrivalTime", "cost"]
          }
        },
        "required": ["segmentId", "sequence", "type", "details"]
      }
    },
    "budgetCeiling": {
      "type": "number",
      "description": "User's stated maximum budget to check against calculated segment totals"
    }
  },
  "required": ["tripId", "startDate", "endDate", "travelers", "segments"]
}
```

### JSON Example
```json
{
  "tripId": "trip_987654321_abc",
  "startDate": "2026-06-15",
  "endDate": "2026-06-22",
  "travelers": {
    "adultsCount": 2,
    "childrenCount": 1,
    "infantsCount": 0
  },
  "budgetCeiling": 3000.00,
  "segments": [
    {
      "segmentId": "seg_001_travel",
      "sequence": 1,
      "type": "travel",
      "details": {
        "mode": "train",
        "originLocation": "Paris Gare du Nord",
        "destinationLocation": "London St Pancras",
        "departureTime": "2026-06-15T09:13:00Z",
        "arrivalTime": "2026-06-15T10:39:00Z",
        "cost": { "amount": 180.00, "currency": "EUR" },
        "coordinates": {
          "origin": { "lat": 48.8809, "lng": 2.3553 },
          "destination": { "lat": 51.5300, "lng": -0.1250 }
        }
      }
    },
    {
      "segmentId": "seg_002_lodging",
      "sequence": 2,
      "type": "lodging",
      "details": {
        "mode": "hotel",
        "originLocation": "London, UK",
        "destinationLocation": "St Pancras Renaissance Hotel",
        "departureTime": "2026-06-15T15:00:00Z",
        "arrivalTime": "2026-06-22T11:00:00Z",
        "cost": { "amount": 2100.00, "currency": "EUR" }
      }
    }
  ]
}
```

## Outputs (JSON schema/example with confidence score)

### JSON Schema
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "TripValidationOutput",
  "type": "object",
  "properties": {
    "tripId": { "type": "string" },
    "isValid": {
      "type": "boolean",
      "description": "True if there are zero errors. Warnings do not make a trip invalid."
    },
    "validatedAt": { "type": "string", "format": "date-time" },
    "errors": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "code": { "type": "string" },
          "segmentId": { "type": "string" },
          "message": { "type": "string" },
          "severity": { "type": "string", "enum": ["critical", "error"] }
        },
        "required": ["code", "message", "severity"]
      }
    },
    "warnings": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "code": { "type": "string" },
          "segmentId": { "type": "string" },
          "message": { "type": "string" },
          "remediation": { "type": "string" }
        },
        "required": ["code", "message"]
      }
    },
    "confidenceScore": {
      "type": "object",
      "properties": {
        "overall": { "type": "number", "minimum": 0.0, "maximum": 1.0 },
        "reasoning": { "type": "string" }
      },
      "required": ["overall", "reasoning"]
    }
  },
  "required": ["tripId", "isValid", "validatedAt", "errors", "warnings", "confidenceScore"]
}
```

### JSON Example
```json
{
  "tripId": "trip_987654321_abc",
  "isValid": true,
  "validatedAt": "2026-06-11T12:00:00Z",
  "errors": [],
  "warnings": [
    {
      "code": "WARN_EARLY_ARRIVAL",
      "segmentId": "seg_002_lodging",
      "message": "Arrival time in London (10:39 AM) is significantly earlier than the hotel check-in time (3:00 PM).",
      "remediation": "Request early check-in or arrange luggage storage at London St Pancras."
    }
  ],
  "confidenceScore": {
    "overall": 0.99,
    "reasoning": "Complete geographical coordinates were provided for all travel segments. Validation checks ran with high-precision routing calculations."
  }
}
```

## Decision Rules
1. **Date Chronology**: Every check-out time must be $\ge$ check-in time. For sequential travel segments, departure time of segment $k$ must be $\ge$ arrival time of segment $k-1$.
2. **Speed Violations**:
   - Calculate geodesic distance $d$ between departure and arrival coordinates.
   - Calculate duration $t$ of the segment.
   - If mode is *flight* and $d/t > 1100\text{ km/h}$, flag as error (`ERR_SPEED_IMPOSSIBLE_FLIGHT`).
   - If mode is *train* and $d/t > 350\text{ km/h}$, flag as error (`ERR_SPEED_IMPOSSIBLE_TRAIN`).
   - If mode is *car* and $d/t > 130\text{ km/h}$, flag as warning or error depending on local infrastructure.
3. **Budget Bounds**:
   - Sum all segment costs (normalizing exchange rates).
   - If total cost exceeds `budgetCeiling`, flag warning `WARN_BUDGET_EXCEEDED`.
4. **Transit Overlaps**: If two travel segments overlap temporally, flag as critical error (`ERR_TEMPORAL_OVERLAP`).

## Reasoning Strategy
The validator models the itinerary as a **Directed Acyclic Graph (DAG)** of temporal events:
1. **Topological Sort**: Arranges check-ins, check-outs, departures, and arrivals chronologically.
2. **Chronological Sweep**: Traverses the timeline. If any node has a timestamp less than its predecessor in the topological sequence, it identifies a timeline leak.
3. **Geodesic Assessment**: Evaluates the geographic transitions. Calculates distances using the Vincenty or Haversine formula, divides by elapsed segment time, and compares the speed quotient against vehicle physical constants.
4. **Policy Check**: Validates counts (e.g. infants per adult ratios) against travel regulations (e.g. FAA rules allow max 1 lap child per adult).

## Data Sources
- **WGS 84 Geodesic Database**: For earth curvature calculations.
- **ICAO / IATA Aviation Tables**: For standard flight times and airline rules.
- **Exchange Rates Feeds**: For budget conversions.

## Error Handling
- **Missing Coordinates**: If coordinates are missing, fallback to database city centroid lookup. If city resolution fails, downgrade the validation confidence score and return warning `WARN_GEOLOCATION_ESTIMATED`.
- **Corrupt Date Formats**: If ISO 8601 parsing fails, halt validation and return code `ERR_MALFORMED_TIMESTAMP` with target segment identifier.

## Validation Rules
- **Rule Chrono-01**: `startDate` must be $\le$ `endDate`.
- **Rule Spatial-02**: Destination coordinates of segment $n$ must match origin coordinates of segment $n+1$ within $5.0\text{ km}$ (except for explicit transfer segments).
- **Rule Budget-03**: Total cost calculated must be positive ($\ge 0$).

## Confidence Score
- Calculated based on data fidelity:
  $$\text{Validation Confidence} = 1.0 - (0.15 \times \text{number of city centroids used}) - (0.3 \times \text{missing coordinate counts})$$
- A score of 1.0 means all nodes possess exact coordinates and timestamps.

## Example Scenarios

### Scenario 1: Overlapping Flights (Invalid Timeline)
- **Input**:
  - Segment 1: Flight from New York (JFK) to London (LHR), departing 2026-06-15T18:00:00Z, arriving 2026-06-16T06:00:00Z.
  - Segment 2: Flight from Paris (CDG) to Rome (FCO), departing 2026-06-16T05:00:00Z, arriving 2026-06-16T07:00:00Z.
- **Process**: Sweeper detects that the departure of Segment 2 is earlier than the arrival of Segment 1. It also notes the locations (LHR and CDG) are geographically disparate.
- **Output**: Returns `isValid = false`, error code `ERR_TEMPORAL_OVERLAP` for Segment 2, and details: "Traveler cannot depart Paris while still en route to London." Confidence: 1.0.

### Scenario 2: Impossible Physical Connection (Speed Check Failure)
- **Input**:
  - Segment: Drive from Los Angeles to San Francisco.
  - Duration: Departing 2026-07-01T12:00:00Z, arriving 2026-07-01T13:30:00Z (1.5 hours).
  - Coordinates: LAX (33.9416, -118.4085) to SFO (37.6213, -122.3790).
- **Process**: Calculates distance: ~550 km. Velocity calculation: $550\text{ km} / 1.5\text{ hours} = 366.6\text{ km/h}$. Mode is "car". Speed limit for cars is 130 km/h.
- **Output**: Returns `isValid = false`, error code `ERR_SPEED_IMPOSSIBLE_CAR`. Suggests switching to a flight segment or extending the travel duration to at least 5.5 hours. Confidence: 1.0.

### Scenario 3: Borderline Budget with Policy Check (Warning Trigger)
- **Input**:
  - Travel dates: 2026-08-01 to 2026-08-15 (14 nights).
  - Travelers: 1 Adult, 2 Infants (lap seats).
  - Budget Ceiling: $800.
- **Process**:
  - Infant policy check: 2 infants to 1 adult violates airline safety guidelines (1 lap infant per adult max).
  - Cost analysis: $800 ceiling is too low for 14 nights ($57 per day for 3 people, including flights).
- **Output**: Returns `isValid = false` (due to airline passenger policy violation: `ERR_INFANT_POLICY_VIOLATED`). Returns a warning `WARN_BUDGET_INSUFFICIENT` for the budget ceiling. Confidence: 0.95.

## Dependencies
- **Geocoding Database**: To verify coordinate boundaries.

## Success Criteria
- Catches 100% of date chronology overlaps and impossible speed transit sequences.
- Accurately converts currencies to match budget ceiling constraints.
- Zero false positives on standard, realistic itineraries.
