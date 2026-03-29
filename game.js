import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

// --- KURULUM ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // Gökyüzü
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- IŞIKLANDIRMA ---
const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
scene.add(light);

// --- ZEMİN VE ÇEVRE ---
const grid = new THREE.GridHelper(100, 50);
scene.add(grid);

const floorGeo = new THREE.PlaneGeometry(100, 100);
const floorMat = new THREE.MeshStandardMaterial({ color: 0x555555 });
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Hedefler (Kutular)
for(let i=0; i<10; i++) {
    const box = new THREE.Mesh(
        new THREE.BoxGeometry(2, 2, 2),
        new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff })
    );
    box.position.set(Math.random()*40-20, 1, Math.random()*40-20);
    scene.add(box);
}

// --- KONTROLLER ---
const controls = new PointerLockControls(camera, document.body);
const startBtn = document.getElementById('start-btn');
const instructions = document.getElementById('instructions');

startBtn.addEventListener('click', () => {
    controls.lock();
});

controls.addEventListener('lock', () => instructions.style.display = 'none');
controls.addEventListener('unlock', () => instructions.style.display = 'flex');

// Hareket Değişkenleri
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

const onKeyDown = (e) => {
    switch (e.code) {
        case 'KeyW': moveForward = true; break;
        case 'KeyS': moveBackward = true; break;
        case 'KeyA': moveLeft = true; break;
        case 'KeyD': moveRight = true; break;
    }
};

const onKeyUp = (e) => {
    switch (e.code) {
        case 'KeyW': moveForward = false; break;
        case 'KeyS': moveBackward = false; break;
        case 'KeyA': moveLeft = false; break;
        case 'KeyD': moveRight = false; break;
    }
};

document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);

// --- MOBİL DESTEĞİ (Basit Dokunmatik Bakış) ---
let isMobile = /Android|iPhone/i.test(navigator.userAgent);
if(isMobile) {
    document.getElementById('joystick-zone').style.display = 'block';
    document.getElementById('shoot-btn').style.display = 'block';
    
    // Mobil için basit bir sürükle-bak sistemi
    document.addEventListener('touchmove', (e) => {
        if(e.touches.length > 0 && !controls.isLocked) {
            const touch = e.touches[0];
            camera.rotation.y -= touch.force * 0.1; // Çok temel bir mantık
        }
    });
}

// --- OYUN DÖNGÜSÜ ---
let prevTime = performance.now();
function animate() {
    requestAnimationFrame(animate);

    const time = performance.now();
    const delta = (time - prevTime) / 1000;

    if (controls.isLocked || isMobile) {
        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.normalize();

        if (moveForward || moveBackward) velocity.z -= direction.z * 100.0 * delta;
        if (moveLeft || moveRight) velocity.x -= direction.x * 100.0 * delta;

        controls.moveRight(-velocity.x * delta);
        controls.moveForward(-velocity.z * delta);
    }

    prevTime = time;
    renderer.render(scene, camera);
}

animate();

// Pencere Boyutu Güncelleme
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
