# UI/UX Specification Document - AI Trip Planner

This document provides the user interface and user experience design specifications for the AI Trip Planner application. It details visual layouts, components, interactive flows, responsiveness, loading states, and error handling for all 9 core views.

---

## 1. Global Design System (Design Tokens)

*   **Color Palette (Dark Mode First):**
    *   `Background`: Deep Dark Slate (`#0b0f19` / HSL `222, 40%, 7%`)
    *   `Surface`: Glassmorphic Blue-Grey (`rgba(17, 25, 40, 0.75)` with `backdrop-filter: blur(12px)`)
    *   `Border`: Translucent Silver (`rgba(255, 255, 255, 0.08)`)
    *   `Primary Accent`: Vibrant Indigo-Cyan Gradient (HSL `230, 85%, 60%` to HSL `180, 80%, 50%`)
    *   `Alert/Error`: Bright Rose (HSL `340, 80%, 60%`)
*   **Typography:**
    *   `Headings`: **Outfit** (Geometric Sans-Serif, letter-spacing: `-0.02em`)
    *   `Body & Controls`: **Inter** (Highly readable, neutral sans-serif)
*   **Animations:** Managed via **Framer Motion**:
    *   `Page transitions`: Fade & slide (`duration: 0.3s, ease: "easeInOut"`)
    *   `Micro-interactions`: Scale up by `1.02` on button hover, scale down to `0.98` on click.

---

## 2. Page Specifications

### 2.1. Landing Page

#### 2.1.1. Layout
*   A single-column landing section featuring a centered header, a bold value proposition, and an animated visual backdrop.
*   Features a persistent navigation bar at the top containing the brand logo, link triggers for features, a "Sign In" button, and a prominent "Start Free" call-to-action (CTA).

#### 2.1.2. Components
*   `Brand Navigation Header (#nav-header)`: Transparent sticky navbar.
*   `Hero Typography (#hero-header)`: Large H1 featuring gradient-masked text.
*   `Primary CTA Button (#btn-hero-cta)`: Indigo glowing button that redirects users to the onboarding flow.
*   `Interactive Dashboard Mockup (#hero-mockup)`: A rotating 3D preview card showcasing the timeline and split-screen map UI.

#### 2.1.3. User Flow
1.  User enters the landing page and views the animated dashboard mockup.
2.  Hovering over the CTA button triggers a pulse glow effect.
3.  Clicking the CTA button triggers a slide-left transition to the `/create-trip` onboarding flow.

#### 2.1.4. Responsive Design
*   **Mobile (< 768px):** Mockup image scales down to a single flat card. Main headline font-size scales to `2.2rem`. Navigation links collapse into a hamburger menu.
*   **Tablet (768px - 1024px):** Grid expands. Core text aligned left.
*   **Desktop (> 1024px):** Split grid: text hero on the left, interactive 3D mockup on the right.

#### 2.1.5. Loading States
*   Images and mockup panels implement visual gradient skeletons while assets fetch.

#### 2.1.6. Error States
*   Not applicable (static presentation page).

---

### 2.2. Login Page

#### 2.2.1. Layout
*   A centered card layout against a deep background containing a form container.

#### 2.2.2. Components
*   `Card Container (#login-card)`: Glassmorphic panel with thin borders.
*   `Form Input Fields (#login-email, #login-password)`: Custom styled text inputs with floating label animations on focus.
*   `Submit Button (#btn-login-submit)`: Gradient-colored button.
*   `Alternate Route Trigger (#link-to-register)`: Text link redirecting to the Registration screen.

#### 2.2.3. User Flow
1.  User inputs credentials.
2.  Pressing enter or clicking submit locks the form and initiates validation.
3.  Upon success, user is redirected to the `/dashboard` dashboard.

#### 2.2.4. Responsive Design
*   **Mobile (< 768px):** Full-screen form without card margins (100% viewport width and height).
*   **Tablet & Desktop:** Centered `420px` wide card with vertical padding.

#### 2.2.5. Loading States
*   During submission, the submit button locks, text changes to a spinner, and input borders run a looping color-swipe animation.

