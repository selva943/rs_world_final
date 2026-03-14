import React from 'react';
import { UnifiedCard } from '../components/UnifiedCard';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Plus, LogOut } from 'lucide-react';

export function UnifiedProductsPage() {
  const { products, offers } = useData();
  const { user, signOut } = useAuth();

  const handleAddToCart = (product: any) => {
    // Add to cart logic here
    console.log('Added to cart:', product.name);
  };

  const handleWhatsApp = (product: any, message: string) => {
    const url = `https://wa.me/919361919109?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please Login</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view products.</p>
          <Button onClick={() => window.location.href = '/login'}>
            Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Our Products</h1>
          <p className="text-gray-600">High-quality tools and equipment</p>
        </div>
        <Button variant="outline" onClick={signOut}>
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>

      {/* Products Grid - Unified Size */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <UnifiedCard
            key={product.id}
            type="product"
            data={product}
            allOffers={offers}
            onAddToCart={handleAddToCart}
            onWhatsApp={handleWhatsApp}
          />
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No products available at the moment.</p>
        </div>
      )}
    </div>
  );
}
