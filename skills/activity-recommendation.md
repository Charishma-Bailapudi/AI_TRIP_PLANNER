# Activity Recommendation Skill

## Purpose
The Activity Recommendation Skill is responsible for discovering, evaluating, and suggesting landmarks, tours, dining establishments, and entertainment options tailored to the traveler's interests, lifestyle preferences, active pacing limits, budget parameters, and dietary requirements.

## Responsibilities
* **Interest Profiling:** Match candidate activities directly against user interest preferences (e.g., matching "nature" to botanical gardens or hiking trails, "history" to ruins or museums).
* **Dining & Dietary Filtering:** Scan dining recommendations to ensure they support specified dietary requirements (e.g., gluten-free, vegan, kosher, vegetarian).
* **Demographic Suitability Validation:** Classify activities based on physical difficulty and age-appropriateness (e.g., verifying if a hiking trail is suitable for children or if a wine tasting is appropriate for a solo traveler).
* **Cost & Budget Auditing:** Ensure that the estimated costs of recommended experiences are in line with the specified budget tier.
* **Duration Estimation:** Label activities with accurate dwell times (e.g., 2 hours for a museum, 1 hour for lunch) to enable precise scheduling.

## Inputs (JSON schema/example)

### Input Schema
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "ActivityRecommendationInput",
  "type": "object",
  "properties": {
    "destination": {
      "type": "string",
      "description": "City or area where activities are being planned."
    },
    "travelerProfile": {
      "type": "string",
      "enum": ["solo", "couple", "family_with_kids", "group_friends", "senior"],
      "description": "The demographic profile of the travelers."
    },
    "interests": {
      "type": "array",
      "items": { "type": "string" },
      "description": "High-level interest categories (e.g., culture, adventure, food)."
    },
    "budgetTier": {
      "type": "string",
      "enum": ["budget", "mid_range", "luxury"],
      "description": "Maximum spending preference."
    },
    "dietaryRestrictions": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Dietary filters like vegetarian, vegan, gluten-free, nut-free."
    },
    "activityStyles": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": ["historic", "nature", "active_adventure", "relaxation", "museums", "shopping", "foodie"]
      },
      "description": "Specific styles of desired experiences."
    },
    "season": {
      "type": "string",
      "enum": ["spring", "summer", "autumn", "winter"],
      "description": "The season in which the trip occurs (helps filter out seasonal tours)."
    }
  },
  "required": ["destination", "travelerProfile", "interests", "budgetTier"]
}
```

### Input Example
```json
{
  "destination": "Barcelona, Spain",
  "travelerProfile": "solo",
  "interests": ["architecture", "gastronomy", "local_life"],
  "budgetTier": "mid_range",
  "dietaryRestrictions": ["vegetarian"],
  "activityStyles": ["historic", "foodie", "museums"],
  "season": "spring"
}
```

## Outputs (JSON schema/example with confidence score)

### Output Schema
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "ActivityRecommendationOutput",
  "type": "object",
  "properties": {
    "destination": { "type": "string" },
    "confidenceScore": {
      "type": "number",
      "minimum": 0.0,
      "maximum": 1.0,
      "description": "Aggregate confidence score."
    },
    "activities": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "activityId": { "type": "string" },
          "name": { "type": "string" },
          "category": { "type": "string", "enum": ["sightseeing", "dining", "entertainment", "tour", "shopping"] },
          "description": { "type": "string" },
          "coordinates": {
            "type": "object",
            "properties": {
              "lat": { "type": "number" },
              "lng": { "type": "number" }
            },
            "required": ["lat", "lng"]
          },
          "location": { "type": "string" },
          "estimatedCost": { "type": "number" },
          "currency": { "type": "string" },
          "averageDurationMinutes": { "type": "integer" },
          "suitabilityTags": {
            "type": "array",
            "items": { "type": "string" }
          },
          "dietaryOptions": {
            "type": "array",
            "items": { "type": "string" }
          },
          "rating": { "type": "number", "minimum": 0, "maximum": 5.0 }
        },
        "required": [
          "activityId", "name", "category", "description", "coordinates",
          "location", "estimatedCost", "currency", "averageDurationMinutes",
          "suitabilityTags", "rating"
        ]
      }
    }
  },
  "required": ["destination", "confidenceScore", "activities"]
}
```

### Output Example
```json
{
  "destination": "Barcelona, Spain",
  "confidenceScore": 0.95,
  "activities": [
    {
      "activityId": "act-bcn-sagrada",
      "name": "Sagrada Família Guided Basilica Tour",
      "category": "sightseeing",
      "description": "Explore Gaudí’s unfinished masterpiece with a fast-track ticket and expert guide focusing on architectural design.",
      "coordinates": { "lat": 41.4036, "lng": 2.1744 },
      "location": "Carrer de Mallorca, 401, 08013 Barcelona",
      "estimatedCost": 30.00,
      "currency": "EUR",
      "averageDurationMinutes": 120,
      "suitabilityTags": ["solo", "architecture", "historic", "cultural"],
      "dietaryOptions": [],
      "rating": 4.8
    },
    {
      "activityId": "act-bcn-sesamo",
      "name": "Sésamo - Vegetarian Creative Tapas",
      "category": "dining",
      "description": "A popular dining spot offering innovative vegetarian Spanish tapas, including vegetarian paella and artisanal cheese boards.",
      "coordinates": { "lat": 41.3789, "lng": 2.1648 },
      "location": "Carrer de Sant Antoni Abat, 52, 08001 Barcelona",
      "estimatedCost": 25.00,
      "currency": "EUR",
      "averageDurationMinutes": 90,
      "suitabilityTags": ["solo", "foodie", "vegetarian", "cozy"],
      "dietaryOptions": ["vegetarian", "vegan"],
      "rating": 4.6
    }
  ]
}
```

