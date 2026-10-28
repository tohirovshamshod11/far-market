'use strict';
// Smart listing wizard: category -> exact type -> schema fields -> price/location -> REAL photos -> preview -> publish.
let lw = null;
const LS_STEPS = ['Kategoriya', 'Ma’lumotlar', 'Narx va joylashuv', 'Rasmlar', 'Tekshirish'];
const IMG_OK = ['image/jpeg', 'image/png', 'image/webp'], IMG_MAX_BYTES = 10 * 1024 * 1024, PT = { per_animal:'bosh', per_kg:'kg', per_ton:'tonna', per_bale:'press', per_unit:'dona', fixed:'' };
const STORAGE_FULL = 'Brauzer xotirasi to‘ldi. Kichikroq rasmlardan foydalaning yoki server storage ulang.';
const freshWizard = () => ({ step:1, group:'', sub:'', details:{}, common:{ negotiable:'no', delivery:'no' }, images:[], errors:{}, editId:null, status:null, pendingSub:'', busy:false });
const photoRule = () => PHOTO_RULES[lw && lw.group] || PHOTO_RULES.feed;
const schemaOf = sub => (SUBS[sub] && SCHEMAS[SUBS[sub].schema]) || { title:'', fields:[] };
const isVisible = (f, d, sub) => !(SUBS[sub].fixed && f.k in SUBS[sub].fixed) && (!f.showIf || f.showIf(d));
const optLabel = (f, v) => { const o = f && f.opts && f.opts.find(x => x[0] === v); return o ? o[1] : v; };
const priceSuffix = p => p.priceType ? (PT[p.priceType] ? ' / ' + PT[p.priceType] : '') : (FEED_CATS.includes(p.category) ? '' : ' / bosh');
function getProductCoverImage(p) {
  const im = Array.isArray(p.images) ? p.images : [];
  if (im.length) { const c = im.find(i => i.id === p.coverImage) || im.find(i => i.isCover) || im[0]; return c.dataUrl || c.url || ''; }
  return p.image || '';
}
const sortedImages = p => [...(p.images || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
function imgBlock(p, h = 'h-32') {
  const src = getProductCoverImage(p), user = p.source === 'user';
  if (src) return `<img src="${escapeHTML(src)}" alt="${escapeHTML(p.title)}" class="${h} w-full object-cover" loading="lazy" data-fm="${user ? 'user' : 'demo'}">`;
  if (user) return `<div class="${h} flex items-center justify-center text-center text-xs p-2 badge r" style="border-radius:0">Rasm topilmadi — sotuvchi qayta yuklashi kerak</div>`;
  return `<div class="${h} flex items-center justify-center text-5xl" style="background:var(--fm-green-light)">${ICON[p.category] || '🐾'}</div>`;
}
function galleryHTML(p) {
  const im = sortedImages(p); if (!im.length) return imgBlock(p, 'h-36');
  return `<button class="block w-full mb-2" data-act="lightbox" data-id="${p.id}" data-i="0" aria-label="Rasmni kattalashtirish"><img src="${escapeHTML(im[0].dataUrl || im[0].url)}" alt="${escapeHTML(p.title)} — 1" class="w-full h-52 object-cover rounded-xl" data-fm="${p.source === 'user' ? 'user' : 'demo'}"></button>
  ${im.length > 1 ? `<div class="flex gap-1 overflow-x-auto mb-3">${im.map((x, i) => `<button data-act="lightbox" data-id="${p.id}" data-i="${i}" aria-label="Rasm ${i + 1}"><img src="${escapeHTML(x.dataUrl || x.url)}" alt="${escapeHTML(p.title)} — ${i + 1}" class="h-14 w-20 object-cover rounded-lg" data-fm="user"></button>`).join('')}</div>` : ''}`;
}
function detailRows(p) {
  const sc = schemaOf(p.subcategory), d = p.details || {};
  return sc.fields.filter(f => d[f.k] !== undefined && d[f.k] !== '').map(f => [f.label.replace(/ \(.*\)$/, ''), f.type === 'select' ? optLabel(f, d[f.k]) : f.label.match(/\((.+)\)/) ? d[f.k] + ' ' + f.label.match(/\((.+)\)/)[1] : d[f.k]]);
}
function specsHTML(p) {
  const rows = p.source === 'user' ? [['Turi', p.animalType], ...detailRows(p), ['Miqdor', p.quantity + ' ' + (p.unit || '')], ['Joy', (p.location || '') + (p.address ? ', ' + p.address : '')], ['Yetkazib berish', p.deliveryAvailable ? 'Bor' + (p.deliveryPrice ? ' — ' + formatPrice(p.deliveryPrice) : '') : 'Yo‘q']]
    : [['Kategoriya', CATEGORIES[p.category]], ['Tur', p.animalType], ['Zot', p.breed], ['Jins', p.gender], ['Yosh', p.age], ['Vazn (kg)', p.weight], ['Soni', p.quantity], ['Joy', p.location]];
  return `<dl class="grid grid-cols-2 gap-1 text-xs my-3">${rows.map(([k, v]) => `<div><dt style="color:var(--fm-muted)">${escapeHTML(k)}</dt><dd class="font-bold">${escapeHTML(v ?? '—')}</dd></div>`).join('')}</dl>`;
}
// ---------- image validation & processing ----------
async function validateImageFile(f) {
  const BAD = "Bu fayl rasm emas yoki format qo‘llab-quvvatlanmaydi.";
  if (!f || !IMG_OK.includes(f.type)) return BAD;
  if (f.size > IMG_MAX_BYTES) return 'Rasm hajmi 10 MB dan oshmasligi kerak.';
  if (f.size < 1024) return 'Fayl juda kichik';
  try { // never trust the extension / declared type: check magic bytes
    const b = new Uint8Array(await f.slice(0, 12).arrayBuffer()), s = String.fromCharCode(...b);
    const ok = (b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF) || (b[0] === 0x89 && s.slice(1, 4) === 'PNG') || (s.slice(0, 4) === 'RIFF' && s.slice(8, 12) === 'WEBP');
    if (!ok) return BAD;
  } catch (e) { return 'Faylni o‘qib bo‘lmadi'; }
  return '';
}
function processImage(f) { // resize only when large; small originals are kept untouched
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(f), im = new Image();
    im.onload = () => {
      try {
        URL.revokeObjectURL(url); const m = Math.max(im.width, im.height);
        if (Math.min(im.width, im.height) < 200) return rej(new Error('Rasm o‘lchami juda kichik'));
        const done = (dataUrl, type) => res({ id:generateId('img'), name:f.name, dataUrl, type, size:Math.round(dataUrl.length * 0.75), order:0, isCover:false });
        if (m <= 1600 && f.size <= 700 * 1024) { const r = new FileReader(); r.onload = () => done(r.result, f.type); r.onerror = () => rej(new Error('read')); r.readAsDataURL(f); return; }
        const k = Math.min(1, 1600 / m), c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); done(c.toDataURL('image/jpeg', 0.85), 'image/jpeg');
      } catch (e) { rej(e); }
    };
    im.onerror = () => { URL.revokeObjectURL(url); rej(new Error('decode')); }; im.src = url;
  });
}
const normalizeImages = () => lw.images.forEach((x, i) => { x.order = i; x.isCover = i === 0; });
async function handlePhotoSelect(list) {
  if (!lw) return; lw.busy = true; renderSell();
  try {
    for (const f of [...list]) {
      if (lw.images.length >= photoRule().max) { showToast('Rasm limiti to‘ldi.', 'error'); break; }
      const err = await validateImageFile(f); if (err) { showToast(f.name + ': ' + err, 'error'); continue; }
      try { lw.images.push(await processImage(f)); } catch (e) { showToast(f.name + ': rasmni qayta ishlab bo‘lmadi', 'error'); }
    }
  } finally { lw.busy = false; normalizeImages(); renderSell(); }
}
const handlePhotoDrop = e => { if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) handlePhotoSelect(e.dataTransfer.files); };
function reorderImages(from, to) { if (from === to || !lw.images[from] || to < 0 || to >= lw.images.length) return; lw.images.splice(to, 0, lw.images.splice(from, 1)[0]); normalizeImages(); renderSell(); }
const setCoverImage = i => reorderImages(i, 0);
function removeUploadedImage(i) { lw.images.splice(i, 1); normalizeImages(); renderSell(); }
const PHOTO_MSG = "E'lon joylash uchun kamida 5 ta haqiqiy rasm yuklang.";
const photosValid = () => { const r = photoRule(), n = lw.images.length; return n >= r.min && n <= r.max && lw.images.every(i => typeof i.dataUrl === 'string' && i.dataUrl.startsWith('data:image/')); };
function validatePhotoCount() { const r = photoRule(), n = lw.images.length; return n < r.min ? PHOTO_MSG : n > r.max ? 'Ko‘pi bilan ' + r.max + ' ta rasm yuklash mumkin.' : photosValid() ? '' : 'Ba’zi rasmlar yaroqsiz. Qayta yuklang.'; }
// ---------- data collection / validation ----------
function collectDetails() {
  const out = { ...(SUBS[lw.sub].fixed || {}) };
  schemaOf(lw.sub).fields.forEach(f => { const v = lw.details[f.k]; if (isVisible(f, lw.details, lw.sub) && v !== undefined && v !== '') out[f.k] = f.type === 'number' ? Number(v) : v; });
  return out;
}
const collectListingData = () => ({ sub:lw.sub, group:lw.group, details:collectDetails(), common:{ ...lw.common }, images:lw.images });
function validateListingData(step) { // step 2|3|4 or 'all'; returns { fieldKey: message }
  const e = {}, c = lw.common, all = step === 'all', n = v => Number(v);
  if (all || step === 1) if (!lw.sub) e.sub = 'Nima sotayotganingizni tanlang.';
  if (!lw.sub) return e;
  if (all || step === 2) {
    schemaOf(lw.sub).fields.forEach(f => { if (!isVisible(f, lw.details, lw.sub)) return; const v = lw.details[f.k];
      if (f.req && (v === undefined || v === '')) e[f.k] = f.label.replace(/ \(.*\)$/, '') + ' maydonini to‘ldiring.';
      else if (v !== undefined && v !== '' && f.type === 'number' && (isNaN(n(v)) || n(v) < (f.min ?? 0) || (f.max !== undefined && n(v) > f.max))) e[f.k] = f.label.replace(/ \(.*\)$/, '') + ' qiymati noto‘g‘ri' + (f.max !== undefined ? ' (' + (f.min ?? 0) + '–' + f.max + ')' : '') + '.'; });
    if (!(c.title || '').trim() || c.title.trim().length < 5) e.title = 'E‘lon sarlavhasini kiriting (kamida 5 belgi).';
    if ((c.description || '').trim().length < 10) e.description = 'Tavsifni yozing (kamida 10 belgi).';
  }
  if (all || step === 3) {
    if (!(n(c.price) > 0)) e.price = 'Narxni to‘g‘ri kiriting.'; if (!c.priceType) e.priceType = 'Narx birligini tanlang.';
    if (!(n(c.quantity) > 0)) e.quantity = 'Miqdorni to‘g‘ri kiriting.'; if (!c.unit) e.unit = 'O‘lchov birligini tanlang.';
    if (!c.region) e.region = 'Viloyatni tanlang.'; if (!(c.district || '').trim()) e.district = 'Tuman/shaharni kiriting.';
    if (!validPhone(c.phone || '')) e.phone = 'Telefon raqami noto‘g‘ri.'; if (c.delivery === 'yes' && c.deliveryPrice && !(n(c.deliveryPrice) >= 0)) e.deliveryPrice = 'Yetkazish narxi noto‘g‘ri.';
  }
  if (all || step === 4) { const m = validatePhotoCount(); if (m) e.photos = m; }
  return e;
}
const ERR_STEP = k => k === 'sub' ? 1 : k === 'photos' ? 4 : ['price', 'priceType', 'quantity', 'unit', 'region', 'district', 'phone', 'deliveryPrice'].includes(k) ? 3 : 2;
function buildProduct(status) {
  const u = getCurrentUser(), s = sellerService.ensure(u), sub = SUBS[lw.sub], c = lw.common, d = collectDetails(), sc = schemaOf(lw.sub), old = lw.editId ? getProductById(lw.editId) : null, now = new Date().toISOString();
  normalizeImages(); const im = lw.images.map(x => ({ ...x })), bf = sc.fields.find(f => f.k === 'breed' || f.k === 'feedType' || f.k === 'grainType' || f.k === 'silageType' || f.k === 'productName');
  return { id:lw.editId || generateId('p'), ownerUserId:u.id, sellerId:s.id, source:'user', group:lw.group, category:sub.legacy, subcategory:lw.sub, title:(c.title || '').trim(),
    price:Number(c.price) || 0, priceType:c.priceType || '', quantity:Number(c.quantity) || 0, unit:c.unit || '', region:c.region || '', district:(c.district || '').trim(), address:(c.address || '').trim(),
    location:((c.district || '').trim() + ', ' + (c.region || '')).replace(/^, /, ''), phone:c.phone || '', description:(c.description || '').trim(), details:d, images:im, coverImage:im[0] ? im[0].id : '',
    deliveryAvailable:c.delivery === 'yes', deliveryPrice:c.delivery === 'yes' ? Number(c.deliveryPrice) || 0 : 0, status, negotiable:c.negotiable === 'yes', isNegotiable:c.negotiable === 'yes',
    animalType:sub.label, breed:bf && d[bf.k] ? optLabel(bf, d[bf.k]) : '', gender:d.gender === 'male' ? 'Erkak' : d.gender === 'female' ? 'Urg‘ochi' : '—', age:d.ageYears ?? 0, weight:d.weightKg ?? d.baleWeightKg ?? 0,
    views:old ? old.views || 0 : 0, phoneClicks:old ? old.phoneClicks || 0 : 0, favorites:0, createdAt:old ? old.createdAt : now, updatedAt:now };
}
const suggestTitle = () => { const d = lw.details, sub = SUBS[lw.sub], f = schemaOf(lw.sub).fields.find(x => x.k === 'breed'); return [d.ageYears ? d.ageYears + ' yoshli' : '', f && d.breed ? optLabel(f, d.breed) : '', sub.label].filter(Boolean).join(' '); };
// ---------- rendering ----------
const fieldHTML = (f, scope, val, err) => {
  const id = 'listing-' + f.k, lab = `<label class="lbl" for="${id}">${escapeHTML(f.label)}${f.req ? ' *' : ''}</label>`, at = `id="${id}" name="${f.k}" data-field="${f.k}" data-scope="${scope}" aria-invalid="${err ? 'true' : 'false'}"`;
  const bd = err ? ' style="border-color:var(--fm-danger)"' : '';
  let inp;
  if (f.type === 'select') inp = `<select class="input" ${at}${bd}><option value="">— Tanlang —</option>${f.opts.map(([v, l]) => `<option value="${escapeHTML(v)}" ${String(val) === v ? 'selected' : ''}>${escapeHTML(l)}</option>`).join('')}</select>`;
  else if (f.type === 'textarea') inp = `<textarea class="input" rows="4" maxlength="1000" ${at}${bd}>${escapeHTML(val || '')}</textarea>`;
  else inp = `<input class="input" type="${f.type}" ${f.type === 'number' ? `min="${f.min ?? 0}" step="${f.step ?? 'any'}" inputmode="decimal"` : ''} value="${escapeHTML(val ?? '')}" ${at}${bd}>`;
  return `<div class="min-w-0">${lab}${inp}<div class="err" id="e_${id}" role="alert">${escapeHTML(err || '')}</div></div>`;
};
const stepCat = () => !lw.group ? `<h2 class="font-extrabold mb-3">Nima sotasiz?</h2><div class="grid grid-cols-2 md:grid-cols-5 gap-3">${LGROUPS.map(([k, i, l, on]) => `<button class="card p-4 text-center ${on ? '' : 'opacity-60'}" data-act="lwGroup" data-id="${k}" ${on ? '' : 'disabled'} ><div class="text-3xl">${i}</div><div class="font-bold text-sm mt-1">${l}</div>${on ? '' : '<div class="badge g mt-1">Tez orada</div>'}</button>`).join('')}</div>`
  : `<button class="btn btn-ghost mb-3" data-act="lwGroup" data-id="">← Boshqa kategoriya</button><h2 class="font-extrabold mb-3">${lw.group === 'livestock' ? 'Qaysi chorvani sotasiz?' : 'Yem-xashak turi'}</h2><div class="grid grid-cols-2 md:grid-cols-4 gap-3">${Object.entries(SUBS).filter(([, s]) => s.group === lw.group).map(([k, s]) => `<button class="card p-3 text-center ${lw.sub === k ? 'ring-2' : ''}" style="${lw.sub === k ? 'border-color:var(--fm-green);background:var(--fm-green-light)' : ''}" data-act="lwSub" data-id="${k}"><div class="text-2xl">${s.icon}</div><div class="font-bold text-sm">${s.label}</div></button>`).join('')}</div><div class="err" id="e_listing-sub">${escapeHTML(lw.errors.sub || '')}</div>`;
