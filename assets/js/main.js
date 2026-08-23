/**
 * دليل أعطال الأجهزة الكهرومنزلية - Main JavaScript
 * Modern, interactive, and SEO-optimized
 */

// ============================================
// Global State
// ============================================
let deferredInstallPrompt = null;
let pwaInstallButton = null;
let pwaInstallNotice = null;

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  deferredInstallPrompt = event;
  if (pwaInstallButton) updatePwaInstallUi();
  if (pwaInstallNotice?.classList.contains('show')) showPwaInstallNotice(true);
});

window.addEventListener('appinstalled', () => {
  deferredInstallPrompt = null;
  localStorage.setItem('pwa-installed', '1');
  hidePwaInstallNotice();
  if (pwaInstallButton) updatePwaInstallUi();
  showToast('تم تثبيت الموقع بنجاح على جهازك', 'success');
});

const App = {
  data: {
    errors: [],
    brands: [],
    articles: [],
    taxonomy: { deviceTypes: {}, faultGroups: {}, brands: {} }
  },
  config: {
    itemsPerPage: 12,
    currentPage: 1,
    currentFilters: {},
    theme: localStorage.getItem('theme') || 'light'
  }
};

// ============================================
// Data Loading
// ============================================
async function loadData() {
  try {
    const assetBase = window.location.pathname.includes('/articles/') ? '../' : '';
    const [errorsRes, brandsRes, articlesRes, taxonomyRes] = await Promise.all([
      fetch(`${assetBase}data/errors.json`),
      fetch(`${assetBase}data/brands.json`),
      fetch(`${assetBase}data/articles.json`),
      fetch(`${assetBase}data/taxonomy.json`)
    ]);

    if (!errorsRes.ok || !brandsRes.ok || !articlesRes.ok || !taxonomyRes.ok) {
      throw new Error('تعذر تحميل أحد ملفات البيانات');
    }

    App.data.errors = await errorsRes.json();
    App.data.brands = await brandsRes.json();
    App.data.articles = await articlesRes.json();
    App.data.taxonomy = await taxonomyRes.json();

    return true;
  } catch (error) {
    console.error('Error loading data:', error);
    showToast('حدث خطأ في تحميل البيانات', 'error');
    return false;
  }
}

function getDeviceLabel(deviceId) {
  return App.data.taxonomy?.deviceTypes?.[deviceId]?.nameAr || deviceId || '';
}

function getFaultGroupLabel(groupId) {
  return App.data.taxonomy?.faultGroups?.[groupId]?.nameAr || groupId || 'غير مصنف';
}

function getBrandId(errorOrBrand) {
  if (typeof errorOrBrand === 'string') return errorOrBrand.toLowerCase();
  return errorOrBrand.brandId || (errorOrBrand.brand || '').toLowerCase();
}

function getBrandLabel(brandId, fallback = '') {
  const brand = App.data.brands.find(item => item.id === brandId || (item.name || '').toLowerCase() === brandId);
  return brand?.nameAr || fallback || brandId || '';
}

function getModelScopeLabel(scope) {
  return App.data.taxonomy?.modelScopes?.[scope]?.nameAr || scope || 'غير محدد';
}

function getVerificationLabel(status) {
  return App.data.taxonomy?.verificationStatuses?.[status]?.nameAr || status || 'غير محدد';
}

function getErrorSummary(error) {
  return (error.causes && error.causes.length ? error.causes[0] : error.titleAr || error.title || 'لا يوجد وصف مختصر مسجل').trim();
}

function getActiveFilterLabel(key, value) {
  if (!value) return '';
  if (key === 'device') return getDeviceLabel(value);
  if (key === 'brand') return getBrandLabel(value);
  if (key === 'faultGroup') return getFaultGroupLabel(value);
  if (key === 'severity') return ({high: 'خطير', medium: 'متوسط', low: 'بسيط'})[value] || value;
  return value;
}

function renderActiveFilters(filters) {
  const container = document.getElementById('active-filters');
  if (!container) return;
  const entries = [['device', filters.device], ['brand', filters.brand], ['faultGroup', filters.faultGroup], ['severity', filters.severity]]
    .filter(([, value]) => value);
  container.innerHTML = entries.length ? entries.map(([key, value]) => `
    <button type="button" class="active-filter-chip" data-filter-key="${key}" title="إزالة هذا المرشح">
      ${getActiveFilterLabel(key, value)} <i class="fas fa-times"></i>
    </button>
  `).join('') : '<span class="no-active-filters"><i class="fas fa-layer-group"></i> كل النتائج معروضة</span>';
  container.querySelectorAll('[data-filter-key]').forEach(button => {
    button.addEventListener('click', () => {
      const select = document.getElementById(`${button.dataset.filterKey}-filter`);
      if (select) select.value = '';
      App.config.currentFilters[button.dataset.filterKey] = '';
      App.config.currentPage = 1;
      applyFilters();
    });
  });
}

function getErrorUrl(error) {
  return `error.html?id=${encodeURIComponent(error.id || '')}`;
}

function normalizeDeviceParam(value) {
  if (!value) return '';
  if (App.data.taxonomy?.deviceTypes?.[value]) return value;
  const match = Object.entries(App.data.taxonomy?.deviceTypes || {}).find(([id, item]) => item.nameAr === value || item.name === value);
  return match ? match[0] : value;
}

function normalizeBrandParam(value) {
  if (!value) return '';
  const match = App.data.brands.find(brand => brand.id === value.toLowerCase() || brand.name === value || brand.nameAr === value);
  return match?.id || value.toLowerCase();
}

function getArticleById(id) {
  return App.data.articles.find(article => article.id === id || article.slug === id);
}

function getArticleUrl(article) {
  const articleBase = window.location.pathname.includes('/articles/') ? '' : 'articles/';
  return `${articleBase}${encodeURIComponent(article.slug || article.id)}.html`;
}

// ============================================
// PWA Installation
// ============================================
function isPwaInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true || localStorage.getItem('pwa-installed') === '1';
}

function shouldShowInstallNotice() {
  return !isPwaInstalled() && localStorage.getItem('pwa-install-notice-shown') !== '1';
}

