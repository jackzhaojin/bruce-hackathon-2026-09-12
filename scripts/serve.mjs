import { createReadStream } from 'node:fs';
import { access, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';

const root = resolve(process.cwd());
const port = Number(process.env.PORT || 4173);
const blockedSegments = new Set(['.git', '.github', 'intake', 'local-only', 'node_modules']);
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

function safePublicPath(requestUrl) {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(requestUrl, 'http://localhost').pathname);
  } catch {
    return null;
  }
  const segments = pathname.split('/').filter(Boolean);
  if (segments.some((segment) => blockedSegments.has(segment) || segment.startsWith('.env'))) return null;
  const requested = resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
  if (requested !== root && !requested.startsWith(`${root}${sep}`)) return null;
  return requested;
}

const server = createServer(async (request, response) => {
  if (!['GET', 'HEAD'].includes(request.method || '')) {
    response.writeHead(405, { Allow: 'GET, HEAD' });
    response.end('Method not allowed');
    return;
  }

  let filePath = safePublicPath(request.url || '/');
  if (!filePath) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
    return;
  }

  try {
    await access(filePath);
    if ((await stat(filePath)).isDirectory()) filePath = resolve(filePath, 'index.html');
    await access(filePath);
    response.writeHead(200, {
      'Cache-Control': 'no-store',
      'Content-Type': contentTypes[extname(filePath)] || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
    });
    if (request.method === 'HEAD') response.end();
    else createReadStream(filePath).pipe(response);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Play Eleven preview: http://127.0.0.1:${port}`);
  console.log('Private folders local-only/, intake/, and .git/ are blocked.');
});
