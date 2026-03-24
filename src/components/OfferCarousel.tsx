import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Zap, Ticket, ArrowRight, Star } from 'lucide-react';
import { Button } from './ui/button';
import { Offer } from '@/types/app';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

interface OfferCarouselProps {
  offers: Offer[];
}

export function OfferCarousel({ offers }: OfferCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); 
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % offers.length);
  }, [offers.length]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + offers.length) % offers.length);
  }, [offers.length]);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  if (offers.length === 0) return null;

  const currentOffer = offers[currentIndex];

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 1,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1.05,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.8 },
        scale: { duration: 8, ease: "linear" },
      } as any,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 1.1,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.4 },
        scale: { duration: 0.4 }
      } as any,
    }),
  };

  return (
    <section 
      className="relative w-full h-[500px] md:h-[550px] lg:h-[600px] overflow-hidden bg-pb-green-deep rounded-[3rem] shadow-2xl shadow-emerald-900/20"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0 w-full h-full"
        >
          {/* Background Image with Zoom */}
          <div className="absolute inset-0 w-full h-full overflow-hidden">
            <motion.img
              src={currentOffer.banner_image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80'}
              alt={currentOffer.name}
              className="w-full h-full object-cover opacity-60"
              style={{ objectPosition: 'center center' }}
            />
            {/* Overlays */}
            <div className="absolute inset-0 bg-pb-green-deep/40 z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-pb-green-deep via-transparent to-pb-green-deep/60 z-10" />
          </div>

          {/* Content Container */}
          <div className="absolute inset-0 z-20 container mx-auto px-4 md:px-8 flex items-center justify-center text-center">
            <div className="max-w-4xl space-y-4 md:space-y-8 flex flex-col items-center">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 text-white"
              >
                <Sparkles className="w-3.5 h-3.5 animate-pulse text-[#FFF59D]" />
                <span className="text-[9px] md:text-xs font-black uppercase tracking-[0.4em]">{currentOffer.badge || 'Fresh Selection'}</span>
              </motion.div>

              {/* Title & Subtitle */}
              <div className="space-y-3 md:space-y-5 px-4">
                <motion.h1
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, type: "spring" }}
                  className="text-4xl md:text-7xl lg:text-9xl font-playfair font-bold text-white leading-[1.05] tracking-tighter"
                >
                  {currentOffer.name}
                </motion.h1>
                {currentOffer.description && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-lg md:text-2xl lg:text-3xl text-emerald-50 font-light italic max-w-2xl leading-relaxed"
                  >
                    "{currentOffer.description}"
                  </motion.p>
                )}
              </div>

              {/* Discount Highlight */}
              {currentOffer.discount_value > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="px-6 py-2 md:px-8 md:py-3 rounded-[2rem] bg-[#FFF59D] shadow-xl"
                >
                  <span className="text-2xl md:text-5xl font-black text-pb-green-deep uppercase tracking-wider">
                    {currentOffer.discount_type === 'percentage' 
                      ? `${currentOffer.discount_value}% OFF` 
                      : `₹${currentOffer.discount_value} OFF`}
                  </span>
                </motion.div>
              )}

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="pt-4 md:pt-8"
              >
                <Button
                  onClick={() => window.location.href = '/offers'}
                  className="group bg-white text-pb-green-deep hover:bg-emerald-50 rounded-full h-14 md:h-20 px-10 md:px-16 text-lg md:text-2xl font-black shadow-2xl transition-all hover:scale-105"
                >
                  Grab the Deal
                  <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" />
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <div className="absolute inset-y-0 left-2 md:left-6 z-30 flex items-center">
        <button
          onClick={prevSlide}
          className="p-3 md:p-5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all group lg:opacity-0 lg:group-hover:opacity-100"
        >
          <ChevronLeft className="w-5 h-5 md:w-7 md:h-7" />
        </button>
      </div>
      <div className="absolute inset-y-0 right-2 md:right-6 z-30 flex items-center">
        <button
          onClick={nextSlide}
          className="p-3 md:p-5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all group lg:opacity-0 lg:group-hover:opacity-100"
        >
          <ChevronRight className="w-5 h-5 md:w-7 md:h-7" />
        </button>
      </div>

      {/* Pagination Dots */}
      <div className="absolute bottom-10 left-0 w-full z-30 flex justify-center gap-3">
        {offers.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={cn(
              "h-1.5 transition-all duration-500 rounded-full",
              currentIndex === idx 
                ? "w-10 bg-[#FFF59D] shadow-[0_0_15px_rgba(255,245,157,0.5)]" 
                : "w-3 bg-white/20 hover:bg-white/40"
            )}
            title={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-pb-green-deep to-transparent z-25 pointer-events-none" />
    </section>
  );
}
