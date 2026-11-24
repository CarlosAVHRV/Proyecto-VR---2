// Fauna de la corriente de Humboldt en realidad aumentada — estilo bloques (voxel)
// nyar4p5js + p5.js
// Elige un animal arriba (o "Todos") y apunta la cámara al marcador.
// Cada toque en la pantalla hace reaccionar al animal y muestra el siguiente dato.

// ---------- MARCADOR ----------
// null  → usa el marcador Hiro (hiro.png).
// 'mi-marcador.png' → usa TU imagen como marcador (logo, dibujo...). Pon el archivo en esta carpeta.
//   La librería le agrega el borde negro: abre la página en la PC y pulsa la tecla S para
//   descargar la versión con borde, que es la que debes imprimir o mostrar.
const MI_IMAGEN = null;
const TAMANO_MM = 80; // lado del cuadrado negro impreso, en milímetros

// =====================================================================
// CONTENIDO
// =====================================================================

const INFO = {
  pinguino: {
    boton: '🐧 Pingüino', nombre: 'Pingüino de Humboldt', cient: 'Spheniscus humboldti',
    estado: 'Vulnerable', clase: 'vu', hint: 'Toca: salta y aletea',
    datos: [
      { tag: 'Especie', titulo: 'Un pingüino de clima templado',
        texto: 'Vive en la costa de Perú y Chile, en las aguas frías de la corriente de Humboldt. No necesita hielo.' },
      { tag: 'Cómo reconocerlo', titulo: 'Una herradura en el pecho',
        texto: 'Tiene una banda negra en forma de herradura sobre el pecho blanco y una franja blanca que rodea su cara.' },
      { tag: 'Tamaño', titulo: 'Mediano entre los pingüinos',
        texto: 'Mide entre 55 y 70 cm de alto y suele pesar alrededor de 4 kg.' },
      { tag: 'Se mantiene fresco', titulo: 'Piel rosada sin plumas',
        texto: 'La piel rosada alrededor del pico no tiene plumas: le ayuda a liberar calor en los días soleados de la costa.' },
      { tag: 'Alimentación', titulo: 'Experto buceador',
        texto: 'No vuela, pero nada con agilidad usando sus aletas. Se alimenta sobre todo de anchoveta y otros peces pequeños.' },
      { tag: 'Dónde anida', titulo: 'Casas de guano',
        texto: 'Anida en cuevas y grietas, a veces cavadas en el guano. En Perú se ve en Punta San Juan y las islas Ballestas (Paracas).' },
      { tag: 'Conservación', titulo: 'Especie vulnerable',
        texto: 'La UICN lo clasifica como Vulnerable. Lo amenazan la sobrepesca, la captura incidental en redes y los eventos de El Niño.' },
    ],
  },
  nutria: {
    boton: '🦦 Nutria', nombre: 'Nutria marina', cient: 'Lontra felina',
    estado: 'En peligro', clase: 'en', hint: 'Toca: da un salto',
    datos: [
      { tag: 'Especie', titulo: 'El "gato marino"',
        texto: 'En Perú se le llama gato marino y en Chile chungungo. Vive en las costas rocosas del Pacífico de ambos países.' },
      { tag: 'Tamaño', titulo: 'Una de las nutrias más pequeñas',
        texto: 'Mide alrededor de 1 m contando su larga cola y pesa entre 3 y 6 kg.' },
      { tag: 'Hábitat', titulo: 'Nutria de mar, no de río',
        texto: 'A diferencia de la mayoría de nutrias, vive casi solo en el mar, en la franja donde rompen las olas contra las rocas.' },
      { tag: 'Alimentación', titulo: 'Cazadora entre las rocas',
        texto: 'Bucea para atrapar cangrejos, camarones, moluscos y peces pequeños, y luego sale a comerlos sobre las piedras.' },
      { tag: 'Refugio', titulo: 'Casi invisible',
        texto: 'Descansa y cría en cuevas y grietas de la orilla. Es tímida y se mueve rápido, por eso es difícil verla.' },
      { tag: 'Abrigo', titulo: 'Pelaje en vez de grasa',
        texto: 'No tiene una capa gruesa de grasa como los lobos marinos: se protege del agua fría con un pelaje muy denso.' },
      { tag: 'Conservación', titulo: 'Especie en peligro',
        texto: 'La UICN la clasifica En peligro. Antes la cazaban por su piel; hoy la amenazan la pérdida de costa rocosa, la contaminación y las redes de pesca.' },
    ],
  },
  lobo: {
    boton: '🦭 Lobo marino', nombre: 'Lobo marino chusco', cient: 'Otaria flavescens',
    estado: 'Preocupación menor', clase: 'lc', hint: 'Toca: ladra',
    datos: [
      { tag: 'Especie', titulo: 'El lobo marino de un pelo',
        texto: 'También llamado lobo marino chusco, es el lobo marino más común en la costa peruana.' },
      { tag: 'Cómo reconocerlo', titulo: 'Melena de león',
        texto: 'El macho tiene una melena espesa en el cuello, como un león. Por eso en otros países le dicen león marino.' },
      { tag: 'Tamaño', titulo: 'Machos gigantes',
        texto: 'Los machos pueden medir unos 2.5 m y pesar más de 300 kg. Las hembras son mucho más pequeñas, alrededor de 150 kg.' },
      { tag: 'En tierra', titulo: 'Camina en cuatro aletas',
        texto: 'Gira sus aletas traseras hacia adelante para caminar en tierra. Además tiene pequeñas orejas visibles, a diferencia de las focas.' },
      { tag: 'Alimentación', titulo: 'Fanático de la anchoveta',
        texto: 'Come anchoveta, otros peces y calamares que caza buceando cerca de la costa.' },
      { tag: 'Dónde verlo', titulo: 'Colonias muy ruidosas',
        texto: 'Forma colonias en islas y puntas: islas Ballestas, Punta San Juan y las islas Palomino, frente al Callao.' },
      { tag: 'Conservación', titulo: 'Común, pero no sin problemas',
        texto: 'A nivel mundial está en Preocupación menor, pero en Perú sus colonias sufren con El Niño, el enredo en redes y los conflictos con la pesca.' },
    ],
  },
  zarcillo: {
    boton: '🐦 Zarcillo', nombre: 'Zarcillo', cient: 'Larosterna inca',
    estado: 'Casi amenazado', clase: 'nt', hint: 'Toca: aletea y salta',
    datos: [
      { tag: 'Especie', titulo: 'El gaviotín zarcillo',
        texto: 'Es un ave marina de la costa de Perú y Chile, pariente de las gaviotas. Vuela ágil sobre las olas.' },
      { tag: 'Su nombre', titulo: 'Bigotes como aretes',
        texto: 'Se llama zarcillo por las plumas blancas y rizadas que le cuelgan junto al pico, como aretes o "zarcillos".' },
      { tag: 'Cómo reconocerlo', titulo: 'Gris con pico rojo',
        texto: 'Tiene plumaje gris pizarra, la cabeza más oscura, y el pico y las patas de un rojo intenso.' },
      { tag: 'Tamaño', titulo: 'Liviano como una manzana grande',
        texto: 'Mide unos 40 cm de largo y pesa alrededor de 180 g.' },
      { tag: 'Alimentación', titulo: 'Pesca en picada',
        texto: 'Se lanza al agua para atrapar anchovetas. A veces sigue a lobos marinos y aves buceadoras para aprovechar los peces que espantan.' },
      { tag: 'Nido', titulo: 'Vecino del pingüino',
        texto: 'Anida en grietas de acantilados e islas guaneras, a veces en antiguas madrigueras de pingüinos de Humboldt.' },
      { tag: 'Conservación', titulo: 'Casi amenazado',
        texto: 'La UICN lo clasifica Casi amenazado. Le afectan El Niño, la escasez de anchoveta y las perturbaciones en sus islas de anidación.' },
    ],
  },
  todos: {
    boton: '🌊 Todos', nombre: 'Corriente de Humboldt', cient: 'Costa del Perú',
    estado: 'Ecosistema', clase: 'eco', hint: 'Toca: todos reaccionan',
    datos: [
      { tag: 'Vecinos', titulo: 'Cuatro especies, una costa',
        texto: 'El pingüino de Humboldt, la nutria marina, el lobo marino y el zarcillo comparten la costa del Pacífico peruano.' },
      { tag: 'Mar frío', titulo: 'Uno de los mares más productivos',
        texto: 'La corriente de Humboldt trae aguas frías llenas de nutrientes que alimentan enormes cardúmenes de anchoveta, la base de la cadena.' },
      { tag: 'Cada uno en su sitio', titulo: 'Comparten las rocas',
        texto: 'El pingüino anida en el guano, la nutria se esconde en grietas junto a las olas, el lobo marino descansa en playas e islas y el zarcillo anida en los acantilados.' },
      { tag: 'Trabajo en equipo', titulo: 'Pescando juntos',
        texto: 'Cuando los lobos marinos y las aves buceadoras persiguen cardúmenes, el zarcillo aprovecha para atrapar los peces que suben a la superficie.' },
      { tag: 'El Niño', titulo: 'Cuando el mar se calienta',
        texto: 'Durante El Niño el agua se calienta, la anchoveta se aleja o baja más profundo y a todos les cuesta encontrar comida.' },
      { tag: 'Áreas protegidas', titulo: 'Refugios en la costa',
        texto: 'La Reserva Nacional de Paracas y la Reserva Nacional Sistema de Islas, Islotes y Puntas Guaneras protegen parte de su hábitat.' },
      { tag: 'Cómo ayudar', titulo: 'Tú también cuentas',
        texto: 'No dejes basura en la playa, obsérvalos desde lejos sin alimentarlos y respeta las zonas protegidas.' },
    ],
  },
};

