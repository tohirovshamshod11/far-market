'use strict';
const DB = {
  get: k => safeLoad(KEYS[k], []), set: (k, v) => safeSave(KEYS[k], v)
};
async function hashPw(p) { try { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('fm:' + p)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join(''); } catch (e) { return 'plain:' + p; } }
async function seedIfNeeded(force) {
  if (!force && localStorage.getItem(KEYS.seeded) && Array.isArray(safeLoad(KEYS.users, null))) return;
  const d = buildMockData(await hashPw('demo1234'));
  Object.keys(d).forEach(k => DB.set(k === 'vets' ? 'vets' : k, d[k]));
  ['appointments','transport','wishlist','comments','reports'].forEach(k => DB.set(k, []));
  safeSave(KEYS.seeded, 1);
}
async function resetDemoData() { // legacy farmora_* keys are intentionally left untouched
  Object.values(KEYS).forEach(k => localStorage.removeItem(k)); await seedIfNeeded(true);
}
const byId = (list, id) => list.find(x => x.id === id) || null;
const getCurrentUser = () => { const id = safeLoad(KEYS.current, null); return id ? byId(DB.get('users'), typeof id === 'object' ? id.id : id) : null; };
const getCurrentSeller = () => { const u = getCurrentUser(); return u ? DB.get('sellers').find(s => s.ownerUserId === u.id) || null : null; };
const getSellerById = id => byId(DB.get('sellers'), id);
const getProductById = id => byId(DB.get('products'), id);
const getTransactionById = id => byId(DB.get('transactions'), id);
const getUserById = id => byId(DB.get('users'), id);

const authService = {
  async login(email, password) {
    const u = DB.get('users').find(x => norm(x.email) === norm(email));
    if (!u || u.passwordHash !== await hashPw(password)) throw new Error('Email yoki parol noto‘g‘ri');
    safeSave(KEYS.current, u.id); return u;
  },
  async register(f) {
    const err = {};
    if (!f.firstName.trim()) err.firstName = 'Ism kiriting'; if (!f.lastName.trim()) err.lastName = 'Familiya kiriting';
    if (!validPhone(f.phone)) err.phone = 'Telefon noto‘g‘ri'; if (!validEmail(f.email)) err.email = 'Email noto‘g‘ri';
    if (f.password.length < 6) err.password = 'Kamida 6 belgi'; if (!f.region) err.region = 'Viloyatni tanlang';
    if (!f.roles.length) err.roles = 'Kamida bitta rol tanlang';
    if (DB.get('users').some(u => norm(u.email) === norm(f.email))) err.email = 'Bu email band';
    if (Object.keys(err).length) { const e = new Error('Forma xato'); e.fields = err; throw e; }
    const t = new Date().toISOString();
    const u = { id:generateId('u'), firstName:f.firstName.trim(), lastName:f.lastName.trim(), phone:f.phone.trim(), email:f.email.trim(), region:f.region, district:f.district.trim(), roles:f.roles, avatar:'', passwordHash:await hashPw(f.password), createdAt:t, updatedAt:t };
    DB.set('users', [...DB.get('users'), u]);
    if (u.roles.includes('seller')) { // seller profile linked via ownerUserId
      DB.set('sellers', [...DB.get('sellers'), { id:generateId('s'), ownerUserId:u.id, name:u.firstName + ' ' + u.lastName, phone:u.phone, location:u.district + ', ' + u.region, region:u.region, district:u.district, description:'', avatar:'', isVerified:false, createdAt:t, updatedAt:t }]);
    }
    safeSave(KEYS.current, u.id); return u;
  },
  logout() { localStorage.removeItem(KEYS.current); }
};

