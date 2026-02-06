import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import HeroComponent from '@/components/landingpage/HeroComponent';
import Footer from '@/components/Footer';

// 动态导入非首屏组件，减少首屏 JS bundle 大小
const BrandComponent = dynamic(() => import('@/components/landingpage/BrandComponent'));
const AIShowcaseComponent = dynamic(() => import('@/components/landingpage/AIShowcaseComponent'));
const AdminComponent = dynamic(() => import('@/components/landingpage/AdminComponent'));
const FeatureComponent = dynamic(() => import('@/components/landingpage/FeatureComponent'));
<<<<<<< HEAD
const CaseComponent = dynamic(() => import('@/components/landingpage/CaseComponent'));
const PriceComponent = dynamic(() => import('@/components/landingpage/PriceComponent'));
const FaqComponents = dynamic(() => import('@/components/landingpage/FaqComponents'));
=======
const FeaturesCard = dynamic(() => import('@/components/landingpage/FeaturesCardComponent'));
const FeaturesGrid = dynamic(() => import('@/components/landingpage/FeaturesGridComponent'));
const CaseComponent = dynamic(() => import('@/components/landingpage/CaseComponent'));
const PriceComponent = dynamic(() => import('@/components/landingpage/PriceComponent'));
const FaqComponents = dynamic(() => import('@/components/landingpage/FaqComponents'));
const FaqListComponent = dynamic(() => import('@/components/landingpage/FaqListComponent'));
>>>>>>> upstream/feature/2.0

export default function Home() {
  return (
    <div className="font-xft">
      <Header />
      <main>
        <HeroComponent />
        <BrandComponent />
        <AIShowcaseComponent />
        <AdminComponent />
        <FeatureComponent />
<<<<<<< HEAD
        <CaseComponent />
        <PriceComponent />
        <FaqComponents />
=======
        <FeaturesCard />
        <FeaturesGrid />
        <CaseComponent />
        <PriceComponent />
        <FaqComponents />
        <FaqListComponent />
>>>>>>> upstream/feature/2.0
      </main>
      <Footer />
    </div>
  );
}
