import { LoadingSpinner } from '@/components/ui/loading-boundary';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-gray-500">Loading Refer-ify...</p>
      </div>
    </div>
  );
}