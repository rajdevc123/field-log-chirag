import * as THREE from 'three';

/**
 * 1. BIOMECHANICAL / SKELETAL STIPPLE ELEPHANT SHADER
 *
 * Matches the main reference (media_1793098949617_90b387e7.png):
 * - Converts the real 0 A.D. African Bush Elephant & Calf meshes into a 4-legged walk cycle.
 * - When hovered (`uHoverWeight -> 1`), pauses the walk cycle and rotates the Head/Ears/Trunk
 *   around the neck pivot to look directly at the user's cursor.
 * - Fragment shader produces high-contrast segmented skeletal/cervical rings on the trunk/neck,
 *   deep black ink shadow cavities under the torso/joints, and crisp 1-bit stochastic pin-dot
 *   stippling on warm cream paper (#ECE7DC).
 */
export class BiomechanicalElephantMaterial extends THREE.ShaderMaterial {
  constructor(params?: { isCalf?: boolean }) {
    super({
      side: THREE.DoubleSide,
      uniforms: {
        uColorInk: { value: new THREE.Color('#141311') },
        uColorPaper: { value: new THREE.Color('#ECE7DC') },
        uLightDirection: { value: new THREE.Vector3(-0.35, 0.78, 0.52).normalize() },
        uTime: { value: 0 },
        uWalkCycle: { value: 0 },
        uWalkWeight: { value: 1.0 },
        uHoverWeight: { value: 0.0 },
        uHeadYaw: { value: 0.0 },
        uHeadPitch: { value: 0.0 },
        uEarFlap: { value: 0.0 },
        uIsCalf: { value: params?.isCalf ? 1.0 : 0.0 },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uWalkCycle;
        uniform float uWalkWeight;
        uniform float uHoverWeight;
        uniform float uHeadYaw;
        uniform float uHeadPitch;
        uniform float uEarFlap;
        uniform float uIsCalf;

        varying vec3 vOrigPos;
        varying vec3 vWorldNormal;
        varying vec3 vViewNormal;
        varying vec3 vWorldPos;

        mat3 rotZ(float a) {
          float s = sin(a), c = cos(a);
          return mat3(c, -s, 0.0, s, c, 0.0, 0.0, 0.0, 1.0);
        }

        mat3 rotY(float a) {
          float s = sin(a), c = cos(a);
          return mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c);
        }

        mat3 rotX(float a) {
          float s = sin(a), c = cos(a);
          return mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c);
        }

        void main() {
          // Remap STL Z-up coordinates (position.x=L/R, position.y=Front/Back, position.z=Up)
          // into standard Y-up coordinates where:
          // p.x: [-784 (front trunk/tusks) .. +382 (back tail)]
          // p.y: [0 (feet bottom) .. +925 (head crown)]
          // p.z: [-320 (left ear/flank) .. +320 (right ear/flank)]
          vec3 p = vec3(position.y, position.z, position.x);
          vec3 n = normalize(vec3(normal.y, normal.z, normal.x));
          vOrigPos = p;

          float phaseOffset = uIsCalf > 0.5 ? 1.4 : 0.0;
          float wc = uWalkCycle + phaseOffset;

          // ---------------- 1. FOUR-LEGGED QUADRUPED WALK CYCLE ----------------
          // Front legs: p.x in [-390 .. -45], p.y < 450
          // Back legs:  p.x in [+45 .. +335], p.y < 450
          float isLegY = smoothstep(465.0, 390.0, p.y);
          float isFrontLeg = smoothstep(-400.0, -340.0, p.x) * smoothstep(-35.0, -95.0, p.x) * isLegY;
          float isBackLeg  = smoothstep(35.0, 95.0, p.x) * smoothstep(345.0, 295.0, p.x) * isLegY;
          float legMask = clamp(isFrontLeg + isBackLeg, 0.0, 1.0);

          if (legMask > 0.001) {
            float hipX = isFrontLeg > 0.5 ? -205.0 : 215.0;
            // Lateral sequence gait phases for the 4 legs:
            // Back-Left (0), Front-Left (0.5 pi), Back-Right (pi), Front-Right (1.5 pi)
            float legPhase = wc;
            if (isFrontLeg > 0.5 && p.z < 0.0) legPhase = wc + 1.5708;
            if (isBackLeg > 0.5  && p.z >= 0.0) legPhase = wc + 3.1416;
            if (isFrontLeg > 0.5 && p.z >= 0.0) legPhase = wc + 4.7124;

            // Upper limb swing around hip/shoulder joint (hipX, 430)
            float hipSwing = sin(legPhase) * 0.34 * uWalkWeight * legMask;
            vec3 hipPivot = vec3(hipX, 430.0, p.z);
            mat3 mHip = rotZ(hipSwing);
            p = hipPivot + mHip * (p - hipPivot);
            n = mHip * n;

            // Knee/Wrist flexion when lifting foot forward (cos(legPhase) > 0)
            float lowerLegMask = smoothstep(260.0, 175.0, vOrigPos.y) * legMask;
            float kneeLift = max(0.0, cos(legPhase)) * uWalkWeight;
            float kneeBend = -kneeLift * 0.58 * lowerLegMask;
            vec3 kneePivot = vec3(hipX - sin(legPhase) * 65.0 * uWalkWeight, 220.0, p.z);
            mat3 mKnee = rotZ(kneeBend);
            p = kneePivot + mKnee * (p - kneePivot);
            n = mKnee * n;

            // Vertical foot clearance during forward swing
            p.y += kneeLift * 46.0 * smoothstep(320.0, 80.0, vOrigPos.y) * legMask;
          }

          // ---------------- 2. TAIL SWISH ----------------
          float tailMask = smoothstep(320.0, 350.0, vOrigPos.x) * smoothstep(700.0, 520.0, vOrigPos.y);
          if (tailMask > 0.001) {
            vec3 tailPivot = vec3(335.0, 650.0, 0.0);
            float tailAngle = (sin(wc * 1.5) * 0.18 * uWalkWeight + 0.12) * tailMask;
            mat3 mTail = rotZ(tailAngle) * rotX(cos(wc) * 0.14 * tailMask);
            p = tailPivot + mTail * (p - tailPivot);
            n = mTail * n;
          }

          // ---------------- 3. TRUNK SWAY & HOVER CURL ----------------
          // Trunk is at front: vOrigPos.x < -450, |vOrigPos.z| < 85, vOrigPos.y < 590
          float trunkMask = smoothstep(-430.0, -520.0, vOrigPos.x)
                          * smoothstep(610.0, 490.0, vOrigPos.y)
                          * smoothstep(95.0, 55.0, abs(vOrigPos.z));
          if (trunkMask > 0.001) {
            float distDown = clamp((550.0 - vOrigPos.y) / 510.0, 0.0, 1.15);
            // Walk swing vs curious hover curl
            float walkSwingX = sin(wc - distDown * 2.2) * 58.0 * uWalkWeight * distDown * trunkMask;
            float hoverCurlX = -sin(distDown * 2.0) * 65.0 * uHoverWeight * distDown * trunkMask;
            float hoverLiftY = (1.0 - cos(distDown * 1.6)) * 85.0 * uHoverWeight * distDown * trunkMask;
            float swayZ = cos(uTime * 2.0 - distDown * 2.5) * (24.0 + 35.0 * uHoverWeight) * distDown * trunkMask;

            p.x += walkSwingX + hoverCurlX;
            p.y += hoverLiftY;
            p.z += swayZ;
          }

          // ---------------- 4. EAR SWING & HOVER FLARE ----------------
          float earMask = smoothstep(115.0, 165.0, abs(vOrigPos.z))
                        * smoothstep(-470.0, -380.0, vOrigPos.x)
                        * smoothstep(-130.0, -210.0, vOrigPos.x)
                        * smoothstep(410.0, 490.0, vOrigPos.y);
          if (earMask > 0.001) {
            vec3 earHinge = vec3(-350.0, 680.0, sign(vOrigPos.z) * 115.0);
            float walkEar = sin(wc + 0.8) * 0.14 * uWalkWeight;
            float flare = (walkEar + uEarFlap + uHoverWeight * 0.34) * earMask;
            mat3 mEar = rotY(-sign(vOrigPos.z) * flare);
            p = earHinge + mEar * (p - earHinge);
            n = mEar * n;
          }

          // ---------------- 5. HEAD BONE GAZE TRACKING (ON HOVER) ----------------
          // Head region includes cranium, ears, tusks, and trunk in front of neck pivot (-285, 620, 0)
          float headFront = smoothstep(-240.0, -340.0, vOrigPos.x);
          float headHigh  = smoothstep(370.0, 460.0, vOrigPos.y);
          float isTrunkOrTusk = smoothstep(-390.0, -450.0, vOrigPos.x);
          float headMask = clamp(max(headFront * headHigh, isTrunkOrTusk), 0.0, 1.0);

          if (headMask > 0.001) {
            vec3 neckPivot = vec3(-280.0, 620.0, 0.0);
            // Gentle rhythmic head nod during walk cycle
            float walkNod = cos(wc * 2.0) * 0.045 * uWalkWeight;
            // Smooth head turn toward camera/cursor when hovered
            float yaw = uHeadYaw * headMask;
            float pitch = (uHeadPitch + walkNod) * headMask;

            mat3 mHead = rotY(yaw) * rotZ(pitch) * rotX(yaw * 0.18);
            p = neckPivot + mHead * (p - neckPivot);
            n = mHead * n;
          }

          // ---------------- 6. TORSO STRIDE BOB & BREATHING ----------------
          float strideBob = abs(sin(wc)) * 22.0 * uWalkWeight;
          float breath = sin(uTime * 2.1) * 6.0;
          float bodyMask = smoothstep(80.0, 320.0, vOrigPos.y);
          p.y += (strideBob + breath) * bodyMask;

          vWorldNormal = normalize(mat3(modelMatrix) * n);
          vViewNormal = normalize(normalMatrix * n);
          vec4 worldPos = modelMatrix * vec4(p, 1.0);
          vWorldPos = worldPos.xyz;

          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform vec3 uColorInk;
        uniform vec3 uColorPaper;
        uniform vec3 uLightDirection;
        uniform float uTime;

        varying vec3 vOrigPos;
        varying vec3 vWorldNormal;
        varying vec3 vViewNormal;
        varying vec3 vWorldPos;

        // High-frequency spatial hash for organic stochastic pin-dot stippling
        float hash12(vec2 p) {
          vec3 p3 = fract(vec3(p.xyx) * 0.1031);
          p3 += dot(p3, p3.yzx + 33.33);
          return fract((p3.x + p3.y) * p3.z);
        }

        // 4x4 Blue-noise-like ordered matrix blended with stochastic hash
        float getStippleThreshold(vec2 fragCoord) {
          vec2 cell = floor(fragCoord / 1.85);
          int x = int(mod(cell.x, 4.0));
          int y = int(mod(cell.y, 4.0));
          int idx = y * 4 + x;
          float bayer = 0.5;
          if (idx == 0) bayer = 0.0 / 16.0;
          else if (idx == 1) bayer = 8.0 / 16.0;
          else if (idx == 2) bayer = 2.0 / 16.0;
          else if (idx == 3) bayer = 10.0 / 16.0;
          else if (idx == 4) bayer = 12.0 / 16.0;
          else if (idx == 5) bayer = 4.0 / 16.0;
          else if (idx == 6) bayer = 14.0 / 16.0;
          else if (idx == 7) bayer = 6.0 / 16.0;
          else if (idx == 8) bayer = 3.0 / 16.0;
          else if (idx == 9) bayer = 11.0 / 16.0;
          else if (idx == 10) bayer = 1.0 / 16.0;
          else if (idx == 11) bayer = 9.0 / 16.0;
          else if (idx == 12) bayer = 15.0 / 16.0;
          else if (idx == 13) bayer = 7.0 / 16.0;
          else if (idx == 14) bayer = 13.0 / 16.0;
          else bayer = 5.0 / 16.0;

          float noise = hash12(cell);
          return mix(bayer, noise, 0.52);
        }

        void main() {
          vec3 N = normalize(vWorldNormal);
          vec3 VN = normalize(vViewNormal);
          vec3 L = normalize(uLightDirection);

          // Base directional illumination
          float ndotl = dot(N, L) * 0.5 + 0.5;
          float viewFacing = abs(VN.z);

          // 1. Segmented Biomechanical / Skeletal Rings on Neck, Trunk & Legs
          // (Replicates the bold white/black horizontal neck rings & mechanical torso plates in the reference)
          float isNeckOrTrunk = smoothstep(-240.0, -360.0, vOrigPos.x);
          float neckRings = sin((vOrigPos.y * 0.095) + (vOrigPos.x * 0.065));
          float ringPattern = smoothstep(-0.15, 0.25, neckRings) * 0.45 - 0.18;

          // 2. Torso & Limb Skeletal Plate Striations + Deep Underbelly Ink Cavity
          float ribPlates = sin(vOrigPos.x * 0.055 + sin(vOrigPos.y * 0.04) * 1.5) * 0.16;
          float underbellyCavity = smoothstep(540.0, 380.0, vOrigPos.y)
                                 * smoothstep(-140.0, -40.0, vOrigPos.x)
                                 * smoothstep(200.0, 90.0, vOrigPos.x);

          // Inner legs (far side legs Z > 0) darker for instant silhouette leg separation
          float farLegDarken = smoothstep(-15.0, 45.0, vOrigPos.z) * smoothstep(440.0, 320.0, vOrigPos.y) * 0.35;

          // Ivory Tusks (vOrigPos.x < -520, |vOrigPos.z| > 45, vOrigPos.y in [290..460])
          float isTusk = smoothstep(-490.0, -540.0, vOrigPos.x)
                       * smoothstep(38.0, 58.0, abs(vOrigPos.z))
                       * smoothstep(270.0, 320.0, vOrigPos.y)
                       * smoothstep(470.0, 420.0, vOrigPos.y);

          // Combine luminance with high-contrast S-curve
          float luminance = ndotl;
          luminance += mix(ribPlates, ringPattern, isNeckOrTrunk);
          luminance -= underbellyCavity * 0.55;
          luminance -= farLegDarken;

          // Grazing-angle ink contour
          float rimContour = smoothstep(0.0, 0.36, viewFacing);
          luminance *= rimContour;

          // High-contrast crush so deep shadows are solid ink (#141311) and highlights are crisp stipple
          luminance = smoothstep(0.18, 0.84, luminance);

          if (isTusk > 0.5) {
            luminance = viewFacing < 0.28 ? 0.0 : 0.92;
          }

          float threshold = getStippleThreshold(gl_FragCoord.xy);

          if (luminance < threshold) {
            gl_FragColor = vec4(uColorInk, 1.0);
          } else {
            gl_FragColor = vec4(uColorPaper, 1.0);
          }
        }
      `,
    });
  }
}

/**
 * 2. SAVANNA REFERENCE BACKGROUND SHADER
 *
 * Replicates the exact background of media_1793098949617_90b387e7.png:
 * - Upper 76%: Warm cream paper (#ECE7DC) with sparse 1-bit blue-noise stipple dots,
 *   denser stippled acacia/cloud canopy clusters in the upper-right, and subtle horizontal
 *   1px scan-line ticks that scroll with the walk cycle.
 * - Lower 24%: Perspective-foreshortened ground plane with a scrolling labyrinthine /
 *   Turing reaction-diffusion woodcut wave-line dither + dark stippled footprint shadows
 *   underneath the walking Mother and Calf elephants.
 */
export class SavannaReferenceBackgroundMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      depthWrite: false,
      uniforms: {
        uColorInk: { value: new THREE.Color('#141311') },
        uColorPaper: { value: new THREE.Color('#ECE7DC') },
        uScrollOffset: { value: 0.0 },
        uTime: { value: 0.0 },
        uResolution: { value: new THREE.Vector2(1440, 900) },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position.xy, 0.999, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColorInk;
        uniform vec3 uColorPaper;
        uniform float uScrollOffset;
        uniform float uTime;
        uniform vec2 uResolution;

        varying vec2 vUv;

        float hash12(vec2 p) {
          vec3 p3 = fract(vec3(p.xyx) * 0.1031);
          p3 += dot(p3, p3.yzx + 33.33);
          return fract((p3.x + p3.y) * p3.z);
        }

        float valueNoise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          float a = hash12(i);
          float b = hash12(i + vec2(1.0, 0.0));
          float c = hash12(i + vec2(0.0, 1.0));
          float d = hash12(i + vec2(1.0, 1.0));
          return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
        }

        float fbm(vec2 p) {
          float v = 0.0;
          float a = 0.5;
          for (int i = 0; i < 4; i++) {
            v += a * valueNoise(p);
            p *= 2.04;
            a *= 0.5;
          }
          return v;
        }

        void main() {
          vec2 uv = vUv;
          // Pixel grid quantized to 2px cells for crisp 1-bit stipple & wave ridges
          vec2 pixelCoord = floor(gl_FragCoord.xy / 2.0);
          float rnd = hash12(pixelCoord);

          float horizonY = 0.245;

          // ==================== SKY & CANOPY STIPPLE (uv.y >= horizonY) ====================
          if (uv.y >= horizonY) {
            // Base sparse pin-dot stipple across the paper sky (~4.5% dot density)
            float dotDensity = 0.042;

            // Upper-right stippled cloud / acacia canopy cluster (matches reference top-right)
            vec2 canopyUV = vec2(uv.x * 2.8 - uScrollOffset * 0.08, uv.y * 3.2);
            float canopyNoise = fbm(canopyUV * 3.5);
            float topRightMask = smoothstep(0.45, 0.95, uv.x) * smoothstep(0.52, 0.95, uv.y);
            float streakBand = sin(uv.y * 42.0 + fbm(canopyUV * 6.0) * 4.5) * 0.5 + 0.5;
            dotDensity += topRightMask * smoothstep(0.38, 0.78, canopyNoise * streakBand) * 0.34;

            // Subtle upper-left wisp cluster (matches reference top-left)
            float topLeftMask = smoothstep(0.35, 0.08, uv.x) * smoothstep(0.75, 0.98, uv.y);
            dotDensity += topLeftMask * smoothstep(0.55, 0.82, fbm(canopyUV * 5.0)) * 0.28;

            // Faint midrange foliage / dust clouds
            float midCloud = smoothstep(0.35, 0.75, uv.y) * smoothstep(0.85, 0.45, uv.y);
            dotDensity += midCloud * smoothstep(0.58, 0.85, fbm(canopyUV * 2.4)) * 0.11;

            // Occasional crisp horizontal 1px scan-line ticks (matches reference left/horizon)
            float scanRow = floor(pixelCoord.y * 0.5);
            float scanHash = hash12(vec2(scanRow, floor(uScrollOffset * 0.2)));
            float isScanLine = 0.0;
            if (scanHash > 0.965 && (uv.y < 0.36 || (uv.y > 0.72 && uv.y < 0.78))) {
              float seg = valueNoise(vec2(pixelCoord.x * 0.035 + uScrollOffset * 2.0, scanRow));
              if (seg > 0.74) isScanLine = 1.0;
            }

            bool isInk = (rnd < dotDensity) || (isScanLine > 0.5);
            gl_FragColor = vec4(isInk ? uColorInk : uColorPaper, 1.0);
            return;
          }

          // ==================== GROUND LABYRINTH / TURING WAVE DITHER (uv.y < horizonY) ====================
          // Foreshortened ground coordinates
          float depth = clamp((horizonY - uv.y) / horizonY, 0.02, 1.0);
          float perspZ = 1.0 / (depth + 0.18);
          float worldX = (uv.x - 0.5) * perspZ * 3.2 - uScrollOffset * 1.35;
          float worldZ = perspZ * 2.4;

          // Domain-warped reaction-diffusion / woodcut labyrinth wave ridges
          vec2 gCoord = vec2(worldX * 14.0, worldZ * 16.0);
          float warp1 = fbm(gCoord * 0.22);
          float warp2 = fbm(gCoord * 0.45 + vec2(5.2, 1.3));
          float angle = warp1 * 6.2831;
          vec2 dir = vec2(cos(angle), sin(angle));
          float wave = sin(dot(gCoord, dir) * 1.65 + warp2 * 5.5);

          // Convert wave into crisp 1-bit modulated ridges + stipple
          float groundDarkness = 0.34;

          // Contact shadow & footprint blotches directly under Mother Elephant (center-right)
          // and Calf Elephant (center-left)
          vec2 motherFootUV = vec2(0.55, 0.145);
          vec2 calfFootUV = vec2(0.27, 0.155);

          float distMother = length((uv - motherFootUV) / vec2(0.15, 0.048));
          float distCalf   = length((uv - calfFootUV) / vec2(0.095, 0.036));

          float shadowBlotch = max(
            smoothstep(1.1, 0.15, distMother) * (0.45 + 0.35 * fbm(gCoord * 0.6)),
            smoothstep(1.1, 0.15, distCalf) * (0.42 + 0.35 * fbm(gCoord * 0.6))
          );

          // Individual dark pebble/footprint specks in foreground
          float pebbles = smoothstep(0.76, 0.88, fbm(vec2(worldX * 9.0, worldZ * 7.0))) * 0.38 * smoothstep(0.0, 0.4, depth);

          groundDarkness += shadowBlotch + pebbles;

          // Soft transition right at the horizon line
          float horizonFade = smoothstep(0.0, 0.12, depth);
          groundDarkness *= horizonFade;

          float waveThreshold = (wave * 0.5 + 0.5) * 0.72 + rnd * 0.28;
          bool isGroundInk = waveThreshold < groundDarkness;

          gl_FragColor = vec4(isGroundInk ? uColorInk : uColorPaper, 1.0);
        }
      `,
    });
  }
}
