import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

// 3D Product Box Model
function ProductBox({ color = '#8b4513' }) {
  const meshRef = useRef();

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group ref={meshRef}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2, 3, 0.5]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.2} />
      </mesh>
      {/* Decorative stripes */}
      <mesh position={[0, 0.8, 0.26]} castShadow>
        <boxGeometry args={[1.8, 0.15, 0.05]} />
        <meshStandardMaterial color="#d4a574" roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.8, 0.26]} castShadow>
        <boxGeometry args={[1.8, 0.15, 0.05]} />
        <meshStandardMaterial color="#d4a574" roughness={0.3} />
      </mesh>
    </group>
  );
}

const Product3DViewer = ({ product }) => {
  const mainColor = product?.colors?.[0] || '#8b4513';

  return (
    <div className="w-full h-full min-h-[400px] rounded-2xl overflow-hidden bg-gradient-to-br from-[#f8f3f0] to-[#fdf8f5] relative" data-testid="product-3d-viewer">
      <Canvas
        shadows
        camera={{ position: [0, 0, 6], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.6} />
          <spotLight
            position={[10, 10, 10]}
            angle={0.3}
            penumbra={1}
            intensity={1}
            castShadow
          />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          
          <ProductBox color={mainColor} />
          
          <OrbitControls
            enableZoom={true}
            enablePan={false}
            minDistance={4}
            maxDistance={10}
            autoRotate={false}
          />
        </Suspense>
      </Canvas>
      
      <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg text-xs text-gray-600">
        <p>🖱️ Drag to rotate • Scroll to zoom</p>
      </div>
    </div>
  );
};

export default Product3DViewer;
