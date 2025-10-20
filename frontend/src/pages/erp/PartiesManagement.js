import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { Plus, Edit, Trash2, Users, Building2 } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const PartiesManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [parties, setParties] = useState([]);
  const [activeTab, setActiveTab] = useState('customer');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingParty, setEditingParty] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    party_type: 'customer',
    contact_person: '',
    mobile: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    gstin: '',
    opening_balance: '0',
    balance_type: 'credit'
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      toast.error('Admin access required');
      navigate('/admin');
      return;
    }
    fetchParties();
  }, [user]);

  const fetchParties = async () => {
    try {
      const response = await axios.get(`${API}/erp/parties`);
      setParties(response.data);
    } catch (error) {
      console.error('Error fetching parties:', error);
      toast.error('Failed to load parties');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (party = null, type = null) => {
    if (party) {
      setEditingParty(party);
      setFormData({
        code: party.code,
        name: party.name,
        party_type: party.party_type,
        contact_person: party.contact_person || '',
        mobile: party.mobile || '',
        email: party.email || '',
        address: party.address || '',
        city: party.city || '',
        state: party.state || '',
        pincode: party.pincode || '',
        gstin: party.gstin || '',
        opening_balance: party.opening_balance.toString(),
        balance_type: party.balance_type
      });
    } else {
      setEditingParty(null);
      setFormData({
        code: '',
        name: '',
        party_type: type || activeTab,
        contact_person: '',
        mobile: '',
        email: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        gstin: '',
        opening_balance: '0',
        balance_type: 'credit'
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.code || !formData.name) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const payload = {
        ...formData,
        opening_balance: parseFloat(formData.opening_balance)
      };

      if (editingParty) {
        await axios.put(`${API}/erp/parties/${editingParty.id}`, payload);
        toast.success('Party updated successfully!');
      } else {
        await axios.post(`${API}/erp/parties`, payload);
        toast.success('Party created successfully!');
      }

      setDialogOpen(false);
      fetchParties();
    } catch (error) {
      console.error('Error saving party:', error);
      toast.error(error.response?.data?.detail || 'Failed to save party');
    }
  };

  const handleDelete = async (partyId) => {
    if (!window.confirm('Are you sure you want to delete this party?')) return;

    try {
      await axios.delete(`${API}/erp/parties/${partyId}`);
      toast.success('Party deleted successfully');
      fetchParties();
    } catch (error) {
      console.error('Error deleting party:', error);
      toast.error('Failed to delete party');
    }
  };

  const filteredParties = parties.filter(p => p.party_type === activeTab);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading w-12 h-12 border-4 border-[#8b4513] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold gradient-text">Parties Management</h1>
              <p className="text-gray-600 mt-2">Manage customers and suppliers</p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
              <TabsTrigger value="customer">
                <Users className="w-4 h-4 mr-2" />
                Customers
              </TabsTrigger>
              <TabsTrigger value="supplier">
                <Building2 className="w-4 h-4 mr-2" />
                Suppliers
              </TabsTrigger>
            </TabsList>

            <TabsContent value="customer">
              <div className="flex justify-end mb-4">
                <Button className="btn-primary" onClick={() => handleOpenDialog(null, 'customer')}>
                  <Plus className="w-5 h-5 mr-2" />
                  Add Customer
                </Button>
              </div>
              {filteredParties.length === 0 ? (
                <Card className="glass text-center py-20">
                  <CardContent>
                    <Users className="w-20 h-20 mx-auto mb-6 text-gray-400" />
                    <h2 className="text-2xl font-bold mb-4">No customers yet</h2>
                    <Button className="btn-primary" onClick={() => handleOpenDialog(null, 'customer')}>
                      <Plus className="w-5 h-5 mr-2" />
                      Add First Customer
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredParties.map((party) => (
                    <Card key={party.id} className="card">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="font-bold text-lg mb-1">{party.name}</h3>
                            <p className="text-sm text-gray-600">Code: {party.code}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(party)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(party.id)} className="text-red-500">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          {party.mobile && <p className="text-gray-600">📱 {party.mobile}</p>}
                          {party.email && <p className="text-gray-600">✉️ {party.email}</p>}
                          {party.city && <p className="text-gray-600">📍 {party.city}</p>}
                          {party.gstin && <p className="text-gray-600">GST: {party.gstin}</p>}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="supplier">
              <div className="flex justify-end mb-4">
                <Button className="btn-primary" onClick={() => handleOpenDialog(null, 'supplier')}>
                  <Plus className="w-5 h-5 mr-2" />
                  Add Supplier
                </Button>
              </div>
              {filteredParties.length === 0 ? (
                <Card className="glass text-center py-20">
                  <CardContent>
                    <Building2 className="w-20 h-20 mx-auto mb-6 text-gray-400" />
                    <h2 className="text-2xl font-bold mb-4">No suppliers yet</h2>
                    <Button className="btn-primary" onClick={() => handleOpenDialog(null, 'supplier')}>
                      <Plus className="w-5 h-5 mr-2" />
                      Add First Supplier
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredParties.map((party) => (
                    <Card key={party.id} className="card">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="font-bold text-lg mb-1">{party.name}</h3>
                            <p className="text-sm text-gray-600">Code: {party.code}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(party)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(party.id)} className="text-red-500">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          {party.mobile && <p className="text-gray-600">📱 {party.mobile}</p>}
                          {party.email && <p className="text-gray-600">✉️ {party.email}</p>}
                          {party.city && <p className="text-gray-600">📍 {party.city}</p>}
                          {party.gstin && <p className="text-gray-600">GST: {party.gstin}</p>}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingParty ? 'Edit Party' : `Add New ${formData.party_type === 'customer' ? 'Customer' : 'Supplier'}`}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="code">Code *</Label>
              <Input id="code" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} placeholder="CUST001" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Party name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_person">Contact Person</Label>
              <Input id="contact_person" value={formData.contact_person} onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })} placeholder="Contact name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile</Label>
              <Input id="mobile" value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} placeholder="Mobile number" />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="email@example.com" />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Address" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} placeholder="City" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input id="state" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} placeholder="State" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode</Label>
              <Input id="pincode" value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} placeholder="Pincode" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gstin">GSTIN</Label>
              <Input id="gstin" value={formData.gstin} onChange={(e) => setFormData({ ...formData, gstin: e.target.value })} placeholder="GST Number" />
            </div>
          </div>
          <div className="flex gap-2 mt-6">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleSubmit} className="btn-primary flex-1">{editingParty ? 'Update' : 'Create'}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default PartiesManagement;