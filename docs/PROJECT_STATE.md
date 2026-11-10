# Project State

## 2026-11-10: per-folder date sources, 0.4.7

- User needs imported Ledger journal entries dated by titles rather than filesystem import times. Each additional folder now offers creation timestamp or formatted filename, with optional format (blank inherits Daily Notes format).
- `folderDateRules` persists rules keyed by normalized folder path. Existing folders default to creation mode; path edits carry their rule. Daily Notes keep precedence; the deepest matching additional folder wins. Filename mode never falls back to timestamps. Both relative-path formats and nested dated basenames are supported.
- All indexing paths pass the rules; switching source refreshes and changes cached dates. Twelve tests pass, including switch/rebuild persistence, nested folders, overlapping rules, and invalid-title exclusion. Build, syntax and browser regression pass.

## RESUME HERE (0.4.7)

0.4.7 published at https://github.com/remriel/morning-pages-analytics/releases/tag/0.4.7. CI 42920698666 passed and release files/ZIP are present. Native settings UI remains unverified. For Ledger choose Formatted filename and supply its title format, or leave blank if it matches Daily Notes.

## 2026-11-10: creation-date folder history and settings (0.4.6)

- User clarified that additional folders must accept arbitrary filenames and use creation timestamps for calendar placement. Modification timestamps must never determine history dates. Daily Notes remain the default, matched by filename date; that matching takes precedence for overlapping folders.
- `includedDate` uses local calendar dates from Obsidian `file.stat.ctime` for Markdown files in additional folders. Missing/invalid creation times are skipped, with no modification-time fallback. Templates are excluded. Same-day order uses creation time.
- Cache schema 3 rebuilds the previous index and persists creation timestamps. Existing folder settings migrate. Modification times only invalidate analysis content, so ordinary edits do not move entries between days.
- Settings provide Daily Notes format override, include subfolders, default range, and creation-time order. Added-folder edits automatically refresh after 450 ms; settings save immediately to avoid losing a pending edit on unload.
- Eleven tests pass, including a plugin runtime test of migration, indexing arbitrary names, edit date stability, format override, subfolder filtering, and folder removal. Browser scroll checks, build, and syntax check pass. Native Obsidian settings UI remains unverified.
- Filesystem creation dates can be reset by copy/sync operations; original authored dates cannot be reconstructed from filenames with arbitrary names. Do not claim original creation-date recovery.

## RESUME HERE (0.4.6)

0.4.6 is published: https://github.com/remriel/morning-pages-analytics/releases/tag/0.4.6. Workflow 42903207649 passed; direct files and installation ZIP are present. Native settings interaction remains an optional follow-up.

## 2026-11-10: timestamp ordering and folder refresh for 0.4.5

- `src/history.js` sorts each day's note entries by modification timestamp descending, with path as a stable tie break. Calendar days still use filename dates in chronological order.
- Added folder changes now refresh automatically after a 450 ms typing pause; removing a folder refreshes immediately. This avoids a full index rebuild on each keystroke.
- Fixed nested added-folder notes with ordinary dated basenames being skipped. Matching tries the full relative path first (for Daily Notes formats with subpaths), then the basename for nested notes.
- Nine tests, build, and syntax check passed locally. Release workflow 42901878803 passed and published the direct plugin files and installation ZIP at https://github.com/remriel/morning-pages-analytics/releases/tag/0.4.5. Native Obsidian interaction remains unverified.

## RESUME HERE (0.4.5)

0.4.5 is published and verified through local tests and release CI. Check the setting with multiple folders in native Obsidian when available.

## 2026-11-10: multiple writing folders for 0.4.4

- Settings now has Add folder and Remove controls for any number of vault-relative writing folders. `src/plugin.js` persists `customFolders`; loading migrates the prior `customFolder` string. `src/history.js` normalizes and deduplicates folder paths before matching dated notes. Daily Notes remain included.
- All backfill, live note, and incremental history paths use the folder list. Empty settings rows are ignored in persisted data. Folder matching still uses the Daily Notes date format and includes subfolders when that format matches.
- Eight local tests, build, and syntax check passed. The 0.4.4 GitHub release workflow passed and published the installation ZIP and direct plugin files: https://github.com/remriel/morning-pages-analytics/releases/tag/0.4.4. Native Obsidian interaction for multiple rows remains unverified.

## RESUME HERE (0.4.4)

0.4.4 is published. Next verification opportunity: add, remove, and migrate multiple folders in native Obsidian and confirm matching dated notes appear or disappear from history.

## 2026-11-10: additional writing folder for 0.4.3

- Writing history now includes an optional vault-relative custom folder alongside the configured Daily Notes folder. Both use the Daily Notes filename date format; custom subfolders follow the format too.
- `src/history.js` provides `includedDate`; `src/plugin.js` uses it for backfill, incremental updates, and the active note's history date. Plugin data persists `customFolder` with the existing numeric cache. Clearing the setting prunes custom records on rebuild.
- The settings control saves changes and refreshes history. Release 0.4.3 is published at https://github.com/remriel/morning-pages-analytics/releases/tag/0.4.3. CI passed and the ZIP and direct plugin files are present. Native Obsidian interaction for this setting remains unverified.
- The older checkout at `C:\Users\Gev\work\morning-pages-analytics` remains dirty and stale. Continue in this worktree.

## RESUME HERE (0.4.3)

The 0.4.3 release is published. Next verification opportunity: set and clear the custom folder in native Obsidian, and confirm matching dated notes appear and disappear from history.