const ORDEN = ['pinguino', 'nutria', 'lobo', 'zarcillo', 'todos'];

// =====================================================================
// ESTADO
// =====================================================================

let cam, ar, imgMarcador;
let actual = 'pinguino';
let dato = 0;
let visto = false;
const accionT = { pinguino: -1e9, nutria: -1e9, lobo: -1e9, zarcillo: -1e9 }; // última vez que se tocó a cada uno (s)

const el = {};

function setup() {
  for (const id of ['estado', 'ficha', 'ficha-animal', 'ficha-cient', 'ficha-badge', 'ficha-tag',
    'ficha-titulo', 'ficha-texto', 'ficha-num', 'ficha-hint', 'animales']) el[id] = document.getElementById(id);

  // animal inicial: #nutria en la URL, o el último elegido
  const hash = location.hash.slice(1);
  let guardado = null;
  try { guardado = localStorage.getItem('animal'); } catch (e) {}
  if (INFO[hash]) actual = hash; else if (INFO[guardado]) actual = guardado;

  crearBotones();
  elegir(actual);

  NyAR.createARCanvas(this, { fit: 'cover' }); // pantalla completa, vertical en el celular
  cam = NyAR.createCamera(this);               // cámara trasera en el celular
  ar = new NyAR.MultiMarker(this, width, height);

  if (MI_IMAGEN) {
    ar.setConfidenceThreshold(0.7);            // más exigente con imágenes propias
    loadImage(MI_IMAGEN, img => { imgMarcador = img; ar.addARMarker(img, TAMANO_MM); });
  } else {
    ar.addARMarker('hiro', TAMANO_MM);
  }

  ar.setLostDelay(5);   // ~1/6 s sin verlo antes de darlo por perdido (menos parpadeo)

  textureMode(NORMAL);
  prepararTexturas();
  armarAtlas();
}

