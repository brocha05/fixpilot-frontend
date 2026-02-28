import { redirect } from 'next/navigation';

// Upgrade functionality is now in /dashboard/billing
export default function UpgradePage() {
  redirect('/dashboard/billing');
}
