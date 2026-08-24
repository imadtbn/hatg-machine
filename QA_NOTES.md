## Browser QA checkpoint — 2026-08-24

The local English article page loaded the translated title, body, FAQ, related article images, and cover image correctly. The screenshot exposed a blocking asset-path defect: pages under `/en/articles/` referenced `../assets/...`, which resolves to `/en/assets/...` instead of the repository-level `/assets/...`; the page therefore rendered without the stylesheet. The English article builder must rewrite only `../assets/` and `../manifest.webmanifest` to `../../assets/` and `../../manifest.webmanifest`, then the page should be re-tested.

The next browser check loaded the stylesheet and bilingual article UI, but `loadData()` reported a JavaScript exception because `applyLanguage()` attempted to assign `element.dataset['i18n-content']`. Hyphenated keys are invalid in `DOMStringMap`; the fix is to use a camelCase dataset key (or `setAttribute`) before retesting data hydration.

A follow-up console check found the first key fix was incomplete for `aria-label`: converting only the first character produced `i18nAria-label`, which is still invalid. The localization code must normalize attribute names by removing hyphens and capitalizing the following letter, e.g. `i18nAriaLabel`.

After the dataset fix, the English article hydrates correctly: translated metadata, date, language button, image cover, related cards, FAQ, and content are visible, and no data-loading exception remains. The console only reports an expected local AdSense warning plus a service-worker 404 because `registerServiceWorker()` resolves `/en/service-worker.js`; the registration path must point to the repository-root worker from `/en/` pages (`../service-worker.js`) and from `/en/articles/` pages (`../../service-worker.js`).

The English errors page now shows translated fault-group options and error cards for all 62 records. The console check reports only the expected local AdSense warning; the service worker registers successfully after the path correction.

The Arabic errors page retained RTL and Arabic data correctly. Clicking the language control switched the visible shell and cards to English, but dynamic filter options initially retained some Arabic labels; the latest `initFilters()` change now refreshes those option labels and guards change listeners when toggling.

The English error-detail page now shows translated FAQ and all diagnostic content, but the Repair time value still rendered as Arabic `30 دقيقة` even though `errors.json` contains `30 minutes`. This points to either a stale browser/service-worker JavaScript copy or another renderer occurrence still using `error.repairDuration`; inspect the loaded function/source before release.

Console inspection confirmed `I18n.language` is `en` and `getLocalizedError(...).repairDuration` returns `30 minutes`, while the DOM still contains `30 دقيقة`. The issue is therefore not the data or localization merge; it is a stale/partial render state in the current page, and the final implementation should ensure the detail renderer replaces the existing content after hydration.

The loaded function source was the pre-fix version (`rendererHasLocalized: false`) despite the working-tree fix, and unregistering the local service worker returned `true`. This confirms a local cache artifact rather than a source defect; a clean reload without the old worker should exercise the current renderer.

A clean reload now shows `30 minutes` for Repair time, English FAQ questions and answers, and the complete English diagnostic detail. Console output contains only successful service-worker registration and the expected local AdSense warning.

## Google integrations QA — 2026-08-25

The local troubleshooting page now contains page-level AdSense placements after the hero and before the footer, while the wizard remains usable. The browser console reports successful service-worker registration and only the expected local AdSense load warning; no application error was observed. Google Analytics is injected by the shared `google-services.js` loader on every operational page.
