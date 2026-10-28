# FarMarket (demo)
Ochish: `index.html` ni brauzerda oching. Ma'lumotlar localStorage'da (DEMO). Demo kirish: aziz@demo.uz (xaridor), botir@demo.uz (sotuvchi), parol demo1234.

## Tuzilma
- `js/listingSchemas.js` — chorva va yem turlari bo'yicha maydon sxemalari, narx/birlik va rasm qoidalari
- `js/listing.js` — e'lon joylash (5 qadam), rasm yuklash, tahrirlash, qoralama, galereya
- `js/services.js` — ma'lumot va biznes qoidalar (rasm qoidasi shu yerda ham tekshiriladi)
- `js/app.js`, `js/boot.js` — sahifalar va ishga tushirish
- `server/telegram-worker.js` — Telegram bildirishnoma (token faqat serverda)
- `server/firestore.rules` — ishlab chiqarish uchun namunaviy qoidalar (sinalmagan)

## Rasm qoidasi
Har yangi e'lon uchun 5–15 ta haqiqiy rasm. Qoralama 5 tadan kam bo'lishi mumkin. Tahrirda ham 5 tadan kam bo'lmaydi.
DEMO'da rasmlar base64 holida localStorage'ga yoziladi (~5 MB chegara); ishlab chiqarishda Firebase Storage kerak.
Admin paneli yo'q: "DEMO: tasdiqlash" tugmasi admin o'rnini bosadi.
