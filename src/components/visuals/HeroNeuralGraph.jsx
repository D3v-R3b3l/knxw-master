
import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

/**
 * HeroNeuralGraph
 * - Wide spatial spread to avoid condensed look
 * - Slow orbit (configurable with orbitSpeed prop)
 * - Separate glow geometry (soft light) + pulsing highlight near cursor
 * - Stronger cursor attraction, larger glow, more pulsing nodes
 * - Traveling light beams along random links
 * - Optional disableInteraction to turn off cursor reaction
 */
export default function HeroNeuralGraph({
  className = "",
  nodeCount = 300,
  distance = 800,
  palette = ["#00d4ff", "#3b82f6"], // cyan → blue
  orbitSpeed = 0.0006,
  disableInteraction = false
}) {
  const containerRef = useRef(null);
  const wrapperRef = useRef(null);
  const rafRef = useRef(null);

  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const sceneRef = useRef(null);

  const nodesPointsRef = useRef(null);
  const glowPointsRef = useRef(null);
  const linksRef = useRef(null);
  const starsRef = useRef(null);

  // Traveling beam system
  const travelingBeamsRef = useRef([]);
  const beamGeometriesRef = useRef([]);
  const maxBeamsRef = useRef(3); // Maximum concurrent beams

  // Cursor → world projection helpers
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseNDCRef = useRef(new THREE.Vector2(0, 0)); // -1..1
  const pointerWorldRef = useRef(new THREE.Vector3(0, 0, 0)); // smoothed
  const tmpVecRef = useRef(new THREE.Vector3());

  // Pulsing highlight layer
  const pulsePointsRef = useRef(null);
  const pulseGeoRef = useRef(null);
  const pulseMatRef = useRef(null);
  const maxPulseCountRef = useRef(0);

  // Create a small radial-gradient texture for glow sprites
  const createGlowTexture = () => {
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const g = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    g.addColorStop(0, 'rgba(0,212,255,0.95)');
    g.addColorStop(0.3, 'rgba(0,212,255,0.6)');
    g.addColorStop(1, 'rgba(0,212,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
    return texture;
  };

  const data = useMemo(() => {
    const nodes = [...Array(nodeCount).keys()].map((i) => ({
      id: i,
      g: i % palette.length,
    }));

    // Reduced link density and randomized pairing for cleaner view
    const links = [];
    nodes.forEach((n) => {
      const num = Math.random() < 0.6 ? 1 : (Math.random() < 0.35 ? 1 : 0);
      for (let i = 0; i < num; i++) {
        const tgt = Math.max(0, Math.round(Math.random() * (n.id - 1)));
        links.push({ source: n.id, target: tgt, g: n.g });
      }
    });

    return { nodes, links };
  }, [nodeCount, palette.length]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000011, 0.0009);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      55,
      container.clientWidth / container.clientHeight,
      1,
      15000
    );
    camera.position.set(0, 0, distance);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    wrapperRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Starfield backdrop
    const starGeo = new THREE.BufferGeometry();
    const starCount = 3000;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starPositions.length; i++) {
      starPositions[i] = (Math.random() - 0.5) * 8000;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      size: 1,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      color: 0x4ccfff,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);
    starsRef.current = stars;

    // Node points - wide spread
    const nodeRadius = 2400;
    const nodePositions = new Float32Array(nodeCount * 3);
    const nodeColors = new Float32Array(nodeCount * 3);
    for (let i = 0; i < nodeCount; i++) {
      const ix = i * 3;
      nodePositions[ix]     = (Math.random() - 0.5) * nodeRadius;
      nodePositions[ix + 1] = (Math.random() - 0.5) * nodeRadius * 0.75;
      nodePositions[ix + 2] = (Math.random() - 0.5) * nodeRadius;

      const col = new THREE.Color(palette[i % palette.length]);
      nodeColors[ix]     = col.r;
      nodeColors[ix + 1] = col.g;
      nodeColors[ix + 2] = col.b;
    }

    // Base nodes
    const nodeGeo = new THREE.BufferGeometry();
    nodeGeo.setAttribute("position", new THREE.BufferAttribute(nodePositions, 3));
    nodeGeo.setAttribute("color", new THREE.BufferAttribute(nodeColors, 3));
    const nodeMat = new THREE.PointsMaterial({
      size: 2.6,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
    });
    const nodesPoints = new THREE.Points(nodeGeo, nodeMat);
    scene.add(nodesPoints);
    nodesPointsRef.current = nodesPoints;

    // Glow sprites layer (separate geometry)
    const glowGeo = new THREE.BufferGeometry();
    glowGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(nodePositions), 3));
    const glowMat = new THREE.PointsMaterial({
      size: 16, // stronger glow
      transparent: true,
      depthWrite: false,
      opacity: 0.32,
      map: createGlowTexture(),
      blending: THREE.AdditiveBlending,
      color: new THREE.Color("#42e4ff"),
    });
    const glowPoints = new THREE.Points(glowGeo, glowMat);
    scene.add(glowPoints);
    glowPointsRef.current = glowPoints;

    // Pulsing highlight layer (subset near cursor)
    const maxPulse = Math.min(140, nodeCount);
    maxPulseCountRef.current = maxPulse;
    const pulseGeo = new THREE.BufferGeometry();
    pulseGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(maxPulse * 3), 3));
    const pulseMat = new THREE.PointsMaterial({
      size: 36, // larger pulse
      transparent: true,
      depthWrite: false,
      opacity: 0.4, // stronger
      map: createGlowTexture(),
      blending: THREE.AdditiveBlending,
      color: new THREE.Color("#88f2ff"),
    });
    const pulsePoints = new THREE.Points(pulseGeo, pulseMat);
    scene.add(pulsePoints);
    pulsePointsRef.current = pulsePoints;
    pulseGeoRef.current = pulseGeo;
    pulseMatRef.current = pulseMat;

    // Links (as LineSegments)
    const buildLinks = () => {
      if (linksRef.current) {
        scene.remove(linksRef.current);
        linksRef.current.geometry.dispose();
        linksRef.current.material.dispose();
      }

      const { links } = data;
      const linkPositions = new Float32Array(links.length * 2 * 3);
      const linkColors = new Float32Array(links.length * 2 * 3);

      for (let i = 0; i < links.length; i++) {
        const { source, target, g } = links[i];
        const si = source * 3;
        const ti = target * 3;

        const col = new THREE.Color(palette[g % palette.length]);

        // source
        linkPositions[i * 6 + 0] = nodePositions[si + 0];
        linkPositions[i * 6 + 1] = nodePositions[si + 1];
        linkPositions[i * 6 + 2] = nodePositions[si + 2];
        linkColors[i * 6 + 0] = col.r;
        linkColors[i * 6 + 1] = col.g;
        linkColors[i * 6 + 2] = col.b;

        // target
        linkPositions[i * 6 + 3] = nodePositions[ti + 0];
        linkPositions[i * 6 + 4] = nodePositions[ti + 1];
        linkPositions[i * 6 + 5] = nodePositions[ti + 2];
        linkColors[i * 6 + 3] = col.r;
        linkColors[i * 6 + 4] = col.g;
        linkColors[i * 6 + 5] = col.b;
      }

      const linkGeo = new THREE.BufferGeometry();
      linkGeo.setAttribute("position", new THREE.BufferAttribute(linkPositions, 3));
      linkGeo.setAttribute("color", new THREE.BufferAttribute(linkColors, 3));

      const linkMat = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.15, // Dim base links
        blending: THREE.AdditiveBlending,
      });

      const lines = new THREE.LineSegments(linkGeo, linkMat);
      scene.add(lines);
      linksRef.current = lines;
    };
    buildLinks();

    // Create traveling beam geometries - enhanced streak effect
    const createTravelingBeams = () => {
      const beams = [];
      const geometries = [];
      
      for (let i = 0; i < maxBeamsRef.current; i++) {
        // Create beam group to hold multiple components
        const beamGroup = new THREE.Group();
        
        // Main bright core (elongated)
        const coreGeo = new THREE.CylinderGeometry(0.8, 1.2, 25, 8);
        const coreMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color("#ffffff"),
          transparent: true,
          opacity: 0,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide
        });
        const coreMesh = new THREE.Mesh(coreGeo, coreMat);
        beamGroup.add(coreMesh);
        
        // Outer glow shell
        const glowGeo = new THREE.CylinderGeometry(2, 3, 30, 8);
        const glowMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color("#00d4ff"),
          transparent: true,
          opacity: 0,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide
        });
        const glowMesh = new THREE.Mesh(glowGeo, glowMat);
        beamGroup.add(glowMesh);
        
        // Create trailing particles
        const particleCount = 20;
        const particleGeo = new THREE.BufferGeometry();
        const particlePositions = new Float32Array(particleCount * 3);
        const particleSizes = new Float32Array(particleCount);
        
        for (let j = 0; j < particleCount; j++) {
          particlePositions[j * 3] = 0;
          particlePositions[j * 3 + 1] = 0; 
          particlePositions[j * 3 + 2] = 0;
          particleSizes[j] = Math.random() * 3 + 1;
        }
        
        particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
        particleGeo.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));
        
        const particleMat = new THREE.PointsMaterial({
          color: new THREE.Color("#42e4ff"),
          transparent: true,
          opacity: 0,
          blending: THREE.AdditiveBlending,
          sizeAttenuation: true,
          size: 2,
          map: createGlowTexture()
        });
        
        const particles = new THREE.Points(particleGeo, particleMat);
        beamGroup.add(particles);
        
        scene.add(beamGroup);
        
        beams.push({
          group: beamGroup,
          core: coreMesh,
          glow: glowMesh,
          particles: particles,
          particlePositions: particlePositions,
          trailHistory: [], // Store previous positions for trail
          active: false,
          linkIndex: -1,
          progress: 0,
          startTime: 0,
          duration: 0,
          startPos: new THREE.Vector3(),
          endPos: new THREE.Vector3(),
          direction: new THREE.Vector3(),
          nextSpawnTime: 0
        });
        
        geometries.push(coreGeo, glowGeo, particleGeo);
      }
      
      travelingBeamsRef.current = beams;
      beamGeometriesRef.current = geometries;
    };
    createTravelingBeams();

    // Mouse move -> update NDC (only if interaction enabled)
    const onMouseMove = (e) => {
      if (!container || disableInteraction) return;
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      mouseNDCRef.current.set(x, y);
    };
    if (!disableInteraction) {
      window.addEventListener("mousemove", onMouseMove, { passive: true });
    }

    // Gentle organic motion + cursor interaction + traveling beams
    const phases = new Float32Array(nodeCount);
    for (let i = 0; i < nodeCount; i++) phases[i] = Math.random() * Math.PI * 2;

    let angle = 0;
    const reactRadius = 800; // stronger area
    const influence = 0.06;  // stronger pull

    const animate = () => {
      const currentTime = performance.now();
      
      // Slow orbit
      angle += orbitSpeed;
      camera.position.x = distance * Math.sin(angle);
      camera.position.z = distance * Math.cos(angle);
      camera.lookAt(0, 0, 0);

      // Project mouse into world (z = 0 plane)
      if (!disableInteraction) {
        const raycaster = raycasterRef.current;
        raycaster.setFromCamera(mouseNDCRef.current, camera);
        const ro = raycaster.ray.origin;
        const rd = raycaster.ray.direction;
        let t = -ro.z / rd.z;
        if (!Number.isFinite(t)) t = 0;
        const target = tmpVecRef.current.set(ro.x + rd.x * t, ro.y + rd.y * t, 0);
        pointerWorldRef.current.lerp(target, 0.45);
      }

      // Update traveling beams with streak effect
      const { links } = data;
      const pos = nodesPoints.geometry.attributes.position.array;
      
      travelingBeamsRef.current.forEach((beam, beamIndex) => {
        if (!beam.active) {
          // Check if it's time to spawn a new beam
          if (currentTime >= beam.nextSpawnTime && links.length > 0) {
            // Pick a random link
            const randomLinkIndex = Math.floor(Math.random() * links.length);
            const link = links[randomLinkIndex];
            
            // Get current node positions
            const si = link.source * 3;
            const ti = link.target * 3;
            
            beam.startPos.set(pos[si], pos[si + 1], pos[si + 2]);
            beam.endPos.set(pos[ti], pos[ti + 1], pos[ti + 2]);
            beam.direction.subVectors(beam.endPos, beam.startPos).normalize();
            
            // Calculate travel duration 
            const distance = beam.startPos.distanceTo(beam.endPos);
            beam.duration = Math.max(1200, Math.min(2500, distance * 1.8));
            
            beam.linkIndex = randomLinkIndex;
            beam.progress = 0;
            beam.startTime = currentTime;
            beam.active = true;
            beam.trailHistory = [];
            
            // Set next spawn time (3-8 seconds)
            beam.nextSpawnTime = currentTime + 3000 + Math.random() * 5000;
          }
        } else {
          // Update active beam
          const elapsed = currentTime - beam.startTime;
          beam.progress = Math.min(1, elapsed / beam.duration);
          
          // Calculate current position
          const currentPos = beam.startPos.clone().lerp(beam.endPos, beam.progress);
          beam.group.position.copy(currentPos);
          
          // Store position in trail history
          beam.trailHistory.push(currentPos.clone());
          if (beam.trailHistory.length > 20) {
            beam.trailHistory.shift(); // Keep only last 20 positions
          }
          
          // Align beam with direction of travel
          // CylinderGeometry is aligned along Y axis by default. lookAt aligns Z-axis.
          // We need to rotate the group so the cylinder's Y-axis aligns with the group's Z-axis.
          beam.group.lookAt(beam.endPos);
          beam.group.rotateX(Math.PI / 2); // Rotate to align cylinder's Y with the group's Z
          
          // Update opacity with dramatic fade in/out
          let intensity;
          if (beam.progress < 0.05) {
            // Quick bright flash at start
            intensity = beam.progress / 0.05;
          } else if (beam.progress < 0.15) {
            // Peak intensity
            intensity = 1.0;
          } else if (beam.progress > 0.85) {
            // Fade out at end
            intensity = (1 - beam.progress) / 0.15;
          } else {
            // Sustained brightness during travel
            intensity = 0.9;
          }
          
          intensity = Math.max(0, Math.min(1, intensity));
          
          // Update core (bright white center)
          beam.core.material.opacity = intensity * 0.95;
          beam.glow.material.opacity = intensity * 0.6;
          
          // Update trailing particles
          if (beam.trailHistory.length > 1) {
            for (let i = 0; i < Math.min(20, beam.trailHistory.length); i++) {
              const historyIndex = beam.trailHistory.length - 1 - i;
              if (historyIndex >= 0) {
                const trailPos = beam.trailHistory[historyIndex];
                const idx = i * 3;
                
                // Add some randomness to particle positions
                // Spread particles more as they fall further behind
                const spread = i * 0.5 + 1; 
                beam.particlePositions[idx] = trailPos.x + (Math.random() - 0.5) * spread;
                beam.particlePositions[idx + 1] = trailPos.y + (Math.random() - 0.5) * spread;
                beam.particlePositions[idx + 2] = trailPos.z + (Math.random() - 0.5) * spread;
              }
            }
            
            beam.particles.geometry.attributes.position.needsUpdate = true;
            
            // Particle opacity decreases along the trail
            beam.particles.material.opacity = intensity * 0.7;
            
            // Add sparkle effect
            beam.particles.material.size = 2 + Math.sin(currentTime * 0.01) * 0.5;
          }
          
          // Add lens flare effect at peak intensity
          if (intensity > 0.8) {
            // Scale up the glow for dramatic effect
            const flareScale = 1 + Math.sin(currentTime * 0.008) * 0.3;
            beam.glow.scale.set(flareScale, 1, flareScale);
          } else {
            beam.glow.scale.set(1, 1, 1); // Reset scale
          }
          
          // Check if journey is complete
          if (beam.progress >= 1) {
            beam.active = false;
            beam.core.material.opacity = 0;
            beam.glow.material.opacity = 0;
            beam.particles.material.opacity = 0;
            beam.trailHistory = [];
          }
        }
      });

      // node breathing + cursor attraction
      const pos2 = nodesPoints.geometry.attributes.position.array;
      const glowPos = glowPoints.geometry.attributes.position.array;
      const tNow = performance.now() * 0.00035;

      const nearest = [];
      for (let i = 0; i < nodeCount; i++) {
        const ix = i * 3;

        // breathing (subtle)
        const amp = 0.25 + Math.sin(tNow + phases[i]) * 0.15;
        const dxB = Math.sin(tNow * 0.9 + phases[i]) * 0.06 * amp;
        const dzB = Math.cos(tNow * 0.7 + phases[i]) * 0.06 * amp;

        let ax = 0, ay = 0, az = 0;
        if (!disableInteraction) {
          const px = pointerWorldRef.current.x - pos2[ix];
          const py = pointerWorldRef.current.y - pos2[ix + 1];
          const pz = pointerWorldRef.current.z - pos2[ix + 2];
          const d = Math.sqrt(px * px + py * py + pz * pz);

          if (d < reactRadius && d > 1e-3) {
            const f = influence * (1 - d / reactRadius);
            ax = px * f;
            ay = py * f;
            az = pz * f;
            nearest.push({ idx: i, d });
          }
        }

        pos2[ix]     += dxB + ax;
        pos2[ix + 1] += ay;
        pos2[ix + 2] += dzB + az;

        // keep glow in sync
        glowPos[ix]     = pos2[ix];
        glowPos[ix + 1] = pos2[ix + 1];
        glowPos[ix + 2] = pos2[ix + 2];
      }

      nodesPoints.geometry.attributes.position.needsUpdate = true;
      glowPoints.geometry.attributes.position.needsUpdate = true;

      // Update pulsing layer to top-K nearest
      if (pulsePointsRef.current && !disableInteraction) {
        nearest.sort((a, b) => a.d - b.d);
        const k = Math.min(maxPulseCountRef.current, nearest.length);
        const pGeo = pulseGeoRef.current;
        const arr = pGeo.attributes.position.array;
        for (let i = 0; i < k; i++) {
          const srcIx = nearest[i].idx * 3;
          const dstIx = i * 3;
          arr[dstIx]     = pos2[srcIx];
          arr[dstIx + 1] = pos2[srcIx + 1];
          arr[dstIx + 2] = pos2[srcIx + 2];
        }
        pGeo.setDrawRange(0, k);
        pGeo.attributes.position.needsUpdate = true;

        // Stronger pulse breathing
        pulseMatRef.current.size = 30 + 10 * Math.abs(Math.sin(performance.now() * 0.0035));
        pulseMatRef.current.opacity = 0.32 + 0.22 * Math.abs(Math.sin(performance.now() * 0.003));
      }

      if (starsRef.current) starsRef.current.rotation.y += 0.00015;

      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(animate);
    };

    const onResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    window.addEventListener("resize", onResize);
    animate();

    // Cleanup
    return () => {
      window.removeEventListener("resize", onResize);
      if (!disableInteraction) {
        window.removeEventListener("mousemove", onMouseMove);
      }
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      // Clean up traveling beams
      travelingBeamsRef.current.forEach(beam => {
        if (beam.group) {
          scene.remove(beam.group);
          if (beam.core) {
            beam.core.geometry.dispose();
            beam.core.material.dispose();
          }
          if (beam.glow) {
            beam.glow.geometry.dispose();
            beam.glow.material.dispose();
          }
          if (beam.particles) {
            beam.particles.geometry.dispose();
            beam.particles.material.dispose();
          }
        }
      });
      // Dispose shared geometries if any were intended to be shared, though current setup creates per-beam
      // beamGeometriesRef.current.forEach(geo => geo.dispose()); // This was for original sphere geo, now handled above.

      if (linksRef.current) {
        scene.remove(linksRef.current);
        linksRef.current.geometry.dispose();
        linksRef.current.material.dispose();
      }
      if (nodesPointsRef.current) {
        scene.remove(nodesPointsRef.current);
        nodesPointsRef.current.geometry.dispose();
        nodesPointsRef.current.material.dispose();
      }
      if (glowPointsRef.current) {
        scene.remove(glowPointsRef.current);
        glowPointsRef.current.geometry.dispose();
        glowPointsRef.current.material.dispose();
      }
      if (pulsePointsRef.current) {
        scene.remove(pulsePointsRef.current);
        pulsePointsRef.current.geometry.dispose();
        pulseMatRef.current.dispose();
      }
      if (starsRef.current) {
        scene.remove(starsRef.current);
        starsRef.current.geometry.dispose();
        starsRef.current.material.dispose();
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (rendererRef.current.domElement?.parentNode) {
          rendererRef.current.domElement.parentNode.removeChild(rendererRef.current.domElement);
        }
      }
    };
  }, [nodeCount, distance, palette, orbitSpeed, disableInteraction, data]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: "100%",
        height: "100%",
        background: "radial-gradient(1200px 800px at 60% -20%, #0b1238 0%, #05071b 45%, #02030c 70%, #000007 100%)",
        pointerEvents: "none"
      }}
      aria-hidden
    >
      <div ref={wrapperRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
