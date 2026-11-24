// Realidad aumentada con el marcador Hiro + tus manos
// El animal aparece parado sobre el marcador Hiro (como en index.html) y MediaPipe Hand Landmarker
// (el mismo modelo .task del cuaderno de Python) sigue los 21 puntos de cada mano en la misma imagen.
// Las zonas del animal (cabeza, pico, panza...) se proyectan desde el marcador a la pantalla, así que
// siguen al pingüino aunque muevas el papel o la cámara (en Python eran coordenadas fijas).
//
//   👆 Tocar:      la punta del índice entra rápido al animal → reacciona y muestra otro dato
//   🖐️ Acariciar:  la mano abierta se mueve encima → se queda quieto, se balancea y suelta corazones
//   🤏 Dar comida: haz la pinza (pulgar + índice) → aparece una anchoveta; llévala al pico
//   ✊ Levantar:   cierra la mano en puño sobre el animal → lo agarras; ábrela para soltarlo
//   👋 Saludar:    mano abierta de lado a lado, lejos del animal → te mira y te responde
//
// Las manos se dibujan con una "piel" de RV (holograma, guante o robot): botón 🧤.
// Sin detector también se prueba con el mouse o el dedo: clic = tocar, arrastrar = acariciar,
// mantener presionado sobre el animal = agarrarlo.
// Si la mano tapa el marcador, el animal se queda en su sitio un momento (SOSTENER_S).
// Toca el estado (arriba a la izquierda) o abre la página con ?diag para ver el diagnóstico.
//
// Este archivo se carga después de sketch.js y reemplaza su setup() y draw().

const MP_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14';
const MODELO_LOCAL = 'modelos/hand_landmarker.task';
const MODELO_WEB = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

// zonas que se pueden tocar, en "píxeles" del modelo de cada animal: [nombre, x, y, z, radio]
const ZONAS = {
  pinguino: [['cabeza', 0, 14, 0.5, 4], ['pico', 0, 13.4, 6, 2.2], ['panza', 0, 6, 0.5, 5.5]],
  nutria:   [['cabeza', 0, 4.5, 7.6, 3.2], ['lomo', 0, 3.2, 0, 4.5], ['cola', 0, 2.8, -8, 2.8]],
  lobo:     [['cabeza', 0, 12.6, 5.6, 4.6], ['lomo', 0, 5.6, 0, 5.6], ['cadera', 0, 2.5, -5.5, 4]],
  zarcillo: [['cabeza', 0, 6.3, 3.2, 2.7], ['lomo', 0, 3.8, 0, 3.6]],
};
const NOMBRE_CORTO = { pinguino: 'pingüino', nutria: 'nutria', lobo: 'lobo marino', zarcillo: 'zarcillo' };
const ARTICULO = { pinguino: 'el', nutria: 'la', lobo: 'el', zarcillo: 'el' };
const HITOS = {
  pinguino: ['Al pingüino le gusta', 'El pingüino aletea de alegría', '¡El pingüino te adora! 💛'],
  nutria:   ['A la nutria le gusta', 'La nutria se relaja', '¡La nutria te adora! 💛'],
  lobo:     ['Al lobo marino le gusta', 'El lobo marino cierra los ojitos', '¡El lobo marino te adora! 💛'],
  zarcillo: ['Al zarcillo le gusta', 'El zarcillo esponja las plumas', '¡El zarcillo te adora! 💛'],
};
const IDS = ['pinguino', 'nutria', 'lobo', 'zarcillo'];
const EST = {};   // estado de cada animal
for (const id of IDS) EST[id] = {
  rutaT: 0, quieto: 0, feliz: 0, carino: 0, hito: 0, atento: -9, zonas: [], dentro: new Map(), ultimoToque: -9, ultimoCorazon: 0,
  come: -9, comidas: 0,
  modo: 'ruta',            // 'ruta' | 'agarrado' | 'cae' | 'vuelve'
  pos: null, vy: 0, desde: null, vueltaT: 0, agarre: null, vela: 0, base: null, esc: 1,
};

// Si el marcador se tapa (por ejemplo, con la mano), el animal se queda anclado en la última posición buena:
const ANCLA_S = 3;         // segundos sin marcador y sin manos
const ANCLA_MANO_S = 30;   // segundos sin marcador mientras haya una mano a la vista (o lo tengas agarrado)
const GRAVEDAD = 1800;     // mm/s² (el animal cae rápido, como un juguete)
const SKINS = ['holo', 'guante', 'robot', 'ninguno'];
const SKIN_NOMBRE = { holo: 'Holograma', guante: 'Guante', robot: 'Robot', ninguno: 'Sin piel' };

let video, capa, ctx, lienzo, piel, pctx, detector = null, espejo = false, verPuntos = false, skin = 'holo';
let detectorEstado = 'cargando';   // 'cargando' | 'ok' | 'error'
const detectorInfo = { modelo: '', delegate: '', creando: false };
let ultimoVistoT = -1e9;           // última vez que se vio el marcador (s)
let manos = [], manosPrev = new Map();
const costo = { ms: 0, ultimoVideoT: -1, ultimaDet: 0 };
const L = { x: 0, y: 0, kx: 1, ky: 1 };   // lienzo de p5 (escalado en "cover") → pantalla
let CAM = null;                           // posición de la cámara en coordenadas de la escena (mm)
const ERRORES = [];                       // para el diagnóstico
let errorCamara = '';
const inicioT = performance.now();

// =====================================================================
// p5
// =====================================================================

function setup() {
  for (const id of ['estado', 'ficha', 'ficha-animal', 'ficha-cient', 'ficha-badge', 'ficha-tag',
    'ficha-titulo', 'ficha-texto', 'ficha-num', 'ficha-hint', 'animales', 'toast', 'carino', 'carino-txt', 'diag']) el[id] = document.getElementById(id);
  const hash = location.hash.slice(1);
  let guardado = null, skinGuardado = null;
  try { guardado = localStorage.getItem('animal'); skinGuardado = localStorage.getItem('skin'); } catch (e) {}
  if (INFO[hash]) actual = hash; else if (INFO[guardado]) actual = guardado;
  if (SKINS.includes(skinGuardado)) skin = skinGuardado;
  crearBotones();
  elegir(actual);
  vigilarErrores();

  // sin HTTPS el celular no deja usar la cámara: avisarlo claro en vez de quedarse en negro
  if (!window.isSecureContext || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    errorCamara = 'La cámara necesita HTTPS: abre la página con https:// (en la PC sirve http://localhost)';
    anotarError(errorCamara);
  }

  // RA: el mismo arranque que index.html (sketch.js)
  NyAR.createARCanvas(this, { fit: 'cover' });
  cam = NyAR.createCamera(this);               // trasera en el celular, webcam en la PC
  ar = new NyAR.MultiMarker(this, width, height);
  if (MI_IMAGEN) {
    ar.setConfidenceThreshold(0.7);
    loadImage(MI_IMAGEN, img => { imgMarcador = img; ar.addARMarker(img, TAMANO_MM); });
  } else {
    ar.addARMarker('hiro', TAMANO_MM);
    ar.setConfidenceThreshold(0.45);   // acepta el Hiro un poco tapado (los saltos falsos los filtra actualizarPose)
  }
  ar.setLostDelay(5);
  escucharGiro();
  // en la PC la webcam te mira: en espejo, mover la mano a la derecha la mueve a la derecha en pantalla
  espejo = !esCelular();
  ar.setMirror(espejo);

  textureMode(NORMAL);
  prepararTexturas();
  armarAtlas();

  video = cam.elt;   // MediaPipe lee el mismo video que el detector del marcador
  lienzo = document.querySelector('canvas.p5Canvas');
  capa = document.getElementById('capa');
  ctx = capa.getContext('2d');
  piel = document.createElement('canvas');   // las manos se pintan aquí opacas y luego se mezclan
  pctx = piel.getContext('2d');
  ajustarCapa();
  punteroComoMano(lienzo);

  document.getElementById('puntos').addEventListener('click', e => {
    verPuntos = !verPuntos;
    e.currentTarget.setAttribute('aria-pressed', String(verPuntos));
  });
  const bEspejo = document.getElementById('espejo');
  bEspejo.setAttribute('aria-pressed', String(espejo));
  bEspejo.addEventListener('click', () => {
    espejo = !espejo;
    ar.setMirror(espejo);
    bEspejo.setAttribute('aria-pressed', String(espejo));
    camCuadro.dibujar = true;
  });
  const bSkin = document.getElementById('skin');
  bSkin.title = 'Piel de las manos: ' + SKIN_NOMBRE[skin];
  bSkin.addEventListener('click', () => {
    skin = SKINS[(SKINS.indexOf(skin) + 1) % SKINS.length];
    try { localStorage.setItem('skin', skin); } catch (e) {}
    bSkin.title = 'Piel de las manos: ' + SKIN_NOMBRE[skin];
    avisar('🧤 Manos: ' + SKIN_NOMBRE[skin]);
  });
  const bModo = document.getElementById('modo');
  let modoGuardado = null;
  try { modoGuardado = localStorage.getItem('modo'); } catch (e) {}
  ponerModoPalma(/[?&]palma/.test(location.search) || modoGuardado === 'palma', true);
  bModo.addEventListener('click', () => ponerModoPalma(!modoPalma));
  el.estado.addEventListener('click', () => { el.diag.hidden = !el.diag.hidden; actualizarDiag(); });
  document.getElementById('diag-cerrar').addEventListener('click', () => { el.diag.hidden = true; });
  if (/[?&]diag/.test(location.search)) el.diag.hidden = false;
  setInterval(actualizarDiag, 500);

  cargarDetector();
}

