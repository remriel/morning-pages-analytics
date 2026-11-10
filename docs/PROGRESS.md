# Progress

## Current objective: release multiple writing folders in 0.4.4

**Progress toward verified publication: 85%.** `[########--]`

- [x] Add and remove multiple folder rows in settings.
- [x] Migrate existing single-folder data and use the list throughout history indexing.
- [x] Add matching and normalization test; update README and release copy.
- [x] Run eight tests, build, and syntax check.
- [ ] Publish tag 0.4.4 and verify CI and release assets.

Next: complete local verification, commit and push, then publish and verify the release.

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
