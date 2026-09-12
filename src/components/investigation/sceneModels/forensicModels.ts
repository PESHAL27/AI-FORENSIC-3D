import * as THREE from 'three';

// ---------------------------------------------------------------------------
// PBR MATERIALS PALETTE
// ---------------------------------------------------------------------------
const MATERIALS = {
  // Clean forensic reconstruction mannequin (white / light-neutral matte)
  mannequin: new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    roughness: 0.35,
    metalness: 0.08,
    envMapIntensity: 0.6,
  }),
  mannequinJoint: new THREE.MeshStandardMaterial({
    color: 0xdbeafe,
    roughness: 0.25,
    metalness: 0.15,
  }),
  skeletonGlow: new THREE.LineBasicMaterial({
    color: 0x00f0ff,
    transparent: true,
    opacity: 0.4,
    linewidth: 1,
  }),
  skeletonGlowActive: new THREE.LineBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.85,
    linewidth: 2,
  }),

  // Ergonomic Task Chair
  chairFabric: new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.7,
    metalness: 0.1,
  }),
  chairFrame: new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.4,
    metalness: 0.3,
  }),
  chairChrome: new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.2,
    metalness: 0.85,
  }),
  chairCaster: new THREE.MeshStandardMaterial({
    color: 0x090d16,
    roughness: 0.5,
    metalness: 0.2,
  }),

  // Executive Conference Desk
  deskTop: new THREE.MeshStandardMaterial({
    color: 0x111827,
    roughness: 0.35,
    metalness: 0.25,
  }),
  deskMetal: new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.25,
    metalness: 0.8,
  }),
  deskTrim: new THREE.MeshStandardMaterial({
    color: 0x00f0ff,
    roughness: 0.2,
    metalness: 0.6,
    emissive: 0x003344,
    emissiveIntensity: 0.3,
  }),

  // Architectural Door & Window
  doorWood: new THREE.MeshStandardMaterial({
    color: 0x0f1d38,
    roughness: 0.6,
    metalness: 0.15,
  }),
  doorFrame: new THREE.MeshStandardMaterial({
    color: 0x1e2c4c,
    roughness: 0.5,
    metalness: 0.2,
  }),
  metalHardware: new THREE.MeshStandardMaterial({
    color: 0xcfd8dc,
    roughness: 0.2,
    metalness: 0.85,
  }),
  windowGlass: new THREE.MeshStandardMaterial({
    color: 0x88d4f5,
    transparent: true,
    opacity: 0.35,
    roughness: 0.05,
    metalness: 0.1,
  }),
  brokenGlassShards: new THREE.MeshStandardMaterial({
    color: 0xa5f3fc,
    transparent: true,
    opacity: 0.75,
    roughness: 0.08,
    metalness: 0.15,
  }),

  // Casing & Ballistics
  brassCasing: new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    roughness: 0.25,
    metalness: 0.9,
  }),

  // Terminal & Tech
  terminalScreen: new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    emissive: 0x0284c7,
    emissiveIntensity: 0.6,
    roughness: 0.2,
  }),
  terminalBody: new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.4,
    metalness: 0.6,
  }),
};

// ---------------------------------------------------------------------------
// 1. FORENSIC HUMAN MANNEQUIN
// ---------------------------------------------------------------------------
export interface MannequinModel extends THREE.Group {
  setPose: (pose: 'standing' | 'sitting' | 'evasive' | 'walking', factor?: number) => void;
  setHighlighted: (highlighted: boolean) => void;
}