function esCelular() { return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent)); }

function draw() {
  const t = millis() / 1000, dt = min(0.1, deltaTime / 1000);
  if (ar.error) { background(0); return estado('error', 'Error de RA: ' + ar.error.message); }
  if (!ar.ready) { background(0); return estado('', 'Cargando motor de RA…'); }
  if (!detectar()) {   // (sketch.js) la cámara todavía no entrega imagen
    background(0);
    if (errorCamara) return estado('error', errorCamara + ' (toca aquí)');
    if (performance.now() - inicioT > 8000) return estado('error', 'La cámara no entrega imagen: revisa el permiso (toca aquí)');
    return estado('', 'Acepta el permiso de la cámara');
  }
  medirLienzo();
  detectarManos();
  if (modoPalma) return dibujarModoPalma(t, dt);   // 🖐️ modo extra: el animal sobre tu mano (sin Hiro)

  actualizarPose(t);
  const marcador = ar.isDetected(0);
  if (marcador) { ultimoVistoT = t; visto = true; }
  const conMano = !!puntero || manos.some(m => t - m.t < 0.35);
  const agarrando = IDS.some(id => EST[id].modo === 'agarrado');
  const perdido = t - ultimoVistoT;
  const tapado = !marcador && visto && !!POSE.mat && (perdido < ANCLA_S || ((conMano || agarrando) && perdido < ANCLA_MANO_S));
  const hay = (marcador && !!POSE.mat) || tapado;
  POSE_VISTA = poseActual();
  CAM = POSE_VISTA ? rayo(0, 0).o : null;

  if (camCuadro.dibujar) {   // solo se redibuja la escena 3D cuando llega un cuadro nuevo de la cámara
    camCuadro.dibujar = false;
    background(0);
    ar.applyCamera();
    ar.drawBackground();
    if (hay) {
      push();
      applyMatrix(...matrizP5(POSE_VISTA));   // como ar.beginTransform(0), pero con la pose filtrada/anclada
      push();
      noStroke();
      rotateX(HALF_PI);   // +Y arriba, +Z hacia quien mira
      luces();
      if (actual === 'todos') {
        escenaManos('lobo',     t, { x: 0,   z: -24, escala: 0.85, desfase: 0 });
        escenaManos('pinguino', t, { x: -24, z: 12,  escala: 0.5,  desfase: 3.1 });
        escenaManos('nutria',   t, { x: 24,  z: 16,  escala: 0.55, desfase: 6.3 });
        escenaManos('zarcillo', t, { x: 0,   z: 28,  escala: 0.6,  desfase: 2.0 });
      } else {
        escenaManos(actual, t, { x: 0, z: 0, escala: 1, desfase: 0 });
      }
      pop();
      pop();
    }
  }
  if (!hay) for (const id of IDS) EST[id].zonas = [];   // sin marcador no hay nada que tocar

  interactuar(t, dt, hay);
  dibujarCapa(t, dt);
  actualizarFicha();

  if (!hay) estado('', visto ? 'Busca otra vez el marcador Hiro' : 'Apunta la cámara al marcador Hiro');
  else if (tapado) estado('ok', GIRO ? '✋ Marcador tapado: lo sostengo en su sitio' : '✋ Marcador tapado: no muevas mucho la cámara');
  else if (detectorEstado === 'cargando') estado('', 'Cargando detector de manos…');
  else if (detectorEstado === 'error') estado('error', 'Sin detector de manos: usa el dedo (toca aquí)');
  else {
    const n = manos.filter(m => t - m.t < 0.35).length;
    estado('ok', n ? `✋ ${n === 1 ? 'Mano detectada' : '2 manos'} · ${round(costo.ms)} ms` : `${INFO[actual].nombre}: acerca tu mano`);
  }
}

function windowResized() { ajustarCapa(); }   // (nyar4p5 ya reajusta el lienzo)
function ajustarCapa() {
  const d = min(2, devicePixelRatio || 1);
  capa.width = piel.width = innerWidth * d; capa.height = piel.height = innerHeight * d;
  ctx.setTransform(d, 0, 0, d, 0, 0);
  pctx.setTransform(d, 0, 0, d, 0, 0);
}
// el lienzo de la RA tiene tamaño fijo (640×480 o 480×640) y se amplía con CSS para llenar la pantalla
function medirLienzo() {
  const r = lienzo.getBoundingClientRect();
  L.x = r.left; L.y = r.top; L.kx = r.width / width; L.ky = r.height / height;
}
function lienzoAPantalla(x, y) { return [L.x + x * L.kx, L.y + y * L.ky]; }

// (los toques los maneja punteroComoMano; esto evita el tap de sketch.js)
function touchStarted(e) { return !e || !e.target || e.target.tagName !== 'CANVAS' ? true : false; }
function mousePressed() {}
function keyPressed() {
  if (key === 'p' || key === 'P') document.getElementById('puntos').click();
  if (key === 'h' || key === 'H') document.getElementById('skin').click();
  if ((key === 's' || key === 'S') && imgMarcador) NyAR.saveMarkerImage(imgMarcador, 'marcador-con-borde.png');
}

function escenaManos(id, t, o) {
  const A = ANIMAL[id], E = EST[id];
  let p = recorrido(A, E.rutaT + o.desfase);
  // posición en la escena (mm sobre el marcador) según el modo
  let bx = o.x + o.escala * p.x, by = 0, bz = o.z;
  E.base = { x: bx, z: bz }; E.esc = o.escala; E.U = A.U;
  if (E.modo === 'vuelve') {   // tras caer, vuelve caminando a su paseo
    const k = suave(constrain((t - E.vueltaT) / 1.2, 0, 1));
    bx = lerp(E.desde.x, bx, k); bz = lerp(E.desde.z, bz, k);
    if (k >= 1) E.modo = 'ruta';
  } else if (E.modo !== 'ruta' && E.pos) { bx = E.pos.x; by = E.pos.y; bz = E.pos.z; }
  E.dibujado = { x: bx, y: by, z: bz };   // dónde se dibujó de verdad (para agarrarlo desde ahí)

  const haciaTi = CAM ? Math.atan2(CAM.x - bx, CAM.z - bz) : 0;   // ángulo que mira a la cámara
  const comiendo = t - E.come < 1.3;
  if (E.modo === 'agarrado' || comiendo) {
    p = { x: 0, giro: haciaTi, modo: 'accion', k: 0 };   // en la mano (o comiendo): aletea mirándote
  } else if (E.quieto > 0.01) {   // con una mano cerca deja de caminar y se gira hacia ti
    const q = suave(E.quieto);
    p = { x: p.x, giro: p.giro + angDif(haciaTi, p.giro) * q, modo: q > 0.5 ? 'accion' : p.modo, k: q > 0.5 ? 0 : p.k };
  }
  const s = constrain((t - accionT[id]) / A.dur, 0, 1);
  push();
  if (A.sombra) {   // la sombra queda en el piso y se achica cuanto más alto está
    push();
    translate(bx, 0, bz);
    scale(o.escala);
    rotateY(p.giro);
    const k = 1 / (1 + by / 50);
    scale(k, 1, k);
    sombra(A.sombra[0], A.sombra[1], A.sombra[2]);
    pop();
  }
  translate(bx, by, bz);
  scale(o.escala);
  rotateY(p.giro);
  scale(A.U);
  if (E.modo === 'agarrado') {   // colgando de tu mano: se balancea con el movimiento
    rotateZ(constrain(-E.vela * 0.0006, -0.6, 0.6) + sin(t * 9) * 0.05);
    rotateX(sin(t * 6) * 0.06);
  }
  if (E.feliz > 0.01) {    // acariciado: se mece y se "esponja"
    const f = E.feliz;
    rotateZ(sin(t * 7) * 0.07 * f);
    scale(1 + 0.035 * f * sin(t * 13), 1 - 0.035 * f * sin(t * 13), 1);
  }
  proyectarZonas(id);
  A.dibujar(t + o.desfase, p, s);
  pop();
}

function angDif(a, b) { return ((a - b + PI) % TWO_PI + TWO_PI) % TWO_PI - PI; }

// =====================================================================
// DE 3D A PANTALLA (y de vuelta)
// =====================================================================

function aPantalla3D(x, y, z) {
  const R = _renderer, M = R.uModelMatrix.mat4, V = R.uViewMatrix.mat4, P = R.uPMatrix.mat4;
  const mul = (m, v) => [0, 1, 2, 3].map(i => m[i] * v[0] + m[4 + i] * v[1] + m[8 + i] * v[2] + m[12 + i] * v[3]);
  const c = mul(P, mul(V, mul(M, [x, y, z, 1])));   // matrices en columnas, como WebGL
  if (c[3] <= 0) return null;
  return lienzoAPantalla((c[0] / c[3] + 1) / 2 * width, (1 - c[1] / c[3]) / 2 * height);
}
function proyectarZonas(id) {
  EST[id].zonas = ZONAS[id].map(([nombre, x, y, z, r]) => {
    const c = aPantalla3D(x, y, z), a = aPantalla3D(x + r, y, z), b = aPantalla3D(x, y + r, z);
    if (!c || !a || !b) return null;
    return { nombre, x: c[0], y: c[1], r: max(dist(c[0], c[1], a[0], a[1]), dist(c[0], c[1], b[0], b[1])) };
  }).filter(Boolean);
}