const stepFields = () => { const sc = schemaOf(lw.sub), er = lw.errors;
  return `<h2 class="font-extrabold mb-1">${SUBS[lw.sub].icon} ${escapeHTML(SUBS[lw.sub].label)} — ma’lumotlar</h2><div class="grid grid-cols-1 md:grid-cols-2 gap-x-3">${sc.fields.filter(f => isVisible(f, lw.details, lw.sub)).map(f => fieldHTML(f, 'details', lw.details[f.k], er[f.k])).join('')}</div>
  <h3 class="font-bold mt-4">Umumiy ma’lumot</h3><div class="grid gap-x-3">${fieldHTML({ k:'title', label:'E‘lon sarlavhasi', type:'text', req:true }, 'common', lw.common.title, er.title)}${fieldHTML({ k:'description', label:'Tavsif', type:'textarea', req:true }, 'common', lw.common.description, er.description)}</div>`; };
const stepPrice = () => { const c = lw.common, er = lw.errors, g = lw.group, F = (k, l, t, o = {}) => fieldHTML({ k, label:l, type:t, ...o }, 'common', c[k], er[k]);
  return `<h2 class="font-extrabold mb-1">Narx va joylashuv</h2><div class="grid grid-cols-1 md:grid-cols-2 gap-x-3">${F('priceType', 'Narx birligi', 'select', { req:true, opts:PRICE_TYPES[g] })}${F('price', 'Narx (so‘m)', 'number', { req:true, min:1 })}${F('quantity', 'Miqdor', 'number', { req:true, min:1 })}${F('unit', 'O‘lchov birligi', 'select', { req:true, opts:UNITS[g].map(u => [u, u]) })}
  ${F('negotiable', 'Narx kelishiladimi?', 'select', { opts:[['yes', 'Ha, kelishiladi'], ['no', 'Yo‘q']] })}${F('phone', 'Telefon', 'tel', { req:true })}${F('region', 'Viloyat', 'select', { req:true, opts:REGIONS.map(r => [r, r]) })}${F('district', 'Tuman / shahar', 'text', { req:true })}${F('address', 'Manzil (ixtiyoriy)', 'text')}
  ${F('delivery', 'Yetkazib berish', 'select', { opts:[['yes', 'Bor'], ['no', 'Yo‘q']] })}${c.delivery === 'yes' ? F('deliveryPrice', 'Yetkazish narxi (so‘m, ixtiyoriy)', 'number') : ''}</div>`; };
