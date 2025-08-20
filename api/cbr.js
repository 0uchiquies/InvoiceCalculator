// api/cbr.js
export const config = { runtime: 'edge' };

export default async function handler() {
  const upstream = 'https://www.cbr-xml-daily.ru/daily_json.js';

  // 1) Тянем у ЦБ без кэша на стороне Vercel
  const r = await fetch(upstream, {
    cache: 'no-store'          // важно: отключает серверный кэш Vercel Edge
  });

  const body = await r.text();

  // 2) Отдаём как JSON и запрещаем ЛЮБОЕ кэширование на всех слоях
  return new Response(body, {
    status: r.status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store, no-cache, must-revalidate, max-age=0',
      'pragma': 'no-cache',
      'expires': '0',
      'date': new Date().toUTCString()
    }
  });
}