const telegramService = { // fire-and-forget; silently skipped until TELEGRAM_PROXY_URL is configured
  notify(text) {
    const url = typeof FM_CONFIG !== 'undefined' && FM_CONFIG.TELEGRAM_PROXY_URL; if (!url) return;
    try { fetch(url, { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify({ text }) }).catch(() => {}); } catch (e) { /* ignore */ }
  }
};
const savedSearchService = {
  list: uid => safeLoad(KEYS.saved, []).filter(x => x.userId === uid),
  add(uid, label, q, opts) {
    const all = safeLoad(KEYS.saved, []), key = JSON.stringify([q, opts]);
    if (all.some(x => x.userId === uid && JSON.stringify([x.q, x.opts]) === key)) throw new Error('Bu qidiruv allaqachon saqlangan');
    DB.set('saved', [...all, { id:generateId('ss'), userId:uid, label, q, opts, createdAt:new Date().toISOString() }]);
  },
  remove(uid, id) { DB.set('saved', safeLoad(KEYS.saved, []).filter(x => !(x.id === id && x.userId === uid))); },
  notifyMatches(p) {
    const seller = getSellerById(p.sellerId);
    safeLoad(KEYS.saved, []).forEach(ss => {
      if (seller && seller.ownerUserId === ss.userId) return;
      if (productService.search(ss.q, ss.opts || {}).some(x => x.id === p.id)) notificationService.push(ss.userId, NOTIF.SAVED, 'Yangi mos e‘lon', 'Saqlagan qidiruvingizga mos yangi e‘lon topildi: ' + p.title, p.id);
    });
  }
};
function notifyWishers(pid, msg, exceptUserId) {
  const p = getProductById(pid); if (!p) return;
  safeLoad(KEYS.wishlist, []).filter(w => w.productId === pid && w.userId !== exceptUserId).forEach(w => notificationService.push(w.userId, NOTIF.ALERT, 'Saralangan e‘lon yangilandi', p.title + ' — ' + msg, pid));
}
const notificationService = {
  push(userId, type, title, message, relatedId) { if (!userId) return; DB.set('notifications', [{ id:generateId('n'), userId, type, title, message, relatedId:relatedId || null, read:false, createdAt:new Date().toISOString() }, ...DB.get('notifications')]); },
  forUser: uid => DB.get('notifications').filter(n => n.userId === uid).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  unread: uid => DB.get('notifications').filter(n => n.userId === uid && !n.read).length,
  markAllRead(uid) { DB.set('notifications', DB.get('notifications').map(n => n.userId === uid ? { ...n, read:true } : n)); }
};

const wishlistService = {
  ids(uid) { const w = safeLoad(KEYS.wishlist, []); return (Array.isArray(w) ? w : []).filter(x => x.userId === uid).map(x => x.productId); },
  toggle(uid, pid) { let w = safeLoad(KEYS.wishlist, []); if (!Array.isArray(w)) w = []; const has = w.some(x => x.userId === uid && x.productId === pid);
    w = has ? w.filter(x => !(x.userId === uid && x.productId === pid)) : [...w, { userId:uid, productId:pid }]; safeSave(KEYS.wishlist, w); return !has; },
  clear(uid) { DB.set('wishlist', safeLoad(KEYS.wishlist, []).filter(x => x.userId !== uid)); }
};

