import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Offer } from '../types';
import { Tag, Calendar, Percent, IndianRupee, X, Package, Users, Clock, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useState } from 'react';

interface OfferCardProps {
  offer: Offer;
}

export function OfferCard({ offer }: OfferCardProps) {
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);
  const isExpired = offer.end_date && new Date(offer.end_date) < new Date();
  const isActive = offer.status === 'active' && !isExpired;

  const getDiscountDisplay = () => {
    if (offer.discount_type === 'percentage') {
      return `${offer.discount_value}% OFF`;
    } else {
      return `₹${offer.discount_value} OFF`;
    }
  };

  const getBulkOrderInfo = () => {
    // Mock bulk order info - in real app this would come from offer data
    if (offer.offer_type === 'bulk') {
      return {
        minQuantity: 5,
        extraDiscount: 10,
        freeShipping: true
      };
    }
    return null;
  };

  const getComboProducts = () => {
    // Mock combo products - in real app this would come from offer data
    if (offer.offer_type === 'combo') {
      return [
        'INGCO Drill Machine',
        'INGCO Screwdriver Set',
        'INGCO Safety Gloves'
      ];
    }
    return [];
  };

  const getAppliesToDisplay = () => {
    switch (offer.offer_type) {
      case 'product':
        return 'Selected Products';
      case 'category':
        return 'Selected Categories';
      case 'combo':
        return 'Combo Deal';
      default:
        return 'All Products';
    }
  };

  const getOfferTypeColor = () => {
    switch (offer.offer_type) {
      case 'combo':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'product':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'category':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleShopNow = () => {
    // Navigate based on what the offer applies to
    switch (offer.offer_type) {
      case 'product':
      case 'category':
      case 'combo':
        navigate('/products');
        break;
      default:
        // Navigate to products by default for general offers
        navigate('/products');
        break;
    }
  };

  const handleShowDetails = () => {
    setShowDetails(true);
  };

  const getTargetPage = () => {
    switch (offer.appliesTo) {
      case 'products':
      case 'category':
        return 'Products Page';
      case 'rentals':
        return 'Rental Page';
      case 'all':
      default:
        return 'Shop';
    }
  };

  return (
    <>
      <Card className={`overflow-hidden transition-all duration-300 hover:shadow-lg ${!isActive ? 'opacity-60' : ''}`}>
        {offer.banner_image_url && (
          <div className="h-48 bg-gradient-to-br from-[var(--ingco-yellow)] to-yellow-600 relative">
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
        
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">{offer.offer_name}</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge className={getOfferTypeColor()}>
                  <Tag className="w-3 h-3 mr-1" />
                  {offer.offer_type}
                </Badge>
                <Badge variant="outline" className="flex items-center">
                  {offer.discount_type === 'percentage' ? (
                    <Percent className="w-3 h-3 mr-1" />
                  ) : (
                    <IndianRupee className="w-3 h-3 mr-1" />
                  )}
                  {getDiscountDisplay()}
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <Tag className="w-4 h-4 mr-2" />
              <span>{getAppliesToDisplay()}</span>
            </div>
            
            {offer.end_date && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 mr-2" />
                <span>
                  Valid until {new Date(offer.end_date).toLocaleDateString('en-IN')}
                </span>
              </div>
            )}

            {/* Bulk Order Info */}
            {getBulkOrderInfo() && (
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-4 h-4 text-green-700" />
                  <span className="font-semibold text-green-800 text-sm">Bulk Order Deal</span>
                </div>
                <div className="text-xs text-green-700 space-y-1">
                  <div>• Buy {getBulkOrderInfo()?.minQuantity}+ pieces</div>
                  <div>• Extra {getBulkOrderInfo()?.extraDiscount}% OFF</div>
                  {getBulkOrderInfo()?.freeShipping && (
                    <div>• Free Shipping</div>
                  )}
                </div>
              </div>
            )}

            {/* Combo Products */}
            {getComboProducts().length > 0 && (
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-blue-700" />
                  <span className="font-semibold text-blue-800 text-sm">Combo Bundle</span>
                </div>
                <div className="text-xs text-blue-700">
                  {getComboProducts().slice(0, 2).map((product, index) => (
                    <div key={index}>• {product}</div>
                  ))}
                  {getComboProducts().length > 2 && (
                    <div>• +{getComboProducts().length - 2} more items</div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              className="flex-1 bg-[var(--ingco-yellow)] text-black hover:bg-yellow-500"
              disabled={!isActive}
              onClick={handleShopNow}
            >
              {isActive ? `Shop Now - ${getTargetPage()}` : 'Not Available'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleShowDetails}>
              Details
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Offer Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
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

              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge className={getOfferTypeColor()}>
                    <Tag className="w-3 h-3 mr-1" />
                    {offer.type}
                  </Badge>
                  <Badge variant="outline" className="flex items-center">
                    {offer.discountType === 'percentage' ? (
                      <Percent className="w-3 h-3 mr-1" />
                    ) : (
                      <IndianRupee className="w-3 h-3 mr-1" />
                    )}
                    {getDiscountDisplay()}
                  </Badge>
                  <Badge variant={isActive ? "default" : "destructive"}>
                    {isActive ? 'Active' : (isExpired ? 'Expired' : 'Inactive')}
                  </Badge>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Offer Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Applies to:</span>
                      <span className="font-medium">{getAppliesToDisplay()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Discount:</span>
                      <span className="font-medium">{getDiscountDisplay()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Priority:</span>
                      <span className="font-medium">{offer.priority}</span>
                    </div>
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