## 2026-11-09: dashboard scroll fix for 0.4.2

- The 0.4.1 history view rebuilt its entire DOM on each selection, resetting its scroll position. The asynchronous word cloud could also shift the calendar later.
- `WritingHistoryView.draw` in `src/plugin.js` saves and restores the scroll position for all history redraws. Calendar controls restore keyboard focus, including at a month boundary.
- `src/dashboard.js` reuses the existing cloud when the range is unchanged and reserves its height while a new range loads. `showWords` anchors the lower section when cloud height changes, based on the user's current position. A draw generation rejects stale async results.
- `test/dashboard-scroll.test.cjs` and `test/fixtures/dashboard-scroll.html` exercise the real dashboard in desktop and narrow Chrome layouts, including selects, calendar navigation, day selection, redraws, delayed content, and stale requests. The test skips without a browser locally; release CI requires one via `MPA_REQUIRE_BROWSER=1`.
- The regression test fails against 0.4.1 (a signal change moved scroll position from 357 to 0) and passes against the fix. All six tests and build/syntax checks passed on Windows.
- Version 0.4.2 is installed and enabled in the Remy vault. Native Obsidian testing retained position across a signal change and previous-month navigation, retained calendar focus, and reported no captured errors. Note content was not recorded.
- The older checkout at `C:\Users\Gev\work\morning-pages-analytics` has unrelated uncommitted work. The 0.4.2 fix was prepared in a separate worktree.
- Shared AI Brain was unavailable at both configured paths. Do not infer that memory was loaded or saved.
- 0.4.2 is published; its GitHub Actions release workflow passed. The three installed Remy files and installation ZIP were verified against the release asset SHA-256 digests. The released files use LF line endings, so the downloaded release files were installed after verification.

## Objective

Maintain **Morning Pages Analytics**, a standalone MIT licensed Obsidian plugin for local writing analysis and automatic Daily Notes history. The current release is 0.4.2.

## Current status

- [x] Implement active-note stats and chart groups for feelings, topics, four mindset pairs, time orientation, senses, and pronouns.
- [x] Implement a live note cloud and date-filtered range word clouds with exact word-frequency counts.
- [x] Implement automatic Daily Notes indexing, range dashboard, calendar, date inspection, and previous-period comparison.
- [x] Five unit tests pass.
- [x] GitHub upstream release workflow fast-forwarded and reconciled to the manifest's exact unprefixed `0.4.0` tag. Three direct assets and a ZIP are prepared.
- [x] Pass the synthetic integration harness and verify native installation by the rebuilt v2 Daily Notes cache.
- [x] Add synthetic screenshots, GitHub banner, and MIT license.
- [x] Publish and verify the public 0.4.1 release and install ZIP.

## Architecture

- `src/plugin.js` opens the active-note stats view and history dashboard. It reads the Obsidian Daily Notes configuration, backfills matching notes at layout readiness, watches note changes, and updates the local index. **Refresh daily history** rereads configuration.
- `src/analysis.js` extracts prose from Markdown and counts words, paragraphs, sentences, literal English cue groups, and keywords. Groups cover feelings, topics, mindset, time, senses, and pronouns.
- The language cues are exact English word lists. Results are literal counts, not semantic interpretation. Context, negation, sarcasm, and non-English text can produce misleading or missing signals.
- The stats pane measures added words per minute only when it observes sufficient edit activity. If there is not enough observed activity, no pace estimate is shown.
- `src/history.js` reads and validates daily dates, groups entries, calculates range and previous-period summaries, and serializes numeric records using cache schema version 2.
- `src/dashboard.js` renders summary metrics, trend and composition charts, custom date ranges, comparison with the preceding period, the calendar, date drilldown, and word clouds with exact word-frequency counts.
- Persistent plugin data stores note paths, dates, file metadata, and numeric counts. It does not store note text or keywords. Word-cloud counts are rebuilt from note text and cached in memory for up to four date ranges.
- `scripts/build.cjs` bundles the source into `main.js`. `test/writing.test.cjs` contains the five unit tests.

## Release and provenance

The GitHub release workflow validates exact manifest tags. The `0.4.1` release is stable. The repository includes the MIT license. The release includes the three plugin files, `LICENSE`, the install ZIP, two synthetic screenshots, and the banner. ZIP entries and visual assets were verified against committed files. [Release 0.4.1](https://github.com/remriel/morning-pages-analytics/releases/tag/0.4.1)

A source ZIP linked in a prior chat could not be retrieved from this environment. The range word-cloud behavior was rebuilt from its specification. Public screenshots use synthetic Daily Notes.

## Known limits and verification

- Five unit tests pass, covering prose extraction and cue counts, keyword aggregation, configured Daily Notes matching, range and streak calculations, and cache validation.
- The synthetic Obsidian runtime verified the view commands, six analytic groups, four rings, timeline and composition charts, filtered word cloud, and automatic cache updates. Native Obsidian startup confirmed the v2 cache rebuild. Public screenshots render both views with synthetic data.
- Literal cue counts may not reflect meaning. Avoid claims of context-aware mood or topic understanding.
- Keep writing content and analytics local to the vault.

## RESUME HERE

0.4.2 is installed in Remy and published at https://github.com/remriel/morning-pages-analytics/releases/tag/0.4.2. The dashboard scroll fix passed browser and native desktop checks. Actual mobile Obsidian remains untested. Preserve automatic indexing, the note and range breakdowns, and MIT licensing in future releases.
