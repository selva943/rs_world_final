import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Image as ImageIcon, 
  MessageSquare, 
  Settings, 
  LogOut,
  ChevronRight,
  ShoppingBasket,
  Tag,
  LayoutGrid,
  ChefHat,
  TrendingUp,
  RefreshCcw,
  Activity,
  Wrench,
  BookOpen,
  CalendarCheck,
  Truck,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'motion/react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'subscriptions', label: 'Subscriptions', icon: RefreshCcw },
  { id: 'svc_dash', label: 'Svc Intelligence', icon: TrendingUp },
  { id: 'services', label: 'Service Studio', icon: Wrench },
  { id: 'bookings', label: 'Booking Center', icon: CalendarCheck },
  { id: 'products', label: 'Inventory', icon: Package },
  { id: 'categories', label: 'Categories', icon: LayoutGrid },
  { id: 'recipes', label: 'Recipe Studio', icon: ChefHat },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'delivery', label: 'Delivery Control', icon: Truck },
  { id: 'subscription_mgmt', label: 'Subscriptions', icon: Users },
  { id: 'promotions', label: 'Promotions', icon: Tag },
  { id: 'uploads', label: 'Media Library', icon: ImageIcon },
  { id: 'testimonials', label: 'Fresh Reviews', icon: MessageSquare },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen, setIsOpen }) => {
  const { signOut } = useAuth();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={cn(
        "fixed left-0 top-0 h-screen w-64 bg-white border-r border-pb-green-deep/10 p-6 flex flex-col z-50 shadow-sm transition-transform duration-300 lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
      <div className="flex items-center gap-4 mb-12 px-2">
        <div className="w-12 h-12 rounded-2xl bg-pb-green-deep flex items-center justify-center shadow-xl shadow-emerald-900/40 border border-pb-green-deep/10 group-hover:scale-105 transition-transform">
          <ShoppingBasket className="w-7 h-7 text-[#FFF59D]" />
        </div>
        <div className="flex flex-col">
          <span className="font-black text-xl tracking-tighter text-pb-green-deep leading-none">Palani</span>
          <span className="text-[10px] text-[#66BB6A] font-black uppercase tracking-widest mt-1">Basket Admin</span>
        </div>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsOpen(false);
              }}
              className={cn(
                "w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                isActive 
                  ? "bg-pb-green-deep text-[#FFF59D] shadow-lg shadow-emerald-900/40" 
                  : "text-slate-500 hover:text-pb-green-deep hover:bg-[#F7F9F7] transition-colors"
              )}
            >
              <div className="flex items-center gap-3 relative z-10">
                <Icon className={cn(
                  "w-5 h-5 transition-all duration-500",
                  isActive ? "text-[#FFF59D] scale-110" : "text-slate-400 group-hover:text-pb-green-deep group-hover:scale-110"
                )} />
                <span className={cn("font-bold tracking-tight", isActive ? "text-[#FFF59D]" : "group-hover:text-pb-green-deep")}>
                    {item.label}
                </span>
              </div>
              {isActive && (
                <motion.div 
                    layoutId="active-pill"
                    className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 to-transparent pointer-events-none"
                />
              )}
              {isActive && <ChevronRight className="w-4 h-4 text-[#FFF59D] relative z-10" />}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-100">
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all duration-300 group"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold tracking-tight">Logout</span>
        </button>
      </div>
    </aside>
    </>
  );
};
