export const INIT_SCRIPT = `
(() => {
  window.__UBS_ACTIVE__ = true;
  const originalFetch = window.fetch;
  window.fetch = (...args) => originalFetch(...args);
})();
`;
