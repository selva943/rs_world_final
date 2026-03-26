import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Heart,
  Sparkles,
  ShoppingBasket,
  Play,
  Calendar,
  Gift,
  Star,
  ArrowRight,
  Send,
  Lock,
  MessageCircle,
  Wand2,
  Tag,
} from 'lucide-react';
import { ExperienceCard } from '@/components/ExperienceCard';
import { useData } from '@/context/DataContext';
import { useState, useEffect } from 'react';
import { Experience, Offer, Coupon } from '@/types/app';
import { offersApi, experiencesApi, couponsApi } from '@/lib/services/api';
import { OfferCarousel } from '@/components/OfferCarousel';
import { PromoTicker } from '@/components/PromoTicker';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export function Home() {
  const { t } = useTranslation();
  const { experiences, testimonials, loading } = useData();
  const [featuredProducts, setFeaturedProducts] = useState<Experience[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [offersLoading, setOffersLoading] = useState(true);

  useEffect(() => {
    const fetchPromos = async () => {
      const [activeOffers, activeCoupons] = await Promise.all([
        offersApi.getActive(),
        couponsApi.getAll()
      ]);
      setOffers(activeOffers);
      setCoupons(activeCoupons.filter(c => c.is_active));
      setOffersLoading(false);
    };

    const fetchFeatured = async () => {
      const featured = await experiencesApi.getAll({ is_featured: true, limit: 8 });
      setFeaturedProducts(featured);
    };

    fetchPromos();
    fetchFeatured();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F9F7]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-pb-green-deep border-t-transparent rounded-full animate-spin shadow-lg shadow-emerald-900/10"></div>
          <p className="text-pb-green-deep font-black animate-pulse uppercase tracking-widest text-xs">{t('loading', 'Loading Freshness...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">      {/* Hero Section */}
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center pt-10 overflow-hidden bg-[#F7F9F7]">
        <div className="container mx-auto px-4 relative z-10">
          {/* Promo Ticker - Headless version */}
          {!offersLoading && (offers.length > 0 || coupons.length > 0) && (
            <div className="mb-8 -mx-4 animate-in fade-in slide-in-from-top-4 duration-1000">
              <PromoTicker 
                offers={offers} 
                coupons={coupons}
                className="" 
              />
            </div>
          )}
          
          <div className="max-w-4xl">

            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 glass rounded-full text-pb-green-deep text-sm font-black uppercase tracking-widest animate-in fade-in slide-in-from-left-4 duration-1000 border-pb-green-deep/10 shadow-sm">
              <ShoppingBasket className="w-4 h-4" />
              {t('hero_badge')}
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-playfair font-bold mb-6 leading-tight text-pb-green-deep animate-in fade-in slide-in-from-bottom-8 duration-1000">
              {t('hero_title_part1')} <br />
              <span className="bg-gradient-pb bg-clip-text text-transparent italic">
                {t('hero_title_part2')}
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-600 mb-8 max-w-2xl leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              {t('hero_desc')}
            </p>

            <div className="flex flex-wrap gap-5 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
              <Link to="/Deliverables">
                <Button
                  size="lg"
                  className="bg-pb-green-deep text-[#FFF59D] hover:bg-[#2e7d32] hover:scale-105 transition-all px-10 py-7 text-lg shadow-xl shadow-emerald-900/10 rounded-[1.5rem] font-black uppercase tracking-widest h-auto"
                >
                  {t('shop_now')}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>

              <a
                href="https://wa.me/917550346705"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/50 backdrop-blur-md text-pb-green-deep border-pb-green-deep/10 hover:bg-white/80 px-10 py-7 text-lg rounded-[1.5rem] font-black uppercase tracking-widest h-auto shadow-sm"
                >
                  {t('book_service')}
                  <MessageCircle className="w-5 h-5 ml-2 text-pb-green-deep" />
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Floating Decorative Elements */}
        <div className="absolute top-1/4 right-10 w-64 h-64 bg-[#66BB6A]/10 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 left-10 w-96 h-96 bg-pb-green-deep/5 blur-[150px] rounded-full animate-pulse delay-700"></div>
      </section>

      {/* Category Grid Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-playfair font-bold text-pb-green-deep mb-6">{t('local_categories')}</h2>
            <p className="text-slate-500 max-w-2xl mx-auto font-medium">{t('local_categories_desc')}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {['vegetables', 'fruits', 'daily_essentials', 'recipe_kits', 'services', 'subscriptions', 'bookings'].map((catId) => {
              const categoryMap: Record<string, { name: string, icon: any, color: string, desc: string }> = {
                'vegetables': { name: t('cat_vegetables'), icon: ShoppingBasket, color: 'bg-emerald-50', desc: t('desc_fresh_local') },
                'fruits': { name: t('cat_fruits'), icon: Gift, color: 'bg-orange-50', desc: t('desc_seasonal_pick') },
                'daily_essentials': { name: t('cat_essentials'), icon: Star, color: 'bg-blue-50', desc: t('desc_daily_staples') },
                'recipe_kits': { name: t('cat_recipe_kits'), icon: Sparkles, color: 'bg-amber-50', desc: t('desc_cook_in_20m') },
                'services': { name: t('cat_services'), icon: Wand2, color: 'bg-slate-50', desc: t('desc_trusted_pros') },
                'subscriptions': { name: t('cat_subscriptions'), icon: Tag, color: 'bg-emerald-50', desc: t('desc_daily_savings') },
                'bookings': { name: t('cat_bookings'), icon: Calendar, color: 'bg-slate-50', desc: t('desc_taxi_travel') }
              };
              const cat = categoryMap[catId] || { name: catId, icon: ShoppingBasket, color: 'bg-slate-50', desc: 'Market Item' };
              const Icon = cat.icon;
              return (
                <Link
                  key={catId}
                  to={`/deliverables?category=${catId}`}
                  className={cn(
                    "flex flex-col items-center justify-center p-6 rounded-2xl transition-all hover:scale-105 group border border-transparent hover:border-pb-green-deep/10 hover:shadow-md",
                    cat.color
                  )}
                >
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mb-3 shadow-sm group-hover:bg-pb-green-deep transition-all duration-300">
                    <Icon className="w-6 h-6 text-pb-green-deep group-hover:text-pb-yellow transition-colors" />
                  </div>
                  <span className="text-[10px] font-bold text-pb-green-deep text-center uppercase tracking-wider">{cat.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-[#F7F9F7]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div>
              <div className="text-[#66BB6A] font-black uppercase tracking-[0.3em] text-[10px] mb-4">{t('fresh_off_farm')}</div>
              <h2 className="text-4xl md:text-6xl font-playfair font-bold text-pb-green-deep">{t('popular_now')}</h2>
            </div>
            <Link to="/Deliverables">
              <Button variant="outline" className="border-pb-green-deep/20 text-pb-green-deep hover:bg-pb-green-deep hover:text-[#FFF59D] rounded-[1.5rem] px-8 h-14 font-black uppercase tracking-widest text-xs transition-all">
                {t('view_all_products')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts.map((product) => (
              <ExperienceCard key={product.id} experience={product} />
            ))}
          </div>
        </div>
      </section>



      {/* How It Works */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-playfair font-bold text-pb-green-deep mb-6">{t('simple_trustworthy')}</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">{t('simple_trustworthy_desc')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="text-center space-y-6 group">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-100 flex items-center justify-center text-3xl font-bold text-pb-green-deep group-hover:scale-110 transition-transform shadow-lg shadow-emerald-200">01</div>
              <h3 className="text-2xl font-bold text-slate-800">{t('how_it_works_step1_title')}</h3>
              <p className="text-slate-500 text-sm">{t('how_it_works_step1_desc')}</p>
            </div>

            <div className="text-center space-y-6 group">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-pb-yellow flex items-center justify-center text-3xl font-bold text-pb-green-deep group-hover:scale-110 transition-transform shadow-lg shadow-pb-yellow/20">02</div>
              <h3 className="text-2xl font-bold text-slate-800">{t('how_it_works_step2_title')}</h3>
              <p className="text-slate-500 text-sm">{t('how_it_works_step2_desc')}</p>
            </div>

            <div className="text-center space-y-6 group">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-pb-green-soft flex items-center justify-center text-3xl font-bold text-pb-green-deep group-hover:scale-110 transition-transform shadow-lg shadow-pb-green-soft/50">03</div>
              <h3 className="text-2xl font-bold text-slate-800">{t('how_it_works_step3_title')}</h3>
              <p className="text-slate-500 text-sm">{t('how_it_works_step3_desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 relative overflow-hidden bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-[#FFF59D] text-[#FFF59D]" />
              ))}
            </div>
            <h2 className="text-4xl md:text-5xl font-playfair font-bold text-pb-green-deep mb-6">Neighborhood Stories</h2>
            <p className="text-slate-500">Trusted by 1000+ local families in Palani for daily essentials and home care.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.slice(0, 3).map((testimonial) => (
              <Card key={testimonial.id} className="bg-slate-50 border-transparent hover:border-pb-green-deep/10 transition-all p-8 relative rounded-[2rem]">
                <div className="absolute top-4 right-4 text-4xl font-serif text-pb-green-deep/10">"</div>
                <CardContent className="p-0 space-y-6">
                  <p className="text-slate-600 italic text-lg leading-relaxed font-playfair">
                    {testimonial.message}
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-pb-green-deep flex items-center justify-center font-bold text-[#FFF59D]">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{testimonial.name}</p>
                      <p className="text-[10px] text-pb-green-deep uppercase tracking-widest font-black">Trusted Neighbor</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative bg-[#F7F9F7]">
        <div className="container mx-auto px-4">
          <div className="bg-pb-green-deep rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-pb-green-deep/30">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#66BB6A]/10 blur-3xl rounded-full"></div>

            <h2 className="text-4xl md:text-6xl font-playfair font-bold text-white mb-8 relative z-10">
              Your Local Market <br /> <span className="text-[#FFF59D] italic">Just a Tap Away</span>
            </h2>
            <p className="text-xl text-emerald-50/80 mb-10 max-w-2xl mx-auto relative z-10">
              Experience the convenience of hyperlocal shopping and services. Fresh, fast, and friendly.
            </p>
            <div className="flex flex-wrap justify-center gap-6 relative z-10">
              <Link to="/deliverables">
                <Button size="lg" className="bg-[#FFF59D] text-pb-green-deep hover:bg-white hover:scale-105 transition-all px-10 py-8 text-xl shadow-xl rounded-2xl border-none">
                  Shop Now
                </Button>
              </Link>
              <a href="https://wa.me/917550346705">
                <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 px-10 py-8 text-xl rounded-2xl">
                  Message Us on WhatsApp
                  <MessageCircle className="w-5 h-5 ml-2" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
