import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Product, Offer } from '../types';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { 
  ArrowLeft, 
  MessageCircle, 
  Phone, 
  Package, 
  Timer, 
  ShieldCheck,
  Star,
  IndianRupee,
  Percent,
  Gift
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useCart } from '../context/CartContext';
import { OfferEngine, ComboOffer } from '../utils/offerEngine';
import { EnhancedOfferCard } from '../components/EnhancedOfferCard';
import { ComboSuggestion } from '../components/ComboSuggestion';
import { FrequentlyBoughtTogether } from '../components/FrequentlyBoughtTogether';

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, offers, loading } = useData();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [comboOffers, setComboOffers] = useState<ComboOffer[]>([]);

  useEffect(() => {
    if (products.length > 0 && id) {
      const foundProduct = products.find(p => p.id === id);
      setProduct(foundProduct || null);
      
      if (foundProduct) {
        const combos = OfferEngine.getComboOffers(foundProduct, offers, products);
        setComboOffers(combos);
      }
    }
  }, [products, id, offers]);

  useEffect(() => {
    if (!product) return;

    const bestOffer = OfferEngine.getHighestPriorityOffer(product, offers);
    if (bestOffer && bestOffer.offer_type && bestOffer.end_date) {
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const endTime = new Date(bestOffer.end_date!).getTime();
        const distance = endTime - now;

        if (distance < 0) {
          setTimeLeft('Expired');
          clearInterval(timer);
        } else {
          const days = Math.floor(distance / (1000 * 60 * 60 * 24));
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
          
          setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [product, offers]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-[var(--ingco-yellow)] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Product Not Found</h2>
          <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/products')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  const offerCalculation = OfferEngine.calculateBestOffer(product, offers);
  const hasOffer = offerCalculation.applicableOffer !== null;
  const applicableOffers = OfferEngine.getApplicableOffers(product, offers);
  const offerBadge = hasOffer ? OfferEngine.getOfferBadge(offerCalculation.applicableOffer!) : null;

  const handleWhatsApp = () => {
    const priceText = hasOffer ? 
      `₹${offerCalculation.discountedPrice} (Original: ₹${product.price})` : 
      `₹${product.price}`;
    const message = `Hi, I'm interested in ${product.name} (${priceText}). Is it available?`;
    const url = `https://wa.me/919361919109?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleCall = () => {
    window.location.href = 'tel:+919361919109';
  };

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
      
      // Track offer usage if applicable
      if (hasOffer && offerCalculation.applicableOffer) {
        OfferEngine.trackOfferUsage(
          offerCalculation.applicableOffer.id,
          product.id,
          product.price,
          offerCalculation.discountedPrice,
          quantity
        );
      }
    }
  };

  return (
    <div className="py-8 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Button variant="ghost" onClick={() => navigate('/products')} className="p-0 h-auto">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Products
          </Button>
          <span>/</span>
          <span className="text-muted-foreground">{product.category}</span>
          <span>/</span>
          <span className="font-medium">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div>
            <Card className="overflow-hidden">
              <div className="aspect-square bg-gray-100">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </Card>
            
            {/* Offer Badge */}
            {offerBadge && (
              <div className="mt-4">
                <Badge className={`${offerBadge.color} text-white flex items-center gap-2 px-4 py-2`}>
                  <span className="text-lg">{offerBadge.icon}</span>
                  <span className="font-semibold">{offerBadge.text}</span>
                </Badge>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold">{product.name}</h1>
                {product.brand === 'INGCO' && (
                  <Badge className="bg-[var(--ingco-yellow)] text-black">INGCO</Badge>
                )}
              </div>
              <p className="text-lg text-muted-foreground">{product.category}</p>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">(4.8) • 127 Reviews</span>
              </div>
            </div>

            {/* Price Section */}
            <Card className="p-6">
              <div className="space-y-4">
                {hasOffer ? (
                  <>
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl font-bold text-[var(--ingco-yellow)]">
                        ₹{offerCalculation.discountedPrice}
                      </span>
                      <span className="text-xl text-muted-foreground line-through">
                        ₹{product.price}
                      </span>
                      <Badge className="bg-green-100 text-green-800">
                        Save {offerCalculation.discountPercentage.toFixed(0)}%
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      {offerCalculation.savingsText}
                    </div>
                    
                    {timeLeft && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <Timer className="w-5 h-5 text-red-600" />
                        <div>
                          <div className="font-semibold text-red-800">Limited Time Offer</div>
                          <div className="text-sm text-red-600">{timeLeft} remaining</div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-[var(--ingco-yellow)]">
                      ₹{product.price}
                    </span>
                    <span className="text-sm text-muted-foreground">Retail Price</span>
                  </div>
                )}

                {product.wholesalePrice && !hasOffer && (
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg">₹{product.wholesalePrice}</span>
                    <span className="text-sm text-green-600">Wholesale Price</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Product Info */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Product Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-muted-foreground" />
                  <span>Stock: {product.stock} units</span>
                  {product.inStock ? (
                    <Badge className="bg-green-100 text-green-800">In Stock</Badge>
                  ) : (
                    <Badge variant="destructive">Out of Stock</Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-muted-foreground" />
                  <span>Authorized INGCO Dealer</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <span>+91 93619 19109</span>
                </div>
              </div>
            </Card>

            {/* Description */}
            {product.description && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Description</h3>
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleWhatsApp}
                className="w-full bg-[var(--ingco-yellow)] text-black hover:bg-yellow-500 py-3"
                disabled={!product.inStock}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                {hasOffer ? 'Get This Deal on WhatsApp' : 'Enquire on WhatsApp'}
              </Button>
              
              <Button
                onClick={handleCall}
                variant="outline"
                className="w-full py-3"
              >
                <Phone className="w-5 h-5 mr-2" />
                Call Now
              </Button>
            </div>
          </div>
        </div>

        {/* Applicable Offers Section */}
        {applicableOffers.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Available Offers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {applicableOffers.map((offer) => (
                <EnhancedOfferCard key={offer.id} offer={offer} size="compact" />
              ))}
            </div>
          </div>
        )}

        {/* Combo Suggestions Section */}
        {comboOffers.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Combo Deals with This Product</h2>
            <ComboSuggestion 
              currentProduct={product!}
              comboOffers={comboOffers}
              onComboClick={(combo) => {
                // Navigate to products page filtered by combo products
                navigate('/products');
              }}
            />
          </div>
        )}

        {/* Frequently Bought Together */}
        <FrequentlyBoughtTogether
          currentProduct={product!}
          allProducts={products}
          offers={offers}
          onAddToCart={addItem}
        />

        {/* Similar Products */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Similar Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products
              .filter(p => p.category === product.category && p.id !== product.id)
              .slice(0, 4)
              .map((similarProduct) => (
                <Card key={similarProduct.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="aspect-square bg-gray-100">
                    <img
                      src={similarProduct.image}
                      alt={similarProduct.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="line-clamp-2 mb-2">{similarProduct.name}</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-semibold">₹{similarProduct.price}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
