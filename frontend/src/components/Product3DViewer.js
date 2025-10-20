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
      <div className="relative w-full h-full flex items-center justify-center p-8">
        {/* 3D-like rotating product image card */}
        <div 
          className="relative rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-500 overflow-hidden"
          style={{
            width: '400px',
            height: '500px',
            animation: 'gentle-float 3s ease-in-out infinite',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Product Image - Main Focus */}
          <img 
            src={productImage} 
            alt={product?.name}
            className="w-full h-full object-cover"
            style={{ objectFit: 'cover' }}
          />
          
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20"></div>
          
          {/* Product info overlay at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10">
            <h3 className="text-2xl font-bold mb-2 drop-shadow-lg">{product?.name}</h3>
            <p className="text-sm opacity-90 mb-2 drop-shadow-md">
              {product?.category?.replace('_', ' ').toUpperCase()}
            </p>
            {product?.price && (
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold">₹{product.sale_price || product.price}</p>
                {product.sale_price && product.sale_price < product.price && (
                  <p className="text-lg line-through opacity-70">₹{product.price}</p>
                )}
              </div>
            )}
          </div>
          
          {/* Decorative accent bars */}
          <div className="absolute top-1/4 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#d4a574] to-transparent shadow-lg opacity-60"></div>
          <div className="absolute bottom-1/3 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#d4a574] to-transparent shadow-lg opacity-60"></div>
        </div>
      </div>
      
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg text-xs font-medium text-gray-700 shadow-lg">
        <p>✨ Interactive 3D Preview</p>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes gentle-float {
          0%, 100% { transform: translateY(0px) rotateY(-8deg); }
          50% { transform: translateY(-20px) rotateY(8deg); }
        }
      `}} />
    </div>
  );
};

export default Product3DViewer;