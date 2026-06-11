# Route Optimization Skill

## Purpose
The **Route Optimization Skill** evaluates, compares, and determines the most efficient, cost-effective, and convenient travel routes between two geographical locations (Source and Destination) for any given trip segment. It integrates and analyzes multi-modal transportation options—including commercial flights, railways, and road transport (taxis, local buses, private cabs)—to produce an optimized travel plan tailored to the user's budget tier, duration constraints, and travel preferences.

---

## Responsibilities
*   **Multi-Modal Evaluation:** Query and parse transportation data from flights, trains, and road transit APIs for every trip segment.
*   **Hub Proximity Discovery:** Identify the nearest commercial airports and railway stations within defined search radii (150 km for airports, 100 km for railways) when direct transit is unavailable.
*   **Last-Mile Routing:** Connect main transit terminals to the final destination using local taxi routes, cabs, or buses.
*   **Pareto-Optimal Scoring:** Rank routes based on a mathematical trade-off between cost, duration, and convenience (number of transfers).
*   **Preference Alignment:** Adjust scoring weights dynamically based on user-selected travel styles (e.g., prioritizing speed for business travelers or prioritizing economy for budget backpackers).

---

## Inputs (JSON schema/example)

### Input JSON Schema
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "RouteOptimizationInput",
  "type": "object",
  "required": [
    "segmentId",
    "source",
    "destination",
    "travelDate",
    "travelersCount",
    "budgetTier",
    "preferences"
  ],
  "properties": {
    "segmentId": {
      "type": "string",
      "description": "Unique identifier for the segment being analyzed"
    },
    "source": {
      "type": "string",
      "description": "Name of the origin city or station"
    },
    "destination": {
      "type": "string",
      "description": "Name of the destination city or station"
    },
    "travelDate": {
      "type": "string",
      "format": "date",
      "description": "Expected travel date in YYYY-MM-DD format"
    },
    "travelersCount": {
      "type": "integer",
      "minimum": 1,
      "description": "Number of people traveling"
    },
    "budgetTier": {
      "type": "string",
      "enum": ["Budget", "Moderate", "Luxury"],
      "description": "The spending tier limit chosen by the traveler"
    },
    "preferences": {
      "type": "object",
      "required": ["prioritizeSpeed", "prioritizeComfort", "avoidLayovers"],
      "properties": {
        "prioritizeSpeed": { "type": "boolean" },
        "prioritizeComfort": { "type": "boolean" },
        "avoidLayovers": { "type": "boolean" }
      }
    }
  }
}
```

### Input JSON Example
```json
{
  "segmentId": "sg_opt_001",
  "source": "Anakapalle",
  "destination": "Shirdi",
  "travelDate": "2026-08-01",
  "travelersCount": 1,
  "budgetTier": "Moderate",
  "preferences": {
    "prioritizeSpeed": true,
    "prioritizeComfort": false,
    "avoidLayovers": false
  }
}
```

---

## Outputs (JSON schema/example with confidence score)

### Output JSON Schema
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "RouteOptimizationOutput",
  "type": "object",
  "required": [
    "segmentId",
    "recommendedRoute",
    "alternativeRoutes",
    "nearestHubs",
    "confidenceScore"
  ],
  "properties": {
    "segmentId": { "type": "string" },
    "recommendedRoute": {
      "type": "object",
      "required": ["routeId", "steps", "cost", "durationMinutes", "reason"],
      "properties": {
        "routeId": { "type": "string" },
        "steps": {
          "type": "array",
          "items": { "type": "string" }
        },
        "cost": { "type": "number", "minimum": 0 },
        "durationMinutes": { "type": "integer", "minimum": 0 },
        "reason": { "type": "string" }
      }
    },
    "alternativeRoutes": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["routeId", "steps", "cost", "durationMinutes", "label"],
        "properties": {
          "routeId": { "type": "string" },
          "steps": {
            "type": "array",
            "items": { "type": "string" }
          },
          "cost": { "type": "number" },
          "durationMinutes": { "type": "integer" },
          "label": { "type": "string", "enum": ["Cheapest", "Fastest", "Balanced"] }
        }
      }
    },
    "nearestHubs": {
      "type": "object",
      "required": ["sourceAirport", "sourceRailway", "destinationAirport", "destinationRailway"],
      "properties": {
        "sourceAirport": {
          "type": "object",
          "properties": {
            "name": { "type": "string" },
            "code": { "type": "string" },
            "distanceKm": { "type": "number" }
          }
        },
        "sourceRailway": {
          "type": "object",
          "properties": {
            "name": { "type": "string" },
            "code": { "type": "string" },
            "distanceKm": { "type": "number" }
          }
        },
        "destinationAirport": {
          "type": "object",
          "properties": {
            "name": { "type": "string" },
            "code": { "type": "string" },
            "distanceKm": { "type": "number" }
          }
        },
        "destinationRailway": {
          "type": "object",
          "properties": {
            "name": { "type": "string" },
            "code": { "type": "string" },
            "distanceKm": { "type": "number" }
          }
        }
      }
    },
    "confidenceScore": {
      "type": "number",
      "minimum": 0.0,
      "maximum": 1.0
    }
  }
}
```

