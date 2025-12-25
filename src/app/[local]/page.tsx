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

export default function Home() {
  return (
    <div className="font-xft">
      <Header />
      <main>
        <HeroComponent />
        <BrandComponent />
        <AdminComponent />
        <FeatureComponent />
        <FeaturesCard />
        <FeaturesGrid />
        <CaseComponent />
        <PriceComponent />
        <FaqComponents />
        <FaqListComponent />
      </main>
      <Footer />
    </div>
  );
}
