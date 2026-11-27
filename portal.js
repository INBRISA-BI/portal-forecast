/* Portal Forecast KAM: inicio de sesión de Microsoft, lectura de datos.json y guardado de captura_<ciclo>.json en OneDrive.
   La página no trae datos: los lee de la carpeta que BI le compartió a cada KAM.
   La lógica del portal (app.js) es la misma del portal de revisión; aquí solo se le da de dónde leer y dónde guardar. */
(function () {
  'use strict';
  const C = window.PORTAL_CONFIG || {};
  const G = 'https://graph.microsoft.com/v1.0';
  const SCOPES = ['User.Read', 'Files.ReadWrite.All'];
  const LOCAL = ['localhost', '127.0.0.1'].includes(location.hostname);
  const PARAMS = new URLSearchParams(location.search);
  const DEMO = LOCAL && PARAMS.has('demo');            // solo en la PC de BI: datos locales, sin Microsoft, no guarda
  const $ = s => document.querySelector(s);
  const titulo = s => String(s || '').toLowerCase().replace(/(^|\s)\S/g, c => c.toUpperCase());

  /* ---------- pantalla de acceso ---------- */
  function acceso(msg, boton, alHacerClic, detalle) {
    $('#acceso').hidden = false;
    $('#acceso-msg').textContent = msg;
    $('#acceso-det').textContent = detalle || '';
    const b = $('#acceso-btn');
    b.hidden = !boton;
    if (boton) { b.textContent = boton; b.disabled = false; b.onclick = () => { b.disabled = true; alHacerClic(); }; }
  }
  function informar(obj) {            // deja constancia en la PC de BI cuando se prueba en localhost
    if (!LOCAL) return;
    try { fetch('/resultado', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj) }); } catch (e) { }
  }

  /* ---------- Microsoft ---------- */
  let pca = null, cuenta = null;
  async function token() {
    try { return (await pca.acquireTokenSilent({ scopes: SCOPES, account: cuenta })).accessToken; }
    catch (e) { await pca.acquireTokenRedirect({ scopes: SCOPES, account: cuenta }); throw e; }
  }
  async function graph(metodo, url, cuerpo, extra) {
    const h = Object.assign({ Authorization: 'Bearer ' + await token() }, cuerpo != null ? { 'Content-Type': 'application/json' } : {}, extra || {});
    const r = await fetch(url.startsWith('http') ? url : G + url, { method: metodo, headers: h, body: cuerpo });
    if (!r.ok) {
      let txt = await r.text(); try { const j = JSON.parse(txt); txt = (j.error && (j.error.code + ': ' + j.error.message)) || txt; } catch (e) { }
      const err = new Error(`HTTP ${r.status} · ${txt}`); err.status = r.status;
      if (r.status === 403 || r.status === 401) err.code = 'permission_denied';
      throw err;
    }
    return r;
  }
  const gj = async url => (await graph('GET', url)).json();
  /* Ruta dentro de la carpeta del KAM: cada tramo va codificado (detalle/DIFARR/x.json) y no se permite salir de la carpeta. */
  const ruta = nombre => {
    const t = String(nombre).split('/');
    if (t.some(x => !x || x === '.' || x === '..')) throw new Error('Ruta no permitida: ' + nombre);
    return t.map(encodeURIComponent).join('/');
  };
  const item = (c, nombre) => `/drives/${c.driveId}/items/${c.itemId}:/${ruta(nombre)}`;

  /* Texto de una respuesta. Un archivo .gz (detalle del rastreo comprimido, 0.3.1) llega como bytes: OneDrive y Graph entregan
     el archivo tal cual, sin Content-Encoding, así que se descomprime aquí con DecompressionStream('gzip'). Si un servidor ya lo
     entregó descomprimido (no empieza con 1F 8B) se usa tal cual. En un navegador sin DecompressionStream se lanza un error con
     code = 'sin_gzip' y la página pide el .json sin comprimir, que BI publica junto al .gz. */
  const PUEDE_GZ = typeof DecompressionStream === 'function' && typeof Blob !== 'undefined' && typeof Blob.prototype.stream === 'function';
  async function textoDe(r, nombre) {
    if (!/\.gz$/i.test(String(nombre))) return r.text();
    const bytes = new Uint8Array(await r.arrayBuffer());
    if (!(bytes.length > 2 && bytes[0] === 0x1f && bytes[1] === 0x8b)) return new TextDecoder().decode(bytes);
    if (!PUEDE_GZ) { const e = new Error('Este navegador no puede abrir archivos comprimidos (.gz)'); e.code = 'sin_gzip'; throw e; }
    return new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).text();
  }

  /* Lee un archivo JSON (o .json.gz). Devuelve {datos, etag, modificado}; null si no existe.
     094: modificado = lastModifiedDateTime de OneDrive (cuándo llegó el archivo a la nube); la página lo muestra a BI junto a datos.json › generado. */
  async function leerJson(c, nombre) {
    let meta;
    try { meta = await gj(item(c, nombre) + '?$select=id,eTag,size,lastModifiedDateTime,@microsoft.graph.downloadUrl'); }
    catch (e) { if (e.status === 404) return null; throw e; }
    const url = meta['@microsoft.graph.downloadUrl'];
    let r = null;
    if (url) { try { r = await fetch(url); if (!r.ok) r = null; } catch (e) { r = null; } }
    if (!r) r = await graph('GET', item(c, nombre) + ':/content');
    return { datos: JSON.parse(await textoDe(r, nombre)), etag: meta.eTag, modificado: meta.lastModifiedDateTime || null };
  }

  /* Carpetas de KAM que esta cuenta puede abrir. */
  async function carpetas() {
    // La configuración solo trae identificadores; el nombre de cada carpeta (el KAM) se lee de OneDrive con la sesión iniciada.
    const conf = Array.isArray(C.carpetas) ? C.carpetas : [];
    const res = await Promise.all(conf.map(async (c, i) => {
      try { const j = await gj(`/drives/${c.driveId}/items/${c.itemId}?$select=id,name`); return { kam: String(j.name).toUpperCase(), driveId: c.driveId, itemId: c.itemId, orden: i }; }
      catch (e) { return null; }
    }));
    const out = res.filter(Boolean);
    if (C.rutaPropietario) {      // la cuenta dueña de la carpeta (BI) la encuentra por su ruta; 25-nov: también las que aún no están en config.js (EXPORTACION)
      try {
        const j = await gj(`/me/drive/root:/${encodeURI(C.rutaPropietario)}:/children?$select=id,name,folder,parentReference`);
        j.value.filter(x => x.folder && !out.some(o => o.itemId === x.id)).forEach((x, i) => out.push({ kam: String(x.name).toUpperCase(), driveId: x.parentReference.driveId, itemId: x.id, orden: conf.length + i, propietario: true }));
      } catch (e) { }
    }
    return out.sort((a, b) => a.orden - b.orden);
  }

  /* ---------- 25-nov · órdenes de exportación: carpeta EXPORTACION (rol EXPORTACION: Melissa, Mónica y BI) ----------
     La carpeta 13 PORTAL WEB DATOS/EXPORTACION se reconoce por su nombre; quién la ve lo decide OneDrive (con quién la compartió BI).
     datos_exportacion.json = maestros (solo lectura) · ordenes.json = única fuente de verdad de las órdenes (contrato ordenes-v1).
     Se escribe siempre con If-Match (eTag leído); si no existe, con conflictBehavior=fail. 412/409 = otra persona guardó: la página
     recarga y avisa, nunca pisa. En demostración (?demo) lee y escribe en el servidor local (14 EXPORTACION/_pruebas). */
  const EXPO = 'EXPORTACION';
  function almacenExpo(c) {
    const local = nombre => fetch('/_local/' + EXPO + '/' + ruta(nombre)).then(async r => r.status === 404 ? null : r.ok ? { datos: JSON.parse(await r.text()), etag: r.headers.get('ETag') } : Promise.reject(Object.assign(new Error('HTTP ' + r.status), { status: r.status })));
    const leer = nombre => DEMO ? local(nombre) : leerJson(c, nombre);
    return {
      leerDatos: () => leer('datos_exportacion.json'),
      leerOrdenes: () => leer('ordenes.json'),
      async escribirOrdenes(doc, etag) {
        const cuerpo = JSON.stringify(doc, null, 1);
        if (DEMO) {
          const r = await fetch('/_local/' + EXPO + '/ordenes.json', { method: 'PUT', headers: Object.assign({ 'Content-Type': 'application/json' }, etag ? { 'If-Match': etag } : { 'If-None-Match': '*' }), body: cuerpo });
          if (!r.ok) throw Object.assign(new Error('HTTP ' + r.status), { status: r.status });
          return (await r.json()).eTag;
        }
        const r = await graph('PUT', item(c, 'ordenes.json') + ':/content' + (etag ? '' : '?@microsoft.graph.conflictBehavior=fail'), cuerpo, etag ? { 'If-Match': etag } : null);
        return (await r.json()).eTag;
      },
    };
  }
  /* Pantalla de órdenes de exportación (app.js › window.Ordenes, módulo app_4_ordenes.js). */
  function abrirOrdenes(expo, persona, kams) {
    if (!window.Ordenes) { acceso('Esta versión de la página no trae el módulo de órdenes.', 'Intentar de nuevo', () => location.reload()); return; }
    $('#acceso').hidden = true; $('#inicio').hidden = true;
    window.Ordenes.iniciar({
      almacen: almacenExpo(expo), persona,
      volver: kams.length ? () => { PARAMS.delete('ordenes'); location.search = PARAMS.toString(); } : null,
      salir: pca ? salir : null,
    });
  }
  /* Para el portal del KAM (Mónica, BI): las órdenes en vivo, ya convertidas en líneas de tránsito y programadas (Ordenes.indicadores).
     null si no se puede leer: la página usa lo que trae datos.json del generador. */
  function lectorOrdenes(expo) {
    let pr = null;
    return () => pr || (pr = (async () => {
      if (!window.Ordenes) return null;
      const A = almacenExpo(expo);
      const [dx, od] = await Promise.all([A.leerDatos(), A.leerOrdenes()]);
      if (!dx || !od) return null;
      const M = window.Ordenes.modelo(dx.datos);
      return { lineas: window.Ordenes.indicadores(M, od.datos), actualizado: od.datos.actualizado || null, actualizadoPor: od.datos.actualizadoPor || null, ordenes: (od.datos.ordenes || []).length };
    })().catch(() => null));
  }

  /* ---------- guardado: un archivo por KAM y por ciclo (captura_2026-11.json); los ciclos anteriores quedan como historia ---------- */
  const archCaptura = D => 'captura_' + (/^\d{4}-\d{2}$/.test(D.ciclo) ? D.ciclo : 'ciclo') + '.json';
  function almacen(c, D, previo, quien, lectura) {
    const ARCH = archCaptura(D);
    const st = Object.assign({ kam: D.kam, ciclo: D.ciclo, estado: 'borrador', en: '', por: '', lineas: {} }, previo ? previo.datos : {});
    let etag = previo ? previo.etag : null;
    const tocadas = new Set(), colL = [], docL = [];
    let enCurso = null, sucio = false;
    const emitCol = () => { const docs = Object.entries(st.lineas).map(([id, d]) => ({ id, data: () => d })); colL.forEach(cb => cb({ docs, size: docs.length, metadata: { fromCache: false } })); };
    const emitDoc = () => docL.forEach(cb => cb(st.estado === 'listo' ? { exists: true, data: () => ({ estado: 'listo', por: st.listoPor, en: st.listoEn, valorLista: st.valorLista }) } : { exists: false }));
    async function escribir() {
      for (let intento = 0; ; intento++) {
        try {
          const r = await graph('PUT', item(c, ARCH) + ':/content', JSON.stringify(st, null, 1), etag && intento < 3 ? { 'If-Match': etag } : null);
          etag = (await r.json()).eTag; return;
        } catch (e) {
          if (e.status !== 412 || intento >= 3) throw e;
          const rem = await leerJson(c, ARCH);           // otra pestaña guardó antes: se conserva lo suyo y gana lo editado aquí
          if (rem) {
            etag = rem.etag;
            Object.entries(rem.datos.lineas || {}).forEach(([id, d]) => { if (!tocadas.has(id)) st.lineas[id] = d; });
            if (rem.datos.estado === 'listo' && st.estado !== 'listo') Object.assign(st, { estado: 'listo', listoPor: rem.datos.listoPor, listoEn: rem.datos.listoEn, valorLista: rem.datos.valorLista });
          } else etag = null;
        }
      }
    }
    function guardar() {
      sucio = true;
      if (!enCurso) enCurso = (async () => { try { while (sucio) { sucio = false; await escribir(); } } catch (e) { sucio = true; throw e; } finally { enCurso = null; } })();
      return enCurso;
    }
    const db = {
      collection: () => ({ onSnapshot(cb) { colL.push(cb); emitCol(); return () => { }; } }),
      doc(ruta) {
        const i = ruta.indexOf('/lineas/');
        if (i >= 0) {
          const id = ruta.slice(i + 8);
          return { set(body) { st.lineas[id] = body; tocadas.add(id); st.en = body.en; st.por = quien; emitCol(); return guardar(); } };
        }
        return {
          set(body) { Object.assign(st, { estado: body.estado, listoPor: quien, listoEn: body.en, valorLista: body.valorLista }); emitDoc(); return guardar(); },
          onSnapshot(cb) { docL.push(cb); emitDoc(); return () => { }; },
        };
      },
    };
    if (DEMO || lectura) {      // en solo lectura (BI mirando) y en demostración no se escribe nada
      const real = db.doc;
      /* 082-MESES: en demostración la llamada a set() queda registrada en window.portalDemoGuardados (para las pruebas), sin escribir nada */
      db.doc = ruta => { const d = real(ruta); return { set: body => { (window.portalDemoGuardados = window.portalDemoGuardados || []).push({ ruta, body }); demoRecordar(ruta, body); return Promise.resolve(); }, onSnapshot: d.onSnapshot || (cb => cb({ exists: false })) }; };
      /* 090-UNIDADES (pruebas): en demostración las líneas guardadas quedan en sessionStorage de esta pestaña, para probar "Guardar y recargar".
         Nunca en OneDrive; se borra al cerrar la pestaña. En solo lectura real (BI mirando) no se recuerda nada. */
      const demoRecordar = (ruta, body) => { const i = ruta.indexOf('/lineas/'); if (!DEMO || i < 0) return; st.lineas[ruta.slice(i + 8)] = body; try { sessionStorage.setItem(demoClave(D), JSON.stringify({ lineas: st.lineas })); } catch (e) { } };
    }
    return db;
  }

  const demoClave = D => 'portal-demo-captura-' + D.kam + '-' + D.ciclo;      // 090-UNIDADES: captura de la demostración (sessionStorage)
  const demoPrevio = D => { try { const x = JSON.parse(sessionStorage.getItem(demoClave(D)) || 'null'); return x && x.lineas ? { datos: { lineas: x.lineas }, etag: null } : null; } catch (e) { return null; } };

  /* ---------- arranque del portal con los datos de un KAM ---------- */
  function iniciar(D, db, persona, lista, actual, lectura, c, expo) {
    window.portalOrdenes = expo ? lectorOrdenes(expo) : null;      // 25-nov: lo usa app_3_detalle.js › órdenes en vivo
    /* Lectura a demanda de otros archivos de la carpeta del KAM (detalle/ del rastreo, linaje.json…), con el mismo leerJson.
       Una vez por archivo y por sesión; null = el archivo no existe (404). En demostración se lee del servidor local.
       Los nombres que terminan en .gz se descomprimen (textoDe); window.portalGzip dice si este navegador puede hacerlo. */
    const cache = new Map();
    window.portalLeer = nombre => {
      const n = String(nombre);
      if (!cache.has(n)) {
        let pr;
        try {
          pr = DEMO ? fetch(`/_local/${encodeURIComponent(actual)}/${ruta(n)}`).then(r => r.ok ? textoDe(r, n).then(JSON.parse) : (r.status === 404 ? null : Promise.reject(new Error('HTTP ' + r.status))))
            : c ? leerJson(c, n).then(x => x ? x.datos : null) : Promise.resolve(null);
        } catch (e) { pr = Promise.reject(e); }
        cache.set(n, pr.catch(e => { cache.delete(n); throw e; }));
      }
      return cache.get(n);
    };
    window.portalGzip = PUEDE_GZ;
    window.leerDetalle = nombre => window.portalLeer('detalle/' + nombre);
    const ini = (persona.nombre || '?').split(/\s+/).map(p => p[0]).slice(0, 2).join('').toUpperCase();
    const avatar = 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><circle cx="24" cy="24" r="24" fill="#5F6B76"/><text x="24" y="30" font-family="Segoe UI,Arial" font-size="18" fill="#fff" text-anchor="middle">${ini}</text></svg>`);
    const user = {
      me: async () => ({ id: persona.correo, name: persona.nombre, avatarUrl: avatar }),
      profiles: async ids => Object.fromEntries(ids.map(id => [id, { name: id === persona.correo ? persona.nombre : id }])),
    };
    window.claude = { use: async n => n === 'db' ? db : n === 'user' ? user : null };
    document.title = 'Forecast ' + titulo(D.kam);
    $('#t-kam').textContent = titulo(D.kam);
    $('#acceso').hidden = true;
    document.body.classList.remove('cargando');
    window.iniciarPortal(D);
    // Quien tiene acceso a varias carpetas (BI) ve además: volver a la lista, cambiar de KAM y el modo (solo lectura o edición)
    const pe = $('#persona');
    const boton = (id, texto, fn) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn'; b.id = id; b.textContent = texto; b.onclick = fn; return b; };
    /* 082-MESES: guardado explícito. Antes de salir de la página con cambios sin guardar se pide confirmación (el beforeunload de la página no se repite) */
    const salirOk = () => {
      const n = typeof window.portalSinGuardar === 'function' ? window.portalSinGuardar() : 0;
      if (n && !confirm(`Tienes ${n === 1 ? '1 cambio' : n + ' cambios'} sin guardar. Si sales ahora se pierden. ¿Salir sin guardar?`)) return false;
      window.portalSalidaConfirmada = true; return true;
    };
    if (lista.length > 1) {
      document.body.classList.add('admin');
      const sel = document.createElement('select'); sel.id = 'sel-kam'; sel.setAttribute('aria-label', 'KAM');
      lista.forEach(x => { const o = document.createElement('option'); o.value = x.kam; o.textContent = titulo(x.kam); o.selected = x.kam === actual; sel.appendChild(o); });
      sel.onchange = () => { if (!salirOk()) { sel.value = actual; return; } PARAMS.set('kam', sel.value); PARAMS.delete('editar'); location.search = PARAMS.toString(); };
      pe.parentNode.insertBefore(boton('b-todos', 'Todos los KAM', () => { if (!salirOk()) return; PARAMS.delete('kam'); PARAMS.delete('editar'); location.search = PARAMS.toString(); }), pe);
      pe.parentNode.insertBefore(sel, pe);
      pe.parentNode.insertBefore(boton('b-modo', lectura ? 'Editar' : 'Dejar de editar', () => {
        if (lectura && !confirm(`Vas a editar el forecast de ${titulo(D.kam)}. Lo que cambies queda guardado en su captura, a tu nombre.`)) return;
        if (!lectura && !salirOk()) return;      // "Dejar de editar" con cambios sin guardar
        if (lectura) PARAMS.set('editar', '1'); else PARAMS.delete('editar');
        location.search = PARAMS.toString();
      }), pe);
    }
    if (expo) pe.parentNode.insertBefore(boton('b-ordenes', 'Órdenes de exportación', () => { if (!salirOk()) return; PARAMS.set('ordenes', '1'); location.search = PARAMS.toString(); }), pe);
    if (pca) pe.parentNode.appendChild(boton('b-salir', 'Salir', () => { if (salirOk()) salir(); }));
    if (lectura) soloLectura();
  }
  const salir = () => pca.logoutRedirect({ account: cuenta, postLogoutRedirectUri: location.origin + location.pathname });

  /* BI entra a ver, no a capturar: las casillas no se pueden cambiar hasta que elige "Editar". */
  function soloLectura() {
    document.body.classList.add('solo-lectura');
    const campo = t => t && t.matches && t.matches('.inp,textarea');
    document.addEventListener('focusin', ev => { if (campo(ev.target)) ev.target.readOnly = true; }, true);
    document.addEventListener('beforeinput', ev => { if (campo(ev.target)) ev.preventDefault(); }, true);
    document.addEventListener('click', ev => {
      const b = ev.target.closest && ev.target.closest('#b-listo,[data-usar-alg],[data-volver]');
      if (b) { ev.stopPropagation(); ev.preventDefault(); }
    }, true);
    const pon = () => { $('#estado').innerHTML = '<span class="dot"></span><span>Solo lectura · vista de BI</span>'; };
    [0, 300, 1500].forEach(ms => setTimeout(pon, ms));
  }

  /* ---------- inicio para BI: los KAM y el estado de su captura ---------- */
  async function resumen(c) {
    const out = { kam: c.kam, estado: 'sin' };
    if (DEMO) return out;
    try {
      const j = await gj(`/drives/${c.driveId}/items/${c.itemId}/children?$select=name,lastModifiedDateTime`);
      const d = j.value.find(x => x.name === 'datos.json'); out.datosEn = d && d.lastModifiedDateTime;
      const caps = j.value.map(x => x.name).filter(n => /^captura_\d{4}-\d{2}\.json$/.test(n)).sort();
      if (caps.length) {
        const cap = await leerJson(c, caps[caps.length - 1]);
        if (cap) {
          const x = cap.datos, listo = x.estado === 'listo';
          Object.assign(out, { estado: listo ? 'listo' : 'borrador', ciclo: x.ciclo, en: listo ? (x.listoEn || x.en) : x.en, por: listo ? (x.listoPor || x.por) : x.por, lineas: Object.keys(x.lineas || {}).length, valor: x.valorLista });
        }
      }
    } catch (e) { out.error = String(e.message || e); }
    return out;
  }
  function inicioBI(filas, persona, expo) {
    const fecha = iso => { const f = new Date(iso); return isNaN(f) ? '' : f.toLocaleDateString('es-CR', { day: 'numeric', month: 'short' }) + ' ' + f.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' }); };
    const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
    const caja = $('#inicio-lista'); caja.textContent = '';
    filas.forEach(f => {
      const a = el('a', 'fila-kam'); const q = new URLSearchParams(PARAMS); q.set('kam', f.kam); a.href = '?' + q.toString();
      a.appendChild(el('span', 'nombre', titulo(f.kam)));
      const est = f.estado === 'listo' ? ['pill good', 'Listo'] : f.estado === 'borrador' ? ['pill warn', 'En borrador'] : ['pill', 'Sin capturar'];
      a.appendChild(el('span', est[0], est[1]));
      let det = f.error ? 'No se pudo leer su carpeta' : f.estado === 'sin' ? 'Todavía no ha cambiado nada en el portal' :
        `Ciclo ${f.ciclo} · ${f.lineas} ${f.lineas === 1 ? 'línea cambiada' : 'líneas cambiadas'} · ${fecha(f.en)}${f.por ? ' · ' + f.por : ''}`;
      if (f.datosEn) det += ` · datos del ${fecha(f.datosEn)}`;
      a.appendChild(el('span', 'detalle', det));
      a.appendChild(el('span', 'abrir', 'Abrir'));
      caja.appendChild(a);
    });
    if (expo) {      // 25-nov: órdenes de exportación (Melissa, Mónica y BI)
      const a = el('a', 'fila-kam'); const q = new URLSearchParams(PARAMS); q.delete('kam'); q.set('ordenes', '1'); a.href = '?' + q.toString();
      a.appendChild(el('span', 'nombre', 'Exportación')); a.appendChild(el('span', 'pill acc', 'Órdenes'));
      a.appendChild(el('span', 'detalle', 'Órdenes de exportación, resumen por cliente y categoría, y contenedor 3D'));
      a.appendChild(el('span', 'abrir', 'Abrir')); caja.appendChild(a);
    }
    $('#inicio-quien').textContent = `Entraste como ${persona.nombre}. Esta cuenta ve a todos los KAM; cada KAM solo ve el suyo.`;
    const s = $('#inicio-salir'); s.hidden = !pca; s.onclick = salir;
    $('#acceso').hidden = true; $('#inicio').hidden = false;
    document.title = 'Forecast · Vista de BI';
  }

  async function demo() {
    const kams = await (await fetch('/_local/')).json(), lista = kams.map(k => ({ kam: k })), persona = { correo: 'demo', nombre: PARAMS.get('nombre') || 'Demostración' };
    const expo = { kam: EXPO, demo: true };      // el servidor de pruebas sirve EXPORTACION desde 14 EXPORTACION/_pruebas
    if (PARAMS.has('ordenes')) return abrirOrdenes(expo, persona, lista);
    const kam = (PARAMS.get('kam') || '').toUpperCase();
    if (!kam) return inicioBI(await Promise.all(lista.map(resumen)), persona, expo);
    const rD = await fetch(`/_local/${kam}/datos.json`), D = await rD.json();
    window.portalDatosEn = rD.headers.get('Last-Modified') || null;      // 094: en la demostración, la fecha del archivo local
    iniciar(D, almacen(null, D, demoPrevio(D), 'demo'), persona, lista, kam, !PARAMS.has('editar'), null, PARAMS.has('sinOrdenes') ? null : expo);      // 090-UNIDADES: con lo guardado en esta pestaña
  }

  async function principal() {
    if (DEMO) return demo();
    if (!C.clientId || !C.tenantId || !window.msal) { acceso('La página no está configurada todavía.', null); return; }
    const redirectUri = location.origin + location.pathname.replace(/[^/]*$/, '');
    pca = new msal.PublicClientApplication({
      auth: { clientId: C.clientId, authority: 'https://login.microsoftonline.com/' + C.tenantId, redirectUri },
      cache: { cacheLocation: 'localStorage' },
    });
    await pca.initialize();
    let r = null;
    try { r = await pca.handleRedirectPromise(); }
    catch (e) { informar({ paso: 'login', error: String(e && e.message || e) }); acceso('No se pudo iniciar sesión.', 'Intentar de nuevo', () => pca.loginRedirect({ scopes: SCOPES, prompt: 'select_account' }), String(e && e.message || e)); return; }
    cuenta = (r && r.account) || pca.getAllAccounts()[0] || null;
    if (!cuenta) { acceso('Entra con tu cuenta de Brinova para ver y llenar tu forecast.', 'Entrar con Microsoft', () => pca.loginRedirect({ scopes: SCOPES, prompt: 'select_account' })); return; }
    pca.setActiveAccount(cuenta);
    acceso('Buscando tu forecast…', null);
    const persona = { correo: cuenta.username, nombre: cuenta.name || cuenta.username };
    let lista;
    try { lista = await carpetas(); }
    catch (e) { informar({ paso: 'carpetas', cuenta: persona.correo, error: String(e.message || e) }); acceso('No se pudo consultar OneDrive.', 'Intentar de nuevo', () => location.reload(), String(e.message || e)); return; }
    const prueba = { en: new Date().toISOString(), origen: location.origin, cuenta: persona.correo, carpetas: lista };
    const expo = lista.find(x => x.kam === EXPO) || null, kams = lista.filter(x => x.kam !== EXPO);      // 25-nov: rol EXPORTACION
    if (expo && (PARAMS.has('ordenes') || !kams.length)) { informar(prueba); abrirOrdenes(expo, persona, kams); return; }
    lista = kams;
    if (!lista.length) {
      informar(prueba);
      acceso(`La cuenta ${persona.correo} todavía no tiene un forecast compartido. Avisa a BI.`, 'Entrar con otra cuenta', () => pca.loginRedirect({ scopes: SCOPES, prompt: 'select_account' }));
      return;
    }
    const pedido = (PARAMS.get('kam') || '').toUpperCase();
    const admin = lista.length > 1;                         // BI: acceso a varias carpetas
    if (admin && !lista.some(x => x.kam === pedido)) {
      informar(prueba);
      acceso('Revisando el estado de cada KAM…', null);
      inicioBI(await Promise.all(lista.map(resumen)), persona, expo);
      return;
    }
    const c = lista.find(x => x.kam === pedido) || lista[0];
    const lectura = admin && !PARAMS.has('editar');
    try {
      acceso(`Cargando el forecast de ${titulo(c.kam)}…`, null);
      const t0 = performance.now();
      const datos = await leerJson(c, 'datos.json');
      if (!datos) throw new Error('No se encontró datos.json en la carpeta de ' + c.kam);
      const captura = await leerJson(c, archCaptura(datos.datos));
      prueba.lectura = { kam: datos.datos.kam, ciclo: datos.datos.ciclo, productos: datos.datos.productos.length, ms: Math.round(performance.now() - t0), capturaPrevia: !!captura };
      if (LOCAL && PARAMS.has('prueba')) {      // prueba de escritura, solo desde la PC de BI y a pedido: http://localhost:5500/?kam=JULIO&prueba
        try {
          await graph('PUT', item(c, 'prueba_escritura.json') + ':/content', JSON.stringify({ prueba: true, en: prueba.en }));
          const v = await leerJson(c, 'prueba_escritura.json');
          await graph('DELETE', item(c, 'prueba_escritura.json'));
          prueba.escritura = v && v.datos.prueba ? 'OK: escribió, releyó y borró' : 'FALLA: el contenido no coincide';
        } catch (e) { prueba.escritura = 'FALLA: ' + String(e.message || e); }
      }
      informar(prueba);
      window.portalDatosEn = datos.modificado || null;      // 094: cuándo llegó datos.json a OneDrive (la línea de BI lo muestra)
      iniciar(datos.datos, almacen(c, datos.datos, captura, persona.correo, lectura), persona, lista, c.kam, lectura, c, expo);
    } catch (e) {
      prueba.error = String(e.message || e); informar(prueba);
      acceso('No se pudo cargar el forecast.', 'Intentar de nuevo', () => location.reload(), String(e.message || e));
    }
  }
  principal().catch(e => acceso('Algo falló al abrir la página.', 'Intentar de nuevo', () => location.reload(), String(e && e.message || e)));
})();
