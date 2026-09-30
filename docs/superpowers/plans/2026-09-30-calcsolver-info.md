# CalcSolver.info Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking. Independent math and game modules may be delegated under the executing-plans skill's agent guidance.

**Goal:** Build and verify the approved static CalcSolver.info replica.

**Architecture:** Astro renders static pages. Independent TypeScript modules drive the calculator, activities overlay and two local games. A public activity catalog snapshot powers external game embeds.

**Tech Stack:** Astro, TypeScript, plain CSS, Node built-in test runner.

## Global Constraints

- Canonical domain: `https://calcsolver.info`.
- Original reference: pale blue navigation, dark calculator, numeric Code Mode, dark activities directory.
- Code `0000` opens the directory; valid game codes open a game; invalid codes show a recoverable message.
- Keep 130 external activity records; add two local games, with actual per-source counts.
- Mathematical inputs never execute JavaScript; external embed addresses are validated against approved HTTPS hosts.
- Static output: `dist/`; no database, login or deployment credentials required to build.
- Desktop and 375px viewport must remain usable without document overflow.
- Third-party embedding and thumbnail availability are explicitly separate from local game verification.

## File Structure and Interfaces

- `src/layouts/Base.astro`: navigation, metadata, footer, global stylesheet.
- `src/pages/index.astro`: calculator and educational home page.
- `src/pages/category/[category].astro`, `src/pages/[slug].astro`: original educational content and information pages.
- `src/pages/games/2048.astro`, `src/pages/games/snake.astro`: local game shells.
- `src/components/Calculator.astro`, `src/components/Activities.astro`: accessible UI shells.
- `src/styles/site.css`, `src/styles/games.css`: reference appearance and local game visuals.
- `src/lib/calculator.ts`: exports `evaluateExpression(expression: string): number` and `formatResult(value: number): string`; degrees for trig; throws readable errors.
- `src/scripts/calculator.ts`: consumes math module, binds key buttons, keyboard and Code Mode; emits `calcsolver:open` with `{ code: string }`.
- `src/data/activities.json`: `{ code, name, iframe, thumb }[]` public catalog; 0000 excluded.
- `src/data/articles.ts`: `{ slug, title, category, description, kind, numerator?, denominator?, sections? }[]`.
- `src/scripts/activities.ts`: validates URLs, renders catalog, handles sources/search/player/escape, consumes `calcsolver:open`.
- `src/lib/game2048.ts`: pure board mechanics.
- `src/scripts/local-games.ts`: initializes the matching local game based on the DOM; keyboard/touch controls, scores and restart.
- `tests/calculator.test.ts`, `tests/game2048.test.ts`: mathematical and game behavioral tests.
- `scripts/check-build.mjs`: verifies static page coverage, local links, sitemap and canonical domain.
- `README.md`, `docs/deployment.md`: run/build, configuration and domain deployment instructions.

## Task 1: Functional Calculator

- [x] Add a mathematical behavior test suite. Representative acceptance cases:

```ts
assert.equal(evaluateExpression('2+3*4'), 14);
assert.equal(evaluateExpression('(2+3)*4'), 20);
assert.equal(evaluateExpression('sqrt(81)'), 9);
assert.ok(Math.abs(evaluateExpression('sin(30)') - 0.5) < 1e-12);
assert.throws(() => evaluateExpression('1/0'));
assert.throws(() => evaluateExpression('process.exit()'));
```

- [x] Run `node --test tests/calculator.test.ts` before implementing the module; confirm the missing-module failure.
- [x] Implement tokenization, precedence, supported functions/constants, finite-number checks and formatted results in the math module.
- [x] Run the same test command and require all tests to pass.
- [x] Build the Astro calculator component and bind inputs. Mode switch clears input; error codes preserve an actionable calculator view; document keyboard shortcuts ignore form controls and open overlays.
- [x] Verify `2+3*4=14`, `sqrt(81)=9`, `0000`, an existing activity code and invalid code recovery in browser.

## Task 2: Local Games

- [x] Define 2048 behavior tests for one-merge-per-move, score changes, unchanged boards and available moves.

```ts
const result = moveBoard([[2, 2, 2, 2], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], 'left');
assert.deepEqual(result.board[0], [4, 4, 0, 0]);
assert.equal(result.score, 8);
```

- [x] Run `node --test tests/game2048.test.ts` before the board implementation and confirm its missing-module failure.
- [x] Implement deterministic board movement separately from random tile creation and DOM rendering.
- [x] Implement 2048 and Snake pages with keyboard and mobile controls, score, best score and restart. Games run locally without external hosts.
- [x] Run board tests and verify both game pages in browser.

## Task 3: Static Site, Activities and Content

- [x] Create `package.json`, `astro.config.mjs`, `tsconfig.json`, `.gitignore` and shared layout. Build command is `astro build`; local command is `astro dev --host 127.0.0.1`.
- [x] Snapshot the observed public activity catalog; validate unique codes, required fields and allowed iframe hosts.
- [x] Render the directory with search by title/code, source selection, actual counts, thumbnail fallback and empty state. Two source choices represent the actual external catalog and local games.
- [x] Bind direct four-digit game codes; render loading, retry, external-link fallback, recommendations and back/exit behavior. Release iframe source when leaving the player.
- [x] Write the three educational categories and static pages for 12 percent/decimal topics, 12 equivalent-fraction topics and 7 algebra topics. Add About, Contact, Privacy and custom 404.
- [x] Add sitemap and robots with `.info` URLs, OpenGraph tags and correct per-page descriptions.
- [x] Implement homepage and overlay CSS matching the reference. Keep the original page structure, with a collapsible scientific keypad and functional additional controls.
- [x] Run `npm run build` and `node scripts/check-build.mjs`. Require valid local links, canonical and sitemap coverage.

## Task 4: Verification and Delivery

- [x] Run `npm test`, `npm run check` and `npm run build`.
- [x] Preview production output and test desktop and 375px layouts; save a visual preview artifact when supported.
- [x] Verify arithmetic, keyboard, Code Mode, lookup by code, searches including no-result state, source selection, game navigation, local gameplay and valid content routes.
- [x] Inspect browser errors and network-visible game state; report external embeds only to the level actually verified.
- [x] Document catalog configuration and static deployment to Cloudflare Pages or Vercel, including custom-domain prerequisite and contact-address configuration.
- [x] Provide the running preview URL, key local files, test results and account-dependent deployment boundary.

## Plan Review

The four tasks cover all approved pages, components, mathematics, external and local gameplay, responsiveness, metadata and deployment deliverables. Module interfaces are explicitly defined above. No runtime production credentials are assumed.
