// ─── Date formatters ─────────────────────────────────────────────────────────

export function formatDate(
  date: string | Date,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }
): string {
  return new Intl.DateTimeFormat('en-US', options).format(new Date(date));
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHr = Math.round(diffMin / 60);
  const diffDays = Math.round(diffHr / 24);

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  if (diffSec < 60) return rtf.format(-diffSec, 'second');
  if (diffMin < 60) return rtf.format(-diffMin, 'minute');
  if (diffHr < 24) return rtf.format(-diffHr, 'hour');
  if (diffDays < 30) return rtf.format(-diffDays, 'day');
  return formatDate(date);
}

// ─── Currency formatters ─────────────────────────────────────────────────────

export function formatCurrency(amountInCents: number, currency = 'USD', locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amountInCents / 100);
}

// ─── String formatters ────────────────────────────────────────────────────────

export function formatInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}...`;
}

// ─── Plan label ───────────────────────────────────────────────────────────────

export function formatPlanLabel(plan: string): string {
  return plan.charAt(0).toUpperCase() + plan.slice(1);
}
