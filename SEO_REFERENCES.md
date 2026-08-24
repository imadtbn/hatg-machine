# SEO references used for the bilingual update

1. Google Search Central — Tell Google about localized versions of your page: https://developers.google.com/search/docs/specialty/international/localized-versions
   - Each language version should reference itself and every alternate version.
   - Alternate URLs should be fully qualified.
   - `x-default` can be used as a fallback.
   - Different URL versions are recommended over cookie/browser-only language switching.

2. Google Search Central — Managing multi-regional and multilingual sites: https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites
   - Use different URLs for different language versions.
   - Avoid automatic language redirects that can prevent crawling alternate versions.
   - Make the visible page language consistent and obvious.
   - Use `hreflang` annotations or a sitemap to identify localized versions.
