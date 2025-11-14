import Header from './Header';
import Footer from './Footer';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageLayout({ children, className }: PageLayoutProps) {
  return (
    <>
      <Header />
      <div className={className}>
        {children}
        <Footer />
      </div>
    </>
  );
}
