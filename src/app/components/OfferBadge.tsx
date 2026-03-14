import { Badge } from './ui/badge';
import { Offer } from '../types';
import { Percent, IndianRupee, Package, Users, Tag } from 'lucide-react';

interface OfferBadgeProps {
  offer: Offer;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact';
}

export function OfferBadge({ offer, size = 'md', variant = 'default' }: OfferBadgeProps) {
  const getDiscountDisplay = () => {
    if (offer.discountType === 'percentage') {
      return `${offer.discountValue}%`;
    } else {
      return `₹${offer.discountValue}`;
    }
  };

  const getBadgeColor = () => {
    switch (offer.type) {
      case 'festival':
        return 'bg-red-500 text-white';
      case 'combo':
        return 'bg-blue-500 text-white';
      case 'bulk':
        return 'bg-green-500 text-white';
      default:
        return 'bg-orange-500 text-white';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs px-2 py-1';
      case 'lg':
        return 'text-base px-4 py-2';
      default:
        return 'text-sm px-3 py-1';
    }
  };

  const getIcon = () => {
    switch (offer.type) {
      case 'festival':
        return <Tag className="w-3 h-3" />;
      case 'combo':
        return <Users className="w-3 h-3" />;
      case 'bulk':
        return <Package className="w-3 h-3" />;
      default:
        return offer.discountType === 'percentage' ? 
          <Percent className="w-3 h-3" : 
          <IndianRupee className="w-3 h-3" />;
    }
  };

  if (variant === 'compact') {
    return (
      <Badge className={`${getBadgeColor()} ${getSizeClasses()} flex items-center gap-1 border-0`}>
        {getIcon()}
        {getDiscountDisplay()}
      </Badge>
    );
  }

  return (
    <div className="space-y-1">
      <Badge className={`${getBadgeColor()} ${getSizeClasses()} flex items-center gap-1 border-0`}>
        {getIcon()}
        <span className="font-semibold">{getDiscountDisplay()} OFF</span>
      </Badge>
      {offer.type !== 'festival' && (
        <div className="text-xs text-muted-foreground">
          {offer.type === 'combo' ? 'Combo Deal' : 'Bulk Order'}
        </div>
      )}
    </div>
  );
}
