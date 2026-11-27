# 0.6.7 support footer

100% complete. Added the support copy and single Buy Me a Coffee link, reviewed the patch, passed all 30 local tests with the browser required, and published 0.6.7 through GitHub Actions run 45928239806. Confirmed Latest, verified nine download SHA-256 digests and all four ZIP entries, and checked packaged footer code and artwork. No release blockers or remaining release steps. Native Obsidian appearance and click behavior remain unverified.

# Verified release 0.6.5

100% complete. Published https://github.com/remriel/morning-pages-analytics/releases/tag/0.6.5 and verified SHA-256 digests of main.js, manifest.json and styles.css after installation in Remy. Browser checks passed. Native device responsiveness remains unmeasured. RESUME HERE for the next release.

# 0.6.5 dashboard update

Calendar navigation, range changes and chart controls reuse grouped daily statistics. Day detail shows each source folder beside the note and word count. Includes descriptive filename recognition from 0.6.4.

Local functional tests passed. Release verification is recorded in the release workflow.

# Current progress · 0.6.4

100% of the indexing fix verified. Built and installed the plugin, passed 30 tests, and confirmed that every Markdown file in all six configured additional folders appeared in the rebuilt vault index. Dashboard rendering in the live vault was not visually inspected. If a daily total still differs, identify a specific note and check its assigned date.

# Progress — large-vault responsiveness (0.6.3)

Objective: reduce uninterrupted history and live-analysis work in larger Morning Pages Analytics vaults and publish a verified release.

Progress: 100% — release 0.6.3 is published, its workflow passed, and all assets were verified. Native Obsidian testing is a user-owned follow-up.

- [x] Yield during long file scans, event updates, and vocabulary reads in bounded batches.
- [x] Avoid empty event flushes and unrelated history redraws.
- [x] Cache unchanged active-note analysis, debounce typing to 300 ms, and preserve vocabulary cache on range saves.
- [x] Verify latest published release 0.6.2 and prepare 0.6.3 version metadata and release notes.
- [x] Build the final candidate and review the complete diff (`npm run build`, `node --check main.js`, `git diff --check`; full tests deferred to required CI).
- [x] Publish through the existing release workflow; its required test/build checks passed.
- [x] Verify release workflow 44155814773 and all nine asset digests, including the installation ZIP and its four entries.
- [ ] User-owned follow-up: check native Obsidian behavior and performance in their vault.

Tests/verification: release workflow ran `npm test` with `MPA_REQUIRE_BROWSER=1` (29 passing), rebuilt the plugin, checked version metadata, and packaged the ZIP. All nine SHA-256 digests match GitHub's published digests; local generated plugin assets match after line-ending normalization. Native Obsidian behavior remains unverified.

Next, the user can install/reload 0.6.3 and check responsiveness in native Obsidian. No release work remains.

---

# Progress — remember writing-history range (2026-11-15)

Objective: allow a chosen default opening range or Last used across Writing history reopenings, including custom dates and navigated preset periods.

Progress: 100% — release 0.6.2 is published and its plugin assets are verified. Native installation remains unverified.

- [x] Add Last used to history settings while preserving existing explicit defaults.
- [x] Validate and persist preset, period offset and custom dates; apply on new view opens.
- [x] Leave already-open history views on their selected range when the default setting changes.
- [x] Pass 29 local tests, including settings browser checks and range persistence regressions.
- [x] Run the final 0.6.2 build and 29-test suite.
- [x] Inspect the final diff and verify 0.6.2 version metadata.
- [x] Push the candidate branch and open mergeable draft PR #2.
- [x] Merge PR #2, publish 0.6.2 and verify release workflow 43751472429 and plugin asset hashes.

Current state: 0.6.2 is published. The installed plugin and personal vault are unchanged.

Next step: update/reload 0.6.2 and verify the opening range in native Obsidian.

---

# Progress — release verification (2026-11-15)

Published 0.6.1: https://github.com/remriel/morning-pages-analytics/releases/tag/0.6.1. Release workflow succeeded; all downloaded asset SHA-256 digests and plugin source parity verified.

