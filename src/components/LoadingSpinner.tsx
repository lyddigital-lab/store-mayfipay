import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ size = 24 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="animate-spin text-mayfipay-orange" style={{ width: size, height: size }} />
    </div>
  );
}