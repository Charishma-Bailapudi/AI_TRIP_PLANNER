# Travel Planner Skill

## Purpose
The Travel Planner Skill is responsible for taking high-level user travel requests, preferences, budgets, and constraints, and constructing a comprehensive, multi-city trip plan. It parses natural language inputs, structures destinations chronologically, and establishes the foundation for detailed trip segmentation and itinerary building.

## Responsibilities
- Parse natural language queries to extract traveler intent, dates, budget, origin, destinations, and travel preferences.
- Resolve ambiguous city names and verify geographic locations.
- Construct a logical, chronological multi-city trip timeline.
- Formulate an estimated budget profile matching the traveler's financial expectations.
- Generate high-level summaries and travel recommendations tailored to user interest profiles (e.g., adventure, relaxation, cultural).
- Assign an initial confidence score representing the feasibility and completeness of the trip plan.

## Inputs (JSON schema/example)

### JSON Schema
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "TravelPlannerInput",
  "type": "object",
  "properties": {
    "userId": {
      "type": "string",
      "description": "Unique identifier of the user requesting the plan"
    },
    "query": {
      "type": "string",
      "description": "Natural language request from the user detailing the trip idea"
    },
    "startDate": {
      "type": "string",
      "format": "date",
      "description": "YYYY-MM-DD format start date of the trip"
    },
    "endDate": {
      "type": "string",
      "format": "date",
      "description": "YYYY-MM-DD format end date of the trip"
    },
    "origin": {
      "type": "string",
      "description": "Starting city and/or country of the trip"
    },
    "destinations": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Explicit list of cities/regions to visit, if specified"
    },
    "budget": {
      "type": "object",
      "properties": {
        "amount": {
          "type": "number",
          "description": "Maximum budget limit"
        },
        "currency": {
          "type": "string",
          "description": "ISO 4217 currency code, e.g., USD, EUR"
        },
        "tier": {
          "type": "string",
          "enum": ["economy", "moderate", "luxury"],
          "description": "Budget preference level"
        }
      },
      "required": ["amount", "currency"]
    },
    "preferences": {
      "type": "object",
      "properties": {
        "pace": {
          "type": "string",
          "enum": ["relaxed", "moderate", "fast"],
          "description": "Speed of travel and activity level"
        },
        "interests": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Topics of interest, e.g., museums, food, hiking, shopping"
        },
        "travelersCount": {
          "type": "integer",
          "minimum": 1,
          "description": "Number of people traveling"
        }
      }
    }
  },
  "required": ["userId", "query", "origin"]
}
```

### JSON Example
```json
{
  "userId": "user_1029384756",
  "query": "I want to visit Paris and Rome this summer for about 10 days. I love art galleries, history, and good food. I'm looking for a comfortable but not overly expensive trip, and I will be traveling with my spouse.",
  "startDate": "2026-07-10",
  "endDate": "2026-07-20",
  "origin": "New York, USA",
  "destinations": ["Paris, France", "Rome, Italy"],
  "budget": {
    "amount": 5000.00,
    "currency": "USD",
    "tier": "moderate"
  },
  "preferences": {
    "pace": "moderate",
    "interests": ["art galleries", "history", "food"],
    "travelersCount": 2
  }
}
```

## Outputs (JSON schema/example with confidence score)

### JSON Schema
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "TravelPlannerOutput",
  "type": "object",
  "properties": {
    "tripId": {
      "type": "string",
      "description": "Generated unique ID for the planned trip"
    },
    "title": {
      "type": "string",
      "description": "Descriptive title for the trip"
    },
    "origin": {
      "type": "string"
    },
    "startDate": {
      "type": "string",
      "format": "date"
    },
    "endDate": {
      "type": "string",
      "format": "date"
    },
    "totalDurationDays": {
      "type": "integer"
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
          "departureDate": { "type": "string", "format": "date" },
          "plannedDurationDays": { "type": "integer" },
          "highlightInterests": {
            "type": "array",
            "items": { "type": "string" }
          }
        },
        "required": ["city", "country", "sequence", "arrivalDate", "departureDate", "plannedDurationDays"]
      }
    },
    "estimatedCostSummary": {
      "type": "object",
      "properties": {
        "flights": { "type": "number" },
        "accommodation": { "type": "number" },
        "activities": { "type": "number" },
        "localTransport": { "type": "number" },
        "totalEstimatedAmount": { "type": "number" },
        "currency": { "type": "string" }
      },
      "required": ["totalEstimatedAmount", "currency"]
    },
    "confidenceScore": {
      "type": "object",
      "properties": {
        "overall": { "type": "number", "minimum": 0.0, "maximum": 1.0 },
        "metrics": {
          "type": "object",
          "properties": {
            "inputCompleteness": { "type": "number", "minimum": 0.0, "maximum": 1.0 },
            "routingFeasibility": { "type": "number", "minimum": 0.0, "maximum": 1.0 },
            "budgetRealism": { "type": "number", "minimum": 0.0, "maximum": 1.0 }
          },
          "required": ["inputCompleteness", "routingFeasibility", "budgetRealism"]
        },
        "reasoning": {
          "type": "string",
          "description": "Explanation of how the confidence score was determined"
        }
      },
      "required": ["overall", "metrics", "reasoning"]
    }
  },
  "required": [
    "tripId",
    "title",
    "origin",
    "startDate",
    "endDate",
    "totalDurationDays",
    "destinations",
    "estimatedCostSummary",
    "confidenceScore"
  ]
}
```

