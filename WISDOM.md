## 2026-11-17 — 0.6.3 published

Release workflow 44155814773 passed its required test/build steps; all nine asset digests and the installation ZIP contents match. Native Obsidian behavior and personal-vault CPU impact remain unmeasured, so native validation is the user's follow-up.

1. **Least confident:** Actual responsiveness in the user's native vault and Obsidian theme. The changes yield work and avoid some repeated analysis, but no on-device performance measurement is available. I would check during an ordinary edit and a full history refresh after installation.
2. **Biggest missing point:** Event-loop yields make long operations less monopolizing but do not guarantee a specific CPU reduction or remove the total indexing work. I would compare the same vault action before and after rather than infer performance from code structure alone.
3. **Most consequential assumption:** Reusing active-note analysis is safe when the file, text, and analysis settings match. If a hidden input to the analyzer changes without changing those values, the cache key must include it or be invalidated.

---

## 2026-11-15 — 0.6.2 published

1. **Least confident:** The release workflow and asset hashes passed, but native range restoration in Obsidian remains unchecked. I would test preset and custom-range reopening after installation.
2. **Biggest missing point:** Existing numeric defaults were preserved; Last used becomes the new-install opening choice and is available to existing users if selected.
3. **Most consequential assumption:** Last used includes navigated period offsets and custom dates, not only a preset length. If it should reopen the newest period, I would store only the preset.

## 2026-11-15 — opening history range

1. **Least confident:** Native Obsidian's view restoration across devices has not been checked. I would verify a chosen preset and custom range in a copied vault on desktop and mobile.
2. **Biggest missing point:** Morning Pages Analytics already had a numeric opening default, so Last used must be an explicit unset choice rather than overwriting existing preferences. I preserved those numeric defaults.
3. **Most consequential assumption:** Last used includes the navigated period offset and custom dates, not just the preset length. If the intended behavior is to reset to the newest period on reopening, I would store only the preset.

## 2026-11-15 — reliability release

1. Least confident: native Obsidian/device and live-provider behavior. I would verify these in an isolated test vault before claiming native coverage.
2. Biggest gap: a passing audit cannot prove the absence of every bug. I would keep regression tests and investigate new reproducible reports.
3. Largest assumption: publish means GitHub plugin releases, with unchanged saved scores preserved on provider failure. If a different distribution or overwrite policy is intended, I would adjust that explicitly.

# Wisdom

## 2026-11-14 — excluded folders, 0.6.0 local release

The excluded-folder feature is implemented and locally verified. The local release commit and both tags (`v0.6.0` and `0.6.0`) are at `HEAD`; no remote publication has been verified.

