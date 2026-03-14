import { useState } from 'react';
import { Product, RentalTool, Offer } from '../types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Pencil, Trash2, Plus, CheckCircle, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

export function Admin() {
  const { user, loading: authLoading, signIn, signOut } = useAuth();
  const { products, rentals, offers, loading, addProduct, updateProduct, deleteProduct, addRental, updateRental, deleteRental, addOffer, updateOffer, deleteOffer } = useData();
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isRentalDialogOpen, setIsRentalDialogOpen] = useState(false);
  const [isOfferDialogOpen, setIsOfferDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingRental, setEditingRental] = useState<RentalTool | null>(null);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Product Form
  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '',
    brand: 'INGCO',
    category: 'Power Tools',
    price: 0,
    wholesalePrice: 0,
    image: '',
    stock: 0,
    inStock: true,
    description: '',
  });

  // Rental Form
  const [rentalForm, setRentalForm] = useState<Partial<RentalTool>>({
    name: '',
    brand: 'INGCO',
    image: '',
    rentPerDay: 0,
    rentPerHour: 0,
    deposit: 0,
    available: true,
    description: '',
  });

  // Offer Form
  const [offerForm, setOfferForm] = useState<Partial<Offer>>({
    offer_name: '',
    offer_description: '',
    offer_type: 'product',
    discount_type: 'percentage',
    discount_value: 0,
    min_quantity: 1,
    max_discount: undefined,
    start_date: new Date().toISOString(),
    end_date: '',
    priority: 0,
    status: 'active',
    banner_image_url: '',
    products: [],
    categories: [],
    combo_products: [],
  });

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast.error('Login failed: ' + error.message);
    } else {
      toast.success('Logged in successfully!');
      setEmail('');
      setPassword('');
    }

    setIsLoggingIn(false);
  };

  // Handle logout
  const handleLogout = async () => {
    await signOut();
    toast.success('Logged out successfully!');
  };

  // Show loading state
  if (authLoading) {
    return (
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!user) {
    return (
      <div className="py-12">
        <div className="container mx-auto px-4 max-w-md">
          <Card>
            <CardContent className="p-6">
              <h1 className="text-3xl font-bold mb-2">Admin Login</h1>
              <p className="text-muted-foreground mb-6">
                Sign in to access the admin dashboard
              </p>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[var(--ingco-yellow)] text-black hover:bg-yellow-500"
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Product CRUD
  const handleAddProduct = () => {
    const newProduct: Product = {
      id: Date.now().toString(),
      name: productForm.name || '',
      brand: productForm.brand || 'INGCO',
      category: productForm.category || 'Power Tools',
      price: productForm.price || 0,
      wholesalePrice: productForm.wholesalePrice,
      image: productForm.image || 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500&h=500&fit=crop',
      stock: productForm.stock || 0,
      inStock: productForm.inStock ?? true,
      description: productForm.description,
    };
    addProduct(newProduct);
    toast.success('Product added successfully!');
    resetProductForm();
  };

  const handleUpdateProduct = () => {
    if (!editingProduct) return;
    updateProduct(editingProduct.id, { ...editingProduct, ...productForm });
    toast.success('Product updated successfully!');
    resetProductForm();
  };

  const handleDeleteProduct = (id: string) => {
    deleteProduct(id);
    toast.success('Product deleted successfully!');
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      brand: 'INGCO',
      category: 'Power Tools',
      price: 0,
      wholesalePrice: 0,
      image: '',
      stock: 0,
      inStock: true,
      description: '',
    });
    setEditingProduct(null);
    setIsProductDialogOpen(false);
  };

  // Rental CRUD
  const handleAddRental = () => {
    const newRental: RentalTool = {
      id: `r${Date.now()}`,
      name: rentalForm.name || '',
      brand: rentalForm.brand || 'INGCO',
      image: rentalForm.image || 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500&h=500&fit=crop',
      rentPerDay: rentalForm.rentPerDay || 0,
      rentPerHour: rentalForm.rentPerHour,
      deposit: rentalForm.deposit || 0,
      available: rentalForm.available ?? true,
      description: rentalForm.description,
    };
    addRental(newRental);
    toast.success('Rental tool added successfully!');
    resetRentalForm();
  };

  const handleUpdateRental = () => {
    if (!editingRental) return;
    updateRental(editingRental.id, { ...editingRental, ...rentalForm });
    toast.success('Rental tool updated successfully!');
    resetRentalForm();
  };

  const handleDeleteRental = (id: string) => {
    deleteRental(id);
    toast.success('Rental tool deleted successfully!');
  };

  const resetRentalForm = () => {
    setRentalForm({
      name: '',
      brand: 'INGCO',
      image: '',
      rentPerDay: 0,
      rentPerHour: 0,
      deposit: 0,
      available: true,
      description: '',
    });
    setEditingRental(null);
    setIsRentalDialogOpen(false);
  };

  // Offer CRUD
  const handleAddOffer = async () => {
    console.log('🔧 Starting offer creation...');
    console.log('📝 Form data:', offerForm);
    
    // Validate required fields
    if (!offerForm.offer_name || !offerForm.offer_type || !offerForm.discount_type) {
      console.error('❌ Missing required fields');
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (!offerForm.discount_value || offerForm.discount_value <= 0) {
      console.error('❌ Invalid discount value');
      toast.error('Please enter a valid discount value');
      return;
    }
    
    try {
      const newOffer: Omit<Offer, 'id' | 'created_at'> = {
        offer_name: offerForm.offer_name || '',
        offer_description: offerForm.offer_description || null,
        offer_type: offerForm.offer_type as Offer['offer_type'] || 'product',
        discount_type: offerForm.discount_type as Offer['discount_type'] || 'percentage',
        discount_value: offerForm.discount_value || 0,
        min_quantity: offerForm.min_quantity || 1,
        max_discount: offerForm.max_discount || null,
        start_date: offerForm.start_date || new Date().toISOString(),
        end_date: offerForm.end_date || null,
        priority: offerForm.priority || 0,
        status: offerForm.status as Offer['status'] || 'active',
        banner_image_url: offerForm.banner_image_url || null,
        updated_at: new Date().toISOString(),
        products: offerForm.products || [],
        categories: offerForm.categories || [],
        combo_products: offerForm.combo_products || [],
      };
      
      console.log('📋 Prepared offer data:', newOffer);
      
      await addOffer(newOffer);
      toast.success('Offer added successfully!');
      resetOfferForm();
      setIsOfferDialogOpen(false);
      
      console.log('✅ Offer created successfully');
    } catch (error) {
      console.error('❌ Error creating offer:', error);
      toast.error('Failed to create offer. Please try again.');
    }
  };

  const handleUpdateOffer = () => {
    if (!editingOffer) return;
    updateOffer(editingOffer.id, { ...editingOffer, ...offerForm });
    toast.success('Offer updated successfully!');
    resetOfferForm();
  };

  const handleDeleteOffer = (id: string) => {
    deleteOffer(id);
    toast.success('Offer deleted successfully!');
  };

  const resetOfferForm = () => {
    setOfferForm({
      offer_name: '',
      offer_description: '',
      offer_type: 'product',
      discount_type: 'percentage',
      discount_value: 0,
      min_quantity: 1,
      max_discount: undefined,
      start_date: new Date().toISOString(),
      end_date: '',
      priority: 0,
      status: 'active',
      banner_image_url: '',
      products: [],
      categories: [],
      combo_products: [],
    });
    setEditingOffer(null);
    setIsOfferDialogOpen(false);
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm(product);
    setIsProductDialogOpen(true);
  };

  const openEditRental = (rental: RentalTool) => {
    setEditingRental(rental);
    setRentalForm(rental);
    setIsRentalDialogOpen(true);
  };

  const openEditOffer = (offer: Offer) => {
    setEditingOffer(offer);
    setOfferForm(offer);
    setIsOfferDialogOpen(true);
  };

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your products and rental inventory</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>

        {/* Warning */}
        <Card className="mb-8 border-l-4 border-l-green-500">
          <CardContent className="p-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium mb-1">Supabase Connected</p>
              <p className="text-muted-foreground">
                Changes are now saved to the database and persist across sessions. All product and rental updates are automatically synchronized.
              </p>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full max-w-lg grid-cols-3">
            <TabsTrigger value="products">Products ({products.length})</TabsTrigger>
            <TabsTrigger value="rentals">Rental Tools ({rentals.length})</TabsTrigger>
            <TabsTrigger value="offers">Offers ({offers.length})</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl">Manage Products</h2>
              <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => {
                      resetProductForm();
                      setIsProductDialogOpen(true);
                    }}
                    className="bg-[var(--ingco-yellow)] text-black hover:bg-yellow-500"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingProduct ? 'Edit Product' : 'Add New Product'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="p-name">Product Name *</Label>
                        <Input
                          id="p-name"
                          value={productForm.name}
                          onChange={(e) =>
                            setProductForm({ ...productForm, name: e.target.value })
                          }
                          placeholder="INGCO Angle Grinder"
                        />
                      </div>
                      <div>
                        <Label htmlFor="p-brand">Brand</Label>
                        <Input
                          id="p-brand"
                          value={productForm.brand}
                          onChange={(e) =>
                            setProductForm({ ...productForm, brand: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="p-category">Category</Label>
                        <select
                          id="p-category"
                          value={productForm.category}
                          onChange={(e) =>
                            setProductForm({ ...productForm, category: e.target.value })
                          }
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="Power Tools">Power Tools</option>
                          <option value="Hand Tools">Hand Tools</option>
                          <option value="Construction Tools">Construction Tools</option>
                          <option value="Electrical Tools">Electrical Tools</option>
                          <option value="Hardware & Accessories">Hardware & Accessories</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="p-stock">Stock</Label>
                        <Input
                          id="p-stock"
                          type="number"
                          min="0"
                          step="1"
                          value={productForm.stock || ''}
                          onChange={(e) =>
                            setProductForm({ ...productForm, stock: e.target.value ? Number(e.target.value) : 0 })
                          }
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="p-price">Retail Price (₹)</Label>
                        <Input
                          id="p-price"
                          type="number"
                          min="0"
                          step="0.01"
                          value={productForm.price || ''}
                          onChange={(e) =>
                            setProductForm({ ...productForm, price: e.target.value ? Number(e.target.value) : 0 })
                          }
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label htmlFor="p-wprice">Wholesale Price (₹)</Label>
                        <Input
                          id="p-wprice"
                          type="number"
                          min="0"
                          step="0.01"
                          value={productForm.wholesalePrice || ''}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              wholesalePrice: e.target.value ? Number(e.target.value) : 0,
                            })
                          }
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="p-image">Image URL</Label>
                      <Input
                        id="p-image"
                        value={productForm.image}
                        onChange={(e) =>
                          setProductForm({ ...productForm, image: e.target.value })
                        }
                        placeholder="https://..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="p-desc">Description</Label>
                      <Input
                        id="p-desc"
                        value={productForm.description}
                        onChange={(e) =>
                          setProductForm({ ...productForm, description: e.target.value })
                        }
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="p-instock"
                        checked={productForm.inStock}
                        onChange={(e) =>
                          setProductForm({ ...productForm, inStock: e.target.checked })
                        }
                        className="w-4 h-4"
                      />
                      <Label htmlFor="p-instock">In Stock</Label>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={editingProduct ? handleUpdateProduct : handleAddProduct}
                        className="flex-1 bg-[var(--ingco-yellow)] text-black hover:bg-yellow-500"
                      >
                        {editingProduct ? 'Update' : 'Add'} Product
                      </Button>
                      <Button onClick={resetProductForm} variant="outline">
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {products.map((product) => (
                <Card key={product.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="mb-1">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {product.brand} • {product.category} • Stock: {product.stock}
                        </p>
                        <p className="text-sm mt-1">
                          ₹{product.price} {product.wholesalePrice && `/ ₹${product.wholesalePrice} (Wholesale)`}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditProduct(product)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Rentals Tab */}
          <TabsContent value="rentals" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl">Manage Rental Tools</h2>
              <Dialog open={isRentalDialogOpen} onOpenChange={setIsRentalDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => {
                      resetRentalForm();
                      setIsRentalDialogOpen(true);
                    }}
                    className="bg-[var(--ingco-yellow)] text-black hover:bg-yellow-500"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Rental Tool
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingRental ? 'Edit Rental Tool' : 'Add New Rental Tool'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="r-name">Tool Name *</Label>
                        <Input
                          id="r-name"
                          value={rentalForm.name}
                          onChange={(e) =>
                            setRentalForm({ ...rentalForm, name: e.target.value })
                          }
                          placeholder="INGCO Demolition Hammer"
                        />
                      </div>
                      <div>
                        <Label htmlFor="r-brand">Brand</Label>
                        <Input
                          id="r-brand"
                          value={rentalForm.brand}
                          onChange={(e) =>
                            setRentalForm({ ...rentalForm, brand: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="r-day">Rent/Day (₹)</Label>
                        <Input
                          id="r-day"
                          type="number"
                          min="0"
                          step="0.01"
                          value={rentalForm.rentPerDay || ''}
                          onChange={(e) =>
                            setRentalForm({
                              ...rentalForm,
                              rentPerDay: e.target.value ? Number(e.target.value) : 0,
                            })
                          }
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label htmlFor="r-hour">Rent/Hour (₹)</Label>
                        <Input
                          id="r-hour"
                          type="number"
                          min="0"
                          step="0.01"
                          value={rentalForm.rentPerHour || ''}
                          onChange={(e) =>
                            setRentalForm({
                              ...rentalForm,
                              rentPerHour: e.target.value ? Number(e.target.value) : 0,
                            })
                          }
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label htmlFor="r-deposit">Deposit (₹)</Label>
                        <Input
                          id="r-deposit"
                          type="number"
                          value={rentalForm.deposit}
                          onChange={(e) =>
                            setRentalForm({ ...rentalForm, deposit: Number(e.target.value) })
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="r-image">Image URL</Label>
                      <Input
                        id="r-image"
                        value={rentalForm.image}
                        onChange={(e) =>
                          setRentalForm({ ...rentalForm, image: e.target.value })
                        }
                        placeholder="https://..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="r-desc">Description</Label>
                      <Input
                        id="r-desc"
                        value={rentalForm.description}
                        onChange={(e) =>
                          setRentalForm({ ...rentalForm, description: e.target.value })
                        }
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="r-available"
                        checked={rentalForm.available}
                        onChange={(e) =>
                          setRentalForm({ ...rentalForm, available: e.target.checked })
                        }
                        className="w-4 h-4"
                      />
                      <Label htmlFor="r-available">Available for Rent</Label>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={editingRental ? handleUpdateRental : handleAddRental}
                        className="flex-1 bg-[var(--ingco-yellow)] text-black hover:bg-yellow-500"
                      >
                        {editingRental ? 'Update' : 'Add'} Rental Tool
                      </Button>
                      <Button onClick={resetRentalForm} variant="outline">
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {rentals.map((tool) => (
                <Card key={tool.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={tool.image}
                        alt={tool.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="mb-1">{tool.name}</h3>
                        <p className="text-sm text-muted-foreground">{tool.brand}</p>
                        <p className="text-sm mt-1">
                          ₹{tool.rentPerDay}/day
                          {tool.rentPerHour && ` • ₹${tool.rentPerHour}/hour`} • Deposit: ₹
                          {tool.deposit}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditRental(tool)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteRental(tool.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Offers Tab */}
          <TabsContent value="offers" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl">Manage Offers</h2>
              <Dialog open={isOfferDialogOpen} onOpenChange={setIsOfferDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => {
                      resetOfferForm();
                      setIsOfferDialogOpen(true);
                    }}
                    className="bg-[var(--ingco-yellow)] text-black hover:bg-yellow-500"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Offer
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingOffer ? 'Edit Offer' : 'Add New Offer'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="o-name">Offer Name</Label>
                        <Input
                          id="o-name"
                          value={offerForm.offer_name}
                          onChange={(e) => setOfferForm({ ...offerForm, offer_name: e.target.value })}
                          placeholder="Special Offer"
                        />
                      </div>
                      <div>
                        <Label htmlFor="o-type">Offer Type</Label>
                        <Select
                          value={offerForm.offer_type}
                          onValueChange={(value) => setOfferForm({ ...offerForm, offer_type: value as Offer['offer_type'] })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="product">Product Offer</SelectItem>
                            <SelectItem value="category">Category Offer</SelectItem>
                            <SelectItem value="combo">Combo Deal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="o-description">Offer Description</Label>
                      <Input
                        id="o-description"
                        value={offerForm.offer_description}
                        onChange={(e) => setOfferForm({ ...offerForm, offer_description: e.target.value })}
                        placeholder="Special discount on selected items"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="o-discount-type">Discount Type</Label>
                        <Select
                          value={offerForm.discount_type}
                          onValueChange={(value) => setOfferForm({ ...offerForm, discount_type: value as Offer['discount_type'] })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select discount type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">Percentage (%)</SelectItem>
                            <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="o-discount-value">
                          Discount Value ({offerForm.discount_type === 'percentage' ? '%' : '₹'})
                        </Label>
                        <Input
                          id="o-discount-value"
                          type="number"
                          value={offerForm.discount_value}
                          onChange={(e) => setOfferForm({ ...offerForm, discount_value: Number(e.target.value) })}
                          placeholder={offerForm.discount_type === 'percentage' ? '10' : '500'}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="o-min-quantity">Minimum Quantity</Label>
                        <Input
                          id="o-min-quantity"
                          type="number"
                          value={offerForm.min_quantity}
                          onChange={(e) => setOfferForm({ ...offerForm, min_quantity: Number(e.target.value) })}
                          placeholder="1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="o-max-discount">Maximum Discount (₹)</Label>
                        <Input
                          id="o-max-discount"
                          type="number"
                          value={offerForm.max_discount || ''}
                          onChange={(e) => setOfferForm({ ...offerForm, max_discount: e.target.value ? Number(e.target.value) : undefined })}
                          placeholder="Optional max discount"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="o-start-date">Start Date</Label>
                        <Input
                          id="o-start-date"
                          type="datetime-local"
                          value={offerForm.start_date?.slice(0, 16)}
                          onChange={(e) => setOfferForm({ ...offerForm, start_date: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="o-end-date">End Date</Label>
                        <Input
                          id="o-end-date"
                          type="datetime-local"
                          value={offerForm.end_date?.slice(0, 16)}
                          onChange={(e) => setOfferForm({ ...offerForm, end_date: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="o-priority">Priority</Label>
                        <Input
                          id="o-priority"
                          type="number"
                          value={offerForm.priority}
                          onChange={(e) => setOfferForm({ ...offerForm, priority: Number(e.target.value) })}
                          placeholder="0 (highest first)"
                        />
                      </div>
                      <div>
                        <Label htmlFor="o-status">Status</Label>
                        <Select
                          value={offerForm.status}
                          onValueChange={(value) => setOfferForm({ ...offerForm, status: value as Offer['status'] })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="o-banner-url">Banner Image URL</Label>
                      <Input
                        id="o-banner-url"
                        value={offerForm.banner_image_url}
                        onChange={(e) => setOfferForm({ ...offerForm, banner_image_url: e.target.value })}
                        placeholder="https://example.com/banner.jpg"
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={resetOfferForm}>
                        Cancel
                      </Button>
                      <Button
                        onClick={editingOffer ? handleUpdateOffer : handleAddOffer}
                        className="bg-[var(--ingco-yellow)] text-black hover:bg-yellow-500"
                      >
                        {editingOffer ? 'Update Offer' : 'Add Offer'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {offers.map((offer) => (
                <Card key={offer.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{offer.offer_name}</h3>
                        <p className="text-sm text-gray-600">{offer.offer_description}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="secondary">{offer.offer_type}</Badge>
                          <Badge variant="outline">{offer.discount_type}</Badge>
                          <Badge variant="outline">{offer.status}</Badge>
                        </div>
                        <p className="text-sm mt-1">
                          {offer.discount_type === 'percentage' 
                            ? `${offer.discount_value}% off` 
                            : `₹${offer.discount_value} off`
                          }
                        </p>
                        {offer.min_quantity && (
                          <p className="text-xs text-gray-500">
                            Min quantity: {offer.min_quantity}
                          </p>
                        )}
                        {offer.max_discount && (
                          <p className="text-xs text-gray-500">
                            Max discount: ₹{offer.max_discount}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          Priority: {offer.priority}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(offer.start_date).toLocaleDateString()}
                          {offer.end_date && ` - ${new Date(offer.end_date).toLocaleDateString()}`}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditOffer(offer)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteOffer(offer.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}