// Verificador del mapa de Marcona — abre  marcona.html?verificar
// Revisa la maqueta en busca de choques e inconsistencias y muestra un informe en pantalla
// (y en la consola). Úsalo cada vez que muevas lugares, vías u objetos.
//
//  1. Objetos que se atraviesan entre sí (casas, postes, palmeras, rocas...).
//  2. Objetos encima de una vía, o flotando en el aire / con una esquina colgando.
//  3. Rutas del explorador entre TODOS los pares de lugares: que lleguen, sin pisar el mar,
//     sin atravesar objetos y sin escalones imposibles.
//  4. Barcos: que siempre naveguen por agua y no choquen con rocas, muelles ni entre ellos.
//  5. Tránsito (simulado 4 minutos con el explorador haciendo el recorrido): choques entre
//     vehículos, con el explorador, con personas o con objetos.
//  6. Aves, cóndor y avioneta: que no atraviesen cerros ni objetos. Aspas de los molinos.

function verificarMapa() {
  const t0 = performance.now();
  const secciones = [];
  const seccion = (titulo) => { const s = { titulo, items: [] }; secciones.push(s); return s.items; };
  const f1 = v => v.toFixed(1);

  // ---------- geometría: cajas orientadas en el plano (x, z) ----------
  const caja2 = (x, z, hw, hd, ang) => { const c = Math.cos(ang), s = Math.sin(ang); return { x, z, hw, hd, ax: [[c, -s], [s, c]] }; };
  const deCubo = q => caja2(q[0], q[2], q[3] / 2, q[5] / 2, q[7]);
  const radioEn = (o, ax) => o.hw * Math.abs(o.ax[0][0] * ax[0] + o.ax[0][1] * ax[1]) + o.hd * Math.abs(o.ax[1][0] * ax[0] + o.ax[1][1] * ax[1]);
  function penetra(a, b) {   // cuánto se meten una en otra (0 = no se tocan)
    let m = Infinity;
    for (const ax of [...a.ax, ...b.ax]) {
      const o = radioEn(a, ax) + radioEn(b, ax) - Math.abs((b.x - a.x) * ax[0] + (b.z - a.z) * ax[1]);
      if (o <= 0) return 0;
      m = Math.min(m, o);
    }
    return m;
  }
  const solapaY = (a0, a1, b0, b1) => Math.min(a1, b1) - Math.max(a0, b0);
  const contiene = (o, x, z) => {
    const dx = x - o.x, dz = z - o.z;
    return Math.abs(dx * o.ax[0][0] + dz * o.ax[0][1]) <= o.hw && Math.abs(dx * o.ax[1][0] + dz * o.ax[1][1]) <= o.hd;
  };

  // objetos con volumen, en una rejilla para buscar rápido
  const OBJ = CUBOS.filter(q => q[4] >= 0.3 && !SIN_VOLUMEN.has(q[8])).map(q => ({ q, o: deCubo(q), y0: q[1], y1: q[1] + q[4], g: q[8] }));
  const rej = new Map();
  for (const ob of OBJ) {
    const [hx, hz] = medioAncho(ob.q);
    ob.i0 = aCelda(ob.q[0] - hx); ob.i1 = aCelda(ob.q[0] + hx); ob.j0 = aCelda(ob.q[2] - hz); ob.j1 = aCelda(ob.q[2] + hz);
    for (let i = ob.i0; i <= ob.i1; i++) for (let j = ob.j0; j <= ob.j1; j++) {
      const k = i * N + j;
      if (!rej.has(k)) rej.set(k, []);
      rej.get(k).push(ob);
    }
  }
  function objetosEn(o, extra = 0) {   // objetos cuya celda toca la caja o
    const r = Math.hypot(o.hw, o.hd) + extra, vistos = new Set();
    for (let i = aCelda(o.x - r); i <= aCelda(o.x + r); i++) for (let j = aCelda(o.z - r); j <= aCelda(o.z + r); j++)
      for (const ob of rej.get(i * N + j) || []) vistos.add(ob);
    return vistos;
  }
  function chocaObjeto(o, y0, y1, ignorar) {   // primer objeto que atraviesa la caja o entre alturas y0..y1
    for (const ob of objetosEn(o)) {
      if (ignorar && ignorar(ob.g)) continue;
      if (solapaY(y0, y1, ob.y0, ob.y1) > 0.05 && penetra(o, ob.o) > 0.08) return ob.g;
    }
    return null;
  }
  const nombre = g => g.replace(/[\d_.-]+$/, '').replace(/(casa|turbina|palmera|sombrilla)[\d_.-]*/, '$1');
  function agrupar(lista, clave) {   // cuenta repeticiones y se queda con un ejemplo
    const m = new Map();
    for (const it of lista) { const k = clave(it); if (!m.has(k)) m.set(k, { n: 0, ej: it }); m.get(k).n++; }
    return [...m.entries()];
  }

  // ===== 1. objetos que se atraviesan =====
  {
    const out = seccion('Objetos que se atraviesan entre sí');
    const pares = new Map();
    for (const a of OBJ) for (let i = a.i0; i <= a.i1; i++) for (let j = a.j0; j <= a.j1; j++)
      for (const b of rej.get(i * N + j) || []) {
        if (b === a || a.g >= b.g || a.g === b.g) continue;
        const p = penetra(a.o, b.o), y = solapaY(a.y0, a.y1, b.y0, b.y1);
        if (p > 0.1 && y > 0.1) {
          const k = a.g + ' ↔ ' + b.g;
          if (!pares.has(k) || pares.get(k).p < p) pares.set(k, { p, x: a.q[0], z: a.q[2] });
        }
      }
    for (const [k, v] of pares) out.push(`${k}: se meten ${f1(v.p)} mm, en (${f1(v.x)}, ${f1(v.z)})`);
  }

  // ===== 2. objetos sobre vías, flotando o colgando =====
  {
    const out = seccion('Objetos sobre una vía');
    const permitidos = /^(senal|farol|plaza|aeropuerto|bancas|bandera|losa|muelle|puestos|cartel)/;
    const vistos = new Set();
    for (const ob of OBJ) {
      if (permitidos.test(ob.g) || vistos.has(ob.g)) continue;
      if (ob.y0 > alturaEn(ob.q[0], ob.q[2]) + 0.4) continue;   // está en alto (no pisa la vía)
      for (let i = ob.i0; i <= ob.i1 && !vistos.has(ob.g); i++) for (let j = ob.j0; j <= ob.j1; j++) {
        if (!CALLES.has(i * N + j) || !contiene(ob.o, celdaX(i), celdaX(j))) continue;
        vistos.add(ob.g);
        out.push(`${ob.g} pisa una vía en (${f1(celdaX(i))}, ${f1(celdaX(j))})`);
        break;
      }
    }
    const out2 = seccion('Objetos flotando o con una esquina en el aire');
    const enAgua = /^(muelle|barco-puerto|cargador|tortuga|elefante|islote|piedra-orilla|alga)/;
    const grupos = new Map();
    for (const ob of OBJ) { if (!grupos.has(ob.g)) grupos.set(ob.g, []); grupos.get(ob.g).push(ob); }
    for (const [g, lista] of grupos) {
      if (enAgua.test(g)) continue;
      const base = Math.min(...lista.map(o => o.y0));
      for (const ob of lista) {
        if (ob.y0 > base + 0.05) continue;   // solo las piezas que apoyan en el suelo
        const [hx, hz] = medioAncho(ob.q);
        const alturas = [[0, 0], [-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b]) => alturaEn(ob.q[0] + a * hx * 0.9, ob.q[2] + b * hz * 0.9));
        const hMax = Math.max(...alturas), hMin = Math.min(...alturas);
        if (ob.y0 > hMax + 0.3) { out2.push(`${g} flota ${f1(ob.y0 - hMax)} mm sobre el suelo en (${f1(ob.q[0])}, ${f1(ob.q[2])})`); break; }
        if (ob.y0 - hMin > 1.0 && Math.max(hx, hz) > 0.3) { out2.push(`${g}: una esquina queda ${f1(ob.y0 - hMin)} mm en el aire en (${f1(ob.q[0])}, ${f1(ob.q[2])})`); break; }
      }
    }
  }

  // ===== 3. rutas del explorador =====
  {
    const out = seccion('Rutas del explorador (todos los pares de lugares)');
    let total = 0, ok = 0;
    for (const L of LUGARES) {
      if (!L.destino) { out.push(`${L.nombre}: no tiene dónde pararse (ningún sitio alcanzable a pie)`); continue; }
      const d = dist(celdaX(L.destino[0]), celdaX(L.destino[1]), L.x, L.z);
      if (d > (L.lejos || 6)) out.push(`${L.nombre}: el explorador se para a ${f1(d)} mm del pin (lejos)`);
    }
    for (const A of LUGARES) for (const B of LUGARES) {
      if (A === B || !A.destino || !B.destino) continue;
      total++;
      const pts = buscarRuta(A.destino, B.destino);
      const p = problemaRuta(pts);
      if (!pts.llego) out.push(`${A.nombre} → ${B.nombre}: no hay camino a pie`);
      else if (p) out.push(`${A.nombre} → ${B.nombre}: ${p}`);
      else ok++;
    }
    out.unshift(`${ok} de ${total} rutas sin problemas`);
  }

  // ===== 4. barcos =====
  {
    const out = seccion('Barcos (5 minutos de navegación)');
    const lista = [];
    const cajaNave = (b, t, m = 0) => { const [x, z, g] = b.pose(t); return caja2(x, z, b.ancho / 2 + m, b.largo / 2 + m, g); };
    for (let t = 0; t < 300; t += 0.25) {
      NAVES.forEach((b, i) => {
        const o = cajaNave(b, t, 0.2);
        let tierra = false;
        for (let a = -1; a <= 1 && !tierra; a++) for (let c = -2; c <= 2; c++) {
          const px = o.x + o.ax[0][0] * o.hw * a + o.ax[1][0] * o.hd * c / 2, pz = o.z + o.ax[0][1] * o.hw * a + o.ax[1][1] * o.hd * c / 2;
          if (esTierra(px, pz)) { tierra = true; break; }
        }
        if (tierra) lista.push({ k: `${b.tipo} ${i} toca tierra`, t, x: o.x, z: o.z });
        const g = chocaObjeto(o, 0, MAR_Y + 3, g => /^alga/.test(g) || (b.tipo === 'bote' && !b.estela && g === 'muelle-caleta'));
        if (g) lista.push({ k: `${b.tipo} ${i} choca con ${nombre(g)}`, t, x: o.x, z: o.z });
        for (let j = i + 1; j < NAVES.length; j++)
          if (penetra(o, cajaNave(NAVES[j], t)) > 0.05) lista.push({ k: `${b.tipo} ${i} choca con ${NAVES[j].tipo} ${j}`, t, x: o.x, z: o.z });
      });
    }
    for (const [k, { n, ej }] of agrupar(lista, it => it.k)) out.push(`${k} (${n} veces; p. ej. t=${f1(ej.t)} s en (${f1(ej.x)}, ${f1(ej.z)}))`);
  }

  // ===== 5. tránsito, explorador, personas y animales =====
  {
    const seg = +(new URLSearchParams(location.search).get('verificar')) || 240;   // ?verificar=900 → 15 minutos
    const out = seccion(`Tránsito (${Math.round(seg / 60)} minutos, con el explorador haciendo el recorrido)`);
    const lista = [];
    const dt = 1 / 20;
    const cajaVeh = a => { const p = poseVehiculo(a); return [caja2(p.x, p.z, a.ancho / 2, a.largo / 2, p.giro), p]; };
    let t = millis() / 1000, paradas = 0, esperaYo = 0, quieto = 0, sPrev = -1, trabado = false;
    for (let n = 0; n < seg / dt; n++) {
      t += dt;
      moverExplorador(t, dt); moverPersonas(dt); moverTransito(dt);
      if (!yo.caminando && t - yo.llegoT > 0.5) { elegir((actual + 1) % LUGARES.length, false, true); paradas++; }
      const oYo = caja2(yo.x, yo.z, 0.5, 0.35, yo.giro);
      const cajas = VEHICULOS.map(cajaVeh);
      cajas.forEach(([o, p], i) => {
        const a = VEHICULOS[i];
        for (let j = i + 1; j < cajas.length; j++)
          if (penetra(o, cajas[j][0]) > 0.05) lista.push({ k: `${a.tipo} ${i} choca con ${VEHICULOS[j].tipo} ${j}`, t, x: p.x, z: p.z });
        if (penetra(o, oYo) > 0.05) lista.push({ k: `${a.tipo} ${i} atropella al explorador`, t, x: p.x, z: p.z,
          extra: `v=${f1(a.v)} lado=${f1(a.lado || 0)}→${f1(a.ladoMeta || 0)} vuelta=${f1(a.vuelta)} cede=${!!a.cede} retro=${!!a.retro} · explorador ${yo.caminando ? 'caminando' : 'quieto'} hacia ${LUGARES[actual].id}` });
        const g = chocaObjeto(o, p.y + 0.15, p.y + 1.5);
        if (g) lista.push({ k: `${a.tipo} ${i} atraviesa ${nombre(g)}`, t, x: p.x, z: p.z });
        for (const q of PERSONAS) { const s = posePersona(q, q.reloj); if (penetra(o, caja2(s.x, s.z, 0.35, 0.25, s.giro)) > 0.05) lista.push({ k: `${a.tipo} ${i} atropella a una persona`, t, x: s.x, z: s.z }); }
        for (const q of PINGUINOS) { const s = posePinguino(q, t); if (penetra(o, caja2(s.x, s.z, 0.4, 0.35, s.giro)) > 0.05) lista.push({ k: `${a.tipo} ${i} atropella a un pingüino`, t, x: s.x, z: s.z }); }
        for (const q of LOBOS) if (penetra(o, caja2(q.x, q.z, 0.7, 1.6, q.giro)) > 0.05) lista.push({ k: `${a.tipo} ${i} atropella a un lobo marino`, t, x: q.x, z: q.z });
      });
      if (yo.caminando) {
        for (const q of PERSONAS) { const s = posePersona(q, q.reloj); if (dist(s.x, s.z, yo.x, yo.z) < 0.6) lista.push({ k: `el explorador atraviesa a una persona`, t, x: yo.x, z: yo.z }); }
        for (const q of PINGUINOS) { const s = posePinguino(q, t); if (dist(s.x, s.z, yo.x, yo.z) < 0.75) lista.push({ k: `el explorador atraviesa un pingüino`, t, x: yo.x, z: yo.z }); }
        for (const q of LOBOS) if (penetra(oYo, caja2(q.x, q.z, 0.7, 1.6, q.giro)) > 0.05) lista.push({ k: `el explorador atraviesa un lobo marino`, t, x: yo.x, z: yo.z });
        for (let k = 0; k < 3; k++) { const s = poseCamion(k, t); if (dist(s.x, s.z, yo.x, yo.z) < 1.6) lista.push({ k: `un camión de la mina atropella al explorador`, t, x: yo.x, z: yo.z }); }
      }
      if (VEHICULOS.every(a => a.v < 0.01 && a.vuelta < 0)) esperaYo++;
      // ¿el explorador lleva mucho rato esperando (o caminando sin avanzar)?
      if (yo.caminando && Math.abs(yo.s - sPrev) < 1e-4) quieto += dt; else quieto = 0;
      sPrev = yo.s;
      if (quieto > 6 && !trabado) {
        trabado = true;
        const v = VEHICULOS.map((a, i) => [a, i, poseVehiculo(a)]).sort((p, q) => dist(p[2].x, p[2].z, yo.x, yo.z) - dist(q[2].x, q[2].z, yo.x, yo.z))[0];
        lista.push({ k: `el explorador se queda trabado más de 6 s camino a ${LUGARES[actual].nombre}`, t, x: yo.x, z: yo.z,
          extra: v ? `vehículo más cercano: ${v[0].tipo} ${v[1]} a ${f1(dist(v[2].x, v[2].z, yo.x, yo.z))} mm (v=${f1(v[0].v)}, lado=${f1(v[0].lado || 0)}→${f1(v[0].ladoMeta || 0)}, cede=${!!v[0].cede}, retro=${!!v[0].retro}, vuelta=${f1(v[0].vuelta)})` : '' });
      }
      if (!quieto) trabado = false;
    }
    for (const [k, { n, ej }] of agrupar(lista, it => it.k)) out.push(`${k} (${n} cuadros; p. ej. t=${f1(ej.t)} s en (${f1(ej.x)}, ${f1(ej.z)}))${ej.extra ? ' — ' + ej.extra : ''}`);
    if (esperaYo * dt > 20) out.push(`todos los vehículos estuvieron detenidos ${f1(esperaYo * dt)} s (¿atasco?)`);
    out.unshift(`el explorador visitó ${paradas} lugares durante la simulación`);
  }

  // ===== 6. aire y molinos =====
  {
    const out = seccion('Aves, cóndor, avioneta y molinos');
    const lista = [];
    function suelo(x, z, r) {   // lo más alto bajo un círculo: terreno u objeto
      let h = 0;
      for (const [a, b] of [[0, 0], [r, 0], [-r, 0], [0, r], [0, -r]]) h = Math.max(h, esTierra(x + a, z + b) ? alturaEn(x + a, z + b) : MAR_Y);
      for (const ob of objetosEn(caja2(x, z, r, r, 0))) if (penetra(caja2(x, z, r, r, 0), ob.o) > 0) h = Math.max(h, ob.y1);
      return h;
    }
    for (let t = 0; t < 120; t += 0.2) {
      for (let k = 0; k < 8; k++) { const p = poseAve(k, t); if (p.y - suelo(p.x, p.z, 1.3) < 1) lista.push({ k: 'un ave guanera roza el suelo o un objeto', t, x: p.x, z: p.z }); }
      for (let k = 0; k < 6; k++) { const p = poseGaviota(k, t); if (p.y - suelo(p.x, p.z, 1.3) < 1) lista.push({ k: 'una gaviota roza un cerro o un objeto', t, x: p.x, z: p.z }); }
      const c = poseCondor(t);
      if (c.y - suelo(c.x, c.z, 5.5) < 1.5) lista.push({ k: 'el cóndor roza un cerro', t, x: c.x, z: c.z });
    }
    const [f0, f1_, f2] = FASES_VUELO;
    for (let t = 0; t < VUELO.T; t += 0.05) {
      const u = t / VUELO.T, p = poseAvion(t);
      const o = caja2(p.x, p.z, 3, 2, p.rumbo);
      if (u > f1_ && u < f2) {
        const cercaPista = distSeg(p.x, p.z, [VUELO.A[0], VUELO.A[2]], [VUELO.B[0], VUELO.B[2]]) < 14;   // despegando o aterrizando
        const h = suelo(p.x, p.z, 3);
        if (p.y - h < (cercaPista ? 0 : 1.5)) lista.push({ k: 'la avioneta vuela demasiado bajo (cerro u objeto)', t, x: p.x, z: p.z, extra: `a ${f1(p.y)} mm, suelo u objeto a ${f1(h)}` });
      } else {
        const g = chocaObjeto(o, p.y + 0.1, p.y + 1.5, g => g === 'aeropuerto' ? false : false);
        if (g && g !== 'aeropuerto') lista.push({ k: `la avioneta en tierra choca con ${nombre(g)}`, t, x: p.x, z: p.z });
        const g2 = chocaObjeto(caja2(p.x, p.z, 0.5, 2, p.rumbo), p.y + 0.4, p.y + 1.5);
        if (g2 === 'aeropuerto') lista.push({ k: 'la avioneta en tierra atraviesa el hangar o la torre', t, x: p.x, z: p.z });
      }
    }
    // continuidad: la avioneta no debe saltar de un punto a otro
    let salto = 0, tSalto = 0;
    for (let t = 0; t < VUELO.T; t += 0.02) {
      const a = poseAvion(t), b = poseAvion(t + 0.02), d = Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z);
      if (d > salto) { salto = d; tSalto = t; }
    }
    if (salto > 0.6) lista.push({ k: `la avioneta salta ${f1(salto)} mm de golpe`, t: tSalto, x: 0, z: 0 });
    // molinos: aspas que se cruzan entre sí o tocan el suelo
    TURBINAS.forEach(([x, z], i) => {
      const y = alturaEn(x, z) + 19.2;
      for (let xs = -8.8; xs <= 8.8; xs += 1.1) if (y - Math.sqrt(8.8 * 8.8 - xs * xs) < alturaEn(x + xs, z + 1.8) + 0.5) { lista.push({ k: `las aspas del molino ${i} tocan el suelo`, t: 0, x, z }); break; }
      TURBINAS.forEach(([x2, z2], j) => {
        if (j <= i) return;
        const y2 = alturaEn(x2, z2) + 19.2;
        if (Math.abs(z2 - z) < 1 && Math.hypot(x2 - x, y2 - y) < 17.8) lista.push({ k: `las aspas de los molinos ${i} y ${j} se cruzan`, t: 0, x, z });
      });
      if (tocaVia(x, z, 0.8)) lista.push({ k: `el molino ${i} está sobre una vía`, t: 0, x, z });
    });
    for (const [k, { n, ej }] of agrupar(lista, it => it.k)) out.push(`${k}${n > 1 ? ` (${n} veces)` : ''}; p. ej. ${ej.t ? `t=${f1(ej.t)} s ` : ''}en (${f1(ej.x)}, ${f1(ej.z)})${ej.extra ? ' — ' + ej.extra : ''}`);
  }

  // ===== informe =====
  const ms = performance.now() - t0;
  let problemas = 0, txt = `VERIFICACIÓN DEL MAPA DE MARCONA (${(ms / 1000).toFixed(1)} s)\n`;
  txt += `Animales: ${PINGUINOS.length} pingüinos, ${LOBOS.length} lobos marinos · Personas: ${PERSONAS.length} (${PERSONAS.filter(p => !p.amp).length} quietas) · Vehículos: ${VEHICULOS.length} · Barcos: ${NAVES.length}\n`;
  for (const s of secciones) {
    const reales = s.items.filter(x => !/^\d+ de \d+ rutas|^el explorador visitó/.test(x));
    problemas += reales.length;
    txt += `\n■ ${s.titulo}: ${reales.length ? reales.length + ' problema(s)' : 'OK'}\n`;
    for (const it of s.items) txt += '   · ' + it + '\n';
  }
  txt += `\nTOTAL: ${problemas ? problemas + ' problema(s)' : 'sin problemas'}\n`;
  console.log(txt);
  const pre = document.createElement('pre');
  pre.id = 'verificacion';
  pre.textContent = txt;
  pre.style.cssText = 'position:fixed;inset:12px;z-index:99;overflow:auto;margin:0;padding:16px;background:rgba(255,251,244,.97);color:#2a211a;font:12px/1.5 ui-monospace,Consolas,monospace;border-radius:12px;box-shadow:0 10px 30px #0004;white-space:pre-wrap;user-select:text;-webkit-user-select:text';
  pre.addEventListener('click', () => pre.remove());
  document.body.appendChild(pre);
  return problemas;
}