// La búsqueda del marcador es lo más caro: la cámara entrega ~30 cuadros por segundo y el dibujo
// va a 60, así que solo se busca (y se redibuja) cuando llega un cuadro nuevo de la cámara.
const camCuadro = { video: null, nuevo: true, ok: false, vigila: false, dibujar: true };
function detectar() {
  const v = cam && cam.elt;
  if (v !== camCuadro.video) {
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

function draw() {
  if (ar.error) { background(0); return estado('error', 'Error: ' + ar.error.message); }
  if (!ar.ready) { background(0); return estado('', 'Cargando motor de RA…'); }
  if (!detectar()) { background(0); return estado('', 'Acepta el permiso de la cámara'); }
  if (!camCuadro.dibujar) return;   // mismo cuadro de cámara: queda la imagen anterior
  camCuadro.dibujar = false;
  background(0);

  ar.applyCamera();
  ar.drawBackground();

  const hay = ar.isExist(0);
  el.ficha.classList.toggle('visible', hay);
  if (!hay) return estado('', visto ? 'Busca otra vez el marcador' : 'Apunta al marcador');
  visto = true;
  estado('ok', INFO[actual].nombre);

  ar.beginTransform(0);
  push();
  noStroke();
  rotateX(HALF_PI);   // +Y arriba, +Z hacia quien mira
  luces();
  const t = reloj();
  if (actual === 'todos') {
    // los tres juntos, más pequeños, cada uno en su zona y con su propio ritmo
    // (tamaños relativos aproximados: el lobo marino es el más grande)
    escena('lobo',     t, { x: 0,   z: -24, escala: 0.85, desfase: 0 });
    escena('pinguino', t, { x: -24, z: 12,  escala: 0.5,  desfase: 3.1 });
    escena('nutria',   t, { x: 24,  z: 16,  escala: 0.55, desfase: 6.3 });
    escena('zarcillo', t, { x: 0,   z: 28,  escala: 0.6,  desfase: 2.0 });
  } else {
    escena(actual, t, { x: 0, z: 0, escala: 1, desfase: 0 });
  }
  pop();
  ar.endTransform();
}

function reloj() { return millis() / 1000; }

// =====================================================================
// ANIMALES: medidas, recorrido y dibujo
// Cada animal se dibuja en "píxeles" del modelo; 1 píxel = U mm sobre el papel.
// =====================================================================

// Recorrido de ida y vuelta: camina, gira hacia ti, hace su acción, sigue al otro lado...
function rutaIdaVuelta(x, dCamina, dAccion) {
  return [
    { d: dCamina, modo: 'camina', x0: -x, x1: x, g0: 90, g1: 90 },
    { d: 0.6, modo: 'gira', x0: x, x1: x, g0: 90, g1: 0 },
    { d: dAccion, modo: 'accion', x0: x, x1: x, g0: 0, g1: 0 },
    { d: 0.6, modo: 'gira', x0: x, x1: x, g0: 0, g1: -90 },
    { d: dCamina, modo: 'camina', x0: x, x1: -x, g0: -90, g1: -90 },
    { d: 0.6, modo: 'gira', x0: -x, x1: -x, g0: -90, g1: 0 },
    { d: dAccion, modo: 'accion', x0: -x, x1: -x, g0: 0, g1: 0 },
    { d: 0.6, modo: 'gira', x0: -x, x1: -x, g0: 0, g1: 90 },
  ];
}

const ANIMAL = {
  pinguino: { U: 3.2, ruta: rutaIdaVuelta(13, 3.0, 1.8), sombra: [28, 24, 0],   dur: 0.7, dibujar: dibujarPinguino },
  nutria:   { U: 2.6, ruta: rutaIdaVuelta(14, 1.7, 2.8), sombra: [14, 40, -4],  dur: 0.8, dibujar: dibujarNutria },
  lobo:     { U: 2.5, ruta: rutaIdaVuelta(9, 3.6, 2.2),  sombra: [26, 50, -3],  dur: 0.9, dibujar: dibujarLobo },
  zarcillo: { U: 2.6, ruta: rutaIdaVuelta(10, 2.4, 4.0), sombra: null,          dur: 0.8, dibujar: dibujarZarcillo },
};
for (const a of Object.values(ANIMAL)) a.total = a.ruta.reduce((s, r) => s + r.d, 0);

function recorrido(A, t) {
  let u = ((t % A.total) + A.total) % A.total;
  for (const r of A.ruta) {
    if (u <= r.d) {
      const k = u / r.d;
      return { x: r.modo === 'camina' ? lerp(r.x0, r.x1, k) : r.x0, giro: radians(lerp(r.g0, r.g1, suave(k))), modo: r.modo, k };
    }
    u -= r.d;
  }
  const r = A.ruta[0];
  return { x: r.x0, giro: radians(r.g0), modo: r.modo, k: 0 };
}

function escena(id, t, o) {
  const A = ANIMAL[id];
  const p = recorrido(A, t + o.desfase);
  const s = constrain((t - accionT[id]) / A.dur, 0, 1); // progreso de la reacción al toque (1 = nada)
  push();
  translate(o.x, 0, o.z);
  scale(o.escala);
  translate(p.x, 0, 0);
  rotateY(p.giro);
  if (A.sombra) sombra(A.sombra[0], A.sombra[1], A.sombra[2]); // (el zarcillo dibuja la suya: vuela)
  scale(A.U);
  A.dibujar(t + o.desfase, p, s);
  pop();
}

// ---------------------------------------------------------------------
// PINGÜINO DE HUMBOLDT — camina contoneándose, se detiene y agita las aletas; al tocarlo salta
// ---------------------------------------------------------------------
function dibujarPinguino(t, p, s) {
  const T = TX.pinguino;
  const saltando = s < 1;
  const pasos = p.modo !== 'accion' && p.modo !== 'quieto' && !saltando;   // ('quieto': parado en tu mano)
  const fase = t * 7;
  const paso = pasos ? sin(fase) : 0;

  translate(0, (saltando ? sin(s * PI) * 8.5 : 0) + (pasos ? abs(paso) * 0.28 : 0), 0);
  rotateZ(paso * 0.13);

  // patas (avanzan alternadas)
  for (const lado of [-1, 1]) {
    const f = pasos ? paso * lado : 0;
    pieza(lado * 2, 0.5 + max(0, f) * 0.6, 1 + f * 0.9, () => caja(3, 1, 4, T.pata));
  }
  // cuerpo y cola
  pieza(0, 6, 0, () => caja(8, 10, 6, T.cuerpo));
  pieza(0, 1.6, -3.6, () => { rotateX(-0.35); caja(2, 1, 2, T.cola); });

  // aletas
  let abre;
  if (saltando) abre = 0.4 + abs(sin(s * PI * 4)) * 0.9;
  else if (p.modo === 'accion') abre = 0.25 + abs(sin(t * 11)) * 0.85;
  else abre = 0.15 + sin(fase) * 0.08;
  for (const lado of [-1, 1]) {
    pieza(lado * 4, 10.5, -0.5, () => {
      rotateZ(lado * abre);
      rotateX(pasos ? -sin(fase) * lado * 0.2 : 0);
      translate(lado * 0.5, -3.5, 0);
      caja(1, 7, 4, T.aleta);
    });
  }
  // cabeza y pico
  pieza(0, 14, 0.5, () => {
    rotateZ(-paso * 0.06);
    if (p.modo === 'accion' && !saltando) rotateX(-0.12 - abs(sin(t * 11)) * 0.06); // levanta el pico
    caja(6, 6, 6, T.cabeza);
    pieza(0, -0.6, 4.5, () => caja(2, 1.5, 3, T.pico));
  });
}

// ---------------------------------------------------------------------
// NUTRIA MARINA — corre rápido ondulando el cuerpo, se para en dos patas y come un cangrejo;
// al tocarla da un salto con giro
// ---------------------------------------------------------------------
function dibujarNutria(t, p, s) {
  const T = TX.nutria;
  const salta = s < 1;
  const parada = p.modo === 'accion' ? suave(constrain(min(p.k, 1 - p.k) * 5, 0, 1)) : 0; // 0 = en 4 patas, 1 = de pie
  const corre = p.modo !== 'accion';
  const fase = t * 15;
  const ond = corre ? sin(fase) : 0;

  if (salta) { translate(0, sin(s * PI) * 7, 0); rotateY(suave(s) * TWO_PI); }
  translate(0, corre ? abs(ond) * 0.35 : 0, 0);

  // se para: gira todo el cuerpo hacia arriba sobre las caderas
  translate(0, 1.2, -4);
  rotateX(-parada * 1.2 + ond * 0.05);
  translate(0, -1.2, 4);

  // cuerpo largo
  pieza(0, 3, 0, () => caja(4, 3.5, 11, T.cuerpo));

  // patas cortas (galope: delanteras y traseras alternadas)
  for (const [lz, desf] of [[3.8, 0], [-3.8, PI]]) {
    for (const lado of [-1, 1]) {
      pieza(lado * 1.5, 1.6, lz, () => {
        let ang = corre ? sin(fase + desf) * 0.7 : 0;
        if (lz > 0 && parada > 0) ang = -parada * 1.1;                // brazos hacia adelante: sostiene el cangrejo
        if (lz < 0 && parada > 0) ang = parada * 1.2;                 // patas traseras siguen en el suelo
        rotateX(ang);
        translate(0, -0.8, 0);
        caja(1.2, 1.7, 1.4, T.pata);
      });
    }
  }

  // cola larga y gruesa
  pieza(0, 2.8, -5.5, () => {
    rotateX(-0.12 + parada * 1.2);   // de pie, la cola queda apoyada en el suelo
    rotateY(corre ? sin(fase * 0.5) * 0.25 : sin(t * 3) * 0.15);
    translate(0, 0, -2.4); caja(1.9, 1.5, 5, T.cola);
    translate(0, -0.2, -4.2); caja(1.2, 1, 3.8, T.cola);
  });

  // cabeza (de pie mira al frente y mastica)
  pieza(0, 4.3, 7.2, () => {
    rotateX(parada * 1.05 + (parada > 0.5 ? sin(t * 14) * 0.08 : 0));
    rotateY(corre ? 0 : sin(t * 2.2) * 0.35 * (1 - parada));
    caja(4, 3.5, 4, T.cabeza);
    pieza(0, -0.6, 2.7, () => caja(2.6, 1.8, 1.6, T.hocico));
    for (const lado of [-1, 1]) pieza(lado * 1.4, 2, -0.6, () => caja(0.9, 0.9, 0.6, T.oreja));
    if (parada > 0.05) {
      // cangrejo
      pieza(0, -1.7, 3.6, () => {
        scale(parada);
        caja(2.4, 1, 1.6, T.cangrejo);
        for (const lado of [-1, 1]) pieza(lado * 1.6, 0.2, 0.6, () => caja(0.8, 0.8, 0.9, T.pinza));
      });
    }
  });
}

// ---------------------------------------------------------------------
// LOBO MARINO CHUSCO — avanza balanceándose sobre sus aletas, se detiene, levanta la cabeza y ladra;
// al tocarlo ladra fuerte
// ---------------------------------------------------------------------
function dibujarLobo(t, p, s) {
  const T = TX.lobo;
  const tocado = s < 1;
  const accion = p.modo === 'accion';
  let ladra = accion ? max(0, sin(p.k * PI * 6)) * suave(constrain(min(p.k, 1 - p.k) * 6, 0, 1)) : 0;
  if (tocado) ladra = max(ladra, sin(s * PI * 3) * (1 - s * 0.3));
  const camina = !accion && !tocado;
  const fase = t * 5;
  const g = camina ? sin(fase) : 0;

  translate(0, camina ? abs(g) * 0.5 : 0, 0);
  rotateX(g * 0.06);

  // cadera y torso (el pecho va levantado)
  pieza(0, 2.2, -5.5, () => caja(6, 4.2, 6, T.cadera));
  pieza(0, 4.4, 0.4, () => { rotateX(-0.25); caja(8, 6, 7, T.torso); });
  // cuello con melena
  pieza(0, 8.6, 3.0, () => { rotateX(-0.15); caja(6.4, 5.5, 5, T.melena); });

  // aletas delanteras: brazo + aleta que se abre hacia afuera
  for (const lado of [-1, 1]) {
    const mueve = camina ? sin(fase + (lado > 0 ? 0 : PI)) * 0.35 : 0;
    pieza(lado * 3.9, 2.4, 3, () => {
      rotateX(mueve * 0.6);
      caja(1.6, 3.6, 2, T.brazo);
      pieza(lado * 0.9, -1.6, 1.4, () => { rotateY(lado * 0.55 + mueve * 0.4); caja(2.2, 0.7, 5, T.aleta); });
    });
  }
  // aletas traseras: giradas hacia afuera y atrás
  for (const lado of [-1, 1]) {
    pieza(lado * 2, 0.4, -9, () => { rotateY(lado * (0.4 + (camina ? sin(fase) * 0.12 : 0))); caja(2, 0.6, 4.2, T.aleta); });
  }

  // cabeza grande y redondeada: se levanta y abre un poco la boca al ladrar
  pieza(0, 10.6, 4, () => {
    rotateX(-0.1 - ladra * 0.45 + g * 0.05);
    rotateY(accion && !tocado ? sin(t * 1.6) * 0.3 : 0);
    rotateZ(accion && !tocado ? sin(t * 1.1) * 0.12 : 0); // inclina la cabeza, curioso
    pieza(0, 2.4, 1.4, () => caja(6, 5, 5.5, T.cabeza));
    pieza(0, 1.2, 5.25, () => caja(3.4, 2, 2.4, T.hocico));
    pieza(0, 0.3, 4.3, () => {                   // mandíbula
      rotateX(ladra * 0.45);
      translate(0, -0.3, 1.1);
      caja(3, 0.6, 2.2, T.mandibula);
    });
    for (const lado of [-1, 1]) pieza(lado * 3.1, 3.6, 0.8, () => caja(0.5, 0.8, 0.6, T.oreja));
  });
}

// ---------------------------------------------------------------------
// ZARCILLO — camina a saltitos, alza vuelo, da una vuelta en círculo y aterriza;
// al tocarlo aletea y salta
// ---------------------------------------------------------------------
function dibujarZarcillo(t, p, s) {
  const T = TX.zarcillo;
  const vuela = p.modo === 'accion';
  const tocado = s < 1;
  let h = 0, ox = 0, oz = 0, yaw = 0, banco = 0;
  if (vuela) {
    const a = p.k * TWO_PI, R = 7;                 // círculo de ~18 mm de radio
    ox = sin(a) * R;
    oz = -(1 - cos(a)) * R;
    const mezcla = constrain(min(p.k, 1 - p.k) * 8, 0, 1);
    h = 9 * suave(constrain(min(p.k, 1 - p.k) * 5, 0, 1));
    yaw = atan2(cos(a), -sin(a)) * mezcla;         // mira hacia donde vuela
    banco = 0.35 * mezcla;                         // se inclina en la curva
  }
  const salto = tocado ? sin(s * PI) * 4 : 0;
  const enAire = (vuela && h > 0.6) || tocado;

  // sombra en el suelo, bajo el ave (se achica cuando sube)
  push();
  translate(ox, 0, oz);
  const k = 1 - min(h + salto, 12) / 20;
  sombra(5 * k, 8 * k, 0);
  pop();

  translate(ox, h + salto + (!enAire ? abs(sin(t * 9)) * 0.6 : 0), oz);
  rotateY(yaw);
  rotateZ(banco);
  if (!enAire) rotateX(-0.12);                     // de pie, el pecho un poco levantado

  // cuerpo y cola en "V"
  pieza(0, 3.6, 0, () => caja(4, 3.4, 7, T.cuerpo));
  pieza(0, 3.9, -3.4, () => {
    rotateX(-0.2);
    for (const lado of [-1, 1]) pieza(lado * 0.55, 0, -1.7, () => { rotateY(lado * 0.28); caja(0.7, 0.4, 3.6, T.cola); });
  });

  // alas: plegadas al costado; en el aire se abren y aletean rápido
  const ang = enAire ? 1.35 + sin(t * 22) * 0.65 : 0.06;
  for (const lado of [-1, 1]) {
    pieza(lado * 2.05, 5, 0.4, () => {
      rotateZ(lado * ang);
      translate(lado * 0.1, -2, -1.2);
      caja(0.45, 4, 6, T.ala);
    });
  }

  // patas rojas (en el aire se recogen)
  if (!enAire) {
    for (const lado of [-1, 1]) {
      pieza(lado * 1, 1.1, 0.4, () => caja(0.45, 1.8, 0.45, T.pata));
      pieza(lado * 1, 0.15, 0.9, () => caja(1, 0.3, 1.4, T.pata));
    }
  }

  // cabeza con pico rojo y bigotes blancos rizados
  pieza(0, 6.3, 3.2, () => {
    rotateY(!enAire && p.modo === 'camina' ? sin(t * 2.5) * 0.25 : 0);
    rotateX(enAire ? 0.15 : 0);
    caja(3.4, 3.2, 3.4, T.cabeza);
    pieza(0, -0.5, 2.9, () => { rotateX(0.12); caja(0.9, 0.9, 2.6, T.pico); });
    for (const lado of [-1, 1]) {
      pieza(lado * 1.75, -0.7, 1.1, () => {
        rotateX(0.45);
        rotateZ(lado * 0.3);             // se abren hacia afuera
        translate(0, -1.3, 0);
        caja(0.45, 2.6, 0.55, T.bigote);
        pieza(0, -1.3, 0, () => { rotateX(-1.1); translate(0, -0.7, 0); caja(0.45, 1.4, 0.55, T.bigote); }); // rizo
      });
    }
  });
}

// =====================================================================
// TEXTURAS PIXELADAS
// Cada letra es un píxel. En las caras laterales la columna 0 es el frente del animal.
// =====================================================================

const PALETA = {
  // pingüino
  B: [26, 26, 31], K: [12, 12, 14], L: [48, 50, 60], W: [238, 238, 228], P: [236, 136, 142],
  E: [70, 28, 22], N: [8, 8, 8], G: [165, 165, 152], F: [44, 40, 46], R: [214, 150, 155],
  // nutria
  O: [84, 58, 40], o: [60, 41, 29], T: [170, 140, 106], A: [225, 218, 204], X: [20, 16, 14],
  // lobo marino (tonos cálidos y suaves)
  D: [160, 112, 72], d: [140, 96, 62], M: [186, 140, 92], C: [224, 188, 142], H: [224, 122, 132], Q: [224, 152, 132],
  // cangrejo
  Z: [204, 64, 42], z: [150, 42, 30],
  // zarcillo
  S: [80, 84, 98], s: [62, 66, 78], V: [38, 40, 48], Y: [216, 40, 36], y: [244, 198, 72],
};

const PX = 16; // resolución de cada píxel dentro de la textura
let TX = {};

function azar(x, y, s) { return fract(sin(x * 12.9898 + y * 78.233 + s * 37.7) * 43758.5453); }

function pixelArt(filas, semilla = 1) {
  const h = filas.length, w = filas[0].length;
  const g = createGraphics(w * PX, h * PX);
  g.pixelDensity(1);
  g.noStroke();
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const c = PALETA[filas[y][x]];
      const k = 0.92 + azar(x, y, semilla) * 0.14; // variación por píxel: aspecto "bloque"
      g.fill(min(255, c[0] * k), min(255, c[1] * k), min(255, c[2] * k));
      g.rect(x * PX, y * PX, PX, PX);
    }
  }
  return g;
}
// genera un dibujo a partir de una función (x, y) → letra
function patron(w, h, fn, semilla) {
  const filas = [];
  for (let y = 0; y < h; y++) { let f = ''; for (let x = 0; x < w; x++) f += fn(x, y); filas.push(f); }
  return pixelArt(filas, semilla);
}
function liso(letra, w, h, semilla) { return patron(w, h, () => letra, semilla); }
function moteado(a, b, w, h, semilla, p = 0.82) { return patron(w, h, (x, y) => azar(x, y, semilla + 99) > p ? b : a, semilla); }
function todo(tex) { return { front: tex, side: tex, back: tex, top: tex, bottom: tex }; }

