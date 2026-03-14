import { Product, Offer } from '../types';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter } from './ui/card';
import { MessageCircle, Package, Timer, Flame, Gift } from 'lucide-react';
import { useData } from '../context/DataContext';
import { OfferEngine } from '../utils/offerEngine';
import { useNavigate } from 'react-router';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { offers, products } = useData();
  const navigate = useNavigate();
  const offerCalculation = OfferEngine.calculateBestOffer(product, offers);
  const hasOffer = offerCalculation.applicableOffer !== null;
  const offerBadge = hasOffer ? OfferEngine.getOfferBadge(offerCalculation.applicableOffer!) : null;
  
  // Check if product is part of any combo offers
  const comboOffers = OfferEngine.getComboOffers(product, offers, products);
  const hasCombo = comboOffers.length > 0;

  const handleCardClick = () => {
    // Track offer view if applicable
    if (hasOffer && offerCalculation.applicableOffer) {
      OfferEngine.trackOfferView(offerCalculation.applicableOffer.id);
    }
    navigate(`/products/${product.id}`);
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation when clicking WhatsApp button
    
    // Track offer usage if applicable
    if (hasOffer && offerCalculation.applicableOffer) {
      OfferEngine.trackOfferUsage(
        offerCalculation.applicableOffer.id,
        product.id,
        product.price,
        offerCalculation.discountedPrice,
        1
      );
      OfferEngine.trackOfferClick(offerCalculation.applicableOffer.id);
    }
    
    const priceText = hasOffer ? 
      `₹${offerCalculation.discountedPrice} (Original: ₹${product.price})` : 
      `₹${product.price}`;
    const message = `Hi, I'm interested in ${product.name} (${priceText}). Is it available?`;
    const url = `https://wa.me/919361919109?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        
        {/* Offer Badge */}
        {offerBadge && (
          <Badge className={`absolute top-2 left-2 ${offerBadge.color} text-white flex items-center gap-1`}>
            <span>{offerBadge.icon}</span>
            <span className="text-xs font-semibold">{offerBadge.text}</span>
          </Badge>
        )}
        
        {/* Combo Badge */}
        {hasCombo && !offerBadge && (
          <Badge className="absolute top-2 left-2 bg-blue-500 text-white flex items-center gap-1">
            <span>📦</span>
            <span className="text-xs font-semibold">Combo</span>
          </Badge>
        )}
        
        {product.brand === 'INGCO' && (
          <Badge className="absolute top-2 right-2 bg-[var(--ingco-yellow)] text-black hover:bg-yellow-500">
            INGCO
          </Badge>
        )}
        
        {product.inStock ? (
          <Badge className="absolute bottom-2 right-2 bg-green-600">In Stock</Badge>
        ) : (
          <Badge variant="destructive" className="absolute bottom-2 right-2">
            Out of Stock
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        <div className="mb-2">
          <h3 className="line-clamp-2 min-h-[3rem]">{product.name}</h3>
          <p className="text-sm text-muted-foreground">{product.category}</p>
        </div>

        <div className="space-y-1">
          {/* Price Display */}
          {hasOffer ? (
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl text-[var(--ingco-yellow)]">₹{offerCalculation.discountedPrice}</span>
                <span className="text-sm text-green-600 font-semibold">
                  Save {offerCalculation.discountPercentage.toFixed(0)}%
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-sm text-muted-foreground line-through">₹{product.price}</span>
                <span className="text-xs text-muted-foreground">Original Price</span>
              </div>
              {offerCalculation.savingsText && (
                <div className="text-xs text-muted-foreground italic">{offerCalculation.savingsText}</div>
              )}
            </div>
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl text-[var(--ingco-yellow)]">₹{product.price}</span>
              <span className="text-sm text-muted-foreground">Retail</span>
            </div>
          )}
          
          {product.wholesalePrice && !hasOffer && (
            <div className="flex items-baseline gap-2">
              <span className="text-lg">₹{product.wholesalePrice}</span>
              <span className="text-sm text-green-600">Wholesale</span>
            </div>
          )}
        </div>

        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <Package className="w-4 h-4" />
          <span>Stock: {product.stock} units</span>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          onClick={handleWhatsApp}
          className="w-full bg-[var(--ingco-yellow)] text-black hover:bg-yellow-500"
          disabled={!product.inStock}
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          {hasOffer ? 'Get This Deal' : 'Enquire on WhatsApp'}
        </Button>
      </CardFooter>
    </Card>
  );
}
