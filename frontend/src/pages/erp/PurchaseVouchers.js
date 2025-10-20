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
import { Plus, ShoppingCart, X } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const PurchaseVouchers = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vouchers, setVouchers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    voucher_number: '',
    voucher_date: new Date().toISOString().split('T')[0],
    supplier_id: '',
    supplier_name: '',
    notes: ''
  });
  const [lineItems, setLineItems] = useState([]);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      toast.error('Admin access required');
      navigate('/admin');
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [vouchersRes, suppliersRes, itemsRes] = await Promise.all([
        axios.get(`${API}/erp/vouchers/purchase`),
        axios.get(`${API}/erp/parties?party_type=supplier`),
        axios.get(`${API}/erp/items`)
      ]);
      setVouchers(vouchersRes.data);
      setSuppliers(suppliersRes.data);
      setItems(itemsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    const nextVoucherNumber = `BILL-${String(vouchers.length + 1).padStart(4, '0')}`;
    setFormData({
      voucher_number: nextVoucherNumber,
      voucher_date: new Date().toISOString().split('T')[0],
      supplier_id: suppliers[0]?.id || '',
      supplier_name: suppliers[0]?.name || '',
      notes: ''
    });
    setLineItems([]);
    setDialogOpen(true);
  };

  const addLineItem = () => {
    if (items.length === 0) {
      toast.error('Please add items first');
      return;
    }
    const firstItem = items[0];
    setLineItems([...lineItems, {
      item_id: firstItem.id,
      item_name: firstItem.name,
      quantity: 1,
      rate: firstItem.purchase_rate,
      amount: firstItem.purchase_rate,
      tax_rate: firstItem.gst_rate,
      tax_amount: (firstItem.purchase_rate * firstItem.gst_rate) / 100,
      total: firstItem.purchase_rate + ((firstItem.purchase_rate * firstItem.gst_rate) / 100)
    }]);
  };

  const updateLineItem = (index, field, value) => {
    const newItems = [...lineItems];
    newItems[index][field] = value;

    if (field === 'item_id') {
      const selectedItem = items.find(i => i.id === value);
      if (selectedItem) {
        newItems[index].item_name = selectedItem.name;
        newItems[index].rate = selectedItem.purchase_rate;
        newItems[index].tax_rate = selectedItem.gst_rate;
      }
    }

    const qty = parseFloat(newItems[index].quantity) || 0;
    const rate = parseFloat(newItems[index].rate) || 0;
    const taxRate = parseFloat(newItems[index].tax_rate) || 0;

    newItems[index].amount = qty * rate;
    newItems[index].tax_amount = (newItems[index].amount * taxRate) / 100;
    newItems[index].total = newItems[index].amount + newItems[index].tax_amount;

    setLineItems(newItems);
  };

  const removeLineItem = (index) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
    const tax_amount = lineItems.reduce((sum, item) => sum + item.tax_amount, 0);
    const total_amount = subtotal + tax_amount;
    return { subtotal, tax_amount, total_amount };
  };

  const handleSubmit = async () => {
    if (!formData.voucher_number || !formData.supplier_id || lineItems.length === 0) {
      toast.error('Please fill all required fields and add at least one item');
      return;
    }

    try {
      const totals = calculateTotals();
      const payload = {
        ...formData,
        items: lineItems,
        subtotal: totals.subtotal,
        tax_amount: totals.tax_amount,
        total_amount: totals.total_amount,
        discount: 0
      };

      await axios.post(`${API}/erp/vouchers/purchase`, payload);
      toast.success('Purchase bill created successfully!');
      setDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error creating bill:', error);
      toast.error(error.response?.data?.detail || 'Failed to create bill');
    }
  };

  const totals = calculateTotals();

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
              <h1 className="text-4xl sm:text-5xl font-bold gradient-text">Purchase Bills</h1>
              <p className="text-gray-600 mt-2">Create and manage purchase bills</p>
            </div>
            <Button className="btn-primary" onClick={handleOpenDialog}>
              <Plus className="w-5 h-5 mr-2" />
              Create Bill
            </Button>
          </div>

          {vouchers.length === 0 ? (
            <Card className="glass text-center py-20">
              <CardContent>
                <ShoppingCart className="w-20 h-20 mx-auto mb-6 text-gray-400" />
                <h2 className="text-2xl font-bold mb-4">No purchase bills yet</h2>
                <Button className="btn-primary" onClick={handleOpenDialog}>
                  <Plus className="w-5 h-5 mr-2" />
                  Create First Bill
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {vouchers.map((voucher) => (
                <Card key={voucher.id} className="card">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-lg">{voucher.voucher_number}</h3>
                        <p className="text-sm text-gray-600">{voucher.supplier_name}</p>
                        <p className="text-sm text-gray-600">Date: {voucher.voucher_date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-[#8b4513]">₹{voucher.total_amount.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">Items: {voucher.items.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Purchase Bill</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="voucher_number">Bill Number *</Label>
                <Input id="voucher_number" value={formData.voucher_number} onChange={(e) => setFormData({ ...formData, voucher_number: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="voucher_date">Date *</Label>
                <Input id="voucher_date" type="date" value={formData.voucher_date} onChange={(e) => setFormData({ ...formData, voucher_date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier *</Label>
                <select
                  id="supplier"
                  value={formData.supplier_id}
                  onChange={(e) => {
                    const supplier = suppliers.find(s => s.id === e.target.value);
                    setFormData({ ...formData, supplier_id: e.target.value, supplier_name: supplier?.name || '' });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Bill Items</h3>
                <Button size="sm" onClick={addLineItem}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-3">
                {lineItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center p-3 bg-gray-50 rounded-lg">
                    <div className="col-span-3">
                      <select
                        value={item.item_id}
                        onChange={(e) => updateLineItem(index, 'item_id', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        {items.map((i) => (
                          <option key={i.id} value={i.id}>{i.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <Input type="number" step="0.01" value={item.quantity} onChange={(e) => updateLineItem(index, 'quantity', e.target.value)} placeholder="Qty" className="text-sm" />
                    </div>
                    <div className="col-span-2">
                      <Input type="number" step="0.01" value={item.rate} onChange={(e) => updateLineItem(index, 'rate', e.target.value)} placeholder="Rate" className="text-sm" />
                    </div>
                    <div className="col-span-2">
                      <Input type="number" value={item.amount.toFixed(2)} disabled className="text-sm bg-gray-100" />
                    </div>
                    <div className="col-span-2">
                      <Input type="number" value={item.total.toFixed(2)} disabled className="text-sm bg-gray-100 font-semibold" />
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <Button size="icon" variant="ghost" onClick={() => removeLineItem(index)} className="text-red-500">
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {lineItems.length > 0 && (
                <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold">Subtotal:</span>
                    <span className="font-semibold">₹{totals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold">Tax:</span>
                    <span className="font-semibold">₹{totals.tax_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xl border-t pt-2">
                    <span className="font-bold">Total:</span>
                    <span className="font-bold text-[#8b4513]">₹{totals.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input id="notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Additional notes" />
            </div>

            <div className="flex gap-2 mt-6">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">Cancel</Button>
              <Button onClick={handleSubmit} className="btn-primary flex-1">Create Bill</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default PurchaseVouchers;