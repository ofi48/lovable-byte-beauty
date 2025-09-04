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
    <Card 
      className={`p-6 cursor-pointer transition-all duration-300 border-2 ${
        isActive 
          ? 'border-sidebar-primary bg-sidebar-accent shadow-glow' 
          : 'border-border hover:border-sidebar-primary/50 bg-card hover:shadow-card'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${gradientClass}`}>
          <Icon className={`h-8 w-8 ${iconColor}`} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-card-foreground mb-1">
            {title}
          </h3>
          <p className="text-muted-foreground text-sm">
            {description}
          </p>
        </div>
        <Button 
          variant={isActive ? "default" : "outline"}
          size="sm"
          className={isActive ? "bg-sidebar-primary hover:bg-sidebar-primary/90" : ""}
        >
          {isActive ? "Active" : "Select"}
        </Button>
      </div>
    </Card>
  );
};