# Segment Builder Skill

## Purpose
The Segment Builder Skill is responsible for converting a high-level sequence of destinations and dates into a detailed, chronological sequence of transit (travel) and lodging (accommodation) segments. It details how the traveler gets from point A to point B and where they stay, ensuring a continuous, gap-free itinerary.

## Responsibilities
- Convert a list of sequential destinations with stay dates into individual, ordered segments.
- Select the optimal transit mode (flight, train, bus, or car rental) based on distance, time, and budget preferences.
- Map precise hubs (e.g., specific airports like CDG, stations like Gare du Nord) for departures and arrivals.
- Structure accommodation segments to align exactly with arrival and departure timestamps.
- Generate layovers, transfers, or intermediate connections where direct routes are not available.
- Calculate and assign a confidence score reflecting the feasibility of the transit timings and availability.

## Inputs (JSON schema/example)

### JSON Schema
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "SegmentBuilderInput",
  "type": "object",
  "properties": {
    "tripId": {
      "type": "string"
    },
    "origin": {
      "type": "string",
      "description": "Starting city of the entire trip"
    },
    "startDate": {
      "type": "string",
      "format": "date"
    },
    "endDate": {
      "type": "string",
      "format": "date"
    },
    "destinations": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "city": { "type": "string" },
          "country": { "type": "string" },
          "sequence": { "type": "integer" },
          "arrivalDate": { "type": "string", "format": "date" },
          "departureDate": { "type": "string", "format": "date" }
        },
        "required": ["city", "country", "sequence", "arrivalDate", "departureDate"]
      }
    },
    "preferences": {
      "type": "object",
      "properties": {
        "preferredTransit": {
          "type": "array",
          "items": {
            "type": "string",
            "enum": ["flight", "train", "bus", "car"]
          }
        },
        "accommodationTier": {
          "type": "string",
          "enum": ["budget", "standard", "luxury"]
        }
      }
    }
  },
  "required": ["tripId", "origin", "startDate", "endDate", "destinations"]
}
```

### JSON Example
```json
{
  "tripId": "trip_987654321_abc",
  "origin": "Paris, France",
  "startDate": "2026-06-15",
  "endDate": "2026-06-22",
  "destinations": [
    {
      "city": "London",
      "country": "United Kingdom",
      "sequence": 1,
      "arrivalDate": "2026-06-15",
      "departureDate": "2026-06-18"
    },
    {
      "city": "Brussels",
      "country": "Belgium",
      "sequence": 2,
      "arrivalDate": "2026-06-18",
      "departureDate": "2026-06-22"
    }
  ],
  "preferences": {
    "preferredTransit": ["train", "flight"],
    "accommodationTier": "standard"
  }
}
```

## Outputs (JSON schema/example with confidence score)

### JSON Schema
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "SegmentBuilderOutput",
  "type": "object",
  "properties": {
    "tripId": {
      "type": "string"
    },
    "segments": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "segmentId": { "type": "string" },
          "sequence": { "type": "integer" },
          "type": {
            "type": "string",
            "enum": ["travel", "lodging"]
          },
          "details": {
            "type": "object",
            "properties": {
              "mode": {
                "type": "string",
                "enum": ["flight", "train", "bus", "car", "hotel", "hostel", "apartment"]
              },
              "originLocation": { "type": "string" },
              "destinationLocation": { "type": "string" },
              "departureTime": { "type": "string", "format": "date-time" },
              "arrivalTime": { "type": "string", "format": "date-time" },
              "provider": { "type": "string" },
              "referenceNumber": { "type": "string" },
              "cost": {
                "type": "object",
                "properties": {
                  "amount": { "type": "number" },
                  "currency": { "type": "string" }
                },
                "required": ["amount", "currency"]
              }
            },
            "required": ["mode", "departureTime", "arrivalTime", "cost"]
          }
        },
        "required": ["segmentId", "sequence", "type", "details"]
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
  "required": ["tripId", "segments", "confidenceScore"]
}
```

### JSON Example
```json
{
  "tripId": "trip_987654321_abc",
  "segments": [
    {
      "segmentId": "seg_001_travel",
      "sequence": 1,
      "type": "travel",
      "details": {
        "mode": "train",
        "originLocation": "Paris Gare du Nord (XPG)",
        "destinationLocation": "London St Pancras (STP)",
        "departureTime": "2026-06-15T09:13:00Z",
        "arrivalTime": "2026-06-15T10:39:00Z",
        "provider": "Eurostar",
        "referenceNumber": "ESTAR-9013",
        "cost": {
          "amount": 110.00,
          "currency": "EUR"
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
        "destinationLocation": "CitizenM Tower of London",
        "departureTime": "2026-06-15T14:00:00Z",
        "arrivalTime": "2026-06-18T11:00:00Z",
        "provider": "CitizenM Hotels",
        "referenceNumber": "RES-88301",
        "cost": {
          "amount": 540.00,
          "currency": "EUR"
        }
      }
    },
    {
      "segmentId": "seg_003_travel",
      "sequence": 3,
      "type": "travel",
      "details": {
        "mode": "train",
        "originLocation": "London St Pancras (STP)",
        "destinationLocation": "Brussels Midi (ZYR)",
        "departureTime": "2026-06-18T13:01:00Z",
        "arrivalTime": "2026-06-18T16:05:00Z",
        "provider": "Eurostar",
        "referenceNumber": "ESTAR-9142",
        "cost": {
          "amount": 85.00,
          "currency": "EUR"
        }
      }
    },
    {
      "segmentId": "seg_004_lodging",
      "sequence": 4,
      "type": "lodging",
      "details": {
        "mode": "hotel",
        "originLocation": "Brussels, Belgium",
        "destinationLocation": "Radisson Red Brussels",
        "departureTime": "2026-06-18T15:00:00Z",
        "arrivalTime": "2026-06-22T11:00:00Z",
        "provider": "Radisson Hotels",
        "referenceNumber": "RES-44102",
        "cost": {
          "amount": 620.00,
          "currency": "EUR"
        }
      }
    }
  ],
  "confidenceScore": {
    "overall": 0.95,
    "reasoning": "Direct high-speed rail schedules matched perfectly with dates. Hotel check-in and check-out dates align seamlessly with arrival/departure trains without any calendar gap."
  }
}
```

