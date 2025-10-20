import React from 'react';

const Product3DViewer = ({ product }) => {
  const mainColor = product?.colors?.[0] || '#8b4513';

  return (
    <div 
      className="w-full h-full min-h-[400px] rounded-2xl overflow-hidden relative flex items-center justify-center" 
      style={{
        background: `linear-gradient(135deg, ${mainColor}20 0%, ${mainColor}10 100%)`
      }}
      data-testid="product-3d-viewer"
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {/* 3D-like rotating product card */}
        <div 
          className="relative w-64 h-80 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-500"
          style={{
            backgroundColor: mainColor,
            animation: 'gentle-float 3s ease-in-out infinite',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Product face */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-white">
            <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
              <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
              </svg>
            </div>
            <h3 className="text-lg font-bold text-center mb-2">{product?.name}</h3>
            <p className="text-sm opacity-80 text-center">{product?.category?.replace('_', ' ')}</p>
          </div>
          
          {/* Decorative stripes */}
          <div className="absolute top-1/4 left-0 right-0 h-3 bg-gradient-to-r from-[#d4a574] to-[#d4a574]/50 shadow-lg"></div>
          <div className="absolute bottom-1/4 left-0 right-0 h-3 bg-gradient-to-r from-[#d4a574] to-[#d4a574]/50 shadow-lg"></div>
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