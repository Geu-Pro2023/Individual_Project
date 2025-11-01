import { useState, useEffect } from "react";
import { Database, Cpu, Mail, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { systemAPI } from "@/services/api";
import { useTranslation } from "@/lib/translations";

export const SystemStatus = () => {
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [emailStatus, setEmailStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    checkSystemHealth();
  }, []);

  const checkSystemHealth = async () => {
    try {
      const [health, email] = await Promise.all([
        systemAPI.healthCheck(),
        systemAPI.testEmailConfig().catch(() => ({ status: 'error' }))
      ]);
      setHealthStatus(health);
      setEmailStatus(email);
    } catch (error) {
      console.error('System health check failed:', error);
      setHealthStatus({ status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'success':
      case 'operational':
        return 'bg-success';
      case 'warning':
        return 'bg-warning';
      case 'error':
      case 'failed':
        return 'bg-destructive';
      default:
        return 'bg-muted';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'success':
      case 'operational':
        return t('healthy');
      case 'warning':
        return t('warning');
      case 'error':
      case 'failed':
        return t('error');
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>{t('systemStatus')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const statusItems = [
    {
      name: t('databaseStatus'),
      status: healthStatus?.database_status || 'unknown',
      icon: Database,
      message: healthStatus?.database_message || 'Checking connection...',
    },
    {
      name: t('apiStatus'),
      status: healthStatus?.status || 'unknown',
      icon: Cpu,
      message: healthStatus?.message || 'Checking server status...',
    },
    {
      name: 'Email Service',
      status: emailStatus?.status || 'unknown',
      icon: Mail,
      message: emailStatus?.message || 'Checking email configuration...',
    },
    {
      name: 'ML Model',
      status: healthStatus?.ml_status || 'operational',
      icon: MessageSquare,
      message: 'Nose print verification service',
    },
  ];

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>{t('systemStatus')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {statusItems.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <item.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-48">{item.message}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${getStatusColor(item.status)} ${item.status === 'healthy' || item.status === 'success' || item.status === 'operational' ? 'animate-pulse' : ''}`} />
                <span className={`text-xs font-medium ${
                  item.status === 'healthy' || item.status === 'success' || item.status === 'operational' ? 'text-success' :
                  item.status === 'warning' ? 'text-warning' :
                  item.status === 'error' || item.status === 'failed' ? 'text-destructive' :
                  'text-muted-foreground'
                }`}>
                  {getStatusText(item.status)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
