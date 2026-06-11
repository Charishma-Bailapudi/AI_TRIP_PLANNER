# Recommendation Explanation Skill

## Purpose
The **Recommendation Explanation Skill** translates the quantitative routing and cost decisions made by other agents into clear, natural-language rationales for the user. It highlights the explicit trade-offs (such as time saved versus financial expense or comfort versus transfers) and warns travelers of potential discomforts (like tight layovers or overnight travel), tailoring the explanation to the user's specific traveler persona (e.g., Business, Family, Solo, Pilgrimage).

---

## Responsibilities
*   **Trade-Off Analysis:** Perform side-by-side comparisons of the recommended route against alternatives across cost, speed, and transfer frequency.
*   **User Rationale Generation:** Draft user-friendly paragraphs justifying *why* a particular transit sequence was chosen over others.
*   **Persona Customization:** Adapt language and emphasis based on traveler styles (e.g., highlighting productivity for business travelers or low physical strain for families and pilgrims).
*   **Warning & Fatigue Flagging:** Inspect travel steps to detect and label operational risks, such as overnight transits or lengthy road journeys.
*   **Factual Consistency Auditing:** Guarantee that all text-based assertions precisely align with cost, duration, and transit mode numbers.

---

## Inputs (JSON schema/example)

### Input JSON Schema
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "RecommendationExplanationInput",
  "type": "object",
  "required": [
    "segmentId",
    "recommendedRoute",
    "alternativeRoutes",
    "userPreferences",
    "budgetTier",
    "travelerPersona"
  ],
  "properties": {
    "segmentId": { "type": "string" },
    "recommendedRoute": {
      "type": "object",
      "required": ["routeId", "steps", "cost", "durationMinutes"],
      "properties": {
        "routeId": { "type": "string" },
        "steps": {
          "type": "array",
          "items": { "type": "string" }
        },
        "cost": { "type": "number" },
        "durationMinutes": { "type": "integer" }
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
          "label": { "type": "string" }
        }
      }
    },
    "userPreferences": {
      "type": "object",
      "required": ["prioritizeSpeed", "prioritizeComfort", "avoidLayovers"],
      "properties": {
        "prioritizeSpeed": { "type": "boolean" },
        "prioritizeComfort": { "type": "boolean" },
        "avoidLayovers": { "type": "boolean" }
      }
    },
    "budgetTier": {
      "type": "string",
      "enum": ["Budget", "Moderate", "Luxury"]
    },
    "travelerPersona": {
      "type": "string",
      "enum": ["Solo", "Family", "Pilgrimage", "Business"]
    }
  }
}
```

### Input JSON Example
```json
{
  "segmentId": "sg_exp_003",
  "recommendedRoute": {
    "routeId": "rt_rec_flight",
    "steps": [
      "Taxi from Anakapalle to Visakhapatnam Airport (VTZ) [35 km]",
      "Flight from VTZ to Shirdi (SAG) via Hyderabad",
      "Taxi from SAG to Shirdi Temple Area [14 km]"
    ],
    "cost": 135.00,
    "durationMinutes": 360
  },
  "alternativeRoutes": [
    {
      "routeId": "rt_alt_train",
      "steps": [
        "Train from Anakapalle (AKP) to Kopargaon Station (KPG)",
        "Local Taxi from Kopargaon Station to Shirdi [16 km]"
      ],
      "cost": 33.00,
      "durationMinutes": 1421,
      "label": "Cheapest"
    }
  ],
  "userPreferences": {
    "prioritizeSpeed": true,
    "prioritizeComfort": true,
    "avoidLayovers": false
  },
  "budgetTier": "Moderate",
  "travelerPersona": "Family"
}
```

---

## Outputs (JSON schema/example with confidence score)

### Output JSON Schema
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "RecommendationExplanationOutput",
  "type": "object",
  "required": [
    "segmentId",
    "explanationText",
    "keyTradeoffs",
    "warningTags",
    "personaFocusHighlight",
    "confidenceScore"
  ],
  "properties": {
    "segmentId": { "type": "string" },
    "explanationText": {
      "type": "string",
      "description": "Natural-language explanation of the recommendation and trade-offs"
    },
    "keyTradeoffs": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["criteria", "recommendedValue", "alternativeValue", "difference"],
        "properties": {
          "criteria": { "type": "string", "enum": ["Cost", "Duration", "Transfers"] },
          "recommendedValue": { "type": "string" },
          "alternativeValue": { "type": "string" },
          "difference": { "type": "string" }
        }
      }
    },
    "warningTags": {
      "type": "array",
      "items": { "type": "string" }
    },
    "personaFocusHighlight": {
      "type": "string",
      "description": "Specific sentence explaining how the route matches the traveler persona"
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
  "segmentId": "sg_exp_003",
  "explanationText": "We recommend the air travel route because it saves 17 hours and 41 minutes of travel time compared to the train, allowing you to reach Shirdi in 6 hours. While this option costs $102 more per person, it remains under the Moderate budget tier ceiling ($150) and aligns with your preference for speed and comfort.",
  "keyTradeoffs": [
    {
      "criteria": "Cost",
      "recommendedValue": "$135.00",
      "alternativeValue": "$33.00",
      "difference": "+$102.00 (More expensive)"
    },
    {
      "criteria": "Duration",
      "recommendedValue": "6h 00m",
      "alternativeValue": "23h 41m",
      "difference": "-17h 41m (Faster)"
    },
    {
      "criteria": "Transfers",
      "recommendedValue": "2 transfers",
      "alternativeValue": "1 transfer",
      "difference": "+1 transfer"
    }
  ],
  "warningTags": [
    "Multi-leg Transit",
    "Flight Layover"
  ],
  "personaFocusHighlight": "For a Family traveler, this direct air path minimizes physical fatigue and overnight rail sleep disruption, ensuring a smoother journey.",
  "confidenceScore": 0.98
}
```

