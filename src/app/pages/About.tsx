import { Card, CardContent } from '../components/ui/card';
import { ShieldCheck, Trophy, Users, Target } from 'lucide-react';

export function About() {
  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl mb-4">About RS Tools World</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your trusted partner for quality tools in Palani
          </p>
        </div>

        {/* Hero Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card>
            <CardContent className="p-8">
              <div className="aspect-video bg-gradient-to-br from-[var(--ingco-black)] to-[var(--ingco-dark-grey)] rounded-lg mb-6 flex items-center justify-center text-white">
                <div className="text-center p-8">
                  <div className="text-6xl mb-4 text-[var(--ingco-yellow)]">🔧</div>
                  <h2 className="text-3xl mb-2">RS Tools World</h2>
                  <p className="text-xl text-gray-300">Authorized INGCO Dealer</p>
                </div>
              </div>
              <div className="prose max-w-none">
                <p className="text-lg leading-relaxed">
                  Welcome to <strong>RS Tools World</strong>, your one-stop destination for premium quality tools in Palani, Tamil Nadu. As an authorized INGCO dealer, we take pride in providing authentic, reliable tools to contractors, professionals, and DIY enthusiasts across the region.
                </p>
                <p className="text-lg leading-relaxed mt-4">
                  Located at <strong>60/12, Santhai Road, Shanmugappuram, Palani</strong>, we have been serving the local community with dedication and integrity. Our commitment is to offer the best tools at competitive wholesale prices, backed by excellent customer service.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Our Values */}
        <div className="mb-16">
          <h2 className="text-3xl text-center mb-8">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--ingco-yellow)] flex items-center justify-center">
                  <ShieldCheck className="w-8 h-8 text-black" />
                </div>
                <h3 className="mb-2">Authenticity</h3>
                <p className="text-sm text-muted-foreground">
                  100% genuine INGCO products with official warranty
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--ingco-yellow)] flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-black" />
                </div>
                <h3 className="mb-2">Quality</h3>
                <p className="text-sm text-muted-foreground">
                  Only the finest tools that meet industry standards
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--ingco-yellow)] flex items-center justify-center">
                  <Users className="w-8 h-8 text-black" />
                </div>
                <h3 className="mb-2">Customer First</h3>
                <p className="text-sm text-muted-foreground">
                  Dedicated support and guidance in your language
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--ingco-yellow)] flex items-center justify-center">
                  <Target className="w-8 h-8 text-black" />
                </div>
                <h3 className="mb-2">Fair Pricing</h3>
                <p className="text-sm text-muted-foreground">
                  Transparent wholesale and retail rates
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* What We Offer */}
        <div className="mb-16">
          <h2 className="text-3xl text-center mb-8">What We Offer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-3 text-xl">🛠️ Tools Sales</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Power Tools (Drills, Grinders, Saws)</li>
                  <li>• Hand Tools (Wrenches, Screwdrivers, Hammers)</li>
                  <li>• Construction Equipment</li>
                  <li>• Electrical Tools & Accessories</li>
                  <li>• Hardware & Safety Equipment</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="mb-3 text-xl">🔧 Tool Rental Service</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Heavy Construction Equipment</li>
                  <li>• Daily & Hourly Rental Options</li>
                  <li>• Well-Maintained Tools</li>
                  <li>• Affordable Rental Rates</li>
                  <li>• Free Delivery Within Palani</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="mb-3 text-xl">💰 Wholesale Pricing</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Special rates for bulk orders</li>
                  <li>• Contractor discounts available</li>
                  <li>• Flexible payment options</li>
                  <li>• Volume-based pricing</li>
                  <li>• GST invoicing for businesses</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="mb-3 text-xl">🎯 Customer Support</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Expert product guidance</li>
                  <li>• After-sales support</li>
                  <li>• Tool usage training</li>
                  <li>• Local language assistance</li>
                  <li>• Quick warranty claims</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Why INGCO */}
        <Card className="mb-16 bg-gradient-to-br from-[var(--ingco-black)] to-[var(--ingco-dark-grey)] text-white">
          <CardContent className="p-8">
            <h2 className="text-3xl mb-6 text-[var(--ingco-yellow)]">Why INGCO Tools?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl mb-3">Global Brand</h3>
                <p className="text-gray-300">
                  INGCO is a globally recognized brand known for manufacturing high-quality, durable tools for professional and industrial use.
                </p>
              </div>
              <div>
                <h3 className="text-xl mb-3">Trusted Quality</h3>
                <p className="text-gray-300">
                  Every INGCO tool undergoes rigorous testing to ensure it meets international quality standards and delivers consistent performance.
                </p>
              </div>
              <div>
                <h3 className="text-xl mb-3">Warranty Protection</h3>
                <p className="text-gray-300">
                  All INGCO products come with manufacturer warranty, giving you peace of mind and protection for your investment.
                </p>
              </div>
              <div>
                <h3 className="text-xl mb-3">Value for Money</h3>
                <p className="text-gray-300">
                  INGCO offers professional-grade tools at competitive prices, making quality accessible to everyone.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visit Us */}
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl mb-4">Visit Our Store</h2>
          <p className="text-lg text-muted-foreground mb-6">
            We welcome you to visit our store and experience our products firsthand. Our knowledgeable staff is ready to help you find the right tools for your needs.
          </p>
          <div className="space-y-2">
            <p><strong>Address:</strong> 60/12, Santhai Road, Shanmugappuram, Palani, Tamil Nadu - 624601</p>
            <p><strong>Phone:</strong> <a href="tel:+919361919109" className="text-[var(--ingco-yellow)] hover:underline">+91 93619 19109</a></p>
            <p><strong>Hours:</strong> Open Daily - Closes 9 PM</p>
          </div>
        </div>
      </div>
    </div>
  );
}
