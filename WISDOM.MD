# Wisdom

## 2026-11-10 — automatic multi-format dates

1. Least confident: native settings layout with twelve toggles; I would inspect desktop/mobile layouts next. Callback behavior is tested.
2. Biggest gap: numeric day/month ambiguity cannot always be inferred from a title. Automatic mode skips conflicting dates; users can select the intended formats.
3. Highest-impact assumption: the desired dates are fully represented by the title. Prefixed prose titles or ambiguous numeric names need explicit custom formats, not guesses.

## 2026-11-10 — per-folder date source

1. Least confident: native settings interaction; verify source switching in a disposable Obsidian vault.
2. Biggest gap: imported journals need their title dates, since import timestamps can be identical. Explicit filename mode now handles this without timestamp fallback.
3. Highest-impact assumption: Ledger titles share a consistent date format. If they vary, add deliberate multi-format support rather than guessing ambiguous dates.

## 2026-11-10 — creation-date clarification

1. **Least confidence:** Native settings UI on desktop/mobile. Runtime and browser tests pass; I would test settings in a disposable native vault next.
2. **Biggest gap:** Creation timestamps can be reset by sync/copy tools. I would support an explicit frontmatter creation-date source if original imported dates need preservation.
3. **Highest-impact assumption:** Obsidian filesystem creation time represents the intended creation date. The user explicitly rejected modification time; I would never fall back to it.

## 2026-11-10 — timestamp ordering and folder refresh

1. **Least confidence:** Native Obsidian interaction for multiple folder rows. I would test adding/removing folders while history is open in a disposable vault.
2. **Biggest gap:** Filename date still determines calendar placement; modification time determines order within a day. I would add a separate timestamp-based grouping mode if the user wants calendar dates based on file metadata.
3. **Highest-impact assumption:** "Order by timestamp" means newest-modified note first within each day. I would change direction if the intended order is creation time or oldest first.

## 2026-11-10 — multiple writing folders

1. **Least confidence:** Native Obsidian settings behavior with several rows. I would add and remove folders in a disposable vault and confirm history counts.
2. **Biggest gap:** All added folders share the Daily Notes date format. I would consider per-folder formats if the user's folder names follow different conventions.
3. **Highest-impact assumption:** The requested tracking is writing history indexing. I would adjust scope if the user also wants folder filtering in the active-note stats view.

## 2026-11-10 — custom folder release

1. **Least confidence:** Native Obsidian settings interaction. I would test changing and clearing the folder in a disposable vault and confirm the history counts.
2. **Biggest gap:** The custom folder follows the Daily Notes filename date format. I would add a separate format setting if the user's other folder has a different naming convention.
3. **Highest-impact assumption:** The request concerns writing history inclusion, not restricting the active note stats view. I would revisit the scope if the desired behavior differs.

## 2026-11-09 — history scroll fix

1. **Least confident:** Native mobile Obsidian behavior. I verified a narrow browser layout but have not run the plugin on a mobile device; I would repeat the calendar and dropdown checks there.
2. **Biggest gap:** Async content above the calendar can also move the viewport after a redraw. Preserving only `scrollTop` immediately after drawing would miss that; the fix retains cloud height and anchors the current visible position as data arrives.
3. **Highest-impact assumption:** The user meant the Writing History dashboard. The reported selectors and calendar are there, and the issue was reproduced on 0.4.1; if another plugin view also jumps, I would reproduce and address that view separately.

## 2026-11-09 — Morning Pages Analytics 0.4.1

The user confirmed they own the code and want it open source. I chose the MIT license. Release 0.4.1 is published with synthetic screenshots and a banner. Five unit tests, a synthetic integration harness, a native cache rebuild, the release workflow, and the asset hashes passed.

1. **Least confident.** How the chart layout feels on a phone screen. I would review labels and tap targets in the mobile app.
2. **Biggest gap.** Historical note files carry no edit timing. I would gather timing during future writing sessions before adding a historical pace chart.
3. **Highest-impact assumption.** Public examples should use synthetic writing. I would replace them only after checking another sample has no private details.
