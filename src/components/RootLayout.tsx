import { Outlet } from 'react-router';
import { Header } from './Header';
import { Footer } from './Footer';
import ScrollToTop from './ScrollToTop';

export function RootLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground relative font-inter transition-colors duration-300">
      {/* Subtle Background Pattern or Gradient */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-pb-green-soft/30 to-transparent" />
        <div className="absolute -top-[10%] -right-[5%] w-[40%] h-[40%] bg-pb-green-leaf/5 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -left-[5%] w-[30%] h-[30%] bg-pb-yellow/10 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <ScrollToTop />
        <Header />
        <main className="flex-1 pt-24 md:pt-28">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
