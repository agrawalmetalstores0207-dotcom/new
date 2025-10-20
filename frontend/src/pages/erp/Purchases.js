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
import { useAuth } from '@/context/AuthContext';
import { Plus, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ERPPurchases = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    bill_number: '',
    supplier_name: '',
    total_amount: '',
    payment_status: 'pending',
    items: []
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      toast.error('Admin access required');
      navigate('/admin');
      return;
    }
    fetchPurchases();
  }, [user]);

  const fetchPurchases = async () => {
    try {
      const response = await axios.get(`${API}/erp/purchases/`);
      setPurchases(response.data);
    } catch (error) {
      console.error('Error fetching purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePurchase = async () => {
    if (!formData.bill_number || !formData.supplier_name || !formData.total_amount) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      await axios.post(`${API}/erp/purchases/`, {
        ...formData,
        total_amount: parseFloat(formData.total_amount),
        date: new Date().toISOString().split('T')[0]
      });
      toast.success('Purchase bill created successfully!');
      setCreateDialogOpen(false);
      setFormData({
        bill_number: '',
        supplier_name: '',
        total_amount: '',
        payment_status: 'pending',
        items: []
      });
      fetchPurchases();
    } catch (error) {
      console.error('Error creating purchase:', error);
      toast.error('Failed to create purchase bill');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading w-12 h-12 border-4 border-[#8b4513] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" data-testid="erp-purchases-page">
      <Navbar />

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold gradient-text">Purchase Management</h1>
              <p className="text-gray-600 mt-2">Record purchases and manage suppliers</p>
            </div>
            <Button className="btn-primary" onClick={() => setCreateDialogOpen(true)} data-testid="create-purchase-button">
              <Plus className="w-5 h-5 mr-2" />
              Add Purchase
            </Button>
          </div>

          {purchases.length === 0 ? (
            <Card className="glass text-center py-20">
              <CardContent>
                <ShoppingCart className="w-20 h-20 mx-auto mb-6 text-gray-400" />
                <h2 className="text-2xl font-bold mb-4">No purchase records yet</h2>
                <p className="text-gray-600 mb-6">Add your first purchase to track inventory</p>
                <Button className="btn-primary" onClick={() => setCreateDialogOpen(true)} data-testid="create-first-purchase">
                  <Plus className="w-5 h-5 mr-2" />
                  Add First Purchase
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {purchases.map((purchase) => (
                <Card key={purchase.id} className="card" data-testid={`purchase-${purchase.id}`}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-lg">Bill #{purchase.bill_number}</h3>
                        <p className="text-sm text-gray-600">Supplier: {purchase.supplier_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-[#8b4513]">₹{purchase.total_amount}</p>
                        <p className="text-sm text-gray-600">{purchase.payment_status}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Purchase Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent data-testid="create-purchase-dialog">
          <DialogHeader>
            <DialogTitle>Add New Purchase</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="bill-number">Bill Number *</Label>
              <Input
                id="bill-number"
                value={formData.bill_number}
                onChange={(e) => setFormData({...formData, bill_number: e.target.value})}
                placeholder="BILL-001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier-name">Supplier Name *</Label>
              <Input
                id="supplier-name"
                value={formData.supplier_name}
                onChange={(e) => setFormData({...formData, supplier_name: e.target.value})}
                placeholder="Supplier name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="total-amount">Total Amount (₹) *</Label>
              <Input
                id="total-amount"
                type="number"
                value={formData.total_amount}
                onChange={(e) => setFormData({...formData, total_amount: e.target.value})}
                placeholder="10000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-status">Payment Status</Label>
              <select
                id="payment-status"
                value={formData.payment_status}
                onChange={(e) => setFormData({...formData, payment_status: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="partial">Partial</option>
              </select>
            </div>
            <div className="flex gap-2 mt-6">
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleCreatePurchase} className="btn-primary flex-1">
                Add Purchase
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default ERPPurchases;