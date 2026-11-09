const WORD_GOAL = 750;
const WORD = /[\p{L}\p{N}][\p{L}\p{M}\p{N}]*(?:[’'-][\p{L}\p{N}][\p{L}\p{M}\p{N}]*)*/gu;
const wordSet = (list) => new Set(list.split(" "));
const groups = (rows) => rows.map(([key, label, color, words]) => ({ key, label, color, words: wordSet(words) }));
const GROUPS = {
  feelings: groups([
    ["anxiety", "Anxiety", "violet", "afraid anxiety anxious dread fear fearful nervous panic panicked scared tense unease worried worry worrying"],
    ["love", "Affection", "pink", "affection appreciate care caring compassion hug hugs kind love loved loving tender warmth"],
    ["anger", "Anger", "red", "angry anger annoyed bitter furious frustration frustrated hate irritated outrage rage resent resentful"],
    ["surprise", "Surprise", "amber", "astonished disbelief shocked startling sudden surprise surprised unexpected unexpectedly wow"],
    ["sadness", "Sadness", "blue", "cry cried crying disappointed grief grief-stricken grieving heartbroken lonely loss melancholy miserable sad sadness sorrow tears unhappy"],
    ["joy", "Joy", "green", "amused cheerful delighted enjoy enjoyed excited fun glad happiness happy joy joyful laugh laughed smile smiled thrilled"],
    ["pride", "Pride", "orange", "accomplished achievement brave confidence confident courage earned empowered proud pride satisfied success triumphant"],
  ]),
  topics: groups([
    ["growth", "Growth", "green", "adapt change develop goal goals grow growth habit habits improve improvement learn learning practice progress recover reflect reflection skills"],
    ["health", "Health & rest", "red", "body doctor exercise fitness gym health healthy illness meditation nap pain rest running sleep slept tired walk workout yoga"],
    ["play", "Creativity & play", "amber", "art book books creative dance design draw film game games movie music paint photo play read reading story travel write writing"],
    ["work", "Work & learning", "orange", "boss class client code colleague deadline exam job learn learning meeting office project research school study team work working"],
    ["home", "Home & routines", "mint", "apartment breakfast clean coffee cooking dinner dishes food garden home house kitchen laundry lunch morning routine chores"],
    ["belief", "Belief & meaning", "violet", "belief beliefs church faith god gratitude meaning meditation pray prayer purpose religious ritual sacred soul spiritual"],
    ["people", "Family & friends", "blue", "brother child children dad family friend friends friendship mom parent parents sister together visit"],
    ["money", "Money", "indigo", "bank bills budget buy cost debt earn expense invest money pay rent salary save savings spend taxes"],
    ["intimacy", "Relationships", "pink", "affection attraction crush date dating divorce husband intimate intimacy kiss love marriage partner relationship romance wife"],
    ["loss", "Loss & mortality", "slate", "death died dying funeral grief grieving loss mourn mourning mortality passed remembrance"],
    ["conflict", "Conflict", "brick", "argument argue argued conflict confront debate disagree fight fighting fought tension threat violence war"],
  ]),
  mindset: groups([
    ["extrovert", "Extrovert", "amber", "we us our ours ourselves you your yours yourself friends group social team together"],
    ["introvert", "Introvert", "blue", "i i'm i've i'd i'll me my mine myself alone solitary solitude quiet"],
    ["positive", "Positive", "green", "accomplished amazing appreciate beautiful better calm cheerful confident delighted easy enjoy enjoyed excited glad good grateful gratitude great happy hope hopeful inspired joy kind laugh laughed love loved lovely optimistic peaceful proud relief relieved satisfied smile smiled success thankful warm wonderful"],
    ["negative", "Negative", "red", "afraid angry annoyed anxious ashamed awful bad bitter bored confused disappointed dreadful exhausted failure fear frustrated grief guilty hate helpless hurt lonely miserable nervous overwhelmed painful regret sad scared shame stressful struggle terrible tired upset worried worry worse"],
    ["uncertain", "Uncertain", "orange", "apparently doubt guess likely may maybe might perhaps possibly seem seems uncertain unclear unsure wonder wondering"],
    ["certain", "Certain", "violet", "always certain certainly clear convinced definitely exact guarantee know known must never obvious prove sure surely"],
    ["feeling", "Feeling", "pink", "afraid anxious angry emotion emotional emotions feel feeling feelings felt grateful happy joy love nervous sad worry"],
    ["thinking", "Thinking", "slate", "analyze assume believe consider decide estimate explain figure idea infer know logic opinion reason reflect remember think thinking thought understand"],
  ]),
  time: groups([
    ["past", "Past", "orange", "ago before did earlier formerly had last previously remembered used was were yesterday"],
    ["present", "Present", "green", "am are currently does feel feels has have is now present presently still today tonight"],
    ["future", "Future", "blue", "afterward future going hope intend later next plan planning shall soon tomorrow upcoming will"],
  ]),
  senses: groups([
    ["sight", "Sight", "amber", "bright color colors dark gaze glimpse glow light look looked looks observe saw see seen shadow sight visible watch"],
    ["sound", "Sound", "violet", "bang echo hear heard listen listening loud music noise quiet ring shout silence sound sounds voice whisper"],
    ["touch", "Touch", "pink", "cold cool feel felt grab grip heat hold hot pressure rough smooth soft texture touch warm"],
    ["taste", "Taste", "green", "bitter delicious flavor flavors salty savory sour spicy sweet taste tasted tasty"],
    ["smell", "Smell", "blue", "aroma fragrant odor perfume scent smell smelled smoky stink"],
  ]),
  pronouns: groups([
    ["i", "I", "blue", "i i'm i've i'd i'll me my mine myself"],
    ["we", "We", "green", "we we're we've we'd we'll us our ours ourselves"],
    ["you", "You", "amber", "you you're you've you'd you'll your yours yourself yourselves"],
    ["they", "They", "pink", "they they're they've they'd they'll them their theirs themselves he him his himself she her hers herself"],
  ]),
};
const PAIRS = [
  { key: "social", label: "Social focus", sides: ["extrovert", "introvert"] },
  { key: "tone", label: "Tone", sides: ["positive", "negative"] },
  { key: "confidence", label: "Certainty", sides: ["uncertain", "certain"] },
  { key: "approach", label: "Approach", sides: ["feeling", "thinking"] },
];
const STOP = wordSet("a about after all also am an and any are as at back be because been before being both but by can could did do does doing down each for from get going got had has have he her here him his how i i'm i've if in into is it it's its just like me more most much my new no not now of on once one only or other our out over really said see she so some than that that's the their them then there these they thing things think this those through time to too up us very was way we well were what when where which who will with would you your you're");

function prose(markdown) {
  let fence = null;
  return markdown.replace(/%%[\s\S]*?%%|<!--[\s\S]*?-->/g, " ").split(/\r?\n/).map((line) => {
    const marker = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (fence) {
      if (marker && marker[1][0] === fence[0] && marker[1].length >= fence.length && !marker[2].trim()) fence = null;
      return "";
    }
    if (marker) {
      fence = marker[1];
      return "";
    }
    return line;
  }).join("\n")
    .replace(/!\[\[[^\]\n]+\]\]|!\[[^\]\n]*\]\([^\n)]*\)/g, " ")
    .replace(/\[\[([^\]\n]+)\]\]/g, (_, link) => link.split("|").at(-1))
    .replace(/\[([^\]\n]+)\]\([^\n)]*\)/g, "$1")
    .replace(/(`+)[^`\n]+\1|https?:\/\/[^\s<>]+|<\/?[a-z][^>\n]*>/gi, " ");
}

