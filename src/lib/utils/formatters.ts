// ─── Date formatters (es-MX locale) ──────────────────────────────────────────

export function formatDate(
  date: string | Date,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }
): string {
  return new Intl.DateTimeFormat('es-MX', options).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHr = Math.round(diffMin / 60);
  const diffDays = Math.round(diffHr / 24);

  const rtf = new Intl.RelativeTimeFormat('es-MX', { numeric: 'auto' });

  if (diffSec < 60) return rtf.format(-diffSec, 'second');
  if (diffMin < 60) return rtf.format(-diffMin, 'minute');
  if (diffHr < 24) return rtf.format(-diffHr, 'hour');
  if (diffDays < 30) return rtf.format(-diffDays, 'day');
  return formatDate(date);
}

// ─── Currency formatters (MXN) ────────────────────────────────────────────────

/** For Stripe amounts stored in cents (billing module) */
export function formatCurrency(amountInCents: number, currency = 'MXN', locale = 'es-MX'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amountInCents / 100);
}

/** For repair order amounts stored as full pesos (e.g., 1500.00 = $1,500 MXN) */
export function formatMXN(amount: number | null | undefined): string {
  if (amount == null) return '—';
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(amount);
}

// ─── String formatters ────────────────────────────────────────────────────────

export function formatInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}...`;
}

export function formatPlanLabel(plan: string): string {
  return plan.charAt(0).toUpperCase() + plan.slice(1);
}

// ─── Greeting (Spanish) ───────────────────────────────────────────────────────

export function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 18) return 'Buenas tardes';
  return 'Buenas noches';
}
