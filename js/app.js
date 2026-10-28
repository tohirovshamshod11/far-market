'use strict';
const state = { route:'home', param:null, q:'', cat:'', f:{}, map:null, revFilter:'all', revSort:'new' };
const ICON = { cattle:'🐄', sheep:'🐑', goat:'🐐', horse:'🐴', camel:'🐪', poultry:'🐔', other:'🐾', feed:'🌾', hay:'🌿', agri:'🥕' };
const need = () => { const u = getCurrentUser(); if (!u) { openAuth(); return null; } return u; };
const val = id => { const e = $(id); return e ? (e.type === 'checkbox' ? e.checked : e.value) : ''; };
const opts = (obj, sel) => Object.entries(obj).map(([k, v]) => `<option value="${escapeHTML(k)}" ${k === sel ? 'selected' : ''}>${escapeHTML(v)}</option>`).join('');
const regionOpts = sel => '<option value="">Viloyat</option>' + REGIONS.map(r => `<option ${r === sel ? 'selected' : ''}>${escapeHTML(r)}</option>`).join('');
const fld = (id, label, type = 'text', extra = '') => `<div class="min-w-0"><label class="lbl" for="${id}">${label}</label><input class="input" id="${id}" type="${type}" ${extra}><div class="err" id="e_${id}" role="alert"></div></div>`;
function showErrs(fields, prefix) { Object.entries(fields || {}).forEach(([k, m]) => { const e = $('e_' + prefix + k); if (e) e.textContent = m; }); }
const clearErrs = () => document.querySelectorAll('#modal-content .err').forEach(e => e.textContent = '');

// ---------- Router ----------
function go(route, param) {
  if (!ROUTES[route]) route = 'home';
  if (route === 'sell' && !getCurrentUser()) { state.afterLogin = 'sell'; openModal(`<h2 class="font-extrabold text-lg">Kirish yoki ro‘yxatdan o‘tish kerak.</h2><p class="text-sm my-2">E‘lon joylash uchun hisobingizga kiring.</p><div class="flex gap-2"><button class="btn btn-primary" data-act="authTab" data-id="login">Kirish</button><button class="btn btn-ghost" data-act="authTab" data-id="reg">Ro‘yxatdan o‘tish</button></div>`); return; }
  if (['purchases','wishlist','sellerDashboard','notifications'].includes(route) && !getCurrentUser()) { openAuth(); return; }
  state.route = route; state.param = param || null;
  document.querySelectorAll('.route-view').forEach(v => v.classList.remove('active'));
  const v = $('view-' + route); if (v) v.classList.add('active');
  history.replaceState(null, '', '#' + route + (param ? '/' + param : ''));
  renderNav(); render(); window.scrollTo(0, 0);
}
function render() {
  const r = { home:renderHome, sell:renderSell, marketplace:() => renderMarket('view-marketplace', 'livestock'), feed:() => renderMarket('view-feed', 'feed'), sellerProfile:renderSellerProfile, sellerDashboard:renderDashboard, purchases:renderPurchases,
    wishlist:renderWishlist, veterinary:renderVet, community:renderCommunity, transport:renderTransport, notifications:renderNotifs, map:renderMap }[state.route];
  try { r && r(); } catch (e) { console.error(e); showToast('Sahifani ko‘rsatishda xatolik', 'error'); }
  renderHeader();
}
function renderNav() {
  const h = NAV_ROUTES.map(r => `<button class="nav-link ${state.route === r ? 'on' : ''}" data-route="${r}">${ROUTES[r]}</button>`).join('');
  $('nav-main').innerHTML = h; $('nav-mobile').innerHTML = h;
  const bn = [['home', '🏠', 'Bosh'], ['marketplace', '🔍', 'Bozor'], ['sell', '＋', 'Sotish'], ['notifications', '🔔', 'Xabar'], ['profile', '👤', 'Profil']];
  $('bottom-nav').innerHTML = bn.map(([k, i, l]) => `<button ${ROUTES[k] && k !== 'sell' ? `data-route="${k}"` : `data-act="${k === 'sell' ? 'newListing' : 'profile'}"`} class="flex-1 py-2 text-[11px] font-bold ${state.route === k ? 'text-[color:var(--fm-green-dark)]' : 'text-[color:var(--fm-muted)]'}"><div class="text-lg leading-none">${i}</div>${l}</button>`).join('');
}
function renderHeader() {
  const u = getCurrentUser(); $('auth-out').classList.toggle('hidden', !!u); $('auth-in').classList.toggle('hidden', !u); $('auth-in').classList.toggle('flex', !!u);
  if (u) { $('user-name').textContent = u.firstName; $('wishlist-badge').textContent = wishlistService.ids(u.id).length; $('notif-badge').textContent = notificationService.unread(u.id); }
}

