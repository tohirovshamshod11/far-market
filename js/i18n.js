'use strict';
// FarMarket localization. Default language: Uzbek (Latin). Dictionary maps the Uzbek source text -> [Russian, English].
// A missing translation falls back to the Uzbek text. User-generated content (titles, descriptions, messages) is never translated.
const FM_LANGS = { uz:{ label:'UZ', locale:'uz-UZ' }, ru:{ label:'RU', locale:'ru-RU' }, en:{ label:'EN', locale:'en-US' } };
const FM_LANG_KEY = 'fmarket_lang';
const FM_DICT = {
"Bosh sahifa": [
"Главная",
"Home"
],
"E‘lon joylash": [
"Подать объявление",
"Post a listing"
],
"Bozor": [
"Рынок",
"Market"
],
"Yem-Oshat": [
"Корма",
"Feed"
],
"Veterinariya": [
"Ветеринария",
"Veterinary"
],
"Transport": [
"Транспорт",
"Transport"
],
"Jamiyat": [
"Сообщество",
"Community"
],
"Xarita": [
"Карта",
"Map"
],
"Sotuvchi": [
"Продавец",
"Seller"
],
"Kabinet": [
"Кабинет",
"Dashboard"
],
"Xaridlar": [
"Покупки",
"Purchases"
],
"Saralanganlar": [
"Избранное",
"Favorites"
],
"Xabarnomalar": [
"Уведомления",
"Notifications"
],
"Bosh": [
"Главная",
"Home"
],
"Sotish": [
"Продать",
"Sell"
],
"Xabar": [
"Уведомл.",
"Alerts"
],
"Profil": [
"Профиль",
"Profile"
],
"Yangi": [
"Новые",
"Newest"
],
"Eski": [
"Старые",
"Oldest"
],
"Narx ↑": [
"Цена ↑",
"Price ↑"
],
"Narx ↓": [
"Цена ↓",
"Price ↓"
],
"Reyting": [
"Рейтинг",
"Rating"
],
"Ko‘p ko‘rilgan": [
"Популярные",
"Most viewed"
],
"Erkak": [
"Самец",
"Male"
],
"Urg‘ochi": [
"Самка",
"Female"
],
"Qoramol": [
"Крупный рогатый скот",
"Cattle"
],
"Qo‘y": [
"Овцы",
"Sheep"
],
"Echki": [
"Козы",
"Goats"
],
"Ot": [
"Лошади",
"Horses"
],
"Tuya": [
"Верблюды",
"Camels"
],
"Parranda": [
"Птица",
"Poultry"
],
"Boshqa chorva": [
"Другой скот",
"Other livestock"
],
"Yem": [
"Корм",
"Feed"
],
"Pichan": [
"Сено",
"Hay"
],
"Boshqa qishloq mahsuloti": [
"Другая сельхозпродукция",
"Other farm products"
],
"Xaridor": [
"Покупатель",
"Buyer"
],
"Fermer": [
"Фермер",
"Farmer"
],
"Biznes": [
"Бизнес",
"Business"
],
"Veterinar": [
"Ветеринар",
"Veterinarian"
],
"Taklif yuborildi": [
"Предложение отправлено",
"Offer sent"
],
"Sotuvchi qabul qildi": [
"Продавец принял",
"Seller accepted"
],
"Xaridor tasdiqladi": [
"Покупатель подтвердил",
"Buyer confirmed"
],
"Tayyorlanmoqda": [
"Готовится",
"Preparing"
],
"Yo‘lda / olib ketish": [
"В пути / самовывоз",
"Shipping / pickup"
],
"Yetkazildi": [
"Доставлено",
"Delivered"
],
"Yakunlandi": [
"Завершено",
"Completed"
],
"Rad etildi": [
"Отклонено",
"Rejected"
],
"Bekor qilindi": [
"Отменено",
"Cancelled"
],
"Muddati tugadi": [
"Срок истёк",
"Expired"
],
"Nizo": [
"Спор",
"Disputed"
],
"Qabul qilish": [
"Принять",
"Accept"
],
"Rad etish": [
"Отклонить",
"Reject"
],
"Bekor qilish": [
"Отменить",
"Cancel"
],
"Tasdiqlash (DEMO to‘lov)": [
"Подтвердить (ДЕМО-оплата)",
"Confirm (DEMO payment)"
],
"Yo‘lga chiqdi": [
"Отправлено",
"Dispatched"
],
"Qabul qildim — yakunlash": [
"Получил — завершить",
"Received — complete"
],
"Tekshiruvda": [
"На проверке",
"Under review"
],
"Faol": [
"Активно",
"Active"
],
"Qoralama": [
"Черновик",
"Draft"
],
"Sotilgan": [
"Продано",
"Sold"
],
"Band": [
"Забронировано",
"Reserved"
],
"Eng yuqori": [
"Высокие",
"Highest"
],
"Eng past": [
"Низкие",
"Lowest"
],
"Foydali": [
"Полезно",
"Helpful"
],
"Rasmli": [
"С фото",
"With photos"
],
"Tasdiqlangan xarid": [
"Подтверждённая покупка",
"Verified purchase"
],
"E‘lonlar": [
"Объявления",
"Listings"
],
"Takliflar": [
"Предложения",
"Offers"
],
"Sotuvlar": [
"Продажи",
"Sales"
],
"Daromad (demo)": [
"Доход (демо)",
"Revenue (demo)"
],
"Ko‘rishlar": [
"Просмотры",
"Views"
],
"Telefon bosishlar": [
"Клики по телефону",
"Phone clicks"
],
"Takliflar (jami)": [
"Предложения (всего)",
"Offers (total)"
],
"Yakunlangan": [
"Завершено",
"Completed"
],
"Faol e‘lonlar": [
"Активные объявления",
"Active listings"
],
"Tasdiqlangan sotuvchilar": [
"Проверенные продавцы",
"Verified sellers"
],
"Yakunlangan savdolar": [
"Завершённые сделки",
"Completed deals"
],
"Haqiqiy sharhlar": [
"Реальные отзывы",
"Real reviews"
],
"Spam": [
"Спам",
"Spam"
],
"Haqoratli": [
"Оскорбительный",
"Abusive"
],
"Yolg‘on ma‘lumot": [
"Ложная информация",
"False information"
],
"Aloqasiz": [
"Не по теме",
"Irrelevant"
],
"Firibgarlik shubhasi": [
"Подозрение на мошенничество",
"Suspected fraud"
],
"Boshqa": [
"Другое",
"Other"
],
"Umumiy": [
"Общее",
"General"
],
"Qo‘y va echki": [
"Овцы и козы",
"Sheep and goats"
],
"Dehqonchilik": [
"Земледелие",
"Farming"
],
"Tajriba": [
"Опыт",
"Experience"
],
"Mahsulot aniqligi": [
"Соответствие описанию",
"Product accuracy"
],
"Ishonchlilik": [
"Надёжность",
"Reliability"
],
"Muloqot": [
"Общение",
"Communication"
],
"Yetkazish": [
"Доставка",
"Delivery"
],
"so‘m": [
"сум",
"UZS"
],
"yulduz": [
"звёзд",
"stars"
],
"Xatolik": [
"Ошибка",
"Error"
],
"narx:": [
"цена:",
"price:"
],
"sharh": [
"отзывов",
"reviews"
],
"tavsiya": [
"рекомендуют",
"recommend"
],
"yil": [
"лет",
"yrs"
],
"kabinet": [
"кабинет",
"dashboard"
],
"Foydalanuvchi": [
"Пользователь",
"User"
],
"Saqlash": [
"Сохранить",
"Save"
],
"Veterinar:": [
"Ветеринар:",
"Veterinarian:"
],
"A'zo:": [
"Участник с:",
"Member since:"
],
"Yakunlangan savdolar:": [
"Завершённые сделки:",
"Completed deals:"
],
"Faol e‘lonlar:": [
"Активные объявления:",
"Active listings:"
],
"Sotuvchi:": [
"Продавец:",
"Seller:"
],
"Xaridor:": [
"Покупатель:",
"Buyer:"
],
"Qarshi taklif:": [
"Встречное предложение:",
"Counter-offer:"
],
"javob kutilmoqda": [
"ожидается ответ",
"awaiting reply"
],
"Javob berish ulushi:": [
"Доля ответов:",
"Response rate:"
],
"Reyting:": [
"Рейтинг:",
"Rating:"
],
"(o‘chirilgan e‘lon)": [
"(удалённое объявление)",
"(deleted listing)"
],
"Uyga chaqiruv": [
"Вызов на дом",
"Home visit"
],
"Javobni tahrirlash": [
"Изменить ответ",
"Edit reply"
],
"Javob berish": [
"Ответить",
"Reply"
],
"Yem-xashak bozori": [
"Рынок кормов",
"Feed market"
],
"Chorva bozori": [
"Рынок скота",
"Livestock market"
],
"{n} ta mos e‘lon": [
"Подходящих объявлений: {n}",
"{n} matching listings"
],
"Bozorga bormang,": [
"Не ходите на рынок,",
"Don’t go to the market,"
],
"Toshkent": [
"Ташкент",
"Tashkent"
],
"Samarqand": [
"Самарканд",
"Samarkand"
],
"Buxoro": [
"Бухара",
"Bukhara"
],
"Farg‘ona": [
"Фергана",
"Fergana"
],
"Andijon": [
"Андижан",
"Andijan"
],
"Namangan": [
"Наманган",
"Namangan"
],
"Qashqadaryo": [
"Кашкадарья",
"Kashkadarya"
],
"Surxondaryo": [
"Сурхандарья",
"Surkhandarya"
],
"Xorazm": [
"Хорезм",
"Khorezm"
],
"Navoiy": [
"Навои",
"Navoi"
],
"Jizzax": [
"Джизак",
"Jizzakh"
],
"Sirdaryo": [
"Сырдарья",
"Syrdarya"
],
"Qoraqalpog‘iston": [
"Каракалпакстан",
"Karakalpakstan"
],
"Til": [
"Язык",
"Language"
],
"Ekosistema xaritasi": [
"Карта экосистемы",
"Ecosystem map"
],
"Demo ma‘lumotlar tiklansinmi? Barcha demo yozuvlar o‘chadi.": [
"Восстановить демо-данные? Все демо-записи будут удалены.",
"Reset demo data? All demo records will be deleted."
],
"Brauzer xotirasi to‘ldi. Kichikroq rasmlardan foydalaning yoki server storage ulang.": [
"Память браузера заполнена. Используйте фото меньшего размера или подключите серверное хранилище.",
"Browser storage is full. Use smaller photos or connect server storage."
],
"Qidiruv: nom, zot, viloyat, sotuvchi": [
"Поиск: название, порода, область, продавец",
"Search: title, breed, region, seller"
],
"+ E'lon": [
"+ Объявление",
"+ Listing"
],
"+ E'lon berish": [
"+ Подать объявление",
"+ Post a listing"
],
"+ Post": [
"+ Пост",
"+ Post"
],
"+ Rasm tanlash": [
"+ Выбрать фото",
"+ Choose photos"
],
"+ So‘rov": [
"+ Запрос",
"+ Request"
],
"Avval kategoriyani tanlang.": [
"Сначала выберите категорию.",
"Choose a category first."
],
"Avval tizimga kiring": [
"Сначала войдите в систему",
"Please sign in first"
],
"Ball faqat haqiqiy ma‘lumotlardan hisoblanadi. Tarixi yo‘q sotuvchi yuqori ball olmaydi.": [
"Балл считается только по реальным данным. Продавец без истории не получит высокий балл.",
"The score is based on real data only. A seller with no history cannot get a high score."
],
"Barchasi": [
"Все",
"All"
],
"Batafsil": [
"Подробнее",
"Details"
],
"Bozorga bormang, bozor sizga kelsin.": [
"Не ходите на рынок — рынок придёт к вам.",
"Don’t go to the market — the market comes to you."
],
"bozor sizga kelsin.": [
"рынок придёт к вам.",
"the market comes to you."
],
"Bu amalni bajarib bo‘lmaydi": [
"Это действие невозможно",
"This action is not possible"
],
"Bu email band": [
"Этот email уже занят",
"This email is already taken"
],
"Bu e‘lon uchun faol taklifingiz bor": [
"У вас уже есть активное предложение по этому объявлению",
"You already have an active offer for this listing"
],
"Bu qidiruv allaqachon saqlangan": [
"Этот поиск уже сохранён",
"This search is already saved"
],
"Chiqdingiz": [
"Вы вышли",
"Signed out"
],
"Chiqish": [
"Выйти",
"Sign out"
],
"Chorva topish": [
"Найти скот",
"Find livestock"
],
"Chorva, yem-xashak va qishloq xo‘jaligi xizmatlari uchun zamonaviy raqamli marketplace.": [
"Современный цифровой маркетплейс для скота, кормов и сельскохозяйственных услуг.",
"A modern digital marketplace for livestock, feed and farm services."
],
"Chorvangizni sotmoqchimisiz?": [
"Хотите продать скот?",
"Want to sell your livestock?"
],
"DEMO: aziz@demo.uz (xaridor), botir@demo.uz (sotuvchi) · parol: demo1234": [
"ДЕМО: aziz@demo.uz (покупатель), botir@demo.uz (продавец) · пароль: demo1234",
"DEMO: aziz@demo.uz (buyer), botir@demo.uz (seller) · password: demo1234"
],
"DEMO: e’lon tasdiqlandi": [
"ДЕМО: объявление одобрено",
"DEMO: listing approved"
],
"DEMO: tasdiqlash": [
"ДЕМО: одобрить",
"DEMO: approve"
],
"Davom etish": [
"Продолжить",
"Continue"
],
"Demo tiklandi": [
"Демо восстановлено",
"Demo restored"
],
"Demoni tiklash": [
"Сбросить демо",
"Reset demo"
],
"Email": [
"Email",
"Email"
],
"Email noto‘g‘ri": [
"Неверный email",
"Invalid email"
],
"Email yoki parol noto‘g‘ri": [
"Неверный email или пароль",
"Incorrect email or password"
],
"E‘lon berish": [
"Подать объявление",
"Post a listing"
],
"E‘lon joylash uchun hisobingizga kiring.": [
"Войдите в аккаунт, чтобы подать объявление.",
"Sign in to post a listing."
],
"E‘lon mavjud emas": [
"Объявление не найдено",
"Listing not found"
],
"E‘lon topilmadi": [
"Объявление не найдено",
"Listing not found"
],
"E‘lonni joylash uchun kamida 5 ta haqiqiy rasm yuklash kerak.": [
"Для публикации нужно загрузить минимум 5 реальных фото.",
"You need to upload at least 5 real photos to publish."
],
"E’lon avval tekshiruvga yuboriladi (holati: Tekshiruvda).": [
"Объявление сначала отправляется на проверку (статус: на проверке).",
"The listing is sent for review first (status: under review)."
],
"E’loningizdagi mahsulot/chorvaning haqiqiy rasmlarini yuklang.": [
"Загрузите реальные фото товара/скота из вашего объявления.",
"Upload real photos of the product/livestock in your listing."
],
"Familiya": [
"Фамилия",
"Last name"
],
"Familiya kiriting": [
"Введите фамилию",
"Enter your last name"
],
"Faqat sotuvchi javob bera oladi": [
"Отвечать может только продавец",
"Only the seller can reply"
],
"FarMarket qanday ishlaydi?": [
"Как работает FarMarket?",
"How does FarMarket work?"
],
"Forma xato": [
"Ошибка в форме",
"Form error"
],
"Hali sharhlar yo‘q": [
"Отзывов пока нет",
"No reviews yet"
],
"Hali yo‘q": [
"Пока нет",
"None yet"
],
"Hayvon turi": [
"Вид животного",
"Animal type"
],
"Holat yangilandi": [
"Статус обновлён",
"Status updated"
],
"Ishonch": [
"Доверие",
"Trust"
],
"Ism": [
"Имя",
"First name"
],
"Ism kiriting": [
"Введите имя",
"Enter your first name"
],
"Izoh": [
"Комментарий",
"Comment"
],
"Izoh juda qisqa": [
"Комментарий слишком короткий",
"Comment is too short"
],
"Izohingiz": [
"Ваш комментарий",
"Your comment"
],
"Javob bo‘sh": [
"Пустой ответ",
"Empty reply"
],
"Javobingiz": [
"Ваш ответ",
"Your reply"
],
"Jins": [
"Пол",
"Sex"
],
"Kamida 6 belgi": [
"Минимум 6 символов",
"At least 6 characters"
],
"Kamida bitta rol tanlang": [
"Выберите хотя бы одну роль",
"Choose at least one role"
],
"Kategoriya": [
"Категория",
"Category"
],
"Kategoriya bo‘yicha": [
"По категориям",
"By category"
],
"Kategoriya o‘zgarsa, ayrim kiritilgan ma’lumotlar o‘chirilishi mumkin. Rasmlar saqlanadi.": [
"При смене категории часть введённых данных может быть удалена. Фото сохранятся.",
"If you change the category, some entered data may be removed. Photos are kept."
],
"Kategoriyani o‘zgartirasizmi?": [
"Сменить категорию?",
"Change category?"
],
"Kelishiladi": [
"Торг возможен",
"Negotiable"
],
"Keyingisi →": [
"Далее →",
"Next →"
],
"Kirish": [
"Войти",
"Sign in"
],
"Kirish yoki ro‘yxatdan o‘tish kerak.": [
"Нужно войти или зарегистрироваться.",
"You need to sign in or register."
],
"Ko‘rinishi": [
"Предпросмотр",
"Preview"
],
"Manzil": [
"Адрес",
"Address"
],
"Mashhur kategoriyalar": [
"Популярные категории",
"Popular categories"
],
"Matn": [
"Текст",
"Text"
],
"Maydonlarni to‘ldiring": [
"Заполните поля",
"Fill in the fields"
],
"Mening e‘lonlarim": [
"Мои объявления",
"My listings"
],
"Mening qabullarim": [
"Мои записи",
"My appointments"
],
"Muammo": [
"Проблема",
"Problem"
],
"Muqova": [
"Обложка",
"Cover"
],
"Narx noto‘g‘ri": [
"Неверная цена",
"Invalid price"
],
"Narx va joylashuv": [
"Цена и местоположение",
"Price and location"
],
"Nima sotasiz?": [
"Что вы продаёте?",
"What are you selling?"
],
"Ommaviy profil": [
"Публичный профиль",
"Public profile"
],
"O‘chirish": [
"Удалить",
"Delete"
],
"O‘xshash e‘lonlar": [
"Похожие объявления",
"Similar listings"
],
"O‘z e‘loningizga taklif bera olmaysiz": [
"Нельзя делать предложение на своё объявление",
"You cannot make an offer on your own listing"
],
"O‘z sharhingizga ovoz bera olmaysiz": [
"Нельзя голосовать за свой отзыв",
"You cannot vote on your own review"
],
"Parol": [
"Пароль",
"Password"
],
"Qabul qilindi": [
"Принято",
"Accepted"
],
"Qabulga yozilish": [
"Записаться на приём",
"Book an appointment"
],
"Qanday hisoblanadi?": [
"Как считается?",
"How is it calculated?"
],
"Qarshi taklif": [
"Встречное предложение",
"Counter-offer"
],
"Qarshi taklif berib bo‘lmaydi": [
"Нельзя сделать встречное предложение",
"A counter-offer is not possible"
],
"Qarshi taklif xaridor javobini kutmoqda": [
"Встречное предложение ждёт ответа покупателя",
"The counter-offer is awaiting the buyer’s reply"
],
"Qarshi taklif yo‘q": [
"Нет встречного предложения",
"No counter-offer"
],
"Qarshi taklif yuborildi": [
"Встречное предложение отправлено",
"Counter-offer sent"
],
"Qayerdan": [
"Откуда",
"From"
],
"Qayerga": [
"Куда",
"To"
],
"Qidirish": [
"Найти",
"Search"
],
"Qidiruv saqlandi": [
"Поиск сохранён",
"Search saved"
],
"Qidiruv → Filtr → E‘lon → Sotuvchi → Taklif → Kelishuv → Yetkazish → Yakunlandi → Sharh": [
"Поиск → Фильтр → Объявление → Продавец → Предложение → Договорённость → Доставка → Завершено → Отзыв",
"Search → Filter → Listing → Seller → Offer → Agreement → Delivery → Completed → Review"
],
"Qoralama saqlandi": [
"Черновик сохранён",
"Draft saved"
],
"Qoralama sifatida saqlash": [
"Сохранить как черновик",
"Save as draft"
],
"Qo‘ng‘iroq": [
"Позвонить",
"Call"
],
"Rasm limiti to‘ldi.": [
"Достигнут лимит фото.",
"Photo limit reached."
],
"Rasm talabi": [
"Требование к фото",
"Photo requirement"
],
"Rasm topilmadi — sotuvchi qayta yuklashi kerak": [
"Фото не найдено — продавцу нужно загрузить заново",
"Photo not found — the seller must re-upload"
],
"Rasmlar": [
"Фото",
"Photos"
],
"Rasmlarni shu yerga tashlang yoki tanlang": [
"Перетащите фото сюда или выберите",
"Drop photos here or choose"
],
"Rollar": [
"Роли",
"Roles"
],
"Ro‘yxatdan o‘tdingiz": [
"Вы зарегистрированы",
"You are registered"
],
"Ro‘yxatdan o‘tish": [
"Регистрация",
"Register"
],
"Ro‘yxatdan o‘tish → E‘lon → Taklif → Qabul/Qarshi taklif → Yetkazish → Yakunlandi → Sharh": [
"Регистрация → Объявление → Предложение → Принятие/Встречное → Доставка → Завершено → Отзыв",
"Register → Listing → Offer → Accept/Counter → Delivery → Completed → Review"
],
"Ruxsat yo‘q": [
"Нет доступа",
"Not allowed"
],
"Sabab": [
"Причина",
"Reason"
],
"Sababni tanlang": [
"Выберите причину",
"Choose a reason"
],
"Sahifani ko‘rsatishda xatolik": [
"Ошибка при отображении страницы",
"Error displaying the page"
],
"Sana": [
"Дата",
"Date"
],
"Saqlangan qidiruvlar": [
"Сохранённые поиски",
"Saved searches"
],
"Sarlavha": [
"Заголовок",
"Title"
],
"Savdolashish": [
"Торговаться",
"Negotiate"
],
"Sharh qoldirilgan": [
"Отзыв оставлен",
"Review left"
],
"Sharh qoldirish": [
"Оставить отзыв",
"Leave a review"
],
"Sharh qoldirish mumkin emas": [
"Оставить отзыв нельзя",
"Cannot leave a review"
],
"Sharh qoldirish uchun ruxsat yo‘q": [
"Нет права оставить отзыв",
"Not allowed to leave a review"
],
"Sharh qo‘shildi": [
"Отзыв добавлен",
"Review added"
],
"Sharh topilmadi": [
"Отзыв не найден",
"Review not found"
],
"Sharhga javob": [
"Ответ на отзыв",
"Reply to review"
],
"Sharhga shikoyat": [
"Жалоба на отзыв",
"Report a review"
],
"Sharhlar": [
"Отзывы",
"Reviews"
],
"Shikoyat": [
"Пожаловаться",
"Report"
],
"Shikoyat qabul qilindi": [
"Жалоба принята",
"Report received"
],
"Siz allaqachon ovoz bergansiz": [
"Вы уже голосовали",
"You have already voted"
],
"Siz allaqachon shikoyat qilgansiz": [
"Вы уже подавали жалобу",
"You have already reported this"
],
"Soni": [
"Количество",
"Quantity"
],
"Sotuvchi javobi:": [
"Ответ продавца:",
"Seller’s reply:"
],
"Sotuvchi kabineti": [
"Кабинет продавца",
"Seller dashboard"
],
"So‘rov saqlandi": [
"Запрос сохранён",
"Request saved"
],
"Tafsilot": [
"Подробности",
"Details"
],
"Tahrirlash mumkin emas": [
"Редактирование невозможно",
"Editing is not possible"
],
"Taklif narxi (so‘m)": [
"Предлагаемая цена (сум)",
"Offer price (UZS)"
],
"Taklif sotuvchi qabul qilgunga qadar yakunlanmaydi. To‘lov — DEMO.": [
"Предложение не считается завершённым, пока продавец не примет его. Оплата — ДЕМО.",
"The offer is not final until the seller accepts it. Payment is DEMO."
],
"Taklif yuborish": [
"Отправить предложение",
"Send an offer"
],
"Takliflar va savdolar": [
"Предложения и сделки",
"Offers and deals"
],
"Tanlang": [
"Выберите",
"Choose"
],
"Tasdiqlangan": [
"Проверен",
"Verified"
],
"Tasdiqlangan sotuvchilardan": [
"От проверенных продавцов",
"From verified sellers"
],
"Telefon": [
"Телефон",
"Phone"
],
"Telefon noto‘g‘ri": [
"Неверный телефон",
"Invalid phone number"
],
"Tez orada": [
"Скоро",
"Coming soon"
],
"Tozalash": [
"Очистить",
"Clear"
],
"Transport so‘rovi": [
"Запрос на перевозку",
"Transport request"
],
"Tranzaksiya topilmadi": [
"Сделка не найдена",
"Transaction not found"
],
"Trust Score": [
"Рейтинг доверия",
"Trust Score"
],
"Trust Score qanday hisoblanadi?": [
"Как считается рейтинг доверия?",
"How is the Trust Score calculated?"
],
"Tuman/Shahar": [
"Район/город",
"District/City"
],
"Umumiy baho": [
"Общая оценка",
"Overall rating"
],
"Umumiy bahoni tanlang": [
"Выберите общую оценку",
"Choose an overall rating"
],
"Umumiy ma’lumot": [
"Общая информация",
"General information"
],
"Uyga vrach chaqirish": [
"Вызвать врача на дом",
"Request a home visit"
],
"Vaqt": [
"Время",
"Time"
],
"Veterinar topish": [
"Найти ветеринара",
"Find a vet"
],
"Viloyat": [
"Область",
"Region"
],
"Viloyatni tanlang": [
"Выберите область",
"Choose a region"
],
"Xaridlarim": [
"Мои покупки",
"My purchases"
],
"Xush kelibsiz!": [
"Добро пожаловать!",
"Welcome!"
],
"Yangi narx (so‘m)": [
"Новая цена (сум)",
"New price (UZS)"
],
"Yangi post": [
"Новый пост",
"New post"
],
"Yaqiningizdagi e‘lonlar": [
"Объявления рядом с вами",
"Listings near you"
],
"Yem-xashak": [
"Корма",
"Feed"
],
"Yuborish": [
"Отправить",
"Submit"
],
"— Tanlang —": [
"— Выберите —",
"— Choose —"
],
"← Boshqa kategoriya": [
"← Другая категория",
"← Another category"
],
"← Orqaga": [
"← Назад",
"← Back"
],
"★ Sharh qoldirish": [
"★ Оставить отзыв",
"★ Leave a review"
],
"♡ Saralash": [
"♡ В избранное",
"♡ Favorite"
],
"✓ Tasdiqlangan": [
"✓ Проверен",
"✓ Verified"
],
"✓ Tasdiqlangan sotuvchi": [
"✓ Проверенный продавец",
"✓ Verified seller"
],
"✓ Tasdiqlangan xarid": [
"✓ Подтверждённая покупка",
"✓ Verified purchase"
],
"📞 Telefon raqamini ko‘rsatish": [
"📞 Показать номер телефона",
"📞 Show phone number"
],
"🔔 Qidiruvni saqlash": [
"🔔 Сохранить поиск",
"🔔 Save search"
],
"Kiriting": [
"Введите значение",
"Required"
],
"Muammoni yozing": [
"Опишите проблему",
"Describe the problem"
],
"Olib tashlandi": [
"Удалено из избранного",
"Removed"
],
"Sana noto‘g‘ri": [
"Неверная дата",
"Invalid date"
],
"Saralanganlarga qo‘shildi": [
"Добавлено в избранное",
"Added to favorites"
],
"Sarlavha va matnni to‘ldiring": [
"Заполните заголовок и текст",
"Fill in the title and text"
],
"Sharhlar yo‘q": [
"Отзывов нет",
"No reviews"
],
"Narx dan": [
"Цена от",
"Min price"
],
"Narx gacha": [
"Цена до",
"Max price"
],
"Nimani qidiryapsiz? Sigir, qo‘y, ot, yem, pichan": [
"Что вы ищете? Корова, овца, лошадь, корм, сено",
"What are you looking for? Cow, sheep, horse, feed, hay"
],
"Qidiruv": [
"Поиск",
"Search"
],
"Saralash": [
"Избранное",
"Favorite"
],
"Qayerdan?": [
"Откуда?",
"From where?"
],
"Yopish": [
"Закрыть",
"Close"
],
"Ekosistema": [
"Экосистема",
"Ecosystem"
],
"Admin panel hali yo‘q": [
"Админ-панели пока нет",
"There is no admin panel yet"
],
"Kamida 5 ta rasm kerak": [
"Нужно минимум 5 фото",
"At least 5 photos required"
],
"Keyingi": [
"Далее",
"Next"
],
"Oldinga": [
"Вперёд",
"Forward"
],
"Oldingi": [
"Назад",
"Previous"
],
"Orqaga": [
"Назад",
"Back"
],
"Rasmni kattalashtirish": [
"Увеличить фото",
"Enlarge photo"
],
"Asosiy menyu": [
"Главное меню",
"Main menu"
],
"Mobil menyu": [
"Мобильное меню",
"Mobile menu"
],
"Pastki menyu": [
"Нижнее меню",
"Bottom menu"
],
"FarMarket bosh sahifa": [
"FarMarket — главная",
"FarMarket home"
],
"Demo rejim: ma'lumotlar brauzeringizda (localStorage) saqlanadi. To'lov — DEMO. AI xususiyati tez orada.": [
"Демо-режим: данные хранятся в вашем браузере (localStorage). Оплата — ДЕМО. ИИ-функция скоро появится.",
"Demo mode: data is stored in your browser (localStorage). Payment is DEMO. The AI feature is coming soon."
],
"FarMarket — chorva, yem-xashak va qishloq xo‘jaligi xizmatlarini birlashtiruvchi zamonaviy raqamli marketplace.": [
"FarMarket — современный цифровой маркетплейс, объединяющий скот, корма и сельскохозяйственные услуги.",
"FarMarket — a modern digital marketplace for livestock, feed and farm services."
],
"Transport so‘rovlari yo‘q": [
"Запросов на перевозку нет",
"No transport requests"
],
"Yangi so‘rov yarating": [
"Создайте новый запрос",
"Create a new request"
],
"Xarita yuklanmadi": [
"Карта не загрузилась",
"The map failed to load"
],
"Internet aloqasini tekshiring": [
"Проверьте подключение к интернету",
"Check your internet connection"
],
"Xabarnomalar yo‘q": [
"Уведомлений нет",
"No notifications"
],
"Saralanganlar bo‘sh": [
"В избранном пусто",
"Your favorites are empty"
],
"Siz sotuvchi emassiz": [
"Вы не продавец",
"You are not a seller"
],
"Sotuvchi sifatida ro‘yxatdan o‘ting": [
"Зарегистрируйтесь как продавец",
"Register as a seller"
],
"Hali xaridlar yo‘q": [
"Покупок пока нет",
"No purchases yet"
],
"Bozordan e‘lon tanlab taklif yuboring": [
"Выберите объявление на рынке и отправьте предложение",
"Pick a listing on the market and send an offer"
],
"E‘lonlar yo‘q": [
"Объявлений нет",
"No listings"
],
"Faol e‘lonlar yo‘q": [
"Активных объявлений нет",
"No active listings"
],
"Postlar yo‘q": [
"Постов нет",
"No posts"
],
"Qabullar yo‘q": [
"Записей нет",
"No appointments"
],
"Takliflar yo‘q": [
"Предложений нет",
"No offers"
],
"Saqlangan qidiruvlar yo‘q": [
"Сохранённых поисков нет",
"No saved searches"
],
"Bozorda “Qidiruvni saqlash” tugmasini bosing": [
"Нажмите «Сохранить поиск» на рынке",
"Press “Save search” on the market page"
],
"Sotuvchi topilmadi": [
"Продавец не найден",
"Seller not found"
],
"Qidiruv yoki filtrlarni o‘zgartirib ko‘ring": [
"Измените поиск или фильтры",
"Try changing the search or filters"
],
"Bor": [
"Есть",
"Yes"
],
"E‘lon sarlavhasi": [
"Заголовок объявления",
"Listing title"
],
"E‘lonni tahrirlash": [
"Редактирование объявления",
"Edit listing"
],
"E’lon yangilandi.": [
"Объявление обновлено.",
"Listing updated."
],
"E’loningiz tekshiruvga yuborildi.": [
"Ваше объявление отправлено на проверку.",
"Your listing was sent for review."
],
"Fayl juda kichik": [
"Файл слишком маленький",
"File is too small"
],
"Faylni o‘qib bo‘lmadi": [
"Не удалось прочитать файл",
"Could not read the file"
],
"Ha, kelishiladi": [
"Да, торг возможен",
"Yes, negotiable"
],
"Joy": [
"Место",
"Location"
],
"Manzil (ixtiyoriy)": [
"Адрес (необязательно)",
"Address (optional)"
],
"Maslahat: hayvonning old, yon, orqa tomoni va yuz qismini aniq suratga oling.": [
"Совет: чётко сфотографируйте животное спереди, сбоку, сзади и морду.",
"Tip: take clear photos of the animal’s front, sides, back and face."
],
"Maslahat: mahsulotning umumiy ko‘rinishi, qadoqlanishi, sifati va miqdorini ko‘rsatuvchi rasmlarni yuklang.": [
"Совет: загрузите фото, показывающие общий вид, упаковку, качество и количество товара.",
"Tip: upload photos showing the product overall, packaging, quality and quantity."
],
"Ma’lumotlar": [
"Данные",
"Details"
],
"Minimal talab bajarildi. Ko‘proq rasm — ko‘proq ishonch.": [
"Минимум выполнен. Больше фото — больше доверия.",
"Minimum met. More photos — more trust."
],
"Miqdor": [
"Количество",
"Amount"
],
"Miqdorni to‘g‘ri kiriting.": [
"Введите корректное количество.",
"Enter a valid amount."
],
"Narx": [
"Цена",
"Price"
],
"Narx (so‘m)": [
"Цена (сум)",
"Price (UZS)"
],
"Narx birligi": [
"Единица цены",
"Price unit"
],
"Narx birligini tanlang.": [
"Выберите единицу цены.",
"Choose a price unit."
],
"Narx kelishiladimi?": [
"Возможен ли торг?",
"Is the price negotiable?"
],
"Narxni to‘g‘ri kiriting.": [
"Введите корректную цену.",
"Enter a valid price."
],
"Nima sotayotganingizni tanlang.": [
"Выберите, что вы продаёте.",
"Choose what you are selling."
],
"O‘lchov birligi": [
"Единица измерения",
"Unit"
],
"O‘lchov birligini tanlang.": [
"Выберите единицу измерения.",
"Choose a unit."
],
"Qaysi chorvani sotasiz?": [
"Какой скот вы продаёте?",
"Which livestock are you selling?"
],
"Rasm hajmi 10 MB dan oshmasligi kerak.": [
"Размер фото не должен превышать 10 МБ.",
"Photo size must not exceed 10 MB."
],
"Rasm o‘lchami juda kichik": [
"Размер фото слишком мал",
"Photo dimensions are too small"
],
"Rasm yuklanmadi — sotuvchi qayta yuklashi kerak": [
"Фото не загружено — продавцу нужно загрузить заново",
"Photo not loaded — the seller must re-upload"
],
"Tavsif": [
"Описание",
"Description"
],
"Tekshirish": [
"Проверка",
"Review"
],
"Tekshiruvga yuborish": [
"Отправить на проверку",
"Submit for review"
],
"Tuman / shahar": [
"Район / город",
"District / city"
],
"Tur": [
"Вид",
"Type"
],
"Turi": [
"Тип",
"Type"
],
"Vazn (kg)": [
"Вес (кг)",
"Weight (kg)"
],
"Viloyatni tanlang.": [
"Выберите область.",
"Choose a region."
],
"Yem-xashak turi": [
"Вид корма",
"Feed type"
],
"Yetkazib berish": [
"Доставка",
"Delivery"
],
"Yetkazish narxi (so‘m, ixtiyoriy)": [
"Стоимость доставки (сум, необязательно)",
"Delivery price (UZS, optional)"
],
"Yosh": [
"Возраст",
"Age"
],
"Yo‘q": [
"Нет",
"No"
],
"Zot": [
"Порода",
"Breed"
],
"Noma’lum": [
"Неизвестно",
"Unknown"
],
" ta rasm yuklang. Yana ": [
" фото. Ещё ",
" photos. Add "
],
"{n} / 5 qadam": [
"Шаг {n} из 5",
"Step {n} of 5"
],
"Chorva": [
"Скот",
"Livestock"
],
"Veterinariya xizmati": [
"Ветеринарная услуга",
"Veterinary service"
],
"Transport xizmati": [
"Транспортная услуга",
"Transport service"
],
"Qishloq xo‘jaligi mahsuloti": [
"Сельхозпродукция",
"Farm product"
],
"Sigir": [
"Корова",
"Cow"
],
"Buqa": [
"Бык",
"Bull"
],
"Qo‘chqor": [
"Баран",
"Ram"
],
"Quyon": [
"Кролик",
"Rabbit"
],
"Beda": [
"Люцерна",
"Alfalfa"
],
"Somon": [
"Солома",
"Straw"
],
"Presslangan yem": [
"Прессованный корм",
"Pressed feed"
],
"Silos": [
"Силос",
"Silage"
],
"Makkajo‘xori (silos)": [
"Кукуруза (силос)",
"Corn (silage)"
],
"Bug‘doy": [
"Пшеница",
"Wheat"
],
"Arpa": [
"Ячмень",
"Barley"
],
"Makkajo‘xori doni": [
"Зерно кукурузы",
"Corn grain"
],
"Kombikorm": [
"Комбикорм",
"Compound feed"
],
"Beda / pichan": [
"Люцерна / сено",
"Alfalfa / hay"
],
"Don": [
"Зерно",
"Grain"
],
"Boshqa hayvon": [
"Другое животное",
"Other animal"
],
"Boshqa yem": [
"Другой корм",
"Other feed"
],
"E'lon joylash uchun kamida 5 ta haqiqiy rasm yuklang.": [
"Для публикации загрузите минимум 5 реальных фото.",
"Upload at least 5 real photos to publish your listing."
]
};
let FM_LANG = (() => { try { const l = localStorage.getItem(FM_LANG_KEY); return FM_LANGS[l] ? l : 'uz'; } catch (e) { return 'uz'; } })();
const numLocale = () => FM_LANGS[FM_LANG].locale;
function _t(key, params) {
  const e = FM_DICT[key]; let s = key;
  if (e && FM_LANG !== 'uz') { const v = e[FM_LANG === 'ru' ? 0 : 1]; if (v) s = v; }
  if (params) s = s.replace(/\{(\w+)\}/g, (m, k) => (k in params ? params[k] : m));
  return s;
}
function applyStaticI18n() {
  document.documentElement.lang = FM_LANG;
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = _t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', _t(el.dataset.i18nAria)); });
  document.title = 'FarMarket | ' + _t('Bozorga bormang, bozor sizga kelsin.');
  const md = document.querySelector('meta[name="description"]'); if (md) md.setAttribute('content', _t('FarMarket — chorva, yem-xashak va qishloq xo‘jaligi xizmatlarini birlashtiruvchi zamonaviy raqamli marketplace.'));
  const sel = document.getElementById('lang-select'); if (sel) { sel.value = FM_LANG; sel.setAttribute('aria-label', _t('Til')); }
}
function setLang(l) {
  if (!FM_LANGS[l]) return;
  FM_LANG = l; try { localStorage.setItem(FM_LANG_KEY, l); } catch (e) {}
  applyStaticI18n();
  if (typeof closeModal === 'function') closeModal();
  if (typeof renderNav === 'function') { renderNav(); render(); }
}
document.addEventListener('change', e => { if (e.target && e.target.id === 'lang-select') setLang(e.target.value); });
applyStaticI18n();