function createPwaInstallUi() {
  const headerActions = document.querySelector('.header-actions') || document.querySelector('.header-inner > div:last-child');
  if (headerActions && !document.getElementById('pwa-install-button')) {
    headerActions.insertAdjacentHTML('afterbegin', '<button id="pwa-install-button" class="install-app-btn" type="button" aria-label="تثبيت الموقع كتطبيق" title="تثبيت الموقع كتطبيق"><i class="fas fa-download" aria-hidden="true"></i><span>تثبيت</span></button>');
  }
  pwaInstallButton = document.getElementById('pwa-install-button');
  if (pwaInstallButton) pwaInstallButton.addEventListener('click', installPwa);

  if (!document.getElementById('pwa-install-notice')) {
    document.body.insertAdjacentHTML('beforeend', '<aside id="pwa-install-notice" class="pwa-install-notice" role="dialog" aria-labelledby="pwa-install-title" aria-describedby="pwa-install-description"><button class="pwa-notice-close" type="button" aria-label="إغلاق إشعار التثبيت"><i class="fas fa-times"></i></button><div class="pwa-notice-icon"><i class="fas fa-mobile-screen-button"></i></div><div class="pwa-notice-content"><strong id="pwa-install-title">ثبّت دليل الأعطال على جهازك</strong><p id="pwa-install-description">احصل على وصول أسرع للمقالات وأكواد الأخطاء، ويمكنك استخدام الموقع حتى عند ضعف الاتصال.</p><div class="pwa-notice-actions"><button id="pwa-install-now" class="btn btn-primary" type="button"><i class="fas fa-download"></i> تثبيت الآن</button><button id="pwa-install-later" class="pwa-later-btn" type="button">لاحقاً</button></div></div></aside>');
  }
  pwaInstallNotice = document.getElementById('pwa-install-notice');
  document.getElementById('pwa-install-now')?.addEventListener('click', installPwa);
  document.getElementById('pwa-install-later')?.addEventListener('click', dismissPwaNotice);
  document.querySelector('.pwa-notice-close')?.addEventListener('click', dismissPwaNotice);
  updatePwaInstallUi();
}

function updatePwaInstallUi() {
  if (!pwaInstallButton) return;
  const installed = isPwaInstalled();
  pwaInstallButton.hidden = installed;
  pwaInstallButton.classList.toggle('is-available', Boolean(deferredInstallPrompt));
  pwaInstallButton.setAttribute('aria-label', deferredInstallPrompt ? 'تثبيت الموقع كتطبيق' : 'طريقة تثبيت الموقع');
}

function showPwaInstallNotice(manual = false) {
  if (!pwaInstallNotice || isPwaInstalled()) return;
  if (!manual && !shouldShowInstallNotice()) return;
  if (!manual) localStorage.setItem('pwa-install-notice-shown', '1');
  const description = document.getElementById('pwa-install-description');
  const installNow = document.getElementById('pwa-install-now');
  if (manual && !deferredInstallPrompt) {
    if (description) description.textContent = 'من قائمة المتصفح اختر «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية» لإضافة الموقع إلى جهازك.';
    if (installNow) installNow.hidden = true;
  } else {
    if (description) description.textContent = 'احصل على وصول أسرع للمقالات وأكواد الأخطاء، ويمكنك استخدام الموقع حتى عند ضعف الاتصال.';
    if (installNow) installNow.hidden = false;
  }
  pwaInstallNotice.classList.add('show');
}

function hidePwaInstallNotice() {
  pwaInstallNotice?.classList.remove('show');
}

function dismissPwaNotice() {
  localStorage.setItem('pwa-install-notice-shown', '1');
  hidePwaInstallNotice();
}

async function installPwa() {
  if (!deferredInstallPrompt) {
    showPwaInstallNotice(true);
    return;
  }
  deferredInstallPrompt.prompt();
  const choice = await deferredInstallPrompt.userChoice;
  if (choice.outcome === 'accepted') {
    localStorage.setItem('pwa-installed', '1');
    hidePwaInstallNotice();
  }
  deferredInstallPrompt = null;
  updatePwaInstallUi();
}

function initPWAInstall() {
  createPwaInstallUi();
  // تأخير الإشعار حتى يكتمل العرض الأول ولا يصبح العنصر الأكبر في Lighthouse أو على الهاتف.
  window.setTimeout(() => {
    if (shouldShowInstallNotice()) showPwaInstallNotice(Boolean(!deferredInstallPrompt));
  }, 8500);
}

// ============================================
// Theme Management
// ============================================
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
  const icon = document.querySelector('.theme-toggle i');
  if (icon) {
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  }
}

// ============================================
// Header Scroll Effect
// ============================================
function initHeader() {
  const header = document.querySelector('.header');
  if (!header) return;
  let ticking = false;
  let isScrolled = false;
  const update = () => {
    ticking = false;
    const nextState = window.scrollY > 50;
    if (nextState === isScrolled) return;
    isScrolled = nextState;
    header.classList.toggle('scrolled', isScrolled);
  };
  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
}

// ============================================
// Mobile Menu
// ============================================
function initMobileMenu() {
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');

  if (!menuToggle || !nav) return;

  menuToggle.addEventListener('click', () => {
    nav.classList.toggle('active');
    const icon = menuToggle.querySelector('i');
    icon.className = nav.classList.contains('active') ? 'fas fa-times' : 'fas fa-bars';
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!menuToggle.contains(e.target) && !nav.contains(e.target)) {
      nav.classList.remove('active');
      menuToggle.querySelector('i').className = 'fas fa-bars';
    }
  });
}

// ============================================
// Back to Top
// ============================================
function initBackToTop() {
  const backToTop = document.querySelector('.back-to-top');
  if (!backToTop) return;
  let ticking = false;
  let isVisible = false;
  const update = () => {
    ticking = false;
    const nextState = window.scrollY > 500;
    if (nextState === isVisible) return;
    isVisible = nextState;
    backToTop.classList.toggle('visible', isVisible);
  };
  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ============================================
// Scroll Reveal Animation
// ============================================
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => observer.observe(el));
}

// ============================================
// Counter Animation
// ============================================
function animateCounters() {
  const counters = document.querySelectorAll('.counter');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counter = entry.target;
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000;
        const start = 0;
        const startTime = performance.now();

        function updateCounter(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easeOut = 1 - Math.pow(1 - progress, 3);
          const current = Math.floor(easeOut * target);
          counter.textContent = current.toLocaleString('en-US');

          if (progress < 1) {
            requestAnimationFrame(updateCounter);
          } else {
            counter.textContent = target.toLocaleString('en-US');
          }
        }

        requestAnimationFrame(updateCounter);
        observer.unobserve(counter);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => observer.observe(counter));
}

// ============================================
// Search Functionality
// ============================================
function initSearch() {
  const searchInputs = document.querySelectorAll('.search-input');

  searchInputs.forEach(input => {
    const resultsContainer = input.closest('.search-bar, .hero-search')?.querySelector('.search-results');

    input.addEventListener('input', debounce(() => {
      const query = input.value.trim();
      if (query.length < 2) {
        resultsContainer?.classList.remove('active');
        return;
      }

      const results = searchAll(query);
      renderSearchResults(results, resultsContainer);
    }, 300));

    input.addEventListener('focus', () => {
      if (input.value.trim().length >= 2) {
        resultsContainer?.classList.add('active');
      }
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (!input.contains(e.target) && !resultsContainer?.contains(e.target)) {
        resultsContainer?.classList.remove('active');
      }
    });

    // Enter key
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const query = input.value.trim();
        if (query) {
          window.location.href = `search.html?q=${encodeURIComponent(query)}`;
        }
      }
    });
  });
}

