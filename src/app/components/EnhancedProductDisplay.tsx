import React from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Tag, 
  Percent, 
  Gift, 
  Package, 
  Layers, 
  Clock,
  Star,
  IndianRupee,
  ShoppingCart,
  MessageCircle,
  TrendingUp
} from 'lucide-react';
import { Product, Offer } from '../types/enhanced-offer';
import { EnhancedOfferEngine } from '../utils/enhancedOfferEngine';

interface EnhancedProductCardProps {
  product: Product;
  offers: Offer[];
  onAddToCart?: (product: Product) => void;
  onWhatsApp?: (product: Product, message: string) => void;
  className?: string;
}

export function EnhancedProductCard({ 
  product, 
  offers, 
  onAddToCart, 
  onWhatsApp, 
  className 
}: EnhancedProductCardProps) {
  // Calculate best offer for this product
  const offerCalculation = EnhancedOfferEngine.calculateBestOffer(product, offers);
  const hasOffer = offerCalculation.applicableOffer !== null;
  
  // Get combo offers
  const comboOffers = EnhancedOfferEngine.getComboOffers(product, offers, []);
  const hasCombo = comboOffers.length > 0;
  
  // Handle WhatsApp
  const handleWhatsApp = () => {
    const priceText = hasOffer 
      ? `₹${offerCalculation.discountedPrice} (Original: ₹${product.price})` 
      : `₹${product.price}`;
    
    let message = `Hi, I'm interested in ${product.name} (${priceText}). Is it available?`;
    
    if (hasOffer) {
      message += `\n\nSpecial Offer: ${offerCalculation.applicableOffer.offer_name} - ${offerCalculation.savingsText}`;
    }
    
    if (hasCombo) {
      message += `\n\nCombo Deal Available: Save up to ${comboOffers[0].savingsPercentage.toFixed(0)}% on bundle!`;
    }
    
    if (onWhatsApp) {
      onWhatsApp(product, message);
    } else {
      const url = `https://wa.me/919361919109?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
    }
  };
  
  // Handle add to cart
  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product);
    }
  };
  
  return (
    <Card className={`overflow-hidden hover:shadow-lg transition-shadow ${className}`}>
      {/* Product Image */}
      <div className="relative">
        <div className="aspect-square bg-gray-100">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder-product.png';
            }}
          />
        </div>
        
        {/* Offer Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {hasOffer && offerCalculation.offerBadge && (
            <Badge className={`${offerCalculation.offerBadge.color} text-white text-xs px-2 py-1`}>
              {offerCalculation.offerBadge.icon} {offerCalculation.offerBadge.text}
            </Badge>
          )}
          
          {hasCombo && (
            <Badge className="bg-purple-500 text-white text-xs px-2 py-1">
              <Gift className="w-3 h-3 mr-1" />
              Combo Deal
            </Badge>
          )}
          
          {product.stock <= 5 && product.stock > 0 && (
            <Badge className="bg-orange-500 text-white text-xs px-2 py-1">
              <Clock className="w-3 h-3 mr-1" />
              Only {product.stock} left
            </Badge>
          )}
        </div>
        
        {/* Rating */}
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-1">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
            <span className="text-xs font-medium">4.5</span>
          </div>
        </div>
      </div>
      
      {/* Product Details */}
      <CardContent className="p-4">
        {/* Product Name and Category */}
        <div className="mb-3">
          <h3 className="font-semibold text-lg line-clamp-2 mb-1">{product.name}</h3>
          <p className="text-sm text-gray-600">{product.category}</p>
        </div>
        
        {/* Pricing Section */}
        <div className="mb-4">
          {hasOffer ? (
            <div className="space-y-1">
              {/* Discounted Price */}
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-green-600">
                  ₹{offerCalculation.discountedPrice.toLocaleString()}
                </span>
                
                {/* Original Price (strikethrough) */}
                <span className="text-sm text-gray-500 line-through">
                  ₹{product.price.toLocaleString()}
                </span>
                
                {/* Discount Badge */}
                <Badge className="bg-red-100 text-red-800 text-xs">
                  <Percent className="w-3 h-3 mr-1" />
                  {offerCalculation.discountPercentage.toFixed(0)}% OFF
                </Badge>
              </div>
              
              {/* Savings Amount */}
              <div className="text-sm text-green-700 font-medium">
                You save ₹{offerCalculation.discountAmount.toLocaleString()}
              </div>
              
              {/* Offer Description */}
              {offerCalculation.applicableOffer?.offer_description && (
                <div className="text-xs text-gray-600 mt-1 p-2 bg-blue-50 rounded">
                  <Tag className="w-3 h-3 inline mr-1" />
                  {offerCalculation.applicableOffer.offer_description}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">
                ₹{product.price.toLocaleString()}
              </span>
            </div>
          )}
        </div>
        
        {/* Combo Offer Preview */}
        {hasCombo && (
          <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-4 h-4 text-purple-600" />
              <span className="font-medium text-purple-900">Combo Deal Available</span>
            </div>
            <div className="text-sm text-purple-700">
              Buy together and save {comboOffers[0].savingsPercentage.toFixed(0)}%
            </div>
            <div className="text-xs text-purple-600 mt-1">
              {comboOffers[0].products.length} items • Save ₹{comboOffers[0].savings.toLocaleString()}
            </div>
          </div>
        )}
        
        {/* Stock Status */}
        <div className="mb-4">
          {product.inStock ? (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              In Stock ({product.stock} available)
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              Out of Stock
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          {onAddToCart && (
            <Button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
            </Button>
          )}
          
          <Button
            variant="outline"
            onClick={handleWhatsApp}
            className="flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Additional Features */}
        <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-2 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <Package className="w-3 h-3" />
            {product.brand || 'INGCO'}
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Popular Choice
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Enhanced Product Detail Component
interface EnhancedProductDetailProps {
  product: Product;
  offers: Offer[];
  allProducts: Product[];
  onAddToCart?: (product: Product, quantity: number) => void;
  onWhatsApp?: (product: Product, message: string) => void;
}

export function EnhancedProductDetail({ 
  product, 
  offers, 
  allProducts, 
  onAddToCart, 
  onWhatsApp 
}: EnhancedProductDetailProps) {
  const [quantity, setQuantity] = React.useState(1);
  
  // Calculate best offer
  const offerCalculation = EnhancedOfferEngine.calculateBestOffer(product, offers);
  const hasOffer = offerCalculation.applicableOffer !== null;
  
  // Get combo offers
  const comboOffers = EnhancedOfferEngine.getComboOffers(product, offers, allProducts);
  const hasCombo = comboOffers.length > 0;
  
  // Get offer conflicts
  const offerConflicts = EnhancedOfferEngine.detectOfferConflicts(product, offers);
  
  // Handle actions
  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product, quantity);
    }
  };
  
  const handleWhatsApp = () => {
    const priceText = hasOffer 
      ? `₹${offerCalculation.discountedPrice} (Original: ₹${product.price})` 
      : `₹${product.price}`;
    
    let message = `Hi, I'm interested in ${product.name} (${priceText}). Is it available?`;
    
    if (hasOffer) {
      message += `\n\nSpecial Offer: ${offerCalculation.applicableOffer.offer_name} - ${offerCalculation.savingsText}`;
    }
    
    if (hasCombo) {
      message += `\n\nCombo Deal Available: Save up to ${comboOffers[0].savingsPercentage.toFixed(0)}% on bundle!`;
    }
    
    if (quantity > 1) {
      message += `\n\nQuantity: ${quantity}`;
    }
    
    if (onWhatsApp) {
      onWhatsApp(product, message);
    } else {
      const url = `https://wa.me/919361919109?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Offer Banner */}
      {hasOffer && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            {offerCalculation.offerBadge && (
              <Badge className={`${offerCalculation.offerBadge.color} text-white px-3 py-1`}>
                {offerCalculation.offerBadge.icon} {offerCalculation.offerBadge.text}
              </Badge>
            )}
            <div>
              <h4 className="font-semibold text-green-800">{offerCalculation.applicableOffer.offer_name}</h4>
              <p className="text-sm text-green-700">{offerCalculation.savingsText}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Pricing Section */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-baseline gap-4 mb-4">
          {hasOffer ? (
            <>
              <span className="text-3xl font-bold text-green-600">
                ₹{offerCalculation.discountedPrice.toLocaleString()}
              </span>
              <span className="text-xl text-gray-500 line-through">
                ₹{product.price.toLocaleString()}
              </span>
              <Badge className="bg-red-100 text-red-800">
                <Percent className="w-4 h-4 mr-1" />
                {offerCalculation.discountPercentage.toFixed(0)}% OFF
              </Badge>
            </>
          ) : (
            <span className="text-3xl font-bold">
              ₹{product.price.toLocaleString()}
            </span>
          )}
        </div>
        
        {hasOffer && (
          <div className="text-green-700 font-medium mb-4">
            You save ₹{offerCalculation.discountAmount.toLocaleString()} on this purchase
          </div>
        )}
        
        {/* Quantity Selector */}
        <div className="flex items-center gap-4 mb-4">
          <span className="font-medium">Quantity:</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
            >
              -
            </Button>
            <span className="w-12 text-center font-medium">{quantity}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuantity(quantity + 1)}
              disabled={quantity >= product.stock}
            >
              +
            </Button>
          </div>
          <span className="text-sm text-gray-600">
            ({product.stock} available)
          </span>
        </div>
        
        {/* Total Price */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total:</span>
            <span className="text-2xl font-bold">
              ₹{((hasOffer ? offerCalculation.discountedPrice : product.price) * quantity).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className="flex-1 bg-blue-600 text-white hover:bg-blue-700 py-3"
        >
          <ShoppingCart className="w-5 h-5 mr-2" />
          Add to Cart
        </Button>
        
        <Button
          variant="outline"
          onClick={handleWhatsApp}
          className="flex items-center gap-2 py-3"
        >
          <MessageCircle className="w-5 h-5" />
          WhatsApp
        </Button>
      </div>
      
      {/* Combo Offers Section */}
      {hasCombo && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Gift className="w-5 h-5 text-purple-600" />
            Combo Offers Available
          </h3>
          
          {comboOffers.map((combo, index) => (
            <div key={index} className="bg-white rounded-lg p-4 mb-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium">{combo.offer.offer_name}</h4>
                  <p className="text-sm text-gray-600">{combo.offer.offer_description}</p>
                </div>
                <Badge className="bg-purple-100 text-purple-800">
                  Save {combo.savingsPercentage.toFixed(0)}%
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-sm text-gray-600">Bundle Price: </span>
                  <span className="font-semibold">₹{combo.comboPrice.toLocaleString()}</span>
                  <span className="text-sm text-gray-500 line-through ml-2">
                    ₹{combo.totalOriginalPrice.toLocaleString()}
                  </span>
                </div>
                <span className="text-green-600 font-medium">
                  Save ₹{combo.savings.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Offer Conflicts Warning */}
      {offerConflicts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <h4 className="font-medium text-yellow-800">Multiple Offers Available</h4>
          </div>
          <p className="text-sm text-yellow-700">
            We've automatically applied the best offer for you: {offerCalculation.applicableOffer?.offer_name}
          </p>
        </div>
      )}
    </div>
  );
}
