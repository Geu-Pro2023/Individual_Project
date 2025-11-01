import { useState, useEffect } from "react";
import { Bell, BellOff, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface NotificationSettings {
  enabled: boolean;
  newRegistrations: boolean;
  verificationAlerts: boolean;
  reportAlerts: boolean;
  systemAlerts: boolean;
}

export const PushNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: false,
    newRegistrations: true,
    verificationAlerts: true,
    reportAlerts: true,
    systemAlerts: false,
  });

  useEffect(() => {
    // Check current notification permission
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }

    // Load settings from localStorage
    const savedSettings = localStorage.getItem('notificationSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    // Set up service worker for push notifications
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      registerServiceWorker();
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  };

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('This browser does not support notifications');
      return;
    }

    const permission = await Notification.requestPermission();
    setPermission(permission);

    if (permission === 'granted') {
      toast.success('Notifications enabled successfully');
      setSettings(prev => ({ ...prev, enabled: true }));
      
      // Show welcome notification
      showNotification('Notifications Enabled', 'You will now receive real-time updates');
    } else {
      toast.error('Notification permission denied');
    }
  };

  const showNotification = (title: string, body: string, options?: NotificationOptions) => {
    if (permission === 'granted' && settings.enabled) {
      new Notification(title, {
        body,
        icon: '/logo.png',
        badge: '/logo.png',
        tag: 'cattle-management',
        ...options,
      });
    }
  };

  const updateSettings = (key: keyof NotificationSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
  };

  const testNotification = () => {
    showNotification(
      'Test Notification',
      'This is a test notification from Cattle Management System',
      {
        actions: [
          { action: 'view', title: 'View Details' },
          { action: 'dismiss', title: 'Dismiss' }
        ]
      }
    );
  };

  // Simulate real-time notifications
  useEffect(() => {
    if (!settings.enabled) return;

    const intervals: NodeJS.Timeout[] = [];

    // New registration notifications
    if (settings.newRegistrations) {
      const interval = setInterval(() => {
        if (Math.random() > 0.8) {
          showNotification(
            'New Cattle Registration',
            'A new cattle has been registered in the system'
          );
        }
      }, 30000);
      intervals.push(interval);
    }

    // Verification alerts
    if (settings.verificationAlerts) {
      const interval = setInterval(() => {
        if (Math.random() > 0.9) {
          showNotification(
            'Verification Alert',
            'Multiple verification attempts detected for cattle TW-2025-XXX-0001'
          );
        }
      }, 45000);
      intervals.push(interval);
    }

    // Report alerts
    if (settings.reportAlerts) {
      const interval = setInterval(() => {
        if (Math.random() > 0.85) {
          showNotification(
            'New Report Submitted',
            'A new theft report has been submitted and requires attention'
          );
        }
      }, 60000);
      intervals.push(interval);
    }

    return () => {
      intervals.forEach(clearInterval);
    };
  }, [settings]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Push Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {permission === 'default' && (
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-3">
              Enable notifications to receive real-time updates about cattle registrations, 
              verifications, and reports.
            </p>
            <Button onClick={requestPermission} className="w-full">
              <Bell className="mr-2 h-4 w-4" />
              Enable Notifications
            </Button>
          </div>
        )}

        {permission === 'denied' && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <BellOff className="h-4 w-4 text-destructive" />
              <p className="text-sm font-medium text-destructive">Notifications Blocked</p>
            </div>
            <p className="text-sm text-destructive/80">
              Notifications are blocked. Please enable them in your browser settings.
            </p>
          </div>
        )}

        {permission === 'granted' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications-enabled">Enable Notifications</Label>
              <Switch
                id="notifications-enabled"
                checked={settings.enabled}
                onCheckedChange={(checked) => updateSettings('enabled', checked)}
              />
            </div>

            {settings.enabled && (
              <div className="space-y-3 pl-4 border-l-2 border-primary/20">
                <div className="flex items-center justify-between">
                  <Label htmlFor="new-registrations" className="text-sm">
                    New Registrations
                  </Label>
                  <Switch
                    id="new-registrations"
                    checked={settings.newRegistrations}
                    onCheckedChange={(checked) => updateSettings('newRegistrations', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="verification-alerts" className="text-sm">
                    Verification Alerts
                  </Label>
                  <Switch
                    id="verification-alerts"
                    checked={settings.verificationAlerts}
                    onCheckedChange={(checked) => updateSettings('verificationAlerts', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="report-alerts" className="text-sm">
                    Report Alerts
                  </Label>
                  <Switch
                    id="report-alerts"
                    checked={settings.reportAlerts}
                    onCheckedChange={(checked) => updateSettings('reportAlerts', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="system-alerts" className="text-sm">
                    System Alerts
                  </Label>
                  <Switch
                    id="system-alerts"
                    checked={settings.systemAlerts}
                    onCheckedChange={(checked) => updateSettings('systemAlerts', checked)}
                  />
                </div>
              </div>
            )}

            <Button
              variant="outline"
              onClick={testNotification}
              disabled={!settings.enabled}
              className="w-full"
            >
              <Settings className="mr-2 h-4 w-4" />
              Test Notification
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};