const stepPhotos = () => { const r = photoRule(), n = lw.images.length, er = lw.errors.photos;
  const hint = n >= r.max ? 'Rasm limiti to‘ldi.' : n < r.min ? 'Kamida ' + r.min + ' ta rasm yuklang. Yana ' + (r.min - n) + ' ta rasm yuklang.' : 'Minimal talab bajarildi. Ko‘proq rasm — ko‘proq ishonch.';
  return `<h2 class="font-extrabold">Rasmlar</h2><p class="text-xs mb-2" style="color:var(--fm-muted)">E’loningizdagi mahsulot/chorvaning haqiqiy rasmlarini yuklang.</p>
  <p class="text-xs mb-2">${lw.group === 'livestock' ? 'Maslahat: hayvonning old, yon, orqa tomoni va yuz qismini aniq suratga oling.' : 'Maslahat: mahsulotning umumiy ko‘rinishi, qadoqlanishi, sifati va miqdorini ko‘rsatuvchi rasmlarni yuklang.'}</p>
  <label data-drop="1" class="block text-center p-6 rounded-xl cursor-pointer" style="border:2px dashed var(--fm-green);background:var(--fm-green-light)" for="listing-photos"><div class="text-3xl">📷</div><p class="font-bold text-sm">Rasmlarni shu yerga tashlang yoki tanlang</p><span class="btn btn-primary mt-2">+ Rasm tanlash</span></label>
  <input id="listing-photos" name="photos" type="file" multiple accept="image/jpeg,image/png,image/webp" class="sr-only" ${n >= r.max ? 'disabled' : ''}>
  <p class="text-sm font-bold mt-3" aria-live="polite" style="color:${n >= r.min ? 'var(--fm-green)' : 'var(--fm-text)'}">${n} / ${r.max} ta rasm${n >= r.min ? ' ✓' : ''} ${lw.busy ? '· yuklanmoqda…' : ''}</p><p class="text-xs">${hint}</p><div class="err" id="e_listing-photos" role="alert">${escapeHTML(er || '')}</div>
  <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mt-2">${lw.images.map((x, i) => `<div class="card overflow-hidden relative" draggable="true" data-thumb="${i}"><img src="${escapeHTML(x.dataUrl)}" alt="Rasm ${i + 1}" class="h-24 w-full object-cover"><span class="absolute top-1 left-1 badge">${i + 1}</span>${i === 0 ? '<span class="absolute bottom-8 left-1 badge y">Muqova</span>' : ''}<button class="absolute top-1 right-1 btn btn-ghost !p-1 !px-2" data-act="imgDel" data-id="${i}" aria-label="Rasm ${i + 1} ni o‘chirish">✕</button>
  <div class="flex text-xs"><button class="flex-1 py-1" data-act="imgLeft" data-id="${i}" aria-label="Oldinga">‹</button>${i ? `<button class="flex-1 py-1 font-bold" data-act="imgCover" data-id="${i}">★</button>` : ''}<button class="flex-1 py-1" data-act="imgRight" data-id="${i}" aria-label="Orqaga">›</button></div></div>`).join('')}</div>`; };
