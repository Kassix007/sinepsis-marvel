"use client";
import { useState, useEffect } from "react";
import { Zap, Mail, Github, Linkedin, Twitter, ExternalLink } from "lucide-react";

const marvelQuotes = [
  "I am Groot.",
  "I can do this all day.",
  "Dormammu, I've come to bargain.",
  "With great power comes great responsibility.",
  "I am Iron Man.",
  "Avengers... assemble!",
  "I love you 3000.",
  "That's my secret, Captain. I'm always angry."
];

const Footer = () => {
  const [currentQuote, setCurrentQuote] = useState(marvelQuotes[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * marvelQuotes.length);
      setCurrentQuote(marvelQuotes[randomIndex]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="bg-gradient-to-b from-[#1a1a2e] to-[#0A0A1A] border-t border-border/40 relative overflow-hidden ">
      {/* Enhanced Arc Reactor Animation */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-25">
        <div className="relative">
          <Zap className="h-24 w-24 md:h-32 md:w-32 text-primary animate-pulse-glow drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]" />
          <div className="absolute inset-0 h-24 w-24 md:h-32 md:w-32 border-2 border-primary/35 rounded-full animate-spin" style={{ animationDuration: '20s' }} />
          <div className="absolute inset-2 h-20 w-20 md:h-28 md:w-28 border border-primary/25 rounded-full animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
          <div className="absolute inset-4 h-16 w-16 md:h-24 md:w-24 border border-primary/15 rounded-full animate-spin" style={{ animationDuration: '10s' }} />
        </div>
      </div>

      {/* Floating Tech Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-20 md:w-24 h-20 md:h-24 border border-primary/8 rounded-full animate-spin" style={{ animationDuration: '25s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-24 md:w-32 h-24 md:h-32 border border-secondary/8 rounded-full animate-spin" style={{ animationDuration: '30s', animationDirection: 'reverse' }} />
        <div className="absolute top-1/2 right-1/3 w-12 md:w-16 h-12 md:h-16 border border-primary/4 rounded-full animate-spin" style={{ animationDuration: '35s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16 relative z-10">
        {/* Enhanced Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-10 md:mb-12">
          {/* Enhanced Logo & Description */}
          <div className="space-y-4 md:space-y-6">
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="relative">
                <Zap className="h-6 w-6 md:h-8 md:w-8 text-primary animate-pulse drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]" />
                <div className="absolute inset-0 h-6 w-6 md:h-8 md:w-8 bg-primary/35 rounded-full blur-lg animate-pulse-glow" />
              </div>
              <span className="text-lg md:text-2xl font-black bg-gradient-to-r from-primary via-white to-primary bg-clip-text text-transparent">
                MARVEL × IEEE
              </span>
            </div>
            <p className="text-gray-200 text-sm md:text-base leading-relaxed drop-shadow-[0_0_6px_rgba(0,0,0,0.4)]">
              Empowering heroes through cutting-edge technology and innovative solutions. 
              Join the next generation of world-changers.
            </p>
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="w-2 h-2 md:w-3 md:h-3 bg-primary rounded-full animate-pulse" />
              <span className="text-xs md:text-sm text-primary font-bold uppercase tracking-wider">
                Status: Online
              </span>
            </div>
          </div>

          {/* Quick Links Section */}
          <div className="space-y-4 md:space-y-6">
            <h3 className="text-lg md:text-xl font-bold text-white">
              Quick Links
            </h3>
            <div className="space-y-3">
              <a href="/landingpage" className="flex items-center space-x-2 text-gray-300 hover:text-primary transition-colors duration-300 group">
                <ExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                <span>Home</span>
              </a>
              <a href="/mystic" className="flex items-center space-x-2 text-gray-300 hover:text-primary transition-colors duration-300 group">
                <ExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                <span>Mystic</span>
              </a>
              <a href="/spideysense" className="flex items-center space-x-2 text-gray-300 hover:text-primary transition-colors duration-300 group">
                <ExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                <span>Spidey Sense</span>
              </a>
              <a href="/starkledger" className="flex items-center space-x-2 text-gray-300 hover:text-primary transition-colors duration-300 group">
                <ExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                <span>Stark Ledger</span>
              </a>
            </div>
          </div>

          {/* Enhanced Marvel Quote Easter Egg */}
          <div className="space-y-4 md:space-y-6">
            <h3 className="text-lg md:text-xl font-bold text-white">
              Hero Wisdom
            </h3>
            <blockquote className="text-sm md:text-base italic text-gray-200 border-l-3 md:border-l-4 border-primary/60 pl-4 md:pl-6 transition-all duration-500 leading-relaxed drop-shadow-[0_0_6px_rgba(0,0,0,0.4)]">
              "{currentQuote}"
            </blockquote>
            <div className="text-xs md:text-sm text-gray-300">
              — Marvel Universe
            </div>
          </div>

          {/* Connect With Us Section */}
          <div className="space-y-4 md:space-y-6">
            <h3 className="text-lg md:text-xl font-bold text-white">
              Connect With Us
            </h3>
            <div className="space-y-3">
              <a href="mailto:contact@marvel-ieee.com" className="flex items-center space-x-2 text-gray-300 hover:text-primary transition-colors duration-300 group">
                <Mail className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                <span>contact@marvel-ieee.com</span>
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-gray-300 hover:text-primary transition-colors duration-300 group">
                <Github className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                <span>GitHub</span>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-gray-300 hover:text-primary transition-colors duration-300 group">
                <Linkedin className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                <span>LinkedIn</span>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-gray-300 hover:text-primary transition-colors duration-300 group">
                <Twitter className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                <span>Twitter</span>
              </a>
            </div>
          </div>
        </div>

        {/* Enhanced Bottom Bar */}
        <div className="border-t border-border/40 pt-8 md:pt-10">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm md:text-base text-gray-300">
              © 2025 SINEPSIS X IEEE MDX SB × Stark Industries. All rights reserved.
            </div>
            
            {/* Enhanced Tech Indicators */}
            <div className="flex items-center space-x-6 md:space-x-8">
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="w-1.5 md:w-2 h-1.5 md:h-2 bg-groot rounded-full animate-pulse" />
                <span className="text-xs md:text-sm text-gray-200 font-medium">Groot</span>
              </div>
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="w-1.5 md:w-2 h-1.5 md:h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                <span className="text-xs md:text-sm text-gray-200 font-medium">Stark</span>
              </div>
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="w-1.5 md:w-2 h-1.5 md:h-2 bg-spidey-red rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                <span className="text-xs md:text-sm text-gray-200 font-medium">Spidey</span>
              </div>
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="w-1.5 md:w-2 h-1.5 md:h-2 bg-strange-purple rounded-full animate-pulse" style={{ animationDelay: '0.6s' }} />
                <span className="text-xs md:text-sm text-gray-200 font-medium">Strange</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Floating Tech Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 12 }).map((_, i) => (
            <div suppressHydrationWarning={true}
              key={i}
              className="absolute w-1 h-1 md:w-1.5 md:h-1.5 bg-primary/60 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${4 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;