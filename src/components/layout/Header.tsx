import { useState, useEffect } from "react";
import { Bell, User, Menu, LogOut, Settings, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { GlobalSearch } from "@/components/ui/global-search";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { useTranslation } from "@/lib/translations";
import { useSidebar } from "./Sidebar";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export const Header = () => {
  const { t, currentLang } = useTranslation();
  const { isMobile, setIsMobileOpen } = useSidebar();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [adminUser, setAdminUser] = useState({ name: "Admin User", email: "admin@titweng.com" });
  
  const currentDate = new Date().toLocaleDateString(currentLang === 'ar' ? "ar-SD" : "en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    fetchNotifications();
    fetchUserProfile();
  }, []);

  const fetchNotifications = async () => {
    try {
      // TODO: Replace with actual API call
      const mockNotifications = [
        { id: 1, title: "New cow registered", message: "TW-2025-001-0001 has been registered", time: "2 min ago", read: false },
        { id: 2, title: "Transfer completed", message: "Ownership transfer for TW-2025-001-0002 completed", time: "1 hour ago", read: false },
        { id: 3, title: "Verification pending", message: "3 cows pending verification", time: "3 hours ago", read: true },
      ];
      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const fetchUserProfile = async () => {
    try {
      // TODO: Replace with actual API call to get admin profile
      const token = localStorage.getItem('admin_token');
      if (token) {
        // Mock admin data - replace with actual API call
        setAdminUser({ name: "System Administrator", email: "admin@titweng.ss" });
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const markAsRead = (notificationId: number) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

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
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative transition-all duration-200 hover:scale-110">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white animate-pulse">
                  {unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Notifications</h3>
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                    Mark all read
                  </Button>
                )}
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No notifications
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b cursor-pointer hover:bg-accent/50 transition-colors ${
                      !notification.read ? 'bg-blue-50/50' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{notification.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">{notification.time}</p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="transition-all duration-200 hover:scale-110">
              <User className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-background/95 backdrop-blur-sm">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{adminUser.name}</p>
                <p className="text-xs text-muted-foreground">{adminUser.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="transition-colors hover:bg-accent/50 cursor-pointer"
              onClick={() => navigate('/profile')}
            >
              <UserCircle className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="transition-colors hover:bg-accent/50 cursor-pointer"
              onClick={() => navigate('/settings')}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive transition-colors hover:bg-destructive/10 cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};