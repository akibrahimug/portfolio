/**
 * Ink portrait renderer — raw WebGL1, no dependencies.
 *
 * A low-res "wetness" field (a 2D canvas the pointer paints into, decaying each frame) drives a
 * fragment shader that displaces and bleeds the portrait's pigment where it's wet. With a dry
 * field the output is the image, pixel for pixel — so the canvas can replace the <img> invisibly.
 *
 * Renders only while something is wet or animating; idles otherwise.
 */

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`

const FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uImg;
uniform sampler2D uWet;
uniform vec2 uScale;
uniform float uTime;
// Protected zone (the face), in image UV from the top-left: center.xy, radius.zw.
uniform vec4 uProtect;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int k = 0; k < 4; k++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
  return v;
}
// object-fit: contain, transparent outside the image
vec4 img(vec2 uv) {
  vec2 u = (uv - 0.5) * uScale + 0.5;
  if (u.x < 0.0 || u.x > 1.0 || u.y < 0.0 || u.y > 1.0) return vec4(0.0);
  return texture2D(uImg, u);
}
void main() {
  float w = texture2D(uWet, vUv).r;
  vec4 src = img(vUv);
  if (w < 0.002) { gl_FragColor = src; return; }

  // Only the ink runs. Red hex, near-black brushwork and bare paper take the full effect;
  // the person (skin, shirt) keeps a quarter of it so a face never melts.
  vec3 rgb = src.a > 0.0 ? src.rgb / src.a : vec3(0.0);
  float red = smoothstep(0.15, 0.4, rgb.r - max(rgb.g, rgb.b));
  float dark = 1.0 - smoothstep(0.1, 0.24, max(rgb.r, max(rgb.g, rgb.b)));
  float ink = max(max(red, dark * src.a), 1.0 - src.a);
  vec2 iuv = (vUv - 0.5) * uScale + 0.5;
  vec2 q = (vec2(iuv.x, 1.0 - iuv.y) - uProtect.xy) / uProtect.zw;
  float face = 1.0 - smoothstep(0.75, 1.15, length(q));
  w *= mix(0.2, 1.0, ink) * (1.0 - face * 0.92);

  // Flow: streaky (brush-like) noise, slowly drifting while wet.
  vec2 p = vUv * vec2(3.0, 7.0);
  vec2 n = vec2(fbm(p + uTime * 0.22), fbm(p + vec2(4.7, 1.3) - uTime * 0.22)) - 0.5;
  // Pigment also runs downhill a little while wet, like ink on tilted paper.
  vec2 d = n * w * 0.36 + vec2(0.0, w * 0.025);

  vec4 c = img(vUv + d);
  // Bleed: pigment spreads into the wet area — take the denser of two upstream samples.
  vec4 b1 = img(vUv + d * 1.8);
  vec4 b2 = img(vUv - d * 1.2 + vec2(0.0, w * 0.03));
  vec4 bleed = b1.a > b2.a ? b1 : b2;
  c = mix(c, bleed, smoothstep(0.15, 0.9, w) * step(c.a, bleed.a) * 0.85);
  // Wet pigment reads a touch darker, like ink before it dries.
  c.rgb *= 1.0 - w * 0.18;
  // Feathered, granular edges where wet: alpha breaks up along the paper grain.
  float grain = noise(vUv * 260.0);
  c *= mix(1.0, smoothstep(0.0, 0.55, grain + 0.55 - w * 0.35), smoothstep(0.2, 1.0, w));
  gl_FragColor = c;
}`

const WET_W = 72
const WET_H = 90
const DECAY = 0.03 // per frame at 60fps (~1.5s to dry)

export type Ink = {
  /** Pointer position in the canvas box, 0..1 from the top-left. */
  pointer(x: number, y: number): void
  pointerLeave(): void
  /** One automatic brush swipe — signals the portrait is interactive. */
  swipe(): void
  resize(): void
  setVisible(visible: boolean): void
  destroy(): void
}

/** An ellipse in image space (0..1 from the top-left) where the ink barely moves. */
export type ProtectZone = { x: number; y: number; rx: number; ry: number }

