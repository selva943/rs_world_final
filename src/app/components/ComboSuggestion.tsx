import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Product, Offer } from '../types';
import { OfferEngine, ComboOffer } from '../utils/offerEngine';
import { 
  Package, 
  Plus, 
  IndianRupee, 
  Percent, 
  ShoppingCart, 
  MessageCircle,
  ArrowRight,
  X
} from 'lucide-react';
import { useState } from 'react';

interface ComboSuggestionProps {
  currentProduct: Product;
  comboOffers: ComboOffer[];
  onComboClick?: (combo: ComboOffer) => void;
}

export function ComboSuggestion({ currentProduct, comboOffers, onComboClick }: ComboSuggestionProps) {
  const [dismissedCombos, setDismissedCombos] = useState<Set<string>>(new Set());

  if (comboOffers.length === 0) return null;

  const handleDismiss = (comboId: string) => {
    setDismissedCombos(prev => new Set(prev).add(comboId));
  };

  const handleComboWhatsApp = (combo: ComboOffer) => {
    const productNames = combo.products.map(p => p.name).join(', ');
    const message = `Hi, I'm interested in the combo deal: ${combo.offer.offer_name} which includes: ${productNames}. Total price: ₹${combo.comboPrice} (Original: ₹${combo.totalOriginalPrice}). Is this available?`;
    const url = `https://wa.me/919361919109?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const visibleCombos = comboOffers.filter(combo => !dismissedCombos.has(combo.offer.id));

  if (visibleCombos.length === 0) return null;

  return (
    <div className="space-y-4">
      {visibleCombos.map((combo) => (
        <Card key={combo.offer.id} className="border-blue-200 bg-blue-50 overflow-hidden">
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-500 text-white">
                  <Package className="w-3 h-3 mr-1" />
                  Combo Deal
                </Badge>
                <Badge variant="outline" className="text-blue-600 border-blue-300">
                  Save {combo.savingsPercentage.toFixed(0)}%
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDismiss(combo.offer.id)}
                className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Offer Name */}
            <h3 className="text-lg font-semibold text-blue-900 mb-3">{combo.offer.offer_name}</h3>

            {/* Products in Combo */}
            <div className="space-y-3 mb-4">
              <div className="text-sm font-medium text-gray-700">This combo includes:</div>
              <div className="space-y-2">
                {combo.products.map((product, index) => (
                  <div key={product.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {product.name}
                      </div>
                      <div className="text-xs text-gray-500">{product.category}</div>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      ₹{product.price}
                    </div>
                    {index < combo.products.length - 1 && (
                      <Plus className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white p-4 rounded-lg border border-blue-200 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Original Price:</span>
                <span className="text-sm text-gray-900 line-through">₹{combo.totalOriginalPrice}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Combo Price:</span>
                <span className="text-lg font-bold text-blue-600">₹{combo.comboPrice}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">You Save:</span>
                <span className="text-sm font-semibold text-green-600">
                  ₹{combo.savings} ({combo.savingsPercentage.toFixed(0)}%)
                </span>
              </div>
            </div>

            {/* Offer Details */}
            {combo.offer.description && (
              <div className="text-sm text-gray-600 mb-4 italic">
                {combo.offer.description}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={() => handleComboWhatsApp(combo)}
                className="flex-1 bg-blue-500 text-white hover:bg-blue-600"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Get Combo Deal
              </Button>
              {onComboClick && (
                <Button
                  variant="outline"
                  onClick={() => onComboClick(combo)}
                  className="border-blue-300 text-blue-600 hover:bg-blue-50"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              )}
            </div>

            {/* Expiry Info */}
            {combo.offer.endDate && (
              <div className="mt-4 text-xs text-gray-500 flex items-center gap-1">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                Offer valid until {new Date(combo.offer.endDate).toLocaleDateString('en-IN')}
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Summary for multiple combos */}
      {visibleCombos.length > 1 && (
        <Card className="border-gray-200 bg-gray-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Package className="w-4 h-4" />
              <span>
                {visibleCombos.length} combo deal{visibleCombos.length > 1 ? 's' : ''} available with this product
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
