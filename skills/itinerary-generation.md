# Itinerary Generation Skill

## Purpose
The Itinerary Generation Skill is responsible for creating structured, logical, and optimized day-by-day travel plans. It synthesizes user preferences, destination constraints, geographical distributions of attractions, seasonal factors, and scheduling rules into a seamless, actionable itinerary.

## Responsibilities
* **Temporal Planning & Scheduling:** Allocate activities logically into morning, afternoon, evening, and meal slots.
* **Geographic Optimization:** Group points of interest (POIs) that are physically close to minimize travel times and transportation overhead.
* **Constraint Validation:** Verify opening/closing hours, typical dwell times, and seasonal availability for all scheduled stops.
* **Pace & Feasibility Control:** Match the density of activities to the traveler's preferred pace (relaxed, moderate, fast-paced).
* **Profile & Interest Customization:** Tailor the style of recommendations and ordering to match the traveler demographics (e.g., family with kids, couples, seniors, solo travelers).

## Inputs (JSON schema/example)

### Input Schema
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "ItineraryGenerationInput",
  "type": "object",
  "properties": {
    "destination": {
      "type": "string",
      "description": "Target city, region, or country for the itinerary."
    },
    "startDate": {
      "type": "string",
      "format": "date",
      "description": "YYYY-MM-DD start date of the trip."
    },
    "endDate": {
      "type": "string",
      "format": "date",
      "description": "YYYY-MM-DD end date of the trip."
    },
    "travelersCount": {
      "type": "integer",
      "minimum": 1,
      "description": "Number of people traveling."
    },
    "travelerProfile": {
      "type": "string",
      "enum": ["solo", "couple", "family_with_kids", "group_friends", "senior"],
      "description": "Primary demographic profile of the travel group."
    },
    "budgetTier": {
      "type": "string",
      "enum": ["budget", "mid_range", "luxury"],
      "description": "Spending preference tier."
    },
    "pace": {
      "type": "string",
      "enum": ["relaxed", "moderate", "fast_paced"],
      "description": "Activity density per day."
    },
    "interests": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "List of core interests like history, art, nature, food, adventure."
    },
    "customPreferences": {
      "type": "string",
      "description": "Textual description of custom constraints, dietary requirements, or specific requests."
    }
  },
  "required": ["destination", "startDate", "endDate", "travelersCount", "travelerProfile", "budgetTier", "pace", "interests"]
}
```

### Input Example
```json
{
  "destination": "Kyoto, Japan",
  "startDate": "2026-11-10",
  "endDate": "2026-11-13",
  "travelersCount": 2,
  "travelerProfile": "couple",
  "budgetTier": "mid_range",
  "pace": "moderate",
  "interests": ["culture", "temples", "nature", "gastronomy"],
  "customPreferences": "Prefer traditional cultural experiences, vegetarian dining options, and moderate walking. Avoid overcrowded spaces during mid-day if possible."
}
```

## Outputs (JSON schema/example with confidence score)

### Output Schema
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "ItineraryGenerationOutput",
  "type": "object",
  "properties": {
    "tripId": { "type": "string" },
    "destination": { "type": "string" },
    "durationDays": { "type": "integer" },
    "confidenceScore": {
      "type": "number",
      "minimum": 0.0,
      "maximum": 1.0,
      "description": "Confidence score based on rule adherence, data availability, and constraints fulfillment."
    },
    "confidenceScoreDetails": {
      "type": "object",
      "properties": {
        "scheduleFeasibility": { "type": "number" },
        "hoursVerification": { "type": "number" },
        "geographicEfficiency": { "type": "number" },
        "preferenceMatch": { "type": "number" }
      },
      "required": ["scheduleFeasibility", "hoursVerification", "geographicEfficiency", "preferenceMatch"]
    },
    "itinerary": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "dayNumber": { "type": "integer" },
          "date": { "type": "string", "format": "date" },
          "dailyTheme": { "type": "string" },
          "geographicFocus": { "type": "string" },
          "schedule": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "timeSlot": { "type": "string", "enum": ["morning", "lunch", "afternoon", "dinner", "evening"] },
                "startTime": { "type": "string" },
                "endTime": { "type": "string" },
                "activityName": { "type": "string" },
                "location": { "type": "string" },
                "coordinates": {
                  "type": "object",
                  "properties": {
                    "lat": { "type": "number" },
                    "lng": { "type": "number" }
                  },
                  "required": ["lat", "lng"]
                },
                "description": { "type": "string" },
                "estimatedCost": { "type": "number" },
                "currency": { "type": "string" },
                "estimatedDurationMinutes": { "type": "integer" },
                "transportationToNext": {
                  "type": "object",
                  "properties": {
                    "mode": { "type": "string" },
                    "durationMinutes": { "type": "integer" },
                    "estimatedCost": { "type": "number" }
                  },
                  "required": ["mode", "durationMinutes"]
                }
              },
              "required": ["timeSlot", "startTime", "endTime", "activityName", "location", "coordinates", "description"]
            }
          }
        },
        "required": ["dayNumber", "date", "dailyTheme", "geographicFocus", "schedule"]
      }
    }
  },
  "required": ["tripId", "destination", "durationDays", "confidenceScore", "confidenceScoreDetails", "itinerary"]
}
```

