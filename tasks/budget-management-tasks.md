# Budget Planning & Cost Optimization - Task Implementation Documents

This document defines the detailed technical implementation tasks for **Epic 6: Budget Planning & Cost Optimization**. These tasks cover expense calculations, currency conversions, real-time alert boundaries, and cost optimization recommendation engines.

---

## Task List

### TSK-BUDG-01: Budget Transit Cost Aggregator
* **Task ID:** `TSK-BUDG-01`
* **Task Name:** Budget Transit Cost Aggregator
* **Epic:** Epic 6: Budget Planning & Cost Optimization
* **Related User Story:** `BUDG-001`
* **Priority:** High
* **Purpose:** Dynamically aggregates the confirmed flight and train transportation costs across all multi-city travel segments of a trip to provide a baseline transit expense summary.
* **Inputs:** 
  * `tripId` (MongoDB ObjectId)
  * `TripSegments` collection records (filtered by `tripId`) containing `estimatedCost`
  * `TransportOptions` collection records containing `cost` for selected options
* **Process Steps:**
  1. Create a MongoDB aggregation pipeline matching the active `tripId`.
  2. Join `TripSegments` with selected `TransportOptions` (where `isRecommended: true` or custom chosen option is selected).
  3. Sum up the transit costs. If any segment has an unresolved or pending transport selection, flag a boolean warning parameter `transitCostPending: true`.
  4. Build API logic within `POST /api/v1/budget/calculate` to compute and return this subtotal under `transportCost`.
* **Outputs:** 
  * JSON object: `{ transportCost: number, transitCostPending: boolean }`
* **Validation Rules:**
  * If a segment has a missing or pending cost estimate, default the addition value to `0` but set `transitCostPending: true` to trigger warning icons.
  * Must run instantly on the server side when requested.
* **Dependencies:** `TSK-ROUTE-03` (Optimizer), `TSK-CONN-01` (Last-Mile)
* **Acceptance Criteria:**
  * When multiple segments have confirmed routes, the summed total transit cost matches the exact values in the database.
  * If any segment lacks a cost estimate, the subtotal is returned alongside a warning indicating a pending calculation.
* **Estimated Complexity:** Small
* **Estimated Effort:** 1 Day

---

### TSK-BUDG-02: Daily Activity Cost Aggregator
* **Task ID:** `TSK-BUDG-02`
* **Task Name:** Daily Activity Cost Aggregator
* **Epic:** Epic 6: Budget Planning & Cost Optimization
* **Related User Story:** `BUDG-002`
* **Priority:** High
* **Purpose:** Computes the total entry fees, sightseeing ticket prices, and dining costs generated during day-by-day itineraries.
* **Inputs:** 
  * `tripId` (MongoDB ObjectId)
  * `Itineraries` collection record (referenced by `tripId`)
  * `Activities` collection records (referenced by `itineraryId`) containing `estimatedCost`
* **Process Steps:**
  1. Retrieve the `itineraryId` linked to the active `tripId`.
  2. Write an aggregation pipeline to fetch all `Activities` belonging to `itineraryId`.
  3. Filter by category, then sum up the `estimatedCost` fields of all sightseeing and dining cards.
  4. Incorporate this aggregated sum as `activitySubtotal` (or map to `miscCost`/`foodCost` as appropriate) in the response of `POST /api/v1/budget/calculate`.
* **Outputs:** 
  * JSON object: `{ activitySubtotal: number }`
* **Validation Rules:**
  * If an activity is free (cost = `0`), it must be added as `0` without throwing mathematical or parsing errors.
  * Empty or null cost fields must be treated as `0` during calculation.
* **Dependencies:** `TSK-ITIN-01` (AI Itinerary Generator), `TSK-BUDG-01` (Transit Aggregator)
* **Acceptance Criteria:**
  * Activity subtotal calculates correctly and displays in the dashboard's `#budget-summary` panel.
  * Modifying or deleting an activity in the timeline instantly triggers a budget recalculation.
* **Estimated Complexity:** Small
* **Estimated Effort:** 1 Day

---

### TSK-BUDG-03: Daily Incidentals Allowance System
* **Task ID:** `TSK-BUDG-03`
* **Task Name:** Daily Incidentals Allowance System
* **Epic:** Epic 6: Budget Planning & Cost Optimization
* **Related User Story:** `BUDG-003`
* **Priority:** Medium
* **Purpose:** Appends daily food and local transit allowances based on the user's selected trip budget tier (Budget, Moderate, Luxury) to cover un-itemized incidental expenses.
* **Inputs:** 
  * `tripId` (MongoDB ObjectId)
  * `budgetTier` ('Budget' | 'Moderate' | 'Luxury')
  * Trip duration in days (derived from `startDate` and `endDate`)
