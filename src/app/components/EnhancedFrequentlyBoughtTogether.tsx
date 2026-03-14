import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Product, Offer } from '../types/enhanced-offer';
import { EnhancedOfferEngine } from '../utils/enhancedOfferEngine';
import { 
  Package, 
  Plus, 
  ShoppingCart, 
  MessageCircle,
  TrendingUp,
  Star,
  Gift,
  Percent,
  IndianRupee,
  ArrowRight
} from 'lucide-react';

interface FrequentlyBoughtTogetherProps {
  currentProduct: Product;
  allProducts: Product[];
  offers: Offer[];
  onAddToCart?: (product: Product) => void;
  onAddBundleToCart?: (products: Product[]) => void;
  maxSuggestions?: number;
}

interface SuggestionData {
  product: Product;
  score: number;
  reasons: string[];
  bestOffer?: Offer;
  offerCalculation?: any;
}

export function FrequentlyBoughtTogether({
  currentProduct,
  allProducts,
  offers,
  onAddToCart,
  onAddBundleToCart,
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
      const currentProductOffers = EnhancedOfferEngine.getApplicableOffers(currentProduct, offers);
      const otherProductOffers = EnhancedOfferEngine.getApplicableOffers(product, offers);
      
      if (currentProductOffers.length > 0 && otherProductOffers.length > 0) {
        score += 25;
        reasons.push('Both have discounts');
      }

      // Category-based suggestions
      const categoryPairs: Record<string, string[]> = {
        'Power Tools': ['Hand Tools', 'Safety Equipment', 'Tool Accessories', 'Measurement Tools'],
        'Hand Tools': ['Power Tools', 'Measurement Tools', 'Safety Equipment'],
        'Safety Equipment': ['Power Tools', 'Hand Tools', 'Tool Accessories'],
        'Measurement Tools': ['Hand Tools', 'Marking Tools', 'Power Tools'],
        'Tool Accessories': ['Power Tools', 'Hand Tools', 'Safety Equipment'],
        'Welding Equipment': ['Safety Equipment', 'Hand Tools', 'Power Tools'],
        'Garden Tools': ['Power Tools', 'Hand Tools', 'Safety Equipment']
      };

      const relatedCategories = categoryPairs[currentProduct.category] || [];
      if (relatedCategories.includes(product.category)) {
        score += 10;
        reasons.push('Frequently bought together');
      }

      // Bonus for popular items (based on price range)
      if (product.price > 1000 && product.price < 10000) {
        score += 5;
        reasons.push('Popular choice');
      }

      // Bonus for complementary items
      const complementaryPairs: Record<string, string[]> = {
        'Power Tools': ['Tool Accessories', 'Safety Equipment'],
        'Hand Tools': ['Measurement Tools', 'Tool Storage'],
        'Welding Equipment': ['Safety Equipment', 'Hand Tools'],
        'Measurement Tools': ['Marking Tools', 'Hand Tools']
      };

      const complementaryItems = complementaryPairs[currentProduct.category] || [];
      if (complementaryItems.includes(product.category)) {
        score += 8;
        reasons.push('Complementary item');
      }

      if (score > 0) {
        const offerCalculation = EnhancedOfferEngine.calculateBestOffer(product, offers);
        const bestOffer = offerCalculation.applicableOffer || undefined;
        
        suggestions.push({
          product,
          score,
          reasons: reasons.slice(0, 3), // Limit to top 3 reasons
          bestOffer,
          offerCalculation
        });
      }
    }

    // Sort by score and return top suggestions
    return suggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, maxSuggestions);
  }, [currentProduct, allProducts, offers, maxSuggestions]);

  // Calculate bundle pricing
  const bundlePricing = useMemo(() => {
    const bundleProducts = [currentProduct, ...suggestions.map(s => s.product)];
    const totalOriginalPrice = bundleProducts.reduce((sum, p) => sum + p.price, 0);
    
    // Check for combo offers that include all bundle products
    const applicableComboOffers = offers.filter(offer => 
      offer.offer_type === 'combo' &&
      offer.combo_products &&
      offer.combo_products.every(productId => bundleProducts.some(p => p.id === productId))
    );

    let bestComboDiscount = 0;
    let bestComboOffer = null;

    for (const comboOffer of applicableComboOffers) {
      const discount = EnhancedOfferEngine.calculateDiscountAmount(comboOffer, totalOriginalPrice);
      if (discount > bestComboDiscount) {
        bestComboDiscount = discount;
        bestComboOffer = comboOffer;
      }
    }

    // Calculate individual discounts
    const individualDiscounts = bundleProducts.map(product => {
      const calculation = EnhancedOfferEngine.calculateBestOffer(product, offers);
      return calculation.discountAmount;
    });

    const totalIndividualDiscount = individualDiscounts.reduce((sum, discount) => sum + discount, 0);

    // Use the better of combo discount or individual discounts
    const totalDiscount = Math.max(bestComboDiscount, totalIndividualDiscount);
    const bundlePrice = totalOriginalPrice - totalDiscount;
    const savingsPercentage = (totalDiscount / totalOriginalPrice) * 100;

    return {
      totalOriginalPrice,
      bundlePrice,
      totalDiscount,
      savingsPercentage,
      bestComboOffer,
      individualDiscounts: totalIndividualDiscount
    };
  }, [currentProduct, suggestions, offers]);

  if (suggestions.length === 0) {
    return null;
  }

  const handleAddToCart = (product: Product) => {
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  const handleAddBundleToCart = () => {
    const bundleProducts = [currentProduct, ...suggestions.map(s => s.product)];
    if (onAddBundleToCart) {
      onAddBundleToCart(bundleProducts);
    }
  };

  const handleWhatsAppBundle = () => {
    const bundleProducts = [currentProduct, ...suggestions.map(s => s.product)];
    const productList = bundleProducts.map((p, index) => 
      `${index + 1}. ${p.name} - ₹${p.price.toLocaleString()}`
    ).join('\n');
    
    let message = `Hi, I'm interested in this frequently bought together bundle:\n\n${productList}\n\n`;
    message += `Bundle Total: ₹${bundlePricing.bundlePrice.toLocaleString()}\n`;
    message += `Original Value: ₹${bundlePricing.totalOriginalPrice.toLocaleString()}\n`;
    message += `Total Savings: ₹${bundlePricing.totalDiscount.toLocaleString()} (${bundlePricing.savingsPercentage.toFixed(1)}%)\n\n`;
    
    if (bundlePricing.bestComboOffer) {
      message += `Special Combo Deal: ${bundlePricing.bestComboOffer.offer_name}\n`;
    }
    
    message += `Is this bundle available?`;

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
        {/* Bundle Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-semibold text-blue-900">Complete Bundle Deal</h4>
              <p className="text-sm text-blue-700">
                Get all {suggestions.length + 1} items and save {bundlePricing.savingsPercentage.toFixed(1)}%
              </p>
              {bundlePricing.bestComboOffer && (
                <div className="flex items-center gap-2 mt-1">
                  <Gift className="w-4 h-4 text-purple-600" />
                  <span className="text-sm text-purple-700 font-medium">
                    {bundlePricing.bestComboOffer.offer_name}
                  </span>
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 line-through">
                ₹{bundlePricing.totalOriginalPrice.toLocaleString()}
              </div>
              <div className="text-2xl font-bold text-blue-900">
                ₹{bundlePricing.bundlePrice.toLocaleString()}
              </div>
              <div className="text-sm text-green-600 font-medium">
                Save ₹{bundlePricing.totalDiscount.toLocaleString()}
              </div>
            </div>
          </div>
          
          {/* Bundle Actions */}
          <div className="flex gap-2 mt-4">
            <Button
              onClick={handleAddBundleToCart}
              className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add Bundle to Cart
            </Button>
            <Button
              variant="outline"
              onClick={handleWhatsAppBundle}
              className="flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Enquire About Bundle
            </Button>
          </div>
        </div>

        {/* Individual Products */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {suggestions.map((suggestion, index) => {
            const discountedPrice = suggestion.offerCalculation?.discountedPrice || suggestion.product.price;
            const hasDiscount = suggestion.offerCalculation?.applicableOffer !== null;

            return (
              <Card key={suggestion.product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <div className="aspect-square bg-gray-100">
                    <img
                      src={suggestion.product.image}
                      alt={suggestion.product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-product.png';
                      }}
                    />
                  </div>
                  
                  {/* Offer Badge */}
                  {hasDiscount && suggestion.offerCalculation?.offerBadge && (
                    <div className="absolute top-2 left-2">
                      <Badge className={`${suggestion.offerCalculation.offerBadge.color} text-white text-xs`}>
                        {suggestion.offerCalculation.offerBadge.icon} {suggestion.offerCalculation.discountPercentage.toFixed(0)}% OFF
                      </Badge>
                    </div>
                  )}
                  
                  {/* Score Indicator */}
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-1">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs font-medium">{suggestion.score}</span>
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-3">
                  <h4 className="font-semibold text-sm line-clamp-2 mb-1">
                    {suggestion.product.name}
                  </h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    {suggestion.product.category}
                  </p>
                  
                  {/* Pricing */}
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-lg font-bold text-green-600">
                      ₹{discountedPrice.toLocaleString()}
                    </span>
                    {hasDiscount && (
                      <span className="text-xs text-gray-500 line-through">
                        ₹{suggestion.product.price.toLocaleString()}
                      </span>
                    )}
                  </div>
                  
                  {/* Reasons */}
                  {suggestion.reasons.length > 0 && (
                    <div className="mb-2">
                      {suggestion.reasons.map((reason, idx) => (
                        <div key={idx} className="text-xs text-blue-600">
                          • {reason}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs">4.5</span>
                    <span className="text-xs text-gray-500">(234)</span>
                  </div>
                  
                  {/* Action Button */}
                  <Button
                    size="sm"
                    className="w-full bg-blue-600 text-white hover:bg-blue-700"
                    onClick={() => handleAddToCart(suggestion.product)}
                  >
                    <ShoppingCart className="w-3 h-3 mr-1" />
                    Add
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bundle Benefits */}
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-semibold text-green-900 mb-2">Bundle Benefits:</h4>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• Save {bundlePricing.savingsPercentage.toFixed(1)}% compared to individual purchases</li>
            <li>• Free shipping on bundle orders (if applicable)</li>
            <li>• Priority customer support for bundle purchases</li>
            <li>• Extended warranty on selected bundle items</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
