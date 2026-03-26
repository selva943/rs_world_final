import { ShoppingBasket, Phone, MapPin, Clock, Instagram, Send, Facebook } from 'lucide-react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

export function Footer() {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ta' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <footer className="bg-white border-t border-slate-100 mt-16 text-slate-600 pb-12">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* About */}
          <div className="flex flex-col gap-6">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-pb-green-deep flex items-center justify-center group-hover:rotate-6 transition-transform shadow-lg shadow-emerald-900/20">
                <ShoppingBasket className="w-6 h-6 text-[#FFF59D] transform -rotate-6" />
              </div>
              <span className="text-2xl font-playfair font-black tracking-tight text-pb-green-deep">
                PALANI BASKET
              </span>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">
              "{t('hero_badge')}" <br />
              {t('about_desc')}
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-pb-green-deep hover:text-white transition-all shadow-sm">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-pb-green-deep hover:text-white transition-all shadow-sm">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="text-pb-green-deep font-black uppercase tracking-widest text-[10px] mb-8">{t('footer_navigation')}</h3>
            <div className="flex flex-col gap-4 font-bold text-sm">
              <Link to="/experiences" className="text-slate-500 hover:text-pb-green-deep transition-colors flex items-center gap-2">
                {t('footer_browse_marketplace')}
              </Link>
              <Link to="/offers" className="text-slate-500 hover:text-pb-green-deep transition-colors flex items-center gap-2">
                {t('footer_daily_savings')}
              </Link>
              <Link to="/about" className="text-slate-500 hover:text-pb-green-deep transition-colors flex items-center gap-2">
                {t('footer_mission')}
              </Link>
              <Link to="/contact" className="text-slate-500 hover:text-pb-green-deep transition-colors flex items-center gap-2">
                {t('contact_us')}
              </Link>
            </div>
          </div>

          {/* Quick Support */}
          <div>
            <h3 className="text-pb-green-deep font-black uppercase tracking-widest text-[10px] mb-8">{t('footer_get_in_touch')}</h3>
            <div className="flex flex-col gap-5 text-sm font-medium">
              <div className="flex items-start gap-3 group">
                <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg bg-emerald-50 text-pb-green-deep">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <a href="tel:+917550346705" className="text-slate-600 font-bold block hover:text-pb-green-deep underline decoration-[#FFF59D] decoration-2">
                    +91 7550346705
                  </a>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">{t('footer_whatsapp_support')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 group">
                <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg bg-emerald-50 text-pb-green-deep">
                  <MapPin className="w-4 h-4" />
                </div>
                <p className="text-slate-500 leading-tight">
                  142, Northstreet,<br />
                  Sivagiripatti, Palani - 624601
                </p>
              </div>
            </div>
          </div>

          {/* Neighborhood Alerts */}
          <div>
            <h3 className="text-pb-green-deep font-black uppercase tracking-widest text-[10px] mb-8">{t('footer_neighborhood_deals')}</h3>
            <p className="text-sm text-slate-500 mb-6 font-medium leading-relaxed">{t('footer_neighborhood_deals_desc')}</p>
            <div className="flex gap-2">
              <input 
                type="tel" 
                placeholder={t('footer_phone_placeholder')} 
                className="bg-slate-50 border border-slate-100 rounded-[10px] px-5 py-3 text-sm w-full focus:outline-none focus:border-pb-green-deep/30 focus:bg-white transition-all shadow-inner"
              />
              <button className="bg-pb-green-deep text-white p-3 rounded-xl hover:scale-105 transition-all shadow-lg shadow-emerald-900/10 active:scale-95 group">
                <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-50 mt-16 pt-12 flex flex-col md:flex-row items-center justify-between gap-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
          <p>© 2026 Palani Basket. {t('footer_serving_palani')}</p>
          <div className="flex items-center gap-8">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-emerald-50 hover:border-emerald-100 transition-all text-slate-400 hover:text-pb-green-deep active:scale-95"
            >
              <span className={cn(i18n.language === 'en' ? "text-pb-green-deep" : "text-slate-300")}>EN</span>
              <span className="text-slate-200">|</span>
              <span className={cn(i18n.language === 'ta' ? "text-pb-green-deep" : "text-slate-300")}>தமிழ்</span>
            </button>
            <Link to="#" className="hover:text-pb-green-deep transition-colors">{t('privacy_policy')}</Link>
            <Link to="#" className="hover:text-pb-green-deep transition-colors">{t('terms_service')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
