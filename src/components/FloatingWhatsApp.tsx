import { MessageCircle } from 'lucide-react';

export function FloatingWhatsApp() {
    const handleClick = () => {
        const message = "Hi Palani Basket! I'm looking for some fresh essentials. Can you help me?";
        const url = `https://wa.me/917550346705?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    return (
        <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3 group">
            {/* Tooltip/Chat Bubble */}
            <div className="bg-white text-pb-green-deep text-xs font-black px-4 py-2 rounded-2xl shadow-xl border border-emerald-50 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 pointer-events-none uppercase tracking-widest flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Talk to the Boys
            </div>

            <button
                onClick={handleClick}
                className="w-16 h-16 bg-pb-green-deep hover:bg-emerald-800 text-[#FFF59D] rounded-full shadow-2xl flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-95 relative overflow-hidden group/btn"
                aria-label="Chat with Palani Basket"
            >
                <MessageCircle className="w-8 h-8 relative z-10" />
                
                {/* Visual Interest */}
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                
                {/* Pulse animation */}
                <span className="absolute inset-0 rounded-full bg-pb-green-deep animate-ping opacity-20 scale-150"></span>
            </button>
        </div>
    );
}
