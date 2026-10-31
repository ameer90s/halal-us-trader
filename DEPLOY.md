# نشر حلال تريدير — تلقائي بالكامل (Cloudflare)

بعد اتباع هذه الخطوات يصبح البرنامج يعمل **بدون أي تدخل منك**.

---

## الخطوة 1: حساب Cloudflare
1. سجّل في [dash.cloudflare.com](https://dash.cloudflare.com) (مجاني)
2. ثبّت الأدوات:
```bash
npm install -g wrangler
wrangler login
```

---

## الخطوة 2: نشر الواجهة (PWA)
1. ارفع محتويات المجلد الرئيسي (بدون مجلد `worker`) إلى **Cloudflare Pages**
   - أو اربطه بـ GitHub
2. ستحصل على رابط مثل: `https://halal-trader.pages.dev`

---

## الخطوة 3: إنشاء KV
```bash
cd worker
wrangler kv namespace create SUBSCRIPTIONS
wrangler kv namespace create SUBSCRIPTIONS --preview
```
انسخ الـ ID وضعه في `wrangler.toml` مكان `YOUR_KV_NAMESPACE_ID`.

---

## الخطوة 4: مفاتيح VAPID
ولّد المفاتيح:
```bash
npx web-push generate-vapid-keys
```
أو استخدم أي مولد أونلاين.

ثم أضف الأسرار:
```bash
wrangler secret put FINNHUB_KEY
wrangler secret put VAPID_PUBLIC
wrangler secret put VAPID_PRIVATE
wrangler secret put VAPID_SUBJECT
```
(قيمة SUBJECT مثال: `mailto:your@email.com`)

---

## الخطوة 5: تفعيل الإشعارات الحقيقية (مهم)
```bash
cd worker
npm init -y
npm install @block65/webcrypto-web-push
```
ثم افتح `worker.js` وابحث عن دالة `sendWebPush` وفعّل الكود المعلق (احذف الـ placeholder).

---

## الخطوة 6: نشر الـ Worker
```bash
cd worker
wrangler deploy
```
ستحصل على رابط مثل: `https://halal-trader.xxxxx.workers.dev`

---

## الخطوة 7: ربط الواجهة
1. افتح التطبيق من الجوال
2. اذهب إلى **الإعدادات**
3. الصق رابط الـ Worker واحفظه
4. اضغط **تفعيل الإشعارات التلقائية** واسمح بالإشعارات
5. يُفضّل تثبيت التطبيق على الشاشة الرئيسية

---

## النتيجة
- كل يوم قبل السوق يعمل السيرفر تلقائياً
- إذا وجد توصية يرسل إشعاراً
- تضغط الإشعار → يفتح البرنامج على التوصيات

---

## ملاحظات
- عدّل وقت الـ Cron في `wrangler.toml` حسب التوقيت الصيفي/الشتوي
- على iOS: يجب إضافة التطبيق للشاشة الرئيسية أولاً
- للاختبار اليدوي: أرسل POST إلى `/run-analysis` على رابط الـ Worker

إذا واجهت أي مشكلة أثناء النشر أرسل لي الرسالة وسأساعدك.