* **Process Steps:**
  1. Calculate the trip duration in days: `(endDate - startDate) / (1000 * 60 * 60 * 24)`.
  2. Implement fixed allowance coefficients per budget tier:
     * **Budget:** Food = $15/day, Local Transit = $5/day (Total $20/day)
     * **Moderate:** Food = $45/day, Local Transit = $15/day (Total $60/day)
     * **Luxury:** Food = $100/day, Local Transit = $40/day (Total $140/day)
  3. Multiply the daily rate by the trip duration to calculate allowances.
  4. Aggregate these calculations into the `/api/v1/budget/calculate` controller, returning them as `foodCost` and `miscCost` allowances.
* **Outputs:** 
  * JSON properties: `{ foodAllowance: number, localTransitAllowance: number }`
* **Validation Rules:**
  * Validation checks must ensure `budgetTier` matches one of the three enumerated settings.
  * Trip duration must be at least 1 day. If duration resolves to 0 (same day), default to a 1-day allowance.
* **Dependencies:** `TSK-BUDG-02` (Activity Aggregator)
* **Acceptance Criteria:**
  * Changing the budget tier of a trip automatically updates the daily allowance totals in the budget summaries.
  * Total allowance matches the duration multiplied by the corresponding tier coefficient.
* **Estimated Complexity:** Small
* **Estimated Effort:** 1 Day

---

### TSK-BUDG-04: Live Currency Converter & Exchange Rates Caching
* **Task ID:** `TSK-BUDG-04`
* **Task Name:** Live Currency Converter & Exchange Rates Caching
* **Epic:** Epic 6: Budget Planning & Cost Optimization
* **Related User Story:** `BUDG-004`
* **Priority:** High
* **Purpose:** Fetch, cache, and apply currency exchange rates to display trip costs in the user's preferred home currency.
* **Inputs:** 
  * Target Currency Code (e.g. `USD`, `INR`, `EUR` selected from `#select-currency`)
  * Original costs and currency codes stored on segments and activities
  * External currency rate API (e.g. ExchangeRatesAPI, openexchangerates)
* **Process Steps:**
  1. Create the `ExchangeRates` Mongoose model containing source currency, target currency, conversion rate, and an updated timestamp.
  2. Implement a background Cron worker running daily to fetch the latest conversion rates relative to a base currency (USD) and store them in the `ExchangeRates` collection.
  3. Write a helper function in `/api/v1/budget/calculate` to convert costs from segment/activity currencies to the target home currency.
  4. If the external rate API fails during the daily update, log the error and fall back to the cached rates in MongoDB.
  5. Add a boolean field `ratesCached: true` to the response if the exchange rates are served from the cache rather than a live fetch.
* **Outputs:** 
  * Converted pricing outputs and rate status flags in response metadata.
* **Validation Rules:**
  * Currency codes must follow the ISO-4217 standard.
  * Conversion rates must be positive decimal numbers.
* **Dependencies:** `TSK-BUDG-01` (Transit Aggregator), `TSK-BUDG-02` (Activity Aggregator)
* **Acceptance Criteria:**
  * Toggling the home currency dropdown instantly converts all UI currency values and symbols.
  * The system serves conversion results using cached data with a warning badge if the external rates API is unavailable.
* **Estimated Complexity:** Medium
* **Estimated Effort:** 2 Days

---

### TSK-BUDG-05: Budget Limit Exceeded Alert System
* **Task ID:** `TSK-BUDG-05`
* **Task Name:** Budget Limit Exceeded Alert System
* **Epic:** Epic 6: Budget Planning & Cost Optimization
* **Related User Story:** `BUDG-005`
* **Priority:** High
* **Purpose:** Monitors calculated trip costs against maximum spending thresholds and renders warning banners if the budget boundaries are breached.
* **Inputs:** 
  * User-specified budget limit or default budget tier thresholds:
    * **Budget:** $500 max limit
    * **Moderate:** $1500 max limit
    * **Luxury:** Unlimited limit
  * Aggregated trip total cost (`totalCost` from `Trips` table)
* **Process Steps:**
  1. Add a threshold evaluation step inside the dashboard controller or client-side budget component.
  2. Compare the calculated total trip cost against the limit corresponding to the trip's `budgetTier`.
  3. If total cost is greater than the limit, set active alert flag `isOverBudget: true` and identify the segment or category contributing the highest cost.
  4. Render the `#budget-alert` warning banner in red on the dashboard UI and style over-budget segments.
* **Outputs:** 
  * Warning alert state triggering visual renders and text highlights on `#budget-alert`.