// ---------- Marketplace / Feed ----------
const card = p => {
  const s = getSellerById(p.sellerId) || {}, st = reviewService.stats(p.sellerId), u = getCurrentUser(), fav = u && wishlistService.ids(u.id).includes(p.id);
  return `<article class="card overflow-hidden flex flex-col">${imgBlock(p)}
  <div class="p-3 flex-1 flex flex-col gap-1"><div class="flex justify-between gap-2"><h3 class="font-extrabold text-sm">${escapeHTML(p.title)}</h3>
  <button class="btn btn-ghost !p-1.5" data-act="wish" data-id="${p.id}" aria-label="Saralash">${fav ? '♥' : '♡'}</button></div>
  <p class="text-lg font-extrabold" style="color:var(--fm-green-dark)">${formatPrice(p.price)}<span class="text-xs font-bold">${escapeHTML(priceSuffix(p))}</span></p>
  <div class="flex flex-wrap gap-1">${p.source !== 'user' ? '<span class="badge g">DEMO</span>' : ''}${p.negotiable ? '<span class="badge y">Kelishiladi</span>' : ''}${s.isVerified ? '<span class="badge">✓ Tasdiqlangan</span>' : ''}${p.status !== LISTING.ACTIVE ? `<span class="badge g">${escapeHTML(p.status)}</span>` : ''}</div>
  <p class="text-xs" style="color:var(--fm-muted)">${escapeHTML(p.location)} · <a href="#" class="underline" data-act="seller" data-id="${escapeHTML(p.sellerId)}">${escapeHTML(s.name || '—')}</a></p>
  <p class="text-xs">${st.count ? stars(st.avg) + ' ' + st.avg.toFixed(1) + ' (' + st.count + ')' : 'Sharhlar yo‘q'}</p>
  <button class="btn btn-primary mt-auto" data-act="product" data-id="${p.id}">Batafsil</button></div></article>`;
};
function renderMarket(viewId, scope) {
  const el = $(viewId), cats = scope === 'feed' ? FEED_CATS : Object.keys(CATEGORIES).filter(c => !FEED_CATS.includes(c));
  const f = state.f; const keep = document.activeElement && document.activeElement.id;
  const list = productService.search(state.q, { ...f, category:state.cat, scope });
  el.innerHTML = `<div class="flex flex-wrap items-end justify-between gap-3 mb-4"><div><h1 class="text-2xl font-extrabold">${scope === 'feed' ? 'Yem-xashak bozori' : 'Chorva bozori'}</h1><p class="text-xs" style="color:var(--fm-muted)">Bozorga bormang, bozor sizga kelsin.</p></div>
  <button class="btn btn-accent" data-act="newListing">+ E'lon berish</button></div>
  <div class="card p-3 mb-4 grid grid-cols-2 md:grid-cols-6 gap-2">
   <input id="q" class="input col-span-2" placeholder="Qidiruv: nom, zot, viloyat, sotuvchi" value="${escapeHTML(state.q)}" aria-label="Qidiruv">
   <select id="fl_region" class="input" aria-label="Viloyat">${regionOpts(f.region)}</select>
   <select id="fl_sort" class="input" aria-label="Saralash">${opts({ newest:'Yangi', oldest:'Eski', priceAsc:'Narx ↑', priceDesc:'Narx ↓', rated:'Reyting', viewed:'Ko‘p ko‘rilgan' }, f.sort)}</select>
   <input id="fl_min" class="input" type="number" min="0" placeholder="Narx dan" value="${f.minPrice || ''}"><input id="fl_max" class="input" type="number" min="0" placeholder="Narx gacha" value="${f.maxPrice || ''}">
   <select id="fl_gender" class="input" aria-label="Jins"><option value="">Jins</option>${['Erkak', 'Urg‘ochi'].map(g => `<option ${f.gender === g ? 'selected' : ''}>${g}</option>`).join('')}</select>
   <select id="fl_rating" class="input" aria-label="Reyting"><option value="">Reyting</option>${[3, 4, 4.5].map(r => `<option value="${r}" ${f.minRating == r ? 'selected' : ''}>${r}+ ★</option>`).join('')}</select>
   <label class="text-xs font-bold flex items-center gap-1"><input type="checkbox" id="fl_ver" ${f.verified ? 'checked' : ''}> Tasdiqlangan</label>
   <label class="text-xs font-bold flex items-center gap-1"><input type="checkbox" id="fl_neg" ${f.negotiable ? 'checked' : ''}> Kelishiladi</label></div>
  <div class="flex gap-2 overflow-x-auto pb-3"><button class="chip ${state.cat ? '' : 'on'}" data-act="cat" data-id="">Barchasi</button>${cats.map(c => `<button class="chip ${state.cat === c ? 'on' : ''}" data-act="cat" data-id="${c}">${ICON[c]} ${CATEGORIES[c]}</button>`).join('')}</div>
  <div class="flex flex-wrap items-center justify-between gap-2 mb-3"><p class="text-sm font-bold">${list.length} ta mos e‘lon</p><button class="btn btn-ghost" data-act="saveSearch" data-id="${scope}">🔔 Qidiruvni saqlash</button></div>
  ${list.length ? `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">${list.map(card).join('')}</div>` : emptyState('🔍', 'E‘lonlar topilmadi', 'Qidiruv yoki filtrlarni o‘zgartirib ko‘ring')}`;
  if (keep === 'q') { const q = $('q'); q.focus(); q.setSelectionRange(q.value.length, q.value.length); }
}
function readFilters() {
  state.q = val('q'); state.f = { region:val('fl_region'), sort:val('fl_sort'), minPrice:Number(val('fl_min')) || 0, maxPrice:Number(val('fl_max')) || 0, gender:val('fl_gender'), minRating:Number(val('fl_rating')) || 0, verified:val('fl_ver'), negotiable:val('fl_neg') };
  render();
}

// ---------- Product detail & offer ----------
function openProduct(id) {
  const p = getProductById(id); if (!p) return showToast('E‘lon topilmadi', 'error');
  productService.view(id);
  const s = getSellerById(p.sellerId) || {}, st = reviewService.stats(p.sellerId);
  const sim = DB.get('products').filter(x => x.category === p.category && x.id !== p.id && x.status === LISTING.ACTIVE).slice(0, 3);
  openModal(`${galleryHTML(p)}
  <h2 class="text-lg font-extrabold">${escapeHTML(p.title)}</h2><p class="text-xl font-extrabold" style="color:var(--fm-green-dark)">${formatPrice(p.price)}${escapeHTML(priceSuffix(p))} ${p.negotiable ? '<span class="badge y">Kelishiladi</span>' : ''}</p>
  ${specsHTML(p)}
  <p class="text-sm mb-3">${escapeHTML(p.description)}</p>
  <div class="card p-3 text-xs mb-3"><b>${escapeHTML(s.name)}</b> ${s.isVerified ? '<span class="badge">✓ Tasdiqlangan</span>' : ''}<br>${st.count ? stars(st.avg) + ' ' + st.avg.toFixed(1) + ' (' + st.count + ' sharh)' : 'Hali sharhlar yo‘q'}
   <button class="btn btn-ghost ml-2" data-act="seller" data-id="${escapeHTML(p.sellerId)}">Profil</button></div>
  <div class="flex gap-2 flex-wrap"><button class="btn btn-primary" data-act="offer" data-id="${p.id}">Savdolashish</button>
  <button class="btn btn-ghost" data-act="wish" data-id="${p.id}">♡ Saralash</button><button class="btn btn-ghost" data-act="phone" data-id="${p.id}">📞 Telefon raqamini ko‘rsatish</button></div>
  ${sim.length ? `<h3 class="font-bold text-sm mt-4 mb-1">O‘xshash e‘lonlar</h3>${sim.map(x => `<button class="chip mr-1 mb-1" data-act="product" data-id="${x.id}">${escapeHTML(x.title)}</button>`).join('')}` : ''}`);
}
function openOffer(pid) {
  if (!need()) return; const p = getProductById(pid); if (!p) return;
  openModal(`<h2 class="font-extrabold text-lg">Taklif yuborish</h2><p class="text-xs mb-2">${escapeHTML(p.title)} — narx: ${formatPrice(p.price)}</p>${fld('of_amt', 'Taklif narxi (so‘m)', 'number', `min="1" value="${p.price}"`)}
  <label class="lbl" for="of_msg">Xabar</label><textarea id="of_msg" class="input" rows="3" maxlength="300"></textarea><p class="text-xs mt-2" style="color:var(--fm-muted)">Taklif sotuvchi qabul qilgunga qadar yakunlanmaydi. To‘lov — DEMO.</p>
  <button class="btn btn-primary mt-3 w-full" data-act="sendOffer" data-id="${pid}">Yuborish</button>`);
}