function searchAll(query) {
  const q = query.toLowerCase();
  const results = [];

  // Search errors
  App.data.errors.forEach(error => {
    const searchable = [
      error.errorCode, ...(error.codes || []), error.titleAr, error.title,
      error.deviceType, error.deviceTypeAr, error.brand, error.brandAr,
      error.faultGroup, getFaultGroupLabel(error.faultGroup), ...(error.faultTags || []),
      ...(error.causes || []), ...(error.symptoms || [])
    ].filter(Boolean).join(' ').toLowerCase();
    if (searchable.includes(q)) {
      results.push({
        type: 'error',
        title: `كود الخطأ ${error.displayCode || error.errorCode || ''}`,
        subtitle: `${getDeviceLabel(error.deviceType)} - ${error.brandAr || getBrandLabel(getBrandId(error))} - ${getFaultGroupLabel(error.faultGroup)}`,
        url: getErrorUrl(error),
        icon: 'fa-exclamation-triangle'
      });
    }
  });

  // Search brands
  App.data.brands.forEach(brand => {
    if (brand.name.toLowerCase().includes(q)) {
      results.push({
        type: 'brand',
        title: brand.name,
        subtitle: brand.country,
        url: `brand.html?name=${encodeURIComponent(brand.name)}`,
        icon: 'fa-industry'
      });
    }
  });

  return results.slice(0, 8);
}

function renderSearchResults(results, container) {
  if (!container) return;

  if (results.length === 0) {
    container.innerHTML = `
      <div class="search-result-item" style="justify-content:center; color: var(--text-tertiary);">
        لا توجد نتائج
      </div>
    `;
    container.classList.add('active');
    return;
  }

  container.innerHTML = results.map(result => `
    <a href="${result.url}" class="search-result-item">
      <div class="search-result-icon">
        <i class="fas ${result.icon}"></i>
      </div>
      <div class="search-result-content">
        <div class="search-result-title">${result.title}</div>
        <div class="search-result-subtitle">${result.subtitle}</div>
      </div>
    </a>
  `).join('');

  container.classList.add('active');
}

// ============================================
// Filter & Sort
// ============================================
function initFilters() {
  const deviceFilter = document.getElementById('device-filter');
  const brandFilter = document.getElementById('brand-filter');
  const faultGroupFilter = document.getElementById('fault-group-filter');
  const severityFilter = document.getElementById('severity-filter');
  const sortFilter = document.getElementById('sort-filter');

  if (deviceFilter && deviceFilter.options.length <= 1) {
    deviceFilter.insertAdjacentHTML('beforeend', Object.entries(App.data.taxonomy.deviceTypes).filter(([id]) => App.data.errors.some(error => error.deviceType === id)).map(([id, item]) => `<option value="${id}">${item.nameAr}</option>`).join(''));
  }
  if (brandFilter && brandFilter.options.length <= 1) {
    const brandOptions = App.data.brands
      .map(brand => ({...brand, errorCount: App.data.errors.filter(error => getBrandId(error) === brand.id).length}))
      .filter(brand => brand.errorCount > 0)
      .sort((a, b) => b.errorCount - a.errorCount || (a.nameAr || a.name).localeCompare(b.nameAr || b.name, 'ar'));
    brandFilter.insertAdjacentHTML('beforeend', brandOptions.map(brand => `<option value="${brand.id}">${brand.nameAr || brand.name} — ${brand.errorCount} ${brand.errorCount === 1 ? 'عطل' : 'أعطال'}</option>`).join(''));
    brandFilter.title = 'عدد الأعطال المسجلة حسب الماركة';
  }
  if (faultGroupFilter && faultGroupFilter.options.length <= 1) {
    faultGroupFilter.insertAdjacentHTML('beforeend', Object.entries(App.data.taxonomy.faultGroups).filter(([id]) => id !== 'unknown' && App.data.errors.some(error => error.faultGroup === id)).map(([id, item]) => `<option value="${id}">${item.nameAr}</option>`).join(''));
  }

  const filters = [deviceFilter, brandFilter, faultGroupFilter, severityFilter, sortFilter];
  const resetButton = document.getElementById('reset-filters');

  resetButton?.addEventListener('click', () => {
    [deviceFilter, brandFilter, faultGroupFilter, severityFilter].forEach(filter => { if (filter) filter.value = ''; });
    if (sortFilter) sortFilter.value = 'newest';
    App.config.currentFilters = {device: '', brand: '', faultGroup: '', severity: '', sort: 'newest'};
    App.config.currentPage = 1;
    applyFilters();
  });

  filters.forEach(filter => {
    if (!filter) return;
    filter.addEventListener('change', () => {
      App.config.currentFilters = {
        device: deviceFilter?.value || '',
        brand: brandFilter?.value || '',
        faultGroup: faultGroupFilter?.value || '',
        severity: severityFilter?.value || '',
        sort: sortFilter?.value || 'newest'
      };
      App.config.currentPage = 1;
      applyFilters();
    });
  });
}

function applyFilters() {
  let filtered = [...App.data.errors];
  const filters = App.config.currentFilters;

  if (filters.device) {
    filtered = filtered.filter(e => (e.deviceType || '') === filters.device);
  }
  if (filters.brand) {
    filtered = filtered.filter(e => getBrandId(e) === filters.brand);
  }
  if (filters.faultGroup) {
    filtered = filtered.filter(e => (e.faultGroup || 'unknown') === filters.faultGroup);
  }
  if (filters.severity) {
    filtered = filtered.filter(e => (e.severity || '') === filters.severity);
  }

  switch (filters.sort) {
    case 'newest':
      filtered.sort((a, b) => (b.id || '').localeCompare(a.id || ''));
      break;
    case 'oldest':
      filtered.sort((a, b) => (a.id || '').localeCompare(b.id || ''));
      break;

    case 'severity':
      const severityOrder = { high: 0, medium: 1, low: 2 };
      filtered.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
      break;
  }

  renderActiveFilters(filters);
  renderErrors(filtered);
}