const stepReview = () => { const ok = [1, 2, 3, 4].map(s => !Object.keys(validateListingData(s)).length), p = buildProduct(lw.editId && lw.status === LISTING.ACTIVE ? LISTING.ACTIVE : LISTING.PENDING);
  return `<h2 class="font-extrabold mb-2">Ko‘rinishi</h2><div class="flex flex-wrap gap-2 mb-3">${['Kategoriya', 'Ma’lumotlar', 'Narx', 'Rasmlar'].map((l, i) => `<span class="badge ${ok[i] ? '' : 'r'}">${ok[i] ? '✓' : '✗'} ${l}</span>`).join('')}</div>
  <div class="grid md:grid-cols-3 gap-4"><div style="pointer-events:none">${card(p)}</div><div class="md:col-span-2 text-sm">${galleryHTML(p)}<p class="font-extrabold text-lg">${escapeHTML(p.title)}</p><p class="font-extrabold" style="color:var(--fm-green-dark)">${formatPrice(p.price)}${escapeHTML(priceSuffix(p))} ${p.negotiable ? '<span class="badge y">Kelishiladi</span>' : ''}</p>${specsHTML(p)}<p>${escapeHTML(p.description)}</p></div></div>
  <div class="card p-3 mt-3 text-sm"><b>Rasm talabi</b><p class="mt-1" style="color:${photosValid() ? 'var(--fm-green)' : 'var(--fm-danger)'}">${lw.images.length} / ${photoRule().max}${photosValid() ? ' ✓' : ''}</p>${photosValid() ? '' : `<p class="text-xs">Yana ${Math.max(0, photoRule().min - lw.images.length)} ta rasm yuklang.</p>`}</div><p class="text-xs mt-3" style="color:var(--fm-muted)">E’lon avval tekshiruvga yuboriladi (holati: Tekshiruvda).</p>`; };
