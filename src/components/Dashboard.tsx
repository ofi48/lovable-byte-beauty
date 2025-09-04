import { useState } from "react";
import { Video, Image, Search } from "lucide-react";
import { FunctionCard } from "./FunctionCard";
import { SettingsPanel } from "./SettingsPanel";

type ActiveFunction = 'video-spoofer' | 'image-spoofer' | 'similarity-detector' | null;

const functions = [
  {
    id: 'video-spoofer' as const,
    title: 'Video Spoofer',
    description: 'Advanced video manipulation and deepfake detection tools',
    icon: Video,
    gradientClass: 'from-pink-accent/20 to-pink-accent/40',
    iconColor: 'text-pink-accent'
  },
  {
    id: 'image-spoofer' as const,
    title: 'Image Spoofer',
    description: 'Sophisticated image analysis and manipulation detection',
    icon: Image,
    gradientClass: 'from-yellow-accent/20 to-yellow-accent/40',
    iconColor: 'text-yellow-accent'
  },
  {
    id: 'similarity-detector' as const,
    title: 'Similarity Detector',
    description: 'AI-powered content similarity and duplicate detection',
    icon: Search,
    gradientClass: 'from-cyan-accent/20 to-cyan-accent/40',
    iconColor: 'text-cyan-accent'
  }
];

export const Dashboard = () => {
  const [activeFunction, setActiveFunction] = useState<ActiveFunction>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 h-screen">
        
        {/* Left Side - Functions Dashboard (Section 2) */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              Select and configure your spoofing and detection tools
            </p>
          </div>
          
          <div className="space-y-4">
            {functions.map((func) => (
              <FunctionCard
                key={func.id}
                title={func.title}
                description={func.description}
                icon={func.icon}
                isActive={activeFunction === func.id}
                onClick={() => setActiveFunction(
                  activeFunction === func.id ? null : func.id
                )}
                gradientClass={func.gradientClass}
                iconColor={func.iconColor}
              />
            ))}
          </div>
        </div>

        {/* Right Side - Settings Panel (Section 3) */}
        <div>
          <SettingsPanel activeFunction={activeFunction} />
        </div>
      </div>
    </div>
  );
};