### Output Example
```json
{
  "tripId": "trip-kyoto-2026-11-10",
  "destination": "Kyoto, Japan",
  "durationDays": 3,
  "confidenceScore": 0.94,
  "confidenceScoreDetails": {
    "scheduleFeasibility": 0.95,
    "hoursVerification": 1.0,
    "geographicEfficiency": 0.90,
    "preferenceMatch": 0.92
  },
  "itinerary": [
    {
      "dayNumber": 1,
      "date": "2026-11-10",
      "dailyTheme": "Arashiyama & Scenic Bamboo Groves",
      "geographicFocus": "Western Kyoto",
      "schedule": [
        {
          "timeSlot": "morning",
          "startTime": "08:30",
          "endTime": "11:30",
          "activityName": "Arashiyama Bamboo Grove & Tenryu-ji Temple",
          "location": "Sagaogurayama Tabuchiyamacho, Ukyo Ward, Kyoto",
          "coordinates": { "lat": 35.0158, "lng": 135.6776 },
          "description": "Walk through the iconic bamboo forest early to avoid peak crowds. Tour the Zen gardens of Tenryu-ji.",
          "estimatedCost": 500.0,
          "currency": "JPY",
          "estimatedDurationMinutes": 180,
          "transportationToNext": {
            "mode": "walking",
            "durationMinutes": 10,
            "estimatedCost": 0.0
          }
        },
        {
          "timeSlot": "lunch",
          "startTime": "11:45",
          "endTime": "13:00",
          "activityName": "Lunch at Shigetsu (Buddhist Vegetarian)",
          "location": "Inside Tenryu-ji Temple grounds",
          "coordinates": { "lat": 35.0156, "lng": 135.6797 },
          "description": "Enjoy traditional Buddhist vegetarian dining (Shojin Ryori) overlooking a serene garden view.",
          "estimatedCost": 4000.0,
          "currency": "JPY",
          "estimatedDurationMinutes": 75,
          "transportationToNext": {
            "mode": "taxi",
            "durationMinutes": 15,
            "estimatedCost": 1500.0
          }
        },
        {
          "timeSlot": "afternoon",
          "startTime": "13:15",
          "endTime": "15:45",
          "activityName": "Kinkaku-ji (The Golden Pavilion)",
          "location": "1 Kinkakujicho, Kita Ward, Kyoto",
          "coordinates": { "lat": 35.0394, "lng": 135.7292 },
          "description": "Observe the brilliant gold leaf Zen temple, beautifully reflected in the surrounding Mirror Pond.",
          "estimatedCost": 400.0,
          "currency": "JPY",
          "estimatedDurationMinutes": 150,
          "transportationToNext": {
            "mode": "bus",
            "durationMinutes": 35,
            "estimatedCost": 230.0
          }
        },
        {
          "timeSlot": "dinner",
          "startTime": "18:00",
          "endTime": "20:00",
          "activityName": "Dinner at Gion Veggie Cafe",
          "location": "Gionmachi Minamigawa, Higashiyama Ward, Kyoto",
          "coordinates": { "lat": 35.0037, "lng": 135.7759 },
          "description": "Savor plant-based versions of classic Kyoto dishes in a historic building close to Gion.",
          "estimatedCost": 3000.0,
          "currency": "JPY",
          "estimatedDurationMinutes": 120,
          "transportationToNext": {
            "mode": "walking",
            "durationMinutes": 10,
            "estimatedCost": 0.0
          }
        },
        {
          "timeSlot": "evening",
          "startTime": "20:10",
          "endTime": "21:30",
          "activityName": "Gion District Evening Stroll",
          "location": "Gion, Kyoto",
          "coordinates": { "lat": 35.0039, "lng": 135.7782 },
          "description": "Stroll down Hanamikoji Street, admiring lantern-lit wooden machiya houses and seeking glimpses of geishas.",
          "estimatedCost": 0.0,
          "currency": "JPY",
          "estimatedDurationMinutes": 80,
          "transportationToNext": {
            "mode": "metro",
            "durationMinutes": 20,
            "estimatedCost": 220.0
          }
        }
      ]
    }
  ]
}
```