function renderSell() {
  if (!lw) lw = freshWizard(); const el = $('view-sell'); if (!el) return;
  const bar = LS_STEPS.map((t, i) => `<li class="flex-1 text-center text-[11px] font-bold py-2 border-b-4" style="border-color:${i + 1 < lw.step ? 'var(--fm-green)' : i + 1 === lw.step ? 'var(--fm-yellow)' : 'var(--fm-border)'};color:${i + 1 <= lw.step ? 'var(--fm-green-dark)' : 'var(--fm-muted)'}">${i + 1 < lw.step ? '✓ ' : ''}${t}</li>`).join('');
  const body = [stepCat, stepFields, stepPrice, stepPhotos, stepReview][lw.step - 1]();
  el.innerHTML = `<h1 class="text-2xl font-extrabold">${lw.editId ? 'E‘lonni tahrirlash' : 'E‘lon joylash'}</h1><p class="text-xs mb-2" style="color:var(--fm-muted)">${lw.step} / 5 qadam</p><ol class="flex mb-4">${bar}</ol><div class="card p-4">${body}</div>
  <div class="flex flex-wrap gap-2 mt-4 justify-between">${lw.step > 1 ? '<button class="btn btn-ghost" data-act="lwBack">← Orqaga</button>' : '<span></span>'}<div class="flex gap-2">${lw.sub ? '<button class="btn btn-ghost" data-act="lwDraft">Qoralama sifatida saqlash</button>' : ''}${lw.step < 5 ? '<button class="btn btn-primary" data-act="lwNext">Keyingisi →</button>' : `<button class="btn btn-accent" data-act="lwPublish" ${photosValid() ? '' : 'disabled aria-disabled="true" title="Kamida 5 ta rasm kerak"'}>${lw.editId && lw.status === LISTING.ACTIVE ? 'Saqlash' : 'Tekshiruvga yuborish'}</button>`}</div></div>`;
}
// ---------- flow ----------
function setSub(k) { lw.sub = k; lw.group = SUBS[k].group; lw.details = { ...(SUBS[k].fixed || {}) }; lw.errors = {};
  lw.common.unit = SUBS[k].unit || UNITS[lw.group][0]; lw.common.priceType = SUBS[k].pt || PRICE_TYPES[lw.group][0][0]; lw.common.title = ''; lw.step = 2; }
