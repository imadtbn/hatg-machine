# دليل أعطال الأجهزة الكهرومنزلية

## Error Codes Guide for Home Appliances

أكبر مرجع عربي لأعطال غسالة الأواني وغسالة الملابس.

### المميزات

- **160+ عطل** مسجل مع تفاصيل كاملة
- **29 ماركة** مدعومة
- **وضع ليلي** مع تبديل تلقائي
- **بحث ذكي** مع اقتراحات فورية
- **SEO متقدم** مع JSON-LD وSitemap
- **PWA** يعمل بدون إنترنت
- **تصميم متجاوب** لجميع الأجهزة
- **إعلانات AdSense** جاهزة للتفعيل

### الهيكل

```
appliance-errors/
├── index.html          (الصفحة الرئيسية)
├── errors.html         (جميع الأعطال)
├── error.html          (تفاصيل عطل)
├── brands.html         (جميع الماركات)
├── brand.html          (تفاصيل ماركة)
├── articles.html       (المقالات)
├── faq.html            (الأسئلة الشائعة)
├── about.html          (عن الموقع)
├── contact.html        (اتصل بنا)
├── privacy.html        (سياسة الخصوصية)
├── disclaimer.html     (إخلاء المسؤولية)
├── search.html         (البحث)
├── data/
│   ├── brands.json     (قاعدة بيانات الماركات)
│   ├── errors.json     (قاعدة بيانات الأعطال والتصنيف التشخيصي)
│   └── taxonomy.json   (قاموس أنواع الأجهزة ومجموعات الأعطال)
├── assets/
│   ├── css/style.css   (الملف الرئيسي)
│   ├── js/
│   │   ├── main.js     (الوظائف التفاعلية)
│   │   └── site-tags.js (Analytics, GTM, AdSense, Clarity)
│   └── images/         (الأيقونات والشعارات)
├── manifest.webmanifest (PWA)
├── service-worker.js   (PWA offline)
├── sitemap.xml         (SEO)
├── robots.txt          (SEO)
└── google-search-console.html (التحقق)
```

### التثبيت والنشر

1. ارفع جميع الملفات على أي استضافة ويب (Netlify, Vercel, GitHub Pages)
2. استبدل `appliance-errors.example.com` بالنطاق الخاص بك في جميع الملفات
3. اضبط الخدمات الأربعة في `assets/js/site-tags.js`؛ تبقى قيم GTM وClarity الوهمية غير مفعلة حتى استبدالها
4. أضف أو عدّل وحدات الإعلانات داخل حاويات `.ad-container` مع اختبار التوزيع قبل النشر

### التخصيص

- **الألوان**: عدّل المتغيرات في `assets/css/style.css`
- **المحتوى**: عدّل ملفات `data/brands.json` و`data/errors.json`
- **التصنيف**: استخدم المعرفات الموجودة في `data/taxonomy.json` عند إضافة `deviceType` أو `faultGroup` أو `faultTags`؛ لا تضف قيمة تصنيف جديدة خارج القاموس
- **الروابط**: استخدم `error.html?id=<error-id>` لروابط تفاصيل الأعطال الجديدة
- **التواصل**: حدّث معلومات الاتصال في الـ footer

### الترخيص

معلومات تعليمية فقط. لا تغني عن الفحص الفني المتخصص.
