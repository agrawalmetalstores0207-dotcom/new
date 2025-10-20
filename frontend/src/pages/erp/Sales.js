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
import { Plus, FileText } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ERPSales = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    invoice_number: '',
    party_name: '',
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
    fetchSales();
  }, [user]);

  const fetchSales = async () => {
    try {
      const response = await axios.get(`${API}/erp/sales/`);
      setSales(response.data);
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = async () => {
    if (!formData.invoice_number || !formData.party_name || !formData.total_amount) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      await axios.post(`${API}/erp/sales/`, {
        ...formData,
        total_amount: parseFloat(formData.total_amount),
        date: new Date().toISOString().split('T')[0]
      });
      toast.success('Invoice created successfully!');
      setCreateDialogOpen(false);
      setFormData({
        invoice_number: '',
        party_name: '',
        total_amount: '',
        payment_status: 'pending',
        items: []
      });
      fetchSales();
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error('Failed to create invoice');
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
    <div className="min-h-screen" data-testid="erp-sales-page">
      <Navbar />

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold gradient-text">Sales Management</h1>
              <p className="text-gray-600 mt-2">Create invoices and track payments</p>
            </div>
            <Button className="btn-primary" data-testid="create-invoice-button">
              <Plus className="w-5 h-5 mr-2" />
              Create Invoice
            </Button>
          </div>

          {sales.length === 0 ? (
            <Card className="glass text-center py-20">
              <CardContent>
                <FileText className="w-20 h-20 mx-auto mb-6 text-gray-400" />
                <h2 className="text-2xl font-bold mb-4">No sales invoices yet</h2>
                <p className="text-gray-600 mb-6">Create your first invoice to track sales</p>
                <Button className="btn-primary" data-testid="create-first-invoice">
                  <Plus className="w-5 h-5 mr-2" />
                  Create First Invoice
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {sales.map((sale) => (
                <Card key={sale.id} className="card" data-testid={`sale-${sale.id}`}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-lg">Invoice #{sale.invoice_number}</h3>
                        <p className="text-sm text-gray-600">Party: {sale.party_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-[#8b4513]">₹{sale.total_amount}</p>
                        <p className="text-sm text-gray-600">{sale.payment_status}</p>
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

export default ERPSales;