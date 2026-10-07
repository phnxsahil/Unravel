# Hero, scroll story and dark theme refinement

## What changed

- Footer watermark: 72–128px, rather than a container-wide 600px display. Footer links and description are 16px; labels and bottom row are 14px.
- Hero: one demo link opens `/projects/demo`. The preview shows a starting question, browser → API → SQLite path, actual `web/DraftEditor.tsx:8–12`, and a plain-language discovery. The highlighted save call is line 11. No simulated live AI result or extra inactive controls.
- Scroll story: all four source chapters remain. Desktop stage height adapts between 380 and 450px. Pinning now starts at 760px screen height, with a measured-fit fallback. Previously every desktop below 960px was manual. Short screens and reduced motion keep manual chapters; no wheel interception. Keyboard tabs, optional sound and reverse scrolling remain.
- Motion: chapter evidence enters horizontally over 400ms while the stage frame stays stable. The continuous scroll progress and selected chapter underline remain.
- Dark theme: charcoal background `#0c0d10`, surface `#141519`, elevated surface `#202126`, text `#f0f0f2`, neutral white borders. Accent remains a restrained cool highlight. Shared application tokens also make the workbench and documentation coherent. Light theme retains its existing palette and navy footer.
- Static rendering and public routes are unchanged; the build still generates 12 readable pages.

## Design references

[Linear’s design refresh](https://linear.app/now/behind-the-latest-design-refresh) informed restrained separation and readable hierarchy. [Vercel Geist colors](https://vercel.com/geist/colors) informed neutral surface layers. Ravel retains its existing fonts, identity and content.

## Captures and verification

Fresh exports are in `.local/screenshots/charcoal-refinement/`, separate from the previous design archive. Five viewport widths (1556, 1280, 1024, 768, 390px), both themes, full pages, individual sections and all four story states have viewport/theme receipts. Pinned full-page screenshots contain only one active scene; use the four story captures or reduced-motion full page to see all content.

The first browser pass caught the new hero pushing the next heading below the agreed fold at 1556px. Removing the inherited 350px preview-heading limit restored the intended composition. Final results are recorded in the changelog.