// ============================================
// Render Functions
// ============================================
function renderErrors(errors) {
  const container = document.getElementById('errors-grid');
  const countEl = document.getElementById('errors-count');
  if (!container) return;

  if (countEl) {
    const total = App.data.errors.length;
    countEl.textContent = errors.length === total ? `${total} عطل مسجل` : `${errors.length} من ${total} عطل`;
  }
  const hintEl = document.getElementById('errors-filter-hint');
  if (hintEl) {
    hintEl.textContent = errors.length ? 'اختر أي بطاقة لعرض التشخيص والخطوات والمصادر.' : 'لا توجد نتائج بهذه المعايير؛ جرّب إعادة الضبط.';
  }

  if (errors.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1;">
        <div class="empty-state-icon"><i class="fas fa-search"></i></div>
        <h3>لا توجد نتائج</h3>
        <p>جرب تغيير معايير البحث أو الفلترة</p>
      </div>
    `;
    return;
  }

  // Pagination
  const start = (App.config.currentPage - 1) * App.config.itemsPerPage;
  const end = start + App.config.itemsPerPage;
  const paginated = errors.slice(start, end);

  container.innerHTML = paginated.map(error => `
    <article class="error-card ${error.severity} reveal">
      <div class="error-card-topline">
        <span class="error-card-index"><i class="fas fa-hashtag"></i> ${error.id}</span>
        ${error.confidence === 'high' ? '<span class="verification-dot" title="موثق من الشركة المصنعة"><i class="fas fa-check-circle"></i> موثق</span>' : '<span class="verification-dot muted" title="راجع دليل الطراز"><i class="fas fa-book"></i> راجع الطراز</span>'}
      </div>
      <div class="error-card-code-row">
        <div class="error-code-display ${error.severity}">${error.displayCode || error.errorCode || ''}</div>
        <div class="error-card-heading">
          <span class="card-kicker">${getBrandLabel(getBrandId(error), error.brandAr || '')}</span>
          <h3 class="card-title">${error.titleAr || error.title || ''}</h3>
        </div>
      </div>
      <p class="card-text">${getErrorSummary(error).substring(0, 125)}${getErrorSummary(error).length > 125 ? '…' : ''}</p>
      <div class="card-meta">
        <span class="badge badge-primary"><i class="fas fa-microchip"></i> ${getDeviceLabel(error.deviceType)}</span>
        <span class="badge badge-secondary"><i class="fas fa-layer-group"></i> ${getFaultGroupLabel(error.faultGroup)}</span>
        ${getSeverityBadge(error.severity)}
      </div>
      <div class="error-card-footer">
        <span class="error-card-scope"><i class="fas fa-crosshairs"></i> ${getModelScopeLabel(error.modelScope)}</span>
        <a href="${getErrorUrl(error)}" class="btn btn-sm btn-primary">
          التفاصيل <i class="fas fa-arrow-left"></i>
        </a>
      </div>
    </article>
  `).join('');

  renderPagination(errors.length);
  initScrollReveal();
}

function getSeverityBadge(severity) {
  const map = {
    high: { class: 'badge-danger', icon: 'fa-exclamation-circle', text: 'خطير' },
    medium: { class: 'badge-warning', icon: 'fa-exclamation-triangle', text: 'متوسط' },
    low: { class: 'badge-success', icon: 'fa-check-circle', text: 'بسيط' }
  };
  const s = map[severity] || map.low;
  return `<span class="badge ${s.class}"><i class="fas ${s.icon}"></i> ${s.text}</span>`;
}

function renderPagination(totalItems) {
  const container = document.getElementById('pagination');
  if (!container) return;

  const totalPages = Math.ceil(totalItems / App.config.itemsPerPage);
  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  let html = '';

  // Previous
  html += `<button ${App.config.currentPage === 1 ? 'disabled' : ''} onclick="changePage(${App.config.currentPage - 1})">
    <i class="fas fa-chevron-right"></i>
  </button>`;

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= App.config.currentPage - 1 && i <= App.config.currentPage + 1)) {
      html += `<button class="${i === App.config.currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
    } else if (i === App.config.currentPage - 2 || i === App.config.currentPage + 2) {
      html += `<span>...</span>`;
    }
  }

  // Next
  html += `<button ${App.config.currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${App.config.currentPage + 1})">
    <i class="fas fa-chevron-left"></i>
  </button>`;

  container.innerHTML = html;
}

