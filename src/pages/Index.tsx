import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import ProblemSection from "@/components/landing/ProblemSection";
import SolutionSection from "@/components/landing/SolutionSection";
import WhyUsSection from "@/components/landing/WhyUsSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import PartnersSection from "@/components/landing/PartnersSection";
import ImpactSection from "@/components/landing/ImpactSection";
import FooterSection from "@/components/landing/FooterSection";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <WhyUsSection />
      <HowItWorksSection />
      <PartnersSection />
      <ImpactSection />
      <FooterSection />
    </div>
  );
};

export default Index;
