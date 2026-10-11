# Soundtrack / 配乐署名

All three recordings by **Kevin MacLeod (incompetech.com)**, used under [Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/). Attribution is also visible in the game's expandable Music credits area. [Author's free attribution license option](https://incompetech.com/music/royalty-free/licenses/).

| Recording | Use | Official track page / ISRC | Local asset |
|---|---|---|---|
| Scheming Weasel (slower version) | Act I: absurd audition | [USUAN1100084](https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100084&Search=Search) | web/play/assets/music/audition.mp3 |
| Tea Roots | Act II: midnight snack; quiet ending | [USUAN1100472](https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100472&Search=Search) | web/play/assets/music/snack.mp3 |
| Carefree | Act III: opening night | [USUAN1400037](https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1400037&Search=Search) | web/play/assets/music/curtain.mp3 |

Downloaded from the author's official catalog, 2026-10-11:

- https://incompetech.com/music/royalty-free/mp3-royaltyfree/Scheming%20Weasel%20slower.mp3
- https://incompetech.com/music/royalty-free/mp3-royaltyfree/Tea%20Roots.mp3
- https://incompetech.com/music/royalty-free/mp3-royaltyfree/Carefree.mp3

**Changes:** re-encoded to 96 kbps MP3 for web delivery; no cutting or rearranging the compositions. Playback loops recordings and sets a low adjustable volume. Original files total 22,442,406 bytes; deployed versions total 7,556,202 bytes. No paid music service, generation credits or runtime third-party audio requests.

## Behavior and acceptance

- Off on every new page or refresh, even after a prior enabled session; initial audio element has no source. Music loads only after an explicit click, and subsequent tracks only when reached while enabled.
- Same-act dialogue does not restart the track. Act changes and rewind/skip recompute the appropriate cue. Quiet final seating returns to Tea Roots.
- At `silence` and `playerFreeze`, music pauses as part of the joke, with a visible explanation. The next beat resumes it when still enabled.
- Background tabs pause; returning resumes only if the player had enabled music. Manual off always stays off.
- Default volume 18%, range 0–50%. Only volume preference is persisted. Playback/storage errors don't block the story and playback errors offer retry.
- test_music.js covers opt-in/lazy loading, cue changes, no per-line reload, silence, hidden page, mute, slider limits, fresh-page off, rejection and media-error recovery, and unavailable storage.
- Existing story, presentation and reader tests pass. Local real-browser test: no source/time zero before click; after click playback reached 10.47 seconds and media duration 110.92 seconds; mute paused, refresh restored story but left music off.

The controller and browser media state establish playback, not subjective musical quality. No independent listening panel or seamless loop-boundary assessment has been conducted.
- Additional local browser check: all three acts selected their respective recording while playing; `playerFreeze` paused audio at 18.65 seconds, selecting a response resumed it; browser error log empty.