export function createHumanMannequin(): MannequinModel {
  const root = new THREE.Group() as MannequinModel;
  root.name = 'ent-person-01';

  // Master body groups for kinematic articulation
  const pelvisGroup = new THREE.Group();
  pelvisGroup.position.set(0, 0.92, 0);
  root.add(pelvisGroup);

  // Pelvis / Hips
  const pelvisGeo = new THREE.CylinderGeometry(0.14, 0.12, 0.16, 16);
  const pelvis = new THREE.Mesh(pelvisGeo, MATERIALS.mannequin);
  pelvis.castShadow = true;
  pelvisGroup.add(pelvis);

  // Torso / Spine
  const spineGroup = new THREE.Group();
  spineGroup.position.set(0, 0.08, 0);
  pelvisGroup.add(spineGroup);

  // Abdomen
  const abdomenGeo = new THREE.CylinderGeometry(0.13, 0.14, 0.18, 16);
  const abdomen = new THREE.Mesh(abdomenGeo, MATERIALS.mannequin);
  abdomen.position.set(0, 0.09, 0);
  abdomen.castShadow = true;
  spineGroup.add(abdomen);

  // Chest / Ribcage
  const chestGroup = new THREE.Group();
  chestGroup.position.set(0, 0.18, 0);
  spineGroup.add(chestGroup);

  const chestGeo = new THREE.BoxGeometry(0.32, 0.28, 0.18);
  const chest = new THREE.Mesh(chestGeo, MATERIALS.mannequin);
  chest.position.set(0, 0.14, 0);
  chest.castShadow = true;
  chestGroup.add(chest);

  // Neck & Head
  const neckGeo = new THREE.CylinderGeometry(0.06, 0.07, 0.1, 16);
  const neck = new THREE.Mesh(neckGeo, MATERIALS.mannequinJoint);
  neck.position.set(0, 0.31, 0);
  chestGroup.add(neck);

  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.44, 0);
  chestGroup.add(headGroup);

  // Anatomical Head (Cranium + Stylized Facet)
  const craniumGeo = new THREE.SphereGeometry(0.11, 20, 20);
  craniumGeo.scale(1, 1.25, 1.15);
  const cranium = new THREE.Mesh(craniumGeo, MATERIALS.mannequin);
  cranium.castShadow = true;
  headGroup.add(cranium);

  // Left Arm Hierarchy
  const leftClavicle = new THREE.Group();
  leftClavicle.position.set(-0.19, 0.24, 0);
  chestGroup.add(leftClavicle);

  const leftShoulderJoint = new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 16), MATERIALS.mannequinJoint);
  leftClavicle.add(leftShoulderJoint);

  const leftUpperArmGroup = new THREE.Group();
  leftClavicle.add(leftUpperArmGroup);

  const upperArmGeo = new THREE.CylinderGeometry(0.048, 0.042, 0.28, 16);
  upperArmGeo.translate(0, -0.14, 0);
  const leftUpperArm = new THREE.Mesh(upperArmGeo, MATERIALS.mannequin);
  leftUpperArm.castShadow = true;
  leftUpperArmGroup.add(leftUpperArm);

  const leftForearmGroup = new THREE.Group();
  leftForearmGroup.position.set(0, -0.28, 0);
  leftUpperArmGroup.add(leftForearmGroup);

  const elbowJoint = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 16), MATERIALS.mannequinJoint);
  leftForearmGroup.add(elbowJoint);

  const forearmGeo = new THREE.CylinderGeometry(0.042, 0.035, 0.26, 16);
  forearmGeo.translate(0, -0.13, 0);
  const leftForearm = new THREE.Mesh(forearmGeo, MATERIALS.mannequin);
  leftForearm.castShadow = true;
  leftForearmGroup.add(leftForearm);

  const leftHand = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.09, 0.07), MATERIALS.mannequin);
  leftHand.position.set(0, -0.29, 0);
  leftHand.castShadow = true;
  leftForearmGroup.add(leftHand);

  // Right Arm Hierarchy
  const rightClavicle = new THREE.Group();
  rightClavicle.position.set(0.19, 0.24, 0);
  chestGroup.add(rightClavicle);

  const rightShoulderJoint = new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 16), MATERIALS.mannequinJoint);
  rightClavicle.add(rightShoulderJoint);

  const rightUpperArmGroup = new THREE.Group();
  rightClavicle.add(rightUpperArmGroup);

  const rightUpperArm = new THREE.Mesh(upperArmGeo, MATERIALS.mannequin);
  rightUpperArm.castShadow = true;
  rightUpperArmGroup.add(rightUpperArm);

  const rightForearmGroup = new THREE.Group();
  rightForearmGroup.position.set(0, -0.28, 0);
  rightUpperArmGroup.add(rightForearmGroup);

  const rightElbowJoint = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 16), MATERIALS.mannequinJoint);
  rightForearmGroup.add(rightElbowJoint);

  const rightForearm = new THREE.Mesh(forearmGeo, MATERIALS.mannequin);
  rightForearm.castShadow = true;
  rightForearmGroup.add(rightForearm);

  const rightHand = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.09, 0.07), MATERIALS.mannequin);
  rightHand.position.set(0, -0.29, 0);
  rightHand.castShadow = true;
  rightForearmGroup.add(rightHand);

  // Left Leg Hierarchy
  const leftHipGroup = new THREE.Group();
  leftHipGroup.position.set(-0.11, -0.08, 0);
  pelvisGroup.add(leftHipGroup);

  const hipJoint = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 16), MATERIALS.mannequinJoint);
  leftHipGroup.add(hipJoint);

  const leftThighGroup = new THREE.Group();
  leftHipGroup.add(leftThighGroup);

  const thighGeo = new THREE.CylinderGeometry(0.065, 0.05, 0.42, 16);
  thighGeo.translate(0, -0.21, 0);
  const leftThigh = new THREE.Mesh(thighGeo, MATERIALS.mannequin);
  leftThigh.castShadow = true;
  leftThighGroup.add(leftThigh);

  const leftKneeGroup = new THREE.Group();
  leftKneeGroup.position.set(0, -0.42, 0);
  leftThighGroup.add(leftKneeGroup);

  const kneeJoint = new THREE.Mesh(new THREE.SphereGeometry(0.052, 16, 16), MATERIALS.mannequinJoint);
  leftKneeGroup.add(kneeJoint);

  const calfGeo = new THREE.CylinderGeometry(0.048, 0.038, 0.4, 16);
  calfGeo.translate(0, -0.2, 0);
  const leftCalf = new THREE.Mesh(calfGeo, MATERIALS.mannequin);
  leftCalf.castShadow = true;
  leftKneeGroup.add(leftCalf);

  const footGeo = new THREE.BoxGeometry(0.08, 0.06, 0.19);
  const leftFoot = new THREE.Mesh(footGeo, MATERIALS.mannequin);
  leftFoot.position.set(0, -0.41, 0.04);
  leftFoot.castShadow = true;
  leftKneeGroup.add(leftFoot);

  // Right Leg Hierarchy
  const rightHipGroup = new THREE.Group();
  rightHipGroup.position.set(0.11, -0.08, 0);
  pelvisGroup.add(rightHipGroup);

  const rightHipJoint = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 16), MATERIALS.mannequinJoint);
  rightHipGroup.add(rightHipJoint);

  const rightThighGroup = new THREE.Group();
  rightHipGroup.add(rightThighGroup);

  const rightThigh = new THREE.Mesh(thighGeo, MATERIALS.mannequin);
  rightThigh.castShadow = true;
  rightThighGroup.add(rightThigh);

  const rightKneeGroup = new THREE.Group();
  rightKneeGroup.position.set(0, -0.42, 0);
  rightThighGroup.add(rightKneeGroup);

  const rightKneeJoint = new THREE.Mesh(new THREE.SphereGeometry(0.052, 16, 16), MATERIALS.mannequinJoint);
  rightKneeGroup.add(rightKneeJoint);

  const rightCalf = new THREE.Mesh(calfGeo, MATERIALS.mannequin);
  rightCalf.castShadow = true;
  rightKneeGroup.add(rightCalf);

  const rightFoot = new THREE.Mesh(footGeo, MATERIALS.mannequin);
  rightFoot.position.set(0, -0.41, 0.04);
  rightFoot.castShadow = true;
  rightKneeGroup.add(rightFoot);

  // Subtle Internal Cyan Skeleton
  const skeletonGeo = new THREE.BufferGeometry();
  const skeletonPoints = [
    // Spine
    0, 0, 0,  0, 0.35, 0,
    0, 0.35, 0,  0, 0.52, 0,
    // Shoulders
    -0.19, 0.35, 0,  0.19, 0.35, 0,
    // Left Arm
    -0.19, 0.35, 0,  -0.24, 0.12, 0,
    -0.24, 0.12, 0,  -0.24, -0.15, 0,
    // Right Arm
    0.19, 0.35, 0,  0.24, 0.12, 0,
    0.24, 0.12, 0,  0.24, -0.15, 0,
    // Pelvis
    -0.11, 0, 0,  0.11, 0, 0,
    // Left Leg
    -0.11, 0, 0,  -0.12, -0.42, 0,
    -0.12, -0.42, 0,  -0.12, -0.84, 0,
    // Right Leg
    0.11, 0, 0,  0.12, -0.42, 0,
    0.12, -0.42, 0,  0.12, -0.84, 0,
  ];
  skeletonGeo.setAttribute('position', new THREE.Float32BufferAttribute(skeletonPoints, 3));
  const skeletonLine = new THREE.LineSegments(skeletonGeo, MATERIALS.skeletonGlow);
  pelvisGroup.add(skeletonLine);

  // Forensic Base Positioning Ring
  const ringGeo = new THREE.RingGeometry(0.32, 0.36, 32);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, side: THREE.DoubleSide, transparent: true, opacity: 0.7 });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.01;
  root.add(ring);

  // Method: dynamic posing
  root.setPose = (pose: 'standing' | 'sitting' | 'evasive' | 'walking', factor = 1) => {
    // Reset rotations
    pelvisGroup.position.set(0, 0.92, 0);
    pelvisGroup.rotation.set(0, 0, 0);
    spineGroup.rotation.set(0, 0, 0);
    chestGroup.rotation.set(0, 0, 0);
    headGroup.rotation.set(0, 0, 0);
    leftUpperArmGroup.rotation.set(0, 0, 0);
    leftForearmGroup.rotation.set(0, 0, 0);
    rightUpperArmGroup.rotation.set(0, 0, 0);
    rightForearmGroup.rotation.set(0, 0, 0);
    leftThighGroup.rotation.set(0, 0, 0);
    leftKneeGroup.rotation.set(0, 0, 0);
    rightThighGroup.rotation.set(0, 0, 0);
    rightKneeGroup.rotation.set(0, 0, 0);

    if (pose === 'sitting') {
      pelvisGroup.position.y = 0.52;
      leftThighGroup.rotation.x = -Math.PI / 2;
      rightThighGroup.rotation.x = -Math.PI / 2;
      leftKneeGroup.rotation.x = Math.PI / 2;
      rightKneeGroup.rotation.x = Math.PI / 2;
      leftUpperArmGroup.rotation.x = -0.3;
      rightUpperArmGroup.rotation.x = -0.3;
      leftForearmGroup.rotation.x = -0.6;
      rightForearmGroup.rotation.x = -0.6;
    } else if (pose === 'evasive') {
      // Defensive evasive stance (leaning back, arms shielding face)
      pelvisGroup.position.y = 0.82;
      pelvisGroup.rotation.x = 0.25 * factor;
      spineGroup.rotation.x = 0.3 * factor;
      chestGroup.rotation.y = -0.2 * factor;
      headGroup.rotation.x = -0.25 * factor;
      headGroup.rotation.y = 0.3 * factor;

      leftUpperArmGroup.rotation.x = -1.2 * factor;
      leftUpperArmGroup.rotation.z = -0.4 * factor;
      leftForearmGroup.rotation.x = -1.3 * factor;

      rightUpperArmGroup.rotation.x = -1.4 * factor;
      rightUpperArmGroup.rotation.z = 0.5 * factor;
      rightForearmGroup.rotation.x = -1.2 * factor;

      leftThighGroup.rotation.x = 0.3 * factor;
      leftKneeGroup.rotation.x = -0.4 * factor;
      rightThighGroup.rotation.x = -0.4 * factor;
      rightKneeGroup.rotation.x = 0.6 * factor;
    } else if (pose === 'walking') {
      // Natural walking gait cycle
      const cycle = Math.sin(factor * Math.PI * 2);
      leftThighGroup.rotation.x = cycle * 0.45;
      rightThighGroup.rotation.x = -cycle * 0.45;
      leftKneeGroup.rotation.x = Math.max(0, -cycle * 0.5);
      rightKneeGroup.rotation.x = Math.max(0, cycle * 0.5);

      leftUpperArmGroup.rotation.x = -cycle * 0.35;
      rightUpperArmGroup.rotation.x = cycle * 0.35;
      spineGroup.rotation.y = -cycle * 0.08;
    }
  };

  root.setHighlighted = (highlighted: boolean) => {
    skeletonLine.material = highlighted ? MATERIALS.skeletonGlowActive : MATERIALS.skeletonGlow;
    ring.visible = highlighted;
  };

  // Default initial pose: defensive evasive recoil
  root.setPose('evasive', 1);

  return root;
}

