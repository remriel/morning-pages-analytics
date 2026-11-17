# Morning Pages Analytics 0.6.3

This release reduces long uninterrupted work during history refreshes and live writing updates.

- Large-vault scans and vocabulary reads yield between batches so Obsidian can process other work.
- Folder event updates are handled in batches, and history redraws only when records change.
- Live analysis is debounced to 300 ms and reuses results when the active note and analysis preferences are unchanged.
- Saving a history range keeps the existing vocabulary cache.

Note text and saved analysis are unchanged by range selection. Native Obsidian performance has not yet been measured on a personal vault.
