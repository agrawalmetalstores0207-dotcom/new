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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { 
  Plus, Download, Save, Image as ImageIcon, Type, Search, 
  Palette, Upload, Bold, Italic, Underline, AlignLeft, 
  AlignCenter, AlignRight, Crop, Move, Layers
} from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const UNSPLASH_ACCESS_KEY = process.env.REACT_APP_UNSPLASH_ACCESS_KEY || 'demo';

const MarketingDesignerPro = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Canvas state
  const [canvasElements, setCanvasElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [canvasBackground, setCanvasBackground] = useState('#ffffff');
  
  // Social media settings
  const [socialSettings, setSocialSettings] = useState({
    facebook_page_link: '',
    instagram_page_link: ''
  });
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareNarration, setShareNarration] = useState('');
  
  // Templates
  const templates = [
    { name: 'Instagram Post', width: 1080, height: 1080, bg: '#ffffff' },
    { name: 'Facebook Post', width: 1200, height: 630, bg: '#ffffff' },
    { name: 'Story', width: 1080, height: 1920, bg: '#ffffff' },
    { name: 'Flyer A4', width: 794, height: 1123, bg: '#ffffff' },
    { name: 'Business Card', width: 1050, height: 600, bg: '#ffffff' },
    { name: 'Banner', width: 1200, height: 400, bg: '#ffffff' },
    { name: 'Square Post', width: 800, height: 800, bg: '#ffffff' },
    { name: 'Wide Banner', width: 1500, height: 500, bg: '#ffffff' }
  ];
  
  // Text editing state
  const [editingText, setEditingText] = useState(false);
  const [textStyles, setTextStyles] = useState({
    fontSize: 32,
    fontFamily: 'Arial',
    color: '#000000',
    bold: false,
    italic: false,
    underline: false,
    align: 'left',
    shadowBlur: 0,
    shadowColor: '#000000',
    opacity: 1,
    rotation: 0
  });
  
  // Unsplash search
  const [unsplashImages, setUnsplashImages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  
  // Save dialog
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [designName, setDesignName] = useState('');
  const [savedDesigns, setSavedDesigns] = useState([]);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      toast.error('Admin access required');
      navigate('/admin');
      return;
    }
    fetchSavedDesigns();
    fetchSocialSettings();
  }, [user]);

  const fetchSocialSettings = async () => {
    try {
      const response = await axios.get(`${API}/settings/public`);
      setSocialSettings({
        facebook_page_link: response.data.facebook_page_link || '',
        instagram_page_link: response.data.instagram_page_link || ''
      });
    } catch (error) {
      console.error('Error fetching social settings:', error);
    }
  };

  const fetchSavedDesigns = async () => {
    try {
      const response = await axios.get(`${API}/marketing/designs`);
      setSavedDesigns(response.data);
    } catch (error) {
      console.error('Error fetching designs:', error);
    }
  };

  // Add text element
  const addTextElement = () => {
    const newElement = {
      id: Date.now(),
      type: 'text',
      content: 'Double click to edit',
      x: 100,
      y: 100,
      width: 300,
      height: 50,
      ...textStyles
    };
    setCanvasElements([...canvasElements, newElement]);
    setSelectedElement(newElement.id);
  };

  // Add image element
  const addImageElement = (imageUrl) => {
    const newElement = {
      id: Date.now(),
      type: 'image',
      src: imageUrl,
      x: 50,
      y: 50,
      width: 300,
      height: 200,
      opacity: 1,
      rotation: 0
    };
    setCanvasElements([...canvasElements, newElement]);
    setSelectedElement(newElement.id);
    setImageDialogOpen(false);
  };

  // Upload image
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API}/marketing/upload-background`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const imageUrl = `${process.env.REACT_APP_BACKEND_URL}${response.data.url}`;
      addImageElement(imageUrl);
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setLoading(false);
    }
  };

  // Search Unsplash
  const searchUnsplash = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const response = await axios.get(`https://api.unsplash.com/search/photos`, {
        params: { query: searchQuery, per_page: 12 },
        headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` }
      });
      setUnsplashImages(response.data.results);
    } catch (error) {
      console.error('Unsplash search error:', error);
      toast.error('Failed to search images');
    } finally {
      setLoading(false);
    }
  };

  // Update selected element
  const updateElement = (updates) => {
    setCanvasElements(canvasElements.map(el => 
      el.id === selectedElement ? { ...el, ...updates } : el
    ));
  };

  // Delete selected element
  const deleteElement = () => {
    setCanvasElements(canvasElements.filter(el => el.id !== selectedElement));
    setSelectedElement(null);
  };

  // Move element
  const moveElement = (direction) => {
    const element = canvasElements.find(el => el.id === selectedElement);
    if (!element) return;

    const moveAmount = 10;
    const updates = {};

    switch (direction) {
      case 'up': updates.y = element.y - moveAmount; break;
      case 'down': updates.y = element.y + moveAmount; break;
      case 'left': updates.x = element.x - moveAmount; break;
      case 'right': updates.x = element.x + moveAmount; break;
    }

    updateElement(updates);
  };

  // Apply text style
  const applyTextStyle = (style, value) => {
    const updates = { [style]: value };
    updateElement(updates);
    setTextStyles({ ...textStyles, [style]: value });
  };

  // Save design
  const handleSaveDesign = async () => {
    if (!designName.trim()) {
      toast.error('Please enter a design name');
      return;
    }

    try {
      await axios.post(`${API}/marketing/designs`, {
        name: designName,
        canvas_size: canvasSize,
        background: canvasBackground,
        elements: canvasElements
      });
      toast.success('Design saved successfully!');
      setSaveDialogOpen(false);
      setDesignName('');
      fetchSavedDesigns();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save design');
    }
  };

  // Load design
  const loadDesign = (design) => {
    setCanvasSize(design.canvas_size || { width: 800, height: 600 });
    setCanvasBackground(design.background || '#ffffff');
    setCanvasElements(design.elements || []);
    setSelectedElement(null);
    toast.success(`Loaded: ${design.name}`);
  };

  // Load template
  const loadTemplate = (template) => {
    setCanvasSize({ width: template.width, height: template.height });
    setCanvasBackground(template.bg);
    setCanvasElements([]);
    setSelectedElement(null);
    toast.success(`Template loaded: ${template.name}`);
  };

  // Share to social media
  const shareToSocial = (platform) => {
    if (platform === 'facebook' && !socialSettings.facebook_page_link) {
      toast.error('Facebook page link not configured. Please add it in Settings.');
      return;
    }
    if (platform === 'instagram' && !socialSettings.instagram_page_link) {
      toast.error('Instagram page link not configured. Please add it in Settings.');
      return;
    }

    // Export design first
    exportDesign();
    
    // Open social media in new tab
    const link = platform === 'facebook' 
      ? socialSettings.facebook_page_link 
      : socialSettings.instagram_page_link;
    
    window.open(link, '_blank');
    toast.success(`Opening ${platform}. Upload the downloaded image and add your narration!`);
  };

  // Export design
  const exportDesign = () => {
    // Create a temporary canvas for export
    const canvas = document.createElement('canvas');
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    const ctx = canvas.getContext('2d');

    // Draw background
    ctx.fillStyle = canvasBackground;
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

    // Draw elements
    canvasElements.forEach(element => {
      ctx.save();
      ctx.globalAlpha = element.opacity || 1;
      ctx.translate(element.x + element.width / 2, element.y + element.height / 2);
      ctx.rotate((element.rotation || 0) * Math.PI / 180);

      if (element.type === 'text') {
        ctx.font = `${element.italic ? 'italic' : ''} ${element.bold ? 'bold' : ''} ${element.fontSize}px ${element.fontFamily}`;
        ctx.fillStyle = element.color;
        ctx.textAlign = element.align;
        
        if (element.shadowBlur > 0) {
          ctx.shadowBlur = element.shadowBlur;
          ctx.shadowColor = element.shadowColor;
        }

        ctx.fillText(element.content, 0, 0);

        if (element.underline) {
          const textWidth = ctx.measureText(element.content).width;
          ctx.strokeStyle = element.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(-textWidth / 2, 5);
          ctx.lineTo(textWidth / 2, 5);
          ctx.stroke();
        }
      } else if (element.type === 'image') {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = element.src;
        ctx.drawImage(img, -element.width / 2, -element.height / 2, element.width, element.height);
      }

      ctx.restore();
    });

    // Download
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${designName || 'design'}.png`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  const selectedEl = canvasElements.find(el => el.id === selectedElement);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold gradient-text">Professional Designer</h1>
              <p className="text-gray-600 mt-1">Create stunning designs with advanced tools</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setSaveDialogOpen(true)} className="btn-primary">
                <Save className="w-4 h-4 mr-2" />
                Save Design
              </Button>
              <Button onClick={exportDesign} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4">
            {/* Left Toolbar */}
            <div className="col-span-2 space-y-2">
              <Card className="card">
                <CardContent className="p-4">
                  <h3 className="font-bold mb-4">Tools</h3>
                  <div className="space-y-2">
                    <Button onClick={addTextElement} variant="outline" className="w-full justify-start">
                      <Type className="w-4 h-4 mr-2" />
                      Add Text
                    </Button>
                    <Button onClick={() => setImageDialogOpen(true)} variant="outline" className="w-full justify-start">
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Add Image
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="upload-image"
                    />
                    <label htmlFor="upload-image" className="w-full">
                      <Button variant="outline" className="w-full justify-start" onClick={() => document.getElementById('upload-image').click()}>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Image
                      </Button>
                    </label>
                  </div>
                </CardContent>
              </Card>

              {/* Saved Designs */}
              <Card className="card">
                <CardContent className="p-4">
                  <h3 className="font-bold mb-4">Saved Designs</h3>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {savedDesigns.map((design) => (
                      <div
                        key={design.id}
                        onClick={() => loadDesign(design)}
                        className="p-2 bg-gray-100 rounded cursor-pointer hover:bg-gray-200 text-sm"
                      >
                        {design.name}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Canvas */}
            <div className="col-span-7">
              <Card className="card">
                <CardContent className="p-6">
                  <div
                    className="relative border-2 border-gray-300 rounded-lg overflow-hidden mx-auto"
                    style={{
                      width: canvasSize.width,
                      height: canvasSize.height,
                      background: canvasBackground
                    }}
                  >
                    {canvasElements.map((element) => (
                      <div
                        key={element.id}
                        onClick={() => setSelectedElement(element.id)}
                        onDoubleClick={() => {
                          if (element.type === 'text') {
                            setEditingText(element.id);
                          }
                        }}
                        className={`absolute cursor-move ${selectedElement === element.id ? 'ring-2 ring-blue-500' : ''}`}
                        style={{
                          left: element.x,
                          top: element.y,
                          width: element.width,
                          height: element.height,
                          opacity: element.opacity,
                          transform: `rotate(${element.rotation || 0}deg)`
                        }}
                      >
                        {element.type === 'text' ? (
                          editingText === element.id ? (
                            <input
                              type="text"
                              value={element.content}
                              onChange={(e) => updateElement({ content: e.target.value })}
                              onBlur={() => setEditingText(false)}
                              autoFocus
                              className="w-full h-full bg-transparent border-none outline-none"
                              style={{
                                fontSize: `${element.fontSize}px`,
                                fontFamily: element.fontFamily,
                                color: element.color,
                                fontWeight: element.bold ? 'bold' : 'normal',
                                fontStyle: element.italic ? 'italic' : 'normal',
                                textDecoration: element.underline ? 'underline' : 'none',
                                textAlign: element.align,
                                textShadow: element.shadowBlur > 0 ? `0 0 ${element.shadowBlur}px ${element.shadowColor}` : 'none'
                              }}
                            />
                          ) : (
                            <div
                              className="w-full h-full"
                              style={{
                                fontSize: `${element.fontSize}px`,
                                fontFamily: element.fontFamily,
                                color: element.color,
                                fontWeight: element.bold ? 'bold' : 'normal',
                                fontStyle: element.italic ? 'italic' : 'normal',
                                textDecoration: element.underline ? 'underline' : 'none',
                                textAlign: element.align,
                                textShadow: element.shadowBlur > 0 ? `0 0 ${element.shadowBlur}px ${element.shadowColor}` : 'none'
                              }}
                            >
                              {element.content}
                            </div>
                          )
                        ) : (
                          <img
                            src={element.src}
                            alt="Element"
                            className="w-full h-full object-cover"
                            draggable={false}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Properties Panel */}
            <div className="col-span-3 space-y-4">
              {selectedEl ? (
                <Card className="card">
                  <CardContent className="p-4">
                    <h3 className="font-bold mb-4">Properties</h3>
                    
                    {selectedEl.type === 'text' && (
                      <div className="space-y-4">
                        {/* Text Content */}
                        <div>
                          <Label>Text</Label>
                          <Input
                            value={selectedEl.content}
                            onChange={(e) => updateElement({ content: e.target.value })}
                          />
                        </div>

                        {/* Font Family */}
                        <div>
                          <Label>Font</Label>
                          <select
                            value={selectedEl.fontFamily}
                            onChange={(e) => applyTextStyle('fontFamily', e.target.value)}
                            className="w-full px-3 py-2 border rounded-md"
                          >
                            <option value="Arial">Arial</option>
                            <option value="Times New Roman">Times New Roman</option>
                            <option value="Georgia">Georgia</option>
                            <option value="Courier New">Courier New</option>
                            <option value="Verdana">Verdana</option>
                            <option value="Impact">Impact</option>
                          </select>
                        </div>

                        {/* Font Size */}
                        <div>
                          <Label>Size: {selectedEl.fontSize}px</Label>
                          <input
                            type="range"
                            min="12"
                            max="120"
                            value={selectedEl.fontSize}
                            onChange={(e) => applyTextStyle('fontSize', parseInt(e.target.value))}
                            className="w-full"
                          />
                        </div>

                        {/* Text Style Buttons */}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={selectedEl.bold ? 'default' : 'outline'}
                            onClick={() => applyTextStyle('bold', !selectedEl.bold)}
                          >
                            <Bold className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant={selectedEl.italic ? 'default' : 'outline'}
                            onClick={() => applyTextStyle('italic', !selectedEl.italic)}
                          >
                            <Italic className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant={selectedEl.underline ? 'default' : 'outline'}
                            onClick={() => applyTextStyle('underline', !selectedEl.underline)}
                          >
                            <Underline className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Text Alignment */}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={selectedEl.align === 'left' ? 'default' : 'outline'}
                            onClick={() => applyTextStyle('align', 'left')}
                          >
                            <AlignLeft className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant={selectedEl.align === 'center' ? 'default' : 'outline'}
                            onClick={() => applyTextStyle('align', 'center')}
                          >
                            <AlignCenter className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant={selectedEl.align === 'right' ? 'default' : 'outline'}
                            onClick={() => applyTextStyle('align', 'right')}
                          >
                            <AlignRight className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Text Color */}
                        <div>
                          <Label>Text Color</Label>
                          <input
                            type="color"
                            value={selectedEl.color}
                            onChange={(e) => applyTextStyle('color', e.target.value)}
                            className="w-full h-10 rounded"
                          />
                        </div>

                        {/* Shadow Effect */}
                        <div>
                          <Label>Shadow Blur: {selectedEl.shadowBlur}px</Label>
                          <input
                            type="range"
                            min="0"
                            max="50"
                            value={selectedEl.shadowBlur}
                            onChange={(e) => applyTextStyle('shadowBlur', parseInt(e.target.value))}
                            className="w-full"
                          />
                        </div>

                        {selectedEl.shadowBlur > 0 && (
                          <div>
                            <Label>Shadow Color</Label>
                            <input
                              type="color"
                              value={selectedEl.shadowColor}
                              onChange={(e) => applyTextStyle('shadowColor', e.target.value)}
                              className="w-full h-10 rounded"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Common Properties */}
                    <div className="space-y-4 mt-4">
                      {/* Position */}
                      <div>
                        <Label>Position</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            type="number"
                            value={selectedEl.x}
                            onChange={(e) => updateElement({ x: parseInt(e.target.value) })}
                            placeholder="X"
                          />
                          <Input
                            type="number"
                            value={selectedEl.y}
                            onChange={(e) => updateElement({ y: parseInt(e.target.value) })}
                            placeholder="Y"
                          />
                        </div>
                      </div>

                      {/* Size */}
                      <div>
                        <Label>Size</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            type="number"
                            value={selectedEl.width}
                            onChange={(e) => updateElement({ width: parseInt(e.target.value) })}
                            placeholder="Width"
                          />
                          <Input
                            type="number"
                            value={selectedEl.height}
                            onChange={(e) => updateElement({ height: parseInt(e.target.value) })}
                            placeholder="Height"
                          />
                        </div>
                      </div>

                      {/* Opacity */}
                      <div>
                        <Label>Opacity: {Math.round(selectedEl.opacity * 100)}%</Label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={selectedEl.opacity}
                          onChange={(e) => updateElement({ opacity: parseFloat(e.target.value) })}
                          className="w-full"
                        />
                      </div>

                      {/* Rotation */}
                      <div>
                        <Label>Rotation: {selectedEl.rotation}°</Label>
                        <input
                          type="range"
                          min="0"
                          max="360"
                          value={selectedEl.rotation}
                          onChange={(e) => updateElement({ rotation: parseInt(e.target.value) })}
                          className="w-full"
                        />
                      </div>

                      {/* Movement Controls */}
                      <div>
                        <Label>Move</Label>
                        <div className="grid grid-cols-3 gap-2">
                          <div></div>
                          <Button size="sm" onClick={() => moveElement('up')}>↑</Button>
                          <div></div>
                          <Button size="sm" onClick={() => moveElement('left')}>←</Button>
                          <div></div>
                          <Button size="sm" onClick={() => moveElement('right')}>→</Button>
                          <div></div>
                          <Button size="sm" onClick={() => moveElement('down')}>↓</Button>
                          <div></div>
                        </div>
                      </div>

                      {/* Delete */}
                      <Button onClick={deleteElement} variant="destructive" className="w-full">
                        Delete Element
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="card">
                  <CardContent className="p-4">
                    <p className="text-gray-500 text-center">Select an element to edit</p>
                  </CardContent>
                </Card>
              )}

              {/* Canvas Settings */}
              <Card className="card">
                <CardContent className="p-4">
                  <h3 className="font-bold mb-4">Canvas Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <Label>Background Color</Label>
                      <input
                        type="color"
                        value={canvasBackground}
                        onChange={(e) => setCanvasBackground(e.target.value)}
                        className="w-full h-10 rounded"
                      />
                    </div>
                    <div>
                      <Label>Canvas Size</Label>
                      <select
                        value={`${canvasSize.width}x${canvasSize.height}`}
                        onChange={(e) => {
                          const [width, height] = e.target.value.split('x').map(Number);
                          setCanvasSize({ width, height });
                        }}
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        <option value="800x600">800 x 600 (4:3)</option>
                        <option value="1024x768">1024 x 768 (4:3)</option>
                        <option value="1080x1080">1080 x 1080 (Square)</option>
                        <option value="1200x628">1200 x 628 (Facebook)</option>
                        <option value="1080x1920">1080 x 1920 (Story)</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Image Library Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search images..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchUnsplash()}
              />
              <Button onClick={searchUnsplash}>
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {unsplashImages.map((image) => (
                <img
                  key={image.id}
                  src={image.urls.small}
                  alt={image.alt_description}
                  className="w-full h-40 object-cover rounded cursor-pointer hover:opacity-75"
                  onClick={() => addImageElement(image.urls.regular)}
                />
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Save Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Design</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Design Name</Label>
              <Input
                value={designName}
                onChange={(e) => setDesignName(e.target.value)}
                placeholder="Enter design name"
              />
            </div>
            <Button onClick={handleSaveDesign} className="btn-primary w-full">
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default MarketingDesignerPro;
