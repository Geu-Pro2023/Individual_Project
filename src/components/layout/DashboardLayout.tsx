import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { GlobalSearch } from "@/components/ui/global-search";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { NotificationSystem } from "@/components/ui/notification-system";
import { Button } from "@/components/ui/button";
import { Bell, User, Menu } from "lucide-react";
import { useTranslation } from "@/lib/translations";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { t, currentLang } = useTranslation();
  const currentDate = new Date().toLocaleDateString(currentLang === 'ar' ? "ar-SD" : "en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  
  return (
    <div className="h-screen bg-gradient-to-br from-background via-background to-background/95 overflow-hidden">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}
      
      <Sidebar 
        isMobileOpen={isMobileMenuOpen} 
        setIsMobileOpen={setIsMobileMenuOpen}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      <div className={`h-full flex flex-col transition-all duration-300 ${
        window.innerWidth >= 1024 
          ? (isCollapsed ? 'ml-16' : 'ml-64')
          : 'ml-0'
      }`}>
        {/* Enhanced Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/50 bg-gradient-to-r from-background/95 to-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 shadow-sm px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <h2 className="text-lg font-semibold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              {t('dashboard')}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden xl:block font-medium">{currentDate}</span>
            
            <div className="hidden sm:block">
              <GlobalSearch />
            </div>
            <LanguageToggle />
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
            
            <Button variant="ghost" size="icon" className="relative transition-all duration-200 hover:scale-110">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white animate-pulse">
                3
              </span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="transition-all duration-200 hover:scale-110">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-background/95 backdrop-blur-sm">
                <DropdownMenuLabel>Admin User</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="transition-colors hover:bg-accent/50">Profile</DropdownMenuItem>
                <DropdownMenuItem className="transition-colors hover:bg-accent/50">Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive transition-colors hover:bg-destructive/10">Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-transparent to-muted/20">
          <div className="animate-in fade-in-0 duration-500">
            {children}
          </div>
        </main>
      </div>
      <FloatingActionButton />
      <NotificationSystem />
    </div>
  );
};