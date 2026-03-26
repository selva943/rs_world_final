import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Experience } from '@/types/app';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SubscriptionModal } from '@/components/SubscriptionModal';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  MessageCircle, 
  Sparkles, 
  Wand2, 
  Clock, 
  ShieldCheck, 
  Star, 
  Heart, 
  Upload, 
  Calendar, 
  Zap,
  Loader2,
  CheckCircle2,
  XCircle,
  X,
  FileText,
  CalendarDays,
  Image as ImageIcon,
  ArrowRight,
  Gift,
  PartyPopper
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { experiencesApi, storageApi, ordersApi, bookingsApi, servicesApi, mapCategory } from '@/lib/services/api';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { cn, safeString } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBasket, Plus } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export function ExperienceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { experiences, services, loading } = useData();
  const [experience, setExperience] = useState<Experience | any>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [customization, setCustomization] = useState({
    message: '',
    recipientName: '',
    recipientPhone: '',
    giftMessage: '',
    specialInstructions: '',
    scheduledDate: '',
    selectedSlot: '', // Fixed slot (e.g., "9-11 AM")
    imageUrls: [] as string[],
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [pincode, setPincode] = useState('');
  const [slotAvailability, setSlotAvailability] = useState<{ count: number; max: number }>({ count: 0, max: 3 });
  const [isCheckingSlot, setIsCheckingSlot] = useState(false);
  const [isOrdered, setIsOrdered] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if ((experiences.length > 0 || services.length > 0) && id) {
      // 1. Try to find in products (experiences)
      const foundExp = experiences.find(p => p.id === id || p.slug === id);
      if (foundExp) {
        setExperience(foundExp);
        return;
      }
      
      // 2. Try to find in services
      const foundServ = services.find(s => s.id === id || s.slug === id);
      if (foundServ) {
        setExperience({ ...foundServ, type: 'service' });
      }
    }
  }, [experiences, services, id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F9F7]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-pb-green-deep border-t-transparent rounded-full animate-spin shadow-lg shadow-emerald-900/10"></div>
          <p className="text-pb-green-deep font-black uppercase tracking-widest text-xs animate-pulse">Loading Freshness...</p>
        </div>
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F9F7]">
        <div className="text-center">
          <h2 className="text-2xl font-black text-pb-green-deep mb-4 uppercase tracking-tighter">Selection Not Found</h2>
          <p className="text-slate-400 mb-8 font-medium italic">We couldn't find what you were looking for. It might have been picked already!</p>
          <Button onClick={() => window.history.back()} className="bg-pb-green-deep text-[#FFF59D] rounded-full px-8 font-black uppercase tracking-widest h-12">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadPromises = Array.from(files).map(file => storageApi.uploadFile(file, 'product-images'));
      const results = await Promise.all(uploadPromises);
      const validUrls = results.filter((url): url is string => url !== null);
      
      if (validUrls.length > 0) {
        setCustomization(prev => ({ 
          ...prev, 
          imageUrls: [...prev.imageUrls, ...validUrls] 
        }));
        toast.success(`${validUrls.length} fresh selections captured!`);
      } else {
        toast.error('Failed to upload photos');
      }
    } catch (error) {
      toast.error('An error occurred during upload');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setCustomization(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index)
    }));
    toast.info('Image removed');
  };

  // 🧠 SMART LOGIC: Dynamic Pricing
  const getDynamicPrice = () => {
    let finalPrice = experience.price || 0;
    if (experience.type !== 'service') return finalPrice;

    const date = customization.scheduledDate ? new Date(customization.scheduledDate) : new Date();
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const isSameDay = customization.scheduledDate === new Date().toISOString().split('T')[0];
    
    if (isWeekend) finalPrice *= (experience.weekend_multiplier || 1.1);
    if (isSameDay) finalPrice *= (experience.same_day_multiplier || 1.15);
    
    // Peak hour check (e.g. 9-11 AM or 4-6 PM)
    const slot = customization.selectedSlot;
    if (slot === '9-11 AM' || slot === '4-6 PM') {
      finalPrice *= (experience.peak_multiplier || 1.2);
    }

    return Math.round(finalPrice);
  };

  const currentPrice = getDynamicPrice();

  // 🧠 SMART LOGIC: Slot Availability
  const checkAvailability = async (date: string, slot: string) => {
    if (!date || !slot || experience.type !== 'service') return;
    setIsCheckingSlot(true);
    try {
      const { count } = await bookingsApi.checkSlotAvailability(experience.id, date, slot);
      setSlotAvailability({ count, max: experience.max_bookings_per_slot || 3 });
    } catch (err) {
      console.error("Failed to check availability", err);
    } finally {
      setIsCheckingSlot(false);
    }
  };

  useEffect(() => {
    if (customization.scheduledDate && customization.selectedSlot) {
      checkAvailability(customization.scheduledDate, customization.selectedSlot);
    }
  }, [customization.scheduledDate, customization.selectedSlot]);

  const handleReviewOrder = () => {
    const isSubscription = experience.type?.toLowerCase() === 'subscription' || experience.is_subscription_available;
    
    if (isSubscription) {
      setShowSubscriptionModal(true);
      return;
    }

    if (experience.type !== 'service') {
      addToCart(experience);
      navigate('/checkout');
      return;
    }

    if (!customization.recipientName) {
      toast.error("Please tell us your name for the booking");
      return;
    }

    // 📍 SERVICE AREA VALIDATION
    if (!pincode || pincode.length < 6) {
      toast.error("Please enter a valid 6-digit pincode");
      return;
    }

    if (experience.service_pincodes && experience.service_pincodes.length > 0) {
      if (!experience.service_pincodes.includes(pincode)) {
        toast.error(`Sorry, this service is not available in ${pincode} yet. Coming soon!`);
        return;
      }
    }

    if (slotAvailability.count >= slotAvailability.max) {
      toast.error("This slot is fully booked. Please select another time or date.");
      return;
    }

    setShowSummary(true);
  };

  const handleConfirmOrder = async () => {
    setIsSubmitting(true);
    try {
      let bookingRef = '';
      
      if (experience.type === 'service') {
        const bookingPayload = {
          service_id: experience.id,
          user_id: user?.id,
          customer_name: customization.recipientName,
          customer_phone: customization.recipientPhone,
          booking_date: customization.scheduledDate || new Date().toISOString().split('T')[0],
          time_slot: customization.selectedSlot || 'To be confirmed',
          address: customization.specialInstructions || 'Direct Contact',
          user_pincode: pincode,
          total_price: currentPrice,
          status: 'pending' as const,
          notes: customization.giftMessage
        };
        const bookingResult = await bookingsApi.add(bookingPayload);
        if (!bookingResult.success || !bookingResult.data) {
          throw new Error(bookingResult.message || 'Failed to save booking');
        }
        bookingRef = bookingResult.data.id.split('-')[0].toUpperCase();
      } else {
        const orderData = {
          user_name: customization.recipientName,
          phone: 'N/A', // WhatsApp completes the loop
          product_id: experience.id,
          customization_data: {
            recipient_name: customization.recipientName,
            emotional_message: customization.message,
            special_instructions: customization.specialInstructions,
            image_urls: customization.imageUrls,
            scheduled_date: customization.scheduledDate
          },
          delivery_type: (customization.scheduledDate ? 'scheduled' : 'instant') as any,
          scheduled_time: customization.scheduledDate ? new Date(customization.scheduledDate).toISOString() : undefined,
          status: 'pending' as any,
          priority: 'medium' as any,
        };
        const orderResult = await ordersApi.add(orderData);
        if (!orderResult || !orderResult.id) {
          throw new Error('Failed to save order');
        }
        bookingRef = orderResult.id.split('-')[0].toUpperCase();
      }

      // Success State
      setIsOrdered(true);
      setShowSummary(false);
      toast.success(experience.type === 'service' ? 'Your booking is secured! 🛠️' : 'Your order is being prepared! 🥦');

      // 3. Generate WhatsApp Message
      const imageList = customization.imageUrls.length > 0
        ? customization.imageUrls.map((url, i) => `📸 Photo ${i+1}: ${url}`).join('\n')
        : '';
        
      let message = '';
      if (experience.type === 'service') {
        message = `🛠️ NEW PALANI SERVICE BOOKING 🛠️

👤 Name: ${customization.recipientName}
📍 Address: ${customization.specialInstructions || 'Call for details'}
📌 Pincode: ${pincode}
📅 Date: ${customization.scheduledDate || 'ASAP'}
⏰ Slot: ${customization.selectedSlot || 'To be confirmed'}

📦 Service: ${experience.name}
💰 Final Price: ₹${currentPrice} ${currentPrice > (experience.price || 0) ? '(Includes Peak/Weekend Factor)' : ''}
⏱️ Duration: ${experience.duration || 'N/A'}
🔢 Ref: ${bookingRef}

The Boys from Your Next Door will assign an expert soon! 🛠️`;
      } else {
        message = `🧺 NEW PALANI BASKET ORDER 🧺

👤 Name: ${customization.recipientName}
📍 Instructions: ${customization.specialInstructions || 'Direct Delivery'}
📅 Date: ${customization.scheduledDate || 'ASAP'}
${experience.unit ? `⚖️ Quantity/Unit: ${experience.unit}` : ''}

📦 Item: ${experience.name}
🔢 Ref: ${bookingRef}

${imageList}

The Boys from Your Next Door will be there soon! 🥦`;
      }

      const whatsappUrl = `https://wa.me/917550346705?text=${encodeURIComponent(message)}`;
      
      // Delay redirect slightly for the success animation
      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
      }, 3000);

    } catch (error) {
      console.error('Error submitting order:', error);
      toast.error('Failed to process your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSubscription = experience?.type?.toLowerCase() === 'subscription' || experience?.is_subscription_available;

  if (isOrdered) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F9F7] p-4">
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-xl w-full text-center space-y-8"
        >
          <div className="relative inline-block">
             <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 10 }}
                className="w-24 h-24 bg-pb-green-deep rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-900/20"
             >
                <ShoppingBasket className="w-14 h-14 text-[#FFF59D]" />
             </motion.div>
             <div className="absolute -top-4 -right-4 animate-bounce">
                <ShoppingBasket className="w-10 h-10 text-[#66BB6A]" />
             </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-black text-pb-green-deep uppercase tracking-tighter">Order Success!</h1>
            <p className="text-slate-500 text-lg md:text-xl font-medium leading-relaxed max-w-md mx-auto italic">
              "The boys from next door are prepping your fresh selection. 🥦"
            </p>
          </div>

          <Card className="bg-white border-slate-100 rounded-2xl p-6 md:p-10 shadow-xl">
            <p className="text-slate-400 text-sm mb-6 font-medium">Redirecting you to the Boys on WhatsApp to confirm delivery details...</p>
            <div className="flex flex-col gap-4">
                <Button 
                    size="lg"
                    className="w-full h-14"
                    onClick={() => window.open('https://wa.me/917550346705', '_blank')}
                >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Open WhatsApp
                </Button>
                <Button 
                    variant="ghost"
                    onClick={() => navigate('/deliverables')}
                    className="text-slate-400 hover:text-pb-green-deep font-black uppercase tracking-widest text-xs"
                >
                    Back to Marketplace
                </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pb-32 pt-16 bg-[#F7F9F7] min-h-screen">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center gap-2 mb-12 text-sm">
          <Button variant="ghost" onClick={() => navigate('/deliverables')} className="text-slate-500 hover:text-pb-green-deep hover:bg-emerald-50 rounded-full px-4 h-10 group transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Marketplace
          </Button>
          <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-slate-200 mx-2" />
          <span className="text-pb-green-deep font-black uppercase tracking-[0.3em] text-[10px]">{safeString(mapCategory(experience)).replace(/_/g, ' ')}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left Side: Visual Preview */}
          <div className="space-y-12">
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="relative aspect-square md:aspect-[4/5] rounded-3xl overflow-hidden shadow-xl group border border-slate-100"
            >
              <img
                src={experience.image}
                alt={experience.name}
                className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-90"></div>

              <div className="absolute bottom-12 left-12 right-12">
                <div className="flex items-center gap-3 text-[#FFF59D] mb-4">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="text-xs font-black tracking-[0.4em] uppercase">Palani Choice</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-4">{experience.name}</h1>
                <p className="text-emerald-50 text-lg font-light leading-relaxed italic max-w-sm">"{experience.description}"</p>
              </div>
            </motion.div>

            {/* Highlights */}
            <div className="grid grid-cols-3 gap-6">
              {[
                { icon: ShieldCheck, label: "Fresh", color: "text-emerald-500" },
                { icon: Zap, label: "Fast", color: "text-amber-500" },
                { icon: ShoppingBasket, label: "Local", color: "text-pb-green-deep" }
              ].map((item, i) => (
                <div key={i} className="bg-white border-slate-100 p-4 rounded-xl text-center hover:bg-emerald-50 transition-colors shadow-sm">
                  <item.icon className={cn("w-5 h-5 mx-auto mb-2", item.color)} />
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{item.label}</p>
                </div>
              ))}
            </div>

            {/* Recipe Kit Info */}
            {experience.category === 'recipe_kits' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-amber-50 border border-amber-100 p-6 rounded-2xl space-y-4"
              >
                <h3 className="text-xl font-bold text-amber-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Recipe Kit Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-amber-800">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">{experience.cookingTime || '20 mins'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-800">
                    <Gift className="w-4 h-4" />
                    <span className="text-sm font-medium">Serves {experience.servingSize || '2-3'}</span>
                  </div>
                </div>
                {experience.ingredients && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-amber-700 uppercase tracking-widest">Ingredients Included:</p>
                    <div className="flex flex-wrap gap-2">
                      {experience.ingredients.map((ing: string, i: number) => (
                        <Badge key={i} className="bg-white text-amber-900 border-amber-200">{ing}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Service Info */}
            {experience.type === 'service' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-50 border border-blue-100 p-6 rounded-2xl space-y-4"
              >
                <h3 className="text-xl font-bold text-blue-900 flex items-center gap-2">
                  <Wand2 className="w-5 h-5" />
                  Service Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-white p-4 rounded-2xl flex flex-col gap-1 border border-blue-200/50">
                      <span className="text-[10px] uppercase font-black tracking-widest text-blue-400">Duration</span>
                      <span className="text-blue-900 font-bold">{experience.duration || 'N/A'}</span>
                   </div>
                   <div className="bg-white p-4 rounded-2xl flex flex-col gap-1 border border-blue-200/50">
                      <span className="text-[10px] uppercase font-black tracking-widest text-blue-400">Category</span>
                      <span className="text-blue-900 font-bold">{experience.category || 'Maintenance'}</span>
                   </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Form */}
          <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             className="space-y-8"
          >
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-xl relative overflow-hidden">
               <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-600/5 blur-[80px] rounded-full" />
               
                <div className="flex justify-between items-start mb-8 border-b border-slate-50 pb-6">
                <div>
                   <h2 className="text-2xl font-bold text-pb-green-deep">{experience.type === 'service' ? 'Book Service' : 'Order Now'}</h2>
                   <p className="text-slate-400 text-sm mt-1 italic">
                    {experience.type === 'service' ? 'Professional doorstep assistance.' : '"Freshness delivered to your doorstep."'}
                   </p>
                </div>
                 <div className="text-right">
                   <div className="text-3xl font-black text-pb-green-deep">₹{experience.price}</div>
                   <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                      {experience.type === 'service' ? 'Fixed Fee' : `Per ${experience.unit || 'Unit'}`}
                   </div>
                </div>
               </div>

               <div className="space-y-8">
                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-[0.3em] text-pb-green-deep ml-1">Your Name</Label>
                    <Input
                      placeholder="e.g. Rahul Sharma"
                      className="h-11 rounded-[10px] px-4"
                      value={customization.recipientName}
                      onChange={(e) => setCustomization({ ...customization, recipientName: e.target.value })}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-[0.3em] text-pb-green-deep ml-1">Special Request / Message</Label>
                    <Textarea
                      placeholder="Any specific preference or a note for us?"
                      className="min-h-[120px] rounded-xl p-4 resize-none"
                      value={customization.message}
                      onChange={(e) => setCustomization({ ...customization, message: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                       <Label className="text-xs font-black uppercase tracking-[0.3em] text-pb-green-deep ml-1">Add Photo (Optional)</Label>
                       <div className="relative">
                          <input 
                            type="file" 
                            id="photo-upload" 
                            className="hidden" 
                            accept="image/*"
                            multiple
                            onChange={handleFileChange}
                            disabled={isUploading}
                          />
                          <label 
                            htmlFor="photo-upload"
                            className={cn(
                                "flex items-center justify-center gap-2 h-11 rounded-[10px] border transition-all cursor-pointer group/upload",
                                customization.imageUrls.length > 0 
                                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600" 
                                    : "bg-slate-50 border-slate-100 text-slate-400 hover:bg-emerald-50"
                            )}
                          >
                            {isUploading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : customization.imageUrls.length > 0 ? (
                                <CheckCircle2 className="w-5 h-5 transition-transform group-hover/upload:scale-110" />
                            ) : (
                                <Upload className="w-5 h-5 transition-transform group-hover/upload:-translate-y-1" />
                            )}
                            <span className="text-xs font-bold uppercase tracking-widest leading-none">
                                {isUploading ? 'Uploading...' : customization.imageUrls.length > 0 ? `${customization.imageUrls.length} Files` : 'Add Photo'}
                            </span>
                          </label>
                       </div>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-xs font-black uppercase tracking-[0.3em] text-pb-green-deep ml-1">Date</Label>
                        <div 
                            onClick={() => dateInputRef.current?.showPicker()}
                            className={cn(
                                "flex items-center justify-center gap-2 h-11 rounded-[10px] border transition-all cursor-pointer group/date",
                                customization.scheduledDate 
                                    ? "bg-pb-green-deep/10 border-pb-green-deep/30 text-pb-green-deep" 
                                    : "bg-slate-50 border-slate-100 text-slate-400 hover:bg-emerald-50"
                            )}
                        >
                            <Calendar className="w-5 h-5 transition-transform group-hover/date:scale-110" />
                            <span className="text-xs font-bold uppercase tracking-widest leading-none">
                                {customization.scheduledDate ? new Date(customization.scheduledDate).toLocaleDateString() : 'Pick Date'}
                            </span>
                            <input 
                                ref={dateInputRef}
                                type="date" 
                                className="sr-only"
                                value={customization.scheduledDate}
                                onChange={(e) => setCustomization({ ...customization, scheduledDate: e.target.value })}
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                    </div>

                    {experience.type === 'service' ? (
                       <div className="space-y-3">
                        <Label className="text-xs font-black uppercase tracking-[0.3em] text-pb-green-deep ml-1">Time Slot</Label>
                        <select
                          className="w-full h-11 bg-slate-50 border-slate-100 text-slate-900 rounded-[10px] focus:border-pb-green-deep/50 px-3 font-medium appearance-none cursor-pointer hover:bg-emerald-50 transition-colors"
                          value={customization.selectedSlot}
                          onChange={(e) => setCustomization({ ...customization, selectedSlot: e.target.value })}
                        >
                           <option value="">Select Slot</option>
                           <option value="9-11 AM">9–11 AM (Morning)</option>
                           <option value="11-1 PM">11–1 PM (Noon)</option>
                           <option value="2-4 PM">2–4 PM (Afternoon)</option>
                           <option value="4-6 PM">4–6 PM (Evening)</option>
                         </select>
                         
                         {/* Slot Availability Indicator */}
                         {customization.scheduledDate && customization.selectedSlot && (
                           <div className="mt-2 flex items-center gap-2">
                             {isCheckingSlot ? (
                               <Loader2 className="w-3 h-3 animate-spin text-slate-400" />
                             ) : (
                               <>
                                 <div className={cn(
                                   "w-2 h-2 rounded-full",
                                   slotAvailability.count >= slotAvailability.max ? "bg-rose-500" :
                                   slotAvailability.count >= slotAvailability.max - 1 ? "bg-amber-500" : "bg-emerald-500"
                                 )} />
                                 <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                   {slotAvailability.count >= slotAvailability.max ? "Fully Booked" :
                                    slotAvailability.count >= slotAvailability.max - 1 ? "Few Slots Left" : "Available"}
                                 </span>
                               </>
                             )}
                           </div>
                         )}
                       </div>
                     ) : (
                      <div className="space-y-3">
                        {/* Empty spacer or additional product info */}
                         <div className="h-16 flex items-center justify-center text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em] italic">
                            Lightning Fast Delivery
                         </div>
                      </div>
                    )}
                  </div>

                  {/* Image Strip */}
                  <AnimatePresence>
                    {customization.imageUrls.length > 0 && (
                      <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide"
                      >
                        {customization.imageUrls.map((url, index) => (
                          <motion.div 
                              key={index} 
                              layout
                              initial={{ scale: 0.8 }}
                              animate={{ scale: 1 }}
                              className="relative flex-shrink-0"
                          >
                            <div className="w-24 h-24 rounded-2xl overflow-hidden border border-slate-100 shadow-lg group">
                              <img src={url} alt="Order attachment" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                            </div>
                            <button 
                              onClick={() => removeImage(index)}
                              className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1 shadow-xl hover:bg-red-600 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 ml-1">Delivery Address / Notes</Label>
                    <Input
                      placeholder="Street name, landmark, etc."
                      className="h-11 rounded-[10px] px-4 font-medium"
                      value={customization.specialInstructions}
                      onChange={(e) => setCustomization({ ...customization, specialInstructions: e.target.value })}
                    />
                  </div>

                  {experience.type === 'service' && (
                    <div className="space-y-3">
                      <Label className="text-xs font-black uppercase tracking-[0.3em] text-pb-green-deep ml-1">Pincode</Label>
                      <Input
                        placeholder="e.g. 600001"
                        maxLength={6}
                        className="h-11 rounded-[10px] px-4 font-medium"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                      />
                      {experience.service_pincodes && experience.service_pincodes.length > 0 && (
                        <p className="text-[9px] text-slate-400 font-medium ml-1">
                          Available in selected areas of Chennai.
                        </p>
                      )}
                    </div>
                  )}

                  <Button
                    size="lg"
                    onClick={handleReviewOrder}
                    disabled={isSubmitting || isUploading}
                    className="w-full h-14"
                  >
                    {isSubscription ? (
                      <>
                        Subscribe Now
                        <Sparkles className="w-6 h-6 ml-3 group-hover:scale-110 transition-transform" />
                      </>
                    ) : experience.type === 'service' ? (
                      <>
                        Confirm Booking
                        <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" />
                      </>
                    ) : (
                      <>
                        Add to Basket
                        <Plus className="w-6 h-6 ml-3 group-hover:scale-110 transition-transform" />
                      </>
                    )}
                  </Button>
               </div>
            </div>

            {/* Reassurance */}
            <div className="flex items-start gap-6 px-4">
               <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex flex-shrink-0 items-center justify-center border border-emerald-500/20 shadow-lg shadow-emerald-900/10">
                  <ShieldCheck className="w-8 h-8 text-emerald-500" />
               </div>
               <div>
                  <h4 className="text-lg font-black text-slate-900">The Palani Promise</h4>
                  <p className="text-sm text-slate-500 font-light italic mt-1 leading-relaxed">
                    "Every item is handpicked for freshness. If it's not perfect, we'll replace it. No questions asked."
                  </p>
               </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Order Summary Modal */}
      <AnimatePresence>
      {showSummary && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" 
                onClick={() => setShowSummary(false)} 
            />
           <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 40 }}
                className="bg-white border border-slate-100 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl relative z-10"
           >
                <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-pb-green-deep flex items-center gap-2">
                            <Sparkles className="w-5 h-5" />
                            Review Your Basket
                        </h3>
                        <p className="text-slate-500 text-xs italic">Confirm your fresh selection</p>
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-50" onClick={() => setShowSummary(false)}>
                        <X className="w-5 h-5 text-slate-400" />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
                        <img src={experience.image} className="w-20 h-20 rounded-lg object-cover shadow-sm" />
                        <div>
                            <h4 className="text-lg font-bold text-slate-900">{experience.name}</h4>
                            <p className="text-pb-green-deep font-bold text-lg">
                              ₹{currentPrice} 
                              {currentPrice > (experience.price || 0) && (
                                <span className="text-[10px] text-amber-600 ml-2 font-black uppercase tracking-widest">
                                  Includes Peak/Weekend Factor
                                </span>
                              )}
                              <span className="text-xs font-medium text-slate-500 block">/ {experience.unit || (experience.type === 'service' ? 'Service' : 'Unit')}</span>
                            </p>
                            <Badge className="mt-1 bg-pb-green-deep text-[#FFF59D] border-none capitalize">{safeString(mapCategory(experience)).replace(/_/g, ' ')}</Badge>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                             <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Customer</Label>
                             <div className="text-base text-slate-900 font-medium">{customization.recipientName}</div>
                        </div>
                        <div className="space-y-1">
                             <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Expected Delivery</Label>
                             <div className="text-base text-pb-green-deep font-medium flex items-center gap-2">
                                <CalendarDays className="w-4 h-4" />
                                {customization.scheduledDate ? new Date(customization.scheduledDate).toLocaleDateString('en-IN', { dateStyle: 'full' }) : 'Today - Express Delivery'}
                             </div>
                        </div>
                    </div>

                    <div className="space-y-1">
                         <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Order Notes / Message</Label>
                         <p className="text-slate-600 italic leading-relaxed text-sm">"{customization.message || 'Standard delivery.'}"</p>
                    </div>

                    {customization.imageUrls.length > 0 && (
                        <div className="space-y-3">
                             <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Attached Photos ({customization.imageUrls.length})</Label>
                             <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                {customization.imageUrls.map((url, i) => (
                                    <img key={i} src={url} className="w-16 h-16 rounded-lg object-cover border border-slate-100" />
                                ))}
                             </div>
                        </div>
                    )}

                    {customization.specialInstructions && (
                        <div className="space-y-1">
                             <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Delivery Instructions</Label>
                             <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-slate-600 text-xs italic">
                                "{customization.specialInstructions}"
                             </div>
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 border-t border-slate-50 bg-slate-50/50 flex flex-col md:flex-row gap-4 items-center">
                    <div className="text-slate-400 text-[10px] max-w-[200px] text-center md:text-left">
                        By confirming, you agree to Palani Basket's fresh delivery terms.
                    </div>
                    <div className="flex-1" />
                    <Button variant="ghost" size="sm" onClick={() => setShowSummary(false)} className="text-slate-400 hover:text-slate-900">
                        Wait, need to edit
                    </Button>
                    <Button 
                        size="md"
                        onClick={handleConfirmOrder}
                        disabled={isSubmitting}
                        className="px-8"
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                        Confirm & Order
                    </Button>
                </div>
           </motion.div>
        </div>
      )}
      </AnimatePresence>

      {/* Subscription Modal Render */}
      {showSubscriptionModal && experience && (
        <SubscriptionModal
          product={experience}
          isOpen={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
        />
      )}
    </div>
  );
}

const Label = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <label className={cn("block text-xs font-semibold mb-1", className)}>
    {children}
  </label>
);
