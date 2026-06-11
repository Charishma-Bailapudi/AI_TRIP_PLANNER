# Epic 5: AI Itinerary Generation - User Stories

---

Story ID: ITIN-001
Epic: Epic 5: AI Itinerary Generation
Priority: High

As a Traveler,
I want the system to generate a day-by-day sightseeing itinerary based on my destination segments and travel dates,
So that I don't have to manually research what activities to perform each day.

Acceptance Criteria:
* Given a user has confirmed their segment transport selections on the Route Analysis Screen
* When the user clicks the "#btn-confirm-routes" button
* Then the system calls the itinerary generator API and renders day-by-day itinerary cards in the `#timeline-pane` of the dashboard.
* Given the API returns an error or is unable to generate activities
* When the user clicks the confirm button
* Then the dashboard renders a fallback timeline with default regional highlights and an error message asking the user to retry.

Business Rules:
- Generated itineraries must cover the exact date range specified in the trip dates.
- Each day must include a theme and a minimum of 2 activities and 1 dining recommendation.
Dependencies: ROUTE-005, CONN-004
API References: `/api/generate-itinerary` (POST)
Database References: `Trips` table, `Days` table, `ItineraryItems` table
UI References: `#timeline-pane`, `#btn-confirm-routes`, `#dashboard-view`
Estimate: Large

---

Story ID: ITIN-002
Epic: Epic 5: AI Itinerary Generation
Priority: High

As a Traveler,
I want each daily activity card to display structured details including description, estimated duration, cost, and location coordinates,
So that I understand what the attraction is and how to prepare for it.

Acceptance Criteria:
* Given an itinerary has been successfully generated
* When the user clicks on an activity card in the `#timeline-pane`
* Then the card expands to show a detailed description (minimum 2 sentences), the estimated duration in minutes, the entry fee/cost, and its category.
* Given a valid location is associated with the activity
* When the card details are displayed
* Then the system provides a "Show on Map" button containing the latitude and longitude coordinates.

Business Rules:
- Descriptions must not contain generic placeholder text.
- Coordinates must consist of valid decimal degrees (latitude range: -90 to 90, longitude range: -180 to 180).
Dependencies: ITIN-001
API References: `/api/generate-itinerary` (POST)
Database References: `ItineraryItems` table
UI References: `#timeline-pane`, `#dashboard-view`, `#map-pane`
Estimate: Medium

---

Story ID: ITIN-003
Epic: Epic 5: AI Itinerary Generation
Priority: Medium

As a Foodie Traveler,
I want the system to suggest highly rated local dining spots tailored to my travel style tags and budget,
So that I can experience authentic regional cuisine that fits my preferences.

Acceptance Criteria:
* Given the user selected the "Food" style tag in the onboarding screen
* When the day-by-day itinerary is generated
* Then the daily timeline includes dedicated dining cards for breakfast, lunch, and dinner, highlighting local specialties and restaurant reviews.
* Given the user's selected budget is "Budget"
* When dining recommendations are generated
* Then the system filters and recommends local street food stalls, bistros, or cafes with average meals under $15.

Business Rules:
- Dining cost estimates must align with the selected budget tier (Budget: <$15, Moderate: $15-$50, Luxury: >$50 per meal).
- Dining cards must be placed chronologically (Breakfast: 08:00-10:00, Lunch: 12:00-14:00, Dinner: 19:00-21:00).
Dependencies: ITIN-001, BUDG-002
API References: `/api/generate-itinerary` (POST), Google Places API (or equivalent lookup)
Database References: `ItineraryItems` table (category='dining')
UI References: `#timeline-pane`, `#select-styles`, `#select-budget`
Estimate: Medium

---

Story ID: ITIN-004
Epic: Epic 5: AI Itinerary Generation
Priority: Medium

As a Traveler,
I want the system to recommend lodging and hotel options at each destination matching my budget tier,
So that I can secure appropriate overnight accommodations for my trip.

Acceptance Criteria:
* Given a trip with overnight stays at a destination
* When the itinerary generates the daily plan
* Then the first day of each destination stay displays a "Hotel Suggestion" card detailing the hotel name, star rating, estimated cost per night, and budget alignment.
* Given the user changes their budget tier in the dashboard settings
* When the settings are saved
* Then the hotel recommendation is regenerated to match the new budget constraints.

Business Rules:
- Hotel recommendations must be located within a 15km radius of the city center or main sightseeing cluster.
- Price tiers: Budget (<$50/night), Moderate ($50-$200/night), Luxury (>$200/night).
Dependencies: ITIN-001, BUDG-001
API References: `/api/generate-itinerary` (POST), Lodging Search API
Database References: `ItineraryItems` table (category='hotel'), `Trips` table
UI References: `#timeline-pane`
Estimate: Medium

---

Story ID: ITIN-005
Epic: Epic 5: AI Itinerary Generation
Priority: High

As an Organized Traveler,
I want the system to organize my daily activities, transit events, and dining times in chronological order,
So that I can follow a structured schedule without booking overlaps.

Acceptance Criteria:
* Given a daily timeline view is loaded
* When viewing the cards under a specific day
* Then all cards (activities, transit, dining, check-ins) are sorted sequentially by their start times, displaying start and end times clearly.
* Given the duration of an activity is edited
* When the timeline updates
* Then the system shifts the start times of subsequent activities, warning the user if a scheduling conflict occurs.

