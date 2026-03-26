import React, { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { MapPin, Navigation, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';

declare const L: any;

interface MapPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (lat: number, lng: number, address: string) => void;
  initialLat?: number;
  initialLng?: number;
}

export const MapPicker: React.FC<MapPickerProps> = ({ 
  isOpen, 
  onClose, 
  onSelect,
  initialLat = 11.0168, // Default to Coimbatore region if not provided
  initialLng = 76.9558
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPos, setSelectedPos] = useState({ lat: initialLat, lng: initialLng });
  const [address, setAddress] = useState('');

  const reverseGeocode = async (lat: number, lng: number) => {
    setLoading(true);
    try {
      const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const data = await resp.json();
      if (data && data.display_name) {
        setAddress(data.display_name);
      }
    } catch (err) {
      console.error('Geocoding error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        setSelectedPos({ lat: latitude, lng: longitude });
        if (mapRef.current) {
          mapRef.current.setView([latitude, longitude], 16);
          markerRef.current.setLatLng([latitude, longitude]);
        }
        reverseGeocode(latitude, longitude);
      }, (err) => {
        console.error('Geolocation error:', err);
      });
    }
  };

  useEffect(() => {
    if (isOpen && mapContainerRef.current && !mapRef.current) {
      // Initialize map
      setTimeout(() => {
        mapRef.current = L.map(mapContainerRef.current!).setView([initialLat, initialLng], 13);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(mapRef.current);

        markerRef.current = L.marker([initialLat, initialLng], { draggable: true }).addTo(mapRef.current);

        markerRef.current.on('dragend', (e: any) => {
          const { lat, lng } = e.target.getLatLng();
          setSelectedPos({ lat, lng });
          reverseGeocode(lat, lng);
        });

        // Initialize with first check
        reverseGeocode(initialLat, initialLng);
      }, 100);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [isOpen]);

  const handleConfirm = () => {
    onSelect(selectedPos.lat, selectedPos.lng, address);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl sm:max-h-[85vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" /> Select Delivery Location
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 relative min-h-[400px]">
          <div ref={mapContainerRef} className="absolute inset-0 z-10" />
          
          <Button 
            className="absolute bottom-6 right-6 z-[1000] shadow-xl rounded-full h-12 w-12 p-0 bg-white hover:bg-slate-50 text-primary border border-slate-200"
            onClick={handleGetCurrentLocation}
            title="Use current location"
          >
            <Navigation className="w-5 h-5" />
          </Button>

          {loading && (
            <div className="absolute top-4 left-4 z-[1000] bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-medium border border-slate-200 shadow-sm animate-pulse">
              Fetching address...
            </div>
          )}
        </div>

        <DialogFooter className="p-4 bg-slate-50 flex-col sm:flex-row gap-3 items-stretch">
          <div className="flex-1">
            <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Detected Address</div>
            <p className="text-xs text-slate-600 line-clamp-2 italic">
              {address || 'Move the pin to select...'}
            </p>
          </div>
          <Button className="rounded-xl h-11 px-8" onClick={handleConfirm} disabled={!address}>
             <Check className="w-4 h-4 mr-2" /> Confirm Location
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
