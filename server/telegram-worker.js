// Cloudflare Worker: forwards FarMarket deal notifications to your Telegram bot.
// The bot token lives ONLY here as an encrypted secret, never in frontend code.
// Secrets/vars (Workers > Settings > Variables):
//   BOT_TOKEN (secret)   CHAT_ID (secret or var)   ALLOWED_ORIGIN (var, e.g. https://your-site.com)
export default {
  async fetch(req, env) {
    const origin = req.headers.get('Origin') || '';
    const okOrigin = !env.ALLOWED_ORIGIN || origin === env.ALLOWED_ORIGIN;
    const cors = { 'Access-Control-Allow-Origin': okOrigin ? (origin || '*') : 'null', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Vary': 'Origin' };
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (req.method !== 'POST' || !okOrigin) return new Response('Forbidden', { status: 403, headers: cors });
    let body; try { body = await req.json(); } catch { return new Response('Bad JSON', { status: 400, headers: cors }); }
    const text = String(body && body.text || '').trim().slice(0, 3500);
    if (!text) return new Response('Empty', { status: 400, headers: cors });
    const r = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: env.CHAT_ID, text, disable_web_page_preview: true }) // plain text: no markup injection
    });
    return new Response(r.ok ? 'OK' : 'Telegram error', { status: r.ok ? 200 : 502, headers: cors });
  }
};
