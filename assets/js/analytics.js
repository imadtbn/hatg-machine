/* ============================================
   Google Analytics & AdSense Integration
   Replace CA_PUB_ID with your actual publisher ID
   ============================================ */

(function() {
  'use strict';
  
  // === Google Analytics ===
  // Replace GA_MEASUREMENT_ID with your actual GA4 measurement ID
  const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';
  
  // Load Google Analytics
  const gaScript = document.createElement('script');
  gaScript.async = true;
  gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;
  document.head.appendChild(gaScript);
  
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID, {
    'page_title': document.title,
    'page_path': location.pathname + location.search
  });
  
  // Track page views on SPA navigation
  const originalPushState = history.pushState;
  history.pushState = function() {
    originalPushState.apply(this, arguments);
    gtag('config', GA_MEASUREMENT_ID, {
      'page_title': document.title,
      'page_path': location.pathname + location.search
    });
  };

  // AdSense is managed centrally by assets/js/adsData.js.

  // === Schema.org Structured Data ===
  function addStructuredData() {
    // Breadcrumb schema
    const breadcrumbs = document.querySelectorAll('.breadcrumb');
    if (breadcrumbs.length > 0) {
      const links = breadcrumbs[0].querySelectorAll('a, span');
      const items = Array.from(links).map(function(el, i) {
        return {
          '@type': 'ListItem',
          'position': i + 1,
          'name': el.textContent.trim(),
          'item': el.href || window.location.href
        };
      });
      
      const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': items
      };
      
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(breadcrumbSchema);
      document.head.appendChild(script);
    }
  }
  
  addStructuredData();

})();
