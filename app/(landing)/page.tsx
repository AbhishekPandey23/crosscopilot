import { HeroHeader } from '@/app/(landing)/_components/header';
import HeroSection from '@/app/(landing)/_components/hero-section';
import FooterSection from './_components/footer';
import FeaturesSection from './_components/features-8';
import IntegrationsSection from './_components/integrations-1';
import Testimonials from './_components/testimonials';
import Pricing from './_components/pricing';
import CallToAction from './_components/call-to-action';

export default function Home() {
  return (
    <div>
      <HeroHeader />
      <HeroSection />
      <FeaturesSection />
      <IntegrationsSection />
      <Testimonials />
      <Pricing />
      <CallToAction/>
      <FooterSection />
    </div>
  );
}
