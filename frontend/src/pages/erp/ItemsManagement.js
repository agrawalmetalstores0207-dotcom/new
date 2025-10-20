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
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ItemsManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    category_id: '',
    unit_id: '',
    purchase_rate: '',
    sale_rate: '',
    opening_stock: '',
    reorder_level: '',
    hsn_code: '',
    gst_rate: ''
  });

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
      const [itemsRes, categoriesRes, unitsRes] = await Promise.all([
        axios.get(`${API}/erp/items`),
        axios.get(`${API}/erp/items/categories`),
        axios.get(`${API}/erp/items/units`)
      ]);
      setItems(itemsRes.data);
      setCategories(categoriesRes.data);
      setUnits(unitsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        code: item.code,
        name: item.name,
        description: item.description || '',
        category_id: item.category_id,
        unit_id: item.unit_id,
        purchase_rate: item.purchase_rate.toString(),
        sale_rate: item.sale_rate.toString(),
        opening_stock: item.opening_stock.toString(),
        reorder_level: item.reorder_level.toString(),
        hsn_code: item.hsn_code || '',
        gst_rate: item.gst_rate.toString()
      });
    } else {
      setEditingItem(null);
      setFormData({
        code: '',
        name: '',
        description: '',
        category_id: categories[0]?.id || '',
        unit_id: units[0]?.id || '',
        purchase_rate: '',
        sale_rate: '',
        opening_stock: '0',
        reorder_level: '0',
        hsn_code: '',
        gst_rate: '0'
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.code || !formData.name || !formData.category_id || !formData.unit_id) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const payload = {
        ...formData,
        purchase_rate: parseFloat(formData.purchase_rate),
        sale_rate: parseFloat(formData.sale_rate),
        opening_stock: parseFloat(formData.opening_stock),
        reorder_level: parseFloat(formData.reorder_level),
        gst_rate: parseFloat(formData.gst_rate)
      };

      if (editingItem) {
        await axios.put(`${API}/erp/items/${editingItem.id}`, payload);
        toast.success('Item updated successfully!');
      } else {
        await axios.post(`${API}/erp/items`, payload);
        toast.success('Item created successfully!');
      }

      setDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving item:', error);
      toast.error(error.response?.data?.detail || 'Failed to save item');
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      await axios.delete(`${API}/erp/items/${itemId}`);
      toast.success('Item deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
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
    <div className="min-h-screen" data-testid="items-management-page">
      <Navbar />

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold gradient-text">Items & Inventory</h1>
              <p className="text-gray-600 mt-2">Manage your inventory items</p>
            </div>
            <Button className="btn-primary" onClick={() => handleOpenDialog()}>
              <Plus className="w-5 h-5 mr-2" />
              Add Item
            </Button>
          </div>

          {items.length === 0 ? (
            <Card className="glass text-center py-20">
              <CardContent>
                <Package className="w-20 h-20 mx-auto mb-6 text-gray-400" />
                <h2 className="text-2xl font-bold mb-4">No items yet</h2>
                <p className="text-gray-600 mb-6">Create your first inventory item</p>
                <Button className="btn-primary" onClick={() => handleOpenDialog()}>
                  <Plus className="w-5 h-5 mr-2" />
                  Add First Item
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item) => (
                <Card key={item.id} className="card">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                        <p className="text-sm text-gray-600">Code: {item.code}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(item)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Purchase Rate:</span>
                        <span className="font-semibold">₹{item.purchase_rate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sale Rate:</span>
                        <span className="font-semibold text-[#8b4513]">₹{item.sale_rate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Current Stock:</span>
                        <span className={`font-semibold ${item.current_stock <= item.reorder_level ? 'text-red-500' : 'text-green-600'}`}>
                          {item.current_stock}
                        </span>
                      </div>
                      {item.gst_rate > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">GST:</span>
                          <span className="font-semibold">{item.gst_rate}%</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="code">Item Code *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="ITEM001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Item Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Item name"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Item description"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <select
                id="category"
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit *</Label>
              <select
                id="unit"
                value={formData.unit_id}
                onChange={(e) => setFormData({ ...formData, unit_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>{unit.name} ({unit.symbol})</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="purchase_rate">Purchase Rate (₹) *</Label>
              <Input
                id="purchase_rate"
                type="number"
                step="0.01"
                value={formData.purchase_rate}
                onChange={(e) => setFormData({ ...formData, purchase_rate: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sale_rate">Sale Rate (₹) *</Label>
              <Input
                id="sale_rate"
                type="number"
                step="0.01"
                value={formData.sale_rate}
                onChange={(e) => setFormData({ ...formData, sale_rate: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="opening_stock">Opening Stock</Label>
              <Input
                id="opening_stock"
                type="number"
                step="0.01"
                value={formData.opening_stock}
                onChange={(e) => setFormData({ ...formData, opening_stock: e.target.value })}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reorder_level">Reorder Level</Label>
              <Input
                id="reorder_level"
                type="number"
                step="0.01"
                value={formData.reorder_level}
                onChange={(e) => setFormData({ ...formData, reorder_level: e.target.value })}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hsn_code">HSN Code</Label>
              <Input
                id="hsn_code"
                value={formData.hsn_code}
                onChange={(e) => setFormData({ ...formData, hsn_code: e.target.value })}
                placeholder="HSN Code"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gst_rate">GST Rate (%)</Label>
              <Input
                id="gst_rate"
                type="number"
                step="0.01"
                value={formData.gst_rate}
                onChange={(e) => setFormData({ ...formData, gst_rate: e.target.value })}
                placeholder="0"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-6">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="btn-primary flex-1">
              {editingItem ? 'Update Item' : 'Create Item'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default ItemsManagement;
