import { useRef, useMemo, Suspense, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { badges, type Badge } from './badges.data';
import { useBadgeHoldTimer } from './useBadgeHoldTimer';

const SPHERE_RADIUS = 3.0;
const ATLAS_COLS = 6;
const ATLAS_ROWS = 4;

interface BadgeSphereProps {
  onBadgeActivated: (badge: Badge) => void;
  activeBadge: Badge | null;
}

function useAtlas(): THREE.Texture {
  const textures = useTexture(badges.map((b) => b.imageUrl));

  const atlas = useMemo(() => {
    const tileSize = 256;
    const canvas = document.createElement('canvas');
    canvas.width = tileSize * ATLAS_COLS;
    canvas.height = tileSize * ATLAS_ROWS;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    textures.forEach((tex, i) => {
      const col = i % ATLAS_COLS;
      const row = Math.floor(i / ATLAS_COLS);
      const img = (tex as any).image as HTMLImageElement;
      if (img) {
        ctx.drawImage(img, col * tileSize, row * tileSize, tileSize, tileSize);
      }
    });

    const result = new THREE.CanvasTexture(canvas);
    result.colorSpace = THREE.SRGBColorSpace;
    result.needsUpdate = true;
    return result;
  }, [textures]);

  return atlas;
}

/**
 * Convert UV coordinates to a badge index.
 * Atlas is 6 cols × 4 rows, badges fill left-to-right, top-to-bottom.
 */
function uvToBadgeIndex(u: number, v: number): number {
  const col = Math.floor(u * ATLAS_COLS);
  const row = Math.floor((1 - v) * ATLAS_ROWS); // flip V
  const index = row * ATLAS_COLS + col;
  if (index >= 0 && index < badges.length) return index;
  return -1;
}

function Sphere({
  atlas,
  onBadgeActivated,
}: {
  atlas: THREE.Texture;
  onBadgeActivated: (badge: Badge) => void;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const { camera, gl } = useThree();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const pointer = useMemo(() => new THREE.Vector2(), []);

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    },
    [gl, pointer]
  );

  const { startHold, cancelHold } = useBadgeHoldTimer(
    (index) => {
      onBadgeActivated(badges[index]);
    }
  );

  useFrame((_, dt) => {
    if (ref.current) {
      ref.current.rotation.y += dt * 0.12;

      // Raycast on every frame to detect hover
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObject(ref.current);
      if (hits.length > 0 && hits[0].uv) {
        const idx = uvToBadgeIndex(hits[0].uv.x, hits[0].uv.y);
        if (idx >= 0) {
          startHold(idx);
        } else {
          cancelHold();
        }
      } else {
        cancelHold();
      }
    }
  });

  // Attach pointer listener
  useMemo(() => {
    const el = gl.domElement;
    el.addEventListener('pointermove', handlePointerMove);
    return () => el.removeEventListener('pointermove', handlePointerMove);
  }, [gl, handlePointerMove]);

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[SPHERE_RADIUS, 64, 64]} />
      <meshBasicMaterial map={atlas} />
    </mesh>
  );
}

function Scene({
  onBadgeActivated,
}: {
  onBadgeActivated: (badge: Badge) => void;
}) {
  const atlas = useAtlas();
  return <Sphere atlas={atlas} onBadgeActivated={onBadgeActivated} />;
}

export default function BadgeSphere({ onBadgeActivated }: BadgeSphereProps) {
  return (
    <div style={{ width: '100%', height: '80vh', minHeight: 500 }}>
      <Canvas camera={{ position: [0, 0, 8], fov: 55 }} gl={{ antialias: true }}>
        <ambientLight intensity={0.8} />
        <OrbitControls enableZoom={true} enablePan={false} autoRotate autoRotateSpeed={0.5} />
        <Suspense fallback={null}>
          <Scene onBadgeActivated={onBadgeActivated} />
        </Suspense>
      </Canvas>
    </div>
  );
}
