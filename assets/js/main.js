/* ============================================
   دليل أعطال الأجهزة الكهرومنزلية - JavaScript
   ============================================ */

(function() {
  'use strict';

  // === Data Store ===
  let brandsData = [];
  let errorsData = [];

  // === Initialize ===
  document.addEventListener('DOMContentLoaded', function() {
    loadData();
    initTheme();
    initHeader();
    initSearch();
    initScrollEffects();
    initBackToTop();
    initFAQ();
    initTabs();
    initImageZoom();
    initLazyLoading();
    initCounters();
  });

  // === Load Data ===
  async function loadData() {
    try {
      const [brandsRes, errorsRes] = await Promise.all([
        fetch('data/brands.json'),
        fetch('data/errors.json')
      ]);
      brandsData = await brandsRes.json();
      errorsData = await errorsRes.json();
    } catch (e) {
      console.error('Error loading data:', e);
    }
  }

  // === Theme Toggle ===
  function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const toggleBtn = document.querySelector('.theme-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', function() {
        const current = document.documentElement.getAttribute('data-theme');
        const newTheme = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        toggleBtn.textContent = newTheme === 'dark' ? '☀️' : '🌙';
      });
      
      toggleBtn.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    }
  }

  // === Header Scroll Effect ===
  function initHeader() {
    const header = document.querySelector('.header');
    if (!header) return;
    
    let lastScroll = 0;
    
    window.addEventListener('scroll', function() {
      const currentScroll = window.pageYOffset;
      
      if (currentScroll > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      
      lastScroll = currentScroll;
    });

    // Mobile menu
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.nav');
    if (menuToggle && nav) {
      menuToggle.addEventListener('click', function() {
        nav.classList.toggle('active');
      });
    }
  }

  // === Smart Search ===
  function initSearch() {
    const searchInputs = document.querySelectorAll('.search-bar input, .hero-search input');
    
    searchInputs.forEach(input => {
      let debounceTimer;
      
      input.addEventListener('input', function() {
        clearTimeout(debounceTimer);
        const query = this.value.trim().toLowerCase();
        
        if (query.length < 2) {
          closeSearchResults();
          return;
        }
        
        debounceTimer = setTimeout(function() {
          performSearch(query);
        }, 300);
      });

      input.addEventListener('focus', function() {
        if (this.value.trim().length >= 2) {
          performSearch(this.value.trim().toLowerCase());
        }
      });
    });

    document.addEventListener('click', function(e) {
      if (!e.target.closest('.search-bar') && !e.target.closest('.hero-search')) {
        closeSearchResults();
      }
    });
  }

  function performSearch(query) {
    const results = [];
    
    // Search in errors
    errorsData.forEach(function(error) {
      const matchFields = [
        error.errorCode?.toLowerCase(),
        error.titleAr?.toLowerCase(),
        error.brandAr?.toLowerCase(),
        error.deviceTypeAr?.toLowerCase(),
        error.categoryAr?.toLowerCase(),
        ...error.causes?.map(c => c.toLowerCase()),
        ...error.affectedParts?.map(p => p.toLowerCase())
      ];
      
      const isMatch = matchFields.some(field => field && field.includes(query));
      
      if (isMatch) {
        results.push({
          type: 'error',
          data: error,
          title: `${error.errorCode} - ${error.titleAr}`,
          subtitle: `${error.brandAr} - ${error.deviceTypeAr}`,
          url: `error.html?id=${error.id}`
        });
      }
    });

    // Search in brands
    brandsData.forEach(function(brand) {
      if (brand.name.toLowerCase().includes(query) || 
          brand.nameAr.includes(query) ||
          (brand.countryAr && brand.countryAr.includes(query))) {
        results.push({
          type: 'brand',
          data: brand,
          title: brand.nameAr,
          subtitle: brand.name,
          url: `brand.html?id=${brand.id}`
        });
      }
    });

    displaySearchResults(results.slice(0, 8));
  }

  function displaySearchResults(results) {
    // Find the search results container near the active input
    const activeInput = document.activeElement;
    const container = activeInput?.closest('.search-bar, .hero-search')?.querySelector('.search-results');
    
    if (!container) return;
    
    if (results.length === 0) {
      container.innerHTML = '<div class="search-result-item">لا توجد نتائج مطابقة</div>';
    } else {
      container.innerHTML = results.map(function(item) {
        return `
          <div class="search-result-item" onclick="window.location.href='${item.url}'">
            <strong>${item.title}</strong>
            <div style="font-size:0.8rem;color:var(--text-secondary);margin-top:4px;">${item.subtitle}</div>
          </div>
        `;
      }).join('');
    }
    
    container.classList.add('active');
  }

  function closeSearchResults() {
    document.querySelectorAll('.search-results').forEach(function(el) {
      el.classList.remove('active');
    });
  }

  // === Scroll Reveal Effects ===
  function initScrollEffects() {
    const revealElements = document.querySelectorAll('.reveal');
    
    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(function(el) {
      observer.observe(el);
    });
  }

  // === Back to Top ===
  function initBackToTop() {
    const btn = document.querySelector('.back-to-top');
    if (!btn) return;
    
    window.addEventListener('scroll', function() {
      if (window.pageYOffset > 300) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    });
    
    btn.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // === FAQ Accordion ===
  function initFAQ() {
    document.querySelectorAll('.faq-question').forEach(function(q) {
      q.addEventListener('click', function() {
        const item = this.parentElement;
        const isActive = item.classList.contains('active');
        
        // Close all
        document.querySelectorAll('.faq-item').forEach(function(faq) {
          faq.classList.remove('active');
        });
        
        // Open clicked if it wasn't active
        if (!isActive) {
          item.classList.add('active');
        }
      });
    });
  }

  // === Tabs ===
  function initTabs() {
    document.querySelectorAll('.tab-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        const tabGroup = this.closest('.tabs');
        tabGroup.querySelectorAll('.tab-btn').forEach(function(b) {
          b.classList.remove('active');
        });
        this.classList.add('active');
      });
    });
  }

  // === Image Zoom ===
  function initImageZoom() {
    const overlay = document.createElement('div');
    overlay.className = 'zoom-overlay';
    overlay.innerHTML = '<img src="" alt="تكبير">';
    document.body.appendChild(overlay);
    
    overlay.addEventListener('click', function() {
      this.classList.remove('active');
    });
    
    document.querySelectorAll('.image-zoom').forEach(function(img) {
      img.addEventListener('click', function() {
        overlay.querySelector('img').src = this.src;
        overlay.classList.add('active');
      });
    });
  }

  // === Lazy Loading ===
  function initLazyLoading() {
    if ('IntersectionObserver' in window) {
      const lazyImages = document.querySelectorAll('img[data-src]');
      
      const imageObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        });
      }, {
        rootMargin: '50px 0px'
      });

      lazyImages.forEach(function(img) {
        imageObserver.observe(img);
      });
    } else {
      // Fallback for older browsers
      document.querySelectorAll('img[data-src]').forEach(function(img) {
        img.src = img.dataset.src;
      });
    }
  }

  // === Counter Animation ===
  function initCounters() {
    const counters = document.querySelectorAll('.stat-number[data-count]');
    
    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.count);
          animateCounter(el, target);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(function(counter) {
      observer.observe(counter);
    });
  }

  function animateCounter(el, target) {
    let current = 0;
    const duration = 2000;
    const step = target / (duration / 16);
    
    function update() {
      current += step;
      if (current >= target) {
        el.textContent = target.toLocaleString('en-US');
        return;
      }
      el.textContent = Math.floor(current).toLocaleString('en-US');
      requestAnimationFrame(update);
    }
    
    update();
  }

  // === Filter & Sort Errors ===
  window.filterErrors = function(filter, value) {
    const cards = document.querySelectorAll('.error-card');
    
    cards.forEach(function(card) {
      if (!filter || !value) {
        card.style.display = 'block';
        return;
      }
      
      const cardValue = card.dataset[filter];
      if (cardValue === value || value === 'all') {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  };

  // === Get Error by ID ===
  window.getErrorById = function(id) {
    return errorsData.find(function(e) { return e.id === id; });
  };

  // === Get Brand by ID ===
  window.getBrandById = function(id) {
    return brandsData.find(function(b) { return b.id === id; });
  };

  // === Get Errors by Brand ===
  window.getErrorsByBrand = function(brandId) {
    return errorsData.filter(function(e) { return e.brand === brandId; });
  };

  // === Get Errors by Category ===
  window.getErrorsByCategory = function(category) {
    return errorsData.filter(function(e) { return e.category === category; });
  };

  // === Get Errors by Device Type ===
  window.getErrorsByDevice = function(deviceType) {
    return errorsData.filter(function(e) { return e.deviceType === deviceType; });
  };

  // === Get Errors by Severity ===
  window.getErrorsBySeverity = function(severity) {
    return errorsData.filter(function(e) { return e.severity === severity; });
  };

  // === Generate Breadcrumb ===
  window.generateBreadcrumb = function(items) {
    return '<nav class="breadcrumb" aria-label="المسار">' +
      items.map(function(item, index) {
        if (index < items.length - 1) {
          return `<a href="${item.url}">${item.text}</a> <span class="separator">›</span>`;
        }
        return `<span>${item.text}</span>`;
      }).join('') +
      '</nav>';
  };

  // === Format Severity ===
  window.formatSeverity = function(severity) {
    const map = {
      'high': { text: 'خطير', class: 'badge-danger', icon: '🔴' },
      'medium': { text: 'متوسط', class: 'badge-warning', icon: '🟡' },
      'low': { text: 'بسيط', class: 'badge-success', icon: '🟢' }
    };
    return map[severity] || map['medium'];
  };

  // === Format Device Type ===
  window.formatDeviceType = function(type) {
    const map = {
      'washing-machine': 'غسالة ملابس',
      'dishwasher': 'غسالة أواني'
    };
    return map[type] || type;
  };

  // === Generate JSON-LD ===
  window.generateJSONLD = function(type, data) {
    const schemas = {
      'organization': {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        'name': 'دليل أعطال الأجهزة الكهرومنزلية',
        'url': window.location.origin,
        'logo': window.location.origin + '/assets/images/logo.png',
        'description': 'أكبر مرجع عربي لأعطال غسالة الأواني وغسالة الملابس'
      },
      'website': {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'name': 'دليل أعطال الأجهزة الكهرومنزلية',
        'url': window.location.origin,
        'potentialAction': {
          '@type': 'SearchAction',
          'target': window.location.origin + '/search.html?q={search_term_string}',
          'query-input': 'required name=search_term_string'
        }
      },
      'article': {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        'headline': data.title || '',
        'description': data.description || '',
        'datePublished': data.date || new Date().toISOString(),
        'author': {
          '@type': 'Organization',
          'name': 'دليل أعطال الأجهزة الكهرومنزلية'
        }
      },
      'faq': {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': (data.faq || []).map(function(q) {
          return {
            '@type': 'Question',
            'name': q.q,
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': q.a
            }
          };
        })
      },
      'breadcrumb': {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': (data.items || []).map(function(item, index) {
          return {
            '@type': 'ListItem',
            'position': index + 1,
            'name': item.text,
            'item': window.location.origin + item.url
          };
        })
      }
    };
    
    return schemas[type] || null;
  };

  // === Render Error Card ===
  window.renderErrorCard = function(error) {
    const sev = formatSeverity(error.severity);
    return `
      <div class="error-card" data-brand="${error.brand}" data-device="${error.deviceType}" data-severity="${error.severity}">
        <div class="error-code-display ${error.severity}">${error.errorCode}</div>
        <h3 class="card-title">${error.titleAr}</h3>
        <p class="card-text">${error.symptoms?.[0] || ''}</p>
        <div class="card-meta">
          <span class="badge ${sev.class}">${sev.icon} ${sev.text}</span>
          <span class="badge badge-primary">${error.deviceTypeAr}</span>
          <span class="badge badge-info">${error.brandAr}</span>
        </div>
        <div style="margin-top:12px;">
          <a href="error.html?id=${error.id}" class="btn btn-primary" style="font-size:0.8rem;padding:6px 16px;">تفاصيل العطل</a>
        </div>
      </div>
    `;
  };

  // === Render Brand Card ===
  window.renderBrandCard = function(brand) {
    const errorCount = errorsData.filter(function(e) { return e.brand === brand.id; }).length;
    return `
      <div class="brand-card">
        <div class="brand-logo">${brand.name.charAt(0)}</div>
        <h3 class="brand-name">${brand.nameAr}</h3>
        <p class="brand-country">${brand.countryAr} - ${errorCount} عطل</p>
        <a href="brand.html?id=${brand.id}" class="btn btn-secondary" style="margin-top:12px;">عرض الأعطال</a>
      </div>
    `;
  };

})();
