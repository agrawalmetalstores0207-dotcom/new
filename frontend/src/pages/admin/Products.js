import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminProducts = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'kurti',
    price: '',
    sale_price: '',
    stock: '',
    images: '',
    sizes: '',
    colors: '',
    fabric: '',
    brand: '',
    tags: '',
    is_featured: false,
    is_trending: false
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      toast.error('Admin access required');
      navigate('/');
      return;
    }
    fetchProducts();
  }, [user]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products?limit=100`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setUploadedImages(product.images || []);
      setFormData({
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price.toString(),
        sale_price: product.sale_price?.toString() || '',
        stock: product.stock.toString(),
        images: product.images.join(', '),
        sizes: product.sizes.join(', '),
        colors: product.colors.join(', '),
        fabric: product.fabric || '',
        brand: product.brand || '',
        tags: product.tags.join(', '),
        is_featured: product.is_featured,
        is_trending: product.is_trending
      });
    } else {
      setEditingProduct(null);
      setUploadedImages([]);
      setFormData({
        name: '',
        description: '',
        category: 'kurti',
        price: '',
        sale_price: '',
        stock: '',
        images: '',
        sizes: '',
        colors: '',
        fabric: '',
        brand: '',
        tags: '',
        is_featured: false,
        is_trending: false
      });
    }
    setModalOpen(true);
  };

  const handleImageUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image file`);
          return null;
        }

        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post(`${API}/products/upload-image`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        return `${process.env.REACT_APP_BACKEND_URL}${response.data.url}`;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const validUrls = uploadedUrls.filter(url => url !== null);
      
      const newImages = [...uploadedImages, ...validUrls];
      setUploadedImages(newImages);
      setFormData({ ...formData, images: newImages.join(', ') });
      
      toast.success(`${validUrls.length} image(s) uploaded successfully!`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    const newImages = uploadedImages.filter((_, index) => index !== indexToRemove);
    setUploadedImages(newImages);
    setFormData({ ...formData, images: newImages.join(', ') });
    toast.success('Image removed');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Use uploaded images if available, otherwise use manual URLs
    const imageUrls = uploadedImages.length > 0 
      ? uploadedImages 
      : formData.images.split(',').map(s => s.trim()).filter(s => s);
    
    const productData = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      price: parseFloat(formData.price),
      sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
      stock: parseInt(formData.stock),
      images: imageUrls,
      sizes: formData.sizes.split(',').map(s => s.trim()).filter(s => s),
      colors: formData.colors.split(',').map(s => s.trim()).filter(s => s),
      fabric: formData.fabric || null,
      brand: formData.brand || null,
      tags: formData.tags.split(',').map(s => s.trim()).filter(s => s),
      is_featured: formData.is_featured,
      is_trending: formData.is_trending
    };

    try {
      if (editingProduct) {
        await axios.put(`${API}/products/${editingProduct.id}`, productData);
        toast.success('Product updated successfully');
      } else {
        await axios.post(`${API}/products`, productData);
        toast.success('Product created successfully');
      }
      setModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(error.response?.data?.detail || 'Failed to save product');
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await axios.delete(`${API}/products/${productId}`);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
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
    <div className="min-h-screen" data-testid="admin-products-page">
      <Navbar />

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold gradient-text">Manage Products</h1>
            <Button onClick={() => handleOpenModal()} className="btn-primary" data-testid="add-product-button">
              <Plus className="w-5 h-5 mr-2" />
              Add Product
            </Button>
          </div>

          <div className="product-grid">
            {products.map((product) => (
              <Card key={product.id} className="card overflow-hidden" data-testid={`admin-product-${product.id}`}>
                <div className="relative">
                  <img
                    src={product.images[0] || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400'}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  {product.is_featured && (
                    <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-bold">
                      FEATURED
                    </div>
                  )}
                  {product.is_trending && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                      TRENDING
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg mb-2 line-clamp-1">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{product.category.replace('_', ' ')}</p>
                  <p className="text-lg font-bold text-[#8b4513] mb-3">₹{product.price}</p>
                  <p className="text-sm text-gray-600 mb-3">Stock: {product.stock}</p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleOpenModal(product)}
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      data-testid={`edit-product-${product.id}`}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(product.id)}
                      size="sm"
                      variant="destructive"
                      data-testid={`delete-product-${product.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="product-form-modal">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  data-testid="product-name-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger data-testid="product-category-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dress_material">Dress Material</SelectItem>
                    <SelectItem value="kurti">Kurti</SelectItem>
                    <SelectItem value="cotton_set">Cotton Set</SelectItem>
                    <SelectItem value="readymade">Readymade</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                required
                data-testid="product-description-input"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (₹) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  data-testid="product-price-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sale_price">Sale Price (₹)</Label>
                <Input
                  id="sale_price"
                  type="number"
                  value={formData.sale_price}
                  onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                  data-testid="product-sale-price-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">Stock *</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  required
                  data-testid="product-stock-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="images">Product Images</Label>
              
              {/* Upload Button */}
              <div className="mb-3">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="product-image-upload"
                  data-testid="product-image-upload-input"
                />
                <label htmlFor="product-image-upload">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full cursor-pointer"
                    disabled={uploadingImage}
                    asChild
                    data-testid="upload-product-image-button"
                  >
                    <span>
                      {uploadingImage ? 'Uploading...' : 'Upload Images (Mobile/Computer)'}
                    </span>
                  </Button>
                </label>
              </div>

              {/* Image Preview */}
              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {uploadedImages.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img}
                        alt={`Product ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        data-testid={`remove-image-${index}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Manual URL Input (Optional) */}
              <Input
                id="images"
                value={formData.images}
                onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                placeholder="Or enter image URLs (comma-separated)"
                data-testid="product-images-input"
              />
              <p className="text-xs text-gray-500">
                Upload images above or paste URLs manually
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sizes">Sizes (comma-separated)</Label>
                <Input
                  id="sizes"
                  value={formData.sizes}
                  onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                  placeholder="S, M, L, XL"
                  data-testid="product-sizes-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="colors">Colors (comma-separated)</Label>
                <Input
                  id="colors"
                  value={formData.colors}
                  onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                  placeholder="#FF0000, #00FF00"
                  data-testid="product-colors-input"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fabric">Fabric</Label>
                <Input
                  id="fabric"
                  value={formData.fabric}
                  onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
                  data-testid="product-fabric-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  data-testid="product-brand-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="trending, sale, new"
                data-testid="product-tags-input"
              />
            </div>

            <div className="flex gap-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="w-4 h-4"
                  data-testid="product-featured-checkbox"
                />
                <span>Featured Product</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_trending}
                  onChange={(e) => setFormData({ ...formData, is_trending: e.target.checked })}
                  className="w-4 h-4"
                  data-testid="product-trending-checkbox"
                />
                <span>Trending Product</span>
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="btn-primary flex-1" data-testid="save-product-button">
                {editingProduct ? 'Update Product' : 'Create Product'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)} data-testid="cancel-button">
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default AdminProducts;
