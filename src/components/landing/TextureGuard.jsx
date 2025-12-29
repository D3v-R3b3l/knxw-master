import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';

const TEX_KEYS = [
  'map', 'alphaMap', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap', 'emissiveMap',
  'specularMap', 'displacementMap', 'envMap', 'matcap', 'gradientMap', 'clearcoatNormalMap',
  'iridescenceThicknessMap', 'transmissionMap', 'opacityMap'
];

export default function TextureGuard() {
  const { scene, gl } = useThree();
  
  useEffect(() => {
    // Run immediately
    const sanitize = () => {
      scene.traverse(obj => {
        const m = obj.material;
        if (!m) return;
        
        // Handle both single material and array of materials
        const materials = Array.isArray(m) ? m : [m];
        
        materials.forEach(mat => {
          if (!mat) return;
          
          TEX_KEYS.forEach(k => {
            const v = mat[k];
            if (v !== undefined && !v?.isTexture) {
              console.warn('[TextureGuard] Invalid', k, 'on', obj.name || obj.uuid, '→', v);
              mat[k] = undefined; // sanitize to prevent .source crash
              mat.needsUpdate = true;
            }
          });
        });
      });
    };
    
    // Run immediately
    sanitize();
    
    // Also run on every frame for the first second to catch late additions
    let frameCount = 0;
    const maxFrames = 60;
    const intervalId = setInterval(() => {
      sanitize();
      frameCount++;
      if (frameCount >= maxFrames) {
        clearInterval(intervalId);
      }
    }, 16);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [scene]);
  
  return null;
}