---

## Decision Rules

### 1. Rationale Composition Mapping
The agent applies specific templates based on the comparison of the recommended route ($R$) and alternative route ($A$):

| Condition | Explanation Angle | Focus Key Phrases |
| :--- | :--- | :--- |
| **$R_{\text{cost}} > A_{\text{cost}}$ & $R_{\text{time}} < A_{\text{time}}$** | Time/Cost Trade-off | "Saves [X] hours of travel time at an additional cost of [Y]." |
| **$R_{\text{cost}} < A_{\text{cost}}$ & $R_{\text{time}} > A_{\text{time}}$** | Economic Savings | "Highly economical option, saving [Y] while extending transit by [X]." |
| **$R_{\text{transfers}} > A_{\text{transfers}}$** | Transfer Convenience | "Requires [N] layovers/transfers, but was chosen to prioritize [Speed/Cost]." |

### 2. Persona Focus Rules
*   **Rule 2.1 (Business):** Emphasize total time saved, absence of layovers, and airport lounge/working viability.
*   **Rule 2.2 (Family):** Prioritize physical comfort, warning about early-morning departures (before 06:00 AM) or long layovers (> 3 hours).
*   **Rule 2.3 (Pilgrimage):** Highlight proximity to final shrine, total transfers, and steps that bypass complex public stations.
*   **Rule 2.4 (Solo):** Focus on absolute cost savings, opportunities for local transport, and adventure elements.

### 3. Warning Tag Indicators
The agent scans route steps and triggers the following warning flags:
*   *If* any flight layover is $< 90\text{ minutes}$ $\rightarrow$ append **"Tight Connection Window"**.
*   *If* any road taxi distance is $> 120\text{ km}$ $\rightarrow$ append **"Long Road Transfer"**.
*   *If* any transit segment operates between $11:00\text{ PM}$ and $05:00\text{ AM}$ $\rightarrow$ append **"Overnight Travel"**.
*   *If* the route requires $> 3\text{ separate transfers}$ $\rightarrow$ append **"High Transfer Overhead"**.

---

## Reasoning Strategy
The agent generates explainable recommendations using a **Semantic Synthesis Engine**:

1.  **Metric Difference Calculations:** Subtract costs and durations of $R$ and $A$ to obtain absolute delta values ($\Delta C$, $\Delta D$).
2.  **Trade-Off Grid Generation:** Format the comparisons into the structured `keyTradeoffs` JSON array.
3.  **Persona Tuning:** Select the emphasis filter. For example, if the user is a `Family`, look up the fatigue impact index.
4.  **Operational Risk Scan:** Apply Warning Tag rules.
5.  **Language Formulation:** Synthesize text components:
    *   *Premise:* "We recommend [Route name] because..."
    *   *Trade-off argument:* "...it saves $\Delta D$ at an additional cost of $\Delta C$."
    *   *Persona justification:* "For a [Persona], this minimizes [fatigue/cost/time]..."
    *   *Conclusion:* "...making it the most appropriate choice."

