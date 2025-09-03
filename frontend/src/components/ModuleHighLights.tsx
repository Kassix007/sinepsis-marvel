import { Button } from "@/components/ui/stark-button";
import { Card } from "@/components/ui/card";
import { TreePine, Zap, Bug, Eye, Rocket, Database, Calendar, BookOpen } from "lucide-react";

const modules = [
  {
    hero: "Groot",
    codename: "Project I-Am-Groot",
    subtitle: "Nature's Resilience Engine",
    description: "Rebuild, explore, and conquer challenges in an open-ended mission game.",
    icon: TreePine,
    variant: "groot" as const,
    features: ["World Building", "Resource Management", "Ecosystem Design"],
    color: "groot",
    bgGradient: "from-groot/25 via-groot/15 to-transparent"
  },
  {
    hero: "Stark",
    codename: "Starkledger", 
    subtitle: "Financial Intelligence Suite",
    description: "Visualize, forecast, and master financial data in real time.",
    icon: Database,
    variant: "stark" as const,
    features: ["Real-time Analytics", "AI Forecasting", "Portfolio Management"],
    color: "primary",
    bgGradient: "from-primary/25 via-primary/15 to-transparent"
  },
  {
    hero: "Spider-Man",
    codename: "SpideySense Scheduler",
    subtitle: "Agility Planning Matrix",
    description: "Plan, track, and respond to missions with speed and precision.",
    icon: Bug,
    variant: "spidey" as const,
    features: ["Smart Scheduling", "Priority Detection", "Quick Response"],
    color: "spidey-red",
    bgGradient: "from-spidey-red/25 via-spidey-red/15 to-transparent"
  },
  {
    hero: "Strange",
    codename: "Mystic Archive",
    subtitle: "Knowledge Dimension Portal",
    description: "Unlock knowledge from magical texts, artifacts, and portals.",
    icon: BookOpen,
    variant: "strange" as const,
    features: ["Research Tools", "Knowledge Maps", "Mystical Archives"],
    color: "strange-purple",
    bgGradient: "from-strange-purple/25 via-strange-purple/15 to-transparent"
  }
];

const ModuleHighlights = () => {
  return (
    <section className="py-20 md:py-24 bg-gradient-to-b from-[#1a1a2e] to-[#16213e] relative overflow-hidden">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 opacity-8">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 25% 25%, hsl(var(--primary)) 0%, transparent 50%), radial-gradient(circle at 75% 75%, hsl(var(--secondary)) 0%, transparent 50%)'
        }} />
      </div>

      {/* Floating Tech Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-24 md:w-32 h-24 md:h-32 border border-primary/8 rounded-full animate-spin" style={{ animationDuration: '25s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-20 md:w-24 h-20 md:h-24 border border-secondary/8 rounded-full animate-spin" style={{ animationDuration: '20s', animationDirection: 'reverse' }} />
        <div className="absolute top-1/2 right-1/3 w-12 md:w-16 h-12 md:h-16 border border-primary/4 rounded-full animate-spin" style={{ animationDuration: '30s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-6 md:mb-8 text-white drop-shadow-[0_0_15px_rgba(0,0,0,0.7)]">
            Choose Your
            <span className="bg-gradient-to-r from-primary via-white to-primary bg-clip-text text-transparent ml-2 md:ml-4 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]"> Hero</span>
          </h2>
          <p className="text-lg md:text-xl lg:text-2xl text-gray-100 max-w-3xl md:max-w-4xl mx-auto leading-relaxed drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]">
            Each module harnesses the unique abilities of Earth's Mightiest Heroes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {modules.map((module, index) => {
            const IconComponent = module.icon;
            return (
              <Card 
                key={module.codename}
                className="group relative overflow-hidden bg-gradient-to-br from-card/95 to-card/60 backdrop-blur-sm border border-border/40 hover:border-primary/60 transition-all duration-700 hover:scale-105 hover:shadow-2xl hover:shadow-primary/25 flex flex-col"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Enhanced Hero Glow Effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${module.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />

                {/* Animated Border */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                  <div className="absolute inset-0 border border-primary/40 rounded-lg" />
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" />
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" style={{ animationDelay: '0.5s' }} />
                </div>

                <div className="p-6 md:p-8 relative z-10 flex flex-col flex-1">
                  {/* Enhanced Hero Icon */}
                  <div className="flex justify-center mb-4 md:mb-6">
                    <div className="relative">
                      <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl bg-${module.color}/25 group-hover:bg-${module.color}/35 transition-all duration-500 group-hover:scale-110`}>
                        <IconComponent className={`h-8 w-8 md:h-10 md:w-10 text-${module.color} group-hover:animate-float`} />
                      </div>
                      <div className={`absolute inset-0 bg-${module.color}/35 rounded-xl md:rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    </div>
                  </div>

                  {/* Enhanced Hero Info */}
                  <div className="text-center mb-6 md:mb-8 flex-1">
                    <h3 className="text-xl md:text-2xl lg:text-3xl font-black text-white mb-2 md:mb-3 group-hover:text-primary transition-colors duration-300 drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]">
                      {module.hero}
                    </h3>
                    <div className="text-xs md:text-sm text-gray-300 mb-2 md:mb-3 font-mono tracking-wider">
                      {module.codename}
                    </div>
                    <div className={`text-xs font-bold uppercase tracking-widest text-${module.color} mb-3 md:mb-4 px-2 md:px-3 py-1 bg-${module.color}/15 rounded-full`}>
                      {module.subtitle}
                    </div>
                    <p className="text-gray-200 leading-relaxed text-sm md:text-base drop-shadow-[0_0_6px_rgba(0,0,0,0.4)]">
                      {module.description}
                    </p>
                  </div>

                  {/* Enhanced Features */}
                  <div className="mb-6 md:mb-8 flex-1">
                    <div className="space-y-2 md:space-y-3">
                      {module.features.map((feature, i) => (
                        <div key={i} className="flex items-center text-xs md:text-sm text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                          <div className={`w-1.5 md:w-2 h-1.5 md:h-2 rounded-full bg-${module.color} mr-2 md:mr-3 group-hover:scale-125 transition-transform duration-300`} />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Enhanced Launch Button - Fixed Position */}
                  <div className="mt-auto">
                    <Button 
                      variant={module.variant} 
                      size="lg" 
                      className="w-full h-11 md:h-12 text-sm md:text-base font-semibold group-hover:shadow-lg group-hover:shadow-primary/25 transition-all duration-300 hover:scale-105"
                    >
                      <Rocket className="mr-2 h-4 w-4 md:h-5 md:w-5 group-hover:animate-bounce" />
                      Launch Module
                    </Button>
                  </div>
                </div>

                {/* Floating Particles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={`absolute w-1 h-1 bg-${module.color} rounded-full animate-float`}
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 2}s`,
                        animationDuration: `${2 + Math.random() * 2}s`
                      }}
                    />
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ModuleHighlights;