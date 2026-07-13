import React, { useState, useRef, useEffect } from "react";
import { 
  Play, 
  Pause, 
  Download, 
  Cpu, 
  Layers, 
  Settings, 
  Tv, 
  Video, 
  RotateCw, 
  RefreshCw, 
  Sliders, 
  Check, 
  Loader2, 
  Sparkles,
  Camera,
  Film,
  DownloadCloud
} from "lucide-react";

interface ThreeDVideoStudioProps {
  prompt: string;
  modelType: "spaceship" | "car" | "ring" | "planet" | "crystal" | "dna";
  title: string;
}

// Point3D type
interface Point3D {
  x: number;
  y: number;
  z: number;
}

// Face type index definitions
interface Face {
  indices: number[];
  color: string;
}

export default function ThreeDVideoStudio({ prompt, modelType: initialModelType, title }: ThreeDVideoStudioProps) {
  const [viewMode, setViewMode] = useState<"interactive" | "rendering" | "playing">("interactive");
  
  // Custom interactive model selection
  const [selectedModelType, setSelectedModelType] = useState<"spaceship" | "car" | "ring" | "planet" | "crystal" | "dna">(initialModelType);

  // Sync selected model type if prop updates (e.g. after stream JSON parsing completes)
  useEffect(() => {
    setSelectedModelType(initialModelType);
  }, [initialModelType]);
  
  // Render configuration state
  const [presetPath, setPresetPath] = useState<"orbit" | "zoom" | "helix">("orbit");
  const [resolution, setResolution] = useState<"720p" | "1080p">("1080p");
  const [duration, setDuration] = useState<number>(5); // seconds
  const [visualFX, setVisualFX] = useState<"none" | "hologram" | "cyber">("none");
  const [fps, setFps] = useState<number>(30);
  
  // New Sedence 2.0 specific features
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16" | "1:1">("16:9");
  const [motionStrength, setMotionStrength] = useState<number>(5);
  const [styleAesthetic, setStyleAesthetic] = useState<"cinematic" | "cyberpunk" | "hyperreal" | "anime" | "claymation">("cinematic");
  const [promptExpanded, setPromptExpanded] = useState<boolean>(true);
  const [seed, setSeed] = useState<number>(() => Math.floor(Math.random() * 899999 + 100000));
  
  // Interactive navigation
  const [pitch, setPitch] = useState<number>(0.3); // rotation x
  const [yaw, setYaw] = useState<number>(0.8);   // rotation y
  const [zoom, setZoom] = useState<number>(1.0);
  
  // Rendering progress
  const [renderProgress, setRenderProgress] = useState<number>(0);
  const [renderStatus, setRenderStatus] = useState<string>("Skanerlanmoqda...");
  
  // Recorded video blob URL
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playTime, setPlayTime] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isDragging = useRef<boolean>(false);
  const dragStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const renderAnimFrameRef = useRef<number | null>(null);

  // 1. GENERATE 3D GEOMETRY PROCEDURALLY
  const getGeometry = (): { vertices: Point3D[]; faces: Face[] } => {
    let vertices: Point3D[] = [];
    let faces: Face[] = [];

    switch (selectedModelType) {
      case "crystal": {
        // Octahedron/Gemstone shape
        vertices = [
          { x: 0, y: -1.2, z: 0 }, // Top apex 0
          // Middle ring 5 vertices
          { x: 0.8, y: -0.2, z: 0 },
          { x: 0.25, y: -0.2, z: 0.76 },
          { x: -0.65, y: -0.2, z: 0.47 },
          { x: -0.65, y: -0.2, z: -0.47 },
          { x: 0.25, y: -0.2, z: -0.76 },
          // Lower ring 5 vertices
          { x: 0.65, y: 0.3, z: 0.47 },
          { x: -0.25, y: 0.3, z: 0.76 },
          { x: -0.8, y: 0.3, z: 0 },
          { x: -0.25, y: 0.3, z: -0.76 },
          { x: 0.65, y: 0.3, z: -0.47 },
          { x: 0, y: 1.2, z: 0 } // Bottom apex 11
        ];

        // Connect top apex to middle ring
        faces = [
          { indices: [0, 1, 2], color: "#10b981" },
          { indices: [0, 2, 3], color: "#059669" },
          { indices: [0, 3, 4], color: "#047857" },
          { indices: [0, 4, 5], color: "#065f46" },
          { indices: [0, 5, 1], color: "#34d399" },
          // Connect middle ring to lower ring
          { indices: [1, 6, 2], color: "#10b981" },
          { indices: [2, 7, 3], color: "#059669" },
          { indices: [3, 8, 4], color: "#047857" },
          { indices: [4, 9, 5], color: "#065f46" },
          { indices: [5, 10, 1], color: "#34d399" },
          // Connecting interstitial triangles
          { indices: [2, 6, 7], color: "#059669" },
          { indices: [3, 7, 8], color: "#047857" },
          { indices: [4, 8, 9], color: "#065f46" },
          { indices: [5, 9, 10], color: "#34d399" },
          { indices: [1, 10, 6], color: "#10b981" },
          // Connect lower ring to bottom apex
          { indices: [11, 7, 6], color: "#065f46" },
          { indices: [11, 8, 7], color: "#047857" },
          { indices: [11, 9, 8], color: "#059669" },
          { indices: [11, 10, 9], color: "#10b981" },
          { indices: [11, 6, 10], color: "#34d399" }
        ];
        break;
      }

      case "spaceship": {
        // Futuristic low poly spaceship
        vertices = [
          { x: 0, y: 0, z: 1.6 },      // 0: Nose tip
          { x: 0.25, y: 0.15, z: 0.4 }, // 1: Cabin top-right
          { x: -0.25, y: 0.15, z: 0.4 },// 2: Cabin top-left
          { x: 0.35, y: -0.15, z: 0.2 },// 3: Fuselage bottom-right
          { x: -0.35, y: -0.15, z: 0.2 },// 4: Fuselage bottom-left
          { x: 0.2, y: -0.1, z: -1.0 }, // 5: Exhaust right
          { x: -0.2, y: -0.1, z: -1.0 },// 6: Exhaust left
          { x: 0, y: 0.2, z: -0.9 },    // 7: Exhaust top
          // Wings
          { x: -1.5, y: -0.1, z: -0.4 },// 8: Left Wingtip
          { x: 1.5, y: -0.1, z: -0.4 }, // 9: Right Wingtip
          { x: -0.5, y: -0.1, z: -0.8 },// 10: Left wing back
          { x: 0.5, y: -0.1, z: -0.8 }, // 11: Right wing back
          // Tail fin
          { x: 0, y: 0.7, z: -0.8 },    // 12: Tail fin top
          { x: 0, y: 0.2, z: -0.4 }     // 13: Tail fin base front
        ];

        faces = [
          // Canopy
          { indices: [0, 1, 2], color: "#a855f7" }, // Purple glow cabin front
          { indices: [1, 5, 7], color: "#7e22ce" },
          { indices: [2, 7, 6], color: "#6b21a8" },
          { indices: [1, 7, 2], color: "#3b0764" },
          // Bottom hull
          { indices: [0, 3, 1], color: "#4c1d95" },
          { indices: [0, 2, 4], color: "#581c87" },
          { indices: [3, 5, 1], color: "#2e1065" },
          { indices: [4, 2, 6], color: "#2e1065" },
          { indices: [0, 4, 3], color: "#1e1b4b" },
          { indices: [3, 6, 5], color: "#1e1b4b" },
          { indices: [3, 4, 6], color: "#0f172a" },
          // Right wing
          { indices: [1, 3, 9], color: "#c084fc" },
          { indices: [3, 11, 9], color: "#a855f7" },
          { indices: [11, 5, 9], color: "#7e22ce" },
          // Left wing
          { indices: [2, 8, 4], color: "#c084fc" },
          { indices: [4, 8, 10], color: "#a855f7" },
          { indices: [10, 8, 6], color: "#7e22ce" },
          // Tail fin
          { indices: [13, 12, 7], color: "#a855f7" },
          { indices: [13, 6, 12], color: "#6b21a8" },
          { indices: [13, 12, 5], color: "#7e22ce" }
        ];
        break;
      }

      case "car": {
        // Low poly cyber truck / sports car
        vertices = [
          // Lower body
          { x: -0.6, y: 0.2, z: 1.2 },  // 0 Front Bottom Left
          { x: 0.6, y: 0.2, z: 1.2 },   // 1 Front Bottom Right
          { x: -0.65, y: 0.2, z: -1.2 },// 2 Rear Bottom Left
          { x: 0.65, y: 0.2, z: -1.2 }, // 3 Rear Bottom Right
          { x: -0.6, y: -0.1, z: 1.1 }, // 4 Front Hood Left
          { x: 0.6, y: -0.1, z: 1.1 },  // 5 Front Hood Right
          { x: -0.65, y: -0.1, z: -1.1 },// 6 Rear Tail Left
          { x: 0.65, y: -0.1, z: -1.1 }, // 7 Rear Tail Right
          
          // Cabin upper
          { x: -0.45, y: -0.4, z: 0.2 },  // 8 Windshield Top Left
          { x: 0.45, y: -0.4, z: 0.2 },   // 9 Windshield Top Right
          { x: -0.48, y: -0.4, z: -0.6 }, // 10 Cabin Rear Top Left
          { x: 0.48, y: -0.4, z: -0.6 }   // 11 Cabin Rear Top Right
        ];

        faces = [
          // Front nose and bumper
          { indices: [0, 1, 5], color: "#ea580c" }, // Orange Cyber theme
          { indices: [0, 5, 4], color: "#c2410c" },
          // Hood
          { indices: [4, 5, 9], color: "#f97316" },
          { indices: [4, 9, 8], color: "#ea580c" },
          // Windshield
          { indices: [8, 9, 11], color: "#1e293b" }, // Dark glass
          { indices: [8, 11, 10], color: "#1e293b" },
          // Roof/Cabin Side Left
          { indices: [4, 8, 10], color: "#ea580c" },
          { indices: [4, 10, 6], color: "#c2410c" },
          // Cabin Side Right
          { indices: [5, 11, 9], color: "#ea580c" },
          { indices: [5, 7, 11], color: "#c2410c" },
          // Back trunk slant
          { indices: [10, 11, 7], color: "#f97316" },
          { indices: [10, 7, 6], color: "#ea580c" },
          // Sides Lower
          { indices: [0, 4, 6], color: "#9a3412" },
          { indices: [0, 6, 2], color: "#7c2d12" },
          { indices: [1, 7, 5], color: "#9a3412" },
          { indices: [1, 3, 7], color: "#7c2d12" },
          // Back Tail bumper
          { indices: [2, 6, 7], color: "#451a03" },
          { indices: [2, 7, 3], color: "#3c1502" }
        ];
        break;
      }

      case "ring": {
        // Torus Ring geometry + high poly Gem on top
        // Torus points (8 columns, 8 circular tube points)
        const R = 0.8; // major radius
        const r = 0.15; // minor tube radius
        const segments = 12;
        const tubeSegments = 8;
        
        for (let i = 0; i < segments; i++) {
          const theta = (i / segments) * Math.PI * 2;
          const cosTheta = Math.cos(theta);
          const sinTheta = Math.sin(theta);
          
          for (let j = 0; j < tubeSegments; j++) {
            const phi = (j / tubeSegments) * Math.PI * 2;
            const cosPhi = Math.cos(phi);
            const sinPhi = Math.sin(phi);
            
            // Torus coords
            const tx = (R + r * cosPhi) * cosTheta;
            const ty = (R + r * cosPhi) * sinTheta;
            const tz = r * sinPhi;
            
            // Rotate ring to be horizontal
            vertices.push({ x: tx, y: tz + 0.2, z: ty });
          }
        }

        // Build torus faces
        for (let i = 0; i < segments; i++) {
          const nextI = (i + 1) % segments;
          for (let j = 0; j < tubeSegments; j++) {
            const nextJ = (j + 1) % tubeSegments;
            
            const idx1 = i * tubeSegments + j;
            const idx2 = i * tubeSegments + nextJ;
            const idx3 = nextI * tubeSegments + j;
            const idx4 = nextI * tubeSegments + nextJ;
            
            faces.push({
              indices: [idx1, idx2, idx4],
              color: i % 2 === 0 ? "#b59410" : "#d4af37" // Shiny Gold ring
            });
            faces.push({
              indices: [idx1, idx4, idx3],
              color: i % 2 === 0 ? "#d4af37" : "#f1c40f"
            });
          }
        }

        // Luxury diamond gem sitting on top of the ring
        const gemStartIdx = vertices.length;
        vertices.push(
          { x: 0, y: -0.4, z: 0 },    // Gem bottom apex (attaches to ring) 
          { x: 0.28, y: -0.7, z: 0.28 },  // Ring vertices
          { x: -0.28, y: -0.7, z: 0.28 },
          { x: -0.28, y: -0.7, z: -0.28 },
          { x: 0.28, y: -0.7, z: -0.28 },
          { x: 0, y: -1.0, z: 0 }     // Diamond top flat apex
        );

        faces.push(
          { indices: [gemStartIdx, gemStartIdx + 1, gemStartIdx + 2], color: "#38bdf8" }, // Sky blue brilliant
          { indices: [gemStartIdx, gemStartIdx + 2, gemStartIdx + 3], color: "#0ea5e9" },
          { indices: [gemStartIdx, gemStartIdx + 3, gemStartIdx + 4], color: "#0284c7" },
          { indices: [gemStartIdx, gemStartIdx + 4, gemStartIdx + 1], color: "#0369a1" },
          // Upper faces to top flat apex
          { indices: [gemStartIdx + 5, gemStartIdx + 2, gemStartIdx + 1], color: "#7dd3fc" },
          { indices: [gemStartIdx + 5, gemStartIdx + 3, gemStartIdx + 2], color: "#38bdf8" },
          { indices: [gemStartIdx + 5, gemStartIdx + 4, gemStartIdx + 3], color: "#0ea5e9" },
          { indices: [gemStartIdx + 5, gemStartIdx + 1, gemStartIdx + 4], color: "#bae6fd" }
        );
        break;
      }

      case "planet": {
        // Saturn planet and orbital disk rings
        // Spherical wireframe dots and latitude bands
        const sphereSlices = 7;
        const sphereSegs = 10;
        const radius = 0.65;
        
        // Generate central planet sphere vertices
        for (let s = 0; s <= sphereSlices; s++) {
          const lat = (s / sphereSlices) * Math.PI - Math.PI / 2;
          const sinLat = Math.sin(lat);
          const cosLat = Math.cos(lat);
          
          for (let g = 0; g < sphereSegs; g++) {
            const lon = (g / sphereSegs) * Math.PI * 2;
            const sinLon = Math.sin(lon);
            const cosLon = Math.cos(lon);
            
            vertices.push({
              x: radius * cosLat * cosLon,
              y: radius * sinLat,
              z: radius * cosLat * sinLon
            });
          }
        }

        // Sphere faces
        for (let s = 0; s < sphereSlices; s++) {
          for (let g = 0; g < sphereSegs; g++) {
            const nextG = (g + 1) % sphereSegs;
            const idx1 = s * sphereSegs + g;
            const idx2 = s * sphereSegs + nextG;
            const idx3 = (s + 1) * sphereSegs + g;
            const idx4 = (s + 1) * sphereSegs + nextG;
            
            const colorGradient = s % 2 === 0 ? "#0284c7" : "#0369a1"; // Celestial ocean planet
            faces.push({ indices: [idx1, idx2, idx4], color: colorGradient });
            faces.push({ indices: [idx1, idx4, idx3], color: colorGradient });
          }
        }

        // Saturn flat tilted planetary ring (vertices on an flat orbit)
        const ringStartIdx = vertices.length;
        const ringSegs = 14;
        const rInner = 0.85;
        const rOuter = 1.35;
        const tiltY = -0.15; // vertical slant offsets
        
        for (let i = 0; i < ringSegs; i++) {
          const angle = (i / ringSegs) * Math.PI * 2;
          const cosA = Math.cos(angle);
          const sinA = Math.sin(angle);
          
          // Inner Ring vertex
          vertices.push({
            x: rInner * cosA,
            y: tiltY * sinA, // wavy tilt
            z: rInner * sinA
          });
          
          // Outer Ring vertex
          vertices.push({
            x: rOuter * cosA,
            y: tiltY * sinA,
            z: rOuter * sinA
          });
        }

        // Saturn ring faces (connecting strip)
        for (let i = 0; i < ringSegs; i++) {
          const nextI = (i + 1) % ringSegs;
          const r1 = ringStartIdx + i * 2;
          const r2 = ringStartIdx + i * 2 + 1;
          const r3 = ringStartIdx + nextI * 2;
          const r4 = ringStartIdx + nextI * 2 + 1;
          
          const ringColor = i % 2 === 0 ? "rgba(234, 179, 8, 0.65)" : "rgba(202, 138, 4, 0.45)"; // Translucent golden rings
          faces.push({ indices: [r1, r2, r4], color: ringColor });
          faces.push({ indices: [r1, r4, r3], color: ringColor });
        }
        break;
      }

      case "dna": {
        // Double helix structure
        const nodesCount = 14;
        const helixWidth = 0.45;
        const helixHeightScale = 0.16;

        for (let i = 0; i < nodesCount; i++) {
          const angle = (i / nodesCount) * Math.PI * 5.5; // Multiple twists
          const cosA = Math.cos(angle);
          const sinA = Math.sin(angle);
          const y = (i - nodesCount / 2) * helixHeightScale;

          // Strand A point
          vertices.push({
            x: cosA * helixWidth,
            y: y,
            z: sinA * helixWidth
          });

          // Strand B point (opposite)
          vertices.push({
            x: -cosA * helixWidth,
            y: y,
            z: -sinA * helixWidth
          });
        }

        // Build molecular links / tubes as 3D box links or spheres
        for (let i = 0; i < nodesCount; i++) {
          const idxA = i * 2;
          const idxB = i * 2 + 1;

          // Horizontal nucleotide bar representation
          // Generate a custom geometric thin cylinder/box connecting A and B
          const pA = vertices[idxA];
          const pB = vertices[idxB];
          const barStart = vertices.length;

          const thick = 0.04;
          vertices.push(
            { x: pA.x, y: pA.y - thick, z: pA.z },
            { x: pA.x, y: pA.y + thick, z: pA.z },
            { x: pB.x, y: pB.y + thick, z: pB.z },
            { x: pB.x, y: pB.y - thick, z: pB.z }
          );

          // Alternating neon pink & cyan coding bar strands
          const barColor = i % 2 === 0 ? "#14b8a6" : "#ec4899"; 
          faces.push({ indices: [barStart, barStart + 1, barStart + 2], color: barColor });
          faces.push({ indices: [barStart, barStart + 2, barStart + 3], color: barColor });

          // Vertical outer ribbon strands lines connecting A[i] to A[i+1]
          if (i < nodesCount - 1) {
            const nextIdxA = (i + 1) * 2;
            const nextIdxB = (i + 1) * 2 + 1;
            
            const outerStart = vertices.length;
            vertices.push(
              vertices[idxA],
              vertices[nextIdxA],
              vertices[idxB],
              vertices[nextIdxB]
            );
            
            faces.push({ indices: [outerStart, outerStart + 1, outerStart + 1], color: "#14b8a6" }); // cyan strand
            faces.push({ indices: [outerStart + 2, outerStart + 3, outerStart + 3], color: "#ec4899" }); // pink strand
          }
        }
        break;
      }
    }

    return { vertices, faces };
  };

  // 2. PROJECT AND DRAW 3D MODEL
  const render3DFrame = (ctx: CanvasRenderingContext2D, width: number, height: number, customYaw: number, customPitch: number) => {
    ctx.clearRect(0, 0, width, height);

    // Apply cyberpunk digital radar coordinate systems if Hologram Grid visual setting is on
    if (visualFX === "hologram" || visualFX === "cyber") {
      ctx.strokeStyle = "rgba(16, 185, 129, 0.08)";
      ctx.lineWidth = 1;
      // Horizontal grids
      for (let y = 30; y < height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      // Vertical grids
      for (let x = 30; x < width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Futuristic circular radar crosshairs
      ctx.strokeStyle = "rgba(16, 185, 129, 0.15)";
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, Math.min(width, height) * 0.35, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 4, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(16, 185, 129, 0.4)";
      ctx.fill();
    }

    const { vertices, faces } = getGeometry();

    // 3D Matrix Rotations
    const cosYaw = Math.cos(customYaw);
    const sinYaw = Math.sin(customYaw);
    const cosPitch = Math.cos(customPitch);
    const sinPitch = Math.sin(customPitch);

    // Dynamic rotation of 3D points
    const transformed: Point3D[] = vertices.map((v) => {
      // Rotate around X (pitch)
      let y1 = v.y * cosPitch - v.z * sinPitch;
      let z1 = v.y * sinPitch + v.z * cosPitch;

      // Rotate around Y (yaw)
      let x2 = v.x * cosYaw + z1 * sinYaw;
      let z2 = -v.x * sinYaw + z1 * cosYaw;

      return { x: x2, y: y1, z: z2 };
    });

    // Perspective Projection setup
    const d = 4.0; // camera distance
    const fov = 380 * zoom; // scale mapping focal length
    const cx = width / 2;
    const cy = height / 2;

    const projected = transformed.map((v) => {
      const zScale = d / (d + v.z);
      return {
        x: cx + v.x * fov * zScale,
        y: cy + v.y * fov * zScale,
        depth: v.z // store raw z for painter depth sorting alg
      };
    });

    // Painter's Depth Sorting Algorithm for solid polygonal render
    const faceDepths = faces.map((face) => {
      // average depth of all vertices in this face
      const sum = face.indices.reduce((acc, idx) => acc + projected[idx].depth, 0);
      return {
        face,
        avgDepth: sum / face.indices.length
      };
    });

    // Sort: draw back elements (greater depth value) first
    faceDepths.sort((a, b) => b.avgDepth - a.avgDepth);

    // Render faces
    faceDepths.forEach(({ face }) => {
      if (face.indices.length < 3) return;

      ctx.beginPath();
      ctx.moveTo(projected[face.indices[0]].x, projected[face.indices[0]].y);
      for (let idx = 1; idx < face.indices.length; idx++) {
        ctx.lineTo(projected[face.indices[idx]].x, projected[face.indices[idx]].y);
      }
      ctx.closePath();

      // Flat shading normal vector directional lighting calculation
      const p1 = transformed[face.indices[0]];
      const p2 = transformed[face.indices[1]];
      const p3 = transformed[face.indices[2]];

      // Vector AB and AC
      const ax = p2.x - p1.x;
      const ay = p2.y - p1.y;
      const az = p2.z - p1.z;
      
      const bx = p3.x - p1.x;
      const by = p3.y - p1.y;
      const bz = p3.z - p1.z;

      // Cross product (Normal)
      const nx = ay * bz - az * by;
      const ny = az * bx - ax * bz;
      const nz = ax * by - ay * bx;
      const len = Math.sqrt(nx*nx + ny*ny + nz*nz);

      let lightingFactor = 0.85; // ambient base
      if (len > 0) {
        const dnx = nx / len;
        const dny = ny / len;
        const dnz = nz / len;

        // Directional Light source coming from top-right-front (1, -1, 1)
        const lx = 0.57;
        const ly = -0.57;
        const lz = 0.57;
        
        // Dot product
        const dot = dnx*lx + dny*ly + dnz*lz;
        lightingFactor = Math.max(0.15, Math.min(1.0, 0.5 + dot * 0.5));
      }

      // Convert solid color or adjust alpha
      let finalColor = face.color;
      
      // Style Aesthetic modifiers
      if (styleAesthetic === "cyberpunk") {
        if (finalColor.startsWith("#")) {
          // Map default colors to fluorescent neon cyans, pinks and purples
          if (finalColor === "#10b981" || finalColor === "#14b8a6") finalColor = "#06b6d4"; // Cyan
          else if (finalColor === "#ea580c" || finalColor === "#ec4899") finalColor = "#ec4899"; // Hot Pink
          else finalColor = "#a855f7"; // Neon purple
        }
      } else if (styleAesthetic === "claymation") {
        // Flat low-specular pastel shades
        lightingFactor = 0.6 + lightingFactor * 0.25;
      } else if (styleAesthetic === "anime") {
        // Cel-shaded quantized lighting
        lightingFactor = lightingFactor > 0.65 ? 1.0 : (lightingFactor > 0.45 ? 0.65 : 0.35);
      } else if (styleAesthetic === "hyperreal") {
        // High specular metallic contrast
        lightingFactor = Math.max(0.1, Math.min(1.0, lightingFactor * 1.25));
      }

      if (visualFX === "hologram") {
        // glowing green neon translucent laser mesh grids
        ctx.fillStyle = "rgba(16, 185, 129, 0.12)";
        ctx.strokeStyle = "rgba(52, 211, 153, 0.8)";
        ctx.lineWidth = 1.2;
        ctx.fill();
        ctx.stroke();
        return;
      }

      if (visualFX === "cyber") {
        // Cyber Tron electric neon blueprint
        ctx.fillStyle = "rgba(236, 72, 153, 0.15)";
        ctx.strokeStyle = "rgba(244, 63, 94, 0.9)";
        ctx.lineWidth = 1.5;
        ctx.fill();
        ctx.stroke();
        return;
      }

      // Compute shaded color
      ctx.fillStyle = getShadedColor(finalColor, lightingFactor);
      ctx.strokeStyle = "rgba(0, 0, 0, 0.25)";
      ctx.lineWidth = 0.8;
      ctx.fill();
      ctx.stroke();
    });

    // Draw tech indicators, vertex nodes, and title overlays
    if (visualFX === "hologram" || visualFX === "cyber") {
      projected.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = visualFX === "hologram" ? "#34d399" : "#f43f5e";
        ctx.fill();
      });
    }
  };

  // Lighten or darken color based on shade factor
  const getShadedColor = (hex: string, factor: number): string => {
    if (hex.startsWith("rgba")) return hex;
    // Simple hex to RGB shading
    let c = hex.replace("#", "");
    if (c.length === 3) {
      c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
    }
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);

    const sr = Math.round(r * factor);
    const sg = Math.round(g * factor);
    const sb = Math.round(b * factor);

    return `rgb(${sr}, ${sg}, ${sb})`;
  };

  // 3. INTERACTIVE RENDERING LOOP & EVENTS
  useEffect(() => {
    if (viewMode !== "interactive") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      // Auto rotate slowly when not dragging
      const currentYaw = yaw;
      render3DFrame(ctx, canvas.width, canvas.height, currentYaw, pitch);
    };

    render();
  }, [viewMode, pitch, yaw, zoom, visualFX, selectedModelType, styleAesthetic, aspectRatio]);

  // Drag interaction handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;

    setYaw((prev) => prev + dx * 0.008);
    setPitch((prev) => Math.max(-1.4, Math.min(1.4, prev + dy * 0.008)));

    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  // 4. VIDEO CINEMATIC RENDER ENGINE EXECUTION
  const triggerVideoRender = async () => {
    setViewMode("rendering");
    setRenderProgress(0);
    setRenderStatus("GPU render muhiti ishga tushirilmoqda...");
    recordedChunksRef.current = [];

    // Progressive loading simulation with cool messages
    const statuses = [
      { prg: 10, msg: "Fasetlar va 3D matritsalar yuklanmoqda..." },
      { prg: 25, msg: "Kinematik uchish trayektoriyasi hisoblanmoqda..." },
      { prg: 45, msg: "Yorug'lik va soyalar tahlili (Ray-Tracing)..." },
      { prg: 65, msg: "Kadrlarni H.264 video oqimiga kodlash boshlandi..." },
      { prg: 85, msg: "Atmosfera tovush dizayni va effektlar qo'shilmoqda..." },
      { prg: 95, msg: "MP4 video konteyneriga eksport qilinmoqda..." },
      { prg: 100, msg: "Muvaffaqiyatli yakunlandi!" }
    ];

    // Canvas rendering for recording
    const canvas = canvasRef.current;
    if (!canvas) {
      setViewMode("interactive");
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setViewMode("interactive");
      return;
    }

    // Set up native browser stream recording
    let recorder: MediaRecorder | null = null;
    try {
      if (typeof canvas.captureStream === "function") {
        const stream = canvas.captureStream(fps);
        
        // Try multiple MIME types from best to fallback
        const mimeTypes = [
          "video/webm;codecs=vp9",
          "video/webm;codecs=vp8",
          "video/webm",
          "video/mp4"
        ];
        
        let selectedMime = "";
        for (const type of mimeTypes) {
          if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(type)) {
            selectedMime = type;
            break;
          }
        }

        const options = selectedMime ? { mimeType: selectedMime } : undefined;
        recorder = new MediaRecorder(stream, options);
        
        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            recordedChunksRef.current.push(event.data);
          }
        };

        recorder.onstop = () => {
          try {
            const blob = new Blob(recordedChunksRef.current, { type: selectedMime || "video/webm" });
            const url = URL.createObjectURL(blob);
            setVideoUrl(url);
          } catch (err) {
            console.error("Error creating Blob URL:", err);
          }
          setViewMode("playing");
          setIsPlaying(true);
        };

        mediaRecorderRef.current = recorder;
        recorder.start();
      } else {
        console.warn("canvas.captureStream is not supported in this browser environment. Using simulation.");
      }
    } catch (recorderErr) {
      console.warn("MediaRecorder capture is limited inside this browser container. Utilizing seamless simulation:", recorderErr);
    }

    // Animate the rotation and progress
    const totalFrames = duration * fps;
    let currentFrame = 0;
    let progressIdx = 0;

    const renderLoop = () => {
      if (currentFrame >= totalFrames) {
        // End recording
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
          try {
            mediaRecorderRef.current.stop();
          } catch (e) {
            console.warn("Failed to stop media recorder:", e);
            setViewMode("playing");
            setIsPlaying(true);
          }
        } else {
          // Simulation fallback if MediaRecorder failed/unsupported in sandbox
          setViewMode("playing");
          setIsPlaying(true);
        }
        return;
      }

      currentFrame++;
      const percent = Math.round((currentFrame / totalFrames) * 100);
      
      // Optimize state updates to avoid unnecessary rendering loops
      setRenderProgress((prev) => (prev !== percent ? percent : prev));

      // Update messages
      if (progressIdx < statuses.length && percent >= statuses[progressIdx].prg) {
        const nextMsg = statuses[progressIdx].msg;
        setRenderStatus((prev) => (prev !== nextMsg ? nextMsg : prev));
        progressIdx++;
      }

      // Compute cinematic camera motion based on selected path
      let currentYaw = yaw;
      let currentPitch = pitch;
      const motionMult = motionStrength / 5;

      if (presetPath === "orbit") {
        currentYaw = yaw + (currentFrame / totalFrames) * Math.PI * 2 * motionMult; // Orbit full 360 degrees
        currentPitch = 0.2 + Math.sin((currentFrame / totalFrames) * Math.PI * 2 * motionMult) * 0.2;
      } else if (presetPath === "zoom") {
        currentYaw = yaw + (currentFrame / totalFrames) * Math.PI * 1 * motionMult;
        currentPitch = pitch + (currentFrame / totalFrames) * 0.3 * motionMult;
        // Zoom-in effect
        ctx.scale(1 + (currentFrame / totalFrames) * 0.15 * motionMult, 1 + (currentFrame / totalFrames) * 0.15 * motionMult);
      } else if (presetPath === "helix") {
        currentYaw = yaw + (currentFrame / totalFrames) * Math.PI * 3 * motionMult;
        currentPitch = -0.5 + (currentFrame / totalFrames) * 1.0 * motionMult;
      }

      render3DFrame(ctx, canvas.width, canvas.height, currentYaw, currentPitch);

      // Add camera scanner sweep visuals on top when rendering
      ctx.strokeStyle = "rgba(16, 185, 129, 0.3)";
      ctx.lineWidth = 1.5;
      const scanY = (currentFrame % 30) * (canvas.height / 30);
      ctx.beginPath();
      ctx.moveTo(0, scanY);
      ctx.lineTo(canvas.width, scanY);
      ctx.stroke();

      // Camera corner borders
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = 2;
      const dSize = 15;
      // Top-Left
      ctx.beginPath();
      ctx.moveTo(dSize, dSize); ctx.lineTo(dSize, dSize + 15);
      ctx.moveTo(dSize, dSize); ctx.lineTo(dSize + 15, dSize);
      ctx.stroke();
      // Bottom-Right
      ctx.beginPath();
      ctx.moveTo(canvas.width - dSize, canvas.height - dSize); ctx.lineTo(canvas.width - dSize - 15, canvas.height - dSize);
      ctx.moveTo(canvas.width - dSize, canvas.height - dSize); ctx.lineTo(canvas.width - dSize, canvas.height - dSize - 15);
      ctx.stroke();

      // REC blinking dot
      if (Math.floor(currentFrame / 10) % 2 === 0) {
        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.arc(35, 35, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 10px monospace";
        ctx.fillText("REC 3D", 48, 38);
      }

      renderAnimFrameRef.current = requestAnimationFrame(renderLoop);
    };

    renderLoop();
  };

  // 5. PLAY RENDERED VIDEO LOOP
  useEffect(() => {
    if (viewMode !== "playing" || !isPlaying) {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    const totalFrames = duration * fps;
    const motionMult = motionStrength / 5;

    playTimerRef.current = setInterval(() => {
      frame = (frame + 1) % totalFrames;
      
      // Optimize: Only trigger React state updates when the visible formatted time changes!
      const nextPlayTime = Math.floor(frame / fps);
      setPlayTime((prev) => (Math.floor(prev) !== nextPlayTime ? nextPlayTime : prev));

      // Simulate camera loop
      let currentYaw = yaw;
      let currentPitch = pitch;

      if (presetPath === "orbit") {
        currentYaw = yaw + (frame / totalFrames) * Math.PI * 2 * motionMult;
        currentPitch = 0.2 + Math.sin((frame / totalFrames) * Math.PI * 2 * motionMult) * 0.2;
      } else if (presetPath === "zoom") {
        currentYaw = yaw + (frame / totalFrames) * Math.PI * 1 * motionMult;
        currentPitch = pitch + (frame / totalFrames) * 0.3 * motionMult;
      } else if (presetPath === "helix") {
        currentYaw = yaw + (frame / totalFrames) * Math.PI * 3 * motionMult;
        currentPitch = -0.5 + (frame / totalFrames) * 1.0 * motionMult;
      }

      render3DFrame(ctx, canvas.width, canvas.height, currentYaw, currentPitch);

      // Playback Watermark
      ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
      ctx.font = "10px monospace";
      ctx.fillText("SEDENCE 2.0 AI • RENDERED PLAYBACK", 20, canvas.height - 20);

    }, 1000 / fps);

    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [viewMode, isPlaying, duration, fps, selectedModelType, yaw, pitch, presetPath, motionStrength, styleAesthetic]);

  // Cleanup all timers and animation frames on unmount or viewMode transitions
  useEffect(() => {
    if (viewMode !== "rendering") {
      if (renderAnimFrameRef.current) {
        cancelAnimationFrame(renderAnimFrameRef.current);
        renderAnimFrameRef.current = null;
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        try {
          mediaRecorderRef.current.stop();
        } catch (e) {
          console.warn("Failed to stop media recorder on view transition:", e);
        }
        mediaRecorderRef.current = null;
      }
    }

    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
      if (renderAnimFrameRef.current) cancelAnimationFrame(renderAnimFrameRef.current);
    };
  }, [viewMode]);

  // Handle simulated fallback download if Blob URL isn't natively supported
  const handleDownload = () => {
    if (videoUrl) {
      const a = document.createElement("a");
      a.href = videoUrl;
      a.download = `VeloxAI_3D_${selectedModelType}_${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      // Trigger instant direct visual canvas capture save
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `VeloxAI_3D_${selectedModelType}_Keyframe.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // Helper to dynamically adjust preview canvas scale and aspect ratio crop frames
  const getCanvasDimensions = () => {
    switch (aspectRatio) {
      case "9:16": 
        return { w: 320, h: 568, class: "aspect-[9/16] max-h-[380px] rounded-xl border border-[#2f2f2f]" };
      case "1:1": 
        return { w: 380, h: 380, class: "aspect-square max-h-[380px] rounded-xl border border-[#2f2f2f]" };
      case "16:9":
      default:
        return { w: 640, h: 360, class: "aspect-video w-full" };
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getModelLabel = () => {
    switch (selectedModelType) {
      case "spaceship": return "Kosmik Kema";
      case "car": return "Cyber Kar";
      case "ring": return "Tilla Uzuk (Pro)";
      case "planet": return "Saturn Sayyorasi";
      case "crystal": return "Smaragd Billur";
      case "dna": return "DNK Spiral Zanjiri";
      default: return "3D Obyekt";
    }
  };

  const dimensions = getCanvasDimensions();

  // Helper to get enhanced prompt description (Simulated Sedence 2.0 Expansion)
  const getExpandedPrompt = () => {
    if (!promptExpanded) return prompt;
    const addition = `, ${styleAesthetic} style, ultra-detailed 8k resolution, cinematic atmosphere, dynamic studio lighting, volumetric shadows, ray-traced reflections, Unreal Engine 5 render, highly immersive depth of field, seed: ${seed}`;
    return prompt ? `"${prompt}"${addition}` : `An elegant ${getModelLabel().toLowerCase()}${addition}`;
  };

  return (
    <div className="my-5 rounded-3xl border border-[#2c2c30] bg-[#0d0d0f] shadow-2xl overflow-hidden max-w-2xl w-full">
      {/* Studio Header Bar */}
      <div className="flex items-center justify-between px-5 py-4 bg-[#141417]/80 backdrop-blur-md border-b border-[#1f1f23] select-none">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Video className="h-4 w-4 animate-pulse" />
          </span>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-display flex items-center gap-1.5">
              <span>{title || "SEDENCE 2.0 AI Video Studio"}</span>
              <span className="text-[9px] bg-amber-500/15 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded-full font-mono normal-case">Pro</span>
            </h4>
            <p className="text-[10px] text-[#8e8e93] font-mono leading-none mt-1">
              Active Engine: <span className="text-amber-400 font-semibold">Sedence Neural-3D v2.0</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold px-2.5 py-1 rounded-lg bg-[#1c1c21] text-amber-400 border border-amber-500/20 font-mono uppercase">
            {viewMode === "interactive" ? "Interactive Stage" : viewMode === "rendering" ? "Neural Render" : "Completed MP4"}
          </span>
        </div>
      </div>

      {/* Main interactive/video Canvas stage container with Aspect Ratio adaptive scaling */}
      <div className="relative min-h-[380px] bg-[#060608] flex items-center justify-center group overflow-hidden p-4">
        {/* Cinematic ambient glowing background based on style */}
        <div className="absolute inset-0 opacity-10 blur-3xl pointer-events-none transition-all duration-700 bg-gradient-to-tr from-amber-500 via-purple-600 to-transparent" />

        <div className={`transition-all duration-300 flex items-center justify-center ${aspectRatio === "9:16" ? "w-[240px]" : aspectRatio === "1:1" ? "w-[360px]" : "w-full"}`}>
          <canvas
            ref={canvasRef}
            width={dimensions.w}
            height={dimensions.h}
            onMouseDown={viewMode === "interactive" ? handleMouseDown : undefined}
            onMouseMove={viewMode === "interactive" ? handleMouseMove : undefined}
            onMouseUp={viewMode === "interactive" ? handleMouseUp : undefined}
            onMouseLeave={viewMode === "interactive" ? handleMouseUp : undefined}
            className={`object-contain transition-all duration-300 shadow-2xl bg-black ${dimensions.class} ${
              viewMode === "interactive" ? "cursor-grab active:cursor-grabbing hover:ring-1 hover:ring-amber-500/30" : ""
            }`}
          />
        </div>

        {/* Overlay instructions for interactive view */}
        {viewMode === "interactive" && (
          <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md px-2.5 py-1.5 rounded-lg text-[9px] text-[#a1a1aa] font-mono pointer-events-none transition-opacity duration-300 opacity-100 group-hover:opacity-0 flex items-center gap-1.5 border border-[#2f2f2f]">
            <Camera className="h-3 w-3 text-amber-400" /> Kamerani aylantirish uchun torting
          </div>
        )}

        {/* Cinematic Grid & rendering overlay state */}
        {viewMode === "rendering" && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center select-none animate-fade-in z-20">
            <div className="relative mb-6">
              {/* Spinning radar circles */}
              <div className="w-20 h-20 rounded-full border border-dashed border-amber-500 animate-spin" />
              <div className="absolute inset-2 rounded-full border border-amber-400/30 animate-ping" />
              <div className="absolute inset-6 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Cpu className="h-7 w-7 text-amber-400 animate-pulse" />
              </div>
            </div>

            <div className="space-y-3.5 max-w-md w-full px-4">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-[#c1c1c9] truncate max-w-[80%] flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
                  {renderStatus}
                </span>
                <span className="text-amber-400 font-bold font-mono">{renderProgress}%</span>
              </div>
              {/* Progress bar timeline */}
              <div className="h-2 w-full bg-[#1c1c21] rounded-full overflow-hidden border border-[#2d2d35]">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 via-orange-400 to-yellow-300 transition-all duration-100 rounded-full shadow-[0_0_12px_rgba(245,158,11,0.5)]"
                  style={{ width: `${renderProgress}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[9px] text-[#6e6e73] font-mono">
                <span>MODEL RE-CONSTRUCTION</span>
                <span>SEDENCE ENGINE v2.0 • CUDA FP16</span>
              </div>
            </div>
          </div>
        )}

        {/* Completed overlay overlay trigger */}
        {viewMode === "playing" && (
          <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between bg-black/85 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/5 z-20 transition-all duration-300 shadow-2xl">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/25 text-amber-400 cursor-pointer transition-colors border border-amber-500/20"
                title={isPlaying ? "Pauza" : "O'ynatish"}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-amber-400" />}
              </button>
              
              <div className="text-[10px] font-mono text-[#a1a1aa] bg-[#141417] px-2.5 py-1 rounded-lg border border-white/5">
                <span className="text-white font-semibold">{formatTime(playTime)}</span>
                <span className="mx-1.5 text-zinc-600">/</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-bold text-xs px-4 py-2 rounded-xl transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer shadow-lg shadow-amber-500/20"
            >
              <Download className="h-3.5 w-3.5 stroke-[2.5]" /> MP4 Yuklash
            </button>
          </div>
        )}
      </div>

      {/* Studio controls bottom segment panel */}
      {viewMode === "interactive" ? (
        <div className="p-5 bg-[#121215] border-t border-[#1f1f23] space-y-4">
          
          {/* Dynamic 3D Object Model Switcher directly in the panel */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#8e8e93] uppercase tracking-wider font-mono flex items-center justify-between">
              <span className="flex items-center gap-1"><Layers className="h-3 w-3 text-amber-400" /> Generatsiya qilinadigan 3D Obyekt</span>
              <span className="text-[9px] text-zinc-500">6 xil model mavjud</span>
            </label>
            <div className="grid grid-cols-6 gap-1.5">
              {(["spaceship", "car", "ring", "planet", "crystal", "dna"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSelectedModelType(m)}
                  className={`py-2 rounded-lg text-[10px] font-bold font-mono transition-all border text-center truncate px-1 cursor-pointer ${
                    selectedModelType === m
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/30 font-semibold"
                      : "bg-[#18181c] text-[#8e8e93] border-[#25252b] hover:text-white"
                  }`}
                  title={m}
                >
                  {m === "spaceship" ? "Kema" : m === "car" ? "Mashina" : m === "ring" ? "Uzuk" : m === "planet" ? "Sayyora" : m === "crystal" ? "Billur" : "DNK"}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Camera flight preset path selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#8e8e93] uppercase tracking-wider font-mono flex items-center gap-1">
                <Camera className="h-3 w-3 text-amber-400" /> Kamera Trayektoriyasi
              </label>
              <select
                value={presetPath}
                onChange={(e) => setPresetPath(e.target.value as any)}
                className="w-full bg-[#18181c] border border-[#25252b] text-xs text-white rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500/50 cursor-pointer font-mono"
              >
                <option value="orbit">Orbit (360° Aylanma)</option>
                <option value="zoom">Zoom-In Flyby (Yaqinlashish)</option>
                <option value="helix">Cinematic Helix (Giral Burilish)</option>
              </select>
            </div>

            {/* Aesthetic style selections */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#8e8e93] uppercase tracking-wider font-mono flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-400" /> Estetik Vizual Stil
              </label>
              <select
                value={styleAesthetic}
                onChange={(e) => setStyleAesthetic(e.target.value as any)}
                className="w-full bg-[#18181c] border border-[#25252b] text-xs text-white rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500/50 cursor-pointer font-mono"
              >
                <option value="cinematic">Cinematic Pro (Natural Shader)</option>
                <option value="cyberpunk">Cyberpunk Neon (Fluorescent)</option>
                <option value="hyperreal">Hyper-Realistic Metallic</option>
                <option value="anime">Cel-Shaded Anime Style</option>
                <option value="claymation">Soft Matte Claymation</option>
              </select>
            </div>
          </div>

          {/* Aspect Ratio, Motion Strength, and Visual FX Options */}
          <div className="grid grid-cols-3 gap-3 pt-2.5 border-t border-[#1f1f23]">
            
            {/* Aspect Ratio selection */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-bold text-[#8e8e93] uppercase font-mono tracking-wider">Format o'lchami</span>
              <div className="flex gap-1">
                {(["16:9", "9:16", "1:1"] as const).map((ar) => (
                  <button
                    key={ar}
                    type="button"
                    onClick={() => setAspectRatio(ar)}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold font-mono transition-all cursor-pointer border ${
                      aspectRatio === ar
                        ? "bg-amber-500 text-black border-amber-500"
                        : "bg-[#18181c] text-[#8e8e93] border-[#25252b] hover:text-white"
                    }`}
                  >
                    {ar}
                  </button>
                ))}
              </div>
            </div>

            {/* Motion Strength slider */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-bold text-[#8e8e93] uppercase font-mono tracking-wider flex justify-between">
                <span>Kamera tezligi</span>
                <span className="text-amber-400 font-mono font-bold">{motionStrength}x</span>
              </span>
              <div className="flex items-center gap-2 pt-1 px-1">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={motionStrength}
                  onChange={(e) => setMotionStrength(parseInt(e.target.value))}
                  className="w-full h-1 bg-[#1c1c21] rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
            </div>

            {/* Render Overlay Filters */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-bold text-[#8e8e93] uppercase font-mono tracking-wider">Render filtrlari</span>
              <select
                value={visualFX}
                onChange={(e) => setVisualFX(e.target.value as any)}
                className="w-full bg-[#18181c] border border-[#25252b] text-[10px] text-white rounded-lg px-2 py-1.5 focus:outline-none focus:border-amber-500/50 cursor-pointer font-mono"
              >
                <option value="none">Standard Solid</option>
                <option value="hologram">Hologram Laser</option>
                <option value="cyber">Cyber Blueprint</option>
              </select>
            </div>
          </div>

          {/* AI Prompt Expander Preview Segment */}
          <div className="p-3 bg-[#18181c] rounded-xl border border-[#25252b] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold text-[#8e8e93] uppercase font-mono tracking-wider flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-400" /> AI Prompt Expansion (Sedence 2.0 Engine)
              </span>
              <button
                type="button"
                onClick={() => setPromptExpanded(!promptExpanded)}
                className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold uppercase transition-all ${
                  promptExpanded 
                    ? "bg-amber-500/15 text-amber-400 border border-amber-500/30" 
                    : "bg-[#25252b] text-zinc-500"
                }`}
              >
                {promptExpanded ? "Faol" : "O'chiq"}
              </button>
            </div>
            <p className="text-[10px] text-zinc-400 font-mono leading-relaxed bg-[#0d0d0f] p-2 rounded-lg border border-white/5 break-words select-all">
              {getExpandedPrompt()}
            </p>
            
            <div className="flex justify-between items-center text-[9px] text-[#6e6e73] font-mono">
              <div className="flex items-center gap-2">
                <span>Seed: <span className="text-zinc-400">{seed}</span></span>
                <button 
                  type="button"
                  onClick={() => setSeed(Math.floor(Math.random() * 899999 + 100000))}
                  className="text-amber-500 hover:underline hover:text-amber-400"
                >
                  Yangilash
                </button>
              </div>
              <div className="flex gap-2 items-center">
                <span>Davomiyligi: </span>
                <select 
                  value={duration} 
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="bg-[#141417] text-amber-400 font-extrabold hover:text-amber-300 border border-[#25252b] rounded-md px-1.5 py-0.5 focus:outline-none cursor-pointer text-[9px] font-mono"
                >
                  <option value={5}>5s</option>
                  <option value={10}>10s</option>
                  <option value={30}>30s</option>
                  <option value={60}>60s (1 min)</option>
                </select>
                <span className="text-zinc-700">|</span>
                <span>FPS: <button type="button" onClick={() => setFps(fps === 30 ? 60 : 30)} className="text-zinc-400 font-bold hover:text-white">{fps}</button></span>
              </div>
            </div>
          </div>

          {/* Trigger cinematic rendering action */}
          <button
            type="button"
            onClick={triggerVideoRender}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-extrabold text-xs py-3.5 rounded-xl transition-all transform hover:scale-[1.01] active:scale-98 cursor-pointer shadow-xl shadow-amber-500/10 select-none uppercase tracking-wider"
          >
            <Film className="h-4 w-4 stroke-[2.5]" /> NEURAL VIDEO GENERATION (Sedence 2.0 Render)
          </button>
        </div>
      ) : (
        /* Rendered playback footer buttons */
        <div className="p-5 bg-[#121215] border-t border-[#1f1f23] flex justify-between gap-3 select-none">
          <button
            type="button"
            onClick={() => {
              setViewMode("interactive");
              setIsPlaying(false);
              setVideoUrl(null);
            }}
            className="flex-1 flex items-center justify-center gap-1.5 bg-[#18181c] border border-[#25252b] hover:border-zinc-600 hover:text-white text-[#a1a1aa] font-bold text-xs py-3 rounded-xl transition-all cursor-pointer font-mono"
          >
            <RefreshCw className="h-3.5 w-3.5 text-amber-500" /> Studio-ga Qaytish
          </button>

          <button
            type="button"
            onClick={triggerVideoRender}
            className="flex-1 flex items-center justify-center gap-1.5 bg-amber-500/10 border border-amber-500/25 text-amber-400 hover:bg-amber-500 hover:text-black font-bold text-xs py-3 rounded-xl transition-all cursor-pointer font-mono"
          >
            <Film className="h-3.5 w-3.5" /> Qaytadan Render qilish
          </button>
        </div>
      )}
    </div>
  );
}