// ---------------------------------------------------------------------------
// 2. ERGONOMIC TASK CHAIR
// ---------------------------------------------------------------------------
export function createErgonomicChair(): THREE.Group {
  const chair = new THREE.Group();
  chair.name = 'ent-furn-chair';

  // A. 5-Star Caster Base
  const baseGroup = new THREE.Group();
  baseGroup.position.set(0, 0.06, 0);
  chair.add(baseGroup);

  // Central Chrome Hub
  const hubGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.08, 16);
  const hub = new THREE.Mesh(hubGeo, MATERIALS.chairChrome);
  hub.castShadow = true;
  baseGroup.add(hub);

  // 5 Star Legs
  const legCount = 5;
  const legLength = 0.34;
  for (let i = 0; i < legCount; i++) {
    const angle = (i * Math.PI * 2) / legCount;
    const legArm = new THREE.Group();
    legArm.rotation.y = angle;

    // Curved arched strut
    const strutGeo = new THREE.BoxGeometry(0.035, 0.03, legLength);
    const strut = new THREE.Mesh(strutGeo, MATERIALS.chairChrome);
    strut.position.set(0, 0.015, legLength / 2);
    strut.rotation.x = -0.05;
    strut.castShadow = true;
    legArm.add(strut);

    // Caster Wheel at tip
    const casterGroup = new THREE.Group();
    casterGroup.position.set(0, -0.02, legLength);

    const casterWheelGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.02, 12);
    casterWheelGeo.rotateZ(Math.PI / 2);
    const casterWheel = new THREE.Mesh(casterWheelGeo, MATERIALS.chairCaster);
    casterWheel.castShadow = true;
    casterGroup.add(casterWheel);

    legArm.add(casterGroup);
    baseGroup.add(legArm);
  }

  // B. Hydraulic Lift Cylinder
  const pistonGeo = new THREE.CylinderGeometry(0.028, 0.032, 0.32, 16);
  const piston = new THREE.Mesh(pistonGeo, MATERIALS.chairChrome);
  piston.position.set(0, 0.22, 0);
  piston.castShadow = true;
  chair.add(piston);

  const sleeveGeo = new THREE.CylinderGeometry(0.038, 0.042, 0.16, 16);
  const sleeve = new THREE.Mesh(sleeveGeo, MATERIALS.chairFrame);
  sleeve.position.set(0, 0.14, 0);
  sleeve.castShadow = true;
  chair.add(sleeve);

  // C. Seat Cushion & Support Mechanism
  const seatGroup = new THREE.Group();
  seatGroup.position.set(0, 0.38, 0);
  chair.add(seatGroup);

  // Mechanism under seat
  const mechGeo = new THREE.BoxGeometry(0.24, 0.06, 0.22);
  const mech = new THREE.Mesh(mechGeo, MATERIALS.chairFrame);
  mech.position.set(0, -0.02, 0);
  mech.castShadow = true;
  seatGroup.add(mech);

  // Ergonomic Contoured Seat
  const seatGeo = new THREE.BoxGeometry(0.5, 0.07, 0.48);
  const seat = new THREE.Mesh(seatGeo, MATERIALS.chairFabric);
  seat.position.set(0, 0.04, 0);
  seat.castShadow = true;
  seat.receiveShadow = true;
  seatGroup.add(seat);

  // D. Ergonomic Curved Backrest
  const backGroup = new THREE.Group();
  backGroup.position.set(0, 0.08, -0.22);
  seatGroup.add(backGroup);

  // Spine bracket connecting seat to backrest
  const spineGeo = new THREE.BoxGeometry(0.06, 0.45, 0.04);
  const spine = new THREE.Mesh(spineGeo, MATERIALS.chairFrame);
  spine.position.set(0, 0.22, -0.04);
  spine.rotation.x = -0.12;
  spine.castShadow = true;
  backGroup.add(spine);

  // Backrest Cushion (Curved Contour)
  const backCushionGeo = new THREE.BoxGeometry(0.44, 0.48, 0.05);
  const backCushion = new THREE.Mesh(backCushionGeo, MATERIALS.chairFabric);
  backCushion.position.set(0, 0.32, -0.02);
  backCushion.rotation.x = -0.1;
  backCushion.castShadow = true;
  backGroup.add(backCushion);

  // E. Armrests (Left & Right)
  [-0.26, 0.26].forEach((x) => {
    const armGroup = new THREE.Group();
    armGroup.position.set(x, 0.05, 0);
    seatGroup.add(armGroup);

    // T-strut
    const strutGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.2, 12);
    const strut = new THREE.Mesh(strutGeo, MATERIALS.chairFrame);
    strut.position.set(0, 0.1, 0);
    strut.castShadow = true;
    armGroup.add(strut);

    // Arm Pad
    const padGeo = new THREE.BoxGeometry(0.07, 0.025, 0.22);
    const pad = new THREE.Mesh(padGeo, MATERIALS.chairFabric);
    pad.position.set(0, 0.2, 0.02);
    pad.castShadow = true;
    armGroup.add(pad);
  });

  return chair;
}