function prepararTexturas() {
  // ---------- PINGÜINO ----------
  TX.pinguino = {
    cabeza: {
      front: pixelArt(['BBBBBBBB', 'BBBBBBBB', 'WWWBBWWW', 'BPNPPNPB', 'BPPPPPPB', 'BBPPPPBB', 'BBBBBBBB', 'BBBBBBBB'], 1),
      side: pixelArt(['BBBBBBBB', 'BBBBBBBB', 'WWWWWBBB', 'PEPBBWBB', 'PPBBBWBB', 'BBBBWBBB', 'BBBWBBBB', 'BBWBBBBB'], 2),
      back: liso('B', 8, 8, 3), top: liso('B', 8, 8, 4), bottom: liso('B', 8, 8, 5),
    },
    cuerpo: {
      front: pixelArt(['BWWWWWWB', 'BWWWWWWB', 'BKKKKKKB', 'BKWWWWKB', 'KWWWWWWK',
        'KWWKWWWK', 'WWWWWWWW', 'WWKWWWKW', 'WWWWKWWW', 'WWWWWWWW'], 6),
      side: pixelArt(['BWLLLL', 'WWLLLL', 'BBLLLL', 'BLLLLL', 'KLLLLL', 'KLLLLL', 'WKLLLL', 'WWKLLL', 'WWLLLL', 'WWLLLL'], 7),
      back: liso('L', 8, 10, 8), top: liso('L', 8, 6, 9), bottom: liso('W', 8, 6, 10),
    },
    pico: {
      front: liso('K', 2, 2, 11), side: pixelArt(['KGK', 'KGK'], 12), back: liso('K', 2, 2, 13),
      top: pixelArt(['KK', 'GG', 'KK'], 14), bottom: liso('K', 2, 3, 15),
    },
    aleta: { front: liso('L', 1, 7, 17), side: liso('L', 4, 7, 16), back: liso('L', 1, 7, 18), top: liso('L', 1, 4, 19), bottom: liso('B', 1, 4, 20) },
    pata: {
      front: liso('F', 3, 1, 22), side: liso('F', 4, 1, 21), back: liso('F', 3, 1, 23),
      top: pixelArt(['FRF', 'FFR', 'RFF', 'FFF'], 24), bottom: liso('F', 3, 4, 25),
    },
    cola: todo(liso('L', 2, 2, 26)),
  };

  // ---------- NUTRIA MARINA ----------
  TX.nutria = {
    cuerpo: {
      front: patron(8, 7, (x, y) => y >= 4 ? 'T' : 'O', 30),
      side: patron(22, 7, (x, y) => (y >= 5 && x < 6) || (y >= 6 && x < 9) ? 'T' : azar(x, y, 31) > 0.85 ? 'o' : 'O', 31),
      back: moteado('O', 'o', 8, 7, 32),
      top: moteado('O', 'o', 8, 22, 33, 0.75),
      bottom: patron(8, 22, (x, y) => y < 8 ? 'T' : 'O', 34),
    },
    cabeza: {
      front: pixelArt(['OOOOOOOO', 'OOOOOOOO', 'ONOOOONO', 'OOOOOOOO', 'OOTTTTOO', 'OTTTTTTO', 'TTTTTTTT'], 35),
      side: pixelArt(['OOOOOOOO', 'OOOOOOOO', 'ONOOOOOO', 'OOOOOOOO', 'TTOOOOOO', 'TTTOOOOO', 'TTTTOOOO'], 36),
      back: moteado('O', 'o', 8, 7, 37), top: moteado('O', 'o', 8, 8, 38), bottom: liso('T', 8, 8, 39),
    },
    hocico: {
      front: pixelArt(['TXXT', 'ATTA'], 40), side: pixelArt(['TT', 'AT'], 41), back: liso('T', 4, 2, 42),
      top: pixelArt(['OOO', 'TTT'], 43), bottom: liso('T', 3, 2, 44),
    },
    oreja: todo(liso('o', 2, 2, 45)),
    pata: todo(liso('o', 2, 3, 46)),
    cola: todo(moteado('O', 'o', 3, 8, 47)),
    cangrejo: {
      front: pixelArt(['zNZZNz', 'ZZZZZZ'], 48), side: liso('Z', 3, 2, 49), back: liso('Z', 6, 2, 50),
      top: moteado('Z', 'z', 6, 4, 51, 0.7), bottom: liso('z', 6, 4, 52),
    },
    pinza: todo(liso('Z', 2, 2, 53)),
  };

  // ---------- LOBO MARINO ----------
  TX.lobo = {
    torso: {
      front: patron(8, 6, (x, y) => y < 2 ? 'M' : (x === 0 || x === 7) ? 'D' : 'C', 60),
      side: patron(14, 12, (x, y) => (x < 4 && y < 5) ? 'M' : (y >= 9 && x < 7) ? 'C' : azar(x, y, 61) > 0.93 ? 'd' : 'D', 61),
      back: moteado('D', 'd', 8, 6, 62, 0.93), top: patron(8, 7, (x, y) => y >= 4 ? 'M' : 'D', 63), bottom: liso('C', 8, 7, 64),
    },
    cadera: {
      front: moteado('D', 'd', 6, 4, 65, 0.93), side: patron(12, 8, (x, y) => y >= 6 ? 'C' : azar(x, y, 66) > 0.93 ? 'd' : 'D', 66),
      back: moteado('D', 'd', 6, 4, 67, 0.93), top: moteado('D', 'd', 6, 6, 68, 0.93), bottom: liso('C', 6, 6, 69),
    },
    melena: todo(moteado('M', 'D', 6, 6, 70, 0.9)),
    // cara tierna: ojos grandes con brillo y mejillas rosadas
    cabeza: {
      front: pixelArt([
        'DDDDDDDDDDDD',
        'DDDDDDDDDDDD',
        'DDDDDDDDDDDD',
        'DDNWDDDDNWDD',
        'DDNNDDDDNNDD',
        'DDNNDDDDNNDD',
        'DQDDDDDDDDQD',
        'DDDDCCCCDDDD',
        'DDDCCCCCCDDD',
        'DDDCCCCCCDDD',
      ], 71),
      side: pixelArt([
        'DDDDDDDDDDD',
        'DDDDDDDDDDD',
        'DDDDDDDDDDD',
        'DNWDDDDDDDD',
        'DNNDDDDDDDD',
        'DNNDDDDDDDD',
        'QDDDDDDDDDD',
        'CCDDDDDDDDD',
        'CCCDDDDDDDD',
        'CCCDDDDDDDD',
      ], 72),
      back: moteado('D', 'd', 12, 10, 73, 0.93), top: moteado('D', 'd', 12, 11, 74, 0.93), bottom: liso('C', 12, 11, 75),
    },
    // hocico claro con nariz oscura y puntitos de bigotes
    hocico: {
      front: pixelArt(['CCXXCC', 'CdCCdC', 'dCCCCd', 'CCCCCC'], 76),
      side: pixelArt(['CCCCC', 'CdCCC', 'dCdCC', 'CCCCC'], 77),
      back: liso('C', 6, 4, 78), top: patron(6, 5, (x, y) => y >= 3 && (x === 2 || x === 3) ? 'X' : 'C', 79), bottom: liso('H', 6, 5, 80),
    },
    mandibula: { front: liso('C', 5, 1, 81), side: liso('C', 4, 1, 82), back: liso('C', 5, 1, 83), top: liso('H', 5, 4, 84), bottom: liso('C', 5, 4, 85) },
    oreja: todo(liso('d', 1, 2, 86)),
    brazo: todo(moteado('D', 'd', 2, 4, 87, 0.93)),
    aleta: todo(moteado('d', 'D', 3, 6, 88, 0.8)),
  };

  // ---------- ZARCILLO ----------
  TX.zarcillo = {
    cuerpo: {
      front: moteado('S', 's', 8, 7, 90, 0.9), side: moteado('S', 's', 14, 7, 91, 0.9),
      back: liso('s', 8, 7, 92), top: moteado('s', 'S', 8, 14, 93, 0.85), bottom: liso('S', 8, 14, 94),
    },
    cabeza: {
      front: pixelArt(['VVVVVVV', 'VVVVVVV', 'SNSSSNS', 'SSSySSS', 'SSSSSSS', 'SSSSSSS'], 95),
      side: pixelArt(['VVVVVVV', 'VVVVVVV', 'SNSSSSS', 'ySSSSSS', 'SSSSSSS', 'SSSSSSS'], 96),
      back: patron(7, 6, (x, y) => y < 2 ? 'V' : 'S', 97), top: liso('V', 7, 7, 98), bottom: liso('S', 7, 7, 99),
    },
    pico: {
      front: liso('Y', 2, 2, 100), side: pixelArt(['YYYYYy', 'YYYYYy'], 101), back: liso('y', 2, 2, 102),
      top: pixelArt(['yy', 'YY', 'YY', 'YY', 'YY', 'YY'], 103), bottom: liso('Y', 2, 6, 104),
    },
    bigote: todo(liso('W', 1, 4, 105)),
    ala: {
      front: liso('s', 1, 8, 106), side: patron(12, 8, (x, y) => y === 7 ? 'W' : x > 8 ? 'V' : azar(x, y, 107) > 0.85 ? 's' : 'S', 107),
      back: liso('V', 1, 8, 108), top: liso('s', 1, 12, 109), bottom: liso('W', 1, 12, 110),
    },
    cola: todo(liso('s', 2, 6, 111)),
    pata: todo(liso('Y', 1, 3, 112)),
  };
}

