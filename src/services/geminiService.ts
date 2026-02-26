
/**
 * Hashes text the same way the server names cached audio files.
 */
async function hashText(text: string): Promise<string> {
  const encoded = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .substring(0, 16);
}

/**
 * Returns the local cached audio URL for a piece of text.
 * This does not make any API calls.
 */
export async function getCachedAudioUrl(text: string): Promise<string> {
  const hash = await hashText(text);
  return `${import.meta.env.BASE_URL}audio/${hash}.wav`;
}
