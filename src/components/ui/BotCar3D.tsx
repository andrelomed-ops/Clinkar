"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import { cn } from "@/lib/utils";

interface BotCar3DProps {
    onClick: () => void;
    isOpen: boolean;
}

export function BotCar3D({ onClick, isOpen }: BotCar3DProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    
    // Use refs to keep track of mutable Three.js objects without triggering re-renders
    const threeState = useRef({
        scene: null as THREE.Scene | null,
        camera: null as THREE.PerspectiveCamera | null,
        renderer: null as THREE.WebGLRenderer | null,
        wrapperGroup: null as THREE.Group | null,
        carGroup: null as THREE.Group | null,
        wheels: [] as THREE.Group[],
        frontWheels: [] as THREE.Group[],
        particles: [] as any[],
        time: 0,
        mouseX: 0,
        mouseY: 0,
        animationId: 0,
        isHoveredRef: false
    });

    // Update the ref when state changes so the animation loop sees it
    useEffect(() => {
        threeState.current.isHoveredRef = isHovered;
    }, [isHovered]);

    // Track mouse movement for parallax
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            threeState.current.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
            threeState.current.mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    useEffect(() => {
        if (!containerRef.current) return;
        const container = containerRef.current;
        const state = threeState.current;

        // 1. Scene
        const scene = new THREE.Scene();
        state.scene = scene;

        // 2. Camera
        const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
        camera.position.set(8, 5, 9);
        camera.lookAt(0, -2.0, 0); // Pushing car even higher
        state.camera = camera;

        // 3. Renderer
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap pixel ratio for performance
        renderer.setClearColor(0x000000, 0);
        container.appendChild(renderer.domElement);
        state.renderer = renderer;

        // Dynamic import for OrbitControls to ensure Vercel stability
        import('three/examples/jsm/controls/OrbitControls.js').then(({ OrbitControls }) => {
            if (!state.camera || !state.renderer) return;
            
            // 3.5 Orbit Controls for full user rotation
            const controls = new OrbitControls(state.camera, state.renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.enableZoom = false; // Disable zoom to keep it neat
            controls.enablePan = false;
            controls.autoRotate = true; // Slowly rotate by default
            controls.autoRotateSpeed = 1.0;
            
            // Prevent user from going completely under the car (hides the toy-like chassis bottom)
            controls.maxPolarAngle = Math.PI / 2 + 0.1; 
            controls.minPolarAngle = 0.1;

            // Store controls for cleanup
            (state as any).controls = controls;
        });

        // 4. Lights (Adjusted for a bright, premium showroom look)
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.0); // Restored ambient light
        scene.add(ambientLight);
        
        const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
        dirLight.position.set(5, 10, 5);
        scene.add(dirLight);

        const frontLight = new THREE.DirectionalLight(0xffffff, 1.0);
        frontLight.position.set(0, 2, 10); 
        scene.add(frontLight);

        const dirLight2 = new THREE.DirectionalLight(0x4f46e5, 0.8);
        dirLight2.position.set(-5, 5, -5);
        scene.add(dirLight2);

        // Enhance realism with Environment Map
        import('three/examples/jsm/environments/RoomEnvironment.js').then(({ RoomEnvironment }) => {
            const pmremGenerator = new THREE.PMREMGenerator(renderer);
            scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
        });


        // Materials (Escudería StarterKar)
        const primaryMat = new THREE.MeshPhysicalMaterial({ 
            color: 0x4f46e5, // Indigo 600
            metalness: 0.6, 
            roughness: 0.2, 
            clearcoat: 1.0, 
            clearcoatRoughness: 0.1 
        });
        const secondaryMat = new THREE.MeshPhysicalMaterial({ 
            color: 0xffffff, // White accents
            metalness: 0.3, 
            roughness: 0.2, 
            clearcoat: 1.0
        });
        const carbonMat = new THREE.MeshStandardMaterial({ 
            color: 0x111111, // Carbon fiber / dark parts
            metalness: 0.8, 
            roughness: 0.6 
        });
        const tireMat = new THREE.MeshStandardMaterial({ 
            color: 0x18181b, // Tires
            roughness: 0.9 
        });
        const rimMat = new THREE.MeshStandardMaterial({ 
            color: 0x888888, // Rims
            metalness: 1.0, 
            roughness: 0.3 
        });

        // --- Load Real 3D Model ---
        const wrapperGroup = new THREE.Group();
        const carGroup = new THREE.Group();
        wrapperGroup.add(carGroup);
        scene.add(wrapperGroup);
        state.wrapperGroup = wrapperGroup;
        state.carGroup = carGroup;

        // Add a nice platform/shadow catcher if needed, or just keep it floating
        carGroup.scale.set(0.6, 0.6, 0.6); // Base scale, will adjust after loading
        wrapperGroup.rotation.y = -Math.PI / 5;

        let loadedModel: THREE.Object3D | null = null;
        
        import('three/examples/jsm/loaders/GLTFLoader.js').then(({ GLTFLoader }) => {
            import('three/examples/jsm/loaders/DRACOLoader.js').then(({ DRACOLoader }) => {
                const loader = new GLTFLoader();
                const dracoLoader = new DRACOLoader();
                dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
                loader.setDRACOLoader(dracoLoader);

                loader.load('/bot-car.glb', (gltf) => {
                loadedModel = gltf.scene;
                
                // Center the model
                const box = new THREE.Box3().setFromObject(loadedModel);
                const center = box.getCenter(new THREE.Vector3());
                const size = box.getSize(new THREE.Vector3());
                
                loadedModel.position.x += (loadedModel.position.x - center.x);
                loadedModel.position.y += (loadedModel.position.y - center.y) + (size.y / 2);
                loadedModel.position.z += (loadedModel.position.z - center.z);
                
                // Normalize scale so it fits nicely in the container
                const maxDim = Math.max(size.x, size.y, size.z);
                const targetSize = 9.0; // Reduced from 12.0 for a more balanced size
                loadedModel.scale.setScalar(targetSize / maxDim);

                // Apply StarterKar colors and enhance materials
                loadedModel.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        const mat = child.material;
                        if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial) {
                            const name = mat.name.toLowerCase();
                            
                            if (name.includes('body') || name.includes('paint') || (mat.color.r > 0.5 && mat.color.g < 0.2 && !name.includes('light') && !name.includes('faro'))) {
                                const newMat = new THREE.MeshPhysicalMaterial({
                                    color: 0x312e81, // Indigo 900
                                    metalness: 0.7,
                                    roughness: 0.1,
                                    clearcoat: 1.0,
                                    clearcoatRoughness: 0.1
                                });
                                child.material = newMat;
                            } else if (name.includes('glass') || name.includes('cristal') || name.includes('window')) {
                                // WebGL transmission renders black against transparent DOM backgrounds. 
                                // We use alpha blending (opacity) instead so the webpage shows through.
                                child.material = new THREE.MeshPhysicalMaterial({
                                    color: 0xffffff,
                                    metalness: 0.8,
                                    roughness: 0.05,
                                    transparent: true,
                                    opacity: 0.3, // Real transparency
                                    envMapIntensity: 2.0 // Keep reflections high so it looks like glass
                                });
                            } else if (name.includes('light') || name.includes('faro') || name.includes('lente') || name.includes('led')) {
                                // Glowing lights
                                const isTail = name.includes('back') || name.includes('tail') || name.includes('rear') || mat.color.r > mat.color.b;
                                child.material = new THREE.MeshStandardMaterial({
                                    color: isTail ? 0xff0000 : 0xeff6ff, // Red for back, icy white-blue for front
                                    emissive: isTail ? 0xff0000 : 0xeff6ff,
                                    emissiveIntensity: isTail ? 2.0 : 4.0, // Turn on the lights!
                                    transparent: true,
                                    opacity: 0.9
                                });
                            }
                        }

                    }
                });

                carGroup.add(loadedModel);
            }, undefined, (error) => {
                console.error("Error loading 3D model:", error);
            });
            }); // Close DRACOLoader block
        });

        // --- Animation Loop ---
        const animate = (timeNow: number) => {
            state.animationId = requestAnimationFrame(animate);
            TWEEN.update(timeNow);
            state.time += 0.05;

            // Update OrbitControls if available
            if ((state as any).controls) {
                (state as any).controls.update();
            }

            // 1. Idle floating (Slow)
            carGroup.position.y = Math.sin(state.time * 0.8) * 0.05;
            


            renderer.render(scene, camera);
        };

        state.animationId = requestAnimationFrame(animate);

        // Handle Resize
        const handleResize = () => {
            if (camera && renderer && containerRef.current) {
                camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
            }
        };
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(state.animationId);
            TWEEN.removeAll();
            if ((state as any).controls) {
                (state as any).controls.dispose();
            }
            
            // Dispose Three.js objects
            scene.traverse((object) => {
                if (object instanceof THREE.Mesh) {
                    object.geometry.dispose();
                    if (object.material instanceof Array) {
                        object.material.forEach(m => m.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            });
            
            renderer.dispose();
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
        };
    }, []); // Only run once on mount

    const handleMouseEnter = () => {
        setIsHovered(true);
        if (threeState.current.carGroup) {
            new TWEEN.Tween(threeState.current.carGroup.position)
                .to({ y: 0.3 }, 200)
                .easing(TWEEN.Easing.Quadratic.Out)
                .yoyo(true)
                .repeat(1)
                .start();
        }
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    const handleClick = () => {
        if (threeState.current.wrapperGroup) {
            const targetRot = threeState.current.wrapperGroup.rotation.y - Math.PI * 2;
            new TWEEN.Tween(threeState.current.wrapperGroup.rotation)
                .to({ y: targetRot }, 800)
                .easing(TWEEN.Easing.Exponential.InOut)
                .start();
        }
        onClick();
    };

    return (
        <div 
            ref={containerRef}
            className={cn(
                "w-[140px] h-[140px] md:w-[200px] md:h-[200px] cursor-pointer relative z-10",
                isOpen && "opacity-0 pointer-events-none"
            )}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            style={{ 
                // Pure floating car effect
            }}
        />
    );
}
