import { redirect } from 'next/navigation';

/**
 * Root route: redirect authenticated users to dashboard,
 * unauthenticated users will be caught by middleware → /login.
 */
export default function RootPage() {
  redirect('/dashboard');
}
