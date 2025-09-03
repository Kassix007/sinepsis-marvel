import { Card } from "@/components/ui/card";
import { Zap, Users, Shield, Gamepad2 } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Real-time Interactivity",
    description: "Experience Stark-level responsiveness with instant data updates and HUD-style interfaces",
    color: "primary",
    bgGradient: "from-primary/25 via-primary/15 to-transparent",
    iconBg: "bg-primary/25"
  },
  {
    icon: Users,
    title: "Community & Collaboration", 
    description: "Join forces like the Avengers with powerful team collaboration tools and shared missions",
    color: "secondary",
    bgGradient: "from-secondary/25 via-secondary/15 to-transparent",
    iconBg: "bg-secondary/25"
  },
  {
    icon: Shield,
    title: "Security & Reliability",
    description: "S.H.I.E.L.D-grade security protocols protect your data with military-level encryption",
    color: "groot",
    bgGradient: "from-groot/25 via-groot/15 to-transparent",
    iconBg: "bg-groot/25"
  },
  {
    icon: Gamepad2,
    title: "Gamified Experience",
    description: "Level up your productivity with XP systems, achievements, and hero rankings",
    color: "strange-purple",
    bgGradient: "from-strange-purple/25 via-strange-purple/15 to-transparent",
    iconBg: "bg-strange-purple/25"
  }
];

const Features = () => {
  return (
    <section className="py-20 md:py-24 bg-gradient-to-b from-[#16213e] to-[#0A0A1A] relative overflow-hidden">
      {/* Enhanced Animated Background Grid */}
      <div className="absolute inset-0 opacity-8">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px),
            linear-gradient(180deg, hsl(var(--border)) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* Floating Tech Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-32 md:w-40 h-32 md:h-40 border border-primary/8 rounded-full animate-spin" style={{ animationDuration: '30s' }} />
        <div className="absolute bottom-1/4 left-1/4 w-24 md:w-32 h-24 md:h-32 border border-secondary/8 rounded-full animate-spin" style={{ animationDuration: '25s', animationDirection: 'reverse' }} />
        <div className="absolute top-1/2 left-1/3 w-20 md:w-24 h-20 md:h-24 border border-primary/4 rounded-full animate-spin" style={{ animationDuration: '35s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Enhanced Header */}
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-6 md:mb-8 text-white drop-shadow-[0_0_15px_rgba(0,0,0,0.7)]">
            Marvel-Inspired
            <span className="bg-gradient-to-r from-primary via-white to-primary bg-clip-text text-transparent ml-2 md:ml-4 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]"> Features</span>
          </h2>
          <p className="text-lg md:text-xl lg:text-2xl text-gray-100 max-w-3xl md:max-w-4xl mx-auto leading-relaxed drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]">
            Cutting-edge capabilities that would make Tony Stark proud
          </p>
        </div>

        {/* Enhanced Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card 
                key={feature.title}
                className="group relative overflow-hidden bg-gradient-to-br from-card/95 to-card/60 backdrop-blur-sm border border-border/40 hover:border-primary/60 transition-all duration-700 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/25"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Enhanced Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
                
                <div className="p-8 md:p-10 relative z-10">
                  <div className="flex items-start space-x-4 md:space-x-6">
                    {/* Enhanced Icon */}
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl ${feature.iconBg} group-hover:bg-${feature.color}/35 transition-all duration-500 group-hover:scale-110`}>
                          <IconComponent className={`h-7 w-7 md:h-8 md:w-8 lg:h-10 lg:w-10 ${feature.color} group-hover:animate-float`} />
                        </div>
                        <div className={`absolute inset-0 bg-${feature.color}/35 rounded-xl md:rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                      </div>
                    </div>

                    {/* Enhanced Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg md:text-xl lg:text-2xl font-black text-white mb-3 md:mb-4 group-hover:text-primary transition-colors duration-300 drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]">
                        {feature.title}
                      </h3>
                      <p className="text-gray-200 leading-relaxed text-sm md:text-base lg:text-lg drop-shadow-[0_0_6px_rgba(0,0,0,0.4)]">
                        {feature.description}
                      </p>
                    </div>
                  </div>

                  {/* Enhanced Tech Lines */}
                  <div className="mt-6 md:mt-8 flex space-x-2 md:space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                    <div className="flex-1 h-1 bg-gradient-to-r from-primary/60 to-transparent animate-pulse" />
                    <div className="flex-1 h-1 bg-gradient-to-r from-transparent via-primary/60 to-transparent animate-pulse" style={{ animationDelay: '0.3s' }} />
                    <div className="flex-1 h-1 bg-gradient-to-r from-transparent to-primary/60 animate-pulse" style={{ animationDelay: '0.6s' }} />
                  </div>
                </div>

                {/* Enhanced Border Animation */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" />
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" style={{ animationDelay: '0.5s' }} />
                  <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-transparent via-primary to-transparent animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <div className="absolute right-0 top-0 h-full w-1 bg-gradient-to-b from-transparent via-primary to-transparent animate-pulse" style={{ animationDelay: '0.8s' }} />
                </div>

                {/* Floating Particles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className={`absolute w-1 h-1 bg-${feature.color} rounded-full animate-float`}
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

export default Features;