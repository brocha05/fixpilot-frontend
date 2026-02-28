import { toast } from 'sonner';
import { isAxiosError } from 'axios';

/**
 * Extracts and displays backend error messages.
 * NestJS class-validator returns message as string[] for validation errors,
 * or a plain string for other errors (401, 403, etc.).
 */
export function toastApiError(error: unknown, fallback: string): void {
  if (isAxiosError<{ message: string | string[] }>(error)) {
    const msg = error.response?.data?.message;
    if (Array.isArray(msg) && msg.length > 0) {
      msg.forEach((m) => toast.error(m));
      return;
    }
    if (typeof msg === 'string' && msg.length > 0) {
      toast.error(msg);
      return;
    }
  }
  toast.error(fallback);
}
