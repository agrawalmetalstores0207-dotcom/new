import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';

// Extend Three.js objects
extend({ Object3D: Object, Mesh: Object });

// Simple 3D Product Model (Fallback Box)
function ProductModel({ color = '#8b4513' }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group ref={meshRef}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2, 3, 0.5]} />
        <meshStandardMaterial 
          color={color} 
          roughness={0.5} 
          metalness={0.1}
        />
      </mesh>
      {/* Add decorative elements */}
      <mesh position={[0, 0, 0.3]} castShadow>
        <boxGeometry args={[1.5, 0.2, 0.1]} />
        <meshStandardMaterial color="#d4a574" roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.8, 0.3]} castShadow>
        <boxGeometry args={[1.5, 0.2, 0.1]} />
        <meshStandardMaterial color="#d4a574" roughness={0.3} />
      </mesh>
    </group>
  );
}

const Product3DViewer = ({ product }) => {
  const mainColor = product?.colors?.[0] || '#8b4513';

  return (
    <div className="w-full h-full min-h-[400px] rounded-2xl overflow-hidden bg-gradient-to-br from-[#f8f3f0] to-[#fdf8f5]" data-testid="product-3d-viewer">
      <Canvas
        shadows
        camera={{ position: [0, 0, 8], fov: 50 }}
        gl={{ alpha: true, antialias: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <spotLight
            position={[10, 10, 10]}
            angle={0.15}
            penumbra={1}
            intensity={1}
            castShadow
          />
          <pointLight position={[-10, -10, -10]} intensity={0.3} />
          
          <ProductModel color={mainColor} />
          
          <Environment preset="studio" />
          <OrbitControls 
            enableZoom={true}
            enablePan={false}
            minDistance={5}
            maxDistance={15}
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
