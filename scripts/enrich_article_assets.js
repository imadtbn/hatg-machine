const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const file = path.join(root, 'data', 'articles.json');
const articles = JSON.parse(fs.readFileSync(file, 'utf8'));

const imageBySlug = {
  'refrigerator-not-cooling': 'refrigerator-not-cooling.jpg',
  'dryer-not-drying': 'dryer-not-drying.jpg',
  'ac-weak-airflow': 'ac-weak-airflow.jpg',
  'when-to-call-technician': 'when-to-call-technician.jpg',
  'dishwasher-white-residue': 'dishwasher-white-residue.jpg',
  'dishwasher-drying': 'dishwasher-drying.jpg',
  'microwave-not-heating': 'when-to-call-technician.jpg',
  'washing-machine-vibration': 'dryer-not-drying.jpg',
  'washing-machine-bad-smell': 'washing-machine-bad-smell.jpg',
  'washing-machine-drain': 'washing-machine-drain.jpg',
  'dishwasher-filter': 'dishwasher-filter.jpg',
  'choose-washing-machine': 'washing-machine-vibration.jpg',
  'dishwasher-errors': 'dishwasher-errors.jpg',
  'ac-maintenance': 'ac-maintenance.jpg',
  'washing-machine-care': 'washing-machine-care.jpg',
  'energy-saving': 'energy-saving.jpg',
  'maintenance-tips': 'maintenance-tips.jpg'
};

const altBySlug = {
  'refrigerator-not-cooling': ['ثلاجة مفتوحة مع رمز فحص لضعف التبريد', 'Open refrigerator with a diagnostic symbol for weak cooling'],
  'dryer-not-drying': ['مجفف ملابس مع تدفق هواء وفلتر الوبر', 'Clothes dryer with airflow and lint filter'],
  'ac-weak-airflow': ['مكيف هواء مع فلتر وتدفق هواء أزرق', 'Air conditioner with a filter and blue airflow'],
  'when-to-call-technician': ['فني صيانة يفحص جهازاً منزلياً بأدوات آمنة', 'Appliance technician checking a home appliance safely'],
  'dishwasher-white-residue': ['غسالة أطباق مع رمز قطرات الماء وأملاح الترسب', 'Dishwasher with water-drop and mineral-residue symbols'],
  'dishwasher-drying': ['غسالة أطباق مع أطباق جافة وتدفق هواء دافئ', 'Dishwasher with dry dishes and warm airflow'],
  'microwave-not-heating': ['ميكروويف مع رمز فحص التسخين والسلامة', 'Microwave with a heating and safety diagnostic symbol'],
  'washing-machine-vibration': ['غسالة ملابس مع رمز التوازن والاهتزاز', 'Washing machine with balance and vibration symbols'],
  'washing-machine-bad-smell': ['غسالة ملابس مفتوحة مع رمز التنظيف والانتعاش', 'Open washing machine with cleaning and freshness symbols'],
  'washing-machine-drain': ['غسالة ملابس مع مسار تصريف ومضخة', 'Washing machine with a drain path and pump'],
  'dishwasher-filter': ['غسالة أطباق مع فلتر وذراع رش وأداة تنظيف', 'Dishwasher with a filter, spray arm and cleaning brush'],
  'choose-washing-machine': ['غسالات ملابس حديثة للمقارنة قبل الشراء', 'Modern washing machines for comparison before purchase'],
  'dishwasher-errors': ['غسالة أطباق مع لوحة تشخيص ورمز خطأ', 'Dishwasher with a diagnostic panel and error symbol'],
  'ac-maintenance': ['مكيف هواء مع فلتر وأدوات صيانة موسمية', 'Air conditioner with filter and seasonal maintenance tools'],
  'washing-machine-care': ['غسالة ملابس مع عناصر العناية والتنظيف', 'Washing machine with care and cleaning elements'],
  'energy-saving': ['أجهزة منزلية مع رمز توفير الطاقة', 'Home appliances with an energy-saving symbol'],
  'maintenance-tips': ['مجموعة أجهزة منزلية مع قائمة صيانة دورية', 'Home appliances with a routine maintenance checklist']
};

for (const article of articles) {
  const fileName = imageBySlug[article.slug] || 'when-to-call-technician.jpg';
  const alt = altBySlug[article.slug] || ['صورة دلالية لمقال صيانة الأجهزة الكهرومنزلية', 'Illustration for a home-appliance maintenance article'];
  article.image = `assets/images/articles/${fileName}`;
  article.imageAlt = alt[0];
  article.en = article.en || {};
  article.en.imageAlt = alt[1];
}

fs.writeFileSync(file, JSON.stringify(articles, null, 2) + '\n');
console.log(`Enriched ${articles.length} articles with image metadata.`);
