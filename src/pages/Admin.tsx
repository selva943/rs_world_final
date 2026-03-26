import { useState } from 'react';
import {
  ShoppingBasket,
  Loader2,
  Lock,
  Gift,
  Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { Sidebar } from '@/components/admin/Sidebar';
import { DashboardOverview } from './admin/DashboardOverview';
import { ProductManagement } from './admin/ProductManagement';
import { OrderManagement } from './admin/OrderManagement';
import { TestimonialManagement } from './admin/TestimonialManagement';
import { UploadManager } from './admin/UploadManager';
import { OfferManagement } from './admin/OfferManagement';
import { CategoryManagement } from './admin/CategoryManagement';
import { RecipeManagement } from './admin/RecipeManagement';
import SubscriptionAdmin from './admin/SubscriptionAdmin';
import { ServiceDashboard } from './admin/ServiceDashboard';
import { ServiceManagement } from './admin/ServiceManagement';
import { BookingManagement } from './admin/BookingManagement';
import PromotionManagement from './admin/PromotionManagement';
import { DeliveryControl } from './admin/DeliveryControl';
import { SubscriptionManagement } from './admin/SubscriptionManagement';

export function Admin() {
  const { user, loading: authLoading, signIn } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error('Portal access denied: ' + error.message);
      } else {
        toast.success('Welcome back, Neighbor!');
      }
    } catch (err) {
      toast.error('An error occurred during authentication');
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F9F7]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-pb-green-deep/20 border-t-pb-green-deep rounded-full animate-spin"></div>
          <ShoppingBasket className="absolute inset-0 m-auto w-6 h-6 text-pb-green-deep animate-pulse" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen py-24 bg-[#F7F9F7] flex items-center relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-600/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-green-600/5 blur-[120px] rounded-full" />

        <div className="container mx-auto px-4 max-w-md relative z-10">
          <Card className="bg-white border border-slate-100 shadow-2xl rounded-[32px] overflow-hidden">
            <CardContent className="p-10">
              <div className="text-center mb-10">
                <div className="w-20 h-20 bg-pb-green-deep rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-900/20 transform hover:scale-110 transition-transform duration-500">
                  <Lock className="text-[#FFF59D] w-10 h-10" />
                </div>
                <h1 className="text-4xl font-playfair font-black text-pb-green-deep mb-3 tracking-tight">Admin Portal</h1>
                <p className="text-slate-400 font-medium">Restricted access for Palani Basket Team</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-8">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-bold text-slate-700 ml-1 uppercase tracking-widest text-[10px]">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-slate-50 border-slate-100 text-pb-green-deep py-7 rounded-2xl focus:border-pb-green-deep/50 focus:ring-pb-green-deep/10 placeholder:text-slate-300 transition-all px-6"
                    placeholder="admin@palanibasket.in"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <Label htmlFor="password" title="Password" className="text-sm font-bold text-slate-700 uppercase tracking-widest text-[10px]">Access Key</Label>
                    <button type="button" className="text-[10px] font-black uppercase tracking-widest text-pb-green-deep/60 hover:text-pb-green-deep transition-colors">Forgot Key?</button>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-slate-50 border-slate-100 text-pb-green-deep py-7 rounded-2xl focus:border-pb-green-deep/50 focus:ring-pb-green-deep/10 placeholder:text-slate-300 transition-all px-6"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-pb-green-deep hover:bg-emerald-800 text-white py-8 rounded-2xl font-black text-lg shadow-xl shadow-emerald-900/10 transition-all transform active:scale-[0.98]"
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" /> Unlocking Portal...
                    </span>
                  ) : 'Login to Dashboard'}
                </Button>
              </form>
            </CardContent>
          </Card>
          <p className="text-center mt-8 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
            © {new Date().getFullYear()} Palani Basket. All Rights Reserved.
          </p>
        </div>
      </div>
    );
  }

  // Active section renderer
  const renderSection = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'products':
        return <ProductManagement />;
      case 'orders':
        return <OrderManagement />;
      case 'testimonials':
        return <TestimonialManagement />;
      case 'promotions':
        return <PromotionManagement />;
      case 'categories':
        return <CategoryManagement />;
      case 'recipes':
        return <RecipeManagement />;
      case 'subscriptions':
        return <SubscriptionAdmin />;
      case 'svc_dash':
        return <ServiceDashboard />;
      case 'services':
        return <ServiceManagement />;
      case 'bookings':
        return <BookingManagement />;
      case 'uploads':
        return <UploadManager />;
      case 'delivery':
        return <DeliveryControl />;
      case 'subscription_mgmt':
        return <SubscriptionManagement />;
      case 'settings':
        return (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-[40px] border-2 border-dashed border-slate-100 max-w-4xl mx-auto">
            <h2 className="text-2xl font-black text-pb-green-deep mb-2 font-playfair">Portal Settings</h2>
            <p className="text-slate-400 font-medium">Settings module is being fortified. Coming soon!</p>
          </div>
        );
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9F7] text-pb-green-deep selection:bg-emerald-500/30">
      
      {/* Mobile Top Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-pb-green-deep/10 px-4 flex items-center justify-between z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-pb-green-deep flex items-center justify-center shadow-lg shadow-emerald-900/40 border border-pb-green-deep/10">
            <ShoppingBasket className="w-4 h-4 text-[#FFF59D]" />
          </div>
          <span className="font-black text-lg tracking-tighter text-pb-green-deep leading-none">Palani Basket</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="w-10 h-10 flex flex-col items-center justify-center bg-slate-50 border border-slate-100 rounded-xl text-pb-green-deep hover:bg-emerald-50 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
      />
      
      <main className="lg:ml-64 pt-20 lg:pt-10 p-4 sm:p-6 lg:p-10 min-h-screen relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-emerald-600/5 blur-[150px] rounded-full -z-10" />
        <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-green-600/5 blur-[150px] rounded-full -z-10" />
        
        <div className="max-w-7xl mx-auto relative">
          {renderSection()}
        </div>
        
        <footer className="mt-20 pt-10 border-t border-slate-100 text-center text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
          <p>Powered by Palani Basket Engine V1.2.0 • Serving Our Neighbors</p>
        </footer>
      </main>
    </div>
  );
}