Progress: 100% toward this verified fix release.

All 27 tests passed with MPA_REQUIRE_BROWSER=1 (no skips), including desktop/mobile-width browser fixtures, refresh concurrency and failed-save retry regressions.

Implementation: Queued refreshes retain force, survive an initial scan failure, and stop on unload. Failed cache writes retry on unchanged refreshes.

## RESUME HERE

No required release steps remain. Native Obsidian and live Groq calls were not tested; no personal vault was modified. This is a verified fix set, not a guarantee that no undiscovered bugs remain.

---

# Progress — release verification (2026-11-15)

Release candidate 0.6.1 verified locally; publication and remote asset verification remain.

Progress: 90% toward this verified fix release.

All 27 tests passed with MPA_REQUIRE_BROWSER=1 (no skips), including desktop/mobile-width browser fixtures, refresh concurrency and failed-save retry regressions.

Implementation: Queued refreshes retain force, survive an initial scan failure, and stop on unload. Failed cache writes retry on unchanged refreshes.

## RESUME HERE

Push the reviewed commit, run the existing release workflow, monitor CI, then download and verify every release asset. Do not mark publication complete until verified.

---

# Progress

## Current objective: verify publication of Morning Pages Analytics 0.6.0

**Progress toward verified publication: 75%.** The release implementation, local build/tests, release commit, and local tags are complete. Remote publication, CI, asset verification, and optional native checks remain.

- [x] Confirm the starting plugin version is 0.5.4 and inspect the working diff.
- [x] Set `manifest.json`, `package.json` and `package-lock.json` to 0.6.0.
- [x] Prepare excluded-folder behavior notes in README and [release notes](RELEASE_NOTES_0.6.0.md); document local verification limits.
- [x] Update the release workflow to require `docs/RELEASE_NOTES_${VERSION}.md` and use it as the GitHub release description while preserving all existing release assets.
- [x] `npm run build`: exit 0. `npm test`: exit 0; individual test runs show 22 passed and 2 browser-only checks skipped because Chrome/Chromium is unavailable. Native Obsidian was not tested.
- [x] Check Obsidian's official release rule: the published tag must match the manifest version in `x.y.z` form.
- [x] Review the implementation diff, release notes, workflow, and local test/build results.
- [x] Create the local release commit and local tags `v0.6.0` and `0.6.0`; both tags point at the release commit at `HEAD`.
- [x] Read the orchestrator instructions in `../../RELEASE_STEPS.md`.

Remaining actions in order:

1. Confirm the remote branch, numeric tag, and release state from this repository:

   ```sh
   git ls-remote origin refs/heads/main refs/tags/0.6.0
   gh release view 0.6.0 --repo remriel/morning-pages-analytics
   ```

   Confirm remote `main` can accept this commit. If numeric tag `0.6.0` or the GitHub release already exists, stop and reconcile its target and release state before pushing.
2. Push the branch, then the numeric tag:

   ```sh
   git push origin main
   git push origin 0.6.0
   ```

   Do not push `v0.6.0`.
3. Monitor the GitHub Actions release workflow triggered by the numeric tag push and wait for completion.
4. Verify the remote tag target, release notes, and assets. The release should include `main.js`, `manifest.json`, `styles.css`, `LICENSE`, both screenshots, both banner files, and `morning-pages-analytics-0.6.0.zip`:

   ```sh
   git ls-remote origin refs/tags/0.6.0
   gh release view 0.6.0 --repo remriel/morning-pages-analytics --json tagName,assets --jq '{tagName, assets: [.assets[].name]}'
   gh release view 0.6.0 --repo remriel/morning-pages-analytics --json body --jq .body
   ```
5. Optionally verify the settings and active-note behavior in native Obsidian desktop/mobile. Local browser-only checks were skipped; native behavior remains unverified.

Remote branch/tag/release state has not been queried in this handoff. No push or release publication has occurred. If remote version/tag state is unexpected, pause and reconcile before pushing.

**Release notes:** Excluded-folder paths can be entered one per line. Each path excludes its descendants, including Daily Notes and additional writing folders. Excluded notes are removed from history totals and word-cloud results and do not show active-note live stats. Removing a path restores eligibility.

