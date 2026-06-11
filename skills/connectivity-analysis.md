# Connectivity Analysis Skill

## Purpose
The Connectivity Analysis Skill analyzes the transport infrastructure between travel legs. It detects gaps in direct airport or railway access at the traveler's final destination, identifies the closest transport hubs, and suggests viable ground transit options (taxis, shuttle buses, private cabs, and ferries) to bridge the last mile.

## Responsibilities
- Evaluate the direct accessibility of a target destination (e.g., hotel, remote city, island, national park) by commercial airlines or rail systems.
- Detect missing or closed airport/railway services at the target location.
- Search and identify the nearest high-capacity airport and railway hubs within a configurable geographical radius.
- Calculate distance and travel times between the nearest transit hubs and the destination.
- Query and recommend local ground transportation options, including municipal buses, private shuttles, taxis, ride-hailing services, and ferries.
- Synthesize an end-to-end connection plan for the "last mile" of the journey.

## Inputs (JSON Schema & Example)

### JSON Schema
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "ConnectivityAnalysisInput",
  "type": "object",
  "properties": {
    "destination": {
      "type": "object",
      "properties": {
        "name": { "type": "string" },
        "address": { "type": "string" },
        "latitude": { "type": "number", "minimum": -90.0, "maximum": 90.0 },
        "longitude": { "type": "number", "minimum": -180.0, "maximum": 180.0 }
      },
      "required": ["name", "latitude", "longitude"]
    },
    "preferences": {
      "type": "object",
      "properties": {
        "maxGroundDistanceKm": { "type": "number", "minimum": 10, "default": 200 },
        "preferredGroundModes": {
          "type": "array",
          "items": {
            "type": "string",
            "enum": ["TAXI", "BUS", "PRIVATE_CAB", "FERRY", "CAR_RENTAL"]
          }
        },
        "currency": { "type": "string", "pattern": "^[A-Z]{3}$", "default": "USD" }
      }
    }
  },
  "required": ["destination"]
}
```

### JSON Input Example
```json
{
  "destination": {
    "name": "Amalfi Town Center",
    "address": "Piazza Duomo, 84011 Amalfi SA, Italy",
    "latitude": 40.6331,
    "longitude": 14.6028
  },
  "preferences": {
    "maxGroundDistanceKm": 150,
    "preferredGroundModes": ["BUS", "TAXI", "FERRY"],
    "currency": "EUR"
  }
}
```

## Outputs (JSON Schema & Example)

### JSON Schema
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "ConnectivityAnalysisOutput",
  "type": "object",
  "properties": {
    "analysisId": { "type": "string", "format": "uuid" },
    "destinationConnected": {
      "type": "object",
      "properties": {
        "directAirport": { "type": "boolean" },
        "directRailway": { "type": "boolean" }
      },
      "required": ["directAirport", "directRailway"]
    },
    "nearestAirports": {
      "type": "array",
      "items": { "$ref": "#/definitions/AirportHub" }
    },
    "nearestRailwayStations": {
      "type": "array",
      "items": { "$ref": "#/definitions/RailwayHub" }
    },
    "groundTransportationOptions": {
      "type": "array",
      "items": { "$ref": "#/definitions/GroundTransit" }
    },
    "confidenceScore": { "type": "number", "minimum": 0.0, "maximum": 1.0 },
    "recommendationSummary": { "type": "string" }
  },
  "required": [
    "analysisId", 
    "destinationConnected", 
    "nearestAirports", 
    "nearestRailwayStations", 
    "groundTransportationOptions", 
    "confidenceScore", 
    "recommendationSummary"
  ],
  "definitions": {
    "AirportHub": {
      "type": "object",
      "properties": {
        "iataCode": { "type": "string", "pattern": "^[A-Z]{3}$" },
        "name": { "type": "string" },
        "distanceKm": { "type": "number" },
        "driveTimeMinutes": { "type": "integer" }
      },
      "required": ["iataCode", "name", "distanceKm", "driveTimeMinutes"]
    },
    "RailwayHub": {
      "type": "object",
      "properties": {
        "stationCode": { "type": "string" },
        "name": { "type": "string" },
        "distanceKm": { "type": "number" },
        "driveTimeMinutes": { "type": "integer" }
      },
      "required": ["stationCode", "name", "distanceKm", "driveTimeMinutes"]
    },
    "GroundTransit": {
      "type": "object",
      "properties": {
        "mode": { "type": "string" },
        "provider": { "type": "string" },
        "routeDescription": { "type": "string" },
        "estimatedCost": { "type": "number" },
        "currency": { "type": "string" },
        "durationMinutes": { "type": "integer" },
        "frequency": { "type": "string" },
        "bookingDetails": { "type": "string" }
      },
      "required": ["mode", "routeDescription", "estimatedCost", "currency", "durationMinutes", "frequency"]
    }
  }
}
```

