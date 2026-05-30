export function createLogId(): string {
  const randomUUID = globalThis.crypto?.randomUUID;

  if (typeof randomUUID === 'function') {
    return randomUUID.call(globalThis.crypto);
  }

  return `log-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
