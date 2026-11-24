// Marcona en 3D / realidad aumentada — maqueta de bloques (voxel) con lugares para visitar
// p5.js + nyar4p5js
//
// Dos formas de verla (selector arriba):
//   · Vista 3D: sin cámara. Arrastra para girar, rueda o pellizco para acercar.
//   · Con marcador Hiro: apunta la cámara al marcador y la maqueta aparece encima.
// Elige un lugar arriba (o con ‹ ›). Tocar la maqueta muestra el siguiente dato del lugar.
// El mapa es ilustrativo: respeta el orden de la costa, pero no la escala real.

const TAMANO_MM = 80; // lado del marcador impreso, en milímetros

// =====================================================================
// LUGARES  (x = este, z = sur, en mm sobre la maqueta; el mar queda al suroeste)
// =====================================================================

const CAT = {
  ciudad:    { nombre: 'Ciudad',      color: [231, 111, 81] },
  naturaleza:{ nombre: 'Naturaleza',  color: [46, 160, 90] },
  playa:     { nombre: 'Playa',       color: [32, 150, 200] },
  sabores:   { nombre: 'Gastronomía', color: [230, 160, 40] },
  industria: { nombre: 'Industria',   color: [120, 110, 150] },
};

const LUGARES = [
  { id: 'ciudad', boton: '🏘️ Ciudad', nombre: 'Ciudad de Marcona', sub: 'Nasca, Ica', cat: 'ciudad', x: -20, z: 2,
    datos: [
      { tag: 'Dónde está', titulo: 'En la costa sur de Ica',
        texto: 'Marcona es un distrito de la provincia de Nasca, en la región Ica, a unos 500 km al sur de Lima.' },
      { tag: 'Historia', titulo: 'Distrito desde 1955',
        texto: 'Fue creado el 2 de mayo de 1955 por la Ley 12314. Su aniversario se celebra con desfile escolar, danzas típicas y conciertos.' },
      { tag: 'Punto de partida', titulo: 'Todo empieza en la plaza',
        texto: 'Las visitas guiadas gratuitas del Sernanp a Punta San Juan salen de la plaza de Armas de Marcona.' },
    ] },
  { id: 'caleta', boton: '🦀 Caleta y sabores', nombre: 'Caleta y gastronomía', sub: 'Del mar a la mesa', cat: 'sabores', x: -30, z: -7,
    datos: [
      { tag: 'Sabores', titulo: 'Cocina de erizo y pulpo',
        texto: 'Erizo, pulpo, lapas y cochayuyo (un alga) son protagonistas de la cocina marconense.' },
      { tag: 'Para probar', titulo: 'La carta de Marcona',
        texto: 'Ceviche de erizo, picante de cochayuyo, pulpo a la parrilla, causa de pulpo al olivo y lapa arrebozada.' },
      { tag: 'Postre', titulo: 'Chocoteja de erizo',
        texto: 'Un dulce único: la chocoteja iqueña, pero con erizo caramelizado con leche en lugar de pecana.' },
      { tag: 'Pesca responsable', titulo: 'Erizo con veda',
        texto: 'Hay 18 asociaciones de pescadores artesanales. La extracción de erizo rojo está prohibida de enero a marzo.' },
    ] },
  { id: 'punta', boton: '🐧 Punta San Juan', nombre: 'Punta San Juan', sub: 'Reserva guanera', cat: 'naturaleza', x: -42, z: 3,
    datos: [
      { tag: 'Área protegida', titulo: 'A 10 minutos de la ciudad',
        texto: 'Es parte de la Reserva Nacional Sistema de Islas, Islotes y Puntas Guaneras, una península a unos 10 minutos de Marcona.' },
      { tag: 'Fauna', titulo: 'Cuna del pingüino de Humboldt',
        texto: 'Desde su mirador se observan pingüinos de Humboldt y lobos marinos. Por eso a Marcona la llaman la cuna del pingüino de Humboldt.' },
      { tag: 'Mar frío', titulo: 'Un mar lleno de vida',
        texto: 'Sus aguas frías y llenas de nutrientes la hacen una de las zonas marinas más productivas del mundo.' },
      { tag: 'Cuándo ir', titulo: 'Mejor en verano',
        texto: 'La mejor época es el verano, en especial febrero. Se observa desde el mirador, sin acercarse a las colonias.' },
    ] },
  { id: 'rocas', boton: '🐢 Tortuga y Elefante', nombre: 'La Tortuga y el Elefante', sub: 'Rocas talladas', cat: 'naturaleza', x: -12, z: 23,
    datos: [
      { tag: 'Formaciones', titulo: 'Esculturas del viento',
        texto: 'El viento ha erosionado enormes rocas hasta darles forma de tortuga y de elefante: el famoso "elefante marconense".' },
      { tag: 'Dato', titulo: 'Una playa con su nombre',
        texto: 'Entre las playas de Marcona hay una que se llama, justamente, El Elefante.' },
    ] },
  { id: 'leones', boton: '🦭 Los Leones', nombre: 'Playa Los Leones', sub: 'Lobos marinos', cat: 'playa', x: 1, z: 37,
    datos: [
      { tag: 'Playa', titulo: 'La playa de los lobos marinos',
        texto: 'Es conocida por los lobos marinos que descansan en sus rocas. Antes fue zona de loberas; hoy es una playa turística.' },
      { tag: 'Buen visitante', titulo: 'Mira, pero de lejos',
        texto: 'Mantén distancia, no les des comida y llévate tu basura: así los lobos marinos siguen viniendo.' },
    ] },
  { id: 'playas', boton: '🏍️ 19 playas', nombre: 'Circuito de 19 playas', sub: 'En cuatrimoto', cat: 'playa', x: 10, z: 47,
    datos: [
      { tag: 'Circuito', titulo: '19 playas de aguas cristalinas',
        texto: 'Marcona tiene un circuito de 19 playas, con un inmenso desierto al lado. Se puede recorrer en cuatrimoto.' },
      { tag: 'Algunas', titulo: 'Nombres para tu lista',
        texto: 'Playa Hermosa, La Herradura, Acapulco, Los Pingüinos, El Elefante, Los Leones y La Lobera, entre otras.' },
      { tag: 'Deporte', titulo: 'Marcona Wind Trail',
        texto: 'Cada año, a fines de octubre, se corre por el desierto esta carrera de trail con recorridos de 10 a 100 km.' },
    ] },
  { id: 'lobera', boton: '🌊 La Lobera', nombre: 'La Lobera', sub: 'Playa alejada', cat: 'playa', x: 17, z: 57,
    datos: [
      { tag: 'Playa', titulo: 'Más lejos, más lobos',
        texto: 'Es una de las playas más alejadas de la ciudad y un buen lugar para avistar lobos marinos.' },
      { tag: 'Ten en cuenta', titulo: 'Desierto junto al mar',
        texto: 'Lleva agua, gorra y protector solar: alrededor solo hay desierto, mucho sol y viento.' },
    ] },
  { id: 'eolico', boton: '🌬️ Parques eólicos', nombre: 'Parques eólicos', sub: 'Energía del viento', cat: 'industria', x: 47, z: 0,
    datos: [
      { tag: 'Viento', titulo: 'Tierra de vientos fuertes',
        texto: 'Marcona tiene vientos fuertes y constantes. En sus pampas funcionan los parques eólicos Marcona y Tres Hermanas.' },
      { tag: 'Energía limpia', titulo: 'Del viento a tu casa',
        texto: 'Cada aerogenerador transforma la fuerza del viento en electricidad que llega a la red nacional.' },
    ] },
  { id: 'mina', boton: '⛏️ Mina de hierro', nombre: 'Mina de hierro', sub: 'Historia minera', cat: 'industria', x: 34, z: -30, lejos: 12,   // se mira desde el borde del tajo
    datos: [
      { tag: 'Historia', titulo: 'Una ciudad del hierro',
        texto: 'Marcona creció alrededor de la minería de hierro. Hoy la mina la opera la empresa Shougang Hierro Perú.' },
      { tag: 'Puerto', titulo: 'Bahía de San Nicolás',
        texto: 'El mineral se embarca hacia el mundo desde el puerto de la bahía de San Nicolás, al norte de la ciudad.' },
    ] },
  { id: 'sanfernando', boton: '🏔️ San Fernando', nombre: 'Reserva Nacional San Fernando', sub: 'A 1 h de Marcona', cat: 'naturaleza', x: 6, z: -54,
    datos: [
      { tag: 'Área protegida', titulo: 'Donde los Andes llegan al mar',
        texto: 'A una hora de Marcona, poco explorada: aquí los cerros andinos bajan directo hasta el océano.' },
      { tag: 'Punta Gallinazo', titulo: 'La catedral de roca',
        texto: 'Tiene formaciones rocosas como "la catedral" y colonias de lobos marinos y pingüinos.' },
      { tag: 'Punta Caballas', titulo: 'La playa más hermosa',
        texto: 'Por Punta Caballas se entra a la reserva; su ensenada de San Fernando es el principal atractivo.' },
    ] },
];
const L_ = id => LUGARES.find(L => L.id === id);

// =====================================================================
// ESTADO
// =====================================================================

let ar, cam = null;
let modo = '3d';              // '3d' | 'ra'
let actual = 0, dato = 0;
let visto = false;
let trozos = [];               // geometría estática del terreno (en varios trozos)
let marcoGeo = [];             // marco de madera de la maqueta
let numTex = [], texPlaca, texNorte;
let tocadoT = -1e9;            // última vez que se tocó (para el salto del pin)
let texCara, texCaraNpc;

// el explorador (el usuario) que camina de un lugar a otro
const yo = {
  x: 0, z: 0, y: 0, giro: 0, giroObj: 0,
  ruta: null, largos: null, total: 0, s: 0, vel: 9,
  caminando: false, llegoT: -1e9, pasoS: 0, lado: 1, ritmo: 1,
};
const HUELLAS = [];            // { x, z, y, giro, t, lado }
let tour = false, tourSig = 0; // recorrido automático
const PAUSA_DATO = 6;          // segundos por dato durante el recorrido
const PERSONAS = [];           // vecinos y turistas

const orb = { yaw: -1.35, pitch: 0.72, dist: 230, yawObj: -1.35, pitchObj: 0.72, distObj: 230, tx: 0, ty: 0, tz: 0 };
const el = {};

// =====================================================================
// TERRENO
// =====================================================================

const N = 72;           // celdas por lado
const C = 1.7;          // mm por celda  →  ~122 mm de maqueta
const MITAD = N * C / 2;
const NIVEL = 0.6;      // mm por escalón de altura
const MAR_Y = 1.5;      // superficie del mar
const MARCO = 7;        // ancho del marco de madera

const ALT = [];         // altura (mm) de la tierra en cada celda; 0 = mar
const SUP = [];         // color de la superficie
const PROF = [];        // profundidad (0..1) en el mar
const ORILLA = [];      // celdas de mar junto a la costa (espuma)
const CUBOS = [];       // bloques estáticos: [x, y0, z, w, h, d, color, giroY]

const BAHIA = [-6, -34];      // muelle mineralero de San Nicolás, dentro de la bahía
const MINA = [34, -30];
const ANDES = [30, -60];      // cerros de San Fernando
const TURBINAS = [[40, -4], [48, -8], [56, -2], [44, 2], [52, 6], [38, 32], [46, 36], [55, 28], [30, 40]];   // ?verificar revisa que las aspas no se crucen

function azar(x, y, s) { return fract(sin(x * 12.9898 + y * 78.233 + s * 37.7) * 43758.5453); }
function celdaX(i) { return (i - N / 2 + 0.5) * C; }
function aCelda(v) { return constrain(floor(v / C + N / 2), 0, N - 1); }
function distSeg(px, pz, a, b) {
  const vx = b[0] - a[0], vz = b[1] - a[1];
  const k = constrain(((px - a[0]) * vx + (pz - a[1]) * vz) / (vx * vx + vz * vz), 0, 1);
  return dist(px, pz, a[0] + vx * k, a[1] + vz * k);
}
function tono(c, k) { return [min(255, c[0] * k), min(255, c[1] * k), min(255, c[2] * k)]; }
function mezcla(a, b, k) { return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)]; }
function escalon(v, a, ancho) { return constrain((v - a) / ancho, 0, 1); }
let DESTINO = CUBOS;     // lista donde caen los bloques (terreno o marco)
const MARCO_CUBOS = [];
let GRUPO = 'terreno';   // a qué objeto pertenece cada bloque (sirve para buscar choques con ?verificar)
function cubo(x, y0, z, w, h, d, c, ry = 0) { DESTINO.push([x, y0, z, w, h, d, c, ry, GRUPO]); }
function alturaEn(x, z) { return ALT[aCelda(x)][aCelda(z)] || MAR_Y; }
function esTierra(x, z) { return ALT[aCelda(x)][aCelda(z)] > 0; }

// ---------- espacio libre (para colocar cosas sin que choquen) ----------
// medio ancho en x y en z de un bloque girado
function medioAncho(q) {
  const w = q[3] / 2, d = q[5] / 2, c = abs(cos(q[7])), s = abs(sin(q[7]));
  return [w * c + d * s, w * s + d * c];
}
const SIN_VOLUMEN = new Set(['terreno', 'via', 'calle', 'alga', 'huella-llanta']);
// ¿algún objeto con volumen pisa el círculo (x, z, r)?
function objetoCerca(x, z, r) {
  for (const q of CUBOS) {
    if (q[4] < 0.3 || SIN_VOLUMEN.has(q[8])) continue;
    const [hx, hz] = medioAncho(q);
    if (abs(q[0] - x) < hx + r && abs(q[2] - z) < hz + r) return true;
  }
  return false;
}
// ¿todo el círculo es tierra?, ¿toca alguna vía?
function todoTierra(x, z, r) { return esTierra(x, z) && esTierra(x + r, z) && esTierra(x - r, z) && esTierra(x, z + r) && esTierra(x, z - r); }
function tocaVia(x, z, r, conjunto = CALLES) {
  for (let i = aCelda(x - r); i <= aCelda(x + r); i++) for (let j = aCelda(z - r); j <= aCelda(z + r); j++) if (conjunto.has(i * N + j)) return true;
  return false;
}
// lo más bajo del suelo bajo un rectángulo: las construcciones grandes se apoyan ahí (sin esquinas en el aire)
function suelo(x, z, hw, hd = hw) {
  let h = Infinity;
  for (const a of [-1, 0, 1]) for (const b of [-1, 0, 1]) h = min(h, alturaEn(x + a * hw * 0.9, z + b * hd * 0.9));
  return h;
}
// plano: poca diferencia de altura dentro del círculo
function plano(x, z, r, tol = 0.7) {
  const h = alturaEn(x, z);
  return abs(alturaEn(x + r, z) - h) <= tol && abs(alturaEn(x - r, z) - h) <= tol && abs(alturaEn(x, z + r) - h) <= tol && abs(alturaEn(x, z - r) - h) <= tol;
}
function sitioLibre(x, z, r, { via = false, tol = 0.7 } = {}) {
  return todoTierra(x, z, r) && plano(x, z, r, tol) && !tocaVia(x, z, r + 0.4, via ? ASFALTO : CALLES) && !objetoCerca(x, z, r) && !ocupadoEn(x, z, r);
}
// busca, en espiral alrededor de (x, z), el punto libre más cercano
function buscarSitio(x, z, r, opciones, radioMax = 6) {
  if (sitioLibre(x, z, r, opciones)) return [x, z];
  for (let d = 0.6; d <= radioMax; d += 0.6) {
    const n = ceil(d * 5);
    for (let k = 0; k < n; k++) {
      const a = k / n * TWO_PI, px = x + cos(a) * d, pz = z + sin(a) * d;
      if (sitioLibre(px, pz, r, opciones)) return [px, pz];
    }
  }
  return null;
}
// en la arena: entra `adentro` mm desde la orilla (viniendo del mar, que está al oeste)
function sitioEnPlaya(z, adentro, r) {
  let x = -MITAD;
  while (x < MITAD && !esTierra(x, z)) x += 0.4;
  return buscarSitio(x + adentro, z, r, { tol: 0.7 }, 3);
}
// actores (animales y personas) ya colocados: también ocupan su lugar
const PUESTOS = [];   // [x, z, r]
function ocupadoEn(x, z, r) { return PUESTOS.some(([px, pz, pr]) => dist(x, z, px, pz) < r + pr); }

// Línea de costa de Marcona (de norte a sur), calcada del mapa real a la escala de la maqueta:
// la bahía al norte, la península de San Juan apuntando al oeste y la costa sur con El Elefante.
const COSTA = [
  [12, -64], [9, -50], [4, -38], [-3, -27], [-11, -17], [-20, -11], [-29, -9], [-37, -7],
  [-43, -4], [-47, 0], [-46, 5], [-41, 9], [-33, 12], [-25, 15], [-17, 20], [-11, 25],
  [-6, 31], [0, 38], [6, 45], [12, 52], [18, 64],
];
const PISTA_A = [-6, -16], PISTA_B = [16, -2];   // aeropuerto naval, al noreste de la ciudad
const PISTA_Y = 7.8;   // altura de la explanada (a media altura del terreno: antes quedaba en una zanja)
const CERROS = [[30, -62, 30, 17], [50, 50, 24, 10], [60, 6, 18, 7]];   // [x, z, radio, alto]

// distancia a la costa: positiva tierra adentro (este), negativa mar adentro
function costa(x, z) {
  let md = Infinity, signo = 1;
  for (let k = 0; k < COSTA.length - 1; k++) {
    const a = COSTA[k], b = COSTA[k + 1];
    const d = distSeg(x, z, a, b);
    if (d < md) {
      md = d;
      const cruz = (b[0] - a[0]) * (z - a[1]) - (b[1] - a[1]) * (x - a[0]);
      signo = cruz < 0 ? 1 : -1;   // a la derecha del recorrido norte→sur está la tierra
    }
  }
  return md * signo + (noise(x * 0.09 + 10, z * 0.09) - 0.5) * 5 + (noise(x * 0.25, z * 0.25 + 5) - 0.5) * 1.6;
}

