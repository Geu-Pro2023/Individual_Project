import { useState, useEffect } from "react";
import { CheckCircle, UserPlus, RefreshCw, AlertCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { verificationAPI, reportsAPI } from "@/services/api";

const getTimeAgo = (date: string) => {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  return `${diffDays} days ago`;
};

export const ActivityFeed = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const [verifications, reports] = await Promise.all([
        verificationAPI.getLogs(),
        reportsAPI.getAll()
      ]);
      
      const verificationActivities = (verifications.verifications || []).slice(0, 3).map((v: any) => ({
        type: 'verification',
        message: v.success 
          ? `Cow ${v.cow_tag || 'Unknown'} verified successfully`
          : `Verification failed for ${v.cow_tag || 'Unknown'}`,
        timestamp: getTimeAgo(v.created_at),
        icon: v.success ? CheckCircle : XCircle,
        variant: v.success ? 'success' : 'warning',
      }));
      
      const reportActivities = (reports.reports || []).slice(0, 2).map((r: any) => ({
        type: 'report',
        message: `New ${r.report_type} report: ${r.subject}`,
        timestamp: getTimeAgo(r.created_at),
        icon: AlertCircle,
        variant: 'warning',
      }));
      
      const allActivities = [...verificationActivities, ...reportActivities]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5);
      
      setActivities(allActivities);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No recent activity</p>
            </div>
          ) : (
            activities.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 pb-4 last:pb-0 border-b last:border-0">
                <div
                  className={`rounded-full p-2 ${
                    activity.variant === "success"
                      ? "bg-success/10 text-success"
                      : activity.variant === "warning"
                      ? "bg-warning/10 text-warning"
                      : activity.variant === "info"
                      ? "bg-info/10 text-info"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  <activity.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium text-foreground">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
