# 物件剧场：杯子有话说

## Goal and isolation
Build a playful co-creation experience: three personal objects become actors, a character challenges the director, and a choice visibly changes the story. This is a new independent project. Do not read or reuse existing local projects, including sibling directories or the abandoned tutorial MVP. All references are public or newly authored here.

## Architecture
Python standard-library loopback server + vanilla HTML/CSS/JS. Gemini vision/text writes a validated four-panel script using three uploaded object photos; a separate Gemini image request produces one coherent 2x2 comic artwork from those reference photos and the approved script. Chinese dialogue is rendered by the app, so image text accuracy is not a dependency. User choice is applied to a fresh script and image; sample mode uses explicitly pre-authored branches.

## Creative constraints
Meta is causal: an actor rejects an assigned stereotype and proposes an alternative role. The director chooses keep/revise, changing both panels 3–4 and the ending. Keep panels 1–2 as story continuity. Avoid a generic chat interface. No claims that objects are actually sentient, and no fake camera recognition or mock outputs labelled live AI. Maximum three objects, one stage, one protest, two endings.

## Privacy and quality
Keys remain in page memory or process environment; no secret/filesystem scanning. Images are not written to server disk. Explicitly disclose Google upload before generation. Default requests remain on loopback; restrict Host and Origin. Validate sizes, image signatures, JSON, cast IDs, panel counts, and user choices. Never render model text as HTML. Provider failure must not silently substitute a sample. Changing cast resets the story; stale responses never overwrite a new stage.

## Tests
Meaningful unit tests for input/response validation, provider request paths, invalid images, unavailable image output, branching continuity and mocked provider failure. Browser acceptance: sample entire flow, both ending choices, role assignment, export, reset, no-key error, narrow and wide layouts. Record live-provider limitations honestly.

## Design
Paper-white stage #fffdf8; theatrical pink #e74767; violet ink #342254; ticket yellow #f5d46c; muted violet #82748e. Large bold sans title, short handwritten-feeling speech bubbles using local cursive fallbacks. Main comic canvas provides structure; objects sit in a casting strip. Playful actor protest crosses a panel border; motion only on opening curtain and user-triggered protest, with reduced-motion support.

## Current release: static visual novel
The user-selected main product is now web/play/: the bilingual three-act comedy Who covers tonight. Keep path-derived character memories, undo and choice gates intact. presentation.js controls generated actor art; music.js controls opt-in, locally hosted CC BY music. No runtime AI, account or backend is needed. Preserve user progress and default audio off; do not autoplay on refresh. Credits must remain visible in the product and MUSIC-CREDITS.md. Validate reader, story, presentation and audio state transitions, then verify the actual Pages deployment. The earlier comic constraints above apply to that separate legacy feature.
