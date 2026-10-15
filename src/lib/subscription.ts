const DAY_IN_MS = 24 * 60 * 60 * 1000;

/** Subscription days are the total days granted from the account creation date. */
export function getSubscriptionExpiry(
  createdAt: string | null | undefined,
  subscriptionDays: string | number | null | undefined,
  storedExpiry: string | null | undefined,
): string {
  const days = Number.parseInt(String(subscriptionDays ?? ''), 10);
  const createdAtMs = createdAt ? new Date(createdAt).getTime() : Number.NaN;

  if (Number.isFinite(days) && days >= 0 && Number.isFinite(createdAtMs)) {
    return new Date(createdAtMs + days * DAY_IN_MS).toISOString();
  }

  return storedExpiry || '';
}