Business Rules:
- Itineraries cannot have overlapping activity timeframes.
- A minimum 15-minute buffer is automatically added between adjacent activities to account for transit/walking time.
Dependencies: ITIN-001
API References: `/api/generate-itinerary` (POST)
Database References: `ItineraryItems` table (start_time, duration, sequence_order)
UI References: `#timeline-pane`
Estimate: Medium

---

Story ID: ITIN-006
Epic: Epic 5: AI Itinerary Generation
Priority: Medium

As a Selective Traveler,
I want to regenerate a specific activity recommendation on my timeline using the AI engine,
So that I can swap out activities I don't like without changing the rest of my plan.

Acceptance Criteria:
* Given an activity card is displayed on the daily timeline pane
* When the user clicks the "Regenerate" button on that card
* Then the system sends a request to the AI service and swaps the item content with an alternative activity, preserving the start time and duration.
* Given the AI engine returns the same activity
* When the response is received
* Then the system rejects the duplicate and retries until a new, unique activity is returned.

Business Rules:
- The regeneration request must include a list of already recommended place IDs/names for that city to prevent repeats.
- The user can regenerate a single card a maximum of 5 times per session.
Dependencies: ITIN-002
API References: `/api/regenerate-activity` (POST)
Database References: `ItineraryItems` table
UI References: `#timeline-pane`
Estimate: Medium

---

Story ID: ITIN-007
Epic: Epic 5: AI Itinerary Generation
Priority: Low

As a Passion-driven Traveler,
I want to filter the dashboard timeline by style tags (e.g., Adventure, Nature),
So that I can quickly view activities that focus on my immediate interests.

Acceptance Criteria:
* Given a completed itinerary dashboard is open
* When the user clicks a travel style tag filter chip (e.g., "Nature") above the timeline pane
* Then all activity cards not matching the "Nature" category are visually hidden, while transit and lodging cards remain visible.
* When the user deselects the filter chip
* Then the timeline pane displays all scheduled activities again.

Business Rules:
- Filtering is performed on the client-side to ensure sub-second rendering response times.
- Multiple filters can be applied concurrently (AND logic).
Dependencies: ITIN-001
API References: None (Client-side logic)
Database References: None
UI References: `#timeline-pane`, `#select-styles`
Estimate: Small

---

Story ID: ITIN-008
Epic: Epic 5: AI Itinerary Generation
Priority: Medium

As a Traveler,
I want the system to ensure that no sightseeing attraction is recommended twice on the same trip,
So that I do not waste my travel time repeating the same visits.

Acceptance Criteria:
* Given a multi-day itinerary in a single destination city is generated
* When the AI engine compiles the list of attractions
* Then it verifies that each attraction's unique identifier (or name and coordinate pair) is unique across all days of the trip.
* Given a user manually attempts to add an attraction that already exists in the timeline
* When the user clicks save
* Then the system displays a warning modal informing the user that the activity is already scheduled.

Business Rules:
- Uniqueness validation is checked against: geocoded Place ID and name string comparisons.
Dependencies: ITIN-001
API References: `/api/generate-itinerary` (POST)
Database References: `ItineraryItems` table
UI References: `#timeline-pane`
Estimate: Medium

---

Story ID: ITIN-009
Epic: Epic 5: AI Itinerary Generation
Priority: High

As a Traveler,
I want to choose the pacing of my daily itinerary (Relaxed, Moderate, Packed) in the settings,
So that the daily schedules match my energy levels.

Acceptance Criteria:
* Given a user is creating or editing a trip
* When the user selects a pacing preference (e.g., "Relaxed")
* Then the system limits the day's itinerary to a maximum of 2 main sightseeing activities and increases the downtime between items.
* Given the user selects "Packed" pacing
* When the itinerary generates
* Then the day is scheduled with up to 5-6 short-duration activities starting early in the morning and finishing late.

Business Rules:
- Relaxed: Max 2 activities, 2 dining items, minimum 1-hour gaps.
- Moderate: Max 4 activities, 3 dining items, minimum 30-minute gaps (default).
- Packed: Max 6 activities, 3 dining items, minimum 15-minute gaps.
Dependencies: ITIN-005
API References: `/api/generate-itinerary` (POST)
Database References: `Trips` table (stores pacing preference)
UI References: `#dashboard-view`, `#timeline-pane`
Estimate: Medium

---

Story ID: ITIN-010
Epic: Epic 5: AI Itinerary Generation
Priority: Low

As an International Traveler,
I want to see local safety guidelines, tipping customs, and emergency contacts for each destination city on my itinerary,
So that I can navigate the city safely and respect local customs.

Acceptance Criteria:
* Given a travel segment shifts to a new destination city
* When the day-by-day itinerary view renders
* Then a specialized "Local Guide & Safety" card is displayed at the top of the day's timeline listing emergency numbers, tipping norms, and safety warnings.
* Given the user clicks on the "Local Guide" card
* Then it expands to show full travel warnings and emergency hotline dial buttons.

Business Rules:
- Emergency numbers must cover: Police, Ambulance, Fire, and Tourism Helpline.
- Guide cards must adjust content based on destination country codes.
Dependencies: ITIN-001
API References: `/api/generate-itinerary` (POST)
Database References: `LocalGuides` table
UI References: `#timeline-pane`
Estimate: Small