// ---------- Seller profile ----------
function renderSellerProfile() {
  const el = $('view-sellerProfile'), s = getSellerById(state.param);
  if (!s) { el.innerHTML = emptyState('🧑‍🌾', 'Sotuvchi topilmadi'); return; }
  const st = reviewService.stats(s.id), ts = trustScore(s.id), badges = sellerBadges(s.id), u = getCurrentUser(), isOwner = u && u.id === s.ownerUserId;
  const listings = DB.get('products').filter(p => p.sellerId === s.id && p.status === LISTING.ACTIVE);
  let rs = reviewService.forSeller(s.id);
  if (state.revFilter === 'ver') rs = rs.filter(r => r.verifiedPurchase); else if (state.revFilter === 'photo') rs = rs.filter(r => r.photos && r.photos.length); else if (/^\d$/.test(state.revFilter)) rs = rs.filter(r => r.rating === Number(state.revFilter));
  rs = [...rs].sort({ new:(a, b) => b.createdAt.localeCompare(a.createdAt), hi:(a, b) => b.rating - a.rating, lo:(a, b) => a.rating - b.rating, help:(a, b) => b.helpfulCount - a.helpfulCount }[state.revSort]);
  el.innerHTML = `<div class="card p-5 mb-4"><div class="flex flex-wrap gap-4 items-center"><div class="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-extrabold text-white" style="background:var(--fm-green)">${escapeHTML((s.name || '?')[0])}</div>
  <div class="flex-1"><h1 class="text-xl font-extrabold">${escapeHTML(s.name)} ${s.isVerified ? '<span class="badge">✓ Tasdiqlangan sotuvchi</span>' : ''}</h1>
  <p class="text-xs" style="color:var(--fm-muted)">${escapeHTML(s.location)} · ${escapeHTML(s.phone)} · A'zo: ${formatDate(s.createdAt)}</p><p class="text-sm mt-1">${escapeHTML(s.description || '—')}</p>
  <div class="mt-2 flex flex-wrap gap-1">${badges.map(b => `<span class="badge y">${escapeHTML(b)}</span>`).join('')}</div></div>
  <div class="text-center"><div class="text-3xl font-extrabold" style="color:var(--fm-green-dark)">${ts.score}</div><div class="text-xs">Trust Score</div><button class="text-xs underline" data-act="trustInfo" data-id="${s.id}">Qanday hisoblanadi?</button></div></div></div>
  <div class="grid md:grid-cols-3 gap-4 mb-4"><div class="card p-4 text-sm"><div class="text-3xl font-extrabold">${st.count ? st.avg.toFixed(1) : '—'}</div>${st.count ? stars(st.avg) + ` <span class="text-xs">${st.count} sharh · ${st.recommend}% tavsiya</span>` : '<p class="text-xs">Hali sharhlar yo‘q</p>'}
  ${st.dist.map(d => `<div class="flex items-center gap-1 text-xs"><span>${d.n}★</span><div class="flex-1 h-2 rounded" style="background:#eef1ee"><div class="h-2 rounded" style="width:${st.count ? d.c / st.count * 100 : 0}%;background:var(--fm-yellow)"></div></div><span>${d.c}</span></div>`).join('')}</div>
  <div class="card p-4 text-xs md:col-span-2"><b>Kategoriya bo‘yicha</b><div class="grid grid-cols-2 gap-1 mt-1">${[['Ishonchlilik', st.reliability], ['Mahsulot aniqligi', st.productAccuracy], ['Muloqot', st.communication], ['Yetkazish', st.delivery]].map(([k, v]) => `<div>${k}: <b>${st.count ? v.toFixed(1) : '—'}</b></div>`).join('')}<div>Yakunlangan savdolar: <b>${ts.done}</b></div><div>Faol e‘lonlar: <b>${listings.length}</b></div></div></div></div>
  <h2 class="font-extrabold mb-2">E‘lonlar</h2>${listings.length ? `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">${listings.map(card).join('')}</div>` : emptyState('📦', 'Faol e‘lonlar yo‘q')}
  <h2 class="font-extrabold mb-2">Sharhlar</h2><div class="flex flex-wrap gap-1 mb-2">${[['all', 'Barchasi'], ['ver', 'Tasdiqlangan xarid'], ['photo', 'Rasmli'], ['5', '5★'], ['4', '4★'], ['3', '3★'], ['2', '2★'], ['1', '1★']].map(([k, l]) => `<button class="chip ${state.revFilter === k ? 'on' : ''}" data-act="revFilter" data-id="${k}">${l}</button>`).join('')}
  <select id="rev-sort" class="input !w-auto" aria-label="Saralash">${opts({ new:'Yangi', hi:'Eng yuqori', lo:'Eng past', help:'Foydali' }, state.revSort)}</select></div>
  ${rs.length ? rs.map(r => reviewHTML(r, isOwner)).join('') : emptyState('💬', 'Sharhlar yo‘q')}`;
}
const reviewHTML = (r, isOwner) => `<div class="card p-3 mb-2 text-sm"><div class="flex justify-between"><b>${escapeHTML(r.buyerName)}</b><span class="text-xs">${formatDate(r.createdAt)}</span></div>
 ${stars(r.rating)} ${r.verifiedPurchase ? '<span class="badge">✓ Tasdiqlangan xarid</span>' : ''}<p class="mt-1">${escapeHTML(r.comment)}</p>
 ${r.sellerResponse ? `<div class="mt-2 p-2 rounded text-xs" style="background:var(--fm-green-light)"><b>Sotuvchi javobi:</b> ${escapeHTML(r.sellerResponse.text)}</div>` : ''}
 <div class="flex gap-2 mt-2"><button class="btn btn-ghost" data-act="helpful" data-id="${r.id}">👍 Foydali (${r.helpfulCount})</button><button class="btn btn-ghost" data-act="report" data-id="${r.id}">Shikoyat</button>
 ${isOwner ? `<button class="btn btn-ghost" data-act="respond" data-id="${r.id}">${r.sellerResponse ? 'Javobni tahrirlash' : 'Javob berish'}</button>` : ''}</div></div>`;

// ---------- Purchases & Dashboard ----------
const txRow = (t, role) => {
  const p = getProductById(t.productId) || { title:'(o‘chirilgan e‘lon)' }, s = getSellerById(t.sellerId) || {}, next = Object.entries(TX_FLOW[t.status] || {}).filter(([n, r]) => r === role && !(t.counter && n === 'accepted'));
  const nm = { accepted:'Qabul qilish', rejected:'Rad etish', cancelled:'Bekor qilish', confirmed:'Tasdiqlash (DEMO to‘lov)', preparing:'Tayyorlanmoqda', shipping:'Yo‘lga chiqdi', delivered:'Yetkazildi', completed:'Qabul qildim — yakunlash', disputed:'Nizo' };
  return `<div class="card p-3 text-sm"><div class="flex flex-wrap justify-between gap-2"><div><b>${escapeHTML(p.title)}</b><p class="text-xs" style="color:var(--fm-muted)">${role === 'buyer' ? 'Sotuvchi: ' + escapeHTML(s.name) : 'Xaridor: ' + escapeHTML((getUserById(t.buyerId) || {}).firstName || '—')} · ${formatPrice(t.amount)} · ${formatDate(t.createdAt)} · ID: ${escapeHTML(t.id)}</p></div>
  <span class="badge ${t.status === TX.COMPLETED ? '' : [TX.REJECTED, TX.CANCELLED].includes(t.status) ? 'r' : 'y'}">${TX_LABEL[t.status]}</span></div>
  <div class="flex flex-wrap gap-2 mt-2">${next.map(([n]) => `<button class="btn ${['rejected', 'cancelled', 'disputed'].includes(n) ? 'btn-danger' : 'btn-primary'}" data-act="tx" data-id="${t.id}" data-next="${n}">${nm[n]}</button>`).join('')}
  ${role === 'seller' && t.status === TX.PENDING && !t.counter ? `<button class="btn btn-accent" data-act="counter" data-id="${t.id}">Qarshi taklif</button>` : ''}
  ${role === 'seller' && t.counter ? `<span class="badge y">Qarshi taklif: ${formatPrice(t.counter.amount)} (javob kutilmoqda)</span>` : ''}
  ${role === 'buyer' && t.counter ? `<span class="badge y">Qarshi taklif: ${formatPrice(t.counter.amount)}</span><button class="btn btn-primary" data-act="counterYes" data-id="${t.id}">Qabul qilish</button><button class="btn btn-danger" data-act="counterNo" data-id="${t.id}">Rad etish</button>` : ''}
  ${role === 'buyer' && t.status === TX.COMPLETED ? (reviewService.canReview(t.id) ? `<button class="btn btn-accent" data-act="review" data-id="${t.id}">★ Sharh qoldirish</button>` : '<span class="badge g">Sharh qoldirilgan</span>') : ''}</div></div>`;
};
function renderPurchases() { const u = getCurrentUser(), l = transactionService.forBuyer(u.id);
  $('view-purchases').innerHTML = `<h1 class="text-xl font-extrabold mb-3">Xaridlarim</h1>` + (l.length ? `<div class="space-y-3">${l.map(t => txRow(t, 'buyer')).join('')}</div>` : emptyState('🛍️', 'Hali xaridlar yo‘q', 'Bozordan e‘lon tanlab taklif yuboring')); }
function renderDashboard() {
  const u = getCurrentUser(), s = getCurrentSeller(), el = $('view-sellerDashboard');
  if (!s) { el.innerHTML = emptyState('🏪', 'Siz sotuvchi emassiz', 'Sotuvchi sifatida ro‘yxatdan o‘ting'); return; }
  const tx = transactionService.forSeller(s.id), st = reviewService.stats(s.id), ts = trustScore(s.id), mine = DB.get('products').filter(p => p.sellerId === s.id);
  const rev = tx.filter(t => t.status === TX.COMPLETED).reduce((a, t) => a + t.amount, 0), resp = tx.length ? Math.round(tx.filter(t => t.status !== TX.PENDING).length / tx.length * 100) : 0;
  el.innerHTML = `<div class="flex justify-between items-center mb-3"><h1 class="text-xl font-extrabold">${escapeHTML(s.name)} — kabinet</h1><button class="btn btn-accent" data-act="newListing">+ E'lon</button></div>
  <div class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">${[['E‘lonlar', mine.length], ['Takliflar', tx.filter(t => t.status === TX.PENDING).length], ['Sotuvlar', tx.filter(t => t.status === TX.COMPLETED).length], ['Daromad (demo)', formatPrice(rev)], ['Trust Score', ts.score]].map(([k, v]) => `<div class="card p-3"><div class="text-xs" style="color:var(--fm-muted)">${k}</div><div class="font-extrabold">${v}</div></div>`).join('')}</div>
  <div class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">${(() => { const ids = mine.map(p => p.id), favs = safeLoad(KEYS.wishlist, []).filter(w => ids.includes(w.productId)).length;
    return [['Ko‘rishlar', mine.reduce((a, p) => a + (p.views || 0), 0)], ['Telefon bosishlar', mine.reduce((a, p) => a + (p.phoneClicks || 0), 0)], ['Saralanganlar', favs], ['Takliflar (jami)', tx.length], ['Yakunlangan', tx.filter(t => t.status === TX.COMPLETED).length]].map(([k, v]) => `<div class="card p-3"><div class="text-xs" style="color:var(--fm-muted)">${k}</div><div class="font-extrabold">${v}</div></div>`).join(''); })()}</div>
  <p class="text-xs mb-3">Javob berish ulushi: <b>${resp}%</b> · Reyting: <b>${st.count ? st.avg.toFixed(1) : '—'}</b> (${st.count} sharh) · <button class="underline" data-act="seller" data-id="${s.id}">Ommaviy profil</button></p>
  <h2 class="font-extrabold mb-2">Takliflar va savdolar</h2>${tx.length ? `<div class="space-y-3 mb-6">${tx.map(t => txRow(t, 'seller')).join('')}</div>` : emptyState('📨', 'Takliflar yo‘q')}
  <h2 class="font-extrabold mb-2">Mening e‘lonlarim</h2>${mine.length ? mine.map(p => `<div class="card p-2 mb-1 text-sm flex flex-wrap justify-between items-center gap-2"><span>${escapeHTML(p.title)} — ${formatPrice(p.price)}${escapeHTML(priceSuffix(p))}</span><span class="flex gap-1 items-center"><span class="badge ${p.status === 'active' ? '' : p.status === 'rejected' ? 'r' : 'y'}">${escapeHTML(({ pending:'Tekshiruvda', active:'Faol', draft:'Qoralama', sold:'Sotilgan', reserved:'Band' })[p.status] || p.status)}</span>${p.source === 'user' ? `<button class="btn btn-ghost" data-act="editListing" data-id="${p.id}">${p.status === 'draft' ? 'Davom etish' : 'Tahrirlash'}</button>` : ''}${p.source === 'user' && ['pending', 'draft'].includes(p.status) && (p.images || []).length >= 5 ? `<button class="btn btn-accent" data-act="approveDemo" data-id="${p.id}" title="Admin panel hali yo‘q">DEMO: tasdiqlash</button>` : ''}</span></div>`).join('') : emptyState('📦', 'E‘lonlar yo‘q')}`;
}
function renderWishlist() { const u = getCurrentUser(), ids = wishlistService.ids(u.id), l = ids.map(getProductById).filter(Boolean);
  $('view-wishlist').innerHTML = `<div class="flex justify-between mb-3"><h1 class="text-xl font-extrabold">Saralanganlar</h1>${l.length ? '<button class="btn btn-ghost" data-act="wishClear">Tozalash</button>' : ''}</div>` + (l.length ? `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">${l.map(card).join('')}</div>` : emptyState('♡', 'Saralanganlar bo‘sh'));
  const ss = savedSearchService.list(u.id);
  $('view-wishlist').innerHTML += `<h2 class="font-extrabold mt-6 mb-2">Saqlangan qidiruvlar</h2>` + (ss.length ? ss.map(x => `<div class="card p-3 mb-2 text-sm flex justify-between items-center gap-2"><button class="underline text-left" data-act="runSaved" data-id="${x.id}">🔔 ${escapeHTML(x.label)}</button><button class="btn btn-ghost" data-act="delSaved" data-id="${x.id}">O‘chirish</button></div>`).join('') : emptyState('🔔', 'Saqlangan qidiruvlar yo‘q', 'Bozorda “Qidiruvni saqlash” tugmasini bosing')); }
