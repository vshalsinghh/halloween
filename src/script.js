import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import hologramVertexShader from './shaders/hologram/vertex.glsl'
import hologramFragmentShader from './shaders/hologram/fragment.glsl'
import { depth, metalness } from 'three/examples/jsm/nodes/Nodes.js'
import { Wireframe } from 'three/examples/jsm/Addons.js'
import { mx_hash_int_3 } from 'three/examples/jsm/nodes/materialx/lib/mx_noise.js'




/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')



// Scene
const scene = new THREE.Scene()

const loadingManager = new THREE.LoadingManager();
// Loaders
const gltfLoader = new GLTFLoader(loadingManager)
const textureLoader = new THREE.TextureLoader(loadingManager)
const axesHelper = new THREE.AxesHelper( 5 ); 
// scene.add( axesHelper );



const loadingscreen = document.querySelector(".loading");

loadingManager.onStart = () => {
  console.log("loading started");
};
loadingManager.onProgress = (url, loaded, total) => {
    console.log("loading in progress");
    console.log("progress", (loaded / total) * 100, "%");
  };
loadingManager.onLoad = () => {
  console.log("loading finished");
  canvas.style.display = "block";
  loadingscreen.style.display= "none";
};

loadingManager.onError = () => {
  console.log("loading Error");
};




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
// Set zoom limits
controls.minDistance = 2;  // Minimum zoom distance
controls.maxDistance = 10; // Maximum zoom distance


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
audioLoader.load('./witchsound.mp3', function(buffer) {
    sound.setBuffer(buffer);
    console.log("buffer", buffer)
    sound.setLoop(true);  // Play in a loop
    sound.setVolume(0.5); // Adjust volume
    sound.play();         // Play the audio
});

// const analyser = new THREE.AudioAnalyser(sound, 32);

gui
    .addColor(rendererParameters, 'clearColor')
    .onChange(() =>
    {
        renderer.setClearColor(rendererParameters.clearColor)
    })

/**
 * lights
 */

const light = new THREE.AmbientLight({color: '#eb4034', intensity: 0.8})

scene.add(light)

var light2 = new THREE.AmbientLight({ color: '0x000000', intensity: 2});
scene.add(light2);

var light2 = new THREE.AmbientLight({ color: '0xdbff12', intensity: 2});
scene.add(light2);

/**
 * Material
 */

const materialParameters = {}
materialParameters.color = '#70c1ff'
materialParameters.glitchStrength = 1

const moonTexture = textureLoader.load('./moontexture.webp')

moonTexture.wrapS = THREE.RepeatWrapping
moonTexture.wrapT = THREE.RepeatWrapping
const material = new THREE.MeshStandardMaterial({
    map: moonTexture,
    color: '#eb4034',
    blending: THREE.AdditiveBlending,
    metalness: 0.3,
    roughness: 0.7,
})

const modelMaterial = new THREE.MeshStandardMaterial({
    color: '#000',
    metalness: 1

})



/**
 * Objects
 */
// Torus knot

// Sphere
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(),
    material
)
sphere.position.x = 0
scene.add(sphere)

let w;

let witchrotation = {

}
witchrotation.x = 5.5
witchrotation.y = 2.25
witchrotation.z = 0.1

witchrotation.posX = 0
witchrotation.posy = 0


gltfLoader.load('./witch_spy/scene.gltf', (gltf) =>{
     w = gltf.scene
     w.material = modelMaterial

    scene.add(w)
    w.position.set(witchrotation.posX, 2, -1)
    w.rotation.x = witchrotation.x
    w.rotation.y = witchrotation.y
    w.rotation.z = witchrotation.z
    w.scale.set(0.4, 0.4, 0.4)
    
})

gui.add(witchrotation, 'x').min(0).max(10).onChange((val) => {
    w.rotation.x = val
})
gui.add(witchrotation, 'y').min(0).max(10).onChange((val) => {
    w.rotation.y = val
})
gui.add(witchrotation, 'z').min(0).max(10).onChange((val) => {
    w.rotation.z = val
})


const count = 1000;
const positions = new Float32Array(count * 3);

for(let i=0; i< count * 3; i++){
    positions[i] = (Math.random() - 0.5) * 20
}
// console.log(particlesArray)


const particlesGeometry = new THREE.BufferGeometry()
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.2,
    sizeAttenuation: true
})

const particleTexture = textureLoader.load('./star.png')
particlesMaterial.map = particleTexture
particlesMaterial.transparent = true
particlesMaterial.alphaMap  = particleTexture
particlesMaterial.depthWrite = false
particlesMaterial.color = new THREE.Color('#88c5ff')

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))


const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)

// const particlesMaterialPurple = new THREE.PointsMaterial({
//     size: 0.1,
//     sizeAttenuation: true
// })
// particlesMaterialPurple.color = new THREE.Color('#cc12ff')

// const purpleParticlesGeo = new THREE.BufferGeometry()
// const newPos = positions.map(n => n + (Math.random() - 0.5))
// console.log("pos", positions)
// console.log("new", newPos)
// purpleParticlesGeo.setAttribute('position', new THREE.BufferAttribute(newPos, 3))
// const purpleParticles = new THREE.Points(purpleParticlesGeo, particlesMaterialPurple)
// scene.add(purpleParticles)


// raycaster

// const raycaster = new THREE.Raycaster();
// const mouse = new THREE.Vector2();
// let intersectedParticle = null;  // Store the currently intersected particle

// console.log("int", intersectedParticle)
// window.addEventListener('mousemove', onMouseMove);

// function onMouseMove(event) {
//     // Convert mouse position to normalized device coordinates (-1 to +1 range)
//     mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
//     mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

//     console.log(mouse)

// }

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    sphere.rotation.x = elapsedTime * 0.2
    // if(w)
    // w.rotation.z = elapsedTime
if(w){
    w.position.x = Math.sin(elapsedTime * 0.2) * 2
    w.position.y = Math.cos(elapsedTime * 0.2) * 2
    w.rotateOnWorldAxis(new THREE.Vector3(0 , 0, 1).normalize(), - 0.003)
    // console.log(w.rotateOnWorldAxis)
   
}

    
    

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()