import { Bell, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { GlobalSearch } from "@/components/ui/global-search";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { useTranslation } from "@/lib/translations";
import { useSidebar } from "./Sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Header = () => {
  const { t, currentLang } = useTranslation();
  const { isMobile, setIsMobileOpen } = useSidebar();
  const currentDate = new Date().toLocaleDateString(currentLang === 'ar' ? "ar-SD" : "en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/50 bg-gradient-to-r from-background/95 to-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 shadow-sm px-3 sm:px-6">
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Mobile Menu Button */}
        {isMobile && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsMobileOpen(true)}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <h2 className="text-base sm:text-lg font-semibold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent truncate">
          {t('dashboard')}
        </h2>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 lg:gap-4">
        <span className="text-xs sm:text-sm text-muted-foreground hidden xl:block font-medium">{currentDate}</span>
        
        <div className="hidden sm:block">
          <GlobalSearch />
        </div>
        <LanguageToggle />
        <div className="hidden sm:block">
          <ThemeToggle />
        </div>
        
        <Button variant="ghost" size="icon" className="relative transition-all duration-200 hover:scale-110">
          <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white animate-pulse">
            3
          </span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="transition-all duration-200 hover:scale-110">
              <User className="h-4 w-4 sm:h-5 sm:w-5" />
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
  );
};