# Flight Search Skill

## Purpose
The Flight Search Skill enables the AI Trip Planner to query, filter, rank, and recommend commercial flights based on user preferences. It parses user-defined constraints (such as budget, origin/destination, dates, number of stops, and duration) and queries real-time airline flight aggregation systems to output structured, ranked flight options.

## Responsibilities
- Parse flight search criteria from natural language or structured user inputs.
- Retrieve flight inventory, pricing, and schedule data from travel API aggregators (e.g., Amadeus, Sabre, Skyscanner).
- Validate flight schedules and check availability.
- Rank flights based on a multi-criteria scoring algorithm (combining cost, number of stops, and total duration).
- Present detailed flight options including carrier information, layover locations, cabin classes, and baggage policies.
- Formulate alternative travel date recommendations if search yields sub-optimal or zero results.

## Inputs (JSON Schema & Example)

### JSON Schema
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "FlightSearchInput",
  "type": "object",
  "properties": {
    "origin": { 
      "type": "string", 
      "pattern": "^[A-Z]{3}$",
      "description": "3-letter IATA code of the departure airport"
    },
    "destination": { 
      "type": "string", 
      "pattern": "^[A-Z]{3}$",
      "description": "3-letter IATA code of the arrival airport"
    },
    "departureDate": { 
      "type": "string", 
      "format": "date",
      "description": "Departure date in YYYY-MM-DD format"
    },
    "returnDate": { 
      "type": "string", 
      "format": "date",
      "description": "Return date in YYYY-MM-DD format (omit for one-way flights)"
    },
    "passengers": {
      "type": "object",
      "properties": {
        "adults": { "type": "integer", "minimum": 1, "default": 1 },
        "children": { "type": "integer", "minimum": 0, "default": 0 },
        "infants": { "type": "integer", "minimum": 0, "default": 0 }
      },
      "required": ["adults"]
    },
    "preferences": {
      "type": "object",
      "properties": {
        "cabinClass": { 
          "type": "string", 
          "enum": ["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST"],
          "default": "ECONOMY"
        },
        "maxStops": { "type": "integer", "minimum": 0, "maximum": 3, "default": 1 },
        "maxPrice": { "type": "number", "minimum": 0 },
        "currency": { "type": "string", "pattern": "^[A-Z]{3}$", "default": "USD" },
        "preferredAirlines": { 
          "type": "array", 
          "items": { "type": "string", "pattern": "^[A-Z0-9]{2,3}$" } 
        },
        "rankingWeight": {
          "type": "object",
          "properties": {
            "cost": { "type": "number", "minimum": 0.0, "maximum": 1.0 },
            "stops": { "type": "number", "minimum": 0.0, "maximum": 1.0 },
            "duration": { "type": "number", "minimum": 0.0, "maximum": 1.0 }
          },
          "required": ["cost", "stops", "duration"]
        }
      }
    }
  },
  "required": ["origin", "destination", "departureDate", "passengers"]
}
```

### JSON Input Example
```json
{
  "origin": "JFK",
  "destination": "LHR",
  "departureDate": "2026-07-15",
  "returnDate": "2026-07-22",
  "passengers": {
    "adults": 1,
    "children": 0,
    "infants": 0
  },
  "preferences": {
    "cabinClass": "ECONOMY",
    "maxStops": 1,
    "maxPrice": 1200.00,
    "currency": "USD",
    "preferredAirlines": ["UA", "BA", "VS"],
    "rankingWeight": {
      "cost": 0.5,
      "stops": 0.2,
      "duration": 0.3
    }
  }
}
```

## Outputs (JSON Schema & Example)

### JSON Schema
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "FlightSearchOutput",
  "type": "object",
  "properties": {
    "searchId": { "type": "string", "format": "uuid" },
    "searchResults": {
      "type": "array",
      "items": { "$ref": "#/definitions/FlightOption" }
    },
    "confidenceScore": { "type": "number", "minimum": 0.0, "maximum": 1.0 },
    "notes": { "type": "string" }
  },
  "required": ["searchId", "searchResults", "confidenceScore"],
  "definitions": {
    "FlightOption": {
      "type": "object",
      "properties": {
        "flightOptionId": { "type": "string" },
        "totalPrice": { "type": "number" },
        "currency": { "type": "string" },
        "rankingScore": { "type": "number" },
        "outbound": { "$ref": "#/definitions/Itinerary" },
        "inbound": { "$ref": "#/definitions/Itinerary" }
      },
      "required": ["flightOptionId", "totalPrice", "currency", "rankingScore", "outbound"]
    },
    "Itinerary": {
      "type": "object",
      "properties": {
        "segments": {
          "type": "array",
          "items": { "$ref": "#/definitions/Segment" }
        },
        "totalDurationMinutes": { "type": "integer" },
        "stopCount": { "type": "integer" }
      },
      "required": ["segments", "totalDurationMinutes", "stopCount"]
    },
    "Segment": {
      "type": "object",
      "properties": {
        "carrierCode": { "type": "string" },
        "flightNumber": { "type": "string" },
        "departure": { "$ref": "#/definitions/AirportTime" },
        "arrival": { "$ref": "#/definitions/AirportTime" },
        "durationMinutes": { "type": "integer" },
        "cabinClass": { "type": "string" }
      },
      "required": ["carrierCode", "flightNumber", "departure", "arrival", "durationMinutes", "cabinClass"]
    },
    "AirportTime": {
      "type": "object",
      "properties": {
        "airportCode": { "type": "string" },
        "terminal": { "type": "string" },
        "dateTime": { "type": "string", "format": "date-time" }
      },
      "required": ["airportCode", "dateTime"]
    }
  }
}
```

