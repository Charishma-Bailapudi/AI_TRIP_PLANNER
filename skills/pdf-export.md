# PDF Export Skill

## Purpose
The PDF Export Skill is responsible for converting structured itinerary and segment data into high-fidelity layout configurations ready for PDF generation engines. It translates text, tables, and images into structured layout commands, managing typography, color palettes, margins, headers, footers, and page-breaking logic to produce beautiful, print-ready travel documents.

## Responsibilities
- Parse multi-day, multi-segment itineraries into structured document flows.
- Map abstract layout preferences (e.g., theme, sizing) into precise CSS-like design systems (margins, padding, colors, font sizes).
- Compute element heights dynamically to execute smart page-break controls (e.g., preventing orphaned headings or split itinerary cards).
- Generate a cover page, summary dashboard, detail timeline pages, and notes sections.
- Output layout objects conforming to a standardized, engine-agnostic schema (e.g., pdfmake, jsPDF, or custom canvas inputs).
- Provide structural layout verification and report generation confidence scores.

## Inputs (JSON schema/example)

### JSON Schema
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "PdfExportInput",
  "type": "object",
  "properties": {
    "tripId": { "type": "string" },
    "tripTitle": { "type": "string" },
    "startDate": { "type": "string", "format": "date" },
    "endDate": { "type": "string", "format": "date" },
    "origin": { "type": "string" },
    "segments": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "segmentId": { "type": "string" },
          "sequence": { "type": "integer" },
          "type": { "type": "string", "enum": ["travel", "lodging"] },
          "details": {
            "type": "object",
            "properties": {
              "mode": { "type": "string" },
              "originLocation": { "type": "string" },
              "destinationLocation": { "type": "string" },
              "departureTime": { "type": "string", "format": "date-time" },
              "arrivalTime": { "type": "string", "format": "date-time" },
              "provider": { "type": "string" },
              "referenceNumber": { "type": "string" },
              "cost": {
                "type": "object",
                "properties": {
                  "amount": { "type": "number" },
                  "currency": { "type": "string" }
                },
                "required": ["amount", "currency"]
              }
            },
            "required": ["mode", "departureTime", "arrivalTime", "cost"]
          }
        },
        "required": ["segmentId", "sequence", "type", "details"]
      }
    },
    "exportConfig": {
      "type": "object",
      "properties": {
        "pageSize": { "type": "string", "enum": ["A4", "LETTER"], "default": "LETTER" },
        "themeName": { "type": "string", "enum": ["modern-navy", "earth-adventure", "warm-sunset"], "default": "modern-navy" },
        "includeMapPreviews": { "type": "boolean", "default": false },
        "margin": {
          "type": "object",
          "properties": {
            "top": { "type": "number" },
            "bottom": { "type": "number" },
            "left": { "type": "number" },
            "right": { "type": "number" }
          },
          "required": ["top", "bottom", "left", "right"]
        }
      },
      "required": ["pageSize", "themeName"]
    }
  },
  "required": ["tripId", "tripTitle", "startDate", "endDate", "segments", "exportConfig"]
}
```

### JSON Example
```json
{
  "tripId": "trip_987654321_abc",
  "tripTitle": "Summer Culture and History in Paris & Rome",
  "startDate": "2026-07-10",
  "endDate": "2026-07-20",
  "origin": "New York, USA",
  "segments": [
    {
      "segmentId": "seg_001_travel",
      "sequence": 1,
      "type": "travel",
      "details": {
        "mode": "train",
        "originLocation": "Paris Gare du Nord",
        "destinationLocation": "Rome Termini",
        "departureTime": "2026-07-15T09:00:00Z",
        "arrivalTime": "2026-07-15T20:30:00Z",
        "provider": "Trenitalia",
        "referenceNumber": "TREN-8812",
        "cost": {
          "amount": 140.00,
          "currency": "EUR"
        }
      }
    }
  ],
  "exportConfig": {
    "pageSize": "LETTER",
    "themeName": "modern-navy",
    "includeMapPreviews": false,
    "margin": {
      "top": 54,
      "bottom": 54,
      "left": 72,
      "right": 72
    }
  }
}
```

## Outputs (JSON schema/example with confidence score)

### JSON Schema
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "PdfExportOutput",
  "type": "object",
  "properties": {
    "tripId": { "type": "string" },
    "layoutConfig": {
      "type": "object",
      "properties": {
        "pageSize": { "type": "string" },
        "pageMargins": {
          "type": "array",
          "items": { "type": "number" },
          "minItems": 4,
          "maxItems": 4,
          "description": "[left, top, right, bottom]"
        },
        "styles": {
          "type": "object",
          "description": "Style definitions containing font faces, sizes, colors, and alignments"
        },
        "header": { "type": "object", "description": "Dynamic header definition" },
        "footer": { "type": "object", "description": "Dynamic footer definition with page numbering" },
        "content": {
          "type": "array",
          "items": { "type": "object" },
          "description": "Sequential array of document canvas/flow elements (text, table, images, pageBreaks)"
        }
      },
      "required": ["pageSize", "pageMargins", "styles", "content"]
    },
    "estimatedPageCount": { "type": "integer" },
    "confidenceScore": {
      "type": "object",
      "properties": {
        "overall": { "type": "number", "minimum": 0.0, "maximum": 1.0 },
        "reasoning": { "type": "string" }
      },
      "required": ["overall", "reasoning"]
    }
  },
  "required": ["tripId", "layoutConfig", "estimatedPageCount", "confidenceScore"]
}
```

