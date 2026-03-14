import { Link, useLocation } from 'react-router';
import { Phone, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';

export function Header() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/products', label: 'Products' },
    { path: '/rental', label: 'Tool Rental' },
    { path: '/offers', label: 'Offers' },
    { path: '/about', label: 'About Us' },
    { path: '/contact', label: 'Contact' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 bg-[var(--ingco-black)] text-white shadow-lg">
      {/* Top Bar */}
      <div className="bg-[var(--ingco-yellow)] text-black py-2">
        <div className="container mx-auto px-4 flex flex-wrap justify-between items-center gap-2 text-sm">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1">
              <Phone className="w-4 h-4" />
              <a href="tel:+919361919109" className="hover:underline">
                +91 93619 19109
              </a>
            </span>
            <span className="hidden sm:inline">Open Daily - Closes 9 PM</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-yellow-900">⭐ 4.8 Google Rating</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex flex-col">
            <span className="text-2xl font-bold tracking-tight text-[var(--ingco-yellow)]">
              RS TOOLS WORLD
            </span>
            <span className="text-xs text-gray-300">Authorized INGCO Dealer</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`transition-colors ${
                  isActive(link.path)
                    ? 'text-[var(--ingco-yellow)]'
                    : 'text-white hover:text-[var(--ingco-yellow)]'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <a
              href="https://wa.me/919361919109"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="bg-[var(--ingco-yellow)] text-black hover:bg-yellow-500">
                WhatsApp Us
              </Button>
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="lg:hidden mt-4 pb-4 flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`py-2 transition-colors ${
                  isActive(link.path)
                    ? 'text-[var(--ingco-yellow)]'
                    : 'text-white hover:text-[var(--ingco-yellow)]'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <a
              href="https://wa.me/919361919109"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2"
            >
              <Button className="w-full bg-[var(--ingco-yellow)] text-black hover:bg-yellow-500">
                WhatsApp Us
              </Button>
            </a>
          </nav>
        )}
      </div>
    </header>
  );
}