### JSON Output Example
```json
{
  "analysisId": "ef0a13c4-e8b9-4a0b-93fc-46cd2ef819a3",
  "destinationConnected": {
    "directAirport": false,
    "directRailway": false
  },
  "nearestAirports": [
    {
      "iataCode": "NAP",
      "name": "Naples International Airport",
      "distanceKm": 65.2,
      "driveTimeMinutes": 75
    },
    {
      "iataCode": "FCO",
      "name": "Rome Fiumicino Airport",
      "distanceKm": 290.0,
      "driveTimeMinutes": 210
    }
  ],
  "nearestRailwayStations": [
    {
      "stationCode": "SAL",
      "name": "Salerno Railway Station",
      "distanceKm": 25.1,
      "driveTimeMinutes": 45
    },
    {
      "stationCode": "NAP_C",
      "name": "Napoli Centrale",
      "distanceKm": 61.5,
      "driveTimeMinutes": 70
    }
  ],
  "groundTransportationOptions": [
    {
      "mode": "FERRY",
      "provider": "Travelmar",
      "routeDescription": "Salerno (Piazza della Concordia) to Amalfi Port",
      "estimatedCost": 10.00,
      "currency": "EUR",
      "durationMinutes": 35,
      "frequency": "Hourly between 09:00 and 19:00",
      "bookingDetails": "Tickets purchasable at the dock or online via Travelmar portal."
    },
    {
      "mode": "BUS",
      "provider": "SITA Sud",
      "routeDescription": "Salerno Train Station to Amalfi Coast Terminal",
      "estimatedCost": 3.40,
      "currency": "EUR",
      "durationMinutes": 75,
      "frequency": "Every 45 minutes",
      "bookingDetails": "Purchase tickets in advance at local tobacco shops (Tabaccheria)."
    },
    {
      "mode": "TAXI",
      "provider": "Salerno Consorzio Taxi",
      "routeDescription": "Salerno Train Station direct to Amalfi Hotel",
      "estimatedCost": 120.00,
      "currency": "EUR",
      "durationMinutes": 50,
      "frequency": "On-demand at station taxi queue",
      "bookingDetails": "Metered or pre-negotiated fixed city tariff."
    }
  ],
  "confidenceScore": 0.95,
  "notes": "Amalfi has no active runway or railway tracks. Ground and water ferry transfers successfully resolved from Salerno and Naples."
}
```

## Decision Rules

1. **Direct Connection Criteria:**
   - **Airport Connectivity:** Marked `true` only if there is a commercial airport (IATA code) within 25 km of the destination coordinates.
   - **Railway Connectivity:** Marked `true` only if there is a high-speed or major regional railway station within 15 km of the destination coordinates.

2. **Hub Proximity Search:**
   - Search for airports in expanding rings: 50 km, 100 km, then up to `maxGroundDistanceKm` (default 200 km).
   - Search for rail stations within 50 km, expanding to 100 km.

3. **Ground Mode Recommendation Engine:**
   - **Distance < 30 km:** Recommend Taxi/Ride-share as primary, local bus as secondary.
   - **Distance 30 - 100 km:** Recommend Regional bus line, private cab service, and car rental.
   - **Distance > 100 km:** Recommend private driver or car rental. Flag long drive warning.
   - **Water Barriers:** If the route intersects open water bodies without bridge connectivity (e.g. from Naples/Sorrento to Capri Island), flag the route and mandate a `FERRY` or `HYDROFOIL` transit, discarding pure road taxi itineraries.

4. **Clustering Logic:**
   If multiple ground paths are available, prioritize they group by hub. (e.g., group all transit from Naples Airport together, and group all transit from Salerno Station together).

## Reasoning Strategy
The agent employs the following geographical reasoning model:
1. **Coordinate Verification:** Resolve the destination's latitude and longitude and verify validity.
2. **Infrastructure Auditing:** Query spatial databases to see if the destination falls inside a city containing an active passenger airport or railway terminal.
3. **Spatial Search (KNN):** Perform a K-nearest-neighbor search on airport and railway coordinate lists to find the closest active hubs.
4. **Transit Routing:** Consult routing services (e.g. OSRM, Google Maps API, local transit feeds) to fetch driving distances and times from those hubs.
5. **Mode Synthesis:** Check if water bodies exist between the hub and destination. If yes, query ferry schedule APIs. If no, query bus schedule API directories and taxi local tariff configurations.