### JSON Example
```json
{
  "tripId": "trip_987654321_abc",
  "layoutConfig": {
    "pageSize": "LETTER",
    "pageMargins": [72, 54, 72, 54],
    "styles": {
      "headerStyle": { "fontSize": 24, "bold": true, "color": "#1A365D", "font": "Helvetica" },
      "subheaderStyle": { "fontSize": 14, "bold": true, "color": "#2B6CB0", "margin": [0, 10, 0, 5] },
      "bodyStyle": { "fontSize": 10, "color": "#2D3748", "lineHeight": 1.4 },
      "tableHeader": { "bold": true, "fontSize": 10, "color": "#FFFFFF", "fillColor": "#1A365D" }
    },
    "header": {
      "text": "Summer Culture and History in Paris & Rome",
      "alignment": "right",
      "fontSize": 8,
      "color": "#718096"
    },
    "footer": {
      "columns": [
        { "text": "Generated by AI Trip Planner", "alignment": "left", "fontSize": 8, "color": "#718096" },
        { "text": "Page 1 of 3", "alignment": "right", "fontSize": 8, "color": "#718096" }
      ]
    },
    "content": [
      { "text": "Summer Culture and History in Paris & Rome", "style": "headerStyle", "alignment": "center", "margin": [0, 100, 0, 10] },
      { "text": "Prepared for: User 1029384756", "alignment": "center", "fontSize": 12 },
      { "text": "", "pageBreak": "after" },
      { "text": "Your Itinerary Chronology", "style": "subheaderStyle" },
      {
        "table": {
          "headerRows": 1,
          "widths": [100, "*", 80],
          "body": [
            [
              { "text": "Date & Time", "style": "tableHeader" },
              { "text": "Segment Description", "style": "tableHeader" },
              { "text": "Reference #", "style": "tableHeader" }
            ],
            [
              "2026-07-15 09:00",
              "Train: Paris Gare du Nord to Rome Termini (Trenitalia)",
              "TREN-8812"
            ]
          ]
        }
      }
    ]
  },
  "estimatedPageCount": 3,
  "confidenceScore": {
    "overall": 0.94,
    "reasoning": "Text lengths are standard, and layouts avoid deep nested tables. Zero high-risk formatting strings detected. Page numbers are estimated accurately."
  }
}
```

## Decision Rules
1. **Theme Design Palette**:
   - `modern-navy`: Primary `#1A365D`, Secondary `#2B6CB0`, Text `#2D3748`, Background `#F7FAFC`.
   - `earth-adventure`: Primary `#2F855A`, Secondary `#718096`, Text `#2D3748`, Background `#F0FFF4`.
   - `warm-sunset`: Primary `#C53030`, Secondary `#DD6B20`, Text `#2D3748`, Background `#FFF5F5`.
