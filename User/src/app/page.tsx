import HeroSection from '@/components/home/HeroSection';
import PopularStays from '@/components/home/PopularStays';
import AnimatedSection from '@/components/shared/AnimatedSection';
import dynamic from 'next/dynamic';

const PopularDestinations = dynamic(() => import('@/components/home/PopularDestinations'), { ssr: true });
const TourPackages = dynamic(() => import('@/components/home/TourPackages'), { ssr: true });
const DynamicPopularStays = dynamic(() => import('@/components/home/DynamicPopularStays'), { ssr: true });

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
