# Morning Pages Analytics

An Obsidian test plugin for tracking a 750-word writing goal and replaying analytics from a saved 750 Words Stats page. Exact scoring for new notes requires 750 Words’ current server-side rules and reference outputs. [Project state](docs/PROJECT_STATE.md) · [Parity notes](docs/PARITY.md)

## Build

Requires Node.js 22 or later.

```sh
node scripts/build.cjs
node --test
```

The build creates `main.js` beside `manifest.json` and `styles.css`.

## Install in an isolated vault

1. Create a separate test vault in Obsidian and use a synthetic Markdown note.
2. Extract the test ZIP into the test vault’s `.obsidian/plugins` directory. For a source build, create a `morning-pages-analytics` folder there and copy in `manifest.json`, `main.js`, and `styles.css`.
3. Confirm the three files are inside `.obsidian/plugins/morning-pages-analytics`.
4. In Obsidian, open Settings, then Community plugins. Enable community plugins if needed, reload plugins, and enable **Morning Pages Analytics**.
5. Open a synthetic Markdown note and choose **Open 750-word stats panel** from the command palette, or use the plugin ribbon icon.

## Manual checks

1. Check that the panel follows the active Markdown note and displays progress toward 750 words.
2. Put YAML frontmatter in a synthetic note and confirm the count uses the body. The rest of the Markdown is counted as plain text using whitespace-separated tokens, including any literal Markdown markers.
3. Check the 749-word and 750-word boundary with synthetic text. The goal indicator changes at 750.
4. Select **Load saved Stats HTML** and import a saved, single-entry 750 Words Stats page. This works regardless of the open note’s word count. If the open note and imported page both contain entry text, the panel compares them after trimming and collapsing whitespace.
5. Confirm the saved report is displayed, then use **Clear reference**. The selected HTML is parsed locally in memory. Closing the panel clears the reference.

The expected Stats page structure is based on the rendered V2 page described in the [750 Words V2 homepage](https://v2.750words.com/). The [V1 FAQ](https://original.750words.com/faq) documents RID for the earlier version; it does not provide the current V2 scoring rules. The founder’s [stats-sharing announcement](https://community.750words.com/c/blog/a-new-way-to-share-stats) describes per-entry opt-in sharing, but does not disclose scoring.

## Limits

New-note analytics require authorized access to the scoring implementation or complete current rules and dictionaries, plus controlled reference inputs and raw outputs. Pace and distraction analytics also require edit timestamps. See the verification status in [Progress](docs/PROGRESS.md).
