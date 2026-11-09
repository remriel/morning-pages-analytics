# Project State

## Objective

Deliver **Morning Pages Analytics 0.4.0**, a standalone Obsidian plugin for local writing analysis and automatic Daily Notes history.

## Current status

- [x] Implement active-note stats and chart groups for feelings, topics, four mindset pairs, time orientation, senses, and pronouns.
- [x] Implement a live note cloud and date-filtered range word clouds with exact word-frequency counts.
- [x] Implement automatic Daily Notes indexing, range dashboard, calendar, date inspection, and previous-period comparison.
- [x] Five unit tests pass.
- [x] GitHub upstream release workflow fast-forwarded and reconciled to the manifest's exact unprefixed `0.4.0` tag. Three direct assets and a ZIP are prepared.
- [x] Pass the synthetic integration harness and verify native installation by the rebuilt v2 Daily Notes cache.
- [ ] Publish and verify the release assets.

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

The upstream GitHub release workflow was incorporated and now validates exact manifest tags. The three direct plugin assets and the ZIP are prepared.

A source ZIP linked in a prior chat could not be retrieved from this environment. The range word-cloud behavior was rebuilt in the current source instead.

## Known limits and verification

- Five unit tests pass, covering prose extraction and cue counts, keyword aggregation, configured Daily Notes matching, range and streak calculations, and cache validation.
- The synthetic Obsidian runtime verified the view commands, six analytic groups, four rings, timeline and composition charts, filtered word cloud, and automatic cache updates. Native Obsidian startup confirmed the v2 cache rebuild. Desktop interaction is covered by the simulated view test.
- Literal cue counts may not reflect meaning. Avoid claims of context-aware mood or topic understanding.
- Keep writing content and analytics local to the vault.

## RESUME HERE

Push the `0.4.0` tag, watch the release workflow, then verify that the release includes `main.js`, `manifest.json`, `styles.css`, and the ZIP. Use **Open writing history** for a native visual check.
