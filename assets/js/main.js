/**
 * دليل أعطال الأجهزة الكهرومنزلية - Main JavaScript
 * Modern, interactive, and SEO-optimized
 */

// ============================================
// Global State
// ============================================
const App = {
  data: {
    errors: [],
    brands: [],
    articles: []
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
    const [errorsRes, brandsRes] = await Promise.all([
      fetch('data/errors.json'),
      fetch('data/brands.json')
    ]);

    App.data.errors = await errorsRes.json();
    App.data.brands = await brandsRes.json();

    // Add articles data
    App.data.articles = generateArticles();

    return true;
  } catch (error) {
    console.error('Error loading data:', error);
    showToast('حدث خطأ في تحميل البيانات', 'error');
    return false;
  }
}

function generateArticles() {
  return [
    {
      id: 'maintenance-tips',
      title: 'نصائح صيانة دورية للأجهزة الكهرومنزلية',
      excerpt: 'تعرف على أهم النصائح للحفاظ على أجهزتك الكهرومنزلية وتجنب الأعطال المفاجئة.',
      icon: 'fa-tools',
      date: '2024-01-15',
      category: 'صيانة'
    },
    {
      id: 'energy-saving',
      title: 'كيفية توفير الطاقة في الأجهزة الكهرومنزلية',
      excerpt: 'طرق فعالة لتقليل استهلاك الكهرباء والحفاظ على كفاءة الأجهزة.',
      icon: 'fa-bolt',
      date: '2024-02-10',
      category: 'توفير الطاقة'
    },
    {
      id: 'washing-machine-care',
      title: 'العناية بغسالة الملابس - دليل شامل',
      excerpt: 'كل ما تحتاج معرفته للحفاظ على غسالتك وتمديد عمرها الافتراضي.',
      icon: 'fa-tshirt',
      date: '2024-03-05',
      category: 'غسالات'
    },
    {
      id: 'ac-maintenance',
      title: 'صيانة المكيفات قبل فصل الصيف',
      excerpt: 'خطوات ضرورية للتحضير لموسم الصيف وضمان عمل المكيف بكفاءة.',
      icon: 'fa-snowflake',
      date: '2024-04-01',
      category: 'مكيفات'
    },
    {
      id: 'dishwasher-errors',
      title: 'أشهر أخطاء غسالة الأطباق وكيفية إصلاحها',
      excerpt: 'دليل شامل لأكثر الأخطاء شيوعاً في غسالات الأطباق وحلولها.',
      icon: 'fa-utensils',
      date: '2024-05-12',
      category: 'غسالات أطباق'
    },
    {
      id: 'choose-washing-machine',
      title: 'كيف تختار غسالة الملابس المناسبة',
      excerpt: 'دليل شراء شامل لاختيار الغسالة الأنسب لاحتياجاتك وميزانيتك.',
      icon: 'fa-shopping-cart',
      date: '2024-06-20',
      category: 'دليل الشراء'
    }
  ];
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

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
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

  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  });

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
    if ((error.errorCode || '').toLowerCase().includes(q) ||
      (error.titleAr || error.title || '').toLowerCase().includes(q) ||
      (error.deviceTypeAr || error.deviceType || '').toLowerCase().includes(q) ||
      (error.brandAr || error.brand || '').toLowerCase().includes(q)) {
      results.push({
        type: 'error',
        title: `كود الخطأ ${error.errorCode || ''}`,
        subtitle: `${error.deviceTypeAr || ''} - ${error.brandAr || ''}`,
        url: `error.html?device=${encodeURIComponent(error.deviceTypeAr || '')}&brand=${encodeURIComponent(error.brandAr || '')}&code=${encodeURIComponent(error.errorCode || '')}`,
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
  const severityFilter = document.getElementById('severity-filter');
  const sortFilter = document.getElementById('sort-filter');

  const filters = [deviceFilter, brandFilter, severityFilter, sortFilter];

  filters.forEach(filter => {
    if (!filter) return;
    filter.addEventListener('change', () => {
      App.config.currentFilters = {
        device: deviceFilter?.value || '',
        brand: brandFilter?.value || '',
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
    filtered = filtered.filter(e => (e.deviceTypeAr || '') === filters.device);
  }
  if (filters.brand) {
    filtered = filtered.filter(e => (e.brandAr || '') === filters.brand);
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
    countEl.textContent = `${errors.length} نتيجة`;
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
    <div class="error-card ${error.severity} reveal">
      <div class="error-code-display ${error.severity}">${error.errorCode || ''}</div>
      <h3 class="card-title">${error.titleAr || error.title || ''}</h3>
      <p class="card-text">${(error.causes && error.causes.length ? error.causes[0] : 'سبب غير محدد').substring(0, 100)}...</p>
      <div class="card-meta">
        <span class="badge badge-primary"><i class="fas fa-microchip"></i> ${error.deviceTypeAr || ''}</span>
        <span class="badge badge-secondary"><i class="fas fa-tag"></i> ${error.brandAr || ''}</span>
        ${getSeverityBadge(error.severity)}
      </div>
      <div class="mt-3">
        <a href="error.html?device=${encodeURIComponent(error.deviceTypeAr || '')}&brand=${encodeURIComponent(error.brandAr || '')}&code=${encodeURIComponent(error.errorCode || '')}" 
           class="btn btn-sm btn-primary w-full">
          <i class="fas fa-info-circle"></i> تفاصيل الخطأ
        </a>
      </div>
    </div>
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
    const b = e.brandAr || e.brand || '';
    brandCounts[b] = (brandCounts[b] || 0) + 1;
  });

  container.innerHTML = App.data.brands.map(brand => {
    const count = brandCounts[brand.name] || 0;
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
    { id: 'dishwasher', name: 'غسالات الأطباق', icon: 'fa-utensils', desc: 'أكواد أخطاء وإصلاحات غسالات الأطباق', color: 'device-dishwasher' },
    { id: 'ac', name: 'المكيفات', icon: 'fa-snowflake', desc: 'أكواد أخطاء وإصلاحات المكيفات', color: 'device-ac' }
  ];

  container.innerHTML = devices.map(device => {
    const count = App.data.errors.filter(e => (e.deviceTypeAr || '') === device.name).length;
    return `
      <a href="errors.html?device=${encodeURIComponent(device.name)}" class="device-card ${device.color} reveal">
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

  container.innerHTML = App.data.articles.map(article => `
    <a href="article.html?id=${article.id}" class="article-card reveal">
      <div class="article-image"><i class="fas ${article.icon}"></i></div>
      <div class="article-content">
        <div class="article-meta">
          <span><i class="fas fa-calendar"></i> ${formatDate(article.date)}</span>
          <span><i class="fas fa-folder"></i> ${article.category}</span>
        </div>
        <h3 class="article-title">${article.title}</h3>
        <p class="article-excerpt">${article.excerpt}</p>
      </div>
    </a>
  `).join('');

  initScrollReveal();
}

function renderStats() {
  const totalErrors = App.data.errors.length;
  const totalBrands = App.data.brands.length;
  const totalDevices = new Set(App.data.errors.map(e => e.deviceTypeAr || '')).size;
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
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
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
  // Google Analytics 4
  const gaScript = document.createElement('script');
  gaScript.async = true;
  gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-XK4CHWYGWZ';
  document.head.appendChild(gaScript);

  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  gtag('js', new Date());
  gtag('config', 'G-XK4CHWYGWZ');
}

// ============================================
// Service Worker Registration (PWA)
// ============================================
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
      .then(reg => console.log('SW registered:', reg))
      .catch(err => console.log('SW registration failed:', err));
  }
}

// ============================================
// Initialize App
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  initHeader();
  initMobileMenu();
  initBackToTop();
  initScrollReveal();
  initSearch();
  initFAQ();

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
      const deviceParam = getUrlParam('device');
      const brandParam = getUrlParam('brand');
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

    case 'search':
      renderSearchPage();
      break;
  }

  // Register service worker
  registerServiceWorker();
});

// ============================================
// Page-Specific Render Functions
// ============================================
function renderBrandDetail() {
  const brandName = getUrlParam('name');
  if (!brandName) return;

  const brand = App.data.brands.find(b => b.name === brandName);
  if (!brand) return;

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
  const brandErrors = App.data.errors.filter(e => (e.brandAr || e.brand || '') === brandName);

  // Render stats
  const statsContainer = document.getElementById('brand-stats');
  if (statsContainer) {
    const devices = [...new Set(brandErrors.map(e => e.device))];
    const highSeverity = brandErrors.filter(e => e.severity === 'high').length;

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
        <div class="error-card ${error.severity} reveal">
          <div class="error-code-display ${error.severity}">${error.errorCode || ''}</div>
          <h3 class="card-title">${error.titleAr || error.title || ''}</h3>
          <p class="card-text">${(error.causes && error.causes.length ? error.causes[0] : 'سبب غير محدد').substring(0, 100)}...</p>
          <div class="card-meta">
            <span class="badge badge-primary"><i class="fas fa-microchip"></i> ${error.deviceTypeAr || ''}</span>
            ${getSeverityBadge(error.severity)}
          </div>
          <div class="mt-3">
            <a href="error.html?device=${encodeURIComponent(error.deviceTypeAr || '')}&brand=${encodeURIComponent(error.brandAr || '')}&code=${encodeURIComponent(error.errorCode || '')}" 
               class="btn btn-sm btn-primary w-full">
              <i class="fas fa-info-circle"></i> تفاصيل الخطأ
            </a>
          </div>
        </div>
      `).join('');
    }
  }

  initScrollReveal();
}

function renderErrorDetail() {
  const device = getUrlParam('device');
  const brand = getUrlParam('brand');
  const code = getUrlParam('code');

  if (!device || !brand || !code) return;

  const error = App.data.errors.find(e =>
    (e.deviceTypeAr || '') === device &&
    (e.brandAr || '') === brand &&
    (e.errorCode || '') === code
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
  document.title = `كود الخطأ ${error.errorCode || ''} - ${error.deviceTypeAr || ''} ${error.brandAr || ''}`;

  // Update hero
  const heroCode = document.getElementById('error-hero-code');
  const heroTitle = document.getElementById('error-hero-title');
  const heroSubtitle = document.getElementById('error-hero-subtitle');

  if (heroCode) {
    heroCode.textContent = error.code;
    heroCode.className = `error-code-large ${error.severity}`;
  }
  if (heroTitle) heroTitle.textContent = error.description;
  if (heroSubtitle) {
    heroSubtitle.innerHTML = `
    <span class="badge badge-primary">${error.deviceTypeAr || ''}</span>
    <span class="badge badge-secondary">${error.brandAr || ''}</span>
    ${getSeverityBadge(error.severity)}
  `;
  }

  // Render details
  const content = document.getElementById('error-detail-content');
  if (content) {
    content.innerHTML = `
      <!-- Cause -->
      <div class="detail-section">
        <h3><i class="fas fa-search"></i> سبب الخطأ</h3>
  <p>${error.causes && error.causes.length ? error.causes.join('، ') : 'سبب غير محدد'}</p>
        </div>
      
      <!-- Solution -->
      <div class="detail-section">
        <h3><i class="fas fa-wrench"></i> الحل المقترح</h3>
        <ol class="steplist">
${(error.repairSteps && Array.isArray(error.repairSteps) ? error.repairSteps : ['لا توجد خطوات حل مسجلة']).map(step => `<li>${step}</li>`).join('')}        </ol>
      </div>
      
      <!-- Info Grid -->
      <div class="detail-section">
        <h3><i class="fas fa-info-circle"></i> معلومات إضافية</h3>
        <div class="info-grid">
          <div class="info-item">
            <div class="label">الجهاز</div>
  <div class="value">${error.deviceTypeAr || ''}</div>
          </div>
          <div class="info-item">
            <div class="label">الماركة</div>
  <div class="value">${error.brandAr || ''}</div>
          </div>
          <div class="info-item">
            <div class="label">الخطورة</div>
  <div class="value">${error.severityAr || error.severity || ''}</div>
          </div>
          <div class="info-item">
            <div class="label">تاريخ الإضافة</div>
            <div class="value">${formatDate(error.date)}</div>
          </div>
        </div>
      </div>
      
      <!-- Related Errors -->
      ${renderRelatedErrors(error)}
    `;
  }
}

function renderRelatedErrors(currentError) {
  const related = App.data.errors.filter(e =>
    (e.brandAr || '') === (currentError.brandAr || '') &&
    (e.deviceTypeAr || '') === (currentError.deviceTypeAr || '') &&
    (e.errorCode || '') !== (currentError.errorCode || '')
  ).slice(0, 3);

  if (related.length === 0) return '';

  return `
    <div class="detail-section">
      <h3><i class="fas fa-link"></i> أخطاء ذات صلة</h3>
      <div class="cards-grid" style="grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));">
        ${related.map(error => `
          <div class="error-card ${error.severity}">
            <div class="error-code-display ${error.severity}">${error.errorCode || ''}</div>
  <h4 class="card-title">${error.titleAr || error.title || ''}</h4>
  <a href="error.html?device=${encodeURIComponent(error.deviceTypeAr || '')}&brand=${encodeURIComponent(error.brandAr || '')}&code=${encodeURIComponent(error.errorCode || '')}">
class="btn btn-sm btn-primary w-full">
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
