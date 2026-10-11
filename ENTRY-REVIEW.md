# First-visit entry review · 2026-10-11

## Evidence and limits
The supplied critique identifies a plausible entry problem, not a measured retention funnel. Its 70/20/9/1% attrition estimates have no analytics behind them. The current release already has illustrated actor sprites, opt-in music and working first-to-second-act transitions; those older criticisms are not current defects. Do not fabricate social-choice percentages or promise ten minutes without timed playtests.

## Changes and acceptance
- Before: four Continue presses from the opening to the first Key choice. After: two choices on initial render, zero Continue presses required. No new welcome modal or start button.
- Opening now establishes the director role and offers reading the notice versus asking Eraser. Each yields a distinct immediate reply; asking Eraser also changes their second-act scene introduction. Later story branches remain intact.
- Show three-act format and approximately 60 dialogue beats. Graph traversal verifies complete routes contain 63–64 beats; this is not an estimate of reading time.
- Show act X / 3 with stronger contrast. Identify visible actors by bilingual nameplates and matching speaker colors; names keep identification independent of color.
- Migrate prior start→bar routes and undo backups through the preserved notice node without restarting. Existing story location, later decisions and undo remain intact. Keyboard advance and skip must not bypass the new opening choice.

## Verification
Reader, story, presentation and music suites pass. Story graph: 87 bilingual nodes, 3,072 paths to two final endings; 193 sampled routes exercised with rendering and language switches. The path count represents combinations, not distinct stories. Prior save and undo migration are tested explicitly.
Fresh browser at local port 8774: choices present at first load, actor-first reply appears on selection. At a 390×844 viewport both choices are 44px tall, end above y=645 and document width does not overflow. Desktop stage labels align with the three actors.

## Still unproven
Whether strangers stay longer or enjoy it more requires actual first-time playtests. The two opening options reconverge at the loading-bar scene; their payoff is dialogue and character memory, not a different ending. No new audience analytics or collection of personal data was added.
