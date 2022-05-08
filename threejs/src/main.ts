// import './style.css'
import SpotifyWebApi from 'spotify-web-api-node';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'
import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { BufferGeometry, Vector3 } from 'three';

const awaitFunc = async () => {
  var spotifyApi = new SpotifyWebApi({});
  const loader = new FontLoader();
  const canvas = document.querySelector('canvas.webgl')
  const scene = new THREE.Scene()
  // const urlSearchParams = new URLSearchParams(window.location.search);
  // const authQ = urlSearchParams.get('auth')
  // const refQ = urlSearchParams.get('ref')
  // @ts-ignore
  const authQ = access
  // @ts-ignore
  const refQ = refresh
  spotifyApi.setAccessToken(authQ as string);
  spotifyApi.setRefreshToken(refQ as string);
  let trackdata = await spotifyApi.getMyTopTracks({
    time_range: "short_term",
    limit: 10,
    offset: 0
  })
  var tracks = [];
  var artists = [];
  for (var x in trackdata.body.items) {
    var val = trackdata.body.items[x];
    artists.push(val.artists[0].name);
    tracks.push(val.name);
  }
  console.log(tracks, artists)
  const songCount = 10
  const count = 2000

  let songGeo = []
  let songMesh = []
  let textGeo = []
  let textMesh: THREE.Mesh<TextGeometry>[] = []

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
    { size: 0.008, color: 0xffffff }
  )
  const materialBright = new THREE.PointsMaterial(
    { size: 0.012, color: 0xffffff }
  )
  const songMat = new THREE.MeshStandardMaterial(
    { color: 0x000000, emissive: 0xffffff, emissiveIntensity: 1 }
  )
  const textMat = new THREE.MeshBasicMaterial(
    { color: 0x777777 }
  )

  const spherePos = []
  const getRandom = () => {
    return (Math.random() - 0.5) * 4
  }
  for (let i=0;i<songCount;i++) {
    spherePos.push([getRandom(),getRandom(), getRandom()])
  }

  function loadFont() {
    return new Promise(function (resolve) {
      loader.load('font.json', resolve)
    });
  }

  let font = await loadFont()
  for (let i = 0; i < songCount; i++) {
    let geo = new THREE.SphereGeometry(0.025, 32, 16)
    let textg = new TextGeometry(tracks[i], {
      size: 0.06,
      height: 0.001,
      font: (font as Font),
      curveSegments: 4,
    });
    textGeo.push(textg)
    songGeo.push(geo)
    let mesh = new THREE.Mesh(geo, songMat)
    textg.computeBoundingBox()
    let size = new Vector3()
    textg.boundingBox?.getSize(size)
    textg.translate(-size.x / 2, -0.1, 0)
    let textm = new THREE.Mesh(textg, textMat)
    let random = spherePos[i]
    mesh.position.set(random[0], random[1], random[2])
    textm.position.set(random[0], random[1], random[2])
    songMesh.push(mesh)
    textMesh.push(textm)
  }


  //Line
  const materialLine = new THREE.LineBasicMaterial( { color: 0xFFFFFF } );
  const points: Vector3[] = [];
  // console.log(spherePos)
  for (let i = 0; i < songCount; i++) {
    points.push(new THREE.Vector3(spherePos[i][0], spherePos[i][1], spherePos[i][2]));
  }
  const closest: number[] = [];
  for (let i = 0; i < songCount; i++) {
    let dMin = 999
    let close = 0
    for (let j = 0; j < songCount; j++) {
      let d = points[i].distanceTo(points[j])
      if(d<dMin && d !== 0)
      {
        dMin = d
        close = j
      }
    }
    closest.push(close)
  }
  const lineGeo: BufferGeometry[] = []
  for (let i = 0; i < songCount; i++) {
    let p = points[closest[i]]
    let p2 = points[i]
    lineGeo.push(new THREE.BufferGeometry().setFromPoints( [p, p2] ))
  }
  const line = points.map((_,i)=>new THREE.Line( lineGeo[i], materialLine )) 
  scene.add( ...line );

  // Mesh
  const particleMesh = new THREE.Points(particleGeo, material)
  const particleMeshBright = new THREE.Points(particleGeoBright, materialBright)
  scene.add(...textMesh, ...songMesh, particleMeshBright, particleMesh)

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 1)
  ambientLight.position.x = 0
  ambientLight.position.y = 0
  ambientLight.position.z = 0
  scene.add(ambientLight)

  // Sizes
  const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
  }

  // Base camera
  const camera = new THREE.PerspectiveCamera(62, sizes.width / sizes.height, 0.1, 1000)
  camera.position.z = 4.5
  scene.add(camera)

  // Controls
  const controls = new OrbitControls(camera, (canvas as HTMLCanvasElement))
  controls.enableDamping = true
  controls.maxDistance = 7
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
  renderer.setClearColor( 0x000022, 1 );
  const params = {
    exposure: 1,
    bloomStrength: 2,
    bloomThreshold: 0.3,
    bloomRadius: 0
  };
  const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
  bloomPass.threshold = params.bloomThreshold;
  bloomPass.strength = params.bloomStrength;
  bloomPass.radius = params.bloomRadius;

  const filmPass = new FilmPass(
    0.25,   // noise intensity
    0.33,  // scanline intensity
    500,    // scanline count
    0,  // grayscale
  );
  filmPass.renderToScreen = true;

  let composer = new EffectComposer(renderer);
  composer.addPass(renderScene);
  composer.addPass(bloomPass);
  composer.addPass(filmPass);

  window.addEventListener('resize', () => {
    console.log('!resize')
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    bloomPass.setSize(sizes.width, sizes.height)
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  })
  // const clock = new THREE.Clock()
  let color = new THREE.Color(0)
  let hue = 0
  const tick = () => {
    // const elapsedTime = clock.getElapsedTime()
    particleMesh.rotateY(0.00016)
    particleMeshBright.rotateY(0.00008)
    textMesh.map(e => e.setRotationFromEuler(camera.rotation));
    hue = (hue + 0.001) % 1
    color.setHSL(hue, 1, 0.8)
    songMat.emissive = color
    renderer.render(scene, camera)
    // camera.setRotationFromEuler(new THREE.Euler(camera.rotation.x, camera.rotation.y, camera.rotation.z + 0.00005))
    // camera.position.set(camera.position.x,camera.position.y,camera.position.z - 0.0002)
    composer.render();
    window.requestAnimationFrame(tick)
  }

  tick()
}
awaitFunc()
