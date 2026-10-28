# Telegram bildirishnoma (savdolashuv)

1. BotFather'da eski tokenni bekor qiling (/revoke) va yangisini oling. Token hech qachon frontend faylga yozilmaydi.
2. Cloudflare Workers'da yangi Worker yarating, `telegram-worker.js` kodini joylang.
3. Settings > Variables: `BOT_TOKEN` (Secret), `CHAT_ID` (Secret), `ALLOWED_ORIGIN` (saytingiz manzili).
4. Worker URL'ini `js/config.js` ichidagi `TELEGRAM_PROXY_URL` ga yozing.
5. Botga bir marta /start yozing (aks holda bot sizga xabar yubora olmaydi).