function renderNotifs() { const u = getCurrentUser(), l = notificationService.forUser(u.id);
  $('view-notifications').innerHTML = `<h1 class="text-xl font-extrabold mb-3">Xabarnomalar</h1>` + (l.length ? l.map(n => `<div class="card p-3 mb-2 text-sm ${n.read ? '' : 'border-l-4'}" style="${n.read ? '' : 'border-left-color:var(--fm-yellow)'}"><b>${escapeHTML(n.title)}</b><p class="text-xs">${escapeHTML(n.message)}</p><p class="text-[11px]" style="color:var(--fm-muted)">${formatDate(n.createdAt)}</p></div>`).join('') : emptyState('🔔', 'Xabarnomalar yo‘q'));
  notificationService.markAllRead(u.id); renderHeader(); }

// ---------- Veterinary / Community / Transport / Map ----------
function renderVet() { const u = getCurrentUser(), ap = u ? DB.get('appointments').filter(a => a.userId === u.id) : [];
  $('view-veterinary').innerHTML = `<div class="flex flex-wrap justify-between gap-2 mb-4"><h1 class="text-xl font-extrabold">Veterinariya</h1><button class="btn btn-primary" data-act="apptNew" data-id="" data-home="1">Uyga vrach chaqirish</button></div>
  <div class="grid md:grid-cols-3 gap-4 mb-6">${DB.get('vets').map(v => `<div class="card p-4 text-sm"><b>${escapeHTML(v.name)}</b> ${v.verified ? '<span class="badge">✓</span>' : ''}<p class="text-xs">${escapeHTML(v.specialization)} · ${escapeHTML(v.location)}</p><p class="text-xs">★ ${v.rating} · ${v.experience} yil · ${formatPrice(v.price)}</p><p class="text-xs mb-2">${escapeHTML(v.availability)}</p>
  <div class="flex gap-2"><button class="btn btn-primary" data-act="apptNew" data-id="${v.id}">Qabulga yozilish</button><a class="btn btn-ghost" href="tel:${escapeHTML(v.phone)}">Qo‘ng‘iroq</a></div></div>`).join('')}</div>
  <h2 class="font-extrabold mb-2">Mening qabullarim</h2>${ap.length ? ap.map(a => `<div class="card p-3 mb-2 text-sm">${escapeHTML(a.home ? 'Uyga chaqiruv' : ((byId(DB.get('vets'), a.veterinarianId) || {}).name || ''))} — ${escapeHTML(a.animalType)}: ${escapeHTML(a.problem)}<br><span class="text-xs">${escapeHTML(a.date)} ${escapeHTML(a.time)} · <span class="badge y">${a.status}</span></span></div>`).join('') : emptyState('🩺', 'Qabullar yo‘q')}`; }
