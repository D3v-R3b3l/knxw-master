import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';

const TEX_KEYS = [
  'map', 'alphaMap', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap', 'emissiveMap',
  'specularMap', 'displacementMap', 'envMap', 'matcap', 'gradientMap', 'clearcoatNormalMap',
  'iridescenceThicknessMap', 'transmissionMap', 'opacityMap'
];

export default function TextureGuard() {
  const { scene } = useThree();
  
  useEffect(() => {
    scene.traverse(obj => {
      const m = obj.material;
      if (!m) return;
      
      TEX_KEYS.forEach(k => {
        const v = m[k];
        if (v !== undefined && !v?.isTexture) {
          console.warn('[TextureGuard] Invalid', k, 'on', obj.name || obj.uuid, '→', v);
          m[k] = undefined; // sanitize to prevent .source crash
          m.needsUpdate = true;
        }
      });
    });
  }, [scene]);
  
  return null;
}