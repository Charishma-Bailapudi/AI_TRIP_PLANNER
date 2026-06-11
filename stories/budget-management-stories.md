# Epic 6: Budget Planning & Cost Optimization - User Stories

---

Story ID: BUDG-001
Epic: Epic 6: Budget Planning & Cost Optimization
Priority: High

As a Budget-conscious Traveler,
I want the system to aggregate and display the total flight and train transit costs across all segments of my trip,
So that I can see the baseline transportation cost of my travel plan.

Acceptance Criteria:
* Given multiple segments have confirmed transit routes with cost estimates
* When the dashboard loads or updates
* Then the total transit cost is computed and displayed in the budget summary panel.
* Given a transit segment has a missing or pending cost estimate
* When the aggregation runs
* Then the system displays a warning icon with the message "Transit cost estimate pending" next to the subtotal.

Business Rules:
- Missing cost values default to zero during aggregation but flag the warning.
- Summation updates instantly if the user selects alternative transit routes on the Route Analysis Screen.
Dependencies: ROUTE-005, CONN-004
API References: `/api/calculate-budget` (POST)
Database References: `Trips` table, `Segments` table (estimatedCost)
UI References: `#dashboard-view`, `#budget-summary`
Estimate: Small

---

Story ID: BUDG-002
Epic: Epic 6: Budget Planning & Cost Optimization
Priority: High

As a Traveler,
I want the system to aggregate estimated activity entry ticket fees and dining costs into my total trip budget,
So that I can see my comprehensive daily spending requirements.

Acceptance Criteria:
* Given a daily itinerary has been generated with multiple sightseeing and dining cards containing cost estimates
* When the budget panel recalculates
* Then the system sums all activity costs and adds them as a separate "Activity Subtotal" in the budget summary.
* Given an activity is free (cost = 0)
* When the budget calculates totals
* Then it is included in the sum as zero without errors.

Business Rules:
- Activities with empty cost fields are treated as free.
- Calculations must support dynamic updates when cards are regenerated or removed.
Dependencies: ITIN-001, BUDG-001
API References: `/api/calculate-budget` (POST)
Database References: `ItineraryItems` table (estimatedCost)
UI References: `#dashboard-view`, `#budget-summary`
Estimate: Small

---

Story ID: BUDG-003
Epic: Epic 6: Budget Planning & Cost Optimization
Priority: Medium

As a Detail-oriented Traveler,
I want the system to include daily food and local taxi/metro allowances based on my budget tier,
So that I have a realistic budget that covers daily incidental expenses.

Acceptance Criteria:
* Given a trip is configured with a specific budget tier (Budget, Moderate, or Luxury)
* When the budget calculation runs
* Then the system appends a daily food and local transit allowance multiplier for each day of the trip duration.
* Given the user changes the budget tier in settings (e.g. from Budget to Moderate)
* When the budget updates
* Then the daily allowance multiplier shifts to match the new tier, updating the overall total.

Business Rules:
- Daily allowance values are fixed coefficients:
  - Budget: Food = $15/day, Local Transit = $5/day.
  - Moderate: Food = $45/day, Local Transit = $15/day.
  - Luxury: Food = $100/day, Local Transit = $40/day.
Dependencies: BUDG-002
API References: `/api/calculate-budget` (POST)
Database References: `BudgetAllowances` table, `Trips` table
UI References: `#dashboard-view`, `#budget-summary`, `#select-budget`
Estimate: Small

---

Story ID: BUDG-004
Epic: Epic 6: Budget Planning & Cost Optimization
Priority: High

As an International Traveler,
I want to view all costs converted to my preferred base currency using live exchange rates,
So that I can easily understand my expenses without doing manual conversions.

Acceptance Criteria:
* Given a trip contains itineraries and transit in multiple currencies (e.g., INR, EUR, USD)
* When the user selects a home currency (e.g., "USD") from the `#select-currency` dropdown
* Then all card prices and budget subtotals convert to USD using the latest exchange rate.
* Given the exchange rate API is down
* When the user performs a conversion
* Then the system uses cached exchange rates and displays a badge: "Exchange rates cached".

Business Rules:
- Exchange rates must be fetched daily from an external exchange service and cached in the database.
- Currency symbols must change dynamically based on the selected code (e.g. $, €, ₹).
Dependencies: BUDG-001, BUDG-002
API References: `/api/calculate-budget` (POST), Exchange Rates API
Database References: `ExchangeRates` table, `Trips` table (currency)
UI References: `#dashboard-view`, `#select-currency`
Estimate: Medium

---

Story ID: BUDG-005
Epic: Epic 6: Budget Planning & Cost Optimization
Priority: High

As a Budget-conscious Traveler,
I want the system to display a warning alert when my compiled trip costs exceed my target budget limits,
So that I can make adjustments to stay within my financial limits.

Acceptance Criteria:
* Given a user has set a budget tier limit (e.g., Budget = $500 max)
* When the calculated total trip cost exceeds this limit
* Then the budget panel renders a red warning banner `#budget-alert` stating "Budget Exceeded" and highlights the over-budget segments.
* Given the total cost is updated (e.g. user removes an expensive activity) and drops below the limit
* When the budget recalculates
* Then the `#budget-alert` banner is dismissed.

