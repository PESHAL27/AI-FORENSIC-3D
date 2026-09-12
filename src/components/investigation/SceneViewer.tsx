import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import {
  Layers,
  Map as MapIcon,
  CloudLightning,
  Ruler,
  Navigation,
  Crosshair,
  RotateCcw,
  X,
} from 'lucide-react';
import type {
  DetectedEntity,
  EvidenceMarkerItem,
  MeasurementItem,
  ViewportTab,
  ViewportTool,
} from '../../types/investigation';
import {
  createHumanMannequin,
  createErgonomicChair,
  createConferenceDesk,
  createArchitecturalDoor,
  createBreachedWindow,
  createGlassDispersionCluster,
  createSpentCasing,
  createRoomArchitecture,
  type MannequinModel,
} from './sceneModels/forensicModels';

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
  onRestoreOriginalEntity?: (id: string) => void;
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
  onRestoreOriginalEntity,
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
  const onSelectEntityRef = useRef(onSelectEntity);
  onSelectEntityRef.current = onSelectEntity;
  const onUpdateEntityPositionRef = useRef(onUpdateEntityPosition);
  onUpdateEntityPositionRef.current = onUpdateEntityPosition;
  const onUpdateEntityRotationRef = useRef(onUpdateEntityRotation);
  onUpdateEntityRotationRef.current = onUpdateEntityRotation;
  const onAddMeasurementRef = useRef(onAddMeasurement);
  onAddMeasurementRef.current = onAddMeasurement;
  const onOpenEvidencePlacementRef = useRef(onOpenEvidencePlacement);
  onOpenEvidencePlacementRef.current = onOpenEvidencePlacement;
  const markersRef = useRef(markers);
  markersRef.current = markers;
  const measurementsRef = useRef(measurements);
  measurementsRef.current = measurements;

  // Direct manipulation dragging & rotation state
  const isDirectDraggingRef = useRef(false);
  const isDirectRotatingRef = useRef(false);
  const dragEntityIdRef = useRef<string | null>(null);
  const dragOffsetRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const dragPlaneYRef = useRef<number>(0);
  const rotateStartClientXRef = useRef<number>(0);
  const rotateStartAngleRef = useRef<number>(0);

  // Viewport Telemetry State
  const [cameraAngleInfo, setCameraAngleInfo] = useState({
    azimuth: '45.0°',
    elevation: '55.0°',
    distance: '12.4m',
  });
  const [hoveredMarker, setHoveredMarker] = useState<EvidenceMarkerItem | null>(null);
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
      camera.position.set(0.001, 16.0, 0.001);
      controls.target.set(0, 0, 0);
      controls.maxPolarAngle = 0.05;
      controls.minPolarAngle = 0.001;
    } else if (targetTab === 'Measurements') {
      camera.up.set(0, 1, 0);
      camera.position.set(9.5, 7.5, 10.5);
      controls.target.set(0.1, 0.8, 0.1);
      controls.maxPolarAngle = Math.PI / 2 + 0.08;
      controls.minPolarAngle = 0.05;
    } else {
      camera.up.set(0, 1, 0);
      camera.position.set(10.5, 8.5, 11.5);
      controls.target.set(0.1, 1.0, 0.1);
      controls.maxPolarAngle = Math.PI / 2 + 0.08;
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

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020614, 0.015);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(10.5, 8.5, 11.5);
    const targetPos = new THREE.Vector3(0.1, 1.0, 0.1);
    camera.lookAt(targetPos);
    cameraRef.current = camera;

    // 3. WebGL Renderer with ACES Tone Mapping & PCF Shadows
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
    renderer.shadowMap.type = THREE.PCFShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.target.copy(targetPos);
    controls.minDistance = 3.0;
    controls.maxDistance = 32.0;
    controls.maxPolarAngle = Math.PI / 2 + 0.08;
    controlsRef.current = controls;

    // 5. High-Fidelity Forensic Lighting
    // A. Soft Ambient Fill
    const ambientLight = new THREE.HemisphereLight(0x94a3b8, 0x020614, 0.95);
    scene.add(ambientLight);

    // B. Key Directional Light with soft PCF shadow casting
    const keyLight = new THREE.DirectionalLight(0xf8fafc, 2.2);
    keyLight.position.set(6, 12, 8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 30;
    keyLight.shadow.camera.left = -6;
    keyLight.shadow.camera.right = 6;
    keyLight.shadow.camera.top = 6;
    keyLight.shadow.camera.bottom = -6;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    // C. Back / Rim Light for Silhouette Definition
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.85);
    rimLight.position.set(-6, 8, -6);
    scene.add(rimLight);

    // D. Forensic Scan Spotlight focused on breach and evidence epicenter
    const scanSpot = new THREE.SpotLight(0x00f0ff, 1.8, 14, Math.PI / 5, 0.45, 1.0);
    scanSpot.position.set(-1.2, 5.0, 1.4);
    scanSpot.target.position.set(-0.4, 0.2, 1.3);
    scene.add(scanSpot);
    scene.add(scanSpot.target);

    // 6. Architectural Room Geometry (Floor, Walls, Skirting Baseboards, Fine Grid)
    const roomWidth = 7.0;
    const roomDepth = 6.2;
    const roomArch = createRoomArchitecture(roomWidth, roomDepth, 3.0);
    scene.add(roomArch);

    // Floor reference mesh for raycasting
    const floorMesh = roomArch.getObjectByName('scene-floor') as THREE.Mesh;

    // 7. Realistic Forensic 3D Models
    const meshesMap = meshesMapRef.current;
    meshesMap.clear();

    // A. Executive Conference Desk & Terminal
    const tableGroup = createConferenceDesk();
    tableGroup.position.set(0, 0, -0.6);
    scene.add(tableGroup);
    meshesMap.set('ent-furn-table', tableGroup);

    // B. Ergonomic Task Chair (Overturned)
    const chairGroup = createErgonomicChair();
    chairGroup.rotation.set(1.4, 0.3, 0.6);
    chairGroup.position.set(-1.9, 0.35, 0.3);
    scene.add(chairGroup);
    meshesMap.set('ent-furn-chair', chairGroup);

    // C. Subject Alpha (Forensic White Mannequin with Internal Skeleton)
    const personGroup = createHumanMannequin();
    personGroup.position.set(0.1, 0.0, 0.3);
    personGroup.rotation.y = 0.45;
    scene.add(personGroup);
    meshesMap.set('ent-person-01', personGroup);

    // D. 3D Faceted Glass Dispersion Cluster
    const glassField = createGlassDispersionCluster();
    glassField.position.set(0, 0, 0);
    scene.add(glassField);
    meshesMap.set('ent-glass-field', glassField);

    // E. Breached East Window Frame & Shards
    const eastWindow = createBreachedWindow();
    eastWindow.position.set(-roomWidth / 2 + 0.02, 1.4, 0.2);
    eastWindow.rotation.y = Math.PI / 2;
    scene.add(eastWindow);
    meshesMap.set('ent-window-east', eastWindow);

    // F. Architectural North Egress Door
    const northDoor = createArchitecturalDoor();
    northDoor.position.set(2.4, 0.0, -roomDepth / 2 + 0.02);
    northDoor.rotation.y = Math.PI;
    scene.add(northDoor);
    meshesMap.set('ent-door-north', northDoor);

    // G. Spent 9x19mm Brass Casing
    const spentCasing = createSpentCasing();
    spentCasing.position.set(1.1, 0.015, 0.5);
    spentCasing.rotation.y = 0.7;
    scene.add(spentCasing);
    meshesMap.set('ent-obj-casing', spentCasing);

    // H. Ballistic Trajectory Laser Beam
    const laserCurve = new THREE.LineCurve3(
      new THREE.Vector3(-roomWidth / 2, 1.4, 0.2),
      new THREE.Vector3(-0.4, 0.15, 1.3)
    );
    const laserGeo = new THREE.TubeGeometry(laserCurve, 32, 0.014, 8, false);
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

    // I. Evidence Marker Cones Group
    scene.add(markerGroupRef.current);

    // J. Measurements Group
    scene.add(measureGroupRef.current);

    // K. Measurement Start Point Pin Indicator
    const pinGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const pinMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 0.6,
      roughness: 0.2,
    });
    const pinMesh = new THREE.Mesh(pinGeo, pinMat);
    pinMesh.visible = false;
    scene.add(pinMesh);
    measureStartPinRef.current = pinMesh;

    // L. Subtle Selection Box Helper
    const boxHelper = new THREE.BoxHelper(tableGroup, 0x00f0ff);
    boxHelper.visible = false;
    scene.add(boxHelper);
    boxHelperRef.current = boxHelper;

    // M. Synthetic LiDAR Point Cloud (for Point Cloud Tab)
    const lidarPointCount = 8500;
    const lidarPositions = new Float32Array(lidarPointCount * 3);
    const lidarColors = new Float32Array(lidarPointCount * 3);
    for (let i = 0; i < lidarPointCount; i++) {
      const px = (Math.random() - 0.5) * roomWidth;
      const py = Math.random() * 2.8;
      const pz = (Math.random() - 0.5) * roomDepth;
      lidarPositions[i * 3] = px;
      lidarPositions[i * 3 + 1] = py;
      lidarPositions[i * 3 + 2] = pz;
      lidarColors[i * 3] = 0.0;
      lidarColors[i * 3 + 1] = 0.6 + (py / 2.8) * 0.4;
      lidarColors[i * 3 + 2] = 1.0;
    }
    const lidarCloudGeo = new THREE.BufferGeometry();
    lidarCloudGeo.setAttribute('position', new THREE.BufferAttribute(lidarPositions, 3));
    lidarCloudGeo.setAttribute('color', new THREE.BufferAttribute(lidarColors, 3));
    const lidarCloudMat = new THREE.PointsMaterial({
      size: 0.024,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
    });
    const lidarCloud = new THREE.Points(lidarCloudGeo, lidarCloudMat);
    lidarCloud.visible = activeTab === 'Point Cloud';
    scene.add(lidarCloud);
    lidarCloudRef.current = lidarCloud;

    // N. TransformControls (Auxiliary Gizmo)
    const transformControls = new TransformControls(camera, renderer.domElement);
    transformControls.size = 0.75;
    scene.add(transformControls.getHelper());
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
        onUpdateEntityRotationRef.current?.(targetId, parseFloat(mesh.rotation.y.toFixed(2)));
      }
    });

    // 8. Natural Ground-Aware Drag-and-Move & Pointer Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let pointerDownPos = { x: 0, y: 0 };
    const floorDragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const planeIntersectPoint = new THREE.Vector3();

    const getTopEntityMesh = (hitObject: THREE.Object3D): THREE.Object3D | null => {
      let curr: THREE.Object3D | null = hitObject;
      while (curr && !curr.name && curr.parent) {
        curr = curr.parent;
      }
      return curr && curr.name && meshesMapRef.current.has(curr.name) ? curr : null;
    };

    const handlePointerDown = (event: MouseEvent) => {
      pointerDownPos = { x: event.clientX, y: event.clientY };
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      const tool = activeToolRef.current;

      // TOOL: MOVE -> Direct Natural Grab and Move along Floor
      if (tool === 'move') {
        const objectsToTest = Array.from(meshesMapRef.current.values());
        const hits = raycaster.intersectObjects(objectsToTest, true);

        if (hits.length > 0) {
          const topMesh = getTopEntityMesh(hits[0].object);
          if (topMesh && topMesh.name !== 'ent-env-room' && topMesh.name !== 'ent-window-east' && topMesh.name !== 'ent-door-north') {
            isDirectDraggingRef.current = true;
            dragEntityIdRef.current = topMesh.name;
            onSelectEntityRef.current(topMesh.name);
            controls.enabled = false;

            // Intersect virtual horizontal floor plane at object's base
            floorDragPlane.constant = -topMesh.position.y;
            if (raycaster.ray.intersectPlane(floorDragPlane, planeIntersectPoint)) {
              dragOffsetRef.current.subVectors(topMesh.position, planeIntersectPoint);
            }
            dragPlaneYRef.current = topMesh.position.y;
            return;
          }
        }
      }

      // TOOL: ROTATE -> Natural Horizontal Yaw Rotation
      if (tool === 'rotate') {
        const objectsToTest = Array.from(meshesMapRef.current.values());
        const hits = raycaster.intersectObjects(objectsToTest, true);

        if (hits.length > 0) {
          const topMesh = getTopEntityMesh(hits[0].object);
          if (topMesh) {
            isDirectRotatingRef.current = true;
            dragEntityIdRef.current = topMesh.name;
            onSelectEntityRef.current(topMesh.name);
            controls.enabled = false;
            rotateStartClientXRef.current = event.clientX;
            rotateStartAngleRef.current = topMesh.rotation.y;
            return;
          }
        }
      }
    };

    const handlePointerMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      // 1. Natural Floor Drag
      if (isDirectDraggingRef.current && dragEntityIdRef.current) {
        const mesh = meshesMapRef.current.get(dragEntityIdRef.current);
        if (mesh) {
          if (event.shiftKey) {
            // Shift + Drag: Vertical elevation along Y axis
            const camDir = new THREE.Vector3();
            camera.getWorldDirection(camDir);
            const verticalPlane = new THREE.Plane();
            verticalPlane.setFromNormalAndCoplanarPoint(camDir, mesh.position);
            if (raycaster.ray.intersectPlane(verticalPlane, planeIntersectPoint)) {
              mesh.position.y = Math.max(0.02, Math.min(2.5, planeIntersectPoint.y));
            }
          } else {
            // Normal Drag: Ground-aware movement clamped to room floor
            floorDragPlane.constant = -dragPlaneYRef.current;
            if (raycaster.ray.intersectPlane(floorDragPlane, planeIntersectPoint)) {
              const newX = planeIntersectPoint.x + dragOffsetRef.current.x;
              const newZ = planeIntersectPoint.z + dragOffsetRef.current.z;
              mesh.position.x = THREE.MathUtils.clamp(newX, -3.1, 3.1);
              mesh.position.z = THREE.MathUtils.clamp(newZ, -2.8, 2.8);
            }
          }
          if (boxHelperRef.current) {
            boxHelperRef.current.setFromObject(mesh);
          }
        }
        return;
      }

      // 2. Natural Rotation
      if (isDirectRotatingRef.current && dragEntityIdRef.current) {
        const mesh = meshesMapRef.current.get(dragEntityIdRef.current);
        if (mesh) {
          const deltaX = event.clientX - rotateStartClientXRef.current;
          mesh.rotation.y = rotateStartAngleRef.current + deltaX * 0.015;
          if (boxHelperRef.current) {
            boxHelperRef.current.setFromObject(mesh);
          }
        }
        return;
      }
    };

    const handlePointerUp = (event: MouseEvent) => {
      // If was dragging object, commit position
      if (isDirectDraggingRef.current && dragEntityIdRef.current) {
        const mesh = meshesMapRef.current.get(dragEntityIdRef.current);
        if (mesh) {
          onUpdateEntityPositionRef.current?.(dragEntityIdRef.current, [
            parseFloat(mesh.position.x.toFixed(2)),
            parseFloat(mesh.position.y.toFixed(2)),
            parseFloat(mesh.position.z.toFixed(2)),
          ]);
        }
        isDirectDraggingRef.current = false;
        dragEntityIdRef.current = null;
        controls.enabled = true;
        return;
      }

      // If was rotating object, commit rotation
      if (isDirectRotatingRef.current && dragEntityIdRef.current) {
        const mesh = meshesMapRef.current.get(dragEntityIdRef.current);
        if (mesh) {
          onUpdateEntityRotationRef.current?.(dragEntityIdRef.current, parseFloat(mesh.rotation.y.toFixed(2)));
        }
        isDirectRotatingRef.current = false;
        dragEntityIdRef.current = null;
        controls.enabled = true;
        return;
      }

      const dx = Math.abs(event.clientX - pointerDownPos.x);
      const dy = Math.abs(event.clientY - pointerDownPos.y);
      if (dx > 6 || dy > 6) return;
      if (transformControlsRef.current?.dragging) return;

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const tool = activeToolRef.current;

      // TOOL: MEASURE
      if (tool === 'measure') {
        const testTargets = [floorMesh, ...Array.from(meshesMapRef.current.values())];
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
        const testTargets = [floorMesh, ...Array.from(meshesMapRef.current.values())];
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
        const topMesh = getTopEntityMesh(objectIntersects[0].object);
        if (topMesh && topMesh.name) {
          onSelectEntityRef.current(topMesh.name);
          return;
        }
      }

      // Clicked on empty floor or space while in select tool
      if (tool === 'select') {
        onSelectEntityRef.current(null);
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    // 9. Render Loop
    let animationFrameId: number;
    let clock = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      clock += 0.016;

      // Gentle floating glow for evidence markers
      markerGroupRef.current.children.forEach((mesh, idx) => {
        if (markersRef.current[idx]) {
          mesh.position.y = markersRef.current[idx].coordinates[1] + Math.sin(clock * 2.5 + idx) * 0.02;
          mesh.rotation.y = clock * 0.8;
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

      // Project 3D Measurement Midpoints to 2D Screen Badges
      if (cameraRef.current && measurementsRef.current.length > 0) {
        const halfW = renderer.domElement.clientWidth / 2;
        const halfH = renderer.domElement.clientHeight / 2;
        const badges = measurementsRef.current.map((m) => {
          const midPoint = new THREE.Vector3(
            (m.fromCoord[0] + m.toCoord[0]) / 2,
            (m.fromCoord[1] + m.toCoord[1]) / 2 + 0.15,
            (m.fromCoord[2] + m.toCoord[2]) / 2
          );
          midPoint.project(cameraRef.current!);
          return {
            id: m.id,
            dist: `${m.distanceMeters.toFixed(2)}m`,
            label: m.label,
            x: midPoint.x * halfW + halfW,
            y: -(midPoint.y * halfH) + halfH,
            visible: midPoint.z < 1.0,
          };
        });
        setMeasurementBadges(badges);
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // 10. Resize handler
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      cancelAnimationFrame(animationFrameId);
      if (transformControlsRef.current) {
        scene.remove(transformControlsRef.current.getHelper());
        transformControlsRef.current.dispose();
      }
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Synchronize dynamic entity positions from centralized state
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

  // Synchronize TransformControls, BoxHelper & Mannequin Highlight with activeTool & selectedEntityId
  useEffect(() => {
    const tc = transformControlsRef.current;
    const box = boxHelperRef.current;
    if (!tc || !box) return;

    // Toggle Mannequin skeleton outline highlight
    const mannequinMesh = meshesMapRef.current.get('ent-person-01') as MannequinModel | undefined;
    if (mannequinMesh && mannequinMesh.setHighlighted) {
      mannequinMesh.setHighlighted(selectedEntityId === 'ent-person-01');
    }

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

    markers.forEach((marker) => {
      const coneGroup = new THREE.Group();
      coneGroup.position.set(marker.coordinates[0], marker.coordinates[1], marker.coordinates[2]);

      const coneGeo = new THREE.ConeGeometry(0.09, 0.28, 16);
      const coneMat = new THREE.MeshStandardMaterial({
        color: 0x00f0ff,
        emissive: 0x00f0ff,
        emissiveIntensity: 0.55,
        roughness: 0.2,
        metalness: 0.8,
      });
      const cone = new THREE.Mesh(coneGeo, coneMat);
      cone.rotation.x = Math.PI;
      cone.castShadow = true;
      coneGroup.add(cone);

      const beaconGeo = new THREE.RingGeometry(0.18, 0.22, 24);
      const beaconMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7,
      });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.rotation.x = -Math.PI / 2;
      beacon.position.y = -0.14;
      coneGroup.add(beacon);

      coneGroup.userData = { markerData: marker };
      cone.userData = { markerData: marker };
      group.add(coneGroup);
    });
  }, [markers]);

  // Synchronize 3D Measurement Lines in Scene
  useEffect(() => {
    const group = measureGroupRef.current;
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }

    measurements.forEach((m) => {
      const pA = new THREE.Vector3(m.fromCoord[0], m.fromCoord[1], m.fromCoord[2]);
      const pB = new THREE.Vector3(m.toCoord[0], m.toCoord[1], m.toCoord[2]);

      const lineGeo = new THREE.BufferGeometry().setFromPoints([pA, pB]);
      const lineMat = new THREE.LineDashedMaterial({
        color: 0x00f0ff,
        dashSize: 0.15,
        gapSize: 0.08,
        linewidth: 2,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      line.computeLineDistances();
      group.add(line);

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
            child.material.opacity = 0.3;
          } else {
            child.material.wireframe = false;
            child.material.transparent = child.name.includes('glass') || child.name.includes('window');
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
        cursor: activeTool === 'move' ? 'grab' : activeTool === 'rotate' ? 'ew-resize' : 'default',
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

      {/* 5. Selected Entity HUD Overlay with RESTORE ORIGINAL Action */}
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
          minWidth: '290px',
          maxWidth: '380px',
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
            fontSize: '13.5px',
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

          {/* Direct Manipulation Instruction Hint */}
          <div style={{
            fontSize: '10px',
            fontFamily: 'var(--font-mono, monospace)',
            color: '#38bdf8',
            background: 'rgba(0, 240, 255, 0.08)',
            border: '1px solid rgba(0, 240, 255, 0.2)',
            borderRadius: '4px',
            padding: '5px 8px',
            marginBottom: '8px',
            lineHeight: 1.4,
          }}>
            {activeTool === 'move' && 'MOVE ACTIVE: Click & drag object across the floor. Hold Shift for vertical elevation.'}
            {activeTool === 'rotate' && 'ROTATE ACTIVE: Click & drag horizontally to pivot entity heading.'}
            {activeTool === 'select' && 'SELECT ACTIVE: Switch to Move or Rotate tool to reposition.'}
            {activeTool === 'measure' && 'MEASURE ACTIVE: Click two points to measure distance.'}
            {activeTool === 'evidence' && 'EVIDENCE ACTIVE: Click in scene to place marker.'}
          </div>

          {/* RESTORE ORIGINAL BUTTON */}
          {onRestoreOriginalEntity && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '4px' }}>
              <button
                onClick={() => onRestoreOriginalEntity(selectedEntity.id)}
                title="Return only this entity to its calibrated original baseline"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '5px 12px',
                  borderRadius: '4px',
                  background: 'rgba(0, 240, 255, 0.15)',
                  border: '1px solid #00f0ff',
                  color: '#00f0ff',
                  fontSize: '10.5px',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 0 8px rgba(0, 240, 255, 0.25)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 240, 255, 0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 240, 255, 0.15)';
                }}
              >
                <RotateCcw size={11} />
                <span>RESTORE ORIGINAL</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* 6. Interactive Evidence Marker Tooltip */}
      {hoveredMarker && (
        <div style={{
          position: 'absolute',
          bottom: '24px',
          left: selectedEntity ? '420px' : '20px',
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
        <span>GROUND-AWARE DRAG ACTIVE</span>
      </div>
    </div>
  );
};