const sellerService = {
  ensure(u) { // seller profile always belongs to the authenticated user (ownerUserId)
    const f = DB.get('sellers').find(x => x.ownerUserId === u.id); if (f) return f; const t = new Date().toISOString();
    const s = { id:generateId('s'), ownerUserId:u.id, name:u.firstName + ' ' + u.lastName, phone:u.phone, location:u.district + ', ' + u.region, region:u.region, district:u.district, description:'', avatar:'', isVerified:false, createdAt:t, updatedAt:t };
    DB.set('sellers', [...DB.get('sellers'), s]);
    if (!u.roles.includes('seller')) DB.set('users', DB.get('users').map(x => x.id === u.id ? { ...x, roles:[...x.roles, 'seller'] } : x)); return s;
  }
};
const productService = {
  saveListing(p) { // upsert; owner-checked. Returns false when storage is full (nothing is partially saved).
    const u = getCurrentUser(); if (!u || p.ownerUserId !== u.id) throw new Error('Ruxsat yo‘q');
    if (p.source === 'user' && p.status !== LISTING.DRAFT) { // hard business rule, also enforced here (not only in the UI)
      const im = Array.isArray(p.images) ? p.images : [], mx = p.group === 'feed' ? 15 : 15;
      if (im.length < 5 || im.length > mx || !im.every(i => typeof (i.dataUrl || i.url) === 'string' && /^(data:image\/|https?:)/.test(i.dataUrl || i.url))) throw new Error('E‘lonni joylash uchun kamida 5 ta haqiqiy rasm yuklash kerak.');
    }
    const all = DB.get('products'), old = byId(all, p.id);
    if (old && old.ownerUserId !== u.id) throw new Error('Ruxsat yo‘q');
    return DB.set('products', old ? all.map(x => x.id === p.id ? p : x) : [p, ...all]);
  },
  // DEMO moderation stand-in: only the owner can flip pending/draft -> active here. Production: admin/Cloud Function.
  setStatus(id, status) {
    const u = getCurrentUser(), p = getProductById(id); if (!u || !p || p.ownerUserId !== u.id) throw new Error('Ruxsat yo‘q');
    if (status === LISTING.ACTIVE && p.source === 'user' && (p.images || []).length < 5) throw new Error('E‘lonni joylash uchun kamida 5 ta haqiqiy rasm yuklash kerak.');
    DB.set('products', DB.get('products').map(x => x.id === id ? { ...x, status, updatedAt:new Date().toISOString() } : x));
    if (status === LISTING.ACTIVE) { notificationService.push(u.id, NOTIF.TX, 'E‘lon tasdiqlandi', p.title, id); savedSearchService.notifyMatches({ ...p, status }); }
  },
  track(id, field) { // field: 'views' | 'phoneClicks'
    DB.set('products', DB.get('products').map(x => x.id === id ? { ...x, [field]:(x[field] || 0) + 1 } : x));
  },
  view(id) { // unique per browser session: refreshes do not inflate the counter
    let seen = []; try { seen = JSON.parse(sessionStorage.getItem('fm_viewed') || '[]'); } catch (e) { seen = []; }
    if (seen.includes(id)) return; seen.push(id); try { sessionStorage.setItem('fm_viewed', JSON.stringify(seen)); } catch (e) {}
    this.track(id, 'views');
  },
  search(q, o) {
    const sellers = DB.get('sellers'), nq = norm(q);
    let list = DB.get('products').filter(p => p.status === LISTING.ACTIVE);
    if (nq) list = list.filter(p => { const s = byId(sellers, p.sellerId); return [p.title, p.animalType, p.breed, CATEGORIES[p.category], s && s.name, p.region, p.district].some(v => norm(v).includes(nq)); });
    if (o.category) list = list.filter(p => p.category === o.category);
    if (o.region) list = list.filter(p => p.region === o.region);
    if (o.minPrice) list = list.filter(p => p.price >= o.minPrice); if (o.maxPrice) list = list.filter(p => p.price <= o.maxPrice);
    if (o.gender) list = list.filter(p => p.gender === o.gender);
    if (o.verified) list = list.filter(p => (byId(sellers, p.sellerId) || {}).isVerified);
    if (o.negotiable) list = list.filter(p => p.negotiable);
    if (o.minRating) list = list.filter(p => { const st = reviewService.stats(p.sellerId); return st.count && st.avg >= o.minRating; });
    if (o.scope === 'feed') list = list.filter(p => FEED_CATS.includes(p.category)); else if (o.scope === 'livestock') list = list.filter(p => !FEED_CATS.includes(p.category));
    const sorts = { newest:(a, b) => b.createdAt.localeCompare(a.createdAt), oldest:(a, b) => a.createdAt.localeCompare(b.createdAt), priceAsc:(a, b) => a.price - b.price, priceDesc:(a, b) => b.price - a.price,
      rated:(a, b) => reviewService.stats(b.sellerId).avg - reviewService.stats(a.sellerId).avg, viewed:(a, b) => (b.views || 0) - (a.views || 0) };
    return list.sort(sorts[o.sort] || sorts.newest);
  }
};