function frequenciesOf(text) {
  const frequencies = new Map();
  for (const match of text.matchAll(WORD)) {
    const token = match[0].toLowerCase().replaceAll("’", "'");
    frequencies.set(token, (frequencies.get(token) ?? 0) + 1);
  }
  return frequencies;
}

function keywordsFrom(frequencies) {
  return new Map([...frequencies].filter(([word]) => word.length > 2 && word.length <= 64 && !STOP.has(word) && /\p{L}/u.test(word)));
}

function keywordCounts(markdown) {
  return keywordsFrom(frequenciesOf(prose(markdown)));
}

function rankKeywords(counts, limit = 40) {
  return [...counts].sort(([a, n], [b, m]) => m - n || a.localeCompare(b)).slice(0, limit);
}

function analyzeWriting(markdown) {
  const text = prose(markdown);
  const frequencies = frequenciesOf(text);
  const count = (set) => [...set].reduce((sum, token) => sum + (frequencies.get(token) ?? 0), 0);
  const hasWords = (part) => /[\p{L}\p{N}]/u.test(part);
  const breakdowns = Object.fromEntries(Object.entries(GROUPS).map(([name, group]) => [name,
    Object.fromEntries(group.map(({ key, words }) => [key, count(words)])),
  ]));
  return {
    words: [...frequencies.values()].reduce((sum, value) => sum + value, 0),
    unique: frequencies.size,
    paragraphs: text.split(/\n\s*\n/u).filter(hasWords).length,
    sentences: text.split(/[.!?…]+["'”’)]*(?=\s|$)|\n\s*\n/u).filter(hasWords).length,
    ...breakdowns,
    positive: breakdowns.mindset.positive,
    negative: breakdowns.mindset.negative,
    keywords: keywordsFrom(frequencies),
  };
}

module.exports = { WORD_GOAL, GROUPS, PAIRS, analyzeWriting, keywordCounts, rankKeywords };