// =====================================================================
// BLOQUES TEXTURIZADOS (versión rápida)
// Todas las texturas se pegan en UNA imagen (atlas) que se sube a la GPU una sola vez, y cada
// caja se arma una única vez como geometría (buildGeometry) que luego se dibuja con model().
// Antes cada caja eran 6 formas nuevas por cuadro, y p5 volvía a subir a la GPU ~100 texturas
// por cuadro (lo hace con cualquier p5.Graphics usado como textura): de ahí las trabas.
// =====================================================================

let ATLAS = null;
const UV = new Map();   // textura original → [u0, v0, u1, v1] dentro del atlas
function armarAtlas() {
  const lista = new Set();
  for (const animal of Object.values(TX)) for (const parte of Object.values(animal)) for (const t of Object.values(parte)) lista.add(t);
  const E = 0.5, PAD = 2, ANCHO = 1024;   // 8 px por "píxel" del dibujo, con 2 px de margen
  const orden = [...lista].sort((a, b) => b.height - a.height);
  let x = 0, y = 0, fila = 0;
  const pos = [];
  for (const g of orden) {
    const w = g.width * E + PAD * 2, h = g.height * E + PAD * 2;
    if (x + w > ANCHO) { x = 0; y += fila; fila = 0; }
    pos.push([g, x, y]);
    x += w; fila = max(fila, h);
  }
  const alto = y + fila;
  const A = createGraphics(ANCHO, alto);
  A.pixelDensity(1);
  A.noSmooth();
  for (const [g, x, y] of pos) {
    const w = g.width * E, h = g.height * E;
    A.image(g, x, y, w + PAD * 2, h + PAD * 2);   // margen con los colores del borde (evita costuras)
    A.image(g, x + PAD, y + PAD, w, h);
    UV.set(g, [(x + PAD) / ANCHO, (y + PAD) / alto, (x + PAD + w) / ANCHO, (y + PAD + h) / alto]);
  }
  ATLAS = A.get();   // p5.Image: se sube una sola vez
}

