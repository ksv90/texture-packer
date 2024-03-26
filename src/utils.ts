export function createBufferFromData(data: unknown): globalThis.Buffer {
  return globalThis.Buffer.from(globalThis.JSON.stringify(data));
}
