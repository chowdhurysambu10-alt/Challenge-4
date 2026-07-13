import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost'
});

Object.defineProperty(globalThis, 'window', {
  value: dom.window,
  writable: true,
  configurable: true
});

Object.defineProperty(globalThis, 'document', {
  value: dom.window.document,
  writable: true,
  configurable: true
});

Object.defineProperty(globalThis, 'navigator', {
  value: dom.window.navigator,
  writable: true,
  configurable: true
});

globalThis.requestAnimationFrame = dom.window.requestAnimationFrame || function(callback) {
  return setTimeout(callback, 0);
};
globalThis.cancelAnimationFrame = dom.window.cancelAnimationFrame || function(id) {
  clearTimeout(id);
};

// Mock window.matchMedia
globalThis.window.matchMedia = dom.window.matchMedia || function() {
  return {
    matches: false,
    media: '',
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false
  };
};

// Mock ResizeObserver (required by Recharts)
globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock EventSource (required by Context connection)
globalThis.EventSource = class {
  constructor(url) {
    this.url = url;
  }
  close() {}
};

// Mock localStorage and sessionStorage
Object.defineProperty(globalThis, 'localStorage', {
  value: dom.window.localStorage,
  writable: true,
  configurable: true
});

Object.defineProperty(globalThis, 'sessionStorage', {
  value: dom.window.sessionStorage,
  writable: true,
  configurable: true
});

// Mock WebSocket (required by live context connection)
globalThis.WebSocket = class {
  constructor(url) {
    this.url = url;
    this.onmessage = null;
    this.onclose = null;
    this.onerror = null;
  }
  send() {}
  close() {}
};