// ---------------------------------------------------------------------------
// 3. EXECUTIVE CONFERENCE DESK & LAPTOP
// ---------------------------------------------------------------------------
export function createConferenceDesk(): THREE.Group {
  const desk = new THREE.Group();
  desk.name = 'ent-furn-table';

  const width = 2.4;
  const depth = 1.1;
  const height = 0.76;

  // Tabletop (Beveled edge)
  const topGeo = new THREE.BoxGeometry(width, 0.06, depth);
  const top = new THREE.Mesh(topGeo, MATERIALS.deskTop);
  top.position.set(0, height, 0);
  top.castShadow = true;
  top.receiveShadow = true;
  desk.add(top);

  // Brushed Cyan Accent Trim along edge
  const trimGeo = new THREE.BoxGeometry(width + 0.02, 0.012, depth + 0.02);
  const trim = new THREE.Mesh(trimGeo, MATERIALS.deskTrim);
  trim.position.set(0, height + 0.025, 0);
  desk.add(trim);

  // Structural Steel Loop Legs (Left & Right)
  [-0.95, 0.95].forEach((x) => {
    const legLoop = new THREE.Group();
    legLoop.position.set(x, height / 2, 0);

    const postGeo = new THREE.BoxGeometry(0.06, height, 0.06);
    // Front post
    const postFront = new THREE.Mesh(postGeo, MATERIALS.deskMetal);
    postFront.position.set(0, 0, depth / 2 - 0.08);
    postFront.castShadow = true;
    legLoop.add(postFront);

    // Back post
    const postBack = new THREE.Mesh(postGeo, MATERIALS.deskMetal);
    postBack.position.set(0, 0, -depth / 2 + 0.08);
    postBack.castShadow = true;
    legLoop.add(postBack);

    // Bottom floor runner
    const runnerGeo = new THREE.BoxGeometry(0.06, 0.04, depth - 0.1);
    const runner = new THREE.Mesh(runnerGeo, MATERIALS.deskMetal);
    runner.position.set(0, -height / 2 + 0.02, 0);
    runner.castShadow = true;
    legLoop.add(runner);

    desk.add(legLoop);
  });

  // Modesty Panel
  const modestyGeo = new THREE.BoxGeometry(width - 0.4, 0.32, 0.02);
  const modesty = new THREE.Mesh(modestyGeo, MATERIALS.deskTop);
  modesty.position.set(0, height - 0.2, -depth / 2 + 0.12);
  modesty.castShadow = true;
  desk.add(modesty);

  // Cable Pass-Through Grommet
  const grommetGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.015, 16);
  const grommet = new THREE.Mesh(grommetGeo, MATERIALS.metalHardware);
  grommet.position.set(0.65, height + 0.035, -0.3);
  desk.add(grommet);

  // Forensic Field Laptop Terminal on Desk
  const laptopGroup = new THREE.Group();
  laptopGroup.position.set(0.2, height + 0.035, -0.05);
  laptopGroup.rotation.y = -0.2;

  // Base
  const lapBase = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.015, 0.24), MATERIALS.terminalBody);
  lapBase.castShadow = true;
  laptopGroup.add(lapBase);

  // Display Screen
  const lapScreenGroup = new THREE.Group();
  lapScreenGroup.position.set(0, 0.008, -0.12);
  lapScreenGroup.rotation.x = 0.35; // Opened screen

  const lapLid = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.22, 0.012), MATERIALS.terminalBody);
  lapLid.position.set(0, 0.11, 0);
  lapLid.castShadow = true;
  lapScreenGroup.add(lapLid);

  const lapScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.31, 0.19), MATERIALS.terminalScreen);
  lapScreen.position.set(0, 0.11, 0.007);
  lapScreenGroup.add(lapScreen);

  laptopGroup.add(lapScreenGroup);
  desk.add(laptopGroup);

  return desk;
}

