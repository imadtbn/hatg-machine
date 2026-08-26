/*
 * Central first-party loader for Google Analytics, GTM, AdSense, and Microsoft Clarity.
 * Replace only the placeholder values when the corresponding accounts are ready.
 */
(() => {
  'use strict';

  const CONFIG = Object.freeze({
    ga4Id: 'G-XK4CHWYGWZ',
    gtmId: 'xxxxxxxxx',
    adsenseClient: 'ca-pub-5656416032906373',
    clarityId: 'xxxxxxxxx'
  });
  const PLACEHOLDER = /^x+$/i;
  const isConfigured = (value, pattern) => Boolean(value && !PLACEHOLDER.test(value) && (!pattern || pattern.test(value)));
  const dataLayer = (window.dataLayer = window.dataLayer || []);
  const addScriptOnce = (selector, src, attributes = {}) => {
    if (document.querySelector(selector)) return false;
    const script = document.createElement('script');
    script.async = true;
    script.src = src;
    Object.entries(attributes).forEach(([key, value]) => script.setAttribute(key, value));
    document.head.appendChild(script);
    return true;
  };

  function loadGtm() {
    if (!isConfigured(CONFIG.gtmId, /^GTM-[A-Z0-9]+$/i)) return false;
    if (window.__hatgGtmLoaded) return true;
    window.__hatgGtmLoaded = true;
    dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    addScriptOnce('script[data-hatg-gtm]', `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(CONFIG.gtmId)}`, { 'data-hatg-gtm': 'true' });
    const noscript = document.createElement('noscript');
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(CONFIG.gtmId)}`;
    iframe.height = '0';
    iframe.width = '0';
    iframe.style.display = 'none';
    iframe.style.visibility = 'hidden';
    noscript.appendChild(iframe);
    document.body.prepend(noscript);
    return true;
  }

  function loadGa4() {
    if (!isConfigured(CONFIG.ga4Id, /^G-[A-Z0-9]+$/i) || isConfigured(CONFIG.gtmId, /^GTM-[A-Z0-9]+$/i) || window.__hatgGa4Loaded) return;
    window.__hatgGa4Loaded = true;
    window.gtag = window.gtag || function gtag() { dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', CONFIG.ga4Id, {
      anonymize_ip: true,
      send_page_view: true,
      transport_type: 'beacon'
    });
    addScriptOnce('script[data-hatg-ga4]', `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(CONFIG.ga4Id)}`, { 'data-hatg-ga4': 'true' });
  }

  function loadClarity() {
    if (!isConfigured(CONFIG.clarityId, /^[a-z0-9]+$/i) || window.__hatgClarityLoaded) return;
    window.__hatgClarityLoaded = true;
    window.clarity = window.clarity || function clarity() { (window.clarity.q = window.clarity.q || []).push(arguments); };
    addScriptOnce('script[data-hatg-clarity]', `https://www.clarity.ms/tag/${encodeURIComponent(CONFIG.clarityId)}`, { 'data-hatg-clarity': 'true' });
  }

  function markContainer(container, state) {
    container.dataset.adState = state;
    container.classList.toggle('is-ready', state === 'ready');
    container.classList.toggle('is-unfilled', state === 'unfilled');
  }

  function loadAdsense() {
    const ads = [...document.querySelectorAll('ins.adsbygoogle')];
    if (!ads.length || !isConfigured(CONFIG.adsenseClient, /^ca-pub-[0-9]+$/i)) return;
    window.adsbygoogle = window.adsbygoogle || [];
    let adsensePromise;
    const loadLibrary = () => {
      if (adsensePromise) return adsensePromise;
      const existing = document.querySelector('script[data-hatg-adsense]');
      if (existing) return Promise.resolve();
      adsensePromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.async = true;
        script.crossOrigin = 'anonymous';
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(CONFIG.adsenseClient)}`;
        script.dataset.hatgAdsense = 'true';
        script.addEventListener('load', resolve, { once: true });
        script.addEventListener('error', () => reject(new Error('AdSense failed to load')), { once: true });
        document.head.appendChild(script);
      });
      return adsensePromise;
    };
    const pushAd = (ad) => {
      if (ad.dataset.adsInitialized === 'true') return;
      loadLibrary().then(() => {
        if (ad.dataset.adsInitialized === 'true') return;
        try {
          window.adsbygoogle.push({});
          ad.dataset.adsInitialized = 'true';
          markContainer(ad.closest('.ad-container') || ad, 'ready');
        } catch (error) {
          markContainer(ad.closest('.ad-container') || ad, 'unfilled');
          console.warn('[ads] Unable to initialize ad unit', error);
        }
      }).catch(() => markContainer(ad.closest('.ad-container') || ad, 'unfilled'));
    };
    if (!('IntersectionObserver' in window)) {
      ads.forEach(pushAd);
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        pushAd(entry.target);
      });
    }, { rootMargin: '480px 0px', threshold: 0.01 });
    ads.forEach((ad) => {
      const container = ad.closest('.ad-container');
      if (container) markContainer(container, 'waiting');
      observer.observe(ad);
    });
  }

  function init() {
    const gtmEnabled = loadGtm();
    if (!gtmEnabled) loadGa4();
    loadClarity();
    loadAdsense();
  }

  window.hatgAnalytics = (eventName, parameters = {}) => {
    if (typeof window.gtag === 'function') window.gtag('event', eventName, parameters);
    else if (window.dataLayer) window.dataLayer.push({ event: eventName, ...parameters });
  };
  window.hatgTagConfig = CONFIG;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