**Scope note:** The separate `automatic-mood-history` fallback feature uses built-in lists only, not custom lists, and interprets “Grok” as Groq. It is outside this Morning Pages Analytics release.

## Current objective: refresh README and GitHub description (2026-11-12)

**Progress toward verified publication: 100%.** `[##########]`

- [x] Read project/shared notes, inspect Git state, and reconcile with the current source and latest release 0.5.4.
- [x] Rewrite README with product-first copy, install instructions, commands, current features, customization, privacy, and development.
- [x] Preserve existing screenshots, support link, licensing, and known behavioral limits.
- [x] Check all five local Markdown links/assets and UTF-8 text, review the diff, and update/read back the GitHub description.
- [x] Publish the documentation to main; final delivery checks compare the remote commit and README with the local files.

Implementation: documentation only; runtime code and version unchanged. Blockers: none. Verification: source/release cross-check, all local README targets exist, UTF-8 check, git diff --check, and repository-description readback. Runtime tests were not run for this prose-only change. No implementation steps remain; native Obsidian/mobile checks retain their previous limits.

## Current objective: folder autocomplete and release 0.5.4

**Progress: 100%.** `[##########]`

- [x] Suggest vault folders as the user types; keep manual paths.
- [x] All 22 tests and release CI 42981816017 passed.
- [x] Published https://github.com/remriel/morning-pages-analytics/releases/tag/0.5.4 and verified nine asset digests. Native Obsidian and mobile remain unverified.


## Current objective: 14/60/180 day ranges and period navigation, 0.5.3

**Progress: 100%.** `[##########]`

- [x] Add both ranges to the dashboard, defaults and persisted settings.
- [x] Add previous/next period navigation.
- [x] All 22 tests passed; build and release workflow 42975208872 succeeded. Published https://github.com/remriel/morning-pages-analytics/releases/tag/0.5.3.


## Current objective: use the available settings width and publish 0.5.2

**Progress toward verified publication: 100%.** `[##########]`

- [x] Reproduce the fixed-width Obsidian pane and constrained dropdown controls in the browser fixture.
- [x] Widen this plugin's desktop settings pane and give dropdowns full-width rows.
- [x] Check every option's text fit and pane width across eight desktop, phone, dark and larger-text layouts.
- [x] Pass 22 tests with Chrome required, build, bundle syntax and diff checks; repeat settings checks with the installed Obsidian 1.15.0 CSS.
- [x] Push the source and exact 0.5.2 tag; workflow 42971601303 passed.
- [x] Verify all nine release digests, four ZIP entries, and source/build content; update the handoff and shared project pointer.

Published: https://github.com/remriel/morning-pages-analytics/releases/tag/0.5.2. Native Obsidian interaction and mobile hardware remain unverified: a disposable isolated process started but its hidden window could not be targeted. No required steps remain.

## Current objective: editable defaults, clearer settings and release 0.5.1

**Progress toward verified publication: 100%.** `[##########]`

- [x] Edit, replace, remove or clear base words for every category; retain separate additions.
- [x] Restore built-in defaults for one category without deleting its additions.
- [x] Update live analysis, cached history and persisted/reloaded overrides correctly.
- [x] Organize settings into four sections with one category editor and expandable folders.
- [x] Verify navigation, readable fields, accessible names, keyboard focus and responsive layouts in desktop/phone-width/dark/narrow-pane browser previews; inspect screenshots.
- [x] npm test: 22 pass with browser checks required; npm run build, syntax and diff checks pass.
- [x] Publish exact 0.5.1 tag; CI 42954591844 passed all 22 tests, build and packaging.
- [x] Verify all downloaded release digests, four ZIP entries and source/build files (normalized line endings).

Published: https://github.com/remriel/morning-pages-analytics/releases/tag/0.5.1. No required steps remain. Native Obsidian settings interaction remains unverified.

## Current objective: publish 0.5.0

**Progress toward verified publication: 100%.** `[##########]`

