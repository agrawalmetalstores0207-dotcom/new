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
import { User, Lock, Phone, Facebook, Instagram, Save, Package } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminSettings = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    username: '',
    mobile: '',
    facebook_page_link: '',
    instagram_page_link: '',
    logo_url: ''
  });
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      toast.error('Admin access required');
      navigate('/admin');
      return;
    }
    fetchSettings();
  }, [user]);

  const fetchSettings = async () => {
    try {
      // Load current user settings
      setSettings({
        username: user.username || '',
        mobile: user.mobile || '',
        facebook_page_link: user.facebook_page_link || '',
        instagram_page_link: user.instagram_page_link || '',
        logo_url: user.logo_url || ''
      });
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleUpdateProfile = async () => {
    if (!settings.username || !settings.mobile) {
      toast.error('Username and mobile are required');
      return;
    }

    setLoading(true);
    try {
      await axios.put(`${API}/users/profile`, settings);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.detail || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API}/users/upload-logo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const logoUrl = `${process.env.REACT_APP_BACKEND_URL}${response.data.url}`;
      setSettings({ ...settings, logo_url: logoUrl });
      
      // Update profile with new logo
      await axios.put(`${API}/users/profile`, { ...settings, logo_url: logoUrl });
      
      toast.success('Logo uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.current_password || !passwordData.new_password) {
      toast.error('Please fill all password fields');
      return;
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.new_password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/users/change-password`, {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      });
      toast.success('Password changed successfully!');
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.detail || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold gradient-text">Admin Settings</h1>
            <p className="text-gray-600 mt-2">Manage your profile and social media links</p>
          </div>

          <div className="grid gap-6">
            {/* Logo Upload */}
            <Card className="card">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <Package className="w-6 h-6 mr-2 text-[#8b4513]" />
                  Business Logo
                </h2>
                <div className="flex items-center gap-6">
                  {settings.logo_url ? (
                    <div className="relative">
                      <img 
                        src={settings.logo_url} 
                        alt="Business Logo" 
                        className="w-32 h-32 object-contain border-2 border-gray-300 rounded-lg p-2"
                      />
                    </div>
                  ) : (
                    <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                      <Package className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-4">Upload your business logo. Recommended size: 200x200px</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logo-upload"
                      disabled={uploadingLogo}
                    />
                    <label htmlFor="logo-upload">
                      <Button 
                        className="btn-primary" 
                        disabled={uploadingLogo}
                        onClick={() => document.getElementById('logo-upload').click()}
                        type="button"
                      >
                        {uploadingLogo ? 'Uploading...' : settings.logo_url ? 'Change Logo' : 'Upload Logo'}
                      </Button>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Settings */}
            <Card className="card">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <User className="w-6 h-6 mr-2 text-[#8b4513]" />
                  Profile Information
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username *</Label>
                    <Input
                      id="username"
                      value={settings.username}
                      onChange={(e) => setSettings({ ...settings, username: e.target.value })}
                      placeholder="Enter username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mobile">Mobile Number *</Label>
                    <Input
                      id="mobile"
                      value={settings.mobile}
                      onChange={(e) => setSettings({ ...settings, mobile: e.target.value })}
                      placeholder="Mobile number"
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <Button onClick={handleUpdateProfile} className="btn-primary" disabled={loading}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Profile
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Social Media Links */}
            <Card className="card">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-6">Social Media Pages</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="facebook" className="flex items-center">
                      <Facebook className="w-5 h-5 mr-2 text-blue-600" />
                      Facebook Page Link
                    </Label>
                    <Input
                      id="facebook"
                      value={settings.facebook_page_link}
                      onChange={(e) => setSettings({ ...settings, facebook_page_link: e.target.value })}
                      placeholder="https://facebook.com/your-page"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagram" className="flex items-center">
                      <Instagram className="w-5 h-5 mr-2 text-pink-600" />
                      Instagram Page Link
                    </Label>
                    <Input
                      id="instagram"
                      value={settings.instagram_page_link}
                      onChange={(e) => setSettings({ ...settings, instagram_page_link: e.target.value })}
                      placeholder="https://instagram.com/your-page"
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <Button onClick={handleUpdateProfile} className="btn-primary" disabled={loading}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Social Links
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Change Password */}
            <Card className="card">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <Lock className="w-6 h-6 mr-2 text-[#8b4513]" />
                  Change Password
                </h2>
                <div className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="current_password">Current Password *</Label>
                    <Input
                      id="current_password"
                      type="password"
                      value={passwordData.current_password}
                      onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                      placeholder="Current password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new_password">New Password *</Label>
                    <Input
                      id="new_password"
                      type="password"
                      value={passwordData.new_password}
                      onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                      placeholder="New password (min 6 characters)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm_password">Confirm New Password *</Label>
                    <Input
                      id="confirm_password"
                      type="password"
                      value={passwordData.confirm_password}
                      onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <Button onClick={handleChangePassword} className="btn-primary" disabled={loading}>
                    <Lock className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AdminSettings;
