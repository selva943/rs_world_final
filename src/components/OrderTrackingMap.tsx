import React, { useEffect, useRef } from 'react';
import { MapPin, Navigation } from 'lucide-react';

declare const L: any;

interface OrderTrackingMapProps {
  lat: number;
  lng: number;
  agentLat?: number;
  agentLng?: number;
  onRefresh?: () => void;
}

export const OrderTrackingMap: React.FC<OrderTrackingMapProps> = ({ 
  lat, 
  lng, 
  agentLat, 
  agentLng 
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const orderMarkerRef = useRef<any>(null);
  const agentMarkerRef = useRef<any>(null);

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      setTimeout(() => {
        mapRef.current = L.map(mapContainerRef.current!).setView([lat, lng], 15);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OSM'
        }).addTo(mapRef.current);

        // Order Location Marker (Red/Primary)
        orderMarkerRef.current = L.marker([lat, lng]).addTo(mapRef.current)
          .bindPopup('Your Delivery Location')
          .openPopup();

        // Agent Location Marker (Blue/Secondary) if available
        if (agentLat && agentLng) {
          agentMarkerRef.current = L.marker([agentLat, agentLng], {
            icon: L.icon({
              iconUrl: 'https://cdn-icons-png.flaticon.com/512/3222/3222712.png', // Delivery bike icon
              iconSize: [32, 32],
              iconAnchor: [16, 32]
            })
          }).addTo(mapRef.current).bindPopup('Delivery Agent');
          
          // Fit boundaries to show both
          const bounds = L.latLngBounds([lat, lng], [agentLat, agentLng]);
          mapRef.current.fitBounds(bounds, { padding: [50, 50] });
        }
      }, 100);
    }

    // Update agent marker if it changes
    if (mapRef.current && agentMarkerRef.current && agentLat && agentLng) {
       agentMarkerRef.current.setLatLng([agentLat, agentLng]);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [lat, lng, agentLat, agentLng]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-2">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
          <Navigation className="w-3 h-3 text-primary animate-pulse" /> Live Tracking
        </h4>
        <div className="flex items-center gap-2">
           <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
           <span className="text-[10px] font-bold text-slate-500 tracking-tight">Active</span>
        </div>
      </div>
      <div className="w-full h-48 rounded-2xl overflow-hidden border border-slate-100 shadow-inner relative z-10">
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>
      <div className="flex items-center gap-3 px-2">
        <div className="p-1.5 bg-blue-50 rounded-lg">
          <Navigation className="w-3.5 h-3.5 text-blue-500" />
        </div>
        <p className="text-[10px] text-slate-500 font-medium leading-tight">
          Delivery agent is on the way. You can track their approximate location here.
        </p>
      </div>
    </div>
  );
};
