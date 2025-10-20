import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Download, Image as ImageIcon, Type, Layout, Upload, Save, FolderOpen, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const templates = [
  { id: 1, name: 'Sale Banner', width: 1200, height: 628, bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: 2, name: 'Instagram Post', width: 1080, height: 1080, bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { id: 3, name: 'Story', width: 1080, height: 1920, bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { id: 4, name: 'Offer Poster', width: 800, height: 1200, bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
];

const MarketingDesigner = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]);
  const [designText, setDesignText] = useState('Big Sale! Up to 50% OFF');
  const [fontSize, setFontSize] = useState(48);
  const [textColor, setTextColor] = useState('#ffffff');
  const [backgroundImage, setBackgroundImage] = useState('');
  const [savedDesigns, setSavedDesigns] = useState([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [designName, setDesignName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loadingDesigns, setLoadingDesigns] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      toast.error('Admin access required');
      navigate('/admin');
      return;
    }
    fetchSavedDesigns();
  }, [user]);

  const fetchSavedDesigns = async () => {
    setLoadingDesigns(true);
    try {
      const response = await axios.get(`${API}/marketing/designs`);
      setSavedDesigns(response.data);
    } catch (error) {
      console.error('Error fetching designs:', error);
    } finally {
      setLoadingDesigns(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API}/marketing/upload-background`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const imageUrl = `${process.env.REACT_APP_BACKEND_URL}${response.data.url}`;
      setBackgroundImage(imageUrl);
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveDesign = async () => {
    if (!designName.trim()) {
      toast.error('Please enter a design name');
      return;
    }

    try {
      const designData = {
        name: designName,
        template: selectedTemplate.name,
        design_text: designText,
        font_size: fontSize,
        text_color: textColor,
        background_image: backgroundImage || null,
        background_gradient: !backgroundImage ? selectedTemplate.bg : null,
        width: selectedTemplate.width,
        height: selectedTemplate.height
      };

      await axios.post(`${API}/marketing/designs`, designData);
      toast.success('Design saved successfully!');
      setSaveDialogOpen(false);
      setDesignName('');
      fetchSavedDesigns();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save design');
    }
  };

  const handleLoadDesign = (design) => {
    setDesignText(design.design_text);
    setFontSize(design.font_size);
    setTextColor(design.text_color);
    setBackgroundImage(design.background_image || '');
    
    const template = templates.find(t => t.name === design.template);
    if (template) {
      setSelectedTemplate(template);
    }
    
    toast.success(`Loaded: ${design.name}`);
  };

  const handleDeleteDesign = async (designId) => {
    if (!window.confirm('Are you sure you want to delete this design?')) return;

    try {
      await axios.delete(`${API}/marketing/designs/${designId}`);
      toast.success('Design deleted');
      fetchSavedDesigns();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete design');
    }
  };

  const handleDownload = () => {
    toast.success('Design would be downloaded in production!');
  };

  const sampleImages = [
    'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400',
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400',
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400',
    'https://images.unsplash.com/photo-1558769132-cb1aea1f1f57?w=400',
  ];

  return (
    <div className="min-h-screen" data-testid="marketing-designer">
      <Navbar />

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold mb-2 gradient-text">Marketing Designer</h1>
          <p className="text-gray-600 text-lg mb-8">Create stunning posters and banners for your campaigns</p>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Panel - Tools */}
            <div className="lg:col-span-1 space-y-4">
              {/* Templates */}
              <Card className="card">
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg mb-3 flex items-center">
                    <Layout className="w-5 h-5 mr-2 text-[#8b4513]" />
                    Templates
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {templates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => setSelectedTemplate(template)}
                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                          selectedTemplate.id === template.id
                            ? 'border-[#8b4513] bg-[#8b4513]/10'
                            : 'border-gray-200 hover:border-[#8b4513]/50'
                        }`}
                        data-testid={`template-${template.id}`}
                      >
                        {template.name}
                        <div className="text-xs text-gray-500 mt-1">
                          {template.width}x{template.height}
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Text Editor */}
              <Card className="card">
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg mb-3 flex items-center">
                    <Type className="w-5 h-5 mr-2 text-[#8b4513]" />
                    Text
                  </h3>
                  <div className="space-y-3">
                    <Input
                      value={designText}
                      onChange={(e) => setDesignText(e.target.value)}
                      placeholder="Enter your text..."
                      data-testid="design-text-input"
                    />
                    <div>
                      <label className="text-sm font-medium mb-2 block">Font Size</label>
                      <Input
                        type="number"
                        value={fontSize}
                        onChange={(e) => setFontSize(Number(e.target.value))}
                        min="12"
                        max="120"
                        data-testid="font-size-input"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Text Color</label>
                      <Input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        data-testid="text-color-input"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Background Images */}
              <Card className="card">
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg mb-3 flex items-center">
                    <ImageIcon className="w-5 h-5 mr-2 text-[#8b4513]" />
                    Background Images
                  </h3>
                  
                  {/* Upload Button */}
                  <div className="mb-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="bg-upload"
                      data-testid="background-upload-input"
                    />
                    <label htmlFor="bg-upload">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full cursor-pointer"
                        disabled={uploading}
                        asChild
                        data-testid="upload-background-button"
                      >
                        <span>
                          <Upload className="w-4 h-4 mr-2" />
                          {uploading ? 'Uploading...' : 'Upload Image'}
                        </span>
                      </Button>
                    </label>
                  </div>

                  {/* Sample Images */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {sampleImages.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setBackgroundImage(img)}
                        className="rounded-lg overflow-hidden border-2 border-gray-200 hover:border-[#8b4513] transition-all"
                        data-testid={`bg-image-${index}`}
                      >
                        <img src={img} alt="Background" className="w-full h-20 object-cover" />
                      </button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setBackgroundImage('')}
                    data-testid="remove-bg-button"
                  >
                    Remove Background
                  </Button>
                </CardContent>
              </Card>

              {/* Saved Designs */}
              <Card className="card">
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg mb-3 flex items-center">
                    <FolderOpen className="w-5 h-5 mr-2 text-[#8b4513]" />
                    Saved Designs ({savedDesigns.length})
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {savedDesigns.map((design) => (
                      <div
                        key={design.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                        data-testid={`saved-design-${design.id}`}
                      >
                        <button
                          onClick={() => handleLoadDesign(design)}
                          className="flex-1 text-left text-sm font-medium hover:text-[#8b4513] truncate"
                        >
                          {design.name}
                        </button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteDesign(design.id)}
                          className="text-red-500 hover:text-red-700"
                          data-testid={`delete-design-${design.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    {savedDesigns.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">No saved designs yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Center - Canvas */}
            <div className="lg:col-span-2">
              <Card className="card h-full">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">Canvas</h3>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => setSaveDialogOpen(true)} 
                        variant="outline"
                        data-testid="save-design-button"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button onClick={handleDownload} className="btn-primary" data-testid="download-button">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>

                  {/* Design Canvas */}
                  <div
                    className="relative rounded-lg overflow-hidden shadow-2xl mx-auto"
                    style={{
                      width: '100%',
                      maxWidth: selectedTemplate.width / 2,
                      aspectRatio: `${selectedTemplate.width} / ${selectedTemplate.height}`,
                      background: backgroundImage
                        ? `url(${backgroundImage}) center/cover`
                        : selectedTemplate.bg,
                    }}
                    data-testid="design-canvas"
                  >
                    <div className="absolute inset-0 flex items-center justify-center p-8">
                      <h1
                        className="font-bold text-center break-words w-full"
                        style={{
                          fontSize: `${fontSize}px`,
                          color: textColor,
                          textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                        }}
                      >
                        {designText}
                      </h1>
                    </div>

                    {/* Watermark */}
                    <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-semibold text-gray-700">
                      Fatima Collection
                    </div>
                  </div>

                  <p className="text-sm text-gray-500 text-center mt-4">
                    Size: {selectedTemplate.width} x {selectedTemplate.height}px
                  </p>
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

export default MarketingDesigner;