const transactionService = {
  sendOffer(productId, amount, message) {
    const u = getCurrentUser(); if (!u) throw new Error('Avval tizimga kiring');
    const p = getProductById(productId); if (!p || p.status !== LISTING.ACTIVE) throw new Error('E‘lon mavjud emas');
    const amt = Number(amount); if (!(amt > 0)) throw new Error('Narx noto‘g‘ri');
    const seller = getSellerById(p.sellerId); if (seller.ownerUserId === u.id) throw new Error('O‘z e‘loningizga taklif bera olmaysiz');
    if (DB.get('transactions').some(t => t.buyerId === u.id && t.productId === productId && [TX.PENDING, TX.ACCEPTED, TX.CONFIRMED, TX.PREPARING, TX.SHIPPING, TX.DELIVERED].includes(t.status))) throw new Error('Bu e‘lon uchun faol taklifingiz bor');
    const now = new Date().toISOString(), tid = generateId('t');
    DB.set('transactions', [...DB.get('transactions'), { id:tid, productId, buyerId:u.id, sellerId:p.sellerId, amount:amt, status:TX.PENDING, reviewed:false, history:[{ status:TX.PENDING, at:now }], createdAt:now, updatedAt:now }]);
    DB.set('offers', [...DB.get('offers'), { id:generateId('o'), transactionId:tid, productId, buyerId:u.id, sellerId:p.sellerId, amount:amt, message:(message || '').trim(), status:OFFER.PENDING, createdAt:now, updatedAt:now }]);
    notificationService.push(seller.ownerUserId, NOTIF.OFFER, 'Yangi taklif', formatPrice(amt) + ' — ' + p.title, tid);
    telegramService.notify(['🆕 Yangi taklif (FarMarket)', 'Mahsulot: ' + p.title, 'Narx: ' + formatPrice(p.price) + ' → Taklif: ' + formatPrice(amt), 'Xaridor: ' + u.firstName + ' ' + u.lastName + ' · ' + u.phone + ' · ' + u.region,
      'Sotuvchi: ' + seller.name + ' · ' + seller.phone, message && message.trim() ? 'Xabar: ' + message.trim().slice(0, 300) : '', 'ID: ' + tid].filter(Boolean).join('\n'));
    return tid;
  },
  // Single guarded state machine: actor role is derived from the CURRENT user, never from the caller.
  advance(txId, next) {
    const u = getCurrentUser(), all = DB.get('transactions'), t = byId(all, txId);
    if (!u || !t) throw new Error('Tranzaksiya topilmadi');
    const seller = getSellerById(t.sellerId), role = t.buyerId === u.id ? 'buyer' : seller && seller.ownerUserId === u.id ? 'seller' : null;
    if (!role) throw new Error('Ruxsat yo‘q');
    if ((TX_FLOW[t.status] || {})[next] !== role) throw new Error('Bu amalni bajarib bo‘lmaydi');
    if (t.counter && next === TX.ACCEPTED) throw new Error('Qarshi taklif xaridor javobini kutmoqda');
    const now = new Date().toISOString();
    DB.set('transactions', all.map(x => x.id === txId ? { ...x, status:next, updatedAt:now, history:[...(x.history || []), { status:next, at:now }] } : x));
    const offerSt = next === TX.REJECTED ? OFFER.REJECTED : next === TX.CANCELLED ? OFFER.CANCELLED : next === TX.ACCEPTED ? OFFER.ACCEPTED : null;
    if (offerSt) DB.set('offers', DB.get('offers').map(o => o.transactionId === txId ? { ...o, status:offerSt, updatedAt:now } : o));
    const p = getProductById(t.productId);
    if (p && next === TX.CONFIRMED) DB.set('products', DB.get('products').map(x => x.id === p.id ? { ...x, status:LISTING.RESERVED } : x));
    if (p && next === TX.COMPLETED) DB.set('products', DB.get('products').map(x => x.id === p.id ? { ...x, status:LISTING.SOLD } : x));
    if (p && next === TX.CONFIRMED) notifyWishers(p.id, 'band qilindi', t.buyerId);
    if (p && next === TX.COMPLETED) notifyWishers(p.id, 'sotildi', t.buyerId);
    if (p && [TX.CANCELLED, TX.REJECTED].includes(next) && p.status === LISTING.RESERVED) DB.set('products', DB.get('products').map(x => x.id === p.id ? { ...x, status:LISTING.ACTIVE } : x));
    const target = role === 'buyer' ? seller.ownerUserId : t.buyerId;
    notificationService.push(target, next === TX.COMPLETED ? NOTIF.TX : NOTIF.TX, 'Tranzaksiya: ' + TX_LABEL[next], (p ? p.title : ''), txId);
    telegramService.notify('🔄 Tranzaksiya: ' + TX_LABEL[next] + '\n' + (p ? p.title : '') + ' · ' + formatPrice(t.amount) + '\nAmalni bajardi: ' + (role === 'buyer' ? 'xaridor' : 'sotuvchi') + '\nID: ' + txId);
    if (next === TX.COMPLETED) notificationService.push(t.buyerId, NOTIF.REVIEW, 'Sharh qoldirish mumkin', (p ? p.title : ''), txId);
  },
  counter(txId, amount) {
    const u = getCurrentUser(), t = getTransactionById(txId), s = t && getSellerById(t.sellerId), amt = Number(amount);
    if (!u || !s || s.ownerUserId !== u.id) throw new Error('Ruxsat yo‘q');
    if (t.status !== TX.PENDING || t.counter) throw new Error('Qarshi taklif berib bo‘lmaydi');
    if (!(amt > 0)) throw new Error('Narx noto‘g‘ri');
    const now = new Date().toISOString();
    DB.set('transactions', DB.get('transactions').map(x => x.id === txId ? { ...x, counter:{ amount:amt, at:now }, updatedAt:now } : x));
    DB.set('offers', DB.get('offers').map(o => o.transactionId === txId ? { ...o, status:OFFER.COUNTERED, updatedAt:now } : o));
    notificationService.push(t.buyerId, NOTIF.OFFER, 'Qarshi taklif', formatPrice(amt) + ' — ' + ((getProductById(t.productId) || {}).title || ''), txId);
  },
  respondCounter(txId, accept) {
    const u = getCurrentUser(), t = getTransactionById(txId);
    if (!u || !t || t.buyerId !== u.id) throw new Error('Ruxsat yo‘q');
    if (t.status !== TX.PENDING || !t.counter) throw new Error('Qarshi taklif yo‘q');
    const now = new Date().toISOString(), st = accept ? TX.ACCEPTED : TX.CANCELLED, amt = t.counter.amount, s = getSellerById(t.sellerId);
    DB.set('transactions', DB.get('transactions').map(x => x.id === txId ? { ...x, status:st, amount:accept ? amt : x.amount, counter:null, updatedAt:now, history:[...(x.history || []), { status:st, at:now }] } : x));
    DB.set('offers', DB.get('offers').map(o => o.transactionId === txId ? { ...o, status:accept ? OFFER.ACCEPTED : OFFER.CANCELLED, amount:accept ? amt : o.amount, updatedAt:now } : o));
    notificationService.push(s.ownerUserId, NOTIF.OFFER, accept ? 'Qarshi taklif qabul qilindi' : 'Qarshi taklif rad etildi', formatPrice(amt), txId);
  },
  forBuyer: uid => DB.get('transactions').filter(t => t.buyerId === uid).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  forSeller: sid => DB.get('transactions').filter(t => t.sellerId === sid).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
};

