const WEBAUTHN_PROMPT_KEY = 'digitalazizi_webauthn_prompt_started_at';
const MAX_PROMPT_DURATION_MS = 3 * 60 * 1000;

export function isWebAuthnPromptActive(): boolean {
  if (typeof window === 'undefined') return false;

  const startedAt = Number(sessionStorage.getItem(WEBAUTHN_PROMPT_KEY));
  if (!startedAt || Date.now() - startedAt > MAX_PROMPT_DURATION_MS) {
    sessionStorage.removeItem(WEBAUTHN_PROMPT_KEY);
    return false;
  }
  return true;
}

export async function withWebAuthnPrompt<T>(run: () => Promise<T>): Promise<T> {
  if (typeof window === 'undefined') return run();

  sessionStorage.setItem(WEBAUTHN_PROMPT_KEY, String(Date.now()));
  try {
    return await run();
  } finally {
    sessionStorage.removeItem(WEBAUTHN_PROMPT_KEY);
  }
}
