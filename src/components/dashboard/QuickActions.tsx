import { Link } from "react-router-dom";
import { Beef, FileCheck, Users, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/lib/translations";



export const QuickActions = () => {
  const { t } = useTranslation();

  const actions = [
    {
      title: t('addNewCattle'),
      description: t('registerNewCattle'),
      icon: Beef,
      href: "/register",
      variant: "default" as const,
    },
    {
      title: t('verifyIdentity'),
      description: t('verificationCenter'),
      icon: FileCheck,
      href: "/verify",
      variant: "secondary" as const,
    },
    {
      title: t('viewAllCattle'),
      description: t('cattleManagement'),
      icon: Users,
      href: "/cattle",
      variant: "secondary" as const,
    },
    {
      title: t('generateReport'),
      description: t('reports'),
      icon: AlertCircle,
      href: "/reports",
      variant: "secondary" as const,
    },
  ];

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>{t('quickActions')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {actions.map((action) => (
            <Link key={action.title} to={action.href}>
              <Button
                variant={action.variant}
                className="h-auto w-full flex-col gap-2 p-6 hover:scale-105 transition-transform"
              >
                <action.icon className="h-8 w-8" />
                <div className="text-center">
                  <div className="font-semibold">{action.title}</div>
                  <div className="text-xs opacity-80 font-normal mt-1">
                    {action.description}
                  </div>
                </div>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
