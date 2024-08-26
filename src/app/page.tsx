import Header from '@/components/Header';
import HeroComponent from '@/components/landingpage/HeroComponent';
import FeatureComponent from '@/components/landingpage/FeatureComponent';
import CaseComponent from '@/components/landingpage/CaseComponent';
import PriceComponent from '@/components/landingpage/PriceComponent';
import FaqComponents from '@/components/landingpage/FaqComponents';
import FooterComponent from '@/components/landingpage/FooterComponent';

export default function Home() {
  return (
    <div>
      <Header></Header>
      <main>
        <HeroComponent></HeroComponent>
        <FeatureComponent></FeatureComponent>
        <CaseComponent></CaseComponent>
        <PriceComponent></PriceComponent>
        <FaqComponents></FaqComponents>
        <FooterComponent></FooterComponent>
      </main>
    </div>
  );
}
