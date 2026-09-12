# Phase 0.5 — Contract Infrastructure

این فایل mirror اجرایی GitHub از قراردادهای مصوب پروژه است؛ **مرجع پروژه خارج از Repository باقی می‌ماند** و شامل برنامه جامع v3.0، ایده‌های اجرایی v2.0 و مشخصات Phase 0.5 v1.0 است.

## این مرحله چه چیزی را پیاده می‌کند
- OperationID و IdempotencyKey مستقل
- 16 نوع عملیات حساس پروژه
- replay برای همان IdempotencyKey و payload یکسان
- `IDEMPOTENCY_CONFLICT` برای payload متفاوت
- Operation → چند Effect
- Reversal به‌صورت Operation جدید و معکوس‌سازی تمام Effectهای عملیات اصلی
- وضعیت `NEEDS_REPAIR` برای شکست پس از آماده‌سازی Effect
- Schema Registry و جلوگیری از schema drift
- ReceiptAllocation به‌صورت immutable/versioned
- FIFO قطعی برای تاریخ یکسان با tie-break بر اساس ID
- Reconciliation invariant

## مرز فعلی
این لایه هنوز به داده عملیاتی Google Sheets یا Supabase متصل نشده است. اتصال به runtime واقعی Apps Script و سپس اتصال به موتور فروش/تسویه باید در مراحل بعدی و با تست مستقل انجام شود.

## قاعده معماری
Repository موجود، مرجع نیازمندی‌ها نیست؛ فقط بستر اجرای کد است. تغییرات بعدی باید با اسناد پروژه تطبیق داده شوند و قراردادهای مصوب Phase 0.5 نباید با منطق فعلی prototype جایگزین شوند.