### JSON Example
```json
{
  "tripId": "trip_987654321_abc",
  "title": "Summer Culture and History in Paris & Rome",
  "origin": "New York, USA",
  "startDate": "2026-07-10",
  "endDate": "2026-07-20",
  "totalDurationDays": 10,
  "destinations": [
    {
      "city": "Paris",
      "country": "France",
      "sequence": 1,
      "arrivalDate": "2026-07-11",
      "departureDate": "2026-07-15",
      "plannedDurationDays": 4,
      "highlightInterests": ["art galleries", "food"]
    },
    {
      "city": "Rome",
      "country": "Italy",
      "sequence": 2,
      "arrivalDate": "2026-07-15",
      "departureDate": "2026-07-20",
      "plannedDurationDays": 5,
      "highlightInterests": ["history", "food"]
    }
  ],
  "estimatedCostSummary": {
    "flights": 1800.00,
    "accommodation": 1500.00,
    "activities": 600.00,
    "localTransport": 300.00,
    "totalEstimatedAmount": 4200.00,
    "currency": "USD"
  },
  "confidenceScore": {
    "overall": 0.92,
    "metrics": {
      "inputCompleteness": 0.95,
      "routingFeasibility": 0.90,
      "budgetRealism": 0.90
    },
    "reasoning": "Inputs provided clear dates, specific destinations, and budget parameters. Routing from Paris to Rome is standard and highly feasible via train or flight. Estimated budget ($4200) fits comfortably within the traveler's $5000 limit."
  }
}
```

## Decision Rules
1. **Destination Sequencing**: Sequence cities based on geographic proximity to minimize total travel time.
2. **Pace Calibration**:
   - *Relaxed*: Minimum of 4 nights per city.
   - *Moderate*: Minimum of 2-3 nights per city.
   - *Fast*: 1-2 nights per city permitted.
3. **Transit Day Offset**: When crossing major oceans (e.g., USA to Europe), subtract 1 full calendar day from active destination sightseeing to account for overnight travel.
4. **Budget Sufficiency**: If specified budget is below the minimum threshold ($100 per day for economy, $250 for moderate, $500 for luxury, per person, plus baseline flight costs), automatically flag the budget realism metric as low (<0.50) and adjust outputs to suggest cheaper alternatives or reduced stays.
5. **Time Constraints**: If user dates do not match user duration query, priority is given to the explicit `startDate` and `endDate` parameters over the text query.

## Reasoning Strategy
The Travel Planner uses a **Constraint Satisfaction Reasoning** approach:
1. **Deconstruction**: Extracts constraints (hard dates, budget ceilings, destination locations) and soft constraints (interests, pace preferences).
2. **Geographical Mapping**: Consults spatial data to calculate the logical path (e.g., New York -> Paris -> Rome -> New York).
3. **Chronological Allocation**: Distributes the total duration across destinations based on interests, size of the city, and pace preference.
4. **Cost Projection**: Feeds destination and durations into a heuristic budget estimator that compiles typical flight/train rates and average room prices.
5. **Refinement Loop**: Checks if final cost is <= budget. If not, it scales down accommodation tier or adjusts durations, re-evaluating the budget until it fits or triggers a low confidence threshold.