// punto de la pantalla → rayo desde la cámara, en coordenadas de la escena del marcador
// (las de escenaManos: x, y = altura sobre el papel, z; en mm)
function rayo(sx, sy) {
  let x = (sx - L.x) / L.kx;
  const y = (sy - L.y) / L.ky;
  if (ar.mirror) x = width - x;
  const u = x * ar.width / width, v = y * ar.height / height;
  const m = POSE_VISTA || ar.getTransMat(0);   // cámara = R · marcador + t (ARToolKit)
  const RT = q => [m[0] * q[0] + m[4] * q[1] + m[8] * q[2], m[1] * q[0] + m[5] * q[1] + m[9] * q[2], m[2] * q[0] + m[6] * q[1] + m[10] * q[2]];
  const aEscena = q => ({ x: q[0], y: q[2], z: -q[1] });   // marcador → escena (por el rotateX(HALF_PI))
  return { o: aEscena(RT([-m[3], -m[7], -m[11]])), d: aEscena(RT([(u - ar.cx) / ar.fx, (v - ar.cy) / ar.fy, 1])) };
}

// =====================================================================
// ANCLAJE: pose del marcador filtrada, y sostenida cuando la mano lo tapa
// Las poses son la matriz 3×4 de ARToolKit (fila a fila): cámara = R · marcador + t, en mm.
// =====================================================================

const POSE = { mat: null, frame: -1, candidato: null, cuenta: 0, giro0: null };
let POSE_VISTA = null;   // la pose con la que se dibuja este cuadro
let GIRO = null;         // orientación actual del celular (matriz 3×3 dispositivo → mundo), si hay sensor

// cuánto cambió una pose respecto de otra: > 1 es un salto brusco (más de ~15 % de distancia o ~30°)
function diferenciaPose(a, b) {
  const dt = Math.hypot(a[3] - b[3], a[7] - b[7], a[11] - b[11]) / max(50, Math.hypot(b[3], b[7], b[11]));
  let dr = 0;
  for (const i of [0, 1, 2, 4, 5, 6, 8, 9, 10]) dr += (a[i] - b[i]) ** 2;
  return max(dt / 0.15, Math.sqrt(dr) / 0.5);
}

// la rotación mezclada deja de ser rotación pura: se vuelve a enderezar (Gram-Schmidt por columnas)
function ortonormalizar(m) {
  let x = [m[0], m[4], m[8]], y = [m[1], m[5], m[9]];
  const n = v => { const l = Math.hypot(...v) || 1; return v.map(c => c / l); };
  x = n(x);
  const d = x[0] * y[0] + x[1] * y[1] + x[2] * y[2];
  y = n([y[0] - d * x[0], y[1] - d * x[1], y[2] - d * x[2]]);
  const z = [x[1] * y[2] - x[2] * y[1], x[2] * y[0] - x[0] * y[2], x[0] * y[1] - x[1] * y[0]];
  [m[0], m[4], m[8]] = x; [m[1], m[5], m[9]] = y; [m[2], m[6], m[10]] = z;
  return m;
}

// se llama cada cuadro; solo trabaja cuando el detector procesó una imagen nueva
function actualizarPose(t) {
  if (ar.frameCount === POSE.frame) return;
  POSE.frame = ar.frameCount;
  if (!ar.isDetected(0)) return;
  const m = Array.from(ar.getTransMat(0));
  if (!m.every(Number.isFinite)) return;
  if (!POSE.mat) { POSE.mat = m; POSE.giro0 = GIRO && GIRO.slice(); return; }
  const salto = diferenciaPose(m, POSE.mat);
  if (salto > 1) {
    // un dedo tapando parte del Hiro da poses falsas por un instante: el salto se acepta
    // solo si se repite (parecido) en 3 imágenes seguidas, como cuando mueves de verdad la cámara
    if (POSE.candidato && diferenciaPose(m, POSE.candidato) < 0.5) POSE.cuenta++;
    else { POSE.candidato = m; POSE.cuenta = 1; }
    if (POSE.cuenta < 3) return;
    POSE.mat = m;
  } else {
    // movimiento normal: suavizado (menos temblor), más rápido cuanto más se movió
    const k = constrain(0.35 + salto * 0.5, 0.35, 0.85);
    POSE.mat = ortonormalizar(POSE.mat.map((v, i) => lerp(v, m[i], k)));
  }
  POSE.candidato = null; POSE.cuenta = 0;
  POSE.giro0 = GIRO && GIRO.slice();
}

// pose para dibujar: la filtrada; si el marcador está tapado y hay giroscopio, se corrige
// con lo que giró el celular desde la última vez que se vio (así no se "pega" a la pantalla)
function poseActual() {
  if (!POSE.mat) return null;
  if (ar.isDetected(0) || !GIRO || !POSE.giro0) return POSE.mat;
  const K = ejesCamara(), Kt = trasp(K);
  const M = mul3(K, mul3(trasp(GIRO), mul3(POSE.giro0, Kt)));   // cámara antes → cámara ahora
  const R = [POSE.mat[0], POSE.mat[1], POSE.mat[2], POSE.mat[4], POSE.mat[5], POSE.mat[6], POSE.mat[8], POSE.mat[9], POSE.mat[10]];
  const r = mul3(M, R), tt = [POSE.mat[3], POSE.mat[7], POSE.mat[11]];
  const t2 = [0, 1, 2].map(i => M[i * 3] * tt[0] + M[i * 3 + 1] * tt[1] + M[i * 3 + 2] * tt[2]);
  return [r[0], r[1], r[2], t2[0], r[3], r[4], r[5], t2[1], r[6], r[7], r[8], t2[2]];
}

// matriz de ARToolKit → matriz de p5 para applyMatrix (igual que ar.getMarkerMatrix)
function matrizP5(m) {
  return [m[0], m[4], -m[8], 0, m[1], m[5], -m[9], 0, m[2], m[6], -m[10], 0, m[3], m[7], -m[11], 1];
}

// matrices 3×3 fila a fila
function mul3(a, b) {
  const r = new Array(9);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) r[i * 3 + j] = a[i * 3] * b[j] + a[i * 3 + 1] * b[3 + j] + a[i * 3 + 2] * b[6 + j];
  return r;
}
function trasp(a) { return [a[0], a[3], a[6], a[1], a[4], a[7], a[2], a[5], a[8]]; }

// ejes del dispositivo (x derecha, y arriba, z hacia ti) → ejes de la cámara trasera de ARToolKit
// (x derecha, y abajo, z hacia la escena), teniendo en cuenta si la pantalla está girada
function ejesCamara() {
  const ang = ((screen.orientation && screen.orientation.angle) || window.orientation || 0) * Math.PI / 180;
  const c = Math.cos(ang), s = Math.sin(ang);
  return mul3([1, 0, 0, 0, -1, 0, 0, 0, -1], [c, -s, 0, s, c, 0, 0, 0, 1]);
}

// giroscopio del celular (deviceorientation): matriz dispositivo → mundo (fórmula del estándar W3C)
function escucharGiro() {
  if (!esCelular() || typeof DeviceOrientationEvent === 'undefined') return;
  const rad = Math.PI / 180;
  const alGirar = e => {
    if (e.alpha == null || e.beta == null || e.gamma == null) return;
    const cA = Math.cos(e.alpha * rad), sA = Math.sin(e.alpha * rad), cB = Math.cos(e.beta * rad), sB = Math.sin(e.beta * rad);
    const cG = Math.cos(e.gamma * rad), sG = Math.sin(e.gamma * rad);
    GIRO = [cA * cG - sA * sB * sG, -cB * sA, cG * sA * sB + cA * sG,
            cG * sA + cA * sB * sG, cA * cB, sA * sG - cA * cG * sB,
            -cB * sG, sB, cB * cG];
  };
  if (typeof DeviceOrientationEvent.requestPermission === 'function') {
    // iPhone: el permiso del sensor solo se puede pedir después de un toque
    addEventListener('pointerdown', () => {
      DeviceOrientationEvent.requestPermission()
        .then(r => { if (r === 'granted') addEventListener('deviceorientation', alGirar); })
        .catch(() => {});
    }, { once: true });
  } else {
    addEventListener('deviceorientation', alGirar);
  }
}

// =====================================================================
// 🖐️ MODO "EN TU MANO": el animal se para sobre la palma abierta (no hace falta el Hiro)
// Se dibuja con una cámara virtual en la que 1 unidad = 1 píxel del lienzo, justo sobre la palma,
// del tamaño de tu mano y girando con ella. Con la otra mano lo tocas, acaricias o le das comida.
// =====================================================================

let modoPalma = false;
const SOBRE = { lado: null, x: 0, y: 0, s: 0, giro: 0, vis: 0, vistoT: -9 };
const ALTO = { pinguino: 17, nutria: 9, lobo: 16, zarcillo: 10 };   // alto del modelo, en sus "píxeles"
const TAM_PALMA = 2.2;   // alto del animal respecto del tamaño de la mano (muñeca → nudillo del medio)

function idPalma() { return actual === 'todos' ? 'pinguino' : actual; }

function ponerModoPalma(on, inicio) {
  modoPalma = on;
  try { localStorage.setItem('modo', on ? 'palma' : 'hiro'); } catch (e) {}
  const b = document.getElementById('modo');
  b.setAttribute('aria-pressed', String(on));
  b.title = on ? 'Volver al marcador Hiro' : 'Poner al animal sobre tu mano';
  document.body.classList.toggle('palma', on);
  for (const id of IDS) {   // nada queda agarrado ni cayendo al cambiar de modo
    const E = EST[id];
    Object.assign(E, { modo: 'ruta', pos: null, agarre: null, zonas: [] });
  }
  SOBRE.lado = null; SOBRE.vis = 0;
  camCuadro.dibujar = true;
  if (!inicio) avisar(on ? '🖐️ Abre tu mano frente a la cámara' : '🎯 De vuelta al marcador Hiro');
}

