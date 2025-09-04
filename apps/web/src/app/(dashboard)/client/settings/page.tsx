import { Suspense } from "react";
import { ClientSettingsContent } from "./content";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Settings - Client Dashboard",
  description: "Manage your account settings and preferences",
};

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      <span className="ml-2 text-gray-600">Loading settings...</span>
    </div>
  );
}

export default function ClientSettingsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ClientSettingsContent />
    </Suspense>
  );
}