function generarTerreno() {
  noiseSeed(7);
  for (let i = 0; i < N; i++) {
    ALT[i] = []; SUP[i] = []; PROF[i] = [];
    for (let j = 0; j < N; j++) {
      const x = celdaX(i), z = celdaX(j);
      const r = azar(i, j, 3), v = 0.94 + azar(i, j, 7) * 0.1;
      const s = costa(x, z);
      if (s <= 0) { ALT[i][j] = 0; PROF[i][j] = constrain(-s / 20, 0, 1); continue; }

      let h, c;
      const dunas = max(0, sin(x * 0.42 + z * 0.2 + noise(x * 0.05, z * 0.05) * 6)) * 1.2;
      h = 1.8 + escalon(s, 4, 1.5) * 2.4 + escalon(s, 14, 1.5) * 3 + escalon(s, 30, 2) * 3 + s * 0.025;
      if (s < 4) c = [240, 222, 182];                       // playa
      else if (s < 14) c = [228, 198, 148];                 // primer tablazo
      else if (s < 30) c = [214, 176, 124];                 // segundo tablazo
      else { h += dunas; c = mezcla([198, 154, 102], [228, 192, 138], dunas / 1.2); } // pampa con dunas

      // la península de San Juan es baja y plana; su punta, rocosa y blanca de guano
      const P = L_('punta');
      const dP = dist(x, z, P.x, P.z);
      if (x < -16 && z > -12 && z < 16) h = min(h, 2.4 + escalon(s, 3, 1.5) * 1.8);
      if (dP < 9) { h = 2.4 + noise(x * 0.3, z * 0.3) * 2.6; c = r > 0.45 ? [232, 228, 214] : [190, 178, 158]; }

      // cerros: San Fernando al norte, lomas al sureste y al este
      for (const [cx, cz, cr, ch] of CERROS) {
        const d = dist(x, z, cx, cz);
        if (d >= cr) continue;
        const k = (cr - d) / cr;
        h += k * k * ch + noise(x * 0.12, z * 0.12) * 4 * k;
        c = mezcla(c, k > 0.6 ? [140, 102, 76] : [164, 122, 88], min(1, k * 2));
      }
      // explanada del aeropuerto
      if (distSeg(x, z, PISTA_A, PISTA_B) < 4.5) { h = PISTA_Y; c = [206, 182, 140]; }

      const dM = dist(x, z, MINA[0], MINA[1]);               // tajo: terrazas que bajan
      if (dM < 12) {
        h = max(0.9, h - floor((12 - dM) / 1.6) * 1.2);
        c = floor(dM / 1.6) % 2 ? [156, 76, 54] : [120, 58, 46];
      }
      ALT[i][j] = max(NIVEL, round(h / NIVEL) * NIVEL);
      SUP[i][j] = tono(c, v);
    }
  }
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    if (ALT[i][j]) continue;
    let tierra = 0;
    for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const p = i + a, q = j + b;
      if (p >= 0 && q >= 0 && p < N && q < N && ALT[p][q]) tierra++;
    }
    if (tierra) ORILLA.push([celdaX(i), celdaX(j), azar(i, j, 11) * TWO_PI]);
  }
}

// ---------- bloques estáticos ----------

function bloquesTerreno() {
  // marco de madera de la maqueta
  DESTINO = MARCO_CUBOS;
  const L = N * C + MARCO * 2;
  cubo(0, -8, 0, L, 1.2, L, [70, 48, 34]);
  cubo(0, -6.8, 0, L, 6.8, L, [128, 90, 60]);
  cubo(0, -0.2, 0, L, 0.2, L, [150, 108, 72]);
  // cama de estratos visible en el borde del terreno
  cubo(0, -3, 0, N * C + 0.4, 3, N * C + 0.4, [104, 76, 54]);
  DESTINO = CUBOS;

  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    const x = celdaX(i), z = celdaX(j), h = ALT[i][j];
    if (!h) {
      // fondo marino: más claro donde es poco profundo
      const p = PROF[i][j];
      const c = tono(mezcla([96, 184, 186], [18, 56, 96], pow(p, 0.6)), 0.95 + azar(i, j, 5) * 0.08);
      cubo(x, 0, z, C, lerp(1.25, 0.15, p), C, c);
      // bosques de cochayuyo y algas en el agua poco profunda
      GRUPO = 'alga';
      if (p > 0.04 && p < 0.3 && noise(x * 0.2, z * 0.2) > 0.62 && azar(i, j, 33) > 0.4)
        cubo(x, lerp(1.25, 0.15, p), z, C * 0.5, 0.25 + azar(i, j, 34) * 0.35, C * 0.5, [70, 84, 40], azar(i, j, 35) * 3);
      // islotes guaneros cerca de la orilla
      GRUPO = 'islote';
      if (p < 0.25 && azar(i, j, 31) > 0.975) {
        const ht = 1.8 + azar(i, j, 32) * 1.6;
        cubo(x, 0, z, C * 0.9, ht, C * 0.9, [120, 110, 100]);
        cubo(x, ht, z, C * 0.7, 0.35, C * 0.7, [236, 232, 220]);
      }
      GRUPO = 'terreno';
      continue;
    }
    // ¿acantilado? (algún vecino bastante más bajo)
    let caida = 0, mar = false;
    for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const p = constrain(i + a, 0, N - 1), q = constrain(j + b, 0, N - 1);
      caida = max(caida, h - (ALT[p][q] || 0));
      if (!ALT[p][q]) mar = true;
    }
    // arena mojada en la orilla
    if (mar && h < 2.5) SUP[i][j] = tono(SUP[i][j], 0.84);
    const capa = min(0.6, h), resto = h - capa;
    if (caida > 1.5 && resto > 1.4) {
      // acantilado con estratos: base rojiza, franja clara y capa media
      const roca = mezcla(SUP[i][j], [150, 104, 76], 0.45);
      cubo(x, 0, z, C, resto * 0.45, C, tono(roca, 0.78));
      cubo(x, resto * 0.45, z, C, 0.35, C, tono(SUP[i][j], 1.02));
      cubo(x, resto * 0.45 + 0.35, z, C, resto * 0.55 - 0.35, C, tono(roca, 0.92));
    } else if (resto > 0) {
      cubo(x, 0, z, C, resto, C, caida > 1.5 ? tono(mezcla(SUP[i][j], [150, 104, 76], 0.45), 0.9) : tono(SUP[i][j], 0.82));
    }
    cubo(x, resto, z, C, capa, C, SUP[i][j]);
  }
}

// piedras sueltas, matorrales y huellas de llantas: van después de las vías y los objetos,
// para no quedar encima de una carretera, de la pista o de otra cosa
function detallesDesierto() {
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    const x = celdaX(i), z = celdaX(j), h = ALT[i][j];
    if (!h) continue;
    const r = azar(i, j, 41);
    const libre = (px, pz, rr) => !tocaVia(px, pz, rr + 1) && distSeg(px, pz, PISTA_A, PISTA_B) > 5 && !objetoCerca(px, pz, rr + 0.3);
    if (h > 6 && r > 0.982) {
      const px = x + (r - 0.99) * 40;
      if (!libre(px, z, 0.6)) continue;
      GRUPO = 'piedra'; cubo(px, alturaEn(px, z), z, C * 0.5, 0.45, C * 0.6, [140, 104, 80], r * 6);
    } else if (h > 3 && h < 9 && r < 0.012) {
      if (!libre(x, z, 0.6)) continue;
      GRUPO = 'matorral';
      cubo(x, h, z, 0.9, 0.35, 0.9, [124, 134, 92]);
      cubo(x + 0.2, h + 0.35, z - 0.1, 0.5, 0.3, 0.5, [140, 150, 100]);
    }
    if (h > 8 && abs(((x * 0.6 + z) % 9 + 9) % 9 - 4.5) < 0.12 && r > 0.3 && !tocaVia(x, z, 0.5)) {
      GRUPO = 'huella-llanta'; cubo(x, h, z, C, 0.05, 0.25, tono(SUP[i][j], 0.86), 1.03);
    }
  }
  GRUPO = 'terreno';
}

// Carreteras (asfalto) y trochas (tierra). Todas terminan dentro de la maqueta.
const CARRETERAS = [
  { nombre: 'Carretera 26', tipo: 'asfalto', ancho: 2, pts: [[-14.5, -2.5], [-10, -6], [-3, -18], [3, -32], [8, -46], [11, -59]] },
  { nombre: 'Vía a la Panamericana', tipo: 'asfalto', ancho: 2, pts: [[-14.5, 1.5], [10, 6], [34, 14], [59, 24]] },
  { nombre: 'Acceso a la mina', tipo: 'asfalto', ancho: 1, pts: [[10, 6], [18, -4], [24, -12], [29, -21]] },
  { nombre: 'Acceso al muelle', tipo: 'asfalto', ancho: 1, pts: [[-3, -18], [3, -25], [1, -29]] },
  { nombre: 'Trocha a Punta San Juan', tipo: 'trocha', ancho: 1, pts: [[-24, 4], [-30, 5], [-34, 6], [-38, 5]] },
  { nombre: 'Trocha de las playas', tipo: 'trocha', ancho: 1, pts: [[-14.5, 7.7], [-10, 15], [-4, 22], [2, 30], [9, 39], [15, 48], [21, 58]] },
  { nombre: 'Trocha a los molinos', tipo: 'trocha', ancho: 1, pts: [[34, 14], [42, 13], [48, 10], [49, 3]] },
  { nombre: 'Trocha a San Fernando', tipo: 'trocha', ancho: 1, pts: [[8, -46], [6, -50], [4, -53]] },
];

// recorre una vía cada `paso` mm: devuelve [x, z, dirX, dirZ]
function muestrearVia(pts, paso) {
  const out = [];
  for (let s = 0; s < pts.length - 1; s++) {
    const [ax, az] = pts[s], [bx, bz] = pts[s + 1], L = dist(ax, az, bx, bz), n = max(1, ceil(L / paso));
    for (let k = 0; k < n + (s === pts.length - 2 ? 1 : 0); k++) out.push([lerp(ax, bx, k / n), lerp(az, bz, k / n), (bx - ax) / L, (bz - az) / L]);
  }
  return out;
}

// suaviza el terreno bajo las vías: rampas suaves en vez de escalones bruscos
function nivelarCaminos() {
  for (const v of CARRETERAS) {
    const m = muestrearVia(v.pts, 0.8).filter(([x, z]) => esTierra(x, z));
    const alto = m.map(([x, z]) => alturaEn(x, z));
    const R = 9;   // ventana de suavizado (~7 mm)
    m.forEach(([x, z, dx, dz], k) => {
      let s = 0, n = 0;
      for (let q = max(0, k - R); q <= min(m.length - 1, k + R); q++) { s += alto[q]; n++; }
      const h = max(NIVEL * 2, round(s / n / NIVEL) * NIVEL);
      const r = v.ancho * C * 0.55 + C * 0.6;   // incluye un borde de tierra a cada lado
      for (let i = aCelda(x - r); i <= aCelda(x + r); i++) for (let j = aCelda(z - r); j <= aCelda(z + r); j++) {
        if (!ALT[i][j] || dist(x, z, celdaX(i), celdaX(j)) > r) continue;
        if (dist(celdaX(i), celdaX(j), MINA[0], MINA[1]) < 12) continue;   // no rellenar el tajo
        ALT[i][j] = h;
      }
    });
  }
}

function camino(v) {
  GRUPO = 'via';
  const asfalto = v.tipo === 'asfalto';
  const color = asfalto ? [70, 70, 76] : [178, 152, 116];
  const hecho = new Set();
  const m = muestrearVia(v.pts, C * 0.4);
  for (const [x, z, dx, dz] of m) {
    for (let o = -(v.ancho - 1) / 2; o <= (v.ancho - 1) / 2; o += 0.5) {
      const i = aCelda(x - dz * o * C), j = aCelda(z + dx * o * C), key = i * N + j;   // perpendicular a la vía
      if (hecho.has(key) || !ALT[i][j]) continue;
      hecho.add(key);
      cubo(celdaX(i), ALT[i][j], celdaX(j), C, 0.12, C, tono(color, 0.97 + azar(i, j, 9) * 0.05));
      CALLES.add(key);
      if (asfalto) ASFALTO.add(key);
    }
  }
  if (!asfalto) return;
  // marcas: línea central amarilla discontinua (en vías anchas) y bordes blancos
  const marcas = muestrearVia(v.pts, 1.2);
  marcas.forEach(([x, z, dx, dz], k) => {
    if (!esTierra(x, z)) return;
    const y = alturaEn(x, z) + 0.13, ang = atan2(dx, dz);
    if (v.ancho > 1 && k % 2 === 0) cubo(x, y, z, 0.2, 0.03, 0.8, [246, 200, 60], ang);
    if (v.ancho > 1) for (const s of [-1, 1]) {
      const ex = x - dz * s * C * 0.95, ez = z + dx * s * C * 0.95;
      if (esTierra(ex, ez) && abs(alturaEn(ex, ez) + 0.13 - y) < 0.3) cubo(ex, y, ez, 0.12, 0.03, 1.25, [240, 240, 236], ang);
    }
  });
}

// señales y postes de kilómetro a lo largo de las carreteras
function senales() {
  GRUPO = 'senal';
  for (const v of CARRETERAS) {
    if (v.tipo !== 'asfalto' || v.ancho < 2) continue;
    muestrearVia(v.pts, 9).forEach(([x, z, dx, dz], k) => {
      if (k === 0) return;
      const sx = x - dz * C * 1.8, sz = z + dx * C * 1.8;
      if (!esTierra(sx, sz)) return;
      const y = alturaEn(sx, sz);
      cubo(sx, y, sz, 0.15, 1.6, 0.15, [210, 210, 214]);
      cubo(sx, y + 1.6, sz, 1.1, 0.7, 0.08, k % 2 ? [40, 110, 170] : [40, 130, 80], atan2(dx, dz) + HALF_PI);
    });
  }
}
const CALLES = new Set();
const ASFALTO = new Set();   // celdas de carretera: el explorador camina por el costado y solo cruza

// Ciudad: primero calles, plaza, iglesia y losa; las casas se levantan al final (casas()), solo en
// los lotes que quedaron libres, para no meterse dentro del colegio, una palmera o un poste.
const LOTES = [];
function bloquesCiudad() {
  const T = L_('ciudad');
  const it = aCelda(T.x), jt = aCelda(T.z);
  GRUPO = 'calle';
  for (let i = it - 8; i <= it + 8; i++) for (let j = jt - 8; j <= jt + 8; j++) {
    if (i < 0 || j < 0 || i >= N || j >= N || !ALT[i][j]) continue;
    const x = celdaX(i), z = celdaX(j), y = ALT[i][j];
    if (dist(x, z, T.x, T.z) > 14 + azar(i, j, 2) * 2) continue;
    if (abs(i - it) <= 1 && abs(j - jt) <= 1) continue;               // plaza
    if ((i - it) % 3 === 0 || (j - jt) % 3 === 0 || CALLES.has(i * N + j)) {   // calles
      if (!CALLES.has(i * N + j)) cubo(x, y, z, C, 0.1, C, [118, 114, 108]);
      CALLES.add(i * N + j);
      continue;
    }
    if (azar(i, j, 21) >= 0.12) LOTES.push([i, j]);                    // (el resto queda como terreno libre)
  }
  // plaza de Armas con jardines, árboles y pileta
  GRUPO = 'plaza';
  const y = alturaEn(T.x, T.z), px = celdaX(it), pz = celdaX(jt);
  cubo(px, y, pz, C * 3, 0.2, C * 3, [200, 196, 186]);
  for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    cubo(px + a * C * 0.9, y + 0.2, pz + b * C * 0.9, C * 1.1, 0.15, C * 1.1, [92, 168, 86]);
    cubo(px + a * C * 1.1, y + 0.35, pz + b * C * 1.1, 0.25, 0.9, 0.25, [110, 80, 50]);
    cubo(px + a * C * 1.1, y + 1.2, pz + b * C * 1.1, 1.1, 0.9, 1.1, [56, 128, 64]);
  }
  cubo(px, y + 0.2, pz, 1, 0.35, 1, [220, 220, 215]);
  cubo(px, y + 0.55, pz, 0.6, 0.12, 0.6, [80, 170, 210]);
  // iglesia frente a la plaza: en el lote entre la plaza y las calles (antes pisaba la calle central)
  GRUPO = 'iglesia';
  const ix = px + C * 1.5, iz = pz - C * 2, iy = suelo(ix, iz, 1.6, 0.8);
  cubo(ix, iy, iz, 3, 2.4, 1.5, [246, 242, 232]);
  cubo(ix, iy + 2.4, iz, 3.2, 0.25, 1.65, [180, 80, 60]);
  cubo(ix + 1.1, iy, iz + 0.2, 1, 4.2, 1, [246, 242, 232]);
  cubo(ix + 1.1, iy + 4.2, iz + 0.2, 0.6, 0.8, 0.6, [180, 80, 60]);
  cubo(ix - 0.3, iy + 0.4, iz + 0.76, 0.8, 1.2, 0.05, [110, 70, 44]);
  // estadio / losa deportiva (en un terreno plano libre, lejos de la carretera)
  const losa = buscarSitio(T.x + 9, T.z - 8, 3.4, { tol: 1.2 }, 8);
  if (losa) {
    GRUPO = 'losa';
    const [ex, ez] = losa, ey = suelo(ex, ez, 3, 2);
    cubo(ex, ey, ez, 6, 0.15, 4, [86, 150, 80]);
    cubo(ex, ey + 0.15, ez, 0.15, 0.02, 4, [240, 240, 240]);
  }
}

function casas() {
  const paredes = [[240, 236, 224], [246, 214, 150], [168, 200, 222], [236, 160, 140], [206, 224, 180], [250, 242, 210], [220, 190, 220]];
  for (const [i, j] of LOTES) {
    const x = celdaX(i), z = celdaX(j), y = ALT[i][j];
    const w = C * (0.78 + azar(i, j, 25) * 0.16);
    // lote ocupado por otra cosa, o pegado a la carretera (se deja de vereda): no se construye
    if (objetoCerca(x, z, w / 2 + 0.1) || tocaVia(x, z, w / 2 + 0.9, ASFALTO)) continue;
    GRUPO = 'casa' + i + '_' + j;
    const pisos = 1 + floor(azar(i, j, 22) * azar(i, j, 24) * 3.2);
    const h = pisos * 0.9;
    cubo(x, y, z, w, h, w, paredes[floor(azar(i, j, 23) * paredes.length)]);
    cubo(x, y + h, z, w + 0.1, 0.15, w + 0.1, [190, 186, 176]);       // azotea
    if (azar(i, j, 26) > 0.55) cubo(x + w * 0.25, y + h + 0.15, z - w * 0.2, 0.4, 0.45, 0.4, [30, 30, 32]); // tanque de agua
    if (azar(i, j, 27) > 0.8) cubo(x, y + 0.35, z + w / 2 + 0.01, 0.4, 0.7, 0.05, [90, 60, 40]);              // puerta
    // ventanas en cada piso (fachadas sur y oeste, las que se ven desde el mar)
    for (let p = 0; p < pisos; p++) {
      const vy = y + p * 0.9 + 0.4;
      cubo(x - w * 0.22, vy, z + w / 2 + 0.02, 0.32, 0.3, 0.04, [70, 96, 120]);
      cubo(x - w / 2 - 0.02, vy, z + w * 0.18, 0.04, 0.3, 0.32, [70, 96, 120]);
    }
    if (pisos > 1 && azar(i, j, 28) > 0.6) cubo(x, y + 0.9, z + w / 2 + 0.12, w * 0.7, 0.08, 0.3, [200, 196, 186]); // balcón
    if (pisos === 1 && azar(i, j, 29) > 0.75) for (const s of [-1, 1]) cubo(x + s * w * 0.4, y + h + 0.15, z, 0.08, 0.5, 0.08, [120, 120, 124]); // fierros de construcción
  }
  GRUPO = 'terreno';
}

// coloca algo en el sitio libre más cercano a (x, z); si no hay ninguno, no lo pone
function colocar(grupo, x, z, r, dibujar, opciones = {}, radioMax = 6) {
  const p = buscarSitio(x, z, r, opciones, radioMax);
  if (!p) return null;
  GRUPO = grupo;
  dibujar(p[0], p[1]);
  return p;
}

