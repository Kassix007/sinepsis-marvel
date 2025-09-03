"use client";

import { Button } from "@/components/ui/stark-button";
import { Card } from "@/components/ui/card";
import { UserPlus, LogIn, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

const CallToAction = () => {
  const router = useRouter();

  const handleSignUpClick = () => {
    router.push("/signup");
  };

  const handleLoginClick = () => {
    router.push("/login");
  };

  return (
    <section className="py-20 md:py-24 bg-gradient-to-b from-[#0A0A1A] to-[#1a1a2e] relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 opacity-35">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 md:w-96 h-80 md:h-96 bg-primary/25 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/4 left-1/4 w-56 md:w-64 h-56 md:h-64 bg-secondary/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-64 md:w-80 h-64 md:h-80 bg-primary/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Enhanced Circuit Pattern */}
      <div className="absolute inset-0 opacity-8">
        <svg className="w-full h-full" viewBox="0 0 400 400">
          <defs>
            <pattern id="circuit" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M 0 50 L 50 50 M 50 0 L 50 100 M 50 50 L 100 50" stroke="currentColor" strokeWidth="1" fill="none" />
              <circle cx="50" cy="50" r="3" fill="currentColor" />
              <circle cx="0" cy="50" r="2" fill="currentColor" />
              <circle cx="100" cy="50" r="2" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#circuit)" />
        </svg>
      </div>

      <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
        {/* Enhanced Quote Section */}
        <div className="mb-12 md:mb-16">
          <div className="flex justify-center mb-6 md:mb-8">
            <div className="relative">
              <Sparkles className="h-12 w-12 md:h-16 md:w-16 text-primary animate-float drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]" />
              <div className="absolute inset-0 h-12 w-12 md:h-16 md:w-16 bg-primary/40 rounded-full blur-xl animate-pulse-glow" />
            </div>
          </div>
          
          <blockquote className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-white mb-6 md:mb-8 leading-tight drop-shadow-[0_0_15px_rgba(0,0,0,0.8)]">
            "Heroes are not born, they are
            <span className="bg-gradient-to-r from-primary via-white to-primary bg-clip-text text-transparent ml-2 md:ml-4 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]"> made</span>"
          </blockquote>
          
          <p className="text-lg md:text-xl lg:text-2xl text-gray-100 mb-10 md:mb-12 drop-shadow-[0_0_8px_rgba(0,0,0,0.6)]">
            Welcome to your next mission
          </p>
        </div>

        {/* Simplified Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 mb-12 md:mb-16">
          {/* Simplified Sign Up Card */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-sm border border-border/40 hover:border-primary/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
            {/* Simple Background Pattern */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
            </div>
            
            <div className="p-8 md:p-10 relative z-10">
              {/* Simplified Header Section */}
              <div className="text-center mb-6 md:mb-8">
                <div className="flex justify-center mb-4 md:mb-6">
                  <div className="p-4 md:p-5 rounded-2xl bg-primary/20 group-hover:bg-primary/30 transition-all duration-300">
                    <UserPlus className="h-10 w-10 md:h-12 md:w-12 text-primary" />
                  </div>
                </div>
                
                <h3 className="text-2xl md:text-3xl font-black text-white mb-3 md:mb-4 group-hover:text-primary transition-colors duration-300">
                  Join the Initiative
                </h3>
                <p className="text-gray-200 mb-6 md:mb-8 text-base md:text-lg leading-relaxed">
                  Begin your journey as a hero and unlock the full potential of the Marvel Hub
                </p>
              </div>

              {/* Simplified Benefits List */}
              <div className="mb-6 md:mb-8 text-left">
                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-center text-sm md:text-base text-gray-200">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                    <span>Access to all hero modules</span>
                  </div>
                  <div className="flex items-center text-sm md:text-base text-gray-200">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                    <span>Exclusive hero achievements</span>
                  </div>
                  <div className="flex items-center text-sm md:text-base text-gray-200">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                    <span>Priority mission access</span>
                  </div>
                </div>
              </div>
              
              {/* Simplified Button */}
              <Button 
                variant="hero" 
                size="lg" 
                className="w-full h-12 md:h-14 text-base md:text-lg font-semibold transition-all duration-300 hover:scale-105 bg-blue-900 hover:bg-blue-500 text-white"
                onClick={handleSignUpClick}
              >
                <UserPlus className="mr-2 md:mr-3 h-5 w-5 md:h-6 md:w-6" />
                Sign Up as a Hero
              </Button>
            </div>
          </Card>

          {/* Static Login Card */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-sm border border-border/40 hover:border-primary/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
            {/* Simple Background Pattern */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
            </div>
            
            <div className="p-8 md:p-10 relative z-10">
              {/* Simplified Header Section */}
              <div className="text-center mb-6 md:mb-8">
                <div className="flex justify-center mb-4 md:mb-6">
                  <div className="p-4 md:p-5 rounded-2xl bg-primary/20 group-hover:bg-primary/30 transition-all duration-300">
                    <LogIn className="h-10 w-10 md:h-12 md:w-12 text-primary" />
                  </div>
                </div>
                
                <h3 className="text-2xl md:text-3xl font-black text-white mb-3 md:mb-4 group-hover:text-primary transition-colors duration-300">
                  Return to Base
                </h3>
                <p className="text-gray-200 mb-6 md:mb-8 text-base md:text-lg leading-relaxed">
                  Welcome back, Hero. Access your command center and continue your missions
                </p>
              </div>

              {/* Simplified Benefits List */}
              <div className="mb-6 md:mb-8 text-left">
                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-center text-sm md:text-base text-gray-200">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                    <span>Resume your hero journey</span>
                  </div>
                  <div className="flex items-center text-sm md:text-base text-gray-200">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                    <span>Access saved progress</span>
                  </div>
                  <div className="flex items-center text-sm md:text-base text-gray-200">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                    <span>Continue missions</span>
                  </div>
                </div>
              </div>
              
              {/* Simplified Button */}
              <Button 
                variant="hero" 
                size="lg" 
                className="w-full h-12 md:h-14 text-base md:text-lg font-semibold transition-all duration-300 hover:scale-105 bg-emerald-900 hover:bg-emerald-500 text-white"
                onClick={handleLoginClick}
              >
                <LogIn className="mr-2 md:mr-3 h-5 w-5 md:h-6 md:w-6" />
                Log In
              </Button>
            </div>
          </Card>
        </div>

        {/* Enhanced Power Level Indicator */}
        <div className="flex justify-center items-center space-x-4 md:space-x-6">
          <div className="flex space-x-1 md:space-x-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="w-1.5 md:w-2 h-8 md:h-10 bg-primary/50 rounded-full animate-pulse"
                style={{ 
                  animationDelay: `${i * 0.15}s`,
                  height: `${Math.random() * 20 + 20}px`
                }}
              />
            ))}
          </div>
          <span className="text-sm md:text-lg text-primary font-bold uppercase tracking-widest px-3 md:px-4 py-1 md:py-2 bg-primary/15 rounded-full border border-primary/25">
            Hero Level: Recruit
          </span>
          <div className="flex space-x-1 md:space-x-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="w-1.5 md:w-2 h-8 md:h-10 bg-primary/50 rounded-full animate-pulse"
                style={{ 
                  animationDelay: `${(i + 7) * 0.15}s`,
                  height: `${Math.random() * 20 + 20}px`
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;