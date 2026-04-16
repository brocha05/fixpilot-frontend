import { toast } from 'sonner';
import { isAxiosError } from 'axios';

interface ValidationDetail {
  field: string;
  message: string;
}

interface ApiErrorBody {
  success: false;
  error?: {
    code?: string;
    message?: string;
    details?: ValidationDetail[];
  };
  // legacy flat format fallback
  message?: string | string[];
}

export function toastApiError(error: unknown, fallback: string): void {
  if (isAxiosError<ApiErrorBody>(error)) {
    const body = error.response?.data;

    // Structured error envelope: { success: false, error: { code, message, details? } }
    if (body?.error) {
      const { message, details } = body.error;

      if (Array.isArray(details) && details.length > 0) {
        details.forEach((d) => toast.error(`${d.field}: ${d.message}`));
        return;
      }

      if (typeof message === 'string' && message) {
        toast.error(message);
        return;
      }
    }

    // Legacy fallback: flat { message: string | string[] }
    const msg = body?.message;
    if (Array.isArray(msg) && msg.length > 0) {
      msg.forEach((m) => toast.error(m));
      return;
    }
    if (typeof msg === 'string' && msg) {
      toast.error(msg);
      return;
    }
  }

  toast.error(fallback);
}