function bloquesLugares() {
  // ----- caleta: muelle, botes varados y puestos -----
  GRUPO = 'muelle-caleta';
  const K = L_('caleta');
  const dx = -0.26, dz = -0.97;   // la caleta mira a la bahía (norte)
  let x0 = K.x, z0 = K.z;
  for (let n = 0; n < 60 && esTierra(x0, z0); n++) { x0 += dx; z0 += dz; }   // busca la orilla
  MUELLE.x = x0; MUELLE.z = z0;
  for (let k = -2; k < 14; k++) {
    const x = x0 + dx * k, z = z0 + dz * k;
    cubo(x, MAR_Y + 0.4, z, 1.6, 0.25, 1.6, [140, 102, 70], atan2(dx, dz));
    if (k % 3 === 0 && k > 0) for (const s of [-1, 1]) cubo(x + dz * s * 0.8, 0, z - dx * s * 0.8, 0.25, MAR_Y + 0.4, 0.25, [90, 66, 46]);
  }
  for (let k = 0; k < 3; k++) {
    colocar('puestos' + k, x0 - dx * (3 + k * 1.8) + 1.5, z0 - dz * (3 + k * 1.8) + 1.5, 1.0, (x, z) => {
      const y = suelo(x, z, 0.85, 0.75);
      cubo(x, y, z, 1.4, 1, 1.2, [236, 236, 228]);
      cubo(x, y + 1, z, 1.7, 0.15, 1.5, [[220, 70, 60], [60, 120, 200], [240, 180, 50]][k]);
    });
  }

  // ----- rocas: la Tortuga y el Elefante (separadas: antes se metían una en otra) -----
  const R = L_('rocas');
  const roca = [124, 114, 104], roca2 = [104, 96, 88];
  let tx = R.x - 3, tz = R.z + 5;
  GRUPO = 'tortuga';
  cubo(tx, MAR_Y - 0.5, tz, 6, 1.8, 5, roca);              // caparazón
  cubo(tx, MAR_Y + 1.3, tz, 4.4, 1.1, 3.6, roca);
  cubo(tx, MAR_Y + 2.4, tz, 2.6, 0.7, 2.2, tono(roca, 1.08));
  cubo(tx - 3.6, MAR_Y - 0.2, tz + 0.2, 2, 1.5, 1.8, roca2);  // cabeza
  cubo(tx - 4.5, MAR_Y + 0.6, tz + 0.2, 0.9, 0.7, 1.2, roca2);
  for (const [a, b] of [[-2, -2.6], [2, -2.6], [-2, 2.6], [2, 2.6]]) cubo(tx + a, MAR_Y - 0.5, tz + b, 1.4, 0.9, 1, roca2);
  const ex = R.x + 5.2, ez = R.z + 8.6;
  GRUPO = 'elefante';
  cubo(ex, MAR_Y - 0.5, ez, 5, 5.5, 4, roca2);              // cuerpo del elefante
  cubo(ex, MAR_Y + 5, ez, 4, 1, 3.2, roca2);
  cubo(ex - 3.2, MAR_Y + 2.6, ez, 2.6, 3.6, 3.4, roca);      // cabeza
  cubo(ex - 3.6, MAR_Y + 3.2, ez + 2.1, 1.6, 2.4, 0.5, roca); // orejas
  cubo(ex - 3.6, MAR_Y + 3.2, ez - 2.1, 1.6, 2.4, 0.5, roca);
  cubo(ex - 4.9, MAR_Y + 0.4, ez, 0.9, 2.6, 1, roca);        // trompa
  cubo(ex - 5.5, MAR_Y - 0.5, ez, 1.3, 1, 1, roca);
  for (const a of [-1.5, 1.5]) cubo(ex + 1, MAR_Y - 0.5, ez + a, 1.2, 1.2, 1, roca2);  // patas

  // ----- mirador de Punta San Juan y cartel de la reserva -----
  const P = L_('punta');
  colocar('mirador', P.x + 6, P.z - 7, 1.9, (mx, mz) => {
    const my = suelo(mx, mz, 1.5);
    for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) cubo(mx + a, my, mz + b, 0.3, 2.6 + alturaEn(mx, mz) - my, 0.3, [120, 84, 56]);
    const top = my + 2.6 + alturaEn(mx, mz) - my;
    cubo(mx, top, mz, 2.8, 0.3, 2.8, [150, 108, 72]);
    cubo(mx, top + 1, mz, 3.2, 0.25, 3.2, [196, 70, 52]);
    cubo(mx, top + 0.3, mz + 1.35, 2.8, 0.5, 0.1, [120, 84, 56]);
  }, { tol: 1.2 });
  colocar('cartel-reserva', P.x + 9, P.z + 2, 1.4, (cx, cz) => {
    const cy = alturaEn(cx, cz);
    cubo(cx, cy, cz, 0.25, 1.6, 0.25, [110, 80, 50]);
    cubo(cx, cy + 1.6, cz, 2.4, 1.2, 0.2, [60, 120, 70], -QUARTER_PI);
  }, { tol: 1.2 });

  // ----- puerto de San Nicolás: muelle, barco, cargador y faja -----
  GRUPO = 'muelle-puerto';
  const bx = BAHIA[0] + 6, bz = BAHIA[1] + 4;
  for (let k = 0; k < 10; k++) cubo(bx - k * 1.2, MAR_Y + 0.5, bz + k * 0.3, 1.6, 0.5, 2.4, [150, 150, 154], 0.25);
  // barco mineralero amarrado AL COSTADO del muelle, del lado del mar (antes el muelle lo atravesaba)
  GRUPO = 'barco-puerto';
  const lx = cos(0.25), lz = -sin(0.25), nx = sin(0.25), nz = cos(0.25);   // a lo largo del muelle / a lo ancho
  const sx = bx - 10.6 - nx * 3.5 + lx * 0.3, sz = bz + 2.65 - nz * 3.5 + lz * 0.3;
  const en = (a, b) => [sx + lx * a + nx * b, sz + lz * a + nz * b];   // (a lo largo, a lo ancho) → mundo
  cubo(sx, 0.2, sz, 13, 2.6, 4, [150, 40, 36], 0.25);
  cubo(sx, 2.8, sz, 13, 0.6, 4, [40, 44, 52], 0.25);
  { const [x, z] = en(4.6, 0); cubo(x, 3.4, z, 2.6, 3, 3.4, [240, 240, 236], 0.25); }
  { const [x, z] = en(4.9, -0.1); cubo(x, 6.4, z, 0.8, 1.6, 0.8, [40, 44, 52], 0.25); }
  for (let k = -2; k <= 1; k++) { const [x, z] = en(k * 2.6 - 0.4, 0); cubo(x, 3.4, z, 2, 0.4, 3, [70, 52, 40], 0.25); }
  // cargador sobre el muelle, con el brazo tendido sobre las bodegas del barco
  GRUPO = 'cargador';
  const cx = bx - 7.2 + nx * 0.2, cz = bz + 1.8 + nz * 0.2;
  cubo(cx, MAR_Y + 1, cz, 1, 6, 1, [230, 180, 40], 0.25);
  cubo(cx - nx * 2.4, MAR_Y + 7, cz - nz * 2.4, 1, 0.8, 5, [230, 180, 40], 0.25);
  // ruma de mineral en tierra y faja transportadora desde el muelle hasta ella
  const ruma = colocar('ruma-puerto', bx + 14, bz - 11, 4.3, (rx, rz) => {
    const ry = suelo(rx, rz, 4, 2.5);
    for (let k = 0; k < 4; k++) cubo(rx, ry + k * 0.7, rz, 8 - k * 1.8, 0.7, 5 - k * 1.1, tono([96, 48, 40], 1 + k * 0.05));
  }, {}, 8);
  if (ruma) {
    GRUPO = 'faja';
    const fx0 = bx + 2, fz0 = bz - 2, L = dist(fx0, fz0, ruma[0], ruma[1]) - 4.6, ang = atan2(ruma[0] - fx0, ruma[1] - fz0);
    const n = max(2, floor(L / 1.6));
    for (let k = 0; k < n; k++) {
      const fx = fx0 + sin(ang) * k * 1.6, fz = fz0 + cos(ang) * k * 1.6, fy = alturaEn(fx, fz);
      cubo(fx, fy, fz, 0.35, 2.4 + k * 0.1, 0.35, [110, 110, 116]);
      cubo(fx, fy + 2.4 + k * 0.1, fz, 0.9, 0.4, 1.9, [110, 110, 116], ang);
    }
  }

  // ----- mina: planta, ruma y oficinas (en terreno libre, sin pisar el acceso) -----
  colocar('planta-mina', MINA[0] - 14, MINA[1] + 4, 4.6, (px, pz) => {
    const py = suelo(px, pz, 3, 2);
    cubo(px, py, pz, 6, 3, 4, [170, 170, 176]);
    cubo(px, py + 3, pz, 6.2, 0.3, 4.2, [90, 110, 140]);
    cubo(px + 2, py, pz - 3, 1, 7, 1, [150, 150, 150]);
    cubo(px - 3, py, pz + 4, 3, 1.6, 2.4, [236, 232, 220]);
  }, { tol: 1.8 }, 8);
  colocar('ruma-mina', MINA[0] - 7, MINA[1] + 9, 2.8, (rx, rz) => {
    const ry = suelo(rx, rz, 2.5, 2);
    for (let k = 0; k < 3; k++) cubo(rx, ry + k * 0.8, rz, 5 - k * 1.4, 0.8, 4 - k * 1.1, tono([110, 54, 44], 1 + k * 0.06));
  }, { tol: 1.8 }, 8);

  // ----- sombrillas en el circuito de playas (cada una en arena libre, lejos de vías y objetos) -----
  const colores = [[230, 70, 60], [250, 200, 60], [60, 150, 220], [240, 240, 240], [80, 190, 120]];
  for (let k = 0; k < 9; k++) {
    GRUPO = 'sombrilla' + k;
    const sitio = sitioEnPlaya(28 + k * 3.6 + azar(k, 1, 1) * 2, 2 + azar(k, 2, 1) * 1.5, 1.6);
    if (!sitio) continue;
    const [x, z] = sitio, y = alturaEn(x, z);
    cubo(x, y, z, 0.18, 1.6, 0.18, [240, 240, 240]);
    cubo(x, y + 1.6, z, 2, 0.25, 2, colores[k % colores.length]);
    if (k % 2) cubo(x + 0.6, y, z + 0.7, 1, 0.12, 1.8, colores[(k + 2) % colores.length]);   // toalla
  }

  // ----- aerogeneradores (torre y góndola; las aspas giran aparte) -----
  for (const [x, z] of TURBINAS) {
    GRUPO = 'turbina' + x + '_' + z;
    const y = alturaEn(x, z);
    cubo(x, y, z, 1.6, 0.4, 1.6, [200, 200, 196]);
    cubo(x, y, z, 0.9, 10, 0.9, [238, 240, 242]);
    cubo(x, y + 10, z, 0.65, 9, 0.65, [238, 240, 242]);
    cubo(x, y + 18.6, z + 0.4, 1.2, 1.2, 2.6, [232, 234, 236]);
  }

  // ----- carteles "a San Fernando" y "a Nasca" -----
  for (const [x, z] of [[10, -50], [60, 22]]) {
    colocar('cartel-ruta', x, z, 1.4, (cx, cz) => {
      const y = alturaEn(cx, cz);
      cubo(cx, y, cz, 0.25, 1.8, 0.25, [200, 200, 200]);
      cubo(cx, y + 1.8, cz, 2.6, 1, 0.15, [40, 110, 170], -QUARTER_PI);
    }, { tol: 1.2 }, 4);
  }
}
const MUELLE = { x: 0, z: 0 };

function palmera(x, z, alto = 4) {
  colocar('palmera' + round(x) + '_' + round(z), x, z, 1.6, (x, z) => {
    const y = alturaEn(x, z);
    for (let k = 0; k < 4; k++) cubo(x + k * 0.12, y + k * alto / 4, z, 0.38, alto / 4 + 0.05, 0.38, tono([128, 94, 62], 1 - k * 0.04));
    const tx = x + 0.45, ty = y + alto;
    for (let a = 0; a < 4; a++) cubo(tx, ty, z, 3, 0.18, 0.6, tono([60, 140, 70], 1 + a * 0.04), a * QUARTER_PI);
    cubo(tx, ty - 0.2, z, 0.5, 0.4, 0.5, [100, 80, 50]);
  }, { tol: 1.2 }, 4);
}

function bloquesDetalles() {
  // aeropuerto naval: pista con marcas, hangar y torre de control
  {
    GRUPO = 'aeropuerto';
    const [ax, az] = PISTA_A, [bx, bz] = PISTA_B, ang = atan2(bx - ax, bz - az), largo = dist(ax, az, bx, bz);
    const mx = (ax + bx) / 2, mz = (az + bz) / 2, y = PISTA_Y;
    cubo(mx, y, mz, 3, 0.1, largo, [84, 84, 90], ang);
    for (let k = -4; k <= 4; k++) cubo(mx + sin(ang) * k * 2.4, y + 0.1, mz + cos(ang) * k * 2.4, 0.3, 0.03, 1.2, [245, 245, 240], ang);
    for (const s of [-1, 1]) cubo(mx + sin(ang) * s * (largo / 2 - 1), y + 0.1, mz + cos(ang) * s * (largo / 2 - 1), 2.4, 0.03, 0.3, [245, 245, 240], ang);
    const px = mx + cos(ang) * 3.6, pz = mz - sin(ang) * 3.6;          // a un costado de la pista
    cubo(px, y, pz, 4, 1.6, 2.6, [220, 222, 226], ang);                // hangar
    cubo(px, y + 1.6, pz, 4.1, 0.25, 2.7, [120, 130, 150], ang);
    cubo(px + sin(ang) * 3.4, y, pz + cos(ang) * 3.4, 1, 3.4, 1, [236, 232, 220]);  // torre de control
    cubo(px + sin(ang) * 3.4, y + 3.4, pz + cos(ang) * 3.4, 1.5, 0.9, 1.5, [90, 140, 180]);
  }
  const T = L_('ciudad');
  const px = celdaX(aCelda(T.x)), pz = celdaX(aCelda(T.z)), py = alturaEn(T.x, T.z);
  // bandera del Perú en la plaza (entre los árboles y la banca, sin tocarlos)
  GRUPO = 'bandera';
  cubo(px, py + 0.2, pz - C * 1.2, 0.15, 4.2, 0.15, [230, 230, 230]);
  for (let k = 0; k < 3; k++) cubo(px + 0.35 + k * 0.5, py + 3.2, pz - C * 1.2, 0.5, 1, 0.06, k === 1 ? [250, 250, 250] : [210, 30, 40]);
  // bancas
  GRUPO = 'bancas';
  for (const [a, b, r] of [[0, -1.5, 0], [0, 1.5, 0], [-1.5, 0, HALF_PI], [1.5, 0, HALF_PI]])
    cubo(px + a * C, py + 0.2, pz + b * C, 1.2, 0.3, 0.4, [150, 100, 60], r);
  // faroles a lo largo de la avenida (en la vereda, fuera del carril)
  for (let k = 1; k < 7; k++) {
    const x = lerp(-12, 10, k / 7) + 1.2, z = lerp(2, 6, k / 7) - 1.4;
    colocar('farol' + k, x, z, 0.3, (x, z) => {
      const y = alturaEn(x, z);
      cubo(x, y, z, 0.15, 2.6, 0.15, [60, 64, 70]);
      cubo(x, y + 2.6, z, 0.5, 0.3, 0.5, [255, 230, 150]);
    }, { via: true, tol: 1.2 }, 1.5);
  }
  // palmeras en la plaza, la caleta y la playa
  palmera(px + C * 2.4, pz + C * 2.4); palmera(px - C * 2.4, pz + C * 2.4, 3.5);
  palmera(MUELLE.x + 4, MUELLE.z + 4, 3.6); palmera(MUELLE.x + 7, MUELLE.z + 2.5, 4.2);
  const P = L_('playas'); palmera(P.x + 4, P.z - 3, 3.8); palmera(P.x - 6, P.z - 8, 3.4);
  // botes varados en la arena de la caleta
  for (const [a, b, r, c] of [[-2.5, 2.2, 1.4, [40, 110, 190]], [-4.4, 3.6, 1.9, [220, 70, 60]]]) {
    colocar('botes-varados', MUELLE.x + a, MUELLE.z + b, 1.8, (x, z) => {
      const y = alturaEn(x, z);
      cubo(x, y, z, 1.3, 0.6, 3.2, c, r);
      cubo(x, y + 0.6, z, 1.35, 0.12, 3.25, [245, 245, 240], r);
    }, { tol: 1.2 }, 4);
  }
  // subestación del parque eólico y torres de alta tensión hasta la ciudad
  const sub = colocar('subestacion', 40, 8, 2.6, (sx, sz) => {
    const sy = suelo(sx, sz, 2, 1.5);
    cubo(sx, sy, sz, 4, 0.15, 3, [150, 150, 150]);
    for (const [a, b] of [[-1, -0.6], [0, -0.6], [1, -0.6], [-1, 0.6], [1, 0.6]]) cubo(sx + a * 1.3, sy + 0.15, sz + b, 0.5, 1.2, 0.5, [190, 190, 196]);
    cubo(sx + 0.5, sy + 0.15, sz + 0.6, 1.2, 1, 0.9, [236, 232, 220]);
  }, { tol: 1.2 }, 8) || [40, 8];
  for (let k = 1; k <= 4; k++) {
    const x = lerp(sub[0], T.x + 6, k / 5), z = lerp(sub[1], T.z - 2, k / 5);
    colocar('torre-electrica' + k, x, z, 0.9, (x, z) => {
      const y = alturaEn(x, z);
      cubo(x, y, z, 0.25, 4.2, 0.25, [120, 124, 130]);
      cubo(x, y + 4.2, z, 1.8, 0.15, 0.15, [120, 124, 130], atan2(T.x - sub[0], T.z - sub[1]) + HALF_PI);
    }, { tol: 2 }, 3);
  }
  // tanque elevado de agua y antena
  colocar('tanque-agua', T.x + 7, T.z - 5, 1.3, (qx, qz) => {
    const qy = suelo(qx, qz, 0.7);
    for (const [a, b] of [[-0.6, -0.6], [0.6, -0.6], [-0.6, 0.6], [0.6, 0.6]]) cubo(qx + a, qy, qz + b, 0.2, 3.4, 0.2, [150, 150, 154]);
    cubo(qx, qy + 3.4, qz, 2, 1.4, 2, [100, 150, 200]);
    cubo(qx, qy + 4.8, qz, 1.4, 0.25, 1.4, [120, 170, 214]);
  });
  colocar('antena', T.x + 11, T.z + 5, 0.6, (ax, az) => {
    const ay = alturaEn(ax, az);
    cubo(ax, ay, az, 0.3, 7, 0.3, [220, 60, 50]);
    for (let k = 1; k < 4; k++) cubo(ax, ay + k * 1.8 - 0.9, az, 0.32, 0.9, 0.32, [245, 245, 245]);
  });
  // colegio con patio
  colocar('colegio', T.x + 3, T.z + 10, 4.2, (cx, cz) => {
    const cy = suelo(cx, cz, 3.5, 2.2);
    cubo(cx, cy, cz, 7, 0.12, 4.5, [196, 120, 90]);
    cubo(cx, cy, cz - 1.6, 7, 1.8, 1.2, [250, 220, 120]);
    cubo(cx, cy + 1.8, cz - 1.6, 7.2, 0.15, 1.4, [200, 196, 186]);
    for (let k = -2; k <= 2; k++) cubo(cx + k * 1.3, cy + 0.6, cz - 0.98, 0.5, 0.5, 0.04, [70, 96, 120]);
  }, { tol: 1.2 }, 8);
  // contenedores en el puerto (patio de 4 × 2)
  colocar('contenedores', BAHIA[0] + 20, BAHIA[1] - 2.7, 3.6, (x0, z0) => {
    const y = suelo(x0, z0, 3, 2.6), cols = [[200, 60, 50], [60, 120, 190], [240, 180, 50], [70, 150, 90]];
    for (let k = 0; k < 8; k++) {
      const x = x0 - 2.25 + (k % 4) * 1.5, z = z0 - 1.3 + floor(k / 4) * 2.6;
      cubo(x, y, z, 1.2, 1.1, 2.4, cols[(k * 3) % 4]);
      if (k % 3 === 0) cubo(x, y + 1.1, z, 1.2, 1.1, 2.4, cols[(k + 1) % 4]);
    }
  }, { tol: 1.2 }, 10);
  // piedras en la orilla
  GRUPO = 'piedra-orilla';
  for (const [x, z, f] of ORILLA) {
    if (f / TWO_PI < 0.95) continue;
    const h = 1.4 + (f / TWO_PI - 0.95) * 20;
    cubo(x, 0, z, C * 0.8, h, C * 0.7, [118, 110, 102], f);
  }
  GRUPO = 'terreno';
}

