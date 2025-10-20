import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { Plus, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ERPPurchases = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

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
            <Button className="btn-primary" data-testid="create-purchase-button">
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
                <Button className="btn-primary" data-testid="create-first-purchase">
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

      <Footer />
    </div>
  );
};

export default ERPPurchases;