// elige la mano que lo sostiene (la misma mientras se vea; una nueva tiene que estar abierta) y la sigue suave
function actualizarPalma(t, dt) {
  const vivas = manos.filter(m => t - m.t < 0.35);
  const m = vivas.find(h => h.lado === SOBRE.lado) || vivas.find(h => h.abierta);
  if (m) {
    const P = m.pts, nueva = m.lado !== SOBRE.lado || SOBRE.vis < 0.05;
    // se para en el centro de la palma, un poco hacia los dedos
    const x = lerp(m.palma[0], P[9][0], 0.25), y = lerp(m.palma[1], P[9][1], 0.25);
    // inclinación: la línea de los nudillos (índice → meñique), sin dejar que quede de cabeza
    let a = Math.atan2(P[17][1] - P[5][1], P[17][0] - P[5][0]);
    if (a > HALF_PI) a -= PI; else if (a < -HALF_PI) a += PI;
    a = constrain(a, -0.7, 0.7);
    if (nueva) {
      Object.assign(SOBRE, { lado: m.lado, x, y, s: m.escala, giro: a });
      accionT[idPalma()] = t;   // llega de un saltito
      avisar(`🖐️ ¡${ARTICULO[idPalma()] === 'la' ? 'La' : 'El'} ${NOMBRE_CORTO[idPalma()]} se subió a tu mano!`);
    } else {
      SOBRE.x = lerp(SOBRE.x, x, 0.55); SOBRE.y = lerp(SOBRE.y, y, 0.55);
      SOBRE.s = lerp(SOBRE.s, m.escala, 0.3); SOBRE.giro = lerp(SOBRE.giro, a, 0.3);
    }
    SOBRE.vistoT = t;
    SOBRE.vis = min(1, SOBRE.vis + dt * 5);
  } else if (t - SOBRE.vistoT > 0.4) {   // sin mano por un momento: se va
    SOBRE.vis = max(0, SOBRE.vis - dt * 4);
    if (SOBRE.vis === 0) SOBRE.lado = null;
  }
}

function dibujarModoPalma(t, dt) {
  actualizarPalma(t, dt);
  const id = idPalma(), visible = SOBRE.vis > 0.01;
  if (camCuadro.dibujar) {
    camCuadro.dibujar = false;
    background(0);
    ar.applyCamera();
    ar.drawBackground();   // la imagen de la cámara, igual que en el modo Hiro
    for (const k of IDS) EST[k].zonas = [];
    if (visible) escenaPalma(id, t);
  }
  if (!visible) for (const k of IDS) EST[k].zonas = [];
  interactuar(t, dt, visible);
  dibujarCapa(t, dt);
  actualizarFicha();
  if (detectorEstado === 'cargando') estado('', 'Cargando detector de manos…');
  else if (detectorEstado === 'error') estado('error', 'Sin detector de manos (toca aquí)');
  else if (!visible) estado('', '🖐️ Abre tu mano frente a la cámara');
  else estado('ok', `${INFO[id].nombre} en tu mano · juega con la otra`);
}

function escenaPalma(id, t) {
  const A = ANIMAL[id], E = EST[id];
  drawingContext.clear(drawingContext.DEPTH_BUFFER_BIT);   // el fondo no tapa al animal
  // cámara virtual: en el plano z = 0, 1 unidad = 1 píxel del lienzo, origen en el centro
  const fov = PI / 3, D = (height / 2) / tan(fov / 2);
  perspective(fov, width / height, D * 0.1, D * 10);
  camera(0, 0, D, 0, 0, 0, 0, 1, 0);
  const cx = (SOBRE.x - L.x) / L.kx - width / 2, cy = (SOBRE.y - L.y) / L.ky - height / 2;
  const aparece = 0.3 + 0.7 * suave(SOBRE.vis);
  const sc = SOBRE.s / L.kx * TAM_PALMA / ALTO[id] * aparece;
  const comiendo = t - E.come < 1.3;
  const p = {
    x: 0, giro: sin(t * 0.7) * 0.35,   // mira a un lado y al otro
    modo: comiendo || E.feliz > 0.3 || t % 5 < 1.2 ? 'accion' : (id === 'pinguino' ? 'quieto' : 'accion'), k: 0.5,
  };
  const s = constrain((t - accionT[id]) / A.dur, 0, 1);
  push();
  noStroke();
  translate(cx, cy, 0);
  rotateZ(SOBRE.giro);
  scale(sc, -sc, sc);   // +Y arriba
  rotateX(0.3);         // un poco desde arriba, para que se vea parado sobre algo
  luces();
  push();               // plataforma de luz bajo sus patas (estilo RV)
  rotateX(HALF_PI);
  fill(120, 220, 255, 70 + 40 * sin(t * 4));
  circle(0, 0, 18);
  fill(190, 245, 255, 120);
  circle(0, 0, 10);
  pop();
  rotateY(p.giro);
  if (E.feliz > 0.01) {
    const f = E.feliz;
    rotateZ(sin(t * 7) * 0.07 * f);
    scale(1 + 0.035 * f * sin(t * 13), 1 - 0.035 * f * sin(t * 13), 1);
  }
  proyectarZonas(id);
  A.dibujar(t, p, s);
  pop();
}

// =====================================================================
// CÁMARA Y DETECTOR DE MANOS
// =====================================================================

let vision = null, archivosVision = null;
async function cargarDetector(soloCPU) {
  if (detectorInfo.creando) return;
  detectorInfo.creando = true;
  detectorEstado = 'cargando';
  try {
    if (!vision) {
      vision = await import(MP_URL + '/vision_bundle.mjs');
      archivosVision = await vision.FilesetResolver.forVisionTasks(MP_URL + '/wasm');
    }
    // primero el modelo local (el mismo del cuaderno de Python); si no se puede abrir
    // (por ejemplo, la página se abrió como archivo o el servidor no lo tiene), el de internet.
    // Primero en la GPU; si el equipo no puede, en el procesador.
    for (const modelo of [MODELO_LOCAL, MODELO_WEB]) for (const delegate of (soloCPU ? ['CPU'] : ['GPU', 'CPU'])) {
      try {
        const d = await vision.HandLandmarker.createFromOptions(archivosVision, {
          baseOptions: { modelAssetPath: modelo, delegate },
          runningMode: 'VIDEO', numHands: 2,
          minHandDetectionConfidence: 0.6, minHandPresenceConfidence: 0.6, minTrackingConfidence: 0.5,
        });
        if (detector) try { detector.close(); } catch (e) {}
        detector = d;
        Object.assign(detectorInfo, { modelo: modelo === MODELO_LOCAL ? 'local' : 'internet', delegate });
        detectorEstado = 'ok';
        return;
      } catch (e) { anotarError(`Detector (${modelo === MODELO_LOCAL ? 'modelo local' : 'modelo web'}, ${delegate}): ${e.message || e}`, true); }
    }
    throw new Error('no se pudo crear el detector de manos');
  } catch (e) {
    detectorEstado = 'error';
    anotarError('Detector de manos: ' + (e.message || e));
  } finally {
    detectorInfo.creando = false;
  }
}

// detecta solo cuando la cámara trae un cuadro nuevo; si el equipo tarda mucho, detecta menos veces
function detectarManos() {
  if (!detector || !video || video.readyState < 2 || !video.videoWidth) return;
  if (video.currentTime === costo.ultimoVideoT) return;
  const ahora = performance.now();
  // equipo lento (celular): deja tiempo para la RA, detectando ~15 o ~10 veces por segundo
  const espera = costo.ms > 60 ? 100 : costo.ms > 28 ? 66 : 0;
  if (ahora - costo.ultimaDet < espera) return;
  costo.ultimoVideoT = video.currentTime;
  costo.ultimaDet = ahora;
  let r;
  try {
    r = detector.detectForVideo(video, ahora);
  } catch (e) {
    // en algunos celulares la GPU falla recién al detectar: se pasa al procesador
    anotarError('Al detectar manos (' + detectorInfo.delegate + '): ' + (e.message || e));
    const eraGPU = detectorInfo.delegate === 'GPU';
    detector = null;
    if (eraGPU) cargarDetector(true); else detectorEstado = 'error';
    return;
  }
  costo.ms = lerp(costo.ms, performance.now() - ahora, 0.15);
  // de coordenadas del video (0..1) a la pantalla, por el mismo camino que la imagen del marcador:
  // recorte centrado que hace nyar4p5 → imagen de proceso → lienzo (con espejo) → pantalla
  const sw = video.videoWidth, sh = video.videoHeight, W = ar.width, H = ar.height;
  let cw = sw, ch = sh;
  if (sw / sh > W / H) cw = sh * W / H; else ch = sw * H / W;
  const aPantalla = lm => {
    const u = (lm.x * sw - (sw - cw) / 2) * W / cw, v = (lm.y * sh - (sh - ch) / 2) * H / ch;
    const [x, y] = ar.imageToScreen(u, v);
    return lienzoAPantalla(x, y);
  };
  construirManos((r.landmarks || []).map((lms, i) => ({
    lado: (r.handednesses && r.handednesses[i] && r.handednesses[i][0] && r.handednesses[i][0].categoryName) || 'mano' + i,
    pts: lms.map(aPantalla),
  })), millis() / 1000);
}

