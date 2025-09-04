import { Suspense } from "react";
import { CandidateSettingsContent } from "./content";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Settings - Candidate Dashboard",
  description: "Manage your candidate settings and preferences",
};

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      <span className="ml-2 text-gray-600">Loading settings...</span>
    </div>
  );
}

export default function CandidateSettingsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <CandidateSettingsContent />
    </Suspense>
  );
}