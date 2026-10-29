import type { ElementInfo } from 'element-source';

// what element-source resolves a DOM node to: the library's ElementInfo plus a flag saying whether
// anything was actually resolved, or a message explaining why nothing was
type ElementSourceResult = (ElementInfo & { available: boolean }) | { error: string };

interface ElementSourceApi {
  ready: boolean;
  error: string | null;
  resolve: (node: unknown) => Promise<ElementSourceResult>;
  resolveBySelector: (selector: string) => Promise<ElementSourceResult>;
  resolveAtPoint: (x: number, y: number) => Promise<ElementSourceResult>;
  formatStack: (stack: unknown, maxLines?: number) => string;
}

declare global {
  interface Window {
    // Dev-only tooling; profiling sessions set this flag before navigation.
    __PROFILING__?: boolean;
    __ELEMENT_SOURCE__?: ElementSourceApi;
    defaultPkcOptions?: Record<string, unknown>;
  }
}

export {};
