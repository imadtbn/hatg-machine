const fs = require('fs');
const { URL } = require('url');

const brands = JSON.parse(fs.readFileSync('data/brands.json', 'utf8'));
const errors = JSON.parse(fs.readFileSync('data/errors.json', 'utf8'));
const articles = JSON.parse(fs.readFileSync('data/articles.json', 'utf8'));

const baseUrl = 'https://imadtbn.github.io/hatg-machine/';
const today = new Date().toISOString().split('T')[0];
const xmlEscape = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
const absolute = relative => new URL(relative, baseUrl).toString();

const entries = [];
const addPair = ({ ar, en, lastmod = today, changefreq = 'monthly', priority = 0.7, image = '' }) => {
  entries.push({ ar: absolute(ar), en: absolute(en), lastmod, changefreq, priority, image: image ? absolute(image) : '' });
};

const staticPages = [
  { ar: '', en: 'en/', changefreq: 'weekly', priority: 1.0 },
  { ar: 'errors.html', en: 'en/errors.html', changefreq: 'weekly', priority: 0.9 },
  { ar: 'troubleshooting.html', en: 'en/troubleshooting.html', changefreq: 'weekly', priority: 0.95 },
  { ar: 'brands.html', en: 'en/brands.html', changefreq: 'weekly', priority: 0.8 },
  { ar: 'articles.html', en: 'en/articles.html', changefreq: 'weekly', priority: 0.7 },
  { ar: 'faq.html', en: 'en/faq.html', changefreq: 'monthly', priority: 0.6 },
  { ar: 'about.html', en: 'en/about.html', changefreq: 'monthly', priority: 0.5 },
  { ar: 'contact.html', en: 'en/contact.html', changefreq: 'monthly', priority: 0.5 },
  { ar: 'privacy.html', en: 'en/privacy.html', changefreq: 'yearly', priority: 0.3 },
  { ar: 'disclaimer.html', en: 'en/disclaimer.html', changefreq: 'yearly', priority: 0.3 }
];
staticPages.forEach(page => addPair(page));

brands.forEach(brand => {
  const name = encodeURIComponent(brand.name);
  addPair({ ar: `brand.html?name=${name}`, en: `en/brand.html?name=${name}`, priority: 0.7 });
});

errors.forEach(error => {
  const id = encodeURIComponent(error.id);
  addPair({ ar: `error.html?id=${id}`, en: `en/error.html?id=${id}`, priority: 0.7 });
});

articles.forEach(article => {
  addPair({
    ar: `articles/${article.slug}.html`,
    en: `en/articles/${article.slug}.html`,
    lastmod: article.updated || article.date || today,
    priority: 0.75,
    image: article.image || ''
  });
});

const renderUrl = entry => {
  const alternates = [
    `    <xhtml:link rel="alternate" hreflang="ar" href="${xmlEscape(entry.ar)}" />`,
    `    <xhtml:link rel="alternate" hreflang="en" href="${xmlEscape(entry.en)}" />`,
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${xmlEscape(entry.ar)}" />`
  ].join('\n');
  const image = entry.image ? `\n    <image:image><image:loc>${xmlEscape(entry.image)}</image:loc></image:image>` : '';
  return `  <url>\n    <loc>${xmlEscape(entry.ar)}</loc>\n    <lastmod>${xmlEscape(entry.lastmod)}</lastmod>\n    <changefreq>${entry.changefreq}</changefreq>\n    <priority>${entry.priority}</priority>\n${alternates}${image}\n  </url>\n  <url>\n    <loc>${xmlEscape(entry.en)}</loc>\n    <lastmod>${xmlEscape(entry.lastmod)}</lastmod>\n    <changefreq>${entry.changefreq}</changefreq>\n    <priority>${entry.priority}</priority>\n${alternates}${image}\n  </url>`;
};

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries.map(renderUrl).join('\n')}
</urlset>
`;

fs.writeFileSync('sitemap.xml', xml);
console.log(`Sitemap generated: ${entries.length * 2} URLs, ${articles.length} image pairs.`);
