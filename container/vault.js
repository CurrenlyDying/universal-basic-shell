export function serializeSessionState(storageState) {
  return JSON.stringify({ storageState, savedAt: new Date().toISOString() });
}

export function parseSessionState(blob) {
  if (!blob) return null;
  const parsed = JSON.parse(blob);
  return parsed.storageState || null;
}
