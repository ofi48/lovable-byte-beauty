import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface FunctionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  isActive?: boolean;
  onClick: () => void;
  gradientClass: string;
  iconColor: string;
}

export const FunctionCard = ({ 
  title, 
  description, 
  icon: Icon, 
  isActive = false, 
  onClick, 
  gradientClass,
  iconColor 
}: FunctionCardProps) => {
  return (
    <div 
      className={`p-6 cursor-pointer transition-all duration-300 rounded-lg border-2 ${
        isActive 
          ? 'border-sidebar-primary bg-sidebar-accent shadow-glow' 
          : 'border-border hover:border-sidebar-primary/50 bg-card hover:shadow-card'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center space-x-4">
        <div className={`p-4 rounded-lg bg-gradient-to-br ${gradientClass}`}>
          <Icon className={`h-8 w-8 ${iconColor}`} strokeWidth={1.5} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1">
            {title}
          </h3>
          <p className="text-white/70 text-sm">
            {description}
          </p>
        </div>
        <Button 
          variant={isActive ? "default" : "outline"}
          size="sm"
          className={`rounded-lg ${isActive ? "bg-sidebar-primary hover:bg-sidebar-primary/90" : "border-white/20 text-white hover:bg-white/10"}`}
        >
          {isActive ? "Active" : "Select"}
        </Button>
      </div>
    </div>
  );
};