function changePage(page) {
  App.config.currentPage = page;
  applyFilters();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderBrands() {
  const container = document.getElementById('brands-grid');
  if (!container) return;

  // Count errors per brand

  const brandCounts = {};
  App.data.errors.forEach(e => {
    const key = (e.brand || '').toLowerCase();
    brandCounts[key] = (brandCounts[key] || 0) + 1;
  });

  const isHomePage = document.body?.dataset.page === 'home';
  const brandsToRender = isHomePage ? App.data.brands.slice(0, 8) : App.data.brands;

  container.innerHTML = brandsToRender.map(brand => {
    const count = brandCounts[(brand.name || '').toLowerCase()] || 0;
    const logoUrl = getBrandLogo(brand.name);
    return `
      <a href="brand.html?name=${encodeURIComponent(brand.name)}" class="brand-card reveal">
        <div class="brand-logo">
          ${logoUrl ? `<img src="${logoUrl}" alt="${brand.name}" loading="lazy">` : brand.name.charAt(0)}
        </div>
        <div class="brand-name">${brand.name}</div>
        <div class="brand-country"><i class="fas fa-globe"></i> ${brand.country}</div>
    <span class="brand-error-count"><i class="fas fa-bug"></i> ${count} خطأ</span>
      </a>
    `;
  }).join('');

  initScrollReveal();
}

function renderDevices() {
  const container = document.getElementById('devices-grid');
  if (!container) return;

  const devices = [
    { id: 'washing-machine', name: 'غسالات الملابس', icon: 'fa-tshirt', desc: 'أكواد أخطاء وإصلاحات غسالات الملابس', color: 'device-washing' },
    { id: 'dishwasher', name: 'غسالات الأطباق', icon: 'fa-utensils', desc: 'أكواد أخطاء وإصلاحات غسالات الأطباق', color: 'device-dishwasher' }
  ];

  container.innerHTML = devices.map(device => {
    const count = App.data.errors.filter(e => e.deviceType === device.id).length;
    return `
      <a href="errors.html?device=${encodeURIComponent(device.id)}" class="device-card ${device.color} reveal">
        <div class="device-icon"><i class="fas ${device.icon}"></i></div>
        <div class="device-content">
          <h3>${device.name}</h3>
          <p>${device.desc} (${count} خطأ)</p>
        </div>
        <div class="device-arrow"><i class="fas fa-arrow-left"></i></div>
      </a>
    `;
  }).join('');

  initScrollReveal();
}

function renderArticles() {
  const container = document.getElementById('articles-grid');
  if (!container) return;

  const searchInput = document.getElementById('articles-search');
  const categorySelect = document.getElementById('articles-category');
  const resultCount = document.getElementById('articles-result-count');

  if (categorySelect && categorySelect.options.length <= 1) {
    const categories = [...new Set(App.data.articles.map(article => article.category))].sort((a, b) => a.localeCompare(b, 'ar'));
    categorySelect.insertAdjacentHTML('beforeend', categories.map(category => `<option value="${category}">${category}</option>`).join(''));
  }

  const draw = () => {
    const query = (searchInput?.value || '').trim().toLowerCase();
    const category = categorySelect?.value || '';
    const filtered = App.data.articles.filter(article => {
      const haystack = [article.title, article.excerpt, article.category, ...(article.keywords || [])].join(' ').toLowerCase();
      return (!query || haystack.includes(query)) && (!category || article.category === category);
    }).sort((a, b) => new Date(b.date) - new Date(a.date));

    if (resultCount) resultCount.textContent = `${filtered.length} مقال${filtered.length === 1 ? '' : 'ات'} مفيد`;
    container.innerHTML = filtered.length ? filtered.map(article => `
      <a href="${getArticleUrl(article)}" class="article-card reveal">
        <div class="article-image"><i class="fas ${article.icon}"></i><span class="article-badge">${article.category}</span></div>
        <div class="article-content">
          <div class="article-meta">
            <span><i class="fas fa-calendar"></i> ${formatDate(article.date)}</span>
            <span><i class="fas fa-clock"></i> ${article.readTime} دقائق</span>
          </div>
          <h3 class="article-title">${article.title}</h3>
          <p class="article-excerpt">${article.excerpt}</p>
          <span class="article-link">اقرأ المقال <i class="fas fa-arrow-left"></i></span>
        </div>
      </a>
    `).join('') : '<div class="empty-state"><i class="fas fa-search"></i><h3>لم نعثر على مقال مطابق</h3><p>جرّب كلمة أخرى أو ألغِ التصفية لعرض جميع المقالات.</p></div>';
    initScrollReveal();
  };

  if (!container.dataset.initialized) {
    searchInput?.addEventListener('input', debounce(draw, 180));
    categorySelect?.addEventListener('change', draw);
    container.dataset.initialized = 'true';
  }
  draw();
}

function renderStats() {
  const totalErrors = App.data.errors.length;
  const totalBrands = App.data.brands.length;
  const totalDevices = new Set(App.data.errors.map(e => e.deviceType || '')).size;
  const totalArticles = App.data.articles.length;

  const counters = document.querySelectorAll('.counter');
  counters.forEach(counter => {
    const target = counter.getAttribute('data-target');
    if (target === 'errors') counter.setAttribute('data-target', totalErrors);
    if (target === 'brands') counter.setAttribute('data-target', totalBrands);
    if (target === 'devices') counter.setAttribute('data-target', totalDevices);
    if (target === 'articles') counter.setAttribute('data-target', totalArticles);
  });

  animateCounters();
}

// ============================================
// Brand Logo Helper
// ============================================
function getBrandLogo(brandName) {
  const logoMap = {
    'LG': 'assets/images/brands/lg.png',
    'Samsung': 'assets/images/brands/samsung.png',
    'Bosch': 'assets/images/brands/bosch.jpg',
    'Whirlpool': 'assets/images/brands/whirlpool.png',
    'Electrolux': 'assets/images/brands/electrolux.png',
    'Beko': 'assets/images/brands/beko.png',
    'Candy': 'assets/images/brands/candy.png',
    'Haier': 'assets/images/brands/haier.png',
    'Panasonic': 'assets/images/brands/panasonic.png',
    'Daikin': 'assets/images/brands/daikin.png',
    'Carrier': 'assets/images/brands/carrier.png',
    'Gree': 'assets/images/brands/gree.png',
    'Midea': 'assets/images/brands/midea.png',
    'Condor': 'assets/images/brands/condor.png',
    'Hitachi': 'assets/images/brands/hitachipng',
    'Geant': 'assets/images/brands/geant.png',
    'Iris': 'assets/images/brands/iris.png',
    'Mitsubishi Electric': 'assets/images/brands/mitsubishi-electric.png',
    'Eniem': 'assets/images/brands/eniem.png',
    'Maytag': 'assets/images/brands/MaytagMaytag.png',
    'Sanyo': 'assets/images/brands/sanyo.png',
    'Brandt': 'assets/images/brands/brandt.png',
    'Hisense': 'assets/images/brands/hisense.png',
    'Nikai': 'assets/images/brands/nikai.png'
  };

  return logoMap[brandName] || null;
}

// ============================================
// Article Detail
// ============================================
function setMeta(selector, attribute, value) {
  const element = document.querySelector(selector);
  if (element) element.setAttribute(attribute, value);
}

function renderArticleDetail() {
  const article = getArticleById(getUrlParam('id') || getUrlParam('slug') || document.body.dataset.articleId);
  const titleElement = document.getElementById('article-detail-title');
  const bodyElement = document.getElementById('article-body');
  if (!article || !titleElement || !bodyElement) {
    if (titleElement) titleElement.textContent = 'المقال غير موجود';
    if (bodyElement) bodyElement.innerHTML = '<div class="empty-state"><i class="fas fa-file-circle-xmark"></i><h2>تعذر العثور على المقال</h2><p>تحقق من الرابط ثم عد إلى صفحة المقالات.</p><a class="btn btn-primary" href="articles.html">العودة إلى المقالات</a></div>';
    return;
  }

  const canonical = document.body.dataset.articlePath
    ? `https://imadtbn.github.io/hatg-machine/${document.body.dataset.articlePath}`
    : `https://imadtbn.github.io/hatg-machine/article.html?id=${encodeURIComponent(article.id)}`;
  document.title = `${article.title} | دليل أعطال الأجهزة الكهرومنزلية`;
  setMeta('meta[name="description"]', 'content', article.excerpt);
  setMeta('link[rel="canonical"]', 'href', canonical);
  setMeta('meta[property="og:title"]', 'content', article.title);
  setMeta('meta[property="og:description"]', 'content', article.excerpt);
  setMeta('meta[property="og:url"]', 'content', canonical);
  setMeta('meta[name="twitter:title"]', 'content', article.title);
  setMeta('meta[name="twitter:description"]', 'content', article.excerpt);

  titleElement.textContent = article.title;
  document.getElementById('article-category').textContent = article.category;
  const breadcrumbCategory = document.getElementById('article-breadcrumb-category');
  if (breadcrumbCategory) breadcrumbCategory.textContent = article.category;
  document.getElementById('article-date').textContent = formatDate(article.date);
  document.getElementById('article-updated').textContent = formatDate(article.updated);
  document.getElementById('article-read-time').textContent = `${article.readTime} دقائق قراءة`;
  document.getElementById('article-body').innerHTML = article.content;

  const sourceList = document.getElementById('article-sources');
  if (sourceList) sourceList.innerHTML = (article.sources || []).map(source => `<li><a href="${source.url}" target="_blank" rel="noopener noreferrer">${source.label}</a></li>`).join('');

  const faqSection = document.getElementById('article-faq-section');
  const faqList = document.getElementById('article-faq');
  if (faqSection && faqList && article.faq?.length) {
    faqSection.hidden = false;
    faqList.innerHTML = article.faq.map(item => `<div class="faq-item"><button class="faq-question" type="button"><span>${item.q}</span><i class="fas fa-plus"></i></button><div class="faq-answer"><p>${item.a}</p></div></div>`).join('');
    initFAQ();
  }

  const related = App.data.articles.filter(item => item.id !== article.id && item.category === article.category).slice(0, 3);
  const relatedList = document.getElementById('related-articles');
  if (relatedList) relatedList.innerHTML = (related.length ? related : App.data.articles.filter(item => item.id !== article.id).slice(0, 3)).map(item => `<a href="${getArticleUrl(item)}" class="related-article"><i class="fas ${item.icon}"></i><span><strong>${item.title}</strong><small>${item.readTime} دقائق قراءة</small></span><i class="fas fa-arrow-left"></i></a>`).join('');

  const jsonLd = document.getElementById('article-jsonld');
  if (jsonLd) jsonLd.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    datePublished: article.date,
    dateModified: article.updated,
    inLanguage: 'ar',
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
    author: { '@type': 'Organization', name: 'دليل أعطال الأجهزة الكهرومنزلية' },
    publisher: { '@type': 'Organization', name: 'دليل أعطال الأجهزة الكهرومنزلية', url: 'https://imadtbn.github.io/hatg-machine/' },
    keywords: article.keywords?.join(', '),
    isAccessibleForFree: true
  });

  const faqJsonLd = document.getElementById('faq-jsonld');
  if (faqJsonLd && article.faq?.length) faqJsonLd.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: article.faq.map(item => ({ '@type': 'Question', name: item.q, acceptedAnswer: { '@type': 'Answer', text: item.a } }))
  });
}

