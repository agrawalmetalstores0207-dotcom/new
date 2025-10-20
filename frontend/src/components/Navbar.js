import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Heart, Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import AuthModal from './AuthModal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <nav className="glass fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[#8b4513] to-[#d4a574] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">FC</span>
              </div>
              <span className="text-xl font-bold gradient-text hidden sm:block">Fatima Collection</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-[#2d1810] hover:text-[#8b4513] font-medium transition-colors">
                Home
              </Link>
              <Link to="/products" className="text-[#2d1810] hover:text-[#8b4513] font-medium transition-colors">
                Products
              </Link>
              <Link to="/orders" className="text-[#2d1810] hover:text-[#8b4513] font-medium transition-colors">
                Orders
              </Link>
              {user?.role === 'admin' && (
                <Link to="/admin" className="text-[#8b4513] font-semibold">
                  Admin
                </Link>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="relative" data-testid="cart-button">
                <Link to="/cart">
                  <ShoppingCart className="w-5 h-5 text-[#2d1810]" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#8b4513] text-white text-xs rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </Button>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" data-testid="user-menu-button">
                      <User className="w-5 h-5 text-[#2d1810]" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => navigate('/orders')}>
                      My Orders
                    </DropdownMenuItem>
                    {user.role === 'admin' && (
                      <DropdownMenuItem onClick={() => navigate('/admin')}>
                        Admin Dashboard
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={() => setAuthModalOpen(true)} className="btn-primary" data-testid="login-button">
                  Login
                </Button>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                data-testid="mobile-menu-button"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white/90 backdrop-blur-lg" data-testid="mobile-menu">
            <div className="px-4 py-4 space-y-3">
              <Link to="/" className="block text-[#2d1810] hover:text-[#8b4513] font-medium" onClick={() => setMobileMenuOpen(false)}>
                Home
              </Link>
              <Link to="/products" className="block text-[#2d1810] hover:text-[#8b4513] font-medium" onClick={() => setMobileMenuOpen(false)}>
                Products
              </Link>
              <Link to="/orders" className="block text-[#2d1810] hover:text-[#8b4513] font-medium" onClick={() => setMobileMenuOpen(false)}>
                Orders
              </Link>
              {user?.role === 'admin' && (
                <Link to="/admin" className="block text-[#8b4513] font-semibold" onClick={() => setMobileMenuOpen(false)}>
                  Admin
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
};

export default Navbar;