#### 2.2.6. Error States
*   Invalid logins highlight input borders in red and show an alert bar above inputs: `"Invalid username or password"`.

---

### 2.3. Register Page

#### 2.3.1. Layout
*   Similar to the Login view, featuring a centered glassmorphic form card.

#### 2.3.2. Components
*   `Form Input Fields (#reg-name, #reg-email, #reg-password)`: Input fields.
*   `Password Strength Bar (#password-strength)`: Colored meter indicating complexity.
*   `Submit Button (#btn-register-submit)`: Primary registration trigger.

#### 2.3.3. User Flow
1.  User inputs name, email, and password.
2.  Strength bar dynamically color-cycles (Red → Yellow → Green) as user types.
3.  Clicking submit validates inputs, calls registration routes, and redirects to onboarding.

#### 2.3.4. Responsive Design
*   Follows the same structures as the Login Page.

#### 2.3.5. Loading States
*   Submit button locks with a rotating spinner, and inputs are disabled to prevent double-submit.

#### 2.3.6. Error States
*   Validation errors (e.g. invalid email format, weak password) display descriptive inline labels below the invalid input.

---

### 2.4. Dashboard Page

#### 2.4.1. Layout
*   A multi-grid layout featuring a sticky sidebar on the left and a scrollable card grid on the right showing the user's saved trips.

#### 2.4.2. Components
*   `Sidebar Menu (#sidebar-menu)`: Profile settings, trip list toggle, logout button.
*   `Trip Card Grid (#saved-trips-grid)`: Lists saved trip previews.
*   `Create New Trip Button (#btn-new-trip)`: Floating action button featuring a plus icon.

#### 2.4.3. User Flow
1.  User views saved trip cards.
2.  Hovering over a trip card scales the element up by `2%` and shows a "View Itinerary" action overlay.
3.  Clicking a card opens the `/itinerary/:tripId` dashboard.
4.  Clicking the plus button opens the `/create-trip` wizard.

#### 2.4.4. Responsive Design
*   **Mobile:** Sidebar collapses to a bottom nav bar. Cards align vertically.
*   **Tablet & Desktop:** Left sidebar stays pinned, and cards render in a 2-column (tablet) or 3-column (desktop) responsive grid.

#### 2.4.5. Loading States
*   Trip cards display empty glowing grey skeleton cards with layout placeholders while loading.

#### 2.4.6. Error States
*   If network connections fail, a centered warning panel appears with a "Retry Connection" button.

---

### 2.5. Create Trip Page

#### 2.5.1. Layout
*   A linear form wizard interface. Steps: 1. Origin/Destinations, 2. Dates, 3. Budget & Preferences.

#### 2.5.2. Components
*   `Progress Tracker (#wizard-progress)`: Indicator bar displaying the current step.
*   `Input Autocomplete (#autocomplete-places)`: Dynamic search text input for cities.
*   `Chip Selector Group (#select-preference-chips)`: Dynamic styling chips for travel interests.

#### 2.5.3. User Flow
1.  User inputs starting point and adds multiple destinations.
2.  User navigates steps using the "Next" button.
3.  Confirming the final step redirects users to the `/route-analysis` view.

#### 2.5.4. Responsive Design
*   **Mobile:** Step panels expand to 100% viewport width, and form inputs stretch to full width.
*   **Tablet & Desktop:** Centered step container card with a maximum width of `640px`.

#### 2.5.5. Loading States
*   Inputs remain locked during validation.

#### 2.5.6. Error States
*   If step verification fails, red warning highlights appear around missing fields with an explanation text.

---

### 2.6. Route Analysis Page

#### 2.6.1. Layout
*   A split-screen interface: Segment selector and transit details cards render on the left, while map route vectors render on the right.

#### 2.6.2. Components
*   `Segment Tabs (#segment-selector-tabs)`: List of multi-city legs (e.g. Anakapalle → Shirdi).
*   `Transport Cards (#route-cards)`: Detailed flight/rail options with durations and pricing.
*   `Confirm Button (#btn-confirm-transit)`: Triggers full schedule compilation.