### JSON Output Example
```json
{
  "searchId": "8f5a43b2-602c-47a3-ba09-84729fcfd2b1",
  "searchResults": [
    {
      "flightOptionId": "fl-opt-001",
      "totalPrice": 850.00,
      "currency": "USD",
      "rankingScore": 0.92,
      "outbound": {
        "totalDurationMinutes": 485,
        "stopCount": 0,
        "segments": [
          {
            "carrierCode": "UA",
            "flightNumber": "UA904",
            "departure": {
              "airportCode": "JFK",
              "terminal": "7",
              "dateTime": "2026-07-15T19:30:00Z"
            },
            "arrival": {
              "airportCode": "LHR",
              "terminal": "2",
              "dateTime": "2026-07-16T07:35:00Z"
            },
            "durationMinutes": 485,
            "cabinClass": "ECONOMY"
          }
        ]
      },
      "inbound": {
        "totalDurationMinutes": 515,
        "stopCount": 0,
        "segments": [
          {
            "carrierCode": "UA",
            "flightNumber": "UA905",
            "departure": {
              "airportCode": "LHR",
              "terminal": "2",
              "dateTime": "2026-07-22T12:00:00Z"
            },
            "arrival": {
              "airportCode": "JFK",
              "terminal": "7",
              "dateTime": "2026-07-22T15:35:00Z"
            },
            "durationMinutes": 515,
            "cabinClass": "ECONOMY"
          }
        ]
      }
    }
  ],
  "confidenceScore": 0.98,
  "notes": "Direct flight options matched all user preferences and budget limits."
}
```

## Decision Rules
1. **Price Boundary Warning:** If the cheapest flight option exceeds the user's `preferences.maxPrice`, flag a soft validation error, proceed with listing the options, but automatically trigger an alternative flexible-date search (+/- 3 days) to suggest cheaper choices.
2. **Layover Feasibility Check:**
   - Domestic-to-domestic layovers must be >= 45 minutes.
   - Domestic-to-international or international-to-domestic layovers must be >= 90 minutes.
   - International-to-international layovers must be >= 120 minutes.
   - Any layovers exceeding 8 hours should be flagged to the user. Layovers exceeding 24 hours must be marked as split-journeys and requires user confirmation.
3. **Airline Exclusions:** If a user specifies a list of preferred carriers, prioritize those in the ranking scoring. If the user specifies excluded carriers (though not explicitly in input schema, check local system policies), discard matching flight options.
4. **Scoring Formula (Multi-Criteria):**
   Flights are ranked based on a normalized score calculated using cost, stops, and duration.
   - Let C_norm = (Price - Price_min) / (Price_max - Price_min) (capped between 0 and 1)
   - Let S_norm = Stops / Stops_max (usually Max Stops = 3)
   - Let D_norm = (Duration - Duration_min) / (Duration_max - Duration_min) (capped between 0 and 1)
   - Weighted Penalty (P) = (w_cost * C_norm) + (w_stops * S_norm) + (w_duration * D_norm)
   - Final Ranking Score = 1.0 - P (higher is better, range [0.0, 1.0])

