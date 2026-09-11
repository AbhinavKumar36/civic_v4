import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { InstancedMesh, Object3D, Color } from 'three';
import { Sparkles } from '@react-three/drei';

const BUILDING_COUNT = 300;
const TRAFFIC_COUNT = 50;

export const CityScene = () => {
  const buildingsRef = useRef<InstancedMesh>(null);
  const trafficRef = useRef<InstancedMesh>(null);

  // Generate building data
  const buildings = useMemo(() => {
    const data = [];
    const color = new Color();
    for (let i = 0; i < BUILDING_COUNT; i++) {
      const x = (Math.random() - 0.5) * 80;
      const z = (Math.random() - 0.5) * 80;
      
      // Keep clear of the center road
      if (Math.abs(x) < 4) continue;

      const h = Math.random() * 8 + 2;
      const w = Math.random() * 2 + 1;
      const d = Math.random() * 2 + 1;

      // Base color depends on height
      const r = 0.05;
      const g = 0.1 + (h / 20) * 0.1;
      const b = 0.08 + (h / 20) * 0.1;

      data.push({ x, y: h / 2, z, h, w, d, color: color.setRGB(r, g, b) });
    }
    return data;
  }, []);

  // Generate traffic data
  const traffic = useMemo(() => {
    const data = [];
    const color = new Color();
    for (let i = 0; i < TRAFFIC_COUNT; i++) {
      const x = (Math.random() > 0.5 ? 1 : -1) * (1.5 + Math.random());
      const z = (Math.random() - 0.5) * 80;
      const speed = (Math.random() * 0.2 + 0.1) * (x > 0 ? 1 : -1);
      
      const isBrakeLight = x > 0; // Approaching or leaving
      color.setHex(isBrakeLight ? 0xff3333 : 0xffffff);

      data.push({ x, y: 0.1, z, speed, color });
    }
    return data;
  }, []);

  const tempObject = new Object3D();

  useFrame((state) => {


    // Animate camera subtly based on mouse and time
    const mouseX = (state.mouse.x * Math.PI) / 10;
    const mouseY = (state.mouse.y * Math.PI) / 20;

    state.camera.position.x += (mouseX * 5 - state.camera.position.x) * 0.02;
    state.camera.position.y += ((2 + mouseY * 2) - state.camera.position.y) * 0.02;
    state.camera.lookAt(0, 0, 0);

    // Update buildings
    if (buildingsRef.current) {
      buildings.forEach((b, i) => {
        tempObject.position.set(b.x, b.y, b.z);
        tempObject.scale.set(b.w, b.h, b.d);
        tempObject.updateMatrix();
        buildingsRef.current!.setMatrixAt(i, tempObject.matrix);
        buildingsRef.current!.setColorAt(i, b.color);
      });
      buildingsRef.current.instanceMatrix.needsUpdate = true;
      buildingsRef.current.instanceColor!.needsUpdate = true;
    }

    // Update traffic
    if (trafficRef.current) {
      traffic.forEach((t, i) => {
        t.z += t.speed;
        if (t.z > 40) t.z = -40;
        if (t.z < -40) t.z = 40;

        tempObject.position.set(t.x, t.y, t.z);
        tempObject.scale.set(0.2, 0.2, 0.4);
        tempObject.updateMatrix();
        trafficRef.current!.setMatrixAt(i, tempObject.matrix);
        trafficRef.current!.setColorAt(i, t.color);
      });
      trafficRef.current.instanceMatrix.needsUpdate = true;
      trafficRef.current.instanceColor!.needsUpdate = true;
    }
  });

  return (
    <group>
      <fog attach="fog" args={['#07110D', 10, 60]} />
      
      {/* Grid Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[100, 100, 50, 50]} />
        <meshBasicMaterial color="#0B1512" wireframe transparent opacity={0.2} />
      </mesh>

      {/* Main Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial color="#050a08" />
      </mesh>

      {/* Lighting */}
      <ambientLight intensity={0.5} color="#C7FFD9" />
      <directionalLight position={[10, 20, 5]} intensity={1.5} color="#18B66A" />
      
      {/* Buildings InstancedMesh */}
      <instancedMesh ref={buildingsRef} args={[undefined, undefined, buildings.length]}>
        <boxGeometry />
        <meshLambertMaterial />
      </instancedMesh>

      {/* Traffic InstancedMesh */}
      <instancedMesh ref={trafficRef} args={[undefined, undefined, traffic.length]}>
        <boxGeometry />
        <meshBasicMaterial />
      </instancedMesh>

      {/* Atmospheric Particles */}
      <Sparkles count={500} scale={40} size={2} speed={0.2} opacity={0.3} color="#8AF0B0" />

      {/* Data Hotspots */}
      <Hotspot position={[-5, 0.5, -10]} color="#FF3B30" />
      <Hotspot position={[8, 0.5, -5]} color="#FFCC00" />
      <Hotspot position={[-3, 0.5, 5]} color="#34C759" />
      <Hotspot position={[4, 0.5, 12]} color="#FF9500" />
    </group>
  );
};

const Hotspot = ({ position, color }: { position: [number, number, number], color: string }) => {
  const ref = useRef<any>(null);
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (ref.current) {
      ref.current.scale.x = 1 + Math.sin(time * 3) * 0.2;
      ref.current.scale.y = 1 + Math.sin(time * 3) * 0.2;
      ref.current.scale.z = 1 + Math.sin(time * 3) * 0.2;
    }
  });

  return (
    <group position={position}>
      {/* Beam */}
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 4]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>
      {/* Core Node */}
      <mesh ref={ref} position={[0, 4, 0]}>
        <sphereGeometry args={[0.3]} />
        <meshBasicMaterial color={color} />
      </mesh>
      {/* Glow */}
      <mesh position={[0, 4, 0]}>
        <sphereGeometry args={[0.6]} />
        <meshBasicMaterial color={color} transparent opacity={0.2} />
      </mesh>
    </group>
  );
};
