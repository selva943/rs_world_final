import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, Lock, ArrowRight, RefreshCcw, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { OTPInput, REGEXP_ONLY_DIGITS } from "input-otp";

interface OTPModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  phone?: string;
}

export function OTPModal({ isOpen, onClose, onSuccess, phone: initialPhone }: OTPModalProps) {
  const { sendOtp, verifyOtp } = useAuth();
  
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState(initialPhone || '');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && initialPhone) {
        setPhone(initialPhone);
    }
  }, [isOpen, initialPhone]);

  useEffect(() => {
    let timer: any;
    if (resendTimer > 0) {
      timer = setInterval(() => setResendTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setLoading(true);
    const result = await sendOtp(phone);
    setLoading(false);

    if (result.success) {
      setStep('otp');
      setResendTimer(30);
      toast.success("OTP sent successfully!");
    } else {
      toast.error(result.error || "Failed to send OTP");
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) return;

    setLoading(true);
    const result = await verifyOtp(phone, otp);
    setLoading(false);

    if (result.success) {
      setIsSuccess(true);
      toast.success("Login successful!");
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } else {
      toast.error(result.error || "Invalid OTP");
      setOtp('');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden p-8"
        >
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 w-10 h-10 bg-slate-50 hover:bg-slate-100 rounded-full flex items-center justify-center text-slate-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-pb-green-deep">
              {step === 'phone' ? <Phone className="w-8 h-8" /> : <Lock className="w-8 h-8" />}
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">
              {step === 'phone' ? "Quick Login" : "Verify OTP"}
            </h3>
            <p className="text-slate-400 text-sm font-medium">
              {step === 'phone' 
                ? "Enter your phone number to continue with your subscription."
                : `We've sent a 6-digit code to ${phone}`
              }
            </p>
          </div>

          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 text-center"
              >
                <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <p className="font-black text-pb-green-deep uppercase tracking-widest text-sm">Welcome back!</p>
              </motion.div>
            ) : step === 'phone' ? (
              <motion.form
                key="phone-step"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSendOtp}
                className="space-y-6"
              >
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-lg text-slate-700 outline-none focus:ring-2 focus:ring-pb-green-deep/20 transition-all placeholder:text-slate-300"
                    autoFocus
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading || phone.length < 10}
                  className="w-full h-14 bg-pb-green-deep hover:bg-emerald-800 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-emerald-900/20 gap-3"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ArrowRight className="w-5 h-5" /> Send OTP</>}
                </Button>
              </motion.form>
            ) : (
              <motion.div
                key="otp-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex justify-center">
                  <OTPInput
                    maxLength={6}
                    value={otp}
                    onChange={setOtp}
                    onComplete={handleVerifyOtp}
                    pattern={REGEXP_ONLY_DIGITS}
                    containerClassName="group flex items-center gap-2"
                    render={({ slots }) => (
                      <div className="flex gap-2">
                        {slots.map((slot, idx) => (
                          <div
                            key={idx}
                            className={cn(
                              "relative w-12 h-14 bg-slate-50 border-2 rounded-xl flex items-center justify-center text-xl font-black text-slate-700 transition-all",
                              slot.isActive ? "border-pb-green-deep bg-white ring-4 ring-emerald-500/10 shadow-sm" : "border-slate-100"
                            )}
                          >
                            {slot.char}
                            {slot.hasFakeCaret && (
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-px h-6 bg-pb-green-deep animate-caret-blink" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <Button
                    onClick={handleVerifyOtp}
                    disabled={loading || otp.length < 6}
                    className="w-full h-14 bg-pb-green-deep hover:bg-emerald-800 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-emerald-900/20 gap-3"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Continue"}
                  </Button>

                  <div className="flex flex-col items-center gap-3">
                    <button
                      onClick={() => setStep('phone')}
                      className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-pb-green-deep transition-colors"
                    >
                      Change Phone Number
                    </button>
                    
                    <button
                      onClick={handleSendOtp}
                      disabled={resendTimer > 0 || loading}
                      className={cn(
                        "flex items-center gap-2 text-xs font-bold transition-colors",
                        resendTimer > 0 ? "text-slate-300" : "text-pb-green-deep hover:text-emerald-700"
                      )}
                    >
                      <RefreshCcw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
                      {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <p className="mt-8 text-center text-[10px] text-slate-300 font-medium leading-relaxed">
            By continuing, you agree to Palani Basket's <br />
            <span className="underline cursor-pointer hover:text-slate-400">Terms of Service</span> and <span className="underline cursor-pointer hover:text-slate-400">Privacy Policy</span>.
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
