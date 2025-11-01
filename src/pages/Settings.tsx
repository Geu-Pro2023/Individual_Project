import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Database, Mail, MessageSquare, Cpu, LogOut } from "lucide-react";
import { PushNotifications } from "@/components/ui/push-notifications";
import { systemAPI, dashboardAPI } from "@/services/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [emailStatus, setEmailStatus] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSystemInfo();
  }, []);

  const fetchSystemInfo = async () => {
    try {
      const [health, email, dashStats] = await Promise.all([
        systemAPI.healthCheck(),
        systemAPI.testEmailConfig().catch(() => ({ status: 'error' })),
        dashboardAPI.getStats()
      ]);
      setHealthStatus(health);
      setEmailStatus(email);
      setStats(dashStats);
    } catch (error) {
      console.error('Failed to fetch system info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const testEmailConnection = async () => {
    try {
      const result = await systemAPI.testEmailConfig();
      setEmailStatus(result);
      toast.success('Email connection tested');
    } catch (error: any) {
      toast.error('Email test failed');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">System Settings</h1>
          <p className="text-muted-foreground mt-1">Loading system information...</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">System Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure system parameters and integrations for South Sudan
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Cpu className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>ML Model Configuration</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Nose print verification parameters
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="threshold">Similarity Threshold (%)</Label>
              <Input id="threshold" type="number" defaultValue="85" min="0" max="100" />
            </div>
            <Button className="w-full">Update Settings</Button>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Email Configuration</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Email service settings
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4">
              <span className="text-sm font-medium">Connection Status</span>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${
                  emailStatus?.status === 'success' ? 'bg-success animate-pulse' : 'bg-destructive'
                }`} />
                <span className={`text-xs font-medium ${
                  emailStatus?.status === 'success' ? 'text-success' : 'text-destructive'
                }`}>
                  {emailStatus?.status === 'success' ? 'Connected' : 'Error'}
                </span>
              </div>
            </div>
            <Button variant="secondary" className="w-full" onClick={testEmailConnection}>Test Connection</Button>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>SMS Configuration</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  SMS service settings
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4">
              <span className="text-sm font-medium">Connection Status</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-warning" />
                <span className="text-xs font-medium text-warning">Not Configured</span>
              </div>
            </div>
            <Button variant="secondary" className="w-full" disabled>Configure SMS</Button>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Database className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Database Status</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Database connection info
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Cattle</span>
                <span className="font-medium">{stats?.total_cows?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Database Status</span>
                <span className={`font-medium ${
                  healthStatus?.database_status === 'healthy' ? 'text-success' : 'text-destructive'
                }`}>
                  {healthStatus?.database_status === 'healthy' ? 'Connected' : 'Error'}
                </span>
              </div>
            </div>
            <Button variant="secondary" className="w-full" onClick={() => navigate('/system')}>View Details</Button>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <PushNotifications />
          
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-destructive/10 p-2">
                  <LogOut className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <CardTitle>Admin Session</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage your admin session
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Current Session</p>
                  <p className="text-xs text-muted-foreground">Logged in as Administrator</p>
                </div>
                <Button variant="destructive" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;