function renderCommunity() { const u = getCurrentUser(), ps = [...DB.get('posts')].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  $('view-community').innerHTML = `<div class="flex justify-between mb-3"><h1 class="text-xl font-extrabold">Jamiyat</h1><button class="btn btn-primary" data-act="postNew">+ Post</button></div>` + (ps.length ? ps.map(p => { const a = getUserById(p.authorId) || {}, cm = safeLoad(KEYS.comments, []).filter(c => c.postId === p.id);
    return `<article class="card p-4 mb-3 text-sm"><span class="badge">${escapeHTML(p.category)}</span><h3 class="font-extrabold mt-1">${escapeHTML(p.title)}</h3><p class="text-xs" style="color:var(--fm-muted)">${escapeHTML(a.firstName || 'Foydalanuvchi')} · ${formatDate(p.createdAt)}</p><p class="my-2">${escapeHTML(p.content)}</p>
    <div class="flex gap-2"><button class="btn btn-ghost" data-act="like" data-id="${p.id}">${u && p.likedBy.includes(u.id) ? '♥' : '♡'} ${p.likedBy.length}</button><button class="btn btn-ghost" data-act="mark" data-id="${p.id}">${u && p.bookmarkedBy.includes(u.id) ? '★' : '☆'} Saqlash</button><button class="btn btn-ghost" data-act="comment" data-id="${p.id}">💬 ${cm.length}</button></div>
    ${cm.map(c => `<p class="text-xs mt-1"><b>${escapeHTML(c.authorName)}:</b> ${escapeHTML(c.text)}</p>`).join('')}</article>`; }).join('') : emptyState('📝', 'Postlar yo‘q')); }
function renderTransport() { const u = getCurrentUser(), l = u ? DB.get('transport').filter(t => t.userId === u.id) : [];
  $('view-transport').innerHTML = `<div class="flex justify-between mb-3"><h1 class="text-xl font-extrabold">Transport</h1><button class="btn btn-primary" data-act="trNew">+ So‘rov</button></div>` + (l.length ? l.map(t => `<div class="card p-3 mb-2 text-sm">${escapeHTML(t.pickup)} → ${escapeHTML(t.destination)} · ${escapeHTML(t.animalType)} × ${t.quantity}<br><span class="text-xs">${escapeHTML(t.date)} ${escapeHTML(t.time)} · <span class="badge y">${t.status}</span></span></div>`).join('') : emptyState('🚚', 'Transport so‘rovlari yo‘q', 'Yangi so‘rov yarating')); }
function renderMap() {
  if (typeof L === 'undefined') { $('map-container').innerHTML = emptyState('🗺️', 'Xarita yuklanmadi', 'Internet aloqasini tekshiring'); return; }
  if (!state.map) { state.map = L.map('map-container').setView([40.1, 67.5], 6); L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution:'© OpenStreetMap' }).addTo(state.map); state.layer = L.layerGroup().addTo(state.map); }
  state.layer.clearLayers();
  DB.get('products').filter(p => p.lat && p.status === LISTING.ACTIVE).forEach(p => L.circleMarker([p.lat, p.lng], { color:FEED_CATS.includes(p.category) ? '#e08a10' : '#2f8f2a', radius:8 }).addTo(state.layer).bindPopup(escapeHTML(p.title) + ' — ' + formatPrice(p.price)));
  DB.get('vets').forEach(v => L.circleMarker([v.lat, v.lng], { color:'#0d4a2f', radius:8, fillOpacity:.9 }).addTo(state.layer).bindPopup('Veterinar: ' + escapeHTML(v.name)));
  setTimeout(() => state.map.invalidateSize(), 60);
}

// ---------- Auth ----------
function openAuth(tab = 'login') {
  openModal(`<div class="text-center mb-3"><img src="assets/logo.png" alt="FarMarket logo" class="h-20 mx-auto object-contain"><p class="text-xs mt-1" style="color:var(--fm-muted)">Bozorga bormang, bozor sizga kelsin.</p></div>
  <div class="flex gap-2 mb-2"><button class="chip ${tab === 'login' ? 'on' : ''}" data-act="authTab" data-id="login">Kirish</button><button class="chip ${tab === 'reg' ? 'on' : ''}" data-act="authTab" data-id="reg">Ro‘yxatdan o‘tish</button></div>
  ${tab === 'login' ? `${fld('lg_email', 'Email', 'email', 'autocomplete="username"')}${fld('lg_pw', 'Parol', 'password', 'autocomplete="current-password"')}<button class="btn btn-primary w-full mt-3" data-act="login">Kirish</button>
   <p class="text-xs mt-3" style="color:var(--fm-muted)">DEMO: aziz@demo.uz (xaridor), botir@demo.uz (sotuvchi) · parol: demo1234</p>`
  : `<div class="grid grid-cols-1 min-[420px]:grid-cols-2 gap-x-2">${fld('rg_firstName', 'Ism')}${fld('rg_lastName', 'Familiya')}${fld('rg_phone', 'Telefon', 'tel', 'placeholder="+998..."')}${fld('rg_email', 'Email', 'email')}${fld('rg_password', 'Parol', 'password')}
   <div class="min-w-0"><label class="lbl" for="rg_region">Viloyat</label><select class="input" id="rg_region">${regionOpts('')}</select><div class="err" id="e_rg_region"></div></div>${fld('rg_district', 'Tuman/Shahar')}</div>
   <p class="lbl">Rollar</p><div class="flex flex-wrap gap-2">${Object.entries(ROLES).map(([k, v]) => `<label class="text-xs font-bold"><input type="checkbox" name="role" value="${k}" ${k === 'buyer' ? 'checked' : ''}> ${v}</label>`).join('')}</div><div class="err" id="e_rg_roles"></div>
   <button class="btn btn-primary w-full mt-3" data-act="register">Ro‘yxatdan o‘tish</button>`}`);
}

