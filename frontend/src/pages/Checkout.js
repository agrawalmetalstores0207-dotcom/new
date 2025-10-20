import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, fetchCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState({});
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [shippingAddress, setShippingAddress] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    address_line: '',
    city: '',
    state: '',
    pincode: ''
  });

  useEffect(() => {
    if (!user) {
      toast.error('Please login to checkout');
      navigate('/products');
      return;
    }

    if (!cart || !cart.items || cart.items.length === 0) {
      toast.error('Your cart is empty');
      navigate('/cart');
      return;
    }

    fetchCartDetails();
  }, [user, cart]);

  const fetchCartDetails = async () => {
    if (!cart || !cart.items) return;

    try {
      const productPromises = cart.items.map(item =>
        axios.get(`${API}/products/${item.product_id}`)
      );
      const responses = await Promise.all(productPromises);
      
      const productsMap = {};
      responses.forEach(res => {
        productsMap[res.data.id] = res.data;
      });
      setProducts(productsMap);
    } catch (error) {
      console.error('Error fetching cart details:', error);
    }
  };

  const calculateTotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => {
      const product = products[item.product_id];
      if (!product) return total;
      const price = product.sale_price || product.price;
      return total + (price * item.quantity);
    }, 0);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        items: cart.items,
        payment_method: paymentMethod,
        shipping_address: shippingAddress
      };

      const response = await axios.post(`${API}/orders`, orderData);
      toast.success('Order placed successfully!');
      await fetchCart();
      navigate(`/orders`);
    } catch (error) {
      console.error('Order placement error:', error);
      toast.error(error.response?.data?.detail || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const total = calculateTotal();
  const shipping = total >= 999 ? 0 : 50;
  const finalTotal = total + shipping;

  return (
    <div className="min-h-screen" data-testid="checkout-page">
      <Navbar />

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold mb-8 gradient-text">Checkout</h1>

          <form onSubmit={handlePlaceOrder}>
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Shipping & Payment */}
              <div className="lg:col-span-2 space-y-6">
                {/* Shipping Address */}
                <Card className="card">
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold mb-6">Shipping Address</h2>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="full_name">Full Name *</Label>
                        <Input
                          id="full_name"
                          value={shippingAddress.full_name}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, full_name: e.target.value })}
                          required
                          data-testid="shipping-name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={shippingAddress.phone}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                          required
                          data-testid="shipping-phone"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="address_line">Address *</Label>
                        <Input
                          id="address_line"
                          value={shippingAddress.address_line}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, address_line: e.target.value })}
                          required
                          data-testid="shipping-address"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          value={shippingAddress.city}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                          required
                          data-testid="shipping-city"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State *</Label>
                        <Input
                          id="state"
                          value={shippingAddress.state}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                          required
                          data-testid="shipping-state"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pincode">Pincode *</Label>
                        <Input
                          id="pincode"
                          value={shippingAddress.pincode}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, pincode: e.target.value })}
                          required
                          data-testid="shipping-pincode"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Method */}
                <Card className="card">
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold mb-6">Payment Method</h2>
                    
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                      <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:border-[#8b4513]" data-testid="payment-cod">
                        <RadioGroupItem value="cod" id="cod" />
                        <Label htmlFor="cod" className="cursor-pointer flex-1">
                          <div className="font-semibold">Cash on Delivery</div>
                          <div className="text-sm text-gray-600">Pay when you receive</div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:border-[#8b4513]" data-testid="payment-upi">
                        <RadioGroupItem value="upi" id="upi" />
                        <Label htmlFor="upi" className="cursor-pointer flex-1">
                          <div className="font-semibold">UPI (Mocked)</div>
                          <div className="text-sm text-gray-600">PhonePe, Google Pay, Paytm</div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:border-[#8b4513]" data-testid="payment-card">
                        <RadioGroupItem value="card" id="card" />
                        <Label htmlFor="card" className="cursor-pointer flex-1">
                          <div className="font-semibold">Credit/Debit Card (Mocked)</div>
                          <div className="text-sm text-gray-600">Visa, Mastercard, Rupay</div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="glass sticky top-24">
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
                    
                    <div className="space-y-3 mb-6">
                      {cart?.items?.map((item) => {
                        const product = products[item.product_id];
                        if (!product) return null;
                        const price = product.sale_price || product.price;
                        return (
                          <div key={item.product_id} className="flex justify-between text-sm">
                            <span>{product.name} x {item.quantity}</span>
                            <span>₹{(price * item.quantity).toFixed(2)}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="space-y-3 border-t pt-4">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span className="font-semibold">₹{total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span className="font-semibold">{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                      </div>
                      <div className="border-t pt-3">
                        <div className="flex justify-between text-xl font-bold">
                          <span>Total</span>
                          <span className="text-[#8b4513]" data-testid="order-total">₹{finalTotal.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full btn-primary mt-6"
                      data-testid="place-order-button"
                    >
                      {loading ? 'Placing Order...' : 'Place Order'}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Checkout;
