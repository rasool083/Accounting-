# Accounting-

سامانه حسابداری فروش، خرید و تسویه کارگاه با رابط فارسی/RTL و معماری local-first.

## وضعیت فعلی
- داده‌ها در مرورگر و localStorage نگهداری می‌شوند.
- تاریخ‌های مالی با قالب جلالی `YYYY/MM/DD` ثبت می‌شوند.
- موتور مستقل FIFO برای تخصیص دریافت‌ها و محاسبه سود روزشمار وجود دارد.
- فروش، خرید، دریافت، پرداخت، چک، اشخاص، کالا/موجودی، قیمت، صورت‌حساب، گزارش، تنظیمات، پشتیبان JSON و Audit در UI قرار گرفته‌اند.
- مهاجرت داده‌های نسخه قبلی بدون حذف فیلدهای ناشناخته انجام می‌شود.
- تست واحد با Node built-in test runner و GitHub Actions اجرا می‌شود.

## اجرا
فایل `index.html` را در مرورگر باز کنید.

برای تست محلی با Node:

```bash
npm test
npm run check
```

## پشتیبان
از منوی «پشتیبان» خروجی JSON بگیرید. بازیابی فایل قبل از جایگزینی داده‌ها آن را parse و normalize می‌کند.

## معماری
```text
UI → Application/bootstrap → Domain engine → Repository → localStorage
```

منطق تاریخ و محاسبات مالی در `domain.js` است و ذخیره‌سازی در `repository.js` کپسوله شده است. بنابراین اتصال آینده به Supabase باید در لایه Repository انجام شود، نه در فرمول‌های مالی یا UI.

## نکته مهم درباره دسترسی
PIN فعلی فقط قفل رابط local-only است و احراز هویت سروری محسوب نمی‌شود. برای دسترسی چندکاربره، مشاهده محدود شرکا و پرتال مشتری باید Supabase Auth/RLS در یک مرحله جداگانه پیاده‌سازی و تست شود.

## ساختار اصلی
- `index.html` — entry point ماژولار
- `style.css` — رابط و responsive layout
- `domain.js` — تاریخ جلالی، FIFO و سود
- `migration.js` — نرمال‌سازی/مهاجرت داده
- `repository.js` — adapter ذخیره‌سازی
- `transactions.js` — ساخت و اعتبارسنجی تراکنش‌ها
- `reports.js` — گزارش و مانده تاریخی
- `inventory.js` — موجودی مبتنی بر گردش
- `backup.js` — export/import نسخه‌دار
- `data.js` — مدل DB سازگار با داده فعلی
- `ui.js` — صفحات و عملیات UI
- `app.js` — bootstrap و قفل
- `tests/` — تست‌های واحد و قرارداد ساختار
- `docs/superpowers/specs/` — مشخصات طراحی
- `docs/superpowers/plans/` — برنامه پیاده‌سازی

## محدوده‌های مرحله بعد
Supabase multi-user/auth/RLS، پرتال مشتری با لینک امن، WebMCP و بسته Android تا زمان پیاده‌سازی واقعی در این نسخه فعال ادعا نمی‌شوند.