---

## Data Sources
*   **Route Optimization Outputs:** Directly parsed parameters of the chosen recommended and alternative routes.
*   **Traveler Profiling Context:** Dynamic parameters indicating the user's travel style and persona settings.
*   **Fatigue Index Database:** Lookups correlating transit duration, number of layovers, and travel times to a physical fatigue coefficient.

---

## Error Handling
*   **No Alternatives Available:** If no alternative routes exist (e.g., only one local bus route connects to a remote site), the agent defaults to a template describing absolute benefits, suppressing the trade-offs section.
*   **JSON Data Mismatch:** If the cost or duration figures in `recommendedRoute` differ from the parent segment's DB schema record, the agent triggers an internal schema error and halts generation to prevent user misinformation.

---

## Validation Rules
*   **Factual Agreement:** All cost differences ($\Delta C$) and duration differences ($\Delta D$) in the text must mathematically match the objects inside `keyTradeoffs`.
*   **Readability Limit:** The final `explanationText` must not exceed 150 words to maintain high mobile-dashboard readability.
*   **Tag Cap:** Warning tags must not exceed 3 items, prioritizing the highest-risk indicators.

---

## Confidence Score
The `confidenceScore` indicates the clarity and factual alignment of the explanation:

$$\text{Confidence Score} = (0.6 \cdot S_{\text{align}}) + (0.4 \cdot S_{\text{comp}})$$

Where:
*   $S_{\text{align}}$ (Factual Alignment): $1.0$ if all values in the explanation text match the underlying routing variables; $0.0$ if there is a discrepancy (leads to a validation rejection).
*   $S_{\text{comp}}$ (Comparison Completeness): $1.0$ if the recommended route is compared against at least one alternative; $0.5$ if no alternative exists.

---

## Example Scenarios

### Scenario 1: Business Traveler (Delhi to Mumbai)
*   **Input Parameters:**
    ```json
    {
      "segmentId": "sg_re_01",
      "recommendedRoute": {
        "routeId": "rt_flight_direct",
        "steps": ["Flight from DEL to BOM (Direct)"],
        "cost": 78.00,
        "durationMinutes": 130
      },
      "alternativeRoutes": [
        {
          "routeId": "rt_train_express",
          "steps": ["Express Train from New Delhi (NDLS) to Mumbai Central (MMCT)"],
          "cost": 45.00,
          "durationMinutes": 950,
          "label": "Cheapest"
        }
      ],
      "userPreferences": { "prioritizeSpeed": true, "prioritizeComfort": true, "avoidLayovers": true },
      "budgetTier": "Moderate",
      "travelerPersona": "Business"
    }
    ```
*   **Execution Logic:** The agent calculates that the flight saves 13 hours and 40 minutes for an extra cost of $33. The persona is Business, so the emphasis is on speed and direct connection.
*   **Output Result:**
    ```json
    {
      "segmentId": "sg_re_01",
      "explanationText": "We recommend the direct flight as it saves 13 hours and 40 minutes of travel time compared to the express train. For an additional $33.00, this option maximizes your productive time and fits comfortably within your Moderate budget tier.",
      "keyTradeoffs": [
        {
          "criteria": "Cost",
          "recommendedValue": "$78.00",
          "alternativeValue": "$45.00",
          "difference": "+$33.00 (More expensive)"
        },
        {
          "criteria": "Duration",
          "recommendedValue": "2h 10m",
          "alternativeValue": "15h 50m",
          "difference": "-13h 40m (Faster)"
        }
      ],
      "warningTags": [],
      "personaFocusHighlight": "For a Business traveler, this direct route saves a full business day of travel time and avoids productivity loss on the train.",
      "confidenceScore": 1.00
    }
    ```

### Scenario 2: Budget Backpacker (Anakapalle to Hyderabad)
*   **Input Parameters:**
    ```json
    {
      "segmentId": "sg_re_02",
      "recommendedRoute": {
        "routeId": "rt_train_budget",
        "steps": ["Train from Anakapalle (AKP) to Secunderabad (SC)"],
        "cost": 12.00,
        "durationMinutes": 720
      },
      "alternativeRoutes": [
        {
          "routeId": "rt_flight_opt",
          "steps": ["Taxi from Anakapalle to Vizag Airport (VTZ)", "Flight from VTZ to Hyderabad (HYD)"],
          "cost": 85.00,
          "durationMinutes": 180,
          "label": "Fastest"
        }
      ],
      "userPreferences": { "prioritizeSpeed": false, "prioritizeComfort": false, "avoidLayovers": false },
      "budgetTier": "Budget",
      "travelerPersona": "Solo"
    }
    ```
