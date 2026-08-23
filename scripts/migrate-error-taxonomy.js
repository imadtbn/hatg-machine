const fs = require('fs');

const errorsPath = 'data/errors.json';
const taxonomyPath = 'data/taxonomy.json';
const errors = JSON.parse(fs.readFileSync(errorsPath, 'utf8'));
const taxonomy = JSON.parse(fs.readFileSync(taxonomyPath, 'utf8'));

const deviceFamilies = Object.fromEntries(Object.entries(taxonomy.deviceTypes).map(([key, value]) => [key, value.family]));
const sourceText = item => [item.title, item.titleAr, ...(item.causes || []), ...(item.symptoms || []), ...(item.affectedParts || [])].join(' ').toLowerCase();

const knownClassifications = {
  'LG-ae': ['leak-overflow', 'overflow-protection', ['leak', 'overflow']],
  'LG-ie': ['water-inlet', 'inlet-valve', ['no-fill', 'low-pressure', 'inlet-valve']],
  'LG-oe': ['drainage', 'drain-pump', ['not-draining', 'blocked-drain', 'drain-pump']],
  'LG-le': ['motor-drive', 'motor', ['motor', 'overload']],
  'LG-fe': ['leak-overflow', 'overflow-protection', ['overflow', 'water-level']],
  'LG-ue': ['balance-vibration', 'unknown', ['unbalanced-load', 'vibration']],
  'LG-de': ['door-lock', 'door-latch', ['door', 'door-lock']],
  'LG-te': ['temperature-sensor', 'temperature-sensor', ['temperature', 'temperature-sensor']],
  'LG-se': ['electrical-communication', 'control-board', ['electronics', 'control-board']],
  'LG-pe': ['water-level', 'pressure-sensor', ['water-level', 'level-sensor']],
  'LG-e1': ['leak-overflow', 'overflow-protection', ['leak', 'overflow']],
  'LG-e2': ['drainage', 'drain-pump', ['not-draining', 'blocked-drain', 'drain-pump']],
  'LG-e3': ['temperature-sensor', 'temperature-sensor', ['temperature', 'temperature-sensor']],
  'LG-e4': ['water-inlet', 'inlet-valve', ['no-fill', 'low-pressure', 'inlet-valve']],
  'LG-e5': ['water-level', 'pressure-sensor', ['water-level', 'level-sensor']],
  'samsung-ue': ['balance-vibration', 'unknown', ['unbalanced-load', 'vibration']],
  'samsung-4e': ['water-inlet', 'inlet-filter', ['no-fill', 'low-pressure', 'inlet-filter']],
  'samsung-5e': ['drainage', 'drain-pump', ['not-draining', 'blocked-drain', 'drain-pump']],
  'samsung-de': ['door-lock', 'door-latch', ['door', 'door-lock']],
  'samsung-le': ['leak-overflow', 'overflow-protection', ['leak', 'water-level']],
  'samsung-te': ['temperature-sensor', 'temperature-sensor', ['temperature', 'temperature-sensor']],
  'samsung-ae': ['electrical-communication', 'control-board', ['electronics', 'communication']],
  'samsung-he': ['heating', 'heating-element', ['heating', 'heater']],
  'samsung-bfe': ['leak-overflow', 'overflow-protection', ['leak', 'overflow']],
  'samsung-4e-dish': ['water-inlet', 'inlet-filter', ['no-fill', 'low-pressure', 'inlet-filter']],
  'samsung-5e-dish': ['drainage', 'drain-pump', ['not-draining', 'blocked-drain', 'drain-pump']],
  'samsung-te-dish': ['heating', 'heating-element', ['heating', 'temperature']],
  'electrolux-e10': ['unknown', 'unknown', ['water-inlet', 'drainage', 'model-specific']],
  'whirlpool-f5e2': ['door-lock', 'door-latch', ['door', 'door-lock']],
  'whirlpool-f9e1': ['drainage', 'drain-pump', ['not-draining', 'blocked-drain', 'drain-pump']],
  'bosch-e10-dosing': ['detergent-dosing', 'unknown', ['detergent', 'dosing', 'blocked-pump']],
  'bosch-e16-door': ['door-lock', 'door-latch', ['door', 'door-lock']],
  'bosch-e17-water': ['water-inlet', 'inlet-filter', ['no-fill', 'low-pressure', 'inlet-filter']],
  'bosch-e18-drain': ['drainage', 'drain-pump', ['not-draining', 'blocked-drain', 'drain-pump']],
  'bosch-e30-water': ['water-inlet', 'inlet-filter', ['no-fill', 'low-pressure', 'water-level']],
  'beko-dishwasher-e01': ['leak-overflow', 'overflow-protection', ['leak', 'overflow', 'water-in-base']],
  'beko-dishwasher-e02': ['water-inlet', 'inlet-filter', ['no-fill', 'inlet-filter']],
  'beko-dishwasher-e06': ['temperature-sensor', 'temperature-sensor', ['temperature', 'temperature-sensor']],
  'beko-dishwasher-e07': ['water-meter', 'water-meter', ['water-meter', 'flow-sensor']]
};

