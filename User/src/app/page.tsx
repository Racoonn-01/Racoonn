import HeroSection from '@/components/home/HeroSection';
import PopularStays from '@/components/home/PopularStays';
import PopularDestinations from '@/components/home/PopularDestinations';
import TourPackages from '@/components/home/TourPackages';
import DynamicPopularStays from '@/components/home/DynamicPopularStays';
import AnimatedSection from '@/components/shared/AnimatedSection';

export default function Home() {
  return (
    <>
      <HeroSection />
      
      <AnimatedSection>
        <PopularStays />
      </AnimatedSection>
      
      <AnimatedSection delay={0.1}>
        <PopularDestinations />
      </AnimatedSection>
      
      <AnimatedSection delay={0.1}>
        <TourPackages />
      </AnimatedSection>
      
      <AnimatedSection delay={0.1}>
        <DynamicPopularStays />
      </AnimatedSection>
    </>
  );
}
