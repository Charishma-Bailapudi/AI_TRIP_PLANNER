# Hotel Recommendation Skill

## Purpose
The Hotel Recommendation Skill is dedicated to discovering, analyzing, and ranking accommodation options that best align with a traveler's financial preferences, demographic profile, location requirements, desired amenities, and geographical proximity to trip highlights.

## Responsibilities
* **Price & Budget Alignment:** Ensure that recommended lodging options strictly fall within the user's daily budget boundaries.
* **Geographical Proximity Mapping:** Find hotels located in safe, convenient neighborhoods close to transit hubs or primary points of interest (POIs).
* **Amenity Filter Verification:** Scan hotel profiles to confirm support for requested amenities (e.g., free Wi-Fi, pool, kitchen, cribs, wheelchair access).
* **Demographic Suitability Analysis:** Determine property suitability (e.g., boutique/romantic for couples, quiet/accessible for seniors, spacious/kid-friendly for families).
* **Value Rating Assessment:** Evaluate property quality metrics (review scores, star ratings) against pricing to recommend high-value options.

## Inputs (JSON schema/example)

### Input Schema
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "HotelRecommendationInput",
  "type": "object",
  "properties": {
    "destination": {
      "type": "string",
      "description": "The target city or geographic region."
    },
    "checkInDate": {
      "type": "string",
      "format": "date",
      "description": "Check-in date (YYYY-MM-DD)."
    },
    "checkOutDate": {
      "type": "string",
      "format": "date",
      "description": "Check-out date (YYYY-MM-DD)."
    },
    "travelersCount": {
      "type": "integer",
      "minimum": 1,
      "description": "Total number of guests."
    },
    "roomsCount": {
      "type": "integer",
      "minimum": 1,
      "description": "Number of rooms needed."
    },
    "budgetTier": {
      "type": "string",
      "enum": ["budget", "mid_range", "luxury"],
      "description": "Financial constraint level."
    },
    "travelerProfile": {
      "type": "string",
      "enum": ["solo", "couple", "family_with_kids", "group_friends", "senior"],
      "description": "The demographic profile of the party."
    },
    "preferredNeighborhoods": {
      "type": "array",
      "items": { "type": "string" },
      "description": "List of desired neighborhoods."
    },
    "requiredAmenities": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Crucial hotel features required by the user."
    },
    "proximityToTargetPoi": {
      "type": "object",
      "properties": {
        "poiName": { "type": "string" },
        "coordinates": {
          "type": "object",
          "properties": {
            "lat": { "type": "number" },
            "lng": { "type": "number" }
          },
          "required": ["lat", "lng"]
        },
        "maxDistanceKm": { "type": "number" }
      },
      "required": ["poiName", "coordinates", "maxDistanceKm"],
      "description": "Optional constraint to restrict searches near a key tourist landmark or transit hub."
    }
  },
  "required": ["destination", "checkInDate", "checkOutDate", "travelersCount", "budgetTier", "travelerProfile"]
}
```

### Input Example
```json
{
  "destination": "Rome, Italy",
  "checkInDate": "2026-09-15",
  "checkOutDate": "2026-09-20",
  "travelersCount": 4,
  "roomsCount": 2,
  "budgetTier": "mid_range",
  "travelerProfile": "family_with_kids",
  "preferredNeighborhoods": ["Trastevere", "Prati"],
  "requiredAmenities": ["WiFi", "Breakfast", "Air Conditioning"],
  "proximityToTargetPoi": {
    "poiName": "Vatican Museums",
    "coordinates": { "lat": 41.9067, "lng": 12.4526 },
    "maxDistanceKm": 3.0
  }
}
```

## Outputs (JSON schema/example with confidence score)

### Output Schema
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "HotelRecommendationOutput",
  "type": "object",
  "properties": {
    "destination": { "type": "string" },
    "checkInDate": { "type": "string", "format": "date" },
    "checkOutDate": { "type": "string", "format": "date" },
    "confidenceScore": {
      "type": "number",
      "minimum": 0.0,
      "maximum": 1.0,
      "description": "Confidence of the matching algorithms."
    },
    "recommendations": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "hotelId": { "type": "string" },
          "name": { "type": "string" },
          "starRating": { "type": "number", "minimum": 1, "maximum": 5 },
          "userReviewRating": { "type": "number", "minimum": 0, "maximum": 10.0 },
          "location": { "type": "string" },
          "neighborhood": { "type": "string" },
          "coordinates": {
            "type": "object",
            "properties": {
              "lat": { "type": "number" },
              "lng": { "type": "number" }
            },
            "required": ["lat", "lng"]
          },
          "pricePerNight": { "type": "number" },
          "totalPrice": { "type": "number" },
          "currency": { "type": "string" },
          "amenities": {
            "type": "array",
            "items": { "type": "string" }
          },
          "suitabilityScore": {
            "type": "number",
            "minimum": 0.0,
            "maximum": 100.0,
            "description": "Calculated score representing match percentage with traveler profile."
          },
          "suitabilityReasons": {
            "type": "array",
            "items": { "type": "string" }
          },
          "distanceToTargetPoiKm": { "type": "number" }
        },
        "required": [
          "hotelId", "name", "starRating", "userReviewRating", "location", "neighborhood",
          "coordinates", "pricePerNight", "totalPrice", "currency", "amenities",
          "suitabilityScore", "suitabilityReasons"
        ]
      }
    }
  },
  "required": ["destination", "checkInDate", "checkOutDate", "confidenceScore", "recommendations"]
}
```

