import { Suspense } from "react";
import { FoundingHelpContent } from "./content";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Help & Support - Founding Circle Dashboard",
  description: "Get help with platform management, revenue tracking, and founding circle features",
};

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      <span className="ml-2 text-gray-600">Loading help...</span>
    </div>
  );
}

export default function FoundingHelpPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <FoundingHelpContent />
    </Suspense>
  );
}