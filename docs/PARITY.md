# 750 Words V2 Parity

## Target

Reproduce **all** per-entry analytics from current 750words.com V2 1:1 on identical inputs. Approximate NLP, sentiment substitutes, and partial feature claims do not meet the target.

## Observed current stats surface

Inspection of a supplied current V2 stats-page capture found five SVG bar charts for feelings, topics, time orientation, primary sense, and pronouns; four mindset donut charts for introvert/extrovert, positive/negative, certain/uncertain, and thinking/feeling; pace and distraction details; points and badges; an optional AI area; a word cloud; and the original entry. No pace SVG was present in that capture.

These are observed interface dimensions rather than a complete definition of backend scoring. Public V2 copy describes “feelings, themes, and mindset.” The [V1 FAQ](https://original.750words.com/faq) names RID for emotional-content analysis. Do not assume RID alone explains every current V2 category.

## Display calculations observed in V2

| Display | Inputs from the server |
| --- | --- |
| Feelings and topics | Rank each displayed category by the first value in its result row. Sample terms come from the keys of the third value. |
| Introvert and extrovert | Compare first-person singular with the sum of first-person plural, second person, and third person. |
| Positive and negative | Compare positive and negative emotion scores. |
| Certain and uncertain | Compare certainty and tentativeness. |
| Thinking and feeling | Compare causality, insight, certainty, and inhibition added together with positive and negative emotion added together. |
| Time orientation, primary sense, and pronouns | Show past, present, and future; sight, sound, touch, and smell; and four pronoun groups. The third-person group combines singular and plural scores. |
| Words per minute and goal time | Round total words divided by the number of minute buckets. Round elapsed seconds to the first goal crossing to minutes for display. |

These calculations start with existing server results. For a reusable 1:1 fixture, capture both the raw rows and the rendered result from the same entry. [V2 Stats client](https://750words.com/_nuxt/DrsYQgab.js) · [V2 chart client](https://750words.com/_nuxt/B2D-I-5N.js)

## Test build behavior

- `Morning Pages Analytics` is a standalone Obsidian test plugin. Its 750-word goal uses trimmed, collapsed whitespace-separated tokens from the Markdown body. YAML frontmatter is excluded; the remaining Markdown is counted as plain text, without Markdown rendering or linguistic tokenization.
- `Load saved Stats HTML` is independent of the live count. It can replay a saved single-entry Stats page below or above 750 words. If an entry is open and both the note body and saved page contain entry text, the panel compares the two after trimming and collapsing whitespace.
- Import uses a detached template and copies only allowlisted text and SVG elements. The imported reference stays in memory for that view, is not written to the vault, and is not sent over the network. The panel clears the reference when cleared or closed.
- This build replays saved analytics; it does not score new notes. The current V2 scoring is computed on an authenticated Rails backend and is not available in the public docs reviewed.

## Verification status

- [x] Node build passed.
- [x] JavaScript syntax check passed.
- [x] The authentic saved-page DOM replay preserved all nine chart geometries, the word cloud, entry heading, timing text, and captured word count.
- [ ] Native plugin runtime awaits the vault trust prompt in a disposable Obsidian 1.15.0 vault.
- [ ] 1:1 parity for fresh analysis is blocked pending authorized backend implementation or complete rules/dictionary and raw reference outputs for controlled matched inputs.

Public evidence includes the [V2 homepage](https://v2.750words.com/) and founder’s [stats-sharing announcement](https://community.750words.com/c/blog/a-new-way-to-share-stats). Sharing is opt-in and selectable per entry, and word clouds were excluded from sharing at launch. This sharing policy does not document scoring. The founder’s [V2 notes](https://medium.com/750-words/working-on-750-words-v2-321a7284153c) also describe English-only linguistic analysis in 2019, not the present scoring implementation.

The founder explicitly posted a sample Stats URL, but its page content was blocked by Cloudflare in this environment. No login, token guessing, or bypass was attempted. The inspected capture rendered analytics but exposed no raw scored JSON in Nuxt hydration. No exhaustive V2 rule/dictionary set, versioning, thresholds, or score interpretation has been established.

Behavior-derived metrics require matching event and time history; points and badges also require account streak/history inputs. Final entry text alone is insufficient to validate those outputs.

The official connector retrieves entries and existing analytics from an archive. Its tools accept dates, filters, and archive search terms. A free-text scoring tool does not appear in the published interface. [750 Words MCP README](https://unpkg.com/750words-mcp@0.4.0/README.md)