#### 2.6.3. User Flow
1.  User reviews flight/rail suggestions for Segment 1.
2.  Selecting an alternative transit choice instantly updates the segment total and changes the map polyline routing.
3.  User clicks the Confirm button to generate their daily itinerary.

#### 2.6.4. Responsive Design
*   **Mobile:** Map folds into a toggle view at the top of the screen; list of transport cards fills the viewport bottom.
*   **Tablet & Desktop:** Pinned split view: Left pane `40%` width for details, Right pane `60%` width for map.

#### 2.6.5. Loading States
*   An animated overlay displaying travel tips overlays the screen while routes calculate.

#### 2.6.6. Error States
*   If routing calculations fail (e.g., no transport found), a warning card is shown suggesting the user select a nearby major hub.

---

### 2.7. Itinerary View Page

#### 2.7.1. Layout
*   A split-pane dashboard: Left pane displays a vertical daily activity timeline, while the right pane shows the interactive map.

#### 2.7.2. Components
*   `Day Horizontal Scroller (#day-tabs)`: Quick-select day list.
*   `Timeline Container (#activity-timeline)`: Chronological chain of cards.
*   `Map Container (#mapbox-viewport)`: Vector Map showing coordinates.

#### 2.7.3. User Flow
1.  User clicks Day tabs to scroll the timeline.
2.  Hovering over an activity highlights its pin on the map.
3.  Clicking "Delete" on an activity card removes it, updates the budget, and re-draws the map routes.

#### 2.7.4. Responsive Design
*   **Mobile:** Timeline and Map render as tabbed screens. Users swipe to switch between the Map view and the Timeline view.
*   **Tablet & Desktop:** Split desktop pane layout.

#### 2.7.5. Loading States
*   Displays skeleton cards with icons for dining, sightseeing, and transport.

#### 2.7.6. Error States
*   If coordinate checks fail, the map shows a warning modal at the top: `"Cannot verify venue location coordinates."`

---

### 2.8. Budget View Page

#### 2.8.1. Layout
*   A dashboard consisting of a summary row at the top, a card-based detail grid in the middle, and interactive cost breakdown charts.

#### 2.8.2. Components
*   `Total Summary Widget (#budget-summary-panel)`: Large display of total cost, limit, and status.
*   `Interactive Cost Charts (#budget-pie-chart)`: Category-based expenditure distribution.
*   `Line Item Table (#budget-items-list)`: Editable grid to update individual costs.

#### 2.8.3. User Flow
1.  User reviews the color-coded charts.
2.  Updating a cost in the table instantly animates updates on the chart.
3.  If the total cost exceeds the preset budget, the progress bar turns red.

#### 2.8.4. Responsive Design
*   **Mobile:** Summary widget and charts stack vertically into a single-column layout.
*   **Tablet & Desktop:** Grid layout with widgets on the left and detail table on the right.

#### 2.8.5. Loading States
*   Charts display loading outlines, and table rows render skeleton gradients.

#### 2.8.6. Error States
*   If manual edits violate input formatting rules, a red input border appears with a notification badge.

---

### 2.9. Shared Trip View Page

#### 2.9.1. Layout
*   A read-only public version of the Itinerary view, containing the same split-pane timeline/map interface.

#### 2.9.2. Components
*   `Copy Link Button (#btn-copy-link)`: Icon action to share URLs.
*   `PDF Download Trigger (#btn-download-pdf)`: Triggers print stylesheets.
*   `Read-only Timeline (#read-only-timeline)`: Timeline view without delete/drag actions.

#### 2.9.3. User Flow
1.  User navigates to the shared link.
2.  User reviews destinations, transit routes, and map pins.
3.  Clicking "Download PDF" generates the formatted export file.

#### 2.9.4. Responsive Design
*   Follows the same responsive rules as the Itinerary view.

#### 2.9.5. Loading States
*   Standard skeleton timeline placeholders during initial data retrieval.

#### 2.9.6. Error States
*   If the share token is invalid or inactive, a full-screen card displays: `"This shared trip link has expired or is invalid."`