### Output Example
```json
{
  "destination": "Rome, Italy",
  "checkInDate": "2026-09-15",
  "checkOutDate": "2026-09-20",
  "confidenceScore": 0.96,
  "recommendations": [
    {
      "hotelId": "hotel-roma-prati-09",
      "name": "Prati Family Suites",
      "starRating": 4,
      "userReviewRating": 8.9,
      "location": "Via Cola di Rienzo, 245, 00192 Roma",
      "neighborhood": "Prati",
      "coordinates": { "lat": 41.9088, "lng": 12.4612 },
      "pricePerNight": 180.00,
      "totalPrice": 900.00,
      "currency": "EUR",
      "amenities": ["WiFi", "Breakfast", "Air Conditioning", "Family Rooms", "Cribs Available", "Kitchenette"],
      "suitabilityScore": 95.5,
      "suitabilityReasons": [
        "Located in quiet and safe Prati neighborhood, ideal for families.",
        "Only 0.8 km walking distance from Vatican Museums (under your 3.0 km limit).",
        "Offers multi-room suites with full kitchenette and complimentary cribs.",
        "Price fits perfectly within the mid-range budget allocation."
      ],
      "distanceToTargetPoiKm": 0.8
    },
    {
      "hotelId": "hotel-roma-trast-12",
      "name": "Trastevere Green Residence",
      "starRating": 3,
      "userReviewRating": 8.5,
      "location": "Viale di Trastevere, 88, 00153 Roma",
      "neighborhood": "Trastevere",
      "coordinates": { "lat": 41.8841, "lng": 12.4721 },
      "pricePerNight": 140.00,
      "totalPrice": 700.00,
      "currency": "EUR",
      "amenities": ["WiFi", "Air Conditioning", "Elevator", "Soundproof Rooms"],
      "suitabilityScore": 81.0,
      "suitabilityReasons": [
        "Trastevere neighborhood offers excellent dining options.",
        "Affordable rate maximizes value in the mid-range tier.",
        "Family-sized soundproof rooms isolate street noise."
      ],
      "distanceToTargetPoiKm": 2.9
    }
  ]
}
```

## Decision Rules
1. **Pricing Rules (Standardized Tiers):**
   * *Budget:* Maximum price per night must not exceed $100 USD (or equivalent).
   * *Mid-Range:* Price per night must be between $100 and $250 USD.
   * *Luxury:* Price per night must exceed $250 USD.
2. **Quality Gateways:**
   * Do not recommend hotels with a user review rating under 7.0/10.0 (or 3.5/5.0) unless no other properties exist in the destination.
   * For senior or luxury profiles, the minimum acceptable rating is 8.0/10.0.
3. **Amenity Hard-Filters:**
   * If a user requests specific amenities in `requiredAmenities`, any recommended hotel *must* contain a 100% match of those items. If missing, exclude the hotel from the results.
4. **Proximity Rules:**
   * If `proximityToTargetPoi` is supplied, calculate Haversine distance. If distance exceeds `maxDistanceKm`, exclude the property from the final recommendations list.

