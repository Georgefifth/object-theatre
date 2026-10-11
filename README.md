# Object Theatre / 物件剧场

Current release: **Who covers tonight? / 今晚谁来救场**, a three-act absurd tabletop visual novel. Rehearse with Cup, Key and Eraser; when you forget your opening, they return the lines and help you gave them. Chinese and English, instant dialogue, undo, read-back, browser autosave and safe read-only skipping.

[Play the visual novel](https://georgefifth.github.io/object-theatre/play/?lang=zh-CN) · [English](https://georgefifth.github.io/object-theatre/play/?lang=en) · [Competitive review and acceptance record](COMPETITIVE-REVIEW.md)

No account, key or backend is needed for the visual novel. One current route is saved in this browser; clearing site data removes it. Saved progress is not synced between devices or different site origins. Restart keeps the read record. Skip stops at new dialogue or choices, including changed relationship lines. Use Space/Right to advance and Left to go back, or the buttons.

The earlier interactive comic below remains available; its optional photo generator is a separate local-only experiment.

## Public preview

[Play online](https://georgefifth.github.io/object-theatre/) · [English](https://georgefifth.github.io/object-theatre/?lang=en) · [Validation record](VERIFICATION.md)

The GitHub Pages version runs an original, pre-authored sample in Chinese and English. No account, API key or model calls are required. Photo creation is **not available on Pages**: it cannot run the Python backend. The public preview hides photo upload and key entry.

Choose a language, play the sample, compare both endings, or expand the cast to swap parts and names. Download a standalone HTML play or use the browser print dialog. The page does not persist your work; export it before refreshing.

## Local photo creation

Python 3.10+, no third-party packages:

```bash
python3 server.py
```

Open `http://127.0.0.1:8770/`. Expand the cast to upload PNG/JPEG/WebP files up to 4 MiB each. Backstage accepts your Gemini key and model IDs in page memory; alternatively configure the process `GEMINI_API_KEY` environment variable. Do not commit credentials.

Generation sends the three reference images, names and roles to Google. It may incur API quota or charges. A validated script is generated first, then one four-panel image; dialogue is rendered separately. Chinese and English story output are supported. Changing the interface language preserves an existing live story in its original language. Branches preserve the first two panels. Artwork can be retried without another script request.

Stopping waiting aborts the browser request, but Google may still complete and charge for already submitted work. Uploaded photos and keys are not written to disk or browser storage. Refreshing loses the current play. The server is restricted to loopback and does not support remote hosting as configured.

Defaults: `gemini-2.5-flash`, `gemini-2.5-flash-image`; change them according to your account's available models. Live model quality, identity consistency, quota and latency have **not been tested end-to-end**. Never substitute the sample for a failed model request.

## Validation and deployment

```bash
python3 -m unittest -v
node --check web/app.js
node --check web/i18n.js
node test_comedy_story.js
node test_presentation.js
node test_reader.js
```

Tests use mocked model responses. The GitHub Actions workflow validates the server and JS and deploys only `web/` to Pages; no backend or credentials are published in the site.

See [research and prioritisation](RESEARCH.md), [design decisions](DESIGN.md), and [product scope](PRODUCT.md). Sources are public; this project was authored independently of local existing projects. An external Opus story review has not yet been completed.