const hasEntered = () => Object.entries(lw.details).some(([k, v]) => v !== '' && !(SUBS[lw.sub] && SUBS[lw.sub].fixed && k in SUBS[lw.sub].fixed)) || (lw.common.title || '').trim();
function goStep(n) { lw.errors = {}; lw.step = n; if (n === 3 && !lw.common.phone) lw.common.phone = (getCurrentUser() || {}).phone || ''; if (n === 3 && !lw.common.region) { lw.common.region = (getCurrentUser() || {}).region || ''; }
  if (n === 2 && !(lw.common.title || '').trim()) lw.common.title = suggestTitle(); renderSell(); window.scrollTo(0, 0); }
function showErrors(e) { lw.errors = e; const k = Object.keys(e)[0]; lw.step = Math.min(...Object.keys(e).map(ERR_STEP)); renderSell(); showToast(e[k], 'error'); }
function saveListingDraft() { if (!lw.sub) return showToast('Avval kategoriyani tanlang.', 'error'); const p = buildProduct(LISTING.DRAFT); if (!(p.title)) p.title = 'Qoralama — ' + SUBS[lw.sub].label;
  if (!productService.saveListing(p)) return showToast(STORAGE_FULL, 'error'); lw.editId = p.id; lw.status = LISTING.DRAFT; showToast('Qoralama saqlandi', 'success'); }
