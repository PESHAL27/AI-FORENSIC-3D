import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import {
  Layers,
  Map as MapIcon,
  CloudLightning,
  Ruler,
  Maximize2,
  Minimize2,
  Info,
  CheckCircle2,
  Navigation,
  Crosshair,
  Move,
  RotateCw,
  X,
} from 'lucide-react';
import type {
  DetectedEntity,
  EvidenceMarkerItem,
  MeasurementItem,
  ViewportTab,
  ViewportTool,
} from '../../types/investigation';

interface SceneViewerProps {
  entities: DetectedEntity[];
  markers: EvidenceMarkerItem[];
  measurements: MeasurementItem[];
  selectedEntityId: string | null;
  onSelectEntity: (id: string | null) => void;
  onUpdateEntityPosition?: (id: string, newPos: [number, number, number]) => void;
  onUpdateEntityRotation?: (id: string, rotY: number, fullRotation?: [number, number, number]) => void;
  onAddMeasurement?: (measurement: MeasurementItem) => void;
  onOpenEvidencePlacement?: (coords: [number, number, number]) => void;
  activeTool: ViewportTool;
  activeTab: ViewportTab;
  onSelectTab: (tab: ViewportTab) => void;
  resetSignal: number;
}

export const SceneViewer: React.FC<SceneViewerProps> = ({
  entities,
  markers,
  measurements,
  selectedEntityId,
  onSelectEntity,
  onUpdateEntityPosition,
  onUpdateEntityRotation,
  onAddMeasurement,
  onOpenEvidencePlacement,
  activeTool,
  activeTab,
  onSelectTab,
  resetSignal,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const meshesMapRef = useRef<Map<string, THREE.Object3D>>(new Map());
  const markerGroupRef = useRef<THREE.Group>(new THREE.Group());
  const measureGroupRef = useRef<THREE.Group>(new THREE.Group());
  const transformControlsRef = useRef<TransformControls | null>(null);
  const boxHelperRef = useRef<THREE.BoxHelper | null>(null);
  const lidarCloudRef = useRef<THREE.Points | null>(null);
  const measureStartPinRef = useRef<THREE.Mesh | null>(null);

  // Latest prop refs for event handlers
  const selectedEntityIdRef = useRef(selectedEntityId);
  selectedEntityIdRef.current = selectedEntityId;
  const activeToolRef = useRef(activeTool);
  activeToolRef.current = activeTool;
  const onUpdateEntityPositionRef = useRef(onUpdateEntityPosition);
  onUpdateEntityPositionRef.current = onUpdateEntityPosition;
  const onUpdateEntityRotationRef = useRef(onUpdateEntityRotation);
  onUpdateEntityRotationRef.current = onUpdateEntityRotation;
  const onOpenEvidencePlacementRef = useRef(onOpenEvidencePlacement);
  onOpenEvidencePlacementRef.current = onOpenEvidencePlacement;
  const onAddMeasurementRef = useRef(onAddMeasurement);
  onAddMeasurementRef.current = onAddMeasurement;
  const onSelectEntityRef = useRef(onSelectEntity);
  onSelectEntityRef.current = onSelectEntity;

  const [hoveredMarker, setHoveredMarker] = useState<EvidenceMarkerItem | null>(null);
  const [cameraAngleInfo, setCameraAngleInfo] = useState({ azimuth: '42.4°', elevation: '34.0°', distance: '16.8m' });
  const [measureStartPoint, setMeasureStartPoint] = useState<[number, number, number] | null>(null);
  const [measurementBadges, setMeasurementBadges] = useState<
    Array<{ id: string; dist: string; label: string; x: number; y: number; visible: boolean }>
  >([]);

  // Camera reset handler
  const resetCamera = (targetTab: ViewportTab = activeTab) => {
    if (!cameraRef.current || !controlsRef.current) return;
    const camera = cameraRef.current;
    const controls = controlsRef.current;

    if (targetTab === '2D Plan') {
      camera.up.set(0, 0, -1);
      camera.position.set(0.001, 18.0, 0.001);
      controls.target.set(0, 0, 0);
      controls.maxPolarAngle = 0.05;
      controls.minPolarAngle = 0.001;
    } else if (targetTab === 'Measurements') {
      camera.up.set(0, 1, 0);
      camera.position.set(10.5, 8.5, 11.5);
      controls.target.set(0.1, 0.8, 0.1);
      controls.maxPolarAngle = Math.PI / 2 + 0.1;
      controls.minPolarAngle = 0.05;
    } else {
      camera.up.set(0, 1, 0);
      camera.position.set(11.5, 9.5, 12.5);
      controls.target.set(0.1, 1.2, 0.1);
      controls.maxPolarAngle = Math.PI / 2 + 0.1;
      controls.minPolarAngle = 0.05;
    }
    controls.update();
  };

  useEffect(() => {
    resetCamera(activeTab);
  }, [resetSignal, activeTab]);

  // Main Scene Setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth;
    let height = container.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020614, 0.018);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
    camera.position.set(11.5, 9.5, 12.5);
    const targetPos = new THREE.Vector3(0.1, 1.2, 0.1);
    camera.lookAt(targetPos);
    cameraRef.current = camera;

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 2.0;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.target.copy(targetPos);
    controls.minDistance = 3.5;
    controls.maxDistance = 35.0;
    controls.maxPolarAngle = Math.PI / 2 + 0.1;
    controlsRef.current = controls;

    // 5. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0x0f2248, 1.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xbbe1fa, 2.2);
    dirLight.position.set(8, 14, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const cyanPointLight = new THREE.PointLight(0x00f0ff, 3.5, 18);
    cyanPointLight.position.set(-2, 3.5, 2);
    scene.add(cyanPointLight);

    const redAccentLight = new THREE.PointLight(0xff3366, 2.0, 12);
    redAccentLight.position.set(-3, 2, 0.5);
    scene.add(redAccentLight);

    // 6. Floor & Spatial Boundaries
    const roomWidth = 7.0;
    const roomDepth = 6.2;

    const floorGeo = new THREE.PlaneGeometry(roomWidth, roomDepth);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x061328,
      roughness: 0.35,
      metalness: 0.65,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    floor.name = 'scene-floor';
    scene.add(floor);

    // Grid Overlay
    const gridHelper = new THREE.GridHelper(roomWidth, 14, 0x00f0ff, 0x1e3a5f);
    gridHelper.position.y = 0.005;
    scene.add(gridHelper);

    // Bounding Box Walls Wireframe
    const boundaryGeo = new THREE.BoxGeometry(roomWidth, 3.0, roomDepth);
    const boundaryEdges = new THREE.EdgesGeometry(boundaryGeo);
    const boundaryMat = new THREE.LineBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.3,
    });
    const boundaryWireframe = new THREE.LineSegments(boundaryEdges, boundaryMat);
    boundaryWireframe.position.y = 1.5;
    scene.add(boundaryWireframe);

    // Back Wall
    const wallGeo = new THREE.PlaneGeometry(roomWidth, 3.0);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x07152e,
      roughness: 0.8,
      metalness: 0.2,
      side: THREE.DoubleSide,
    });
    const backWall = new THREE.Mesh(wallGeo, wallMat);
    backWall.position.set(0, 1.5, -roomDepth / 2);
    scene.add(backWall);

    // West Breached Wall
    const westWallGeo = new THREE.PlaneGeometry(roomDepth, 3.0);
    const westWall = new THREE.Mesh(westWallGeo, wallMat);
    westWall.rotation.y = Math.PI / 2;
    westWall.position.set(-roomWidth / 2, 1.5, 0);
    scene.add(westWall);

    // 7. Dynamic Object Meshes
    const meshesMap = meshesMapRef.current;
    meshesMap.clear();

    // A. Conference Table
    const tableGroup = new THREE.Group();
    const tableTopGeo = new THREE.BoxGeometry(2.4, 0.08, 1.2);
    const tableTopMat = new THREE.MeshStandardMaterial({ color: 0x0f274a, roughness: 0.4, metalness: 0.5 });
    const tableTop = new THREE.Mesh(tableTopGeo, tableTopMat);
    tableTop.position.y = 0.76;
    tableTop.castShadow = true;
    tableTop.receiveShadow = true;
    tableGroup.add(tableTop);

    const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.74, 16);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x00f0ff, roughness: 0.2, metalness: 0.8 });
    [
      [-1.0, 0.37, -0.45],
      [1.0, 0.37, -0.45],
      [-1.0, 0.37, 0.45],
      [1.0, 0.37, 0.45],
    ].forEach(([x, y, z]) => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(x, y, z);
      tableGroup.add(leg);
    });
    tableGroup.position.set(0, 0, -0.6);
    tableGroup.name = 'ent-furn-table';
    scene.add(tableGroup);
    meshesMap.set('ent-furn-table', tableGroup);

    // B. Overturned Chair
    const chairGroup = new THREE.Group();
    const seatGeo = new THREE.BoxGeometry(0.52, 0.08, 0.52);
    const seatMat = new THREE.MeshStandardMaterial({ color: 0x1e3a5f, roughness: 0.5, metalness: 0.3 });
    const seat = new THREE.Mesh(seatGeo, seatMat);
    seat.castShadow = true;
    chairGroup.add(seat);

    const backGeo = new THREE.BoxGeometry(0.48, 0.55, 0.06);
    const back = new THREE.Mesh(backGeo, seatMat);
    back.position.set(0, 0.3, -0.23);
    chairGroup.add(back);

    const chairStem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.38), legMat);
    chairStem.position.set(0, -0.2, 0);
    chairGroup.add(chairStem);

    chairGroup.rotation.set(1.4, 0.3, 0.6);
    chairGroup.position.set(-1.9, 0.35, 0.3);
    chairGroup.name = 'ent-furn-chair';
    scene.add(chairGroup);
    meshesMap.set('ent-furn-chair', chairGroup);

    // C. Subject Alpha (Mannequin Silhouette)
    const personGroup = new THREE.Group();
    const torsoGeo = new THREE.CylinderGeometry(0.18, 0.14, 0.65, 16);
    const personMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
    });
    const torso = new THREE.Mesh(torsoGeo, personMat);
    torso.position.y = 0.85;
    personGroup.add(torso);

    const headGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const head = new THREE.Mesh(headGeo, personMat);
    head.position.y = 1.32;
    personGroup.add(head);

    const ringGeo = new THREE.RingGeometry(0.35, 0.38, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.02;
    personGroup.add(ring);

    personGroup.position.set(0.1, 0.0, 0.3);
    personGroup.name = 'ent-person-01';
    scene.add(personGroup);
    meshesMap.set('ent-person-01', personGroup);

    // D. Glass Dispersion Cluster
    const glassPointsGeo = new THREE.BufferGeometry();
    const particleCount = 280;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const r = Math.random() * 0.9;
      const theta = Math.random() * Math.PI * 0.8 + 0.2;
      positions[i * 3] = -0.4 + r * Math.cos(theta);
      positions[i * 3 + 1] = 0.02 + Math.random() * 0.05;
      positions[i * 3 + 2] = 1.3 + r * Math.sin(theta);
    }
    glassPointsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const glassPointsMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.04,
      transparent: true,
      opacity: 0.9,
    });
    const glassField = new THREE.Points(glassPointsGeo, glassPointsMat);
    glassField.name = 'ent-glass-field';
    scene.add(glassField);
    meshesMap.set('ent-glass-field', glassField);

    // E. Breached Window Trajectory Laser Beam
    const laserCurve = new THREE.LineCurve3(
      new THREE.Vector3(-3.0, 1.4, 0.2),
      new THREE.Vector3(-0.4, 0.15, 1.3)
    );
    const laserGeo = new THREE.TubeGeometry(laserCurve, 32, 0.015, 8, false);
    const laserMat = new THREE.MeshBasicMaterial({
      color: 0xff3366,
      transparent: true,
      opacity: 0.85,
    });
    const laserBeam = new THREE.Mesh(laserGeo, laserMat);
    scene.add(laserBeam);

    const impactCone = new THREE.Mesh(
      new THREE.ConeGeometry(0.08, 0.22, 16),
      new THREE.MeshBasicMaterial({ color: 0xff3366 })
    );
    impactCone.position.set(-0.4, 0.2, 1.3);
    impactCone.rotation.z = Math.PI;
    scene.add(impactCone);

    // F. Evidence Marker Cones Group
    scene.add(markerGroupRef.current);

    // G. Measurements Group
    scene.add(measureGroupRef.current);

    // H. Measurement Start Point Pin Indicator
    const pinGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const pinMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 0.8,
    });
    const measureStartPin = new THREE.Mesh(pinGeo, pinMat);
    measureStartPin.visible = false;
    scene.add(measureStartPin);
    measureStartPinRef.current = measureStartPin;

    // I. Convincing Forensic LiDAR Point Cloud Simulation
    const cloudPoints: number[] = [];
    const cloudColors: number[] = [];

    // 1. Dense Floor Scan points
    for (let x = -roomWidth / 2; x <= roomWidth / 2; x += 0.09) {
      for (let z = -roomDepth / 2; z <= roomDepth / 2; z += 0.09) {
        cloudPoints.push(x, 0.01 + (Math.random() - 0.5) * 0.008, z);
        cloudColors.push(0.05, 0.42, 0.82);
      }
    }

    // 2. Wall Scan vertical points
    for (let y = 0; y <= 2.8; y += 0.12) {
      for (let x = -roomWidth / 2; x <= roomWidth / 2; x += 0.12) {
        cloudPoints.push(x, y, -roomDepth / 2);
        cloudColors.push(0.08, 0.55 + y * 0.12, 0.92);
      }
      for (let z = -roomDepth / 2; z <= roomDepth / 2; z += 0.12) {
        cloudPoints.push(-roomWidth / 2, y, z);
        cloudColors.push(0.18, 0.68, 0.98);
        cloudPoints.push(roomWidth / 2, y, z);
        cloudColors.push(0.08, 0.52, 0.85);
      }
    }

    // 3. Conference Table points
    for (let x = -1.2; x <= 1.2; x += 0.05) {
      for (let z = -1.2; z <= 0.0; z += 0.05) {
        cloudPoints.push(x, 0.76, z);
        cloudColors.push(0.0, 0.95, 1.0); // Cyan table surface
      }
    }

    // 4. Overturned Chair points
    for (let x = -2.15; x <= -1.65; x += 0.04) {
      for (let z = 0.05; z <= 0.55; z += 0.04) {
        for (let y = 0.15; y <= 0.75; y += 0.08) {
          cloudPoints.push(x, y, z);
          cloudColors.push(0.25, 0.78, 0.98);
        }
      }
    }

    // 5. Subject Alpha silhouette points
    for (let y = 0; y <= 1.5; y += 0.06) {
      const r = 0.18 * (1 - y / 2.3);
      for (let a = 0; a < Math.PI * 2; a += 0.4) {
        cloudPoints.push(0.1 + r * Math.cos(a), y, 0.3 + r * Math.sin(a));
        cloudColors.push(0.0, 0.95, 1.0);
      }
    }

    // 6. Glass & Ballistic cone dispersion points
    for (let i = 0; i < 500; i++) {
      const r = Math.random() * 1.5;
      const theta = Math.random() * Math.PI * 0.9;
      cloudPoints.push(-0.4 + r * Math.cos(theta), 0.02 + Math.random() * 0.1, 1.3 + r * Math.sin(theta));
      cloudColors.push(1.0, 0.25, 0.45); // Ballistic impact red/magenta
    }

    const lidarCloudGeo = new THREE.BufferGeometry();
    lidarCloudGeo.setAttribute('position', new THREE.Float32BufferAttribute(cloudPoints, 3));
    lidarCloudGeo.setAttribute('color', new THREE.Float32BufferAttribute(cloudColors, 3));
    const lidarCloudMat = new THREE.PointsMaterial({
      size: 0.028,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });
    const lidarCloud = new THREE.Points(lidarCloudGeo, lidarCloudMat);
    lidarCloud.visible = activeTab === 'Point Cloud';
    scene.add(lidarCloud);
    lidarCloudRef.current = lidarCloud;

    // J. TransformControls (Move & Rotate gizmos)
    const transformControls = new TransformControls(camera, renderer.domElement);
    transformControls.size = 0.8;
    scene.add(transformControls);
    transformControlsRef.current = transformControls;

    transformControls.addEventListener('dragging-changed', (e) => {
      controls.enabled = !e.value;
    });

    transformControls.addEventListener('objectChange', () => {
      const targetId = selectedEntityIdRef.current;
      if (!targetId) return;
      const mesh = meshesMapRef.current.get(targetId);
      if (!mesh) return;

      if (activeToolRef.current === 'move') {
        onUpdateEntityPositionRef.current?.(targetId, [
          parseFloat(mesh.position.x.toFixed(2)),
          parseFloat(mesh.position.y.toFixed(2)),
          parseFloat(mesh.position.z.toFixed(2)),
        ]);
      } else if (activeToolRef.current === 'rotate') {
        onUpdateEntityRotationRef.current?.(targetId, mesh.rotation.y, [
          parseFloat(mesh.rotation.x.toFixed(2)),
          parseFloat(mesh.rotation.y.toFixed(2)),
          parseFloat(mesh.rotation.z.toFixed(2)),
        ]);
      }
    });

    // K. Selection Box Highlight
    const boxHelper = new THREE.BoxHelper(new THREE.Mesh(), 0x00f0ff);
    boxHelper.visible = false;
    scene.add(boxHelper);
    boxHelperRef.current = boxHelper;

    // 8. Raycasting and Pointer Interactions
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let pointerDownPos = { x: 0, y: 0 };

    const handlePointerDown = (event: MouseEvent) => {
      pointerDownPos = { x: event.clientX, y: event.clientY };
    };

    const handlePointerUp = (event: MouseEvent) => {
      const dx = Math.abs(event.clientX - pointerDownPos.x);
      const dy = Math.abs(event.clientY - pointerDownPos.y);
      // Ignore if user was orbiting camera or dragging gizmo
      if (dx > 5 || dy > 5) return;
      if (transformControlsRef.current?.dragging) return;

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      const tool = activeToolRef.current;

      // TOOL: MEASURE
      if (tool === 'measure') {
        const testTargets = [floor, ...Array.from(meshesMapRef.current.values())];
        const hits = raycaster.intersectObjects(testTargets, true);
        if (hits.length > 0) {
          const pt = hits[0].point;
          setMeasureStartPoint((prev) => {
            if (!prev) {
              return [pt.x, pt.y, pt.z];
            } else {
              const p1 = prev;
              const p2: [number, number, number] = [pt.x, pt.y, pt.z];
              const dist = Math.hypot(p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]);
              const newMeas: MeasurementItem = {
                id: `meas-${Date.now()}`,
                label: `Point-to-Point (${dist.toFixed(2)}m)`,
                fromName: `P-A [${p1[0].toFixed(1)}, ${p1[2].toFixed(1)}]`,
                toName: `P-B [${p2[0].toFixed(1)}, ${p2[2].toFixed(1)}]`,
                fromCoord: [parseFloat(p1[0].toFixed(2)), parseFloat(p1[1].toFixed(2)), parseFloat(p1[2].toFixed(2))],
                toCoord: [parseFloat(p2[0].toFixed(2)), parseFloat(p2[1].toFixed(2)), parseFloat(p2[2].toFixed(2))],
                distanceMeters: parseFloat(dist.toFixed(2)),
              };
              onAddMeasurementRef.current?.(newMeas);
              return null;
            }
          });
        }
        return;
      }

      // TOOL: EVIDENCE
      if (tool === 'evidence') {
        const testTargets = [floor, ...Array.from(meshesMapRef.current.values())];
        const hits = raycaster.intersectObjects(testTargets, true);
        if (hits.length > 0) {
          const pt = hits[0].point;
          onOpenEvidencePlacementRef.current?.([
            parseFloat(pt.x.toFixed(2)),
            parseFloat(Math.max(0.18, pt.y).toFixed(2)),
            parseFloat(pt.z.toFixed(2)),
          ]);
        }
        return;
      }

      // Check marker cones
      const markerIntersects = raycaster.intersectObjects(markerGroupRef.current.children, true);
      if (markerIntersects.length > 0) {
        const marker = markerIntersects[0].object.userData.markerData as EvidenceMarkerItem;
        if (marker) {
          setHoveredMarker(marker);
          return;
        }
      }

      // Check scene objects for SELECT / MOVE / ROTATE selection
      const objectsToTest = Array.from(meshesMapRef.current.values());
      const objectIntersects = raycaster.intersectObjects(objectsToTest, true);
      if (objectIntersects.length > 0) {
        let topObj: THREE.Object3D | null = objectIntersects[0].object;
        while (topObj && !topObj.name && topObj.parent) {
          topObj = topObj.parent;
        }
        if (topObj && topObj.name) {
          onSelectEntityRef.current?.(topObj.name);
          return;
        }
      }

      // Clicked on empty space while in select tool
      if (tool === 'select') {
        onSelectEntityRef.current?.(null);
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointerup', handlePointerUp);

    // 9. Render Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();
    let frameCount = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      frameCount++;

      // Gentle pulsating glow for evidence cones
      markerGroupRef.current.children.forEach((mesh, idx) => {
        if (markers[idx]) {
          mesh.position.y = markers[idx].coordinates[1] + Math.sin(elapsedTime * 2.5 + idx) * 0.02;
          mesh.rotation.y = elapsedTime * 0.8;
        }
      });

      // Update camera telemetry
      if (controlsRef.current && cameraRef.current) {
        const camPos = cameraRef.current.position;
        const dist = camPos.distanceTo(controlsRef.current.target);
        setCameraAngleInfo({
          azimuth: `${((controlsRef.current.getAzimuthalAngle() * 180) / Math.PI).toFixed(1)}°`,
          elevation: `${((controlsRef.current.getPolarAngle() * 180) / Math.PI).toFixed(1)}°`,
          distance: `${dist.toFixed(1)}m`,
        });
      }

      // Update Measurement Screen Pos Badges (every 2 frames for smooth performance)
      if (frameCount % 2 === 0 && cameraRef.current && container) {
        const w = container.clientWidth;
        const h = container.clientHeight;
        const badges = measurements.map((m) => {
          const midX = (m.fromCoord[0] + m.toCoord[0]) / 2;
          const midY = (m.fromCoord[1] + m.toCoord[1]) / 2 + 0.12;
          const midZ = (m.fromCoord[2] + m.toCoord[2]) / 2;
          const v = new THREE.Vector3(midX, midY, midZ).project(camera);
          const isVisible = v.z < 1 && v.x >= -1.1 && v.x <= 1.1 && v.y >= -1.1 && v.y <= 1.1;
          const sx = ((v.x + 1) / 2) * w;
          const sy = ((-v.y + 1) / 2) * h;
          return {
            id: m.id,
            dist: `${m.distanceMeters.toFixed(2)} m`,
            label: m.label,
            x: sx,
            y: sy,
            visible: isVisible,
          };
        });
        setMeasurementBadges(badges);
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 10. Resize Observer
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
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointerup', handlePointerUp);
      cancelAnimationFrame(animationFrameId);
      if (transformControlsRef.current) {
        transformControlsRef.current.dispose();
      }
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update object positions when entities state updates
  useEffect(() => {
    entities.forEach((ent) => {
      const mesh = meshesMapRef.current.get(ent.id);
      if (mesh) {
        mesh.position.set(ent.position[0], ent.position[1], ent.position[2]);
        mesh.rotation.set(ent.rotation[0], ent.rotation[1], ent.rotation[2]);
        mesh.visible = ent.visible;
      }
    });

    // Keep BoxHelper updated with selected entity position
    if (selectedEntityId && boxHelperRef.current) {
      const selectedMesh = meshesMapRef.current.get(selectedEntityId);
      if (selectedMesh) {
        boxHelperRef.current.setFromObject(selectedMesh);
      }
    }
  }, [entities, selectedEntityId]);

  // Synchronize TransformControls and BoxHelper with activeTool & selectedEntityId
  useEffect(() => {
    const tc = transformControlsRef.current;
    const box = boxHelperRef.current;
    if (!tc || !box) return;

    if (!selectedEntityId) {
      tc.detach();
      box.visible = false;
      return;
    }

    const targetObj = meshesMapRef.current.get(selectedEntityId);
    if (!targetObj) {
      tc.detach();
      box.visible = false;
      return;
    }

    // Update BoxHelper
    box.setFromObject(targetObj);
    box.visible = true;

    // Attach TransformControls if Move or Rotate tool active
    if (activeTool === 'move') {
      tc.setMode('translate');
      tc.attach(targetObj);
      tc.enabled = true;
    } else if (activeTool === 'rotate') {
      tc.setMode('rotate');
      tc.attach(targetObj);
      tc.enabled = true;
    } else {
      tc.detach();
    }
  }, [activeTool, selectedEntityId]);

  // Dynamically synchronize 3D Evidence Marker Cones
  useEffect(() => {
    const group = markerGroupRef.current;
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }

    const typeColors: Record<string, number> = {
      Evidence: 0x00f0ff,
      Damage: 0xef4444,
      Person: 0x38bdf8,
      Object: 0xa855f7,
      Measurement: 0xfacc15,
      Unknown: 0x94a3b8,
    };

    markers.forEach((m) => {
      const coneGeo = new THREE.ConeGeometry(0.12, 0.28, 16);
      const colorHex = typeColors[m.markerType || m.type] || 0x00f0ff;
      const coneMat = new THREE.MeshStandardMaterial({
        color: colorHex,
        emissive: colorHex,
        emissiveIntensity: 0.35,
        roughness: 0.2,
        metalness: 0.8,
      });
      const cone = new THREE.Mesh(coneGeo, coneMat);
      cone.position.set(m.coordinates[0], m.coordinates[1], m.coordinates[2]);
      cone.castShadow = true;
      cone.userData = { markerData: m };
      group.add(cone);
    });
  }, [markers]);

  // Synchronize Measurements in 3D scene
  useEffect(() => {
    const group = measureGroupRef.current;
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }

    measurements.forEach((meas) => {
      const pA = new THREE.Vector3(...meas.fromCoord);
      const pB = new THREE.Vector3(...meas.toCoord);

      // Line
      const lineGeo = new THREE.BufferGeometry().setFromPoints([pA, pB]);
      const lineMat = new THREE.LineDashedMaterial({
        color: activeTab === 'Measurements' ? 0x00f0ff : 0x38bdf8,
        dashSize: 0.14,
        gapSize: 0.08,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      line.computeLineDistances();
      group.add(line);

      // Spheres at endpoints
      const nodeGeo = new THREE.SphereGeometry(0.045, 12, 12);
      const nodeMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
      const nodeA = new THREE.Mesh(nodeGeo, nodeMat);
      nodeA.position.copy(pA);
      group.add(nodeA);

      const nodeB = new THREE.Mesh(nodeGeo, nodeMat);
      nodeB.position.copy(pB);
      group.add(nodeB);
    });
  }, [measurements, activeTab]);

  // Synchronize Point Cloud visibility & mesh materials for View Mode Tabs
  useEffect(() => {
    if (lidarCloudRef.current) {
      lidarCloudRef.current.visible = activeTab === 'Point Cloud';
    }

    meshesMapRef.current.forEach((obj) => {
      obj.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          if (activeTab === 'Point Cloud') {
            child.material.wireframe = true;
            child.material.transparent = true;
            child.material.opacity = 0.35;
          } else {
            child.material.wireframe = child.name === 'ent-person-01';
            child.material.transparent = false;
            child.material.opacity = 1.0;
          }
        }
      });
    });
  }, [activeTab]);

  // Measure start pin visualizer
  useEffect(() => {
    if (measureStartPinRef.current) {
      if (measureStartPoint) {
        measureStartPinRef.current.position.set(measureStartPoint[0], measureStartPoint[1], measureStartPoint[2]);
        measureStartPinRef.current.visible = true;
      } else {
        measureStartPinRef.current.visible = false;
      }
    }
  }, [measureStartPoint]);

  const tabs: ViewportTab[] = ['3D View', '2D Plan', 'Point Cloud', 'Measurements'];
  const selectedEntity = useMemo(() => entities.find((e) => e.id === selectedEntityId), [entities, selectedEntityId]);

  return (
    <div
      ref={mountRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: 'radial-gradient(ellipse at 50% 50%, #061530 0%, #020612 80%)',
      }}
    >
      {/* 1. Top Tabs Bar */}
      <div style={{
        position: 'absolute',
        top: '14px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 25,
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        background: 'rgba(3, 10, 26, 0.88)',
        backdropFilter: 'blur(12px)',
        padding: '4px',
        borderRadius: '8px',
        border: '1px solid rgba(0, 240, 255, 0.25)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
      }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => onSelectTab(tab)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '6px',
                background: isActive ? 'rgba(0, 240, 255, 0.2)' : 'transparent',
                border: isActive ? '1px solid #00f0ff' : '1px solid transparent',
                color: isActive ? '#ffffff' : '#94a3b8',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '11px',
                fontWeight: isActive ? 700 : 500,
                letterSpacing: '0.8px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.color = '#e2e8f0';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.color = '#94a3b8';
              }}
            >
              {tab === '3D View' && <Layers size={12} color={isActive ? '#00f0ff' : '#64748b'} />}
              {tab === '2D Plan' && <MapIcon size={12} color={isActive ? '#00f0ff' : '#64748b'} />}
              {tab === 'Point Cloud' && <CloudLightning size={12} color={isActive ? '#00f0ff' : '#64748b'} />}
              {tab === 'Measurements' && <Ruler size={12} color={isActive ? '#00f0ff' : '#64748b'} />}
              <span>{tab.toUpperCase()}</span>
            </button>
          );
        })}
      </div>

      {/* 2. Top-Right Telemetry & Align Viewport */}
      <div style={{
        position: 'absolute',
        top: '14px',
        right: '16px',
        zIndex: 25,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        <div style={{
          background: 'rgba(3, 10, 26, 0.85)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(0, 240, 255, 0.2)',
          borderRadius: '6px',
          padding: '5px 10px',
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '10px',
          color: '#38bdf8',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span>AZ: {cameraAngleInfo.azimuth}</span>
          <span style={{ color: '#475569' }}>|</span>
          <span>EL: {cameraAngleInfo.elevation}</span>
          <span style={{ color: '#475569' }}>|</span>
          <span>DIST: {cameraAngleInfo.distance}</span>
        </div>

        <button
          onClick={() => resetCamera()}
          title="Align Viewport Camera"
          style={{
            background: 'rgba(3, 10, 26, 0.85)',
            border: '1px solid rgba(0, 240, 255, 0.2)',
            borderRadius: '6px',
            color: '#94a3b8',
            padding: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Navigation size={14} />
        </button>
      </div>

      {/* 3. Measurement Distance Badges in Viewport */}
      {measurementBadges.map(
        (b) =>
          b.visible && (
            <div
              key={b.id}
              style={{
                position: 'absolute',
                left: `${b.x}px`,
                top: `${b.y}px`,
                transform: 'translate(-50%, -50%)',
                zIndex: 20,
                pointerEvents: 'none',
                background: 'rgba(3, 10, 26, 0.92)',
                border: '1px solid #00f0ff',
                borderRadius: '4px',
                padding: '2px 7px',
                color: '#00f0ff',
                fontSize: '10px',
                fontFamily: 'var(--font-mono, monospace)',
                fontWeight: 700,
                boxShadow: '0 0 10px rgba(0, 240, 255, 0.35)',
                whiteSpace: 'nowrap',
              }}
            >
              {b.dist}
            </div>
          )
      )}

      {/* 4. Active Tool Status Banner (When Measure or Evidence Active) */}
      {activeTool === 'measure' && (
        <div style={{
          position: 'absolute',
          top: '68px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 25,
          background: 'rgba(6, 18, 42, 0.95)',
          border: '1px solid #00f0ff',
          borderRadius: '6px',
          padding: '6px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 4px 20px rgba(0, 240, 255, 0.25)',
        }}>
          <Ruler size={14} color="#00f0ff" />
          <span style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '11px',
            color: '#e2e8f0',
            fontWeight: 600,
          }}>
            {measureStartPoint
              ? `POINT A SET [${measureStartPoint.map((n) => n.toFixed(2)).join(', ')}] • CLICK POINT B TO MEASURE DISTANCE`
              : 'CLICK ANY LOCATION IN SCENE TO PLACE START POINT (POINT A)'}
          </span>
          {measureStartPoint && (
            <button
              onClick={() => setMeasureStartPoint(null)}
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid #ef4444',
                color: '#ef4444',
                borderRadius: '4px',
                padding: '2px 6px',
                fontSize: '9.5px',
                fontFamily: 'var(--font-mono, monospace)',
                cursor: 'pointer',
              }}
            >
              CANCEL
            </button>
          )}
        </div>
      )}

      {activeTool === 'evidence' && (
        <div style={{
          position: 'absolute',
          top: '68px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 25,
          background: 'rgba(6, 18, 42, 0.95)',
          border: '1px solid #00f0ff',
          borderRadius: '6px',
          padding: '6px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 4px 20px rgba(0, 240, 255, 0.25)',
        }}>
          <Crosshair size={14} color="#00f0ff" />
          <span style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '11px',
            color: '#e2e8f0',
            fontWeight: 600,
          }}>
            EVIDENCE TOOL ACTIVE • CLICK ANY 3D LOCATION TO PLACE FORENSIC MARKER
          </span>
        </div>
      )}

      {/* 5. Selected Entity HUD Overlay */}
      {selectedEntity && (
        <div style={{
          position: 'absolute',
          bottom: '24px',
          left: '20px',
          zIndex: 30,
          background: 'rgba(6, 18, 42, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1.5px solid #00f0ff',
          borderRadius: '8px',
          padding: '12px 16px',
          minWidth: '280px',
          maxWidth: '360px',
          boxShadow: '0 12px 30px rgba(0,0,0,0.8), 0 0 20px rgba(0,240,255,0.25)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '9.5px',
                color: '#38bdf8',
                fontWeight: 700,
                letterSpacing: '0.8px',
              }}>
                SELECTED ENTITY
              </span>
            </div>
            <button
              onClick={() => onSelectEntity(null)}
              title="Deselect Entity"
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
              }}
            >
              <X size={13} />
            </button>
          </div>

          <div style={{
            fontSize: '13px',
            fontWeight: 700,
            color: '#ffffff',
            marginBottom: '4px',
          }}>
            {selectedEntity.name}
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '10px',
            color: '#94a3b8',
            marginBottom: '8px',
          }}>
            <span>Type: {selectedEntity.category}</span>
            <span style={{ color: '#00f0ff' }}>
              Pos: [{selectedEntity.position.map((n) => n.toFixed(2)).join(', ')}]
            </span>
          </div>

          <div style={{
            fontSize: '10px',
            fontFamily: 'var(--font-mono, monospace)',
            color: '#38bdf8',
            background: 'rgba(0, 240, 255, 0.08)',
            border: '1px solid rgba(0, 240, 255, 0.2)',
            borderRadius: '4px',
            padding: '4px 8px',
          }}>
            {activeTool === 'move' && 'MOVE TOOL ACTIVE: Drag 3D arrows to translate entity.'}
            {activeTool === 'rotate' && 'ROTATE TOOL ACTIVE: Drag circular ring to orient entity.'}
            {activeTool === 'select' && 'SELECT ACTIVE: Switch to Move or Rotate tool to adjust coordinates.'}
            {activeTool === 'measure' && 'MEASURE ACTIVE: Click two points to measure distance.'}
            {activeTool === 'evidence' && 'EVIDENCE ACTIVE: Click in scene to place marker.'}
          </div>
        </div>
      )}

      {/* 6. Interactive Evidence Marker Tooltip */}
      {hoveredMarker && (
        <div style={{
          position: 'absolute',
          bottom: '24px',
          left: selectedEntity ? '390px' : '20px',
          zIndex: 30,
          background: 'rgba(6, 18, 42, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1.5px solid #00f0ff',
          borderRadius: '8px',
          padding: '12px 16px',
          maxWidth: '340px',
          boxShadow: '0 12px 30px rgba(0,0,0,0.8), 0 0 20px rgba(0,240,255,0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '12px',
              fontWeight: 700,
              color: '#00f0ff',
            }}>
              MARKER #{hoveredMarker.number}: {hoveredMarker.label}
            </span>
            <button
              onClick={() => setHoveredMarker(null)}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              ✕
            </button>
          </div>
          <div style={{ fontSize: '11.5px', color: '#cbd5e1', lineHeight: 1.4, marginBottom: '8px' }}>
            {hoveredMarker.description}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10px', fontFamily: 'var(--font-mono, monospace)', color: '#64748b' }}>
            <span>Type: {hoveredMarker.markerType || hoveredMarker.type}</span>
            {hoveredMarker.linkedEvidenceId && (
              <span style={{ color: '#38bdf8' }}>LINKED: {hoveredMarker.linkedEvidenceId}</span>
            )}
            <span style={{ color: '#00f0ff' }}>Conf: {(hoveredMarker.confidence * 100).toFixed(1)}%</span>
          </div>
        </div>
      )}

      {/* 7. Active Tool Indicator Overlay (Bottom Right) */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        right: '20px',
        zIndex: 25,
        fontFamily: 'var(--font-mono, monospace)',
        fontSize: '10px',
        color: '#64748b',
        background: 'rgba(2, 6, 18, 0.75)',
        padding: '4px 10px',
        borderRadius: '4px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}>
        <span>VIEW: <span style={{ color: '#ffffff' }}>{activeTab.toUpperCase()}</span></span>
        <span style={{ color: '#475569' }}>|</span>
        <span>TOOL: <span style={{ color: '#00f0ff', textTransform: 'uppercase' }}>{activeTool}</span></span>
        <span style={{ color: '#475569' }}>|</span>
        <span>CLICK OBJECT TO INSPECT</span>
      </div>
    </div>
  );
};