const CAJAS = new Map();   // juego de texturas → (medidas → geometría)
function caja(w, h, d, t) {
  let m = CAJAS.get(t);
  if (!m) CAJAS.set(t, m = new Map());
  const k = w + ',' + h + ',' + d;
  let g = m.get(k);
  if (!g) { g = buildGeometry(() => cajaUV(w, h, d, t)); m.set(k, g); }
  texture(ATLAS);
  model(g);
}

function cajaUV(w, h, d, t) {
  const a = w / 2, b = h / 2, c = d / 2;
  cara(t.front,  [-a, b, c], [a, b, c], [a, -b, c], [-a, -b, c], [0, 0, 1]);
  cara(t.back,   [a, b, -c], [-a, b, -c], [-a, -b, -c], [a, -b, -c], [0, 0, -1]);
  cara(t.side,   [a, b, c], [a, b, -c], [a, -b, -c], [a, -b, c], [1, 0, 0]);
  cara(t.side,   [-a, b, c], [-a, b, -c], [-a, -b, -c], [-a, -b, c], [-1, 0, 0]);
  cara(t.top,    [-a, b, -c], [a, b, -c], [a, b, c], [-a, b, c], [0, 1, 0]);
  cara(t.bottom, [-a, -b, c], [a, -b, c], [a, -b, -c], [-a, -b, -c], [0, -1, 0]);
}

