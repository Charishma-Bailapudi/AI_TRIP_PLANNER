# Map Intelligence Skill

## Purpose
The Map Intelligence Skill provides geographical calculations, transit logic, routing optimization, and map viewport transformations. It calculates route paths (polylines), decides the optimal transportation modes, computes transit times, and sequences points of interest (POIs) to minimize travel times.

## Responsibilities
* **Waypoint Sequence Optimization:** Solve the Traveling Salesperson Problem (TSP) for daily itineraries to minimize overall transit distance and time.
* **Transit Mode Selection:** Dynamically choose the best mode of travel (e.g., walking, driving, public transit, biking) based on city density, walking thresholds, and transit accessibility.
* **Route Path Generation:** Request and parse coordinate geometry (encoded polylines) to render route lines on maps.
* **Map Center & Bounds Calculation:** Dynamically compute coordinate envelopes to determine center coordinates and zoom levels for rendering UI maps.
* **Travel Duration Estimation:** Supply travel times and walking distances to scheduling skills.

## Inputs (JSON schema/example)

### Input Schema
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "MapIntelligenceInput",
  "type": "object",
  "properties": {
    "startLocation": {
      "type": "object",
      "properties": {
        "name": { "type": "string" },
        "coordinates": {
          "type": "object",
          "properties": {
            "lat": { "type": "number" },
            "lng": { "type": "number" }
          },
          "required": ["lat", "lng"]
        }
      },
      "required": ["name", "coordinates"],
      "description": "Starting location for the day (e.g., hotel)."
    },
    "waypoints": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "name": { "type": "string" },
          "coordinates": {
            "type": "object",
            "properties": {
              "lat": { "type": "number" },
              "lng": { "type": "number" }
            },
            "required": ["lat", "lng"]
          }
        },
        "required": ["id", "name", "coordinates"]
      },
      "description": "List of activities/locations to visit during the day."
    },
    "transportationPreference": {
      "type": "string",
      "enum": ["walking", "driving", "transit", "any"],
      "description": "Primary preferred mode of travel."
    },
    "optimizeOrder": {
      "type": "boolean",
      "description": "Set to true to calculate the shortest path sequence (reorder waypoints)."
    }
  },
  "required": ["startLocation", "waypoints", "transportationPreference"]
}
```

### Input Example
```json
{
  "startLocation": {
    "name": "Hotel Cavour, Milan",
    "coordinates": { "lat": 45.4782, "lng": 9.1953 }
  },
  "waypoints": [
    {
      "id": "wp-duomo",
      "name": "Duomo di Milano",
      "coordinates": { "lat": 45.4641, "lng": 9.1919 }
    },
    {
      "id": "wp-cenacolo",
      "name": "The Last Supper (Santa Maria delle Grazie)",
      "coordinates": { "lat": 45.4660, "lng": 9.1709 }
    },
    {
      "id": "wp-brera",
      "name": "Pinacoteca di Brera",
      "coordinates": { "lat": 45.4720, "lng": 9.1878 }
    }
  ],
  "transportationPreference": "any",
  "optimizeOrder": true
}
```

## Outputs (JSON schema/example with confidence score)

### Output Schema
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "MapIntelligenceOutput",
  "type": "object",
  "properties": {
    "confidenceScore": {
      "type": "number",
      "minimum": 0.0,
      "maximum": 1.0,
      "description": "Accuracy confidence of routing and calculations."
    },
    "totalDistanceMeters": { "type": "integer" },
    "totalDurationMinutes": { "type": "integer" },
    "optimizedOrderIds": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Order of waypoint IDs representing the shortest path sequence."
    },
    "routeSegments": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "fromId": { "type": "string" },
          "toId": { "type": "string" },
          "mode": { "type": "string", "enum": ["walking", "driving", "transit"] },
          "distanceMeters": { "type": "integer" },
          "durationMinutes": { "type": "integer" },
          "encodedPolyline": {
            "type": "string",
            "description": "Google/OSRM encoded polyline path for drawing map lines."
          }
        },
        "required": ["fromId", "toId", "mode", "distanceMeters", "durationMinutes", "encodedPolyline"]
      }
    },
    "mapViewport": {
      "type": "object",
      "properties": {
        "center": {
          "type": "object",
          "properties": {
            "lat": { "type": "number" },
            "lng": { "type": "number" }
          },
          "required": ["lat", "lng"]
        },
        "zoomLevel": {
          "type": "integer",
          "description": "Calculated zoom level (typically 1 to 20) for standard map display."
        }
      },
      "required": ["center", "zoomLevel"]
    }
  },
  "required": [
    "confidenceScore", "totalDistanceMeters", "totalDurationMinutes",
    "optimizedOrderIds", "routeSegments", "mapViewport"
  ]
}
```