// a partir de los 21 puntos en pantalla: suaviza, mide velocidades y reconoce la forma de la mano
function construirManos(lista, t) {
  const d2 = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  manos = lista.map(({ lado, pts }) => {
    const prev = manosPrev.get(lado);
    if (prev && t - prev.t < 0.3) for (let k = 0; k < 21; k++) {   // suavizado (menos temblor)
      pts[k] = [lerp(prev.pts[k][0], pts[k][0], 0.6), lerp(prev.pts[k][1], pts[k][1], 0.6)];
    }
    const palma = [0, 5, 9, 13, 17].reduce((s, k) => [s[0] + pts[k][0] / 5, s[1] + pts[k][1] / 5], [0, 0]);
    const dt = prev ? max(1e-3, t - prev.t) : 1;
    const vel = prev ? [(palma[0] - prev.palma[0]) / dt, (palma[1] - prev.palma[1]) / dt] : [0, 0];
    const vtips = [4, 8, 12, 16, 20].map(k => prev ? d2(pts[k], prev.pts[k]) / dt : 0);
    const escala = max(1, d2(pts[0], pts[9]));
    const dw = k => d2(pts[k], pts[0]);
    // dedo estirado: la punta está bastante más lejos de la muñeca que la articulación del medio
    const extendido = [8, 12, 16, 20].map(k => dw(k) > dw(k - 2) * 1.15);
    // dedo doblado: la punta quedó más cerca de la muñeca que el nudillo
    const doblado = [8, 12, 16, 20].map(k => dw(k) < dw(k - 3) * 1.1);
    const estirados = extendido.filter(Boolean).length;
    // 🤏 pinza (como PINCH_THRESHOLD en Python, pero relativa al tamaño de la mano):
    // pulgar e índice juntos con el índice hacia adelante (no metido en el puño). Con histéresis.
    const dPinza = d2(pts[4], pts[8]) / escala;
    const pinza = dPinza < (prev && prev.pinza ? 0.5 : 0.33) && dw(8) > dw(5) * 1.05;
    // ✊ puño: casi todos los dedos doblados (para soltar hay que abrir la mano de verdad)
    const puno = !pinza && (prev && prev.puno ? estirados <= 1 : estirados === 0 && doblado.filter(Boolean).length >= 3);
    return {
      lado, pts, palma, vel, vtips, extendido, t, escala, pinza, puno,
      puntoPinza: [(pts[4][0] + pts[8][0]) / 2, (pts[4][1] + pts[8][1]) / 2],
      abierta: estirados >= 3 && !pinza, apunta: extendido[0] && !extendido[1] && !extendido[2] && !pinza,
    };
  });
  manosPrev = new Map(manos.map(m => [m.lado, m]));
}

// el mouse o el dedo en la pantalla también funcionan como una mano (para probar sin detector)
let puntero = null;
function punteroComoMano(cnv) {
  cnv.addEventListener('pointerdown', e => {
    cnv.setPointerCapture(e.pointerId);
    puntero = { x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY, arrastra: false, agarra: false, t: millis() / 1000 };
  });
  cnv.addEventListener('pointermove', e => {
    if (!puntero) return;
    puntero.x = e.clientX; puntero.y = e.clientY;
    if (dist(e.clientX, e.clientY, puntero.x0, puntero.y0) > 12) puntero.arrastra = true;
  });
  const fin = () => { puntero = null; manosPrev.delete('puntero'); };
  cnv.addEventListener('pointerup', fin);
  cnv.addEventListener('pointercancel', fin);
}
function manoPuntero(t) {
  if (!puntero) return null;
  // mantener presionado sin moverse = agarrar; después se puede arrastrar para levantarlo
  if (!puntero.agarra && !puntero.arrastra && t - puntero.t > 0.45) puntero.agarra = true;
  const p = [puntero.x, puntero.y], prev = manosPrev.get('puntero');
  const dt = prev ? max(1e-3, t - prev.t) : 1;
  const vel = prev ? [(p[0] - prev.palma[0]) / dt, (p[1] - prev.palma[1]) / dt] : [0, 0];
  const v = Math.hypot(vel[0], vel[1]);
  const ag = puntero.agarra, arr = puntero.arrastra && !ag;
  const m = {
    lado: 'puntero', raton: true, pts: Array.from({ length: 21 }, () => p), palma: p, vel, vtips: [v, v, v, v, v], t,
    extendido: [!ag, arr, arr, arr], escala: 80, pinza: false, puno: ag, puntoPinza: p,
    abierta: arr, apunta: !arr && !ag,
  };
  manosPrev.set('puntero', m);
  return m;
}

// =====================================================================
// GESTOS
// =====================================================================

const ultimoGesto = { toque: -9, caricia: -9, comida: -9, levanta: -9, saludo: -9 };
const PEZ = new Map();     // lado de la mano → { activa, tiene } (la anchoveta entre los dedos)
const PUNO = new Map();    // lado de la mano → momento en que cerró el puño

function interactuar(t, dt, hay) {
  // (en el modo "en tu mano", la mano que lo sostiene no cuenta: se juega con la otra)
  const fuentes = manos.filter(m => t - m.t < 0.35 && !(modoPalma && m.lado === SOBRE.lado));
  const pm = manoPuntero(t);
  if (pm) fuentes.push(pm);
  const activos = modoPalma ? [idPalma()] : actual === 'todos' ? IDS : [actual];

  if (!modoPalma) agarrar(fuentes, t, dt, activos, hay);
  darComida(fuentes, t, activos);

  for (const id of IDS) {
    const E = EST[id];
    let cerca = false, acaricia = false;
    if (activos.includes(id) && E.modo !== 'agarrado') for (const m of fuentes) {
      if (m.puno && !m.raton) continue;
      // puntos de contacto: el índice si apunta; las puntas estiradas y la palma si está abierta
      const muestras = m.apunta ? [m.pts[8]] : [4, 8, 12, 16, 20].filter((k, j) => j > 0 && m.extendido[j - 1]).map(k => m.pts[k]);
      if (m.abierta) muestras.push(m.palma);
      if (m.pinza) muestras.push(m.puntoPinza);
      let n = 0, punto = null;
      for (const [x, y] of muestras) for (const z of E.zonas) {
        const d = dist(x, y, z.x, z.y);
        if (d < z.r * 2.4) cerca = true;
        if (d < z.r) { n++; punto = punto || [x, y]; break; }
      }
      // 👆 toque: la punta del índice ENTRA rápido a una zona (no la mano abierta, ni la pinza)
      const [ix, iy] = m.pts[8];
      const zi = E.zonas.find(z => dist(ix, iy, z.x, z.y) < z.r);
      const estaba = E.dentro.get(m.lado);
      E.dentro.set(m.lado, !!zi);
      if (zi && !estaba && !m.abierta && !m.pinza && !m.puno && (m.raton || m.vtips[1] > 280) && t - E.ultimoToque > 0.7) tocarAnimal(id, t, ix, iy, zi.nombre);
      // 🖐️ caricia: mano abierta encima del animal y moviéndose (ni quieta ni de un golpe)
      const vp = Math.hypot(m.vel[0], m.vel[1]);
      if (m.abierta && n >= (m.raton ? 1 : 2) && vp > 40 && vp < 2500) {
        acaricia = true;
        const rz = E.zonas.length ? E.zonas[0].r : 50;
        E.carino = min(1, E.carino + vp * dt / (rz * 14));   // ~3 s de caricias llenan el cariño
        if (t - E.ultimoCorazon > 0.14) { soltarCorazon(punto[0], punto[1], vp); E.ultimoCorazon = t; }
      }
    }
    // con una mano cerca (o recién saludado o comiendo) se detiene; si se aleja, sigue su paseo
    const espera = cerca || t < E.atento || t - E.come < 1.3 || E.modo !== 'ruta';
    E.quieto = constrain(E.quieto + (espera ? dt * 4 : -dt * 0.8), 0, 1);
    E.rutaT += dt * (1 - E.quieto);
    E.feliz = constrain(E.feliz + (acaricia ? dt * 3 : -dt * 0.7), 0, 1);
    if (acaricia) ultimoGesto.caricia = t;
    else E.carino = max(0, E.carino - dt * 0.03);
    hitosCarino(id, t);
  }
  saludos(fuentes, t, activos);
}

function tocarAnimal(id, t, x, y, zona) {
  const E = EST[id];
  E.ultimoToque = t;
  accionT[id] = t;                                   // la misma reacción que al tocar la pantalla
  ultimoGesto.toque = t;
  chispas(x, y);
  dato = (dato + 1) % INFO[actual].datos.length;     // y muestra el siguiente dato
  mostrarDato();
  const parte = { cabeza: 'la cabeza', cola: 'la cola', panza: 'la panza', pico: 'el pico' }[zona] || 'el lomo';
  avisar(`👆 ¡Boop! Le tocaste ${parte} ${ARTICULO[id] === 'la' ? 'a la' : 'al'} ${NOMBRE_CORTO[id]}`);
}