function cara(tex, p0, p1, p2, p3, n) {
  const [u0, v0, u1, v1] = UV.get(tex);
  beginShape(TRIANGLE_FAN);
  normal(...n); vertex(...p0, u0, v0);
  normal(...n); vertex(...p1, u1, v0);
  normal(...n); vertex(...p2, u1, v1);
  normal(...n); vertex(...p3, u0, v1);
  endShape();
}

function pieza(x, y, z, dibujar) { push(); translate(x, y, z); dibujar(); pop(); }

function luces() {
  ambientLight(150);
  directionalLight(190, 190, 185, 0.35, 0.5, -1);
  directionalLight(50, 60, 80, -0.6, -0.2, 0.6);  // relleno azulado (reflejo del mar)
}

// sombra rectangular, como de bloque (en mm)
function sombra(w, d, z) {
  push();
  fill(0, 0, 0, 80);
  translate(0, 0.2, z);
  rotateX(HALF_PI);
  plane(w, d);
  pop();
}

function suave(x) { return x * x * (3 - 2 * x); }

// =====================================================================
// INTERACCIÓN E INTERFAZ
// =====================================================================

function tocar() {
  if (!ar || !ar.isExist(0)) return;
  const t = reloj();
  if (actual === 'todos') for (const id in accionT) accionT[id] = t;
  else accionT[actual] = t;
  dato = (dato + 1) % INFO[actual].datos.length;
  mostrarDato();
}

