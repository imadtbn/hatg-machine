const fs = require('fs');
const path = require('path');

const brands = JSON.parse(fs.readFileSync('data/brands.json', 'utf8'));
const errors = JSON.parse(fs.readFileSync('data/errors.json', 'utf8'));

const baseUrl = 'https://imadtbn.github.io/hatg-machine/';
const today = new Date().toISOString().split('T')[0];

let urls = [];

// الصفحات الثابتة
const staticPages = [
  { loc: '', priority: 1.0, changefreq: 'weekly' },
  { loc: 'errors.html', priority: 0.9, changefreq: 'weekly' },
  { loc: 'brands.html', priority: 0.8, changefreq: 'weekly' },
  { loc: 'articles.html', priority: 0.7, changefreq: 'weekly' },
  { loc: 'faq.html', priority: 0.6, changefreq: 'monthly' },
  { loc: 'about.html', priority: 0.5, changefreq: 'monthly' },
  { loc: 'contact.html', priority: 0.5, changefreq: 'monthly' },
  { loc: 'privacy.html', priority: 0.3, changefreq: 'yearly' },
  { loc: 'disclaimer.html', priority: 0.3, changefreq: 'yearly' }
];

staticPages.forEach(page => {
  urls.push({
    loc: baseUrl + page.loc,
    lastmod: today,
    changefreq: page.changefreq,
    priority: page.priority
  });
});

// صفحات الماركات
brands.forEach(brand => {
  urls.push({
    loc: `${baseUrl}brand.html?id=${brand.id}`,
    lastmod: today,
    changefreq: 'monthly',
    priority: 0.7
  });
});

// صفحات الأعطال
errors.forEach(error => {
  urls.push({
    loc: `${baseUrl}error.html?id=${error.id}`,
    lastmod: today,
    changefreq: 'monthly',
    priority: 0.7
  });
});

// إنشاء XML
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

fs.writeFileSync('sitemap.xml', xml);
console.log('Sitemap generated successfully!');