// ---------- Forms ----------
function openReview(txId) {
  if (!reviewService.canReview(txId)) return showToast('Sharh qoldirish mumkin emas', 'error');
  const sel = (id, l) => `<label class="lbl" for="${id}">${l}</label><select id="${id}" class="input">${[5, 4, 3, 2, 1].map(n => `<option value="${n}">${n} ★</option>`).join('')}</select>`;
  openModal(`<h2 class="font-extrabold text-lg">Sharh qoldirish</h2>${sel('rv_rating', 'Umumiy baho')}<div class="grid grid-cols-2 gap-x-2">${sel('rv_reliability', 'Ishonchlilik')}${sel('rv_productAccuracy', 'Mahsulot aniqligi')}${sel('rv_communication', 'Muloqot')}${sel('rv_delivery', 'Yetkazish')}</div>
  <label class="lbl" for="rv_comment">Izoh</label><textarea id="rv_comment" class="input" rows="3" maxlength="1000"></textarea><div class="err" id="e_rv_comment"></div><button class="btn btn-primary w-full mt-3" data-act="saveReview" data-id="${txId}">Yuborish</button>`);
}
const simpleForm = (title, body, act, id = '') => openModal(`<h2 class="font-extrabold text-lg mb-1">${title}</h2>${body}<button class="btn btn-primary w-full mt-3" data-act="${act}" data-id="${escapeHTML(id)}">Yuborish</button>`);
const ta = (id, l, ph = '') => `<label class="lbl" for="${id}">${l}</label><textarea id="${id}" class="input" rows="3" maxlength="800" placeholder="${ph}"></textarea>`;

