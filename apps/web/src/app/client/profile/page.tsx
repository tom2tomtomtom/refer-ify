import { Suspense } from "react";
import { ClientProfileContent } from "./content";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Profile - Client Dashboard",
  description: "Manage your company profile and information",
};

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      <span className="ml-2 text-gray-600">Loading profile...</span>
    </div>
  );
}

export default function ClientProfilePage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ClientProfileContent />
    </Suspense>
  );
}