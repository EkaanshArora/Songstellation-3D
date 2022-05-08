// import './style.css'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { TextGeometry, TextGeometryParameters } from 'three/examples/jsm/geometries/TextGeometry'
import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader';

const loader = new FontLoader();
// import * as dat from 'dat.gui'

// Debug
// const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Object
const songCount = 10
const count = 10000

let songGeo = []
let songMesh = []
let textGeo = []
let textMesh = []

const particleGeo = new THREE.BufferGeometry()
const particleGeoBright = new THREE.BufferGeometry()

const posArray = new Float32Array(count * 3)
const posArrayBright = new Float32Array(count * 3)

for (let i = 0; i < count * 3; i++) {
  posArray[i] = (Math.random() - 0.5) * 7
  posArrayBright[i] = (Math.random() - 0.5) * 7
}

particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3))
particleGeoBright.setAttribute('position', new THREE.BufferAttribute(posArrayBright, 3))

// Materials

const material = new THREE.PointsMaterial(
  { size: 0.002, color: 0x777777 }
)
const materialBright = new THREE.PointsMaterial(
  { size: 0.006, color: 0xffffff }
)
const songMat = new THREE.MeshStandardMaterial(
  { color: 0xff0000, emissive: 0xff9900 }
)

const getRandom = () => {
  return (Math.random() - 0.5) * 4
}

function loadFont() {
  return new Promise(function (resolve) {
    loader.load('font.json', resolve)
  });
}

let font = await loadFont()
for (let i = 0; i < songCount; i++) {
  let geo = new THREE.SphereGeometry(0.025, 32, 16)
  let textg = new TextGeometry('z', {
    size: 1,
    height: 0.2,
    font: (font as Font),
    curveSegments: 120,
    bevelEnabled: true,
    bevelThickness: 0.1,
    bevelSize: 0.1,
    bevelOffset: 0,
    bevelSegments: 5
  });
  textGeo.push(textg)
  songGeo.push(geo)
  let mesh = new THREE.Mesh(geo, songMat)
  let textm = new THREE.Mesh(textg, songMat)
  let random = [getRandom(), getRandom(), getRandom()]
  mesh.position.set(random[0],random[2],random[2])
  textm.position.set(random[0],random[2],random[2])
  songMesh.push(mesh)
  textMesh.push(textm)
}

// Mesh
const particleMesh = new THREE.Points(particleGeo, material)
const particleMeshBright = new THREE.Points(particleGeoBright, materialBright)
scene.add(...textMesh, ...songMesh, particleMeshBright, particleMesh)

// Lights
const pointLight = new THREE.PointLight(0xffffff, 1)
pointLight.position.x = 2
pointLight.position.y = 3
pointLight.position.z = 4
scene.add(pointLight)

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(60, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 3
camera.position.y = 3
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, (canvas as HTMLCanvasElement))
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: (canvas as HTMLCanvasElement)
})
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
const renderScene = new RenderPass(scene, camera);

const params = {
  exposure: 10,
  bloomStrength: 2,
  bloomThreshold: 0.1,
  bloomRadius: 0
};
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = params.bloomThreshold;
bloomPass.strength = params.bloomStrength;
bloomPass.radius = params.bloomRadius;

let composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight
  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()
  bloomPass.setSize(sizes.width, sizes.height)
  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})
/**
 * Animate
 */

const clock = new THREE.Clock()

const tick = () => {

  const elapsedTime = clock.getElapsedTime()

  // Update objects
  // sphere.rotation.y = .5 * elapsedTime
  particleMesh.rotateY(0.00008)
  particleMeshBright.rotateY(0.00002)
  // Update Orbital Controls
  // controls.update()
  songMat.emissive = new THREE.Color(elapsedTime * 10000)
  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
  const delta = clock.getDelta();


  composer.render();
}

tick()



// // import './style.css'
// import { MeshToonMaterial, NearestFilter, PerspectiveCamera, PointLight, Scene, TextureLoader, WebGLRenderer, Vector2, WebGLRenderTarget, Mesh } from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
// import {CustomOutlinePass } from './outline';
// import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
// import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";

// const loader = new GLTFLoader();

// const scene = new Scene();

// const light2 = new PointLight(0xffffee, 1)
// let pos = 15
// light2.position.set(pos,pos,pos)
// scene.add(light2)

// const fiveTone = new TextureLoader().load('fiveTone.jpg')
// fiveTone.minFilter = NearestFilter
// fiveTone.magFilter = NearestFilter
// console.log(fiveTone)
// const newMat: MeshToonMaterial = new MeshToonMaterial({color: 0xee0077, gradientMap: fiveTone, })
// const newMat2: MeshToonMaterial = new MeshToonMaterial({color: 0x0022aa, gradientMap: fiveTone, })

// // const emissionMat: MeshToonMaterial = new MeshToonMaterial({emissive: 0xffffff, emissiveIntensity: 1 })
// // const geometry = new BoxGeometry(0.2,0.2,0.2);
// // const cube = new Mesh( geometry, emissionMat );
// // cube.position.set(10, 10,10)
// // scene.add( cube );

// // loader.load( 'toon.glb', function ( gltf ) {
// //   var model = gltf.scene;
// //   model.traverse((o) => {
// //     if ((o as Mesh).isMesh) {
// //       if(o.name.startsWith('Plane')){
// //         (o as Mesh).material = newMat2;
// //       }else{
// //         (o as Mesh).material = newMat;
// //       }
// //     }
// //   });
// // 	scene.add( gltf.scene );

// // }, undefined, function ( error ) {

// // 	console.error( error );

// // } );


// const camera = new PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 0.1, 1000 );
// camera.position.z = 15;
// camera.position.x = 10;
// camera.position.y = 10;

// const renderTarget = new WebGLRenderTarget(
//   window.innerWidth,
//   window.innerHeight,
//   {
//     depthBuffer: true,
//   }
// );

// const renderer = new WebGLRenderer({antialias: true});
// renderer.setSize( window.innerWidth, window.innerHeight );
// document.body.appendChild( renderer.domElement );
// // @ts-ignore
// const controls = new OrbitControls( camera, renderer.domElement );
// const composer = new EffectComposer(renderer, renderTarget);
// const pass = new RenderPass(scene, camera);
// composer.addPass(pass);

// const customOutline = new CustomOutlinePass(
//   new Vector2(window.innerWidth, window.innerHeight),
//   scene,
//   camera
// );
// composer.addPass(customOutline);

// function update() {
//   requestAnimationFrame(update);
//   pos=pos-0.03;
//   light2.position.set(pos,pos,pos)
//   composer.render();
// }
// update();