### Output JSON Example
```json
{
  "segmentId": "sg_opt_001",
  "recommendedRoute": {
    "routeId": "rt_fastest_01",
    "steps": [
      "Taxi from Anakapalle to Visakhapatnam Airport (VTZ) [35 km]",
      "Flight from VTZ to Hyderabad (HYD)",
      "Flight from HYD to Shirdi Airport (SAG)",
      "Local Taxi from SAG to Shirdi Temple Area [14 km]"
    ],
    "cost": 135.00,
    "durationMinutes": 360,
    "reason": "Saves 17 hours of travel time compared to rail options, while staying safely within the Moderate budget tier ceiling ($150)."
  },
  "alternativeRoutes": [
    {
      "routeId": "rt_cheapest_01",
      "steps": [
        "Train from Anakapalle (AKP) to Kopargaon Station (KPG)",
        "Taxi from Kopargaon Station to Shirdi Temple Area [16 km]"
      ],
      "cost": 33.00,
      "durationMinutes": 1421,
      "label": "Cheapest"
    }
  ],
  "nearestHubs": {
    "sourceAirport": {
      "name": "Visakhapatnam Airport",
      "code": "VTZ",
      "distanceKm": 35.0
    },
    "sourceRailway": {
      "name": "Anakapalle Railway Station",
      "code": "AKP",
      "distanceKm": 0.0
    },
    "destinationAirport": {
      "name": "Shirdi Airport",
      "code": "SAG",
      "distanceKm": 14.2
    },
    "destinationRailway": {
      "name": "Kopargaon Railway Station",
      "code": "KPG",
      "distanceKm": 16.0
    }
  },
  "confidenceScore": 0.95
}
```

---

## Decision Rules
The system evaluates routes by matching parameters against the following decision tables and heuristics:

### 1. Distance-Based Routing Thresholds
| Distance between Hubs | Primary Transit Priority | Layover/Transfer Strategy |
| :--- | :--- | :--- |
| **< 150 km** | Road Transit (Taxi, Bus) | Direct routes only. Do not consider flights. |
| **150 - 500 km** | Rail (Express Trains), Cabs | Max 1 transfer permitted for rail. Flights only if train takes > 8 hours. |
| **> 500 km** | Air (Commercial Flight) | Default to flights. Fallback to express trains for budget tier. |

### 2. Budget Tier Fare Ceilings (per segment)
| Budget Tier | Air Travel Max Cost | Rail / Road Max Cost | Layover/Comfort Tolerance |
| :--- | :--- | :--- | :--- |
| **Budget** | $50 | $35 | Layovers accepted; slow passenger rail accepted. |
| **Moderate** | $150 | $80 | Max 1 layover; express rail preferred. |
| **Luxury** | Unlimited | Unlimited | Direct flights only; premium private cabs only. |

