import React from 'react';

const Product3DViewer = ({ product }) => {
  const mainColor = product?.colors?.[0] || '#8b4513';
  const productImage = product?.images?.[0] || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600';

  return (
    <div 
      className="w-full h-full min-h-[400px] rounded-2xl overflow-hidden relative flex items-center justify-center" 
      style={{
        background: `linear-gradient(135deg, ${mainColor}20 0%, ${mainColor}10 100%)`
      }}
      data-testid="product-3d-viewer"
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {/* 3D-like rotating product card with image */}
        <div 
          className="relative w-80 h-96 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-500"
          style={{
            animation: 'gentle-float 3s ease-in-out infinite',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Product Image */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden">
            <img 
              src={productImage} 
              alt={product?.name}
              className="w-full h-full object-cover"
            />
            {/* Gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30"></div>
          </div>
          
          {/* Product info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h3 className="text-xl font-bold mb-1">{product?.name}</h3>
            <p className="text-sm opacity-90">{product?.category?.replace('_', ' ')}</p>
            {product?.price && (
              <p className="text-2xl font-bold mt-2">₹{product.price}</p>
            )}
          </div>
          
          {/* Decorative stripes */}
          <div className="absolute top-1/4 left-0 right-0 h-2 bg-gradient-to-r from-[#d4a574] to-[#d4a574]/50 shadow-lg"></div>
          <div className="absolute bottom-1/3 left-0 right-0 h-2 bg-gradient-to-r from-[#d4a574] to-[#d4a574]/50 shadow-lg"></div>
        </div>
      </div>
      
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg text-xs font-medium text-gray-700 shadow-lg">
        <p>✨ Interactive 3D Preview</p>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes gentle-float {
          0%, 100% { transform: translateY(0px) rotateY(-15deg); }
          50% { transform: translateY(-20px) rotateY(15deg); }
        }
      `}} />
    </div>
  );
};

export default Product3DViewer;