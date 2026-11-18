import { createRouter, type RouterHistory } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

/** Router base path derived from Vite's `base` (`/` or `/<repo>/`). */
export const BASEPATH = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

export function createAppRouter(history?: RouterHistory) {
  return createRouter({
    routeTree,
    basepath: BASEPATH,
    history,
    defaultPreload: 'intent',
    scrollRestoration: true,
    trailingSlash: 'never',
  });
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createAppRouter>;
  }
}