1. **What are you least confident about right now? What would you do differently?** The settings and active-note message have not been checked in a live Obsidian app. The two browser-only settings/history checks skipped because Chrome or Chromium is unavailable. I would verify those views in a disposable Obsidian vault before claiming native UI coverage.
2. **What is the biggest thing the user may be missing? What would you do differently?** Exclusion paths must match the vault folder's spelling and capitalization; each path also excludes nested folders and Daily Notes. I documented that behavior in the README and release notes so a path mismatch is easier to diagnose.
3. **Which assumption, if wrong, would change the answer most? What would you do differently?** The local `v0.6.0` alias is retained while the numeric `0.6.0` tag matches `manifest.json` and triggers the release workflow when pushed. Remote branch/tag/release state is still unknown. I would query it and confirm targets before pushing `main` and then the numeric tag, following `../RELEASE_STEPS.md`. Publication, remote CI, and asset verification remain undone. [Obsidian release documentation](https://docs.obsidian.md/plugins/releasing/submit-plugin)

## 2026-11-10 — folder autocomplete

Published 0.5.4; all 22 tests, CI, and nine asset digests passed.

1. Least confident: native datalist behavior on mobile Obsidian; verify on a device.
2. Biggest gap: empty and nested folders should appear even when they contain no Markdown notes.
3. Highest-impact assumption: choosing a suggestion should use the existing automatic folder refresh and date-source behavior; revisit if a separate confirmation is desired.


## 2026-11-10 — history period navigation

Published 0.5.3; all 22 tests and release CI passed.

1. Least confident: native Obsidian interaction; verify there after release.
2. Biggest gap: navigation must move by the selected number of days and reset when the range changes.
3. Highest-impact assumption: arrows apply to finite preset ranges; revisit if custom ranges should also navigate.


## 2026-11-10 — settings width, release 0.5.2

Published 0.5.2; CI 42971601303 and asset/ZIP verification passed. All 22 tests passed.

1. Least confident: the exact layout in the user's Obsidian theme and on physical mobile devices. The browser fixture passed with Obsidian 1.15.0's stylesheet, but the isolated native window was unavailable; I would inspect the released plugin in Obsidian next.
2. Biggest gap: changing only the overall pane would still leave dropdown controls constrained within their rows. I widened the pane and gave every settings dropdown its own full-width row.
3. Highest-impact assumption: the issue is in Morning Pages Analytics plugin settings, especially its category, history, and folder dropdowns. If another pane or a theme-specific override is involved, I would reproduce it with that exact theme and window size.

## 2026-11-10 — editable defaults and settings navigation

Published 0.5.1; CI 42954591844 and downloaded asset/ZIP verification passed. All 22 tests passed. User requested faster execution; finish sufficient verification and avoid optional additional work.

1. Least confident: behavior under actual Obsidian themes and mobile hardware. Production settings are exercised in a browser harness at four layouts, but I would verify the released UI in a disposable native vault next.
2. Biggest gap: clearing a base list and restoring the shipped list must be different actions. Empty overrides now persist deliberately, while Restore defaults removes only that category's override and preserves additions.
3. Highest-impact assumption: editing a list should reanalyze past writing with the current list. The UI explains this; immutable past analysis would need a separate versioned-history design.

## 2026-11-10 — publish 0.5.0 and read latest feedback

Publication verified: CI 42952753325 passed eighteen tests and the build; all nine release digests and all four ZIP entries matched. Native settings interaction remains unverified.

1. Least confident: native Obsidian settings layout remains unverified. The release has automated logic, runtime and browser coverage; a disposable native-vault check would add UI evidence.
2. Biggest gap: a monthly journal note is currently assigned to one day. The latest Reddit commenter needs per-day sections within a single note; supporting that needs a separate design and explicit implementation request.
3. Highest-impact assumption: publication means the completed two-feature 0.5.0 scope. Keep the new monthly-note request as feedback rather than adding an untested third feature to this release.

## 2026-11-10 — configurable goal and category words

1. Least confident: native settings layout with many category fields; test in Obsidian next.
2. Biggest gap: custom words use exact token matching, not semantic interpretation or stemming. Include alternate word forms explicitly.
3. Highest-impact assumption: a goal is a positive whole number and applies retrospectively to history. If users need historical goal schedules, that is a separate feature outside this request.

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

## 2026-11-12 - README and repository description

1. **Least confidence:** Native mobile behavior remains unverified. I would test the released plugin on a real device before expanding compatibility claims.
2. **Biggest gap:** Category charts count vocabulary, and history assigns one date per file. I made these limits explicit so readers can judge whether the plugin suits their writing.
3. **Highest-impact assumption:** The requested update concerns public project documentation for the current release. If a different audience or positioning was intended, I would revise the opening and feature emphasis.

## 0.6.4 reflection

1. The remaining uncertainty is which other note was expected on November 17. Trace a specific title to its assigned date.
2. A note created today can count toward yesterday when its title contains yesterday's date. Inspect the folder date rule before comparing totals.
3. The fix assumes filename dates represent the intended journal day. If the intended measure is words added on each editing day, that requires edit history.

0.6.5 reflections: Device-specific rendering remains the least certain. Dashboard navigation cost depends on history size. The release prioritizes repeated interactions and preserves source attribution.
