import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Offer } from '@/types/app';
import { Tag, Calendar, Percent, IndianRupee, X, Package, Users, Clock, TrendingUp, ArrowRight, Sparkles, Star } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

interface OfferCardProps {
  offer: Offer;
  variant?: 'compact' | 'premium' | 'detailed';
}

export function OfferCard({ offer, variant = 'premium' }: OfferCardProps) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const isExpired = offer.end_date && new Date(offer.end_date) < new Date();
  const isActive = offer.status && !isExpired;

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/offers');
  };

  const offerColor = offer.is_featured ? 'from-pb-green-deep to-[#66BB6A]' : 'from-emerald-600 to-green-500';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -10, scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={handleAction}
      className="cursor-pointer group relative h-full"
    >
      {/* Glow Effect */}
      <div className={cn(
        "absolute -inset-0.5 rounded-[2rem] bg-gradient-to-r blur-xl opacity-0 transition-opacity duration-500",
        offerColor,
        isHovered ? "opacity-20" : "opacity-0"
      )} />

      <Card className="relative overflow-hidden bg-white border border-slate-100 rounded-[2rem] h-full shadow-lg shadow-emerald-900/5">
        {/* Banner Section */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={offer.media?.[0] || offer.banner_image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80'}
            alt={offer.offer_name}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          />
          
          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {offer.is_featured && (
              <Badge className="bg-[#FFF59D] text-pb-green-deep border-none shadow-lg py-1.5 px-3 rounded-full font-black text-[10px] tracking-widest uppercase">
                <Star className="w-3 h-3 mr-1 fill-current" /> FEATURED
              </Badge>
            )}
            {offer.badge && (
              <Badge className="bg-pb-green-deep text-white border-none shadow-lg py-1.5 px-3 rounded-full font-black text-[10px] tracking-widest uppercase">
                <Sparkles className="w-3 h-3 mr-1" /> {offer.badge}
              </Badge>
            )}
          </div>

          {!isActive && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-20">
              <Badge variant="destructive" className="text-sm px-6 py-2 uppercase tracking-[0.2em] font-black border-none bg-red-600 text-white">
                {isExpired ? 'Expired' : 'Ended'}
              </Badge>
            </div>
          )}

          {/* Floating Discount Tag */}
          {offer.discount_text && (
            <div className="absolute bottom-4 right-4">
               <div className="bg-[#FFF59D] text-pb-green-deep px-4 py-2 rounded-2xl font-black text-sm shadow-xl border border-white/50 animate-pulse uppercase tracking-wide">
                {offer.discount_text}
              </div>
            </div>
          )}
        </div>

        {/* Content Section */}
        <CardContent className="p-8 pt-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-2xl font-black text-pb-green-deep leading-tight group-hover:text-emerald-600 transition-colors">
                {offer.offer_name}
              </h3>
              {offer.offer_subtitle && (
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mt-1">
                  {offer.offer_subtitle}
                </p>
              )}
            </div>

            <p className="text-slate-500 text-sm line-clamp-2 min-h-[2.5rem] font-light leading-relaxed italic">
              {offer.offer_description || "Fresh selection, incredible savings. Handpicked just for your daily needs."}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black">Valid Until</span>
                <span className="text-sm text-pb-green-deep font-black">
                  {offer.end_date ? new Date(offer.end_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'Ongoing'}
                </span>
              </div>
              
              <motion.div
                animate={isHovered ? { x: 5 } : { x: 0 }}
                className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100 group-hover:bg-pb-green-deep group-hover:border-pb-green-deep transition-all duration-300"
              >
                <ArrowRight className="w-5 h-5 text-pb-green-deep group-hover:text-white" />
              </motion.div>
            </div>
          </div>
        </CardContent>

        {/* Interactive Border */}
        <div className={cn(
          "absolute inset-0 rounded-[2rem] border-2 transition-all duration-500 pointer-events-none",
          isHovered ? "border-pb-green-deep/20" : "border-transparent"
        )} />
      </Card>
    </motion.div>
  );
}
