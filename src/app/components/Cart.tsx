import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Tag, 
  Percent,
  IndianRupee,
  MessageCircle,
  ArrowRight
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useData } from '../context/DataContext';
import { OfferEngine } from '../utils/offerEngine';

export function Cart() {
  const { state, addItem, removeItem, updateQuantity, clearCart, applyOffers, removeOffer } = useCart();
  const { offers } = useData();
  const [promoCode, setPromoCode] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  React.useEffect(() => {
    if (offers.length > 0) {
      applyOffers(offers);
    }
  }, [offers, applyOffers]);

  const handleCheckout = () => {
    setIsCheckingOut(true);
    const message = `Hi, I'd like to checkout with the following items:\n\n${state.items.map(item => 
      `${item.quantity}x ${item.product.name} - ₹${item.product.price * item.quantity}`
    ).join('\n')}\n\nSubtotal: ₹${state.subtotal}\nDiscount: ₹${state.totalDiscount}\nTotal: ₹${state.total}\n\nIs this available?`;
    
    const url = `https://wa.me/919361919109?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    setIsCheckingOut(false);
  };

  const handleWhatsApp = () => {
    const message = `Hi, I have ${state.items.length} items in my cart. Total: ₹${state.total}. Can you help me with my order?`;
    const url = `https://wa.me/919361919109?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  if (state.items.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
          <p className="text-gray-600 mb-6">Add some products to get started!</p>
          <Button onClick={() => window.location.href = '/products'}>
            Browse Products
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Shopping Cart ({state.items.length})</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearCart}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {state.items.map((item) => {
                const offerCalculation = OfferEngine.calculateBestOffer(item.product, offers);
                const hasOffer = offerCalculation.applicableOffer !== null;
                const itemPrice = hasOffer ? offerCalculation.discountedPrice : item.product.price;
                
                return (
                  <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.product.name}</h4>
                      <p className="text-sm text-gray-600">{item.product.category}</p>
                      
                      {hasOffer && (
                        <div className="mt-1">
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            {offerCalculation.discountPercentage.toFixed(0)}% OFF
                          </Badge>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        
                        <div className="flex-1 text-right">
                          <div className="font-semibold">₹{itemPrice * item.quantity}</div>
                          {hasOffer && (
                            <div className="text-sm text-gray-500 line-through">
                              ₹{item.product.price * item.quantity}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal ({state.items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                <span>₹{state.subtotal}</span>
              </div>
              
              {state.appliedOffers.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-green-600">Discount ({state.appliedOffers.length} offers)</span>
                    <span className="text-green-600 font-semibold">-₹{state.totalDiscount}</span>
                  </div>
                  
                  <div className="space-y-1">
                    {state.appliedOffers.map((offer) => (
                      <div key={offer.id} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                        <div className="flex items-center gap-2">
                          <Tag className="w-3 h-3" />
                          <span className="text-xs">{offer.offer_name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOffer(offer.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <Separator />
              
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold text-[var(--ingco-yellow)]">₹{state.total}</span>
              </div>
              
              {state.savings > 0 && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800">
                    <Percent className="w-4 h-4" />
                    <span className="font-semibold">You saved ₹{state.savings}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Promo Code */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                />
                <Button variant="outline">Apply</Button>
              </div>
            </CardContent>
          </Card>

          {/* Checkout Actions */}
          <div className="space-y-2">
            <Button
              onClick={handleCheckout}
              className="w-full bg-[var(--ingco-yellow)] text-black hover:bg-yellow-500 py-3"
              disabled={isCheckingOut}
            >
              {isCheckingOut ? 'Processing...' : 'Proceed to Checkout'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            
            <Button
              onClick={handleWhatsApp}
              variant="outline"
              className="w-full"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat on WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
