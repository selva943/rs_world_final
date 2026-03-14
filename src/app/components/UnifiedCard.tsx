import React from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Package, 
  Percent, 
  Gift, 
  Clock, 
  Star,
  IndianRupee,
  ShoppingCart,
  MessageCircle,
  Calendar,
  Tag,
  TrendingUp,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Product, RentalTool, Offer } from '../types';

// Unified Card Props
interface UnifiedCardProps {
  type: 'product' | 'rental' | 'offer';
  data: Product | RentalTool | Offer;
  allOffers?: Offer[];
  onAddToCart?: (product: Product) => void;
  onWhatsApp?: (product: Product, message: string) => void;
  onEdit?: (data: any) => void;
  onDelete?: (data: any) => void;
  onToggleStatus?: (data: any) => void;
  className?: string;
}

export function UnifiedCard({ 
  type, 
  data, 
  allOffers = [], 
  onAddToCart, 
  onWhatsApp, 
  onEdit, 
  onDelete, 
  onToggleStatus,
  className 
}: UnifiedCardProps) {
  
  // Product Card Logic
  if (type === 'product') {
    const product = data as Product;
    const hasStock = product.inStock && product.stock > 0;
    
    const handleWhatsApp = () => {
      const message = `Hi, I'm interested in ${product.name} - ₹${product.price}. Is it available?`;
      if (onWhatsApp) {
        onWhatsApp(product, message);
      } else {
        const url = `https://wa.me/919361919109?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
      }
    };
    
    return (
      <Card className={`h-[400px] flex flex-col ${className}`}>
        <CardContent className="p-4 flex flex-col h-full">
          {/* Image Section - Fixed Height */}
          <div className="relative h-48 mb-4 bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder-product.png';
              }}
            />
            {product.stock <= 5 && hasStock && (
              <Badge className="absolute top-2 left-2 bg-orange-500 text-white text-xs">
                <Clock className="w-3 h-3 mr-1" />
                Only {product.stock} left
              </Badge>
            )}
            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-1">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                <span className="text-xs font-medium">4.5</span>
              </div>
            </div>
          </div>
          
          {/* Content Section - Fixed Height */}
          <div className="flex-1 flex flex-col">
            <div className="mb-3">
              <h3 className="font-semibold text-base line-clamp-2 mb-1">{product.name}</h3>
              <p className="text-sm text-gray-600">{product.category}</p>
            </div>
            
            {/* Price Section */}
            <div className="mb-3">
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold">
                  ₹{product.price.toLocaleString()}
                </span>
              </div>
            </div>
            
            {/* Stock Status */}
            <div className="mb-3">
              {hasStock ? (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="w-3 h-3" />
                  In Stock ({product.stock})
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="w-3 h-3" />
                  Out of Stock
                </div>
              )}
            </div>
            
            {/* Action Buttons - Fixed at Bottom, Same Line */}
            <div className="mt-auto pt-3 border-t flex items-end">
              <div className="flex gap-2 w-full">
                <Button
                  size="sm"
                  onClick={() => onAddToCart?.(product)}
                  disabled={!hasStock}
                  className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                >
                  <ShoppingCart className="w-3 h-3 mr-1" />
                  Add
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleWhatsApp}
                  className="flex-shrink-0"
                >
                  <MessageCircle className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Rental Card Logic
  if (type === 'rental') {
    const rental = data as RentalTool;
    const isAvailable = rental.available;
    
    const handleWhatsApp = () => {
      const message = `Hi, I'm interested in renting ${rental.name}. Daily rate: ₹${rental.rentPerDay}. Is it available?`;
      if (onWhatsApp) {
        onWhatsApp(rental as any, message);
      } else {
        const url = `https://wa.me/919361919109?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
      }
    };
    
    return (
      <Card className={`h-[400px] flex flex-col ${className}`}>
        <CardContent className="p-4 flex flex-col h-full">
          {/* Image Section - Fixed Height */}
          <div className="relative h-48 mb-4 bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={rental.image}
              alt={rental.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder-rental.png';
              }}
            />
            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-1">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                <span className="text-xs font-medium">4.2</span>
              </div>
            </div>
          </div>
          
          {/* Content Section - Fixed Height */}
          <div className="flex-1 flex flex-col">
            <div className="mb-3">
              <h3 className="font-semibold text-base line-clamp-2 mb-1">{rental.name}</h3>
              <p className="text-sm text-gray-600">{rental.brand || 'INGCO'}</p>
            </div>
            
            {/* Pricing Section */}
            <div className="mb-3">
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold">
                  ₹{rental.rentPerDay}/day
                </span>
                {rental.rentPerHour && (
                  <span className="text-sm text-gray-500">
                    (₹{rental.rentPerHour}/hr)
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-600">
                Deposit: ₹{rental.deposit.toLocaleString()}
              </div>
            </div>
            
            {/* Availability Status */}
            <div className="mb-3">
              {isAvailable ? (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="w-3 h-3" />
                  Available
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="w-3 h-3" />
                  Currently Unavailable
                </div>
              )}
            </div>
            
            {/* Action Buttons - Fixed at Bottom, Same Line */}
            <div className="mt-auto pt-3 border-t flex items-end">
              <div className="flex gap-2 w-full">
                <Button
                  size="sm"
                  disabled={!isAvailable}
                  className="flex-1 bg-green-600 text-white hover:bg-green-700"
                >
                  <Package className="w-3 h-3 mr-1" />
                  Rent Now
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleWhatsApp}
                  className="flex-shrink-0"
                >
                  <MessageCircle className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Offer Card Logic
  if (type === 'offer') {
    const offer = data as Offer;
    const isActive = offer.status;
    const hasEndDate = offer.end_date && new Date(offer.end_date) < new Date();
    const isExpired = hasEndDate;
    
    const getOfferBadge = () => {
      switch (offer.offer_type) {
        case 'combo':
          return { text: 'Combo Deal', color: 'bg-purple-500', icon: <Gift className="w-3 h-3 mr-1" /> };
        case 'product':
          return { text: 'Product Offer', color: 'bg-green-500', icon: <Package className="w-3 h-3 mr-1" /> };
        case 'category':
          return { text: 'Category Offer', color: 'bg-blue-500', icon: <Tag className="w-3 h-3 mr-1" /> };
        default:
          return { text: 'Offer', color: 'bg-gray-500', icon: <Tag className="w-3 h-3 mr-1" /> };
      }
    };
    
    const badge = getOfferBadge();
    
    return (
      <Card className={`h-[400px] flex flex-col ${className}`}>
        <CardContent className="p-4 flex flex-col h-full">
          {/* Header Section */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={`${badge.color} text-white text-xs`}>
                  {badge.icon}{badge.text}
                </Badge>
                <Badge variant={isActive ? 'default' : 'secondary'} className="text-xs">
                  {isActive ? 'Active' : 'Inactive'}
                </Badge>
                {isExpired && (
                  <Badge variant="destructive" className="text-xs">
                    Expired
                  </Badge>
                )}
              </div>
              <h3 className="font-semibold text-base line-clamp-2 mb-1">{offer.offer_name}</h3>
              <p className="text-sm text-gray-600 line-clamp-2">{offer.offer_description}</p>
            </div>
          </div>
          
          {/* Details Section */}
          <div className="flex-1 flex flex-col">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <span className="text-xs font-medium text-gray-500">Discount</span>
                <div className="flex items-center gap-1">
                  {offer.discount_type === 'percentage' ? (
                    <><Percent className="w-3 h-3" /> {offer.discount_value}%</>
                  ) : (
                    <><IndianRupee className="w-3 h-3" /> {offer.discount_value}</>
                  )}
                </div>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500">Type</span>
                <div className="flex items-center gap-1">
                  {offer.offer_type === 'product' && <Package className="w-3 h-3" />}
                  {offer.offer_type === 'category' && <Tag className="w-3 h-3" />}
                  {offer.offer_type === 'combo' && <Gift className="w-3 h-3" />}
                  <span className="text-xs">{offer.offer_type}</span>
                </div>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500">Min Qty</span>
                <div className="text-sm">{offer.min_quantity}</div>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500">Priority</span>
                <div className="text-sm">{offer.priority}</div>
              </div>
            </div>
            
            {/* Date Range */}
            {offer.start_date && (
              <div className="text-xs text-gray-500 mb-3">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(offer.start_date).toLocaleDateString()}
                  {offer.end_date && ` - ${new Date(offer.end_date).toLocaleDateString()}`}
                </div>
              </div>
            )}
            
            {/* Applicable Items */}
            {(offer.products && offer.products.length > 0) && (
              <div className="mb-3">
                <span className="text-xs font-medium text-gray-500">Products</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {offer.products.slice(0, 3).map(productId => (
                    <Badge key={productId} variant="outline" className="text-xs">
                      {productId}
                    </Badge>
                  ))}
                  {offer.products.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{offer.products.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            )}
            
            {(offer.categories && offer.categories.length > 0) && (
              <div className="mb-3">
                <span className="text-xs font-medium text-gray-500">Categories</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {offer.categories.slice(0, 3).map(categoryId => (
                    <Badge key={categoryId} variant="outline" className="text-xs">
                      {categoryId}
                    </Badge>
                  ))}
                  {offer.categories.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{offer.categories.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Action Buttons - Fixed at Bottom, Same Line */}
          <div className="mt-auto pt-3 border-t flex items-end">
            <div className="flex gap-2 w-full">
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(offer)}
                  className="flex-shrink-0"
                >
                  <Edit className="w-3 h-3" />
                </Button>
              )}
              {onToggleStatus && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onToggleStatus(offer)}
                  className="flex-shrink-0"
                >
                  {isActive ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(offer)}
                  className="flex-shrink-0"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return null;
}
