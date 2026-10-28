'use strict';
(async function init() {
  await seedIfNeeded();
  const [r, p] = (location.hash.slice(1) || 'home').split('/');
  go(ROUTES[r] && r !== 'sell' ? r : 'home', p);
  setTimeout(() => { const s = $('splash'); if (s) { s.style.opacity = 0; setTimeout(() => s.remove(), 400); } }, 500);
})();