function publishListing() {
  if (!photosValid()) { lw.errors = { photos:PHOTO_MSG }; lw.step = 4; renderSell(); return showToast(PHOTO_MSG, 'error'); }
  const e = validateListingData('all'); if (Object.keys(e).length) return showErrors(e);
  const keep = lw.editId && lw.status === LISTING.ACTIVE, p = buildProduct(keep ? LISTING.ACTIVE : LISTING.PENDING);
  if (!productService.saveListing(p)) return showToast(STORAGE_FULL, 'error');
  lw = null; showToast(keep ? 'E’lon yangilandi.' : 'E’loningiz tekshiruvga yuborildi.', 'success'); go('sellerDashboard');
}
function editListing(id) {
  const u = getCurrentUser(), p = getProductById(id); if (!u || !p || p.ownerUserId !== u.id || p.source !== 'user') return showToast('Tahrirlash mumkin emas', 'error');
  const c = { title:p.title, description:p.description, priceType:p.priceType, price:String(p.price), quantity:String(p.quantity), unit:p.unit, negotiable:p.negotiable ? 'yes' : 'no', phone:p.phone, region:p.region, district:p.district, address:p.address, delivery:p.deliveryAvailable ? 'yes' : 'no', deliveryPrice:p.deliveryPrice ? String(p.deliveryPrice) : '' };
  const d = {}; Object.entries(p.details || {}).forEach(([k, v]) => d[k] = String(v));
  lw = { ...freshWizard(), step:2, group:p.group, sub:p.subcategory, details:d, common:c, images:sortedImages(p).map(x => ({ ...x })), editId:p.id, status:p.status }; go('sell');
}
// ---------- lightbox ----------
let lb = null;
function openLightbox(pid, i) { const p = getProductById(pid); if (!p) return; const im = sortedImages(p); if (!im.length) return; lb = { im, i:Math.min(im.length - 1, Math.max(0, i)), title:p.title };
  let el = $('lightbox'); if (!el) { el = document.createElement('div'); el.id = 'lightbox'; el.className = 'fixed inset-0 z-[70] bg-black/90 flex items-center justify-center'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); document.body.appendChild(el);
    let sx = 0; el.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }); el.addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) lbStep(dx < 0 ? 1 : -1); }); }
  el.style.display = 'flex'; paintLightbox(); }
