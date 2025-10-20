import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory && selectedCategory !== 'all') {
        params.category = selectedCategory;
      }
      if (searchQuery) {
        params.search = searchQuery;
      }

      const response = await axios.get(`${API}/products`, { params });
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    if (value !== 'all') {
      setSearchParams({ category: value });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="min-h-screen" data-testid="products-page">
      <Navbar />

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 gradient-text">Our Collection</h1>
            <p className="text-gray-600 text-lg">Explore our elegant range of fashion products</p>
          </div>

          {/* Filters */}
          <div className="glass rounded-2xl p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="search-input"
                  />
                </div>
              </form>

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-full md:w-[200px]" data-testid="category-filter">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="dress_material">Dress Materials</SelectItem>
                  <SelectItem value="kurti">Kurtis</SelectItem>
                  <SelectItem value="cotton_set">Cotton Sets</SelectItem>
                  <SelectItem value="readymade">Readymade</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={fetchProducts} className="btn-primary" data-testid="apply-filter-button">
                <Filter className="w-4 h-4 mr-2" />
                Apply
              </Button>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="text-center py-20">
              <div className="loading w-12 h-12 border-4 border-[#8b4513] border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-600 text-lg">No products found</p>
            </div>
          ) : (
            <div className="product-grid">
              {products.map((product) => (
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
                          {Math.round(((product.price - product.sale_price) / product.price) * 100)}% OFF
                        </div>
                      )}
                      {product.stock <= 0 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-white font-bold text-lg">Out of Stock</span>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <div className="text-xs text-gray-500 uppercase mb-1">{product.category.replace('_', ' ')}</div>
                      <h3 className="font-bold text-lg mb-2 line-clamp-2">{product.name}</h3>
                      <div className="flex items-center justify-between mt-3">
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
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Products;
