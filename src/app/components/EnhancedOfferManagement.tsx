import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Calendar,
  Tag,
  Percent,
  Package,
  Layers,
  Gift,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { EnhancedOfferEngine } from '../utils/enhancedOfferEngine';
import { Offer, OfferFormData, OfferValidation } from '../types/enhanced-offer';
import { toast } from 'sonner';

export function EnhancedOfferManagement() {
  const { offers, products, addOffer, updateOffer, deleteOffer } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [formData, setFormData] = useState<OfferFormData>({
    offer_name: '',
    offer_description: '',
    offer_type: 'product',
    discount_type: 'percentage',
    discount_value: 0,
    min_quantity: 1,
    max_discount: undefined,
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    priority: 0,
    status: true,
    banner_image_url: '',
    products: [],
    categories: [],
    combo_products: []
  });

  // Get unique categories from products
  const categories = Array.from(new Set(products.map(p => p.category)));

  // Filter offers by status
  const activeOffers = offers.filter(o => EnhancedOfferEngine.isOfferActive(o));
  const expiredOffers = offers.filter(o => EnhancedOfferEngine.getOfferExpirationStatus(o) === 'expired');
  const inactiveOffers = offers.filter(o => !o.status);

  // Reset form
  const resetForm = () => {
    setFormData({
      offer_name: '',
      offer_description: '',
      offer_type: 'product',
      discount_type: 'percentage',
      discount_value: 0,
      min_quantity: 1,
      max_discount: undefined,
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      priority: 0,
      status: true,
      banner_image_url: '',
      products: [],
      categories: [],
      combo_products: []
    });
    setEditingOffer(null);
  };

  // Validate form
  const validateForm = (): OfferValidation => {
    return EnhancedOfferEngine.validateOffer(formData);
  };

  // Handle form submission
  const handleSubmit = async () => {
    const validation = validateForm();
    
    if (!validation.isValid) {
      validation.errors.forEach(error => toast.error(error));
      return;
    }

    // Show warnings if any
    if (validation.warnings.length > 0) {
      validation.warnings.forEach(warning => toast.warning(warning));
    }

    try {
      if (editingOffer) {
        await updateOffer(editingOffer.id, { ...editingOffer, ...formData });
        toast.success('Offer updated successfully!');
      } else {
        await addOffer(formData);
        toast.success('Offer created successfully!');
      }
      
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('Failed to save offer');
    }
  };

  // Handle edit
  const handleEdit = (offer: Offer) => {
    setFormData({
      offer_name: offer.offer_name,
      offer_description: offer.offer_description || '',
      offer_type: offer.offer_type,
      discount_type: offer.discount_type,
      discount_value: offer.discount_value,
      min_quantity: offer.min_quantity,
      max_discount: offer.max_discount,
      start_date: offer.start_date ? new Date(offer.start_date).toISOString().split('T')[0] : '',
      end_date: offer.end_date ? new Date(offer.end_date).toISOString().split('T')[0] : '',
      priority: offer.priority,
      status: offer.status,
      banner_image_url: offer.banner_image_url || '',
      products: offer.products || [],
      categories: offer.categories || [],
      combo_products: offer.combo_products || []
    });
    setEditingOffer(offer);
    setIsDialogOpen(true);
  };

  // Handle delete
  const handleDelete = async (offer: Offer) => {
    if (confirm(`Are you sure you want to delete "${offer.offer_name}"?`)) {
      await deleteOffer(offer.id);
      toast.success('Offer deleted successfully!');
    }
  };

  // Toggle offer status
  const toggleStatus = async (offer: Offer) => {
    await updateOffer(offer.id, { ...offer, status: !offer.status });
    toast.success(`Offer ${!offer.status ? 'activated' : 'deactivated'} successfully!`);
  };

  // Render offer card
  const renderOfferCard = (offer: Offer) => {
    const expirationStatus = EnhancedOfferEngine.getOfferExpirationStatus(offer);
    const badge = EnhancedOfferEngine.getOfferBadge(offer);
    
    return (
      <Card key={offer.id} className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={`${badge.color} text-white`}>
                  {badge.icon} {badge.text}
                </Badge>
                <Badge variant={expirationStatus === 'active' ? 'default' : 'secondary'}>
                  {expirationStatus}
                </Badge>
              </div>
              <h3 className="font-semibold text-lg mb-1">{offer.offer_name}</h3>
              <p className="text-sm text-gray-600 mb-2">{offer.offer_description}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleEdit(offer)}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => toggleStatus(offer)}>
                {offer.status ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
              <Button variant="destructive" size="sm" onClick={() => handleDelete(offer)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Discount:</span>
              <div className="flex items-center gap-1">
                {offer.discount_type === 'percentage' ? (
                  <><Percent className="w-3 h-3" /> {offer.discount_value}%</>
                ) : (
                  <><Tag className="w-3 h-3" /> ₹{offer.discount_value}</>
                )}
              </div>
            </div>
            <div>
              <span className="font-medium">Type:</span>
              <div className="flex items-center gap-1">
                {offer.offer_type === 'product' && <Package className="w-3 h-3" />}
                {offer.offer_type === 'category' && <Layers className="w-3 h-3" />}
                {offer.offer_type === 'combo' && <Gift className="w-3 h-3" />}
                {offer.offer_type}
              </div>
            </div>
            <div>
              <span className="font-medium">Min Quantity:</span>
              <div>{offer.min_quantity}</div>
            </div>
            <div>
              <span className="font-medium">Priority:</span>
              <div>{offer.priority}</div>
            </div>
          </div>

          {offer.start_date && (
            <div className="mt-3 text-xs text-gray-500 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(offer.start_date).toLocaleDateString()} - 
              {offer.end_date ? new Date(offer.end_date).toLocaleDateString() : 'No end date'}
            </div>
          )}

          {offer.products && offer.products.length > 0 && (
            <div className="mt-3">
              <span className="text-xs font-medium">Products: </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {offer.products.slice(0, 3).map(productId => (
                  <Badge key={productId} variant="outline" className="text-xs">
                    {productId}
                  </Badge>
                ))}
                {offer.products.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{offer.products.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Offer Management</h2>
          <p className="text-gray-600">Create and manage promotional offers</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-blue-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Offer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingOffer ? 'Edit Offer' : 'Create New Offer'}</DialogTitle>
            </DialogHeader>
            
            <div className="grid gap-6 py-4">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="offer_name">Offer Name *</Label>
                    <Input
                      id="offer_name"
                      value={formData.offer_name}
                      onChange={(e) => setFormData({ ...formData, offer_name: e.target.value })}
                      placeholder="Summer Sale 2024"
                    />
                  </div>
                  <div>
                    <Label htmlFor="offer_type">Offer Type *</Label>
                    <Select
                      value={formData.offer_type}
                      onValueChange={(value: any) => setFormData({ ...formData, offer_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="product">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            Product Offer
                          </div>
                        </SelectItem>
                        <SelectItem value="category">
                          <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4" />
                            Category Offer
                          </div>
                        </SelectItem>
                        <SelectItem value="combo">
                          <div className="flex items-center gap-2">
                            <Gift className="w-4 h-4" />
                            Combo Deal
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="offer_description">Description</Label>
                  <Textarea
                    id="offer_description"
                    value={formData.offer_description}
                    onChange={(e) => setFormData({ ...formData, offer_description: e.target.value })}
                    placeholder="Describe your offer..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Discount Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Discount Configuration</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="discount_type">Discount Type *</Label>
                    <Select
                      value={formData.discount_type}
                      onValueChange={(value: any) => setFormData({ ...formData, discount_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">
                          <div className="flex items-center gap-2">
                            <Percent className="w-4 h-4" />
                            Percentage
                          </div>
                        </SelectItem>
                        <SelectItem value="fixed">
                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4" />
                            Fixed Amount
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="discount_value">Discount Value *</Label>
                    <Input
                      id="discount_value"
                      type="number"
                      value={formData.discount_value}
                      onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) || 0 })}
                      placeholder={formData.discount_type === 'percentage' ? '15' : '500'}
                    />
                  </div>
                  <div>
                    <Label htmlFor="max_discount">Max Discount (Optional)</Label>
                    <Input
                      id="max_discount"
                      type="number"
                      value={formData.max_discount || ''}
                      onChange={(e) => setFormData({ ...formData, max_discount: e.target.value ? parseFloat(e.target.value) : undefined })}
                      placeholder="1000"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="min_quantity">Minimum Quantity</Label>
                    <Input
                      id="min_quantity"
                      type="number"
                      value={formData.min_quantity}
                      onChange={(e) => setFormData({ ...formData, min_quantity: parseInt(e.target.value) || 1 })}
                      placeholder="1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Input
                      id="priority"
                      type="number"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {/* Date Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Schedule</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_date">End Date (Optional)</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Target Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Target Configuration</h3>
                
                {formData.offer_type === 'product' && (
                  <div>
                    <Label>Applicable Products</Label>
                    <div className="mt-2 p-4 border rounded-lg bg-gray-50">
                      <p className="text-sm text-gray-600">
                        Product selection will be implemented here. For now, all products will be applicable.
                      </p>
                    </div>
                  </div>
                )}
                
                {formData.offer_type === 'category' && (
                  <div>
                    <Label>Applicable Categories</Label>
                    <div className="mt-2 space-y-2">
                      {categories.map(category => (
                        <div key={category} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`category-${category}`}
                            checked={formData.categories.includes(category)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({ ...formData, categories: [...formData.categories, category] });
                              } else {
                                setFormData({ ...formData, categories: formData.categories.filter(c => c !== category) });
                              }
                            }}
                          />
                          <Label htmlFor={`category-${category}`}>{category}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {formData.offer_type === 'combo' && (
                  <div>
                    <Label>Combo Products</Label>
                    <div className="mt-2 p-4 border rounded-lg bg-gray-50">
                      <p className="text-sm text-gray-600">
                        Combo product selection will be implemented here. For now, all products will be applicable.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Additional Settings</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="banner_image_url">Banner Image URL</Label>
                    <Input
                      id="banner_image_url"
                      value={formData.banner_image_url}
                      onChange={(e) => setFormData({ ...formData, banner_image_url: e.target.value })}
                      placeholder="https://example.com/banner.jpg"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="status"
                      checked={formData.status}
                      onCheckedChange={(checked) => setFormData({ ...formData, status: checked })}
                    />
                    <Label htmlFor="status">Active</Label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingOffer ? 'Update Offer' : 'Create Offer'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Active Offers</p>
                <p className="text-2xl font-bold">{activeOffers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Expired Offers</p>
                <p className="text-2xl font-bold">{expiredOffers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <EyeOff className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Inactive Offers</p>
                <p className="text-2xl font-bold">{inactiveOffers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Offers</p>
                <p className="text-2xl font-bold">{offers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Offers List */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">Active ({activeOffers.length})</TabsTrigger>
          <TabsTrigger value="expired">Expired ({expiredOffers.length})</TabsTrigger>
          <TabsTrigger value="inactive">Inactive ({inactiveOffers.length})</TabsTrigger>
          <TabsTrigger value="all">All ({offers.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="space-y-4">
          {activeOffers.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">No Active Offers</h3>
                <p className="text-gray-600 mb-4">Create your first offer to get started</p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Offer
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {activeOffers.map(renderOfferCard)}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="expired" className="space-y-4">
          {expiredOffers.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">No Expired Offers</h3>
                <p className="text-gray-600">Your offers are all active!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {expiredOffers.map(renderOfferCard)}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="inactive" className="space-y-4">
          {inactiveOffers.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <EyeOff className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">No Inactive Offers</h3>
                <p className="text-gray-600">All offers are currently active!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {inactiveOffers.map(renderOfferCard)}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4">
            {offers.map(renderOfferCard)}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
