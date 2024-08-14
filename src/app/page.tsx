import HeroComponent from '@/components/landingpage/HeroComponent';
import FeatureComponent from '@/components/landingpage/FeatureComponent';
import CtaComponent from '@/components/landingpage/CtaComponent';
import FooterComponent from '@/components/landingpage/FooterComponent';

export default function Home() {
  return (
    <div className="min-h-screen w-full p-2 lg:p-6 bg-[#f5f5f5]">
      <main className="max-w-3xl mx-auto">
        <HeroComponent></HeroComponent>
        <FeatureComponent></FeatureComponent>
        <CtaComponent></CtaComponent>
        <FooterComponent></FooterComponent>
      </main>
    </div>
  );
}