// ---------------------------------------------------------------------------
// 4. ARCHITECTURAL DOOR WITH LATCH & DEFLECTION
// ---------------------------------------------------------------------------
export function createArchitecturalDoor(): THREE.Group {
  const doorGroup = new THREE.Group();
  doorGroup.name = 'ent-door-north';

  const frameWidth = 1.1;
  const frameHeight = 2.3;
  const doorThickness = 0.05;

  // Door Jambs & Header Frame
  const frameMat = MATERIALS.doorFrame;
  const frameThickness = 0.08;
  const frameDepth = 0.14;

  // Left jamb
  const leftJamb = new THREE.Mesh(
    new THREE.BoxGeometry(frameThickness, frameHeight, frameDepth),
    frameMat
  );
  leftJamb.position.set(-frameWidth / 2, frameHeight / 2, 0);
  leftJamb.castShadow = true;
  doorGroup.add(leftJamb);

  // Right jamb
  const rightJamb = new THREE.Mesh(
    new THREE.BoxGeometry(frameThickness, frameHeight, frameDepth),
    frameMat
  );
  rightJamb.position.set(frameWidth / 2, frameHeight / 2, 0);
  rightJamb.castShadow = true;
  doorGroup.add(rightJamb);

  // Top header
  const header = new THREE.Mesh(
    new THREE.BoxGeometry(frameWidth + frameThickness * 2, frameThickness, frameDepth),
    frameMat
  );
  header.position.set(0, frameHeight + frameThickness / 2, 0);
  header.castShadow = true;
  doorGroup.add(header);

  // Door Leaf Panel (Slightly ajar 15° for forensic breach realism)
  const doorLeafGroup = new THREE.Group();
  doorLeafGroup.position.set(-frameWidth / 2 + 0.02, 0, 0);
  doorLeafGroup.rotation.y = 0.28; // 16° ajar

  const doorLeafGeo = new THREE.BoxGeometry(frameWidth - 0.06, frameHeight - 0.02, doorThickness);
  doorLeafGeo.translate((frameWidth - 0.06) / 2, frameHeight / 2, 0);
  const doorLeaf = new THREE.Mesh(doorLeafGeo, MATERIALS.doorWood);
  doorLeaf.castShadow = true;
  doorLeafGroup.add(doorLeaf);

  // Lever Handle & Escutcheon Plate
  const handleZ = (frameWidth - 0.06) - 0.08;
  const handleY = 1.05;

  const escutcheon = new THREE.Mesh(
    new THREE.BoxGeometry(0.045, 0.18, 0.01),
    MATERIALS.metalHardware
  );
  escutcheon.position.set(handleZ, handleY, doorThickness / 2 + 0.006);
  doorLeafGroup.add(escutcheon);

  // Silver Lever Handle
  const lever = new THREE.Mesh(
    new THREE.CylinderGeometry(0.012, 0.012, 0.12, 12),
    MATERIALS.metalHardware
  );
  lever.rotation.z = Math.PI / 2;
  lever.position.set(handleZ + 0.04, handleY, doorThickness / 2 + 0.03);
  doorLeafGroup.add(lever);

  doorGroup.add(doorLeafGroup);

  // North Latch Strike Plate on Right Jamb (with forensic force indicator)
  const strikePlate = new THREE.Mesh(
    new THREE.BoxGeometry(0.02, 0.14, 0.06),
    new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0x7f1d1d,
      emissiveIntensity: 0.4,
      roughness: 0.3,
      metalness: 0.8,
    })
  );
  strikePlate.position.set(frameWidth / 2 - frameThickness / 2 + 0.01, 1.05, 0);
  doorGroup.add(strikePlate);

  return doorGroup;
}

