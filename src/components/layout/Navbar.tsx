import Link from "next/link";
import { Button } from "@/components/ui/button";
// Import useAuth hook later for role

export default function Navbar() {
  // Placeholder: Assume role from context (implement in Step 5)
  const role = "admin"; // Or 'cashier'

  return (
    <nav className="bg-primary text-primary-foreground p-4 flex justify-between">
      <Link href="/dashboard" className="text-lg font-bold">Djibouti POS</Link>
      <div className="space-x-4">
        <Link href="/dashboard/pos"><Button variant="ghost">POS</Button></Link>
        {role === "admin" && (
          <>
            <Link href="/dashboard/inventory"><Button variant="ghost">Inventory</Button></Link>
            <Link href="/dashboard/reports"><Button variant="ghost">Reports</Button></Link>
            <Link href="/dashboard/settings"><Button variant="ghost">Settings</Button></Link>
          </>
        )}
        <Button variant="outline">Logout</Button>
      </div>
    </nav>
  );
}