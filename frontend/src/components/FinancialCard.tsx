import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

interface FinancialCardProps {
  title: string;
  value: number | string;
  change?: number;
  trend?: 'up' | 'down';
  risk?: 'High' | 'Low';
  budgetAllocation?: number;
  budgetUtilization?: number;
  icon?: React.ReactNode;
}

export const FinancialCard = ({ 
  title, 
  value, 
  change, 
  trend, 
  risk, 
  budgetAllocation,
  budgetUtilization,
  icon 
}: FinancialCardProps) => {
  const formatValue = (val: number | string) => {
    if (typeof val === 'number') {
      return new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD', 
        minimumFractionDigits: 0 
      }).format(val);
    }
    return val;
  };

  return (
    <Card className="shadow-2xl border-border bg-card backdrop-blur-xl hover:shadow-lg transition-all duration-500 group h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          {title}
        </CardTitle>
        {icon && (
          <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20 shadow-sm group-hover:scale-110 transition-all duration-300">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="text-2xl font-black text-foreground mb-2">
          {formatValue(value)}
        </div>
        
        <div className="mt-auto">
          {change !== undefined && (
            <div className="flex items-center pt-2 mb-2">
              {trend === 'up' ? (
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400 mr-2 animate-pulse" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive mr-2 animate-pulse" />
              )}
              <span className={`text-sm font-bold ${
                trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-destructive'
              }`}>
                {change > 0 ? '+' : ''}{change.toFixed(1)}%
              </span>
            </div>
          )}
          
          {budgetAllocation && budgetUtilization !== undefined && (
            <div className="pt-2 mb-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Budget Utilization</span>
                <span className="font-medium">{budgetUtilization.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    budgetUtilization > 100 ? 'bg-destructive' : 
                    budgetUtilization > 80 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(budgetAllocation)} allocated
              </div>
            </div>
          )}
          
          {risk && (
            <div className="flex items-center pt-2">
              <Badge 
                variant={risk === 'High' ? 'destructive' : 'secondary'}
                className="text-xs px-3 py-1 font-semibold"
              >
                {risk === 'High' && <AlertTriangle className="h-3 w-3 mr-1" />}
                {risk} Risk
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