// ---------------------------------------------------------------------------
// 5. BREACHED EAST WINDOW & MULLIONS
// ---------------------------------------------------------------------------
export function createBreachedWindow(): THREE.Group {
  const windowGroup = new THREE.Group();
  windowGroup.name = 'ent-window-east';

  const w = 2.6;
  const h = 1.8;
  const frameD = 0.12;

  // Frame Border
  const frameMat = MATERIALS.doorFrame;
  const borderThickness = 0.07;

  // Outer frame box
  const topBorder = new THREE.Mesh(new THREE.BoxGeometry(w, borderThickness, frameD), frameMat);
  topBorder.position.set(0, h / 2, 0);
  windowGroup.add(topBorder);

  const botBorder = new THREE.Mesh(new THREE.BoxGeometry(w, borderThickness, frameD), frameMat);
  botBorder.position.set(0, -h / 2, 0);
  windowGroup.add(botBorder);

  const leftBorder = new THREE.Mesh(new THREE.BoxGeometry(borderThickness, h, frameD), frameMat);
  leftBorder.position.set(-w / 2, 0, 0);
  windowGroup.add(leftBorder);

  const rightBorder = new THREE.Mesh(new THREE.BoxGeometry(borderThickness, h, frameD), frameMat);
  rightBorder.position.set(w / 2, 0, 0);
  windowGroup.add(rightBorder);

  // Center vertical mullion
  const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.04, h, frameD), frameMat);
  mullion.position.set(0, 0, 0);
  windowGroup.add(mullion);

  // Glazing Pane (Intact Side)
  const leftGlass = new THREE.Mesh(new THREE.PlaneGeometry(w / 2 - 0.06, h - 0.1), MATERIALS.windowGlass);
  leftGlass.position.set(-w / 4, 0, 0);
  windowGroup.add(leftGlass);

  // Breached Pane (Right Side - Partial Glass + Fracture Geometry)
  const rightGlassTop = new THREE.Mesh(
    new THREE.PlaneGeometry(w / 2 - 0.06, (h - 0.1) * 0.4),
    MATERIALS.windowGlass
  );
  rightGlassTop.position.set(w / 4, (h - 0.1) * 0.3, 0);
  windowGroup.add(rightGlassTop);

  const rightGlassBot = new THREE.Mesh(
    new THREE.PlaneGeometry(w / 2 - 0.06, (h - 0.1) * 0.25),
    MATERIALS.windowGlass
  );
  rightGlassBot.position.set(w / 4, -(h - 0.1) * 0.35, 0);
  windowGroup.add(rightGlassBot);

  // Spider Fracture Lines (Radial procedural lines around impact point)
  const fracturePoints = [];
  const epicentre = new THREE.Vector3(w / 4, 0.05, 0);
  for (let i = 0; i < 14; i++) {
    const angle = (i * Math.PI * 2) / 14 + (Math.random() - 0.5) * 0.2;
    const len = 0.2 + Math.random() * 0.35;
    fracturePoints.push(
      epicentre.x, epicentre.y, epicentre.z + 0.002,
      epicentre.x + Math.cos(angle) * len, epicentre.y + Math.sin(angle) * len, epicentre.z + 0.002
    );
  }
  const fracGeo = new THREE.BufferGeometry();
  fracGeo.setAttribute('position', new THREE.Float32BufferAttribute(fracturePoints, 3));
  const fracLines = new THREE.LineSegments(
    fracGeo,
    new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.9 })
  );
  windowGroup.add(fracLines);

  return windowGroup;
}