// ============================================
// FAQ Accordion
// ============================================
function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all
      faqItems.forEach(i => i.classList.remove('active'));

      // Open clicked if wasn't active
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
}

// ============================================
// Toast Notifications
// ============================================
function showToast(message, type = 'info') {
  const container = document.querySelector('.toast-container') || createToastContainer();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const icons = {
    success: 'fa-check-circle',
    error: 'fa-times-circle',
    warning: 'fa-exclamation-triangle',
    info: 'fa-info-circle'
  };

  toast.innerHTML = `
    <i class="fas ${icons[type] || icons.info}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-20px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function createToastContainer() {
  const container = document.createElement('div');
  container.className = 'toast-container';
  document.body.appendChild(container);
  return container;
}

// ============================================
// Utility Functions
// ============================================
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function formatDate(dateStr) {
  const date = new Date(`${dateStr}T00:00:00`);
  return new Intl.DateTimeFormat('ar-DZ', { year: 'numeric', month: 'long', day: 'numeric' }).format(date);
}

function getUrlParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

function slugify(text) {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
}

// ============================================
// Google Analytics
// ============================================
function initAnalytics() {
  if (window.__analyticsLoaded) return;
  window.__analyticsLoaded = true;
  const gaScript = document.createElement('script');
  gaScript.async = true;
  gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-XK4CHWYGWZ';
  document.head.appendChild(gaScript);

  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  gtag('js', new Date());
  gtag('config', 'G-XK4CHWYGWZ');
}

function scheduleThirdParty() {
  const load = () => initAnalytics();
  ['pointerdown', 'keydown', 'touchstart'].forEach(eventName => {
    window.addEventListener(eventName, load, { once: true, passive: true });
  });
  window.setTimeout(load, 3500);
}

// ============================================
// Service Worker Registration (PWA)
// ============================================
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    const serviceWorkerPath = window.location.pathname.includes('/articles/') ? '../service-worker.js' : 'service-worker.js';
    navigator.serviceWorker.register(serviceWorkerPath, { updateViaCache: 'none' })
      .then(reg => console.log('SW registered:', reg))
      .catch(err => console.log('SW registration failed:', err));
  }
}

// ============================================
// Initialize App
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initHeader();
  initMobileMenu();
  initBackToTop();
  initScrollReveal();
  initSearch();
  initFAQ();
  initPWAInstall();

  const hydrate = async () => {
  // Load data
  const loaded = await loadData();
  if (!loaded) return;

  // Page-specific initialization
  const page = document.body.getAttribute('data-page');

  switch (page) {
    case 'home':
      renderStats();
      renderDevices();
      renderBrands();
      renderArticles();
      break;

    case 'errors':
      initFilters();
      // Apply URL params
      const deviceParam = normalizeDeviceParam(getUrlParam('device') || getUrlParam('type'));
      const brandParam = normalizeBrandParam(getUrlParam('brand'));
      const faultGroupParam = getUrlParam('faultGroup');
      if (deviceParam) {
        const deviceFilter = document.getElementById('device-filter');
        if (deviceFilter) deviceFilter.value = deviceParam;
      }
      if (brandParam) {
        const brandFilter = document.getElementById('brand-filter');
        if (brandFilter) brandFilter.value = brandParam;
      }
      App.config.currentFilters = {
        device: deviceParam || '',
        brand: brandParam || '',
        faultGroup: faultGroupParam || '',
        severity: '',
        sort: 'newest'
      };
      applyFilters();
      break;

    case 'brands':
      renderBrands();
      break;

    case 'brand-detail':
      renderBrandDetail();
      break;

    case 'error-detail':
      renderErrorDetail();
      break;

    case 'articles':
      renderArticles();
      break;

    case 'article':
      renderArticleDetail();
      break;

    case 'search':
      renderSearchPage();
      break;
  }

  // Register Service Worker and defer third-party work until after the first paint.
  registerServiceWorker();
  scheduleThirdParty();
  };
  if ('requestIdleCallback' in window) requestIdleCallback(hydrate, { timeout: 800 });
  else window.setTimeout(hydrate, 120);
});

// ============================================
// Page-Specific Render Functions
// ============================================
function renderBrandDetail() {
  const brandName = getUrlParam('name');
  if (!brandName) return;

  const brand = App.data.brands.find(b => b.name === brandName);
  if (!brand) return;

  const brandKey = brandName.toLowerCase();

  // Update page title
  document.title = `${brand.name} - دليل أعطال الأجهزة الكهرومنزلية`;

  // Update hero
  const heroTitle = document.getElementById('brand-hero-title');
  const heroDesc = document.getElementById('brand-hero-desc');
  const heroLogo = document.getElementById('brand-hero-logo');

  if (heroTitle) heroTitle.textContent = brand.name;
  if (heroDesc) heroDesc.textContent = `أكواد أخطاء وإصلاحات أجهزة ${brand.name}`;
  if (heroLogo) {
    const logoUrl = getBrandLogo(brand.name);
    heroLogo.src = logoUrl || '';
    heroLogo.alt = brand.name;
    if (!logoUrl) heroLogo.style.display = 'none';
  }

  // Filter errors
  const brandErrors = App.data.errors.filter(e => (e.brand || '').toLowerCase() === brandKey);

  // Render stats
  const statsContainer = document.getElementById('brand-stats');
  if (statsContainer) {
    const devices = [...new Set(brandErrors.map(e => e.deviceTypeAr || e.deviceType || ''))].filter(Boolean);
    const highSeverity = brandErrors.filter(e => (e.severity || '').toLowerCase() === 'high').length;

    statsContainer.innerHTML = `
      <div class="stat-card">
        <div class="stat-number">${brandErrors.length}</div>
        <div class="stat-label">إجمالي الأخطاء</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${devices.length}</div>
        <div class="stat-label">الأجهزة المدعومة</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${highSeverity}</div>
        <div class="stat-label">أخطاء خطيرة</div>
      </div>
    `;
  }

  // Render errors
  const errorsContainer = document.getElementById('brand-errors-grid');
  if (errorsContainer) {
    if (brandErrors.length === 0) {
      errorsContainer.innerHTML = `
        <div class="empty-state" style="grid-column: 1/-1;">
          <div class="empty-state-icon"><i class="fas fa-inbox"></i></div>
          <h3>لا توجد أخطاء مسجلة</h3>
          <p>لم يتم العثور على أخطاء مسجلة لهذه الماركة</p>
        </div>
      `;
    } else {
      errorsContainer.innerHTML = brandErrors.map(error => `
        <div class="error-card ${error.severity || ''} reveal">
          <div class="error-code-display ${error.severity || ''}">${error.errorCode || ''}</div>
          <h3 class="card-title">${error.titleAr || error.title || ''}</h3>
          <p class="card-text">${(error.causes && error.causes.length ? error.causes[0] : 'سبب غير محدد').substring(0, 100)}...</p>
          <div class="card-meta">
            <span class="badge badge-primary"><i class="fas fa-microchip"></i> ${error.deviceTypeAr || ''}</span>
            ${getSeverityBadge(error.severity)}
          </div>
          <div class="mt-3">
            <a href="${getErrorUrl(error)}" class="btn btn-sm btn-primary w-full">
              <i class="fas fa-info-circle"></i> تفاصيل الخطأ
            </a>
          </div>
        </div>
      `).join('');
    }
  }

  initScrollReveal();
}

function renderList(items, emptyText = 'لا توجد معلومات مسجلة') {
  return Array.isArray(items) && items.length
    ? `<ul class="detail-list">${items.map(item => `<li>${item}</li>`).join('')}</ul>`
    : `<p class="detail-empty">${emptyText}</p>`;
}

function renderNumberedList(items, emptyText = 'لا توجد خطوات مسجلة') {
  return Array.isArray(items) && items.length
    ? `<ol class="steplist">${items.map(item => `<li>${item}</li>`).join('')}</ol>`
    : `<p class="detail-empty">${emptyText}</p>`;
}

function renderSafetyNotice(error) {
  const notes = Array.isArray(error.safetyNotes) ? error.safetyNotes : [];
  if (!error.needsTechnician && !notes.length && error.severity !== 'high') return '';
  const title = error.needsTechnician || error.severity === 'high' ? 'تنبيه سلامة مهم' : 'قبل الفحص';
  const intro = error.needsTechnician ? 'هذا العطل قد يتطلب فنيّاً مؤهلاً. افصل الجهاز عن الكهرباء ولا تفك الأجزاء الداخلية.' : 'افصل الجهاز عن الكهرباء والماء عند الحاجة، واتبع دليل الطراز قبل أي فحص.';
  return `<div class="safety-notice"><div class="safety-notice-icon"><i class="fas fa-shield-alt"></i></div><div><h3>${title}</h3><p>${intro}</p>${notes.length ? renderList(notes) : ''}</div></div>`;
}

function renderSourceSection(error) {
  const urls = Array.isArray(error.sourceUrls) ? error.sourceUrls : [];
  if (!urls.length) return '';
  return `<div class="detail-section source-section"><div class="section-heading-row"><h3><i class="fas fa-link"></i> المصادر والتحقق</h3><span class="verification-status"><i class="fas fa-check-circle"></i> ${getVerificationLabel(error.verificationStatus)}</span></div><p class="source-meta">آخر تحقق: ${error.lastVerified || 'غير محدد'} · الثقة: ${error.confidence === 'high' ? 'مرتفعة' : error.confidence === 'medium' ? 'متوسطة' : 'محدودة'}</p><div class="source-links">${urls.map((url, index) => `<a href="${url}" target="_blank" rel="noopener noreferrer"><span>${index + 1}</span><span>${url.replace(/^https?:\/\//, '').split('/')[0]}</span><i class="fas fa-external-link-alt"></i></a>`).join('')}</div></div>`;
}

function renderFaqSection(error) {
  if (!Array.isArray(error.faq) || !error.faq.length) return '';
  return `<div class="detail-section faq-detail-section"><h3><i class="fas fa-question-circle"></i> أسئلة شائعة حول الكود</h3><div class="faq-list">${error.faq.map(item => `<details><summary>${item.q}</summary><p>${item.a}</p></details>`).join('')}</div></div>`;
}

function renderErrorDetail() {
  const errorId = getUrlParam('id');
  const device = getUrlParam('device');
  const brand = getUrlParam('brand');
  const code = getUrlParam('code');

  if (!errorId && (!device || !brand || !code)) return;

  const legacyDevice = normalizeDeviceParam(device);
  const legacyBrand = normalizeBrandParam(brand);
  const error = App.data.errors.find(e =>
    (errorId && (e.id || '') === errorId) ||
    (!errorId && (e.deviceType || '') === legacyDevice && getBrandId(e) === legacyBrand && (e.errorCode || '') === code)
  );

  if (!error) {
    document.getElementById('error-detail-content').innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon"><i class="fas fa-exclamation-triangle"></i></div>
        <h3>الخطأ غير موجود</h3>
        <p>لم يتم العثور على تفاصيل هذا الخطأ</p>
        <a href="errors.html" class="btn btn-primary mt-3">العودة لقائمة الأخطاء</a>
      </div>
    `;
    return;
  }

  // Update page title
  document.title = `كود ${error.displayCode || error.errorCode || ''} - ${getDeviceLabel(error.deviceType)} ${error.brandAr || getBrandLabel(getBrandId(error))}`;

  // Update hero
  const heroCode = document.getElementById('error-hero-code');
  const heroTitle = document.getElementById('error-hero-title');
  const heroSubtitle = document.getElementById('error-hero-subtitle');

  if (heroCode) {
    heroCode.textContent = error.displayCode || error.errorCode || '';
    heroCode.className = `error-code-large ${error.severity}`;
  }

  if (heroTitle) heroTitle.textContent = error.titleAr || error.title || '';
  const breadcrumbError = document.getElementById('breadcrumb-error');
  if (breadcrumbError) breadcrumbError.textContent = error.displayCode || error.errorCode || 'تفاصيل الخطأ';
  if (heroSubtitle) {
    heroSubtitle.innerHTML = `
      <span class="badge badge-primary"><i class="fas fa-microchip"></i> ${getDeviceLabel(error.deviceType)}</span>
      <span class="badge badge-secondary"><i class="fas fa-tag"></i> ${error.brandAr || getBrandLabel(getBrandId(error))}</span>
      <span class="badge badge-secondary"><i class="fas fa-layer-group"></i> ${getFaultGroupLabel(error.faultGroup)}</span>
      ${error.confidence === 'high' ? '<span class="badge badge-success"><i class="fas fa-check-circle"></i> موثق</span>' : '<span class="badge badge-warning"><i class="fas fa-book"></i> راجع دليل الطراز</span>'}
      ${getSeverityBadge(error.severity)}
    `;
  }

  // Render details
  const content = document.getElementById('error-detail-content');
  if (content) {
    const summary = getErrorSummary(error);
    const modelNames = Array.isArray(error.models) && error.models.length ? error.models.join('، ') : 'غير محدد؛ راجع دليل الطراز';
    content.innerHTML = `
      ${renderSafetyNotice(error)}

      <div class="detail-summary-grid">
        <div class="detail-summary-card detail-summary-primary">
          <span class="summary-card-label"><i class="fas fa-bullseye"></i> الخلاصة</span>
          <strong>${summary}</strong>
          <span>الكود ${error.displayCode || error.errorCode || ''} في ${getDeviceLabel(error.deviceType)}</span>
        </div>
        <div class="detail-summary-card">
          <span class="summary-card-label"><i class="fas fa-clipboard-check"></i> حالة التحقق</span>
          <strong>${getVerificationLabel(error.verificationStatus)}</strong>
          <span>${error.confidence === 'high' ? 'المعلومة موثقة من مصدر الشركة' : 'تحقق من دليل رقم الطراز قبل الإصلاح'}</span>
        </div>
        <div class="detail-summary-card">
          <span class="summary-card-label"><i class="fas fa-clock"></i> زمن الإصلاح</span>
          <strong>${error.repairDuration || 'غير محدد'}</strong>
          <span>${error.homeRepair === false ? 'يفضل تدخل فني' : 'قد يكون الفحص الأولي منزلياً'}</span>
        </div>
      </div>

      <div class="detail-section">
        <div class="section-heading-row"><h3><i class="fas fa-search"></i> لماذا ظهر هذا الكود؟</h3><span class="section-count">${(error.causes || []).length} أسباب محتملة</span></div>
        <p class="detail-lead">${summary}</p>
        ${renderList(error.causes, 'لم يُسجل سبب تفصيلي لهذا الكود.')}
      </div>

      <div class="detail-two-column">
        <div class="detail-section">
          <h3><i class="fas fa-eye"></i> الأعراض التي قد تلاحظها</h3>
          ${renderList(error.symptoms)}
        </div>
        <div class="detail-section">
          <h3><i class="fas fa-cogs"></i> الأجزاء المرتبطة</h3>
          ${renderList(error.affectedParts)}
        </div>
      </div>

      <div class="detail-section diagnosis-section">
        <div class="section-heading-row"><h3><i class="fas fa-stethoscope"></i> خطوات التشخيص</h3><span class="section-count">افحص بالترتيب</span></div>
        ${renderNumberedList(error.diagnosisSteps, 'لا توجد خطوات تشخيص منشورة؛ راجع دليل الطراز.')}
      </div>

      <div class="detail-section repair-section">
        <div class="section-heading-row"><h3><i class="fas fa-wrench"></i> الحل والإصلاح المقترح</h3><span class="section-count">${error.needsTechnician ? 'يحتاج فني' : 'خطوات أولية'}</span></div>
        ${renderNumberedList(error.repairSteps)}
        ${Array.isArray(error.toolsRequired) && error.toolsRequired.length ? `<div class="tools-row"><strong><i class="fas fa-toolbox"></i> الأدوات المحتملة:</strong>${error.toolsRequired.map(tool => `<span class="tag">${tool}</span>`).join('')}</div>` : ''}
      </div>

      <div class="detail-section">
        <h3><i class="fas fa-info-circle"></i> معلومات الجهاز والطراز</h3>
        <div class="info-grid">
          <div class="info-item"><div class="label">الجهاز</div><div class="value">${getDeviceLabel(error.deviceType)}</div></div>
          <div class="info-item"><div class="label">الماركة</div><div class="value">${error.brandAr || getBrandLabel(getBrandId(error))}</div></div>
          <div class="info-item"><div class="label">مجموعة العطل</div><div class="value">${getFaultGroupLabel(error.faultGroup)}</div></div>
          <div class="info-item"><div class="label">نطاق الطراز</div><div class="value">${getModelScopeLabel(error.modelScope)}</div></div>
          <div class="info-item"><div class="label">الطرازات المذكورة</div><div class="value">${modelNames}</div></div>
          <div class="info-item"><div class="label">آخر تحقق</div><div class="value">${error.lastVerified || 'غير محدد'}</div></div>
        </div>
        <div class="tag-list">${(error.faultTags || []).map(tag => `<span class="tag"><i class="fas fa-tag"></i> ${tag.replaceAll('-', ' ')}</span>`).join('')}</div>
      </div>

      <div class="detail-two-column">
        <div class="detail-section">
          <h3><i class="fas fa-ban"></i> أخطاء شائعة يجب تجنبها</h3>
          ${renderList(error.commonMistakes)}
        </div>
        <div class="detail-section">
          <h3><i class="fas fa-leaf"></i> نصائح الوقاية</h3>
          ${renderList(error.preventionTips)}
        </div>
      </div>

      ${renderFaqSection(error)}
      ${renderSourceSection(error)}
      ${renderRelatedErrors(error)}
    `;
  }
}

