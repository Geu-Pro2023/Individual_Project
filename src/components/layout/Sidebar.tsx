import { useState } from "react";
import { Home, Beef, Users, FileCheck, AlertCircle, BarChart3, FileText, Settings, Database, LogOut, Menu, ChevronLeft, Receipt, UserCheck, Download, Eye, Trash2 } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTranslation } from "@/lib/translations";



interface SidebarProps {
  isMobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
  isCollapsed?: boolean;
  setIsCollapsed?: (collapsed: boolean) => void;
}

export const Sidebar = ({ 
  isMobileOpen = false, 
  setIsMobileOpen,
  isCollapsed = false,
  setIsCollapsed
}: SidebarProps = {}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isMobile = window.innerWidth < 1024;

  const navigationCategories = [
    {
      title: "Dashboard",
      items: [
        { name: "Dashboard Stats", href: "/", icon: Home },
      ]
    },
    {
      title: "Cattle Management",
      items: [
        { name: "Register Cow", href: "/register", icon: Beef },
        { name: "Verify Cow", href: "/verify", icon: FileCheck },
        { name: "Update Cow", href: "/update-cow", icon: Settings },
        { name: "Delete Cow", href: "/delete-cow", icon: Trash2 },
        { name: "Download Cow Receipt", href: "/download-receipt", icon: Download },
        { name: "View Cow Facial Image", href: "/view-cow-face", icon: Eye },
        { name: "Transfer Cow Ownership", href: "/cattle", icon: Users },
      ]
    },
    {
      title: "Report",
      items: [
        { name: "Reply to Report", href: "/reports", icon: AlertCircle },
        { name: "Get all Verification log", href: "/logs", icon: FileText },
      ]
    },
    {
      title: "System",
      items: [
        { name: "System Tools", href: "/system", icon: Database },
        { name: "Settings", href: "/settings", icon: Settings },
      ]
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <aside className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-sidebar to-sidebar/95 backdrop-blur-sm border-r border-sidebar-border/50 transition-all duration-300 z-50 shadow-2xl ${
      isMobile 
        ? (isMobileOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full')
        : (isCollapsed ? 'w-16' : 'w-64')
    }`}>
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-20 items-center justify-center border-b border-sidebar-border/30 px-3 group relative bg-gradient-to-r from-transparent to-sidebar-accent/10">
          <div className="flex items-center justify-center flex-1">
            <img 
              src="/logo.png" 
              alt="Titweng" 
              className={`transition-all duration-300 group-hover:scale-105 ${isCollapsed ? 'h-10 w-auto' : 'h-16 w-auto'}`}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling.style.display = 'block';
              }}
            />
            {!isCollapsed && (
              <h1 className="text-lg font-bold text-sidebar-foreground hidden group-hover:animate-pulse ml-2">Titweng</h1>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed && setIsCollapsed(!isCollapsed)}
            className="absolute right-3 text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {isCollapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {navigationCategories.map((category, categoryIndex) => (
            <div key={category.title} className={categoryIndex > 0 ? "mt-6" : ""}>
              {(!isCollapsed || isMobile) && (
                <h3 className="mb-2 px-3 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">
                  {category.title}
                </h3>
              )}
              <div className="space-y-1">
                {category.items.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    end={item.href === "/"}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group/item",
                        isActive
                          ? "bg-gradient-to-r from-sidebar-primary to-sidebar-primary/80 text-sidebar-primary-foreground shadow-lg"
                          : "text-sidebar-foreground hover:bg-gradient-to-r hover:from-sidebar-accent hover:to-sidebar-accent/80 hover:text-sidebar-accent-foreground hover:shadow-md",
                        isCollapsed && "justify-center"
                      )
                    }
                    title={!isMobile && isCollapsed ? item.name : undefined}
                  onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
                  >
                    <item.icon className="h-5 w-5 transition-transform duration-200 group-hover/item:scale-110 group-hover/item:rotate-3" />
                    {(!isCollapsed || isMobile) && item.name}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-4 space-y-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout}
            className={cn(
              "w-full text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              !isMobile && isCollapsed ? "justify-center px-2" : "justify-start"
            )}
            title={!isMobile && isCollapsed ? t('logout') : undefined}
          >
            <LogOut className="h-4 w-4" />
            {(!isCollapsed || isMobile) && <span className="ml-2">{t('logout')}</span>}
          </Button>
          {(!isCollapsed || isMobile) && (
            <p className="text-xs text-sidebar-foreground/60 text-center">
              Titweng Admin v1.0
            </p>
          )}
        </div>
      </div>
    </aside>
  );
};