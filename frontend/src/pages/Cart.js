import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCart } from '@/context/CartContext';
import { Trash2, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Cart = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, fetchCart } = useCart();
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCartDetails();
  }, [cart]);

  const fetchCartDetails = async () => {
    if (!cart || !cart.items || cart.items.length === 0) {
      setLoading(false);
      return;
    }

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
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId) => {
    const success = await removeFromCart(productId);
    if (success) {
      toast.success('Item removed from cart');
    } else {
      toast.error('Failed to remove item');
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading w-12 h-12 border-4 border-[#8b4513] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const isEmpty = !cart || !cart.items || cart.items.length === 0;
  const total = calculateTotal();

  return (
    <div className="min-h-screen" data-testid="cart-page">
      <Navbar />

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold mb-8 gradient-text">Shopping Cart</h1>

          {isEmpty ? (
            <Card className="glass text-center py-20">
              <CardContent>
                <ShoppingBag className="w-20 h-20 mx-auto mb-6 text-gray-400" />
                <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
                <p className="text-gray-600 mb-6">Add some products to get started!</p>
                <Link to="/products">
                  <Button className="btn-primary" data-testid="continue-shopping-button">
                    Continue Shopping
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cart.items.map((item) => {
                  const product = products[item.product_id];
                  if (!product) return null;

                  const price = product.sale_price || product.price;
                  const itemTotal = price * item.quantity;

                  return (
                    <Card key={`${item.product_id}-${item.size}-${item.color}`} className="card" data-testid={`cart-item-${item.product_id}`}>
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <Link to={`/products/${product.id}`}>
                            <img
                              src={product.images[0] || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200'}
                              alt={product.name}
                              className="w-24 h-24 object-cover rounded-lg"
                            />
                          </Link>
                          <div className="flex-1">
                            <Link to={`/products/${product.id}`}>
                              <h3 className="font-bold text-lg mb-1 hover:text-[#8b4513]">{product.name}</h3>
                            </Link>
                            <div className="text-sm text-gray-600 space-y-1">
                              {item.size && <p>Size: {item.size}</p>}
                              {item.color && (
                                <p className="flex items-center">
                                  Color: 
                                  <span
                                    className="inline-block w-4 h-4 rounded-full ml-2 border border-gray-300"
                                    style={{ backgroundColor: item.color }}
                                  />
                                </p>
                              )}
                              <p>Quantity: {item.quantity}</p>
                            </div>
                            <div className="mt-2">
                              <span className="text-xl font-bold text-[#8b4513]">₹{itemTotal.toFixed(2)}</span>
                              {product.sale_price && (
                                <span className="text-sm text-gray-500 line-through ml-2">
                                  ₹{(product.price * item.quantity).toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemove(item.product_id)}
                            className="text-red-500 hover:text-red-700"
                            data-testid={`remove-item-${item.product_id}`}
                          >
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="glass sticky top-24">
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
                    
                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span className="font-semibold">₹{total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span className="font-semibold">{total >= 999 ? 'FREE' : '₹50'}</span>
                      </div>
                      <div className="border-t pt-4">
                        <div className="flex justify-between text-lg font-bold">
                          <span>Total</span>
                          <span className="text-[#8b4513]" data-testid="cart-total">
                            ₹{(total + (total >= 999 ? 0 : 50)).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => navigate('/checkout')}
                      className="w-full btn-primary"
                      data-testid="proceed-to-checkout"
                    >
                      Proceed to Checkout
                    </Button>

                    <Link to="/products">
                      <Button variant="outline" className="w-full mt-3" data-testid="continue-shopping">
                        Continue Shopping
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Cart;