export function createInk(
  canvas: HTMLCanvasElement,
  source: HTMLImageElement,
  {
    protect,
    onReady,
    onLost,
  }: { protect?: ProtectZone; onReady: () => void; onLost: () => void },
): Ink | null {
  const gl = canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false })
  if (!gl) return null

  const compile = (type: number, src: string) => {
    const sh = gl.createShader(type)!
    gl.shaderSource(sh, src)
    gl.compileShader(sh)
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh) ?? 'shader')
    return sh
  }
  let prog: WebGLProgram
  try {
    prog = gl.createProgram()!
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT))
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null
  } catch {
    return null
  }
  gl.useProgram(prog)

  // One oversized triangle covers the viewport.
  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const aPos = gl.getAttribLocation(prog, 'aPos')
  gl.enableVertexAttribArray(aPos)
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

  const uScale = gl.getUniformLocation(prog, 'uScale')
  const uTime = gl.getUniformLocation(prog, 'uTime')
  gl.uniform1i(gl.getUniformLocation(prog, 'uImg'), 0)
  gl.uniform1i(gl.getUniformLocation(prog, 'uWet'), 1)
  const z = protect ?? { x: -10, y: -10, rx: 0.01, ry: 0.01 }
  gl.uniform4f(gl.getUniformLocation(prog, 'uProtect'), z.x, z.y, z.rx, z.ry)

  const texture = (unit: number) => {
    const t = gl.createTexture()
    gl.activeTexture(gl.TEXTURE0 + unit)
    gl.bindTexture(gl.TEXTURE_2D, t)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    return t
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)

  texture(0)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source)
  const imgAspect = source.naturalWidth / source.naturalHeight

  // Wetness field: a tiny 2D canvas, uploaded each frame it changes.
  const wet = document.createElement('canvas')
  wet.width = WET_W
  wet.height = WET_H
  const wctx = wet.getContext('2d')!
  texture(1)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, wet)

  let energy = 0
  let raf = 0
  let visible = true
  let last: { x: number; y: number } | null = null
  let swipeUntil = 0
  let lost = false
  const t0 = performance.now()

  const splat = (x: number, y: number, r: number, strength: number) => {
    const px = x * WET_W
    const py = y * WET_H
    const g = wctx.createRadialGradient(px, py, 0, px, py, r)
    g.addColorStop(0, `rgba(255,255,255,${strength})`)
    g.addColorStop(1, 'rgba(255,255,255,0)')
    wctx.globalCompositeOperation = 'lighter'
    wctx.fillStyle = g
    wctx.fillRect(px - r, py - r, r * 2, r * 2)
    energy = 1
  }
  const stroke = (x: number, y: number) => {
    if (last) {
      const dx = x - last.x
      const dy = y - last.y
      const dist = Math.hypot(dx, dy)
      const steps = Math.max(1, Math.ceil(dist * 40))
      const r = 8 + Math.min(dist * 80, 9)
      for (let s = 1; s <= steps; s++) splat(last.x + (dx * s) / steps, last.y + (dy * s) / steps, r, 0.3)
    } else {
      splat(x, y, 9, 0.35)
    }
    last = { x, y }
    kick()
  }

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr))
    const h = Math.max(1, Math.round(canvas.clientHeight * dpr))
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w
      canvas.height = h
    }
    gl.viewport(0, 0, w, h)
    const boxAspect = w / h
    // contain: scale the axis the image doesn't fill
    if (imgAspect > boxAspect) gl.uniform2f(uScale, 1, imgAspect / boxAspect)
    else gl.uniform2f(uScale, boxAspect / imgAspect, 1)
    draw()
  }

  const draw = () => {
    if (lost) return
    gl.uniform1f(uTime, (performance.now() - t0) / 1000)
    gl.activeTexture(gl.TEXTURE1)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, wet)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }

  const frame = (now: number) => {
    raf = 0
    if (now < swipeUntil) {
      // Ease along a gentle arc from lower-left to upper-right across the portrait.
      const t = 1 - (swipeUntil - now) / 1100
      const e = 1 - Math.pow(1 - t, 3)
      stroke(0.12 + e * 0.78, 0.78 - e * 0.5 + Math.sin(e * Math.PI) * -0.08)
    } else if (swipeUntil) {
      swipeUntil = 0
      last = null
    }
    // Dry out
    wctx.globalCompositeOperation = 'destination-out'
    wctx.fillStyle = `rgba(0,0,0,${DECAY})`
    wctx.fillRect(0, 0, WET_W, WET_H)
    energy *= 1 - DECAY
    draw()
    if (energy < 0.004 && !swipeUntil) {
      // Fully dry: clear residue so the idle frame is exactly the image.
      wctx.clearRect(0, 0, WET_W, WET_H)
      draw()
      return
    }
    kick()
  }
  const kick = () => {
    if (!raf && visible && !lost) raf = requestAnimationFrame(frame)
  }

  const onLostEvt = (e: Event) => {
    e.preventDefault()
    lost = true
    cancelAnimationFrame(raf)
    onLost()
  }
  canvas.addEventListener('webglcontextlost', onLostEvt)

  resize()
  // The dry first frame equals the image — safe to swap it in.
  onReady()

  return {
    pointer: stroke,
    pointerLeave: () => {
      last = null
    },
    swipe: () => {
      last = null
      swipeUntil = performance.now() + 1100
      kick()
    },
    resize,
    setVisible: (v) => {
      visible = v
      if (v) kick()
      else {
        cancelAnimationFrame(raf)
        raf = 0
      }
    },
    destroy: () => {
      cancelAnimationFrame(raf)
      canvas.removeEventListener('webglcontextlost', onLostEvt)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    },
  }
}
