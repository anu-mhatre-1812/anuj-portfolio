/* eslint-disable @typescript-eslint/no-explicit-any */
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { useRef } from 'react'
import * as THREE from 'three'

function Sphere() {
  const { scene } = useGLTF('/Sphere_NeoBrutalist.glb')
  const ref = useRef<any>(null)

  useFrame((_: any, delta: number) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.3
    }
  })

  return (
    <primitive ref={ref} object={scene} scale={1.5} position={[0, 0, 0]} />
  )
}

export default function SphereModel() {
  return (
    <div style={{
      position: 'relative',
      zIndex: 0,
      width: '100%',
      height: '70vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ alpha: true }}
        onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), 0)}
      >
        <ambientLight intensity={1} />
        <directionalLight position={[5, 5, 5]} intensity={2} />
        <directionalLight position={[-5, -5, -5]} intensity={0.5} />
        <Sphere />
      </Canvas>
    </div>
  )
}
