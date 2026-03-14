import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Offer } from '../types';
import { 
  Tag, 
  Calendar, 
  Percent, 
  IndianRupee, 
  X, 
  Package, 
  Users, 
  Clock, 
  TrendingUp,
  Gift,
  Zap,
  Flame,
  Timer
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';

interface EnhancedOfferCardProps {
  offer: Offer;
  size?: 'compact' | 'normal' | 'large';
}

export function EnhancedOfferCard({ offer, size = 'normal' }: EnhancedOfferCardProps) {
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  const isExpired = offer.end_date && new Date(offer.end_date) < new Date();
  const isActive = offer.status === 'active' && !isExpired;

  // Calculate time left for limited time offers
  useEffect(() => {
    if (!offer.end_date) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const endTime = new Date(offer.end_date!).getTime();
      const distance = endTime - now;

      if (distance < 0) {
        setTimeLeft('Expired');
        clearInterval(timer);
      } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        
        if (days > 0) {
          setTimeLeft(`${days}d ${hours}h left`);
        } else if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}m left`);
        } else {
          setTimeLeft(`${minutes}m left`);
        }
      }
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [offer.end_date, offer.offer_type]);

  const getDiscountDisplay = () => {
    switch (offer.discount_type) {
      case 'percentage':
        return `${offer.discount_value}% OFF`;
      case 'fixed':
        return `₹${offer.discount_value} OFF`;
      default:
        return 'Special Offer';
    }
  };

  const getOfferTypeDisplay = () => {
    switch (offer.offer_type) {
      case 'combo':
        return { label: 'Combo Deal', icon: Users, color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'product':
        return { label: 'Product Deal', icon: Tag, color: 'bg-orange-100 text-orange-800 border-orange-200' };
      case 'category':
        return { label: 'Category Deal', icon: TrendingUp, color: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
      default:
        return { label: 'Special Offer', icon: Zap, color: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };

  const getOfferDetails = () => {
    const details = [];
    
    if (offer.min_quantity) {
      details.push(`Min. ${offer.min_quantity} pieces`);
    }
    
    if (offer.combo_products && offer.combo_products.length > 0) {
      details.push(`${offer.combo_products.length} items included`);
    }
    
    if (offer.products && offer.products.length > 0) {
      details.push(`${offer.products.length} products`);
    }
    
    if (offer.categories && offer.categories.length > 0) {
      details.push(`${offer.categories.length} categories`);
    }
    
    return details;
  };

  const getTargetPage = () => {
    switch (offer.offer_type) {
      case 'product':
      case 'category':
      case 'combo':
        return 'Products Page';
      default:
        return 'Shop';
    }
  };

  const handleShopNow = () => {
    switch (offer.offer_type) {
      case 'product':
      case 'category':
      case 'combo':
        navigate('/products');
        break;
      default:
        navigate('/products');
        break;
    }
  };

  const offerType = getOfferTypeDisplay();
  const offerDetails = getOfferDetails();
  const isCompact = size === 'compact';

  return (
    <>
      <Card className={`overflow-hidden transition-all duration-300 hover:shadow-lg ${!isActive ? 'opacity-60' : ''} ${isCompact ? 'scale-95' : ''}`}>
        {/* Offer Banner */}
        {offer.banner_image_url && !isCompact && (
          <div className="h-32 bg-gradient-to-br from-[var(--ingco-yellow)] to-yellow-600 relative">
            <img
              src={offer.banner_image_url}
              alt={offer.offer_name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            {!isActive && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Badge variant="destructive" className="text-lg px-4 py-2">
                  {isExpired ? 'Expired' : 'Inactive'}
                </Badge>
              </div>
            )}
          </div>
        )}
        
        <CardContent className={`${isCompact ? 'p-4' : 'p-6'}`}>
          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <div className={`flex-1 ${isCompact ? '' : ''}`}>
              <h3 className={`${isCompact ? 'text-sm' : 'text-xl'} font-semibold mb-2 line-clamp-2`}>
                {offer.offer_name}
              </h3>
              <div className="flex flex-wrap gap-1 mb-2">
                <Badge className={`${offerType.color} ${isCompact ? 'text-xs' : ''}`}>
                  <offerType.icon className={`w-3 h-3 mr-1`} />
                  {offerType.label}
                </Badge>
                <Badge variant="outline" className={`flex items-center ${isCompact ? 'text-xs' : ''}`}>
                  {offer.discount_type === 'percentage' ? (
                    <Percent className="w-3 h-3 mr-1" />
                  ) : offer.discount_type === 'fixed' ? (
                    <IndianRupee className="w-3 h-3 mr-1" />
                  ) : (
                    <Gift className="w-3 h-3 mr-1" />
                  )}
                  {getDiscountDisplay()}
                </Badge>
              </div>
            </div>
          </div>

          {/* Time Left for Limited Time Offers */}
          {timeLeft && !isCompact && (
            <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800">
                <Timer className="w-4 h-4" />
                <span className="font-semibold text-sm">{timeLeft}</span>
              </div>
            </div>
          )}

          {/* Offer Details */}
          {!isCompact && (
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-muted-foreground">
                <Tag className="w-4 h-4 mr-2" />
                <span>
                  {offer.offer_type === 'product' ? 'Selected Products' :
                   offer.offer_type === 'category' ? 'Selected Categories' :
                   offer.offer_type === 'combo' ? 'Combo Deal' : 'All Products'}
                </span>
              </div>
              
              {offer.end_date && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>
                    Valid until {new Date(offer.end_date).toLocaleDateString('en-IN')}
                  </span>
                </div>
              )}

              {/* Additional Details */}
              {offerDetails.length > 0 && (
                <div className="text-xs text-muted-foreground space-y-1">
                  {offerDetails.map((detail, index) => (
                    <div key={index}>• {detail}</div>
                  ))}
                </div>
              )}

              {/* Description */}
              {offer.offer_description && (
                <div className="text-sm text-muted-foreground mb-3">
                  {offer.offer_description}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className={`flex gap-2 ${isCompact ? 'mt-2' : 'mt-4'}`}>
            <Button
              className={`flex-1 bg-[var(--ingco-yellow)] text-black hover:bg-yellow-500 ${isCompact ? 'text-xs py-1' : ''}`}
              disabled={!isActive}
              onClick={handleShopNow}
            >
              {isActive ? (isCompact ? 'Shop Now' : `Shop Now - ${getTargetPage()}`) : 'Not Available'}
            </Button>
            {!isCompact && (
              <Button variant="outline" size="sm" onClick={() => setShowDetails(true)}>
                Details
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Offer Details Modal */}
      {showDetails && !isCompact && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold">{offer.name}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetails(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-6">
                {/* Offer Type and Discount */}
                <div className="flex flex-wrap gap-2">
                  <Badge className={offerType.color}>
                    <offerType.icon className="w-3 h-3 mr-1" />
                    {offerType.label}
                  </Badge>
                  <Badge variant="outline" className="flex items-center">
                    {offer.discountType === 'percentage' ? (
                      <Percent className="w-3 h-3 mr-1" />
                    ) : offer.discountType === 'fixed' ? (
                      <IndianRupee className="w-3 h-3 mr-1" />
                    ) : (
                      <Gift className="w-3 h-3 mr-1" />
                    )}
                    {getDiscountDisplay()}
                  </Badge>
                  <Badge variant={isActive ? "default" : "destructive"}>
                    {isActive ? 'Active' : (isExpired ? 'Expired' : 'Inactive')}
                  </Badge>
                </div>

                {/* Description */}
                {offer.description && (
                  <div>
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground">{offer.description}</p>
                  </div>
                )}

                {/* Full Details */}
                <div>
                  <h4 className="font-semibold mb-2">Offer Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Applies to:</span>
                        <span className="font-medium">
                          {offer.appliesTo === 'specific_product' ? 'Selected Products' :
                           offer.appliesTo === 'category' ? `${offer.categoryName} Category` :
                           offer.appliesTo === 'products' ? 'All Products' :
                           offer.appliesTo === 'rentals' ? 'All Rentals' : 'All Products & Rentals'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Discount:</span>
                        <span className="font-medium">{getDiscountDisplay()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Priority:</span>
                        <span className="font-medium">{offer.priority}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {offer.startDate && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Start Date:</span>
                          <span className="font-medium">
                            {new Date(offer.startDate).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                      )}
                      {offer.endDate && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">End Date:</span>
                          <span className="font-medium">
                            {new Date(offer.endDate).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Created:</span>
                        <span className="font-medium">
                          {new Date(offer.createdAt).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Banner Image */}
                {offer.bannerImageUrl && (
                  <div>
                    <h4 className="font-semibold mb-2">Offer Banner</h4>
                    <img
                      src={offer.bannerImageUrl}
                      alt={offer.name}
                      className="w-full h-48 object-cover rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4">
                  <Button
                    className="flex-1 bg-[var(--ingco-yellow)] text-black hover:bg-yellow-500"
                    disabled={!isActive}
                    onClick={handleShopNow}
                  >
                    {isActive ? `Shop Now - ${getTargetPage()}` : 'Not Available'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowDetails(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
