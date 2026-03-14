import { RentalTool } from '../types';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter } from './ui/card';
import { MessageCircle, Clock, DollarSign } from 'lucide-react';

interface RentalCardProps {
  tool: RentalTool;
}

export function RentalCard({ tool }: RentalCardProps) {
  const handleWhatsApp = () => {
    const message = `Hi, I want to rent ${tool.name} (₹${tool.rentPerDay}/day). Is it available?`;
    const url = `https://wa.me/919361919109?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={tool.image}
          alt={tool.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        {tool.brand === 'INGCO' && (
          <Badge className="absolute top-2 left-2 bg-[var(--ingco-yellow)] text-black hover:bg-yellow-500">
            INGCO
          </Badge>
        )}
        {tool.available ? (
          <Badge className="absolute top-2 right-2 bg-green-600">Available</Badge>
        ) : (
          <Badge variant="destructive" className="absolute top-2 right-2">
            Rented Out
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        <h3 className="mb-2 line-clamp-2 min-h-[3rem]">{tool.name}</h3>
        {tool.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{tool.description}</p>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Per Day</span>
            </div>
            <span className="text-xl text-[var(--ingco-yellow)]">₹{tool.rentPerDay}</span>
          </div>

          {tool.rentPerHour && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Per Hour</span>
              </div>
              <span className="text-lg">₹{tool.rentPerHour}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="w-4 h-4" />
              <span>Deposit</span>
            </div>
            <span className="text-lg">₹{tool.deposit}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          onClick={handleWhatsApp}
          className="w-full bg-[var(--ingco-yellow)] text-black hover:bg-yellow-500"
          disabled={!tool.available}
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          {tool.available ? 'Book Now' : 'Currently Unavailable'}
        </Button>
      </CardFooter>
    </Card>
  );
}
