# Progress

## Objective

Recreate the current 750words.com per-entry Stats analysis in a standalone Obsidian plugin, with identical outputs for identical writing and session inputs.

**Estimated progress toward verified 1:1 parity is 30%.**

`[███░░░░░░░]`

## Checklist

- [x] Identify the current per-entry Stats sections from the saved V2 page and public frontend behavior.
- [x] Build a local Obsidian sidebar with a live 750-word goal and offline Stats HTML replay.
- [x] Build the bundle and run the word-count and import-limit unit checks.
- [x] Verify the real saved-page replay against the source chart geometry and displayed results.
- [ ] Verify threshold and import behavior in an isolated desktop Obsidian vault after trust is granted.
- [x] Package the 0.1.0 test ZIP and verify its three files against the source build.
- [x] Synchronize the source to private GitHub.
- [ ] Obtain the complete current scoring rules or authorized access to an equivalent scoring engine.
- [ ] Verify every analytic output against controlled matching 750 Words inputs and results.

## Current implementation

Version 0.1.0 reads the open Markdown note and shows word progress. It can replay visible analytics and compare the note to the entry text in a manually selected V2 Stats HTML file. The plugin creates local text and chart elements from an allowlist. The imported capture lives in memory while the view is open.

## Blocker

The current service computes category scores and associated words on its server. A saved Stats page provides rendered results. Full local scoring requires the current implementation or complete rules and dictionaries, plus reference outputs for text and behavior inputs.

## Verification

- `node scripts/build.cjs` and `node --check main.js` passed.
- `node --test` passed three tests covering 749, 750, and 751 words, whitespace and punctuation, and the HTML size limit.
- A local jsdom harness matched all nine saved chart geometries, cloud terms and sizes, the timing row, entry header, and saved entry count. It verified that the replay excludes the note body and executable or network-linked elements.
- Obsidian 1.15.0 reached the test vault trust prompt with the plugin files staged. The execution policy rejected the automated remote-debugging launch.

## Next steps

1. Package the verified test build and sync the source to the private repository.
2. After the user handles the test vault's trust prompt, check the live sidebar and replay in desktop Obsidian.
3. Obtain authorized V2 scoring inputs, implementation details, and expected outputs, then resume independent implementation.
