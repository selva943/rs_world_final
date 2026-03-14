import { useState, useMemo } from 'react';
import { OfferCarousel } from '../components/OfferCarousel';
import { OfferCard } from '../components/OfferCard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { 
  Search, 
  Filter, 
  Tag, 
  Calendar, 
  Percent, 
  Package, 
  Users,
  X,
  ChevronDown 
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { Offer } from '../types';

const offerTypes = [
  { value: 'all', label: 'All Offers' },
  { value: 'product', label: 'Product Offers' },
  { value: 'category', label: 'Category Offers' },
  { value: 'combo', label: 'Combo Deals' }
];

const discountTypes = [
  { value: 'all', label: 'All Discounts' },
  { value: 'percentage', label: 'Percentage Off' },
  { value: 'fixed', label: 'Fixed Off' }
];

const appliesToOptions = [
  { value: 'all', label: 'All Categories' },
  { value: 'product', label: 'Product Offers' },
  { value: 'category', label: 'Category Offers' },
  { value: 'combo', label: 'Combo Deals' }
];

export function Offers() {
  const { offers, loading } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedDiscount, setSelectedDiscount] = useState('all');
  const [selectedAppliesTo, setSelectedAppliesTo] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('priority');

  // Filter and sort offers
  const filteredAndSortedOffers = useMemo(() => {
    let filtered = offers.filter(offer => 
      offer.status === 'active' && 
      (!offer.end_date || new Date(offer.end_date) >= new Date())
    );

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(offer =>
        offer.offer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offer.offer_type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(offer => offer.offer_type === selectedType);
    }

    // Discount type filter
    if (selectedDiscount !== 'all') {
      filtered = filtered.filter(offer => offer.discount_type === selectedDiscount);
    }

    // Applies to filter
    if (selectedAppliesTo !== 'all') {
      filtered = filtered.filter(offer => offer.offer_type === selectedAppliesTo);
    }

    // Sort
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          return b.priority - a.priority;
        case 'name':
          return a.offer_name.localeCompare(b.offer_name);
        case 'discount':
          const aDiscount = a.discount_type === 'percentage' ? a.discount_value : a.discount_value;
          const bDiscount = b.discount_type === 'percentage' ? b.discount_value : b.discount_value;
          return bDiscount - aDiscount;
        case 'endDate':
          const aEnd = a.end_date ? new Date(a.end_date).getTime() : Infinity;
          const bEnd = b.end_date ? new Date(b.end_date).getTime() : Infinity;
          return aEnd - bEnd;
        default:
          return 0;
      }
    });
  }, [offers, searchQuery, selectedType, selectedDiscount, selectedAppliesTo, sortBy]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedDiscount('all');
    setSelectedAppliesTo('all');
    setSortBy('priority');
  };

  const activeFiltersCount = [
    searchQuery,
    selectedType !== 'all',
    selectedDiscount !== 'all',
    selectedAppliesTo !== 'all',
    sortBy !== 'priority'
  ].filter(Boolean).length;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-[var(--ingco-yellow)] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Loading offers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-red-100 text-red-800 rounded-full">
            <Tag className="w-5 h-5" />
            <span className="text-lg font-semibold">All Offers</span>
          </div>
          <h1 className="text-4xl md:text-5xl mb-4">Special Offers & Deals</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover amazing deals on INGCO tools, equipment rentals, and bulk orders
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search offers by name or type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="destructive" className="ml-1">
                    {activeFiltersCount}
                  </Badge>
                )}
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>
              
              {activeFiltersCount > 0 && (
                <Button variant="ghost" onClick={clearFilters}>
                  <X className="w-4 h-4" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-white p-6 rounded-lg border shadow-sm mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Offer Type Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2">Offer Type</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    {offerTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Discount Type Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2">Discount Type</label>
                  <select
                    value={selectedDiscount}
                    onChange={(e) => setSelectedDiscount(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    {discountTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Applies To Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2">Applies To</label>
                  <select
                    value={selectedAppliesTo}
                    onChange={(e) => setSelectedAppliesTo(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    {appliesToOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="priority">Priority</option>
                    <option value="name">Name</option>
                    <option value="discount">Best Discount</option>
                    <option value="endDate">Ending Soon</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredAndSortedOffers.length} offer{filteredAndSortedOffers.length !== 1 ? 's' : ''}
            {searchQuery && ` for "${searchQuery}"`}
          </p>
        </div>

        {/* Featured Offers Carousel */}
        {filteredAndSortedOffers.length > 0 && (
          <div className="mb-12">
            <OfferCarousel 
              offers={filteredAndSortedOffers.slice(0, 6)}
              title="Featured Deals"
              subtitle="Hand-picked offers with maximum savings"
              autoPlay={true}
              interval={5000}
            />
          </div>
        )}

        {/* All Offers Grid */}
        {filteredAndSortedOffers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedOffers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No offers found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or filters to find what you're looking for.
              </p>
              <Button onClick={clearFilters} variant="outline">
                Clear All Filters
              </Button>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-16 bg-gradient-to-r from-[var(--ingco-black)] to-[var(--ingco-dark-grey)] text-white rounded-lg p-8">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl mb-4">Need Help with Offers?</h2>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Our team is here to help you find the best deals on INGCO tools and equipment.
              Contact us for personalized recommendations and bulk pricing.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="tel:+919361919109">
                <Button size="lg" className="bg-[var(--ingco-yellow)] text-black hover:bg-yellow-500">
                  Call Now
                </Button>
              </a>
              <a href="https://wa.me/919361919109" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="text-black border-white hover:bg-white/10">
                  WhatsApp
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
