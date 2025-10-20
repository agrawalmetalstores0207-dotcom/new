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
import { Plus, Receipt } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ExpenseVouchers = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vouchers, setVouchers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    voucher_number: '',
    voucher_date: new Date().toISOString().split('T')[0],
    expense_account_id: '',
    expense_account_name: '',
    amount: '',
    payment_mode: 'cash',
    paid_from_account_id: '',
    notes: ''
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
      const [vouchersRes, accountsRes] = await Promise.all([
        axios.get(`${API}/erp/vouchers/expense`),
        axios.get(`${API}/erp/accounts`)
      ]);
      setVouchers(vouchersRes.data);
      setAccounts(accountsRes.data);
      
      // Set default expense and cash accounts
      const expenseAccounts = accountsRes.data.filter(a => a.account_type === 'expense');
      const cashAccount = accountsRes.data.find(a => a.code === '1001');
      if (expenseAccounts.length > 0) {
        setFormData(prev => ({
          ...prev,
          expense_account_id: expenseAccounts[0].id,
          expense_account_name: expenseAccounts[0].name,
          paid_from_account_id: cashAccount?.id || ''
        }));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    const nextVoucherNumber = `EXP-${String(vouchers.length + 1).padStart(4, '0')}`;
    const expenseAccounts = accounts.filter(a => a.account_type === 'expense');
    const cashAccount = accounts.find(a => a.code === '1001');
    setFormData({
      voucher_number: nextVoucherNumber,
      voucher_date: new Date().toISOString().split('T')[0],
      expense_account_id: expenseAccounts[0]?.id || '',
      expense_account_name: expenseAccounts[0]?.name || '',
      amount: '',
      payment_mode: 'cash',
      paid_from_account_id: cashAccount?.id || '',
      notes: ''
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.voucher_number || !formData.expense_account_id || !formData.amount) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount)
      };

      await axios.post(`${API}/erp/vouchers/expense`, payload);
      toast.success('Expense voucher created successfully!');
      setDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error creating expense:', error);
      toast.error(error.response?.data?.detail || 'Failed to create expense');
    }
  };

  const expenseAccounts = accounts.filter(a => a.account_type === 'expense');
  const cashBankAccounts = accounts.filter(a => a.account_type === 'asset' && (a.code.startsWith('100')));

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
              <h1 className="text-4xl sm:text-5xl font-bold gradient-text">Expense Vouchers</h1>
              <p className="text-gray-600 mt-2">Record business expenses</p>
            </div>
            <Button className="btn-primary" onClick={handleOpenDialog}>
              <Plus className="w-5 h-5 mr-2" />
              Add Expense
            </Button>
          </div>

          {vouchers.length === 0 ? (
            <Card className="glass text-center py-20">
              <CardContent>
                <Receipt className="w-20 h-20 mx-auto mb-6 text-gray-400" />
                <h2 className="text-2xl font-bold mb-4">No expenses yet</h2>
                <Button className="btn-primary" onClick={handleOpenDialog}>
                  <Plus className="w-5 h-5 mr-2" />
                  Add First Expense
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
                        <p className="text-sm text-gray-600">{voucher.expense_account_name}</p>
                        <p className="text-sm text-gray-600">Date: {voucher.voucher_date}</p>
                        <p className="text-sm text-gray-600">Mode: {voucher.payment_mode}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-red-600">₹{voucher.amount.toFixed(2)}</p>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Expense Voucher</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="voucher_number">Voucher Number *</Label>
              <Input id="voucher_number" value={formData.voucher_number} onChange={(e) => setFormData({ ...formData, voucher_number: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="voucher_date">Date *</Label>
              <Input id="voucher_date" type="date" value={formData.voucher_date} onChange={(e) => setFormData({ ...formData, voucher_date: e.target.value })} />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="expense_account">Expense Account *</Label>
              <select
                id="expense_account"
                value={formData.expense_account_id}
                onChange={(e) => {
                  const account = expenseAccounts.find(a => a.id === e.target.value);
                  setFormData({ ...formData, expense_account_id: e.target.value, expense_account_name: account?.name || '' });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                {expenseAccounts.map((account) => (
                  <option key={account.id} value={account.id}>{account.name} ({account.code})</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹) *</Label>
              <Input id="amount" type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment_mode">Payment Mode *</Label>
              <select
                id="payment_mode"
                value={formData.payment_mode}
                onChange={(e) => setFormData({ ...formData, payment_mode: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="cash">Cash</option>
                <option value="bank">Bank Transfer</option>
                <option value="upi">UPI</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="paid_from">Paid From *</Label>
              <select
                id="paid_from"
                value={formData.paid_from_account_id}
                onChange={(e) => setFormData({ ...formData, paid_from_account_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                {cashBankAccounts.map((account) => (
                  <option key={account.id} value={account.id}>{account.name} ({account.code})</option>
                ))}
              </select>
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input id="notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Additional notes" />
            </div>
          </div>
          <div className="flex gap-2 mt-6">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleSubmit} className="btn-primary flex-1">Create Expense</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default ExpenseVouchers;