# سجل تحديث قاعدة بيانات الأعطال

## منهجية المراجعة

تمت مقارنة السجلات مع صفحات دعم رسمية من الشركات المصنّعة. عندما وجدت الصفحة الرسمية معنى عاماً للكود، أُدرجت التسمية وخطوات الفحص الأساسية. وعندما أكدت الشركة أن المعنى يعتمد على الطراز، أُزيل التشخيص العام واستُبدل بتنبيه يطلب رقم الطراز ودليل المستخدم. لا يُعد هذا السجل بديلاً عن دليل الجهاز أو خدمة الإصلاح المعتمدة.

## المصادر والنتائج

| الماركة والفئة | المصدر الرسمي | النتيجة المستخدمة في `errors.json` |
|---|---|---|
| LG — غسالات الملابس | [LG Front Load Washer - Error Code List](https://www.lg.com/us/support/help-library/lg-front-load-washer-error-code-list--20155069413456)؛ [LG Washing Machine - Error Codes](https://www.lg.com/eastafrica/support/product-help/CT20279036-20154044417502DRC)؛ [LG IE support](https://www.lg.com/us/support/help-library/lg-washer-troubleshooting-an-ie-error-code--1400510401752) | تم تصحيح IE وOE وLE وFE وUE وdE وtE وSE وPE وAE وفق معاني LG المنشورة، مع إبراز حالات اختلاف الطراز ورفع الحالات التي تتطلب فنيًا. |
| LG — غسالات الأواني | [LG Dishwasher Guide to Error Codes](https://www.lg.com/us/support/help-library/lg-dishwasher-guide-to-error-codes--20154823515108)؛ [AE/E1](https://www.lg.com/us/support/help-library/ae-e1-error-code-dish-washer--20150140935066)؛ [IE](https://www.lg.com/us/support/help-library/dishwasher-no-water-ie-error-code--20154712581272)؛ [OE](https://www.lg.com/us/support/help-library/lg-dishwashers-troubleshooting-an-oe-error-code--1440686618796) | تم تحويل E1 إلى AE/E1 للتسرب أو الامتلاء الزائد، وE2 إلى OE للتصريف، وE3 إلى tE/HE للتسخين، وE4 إلى IE لدخول المياه، وE5 إلى PE لحساس مستوى المياه. |
| Samsung — غسالات الملابس | [Samsung washing machine information and error codes](https://www.samsung.com/us/support/troubleshoot/TSG10000997/) | تم تصحيح UE و4E و5E وDE وLE وTE وAE وHE إلى مجموعات الأكواد الرسمية ذات الصلة، مع ملاحظة أن بعض الأكواد تختلف حسب الطراز. |
| Samsung — غسالات الأواني | [Samsung dishwasher error codes](https://www.samsung.com/us/support/troubleshoot/TSG10004499/)؛ [Samsung Africa dishwasher codes](https://www.samsung.com/africa_en/support/home-appliances/displayed-information-codes-on-my-dishwasher/)؛ [Samsung UAE water codes](https://www.samsung.com/ae/support/home-appliances/information-code-for-my-samsung-dishwasher-5c5e-4c4elcle/) | تم تصحيح التسرب إلى LC/LE، والإمداد إلى 4C/4E، والتصريف إلى 5C/5E/SC/SE، والتسخين إلى HC/HE، وإضافة سجل tE لحساس الحرارة. |
| Electrolux — غسالات الملابس | [Electrolux E10/E11/C1 support](https://support.electrolux.co.uk/support-articles/article/washing-machine-displays-error-code-e10-e11-c1-or-emits-1-beep-1-flash) | تم تصحيح E10 إلى E10/E11/C1 كتدفق مياه أو تصريف، بينما وُسم E20 وE30 بأنهما معتمدان على الطراز بدلاً من الإسناد العام. |
| Whirlpool — غسالات الملابس | [Whirlpool Front Load Washer Error Codes](https://producthelp.whirlpool.com/Laundry/Washers/Product_Info/Washer_Product_Assistance/Error_Codes_in_Front_Load_Washers) | أُعيدت تسمية السجلين إلى F5 E2 لقفل الباب وF9 E1 لزمن التصريف؛ الصفحة تؤكد أن القائمة تختلف حسب الطراز. |
| Bosch — غسالات الملابس | [Bosch Error Codes](https://www.bosch-home.com/us/owner-support/get-support/general-error-codes) | بوابة Bosch تطلب اختيار فئة الجهاز والبحث برقم الطراز؛ لذلك وُسمت E:01–E:05 بأنها معتمدة على الطراز، وأزيلت التفسيرات العامة غير المثبتة. |
| Beko — غسالات الملابس | [Beko User Manuals](https://www.beko.com/us-en/support/user-manual) | دليل Beko الرسمي يعتمد على رقم الطراز؛ لذلك وُسمت E01–E03 بأنها معتمدة على الطراز دون تشخيص عام. |
| Midea — غسالات الملابس | [Midea Manuals & Downloads](https://www.midea.com/th-en/support/manuals-downloads) | لم يُعتمد معنى موحد لـE1–E10 عبر الطرازات؛ وُسمت السجلات بأنها تحتاج مطابقة دليل الطراز. |
| Panasonic — غسالات الملابس | [Panasonic How to solve Error Code H**](https://p-cube.panasonic.com/ph/s/article/How-to-solve-Error-Code-H-ph-pm-psp-pnz) | لم يُعتمد معنى موحد لـH01 وH02 دون دليل طراز؛ وُسمت السجلات بأنها تحتاج مطابقة دليل الطراز وفنيًا عند استمرارها. |
| Gree وCarrier | [GREE Troubleshoot Error Codes](https://www.greecomfort.com/troubleshoot-error-codes/)؛ [Carrier Fault Codes](https://www.carrierair.com.au/installer-and-technical-support/fault-codes/) | المصادر الرسمية التي تم العثور عليها تخص أنظمة التكييف والتدفئة، لا غسالات الملابس أو غسالات الأواني؛ أزيلت السجلات العشر غير المسندة حتى لا تعرض القاعدة تشخيصات مضللة. |

## ملاحظات السلامة

أضيف إلى السجلات تنبيه بفصل الكهرباء وإغلاق المياه قبل الفحص، وعدم فتح اللوحات أو قياس الجهد دون فني مؤهل، والرجوع إلى دليل الطراز قبل استبدال أي قطعة. كما أزيلت إجابة سعرية غير موثقة واستُبدلت بعبارة تفيد بأن التكلفة تختلف حسب الطراز والمنطقة والقطعة.
