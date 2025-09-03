import HeroBanner from "@/components/HeroBanner";
import MissionStatement from "@/components/MissionStatement";
import ModuleHighLights from "@/components/ModuleHighLights";
import GlobalImpact from "@/components/GlobalImpact";
import Features from "@/components/Features";
import CallToAction from "@/components/CallToAction";
import MarvelQuiz from "@/components/MarvelQuiz";


const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroBanner />
      <MissionStatement />
      <ModuleHighLights />
      <GlobalImpact />
      <Features />
      <CallToAction />
      <MarvelQuiz />
    </div>
  );
};

export default Index;