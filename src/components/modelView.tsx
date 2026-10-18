import { type ConfigurationSchema, type GlobalConfig, type PhaseConfig } from './visualArray'
import { Component, Suspense, useEffect, useRef, type ReactNode, type RefObject } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Float, useGLTF, Resize } from '@react-three/drei'
import * as THREE from 'three'
import Lenis from 'lenis'
import { primaryScroll } from '../App'
// import { base } from 'motion/react-client'

interface Props {
    config: ConfigurationSchema
}

interface ProgressProps {
    progress: RefObject<number>
    config: ConfigurationSchema
}

interface ModelErrorBoundaryProps {
    fallback: ReactNode
    children: ReactNode
}

interface ModelErrorBoundaryState {
    hasError: boolean
}

function convertScale(cfg : GlobalConfig | PhaseConfig){
    return (cfg.uniformscale ? [cfg.scale ?? 1,cfg.scale ?? 1,cfg.scale ?? 1] : [cfg.xs ?? 1,cfg.ys ?? 1,cfg.zs ?? 1])
}

function ProductPlaceholder() {
    return (
        <group>
            <mesh>
                <torusGeometry args={[0.8, 0.058, 12, 64]} />
                <meshBasicMaterial color="#d8ff38" />
            </mesh>
        </group>
    )
}

function ProductModel() {
    const { scene } = useGLTF('/models/3dalign.glb')
    return <primitive object={scene} scale={1} />
}

class ModelErrorBoundary extends Component<ModelErrorBoundaryProps, ModelErrorBoundaryState> {
    state: ModelErrorBoundaryState = { hasError: false }

    static getDerivedStateFromError(): ModelErrorBoundaryState {
        return { hasError: true }
    }

    render() {
        return this.state.hasError ? this.props.fallback : this.props.children
    }
}

function RotatingProduct({ progress, config }: ProgressProps) {
    const group = useRef<THREE.Group>(null!)
    const defPos = [config.global.x,config.global.y,config.global.z]
    const defRot = [THREE.MathUtils.degToRad(config.global.xr),THREE.MathUtils.degToRad(config.global.yr),THREE.MathUtils.degToRad(config.global.zr)]
    const defScale = convertScale(config.global)
    const damping = config.global.damping ?? 4.5

    useFrame((_, delta) => {
        if (!group.current) return

        const p = progress.current // 0 to 1

        // const phase = THREE.MathUtils.clamp((p-start)/ duration, 0, 1)
        // const phase1 = THREE.MathUtils.clamp(p / 0.3, 0, 1)
        // const phase2 = THREE.MathUtils.clamp((p - 0.3) / 0.3, 0, 1)
        // const phase3 = THREE.MathUtils.clamp((p - 0.6) / 0.3, 0, 1)

        // const phaseAmt = config.global.phases.length
        const lastPhase = config.global.phases.at(-1) || {start:0.9,length:0.1}
        const lastP = THREE.MathUtils.clamp((p - lastPhase.start) / lastPhase.length,0,1)
        let sums = {
            pos: {
                x:0,
                y:0,
                z:0,
            },
            rot: {
                x:0,
                y:0,
                z:0,
            },
            scale: {
                x:1,
                y:1,
                z:1,
            }
        }
        // console.log('----')
        for (const phase of config.global.phases){ 
            const pP = THREE.MathUtils.clamp((p - phase.start) / phase.length,0,1)
            // const scale = convertScale(phase)
            // const scaleStart = isMobile ? viewport.width / 4*scale : viewport.width / 2
            // const scaleEnd = isMobile ? viewport.width / 4*scale : viewport.width / 2.27
            sums.rot.x += THREE.MathUtils.lerp(THREE.MathUtils.degToRad(phase.xr) * pP,0,lastP)
            sums.rot.y += THREE.MathUtils.lerp(THREE.MathUtils.degToRad(phase.yr) * pP,0,lastP)
            sums.rot.z += THREE.MathUtils.lerp(THREE.MathUtils.degToRad(phase.zr) * pP,0,lastP)

            sums.pos.x += THREE.MathUtils.lerp(phase.x * pP,0,lastP)
            sums.pos.y += THREE.MathUtils.lerp(phase.y * pP,0,lastP)
            sums.pos.z += THREE.MathUtils.lerp(phase.z * pP,0,lastP)

            // sums.scale.x += ((scale[0] * pP)-sums.scale.x )
            // sums.scale.y += ((scale[1] * pP)-sums.scale.y )
            // sums.scale.z += ((scale[2] * pP)-sums.scale.z )
            // console.log(sums.scale)
        }

        let currentPhaseScale = [1, 1, 1] //default

        if (config.global.phases.length > 0) {
            for (let i = 0; i < config.global.phases.length; i++) {
                const currentPhase = config.global.phases[i]
                
                // Start from unit scale (1) for Phase 0, or the previous phase target
                const prevScale = i === 0 ? [1, 1, 1] : convertScale(config.global.phases[i - 1])
                const nextScale = convertScale(currentPhase)

                const pP = THREE.MathUtils.clamp((p - currentPhase.start) / currentPhase.length, 0, 1)

                // Interpolate phase target relative multipliers
                currentPhaseScale = [
                    THREE.MathUtils.lerp(prevScale[0], nextScale[0], pP),
                    THREE.MathUtils.lerp(prevScale[1], nextScale[1], pP),
                    THREE.MathUtils.lerp(prevScale[2], nextScale[2], pP)
                ]

                // Stop checking once we reach the current active phase window
                if (p <= currentPhase.start + currentPhase.length) break
            }
        }

        const targetScale = [
            currentPhaseScale[0] * defScale[0],
            currentPhaseScale[1] * defScale[1],
            currentPhaseScale[2] * defScale[2]
        ]

        // Apply smooth damping
        group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, sums.rot.x+defRot[0], damping, delta)
        group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, sums.rot.y+defRot[1], damping, delta)
        group.current.rotation.z = THREE.MathUtils.damp(group.current.rotation.z, sums.rot.z+defRot[2], damping, delta)

        group.current.position.x = THREE.MathUtils.damp(group.current.position.x, sums.pos.x+defPos[0], damping, delta)
        group.current.position.y = THREE.MathUtils.damp(group.current.position.y, sums.pos.y+defPos[1], damping, delta)
        group.current.position.z = THREE.MathUtils.damp(group.current.position.z, sums.pos.z+defPos[2], damping, delta)

        group.current.scale.x = THREE.MathUtils.damp(group.current.scale.x, targetScale[0], damping, delta)
        group.current.scale.y = THREE.MathUtils.damp(group.current.scale.y, targetScale[1], damping, delta)
        group.current.scale.z = THREE.MathUtils.damp(group.current.scale.z, targetScale[2], damping, delta)
    })

    const float=config.global.floating ?? 1
    return (
        <group ref={group}>
            <Float speed={float} rotationIntensity={0.5*float} floatIntensity={0.5*float}>
                <Suspense fallback={<ProductPlaceholder />}>
                    <ModelErrorBoundary fallback={<ProductPlaceholder />}>
                        <Resize height>
                            <ProductModel />
                        </Resize>
                    </ModelErrorBoundary>
                </Suspense>
            </Float>
        </group>
    )
}