- [x] Confirm clean working tree, synchronized source, and version 0.5.0 in manifest/package/lockfile.
- [x] Review existing eighteen passing tests and successful build; preserve the two-feature scope.
- [x] Prepare accurate release notes and use npm test/npm run build in release CI.
- [x] Read and summarize the newest Reddit comment about monthly journal notes; no feature change requested.
- [x] Push exact 0.5.0 tag; workflow 42952753325 passed all eighteen tests, npm run build, syntax and packaging checks.
- [x] Verify all nine release digests and four ZIP entries; direct plugin files match the source/build after line-ending normalization. Released manifest is 0.5.0.

Publication complete: https://github.com/remriel/morning-pages-analytics/releases/tag/0.5.0. Next optional check: native Obsidian settings layout. The latest monthly-note Reddit request is feedback only; implementation is not authorized in this task.

## Current objective: only the two requested Reddit features, 0.5.0

**Progress: 100%.** `[##########]`

- [x] Configurable daily goal across live tracker, history, calendar and streaks.
- [x] Additive custom words for every category, retaining built-in lists.
- [x] Local history recount and cache invalidation on word-list changes.
- [x] npm test: 18 passed; npm run build and syntax checks passed.
- [x] Version bumped to 0.5.0.

Implementation is complete. Publication is now authorized and tracked above. Native UI verification remains optional.

## Current objective: automatic recognition and format presets, 0.4.8

**Progress: 100%.** `[##########]`

- [x] Twelve presets, including written months, recognized together automatically.
- [x] Manual multiple-choice presets with simultaneous matching and custom formats.
- [x] Migration and ambiguity handling; sixteen tests, build, browser and syntax checks pass.
- [x] Publish 0.4.8; workflow 42921522984 passed and release assets were verified.

0.4.8 publication complete. Superseded by the 0.5.0 release above.

## Current objective: per-folder date source, 0.4.7

**Progress: 100%.** `[##########]`

- [x] Per-folder source and filename-format settings, persisted with backwards-compatible defaults.
- [x] Automatic history reorganization when switching sources.
- [x] Twelve tests, browser regression, build and syntax checks passed.
- [x] Publish 0.4.7; CI 42920698666 passed and release files/ZIP are present.

Next optional check: verify source switching in native Obsidian.

## Current objective: creation-date folder history and practical settings, 0.4.6

**Progress: 100%.** `[##########]`

- [x] Additional-folder notes accept any filename and use creation dates.
- [x] Daily Notes remain included by filename date; editing other notes does not move their day.
- [x] Add format override, subfolder toggle, default range, and creation-order settings.
- [x] Migrate cache and preserve folder preferences.
- [x] Eleven tests, browser regression, build, syntax check, and diff check passed.
- [x] Publish 0.4.6; workflow 42903207649 passed and all plugin files and installation ZIP are present.

Next optional check: exercise settings in native Obsidian. Publication is complete.

## Current objective: publish timestamp ordering and automatic folder refresh in 0.4.5

**Progress toward verified publication: 100%.** `[##########]`

- [x] Order same-day notes by modification timestamp, newest first.
- [x] Refresh history automatically after added-folder edits; debounce typing.
- [x] Fix nested folder date matching.
- [x] Nine local tests, build, and syntax check passed.
- [x] Publish 0.4.5; workflow 42901878803 passed and release assets include the installation ZIP and direct plugin files.

Next optional check: use multiple folders in native Obsidian and confirm automatic refresh and same-day order.

## Current objective: release multiple writing folders in 0.4.4

**Progress toward verified publication: 100%.** `[##########]`

- [x] Add and remove multiple folder rows in settings.
- [x] Migrate existing single-folder data and use the list throughout history indexing.
- [x] Add matching and normalization test; update README and release copy.
- [x] Run eight tests, build, and syntax check.
- [x] Publish tag 0.4.4; release workflow 42899490865 passed and direct plugin assets and installation ZIP are present.

Next optional check: exercise multiple folder rows in native Obsidian. The local eight tests, build, syntax check, and release CI passed.

## Current objective: publish custom folder option in 0.4.3

