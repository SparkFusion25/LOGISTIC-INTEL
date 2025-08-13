'use client'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function HeroGlobe() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current!
    const h = 360
    const w = el.clientWidth

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(w, h)
    el.appendChild(renderer.domElement)

    const geo = new THREE.SphereGeometry(2, 64, 64)
    const mat = new THREE.MeshStandardMaterial({ color: 0x4F46E5, metalness: 0.25, roughness: 0.35 })
    const sphere = new THREE.Mesh(geo, mat)
    scene.add(sphere)

    const light = new THREE.DirectionalLight(0xffffff, 1)
    light.position.set(5, 5, 6)
    scene.add(light)

    camera.position.z = 5

    let raf = 0
    const tick = () => { sphere.rotation.y += 0.003; renderer.render(scene, camera); raf = requestAnimationFrame(tick) }
    tick()

    const onResize = () => {
      const W = el.clientWidth
      renderer.setSize(W, h)
      camera.aspect = W / h
      camera.updateProjectionMatrix()
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      el.removeChild(renderer.domElement)
      renderer.dispose()
    }
  }, [])

  return <div ref={ref} className="w-full h-[360px]" />
}