## Decision Rules
1. **Geographic Constraints:**
   * Maximum daily travel distance between any consecutive activities must not exceed 25 km unless designated as a "Day Trip" day.
   * If two locations are more than 20 minutes apart, allocate an explicit buffer/transit block in the itinerary.
2. **Pacing Constraints:**
   * *Relaxed:* Maximum 2 major activities per day, minimum 90 minutes for meals, no activities after 20:00.
   * *Moderate:* Maximum 3 major activities per day, 60–90 minutes for meals, evening activities allowed until 21:30.
   * *Fast-paced:* Up to 5 activities per day, 45–60 minutes for meals, active evening slots until 23:00.
3. **Operational Opening Hours Validation:**
   * Compare activity slot times against database-defined business hours for that specific weekday.
   * Reject plans containing scheduled visits to closed attractions. Include a 30-minute safety buffer before closing time.
4. **Demographic Customization Rules:**
   * *Family with kids:* Automatically insert one park, playground, or child-friendly interactive spot every afternoon. Limit walking distance to 5 km total per day.
   * *Senior:* Prioritize locations with step-free accessibility. Eliminate high-gradient walking paths. Limit active hours to between 09:30 and 18:30.

## Reasoning Strategy
The Itinerary Generation Skill uses a Hierarchical Constraint-Satisfaction reasoning path:
1. **Destination Parsing & Interest Mapping:** Extract key interests and select a candidate pool of POIs matching those interests.
2. **Geographical Spatial Clustering:** Group POIs using K-Means or spatial distance tables. Allocate one cluster per day to prevent cross-city transit backtracking.
3. **Temporal Sequencing:** Arrange the day's selected POIs based on:
   * Logical chronological ordering (e.g., sunrise/outdoor points in morning, museums during midday heat, views for sunset, districts for evening).
   * Opening hours constraints.
4. **Transit & Route Feasibility Mapping:** Calculate optimal travel routes between sequence waypoints.
5. **Constraint Check & Repair Iteration:** Check for conflicts (e.g., overlapping schedules, dining preferences unmet, budget exceeded). Swap or replace POIs iteratively until constraints are met.