### 3. Modality Selection Logic
*   **Rule 3.1:** If `budgetTier` is *Budget* and direct train exists, recommend the train even if flight saves > 50% time, unless the flight cost is under the $50 cap.
*   **Rule 3.2:** If `budgetTier` is *Luxury*, discard all train options taking > 4 hours if a flight route is available.
*   **Rule 3.3:** If `destination` lacks an airport but has an airport within 150 km, append a taxi segment. Calculate taxi duration at $45\text{ km/h}$ average speed and $0.50\text{ USD/km}$ fare.

---

## Reasoning Strategy
The agent uses a **Multi-Objective Utility Minimization** model to determine the optimal route. It defines utility $U$ as a function of normalized Cost ($C$), Duration ($D$), and Transfer Overhead ($T$):

$$U = (w_c \cdot C_{\text{norm}}) + (w_d \cdot D_{\text{norm}}) + (w_t \cdot T_{\text{norm}})$$

Where:
*   $w_c, w_d, w_t$ represent weights configured by the user's preferences:
    *   **Prioritize Speed:** $w_d = 0.6$, $w_c = 0.2$, $w_t = 0.2$
    *   **Prioritize Comfort:** $w_t = 0.5$, $w_d = 0.3$, $w_c = 0.2$
    *   **Budget Tier Baseline:** $w_c = 0.7$, $w_d = 0.2$, $w_t = 0.1$
*   $C_{\text{norm}}, D_{\text{norm}}, T_{\text{norm}}$ are standard min-max normalization values within the available choice set.

The optimization workflow:
1.  **Discover Hubs:** Execute database geocoding query to resolve coordinates. Scan nearest commercial hubs.
2.  **API Extraction:** Query the flight and railway APIs for the specified travel date.
3.  **Path Synthesis:** Combine legs (e.g., Source $\rightarrow$ Source Airport $\rightarrow$ Destination Airport $\rightarrow$ Destination) using a directed acyclic graph (DAG) routing solver.
4.  **Constraints Pruning:** Filter out any paths exceeding the budget tier ceiling.
5.  **Pareto Evaluation:** Calculate the utility score for each surviving path. Choose the option with the lowest utility score as the `recommendedRoute`. Select the runners-up as `alternativeRoutes`.

---

## Data Sources
*   **Flight API Integration:** Amadeus API and Skyscanner API for active flight schedules, pricing, and baggage policies.
*   **Railway API Integration:** Rome2Rio API and National Rail API engines for train routing, timetables, and carriage classes.
*   **Road Routing Engine:** Mapbox Directions API for driving distance, traffic congestion predictions, and taxi routing times.
*   **Internal Airports & Stations Cache:** Local MongoDB collections indexing commercial airports and railway junctions with GPS coordinates.

---

## Error Handling
*   **API Timeout:** If an external flight or train search API fails to respond within 8 seconds, the service falls back to historic values stored in the `CachedRoutes` database collection.
*   **No Direct Routes:** If no direct commercial flight or train exists, the routing engine queries the Connectivity Agent to chain multi-modal connections (e.g. flight to adjacent city + bus).
*   **Outdated Schedule Cache:** If booking prices spike by > 50% relative to the cached database index, the agent re-evaluates alternatives using real-time API fetching and marks the cached document as expired.

---

## Validation Rules
*   **Date Check:** `travelDate` must be at least 24 hours in the future and fall within the global trip start and end date boundaries.
*   **Location Geocoding Validation:** Source and destination locations must resolve to valid GPS coordinates.
*   **Sequencing Safety:** In any multi-step route, step $N$'s destination must match step $N+1$'s origin exactly. Layovers at airports must have a minimum transfer window of 90 minutes.

---

## Confidence Score
The final output contains a `confidenceScore` representing data freshness and structural completeness. It is calculated as follows:

