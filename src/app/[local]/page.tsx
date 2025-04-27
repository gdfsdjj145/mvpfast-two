import Header from '@/components/Header';
import HeroComponent from '@/components/landingpage/HeroComponent';
import BrandComponent from '@/components/landingpage/BrandComponent';
import AdminComponent from '@/components/landingpage/AdminComponent';
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
        {landingpageConfig.hero && (
          <HeroComponent hero={landingpageConfig.hero}></HeroComponent>
        )}
        {landingpageConfig.brand && (
          <BrandComponent brand={landingpageConfig.brand}></BrandComponent>
        )}
        {landingpageConfig.admin && (
          <AdminComponent admin={landingpageConfig.admin}></AdminComponent>
        )}
        {landingpageConfig.feature && (
          <FeatureComponent
            feature={landingpageConfig.feature}
          ></FeatureComponent>
        )}
        {landingpageConfig.featureCard && (
          <FeaturesCard features={landingpageConfig.featureCard}></FeaturesCard>
        )}
        {landingpageConfig.featureGrid && (
          <FeaturesGrid features={landingpageConfig.featureGrid}></FeaturesGrid>
        )}
        {landingpageConfig.case && (
          <CaseComponent items={landingpageConfig.case}></CaseComponent>
        )}
        {landingpageConfig.price && (
          <PriceComponent items={landingpageConfig.price}></PriceComponent>
        )}
        {landingpageConfig.faq && (
          <FaqComponents items={landingpageConfig.faq}></FaqComponents>
        )}
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
