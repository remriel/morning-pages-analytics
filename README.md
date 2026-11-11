# Morning Pages Analytics

In plugin settings, **Daily word goal** accepts any positive whole number (default 750), including goals below 750. It updates the live tracker, history charts, calendar, completion totals and streaks.

Settings are organized into **Writing**, **Word lists**, **History**, and **Folders**. In **Word lists**, choose a group and a category to see its current **Base word list**. You can edit, add, replace or remove built-in terms. An empty base list disables those words for that category. **Extra words** keeps your additions separate; existing additions from earlier versions are preserved. **Restore defaults** restores only the selected category's built-in base list and keeps its extra words.

Enter words separated by spaces, commas or newlines. Matching ignores case, counts exact words, and does not double-count duplicates across the base list and extra words. Include word forms separately. Changes save automatically and reanalyze tracked history and the active note after a short typing pause. Everything is processed and stored locally in the vault. Folder settings use expandable cards. Settings use the available pane width, with full-width dropdowns that adapt to narrow panes and phone screens.

Morning Pages Analytics is an MIT-licensed Obsidian plugin for local writing analysis and Daily Notes history. Open a note to see its writing stats, or explore patterns across your daily notes.

![Morning Pages Analytics banner showing synthetic word trends, topics, and tone signals](assets/github-banner.png)

## See each note in more detail

**Open writing stats** opens the sidebar for the active note. It shows the word count and live word cloud, plus charts for:

- Feelings such as anxiety, affection, anger, surprise, sadness, joy, and pride.
- Topics such as growth, health, creativity, work, home, belief, people, money, relationships, loss, and conflict.
- Four paired mindset dimensions for social focus, positive/negative tone, certainty, and feeling/thinking.
- Past/present/future cues, five senses, and I/we/you/they pronouns.

The language signals use literal English word cues. They count listed words in the note; they do not understand context, negation, sarcasm, or other languages as semantic analysis would. Treat them as countable signals, not a definitive reading of intent.

Words added per minute is shown only when the stats pane observes enough editing activity to measure it. No pace estimate is shown otherwise.

## Explore patterns over time

The plugin reads the configured Daily Notes folder and date format. On startup it backfills matching notes, then updates its local index when notes are saved, created, renamed, or deleted. **Refresh daily history** rereads the Daily Notes configuration.

To include more folders, open **Settings â†’ Morning Pages Analytics â†’ Additional writing folders** and select **Add folder** for each vault-relative path, such as `Journal/Morning Pages`. Start typing a folder path to see matching folders from your vault, or enter a path manually. Choose **Automatic filename dates** to recognize twelve common formats together with no format entry, including `2026-09-13`, `September 13 2026`, `September 13, 2026`, `13 September 2026`, and `Sep 13 2026`. **Selected filename formats** provides twelve preset toggles, a Daily Notes format option, and optional custom formats (one per line); multiple formats are active simultaneously. **Creation timestamp** accepts any Markdown filename. Filename modes skip nonmatching or ambiguous dates without falling back to timestamps. For example, automatic mode skips `03-04-2026`; select only day-first or month-first to resolve it. Existing single-format rules migrate without changing their behavior. Changing sources automatically reorganizes history. Daily Notes retain filename-date precedence; for overlapping additional folders the most specific folder wins. Use **Remove** to stop tracking a folder.

Folder changes refresh writing history automatically after typing settles. Editing a note updates its analysis without moving its creation date. Nested subfolders are included by default. Settings also provide a Daily Notes filename format override (blank inherits Obsidian's format), an include-subfolders toggle, a default history range, and newest/oldest creation-time order within a day. Notes without valid creation timestamps are skipped rather than assigned a modification date. File copying or sync tools can reset filesystem creation timestamps; these dates reflect the timestamps reported by Obsidian, not reconstructed original dates.

**Open writing history** shows 7, 14, 30, 60, 90, 180, 365, All, and custom date ranges. The dashboard includes word totals, writing and goal streaks, tone and topic trends, language composition, a date calendar, day-by-day entry inspection, and a word cloud with exact word-frequency counts. Finite ranges can be compared with the preceding period.

## Local data

The local plugin cache stores note paths, dates, file metadata, numeric analysis counts, and a word-settings signature so edited lists trigger a recount. Preferences store your goal, edited base lists, and extra words in the vault's plugin data. Note text and keyword counts are not persisted. Word-cloud counts are rebuilt from the selected notes and kept in memory for up to four date ranges.

## Build and install

Requires Node.js 22 or later.

```sh
npm run build
npm test
```

The tests include a dashboard scroll regression in Chrome or Chromium when available. Release checks require a browser so that the dashboard is tested with real layout and scrolling.

To install from the ZIP, extract its `morning-pages-analytics` folder into `.obsidian/plugins` in your vault. You can also copy the three release files into that folder. Restart Obsidian, enable **Morning Pages Analytics** in Community plugins, and run **Open writing history** from the command palette.

[Releases](https://github.com/remriel/morning-pages-analytics/releases)

## Screenshots

Screenshots below use synthetic sample writing.

![Live writing stats and matched English language cues](assets/screenshots/writing-stats.png)

![Daily Note history with date ranges, trends, and a range word cloud](assets/screenshots/writing-history.png)

![Release banner with sample word trends and writing cues](assets/github-banner.png)

## License

Morning Pages Analytics is released under the [MIT License](LICENSE).

<a href="https://buymeacoffee.com/remriel"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy me a coffee" width="110"></a>