## Reasoning Strategy
The Hotel Recommendation Skill operates via a structured multi-phase pipeline:
1. **Constraint Compilation:** Parse incoming date ranges, traveler counts, budget limits, and geographic criteria.
2. **Database Pre-Filtering:** Query property indexes filtered by geo-boundaries, pricing tiers, and required amenities.
3. **Profile Matching Matrix:** Apply a weighting algorithm to the remaining properties:
   * *Family:* High weights on amenities like "kids club", "family room", "kitchen", "laundry".
   * *Senior:* High weights on "elevator", "accessible", "quiet".
   * *Couple:* High weights on "boutique", "adults only", "spa", "rooftop".
4. **Scoring and Deduplication:** Sort candidates by weighted suitability score and select the top 3–5 highest scoring hotels to display.
5. **Confidence Assessment:** Evaluate matching robustness (e.g., metadata completeness, exact amenity validation).

## Data Sources
* **Hotel Content Providers:** Aggregated property metadata databases (GDS systems, OTAs, or OpenStreetMap hotel tags).
* **Review Engines:** Standardized ratings and parsed user reviews for sentiment tagging.
* **Geographic Mapping Systems:** Spatial databases to verify neighborhood boundaries and compute distance metrics.

## Error Handling
* **Missing Check-In/Check-Out Dates:** If dates are missing, fallback to generating recommendations for a default 3-night weekend trip starting 30 days from the current date. Output a warning to the user.
* **No Matches Found:** If filtering by `requiredAmenities` yields 0 hotels, relax the criteria by removing elements starting with the least critical (e.g., "pool" or "breakfast"), then re-run. Return the results indicating which filters were relaxed.
* **Over Capacity:** If travelersCount > 4 and room count is 1, alert the system/user that multiple rooms or suites are required and adjust search parameters.

## Validation Rules
* **Logical Dates:** `checkOutDate` must be at least one day after `checkInDate`.
* **Positive Pricing:** Price per night and total price must be positive numbers.
* **Coordinates Validity:** Latitude must be within [-90.0, 90.0] and longitude within [-180.0, 180.0].

## Confidence Score
The final `confidenceScore` is computed out of 1.0:
* Start with `1.0`.
* Deduct `0.1` for every requested amenity that was labeled "unverified" rather than "strictly confirmed".
* Deduct `0.1` if the user review rating is based on fewer than 20 reviews.
* Deduct `0.15` if the average price of recommended hotels falls on the extreme border (+/- 5%) of the requested budget tier.
* Deduct `0.05` for every kilometer of distance beyond the ideal target radius.

## Example Scenarios

### Scenario 1: Family Trip to Rome
* **Context:** Family of four requesting a mid-range hotel near the Vatican with WiFi, Breakfast, and AC.
* **Logic:** The engine filters Rome accommodations for properties in Prati/Trastevere, checks AC/WiFi/Breakfast tags, and computes distances to the Vatican coordinates.
* **Outcome:** Recommends "Prati Family Suites" with a suitability score of 95.5.

### Scenario 2: Budget Solo Backpacker in Tokyo
* **Context:** A solo student traveling to Tokyo, looking for a budget hostel under $40 USD/night, close to Shibuya.
* **Logic:** Targets capsule hotels and hostels in the Shibuya/Setagaya areas, checking for "free WiFi" and "shared kitchen" tags.
* **Outcome:** Suggests a highly-rated capsule hotel in Shibuya with excellent transit links, scoring 91% on affordability.

### Scenario 3: Luxury Honeymoon in Maldives
* **Context:** Couple looking for a luxury resort overwater villa in the Maldives with private pool, spa, and all-inclusive dining.
* **Logic:** Restricts the database query to 5-star resorts, filters specifically for "overwater villa" room types, and rates based on couple reviews.
* **Outcome:** Recommends two premium private island resorts matching all conditions with 100% confidence.

## Dependencies
* **Map Intelligence Skill:** Used to resolve neighborhood geographic boundaries and walkability/transit distances.
* **User Profile Database:** To fetch global travel preferences if not explicitly provided.

## Success Criteria
* **Relevance:** The recommended hotels match 100% of the requested "requiredAmenities".
* **Accuracy:** Prices returned match verified inventory rates within a 5% tolerance margin.
* **Speed:** Returns recommendations within < 800ms.