// ---------- caminos del explorador (A* sobre la grilla de tierra) ----------

const VECINOS = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, 1.414], [1, -1, 1.414], [-1, 1, 1.414], [-1, -1, 1.414]];
const PASO_MAX = 1.3;   // escalón más alto que sube el explorador (mm); uno mayor es un muro: usa rampas y caminos

// celdas con casas, postes, árboles, animales u otros objetos encima: el explorador las rodea
const OCUPADO = new Uint8Array(N * N);
const BLANDO = new Float32Array(N * N);   // costo extra: por donde pasea gente (las rodea si puede)
const ALCANCE = new Uint8Array(N * N);    // celdas a las que se puede llegar caminando desde la ciudad
function marcarOcupado(desde) {
  for (let k = desde; k < CUBOS.length; k++) {
    const q = CUBOS[k];
    if (q[4] < 0.4 || SIN_VOLUMEN.has(q[8])) continue;   // caminos, veredas y pisos se pueden pisar
    const [hx, hz] = medioAncho(q);
    for (let i = aCelda(q[0] - hx + 0.01); i <= aCelda(q[0] + hx - 0.01); i++)
      for (let j = aCelda(q[2] - hz + 0.01); j <= aCelda(q[2] + hz - 0.01); j++)
        if (ALT[i][j]) OCUPADO[i * N + j] = 1;
  }
}
function marcarPuestos() {
  for (const [x, z, r, blando] of PUESTOS)
    for (let i = aCelda(x - r); i <= aCelda(x + r); i++) for (let j = aCelda(z - r); j <= aCelda(z + r); j++) {
      if (!ALT[i][j] || dist(x, z, celdaX(i), celdaX(j)) > r + C * 0.5) continue;
      if (blando) BLANDO[i * N + j] = max(BLANDO[i * N + j], 15); else OCUPADO[i * N + j] = 1;
    }
}

// ¿se puede dar el paso de la celda (ui, uj) a su vecina (ui + di, uj + dj)?
function paso(ui, uj, di, dj) {
  const vi = ui + di, vj = uj + dj;
  if (vi < 0 || vj < 0 || vi >= N || vj >= N || !ALT[vi][vj] || OCUPADO[vi * N + vj]) return false;
  if (di && dj && (!ALT[ui + di][uj] || !ALT[ui][uj + dj] || OCUPADO[(ui + di) * N + uj] || OCUPADO[ui * N + uj + dj])) return false;   // no cortar esquinas
  return abs(ALT[vi][vj] - ALT[ui][uj]) <= PASO_MAX;
}

// todas las celdas conectadas a pie con la de inicio (búsqueda en anchura)
function calcularAlcance(ini) {
  ALCANCE.fill(0);
  const cola = [ini[0] * N + ini[1]];
  ALCANCE[cola[0]] = 1;
  for (let q = 0; q < cola.length; q++) {
    const u = cola[q], ui = floor(u / N), uj = u % N;
    for (const [di, dj] of VECINOS) {
      if (!paso(ui, uj, di, dj)) continue;
      const v = (ui + di) * N + uj + dj;
      if (!ALCANCE[v]) { ALCANCE[v] = 1; cola.push(v); }
    }
  }
  hayAlcance = true;
}
let hayAlcance = false;

// la celda libre (y alcanzable) más cercana a (x, z), a no menos de `minimo` mm
function celdaTierraCercana(x, z, minimo = 0) {
  let mejor = null, md = Infinity;
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    const v = i * N + j;
    if (!ALT[i][j] || OCUPADO[v] || (hayAlcance && !ALCANCE[v])) continue;
    const d = dist(x, z, celdaX(i), celdaX(j));
    if (d >= minimo && d < md) { md = d; mejor = [i, j]; }
  }
  return mejor;
}

function buscarRuta(a, b) {
  const tot = N * N, g = new Float32Array(tot).fill(Infinity), prev = new Int32Array(tot).fill(-1), listo = new Uint8Array(tot);
  const ini = a[0] * N + a[1], fin = b[0] * N + b[1];
  const heap = [];   // montículo binario de [prioridad, celda]
  const meter = (p, v) => {
    heap.push([p, v]);
    let k = heap.length - 1;
    while (k > 0) { const q = (k - 1) >> 1; if (heap[q][0] <= heap[k][0]) break; [heap[q], heap[k]] = [heap[k], heap[q]]; k = q; }
  };
  const sacar = () => {
    const top = heap[0], ult = heap.pop();
    if (heap.length) {
      heap[0] = ult;
      let k = 0;
      for (;;) {
        const l = 2 * k + 1, r = l + 1;
        let m = k;
        if (l < heap.length && heap[l][0] < heap[m][0]) m = l;
        if (r < heap.length && heap[r][0] < heap[m][0]) m = r;
        if (m === k) break;
        [heap[m], heap[k]] = [heap[k], heap[m]]; k = m;
      }
    }
    return top[1];
  };
  const hdist = v => Math.hypot(floor(v / N) - b[0], (v % N) - b[1]);
  let masCerca = ini, hMin = hdist(ini);   // si no hay camino, llega lo más cerca posible (nunca cruza el mar)
  g[ini] = 0; meter(hMin, ini);
  while (heap.length) {
    const u = sacar();
    if (u === fin) break;
    if (listo[u]) continue;
    listo[u] = 1;
    const ui = floor(u / N), uj = u % N;
    const hu = hdist(u);
    if (hu < hMin) { hMin = hu; masCerca = u; }
    for (const [di, dj, l] of VECINOS) {
      if (!paso(ui, uj, di, dj)) continue;
      const v = (ui + di) * N + uj + dj;
      const dh = abs(ALT[ui + di][uj + dj] - ALT[ui][uj]);
      const c = g[u] + l * (ASFALTO.has(v) ? 2.6 : CALLES.has(v) ? 1 : 1.9) + dh * 1.5 + BLANDO[v];
      if (c < g[v]) { g[v] = c; prev[v] = u; meter(c + hdist(v), v); }
    }
  }
  const llego = prev[fin] !== -1 || fin === ini;
  const celdas = [];
  for (let v = llego ? fin : masCerca; v !== -1; v = prev[v]) celdas.unshift([floor(v / N), v % N]);
  // de celdas a puntos y suavizado (Chaikin) para que no camine en zigzag; si el suavizado
  // corta una esquina (mar, objeto o escalón alto), se usa uno más suave o la ruta tal cual
  const base = celdas.map(([i, j]) => [celdaX(i), celdaX(j)]);
  let pts = base;
  for (let it = 2; it >= 0; it--) {
    pts = base;
    for (let n = 0; n < it && pts.length > 2; n++) {
      const nv = [pts[0]];
      for (let k = 0; k < pts.length - 1; k++) {
        const [ax, az] = pts[k], [bx, bz] = pts[k + 1];
        nv.push([ax * 0.75 + bx * 0.25, az * 0.75 + bz * 0.25], [ax * 0.25 + bx * 0.75, az * 0.25 + bz * 0.75]);
      }
      nv.push(pts[pts.length - 1]);
      pts = nv;
    }
    if (!problemaRuta(pts)) break;
  }
  pts.llego = llego;
  return pts;
}

// revisa una ruta cada 0.3 mm: devuelve el primer problema (texto) o null
function problemaRuta(pts) {
  let hPrev = null;
  for (let k = 0; k < pts.length - 1; k++) {
    const [ax, az] = pts[k], [bx, bz] = pts[k + 1], n = max(1, ceil(dist(ax, az, bx, bz) / 0.3));
    for (let q = 0; q <= n; q++) {
      const x = lerp(ax, bx, q / n), z = lerp(az, bz, q / n), i = aCelda(x), j = aCelda(z);
      if (!ALT[i][j]) return `pisa el mar en (${x.toFixed(1)}, ${z.toFixed(1)})`;
      if (OCUPADO[i * N + j] && k > 0 && k < pts.length - 2) return `atraviesa un objeto en (${x.toFixed(1)}, ${z.toFixed(1)})`;
      const h = ALT[i][j];
      if (hPrev !== null && abs(h - hPrev) > PASO_MAX + 0.01) return `escalón de ${abs(h - hPrev).toFixed(1)} mm en (${x.toFixed(1)}, ${z.toFixed(1)})`;
      hPrev = h;
    }
  }
  return null;
}

function caminarA(k) {
  const L = LUGARES[k];
  const desde = celdaTierraCercana(yo.x, yo.z);
  const pts = buscarRuta(desde, L.destino);
  pts[0] = [yo.x, yo.z];
  yo.ruta = pts;
  yo.largos = [0];
  for (let n = 1; n < pts.length; n++) yo.largos.push(yo.largos[n - 1] + dist(pts[n - 1][0], pts[n - 1][1], pts[n][0], pts[n][1]));
  yo.total = yo.largos[yo.largos.length - 1];
  yo.s = 0;
  yo.vel = max(9, yo.total / 12);          // ningún viaje dura más de ~12 s
  yo.caminando = yo.total > 0.5;
  if (!yo.caminando) llegar();
}

function puntoRuta(s) {
  const { ruta, largos } = yo;
  let lo = 1, hi = largos.length - 1;   // primer tramo que termina más allá de s (búsqueda binaria)
  while (lo < hi) { const m = (lo + hi) >> 1; if (largos[m] < s) lo = m + 1; else hi = m; }
  const n = lo;
  const k = constrain((s - largos[n - 1]) / max(1e-6, largos[n] - largos[n - 1]), 0, 1);
  return [lerp(ruta[n - 1][0], ruta[n][0], k), lerp(ruta[n - 1][1], ruta[n][1], k), ruta[n][0] - ruta[n - 1][0], ruta[n][1] - ruta[n - 1][1]];
}

// ¿algún vehículo en marcha ocupa el camino de los próximos pasos? (el explorador le cede el paso)
function vehiculoDelante() {
  for (let d = 0.4; d <= 2.2; d += 0.6) {
    const [x, z] = puntoRuta(min(yo.total, yo.s + d));
    for (const a of VEHICULOS) {
      if (a.v < 0.2 && a.vuelta < 0 && a.cede && !a.retro && abs(a.lado - a.ladoMeta) < 0.1) continue;   // detenido esperándolo a él: pasa
      const p = poseVehiculo(a), dx = x - p.x, dz = z - p.z, c = cos(p.giro), s = sin(p.giro);
      if (abs(dx * c - dz * s) < a.ancho / 2 + 0.8 && abs(dx * s + dz * c) < a.largo / 2 + 0.8) return true;
    }
  }
  return false;
}

function moverExplorador(t, dt) {
  if (yo.caminando && vehiculoDelante()) { yo.ritmo = 0; mostrarProgreso(); }
  else if (yo.caminando) {
    // arranca suave y frena al llegar
    yo.ritmo = 0.35 + 0.65 * constrain(min(yo.s / 5, (yo.total - yo.s) / 5), 0, 1);
    yo.s = min(yo.total, yo.s + yo.vel * yo.ritmo * dt);
    const [x, z, dx, dz] = puntoRuta(yo.s);
    yo.x = x; yo.z = z;
    if (abs(dx) + abs(dz) > 1e-4) yo.giroObj = atan2(dx, dz);
    // huellas cada ~1 mm
    yo.pasoS += yo.vel * yo.ritmo * dt;
    if (yo.pasoS > 1) {
      yo.pasoS = 0; yo.lado *= -1;
      HUELLAS.push({ x: x + cos(yo.giro) * 0.3 * yo.lado, z: z - sin(yo.giro) * 0.3 * yo.lado, y: alturaEn(x, z), giro: yo.giro, t });
      if (yo.lado > 0) soltarPolvo(x, alturaEn(x, z), z, t);
      if (HUELLAS.length > 16) HUELLAS.shift();
    }
    mostrarProgreso();
    if (yo.s >= yo.total) { yo.caminando = false; llegar(); }
  }
  // gira suave hacia donde va
  let d = yo.giroObj - yo.giro;
  d = ((d + PI) % TWO_PI + TWO_PI) % TWO_PI - PI;
  yo.giro += d * min(1, dt * 8);
  yo.y = lerp(yo.y, alturaEn(yo.x, yo.z), min(1, dt * 14));
}

function llegar() {
  const L = LUGARES[actual];
  yo.llegoT = millis() / 1000;
  yo.giroObj = atan2(L.x - yo.x, L.z - yo.z);   // mira hacia el lugar
  tocadoT = yo.llegoT;
  dato = 0;
  tourSig = yo.llegoT + PAUSA_DATO;
  if (yo.total > 0.5) { celebrar(yo.llegoT); avisar(`📍 Llegaste a ${L.nombre}`); }
  el['ficha-sub'].textContent = subLugar(actual);
  if (!plegadoManual) plegar(false);
  mostrarDato();
}

function celdaDestino(L) {
  let mejor = null, md = Infinity;
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    const v = i * N + j, x = celdaX(i), z = celdaX(j);
    if (!ALCANCE[v] || dist(x, z, L.x, L.z) < 1.8) continue;
    const d = dist(x, z, L.x + 2.2, L.z + 2.2);
    if (d < md) { md = d; mejor = [i, j]; }
  }
  return mejor;
}

function construirTrozos(cubos) {
  const POR_TROZO = 2400;   // < 65 536 vértices por geometría
  const lista = [];
  for (let k = 0; k < cubos.length; k += POR_TROZO) {
    const parte = cubos.slice(k, k + POR_TROZO);
    lista.push(buildGeometry(() => {
      noStroke();
      for (const [x, y0, z, w, h, d, c, ry] of parte) {
        fill(c[0], c[1], c[2]);
        if (h === 0) { push(); translate(x, y0, z); rotateX(-HALF_PI); plane(w, d); pop(); continue; }   // solo la cara de arriba (mirando al cielo)
        push(); translate(x, y0 + h / 2, z); if (ry) rotateY(ry); box(w, h, d); pop();
      }
    }));
  }
  return lista;
}

// =====================================================================
// p5
// =====================================================================

function setup() {
  for (const id of ['estado', 'ficha', 'ficha-lugar', 'ficha-sub', 'ficha-badge', 'ficha-tag', 'ficha-titulo',
    'ficha-texto', 'ficha-num', 'lugares', 'ant', 'sig', 'guia', 'ficha-icono', 'ficha-puntos', 'contenido', 'toast', 'plegar'])
    el[id] = document.getElementById(id);
  gestosFicha();
  prepararFicha();

  NyAR.createARCanvas(window, { fit: 'cover' });
  TAM_RA = [width, height];                 // tamaño que necesita la cámara para el marcador
  addEventListener('resize', ajustarLienzo); // (se registra después del ajuste de nyar4p5, así corre al final)
  ar = new NyAR.MultiMarker(window, width, height);
  ar.addARMarker('hiro', TAMANO_MM);
  ar.setLostDelay(5);   // ~1/6 s sin verlo antes de darlo por perdido (menos parpadeo)

  textureMode(NORMAL);
  generarTerreno();
  nivelarCaminos();
  bloquesTerreno();
  const inicioObjetos = CUBOS.length;   // de aquí en adelante: caminos, casas y objetos
  // carreteras y trochas (con su señalización)
  for (const v of CARRETERAS) camino(v);
  senales();
  bloquesCiudad();
  bloquesLugares();
  bloquesDetalles();
  casas();               // las casas, al final: solo en los lotes que quedaron libres
  detallesDesierto();    // piedras y matorrales, lejos de vías y objetos
  marcarOcupado(inicioObjetos);
  // animales y personas: cada uno en un sitio libre; después ya no se puede pasar por encima
  crearColonias();
  crearPersonas();
  marcarPuestos();
  marcarTajo();
  trozos = construirTrozos(CUBOS);
  marcoGeo = construirTrozos(MARCO_CUBOS);
  construirEspuma();

  // a dónde se puede llegar caminando desde la ciudad, y dónde se para el explorador en cada
  // lugar: tierra firme alcanzable junto al pin (fuera de su haz de luz), un poco tierra adentro
  const T = L_('ciudad');
  calcularAlcance(celdaTierraCercana(T.x, T.z, 1.8));
  for (const L of LUGARES) L.destino = celdaDestino(L);
  crearNaves();
  crearTransito();
  crearVuelo();
  // (las texturas se pasan de p5.Graphics a p5.Image con .get(): p5 vuelve a subir a la GPU un
  //  Graphics cada vez que se usa, en cada cuadro; una Image solo se sube una vez)
  texCara = texturaCara([224, 172, 130], [60, 40, 30]).get();
  texCaraNpc = texturaCara([196, 146, 108], [30, 24, 20]).get();
  pixelado(texCara); pixelado(texCaraNpc);   // la carita de 8×8 se ve nítida, sin difuminar

  numTex = LUGARES.map((L, k) => {
    const g = createGraphics(64, 64);
    g.pixelDensity(1);
    g.background(...CAT[L.cat].color);
    g.fill(255); g.noStroke();
    g.textAlign(CENTER, CENTER); g.textStyle(BOLD); g.textSize(k + 1 > 9 ? 34 : 42);
    g.text(k + 1, 32, 35);
    return g.get();
  });
  texPlaca = createGraphics(1024, 96);
  texPlaca.pixelDensity(1);
  texPlaca.background(214, 178, 96);
  texPlaca.fill(70, 46, 24); texPlaca.textAlign(CENTER, CENTER); texPlaca.textStyle(BOLD); texPlaca.textSize(56);
  texPlaca.text('MARCONA · NASCA · ICA · PERÚ', 512, 50);
  texPlaca = texPlaca.get();
  texNorte = createGraphics(128, 128);
  texNorte.pixelDensity(1);
  texNorte.background(150, 108, 72);
  texNorte.fill(250, 240, 220); texNorte.noStroke();
  texNorte.triangle(64, 8, 40, 68, 88, 68);
  texNorte.textAlign(CENTER, CENTER); texNorte.textStyle(BOLD); texNorte.textSize(44);
  texNorte.text('N', 64, 98);
  texNorte = texNorte.get();

  crearBotones();
  const hash = location.hash.slice(1);
  const k = LUGARES.findIndex(L => L.id === hash);
  const inicio = LUGARES[k >= 0 ? k : 0].destino;     // el explorador aparece ya en el lugar inicial
  yo.x = celdaX(inicio[0]); yo.z = celdaX(inicio[1]); yo.y = alturaEn(yo.x, yo.z);
  elegir(k >= 0 ? k : 0, true);
  el.tour = document.getElementById('tour');
  el.barra = document.getElementById('ficha-barra');
  el.tour.addEventListener('click', () => alternarTour());

  for (const b of document.querySelectorAll('.seg button')) b.addEventListener('click', () => cambiarModo(b.dataset.m));
  el.ant.addEventListener('click', () => elegir((actual + LUGARES.length - 1) % LUGARES.length));
  el.sig.addEventListener('click', () => elegir((actual + 1) % LUGARES.length));
  controles(document.querySelector('canvas'));
  cambiarModo(new URLSearchParams(location.search).get('modo') === 'hiro' ? 'ra' : '3d');
  if (window.verificarMapa) verificarMapa();   // marcona.html?verificar → informe de choques
}