const paintLightbox = () => { const el = $('lightbox'); if (!el || !lb) return; el.innerHTML = `<button class="absolute top-4 right-4 text-white text-2xl" data-act="lbClose" aria-label="Yopish">✕</button><button class="absolute left-3 text-white text-4xl px-2" data-act="lbPrev" aria-label="Oldingi">‹</button><img src="${escapeHTML(lb.im[lb.i].dataUrl || lb.im[lb.i].url)}" alt="${escapeHTML(lb.title)} — ${lb.i + 1}" class="max-h-[90vh] max-w-[90vw] object-contain"><button class="absolute right-3 text-white text-4xl px-2" data-act="lbNext" aria-label="Keyingi">›</button><span class="absolute bottom-4 text-white text-xs">${lb.i + 1} / ${lb.im.length}</span>`; };
const lbStep = d => { if (!lb) return; lb.i = (lb.i + d + lb.im.length) % lb.im.length; paintLightbox(); };
const closeLightbox = () => { const el = $('lightbox'); if (el) el.style.display = 'none'; lb = null; };
// ---------- wiring ----------
Object.assign(actions, {
  newListing:() => { lw = freshWizard(); go('sell'); },
  lwGroup:b => { if (b.dataset.id) { lw.group = b.dataset.id; } else { lw.group = ''; lw.sub = ''; } renderSell(); },
  lwSub:b => { const k = b.dataset.id; if (lw.sub && lw.sub !== k && hasEntered()) { lw.pendingSub = k; return openModal(`<h2 class="font-extrabold text-lg">Kategoriyani o‘zgartirasizmi?</h2><p class="text-sm my-2">Kategoriya o‘zgarsa, ayrim kiritilgan ma’lumotlar o‘chirilishi mumkin. Rasmlar saqlanadi.</p><div class="flex gap-2"><button class="btn btn-ghost" data-act="lwSubNo">Bekor qilish</button><button class="btn btn-primary" data-act="lwSubOk">Davom etish</button></div>`); } setSub(k); renderSell(); },
  lwSubOk:() => { closeModal(); if (lw.pendingSub) setSub(lw.pendingSub); lw.pendingSub = ''; renderSell(); }, lwSubNo:() => { lw.pendingSub = ''; closeModal(); },
  lwNext:() => { const e = validateListingData(lw.step); if (Object.keys(e).length) { lw.errors = e; renderSell(); return showToast(e[Object.keys(e)[0]], 'error'); } goStep(lw.step + 1); },
  lwBack:() => goStep(Math.max(1, lw.step - 1)), lwDraft:() => saveListingDraft(), lwPublish:b => guard('publish', b, async () => publishListing()),
  imgDel:b => removeUploadedImage(Number(b.dataset.id)), imgCover:b => setCoverImage(Number(b.dataset.id)), imgLeft:b => reorderImages(Number(b.dataset.id), Number(b.dataset.id) - 1), imgRight:b => reorderImages(Number(b.dataset.id), Number(b.dataset.id) + 1),
  lightbox:b => openLightbox(b.dataset.id, Number(b.dataset.i) || 0), lbClose:closeLightbox, lbPrev:() => lbStep(-1), lbNext:() => lbStep(1),
  editListing:b => editListing(b.dataset.id),
  approveDemo:b => { try { productService.setStatus(b.dataset.id, LISTING.ACTIVE); showToast('DEMO: e’lon tasdiqlandi', 'success'); render(); } catch (e) { showToast(e.message, 'error'); } }
});
document.addEventListener('input', e => { const t = e.target; if (!lw || !t.dataset || !t.dataset.field || !t.closest('#view-sell')) return; (t.dataset.scope === 'common' ? lw.common : lw.details)[t.dataset.field] = t.value; delete lw.errors[t.dataset.field]; const m = $('e_' + t.id); if (m) m.textContent = ''; });
document.addEventListener('change', e => { const t = e.target; if (t.id === 'listing-photos') { handlePhotoSelect(t.files); t.value = ''; return; }
  if (!lw || !t.dataset || !t.dataset.field || !t.closest('#view-sell') || t.tagName !== 'SELECT') return;
  if (schemaOf(lw.sub).fields.some(f => f.showIf) || t.dataset.field === 'delivery') { (t.dataset.scope === 'common' ? lw.common : lw.details)[t.dataset.field] = t.value; renderSell(); } });
document.addEventListener('dragover', e => { if (e.target.closest && e.target.closest('#view-sell')) e.preventDefault(); });
document.addEventListener('dragstart', e => { const t = e.target.closest && e.target.closest('[data-thumb]'); if (t && e.dataTransfer) e.dataTransfer.setData('text/plain', 'img:' + t.dataset.thumb); });
document.addEventListener('drop', e => { if (!lw || !e.target.closest || !e.target.closest('#view-sell')) return; e.preventDefault();
  const txt = e.dataTransfer ? e.dataTransfer.getData('text/plain') : '', th = e.target.closest('[data-thumb]'); if (txt.startsWith('img:') && th) return reorderImages(Number(txt.slice(4)), Number(th.dataset.thumb)); handlePhotoDrop(e); });
// image load failures: user photos show an error state (never swapped for another animal); old demo images get a neutral tile
document.addEventListener('error', e => { const t = e.target; if (!t || t.tagName !== 'IMG' || !t.dataset.fm) return; const d = document.createElement('div'); d.className = t.className + ' flex items-center justify-center text-center text-xs badge r';
  d.textContent = t.dataset.fm === 'user' ? 'Rasm yuklanmadi — sotuvchi qayta yuklashi kerak' : '🐾'; if (t.parentNode) t.parentNode.replaceChild(d, t); }, true);
