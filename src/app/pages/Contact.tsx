import { useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { MapPin, Phone, Clock, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { enquiriesApi } from '../services/api';

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Save enquiry to Supabase database
      const success = await enquiriesApi.save({
        name: formData.name,
        phone: formData.phone,
        message: formData.message,
        type: 'general',
      });

      if (success) {
        // Send message via WhatsApp
        const whatsappMessage = `
Contact Form Enquiry:
Name: ${formData.name}
Phone: ${formData.phone}
Message: ${formData.message}
        `.trim();

        const url = `https://wa.me/919361919109?text=${encodeURIComponent(whatsappMessage)}`;
        window.open(url, '_blank');

        toast.success('Message sent successfully! We will contact you shortly.');

        // Reset form
        setFormData({
          name: '',
          phone: '',
          message: '',
        });
      } else {
        toast.error('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl mb-4">Contact Us</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get in touch with us for any queries, wholesale pricing, or tool rental bookings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Contact Information */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl mb-6">Get In Touch</h2>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 flex-shrink-0 rounded-full bg-[var(--ingco-yellow)] flex items-center justify-center">
                      <Phone className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h3 className="mb-1">Call or WhatsApp</h3>
                      <a
                        href="tel:+919361919109"
                        className="text-lg text-[var(--ingco-yellow)] hover:underline"
                      >
                        +91 93619 19109
                      </a>
                      <p className="text-sm text-muted-foreground mt-1">
                        Available for calls and WhatsApp messages
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 flex-shrink-0 rounded-full bg-[var(--ingco-yellow)] flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h3 className="mb-1">Visit Our Store</h3>
                      <p className="text-muted-foreground">
                        60/12, Santhai Road, Shanmugappuram,<br />
                        Palani, Tamil Nadu - 624601
                      </p>
                      <a
                        href="https://maps.google.com/?q=10.45,77.52"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[var(--ingco-yellow)] hover:underline inline-block mt-1"
                      >
                        Get Directions →
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 flex-shrink-0 rounded-full bg-[var(--ingco-yellow)] flex items-center justify-center">
                      <Clock className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h3 className="mb-1">Business Hours</h3>
                      <p className="text-muted-foreground">
                        Open Daily<br />
                        Closes at 9:00 PM
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-8 pt-6 border-t space-y-3">
                  <a
                    href="https://wa.me/919361919109"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Chat on WhatsApp
                    </Button>
                  </a>
                  <a href="tel:+919361919109" className="block">
                    <Button variant="outline" className="w-full">
                      <Phone className="w-5 h-5 mr-2" />
                      Call Now
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Additional Info */}
            <Card className="bg-gradient-to-br from-[var(--ingco-black)] to-[var(--ingco-dark-grey)] text-white">
              <CardContent className="p-6">
                <h3 className="text-xl mb-4 text-[var(--ingco-yellow)]">Why Contact Us?</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--ingco-yellow)] mt-1">✓</span>
                    <span>Get wholesale pricing for bulk orders</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--ingco-yellow)] mt-1">✓</span>
                    <span>Check product availability and stock</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--ingco-yellow)] mt-1">✓</span>
                    <span>Book tools for rental in advance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--ingco-yellow)] mt-1">✓</span>
                    <span>Get expert advice on tool selection</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--ingco-yellow)] mt-1">✓</span>
                    <span>Warranty and after-sales support</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div>
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl mb-6">Send Us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
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

                  <div>
                    <Label htmlFor="message">Your Message *</Label>
                    <Textarea
                      id="message"
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us about your requirements..."
                      rows={6}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[var(--ingco-yellow)] text-black hover:bg-yellow-500"
                  >
                    {submitting ? 'Sending...' : 'Send Message via WhatsApp'}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    By submitting this form, you agree to be contacted via WhatsApp
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-16">
          <h2 className="text-3xl text-center mb-8">Find Us on Map</h2>
          <div className="aspect-video w-full max-w-5xl mx-auto rounded-lg overflow-hidden shadow-lg">
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
      </div>
    </div>
  );
}
