import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RotateCw, Maximize2 } from 'lucide-react';
import type { EvidenceItem } from '../types';

export const HeroScene: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  const [hoveredMarker, setHoveredMarker] = useState<EvidenceItem | null>(null);
  const [markerScreenPos, setMarkerScreenPos] = useState<{ x: number; y: number } | null>(null);
  const [isInteracting, setIsInteracting] = useState(false);

  const evidenceData: EvidenceItem[] = [
    {
      id: 'ev-01',
      number: '01',
      label: 'Impact & Glass Dispersion',
      description: 'Micro-fracture dispersion pattern detected. Origin vector: 42°.',
      confidence: '98.4%',
      type: 'Physical Ballistic / Force',
      coordinates: [-0.4, 0.25, 1.3],
    },
    {
      id: 'ev-02',
      number: '02',
      label: 'Overturned Chair Trajectory',
      description: 'Rapid backward displacement consistent with sudden evasion.',
      confidence: '95.1%',
      type: 'Kinematic Disturbance',
      coordinates: [-1.9, 0.25, 0.3],
    },
    {
      id: 'ev-03',
      number: '03',
      label: 'Latent Friction Ridge / Sole Impression',
      description: 'Partial synthetic tread match. Surface depression depth: 1.4mm.',
      confidence: '92.7%',
      type: 'Forensic Trace',
      coordinates: [1.4, 0.25, 0.9],
    },
    {
      id: 'ev-04',
      number: '04',
      label: 'Egress Point / Threshold Residue',
      description: 'Door latch fracture residue. Exit velocity estimated 3.8 m/s.',
      confidence: '97.2%',
      type: 'Access Analysis',
      coordinates: [2.7, 0.25, -2.0],
    },
  ];

  const resetCamera = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(11.2, 9.2, 12.8);
      controlsRef.current.target.set(0.1, 1.2, 0.1);
      controlsRef.current.update();
    }
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth;
    let height = container.clientHeight;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020612, 0.02);

    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 100);
    // Isometric crime scene perspective
    camera.position.set(11.2, 9.2, 12.8);
    const targetPos = new THREE.Vector3(0.1, 1.2, 0.1);
    camera.lookAt(targetPos);
    cameraRef.current = camera;

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 2.1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    container.appendChild(renderer.domElement);

    // 3. OrbitControls - True 360° 3D Orbit, Drag to Rotate, Scroll to Zoom
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.target.copy(targetPos);
    controls.minDistance = 6.5;
    controls.maxDistance = 26.0;
    controls.maxPolarAngle = Math.PI / 2 + 0.12; // allow slight under-angle but keep mostly elevated
    controls.minPolarAngle = 0.1;
    controlsRef.current = controls;

    controls.addEventListener('start', () => setIsInteracting(true));
    controls.addEventListener('end', () => setIsInteracting(false));

    // 4. Cinematic Forensic Lighting
    const ambientLight = new THREE.AmbientLight(0x28426d, 3.8);
    scene.add(ambientLight);

    // Warm Interior Ceiling Light (Golden Amber)
    const ceilingWarmLight = new THREE.PointLight(0xffeedb, 14.0, 22);
    ceilingWarmLight.position.set(0.2, 3.8, 0);
    ceilingWarmLight.castShadow = true;
    ceilingWarmLight.shadow.bias = -0.001;
    scene.add(ceilingWarmLight);

    // Warm Dining Table Lamp Light
    const tableLight = new THREE.PointLight(0xffaa44, 8.5, 12);
    tableLight.position.set(-1.4, 2.2, -1.2);
    scene.add(tableLight);

    // Floor Lamp Light
    const lampLight = new THREE.PointLight(0xffb855, 7.0, 10);
    lampLight.position.set(3.2, 2.6, 0.4);
    scene.add(lampLight);

    // Door Threshold Golden Glow
    const doorLight = new THREE.PointLight(0xff9933, 6.0, 8);
    doorLight.position.set(3.4, 0.4, -2.0);
    scene.add(doorLight);

    // Electric Cyan Forensic Directional Light (Point-cloud side)
    const cyanDirLight = new THREE.DirectionalLight(0x00f0ff, 9.5);
    cyanDirLight.position.set(-8, 9, 7);
    scene.add(cyanDirLight);

    const cyanFillPoint = new THREE.PointLight(0x00f0ff, 9.0, 16);
    cyanFillPoint.position.set(-3.5, 2.8, 2.6);
    scene.add(cyanFillPoint);

    // Window Exterior Cool Blue Light
    const windowLight = new THREE.DirectionalLight(0x38bdf8, 5.5);
    windowLight.position.set(-1.2, 4.5, -8);
    scene.add(windowLight);

    // 5. True 3D Room Model Construction
    const roomGroup = new THREE.Group();
    scene.add(roomGroup);

    // A. 3D Floor - Physical Slab with Procedural Parquet Wood Texture
    const floorGeo = new THREE.BoxGeometry(8.0, 0.25, 8.0);
    const floorCanvas = document.createElement('canvas');
    floorCanvas.width = 512;
    floorCanvas.height = 512;
    const fCtx = floorCanvas.getContext('2d');
    if (fCtx) {
      fCtx.fillStyle = '#443122';
      fCtx.fillRect(0, 0, 512, 512);
      // Parquet planks
      for (let i = 0; i < 512; i += 32) {
        fCtx.fillStyle = i % 64 === 0 ? '#563e2c' : '#4a3525';
        fCtx.fillRect(0, i, 512, 30);
        fCtx.fillStyle = '#261910';
        fCtx.fillRect(0, i + 30, 512, 2);
      }
    }
    const floorTexture = new THREE.CanvasTexture(floorCanvas);
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(4, 4);

    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTexture,
      roughness: 0.32,
      metalness: 0.15,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.set(0, -0.125, 0);
    floor.receiveShadow = true;
    roomGroup.add(floor);

    // Glowing Cyan Floor Spatial Grid
    const floorGridGeo = new THREE.PlaneGeometry(8.0, 8.0, 20, 20);
    const floorGridMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.32,
    });
    const floorGrid = new THREE.Mesh(floorGridGeo, floorGridMat);
    floorGrid.rotation.x = -Math.PI / 2;
    floorGrid.position.y = 0.01;
    roomGroup.add(floorGrid);

    // Glowing Cyan Floor Edges
    const floorBoxGeo = new THREE.EdgesGeometry(floorGeo);
    const floorBoxMat = new THREE.LineBasicMaterial({
      color: 0x00f0ff,
      linewidth: 2.5,
      transparent: true,
      opacity: 0.95,
    });
    const floorBoxOutline = new THREE.LineSegments(floorBoxGeo, floorBoxMat);
    floorBoxOutline.position.copy(floor.position);
    roomGroup.add(floorBoxOutline);

    // B. 3D Back Wall - With Framed Window & Bookshelf
    const backWallGeo = new THREE.BoxGeometry(8.0, 4.5, 0.25);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x222d42,
      roughness: 0.7,
      metalness: 0.1,
    });
    const backWall = new THREE.Mesh(backWallGeo, wallMat);
    backWall.position.set(0, 2.15, -4.0);
    backWall.receiveShadow = true;
    roomGroup.add(backWall);

    // Cyan wireframe edge on back wall
    const backWallWireGeo = new THREE.EdgesGeometry(backWallGeo);
    const cyanWireMat = new THREE.LineBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.8 });
    const backWallWire = new THREE.LineSegments(backWallWireGeo, cyanWireMat);
    backWallWire.position.copy(backWall.position);
    roomGroup.add(backWallWire);

    // 3D Window Frame on Back Wall
    const windowFrameGeo = new THREE.BoxGeometry(2.8, 2.8, 0.3);
    const windowFrameMat = new THREE.MeshStandardMaterial({
      color: 0x0d1527,
      roughness: 0.4,
    });
    const windowFrame = new THREE.Mesh(windowFrameGeo, windowFrameMat);
    windowFrame.position.set(-1.2, 2.65, -3.9);
    roomGroup.add(windowFrame);

    // Glowing Window Panes with Cool Blue Light
    const windowGlassGeo = new THREE.PlaneGeometry(2.5, 2.5);
    const windowGlassMat = new THREE.MeshBasicMaterial({
      color: 0x0ea5e9,
      transparent: true,
      opacity: 0.7,
    });
    const windowGlass = new THREE.Mesh(windowGlassGeo, windowGlassMat);
    windowGlass.position.set(-1.2, 2.65, -3.73);
    roomGroup.add(windowGlass);

    // Cyan Window Grid Mullions
    const windowGridGeo = new THREE.PlaneGeometry(2.5, 2.5, 3, 3);
    const windowGridMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
    });
    const windowGrid = new THREE.Mesh(windowGridGeo, windowGridMat);
    windowGrid.position.set(-1.2, 2.65, -3.71);
    roomGroup.add(windowGrid);

    // 3D Bookshelf against Back Wall
    const shelfGeo = new THREE.BoxGeometry(1.8, 2.2, 0.45);
    const shelfMat = new THREE.MeshStandardMaterial({ color: 0x452a1b, roughness: 0.45 });
    const shelf = new THREE.Mesh(shelfGeo, shelfMat);
    shelf.position.set(1.5, 1.25, -3.75);
    shelf.castShadow = true;
    roomGroup.add(shelf);

    // Books on the shelf
    const bookColors = [0x991b1b, 0x1e3a8a, 0x065f46, 0xb45309];
    for (let b = 0; b < 12; b++) {
      const bookGeo = new THREE.BoxGeometry(0.1, 0.35, 0.3);
      const bookMat = new THREE.MeshStandardMaterial({ color: bookColors[b % bookColors.length] });
      const book = new THREE.Mesh(bookGeo, bookMat);
      book.position.set(0.9 + b * 0.11, 1.5, -3.65);
      roomGroup.add(book);
    }

    // C. 3D Right Wall - With Door, Threshold Light & Artwork
    const rightWallGeo = new THREE.BoxGeometry(0.25, 4.5, 8.0);
    const rightWall = new THREE.Mesh(rightWallGeo, wallMat);
    rightWall.position.set(4.0, 2.15, 0);
    rightWall.receiveShadow = true;
    roomGroup.add(rightWall);

    const rightWallWireGeo = new THREE.EdgesGeometry(rightWallGeo);
    const rightWallWire = new THREE.LineSegments(rightWallWireGeo, cyanWireMat);
    rightWallWire.position.copy(rightWall.position);
    roomGroup.add(rightWallWire);

    // 3D Door Frame on Right Wall
    const doorFrameGeo = new THREE.BoxGeometry(0.3, 3.3, 1.7);
    const doorMat = new THREE.MeshStandardMaterial({
      color: 0x4d3222,
      roughness: 0.45,
    });
    const door = new THREE.Mesh(doorFrameGeo, doorMat);
    door.position.set(3.9, 1.55, -2.0);
    roomGroup.add(door);

    // Door Handle
    const handleGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.15);
    const handleMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.85 });
    const handle = new THREE.Mesh(handleGeo, handleMat);
    handle.rotation.z = Math.PI / 2;
    handle.position.set(3.72, 1.55, -1.4);
    roomGroup.add(handle);

    // Warm Light Leaking Under Door Threshold
    const doorLightBarGeo = new THREE.PlaneGeometry(0.14, 1.6);
    const doorLightBarMat = new THREE.MeshBasicMaterial({
      color: 0xffaa44,
      transparent: true,
      opacity: 0.95,
    });
    const doorLightBar = new THREE.Mesh(doorLightBarGeo, doorLightBarMat);
    doorLightBar.rotation.x = -Math.PI / 2;
    doorLightBar.position.set(3.82, 0.025, -2.0);
    roomGroup.add(doorLightBar);

    // Framed Artwork on Right Wall
    const artGeo = new THREE.BoxGeometry(0.06, 1.3, 1.8);
    const artMat = new THREE.MeshStandardMaterial({ color: 0x111c33, roughness: 0.5 });
    const art = new THREE.Mesh(artGeo, artMat);
    art.position.set(3.9, 3.0, 0.6);
    roomGroup.add(art);

    // 6. Physical 3D Furniture in Crime Scene Room
    // A. 3D Dining Table
    const tableTopGeo = new THREE.BoxGeometry(2.6, 0.1, 1.4);
    const woodMat = new THREE.MeshStandardMaterial({
      color: 0x543622,
      roughness: 0.35,
      metalness: 0.1,
    });
    const tableTop = new THREE.Mesh(tableTopGeo, woodMat);
    tableTop.position.set(-1.4, 1.18, -1.3);
    tableTop.castShadow = true;
    tableTop.receiveShadow = true;
    roomGroup.add(tableTop);

    // 4 Dining table legs
    const legGeo = new THREE.CylinderGeometry(0.045, 0.045, 1.15);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3 });
    [
      [-2.6, 0.59, -1.9],
      [-0.2, 0.59, -1.9],
      [-2.6, 0.59, -0.7],
      [-0.2, 0.59, -0.7],
    ].forEach(([lx, ly, lz]) => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(lx, ly, lz);
      leg.castShadow = true;
      roomGroup.add(leg);
    });

    // Potted plants on dining table
    for (let p = 0; p < 3; p++) {
      const potGeo = new THREE.CylinderGeometry(0.09, 0.07, 0.18);
      const potMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.2 });
      const pot = new THREE.Mesh(potGeo, potMat);
      pot.position.set(-1.8 + p * 0.4, 1.32, -1.3);
      roomGroup.add(pot);
    }

    // B. 3D Dining Chairs
    const createChair = (cx: number, cz: number, rotY: number, overturned = false) => {
      const chairGroup = new THREE.Group();
      const seatGeo = new THREE.BoxGeometry(0.52, 0.05, 0.52);
      const chairMat = new THREE.MeshStandardMaterial({ color: 0x3d271a, roughness: 0.4 });
      const seat = new THREE.Mesh(seatGeo, chairMat);
      seat.position.set(0, 0.62, 0);
      seat.castShadow = true;
      chairGroup.add(seat);

      // Backrest
      const backGeo = new THREE.BoxGeometry(0.52, 0.62, 0.04);
      const back = new THREE.Mesh(backGeo, chairMat);
      back.position.set(0, 0.93, -0.24);
      back.castShadow = true;
      chairGroup.add(back);

      // 4 Legs
      const cLegGeo = new THREE.CylinderGeometry(0.024, 0.024, 0.62);
      [
        [-0.22, 0.31, -0.22],
        [0.22, 0.31, -0.22],
        [-0.22, 0.31, 0.22],
        [0.22, 0.31, 0.22],
      ].forEach(([x, y, z]) => {
        const cl = new THREE.Mesh(cLegGeo, legMat);
        cl.position.set(x, y, z);
        cl.castShadow = true;
        chairGroup.add(cl);
      });

      if (overturned) {
        // Crime Scene: Knocked-over chair lying on its side
        chairGroup.rotation.z = Math.PI / 2.1;
        chairGroup.rotation.y = 0.45;
        chairGroup.position.set(cx, 0.3, cz);
      } else {
        chairGroup.rotation.y = rotY;
        chairGroup.position.set(cx, 0, cz);
      }
      roomGroup.add(chairGroup);
    };

    createChair(-1.8, -2.1, 0);
    createChair(-1.0, -2.1, 0);
    createChair(-1.0, -0.45, Math.PI);
    // Overturned chair on floor near marker 02
    createChair(-1.8, -0.2, 0, true);

    // C. 3D Modern Lounge Sofa (Deep Slate-Blue)
    const sofaGroup = new THREE.Group();
    const sofaBaseGeo = new THREE.BoxGeometry(2.9, 0.52, 1.25);
    const sofaMat = new THREE.MeshStandardMaterial({
      color: 0x22334f,
      roughness: 0.82,
    });
    const sofaBase = new THREE.Mesh(sofaBaseGeo, sofaMat);
    sofaBase.position.set(0, 0.36, 0);
    sofaBase.castShadow = true;
    sofaBase.receiveShadow = true;
    sofaGroup.add(sofaBase);

    // Sofa Backrest
    const sofaBackGeo = new THREE.BoxGeometry(2.9, 0.68, 0.34);
    const sofaBack = new THREE.Mesh(sofaBackGeo, sofaMat);
    sofaBack.position.set(0, 0.82, 0.46);
    sofaBack.castShadow = true;
    sofaGroup.add(sofaBack);

    // Armrests
    const armGeo = new THREE.BoxGeometry(0.34, 0.58, 1.25);
    const leftArm = new THREE.Mesh(armGeo, sofaMat);
    leftArm.position.set(-1.4, 0.62, 0);
    sofaGroup.add(leftArm);
    const rightArm = new THREE.Mesh(armGeo, sofaMat);
    rightArm.position.set(1.4, 0.62, 0);
    sofaGroup.add(rightArm);

    // Sofa Cushions
    const cushionGeo = new THREE.BoxGeometry(1.1, 0.2, 0.85);
    const cushionMat = new THREE.MeshStandardMaterial({ color: 0x2c4266, roughness: 0.85 });
    const c1 = new THREE.Mesh(cushionGeo, cushionMat);
    c1.position.set(-0.65, 0.68, -0.05);
    sofaGroup.add(c1);
    const c2 = new THREE.Mesh(cushionGeo, cushionMat);
    c2.position.set(0.65, 0.68, -0.05);
    sofaGroup.add(c2);

    // Throw Pillows
    const pillowGeo = new THREE.BoxGeometry(0.4, 0.4, 0.18);
    const pillowMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.9 });
    const pillow = new THREE.Mesh(pillowGeo, pillowMat);
    pillow.rotation.set(0.2, 0.3, 0.2);
    pillow.position.set(-1.1, 0.85, 0.2);
    sofaGroup.add(pillow);

    sofaGroup.rotation.y = -Math.PI / 4;
    sofaGroup.position.set(2.0, 0, 1.6);
    roomGroup.add(sofaGroup);

    // Classical Area Rug under Sofa
    const rugGeo = new THREE.PlaneGeometry(3.2, 2.1);
    const rugMat = new THREE.MeshStandardMaterial({
      color: 0x28364e,
      roughness: 0.95,
    });
    const rug = new THREE.Mesh(rugGeo, rugMat);
    rug.rotation.x = -Math.PI / 2;
    rug.rotation.z = -Math.PI / 4;
    rug.position.set(1.6, 0.02, 1.1);
    roomGroup.add(rug);

    // D. 3D Floor Lamp beside Sofa / Door
    const lampPoleGeo = new THREE.CylinderGeometry(0.035, 0.035, 2.6);
    const lampPoleMat = new THREE.MeshStandardMaterial({ color: 0xcfd8dc, metalness: 0.85 });
    const lampPole = new THREE.Mesh(lampPoleGeo, lampPoleMat);
    lampPole.position.set(3.3, 1.3, 0.3);
    roomGroup.add(lampPole);

    const lampShadeGeo = new THREE.ConeGeometry(0.4, 0.5, 18, 1, true);
    const lampShadeMat = new THREE.MeshStandardMaterial({
      color: 0xffe0b2,
      emissive: 0xffaa44,
      emissiveIntensity: 0.9,
      side: THREE.DoubleSide,
    });
    const lampShade = new THREE.Mesh(lampShadeGeo, lampShadeMat);
    lampShade.position.set(3.3, 2.5, 0.3);
    roomGroup.add(lampShade);

    // E. 3D Broken Glass / Evidence Debris on Floor (around Marker 01)
    const glassGroup = new THREE.Group();
    const glassShardGeo = new THREE.TetrahedronGeometry(0.075);
    const glassShardMat = new THREE.MeshPhysicalMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 0.6,
      transmission: 0.95,
      roughness: 0.1,
      metalness: 0.1,
    });

    for (let i = 0; i < 36; i++) {
      const shard = new THREE.Mesh(glassShardGeo, glassShardMat);
      const radius = Math.random() * 0.9;
      const angle = Math.random() * Math.PI * 2;
      shard.position.set(-0.4 + Math.cos(angle) * radius, 0.04, 1.3 + Math.sin(angle) * radius);
      shard.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      shard.scale.set(Math.random() * 0.9 + 0.5, Math.random() * 0.4 + 0.2, Math.random() * 0.9 + 0.5);
      glassGroup.add(shard);
    }
    roomGroup.add(glassGroup);



    // Glowing Cyan Bounding Wireframe Cube
    const boundsBoxGeo = new THREE.BoxGeometry(8.0, 4.5, 8.0);
    const boundsWireGeo = new THREE.EdgesGeometry(boundsBoxGeo);
    const boundsWireMat = new THREE.LineBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.75,
      linewidth: 2,
    });
    const boundsWireframe = new THREE.LineSegments(boundsWireGeo, boundsWireMat);
    boundsWireframe.position.set(0, 2.15, 0);
    roomGroup.add(boundsWireframe);

    // 8. 3D Evidence Tent Markers (01, 02, 03, 04)
    const markerMeshes: THREE.Group[] = [];

    const createEvidenceTent = (num: string, pos: [number, number, number]) => {
      const markerGroup = new THREE.Group();
      markerGroup.position.set(pos[0], pos[1], pos[2]);

      // A-frame folded tent geometry
      const tentGeo = new THREE.BufferGeometry();
      const w = 0.36;
      const h = 0.44;
      const d = 0.38;
      const vertices = new Float32Array([
        -w / 2, 0, d / 2,
        w / 2, 0, d / 2,
        w / 2, h, 0,
        -w / 2, 0, d / 2,
        w / 2, h, 0,
        -w / 2, h, 0,
        w / 2, 0, -d / 2,
        -w / 2, 0, -d / 2,
        -w / 2, h, 0,
        w / 2, 0, -d / 2,
        -w / 2, h, 0,
        w / 2, h, 0,
      ]);

      const uvs = new Float32Array([
        0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1,
        0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1,
      ]);

      tentGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      tentGeo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
      tentGeo.computeVertexNormals();

      const markerCanvas = document.createElement('canvas');
      markerCanvas.width = 256;
      markerCanvas.height = 256;
      const mCtx = markerCanvas.getContext('2d');
      if (mCtx) {
        mCtx.fillStyle = '#facc15';
        mCtx.fillRect(0, 0, 256, 256);
        mCtx.strokeStyle = '#ca8a04';
        mCtx.lineWidth = 14;
        mCtx.strokeRect(8, 8, 240, 240);
        mCtx.fillStyle = '#05070d';
        mCtx.font = '900 138px "Outfit", sans-serif';
        mCtx.textAlign = 'center';
        mCtx.textBaseline = 'middle';
        mCtx.fillText(num, 128, 130);
      }
      const markerTex = new THREE.CanvasTexture(markerCanvas);

      const markerMat = new THREE.MeshStandardMaterial({
        map: markerTex,
        roughness: 0.3,
        side: THREE.DoubleSide,
      });
      const tentMesh = new THREE.Mesh(tentGeo, markerMat);
      tentMesh.castShadow = true;
      markerGroup.add(tentMesh);

      // Yellow glow ring on floor
      const ringGeo = new THREE.RingGeometry(0.26, 0.44, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xfacc15,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.02;
      markerGroup.add(ring);

      // Floating Yellow Marker Badge
      const badgeCanvas = document.createElement('canvas');
      badgeCanvas.width = 128;
      badgeCanvas.height = 128;
      const bCtx = badgeCanvas.getContext('2d');
      if (bCtx) {
        bCtx.fillStyle = '#facc15';
        bCtx.fillRect(12, 12, 104, 104);
        bCtx.strokeStyle = '#ca8a04';
        bCtx.lineWidth = 8;
        bCtx.strokeRect(16, 16, 96, 96);
        bCtx.fillStyle = '#05070d';
        bCtx.font = '900 68px "Outfit", sans-serif';
        bCtx.textAlign = 'center';
        bCtx.textBaseline = 'middle';
        bCtx.fillText(num, 64, 66);
      }
      const badgeTex = new THREE.CanvasTexture(badgeCanvas);
      const spriteMat = new THREE.SpriteMaterial({
        map: badgeTex,
        transparent: true,
        depthTest: false,
      });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.position.set(0, 0.7, 0);
      sprite.scale.set(0.52, 0.52, 1);
      markerGroup.add(sprite);

      markerGroup.userData = { id: `ev-${num}`, number: num };
      roomGroup.add(markerGroup);
      markerMeshes.push(markerGroup);
      return markerGroup;
    };

    evidenceData.forEach((ev) => {
      createEvidenceTent(ev.number, ev.coordinates);
    });

    // 9. 3D Cyan Measurement Lines & Dimension HUD Labels
    const createMeasurementLine = (
      p1: [number, number, number],
      p2: [number, number, number],
      text: string
    ) => {
      const points = [
        new THREE.Vector3(p1[0], p1[1] + 0.15, p1[2]),
        new THREE.Vector3(p2[0], p2[1] + 0.15, p2[2]),
      ];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineDashedMaterial({
        color: 0x00f0ff,
        dashSize: 0.2,
        gapSize: 0.1,
        linewidth: 2.5,
        transparent: true,
        opacity: 0.95,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      line.computeLineDistances();
      roomGroup.add(line);

      const dotGeo = new THREE.SphereGeometry(0.05, 16, 16);
      const dotMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
      const d1 = new THREE.Mesh(dotGeo, dotMat);
      d1.position.copy(points[0]);
      const d2 = new THREE.Mesh(dotGeo, dotMat);
      d2.position.copy(points[1]);
      roomGroup.add(d1);
      roomGroup.add(d2);

      const midPoint = new THREE.Vector3().addVectors(points[0], points[1]).multiplyScalar(0.5);
      const badgeCanvas = document.createElement('canvas');
      badgeCanvas.width = 160;
      badgeCanvas.height = 56;
      const bCtx = badgeCanvas.getContext('2d');
      if (bCtx) {
        bCtx.fillStyle = 'rgba(2, 6, 20, 0.92)';
        bCtx.strokeStyle = '#00f0ff';
        bCtx.lineWidth = 3;
        bCtx.roundRect(4, 4, 152, 48, 10);
        bCtx.fill();
        bCtx.stroke();
        bCtx.fillStyle = '#00f0ff';
        bCtx.font = '700 28px "Rajdhani", monospace';
        bCtx.textAlign = 'center';
        bCtx.textBaseline = 'middle';
        bCtx.fillText(text, 80, 28);
      }
      const badgeTex = new THREE.CanvasTexture(badgeCanvas);
      const spriteMat = new THREE.SpriteMaterial({
        map: badgeTex,
        transparent: true,
        depthTest: false,
      });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.position.set(midPoint.x, midPoint.y + 0.35, midPoint.z);
      sprite.scale.set(0.85, 0.3, 1);
      roomGroup.add(sprite);
    };

    createMeasurementLine(
      evidenceData[1].coordinates,
      evidenceData[2].coordinates,
      '2.9 m'
    );

    createMeasurementLine(
      evidenceData[2].coordinates,
      evidenceData[3].coordinates,
      '2.3 m'
    );

    // 10. Scanning Laser Plane in 3D
    const scanPlaneGeo = new THREE.PlaneGeometry(8.0, 0.12);
    const scanPlaneMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide,
    });
    const scanPlane = new THREE.Mesh(scanPlaneGeo, scanPlaneMat);
    scanPlane.rotation.x = -Math.PI / 2;
    scanPlane.position.y = 0.025;
    roomGroup.add(scanPlane);

    // 11. Mouse Raycasting for Evidence Hover Tooltips
    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / width) * 2 - 1;
      const ny = -((e.clientY - rect.top) / height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(nx, ny), camera);
      const intersects = raycaster.intersectObjects(markerMeshes, true);

      if (intersects.length > 0) {
        let parent = intersects[0].object.parent;
        while (parent && !parent.userData?.id) {
          parent = parent.parent;
        }
        if (parent && parent.userData?.id) {
          const item = evidenceData.find((ev) => ev.id === parent?.userData.id);
          if (item) {
            setHoveredMarker(item);
            setMarkerScreenPos({
              x: e.clientX - rect.left,
              y: e.clientY - rect.top,
            });
            document.body.style.cursor = 'pointer';
            return;
          }
        }
      }
      setHoveredMarker(null);
      document.body.style.cursor = 'default';
    };

    container.addEventListener('mousemove', handlePointerMove);

    // 12. Animation Loop with Subtle Breathing and 3D Orbit
    let clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Keep 3D room structure grounded and stationary
      roomGroup.position.y = 0;

      controls.update();

      // Scanning line sweep
      scanPlane.position.z = Math.sin(elapsedTime * 1.5) * 3.8;

      // Marker pulse animation
      markerMeshes.forEach((m, idx) => {
        const ring = m.children[1] as THREE.Mesh;
        if (ring) {
          const scale = 1 + Math.sin(elapsedTime * 3.5 + idx * 1.5) * 0.2;
          ring.scale.set(scale, scale, 1);
        }
      });

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '540px',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: isInteracting ? 'grabbing' : 'grab',
      }}
    >
      {/* 3D Interaction HUD Controls (Top Right) */}
      <div style={{
        position: 'absolute',
        top: '12px',
        right: '16px',
        zIndex: 25,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <div style={{
          background: 'rgba(2, 6, 20, 0.75)',
          border: '1px solid rgba(0, 240, 255, 0.25)',
          borderRadius: '20px',
          padding: '4px 12px',
          fontSize: '11px',
          fontFamily: 'var(--font-mono)',
          color: '#38bdf8',
          letterSpacing: '1px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          backdropFilter: 'blur(8px)',
        }}>
          <Maximize2 size={12} color="#00f0ff" />
          <span>DRAG TO ORBIT 3D • SCROLL TO ZOOM</span>
        </div>

        <button
          onClick={resetCamera}
          title="Reset 3D View"
          style={{
            background: 'rgba(2, 6, 20, 0.75)',
            border: '1px solid rgba(0, 240, 255, 0.3)',
            borderRadius: '50%',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#00f0ff',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#00f0ff';
            e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 240, 255, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.3)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <RotateCw size={13} />
        </button>
      </div>

      {/* Interactive Evidence Marker HUD Popover */}
      {hoveredMarker && markerScreenPos && (
        <div
          className="glass-panel"
          style={{
            position: 'absolute',
            left: `${markerScreenPos.x + 16}px`,
            top: `${markerScreenPos.y - 40}px`,
            zIndex: 35,
            padding: '12px 16px',
            borderRadius: '10px',
            pointerEvents: 'none',
            minWidth: '240px',
            border: '1.5px solid #00f0ff',
            boxShadow: '0 0 25px rgba(0, 240, 255, 0.45)',
            background: 'rgba(2, 6, 20, 0.94)',
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '4px',
          }}>
            <span style={{
              background: '#facc15',
              color: '#000000',
              fontWeight: 800,
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              padding: '2px 6px',
              borderRadius: '4px',
            }}>
              MARKER {hoveredMarker.number}
            </span>
            <span style={{
              fontSize: '11px',
              color: '#00f0ff',
              fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase',
            }}>
              CONFIDENCE: {hoveredMarker.confidence}
            </span>
          </div>

          <div style={{
            fontSize: '13.5px',
            fontWeight: 700,
            color: '#ffffff',
            fontFamily: 'var(--font-display)',
            marginBottom: '4px',
          }}>
            {hoveredMarker.label}
          </div>

          <div style={{
            fontSize: '11.5px',
            color: '#94a3b8',
            lineHeight: 1.4,
          }}>
            {hoveredMarker.description}
          </div>
        </div>
      )}

      {/* Subtle bottom-right HUD coordinate badge */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        right: '16px',
        fontSize: '10.5px',
        fontFamily: 'var(--font-mono)',
        color: 'rgba(0, 240, 255, 0.55)',
        letterSpacing: '1px',
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '2px',
        zIndex: 20,
      }}>
        <span>GRID: 8.0m × 8.0m TRUE 3D MODEL</span>
        <span>SCENE STATUS: CALIBRATED</span>
        <span>EVIDENCE MARKERS: 04 ACTIVE</span>
      </div>
    </div>
  );
};
