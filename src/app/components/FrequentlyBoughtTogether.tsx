import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Product, Offer } from '../types';
import { OfferEngine } from '../utils/offerEngine';
import { 
  Package, 
  Plus, 
  ShoppingCart, 
  MessageCircle,
  TrendingUp,
  Star
} from 'lucide-react';

interface FrequentlyBoughtTogetherProps {
  currentProduct: Product;
  allProducts: Product[];
  offers: Offer[];
  onAddToCart?: (product: Product) => void;
  maxSuggestions?: number;
}

interface SuggestionData {
  product: Product;
  score: number;
  reasons: string[];
  bestOffer?: Offer;
}

export function FrequentlyBoughtTogether({
  currentProduct,
  allProducts,
  offers,
  onAddToCart,
  maxSuggestions = 4
}: FrequentlyBoughtTogetherProps) {
  const suggestions = useMemo(() => {
    const suggestions: SuggestionData[] = [];
    
    // Filter out current product and out of stock items
    const availableProducts = allProducts.filter(
      p => p.id !== currentProduct.id && p.inStock
    );

    for (const product of availableProducts) {
      const reasons: string[] = [];
      let score = 0;

      // Same category bonus
      if (product.category === currentProduct.category) {
        score += 30;
        reasons.push('Same category');
      }

      // Same brand bonus
      if (product.brand === currentProduct.brand) {
        score += 20;
        reasons.push('Same brand');
      }

      // Price range similarity (within 50% of current product price)
      const priceDiff = Math.abs(product.price - currentProduct.price);
      const priceThreshold = currentProduct.price * 0.5;
      if (priceDiff <= priceThreshold) {
        score += 15;
        reasons.push('Similar price range');
      }

      // Check for combo offers
      const comboOffers = offers.filter(offer => 
        offer.offer_type === 'combo' &&
        (
          (offer.combo_products && offer.combo_products.includes(currentProduct.id)) ||
          (offer.combo_products && offer.combo_products.includes(product.id))
        )
      );

      if (comboOffers.length > 0) {
        score += 40;
        reasons.push('Available in combo deals');
      }

      // Check if both products have applicable offers
      const currentProductOffers = OfferEngine.getApplicableOffers(currentProduct, offers);
      const otherProductOffers = OfferEngine.getApplicableOffers(product, offers);
      
      if (currentProductOffers.length > 0 && otherProductOffers.length > 0) {
        score += 25;
        reasons.push('Both have discounts');
      }

      // Category-based suggestions
      const categoryPairs: Record<string, string[]> = {
        'Power Tools': ['Hand Tools', 'Safety Equipment', 'Tool Accessories'],
        'Hand Tools': ['Power Tools', 'Measurement Tools'],
        'Safety Equipment': ['Power Tools', 'Hand Tools'],
        'Measurement Tools': ['Hand Tools', 'Marking Tools'],
        'Tool Accessories': ['Power Tools', 'Hand Tools'],
        'Welding Equipment': ['Safety Equipment', 'Hand Tools'],
        'Garden Tools': ['Power Tools', 'Hand Tools']
      };

      const relatedCategories = categoryPairs[currentProduct.category] || [];
      if (relatedCategories.includes(product.category)) {
        score += 10;
        reasons.push('Frequently bought together');
      }

      // Bonus for popular items (mock rating)
      if (product.price > 1000) {
        score += 5;
        reasons.push('Popular choice');
      }

      if (score > 0) {
        const bestOffer = OfferEngine.getHighestPriorityOffer(product, offers);
        suggestions.push({
          product,
          score,
          reasons: reasons.slice(0, 3), // Limit to top 3 reasons
          bestOffer: bestOffer || undefined
        });
      }
    }

    // Sort by score and return top suggestions
    return suggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, maxSuggestions);
  }, [currentProduct, allProducts, offers, maxSuggestions]);

  if (suggestions.length === 0) {
    return null;
  }

  const handleAddToCart = (product: Product) => {
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  const handleWhatsApp = (products: Product[]) => {
    const productList = products.map(p => `• ${p.name} - ₹${p.price}`).join('\n');
    const totalPrice = products.reduce((sum, p) => sum + p.price, 0);
    
    const message = `Hi, I'm interested in these frequently bought together items:\n\n${productList}\n\nTotal: ₹${totalPrice}\n\nCan you tell me more about these products?`;
    const url = `https://wa.me/919361919109?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <CardTitle>Frequently Bought Together</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          Customers who bought {currentProduct.name} also bought these items
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {suggestions.map((suggestion) => {
            const offerCalculation = suggestion.bestOffer 
              ? OfferEngine.calculateOfferDiscount(suggestion.bestOffer, suggestion.product.price, 1)
              : null;
            const discountedPrice = offerCalculation?.discountedPrice || suggestion.product.price;

            return (
              <Card key={suggestion.product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-gray-100 relative">
                  <img
                    src={suggestion.product.image}
                    alt={suggestion.product.name}
                    className="w-full h-full object-cover"
                  />
                  
                  {suggestion.bestOffer && (
                    <Badge className="absolute top-2 left-2 bg-green-500 text-white text-xs">
                      {suggestion.bestOffer.discount_type === 'percentage' 
                        ? `${suggestion.bestOffer.discount_value}% OFF`
                        : `₹${suggestion.bestOffer.discount_value} OFF`
                      }
                    </Badge>
                  )}
                  
                  <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  </div>
                </div>
                
                <CardContent className="p-3">
                  <h4 className="font-semibold text-sm line-clamp-2 mb-1">
                    {suggestion.product.name}
                  </h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    {suggestion.product.category}
                  </p>
                  
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-lg font-bold text-[var(--ingco-yellow)]">
                      ₹{discountedPrice}
                    </span>
                    {offerCalculation && (
                      <span className="text-xs text-gray-500 line-through">
                        ₹{suggestion.product.price}
                      </span>
                    )}
                  </div>
                  
                  {suggestion.reasons.length > 0 && (
                    <div className="text-xs text-blue-600 mb-2">
                      {suggestion.reasons[0]}
                    </div>
                  )}
                  
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      className="flex-1 bg-[var(--ingco-yellow)] text-black hover:bg-yellow-500 text-xs"
                      onClick={() => handleAddToCart(suggestion.product)}
                    >
                      <ShoppingCart className="w-3 h-3 mr-1" />
                      Add
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {/* Bundle Action */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-blue-900">Get the Complete Bundle</h4>
              <p className="text-sm text-blue-700">
                Buy {currentProduct.name} + {suggestions.length} more items
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-900">
                ₹{currentProduct.price + suggestions.reduce((sum, s) => sum + s.product.price, 0)}
              </div>
              <Button
                className="bg-blue-600 text-white hover:bg-blue-700 mt-1"
                onClick={() => handleWhatsApp([currentProduct, ...suggestions.map(s => s.product)])}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Enquire About Bundle
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
