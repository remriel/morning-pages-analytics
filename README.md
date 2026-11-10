# Morning Pages Analytics

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

**Open writing history** shows 7, 30, 90, 365, All, and custom date ranges. The dashboard includes word totals, writing and goal streaks, tone and topic trends, language composition, a date calendar, day-by-day entry inspection, and a word cloud with exact word-frequency counts. Finite ranges can be compared with the preceding period.

## Local data

The v2 plugin cache stores note paths, dates, file metadata, and numeric analysis counts. It does not persist note text or keyword counts. Word-cloud counts are rebuilt from the selected notes and kept in memory for up to four date ranges.

## Build and install

Requires Node.js 22 or later.

```sh
npm run build
npm test
```

To install from the ZIP, extract its `morning-pages-analytics` folder into `.obsidian/plugins` in your vault. You can also copy the three release files into that folder. Restart Obsidian, enable **Morning Pages Analytics** in Community plugins, and run **Open writing history** from the command palette.

[Releases](https://github.com/remriel/morning-pages-analytics/releases)

## Screenshots

Screenshots below use synthetic sample writing.

![Live writing stats and matched English language cues](assets/screenshots/writing-stats.png)

![Daily Note history with date ranges, trends, and a range word cloud](assets/screenshots/writing-history.png)

![Release banner with sample word trends and writing cues](assets/github-banner.png)

## License

Morning Pages Analytics is released under the [MIT License](LICENSE).
