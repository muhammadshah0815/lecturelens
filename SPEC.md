# LectureLens — "Ask-first" prototype (SPEC)

> Source of truth for this prototype. Keep later work consistent with this file.

I'm building one of three A/B/C prototypes for a grad PM course (Duke EGRMGMT 512). It must be a live, clickable web prototype that someone can use with zero explanation. It is a prototype of ONE slice of the product, not a full app.

## PRODUCT
LectureLens, a course-review tool for university students. Pilot course: **"Personal Finance Fundamentals" (FIN 101), Fall 2026** — changed from the original "Foundations of Machine Learning" to an easier, universally relatable subject (see CONTENT). Answers come only from that course's lectures, slides, readings and the student's own notes, via a university-hosted "Campus AI".

## MY VERSION: "Ask-first"
- **Hypothesis:** students start review from a specific confusion, not from "which lecture". They'd rather type what they're stuck on and be taken straight to the exact moment the instructor explained it (video clip first, short AI recap second) than browse a workspace.
- **What we learn:** do students value "find me the moment" more than "explain it to me"?
- **Success signals:** time to first useful answer, % of answers where the student plays the moment, % marked "got it".

## DO NOT BUILD
(Another teammate has this; mine must look and feel different.) A three-column layout, a lecture list home page, a "continue reviewing" resume card, a worked-examples tab, a saved-explanations page. Mine is a single centered conversation column with a slide-over evidence drawer.

## CORE FLOW
1. **Landing:** one big input, "What are you stuck on?", with 4 suggested question chips, course name, and a small "Campus AI · runs on university servers" badge. No lecture list.
2. **Submit a question** and get an answer card containing, in order:
   a. **"Best moment":** a mini lecture player cued to the exact start of the instructor's explanation (title, week, start–end timestamps, one line on why it matches, Play button, live captions).
   b. **"Quick recap":** 2–3 sentences, every claim followed by a clickable source chip (Slide 23, 18:40, My note).
   c. **"Also see":** up to 2 other moments.
   d. **Follow-up chips**, plus "Explain differently" (simpler / with numbers / with an analogy).
   e. **"Got it" / "Still stuck"** buttons.
3. Clicking any source chip opens a **right slide-over drawer** showing the slide, the transcript around that timestamp, or the note.
4. **"Still stuck"** items persist (localStorage) and appear on the landing as "Still stuck on 2 things" for the next visit.
5. **Out-of-scope** questions (e.g. "explain transformers") get an honest "not covered in this course" answer with no guessing. If it's covered in another week, say which week and link to it.
6. **Notes are optional:** a settings sheet with a pre-filled sample note "Week 6 class notes" and a toggle for whether the AI may use it. A "My note" chip appears in recaps only when the toggle is on.

## TECH
- Vite + React + TypeScript + Tailwind. No backend, no login, no API keys. Everything runs client-side. State in React + localStorage. Must work on cold load in a fresh browser.
- The "AI" is a scripted answer engine (intent matching with keyword scoring and fuzzy fallback), not a real API call. Small footer: "Concept prototype: sample course content, scripted answers."
- No real video. Simulated lecture player: a 16:9 stage that renders the current slide as HTML plus an instructor silhouette, a scrubber, play/pause driven by a timer, and captions synced to transcript data.

## CONTENT (realistic, correct — no lorem ipsum)
Course changed (step 2) from ML to **Personal Finance Fundamentals** so any classmate can follow it. Same structure as the original spec.
- 8 weekly lectures: 1 money basics & goals, 2 budgeting, 3 banking & emergency funds, 4 credit scores & cards, 5 student loans & debt, 6 compound interest, 7 investing basics, 8 taxes & your paycheck.
- **Week 6 (Compound Interest) is the deep one:** 48:30 long, 8 slides, 30 timestamped transcript segments, and a step-by-step derivation of A = P(1 + r)ᵗ (slide 5, 18:40): P(1 + r) → P(1 + r)² → P(1 + r)ᵗ.
- **Numeric examples (verified):**
  - $1,000 at 10%: simple → $1,300 after 3 yrs, $4,000 after 30; compound → 1,100 / 1,210 / 1,331, $17,449.40 after 30.
  - Rule of 72: 6% → 12 yrs (1.06¹² ≈ 2.01). 12% yearly → $1,120.00 vs monthly → $1,126.83.
  - Ava ($2,000/yr ages 25–34, $20k in) vs Ben ($2,000/yr ages 35–64, $60k in), 7%, start-of-year deposits: $225,073 vs $202,146 at 65.
  - Against you: $1,000 at 24% APR (2%/month), 36 months unpaid → $2,039.89; APY 26.82%; 72 ÷ 24 = 3 yrs.
  - Inflation 3%, 10 yrs: $1,000 cash → ≈ $744 buying power; $1,000 at 5% → $1,628.89 nominal ≈ $1,212 real.
