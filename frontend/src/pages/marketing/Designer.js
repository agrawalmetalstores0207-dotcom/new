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
  const [unsplashQuery, setUnsplashQuery] = useState('');
  const [backgroundImage, setBackgroundImage] = useState('');

  if (!user || user.role !== 'admin') {
    toast.error('Admin access required');
    navigate('/admin');
    return null;
  }

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
            </div>

            {/* Center - Canvas */}
            <div className="lg:col-span-2">
              <Card className="card h-full">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">Canvas</h3>
                    <Button onClick={handleDownload} className="btn-primary" data-testid="download-button">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
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
