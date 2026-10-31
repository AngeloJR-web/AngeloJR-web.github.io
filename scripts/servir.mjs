// Servidor local simples para ver o site enquanto edita: npm run dev
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = resolve(fileURLToPath(new URL('..', import.meta.url)));
const porta = Number(process.env.PORT ?? 4173);
const tipos = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png' };

createServer(async (req, res) => {
  const caminho = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const arquivo = normalize(join(raiz, caminho.endsWith('/') ? `${caminho}index.html` : caminho));
  if (!arquivo.startsWith(raiz + sep)) { res.writeHead(403).end(); return; }
  try {
    const dados = await readFile(arquivo);
    res.writeHead(200, { 'content-type': tipos[extname(arquivo)] ?? 'application/octet-stream', 'cache-control': 'no-store' }).end(dados);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('Arquivo não encontrado');
  }
}).listen(porta, '127.0.0.1', () => console.log(`Site em http://localhost:${porta}`));
