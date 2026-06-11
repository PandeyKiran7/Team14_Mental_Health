import AboutDiabetesSection from "@/components/home/AboutDiabetesSection";
import BenefitsSection from "@/components/home/BenefitsSection";
import CallToActionSection from "@/components/home/CallToActionSection";
import DiabetesStatisticsSection from "@/components/home/DiabetesStatisticsSection";
import HeroSection from "@/components/home/HeroSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import KeyFeaturesSection from "@/components/home/KeyFeaturesSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <HowItWorksSection />
      <KeyFeaturesSection />
      <AboutDiabetesSection />
      <DiabetesStatisticsSection />
      <BenefitsSection />
      <TestimonialsSection />
      <CallToActionSection />
    </>
  );
}
