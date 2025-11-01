import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Database, Mail, CheckCircle, XCircle, Loader2, Brain } from "lucide-react";
import { systemAPI } from "@/services/api";
import { toast } from "sonner";

const System = () => {
  const [testEmail, setTestEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [dbLoading, setDbLoading] = useState(false);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [emailConfigStatus, setEmailConfigStatus] = useState<any>(null);
  const [mlStatus, setMlStatus] = useState<any>(null);

  const checkHealth = async () => {
    try {
      const result = await systemAPI.healthCheck();
      setHealthStatus(result);
      toast.success('Health check completed');
    } catch (error: any) {
      toast.error('Health check failed');
      setHealthStatus({ status: 'error', message: error.message });
    }
  };

  const checkEmailConfig = async () => {
    try {
      const result = await systemAPI.testEmailConfig();
      setEmailConfigStatus(result);
      toast.success('Email configuration checked');
    } catch (error: any) {
      toast.error('Email configuration check failed');
      setEmailConfigStatus({ status: 'error', message: error.message });
    }
  };

  const sendTestEmail = async () => {
    if (!testEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    setEmailLoading(true);
    try {
      await systemAPI.sendTestEmail(testEmail);
      toast.success('Test email sent successfully');
      setTestEmail('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send test email');
    } finally {
      setEmailLoading(false);
    }
  };

  const setupDatabase = async () => {
    setDbLoading(true);
    try {
      await systemAPI.setupDatabase();
      toast.success('Database setup completed');
    } catch (error: any) {
      toast.error(error.message || 'Database setup failed');
    } finally {
      setDbLoading(false);
    }
  };

  const testMLModels = async () => {
    try {
      const result = await systemAPI.testMLModels();
      setMlStatus(result);
      toast.success('ML models tested successfully');
    } catch (error: any) {
      toast.error('ML model test failed');
      setMlStatus({ status: 'error', message: error.message });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">System Tools</h1>
        <p className="text-muted-foreground mt-1">
          System administration and maintenance tools
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Health Check */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={checkHealth} className="w-full">
              Check System Health
            </Button>
            {healthStatus && (
              <div className="p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-2">
                  {healthStatus.status === 'healthy' ? (
                    <CheckCircle className="h-4 w-4 text-success" />
                  ) : (
                    <XCircle className="h-4 w-4 text-destructive" />
                  )}
                  <Badge variant={healthStatus.status === 'healthy' ? 'default' : 'destructive'}>
                    {healthStatus.status}
                  </Badge>
                </div>
                {healthStatus.message && (
                  <p className="text-sm text-muted-foreground mt-2">{healthStatus.message}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Database Setup */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Initialize or reset the database schema
            </p>
            <Button 
              onClick={setupDatabase} 
              disabled={dbLoading}
              className="w-full"
              variant="outline"
            >
              {dbLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Setup Database
            </Button>
          </CardContent>
        </Card>

        {/* Email Configuration */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={checkEmailConfig} variant="outline" className="w-full">
              Test Email Config
            </Button>
            {emailConfigStatus && (
              <div className="p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-2">
                  {emailConfigStatus.status === 'success' ? (
                    <CheckCircle className="h-4 w-4 text-success" />
                  ) : (
                    <XCircle className="h-4 w-4 text-destructive" />
                  )}
                  <Badge variant={emailConfigStatus.status === 'success' ? 'default' : 'destructive'}>
                    {emailConfigStatus.status}
                  </Badge>
                </div>
                {emailConfigStatus.message && (
                  <p className="text-sm text-muted-foreground mt-2">{emailConfigStatus.message}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Send Test Email */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Send Test Email
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="testEmail">Email Address</Label>
              <Input
                id="testEmail"
                type="email"
                placeholder="test@example.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
            </div>
            <Button 
              onClick={sendTestEmail} 
              disabled={emailLoading}
              className="w-full"
            >
              {emailLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Test Email
            </Button>
          </CardContent>
        </Card>

        {/* ML Models Test */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              ML Models
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testMLModels} variant="outline" className="w-full">
              Test ML Models
            </Button>
            {mlStatus && (
              <div className="p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-2">
                  {mlStatus.status === 'success' ? (
                    <CheckCircle className="h-4 w-4 text-success" />
                  ) : (
                    <XCircle className="h-4 w-4 text-destructive" />
                  )}
                  <Badge variant={mlStatus.status === 'success' ? 'default' : 'destructive'}>
                    {mlStatus.status}
                  </Badge>
                </div>
                {mlStatus.message && (
                  <p className="text-sm text-muted-foreground mt-2">{mlStatus.message}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default System;