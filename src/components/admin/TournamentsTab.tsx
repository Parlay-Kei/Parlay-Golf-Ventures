import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Plus, Edit, Trash2, Calendar, Tag } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

type Tournament = {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  location: string;
  description: string;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  max_participants: number;
  current_participants: number;
  entry_fee: number;
  created_at: string;
};

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  stock: number;
  image_url?: string;
  status: 'active' | 'inactive' | 'out_of_stock';
  created_at: string;
};

export default function TournamentsTab() {
  const [activeTab, setActiveTab] = useState('tournaments');
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTournamentDialogOpen, setIsTournamentDialogOpen] = useState(false);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [currentTournament, setCurrentTournament] = useState<Tournament | null>(null);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (activeTab === 'tournaments') {
      fetchTournaments();
    } else {
      fetchProducts();
    }
  }, [activeTab]);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('start_date', { ascending: true });

      if (error) throw error;
      setTournaments(data || []);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tournaments. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Error',
        description: 'Failed to load products. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const openNewTournamentDialog = () => {
    setCurrentTournament(null);
    setIsEditing(false);
    setIsTournamentDialogOpen(true);
  };

  const openEditTournamentDialog = (tournament: Tournament) => {
    setCurrentTournament(tournament);
    setIsEditing(true);
    setIsTournamentDialogOpen(true);
  };

  const openNewProductDialog = () => {
    setCurrentProduct(null);
    setIsEditing(false);
    setIsProductDialogOpen(true);
  };

  const openEditProductDialog = (product: Product) => {
    setCurrentProduct(product);
    setIsEditing(true);
    setIsProductDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'upcoming':
        return 'text-green-600';
      case 'completed':
        return 'text-blue-600';
      case 'cancelled':
      case 'inactive':
      case 'out_of_stock':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleSaveTournament = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const tournamentData = {
      name: formData.get('name') as string,
      start_date: formData.get('start_date') as string,
      end_date: formData.get('end_date') as string,
      location: formData.get('location') as string,
      description: formData.get('description') as string,
      status: formData.get('status') as 'upcoming' | 'active' | 'completed' | 'cancelled',
      max_participants: parseInt(formData.get('max_participants') as string),
      entry_fee: parseFloat(formData.get('entry_fee') as string),
    };

    try {
      if (isEditing && currentTournament) {
        // Update existing tournament
        const { error } = await supabase
          .from('tournaments')
          .update(tournamentData)
          .eq('id', currentTournament.id);

        if (error) throw error;

        toast({
          title: 'Tournament Updated',
          description: 'The tournament has been updated successfully.',
        });
      } else {
        // Create new tournament
        const { error } = await supabase
          .from('tournaments')
          .insert([{
            ...tournamentData,
            current_participants: 0,
            created_at: new Date().toISOString(),
          }]);

        if (error) throw error;

        toast({
          title: 'Tournament Created',
          description: 'The new tournament has been created successfully.',
        });
      }

      // Refresh tournaments list
      fetchTournaments();
      setIsTournamentDialogOpen(false);
    } catch (error) {
      console.error('Error saving tournament:', error);
      toast({
        title: 'Error',
        description: 'Failed to save tournament. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const productData = {
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      price: parseFloat(formData.get('price') as string),
      description: formData.get('description') as string,
      stock: parseInt(formData.get('stock') as string),
      image_url: formData.get('image_url') as string,
      status: formData.get('status') as 'active' | 'inactive' | 'out_of_stock',
    };

    try {
      if (isEditing && currentProduct) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', currentProduct.id);

        if (error) throw error;

        toast({
          title: 'Product Updated',
          description: 'The product has been updated successfully.',
        });
      } else {
        // Create new product
        const { error } = await supabase
          .from('products')
          .insert([{
            ...productData,
            created_at: new Date().toISOString(),
          }]);

        if (error) throw error;

        toast({
          title: 'Product Created',
          description: 'The new product has been created successfully.',
        });
      }

      // Refresh products list
      fetchProducts();
      setIsProductDialogOpen(false);
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: 'Error',
        description: 'Failed to save product. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const deleteTournament = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tournament?')) return;

    try {
      const { error } = await supabase
        .from('tournaments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Tournament Deleted',
        description: 'The tournament has been deleted successfully.',
      });

      // Refresh tournaments list
      fetchTournaments();
    } catch (error) {
      console.error('Error deleting tournament:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete tournament. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Product Deleted',
        description: 'The product has been deleted successfully.',
      });

      // Refresh products list
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete product. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-pgv-green" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  return (
    <div>
      <Tabs defaultValue="tournaments" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tournaments">Tournaments</TabsTrigger>
          <TabsTrigger value="products">Equipment & Gear</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tournaments" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Manage Tournaments</h3>
            <Button onClick={openNewTournamentDialog}>
              <Plus className="h-4 w-4 mr-2" /> Add Tournament
            </Button>
          </div>

          {tournaments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-gray-400" />
              <p className="mt-2 text-gray-500">No tournaments found.</p>
              <Button variant="outline" className="mt-4" onClick={openNewTournamentDialog}>
                Create your first tournament
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tournaments.map((tournament) => (
                <Card key={tournament.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{tournament.name}</CardTitle>
                        <CardDescription>
                          {formatDate(tournament.start_date)} - {formatDate(tournament.end_date)}
                        </CardDescription>
                      </div>
                      <span className={`capitalize font-medium ${getStatusColor(tournament.status)}`}>
                        {tournament.status}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Location:</span>
                        <span className="ml-2">{tournament.location}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Participants:</span>
                        <span className="ml-2">{tournament.current_participants} / {tournament.max_participants}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Entry Fee:</span>
                        <span className="ml-2">{formatCurrency(tournament.entry_fee)}</span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{tournament.description}</p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openEditTournamentDialog(tournament)}>
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600" onClick={() => deleteTournament(tournament.id)}>
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="products" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Manage Equipment & Gear</h3>
            <Button onClick={openNewProductDialog}>
              <Plus className="h-4 w-4 mr-2" /> Add Product
            </Button>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-8">
              <Tag className="h-12 w-12 mx-auto text-gray-400" />
              <p className="mt-2 text-gray-500">No products found.</p>
              <Button variant="outline" className="mt-4" onClick={openNewProductDialog}>
                Add your first product
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {products.map((product) => (
                <Card key={product.id}>
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={product.image_url || 'https://via.placeholder.com/300x150?text=No+Image'}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/300x150?text=Image+Error';
                      }}
                    />
                    <div className="absolute top-2 right-2">
                      <span className={`text-xs px-2 py-1 rounded-full bg-white ${getStatusColor(product.status)}`}>
                        {product.status}
                      </span>
                    </div>
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{product.name}</CardTitle>
                        <CardDescription className="capitalize">{product.category}</CardDescription>
                      </div>
                      <span className="font-bold">{formatCurrency(product.price)}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Stock:</span>
                        <span className="ml-2">{product.stock} units</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openEditProductDialog(product)}>
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600" onClick={() => deleteProduct(product.id)}>
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Tournament Dialog */}
      <Dialog open={isTournamentDialogOpen} onOpenChange={setIsTournamentDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Tournament' : 'Add New Tournament'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Update the tournament details below.' : 'Fill in the details to create a new tournament.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveTournament}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="name">Tournament Name</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={currentTournament?.name || ''}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    name="start_date"
                    type="date"
                    defaultValue={currentTournament?.start_date || ''}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    name="end_date"
                    type="date"
                    defaultValue={currentTournament?.end_date || ''}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    defaultValue={currentTournament?.location || ''}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="max_participants">Max Participants</Label>
                  <Input
                    id="max_participants"
                    name="max_participants"
                    type="number"
                    min="1"
                    defaultValue={currentTournament?.max_participants || 50}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="entry_fee">Entry Fee ($)</Label>
                  <Input
                    id="entry_fee"
                    name="entry_fee"
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={currentTournament?.entry_fee || 0}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="status">Status</Label>
                  <Select name="status" defaultValue={currentTournament?.status || 'upcoming'}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    className="min-h-[100px]"
                    defaultValue={currentTournament?.description || ''}
                    required
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsTournamentDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{isEditing ? 'Update Tournament' : 'Create Tournament'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Product Dialog */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Update the product details below.' : 'Fill in the details to add a new product.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveProduct}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={currentProduct?.name || ''}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select name="category" defaultValue={currentProduct?.category || 'clubs'}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clubs">Clubs</SelectItem>
                      <SelectItem value="balls">Balls</SelectItem>
                      <SelectItem value="apparel">Apparel</SelectItem>
                      <SelectItem value="accessories">Accessories</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={currentProduct?.price || 0}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    defaultValue={currentProduct?.stock || 0}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select name="status" defaultValue={currentProduct?.status || 'active'}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="image_url">Image URL</Label>
                  <Input
                    id="image_url"
                    name="image_url"
                    defaultValue={currentProduct?.image_url || ''}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    className="min-h-[100px]"
                    defaultValue={currentProduct?.description || ''}
                    required
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsProductDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{isEditing ? 'Update Product' : 'Add Product'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
