'use strict';
const KEYS = {
  users:'fmarket_users', current:'fmarket_current_user', sellers:'fmarket_sellers', products:'fmarket_products',
  transactions:'fmarket_transactions', offers:'fmarket_offers', reviews:'fmarket_reviews', reports:'fmarket_review_reports',
  notifications:'fmarket_notifications', wishlist:'fmarket_wishlist', posts:'fmarket_community_posts',
  comments:'fmarket_community_comments', vets:'fmarket_veterinarians', appointments:'fmarket_appointments',
  transport:'fmarket_transport_requests', saved:'fmarket_saved_searches', seeded:'fmarket_seeded_v1'
};
const LEGACY_PREFIX = 'farmora_';
// Canonical routes (one name per section)
const ROUTES = {
  home:'Bosh sahifa', sell:'E‘lon joylash', marketplace:'Bozor', feed:'Yem-Oshat', veterinary:'Veterinariya', transport:'Transport', community:'Jamiyat', map:'Xarita',
  sellerProfile:'Sotuvchi', sellerDashboard:'Kabinet', purchases:'Xaridlar', wishlist:'Saralanganlar', notifications:'Xabarnomalar'
};
const NAV_ROUTES = ['home','marketplace','feed','veterinary','transport','community','map'];
const TX = { PENDING:'pending', ACCEPTED:'accepted', CONFIRMED:'confirmed', PREPARING:'preparing', SHIPPING:'shipping',
  DELIVERED:'delivered', COMPLETED:'completed', REJECTED:'rejected', CANCELLED:'cancelled', EXPIRED:'expired', DISPUTED:'disputed' };
// Allowed forward transitions and who may perform them
const TX_FLOW = {
  pending:   { accepted:'seller', rejected:'seller', cancelled:'buyer' },
  accepted:  { confirmed:'buyer', cancelled:'buyer' },
  confirmed: { preparing:'seller' },
  preparing: { shipping:'seller' },
  shipping:  { delivered:'seller' },
  delivered: { completed:'buyer', disputed:'buyer' }
};
const TX_LABEL = { pending:'Taklif yuborildi', accepted:'Sotuvchi qabul qildi', confirmed:'Xaridor tasdiqladi', preparing:'Tayyorlanmoqda',
  shipping:'Yo‘lda / olib ketish', delivered:'Yetkazildi', completed:'Yakunlandi', rejected:'Rad etildi', cancelled:'Bekor qilindi', expired:'Muddati tugadi', disputed:'Nizo' };
const OFFER = { PENDING:'pending', COUNTERED:'countered', ACCEPTED:'accepted', REJECTED:'rejected', CANCELLED:'cancelled', EXPIRED:'expired' };
const LISTING = { DRAFT:'draft', PENDING:'pending', ACTIVE:'active', RESERVED:'reserved', SOLD:'sold', REJECTED:'rejected', EXPIRED:'expired', ARCHIVED:'archived' };
const APPT = { PENDING:'Pending', CONFIRMED:'Confirmed', IN_PROGRESS:'In Progress', COMPLETED:'Completed', CANCELLED:'Cancelled', REJECTED:'Rejected' };
const NOTIF = { SAVED:'saved_search', ALERT:'wishlist_alert', OFFER:'offer', TX:'transaction', REVIEW:'review', RESPONSE:'seller_response', APPT:'appointment', MSG:'message' };
const CATEGORIES = { cattle:'Qoramol', sheep:'Qo‘y', goat:'Echki', horse:'Ot', camel:'Tuya', poultry:'Parranda', other:'Boshqa chorva',
  feed:'Yem', hay:'Pichan', agri:'Boshqa qishloq mahsuloti' };
const FEED_CATS = ['feed','hay','agri'];
const REGIONS = ['Toshkent','Samarqand','Buxoro','Farg‘ona','Andijon','Namangan','Qashqadaryo','Surxondaryo','Xorazm','Navoiy','Jizzax','Sirdaryo','Qoraqalpog‘iston'];
const ROLES = { buyer:'Xaridor', seller:'Sotuvchi', farmer:'Fermer', business:'Biznes', veterinarian:'Veterinar', transport:'Transport' };
