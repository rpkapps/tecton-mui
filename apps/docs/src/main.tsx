import '@tecton-mui/ui/styles/global.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { initTecton } from '@tecton-mui/ui/styles';
import { createAppRouter } from './router';

// Explicit host step: initialize Tecton's shared theme manager (mode + `data-theme` on <html>).
initTecton();

async function start() {
  const router = createAppRouter();
  // Resolve the matched route (code-split chunk, loader data) before rendering, so the client
  // render replaces the prerendered markup in one step without a loading state.
  await router.load();
  const container = document.getElementById('root')!;
  createRoot(container).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );
}

void start();