// ---------------------------------------------------------------------------
// 6. 3D FACETED GLASS DISPERSION CLUSTER
// ---------------------------------------------------------------------------
export function createGlassDispersionCluster(): THREE.Group {
  const glassGroup = new THREE.Group();
  glassGroup.name = 'ent-glass-field';

  // Generate 48 distinct 3D glass shard geometries with sharp facets
  const shardCount = 48;
  for (let i = 0; i < shardCount; i++) {
    const r = Math.pow(Math.random(), 0.6) * 1.1; // Radial density clustering
    const angle = 0.2 + Math.random() * Math.PI * 0.85; // 42° cone distribution
    const x = -0.4 + r * Math.cos(angle);
    const z = 1.3 + r * Math.sin(angle);
    const y = 0.008 + Math.random() * 0.03;

    // Small faceted prism shard
    const size = 0.03 + Math.random() * 0.05;
    const shardGeo = new THREE.ConeGeometry(size, size * 0.4, 3);
    const shard = new THREE.Mesh(shardGeo, MATERIALS.brokenGlassShards);
    shard.position.set(x, y, z);
    shard.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    shard.castShadow = true;
    glassGroup.add(shard);
  }

  // Micro-debris glints
  const pointGeo = new THREE.BufferGeometry();
  const pointPositions = new Float32Array(140 * 3);
  for (let i = 0; i < 140; i++) {
    const r = Math.random() * 1.3;
    const angle = 0.15 + Math.random() * Math.PI * 0.9;
    pointPositions[i * 3] = -0.4 + r * Math.cos(angle);
    pointPositions[i * 3 + 1] = 0.006 + Math.random() * 0.015;
    pointPositions[i * 3 + 2] = 1.3 + r * Math.sin(angle);
  }
  pointGeo.setAttribute('position', new THREE.BufferAttribute(pointPositions, 3));
  const pointsMat = new THREE.PointsMaterial({
    color: 0x38bdf8,
    size: 0.03,
    transparent: true,
    opacity: 0.85,
  });
  const glintPoints = new THREE.Points(pointGeo, pointsMat);
  glassGroup.add(glintPoints);

  return glassGroup;
}