// ---------- Actions (single delegated handler; no inline onclick) ----------
const actions = {
  authTab:(b) => openAuth(b.dataset.id),
  async login(b) { await guard('login', b, async () => { try { await authService.login(val('lg_email'), val('lg_pw')); closeModal(); showToast('Xush kelibsiz!', 'success'); afterAuth(); } catch (e) { $('e_lg_pw').textContent = e.message; } }); },
  async register(b) { await guard('reg', b, async () => { clearErrs(); try { const roles = [...document.querySelectorAll('input[name=role]:checked')].map(x => x.value);
    const u = await authService.register({ firstName:val('rg_firstName'), lastName:val('rg_lastName'), phone:val('rg_phone'), email:val('rg_email'), password:val('rg_password'), region:val('rg_region'), district:val('rg_district'), roles });
    closeModal(); showToast('Ro‘yxatdan o‘tdingiz', 'success'); afterAuth(u.roles.includes('seller') ? 'sellerDashboard' : 'marketplace'); } catch (e) { if (e.fields) showErrs(e.fields, 'rg_'); else throw e; } }); },
  cat:(b) => { state.cat = b.dataset.id; render(); },
  product:(b) => openProduct(b.dataset.id), seller:(b) => { closeModal(); go('sellerProfile', b.dataset.id); }, offer:(b) => openOffer(b.dataset.id),
  wish:(b) => { const u = need(); if (!u) return; const on = wishlistService.toggle(u.id, b.dataset.id); showToast(on ? 'Saralanganlarga qo‘shildi' : 'Olib tashlandi'); render(); },
  wishClear:() => { wishlistService.clear(getCurrentUser().id); render(); },
  profile:openProfile,
  phone:(b) => { const p = getProductById(b.dataset.id), s = p && getSellerById(p.sellerId); if (!s) return; productService.track(p.id, 'phoneClicks'); b.outerHTML = `<a class="btn btn-primary" href="tel:${escapeHTML(s.phone)}">📞 ${escapeHTML(s.phone)}</a>`; },
  counter:(b) => { const t = getTransactionById(b.dataset.id); simpleForm('Qarshi taklif', fld('ct_amt', 'Yangi narx (so‘m)', 'number', `min="1" value="${t ? t.amount : ''}"`), 'saveCounter', b.dataset.id); },
  saveCounter:(b) => guard('ct' + b.dataset.id, b, async () => { transactionService.counter(b.dataset.id, val('ct_amt')); closeModal(); showToast('Qarshi taklif yuborildi', 'success'); render(); }),
  counterYes:(b) => guard('cy' + b.dataset.id, b, async () => { transactionService.respondCounter(b.dataset.id, true); showToast('Qabul qilindi', 'success'); render(); }),
  counterNo:(b) => guard('cn' + b.dataset.id, b, async () => { transactionService.respondCounter(b.dataset.id, false); render(); }),
  saveSearch:(b) => { const u = need(); if (!u) return; const f = state.f, scope = b.dataset.id;
    const opts2 = { scope, category:state.cat || '', region:f.region || '', minPrice:f.minPrice || 0, maxPrice:f.maxPrice || 0, gender:f.gender || '', verified:!!f.verified, negotiable:!!f.negotiable, minRating:f.minRating || 0 };
    const label = [state.q, CATEGORIES[state.cat], f.region, f.gender].filter(Boolean).join(' · ') || (scope === 'feed' ? 'Barcha yem-xashak' : 'Barcha chorva');
    try { savedSearchService.add(u.id, label, state.q, opts2); showToast('Qidiruv saqlandi', 'success'); } catch (e) { showToast(e.message, 'error'); } },
  runSaved:(b) => { const x = safeLoad(KEYS.saved, []).find(s => s.id === b.dataset.id); if (!x) return; const o = x.opts || {}; state.q = x.q || ''; state.cat = o.category || ''; state.f = { region:o.region, minPrice:o.minPrice, maxPrice:o.maxPrice, gender:o.gender, verified:o.verified, negotiable:o.negotiable, minRating:o.minRating }; go(o.scope === 'feed' ? 'feed' : 'marketplace'); },
  delSaved:(b) => { savedSearchService.remove(getCurrentUser().id, b.dataset.id); render(); },
  heroSearch:() => { state.q = val('hs_q'); state.cat = ''; state.f = { region:val('hs_region') }; go('marketplace'); },
  homeCat:(b) => { state.cat = b.dataset.id; state.q = ''; state.f = {}; go(FEED_CATS.includes(b.dataset.id) ? 'feed' : 'marketplace'); },
  sendOffer:(b) => guard('offer' + b.dataset.id, b, async () => { transactionService.sendOffer(b.dataset.id, val('of_amt'), val('of_msg')); closeModal(); showToast('Taklif yuborildi', 'success'); go('purchases'); }),
  tx:(b) => guard('tx' + b.dataset.id + b.dataset.next, b, async () => { transactionService.advance(b.dataset.id, b.dataset.next); showToast('Holat yangilandi', 'success'); render(); }),
  review:(b) => openReview(b.dataset.id),
  saveReview:(b) => guard('rev' + b.dataset.id, b, async () => { reviewService.create(b.dataset.id, { rating:val('rv_rating'), reliability:val('rv_reliability'), productAccuracy:val('rv_productAccuracy'), communication:val('rv_communication'), delivery:val('rv_delivery'), comment:val('rv_comment') }); closeModal(); showToast('Sharh qo‘shildi', 'success'); render(); }),
  helpful:(b) => { if (!need()) return; try { reviewService.helpful(b.dataset.id); render(); } catch (e) { showToast(e.message, 'error'); } },
  report:(b) => need() && simpleForm('Sharhga shikoyat', `<label class="lbl" for="rp_reason">Sabab</label><select id="rp_reason" class="input"><option value="">Tanlang</option>${['Spam', 'Haqoratli', 'Yolg‘on ma‘lumot', 'Aloqasiz', 'Firibgarlik shubhasi', 'Boshqa'].map(r => `<option>${r}</option>`).join('')}</select>${ta('rp_details', 'Tafsilot')}`, 'saveReport', b.dataset.id),
  saveReport:(b) => guard('rep' + b.dataset.id, b, async () => { reviewService.report(b.dataset.id, val('rp_reason'), val('rp_details')); closeModal(); showToast('Shikoyat qabul qilindi', 'success'); render(); }),
  respond:(b) => simpleForm('Sharhga javob', ta('rs_text', 'Javobingiz'), 'saveRespond', b.dataset.id),
  saveRespond:(b) => guard('resp' + b.dataset.id, b, async () => { reviewService.respond(b.dataset.id, val('rs_text')); closeModal(); render(); }),
  revFilter:(b) => { state.revFilter = b.dataset.id; render(); },
  trustInfo:(b) => { const t = trustScore(b.dataset.id); openModal(`<h2 class="font-extrabold text-lg">Trust Score qanday hisoblanadi?</h2><p class="text-xs mb-2">Ball faqat haqiqiy ma‘lumotlardan hisoblanadi. Tarixi yo‘q sotuvchi yuqori ball olmaydi.</p>${t.parts.map(p => `<div class="flex justify-between text-sm border-b py-1"><span>${p.label}</span><b>${p.pts}${p.max ? ' / ' + p.max : ''}</b></div>`).join('')}<p class="mt-2 font-extrabold">Jami: ${t.score} / 100</p>`); },
  apptNew:(b) => { if (!need()) return; const home = !!b.dataset.home; simpleForm(home ? 'Uyga vrach chaqirish' : 'Qabulga yozilish', `${fld('ap_animal', 'Hayvon turi')}${ta('ap_problem', 'Muammo')}<div class="err" id="e_ap_problem"></div>${home ? fld('ap_addr', 'Manzil') : ''}<div class="grid grid-cols-2 gap-x-2">${fld('ap_date', 'Sana', 'date')}${fld('ap_time', 'Vaqt', 'time')}</div>${fld('ap_phone', 'Telefon', 'tel', `value="${escapeHTML(getCurrentUser().phone)}"`)}`, 'saveAppt', (home ? 'home:' : '') + b.dataset.id); },
  saveAppt:(b) => guard('appt', b, async () => { clearErrs(); const u = getCurrentUser(), home = b.dataset.id.startsWith('home:'), fields = {};
    if (!val('ap_animal').trim()) fields.ap_animal = 'Kiriting'; if (val('ap_problem').trim().length < 3) fields.ap_problem = 'Muammoni yozing'; if (!val('ap_date') || new Date(val('ap_date')) < new Date(new Date().toDateString())) fields.ap_date = 'Sana noto‘g‘ri'; if (!val('ap_time')) fields.ap_time = 'Vaqt'; if (!validPhone(val('ap_phone'))) fields.ap_phone = 'Telefon noto‘g‘ri';
    if (Object.keys(fields).length) return showErrs(fields, '');
    const t = new Date().toISOString(); DB.set('appointments', [...DB.get('appointments'), { id:generateId('ap'), userId:u.id, veterinarianId:home ? null : b.dataset.id, home, animalType:val('ap_animal').trim(), problem:val('ap_problem').trim(), location:home ? val('ap_addr') : '', date:val('ap_date'), time:val('ap_time'), phone:val('ap_phone'), note:'', images:[], status:APPT.PENDING, createdAt:t, updatedAt:t }]);
    closeModal(); showToast('So‘rov saqlandi', 'success'); render(); }),
  postNew:() => need() && simpleForm('Yangi post', `${fld('po_title', 'Sarlavha')}<label class="lbl" for="po_cat">Kategoriya</label><select id="po_cat" class="input">${['Umumiy', 'Qoramol', 'Qo‘y va echki', 'Ot', 'Yem', 'Veterinariya', 'Dehqonchilik', 'Tajriba'].map(c => `<option>${c}</option>`).join('')}</select>${ta('po_text', 'Matn')}<div class="err" id="e_po_text"></div>`, 'savePost'),
  savePost:(b) => guard('post', b, async () => { if (val('po_title').trim().length < 3 || val('po_text').trim().length < 5) return showErrs({ po_text:'Sarlavha va matnni to‘ldiring' }, ''); const t = new Date().toISOString();
    DB.set('posts', [{ id:generateId('c'), authorId:getCurrentUser().id, title:val('po_title').trim(), content:val('po_text').trim(), category:val('po_cat'), images:[], likedBy:[], bookmarkedBy:[], createdAt:t, updatedAt:t }, ...DB.get('posts')]); closeModal(); render(); }),
  like:(b) => toggleIn(b.dataset.id, 'likedBy'), mark:(b) => toggleIn(b.dataset.id, 'bookmarkedBy'),
  comment:(b) => need() && simpleForm('Izoh', ta('cm_text', 'Izohingiz'), 'saveComment', b.dataset.id),
  saveComment:(b) => guard('cm', b, async () => { const u = getCurrentUser(); if (val('cm_text').trim().length < 2) return; DB.set('comments', [...safeLoad(KEYS.comments, []), { id:generateId('cm'), postId:b.dataset.id, authorId:u.id, authorName:u.firstName, text:val('cm_text').trim(), createdAt:new Date().toISOString() }]); closeModal(); render(); }),
  trNew:() => need() && simpleForm('Transport so‘rovi', `${fld('tr_from', 'Qayerdan')}${fld('tr_to', 'Qayerga')}<div class="grid grid-cols-2 gap-x-2">${fld('tr_animal', 'Hayvon turi')}${fld('tr_qty', 'Soni', 'number', 'min="1" value="1"')}${fld('tr_date', 'Sana', 'date')}${fld('tr_time', 'Vaqt', 'time')}</div>`, 'saveTr'),
  saveTr:(b) => guard('tr', b, async () => { if (!val('tr_from').trim() || !val('tr_to').trim() || !val('tr_animal').trim() || !val('tr_date') || !(Number(val('tr_qty')) >= 1)) return showToast('Maydonlarni to‘ldiring', 'error'); const t = new Date().toISOString();
    DB.set('transport', [...DB.get('transport'), { id:generateId('tr'), userId:getCurrentUser().id, pickup:val('tr_from').trim(), destination:val('tr_to').trim(), animalType:val('tr_animal').trim(), quantity:Number(val('tr_qty')), date:val('tr_date'), time:val('tr_time'), notes:'', status:'Requested', createdAt:t, updatedAt:t }]); closeModal(); render(); })
};
function toggleIn(id, key) { const u = need(); if (!u) return; DB.set('posts', DB.get('posts').map(p => p.id === id ? { ...p, [key]:p[key].includes(u.id) ? p[key].filter(x => x !== u.id) : [...p[key], u.id] } : p)); render(); }

