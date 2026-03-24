import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Heart, Wand2, Star, Zap, Clock, ShieldCheck } from 'lucide-react';

export function About() {
  return (
    <div className="py-24 bg-[#F7F9F7] min-h-screen text-slate-800">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16 relative">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 bg-pb-green-deep/10 rounded-full text-pb-green-deep text-xs font-bold tracking-widest uppercase border border-pb-green-deep/20">
            <Sparkles className="w-3.5 h-3.5" />
            Our Fresh Story
          </div>
          <h1 className="text-5xl md:text-6xl font-playfair font-bold text-pb-green-deep mb-6">Your Digital Refrigerator</h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto italic">
            "We aren't just a grocery app. We are the boys next door, delivering daily freshness to your home."
          </p>
        </div>

        {/* Vision Section */}
        <div className="max-w-4xl mx-auto mb-20">
          <div className="bg-white p-12 rounded-[3rem] border border-slate-100 relative overflow-hidden group shadow-xl shadow-emerald-900/5">
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
              <div className="w-40 h-40 bg-pb-green-deep rounded-full flex items-center justify-center shadow-xl shadow-emerald-900/20 group-hover:scale-110 transition-transform duration-500">
                <Heart className="w-20 h-20 text-[#FFF59D] animate-pulse" />
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-playfair font-bold text-pb-green-deep mb-4">Our Mission</h2>
                <p className="text-slate-600 leading-relaxed text-lg">
                  Palani Basket was born out of a simple need: reliable access to fresh produce and essential services in our hometown. We've transformed the traditional grocery experience into a seamless digital journey, ensuring that your refrigerator is always stocked with the best local harvest.
                </p>
                <p className="text-slate-600 leading-relaxed mt-4">
                  From crisp vegetables to curated recipe kits and professional home services, we're dedicated to making your life easier, one delivery at a time.
                </p>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-3xl pointer-events-none"></div>
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-24">
          <h2 className="text-4xl text-center font-playfair font-bold text-pb-green-deep mb-12">The Palani Pillars</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: ShieldCheck, title: 'Quality', desc: 'Handpicked freshness from local farms directly to your doorstep.' },
              { icon: Clock, title: 'Daily', desc: 'Consistent, on-time deliveries that fit your busy schedule.' },
              { icon: Zap, title: 'Hyperlocal', desc: 'Focused exclusively on Palani to provide the best service.' },
              { icon: Heart, title: 'Trust', desc: 'Founded and run by locals who understand your needs.' }
            ].map((value, i) => (
              <div key={i} className="bg-white p-8 rounded-[2rem] text-center border border-slate-100 hover:border-pb-green-deep/30 transition-all group shadow-sm">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-emerald-50 flex items-center justify-center group-hover:bg-pb-green-deep transition-colors">
                  <value.icon className="w-8 h-8 text-pb-green-deep group-hover:text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{value.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Global Reach, Local Heart */}
        <div className="text-center mb-24">
           <Card className="bg-pb-green-deep border-transparent p-12 rounded-[3rem] shadow-2xl shadow-emerald-900/20">
              <CardContent className="p-0">
                <h2 className="text-3xl font-playfair font-bold text-white mb-6">Born in Palani, Serving Neighbors</h2>
                <p className="text-emerald-50 max-w-3xl mx-auto text-lg mb-8 leading-relaxed">
                  Located right in the heart of Palani at Santhai Road, we're proud to be part of this community. Our team knows every street and every corner, ensuring that your orders are delivered with a personal, local touch that only neighbors can provide.
                </p>
                <div className="flex flex-wrap justify-center gap-6">
                  <div className="flex items-center gap-2 px-6 py-3 bg-white/10 rounded-full border border-white/20 text-white">
                    <ShieldCheck className="w-5 h-5 text-[#FFF59D]" />
                    <span>Pure Quality</span>
                  </div>
                  <div className="flex items-center gap-2 px-6 py-3 bg-white/10 rounded-full border border-white/20 text-white">
                    <Clock className="w-5 h-5 text-[#FFF59D]" />
                    <span>Daily Delivery</span>
                  </div>
                </div>
              </CardContent>
           </Card>
        </div>

        {/* Visit Our Operations Hub */}
        <div className="text-center max-w-2xl mx-auto py-12">
          <h2 className="text-3xl font-playfair font-bold text-pb-green-deep mb-6">Our Operations Hub</h2>
          <p className="text-lg text-slate-500 mb-8">
            Have questions or want to partner with us? Visit our hub and meet the team behind your daily deliveries.
          </p>
          <div className="space-y-4 text-slate-600">
            <p className="flex items-center justify-center gap-2 font-medium">
              <span className="text-pb-green-deep">Address:</span> 60/12, Santhai Road, Shanmugappuram, Palani, TN
            </p>
            <p className="flex items-center justify-center gap-2 font-medium">
              <span className="text-pb-green-deep">Operating Hours:</span> 6 AM - 10 PM DAILY
            </p>
            <p className="text-pb-green-deep font-bold italic mt-6">"The Boys from Your Next Door"</p>
          </div>
        </div>
      </div>
    </div>
  );
}