## Data Sources
- **OpenStreetMap (OSM) / Overpass API:** For spatial queries on railways, roadways, and marine ferry ports.
- **Geonames Database:** To resolve place names and map them to physical coordinates.
- **Rome2Rio API:** Comprehensive multi-modal transit information engine (ferries, long-distance buses, regional routes).
- **GTFS (General Transit Feed Specification) Directories:** Real-time and scheduled public bus and train data.

## Error Handling
- **Fuzzy Coordinate Match:** If coordinates are missing, request address resolution. If address is ambiguous, return a list of top 3 coordinate guesses and request clarification, setting `confidenceScore` to `0.0`.
- **Transit Data Blindspot:** If regional bus data is unavailable for a remote region, suggest a generic "Private Taxi / Local Cab" option based on standard mileage-based cost estimators ($1.50 per km) and set `confidenceScore` to `0.65`.
- **Ferry Seasonality:** Many ferries (e.g., in the Mediterranean) do not run in winter (November - March). Check the travel month; if winter, filter out ferry recommendations and suggest land-based bus/cab options, warning the user.

## Validation Rules
- Destination latitude must be between -90.0 and 90.0. Destination longitude must be between -180.0 and 180.0.
- `maxGroundDistanceKm` must be a positive integer not exceeding 500 km.
- Ground transit options returned must not exceed a total transfer duration of 360 minutes unless no other hubs exist.

## Confidence Score
The output `confidenceScore` is calculated dynamically:
- **Base Score (1.0):** Destination is directly connected, or ground routes are fully confirmed in real-time.
- **Deductions:**
  - Destination has no direct airport or rail station: `-0.10`
  - Ground route includes seasonal ferry transitions (shoulder season): `-0.20`
  - Local public transit schedules are estimated (not live GTFS): `-0.15`
  - Distance from nearest hub exceeds 100 km: `-0.15`

## Example Scenarios

### Scenario 1: Coastal Village with Isolated Road Access (Amalfi, Italy)
- **Input:** Destination: Amalfi, Italy (40.6331, 14.6028).
- **Process:** Checks airport list. None within 25 km (NAP is 65 km away). Checks rail. None in Amalfi (Salerno is 25 km, Napoli is 60 km).
- **Output:** Identifies Napoli (NAP) as nearest airport, Salerno (SAL) as nearest rail. Suggests ferry from Salerno (summer only) or SITA bus from Salerno/Naples. `confidenceScore` is `0.95` (summer) / `0.75` (winter, ferry seasonal block).

### Scenario 2: Remote Island with Ferry Only Access (Isle of Skye, Scotland)
- **Input:** Destination: Portree, Isle of Skye, Scotland (57.4126, -6.1952).
- **Process:** No commercial airport on Skye. Nearest airport is Inverness (INV) at 190 km. Nearest train station is Kyle of Lochalsh (KYL) at 55 km.
- **Output:** Detects missing direct air/rail. Recommends rail to Kyle of Lochalsh, then Stagecoach Bus 51/52 to Portree. Alternatively, car rental from Inverness Airport. `confidenceScore` is `0.88`.

### Scenario 3: Remote Lodge in National Park (Grand Canyon North Rim)
- **Input:** Destination: Grand Canyon North Rim Lodge (36.1983, -112.0525).
- **Process:** No close commercial airports. Flagstaff Pulliam Airport (FLG) is 210 km (driving distance is actually 420 km due to canyon topography). Las Vegas (LAS) is 430 km away.
- **Output:** System calculates driving route. Identifies extreme drive distances. Suggests renting a car at LAS or booking a Grand Canyon Shuttle service from Flagstaff. Warning issued: "Highly remote destination. Car rental strongly recommended as public transit is extremely limited." `confidenceScore` is `0.80` due to long drive requirements.

## Dependencies
- **Routing Engine (OSRM/Google Maps):** Maps exact driving paths and durations, preventing simple straight-line distance errors.
- **Ferry Schedule Registry:** Crucial for island and archipelago destinations.
- **Spatial Topology Engine:** To verify geographic features (e.g. canyons, rivers, seas) that block direct land paths.

## Success Criteria
- Correctly identifies missing connectivity in 100% of test suites.
- Proposes at least one active ground connection within 1500ms.
- Avoids routing cars across water bodies without car-ferry links.
