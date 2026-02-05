import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import HeroComponent from '@/components/landingpage/HeroComponent';
import Footer from '@/components/Footer';

// 动态导入非首屏组件，减少首屏 JS bundle 大小
const BrandComponent = dynamic(() => import('@/components/landingpage/BrandComponent'));
const AdminComponent = dynamic(() => import('@/components/landingpage/AdminComponent'));
const FeatureComponent = dynamic(() => import('@/components/landingpage/FeatureComponent'));
const FeaturesCard = dynamic(() => import('@/components/landingpage/FeaturesCardComponent'));
const FeaturesGrid = dynamic(() => import('@/components/landingpage/FeaturesGridComponent'));
const CaseComponent = dynamic(() => import('@/components/landingpage/CaseComponent'));
const PriceComponent = dynamic(() => import('@/components/landingpage/PriceComponent'));
const FaqComponents = dynamic(() => import('@/components/landingpage/FaqComponents'));
const FaqListComponent = dynamic(() => import('@/components/landingpage/FaqListComponent'));

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
