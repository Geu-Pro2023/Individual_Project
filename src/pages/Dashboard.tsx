import { useEffect, useState } from "react";
import { Beef, Users, CheckCircle, AlertCircle } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { SystemStatus } from "@/components/dashboard/SystemStatus";
import { dashboardAPI } from "@/services/api";
import { toast } from "sonner";
import { useTranslation } from "@/lib/translations";

const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await dashboardAPI.getStats();
        setStats(data);
      } catch (error) {
        toast.error('Failed to load dashboard statistics');
        console.error('Dashboard stats error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('dashboardOverview')}</h1>
          <p className="text-muted-foreground mt-1">{t('loading')}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">{t('dashboardOverview')}</h1>
        <p className="text-muted-foreground mt-1">
          {t('welcomeMessage')}
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title={t('totalCowsRegistered')}
          value={stats?.total_cows?.toString() || '0'}
          subtitle={stats?.new_cows_this_month ? `+${stats.new_cows_this_month} this month` : 'No new registrations'}
          icon={Beef}
          variant="default"
        />
        <MetricCard
          title={t('totalOwners')}
          value={stats?.total_owners?.toString() || '0'}
          subtitle={stats?.new_owners_this_month ? `+${stats.new_owners_this_month} this month` : 'No new owners'}
          icon={Users}
          variant="success"
        />
        <MetricCard
          title={t('dailyVerifications')}
          value={stats?.daily_verifications?.toString() || '0'}
          subtitle={stats?.verification_success_rate ? `${stats.verification_success_rate}% success rate` : 'No verifications'}
          icon={CheckCircle}
          variant="success"
        />
        <MetricCard
          title={t('pendingReports')}
          value={stats?.pending_reports?.toString() || '0'}
          subtitle={stats?.urgent_reports ? `${stats.urgent_reports} urgent` : 'No urgent reports'}
          icon={AlertCircle}
          variant="urgent"
        />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Activity Feed and System Status */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        <ActivityFeed />
        <SystemStatus />
      </div>
    </div>
  );
};

export default Dashboard;