const reviewService = {
  forSeller: sid => DB.get('reviews').filter(r => r.sellerId === sid),
  canReview(txId) { // every check is recomputed from stored data
    const u = getCurrentUser(), t = getTransactionById(txId);
    return !!(u && t && t.buyerId === u.id && t.status === TX.COMPLETED && !t.reviewed && !DB.get('reviews').some(r => r.transactionId === txId) && getProductById(t.productId) && getProductById(t.productId).sellerId === t.sellerId);
  },
  create(txId, f) {
    if (!this.canReview(txId)) throw new Error('Sharh qoldirish uchun ruxsat yo‘q');
    const u = getCurrentUser(), t = getTransactionById(txId), n = v => Math.min(5, Math.max(1, Number(v) || 0));
    if (!(Number(f.rating) >= 1 && Number(f.rating) <= 5)) throw new Error('Umumiy bahoni tanlang');
    if (f.comment.trim().length < 5) throw new Error('Izoh juda qisqa');
    const now = new Date().toISOString();
    const r = { id:generateId('r'), transactionId:txId, productId:t.productId, sellerId:t.sellerId, buyerId:u.id, buyerName:u.firstName + ' ' + u.lastName[0] + '.', buyerAvatar:'', rating:n(f.rating), reliability:n(f.reliability || f.rating), productAccuracy:n(f.productAccuracy || f.rating), communication:n(f.communication || f.rating), delivery:n(f.delivery || f.rating),
      comment:f.comment.trim().slice(0, 1000), photos:[], verifiedPurchase:true /* set only after canReview() passed */, helpfulCount:0, helpfulUsers:[], sellerResponse:null, reportCount:0, createdAt:now, updatedAt:now };
    DB.set('reviews', [r, ...DB.get('reviews')]);
    DB.set('transactions', DB.get('transactions').map(x => x.id === txId ? { ...x, reviewed:true } : x));
    const s = getSellerById(t.sellerId); notificationService.push(s.ownerUserId, NOTIF.REVIEW, 'Yangi sharh', r.rating + '★ — ' + r.comment.slice(0, 60), r.id);
  },
  helpful(rid) {
    const u = getCurrentUser(); if (!u) throw new Error('Avval tizimga kiring');
    const all = DB.get('reviews'), r = byId(all, rid); if (!r) throw new Error('Sharh topilmadi');
    if (r.buyerId === u.id) throw new Error('O‘z sharhingizga ovoz bera olmaysiz');
    if (r.helpfulUsers.includes(u.id)) throw new Error('Siz allaqachon ovoz bergansiz');
    DB.set('reviews', all.map(x => x.id === rid ? { ...x, helpfulUsers:[...x.helpfulUsers, u.id], helpfulCount:x.helpfulUsers.length + 1 } : x));
  },
  report(rid, reason, details) {
    const u = getCurrentUser(); if (!u) throw new Error('Avval tizimga kiring'); if (!reason) throw new Error('Sababni tanlang');
    const reps = safeLoad(KEYS.reports, []); if (reps.some(x => x.reviewId === rid && x.reporterId === u.id)) throw new Error('Siz allaqachon shikoyat qilgansiz');
    DB.set('reports', [...reps, { id:generateId('rep'), reviewId:rid, reporterId:u.id, reason, details:(details || '').trim(), status:'pending', createdAt:new Date().toISOString() }]);
    DB.set('reviews', DB.get('reviews').map(x => x.id === rid ? { ...x, reportCount:(x.reportCount || 0) + 1 } : x));
  },
  respond(rid, text) {
    const u = getCurrentUser(), r = byId(DB.get('reviews'), rid), s = r && getSellerById(r.sellerId);
    if (!u || !s || s.ownerUserId !== u.id) throw new Error('Faqat sotuvchi javob bera oladi');
    if (text.trim().length < 2) throw new Error('Javob bo‘sh');
    const now = new Date().toISOString();
    DB.set('reviews', DB.get('reviews').map(x => x.id === rid ? { ...x, sellerResponse:{ text:text.trim().slice(0, 800), sellerId:s.id, createdAt:(x.sellerResponse && x.sellerResponse.createdAt) || now, updatedAt:now } } : x));
    notificationService.push(r.buyerId, NOTIF.RESPONSE, 'Sotuvchi javob berdi', text.trim().slice(0, 60), rid);
  },
  stats(sid) {
    const rs = this.forSeller(sid), c = rs.length, avg = k => c ? rs.reduce((a, r) => a + (r[k] || 0), 0) / c : 0;
    const dist = [5, 4, 3, 2, 1].map(n => ({ n, c:rs.filter(r => r.rating === n).length }));
    return { count:c, avg:avg('rating'), reliability:avg('reliability'), productAccuracy:avg('productAccuracy'), communication:avg('communication'), delivery:avg('delivery'), dist, recommend:c ? Math.round(rs.filter(r => r.rating >= 4).length / c * 100) : 0 };
  }
};

