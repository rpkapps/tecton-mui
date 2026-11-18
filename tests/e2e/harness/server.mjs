// Harness dev server: SPA scenarios via Vite, plus /ssr which server-renders with Vite's SSR loader
// and hydrates on the client (SSR/hydration and flash-of-incorrect-theme tests).
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { createServer } from 'vite';

const root = dirname(fileURLToPath(import.meta.url));
const port = Number(process.argv[2] ?? process.env.PORT ?? 4310);
const vite = await createServer({ root, server: { middlewareMode: true }, appType: 'spa' });

const server = http.createServer(async (req, res) => {
  if (req.url?.startsWith('/ssr')) {
    try {
      const { render } = await vite.ssrLoadModule('/src/ssr-entry-server.tsx');
      const { head, html } = render();
      const page = await vite.transformIndexHtml(
        req.url,
        `<!doctype html><html lang="en"><head><meta charset="UTF-8" />${head}</head><body><div id="root">${html}</div><script type="module" src="/src/ssr-entry-client.tsx"></script></body></html>`,
      );
      res.setHeader('Content-Type', 'text/html');
      res.end(page);
    } catch (error) {
      vite.ssrFixStacktrace(error);
      res.statusCode = 500;
      res.end(String(error.stack ?? error));
    }
    return;
  }
  vite.middlewares(req, res);
});
server.listen(port, () => console.log(`harness listening on http://localhost:${port}`));