**Progress toward a verified, published release: 95%.** `[#########-]`

- [x] Reconcile with the 0.4.2 source and preserve the older dirty checkout.
- [x] Add a custom folder setting that includes matching dated notes alongside Daily Notes.
- [x] Add date matching tests, update documentation and release copy.
- [x] Run seven tests, build, and syntax check.
- [x] Publish 0.4.3 and verify GitHub release assets; workflow 42886647933 passed.
- [ ] Verify the setting in native Obsidian if available.

Next: verify setting and index changes in native Obsidian when available. Seven tests, build, syntax check, and release CI passed.

## Current objective: preserve dashboard position

**Progress toward a verified, published fix: 100%.** `[##########]`

- [x] Reconcile the current source with the installed 0.4.1 release and preserve the older dirty checkout.
- [x] Identify full dashboard redraw and asynchronous vocabulary rendering as causes of disruptive scrolling.
- [x] Preserve scroll and keyboard focus on history updates, including delayed vocabulary rendering.
- [x] Add regression coverage and verify interactions with synthetic data in desktop and narrow browser layouts.
- [x] Install and verify the fixed build in Remy.
- [x] Publish and verify GitHub release 0.4.2.

All six tests pass, including browser checks for desktop and narrow layouts; native Obsidian retained scroll position and calendar focus, with no captured errors. The release workflow passed, and the release files and ZIP matched GitHub's SHA-256 digests. Remy has the exact released files. The shared AI Brain vault was unavailable at both configured paths. Next: no required steps; optionally check the experience in mobile Obsidian.

## Previous 0.4.1 objective

Publish Morning Pages Analytics 0.4.1 as a standalone MIT licensed Obsidian plugin with local analysis and automatic Daily Notes history.

**Progress toward the verified 0.4.1 release is 100%.**

`[██████████]`

## Checklist

- [x] Active-note charts for feelings, topics, four mindset pairs, time, senses, and pronouns.
- [x] Live note cloud and date-filtered word clouds with exact word-frequency counts.
- [x] Daily Notes startup backfill and save/create/rename/delete history updates.
- [x] Dashboard ranges, custom dates, word totals, streaks, trends, calendar, day inspection, and previous-period comparison.
- [x] Local cache schema version 2 stores numeric analysis and note metadata only.
- [x] Five unit tests pass.
- [x] GitHub upstream workflow reconciled to the exact unprefixed `0.4.0` manifest tag; direct assets and ZIP prepared.
- [x] Verify the new build in a simulated Obsidian runtime and confirm native cache rebuild after installation.
- [x] Publish the stable release and verify the four downloadable assets.
- [x] Add stats and history screenshots, the GitHub banner, and the MIT license.

## State at the 0.4.1 release

0.4.1 was installed and published as a stable GitHub release. [Release 0.4.1](https://github.com/remriel/morning-pages-analytics/releases/tag/0.4.1)

## Verification

- Five automated unit tests pass.
- The synthetic integration harness exercised the note and history views, charts, filters, exact keyword aggregation, and save/delete/reload events.
- Native Obsidian loaded the installed build and rebuilt its Daily Notes index using cache schema v2.
- The 0.4.1 release workflow passed. The plugin files, four ZIP entries, and four visual assets matched the committed versions by SHA-256. [Release 0.4.1](https://github.com/remriel/morning-pages-analytics/releases/tag/0.4.1) · [Release workflow](https://github.com/remriel/morning-pages-analytics/actions/runs/42725229060)
- Language signals count literal English word cues. They do not interpret context, negation, sarcasm, or other languages semantically.
- Pace appears only when the open stats view observed enough editing activity to measure added words per minute.

## Historical next steps for 0.4.1

1. Run **Open writing history** to browse indexed Daily Notes and selected ranges.
2. For future releases, update the version, build the plugin, and push the tag matching the manifest version.




## 0.6.6 audit

Implementation and regression checks prepared. Next: verify CI and published downloads.
Verified release 0.6.6 - 100%. Local suite passed. GitHub release workflow 44390203734 passed. All 9 published downloads passed digest and attestation verification. Publication complete.
