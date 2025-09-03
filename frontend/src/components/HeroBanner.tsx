'use client';

import { Button } from "@/components/ui/stark-button";
import { Shield, Zap, Globe, Eye } from "lucide-react";
import heroImage from "../../public/assets/hero-banner.jpg";
import { useRouter } from "next/navigation";

const HeroBanner = () => {
  const router = useRouter();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#0A0A1A] via-[#1a1a2e] to-[#16213e]">
      
      {/* Enhanced Background Image with Better Overlay */}
      <div className="absolute inset-0">
        <img 
          src={typeof heroImage === "string" ? heroImage : heroImage.src} 
          alt="Marvel Hero Banner" 
          className="w-full h-full object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A1A]/98 via-[#0A0A1A]/85 to-[#0A0A1A]/98" />
      </div>

      {/* Enhanced Tech Grid Animation */}
      <div className="absolute inset-0 opacity-8">
        <div className="grid grid-cols-20 grid-rows-20 w-full h-full">
          {Array.from({ length: 400 }).map((_, i) => (
            <div 
              key={i} 
              className="border-primary/15 border-r border-b animate-pulse" 
              style={{ animationDelay: `${i * 0.02}s` }}
            />
          ))}
        </div>
      </div>

      {/* Floating Geometric Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 border border-primary/15 rounded-full animate-spin" style={{ animationDuration: '20s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 border border-secondary/15 rounded-full animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
        <div className="absolute top-1/2 right-1/3 w-16 h-16 border border-primary/10 rounded-full animate-spin" style={{ animationDuration: '25s' }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-6 max-w-6xl mx-auto">
        {/* Enhanced Animated Logo/Icon */}
        <div className="flex justify-center mb-10 md:mb-12">
          <div className="relative">
            <div className="relative">
              <Shield className="h-20 w-20 md:h-28 md:w-28 text-primary animate-float drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]" />
              <div className="absolute inset-0 h-20 w-20 md:h-28 md:w-28 bg-primary/40 rounded-full blur-2xl animate-pulse-glow" />
            </div>
            {/* Glowing Rings */}
            <div className="absolute inset-0 h-24 w-24 md:h-32 md:w-32 border border-primary/25 rounded-full animate-spin" style={{ animationDuration: '15s' }} />
            <div className="absolute inset-2 h-20 w-20 md:h-28 md:w-28 border border-primary/15 rounded-full animate-spin" style={{ animationDuration: '20s', animationDirection: 'reverse' }} />
          </div>
        </div>

        {/* Enhanced Main Headline */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-black mb-6 md:mb-8 text-white animate-fade-in drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]">
          MARVEL × IEEE
        </h1>
        
        <div className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 md:mb-6 animate-fade-in drop-shadow-[0_0_10px_rgba(0,0,0,0.6)]" style={{ animationDelay: '0.2s' }}>
          Marvel Hub
        </div>
        
        <p className="text-lg md:text-xl lg:text-2xl text-gray-200 mb-8 md:mb-12 max-w-4xl md:max-w-5xl mx-auto animate-fade-in leading-relaxed drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]" style={{ animationDelay: '0.4s' }}>
          Where Heroes Power Productivity, Creativity & Well-being
        </p>

        {/* Enhanced CTA Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-5xl md:max-w-6xl mx-auto animate-fade-in " style={{ animationDelay: '0.6s' }}>
          
          <Button variant="groot" size="lg" className="group h-14 md:h-16 text-base md:text-lg font-semibold shadow-lg hover:shadow-2xl hover:shadow-groot/25 transition-all duration-300 hover:scale-105"
          onClick={() => router.push("/groot-world")}>
            <Globe className="mr-2 md:mr-3 h-5 w-5 md:h-6 md:w-6 group-hover:animate-spin" />
            Enter Groot's World
          </Button>
          
          <Button variant="stark" size="lg" className="group h-14 md:h-16 text-base md:text-lg font-semibold shadow-lg hover:shadow-2xl hover:shadow-primary/25 transition-all duration-300 hover:scale-105"
          onClick={() => router.push("/starkledger")}>
            <Zap className="mr-2 md:mr-3 h-5 w-5 md:h-6 md:w-6 group-hover:animate-pulse" />
            Access Starkledger
          </Button>
          
          <Button variant="spidey" size="lg" className="group h-14 md:h-16 text-base md:text-lg font-semibold shadow-lg hover:shadow-2xl hover:shadow-spidey-red/25 transition-all duration-300 hover:scale-105"
          onClick={() => router.push("/spideysense")}>
            <Eye className="mr-2 md:mr-3 h-5 w-5 md:h-6 md:w-6 group-hover:animate-bounce" />
            SpideySense Scheduler
          </Button>
          
          <Button variant="strange" size="lg" className="group h-14 md:h-16 text-base md:text-lg font-semibold shadow-lg hover:shadow-2xl hover:shadow-strange-purple/25 transition-all duration-300 hover:scale-105"
          onClick={() => router.push("/mystic")}>
            <Shield className="mr-2 md:mr-3 h-5 w-5 md:h-6 md:w-6 group-hover:rotate-180 transition-transform duration-500" />
            Explore Mystic Archives
          </Button>
        </div>

        {/* Enhanced Scroll Indicator */}
        <div className="absolute bottom-8 md:bottom-12 left-1/2 transform -translate-x-1/2">
          <div className="w-6 h-10 md:w-8 md:h-12 border-2 border-primary/60 rounded-full flex justify-center animate-pulse-glow">
            <div className="w-1 h-3 md:w-1.5 md:h-4 bg-primary rounded-full mt-2 md:mt-3 animate-bounce" />
          </div>
        </div>
      </div>

      {/* Enhanced Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 25 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 md:w-1.5 md:h-1.5 bg-primary/50 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroBanner;