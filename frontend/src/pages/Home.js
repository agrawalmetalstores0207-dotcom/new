import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, TrendingUp, ShoppingBag, Bot } from 'lucide-react';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes] = await Promise.all([
        axios.get(`${API}/products?is_featured=true&limit=4`)
      ]);
      setFeaturedProducts(productsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" data-testid="home-page">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 fade-in">
              <div className="inline-block px-4 py-2 bg-[#8b4513]/10 rounded-full text-[#8b4513] text-sm font-semibold">
                ✨ Welcome to Fatima Collection
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                Elegant Fashion,
                <span className="gradient-text block">Timeless Style</span>
              </h1>
              <p className="text-lg text-gray-600">
                Discover our exquisite collection of dress materials, kurtis, and cotton sets.
                Experience fashion with AI-powered 3D visualization.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/products">
                  <Button className="btn-primary group" data-testid="shop-now-button">
                    Shop Now
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Button className="btn-secondary" data-testid="explore-3d-button">
                  Explore 3D View
                </Button>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative fade-in">
              <div className="glass rounded-3xl p-8 transform hover:scale-105 transition-transform duration-500">
                <img
                  src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&h=700&fit=crop"
                  alt="Fashion Collection"
                  className="w-full h-[500px] object-cover rounded-2xl shadow-2xl"
                />
                <div className="absolute top-12 right-12 glass rounded-2xl p-4">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-[#8b4513]" />
                    <span className="text-sm font-semibold">AI-Powered</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Why Choose Fatima Collection?</h2>
            <p className="text-gray-600 text-lg">Experience the future of fashion shopping</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="card group cursor-pointer">
              <CardContent className="p-6">
                <div className="w-14 h-14 bg-gradient-to-br from-[#8b4513] to-[#d4a574] rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <ShoppingBag className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">3D Product View</h3>
                <p className="text-gray-600">Rotate, zoom, and explore products in stunning 3D before you buy.</p>
              </CardContent>
            </Card>

            <Card className="card group cursor-pointer">
              <CardContent className="p-6">
                <div className="w-14 h-14 bg-gradient-to-br from-[#8b4513] to-[#d4a574] rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Bot className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">AI Assistant</h3>
                <p className="text-gray-600">Get personalized recommendations and styling advice from our AI.</p>
              </CardContent>
            </Card>

            <Card className="card group cursor-pointer">
              <CardContent className="p-6">
                <div className="w-14 h-14 bg-gradient-to-br from-[#8b4513] to-[#d4a574] rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Trending Styles</h3>
                <p className="text-gray-600">Stay updated with the latest fashion trends and collections.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-2">Featured Collection</h2>
              <p className="text-gray-600">Handpicked styles just for you</p>
            </div>
            <Link to="/products">
              <Button className="btn-secondary" data-testid="view-all-button">
                View All
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="loading w-8 h-8 border-4 border-[#8b4513] border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : (
            <div className="product-grid">
              {featuredProducts.map((product) => (
                <Link key={product.id} to={`/products/${product.id}`}>
                  <Card className="card overflow-hidden h-full" data-testid={`product-card-${product.id}`}>
                    <div className="relative">
                      <img
                        src={product.images[0] || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400'}
                        alt={product.name}
                        className="w-full h-64 object-cover"
                      />
                      {product.sale_price && (
                        <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                          SALE
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                      <div className="flex items-center justify-between">
                        <div>
                          {product.sale_price ? (
                            <div className="flex items-center space-x-2">
                              <span className="text-xl font-bold text-[#8b4513]">₹{product.sale_price}</span>
                              <span className="text-sm text-gray-500 line-through">₹{product.price}</span>
                            </div>
                          ) : (
                            <span className="text-xl font-bold text-[#8b4513]">₹{product.price}</span>
                          )}
                        </div>
                        <Button size="sm" className="btn-primary" data-testid={`view-product-${product.id}`}>
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-4 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">Shop by Category</h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { name: 'Dress Materials', image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=400', category: 'dress_material' },
              { name: 'Kurtis', image: 'https://images.unsplash.com/photo-1583391733975-830022e63bbb?w=400', category: 'kurti' },
              { name: 'Cotton Sets', image: 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=400', category: 'cotton_set' },
              { name: 'Readymade', image: 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=400', category: 'readymade' },
            ].map((cat, index) => (
              <Link key={index} to={`/products?category=${cat.category}`}>
                <Card className="card overflow-hidden group cursor-pointer" data-testid={`category-${cat.category}`}>
                  <div className="relative">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                      <h3 className="text-white font-bold text-xl p-4">{cat.name}</h3>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
