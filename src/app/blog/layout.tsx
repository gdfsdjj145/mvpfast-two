import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function BlogPage({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Header />
      <main className="container mx-auto px-4 py-8">{children}</main>
      <Footer />
    </div>
  );
}