let ultimoTap = -1e9;
function tap(e) {
  if (e && e.target && e.target.tagName !== 'CANVAS') return true; // deja funcionar los botones y el enlace
  const t = (e && e.timeStamp) || performance.now();
  if (t - ultimoTap > 350) tocar(); // un mismo toque puede llegar como touch y como clic
  ultimoTap = t;
  return false;
}
function touchStarted(e) { return tap(e); }
function mousePressed(e) { return tap(e); }

// En la PC: tecla S descarga tu imagen con el borde negro listo para imprimir
function keyPressed() {
  if ((key === 's' || key === 'S') && imgMarcador) NyAR.saveMarkerImage(imgMarcador, 'marcador-con-borde.png');
}

function crearBotones() {
  for (const id of ORDEN) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = INFO[id].boton;
    b.dataset.id = id;
    b.addEventListener('click', () => elegir(id));
    el.animales.appendChild(b);
  }
}

function elegir(id) {
  actual = id;
  dato = 0;
  try { localStorage.setItem('animal', id); } catch (e) {}
  for (const b of el.animales.children) b.setAttribute('aria-pressed', String(b.dataset.id === id));
  const I = INFO[id];
  el['ficha-animal'].textContent = I.nombre;
  el['ficha-cient'].textContent = I.cient;
  el['ficha-badge'].textContent = I.estado;
  el['ficha-badge'].className = 'badge ' + I.clase;
  el['ficha-hint'].textContent = I.hint;
  ultimoEstado = '';
  mostrarDato();
}

function mostrarDato() {
  const d = INFO[actual].datos[dato];
  el['ficha-tag'].textContent = d.tag;
  el['ficha-titulo'].textContent = d.titulo;
  el['ficha-texto'].textContent = d.texto;
  el['ficha-num'].textContent = `Dato ${dato + 1} de ${INFO[actual].datos.length}`;
}

let ultimoEstado = '';
function estado(tipo, msg) {
  const clave = tipo + msg;
  if (clave === ultimoEstado) return;
  ultimoEstado = clave;
  el.estado.innerHTML = `<span class="dot ${tipo}"></span><span></span>`;
  el.estado.lastChild.textContent = msg;
  if (tipo !== 'ok' && el.ficha) el.ficha.classList.remove('visible');
}
