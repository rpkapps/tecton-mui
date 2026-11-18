import * as React from 'react';

export interface HeadData {
  title?: string;
  description?: string;
}

export interface HeadCollector {
  set(data: HeadData): void;
}

/** Collects head data while prerendering; on the client the title is applied directly. */
export const HeadContext = React.createContext<HeadCollector | null>(null);

export const SITE_NAME = 'Tecton MUI';

/** Sets the document title (client) or records it for the prerendered `<head>` (server). */
export function DocumentHead({ title, description }: HeadData) {
  const collector = React.useContext(HeadContext);
  const fullTitle = title ? `${title} · ${SITE_NAME}` : SITE_NAME;
  collector?.set({ title: fullTitle, ...(description ? { description } : null) });
  React.useEffect(() => {
    document.title = fullTitle;
  }, [fullTitle]);
  return null;
}
