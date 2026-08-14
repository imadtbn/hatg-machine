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
    const assetBase = window.location.pathname.includes('/articles/') ? '../' : '';
    const [errorsRes, brandsRes, articlesRes] = await Promise.all([
      fetch(`${assetBase}data/errors.json`),
      fetch(`${assetBase}data/brands.json`),
      fetch(`${assetBase}data/articles.json`)
    ]);

    if (!errorsRes.ok || !brandsRes.ok || !articlesRes.ok) {
      throw new Error('تعذر تحميل أحد ملفات البيانات');
    }

    App.data.errors = await errorsRes.json();
    App.data.brands = await brandsRes.json();
    App.data.articles = await articlesRes.json();

    return true;
  } catch (error) {
    console.error('Error loading data:', error);
    showToast('حدث خطأ في تحميل البيانات', 'error');
    return false;
  }
}

function getArticleById(id) {
  return App.data.articles.find(article => article.id === id || article.slug === id);
}

function getArticleUrl(article) {
  const articleBase = window.location.pathname.includes('/articles/') ? '' : 'articles/';
  return `${articleBase}${encodeURIComponent(article.slug || article.id)}.html`;
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
    const key = (e.brand || '').toLowerCase();
    brandCounts[key] = (brandCounts[key] || 0) + 1;
  });

  container.innerHTML = App.data.brands.map(brand => {
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
    const serviceWorkerPath = window.location.pathname.includes('/articles/') ? '../service-worker.js' : 'service-worker.js';
    navigator.serviceWorker.register(serviceWorkerPath)
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

    case 'article':
      renderArticleDetail();
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
            <a href="error.html?device=${encodeURIComponent(error.deviceTypeAr || '')}&brand=${encodeURIComponent(error.brandAr || '')}&code=${encodeURIComponent(error.errorCode || '')}"                class="btn btn-sm btn-primary w-full">
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
    <span class="badge badge-secondary">${error.brand|| ''}</span>
    <span class="badge badge-secondary">${error.titleAr || ''}</span>
    <span class="badge badge-secondary">${error.errorCode || ''}</span>

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
