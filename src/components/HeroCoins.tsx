import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import Matter from 'matter-js';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

interface Hop {
  x: number;
  y: number;
  apexY: number;
  target: number; // Solid body id, or -1 for floor
}

interface CoinItem {
  id: number;
  body: Matter.Body;
  radius: number;
  colorHex: string;
  group: THREE.Group;
  blobMesh: THREE.Mesh;
  opacity: number;
  isDying: boolean;
  dieStartTime?: number;
  bornTime: number;
  homeDeadline?: number;
  homeDir?: number;
  fadeMats: THREE.MeshPhysicalMaterial[];
  blobMat: THREE.MeshBasicMaterial;
  route?: {
    hops: Hop[];
    i: number;
    deadline: number;
    bounce: boolean;
    abort: boolean;
  };
  isRollingWord?: boolean;
}

// Authentic Awake Color Palette
const COIN_PALETTES = [
  '#ffffff', // Crisp white (engraved in soft slate grey)
  '#ffd9e2', // Baby pastel pink (engraved in dusty rose)
  '#8b9298', // Slate grey
  '#ff6f95', // Rose coral (engraved in rich crimson)
  '#161d25', // Obsidian dark (engraved in graphite)
  '#e3e5e7', // Silver white
  '#ffb0c5', // Soft pink
  '#c3c8cc', // Light heather grey
  '#5d646b', // Charcoal grey
  '#ff2d5e', // Strawberry red
];

// Authentic Awake SVG path for signature debossed 'a.'
const SVG_A_PATH =
  'M21.8196 29.2139C20.7519 29.2139 20.2876 28.8867 20.2876 27.6246V17.2011C20.2876 11.6388 16.8058 8.60057 10.7705 8.60057C5.0603 8.60057 1.29989 11.3584 0.742796 16.0326H4.54962C5.01387 13.602 7.24226 12.0127 10.5848 12.0127C14.2988 12.0127 16.4808 13.8824 16.4808 16.9674V18.6034H9.51707C3.29616 18.6034 0 21.2677 0 26.0354C0 30.3824 3.52828 33 8.72785 33C12.8132 33 15.1809 31.1771 16.6665 29.0269C16.7129 31.364 17.7807 32.7195 20.9376 32.7195H23.0267V29.2139H21.8196ZM16.4808 22.9972C16.4808 26.9703 13.7417 29.728 9.0064 29.728C5.84952 29.728 3.85325 28.1388 3.85325 25.8017C3.85325 23.0907 5.75667 21.8286 9.14567 21.8286H16.4808V22.9972Z';

function getDebossedColor(hexColor: string): THREE.Color {
  const c = new THREE.Color(hexColor);
  const hsl = { h: 0, s: 0, l: 0 };
  c.getHSL(hsl, THREE.SRGBColorSpace);
  if (hsl.l > 0.45) {
    return c.clone().multiplyScalar(0.72 - (hsl.l - 0.45) * 0.4);
  } else {
    return c.clone().lerp(new THREE.Color(0xffffff), 0.14);
  }
}