function draw() {
  actualizar();
  if (modo === '3d') { ajustarResolucion(); return dibujar3D(); }

  if (ar.error) { background(0); return estado('error', 'Error: ' + ar.error.message); }
  if (!ar.ready) { background(0); return estado('', 'Cargando motor de RA…'); }
  if (!detectar()) { background(0); return estado('', 'Acepta el permiso de la cámara'); }
  // sin cuadro nuevo de la cámara no hay nada nuevo que mostrar: se deja la imagen anterior
  // en pantalla (la cámara da ~30 cuadros por segundo; así la GPU trabaja la mitad)
  if (!camCuadro.dibujar) return;
  camCuadro.dibujar = false;
  background(0);

  ar.applyCamera();
  ar.drawBackground();
  const hay = ar.isExist(0);
  el.ficha.classList.toggle('visible', hay);
  el.guia.classList.toggle('visible', !hay);
  if (!hay) return estado('', visto ? 'Busca otra vez el marcador Hiro' : 'Apunta al marcador Hiro');
  visto = true;
  estado('ok', LUGARES[actual].nombre);

  ar.beginTransform(0);
  push();
  rotateX(HALF_PI);   // +Y arriba, +Z hacia quien mira
  translate(0, 8.2, 0); // el marco de madera queda apoyado sobre el papel
  luces();
  escena();
  pop();
  ar.endTransform();
}

// ---------- cámara del modo RA: procesar solo cuadros nuevos ----------
// La búsqueda del marcador es lo más caro del modo RA. La cámara entrega ~30 cuadros por
// segundo y el dibujo va a 60: buscar dos veces en el mismo cuadro no sirve de nada.
const camCuadro = { video: null, nuevo: true, ok: false, vigila: false, dibujar: true };
function detectar() {
  const v = cam && cam.elt;
  if (v !== camCuadro.video) {   // cámara nueva: avisar cuando llegue cada cuadro
    Object.assign(camCuadro, { video: v, nuevo: true, ok: false, vigila: false });
    if (v && v.requestVideoFrameCallback) {
      const cb = () => { camCuadro.nuevo = true; if (camCuadro.video === v) v.requestVideoFrameCallback(cb); };
      v.requestVideoFrameCallback(cb);
      camCuadro.vigila = true;
    }
  }
  if (camCuadro.vigila && !camCuadro.nuevo && camCuadro.ok) return true;
  camCuadro.nuevo = false;
  camCuadro.ok = ar.detect(cam);
  camCuadro.dibujar = true;
  return camCuadro.ok;
}

// ---------- resolución adaptativa (vista 3D) ----------
// Si el equipo no llega a ~45 cuadros por segundo, se baja un poco la nitidez del lienzo (casi no
// se nota y alivia mucho a la GPU); si vuelve a sobrar tiempo, se sube. Cambia como mucho cada
// 2.5 s y, si sube y vuelve a trabarse, ya no insiste.
const RES = { prom: 16.7, factor: 1, cambio: 0, bajoT: -1e9, subio: false, techo: 1 };
function ajustarResolucion() {
  const t = millis();
  if (deltaTime > 250) return;               // pestaña en segundo plano: no cuenta
  RES.prom = lerp(RES.prom, deltaTime, 0.04);
  if (t < 4000 || t - RES.cambio < 2500) return;
  if (RES.prom > 22 && RES.factor > 0.5) {
    if (RES.subio) RES.techo = RES.factor;   // subir no funcionó: este es el techo
    RES.factor = max(0.5, RES.factor - 0.15); RES.cambio = RES.bajoT = t; RES.subio = false;
    ajustarLienzo();
  } else if (RES.prom < 17.5 && RES.factor < RES.techo - 0.01 && t - RES.bajoT > 8000) {
    RES.factor = min(RES.techo, RES.factor + 0.1); RES.cambio = t; RES.subio = true;
    ajustarLienzo();
  }
}

let camManualT = -1e9;   // última vez que la persona movió la cámara
function angDif(a, b) { return ((a - b + PI) % TWO_PI + TWO_PI) % TWO_PI - PI; }

// avanza al explorador y el recorrido automático (en los dos modos)
function actualizar() {
  const t = millis() / 1000, dt = min(0.1, deltaTime / 1000);
  moverExplorador(t, dt);
  moverPersonas(dt);
  moverTransito(dt);
  if (tour && !yo.caminando && t > tourSig) {
    if (dato < LUGARES[actual].datos.length - 1) { dato++; mostrarDato(); tourSig = t + PAUSA_DATO; }
    else elegir((actual + 1) % LUGARES.length, false, true);
  }
  if (tour && !yo.caminando) el.barra.style.width = `${(1 - (tourSig - t) / PAUSA_DATO) * 100}%`;
}

function dibujar3D() {
  background(158, 204, 230);
  const t = millis() / 1000, dt = min(0.1, deltaTime / 1000);
  // cámara de seguimiento: si nadie la está moviendo a mano, se pone detrás del explorador
  // y lo sigue de cerca mientras camina; al llegar se aleja un poco y gira despacio alrededor
  if (t - camManualT > 3) {
    if (yo.caminando) {
      // detrás del explorador, pero siempre del lado del mar (así los molinos y cerros no tapan la vista)
      const ladoMar = -1.35, detras = yo.giro + PI + 0.35;
      const meta = ladoMar + constrain(angDif(detras, ladoMar), -1.1, 1.1);
      orb.yawObj = orb.yaw + angDif(meta, orb.yaw);
      orb.pitchObj = 0.42; orb.distObj = 38;
    } else if (t - yo.llegoT < 5) {
      orb.pitchObj = 0.55; orb.distObj = 62;
    } else {
      orb.yawObj += dt * 0.07; orb.pitchObj = 0.62; orb.distObj = min(orb.distObj + dt * 4, 80);
    }
  }
  const k = 1 - pow(0.03, dt);
  const adelante = yo.caminando ? 4 : 0;   // mira un poco por delante de sus pasos
  orb.tx = lerp(orb.tx, yo.x + sin(yo.giro) * adelante, k * 1.6);
  orb.tz = lerp(orb.tz, yo.z + cos(yo.giro) * adelante, k * 1.6);
  orb.ty = lerp(orb.ty, yo.y + 2, k * 1.6);
  orb.yaw = lerp(orb.yaw, orb.yawObj, min(1, k * 1.2));
  orb.pitch = lerp(orb.pitch, orb.pitchObj, min(1, k * 1.2));
  orb.dist = lerp(orb.dist, orb.distObj, min(1, k));

  // si la tarjeta ocupa el ancho de abajo, corre el centro de la imagen hacia arriba
  // para que el explorador quede en la parte libre de la pantalla
  const near = 2, top = near * tan(PI / 6), right = top * width / height;
  desplazY = lerp(desplazY, fichaFrac, min(1, dt * 4));
  const oy = top * desplazY;
  frustum(-right, right, -top - oy, top - oy, near, 5000);
  const ex = orb.tx + orb.dist * cos(orb.pitch) * sin(orb.yaw);
  // la cámara nunca se mete dentro de un cerro
  const ey = max(orb.ty + orb.dist * sin(orb.pitch), alturaEn(orb.tx + orb.dist * cos(orb.pitch) * sin(orb.yaw), orb.tz + orb.dist * cos(orb.pitch) * cos(orb.yaw)) + 4);
  const ez = orb.tz + orb.dist * cos(orb.pitch) * cos(orb.yaw);
  camera(ex, -ey, ez, orb.tx, -orb.ty, orb.tz, 0, 1, 0);
  scale(1, -1, 1);    // +Y arriba, igual que sobre el marcador
  luces();
  escena();
}
let desplazY = 0, fichaFrac = 0;

// =====================================================================
// ESCENA ANIMADA
// =====================================================================

function escena() {
  const t = millis() / 1000;
  noStroke();
  for (const g of trozos) model(g);
  for (const g of marcoGeo) model(g);   // marco de madera de la maqueta
  placas();
  turbinas(t);
  naves(t);
  avioneta(t);
  pinguinos(t);
  lobos(t);
  aves(t);
  gaviotas(t);
  condor(t);
  camiones(t);
  vehiculos();
  nubes(t);
  personas(t);
  huellas(t);
  rutaPrevia(t);
  explorador(t);
  for (let k = 0; k < LUGARES.length; k++) pin(k, t);
  efectos(t);         // partículas y brillos (semitransparentes)
  agua(t);            // al final: es semitransparente
}

// ---------- efectos ligeros (pocas piezas, con vida corta) ----------

const POLVO = [];      // nubecitas de arena al caminar
const CHISPAS = [];    // estallido al llegar
let llegadaFx = -1e9;

function soltarPolvo(x, y, z, t) {
  POLVO.push({ x, y, z, t, r: random(TWO_PI) });
  if (POLVO.length > 14) POLVO.shift();
}

function celebrar(t) {
  llegadaFx = t;
  CHISPAS.length = 0;
  for (let k = 0; k < 18; k++) {
    const a = k / 18 * TWO_PI;
    CHISPAS.push({ vx: cos(a) * random(3, 6), vz: sin(a) * random(3, 6), vy: random(6, 11), c: [CAT_COLOR_ACTUAL(), [255, 230, 120], [255, 255, 255]][k % 3] });
  }
}
function CAT_COLOR_ACTUAL() { return CAT[LUGARES[actual].cat].color; }

function efectos(t) {
  // polvo
  for (const p of POLVO) {
    const e = (t - p.t) / 0.9;
    if (e > 1) continue;
    fill(236, 214, 170, 170 * (1 - e));
    push(); translate(p.x, p.y + 0.2 + e * 0.8, p.z); rotateY(p.r + e); box(0.4 + e * 1.1); pop();
  }
  // estallido de llegada: chispas con gravedad + anillo que se expande
  const e = t - llegadaFx;
  if (e < 1.4) {
    for (const c of CHISPAS) {
      const y = c.vy * e - 9 * e * e;
      if (y < -0.5) continue;
      fill(...c.c, 255 * (1 - e / 1.4));
      push(); translate(yo.x + c.vx * e, yo.y + 1 + y, yo.z + c.vz * e); rotateY(e * 6); rotateX(e * 4); box(0.35); pop();
    }
    const r = 1 + e * 6;
    fill(...CAT_COLOR_ACTUAL(), 200 * (1 - e / 1.4));
    for (const [a, b, w, d] of [[0, r, r * 2, 0.3], [0, -r, r * 2, 0.3], [r, 0, 0.3, r * 2], [-r, 0, 0.3, r * 2]])
      caja(yo.x + a, yo.y + 0.1, yo.z + b, w, 0.1, d);
  }
  // haz de luz sobre el lugar elegido
  const L = LUGARES[actual];
  fill(...CAT_COLOR_ACTUAL(), 34 + 14 * sin(t * 2));
  caja(L.x, alturaEn(L.x, L.z), L.z, 2.4, 34, 2.4);
}

// ---------- el explorador ----------

function texturaCara(piel, ojo) {
  const g = createGraphics(8, 8);
  g.pixelDensity(1); g.noStroke();
  g.background(...piel);
  g.fill(70, 44, 30); g.rect(0, 0, 8, 2);                     // pelo / flequillo
  g.fill(255); g.rect(1, 3, 2, 2); g.rect(5, 3, 2, 2);         // ojos
  g.fill(...ojo); g.rect(2, 3, 1, 2); g.rect(5, 3, 1, 2);
  g.fill(236, 130, 120); g.rect(1, 5, 1, 1); g.rect(6, 5, 1, 1); // mejillas
  g.fill(150, 70, 60); g.rect(3, 6, 2, 1);                     // sonrisa
  return g;
}

function persona(t, o) {
  // o: { camina (0..1), saluda (0..1), cara, polo, pantalon, sombrero, mochila }
  const f = t * 9, paso = sin(f) * o.camina;
  translate(0, abs(sin(f)) * 0.15 * o.camina, 0);
  // piernas y zapatos
  for (const s of [-1, 1]) {
    push(); translate(s * 0.26, 1.15, 0); rotateX(paso * s * 0.7);
    fill(...o.pantalon); caja(0, -1, 0, 0.42, 1, 0.42);
    if (!o.simple) { fill(50, 40, 36); caja(0, -1.15, 0.08, 0.46, 0.22, 0.6); }
    pop();
  }
  // torso y cinturón
  fill(...o.polo); caja(0, 1.1, 0, 1.05, 1.15, 0.62);
  if (!o.simple) { fill(90, 60, 40); caja(0, 1.1, 0, 1.07, 0.14, 0.64); }
  // mochila
  if (o.mochila) {
    fill(150, 100, 56); caja(0, 1.2, -0.48, 0.8, 0.85, 0.36);
    fill(120, 80, 44); caja(0, 1.9, -0.48, 0.82, 0.18, 0.38);
  }
  // brazos (el derecho saluda al llegar)
  for (const s of [-1, 1]) {
    push(); translate(s * 0.68, 2.15, 0);
    if (s === 1 && o.saluda > 0) rotateZ(2.6 * o.saluda + sin(t * 14) * 0.25 * o.saluda);
    else rotateX(-paso * s * 0.8);
    if (o.simple) { fill(...o.polo); caja(0, -0.95, 0, 0.3, 0.95, 0.32); }
    else {
      fill(...o.polo); caja(0, -0.45, 0, 0.32, 0.45, 0.34);
      fill(...o.piel); caja(0, -0.95, 0, 0.28, 0.5, 0.3);
    }
    pop();
  }
  // cabeza con cara pixelada
  push(); translate(0, 2.25, 0);
  rotateY(sin(t * 0.9) * 0.25 * (1 - o.camina));
  fill(...o.piel); caja(0, 0, 0, 0.92, 0.92, 0.88);
  if (!o.simple) { push(); translate(0, 0.46, 0.445); lamina(o.cara, 0.92, 0.92); pop(); }
  fill(70, 44, 30); caja(0, 0.72, -0.05, 0.96, 0.22, 0.9);     // pelo
  if (o.sombrero) {
    fill(...o.sombrero); caja(0, 0.92, 0, 1.5, 0.1, 1.5);       // ala
    caja(0, 1.0, 0, 1.0, 0.38, 1.0);                            // copa
    fill(160, 60, 40); caja(0, 1.0, 0, 1.02, 0.1, 1.02);        // cinta
  }
  pop();
}

function explorador(t) {
  const saluda = max(0, 1 - abs((t - yo.llegoT) - 1) / 1);   // saluda ~2 s al llegar
  push();
  translate(yo.x, yo.y, yo.z);
  // sombra
  fill(0, 0, 0, 70); push(); translate(0, 0.06, 0); rotateX(HALF_PI); plane(1.6, 1.3); pop();
  // indicador "tú" flotando
  push();
  translate(0, 5.2 + sin(t * 3) * 0.3, 0);
  rotateY(t * 2); rotateZ(QUARTER_PI); rotateX(QUARTER_PI);
  fill(255, 179, 92); box(0.8);
  pop();
  // saltito de alegría al llegar y respiración suave cuando está quieto
  const e = t - yo.llegoT;
  if (e < 0.55) translate(0, sin(e / 0.55 * PI) * 1.1, 0);
  rotateY(yo.giro);
  if (!yo.caminando) scale(1, 1 + sin(t * 2.2) * 0.015, 1);
  persona(t, {
    camina: yo.caminando ? yo.ritmo : 0, saluda, cara: texCara, piel: [224, 172, 130],
    polo: [230, 70, 60], pantalon: [50, 70, 120], sombrero: [222, 196, 140], mochila: true,
  });
  pop();
}

function huellas(t) {
  for (const h of HUELLAS) {
    const a = 1 - (t - h.t) / 10;
    if (a <= 0) continue;
    fill(110, 82, 56, 150 * a);
    push(); translate(h.x, h.y + 0.04, h.z); rotateY(h.giro); box(0.28, 0.04, 0.45); pop();
  }
}

function rutaPrevia(t) {
  // puntitos naranjas sobre el camino que falta recorrer
  if (!yo.caminando) return;
  fill(255, 160, 60);
  for (let s = yo.s + 2; s < min(yo.total, yo.s + 60); s += 3) {
    const [x, z] = puntoRuta(s);
    const b = 0.5 + 0.5 * sin(t * 6 - s * 0.5);
    push(); translate(x, alturaEn(x, z) + 0.2 + b * 0.2, z); box(0.45 + b * 0.2, 0.15, 0.45 + b * 0.2); pop();
  }
  const L = LUGARES[actual], d = L.destino;   // bandera de llegada
  const x = celdaX(d[0]), z = celdaX(d[1]), y = alturaEn(x, z);
  fill(255); caja(x, y, z, 0.15, 3, 0.15);
  fill(...CAT[L.cat].color); caja(x + 0.6, y + 2.2, z, 1.1, 0.7, 0.08);
}

function caja(x, y, z, w, h, d) { push(); translate(x, y + h / 2, z); box(w, h, d); pop(); }

function lamina(tex, w, h) {
  texture(tex);
  beginShape(TRIANGLE_FAN);
  normal(0, 0, 1);
  vertex(-w / 2, h / 2, 0, 0, 0); vertex(w / 2, h / 2, 0, 1, 0);
  vertex(w / 2, -h / 2, 0, 1, 1); vertex(-w / 2, -h / 2, 0, 0, 1);
  endShape();
}

function placas() {
  // placa con el nombre en el borde sur y la rosa de los vientos al norte
  push(); translate(0, -3.6, N * C / 2 + MARCO + 0.02); lamina(texPlaca, 70, 6.5); pop();
  push(); translate(0, 0.02, -(N * C / 2 + MARCO / 2)); rotateX(-HALF_PI); lamina(texNorte, 6, 6); pop();
}

