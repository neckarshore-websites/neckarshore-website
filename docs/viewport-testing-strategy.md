# Viewport Testing Strategy

## Target Audience

Executives and decision-makers in German Mittelstand and enterprise companies. Their devices are typically company-issued, current-generation smartphones replaced on a 2-3 year cycle for security reasons.

## Test Viewports

| # | Viewport | Device Examples | Rationale |
|---|----------|-----------------|-----------|
| 1 | 393x873 | iPhone 15 Pro, iPhone 16, Pixel 8 | Current standard enterprise device |
| 2 | 414x896 | iPhone 11, iPhone XR | Still 15% market share (Feb 2026), phasing out |
| 3 | 768x1024 | iPad | Meeting and presentation device for executives |

### Excluded Viewports

- **375px** (iPhone X, 12/13 Mini) — 5.85% share, not current enterprise hardware
- **360px** (older Samsung/Android) — 5.6% share, budget segment, not target audience
- **430px+** (iPhone Pro Max, large Android) — if 393px and 414px work, these work too

## Data Source

**StatCounter Global Stats — Mobile Screen Resolution, Germany**
- URL: https://gs.statcounter.com/screen-resolution-stats/mobile/germany
- Last checked: 2026-03-31 (data from February 2026)
- Filter: Mobile only, Germany, last 12 months

### How to Re-Evaluate

1. Visit the StatCounter URL above
2. Filter by "Germany", "Mobile", last 12 months
3. Note the top 6 resolutions and their share percentages
4. Map resolutions to viewport widths (group by width: 360, 375, 384, 390, 393, 414, 430)
5. Decide which width groups cover 80%+ of target audience traffic
6. Update this document and the Playwright test script accordingly

## Re-Evaluation Triggers

- **Samsung Galaxy S/Z series launch** (typically January/February) — check if new viewport widths emerge
- **Apple iPhone launch** (typically September) — check if viewport widths change
- **Annual review** — at minimum once per year, even without major launches
- **Traffic anomaly** — if own analytics show unexpected viewport patterns

## Testing Tool

Playwright with Chromium, run locally:

```bash
python3 -c "
from playwright.sync_api import sync_playwright

viewports = [
    ('iphone16-393', 393, 873),
    ('iphone11-414', 414, 896),
    ('ipad-768', 768, 1024),
]

with sync_playwright() as p:
    browser = p.chromium.launch()
    for name, w, h in viewports:
        page = browser.new_page(viewport={'width': w, 'height': h})
        page.goto('https://neckarshore.ai', wait_until='networkidle')
        page.screenshot(path=f'/tmp/mobile-screenshots/{name}.png', full_page=True)
        page.close()
    browser.close()
"
```

## Checklist per Viewport

- [ ] No horizontal scrolling or text overflow
- [ ] Touch targets >= 48x48px
- [ ] No overlapping or cut-off elements
- [ ] Font sizes readable without zooming
- [ ] Buttons and links not too close together
- [ ] Above-the-fold content makes sense (CTA visible without scrolling)