function vArc(cx: number, cy: number, r: number, startA: number, endA: number, steps: number): [number, number][] {
  const pts: [number, number][] = [];
  for (let s = 0; s <= steps; s++) {
    const a = startA + ((endA - startA) * s) / steps;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return pts;
}

function revolveProfile(pts: [number, number][], segs: number): THREE.BufferGeometry {
  const geom = new THREE.LatheGeometry(
    pts.map(([x, y]) => new THREE.Vector2(x, y)),
    segs
  );
  geom.rotateX(Math.PI / 2);
  return geom;
}

function circlePoints(cx: number, cy: number, r: number, steps: number, cw = true): THREE.Vector2[] {
  const pts: THREE.Vector2[] = [];
  for (let s = 0; s < steps; s++) {
    const a = ((s / steps) * Math.PI * 2) * (cw ? 1 : -1);
    pts.push(new THREE.Vector2(cx + Math.cos(a) * r, cy + Math.sin(a) * r));
  }
  return pts;
}

function transformSvgPoint(p: { x: number; y: number }): THREE.Vector2 {
  return new THREE.Vector2((p.x - 11.51335) * 9.4 - 45, -(9.4 * (p.y - 20.800285)) - 15);
}

function buildCoinGeometries(svgPath: string) {
  const latheSegs = 64;
  const curveSegs = 10;

  const outerProfile: [number, number][] = [
    [0, -48],
    [260, -48],
    ...vArc(260, -28, 20, -Math.PI / 2, 0, 8).slice(1),
    [280, 28],
    ...vArc(260, 28, 20, 0, Math.PI / 2, 8).slice(1),
    [248, 48],
  ];

  const grooveStepDown = revolveProfile([[248, 48], [248, 40]], latheSegs);
  const grooveFloor = revolveProfile([[248, 40], [236, 40]], latheSegs);
  const grooveStepUp = revolveProfile([[236, 40], [236, 48]], latheSegs);
  const outerRim = revolveProfile(outerProfile, latheSegs);

  const parsed = new SVGLoader().parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${svgPath}"/></svg>`);
  const letterShapes = parsed.paths.flatMap((p) => p.toShapes());

  const letterData: { outer: THREE.Vector2[]; holes: THREE.Vector2[][] }[] = [];
  for (const shp of letterShapes) {
    const { shape, holes } = shp.extractPoints(curveSegs);
    letterData.push({
      outer: shape.map(transformSvgPoint),
      holes: holes.map((h) => h.map(transformSvgPoint)),
    });
  }

  const faceShape = new THREE.Shape(circlePoints(0, 0, 236, latheSegs));
  const innerIslands: THREE.Shape[] = [];

  for (const item of letterData) {
    faceShape.holes.push(new THREE.Path(item.outer));
    for (const h of item.holes) {
      innerIslands.push(new THREE.Shape(h));
    }
  }

  faceShape.holes.push(new THREE.Path(circlePoints(124, -82, 30, 32)));

  const faceGeom = new THREE.ShapeGeometry([faceShape, ...innerIslands], curveSegs);
  faceGeom.translate(0, 0, 48);

  const parts = [outerRim, grooveStepDown, grooveFloor, grooveStepUp, faceGeom].map((g) => {
    const nonIndexed = g.index ? g.toNonIndexed() : g;
    nonIndexed.deleteAttribute('uv');
    return nonIndexed;
  });

  const mergedBody = mergeGeometries(parts, false);
  parts.forEach((p) => p.dispose());

  const extrudeShapes = letterData.map((item) => {
    const s = new THREE.Shape(item.outer);
    s.holes = item.holes.map((h) => new THREE.Path(h));
    return s;
  });
  extrudeShapes.push(new THREE.Shape(circlePoints(124, -82, 30, 32)));

  const extrudeGeom = new THREE.ExtrudeGeometry(extrudeShapes, {
    depth: 20,
    bevelEnabled: false,
    curveSegments: curveSegs,
  });
  extrudeGeom.translate(0, 0, 28);

  const posAttr = extrudeGeom.getAttribute('position');
  const floorIndices: number[] = [];
  const wallIndices: number[] = [];
  const P_THRESHOLD = 47.99;

  for (const grp of extrudeGeom.groups) {
    for (let t = grp.start; t < grp.start + grp.count; t += 3) {
      if (grp.materialIndex === 0) {
        const avgZ = (posAttr.getZ(t) + posAttr.getZ(t + 1) + posAttr.getZ(t + 2)) / 3;
        if (avgZ < P_THRESHOLD) {
          floorIndices.push(t, t + 1, t + 2);
        }
      } else {
        wallIndices.push(t, t + 1, t + 2);
      }
    }
  }

  const buildSub = (indices: number[]) => {
    const g = new THREE.BufferGeometry();
    const arr = new Float32Array(3 * indices.length);
    indices.forEach((idx, i) => {
      arr[3 * i] = posAttr.getX(idx);
      arr[3 * i + 1] = posAttr.getY(idx);
      arr[3 * i + 2] = posAttr.getZ(idx);
    });
    g.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    g.computeVertexNormals();
    return g;
  };

  const floorGeom = buildSub(floorIndices);
  const wallGeom = buildSub(wallIndices);

  extrudeGeom.dispose();

  return {
    body: mergedBody,
    floor: floorGeom,
    walls: wallGeom,
  };
}

export const HeroCoins: React.FC<{ onCoinClick?: () => void }> = ({ onCoinClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || 1200;
    let height = container.clientHeight || 750;

    // 1. Three.js WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.toneMappingExposure = 0.78;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    const dom = renderer.domElement;
    dom.style.position = 'absolute';
    dom.style.inset = '0';
    dom.style.width = '100%';
    dom.style.height = '100%';
    dom.style.pointerEvents = 'auto';
    container.appendChild(dom);

    // 2. Scene & Environment
    const scene = new THREE.Scene();
    const pmremGen = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGen.fromScene(new RoomEnvironment(), 0.04).texture;

    // 3. Perspective Camera (1 unit = 1 pixel at Z = 0)
    const camera = new THREE.PerspectiveCamera(28, width / height, 10, 20000);
    const updateCameraDistance = () => {
      camera.aspect = width / height;
      camera.position.set(0, 0, height / 2 / Math.tan(THREE.MathUtils.degToRad(14)));
      camera.updateProjectionMatrix();
    };
    updateCameraDistance();

    // 4. Directional & Hemisphere Lighting
    const dirLight = new THREE.DirectionalLight(0xffffff, 2.4);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(1024, 1024);
    dirLight.shadow.bias = -0.0012;
    dirLight.shadow.normalBias = 1.2;
    dirLight.shadow.radius = 2;
    dirLight.position.set(0.93 * width, 0.18 * height, 0.32 * width);
    dirLight.target.position.set(0.55 * width, -0.45 * height, 0);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x3a0010, 0.55);
    scene.add(dirLight, dirLight.target, hemiLight);

    // 5. Contact Shadow Material
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d');
    if (sCtx) {
      const grad = sCtx.createRadialGradient(64, 64, 16, 64, 64, 64);
      grad.addColorStop(0, 'rgba(40, 0, 8, 0.52)');
      grad.addColorStop(0.55, 'rgba(40, 0, 8, 0.24)');
      grad.addColorStop(1, 'rgba(40, 0, 8, 0)');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 128, 128);
    }
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    shadowTex.colorSpace = THREE.SRGBColorSpace;
    const shadowPlaneGeom = new THREE.PlaneGeometry(1, 1);
    const shadowBaseMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
    });

    // 6. Coin Geometries & Materials
    const geomA = buildCoinGeometries(SVG_A_PATH);
    const materialCache = new Map<
      string,
      { body: THREE.MeshPhysicalMaterial; floor: THREE.MeshPhysicalMaterial; walls: THREE.MeshPhysicalMaterial }
    >();

    const getMaterials = (hex: string) => {
      let mats = materialCache.get(hex);
      if (!mats) {
        const bodyCol = new THREE.Color(hex);
        const debossedCol = getDebossedColor(hex);
        const shared = {
          roughness: 0.42,
          metalness: 0,
          clearcoat: 0.35,
          clearcoatRoughness: 0.25,
          envMapIntensity: 0.45,
        };
        mats = {
          body: new THREE.MeshPhysicalMaterial({ color: bodyCol, side: THREE.DoubleSide, ...shared }),
          floor: new THREE.MeshPhysicalMaterial({ color: debossedCol, side: THREE.BackSide, ...shared }),
          walls: new THREE.MeshPhysicalMaterial({ color: bodyCol, side: THREE.BackSide, ...shared }),
        };
        materialCache.set(hex, mats);
      }
      return mats;
    };

    // 7. Matter.js Physics Engine Setup (matching Awake parameters)
    const engine = Matter.Engine.create({
      enableSleeping: false,
      positionIterations: 14,
      velocityIterations: 10,
    });
    const world = engine.world;
    engine.gravity.y = 2.4;
    engine.gravity.scale = 0.001;

    const S = 1000 / 60; // 16.6667ms
    const zGravity = () => engine.gravity.y * engine.gravity.scale; // 0.0024 px/ms^2

    const coinRadius = 34;
    // Exactly as seen in official Awake site: keep only 4-5 total coins on screen!
    const maxCoins = 5;
    let coins: CoinItem[] = [];
    const coinMap = new Map<number, CoinItem>();
    let nextCoinId = 1;
    let paletteIndex = 0;

    // Measurement of DOM steps and pile bounds
    const getLayoutBounds = () => {
      const parent = container.parentElement;
      const pRect = parent ? parent.getBoundingClientRect() : container.getBoundingClientRect();

      const getRelRect = (sel: string) => {
        const el = parent?.querySelector(sel);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return {
          left: r.left - pRect.left,
          right: r.right - pRect.left,
          top: r.top - pRect.top,
          bottom: r.bottom - pRect.top,
          width: r.width,
          height: r.height,
        };
      };

      const step1 = getRelRect('[data-coin-step="1"]') || {
        left: width * 0.04,
        right: width * 0.18,
        top: height * 0.25,
        bottom: height * 0.35,
        width: width * 0.14,
        height: height * 0.1,
      };

      const step2 = getRelRect('[data-coin-step="2"]') || {
        left: width * 0.04,
        right: width * 0.32,
        top: height * 0.44,
        bottom: height * 0.54,
        width: width * 0.28,
        height: height * 0.1,
      };

      const step3 = getRelRect('[data-coin-step="3"]') || {
        left: width * 0.04,
        right: width * 0.44,
        top: height * 0.62,
        bottom: height * 0.72,
        width: width * 0.40,
        height: height * 0.1,
      };

      const floorEl = getRelRect('[data-coins-floor]');
      const floor = floorEl ? floorEl.top - 6 : height * 0.82;

      // Horizontal floor range starting right after REMEMBER.
      const floorStart = Math.max(step3.right + 20, width * 0.46);
      const floorEnd = Math.min(width * 0.86, floorStart + 420);

      return {
        step1,
        step2,
        step3,
        floor,
        floorStart,
        floorEnd,
      };
    };

    let layout = getLayoutBounds();

    // Create Static Solids for WE, BOOKS, REMEMBER, and Floor
    let staticSolids: Matter.Body[] = [];
    let step1SolidId = -1;
    let step2SolidId = -1;
    let step3SolidId = -1;

    const rebuildSolids = () => {
      if (staticSolids.length) {
        Matter.Composite.remove(world, staticSolids);
        staticSolids = [];
      }

      layout = getLayoutBounds();

      // Static floor
      const floorBody = Matter.Bodies.rectangle(width / 2, layout.floor + 200, width + 1000, 400, {
        isStatic: true,
        friction: 0.35,
        frictionStatic: 0.5,
        restitution: 0.18,
      });

      // Outer walls
      const leftWall = Matter.Bodies.rectangle(-200, height / 2, 400, height + 800, { isStatic: true });
      const rightWall = Matter.Bodies.rectangle(width + 200, height / 2, 400, height + 800, { isStatic: true });

      // Step 1: WE (tilted slightly downhill to the right with low friction so coins roll off cleanly)
      const s1w = Math.max(30, layout.step1.width);
      const s1h = 16;
      const step1Body = Matter.Bodies.rectangle(
        layout.step1.left + s1w / 2,
        layout.step1.top + 8 + s1h / 2,
        s1w + 8,
        s1h,
        {
          isStatic: true,
          angle: 0.024, // downhill tilt to the right so it naturally rolls off WE
          friction: 0.002,
          restitution: 0.12,
          chamfer: { radius: 6 },
        }
      );
      step1SolidId = step1Body.id;

      // Step 2: BOOKS (tilted slightly downhill to the right with low friction so coins roll off cleanly)
      const s2w = Math.max(50, layout.step2.width);
      const s2h = 16;
      const step2Body = Matter.Bodies.rectangle(
        layout.step2.left + s2w / 2,
        layout.step2.top + 8 + s2h / 2,
        s2w + 8,
        s2h,
        {
          isStatic: true,
          angle: 0.024, // downhill tilt to the right for natural rollover
          friction: 0.002,
          restitution: 0.12,
          chamfer: { radius: 6 },
        }
      );
      step2SolidId = step2Body.id;

      // Step 3: REMEMBER. (flat solid platform covering all letters from R to .)
      const s3w = Math.max(60, layout.step3.width);
      const s3h = 16;
      const step3Body = Matter.Bodies.rectangle(
        layout.step3.left + s3w / 2,
        layout.step3.top + 8 + s3h / 2,
        s3w + 14,
        s3h,
        {
          isStatic: true,
          angle: 0.016, // subtle downhill tilt to the right for natural rollover
          friction: 0.002,
          restitution: 0.12,
          chamfer: { radius: 6 },
        }
      );
      step3SolidId = step3Body.id;

      staticSolids = [
        floorBody,
        leftWall,
        rightWall,
        step1Body,
        step2Body,
        step3Body,
      ];
      Matter.Composite.add(world, staticSolids);
    };

    rebuildSolids();

    // Helper: Instantiate 3D coin Mesh & Matter Body
    const createCoin = (x: number, y: number, colorHex: string, r = coinRadius) => {
      const mats = getMaterials(colorHex);

      const group = new THREE.Group();
      const bodyMesh = new THREE.Mesh(geomA.body, mats.body);
      bodyMesh.castShadow = true;
      bodyMesh.receiveShadow = true;

      const floorMesh = new THREE.Mesh(geomA.floor, mats.floor);
      floorMesh.castShadow = true;
      floorMesh.receiveShadow = true;

      const wallMesh = new THREE.Mesh(geomA.walls, mats.walls);
      wallMesh.castShadow = true;
      wallMesh.receiveShadow = true;

      group.add(bodyMesh, floorMesh, wallMesh);
      group.scale.setScalar(r / 280);
      scene.add(group);

      const blobMesh = new THREE.Mesh(shadowPlaneGeom, shadowBaseMat.clone());
      blobMesh.renderOrder = -1;
      scene.add(blobMesh);

      const body = Matter.Bodies.circle(x, y, r, {
        restitution: 0.22,
        friction: 0.04,
        frictionStatic: 0.08,
        frictionAir: 0.014,
        density: 0.0016,
        slop: 0.015,
        angle: Math.random() * Math.PI * 2,
      });

      const item: CoinItem = {
        id: nextCoinId++,
        body,
        radius: r,
        colorHex,
        group,
        blobMesh,
        opacity: 1,
        isDying: false,
        fadeMats: [],
        blobMat: blobMesh.material as THREE.MeshBasicMaterial,
        bornTime: performance.now(),
      };

      coins.push(item);
      coinMap.set(body.id, item);
      return item;
    };

    // Projectile Velocity Solver (Awake's exact Y function)
    const calcHopVelocity = (
      start: { x: number; y: number },
      target: { x: number; y: number },
      apexY: number
    ) => {
      const g = zGravity();
      const peakY = Math.min(apexY, start.y, target.y);
      const tUp = Math.sqrt(Math.max(0, (2 * (start.y - peakY)) / g));
      const tDown = Math.sqrt(Math.max(0, (2 * (target.y - peakY)) / g));
      const T = Math.max(tUp + tDown, 1);
      return {
        vx: (target.x - start.x) / T,
        vy: -g * tUp,
        T,
      };
    };

    // Launch a hop along a coin's route
    const launchHop = (coin: CoinItem) => {
      if (!coin.route) return;
      const hop = coin.route.hops[coin.route.i];
      const pos = coin.body.position;
      const { vx, vy, T } = calcHopVelocity(pos, hop, Math.min(hop.apexY, pos.y - 2));

      Matter.Body.setVelocity(coin.body, { x: vx * S, y: vy * S });
      const spin = Math.max(-0.02, Math.min(0.02, (vx / coin.radius) * 0.55));
      Matter.Body.setAngularVelocity(coin.body, spin * S);
      coin.route.deadline = performance.now() + 1.3 * T + 200;
    };

    // Exit route and enter free floor physics
    const exitRoute = (coin: CoinItem) => {
      if (coin.route) {
        coin.route = undefined;
        coin.body.frictionAir = 0.014;
        coin.body.collisionFilter.mask = 0xffffffff;
        coin.homeDeadline = performance.now() + 5000;
      }
    };

    // Gentle deceleration when settling horizontally on the floor
    const applyHomeCentering = (coin: CoinItem) => {
      if (!coin.homeDeadline) return;
      const now = performance.now();
      const nearFloor = coin.body.position.y > layout.floor - 3 * coin.radius;

      if (now > coin.homeDeadline || nearFloor) {
        coin.homeDeadline = undefined;
        coin.homeDir = undefined;
      }
    };

    // Trigger smooth fade-out (Awake 520ms dying mechanism)
    const startDissolving = (coin: CoinItem) => {
      if (coin.isDying) return;
      coin.isDying = true;
      coin.dieStartTime = performance.now();
      coin.fadeMats = [];

      for (const child of coin.group.children) {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          const cloned = (mesh.material as THREE.MeshPhysicalMaterial).clone();
          cloned.transparent = true;
          mesh.material = cloned;
          coin.fadeMats.push(cloned);
        }
      }
      coin.blobMat = (coin.blobMesh.material as THREE.MeshBasicMaterial).clone();
      coin.blobMesh.material = coin.blobMat;
    };

    // Collision Start Listener for hop route progression
    const handleCollisionStart = (event: Matter.IEventCollision<Matter.Engine>) => {
      for (const pair of event.pairs) {
        for (const [bodyA, bodyB] of [
          [pair.bodyA, pair.bodyB],
          [pair.bodyB, pair.bodyA],
        ]) {
          const coin = coinMap.get(bodyA.id);
          if (!coin?.route) continue;
          const currentHop = coin.route.hops[coin.route.i];
          if (currentHop) {
            if (bodyB.id === currentHop.target || currentHop.target === -1) {
              coin.route.bounce = true;
            } else if (bodyB.id !== currentHop.target && currentHop.target !== -1) {
              coin.route.abort = true;
            }
          }
        }
      }
    };

    Matter.Events.on(engine, 'collisionStart', handleCollisionStart);

    // Initial state: Exactly matches official Awake site (media_1792362847516_fdb7f580.png)!
    // 3 coins resting horizontally side-by-side along the floor rule line after REMEMBER., plus 1 coin near kicker
    const initHorizontalFloorCoins = () => {
      for (const c of coins) {
        Matter.Composite.remove(world, c.body);
        scene.remove(c.group);
        scene.remove(c.blobMesh);
      }
      coins = [];
      coinMap.clear();

      const r = coinRadius;
      const bY = layout.floor - r - 2;
      const startX = layout.floorStart;

      // 4 coins resting in a clean horizontal arrangement along the floor
      const initialPositions = [
        { x: startX + r * 0.9, color: '#8b9298' }, // Slate grey
        { x: startX + r * 2.8, color: '#161d25' }, // Obsidian dark
        { x: startX + r * 4.7, color: '#ffffff' }, // Crisp white
        { x: startX + r * 8.5, color: '#71717a' }, // Grey near kicker
      ];

      initialPositions.forEach((pos) => {
        const coin = createCoin(pos.x, bY, pos.color, r);
        Matter.Composite.add(world, coin.body);
      });

      // Warm up physics so they sit cleanly on the floor line
      for (let step = 0; step < 60; step++) {
        Matter.Engine.update(engine, S);
      }
    };

    initHorizontalFloorCoins();

    // Spawner: Direct drop onto WE -> roll across WE -> cascade onto BOOKS -> roll across BOOKS -> cascade onto REMEMBER. -> roll across REMEMBER. -> touch ground & join floor row
    const spawnFallingCoin = () => {
      const palette = COIN_PALETTES[paletteIndex % COIN_PALETTES.length];
      paletteIndex++;

      // Direct drop from top: spawn directly over the start of 'WE'
      const startX = layout.step1.left + coinRadius * 0.85;
      const startY = Math.max(10, layout.step1.top - 160);

      const coin = createCoin(startX, startY, palette);
      coin.isRollingWord = true;

      // Initial direct fall with downward gravity and forward roll momentum
      Matter.Body.setVelocity(coin.body, { x: 4.2, y: 4.8 });
      Matter.Body.setAngularVelocity(coin.body, 0.09);

      Matter.Composite.add(world, coin.body);

      // Keep limited coins: when total resting coins >= 4, dissolve oldest resting coin smoothly
      const resting = coins.filter((c) => !c.isDying && !c.isRollingWord && !c.route);
      if (resting.length >= 4) {
        const oldest = resting[0];
        if (oldest) {
          startDissolving(oldest);
        }
      }
    };

    let spawnTimerId: number;
    const scheduleNextSpawn = () => {
      spawnTimerId = window.setTimeout(() => {
        spawnFallingCoin();
        scheduleNextSpawn();
      }, 3800); // Calm, elegant 3.8s intervals
    };

    setTimeout(spawnFallingCoin, 1400);
    scheduleNextSpawn();

    // Mouse & Touch Dragging via Matter.Constraint
    let draggedCoin: CoinItem | null = null;
    let dragConstraint: Matter.Constraint | null = null;
    const mousePos = { x: 0, y: 0, prevX: 0, prevY: 0, isDown: false };

    const handlePointerDown = (e: PointerEvent) => {
      const rect = dom.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;

      mousePos.isDown = true;
      mousePos.x = px;
      mousePos.y = py;
      mousePos.prevX = px;
      mousePos.prevY = py;

      for (let i = coins.length - 1; i >= 0; i--) {
        const c = coins[i];
        if (Math.hypot(c.body.position.x - px, c.body.position.y - py) <= c.radius * 1.1) {
          draggedCoin = c;
          c.isRollingWord = false;
          exitRoute(c);

          dragConstraint = Matter.Constraint.create({
            pointA: { x: px, y: py },
            bodyB: c.body,
            pointB: { x: px - c.body.position.x, y: py - c.body.position.y },
            stiffness: 0.25,
            damping: 0.12,
            length: 0,
          });
          Matter.Composite.add(world, dragConstraint);
          c.body.frictionAir = 0.05;
          dom.style.cursor = 'grabbing';
          if (onCoinClick) onCoinClick();
          break;
        }
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      const rect = dom.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;

      mousePos.prevX = mousePos.x;
      mousePos.prevY = mousePos.y;
      mousePos.x = px;
      mousePos.y = py;

      if (dragConstraint) {
        dragConstraint.pointA = { x: px, y: py };
      } else {
        const hovered = coins.some((c) => Math.hypot(c.body.position.x - px, c.body.position.y - py) <= c.radius * 1.1);
        dom.style.cursor = hovered ? 'grab' : 'default';
      }
    };

    const handlePointerUp = () => {
      if (dragConstraint) {
        Matter.Composite.remove(world, dragConstraint);
        dragConstraint = null;
      }
      if (draggedCoin) {
        draggedCoin.body.frictionAir = 0.014;
        const flingVx = (mousePos.x - mousePos.prevX) * 0.45;
        const flingVy = (mousePos.y - mousePos.prevY) * 0.45;
        Matter.Body.setVelocity(draggedCoin.body, { x: flingVx, y: flingVy });
        draggedCoin.homeDeadline = performance.now() + 6000;
        draggedCoin = null;
      }
      dom.style.cursor = 'default';
      mousePos.isDown = false;
    };

    dom.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || 1200;
      height = container.clientHeight || 750;
      renderer.setSize(width, height);
      updateCameraDistance();
      dirLight.position.set(0.93 * width, 0.18 * height, 0.32 * width);
      dirLight.target.position.set(0.55 * width, -0.45 * height, 0);
      rebuildSolids();
    };

    window.addEventListener('resize', handleResize);

    // Main Simulation Loop
    let animId: number;

    const tick = () => {
      animId = requestAnimationFrame(tick);
      const now = performance.now();

      // Update active coins: rollover WE -> drop to BOOKS -> drop to REMEMBER. -> touch ground
      for (const coin of coins) {
        if (coin.isRollingWord && coin !== draggedCoin) {
          const pos = coin.body.position;

          // Phase 1: At WE altitude
          if (pos.y < layout.step2.top - coin.radius - 10) {
            if (pos.x < layout.step1.right + 6) {
              // Coin is on top of WE: keep it rolling briskly, never stall or pile up!
              if (pos.y >= layout.step1.top - coin.radius - 12) {
                Matter.Body.setVelocity(coin.body, {
                  x: Math.max(coin.body.velocity.x, 4.5),
                  y: Math.min(Math.max(coin.body.velocity.y, 0), 1.0),
                });
                Matter.Body.setAngularVelocity(coin.body, coin.body.velocity.x / coin.radius);
              }
            } else {
              // Coin rolls past the right edge of WE -> waterfalls down onto BOOKS!
              if (coin.body.velocity.x < 3.8) {
                Matter.Body.setVelocity(coin.body, {
                  x: 4.2,
                  y: Math.max(coin.body.velocity.y, 2.0),
                });
              }
            }
          }
          // Phase 2: At BOOKS altitude
          else if (pos.y < layout.step3.top - coin.radius - 10) {
            if (pos.x < layout.step2.right + 6) {
              // Coin is on top of BOOKS: keep it rolling briskly, never stall or pile up!
              if (pos.y >= layout.step2.top - coin.radius - 12) {
                Matter.Body.setVelocity(coin.body, {
                  x: Math.max(coin.body.velocity.x, 4.5),
                  y: Math.min(Math.max(coin.body.velocity.y, 0), 1.0),
                });
                Matter.Body.setAngularVelocity(coin.body, coin.body.velocity.x / coin.radius);
              }
            } else {
              // Coin rolls past the right edge of BOOKS -> waterfalls down onto REMEMBER.!
              if (coin.body.velocity.x < 3.8) {
                Matter.Body.setVelocity(coin.body, {
                  x: 4.2,
                  y: Math.max(coin.body.velocity.y, 2.0),
                });
              }
            }
          }
          // Phase 3: At REMEMBER. altitude
          else if (pos.y < layout.floor - coin.radius - 10) {
            if (pos.x < layout.step3.right + 8) {
              // Coin lands on REMEMBER.: keep rolling briskly across the letters to the end
              if (pos.y >= layout.step3.top - coin.radius - 12) {
                Matter.Body.setVelocity(coin.body, {
                  x: Math.max(coin.body.velocity.x, 4.4),
                  y: Math.min(Math.max(coin.body.velocity.y, 0), 1.0),
                });
                Matter.Body.setAngularVelocity(coin.body, coin.body.velocity.x / coin.radius);
              }
            } else {
              // Coin waterfalls off the period '.' of REMEMBER. down toward ground!
              if (coin.body.velocity.x < 3.6) {
                Matter.Body.setVelocity(coin.body, {
                  x: 3.8,
                  y: Math.max(coin.body.velocity.y, 2.0),
                });
              }
            }
          }
          // Phase 4: Coin has reached and touched the ground (floor)
          else {
            coin.isRollingWord = false;
            coin.homeDeadline = performance.now() + 4500;
            // Ground friction so it rolls into horizontal row and settles
            coin.body.frictionAir = 0.018;
            coin.body.friction = 0.28;

            // Ensure horizontal row limitation: dissolve oldest resting coin if > 4
            const resting = coins.filter((c) => !c.isDying && !c.isRollingWord && c !== coin);
            if (resting.length >= 4) {
              const oldest = resting[0];
              if (oldest) {
                startDissolving(oldest);
              }
            }
          }
        }

        if (coin.route) {
          if (coin.route.abort || now > coin.route.deadline) {
            exitRoute(coin);
          } else if (coin.route.bounce) {
            coin.route.bounce = false;
            coin.route.i++;
            if (coin.route.i >= coin.route.hops.length) {
              exitRoute(coin);
            } else {
              launchHop(coin);
            }
          }
        }

        if (!coin.route && !coin.isRollingWord && coin !== draggedCoin) {
          applyHomeCentering(coin);
        }
      }

      // Step physics
      Matter.Engine.update(engine, S);

      // Smooth cubic easeInOut fade out for dying coins (Awake 520ms formula)
      for (let i = coins.length - 1; i >= 0; i--) {
        const c = coins[i];
        if (c.isDying && c.dieStartTime) {
          const progress = Math.min(1, (now - c.dieStartTime) / 520);
          if (progress >= 1) {
            c.fadeMats.forEach((m) => m.dispose());
            c.blobMat.dispose();
            Matter.Composite.remove(world, c.body);
            scene.remove(c.group);
            scene.remove(c.blobMesh);
            coinMap.delete(c.body.id);
            coins.splice(i, 1);
            continue;
          }

          const alpha = 1 - progress * progress * (3 - 2 * progress);
          c.opacity = alpha;
          for (const mat of c.fadeMats) {
            mat.opacity = alpha;
          }
          if (c.blobMat) {
            c.blobMat.opacity = alpha;
          }
        }
      }

      // Sync 3D Meshes with Matter.js Bodies
      const scaleBase = 1 / 280;
      for (let i = 0; i < coins.length; i++) {
        const c = coins[i];
        const px = c.body.position.x;
        const py = c.body.position.y;
        const angle = c.body.angle;

        const screen3DX = px - width / 2;
        const screen3DY = height / 2 - py;

        c.group.position.set(screen3DX, screen3DY, 0);
        c.group.rotation.z = -angle;

        if (!c.isDying) {
          c.group.scale.setScalar(c.radius * scaleBase);
          c.blobMesh.position.set(screen3DX - 0.16 * c.radius, screen3DY - 0.12 * c.radius, -50);
          c.blobMesh.scale.setScalar(2.5 * c.radius);
        }
      }

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(spawnTimerId);
      Matter.Events.off(engine, 'collisionStart', handleCollisionStart);
      dom.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      Matter.Engine.clear(engine);
      if (container.contains(dom)) {
        container.removeChild(dom);
      }
    };
  }, [onCoinClick]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full overflow-hidden pointer-events-auto"
      style={{ zIndex: 5 }}
      aria-hidden="true"
    />
  );
};
