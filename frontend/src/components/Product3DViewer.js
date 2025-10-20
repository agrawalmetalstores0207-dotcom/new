import React from 'react';

const Product3DViewer = ({ product }) => {
  const mainColor = product?.colors?.[0] || '#8b4513';

  return (
    <div className="w-full h-full min-h-[400px] rounded-2xl overflow-hidden relative bg-gradient-to-br from-[#f8f3f0] to-[#fdf8f5] flex items-center justify-center" data-testid="product-3d-viewer">
      {/* 3D Placeholder - Three.js would be integrated here for production */}
      <div className="relative w-64 h-80 perspective-1000">
        <div className="w-full h-full transform-style-3d animate-rotate-y">
          {/* Front face */}
          <div 
            className="absolute inset-0 rounded-2xl shadow-2xl flex items-center justify-center"
            style={{ 
              backgroundColor: mainColor,
              transform: 'translateZ(20px)',
            }}
          >
            <div className="text-white text-center p-6">
              <div className="w-32 h-32 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                </svg>
              </div>
              <p className="text-sm opacity-80">{product?.name}</p>
            </div>
          </div>
          
          {/* Decorative stripes */}
          <div 
            className="absolute top-1/4 left-0 right-0 h-4 bg-gradient-to-r from-[#d4a574] to-[#d4a574]/50 shadow-lg"
            style={{ transform: 'translateZ(21px)' }}
          />
          <div 
            className="absolute bottom-1/4 left-0 right-0 h-4 bg-gradient-to-r from-[#d4a574] to-[#d4a574]/50 shadow-lg"
            style={{ transform: 'translateZ(21px)' }}
          />
        </div>
      </div>
      
      <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg text-xs text-gray-600">
        <p>🎭 3D Product Visualization (Demo Mode)</p>
      </div>

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        @keyframes rotate-y {
          from {
            transform: rotateY(0deg) rotateX(-10deg);
          }
          to {
            transform: rotateY(360deg) rotateX(-10deg);
          }
        }
        .animate-rotate-y {
          animation: rotate-y 8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Product3DViewer;
