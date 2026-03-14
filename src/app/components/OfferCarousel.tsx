import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Tag } from 'lucide-react';
import { Button } from './ui/button';
import { OfferCard } from './OfferCard';
import { Offer } from '../types';

interface OfferCarouselProps {
  offers: Offer[];
  title?: string;
  subtitle?: string;
  autoPlay?: boolean;
  interval?: number;
}

export function OfferCarousel({ 
  offers, 
  title = "Special Offers", 
  subtitle = "Limited time deals on quality tools",
  autoPlay = false,
  interval = 5000 
}: OfferCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const itemsPerView = {
    mobile: 1,
    tablet: 2,
    desktop: 3,
    large: 4
  };

  const totalItems = offers.length;
  const maxIndex = Math.max(0, totalItems - itemsPerView.desktop);

  useEffect(() => {
    if (!autoPlay || isPaused || totalItems <= itemsPerView.desktop) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, isPaused, interval, maxIndex, totalItems]);

  const scrollToIndex = (index: number) => {
    if (scrollRef.current) {
      const scrollAmount = (scrollRef.current.scrollWidth / totalItems) * index;
      scrollRef.current.scrollTo({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
    setCurrentIndex(index);
  };

  const scrollLeft = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : maxIndex;
    scrollToIndex(newIndex);
  };

  const scrollRight = () => {
    const newIndex = currentIndex < maxIndex ? currentIndex + 1 : 0;
    scrollToIndex(newIndex);
  };

  const handleDotClick = (index: number) => {
    scrollToIndex(index);
  };

  if (offers.length === 0) return null;

  return (
    <section className="py-12 bg-gradient-to-r from-red-50 to-orange-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-red-100 text-red-800 rounded-full">
            <Tag className="w-5 h-5" />
            <span className="text-lg font-semibold">{title}</span>
          </div>
          <h2 className="text-3xl md:text-4xl mb-2 font-bold">{title}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          {totalItems > itemsPerView.desktop && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg hover:bg-gray-50"
                onClick={scrollLeft}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg hover:bg-gray-50"
                onClick={scrollRight}
                disabled={currentIndex === maxIndex}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {/* Offers Scroll Container */}
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            {offers.map((offer, index) => (
              <div
                key={offer.id}
                className="flex-shrink-0 w-full sm:w-1/2 lg:w-1/3 xl:w-1/4"
              >
                <OfferCard offer={offer} />
              </div>
            ))}
          </div>

          {/* Dots Indicator */}
          {totalItems > itemsPerView.desktop && (
            <div className="flex justify-center mt-6 gap-2">
              {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'bg-[var(--ingco-yellow)] w-8'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  onClick={() => handleDotClick(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* View All Offers Button */}
        <div className="text-center mt-8">
          <Button
            variant="outline"
            className="border-[var(--ingco-yellow)] text-[var(--ingco-yellow)] hover:bg-[var(--ingco-yellow)] hover:text-black"
            onClick={() => window.location.href = '/offers'}
          >
            View All Offers
          </Button>
        </div>
      </div>
    </section>
  );
}