function agua(t) {
  // superficie semitransparente: deja ver el fondo claro de la orilla
  // espuma: tres grupos precalculados que suben y se hunden por turnos (3 llamadas en vez de cientos)
  for (let g = 0; g < ESPUMA.length; g++) {
    push(); translate(0, MAR_Y - 0.28 + 0.42 * max(0, sin(t * 2.1 + g * 2.1)), 0); model(ESPUMA[g]); pop();
  }
  push();
  specularMaterial(200, 220, 235); shininess(60);   // brillo del sol sobre el mar
  fill(46, 128, 176, 150);
  translate(0, MAR_Y, 0); rotateX(HALF_PI); plane(N * C, N * C);
  pop();
  specularMaterial(0); shininess(1);
  fill(255, 255, 255, 120);
  for (let k = 0; k < 7; k++) {
    const d = ((t * 5 + k * 12) % 84) - 42;      // líneas de oleaje hacia la costa
    push(); translate(d - 20, MAR_Y + 0.06, 0);   // avanzan de oeste a este, hacia la costa
    box(0.35, 0.05, 110 + 10 * sin(k)); pop();
  }
  // destellos del sol que titilan en el agua
  fill(255, 255, 240);
  for (let k = 0; k < 16; k++) {
    const b = sin(t * 3 + k * 7.3);
    if (b < 0.75) continue;
    const x = -55 + azar(k, 1, 9) * 70, z = -20 + azar(k, 2, 9) * 75;
    if (esTierra(x, z)) continue;
    const s = (b - 0.75) * 3;
    push(); translate(x, MAR_Y + 0.08, z); rotateY(t + k); box(0.9 * s, 0.04, 0.2 * s); box(0.2 * s, 0.04, 0.9 * s); pop();
  }
}

const ESPUMA = [];
function construirEspuma() {
  for (let g = 0; g < 3; g++) {
    ESPUMA.push(buildGeometry(() => {
      noStroke(); fill(250, 252, 255);
      for (const [x, z, f] of ORILLA) {
        if (floor(f / TWO_PI * 3) !== g) continue;
        push(); translate(x, 0, z); box(C * 0.95, 0.3, C * 0.95); pop();
      }
    }));
  }
}

// =====================================================================
// ACTORES ANIMADOS
// Cada actor tiene una POSE (dónde está y hacia dónde mira en el instante t) separada de su
// DIBUJO: así ?verificar puede revisar choques sin dibujar nada.
// Los cuerpos se "hornean" una sola vez con buildGeometry() y se dibujan con model(): una
// llamada a la GPU por actor, en vez de una por cada caja (de ~495 llamadas por cuadro a ~200).
// Lo que se mueve dentro del cuerpo (alas, pasos) se guarda en unas pocas poses fijas.
// =====================================================================

const GEO = new Map();
function geo(clave, dibujo) {
  let g = GEO.get(clave);
  if (!g) { g = buildGeometry(() => { noStroke(); dibujo(); }); GEO.set(clave, g); }
  return g;
}
function cuantizar(v, n) { return round(constrain(v, 0, 1) * (n - 1)); }   // 0..1 → 0..n-1

// ---------- animales en tierra: colonias colocadas en sitios libres ----------

const PINGUINOS = [], LOBOS = [];
function juntoAlMar(x, z, d = 3.5) {
  for (let a = 0; a < 8; a++) if (!esTierra(x + cos(a * QUARTER_PI) * d, z + sin(a * QUARTER_PI) * d)) return true;
  return false;
}
// recorre una espiral desde (cx, cz) y pone un animal en cada sitio libre hasta completar n
function colonia(lista, cx, cz, n, r, radio, extra) {
  const antes = lista.length;
  for (let d = 0; d <= radio && lista.length - antes < n; d += 0.6) {
    const m = max(1, ceil(d * 4));
    for (let q = 0; q < m && lista.length - antes < n; q++) {
      const a = q / m * TWO_PI + d * 1.3, x = cx + cos(a) * d, z = cz + sin(a) * d;
      if (!sitioLibre(x, z, r, { tol: 1.2 }) || (extra && !extra(x, z))) continue;
      lista.push({ x, z, k: lista.length, giro: azar(round(x * 10), round(z * 10), 5) * TWO_PI });
      PUESTOS.push([x, z, r, false]);
    }
  }
}
function crearColonias() {
  const P = L_('punta'), L = L_('leones'), B = L_('lobera');
  colonia(PINGUINOS, P.x, P.z - 1, 11, 0.9, 8);
  const orilla = (x, z) => juntoAlMar(x, z, 4.5);
  colonia(LOBOS, L.x - 3, L.z + 1, 6, 1.3, 12, orilla);
  colonia(LOBOS, B.x - 3, B.z + 1, 4, 1.3, 12, orilla);
  colonia(LOBOS, P.x - 3, P.z + 5, 3, 1.3, 9, orilla);
}

function posePinguino(p, t) {
  const g = -QUARTER_PI + sin(t * 0.5 + p.k * 1.3) * 1.2;
  return { x: p.x + sin(t * 0.5 + p.k) * 0.4, z: p.z, giro: g };
}
function pinguinos(t) {
  const cuerpo = geo('pinguino', () => {
    fill(26, 26, 31); caja(0, 0, 0, 0.8, 1.6, 0.7);
    caja(0, 1.6, 0.05, 0.6, 0.55, 0.6);
    fill(238, 238, 228); caja(0, 0.15, 0.36, 0.55, 1.05, 0.04);
    fill(236, 136, 142); caja(0, 1.7, 0.4, 0.25, 0.22, 0.3);
  });
  for (const p of PINGUINOS) {
    const q = posePinguino(p, t);
    push();
    translate(q.x, alturaEn(q.x, q.z) + abs(sin(t * 6 + p.k)) * 0.2, q.z);
    rotateY(q.giro);
    rotateZ(sin(t * 6 + p.k) * 0.12);
    model(cuerpo);
    pop();
  }
}

function lobos(t) {
  for (const p of LOBOS) {
    const alza = cuantizar(max(0, sin(t * 1.1 + p.k * 1.7)), 5);   // 5 poses de cabeza
    push();
    translate(p.x, alturaEn(p.x, p.z), p.z);
    rotateY(p.giro);
    model(geo('lobo' + alza, () => {
      const a = alza / 4;
      fill(160, 112, 72); caja(0, 0, 0, 1.4, 0.9, 2.8);
      fill(176, 128, 84); caja(0, 0, 1.2, 1.2, 1.2 + a * 0.6, 1);
      push(); translate(0, 1.1 + a * 0.7, 1.6); rotateX(-a * 0.5); fill(150, 104, 66); caja(0, 0, 0, 0.9, 0.8, 1.1); pop();
      fill(130, 90, 58); for (const s of [-1, 1]) caja(s * 0.8, 0, 0.8, 0.6, 0.15, 0.9);
    }));
    pop();
  }
}

// ---------- vecinos y turistas ----------
// Cada uno pasea de ida y vuelta por un tramo que se revisó al colocarlo (sin casas, mar ni
// vías donde no corresponde). Si el explorador se acerca, se detiene, lo mira y lo saluda.

function crearPersonas() {
  const polos = [[60, 140, 200], [250, 200, 60], [90, 170, 100], [240, 240, 236], [200, 90, 160], [240, 140, 60]];
  const pantalones = [[50, 70, 120], [60, 60, 64], [120, 100, 80], [40, 50, 90]];
  const T = L_('ciudad'), P = L_('playas'), M = L_('punta');
  const px = celdaX(aCelda(T.x)), pz = celdaX(aCelda(T.z));
  const sitios = [];   // [x, z, tipo (0 vecino, 1 bañista, 2 turista), ¿puede pisar calles?]
  for (let k = 0; k < 5; k++) { const a = k * 1.25; sitios.push([px + cos(a) * 3.8, pz + sin(a) * 3.8, 0, true]); }
  for (let k = 0; k < 4; k++) sitios.push([P.x - 4 + k * 2.8, P.z - 5 + k * 2.5, 1, false]);
  for (let k = 0; k < 3; k++) sitios.push([MUELLE.x + 2 + k * 1.6, MUELLE.z + 2 + k * 1.2, 0, false]);
  for (let k = 0; k < 3; k++) sitios.push([M.x + 7 + k * 1.1, M.z - 6.5 + k * 0.5, 2, false]);   // turistas en el mirador
  const R = 0.45;
  sitios.forEach(([x0, z0, tipo, via], k) => {
    const base = buscarSitio(x0, z0, R, { via }, 4);
    if (!base) return;
    // tramo de paseo: prueba 8 direcciones y dos largos; si ninguno está libre, se queda en su sitio
    let giro = azar(k, 3, 1) * TWO_PI, amp = 0;
    buscar: for (const A of [1.2, 0.7]) for (let q = 0; q < 8; q++) {
      const g = giro + q * QUARTER_PI;
      let ok = true;
      for (let s = -A; s <= A + 1e-6 && ok; s += 0.3) ok = sitioLibre(base[0] + sin(g) * s, base[1] + cos(g) * s, R, { via });
      if (ok) { giro = g; amp = A; break buscar; }
    }
    PERSONAS.push({
      x: base[0], z: base[1], giro, amp, fase: azar(k, 4, 1) * 10, tipo, id: k, reloj: 0, mira: 0, ox: 0, oz: 0,
      polo: polos[k % polos.length], pantalon: pantalones[k % pantalones.length],
      sombrero: tipo === 1 && k % 2 ? [250, 250, 245] : null,
    });
    for (let s = -amp; s <= amp + 1e-6; s += 0.6) PUESTOS.push([base[0] + sin(giro) * s, base[1] + cos(giro) * s, R, true]);
  });
}

// avanza el paseo de cada persona; si el explorador está cerca, se detiene y lo mira
function moverPersonas(dt) {
  for (const p of PERSONAS) {
    const q = posePersona(p, p.reloj), d = dist(q.x, q.z, yo.x, yo.z);
    const cerca = d < 3.2;
    p.mira = constrain(p.mira + (cerca ? dt * 3 : -dt * 1.5), 0, 1);
    if (!cerca) p.reloj += dt;
    // si el explorador pasa muy cerca, da unos pasos al costado (solo si ahí hay espacio libre)
    let ox = 0, oz = 0;
    if (d < 1.6 && yo.caminando) {
      const k = (1.6 - d) * 1.1, ax = (q.x - yo.x) / max(d, 1e-3), az = (q.z - yo.z) / max(d, 1e-3);
      if (todoTierra(q.x - p.ox + ax * k, q.z - p.oz + az * k, 0.3) && !objetoCerca(q.x - p.ox + ax * k, q.z - p.oz + az * k, 0.3)) { ox = ax * k; oz = az * k; }
    }
    p.ox = lerp(p.ox, ox, min(1, dt * 8)); p.oz = lerp(p.oz, oz, min(1, dt * 8));
  }
}
function posePersona(p, reloj) {
  const a = reloj * 0.4 + p.fase, ida = sin(a);
  return {
    x: p.x + sin(p.giro) * ida * p.amp + p.ox, z: p.z + cos(p.giro) * ida * p.amp + p.oz,
    giro: p.giro + (cos(a) < 0 ? PI : 0), anda: p.amp > 0 && abs(cos(a)) > 0.3 ? 0.6 : 0,
  };
}

function personas(t) {
  for (const p of PERSONAS) {
    const q = posePersona(p, p.reloj);
    let giro = q.giro, anda = p.mira > 0.3 ? 0 : q.anda;
    if (p.mira > 0) giro += angDif(atan2(yo.x - q.x, yo.z - q.z), giro) * p.mira;   // gira hacia el explorador
    const saluda = max(p.tipo === 2 ? max(0, sin(t * 0.7 + p.fase)) * 0.6 : 0, p.mira);
    // pose horneada: 6 cuadros de caminata, o 4 de saludo, o quieto
    let clave, tq;
    if (anda) { const c = floor((((t + p.fase) * 9 / TWO_PI) % 1) * 6); clave = 'a' + c; tq = (c + 0.5) / 6 * TWO_PI / 9; }
    else if (saluda > 0.05) { const c = floor((((t + p.fase) * 14 / TWO_PI) % 1) * 4); clave = 's' + c + '_' + cuantizar(saluda, 4); tq = (c + 0.5) / 4 * TWO_PI / 14; }
    else { clave = 'q'; tq = 0; }
    const s = clave[0] === 's' ? cuantizar(saluda, 4) / 3 : 0;
    push();
    translate(q.x, alturaEn(q.x, q.z), q.z);
    rotateY(giro);
    scale(0.75);
    model(geo('npc' + p.id + clave, () => persona(tq, {
      camina: anda, saluda: s, cara: texCaraNpc, piel: [196, 146, 108],
      polo: p.polo, pantalon: p.pantalon, sombrero: p.sombrero, mochila: false, simple: true,
    })));
    pop();
  }
}

// ---------- todo lo que navega ----------

// barquitos navegando en óvalos por el mar abierto (?verificar comprueba que siempre van por agua)
const FLOTA = [
  { cx: -51, cz: 30,  rx: 6,  rz: 9,   v: 0.11,  tipo: 'velero',   casco: [245, 245, 240], vela: [255, 255, 252], f: 0 },
  { cx: -14, cz: 48,  rx: 9,  rz: 4,   v: -0.15, tipo: 'velero',   casco: [40, 90, 160],   vela: [255, 214, 120], f: 2 },
  { cx: -24, cz: 57,  rx: 6,  rz: 2.5, v: 0.2,   tipo: 'bote',     casco: [60, 170, 120], f: 1 },
  { cx: -44, cz: 51,  rx: 8,  rz: 6,   v: 0.09,  tipo: 'pesquero', casco: [220, 70, 60], f: 4 },
  { cx: -16, cz: -38, rx: 6,  rz: 4,   v: 0.22,  tipo: 'bote',     casco: [250, 200, 60], f: 3 },
  { cx: -46, cz: -50, rx: 9,  rz: 6,   v: -0.12, tipo: 'velero',   casco: [200, 60, 60],  vela: [240, 240, 236], f: 5 },
  // dos botes que salen a pescar frente a las rocas (mismo óvalo, en lados opuestos)
  { cx: -30, cz: 31,  rx: 8,  rz: 6,   v: 0.22,  tipo: 'bote',     casco: [250, 200, 60], f: 0 },
  { cx: -30, cz: 31,  rx: 8,  rz: 6,   v: 0.22,  tipo: 'bote',     casco: [240, 240, 236], f: Math.PI },
];
function elipse(b, t) {
  const a = t * b.v + b.f, s = Math.sign(b.v);
  return [b.cx + cos(a) * b.rx, b.cz + sin(a) * b.rz, atan2(-sin(a) * b.rx * s, cos(a) * b.rz * s)];
}

const NAVES = [];   // { tipo, pose(t) → [x, z, giro], largo, ancho, f, estela }
function crearNaves() {
  const cols = [[40, 110, 190], [220, 70, 60], [250, 200, 60], [240, 240, 236], [60, 170, 120]];
  const g0 = atan2(-0.26, -0.97);
  // botes amarrados a los lados del muelle de la caleta
  for (let k = 0; k < 5; k++) {
    const lado = k % 2 ? 1 : -1, a = 3 + k * 2;
    const x = MUELLE.x - 0.26 * a + 0.97 * lado * 2.2, z = MUELLE.z - 0.97 * a - 0.26 * lado * 2.2;
    NAVES.push({ tipo: 'bote', casco: cols[k], f: k, largo: 3.6, ancho: 1.4, pose: t => [x, z, g0 + sin(t + k) * 0.08] });
  }
  for (const b of FLOTA) NAVES.push({ ...b, largo: 3.6, ancho: 1.4, estela: true, pose: t => elipse(b, t) });
  // un mineralero que espera mar adentro, frente a la bahía
  NAVES.push({ tipo: 'mineralero', f: 0, largo: 12, ancho: 3.5, pose: t => [-38 + sin(t * 0.05) * 3, -30, 0.8] });
}

function dibujoNave(b) {
  if (b.tipo === 'mineralero') {
    fill(40, 44, 52); caja(0, -0.3, 0, 3.4, 1.6, 12);
    fill(150, 40, 36); caja(0, -0.3, 0, 3.5, 0.5, 12.1);
    fill(240); caja(0, 1.3, -4.8, 3, 2.2, 2);
    return;
  }
  fill(...b.casco); caja(0, 0, 0, 1.4, 0.65, 3.6);
  fill(...tono(b.casco, 0.7)); caja(0, 0.65, 0, 1.45, 0.12, 3.65);
  if (b.tipo === 'velero') {
    fill(120, 90, 60); caja(0, 0.6, 0.3, 0.14, 5, 0.14);              // mástil
    fill(...b.vela);
    push(); translate(0.12, 0, 0.3); rotateY(0.25 * Math.sign(b.v));
    caja(0, 1.0, -0.9, 0.06, 1.3, 1.8); caja(0, 2.3, -0.65, 0.06, 1.3, 1.3); caja(0, 3.6, -0.4, 0.06, 1.3, 0.8);
    pop();
    caja(0, 1, 1.3, 0.06, 2.6, 0.7);                                   // foque
  } else if (b.tipo === 'pesquero') {
    fill(250, 250, 246); caja(0, 0.7, 0.6, 1.1, 1.2, 1.3);
    fill(40, 60, 90); caja(0, 1.5, 0.95, 1.12, 0.3, 0.1);               // ventanas
    fill(60, 60, 64); caja(0, 0.7, -1, 0.12, 2.2, 0.12); caja(0, 2.6, -1.4, 0.1, 0.1, 1.2);  // pluma de la red
    fill(70, 110, 90); caja(0, 0.7, -1.3, 1, 0.3, 0.9);                 // red
  } else {
    fill(250, 250, 246); caja(0, 0.6, -0.4, 0.9, 0.7, 0.9);
    fill(50); caja(0, 0.45, -1.8, 0.4, 0.6, 0.3);                       // motor fuera de borda
  }
}

function naves(t) {
  NAVES.forEach((b, i) => {
    const [x, z, g] = b.pose(t);
    if (b.estela) {   // estela: espuma que queda atrás
      push(); translate(x, MAR_Y + 0.05, z); rotateY(g);
      fill(250, 252, 255, 140); caja(0, 0, -2.4, 1.0, 0.06, 1.4);
      fill(250, 252, 255, 80); caja(0, 0, -3.8, 0.6, 0.06, 1.2);
      pop();
    }
    push();
    if (b.tipo === 'mineralero') { translate(x, MAR_Y, z); rotateY(g); rotateZ(sin(t * 0.8) * 0.02); }
    else { translate(x, MAR_Y + 0.15 + sin(t * 2.4 + b.f) * 0.12, z); rotateY(g); rotateZ(sin(t * 1.8 + b.f) * 0.06); }
    model(geo('nave' + i, () => dibujoNave(b)));
    pop();
  });
}

// ---------- avioneta: despega, da la vuelta sobre la ciudad, aterriza y vuelve a su sitio ----------
// El circuito es una curva continua (antes, al terminar de aterrizar saltaba de golpe al inicio).

