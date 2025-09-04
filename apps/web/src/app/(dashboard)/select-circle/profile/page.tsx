import { Suspense } from "react";
import { SelectCircleProfileContent } from "./content";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Profile - Select Circle Dashboard", 
  description: "Manage your select circle profile and expertise",
};

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      <span className="ml-2 text-gray-600">Loading profile...</span>
    </div>
  );
}

export default function SelectCircleProfilePage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SelectCircleProfileContent />
    </Suspense>
  );
}