$$\text{Confidence Score} = (0.4 \cdot S_{\text{fresh}}) + (0.3 \cdot S_{\text{conn}}) + (0.3 \cdot S_{\text{pref}})$$

Where:
*   $S_{\text{fresh}}$ (Data Freshness): $1.0$ if fetched live from APIs; $0.6$ if resolved from the 7-day database TTL cache.
*   $S_{\text{conn}}$ (Connectivity Certainty): $1.0$ if all transit steps are direct; $0.7$ if transfers include regional taxi operations on unpaved routes.
*   $S_{\text{pref}}$ (Preference Matching): $1.0$ if the recommended option meets all user comfort toggle conditions; $0.5$ if user preferences had to be compromised to stay within budget constraints.

---

## Example Scenarios

### Scenario 1: Long Distance Corridor with Direct Air Route
*   **Input Parameters:**
    ```json
    {
      "segmentId": "sg_ex_01",
      "source": "New Delhi (DEL)",
      "destination": "Mumbai (BOM)",
      "travelDate": "2026-08-01",
      "travelersCount": 1,
      "budgetTier": "Moderate",
      "preferences": { "prioritizeSpeed": true, "prioritizeComfort": true, "avoidLayovers": true }
    }
    ```
*   **Execution Logic:** The routing engine queries Delhi and Mumbai airport APIs. It identifies multiple direct flights (duration 130 minutes, cost $75). Train routes exist but take 16 hours. Since speed and comfort are prioritized, utility calculations favor air travel.
*   **Output Result:**
    ```json
    {
      "segmentId": "sg_ex_01",
      "recommendedRoute": {
        "routeId": "rt_del_bom_direct",
        "steps": ["Flight from DEL to BOM (Direct)"],
        "cost": 78.00,
        "durationMinutes": 130,
        "reason": "Direct flight matches preference for speed and comfort, staying well below Moderate ceiling ($150)."
      },
      "alternativeRoutes": [
        {
          "routeId": "rt_del_bom_train",
          "steps": ["Rajdhani Express Train from New Delhi (NDLS) to Mumbai Central (MMCT)"],
          "cost": 45.00,
          "durationMinutes": 950,
          "label": "Cheapest"
        }
      ],
      "nearestHubs": {
        "sourceAirport": { "name": "Indira Gandhi International Airport", "code": "DEL", "distanceKm": 0 },
        "sourceRailway": { "name": "New Delhi Railway Station", "code": "NDLS", "distanceKm": 0 },
        "destinationAirport": { "name": "Chhatrapati Shivaji Maharaj Airport", "code": "BOM", "distanceKm": 0 },
        "destinationRailway": { "name": "Mumbai Central Railway Station", "code": "MMCT", "distanceKm": 0 }
      },
      "confidenceScore": 1.00
    }
    ```

### Scenario 2: Destination Lacking Airport (Multi-Modal Transfer)
*   **Input Parameters:**
    ```json
    {
      "segmentId": "sg_ex_02",
      "source": "Visakhapatnam",
      "destination": "Araku Valley",
      "travelDate": "2026-08-05",
      "travelersCount": 2,
      "budgetTier": "Budget",
      "preferences": { "prioritizeSpeed": false, "prioritizeComfort": false, "avoidLayovers": false }
    }
    ```