const VUELO = { T: 44, curva: null };
function crearVuelo() {
  const [ax, az] = PISTA_A, [bx, bz] = PISTA_B, L = dist(ax, az, bx, bz);
  const u = [(bx - ax) / L, (bz - az) / L], n = [-u[1], u[0]];   // n apunta hacia la ciudad
  const yP = PISTA_Y + 0.1, mx = (ax + bx) / 2, mz = (az + bz) / 2;
  const p = (x, z, y) => [x, y, z];
  const A = p(ax, az, yP), B = p(bx, bz, yP + 4);
  const ctrl = [
    p(bx - u[0], bz - u[1], yP + 3.2),                                       // (fantasma)
    B,
    p(bx + u[0] * 5, bz + u[1] * 5, yP + 7.5),
    p(bx + u[0] * 14 + n[0] * 5, bz + u[1] * 14 + n[1] * 5, yP + 11),
    p(bx + u[0] * 10 + n[0] * 17, bz + u[1] * 10 + n[1] * 17, yP + 13),
    p(mx + n[0] * 20, mz + n[1] * 20, yP + 15),
    p(ax - u[0] * 10 + n[0] * 17, az - u[1] * 10 + n[1] * 17, yP + 13),
    p(ax - u[0] * 17 + n[0] * 5, az - u[1] * 17 + n[1] * 5, yP + 8),
    p(ax - u[0] * 11, az - u[1] * 11, yP + 4),
    A,
    p(ax + u[0], az + u[1], yP),                                             // (fantasma)
  ];
  // Catmull-Rom muestreada y luego repartida por distancia (velocidad pareja)
  const crudo = [];
  for (let k = 1; k < ctrl.length - 2; k++) for (let q = 0; q < 24; q++) {
    const s = q / 24, P0 = ctrl[k - 1], P1 = ctrl[k], P2 = ctrl[k + 1], P3 = ctrl[k + 2];
    crudo.push([0, 1, 2].map(c => 0.5 * (2 * P1[c] + (-P0[c] + P2[c]) * s + (2 * P0[c] - 5 * P1[c] + 4 * P2[c] - P3[c]) * s * s + (-P0[c] + 3 * P1[c] - 3 * P2[c] + P3[c]) * s * s * s)));
  }
  crudo.push(A);
  const acum = [0];
  for (let k = 1; k < crudo.length; k++) acum.push(acum[k - 1] + dist(...crudo[k - 1], ...crudo[k]));
  VUELO.curva = { pts: crudo, acum, L: acum[acum.length - 1] };
  VUELO.A = A; VUELO.B = B; VUELO.u = u;
}
function puntoCurva(s) {
  const { pts, acum } = VUELO.curva;
  let lo = 1, hi = acum.length - 1;
  while (lo < hi) { const m = (lo + hi) >> 1; if (acum[m] < s) lo = m + 1; else hi = m; }
  const k = constrain((s - acum[lo - 1]) / max(1e-6, acum[lo] - acum[lo - 1]), 0, 1);
  return [0, 1, 2].map(c => lerp(pts[lo - 1][c], pts[lo][c], k));
}
// fases del ciclo (fracción del período): espera, carrera, vuelo, frenado, rodaje de vuelta, giro
const FASES_VUELO = [0.04, 0.15, 0.78, 0.86, 0.97, 1];
function poseAvion(t) {
  const u = (t % VUELO.T) / VUELO.T, [f0, f1, f2, f3, f4] = FASES_VUELO;
  const A = VUELO.A, B = VUELO.B, rumboPista = atan2(VUELO.u[0], VUELO.u[1]);
  const enPista = (k, y) => ({ x: lerp(A[0], B[0], k), y, z: lerp(A[2], B[2], k) });
  let r;
  if (u < f0) r = { ...enPista(0, A[1]), rumbo: rumboPista, motor: 0.4 };
  else if (u < f1) {                                    // carrera: acelera y se eleva al final
    const k = (u - f0) / (f1 - f0), e = k * k;
    r = { ...enPista(e, A[1] + pow(max(0, (e - 0.35) / 0.65), 1.5) * 4), rumbo: rumboPista, cabeceo: e > 0.35 ? -0.3 : 0, motor: 1 };
  } else if (u < f2) {                                  // vuelo por la curva
    const k = (u - f1) / (f2 - f1), L = VUELO.curva.L, s = k * L;
    const [x, y, z] = puntoCurva(s), a = puntoCurva(min(L, s + 1.5)), b = puntoCurva(max(0, s - 1.5));
    const rumbo = atan2(a[0] - b[0], a[2] - b[2]);
    const a2 = puntoCurva(min(L, s + 4)), b2 = puntoCurva(max(0, s - 4));
    const giro = angDif(atan2(a2[0] - x, a2[2] - z), atan2(x - b2[0], z - b2[2]));   // curvatura → alabeo
    r = { x, y, z, rumbo, inclina: constrain(-giro * 1.4, -0.45, 0.45), cabeceo: -atan2(a[1] - b[1], 3) , motor: 1 };
  } else if (u < f3) {                                  // aterriza en A y frena hasta cerca de B
    const k = (u - f2) / (f3 - f2), e = 1 - (1 - k) * (1 - k);
    r = { ...enPista(e * 0.85, A[1]), rumbo: rumboPista, motor: 0.6 };
  } else if (u < f4) {                                  // rueda despacio de vuelta a A
    const k = (u - f3) / (f4 - f3);
    r = { ...enPista(0.85 * (1 - k), A[1]), rumbo: rumboPista + PI, motor: 0.4 };
    if (k < 0.12) r.rumbo = rumboPista + PI * suave(k / 0.12);   // gira en el sitio antes de rodar
  } else {                                              // en A, gira para quedar listo
    const k = (u - f4) / (1 - f4);
    r = { ...enPista(0, A[1]), rumbo: rumboPista + PI + PI * suave(k), motor: 0.4 };
  }
  return Object.assign({ inclina: 0, cabeceo: 0 }, r);
}
function suave(x) { return x * x * (3 - 2 * x); }

function avioneta(t) {
  const p = poseAvion(t);
  push();
  translate(p.x, p.y + 0.5, p.z);
  rotateY(p.rumbo); rotateZ(p.inclina); rotateX(p.cabeceo);
  model(geo('avion', () => {
    fill(245, 245, 248); caja(0, 0, 0, 0.9, 0.8, 4);              // fuselaje
    fill(200, 50, 45); caja(0, 0.05, 0, 0.92, 0.2, 4.02);           // franja
    fill(245, 245, 248); caja(0, 0.45, 0.3, 6, 0.12, 1.1);         // alas
    caja(0, 0.3, -1.8, 2.2, 0.1, 0.6); caja(0, 0.4, -1.8, 0.1, 1, 0.6);   // cola
    fill(60, 90, 130); caja(0, 0.5, 1.1, 0.7, 0.3, 0.8);           // cabina
  }));
  fill(40); push(); translate(0, 0.4, 2.05); rotateZ(t * 40 * p.motor); box(1.6, 0.15, 0.05); pop();   // hélice
  pop();
}

// ---------- aves ----------

function poseAve(k, t) {
  const P = L_('punta'), a = t * 0.6 + k * 0.78, r = 7 + (k % 3) * 2.5;
  return { x: P.x + cos(a) * r, y: 16 + (k % 4) * 1.6 + sin(t * 2 + k) * 0.6, z: P.z + sin(a) * r, giro: -a };
}
function aves(t) {
  // bandada de aves guaneras dando vueltas sobre la punta
  for (let k = 0; k < 8; k++) {
    const p = poseAve(k, t), q = cuantizar((sin(t * 10 + k) + 1) / 2, 5);
    push(); translate(p.x, p.y, p.z); rotateY(p.giro);
    model(geo('ave' + q, () => {
      const ala = (q / 4 * 2 - 1) * 0.6;
      fill(30, 32, 40); caja(0, 0, 0, 0.5, 0.4, 1.2);
      for (const s of [-1, 1]) { push(); rotateZ(s * ala); translate(s * 0.9, 0.15, 0); box(1.6, 0.1, 0.6); pop(); }
    }));
    pop();
  }
}

function poseGaviota(k, t) {
  // avanzan sobre la línea de costa real, un poco mar adentro
  const u = ((t * 0.02 + k / 6) % 1) * (COSTA.length - 1.001);
  const n = floor(u), f = u - n, a = COSTA[n], b = COSTA[n + 1];
  return {
    x: lerp(a[0], b[0], f) - 4 + sin(t * 0.8 + k) * 3, y: 12.5 + (k % 3) * 2 + sin(t * 1.3 + k) * 1.2,
    z: lerp(a[1], b[1], f) + cos(t * 0.6 + k) * 3, giro: atan2(b[0] - a[0], b[1] - a[1]) + sin(t * 0.8 + k) * 0.3,
  };
}
function gaviotas(t) {
  for (let k = 0; k < 6; k++) {
    const p = poseGaviota(k, t), q = cuantizar((sin(t * 5 + k * 2) + 1) / 2, 5);
    push(); translate(p.x, p.y, p.z); rotateY(p.giro);
    model(geo('gaviota' + q, () => {
      const ala = q / 4 * 0.7;
      fill(246, 246, 242); caja(0, 0, 0, 0.45, 0.35, 1.1);
      for (const s of [-1, 1]) { push(); rotateZ(s * ala); translate(s * 0.9, 0.15, 0); box(1.7, 0.08, 0.55); pop(); }
    }));
    pop();
  }
}

function poseCondor(t) {
  const a = t * 0.3;
  return { x: ANDES[0] + 6 + cos(a) * 12, y: 34 + sin(t * 0.7) * 2, z: ANDES[1] + 14 + sin(a) * 9, giro: -a };
}
function condor(t) {
  // cóndor planeando sobre los cerros de San Fernando
  const p = poseCondor(t);
  push();
  translate(p.x, p.y, p.z); rotateY(p.giro); rotateZ(0.25 + sin(t * 1.5) * 0.05);
  model(geo('condor', () => {
    fill(24, 24, 28); caja(0, 0, 0, 1, 0.7, 2.6);
    fill(240); caja(0, 0.2, 1.3, 0.9, 0.3, 0.3);
    fill(24, 24, 28); for (const s of [-1, 1]) { push(); translate(s * 3, 0.3, 0); box(5, 0.15, 1.6); pop(); }
  }));
  pop();
}

// ---------- camiones del tajo (dan vueltas en sus anillos; el explorador no entra al tajo) ----------

const ANILLOS_MINA = [4, 6.2, 8.4];
function poseCamion(k, t) {
  const a = t * 0.4 + k * TWO_PI / 3, r = ANILLOS_MINA[k];
  return { x: MINA[0] + cos(a) * r, z: MINA[1] + sin(a) * r, giro: -a };
}
function camiones(t) {
  const g = geo('camion', () => {
    fill(245, 190, 40); caja(0, 0.3, 0, 1.6, 1.2, 2.8);
    fill(120, 58, 46); caja(0, 1.5, -0.4, 1.4, 0.5, 1.6);
    fill(30); for (const s of [-1, 1]) caja(s * 0.85, 0, 0.8, 0.3, 0.7, 0.7);
  });
  for (let k = 0; k < 3; k++) {
    const p = poseCamion(k, t);
    push(); translate(p.x, alturaEn(p.x, p.z), p.z); rotateY(p.giro); model(g); pop();
  }
}
function marcarTajo() {   // los anillos por donde andan los camiones quedan fuera del paso
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    const d = dist(celdaX(i), celdaX(j), MINA[0], MINA[1]);
    if (ALT[i][j] && d > ANILLOS_MINA[0] - 1.6 && d < ANILLOS_MINA[2] + 1.6) OCUPADO[i * N + j] = 1;
  }
}

// ---------- tránsito: autos en las carreteras y la cuatrimoto en la trocha de las playas ----------
// Cada vehículo va y vuelve por su vía en su carril (a la derecha), frena si tiene otro delante
// o si el explorador está en su camino, y en los extremos da una vuelta en U (antes se
// atravesaban entre ellos y giraban de golpe).

// tramo continuo más largo de una vía que va por tierra (nunca une dos tramos cruzando el agua)
function tramoEnTierra(pts, ancho) {
  let mejor = [], actualT = [];
  for (const [x, z, dx, dz] of muestrearVia(pts, 0.5)) {
    const ok = esTierra(x, z) && esTierra(x - dz * ancho, z + dx * ancho) && esTierra(x + dz * ancho, z - dx * ancho)
      && abs(x) < MITAD - 1.5 && abs(z) < MITAD - 1.5;
    if (ok) actualT.push([x, z, dx, dz, alturaEn(x, z)]);
    else { if (actualT.length > mejor.length) mejor = actualT; actualT = []; }
  }
  const m = actualT.length > mejor.length ? actualT : mejor;
  const s = [0];
  for (let k = 1; k < m.length; k++) s.push(s[k - 1] + dist(m[k - 1][0], m[k - 1][1], m[k][0], m[k][1]));
  return { m, s, L: s[s.length - 1] || 0 };
}
// quita `a` mm al inicio y `b` mm al final de una vía
function recortarVia(V, a, b) {
  const m = V.m.filter((_, k) => V.s[k] >= a && V.s[k] <= V.L - b);
  const s = [0];
  for (let k = 1; k < m.length; k++) s.push(s[k - 1] + dist(m[k - 1][0], m[k - 1][1], m[k][0], m[k][1]));
  return { m, s, L: s[s.length - 1] || 0 };
}
function puntoVia(V, s) {
  s = constrain(s, 0, V.L);
  let lo = 1, hi = V.s.length - 1;
  while (lo < hi) { const m = (lo + hi) >> 1; if (V.s[m] < s) lo = m + 1; else hi = m; }
  const A = V.m[lo - 1], B = V.m[lo], k = constrain((s - V.s[lo - 1]) / max(1e-6, V.s[lo] - V.s[lo - 1]), 0, 1);
  return [lerp(A[0], B[0], k), lerp(A[1], B[1], k), A[2], A[3], lerp(A[4], B[4], k)];
}

const VEHICULOS = [];
const MEDIDAS = { auto: [1, 1.8], camioneta: [1, 2.1], bus: [1.12, 3.2], camion: [1.15, 3.4], cuatrimoto: [1.4, 2.2] };
function crearTransito() {
  const asfalto = CARRETERAS.filter(v => v.tipo === 'asfalto' && v.ancho > 1).map(v => tramoEnTierra(v.pts, 0.8));
  const trocha = recortarVia(tramoEnTierra(CARRETERAS.find(v => v.nombre === 'Trocha de las playas').pts.slice(1), 0), 0, 7);
  const defs = [
    { via: asfalto[0], f: 0.1,  dir: 1,  tipo: 'auto',      col: [220, 60, 50],   vmax: 3.2 },
    { via: asfalto[0], f: 0.55, dir: -1, tipo: 'camioneta', col: [250, 250, 250], vmax: 2.8 },
    { via: asfalto[0], f: 0.8,  dir: 1,  tipo: 'bus',       col: [250, 190, 50],  vmax: 2.2 },
    { via: asfalto[1], f: 0.2,  dir: 1,  tipo: 'auto',      col: [60, 110, 200],  vmax: 3.2 },
    { via: asfalto[1], f: 0.6,  dir: -1, tipo: 'camion',    col: [90, 140, 90],   vmax: 2 },
    { via: asfalto[1], f: 0.9,  dir: -1, tipo: 'auto',      col: [240, 240, 240], vmax: 3 },
    { via: trocha,     f: 0.3,  dir: 1,  tipo: 'cuatrimoto', col: [220, 50, 40], vmax: 4.5, carril: 0 },
  ];
  for (const d of defs) {
    if (!d.via || d.via.L < 12) continue;
    const [ancho, largo] = MEDIDAS[d.tipo];
    VEHICULOS.push({ ...d, ancho, largo, carril: d.carril ?? 0.75, s: d.f * d.via.L, v: d.vmax, vuelta: -1, lado: 0, ladoMeta: 0 });
  }
}

// pose de un vehículo en la arista s de su vía (con su carril); durante la vuelta en U, la curva
function poseVehiculo(a, s = a.s) {
  const [x, z, dx, dz, h] = puntoVia(a.via, s);
  const fx = dx * a.dir, fz = dz * a.dir, rx = -fz, rz = fx;   // adelante y derecha
  const off = a.carril + (s === a.s ? a.lado : 0);
  if (a.vuelta < 0 || s !== a.s) return { x: x + rx * off, z: z + rz * off, y: h, giro: atan2(fx, fz) };
  const th = PI * suave(a.vuelta);
  if (!a.carril) return { x, z, y: h, giro: atan2(fx, fz) + th };   // un solo carril: gira en el sitio
  const r = a.carril, c = cos(th), sn = sin(th);
  return { x: x + rx * r * c + fx * r * sn, z: z + rz * r * c + fz * r * sn, y: h, giro: atan2(-rx * sn + fx * c, -rz * sn + fz * c) };
}

// ¿la ruta que le queda al explorador (próximos 8 mm) pasa por la caja de un vehículo en la pose q?
function cruzaRutaYo(q, a) {
  if (!yo.caminando) return dist(q.x, q.z, yo.x, yo.z) < a.largo / 2 + 1;
  const c = cos(q.giro), s = sin(q.giro);
  for (let d = 0; d <= 8; d += 0.4) {
    const [x, z] = puntoRuta(min(yo.total, yo.s + d)), dx = x - q.x, dz = z - q.z;
    if (abs(dx * c - dz * s) < a.ancho / 2 + 0.7 && abs(dx * s + dz * c) < a.largo / 2 + 0.7) return true;
  }
  return false;
}

