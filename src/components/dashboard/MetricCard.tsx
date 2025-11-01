import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  variant?: "default" | "success" | "warning" | "urgent";
}

export const MetricCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
}: MetricCardProps) => {
  const variantStyles = {
    default: "border-l-4 border-l-primary bg-gradient-to-br from-card to-card/50 hover:from-card/80 hover:to-card",
    success: "border-l-4 border-l-success bg-gradient-to-br from-success/5 to-success/10 hover:from-success/10 hover:to-success/15",
    warning: "border-l-4 border-l-warning bg-gradient-to-br from-warning/5 to-warning/10 hover:from-warning/10 hover:to-warning/15",
    urgent: "border-l-4 border-l-urgent bg-gradient-to-br from-urgent/5 to-urgent/10 hover:from-urgent/10 hover:to-urgent/15",
  };

  const iconStyles = {
    default: "text-primary bg-primary/10 hover:bg-primary/20",
    success: "text-success bg-success/10 hover:bg-success/20",
    warning: "text-warning bg-warning/10 hover:bg-warning/20",
    urgent: "text-urgent bg-urgent/10 hover:bg-urgent/20",
  };

  return (
    <Card className={cn("shadow-card hover:shadow-hover transition-all duration-300 hover:scale-105 cursor-pointer group", variantStyles[variant])}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">{title}</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground group-hover:text-foreground/70 transition-colors">{subtitle}</p>
            )}
            <div className="w-full bg-muted/30 rounded-full h-1 overflow-hidden">
              <div className={`h-full transition-all duration-1000 ${
                variant === 'success' ? 'bg-success w-4/5' :
                variant === 'urgent' ? 'bg-urgent w-2/3' :
                variant === 'warning' ? 'bg-warning w-3/5' :
                'bg-primary w-3/4'
              }`} />
            </div>
          </div>
          <div className={cn("rounded-lg p-3 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6", iconStyles[variant])}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};