## Data Sources
* **POI Database:** OpenStreetMap coordinates, category tags, ratings, and operating schedules.
* **Geocoding & Route Engine:** Localized transit network API (like GTFS or Google Directions API) to query travel times.
* **Crowdsourced Popular Times Data:** To predict queues and suggest optimal hours.
* **Climatic & Seasonal Calendars:** For accurate sunset/sunrise times, autumn color projections, or cherry blossom forecasts.

## Error Handling
* **API Offline/No-Response:** Fallback to historical static local transit speeds (average 12 km/h for urban transit, 4 km/h for walking).
* **Zero Match for Interests:** If the destination has zero temples (e.g., in a coastal nature area), dynamically swap the interest filter to the closest parent category (e.g., "culture" -> "sightseeing") and flag a warning in the response.
* **Date Mismatch:** If `endDate` precedes `startDate`, raise a validation exception immediately with error code `ERR_INVALID_DATE_RANGE`.

## Validation Rules
* **Sum of Durations:** Total duration of activities + transits + meals in a single day must not exceed 16 hours.
* **Date Bounds:** Every day in the itinerary must strictly map to a unique calendar date between `startDate` and `endDate` inclusive.
* **No Double Booking:** No two items in the `schedule` array can have overlapping `startTime` and `endTime`.

## Confidence Score
The `confidenceScore` is computed as follows:
$$CS = 1.0 - (0.1 \times N_{unverified\_hours}) - (0.15 \times N_{pacing\_violations}) - (0.1 \times N_{excessive\_transit}) - (0.05 \times N_{unmet\_preferences})$$
* **$N_{unverified\_hours}$**: Number of activities scheduled with unverified operating hours.
* **$N_{pacing\_violations}$**: Number of daily plans exceeding the traveler's pace criteria.
* **$N_{excessive\_transit}$**: Number of days where total travel time exceeds 2.5 hours.
* **$N_{unmet\_preferences}$**: Number of explicitly stated custom preferences that could not be satisfied.

## Example Scenarios

### Scenario 1: Culturally Immersive Kyoto
* **Context:** A couple on a 3-day mid-range cultural honeymoon trip during November peak foliage season.
* **Logic:** The generator clusters activities into Western (Day 1: Arashiyama), Southern/Central (Day 2: Fushimi Inari & Kiyomizu-dera), and Northern (Day 3: Kurama/Kibune nature walk).
* **Outcome:** Provides structured schedules ensuring the couple arrives at Fushimi Inari at 07:00 AM (to beat crowds) and coordinates an evening Kaiseki dinner in Gion.

### Scenario 2: Active Family in San Diego
* **Context:** Family with 2 kids (ages 5 and 8) on a 4-day budget trip to San Diego.
* **Logic:** Limits evening slots to 19:30. Suggests outdoor beach times in mornings, Balboa Park museums and playgrounds in afternoons, and budget-friendly diner dinners.
* **Outcome:** Outputs structured routes utilizing public streetcars and buses, keeping transit times low and walking segments short.

### Scenario 3: Solo Luxury Explorer in Queenstown
* **Context:** A solo traveler requesting a 2-day fast-paced luxury adventure trip.
* **Logic:** Schedules back-to-back adrenaline sports (Bungy jumping, jet boating) with short helicopter transfers and dinners at premium lakeside restaurants.
* **Outcome:** High density itinerary utilizing private transfers, maximizing active time between 08:00 and 22:30.

## Dependencies
* **Map Intelligence Skill:** To verify spatial sequence efficiency and get exact waypoint transit times.
* **Activity Recommendation Skill:** To supply candidate POIs sorted by relevance and budget constraints.
* **Hotel Recommendation Skill:** To set the start/end coordinates of each day's route based on lodging location.

## Success Criteria
* **Execution Latency:** Generates a 7-day itinerary in < 1500ms.
* **Adherence:** 100% of generated itineraries contain no temporal overlaps.
* **Relevance:** Post-travel user surveys show a >90% satisfaction rate on daily geographic sequencing (no backtracking).
* **Correctness:** Zero instances of scheduling activities on days/times when they are closed.
