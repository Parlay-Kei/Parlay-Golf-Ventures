import { useFeatures } from "@/lib/features";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface FeatureGateProps {
  feature: keyof typeof import("@/lib/features").FEATURES;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureGate({ feature, children, fallback }: FeatureGateProps) {
  const { hasAccess, userTier, isLoading } = useFeatures();
  const navigate = useNavigate();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!hasAccess(feature)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <h3 className="text-xl font-semibold">Premium Feature</h3>
        <p className="text-center text-gray-600">
          This feature is available for {userTier ? 'higher' : ''} tier members.
        </p>
        <Button
          onClick={() => navigate('/membership')}
          className="bg-pgv-green hover:bg-pgv-green/90"
        >
          Upgrade Membership
        </Button>
      </div>
    );
  }

  return <>{children}</>;
} 