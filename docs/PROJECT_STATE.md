# Project State

## Objective

Build a standalone Obsidian plugin, **Morning Pages Analytics**, that reproduces all per-entry analytics from current 750words.com V2 1:1 on identical inputs.

## Current status

- [x] Reviewed public first-party documentation and a supplied current V2 stats-page capture.
- [x] Built a 0.1.0 test plugin with a 750-word indicator and saved-Stats-HTML replay.
- [x] Node build and syntax checks passed.
- [x] Verified authentic saved-page replay in a DOM harness. All nine chart geometries, the cloud terms and displayed sizes, the timing row, the entry header, and the word count matched the capture.
- [ ] Obsidian 1.15.0 opened the disposable test vault. Native plugin activation awaits the test vault's trust prompt.
- [ ] Exact fresh-analysis parity remains blocked by unavailable server-side scoring implementation and full reference rules/data.

## Architecture and implementation

- Current V2 analytics are computed by 750 Words’ authenticated Rails backend. The frontend receives `analysis.report.custom.results`, `wordcloud`, dictionary category descriptions, metadata, and optional summaries.
- The supplied current stats-page capture presented five SVG bar charts for feelings, topics, time orientation, primary sense, and pronouns; four mindset donut charts for introvert/extrovert, positive/negative, certain/uncertain, and thinking/feeling; pace and distraction details; points and badges; an optional AI area; a word cloud; and the entry. No raw scored JSON was present in Nuxt hydration. That capture had no pace SVG.
- `src/plugin.js` reads the open Markdown note body via Obsidian's `getFrontMatterInfo` and provides `Load saved Stats HTML` independently of the word-goal count. When a saved page contains entry text and a note is open, the view compares both with normalized whitespace. `src/snapshot.js` counts whitespace-separated text and imports allowlisted text and SVG nodes from a detached HTML template. The view keeps the reference in memory.
- `scripts/build.cjs` bundles the source files into `main.js`. The manifest and stylesheet complete the Obsidian plugin package.
- The test build replays authentic saved Stats HTML and tracks the writing goal. Fresh 750 Words scoring remains open.
- Exact pace and distraction parity requires matching edit timestamps. Points and badges can also depend on the starting account history.
- The word-goal counter uses trimmed, collapsed browser whitespace tokens. The V1 FAQ names the Regressive Imagery Dictionary (RID), but that does not establish the full current V2 method. Current visible V2 categories also include topics, time orientation, sense, pronouns, and mindset dimensions.

## Constraints and open questions

- Public documentation does not disclose V2 scoring rules, the complete category/dictionary set, thresholds, or model/version details.
- Required next evidence is an authorized V2 backend implementation or full rules/dictionary, plus controlled matched inputs and raw reference outputs for every analytic category and behavior-derived metric.
- Keep journal content, user-specific results, local capture paths, and private details out of project docs, package contents, and fixtures.

## Compatibility and verification

- Obsidian exposes `getFrontMatterInfo` starting at 1.5.7. The manifest uses that minimum. Desktop startup was observed on 1.15.0 in a disposable profile.
- The real saved page used `#entry-stats` and `#entry-editor`. A class-only selector passed the synthetic fixture and rejected the actual capture. The importer accepts either selector form.
- The environment rejected the remote-debugging launch. The Windows computer-use skill reserves Obsidian's vault trust prompt for the user. Isolated DOM tests exercised saved-page behavior while native activation remained pending.

## First-party sources

- [750 Words V2 homepage](https://v2.750words.com/) — public description of per-entry feelings, themes, and mindset stats.
- [750 Words FAQ](https://original.750words.com/faq) — V1 RID description and behavioral-statistics context.
- [A new way to share stats](https://community.750words.com/c/blog/a-new-way-to-share-stats) — founder describes opt-in, per-entry selective sharing; a public sample page was blocked by Cloudflare in this environment.
- [Working on 750 Words V2](https://medium.com/750-words/working-on-750-words-v2-321a7284153c) — founder’s V2 goals and English-only analysis limitation noted in 2019.

## RESUME HERE

Once the test vault has been trusted by the user, open a synthetic note and run **Open 750-word stats panel**. Check 749 to 750 to 751 and load the saved Stats HTML. For exact new-note analytics, obtain authorized access to the current scoring implementation or complete rule and dictionary set, together with controlled matched inputs and raw reference outputs.