2. **Page-Breaking Logic**:
   - Keep-with-next: Do not allow headings (`H1`, `H2`) to appear on the last $40\text{ pt}$ of a page. If position exceeds PageHeight - BottomMargin - $40\text{ pt}$, insert a `pageBreak` object before the heading.
   - Table rows must not break mid-row. If an entire table row height exceeds remaining page space, push the entire row to the next page.
3. **Cover Page Suppression**: Suppress header, footer, and page numbering on Page 1 elements.
4. **Column Wrapping**: Set table widths to auto-wrap. Set text elements to clip or wrap when content surpasses column boundaries to avoid visual clipping.

## Reasoning Strategy
The PDF Export Skill operates using a **Virtual Document Flow Parser**:
1. **Metric Loading**: Loads character width tables for standard PDF core fonts (Helvetica, Times, Courier) to accurately measure text dimensions.
2. **Virtual Render Engine**: Evaluates the height of every content block:
   $$\text{Height} = (\text{Number of lines} \times \text{Font Size} \times \text{Line Height}) + \text{Margins}$$
3. **Paginator Loop**: Keeps track of current page coordinates $(X, Y)$. Iterates through items, placing them on the page. If the estimated $Y$ boundary crosses PageHeight minus BottomMargin, it inserts a `pageBreak` symbol, resets $Y$ to TopMargin, increments PageCount, and appends header/footer templates.
4. **Validation Check**: Confirms that no elements are overlapping and that layout components conform to the structural target framework.

## Data Sources
- **Core Font Matrix**: Font geometry parameters for layout height calculations.
- **Theme Settings Index**: Definition catalog of styling tokens.

## Error Handling
- **Image Unreachable**: If image files cannot be loaded, substitute with a structured placeholder block of identical width/height and append a warning log `WARN_IMAGE_REPLACEMENT`.
- **Text Overflow**: If custom input strings are too long for summary tables, truncate with an ellipsis (`...`) and add warning `WARN_TEXT_TRUNCATED`.

## Validation Rules
- Content array must not be empty.
- Column widths in a single table must sum to the available printable width (PageWidth - LeftMargin - RightMargin) or be marked as auto-scaling (`*` or `auto`).

## Confidence Score
- Calculated as:
  $$\text{Confidence} = 1.0 - (0.15 \times \text{unmeasured custom image assets}) - (0.10 \times \text{unsupported text formatting tags})$$
- Scores decrease if user provides long unstructured text fields that can throw off paragraph height estimation.

## Example Scenarios

### Scenario 1: Quick Weekend Trip (Short 2-page Modern Navy PDF)
- **Input**: 1 travel segment, 1 lodging segment, modern-navy theme, standard letter size.
- **Process**: Sets margins to 0.75 in. Generates a minimalist cover page, followed by a page break. Generates a compact table listing the flight and hotel check-in details. Everything fits on Page 2 without requiring further page breaks.
- **Output**: Returns layout JSON with header/footers active on Page 2 only. Estimated page count: 2. Confidence: 0.98.

### Scenario 2: High-Activity 2-Week Vacation (Multi-page Pagination Adjustment)
- **Input**: 15 segments, Earth Adventure theme.
- **Process**: Standard flow estimation detects that Segment 8 (lodging card) begins at $Y = 750\text{ pt}$ (within the bottom margin area). Rather than letting the hotel segment split, it inserts a page break before Segment 8. It divides the itinerary across 4 pages.
- **Output**: Returns a layout with 4 pages of content, header/footer elements updated with "Page X of 4". Confidence: 0.92.

### Scenario 3: Missing Custom Font Assets (Graceful Fallback Mode)
- **Input**: Config specifies custom font "OceanicSerif" not present in standard PDF fonts.
- **Process**: Identifies missing font configuration, falls back to "Times-Roman" for serif styling, adjusts the character width matrices accordingly, and logs a warning.
- **Output**: Generates layout JSON utilizing standard "Times-Roman" font styles. Logs warning code `WARN_FONT_FALLBACK_APPLIED`. Confidence: 0.85.

## Dependencies
- **Asset Storage**: Stores logo files and map previews referenced in the layout structure.

## Success Criteria
- Valid layout config JSON output.
- No orphan headers or tables exceeding page borders.
- Successful rendering behavior on standard test interpreters without crash.
