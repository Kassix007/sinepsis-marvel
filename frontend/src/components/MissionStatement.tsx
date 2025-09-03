const MissionStatement = () => {
    return (
      <section className="py-20 md:py-24 bg-gradient-to-b from-[#0A0A1A] to-[#1a1a2e] relative overflow-hidden">
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.02)_0%,transparent_50%),radial-gradient(circle_at_75%_75%,rgba(255,255,255,0.015)_0%,transparent_50%)]" />
          <div className="absolute top-1/4 left-1/4 w-80 md:w-96 h-80 md:h-96 border border-primary/8 rounded-full animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-64 md:w-80 h-64 md:h-80 border border-secondary/8 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 md:w-64 h-48 md:h-64 border border-primary/4 rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
          <div className="relative">
            {/* Enhanced Header with Icon */}
            <div className="flex justify-center mb-6 md:mb-8">
              <div className="relative">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-primary/25 to-secondary/25 rounded-full flex items-center justify-center backdrop-blur-sm border border-primary/25">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                    <div className="w-5 h-5 md:w-6 md:h-6 bg-white rounded-full" />
                  </div>
                </div>
                <div className="absolute inset-0 w-16 h-16 md:w-20 md:h-20 border border-primary/20 rounded-full animate-spin" style={{ animationDuration: '20s' }} />
              </div>
            </div>

            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-8 md:mb-10 text-white drop-shadow-[0_0_15px_rgba(0,0,0,0.7)]">
                Unite the
                <span className="bg-gradient-to-r from-primary via-white to-primary bg-clip-text text-transparent ml-2 md:ml-4 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]"> Powers</span>
              </h2>
              
              <div className="max-w-4xl md:max-w-5xl mx-auto space-y-6 md:space-y-8">
                <p className="text-lg md:text-xl lg:text-2xl xl:text-3xl text-gray-100 leading-relaxed font-medium drop-shadow-[0_0_10px_rgba(0,0,0,0.6)]">
                  This platform unites the <span className="text-white font-bold bg-gradient-to-r from-primary/30 to-transparent px-2 py-1 rounded">ingenuity of Stark Industries</span>, 
                  the <span className="text-white font-bold bg-gradient-to-r from-strange-purple/30 to-transparent px-2 py-1 rounded">wisdom of Doctor Strange</span>, 
                  the <span className="text-white font-bold bg-gradient-to-r from-spidey-red/30 to-transparent px-2 py-1 rounded">agility of Spider-Man</span>, 
                  and the <span className="text-white font-bold bg-gradient-to-r from-groot/30 to-transparent px-2 py-1 rounded">resilience of Groot</span>.
                </p>
                
                <p className="text-base md:text-lg lg:text-xl xl:text-2xl text-gray-200 leading-relaxed drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]">
                  Each module brings you closer to their unique powers—whether in 
                  <span className="text-white font-semibold bg-gradient-to-r from-secondary/30 to-transparent px-2 py-1 rounded ml-1 md:ml-2"> finance</span>, 
                  <span className="text-white font-semibold bg-gradient-to-r from-primary/30 to-transparent px-2 py-1 rounded ml-1 md:ml-2"> planning</span>, 
                  <span className="text-white font-semibold bg-gradient-to-r from-groot/30 to-transparent px-2 py-1 rounded ml-1 md:ml-2"> exploration</span>, or 
                  <span className="text-white font-semibold bg-gradient-to-r from-strange-purple/30 to-transparent px-2 py-1 rounded ml-1 md:ml-2"> mystical research</span>.
                </p>
              </div>

              {/* Enhanced Tech Lines Animation */}
              <div className="mt-12 md:mt-16 relative">
                <div className="flex justify-center space-x-8 md:space-x-12">
                  <div className="w-32 md:w-40 h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" />
                  <div className="w-32 md:w-40 h-1 bg-gradient-to-r from-transparent via-secondary to-transparent animate-pulse" style={{ animationDelay: '0.5s' }} />
                  <div className="w-32 md:w-40 h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" style={{ animationDelay: '1s' }} />
                </div>
                
                {/* Floating Tech Elements */}
                <div className="absolute inset-0 flex justify-center items-center">
                  <div className="w-3 md:w-4 h-3 md:h-4 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2.5 md:w-3 h-2.5 md:h-3 bg-secondary rounded-full animate-pulse ml-24 md:ml-32" style={{ animationDelay: '0.7s' }} />
                  <div className="w-2 md:w-2 h-2 md:h-2 bg-primary rounded-full animate-pulse ml-24 md:ml-32" style={{ animationDelay: '1.2s' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };
  
  export default MissionStatement;