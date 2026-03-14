import { Link } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import {
  Phone,
  MessageCircle,
  Wrench,
  ShieldCheck,
  IndianRupee,
  Headphones,
  Star,
  ArrowRight,
  Tag,
} from 'lucide-react';
import { customerReviews } from '../data/mockData';
import { ProductCard } from '../components/ProductCard';
import { RentalCard } from '../components/RentalCard';
import { OfferCarousel } from '../components/OfferCarousel';
import { useData } from '../context/DataContext';

export function Home() {
  const { products, rentals, offers, loading } = useData();
  
  const featuredProducts = products.slice(0, 4);
  const featuredRentals = rentals.slice(0, 3);
  const activeOffers = offers.filter(offer => 
    offer.status === 'active' && 
    (!offer.endDate || new Date(offer.endDate) >= new Date())
  ).slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-[var(--ingco-yellow)] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[var(--ingco-black)] to-[var(--ingco-dark-grey)] text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <div className="inline-block mb-4 px-4 py-2 bg-[var(--ingco-yellow)] text-black rounded-full text-sm">
              Authorized INGCO Dealer in Palani
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight">
              Professional Tools Sales & Rental Service
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Quality tools at wholesale prices. Trusted by contractors and professionals across Palani.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="tel:+919361919109">
                <Button size="lg" className="bg-[var(--ingco-yellow)] text-black hover:bg-yellow-500">
                  <Phone className="w-5 h-5 mr-2" />
                  Call Now
                </Button>
              </a>
              <a href="https://wa.me/919361919109" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="text-black border-white hover:bg-white/10">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  WhatsApp
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl mb-4">Why Choose RS Tools World?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We are the trusted INGCO dealer in Palani, serving contractors and professionals with quality tools and exceptional service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--ingco-yellow)] flex items-center justify-center">
                  <ShieldCheck className="w-8 h-8 text-black" />
                </div>
                <h3 className="mb-2">Authorized Dealer</h3>
                <p className="text-sm text-muted-foreground">
                  Official INGCO dealer with genuine products and warranty
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--ingco-yellow)] flex items-center justify-center">
                  <IndianRupee className="w-8 h-8 text-black" />
                </div>
                <h3 className="mb-2">Best Prices</h3>
                <p className="text-sm text-muted-foreground">
                  Wholesale pricing for bulk orders and competitive retail rates
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--ingco-yellow)] flex items-center justify-center">
                  <Wrench className="w-8 h-8 text-black" />
                </div>
                <h3 className="mb-2">Tool Rental</h3>
                <p className="text-sm text-muted-foreground">
                  Affordable rental service for construction equipment
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--ingco-yellow)] flex items-center justify-center">
                  <Headphones className="w-8 h-8 text-black" />
                </div>
                <h3 className="mb-2">Local Support</h3>
                <p className="text-sm text-muted-foreground">
                  Expert guidance and after-sales support in your language
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Special Offers Carousel */}
      {activeOffers.length > 0 && (
        <OfferCarousel 
          offers={activeOffers}
          title="Hot Deals & Special Offers"
          subtitle="Limited time discounts on premium INGCO tools and equipment"
          autoPlay={true}
          interval={4000}
        />
      )}

      {/* Best Selling Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl mb-2">Best Selling Tools</h2>
              <p className="text-muted-foreground">Quality INGCO tools at wholesale prices</p>
            </div>
            <Link to="/products">
              <Button variant="outline" className="hidden sm:flex">
                View All Products
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link to="/products">
              <Button variant="outline" className="w-full">
                View All Products
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Rental Tools */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl mb-2">Tools Available for Rent</h2>
              <p className="text-muted-foreground">Affordable rental rates for your projects</p>
            </div>
            <Link to="/rental">
              <Button variant="outline" className="hidden sm:flex">
                View All Rentals
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredRentals.map((tool) => (
              <RentalCard key={tool.id} tool={tool} />
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link to="/rental">
              <Button variant="outline" className="w-full">
                View All Rentals
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-green-100 text-green-800 rounded-full">
              <Star className="w-5 h-5 fill-current" />
              <span className="text-lg">4.8 Google Rating</span>
            </div>
            <h2 className="text-3xl md:text-4xl mb-4">What Our Customers Say</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Trusted by hundreds of contractors and professionals in Palani
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customerReviews.slice(0, 3).map((review) => (
              <Card key={review.id}>
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-3">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm mb-4 leading-relaxed">{review.comment}</p>
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{review.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(review.date).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-[var(--ingco-black)] to-[var(--ingco-dark-grey)] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Contact us today for wholesale pricing, bulk orders, or tool rental enquiries
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="tel:+919361919109">
              <Button size="lg" className="bg-[var(--ingco-yellow)] text-black hover:bg-yellow-500">
                <Phone className="w-5 h-5 mr-2" />
                Call: +91 93619 19109
              </Button>
            </a>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="text-black border-white hover:bg-white/10">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl mb-4">Visit Our Store</h2>
            <p className="text-muted-foreground">
              60/12, Santhai Road, Shanmugappuram, Palani, Tamil Nadu - 624601
            </p>
          </div>
          <div className="aspect-video w-full max-w-4xl mx-auto rounded-lg overflow-hidden shadow-lg">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3925.5!2d77.52!3d10.45!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDI3JzAwLjAiTiA3N8KwMzEnMTIuMCJF!5e0!3m2!1sen!2sin!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="RS Tools World Location"
            />
          </div>
        </div>
      </section>
    </div>
  );
}