function classifyFault(item) {
  if (item.verificationStatus === 'model-specific-only') {
    return {group: 'unknown', subgroup: 'unknown', tags: ['model-specific', 'needs-manual']};
  }
  if (knownClassifications[item.id]) {
    const [group, subgroup, tags] = knownClassifications[item.id];
    return {group, subgroup, tags};
  }
  const text = sourceText(item);
  const rules = [
    {group: 'leak-overflow', subgroup: 'overflow-protection', tags: ['leak', 'overflow', 'water-in-base'], terms: ['تسرب', 'امتلاء زائد', 'الفيضان', 'قاعدة غسالة', 'leak', 'overflow']},
    {group: 'detergent-dosing', subgroup: 'unknown', tags: ['detergent', 'dosing', 'blocked-pump'], terms: ['منظف', 'الجرعات', 'dosing']},
    {group: 'water-meter', subgroup: 'water-meter', tags: ['water-meter', 'flow-sensor'], terms: ['عداد المياه', 'حساس التدفق', 'water meter', 'flow sensor']},
    {group: 'balance-vibration', subgroup: 'unknown', tags: ['unbalanced-load', 'vibration'], terms: ['غير متوازن', 'عدم استواء', 'حمولة غير متوازنة', 'اهتزاز', 'unbalanced']},
    {group: 'door-lock', subgroup: 'door-latch', tags: ['door', 'door-lock'], terms: ['الباب', 'مزلاج', 'قفل الباب', 'door', 'locked']},
    {group: 'drainage', subgroup: 'drain-pump', tags: ['not-draining', 'blocked-drain', 'drain-pump'], terms: ['تصريف', 'التصريف', 'الصرف', 'مضخة التصريف', 'خرطوم التصريف', 'drain']},
    {group: 'water-level', subgroup: 'pressure-sensor', tags: ['water-level', 'level-sensor'], terms: ['مستوى المياه', 'مستوى الماء', 'حساس المستوى', 'حساس الضغط', 'level']},
    {group: 'water-inlet', subgroup: 'inlet-filter', tags: ['no-fill', 'low-pressure', 'inlet-filter'], terms: ['دخول المياه', 'إمداد المياه', 'دخول الماء', 'مرشح الدخول', 'مرشح مدخل', 'صنبور', 'ضغط ماء', 'خرطوم الدخول', 'aquastop', 'water inlet']},
    {group: 'temperature-sensor', subgroup: 'temperature-sensor', tags: ['temperature', 'temperature-sensor'], terms: ['حساس الحرارة', 'حساس درجة الحرارة', 'ثرمستور', 'temperature sensor', 'thermistor']},
    {group: 'heating', subgroup: 'heating-element', tags: ['heating', 'heater'], terms: ['التسخين', 'السخان', 'عنصر التسخين', 'heating element', 'heater']},
    {group: 'motor-drive', subgroup: 'motor', tags: ['motor', 'overload'], terms: ['المحرك', 'إجهاد المحرك', 'motor']},
    {group: 'electrical-communication', subgroup: 'control-board', tags: ['electronics', 'control-board', 'communication'], terms: ['اتصال بين', 'لوحة التحكم', 'توصيلات', 'كهربائ', 'إلكترون', 'control board', 'communication']}
  ];
  const match = rules.find(rule => rule.terms.some(term => text.includes(term)));
  if (match) return match;
  return {group: 'unknown', subgroup: 'unknown', tags: ['model-specific', 'needs-manual']};
}

function parseCodes(value) {
  const rawCode = String(value || '').trim();
  const codes = rawCode.includes('/')
    ? rawCode.split('/').map(code => code.trim()).filter(Boolean)
    : [rawCode];
  const uniqueCodes = [...new Set(codes)];
  return {displayCode: uniqueCodes[0] || rawCode, codes: uniqueCodes};
}

function modelScope(item) {
  if (item.verificationStatus === 'manufacturer-confirmed-model-manual') return 'model-manual';
  if (item.verificationStatus === 'model-specific-only') return 'unknown';
  if (Array.isArray(item.models) && item.models.length > 0) return 'series-specific';
  return 'unknown';
}

const migrated = errors.map(item => {
  const {displayCode, codes} = parseCodes(item.errorCode);
  const fault = classifyFault(item);
  const deviceType = item.deviceType || 'other';
  const deviceSubtype = deviceType === 'washing-machine' ? 'unknown-washing-machine' : deviceType === 'dishwasher' ? 'unknown-dishwasher' : 'unknown';
  return {
    ...item,
    classificationVersion: taxonomy.version,
    deviceFamily: deviceFamilies[deviceType] || 'other',
    deviceSubtype: [deviceSubtype],
    faultGroup: fault.group,
    faultSubgroup: fault.subgroup,
    faultTags: fault.tags,
    displayCode,
    codes,
    codeMatching: codes.length > 1 ? 'any' : 'exact',
    modelScope: modelScope(item),
    confidence: item.verificationStatus === 'model-specific-only' ? 'low' : 'high',
    classificationNotes: fault.group === 'unknown' ? 'لم يُستنتج تصنيف وظيفي لأن معنى الكود يعتمد على رقم الطراز.' : undefined
  };
});

for (const item of migrated) {
  if (item.classificationNotes === undefined) delete item.classificationNotes;
}
fs.writeFileSync(errorsPath, JSON.stringify(migrated, null, 2) + '\n');
console.log(JSON.stringify({before: errors.length, after: migrated.length, faultGroups: migrated.reduce((out, item) => { out[item.faultGroup] = (out[item.faultGroup] || 0) + 1; return out; }, {}), codeArrays: migrated.filter(item => item.codes.length > 1).length}, null, 2));
