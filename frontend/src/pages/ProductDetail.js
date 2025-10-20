import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Product3DViewer from '@/components/Product3DViewer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, Heart, Share2, Package, Truck, Shield } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [show3D, setShow3D] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API}/products/${id}`);
      setProduct(response.data);
      if (response.data.sizes?.length > 0) {
        setSelectedSize(response.data.sizes[0]);
      }
      if (response.data.colors?.length > 0) {
        setSelectedColor(response.data.colors[0]);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Product not found');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }

    if (product.stock <= 0) {
      toast.error('Product is out of stock');
      return;
    }

    const success = await addToCart(product.id, quantity, selectedSize, selectedColor);
    if (success) {
      toast.success('Added to cart!');
    } else {
      toast.error('Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading w-12 h-12 border-4 border-[#8b4513] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!product) return null;

  const finalPrice = product.sale_price || product.price;
  const discount = product.sale_price ? Math.round(((product.price - product.sale_price) / product.price) * 100) : 0;

  return (
    <div className="min-h-screen" data-testid="product-detail-page">
      <Navbar />

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Product Image / 3D Viewer */}
            <div className="space-y-4">
              <Tabs value={show3D ? '3d' : 'images'} onValueChange={(v) => setShow3D(v === '3d')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="3d" data-testid="3d-view-tab">3D View</TabsTrigger>
                  <TabsTrigger value="images" data-testid="images-view-tab">Images</TabsTrigger>
                </TabsList>
                <TabsContent value="3d" className="mt-4">
                  <div className="h-[500px] rounded-2xl overflow-hidden">
                    <Product3DViewer product={product} />
                  </div>
                </TabsContent>
                <TabsContent value="images" className="mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    {product.images.map((img, index) => (
                      <img
                        key={index}
                        src={img}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-64 object-cover rounded-xl"
                      />
                    ))}
                    {product.images.length === 0 && (
                      <img
                        src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600"
                        alt={product.name}
                        className="w-full h-64 object-cover rounded-xl col-span-2"
                      />
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <Badge className="mb-3">{product.category.replace('_', ' ').toUpperCase()}</Badge>
                <h1 className="text-3xl sm:text-4xl font-bold mb-4">{product.name}</h1>
                
                <div className="flex items-center space-x-4 mb-4">
                  {product.sale_price ? (
                    <>
                      <span className="text-4xl font-bold text-[#8b4513]">₹{product.sale_price}</span>
                      <span className="text-2xl text-gray-500 line-through">₹{product.price}</span>
                      <Badge variant="destructive" className="text-sm">{discount}% OFF</Badge>
                    </>
                  ) : (
                    <span className="text-4xl font-bold text-[#8b4513]">₹{product.price}</span>
                  )}
                </div>

                <p className="text-gray-600 text-lg">{product.description}</p>
              </div>

              {/* Sizes */}
              {product.sizes?.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold mb-3">Select Size</label>
                  <div className="flex flex-wrap gap-3">
                    {product.sizes.map((size) => (
                      <Button
                        key={size}
                        variant={selectedSize === size ? 'default' : 'outline'}
                        onClick={() => setSelectedSize(size)}
                        data-testid={`size-${size}`}
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Colors */}
              {product.colors?.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold mb-3">Select Color</label>
                  <div className="flex flex-wrap gap-3">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-10 h-10 rounded-full border-2 ${
                          selectedColor === color ? 'border-[#8b4513] ring-2 ring-offset-2 ring-[#8b4513]' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                        data-testid={`color-${color}`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <label className="block text-sm font-semibold mb-3">Quantity</label>
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    data-testid="decrease-quantity"
                  >
                    -
                  </Button>
                  <span className="text-xl font-semibold w-12 text-center" data-testid="quantity-display">{quantity}</span>
                  <Button
                    variant="outline"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    data-testid="increase-quantity"
                  >
                    +
                  </Button>
                  <span className="text-sm text-gray-500">({product.stock} available)</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className="btn-primary flex-1"
                  data-testid="add-to-cart-button"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                </Button>
                <Button variant="outline" size="icon" data-testid="wishlist-button">
                  <Heart className="w-5 h-5" />
                </Button>
                <Button variant="outline" size="icon" data-testid="share-button">
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>

              {/* Features */}
              <Card className="glass">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center space-x-3">
                    <Package className="w-5 h-5 text-[#8b4513]" />
                    <span className="text-sm">Easy Returns & Exchange</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Truck className="w-5 h-5 text-[#8b4513]" />
                    <span className="text-sm">Free Shipping on orders above ₹999</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-[#8b4513]" />
                    <span className="text-sm">100% Quality Guaranteed</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;
