# Refresh and cache recovery fixes

- Queue refresh requests received during an active scan, preserving forced refreshes and retries after a failed scan.
- Retry a transient cache-save failure even when the next refresh finds unchanged notes.
- Preserve the excluded-folder support added in 0.6.0.

Regression and browser tests use synthetic notes. Native Obsidian remains unverified.
