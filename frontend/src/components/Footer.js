import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#2d1810] text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">Fatima Collection</h3>
            <p className="text-gray-300 text-sm">
              Your destination for elegant fashion. Quality dress materials, kurtis, and cotton sets.
            </p>
            <div className="flex space-x-4">
              <Facebook className="w-5 h-5 cursor-pointer hover:text-[#d4a574] transition-colors" />
              <Instagram className="w-5 h-5 cursor-pointer hover:text-[#d4a574] transition-colors" />
              <Twitter className="w-5 h-5 cursor-pointer hover:text-[#d4a574] transition-colors" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <div className="flex flex-col space-y-2">
              <Link to="/" className="text-gray-300 hover:text-[#d4a574] text-sm transition-colors">Home</Link>
              <Link to="/products" className="text-gray-300 hover:text-[#d4a574] text-sm transition-colors">Products</Link>
              <Link to="/orders" className="text-gray-300 hover:text-[#d4a574] text-sm transition-colors">Orders</Link>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Categories</h4>
            <div className="flex flex-col space-y-2">
              <Link to="/products?category=dress_material" className="text-gray-300 hover:text-[#d4a574] text-sm transition-colors">Dress Materials</Link>
              <Link to="/products?category=kurti" className="text-gray-300 hover:text-[#d4a574] text-sm transition-colors">Kurtis</Link>
              <Link to="/products?category=cotton_set" className="text-gray-300 hover:text-[#d4a574] text-sm transition-colors">Cotton Sets</Link>
              <Link to="/products?category=readymade" className="text-gray-300 hover:text-[#d4a574] text-sm transition-colors">Readymade</Link>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Contact Us</h4>
            <div className="flex flex-col space-y-3">
              <div className="flex items-center space-x-2 text-gray-300 text-sm">
                <Phone className="w-4 h-4" />
                <span>+91 9876543210</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300 text-sm">
                <Mail className="w-4 h-4" />
                <span>info@fatimacollection.com</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300 text-sm">
                <MapPin className="w-4 h-4" />
                <span>Mumbai, Maharashtra</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Fatima Collection. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