// 🤏 pinza = una anchoveta entre los dedos; si llega al pico, se la come
function darComida(fuentes, t, activos) {
  const vistas = new Set();
  for (const m of fuentes) {
    vistas.add(m.lado);
    const P = PEZ.get(m.lado) || { activa: false, tiene: false, x: 0, y: 0, tam: 20 };
    PEZ.set(m.lado, P);
    if (m.pinza && !P.activa) { P.activa = true; P.tiene = true; }   // al cerrar la pinza aparece el pez
    if (!m.pinza && P.activa) {                                       // al abrirla, si no se lo comió, se cae
      P.activa = false;
      if (P.tiene) soltarPez(P.x, P.y, P.tam, true);
      P.tiene = false;
    }
    if (!P.tiene) continue;
    [P.x, P.y] = m.puntoPinza;
    P.tam = max(14, m.escala * 0.5);
    for (const id of activos) {
      const E = EST[id], pico = E.zonas.find(z => z.nombre === 'pico');
      if (!pico || E.modo === 'agarrado') continue;
      if (dist(P.x, P.y, pico.x, pico.y) < max(pico.r * 1.8, 22)) {
        P.tiene = false;   // hasta volver a abrir y cerrar la pinza no hay otro pez
        comer(id, t, pico.x, pico.y, P.tam);
        break;
      }
    }
  }
  for (const [lado, P] of PEZ) if (!vistas.has(lado)) {   // la mano desapareció con el pez
    if (P.tiene) soltarPez(P.x, P.y, P.tam, true);
    PEZ.delete(lado);
  }
}

function comer(id, t, x, y, tam) {
  const E = EST[id];
  E.come = t;
  E.comidas++;
  E.carino = min(1, E.carino + 0.25);
  ultimoGesto.comida = t;
  soltarPez(x, y, tam, false);   // el pez se achica dentro del pico
  for (let k = 0; k < 4; k++) soltarCorazon(x + random(-15, 15), y - 10, 300);
  avisar(E.comidas === 1 ? `🐟 ¡Ñam! ${ARTICULO[id] === 'la' ? 'La' : 'El'} ${NOMBRE_CORTO[id]} se comió la anchoveta`
    : `🐟 ¡Ñam! Van ${E.comidas} anchovetas`);
}

// ✊ puño sobre el animal = agarrarlo; mientras sigas en puño lo llevas; al abrir la mano cae
function agarrar(fuentes, t, dt, activos, hay) {
  const enUso = new Set();
  for (const m of fuentes) {
    if (m.puno) { if (!PUNO.has(m.lado)) PUNO.set(m.lado, t); } else PUNO.delete(m.lado);
  }
  for (const id of IDS) {
    const E = EST[id];
    if (E.modo !== 'agarrado') continue;
    const m = fuentes.find(f => f.lado === E.agarre.lado);
    if (!m || !m.puno || !hay || !activos.includes(id)) { soltar(id, t); continue; }
    enUso.add(m.lado);
    const r = rayo(m.palma[0], m.palma[1]), G = E.agarre;
    // la mano mueve al animal sobre un plano vertical frente a la cámara: subir la mano lo sube,
    // de lado lo mueve de lado; acercar la mano a la cámara (se ve más grande) acerca el plano
    G.k = lerp(G.k, constrain(G.esc0 / m.escala, 0.6, 1.5), 0.3);
    const A = { x: r.o.x + (G.C0.x - r.o.x) * G.k, y: r.o.y + (G.C0.y - r.o.y) * G.k, z: r.o.z + (G.C0.z - r.o.z) * G.k };
    const hit = cortePlano(r, A, G.n);
    if (!hit) continue;
    const c = { x: hit.x + G.off.x, y: hit.y + G.off.y, z: hit.z + G.off.z };
    // nunca por debajo de la mesa ni demasiado lejos del marcador
    const lejos = Math.hypot(c.x, c.z), lim = lejos > 160 ? 160 / lejos : 1;
    const nuevo = { x: c.x * lim, y: constrain(c.y - G.h, 0, 220), z: c.z * lim };
    if (nuevo.y > 15 && !G.avisado) { G.avisado = true; avisar(`✊ ¡Levantaste ${ARTICULO[id] === 'la' ? 'a la' : 'al'} ${NOMBRE_CORTO[id]}!`); }
    E.vy = (nuevo.y - E.pos.y) / max(dt, 1e-3);
    E.pos = { x: lerp(E.pos.x, nuevo.x, 0.6), y: lerp(E.pos.y, nuevo.y, 0.6), z: lerp(E.pos.z, nuevo.z, 0.6) };
    E.vela = lerp(E.vela, m.vel[0], 0.2);
    ultimoGesto.levanta = t;
  }
  for (const m of fuentes) {
    if (!m.puno || enUso.has(m.lado) || t - PUNO.get(m.lado) > 0.6) continue;   // el puño tiene que cerrarse AHÍ
    for (const id of activos) {
      const E = EST[id];
      if (E.modo === 'agarrado' || !E.zonas.length || !E.dibujado) continue;
      if (!E.zonas.some(z => dist(m.palma[0], m.palma[1], z.x, z.y) < z.r * 1.4)) continue;
      // centro del cuerpo en la escena y punto del rayo de la mano a esa misma distancia de la cámara
      const p0 = { ...E.dibujado };
      const h = ZONAS[id].reduce((s, z) => s + z[2], 0) / ZONAS[id].length * E.U * E.esc;
      const C = { x: p0.x, y: p0.y + h, z: p0.z };
      const r = rayo(m.palma[0], m.palma[1]);
      // normal del plano: hacia la cámara, horizontal (si la cámara está casi encima, de frente a ella)
      const v = { x: r.o.x - C.x, y: r.o.y - C.y, z: r.o.z - C.z };
      const lv = Math.hypot(v.x, v.y, v.z), lh = Math.hypot(v.x, v.z);
      const n = lh > lv * 0.35 ? { x: v.x / lh, y: 0, z: v.z / lh } : { x: v.x / lv, y: v.y / lv, z: v.z / lv };
      const hit = cortePlano(r, C, n);
      if (!hit) continue;
      E.agarre = { lado: m.lado, esc0: m.escala, k: 1, h, C0: C, n, off: { x: C.x - hit.x, y: C.y - hit.y, z: C.z - hit.z } };
      E.modo = 'agarrado';
      E.pos = p0; E.vy = 0; E.vela = 0;
      E.quieto = 1;
      ultimoGesto.levanta = t;
      enUso.add(m.lado);
      avisar(`✊ Agarraste ${ARTICULO[id] === 'la' ? 'a la' : 'al'} ${NOMBRE_CORTO[id]}: sube la mano`);
      break;
    }
  }
  // caída y aterrizaje
  for (const id of IDS) {
    const E = EST[id];
    if (E.modo !== 'cae') continue;
    E.vy -= GRAVEDAD * dt;
    E.pos.y += E.vy * dt;
    if (E.pos.y <= 0) {
      E.pos.y = 0;
      if (E.vy < -250) { E.vy = -E.vy * 0.3; accionT[id] = t; }   // rebotito
      else { E.modo = 'vuelve'; E.desde = { x: E.pos.x, z: E.pos.z }; E.vueltaT = t; }
    }
  }
}

// dónde corta el rayo r al plano que pasa por A con normal n (null si va casi paralelo)
function cortePlano(r, A, n) {
  const den = n.x * r.d.x + n.y * r.d.y + n.z * r.d.z;
  if (Math.abs(den) < 1e-6) return null;
  const s = (n.x * (A.x - r.o.x) + n.y * (A.y - r.o.y) + n.z * (A.z - r.o.z)) / den;
  if (s <= 0) return null;
  return { x: r.o.x + r.d.x * s, y: r.o.y + r.d.y * s, z: r.o.z + r.d.z * s };
}

function soltar(id, t) {
  const E = EST[id];
  E.agarre = null;
  E.vy = min(E.vy, 400);
  E.modo = 'cae';
  if (E.pos && E.pos.y > 15) avisar(`🪂 ¡Allá va ${ARTICULO[id]} ${NOMBRE_CORTO[id]}!`);
}

function hitosCarino(id, t) {
  const E = EST[id], n = E.carino >= 1 ? 3 : E.carino >= 0.66 ? 2 : E.carino >= 0.33 ? 1 : 0;
  if (n > E.hito) {
    avisar(HITOS[id][n - 1]);
    if (n === 3) {                // ¡lleno! reacción especial y lluvia de corazones
      accionT[id] = t;
      for (const z of E.zonas) for (let k = 0; k < 6; k++) soltarCorazon(z.x + random(-z.r, z.r), z.y + random(-z.r, z.r), 600);
      E.carino = 0.8;
      E.hito = 2;
      return;
    }
  }
  if (n < E.hito) E.hito = n;
  else E.hito = max(E.hito, n);
}

// 👋 saludo: la palma abierta va y viene de lado a lado (3 cambios de dirección en ~1.3 s), lejos del animal
const recorridoPalma = new Map();
function saludos(fuentes, t, activos) {
  for (const m of fuentes) {
    if (m.raton || !m.abierta) { recorridoPalma.delete(m.lado); continue; }
    const cerca = activos.some(id => EST[id].zonas.some(z => dist(m.palma[0], m.palma[1], z.x, z.y) < z.r * 2.4));
    const h = (recorridoPalma.get(m.lado) || []).filter(([ti]) => t - ti < 1.3);
    h.push([t, m.palma[0]]);
    recorridoPalma.set(m.lado, h);
    if (cerca || h.length < 6 || t - ultimoGesto.saludo < 3) continue;
    const A = max(25, m.escala * 0.35);   // vaivén mínimo, proporcional al tamaño de la mano
    let giros = 0, dir = 0, ref = h[0][1];
    for (const [, x] of h) {   // cuenta los cambios de dirección de la palma
      if (dir === 0) { if (abs(x - ref) > A) { dir = x > ref ? 1 : -1; ref = x; } }   // la primera dirección
      else if (dir > 0) { if (x > ref) ref = x; else if (ref - x > A) { giros++; dir = -1; ref = x; } }
      else { if (x < ref) ref = x; else if (x - ref > A) { giros++; dir = 1; ref = x; } }
    }
    if (giros >= 2) {
      ultimoGesto.saludo = t;
      recorridoPalma.delete(m.lado);
      activos.forEach((id, k) => { accionT[id] = t + k * 0.15; EST[id].atento = t + 3; });
      avisar(actual === 'todos' ? '👋 ¡Hola! Todos te saludan' : `👋 ¡Hola! El ${NOMBRE_CORTO[actual]} te saluda`);
    }
  }
}

