import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, DollarSign, Target, TrendingUp, Clock, BarChart3 } from "lucide-react";

interface Alert {
  id: string;
  type: 'budget' | 'risk' | 'revenue' | 'threshold' | 'trend';
  department: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
  timestamp: string;
  value?: number;
  threshold?: number;
  trend?: 'up' | 'down' | 'stable';
  actionRequired?: boolean;
}

interface AlertsPanelProps {
  alerts: Alert[];
}

export const AlertsPanel = ({ alerts }: AlertsPanelProps) => {
  // Filter to show only high severity alerts
  const highPriorityAlerts = alerts.filter(alert => alert.severity === 'high');
  
  // Sort high priority alerts by action required first, then by timestamp
  const sortedAlerts = highPriorityAlerts.sort((a, b) => {
    // First priority: Action required
    if (a.actionRequired && !b.actionRequired) return -1;
    if (b.actionRequired && !a.actionRequired) return 1;
    
    return 0;
  });

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'budget':
        return <Target className="h-4 w-4" />;
      case 'risk':
        return <AlertTriangle className="h-4 w-4" />;
      case 'revenue':
        return <TrendingUp className="h-4 w-4" />;
      case 'threshold':
        return <Target className="h-4 w-4" />;
      case 'trend':
        return <BarChart3 className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'high':
        return 'bg-destructive text-destructive-foreground hover:bg-destructive/90';
      case 'medium':
        return 'bg-yellow-500 text-white hover:bg-yellow-600';
      case 'low':
        return 'bg-green-500 text-white hover:bg-green-600';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <Card className="shadow-2xl border-border bg-card backdrop-blur-xl hover:shadow-lg transition-all duration-500">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-lg">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-foreground">High Priority Alerts</span>
                <span className="text-sm text-muted-foreground">Critical issues requiring attention</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="destructive" className="text-sm px-3 py-1 font-semibold">
                {highPriorityAlerts.length} Critical
              </Badge>
              {highPriorityAlerts.filter(a => a.actionRequired).length > 0 && (
                <Badge variant="outline" className="text-sm px-3 py-1 border-primary/50 text-primary font-semibold">
                  {highPriorityAlerts.filter(a => a.actionRequired).length} Action Required
                </Badge>
              )}
            </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {highPriorityAlerts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center dark:from-green-900/20 dark:to-emerald-900/20 shadow-lg">
              <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-lg font-semibold text-foreground mb-2">No Critical Alerts</p>
            <p className="text-sm">All systems operating normally</p>
            <div className="mt-4 px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200/50">
              <span className="text-xs text-green-700 dark:text-green-300">✓ Dashboard Status: Optimal</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-3 p-4">
            {sortedAlerts.map((alert, index) => (
                                   <div
                       key={alert.id}
                       className={`p-4 rounded-xl bg-card border border-border transition-all duration-300 animate-fade-in-up relative overflow-hidden group hover:shadow-md transition-all duration-300`}
                       style={{ animationDelay: `${index * 50}ms` }}
                     >
                       {/* Priority indicator bar */}
                       <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-xl ${
                         alert.severity === 'high' ? 'bg-destructive' 
                         : alert.severity === 'medium' ? 'bg-yellow-600' 
                         : 'bg-green-600'
                       }`} />
                       
                       {/* Priority badge */}
                       {alert.severity === 'high' && (
                         <div className="absolute top-3 right-3">
                           <div className="px-2 py-1 rounded-full bg-destructive text-white text-xs font-semibold shadow-sm">
                             CRITICAL
                           </div>
                         </div>
                       )}
                       {/* Department and icon header */}
                       <div className="flex items-start justify-between mb-3">
                         <div className="flex items-center gap-3">
                           <div className={`p-2 rounded-lg ${
                             alert.severity === 'high' ? 'bg-destructive/10 text-destructive border border-destructive/20' :
                             alert.severity === 'medium' ? 'bg-yellow-500/10 text-yellow-700 border border-yellow-500/20 dark:bg-yellow-500/20 dark:text-yellow-300 dark:border-yellow-500/30' :
                             'bg-green-500/10 text-green-700 border border-green-500/20 dark:bg-green-500/20 dark:text-green-300 dark:border-green-500/30'
                           }`}>
                             {getAlertIcon(alert.type)}
                           </div>
                           <div className="flex flex-col">
                             <span className="font-semibold text-foreground text-sm">
                               {alert.department}
                             </span>
                             {alert.actionRequired && (
                               <Badge variant="outline" className="text-xs px-2 py-0 mt-1 w-fit border-primary text-primary bg-primary/5">
                                 Action Required
                               </Badge>
                             )}
                           </div>
                         </div>
                         <Badge className={`${
                           alert.severity === 'high' ? 'bg-destructive hover:bg-destructive/90 text-white' :
                           alert.severity === 'medium' ? 'bg-yellow-600 hover:bg-yellow-700 text-white' :
                           'bg-green-600 hover:bg-green-700 text-white'
                         } border-0 shadow-sm`}>
                           {alert.severity}
                         </Badge>
                       </div>
                
                {/* Alert message */}
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
                  {alert.message}
                </p>
                
                                       {/* Alert details and timestamp */}
                       <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3 text-xs">
                           {alert.value !== undefined && (
                             <div className="flex items-center gap-1 bg-muted/50 border border-border/50 px-2 py-1 rounded-md">
                               <span className="text-muted-foreground">Value:</span>
                               <span className="font-semibold text-foreground">
                                 {new Intl.NumberFormat('en-US', { 
                                   style: 'currency', 
                                   currency: 'USD', 
                                   minimumFractionDigits: 0 
                                 }).format(alert.value)}
                               </span>
                             </div>
                           )}
                           {alert.threshold !== undefined && (
                             <div className="flex items-center gap-1 bg-muted/50 border border-border/50 px-2 py-1 rounded-md">
                               <span className="text-muted-foreground">Threshold:</span>
                               <span className="font-semibold text-foreground">
                                 {new Intl.NumberFormat('en-US', { 
                                   style: 'currency', 
                                   currency: 'USD', 
                                   minimumFractionDigits: 0 
                                 }).format(alert.threshold)}
                               </span>
                             </div>
                           )}
                         </div>
                         
                         <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 border border-border/50 px-2 py-1 rounded-md">
                           <Clock className="h-3 w-3" />
                           <span className="font-medium">{alert.timestamp}</span>
                         </div>
                       </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