function afterAuth(dflt) { const a = state.afterLogin; state.afterLogin = null; if (a) { lw = null; go(a); } else if (dflt) go(dflt); else render(); }
function openProfile() {
  const u = getCurrentUser(); if (!u) return openAuth();
  openModal(`<h2 class="font-extrabold text-lg mb-2">${escapeHTML(u.firstName)} ${escapeHTML(u.lastName)}</h2><p class="text-xs mb-3">${escapeHTML(u.email)} · ${u.roles.map(r => escapeHTML(ROLES[r] || r)).join(', ')}</p><div class="flex flex-col gap-2"><button class="btn btn-ghost" data-route="purchases">Xaridlarim</button><button class="btn btn-ghost" data-route="sellerDashboard">Sotuvchi kabineti</button><button class="btn btn-ghost" id="btn-reset-demo">Demoni tiklash</button><button class="btn btn-danger" id="btn-logout">Chiqish</button></div>`);
}
// ---------- Home ----------
function renderHome() {
  const prods = DB.get('products').filter(p => p.status === LISTING.ACTIVE), sellers = DB.get('sellers'), verified = sellers.filter(s => s.isVerified);
  const featured = prods.filter(p => (getSellerById(p.sellerId) || {}).isVerified).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4);
  const done = DB.get('transactions').filter(t => t.status === TX.COMPLETED).length, revs = DB.get('reviews').length;
  const u = getCurrentUser(), near = u ? prods.filter(p => p.region === u.region).slice(0, 4) : [];
  const grid = l => `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">${l.map(card).join('')}</div>`;
  $('view-home').innerHTML = `<section class="card p-6 md:p-10 mb-8" style="background:linear-gradient(0deg,#fff,var(--fm-green-light))"><h1 class="text-3xl md:text-5xl font-extrabold" style="color:var(--fm-green-dark)">Bozorga bormang,<br>bozor sizga kelsin.</h1>
   <p class="mt-3 max-w-xl text-sm" style="color:var(--fm-muted)">Chorva, yem-xashak va qishloq xo‘jaligi xizmatlari uchun zamonaviy raqamli marketplace.</p>
   <div class="grid md:grid-cols-4 gap-2 mt-5"><input id="hs_q" class="input md:col-span-2" placeholder="Nimani qidiryapsiz? Sigir, qo‘y, ot, yem, pichan" aria-label="Qidiruv"><select id="hs_region" class="input" aria-label="Qayerdan?">${regionOpts('')}</select><button class="btn btn-primary" data-act="heroSearch">Qidirish</button></div>
   <div class="flex flex-wrap gap-2 mt-4"><button class="btn btn-primary" data-route="marketplace">Chorva topish</button><button class="btn btn-accent" data-act="newListing">Sotish</button><button class="btn btn-ghost" data-route="veterinary">Veterinar topish</button><button class="btn btn-ghost" data-route="feed">Yem-xashak</button></div></section>
  <h2 class="font-extrabold text-lg mb-2">Mashhur kategoriyalar</h2><div class="flex flex-wrap gap-2 mb-8">${Object.entries(CATEGORIES).map(([k, v]) => `<button class="chip" data-act="homeCat" data-id="${k}">${ICON[k]} ${v}</button>`).join('')}</div>
  ${near.length ? `<h2 class="font-extrabold text-lg mb-2">Yaqiningizdagi e‘lonlar</h2><div class="mb-8">${grid(near)}</div>` : ''}
  <h2 class="font-extrabold text-lg mb-2">Tasdiqlangan sotuvchilardan</h2><div class="mb-8">${featured.length ? grid(featured) : emptyState('📦', 'E‘lonlar yo‘q')}</div>
  <h2 class="font-extrabold text-lg mb-2">Tasdiqlangan sotuvchilar</h2><div class="flex flex-wrap gap-2 mb-8">${verified.length ? verified.map(s => `<button class="chip" data-act="seller" data-id="${s.id}">✓ ${escapeHTML(s.name)}</button>`).join('') : '<p class="text-sm">Hali yo‘q</p>'}</div>
  <h2 class="font-extrabold text-lg mb-2">FarMarket qanday ishlaydi?</h2><div class="grid md:grid-cols-2 gap-3 mb-8"><div class="card p-4 text-sm"><b>Xaridor</b><p class="mt-1">Qidiruv → Filtr → E‘lon → Sotuvchi → Taklif → Kelishuv → Yetkazish → Yakunlandi → Sharh</p></div><div class="card p-4 text-sm"><b>Sotuvchi</b><p class="mt-1">Ro‘yxatdan o‘tish → E‘lon → Taklif → Qabul/Qarshi taklif → Yetkazish → Yakunlandi → Sharh</p></div></div>
  <h2 class="font-extrabold text-lg mb-2">Ishonch</h2><div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">${[['Faol e‘lonlar', prods.length], ['Tasdiqlangan sotuvchilar', verified.length], ['Yakunlangan savdolar', done], ['Haqiqiy sharhlar', revs]].map(([k, v]) => `<div class="card p-4 text-center"><div class="text-2xl font-extrabold" style="color:var(--fm-green-dark)">${v}</div><div class="text-xs" style="color:var(--fm-muted)">${k}</div></div>`).join('')}</div>
  <div class="card p-6 text-center" style="background:var(--fm-green-dark);color:#fff"><p class="font-extrabold text-lg">Chorvangizni sotmoqchimisiz?</p><button class="btn btn-accent mt-3" data-act="newListing">E‘lon berish</button></div>`;
}
// ---------- Init ----------
document.addEventListener('click', e => {
  const r = e.target.closest('[data-route]'); if (r) { e.preventDefault(); go(r.dataset.route); return; }
  const a = e.target.closest('[data-act]'); if (a) { e.preventDefault(); const fn = actions[a.dataset.act]; fn ? fn(a) : console.warn('No action', a.dataset.act); return; }
  if (e.target.id === 'modal-backdrop' || e.target.closest('#modal-close-btn')) closeModal();
  if (e.target.closest('#btn-open-login')) openAuth();
  if (e.target.closest('#btn-user')) openProfile();
  if (e.target.id === 'btn-logout') { authService.logout(); closeModal(); go('home'); showToast('Chiqdingiz'); }
  if (e.target.id === 'btn-reset-demo' && confirm('Demo ma‘lumotlar tiklansinmi? Barcha demo yozuvlar o‘chadi.')) resetDemoData().then(() => { closeModal(); go('marketplace'); showToast('Demo tiklandi', 'success'); });
});
document.addEventListener('input', e => { if (e.target.id === 'q') { clearTimeout(state.t); state.t = setTimeout(readFilters, 200); } });
document.addEventListener('change', e => { if (e.target.id === 'rev-sort') { state.revSort = e.target.value; render(); } else if (/^fl_/.test(e.target.id)) readFilters(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') { if (typeof lb !== 'undefined' && lb) closeLightbox(); else closeModal(); } else if (typeof lb !== 'undefined' && lb && e.key === 'ArrowRight') lbStep(1); else if (typeof lb !== 'undefined' && lb && e.key === 'ArrowLeft') lbStep(-1); });
window.addEventListener('error', e => console.error('Runtime:', e.message));
