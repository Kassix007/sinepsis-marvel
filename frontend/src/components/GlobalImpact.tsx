"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { TreePine, Zap, Bug, Eye, TrendingUp } from "lucide-react";

const impactData = [
  {
    icon: TreePine,
    label: "Groot World Progress",
    value: 73,
    suffix: "%",
    color: "text-groot",
    bgColor: "bg-groot/20"
  },
  {
    icon: Zap,
    label: "Starkledger Departments",
    value: 1247,
    suffix: "",
    color: "text-primary",
    bgColor: "bg-primary/20"
  },
  {
    icon: Bug,
    label: "Spidey Missions This Week", 
    value: 89,
    suffix: "",
    color: "text-spidey-red",
    bgColor: "bg-spidey-red/20"
  },
  {
    icon: Eye,
    label: "Strange Spells Archived",
    value: 456,
    suffix: "",
    color: "text-strange-purple",
    bgColor: "bg-strange-purple/20"
  }
];

const CounterAnimation = ({ target, suffix = "" }: { target: number; suffix?: string }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const increment = target / 100;
    const timer = setInterval(() => {
      setCount((prev) => {
        const next = prev + increment;
        if (next >= target) {
          clearInterval(timer);
          return target;
        }
        return next;
      });
    }, 20);

    return () => clearInterval(timer);
  }, [target]);

  return (
    <span className="animate-counter-up">
      {Math.floor(count).toLocaleString()}{suffix}
    </span>
  );
};

const GlobalImpact = () => {
  return (
    <section className="py-20 bg-card/30 backdrop-blur-sm relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <TrendingUp className="h-16 w-16 text-primary animate-float" />
              <div className="absolute inset-0 h-16 w-16 bg-primary/20 rounded-full blur-xl animate-pulse-glow" />
            </div>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Global Impact
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Live mission control data from across the Marvel Hub ecosystem
          </p>
        </div>

        {/* Impact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {impactData.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <Card 
                key={item.label}
                className="group relative overflow-hidden bg-card/80 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-500 hover:scale-105 hover:shadow-hero"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="p-6 text-center">
                  {/* Icon */}
                  <div className="flex justify-center mb-4">
                    <div className="relative">
                      <IconComponent className={`h-10 w-10 ${item.color} group-hover:animate-float`} />
                      <div className={`absolute inset-0 h-10 w-10 ${item.bgColor} rounded-full blur-lg group-hover:animate-pulse-glow`} />
                    </div>
                  </div>

                  {/* Counter */}
                  <div className="mb-3">
                    <div className={`text-3xl md:text-4xl font-bold ${item.color} font-mono`}>
                      <CounterAnimation target={item.value} suffix={item.suffix} />
                    </div>
                  </div>

                  {/* Label */}
                  <div className="text-sm text-muted-foreground font-medium">
                    {item.label}
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4 w-full bg-muted/50 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full ${item.bgColor.replace('/20', '')} rounded-full transition-all duration-1000 ease-out`}
                      style={{ 
                        width: `${item.suffix === '%' ? item.value : Math.min((item.value / 1500) * 100, 100)}%`,
                        animationDelay: `${index * 0.2}s`
                      }}
                    />
                  </div>
                </div>

                {/* Hover Effects */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-tech-scan" />
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-tech-scan" style={{ animationDelay: '0.5s' }} />
                </div>
              </Card>
            );
          })}
        </div>

        {/* Live Indicator */}
        <div className="flex justify-center mt-12">
          <div className="flex items-center space-x-2 text-primary">
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
            <span className="text-sm font-medium uppercase tracking-wider">Live Data Feed</span>
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default GlobalImpact;