* **Validation Rules:**
  * The alert must dismiss immediately if total costs drop below the target threshold (e.g. if the traveler deletes an expensive activity).
* **Dependencies:** `TSK-BUDG-01` (Transit Aggregator), `TSK-BUDG-02` (Activity Aggregator)
* **Acceptance Criteria:**
  * The `#budget-alert` warning banner appears dynamically when total costs exceed the selected tier's budget threshold.
  * The alert vanishes as soon as adjustments bring expenses back within the acceptable budget limit.
* **Estimated Complexity:** Small
* **Estimated Effort:** 1 Day

---

### TSK-BUDG-06: Automated Cost Optimization Suggestion Engine
* **Task ID:** `TSK-BUDG-06`
* **Task Name:** Automated Cost Optimization Suggestion Engine
* **Epic:** Epic 6: Budget Planning & Cost Optimization
* **Related User Story:** `BUDG-006`
* **Priority:** Medium
* **Purpose:** Analyzes alternative travel routes and suggests cost-saving adjustments to bring trips back under budget limits.
* **Inputs:** 
  * Trip segments and selected transport options
  * Unselected options stored in `TransportOptions` collection (alternative options)
  * Over-budget status flag
* **Process Steps:**
  1. Create a server-side endpoint `POST /api/v1/budget/optimize` (or process inside the calculate call).
  2. Query `TransportOptions` for all segments where the selected option is NOT the cheapest option.
  3. Compare the costs of the current selection versus the cheaper alternative (e.g. swap flight to train).
  4. Compile a list of cost optimization objects indicating the segment, the suggested alternative, and the net savings: `savings = currentCost - alternativeCost`.
  5. Return this array to populate the UI `#budget-optimization-panel`.
  6. Implement an "Apply Suggestion" button that updates the selected transport option for the segment, triggers a recalculation, and updates the timeline.
* **Outputs:** 
  * Array of suggestion recommendations: `[ { segmentId, currentOption, suggestedOption, savings } ]`
* **Validation Rules:**
  * Suggest swaps only if alternative transport options are available and have a verified lower cost.
* **Dependencies:** `TSK-BUDG-05` (Alert System), `TSK-ROUTE-03` (Optimizer)
* **Acceptance Criteria:**
  * When a trip exceeds its budget, the `#budget-optimization-panel` displays clear and actionable transit swaps.
  * Clicking "Apply Suggestion" successfully modifies the segment transit details, updates the total budget, and redraws the routes on the map.
* **Estimated Complexity:** Large
* **Estimated Effort:** 3 Days

---

### TSK-BUDG-07: Low-Cost Activity Filter
* **Task ID:** `TSK-BUDG-07`
* **Task Name:** Low-Cost Activity Filter
* **Epic:** Epic 6: Budget Planning & Cost Optimization
* **Related User Story:** `BUDG-007`
* **Priority:** Medium
* **Purpose:** Filters the day-by-day activities in the timeline view to display only free or low-cost sightseeing venues.
* **Inputs:** 
  * Timeline activity list
  * "Free Activities Only" toggle state (boolean)
* **Process Steps:**
  1. Add a toggle switch in the `#timeline-pane` controller labeled "Free Activities Only".
  2. Implement client-side filtering logic: when the toggle is active, hide all activity cards where `estimatedCost` is greater than $10 (or its equivalent in the converted currency).
  3. Ensure that hotel and transit cards are excluded from this filter so that the basic journey structure remains intact.
  4. Redraw the timeline list based on the filtered state.
* **Outputs:** 
  * Filtered activity list displayed in the `#activity-timeline` viewport.
* **Validation Rules:**
  * Threshold limit is hardcoded to $10.
  * Toggling the switch must not mutate the original activities array stored in the application state.
* **Dependencies:** `TSK-BUDG-02` (Activity Aggregator)
* **Acceptance Criteria:**
  * Activating the toggle hides all activities costing > $10.
  * Deactivating the toggle restores all hidden activities instantly.
* **Estimated Complexity:** Small
* **Estimated Effort:** 1 Day

---

### TSK-BUDG-08: Manual Custom Expense Entry Manager
* **Task ID:** `TSK-BUDG-08`
* **Task Name:** Manual Custom Expense Entry Manager
* **Epic:** Epic 6: Budget Planning & Cost Optimization
* **Related User Story:** `BUDG-008`
* **Priority:** Medium
* **Purpose:** Allows users to manually add custom expense line items (e.g. souvenirs, visas, emergency purchases) that are not part of the auto-generated itinerary.
* **Inputs:** 
  * `tripId` (MongoDB ObjectId)
  * Expense parameters: `title`, `cost`, `category` (Souvenirs, Visas, Shopping, Tips, Emergency, Miscellaneous)
