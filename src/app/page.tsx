import { Navbar }           from "@/components/shared/Navbar";
import { Footer }           from "@/components/shared/Footer";
import { HeroSection }      from "@/components/sections/HeroSection";
import { ProblemSection }   from "@/components/sections/ProblemSection";
import { HowItWorksSection }from "@/components/sections/HowItWorksSection";
import { DemoSection }      from "@/components/sections/DemoSection";
import { FeaturesSection }  from "@/components/sections/FeaturesSection";
import { PricingSection }   from "@/components/sections/PricingSection";
import { WaitlistSection }  from "@/components/sections/WaitlistSection";

export default function LandingPage() {
  return (
    <>
      <Navbar />

      <main>
        {/* 1. Hook — why you should care */}
        <HeroSection />

        {/* 2. Problem — you're not alone */}
        <ProblemSection />

        {/* 3. Solution — how it works */}
        <HowItWorksSection />

        {/* 4. Proof — see it yourself */}
        <DemoSection />

        {/* 5. Features — what you get */}
        <FeaturesSection />

        {/* 6. Pricing — what it costs */}
        <PricingSection />

        {/* 7. CTA — join the waitlist */}
        <WaitlistSection />
      </main>

      <Footer />
    </>
  );
}