### Output Example
```json
{
  "confidenceScore": 0.98,
  "totalDistanceMeters": 5800,
  "totalDurationMinutes": 55,
  "optimizedOrderIds": ["wp-brera", "wp-duomo", "wp-cenacolo"],
  "routeSegments": [
    {
      "fromId": "hotel",
      "toId": "wp-brera",
      "mode": "walking",
      "distanceMeters": 900,
      "durationMinutes": 11,
      "encodedPolyline": "g~_iGisag@_@sAgA{C"
    },
    {
      "fromId": "wp-brera",
      "toId": "wp-duomo",
      "mode": "walking",
      "distanceMeters": 1100,
      "durationMinutes": 14,
      "encodedPolyline": "e__iGqwag@oBcDe@mD"
    },
    {
      "fromId": "wp-duomo",
      "toId": "wp-cenacolo",
      "mode": "transit",
      "distanceMeters": 3800,
      "durationMinutes": 30,
      "encodedPolyline": "c{|hGw_`@e@yFi@gJ"
    }
  ],
  "mapViewport": {
    "center": { "lat": 45.4711, "lng": 9.1831 },
    "zoomLevel": 14
  }
}
```

## Decision Rules
1. **Mode Decision Matrix:**
   * If distance is **< 1.5 km**, select `walking` as the default mode unless senior travel profile is specified.
   * If distance is **between 1.5 km and 6.0 km** and the destination city has a verified rapid transit network (subway/light rail), select `transit`.
   * If distance is **> 6.0 km** or public transit is unavailable/inconvenient (> 45 min trip), select `driving` (taxi/rideshare).
2. **Viewport Zoom Levels (Bounding Box Rule):**
   * Let $D_{max}$ be the maximum distance (in kilometers) between any two waypoints in the list.
   * If $D_{max} < 1.0\text{ km}$, set `zoomLevel` to 16.
   * If $1.0\text{ km} \leq D_{max} < 3.0\text{ km}$, set `zoomLevel` to 15.
   * If $3.0\text{ km} \leq D_{max} < 10.0\text{ km}$, set `zoomLevel` to 13.
   * If $10.0\text{ km} \leq D_{max} < 50.0\text{ km}$, set `zoomLevel` to 11.
   * If $D_{max} \geq 50.0\text{ km}$, set `zoomLevel` to 8 or lower.
3. **TSP Optimization Threshold:**
   * If `optimizeOrder` is true, perform permutations calculations for lists of size $\leq 10$. If the list of waypoints exceeds 10 elements, apply a nearest-neighbor heuristic instead of brute-force permutation to prevent timeout.

## Reasoning Strategy
The Map Intelligence Skill executes routing calculations sequentially:
1. **Coordinate Validation:** Verify that all coordinates are within global valid ranges.
2. **Matrix Construction:** Request distance matrix APIs to fetch pairwise transit durations and distances for all nodes (including start location).
3. **Sequence Minimization (TSP):** Execute a TSP algorithm using the distance/duration matrix, outputting an ordered array of IDs that minimizes total transit duration.
4. **Detail Route Fetching:** Fetch precise polylines and step-by-step metadata for the sequenced list from OSRM or Google Routes.
5. **Bounding Box Calculations:** Find the minimum and maximum latitude/longitude values among all points, calculate center coordinates, and determine the optimal zoom level.

## Data Sources
* **Routing Engines:** Open Source Routing Machine (OSRM), Valhalla, or Google Maps Directions API.
* **Geocoders:** Nominatim OpenStreetMap or Google Geocoding API.
* **Transit Schedules (Static & Realtime):** GTFS datasets for subway, bus, and light rail routing configurations.

## Error Handling
* **Route Not Found (Water Barrier/Private Road):** If the routing engine returns a routing error (e.g., trying to route across oceans or private areas), calculate the straight-line (Haversine) distance, label the mode as "unknown", apply an average walking speed coefficient (4 km/h), and flag the segment.
* **API Rate-Limiting:** Fallback to Haversine distance calculations scaled by a localized routing coefficient (typically 1.3 in grid cities, 1.5 in historical European street systems).

## Validation Rules
* **No Island Segments:** Every route segment must connect to the next segment in the optimized sequence (i.e. `toId` of segment $N$ must match `fromId` of segment $N+1$).
* **Finite Coordinates:** Calculated viewport center coordinates must be real, finite numbers.

## Confidence Score
The `confidenceScore` is computed as:
$$CS = 1.0 - (0.2 \times N_{fallback\_routes}) - (0.1 \times N_{low\_quality\_gps})$$
* **$N_{fallback\_routes}$**: Number of segments calculated using straight-line fallbacks rather than verified routing maps.
* **$N_{low\_quality\_gps}$**: Number of POI coordinates resolved using low-resolution geocoders.

## Example Scenarios

### Scenario 1: Historic Milan Walking & Transit Tour
* **Context:** Sequence three sights in Milan (Duomo, Santa Maria delle Grazie, Brera) starting from Hotel Cavour.
* **Logic:** The engine calculates walking routes between closely clustered locations (Cavour to Brera, Brera to Duomo) and public transit route for the longer segment (Duomo to Santa Maria delle Grazie).
* **Outcome:** Produces three segments with corresponding polylines and sets the center coordinates to Milan center with a zoom level of 14.

### Scenario 2: Manhattan Midtown Sightseeing
* **Context:** Optimize visiting Times Square, Empire State Building, and Rockefeller Center starting from Grand Central Station.
* **Logic:** Identifies that distances are under 1.5 km and determines that walking is faster than taxi/subway due to Midtown traffic delays.
* **Outcome:** Sequences the itinerary in a circular loop, outputting 100% walking directions and a zoom level of 15.

### Scenario 3: Day Trip from Munich to Neuschwanstein Castle
* **Context:** Plan route from Munich hotel to Neuschwanstein Castle (Füssen, Germany).
* **Logic:** Computes distance (approx. 120 km) and decides on train transit/driving instead of walking. Sets zoom level to 8 to fit both cities on the map.
* **Outcome:** Outputs a driving or rail route with long-distance polyline coordinates.

## Dependencies
* **External Routing Engine (like OSRM or Google Maps):** To obtain actual distance matrices and polylines.
* **Geocoding API:** For resolving textual address values into latitude and longitude coordinates.

## Success Criteria
* **Optimization Efficiency:** Sequence optimization runs in < 200ms for $\leq 10$ waypoints.
* **Precision:** Total transit duration estimates fall within 15% of real-world baseline conditions.
* **Visual Integrity:** Generated viewport coordinates encapsulate all itinerary markers.
