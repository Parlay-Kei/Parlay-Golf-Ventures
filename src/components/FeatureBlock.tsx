
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FeatureBlockProps {
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
}

const FeatureBlock = ({ icon, title, description, className }: FeatureBlockProps) => {
  return (
    <div className={cn("p-6 rounded-lg", className)}>
      <div className="text-pgv-green mb-4">{icon}</div>
      <h3 className="font-serif text-xl font-bold mb-2 text-gray-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default FeatureBlock;
