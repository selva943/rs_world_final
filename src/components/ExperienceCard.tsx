import { useState } from 'react';
import { Experience } from '@/types/app';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import {
  ShoppingBasket,
  Truck,
  Zap,
  Package,
  CalendarDays,
  ShieldCheck,
  MessageCircle,
  Plus,
  Search,
  ChefHat
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { mapCategory } from '@/lib/services/api';
import { safeString } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { OrderModal } from './OrderModal';
import { SubscriptionModal } from './SubscriptionModal';
import { useCart } from '@/context/CartContext';
import { getOptimizedImageUrl } from '@/lib/utils/image-optimization';

interface ExperienceCardProps {
  experience: Experience;
}

export function ExperienceCard({ experience }: ExperienceCardProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { addToCart, items, updateQuantity } = useCart();
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);

  const cartItem = items.find(item => item.product_id === experience.id);

  const handleCardClick = () => {
    navigate(`/experience/${experience?.id}`);
  };

  const handleOrderClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (experience.type === 'service') {
      navigate(`/experience/${experience.id}`);
    } else {
      addToCart(experience);
    }
  };

  const handleSubscribe = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSubscriptionModalOpen(true);
  };

  const TypeIcon = () => {
    const type = safeString(experience?.type, 'product');
    switch (type) {
      case 'product': return <ShoppingBasket className="w-3 h-3" />;
      case 'service': return <Zap className="w-3 h-3" />;
      case 'subscription': return <Truck className="w-3 h-3" />;
      default: return <Package className="w-3 h-3" />;
    }
  };

  const category = safeString(mapCategory(experience), 'general');

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={{ y: -8 }}
        className="h-full"
      >
        <Card
          className="bg-white border-slate-100 overflow-hidden transition-all duration-300 cursor-pointer group rounded-2xl shadow-sm hover:shadow-md h-full flex flex-col"
          onClick={handleCardClick}
        >
        {/* Image Container */}
        <div className="relative h-[160px] w-full overflow-hidden bg-slate-50 flex-shrink-0">
          {experience?.image ? (
            <motion.img
              src={getOptimizedImageUrl(experience.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600', 500)}
              alt={safeString(experience?.name, 'Product')}
              className="w-full h-full object-cover transition-transform duration-700"
              whileHover={{ scale: 1.1 }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-slate-100">
              <Package className="w-12 h-12 text-slate-200" />
            </div>
          )}
            
            {/* Elegant Floating Badges */}
            <div className="absolute top-5 left-5 right-5 flex justify-between items-start pointer-events-none">
              <div className="flex flex-col gap-2">
                <Badge className={cn(
                  'bg-white/90 backdrop-blur-xl text-pb-green-deep border-none flex items-center gap-2 py-2 px-4 shadow-xl shadow-black/5 ring-1 ring-black/5',
                  !experience.is_active && 'bg-rose-50/90 text-rose-600'
                )}>
                  <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", experience.is_active ? "bg-emerald-500" : "bg-rose-500")} />
                  <span className="text-[10px] uppercase font-black tracking-widest leading-none">
                    {experience.is_active ? 'In Stock' : 'Out of Stock'}
                  </span>
                </Badge>
                
                {experience.is_subscription_available && (
                  <Badge className="bg-emerald-600/90 backdrop-blur-xl text-white border-none py-2 px-4 shadow-xl shadow-emerald-900/20 flex items-center gap-2 ring-1 ring-white/20">
                    <CalendarDays className="w-3 h-3" />
                    <span className="text-[10px] uppercase font-black tracking-widest leading-none">Subscription</span>
                  </Badge>
                )}
              </div>

              {experience?.is_recipe_kit && (
                <div className="w-10 h-10 rounded-full bg-[#FFF59D] text-pb-green-deep flex items-center justify-center shadow-xl ring-2 ring-white/50">
                  <ChefHat className="w-5 h-5" />
                </div>
              )}
            </div>

            {/* Hover Floating Actions Menu */}
            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
               <motion.div 
                 initial={{ scale: 0.9, opacity: 0 }}
                 whileHover={{ scale: 1 }}
                 className="flex gap-2 p-3 bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl ring-1 ring-black/5"
               >
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="w-12 h-12 rounded-full hover:bg-pb-green-deep hover:text-white transition-all shadow-sm"
                    onClick={(e) => { e.stopPropagation(); navigate(`/experience/${experience.id}`); }}
                  >
                    <Search className="w-5 h-5" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost"
                    className="w-12 h-12 rounded-full hover:bg-pb-green-deep hover:text-white transition-all shadow-sm"
                    onClick={handleOrderClick}
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
               </motion.div>
            </div>
          </div>

          {/* Details Section */}
          <CardContent className="p-4 flex flex-col flex-1 justify-between">
            {/* Title block */}
            <div className="mb-3">
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-pb-green-deep/60 mb-1">
                {category.replace(/_/g, ' ')}
              </span>
              <h3 className="text-base font-bold text-slate-800 line-clamp-2 leading-snug min-h-[2.5rem]">
                {safeString(experience?.name, 'Unnamed Product')}
              </h3>
              {experience.is_veg && (
                <div className="w-4 h-4 border-2 border-green-600 flex items-center justify-center p-0.5 rounded-sm mt-2 flex-shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-600" />
                </div>
              )}
            </div>

            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-sm font-bold text-slate-400">₹</span>
              <span className="text-2xl font-bold text-slate-900 tracking-tight">{experience.price}</span>
              <span className="text-xs font-medium text-slate-400 uppercase ml-1">/ {t(experience.unit?.toLowerCase() || 'unit', experience.unit || 'unit')}</span>
            </div>

            {/* Enhanced Action Buttons */}
            <div className="flex flex-col gap-2 mt-auto">
              {experience.type === 'service' ? (
                <Button
                  size="lg"
                  onClick={handleOrderClick}
                  disabled={!experience.is_active}
                  className="h-11 sm:h-12 w-full sm:w-auto px-6 rounded-2xl font-black uppercase tracking-widest bg-slate-900 hover:bg-black text-white shadow-xl shadow-black/10 transition-all"
                >
                  {t('book_now')}
                </Button>
              ) : (
                <>
                  {cartItem ? (
                    <div className="flex items-center justify-between h-[44px] w-full rounded-xl bg-emerald-50 border border-emerald-100 px-2 shadow-sm">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => { e.stopPropagation(); updateQuantity(cartItem.id, cartItem.quantity - 1); }}
                        className="w-8 h-8 rounded-full hover:bg-white text-emerald-700 font-bold hover:scale-100 active:scale-90"
                      >
                        -
                      </Button>
                      <span className="font-bold text-emerald-900 text-sm">
                        {cartItem.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => { e.stopPropagation(); updateQuantity(cartItem.id, cartItem.quantity + 1); }}
                        className="w-8 h-8 rounded-full hover:bg-white text-emerald-700 font-bold hover:scale-100 active:scale-90"
                      >
                        +
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="md"
                      onClick={handleOrderClick}
                      disabled={!experience.is_active}
                      className="w-full"
                    >
                      {t('add_to_cart')}
                    </Button>
                  )}
                  
                  {experience.is_subscription_available && (
                    <Button
                      size="md"
                      variant="outline"
                      onClick={handleSubscribe}
                      className="w-full"
                    >
                      {t('subscribe')}
                    </Button>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Order Modal */}
      <OrderModal
        isOpen={orderModalOpen}
        product={experience}
        onClose={() => setOrderModalOpen(false)}
      />
      <SubscriptionModal
        isOpen={subscriptionModalOpen}
        product={experience}
        onClose={() => setSubscriptionModalOpen(false)}
      />
    </>
  );
}