## Data Sources
- **GeoNames DB / Google Places API**: To resolve and validate city names and country coordinates.
- **Flight and Hotel Historical Index**: Aggregate average prices per city, categorized by season and budget tier.
- **Intercity Transit Matrix**: Flight/rail routes and duration tables to estimate connections.

## Error Handling
- **Invalid Date Range**: If `endDate` is before `startDate`, return error code `ERR_DATE_CHRONOLOGY` with a message suggesting correct dates.
- **Unreachable Location**: If any city cannot be geocoded, return code `ERR_LOCATION_UNRESOLVED` and ask the user to clarify spelling.
- **Extreme Budget Infeasibility**: If budget is too low (e.g., $300 for a 10-day trip to Europe from NYC), return code `ERR_BUDGET_INSUFFICIENT` along with a baseline estimate.

## Validation Rules
- `startDate` must be >= current date + 1 day (unless explicitly forced for historical trip recording).
- `destinations` array must contain at least 1 destination.
- Sum of `plannedDurationDays` in all destinations must match the total calendar days between `startDate` and `endDate`, taking transit offset into account.

## Confidence Score
The confidence score is calculated as a weighted average:
$$\text{Overall Score} = (0.3 \times \text{Input Completeness}) + (0.4 \times \text{Routing Feasibility}) + (0.3 \times \text{Budget Realism})$$
- **Input Completeness**: High (1.0) if dates, budget, origin, and specific destinations are present. Medium (0.7) if dates or budget are omitted and must be assumed.
- **Routing Feasibility**: High (1.0) if transit routes are direct or simple. Low (<0.50) if connection times exceed 12 hours or require backwards routing.
- **Budget Realism**: High (1.0) if `estimatedCostSummary.totalEstimatedAmount` <= `input.budget.amount`. Drops to 0.0 if the budget is physically insufficient for flights/accommodation.

## Example Scenarios

### Scenario 1: Multi-city European Tour
- **Input Query**: "Want to see London, Paris, and Amsterdam in 9 days. Moderate budget, traveling alone, interested in museums."
- **Reasoning**:
  - Distance check: London -> Paris -> Amsterdam is a direct geographic progression.
  - Duration: 9 days. Allocation: London (3 days), Paris (3 days), Amsterdam (3 days).
  - Transit: Eurostar train for London -> Paris and Paris -> Amsterdam. Very high feasibility.
- **Output Output**: Confirms sequence, schedules dates (e.g., Oct 1 - Oct 10), lists museums (Louvre, Rijksmuseum, British Museum) as highlight interests, calculates budget of $2400 (under the user's $3000 limit). Overall confidence: 0.98.

### Scenario 2: High-Pace, Low-Budget West Coast USA Trip
- **Input Query**: "San Francisco, Los Angeles, San Vegas. $800 total budget. 5 days. Next week."
- **Reasoning**:
  - Distance check: SF -> LA -> Las Vegas (Vegas, not San Vegas). Resolves "San Vegas" to "Las Vegas".
  - Duration check: 5 days is very fast for 3 cities. Allocates SF (1 day), LA (2 days), Las Vegas (2 days).
  - Budget check: $800 is extremely low for a trip of 5 days covering 3 major cities, including transit.
- **Output Output**: Identifies geocoding resolution of "Las Vegas". Flags budget warning: total estimated budget is $1150. Sets budget realism to 0.40. Overall confidence score: 0.55. Output recommends choosing road transport and economy motels.

### Scenario 3: Missing Parameters (Flexible Destination Exploration)
- **Input Query**: "I want to go somewhere warm in December from Chicago for 1 week. Budget is $1500."
- **Reasoning**:
  - Missing parameters: Specific destinations.
  - Search criteria: "Warm in December" + "Chicago origin" + "$1500 budget".
  - Candidate Generation: Suggests Miami, FL or Cancun, Mexico.
- **Output Output**: Chooses Cancun, Mexico. Fills in dates (e.g., Dec 10 - Dec 17). Highlights snorkeling and Mayan ruins. Overall confidence score: 0.78 (reduced due to missing specific destination inputs).

## Dependencies
- **Segment Builder Skill**: To expand high-level destination sequence into actual transit segments.
- **Trip Validation Skill**: To verify chronological integrity before finalizing output.

## Success Criteria
- Generation of a valid itinerary structure that covers all requested destinations.
- Calculated budget estimates that align with requested budget tiers.
- A confidence score >= 0.70 for standard inputs, or an informative error/warning log for low-confidence layouts.