## Decision Rules
1. **Dietary Integrity Rule:**
   * If `dietaryRestrictions` contains "vegetarian", all recommended *dining* category items must include "vegetarian" in their `dietaryOptions` field. If not, the restaurant must be filtered out.
2. **Age-Appropriateness Gate:**
   * If travelerProfile is "family_with_kids", exclude activities classified with tags like "nightlife", "extreme sports", or "bars". Priority is given to places tagged with "kids friendly", "outdoor parks", or "interactive museum".
3. **Seasonal Activity Filtering:**
   * *Winter:* Automatically exclude outdoor water activities (e.g., snorkeling tours, boat cruises in cold destinations), and prioritize indoor cultural activities, hot springs, or snow activities.
   * *Summer:* Filter out activities reliant on seasonal ice/snow (e.g., ski resorts, ice skating rinks).
4. **Budget Alignment:**
   * *Budget:* Individual activity cost must not exceed $15 USD (excluding food). Focus on free walking tours, parks, public beaches, and street food.
   * *Mid-range:* Individual activity cost between $15 and $60 USD.
   * *Luxury:* Allows high-cost activities exceeding $60 USD (e.g., private guides, hot air balloon flights, premium tastings).

## Reasoning Strategy
The Activity Recommendation Skill uses a Semantic Matching and Constraint Filter architecture:
1. **Tag Expansion:** Expand input interest terms (e.g., "gastronomy" maps to culinary tours, markets, wine bars, fine dining).
2. **Geographical Relevance Scoring:** Score POIs based on average user ratings and matching proximity within the destination.
3. **Hard Constraint Filtering:** Prune the list of candidates using dietary, seasonal, demographic, and budget limits.
4. **Soft Profile Scoring:** Re-rank the remaining pool using profile weights (e.g., solo travelers get high affinity scores for group walking tours, cooking classes, and social bistros).
5. **Diversity Enforcement:** Ensure the output has a balance of categories (e.g., ensuring not *all* suggestions are museums, unless explicitly requested).

## Data Sources
* **Local Business APIs:** Yelp, Google Places, or TripAdvisor APIs for ratings, reviews, operating status, and price tiers.
* **Tourism Content Networks:** Blogs, travel guides, and local tourism boards for descriptive copy and historic details.
* **Allergy/Dietary Directories:** Databases tracking gluten-free, vegan, and allergy-friendly restaurant options.

## Error Handling
* **No Verified Dining Options:** If no restaurants match the exact dietary restriction in the database, return local grocery markets that support dietary sections, alert the system/user, and prompt for manual review.
* **Location Coordinate Drift:** If lat/lng coordinates are missing or set to zero, recalculate coordinates using a geocoding fallback API; if that fails, drop the activity from the recommendation pool.

## Validation Rules
* **Category Completeness:** Every returned item must match one of the predefined categories: `sightseeing`, `dining`, `entertainment`, `tour`, `shopping`.
* **Non-Zero Duration:** Estimated duration must be greater than zero minutes and not exceed 480 minutes (8 hours) for a single activity.

## Confidence Score
The `confidenceScore` is calculated out of 1.0:
* Start with `1.0`.
* Deduct `0.1` for every dining option whose dietary support cannot be verified via active menu scanning.
* Deduct `0.15` if the rating of any recommended activity falls below 4.0/5.0.
* Deduct `0.05` for every mismatch between traveler profile tags and the activity's suitability tags.

## Example Scenarios

### Scenario 1: Solo Traveler in Barcelona
* **Context:** Solo traveler with an interest in architecture and gastronomy on a mid-range budget, seeking vegetarian dining.
* **Logic:** The engine retrieves top architecture tours (Gaudí highlights), filters out non-vegetarian restaurants, and scores dining options suitable for solo dining.
* **Outcome:** Suggests a Sagrada Família Guided Basilica Tour and Sésamo (a vegetarian tapas restaurant).

### Scenario 2: Family in Orlando, Florida
* **Context:** Family with young kids on a budget looking for outdoor and amusement activities during the summer.
* **Logic:** Excludes high-cost park passes to stay in budget, filters for kids-friendly tags, and drops winter-themed events.
* **Outcome:** Recommends free lakefront parks, interactive science centers, and budget-friendly family diners.

### Scenario 3: Luxury Couples in Paris
* **Context:** Couple on a luxury trip looking for romantic, culinary, and relaxation activities in autumn.
* **Logic:** Prioritizes Michelin-starred restaurants, private wine tasting tours, and luxury spa experiences.
* **Outcome:** Recommends a private wine tasting at a historic cellar and a Seine dinner cruise with private table seating.

## Dependencies
* **Itinerary Generation Skill:** Consumes these activity recommendations and arranges them into daily time slots.
* **Map Intelligence Skill:** Used to calculate distances between multiple selected activities.

## Success Criteria
* **Relevance:** 100% of recommended dining slots comply with the input dietary restrictions.
* **Safety:** Out-of-doors summer suggestions must not conflict with severe weather advisories.
* **Throughput:** Capable of generating 15 relevant recommendations in < 600ms.
