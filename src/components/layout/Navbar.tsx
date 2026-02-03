'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export default function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <nav className="bg-primary text-primary-foreground p-4 flex justify-between">
      <Link href="/dashboard" className="text-lg font-bold">Djibouti POS</Link>
      <div className="space-x-4">
        <Link href="/dashboard/pos"><Button variant="ghost">POS</Button></Link>
        {user?.role === 'admin' && (
          <>
            <Link href="/dashboard/inventory"><Button variant="ghost">Inventory</Button></Link>
            <Link href="/dashboard/reports"><Button variant="ghost">Reports</Button></Link>
            <Link href="/dashboard/settings"><Button variant="ghost">Settings</Button></Link>
          </>
        )}
        <Button variant="outline" onClick={signOut}>Logout</Button>
      </div>
    </nav>
  );
}