(() => {
  const ADSENSE_CLIENT = 'ca-pub-5656416032906373';
  const ADSENSE_SRC = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
  const AD_SELECTOR = 'ins.adsbygoogle';
  const OBSERVER_OPTIONS = { rootMargin: '420px 0px', threshold: 0.01 };
  const observedAds = new WeakSet();
  const queuedAds = new Set();
  let adObserver;
  let domObserver;
  let adsensePromise;

  const getContainer = (ad) => ad.closest('.ad-container');

  function markAdContainer(ad, state) {
    const container = getContainer(ad);
    if (!container) return;
    container.dataset.adState = state;
    container.classList.toggle('is-ready', state === 'ready');
    container.classList.toggle('is-unfilled', state === 'unfilled');
  }

  function loadAdsense() {
    if (adsensePromise) return adsensePromise;

    const existingScript = document.querySelector('script[src*="adsbygoogle.js?client="]');
    if (existingScript) {
      window.adsbygoogle = window.adsbygoogle || [];
      adsensePromise = new Promise((resolve, reject) => {
        const resolveOnce = () => resolve();
        existingScript.addEventListener('load', resolveOnce, { once: true });
        existingScript.addEventListener('error', reject, { once: true });
        if (existingScript.dataset.adsenseLoaded === 'true' || document.readyState === 'complete') {
          resolveOnce();
        }
      });
      return adsensePromise;
    }

    adsensePromise = new Promise((resolve, reject) => {
      window.adsbygoogle = window.adsbygoogle || [];
      const script = document.createElement('script');
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.dataset.adsenseLoader = 'true';
      script.src = ADSENSE_SRC;
      script.addEventListener('load', () => resolve(), { once: true });
      script.addEventListener('error', () => reject(new Error('AdSense failed to load')), { once: true });
      document.head.appendChild(script);
    }).catch((error) => {
      adsensePromise = undefined;
      console.warn('[ads] تعذر تحميل Google AdSense:', error);
      throw error;
    });

    return adsensePromise;
  }

  function pushAd(ad) {
    if (!ad || ad.dataset.adsInitialized === 'true') return;
    if (ad.dataset.adsPushPending === 'true') return;

    ad.dataset.adsPushPending = 'true';
    queuedAds.add(ad);
    loadAdsense()
      .then(() => {
        queuedAds.delete(ad);
        if (ad.dataset.adsInitialized === 'true') return;
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          ad.dataset.adsInitialized = 'true';
          ad.removeAttribute('data-ads-push-pending');
          markAdContainer(ad, 'ready');
        } catch (error) {
          ad.removeAttribute('data-ads-push-pending');
          console.warn('[ads] تعذر تهيئة وحدة إعلانية:', error);
        }
      })
      .catch(() => {
        queuedAds.delete(ad);
        ad.removeAttribute('data-ads-push-pending');
      });
  }

  function handleAdEntries(entries, observer) {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      pushAd(entry.target);
    });
  }

  function observeAds(root = document) {
    const adBlocks = [...root.querySelectorAll(AD_SELECTOR)].filter(
      (ad) => ad.dataset.adsInitialized !== 'true' && !observedAds.has(ad),
    );
    if (!adBlocks.length) return;

    if (!('IntersectionObserver' in window)) {
      adBlocks.forEach(pushAd);
      return;
    }

    adObserver ||= new IntersectionObserver(handleAdEntries, OBSERVER_OPTIONS);
    adBlocks.forEach((ad) => {
      observedAds.add(ad);
      markAdContainer(ad, 'waiting');
      adObserver.observe(ad);
    });
  }

  function watchUnfilledAds() {
    if (!('MutationObserver' in window)) return;
    const root = document.body;
    if (!root || domObserver) return;

    domObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.target.matches?.(AD_SELECTOR)) {
          if (mutation.target.dataset.adStatus === 'unfilled') {
            markAdContainer(mutation.target, 'unfilled');
          }
        }
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType !== Node.ELEMENT_NODE) return;
          if (node.matches?.(AD_SELECTOR)) observeAds(node.parentElement || document);
          else if (node.querySelector?.(AD_SELECTOR)) observeAds(node);
        });
      });
    });

    domObserver.observe(root, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['data-ad-status'],
    });
  }

  function initAds() {
    observeAds();
    watchUnfilledAds();
  }

  window.initAds = initAds;

  const boot = () => {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(initAds, { timeout: 1200 });
    } else {
      window.setTimeout(initAds, 100);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
