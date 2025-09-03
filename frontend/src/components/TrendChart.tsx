import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp } from "lucide-react";

interface ChartData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

interface TrendChartProps {
  data: ChartData[];
  title: string;
  type: 'line' | 'bar';
}

export const TrendChart = ({ data, title, type }: TrendChartProps) => {
  const maxValue = Math.max(
    ...data.flatMap(item => [item.revenue, item.expenses, item.profit])
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD', 
      minimumFractionDigits: 0 
    }).format(value);
  };

  return (
    <Card className="shadow-2xl border-border bg-card backdrop-blur-xl hover:shadow-lg transition-all duration-500">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            {type === 'line' ? <TrendingUp className="h-4 w-4" /> : <BarChart3 className="h-4 w-4" />}
          </div>
          <span className="text-foreground">{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">{item.month}</span>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>R: {formatCurrency(item.revenue)}</span>
                  <span>E: {formatCurrency(item.expenses)}</span>
                  <span>P: {formatCurrency(item.profit)}</span>
                </div>
              </div>
              
              <div className="relative h-8 bg-muted rounded-lg overflow-hidden">
                {/* Revenue bar */}
                <div 
                  className="absolute left-0 top-0 h-full bg-green-500/80 transition-all duration-500 ease-out"
                  style={{ 
                    width: `${(item.revenue / maxValue) * 100}%`,
                    animationDelay: `${index * 100}ms`
                  }}
                />
                
                {/* Expenses bar */}
                <div className="absolute left-0 top-0 h-full bg-red-500/80 transition-all duration-500 ease-out"
                  style={{ 
                    width: `${(item.expenses / maxValue) * 100}%`,
                    animationDelay: `${index * 100 + 200}ms`
                  }}
                />
                
                {/* Profit bar */}
                <div 
                  className="absolute left-0 top-0 h-full bg-primary/80 transition-all duration-500 ease-out"
                  style={{ 
                    width: `${(item.profit / maxValue) * 100}%`,
                    animationDelay: `${index * 100 + 400}ms`
                  }}
                />
              </div>
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span>Revenue</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <span>Expenses</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span>Profit</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