// Transparent Trust Score (0–100). No history => score stays low.
function trustScore(sid) {
  const s = getSellerById(sid); if (!s) return { score:0, parts:[] };
  const tx = DB.get('transactions').filter(t => t.sellerId === sid), done = tx.filter(t => t.status === TX.COMPLETED).length;
  const decided = tx.filter(t => ![TX.PENDING].includes(t.status)).length, st = reviewService.stats(sid);
  const reports = DB.get('reviews').filter(r => r.sellerId === sid).reduce((a, r) => a + (r.reportCount || 0), 0);
  const parts = [
    { label:'Tasdiqlangan sotuvchi', pts:s.isVerified ? 20 : 0, max:20 },
    { label:'Yakunlangan savdolar (har biri 5, max 25)', pts:Math.min(25, done * 5), max:25 },
    { label:'O‘rtacha baho (baho/5 × 30, sharh bo‘lsa)', pts:st.count ? Math.round(st.avg / 5 * 30) : 0, max:30 },
    { label:'Kelishuvni yakunlash ulushi (× 15)', pts:decided ? Math.round(done / decided * 15) : 0, max:15 },
    { label:'Shikoyatlar jarimasi (har biri −3)', pts:-Math.min(10, reports * 3), max:0 }
  ];
  return { score:Math.max(0, Math.min(100, parts.reduce((a, p) => a + p.pts, 0))), parts, done };
}
function sellerBadges(sid) {
  const s = getSellerById(sid), st = reviewService.stats(sid), ts = trustScore(sid), b = [];
  if (s && s.isVerified) b.push('Tasdiqlangan sotuvchi'); if (st.count >= 2 && st.avg >= 4.5) b.push('Yuqori baholangan');
  if (ts.done >= 3) b.push('Top sotuvchi'); if (st.count >= 2 && st.delivery >= 4.5) b.push('Ishonchli yetkazib berish'); return b;
}