Business Rules:
- Budget Tier Thresholds: Budget = $500, Moderate = $1500, Luxury = Unlimited (or user-defined).
- Warning triggers immediately when total cost > budget tier limit.
Dependencies: BUDG-001, BUDG-002
API References: None (Client-side validation)
Database References: `Trips` table (budgetTier)
UI References: `#dashboard-view`, `#budget-alert`
Estimate: Small

---

Story ID: BUDG-006
Epic: Epic 6: Budget Planning & Cost Optimization
Priority: Medium

As an Economizing Traveler,
I want the system to suggest cost optimization recommendations (e.g., swapping flights for trains) when my trip is over budget,
So that I can bring my travel costs under my target budget.

Acceptance Criteria:
* Given a trip's calculated cost exceeds the selected budget tier limit
* When the user views the budget panel
* Then the system displays a `#budget-optimization-panel` listing specific swaps (e.g., "Switching Anakapalle -> Shirdi from Flight to Train saves $120").
* Given the user clicks "Apply Suggestion" on a recommendation
* When the action completes
* Then the system updates the segment transit selection, recalculates the budget, and redraws the timeline.

Business Rules:
- Optimization suggestions are only shown if alternative transit options in the segment payload have a lower cost than the current selection.
Dependencies: BUDG-005, ROUTE-002
API References: `/api/optimize-budget` (POST)
Database References: `Trips` table (stores segments and alternatives JSON)
UI References: `#dashboard-view`, `#budget-optimization-panel`
Estimate: Large

---

Story ID: BUDG-007
Epic: Epic 6: Budget Planning & Cost Optimization
Priority: Medium

As a Budget Traveler,
I want to filter recommended activities by "Free" or "Low-Cost" tiers,
So that I can discover sightseeings that do not increase my expenses.

Acceptance Criteria:
* Given an active itinerary timeline
* When the user toggles the "Free Activities Only" switch in the timeline controls
* Then the timeline pane hides all sightseeing items with an estimated entry fee higher than $10.
* When the toggle is deactivated
* Then the timeline restores all sightseeing activities.

Business Rules:
- Free/Low-cost threshold is hardcoded to $10 (or equivalent currency conversion).
- Transit and hotel cards are unaffected by this filter.
Dependencies: BUDG-002
API References: None (Client-side filter)
Database References: None
UI References: `#timeline-pane`
Estimate: Small

---

Story ID: BUDG-008
Epic: Epic 6: Budget Planning & Cost Optimization
Priority: Medium

As a Thorough Planner,
I want to manually add custom expense items and categories (e.g., souvenirs, visa fees) to my trip budget,
So that I can track all miscellaneous costs not covered by the auto-generated itinerary.

Acceptance Criteria:
* Given a user is reviewing the budget dashboard
* When the user clicks "Add Custom Expense"
* Then a modal `#add-expense-modal` appears prompting for title, cost, category, and segment.
* Given the user enters valid expense information and clicks save
* Then the item is added to the budget list, and the total trip cost recalculates.

Business Rules:
- Custom expenses must be persistent and linked directly to the trip ID.
- Categories are validated against: Souvenirs, Visas, Shopping, Tips, Emergency, Miscellaneous.
Dependencies: BUDG-002
API References: `/api/calculate-budget` (POST)
Database References: `CustomExpenses` table
UI References: `#dashboard-view`, `#add-expense-modal`
Estimate: Medium

---

Story ID: BUDG-009
Epic: Epic 6: Budget Planning & Cost Optimization
Priority: Low

As an Analytical Traveler,
I want to export my trip budget breakdown as a CSV spreadsheet,
So that I can perform further expense analysis in external spreadsheet software.

Acceptance Criteria:
* Given a user has a generated trip with calculated budget segments
* When the user clicks the "Export Budget CSV" button `#btn-export-csv`
* Then the browser initiates a download of a CSV file named `trip-[tripId]-budget.csv`.
* Given the CSV is opened in spreadsheet software
* Then it contains column headers: Date, Segment, Category, Item Name, Cost, and Currency, with correct data rows.

Business Rules:
- Export format must follow RFC-4180 CSV specifications.
- Must include both auto-generated itinerary items and manually added custom expenses.
Dependencies: BUDG-001, BUDG-002, BUDG-008
API References: None (Client-side generation)
Database References: None
UI References: `#dashboard-view`, `#btn-export-csv`
Estimate: Small

---

Story ID: BUDG-010
Epic: Epic 6: Budget Planning & Cost Optimization
Priority: High

As a Visual Planner,
I want to see a category-wise visual chart breakdown of my trip budget expenses,
So that I can quickly identify which parts of my trip consume the most funds.

Acceptance Criteria:
* Given the budget summary tab is active
* When the budget panel renders
* Then the system displays a visual pie chart or stacked progress bar `#budget-breakdown-chart` illustrating percentage allocations (Transit, Hotel, Food, Activities, Custom).
* Given the user changes a transit option or adds a manual expense
* When the budget updates
* Then the `#budget-breakdown-chart` transitions and redraws to reflect the updated proportions.

Business Rules:
- Breakdown categories must sum exactly to 100% of the total estimated cost.
- Chart rendering must handle cases where a category has a zero balance by hiding the slice/bar segment.
Dependencies: BUDG-001, BUDG-002, BUDG-003, BUDG-008
API References: None (Client-side rendering)
Database References: None
UI References: `#dashboard-view`, `#budget-breakdown-chart`
Estimate: Medium