// ---------------------------------------------------------------------------
// 7. SPENT 9x19mm BRASS CASING
// ---------------------------------------------------------------------------
export function createSpentCasing(): THREE.Group {
  const casingGroup = new THREE.Group();
  casingGroup.name = 'ent-obj-casing';

  // Brass Cylinder Body (length 19mm, diameter 9mm scaled up 2.5x for crisp visual recognition)
  const radius = 0.018;
  const length = 0.076;
  const bodyGeo = new THREE.CylinderGeometry(radius, radius, length, 16);
  bodyGeo.rotateZ(Math.PI / 2);
  const body = new THREE.Mesh(bodyGeo, MATERIALS.brassCasing);
  body.castShadow = true;
  casingGroup.add(body);

  // Extractor rim
  const rimGeo = new THREE.CylinderGeometry(radius * 1.12, radius * 1.12, 0.008, 16);
  rimGeo.rotateZ(Math.PI / 2);
  const rim = new THREE.Mesh(rimGeo, MATERIALS.brassCasing);
  rim.position.set(-length / 2, 0, 0);
  rim.castShadow = true;
  casingGroup.add(rim);

  // Primer cap indentation (rear face)
  const primerGeo = new THREE.CylinderGeometry(radius * 0.5, radius * 0.5, 0.002, 12);
  primerGeo.rotateZ(Math.PI / 2);
  const primer = new THREE.Mesh(
    primerGeo,
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.3 })
  );
  primer.position.set(-length / 2 - 0.001, 0, 0);
  casingGroup.add(primer);

  return casingGroup;
}

// ---------------------------------------------------------------------------
// 8. ARCHITECTURAL ROOM (FLOOR, WALLS, BASEBOARDS)
// ---------------------------------------------------------------------------
export function createRoomArchitecture(width = 6.4, depth = 6.0, height = 3.0): THREE.Group {
  const room = new THREE.Group();
  room.name = 'ent-env-room';

  // A. Dark Polished Architectural Floor with Grid Tile Joints
  const floorGeo = new THREE.PlaneGeometry(width, depth);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x071124,
    roughness: 0.35,
    metalness: 0.25,
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  floor.name = 'scene-floor';
  room.add(floor);

  // Fine Coordinate Overlay Grid
  const grid = new THREE.GridHelper(Math.max(width, depth), 16, 0x00f0ff, 0x172554);
  grid.position.y = 0.004;
  room.add(grid);

  // B. Perimeter Walls
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x081329,
    roughness: 0.7,
    metalness: 0.15,
    side: THREE.DoubleSide,
  });

  // North Wall (Back)
  const northWall = new THREE.Mesh(new THREE.PlaneGeometry(width, height), wallMat);
  northWall.position.set(0, height / 2, -depth / 2);
  northWall.receiveShadow = true;
  room.add(northWall);

  // West Wall (Left)
  const westWall = new THREE.Mesh(new THREE.PlaneGeometry(depth, height), wallMat);
  westWall.rotation.y = Math.PI / 2;
  westWall.position.set(-width / 2, height / 2, 0);
  westWall.receiveShadow = true;
  room.add(westWall);

  // East Wall Perimeter Frame
  const eastWall = new THREE.Mesh(new THREE.PlaneGeometry(depth, height), wallMat);
  eastWall.rotation.y = -Math.PI / 2;
  eastWall.position.set(width / 2, height / 2, 0);
  eastWall.receiveShadow = true;
  room.add(eastWall);

  // C. Baseboards / Skirting Boards along Wall Perimeters
  const baseboardMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.4,
    metalness: 0.4,
  });

  // Back baseboard
  const backBase = new THREE.Mesh(new THREE.BoxGeometry(width, 0.12, 0.04), baseboardMat);
  backBase.position.set(0, 0.06, -depth / 2 + 0.02);
  room.add(backBase);

  // West baseboard
  const westBase = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.12, depth), baseboardMat);
  westBase.position.set(-width / 2 + 0.02, 0.06, 0);
  room.add(westBase);

  // East baseboard
  const eastBase = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.12, depth), baseboardMat);
  eastBase.position.set(width / 2 - 0.02, 0.06, 0);
  room.add(eastBase);

  return room;
}
