import { useState } from 'react';
import { RentalCard } from '../components/RentalCard';
import { OfferCarousel } from '../components/OfferCarousel';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { AlertCircle, Clock, DollarSign, CheckCircle, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { useData } from '../context/DataContext';
import { enquiriesApi } from '../services/api';

export function Rental() {
  const { rentals, offers, loading } = useData();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    tool: '',
    date: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const activeOffers = offers.filter(offer => 
    offer.status === 'active' && 
    (!offer.endDate || new Date(offer.endDate) >= new Date()) &&
    (offer.appliesTo === 'all' || offer.appliesTo === 'rentals')
  ).slice(0, 2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Save enquiry to Supabase database
      const enquiryMessage = `Tool: ${formData.tool}\nDate: ${formData.date}\n${formData.message}`.trim();

      const success = await enquiriesApi.save({
        name: formData.name,
        phone: formData.phone,
        message: enquiryMessage,
        type: 'rental',
      });

      if (success) {
        // Send enquiry via WhatsApp
        const whatsappMessage = `
Tool Rental Enquiry:
Name: ${formData.name}
Phone: ${formData.phone}
Tool: ${formData.tool}
Date: ${formData.date}
Message: ${formData.message}
        `.trim();

        const url = `https://wa.me/919361919109?text=${encodeURIComponent(whatsappMessage)}`;
        window.open(url, '_blank');

        toast.success('Enquiry sent successfully! We will contact you shortly.');

        // Reset form
        setFormData({
          name: '',
          phone: '',
          tool: '',
          date: '',
          message: '',
        });
      } else {
        toast.error('Failed to save enquiry. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting enquiry:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-[var(--ingco-yellow)] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Loading rental tools...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl mb-4">Tool Rental Service</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Rent professional construction equipment at affordable daily and hourly rates
          </p>
        </div>

        {/* Rental Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[var(--ingco-yellow)] flex items-center justify-center">
                <Clock className="w-6 h-6 text-black" />
              </div>
              <h3 className="mb-2">Flexible Duration</h3>
              <p className="text-sm text-muted-foreground">
                Rent by hour or by day based on your project needs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[var(--ingco-yellow)] flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-black" />
              </div>
              <h3 className="mb-2">Affordable Rates</h3>
              <p className="text-sm text-muted-foreground">
                Competitive pricing with refundable deposit system
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[var(--ingco-yellow)] flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-black" />
              </div>
              <h3 className="mb-2">Well Maintained</h3>
              <p className="text-sm text-muted-foreground">
                All tools regularly serviced and in excellent condition
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Rental Offers Carousel */}
        {activeOffers.length > 0 && (
          <OfferCarousel 
            offers={activeOffers}
            title="Rental Special Offers"
            subtitle="Discounted rates on tool rentals and bulk booking deals"
            autoPlay={false}
          />
        )}

        {/* Available Tools */}
        <div className="mb-16">
          <h2 className="text-3xl mb-6">Available Tools for Rent</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rentals.map((tool) => (
              <RentalCard key={tool.id} tool={tool} />
            ))}
          </div>
        </div>

        {/* Rental Terms */}
        <Card className="mb-12 border-l-4 border-l-[var(--ingco-yellow)]">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-[var(--ingco-yellow)] flex-shrink-0 mt-1" />
              <div>
                <h3 className="mb-3">Rental Terms & Conditions</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Valid ID proof required at time of rental</li>
                  <li>• Refundable security deposit to be paid in advance</li>
                  <li>• Tools should be returned in the same condition</li>
                  <li>• Late returns will be charged additional rent</li>
                  <li>• Damage or missing parts will be deducted from deposit</li>
                  <li>• Free pickup and delivery available within Palani city limits</li>
                  <li>• 24-hour rental period starts from time of pickup</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rental Enquiry Form */}
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl mb-6">Rental Enquiry Form</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Your Name *</Label>
                    <Input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="tool">Tool Name *</Label>
                  <Input
                    id="tool"
                    type="text"
                    required
                    value={formData.tool}
                    onChange={(e) => setFormData({ ...formData, tool: e.target.value })}
                    placeholder="Which tool do you need?"
                  />
                </div>

                <div>
                  <Label htmlFor="date">Required Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <Label htmlFor="message">Additional Details</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Duration needed, delivery requirements, etc."
                    rows={4}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[var(--ingco-yellow)] text-black hover:bg-yellow-500"
                >
                  {submitting ? 'Sending...' : 'Send Enquiry via WhatsApp'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}