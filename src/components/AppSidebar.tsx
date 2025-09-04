import { useState } from "react";
import { Image, Video, Search, BarChart3 } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Logo } from "./Logo";

const tools = [
  { 
    title: "Dashboard", 
    url: "/", 
    icon: BarChart3,
    color: "text-purple-accent"
  },
  { 
    title: "Video Spoofer", 
    url: "/video-spoofer", 
    icon: Video,
    color: "text-purple-accent"
  },
  { 
    title: "Image Spoofer", 
    url: "/image-spoofer", 
    icon: Image,
    color: "text-yellow-accent"
  },
  { 
    title: "Similarity Detector", 
    url: "/similarity-detector", 
    icon: Search,
    color: "text-cyan-accent"
  }
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isCollapsed = state === "collapsed";
  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-sidebar-accent text-sidebar-primary font-medium border-l-4 border-sidebar-primary" 
      : "hover:bg-sidebar-accent/50 text-sidebar-foreground";

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="bg-sidebar border-r border-sidebar-border">
        {/* Logo Section */}
        <div className="p-4 border-b border-sidebar-border">
          <Logo size={isCollapsed ? "sm" : "md"} />
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/80 text-sm font-medium px-4 py-2">
            Tools
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {tools.map((tool) => (
                <SidebarMenuItem key={tool.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={tool.url} end className={getNavCls}>
                      <tool.icon className={`h-5 w-5 ${tool.color}`} />
                      {!isCollapsed && (
                        <span className="ml-3 text-sm font-medium">
                          {tool.title}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}