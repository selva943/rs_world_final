import { useState } from 'react';
import { ProductCard } from '../components/ProductCard';
import { OfferCarousel } from '../components/OfferCarousel';
import { OfferBadge } from '../components/OfferBadge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Search, Tag } from 'lucide-react';
import { useData } from '../context/DataContext';

const categories = [
  'All',
  'Power Tools',
  'Hand Tools',
  'Construction Tools',
  'Electrical Tools',
  'Hardware & Accessories',
];

export function Products() {
  const { products, offers, loading } = useData();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const activeOffers = offers.filter(offer => 
    offer.status === 'active' && 
    (!offer.endDate || new Date(offer.endDate) >= new Date()) &&
    (offer.appliesTo === 'all' || offer.appliesTo === 'products' || offer.appliesTo === 'category')
  ).slice(0, 2);

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-[var(--ingco-yellow)] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl mb-4">Our Products</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Browse our extensive collection of quality INGCO tools at wholesale prices
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Product-Specific Offers Carousel */}
        {activeOffers.length > 0 && (
          <OfferCarousel 
            offers={activeOffers}
            title="Product Special Offers"
            subtitle="Exclusive discounts on INGCO tools and equipment"
            autoPlay={false}
          />
        )}

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                onClick={() => setSelectedCategory(category)}
                variant={selectedCategory === category ? 'default' : 'outline'}
                className={
                  selectedCategory === category
                    ? 'bg-[var(--ingco-yellow)] text-black hover:bg-yellow-500'
                    : ''
                }
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">No products found matching your criteria</p>
          </div>
        )}

        {/* Wholesale Info */}
        <div className="mt-16 p-8 bg-gradient-to-br from-[var(--ingco-black)] to-[var(--ingco-dark-grey)] text-white rounded-lg">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl mb-4">Wholesale Pricing Available</h2>
            <p className="text-gray-300 mb-6">
              Looking to buy in bulk? Contact us for special wholesale pricing on INGCO tools.
              We offer competitive rates for contractors and businesses.
            </p>
            <a href="https://wa.me/919361919109?text=I'm interested in wholesale pricing" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-[var(--ingco-yellow)] text-black hover:bg-yellow-500">
                Get Wholesale Quote
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}