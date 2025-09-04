import { Suspense } from "react";
import { FoundingSettingsContent } from "./content";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Settings - Founding Circle Dashboard",
  description: "Manage your founding circle settings and preferences",
};

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      <span className="ml-2 text-gray-600">Loading settings...</span>
    </div>
  );
}

export default function FoundingSettingsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <FoundingSettingsContent />
    </Suspense>
  );
}