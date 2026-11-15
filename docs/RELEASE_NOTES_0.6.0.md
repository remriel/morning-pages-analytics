# Morning Pages Analytics 0.6.0

## Excluded folders

You can now leave folders out of writing history. Under **Settings → Morning Pages Analytics → Folders**, enter one vault-relative folder path per line in **Excluded folders**. Each path excludes Markdown notes in that folder and its nested folders, including Daily Notes and additional writing folders.

Changing exclusions refreshes history and removes excluded notes from history totals and word-cloud results. An open note in an excluded folder does not show live writing statistics. Removing a path makes eligible notes available to history again.

Enter paths with the same spelling and capitalization used in the vault.

## Verification notes

Local `npm run build` and `npm test` completed successfully. Across the individual test files, 22 tests passed and the two browser-only settings and history-scroll checks were skipped because Chrome or Chromium was unavailable. The plugin was not opened in a live Obsidian desktop or mobile app for this release candidate.

Morning Pages Analytics analyzes notes locally. Its language charts count literal English word cues and do not interpret context, negation, or sarcasm.
