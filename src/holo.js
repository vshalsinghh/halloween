import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import hologramVertexShader from './shaders/hologram/vertex.glsl'
import hologramFragmentShader from './shaders/hologram/fragment.glsl'
import { depth } from 'three/examples/jsm/nodes/Nodes.js'




/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Loaders
const gltfLoader = new GLTFLoader()

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(25, sizes.width / sizes.height, 0.1, 100)
camera.position.set(7, 7, 7)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const rendererParameters = {}
rendererParameters.clearColor = '#1d1f2a'

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setClearColor(rendererParameters.clearColor)
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

//audio
const listener = new THREE.AudioListener();
camera.add(listener);

// Create a global audio source
const sound = new THREE.Audio(listener);

// Load an audio file and set it as the Audio object's buffer
const audioLoader = new THREE.AudioLoader();
audioLoader.load('./robo.wav', function(buffer) {
    sound.setBuffer(buffer);
    console.log("buffer", buffer)
    sound.setLoop(true);  // Play in a loop
    sound.setVolume(0.5); // Adjust volume
    sound.play();         // Play the audio
});

const analyser = new THREE.AudioAnalyser(sound, 32);

gui
    .addColor(rendererParameters, 'clearColor')
    .onChange(() =>
    {
        renderer.setClearColor(rendererParameters.clearColor)
    })

/**
 * Material
 */

const materialParameters = {}
materialParameters.color = '#70c1ff'
materialParameters.glitchStrength = 1

const material = new THREE.ShaderMaterial({
    vertexShader: hologramVertexShader,
    fragmentShader: hologramFragmentShader,
    uniforms: {
        uTime: new THREE.Uniform(0),
        uColor: new THREE.Uniform(new THREE.Color(materialParameters.color)),
        uGlitchStrength: new THREE.Uniform(materialParameters.glitchStrength),
        uSoundFreq: new THREE.Uniform(0)
    },
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    
})

gui
    .addColor(materialParameters, 'color')
    .onChange(() => {
        material.uniforms.uColor.value.set(materialParameters.color)
    })  

    gui.add(materialParameters, 'glitchStrength').step(0.1).min(1).max(10)
    .onChange((value) => {
        console.log(materialParameters.glitchStrength)
        material.uniforms.uGlitchStrength.value = materialParameters.glitchStrength
    })
/**
 * Objects
 */
// Torus knot
const torusKnot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.6, 0.25, 128, 32),
    material
)
torusKnot.position.x = 3
scene.add(torusKnot)

// Sphere
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(),
    material
)
sphere.position.x = - 3
scene.add(sphere)

// Suzanne
let suzanne = null
gltfLoader.load(
    './suzanne.glb',
    (gltf) =>
    {
        suzanne = gltf.scene
        suzanne.traverse((child) =>
        {
            if(child.isMesh)
                child.material = material
        })
        scene.add(suzanne)
    }
)

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    material.uniforms.uTime.value = elapsedTime

    // Rotate objects
    if(suzanne)
    {
        suzanne.rotation.x = - elapsedTime * 0.1
        suzanne.rotation.y = elapsedTime * 0.2
    }

    sphere.rotation.x = - elapsedTime * 0.1
    sphere.rotation.y = elapsedTime * 0.2

    torusKnot.rotation.x = - elapsedTime * 0.1
    torusKnot.rotation.y = elapsedTime * 0.2

    const data = analyser.getAverageFrequency();
    material.uniforms.uSoundFreq.value = data/10;
    console.log("sound data", data);

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()