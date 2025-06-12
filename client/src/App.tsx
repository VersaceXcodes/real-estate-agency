
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import { Trash2, Home, Users, Heart, Plus, DollarSign, MapPin, Bed, Bath, Square } from 'lucide-react';
import type { Property, CreatePropertyInput, Client, CreateClientInput, ClientInterest, CreateClientInterestInput } from '../../server/src/schema';

function App() {
  // State for all entities
  const [properties, setProperties] = useState<Property[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [clientInterests, setClientInterests] = useState<ClientInterest[]>([]);
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});

  // Form states
  const [propertyForm, setPropertyForm] = useState<CreatePropertyInput>({
    address: '',
    price: 0,
    bedrooms: 0,
    bathrooms: 0,
    squareFootage: 0,
    type: 'House',
    status: 'Available',
    description: null
  });

  const [clientForm, setClientForm] = useState<CreateClientInput>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    budget: null,
    desiredPropertyType: null
  });

  const [interestForm, setInterestForm] = useState<CreateClientInterestInput>({
    clientId: 0,
    propertyId: 0,
    interestLevel: 'Medium'
  });

  // Dialog states
  const [isPropertyDialogOpen, setIsPropertyDialogOpen] = useState(false);
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [isInterestDialogOpen, setIsInterestDialogOpen] = useState(false);

  // Load data functions
  const loadProperties = useCallback(async () => {
    try {
      const result = await trpc.getProperties.query();
      setProperties(result);
    } catch (error) {
      console.error('Failed to load properties:', error);
    }
  }, []);

  const loadClients = useCallback(async () => {
    try {
      const result = await trpc.getClients.query();
      setClients(result);
    } catch (error) {
      console.error('Failed to load clients:', error);
    }
  }, []);

  const loadClientInterests = useCallback(async () => {
    try {
      const result = await trpc.getClientInterests.query();
      setClientInterests(result);
    } catch (error) {
      console.error('Failed to load client interests:', error);
    }
  }, []);

  useEffect(() => {
    loadProperties();
    loadClients();
    loadClientInterests();
  }, [loadProperties, loadClients, loadClientInterests]);

  // Property handlers
  const handleCreateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading((prev: Record<string, boolean>) => ({ ...prev, createProperty: true }));
    try {
      const response = await trpc.createProperty.mutate(propertyForm);
      setProperties((prev: Property[]) => [...prev, response]);
      setPropertyForm({
        address: '',
        price: 0,
        bedrooms: 0,
        bathrooms: 0,
        squareFootage: 0,
        type: 'House',
        status: 'Available',
        description: null
      });
      setIsPropertyDialogOpen(false);
    } catch (error) {
      console.error('Failed to create property:', error);
    } finally {
      setIsLoading((prev: Record<string, boolean>) => ({ ...prev, createProperty: false }));
    }
  };

  const handleDeleteProperty = async (id: number) => {
    try {
      await trpc.deleteProperty.mutate({ id });
      setProperties((prev: Property[]) => prev.filter((prop: Property) => prop.id !== id));
    } catch (error) {
      console.error('Failed to delete property:', error);
    }
  };

  // Client handlers
  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading((prev: Record<string, boolean>) => ({ ...prev, createClient: true }));
    try {
      const response = await trpc.createClient.mutate(clientForm);
      setClients((prev: Client[]) => [...prev, response]);
      setClientForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        budget: null,
        desiredPropertyType: null
      });
      setIsClientDialogOpen(false);
    } catch (error) {
      console.error('Failed to create client:', error);
    } finally {
      setIsLoading((prev: Record<string, boolean>) => ({ ...prev, createClient: false }));
    }
  };

  const handleDeleteClient = async (id: number) => {
    try {
      await trpc.deleteClient.mutate({ id });
      setClients((prev: Client[]) => prev.filter((client: Client) => client.id !== id));
    } catch (error) {
      console.error('Failed to delete client:', error);
    }
  };

  // Interest handlers
  const handleCreateInterest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading((prev: Record<string, boolean>) => ({ ...prev, createInterest: true }));
    try {
      const response = await trpc.createClientInterest.mutate(interestForm);
      setClientInterests((prev: ClientInterest[]) => [...prev, response]);
      setInterestForm({
        clientId: 0,
        propertyId: 0,
        interestLevel: 'Medium'
      });
      setIsInterestDialogOpen(false);
    } catch (error) {
      console.error('Failed to create interest:', error);
    } finally {
      setIsLoading((prev: Record<string, boolean>) => ({ ...prev, createInterest: false }));
    }
  };

  const handleDeleteInterest = async (id: number) => {
    try {
      await trpc.deleteClientInterest.mutate({ id });
      setClientInterests((prev: ClientInterest[]) => prev.filter((interest: ClientInterest) => interest.id !== id));
    } catch (error) {
      console.error('Failed to delete interest:', error);
    }
  };

  // Helper functions
  const getClientName = (clientId: number) => {
    const client = clients.find((c: Client) => c.id === clientId);
    return client ? `${client.firstName} ${client.lastName}` : 'Unknown Client';
  };

  const getPropertyAddress = (propertyId: number) => {
    const property = properties.find((p: Property) => p.id === propertyId);
    return property ? property.address : 'Unknown Property';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-800 border-green-200';
      case 'Under Contract': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Sold': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getInterestColor = (level: string) => {
    switch (level) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
            <Home className="h-10 w-10 text-blue-600" />
            🏡 Real Estate Management
          </h1>
          <p className="text-gray-600 text-lg">Manage properties, clients, and their interests</p>
        </div>

        <Tabs defaultValue="properties" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="properties" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Properties
            </TabsTrigger>
            <TabsTrigger value="clients" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Clients
            </TabsTrigger>
            <TabsTrigger value="interests" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Client Interests
            </TabsTrigger>
          </TabsList>

          {/* Properties Tab */}
          <TabsContent value="properties">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-gray-900">Properties</h2>
                <Dialog open={isPropertyDialogOpen} onOpenChange={setIsPropertyDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Property
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Add New Property</DialogTitle>
                      <DialogDescription>
                        Fill in the property details below.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateProperty}>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="address" className="text-right">Address</Label>
                          <Input
                            id="address"
                            value={propertyForm.address}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              setPropertyForm((prev: CreatePropertyInput) => ({ ...prev, address: e.target.value }))
                            }
                            className="col-span-3"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="price" className="text-right">Price</Label>
                          <Input
                            id="price"
                            type="number"
                            value={propertyForm.price}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              setPropertyForm((prev: CreatePropertyInput) => ({ ...prev, price: parseFloat(e.target.value) || 0 }))
                            }
                            className="col-span-3"
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="bedrooms" className="text-right">Bedrooms</Label>
                            <Input
                              id="bedrooms"
                              type="number"
                              value={propertyForm.bedrooms}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setPropertyForm((prev: CreatePropertyInput) => ({ ...prev, bedrooms: parseInt(e.target.value) || 0 }))
                              }
                              className="col-span-3"
                              min="0"
                              required
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="bathrooms" className="text-right">Bathrooms</Label>
                            <Input
                              id="bathrooms"
                              type="number"
                              value={propertyForm.bathrooms}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setPropertyForm((prev: CreatePropertyInput) => ({ ...prev, bathrooms: parseInt(e.target.value) || 0 }))
                              }
                              className="col-span-3"
                              min="0"
                              required
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="squareFootage" className="text-right">Square Footage</Label>
                          <Input
                            id="squareFootage"
                            type="number"
                            value={propertyForm.squareFootage}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              setPropertyForm((prev: CreatePropertyInput) => ({ ...prev, squareFootage: parseFloat(e.target.value) || 0 }))
                            }
                            className="col-span-3"
                            min="0"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="type" className="text-right">Type</Label>
                            <Select
                              value={propertyForm.type || 'House'}
                              onValueChange={(value: 'House' | 'Apartment' | 'Condo') =>
                                setPropertyForm((prev: CreatePropertyInput) => ({ ...prev, type: value }))
                              }
                            >
                              <SelectTrigger className="col-span-3">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="House">House</SelectItem>
                                <SelectItem value="Apartment">Apartment</SelectItem>
                                <SelectItem value="Condo">Condo</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="status" className="text-right">Status</Label>
                            <Select
                              value={propertyForm.status || 'Available'}
                              onValueChange={(value: 'Available' | 'Under Contract' | 'Sold') =>
                                setPropertyForm((prev: CreatePropertyInput) => ({ ...prev, status: value }))
                              }
                            >
                              <SelectTrigger className="col-span-3">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Available">Available</SelectItem>
                                <SelectItem value="Under Contract">Under Contract</SelectItem>
                                <SelectItem value="Sold">Sold</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="description" className="text-right">Description</Label>
                          <Textarea
                            id="description"
                            value={propertyForm.description || ''}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                              setPropertyForm((prev: CreatePropertyInput) => ({
                                ...prev,
                                description: e.target.value || null
                              }))
                            }
                            className="col-span-3"
                            placeholder="Optional description..."
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" disabled={isLoading.createProperty}>
                          {isLoading.createProperty ? 'Creating...' : 'Create Property'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {properties.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No properties yet. Add one to get started! 🏠</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {properties.map((property: Property) => (
                    <Card key={property.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-blue-600" />
                              {property.address}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-1 text-green-600 font-semibold">
                              <DollarSign className="h-4 w-4" />
                              ${property.price.toLocaleString()}
                            </CardDescription>
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Property</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this property? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteProperty(property.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <Badge className={getStatusColor(property.status)}>
                              {property.status}
                            </Badge>
                            <Badge variant="outline">{property.type}</Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Bed className="h-3 w-3" />
                              {property.bedrooms} bed
                            </div>
                            <div className="flex items-center gap-1">
                              <Bath className="h-3 w-3" />
                              {property.bathrooms} bath
                            </div>
                            <div className="flex items-center gap-1">
                              <Square className="h-3 w-3" />
                              {property.squareFootage} sq ft
                            </div>
                          </div>
                          {property.description && (
                            <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                              {property.description}
                            </p>
                          )}
                          <p className="text-xs text-gray-400">
                            Added: {property.created_at.toLocaleDateString()}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-gray-900">Clients</h2>
                <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Client
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Add New Client</DialogTitle>
                      <DialogDescription>
                        Fill in the client details below.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateClient}>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                              id="firstName"
                              value={clientForm.firstName}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setClientForm((prev: CreateClientInput) => ({ ...prev, firstName: e.target.value }))
                              }
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                              id="lastName"
                              value={clientForm.lastName}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setClientForm((prev: CreateClientInput) => ({ ...prev, lastName: e.target.value }))
                              }
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={clientForm.email}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              setClientForm((prev: CreateClientInput) => ({ ...prev, email: e.target.value }))
                            }
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            value={clientForm.phone}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              setClientForm((prev: CreateClientInput) => ({ ...prev, phone: e.target.value }))
                            }
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="budget">Budget (Optional)</Label>
                          <Input
                            id="budget"
                            type="number"
                            value={clientForm.budget || ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              setClientForm((prev: CreateClientInput) => ({
                                ...prev,
                                budget: e.target.value ? parseFloat(e.target.value) : null
                              }))
                            }
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div>
                          <Label htmlFor="desiredPropertyType">Desired Property Type (Optional)</Label>
                          <Input
                            id="desiredPropertyType"
                            value={clientForm.desiredPropertyType || ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              setClientForm((prev: CreateClientInput) => ({
                                ...prev,
                                desiredPropertyType: e.target.value || null
                              }))
                            }
                            placeholder="e.g., House, Apartment, Condo"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" disabled={isLoading.createClient}>
                          {isLoading.createClient ? 'Creating...' : 'Create Client'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {clients.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No clients yet. Add one to get started! 👥</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {clients.map((client: Client) => (
                    <Card key={client.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">
                              {client.firstName} {client.lastName}
                            </CardTitle>
                            <CardDescription>{client.email}</CardDescription>
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Client</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this client? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteClient(client.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p className="text-sm"><strong>Phone:</strong> {client.phone}</p>
                          {client.budget && (
                            <p className="text-sm flex items-center gap-1">
                              <strong>Budget:</strong>
                              <span className="text-green-600 font-semibold">
                                <DollarSign className="h-3 w-3 inline" />
                                {client.budget.toLocaleString()}
                              </span>
                            </p>
                          )}
                          {client.desiredPropertyType && (
                            <p className="text-sm"><strong>Preferred Type:</strong> {client.desiredPropertyType}</p>
                          )}
                          <p className="text-xs text-gray-400">
                            Registered: {client.created_at.toLocaleDateString()}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Client Interests Tab */}
          <TabsContent value="interests">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-gray-900">Client Interests</h2>
                <Dialog open={isInterestDialogOpen} onOpenChange={setIsInterestDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Interest
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                      <DialogTitle>Add Client Interest</DialogTitle>
                      <DialogDescription>
                        Link a client to a property with their interest level.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateInterest}>
                      <div className="grid gap-4 py-4">
                        <div>
                          <Label htmlFor="clientSelect">Client</Label>
                          <Select
                            value={interestForm.clientId > 0 ? interestForm.clientId.toString() : ''}
                            onValueChange={(value: string) =>
                              setInterestForm((prev: CreateClientInterestInput) => ({
                                ...prev,
                                clientId: parseInt(value)
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a client" />
                            </SelectTrigger>
                            <SelectContent>
                              {clients.map((client: Client) => (
                                <SelectItem key={client.id} value={client.id.toString()}>
                                  {client.firstName} {client.lastName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="propertySelect">Property</Label>
                          <Select
                            value={interestForm.propertyId > 0 ? interestForm.propertyId.toString() : ''}
                            onValueChange={(value: string) =>
                              setInterestForm((prev: CreateClientInterestInput) => ({
                                ...prev,
                                propertyId: parseInt(value)
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a property" />
                            </SelectTrigger>
                            <SelectContent>
                              {properties.map((property: Property) => (
                                <SelectItem key={property.id} value={property.id.toString()}>
                                  {property.address}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="interestLevel">Interest Level</Label>
                          <Select
                            value={interestForm.interestLevel}
                            onValueChange={(value: 'High' | 'Medium' | 'Low') =>
                              setInterestForm((prev: CreateClientInterestInput) => ({
                                ...prev,
                                interestLevel: value
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="High">High</SelectItem>
                              <SelectItem value="Medium">Medium</SelectItem>
                              <SelectItem value="Low">Low</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" disabled={isLoading.createInterest || interestForm.clientId === 0 || interestForm.propertyId === 0}>
                          {isLoading.createInterest ? 'Creating...' : 'Create Interest'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {clientInterests.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No client interests yet. Add one to get started! 💕</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {clientInterests.map((interest: ClientInterest) => (
                    <Card key={interest.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <CardTitle className="text-lg">
                              {getClientName(interest.clientId)}
                            </CardTitle>
                            <CardDescription className="text-sm">
                              <MapPin className="h-3 w-3 inline mr-1" />
                              {getPropertyAddress(interest.propertyId)}
                            </CardDescription>
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Interest</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this client interest? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteInterest(interest.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <Badge className={getInterestColor(interest.interestLevel)}>
                            {interest.interestLevel} Interest
                          </Badge>
                          <p className="text-xs text-gray-400">
                            Created: {interest.created_at.toLocaleDateString()}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default App;
