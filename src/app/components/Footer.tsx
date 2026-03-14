import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { Link } from 'react-router';

export function Footer() {
  return (
    <footer className="bg-[var(--ingco-black)] text-white mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xl mb-4 text-[var(--ingco-yellow)]">RS Tools World</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Authorized INGCO dealer in Palani. We provide quality tools for sales and rental at the best wholesale prices.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl mb-4 text-[var(--ingco-yellow)]">Quick Links</h3>
            <div className="flex flex-col gap-2">
              <Link to="/" className="text-gray-300 hover:text-[var(--ingco-yellow)] transition-colors">
                Home
              </Link>
              <Link to="/products" className="text-gray-300 hover:text-[var(--ingco-yellow)] transition-colors">
                Products
              </Link>
              <Link to="/rental" className="text-gray-300 hover:text-[var(--ingco-yellow)] transition-colors">
                Tool Rental
              </Link>
              <Link to="/about" className="text-gray-300 hover:text-[var(--ingco-yellow)] transition-colors">
                About Us
              </Link>
              <Link to="/contact" className="text-gray-300 hover:text-[var(--ingco-yellow)] transition-colors">
                Contact
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl mb-4 text-[var(--ingco-yellow)]">Contact Info</h3>
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 mt-1 flex-shrink-0" />
                <a href="tel:+919361919109" className="text-gray-300 hover:text-[var(--ingco-yellow)]">
                  +91 93619 19109
                </a>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <span className="text-gray-300">
                  60/12, Santhai Road, Shanmugappuram, Palani, Tamil Nadu - 624601
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 mt-1 flex-shrink-0" />
                <span className="text-gray-300">Open Daily - Closes 9 PM</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-xl mb-4 text-[var(--ingco-yellow)]">Our Services</h3>
            <ul className="flex flex-col gap-2 text-sm text-gray-300">
              <li>✓ Power Tools Sales</li>
              <li>✓ Hand Tools</li>
              <li>✓ Construction Equipment</li>
              <li>✓ Tool Rental Service</li>
              <li>✓ Wholesale Pricing</li>
              <li>✓ Expert Support</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-400">
          <p>© 2026 RS Tools World. All rights reserved. | Authorized INGCO Dealer in Palani</p>
        </div>
      </div>
    </footer>
  );
}
