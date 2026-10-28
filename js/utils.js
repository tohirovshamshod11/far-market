'use strict';
const escapeHTML = v => String(v ?? '').replace(/[&<>"'`]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','`':'&#96;'}[c]));
const $ = (id) => document.getElementById(id);
function safeLoad(key, fallback) {
  try { const r = localStorage.getItem(key); if (r === null) return fallback; const v = JSON.parse(r); return v ?? fallback; }
  catch (e) { console.warn('Corrupted storage:', key); try { localStorage.removeItem(key); } catch(_){} return fallback; }
}
function safeSave(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (e) { showToast('Brauzer xotirasi to‘ldi. Kichikroq rasmlardan foydalaning yoki server storage ulang.', 'error'); return false; } }
const generateId = (p='id') => p + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const formatPrice = n => (Number(n) || 0).toLocaleString('uz-UZ').replace(/,/g,' ') + ' so‘m';
const formatDate = d => { const x = new Date(d); return isNaN(x) ? '—' : x.toLocaleDateString('uz-UZ', { day:'2-digit', month:'short', year:'numeric' }); };
const norm = s => String(s ?? '').toLowerCase().replace(/[ʻʼ’‘`']/g, '').trim();
function showToast(msg, type='info') {
  const c = $('toast-container'); if (!c) return;
  const el = document.createElement('div');
  const bg = type === 'error' ? 'var(--fm-danger)' : type === 'success' ? 'var(--fm-green)' : 'var(--fm-green-dark)';
  el.className = 'pointer-events-auto text-white text-xs font-bold px-4 py-3 rounded-xl shadow-lg'; el.style.background = bg; el.textContent = msg;
  c.appendChild(el); setTimeout(() => el.remove(), 3200);
}
let _lastFocus = null;
function openModal(html) { const b = $('modal-backdrop'); if (!b) return; _lastFocus = document.activeElement; $('modal-content').innerHTML = html;
  b.classList.remove('hidden'); b.classList.add('flex'); document.body.style.overflow = 'hidden'; const f = b.querySelector('input,select,textarea,button:not(#modal-close-btn)'); f && f.focus(); }
function closeModal() { const b = $('modal-backdrop'); if (!b) return; b.classList.add('hidden'); b.classList.remove('flex'); $('modal-content').innerHTML = ''; document.body.style.overflow = ''; _lastFocus && _lastFocus.focus && _lastFocus.focus(); }
const stars = (r) => { const n = Math.round(r || 0); return '<span class="star" aria-label="' + n + ' yulduz">' + '★'.repeat(n) + '<span style="color:#ccd">' + '★'.repeat(5 - n) + '</span></span>'; };
const emptyState = (icon, text, sub='') => `<div class="empty card"><div class="text-4xl mb-2">${icon}</div><p class="font-bold" style="color:var(--fm-text)">${escapeHTML(text)}</p><p class="text-xs mt-1">${escapeHTML(sub)}</p></div>`;
// Submit guard: prevents double-click duplicates
const _busy = new Set();
async function guard(key, btn, fn) {
  if (_busy.has(key)) return; _busy.add(key);
  const old = btn && btn.innerHTML; if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spin"></span>'; }
  try { await fn(); } catch (e) { console.error(e); showToast(e.message || 'Xatolik', 'error'); }
  finally { _busy.delete(key); if (btn && btn.isConnected) { btn.disabled = false; btn.innerHTML = old; } }
}
const validPhone = p => /^\+?\d{9,13}$/.test(String(p).replace(/[\s()-]/g, ''));
const validEmail = e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