function moverTransito(dt) {
  for (const a of VEHICULOS) {
    if (a.vuelta >= 0) {
      a.vuelta += dt / 1.6;
      if (a.vuelta >= 1) { a.vuelta = -1; a.dir = -a.dir; a.v = 0; }
      continue;
    }
    let meta = a.vmax;
    // otro vehículo delante en el mismo carril (o dando la vuelta)
    for (const b of VEHICULOS) {
      if (b === a || b.via !== a.via || (b.vuelta < 0 && b.dir !== a.dir)) continue;
      const gap = (b.s - a.s) * a.dir;
      if (gap <= 0) continue;
      const libre = gap - (a.largo + b.largo) / 2;
      if (libre < 1.2) meta = 0; else if (libre < 5) meta = min(meta, b.v + (libre - 1.2) * 0.4);
    }
    // el explorador en su camino (cruzando o caminando junto a la vía): espera
    let porYo = false;
    a.cede = false;   // ¿está detenido para dejar pasar al explorador? (entonces él puede seguir)
    for (let d = 0.3; d <= 3.3 && meta > 0; d += 1) {
      const p = poseVehiculo(a, a.s + a.dir * (a.largo / 2 + d));
      if (dist(p.x, p.z, yo.x, yo.z) < 1.4 + a.ancho / 2) { meta = 0; porYo = a.cede = true; }
    }
    // en un camino de un solo carril, además se hace a un lado (al costado contrario al explorador)
    if (!a.carril) {
      // (con histéresis: se aparta a menos de ~4 mm y vuelve recién a más de ~5.5, para no titubear)
      const p = poseVehiculo(a), cerca = dist(p.x, p.z, yo.x, yo.z) < a.largo / 2 + (a.ladoMeta ? 4.5 : 3);
      if (!porYo && !cerca) { a.ladoMeta = 0; a.retro = false; }   // el explorador ya pasó: vuelve a su camino
      else if (a.ladoMeta && abs(a.lado - a.ladoMeta) < 0.05 && cruzaRutaYo(p, a)) { a.ladoMeta = 0; meta = 0; }   // la ruta nueva del explorador pasa por aquí: elige otro sitio
      else if (a.ladoMeta) { meta = 0; a.cede = true; }            // ya está al costado: espera ahí
      else {
        const [, , dx, dz] = puntoVia(a.via, a.s), lado = Math.sign(-(yo.x - p.x) * dz * a.dir + (yo.z - p.z) * dx * a.dir) || 1;
        for (const L of [-lado * 1.7, lado * 1.7]) {
          const q = poseVehiculo({ ...a, lado: L, carril: 0 }, a.s);
          if (todoTierra(q.x, q.z, 0.9) && !objetoCerca(q.x, q.z, 0.8) && !cruzaRutaYo(q, a)) { a.ladoMeta = L; break; }
        }
        meta = 0;
        a.retro = !a.ladoMeta && abs(a.lado) < 0.05 && yo.caminando;   // no hay espacio a los costados: retrocede
        if (a.retro) a.s = constrain(a.s - a.dir * 3 * dt, a.largo / 2 + 1, a.via.L - a.largo / 2 - 1);
      }
      a.lado += constrain(a.ladoMeta - a.lado, -dt * 2.5, dt * 2.5);
      if (abs(a.lado) > 0.05) meta = 0;   // no avanza mientras está al costado
    }
    a.v += constrain(meta - a.v, -a.vmax * 4 * dt, a.vmax * 1.2 * dt);
    a.s += a.dir * a.v * dt;
    // al final de la vía: frena y da la vuelta en U si el otro carril está libre
    const margen = a.largo / 2 + 1;
    if ((a.dir > 0 && a.s >= a.via.L - margen) || (a.dir < 0 && a.s <= margen)) {
      a.s = constrain(a.s, margen, a.via.L - margen);
      a.v = 0;
      const libre = !VEHICULOS.some(b => b !== a && b.via === a.via && (b.vuelta >= 0 || b.dir !== a.dir) && abs(b.s - a.s) < (a.largo + b.largo) / 2 + 1.5);
      const explorador = dist(poseVehiculo(a).x, poseVehiculo(a).z, yo.x, yo.z) < 3;
      if (libre && !explorador) a.vuelta = 0;
      if (explorador) a.cede = true;
    }
  }
}

function dibujoVehiculo(a) {
  if (a.tipo === 'cuatrimoto') {
    fill(...a.col); caja(0, 0.4, 0, 1.4, 0.7, 2.2);
    fill(30); for (const [x, z] of [[-0.8, 0.7], [0.8, 0.7], [-0.8, -0.7], [0.8, -0.7]]) caja(x, 0, z, 0.4, 0.7, 0.7);
    fill(40, 60, 160); caja(0, 1.1, -0.2, 0.7, 1.2, 0.6);
    fill(250, 210, 60); caja(0, 2.3, -0.2, 0.55, 0.5, 0.55);
    return;
  }
  if (a.tipo === 'bus') {
    fill(...a.col); caja(0, 0.15, 0, 1.1, 1.1, 3.2);
    fill(60, 90, 120); caja(0, 0.75, 0, 1.12, 0.35, 2.9);
  } else if (a.tipo === 'camion') {
    fill(...a.col); caja(0, 0.15, 1.1, 1.1, 1, 1);
    fill(200, 200, 204); caja(0, 0.15, -0.6, 1.15, 1.3, 2.4);
  } else if (a.tipo === 'camioneta') {
    fill(...a.col); caja(0, 0.15, 0, 1, 0.55, 2.1);
    fill(40, 50, 60); caja(0, 0.7, 0.3, 0.92, 0.4, 0.9);
  } else {
    fill(...a.col); caja(0, 0.15, 0, 1, 0.5, 1.8);
    fill(40, 50, 60); caja(0, 0.65, -0.1, 0.9, 0.4, 1);
  }
  fill(25); for (const s of [-1, 1]) for (const q of [-0.6, 0.6]) caja(s * 0.5, 0, q, 0.2, 0.35, 0.4);
}

function vehiculos() {
  VEHICULOS.forEach((a, i) => {
    const p = poseVehiculo(a);
    push();
    translate(p.x, p.y + 0.12, p.z);
    rotateY(p.giro);
    model(geo('veh' + i, () => dibujoVehiculo(a)));
    pop();
  });
}

// ---------- paisaje animado ----------

function nubes(t) {
  const g = geo('nube', () => { fill(255); box(12, 3, 7); translate(3, 2.5, 0); box(7, 3, 5); translate(-6, -1, 2); box(5, 2.5, 4); });
  for (let k = 0; k < 3; k++) {
    push(); translate(((t * 2.5 + k * 55) % 170) - 85, 46 + (k % 2) * 8, -45 + k * 28); model(g); pop();
  }
}

function turbinas(t) {
  const rotor = geo('rotor', () => {
    fill(246, 247, 249); box(0.7, 0.7, 0.6);
    for (let a = 0; a < 3; a++) { rotateZ(TWO_PI / 3); push(); translate(0, 4.6, 0); rotateY(0.3); box(0.8, 8.4, 0.18); pop(); }
  });
  for (let n = 0; n < TURBINAS.length; n++) {
    const [x, z] = TURBINAS[n];
    push(); translate(x, alturaEn(x, z) + 19.2, z + 1.8); rotateZ(t * 2.4 + n); model(rotor); pop();
  }
}

function pin(k, t) {
  const L = LUGARES[k];
  const sel = k === actual;
  const base = alturaEn(L.x, L.z);
  const c = CAT[L.cat].color;
  const salto = sel ? abs(sin(t * 3)) * 2 + max(0, 1 - (t - tocadoT) / 0.5) * sin((t - tocadoT) * 12) * 2 : 0;
  const alto = (sel ? 16 : 10) + sin(t * 1.4 + k * 1.7) * 0.5;   // flotan suavemente
  push();
  translate(L.x, base, L.z);
  fill(sel ? 255 : 230);
  caja(0, 0, 0, 0.5, alto, 0.5);
  if (sel) {
    const r = 3 + ((t * 0.8) % 1) * 4;
    fill(...c);
    for (const [a, b, w, d] of [[0, r, r * 2, 0.5], [0, -r, r * 2, 0.5], [r, 0, 0.5, r * 2], [-r, 0, 0.5, r * 2]]) caja(a, 0.25, b, w, 0.25, d);
  }
  translate(0, alto + 2.2 + salto, 0);
  rotateY(t * (sel ? 1.2 : 0.4) + k);
  scale(1, -1, 1);   // deja el número derecho (el mundo está volteado en Y)
  texture(numTex[k]);
  box(sel ? 4.4 : 3.2);   // cubo con el número en sus caras: una sola llamada
  pop();
}

function luces() {
  ambientLight(140, 142, 152);
  directionalLight(208, 196, 176, 0.35, 0.5, -1);   // sol cálido de la tarde
  directionalLight(50, 60, 80, -0.6, -0.2, 0.6);  // relleno azulado (reflejo del mar)
}

// =====================================================================
// MODOS, CONTROLES E INTERFAZ
// =====================================================================

function cambiarModo(m) {
  modo = m;
  ajustarLienzo();
  for (const b of document.querySelectorAll('.seg button')) b.setAttribute('aria-pressed', String(b.dataset.m === m));
  ultimoEstado = '';
  camCuadro.dibujar = true;
  document.body.classList.toggle('ra', m === 'ra');
  if (m === 'ra') {
    if (!cam) cam = NyAR.createCamera(window);
    el.ficha.classList.remove('visible');
    el.guia.classList.add('visible');
  } else {
    if (cam) {   // apaga la cámara al volver a 3D
      const s = cam.elt && cam.elt.srcObject;
      if (s) s.getTracks().forEach(tr => tr.stop());
      cam.remove();
      cam = null;
    }
    el.guia.classList.remove('visible');
    el.ficha.classList.add('visible');
    estado('ok', 'Elige un lugar y tu explorador caminará hasta allí');
    clearTimeout(estadoTimer);
    estadoTimer = setTimeout(() => { if (modo === '3d') el.estado.classList.add('oculto'); }, 5000);
  }
}

function controles(cnv) {
  const punteros = new Map();
  let inicio = null, movido = false, pinza = 0;

  cnv.addEventListener('pointerdown', e => {
    cnv.setPointerCapture(e.pointerId);
    punteros.set(e.pointerId, [e.clientX, e.clientY]);
    if (punteros.size === 1) { inicio = [e.clientX, e.clientY]; movido = false; }
    if (punteros.size === 2) { pinza = distancia(); movido = true; }
  });
  cnv.addEventListener('pointermove', e => {
    if (!punteros.has(e.pointerId)) return;
    const [px, py] = punteros.get(e.pointerId);
    punteros.set(e.pointerId, [e.clientX, e.clientY]);
    if (modo !== '3d') return;
    if (punteros.size === 1) {
      if (inicio && dist(e.clientX, e.clientY, inicio[0], inicio[1]) > 8) movido = true;
      if (!movido) return;
      camManualT = millis() / 1000;
      orb.yawObj -= (e.clientX - px) * 0.008;
      orb.pitchObj = constrain(orb.pitchObj + (e.clientY - py) * 0.006, 0.15, 1.45);
    } else if (punteros.size === 2) {
      const d = distancia();
      camManualT = millis() / 1000;
      if (pinza > 0) orb.distObj = constrain(orb.distObj * pinza / d, 20, 420);
      pinza = d;
    }
  });
  const soltar = e => {
    if (!punteros.has(e.pointerId)) return;
    punteros.delete(e.pointerId);
    if (punteros.size === 0 && !movido && e.type === 'pointerup') tocar();
    if (punteros.size < 2) pinza = 0;
  };
  cnv.addEventListener('pointerup', soltar);
  cnv.addEventListener('pointercancel', soltar);
  cnv.addEventListener('wheel', e => {
    e.preventDefault();
    camManualT = millis() / 1000;
    if (modo === '3d') orb.distObj = constrain(orb.distObj * (1 + Math.sign(e.deltaY) * 0.12), 20, 420);
  }, { passive: false });

  function distancia() {
    const [a, b] = [...punteros.values()];
    return Math.max(1, Math.hypot(a[0] - b[0], a[1] - b[1]));
  }
}

function tocar() {
  if (modo === 'ra' && !ar.isExist(0)) return;
  cambiarDato(dato + 1);
}

function alternarTour() {
  tour = !tour;
  el.tour.setAttribute('aria-pressed', String(tour));
  el.tour.textContent = tour ? '⏸ Detener' : '▶ Recorrido';
  el.barra.style.width = '0';
  if (tour && !yo.caminando) elegir((actual + 1) % LUGARES.length, false, true);
}

function subLugar(k) { return `Parada ${k + 1} de ${LUGARES.length} · ${LUGARES[k].sub}`; }

let plegadoManual = false;
function plegar(min, manual) {
  el.ficha.classList.toggle('min', min);
  el.plegar.setAttribute('aria-expanded', String(!min));
  el.plegar.setAttribute('aria-label', min ? 'Desplegar tarjeta' : 'Plegar tarjeta');
  if (manual) plegadoManual = min;
}

function prepararFicha() {
  // tocar la cabecera pliega o despliega la tarjeta
  el.ficha.querySelector('.cab').addEventListener('click', () => plegar(!el.ficha.classList.contains('min'), true));
  // mide cuánto tapa la tarjeta para correr el encuadre 3D hacia la zona libre
  const top = document.getElementById('top');
  const medir = () => {
    const r = el.ficha.getBoundingClientRect(), barra = top.getBoundingClientRect().bottom;
    const ancha = r.width > innerWidth * 0.7;   // solo si la tarjeta ocupa el ancho de abajo
    const tapa = el.ficha.classList.contains('visible') && ancha ? innerHeight - r.top : 0;
    fichaFrac = max(0, tapa - barra * 0.6) / innerHeight;
  };
  if (window.ResizeObserver) new ResizeObserver(medir).observe(el.ficha);
  addEventListener('resize', medir);
  el.ficha.addEventListener('transitionend', medir);
  medir();
}

function mostrarProgreso() {
  const falta = max(0, (yo.total - yo.s) / yo.vel);
  const txt = falta > 0.5 ? `Llegamos en ${ceil(falta)} s` : 'Ya casi…';
  if (el['ficha-num'].textContent !== txt) {   // no tocar el DOM en cada cuadro
    el['ficha-num'].textContent = txt;
    el['ficha-sub'].textContent = `En camino · ${txt.toLowerCase()}`;
  }
  el.barra.style.width = `${(yo.s / max(1e-6, yo.total)) * 100}%`;
}

function cambiarDato(n) {
  if (yo.caminando) return;
  dato = (n + LUGARES[actual].datos.length) % LUGARES[actual].datos.length;
  tocadoT = millis() / 1000;
  tourSig = tocadoT + PAUSA_DATO;
  mostrarDato();
}

function animarContenido() {
  el.contenido.classList.remove('entra');
  void el.contenido.offsetWidth;   // reinicia la animación
  el.contenido.classList.add('entra');
}

let toastTimer = 0;
function avisar(msg) {
  el.toast.textContent = msg;
  el.toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.toast.classList.remove('visible'), 2600);
}

// deslizar la tarjeta a los lados cambia de dato
function gestosFicha() {
  let x0 = null, y0 = 0;
  el.ficha.addEventListener('pointerdown', e => { if (e.target.closest('button')) return; x0 = e.clientX; y0 = e.clientY; });
  el.ficha.addEventListener('pointerup', e => {
    if (x0 === null) return;
    const dx = e.clientX - x0, dy = e.clientY - y0;
    x0 = null;
    if (abs(dx) > 40 && abs(dx) > abs(dy)) cambiarDato(dato + (dx < 0 ? 1 : -1));
  });
}

function crearBotones() {
  LUGARES.forEach((L, k) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = `${k + 1}. ${L.boton}`;
    b.addEventListener('click', () => elegir(k));
    el.lugares.appendChild(b);
  });
}

function elegir(k, inicial, desdeTour) {
  if (tour && !desdeTour && !inicial) alternarTour();   // elegir a mano detiene el recorrido
  actual = k;
  dato = 0;
  tocadoT = millis() / 1000;
  const L = LUGARES[k];
  if (!inicial) history.replaceState(null, '', location.search + '#' + L.id);
  [...el.lugares.children].forEach((b, i) => {
    b.setAttribute('aria-pressed', String(i === k));
    if (i === k && !inicial) b.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  });
  orb.distObj = min(orb.distObj, 130);   // en 3D, acerca la cámara al explorador
  const col = CAT[L.cat].color.join(',');
  el['ficha-icono'].textContent = L.boton.split(' ')[0];
  el['ficha-icono'].style.background = `rgba(${col}, .16)`;
  el['ficha-lugar'].textContent = L.nombre;
  el['ficha-sub'].textContent = subLugar(k);
  el['ficha-badge'].textContent = CAT[L.cat].nombre;
  el['ficha-badge'].style.background = `rgb(${col})`;
  if (inicial) return llegar();
  caminarA(k);
  if (yo.caminando) {
    const frases = ['¡Vamos!', 'En marcha', 'Rumbo a la siguiente parada', 'De camino'];
    el['ficha-tag'].textContent = frases[k % frases.length];
    el['ficha-titulo'].textContent = `Próxima parada: ${L.nombre}`;
    el['ficha-texto'].textContent = `Sigue los puntitos naranjas: tu explorador va por calles y trochas hasta la bandera. Mientras tanto, mira el paisaje.`;
    el['ficha-puntos'].innerHTML = '';
    animarContenido();
    plegar(true);          // mientras camina, la tarjeta se recoge y deja ver el mapa
    mostrarProgreso();
  }
}

function mostrarDato() {
  const L = LUGARES[actual], d = L.datos[dato];
  el['ficha-tag'].textContent = d.tag;
  el['ficha-titulo'].textContent = d.titulo;
  el['ficha-texto'].textContent = d.texto;
  el['ficha-num'].textContent = tour ? 'Recorrido en curso' : (L.datos.length > 1 ? 'Desliza o toca el mapa' : '');
  // puntitos de paginación (clic para saltar a un dato)
  const p = el['ficha-puntos'];
  if (p.children.length !== L.datos.length) {
    p.innerHTML = '';
    L.datos.forEach((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', `Dato ${i + 1}`);
      b.addEventListener('click', () => cambiarDato(i));
      p.appendChild(b);
    });
  }
  [...p.children].forEach((b, i) => b.setAttribute('aria-current', String(i === dato)));
  if (!tour && el.barra) el.barra.style.width = '0';
  animarContenido();
}

let ultimoEstado = '', estadoTimer = 0;
function estado(tipo, msg) {
  const clave = tipo + msg;
  if (clave === ultimoEstado) return;
  ultimoEstado = clave;
  el.estado.classList.remove('oculto');
  el.estado.innerHTML = `<span class="dot ${tipo}"></span><span></span>`;
  el.estado.lastChild.textContent = msg;
  if (modo === 'ra' && tipo !== 'ok' && el.ficha) el.ficha.classList.remove('visible');
}

function windowResized() {} // el tamaño lo maneja ajustarLienzo()

// ---------- resolución del lienzo ----------
// Con el marcador Hiro el lienzo debe tener el tamaño de la cámara (640×480 o 480×640).
// En la vista 3D no hay cámara: el lienzo toma la resolución real de la ventana, con un tope
// de píxeles para que siga fluido en pantallas 4K.
let TAM_RA = null;
const MAX_PIXELES = 4.5e6;   // ~ 2560×1760 píxeles reales como máximo
function ajustarLienzo() {
  if (!TAM_RA) return;
  const cnv = document.querySelector('canvas');
  const vw = document.documentElement.clientWidth || innerWidth, vh = document.documentElement.clientHeight || innerHeight;
  if (modo === '3d') {
    if (width !== vw || height !== vh) resizeCanvas(vw, vh);
    const d = Math.max(0.6, Math.min(displayDensity(), 2, Math.sqrt(MAX_PIXELES / (vw * vh))) * RES.factor);
    if (Math.abs(pixelDensity() - d) > 0.01) pixelDensity(d);
    cnv.style.width = vw + 'px'; cnv.style.height = vh + 'px';
  } else {
    const [w, h] = TAM_RA;
    if (width !== w || height !== h) resizeCanvas(w, h);
    const d = Math.min(2, displayDensity());
    if (Math.abs(pixelDensity() - d) > 0.01) pixelDensity(d);
    const k = Math.max(vw / w, vh / h);         // "cover", igual que nyar4p5
    cnv.style.width = Math.floor(w * k) + 'px'; cnv.style.height = Math.floor(h * k) + 'px';
  }
}

function pixelado(g) {
  try { _renderer.getTexture(g).setInterpolation(NEAREST, NEAREST); } catch (e) {}
}
