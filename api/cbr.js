// api/cbr.js — Node.js serverless (НЕ edge)
export const config = {
  runtime: 'nodejs',
};

export default async function handler(req, res) {
  // Разрешим preflight и простые CORS-запросы (полезно при тестах из file://)
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).end();
    return;
  }

  try {
    const upstream = 'https://www.cbr-xml-daily.ru/daily_json.js';

    const r = await fetch(upstream, {
      cache: 'no-store',
      // МАСКИРУЕМСЯ под обычный браузер — это критично против 403
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
          '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/json,text/plain,*/*',
        'Accept-Language': 'ru,en;q=0.9',
        // реферер — твой прод-домен
        'Referer': 'https://inv-calc-phi.vercel.app/'
      }
    });

    const body = await r.text();

    // CORS: позволяем вызывать откуда угодно (удобно при локальных тестах)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Полный запрет кэширования на всех уровнях
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Date', new Date().toUTCString());

    res.status(r.status).send(body);
  } catch (e) {
    // Понятное сообщение об ошибке
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(500).send(JSON.stringify({ error: String(e) }));
  }
}