## Reasoning Strategy
The agent employs a step-by-step filtering and synthesis process:
1. **Extraction & Standardization:** Parse raw date strings and clean airport names to official 3-letter IATA airport codes.
2. **Hard-Constraint Filtering:** Discard flights exceeding the maximum stops or violating the passenger count restrictions.
3. **Feasibility Validation:** Run connectivity checks on layovers to ensure the passenger can physically make the connecting flights.
4. **Preference Optimization:** Calculate the ranking score using the specific weights.
5. **Alternative Exploration:** If constraints yield fewer than 3 options, execute fallback queries using nearby airports or flexible dates.

## Data Sources
- **Amadeus Self-Service APIs:** Primary source for commercial flight offers, schedules, and pricing.
- **Skyscanner API via RapidAPI:** Secondary source for budget/low-cost airline inventory not fully covered by GDS systems.
- **OpenFlights Database:** Offline backup for resolving airport coordinates, city associations, and timezone parameters.

## Error Handling
- **API Connection Timeout:** If the primary API fails to respond within 2500ms, retry once. If it still fails, fall back to Skyscanner. Set the final `confidenceScore` to `0.70` and include a warning note.
- **No Direct Matches (Empty Results):** If no flights match the search criteria, do not fail. Instead, widen the date window by +/- 3 days and rerun the query. Output these alternative options and set `confidenceScore` to `0.80` with a message explaining the adjustment.
- **Stale Pricing / Fare Expired:** If a selected flight fare is no longer bookable at the returned price during validation, re-query the specific flight ID, fetch the current fare, update the list, and warn the user.

## Validation Rules
- The `departureDate` must be at least 1 day in the future relative to the transaction system timestamp.
- The `returnDate` (if present) must be equal to or greater than the `departureDate`.
- The passenger configuration must contain at least 1 adult. The total number of passengers (adults + children + infants) must not exceed 9.
- IATA codes must strictly match the `^[A-Z]{3}$` regex pattern.

## Confidence Score
The final output contains a `confidenceScore` between `0.0` and `1.0` reflecting data reliability:
- **Base Score (1.0):** If data is fresh, retrieved directly from Amadeus, and matches all preferences.
- **Penalties:**
  - Cached data used (instead of live pricing API): `-0.20`
  - Max price exceeded: `-0.15`
  - Required cabin class unavailable (downgrade to economy): `-0.30`
  - Secondary/Scrape source utilized: `-0.10`

## Example Scenarios

### Scenario 1: Standard Roundtrip (NYC to LHR)
- **Input:** Origin: JFK, Destination: LHR, Departure: 2026-07-15, Return: 2026-07-22, Adults: 1, maxPrice: 1200.00.
- **Process:** Query Amadeus API. Retrieves 15 flights. Normalizes costs (range $780 - $1450). Filters out flights above $1200. Ranks the remaining 8 flights.
- **Output:** Returns a direct British Airways option ($850, duration 7h 25m) ranked #1 with a `confidenceScore` of `1.0`.

### Scenario 2: High Stops/Duration (SFO to DEL - Mid-budget)
- **Input:** Origin: SFO, Destination: DEL, Departure: 2026-08-10, Adults: 1, maxPrice: 1500.00, Cabin: ECONOMY.
- **Process:** Retrieves itineraries. The cheapest option is $1100 but has a 14-hour layover in Tokyo (NRT), making total duration 32 hours. The second cheapest is $1350 with a 2-hour layover (total 19 hours).
- **Output:** The scoring formula penalizes the 32-hour duration flight. The $1350 flight is ranked #1. The 32-hour flight is flagged with a long layover warning. `confidenceScore` is `0.95`.

### Scenario 3: Destination Airport Connectivity Issue (JFK to Domestic Island Airport)
- **Input:** Origin: JFK, Destination: SBH (St. Barthélemy), Departure: 2026-11-20, Adults: 2, maxPrice: 2000.00.
- **Process:** Direct jet service is not available at SBH due to runway size. The system detects that it must route flights to SXM (Sint Maarten) first, and then transfer to a small shuttle flight (Winair) or a ferry.
- **Output:** Returns flight options to SXM. Flags the need for a secondary transit step (connecting flight/ferry to SBH). `confidenceScore` is `0.85` because transit requires booking an inter-island commuter flight separately.

## Dependencies
- **IATA Airport Registry:** For looking up codes and verifying coordinate points.
- **ExchangeRate API:** To convert live currencies if flights are priced in EUR/GBP but requested in USD.
- **Amadeus / Skyscanner SDKs:** Essential library files for API queries.

## Success Criteria
- Flight searches complete and return ranked structures in under 3000ms.
- 100% of outputs comply with the JSON Schema validation.
- Zero occurrences of recommended flights having illegal layover times (<45 minutes).
