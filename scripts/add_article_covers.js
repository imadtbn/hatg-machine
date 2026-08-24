const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const articles = JSON.parse(fs.readFileSync(path.join(root, 'data/articles.json'), 'utf8'));

for (const article of articles) {
  const file = path.join(root, 'articles', `${article.slug}.html`);
  if (!fs.existsSync(file)) continue;
  let html = fs.readFileSync(file, 'utf8');
  const imageUrl = `https://imadtbn.github.io/hatg-machine/${article.image}`;
  if (!html.includes('id="article-cover-image"')) {
    const cover = `          <figure class="article-cover"><img id="article-cover-image" src="../${article.image}" alt="${article.imageAlt}" width="1200" height="800" loading="eager" decoding="async"><figcaption>${article.imageAlt}</figcaption></figure>\n`;
    html = html.replace('          <div class="article-notice">', `${cover}          <div class="article-notice">`);
  }
  html = html.replace(/<meta property="og:image" content="[^"]*">/, `<meta property="og:image" content="${imageUrl}">`);
  html = html.replace(/<meta name="twitter:image" content="[^"]*">/, `<meta name="twitter:image" content="${imageUrl}">`);
  fs.writeFileSync(file, html);
}
console.log(`Updated ${articles.length} article pages with cover metadata.`);
