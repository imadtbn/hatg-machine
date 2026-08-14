(() => {
  let initialized = false;

  function pushAd(adBlock) {
    if (!adBlock || adBlock.dataset.adsInitialized === 'true') return;
    adBlock.dataset.adsInitialized = 'true';
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      adBlock.dataset.adsInitialized = 'false';
      console.warn('AdSense push deferred:', error);
    }
  }

  function initAds() {
    if (initialized) return;
    initialized = true;
    const adBlocks = [...document.querySelectorAll('ins.adsbygoogle')];
    if (!adBlocks.length) return;

    if (!('IntersectionObserver' in window)) {
      adBlocks.forEach(pushAd);
      return;
    }

    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          pushAd(entry.target);
          currentObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '500px 0px' });
    adBlocks.forEach(adBlock => observer.observe(adBlock));
  }

  window.initAds = initAds;
})();
