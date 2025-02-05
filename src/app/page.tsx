import Header from '@/components/Header';
import HeroComponent from '@/components/landingpage/HeroComponent';
import FeatureComponent from '@/components/landingpage/FeatureComponent';
import FeaturesCard from '@/components/landingpage/FeaturesCardComponent';
import FeaturesGrid from '@/components/landingpage/FeaturesGridComponent';
import CaseComponent from '@/components/landingpage/CaseComponent';
import PriceComponent from '@/components/landingpage/PriceComponent';
import FaqComponents from '@/components/landingpage/FaqComponents';
import FaqListComponent from '@/components/landingpage/FaqListComponent';
import Footer from '@/components/Footer';
import { landingpageConfig } from '@/store/landingpage';

export default function Home() {
  return (
    <div className="font-xft">
      <Header></Header>
      <main>
        <HeroComponent></HeroComponent>
        <FeatureComponent></FeatureComponent>
        {landingpageConfig.featureCard && (
          <FeaturesCard features={landingpageConfig.featureCard}></FeaturesCard>
        )}
        {landingpageConfig.featureGrid && (
          <FeaturesGrid features={landingpageConfig.featureGrid}></FeaturesGrid>
        )}
        <CaseComponent></CaseComponent>
        <PriceComponent></PriceComponent>
        <FaqComponents></FaqComponents>
        {landingpageConfig.faqList && (
          <FaqListComponent
            items={landingpageConfig.faqList}
          ></FaqListComponent>
        )}
      </main>
      <Footer></Footer>
    </div>
  );
}