function Scene({ progress, config }: ProgressProps) {
    return (
        <Canvas
            camera={{ position: [0, 0.25, 6], fov: 45 }}
            dpr={[1, 1.7]}
            gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        >
            <ambientLight intensity={0.01} />
            <directionalLight position={[3, 4, 4]} intensity={0.2} color="#fffbed" />
            <directionalLight position={[-4, 0, 2]} intensity={0.1} color="#8db3bd" />
            <RotatingProduct progress={progress} config={config} />
            <Environment preset="warehouse" environmentIntensity={0.5} />
        </Canvas>
    )
}

export default function ModelView({ config }: Props) {
    const progress = useRef<number>(0)

    // Container refs
    const scrollWrapperRef = useRef<HTMLDivElement>(null)
    const scrollContentRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const wrapper = scrollWrapperRef.current
        const content = scrollContentRef.current

        if (!wrapper || !content) return

        const lenis = new Lenis({
            wrapper,
            content,
            lerp: 0.085,
            smoothWheel: true,
        })

        lenis.on('scroll', (e: { progress: number }) => {
            progress.current = e.progress
        })

        let animationFrameId: number

        function raf(time: number) {
            lenis.raf(time)
            animationFrameId = requestAnimationFrame(raf)
        }

        animationFrameId = requestAnimationFrame(raf)

        return () => {
            cancelAnimationFrame(animationFrameId)
            lenis.destroy()
        }
    }, [])

    return (
        <div
            ref={scrollWrapperRef}
            style={{backgroundColor:config.global.bgcolor}}
            className={`relative h-full overflow-y-auto ${primaryScroll}`}
        >
            <div className="sticky top-0 h-screen w-full pointer-events-none">
                <Scene progress={progress} config={config} />
            </div>

            <div ref={scrollContentRef} style={{height:`${config.global.pageheight*100}vh`}} className="absolute inset-0 flex w-full pointer-events-none">
            </div>
        </div>
    )
}