// =====================================================================
// CAPA 2D: manos con piel de RV, pez, corazones y chispas
// =====================================================================

const PARTICULAS = [];
const CORAZON = ['01100110', '11111111', '11111111', '01111110', '00111100', '00011000'];
// anchoveta pixelada (mira a la izquierda): o = lomo oscuro, x = cuerpo plateado, e = ojo
const ANCHOVETA = ['....oooo...o', '.oooooooooxo', 'exxxxxxxxxx.', '.xxxxxxxxxxx', '....xxxx...x'];
const COLOR_PEZ = { o: '#3f6681', x: '#b9cfdc', e: '#10161c' };

function soltarCorazon(x, y, v) {
  PARTICULAS.push({ tipo: 'corazon', x, y, vx: random(-30, 30), vy: -random(60, 110) - min(v, 800) * 0.05, t0: millis() / 1000, vida: 1.4, tam: random(14, 22) });
  if (PARTICULAS.length > 80) PARTICULAS.shift();
}
function chispas(x, y) {
  for (let k = 0; k < 14; k++) {
    const a = k / 14 * TWO_PI, v = random(120, 260);
    PARTICULAS.push({ tipo: 'chispa', x, y, vx: cos(a) * v, vy: sin(a) * v, t0: millis() / 1000, vida: 0.55, tam: random(4, 7) });
  }
}
// cae = true: se resbaló de los dedos; false: se achica dentro del pico
function soltarPez(x, y, tam, cae) {
  PARTICULAS.push({ tipo: 'pez', x, y, vx: cae ? random(-40, 40) : 0, vy: cae ? -60 : 0, cae, t0: millis() / 1000, vida: cae ? 0.9 : 0.35, tam });
}

function dibujarPez(g, x, y, tam, giro) {
  const c = tam / ANCHOVETA[0].length;
  g.save();
  g.translate(x, y);
  g.rotate(giro || 0);
  for (let fy = 0; fy < ANCHOVETA.length; fy++) for (let fx = 0; fx < ANCHOVETA[fy].length; fx++) {
    const ch = ANCHOVETA[fy][fx];
    if (ch === '.') continue;
    g.fillStyle = COLOR_PEZ[ch];
    g.fillRect(-tam / 2 + fx * c, (fy - ANCHOVETA.length / 2) * c, c + 0.5, c + 0.5);
  }
  g.restore();
}

const HUESOS = [[0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8], [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16], [13, 17], [17, 18], [18, 19], [19, 20], [0, 17]];

function dibujarCapa(t, dt) {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  const activos = actual === 'todos' ? IDS : [actual];
  if (verPuntos) {   // zonas del animal (punteadas), como en el cuaderno
    ctx.setLineDash([5, 5]); ctx.lineWidth = 1.5; ctx.font = '600 12px system-ui, sans-serif'; ctx.textAlign = 'center';
    for (const id of activos) for (const z of EST[id].zonas) {
      ctx.strokeStyle = z.nombre === 'pico' ? 'rgba(80, 220, 120, .9)' : 'rgba(255, 179, 92, .9)';
      ctx.beginPath(); ctx.arc(z.x, z.y, z.r, 0, TWO_PI); ctx.stroke();
      ctx.fillStyle = z.nombre === 'pico' ? '#50dc78' : '#ffb35c'; ctx.fillText(z.nombre, z.x, z.y - z.r - 4);
    }
    ctx.setLineDash([]);
  }
  for (const m of manos) {
    if (t - m.t > 0.35) continue;
    // la mano que sostiene al animal va "detrás" de él: su piel se dibuja muy tenue para no taparlo
    const base = modoPalma && m.lado === SOBRE.lado && SOBRE.vis > 0.01;
    if (skin !== 'ninguno') dibujarPiel(m, t, base ? 0.12 : 1);
    if (base) continue;
    if (verPuntos) {   // los 21 puntos, como en el cuaderno de Python
      ctx.strokeStyle = 'rgba(80, 160, 255, .9)'; ctx.lineWidth = 2;
      ctx.beginPath();
      for (const [a, b] of HUESOS) { ctx.moveTo(...m.pts[a]); ctx.lineTo(...m.pts[b]); }
      ctx.stroke();
      for (let k = 0; k < 21; k++) {
        ctx.fillStyle = k === 8 ? '#ff3b3b' : k === 4 ? '#ff3bff' : '#2ecc71';
        ctx.beginPath(); ctx.arc(m.pts[k][0], m.pts[k][1], 4, 0, TWO_PI); ctx.fill();
      }
    } else if (skin === 'ninguno') {     // discreto: solo las yemas que cuentan para tocar
      ctx.fillStyle = 'rgba(255, 255, 255, .85)';
      const puntas = m.apunta ? [8] : [8, 12, 16, 20].filter((k, j) => m.extendido[j]);
      for (const k of puntas) { ctx.beginPath(); ctx.arc(m.pts[k][0], m.pts[k][1], 5, 0, TWO_PI); ctx.fill(); }
      const acariciando = t - ultimoGesto.caricia < 0.15;
      ctx.strokeStyle = acariciando ? 'rgba(255, 110, 140, .95)' : 'rgba(255, 255, 255, .5)';
      ctx.lineWidth = acariciando ? 3 : 2;
      ctx.beginPath(); ctx.arc(m.palma[0], m.palma[1], max(10, m.escala * 0.35), 0, TWO_PI); ctx.stroke();
    }
    // etiqueta del gesto, como el putText del cuaderno
    const gesto = m.pinza ? '🤏 PINZA' : m.puno ? '✊ PUÑO' : m.abierta ? '🖐️ ABIERTA' : m.apunta ? '👆 SEÑALA' : '';
    if (gesto) {
      ctx.font = '700 12px system-ui, sans-serif'; ctx.textAlign = 'center';
      const [gx, gy] = [m.palma[0], m.palma[1] + m.escala * 0.9];
      ctx.fillStyle = 'rgba(0, 0, 0, .55)';
      const w = ctx.measureText(gesto).width + 14;
      ctx.beginPath(); ctx.roundRect ? ctx.roundRect(gx - w / 2, gy - 11, w, 20, 10) : ctx.rect(gx - w / 2, gy - 11, w, 20); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.fillText(gesto, gx, gy + 4);
    }
  }
  // la anchoveta entre los dedos
  for (const P of PEZ.values()) if (P.tiene) dibujarPez(ctx, P.x, P.y, P.tam, sin(t * 10) * 0.12);
  // corazones (pixelados, como los animales), chispas y peces sueltos
  for (let k = PARTICULAS.length - 1; k >= 0; k--) {
    const p = PARTICULAS[k], e = (t - p.t0) / p.vida;
    if (e >= 1) { PARTICULAS.splice(k, 1); continue; }
    p.x += p.vx * dt; p.y += p.vy * dt;
    if (p.tipo === 'chispa') { p.vx *= 0.9; p.vy = p.vy * 0.9 + 200 * dt; }
    if (p.tipo === 'pez' && p.cae) p.vy += 900 * dt;
    ctx.globalAlpha = p.tipo === 'pez' ? 1 - e * e * e : 1 - e * e;
    if (p.tipo === 'corazon') {
      const c = p.tam / 8;
      ctx.fillStyle = '#ff4d6d';
      for (let fy = 0; fy < CORAZON.length; fy++) for (let fx = 0; fx < 8; fx++)
        if (CORAZON[fy][fx] === '1') ctx.fillRect(p.x - p.tam / 2 + fx * c, p.y - p.tam / 2 + fy * c, c + 0.5, c + 0.5);
    } else if (p.tipo === 'pez') {
      dibujarPez(ctx, p.x, p.y, p.cae ? p.tam : p.tam * (1 - e), p.cae ? e * 2.5 : 0);
    } else {
      ctx.fillStyle = '#ffd166';
      ctx.fillRect(p.x - p.tam / 2, p.y - p.tam / 2, p.tam, p.tam);
    }
  }
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------------
// PIELES DE MANO (RV): la mano se arma con "cápsulas" sobre los 21 puntos y una palma.
// Se pinta opaca en un lienzo aparte y se mezcla de una vez (así no se notan las uniones).
// ---------------------------------------------------------------------
const DEDOS = [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16], [17, 18, 19, 20]];
const ANCHO_DEDO = [0.30, 0.25, 0.26, 0.24, 0.20];   // relativo al tamaño de la mano
const PALMA = [0, 1, 5, 9, 13, 17];
const PIEL = {
  holo:   { borde: '#bff4ff', relleno: '#2fb8ff', alfa: 0.5, grosorBorde: 0.05 },
  guante: { borde: '#1d1d22', relleno: '#f6f4ef', alfa: 1, grosorBorde: 0.07 },
  robot:  { borde: '#20262d', relleno: '#8796a5', alfa: 1, grosorBorde: 0.06 },
};