*   **Execution Logic:** Recommended route is the train (cheaper by $73). The traveler is a Solo/Budget traveler. The agent highlights the economic benefit.
*   **Output Result:**
    ```json
    {
      "segmentId": "sg_re_02",
      "explanationText": "We recommend the overnight train to Secunderabad. It saves you $73.00 compared to flying, making it highly compatible with your tight Budget tier, despite the 9-hour difference in travel time.",
      "keyTradeoffs": [
        {
          "criteria": "Cost",
          "recommendedValue": "$12.00",
          "alternativeValue": "$85.00",
          "difference": "-$73.00 (Cheaper)"
        },
        {
          "criteria": "Duration",
          "recommendedValue": "12h 00m",
          "alternativeValue": "3h 00m",
          "difference": "+9h 00m (Slower)"
        }
      ],
      "warningTags": ["Overnight Travel"],
      "personaFocusHighlight": "For a Solo traveler, the sleeper train functions as a budget accommodation alternative for the night, maximizing travel savings.",
      "confidenceScore": 1.00
    }
    ```

### Scenario 3: Pilgrimage Travel (Visakhapatnam to Shirdi)
*   **Input Parameters:**
    ```json
    {
      "segmentId": "sg_re_03",
      "recommendedRoute": {
        "routeId": "rt_scenic_train",
        "steps": [
          "Train from Visakhapatnam to Kopargaon Station (KPG)",
          "Local Taxi from Kopargaon Station to Shirdi Temple [16 km]"
        ],
        "cost": 28.00,
        "durationMinutes": 1421
      },
      "alternativeRoutes": [
        {
          "routeId": "rt_flight_multi",
          "steps": [
            "Flight from Vizag to Shirdi Airport via Hyderabad",
            "Taxi from airport to temple [14 km]"
          ],
          "cost": 140.00,
          "durationMinutes": 360,
          "label": "Fastest"
        }
      ],
      "userPreferences": { "prioritizeSpeed": false, "prioritizeComfort": true, "avoidLayovers": false },
      "budgetTier": "Moderate",
      "travelerPersona": "Pilgrimage"
    }
    ```
*   **Execution Logic:** Recommended is train due to moderate budget preferences and prioritizing low cost over speed (saves $112 per person). The persona is Pilgrimage, so the explanation highlights the simple transfers and direct route.
*   **Output Result:**
    ```json
    {
      "segmentId": "sg_re_03",
      "explanationText": "We recommend the express train to Kopargaon followed by a taxi transfer. This route saves you $112.00 compared to flying, leaving more of your Moderate tier budget for accommodation and temple activities, though it extends your transit by 17 hours.",
      "keyTradeoffs": [
        {
          "criteria": "Cost",
          "recommendedValue": "$28.00",
          "alternativeValue": "$140.00",
          "difference": "-$112.00 (Cheaper)"
        },
        {
          "criteria": "Duration",
          "recommendedValue": "23h 41m",
          "alternativeValue": "6h 00m",
          "difference": "+17h 41m (Slower)"
        }
      ],
      "warningTags": ["Overnight Travel", "Long Road Transfer"],
      "personaFocusHighlight": "For a Pilgrimage traveler, this route delivers a direct, single-train journey to the nearest railway station (Kopargaon) followed by a short pre-arranged taxi to the temple, avoiding complex flight layovers.",
      "confidenceScore": 0.95
    }
    ```

---

## Dependencies
*   **Route Optimization Skill:** Supplies the pricing, duration, and transit step arrays.
*   **Budget Planning Skill:** Delivers the current budget tier and cost boundary definitions.
*   **Connectivity Agent:** Supplies details on local transfers and distance variables.

---

## Success Criteria
*   **Formulation Speed:** Generate explanation, tradeoffs, warnings, and highlights in under 1.0 second.
*   **Numerical Alignment:** Maintain 100% agreement between text references and numeric data in the source models.
*   **Persona Relevance:** Ensure the generated explanation explicitly addresses the target traveler persona.