*   **Execution Logic:** Araku has no airport. The nearest airport is Visakhapatnam (115 km away). A scenic railway line connects Visakhapatnam to Araku. A local road route exists. For a Budget tier traveler, the train is extremely cheap ($2.50 vs $60 taxi). The algorithm ranks the train as recommended.
*   **Output Result:**
    ```json
    {
      "segmentId": "sg_ex_02",
      "recommendedRoute": {
        "routeId": "rt_vskp_araku_rail",
        "steps": ["Vistadome Express Train from Visakhapatnam (VSKP) to Araku (ARK)"],
        "cost": 5.00,
        "durationMinutes": 230,
        "reason": "Direct passenger rail is highly economical for budget travelers and avoids expensive road transfers."
      },
      "alternativeRoutes": [
        {
          "routeId": "rt_vskp_araku_road",
          "steps": ["Private Taxi from Visakhapatnam to Araku Valley [115 km]"],
          "cost": 55.00,
          "durationMinutes": 190,
          "label": "Fastest"
        }
      ],
      "nearestHubs": {
        "sourceAirport": { "name": "Visakhapatnam Airport", "code": "VTZ", "distanceKm": 0 },
        "sourceRailway": { "name": "Visakhapatnam Railway Station", "code": "VSKP", "distanceKm": 0 },
        "destinationAirport": { "name": "Visakhapatnam Airport", "code": "VTZ", "distanceKm": 115.0 },
        "destinationRailway": { "name": "Araku Railway Station", "code": "ARK", "distanceKm": 0 }
      },
      "confidenceScore": 0.90
    }
    ```

### Scenario 3: Short Distance Transit with Budget Priority
*   **Input Parameters:**
    ```json
    {
      "segmentId": "sg_ex_03",
      "source": "Anakapalle",
      "destination": "Visakhapatnam",
      "travelDate": "2026-08-10",
      "travelersCount": 1,
      "budgetTier": "Budget",
      "preferences": { "prioritizeSpeed": false, "prioritizeComfort": false, "avoidLayovers": true }
    }
    ```
*   **Execution Logic:** The distance is 35 km. The routing engine rejects flights. Road (bus/taxi) and rail (local train) are evaluated. The local train costs $0.50 and takes 50 minutes. Bus costs $1.50 and takes 75 minutes. Taxi costs $15.00 and takes 45 minutes. For Budget tier, the local passenger train is chosen.
*   **Output Result:**
    ```json
    {
      "segmentId": "sg_ex_03",
      "recommendedRoute": {
        "routeId": "rt_akp_vizag_local_rail",
        "steps": ["Local Passenger Train from Anakapalle (AKP) to Visakhapatnam (VSKP)"],
        "cost": 0.50,
        "durationMinutes": 50,
        "reason": "Most economical and reliable transit option, avoiding potential road traffic delays."
      },
      "alternativeRoutes": [
        {
          "routeId": "rt_akp_vizag_taxi",
          "steps": ["Local Taxi via NH16 road link [35 km]"],
          "cost": 15.00,
          "durationMinutes": 45,
          "label": "Fastest"
        }
      ],
      "nearestHubs": {
        "sourceAirport": { "name": "Visakhapatnam Airport", "code": "VTZ", "distanceKm": 30.0 },
        "sourceRailway": { "name": "Anakapalle Railway Station", "code": "AKP", "distanceKm": 0 },
        "destinationAirport": { "name": "Visakhapatnam Airport", "code": "VTZ", "distanceKm": 5.0 },
        "destinationRailway": { "name": "Visakhapatnam Railway Station", "code": "VSKP", "distanceKm": 0 }
      },
      "confidenceScore": 0.98
    }
    ```

---

## Dependencies
*   **Flight Search Agent:** Provides flight details, ticket availability, and airline parameters.
*   **Train Search Agent:** Feeds railway connectivity data and operating schedule indices.
*   **Connectivity Agent:** Offers local transport fallback options, taxi fees, and distance buffers.
*   **Google Maps/Mapbox API Client:** Resolves spatial queries, geocodes input text, and determines driving routes.
*   **Mongoose CachedRoutes Repository:** Accesses internal cached search parameters to speed up response execution.

---

## Success Criteria
*   **Latency constraint:** Complete multi-modal analysis and select optimal route under 5.0 seconds.
*   **Budget compliance:** Recommended options must never exceed the budget tier ceiling.
*   **Route feasibility:** Output steps must represent a physically continuous journey with adequate transfer padding (minimum 90 minutes for flight layovers, 30 minutes for train transfers).
*   **Accuracy threshold:** Minimum 95% matching correctness between output route details and verified external API listings.
