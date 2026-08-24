/* Shared Google integrations for the static GitHub Pages site. */
(() => {
  'use strict';

  const MEASUREMENT_ID = 'G-XK4CHWYGWZ';
  const dataLayer = (window.dataLayer = window.dataLayer || []);
  window.gtag = window.gtag || function gtag() { dataLayer.push(arguments); };

  if (!window.__HATG_GA_CONFIGURED__) {
    window.gtag('js', new Date());
    window.gtag('config', MEASUREMENT_ID, {
      anonymize_ip: true,
      send_page_view: true,
      transport_type: 'beacon'
    });
    window.__HATG_GA_CONFIGURED__ = true;
  }

  if (!document.querySelector('script[data-hatg-analytics]')) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
    script.dataset.hatgAnalytics = 'true';
    document.head.appendChild(script);
  }

  window.hatgAnalytics = (eventName, parameters = {}) => {
    if (typeof window.gtag === 'function') window.gtag('event', eventName, parameters);
  };
})();