function renderRelatedErrors(currentError) {
  const related = App.data.errors.filter(e =>
    getBrandId(e) === getBrandId(currentError) &&
    (e.deviceType || '') === (currentError.deviceType || '') &&
    (e.errorCode || '') !== (currentError.errorCode || '')
  ).sort((a, b) => Number(b.faultGroup === currentError.faultGroup) - Number(a.faultGroup === currentError.faultGroup)).slice(0, 3);

  if (related.length === 0) return '';

  return `
    <div class="detail-section">
      <h3><i class="fas fa-link"></i> أخطاء ذات صلة</h3>
      <div class="cards-grid" style="grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));">
        ${related.map(error => `
          <div class="error-card ${error.severity}">
            <div class="error-code-display ${error.severity}">${error.displayCode || error.errorCode || ''}</div>
  <h4 class="card-title">${error.titleAr || error.title || ''}</h4>
          <a href="${getErrorUrl(error)}" class="btn btn-sm btn-primary w-full">
              <i class="fas fa-info-circle"></i> التفاصيل
            </a>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderSearchPage() {
  const query = getUrlParam('q');
  if (!query) return;

  document.getElementById('search-query').textContent = query;

  const results = searchAll(query);
  const container = document.getElementById('search-results');

  if (results.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon"><i class="fas fa-search"></i></div>
        <h3>لا توجد نتائج لـ "${query}"</h3>
        <p>جرب البحث بكلمات مختلفة أو تحقق من الإملاء</p>
      </div>
    `;
    return;
  }

  container.innerHTML = results.map(result => `
    <div class="card reveal">
      <div class="card-body">
        <div class="card-meta mb-2">
          <span class="badge badge-primary">
            <i class="fas ${result.icon}"></i> ${result.type === 'error' ? 'خطأ' : 'ماركة'}
          </span>
        </div>
        <h3 class="card-title">${result.title}</h3>
        <p class="card-text">${result.subtitle}</p>
        <a href="${result.url}" class="btn btn-primary">
          <i class="fas fa-arrow-left"></i> عرض التفاصيل
        </a>
      </div>
    </div>
  `).join('');

  initScrollReveal();
}
