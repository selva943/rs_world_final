import { Link, useLocation } from 'react-router';
import { Menu, X, ShoppingBasket, MessageCircle, Search, ChevronRight, Sparkles, Calendar, Zap, Package, User, ClipboardList, ShoppingCart, Home } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface NavLink {
  path: string;
  label: string;
  badge?: string;
  icon?: React.ReactNode;
}

export function Header() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { totalItems } = useCart();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showSubscriptionMenu, setShowSubscriptionMenu] = useState(false);


  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const primaryLinks: NavLink[] = [
    { path: '/', label: t('home'), icon: <Home className="w-4 h-4" /> },
    { path: '/deliverables', label: t('marketplace', 'Marketplace') },
    { path: '/recipes', label: t('recipes', 'Recipes'), badge: 'Popular' },
    { path: '/subscriptions', label: t('subscriptions', 'Subscriptions') },
    { path: '/services', label: t('services', 'Services') },
  ];

  const secondaryLinks: NavLink[] = [
    { path: '/offers', label: t('offers', 'Offers'), icon: <Sparkles className="w-4 h-4" /> },
    { path: '/my-orders', label: t('activity', 'Activity'), icon: <ClipboardList className="w-4 h-4" /> },
    { path: '/contact', label: t('support', 'Support'), icon: <MessageCircle className="w-4 h-4" /> },
  ];

  const subscriptionSubItems = [
    { title: 'Daily Essentials', desc: 'Milk, Egg & Bread', icon: <Zap className="w-4 h-4" />, path: '/subscriptions' },
    { title: 'Weekly Veggies', desc: 'Fresh Farm Picks', icon: <Package className="w-4 h-4" />, path: '/subscriptions' },
    { title: 'Monthly Packs', desc: 'Bulk Savings', icon: <Calendar className="w-4 h-4" />, path: '/subscriptions' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out px-4 md:px-8 py-3",
        scrolled
          ? "bg-white/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.04)] border-b border-gray-100/50 py-2"
          : "bg-transparent py-4"
      )}
    >
      <div className="max-w-7xl mx-auto w-full flex justify-between items-center px-0 md:px-6">
        {/* Left: Logo Section */}
        <Link to="/" className="flex items-center gap-4 group shrink-0">
          <motion.div
            whileHover={{ scale: 1.05, rotate: -5 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 md:w-11 md:h-11 bg-pb-green-deep rounded-[14px] flex items-center justify-center shadow-lg shadow-pb-green-deep/20"
          >
            <ShoppingBasket className="w-5 h-5 md:w-6 md:h-6 text-pb-yellow" />
          </motion.div>
          <div className="flex flex-col">
            <span className="text-xl md:text-2xl font-poppins font-bold text-pb-green-deep leading-tight tracking-tight">
              Palani<span className="text-pb-green-leaf">Basket</span>
            </span>
            <span className="text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-medium text-gray-500 font-inter">
              Digital Essential Services
            </span>
          </div>
        </Link>

        {/* Center: Desktop Navigation */}
        <nav className="hidden lg:flex items-center bg-gray-50/40 backdrop-blur-xl px-4 py-1.5 rounded-full border border-gray-200/50 gap-1 shadow-sm">
          {primaryLinks.map((link) => (
            <div
              key={link.path}
              className="relative group"
              onMouseEnter={() => link.label === 'Subscriptions' && setShowSubscriptionMenu(true)}
              onMouseLeave={() => link.label === 'Subscriptions' && setShowSubscriptionMenu(false)}
            >
              <Link
                to={link.path}
                className={cn(
                  "relative px-4 py-2 text-xs xl:text-sm font-bold transition-all duration-300 rounded-full flex items-center gap-2",
                  isActive(link.path)
                    ? "text-pb-green-deep"
                    : "text-gray-500 hover:text-pb-green-deep hover:bg-white/60"
                )}
              >
                {link.label}
                {link.badge && (
                  <span className="text-[7px] font-black uppercase tracking-widest bg-pb-yellow text-pb-green-deep px-1.5 py-0.5 rounded-full shadow-sm blink-soft">
                    {link.badge}
                  </span>
                )}
                {isActive(link.path) && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 bg-white shadow-sm rounded-full -z-10 border border-pb-green-soft/30"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>

              {/* Subscription Dropdown */}
              {link.label === 'Subscriptions' && (
                <AnimatePresence>
                  {showSubscriptionMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-64 bg-white/90 backdrop-blur-2xl rounded-2xl shadow-2xl shadow-emerald-900/10 border border-gray-100 overflow-hidden p-3"
                    >
                      <div className="space-y-1">
                        {subscriptionSubItems.map((item) => (
                          <Link
                            key={item.title}
                            to={item.path}
                            onClick={() => setShowSubscriptionMenu(false)}
                            className="block p-3 hover:bg-pb-green-soft rounded-xl transition-all cursor-pointer group/item"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-pb-green-deep shadow-sm">
                                {item.icon}
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-gray-900">{item.title}</h4>
                                <p className="text-[10px] text-gray-500">{item.desc}</p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                      <div className="mt-3 p-4 bg-pb-green-deep rounded-xl text-white">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-pb-yellow">Palani Premium</span>
                          <Sparkles className="w-3 h-3 text-pb-yellow animate-pulse" />
                        </div>
                        <p className="text-[10px] text-emerald-50/80 font-medium leading-tight">Fresh harvest at your door, every single day.</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          ))}
        </nav>

        {/* Right: Actions Section */}
        <div className="flex items-center gap-3 md:gap-4 shrink-0">
          {/* Language Toggle */}
          
          <button
            className="hidden md:flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors text-gray-600"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {user && (
            <Link to="/my-orders" className="hidden sm:block">
              <Button variant="ghost" className="w-10 h-10 rounded-full p-0 flex items-center justify-center text-pb-green-deep bg-pb-green-soft/50 hover:bg-pb-green-soft">
                <ClipboardList className="w-5 h-5" />
              </Button>
            </Link>
          )}

          <Link to="/checkout" className="relative group">
            <Button variant="ghost" className="w-10 h-10 rounded-full p-0 flex items-center justify-center text-pb-green-deep bg-emerald-50 hover:bg-emerald-100 group-hover:scale-110 transition-transform">
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-pb-yellow text-pb-green-deep text-[10px] font-black rounded-full flex items-center justify-center shadow-sm animate-in zoom-in duration-300">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>

          <Link to="/subscriptions" className="hidden xl:block">
            <Button variant="outline" className="px-4 py-2 rounded-lg whitespace-nowrap h-10 font-bold border-2">
              Subscribe
            </Button>
          </Link>

          <a
            href="https://wa.me/917550346705"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden xl:block"
          >
            <Button className="px-4 py-2 rounded-lg whitespace-nowrap h-10 font-bold gap-2">
              Contact us
              <ChevronRight className="w-4 h-4" />
            </Button>
          </a>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-pb-green-deep text-white shadow-lg shadow-pb-green-deep/20"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[-1] lg:hidden"
            />
            <motion.nav
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute top-full left-4 right-4 mt-2 p-4 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col gap-2 lg:hidden"
            >
              {/* Prioritize Main flows */}
              {[...primaryLinks, ...secondaryLinks].map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center justify-between px-5 py-4 rounded-xl text-base font-bold transition-all",
                    isActive(link.path)
                      ? "bg-emerald-500/10 text-pb-green-deep"
                      : "text-gray-600 hover:bg-gray-50",
                    link.label === 'Subscriptions' && "border border-pb-green-leaf/20 bg-pb-green-leaf/5"
                  )}
                >
                  <div className="flex items-center gap-4">
                    {link.icon && <div className="text-pb-green-deep opacity-60">{link.icon}</div>}
                    <div className="flex flex-col">
                      <span className={cn(isActive(link.path) ? "font-black" : "font-bold")}>{link.label}</span>
                      {link.label === 'Marketplace' && <span className="text-[9px] text-slate-400 font-medium -mt-1 uppercase tracking-tighter">Fresh Produce & Daily Essentials</span>}
                      {link.label === 'Services' && <span className="text-[9px] text-slate-400 font-medium -mt-1 uppercase tracking-tighter">Expert Support & Digital Solutions</span>}
                    </div>
                    {link.badge && (
                      <span className="text-[8px] font-black uppercase tracking-widest bg-pb-yellow text-pb-green-deep px-2 py-0.5 rounded-full shadow-sm">
                        {link.badge}
                      </span>
                    )}
                  </div>
                  <ChevronRight className={cn(
                    "w-4 h-4 transition-transform",
                    isActive(link.path) ? "translate-x-1 opacity-100" : "opacity-30"
                  )} />
                </Link>
              ))}
              <div className="grid grid-cols-2 gap-3 pt-2 mt-2 border-t border-gray-50">
                <Link to="/subscriptions" onClick={() => setMobileMenuOpen(false)}>
                  <Button size="md" variant="outline" className="w-full gap-2">
                    <Sparkles className="w-4 h-4" />
                    Subscribe
                  </Button>
                </Link>
                <a
                  href="https://wa.me/917550346705"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button size="md" className="w-full gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Order Now
                  </Button>
                </a>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
