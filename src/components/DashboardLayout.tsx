import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { ReactNode } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <main className="flex-1">
          {/* Header with Sidebar Trigger */}
          <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-card">
            <SidebarTrigger className="text-foreground hover:bg-accent hover:text-accent-foreground" />
            <div className="text-sm text-muted-foreground">
              Advanced Spoofing & Detection Platform
            </div>
          </header>
          
          {/* Main Content */}
          <div className="flex-1">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};