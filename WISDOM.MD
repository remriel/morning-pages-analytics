# Wisdom

## 2026-11-09 — history scroll fix

1. **Least confident:** Native mobile Obsidian behavior. I verified a narrow browser layout but have not run the plugin on a mobile device; I would repeat the calendar and dropdown checks there.
2. **Biggest gap:** Async content above the calendar can also move the viewport after a redraw. Preserving only `scrollTop` immediately after drawing would miss that; the fix retains cloud height and anchors the current visible position as data arrives.
3. **Highest-impact assumption:** The user meant the Writing History dashboard. The reported selectors and calendar are there, and the issue was reproduced on 0.4.1; if another plugin view also jumps, I would reproduce and address that view separately.

## 2026-11-09 — Morning Pages Analytics 0.4.1

The user confirmed they own the code and want it open source. I chose the MIT license. Release 0.4.1 is published with synthetic screenshots and a banner. Five unit tests, a synthetic integration harness, a native cache rebuild, the release workflow, and the asset hashes passed.

1. **Least confident.** How the chart layout feels on a phone screen. I would review labels and tap targets in the mobile app.
2. **Biggest gap.** Historical note files carry no edit timing. I would gather timing during future writing sessions before adding a historical pace chart.
3. **Highest-impact assumption.** Public examples should use synthetic writing. I would replace them only after checking another sample has no private details.