* **Process Steps:**
  1. Define the `CustomExpenses` schema in MongoDB including `tripId`, `title`, `cost`, `category`, and `date`.
  2. Implement endpoints `POST /api/v1/trips/:tripId/expenses` to save new custom items, and `DELETE /api/v1/trips/:tripId/expenses/:expenseId` to remove them.
  3. Update the budget calculation logic in `POST /api/v1/budget/calculate` to query the `CustomExpenses` collection and add the sum to `miscCost`.
  4. Design the UI modal `#add-expense-modal` to collect custom inputs, perform validation, and trigger state reloads.
* **Outputs:** 
  * Persisted custom expense record and updated total budget in the DB.
* **Validation Rules:**
  * Title must be a non-empty string.
  * Cost must be a positive decimal number greater than 0.
  * Category must match one of the specified allowed categories.
* **Dependencies:** `TSK-BUDG-02` (Activity Aggregator)
* **Acceptance Criteria:**
  * Custom expenses can be added via the modal and appear instantly in the line items list.
  * Added custom costs are successfully reflected in the total trip cost calculations.
* **Estimated Complexity:** Medium
* **Estimated Effort:** 2 Days

---

### TSK-BUDG-09: Client-Side Budget CSV Export Engine
* **Task ID:** `TSK-BUDG-09`
* **Task Name:** Client-Side Budget CSV Export Engine
* **Epic:** Epic 6: Budget Planning & Cost Optimization
* **Related User Story:** `BUDG-009`
* **Priority:** Low
* **Purpose:** Generates and downloads a CSV spreadsheet breakdown containing all transit segments, daily activities, and manually added custom expenses.
* **Inputs:** 
  * Compiled budget items list (including travel dates, names, categories, costs, and currency)
* **Process Steps:**
  1. Implement a button click handler on `#btn-export-csv`.
  2. Parse the aggregated budget details into rows of comma-separated values.
  3. Define headers: `Date`, `Segment/Day`, `Category`, `Item Name`, `Cost`, `Currency`.
  4. Escape special characters like double quotes or commas in names to ensure correct parsing.
  5. Create a blob containing the CSV string and trigger a browser download action for a file named `trip-[tripId]-budget.csv`.
* **Outputs:** 
  * Downloadable spreadsheet file: `trip-[tripId]-budget.csv`
* **Validation Rules:**
  * CSV formatting must strictly follow the RFC-4180 specification.
  * Must run entirely on the client side to avoid unnecessary server load.
* **Dependencies:** `TSK-BUDG-01`, `TSK-BUDG-02`, `TSK-BUDG-08`
* **Acceptance Criteria:**
  * Clicking the export button downloads the budget CSV file.
  * Opening the downloaded file in Microsoft Excel or Google Sheets displays rows mapped to the correct columns, with accurate sums matching the UI.
* **Estimated Complexity:** Small
* **Estimated Effort:** 1 Day

---

### TSK-BUDG-10: Category-Wise Budget Breakdown Chart
* **Task ID:** `TSK-BUDG-10`
* **Task Name:** Category-Wise Budget Breakdown Chart
* **Epic:** Epic 6: Budget Planning & Cost Optimization
* **Related User Story:** `BUDG-010`
* **Priority:** High
* **Purpose:** Builds a category-wise visual pie chart or stacked progress bar to display spending ratios across different trip sectors.
* **Inputs:** 
  * Aggregated category subtotals (Transit, Hotel, Food, Activities, Custom)
* **Process Steps:**
  1. Extract categorized costs from the calculated budget data array.
  2. Compute percentage allocations relative to the total cost: `percentage = (categoryCost / totalCost) * 100`.
  3. Integrate a lightweight charting library (e.g. Chart.js, Recharts) to draw the `#budget-breakdown-chart`.
  4. Apply smooth transition and redraw animations using Framer Motion when budget values update.
  5. Hide segments or slices of the chart where the cost category total is equal to `0`.
* **Outputs:** 
  * Responsive, interactive SVG/Canvas budget breakdown chart rendering.
* **Validation Rules:**
  * Total proportions must equal 100% of the calculated budget cost.
  * Chart must render correctly on both desktop and mobile layout profiles.
* **Dependencies:** `TSK-BUDG-01`, `TSK-BUDG-02`, `TSK-BUDG-03`, `TSK-BUDG-08`
* **Acceptance Criteria:**
  * The visual chart displays categorized cost distributions.
  * Updates or additions to expenses cause the chart to transition smoothly to show the new proportions.
* **Estimated Complexity:** Medium
* **Estimated Effort:** 2 Days
