import { Alert } from "@/components/ui/alert";

export default function OfflineIndicator() {
  // Placeholder logic (expand in Step 9)
  const isOnline = true; // Use navigator.onLine later
  return (
    <footer className="p-2 bg-muted text-center">
      {isOnline ? "Online" : "Offline - Changes will sync when connected"}
    </footer>
  );
}