function formaMano(g, m, extra, color) {
  const P = m.pts, w = m.escala;
  g.lineCap = 'round'; g.lineJoin = 'round';
  g.strokeStyle = g.fillStyle = color;
  // palma
  g.lineWidth = w * 0.18 + extra * 2;
  g.beginPath();
  PALMA.forEach((k, i) => i ? g.lineTo(P[k][0], P[k][1]) : g.moveTo(P[k][0], P[k][1]));
  g.closePath(); g.fill(); g.stroke();
  // dedos: cada falange un poco más delgada que la anterior
  DEDOS.forEach((d, j) => {
    for (let i = 0; i < d.length - 1; i++) {
      const a = P[d[i]], b = P[d[i + 1]];
      g.lineWidth = w * ANCHO_DEDO[j] * (1 - i * 0.1) + extra * 2;
      g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
    }
  });
  // muñeca / puño del guante
  const dx = P[0][0] - P[9][0], dy = P[0][1] - P[9][1], n = Math.hypot(dx, dy) || 1;
  const ux = dx / n, uy = dy / n;
  g.lineWidth = w * (skin === 'guante' ? 0.75 : 0.5) + extra * 2;
  g.beginPath();
  g.moveTo(P[0][0] - ux * w * 0.05, P[0][1] - uy * w * 0.05);
  g.lineTo(P[0][0] + ux * w * 0.3, P[0][1] + uy * w * 0.3);
  g.stroke();
}

function dibujarPiel(m, t, alfa = 1) {
  const S = PIEL[skin], P = m.pts, w = m.escala, b = w * S.grosorBorde;
  pctx.clearRect(0, 0, innerWidth, innerHeight);
  formaMano(pctx, m, b, S.borde);    // contorno
  formaMano(pctx, m, 0, S.relleno);  // relleno
  ctx.globalAlpha = S.alfa * alfa;
  ctx.drawImage(piel, 0, 0, innerWidth, innerHeight);
  ctx.globalAlpha = alfa;
  dibujarDetallesPiel(m, t, P, w);
  ctx.globalAlpha = 1;
}

function dibujarDetallesPiel(m, t, P, w) {

  ctx.lineCap = 'round';
  if (skin === 'holo') {
    // líneas de energía por los huesos, articulaciones brillantes y yemas que se encienden
    const pulso = 0.6 + 0.4 * sin(t * 6);
    ctx.strokeStyle = `rgba(200, 250, 255, ${0.55 * pulso + 0.2})`; ctx.lineWidth = max(1.5, w * 0.03);
    ctx.beginPath();
    for (const [a, c] of HUESOS) { ctx.moveTo(...P[a]); ctx.lineTo(...P[c]); }
    ctx.stroke();
    for (let k = 1; k < 21; k++) {
      const yema = k % 4 === 0, r = yema ? w * 0.07 : w * 0.035;
      ctx.fillStyle = yema ? (m.pinza && (k === 4 || k === 8) ? '#ffe066' : '#e9fdff') : 'rgba(170, 240, 255, .9)';
      ctx.beginPath(); ctx.arc(P[k][0], P[k][1], max(2, r), 0, TWO_PI); ctx.fill();
    }
    if (m.puno) { ctx.strokeStyle = 'rgba(255, 224, 102, .9)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(m.palma[0], m.palma[1], w * 0.6, 0, TWO_PI); ctx.stroke(); }
  } else if (skin === 'guante') {
    // tres costuras en el dorso, como un guante de caricatura
    ctx.strokeStyle = 'rgba(29, 29, 34, .55)'; ctx.lineWidth = max(1.5, w * 0.035);
    for (const k of [5, 9, 13]) {
      const a = P[0], c = P[k];
      ctx.beginPath();
      ctx.moveTo(lerp(a[0], c[0], 0.35), lerp(a[1], c[1], 0.35));
      ctx.lineTo(lerp(a[0], c[0], 0.7), lerp(a[1], c[1], 0.7));
      ctx.stroke();
    }
  } else if (skin === 'robot') {
    // articulaciones con tornillos y yemas con luz
    for (let k = 0; k < 21; k++) {
      const yema = k > 0 && k % 4 === 0;
      const r = max(2.5, w * (k === 0 ? 0.12 : yema ? 0.06 : 0.075));
      ctx.fillStyle = yema ? (m.pinza && (k === 4 || k === 8) ? '#ffe066' : '#ff9f43') : '#4a5561';
      ctx.beginPath(); ctx.arc(P[k][0], P[k][1], r, 0, TWO_PI); ctx.fill();
      if (!yema) { ctx.fillStyle = '#c9d3dc'; ctx.beginPath(); ctx.arc(P[k][0] - r * 0.3, P[k][1] - r * 0.3, r * 0.35, 0, TWO_PI); ctx.fill(); }
    }
  }
}

// =====================================================================
// INTERFAZ
// =====================================================================

let fichaCarino = -1;
function actualizarFicha() {
  const t = millis() / 1000;
  const c = actual === 'todos' ? max(...IDS.map(id => EST[id].carino)) : EST[actual].carino;
  const pct = round(c * 100);
  if (pct !== fichaCarino) { fichaCarino = pct; el.carino.style.width = pct + '%'; el['carino-txt'].textContent = pct + ' %'; }
  for (const s of document.querySelectorAll('.gestos span')) s.classList.toggle('activo', t - ultimoGesto[s.dataset.g] < 0.8);
}

let toastTimer = 0;
function avisar(msg) {
  el.toast.textContent = msg;
  el.toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.toast.classList.remove('visible'), 2200);
}

// (reemplaza al de sketch.js: aquí la tarjeta siempre está visible)
let ultimoEstadoManos = '';
function estado(tipo, msg) {
  if (tipo + msg === ultimoEstadoManos) return;
  ultimoEstadoManos = tipo + msg;
  el.estado.innerHTML = `<span class="dot ${tipo}"></span><span></span>`;
  el.estado.lastChild.textContent = msg;
}

// ---------------------------------------------------------------------
// DIAGNÓSTICO (para ver por qué algo no anda en un celular)
// ---------------------------------------------------------------------
function anotarError(msg, silencioso) {
  const t = ((performance.now() - inicioT) / 1000).toFixed(1);
  if (ERRORES.length && ERRORES[ERRORES.length - 1].msg === msg) return;
  ERRORES.push({ t, msg: String(msg) });
  if (ERRORES.length > 12) ERRORES.shift();
  if (!silencioso && el.diag) el.diag.hidden = false;
}
function vigilarErrores() {
  addEventListener('error', e => anotarError(`${e.message} (${(e.filename || '').split('/').pop()}:${e.lineno})`));
  addEventListener('unhandledrejection', e => anotarError('Promesa: ' + ((e.reason && e.reason.message) || e.reason)));
  const ce = console.error.bind(console);   // nyar4p5 avisa los problemas de cámara por consola
  console.error = (...a) => {
    ce(...a);
    const msg = a.map(x => (x && x.message) || String(x)).join(' ');
    if (/^(INFO|I\d{4}|W\d{4})/.test(msg)) return;   // registros internos de MediaPipe: no son errores
    const camara = /nyar4p5/.test(msg);
    if (camara && /c[aá]mara/i.test(msg)) errorCamara = msg.replace(/^nyar4p5:\s*/, '');
    anotarError(msg, !camara);
  };
}
function actualizarDiag() {
  if (!el.diag || el.diag.hidden) return;
  const v = video || {}, s = v.srcObject, tr = s && s.getVideoTracks ? s.getVideoTracks()[0] : null, cfg = tr && tr.getSettings ? tr.getSettings() : {};
  const lineas = [
    `Navegador: ${navigator.userAgent.replace(/^Mozilla\/5\.0 /, '').slice(0, 90)}`,
    `HTTPS / contexto seguro: ${window.isSecureContext ? 'sí' : 'NO'} (${location.protocol})`,
    `Cámara: ${tr ? `${tr.readyState}, ${cfg.facingMode || '?'}` : 'sin abrir'} · video ${v.videoWidth || 0}×${v.videoHeight || 0}`,
    `RA: ${ar ? (ar.error ? 'error: ' + ar.error.message : ar.ready ? 'lista' : 'cargando') : '—'} · lienzo ${width}×${height} · marcador ${ar && ar.isExist && ar.isExist(0) ? 'visible' : 'no'}`,
    `Detector de manos: ${detectorEstado}${detectorInfo.delegate ? ` (${detectorInfo.delegate}, modelo ${detectorInfo.modelo})` : ''} · ${round(costo.ms)} ms`,
    `Manos ahora: ${manos.filter(m => millis() / 1000 - m.t < 0.35).length} · cuadros por segundo: ${round(frameRate())}`,
    `Espejo: ${espejo ? 'sí' : 'no'} · piel: ${SKIN_NOMBRE[skin]} · giroscopio: ${GIRO ? 'sí' : 'no'}`,
    `Marcador visto hace: ${ultimoVistoT > 0 ? (millis() / 1000 - ultimoVistoT).toFixed(1) + ' s' : '—'} · saltos descartados en espera: ${POSE.cuenta}`,
    '',
    ERRORES.length ? 'Errores:' : 'Sin errores.',
    ...ERRORES.map(e => `  [${e.t} s] ${e.msg}`),
  ];
  el.diag.querySelector('pre').textContent = lineas.join('\n');
}

// para probar sin cámara desde la consola o un test: pruebaManos.simular([[x, y] × 21, ...])
window.pruebaManos = {
  EST, accionT, PEZ,
  simular(listaPts) { construirManos(listaPts.map((pts, i) => ({ lado: 'prueba' + i, pts })), millis() / 1000); },
  zonas: id => EST[id].zonas,
};
