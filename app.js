/* Generado por herramientas/construir_web.py desde 07 MOTOR FCST/portal. No editar aquí. */
window.iniciarPortal = function (DATOS) {
'use strict';
/* Portal de forecast KAM · v0.31 (23/11/2026; 0.3.0 publicada el mismo día).
   Funciona con datos.json actual (v1) y con el v2 de REV\10_CONTRATO_DATOS_v2.md: todo campo nuevo es opcional y tiene respaldo.
   Regla del horizonte (informe 01): mes en curso = solo lectura con el valor oficial; se capturan los 5 meses siguientes. */
/* ---------- datos y formatos ---------- */
const D = DATOS;
const P = D.productos;
const MH = D.mesesHist, MF = D.mesesFc;
const MES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'];
const MESL = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const ml = m => m ? MES[+m.slice(5, 7) - 1] + ' ' + m.slice(2, 4) : '—';
const mll = m => m ? MESL[+m.slice(5, 7) - 1] + ' ' + m.slice(0, 4) : '—';
const addM = (m, k) => { const t = +m.slice(0, 4) * 12 + (+m.slice(5, 7) - 1) + k; return Math.floor(t / 12) + '-' + String(t % 12 + 1).padStart(2, '0'); };
const finMes = m => m + '-' + String(new Date(+m.slice(0, 4), +m.slice(5, 7), 0).getDate()).padStart(2, '0');
const nf = new Intl.NumberFormat('es-CR', { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat('es-CR', { maximumFractionDigits: 1 });
const nf2 = new Intl.NumberFormat('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const ok = v => v != null && isFinite(v);
const fN = v => ok(v) ? nf.format(Math.round(v)) : '—';
const fN1 = v => ok(v) ? (Math.abs(v) < 20 && Math.round(v) !== v ? nf1.format(v) : nf.format(Math.round(v))) : '—';
const fC = v => { if (!ok(v)) return '—'; const a = Math.abs(v); if (a >= 1e6) return '₡' + nf1.format(v / 1e6) + ' M'; if (a >= 1e4) return '₡' + nf.format(v / 1e3) + ' mil'; return '₡' + nf.format(v); };
const fC2 = v => ok(v) ? '₡' + nf2.format(v) : '—';
const fCx = v => { const a = Math.abs(v); if (a >= 1e6) return nf1.format(v / 1e6) + ' M'; if (a >= 1e3) return nf.format(v / 1e3) + ' mil'; return nf.format(v); };
const fP = v => { if (!ok(v)) return '—'; const r = Math.round(v * 100); return (r > 0 ? '+' : r < 0 ? '−' : '') + nf.format(Math.abs(r)) + ' %'; };
const flecha = v => { if (!ok(v)) return ''; const r = Math.round(v * 100); return r > 0 ? '▲ ' : r < 0 ? '▼ ' : ''; };
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const sum = (o, ms) => ms.reduce((a, m) => a + ((o && o[m]) || 0), 0);
const hora = () => new Date().toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' });
const fechaCorta = f => f ? String(f).slice(8, 10) + '/' + String(f).slice(5, 7) + '/' + String(f).slice(0, 4) : '—';
const rango = ms => ms.length ? (ms.length === 1 ? ml(ms[0]) : ml(ms[0]) + ' – ' + ml(ms[ms.length - 1])) : '—';
const sid = s => String(s).replace(/[^A-Za-z0-9_-]/g, '_');                       // id seguro para atributos (las clases tienen espacios y puntos)
const sinTilde = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '');
const KAMN = sinTilde(D.kam).toUpperCase();
const CID = (D.kam || 'kam').toLowerCase().normalize('NFD').replace(/[^a-z0-9]/g, '') + '-' + D.ciclo;
const ICO = { lock: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>' };

/* ---------- calendario del ciclo (D.calendario del generador; si no viene, la misma regla: mes del ciclo en curso + 5 meses de captura) ---------- */
const CAL = D.calendario || null;
const hoyMes = () => { const h = new Date(); return h.getFullYear() + '-' + String(h.getMonth() + 1).padStart(2, '0'); };
const MC = (CAL && CAL.mesEnCurso) || D.mesEnCurso || D.ciclo || hoyMes();          // mes en curso: se ve con su valor oficial, no se edita
const NCAP = (CAL && (CAL.horizonte || (CAL.captura || []).length)) || 5;
const MK = (CAL && Array.isArray(CAL.captura) && CAL.captura.length) ? CAL.captura.slice() : Array.from({ length: NCAP }, (_, i) => addM(MC, i + 1));   // meses que se capturan
const MV = [MC].concat(MK);
const CAP_HASTA = (CAL && CAL.capturaHasta) || null;                                 // fecha límite (solo si la manda BI)
const VENCIDO = !!CAP_HASTA && new Date() > new Date(CAP_HASTA + 'T23:59:59-06:00');
const editable = m => !VENCIDO && MK.includes(m);
const OFICIAL_CURSO = !!(CAL || D.mesEnCurso);                                         // v2: el valor del mes en curso es el oficial (BHIST)
function estadoMes(m) { if (m <= D.corte) return 'real'; if (m < MC) return 'pend'; if (m === MC) return 'curso'; return MK.includes(m) ? 'abierto' : 'ref'; }
const EST = { real: 'Cerrado · venta real', pend: 'Cerrado · real pendiente', curso: 'En curso · no se captura', abierto: 'Abierto para captura', ref: 'Referencia · fuera de la captura (algoritmo)' };
const EST_C = { real: 'real', pend: 'pendiente', curso: 'en curso', abierto: 'captura', ref: 'referencia' };
const ULT_MF = MF[MF.length - 1];
const mesesAnio = () => { const o = []; for (let m = D.corte.slice(0, 4) + '-01'; m <= ULT_MF; m = addM(m, 1)) o.push(m); return o; };
const INCOMP = D.mesesIncompletos || {};
const FKX = D.forecastKamExcluido || {};                                         // 24/11: meses del forecast del KAM fuera de la medición (formulario en 0)
const exclKamDe = cls => [...new Set(cls.flatMap(c => Object.keys(FKX[c] || {})))].sort();
const incompletosDe = cls => [...new Set(cls.flatMap(c => INCOMP[c] || []))];
/* QA M1: etiqueta corta para el KAM (sin "mediana"); el detalle completo va en el title */
function incCorto(cl, m) { const x = ((D.mesesIncompletosDetalle || {})[cl] || {})[m]; if (!x) return 'incompleto'; return x.motivo === 'dias' && x.dias != null ? `incompleto: ${x.dias} días con factura` : x.razon != null ? `incompleto: ${nf.format(x.razon * 100)} % de lo normal` : 'incompleto'; }
function incTxt(cl, m) {      // detalle del mes incompleto (v2: mesesIncompletosDetalle)
  const x = ((D.mesesIncompletosDetalle || {})[cl] || {})[m]; if (!x) return 'mes incompleto';
  if (x.revisado) return 'sin reporte (revisado): ' + (x.nota || 'el reporte no va a llegar');
  return (x.estado || 'incompleto') + (x.motivo === 'dias' && x.dias != null ? `: ${x.dias} días con factura (lo normal son ${x.diasMediana})` : x.razon != null ? `: ${nf.format(x.razon * 100)} % de lo normal (${fN(x.pz)} pz contra una mediana de ${fN(x.mediana12)})` : '');
}
/* 2026-11-24: meses que BI revisó (REVISION_MESES.xlsx). Venta baja real = no es dato faltante: etiqueta gris y sí cuenta en los cálculos. */
const REV = D.mesesRevisados || {}, ECL = D.estadoClases || {};
const incRevisado = (cl, m) => !!(((D.mesesIncompletosDetalle || {})[cl] || {})[m] || {}).revisado;
const revTxt = (cl, m) => 'venta baja real (revisado)';
const revNota = (cl, m) => ((REV[cl] || {})[m] || {}).nota || '';
function pillsMeses(cl) {      // etiquetas de meses de una clase: amarillo = falta revisar · gris = revisado
  const inc = INCOMP[cl] || [], rev = Object.keys(REV[cl] || {}).sort();
  let h = '';
  if (ECL[cl]) h += ' ' + `<span class="pill" title="${esc(ECL[cl].nota || '')}">${esc(ECL[cl].estado === 'en transicion' ? 'Distribuidor en transición' : ECL[cl].estado)}</span>`;
  h += inc.map(m => ` <span class="pill ${incRevisado(cl, m) ? '' : 'warn'}" title="${esc(incTxt(cl, m))}">${esc(ml(m) + ' ' + (incRevisado(cl, m) ? 'sin reporte (revisado)' : incCorto(cl, m)))}</span>`).join('');
  const grupos = [];                                 // meses seguidos con el mismo motivo van en una sola etiqueta (p. ej. jul 25 – jun 26)
  rev.forEach(m => {
    const g = grupos[grupos.length - 1], ant = g && g.hasta, nota = revNota(cl, m);
    const sig = ant && (() => { const [a, b] = ant.split('-').map(Number); return b === 12 ? `${a + 1}-01` : `${a}-${String(b + 1).padStart(2, '0')}`; })();
    if (g && sig === m && g.nota === nota) g.hasta = m; else grupos.push({ desde: m, hasta: m, nota });
  });
  h += grupos.map(g => ` <span class="pill" title="${esc(g.nota)}">${esc((g.desde === g.hasta ? ml(g.desde) : ml(g.desde) + ' – ' + ml(g.hasta)) + ' ' + revTxt(cl, g.desde))}</span>`).join('');
  return h;
}

/* 0.5.0 · inventario con procedencia: inv.pzDistribuidor (último corte del distribuidor) + inv.pzTransito (órdenes en tránsito que cuentan,
   según la regla de datos.json) = inv.pzTotal. Sin esos campos todo es inventario del distribuidor, como antes. Funciones con nombre para usarlas al cargar. */
function invPartes(p) {
  const i = p && p.inv; if (!i) return null;
  const tr = +i.pzTransito || 0;
  const dist = i.pzDistribuidor != null ? (+i.pzDistribuidor || 0) : (i.pzTotal != null ? (+i.pzTotal || 0) - tr : (+i.pz || 0));
  const tot = i.pzTotal != null ? (+i.pzTotal || 0) : dist + tr;
  return { dist, tr, tot, fecha: i.fecha, ordenes: (p.transito && Array.isArray(p.transito.ordenes)) ? p.transito.ordenes : [] };
}
function invTot(p) { const x = invPartes(p); return x ? x.tot : 0; }
function conTransito(p) { const x = invPartes(p); return !!x && x.tr > 0; }
/* 0.5.0 · pedidos programados (productos[].pedidosProgramados; regla en pedidosProgramados.regla / reglasInventario.pedidosProgramados):
   se muestran aparte y NO suman al inventario ni a los días mientras su estado no cuente como inventario */
function progDe(p) { const x = p && p.pedidosProgramados; return x ? { pz: +x.pz || 0, cajas: +x.cajas || 0, ordenes: Array.isArray(x.ordenes) ? x.ordenes : [] } : null; }
/* 0.6.0 · venta en la moneda local del distribuidor: ventaLocal por clase {moneda, meses, total12, total3, total3ly, var3}
   (también se acepta ventaLocal.porClase[clase] o distribuidores[clase].ventaLocal). Sin el campo no se muestra nada. */
function ventaLocalDe(cl) { const v = D.ventaLocal, x = v ? (v.porClase ? v.porClase[cl] : v[cl]) : null, y = x || (D.distribuidores[cl] || {}).ventaLocal; return y && y.moneda && !/^(MIXTA|SIN MONEDA)$/.test(y.moneda) && ok(y.total3) ? y : null; }      // MIXTA / SIN MONEDA no traen totales
const fMon = (v, mon) => ok(v) ? mon + ' ' + fCx(v) : '—';
/* variación de 3 meses en moneda local: si alguno de los 3 meses no tiene reporte (mesesSinDato), no se muestra el % (sería engañoso) */
function var3Local(vl) {
  const sin = (vl.mesesSinDato || []).filter(m => MH.slice(-3).includes(m)).sort();
  if (sin.length) return 'sin reporte en ' + (sin.length > 1 ? ml(sin[0]).split(' ')[0] + '–' + ml(sin[sin.length - 1]) : ml(sin[0]));
  return ok(vl.var3) ? flecha(vl.var3) + fP(vl.var3) : '';
}
function diasTxt(n) { return fN(n) + (Math.round(n) === 1 ? ' día' : ' días'); }      // singular y plural
const PROG_KAM = 'Pedidos programados: todavía no salieron; no se suman a tus días de inventario hasta que se embarquen.';      // frase para el KAM; la regla completa, solo BI
function reglaProgramados() { const x = D.pedidosProgramados || {}, ri = D.reglasInventario || {}; return x.regla || ri.pedidosProgramados || ''; }
function reglaTransito() { const t = D.transito || {}, e = D.exportacion || {}, ri = D.reglasInventario || {}; return ri.transito || t.regla || t.reglaTransito || e.reglaTransito || D.reglaTransito || ''; }
/* una orden en tránsito con los nombres del contrato (T_ORDENES_TRANSITO de CONTRATO_EXPORTACION.md) o en camelCase */
const normOrden = o => ({ orden: o.orden || o.ORDEN || o.numero || o.id || '', cod: String(o.cod || o.codigo || o['COD. PRODUCTO'] || o.codProducto || '').trim(), clase: o.clase || o.CLASE || '',
  mes: String(o.mes || o.mesEmbarque || o.MES_EMBARQUE || '').slice(0, 7), eta: o.fechaLlegada || o.eta || o.ETA || o.fechaEta || '', cajas: +(o.cajas ?? o.CAJAS) || 0, piezas: +(o.piezas ?? o.pz ?? o.PIEZAS) || 0,
  unidades: +o.unidades || 0, estado: o.estado || o.ESTADO || '', m3: +(o.m3 ?? o.M3) || 0, cuenta: o.cuentaInventario, motivo: o.motivo || '' });
const ordPz = (o, p) => { const n = normOrden(o); return n.piezas || (n.unidades || n.cajas) * (((p.codigos.find(c => c.cod === n.cod) || p.princ || {}).pzPorU) || 1); };
const ordEta = o => { const n = normOrden(o); return n.eta || n.mes || ''; };
const fmtEta = v => { const t = String(v || ''); return !t ? '—' : t.length > 7 ? fechaCorta(t) : ml(t); };
const ordId = o => normOrden(o).orden;
function tablaOrdenes(p, prog) {
  const os = prog ? (progDe(p) || {}).ordenes || [] : (invPartes(p) || {}).ordenes || []; if (!os.length) return '';
  const tit = prog ? 'Pedidos programados (no suman al inventario)' : 'Órdenes en tránsito';
  return `<div class="tw" role="region" tabindex="0" aria-label="${tit}"><table class="tbl"><caption style="padding:8px 10px">${tit}</caption><thead><tr><th class="l">Orden</th><th class="l">Código</th><th class="l">Llegada estimada (ETA)</th><th>Piezas</th><th class="l">Estado</th></tr></thead><tbody>${os.map(o => `<tr><td class="l">${esc(ordId(o) || '—')}</td><td class="l">${esc(normOrden(o).cod || p.principal)}</td><td class="l">${esc(fmtEta(ordEta(o)))}</td><td>${fN(ordPz(o, p))}</td><td class="l" style="white-space:normal">${esc(normOrden(o).estado || 'en tránsito')}${normOrden(o).motivo ? `<small class="muted" style="display:block">${esc(normOrden(o).motivo)}</small>` : ''}</td></tr>`).join('')}</tbody></table></div>`;
}

const LINES = {}, PID = {};
P.forEach(p => {
  PID[p.id] = p;
  p.codigos.forEach(c => { c.id = p.clase + '__' + c.cod; LINES[c.id] = { p, c }; });
  p.cap = p.codigos.filter(c => c.captura);
  p.princ = p.codigos.find(c => c.cod === p.principal) || p.codigos[0];
  if (p.inv && !(invTot(p) > 0) && !p.inv.fecha && !(+p.inv.pzTransito > 0)) p.inv = null;      // QA B1: inventario en 0 sin fecha de corte = sin reporte de inventario (no es riesgo de quiebre)
  p.txt = (p.nombre + ' ' + p.grupo + ' ' + p.cat + ' ' + p.codigos.map(c => c.cod + ' ' + c.desc).join(' ')).toLowerCase();
});

/* ---------- 0.4.0: texto técnico (maestros, joins, archivos, campos) solo para BI ----------
   .solo-bi se ve solo con body.admin (lo pone portal.js a quien ve varias carpetas) y sin body.como-kam (botón "Ver como KAM" o ?comoKam). */
const BI = h => h ? `<span class="solo-bi">${h}</span>` : '';
const BI_DET = (h, t = 'Ver detalle técnico') => h ? `<details class="solo-bi tecbox"><summary>${t} <span class="pill">BI</span></summary><div>${h}</div></details>` : '';
try { if (new URLSearchParams(location.search).has('comoKam')) document.body.classList.add('como-kam'); } catch (e) { }

/* ---------- origen de la demanda por cliente ---------- */
const TIPO = {
  'sell through': { c: 'Sell through', d: 'venta del distribuidor a sus clientes (su reporte)' },
  'sell out': { c: 'Sell out', d: 'venta de las tiendas al consumidor (escáner de la cadena)' },
  'sell in directo': { c: 'Sell in directo', d: 'facturación directa de Brinova al cliente' },
  'mixto': { c: 'Mixto', d: 'más de una fuente' },
};
const tipoDe = c => (D.distribuidores[c] || {}).tipo || 'sell in directo';
/* mezcla de fuentes de un cliente: v2 trae distribuidores[c].origen [{tipo, pz12, pct}] y .mixto; PANAMA = sell through FEDURO + sell in directo XTRA */
function mezclaDe(c) {
  const d = D.distribuidores[c] || {};
  if (d.mixto && Array.isArray(d.origen) && d.origen.length > 1) { const o = {}; d.origen.forEach(x => { o[x.tipo] = x.pct; }); return o; }
  return null;
}
function fuenteTxt(c) {
  const mz = mezclaDe(c);
  if (mz) return Object.entries(mz).sort((a, b) => b[1] - a[1]).map(([t, v]) => (TIPO[t] ? TIPO[t].c : t) + (ok(v) ? ' ' + nf.format(v * 100) + ' %' : '')).join(' + ');
  if (c === 'PANAMA') return TIPO[tipoDe(c)].c + ' + sell in directo (XTRA)';
  return (TIPO[tipoDe(c)] || TIPO['sell in directo']).c;
}
function fuenteLarga(c) {
  const d = D.distribuidores[c] || {}, t = tipoDe(c), fu = (d.fuente || []).filter(x => x && x !== c);
  let s = t === 'sell through' ? `Reporte de ventas de ${esc(fu.length ? fu.join('/') + ' (' + c + ')' : c)} a sus clientes (sell through), convertido a piezas Brinova${BI(' (MAESTRO_PRODUCTOS · UNIDAD ESTANDAR; T_UNIDAD_REPORTE si reporta cajas)')}`
    : t === 'sell out' ? `Escáner de las tiendas de ${esc(c)} (sell out), convertido a piezas Brinova`
    : `Facturación directa de Brinova a ${esc(c)} (sell in directo): aquí la demanda es lo que Brinova facturó, así que la razón contra el sell in siempre da 1`;
  if (mezclaDe(c) || (c === 'PANAMA' && !d.origen)) s += '. Además se suma lo que Brinova le factura directo a Supermercados Xtra (marca LIKE), que no pasa por FEDURO' + (mezclaDe(c) ? ' (' + esc(fuenteTxt(c)) + ' de las piezas de 12 meses)' : '');
  if (d.linaje) {      // 0.4.0: linaje (archivos, maestros, factores) solo en la vista de BI
    const lj = d.linaje; let x = '';
    if (lj.reporta && lj.reporta.length) x += '. Reporta: ' + esc(lj.reporta.join(' · '));
    if (lj.conversion && lj.conversion.length) x += '. Conversión a piezas: ' + esc(lj.conversion.join(' · '));
    if (lj.unidadReporte && lj.unidadReporte.length) x += '. Unidad del reporte: ' + esc(lj.unidadReporte.join(' · '));
    s += BI(x);
  }
  return s;
}
const tipoSel = () => { if (S.dist !== 'TODOS') return mezclaDe(S.dist) || S.dist === 'PANAMA' ? 'mixto' : tipoDe(S.dist); const t = [...new Set(D.clases.map(tipoDe))]; return t.length === 1 && !D.clases.includes('PANAMA') ? t[0] : 'mixto'; };

/* ---------- estado ---------- */
const S = { dist: 'TODOS', vista: 'tendencia', unidad: 'form', q: '', cat: '', orden: 'valor', chip: 'todos', lim: 60, q2: '', chip2: 'todos', capLim: 25, capVista: 'abiertos', abierto: null, desde: '2025-01', foco: null, catAbierta: {}, limCat: {}, catClave: null };
let remote = {}, local = {}, uid = null, db = null, userCap = null, envio = null;
const LS = 'portal-' + CID;
try { const g = JSON.parse(localStorage.getItem(LS) || 'null'); if (g && g.unidad) S.unidad = g.unidad; } catch (e) { }
/* 070-GRAFICO · filtro del gráfico "Tendencia del mix" (estado global: lo pueden leer las tarjetas y cualquier vista)
   S.prod     = grupo del producto elegido (productos[].grupo; se muestra productos[].nombre, el nombre Brinova) o null = todo el mix
   S.prodDist = 'TODOS' o una clase: alcance del producto cuando el filtro de distribuidor de arriba está en "Todos"
   selGraf()  = productos que suma el gráfico y las tarjetas superiores: el mix del distribuidor o el producto elegido (uno o todos sus distribuidores)
   S.ocultas  = series apagadas en los gráficos de tendencia (claves de seriesDe: si, real, kp, alg, kam); se recuerda en localStorage
   S.agrupar  = "Productos del mix" agrupada por producto (suma de distribuidores; en piezas si cambian las presentaciones)
   S.capProd  = id del producto que se está capturando (gráfico compacto de la pestaña Capturar) */
Object.assign(S, { prod: null, prodDist: 'TODOS', ocultas: [], agrupar: false, gpAbierto: {}, capProd: null, cgOculto: false });
const LS_GRAF = 'portal-graf';
try { const g = JSON.parse(localStorage.getItem(LS_GRAF) || 'null'); if (g) { if (Array.isArray(g.ocultas)) S.ocultas = g.ocultas.filter(k => typeof k === 'string'); S.agrupar = !!g.agrupar; S.cgOculto = !!g.cgOculto; } } catch (e) { }
function guardarGraf() { try { localStorage.setItem(LS_GRAF, JSON.stringify({ ocultas: S.ocultas, agrupar: S.agrupar, cgOculto: S.cgOculto })); } catch (e) { } }
const prodAlcance = () => S.dist !== 'TODOS' ? S.dist : (S.prodDist || 'TODOS');
function selGraf() { if (!S.prod) return P.filter(enDist); const a = prodAlcance(); return P.filter(p => p.grupo === S.prod && (a === 'TODOS' || p.clase === a)); }

/* ---------- valores efectivos ---------- */
const vig = (c, m) => (c.kam && c.kam[m] != null) ? c.kam[m] : null;          // forecast vigente: tu formulario (mes en curso = oficial en v2)
function kamU(c, m) {
  if (MK.includes(m)) {                                                         // solo los meses de captura toman lo editado; el resto es el vigente
    const l = local[c.id]; if (l && l.meses && l.meses[m] != null) return l.meses[m];
    const r = remote[c.id]; if (r && r.meses && r.meses[m] != null) return r.meses[m];
  }
  return vig(c, m) || 0;
}
const editado = (c, m) => MK.includes(m) && kamU(c, m) !== (vig(c, m) || 0);
const precioU = (p, c) => c.precio != null ? c.precio : (p.precioPz != null && c.pzPorU ? p.precioPz * c.pzPorU : null);
const kamPz = (p, m) => p.codigos.reduce((a, c) => a + kamU(c, m) * (c.pzPorU || 0), 0);
const kamVal = (p, m) => p.codigos.reduce((a, c) => { const pr = precioU(p, c); return a + (pr ? kamU(c, m) * pr : 0); }, 0);
const kamPzM = (p, ms) => ms.reduce((a, m) => a + kamPz(p, m), 0);
const kamValM = (p, ms) => ms.reduce((a, m) => a + kamVal(p, m), 0);
const pv = (p, pz) => p.precioPz != null ? (pz || 0) * p.precioPz : 0;
const algPz = (p, ms) => sum(p.alg, ms);
const algPz6 = p => algPz(p, MK);                                                // nombre histórico: ahora suma la ventana real (MK)
const kamPz6 = p => kamPzM(p, MK);
const tend = p => p.d3ly > 0 ? p.d3 / p.d3ly - 1 : null;
/* días de inventario (auditoría 23/11): venta de los últimos 3 meses con reporte completo de la clase (sin mesesIncompletos);
   si quedan menos de 2, los últimos 6 completos. La página recalcula con esto; productos[].inv.doh del generador queda de referencia. */
const _MDOH = {};
function mesesDoh(cl) { if (_MDOH[cl]) return _MDOH[cl]; const inc = INCOMP[cl] || []; let ms = MH.slice(-3).filter(m => !inc.includes(m)); if (ms.length < 2) ms = MH.slice(-6).filter(m => !inc.includes(m)); return (_MDOH[cl] = ms); }
const ventaDoh = p => sum(p.real, mesesDoh(p.clase));
const diasDoh = p => mesesDoh(p.clase).length * 30.4;
const dias = p => { if (!p.inv) return null; const v = ventaDoh(p); return v > 0 ? Math.round(invTot(p) / (v / diasDoh(p))) : null; };      // 0.5.0: incluye el tránsito que cuenta
/* foto vieja: el último corte es anterior al mes de datos → se muestra "corte dd/mm/aaaa · dato viejo", sin marca de riesgo ni sobrestock */
/* QA 0.4.0: un corte anterior al primer día del mes de datos (calendario.corte) ya es viejo; no es un umbral de días */
const MES_DATOS = (CAL && CAL.corte) || D.corte;
const fechaVieja = f => !!f && String(f).slice(0, 10) < MES_DATOS + '-01';
const fechaInv = cl => cl && (D.distribuidores[cl] || {}).invFecha;
function invViejo(cl) { return fechaVieja(fechaInv(cl)); }
const viejoTxt = f => 'corte ' + fechaCorta(f) + ' · dato viejo';
function dif(p) { const a = algPz6(p), k = kamPz6(p); if (a <= 0) return null; return k / a - 1; }
const fac = p => S.unidad === 'pz' ? 1 : (p.uPz || 1);
function plural(pres) { const pr = String(pres || 'caja').toLowerCase(); return ({ caja: 'cajas', unidad: 'unidades', pack: 'packs', 'pack oferta': 'packs', bulto: 'bultos', 'bulto/caja': 'cajas', display: 'displays', kg: 'kg' })[pr] || pr; }
/* 0.4.0: presentación en palabras simples. BULTO/CAJA → caja; UNIDAD que trae varias piezas y T_SKU dice "Pack oferta" → pack; si no, TIPO del formulario o T_SKU */
function presDe(c) {
  if (!c) return '';
  const t = String(c.tipo || '').toLowerCase(), pr = String(c.pres || '').toLowerCase();
  if (t === 'bulto/caja') return 'caja';
  if (t === 'unidad' && c.pzPorU > 1 && pr.startsWith('pack')) return 'pack';
  return c.tipo || c.pres || '';
}
const presTxt = c => { const t = String(presDe(c) || 'unidad').toLowerCase(); return t.charAt(0).toUpperCase() + t.slice(1); };   // presentación: la del formulario (TIPO) o la de T_SKU
function uNom(p) {
  if (S.unidad === 'pz') return 'piezas';
  if (!p.uPz || p.uPz === 1) return 'piezas';
  return plural(presDe(p.princ)) + ' de ' + fN(p.uPz) + ' pz';
}
/* etiqueta de unidad del producto: "cajas de 12 pz" (empaque, con fondo) contra "piezas" (borde): que no se confundan */
const esEmpaque = p => S.unidad !== 'pz' && p.uPz > 1;
const uPill = p => `<span class="upill ${esEmpaque(p) ? 'emp' : 'pz'}" title="${esc(esEmpaque(p) ? 'Cantidades en ' + uNom(p) + ': 1 = ' + fN(p.uPz) + ' piezas' : 'Cantidades en piezas sueltas')}">${esc(uNom(p))}</span>`;
const uNomGlobal = () => S.unidad === 'pz' ? 'cantidades en piezas (unidad estándar)' : 'cantidades en la unidad de tu formulario';
const cNom = c => presTxt(c) + (c.pzPorU > 1 ? ' de ' + fN(c.pzPorU) + ' pz' : (c.pzPorU === 1 ? ' (1 pz)' : ' (sin factor de piezas)'));
/* 0.4.1 (pedido del usuario): primero el nombre de Brinova y debajo cómo lo llama el distribuidor (o la cadena).
   codigos[].descBrinova (T_SKU; si no, BFCST) y codigos[].descDistribuidor [{cod, nombre}]; sin ellos, la descripción de antes. */
const descB = c => c.descBrinova || c.desc || c.cod;
function quienLlama(cl) {
  if (tipoDe(cl) === 'sell out') return cl;
  const fu = ((D.distribuidores[cl] || {}).fuente || []).filter(x => x && x !== cl);
  return fu.length ? fu.join('/') : cl;
}
function nombreDist(p, c, corto) {
  const xs = c.descDistribuidor || []; if (!xs.length) return '';
  const so = tipoDe(p.clase) === 'sell out', et = x => esc(x.nombre) + (x.cod ? ' (' + (so ? 'código de barras ' : 'cód. ') + esc(x.cod) + ')' : '');
  const mas = xs.length - 1, tt = xs.slice(1).map(x => x.nombre + (x.cod ? ' (' + x.cod + ')' : '')).join(' · ');
  return `<span class="dnom${corto ? ' corto' : ''}">En ${esc(quienLlama(p.clase))}: ${et(xs[0])}${mas ? ` <span class="mas" title="${esc(tt)}">+${mas}</span>` : ''}</span>`;
}
const uCod = c => c.pzPorU > 1 ? plural(presDe(c)) + ' de ' + fN(c.pzPorU) + ' pz' : 'piezas (1 pz)';
/* sell in del código en su unidad: v2 trae codigos[].sellInU (el UNI REAL del formulario); si no, el del producto en el código principal */
function siU(p, c, m) { if (c.sellInU && c.sellInU[m] != null) return c.sellInU[m]; if (c.cod === p.principal && c.pzPorU && p.sellIn[m] != null) return p.sellIn[m] / c.pzPorU; return null; }

/* ---------- inventario: umbrales de días por distribuidor ----------
   0.5.1: datos.umbralesInventario {general, porClase, fuente} sale de MAESTROS.xlsx › T_DOH_OBJETIVO (lo que se espera de cada
   distribuidor). Sin ese campo, los de antes: reporte de distribuidores en Power BI (15 días riesgo; 30 en exportación; 90 sobrestock; 180 exceso).
   umbral(null) = la selección completa: si todas las clases tienen los mismos, esos; si no, el promedio ponderado por la venta diaria en piezas
   (el total sobrepasa el umbral justo cuando Σ inventario > Σ venta diaria × umbral de cada clase). */
const UMB = D.umbralesInventario && D.umbralesInventario.general ? D.umbralesInventario : null;
const UMB_K = ['riesgo', 'sobrestock', 'exceso'];
function umbralClase(cl) {
  if (!UMB) { const d = D.distribuidores[cl] || {}; return { riesgo: d.umbralRiesgo || ((d.exportacion || KAMN === 'MONICA') ? 30 : 15), sobrestock: 90, exceso: 180 }; }
  const g = UMB.general, x = (UMB.porClase || {})[cl] || {}, def = { riesgo: 15, sobrestock: 90, exceso: 180 }, u = {};
  UMB_K.forEach(k => { u[k] = ok(x[k]) ? x[k] : ok(g[k]) ? g[k] : def[k]; });
  return u;
}
const umbralIgual = (a, b) => UMB_K.every(k => a[k] === b[k]);
function umbral(cl) {
  if (cl && cl !== 'TODOS') return umbralClase(cl);
  const cs = D.clases.length ? D.clases : [null], us = cs.map(umbralClase);
  if (us.every(u => umbralIgual(u, us[0]))) return us[0];
  const w = {}; P.forEach(p => { if (p.inv && ventaDoh(p) > 0) w[p.clase] = (w[p.clase] || 0) + ventaDoh(p) / diasDoh(p); });
  const tw = cs.reduce((a, c) => a + (w[c] || 0), 0); if (!(tw > 0)) return umbralClase(null);
  const u = { mixto: true }; UMB_K.forEach(k => { u[k] = Math.round(cs.reduce((a, c, i) => a + (w[c] || 0) * us[i][k], 0) / tw); });
  return u;
}
const riesgo = cl => umbral(cl).riesgo;
function estInv(d, cl) { if (d == null) return null; if (invViejo(cl)) return ['', viejoTxt(fechaInv(cl))]; const u = umbral(cl); if (d < u.riesgo) return ['bad', 'Riesgo de quiebre']; if (d > u.exceso) return ['warn', 'Exceso']; if (d > u.sobrestock) return ['warn', 'Sobrestock']; return ['good', 'Sano']; }
/* de dónde salen: con la tabla, por distribuidor (y en BI el archivo); sin ella, el reporte de Power BI como antes */
const umbralFuente = () => UMB ? 'Umbrales que se esperan de cada distribuidor' + BI(' (' + esc(UMB.fuente || 'MAESTROS.xlsx › T_DOH_OBJETIVO') + ')') : 'Umbrales del reporte de distribuidores en Power BI';
const pill = (cls, t) => `<span class="pill ${cls || ''}">${esc(t)}</span>`;
function pillTend(t) { if (t == null) return pill('', 'sin base'); return pill(t >= 0.05 ? 'good' : t <= -0.1 ? 'bad' : '', flecha(t) + fP(t)); }
function pillDias(d, cl) { if (d == null) return pill('', 'sin dato'); const e = estInv(d, cl); return pill(e[0], diasTxt(d) + ' · ' + e[1].toLowerCase()); }
function pillDif(d) { if (d == null) return pill('', '—'); return pill(Math.abs(d) <= 0.1 ? 'good' : Math.abs(d) <= 0.3 ? '' : 'warn', flecha(d) + fP(d)); }

/* ---------- alertas del producto y avisos de la captura ---------- */
const inter = k => k && (k.inter != null ? !!k.inter : k.mv12 <= ((D.algoritmo || {}).intermitenteMeses || 4));   // intermitente: compró en N meses o menos del año (v1: 4, v2: 8)
function alertas(p) {
  const a = [];
  if (p.cierre !== 'OK') a.push(['bad', p.cierre === 'REVISAR' ? 'Dato a revisar' : p.cierre.charAt(0) + p.cierre.slice(1).toLowerCase()]);
  const e = estInv(dias(p), p.clase); if (e && e[0] && e[0] !== 'good') a.push([e[0] === 'bad' ? 'bad' : 'warn', e[1]]);
  const df = dif(p);
  if (df != null && Math.abs(df) > 0.5 && pv(p, algPz6(p) + kamPz6(p)) > 300000) a.push(['warn', 'Tu forecast muy ' + (df > 0 ? 'arriba' : 'abajo') + ' del algoritmo']);
  if (p.precioPz == null) a.push(['bad', 'Sin precio']);
  return a;
}
/* informe 03 §G y contrato v2 (reglasAvisos). Se recalcula en vivo mientras escribes. Devuelve [nivel, texto, texto corto]. Niveles (0.3.1):
   · 'bad'  aviso FUERTE: en un mes de captura tu número en piezas pasa de X3 × el algoritmo del código Y de X3M × su mejor mes de venta;
            o el código lleva 6+ meses sin venta (algoritmo en 0) y tiene forecast.
   · 'warn' el código lleva 1 a 5 meses sin venta.
   · 'nota' aviso SUAVE (gris, sin alarma): pasa de X3 × el algoritmo pero no de X3M × su mejor mes de venta. */
const RA = D.reglasAvisos || {}, X3 = (RA.x3alg && RA.x3alg.factor) || 3, X3M = (RA.x3alg && RA.x3alg.factorMaxHist) || X3, SV = Object.assign({ min: 1, max: 5 }, RA.sinVenta || {});
/* mejor mes de venta del código en piezas: codigos[].maxHistPz (datos 0.3.1), el que trae el aviso del generador, o el mejor mes del producto */
function maxHist(p, c) {
  if (c.maxHistPz != null) return { pz: c.maxHistPz, de: 'su mejor mes de venta' };
  const a = (c.avisos || []).find(x => x.tipo === 'x3alg' && x.maxHistPz != null);
  if (a) return { pz: a.maxHistPz, de: 'su mejor mes de venta' };
  return { pz: Math.max(0, ...MH.map(m => p.real[m] || 0)), de: 'el mejor mes de venta del producto' };
}
function avisosCaptura(p) {
  const out = [], veces = nf.format(X3), vecesM = nf.format(X3M);
  p.codigos.forEach(c => {
    const k = c.calc; if (!k) return;
    const fz = c.pzPorU || 0, mh = maxHist(p, c), alg = m => (k.fc && k.fc[m]) || 0;
    const sobre = MK.filter(m => fz && alg(m) > 0 && kamU(c, m) * fz > X3 * alg(m));          // más de X3 × el algoritmo
    const fuertes = sobre.filter(m => kamU(c, m) * fz > X3M * mh.pz), suaves = sobre.filter(m => !fuertes.includes(m));
    const peor = ms => ms.reduce((a, m) => kamU(c, m) * fz / alg(m) > kamU(c, a) * fz / alg(a) ? m : a, ms[0]);
    if (fuertes.length) { const m = peor(fuertes);
      out.push(['bad', `${c.cod}: en ${fuertes.map(ml).join(', ')} tu forecast es más de ${veces} veces el algoritmo y más de ${vecesM} veces ${mh.de} (${fN(mh.pz)} pz). En ${ml(m)} el forecast registrado es ${fN(kamU(c, m) * fz)} pz y el algoritmo indica ${fN(alg(m))}.${suaves.length ? ` También pasan de ${veces} veces el algoritmo, sin llegar a ese máximo: ${suaves.map(ml).join(', ')}.` : ''} Registre el motivo en el comentario`, `${c.cod}: ${fuertes.map(ml).join(', ')} más de ${veces}× el algoritmo y de ${vecesM}× su mejor mes`]); }
    else if (suaves.length) { const m = peor(suaves);        // la nota gris sale sola: si el código ya tiene aviso fuerte, sus otros meses van dentro de ese aviso
      out.push(['nota', `${c.cod}: en ${suaves.map(ml).join(', ')} tu forecast es más de ${veces} veces el algoritmo (${ml(m)}: ${fN(kamU(c, m) * fz)} pz contra ${fN(alg(m))}), pero no pasa de ${vecesM} veces ${mh.de} (${fN(mh.pz)} pz). Es solo una nota`, `${c.cod}: ${suaves.map(ml).join(', ')} más de ${veces}× el algoritmo`]); }
    const tiene = MK.some(m => kamU(c, m) > 0);
    if (k.sinVenta >= SV.min && k.sinVenta <= SV.max && tiene) out.push(['warn', `${c.cod}: hace ${fN(k.sinVenta)} ${k.sinVenta === 1 ? 'mes' : 'meses'} que no vende (última venta ${k.ultimo ? mll(k.ultimo) : 'sin registro'}). ¿Sigue activo?`]);
    if (k.estado !== 'ACTIVO' && tiene) out.push(['bad', `${c.cod}: lleva ${fN(k.sinVenta)} meses sin venta y el algoritmo lo deja en 0, pero tu forecast tiene unidades. Revisa si sigue vigente`]);
  });
  const orden = { bad: 0, warn: 1, nota: 2 };
  return out.sort((a, b) => orden[a[0]] - orden[b[0]]);                  // lo fuerte primero; las notas al final
}
const avisosFuertes = p => avisosCaptura(p).filter(a => a[0] !== 'nota');   // lo que pide atención (filtros "Con aviso")
const avisosHtml = av => av.map(([c, x]) => `<p class="aviso${c === 'bad' ? ' bad' : c === 'nota' ? ' nota' : ''}" style="margin-bottom:6px">${c === 'nota' ? '<span class="vh">Nota: </span>' : ''}${esc(x)}</p>`).join('');
const avisosPills = av => av.map(([c, x, corto]) => pill(c === 'nota' ? '' : c, (c === 'nota' ? 'Nota · ' : '') + (corto || (x.length > 70 ? x.slice(0, 68) + '…' : x)))).join(' ');   // en la grilla, versión corta
/* tu forecast pasado contra la venta: el del generador (precisionKam, en piezas) si viene; si no, se calcula aquí a precio de lista */
function precKam(dist) {
  const pk = D.precisionKam; if (!pk) return null;
  const x = dist === 'TODOS' ? pk.total : (pk.porClase || {})[dist];
  return x ? Object.assign({ desde: pk.desde, hasta: pk.hasta, regla: pk.regla }, x) : null;
}
function sesgoProducto(p) {
  let k = 0, r = 0; MH.slice(-12).forEach(m => { const f = p.kamPasadoPz && p.kamPasadoPz[m]; if (f) { k += f; r += p.real[m] || 0; } });
  return r > 0 ? k / r - 1 : null;
}

/* ---------- totales de una selección (todo a precio de lista para poder sumar productos distintos) ---------- */
function resumen(sel) {
  const L12 = MH.slice(-12);
  const r = { alg: 0, kam: 0, pzk: 0, pza: 0, d3: 0, d3ly: 0, inv: 0, d3st: 0, vdst: 0, invPz: 0, invDistPz: 0, invTrPz: 0, progPz: 0, progCajas: 0, progOrd: new Set(), ventaPz: 0, vdPz: 0, conInv: 0, kp: 0, rl: 0, si: 0, err: 0, curso: 0, avance: 0, conAvance: 0, sinPrecio: 0, L12 };
  sel.forEach(p => {
    r.alg += pv(p, algPz6(p)); r.kam += kamValM(p, MK); r.pzk += kamPz6(p); r.pza += algPz6(p);
    r.d3 += pv(p, p.d3); r.d3ly += pv(p, p.d3ly);
    { const pg = progDe(p); if (pg) { r.progPz += pg.pz; r.progCajas += pg.cajas; pg.ordenes.forEach(o => r.progOrd.add(normOrden(o).orden)); } }
    if (p.inv) { const ip = invPartes(p); r.inv += pv(p, ip.tot); r.d3st += pv(p, ventaDoh(p)); r.vdst += pv(p, ventaDoh(p)) / diasDoh(p); r.invPz += ip.tot; r.invDistPz += ip.dist; r.invTrPz += ip.tr; r.ventaPz += ventaDoh(p); r.vdPz += ventaDoh(p) / diasDoh(p); r.conInv++; }
    L12.forEach(m => { const k = p.kamPasadoPz && p.kamPasadoPz[m]; if (k) { const re = p.real[m] || 0; r.kp += pv(p, k); r.rl += pv(p, re); r.si += pv(p, p.sellIn[m] || 0); r.err += pv(p, Math.abs(re - k)); } });
    r.curso += kamVal(p, MC);
    const av = p.avanceSellInPz && p.avanceSellInPz[MC]; if (av != null) { r.avance += pv(p, av); r.conAvance++; }
    if (p.precioPz == null) r.sinPrecio++;
  });
  /* 0.4.0: días de inventario en piezas (Σ inventario pz ÷ Σ venta diaria pz), no a precio de lista; la clase y el total vienen de diasInventarioPz */
  r.doh = r.vdPz > 0 ? r.invPz / r.vdPz : null;
  r.sesgo = r.rl > 0 ? r.kp / r.rl - 1 : null;
  r.sesgoSI = r.si > 0 ? r.kp / r.si - 1 : null;
  r.prec = r.kp > 0 ? Math.max(0, 1 - r.err / r.kp) : null;
  const dist = sel.length && sel.every(p => p.clase === sel[0].clase) && D.clases.length > 1 ? sel[0].clase : 'TODOS';
  const pk = sel.length === P.filter(p => dist === 'TODOS' || p.clase === dist).length ? precKam(dist) : null;
  if (pk) { r.pk = pk; r.sesgo = pkSes(pk); r.sesgoReal = pk.sesgoReal; r.sesgoSI = pk.sesgoSellIn; r.prec = pk.accReal == null ? null : Math.max(0, pk.accReal); r.L12 = [pk.desde, pk.hasta]; }
  const completa = sel.length && sel.length === P.filter(p => dist === 'TODOS' || p.clase === dist).length, dip = D.diasInventarioPz;
  const dipMala = dip && Object.values(dip.porClase || {}).some(c => !(c.invPz > 0) && !c.fecha);      // QA B1: una clase sin inventario no debe entrar al total
  if (completa && dip) { const x = dist === 'TODOS' ? (dipMala ? null : dip.total) : (dip.porClase || {})[dist]; if (x && ok(x.dias) && (x.invPz > 0 || x.fecha) && (!(r.invTrPz > 0) || x.pzTransito != null || x.invTransitoPz != null || x.transitoPz != null)) { r.doh = x.dias; r.dip = x; } }      // con tránsito y sin ese dato en diasInventarioPz, calcula la página
  r.difK = r.alg > 0 ? r.kam / r.alg - 1 : null;
  return r;
}

/* ---------- "¿De dónde sale este número?" (un solo <dialog>, contenido por clave) ---------- */
const nb = (key, txt, extra = '') => `<button type="button" class="n" data-exp="${key}" ${extra}>${txt}</button>`;
function abrirExp(o) {
  if (!o) return;
  $('#dx-t').textContent = o.t;
  let h = `<p class="dx-v">${esc(o.v)}<span>${esc(o.u || '')}</span></p>`;
  if (o.que) h += `<section><h3>Qué es</h3><p>${o.que}</p></section>`;
  if (o.formula || o.filas) {
    h += '<section><h3>Cómo se calcula</h3>';
    if (o.formula) h += `<div class="formula">${o.formula}</div>`;
    if (o.filas && o.filas.length) h += '<table class="dx-tab"><tbody>' + o.filas.map(f => `<tr${f[2] ? ' class="tot"' : ''}><td>${f[0]}</td><td>${f[1]}</td></tr>`).join('') + '</tbody></table>';
    h += '</section>';
  }
  /* 0.4.0: el KAM ve la fuente en palabras simples; archivos, maestros y campos van en "Ver detalle técnico" (solo BI) */
  const fuentesKam = o.fuentes ? '<h4 style="margin:4px 0">De dónde vienen los datos</h4><ul>' + [...new Set(o.fuentes.map(f => CORTO.get(f) || f))].map(f => `<li>${f}</li>`).join('') + '</ul>' : '';      // 0.6.0: las fuentes van con el detalle técnico (BI)
  if (o.nota) h += `<p class="aviso info">${o.nota}</p>`;
  const tecs = fuentesKam ? [fuentesKam] : [], largas = (o.fuentes || []).filter(f => CORTO.has(f));
  if (largas.length) tecs.push('<ul>' + largas.map(f => `<li>${f}</li>`).join('') + '</ul>');
  if (o.bi) tecs.push(...[].concat(o.bi).filter(Boolean));
  if (o.tec) tecs.push(`<p class="tec">Campo técnico: ${o.tec}</p>`);
  h += BI_DET(tecs.join(''));
  $('#dx-b').innerHTML = h;
  const d = $('#dx'); if (!d.open) d.showModal();
}
const FUENTE_UNID = 'Tu formulario vigente (02 FORMULARIOS FCST CARGA MENSUAL, columnas de unidades por mes) más lo que cambies en este portal (captura_&lt;ciclo&gt;.json en tu carpeta)';
const FUENTE_ALG = 'Algoritmo del motor (07 MOTOR FCST, notebook 02 → FCST_ALGORITMO.xlsx, columna FCST_PIEZAS)';
const FUENTE_PRECIO = 'Precio de lista por distribuidor (MAESTROS.xlsx, hoja PRECIOS; respaldo FCST_ALGORITMO). Precio por pieza = precio del código principal ÷ sus piezas';
const FUENTE_BHIST = 'Forecast histórico: BHIST (la carpeta de cada mes guarda tu número para ese mes)';
const FUENTE_REAL = 'Venta real: demanda de cada distribuidor (sell through / sell out / sell in directo)';
const FUENTE_SI = 'Sell in: facturación de Brinova (DATA SELL IN)';
const FUENTE_SI_PZ = 'Facturación de Brinova (DATA SELL IN): piezas = unidades facturadas × piezas del código';
/* versión corta que ve el KAM; la larga queda en el detalle técnico de BI */
const CORTO = new Map([
  [FUENTE_UNID, 'Tu formulario vigente más lo que cambies en este portal'],
  [FUENTE_ALG, 'El algoritmo del motor de forecast'],
  [FUENTE_PRECIO, 'Precio de lista de cada distribuidor'],
  [FUENTE_BHIST, 'Tu forecast oficial de cada mes'],
  [FUENTE_REAL, 'Venta real: la demanda de cada distribuidor'],
  [FUENTE_SI, 'Sell in: lo que Brinova facturó'],
  [FUENTE_SI_PZ, 'Sell in: lo que Brinova facturó, en piezas'],
]);
const distTxt = () => S.dist === 'TODOS' ? 'todos tus distribuidores' : S.dist;
/* versionDatos: v2 = {sello, generado, archivos:[{clave, archivo, modificado}]}; se acepta también {archivo: fecha} */
function filasVersion() {
  const v = D.versionDatos; if (!v) return [];
  if (Array.isArray(v.archivos)) return v.archivos.map(a => [esc(a.clave) + `<br><span class="small muted">${esc(String(a.archivo || '').split('/').slice(-2).join('/'))}</span>`, esc(String(a.modificado || '—').slice(0, 16))]);
  return Object.entries(v).filter(([, f]) => typeof f !== 'object').map(([k, f]) => [esc(k), esc(String(f).replace('T', ' ').slice(0, 16))]);
}
const selDist = () => P.filter(enDist);
/* 0.4.0: "tu forecast pasado" en una frase para el KAM */
const pctN = v => ok(v) ? nf.format(Math.max(0, Math.round(v * 100))) + ' %' : '—';
/* medida principal (precisionKam.principal, 24/11): número grande = acierto trimestral contra el sell in, al lado su sesgo.
   Sin "principal" (datos viejos) queda lo de antes: acierto trimestral y sesgo contra la venta real. */
const PKP = (D.precisionKam || {}).principal || null;
const BASE_SI = !!PKP && /sell ?in/i.test(PKP.base || PKP.sesgo || '');
const pkMed = pk => pk ? pk[(PKP && PKP.medida) || 'accTrimSellIn'] : null;
const pkSes = pk => pk ? pk[(PKP && PKP.sesgo) || 'sesgoReal'] : null;
const BASE_TXT = BASE_SI ? 'las compras del distribuidor' : 'la venta real';
/* acierto = 1 − Σ|sell in − forecast| ÷ Σ sell in: si el error pasa de lo comprado da 0 (piso), y sin compras no hay base. Nunca un 0 % a secas. */
function aciertoEst(v, base) { if (!ok(v) || !(base > 0)) return 'sinbase'; return v <= 0.005 ? 'piso' : 'ok'; }
function aciertoTxt(v, base, corto) { const e = aciertoEst(v, base); return e === 'sinbase' ? 'sin base' : e === 'piso' ? (corto ? 'error mayor que las compras' : 'sin acierto: el error superó las compras del distribuidor') : pctN(v); }
function tendTxt(s) { if (!ok(s)) return 'sin datos suficientes para medir el sesgo'; const r = Math.round(Math.abs(s) * 100); return r < 5 ? 'forecast alineado con ' + BASE_TXT : `forecast ${nf.format(r)} % ${s > 0 ? 'por encima' : 'por debajo'} de ${BASE_TXT}`; }
function frasePasado(pk) {
  const v = pkMed(pk), e = aciertoEst(v, pk && pk.sellInPz), t = tendTxt(pkSes(pk));
  const a = e === 'ok' ? `Acierto trimestral de ${pctN(v)} contra las compras del distribuidor` : e === 'piso' ? 'Sin acierto trimestral: el error superó las compras del distribuidor' : '';
  return a ? a + '; ' + t : t.charAt(0).toUpperCase() + t.slice(1);
}
/* meses fuera de la medición, con su motivo (mesesExcluidosDetalle, 24/11). Datos viejos: solo la lista, que entonces era "reporte" */
const ORIGEN_EXCL = { forecastKam: 'formulario del KAM en 0', reporte: 'sin reporte o incompleto' };
function exclusiones(pk) {
  const det = (pk && pk.mesesExcluidosDetalle) || [];
  if (!det.length) return (pk && pk.mesesExcluidos || []).length ? [{ origen: 'reporte', meses: pk.mesesExcluidos.slice().sort(), xs: [] }] : [];
  const g = new Map();      // QA M4: se agrupa por motivo y por distribuidores, para decir a quién aplica cada mes
  det.forEach(x => { const cl = (x.clases || []).slice().sort(), k = (x.origen || 'reporte') + '|' + cl.join(','); if (!g.has(k)) g.set(k, { origen: x.origen || 'reporte', clases: cl, meses: [], xs: [] });
    const o = g.get(k); if (!o.meses.includes(x.mes)) o.meses.push(x.mes); o.xs.push(x); });
  return [...g.values()].map(o => { o.meses.sort(); return o; });
}
function quienTxt(cls) {
  if (!cls || !cls.length || cls.length >= D.clases.length) return '';
  const resto = D.clases.filter(c => !cls.includes(c));
  return cls.length > D.clases.length / 2 && resto.length <= 3 ? 'todos menos ' + lista(resto) : 'solo ' + lista(cls);
}
const exclTxt = pk => { const ex = exclusiones(pk); return ex.length ? 'no cuentan ' + ex.map(e => { const q = quienTxt(e.clases); return lista(e.meses.map(ml)) + ' (' + (ORIGEN_EXCL[e.origen] || e.origen) + (q ? '; ' + q : '') + ')'; }).join(' ni ') : ''; };
const exclBI = pk => exclusiones(pk).flatMap(e => e.xs.map(x => `<li><b>${esc(ml(x.mes))}</b> · ${esc(x.origen || '')}${x.clases ? ' · ' + esc(x.clases.join(', ')) : ''}: ${esc(x.motivo || x.nota || '')}${x.por ? ' (' + esc(x.por) + (x.fecha ? ', ' + esc(x.fecha) : '') + ')' : ''}</li>`)).join('');
/* tabla de los bloques de 3 meses (solo BI) */
function tablaTrim(pk) {
  const bl = (D.precisionKam || {}).trimestres, fs = pk && pk.trimestres; if (!Array.isArray(bl) || !Array.isArray(fs) || !fs.length) return '';
  return '<table class="dx-tab"><tbody><tr><td><b>Trimestre</b></td><td><b>Forecast · sell in · error (pz) · acierto · sesgo</b></td></tr>' + fs.map((x, i) => `<tr><td>${esc(rango(bl[i] || []))}</td><td>${fN(x.fcstPz)} · ${fN(x.sellInPz)} · ${fN(x.errPz)} · ${aciertoTxt(x.acierto, x.sellInPz, true)} · ${ok(x.sesgo) ? fP(x.sesgo) : '—'}</td></tr>`).join('') + '</tbody></table>';
}
/* ---------- 070-PRECISION · precisión del forecast = FCST ACC PM del reporte Forecast y PRM (datos.json › accPm) ----------
   ACC PM = 1 − Σ por producto base (Cod. Entrada) de |Σ meses sell in − Σ meses forecast| ÷ Σ forecast, piso 0; vacío sin forecast ni compras.
   El KAM elige desde–hasta entre los meses cerrados (máximo accPm.maxMeses = 12); se rehace aquí con el filtro de la página:
   distribuidor (S.dist), producto del gráfico (S.prod + prodAlcance) o categoría (S.cat). Con "Todos" suma todas las clases del KAM
   (como el reporte, también las que no están en la página) y los errores de un distribuidor compensan los de otro dentro del mismo producto.
   Se quitan de los dos lados los meses de accPm.excluir (formulario del KAM en 0 por error); el reporte de Power BI no los quita.
   Sin accPm (datos viejos) la tarjeta queda como antes (precisionKam). */
const AP = D.accPm && Array.isArray(D.accPm.meses) && D.accPm.meses.length && Array.isArray(D.accPm.filas) ? D.accPm : null;
const ACCR = { desde: null, hasta: null, aviso: '' };
const LS_ACC = 'portal-accpm-' + CID;
const nfP1 = new Intl.NumberFormat('es-CR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const pct1 = v => ok(v) ? nfP1.format(Math.max(0, Math.round(v * 1000) / 10)) + ' %' : '—';      // como el reporte: 0,0 %
function accSetRango(desde, hasta, cambio) {
  const ms = AP.meses, N = AP.maxMeses || 12, def = AP.defecto || [ms[Math.max(0, ms.length - N)], ms[ms.length - 1]];
  if (!ms.includes(desde)) desde = def[0];
  if (!ms.includes(hasta)) hasta = def[1];
  if (desde > hasta) { if (cambio === 'hasta') desde = hasta; else hasta = desde; }
  let i0 = ms.indexOf(desde), i1 = ms.indexOf(hasta);
  ACCR.aviso = '';
  if (i1 - i0 + 1 > N) {
    if (cambio === 'desde') i1 = i0 + N - 1; else i0 = i1 - N + 1;
    ACCR.aviso = `Se pueden medir hasta ${N} meses: el rango quedó en ${ml(ms[i0])} – ${ml(ms[i1])}.`;
  }
  ACCR.desde = ms[i0]; ACCR.hasta = ms[i1];
  try { localStorage.setItem(LS_ACC, JSON.stringify({ desde: ACCR.desde, hasta: ACCR.hasta })); } catch (e) { }
}
if (AP) { let g = null; try { g = JSON.parse(localStorage.getItem(LS_ACC) || 'null'); } catch (e) { } accSetRango(g && g.desde, g && g.hasta, 'hasta'); ACCR.aviso = ''; }
const accMeses = () => AP.meses.slice(AP.meses.indexOf(ACCR.desde), AP.meses.indexOf(ACCR.hasta) + 1);
/* alcance de la tarjeta: el mismo que las otras tarjetas (selGraf) más la categoría de la lista cuando no hay producto elegido */
function accAlcance() {
  if (S.prod) { const a = prodAlcance(); return { clases: a === 'TODOS' ? null : [a], grupo: S.prod, cat: '' }; }
  return { clases: S.dist === 'TODOS' ? null : [S.dist], grupo: null, cat: S.cat || '' };
}
function accAlcanceTxt(al) {
  const dst = al.clases ? al.clases.join(', ') : 'todos tus distribuidores';
  if (al.grupo) { const p = P.find(x => x.grupo === al.grupo); return (p ? p.nombre : al.grupo) + ' · ' + dst; }
  return dst + (al.cat ? ' · categoría ' + al.cat : '');
}
function accPmCalc(al, excluir = true, desde = ACCR.desde, hasta = ACCR.hasta) {
  const ms = AP.meses, i0 = ms.indexOf(desde), i1 = ms.indexOf(hasta);
  const fuera = new Set(excluir ? (AP.excluir || []).map(x => x.clase + '|' + x.mes) : []);
  const e = new Map();
  for (const [ci, ei, pid, cat, f, r] of AP.filas) {
    const cl = AP.clases[ci];
    if (al.clases && !al.clases.includes(cl)) continue;
    if (al.grupo && !(pid && PID[pid] && PID[pid].grupo === al.grupo)) continue;
    if (al.cat && cat !== al.cat) continue;
    let sf = 0, sr = 0;
    for (let i = i0; i <= i1; i++) { if (fuera.has(cl + '|' + ms[i])) continue; sf += f[i] || 0; sr += r[i] || 0; }
    const t = e.get(ei) || [0, 0]; t[0] += sf; t[1] += sr; e.set(ei, t);
  }
  let F = 0, R = 0, desv = 0;
  e.forEach(t => { F += t[0]; R += t[1]; desv += Math.abs(t[1] - t[0]); });
  const acc = !F && !R ? null : F ? Math.max(0, 1 - desv / F) : 0;
  const top = [...e.entries()].map(([ei, t]) => ({ ei, f: t[0], r: t[1], d: Math.abs(t[1] - t[0]) })).filter(x => x.d > 0).sort((a, b) => b.d - a.d).slice(0, 5);
  return { acc, F, R, desv, sesgo: R > 0 ? F / R - 1 : null, top };
}
/* meses quitados que tocan el alcance y el rango, agrupados por mes: [{mes, clases, motivo}] */
function accExcl(al) {
  const g = new Map();
  (AP.excluir || []).forEach(x => { if (x.mes < ACCR.desde || x.mes > ACCR.hasta || (al.clases && !al.clases.includes(x.clase))) return;
    if (!g.has(x.mes)) g.set(x.mes, { mes: x.mes, clases: [], motivo: x.motivo || '' }); g.get(x.mes).clases.push(x.clase); });
  return [...g.values()].sort((a, b) => a.mes < b.mes ? -1 : 1);
}
const accExclTxt = ex => ex.length ? 'Sin contar ' + lista(ex.map(x => ml(x.mes))) + ': el formulario del KAM quedó en 0 por error' + (quienTxt(ex[0].clases) ? ' (' + quienTxt(ex[0].clases) + ')' : '') + ', así que ese mes no se compara.' : '';
const accEntrada = ei => { const x = (AP.entradas || [])[ei] || []; return String(x[1] || x[0] || '—').replace(/^MASTER\s+/i, ''); };
function accSelector() {
  const op = sel => AP.meses.map(m => `<option value="${m}"${m === sel ? ' selected' : ''}>${esc(mll(m))}</option>`).join('');
  return `<fieldset class="acc-rango"><legend>Meses a medir <span class="muted">(meses cerrados, máximo ${AP.maxMeses || 12})</span></legend>`
    + `<div class="acc-f"><label for="acc-desde">Desde</label><select id="acc-desde" name="acc-desde">${op(ACCR.desde)}</select></div>`
    + `<div class="acc-f"><label for="acc-hasta">Hasta</label><select id="acc-hasta" name="acc-hasta">${op(ACCR.hasta)}</select></div>`
    + `<button type="button" class="chip" data-accdef>Últimos ${AP.maxMeses || 12} meses</button></fieldset>`
    + `<p class="acc-aviso" role="status" aria-live="polite">${esc(ACCR.aviso)}</p>`;
}
function expAccPm() {
  const al = accAlcance(), x = accPmCalc(al), ex = accExcl(al), sinEx = ex.length ? accPmCalc(al, false) : null, ms = accMeses();
  const pk = precKam(al.clases && al.clases.length === 1 ? al.clases[0] : 'TODOS');
  const fueraP = (AP.clasesFueraDelPortal || []).filter(c => !al.clases || al.clases.includes(c));
  return { t: 'Precisión del forecast (ACC PM)', v: x.acc == null ? 'Sin datos' : pct1(x.acc), u: x.acc == null ? 'no hubo forecast ni compras en esos meses' : 'de acierto · ' + rango(ms),
    que: accSelector() + `<p>Compara el forecast registrado para cada mes con lo que Brinova facturó al distribuidor (sell in), producto por producto, sumando los ${ms.length} meses elegidos en <b>${esc(accAlcanceTxt(al))}</b>. Es la misma asertividad del reporte Forecast y PRM.</p>`
      + (ex.length ? `<p class="small muted">${esc(accExclTxt(ex))}</p>` : ''),
    filas: [['Forecast registrado', fN(x.F) + ' u'], ['Compras del distribuidor (sell in)', fN(x.R) + ' u'], ['Desvío sumado producto por producto', fN(x.desv) + ' u'],
      ['Precisión del forecast', pct1(x.acc), 1], ['Sesgo (forecast contra compras)', ok(x.sesgo) ? flecha(x.sesgo) + fP(x.sesgo) : '—']]
      .concat(sinEx ? [['Contando ' + lista(ex.map(e => ml(e.mes))) + ' (como el reporte de Power BI)', pct1(sinEx.acc)]] : [])
      .concat(x.top.length ? [['<b>Dónde está el mayor desvío</b>', '<b>forecast · compras</b>']].concat(x.top.map(t => [esc(accEntrada(t.ei)), fN(t.f) + ' · ' + fN(t.r) + ' u'])) : []),
    fuentes: [FUENTE_BHIST, FUENTE_SI],
    bi: `<div class="formula">ACC PM = 1 − Σ<sub>Cod. Entrada</sub> |Σ<sub>meses</sub> sell in − Σ<sub>meses</sub> forecast| ÷ Σ forecast (piso 0; vacío sin forecast ni sell in) · sesgo = Σ forecast ÷ Σ sell in − 1</div>`
      + `<p>${esc(AP.regla || '')}</p><p>Unidad: ${esc(AP.unidad || '')}. Rango ${esc(ACCR.desde)}..${esc(ACCR.hasta)} (${ms.length} meses; disponibles ${esc(AP.meses[0])}..${esc(AP.meses[AP.meses.length - 1])}). Desvío ${fN(x.desv)} ÷ forecast ${fN(x.F)}.</p>`
      + (ex.length ? '<p>Excluidos de los dos lados:</p><ul>' + ex.map(e => `<li><b>${esc(ml(e.mes))}</b> · ${esc(e.clases.join(', '))}: ${esc(e.motivo)}</li>`).join('') + '</ul>' : '')
      + (fueraP.length ? `<p>Incluye clases del KAM que no están en la página (hoja X de MAESTROS): ${esc(fueraP.join(', '))}.</p>` : '')
      + (pk ? `<p>Medida anterior de la página (12 meses fijos, en piezas): acierto trimestral contra el sell in ${ok(pk.accTrimSellIn) ? pct1(pk.accTrimSellIn) : '—'}, sesgo ${fP(pk.sesgoSellIn)}; precisión contra la demanda ${ok(pk.accReal) ? pct1(Math.max(0, pk.accReal)) : '—'}.</p>` : ''),
    tec: 'datos.json → accPm.filas [clase, entrada, producto, categoría, forecast[24], sell in[24]] · accPm.excluir · Power BI: [FCST ACC PM] sobre \'Desviaciones PM\'',
    nota: 'Para mejorar la precisión, revisa primero los productos con mayor desvío: un mes alto se compensa con otro bajo del mismo producto, pero un producto no compensa a otro.' };
}
/* tarjeta "Precisión del forecast" (pintarKpis) */
function tarjetaAccPm() {
  const al = accAlcance(), x = accPmCalc(al), ex = accExcl(al), ms = accMeses();
  return tarjeta('Precisión del forecast · ' + esc(rango(ms)), nb('k_sesgo', x.acc == null ? 'Sin datos' : pct1(x.acc)),
    ok(x.sesgo) ? `sesgo ${fP(x.sesgo)} contra compras` : '', ok(x.sesgo) && Math.abs(x.sesgo) > 0.15 ? 'warn' : 'muted',
    [al.cat ? ['Categoría', esc(al.cat)] : null, ex.length ? ['Sin contar', esc(ex.map(e => ml(e.mes)).join(', '))] : ['Meses', ms.length + ' cerrados'], ['Periodo', nb('k_sesgo', 'Elegir meses', 'aria-label="Elegir los meses de la precisión del forecast"')]]);
}
/* precisión de una clase con el rango elegido (tabla de distribuidores) */
const accPmClase = cl => AP ? accPmCalc({ clases: [cl], grupo: null, cat: '' }) : null;
document.addEventListener('change', ev => {
  const id = ev.target && ev.target.id;
  if (AP && id === 'f-cat') { setTimeout(() => { if (S.vista === 'tendencia') pintarKpis(); }, 0); return; }      // la tarjeta sigue la categoría (S.cat lo pone app_3 › change)
  if (!AP || (id !== 'acc-desde' && id !== 'acc-hasta')) return;
  accSetRango($('#acc-desde').value, $('#acc-hasta').value, id === 'acc-desde' ? 'desde' : 'hasta');
  accRefrescar(id);
});
document.addEventListener('click', ev => {
  const t = ev.target.closest && ev.target.closest('[data-accdef]'); if (!t || !AP) return;
  accSetRango(AP.defecto[0], AP.defecto[1], 'hasta'); accRefrescar('acc-hasta');
});
function accRefrescar(foco) {
  if (S.vista === 'tendencia') pintarKpis();
  if (S.vista === 'distribuidores') pintarDistribuidores();
  const d = $('#dx'); if (d && d.open) { abrirExp(EXP.k_sesgo()); const el = $('#' + foco); if (el) el.focus(); }
}
const EXP = {
  k_kam() {
    const sel = selDist(), r = resumen(sel), top = sel.map(p => [p, kamValM(p, MK)]).filter(x => x[1] > 0).sort((a, b) => b[1] - a[1]).slice(0, 5);
    return { t: 'Tu forecast · meses de captura', v: fC(r.kam), u: 'colones a precio de lista',
      que: `Lo que esperas vender en <b>${rango(MK)}</b> en ${esc(distTxt())}: tu formulario vigente más lo que cambies aquí. No incluye ${mll(MC)} (mes en curso, solo lectura).`,
      formula: 'Σ por código y mes de (unidades del código × precio de lista del código)',
      filas: [['En piezas (unidad estándar)', fN(r.pzk) + ' pz'], ['Algoritmo, mismo periodo', fC(r.alg)], ['Diferencia contra el algoritmo', flecha(r.difK) + fP(r.difK)]]
        .concat(top.map(([p, v]) => ['· ' + esc(p.nombre) + ' (' + esc(p.clase) + ')', fC(v)])),
      fuentes: [FUENTE_UNID, FUENTE_PRECIO], tec: 'productos[].codigos[].kam (unidades del formulario) × .precio', nota: r.sinPrecio ? `${r.sinPrecio} productos no tienen precio de lista: no suman colones.` : '' };
  },
  k_alg() {
    const sel = selDist(), r = resumen(sel);
    return { t: 'Algoritmo · meses de captura', v: fC(r.alg), u: 'colones a precio de lista',
      que: `Lo que propone el motor para <b>${rango(MK)}</b> en ${esc(distTxt())}, a partir de la demanda real. Es tu punto de partida, no tu número.`,
      formula: 'Σ por producto y mes de (piezas del algoritmo × precio de lista por pieza)',
      filas: [['En piezas (unidad estándar)', fN(r.pza) + ' pz'], ['Productos', fN(sel.length)], ['Cálculo por producto', 'base × temporada, con reglas (ver “Cómo se calcula”)']],
      fuentes: [FUENTE_ALG, FUENTE_PRECIO], tec: 'productos[].alg (piezas por mes) × productos[].precioPz' };
  },
  k_venta3() {
    const sel = selDist(), r = resumen(sel), tri = MH.slice(-3), ly = tri.map(m => addM(m, -12)), t = r.d3ly ? r.d3 / r.d3ly - 1 : null;
    return { t: 'Venta real de los últimos 3 meses', v: fC(r.d3), u: 'colones a precio de lista',
      que: `La demanda real de ${rango(tri)} en ${esc(distTxt())}, comparada con los mismos meses del año anterior.`,
      formula: 'Σ productos (piezas vendidas en 3 meses × precio de lista por pieza)',
      filas: [[rango(tri), fC(r.d3)], [rango(ly), fC(r.d3ly)], ['Variación', flecha(t) + fP(t), 1]],
      fuentes: [...new Set(sel.map(p => p.clase))].slice(0, 8).map(fuenteLarga),
      tec: 'productos[].d3 y .d3ly (piezas) × .precioPz', nota: 'Se valora a precio de lista para poder sumar productos distintos; las piezas de cada producto están en su detalle.' };
  },
  k_doh() {
    const sel = selDist(), r = resumen(sel), st = sel.filter(p => p.inv);
    const cl = [...new Set(st.map(p => p.clase))];
    const uk = umbral(S.dist);      // 0.5.1: umbrales de la clase o, con todos los distribuidores, de la selección completa
    return { t: 'Días de inventario en el distribuidor', v: r.doh == null ? 'No aplica' : diasTxt(r.doh) + '', u: r.doh == null ? '' : 'días de venta que cubre el inventario',
      que: r.doh == null ? 'Venta directa o cadenas: no hay inventario de distribuidor.' : `Días que alcanza el inventario al ritmo de venta de los últimos 3 meses completos (${st.length} productos con inventario).`,
      formula: 'piezas en inventario del último corte ÷ (piezas vendidas en los meses completos ÷ (meses × 30,4 días))',
      filas: r.doh == null ? [] : (() => { const x = r.dip || { invPz: r.invPz, ventaPz: r.ventaPz, ventaDiariaPz: r.vdPz };      // 0.4.0: en piezas (diasInventarioPz), no a precio de lista
        const prog = r.progPz > 0 ? [['Pedidos programados (' + r.progOrd.size + ' ' + (r.progOrd.size === 1 ? 'orden' : 'órdenes') + '; no suman días)', fN(r.progPz) + ' pz · ' + fN(r.progCajas) + ' cajas']] : [];
        const comp = r.invTrPz > 0 ? [['En el distribuidor (último corte)', fN(r.invDistPz) + ' pz'], ['En tránsito (órdenes que cuentan)', fN(r.invTrPz) + ' pz'], ['Inventario total', fN(r.invPz) + ' pz']] : [['Inventario', fN(x.invPz) + ' pz']];
        return comp.concat([['Venta de los meses completos de esos productos', fN(x.ventaPz) + ' pz'], ['Meses usados', cl.map(c => esc(c) + ': ' + mesesDoh(c).map(ml).join(', ')).join('<br>')], ['Venta diaria', fN1(x.ventaDiariaPz) + ' pz'], ['Días de inventario', fN(r.doh), 1], ['Valor del inventario a precio de lista', fC(r.inv)]]).concat(prog); })(),
      bi: r.dip ? `<p>Días de la ${S.dist === 'TODOS' ? 'selección completa' : 'clase'} tomados de diasInventarioPz (${fN(r.dip.productos)} productos${r.dip.fecha ? ', corte ' + fechaCorta(r.dip.fecha) : ''}). ${esc((D.diasInventarioPz || {}).regla || '')}</p>` : '<p>Calculado en la página: Σ inventario pz ÷ Σ (venta pz de los meses completos ÷ días), sin precio de lista.</p>',
      fuentes: ['Reporte de inventario de cada distribuidor (inventario unificado), convertido a piezas con la misma regla de unidades que la venta', 'Cortes: ' + (cl.length ? cl.map(c => esc(c) + ' ' + fechaCorta(D.distribuidores[c].invFecha) + ' (' + D.distribuidores[c].invCortes + ' cortes)').join(' · ') : '—')],
      nota: `${r.invTrPz > 0 && reglaTransito() ? 'Tránsito que cuenta: ' + esc(reglaTransito()) + '. ' : ''}${r.progPz > 0 ? PROG_KAM + BI(' Regla completa: ' + esc(reglaProgramados())) + ' ' : ''}${umbralFuente()}${uk.mixto ? ' (promedio ponderado por la venta diaria de cada distribuidor)' : ''}: menos de ${fN(uk.riesgo)} días${KAMN === 'MONICA' ? ' (exportación)' : ''} = riesgo de quiebre; más de ${fN(uk.sobrestock)} = sobrestock; más de ${fN(uk.exceso)} = exceso.` };
  },
  k_sesgo() {
    if (AP) return expAccPm();      // 070-PRECISION: ACC PM con selector de meses; sin accPm (datos viejos), lo de antes
    const sel = selDist(), r = resumen(sel), pk = r.pk;
    if (pk) {      // 0.4.0: el KAM ve la medida principal (acierto trimestral contra el sell in) con su sesgo al lado; métricas, fórmulas, trimestres y regla quedan para BI
      const tab = fs => '<table class="dx-tab"><tbody>' + fs.map(x => `<tr><td>${x[0]}</td><td>${x[1]}</td></tr>`).join('') + '</tbody></table>';
      const v = pkMed(pk), ex = exclTxt(pk);
      return { t: 'Forecast anterior (KAM)', v: aciertoTxt(v, pk.sellInPz), u: aciertoEst(v, pk.sellInPz) === 'ok' ? 'acierto trimestral contra las compras del distribuidor' : '',
        que: `${ml(pk.desde)} – ${ml(pk.hasta)} en ${esc(distTxt())}. ${esc(frasePasado(pk))}.${ex ? ' ' + esc(ex.charAt(0).toUpperCase() + ex.slice(1)) + '.' : ''}`,
        filas: [['Forecast registrado', fN(pk.fcstPz) + ' pz'], ['Compras del distribuidor (sell in)', fN(pk.sellInPz) + ' pz'], ['Venta real (demanda)', fN(pk.realPz) + ' pz'],
          ['Acierto por trimestre', aciertoTxt(v, pk.sellInPz, true), 1], ['Sesgo contra ' + BASE_TXT, ok(pkSes(pk)) ? flecha(pkSes(pk)) + fP(pkSes(pk)) : '—']],
        fuentes: [FUENTE_BHIST, FUENTE_REAL, FUENTE_SI],
        bi: `<p>Ventana ${ml(pk.desde)} – ${ml(pk.hasta)}: ${pk.meses} meses${pk.mesesConForecast != null ? ', ' + pk.mesesConForecast + ' con forecast' : ''}. Medida principal: ${esc((PKP && PKP.texto) || 'acierto trimestral (datos sin precisionKam.principal)')}.</p>`
          + (exclBI(pk) ? '<p>Meses excluidos de los dos lados:</p><ul>' + exclBI(pk) + '</ul>' : '')
          + '<div class="formula">sesgo = Σ forecast ÷ Σ base − 1 · error (WAPE) = Σ |base − forecast| ÷ Σ base · precisión = 1 − Σ |venta real − forecast| ÷ Σ forecast (FCST ACC de Power BI) · acierto trimestral = 1 − Σ |sell in − forecast| ÷ Σ sell in, por producto en bloques fijos de 3 meses (piso 0)</div>'
          + tab([['Sesgo contra la venta', flecha(pk.sesgoReal) + fP(pk.sesgoReal)], ['Error típico (WAPE) contra la venta', ok(pk.wapeReal) ? nf.format(pk.wapeReal * 100) + ' %' : '—'], ['Precisión contra la venta (FCST ACC)', ok(pk.accReal) ? nf.format(pk.accReal * 100) + ' %' : '—'],
            ['Sesgo contra el sell in', flecha(pk.sesgoSellIn) + fP(pk.sesgoSellIn)], ['WAPE contra el sell in', ok(pk.wapeSellIn) ? nf.format(pk.wapeSellIn * 100) + ' %' : '—'], ['Precisión contra el sell in', ok(pk.accSellIn) ? nf.format(pk.accSellIn * 100) + ' %' : '—'], ['Acierto trimestral contra el sell in (valor crudo)', ok(pk.accTrimSellIn) ? nf2.format(pk.accTrimSellIn) : '—']])
          + tablaTrim(pk)
          + ((D.precisionKam || {}).regla ? `<p>${esc(D.precisionKam.regla)}</p>` : ''),
        tec: 'datos.json → precisionKam' + (S.dist === 'TODOS' ? '.total' : '.porClase[' + esc(S.dist) + ']') + ' (en piezas) · principal · trimestres · mesesExcluidosDetalle', nota: 'Referencia de calibración: si el sesgo es positivo de forma recurrente, conviene revisar primero los productos de mayor volumen.' };
    }
    return { t: 'Forecast anterior (KAM) contra la venta', v: fP(r.sesgo), u: 'sesgo, últimos 12 meses cerrados',
      que: `Compara el forecast registrado en el formulario para cada mes (el oficial de ese mes, BHIST) contra la demanda real, de ${rango(r.L12)}. Positivo = forecast por encima de la venta. Solo cuenta meses y productos donde diste forecast.`,
      formula: 'sesgo = Σ forecast ÷ Σ venta real − 1 · precisión = 1 − Σ |venta real − forecast| ÷ Σ forecast (como FCST ACC de Power BI)',
      filas: [['Tu forecast de esos meses', fC(r.kp)], ['Venta real (demanda) de esos meses', fC(r.rl)], ['Sesgo contra la venta', flecha(r.sesgo) + fP(r.sesgo), 1], ['Precisión contra la venta', r.prec == null ? '—' : nf.format(r.prec * 100) + ' %'], ['Referencia: sell in (facturado) de esos meses', fC(r.si)], ['Sesgo contra el sell in', flecha(r.sesgoSI) + fP(r.sesgoSI)]],
      fuentes: [FUENTE_BHIST, FUENTE_REAL, FUENTE_SI],
      tec: 'productos[].kamPasadoPz, .real y .sellIn (piezas) × .precioPz, producto por producto y mes por mes',
      nota: 'Referencia de calibración: si el sesgo es positivo de forma recurrente, conviene revisar primero los productos de mayor volumen. El error se suma producto por producto: un producto por encima no compensa a otro por debajo.' };
  },
  k_curso() {
    const sel = selDist(), r = resumen(sel);
    const fo = (D.formularios || {})[MC];
    return { t: 'Mes en curso: ' + mll(MC), v: fC(r.curso), u: OFICIAL_CURSO ? 'forecast oficial a precio de lista' : 'forecast vigente a precio de lista',
      que: `${esc(mll(MC).replace(/^./, c => c.toUpperCase()))} ya está en curso: su forecast no cambia en esta captura (${rango(MK)}).`,
      filas: r.conAvance ? [['Facturado en ' + ml(MC) + ' hasta el ' + fechaCorta(D.avanceHasta), fC(r.avance)], ['Avance contra el forecast del mes', r.curso ? nf.format(r.avance / r.curso * 100) + ' %' : '—', 1]] : [],
      fuentes: ['Tu formulario oficial de ' + ml(MC)].concat(r.conAvance ? ['Avance: lo que Brinova lleva facturado en el mes'] : []),
      bi: '<ul>' + [fo && fo.archivos && fo.archivos.length ? 'Formularios de la carpeta ' + esc(fo.carpeta) + ': ' + fo.archivos.map(esc).join(', ') : FUENTE_UNID].concat(r.conAvance ? ['Avance: DATA SELL IN (facturación de Brinova) del mes en curso, en piezas × precio de lista'] : []).map(x => `<li>${x}</li>`).join('') + '</ul>',
      tec: 'productos[].codigos[].kam[mes en curso]' + (r.conAvance ? ' · productos[].avanceSellInPz' : ''),
      nota: `Regla del horizonte: el mes en curso queda cerrado para captura; se abren los ${MK.length} meses siguientes. Todo el año sigue cargado y visible como referencia.` };
  },
  p_venta3(ds) {
    const p = PID[ds.p], f = fac(p), tri = MH.slice(-3), t = tend(p);
    return { t: 'Venta 3 meses · ' + p.nombre, v: fN1(p.d3 / f), u: uNom(p),
      que: `Demanda real de ${rango(tri)} en ${esc(p.clase)} (${esc(fuenteTxt(p.clase))}).`,
      formula: 'Σ venta real de los 3 meses cerrados más recientes',
      filas: tri.map(m => [ml(m), fN1((p.real[m] || 0) / f)]).concat([['Total', fN1(p.d3 / f), 1], ['Mismos meses del año anterior', fN1(p.d3ly / f)], ['Variación', flecha(t) + fP(t)]]),
      fuentes: [fuenteLarga(p.clase)], tec: `productos[].real (piezas) ÷ ${fN(f)} pz por ${S.unidad === 'pz' ? 'pieza' : String(presDe(p.princ) || 'unidad').toLowerCase()}` };
  },
  p_inv(ds) {
    const p = PID[ds.p], f = fac(p), i = p.inv;
    if (!i) return { t: 'Inventario · ' + p.nombre, v: 'No aplica', u: '', que: tipoDe(p.clase) === 'sell in directo' ? 'Venta directa de Brinova: no hay inventario de distribuidor.' : tipoDe(p.clase) === 'sell out' ? 'La cadena no envía inventario a BI.' : 'El distribuidor no ha enviado inventario de este producto.' };
    const vd = dias(p) == null ? 0 : ventaDoh(p) / diasDoh(p), e = estInv(dias(p), p.clase), up = umbral(p.clase);
    const ip = invPartes(p);
    return { t: 'Inventario y días · ' + p.nombre, v: fN1(ip.tot / f) + ' ' + uNom(p), u: ip.tr ? 'distribuidor al ' + fechaCorta(i.fecha) + ' + en tránsito' : 'al ' + fechaCorta(i.fecha),
      que: ip.tr ? `Inventario de ${esc(p.clase)} en su último corte más lo que viene en camino (órdenes en tránsito que cuentan), y cuántos días le alcanza.` : `Inventario de ${esc(p.clase)} en su último corte y cuántos días le alcanza.`,
      formula: 'días = inventario ÷ (venta de los meses completos ÷ (meses × 30,4 días))',
      filas: (ip.tr ? [['En el distribuidor (corte ' + fechaCorta(i.fecha) + ')', fN(ip.dist) + ' pz'], ['En tránsito (' + ip.ordenes.length + ' ' + (ip.ordenes.length === 1 ? 'orden' : 'órdenes') + ')', fN(ip.tr) + ' pz'], ['Inventario total', fN(ip.tot) + ' pz', 1]] : [['Inventario (piezas)', fN(ip.tot) + ' pz']]).concat([['Venta de ' + mesesDoh(p.clase).map(ml).join(', ') + ' (piezas)', fN(ventaDoh(p)) + ' pz'], ['Venta diaria', nf1.format(vd) + ' pz por día'], ['Días de inventario', dias(p) == null ? 'sin venta reciente' : fN(dias(p)), 1], ['Días según el propio reporte del distribuidor', i.dohFuente == null ? '—' : fN(i.dohFuente)]]).concat(progDe(p) ? [['Pedidos programados (no suman días)', fN(progDe(p).pz) + ' pz · ' + fN(progDe(p).cajas) + ' cajas']] : []),
      bi: tablaOrdenes(p) + (reglaTransito() ? `<p>Regla del tránsito: ${esc(reglaTransito())}</p>` : '') + (progDe(p) && reglaProgramados() ? `<p>Regla de pedidos programados: ${esc(reglaProgramados())}</p>` : ''),
      fuentes: [`Reporte de inventario de ${esc(p.clase)} (${(D.distribuidores[p.clase] || {}).invCortes || 0} cortes; último ${fechaCorta(i.fecha)}), convertido a piezas con la regla de unidades del cluster`],
      tec: 'productos[].inv.pz / pzDistribuidor / pzTransito / pzTotal, .inv.hist, productos[].transito', nota: `${ip.tr && reglaTransito() ? 'Tránsito que cuenta: ' + esc(reglaTransito()) + ' ' : ''}Estado: ${e ? e[1] : 'sin dato'}. Umbrales${UMB ? ' de ' + esc(p.clase) + BI(' (' + esc(UMB.fuente || 'MAESTROS.xlsx › T_DOH_OBJETIVO') + ')') : ''}: menos de ${fN(up.riesgo)} días riesgo de quiebre, más de ${fN(up.sobrestock)} sobrestock, más de ${fN(up.exceso)} exceso.` };
  },
  p_alg(ds) {
    const p = PID[ds.p], f = fac(p);
    return { t: 'Algoritmo · ' + p.nombre, v: fN1(algPz6(p) / f), u: uNom(p) + ' en ' + rango(MK),
      que: 'Suma de lo que propone el algoritmo para los meses de captura (todas las presentaciones del producto).',
      formula: 'Σ meses de captura de (base mensual × índice de temporada), con las reglas de intermitentes y de 6 meses sin venta',
      filas: MK.map(m => [ml(m), fN1((p.alg[m] || 0) / f)]).concat([['Total', fN1(algPz6(p) / f), 1], ['Valor a precio de lista', fC(pv(p, algPz6(p)))]]),
      fuentes: [FUENTE_ALG], tec: 'productos[].alg (piezas) · por código en productos[].codigos[].calc' };
  },
  p_kam(ds) {
    const p = PID[ds.p], f = fac(p), d = dif(p);
    return { t: 'Tu forecast · ' + p.nombre, v: fN1(kamPz6(p) / f), u: uNom(p) + ' en ' + rango(MK),
      que: 'Suma de tus unidades en los meses de captura, de todos los códigos del producto, convertidas a una sola unidad.',
      formula: 'Σ códigos y meses de (unidades del código × piezas por unidad) ÷ piezas de la unidad mostrada',
      filas: p.codigos.filter(c => MK.some(m => kamU(c, m))).map(c => { const u = MK.reduce((a, m) => a + kamU(c, m), 0); return [esc(c.cod) + ' · ' + esc(cNom(c)), fN(u) + ' ' + esc(plural(presDe(c))) + ' × ' + fN(c.pzPorU) + ' = ' + fN(u * (c.pzPorU || 0)) + ' pz']; })
        .concat([['Total', fN(kamPz6(p)) + ' pz = ' + fN1(kamPz6(p) / f) + ' ' + uNom(p), 1], ['Contra el algoritmo', flecha(d) + fP(d)], ['Valor a precio de lista', fC(kamValM(p, MK))]]),
      fuentes: [FUENTE_UNID, FUENTE_PRECIO], tec: 'productos[].codigos[].kam + captura; piezas por código = codigos[].pzPorU (T_SKU · UNIDAD DE EMPAQUE)' };
  },
  p_cierre(ds) {
    const p = PID[ds.p], f = fac(p), r = p.s12 ? p.d12 / p.s12 : null;
    return { t: 'Cierre de 12 meses · ' + p.nombre, v: p.cierre === 'OK' ? 'Cuadra' : p.cierre.toLowerCase(), u: '',
      que: tipoDe(p.clase) === 'sell in directo' ? 'Aquí la demanda es lo que Brinova facturó: la razón contra el sell in siempre da 1.' : 'En 12 meses, lo que el cliente vendió debería parecerse a lo que Brinova le facturó. Si no, puede haber un problema de unidades o de código.',
      formula: 'razón = demanda 12 meses ÷ sell in 12 meses · fuera de 0,6–1,6 (con 600 pz o más) = revisar',
      filas: [['Demanda 12 meses', fN(p.d12) + ' pz = ' + fN1(p.d12 / f) + ' ' + uNom(p)], ['Sell in 12 meses (facturado)', fN(p.s12) + ' pz = ' + fN1(p.s12 / f) + ' ' + uNom(p)], ['Razón', r == null ? '—' : nf2.format(r), 1]],
      fuentes: [fuenteLarga(p.clase), FUENTE_SI_PZ], tec: 'productos[].d12, .s12, .cierre' };
  },
  p_unidad(ds) {
    const p = PID[ds.p];
    return { t: 'Unidades de ' + p.nombre, v: '1 ' + String(presDe(p.princ) || 'unidad').toLowerCase() + ' = ' + fN(p.uPz) + ' pz', u: 'código principal ' + p.principal,
      que: 'Un producto puede tener varios códigos (unidad, caja, pack). Brinova factura uno y el distribuidor puede reportar otro; por eso todo se suma en <b>piezas</b> (la unidad estándar: 1 alambrina, 1 esponja) y se muestra en la presentación de tu formulario.',
      filas: p.codigos.map(c => ['<b>' + esc(descB(c)) + '</b>' + nombreDist(p, c) + '<br><span class="small muted">' + esc(c.cod) + '</span>', esc(cNom(c)) + (c.cod === p.principal ? ' · principal' : '') + (c.captura ? ' · se captura' : '') + (c.pzBfcst != null && c.pzPorU && c.pzBfcst !== c.pzPorU ? ' · ⚠ Power BI usa ' + fN(c.pzBfcst) + ' pz' : '')]),
      fuentes: ['Piezas por caja o pack de cada código: el maestro de productos de Brinova', 'Presentación: la de tu formulario', 'Código principal = el que más usas en tu formulario o en compras'],
      bi: '<ul><li>Piezas por unidad de venta de cada código: T_SKU (UNIDAD DE EMPAQUE)</li><li>Presentación: la de tu formulario (TIPO de BFCST) o T_SKU (NIVEL_PRESENTACION)</li></ul>'
        + (p.codigos.some(c => c.pzBfcst != null && c.pzPorU && c.pzBfcst !== c.pzPorU) ? '<p class="aviso info">Hay un código con un factor distinto en Power BI (BFCST.UESTANDAR) que en este portal (T_SKU). BI lo está revisando; mientras tanto el portal usa T_SKU.</p>' : ''),
      tec: 'productos[].codigos[].pzPorU, .pres, .tipo, .pzBfcst · productos[].uPz',
      nota: p.codigos.some(c => c.pzBfcst != null && c.pzPorU && c.pzBfcst !== c.pzPorU) ? 'Un código tiene un factor de piezas en revisión por BI.' : '' };
  },
  cel(ds) {
    const { p, c } = LINES[ds.c], m = ds.m, e = estadoMes(m), u = c.pzPorU || 1, aa = addM(m, -12), pc = c.cod === p.principal, un = esc(plural(presDe(c)));
    const fo = (D.formularios || {})[m], sinForm = CAL && (CAL.mesesSinFormulario || []).includes(m);
    const filas = [['Estado del mes', EST[e]], ['Forecast vigente (' + (e === 'curso' && OFICIAL_CURSO ? 'oficial' : 'formulario') + ')', sinForm ? 'sin formulario previo: parte de 0' : vig(c, m) == null ? 'no viene en el formulario' : fN(vig(c, m)) + ' ' + un + (fo ? BI(' · carpeta ' + esc(fo.carpeta)) : '')]];
    if (e === 'abierto') filas.push(['Tu valor ahora', fN(kamU(c, m)) + ' ' + un + (editado(c, m) ? ' (cambiado)' : ''), 1]);
    filas.push(['Algoritmo del producto, en esta unidad', pc && c.pzPorU ? fN1((p.alg[m] || 0) / u) + ' ' + un : 'se muestra en el código principal ' + esc(p.principal)]);
    if (c.calc && c.calc.fc && c.calc.fc[m] != null && !pc) filas.push(['Algoritmo de este código', fN1(c.calc.fc[m] / u) + ' ' + un]);
    filas.push(['Venta real ' + ml(aa) + ' (todo el producto)', fN1((p.real[aa] || 0) / u) + ' ' + un]);
    const s = siU(p, c, aa); filas.push(['Sell in ' + ml(aa), s == null ? '—' : fN1(s) + ' ' + un]);
    if (c.kamPasado && c.kamPasado[aa] != null) filas.push(['Forecast registrado para ' + ml(aa), fN(c.kamPasado[aa]) + ' ' + un]);
    const pr = precioU(p, c), q = e === 'abierto' ? kamU(c, m) : (vig(c, m) || 0);
    filas.push(['Precio de lista', fC2(pr)], ['Valor', fC(q * (pr || 0))]);
    return { t: c.cod + ' · ' + mll(m), v: fN(q) + ' ' + plural(presDe(c)), u: cNom(c) + ' = ' + fN(q * u) + ' pz',
      que: esc(c.desc) + ' · ' + esc(p.clase), filas, fuentes: [FUENTE_UNID, FUENTE_ALG, fuenteLarga(p.clase)],
      tec: 'codigos[].kam, productos[].alg, productos[].real, codigos[].kamPasado, codigos[].precio' };
  },
  version() {
    const filas = filasVersion();
    return { t: 'Fecha de los datos', v: D.generado || '—', u: D.versionDatos && D.versionDatos.sello ? 'corrida ' + D.versionDatos.sello : 'generado',
      que: `Datos reales hasta <b>${mll(D.corte)}</b>. Ciclo ${mll(D.ciclo)}.`,
      bi: filas.length ? '<p>Fecha de modificación de cada archivo que usó la corrida (versionDatos):</p><table class="dx-tab"><tbody>' + filas.map(f => `<tr><td>${f[0]}</td><td>${f[1]}</td></tr>`).join('') + '</tbody></table>'
        : '<p>Esta versión de datos.json no trae la fecha de cada fuente; llega con la próxima carga.</p>',
      tec: 'datos.json → generado, corte, versionDatos' };
  },
};

/* ---------- gráfico mensual (SVG propio, un solo eje, crucero + teclado + tabla) ---------- */
const COL = { real: '#149CDC', alg: '#6250D6', kam: '#D9661A', si: '#C2CCD4', inv: '#8FA1B0' };   // validado (dataviz validate_palette, modo claro; sell in = contexto gris con tabla)
let gid = 0;
const ro = new ResizeObserver(es => es.forEach(e => { const el = e.target; if (el._o && Math.abs((el._w || 0) - e.contentRect.width) > 2) dibujar(el); }));
function grafico(el, o) { if (!el) return; el._o = o; if (!el._obs) { ro.observe(el); el._obs = true; el.tabIndex = 0; } dibujar(el); }
function pasoEje(max, n = 4) { if (max <= 0) return 1; const raw = max / n, e = Math.pow(10, Math.floor(Math.log10(raw))); for (const f of [1, 2, 5, 10]) if (f * e >= raw) return f * e; return 10 * e; }
const valS = (s, m) => { const v = s.data[m]; return ok(v) ? v : null; };
/* eje X mensual (0.4.0): una marca por mes; texto "ene" si cabe, si no la inicial (E F M …); con muy poco espacio, solo abr, jul, oct y dic (enero lo marca la fila del año).
   Debajo, el año al inicio de cada año y una línea separadora entre diciembre y enero. */
const INI = ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
const anchoTxt = (s, px = 11.5) => String(s).length * px * 0.55;
function ejeMeses(ms, { x, L, bw, T, H, B }) {
  const y0 = H - B, modo = bw >= 30 ? 3 : bw >= 9 ? 1 : 0;
  let g = '';
  ms.forEach((m, i) => {
    const mo = +m.slice(5, 7) - 1, xx = x(i).toFixed(1);
    g += `<line x1="${xx}" x2="${xx}" y1="${y0}" y2="${y0 + 4}" stroke="#C9D1D8"/>`;
    const lab = modo === 3 ? MES[mo] : (modo === 1 || [3, 6, 9, 11].includes(mo)) ? INI[mo] : '';
    if (lab) g += `<text x="${xx}" y="${y0 + 16}" text-anchor="middle"${mo === 11 ? ' class="dic"' : ''}>${lab}</text>`;
    if (mo === 0 || i === 0) {
      const xs = L + bw * i, cabe = mo === 0 || (12 - mo) * bw >= anchoTxt('2026') + 6;
      if (i > 0) g += `<line x1="${xs.toFixed(1)}" x2="${xs.toFixed(1)}" y1="${T - 16}" y2="${y0 + 34}" stroke="#AEB9C2" stroke-width="1"/>`;
      if (cabe) g += `<text x="${(xs + 3).toFixed(1)}" y="${y0 + 33}" style="font-weight:600;fill:var(--ink-2)">${m.slice(0, 4)}</text>`;
    }
  });
  return g;
}
/* marcas del horizonte: fin de la venta real (después de D.corte) y fin del forecast (último de mesesFc) */
function marcasHorizonte(ms, { L, bw, T, H, B, W, R }) {
  const ic = ms.indexOf(D.corte), iu = ms.indexOf(ULT_MF), y1 = 4, y2 = H - B;
  let g = '', finIzq = -1;
  if (ic >= 0) {
    const xb = L + bw * (ic + 1), t = (W < 600 ? 'venta real: ' : 'última venta real: ') + ml(D.corte), w = anchoTxt(t);      // 0.7.0: texto corto en celular
    g += `<line x1="${xb.toFixed(1)}" x2="${xb.toFixed(1)}" y1="${y1}" y2="${y2}" stroke="#46535C" stroke-width="1.5"/>`;
    const ancla = xb - 5 - w >= L ? 'end' : 'start', tx = ancla === 'end' ? xb - 5 : xb + 5;
    g += `<text x="${tx.toFixed(1)}" y="13" text-anchor="${ancla}" class="mk">${esc(t)}</text>`;
    finIzq = ancla === 'end' ? xb : xb + 5 + w;
  }
  if (iu >= 0) {
    const xe = Math.min(L + bw * (iu + 1), W - R), largo = (W < 600 ? 'pronóstico: ' : 'último mes pronosticado: ') + ml(ULT_MF), corto = (W < 600 ? 'fcst: ' : 'último pronóstico: ') + ml(ULT_MF);
    const t = xe - 5 - anchoTxt(largo) > finIzq + 8 ? largo : corto, fila = xe - 5 - anchoTxt(t) > finIzq + 8 ? 13 : 26;
    g += `<line x1="${xe.toFixed(1)}" x2="${xe.toFixed(1)}" y1="${y1}" y2="${y2}" stroke="#46535C" stroke-width="1.5" stroke-dasharray="4 3"/>`;
    g += `<text x="${(xe - 5).toFixed(1)}" y="${fila}" text-anchor="end" class="mk">${esc(t)}</text>`;
  }
  return g;
}
function dibujar(el) {
  const o = el._o; if (!o || !el.isConnected) return;
  const W = Math.max(280, Math.round(el.clientWidth || 640)); el._w = W;
  /* 0.4.0: eje con TODOS los meses (marca por mes; texto de 3 letras o de 1 letra si no cabe), fila de años con separador,
     y marcas "última venta real" y "último mes pronosticado" (solo en gráficos con estados) */
  const marcas = !!o.estados && !o.dias;
  const H = o.h || (marcas ? 300 : 260), L = o.izq || 56, R = 10, T = marcas ? 40 : 22, B = o.dias ? 26 : 44, ms = o.meses, n = ms.length, bw = (W - L - R) / n, id = 'g' + (++gid);
  let mx = 0; o.series.forEach(s => ms.forEach(m => { const v = valS(s, m); if (v != null && v > mx) mx = v; }));
  const st = pasoEje(mx * 1.05), top = Math.max(st, Math.ceil((mx * 1.05) / st) * st);
  const y = v => T + (H - T - B) * (1 - v / top), x = i => L + bw * (i + 0.5);
  let g = `<defs><pattern id="${id}h" width="6" height="6" patternTransform="rotate(45)" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#F3F5F7"/><line x1="0" y1="0" x2="0" y2="6" stroke="#E1E6EA" stroke-width="2"/></pattern></defs>`;
  if (o.estados) {      // bandas: mes en curso (rayado) y meses de captura (tinte)
    let i = 0;
    while (i < n) {
      const e = estadoMes(ms[i]); let j = i; while (j + 1 < n && estadoMes(ms[j + 1]) === e) j++;
      if (e === 'curso' || e === 'abierto') {
        const x0 = L + bw * i, w = bw * (j - i + 1);
        g += `<rect x="${x0.toFixed(1)}" y="${T - 16}" width="${w.toFixed(1)}" height="${H - B - T + 16}" fill="${e === 'curso' ? `url(#${id}h)` : '#E8F5FC'}"/>`;
        if (w >= 54 && W >= 600) g += `<text x="${(x0 + 4).toFixed(1)}" y="${T - 5}" class="mk">${e === 'curso' ? 'en curso' : 'captura'}</text>`;      // 0.7.0: en celular la leyenda ya nombra la banda; el rótulo se encimaba con las marcas
      }
      i = j + 1;
    }
  }
  for (let v = 0; v <= top + 1e-9; v += st) {
    const yy = y(v).toFixed(1);
    g += `<line x1="${L}" x2="${W - R}" y1="${yy}" y2="${yy}" stroke="${v ? '#E3E8EC' : '#C9D1D8'}" stroke-width="1"/><text x="${L - 6}" y="${(+yy + 4).toFixed(1)}" text-anchor="end">${esc(o.eje(v))}</text>`;
  }
  if (o.dias) { const k = [1, 2, 5, 7, 10].find(s => s * bw >= 26) || 10; ms.forEach((m, i) => { if (i % k === 0) g += `<text x="${x(i).toFixed(1)}" y="${H - 8}" text-anchor="middle">${+m.slice(8, 10)}</text>`; }); }
  else g += ejeMeses(ms, { x, L, bw, T, H, B });
  if (marcas) g += marcasHorizonte(ms, { L, bw, T, H, B, W, R });
  (o.incompletos || []).forEach(m => { const i = ms.indexOf(m); if (i >= 0) g += `<path d="M${(x(i) - 5).toFixed(1)} ${H - B + 9} L${(x(i) + 5).toFixed(1)} ${H - B + 9} L${x(i).toFixed(1)} ${H - B + 1}Z" fill="#D99A22"><title>Mes incompleto</title></path>`; });
  o.series.filter(s => s.tipo === 'col').forEach(s => {
    const w = Math.max(2, Math.min(bw * 0.6, 16)), r = Math.min(3, w / 2);
    ms.forEach((m, i) => { const v = valS(s, m); if (!v || v <= 0) return; const x0 = x(i) - w / 2, y0 = y(v), yb = y(0), rr = Math.min(r, yb - y0);
      g += `<path d="M${x0.toFixed(1)} ${yb.toFixed(1)}V${(y0 + rr).toFixed(1)}Q${x0.toFixed(1)} ${y0.toFixed(1)} ${(x0 + rr).toFixed(1)} ${y0.toFixed(1)}H${(x0 + w - rr).toFixed(1)}Q${(x0 + w).toFixed(1)} ${y0.toFixed(1)} ${(x0 + w).toFixed(1)} ${(y0 + rr).toFixed(1)}V${yb.toFixed(1)}Z" fill="${s.color}"/>`; });
  });
  o.series.filter(s => s.tipo === 'line' || s.tipo === 'dash' || s.tipo === 'lm').forEach(s => {
    let d = '', prev = false;
    ms.forEach((m, i) => { const v = valS(s, m); if (v == null) { prev = false; return; } d += (prev ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1); prev = true; });
    g += `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"${s.tipo === 'dash' ? ' stroke-dasharray="6 4"' : ''}/>`;
    if (s.tipo === 'lm') ms.forEach((m, i) => { const v = valS(s, m); if (v != null) g += `<circle cx="${x(i).toFixed(1)}" cy="${y(v).toFixed(1)}" r="4" fill="${s.color}" stroke="#fff" stroke-width="2"/>`; });
  });
  o.series.filter(s => s.tipo === 'ring').forEach(s => ms.forEach((m, i) => { const v = valS(s, m); if (v != null && v > 0) g += `<circle cx="${x(i).toFixed(1)}" cy="${y(v).toFixed(1)}" r="4" fill="#fff" stroke="${s.color}" stroke-width="2"/>`; }));
  g += `<line class="cruz" x1="0" x2="0" y1="${T - 16}" y2="${H - B}" stroke="#14232C" stroke-width="1" visibility="hidden"/>`;
  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" height="${H}" role="img" aria-label="${esc((o.titulo || 'Gráfico mensual') + '. Usa las flechas para recorrer los meses; el botón Ver tabla muestra los mismos datos.')}">${g}</svg><div class="tip" hidden></div>`;
  const svg = el.firstChild, tip = el.lastChild, cruz = svg.querySelector('.cruz');
  const mostrar = i => {
    i = Math.max(0, Math.min(n - 1, i)); el._i = i; const m = ms[i];
    cruz.setAttribute('x1', x(i)); cruz.setAttribute('x2', x(i)); cruz.setAttribute('visibility', 'visible');
    tip.textContent = '';
    const t = document.createElement('div'); t.className = 't'; t.textContent = o.dias ? fechaCorta(m) : mll(m); tip.appendChild(t);
    let hay = 0;
    o.series.forEach(s => { const v = valS(s, m); if (v == null || (s.tipo === 'col' && !v)) return; hay++;
      const r = document.createElement('div'); r.className = 'r';
      const k = document.createElement('i'); k.className = 'sw ' + (s.tipo === 'dash' ? 'dash' : s.tipo === 'col' ? 'col' : s.tipo === 'ring' ? 'dot' : '');
      k.style[s.tipo === 'col' ? 'background' : s.tipo === 'ring' ? 'borderColor' : 'borderTopColor'] = s.color;
      const a = document.createElement('span'); a.textContent = s.nombre; const b = document.createElement('b'); b.textContent = o.tip(v); r.append(k, a, b); tip.appendChild(r); });
    if (!hay) { const r = document.createElement('div'); r.className = 'r'; r.textContent = 'Sin datos'; tip.appendChild(r); }
    if (o.estados && m > D.corte) { const e = document.createElement('div'); e.className = 'st'; e.textContent = EST[estadoMes(m)]; tip.appendChild(e); }
    if ((o.incompletos || []).includes(m)) { const e = document.createElement('div'); e.className = 'st'; e.textContent = 'Mes incompleto: el cliente no reportó el mes completo; tómalo con cuidado'; tip.appendChild(e); }
    if ((o.exclKam || []).includes(m)) { const e = document.createElement('div'); e.className = 'st'; e.textContent = 'El forecast de este mes se excluye de la medición del forecast anterior: el formulario venía en 0'; tip.appendChild(e); }
    tip.hidden = false;
    const rw = svg.getBoundingClientRect().width || W, px = x(i) * rw / W, tw = tip.offsetWidth || 200;
    tip.style.left = Math.max(0, px + 14 + tw > rw ? px - tw - 14 : px + 14) + 'px'; tip.style.top = '4px';
  };
  const ocultar = () => { tip.hidden = true; cruz.setAttribute('visibility', 'hidden'); };
  const porX = ev => { const r = svg.getBoundingClientRect(); mostrar(Math.floor(((ev.clientX - r.left) * W / r.width - L) / bw)); };
  svg.addEventListener('pointermove', porX); svg.addEventListener('pointerdown', porX);
  svg.addEventListener('pointerleave', ocultar);
  el.onkeydown = ev => { if (ev.key === 'ArrowRight' || ev.key === 'ArrowLeft') { ev.preventDefault(); mostrar((el._i ?? n - 1) + (ev.key === 'ArrowRight' ? 1 : -1)); } if (ev.key === 'Escape') ocultar(); };
  el.onfocus = () => mostrar(el._i ?? Math.max(0, ms.indexOf(D.corte)));
  el.onblur = ocultar;
}
function leyenda(series, conBandas) {
  return series.map(s => `<span><i class="sw ${s.tipo === 'dash' ? 'dash' : s.tipo === 'col' ? 'col' : s.tipo === 'ring' ? 'dot' : s.tipo === 'lm' ? 'lm' : ''}" style="${s.tipo === 'col' ? 'background' : s.tipo === 'ring' ? 'border-color' : 'border-top-color'}:${s.color};color:${s.color}"></i>${esc(s.nombre)}</span>`).join('')
    + (conBandas ? `<span><i class="sw band" style="background:repeating-linear-gradient(135deg,#F1F3F5 0 3px,#E2E7EB 3px 5px)"></i>${esc(ml(MC))} en curso</span><span><i class="sw band" style="background:#E8F5FC;border-color:#149CDC"></i>captura ${esc(rango(MK))}</span>` : '');      // 0.6.0: "última venta real" y "último mes pronosticado" ya están rotulados dentro del gráfico
}
function tablaSeries(o) {
  const ms = o.meses.filter(m => o.series.some(s => ok(s.data[m]) && s.data[m] !== 0));
  return `<div class="tw" role="region" tabindex="0" aria-label="Tabla del gráfico" style="max-height:340px;margin-top:10px"><table class="tbl"><thead><tr><th class="l">Mes</th>${o.series.map(s => `<th>${esc(s.nombre)}</th>`).join('')}<th class="l">Estado</th></tr></thead><tbody>` +
    ms.map(m => `<tr><td class="l">${ml(m)}${(o.incompletos || []).includes(m) ? ' ▲ incompleto' : ''}${(o.exclKam || []).includes(m) ? ' · forecast excluido de la medición' : ''}</td>${o.series.map(s => `<td>${ok(s.data[m]) ? esc(o.tip(s.data[m])) : '—'}</td>`).join('')}<td class="l">${EST_C[estadoMes(m)]}</td></tr>`).join('') + '</tbody></table></div>';
}
/* series estándar: selección en colones, o un producto en su unidad */
function seriesDe(sel, p) {
  const f = p ? fac(p) : 1, conv = (q, pp) => p ? (q || 0) / f : pv(pp, q);
  const agg = (fn, ms) => { const o = {}; ms.forEach(m => { o[m] = sel.reduce((a, pp) => a + fn(pp, m), 0); }); return o; };
  const conSI = sel.some(pp => tipoDe(pp.clase) !== 'sell in directo');
  const pas = MH.filter(m => m >= '2025-01'), kamMs = MV.filter(m => MF.includes(m) || m === MC);
  const s = [];
  if (conSI) s.push({ nombre: 'Sell in (facturado por Brinova)', tipo: 'col', color: COL.si, data: agg((pp, m) => conv(pp.sellIn[m], pp), MH) });
  s.push({ nombre: 'Venta real (demanda)', tipo: 'line', color: COL.real, data: agg((pp, m) => conv(pp.real[m], pp), MH) });
  const kp = agg((pp, m) => conv(pp.kamPasadoPz && pp.kamPasadoPz[m], pp), pas); Object.keys(kp).forEach(k => { if (!kp[k]) delete kp[k]; });
  s.push({ nombre: 'Forecast registrado (ciclos anteriores)', tipo: 'ring', color: COL.kam, data: kp });
  s.push({ nombre: 'Algoritmo', tipo: 'dash', color: COL.alg, data: agg((pp, m) => conv(pp.alg[m], pp), MF) });
  s.push({ nombre: 'Forecast KAM vigente (con ajustes)', tipo: 'lm', color: COL.kam, data: agg((pp, m) => p ? kamPz(pp, m) / f : kamVal(pp, m), kamMs) });
  s.forEach(x => { if (!x.key) x.key = SER_KEY[x.tipo] || x.nombre; });      // 070-GRAFICO: clave estable para prender/apagar la serie
  return s;
}
const SER_KEY = { col: 'si', line: 'real', ring: 'kp', dash: 'alg', lm: 'kam' };
/* 070-GRAFICO · unidad para sumar productos (varios distribuidores): la presentación común si todos traen la misma; si cambian (caja de 24 y de 48), piezas. Nunca cajas de tamaños distintos. */
function unidadGraf(ps) {
  const us = [...new Set(ps.map(p => p.uPz || 1))], mixto = us.length > 1;
  if (S.unidad !== 'pz' && !mixto && us[0] > 1) return { f: us[0], nom: uNom(ps[0]), mixto: false };
  return { f: 1, nom: 'piezas', mixto };
}
const mesesGraf = () => MH.concat(MF.filter(m => !MH.includes(m))).filter(m => m >= S.desde);
function spark(p) {
  const a = MH.slice(-12).map(m => p.real[m] || 0), b = MF.map(m => p.alg[m] || 0), all = a.concat(b);   // 0.4.0: todo el horizonte del algoritmo
  const mx = Math.max(...all, 1), W = 120, H = 30, n = all.length, x = i => 2 + i * (W - 4) / (n - 1), y = v => H - 3 - (H - 6) * v / mx;
  const pa = a.map((v, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1)).join('');
  const pb = [a.length - 1].concat(b.map((_, j) => a.length + j)).map((i, k) => (k ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(all[i]).toFixed(1)).join('');
  return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-hidden="true"><line x1="2" x2="${W - 2}" y1="${H - 3}" y2="${H - 3}" stroke="#E3E8EC"/><path d="${pa}" fill="none" stroke="${COL.real}" stroke-width="1.6"/><path d="${pb}" fill="none" stroke="${COL.alg}" stroke-width="1.6" stroke-dasharray="3 3"/></svg>`;
}

/* ---------- encabezado y filtros ---------- */
function pintarEncabezado() {
  $('#t-kam').textContent = D.kam;
  /* 0.6.0: arriba solo una línea corta; la fecha de los datos queda para BI */
  $('#t-ciclo').innerHTML = `Captura <b>${esc(rango(MK))}</b>${CAP_HASTA ? ` · cierra <b>${esc(fechaCorta(CAP_HASTA).slice(0, 5))}</b>` : ''}${VENCIDO ? ' · <b>captura cerrada</b>' : ''}`
    + BI(` · ${nb('version', 'datos del ' + esc(D.generado || '—'))}${CAL && CAL.forzado ? ' · ciclo fijado por BI' : ''}`);
  const n = c => P.filter(p => c === 'TODOS' || p.clase === c).length;
  $('#f-dist').innerHTML = ['TODOS'].concat(D.clases).map(c =>
    `<button type="button" data-d="${esc(c)}" aria-pressed="${S.dist === c}">${c === 'TODOS' ? 'Todos' : esc(c)}<span class="c">${n(c)}</span></button>`).join('');
  const cats = [...new Set(P.map(p => p.cat).filter(Boolean))].sort();
  $('#f-cat').innerHTML = '<option value="">Todas las categorías</option>' + cats.map(c => `<option${c === S.cat ? ' selected' : ''}>${esc(c)}</option>`).join('');
  const ch = [['todos', 'Todos'], ['alerta', 'Con alerta'], ['invbajo', 'Riesgo de quiebre'], ['invalto', 'Sobrestock o exceso'], ['dif', 'Lejos del algoritmo'], ['cae', 'Venta cayendo'], ['aviso', 'Con aviso de captura']];
  $('#chips').innerHTML = ch.map(([k, t]) => `<button type="button" class="chip" data-chip="${k}" aria-pressed="${S.chip === k}">${t}</button>`).join('');
  const ch2 = [['todos', 'Todos'], ['editados', 'Que cambié'], ['dif', 'Lejos del algoritmo'], ['aviso', 'Con aviso']];
  $('#chips2').innerHTML = ch2.map(([k, t]) => `<button type="button" class="chip" data-chip2="${k}" aria-pressed="${S.chip2 === k}">${t}</button>`).join('');
  $('#f-capv').innerHTML = [['abiertos', 'Meses de captura'], ['curso', '+ mes en curso'], ['todo', 'Todo el año']].map(([k, t]) => `<button type="button" data-capv="${k}" aria-pressed="${S.capVista === k}">${t}</button>`).join('');
  document.querySelectorAll('#f-unidad button').forEach(b => b.setAttribute('aria-pressed', b.dataset.u === S.unidad));
  const t3 = $('#tab-c3'); if (t3) t3.hidden = !conExportacion();      // 0.5.0: vista 3D solo para exportación
  const bk = $('#b-comokam'); if (bk) { const on = document.body.classList.contains('como-kam'); bk.setAttribute('aria-pressed', on); }
}
const enDist = p => S.dist === 'TODOS' || p.clase === S.dist;
const textoP = p => p.txt;
function pasaChip(p, k) {
  if (k === 'alerta') return alertas(p).length > 0;
  if (k === 'invbajo') { const e = estInv(dias(p), p.clase); return !!e && e[0] === 'bad'; }
  if (k === 'invalto') return dias(p) != null && dias(p) > umbral(p.clase).sobrestock;      // 0.5.1: sobrestock de la clase
  if (k === 'dif') { const d = dif(p); return d != null && Math.abs(d) > 0.5; }
  if (k === 'cae') { const t = tend(p); return t != null && t <= -0.1; }
  if (k === 'editados') return p.codigos.some(c => MK.some(m => editado(c, m)));
  if (k === 'aviso') return avisosFuertes(p).length > 0;      // las notas grises (solo más de 3 × el algoritmo) no cuentan como aviso
  return true;
}
const filtrados = () => { const q = S.q.trim().toLowerCase(); return P.filter(p => enDist(p) && (!S.cat || p.cat === S.cat) && (!q || p.txt.includes(q)) && pasaChip(p, S.chip)); };

/* ---------- horizonte del ciclo ---------- */
function tiraHorizonte(desde, hasta) {
  const ms = []; for (let m = desde; m <= hasta; m = addM(m, 1)) ms.push(m);
  /* 0.4.0: llega hasta el último mes pronosticado; marca el último mes con venta real y el último pronosticado */
  return `<div class="tira" role="list" aria-label="Estado de cada mes">${ms.map(m => { const e = estadoMes(m), fin = m === D.corte ? 'última venta real' : m === ULT_MF ? 'último pronosticado' : '';
    return `<div class="mes-e ${e}${fin ? ' fin' : ''}${m.slice(5, 7) === '01' && m !== desde ? ' anio' : ''}" role="listitem" title="${esc(mll(m) + ': ' + EST[e] + (fin ? ' · ' + fin : ''))}"><b>${ml(m)}</b><span>${e === 'curso' ? ICO.lock : ''}${fin || EST_C[e]}</span></div>`; }).join('')}</div>`;
}
function pintarHorizonte() {      // 0.6.0: una línea (mes en curso y avance) + la tira; la captura ya está en el encabezado
  const sel = P.filter(enDist), r = resumen(sel);
  const av = r.conAvance ? ` · facturado al ${esc(fechaCorta(D.avanceHasta).slice(0, 5))}: <b>${fC(r.avance)}</b>${r.curso ? ` (${nf.format(r.avance / r.curso * 100)} %)` : ''}` : '';
  $('#hz').innerHTML = `<div class="hz-linea"><span>${ICO.lock} <b>${esc(ml(MC))}</b> en curso: ${nb('k_curso', fC(r.curso))}${av}</span>${CAL && (CAL.mesesSinFormulario || []).length ? `<span class="muted">${esc(CAL.mesesSinFormulario.map(ml).join(', '))} sin formulario previo: parte de 0</span>` : ''}</div>
    ${VENCIDO ? `<p class="aviso"><b>La captura del ciclo ${esc(mll(D.ciclo))} cerró el ${esc(fechaCorta(CAP_HASTA))}.</b> Todo queda de solo lectura hasta el siguiente ciclo; lo capturado sigue guardado.</p>` : ''}
    ${CAL && CAL.avisos && CAL.avisos.length ? `<p class="aviso">${CAL.avisos.map(esc).join(' · ')}</p>` : ''}
    ${tiraHorizonte(addM(D.corte, -2), ULT_MF)}`;
}

/* ---------- indicadores (0.6.0: las cuatro tarjetas con la misma estructura: título, cifra, una línea de comparación y 1-2 datos) ---------- */
function tarjeta(lbl, big, vr, vrCls, refs) {
  return `<div class="kpi"><span class="lbl">${lbl}</span><span class="big">${big}</span><span class="vr ${vrCls || 'muted'}">${vr || ''}</span>`
    + `<span class="refs">${refs.filter(Boolean).map(([a, b, bi]) => bi ? BI(`<span>${a}</span><span>${b}</span>`) : `<span>${a}</span><span>${b}</span>`).join('')}</span></div>`;
}
function pintarKpis() {
  const sel = selGraf(), r = resumen(sel);      // 070-GRAFICO: las tarjetas siguen el filtro de producto del gráfico (S.prod); sin filtro = P.filter(enDist), como antes
  const tri = MH.slice(-3), t = r.d3ly > 0 ? r.d3 / r.d3ly - 1 : null, ei = r.doh == null ? null : estInv(r.doh, S.dist === 'TODOS' ? null : S.dist);
  const tSel = tipoSel(), sinInv = !sel.some(p => p.inv);
  const porQue = tSel === 'sell in directo' ? 'Venta directa de Brinova' : tSel === 'sell out' ? 'Las cadenas no envían inventario' : 'Sin reporte de inventario';
  const fechas = [...new Set(sel.filter(p => p.inv).map(p => (D.distribuidores[p.clase] || {}).invFecha).filter(Boolean))];
  const viejas = [...new Set(sel.filter(p => p.inv).map(p => p.clase))].filter(invViejo);
  const vl = S.dist !== 'TODOS' && !S.prod ? ventaLocalDe(S.dist) : null;      // venta en la moneda del distribuidor (cuando venga en datos.json; es del distribuidor completo, no de un producto)
  const cls = v => v == null ? 'muted' : v >= 0 ? 'up' : 'down';
  const k1 = tarjeta('Tu forecast · ' + esc(rango(MK)), nb('k_kam', fC(r.kam)), r.difK == null ? '' : `${flecha(r.difK)}${fP(r.difK)} contra el algoritmo`, r.difK != null && Math.abs(r.difK) > 0.3 ? 'warn' : 'muted',
    [['Algoritmo', nb('k_alg', fC(r.alg))], ['En piezas', fN(r.pzk) + ' pz']]);
  const k2 = tarjeta('Venta real · ' + esc(rango(tri)), nb('k_venta3', fC(r.d3)), t == null ? '' : `${flecha(t)}${fP(t)} contra el año anterior`, cls(t),
    [['Año anterior', fC(r.d3ly)], vl ? [`<span title="${esc(vl.queEs || 'Venta en la moneda del distribuidor')}">En ${esc(vl.moneda)}</span>`, esc(fMon(vl.total3, vl.moneda)) + (var3Local(vl) ? ' · ' + var3Local(vl) : '')] : null]);
  let k3;
  if (sinInv) k3 = tarjeta('Inventario del distribuidor', 'No aplica', esc(porQue), 'muted', [['Fuente', esc(fuenteTxt(S.dist === 'TODOS' ? (D.clases[0] || '') : S.dist))]]);
  else {
    const corte = fechas.length ? fechas.map(f => f.slice(8, 10) + '/' + f.slice(5, 7)).join(', ') + (viejas.length ? ' (dato viejo)' : '') : '—';
    const d2 = r.invTrPz > 0 ? ['En tránsito', fN(r.invTrPz) + ' pz'] : r.progPz > 0 ? ['Programado', S.prod ? fN(r.progPz) + ' pz' : fN(r.progCajas) + ' cajas'] : ['Valor', fC(r.inv)];      // 070-GRAFICO: un producto en varios distribuidores puede mezclar cajas de 24 y de 48: en piezas
    k3 = tarjeta('Inventario del distribuidor', r.doh == null ? '—' : nb('k_doh', diasTxt(r.doh) + ''), ei ? esc(ei[1]) : '', ei ? (ei[0] === 'good' ? 'up' : ei[0] === 'bad' ? 'down' : ei[0] ? 'warn' : 'muted') : 'muted',
      [d2, ['Corte', corte]]);
  }
  let k4;
  if (AP) k4 = tarjetaAccPm();      // 070-PRECISION: precisión del forecast (ACC PM del reporte) con el rango de meses que elige el KAM
  else if (r.pk) {
    const v = pkMed(r.pk), e = aciertoEst(v, r.pk.sellInPz), sg = pkSes(r.pk), ex = exclusiones(r.pk).flatMap(x => x.meses);
    k4 = tarjeta('Forecast anterior · ' + esc(rango(r.L12)), nb('k_sesgo', e === 'ok' ? pctN(v) + ' acierto' : e === 'piso' ? 'Sin acierto' : 'Sin base'),
      ok(sg) ? `sesgo ${fP(sg)} contra ${BASE_SI ? 'compras' : 'venta'}` : '', ok(sg) && Math.abs(sg) > 0.15 ? 'warn' : 'muted',
      [ex.length ? ['Sin contar', esc([...new Set(ex)].map(ml).join(', '))] : ['Periodo', esc(rango(r.L12))], ['Precisión (FCST ACC)', r.prec == null ? '—' : nf.format(r.prec * 100) + ' %', true]]);
  } else k4 = tarjeta('Forecast anterior · ' + esc(rango(r.L12)), r.sesgo == null ? 'Sin historia' : nb('k_sesgo', fP(r.sesgo)), r.sesgo == null ? 'sin forecast en 12 meses' : 'sesgo contra la venta', 'muted', [['Periodo', esc(rango(r.L12))]]);
  $('#kpis').innerHTML = k1 + k2 + k3 + k4;
  const selL = P.filter(enDist), nAl = selL.filter(p => alertas(p).length).length, nSP = selL.filter(p => p.precioPz == null).length;      // 070-GRAFICO: la nota de la lista sigue siendo del distribuidor
  $('#nota-mix').textContent = `${selL.length} productos · ${nAl} con alerta${nSP ? ' · ' + nSP + ' sin precio de lista' : ''}`;
  pintarKpiFiltro();
}

/* ---------- tendencia total ---------- */
/* 070-GRAFICO: sin filtro, el mix del distribuidor en colones; con producto (S.prod), ese producto sumado en sus distribuidores (o uno) en su unidad común o en piezas.
   Las series se prenden y apagan desde la leyenda (S.ocultas) y el eje se reajusta a lo visible. */
function pintarTotal() {
  validarProd();
  const sel = selGraf(), u = S.prod ? unidadGraf(sel) : null, a = prodAlcance();
  const todas = u ? seriesDe(sel, { uPz: u.f }) : seriesDe(sel);
  const cls = S.prod ? [...new Set(sel.map(p => p.clase))] : (S.dist === 'TODOS' ? D.clases : [S.dist]);
  const o = { meses: mesesGraf(), series: todas.filter(s => !S.ocultas.includes(s.key)), estados: true, incompletos: cls.length === 1 ? incompletosDe(cls) : [], exclKam: exclKamDe(cls),
    eje: u ? fCx : (v => v === 0 ? '₡0' : '₡' + fCx(v)), tip: u ? (v => fN1(v) + ' ' + u.nom) : fC,
    titulo: u ? 'Tendencia de ' + nombreProd(S.prod) + ' (' + alcanceTxt(sel) + ') en ' + u.nom : 'Tendencia del mix en colones', izq: u ? 52 : 0 };
  grafico($('#ch-total'), o);
  $('#lg-total').innerHTML = leyendaSeries(todas) + leyenda([], true) + (o.incompletos.length ? '<span><i class="sw" style="border:0;width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-bottom:8px solid #D99A22"></i>mes incompleto</span>' : '');
  $('#tt-t').textContent = S.prod ? nombreProd(S.prod) : 'Tendencia del mix';
  $('#nota-total').textContent = u ? alcanceTxt(sel) + ' · ' + u.nom + (u.mixto ? ' (presentaciones distintas: se suma en piezas)' : '') : 'Colones a precio de lista';
  pintarFiltroProd(); pintarKpiFiltro(); marcarSelLista();
  const b = $('#b-desde'); if (b) b.setAttribute('aria-pressed', S.desde === '2024-01');
  const tb = document.querySelector('[data-tabla="ch-total"]'); if (tb && tb.getAttribute('aria-pressed') === 'true') $('#ch-total-tb').innerHTML = tablaSeries(o);
}
const nombreProd = g => (P.find(p => p.grupo === g) || {}).nombre || g;
function alcanceTxt(sel) { const a = prodAlcance(); if (a !== 'TODOS') return a; const n = new Set(sel.map(p => p.clase)).size; return n === 1 && sel.length ? sel[0].clase : 'suma de ' + n + ' distribuidores'; }
function validarProd() {      // el producto elegido tiene que existir en el distribuidor de arriba; si no, vuelve al mix
  if (!S.prod) return;
  const ps = P.filter(p => p.grupo === S.prod && enDist(p));
  if (!ps.length) { S.prod = null; S.prodDist = 'TODOS'; return; }
  if (S.prodDist !== 'TODOS' && !ps.some(p => p.clase === S.prodDist)) S.prodDist = 'TODOS';
}
function seleccionarProd(g, cl, avisar) {
  S.prod = g || null; S.prodDist = (g && cl) || 'TODOS';
  pintarKpis(); pintarTotal();
  if (avisar && g) toast('Gráfico y tarjetas: ' + nombreProd(g) + ' · ' + alcanceTxt(selGraf()));
}
/* leyenda que funciona como slicer: cada serie es un botón con casilla; apagada = no se dibuja y no cuenta para el eje */
function leyendaSeries(series) {
  return `<span class="ser-l" role="group" aria-label="Series del gráfico: toca una para mostrarla u ocultarla">${series.map(s => {
    const on = !S.ocultas.includes(s.key), k = s.tipo === 'dash' ? 'dash' : s.tipo === 'col' ? 'col' : s.tipo === 'ring' ? 'dot' : s.tipo === 'lm' ? 'lm' : '';
    return `<button type="button" class="ser" data-serie="${esc(s.key)}" aria-pressed="${on}" title="${on ? 'Ocultar' : 'Mostrar'} ${esc(s.nombre)}"><span class="ck" aria-hidden="true"></span><i class="sw ${k}" style="${s.tipo === 'col' ? 'background' : s.tipo === 'ring' ? 'border-color' : 'border-top-color'}:${s.color};color:${s.color}"></i>${esc(s.nombre)}</button>`;
  }).join('')}</span>`;
}
/* selector de producto junto al gráfico: nombre Brinova; con "Todos" arriba, también el distribuidor (todos sumados o uno) */
function pintarFiltroProd() {
  const el = $('#gf-bar'); if (!el) return;
  const foco = document.activeElement && document.activeElement.closest && document.activeElement.closest('#gf-bar') ? document.activeElement.id : null;
  const m = new Map(); P.filter(enDist).forEach(p => { const x = m.get(p.grupo) || { g: p.grupo, n: p.nombre, k: 0 }; x.k++; m.set(p.grupo, x); });
  const ops = [...m.values()].sort((a, b) => a.n.localeCompare(b.n, 'es'));
  const enProd = S.prod ? new Set(P.filter(p => p.grupo === S.prod).map(p => p.clase)) : null, cls = S.prod && S.dist === 'TODOS' ? D.clases.filter(c => enProd.has(c)) : [];
  el.innerHTML = `<label class="gf-f"><span>Producto</span><select id="gf-prod"><option value="">Todo el mix${S.dist === 'TODOS' ? '' : ' de ' + esc(S.dist)}</option>${ops.map(x => `<option value="${esc(x.g)}"${x.g === S.prod ? ' selected' : ''}>${esc(x.n)}${S.dist === 'TODOS' && x.k > 1 ? ' · ' + x.k + ' distribuidores' : ''}</option>`).join('')}</select></label>`
    + (cls.length > 1 ? `<label class="gf-f"><span>Distribuidor</span><select id="gf-dist"><option value="TODOS">Todos sumados (${cls.length})</option>${cls.map(c => `<option value="${esc(c)}"${c === prodAlcance() ? ' selected' : ''}>${esc(c)}</option>`).join('')}</select></label>` : '')
    + (S.prod ? `<button type="button" class="chip" data-gfclr>Quitar filtro</button>` : '');
  if (foco) { const f = document.getElementById(foco); if (f) f.focus(); }
}
function pintarKpiFiltro() {
  const el = $('#kpi-filtro'); if (!el) return;
  if (!S.prod) { el.hidden = true; el.innerHTML = ''; return; }
  const sel = selGraf(), u = unidadGraf(sel);
  el.hidden = false;
  el.innerHTML = `<span>Tarjetas y gráfico filtrados: <b>${esc(nombreProd(S.prod))}</b> · ${esc(alcanceTxt(sel))}${u.mixto ? ' · presentaciones distintas, sumadas en piezas y colones' : ''}</span><button type="button" class="chip" data-gfclr>Ver todo el mix</button>`;
}
function marcarSelLista() {      // resalta en la lista agrupada el producto (y el distribuidor) que muestra el gráfico
  const a = prodAlcance();
  $$('#lista details.gp').forEach(d => { const on = d.dataset.grupo === S.prod; d.classList.toggle('sel', on);
    d.querySelectorAll('.gp-d').forEach(r => { const s = on && a !== 'TODOS' && r.dataset.gpcl === a; r.classList.toggle('sel', s); const b = r.querySelector('.gp-sel'); if (b) b.setAttribute('aria-pressed', s); }); });
}
/* gráfico compacto de la pestaña Capturar: el producto que se está capturando; los puntos de "Forecast KAM vigente" se mueven con cada número (evento fcst:captura) */
function pintarCapGraf() {
  const box = $('#cap-graf'); if (!box) return;
  if (S.vista !== 'capturar' || !prodGrid.length) { box.hidden = true; return; }
  if (!S.capProd || !PID[S.capProd] || !enDist(PID[S.capProd])) S.capProd = prodGrid[0].id;
  const p = PID[S.capProd]; box.hidden = false;
  $('#cg-t').textContent = p.nombre + ' · ' + p.clase;
  $('#cg-nota').textContent = uNom(p) + ' · el punto naranja se mueve mientras escribes';
  const b = $('#b-cg'); b.setAttribute('aria-expanded', String(!S.cgOculto)); b.textContent = S.cgOculto ? 'Mostrar gráfico' : 'Ocultar gráfico';
  box.classList.toggle('plegado', !!S.cgOculto);
  if (S.cgOculto) return;
  const todas = seriesDe([p], p), desde = addM(MC, -12);
  const o = { meses: MH.concat(MF.filter(m => !MH.includes(m))).filter(m => m >= desde), series: todas.filter(s => !S.ocultas.includes(s.key)), estados: true, incompletos: INCOMP[p.clase] || [], exclKam: exclKamDe([p.clase]),
    eje: fCx, tip: v => fN1(v) + ' ' + uNom(p), titulo: 'Mes a mes de ' + p.nombre + ' en ' + p.clase + ', en ' + uNom(p), izq: 48, h: 210 };
  grafico($('#ch-cap'), o);
  $('#lg-cap').innerHTML = leyendaSeries(todas);
}
/* eventos del gráfico (se registran antes que los de app_3; usan atributos propios: data-serie, data-gfclr, data-gsel, data-agrupar, #gf-prod, #gf-dist, #b-cg) */
document.addEventListener('click', ev => {
  const t = ev.target;
  const ser = t.closest('[data-serie]');
  if (ser) {
    const k = ser.dataset.serie, on = ser.getAttribute('aria-pressed') === 'true', grupo = ser.parentElement, ley = ser.closest('.legend');
    if (on && grupo && grupo.querySelectorAll('[data-serie][aria-pressed="true"]').length <= 1) { toast('Deja al menos una serie visible'); return; }
    S.ocultas = on ? S.ocultas.concat(k) : S.ocultas.filter(x => x !== k); guardarGraf();
    if (S.vista === 'tendencia') pintarTotal();
    if (S.vista === 'capturar') pintarCapGraf();
    const otro = ley && ley.querySelector(`[data-serie="${CSS.escape(k)}"]`); if (otro) otro.focus();      // la leyenda se repinta: el foco vuelve al mismo botón
    return;
  }
  if (t.closest('[data-gfclr]')) { seleccionarProd(null); return; }
  if (t.closest('#b-cg')) { S.cgOculto = !S.cgOculto; guardarGraf(); pintarCapGraf(); return; }
  if (t.closest('[data-agrupar]')) { S.agrupar = !S.agrupar; guardarGraf(); pintarLista(); return; }
  const d = t.closest('[data-d]'); if (d) { S.prodDist = 'TODOS'; return; }      // cambio de distribuidor arriba: el alcance del producto vuelve a "todos"
  const sm = t.closest('summary.gp-h');
  if (sm) { const det = sm.parentElement, g = det.dataset.grupo, abre = !det.open; S.gpAbierto[g] = abre; if (abre) seleccionarProd(g, 'TODOS', true); return; }
  const fila = t.closest('.gp-d');
  if (fila && !t.closest('[data-p]')) { const g = fila.closest('details.gp').dataset.grupo; seleccionarProd(g, fila.dataset.gpcl, true); }
});
document.addEventListener('change', ev => {
  if (ev.target.id === 'gf-prod') seleccionarProd(ev.target.value || null, 'TODOS');
  if (ev.target.id === 'gf-dist') seleccionarProd(S.prod, ev.target.value);
});
document.addEventListener('focusin', ev => {
  const el = ev.target;
  if (el.classList && el.classList.contains('inp') && el.closest('#v-capturar')) { const L = LINES[el.dataset.line]; if (L && S.capProd !== L.p.id) { S.capProd = L.p.id; pintarCapGraf(); } }
});
let rafCap = 0;
document.addEventListener('fcst:captura', ev => {      // contrato común: {clase, cod, mes}
  const x = ev.detail || {}, L = LINES[x.clase + '__' + x.cod]; if (!L) return;
  cancelAnimationFrame(rafCap);
  rafCap = requestAnimationFrame(() => {
    if (S.vista === 'capturar') { S.capProd = L.p.id; pintarCapGraf(); }
    if (S.vista === 'tendencia' && (!S.prod || S.prod === L.p.grupo)) pintarTotal();
  });
});
(() => {      // alto de la barra superior (fija solo en escritorio) para pegar debajo el gráfico compacto de Capturar
  const h = document.querySelector('header.top'), cg = document.getElementById('cap-graf'), raiz = document.documentElement.style; if (!h || typeof ResizeObserver === 'undefined') return;
  new ResizeObserver(() => raiz.setProperty('--top-h', (getComputedStyle(h).position === 'sticky' ? h.offsetHeight : 0) + 'px')).observe(h);
  if (cg) new ResizeObserver(() => raiz.setProperty('--cg-h', cg.offsetHeight + 'px')).observe(cg);      // la tabla de captura se acorta para caber debajo del gráfico fijo
})();

/* ---------- tus distribuidores: fuente de la demanda ---------- */
function pintarDistribuidores() {
  const conLocal = D.clases.some(cl => ventaLocalDe(cl));      // 0.6.0: columna en moneda local solo si el dato viene
  const filas = D.clases.map(cl => {
    const vlc = ventaLocalDe(cl);
    const s2 = P.filter(p => p.clase === cl), r2 = resumen(s2), d = D.distribuidores[cl] || {}, e = r2.doh == null ? null : estInv(r2.doh, cl);
    const inc = INCOMP[cl] || [], ult = d.ultimoMes, pk = precKam(cl), sg = pk ? pkSes(pk) : r2.sesgo;
    return `<tr><td class="l" data-l="Distribuidor"><button type="button" class="chip" data-d="${esc(cl)}" aria-pressed="${S.dist === cl}">${esc(cl)}</button></td>
      <td class="l" data-l="Fuente de la demanda" style="white-space:normal">${pill('src', fuenteTxt(cl))}${pillsMeses(cl)}${ult && ult < D.corte ? ' ' + pill('warn', 'venta hasta ' + ml(ult)) : ''}</td>
      <td data-l="Productos">${s2.length}</td>${conLocal ? `<td data-l="Venta 3 meses (moneda local)">${vlc ? `<span title="${esc(vlc.queEs || '')}">${esc(fMon(vlc.total3, vlc.moneda))}</span>` + (var3Local(vlc) ? `<small class="${/^sin/.test(var3Local(vlc)) ? 'muted' : vlc.var3 >= 0 ? 'up' : 'down'}" style="display:block">${var3Local(vlc)}</small>` : '') + (vlc.sellIn && ok(vlc.sellIn.razonPrecio12) ? BI(`<small class="muted" style="display:block">precio local ÷ facturado: ${nf2.format(vlc.sellIn.razonPrecio12)}×</small>`) : '') : '—'}</td>` : ''}<td data-l="Días de inventario">${r2.doh == null ? '—' : diasTxt(r2.doh) + '' + (r2.invTrPz > 0 ? `<small class="muted" style="display:block">${fN(r2.invDistPz)} pz en el distribuidor + ${fN(r2.invTrPz)} pz en tránsito</small>` : '') + (r2.progPz > 0 ? `<small class="muted" style="display:block" title="Pedidos programados: todavía no salieron; no suman días">+${fN(r2.progCajas)} cajas prog.</small>` : '') + (e ? `<small class="${e[0] ? '' : invViejo(cl) ? 'warn' : 'muted'}" style="display:block">${esc(e[1].toLowerCase())}</small>` : '')}${d.invFecha && !invViejo(cl) ? `<small class="muted" style="display:block">corte ${fechaCorta(d.invFecha)}</small>` : ''}</td><td data-l="Tu forecast vs algoritmo" class="${r2.difK != null && Math.abs(r2.difK) > 0.3 ? 'warn' : ''}">${flecha(r2.difK)}${fP(r2.difK)}</td>
      ${AP ? (() => { const a = accPmClase(cl); return `<td data-l="Precisión del forecast · ${esc(rango(accMeses()))}">${a && a.acc != null ? pct1(a.acc) : '—'}${a && ok(a.sesgo) ? `<small class="${Math.abs(a.sesgo) > 0.15 ? 'warn' : 'muted'}" style="display:block">sesgo ${fP(a.sesgo)} contra compras</small>` : ''}</td></tr>`; })() : `<td data-l="Sesgo del forecast anterior" class="${sg != null && Math.abs(sg) > 0.15 ? 'warn' : ''}">${sg == null ? '—' : flecha(sg) + fP(sg)}${pk ? `<small class="muted" style="display:block">${aciertoEst(pkMed(pk), pk.sellInPz) === 'ok' ? 'acierto trim. ' : ''}${aciertoTxt(pkMed(pk), pk.sellInPz, true)}</small>` : ''}${pk ? BI(`<small class="muted" style="display:block">vs venta ${fP(pk.sesgoReal)} · precisión ${ok(pk.accReal) ? nf.format(pk.accReal * 100) + ' %' : '—'}</small>`) : ''}</td></tr>`}`;
  }).join('');
  /* 0.4.0: encabezados en dos líneas y celdas que se parten, para que la tabla quepa a 1366-1400 px sin cortar la última columna */
  $('#tab-dist').innerHTML = `<div class="tw" role="region" tabindex="0" aria-label="Tus distribuidores"><table class="tbl tdist"><colgroup><col style="width:15%"><col><col style="width:8%">${conLocal ? '<col style="width:12%">' : ''}<col style="width:13%"><col style="width:11%"><col style="width:12%"></colgroup><thead><tr><th class="l">Distribuidor</th><th class="l" title="Sell through: venta del distribuidor a sus clientes · Sell out: venta de las tiendas al consumidor · Sell in directo: lo que Brinova factura">Fuente de la demanda</th><th>Productos</th>${conLocal ? '<th title="Venta real de los últimos 3 meses en la moneda del distribuidor">Venta 3 meses (moneda local)</th>' : ''}<th>Días de inventario</th><th>Tu forecast vs algoritmo</th>${AP ? `<th title="Asertividad del reporte Forecast y PRM (ACC PM), de ${esc(rango(accMeses()))}; se cambia en la tarjeta Precisión del forecast">Precisión del forecast<br><span class="small muted">${esc(rango(accMeses()))}</span></th>` : '<th title="Sesgo: positivo = forecast por encima de las compras del distribuidor">Sesgo del forecast anterior</th>'}</tr></thead><tbody>${filas}</tbody></table></div>${BI('<p class="small muted" style="margin-top:8px">El algoritmo usa la fuente de cada distribuidor; el sell in (facturado) sirve para comprobar que los datos cuadran.</p>')}`;
}

/* ---------- lista (de 60 en 60) ---------- */
function pintarLista() {
  const ord = {
    valor: (a, b) => pv(b, algPz6(b)) - pv(a, algPz6(a)),
    tend: (a, b) => (tend(a) ?? 9) - (tend(b) ?? 9),
    dias: (a, b) => (dias(b) ?? -1) - (dias(a) ?? -1),
    dif: (a, b) => Math.abs(dif(b) ?? 0) - Math.abs(dif(a) ?? 0),
  }[S.orden];
  const L = filtrados().sort(ord);
  const agr = S.agrupar && S.dist === 'TODOS';      // 070-GRAFICO: "Agrupar por producto" (con un solo distribuidor cada producto ya es una fila)
  { const bA = $('#b-agrupar'); if (bA) { bA.hidden = S.dist !== 'TODOS'; bA.setAttribute('aria-pressed', String(agr)); } }
  const head = `${BI('<p class="small muted" style="margin:0 0 8px">' + esc(catFuenteTxt()) + '</p>')}
    <div class="lhead"><span>${agr ? 'Producto · suma de distribuidores (toca para verlo en el gráfico)' : 'Producto'}</span><span>12 meses + algoritmo</span><span class="r">Venta 3M</span><span class="r">Inventario</span><span class="r">Algoritmo ${esc(rango(MK))}</span><span class="r">Tu forecast</span><span class="r">${agr ? 'Precio lista por pieza' : 'Precio lista'}</span></div>`;
  if (!L.length) { $('#lista').innerHTML = head + '<div class="vacio">Ningún producto cumple el filtro. Prueba con “Todos”.</div>'; return; }
  /* 0.4.0: agrupada por categoría (p.cat), plegable, con totales en colones; las categorías con más algoritmo arriba.
     Abiertas si hay búsqueda o filtro; si no, cerradas. Lo que el KAM abre o cierra se recuerda hasta que cambie el filtro. */
  const clave = [S.q.trim().toLowerCase(), S.cat, S.chip, S.dist].join('|');
  if (S.catClave !== clave) { S.catClave = clave; S.catAbierta = {}; S.limCat = {}; }
  const filtro = !!(S.q.trim() || S.cat || S.chip !== 'todos');
  const grupos = new Map(); L.forEach(p => { const k = p.cat || 'Sin categoría'; if (!grupos.has(k)) grupos.set(k, []); grupos.get(k).push(p); });
  const ORD = ordenCategorias(), pos = k => { const i = ORD ? ORD.indexOf(k) : -1; return i < 0 ? 1e6 : i; };
  const gs = [...grupos.entries()].map(([k, ps]) => [k, ps, totCat(ps)]).sort((a, b) => pos(a[0]) - pos(b[0]) || b[2].alg - a[2].alg || a[0].localeCompare(b[0]));
  $('#lista').innerHTML = head + gs.map(([k, ps, r]) => {
    const abierta = S.catAbierta[k] != null ? S.catAbierta[k] : (filtro || gs.length === 1), lim = S.limCat[k] || 40, nAl = ps.filter(p => alertas(p).length).length;
    const its = agr ? gruposProd(ps) : ps, nIt = its.length;      // 070-GRAFICO: filas agrupadas por producto
    return `<details class="cat" data-cat="${esc(k)}"${abierta ? ' open' : ''}><summary class="cat-h"${descCat(k) ? ` title="${esc(descCat(k))}"` : ''}>
      <span class="c-nm"><span class="nm">${esc(nombreCat(k))}</span>${descCat(k) ? `<span class="desc">${esc(descCat(k))}</span>` : ''}<span class="meta">${agr ? nIt + (nIt === 1 ? ' producto' : ' productos') + ' en ' + ps.length + (ps.length === 1 ? ' fila' : ' filas') + ' por distribuidor' : ps.length + ' ' + (ps.length === 1 ? 'producto' : 'productos')}${BI(' · ' + esc(cuentaFuentes(ps)))}${nAl ? ' · ' + nAl + ' con alerta' : ''}</span></span>
      <span class="small muted" data-l="">en colones</span>
      <span class="r v" data-l="Venta 3M">${fC(r.d3)}<small class="${r.t == null ? '' : r.t >= 0 ? 'up' : 'down'}">${flecha(r.t)}${fP(r.t)}</small></span>
      <span class="r v" data-l="Inventario">${r.inv ? fC(r.inv) : '—'}</span>
      <span class="r v" data-l="Algoritmo">${fC(r.alg)}</span>
      <span class="r v" data-l="Tu forecast">${fC(r.kam)}<small class="${r.dif != null && Math.abs(r.dif) > 0.3 ? 'warn' : ''}">${flecha(r.dif)}${fP(r.dif)}</small></span>
      <span></span></summary>
      ${its.slice(0, lim).map(agr ? itemGrupo : itemLista).join('')}
      ${nIt > lim ? `<div class="mas"><button type="button" class="btn" data-mascat="${esc(k)}">Mostrar ${Math.min(60, nIt - lim)} más (${nIt - lim} restantes)</button></div>` : ''}</details>`;
  }).join('');
}
/* 0.4.0 · categorías (24/11): productos[].cat sale de T_SKU › CATEGORÍA PORTAL (o BFCST); productos[].catFuente dice de dónde.
   datos.categorias = {fuente, porFuente}. Si algún día trae el orden (orden/lista: [nombres]) o nombres para mostrar (nombres: {CAT: "Nombre"}), se usan. */
function ordenCategorias() { const c = D.categorias; if (Array.isArray(c)) return c.map(x => typeof x === 'string' ? x : x && (x.cat || x.nombre)).filter(Boolean); if (c && Array.isArray(c.orden || c.lista)) return (c.orden || c.lista).map(x => typeof x === 'string' ? x : x && (x.cat || x.nombre)).filter(Boolean); return null; }
const SIGLAS = new Set(['POP', 'PT', 'SKU', 'BI']);
function nombreCat(k) { const n = D.categorias && !Array.isArray(D.categorias) && D.categorias.nombres && D.categorias.nombres[k]; if (n) return n; if (k === 'Sin categoría') return k;
  const t = k.toLowerCase().replace(/\p{L}+/gu, w => SIGLAS.has(w.toUpperCase()) ? w.toUpperCase() : w); return t.charAt(0).toUpperCase() + t.slice(1); }
/* categorias.descripcion (24/11): "qué incluye" cada categoría; va de subtítulo discreto y tooltip del grupo */
const descCat = k => (D.categorias && !Array.isArray(D.categorias) && D.categorias.descripcion && D.categorias.descripcion[k]) || '';
const CATF = { tsku: 'T_SKU (código)', 'tsku-producto': 'T_SKU (producto)', bfcst: 'BFCST', sin: 'sin categoría' };
const cuentaFuentes = ps => { const g = {}; ps.forEach(p => { const k = p.catFuente || '¿?'; g[k] = (g[k] || 0) + 1; }); return 'categoría de: ' + Object.entries(g).map(([k, n]) => (CATF[k] || k) + ' ' + n).join(', '); };
function catFuenteTxt() { const c = D.categorias; if (!c || Array.isArray(c)) return 'Categoría: BFCST (datos sin campo categorias).'; return 'Categoría desde ' + (c.fuente || '—') + (c.porFuente ? ' · ' + Object.entries(c.porFuente).map(([k, n]) => (CATF[k] || k) + ' ' + n).join(', ') : '') + '.'; }
/* totales de una categoría, en colones a precio de lista (no se pueden sumar cajas de tamaños distintos) */
function totCat(ps) {
  const r = { d3: 0, d3ly: 0, alg: 0, kam: 0, inv: 0 };
  ps.forEach(p => { r.d3 += pv(p, p.d3); r.d3ly += pv(p, p.d3ly); r.alg += pv(p, algPz6(p)); r.kam += kamValM(p, MK); if (p.inv) r.inv += pv(p, invTot(p)); });
  r.t = r.d3ly > 0 ? r.d3 / r.d3ly - 1 : null; r.dif = r.alg > 0 ? r.kam / r.alg - 1 : null;
  return r;
}
function itemLista(p) {
  const f = fac(p), a = alertas(p), pr = precioU(p, p.princ), t = tend(p), d = dif(p), e = estInv(dias(p), p.clase);
  return `<button type="button" class="item" data-p="${esc(p.id)}">
      <span class="c-nm" style="min-width:0"><span class="nm">${esc(p.nombre)}</span>
        <span class="meta">${uPill(p)} ${S.dist === 'TODOS' ? esc(p.clase) + ' · ' : ''}${esc(p.principal)}</span>
        ${a.length ? `<span style="display:flex;gap:4px;flex-wrap:wrap;margin-top:4px">${a.slice(0, 2).map(([c, x]) => pill(c, x)).join('')}</span>` : ''}</span>
      <span data-l="12 meses + algoritmo">${spark(p)}</span>
      <span class="r v" data-l="Venta 3M">${fN1(p.d3 / f)}<small class="${t == null ? '' : t >= 0 ? 'up' : 'down'}">${flecha(t)}${fP(t)}</small></span>
      <span class="r v" data-l="Inventario">${p.inv ? fN1(invTot(p) / f) + (conTransito(p) ? '<small class="muted">incl. tránsito</small>' : '') + `<small>${e ? pill(e[0], diasTxt(dias(p)) + '') + (invViejo(p.clase) ? `<small class="warn">${esc(viejoTxt(fechaInv(p.clase)))}</small>` : '') : 'sin venta'}</small>` : `<small>${tipoDe(p.clase) === 'sell in directo' ? 'venta directa' : 'sin reporte'}</small>`}</span>
      <span class="r v" data-l="Algoritmo">${fN1(algPz6(p) / f)}<small>${fC(pv(p, algPz6(p)))}</small></span>
      <span class="r v" data-l="Tu forecast">${fN1(kamPz6(p) / f)}<small class="${d != null && Math.abs(d) > 0.3 ? 'warn' : ''}">${flecha(d)}${fP(d)}</small></span>
      <span class="r v" data-l="Precio lista">${pr != null ? fC2(pr) : pill('bad', 'sin precio')}<small>por ${esc(esEmpaque(p) || p.uPz > 1 ? String(presDe(p.princ) || 'unidad').toLowerCase() : 'pieza')}</small></span>
    </button>`;
}
/* ---------- 070-GRAFICO · lista agrupada por producto (productos[].grupo) ----------
   Suma piezas de todos los distribuidores; se muestra en la presentación común si todos traen la misma (unidadGraf) y si no en piezas.
   Colones a precio de lista de cada distribuidor. Al abrir el grupo el gráfico de arriba muestra ese producto sumado; al tocar un distribuidor, solo ese. */
function aggGrupo(ps) {
  const a = { ps, u: unidadGraf(ps), d3: 0, d3ly: 0, inv: 0, conInv: 0, vd: 0, tr: false, alg: 0, kam: 0, algC: 0, kamC: 0, real: {}, algM: {}, prMin: null, prMax: null, alerta: 0 };
  ps.forEach(p => {
    a.d3 += p.d3 || 0; a.d3ly += p.d3ly || 0; a.alg += algPz6(p); a.kam += kamPz6(p); a.algC += pv(p, algPz6(p)); a.kamC += kamValM(p, MK);
    if (p.inv) { a.inv += invTot(p); a.conInv++; const v = ventaDoh(p); if (v > 0) a.vd += v / diasDoh(p); if (conTransito(p)) a.tr = true; }
    MH.forEach(m => { a.real[m] = (a.real[m] || 0) + (p.real[m] || 0); }); MF.forEach(m => { a.algM[m] = (a.algM[m] || 0) + (p.alg[m] || 0); });
    if (p.precioPz != null) { a.prMin = a.prMin == null ? p.precioPz : Math.min(a.prMin, p.precioPz); a.prMax = a.prMax == null ? p.precioPz : Math.max(a.prMax, p.precioPz); }
    if (alertas(p).length) a.alerta++;
  });
  a.t = a.d3ly > 0 ? a.d3 / a.d3ly - 1 : null; a.dif = a.alg > 0 ? a.kam / a.alg - 1 : null; a.dias = a.vd > 0 ? Math.round(a.inv / a.vd) : null;
  return a;
}
function gruposProd(ps) {
  const m = new Map(); ps.forEach(p => { if (!m.has(p.grupo)) m.set(p.grupo, []); m.get(p.grupo).push(p); });
  const ord = { valor: (a, b) => b.algC - a.algC, tend: (a, b) => (a.t ?? 9) - (b.t ?? 9), dias: (a, b) => (b.dias ?? -1) - (a.dias ?? -1), dif: (a, b) => Math.abs(b.dif ?? 0) - Math.abs(a.dif ?? 0) }[S.orden] || ((a, b) => b.algC - a.algC);
  return [...m.values()].map(x => aggGrupo(x.sort((a, b) => D.clases.indexOf(a.clase) - D.clases.indexOf(b.clase)))).sort(ord);
}
function itemGrupo(a) {
  const p0 = a.ps[0], f = a.u.f, n = a.ps.length, cls = a.ps.map(p => p.clase), e = a.dias == null ? null : estInv(a.dias, cls.length === 1 ? cls[0] : null);
  const precio = a.prMin == null ? pill('bad', 'sin precio') : a.prMin === a.prMax ? fC2(a.prMin) : fC(a.prMin) === fC(a.prMax) ? fC(a.prMin) : fC(a.prMin) + ' – ' + fC(a.prMax);
  return `<details class="gp${S.prod === p0.grupo ? ' sel' : ''}" data-grupo="${esc(p0.grupo)}"${S.gpAbierto[p0.grupo] ? ' open' : ''}><summary class="item gp-h" title="Ver ${esc(p0.nombre)} en el gráfico, sumado para sus distribuidores">
      <span class="c-nm" style="min-width:0"><span class="nm">${esc(p0.nombre)}</span>
        <span class="meta"><span class="upill ${f > 1 ? 'emp' : 'pz'}">${esc(a.u.nom)}</span> ${n} ${n === 1 ? 'distribuidor' : 'distribuidores'}${a.u.mixto ? ' · presentaciones distintas: suma en piezas' : ''}${a.alerta ? ' · ' + a.alerta + ' con alerta' : ''}</span></span>
      <span data-l="12 meses + algoritmo">${spark({ real: a.real, alg: a.algM })}</span>
      <span class="r v" data-l="Venta 3M">${fN1(a.d3 / f)}<small class="${a.t == null ? '' : a.t >= 0 ? 'up' : 'down'}">${flecha(a.t)}${fP(a.t)}</small></span>
      <span class="r v" data-l="Inventario">${a.conInv ? fN1(a.inv / f) + (a.tr ? '<small class="muted">incl. tránsito</small>' : '') + `<small>${a.dias != null ? pill(e ? e[0] : '', diasTxt(a.dias)) : 'sin venta'}</small>` + (a.conInv < n ? `<small class="muted">${a.conInv} de ${n} con reporte</small>` : '') : '<small>sin reporte</small>'}</span>
      <span class="r v" data-l="Algoritmo">${fN1(a.alg / f)}<small>${fC(a.algC)}</small></span>
      <span class="r v" data-l="Tu forecast">${fN1(a.kam / f)}<small class="${a.dif != null && Math.abs(a.dif) > 0.3 ? 'warn' : ''}">${flecha(a.dif)}${fP(a.dif)}</small></span>
      <span class="r v" data-l="Precio lista por pieza">${precio}<small>por pieza</small></span>
    </summary>${a.ps.map(p => itemDesglose(p, a.u)).join('')}</details>`;
}
function itemDesglose(p, u) {
  const f = u.f, t = tend(p), d = dif(p), e = estInv(dias(p), p.clase), on = S.prod === p.grupo && prodAlcance() === p.clase;
  const pres = p.uPz > 1 ? plural(presDe(p.princ)) + ' de ' + fN(p.uPz) + ' pz' : 'piezas sueltas';
  return `<div class="item gp-d${on ? ' sel' : ''}" data-gpcl="${esc(p.clase)}">
      <span class="c-nm" style="min-width:0"><button type="button" class="gp-sel" data-gsel="${esc(p.grupo)}" aria-pressed="${on}" title="Ver solo ${esc(p.clase)} en el gráfico"><span class="nm">${esc(p.clase)}</span></button>
        <span class="meta">${esc(p.principal)} · se vende en ${esc(pres)}</span></span>
      <span data-l="12 meses + algoritmo">${spark(p)}</span>
      <span class="r v" data-l="Venta 3M">${fN1(p.d3 / f)}<small class="${t == null ? '' : t >= 0 ? 'up' : 'down'}">${flecha(t)}${fP(t)}</small></span>
      <span class="r v" data-l="Inventario">${p.inv ? fN1(invTot(p) / f) + `<small>${e ? pill(e[0], diasTxt(dias(p))) : 'sin venta'}</small>` : `<small>${tipoDe(p.clase) === 'sell in directo' ? 'venta directa' : 'sin reporte'}</small>`}</span>
      <span class="r v" data-l="Algoritmo">${fN1(algPz6(p) / f)}<small>${fC(pv(p, algPz6(p)))}</small></span>
      <span class="r v" data-l="Tu forecast">${fN1(kamPz6(p) / f)}<small class="${d != null && Math.abs(d) > 0.3 ? 'warn' : ''}">${flecha(d)}${fP(d)}</small></span>
      <span class="r v" data-l=""><button type="button" class="btn gp-det" data-p="${esc(p.id)}">Ver detalle</button></span>
    </div>`;
}

/* ---------- captura (formato formulario, de 25 en 25 productos) ---------- */
let filasGrid = [], prodGrid = [];
function mesesCaptura() { if (S.capVista === 'curso') return MV.slice(); if (S.capVista === 'todo') return mesesAnio(); return MK.slice(); }
function listaCaptura() {
  const q = S.q2.trim().toLowerCase();
  return P.filter(p => enDist(p) && p.cap.length && (!q || p.txt.includes(q)) && pasaChip(p, S.chip2))
    .sort((a, b) => a.clase.localeCompare(b.clase) || pv(b, algPz6(b)) - pv(a, algPz6(a)));
}
function celdaInput(p, c, m, pref) {
  const pc = c.cod === p.principal && c.pzPorU, al = pc ? (p.alg[m] || 0) / c.pzPorU : null, vg = vig(c, m), sinF = CAL && (CAL.mesesSinFormulario || []).includes(m), aa = siU(p, c, addM(m, -12)), ra = pc ? (p.real[addM(m, -12)] || 0) / c.pzPorU : null;
  const iid = pref + '-' + sid(c.id) + '-' + m, hid = iid + '-h';
  return `<input class="inp${editado(c, m) ? ' ed' : ''}" id="${iid}" data-line="${esc(c.id)}" data-mes="${m}" inputmode="numeric" enterkeyhint="next" autocomplete="off"${editable(m) ? '' : ' readonly'} value="${kamU(c, m)}" aria-label="${esc(c.cod + ' ' + mll(m))}" aria-describedby="${hid}">`
    + `<span class="hint" id="${hid}">${al != null ? 'alg ' + fN1(al) + ' · ' : ''}${sinF ? 'sin formulario previo' : 'ant ' + (vg == null ? '—' : fN(vg))}${ra != null ? '<br>año pas. ' + fN1(ra) : (aa != null ? '<br>SI año pas. ' + fN1(aa) : '')}</span>`;
}
function celdaCap(p, c, m) {
  const e = estadoMes(m), pc = c.cod === p.principal && c.pzPorU, u = c.pzPorU || 1;
  if (e === 'abierto') return `<td class="st-abierto">${celdaInput(p, c, m, 'i')}</td>`;
  if (e === 'curso') { const av = c.avanceU != null ? c.avanceU : (pc && p.avanceSellInPz && p.avanceSellInPz[m] != null ? p.avanceSellInPz[m] / u : null);
    return `<td class="st-curso"><span class="lock">${ICO.lock}<b>${fN(vig(c, m))}</b></span><span class="hint">${OFICIAL_CURSO ? 'oficial' : 'vigente'}${av != null ? '<br>facturado al ' + esc(fechaCorta(D.avanceHasta).slice(0, 5)) + ': ' + fN1(av) : ''}</span></td>`; }
  if (e === 'real' || e === 'pend') { const kp = c.kamPasado && c.kamPasado[m], s = siU(p, c, m);
    return `<td class="st-real">${pc ? 'real ' + fN1((p.real[m] || 0) / u) : '—'}<span class="hint">${kp != null ? 'reg. ' + fN(kp) : ''}${s != null ? (kp != null ? ' · ' : '') + 'SI ' + fN1(s) : ''}</span></td>`; }
  return `<td class="st-ref">${pc ? 'alg ' + fN1((p.alg[m] || 0) / u) : '—'}</td>`;
}
function grupoCap(p, ncols) {
  const f = fac(p), d = dif(p), a = alertas(p), av = avisosCaptura(p);
  return `<tr class="grp" data-g="${esc(p.id)}"><th class="stk" scope="rowgroup" colspan="2"><div class="gwrap"><button type="button" class="nmp" data-p="${esc(p.id)}">${esc(p.nombre)}</button><span class="small muted">${esc(p.clase)} · ${esc(fuenteTxt(p.clase))}</span></div></th>
    <td colspan="${ncols}" style="text-align:left"><div class="gwrap small"><span>Algoritmo <b>${fN1(algPz6(p) / f)}</b> · tú <b data-gt="${esc(p.id)}">${fN1(kamPz6(p) / f)}</b> ${esc(uNom(p))} en ${esc(rango(MK))} <span class="${d != null && Math.abs(d) > 0.3 ? 'warn' : 'muted'}" data-gd="${esc(p.id)}">${flecha(d)}${fP(d)}</span></span>
    ${a.slice(0, 2).map(([c, x]) => pill(c, x)).join('')}<span data-ga="${esc(p.id)}">${avisosPills(av)}</span></div></td></tr>`;
}
function pintarGrid() {
  const L = listaCaptura(), ms = mesesCaptura(), lim = L.slice(0, S.capLim);
  filasGrid = []; prodGrid = lim;
  let h = `<thead><tr><th class="stk l" scope="col">Producto / código</th><th scope="col">Precio lista</th>${ms.map(m => { const e = estadoMes(m); return `<th scope="col" class="st-${e}">${ml(m)}<small>${EST_C[e]}</small></th>`; }).join('')}<th scope="col">Total captura</th><th scope="col">Valor</th></tr></thead><tbody>`;
  lim.forEach(p => {
    h += grupoCap(p, ms.length + 2);
    p.cap.forEach(c => {
      filasGrid.push(c.id);
      const pr = precioU(p, c);
      h += `<tr><th class="stk codr" scope="row"><b>${esc(c.cod)}</b>${c.cod === p.principal ? ' ' + pill('acc', 'principal') : ''}<small>${esc(descB(c))}</small><small>En ${esc(uCod(c))} · sell in 12M ${fN(c.u12)}</small></th><td>${pr != null ? fC2(pr) : pill('bad', 'sin precio')}</td>`;
      ms.forEach(m => { h += celdaCap(p, c, m); });
      h += `<td class="num" id="t-${esc(c.id)}"></td><td class="num" id="v-${esc(c.id)}"></td></tr>`;
    });
  });
  if (!L.length) h += `<tr><td class="l" colspan="${4 + ms.length}">Ningún producto cumple el filtro.</td></tr>`;
  h += `</tbody><tfoot><tr><th class="stk l" scope="row" colspan="2">Total en colones (lista)${lim.length < L.length ? ' · productos mostrados' : ''}</th>${ms.map(m => `<td id="f-${m}"></td>`).join('')}<td></td><td id="f-tot"></td></tr></tfoot>`;
  $('#grid').innerHTML = h;
  $('#grid-mas').innerHTML = L.length > S.capLim ? `<div class="mas"><button type="button" class="btn" data-capmas>Mostrar ${Math.min(25, L.length - S.capLim)} productos más (${L.length - S.capLim} restantes)</button></div>` : '';
  filasGrid.forEach(totFila); pieGrid(); pintarResumenCap();
}
function totFila(id) {
  const { p, c } = LINES[id], t = document.getElementById('t-' + id), v = document.getElementById('v-' + id);
  if (!t) return;
  const u = MK.reduce((a, m) => a + kamU(c, m), 0), pr = precioU(p, c);
  t.textContent = fN(u); v.textContent = pr != null ? fC(u * pr) : '—';
}
function pieGrid() {
  let tot = 0;
  mesesCaptura().forEach(m => {
    const el = document.getElementById('f-' + m); if (!el) return;
    const e = estadoMes(m); if (e !== 'abierto' && e !== 'curso') { el.textContent = ''; return; }
    const s = filasGrid.reduce((a, id) => { const { p, c } = LINES[id], pr = precioU(p, c); return a + (pr ? kamU(c, m) * pr : 0); }, 0);
    if (e === 'abierto') tot += s; el.textContent = fC(s);
  });
  const ft = $('#f-tot'); if (ft) ft.textContent = fC(tot);
}
function pintarResumenCap() {
  const sel = P.filter(enDist), r = resumen(sel);
  const nEd = sel.reduce((a, p) => a + p.codigos.filter(c => MK.some(m => editado(c, m))).length, 0);
  $('#cap-intro').innerHTML = `<p><b>Tu forecast de ${esc(rango(MK))}</b> en la unidad de tu formulario · viene de tu formulario vigente · se guarda solo.</p>
    <p class="small muted"><b>alg</b> algoritmo · <b>ant</b> forecast anterior · <b>año pas.</b> venta del mismo mes · <b>real</b>, <b>reg.</b>, <b>SI</b>: venta real, forecast registrado y sell in de meses cerrados</p>
    <p class="small muted solo-movil">En el celular conviene capturar desde el detalle: toca el nombre del producto.</p>
    ${VENCIDO ? `<p class="aviso"><b>La captura cerró el ${esc(fechaCorta(CAP_HASTA))}.</b> Las casillas quedan de solo lectura.</p>` : ''}`;
  $('#cap-res').innerHTML = `<span>Total ${esc(rango(MK))}: ${nb('k_kam', '<b>' + fC(r.kam) + '</b>')}</span><span>Algoritmo: ${nb('k_alg', fC(r.alg))}</span><span class="${r.difK != null && Math.abs(r.difK) > 0.3 ? 'warn' : 'muted'}">${flecha(r.difK)}${fP(r.difK)} contra el algoritmo</span><span class="muted">${nEd} ${nEd === 1 ? 'código cambiado' : 'códigos cambiados'}</span>`;
  pintarCapGraf();      // 070-GRAFICO: gráfico compacto del producto que se captura (pintarGrid y refrescarResumen pasan por aquí)
}
function inspector(id, m) {
  const el = $('#insp'); if (!el || !LINES[id]) return;
  const { p, c } = LINES[id], u = c.pzPorU || 1, aa = addM(m, -12), pr = precioU(p, c), pc = c.cod === p.principal && c.pzPorU, un = plural(presDe(c)), s = siU(p, c, aa);
  const it = (k, v) => `<span class="it"><span>${k}</span><b>${v}</b></span>`;
  el.classList.remove('vacio');
  el.innerHTML = `${it(esc(c.cod) + ' · ' + ml(m), fN(kamU(c, m)) + ' ' + esc(un) + ' = ' + fN(kamU(c, m) * u) + ' pz')}${it('Forecast anterior', vig(c, m) == null ? '—' : fN(vig(c, m)))}${it('Algoritmo', pc ? fN1((p.alg[m] || 0) / u) : 'ver ' + esc(p.principal))}${it('Real ' + ml(aa), pc ? fN1((p.real[aa] || 0) / u) : fN1((p.real[aa] || 0) / u) + ' (producto)')}${it('Sell in ' + ml(aa), s == null ? '—' : fN1(s))}${it('Valor', fC(kamU(c, m) * (pr || 0)))}
    <button type="button" class="btn" data-exp="cel" data-c="${esc(c.id)}" data-m="${m}">¿De dónde sale?</button>`;
}

/* ---------- cómo se calcula: textos según las fuentes del KAM ---------- */
const lista = xs => xs.length <= 1 ? xs.join('') : xs.slice(0, -1).join(', ') + ' y ' + xs[xs.length - 1];
function textoFuentes() {
  const de = t => D.clases.filter(c => tipoDe(c) === t);
  const st = de('sell through'), so = de('sell out'), dir = de('sell in directo');
  const out = [];
  if (st.length) out.push(`<p><b>Sell through</b> (venta del distribuidor): el reporte de ventas de ${esc(lista(st.map(c => { const f = (D.distribuidores[c].fuente || []).filter(x => x !== c); return f.length ? f.join('/') + ' (' + c + ')' : c; })))} a sus clientes, convertido a piezas Brinova.</p>`);
  if (so.length) out.push(`<p><b>Sell out</b> (venta al consumidor): lo que venden las tiendas de ${esc(lista(so))} según sus escáneres, convertido a piezas Brinova. En Walmart solo cuentan las tiendas de Costa Rica.</p>`);
  if (dir.length) out.push(`<p>En <b>${esc(lista(dir))}</b> la demanda es la <b>facturación directa</b> de Brinova (sell in directo): la razón contra el sell in siempre da 1.</p>`);
  if (D.clases.includes('PANAMA')) out.push(`<p><b>PANAMA es mixto</b>: FEDURO (sell through) más lo que Brinova le factura directo a Supermercados Xtra (marca LIKE)${mezclaDe('PANAMA') ? ' (' + esc(fuenteTxt('PANAMA')) + ')' : ''}.</p>`);
  return out.join('');
}
function textoInventario() {
  const st = D.clases.filter(c => tipoDe(c) === 'sell through');
  if (!st.length) return '<p><b>Inventario</b>: las cadenas no envían inventario a BI, así que aquí no hay días de inventario.</p>';
  const mens = st.filter(c => D.distribuidores[c].invCortes >= 6), poc = st.filter(c => D.distribuidores[c].invCortes > 0 && D.distribuidores[c].invCortes < 6), nada = st.filter(c => !D.distribuidores[c].invCortes);
  return `<p><b>Inventario</b>: el último reporte de inventario de cada distribuidor.${mens.length ? ' ' + esc(lista(mens)) + (mens.length > 1 ? ' mandan' : ' manda') + ' uno casi cada mes.' : ''}${poc.length ? ' De ' + esc(lista(poc)) + ' hay pocos cortes.' : ''}${nada.length ? ' De ' + esc(lista(nada)) + ' no hay inventario.' : ''}</p>`;
}
function pintarMetodo() {
  const ej = P.filter(p => tipoDe(p.clase) !== 'sell in directo' && p.princ.calc && !inter(p.princ.calc)).sort((a, b) => pv(b, algPz6(b)) - pv(a, algPz6(a)))[0];
  const c = ej && ej.princ.calc, f = ej ? ej.uPz || 1 : 1, m0 = MK[0];
  const base = c ? (c.base != null ? c.base : (c.l3 + c.l6 + c.l12) / 3) : 0, un = ej ? (ej.uPz > 1 ? plural(presDe(ej.princ)) + ' de ' + fN(ej.uPz) + ' pz' : 'piezas') : '';
  const vd = filasVersion(), pk = precKam('TODOS');
  /* 0.5.1: umbrales de días por distribuidor (T_DOH_OBJETIVO); si todas las clases tienen los mismos, una sola frase como antes */
  const uc = D.clases.map(umbralClase), u0 = uc[0] || umbral(null), uni = uc.every(u => umbralIgual(u, u0));
  const umbTxt = uni ? `Menos de ${fN(u0.riesgo)} días: riesgo de quiebre${u0.riesgo === 30 ? ' (exportación)' : ''}. Más de ${fN(u0.sobrestock)}: sobrestock. Más de ${fN(u0.exceso)}: exceso. ${UMB ? 'Son los días de inventario que se esperan de cada distribuidor' + BI(' (' + esc(UMB.fuente || 'MAESTROS.xlsx › T_DOH_OBJETIVO') + ')') + '.' : 'Son los mismos umbrales del reporte de distribuidores en Power BI.'}`
    : `Cada distribuidor tiene sus umbrales, según los días de inventario que se esperan de él${BI(' (' + esc(UMB.fuente || 'MAESTROS.xlsx › T_DOH_OBJETIVO') + ')')}: ` + D.clases.map((c, i) => `<b>${esc(c)}</b>: menos de ${fN(uc[i].riesgo)} días riesgo de quiebre, más de ${fN(uc[i].sobrestock)} sobrestock, más de ${fN(uc[i].exceso)} exceso`).join('; ') + '.';
  $('#v-metodo').innerHTML = `<div class="metodo">
  <section class="panel prosa"><h3>1. De dónde salen los datos</h3>
    ${textoFuentes()}
    <p><b>Sell in (facturado por Brinova)</b>: lo que Brinova le vendió al cliente. En un año, la venta del cliente y lo facturado deben parecerse; cuando no, el producto sale marcado como <i>dato a revisar</i>.</p>
    ${textoInventario()}
    <p>Datos reales hasta <b>${mll(D.corte)}</b>. Generado el ${esc(D.generado)}.${incompletosDe(D.clases).length ? ' Meses incompletos (marcados con ▲ en los gráficos): ' + D.clases.filter(cl => (INCOMP[cl] || []).length).map(cl => esc(cl) + ' ' + INCOMP[cl].map(ml).join(', ')).join(' · ') + '.' : ''}</p>
    ${BI_DET((D.reglaMesesIncompletos ? `<p class="small muted">Regla de mes incompleto: ${esc(D.reglaMesesIncompletos)}</p>` : '')
      + (vd.length ? `<div class="tw"><table class="tbl"><caption style="padding:8px 10px">Fecha de cada fuente${D.versionDatos.sello ? ' · corrida ' + esc(D.versionDatos.sello) : ''}</caption><tbody>${vd.map(([k, v]) => `<tr><td class="l" style="white-space:normal">${k}</td><td>${v}</td></tr>`).join('')}</tbody></table></div>` : ''), 'Ver detalle técnico: regla de mes incompleto y archivos de la corrida')}</section>
  <section class="panel prosa"><h3>2. El algoritmo en 3 pasos</h3>
    <p><b>Paso 1 · Base</b>: cuánto vende en un mes normal. Promedio de los últimos 3, 6 y 12 meses <b>dividido entre los meses con venta</b>; si compró en ${(D.algoritmo || {}).intermitenteMeses || 4} meses o menos del año (compra pocas veces), se divide entre 3, 6 y 12 meses de calendario. Base = promedio de esos tres.</p>
    <p><b>Paso 2 · Temporada</b>: un índice por mes sale de la venta de ese mes en 2024 y 2025 contra un mes normal. 1,00 es un mes normal; 1,20 es un mes 20 % más fuerte. Se limita entre 0,4 y 2,0. A los que compran pocas veces no se les aplica.${(D.algoritmo || {}).temporada === 'solo cadenas' ? ' <b>Solo se aplica en cadenas</b> (venta al consumidor en tienda, que sí repite su temporada cada año); en distribuidores, exportación y venta directa las compras siguen pedidos y contenedores y el índice queda en 1,00.' : ''}</p>
    <p><b>Paso 3 · Reglas</b>: base × índice, redondeado. Si un código lleva <b>6 meses o más sin venta</b>, el algoritmo lo deja en 0.</p>
    <div class="formula">algoritmo del mes = (prom. 3M + prom. 6M + prom. 12M) ÷ 3 × índice del mes</div>
    ${c ? `<p>Ejemplo, <b>${esc(ej.nombre)}</b> en ${esc(ej.clase)} (${esc(un)}): (${fN1(c.l3 / f)} + ${fN1(c.l6 / f)} + ${fN1(c.l12 / f)}) ÷ 3 = ${fN1(base / f)}; × ${nf2.format((c.idx && c.idx[m0]) || 1)} en ${ml(m0)} = <b>${fN1(((c.fc && c.fc[m0]) || 0) / f)}</b>.</p>` : ''}</section>
  <section class="panel prosa"><h3>3. Qué tan bien funciona</h3>
    <p>Se probó pronosticando mayo a octubre de 2026 con datos solo hasta abril, con todos los KAM. Error típico: <b>${esc(D.bt.pc)} %</b> por producto y cliente, <b>${esc(D.bt.cliente)} %</b> por cliente y <b>${esc(D.bt.kam)} %</b> por KAM; en total pronosticó ${esc(D.bt.sesgo)} % de más. El modelo que se usaba antes fallaba ${esc(D.bt.antes)} % por producto.</p>
    ${pk ? `<p><b>Forecast anterior (KAM)</b> (${ml(pk.desde)} – ${ml(pk.hasta)}): ${esc(frasePasado(pk))}.${exclTxt(pk) ? ' ' + esc(exclTxt(pk).replace(/^./, c => c.toUpperCase())) + '.' : ''}${BI(' Contra la venta real: sesgo ' + fP(pk.sesgoReal) + ', precisión ' + (ok(pk.accReal) ? nf.format(pk.accReal * 100) + ' %' : '—') + '. ' + esc(pk.regla || ''))}</p>` : ''}
    <p>Por producto el algoritmo sirve como punto de partida. Tu conocimiento del cliente (promociones, listados nuevos, quiebres) es lo que lo corrige. La tarjeta <b>Forecast anterior (KAM)</b> indica si el forecast tiende a quedar por encima o por debajo de la demanda.</p></section>
  <section class="panel prosa"><h3>4. Qué meses capturas</h3>
    <p>Estamos en el ciclo de <b>${mll(D.ciclo)}</b>. ${esc(mll(MC).replace(/^./, x => x.toUpperCase()))} ya está corriendo: su forecast queda con candado (${OFICIAL_CURSO ? 'el oficial' : 'el de tu formulario vigente'}). Se capturan los ${MK.length} meses siguientes: <b>${rango(MK)}</b>${CAP_HASTA ? ', hasta el ' + fechaCorta(CAP_HASTA) : ''}. Los meses después de la captura muestran el algoritmo como referencia; en “Capturar forecast” → “Todo el año” se ve todo lo cargado.</p>
    <p>Tu forecast es el que usa Brinova para <b>planear producción y compras</b> y para la <b>meta de facturación</b>. El valor en colones es unidades × precio de lista de ese distribuidor. Cuando te separes mucho del algoritmo (más de 50 %), deja un comentario con el motivo.</p>
    <p><b>Avisos de la captura</b>, por código y mes: el aviso <b>rojo</b> aparece solo cuando el forecast supera ${nf.format(X3)} veces el algoritmo <b>y además</b> de ${nf.format(X3M)} veces el mejor mes de venta que ha tenido ese código; ahí conviene dejar el motivo. Si solo pasa de ${nf.format(X3)} veces el algoritmo, verás una <b>nota gris</b>, sin alarma: es para que lo tengas presente. El aviso amarillo es para un código que lleva de ${SV.min} a ${SV.max} meses sin vender.</p></section>
  <section class="panel prosa"><h3>5. Unidades</h3>
    <p>Todo se suma en <b>piezas</b>, la unidad estándar del motor (1 alambrina, 1 esponja). Cada código tiene sus <b>piezas por unidad de venta</b>${BI(' (T_SKU · UNIDAD DE EMPAQUE)')}: una caja de 120 pz son 120 piezas.</p>
    <p>Un producto puede tener varios códigos (unidad, caja, pack). Brinova a veces factura uno y el distribuidor reporta otro, así que se juntan por producto. Con <b>Unidad del formulario</b> ves cada producto en la presentación de tu formulario; con <b>Piezas (unidad estándar)</b>, todo en piezas.</p></section>
  <section class="panel prosa"><h3>6. Inventario y lo que todavía no considera</h3>
    <p><b>Días de inventario</b> = (inventario del distribuidor${P.some(conTransito) ? ' + inventario en tránsito que cuenta' : ''}) ÷ su venta diaria de los últimos 3 meses.${P.some(conTransito) && reglaTransito() ? ' Tránsito que cuenta: ' + esc(reglaTransito()) + '.' : ''} ${umbTxt}</p>
    <p>Todavía no considera promociones y lanzamientos (los registra el KAM)${P.some(conTransito) ? '' : ', órdenes de compra en tránsito'} ni la historia completa de inventario de los distribuidores que no lo mandan cada mes.</p>
    ${D.formFuera && D.formFuera.length ? `<p>Tu formulario también tiene ${D.formFuera.map(esc).join(', ')}, que todavía no tiene fuente de venta para el algoritmo; no aparece aquí.</p>` : ''}</section>
  </div>`;
}

/* ======================================================================================================
   0.5.0 · Contenedores 3D (exportación)
   Escena three.js (import map en la plantilla → jsdelivr three@0.160.0), medidas reales en metros, una InstancedMesh para todas las cajas.
   Datos: D.exportacion (contenedores, empaques, órdenes) cuando el generador los trae; si no, contenedores ISO y empaques de ejemplo,
   marcados en pantalla como "ejemplo". Carga por paredes: desde el fondo hacia la puerta, piso por piso, sin pasar la altura útil.
   ====================================================================================================== */
const EXPO = D.exportacion || null;
const C3 = { tipo: null, fuente: 'kam', desde: null, hasta: null, clase: null, prod: '', pres: '', orden: '', color: 'cat', idx: 0, plan: null, escena: null, tres: null };
const CONT_ISO = [      // respaldo sin exportacion.contenedores: medidas interiores ISO 668 típicas (mm) y carga útil típica (kg), marcadas "Ejemplo"
  { id: "20' estándar", nombre: "20' estándar", largo: 5898, ancho: 2352, alto: 2393, puertaAncho: 2340, puertaAlto: 2280, pesoMax: 28200 },
  { id: "40' estándar", nombre: "40' estándar", largo: 12032, ancho: 2352, alto: 2393, puertaAncho: 2340, puertaAlto: 2280, pesoMax: 26700 },
  { id: "40' High Cube", nombre: "40' High Cube", largo: 12032, ancho: 2352, alto: 2698, puertaAncho: 2340, puertaAlto: 2585, pesoMax: 26500 },
];
const mm = v => { const n = +v; return isFinite(n) && n > 0 ? (n < 50 ? n * 1000 : n) : null; };      // acepta metros o milímetros
function contenedores() {
  const xs = EXPO && Array.isArray(EXPO.contenedores) ? EXPO.contenedores : null;
  if (!xs || !xs.length) return { lista: CONT_ISO, ejemplo: true };
  const lista = xs.map((x, i) => ({ id: String(x.tipo || x.TIPO || x.id || x.codigo || 'C' + i), nombre: String(x.tipo || x.TIPO || x.nombre || x.id || 'Contenedor ' + (i + 1)),
    largo: mm(x.largoMm ?? x.largoM ?? x.largoIntM ?? x.LARGO_INT_M ?? x.largo), ancho: mm(x.anchoMm ?? x.anchoM ?? x.anchoIntM ?? x.ANCHO_INT_M ?? x.ancho), alto: mm(x.altoMm ?? x.altoM ?? x.altoIntM ?? x.ALTO_INT_M ?? x.alto),
    puertaAncho: mm(x.puertaAnchoMm ?? x.puertaAnchoM ?? x.PUERTA_ANCHO_M ?? x.puertaAncho), puertaAlto: mm(x.puertaAltoMm ?? x.puertaAltoM ?? x.PUERTA_ALTO_M ?? x.puertaAlto),
    pesoMax: +(x.pesoMaxKg ?? x.pesoMax ?? x.cargaMaxKg ?? x.CARGA_MAX_KG) || null, sugerencia: x.usarEnSugerencia !== false, orden: +x.orden || i + 1 }))
    .filter(x => x.largo && x.ancho && x.alto).sort((a, b) => (a.orden || 0) - (b.orden || 0));
  return lista.length ? { lista, ejemplo: false } : { lista: CONT_ISO, ejemplo: true };
}
/* tipo inicial desde los datos: el contenedor que más sugiere BI en espacioOrdenes (T_ESPACIO_ORDENES); si no hay, el de mayor volumen
   entre los que se usan en la sugerencia. Nada fijo en el código. */
function tipoInicial(lista) {
  const cnt = new Map();
  ((EXPO && EXPO.espacioOrdenes) || []).forEach(o => { const s = String(o.contenedorSugerido || ''); const k = lista.filter(x => s.includes(x.id)).sort((a, b) => b.id.length - a.id.length)[0]; if (k) cnt.set(k, (cnt.get(k) || 0) + 1); });
  if (cnt.size) return [...cnt.entries()].sort((a, b) => b[1] - a[1])[0][0];
  const cand = lista.filter(x => x.sugerencia !== false);
  return (cand.length ? cand : lista).reduce((a, b) => (b.largo * b.ancho * b.alto > a.largo * a.ancho * a.alto ? b : a));
}
/* empaque de embarque de un código: exportacion.empaques[cod] (T_EMPAQUES). medidas "reales" = largo × ancho × alto (cm);
   si no, cubo equivalente del m³ por caja (ladoCuboCm = M3_CAJA^(1/3)), marcado "medidas estimadas desde m³". Sin datos: tamaño estimado. */
function hashTxt(s) { let h = 2166136261; for (const ch of String(s)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function empaque(p, c) {
  const emp = EXPO && EXPO.empaques, e = !emp ? null : Array.isArray(emp) ? emp.find(x => String(x.cod || x['COD. PRODUCTO'] || '').trim() === c.cod) : (emp[c.cod] || emp[p.clase + '__' + c.cod]);
  if (e) {
    const cm = v => (+v > 0 ? +v * 10 : null), pzCaja = +(e.pzPorCaja ?? e.piezasPorCaja ?? e.PIEZAS_POR_CAJA) || c.pzPorU || 1, pesoR = +(e.pesoKg ?? e.peso ?? e.PESO_KG), peso = pesoR > 0 ? pesoR : 0, sinPeso = !(pesoR > 0);
    const L = mm(e.largoMm) || cm(e.largoCm ?? e.LARGO_CM), A = mm(e.anchoMm) || cm(e.anchoCm ?? e.ANCHO_CM), H = mm(e.altoMm) || cm(e.altoCm ?? e.ALTO_CM);
    if (L && A && H) return { largo: L, ancho: A, alto: H, peso, pzCaja, ejemplo: false, sinPeso };
    const m3 = +(e.m3Caja ?? e.M3_CAJA ?? e.M3_CAJA_NOMINAL), lado = cm(e.ladoCuboCm) || (m3 > 0 ? Math.cbrt(m3) * 1000 : null);
    if (lado) return { largo: lado, ancho: lado, alto: lado, peso, pzCaja, ejemplo: false, cubo: true, sinPeso };
    const h = hashTxt(c.cod);
    return { largo: 480 + h % 160, ancho: 300 + (h >> 8) % 120, alto: 220 + (h >> 16) % 180, peso, pzCaja, ejemplo: false, estimada: true, sinPeso };
  }
  const h = hashTxt(c.cod), pz = c.pzPorU || 1;
  return { largo: 480 + h % 160, ancho: 300 + (h >> 8) % 120, alto: 220 + (h >> 16) % 180, peso: Math.round((2 + pz * 0.04) * 10) / 10, pzCaja: pz, ejemplo: !EXPO, estimada: !!EXPO };
}
const etiquetaMedida = it => it.ejemplo ? ' (ejemplo)' : it.cubo ? ' (medidas estimadas desde m³)' : it.estimada ? ' (sin medidas ni m³: tamaño estimado)' : '';
const capacidadBI = (cod, tipo) => { const x = EXPO && EXPO.capacidad && EXPO.capacidad[cod]; return x ? x[tipo] || null : null; };
/* órdenes reales para la vista 3D, separadas por fuente:
   · "programados" = pedidos programados (productos[].pedidosProgramados.ordenes; cajas = lo pedido);
   · "transito"    = en tránsito que cuenta como inventario (productos[].transito.ordenes).
   Sin esos campos se cae a exportacion.ordenes con programado / cuentaInventario. */
function ordenesFuente(p, f) {
  const k = f === 'transito' ? 'transito' : 'pedidosProgramados';
  if (p[k] && Array.isArray(p[k].ordenes)) return p[k].ordenes;
  if (!EXPO || !Array.isArray(EXPO.ordenes)) return [];
  return EXPO.ordenes.filter(o => { const n = normOrden(o); return String(n.clase).toUpperCase() === p.clase.toUpperCase() && p.codigos.some(c => c.cod === n.cod) && (f === 'transito' ? o.cuentaInventario === true : o.programado === true); });
}
const ordenesDe = p => ordenesFuente(p, 'transito').concat(ordenesFuente(p, 'programados'));
const mesOrden = o => { const n = normOrden(o); return n.mes || String(n.eta).slice(0, 7); };
const esFuenteOrden = f => f === 'transito' || f === 'programados';
const hayOrdenes = f => P.some(p => ordenesFuente(p, f).length);
const hayTransito = () => hayOrdenes('transito');
const FUENTES3 = [['kam', 'Forecast KAM'], ['alg', 'Algoritmo'], ['programados', 'Pedidos programados'], ['transito', 'En tránsito']];
function mesesFuente(f) {
  if (f === 'kam') return MV.slice();
  if (f === 'alg') return MF.slice();
  const s = new Set(); P.forEach(p => ordenesFuente(p, f).forEach(o => { const m = mesOrden(o); if (/^\d{4}-\d{2}$/.test(m)) s.add(m); }));
  return [...s].sort();
}
/* lista de órdenes de la clase para el filtro "Orden" (más cajas primero) */
function ordenesClase(f, cl, ms) {
  const g = new Map();
  P.filter(p => p.clase === cl).forEach(p => ordenesFuente(p, f).forEach(o => { const n = normOrden(o); if (ms && !ms.includes(mesOrden(o))) return; const x = g.get(n.orden) || { orden: n.orden, cliente: o.cliente || '', cajas: 0, mes: mesOrden(o) }; x.cajas += n.cajas || 0; g.set(n.orden, x); }));
  return [...g.values()].sort((a, b) => b.cajas - a.cajas);
}
const PAL3 = ['#149CDC', '#D9661A', '#1A7F37', '#6250D6', '#C5281C', '#B07A00', '#2E8B8B', '#D35D8A', '#5D6A73', '#7A9A01', '#8E44AD', '#0A5E8A'];      // tonos bien separados entre vecinos
function colorDe(p) {
  const k = C3.color === 'cat' ? (p.cat || 'Sin categoría') : p.id;
  const ord = C3.color === 'cat' ? (ordenCategorias() || [...new Set(P.map(x => x.cat))].sort()) : null;
  const i = ord && ord.indexOf(k) >= 0 ? ord.indexOf(k) : hashTxt(k);
  return PAL3[i % PAL3.length];
}

/* cajas a cargar con los filtros vigentes */
function itemsCarga() {
  const ms = mesesFuente(C3.fuente).filter(m => m >= C3.desde && m <= C3.hasta), out = [];
  P.filter(p => p.clase === C3.clase && (!C3.prod || p.id === C3.prod)).forEach(p => p.codigos.forEach(c => {
    if (C3.pres && presDe(c).toLowerCase() !== C3.pres) return;
    const e = empaque(p, c);
    let cajas = 0, pz = 0;
    if (esFuenteOrden(C3.fuente)) {      // órdenes reales: cajas tal como vienen (pedidas o que viajan) y sus piezas
      ordenesFuente(p, C3.fuente).forEach(o => { const n = normOrden(o); if ((n.cod || p.principal) !== c.cod || !ms.includes(mesOrden(o)) || (C3.orden && n.orden !== C3.orden)) return; cajas += n.cajas || 0; pz += n.piezas || (n.cajas || 0) * e.pzCaja; });
      cajas = Math.ceil(cajas - 1e-9);
    } else {
      let u = 0;
      if (C3.fuente === 'kam') u = ms.reduce((a, m) => a + kamU(c, m), 0);
      else { if (c.cod !== p.principal || !c.pzPorU) return; u = ms.reduce((a, m) => a + (p.alg[m] || 0), 0) / c.pzPorU; }
      pz = u * (c.pzPorU || 1); cajas = Math.ceil(pz / (e.pzCaja || 1) - 1e-9);
    }
    if (cajas > 0) out.push(Object.assign({ p, c, cajas, piezas: Math.round(pz), color: colorDe(p) }, e));
  }));
  return out.sort((a, b) => b.alto - a.alto || b.largo * b.ancho - a.largo * a.ancho);
}
/* plan de carga por paredes con columnas mixtas: una pared tiene la profundidad de su primera caja; dentro de la pared se arman columnas
   a lo ancho y cada columna se apila hasta la altura útil, mezclando productos si la caja cabe (más angosta y no más profunda que la pared).
   Las cajas solo giran sobre su base (nunca se acuestan). Se carga del fondo hacia la puerta; con más peso que la carga máxima se abre otro contenedor. */
function empacar(items, k) {
  const L = k.largo, W = k.ancho, H = k.alto, Pm = k.pesoMax || Infinity, conts = [], noCaben = [], Vutil = L * W * H * (factorLlenado() || 1);      // factor de llenado de BI (T_PARAMETROS_EXPORTACION)
  const nuevo = () => ({ cajas: [], peso: 0, vol: 0, porItem: new Map(), pared: null, xFin: 0 });
  let cur = nuevo();
  const cerrar = () => { if (cur.cajas.length) conts.push(cur); cur = nuevo(); };
  const poner = (it, l, w, h, x0, z0, y0) => {
    cur.cajas.push({ it, x: x0 + l / 2, y: y0 + h / 2, z: -W / 2 + z0 + w / 2, l, w, h });
    cur.peso += it.peso; cur.vol += l * w * h; cur.porItem.set(it, (cur.porItem.get(it) || 0) + 1);
  };
  function colocar(it) {
    const h = it.alto, ori = [[it.largo, it.ancho], [it.ancho, it.largo]].filter(([l, w]) => l <= L && w <= W && h <= H);
    if (!ori.length) return false;
    if ((cur.peso + it.peso > Pm || cur.vol + it.largo * it.ancho * it.alto > Vutil) && cur.cajas.length) cerrar();
    const pa = cur.pared;
    if (pa) {
      const col = pa.cols[pa.cols.length - 1];
      // 1) encima de la columna actual
      const o1 = ori.filter(([l, w]) => l <= pa.d && w <= col.w).sort((a, b) => b[1] - a[1])[0];
      if (o1 && col.y + h <= H) { poner(it, o1[0], o1[1], h, pa.x0, col.z0, col.y); col.y += h; return true; }
      // 2) columna nueva en la misma pared
      const o2 = ori.filter(([l, w]) => l <= pa.d && pa.z + w <= W).sort((a, b) => a[1] - b[1])[0];
      if (o2) { pa.cols.push({ z0: pa.z, w: o2[1], y: h }); poner(it, o2[0], o2[1], h, pa.x0, pa.z, 0); pa.z += o2[1]; return true; }
    }
    // 3) pared nueva (la orientación más delgada en profundidad), o contenedor nuevo si no queda largo
    const x0 = pa ? pa.x0 + pa.d : 0, o3 = ori.slice().sort((a, b) => a[0] - b[0])[0];
    if (x0 + o3[0] > L) { cerrar(); return colocar(it); }
    cur.pared = { x0, d: o3[0], z: o3[1], cols: [{ z0: 0, w: o3[1], y: h }] };
    poner(it, o3[0], o3[1], h, x0, 0, 0); cur.xFin = x0 + o3[0];
    return true;
  }
  items.forEach(it => { for (let r = 0; r < it.cajas; r++) if (!colocar(it)) { noCaben.push(it); break; } });
  cerrar();
  return { conts, noCaben, vol: L * W * H, k };
}

/* ---------- pantalla ---------- */
function opcionesC3() {
  const ms = mesesFuente(C3.fuente);
  if (!C3.clase || !D.clases.includes(C3.clase)) C3.clase = S.dist !== 'TODOS' ? S.dist : D.clases[0];
  if (!ms.includes(C3.desde)) C3.desde = ms.includes(MK[0]) ? MK[0] : ms[0];
  if (!ms.includes(C3.hasta) || C3.hasta < C3.desde) C3.hasta = C3.desde;
  if (C3.prod && !P.some(p => p.id === C3.prod && p.clase === C3.clase)) C3.prod = '';
  return ms;
}
const conExportacion = () => !!EXPO || KAMN === 'MONICA';
const factorLlenado = () => { const x = EXPO || {}, pr = x.parametros || {}, f = pr.FACTOR_LLENADO; const v = +(x.factorLlenado ?? x.FACTOR_LLENADO ?? (f && typeof f === 'object' ? f.valor : f) ?? pr.factorLlenado); return v > 0 && v <= 1 ? v : null; };      // T_PARAMETROS_EXPORTACION
function pintarContenedor() {
  const box = $('#v-contenedor'); if (!box) return;
  const ms = opcionesC3(), { lista, ejemplo } = contenedores(), k = lista.find(x => x.id === C3.tipo) || tipoInicial(lista); C3.tipo = k.id;
  const prods = P.filter(p => p.clase === C3.clase).sort((a, b) => a.nombre.localeCompare(b.nombre));
  const pres = [...new Set(prods.flatMap(p => p.codigos.map(c => presDe(c).toLowerCase())))].filter(Boolean).sort();
  const items = itemsCarga(), plan = empacar(items, k); C3.plan = plan; if (C3.idx >= plan.conts.length) C3.idx = 0;
  const ejEmp = items.some(i => i.ejemplo), totC = items.reduce((a, i) => a + i.cajas, 0), totPz = items.reduce((a, i) => a + i.piezas, 0);
  const volT = items.reduce((a, i) => a + i.cajas * i.largo * i.ancho * i.alto, 0) / 1e9, pesoT = items.reduce((a, i) => a + i.cajas * i.peso, 0);
  const cu = plan.conts[C3.idx], n = plan.conts.length, pct = x => nf.format(x * 100) + ' %';
  const sel = (id, lbl, opts, val) => `<label class="c3-f"><span>${lbl}</span><select id="${id}">${opts.map(([v, t]) => `<option value="${esc(v)}"${v === val ? ' selected' : ''}>${esc(t)}</option>`).join('')}</select></label>`;
  const seg = (attr, opts, val) => `<div class="seg" role="group">${opts.map(([v, t, dis]) => `<button type="button" data-${attr}="${esc(v)}" aria-pressed="${v === val}"${dis ? ' disabled title="Sin órdenes de esta fuente en los datos"' : ''}>${esc(t)}</button>`).join('')}</div>`;
  box.innerHTML = `<section class="panel c3" aria-labelledby="c3-t">
    <div class="panel-h"><h2 id="c3-t">Contenedores 3D</h2><span class="nota">${esc(k.nombre)} · interior ${nf2.format(k.largo / 1000)} × ${nf2.format(k.ancho / 1000)} × ${nf2.format(k.alto / 1000)} m · ${nf1.format(k.largo * k.ancho * k.alto / 1e9)} m³${k.pesoMax ? ' · carga máxima ' + fN(k.pesoMax) + ' kg' : ''}</span></div>
    ${ejemplo || ejEmp ? `<p class="aviso info c3-ej"><b>Ejemplo.</b> ${ejemplo ? 'Contenedores con medidas ISO estándar. ' : ''}${ejEmp ? 'Las cajas usan medidas de empaque estimadas. ' : ''}Los datos reales de contenedores y empaques llegan con la próxima carga.</p>` : ''}
    ${items.some(i => i.cubo || i.estimada) ? `<p class="small muted c3-ej">${items.some(i => i.cubo) ? 'Medidas estimadas desde m³: las cajas sin largo, ancho y alto se dibujan como el cubo equivalente de su m³ por caja (T_EMPAQUES · M3_CAJA). ' : ''}${items.some(i => i.estimada) ? 'Algunas cajas no tienen medidas ni m³ en T_EMPAQUES: se dibujan con un tamaño estimado. ' : ''}${factorLlenado() ? 'Se llena hasta el ' + nf.format(factorLlenado() * 100) + ' % del volumen interior (factor de llenado de BI).' : ''}</p>` : (factorLlenado() ? `<p class="small muted c3-ej">Se llena hasta el ${nf.format(factorLlenado() * 100)} % del volumen interior (factor de llenado de BI).</p>` : '')}
    <details class="c3-filtros-box"${C3.filtros ?? !matchMedia('(max-width: 620px)').matches ? ' open' : ''}><summary>Filtros</summary><div class="c3-filtros">
      <div class="c3-f"><span>Contenedor</span>${seg('c3tipo', lista.map(x => [x.id, x.nombre]), C3.tipo)}</div>
      <div class="c3-f"><span>Fuente</span>${seg('c3fuente', FUENTES3.map(([v, t]) => [v, t, esFuenteOrden(v) && !hayOrdenes(v)]), C3.fuente)}</div>
      ${sel('c3-desde', 'Desde', ms.map(m => [m, ml(m)]), C3.desde)}${sel('c3-hasta', 'Hasta', ms.filter(m => m >= C3.desde).map(m => [m, ml(m)]), C3.hasta)}
      ${sel('c3-clase', 'Distribuidor', D.clases.map(c => [c, c]), C3.clase)}
      ${sel('c3-prod', 'Producto', [['', 'Todos los productos']].concat(prods.map(p => [p.id, p.nombre])), C3.prod)}
      ${sel('c3-pres', 'Presentación', [['', 'Todas']].concat(pres.map(x => [x, x.charAt(0).toUpperCase() + x.slice(1)])), C3.pres)}
      ${esFuenteOrden(C3.fuente) ? sel('c3-orden', 'Orden', [['', 'Todas las órdenes']].concat(ordenesClase(C3.fuente, C3.clase, ms.filter(m => m >= C3.desde && m <= C3.hasta)).map(o => [o.orden, o.orden + (o.cliente ? ' · ' + o.cliente : '') + ' · ' + fN(o.cajas) + ' cajas'])), C3.orden) : ''}
      ${sel('c3-color', 'Color por', [['cat', 'Categoría'], ['prod', 'Producto']], C3.color)}
    </div></details>
    <div class="c3-kpis">
      <div><span>Cajas a cargar</span><b>${fN(totC)}</b><small>${fN(totPz)} pz · ${nf1.format(volT)} m³ · ${items.length && items.every(i => i.sinPeso) ? 'peso sin dato' : fN(pesoT) + ' kg'}</small></div>
      <div><span>Contenedores necesarios</span><b>${fN(n)}</b><small>${esc(k.nombre)}${plan.noCaben.length ? ' · ' + plan.noCaben.length + ' empaques no caben por medida' : ''}</small></div>
      <div><span>Contenedor ${n ? C3.idx + 1 : 0} de ${n}</span><b>${cu ? fN(cu.cajas.length) + ' cajas' : '—'}</b><small>${cu ? (n > 1 ? 'caben en este; ' + fN(totC - cu.cajas.length) + ' cajas van en los otros ' + (n - 1) : 'toda la carga cabe aquí') : 'sin carga con estos filtros'}</small></div>
      <div><span>Ocupación de este contenedor</span><b>${cu ? pct(cu.vol / plan.vol) + ' vol.' : '—'}</b><small>${cu && items.length && items.every(i => i.sinPeso) ? 'peso: sin dato en T_EMPAQUES' : cu && k.pesoMax ? pct(cu.peso / k.pesoMax) + ' del peso (' + fN(cu.peso) + ' kg)' : ''}</small><span class="c3-bar" aria-hidden="true"><i style="width:${cu ? Math.min(100, cu.vol / plan.vol * 100).toFixed(1) : 0}%"></i></span></div>
    </div>
    ${n > 1 ? `<nav class="c3-nav" aria-label="Contenedores">${plan.conts.map((x, i) => `<button type="button" class="c3-mini" data-c3idx="${i}" aria-pressed="${i === C3.idx}" aria-label="Contenedor ${i + 1}: ${fN(x.cajas.length)} cajas, ${pct(x.vol / plan.vol)} del volumen"><b>${i + 1}</b><span class="c3-bar" aria-hidden="true"><i style="width:${Math.min(100, x.vol / plan.vol * 100).toFixed(0)}%"></i></span><small>${pct(x.vol / plan.vol)}</small></button>`).join('')}</nav>` : ''}
    <div class="c3-escena-box">
      <div id="c3-escena" class="c3-escena" role="img" aria-label="${esc(cu ? `${k.nombre}, contenedor ${C3.idx + 1} de ${n}: ${cu.cajas.length} cajas, ${pct(cu.vol / plan.vol)} del volumen. El detalle está en la tabla Plan de carga.` : 'Contenedor vacío con estos filtros')}"><p class="c3-msg">Cargando la vista 3D…</p></div>
      <div class="c3-tip" id="c3-tip" hidden></div>
      <div class="c3-ctrl">
        <button type="button" class="btn" data-c3cam="34">Vista 3/4</button><button type="button" class="btn" data-c3cam="puerta">Desde la puerta</button><button type="button" class="btn" data-c3cam="planta">Planta</button>
        <button type="button" class="btn" id="c3-anim" data-c3anim>Repetir carga</button>
        ${n > 1 ? `<button type="button" class="btn" data-c3idx="${Math.max(0, C3.idx - 1)}"${C3.idx ? '' : ' disabled'} aria-label="Contenedor anterior">‹</button><button type="button" class="btn" data-c3idx="${Math.min(n - 1, C3.idx + 1)}"${C3.idx < n - 1 ? '' : ' disabled'} aria-label="Contenedor siguiente">›</button>` : ''}
      </div>
    </div>
    <div class="legend c3-ley">${leyenda3(cu)}</div>
    <p class="small muted">Arrastre para girar; rueda o pellizco para acercar. Al seleccionar una caja se muestra su producto. Las cajas no se acuestan: solo giran sobre su base. La carga va del fondo hacia la puerta, piso por piso, sin pasar la altura útil.</p>
    <details class="c3-plan"><summary>Plan de carga (tabla)</summary>${tablaPlan(plan)}</details>
  </section>`;
  dibujar3D(plan);
}
function leyenda3(cu) {
  if (!cu) return '';
  const g = new Map();
  cu.porItem.forEach((nC, it) => { const k = C3.color === 'cat' ? (it.p.cat || 'Sin categoría') : it.p.nombre; const o = g.get(k) || { color: it.color, cajas: 0 }; o.cajas += nC; g.set(k, o); });
  return [...g.entries()].sort((a, b) => b[1].cajas - a[1].cajas).map(([k, o]) => `<span><i class="sw col" style="background:${o.color}"></i>${esc(C3.color === 'cat' ? nombreCat(k) : k)} · ${fN(o.cajas)} cajas</span>`).join('');
}
function tablaPlan(plan) {
  const filas = []; plan.conts.forEach((x, i) => x.porItem.forEach((nC, it) => filas.push([i + 1, it, nC])));
  if (!filas.length) return '<p class="small muted">Sin carga con estos filtros.</p>';
  return `<div class="tw" role="region" tabindex="0" aria-label="Plan de carga" style="max-height:320px"><table class="tbl"><thead><tr><th>Cont.</th><th class="l">Producto</th><th class="l">Presentación</th><th>Cajas</th><th>Piezas</th><th class="l">Caja (cm)</th><th>Kg por caja</th></tr></thead><tbody>
    ${filas.map(([i, it, nC]) => `<tr><td>${i}</td><td class="l" style="white-space:normal">${esc(descB(it.c))}</td><td class="l">${esc(cNom(it.c))}</td><td>${fN(nC)}</td><td>${fN(nC * it.pzCaja)}</td><td class="l">${nf.format(it.largo / 10)} × ${nf.format(it.ancho / 10)} × ${nf.format(it.alto / 10)}${etiquetaMedida(it)}</td><td>${nf1.format(it.peso)}</td></tr>`).join('')}
    </tbody></table></div>${plan.noCaben.length ? `<p class="aviso" style="margin-top:8px">No caben por medida en este contenedor: ${plan.noCaben.map(i => esc(descB(i.c))).join(', ')}.</p>` : ''}`;
}

/* ---------- escena three.js ---------- */
const MOV_REDUCIDO = () => !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
async function cargarTres() {
  if (C3.tres) return C3.tres;
  const [THREE, oc] = await Promise.all([import('three'), import('three/addons/controls/OrbitControls.js')]);      // import map de la plantilla
  return (C3.tres = { THREE, OrbitControls: oc.OrbitControls });
}
async function dibujar3D(plan) {
  const el = $('#c3-escena'); if (!el) return;
  let T;
  try { T = await cargarTres(); } catch (e) { el.innerHTML = `<p class="c3-msg">No se pudo cargar la vista 3D (${esc(e && e.message || e)}). El plan de carga sigue disponible en la tabla.</p>`; return; }
  if (!$('#c3-escena') || C3.plan !== plan) return;
  if (C3.escena) C3.escena.destruir();
  try { C3.escena = escena3D(T, $('#c3-escena'), plan, plan.conts[C3.idx]); }
  catch (e) { C3.escena = null; $('#c3-escena').innerHTML = `<p class="c3-msg">Este navegador no pudo dibujar la vista 3D (${esc(e && e.message || e)}). El plan de carga sigue disponible en la tabla.</p>`; }
}
function escena3D(T, el, plan, cont) {
  const { THREE, OrbitControls } = T, k = plan.k, Lm = k.largo / 1000, Wm = k.ancho / 1000, Hm = k.alto / 1000, movil = matchMedia('(pointer: coarse)').matches;
  el.innerHTML = '';
  const renderer = new THREE.WebGLRenderer({ antialias: !movil, alpha: false, powerPreference: 'high-performance', preserveDrawingBuffer: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, movil ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  el.appendChild(renderer.domElement); renderer.domElement.setAttribute('aria-hidden', 'true');
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#F4F7F9');
  const camera = new THREE.PerspectiveCamera(38, 1, 0.05, 200);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xc9d1d8, 1.25));
  const sol = new THREE.DirectionalLight(0xffffff, 1.35); sol.position.set(Lm * 0.3, Hm * 4, Wm * 3); scene.add(sol);
  const g0 = new THREE.Group(); g0.position.set(-Lm / 2, 0, 0); scene.add(g0);       // x: 0 = fondo, Lm = puerta
  const piso = new THREE.Mesh(new THREE.BoxGeometry(Lm, 0.02, Wm), new THREE.MeshStandardMaterial({ color: '#B9C3CB', roughness: 0.9 })); piso.position.set(Lm / 2, -0.01, 0); g0.add(piso);
  const vidrio = new THREE.MeshBasicMaterial({ color: '#8FA1B0', transparent: true, opacity: 0.12, side: THREE.DoubleSide, depthWrite: false });
  [[Lm, Hm, 0.005, Lm / 2, Hm / 2, -Wm / 2], [0.005, Hm, Wm, 0, Hm / 2, 0]]      // solo la pared del fondo y la lateral lejana: lo demás deja ver la carga
    .forEach(([a, b, c, x, y, z]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(a, b, c), vidrio); m.position.set(x, y, z); g0.add(m); });
  const aristas = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(Lm, Hm, Wm)), new THREE.LineBasicMaterial({ color: '#5D6A73' })); aristas.position.set(Lm / 2, Hm / 2, 0); g0.add(aristas);
  const pA = (k.puertaAncho || k.ancho) / 1000, pH = (k.puertaAlto || k.alto) / 1000;
  const marco = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(pA, pH)), new THREE.LineBasicMaterial({ color: '#0A78AE' })); marco.rotation.y = Math.PI / 2; marco.position.set(Lm + 0.005, pH / 2, 0); g0.add(marco);
  // cajas: una sola InstancedMesh con color por instancia (miles de cajas en una llamada de dibujo)
  const cajas = cont ? cont.cajas : [], n = cajas.length, hueco = 0.012;
  const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ roughness: 0.75, metalness: 0 }), Math.max(1, n));
  mesh.count = n; mesh.frustumCulled = false; g0.add(mesh);      // las instancias se mueven: la esfera de recorte calculada al inicio quedaría vieja
  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), Sx = new THREE.Vector3(), Pv = new THREE.Vector3(), col = new THREE.Color();
  const fin = cajas.map(b => new THREE.Vector3(b.x / 1000, b.y / 1000, b.z / 1000));
  cajas.forEach((b, i) => { col.set(b.it.color); col.offsetHSL(0, 0, ((i % 3) - 1) * 0.035); mesh.setColorAt(i, col); });
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  const poner = (i, pos) => { const b = cajas[i]; Sx.set(b.l / 1000 - hueco, b.h / 1000 - hueco, b.w / 1000 - hueco); M.compose(pos, Q, Sx); mesh.setMatrixAt(i, M); };
  // cámara y controles (mouse y táctil)
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.maxPolarAngle = Math.PI * 0.49; controls.minDistance = 1;
  const vistas = { '34': [0.62, 0.5, 0.6], puerta: [1, 0.22, 0.0001], planta: [0.0001, 1, 0.0001] };
  // render a demanda: solo mientras hay animación o la cámara se mueve
  let vivo = 0, raf = 0, anim = null;
  function cuadro(t) {
    raf = 0;
    if (anim) anim(t);
    const mov = controls.update();
    renderer.render(scene, camera);
    if (anim || mov || vivo > 0) { vivo = Math.max(0, vivo - 1); raf = requestAnimationFrame(cuadro); }
  }
  const pedir = (frames = 2) => { vivo = Math.max(vivo, frames); if (!raf) raf = requestAnimationFrame(cuadro); };
  function camara(v) {      // encuadra todo el contenedor según el campo de visión y el ancho de la pantalla
    const d0 = vistas[v] || vistas['34'], len = Math.hypot(...d0), fov = camera.fov * Math.PI / 180, fovH = 2 * Math.atan(Math.tan(fov / 2) * camera.aspect);
    const R = Math.hypot(Lm, Hm, Wm) / 2, dist = R / Math.sin(Math.min(fov, fovH) / 2) * (v === 'puerta' ? 0.55 : v === 'planta' ? 0.62 : 0.72);
    camera.position.set(d0[0] / len * dist, Hm * 0.3 + d0[1] / len * dist, d0[2] / len * dist);
    controls.target.set(0, Hm * 0.3, 0); controls.maxDistance = dist * 2.2; controls.update(); pedir();
  }
  controls.addEventListener('change', () => pedir(2));
  // animación de carga: las cajas entran por la puerta en orden de carga; con movimiento reducido se muestra la carga final.
  // El botón la omite mientras corre (control visible para detener el movimiento) y la repite cuando termina.
  const btn = $('#c3-anim');
  function cargar(animar) {
    if (!n) { pedir(); return; }
    if (!animar || MOV_REDUCIDO()) { anim = null; fin.forEach((p, i) => poner(i, p)); mesh.instanceMatrix.needsUpdate = true; if (btn) btn.textContent = 'Repetir carga'; pedir(); return; }
    const dur = 420, paso = Math.min(14, 2600 / n), t0 = performance.now(), afuera = Lm + 1.2;
    if (btn) btn.textContent = 'Omitir animación';
    anim = t => {
      let listo = true;
      for (let i = 0; i < n; i++) {
        const u = Math.min(1, Math.max(0, (t - t0 - i * paso) / dur)); if (u < 1) listo = false;
        const e = 1 - Math.pow(1 - u, 3), f = fin[i];
        if (u === 0) Pv.set(afuera + 3, f.y, f.z); else Pv.set(f.x + (afuera - f.x) * (1 - e), f.y + 0.25 * (1 - e), f.z);
        poner(i, Pv);
      }
      mesh.instanceMatrix.needsUpdate = true;
      if (listo) { anim = null; if (btn) btn.textContent = 'Repetir carga'; }
    };
    pedir();
  }
  // selección: tooltip con producto, presentación, cajas y piezas en este contenedor
  const ray = new THREE.Raycaster(), ptr = new THREE.Vector2(), tip = $('#c3-tip');
  function tocar(ev) {
    const r = renderer.domElement.getBoundingClientRect(); ptr.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ptr, camera); const h = ray.intersectObject(mesh)[0];
    if (!h || h.instanceId == null || !tip) { if (tip) tip.hidden = true; return; }
    const it = cajas[h.instanceId].it, nC = cont.porItem.get(it) || 0;
    tip.innerHTML = `<b>${esc(descB(it.c))}</b><span>${esc(cNom(it.c))} · caja ${nf.format(it.largo / 10)} × ${nf.format(it.ancho / 10)} × ${nf.format(it.alto / 10)} cm${etiquetaMedida(it)}</span>${capacidadBI(it.c.cod, k.id) ? `<span>Capacidad BI: ${fN(capacidadBI(it.c.cod, k.id).cajas)} cajas de este producto por contenedor</span>` : ''}<span>${fN(nC)} cajas en este contenedor · ${fN(nC * it.pzCaja)} pz · ${fN(it.cajas)} cajas en total</span>`;
    tip.hidden = false;
    const tw = tip.offsetWidth || 240, x = ev.clientX - r.left, y = ev.clientY - r.top;
    tip.style.left = Math.max(4, Math.min(r.width - tw - 4, x + 12)) + 'px'; tip.style.top = Math.max(4, y - 10) + 'px';
  }
  let abajo = null;
  renderer.domElement.addEventListener('pointerdown', ev => { abajo = [ev.clientX, ev.clientY]; });
  renderer.domElement.addEventListener('pointerup', ev => { if (abajo && Math.hypot(ev.clientX - abajo[0], ev.clientY - abajo[1]) < 6) tocar(ev); abajo = null; });
  const ajustar = () => { const w = el.clientWidth || 600, h = el.clientHeight || 420; renderer.setSize(w, h, false); renderer.domElement.style.width = '100%'; renderer.domElement.style.height = '100%'; camera.aspect = w / h; camera.updateProjectionMatrix(); pedir(); };
  const ro3 = new ResizeObserver(ajustar); ro3.observe(el);
  ajustar(); camara('34'); cargar(true);
  return {
    camara, animando: () => !!anim, recargar: () => cargar(!anim),
    destruir() { cancelAnimationFrame(raf); ro3.disconnect(); controls.dispose(); scene.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) [].concat(o.material).forEach(m => m.dispose()); }); renderer.dispose(); renderer.domElement.remove(); },
  };
}

/* ---------- detalle del producto (<dialog> modal) ---------- */
function abrir(id) {
  const p = PID[id]; if (!p) return;
  S.abierto = id;
  /* 070-DETALLE: se pinta antes de showModal() para que el autofocus caiga en el botón Cerrar del producto nuevo;
     si ya estaba abierto (otro distribuidor del mismo producto), el foco vuelve a Cerrar porque el botón tocado desaparece */
  const d = $('#det'), yaAbierto = d.open;
  if (!yaAbierto) abrir.desde = document.activeElement;
  pintarDetalle(p);
  if (!yaAbierto) d.showModal(); else { const c = d.querySelector('.cerrar'); if (c) c.focus(); }
  const sc = $('#det .det-in'); if (sc) sc.scrollTop = 0;
}
function cerrar() { const d = $('#det'); if (d.open) d.close(); }
function cfgProducto(p) {
  return { meses: mesesGraf(), series: seriesDe([p], p), estados: true, incompletos: INCOMP[p.clase] || [], exclKam: exclKamDe([p.clase]), eje: fCx, tip: v => fN1(v) + ' ' + uNom(p), titulo: 'Mes a mes de ' + p.nombre, izq: 50 };
}
function graficoProducto(p) {
  const el = $('#ch-prod'); if (!el) return;
  const o = cfgProducto(p);
  grafico(el, o);
  $('#lg-prod').innerHTML = leyenda(o.series, true);
  const tb = document.querySelector('[data-tabla="ch-prod"]'); if (tb && tb.getAttribute('aria-pressed') === 'true') $('#ch-prod-tb').innerHTML = tablaSeries(o);
}
function lecturaProducto(p) {
  const f = fac(p), t = tend(p), m0 = MK[0], vigN = p.codigos.reduce((s, c) => s + (vig(c, m0) || 0) * (c.pzPorU || 0), 0) / f;
  return `La venta de los últimos 3 meses (${fN1(p.d3 / f)} ${esc(uNom(p))}) va ${t == null ? 'sin base de comparación' : (t >= 0 ? 'arriba ' : 'abajo ') + fP(Math.abs(t)).replace('+', '') + ' contra el año anterior'}. Para ${ml(m0)} el algoritmo propone <b>${fN1((p.alg[m0] || 0) / f)}</b> y el formulario vigente registra <b>${fN1(vigN)}</b>.${p.inv && dias(p) != null ? ` El distribuidor tiene inventario para <b>${diasTxt(dias(p))}</b>${invViejo(p.clase) ? ' (' + esc(viejoTxt(fechaInv(p.clase))) + ')' : ''}.` : ''}${sesgoProducto(p) != null ? ` En los últimos 12 meses el forecast de este producto estuvo <b>${fP(sesgoProducto(p))}</b> contra la venta real (meses con forecast).` : ''}`;
}
function bloqueCaptura(p, c) {
  const pr = precioU(p, c), desc = c.precio && c.precioFact ? 1 - c.precioFact / c.precio : null, av = c.avanceU != null ? c.avanceU : (c.cod === p.principal && c.pzPorU && p.avanceSellInPz && p.avanceSellInPz[MC] != null ? p.avanceSellInPz[MC] / c.pzPorU : null);
  let h = `<div class="cod"><div class="cod-nom"><b>${esc(descB(c))}</b>${nombreDist(p, c)}</div><div class="cod-h"><span class="muted">${esc(c.cod)}</span><span>${esc(cNom(c))}</span>
    <span class="pill kam">lista ${pr != null ? fC2(pr) : 'sin precio'}</span>
    ${c.precioFact ? `<span class="pill kam">facturado ${fC2(c.precioFact)}${desc != null ? ' · ' + nf.format(desc * 100) + ' % desc.' : ''}</span>` : ''}</div>
    <p class="small muted">${ICO.lock} ${ml(MC)} en curso: <b>${fN(vig(c, MC))}</b> ${esc(plural(presDe(c)))} (${OFICIAL_CURSO ? 'oficial' : 'vigente'}, no se cambia)${av != null ? ' · facturado al ' + esc(fechaCorta(D.avanceHasta)) + ': ' + fN1(av) : ''} · sell in 12 meses: ${fN(c.u12)} (${fN1((c.u12 || 0) / 12)} al mes)</p>
    <div class="meses">`;
  MK.forEach(m => { h += `<label class="mes">${ml(m)}${celdaInput(p, c, m, 'd')}</label>`; });
  h += `</div><div style="display:flex;gap:8px;flex-wrap:wrap">
    ${c.cod === p.principal && c.pzPorU ? `<button type="button" class="btn" data-usar-alg="${esc(c.id)}"${VENCIDO ? ' disabled' : ''}>Copiar el algoritmo</button>` : ''}
    <button type="button" class="btn" data-volver="${esc(c.id)}"${VENCIDO ? ' disabled' : ''}>Volver a mi formulario</button></div></div>`;
  return h;
}
function textoCierre(p) {
  const t = tipoDe(p.clase), f = fac(p);
  if (t === 'sell in directo') return `En ${esc(p.clase)} la demanda es lo que Brinova facturó: la razón contra el sell in siempre da 1.`;
  const r = `En 12 meses ${t === 'sell out' ? 'las tiendas vendieron al consumidor' : 'el distribuidor vendió'} ${fN(p.d12)} pz (${fN1(p.d12 / f)} ${esc(uNom(p))}) y Brinova le facturó ${fN(p.s12)} pz (${fN1(p.s12 / f)} ${esc(uNom(p))}).`;
  if (p.cierre === 'OK') return r + ' Cuadra: la tendencia es confiable.';
  if (p.cierre === 'COMPRA SIN VENDER') return r + ' El distribuidor compra pero no reporta venta de este producto: puede estar con otro código en su reporte. Avisa a BI si lo vende.';
  if (p.cierre === 'VENDE SIN COMPRAR') return r + ' Reporta venta sin compras en el año: inventario viejo o código cruzado. Tómalo con cuidado.';
  return r + ' No cuadra: puede ser un problema de unidad en el reporte del distribuidor. BI lo está revisando; usa tu criterio.';
}
/* 0.6.0: el origen de la demanda en una línea, en palabras del KAM (lo técnico queda en BI) */
function fuenteUnaLinea(p) {
  const cl = p.clase, t = tipoDe(cl), fu = ((D.distribuidores[cl] || {}).fuente || []).filter(x => x && x !== cl);
  const base = t === 'sell through' ? 'Reporte de ventas de ' + (fu.length ? fu.join('/') : cl) : t === 'sell out' ? 'Escáner de las tiendas de ' + cl : 'Facturación de Brinova a ' + cl;
  return 'Fuente: ' + base + ((mezclaDe(cl) || cl === 'PANAMA') && t !== 'sell in directo' ? ' + facturación directa a Supermercados Xtra' : '') + ', en ' + uNom(p);
}
function htmlOrigen(p) {
  const t = tipoDe(p.clase), dir = t === 'sell in directo', f = fac(p), L12 = MH.slice(-12), inc = INCOMP[p.clase] || [];
  const og = p.origenPz && Object.keys(p.origenPz).length ? p.origenPz : null, ogT = og ? Object.values(og).reduce((a, b) => a + b, 0) : 0;
  return `<div class="panel-h"><h2 id="or-t">Origen de la demanda</h2></div>
    <p class="origen-linea"><span>${esc(fuenteUnaLinea(p))}</span>${dir ? '' : nb('p_cierre', pill(p.cierre === 'OK' ? 'good' : 'warn', p.cierre === 'OK' ? 'cuadra con lo facturado' : p.cierre.toLowerCase()), `data-p="${esc(p.id)}"`)}</p>
    ${BI_DET('<p>' + fuenteLarga(p.clase) + '.</p>', 'Detalle técnico de la fuente')}
    <details class="mas-info" style="margin-top:8px"><summary>Ver demanda y sell in por mes</summary><div style="margin-top:8px">
    ${og ? `<p class="prosa" style="margin-bottom:8px">Este producto, en 12 meses: ${Object.entries(og).sort((a, b) => b[1] - a[1]).map(([t, v]) => `<b>${esc((TIPO[t] || { c: t }).c)}</b> ${fN(v)} pz (${ogT ? nf.format(v / ogT * 100) : 0} %)`).join(' + ')}.</p>` : ''}
    <p class="aviso info solo-bi" style="margin-bottom:10px"><b>¿Cuál usa el algoritmo?</b> ${dir ? 'La facturación directa de Brinova: en este cliente es la demanda.' : t === 'sell out' ? 'El sell out (venta de las tiendas al consumidor). El sell in sirve para comprobar que los datos cuadran.' : 'El sell through: lo que ' + esc(p.clase) + ' le vende a sus clientes. El sell in (lo que Brinova le factura) sirve para comprobar que los datos cuadran.'}</p>
    <div class="tw" role="region" tabindex="0" aria-label="Demanda y sell in por mes" style="max-height:340px"><table class="tbl"><thead><tr><th class="l">Mes</th><th>Demanda (pz)</th>${dir ? '' : '<th>Sell in (pz)</th><th>Sell in − demanda</th>'}<th>Demanda en ${esc(uNom(p))}</th></tr></thead><tbody>
    ${L12.map(m => `<tr><td class="l">${ml(m)}${inc.includes(m) ? ' <span class="pill ' + (incRevisado(p.clase, m) ? '' : 'warn') + '" title="' + esc(incTxt(p.clase, m)) + '">▲ ' + esc(incRevisado(p.clase, m) ? 'sin reporte (revisado)' : incCorto(p.clase, m)) + '</span>' : (REV[p.clase] || {})[m] ? ' <span class="pill" title="' + esc(revNota(p.clase, m)) + '">' + esc(revTxt(p.clase, m)) + '</span>' : ''}</td><td>${fN(p.real[m] || 0)}</td>${dir ? '' : `<td>${fN(p.sellIn[m] || 0)}</td><td>${fN((p.sellIn[m] || 0) - (p.real[m] || 0))}</td>`}<td>${fN1((p.real[m] || 0) / f)}</td></tr>`).join('')}
    </tbody><tfoot><tr><th class="l" scope="row">12 meses</th><td>${fN(p.d12)}</td>${dir ? '' : `<td>${fN(p.s12)}</td><td>${fN(p.s12 - p.d12)}</td>`}<td>${nb('p_cierre', p.cierre === 'OK' ? 'cuadra' : esc(p.cierre.toLowerCase()), `data-p="${esc(p.id)}"`)}</td></tr></tfoot></table></div>
    <p class="prosa small" style="margin-top:8px">${textoCierre(p)}</p></div></details>
    <details class="rs sub solo-bi" id="lj-box" style="margin-top:12px"${RS.cache[p.id] ? ' open' : ''}><summary>Linaje real: del reporte a piezas <span class="pill">BI</span><span class="nota">archivo de origen, unidades del reporte, factor y piezas · se carga del rastreo al abrirlo</span></summary>
      <div id="lj-cuerpo" style="margin-top:10px">${RS.cache[p.id] ? htmlLinaje(p, RS.cache[p.id]) : ''}</div></details>`;
}
function htmlAlgoritmo(p) {
  const cs = p.codigos.filter(c => c.calc);
  if (!cs.length) return `<div class="panel-h"><h2>Cálculo del algoritmo</h2></div><p class="prosa">Sin venta en el historial: el algoritmo no tiene base para este producto.</p>`;
  const f = fac(p), ms = MF;      // 0.4.0: todo el horizonte del algoritmo, no solo la captura
  return `<div class="panel-h"><h2>Cálculo del algoritmo en 3 pasos</h2><span class="nota">Por código, en ${esc(S.unidad === 'pz' ? 'piezas' : uNom(p))}</span></div>` + cs.map(c => {
    const k = c.calc, it = inter(k), base = k.base != null ? k.base : (k.l3 + k.l6 + k.l12) / 3, mx = Math.max(k.l3, k.l6, k.l12, base, 1), obs = k.estado !== 'ACTIVO';
    const aplica = k.idxAplica != null ? !!k.idxAplica : !it;
    const motivo = k.idxMotivo ? ({ todos: 'regla vigente: se aplica en todos los clientes', cadena: 'cadena', distribuidor: 'distribuidor', 'exportación': 'exportación', exportacion: 'exportación', intermitente: 'compra pocas veces' }[k.idxMotivo] || k.idxMotivo) : (it ? 'compra pocas veces' : '');
    const fu = k.idxFuente && Array.isArray(k.idxFuente.v1) ? k.idxFuente : null, an = fu ? (fu.anios || [2024, 2025]) : [2024, 2025];
    const fuente = m => { if (!fu) return null; const j = +m.slice(5, 7) - 1, a = fu.v1[j], b = fu.v2[j], vs = [a, b].filter(x => x != null), s = vs.reduce((x, y) => x + y, 0);
      return { a, b, n: vs.length, s, prom: fu.prom, idx: !vs.length || s <= 0 || !(fu.prom > 0) ? 1 : Math.min(2, Math.max(0.4, (s / vs.length) / fu.prom)) }; };
    const bar = (lb, v, cls) => `<div class="barra"><span>${lb}</span><span><span class="b ${cls || ''}" style="width:${(v / mx * 100).toFixed(1)}%"></span></span><span class="v">${fN1(v / f)}</span></div>`;
    const div = n => it ? n + ' meses (calendario)' : `meses con venta (${n === 3 ? k.mv3 : n === 6 ? k.mv6 : k.mv12} de ${n})`;
    return `<div style="border-top:1px solid var(--line);padding-top:12px;margin-top:4px"><p style="margin-bottom:10px"><b>${esc(descB(c))}</b> <span class="muted">${esc(c.cod)}</span> ${obs ? pill('warn', 'Sin venta ' + fN(k.sinVenta) + ' meses → 0') : pill('good', 'Activo')} ${it ? pill('acc', 'Compra pocas veces') : ''}</p>
    ${obs ? `<p class="aviso" style="margin-bottom:10px">Lleva ${fN(k.sinVenta)} meses sin venta (última: ${k.ultimo ? mll(k.ultimo) : 'sin registro'}). La regla deja el algoritmo en 0 hasta que vuelva a venderse${MK.some(m => kamU(c, m) > 0) ? ', pero tu forecast tiene unidades: revisa si sigue vigente' : ''}.</p>` : ''}
    <div class="pasos3">
      <div class="p3"><h4><span class="nro">1</span>Base mensual</h4><p class="small muted">${it ? `Vendió en ${k.mv12} de los últimos 12 meses (compra pocas veces): cada promedio se divide entre 3, 6 y 12 meses de calendario, contando los meses sin venta.` : 'Promedio de 3, 6 y 12 meses, dividido entre los meses con venta de cada ventana.'}</p>
        ${bar('3 meses', k.l3)}${bar('6 meses', k.l6)}${bar('12 meses', k.l12)}${bar('Base', base, 'base')}
        <p class="small muted">3M ÷ ${div(3)} · 6M ÷ ${div(6)} · 12M ÷ ${div(12)}</p>
        <div class="formula">(${fN1(k.l3 / f)} + ${fN1(k.l6 / f)} + ${fN1(k.l12 / f)}) ÷ 3 = <b>${fN1(base / f)}</b> por mes</div></div>
      <div class="p3"><h4><span class="nro">2</span>Temporada</h4><p class="small muted">${aplica ? 'Índice de cada mes (venta de ese mes en 2024 y 2025 contra un mes normal). 1,00 = mes normal; límites 0,4–2,0.' : 'No se aplica temporada' + (motivo ? ' (' + esc(motivo) + ')' : '') + ': el índice queda en 1,00.'}</p>
        ${ms.map(m => { const v = aplica ? ((k.idx && k.idx[m]) || 1) : 1, w = Math.min(50, Math.abs(v - 1) * 50);
          return `<div class="idx"><span>${ml(m)}</span><span class="eje"><i style="${v >= 1 ? 'left:50%' : 'right:50%'};width:${w.toFixed(1)}%"></i></span><span class="num">${nf2.format(v)}</span></div>`; }).join('')}
        ${fu && aplica ? `<details><summary class="small">De dónde sale cada índice (piezas del código)</summary><div class="tw" style="margin-top:6px"><table class="tbl"><thead><tr><th class="l">Mes</th><th>${an[0]}</th><th>${an[1]}</th><th>Prom. mensual</th><th>Índice</th></tr></thead><tbody>
          ${[...new Set(ms.map(m => m.slice(5, 7)))].map(mm => { const m = ms.find(x => x.slice(5, 7) === mm), x = fuente(m); return `<tr><td class="l">${MES[+mm - 1]}</td><td>${x.a == null ? 'excluido' : fN(x.a)}</td><td>${x.b == null ? 'excluido' : fN(x.b)}</td><td>${fN1(x.prom)}</td><td>${nf2.format(x.idx)}</td></tr>`; }).join('')}
          </tbody></table></div><p class="small muted" style="margin-top:4px">Índice = promedio del mes en ${an[0]} y ${an[1]} ÷ promedio mensual de los dos años, limitado a 0,4–2,0. Si el mes no tuvo venta, vale 1.</p></details>` : ''}</div>
      <div class="p3"><h4><span class="nro">3</span>Resultado</h4><p class="small muted">Base × índice, redondeado${obs ? ', y 0 por la regla de 6 o más meses sin venta' : ''}.</p>
        <div class="tw"><table class="tbl"><thead><tr><th class="l">Mes</th><th>Base × índ.</th><th>Algoritmo</th></tr></thead><tbody>
        ${ms.map(m => `<tr${m === MC ? ' class="muted"' : ''}><td class="l">${ml(m)}${m === MC ? ' (en curso)' : ''}</td><td>${fN1(((k.prom && k.prom[m]) || 0) / f)}</td><td><b>${fN1(((k.fc && k.fc[m]) || 0) / f)}</b></td></tr>`).join('')}</tbody></table></div></div>
    </div></div>`;
  }).join('') + `<p class="small muted" style="margin-top:12px">El algoritmo del producto suma todos sus códigos.</p>` + BI_DET(`<p class="tec">Fuente: ${FUENTE_ALG} → datos.json productos[].codigos[].calc (l3, l6, l12, mv3/6/12, idx, prom, fc).</p>`);
}
function htmlInventario(p) {
  const f = fac(p), i = p.inv, e = estInv(dias(p), p.clase), rz = riesgo(p.clase), ip = invPartes(p) || { dist: 0, tr: 0, tot: 0, ordenes: [] };
  /* 0.5.1: la barra usa los umbrales de la clase (T_DOH_OBJETIVO); el tope es 200 días o más si el exceso pasa de 180 */
  const ub = umbral(p.clase), tope = Math.max(200, Math.ceil(ub.exceso * 10 / 9 / 10) * 10), pc = v => v * 100 / tope;
  const dd = dias(p), pos = i && dd != null ? Math.min(100, dd * 100 / tope) : null;
  return `<div class="panel-h"><h2>Inventario y precio</h2></div><div class="det-dos${i ? '' : ' uno'}"><div class="det-col"><h3 class="det-col-t">Inventario del distribuidor</h3>
    ${i ? `<p class="prosa">${fechaVieja(i.fecha) || invViejo(p.clase) ? '<span class="pill warn">dato viejo</span> ' : ''}Al <b>${fechaCorta(i.fecha)}</b> ${esc(p.clase)} tenía <b>${fN1(ip.dist / f)} ${esc(uNom(p))}</b> (${fN(ip.dist)} pz)${ip.tr ? `; además vienen en camino <b>${fN1(ip.tr / f)} ${esc(uNom(p))}</b> (${fN(ip.tr)} pz en ${ip.ordenes.length || 'varias'} ${ip.ordenes.length === 1 ? 'orden' : 'órdenes'}${ip.ordenes.length ? ', primera llegada ' + esc(fmtEta([...ip.ordenes].map(ordEta).filter(Boolean).sort()[0])) : ''}). Inventario total: <b>${fN(ip.tot)} pz</b>` : ''}. Vende en promedio ${fN1(mesesDoh(p.clase).length ? ventaDoh(p) / mesesDoh(p.clase).length / f : 0)} al mes, así que le alcanza para ${nb('p_inv', '<b>' + (dd == null ? 'sin venta reciente' : diasTxt(dd) + '') + '</b>', `data-p="${esc(p.id)}"`)}.${i.dohFuente != null ? ' Su propio reporte dice ' + fN(i.dohFuente) + (Math.round(i.dohFuente) === 1 ? ' día.' : ' días.') : ''}</p>
      ${pos != null ? `<div class="escala" aria-hidden="true"><span style="width:${pc(rz)}%;background:#F6C9C6"></span><span style="width:${pc(ub.sobrestock - rz)}%;background:#CFEBDD"></span><span style="width:${pc(ub.exceso - ub.sobrestock)}%;background:#FBE6BF"></span><span style="width:${pc(tope - ub.exceso)}%;background:#F5D3A3"></span><span class="mk" style="left:calc(${pos.toFixed(1)}% - 1px)"></span></div>
      <div class="escala-l"><span>0</span><span>${fN(rz)} quiebre</span><span>${fN(ub.sobrestock)} sobrestock</span><span>${fN(ub.exceso)} exceso</span><span>${fN(tope)}+</span></div><p class="small" style="margin-top:4px">Estado: <b>${esc(e ? e[1] : '—')}</b>${ip.tr ? ' · los días incluyen el tránsito que cuenta' : ''}</p>` : ''}
      ${ip.tr ? `<div style="margin-top:8px">${tablaOrdenes(p)}${reglaTransito() ? `<p class="small muted" style="margin-top:6px">Tránsito que cuenta: ${esc(reglaTransito())}</p>` : ''}</div>` : ''}
      ${progDe(p) ? `<div style="margin-top:8px"><p class="prosa">Además hay <b>${fN(progDe(p).cajas)} cajas</b> (${fN(progDe(p).pz)} pz) en pedidos programados. ${PROG_KAM.replace('Pedidos programados: t', 'T')}</p>${tablaOrdenes(p, true)}${reglaProgramados() ? `<p class="small muted solo-bi" style="margin-top:6px">Regla completa (BI): ${esc(reglaProgramados())}</p>` : ''}</div>` : ''}
      ${(() => { const nh = Object.keys(i.hist || {}).length;      /* 070-DETALLE: sin cortes no se dibuja un gráfico vacío */
        return nh ? `<div class="chart" id="ch-inv" style="margin-top:10px"></div><p class="small muted">${nh < 3 ? esc(p.clase) + ' solo ha enviado ' + nh + (nh === 1 ? ' corte' : ' cortes') + ' de inventario: el historial es corto.' : 'Un corte de inventario por mes.'}</p>`
          : `<p class="small muted" style="margin-top:8px">Todavía no hay historial de cortes de inventario de este producto.</p>`; })()}`
      : `<p class="prosa">${tipoDe(p.clase) === 'sell in directo' ? esc(p.clase) + ' es venta directa de Brinova: no hay inventario de distribuidor.' : tipoDe(p.clase) === 'sell out' ? 'La cadena no envía inventario a BI.' : 'Este distribuidor no ha enviado inventario de este producto.'}</p>`}
  </div><div class="det-col"><h3 class="det-col-t" id="pr-t">Precio por código</h3>
    <div class="tw" role="region" tabindex="0" aria-labelledby="pr-t"><table class="tbl tprecio"><thead><tr><th class="l">Código</th><th class="l">Presentación</th><th>Lista</th><th>Facturado (6M)</th><th>Desc.</th><th>Por pieza</th></tr></thead><tbody>
    ${p.codigos.map(c => { const pr = precioU(p, c), ds = c.precio && c.precioFact ? 1 - c.precioFact / c.precio : null; return `<tr><td class="l pr-cod"><b>${esc(descB(c))}</b>${nombreDist(p, c, true)}<span class="small muted" style="display:block">${esc(c.cod)}${c.cod === p.principal ? ' ' + pill('acc', 'principal') : ''}</span></td><td class="l" data-l="Presentación">${esc(cNom(c))}</td><td data-l="Lista" title="${esc(c.precioFuente || '')}">${pr != null ? fC2(pr) + (c.precio == null ? '*' : '') : pill('bad', 'sin precio')}</td><td data-l="Facturado (6M)">${c.precioFact ? fC2(c.precioFact) : '—'}</td><td data-l="Desc.">${ds != null ? nf.format(ds * 100) + ' %' : '—'}</td><td data-l="Por pieza">${pr != null && c.pzPorU ? fC2(pr / c.pzPorU) : '—'}</td></tr>`; }).join('')}
    </tbody></table></div>
    <p class="small muted" style="margin-top:8px">El valor de tu forecast es <b>unidades × precio de lista</b> del distribuidor. “Facturado (6M)” = colones facturados ÷ unidades facturadas en los últimos 6 meses${BI(' (DATA SELL IN). Precio de lista: ' + esc([...new Set(p.codigos.map(c => c.precioFuente).filter(Boolean))].join(' / ') || 'FCST_ALGORITMO'))}.${p.codigos.some(c => c.precio == null && precioU(p, c) != null) ? ' * = estimado con el precio por pieza del código principal.' : ''}</p>
  </div></div>`;
}
function pintarDetalle(p) {
  const f = fac(p), t = tend(p), a = alertas(p), av = avisosCaptura(p), e = estInv(dias(p), p.clase), d = dif(p);
  const notaId = p.princ.id, nota = (local[notaId] && local[notaId].nota != null) ? local[notaId].nota : ((remote[notaId] && remote[notaId].nota) || '');
  const otros = P.filter(x => x.grupo === p.grupo && x.id !== p.id), inv = p.inv;
  /* 070-DETALLE: panel central. Cabecera fija (nombre + cerrar) fuera del área que se desplaza; el resto del encabezado abre el cuerpo */
  $('#det').innerHTML = `<header class="det-h"><div class="det-tit"><h1 id="det-t">${esc(p.nombre)}</h1>
    <div class="meta">${esc(p.clase)} · ${esc(p.cat ? nombreCat(p.cat) : 'Sin categoría')}${p.catFuente ? BI(' (categoría de ' + esc(CATF[p.catFuente] || p.catFuente) + ')') : ''} · se muestra en ${nb('p_unidad', esc(uNom(p)), `data-p="${esc(p.id)}"`)}</div></div>
    <form method="dialog"><button class="cerrar" value="cerrar" autofocus aria-label="Cerrar el detalle"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 3.5l9 9m0-9l-9 9"/></svg><span>Cerrar</span></button></form></header>
  <div class="det-in">
  <div class="det-sub">
    <div class="badges">${pill('src', 'Demanda: ' + fuenteTxt(p.clase))}${a.map(([c, x]) => pill(c, x)).join('')}${conExportacion() ? `<button type="button" class="chip" data-c3prod="${esc(p.id)}">Ver en contenedor 3D</button>` : ''}</div>
    ${(p.sustituidos || []).length ? `<div class="small muted">${p.sustituidos.map(x => 'Antes se vendía como ' + esc(x.descBrinova || x.cod) + BI(' · incluye el código anterior ' + esc(x.cod) + ' (sustituido por ' + esc(x.por) + ')')).join('<br>')}</div>` : ''}
    ${otros.length ? `<div class="small muted det-otros">También en: ${otros.map(o => `<button type="button" class="chip" data-p="${esc(o.id)}">${esc(o.clase)}</button>`).join(' ')}</div>` : ''}</div>
  <div id="det-avisos">${avisosHtml(av)}</div>
  <div class="mini">
    <div class="kpi"><span class="lbl">Venta 3 meses</span><span class="big">${nb('p_venta3', fN1(p.d3 / f), `data-p="${esc(p.id)}"`)}</span><span class="vr ${t == null ? 'muted' : t >= 0 ? 'up' : 'down'}">${flecha(t)}${fP(t)} contra el año anterior</span>${(() => { const vl = ventaLocalDe(p.clase), vp = p.ventaLocal; return vl && vp && ok(vp.total3) ? `<span class="sub" title="${esc(vl.queEs || '')}">${esc(fMon(vp.total3, vl.moneda))} en ${esc(vl.moneda)}</span>` : ''; })()}</div>
    <div class="kpi"><span class="lbl">Inventario</span><span class="big">${inv ? nb('p_inv', fN1(invTot(p) / f), `data-p="${esc(p.id)}"`) : 'No aplica'}</span>${inv && conTransito(p) ? `<span class="sub">${fN1(invPartes(p).dist / f)} en el distribuidor + ${fN1(invPartes(p).tr / f)} en tránsito</span>` : ''}<span class="vr ${e ? (e[0] === 'good' ? 'up' : e[0] === 'bad' ? 'down' : 'warn') : 'muted'}">${inv ? (dias(p) == null ? 'sin venta reciente' : diasTxt(dias(p)) + ' · ' + esc(e[1].toLowerCase())) : (tipoDe(p.clase) === 'sell in directo' ? 'venta directa' : 'sin reporte')}</span></div>
    <div class="kpi"><span class="lbl">Algoritmo · ${esc(rango(MK))}</span><span class="big">${nb('p_alg', fN1(algPz6(p) / f), `data-p="${esc(p.id)}"`)}</span><span class="sub">${fC(pv(p, algPz6(p)))} a precio de lista</span></div>
    <div class="kpi"><span class="lbl">Tu forecast · ${esc(rango(MK))}</span><span class="big" id="det-kam">${nb('p_kam', fN1(kamPz6(p) / f), `data-p="${esc(p.id)}"`)}</span><span class="vr ${d != null && Math.abs(d) > 0.3 ? 'warn' : 'muted'}" id="det-kam2">${flecha(d)}${fP(d)} contra el algoritmo · ${fC(kamValM(p, MK))}</span></div>
  </div>
  <p class="lectura" id="det-lectura">${lecturaProducto(p)}</p>
  <section class="panel"><div class="panel-h"><h2>Tu forecast</h2><span class="nota">En la unidad de cada código · ${esc(ml(MC))} en curso, no se cambia · se guarda solo</span></div>
    ${p.cap.map(c => bloqueCaptura(p, c)).join('') || '<p class="prosa">Este producto no tiene un código para capturar en este distribuidor.</p>'}
    <label class="mes" style="margin-top:10px">Comentario (motivo si te separas del algoritmo: promociones, quiebres)<textarea id="nota-${sid(notaId)}" data-nota="${esc(notaId)}">${esc(nota)}</textarea></label>
    <p class="prosa" style="margin-top:8px" id="det-afecta">${afecta(p)}</p></section>
  <section class="panel"><div class="panel-h"><h2>Mes a mes</h2><span class="nota">${esc(uNom(p))}</span>
    <span class="der"><button type="button" class="chip" id="b-desde2" aria-pressed="${S.desde === '2024-01'}">Desde 2024</button><button type="button" class="chip" data-tabla="ch-prod" aria-pressed="false">Ver tabla</button></span></div>
    <div class="chart" id="ch-prod"></div><div class="legend" id="lg-prod"></div><div id="ch-prod-tb"></div></section>
  <section class="panel">${htmlInventario(p)}</section>
  <section class="panel" aria-labelledby="or-t">${htmlOrigen(p)}</section>
  <section class="panel"><details class="mas-info"><summary>Cómo se calculó el algoritmo</summary><div style="margin-top:10px">${htmlAlgoritmo(p)}</div></details></section>
  <section class="panel"><details class="rs" id="rs-box" data-p="${esc(p.id)}"><summary><span id="rs-tit">${esc(rsTitulo(p))}</span><span class="nota">${esc(rsNota(p))}</span></summary><div id="rs-cuerpo" style="margin-top:10px"></div></details></section>
  </div>`;
  RS.p = p.id; RS.m = null; RS.path = []; RS.dim = null; RS.lim = 200;
  graficoProducto(p);
  if (inv) {
    const h = {}, ms = MH.filter(m => m >= addM(D.corte, -11)); ms.forEach(m => { if (inv.hist && inv.hist[m] != null) h[m] = inv.hist[m] / f; });
    grafico($('#ch-inv'), { meses: ms, series: [{ nombre: 'Inventario reportado', tipo: 'col', color: COL.inv, data: h }], eje: fCx, tip: v => fN1(v) + ' ' + uNom(p), h: 180, izq: 46, titulo: 'Inventario por corte' });
  }
}
function afecta(p) {
  const kv = kamValM(p, MK), av = pv(p, algPz6(p));
  if (!av && !kv) return 'Sin forecast en estos meses.';
  return `Valor de tu forecast: <b>${fC(kv)}</b> a precio de lista en ${esc(rango(MK))} (algoritmo: ${fC(av)}).`;
}
function refrescarDetalle(p) {
  const f = fac(p), d = dif(p);
  graficoProducto(p);
  const k = $('#det-kam'); if (k) k.innerHTML = nb('p_kam', fN1(kamPz6(p) / f), `data-p="${esc(p.id)}"`);
  const k2 = $('#det-kam2'); if (k2) { k2.textContent = flecha(d) + fP(d) + ' contra el algoritmo · ' + fC(kamValM(p, MK)); k2.className = 'vr ' + (d != null && Math.abs(d) > 0.3 ? 'warn' : 'muted'); }
  const af = $('#det-afecta'); if (af) af.innerHTML = afecta(p);
  const av = $('#det-avisos'); if (av) av.innerHTML = avisosHtml(avisosCaptura(p));
}

/* ---------- rastreo hasta cliente o tienda (detalle-v1, informe 04): un archivo por producto, a demanda ----------
   0.3.1 · hay rastreo si existe detalle/indice.json en la carpeta del KAM (no depende de su nombre);
         · si el índice trae la copia comprimida ("gz") y el navegador sabe descomprimir, se baja esa; si no, el .json;
         · el cuadre usa la tolerancia del índice (±0,5 pz por producto y mes: el portal guarda piezas enteras);
         · dice el grano de cada fuente: día y factura, o solo el total del mes por cliente o por tienda. */
const RS = { p: null, m: null, path: [], dim: null, lim: 200, cache: {} };
const SIN_DETALLE = 'Todavía no hay rastreo publicado en tu carpeta. BI lo publica solo cuando cuadra con este portal (tolerancia de redondeo: ±0,5 piezas por producto y mes).';
const PUEDE_GZ = typeof DecompressionStream === 'function' && window.portalGzip !== false;
const nfd = new Intl.NumberFormat('es-CR', { maximumFractionDigits: 2 });
const fPz = v => ok(v) ? nfd.format(Math.abs(v) < 0.005 ? 0 : v) : '—';            // piezas con sus decimales (CODISA y BRYDEN reportan fracciones)
const fKb = kb => !ok(kb) ? '' : kb >= 1024 ? nf1.format(kb / 1024) + ' MB' : nf.format(kb) + ' KB';
const FUENTE_NOM = { 'SELL THROUGH': 'sell through', 'SELL OUT': 'sell out', 'SELL IN DIRECTO': 'sell in directo' };
const filaObj = (t, i) => { const o = {}; if (!t || i == null || i < 0 || !t.filas || !t.filas[i]) return o; t.cols.forEach((k, j) => { o[k] = t.filas[i][j]; }); return o; };
async function cargarRastreo(p) {
  if (RS.cache[p.id]) return RS.cache[p.id];
  if (typeof window.portalLeer !== 'function') return { msg: 'El rastreo se abre en el portal web: lee la carpeta <b>detalle/</b> de tu OneDrive. En esta vista no está disponible.' };
  const rutaIx = (D.detalle && D.detalle.indice) || 'detalle/indice.json', carpeta = rutaIx.replace(/[^/]*$/, '');
  let ix;
  try { ix = await window.portalLeer(rutaIx); } catch (e) { return { msg: 'No se pudo leer el índice del detalle: ' + esc(e && e.message || e) + '. Revisa la conexión e intenta de nuevo.', reintentar: true }; }
  if (!ix) return { msg: SIN_DETALLE };
  if (ix.esquema !== 'detalle-v1') return { msg: 'El detalle publicado tiene un formato que esta página no conoce (' + esc(ix.esquema) + ').' };
  const meta = ix.productos && ix.productos[p.id];
  if (!meta) return { ix, msg: `Este producto no tiene ventas en el detalle (${esc(ml(ix.meses[0]))} – ${esc(ml(ix.meses[ix.meses.length - 1]))}).` };
  /* archivo del producto: la copia comprimida si existe y este navegador la puede abrir; si no hay o falla, el .json sin comprimir */
  let f = null, leido = null, nota = '';
  if (meta.gz && PUEDE_GZ) {
    try { f = await window.portalLeer(carpeta + meta.gz); if (f) leido = { ruta: carpeta + meta.gz, kb: meta.kbGz, kbAbierto: meta.kb, gz: true }; }
    catch (e) { f = null; nota = 'No se pudo abrir la copia comprimida (' + (e && e.message || e) + '): se leyó el archivo sin comprimir.'; }
  } else if (meta.gz) nota = 'Este navegador no descomprime archivos: se bajó el archivo completo.';
  if (!f) {
    try { f = await window.portalLeer(carpeta + meta.archivo); }
    catch (e) {
      if (e && e.code === 'sin_gzip') return { msg: 'Este navegador no puede abrir el detalle comprimido de este producto. Ábrelo en una computadora o actualiza el navegador.' };
      return { msg: 'No se pudo leer el detalle del producto: ' + esc(e && e.message || e), reintentar: true };
    }
    if (f) leido = { ruta: carpeta + meta.archivo, kb: meta.kb, gz: false };
  }
  if (!f) return { ix, msg: 'El índice menciona este producto, pero su archivo no está publicado. Avisa a BI.' };
  const base = Date.parse((f.base || ix.base) + 'T00:00:00Z'), L = [], tot = {};
  const pts = f.puntos, ags = f.agentes, lin = f.linajes;
  const gran = f.granularidadFecha || (ix.clases[p.clase] || {}).granularidadFecha || {};
  const lins = lin && lin.filas ? lin.filas.map((_, i) => filaObj(lin, i)) : [];
  for (let i = 0; i < f.d.length; i++) {
    const fe = new Date(base + f.d[i] * 864e5).toISOString().slice(0, 10), mes = fe.slice(0, 7);
    const pu = filaObj(pts, f.c ? f.c[i] : null), ag = f.a ? filaObj(ags, f.a[i]) : {}, li = lins[f.l ? f.l[i] : -1] || {};
    const pz = f.pz[i]; tot[mes] = (tot[mes] || 0) + pz;
    const fuente = pu.fuente || li.fuente || '';
    L.push({ fecha: fe, mes, factura: f.f && f.f[i] != null ? String(f.f[i]) : '', cod: pu.cod || '', cli: (pu.nombre || pu.cod || 'Sin nombre'), tipo: pu.tipo || 'Sin tipo', canal: pu.canal || (ix.canalPorTipoCliente || {})[pu.tipo] || 'Sin canal',
      prov: pu.provincia || 'Sin provincia', canton: pu.canton || '', dist: pu.distribuidor || li.distribuidor || '', fuente, porMes: gran[fuente] === 'mes', agente: ag.cod ? ag.cod + ' · ' + (ag.nombre || '') : 'Sin agente',
      u: f.u[i], urep: li.unidadReporte || '—', factor: li.factor, codArch: li.codArchivo || '', pt: li.pt || '', li: f.l ? f.l[i] : -1, pz });
  }
  const fuentes = Object.keys(gran), tolIx = ix.tolerancia && ix.tolerancia.celdaPz;
  const res = { ix, f, L, tot, gran, lins, leido, nota, mensual: fuentes.length > 0 && Object.values(gran).every(g => g === 'mes'), soloSO: fuentes.length > 0 && fuentes.every(k => k === 'SELL OUT'),
    conFactura: L.some(l => l.factura), conAgente: L.some(l => l.agente !== 'Sin agente'), tol: ok(tolIx) ? +tolIx : 0.5, clase: ix.clases[p.clase] || {}, misma: ix.datosGenerado === D.generado };
  return (RS.cache[p.id] = res);
}
/* título del rastreo según el grano: antes de cargar se deduce de la fuente del cliente; después, de lo que trae el archivo */
function rsTitulo(p, res) {
  const so = res && res.L ? res.soloSO : tipoDe(p.clase) === 'sell out', men = res && res.L ? res.mensual : tipoDe(p.clase) !== 'sell through';
  return men ? (so ? 'Rastreo por tienda y mes' : 'Rastreo por cliente y mes') : 'Rastreo hasta cliente, fecha y factura';
}
const rsNota = p => (tipoDe(p.clase) === 'sell out' ? 'las cadenas no envían fecha ni factura · ' : '') + 'se carga solo al abrirlo';
/* qué es cada línea, dicho en claro según lo que reporta la fuente */
function rsIntro(p, res) {
  const fin = ' La suma de piezas del mes es la venta real que ves en el portal. Los negativos son devoluciones o notas de crédito.';
  const calc = '<b>unidades del archivo × factor = piezas</b>';
  if (res.mensual && res.soloSO) return `<b>Por tienda y mes; las cadenas no envían fecha ni factura.</b> Cada línea es el total de un mes de una tienda de ${esc(p.clase)}, según el escáner de la cadena (sell out${BI(', CUBO de cadenas')})${BI(': ' + calc)}.` + fin;
  if (res.mensual) return `<b>Por cliente y mes; esta fuente no trae fecha diaria${res.conFactura ? '' : ' ni factura'}.</b> Cada línea es el total de un mes de un cliente de ${esc(p.clase)} (${esc(Object.keys(res.gran).map(k => FUENTE_NOM[k] || k.toLowerCase()).join(', ') || fuenteTxt(p.clase))})${BI(': ' + calc)}.` + fin;
  const partes = Object.entries(res.gran).map(([k, g]) => (FUENTE_NOM[k] || k.toLowerCase()) + ' · ' + (g === 'día' ? 'diario' : 'solo el total del mes')).join(', ');
  return `Cada línea es una fila del reporte de ${esc(p.clase)} (${esc(partes || fuenteTxt(p.clase))}${res.conFactura ? ', con factura' : ''}${res.conAgente ? ' y agente' : ''})${BI(': ' + calc)}.` + fin;
}
function dimsRastreo(res) {
  if (res.dims) return res.dims;
  const so = res.soloSO;
  const cand = [['canal', 'Canal', l => l.canal], ['tipo', so ? 'Formato de tienda' : 'Tipo de cliente', l => l.tipo], ['prov', 'Provincia', l => l.prov], ['agente', 'Agente / ruta', l => l.agente]];
  const d = cand.filter(x => { const v0 = res.L.length ? x[2](res.L[0]) : null; return res.L.some(l => x[2](l) !== v0); });      // una dimensión con un solo valor no desglosa nada
  d.push(['cli', so ? 'Tienda' : 'Cliente', l => l.cli + (l.cod ? ' · ' + l.cod : '')]);
  if (!res.mensual) d.push(['fecha', 'Fecha', l => l.fecha]);
  return (res.dims = d);
}
async function abrirRastreo() {
  const p = PID[RS.p], box = $('#rs-cuerpo'); if (!p || !box) return;
  box.innerHTML = '<p class="muted">Cargando el detalle de este producto…</p>';
  const res = await cargarRastreo(p);
  if (PID[RS.p] !== p || !$('#rs-cuerpo')) return;
  if (res.msg) { box.innerHTML = `<p class="aviso${res.reintentar ? ' bad' : ' info'}">${res.msg}</p>${res.reintentar ? '<button type="button" class="btn" data-rs-reintentar style="margin-top:8px">Intentar de nuevo</button>' : ''}`; if (res.reintentar) delete RS.cache[p.id]; return; }
  const ms = res.ix.meses.filter(m => (res.tot[m] || 0) !== 0 || (p.real[m] || 0) !== 0).reverse();
  if (!RS.m || !ms.includes(RS.m)) RS.m = ms[0];
  const t = $('#rs-tit'); if (t) t.textContent = rsTitulo(p, res);
  pintarRastreo();
}
function pintarRastreo() {
  const p = PID[RS.p], res = RS.cache[RS.p], box = $('#rs-cuerpo'); if (!p || !res || !box || !res.L) return;
  const m = RS.m, f = fac(p), dims = dimsRastreo(res), all = res.L.filter(l => l.mes === m);
  let L = all; RS.path.forEach(([k, v]) => { const d = dims.find(x => x[0] === k); if (d) L = L.filter(l => d[2](l) === v); });
  const usadas = RS.path.map(x => x[0]), libres = dims.filter(d => !usadas.includes(d[0]));
  if (RS.dim !== 'lineas' && (!RS.dim || usadas.includes(RS.dim) || !dims.some(d => d[0] === RS.dim))) RS.dim = libres.length ? libres[0][0] : 'lineas';
  /* cuadre del mes: el portal guarda piezas enteras, así que se acepta la diferencia de redondeo que declara el índice (±0,5 pz) */
  const totN = L.reduce((a, l) => a + l.pz, 0), totM = all.reduce((a, l) => a + l.pz, 0), real = p.real[m] || 0, dif = totM - real;
  const exacto = Math.abs(dif) < 0.005, cuadra = Math.abs(dif) <= res.tol + 1e-9;
  const ms = res.ix.meses.filter(x => (res.tot[x] || 0) !== 0 || (p.real[x] || 0) !== 0).reverse();
  const punto = res.soloSO ? 'Tienda' : 'Cliente', nomLineas = res.conFactura ? 'Líneas de factura' : 'Líneas del reporte', nLin = L.length === 1 ? 'línea' : 'líneas';
  const le = res.leido || {};
  let h = `<p class="small muted" style="margin-bottom:8px">${rsIntro(p, res)}</p>
  ${res.misma ? '' : `<p class="aviso" style="margin-bottom:8px">El detalle es de la corrida del ${esc(res.ix.datosGenerado)} y el portal es del ${esc(D.generado)}: no se compara el cuadre hasta que BI publique los dos de la misma corrida.</p>`}
  <div class="tools"><label class="small muted" for="rs-m">Mes</label><select id="rs-m">${ms.map(x => `<option value="${x}"${x === m ? ' selected' : ''}>${mll(x)}</option>`).join('')}</select></div>
  <nav class="ruta" aria-label="Nivel de detalle"><button type="button" data-rs-nivel="-1">${esc(ml(m))} · todo</button>${RS.path.map(([k, v], i) => `<span class="sep" aria-hidden="true">›</span><button type="button" data-rs-nivel="${i}">${esc((dims.find(d => d[0] === k) || [0, k])[1])}: ${esc(k === 'fecha' ? fechaCorta(v) : v)}</button>`).join('')}</nav>
  <div class="cuadre"><span>Este nivel: <b>${fPz(totN)} pz</b> = ${fN1(totN / f)} ${esc(uNom(p))} · ${fN(L.length)} ${nLin}</span>
    <span class="muted">Total del mes en el detalle ${fPz(totM)} pz · venta real del portal ${fN(real)} pz${res.misma && cuadra && !exacto ? ` · diferencia de ${fPz(Math.abs(dif))} pz por redondeo: el portal guarda piezas enteras (tolerancia ±${fPz(res.tol)} pz)` : ''}</span>${res.misma ? pill(cuadra ? 'good' : 'bad', cuadra ? (exacto ? '✓ cuadra' : '✓ cuadra (redondeo)') : `no cuadra por ${fPz(Math.abs(dif))} pz: avisa a BI`) : ''}</div>
  <div class="seg" role="group" aria-label="Agrupar por" style="margin-bottom:10px">${libres.map(d => `<button type="button" data-rs-dim="${d[0]}" aria-pressed="${RS.dim === d[0]}">${d[1]}</button>`).join('')}<button type="button" data-rs-dim="lineas" aria-pressed="${RS.dim === 'lineas'}">${nomLineas}</button></div>`;
  if (RS.dim === 'lineas') {
    const vis = L.slice().sort((a, b) => a.fecha.localeCompare(b.fecha)).slice(0, RS.lim), nCol = res.conFactura ? 8 : 7;
    h += `<div class="tw" role="region" tabindex="0" aria-label="${nomLineas}" style="max-height:460px"><table class="tbl"><thead><tr><th class="l" scope="col">${res.mensual ? 'Mes' : 'Fecha'}</th>${res.conFactura ? '<th class="l" scope="col">Factura</th>' : ''}<th class="l" scope="col">${punto}</th><th class="l" scope="col">${res.soloSO ? 'Formato · provincia' : 'Tipo · provincia' + (res.conAgente ? ' · agente' : '')}</th><th class="l solo-bi" scope="col">Código del archivo → PT</th><th scope="col" class="solo-bi">Unidades del archivo</th><th class="l solo-bi" scope="col">Unidad del reporte</th><th scope="col" class="solo-bi">Factor (pz)</th><th scope="col">Piezas</th></tr></thead><tbody>
    ${vis.map(l => `<tr><td class="l">${l.porMes ? esc(ml(l.mes)) : fechaCorta(l.fecha)}</td>${res.conFactura ? `<td class="l">${esc(l.factura || '—')}</td>` : ''}<td class="l" style="white-space:normal;min-width:180px">${esc(l.cli)} <span class="muted small">${esc(l.cod)}</span></td><td class="l small" style="white-space:normal;min-width:160px">${esc(l.tipo)} · ${esc(l.prov)}${res.conAgente ? ' · ' + esc(l.agente) : ''}</td><td class="l small solo-bi">${esc(l.codArch || '—')} → ${esc(l.pt || p.principal)}</td><td class="solo-bi ${l.pz < 0 ? 'down' : ''}">${fPz(l.u)}</td><td class="l solo-bi">${esc(l.urep)}</td><td class="solo-bi">× ${l.factor == null ? '—' : nfd.format(l.factor)}</td><td><b>${fPz(l.pz)}</b></td></tr>`).join('')}
    </tbody><tfoot><tr><th class="l" colspan="${nCol - 4}" scope="row">Total del nivel (${fN(L.length)} ${nLin}) · en ${esc(uNom(p))}: ${fN1(totN / f)}</th><td class="solo-bi"></td><td class="solo-bi"></td><td class="solo-bi"></td><td class="solo-bi"></td><td>${fPz(totN)}</td></tr></tfoot></table></div>
    ${L.length > RS.lim ? `<div class="mas"><button type="button" class="btn" data-rs-mas>Mostrar ${Math.min(200, L.length - RS.lim)} líneas más (${L.length - RS.lim} restantes)</button></div>` : ''}`;
  } else {
    const d = dims.find(x => x[0] === RS.dim), g = new Map();
    L.forEach(l => { const k = d[2](l), o = g.get(k) || { pz: 0, n: 0, ult: '', fact: new Set() }; o.pz += l.pz; o.n++; if (l.fecha > o.ult) o.ult = l.fecha; if (l.factura) o.fact.add(l.factura); g.set(k, o); });
    const rows = [...g.entries()].sort((a, b) => d[0] === 'fecha' ? a[0].localeCompare(b[0]) : b[1].pz - a[1].pz), mx = Math.max(...rows.map(r => Math.abs(r[1].pz)), 1);
    h += `<div class="tw" role="region" tabindex="0" aria-label="Demanda por ${esc(d[1])}" style="max-height:460px"><table class="tbl drill"><thead><tr><th class="l" scope="col">${esc(d[1])}</th><th scope="col">Piezas</th><th scope="col">${esc(S.unidad === 'pz' ? 'Piezas' : uNom(p))}</th><th scope="col">% del nivel</th><th scope="col">Líneas</th>${res.conFactura ? '<th scope="col">Facturas</th>' : ''}${res.mensual ? '' : '<th class="l" scope="col">Última fecha</th>'}</tr></thead><tbody>
    ${rows.slice(0, 300).map(([k, o]) => `<tr data-rs-ir="${esc(k)}" tabindex="0"><td class="l"><b>${esc(d[0] === 'fecha' ? fechaCorta(k) : k)}</b></td><td>${fPz(o.pz)}</td><td>${fN1(o.pz / f)}</td><td>${totN ? nf.format(o.pz / totN * 100) + ' %' : '—'}<span class="barpct" style="width:${(Math.abs(o.pz) / mx * 60).toFixed(0)}px" aria-hidden="true"></span></td><td>${o.n}</td>${res.conFactura ? `<td>${o.fact.size}</td>` : ''}${res.mensual ? '' : `<td class="l">${fechaCorta(o.ult)}</td>`}</tr>`).join('')}
    </tbody><tfoot><tr><th class="l" scope="row">Total (${rows.length} ${rows.length === 1 ? 'grupo' : 'grupos'})</th><td>${fPz(totN)}</td><td>${fN1(totN / f)}</td><td>100 %</td><td>${fN(L.length)}</td>${res.conFactura ? '<td></td>' : ''}${res.mensual ? '' : '<td></td>'}</tr></tfoot></table></div>
    <p class="small muted" style="margin-top:6px">Toca una fila para bajar un nivel. Puedes cambiar el orden con los botones de arriba.${rows.length > 300 ? ' Se muestran los 300 grupos más grandes; el total incluye todos.' : ''}</p>`;
  }
  h += `<p class="tec solo-bi" style="margin-top:10px">Archivo leído: ${esc(le.ruta || '—')}${le.kb != null ? ' · ' + fKb(le.kb) + (le.gz ? ' comprimido' + (le.kbAbierto != null ? ' (' + fKb(le.kbAbierto) + ' al abrirlo)' : '') : '') : ''} · ${fN(res.L.length)} líneas en ${esc(rango([res.ix.meses[0], res.ix.meses[res.ix.meses.length - 1]]))} · detalle generado el ${esc(res.ix.generado || '—')}.${res.nota ? ' ' + esc(res.nota) : ''}</p>`;
  box.innerHTML = h;
}

/* ---------- linaje real de unidades (0.3.1): del reporte a piezas, con las filas del detalle de los últimos 12 meses ---------- */
function htmlLinaje(p, res) {
  const L12 = MH.slice(-12).filter(m => res.ix.meses.includes(m)), en = new Set(L12), g = new Map();
  res.L.forEach(l => { if (!en.has(l.mes)) return; const o = g.get(l.li) || { u: 0, pz: 0, n: 0 }; o.u += l.u; o.pz += l.pz; o.n++; g.set(l.li, o); });
  if (!g.size) return `<p class="prosa">Este producto no tiene filas en el detalle de ${esc(rango(L12))}.</p>`;
  const rows = [...g.entries()].map(([i, o]) => [res.lins[i] || {}, o]).sort((a, b) => Math.abs(b[1].pz) - Math.abs(a[1].pz));
  const tot = rows.reduce((a, r) => a + r[1].pz, 0), real = sum(p.real, L12), dif = tot - real, tol = res.tol * L12.length;
  const exacto = Math.abs(dif) < 0.005, cuadra = Math.abs(dif) <= tol + 1e-9;
  /* filas donde unidades × factor se aparta de las piezas más que el redondeo de los decimales guardados (0,01 pz por línea): solo el sell in directo, que se redondea factura por factura */
  const desv = rows.filter(([li, o]) => li.factor != null && Math.abs(o.u * li.factor - o.pz) > Math.max(0.5, 0.01 * o.n));
  const nf4 = new Intl.NumberFormat('es-CR', { maximumFractionDigits: 4 });
  const num = v => v == null ? '—' : nfd.format(v), corta = t => esc(t).replace(/([_\[\/])/g, '$1<wbr>'), chico = t => t ? `<small class="muted" style="display:block;white-space:normal;overflow-wrap:anywhere">${corta(t)}</small>` : '';   // <wbr>: los nombres largos se parten en _ [ /
  return `<p class="small muted" style="margin-bottom:8px">Así llegó este producto en ${esc(rango(L12))}: cada fila es una combinación de archivo de origen, código y unidad del reporte, con el factor que la convierte en piezas. <b>Unidades del reporte × factor = piezas.</b></p>
  <div class="tw" role="region" tabindex="0" aria-label="Linaje de unidades de ${esc(p.nombre)}" style="max-height:380px"><table class="tbl"><thead><tr><th class="l" scope="col">Archivo de origen</th><th class="l" scope="col">Código del archivo → PT</th><th scope="col">Unidades del reporte</th><th scope="col">Factor (pz)</th><th scope="col">Piezas</th><th scope="col">Líneas</th></tr></thead><tbody>
  ${rows.map(([li, o]) => `<tr><td class="l" style="white-space:normal;overflow-wrap:anywhere;max-width:170px">${corta(li.archivo || '—')}${chico((FUENTE_NOM[li.fuente] || String(li.fuente || '').toLowerCase()) + (li.distribuidor ? ' · ' + li.distribuidor : ''))}</td>
    <td class="l" style="white-space:normal;min-width:140px">${esc(li.codArchivo || '—')} → <b>${esc(li.pt || p.principal)}</b>${chico(li.descPt)}${li.codActivo && li.codActivo !== li.codArchivo ? chico('código vigente del distribuidor: ' + li.codActivo) : ''}</td>
    <td>${nf4.format(o.u)}${chico(String(li.unidadReporte || 'sin unidad').toLowerCase() + (li.combo ? ' · combo de ' + num(li.nComp) + ' componentes' : ''))}</td>
    <td style="min-width:120px;max-width:190px">${li.factor == null ? 'sin factor: no suma' : '× ' + num(li.factor)}${chico(li.factorCaja != null ? num(li.factorCaja) + ' por caja × ' + num(li.uEstandar) + ' de unidad estándar' : (li.uEstandar != null ? 'unidad estándar ' + num(li.uEstandar) + (li.combo ? ' por componente' : '') : ''))}${chico([li.origenFactorCaja, li.origenUEstandar].filter(Boolean).join(' · '))}</td>
    <td><b>${fPz(o.pz)}</b></td><td>${fN(o.n)}</td></tr>`).join('')}
  </tbody><tfoot><tr><th class="l" colspan="4" scope="row">Total del detalle, ${esc(rango(L12))}</th><td>${fPz(tot)}</td><td>${fN(rows.reduce((a, r) => a + r[1].n, 0))}</td></tr></tfoot></table></div>
  <div class="cuadre"><span class="muted">Demanda de ${esc(rango(L12))} en el portal: ${fN(real)} pz${res.misma && cuadra && !exacto ? ` · diferencia de ${fPz(Math.abs(dif))} pz por redondeo (el portal guarda piezas enteras cada mes)` : ''}</span>${res.misma ? pill(cuadra ? 'good' : 'bad', cuadra ? (exacto ? '✓ cuadra' : '✓ cuadra (redondeo)') : `no cuadra por ${fPz(Math.abs(dif))} pz: avisa a BI`) : pill('', 'detalle de otra corrida: no se compara')}</div>
  <p class="tec">${desv.length ? `En ${desv.length === 1 ? 'una fila' : desv.length + ' filas'} unidades × factor no da exactamente las piezas: ${desv.some(r => r[0].fuente === 'SELL IN DIRECTO') ? 'el sell in directo se redondea factura por factura antes de sumar' : 'las cantidades del archivo traen decimales'}. ` : ''}Regla de asignación: ${esc([...new Set(rows.map(r => r[0].asignacion).filter(Boolean))].join(' · ') || '—')}. Fuente: detalle/ del rastreo (linajes), archivo ${esc((res.leido || {}).ruta || '—')}.</p>`;
}
async function abrirLinaje() {
  const p = PID[RS.p], box = $('#lj-cuerpo'); if (!p || !box) return;
  if (!RS.cache[p.id]) box.innerHTML = '<p class="muted">Cargando el detalle de este producto…</p>';
  const res = await cargarRastreo(p);
  if (PID[RS.p] !== p || !$('#lj-cuerpo')) return;
  $('#lj-cuerpo').innerHTML = res.msg ? `<p class="aviso info">${res.msg}</p>` : htmlLinaje(p, res);
}

/* ---------- guardar ---------- */
const timers = {}, cadena = {};
let pendientes = 0;
function estado(t, cls) { $('#estado').innerHTML = `<span class="dot ${cls || ''}"></span><span>${esc(t)}</span>`; }
function guardarLocal() { try { localStorage.setItem(LS, JSON.stringify({ unidad: S.unidad, local: db ? {} : local })); } catch (e) { } }
function setKam(id, m, v) {
  if (!editable(m)) return;                                       // nunca se guarda un mes fuera de la ventana de captura
  local[id] = local[id] || { meses: {} }; local[id].meses = local[id].meses || {}; local[id].meses[m] = v;
  guardarLocal(); programar(id);
  const L = LINES[id]; if (L) document.dispatchEvent(new CustomEvent('fcst:captura', { detail: { clase: L.p.clase, cod: L.c.cod, mes: m, id, valor: v } }));      // 070-GRAFICO: contrato común (brief 0.7.0 › regla 4)
}
function programar(id) { clearTimeout(timers[id]); estado('Guardando…', 'pend'); timers[id] = setTimeout(() => guardar(id), 700); }
function soloVentana(o) { const r = {}; Object.keys(o || {}).forEach(m => { if (MK.includes(m)) r[m] = o[m]; }); return r; }
function guardar(id) {
  const { p, c } = LINES[id], r = remote[id] || {}, l = local[id] || {};
  const body = { clase: p.clase, cod: c.cod, producto: p.grupo, meses: soloVentana(Object.assign({}, r.meses || {}, l.meses || {})),
    nota: l.nota != null ? l.nota : (r.nota || ''), por: uid || '', en: new Date().toISOString() };
  if (!db) { estado('Guardado solo en este navegador', 'pend'); return; }
  pendientes++;
  cadena[id] = (cadena[id] || Promise.resolve())
    .then(() => db.doc(`ciclos/${CID}/lineas/${id}`).set(body))
    .then(() => { pendientes--; if (!pendientes) estado('Guardado ' + hora(), 'ok'); },
      e => { pendientes--; estado(e && (e.code === 'not_granted' || e.code === 'permission_denied') ? 'No tienes permiso para guardar: avisa a BI' : 'No se pudo guardar; revisa la conexión', 'err'); });
}
function sincronizarInputs() {
  document.querySelectorAll('.inp').forEach(el => {
    const L = LINES[el.dataset.line]; if (!L) return;
    const v = kamU(L.c, el.dataset.mes);
    if (document.activeElement !== el && String(v) !== el.value) el.value = v;
    el.classList.toggle('ed', editado(L.c, el.dataset.mes));
  });
}
function refrescarGrupo(p) {
  const f = fac(p), d = dif(p);
  $$('[data-gt]').forEach(e => { if (e.dataset.gt === p.id) e.textContent = fN1(kamPz6(p) / f); });
  $$('[data-gd]').forEach(e => { if (e.dataset.gd === p.id) { e.textContent = flecha(d) + fP(d); e.className = d != null && Math.abs(d) > 0.3 ? 'warn' : 'muted'; } });
  $$('[data-ga]').forEach(e => { if (e.dataset.ga === p.id) e.innerHTML = avisosPills(avisosCaptura(p)); });
}
let tRef = null;
function refrescarResumen() {        // repinta solo lo visible
  clearTimeout(tRef);
  tRef = setTimeout(() => {
    if (S.vista === 'tendencia') { pintarHorizonte(); pintarKpis(); pintarTotal(); pintarLista(); }
    if (S.vista === 'distribuidores') pintarDistribuidores();
    if (S.vista === 'capturar') { filasGrid.forEach(totFila); pieGrid(); pintarResumenCap(); prodGrid.forEach(refrescarGrupo); }
    if (S.abierto) refrescarDetalle(PID[S.abierto]);
  }, 250);
}
function pintarEnvio() {
  const el = $('#estado-envio');
  if (envio && envio.estado === 'listo') {
    const f = new Date(envio.en);
    el.className = 'pill good';
    el.textContent = 'Listo · ' + f.toLocaleDateString('es-CR', { day: 'numeric', month: 'short' }) + ' ' + f.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' });
    if (userCap && envio.por) userCap.profiles([envio.por]).then(ps => { const n = ps[envio.por] && ps[envio.por].name; if (n) el.textContent += ' · ' + n; });
    $('#b-listo').textContent = 'Volver a marcar como listo';
  } else { el.className = 'pill'; el.textContent = 'Sin marcar como listo'; }
  if (VENCIDO) $('#b-listo').disabled = true;
}

/* ---------- eventos ---------- */
function vista(v) {
  if (v === 'metodo') { v = 'tendencia'; const nb2 = $('.notas-bi'); if (nb2) nb2.open = true; }      // 0.6.0: la pestaña "Cómo se calcula" se fue; sus notas quedan al final del resumen (BI)
  S.vista = v;
  document.querySelectorAll('#f-vista button').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === v));
  $('#v-tendencia').hidden = v !== 'tendencia'; $('#v-capturar').hidden = v !== 'capturar';
  const vd = $('#v-distribuidores'); if (vd) vd.hidden = v !== 'distribuidores';
  const vc = $('#v-contenedor'); if (vc) vc.hidden = v !== 'contenedor';
  if (v !== 'contenedor' && C3.escena) { C3.escena.destruir(); C3.escena = null; }      // libera la GPU al salir de la vista 3D
  if (v === 'contenedor') pintarContenedor();
  if (v === 'capturar') pintarGrid();
  if (v === 'tendencia') { pintarHorizonte(); pintarKpis(); pintarTotal(); pintarLista(); }
  if (v === 'distribuidores') pintarDistribuidores();
}
function toast(t) { const el = $('#toast'); el.textContent = t; el.hidden = false; clearTimeout(el._t); el._t = setTimeout(() => { el.hidden = true; }, 2600); }
let tq = null;
const debounce = fn => { clearTimeout(tq); tq = setTimeout(fn, 160); };
document.addEventListener('click', ev => {
  const t = ev.target.closest('button,[data-rs-ir]'); if (!t) return;
  const ds = t.dataset;
  if (ds.exp) { const fn = EXP[ds.exp]; if (fn) abrirExp(fn(ds)); return; }
  if (ds.d) { S.dist = ds.d; S.lim = 60; S.capLim = 25; if (S.dist !== 'TODOS') { C3.clase = S.dist; C3.prod = ''; C3.idx = 0; } pintarEncabezado(); vista(S.vista); return; }
  if (ds.v) { vista(ds.v); return; }
  /* 0.5.0 · contenedores 3D */
  if (ds.c3tipo) { C3.tipo = ds.c3tipo; C3.idx = 0; pintarContenedor(); return; }
  if (ds.c3fuente) { C3.fuente = ds.c3fuente; C3.orden = ''; C3.idx = 0; pintarContenedor(); return; }
  if (ds.c3idx != null) { C3.idx = +ds.c3idx; pintarContenedor(); return; }
  if (ds.c3cam) { if (C3.escena) C3.escena.camara(ds.c3cam); return; }
  if ('c3anim' in ds) { if (C3.escena) C3.escena.recargar(); return; }
  if (ds.c3prod) { const p = PID[ds.c3prod]; if (p) { C3.clase = p.clase; C3.prod = p.id; C3.pres = ''; C3.idx = 0; cerrar(); vista('contenedor'); } return; }
  if (ds.u) { S.unidad = ds.u; guardarLocal(); pintarEncabezado(); vista(S.vista); if (S.abierto) pintarDetalle(PID[S.abierto]); return; }
  if (ds.chip) { S.chip = ds.chip; S.lim = 60; pintarEncabezado(); pintarLista(); return; }
  if (ds.chip2) { S.chip2 = ds.chip2; S.capLim = 25; pintarEncabezado(); pintarGrid(); return; }
  if (ds.capv) { S.capVista = ds.capv; pintarEncabezado(); pintarGrid(); return; }
  if ('mas' in ds) { S.lim += 60; pintarLista(); return; }
  if (ds.mascat != null) { S.limCat[ds.mascat] = (S.limCat[ds.mascat] || 40) + 60; pintarLista(); return; }
  if (t.id === 'b-comokam') { const on = document.body.classList.toggle('como-kam'); t.setAttribute('aria-pressed', on); return; }
  if ('capmas' in ds) { S.capLim += 25; pintarGrid(); return; }
  if (t.id === 'b-desde' || t.id === 'b-desde2') { S.desde = S.desde === '2024-01' ? '2025-01' : '2024-01'; t.setAttribute('aria-pressed', S.desde === '2024-01'); if (S.vista === 'tendencia') pintarTotal(); if (S.abierto) graficoProducto(PID[S.abierto]); return; }
  if (ds.tabla) { const el = $('#' + ds.tabla), box = $('#' + ds.tabla + '-tb'), on = t.getAttribute('aria-pressed') !== 'true'; t.setAttribute('aria-pressed', on); box.innerHTML = on && el && el._o ? tablaSeries(el._o) : ''; return; }
  if (ds.rsNivel != null) { RS.path = RS.path.slice(0, +ds.rsNivel + 1); RS.dim = null; RS.lim = 200; pintarRastreo(); return; }
  if (ds.rsDim) { RS.dim = ds.rsDim; RS.lim = 200; pintarRastreo(); return; }
  if (ds.rsIr != null) { RS.path.push([RS.dim, ds.rsIr]); RS.dim = null; RS.lim = 200; pintarRastreo(); return; }
  if ('rsMas' in ds) { RS.lim += 200; pintarRastreo(); return; }
  if ('rsReintentar' in ds) { abrirRastreo(); return; }
  if (ds.p && !ds.exp) { abrir(ds.p); return; }
  if (t.classList.contains('cerrar')) { cerrar(); return; }
  if (ds.usarAlg || ds.volver) {
    const id = ds.usarAlg || ds.volver, { p, c } = LINES[id];
    MK.forEach(m => { setKam(id, m, ds.usarAlg ? Math.round((p.alg[m] || 0) / c.pzPorU) : (vig(c, m) || 0)); });
    sincronizarInputs(); totFila(id); refrescarResumen(); toast(ds.usarAlg ? 'Se copió el algoritmo en los meses de captura' : 'Volvió a tu formulario'); return;
  }
  if (t.id === 'b-listo') {
    if (VENCIDO) { toast('La captura de este ciclo ya cerró'); return; }
    if (!db) { toast('Para marcarlo como listo hay que abrir el enlace con sesión iniciada'); return; }
    const tot = P.reduce((a, p) => a + kamValM(p, MK), 0);
    t.disabled = true;
    db.doc(`ciclos/${CID}`).set({ estado: 'listo', por: uid || '', en: new Date().toISOString(), valorLista: Math.round(tot) })
      .then(() => toast('Forecast marcado como listo'), () => toast('No se pudo marcar; revisa tu permiso o la conexión'))
      .finally(() => { t.disabled = false; });
  }
});
document.addEventListener('keydown', ev => {
  const t = ev.target;
  if ((ev.key === 'Enter' || ev.key === ' ') && t.dataset && t.dataset.rsIr != null) { ev.preventDefault(); t.click(); return; }
  if (ev.key === 'Enter' && t.classList && t.classList.contains('inp')) {      // Enter baja a la casilla de abajo (como en Excel)
    ev.preventDefault();
    const caja = t.closest('dialog') || t.closest('#v-capturar') || document, todos = [...caja.querySelectorAll('.inp')], i = todos.indexOf(t);
    const sig = todos.slice(i + 1).find(o => o.dataset.mes === t.dataset.mes) || todos[i + 1]; if (sig) sig.focus();
  }
});
document.addEventListener('focusin', ev => {
  const el = ev.target;
  if (el.classList && el.classList.contains('inp') && el.closest('#v-capturar')) { S.foco = [el.dataset.line, el.dataset.mes]; inspector(el.dataset.line, el.dataset.mes); if (!el.readOnly) el.select(); }
});
document.addEventListener('toggle', ev => { if (ev.target.classList && ev.target.classList.contains('c3-filtros-box')) C3.filtros = ev.target.open; if (ev.target.classList && ev.target.classList.contains('cat')) S.catAbierta[ev.target.dataset.cat] = ev.target.open; if (ev.target.id === 'rs-box' && ev.target.open) abrirRastreo(); if (ev.target.id === 'lj-box' && ev.target.open) abrirLinaje(); }, true);
document.addEventListener('input', ev => {
  const el = ev.target;
  if (el.id === 'q') { S.q = el.value; S.lim = 60; debounce(pintarLista); return; }
  if (el.id === 'q2') { S.q2 = el.value; S.capLim = 25; debounce(pintarGrid); return; }
  if (el.dataset.nota) { const id = el.dataset.nota; local[id] = local[id] || { meses: {} }; local[id].nota = el.value; guardarLocal(); programar(id); return; }
  if (el.classList.contains('inp')) {
    const id = el.dataset.line, m = el.dataset.mes;
    if (!editable(m)) { el.value = kamU(LINES[id].c, m); return; }
    const raw = el.value.replace(/[^\d]/g, ''); if (raw !== el.value) el.value = raw;
    const v = raw === '' ? 0 : parseInt(raw, 10);
    setKam(id, m, v);
    $$('.inp').forEach(o => { if (o !== el && o.dataset.line === id && o.dataset.mes === m) o.value = v; });
    el.classList.toggle('ed', editado(LINES[id].c, m));
    totFila(id); pieGrid(); refrescarGrupo(LINES[id].p); refrescarResumen();
    if (el.closest('#v-capturar')) inspector(id, m);
  }
});
document.addEventListener('change', ev => {
  if (ev.target.id === 'f-cat') { S.cat = ev.target.value; S.lim = 60; pintarLista(); }
  if (ev.target.id === 'f-orden') { S.orden = ev.target.value; pintarLista(); }
  const C3SEL = { 'c3-desde': 'desde', 'c3-hasta': 'hasta', 'c3-clase': 'clase', 'c3-prod': 'prod', 'c3-pres': 'pres', 'c3-color': 'color', 'c3-orden': 'orden' };
  if (C3SEL[ev.target.id]) { C3[C3SEL[ev.target.id]] = ev.target.value; if (ev.target.id === 'c3-clase') { C3.prod = ''; C3.pres = ''; C3.orden = ''; } if (ev.target.id === 'c3-desde' || ev.target.id === 'c3-hasta') C3.orden = ''; C3.idx = 0; pintarContenedor(); }
  if (ev.target.id === 'rs-m') { RS.m = ev.target.value; RS.path = []; RS.dim = null; RS.lim = 200; pintarRastreo(); }
});
$('#det').addEventListener('close', () => {
  const id = S.abierto; S.abierto = null; RS.p = null;
  /* 070-DETALLE: el navegador devuelve el foco a quien abrió el panel; si ese botón se volvió a pintar mientras tanto (la lista se repinta al capturar), se busca el mismo producto */
  const o = abrir.desde; abrir.desde = null;
  if (o && !o.isConnected && id) { const b = [...document.querySelectorAll('[data-p]')].find(x => x.dataset.p === id && !x.closest('dialog')); if (b) b.focus(); }
});
/* 070-DETALLE: el gráfico del detalle se redibuja en cuanto cambia una captura de este producto (el evento lo dispara quien guarda la captura) */
let rafDetCap = 0;
document.addEventListener('fcst:captura', ev => {
  const x = ev.detail || {}, p = S.abierto && PID[S.abierto];
  if (!p || (x.clase && x.clase !== p.clase) || (x.cod && !p.codigos.some(c => c.cod === x.cod))) return;
  cancelAnimationFrame(rafDetCap); rafDetCap = requestAnimationFrame(() => { if (S.abierto === p.id) refrescarDetalle(p); });
});
/* cierre al tocar fuera donde el navegador no tiene closedby (Safari) */
if (typeof HTMLDialogElement !== 'undefined' && !('closedBy' in HTMLDialogElement.prototype)) {
  document.querySelectorAll('dialog[closedby="any"]').forEach(dlg => {
    let fuera = false;
    const out = e => { const r = dlg.getBoundingClientRect(); return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom; };
    dlg.addEventListener('pointerdown', e => { fuera = out(e); });
    dlg.addEventListener('pointerup', e => { if (fuera && out(e)) dlg.close(); });
  });
}

/* ---------- arranque ---------- */
pintarEncabezado(); pintarMetodo(); vista('tendencia');
if (VENCIDO) $('#b-listo').disabled = true;
(async () => {
  if (!window.claude || !window.claude.use) {
    try { const g = JSON.parse(localStorage.getItem(LS) || 'null'); if (g && g.local) { local = g.local; sincronizarInputs(); refrescarResumen(); } } catch (e) { }
    estado('Sin conexión: los cambios quedan en este navegador', 'pend'); return;
  }
  const t10 = setTimeout(() => estado('El servidor no responde todavía; lo que escribas se guardará al reconectar', 'pend'), 10000);
  try {
    userCap = await window.claude.use('user');
    if (userCap) {
      const me = await userCap.me(); uid = me.id;
      const pe = $('#persona'); pe.textContent = '';
      const img = document.createElement('img'); img.alt = ''; img.src = me.avatarUrl; pe.appendChild(img);
      const sp = document.createElement('span'); sp.textContent = me.name || 'Tú'; pe.appendChild(sp);
    }
  } catch (e) { }
  db = await window.claude.use('db');
  if (!db) { clearTimeout(t10); estado('Inicia sesión para guardar; por ahora se guarda en este navegador', 'pend'); return; }
  db.collection(`ciclos/${CID}/lineas`).onSnapshot(snap => {
    const nr = {}; snap.docs.forEach(d => { nr[d.id] = d.data(); }); remote = nr;
    if (!snap.metadata.fromCache) clearTimeout(t10);
    if (!pendientes) estado(VENCIDO ? 'Captura cerrada · solo lectura' : snap.size ? 'Guardado al día' : 'Listo para capturar', 'ok');
    sincronizarInputs(); refrescarResumen();
  }, () => { clearTimeout(t10); estado('No se pudo leer lo guardado', 'err'); });
  db.doc(`ciclos/${CID}`).onSnapshot(d => { envio = d.exists ? d.data() : null; pintarEnvio(); }, () => { });
})();

};
