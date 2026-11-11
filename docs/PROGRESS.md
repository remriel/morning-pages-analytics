# Progress

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
