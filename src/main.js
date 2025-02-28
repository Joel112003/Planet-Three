import "./style.css";
import * as THREE from "three";
import gsap from "gsap";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  25,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);

const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("canvas"),
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

// Load HDRI lighting
const rgbeLoader = new RGBELoader();
rgbeLoader.load(
  "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/16k%2B/kloofendal_48d_partly_cloudy_puresky_4k.hdr",
  function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
    scene.background = texture;
  }
);

// Planet parameters
const radius = 1.3;
const segments = 64;
const orbitRadius = 4.5;
const texturePaths = [
  "./planets_resources/resources/csilla/color.png",
  "./planets_resources/resources/earth/map.jpg",
  "./planets_resources/resources/venus/map.jpg",
  "./planets_resources/resources/volcanic/color.png",
];

const spheres = new THREE.Group();

// Star background
const starTexture = new THREE.TextureLoader().load(
  "./planets_resources/resources/stars.jpg"
);
starTexture.colorSpace = THREE.SRGBColorSpace;

const starGeometry = new THREE.SphereGeometry(50, 64, 64);
const starMaterial = new THREE.MeshBasicMaterial({
  map: starTexture,
  opacity: 0.4,
  transparent: true,
  side: THREE.BackSide,
});
const star = new THREE.Mesh(starGeometry, starMaterial);
scene.add(star);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Create planets
for (let i = 0; i < 4; i++) {
  const textureLoader = new THREE.TextureLoader();
  const planetTexture = textureLoader.load(texturePaths[i]);
  planetTexture.colorSpace = THREE.SRGBColorSpace;

  const geometry = new THREE.SphereGeometry(radius, segments, segments);
  const material = new THREE.MeshStandardMaterial({
    map: planetTexture,
    roughness: 0.5,
    metalness: 0.3,
  });

  const sphere = new THREE.Mesh(geometry, material);
  const angle = (i / 4) * (Math.PI * 2);
  sphere.position.x = Math.cos(angle) * orbitRadius;
  sphere.position.z = Math.sin(angle) * orbitRadius;
  spheres.add(sphere);
}

spheres.rotation.x = 0.1;
spheres.position.y = -0.8;
scene.add(spheres);

camera.position.z = 9;

let lastWheelTime = 0;
const throttleDisplay = 2000;
let currentHeadingIndex = 0;
const headings = document.querySelectorAll(".heading");

function throttleWheelHandler(event) {
  const currentTime = Date.now();
  if (currentTime - lastWheelTime < throttleDisplay) return;
  lastWheelTime = currentTime;

  if (event.deltaY > 0) {
    // Scroll Down: Move to the next in cycle
    currentHeadingIndex = (currentHeadingIndex + 1) % headings.length;
  } else if (event.deltaY < 0) {
    // Scroll Up: Move to the previous in cycle
    currentHeadingIndex =
      (currentHeadingIndex - 1 + headings.length) % headings.length;
  }

  gsap.to(spheres.rotation, {
    duration: 1,
    y: `-=${Math.PI/2}`,
    ease: "power2.inOut",
  });

  gsap.to(headings, {
    duration: 1,
    y: `-${currentHeadingIndex * 100}%`,
    ease: "power2.inOut",
  });
}



window.addEventListener("wheel", throttleWheelHandler);





// Render loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();

// Window resize event
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
