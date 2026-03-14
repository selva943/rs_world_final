import React from 'react';
import { UnifiedCard } from '../components/UnifiedCard';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Plus, LogOut } from 'lucide-react';

export function UnifiedOffersPage() {
  const { offers } = useData();
  const { user, signOut } = useAuth();

  const handleEdit = (offer: any) => {
    // Edit offer logic here
    console.log('Editing offer:', offer.offer_name);
  };

  const handleDelete = (offer: any) => {
    if (confirm(`Are you sure you want to delete "${offer.offer_name}"?`)) {
      // Delete offer logic here
      console.log('Deleting offer:', offer.offer_name);
    }
  };

  const handleToggleStatus = (offer: any) => {
    // Toggle offer status logic here
    console.log('Toggling status for:', offer.offer_name);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please Login</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view offers.</p>
          <Button onClick={() => window.location.href = '/login'}>
            Login
          </Button>
        </div>
      </div>
    );
  }

  // Separate offers by status
  const activeOffers = offers.filter(offer => offer.status);
  const inactiveOffers = offers.filter(offer => !offer.status);
  const expiredOffers = offers.filter(offer => 
    offer.end_date && new Date(offer.end_date) < new Date()
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Special Offers</h1>
          <p className="text-gray-600">Amazing deals on our products</p>
        </div>
        <Button variant="outline" onClick={signOut}>
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>

      {/* Offers Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800">Active Offers</h3>
          <p className="text-2xl font-bold text-green-900">{activeOffers.length}</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800">Inactive Offers</h3>
          <p className="text-2xl font-bold text-gray-900">{inactiveOffers.length}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold text-red-800">Expired Offers</h3>
          <p className="text-2xl font-bold text-red-900">{expiredOffers.length}</p>
        </div>
      </div>

      {/* Active Offers Section */}
      {activeOffers.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Active Offers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {activeOffers.map((offer) => (
              <UnifiedCard
                key={offer.id}
                type="offer"
                data={offer}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        </div>
      )}

      {/* Inactive Offers Section */}
      {inactiveOffers.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Inactive Offers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {inactiveOffers.map((offer) => (
              <UnifiedCard
                key={offer.id}
                type="offer"
                data={offer}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        </div>
      )}

      {/* Expired Offers Section */}
      {expiredOffers.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Expired Offers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {expiredOffers.map((offer) => (
              <UnifiedCard
                key={offer.id}
                type="offer"
                data={offer}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        </div>
      )}

      {offers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No offers available at the moment.</p>
        </div>
      )}
    </div>
  );
}
