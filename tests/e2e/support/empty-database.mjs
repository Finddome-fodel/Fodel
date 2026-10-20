/**
 * A stand-in for Supabase that has no data and accepts no writes — what the
 * read-only end-to-end tests run against when no test database is configured.
 *
 * Every read through PostgREST answers "no rows" (an empty list, a null
 * single row, a zero count); every write is refused with 403; auth has no
 * users. So public pages render exactly as they would on an empty site, the
 * portal's sign-in screens work, and nothing anywhere can be changed — this
 * is never pointed at, and cannot reach, a real project.
 *
 *   node tests/e2e/support/empty-database.mjs [port]   (default 54399)
 */
import http from 'node:http';

const port = Number(process.argv[2] ?? 54399);

const send = (res, status, body, headers = {}) => {
  res.writeHead(status, { 'content-type': 'application/json', 'access-control-allow-origin': '*', ...headers });
  res.end(body === undefined ? '' : JSON.stringify(body));
};

http
  .createServer((req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    if (req.method === 'OPTIONS') return send(res, 204);
    if (url.pathname === '/health') return send(res, 200, { ok: true });

    if (url.pathname.startsWith('/rest/v1/')) {
      if (req.method === 'GET' || req.method === 'HEAD') {
        const wantsObject = String(req.headers.accept ?? '').includes('vnd.pgrst.object');
        if (wantsObject) return send(res, 406, { code: 'PGRST116', details: 'The result contains 0 rows', hint: null, message: 'JSON object requested, multiple (or no) rows returned' });
        return send(res, 200, req.method === 'HEAD' ? undefined : [], { 'content-range': '*/0' });
      }
      // rpc() calls are POSTs that only read (search, next ref…): no rows.
      if (req.method === 'POST' && url.pathname.startsWith('/rest/v1/rpc/')) return send(res, 200, []);
      return send(res, 403, { code: '42501', message: 'read-only test database' });
    }
    if (url.pathname.startsWith('/auth/v1/')) return send(res, 400, { error: 'invalid_grant', error_description: 'Invalid login credentials' });
    if (url.pathname.startsWith('/storage/v1/')) return send(res, 404, { error: 'not_found' });
    return send(res, 404, { error: 'not_found' });
  })
  .listen(port, '127.0.0.1', () => console.log(`empty database on http://127.0.0.1:${port}`));