## Decision Rules
1. **Transit Mode Selection**:
   - Distance $< 400\text{ km}$: Select **train** if a rail connection takes $< 4\text{ hours}$.
   - Distance $\ge 400\text{ km}$ or transit duration by land $> 5\text{ hours}$: Select **flight** as the default transit option.
   - Island destinations or water bodies with no bridge/tunnel connection: Select **flight** or **ferry**.
2. **Buffer Time Rules**:
   - Flight connection layover minimum: $1.5\text{ hours}$ for domestic, $2.5\text{ hours}$ for international.
   - Hotel check-in gap: If arrival time is before standard check-in (typically $15:00$), add a warning suggestion to the segment details recommending early luggage drop-off.
3. **Accommodation Duration**:
   - The check-in date of hotel segment `i` must equal the arrival date in destination city. The check-out date must equal the departure date from destination city.
4. **Currency Normalization**: Convert all segment costs to the user's primary currency (as defined in inputs) using current exchange rates, keeping a record of local currency in details.

## Reasoning Strategy
The Segment Builder employs an **A* Search and Interval Algebra** algorithm:
1. **Node Construction**: Creates temporal intervals for each destination stay.
2. **Pathfinding**: Queries flight and rail routing indexes to find connections that span the physical distance between intervals.
3. **Cost/Time Optimization**: Minimizes travel duration and costs based on traveler preferences (e.g. prioritize speed vs. budget).
4. **Interval Alignment**: Chains intervals together to ensure that the ending time of transit segment $n$ is before the starting time of lodging segment $n+1$, leaving adequate buffer for transfer and check-in.
5. **Score Allocation**: Deducts confidence if transit segments require multiple connections, have tight transfer times ($< 45$ minutes), or lodging listings are low-capacity.

## Data Sources
- **Transit Routing Indices**: Flight schedules, rail routes (Deutsche Bahn, Eurostar, Amtrak), and bus schedules.
- **Accommodation Inventory**: Hotel catalogs and pricing indexes.
- **Currency Exchange Rate API**: To calculate current conversion rates.

## Error Handling
- **No Transit Route Found**: If cities are separated by water (e.g., Paris to New York) and flight queries fail, return code `ERR_ROUTE_DISCONNECTED` with recommendations to select different destinations.
- **Timeline Discontinuity**: If transit arrival time is later than hotel checkout date, throw `ERR_TIMELINE_DISORDER` and request chronological correction.

## Validation Rules
- Every segment sequence number must be unique and strictly sequential.
- The `destinationLocation` of travel segment $k$ must match the city/location of lodging segment $k+1$.
- Accommodation segments must cover 100% of the overnight periods between the trip's start date and end date.

## Confidence Score
- Calculated as:
  $$\text{Segment Confidence} = \text{Base} - (0.1 \times \text{number of transfers}) - \text{Buffer Penalties}$$
- Buffer Penalties: Subtract $0.15$ for layovers under $90$ minutes (international flights) or train transfers under $15$ minutes.
- Missing data penalties: Subtract $0.25$ if a placeholder flight rate is used due to lack of API live pricing.

## Example Scenarios

### Scenario 1: London to Paris High-Speed Rail
- **Input**: Origin: London, Destination: Paris, Date: 2026-06-15, Preference: Train.
- **Process**: Queries Eurostar timetable for London St Pancras to Paris Gare du Nord on 2026-06-15. Selects 09:13 departures. Maps CitizenM Gare de Lyon for stay.
- **Output**: Generates a travel segment (train) and a hotel stay segment matching Paris check-in. Confidence: 0.98.

### Scenario 2: Multi-Leg Flight with Layover (Los Angeles to Tokyo)
- **Input**: Origin: Los Angeles (LAX), Destination: Tokyo (NRT), Date: 2026-07-01.
- **Process**: Finds no low-cost direct flights. Selects an ANA flight with a 2-hour layover in Seattle (SEA).
- **Output**: Generates a single travel segment with two flight legs (LAX -> SEA, SEA -> NRT), details the layover time, and aligns arrival time in Tokyo (next day, 2026-07-02 due to time zone) with hotel check-in. Confidence: 0.88.

### Scenario 3: Coastal Road Trip (San Francisco to Los Angeles)
- **Input**: Origin: San Francisco, Destination: Los Angeles, Dates: 2026-08-01 to 2026-08-03, Preference: Car.
- **Process**: Selects rental car pick-up at SFO on 2026-08-01, travel along Pacific Coast Highway, rental car drop-off at LAX on 2026-08-03.
- **Output**: Generates a car rental travel segment from SFO to LAX, plus lodging segments in Monterey and Santa Barbara. Confidence: 0.92.

## Dependencies
- **Travel Planner Skill**: Feeds destination sequences to the Segment Builder.
- **Trip Validation Skill**: Invoked to verify chronological and routing limits of generated segments.

## Success Criteria
- Generation of a continuous, chronologically ordered array of segments.
- Zero timeline overlaps (no traveler is in two places at once).
- High routing accuracy verified against spatial databases.
