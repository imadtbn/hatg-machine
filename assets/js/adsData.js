/* adsData.js
 * وظائف إعلانات AdSense + تهيئة قسم الماركات في الصفحة الرئيسية.
 */

(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        initHomepageBrandsContainer();
        initAds();
    }, { once: true });

    function initHomepageBrandsContainer() {
        /*
         * index.html كان يحتوي على cards-grid بدون id في قسم
         * "الماركات المدعومة"، بينما سكربت الصفحة الرئيسية ينتظر
         * #brandsContainer. نربط العنصر الصحيح قبل تشغيل initHomePage.
         */
        var headings = document.querySelectorAll('h2');
        var brandsGrid = null;

        headings.forEach(function (heading) {
            if (brandsGrid || heading.textContent.trim() !== 'الماركات المدعومة') {
                return;
            }

            var section = heading.closest('section');
            if (!section) return;

            brandsGrid = section.querySelector('.cards-grid');
        });

        if (brandsGrid) {
            brandsGrid.id = 'brandsContainer';
            brandsGrid.setAttribute('aria-live', 'polite');
            brandsGrid.setAttribute('aria-label', 'الماركات المدعومة');
        }
    }

    function initAds() {
        var adBlocks = document.querySelectorAll('ins.adsbygoogle');

        adBlocks.forEach(function (adBlock) {
            if (!adBlock.hasAttribute('data-adsbygoogle-status')) {
                try {
                    (window.adsbygoogle = window.adsbygoogle || []).push({});
                } catch (error) {
                    console.error('AdSense push error:', error);
                }
            }
        });
    }

    window.addEventListener('load', function () {
        setTimeout(function () {
            var adBlocks = document.querySelectorAll('ins.adsbygoogle');

            adBlocks.forEach(function (adBlock) {
                if (
                    !adBlock.hasAttribute('data-adsbygoogle-status') &&
                    adBlock.children.length === 0
                ) {
                    try {
                        (window.adsbygoogle = window.adsbygoogle || []).push({});
                    } catch (error) {
                        console.error('خطأ أثناء تحميل الإعلان:', error);
                    }
                }
            });
        }, 2600);
    });
})();