- 8 scripted intents for week 6 (what is compound interest, simple vs compound, the formula, why start early, Rule of 72, APR vs APY, credit card debt, inflation), 2 cross-week redirects (credit score → Week 4, what to invest in → Week 7), out-of-scope topics (crypto, stock picks, real estate, insurance), and the fallback.

## DESIGN
- Calm, academic, high contrast, big readable type (classroom projector). Navy text, teal accent `#0E7C86`, off-white background, Inter font. Generous whitespace, soft cards, no clutter, no gradients or stock "AI sparkle" overload.
- Desktop-first at 1280px, still usable on laptop and phone. Keyboard accessible with visible focus states.

## BUILD LOG
- **Step 1 (done):** spec saved, project scaffolded, design tokens, landing screen (input, chips, badge, empty state), typed data model, week 6 content.
- **Step 2 (done):** course switched to Personal Finance. Simulated lecture player (cued start, play/pause, scrubber with clip band + slide ticks, keyboard scrubbing, synced captions, clip-end stop + "Replay clip / Keep watching", 1×/1.5×/2×, CC toggle; one player plays at a time). "Best moment" card + "Quick recap" with source chips. Right slide-over evidence drawer (slide / transcript-around-timestamp / note views, back stack, Esc + backdrop close, focus trap, focus returns to chip, "Watch from here" drives the answer's player). Hardcoded test answer: suggestion chips get their own intent, anything else shows the formula answer. Dev-only `?slides` page shows all slides.
- **Step 3 (done):** scripted answer engine (`src/lib/engine.ts`): weighted keywords with stemming, synonyms and typo tolerance (Levenshtein), plus Dice similarity to example phrasings; stem-sharing keywords count once. Decision order: known out-of-scope topic → confident intent (score ≥ 2.5: answer or cross-week redirect) → other week's syllabus topic → honest no-match with "did you mean". Full answer card: Best moment, Quick recap with chips, Explain differently (simpler / with numbers / analogy; "with numbers" uses the Ava-vs-Ben and credit-card examples), Also see (loads into the player, with "Back to best moment"), Ask next chips, Got it / Still stuck (persists to localStorage, Still stuck opens Simpler), "Answering: …" line when the question was rephrased. 600ms "Finding the moment…" skeleton. Redirect, topic-redirect, out-of-scope and no-match cards. Short playable excerpts for Weeks 4 and 7. `npm run check:engine` runs 42 test questions (20 tuned, 12 held out, plus every scripted question).
- **Step 4 (done):** "Still stuck" items persist (`lecturelens:v1:stillStuck`) with the moment and playhead time; landing shows "Still stuck on N things" and each item reopens its answer at that time with Simpler open. Settings sheet ("My notes & data"): sample note, "AI may use my notes" switch (My note chips only when on), Clear my data with inline confirm.
- **Step 5 (done):** no-tour polish. First-run tips (play, sources, feedback) on the newest answer only, gone once used or dismissed, stored in `lecturelens:v1:hints`. Ask box explains empty/too-short questions (aria-invalid, role=alert) instead of a silently disabled button. Error boundaries per answer ("Try again") and app-wide ("Clear my data and reload"); stored data is shape-checked so damaged localStorage falls back to defaults; notice when the browser blocks storage; clip-unavailable message. Skip link; focus moves to each new answer; dialogs take focus on open (fixed: a visibility transition was blocking it). `npm run check:contrast` checks 32 colour pairs against WCAG AA (ask box border darkened to 3.56:1). Usage log (`src/lib/analytics.ts`, `lecturelens:v1:events`, local only) and hidden `?debug=1` panel with the success signals (median time to answer and to first useful action, % of answers with a clip that were played, % Got it / Still stuck, sources opened) plus Copy/Download JSON. DEMO.md: 2-minute path with in-scope, cross-week and out-of-scope questions.
- **Step 6 (done):** QA pass with Playwright (116 checks: demo path, every result type, persistence, damaged/blocked storage, keyboard-only pass with visible focus on every stop, focus traps, 1280/1024/390 with no horizontal scroll, zero console errors or warnings). Fixed: stale page title from the old course, debug panel covering content (now starts collapsed), dialogs not taking focus. Deployed to Vercel.
