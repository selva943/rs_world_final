import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Phone, Clock, MessageCircle, Sparkles, Send } from 'lucide-react';
import { toast } from 'sonner';
import { enquiriesApi } from '@/lib/services/api';

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const success = await enquiriesApi.add({
        name: formData.name,
        phone: formData.phone,
        message: formData.message,
        type: 'general',
      });

      if (success) {
        const whatsappMessage = `
🧺 New Palani Basket Enquiry! 🧺
👤 Name: ${formData.name}
📱 Phone: ${formData.phone}
📝 Message: ${formData.message}

The Boys from Your Next Door will get back to you! 🥦
        `.trim();

        const url = `https://wa.me/917550346705?text=${encodeURIComponent(whatsappMessage)}`;
        window.open(url, '_blank');

        toast.success('Your message has been sent! We will reach out shortly.');

        setFormData({
          name: '',
          phone: '',
          message: '',
        });
      } else {
        toast.error('Failed to send request. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-24 bg-[#F7F9F7] min-h-screen text-slate-800">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16 relative">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 bg-pb-green-deep/10 rounded-full text-pb-green-deep text-xs font-bold tracking-widest uppercase border border-pb-green-deep/20">
            <MessageCircle className="w-3.5 h-3.5" />
            Connect With Your Neighbors
          </div>
          <h1 className="text-5xl md:text-6xl font-playfair font-bold text-pb-green-deep mb-6">How Can We Help?</h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Need help with your order, a specific product, or one of our services? The Boys from Your Next Door are just a message away.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-emerald-900/5">
              <h2 className="text-3xl font-playfair font-bold text-pb-green-deep mb-8">Reach Us Directly</h2>

              <div className="space-y-8">
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 flex-shrink-0 rounded-2xl bg-pb-green-deep flex items-center justify-center shadow-lg shadow-emerald-900/20">
                    <Phone className="w-7 h-7 text-[#FFF59D]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">Call or WhatsApp</h3>
                    <a
                      href="tel:+917550346705"
                      className="text-2xl text-pb-green-deep font-black hover:underline"
                    >
                      +91 7550346705
                    </a>
                    <p className="text-sm text-slate-500 mt-2">
                      Available for immediate support and orders.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 flex-shrink-0 rounded-2xl bg-emerald-50 flex items-center justify-center">
                    <MapPin className="w-7 h-7 text-pb-green-deep" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">Our Hub</h3>
                    <p className="text-slate-600 leading-relaxed font-medium">
                      60/12, Santhai Road, Shanmugappuram,<br />
                      Palani, Tamil Nadu - 624601
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 flex-shrink-0 rounded-2xl bg-emerald-50 flex items-center justify-center">
                    <Clock className="w-7 h-7 text-pb-green-deep" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">Operating Hours</h3>
                    <p className="text-slate-600 font-medium">
                      Open Daily (6:00 AM - 10:00 PM)<br />
                      We're early birds, ready to deliver freshness!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quote */}
            <div className="bg-emerald-50 p-8 rounded-[2.5rem] text-center border border-emerald-100">
              <p className="text-xl italic text-pb-green-deep font-medium leading-relaxed">
                "Quality is neighborly. When we deliver to you, we're delivering to our own community."
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-emerald-900/5 relative overflow-hidden">
            <h2 className="text-3xl font-playfair font-bold text-pb-green-deep mb-8">Send a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-900 font-bold ml-1 uppercase text-[10px] tracking-widest">Your Name</Label>
                <Input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="bg-slate-50 border-slate-100 rounded-2xl py-6 focus:border-pb-green-deep/50 h-16 px-6"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-slate-900 font-bold ml-1 uppercase text-[10px] tracking-widest">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 XXXXX XXXXX"
                  className="bg-slate-50 border-slate-100 rounded-2xl py-6 focus:border-pb-green-deep/50 h-16 px-6"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-slate-900 font-bold ml-1 uppercase text-[10px] tracking-widest">Your Requirement</Label>
                <Textarea
                  id="message"
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us what you need help with..."
                  className="bg-slate-50 border-slate-100 rounded-2xl focus:border-pb-green-deep/50 p-6 min-h-[160px] resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-pb-green-deep text-white py-10 rounded-3xl text-xl font-black hover:scale-[1.02] transition-all shadow-xl shadow-emerald-900/10 group h-20"
              >
                {submitting ? 'Sending...' : (
                  <span className="flex items-center gap-3">
                    <Send className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    Send on WhatsApp
                  </span>
                )}
              </Button>

              <p className="text-[10px] text-center text-slate-400 font-medium uppercase tracking-widest">
                Fastest support via WhatsApp
              </p>
            </form>
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-emerald-500/5 blur-3xl pointer-events-none"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
