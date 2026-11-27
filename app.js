/* Generado por herramientas/construir_web.py desde 07 MOTOR FCST/portal. No editar aquí. */
window.iniciarPortal = function (DATOS) {
'use strict';
/* 25-nov · módulo de órdenes de exportación (web): pide solo el núcleo 3D (app_2_vistas.js › nucleo3D) sin datos de un KAM. */
if (DATOS === 'nucleo3D') return nucleo3D();
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
/* 092-USD (26-nov, pedido del usuario: "en exportación ver los montos de venta en dólares"). datos.usd {tc, clases, porDefecto, tcMes, sellInUsd}
   del generador: el precio ₡ de las clases de exportación es el precio USD de Softland (nivel EXP) × usd.tc, así que USD = ₡ ÷ usd.tc cuadra
   exacto. MON.usd lo cambia el selector "₡ / US$" (#f-mon); todos los montos pasan por fC / fC2 / fEje. Sin datos.usd, todo en ₡ como antes. */
const MON = { usd: false, tc: (D.usd && +D.usd.tc > 0) ? +D.usd.tc : null, sim: '₡' };
const LS_MON = 'portal-mon-' + (D.kam || 'kam').toLowerCase().normalize('NFD').replace(/[^a-z0-9]/g, '');
function monSet(m) { MON.usd = !!MON.tc && m === 'USD'; MON.sim = MON.usd ? 'US$' : '₡'; }
try { const g = localStorage.getItem(LS_MON); monSet(g === 'USD' || g === 'CRC' ? g : (MON.tc && D.usd.porDefecto === 'USD' && D.clases.every(c => (D.usd.clases || []).includes(c)) ? 'USD' : 'CRC')); } catch (e) { monSet(MON.tc && D.usd && D.usd.porDefecto === 'USD' ? 'USD' : 'CRC'); }
const enMon = v => MON.usd ? v / MON.tc : v;
const monTxt = () => MON.usd ? 'dólares' : 'colones';
const fC = v => { if (!ok(v)) return '—'; v = enMon(v); const s = MON.sim, a = Math.abs(v); if (a >= 1e6) return s + nf1.format(v / 1e6) + ' M'; if (a >= 1e4) return s + nf.format(v / 1e3) + ' mil'; return s + nf.format(v); };
const fC2 = v => ok(v) ? MON.sim + nf2.format(enMon(v)) : '—';
const fCx = v => { const a = Math.abs(v); if (a >= 1e6) return nf1.format(v / 1e6) + ' M'; if (a >= 1e3) return nf.format(v / 1e3) + ' mil'; return nf.format(v); };
const fEje = v => v === 0 ? MON.sim + '0' : MON.sim + fCx(enMon(v));      // 092-USD: eje de los gráficos en dinero
const fP = v => { if (!ok(v)) return '—'; const r = Math.round(v * 100); return (r > 0 ? '+' : r < 0 ? '−' : '') + nf.format(Math.abs(r)) + ' %'; };
const flecha = v => { if (!ok(v)) return ''; const r = Math.round(v * 100); return r > 0 ? '▲ ' : r < 0 ? '▼ ' : ''; };
/* 092-FLECHAS: color de la variación de venta con el mismo redondeo que flecha/fP: verde si crece, rojo si baja, gris si 0 % o sin dato.
   La flecha y el signo se quedan (no solo color); el title lo dice en palabras. */
const cls3 = v => { if (!ok(v)) return 'flat'; const r = Math.round(v * 100); return r > 0 ? 'up' : r < 0 ? 'down' : 'flat'; };
const tit3 = v => { const c = cls3(v); return c === 'up' ? 'creció' : c === 'down' ? 'bajó' : ok(v) ? 'sin cambio' : 'sin dato para comparar'; };
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
const ICO = { lock: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
  graf: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19h16"/><path d="M5 15l4-5 4 3 6-7"/></svg>' };      // 090-CAPFILTRO (094: la grilla ya no lo usa)

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
const EST = { real: 'Cerrado · venta real', pend: 'Cerrado · real pendiente', curso: 'En curso · no se captura', abierto: 'Abierto para captura', ref: 'Referencia · fuera de la captura (pronóstico estimado)' };
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
/* 25-nov · órdenes de exportación en vivo (web: portal.js › portalOrdenes lee ordenes.json y app_4_ordenes.js › indicadores las convierte).
   ordenes.json es la única fuente de verdad: si se puede leer, REEMPLAZA el tránsito y los pedidos programados que trajo el generador
   para las clases del KAM. Tránsito = estado con CUENTA_COMO_INVENTARIO = SI que llega después del corte de inventario del producto
   (la misma regla del generador: si llegó antes o el día del corte ya está en el inventario del distribuidor). Programado = lo pedido,
   aparte, no suma días. Los días por clase y el total (diasInventarioPz) se recalculan con la misma venta diaria. */
function aplicarOrdenesVivo(x) {
  if (!x || !Array.isArray(x.lineas)) return false;
  /* 092: con el tránsito validado por Melissa (datos.transitoValidado, facturas y pedidos de Softland) no se reemplaza nada con ordenes.json:
     sus OC ya están en Softland como pedidos abiertos y se contarían dos veces. Queda anotado para BI. */
  if (D.transitoValidado) { D.ordenesVivo = { actualizado: x.actualizado, por: x.actualizadoPor, lineas: x.lineas.length, sinProducto: [], ignorado: 'tránsito validado' }; return false; }
  const clases = new Set(D.clases.map(c => String(c).toUpperCase())), porProd = new Map(), sinProd = [];
  x.lineas.forEach(l => {
    const cl = String(l.clase || '').toUpperCase(); if (!clases.has(cl)) return;
    const p = P.find(q => q.clase.toUpperCase() === cl && q.codigos.some(c => c.cod === l.cod));
    if (!p) { sinProd.push(l); return; }
    if (!porProd.has(p)) porProd.set(p, []); porProd.get(p).push(l);
  });
  const suma = (xs, k) => xs.reduce((a, l) => a + (+l[k] || 0), 0);
  P.forEach(p => {
    if (!clases.has(p.clase.toUpperCase())) return;
    const ls = porProd.get(p) || [], corte = p.inv && p.inv.fecha;
    const tr = ls.filter(l => l.cuentaInventario && l.pz > 0 && !(corte && l.fechaLlegada && l.fechaLlegada <= corte));
    const pg = ls.filter(l => l.programado);
    p.transito = tr.length ? { pz: suma(tr, 'pz'), cajas: suma(tr, 'cajas'), ordenes: tr.map(l => Object.assign({}, l, { motivo: `en tránsito: llega después del corte del ${fechaCorta(corte)} (${l.fechaLlegadaFuente} ${fechaCorta(l.fechaLlegada)})` })) } : null;
    p.pedidosProgramados = pg.length ? { pz: suma(pg, 'pzPedidas'), cajas: suma(pg, 'cajasPedidas'), ordenes: pg.map(l => Object.assign({}, l, { cajas: l.cajasPedidas, pz: l.pzPedidas })) } : null;
    if (p.inv) { const ip = invPartes(p), t = p.transito ? p.transito.pz : 0; Object.assign(p.inv, { pzDistribuidor: ip.dist, pzTransito: t, pzTotal: ip.dist + t, pz: ip.dist + t }); }
  });
  const dip = D.diasInventarioPz;
  const upd = (o, ps) => {
    if (!o) return;
    const t = ps.reduce((a, p) => a + (p.inv ? +p.inv.pzTransito || 0 : 0), 0), d = o.invPzDistribuidor ?? o.pzDistribuidor ?? ((+o.invPz || 0) - (+o.pzTransito || 0));
    Object.assign(o, { invPzDistribuidor: d, pzDistribuidor: d, invPzTransito: t, pzTransito: t, invPz: d + t });
    if (o.ventaDiariaPz > 0) Object.assign(o, { dias: Math.round((d + t) / o.ventaDiariaPz), diasTransito: Math.round(t / o.ventaDiariaPz) });
  };
  if (dip) { Object.entries(dip.porClase || {}).forEach(([cl, o]) => upd(o, P.filter(p => p.clase === cl))); upd(dip.total, P); }
  D.ordenesVivo = { actualizado: x.actualizado, por: x.actualizadoPor, lineas: x.lineas.length, sinProducto: sinProd };
  return true;
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
  p.txt = (p.nombre + ' ' + p.grupo + ' ' + p.cat + ' ' + p.codigos.map(c => c.cod + ' ' + c.desc + ' ' + (c.descBrinova || '')).join(' ') + (p.caja ? ' ' + p.caja.cod + ' ' + (p.caja.desc || '') : '')).toLowerCase();      // 090-CAJAS: también la descripción del sell in y la caja
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
/* 0.7.1 · fuente de la demanda de UN producto: productos[].origenPz {tipo: piezas 12 meses} (p. ej. LIKE de PANAMA = solo sell in directo);
   sin origenPz se usa la del distribuidor. Devuelve {tipo: participación 0–1}. */
function origenProd(p) {
  const og = p && p.origenPz, tot = og ? Object.values(og).reduce((a, b) => a + (b > 0 ? b : 0), 0) : 0;
  if (tot > 0) { const o = {}; Object.entries(og).forEach(([t, v]) => { if (v > 0) o[t] = v / tot; }); return o; }
  return mezclaDe(p.clase) || { [tipoDe(p.clase)]: 1 };
}
function fuenteProd(p) {
  const ts = Object.entries(origenProd(p)).filter(([, v]) => v >= 0.005).sort((a, b) => b[1] - a[1]), nom = t => (TIPO[t] || { c: t }).c;
  if (ts.length <= 1) return nom(ts.length ? ts[0][0] : tipoDe(p.clase));
  return ts.map(([t, v]) => nom(t) + ' ' + nf.format(Math.round(v * 100)) + ' %').join(' + ');
}
/* producto que en un distribuidor de sell through se vende solo por facturación directa (LIKE de Xtra en PANAMA) */
const soloDirecto = p => { const o = origenProd(p), k = Object.keys(o); return k.length === 1 && k[0] === 'sell in directo' && tipoDe(p.clase) !== 'sell in directo'; };
function fuenteLargaProd(p) {
  if (!soloDirecto(p)) return fuenteLarga(p.clase);
  return `Facturación directa de Brinova${p.clase === 'PANAMA' ? ' a Supermercados Xtra (marca LIKE)' : ''} (sell in directo): este producto no viene en el reporte de ventas del distribuidor, así que su demanda es lo que Brinova facturó`;
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
try { const g = JSON.parse(localStorage.getItem(LS_GRAF) || 'null'); if (g) { if (Array.isArray(g.ocultas)) S.ocultas = g.ocultas.filter(k => typeof k === 'string'); S.agrupar = !!g.agrupar; S.cgOculto = !!g.cgOculto; } if (!g || typeof g.cgOculto !== 'boolean') S.cgOculto = matchMedia('(max-width:760px)').matches; } catch (e) { }      // 094: sin preferencia, el gráfico de Capturar arranca plegado en el celular
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
/* 083-DIAS (25-nov, decisiones del usuario; misma regla que generar_portal_kam.py › base_doh). Ventana de venta de los días, POR PRODUCTO:
   - venta = la que corresponde al inventario reportado: productos[].inv.ventaPz (sell through del distribuidor) si viene; si no, .real;
   - meses = los 3 últimos meses completos de la clase (sin mesesIncompletos) que terminan en el último mes cerrado o, si el corte de
     inventario es anterior (dato viejo), en el mes del corte; si alguno de esos 3 meses tiene venta 0, los 6 últimos completos;
   - sin venta en esos 6 meses: no hay días ("sin venta en 6 meses"). La página recalcula con esto; inv.doh del generador es referencia. */
function k83Fin(cl) { const f = fechaInv(cl), fin = MH[MH.length - 1], fm = f ? String(f).slice(0, 7) : null; return fm && fm < fin ? fm : fin; }
function k83Meses(cl, n) { const inc = INCOMP[cl] || [], fin = k83Fin(cl); return MH.filter(m => m <= fin && !inc.includes(m)).slice(-n); }
const _MDOH = {};
function mesesDoh(cl) { return _MDOH[cl] || (_MDOH[cl] = k83Meses(cl, 3)); }      // ventana base de la clase (3 meses)
function baseDoh(p) {
  if (p._k83) return p._k83;
  const s = (p.inv && p.inv.ventaPz) || p.real || {}, m3 = mesesDoh(p.clase);
  if (m3.length === 3 && m3.every(m => (+s[m] || 0) > 0)) return (p._k83 = { meses: m3, n: 3, venta: sum(s, m3) });
  const m6 = k83Meses(p.clase, 6), v6 = sum(s, m6);
  return (p._k83 = { meses: m6, n: 6, venta: v6 > 0 ? v6 : 0, sinVenta: !(v6 > 0), motivo: 'mes sin venta' });
}
const ventaDoh = p => baseDoh(p).venta;
const diasDoh = p => baseDoh(p).meses.length * 30.4;
const dias = p => { if (!p.inv || invTot(p) < 0) return null; const v = ventaDoh(p); return v > 0 ? Math.round(invTot(p) / (v / diasDoh(p))) : null; };      // 0.5.0: incluye el tránsito que cuenta
/* 083-DIAS: la ventana en una línea, y el texto cuando no hay días */
function k83Ventana(p) {
  const b = baseDoh(p), r = rango(b.meses), viejo = invViejo(p.clase) ? ', que terminan en el mes del corte de inventario' : '';
  if (b.sinVenta) return `Sin venta en ${b.meses.length} meses (${r}${viejo}): no se pueden calcular días.`;
  return `Venta usada: ${r} (${b.meses.length} meses${b.n === 6 ? ', porque en los últimos 3 hubo un mes sin venta' : ''}${viejo}).`;
}
const k83SinDias = p => invTot(p) < 0 ? 'inventario negativo en el reporte' : baseDoh(p).sinVenta ? 'sin venta en 6 meses' : 'sin venta reciente';
/* 0.8.3: el reporte trae existencia negativa (INDAVIGO): no se calculan días ni se marca riesgo de quiebre */
const k83NegTxt = p => invTot(p) < 0 ? `El reporte de ${esc(p.clase)} trae inventario negativo (${fN(invTot(p))} pz): no se pueden calcular días; conviene confirmarlo con el distribuidor.` : null;
/* 083-DIAS: producto que se vende directo (productos[].sinInventario, p. ej. LIKE de Xtra en PANAMA): no tiene inventario del distribuidor */
const k83SinInvTxt = p => p.sinInventario ? 'Este producto se vende directo (sell in de Brinova), no por el distribuidor: no tiene inventario del distribuidor ni días.' : null;
/* 083-DIAS: cantidades de inventario en la unidad del producto: "≈119,6" si la división no es exacta (antes "120") */
const k83Cant = v => !ok(v) ? '—' : Math.abs(v - Math.round(v)) < 1e-6 ? fN(v) : '≈' + nf1.format(v);
/* 083-DIAS: "El reporte de CODISA dice 23 días (DOH Unidades 3 Meses)". Solo si el generador lo marcó como días del propio distribuidor
   (inv.dohFuenteDe, de MAESTROS_DISTRIBUIDORES.xlsx › T_INVENTARIO_DIAS_FUENTE) y el valor es positivo. Datos viejos sin ese campo: no se muestra. */
function k83Reporte(i) {
  const x = i && i.dohFuenteDe; if (!x || !ok(i.dohFuente) || !(i.dohFuente > 0)) return '';
  const meses = /MES/i.test(x.unidad || '');
  return `El reporte de ${esc(x.distribuidor)} dice ${diasTxt(i.dohFuente)}${x.columna ? ' (' + esc(x.columna) + (meses ? ', en meses × 30' : '') + ')' : ''}.`;
}
/* 083-DIAS: ventana de una selección en una línea (diálogo de los días de la clase) */
function k83VentanaSel(st) {
  const n6 = st.filter(p => baseDoh(p).n === 6 && !baseDoh(p).sinVenta).length, n0 = st.filter(p => baseDoh(p).sinVenta).length, n3 = st.length - n6 - n0;
  const cls = [...new Set(st.map(p => p.clase))], r3 = cls.length === 1 ? ' (' + rango(mesesDoh(cls[0])) + ')' : '';
  return `Ventana: últimos 3 meses completos${r3} en ${n3} ${n3 === 1 ? 'producto' : 'productos'}` + (n6 ? `; 6 meses en ${n6} con un mes sin venta` : '') + (n0 ? `; ${n0} sin venta en 6 meses (cuentan su inventario, no su venta)` : '') + '.';
}
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
/* 090-CAJAS (26-nov, pedido del usuario: "tener cajas en la lista al entrar por categoría a los productos de la web principal; ver con su
   descripción desde el sell in y no desde el distribuidor"). La lista de productos y el gráfico principal (vista Tendencia) muestran cada
   producto en su CAJA de Brinova: productos[].caja {cod, pz, desc} del generador = T_SKU › UNIDAD DE EMPAQUE y DESCRIPCIÓN (maestro del sell in).
   Datos sin ese campo: la caja entre los códigos del producto (TIPO BULTO/CAJA o CAJA, o presentación Caja, con más de 1 pz; primero el principal,
   luego el más facturado); si no hay caja, la unidad del formulario, como antes. Con "Piezas" arriba, todo en piezas.
   La captura y el detalle siguen en la unidad del formulario: es la que el KAM escribe. */
function cajaDe(p) {
  if (p._caja !== undefined) return p._caja;
  let k = p.caja && +p.caja.pz > 1 ? { cod: p.caja.cod, pz: +p.caja.pz, desc: p.caja.desc || p.caja.cod } : null;
  if (!k) {
    const es = c => c.pzPorU > 1 && (/caja/i.test(c.tipo || '') || /caja/i.test(c.pres || ''));
    const c = p.codigos.filter(es).sort((a, b) => (b.cod === p.principal) - (a.cod === p.principal) || (b.u12 || 0) * b.pzPorU - (a.u12 || 0) * a.pzPorU)[0];
    if (c) k = { cod: c.cod, pz: c.pzPorU, desc: c.descBrinova || c.desc || c.cod };
  }
  return (p._caja = k);
}
const pzLista = p => S.unidad === 'pz' ? 1 : cajaDe(p) ? cajaDe(p).pz : fac(p);      // piezas por unidad mostrada en la lista
const uNomLista = p => S.unidad === 'pz' ? 'piezas' : cajaDe(p) ? 'cajas de ' + fN(cajaDe(p).pz) + ' pz' : uNom(p);
const uPillLista = p => { const f = pzLista(p); return `<span class="upill ${f > 1 ? 'emp' : 'pz'}" title="${esc(f > 1 ? 'Cantidades en ' + uNomLista(p) + ': 1 = ' + fN(f) + ' piezas' + (cajaDe(p) && S.unidad !== 'pz' ? ' (caja ' + cajaDe(p).cod + ' del maestro de Brinova)' : '') : 'Cantidades en piezas sueltas')}">${esc(uNomLista(p))}</span>`; };
const codSI = p => cajaDe(p) ? cajaDe(p).cod : p.principal;      // código del sell in que se muestra en la lista
const descSI = p => cajaDe(p) ? cajaDe(p).desc : descB(p.princ);      // descripción del sell in (T_SKU) de ese código, no la del distribuidor
/* precio de lista de la unidad de la lista: el del código caja si el KAM lo tiene; si no, precio por pieza × piezas de la caja */
function precioLista(p) {
  const k = cajaDe(p);
  if (!k || S.unidad === 'pz') return { v: precioU(p, p.princ), por: esEmpaque(p) || p.uPz > 1 ? String(presDe(p.princ) || 'unidad').toLowerCase() : 'pieza' };
  const c = p.codigos.find(x => x.cod === k.cod);
  return { v: c ? precioU(p, c) : p.precioPz != null ? p.precioPz * k.pz : null, por: 'caja' };
}
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
function pillTend(t) { if (t == null) return pill('', 'sin base'); const c = cls3(t); return `<span class="pill ${c === 'up' ? 'good' : c === 'down' ? 'bad' : ''}" title="${tit3(t)}">${esc(flecha(t) + fP(t))}</span>`; }      // 092-FLECHAS
function pillDias(d, cl) { if (d == null) return pill('', 'sin dato'); const e = estInv(d, cl); return pill(e[0], diasTxt(d) + ' · ' + e[1].toLowerCase()); }
function pillDif(d) { if (d == null) return pill('', '—'); return pill(Math.abs(d) <= 0.1 ? 'good' : Math.abs(d) <= 0.3 ? '' : 'warn', flecha(d) + fP(d)); }

/* ---------- alertas del producto y avisos de la captura ---------- */
const inter = k => k && (k.inter != null ? !!k.inter : k.mv12 <= ((D.algoritmo || {}).intermitenteMeses || 4));   // intermitente: compró en N meses o menos del año (v1: 4, v2: 8)
function alertas(p) {
  const a = [];
  if (p.cierre !== 'OK') a.push(['bad', p.cierre === 'REVISAR' ? 'Dato a revisar' : p.cierre.charAt(0) + p.cierre.slice(1).toLowerCase()]);
  const e = estInv(dias(p), p.clase); if (e && e[0] && e[0] !== 'good') a.push([e[0] === 'bad' ? 'bad' : 'warn', e[1]]);
  const df = dif(p);
  if (df != null && Math.abs(df) > 0.5 && pv(p, algPz6(p) + kamPz6(p)) > 300000) a.push(['warn', 'Tu forecast muy ' + (df > 0 ? 'arriba' : 'abajo') + ' del pronóstico estimado']);
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
      out.push(['bad', `${c.cod}: en ${fuertes.map(ml).join(', ')} tu forecast es más de ${veces} veces el pronóstico estimado y más de ${vecesM} veces ${mh.de} (${fN(mh.pz)} pz). En ${ml(m)} el forecast registrado es ${fN(kamU(c, m) * fz)} pz y el pronóstico estimado indica ${fN(alg(m))}.${suaves.length ? ` También pasan de ${veces} veces el pronóstico estimado, sin llegar a ese máximo: ${suaves.map(ml).join(', ')}.` : ''} Registre el motivo en el comentario`, `${c.cod}: ${fuertes.map(ml).join(', ')} más de ${veces}× el pronóstico estimado y de ${vecesM}× su mejor mes`]); }
    else if (suaves.length) { const m = peor(suaves);        // la nota gris sale sola: si el código ya tiene aviso fuerte, sus otros meses van dentro de ese aviso
      out.push(['nota', `${c.cod}: en ${suaves.map(ml).join(', ')} tu forecast es más de ${veces} veces el pronóstico estimado (${ml(m)}: ${fN(kamU(c, m) * fz)} pz contra ${fN(alg(m))}), pero no pasa de ${vecesM} veces ${mh.de} (${fN(mh.pz)} pz). Es solo una nota`, `${c.cod}: ${suaves.map(ml).join(', ')} más de ${veces}× el pronóstico estimado`]); }
    const tiene = MK.some(m => kamU(c, m) > 0);
    if (k.sinVenta >= SV.min && k.sinVenta <= SV.max && tiene) out.push(['warn', `${c.cod}: hace ${fN(k.sinVenta)} ${k.sinVenta === 1 ? 'mes' : 'meses'} que no vende (última venta ${k.ultimo ? mll(k.ultimo) : 'sin registro'}). ¿Sigue activo?`]);
    if (k.estado !== 'ACTIVO' && tiene) out.push(['bad', `${c.cod}: lleva ${fN(k.sinVenta)} meses sin venta y el pronóstico estimado lo deja en 0, pero tu forecast tiene unidades. Revisa si sigue vigente`]);
  });
  const orden = { bad: 0, warn: 1, nota: 2 };
  return out.sort((a, b) => orden[a[0]] - orden[b[0]]);                  // lo fuerte primero; las notas al final
}
const avisosFuertes = p => avisosCaptura(p).filter(a => a[0] !== 'nota');   // lo que pide atención (filtros "Con aviso")
const avisosHtml = av => av.map(([c, x]) => `<p class="aviso${c === 'bad' ? ' bad' : c === 'nota' ? ' nota' : ''}" style="margin-bottom:6px">${c === 'nota' ? '<span class="vh">Nota: </span>' : ''}${esc(x)}</p>`).join('');
const avisosPills = av => av.map(([c, x, corto]) => pill(c === 'nota' ? '' : c, (c === 'nota' ? 'Nota · ' : '') + (corto || (x.length > 70 ? x.slice(0, 68) + '…' : x)))).join(' ');   // en la grilla, versión corta
/* ---------- 090-UNIDADES (26-nov, pedido del usuario: "agregar un aviso por fila, 'posible error de unidades: el forecast es 16 veces lo
   facturado', que pida confirmar o corregir al capturar. Así no se repite en los ciclos siguientes"). Caso emblema: MARTHA · BOURNE · Prensas
   Clásicas 36 Uds, 100 cajas/mes = 43.200 pz contra ≈6 cajas/mes facturadas (09/MEJORAS FORECAST LIVE 2026-11-26/CASO_BOURNE_PRENSAS.md).
   Regla (parámetros en datos.json › reglasAvisos.unidades; sin el campo, estos mismos valores):
     referencia = promedio mensual de los últimos `meses` meses cerrados de lo facturado a ese distribuidor (productos[].sellIn, piezas); si la
       clase no tiene sell in propio en esos meses, la venta real (productos[].real). Con `desdePrimeraVenta`, el promedio empieza en el primer
       mes con venta de la ventana (un lanzamiento de abril se divide entre 7 meses, no entre 12).
     veces = forecast del KAM del mes (piezas, todos los códigos del producto) ÷ referencia. Aviso si veces ≥ `umbral` (5) y forecast ≥ `minPz`.
     Referencia 0 con forecast > 0: aviso aparte, "sin compras en 12 meses: ¿es un lanzamiento?".
   Confirmar: "Es correcto" (motivo opcional) guarda en la línea del código con más piezas ese mes, campo opcional confirmaUnidades
     {mes: {cod, valor, pz, veces, refPz, base, motivo, en, por}}; va en el borrador y se guarda con Guardar (082). Si las piezas del mes
     cambian, el aviso vuelve. Ciclo anterior: D.unidadesConfirmadas (el generador lo lee de captura_<ciclo>.json anteriores); mismo producto,
     distribuidor y piezas = aviso atenuado "confirmado en nov 26", no pide nada. */
const RU = Object.assign({ umbral: 5, meses: 12, desdePrimeraVenta: true, minPz: 0 }, RA.unidades || {});
const UCONF_ANT = Array.isArray(D.unidadesConfirmadas) ? D.unidadesConfirmadas : [];
let SI_CLASE = null;
function refUnid(p) {
  if (p._ru) return p._ru;
  const ms = MH.slice(-RU.meses);
  if (!SI_CLASE) { SI_CLASE = {}; P.forEach(x => { SI_CLASE[x.clase] = (SI_CLASE[x.clase] || 0) + ms.reduce((a, m) => a + (x.sellIn[m] || 0), 0); }); }
  const base = SI_CLASE[p.clase] > 0 ? 'sell in' : 'venta real', ser = base === 'sell in' ? p.sellIn : p.real;
  const i0 = RU.desdePrimeraVenta ? ms.findIndex(m => (ser[m] || 0) > 0) : 0, usa = i0 < 0 ? ms : ms.slice(i0), tot = usa.reduce((a, m) => a + (ser[m] || 0), 0);
  return (p._ru = { pz: i0 < 0 ? 0 : tot / usa.length, n: usa.length, desde: usa[0], base });
}
/* código que lleva el número del mes (el de más piezas): ahí se guarda la confirmación y de ahí sale la unidad del texto */
const codUnid = (p, m) => p.codigos.reduce((a, c) => kamU(c, m) * (c.pzPorU || 0) > kamU(a, m) * (a.pzPorU || 0) ? c : a, p.codigos[0]);
function confUnid(p, m, kpz) {
  for (const c of p.codigos) for (const o of [local[c.id], remote[c.id]]) { const x = o && o.confirmaUnidades && o.confirmaUnidades[m]; if (x && Math.round(x.pz) === Math.round(kpz)) return x; }
  return null;
}
const confUnidAnt = (p, kpz) => UCONF_ANT.filter(x => x.clase === p.clase && (x.producto === p.grupo || p.codigos.some(c => c.cod === x.cod)) && Math.round(x.pz) === Math.round(kpz)).sort((a, b) => String(b.ciclo).localeCompare(String(a.ciclo)))[0] || null;
function avisosUnid(p) {
  if (!p.cap.length) return [];
  const r = refUnid(p), out = [];
  MK.forEach(m => {
    const kpz = kamPz(p, m); if (!(kpz > 0) || kpz < RU.minPz) return;
    const veces = r.pz > 0 ? kpz / r.pz : null; if (veces != null && veces < RU.umbral) return;
    const conf = confUnid(p, m, kpz);
    out.push({ m, kpz, veces, tipo: veces == null ? 'sin' : 'veces', r, c: codUnid(p, m), conf, ant: conf ? null : confUnidAnt(p, kpz) });
  });
  return out;
}
const unidPend = p => avisosUnid(p).filter(a => !a.conf && !a.ant);
const fVeces = v => v >= 10 ? nf.format(Math.round(v)) : nf1.format(Math.round(v * 10) / 10);
const unNom = (c, v) => (c.pzPorU || 1) > 1 ? (v === 1 ? String(presDe(c) || 'unidad').toLowerCase() : plural(presDe(c))) : (v === 1 ? 'pieza' : 'piezas');      // v = 1: singular
/* "¿Eran bolsas de 36?": solo si el producto tiene otro código con menos piezas por unidad con el que el número sí cuadra con lo facturado */
function unidMenor(p, c, v, refPz) {
  if (!(refPz > 0)) return '';
  const xs = p.codigos.filter(x => x.pzPorU > 0 && x.pzPorU < (c.pzPorU || 1)).map(x => ({ x, q: Math.abs(Math.log(v * x.pzPorU / refPz)) })).filter(o => o.q <= Math.log(3)).sort((a, b) => a.q - b.q);
  if (!xs.length) return '';
  const x = xs[0].x; return x.pzPorU === 1 ? 'piezas sueltas' : plural(presDe(x)) + ' de ' + fN(x.pzPorU) + ' pz';
}
/* texto de un grupo de meses con el mismo número (lo normal: el KAM copia el mismo valor) */
function textoUnid(p, as) {
  const a = as[0], c = a.c, v = kamU(c, a.m), u = c.pzPorU || 1, un = unNom(c, v), ms = as.map(x => ml(x.m)).join(', ');
  const qui = a.r.base === 'sell in' ? 'Brinova le facturó' : p.clase + ' vendió', lo = a.r.base === 'sell in' ? 'lo facturado' : 'lo vendido';
  if (a.tipo === 'sin') return `Sin compras en ${RU.meses} meses: ¿es un lanzamiento? En ${ms} tu forecast es ${fN(v)} ${un} = ${fN(a.kpz)} pz y ${a.r.base === 'sell in' ? 'Brinova no le facturó este producto a ' + p.clase : p.clase + ' no vendió este producto'} en ${RU.meses} meses.`;
  const ref = a.r.pz / u, menor = unidMenor(p, c, v, a.r.pz);
  return `Posible error de unidades: ${fN(v)} ${un} = ${fN(a.kpz)} pz, ${fVeces(a.veces)}× ${lo} (≈${fN1(ref)} ${unNom(c)}/mes; ${qui} ${fN(a.r.pz)} pz/mes${a.r.n < RU.meses ? ' desde ' + ml(a.r.desde) : ''}). Meses: ${ms}.${menor ? ` ¿Eran ${menor}?` : ''}`;
}
/* agrupa los meses que avisan por piezas iguales: un aviso por número distinto */
function gruposUnid(as) { const g = new Map(); as.forEach(a => { const k = a.tipo + '|' + Math.round(a.kpz); if (!g.has(k)) g.set(k, []); g.get(k).push(a); }); return [...g.values()]; }
const quienCorto = x => x && x.por ? ' · ' + String(x.por).split('@')[0] : '';
/* bloque del aviso: grilla (ctx 'g') y detalle (ctx 'd'). Pendiente = rojo con "Es correcto" / "Corregir"; confirmado = gris con el motivo */
function unidHtml(p, ctx) {
  const as = avisosUnid(p); if (!as.length) return '';
  const pend = as.filter(a => !a.conf && !a.ant), puede = !VENCIDO && !k72SoloLectura() && !k72Cerrado(p), abierto = UFORM === p.id + '|' + ctx;
  let h = gruposUnid(pend).map(g => `<div class="unid-av ${g[0].tipo === 'sin' ? 'sin' : ''}" role="alert"><span class="unid-tx"><b>${g[0].tipo === 'sin' ? 'Sin compras' : 'Unidades'}:</b> ${esc(textoUnid(p, g))}</span></div>`).join('');
  if (pend.length && puede) h += abierto
    ? `<div class="unid-form"><label class="unid-l">Motivo (opcional)<input type="text" class="unid-mot" id="unid-mot-${sid(p.id)}-${ctx}" maxlength="140" placeholder="p. ej. promoción de enero, cliente nuevo" autocomplete="off"></label><span class="unid-bb"><button type="button" class="btn pri" data-unid-si="${esc(p.id)}">Confirmar</button><button type="button" class="btn" data-unid-no="${esc(p.id)}">Cancelar</button></span></div>`
    : `<div class="unid-bb"><button type="button" class="btn unid-ok" data-unid-ok="${esc(p.id)}" data-ctx="${ctx}">Es correcto</button><button type="button" class="btn unid-fix" data-unid-fix="${esc(p.id)}" data-ctx="${ctx}">Corregir</button></div>`;
  const ok = as.filter(a => a.conf || a.ant);
  if (ok.length) h += `<div class="unid-conf">${gruposUnid(ok).map(g => { const a = g[0], x = a.conf || a.ant; return `<span>✓ ${a.tipo === 'sin' ? 'Sin compras' : fVeces(a.veces) + '× ' + (a.r.base === 'sell in' ? 'lo facturado' : 'lo vendido')} en ${esc(g.map(y => ml(y.m)).join(', '))}: ${a.conf ? 'confirmado' + (x.en ? ' el ' + esc(fechaCorta(x.en)) : '') + esc(quienCorto(x)) : 'confirmado en ' + esc(ml(x.ciclo))}${x.motivo ? ' · “' + esc(x.motivo) + '”' : ''}</span>`; }).join('')}</div>`;
  return h;
}
let UFORM = '';      // formulario de motivo abierto: "<id de producto>|g" o "|d"
/* 090-UNIDADES: casillas del mes que avisa (pendiente) llevan borde rojo */
const unidCelda = (p, c, m) => { const a = avisosUnid(p).find(x => x.m === m); return a && !a.conf && !a.ant && kamU(c, m) > 0 ? ' unid-on' : ''; };
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
const FUENTE_ALG = 'Pronóstico estimado: algoritmo del motor (07 MOTOR FCST, notebook 02 → FCST_ALGORITMO.xlsx, columna FCST_PIEZAS)';
const FUENTE_PRECIO = 'Precio de lista por distribuidor (MAESTROS.xlsx, hoja PRECIOS; respaldo FCST_ALGORITMO). Precio por pieza = precio del código principal ÷ sus piezas';
const FUENTE_BHIST = 'Forecast histórico: BHIST (la carpeta de cada mes guarda tu número para ese mes)';
const FUENTE_REAL = 'Venta real: demanda de cada distribuidor (sell through / sell out / sell in directo)';
const FUENTE_SI = 'Sell in: facturación de Brinova (DATA SELL IN)';
const FUENTE_SI_PZ = 'Facturación de Brinova (DATA SELL IN): piezas = unidades facturadas × piezas del código';
/* versión corta que ve el KAM; la larga queda en el detalle técnico de BI */
const CORTO = new Map([
  [FUENTE_UNID, 'Tu formulario vigente más lo que cambies en este portal'],
  [FUENTE_ALG, 'El pronóstico estimado del motor de forecast'],
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
      filas: [['En piezas (unidad estándar)', fN(r.pzk) + ' pz'], ['Pronóstico estimado, mismo periodo', fC(r.alg)], ['Diferencia contra el pronóstico estimado', flecha(r.difK) + fP(r.difK)]]
        .concat(top.map(([p, v]) => ['· ' + esc(p.nombre) + ' (' + esc(p.clase) + ')', fC(v)])),
      fuentes: [FUENTE_UNID, FUENTE_PRECIO], tec: 'productos[].codigos[].kam (unidades del formulario) × .precio', nota: r.sinPrecio ? `${r.sinPrecio} productos no tienen precio de lista: no suman colones.` : '' };
  },
  k_alg() {
    const sel = selDist(), r = resumen(sel);
    return { t: 'Pronóstico estimado · meses de captura', v: fC(r.alg), u: 'colones a precio de lista',
      que: `Lo que propone el motor para <b>${rango(MK)}</b> en ${esc(distTxt())}, a partir de la demanda real. Es tu punto de partida, no tu número.`,
      formula: 'Σ por producto y mes de (piezas del pronóstico estimado × precio de lista por pieza)',
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
      que: r.doh == null ? 'Venta directa o cadenas: no hay inventario de distribuidor.' : `Días que alcanza el inventario al ritmo de venta del distribuidor (${st.length} productos con inventario). ${esc(k83VentanaSel(st))}`,
      formula: 'piezas en inventario del último corte ÷ (piezas vendidas en los meses completos ÷ (meses × 30,4 días))',
      filas: r.doh == null ? [] : (() => { const x = r.dip || { invPz: r.invPz, ventaPz: r.ventaPz, ventaDiariaPz: r.vdPz };      // 0.4.0: en piezas (diasInventarioPz), no a precio de lista
        const prog = r.progPz > 0 ? [['Pedidos programados (' + r.progOrd.size + ' ' + (r.progOrd.size === 1 ? 'orden' : 'órdenes') + '; no suman días)', fN(r.progPz) + ' pz · ' + fN(r.progCajas) + ' cajas']] : [];
        const comp = r.invTrPz > 0 ? [['En el distribuidor (último corte)', fN(r.invDistPz) + ' pz'], ['En tránsito (órdenes que cuentan)', fN(r.invTrPz) + ' pz'], ['Inventario total', fN(r.invPz) + ' pz']] : [['Inventario', fN(x.invPz) + ' pz']];
        return comp.concat([['Venta de los meses completos de esos productos', fN(x.ventaPz) + ' pz'], ['Meses usados', cl.map(c => esc(c) + ': ' + mesesDoh(c).map(ml).join(', ') + (invViejo(c) ? ' (terminan en el mes del corte)' : '')).join('<br>') + (st.some(p => baseDoh(p).n === 6) ? '<br>6 meses en los productos con un mes sin venta' : '')], ['Venta diaria', fN1(x.ventaDiariaPz) + ' pz'], ['Días de inventario', fN(r.doh), 1], ['Valor del inventario a precio de lista', fC(r.inv)]]).concat(prog); })(),
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
      que: `Demanda real de ${rango(tri)} en ${esc(p.clase)} (${esc(fuenteProd(p))}).`,
      formula: 'Σ venta real de los 3 meses cerrados más recientes',
      filas: tri.map(m => [ml(m), fN1((p.real[m] || 0) / f)]).concat([['Total', fN1(p.d3 / f), 1], ['Mismos meses del año anterior', fN1(p.d3ly / f)], ['Variación', flecha(t) + fP(t)]]),
      fuentes: [fuenteLargaProd(p)], tec: `productos[].real (piezas) ÷ ${fN(f)} pz por ${S.unidad === 'pz' ? 'pieza' : String(presDe(p.princ) || 'unidad').toLowerCase()}` };
  },
  p_inv(ds) {
    const p = PID[ds.p], f = fac(p), i = p.inv;
    if (!i) return { t: 'Inventario · ' + p.nombre, v: p.sinInventario ? 'Sin inventario' : 'No aplica', u: '', que: tipoDe(p.clase) === 'sell in directo' ? 'Venta directa de Brinova: no hay inventario de distribuidor.' : tipoDe(p.clase) === 'sell out' ? 'La cadena no envía inventario a BI.' : k83SinInvTxt(p) || 'El distribuidor no ha enviado inventario de este producto.' };
    const vd = dias(p) == null ? 0 : ventaDoh(p) / diasDoh(p), e = estInv(dias(p), p.clase), up = umbral(p.clase);
    const ip = invPartes(p);
    return { t: 'Inventario y días · ' + p.nombre, v: k83Cant(ip.tot / f) + ' ' + uNom(p), u: ip.tr ? 'distribuidor al ' + fechaCorta(i.fecha) + ' + en tránsito' : 'al ' + fechaCorta(i.fecha),
      que: ip.tr ? `Inventario de ${esc(p.clase)} en su último corte más lo que viene en camino (órdenes en tránsito que cuentan), y cuántos días le alcanza.` : `Inventario de ${esc(p.clase)} en su último corte y cuántos días le alcanza.`,
      formula: 'días = inventario ÷ (venta de los meses completos ÷ (meses × 30,4 días))',
      filas: (ip.tr ? [['En el distribuidor (corte ' + fechaCorta(i.fecha) + ')', fN(ip.dist) + ' pz'], ['En tránsito (' + ip.ordenes.length + ' ' + (ip.ordenes.length === 1 ? 'orden' : 'órdenes') + ')', fN(ip.tr) + ' pz'], ['Inventario total', fN(ip.tot) + ' pz', 1]] : [['Inventario (piezas)', fN(ip.tot) + ' pz']]).concat([['Venta de ' + baseDoh(p).meses.map(ml).join(', ') + ' (piezas)', fN(ventaDoh(p)) + ' pz'], ['Ventana', esc(k83Ventana(p))], ['Venta diaria', nf1.format(vd) + ' pz por día'], ['Días de inventario', dias(p) == null ? k83SinDias(p) : fN(dias(p)), 1]]).concat(k83Reporte(i) ? [['Días según el reporte de ' + esc(i.dohFuenteDe.distribuidor), fN(i.dohFuente) + (i.dohFuenteDe.columna ? ' (' + esc(i.dohFuenteDe.columna) + ')' : '')]] : []).concat(progDe(p) ? [['Pedidos programados (no suman días)', fN(progDe(p).pz) + ' pz · ' + fN(progDe(p).cajas) + ' cajas']] : []),
      bi: tablaOrdenes(p) + (reglaTransito() ? `<p>Regla del tránsito: ${esc(reglaTransito())}</p>` : '') + (progDe(p) && reglaProgramados() ? `<p>Regla de pedidos programados: ${esc(reglaProgramados())}</p>` : ''),
      fuentes: [`Reporte de inventario de ${esc(p.clase)} (${(D.distribuidores[p.clase] || {}).invCortes || 0} cortes; último ${fechaCorta(i.fecha)}), convertido a piezas con la regla de unidades del cluster`],
      tec: 'productos[].inv.pz / pzDistribuidor / pzTransito / pzTotal, .inv.hist, productos[].transito', nota: `${ip.tr && reglaTransito() ? 'Tránsito que cuenta: ' + esc(reglaTransito()) + ' ' : ''}Estado: ${e ? e[1] : 'sin dato'}. Umbrales${UMB ? ' de ' + esc(p.clase) + BI(' (' + esc(UMB.fuente || 'MAESTROS.xlsx › T_DOH_OBJETIVO') + ')') : ''}: menos de ${fN(up.riesgo)} días riesgo de quiebre, más de ${fN(up.sobrestock)} sobrestock, más de ${fN(up.exceso)} exceso.` };
  },
  p_alg(ds) {
    const p = PID[ds.p], f = fac(p);
    return { t: 'Pronóstico estimado · ' + p.nombre, v: fN1(algPz6(p) / f), u: uNom(p) + ' en ' + rango(MK),
      que: 'Suma de lo que propone el pronóstico estimado para los meses de captura (todas las presentaciones del producto).',
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
        .concat([['Total', fN(kamPz6(p)) + ' pz = ' + fN1(kamPz6(p) / f) + ' ' + uNom(p), 1], ['Contra el pronóstico estimado', flecha(d) + fP(d)], ['Valor a precio de lista', fC(kamValM(p, MK))]]),
      fuentes: [FUENTE_UNID, FUENTE_PRECIO], tec: 'productos[].codigos[].kam + captura; piezas por código = codigos[].pzPorU (T_SKU · UNIDAD DE EMPAQUE)' };
  },
  p_cierre(ds) {
    const p = PID[ds.p], f = fac(p), r = p.s12 ? p.d12 / p.s12 : null;
    return { t: 'Cierre de 12 meses · ' + p.nombre, v: p.cierre === 'OK' ? 'Cuadra' : p.cierre.toLowerCase(), u: '',
      que: tipoDe(p.clase) === 'sell in directo' ? 'Aquí la demanda es lo que Brinova facturó: la razón contra el sell in siempre da 1.' : 'En 12 meses, lo que el cliente vendió debería parecerse a lo que Brinova le facturó. Si no, puede haber un problema de unidades o de código.',
      formula: 'razón = demanda 12 meses ÷ sell in 12 meses · fuera de 0,6–1,6 (con 600 pz o más) = revisar',
      filas: [['Demanda 12 meses', fN(p.d12) + ' pz = ' + fN1(p.d12 / f) + ' ' + uNom(p)], ['Sell in 12 meses (facturado)', fN(p.s12) + ' pz = ' + fN1(p.s12 / f) + ' ' + uNom(p)], ['Razón', r == null ? '—' : nf2.format(r), 1]],
      fuentes: [fuenteLargaProd(p), FUENTE_SI_PZ], tec: 'productos[].d12, .s12, .cierre' };
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
    filas.push(['Pronóstico estimado del producto, en esta unidad', pc && c.pzPorU ? fN1((p.alg[m] || 0) / u) + ' ' + un : 'se muestra en el código principal ' + esc(p.principal)]);
    if (c.calc && c.calc.fc && c.calc.fc[m] != null && !pc) filas.push(['Pronóstico estimado de este código', fN1(c.calc.fc[m] / u) + ' ' + un]);
    filas.push(['Venta real ' + ml(aa) + ' (todo el producto)', fN1((p.real[aa] || 0) / u) + ' ' + un]);
    const s = siU(p, c, aa); filas.push(['Sell in ' + ml(aa), s == null ? '—' : fN1(s) + ' ' + un]);
    if (c.kamPasado && c.kamPasado[aa] != null) filas.push(['Forecast registrado para ' + ml(aa), fN(c.kamPasado[aa]) + ' ' + un]);
    const pr = precioU(p, c), q = e === 'abierto' ? kamU(c, m) : (vig(c, m) || 0);
    filas.push(['Precio de lista', fC2(pr)], ['Valor', fC(q * (pr || 0))]);
    return { t: c.cod + ' · ' + mll(m), v: fN(q) + ' ' + plural(presDe(c)), u: cNom(c) + ' = ' + fN(q * u) + ' pz',
      que: esc(c.desc) + ' · ' + esc(p.clase), filas, fuentes: [FUENTE_UNID, FUENTE_ALG, fuenteLargaProd(p)],
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
  const H = o.h || (marcas ? 300 : 260), L = o.izq || 56, R = 10, T = marcas ? (o.compacto ? 30 : 40) : 22,      /* 094: o.compacto = gráfico bajo de Capturar (menos margen arriba y 2 marcas en el eje) */ B = o.dias ? 26 : 44, ms = o.meses, n = ms.length, bw = (W - L - R) / n, id = 'g' + (++gid);
  let mx = 0; o.series.forEach(s => ms.forEach(m => { const v = valS(s, m); if (v != null && v > mx) mx = v; }));
  const st = pasoEje(mx * 1.05, o.compacto ? 2 : 4), top = Math.max(st, Math.ceil((mx * 1.05) / st) * st);
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
/* 0.7.1 · la serie "Venta real" dice de qué fuente sale: sell through, sell out o sell in directo. Con varias fuentes,
   el % de cada una en las piezas de venta real de los últimos 12 meses de lo seleccionado (los clientes mixtos se reparten según su origen). */
function realNombre(sel) {
  const ms = MH.slice(-12), w = {};
  sel.forEach(pp => {
    const pz = ms.reduce((a, m) => a + (pp.real[m] || 0), 0); if (!(pz > 0)) return;
    const mz = origenProd(pp);      // fuente del producto (origenPz); si no viene, la del distribuidor
    Object.entries(mz).forEach(([t, v]) => { if (ok(v)) w[t] = (w[t] || 0) + pz * v; });
  });
  const tot = Object.values(w).reduce((a, b) => a + b, 0), ts = Object.entries(w).filter(([, v]) => v / tot >= 0.005).sort((a, b) => b[1] - a[1]);
  const nom = t => (TIPO[t] || { c: t }).c;
  if (!ts.length) { const t = sel.length ? tipoDe(sel[0].clase) : null; return 'Venta real' + (t ? ' · ' + nom(t) : ''); }
  if (ts.length === 1) return 'Venta real · ' + nom(ts[0][0]);
  return 'Venta real · ' + ts.map(([t, v]) => nom(t) + ' ' + nf.format(Math.round(v / tot * 100)) + ' %').join(' + ');
}
/* series estándar: selección en colones, o un producto en su unidad */
function seriesDe(sel, p) {
  const f = p ? fac(p) : 1, conv = (q, pp) => p ? (q || 0) / f : pv(pp, q);
  const agg = (fn, ms) => { const o = {}; ms.forEach(m => { o[m] = sel.reduce((a, pp) => a + fn(pp, m), 0); }); return o; };
  const conSI = sel.some(pp => tipoDe(pp.clase) !== 'sell in directo');
  const pas = MH.filter(m => m >= '2025-01'), kamMs = MV.filter(m => MF.includes(m) || m === MC);
  const s = [];
  if (conSI) s.push({ nombre: 'Sell in (facturado por Brinova)', tipo: 'col', color: COL.si, data: agg((pp, m) => conv(pp.sellIn[m], pp), MH) });
  s.push({ nombre: realNombre(sel), tipo: 'line', color: COL.real, data: agg((pp, m) => conv(pp.real[m], pp), MH) });
  const kp = agg((pp, m) => conv(pp.kamPasadoPz && pp.kamPasadoPz[m], pp), pas); Object.keys(kp).forEach(k => { if (!kp[k]) delete kp[k]; });
  s.push({ nombre: 'Forecast registrado (ciclos anteriores)', tipo: 'ring', color: COL.kam, data: kp });
  s.push({ nombre: 'Pronóstico estimado (FCST)', tipo: 'dash', color: COL.alg, data: agg((pp, m) => conv(pp.alg[m], pp), MF) });
  s.push({ nombre: 'Forecast KAM vigente (con ajustes)', tipo: 'lm', color: COL.kam, data: agg((pp, m) => p ? kamPz(pp, m) / f : kamVal(pp, m), kamMs) });
  s.forEach(x => { if (!x.key) x.key = SER_KEY[x.tipo] || x.nombre; });      // 070-GRAFICO: clave estable para prender/apagar la serie
  return s;
}
const SER_KEY = { col: 'si', line: 'real', ring: 'kp', dash: 'alg', lm: 'kam' };
/* 070-GRAFICO · unidad para sumar productos (varios distribuidores): la presentación común si todos traen la misma; si cambian (caja de 24 y de 48), piezas. Nunca cajas de tamaños distintos. */
function unidadGraf(ps) {      // 090-CAJAS: en la caja de Brinova (cajaDe) si la hay; si no, la unidad del formulario
  const us = [...new Set(ps.map(p => cajaDe(p) ? cajaDe(p).pz : (p.uPz || 1)))], mixto = us.length > 1;
  if (S.unidad !== 'pz' && !mixto && us[0] > 1) return { f: us[0], nom: uNomLista(ps[0]), mixto: false };
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
/* 094 (26-nov): la línea de BI decía "datos del 2026-11-24 12:30" con los datos regenerados el 26-nov 19:2x. Esa fecha es datos.json › generado
   (cuándo corrió el generador), no la de la captura: la web lee datos.json de OneDrive, y la copia de OneDrive todavía era la del 24-nov
   (la misma de backups/actualizacion_20261124_1225), o sea que OneDrive no había subido la corrida nueva. Ahora dice "datos generados el …",
   cuándo llegó ese datos.json a OneDrive (portal.js › window.portalDatosEn) y, aparte, cuándo se guardó la captura por última vez. */
const k94Fecha = f => { if (!f) return '—'; const t = String(f); if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(t)) return fechaCorta(t) + ' ' + t.slice(11, 16); const d = new Date(t); return isNaN(d) ? t : d.toLocaleDateString('es-CR', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + d.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit', hour12: false }); };
function pintarCiclo() {
  const capEn = Object.values(remote || {}).map(r => r && r.en).filter(Boolean).sort().pop(), sub = window.portalDatosEn;
  $('#t-ciclo').innerHTML = `Captura <b>${esc(rango(MK))}</b>${CAP_HASTA ? ` · cierra <b>${esc(fechaCorta(CAP_HASTA).slice(0, 5))}</b>` : ''}${VENCIDO ? ' · <b>captura cerrada</b>' : ''}`
    + BI(` · ${nb('version', 'datos generados el ' + esc(k94Fecha(D.generado)))}${sub ? ' (en OneDrive desde el ' + esc(k94Fecha(sub)) + ')' : ''} · ${capEn ? 'captura guardada el ' + esc(k94Fecha(capEn)) : 'sin captura guardada'}${CAL && CAL.forzado ? ' · ciclo fijado por BI' : ''}${D.ordenesVivo ? ' · órdenes de exportación en vivo (ordenes.json' + (D.ordenesVivo.actualizado ? ', ' + esc(fechaCorta(D.ordenesVivo.actualizado)) + (D.ordenesVivo.por ? ' · ' + esc(D.ordenesVivo.por) : '') : '') + (D.ordenesVivo.sinProducto.length ? ' · ' + D.ordenesVivo.sinProducto.length + ' líneas sin producto en el portal' : '') + ')' : ''}`);
}
function pintarEncabezado() {
  $('#t-kam').textContent = D.kam;
  pintarCiclo();      /* 0.6.0: arriba solo una línea corta; la fecha de los datos queda para BI */
  const n = c => P.filter(p => c === 'TODOS' || p.clase === c).length;
  $('#f-dist').innerHTML = ['TODOS'].concat(D.clases).map(c =>
    `<button type="button" data-d="${esc(c)}" aria-pressed="${S.dist === c}">${c === 'TODOS' ? 'Todos' : esc(c)}<span class="c">${n(c)}</span></button>`).join('');
  const cats = [...new Set(P.map(p => p.cat).filter(Boolean))].sort();
  $('#f-cat').innerHTML = '<option value="">Todas las categorías</option>' + cats.map(c => `<option${c === S.cat ? ' selected' : ''}>${esc(c)}</option>`).join('');
  const ch = [['todos', 'Todos'], ['alerta', 'Con alerta'], ['invbajo', 'Riesgo de quiebre'], ['invalto', 'Sobrestock o exceso'], ['dif', 'Lejos del pronóstico estimado'], ['cae', 'Venta cayendo'], ['aviso', 'Con aviso de captura']];
  $('#chips').innerHTML = ch.map(([k, t]) => `<button type="button" class="chip" data-chip="${k}" aria-pressed="${S.chip === k}">${t}</button>`).join('');
  const ch2 = [['todos', 'Todos', ''], ['editados', 'Que cambié', ''], ['dif', 'Lejos del est.', 'Lejos del pronóstico estimado (más de 50 %)'], ['aviso', 'Con aviso', '']];      // 094: textos cortos para que los filtros quepan en una fila
  $('#chips2').innerHTML = ch2.map(([k, t, ti]) => `<button type="button" class="chip" data-chip2="${k}" aria-pressed="${S.chip2 === k}"${ti ? ` title="${ti}"` : ''}>${t}</button>`).join('');
  $('#f-capv').innerHTML = k82Boton('ant', '', true, true) + k82Boton('sig', '', true, true);      // 082-MESES: meses anteriores / siguientes (bloqueados) en todas las filas
  document.querySelectorAll('#f-unidad button').forEach(b => b.setAttribute('aria-pressed', b.dataset.u === S.unidad));
  const fm = $('#f-mon'); if (fm) { fm.hidden = !MON.tc; fm.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', (b.dataset.mon === 'USD') === MON.usd)); }      // 092-USD: solo si datos.usd
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
  if (k === 'aviso') return avisosFuertes(p).length > 0 || unidPend(p).length > 0;      // las notas grises (solo más de 3 × el algoritmo) no cuentan como aviso · 090-UNIDADES: sí los avisos de unidades sin confirmar
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
  const cls = v => v == null ? 'muted' : cls3(v);      // 092-FLECHAS: 0 % en gris
  const k1 = tarjeta('Tu forecast · ' + esc(rango(MK)), nb('k_kam', fC(r.kam)), r.difK == null ? '' : `${flecha(r.difK)}${fP(r.difK)} contra el pronóstico estimado`, cls3(r.difK),      // 095: color de 0.9.2
    [['Pronóstico estimado', nb('k_alg', fC(r.alg))], ['En piezas', fN(r.pzk) + ' pz']]);
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
  pintarUnidBI();      // 090-UNIDADES: lista de avisos de unidades para BI
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
    eje: u ? fCx : fEje, tip: u ? (v => fN1(v) + ' ' + u.nom) : fC,
    titulo: u ? 'Tendencia de ' + nombreProd(S.prod) + ' (' + alcanceTxt(sel) + ') en ' + u.nom : 'Tendencia del mix en ' + monTxt(), izq: u ? 52 : 0 };
  grafico($('#ch-total'), o);
  $('#lg-total').innerHTML = leyendaSeries(todas) + leyenda([], true) + (o.incompletos.length ? '<span><i class="sw" style="border:0;width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-bottom:8px solid #D99A22"></i>mes incompleto</span>' : '');
  $('#tt-t').textContent = S.prod ? nombreProd(S.prod) : 'Tendencia del mix';
  $('#nota-total').textContent = u ? alcanceTxt(sel) + ' · ' + u.nom + (u.mixto ? ' (presentaciones distintas: se suma en piezas)' : '') : (MON.usd ? 'Dólares' : 'Colones') + ' a precio de lista';
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
/* 091-BUSCA (26-nov, pedido del usuario: "ese buscador que me dé el nombre interno de Brinova, que me permita buscar"): el selector muestra la
   descripción del sell in (T_SKU, la caja de cajaDe) + el código, y un campo "Buscar producto" filtra por esa descripción, el nombre del portal,
   los códigos y sus descripciones Brinova (todas las palabras, sin tildes). Enter elige la primera coincidencia. */
const gfNomB = x => x.b ? x.b + ' · ' + x.c : x.n;
function gfOps() {
  const m = new Map();
  P.filter(enDist).forEach(p => {
    const b = String(descSI(p) || '').trim(), c = codSI(p) || '';
    const x = m.get(p.grupo) || { g: p.grupo, n: p.nombre, b, c, k: 0, t: '' };
    x.k++; x.t += ' ' + p.nombre + ' ' + b + ' ' + p.codigos.map(z => z.cod + ' ' + (z.descBrinova || z.desc || '')).join(' ');
    m.set(p.grupo, x);
  });
  return [...m.values()].sort((a, b) => gfNomB(a).localeCompare(gfNomB(b), 'es'));
}
function gfVisibles(ops) {
  const qs = sinTilde(S.gfQ || '').toLowerCase().split(/\s+/).filter(Boolean);
  return qs.length ? ops.filter(x => x.g === S.prod || qs.every(q => sinTilde(x.t).toLowerCase().includes(q))) : ops;
}
function gfOpciones(ops) {
  const vis = gfVisibles(ops), q = (S.gfQ || '').trim();
  return `<option value="">Todo el mix${S.dist === 'TODOS' ? '' : ' de ' + esc(S.dist)}${q ? ' · ' + vis.length + (vis.length === 1 ? ' coincidencia' : ' coincidencias') : ''}</option>`
    + vis.map(x => `<option value="${esc(x.g)}"${x.g === S.prod ? ' selected' : ''} title="${esc(x.n)}">${esc(gfNomB(x))}${S.dist === 'TODOS' && x.k > 1 ? ' · ' + x.k + ' distribuidores' : ''}</option>`).join('');
}
function pintarFiltroProd() {
  const el = $('#gf-bar'); if (!el) return;
  const foco = document.activeElement && document.activeElement.closest && document.activeElement.closest('#gf-bar') ? document.activeElement.id : null;
  const ops = S._gfOps = gfOps();
  const enProd = S.prod ? new Set(P.filter(p => p.grupo === S.prod).map(p => p.clase)) : null, cls = S.prod && S.dist === 'TODOS' ? D.clases.filter(c => enProd.has(c)) : [];
  el.innerHTML = `<label class="gf-f gf-q"><span>Buscar producto</span><input id="gf-q" type="search" placeholder="Nombre Brinova o código" value="${esc(S.gfQ || '')}" autocomplete="off" spellcheck="false" enterkeyhint="search"></label>`
    + `<label class="gf-f"><span>Producto (nombre Brinova)</span><select id="gf-prod">${gfOpciones(ops)}</select></label>`
    + (cls.length > 1 ? `<label class="gf-f"><span>Distribuidor</span><select id="gf-dist"><option value="TODOS">Todos sumados (${cls.length})</option>${cls.map(c => `<option value="${esc(c)}"${c === prodAlcance() ? ' selected' : ''}>${esc(c)}</option>`).join('')}</select></label>` : '')
    + (S.prod ? `<button type="button" class="chip" data-gfclr>Quitar filtro</button>` : '');
  if (foco) { const f = document.getElementById(foco); if (f) f.focus(); }
}
function pintarKpiFiltro() {
  const el = $('#kpi-filtro'); if (!el) return;
  if (!S.prod) { el.hidden = true; el.innerHTML = ''; return; }
  const sel = selGraf(), u = unidadGraf(sel);
  el.hidden = false;
  const xB = (S._gfOps || gfOps()).find(o => o.g === S.prod);      // 091-BUSCA: nombre Brinova (sell in) + código
  el.innerHTML = `<span>Tarjetas y gráfico filtrados: <b>${esc(xB ? gfNomB(xB) : nombreProd(S.prod))}</b> · ${esc(alcanceTxt(sel))}${u.mixto ? ' · presentaciones distintas, sumadas en piezas y colones' : ''}</span><button type="button" class="chip" data-gfclr>Ver todo el mix</button>`;
}
function marcarSelLista() {      // resalta en la lista agrupada el producto (y el distribuidor) que muestra el gráfico
  const a = prodAlcance();
  $$('#lista details.gp').forEach(d => { const on = d.dataset.grupo === S.prod; d.classList.toggle('sel', on);
    d.querySelectorAll('.gp-d').forEach(r => { const s = on && a !== 'TODOS' && r.dataset.gpcl === a; r.classList.toggle('sel', s); const b = r.querySelector('.gp-sel'); if (b) b.setAttribute('aria-pressed', s); }); });
}
/* gráfico compacto de la pestaña Capturar: el producto que se está capturando; los puntos de "Forecast KAM vigente" se mueven con cada número (evento fcst:captura)
   090-CAPFILTRO (26-nov, pedido del usuario: "en la sección de capturar poder tocar el producto y que eso me filtre el gráfico superior"):
   sin producto elegido (S.capProd = null) muestra todo lo que lista la captura (distribuidor, búsqueda y estados) en colones; tocar un producto
   (094: su nombre o cualquier parte libre de su fila; ya no hay botón "Ver en el gráfico") lo filtra; "Quitar filtro" o tocar otra vez el producto
   vuelve a todo. Escribir en una casilla sigue llevando el gráfico a ese producto, como en la 0.7.0. 094: más bajo (150 px) y plegable; la
   preferencia queda en localStorage (portal-graf › cgOculto); sin preferencia, plegado en el celular. */
function pintarCapGraf() {
  const box = $('#cap-graf'); if (!box) return;
  if (S.vista !== 'capturar' || !prodGrid.length) { box.hidden = true; const b0 = $('#b-cg2'); if (b0) b0.hidden = true; return; }
  if (S.capProd && (!PID[S.capProd] || !enDist(PID[S.capProd]))) S.capProd = null;
  const p = S.capProd ? PID[S.capProd] : null, sel = p ? [p] : listaCaptura(); box.hidden = false;
  $('#cg-t').textContent = p ? nomVis(p) + ' · ' + p.clase : 'Todo lo que estás capturando';
  $('#cg-nota').textContent = p ? uNom(p) + ' · el punto naranja se mueve mientras escribes' : sel.length + (sel.length === 1 ? ' producto' : ' productos') + ' · ' + monTxt() + ' a precio de lista · toca un producto para verlo solo';
  const b = $('#b-cg'); b.setAttribute('aria-expanded', String(!S.cgOculto)); b.textContent = S.cgOculto ? 'Mostrar gráfico' : 'Ocultar gráfico';
  const b2 = $('#b-cg2'); if (b2) b2.hidden = !S.cgOculto;      // 095: en el celular, el gráfico plegado se abre desde la fila de filtros
  const bq = $('#b-cgclr'); if (bq) bq.hidden = !p;
  box.classList.toggle('plegado', !!S.cgOculto);
  marcarCapSel(); k94CgCab(p);
  if (S.cgOculto) return;
  const todas = p ? seriesDe([p], p) : seriesDe(sel), desde = addM(MC, -12), cls = [...new Set(sel.map(x => x.clase))];
  const o = { meses: MH.concat(MF.filter(m => !MH.includes(m))).filter(m => m >= desde), series: todas.filter(s => !S.ocultas.includes(s.key)), estados: true,
    incompletos: p ? INCOMP[p.clase] || [] : cls.length === 1 ? incompletosDe(cls) : [], exclKam: exclKamDe(cls),
    eje: p ? fCx : fEje, tip: p ? (v => fN1(v) + ' ' + uNom(p)) : fC,
    titulo: p ? 'Mes a mes de ' + nomVis(p) + ' en ' + p.clase + ', en ' + uNom(p) : 'Mes a mes de todo lo que estás capturando, en ' + monTxt(), izq: p ? 48 : 0, h: 210 };      // 095: alto y leyenda de la 0.9.3 (pedido del usuario: "el gráfico se queda igual"); solo hace scroll con la página y se pliega
  grafico($('#ch-cap'), o);
  $('#lg-cap').innerHTML = leyendaSeries(todas);
}
/* 090-CAPFILTRO · 094: resalta en la grilla el producto del gráfico (su bloque .pr) y marca su botón (aria-pressed) */
function marcarCapSel() {
  GEL.forEach((e, id) => { const on = id === S.capProd; if (e.classList.contains('sel') !== on) { e.classList.toggle('sel', on); const b = e.querySelector('[data-capsel]'); if (b) b.setAttribute('aria-pressed', String(on)); } });
}
function selCap(id, avisar) {
  S.capProd = id && PID[id] ? id : null; pintarCapGraf();
  if (!avisar) return;
  const p = S.capProd ? PID[S.capProd] : null;
  toast(p ? 'Gráfico: ' + nomVis(p) + ' · ' + p.clase : 'Gráfico: todo lo que estás capturando');
  const box = $('#cap-graf');      // en celular el gráfico no queda fijo arriba: si está abierto y no se ve, se lleva a la vista
  if (box && !box.hidden && !S.cgOculto && matchMedia('(max-width:760px)').matches) { const r = box.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight - 80) box.scrollIntoView({ block: 'start' }); }
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
  /* 090-CAPFILTRO · 094: tocar un producto de la grilla (su nombre o cualquier parte libre de la fila) filtra el gráfico; otra vez, lo quita.
     El detalle se abre solo con el botón "Detalle" (data-p, app_3). */
  const cs = t.closest('[data-capsel]'); if (cs) { selCap(S.capProd === cs.dataset.capsel ? null : cs.dataset.capsel, true); return; }
  if (t.closest('#b-cgclr')) { selCap(null, true); return; }
  const fcap = t.closest('#grid .pr');
  if (fcap && !t.closest('button,input,textarea,select,a,label,.unid-row')) { const id = fcap.dataset.g; selCap(S.capProd === id ? null : id, true); return; }
  if (t.closest('#b-cg')) { S.cgOculto = !S.cgOculto; guardarGraf(); pintarCapGraf(); return; }
  if (t.closest('#b-cg2')) { S.cgOculto = false; guardarGraf(); pintarCapGraf(); const bb = $('#b-cg'); if (bb) bb.focus(); return; }      // 095
  if (t.closest('[data-agrupar]')) { S.agrupar = !S.agrupar; guardarGraf(); pintarLista(); return; }
  const d = t.closest('[data-d]'); if (d) { S.prodDist = 'TODOS'; return; }      // cambio de distribuidor arriba: el alcance del producto vuelve a "todos"
  const sm = t.closest('summary.gp-h');
  if (sm) { const det = sm.parentElement, g = det.dataset.grupo, abre = !det.open; S.gpAbierto[g] = abre; if (abre) seleccionarProd(g, 'TODOS', true); return; }
  const fila = t.closest('.gp-d');
  if (fila && !t.closest('[data-p]')) { const g = fila.closest('details.gp').dataset.grupo; seleccionarProd(g, fila.dataset.gpcl, true); }
});
document.addEventListener('input', ev => {      // 091-BUSCA: filtra las opciones sin repintar el campo (no pierde el foco)
  if (ev.target.id !== 'gf-q') return;
  S.gfQ = ev.target.value;
  const sel = $('#gf-prod'); if (sel) sel.innerHTML = gfOpciones(S._gfOps || gfOps());
});
document.addEventListener('keydown', ev => {
  if (ev.target.id !== 'gf-q' || ev.key !== 'Enter') return;
  ev.preventDefault();
  const x = gfVisibles(S._gfOps || gfOps())[0];
  if (x) seleccionarProd(x.g, 'TODOS', true);
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
      <td data-l="Productos">${s2.length}</td><td data-l="Avance del forecast" class="l">${k72CeldaDist(cl)}</td>${conLocal ? `<td data-l="Venta 3 meses (moneda local)">${vlc ? `<span title="${esc(vlc.queEs || '')}">${esc(fMon(vlc.total3, vlc.moneda))}</span>` + (var3Local(vlc) ? `<small class="${/^sin/.test(var3Local(vlc)) ? 'muted' : cls3(vlc.var3)}" style="display:block">${var3Local(vlc)}</small>` : '') + (vlc.sellIn && ok(vlc.sellIn.razonPrecio12) ? BI(`<small class="muted" style="display:block">precio local ÷ facturado: ${nf2.format(vlc.sellIn.razonPrecio12)}×</small>`) : '') : '—'}</td>` : ''}<td data-l="Días de inventario">${r2.doh == null ? '—' : diasTxt(r2.doh) + '' + (r2.invTrPz > 0 ? `<small class="muted" style="display:block">${fN(r2.invDistPz)} pz en el distribuidor + ${fN(r2.invTrPz)} pz en tránsito</small>` : '') + (r2.progPz > 0 ? `<small class="muted" style="display:block" title="Pedidos programados: todavía no salieron; no suman días">+${fN(r2.progCajas)} cajas prog.</small>` : '') + (e ? `<small class="${e[0] ? '' : invViejo(cl) ? 'warn' : 'muted'}" style="display:block">${esc(e[1].toLowerCase())}</small>` : '')}${d.invFecha && !invViejo(cl) ? `<small class="muted" style="display:block">corte ${fechaCorta(d.invFecha)}</small>` : ''}</td><td data-l="Tu forecast vs pronóstico estimado" class="${r2.difK != null && Math.abs(r2.difK) > 0.3 ? 'warn' : ''}">${flecha(r2.difK)}${fP(r2.difK)}</td>
      ${AP ? (() => { const a = accPmClase(cl); return `<td data-l="Precisión del forecast · ${esc(rango(accMeses()))}">${a && a.acc != null ? pct1(a.acc) : '—'}${a && ok(a.sesgo) ? `<small class="${Math.abs(a.sesgo) > 0.15 ? 'warn' : 'muted'}" style="display:block">sesgo ${fP(a.sesgo)} contra compras</small>` : ''}</td></tr>`; })() : `<td data-l="Sesgo del forecast anterior" class="${sg != null && Math.abs(sg) > 0.15 ? 'warn' : ''}">${sg == null ? '—' : flecha(sg) + fP(sg)}${pk ? `<small class="muted" style="display:block">${aciertoEst(pkMed(pk), pk.sellInPz) === 'ok' ? 'acierto trim. ' : ''}${aciertoTxt(pkMed(pk), pk.sellInPz, true)}</small>` : ''}${pk ? BI(`<small class="muted" style="display:block">vs venta ${fP(pk.sesgoReal)} · precisión ${ok(pk.accReal) ? nf.format(pk.accReal * 100) + ' %' : '—'}</small>`) : ''}</td></tr>`}`;
  }).join('');
  /* 0.4.0: encabezados en dos líneas y celdas que se parten, para que la tabla quepa a 1366-1400 px sin cortar la última columna */
  r92Dist();      // 092: inventario, tránsito y pedidos por distribuidor
  $('#tab-dist').innerHTML = `<div class="tw" role="region" tabindex="0" aria-label="Tus distribuidores"><table class="tbl tdist"><colgroup><col style="width:15%"><col><col style="width:8%"><col style="width:13%">${conLocal ? '<col style="width:12%">' : ''}<col style="width:13%"><col style="width:11%"><col style="width:12%"></colgroup><thead><tr><th class="l">Distribuidor</th><th class="l" title="Sell through: venta del distribuidor a sus clientes · Sell out: venta de las tiendas al consumidor · Sell in directo: lo que Brinova factura">Fuente de la demanda</th><th>Productos</th><th class="l" title="Productos cerrados (ya revisados), en progreso (editados sin cerrar) y pendientes (sin tocar)">Avance del forecast</th>${conLocal ? '<th title="Venta real de los últimos 3 meses en la moneda del distribuidor">Venta 3 meses (moneda local)</th>' : ''}<th>Días de inventario</th><th>Tu forecast vs pronóstico estimado</th>${AP ? `<th title="Asertividad del reporte Forecast y PRM (ACC PM), de ${esc(rango(accMeses()))}; se cambia en la tarjeta Precisión del forecast">Precisión del forecast<br><span class="small muted">${esc(rango(accMeses()))}</span></th>` : '<th title="Sesgo: positivo = forecast por encima de las compras del distribuidor">Sesgo del forecast anterior</th>'}</tr></thead><tbody>${filas}</tbody></table></div>${BI('<p class="small muted" style="margin-top:8px">El pronóstico estimado (algoritmo) usa la fuente de cada distribuidor; el sell in (facturado) sirve para comprobar que los datos cuadran.</p>')}`;
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
    <div class="lhead"><span>${agr ? 'Producto · suma de distribuidores (toca para verlo en el gráfico)' : 'Producto · descripción del sell in'}</span><span>12 meses + pronóstico estimado</span><span class="r">Venta 3M</span><span class="r">Inventario</span><span class="r">Pronóstico estimado ${esc(rango(MK))}</span><span class="r">Tu forecast</span><span class="r">${agr ? 'Precio lista por pieza' : 'Precio lista'}</span></div>`;
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
      <span class="small muted" data-l="">en ${monTxt()}</span>
      <span class="r v" data-l="Venta 3M">${fC(r.d3)}<small class="${cls3(r.t)}" title="${tit3(r.t)} contra el año anterior">${flecha(r.t)}${fP(r.t)}</small></span>
      <span class="r v" data-l="Inventario">${r.inv ? fC(r.inv) : '—'}</span>
      <span class="r v" data-l="Pronóstico estimado">${fC(r.alg)}</span>
      <span class="r v" data-l="Tu forecast">${fC(r.kam)}<small class="${cls3(r.dif)}">${flecha(r.dif)}${fP(r.dif)}</small></span>
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
  ps.forEach(p => { r.d3 += pv(p, p.d3); r.d3ly += pv(p, p.d3ly); r.alg += pv(p, algPz6(p)); r.kam += kamValM(p, MK); if (p.inv) r.inv += pv(p, Math.max(invTot(p), 0)); });
  r.t = r.d3ly > 0 ? r.d3 / r.d3ly - 1 : null; r.dif = r.alg > 0 ? r.kam / r.alg - 1 : null;
  return r;
}
function itemLista(p) {
  const f = pzLista(p), a = alertas(p), pl = precioLista(p), pr = pl.v, t = tend(p), d = dif(p), e = estInv(dias(p), p.clase);      // 090-CAJAS: en cajas de Brinova
  return `<button type="button" class="item" data-p="${esc(p.id)}">
      <span class="c-nm" style="min-width:0"><span class="nm" title="${esc(descSI(p) + ' · producto: ' + p.nombre)}">${esc(descSI(p))}</span>
        <span class="meta">${uPillLista(p)} ${S.dist === 'TODOS' ? esc(p.clase) + ' · ' : ''}${esc(codSI(p))}</span>
        ${a.length ? `<span style="display:flex;gap:4px;flex-wrap:wrap;margin-top:4px">${a.slice(0, 2).map(([c, x]) => pill(c, x)).join('')}</span>` : ''}</span>
      <span data-l="12 meses + pronóstico estimado">${spark(p)}</span>
      <span class="r v" data-l="Venta 3M">${fN1(p.d3 / f)}<small class="${cls3(t)}" title="${tit3(t)} contra el año anterior">${flecha(t)}${fP(t)}</small></span>
      <span class="r v" data-l="Inventario">${p.inv ? k83Cant(invTot(p) / f) + (conTransito(p) ? '<small class="muted">incl. tránsito</small>' : '') + `<small>${e ? pill(e[0], diasTxt(dias(p)) + '') + (invViejo(p.clase) ? `<small class="warn">${esc(viejoTxt(fechaInv(p.clase)))}</small>` : '') : k83SinDias(p)}</small>` : `<small>${tipoDe(p.clase) === 'sell in directo' ? 'venta directa' : p.sinInventario ? 'sin inventario (venta directa)' : 'sin reporte'}</small>`}</span>
      <span class="r v" data-l="Pronóstico estimado">${fN1(algPz6(p) / f)}<small>${fC(pv(p, algPz6(p)))}</small></span>
      <span class="r v" data-l="Tu forecast">${fN1(kamPz6(p) / f)}<small class="${cls3(d)}">${flecha(d)}${fP(d)}</small></span>
      <span class="r v" data-l="Precio lista">${pr != null ? fC2(pr) : pill('bad', 'sin precio')}<small>por ${esc(pl.por)}</small></span>
    </button>`;
}
/* ---------- 070-GRAFICO · lista agrupada por producto (productos[].grupo) ----------
   Suma piezas de todos los distribuidores; se muestra en la presentación común si todos traen la misma (unidadGraf) y si no en piezas.
   Colones a precio de lista de cada distribuidor. Al abrir el grupo el gráfico de arriba muestra ese producto sumado; al tocar un distribuidor, solo ese. */
function aggGrupo(ps) {
  const a = { ps, u: unidadGraf(ps), d3: 0, d3ly: 0, inv: 0, conInv: 0, vd: 0, tr: false, alg: 0, kam: 0, algC: 0, kamC: 0, real: {}, algM: {}, prMin: null, prMax: null, alerta: 0 };
  ps.forEach(p => {
    a.d3 += p.d3 || 0; a.d3ly += p.d3ly || 0; a.alg += algPz6(p); a.kam += kamPz6(p); a.algC += pv(p, algPz6(p)); a.kamC += kamValM(p, MK);
    if (p.inv) { a.inv += Math.max(invTot(p), 0); a.conInv++; const v = ventaDoh(p); if (v > 0) a.vd += v / diasDoh(p); if (conTransito(p)) a.tr = true; }
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
  const unaCaja = new Set(a.ps.map(codSI)).size === 1, nom = unaCaja ? descSI(p0) : p0.nombre;      // 090-CAJAS: descripción del sell in si todos usan la misma caja
  const precio = a.prMin == null ? pill('bad', 'sin precio') : a.prMin === a.prMax ? fC2(a.prMin) : fC(a.prMin) === fC(a.prMax) ? fC(a.prMin) : fC(a.prMin) + ' – ' + fC(a.prMax);
  return `<details class="gp${S.prod === p0.grupo ? ' sel' : ''}" data-grupo="${esc(p0.grupo)}"${S.gpAbierto[p0.grupo] ? ' open' : ''}><summary class="item gp-h" title="Ver ${esc(p0.nombre)} en el gráfico, sumado para sus distribuidores">
      <span class="c-nm" style="min-width:0"><span class="nm">${esc(nom)}</span>
        <span class="meta"><span class="upill ${f > 1 ? 'emp' : 'pz'}">${esc(a.u.nom)}</span> ${unaCaja ? esc(codSI(p0)) + ' · ' : ''}${n} ${n === 1 ? 'distribuidor' : 'distribuidores'}${a.u.mixto ? ' · presentaciones distintas: suma en piezas' : ''}${a.alerta ? ' · ' + a.alerta + ' con alerta' : ''}</span></span>
      <span data-l="12 meses + pronóstico estimado">${spark({ real: a.real, alg: a.algM })}</span>
      <span class="r v" data-l="Venta 3M">${fN1(a.d3 / f)}<small class="${cls3(a.t)}" title="${tit3(a.t)} contra el año anterior">${flecha(a.t)}${fP(a.t)}</small></span>
      <span class="r v" data-l="Inventario">${a.conInv ? k83Cant(a.inv / f) + (a.tr ? '<small class="muted">incl. tránsito</small>' : '') + `<small>${a.dias != null ? pill(e ? e[0] : '', diasTxt(a.dias)) : 'sin venta'}</small>` + (a.conInv < n ? `<small class="muted">${a.conInv} de ${n} con reporte</small>` : '') : '<small>sin reporte</small>'}</span>
      <span class="r v" data-l="Pronóstico estimado">${fN1(a.alg / f)}<small>${fC(a.algC)}</small></span>
      <span class="r v" data-l="Tu forecast">${fN1(a.kam / f)}<small class="${cls3(a.dif)}">${flecha(a.dif)}${fP(a.dif)}</small></span>
      <span class="r v" data-l="Precio lista por pieza">${precio}<small>por pieza</small></span>
    </summary>${a.ps.map(p => itemDesglose(p, a.u)).join('')}</details>`;
}
function itemDesglose(p, u) {
  const f = u.f, t = tend(p), d = dif(p), e = estInv(dias(p), p.clase), on = S.prod === p.grupo && prodAlcance() === p.clase;
  const pres = p.uPz > 1 ? plural(presDe(p.princ)) + ' de ' + fN(p.uPz) + ' pz' : 'piezas sueltas';
  return `<div class="item gp-d${on ? ' sel' : ''}" data-gpcl="${esc(p.clase)}">
      <span class="c-nm" style="min-width:0"><button type="button" class="gp-sel" data-gsel="${esc(p.grupo)}" aria-pressed="${on}" title="Ver solo ${esc(p.clase)} en el gráfico"><span class="nm">${esc(p.clase)}</span></button>
        <span class="meta" title="${esc(descSI(p))}">${esc(codSI(p))} · ${cajaDe(p) ? 'caja de ' + esc(fN(cajaDe(p).pz)) + ' pz' : 'se vende en ' + esc(pres)}</span></span>
      <span data-l="12 meses + pronóstico estimado">${spark(p)}</span>
      <span class="r v" data-l="Venta 3M">${fN1(p.d3 / f)}<small class="${cls3(t)}" title="${tit3(t)} contra el año anterior">${flecha(t)}${fP(t)}</small></span>
      <span class="r v" data-l="Inventario">${p.inv ? k83Cant(invTot(p) / f) + `<small>${e ? pill(e[0], diasTxt(dias(p))) : k83SinDias(p)}</small>` : `<small>${tipoDe(p.clase) === 'sell in directo' ? 'venta directa' : p.sinInventario ? 'sin inventario (venta directa)' : 'sin reporte'}</small>`}</span>
      <span class="r v" data-l="Pronóstico estimado">${fN1(algPz6(p) / f)}<small>${fC(pv(p, algPz6(p)))}</small></span>
      <span class="r v" data-l="Tu forecast">${fN1(kamPz6(p) / f)}<small class="${cls3(d)}">${flecha(d)}${fP(d)}</small></span>
      <span class="r v" data-l=""><button type="button" class="btn gp-det" data-p="${esc(p.id)}">Ver detalle</button></span>
    </div>`;
}

/* ---------- captura (formato formulario; 094-CAPTURA: lista completa en una grilla, ver más abajo) ---------- */
let filasGrid = [], prodGrid = [];
/* 082-MESES · además de la captura, cada código muestra (bloqueados) los meses anteriores —los 12 antes del mes en curso y el mes en curso— y los
   siguientes —después de la captura hasta el último mes pronosticado—. Por defecto cerrados; un mismo estado para la grilla y el detalle, todas
   las filas a la vez, recordado en localStorage. Solo se pintan cuando se despliegan (el DOM por defecto no crece).
   Casilla bloqueada: forecast registrado en su momento (codigos[].kamPasado = productos[].kamPasadoPz del gráfico, «Forecast registrado») en los
   meses cerrados; el formulario vigente (codigos[].kam = «Forecast KAM vigente» del gráfico) en el mes en curso y después de la captura.
   Es un <input readonly> SIN la clase .inp ni data-line: los manejadores de captura (input, Enter, sincronizarInputs, k72Bloquear) no lo tocan. */
const k82Rango = (a, b) => { const o = []; for (let m = a; m <= b; m = addM(m, 1)) o.push(m); return o; };
const K82_ANT = k82Rango(addM(MC, -12), addM(MK[0], -1));
const K82_SIG = ULT_MF > MK[MK.length - 1] ? k82Rango(addM(MK[MK.length - 1], 1), ULT_MF) : [];
const K82 = { ant: false, sig: false }, LS_K82 = 'portal-k82-meses';
try { const g = JSON.parse(localStorage.getItem(LS_K82) || 'null'); if (g) { K82.ant = !!g.ant && K82_ANT.length > 0; K82.sig = !!g.sig && K82_SIG.length > 0; } } catch (e) { }
function k82Guardar() { try { localStorage.setItem(LS_K82, JSON.stringify(K82)); } catch (e) { } }
const k82Ms = k => k === 'ant' ? K82_ANT : K82_SIG;
const k82Nom = k => (k === 'ant' ? 'Meses anteriores' : 'Meses siguientes') + ' (' + rango(k82Ms(k)) + ')';
/* botón con el texto completo: barra de la grilla (pres = aria-pressed) y detalle (aria-expanded) */
function k82Boton(k, cls, pres, corto) {      // 094: corto = "◀ Anteriores" / "Siguientes ▶" (el rango va oculto para el lector y en el title)
  if (!k82Ms(k).length) return '';
  const on = K82[k], r = corto ? `<span class="vh">(${esc(rango(k82Ms(k)))})</span>` : `<span class="k82-r">(${esc(rango(k82Ms(k)))})</span>`, nm = corto ? (k === 'ant' ? 'Anteriores' : 'Siguientes') : (k === 'ant' ? 'Meses anteriores' : 'Meses siguientes');
  return `<button type="button" class="${cls} k82-b k82-${k}" data-k82="${k}" ${pres ? 'aria-pressed' : 'aria-expanded'}="${on}" title="${on ? 'Ocultar' : 'Ver'} estos meses (solo lectura)${corto ? ': ' + esc(k82Nom(k)) : ''}">`
    + (k === 'ant' ? `<span aria-hidden="true">◀</span> ${nm} ${r}` : `${nm} ${r} <span aria-hidden="true">▶</span>`) + '</button>';
}
/* botón angosto en los costados del encabezado de la grilla */
function k82BotonTh(k) {
  if (!k82Ms(k).length) return '';
  const on = K82[k], fl = (k === 'ant') !== on ? '◀' : '▶';
  return `<button type="button" class="k82-tg" data-k82="${k}" aria-expanded="${on}" aria-label="${esc((on ? 'Ocultar ' : 'Ver ') + k82Nom(k).toLowerCase())}" title="${esc((on ? 'Ocultar ' : 'Ver ') + k82Nom(k).toLowerCase())}"><span aria-hidden="true">${fl}</span><small>${on ? 'ocultar' : k === 'ant' ? 'anteriores' : 'siguientes'}</small></button>`;
}
function mesesCaptura() { return (K82.ant ? K82_ANT : []).concat(MK, K82.sig ? K82_SIG : []); }
/* valor de la casilla bloqueada (unidad del código) */
const k82Valor = (c, m) => m < MC ? ((c.kamPasado && c.kamPasado[m] != null) ? c.kamPasado[m] : null) : vig(c, m);
function k82Celda(p, c, m, pref) {
  const e = estadoMes(m), pc = c.cod === p.principal && c.pzPorU, u = c.pzPorU || 1, v = k82Valor(c, m);
  const al = pc && p.alg && p.alg[m] != null ? p.alg[m] / u : null, aa = siU(p, c, addM(m, -12)), ra = pc && p.real[addM(m, -12)] != null ? p.real[addM(m, -12)] / u : null;
  const iid = pref + '-' + sid(c.id) + '-' + m + '-k82', hid = iid + '-h', l1 = [], l2 = [];
  if (al != null) l1.push('FCST est. ' + fN1(al));
  if (e === 'real') { if (pc) l1.push('real ' + fN1((p.real[m] || 0) / u)); const s = siU(p, c, m); if (s != null) l1.push('SI ' + fN1(s)); }
  else if (e === 'pend') l1.push('real pendiente');
  else if (e === 'curso') { l1.push(OFICIAL_CURSO ? 'oficial' : 'vigente'); const av = c.avanceU != null ? c.avanceU : (pc && p.avanceSellInPz && p.avanceSellInPz[m] != null ? p.avanceSellInPz[m] / u : null);
    if (av != null) l2.push('facturado al ' + esc(fechaCorta(D.avanceHasta).slice(0, 5)) + ': ' + fN1(av)); }
  if (ra != null) l2.push('año pas. ' + fN1(ra)); else if (aa != null) l2.push('SI año pas. ' + fN1(aa));
  const que = m < MC ? 'forecast registrado en su momento' : e === 'curso' ? 'forecast ' + (OFICIAL_CURSO ? 'oficial' : 'vigente') + ' del mes en curso' : 'formulario vigente';
  return `<span class="k82-w" title="${esc('Bloqueado: ' + que)}">${ICO.lock}<input class="k82-in" id="${iid}" readonly tabindex="-1" value="${v == null ? '' : esc(v)}" placeholder="—" aria-label="${esc(c.cod + ' ' + mll(m) + ': ' + que + ', bloqueado')}" aria-describedby="${hid}"></span>`
    + `<span class="hint" id="${hid}">${l1.join(' · ') || '&nbsp;'}${l2.length ? '<br>' + l2.join('<br>') : ''}</span>`;
}
/* meses del detalle ("Tu forecast"): anteriores + captura + siguientes en una tira con desplazamiento horizontal */
const k82Tira = () => (K82.ant && K82_ANT.length > 0) || (K82.sig && K82_SIG.length > 0);
function k82MesesDet(p, c) {
  const bl = m => { const e = estadoMes(m); return `<label class="mes k82-mes">${ml(m)} <small>${esc(EST_C[e])}</small>${k82Celda(p, c, m, 'd')}</label>`; };
  return (K82.ant ? K82_ANT.map(bl).join('') : '')
    + MK.map(m => `<label class="mes"${m === MK[0] ? ' data-k82-ini' : ''}${m === MK[MK.length - 1] ? ' data-k82-fin' : ''}>${ml(m)}${celdaInput(p, c, m, 'd')}</label>`).join('')
    + (K82.sig ? K82_SIG.map(bl).join('') : '');
}
/* desplazamiento: 'mk' = la captura empieza en el borde izquierdo (después de la columna fija); 'ant' = se ven los meses justo antes de la
   captura; 'sig' = se ven los primeros meses siguientes */
function k82Ir(caja, modo) {
  if (!caja || caja.scrollWidth <= caja.clientWidth) return;
  const ini = caja.querySelector('[data-k82-ini]'), fin = caja.querySelector('[data-k82-fin]'); if (!ini || !fin) return;
  const cr = caja.getBoundingClientRect(), fijo = caja.querySelector('.cab .c-p'), fw = fijo ? fijo.getBoundingClientRect().width : 0;
  const ri = ini.getBoundingClientRect(), rf = fin.getBoundingClientRect();
  let d = 0;
  if (modo === 'mk') d = ri.left - cr.left - fw;
  else if (modo === 'ant') d = ri.left - cr.left - (caja.clientWidth - 2 * ri.width);
  else if (modo === 'sig') d = rf.left - cr.left - fw;
  caja.scrollLeft = Math.max(0, caja.scrollLeft + d);
}
/* al pintar (abrir la página, la pestaña o el detalle): si los anteriores están desplegados, se arranca en el primer mes de captura */
function k82Inicio(cajas) { if (!K82.ant) return; cajas.forEach(c => { if (c && c.scrollLeft < 8) k82Ir(c, 'mk'); }); }      // < 8: el ajuste del scroll-snap puede dejarla en 2 px
function k82Det(modo) {
  if (!S.abierto) return;
  $$('#det [data-k82-c]').forEach(el => {
    const L = LINES[el.dataset.k82C]; if (!L) return;
    el.classList.toggle('k82-tira', k82Tira()); el.innerHTML = k82MesesDet(L.p, L.c);
    if (modo === 'cerrar-ant') el.scrollLeft = 0; else k82Ir(el, modo);
  });
  k72Bloquear();      // 072-CIERRE: las casillas de captura recién pintadas respetan el cierre y el modo solo lectura
}
document.addEventListener('click', ev => {
  const b = ev.target.closest('[data-k82]'); if (!b) return;
  const k = b.dataset.k82; if (!k82Ms(k).length) return;
  K82[k] = !K82[k]; k82Guardar();
  const modo = K82[k] ? k : (k === 'ant' ? 'cerrar-ant' : 'nada'), enGrid = !!b.closest('#grid');
  $$('[data-k82]').forEach(x => { const on = K82[x.dataset.k82]; x.setAttribute(x.hasAttribute('aria-pressed') ? 'aria-pressed' : 'aria-expanded', on); x.title = (on ? 'Ocultar' : 'Ver') + ' estos meses (solo lectura)'; });
  if (S.vista === 'capturar') {
    const caja = $('#grid-box .cap-wrap'); pintarGrid();
    if (caja) { if (modo === 'cerrar-ant') caja.scrollLeft = 0; else k82Ir(caja, modo); }
    if (enGrid) { const n = $(`#grid [data-k82="${k}"]`); if (n) n.focus(); }      // el botón del encabezado se volvió a pintar
  }
  k82Det(modo);
});
function listaCaptura() {
  const q = S.q2.trim().toLowerCase();
  const L = P.filter(p => enDist(p) && p.cap.length && (!q || p.txt.includes(q)) && pasaChip(p, S.chip2) && k72Pasa(p))      // 072-CIERRE: filtro Pendientes / En progreso / Cerrados
    .sort((a, b) => k72Orden(a) - k72Orden(b) || pv(b, algPz6(b)) - pv(a, algPz6(a)));      // 072-CIERRE: cerrados al final (si se eligió) · por valor del estimado, como Resumen
  return k95Grupos(L).flatMap(g => g[1]);      // 095: en el orden de la grilla, por categoría
}
function celdaInput(p, c, m, pref) {
  const pc = c.cod === p.principal && c.pzPorU, al = pc ? (p.alg[m] || 0) / c.pzPorU : null, vg = vig(c, m), sinF = CAL && (CAL.mesesSinFormulario || []).includes(m), aa = siU(p, c, addM(m, -12)), ra = pc ? (p.real[addM(m, -12)] || 0) / c.pzPorU : null;
  const iid = pref + '-' + sid(c.id) + '-' + m, hid = iid + '-h';
  return `<input class="inp${editado(c, m) ? ' ed' : ''}${k82SinGuardar(c, m) ? ' k82-sg' : ''}${unidCelda(p, c, m)}" id="${iid}" data-line="${esc(c.id)}" data-mes="${m}" inputmode="numeric" enterkeyhint="next" autocomplete="off"${editable(m) ? '' : ' readonly'} value="${kamU(c, m)}" aria-label="${esc(c.cod + ' ' + mll(m))}" aria-describedby="${hid}">`
    + `<span class="hint" id="${hid}">${al != null ? 'FCST est. ' + fN1(al) + ' · ' : ''}${sinF ? 'sin formulario previo' : 'ant ' + (vg == null ? '—' : fN(vg))}${ra != null ? '<br>año pas. ' + fN1(ra) : (aa != null ? '<br>SI año pas. ' + fN1(aa) : '')}${r92Pista(p, c, m)}</span>`;
}
/* ---------- 094-CAPTURA (26-nov, pedido del usuario sobre "Capturar forecast": "toda esta interfaz está horrible, no debería decir 'ver
   gráfico', solo debería uno tocar el producto y ya; no se ven bien los productos, la lista completa; hazlo bien moderno, eficiente, útil") ----------
   La captura deja la tabla de 25 en 25 productos y pasa a una grilla CSS con roles de tabla (#grid role=table):
   - LISTA COMPLETA: todos los productos del filtro (S.capLim = CAP_LIM). Cada producto es un bloque .pr con content-visibility: auto
     (el navegador no pinta lo que está fuera de la pantalla) y, al escribir, solo se refresca el producto tocado (K94SUC + GEL).
   - DENSA: un producto con un código = una fila (nombre Brinova = descripción del sell in del código, la unidad "cajas de 144 pz", código y
     distribuidor); con varios códigos, una fila de título y una por código. Estado (Pendiente / En progreso / Cerrado) como ícono con texto
     accesible; avisos como insignias cortas (.bd) con el texto completo en el title y para el lector de pantalla.
   - ALINEADA: encabezado, filas y pie usan las mismas columnas (--cols, anchos fijos), así que cada mes del encabezado cae exacto sobre su casilla.
     La página hace scroll natural: el encabezado de meses queda pegado debajo del gráfico compacto y el pie de totales abajo. Si no cabe a lo ancho
     (meses anteriores o siguientes desplegados, ventana angosta), la lista pasa a un panel del alto disponible con scroll propio (.cap-x) y la
     columna de producto queda fija a la izquierda (k94Modo).
   - TOCAR EL PRODUCTO = FILTRAR EL GRÁFICO: el nombre es un botón (aria-pressed; Enter / Espacio) y tocar cualquier parte libre de la fila hace lo
     mismo; tocar otra vez o "Quitar filtro" vuelve a todo. El detalle se abre con el botón "Detalle" (ⓘ), ya no al tocar el nombre.
   - PISTAS SIN RUIDO: bajo cada casilla, una sola línea (el sugerido de la restricción "sug. 634 ▲" con su color, o "est. 230"); el resto
     (pronóstico estimado, forecast anterior, año pasado, valor, sugerido y su porqué, aviso de unidades) en un tooltip al pasar el mouse o al
     entrar a la casilla (k94Tip*); Alt+Enter abre "¿De dónde sale?". Reemplaza a la barra oscura de referencias (#insp).
   - CELULAR (≤ 760 px): una tarjeta por producto; los meses en una franja horizontal desplazable, cada casilla con su mes; sin desborde.
   No cambia el contrato de datos ni la captura: mismas casillas (.inp con data-line / data-mes), mismos ids de totales (t-, v-, f-) y los mismos
   manejadores de app_3 (escribir, Guardar, cierre, avisos de unidades, solo lectura de BI). */
const CAP_LIM = 5000;      // lista completa (antes 25 y "Mostrar 25 más")
S.capLim = CAP_LIM;
const GEL = new Map();      // id de producto → su bloque .pr en la grilla (se arma en pintarGrid)
const K94SUC = new Set();   // productos tocados desde el último refresco ('*' = todos)
let k94Min = 0;
document.addEventListener('fcst:captura', ev => { const x = ev.detail || {}, L = x.clase ? LINES[x.clase + '__' + x.cod] : null; K94SUC.add(L ? L.p.id : '*'); });
/* ---------- 095-CAPTURA (27-nov, correcciones del usuario sobre la 0.9.4: "mejorar la interfaz de captura para que sea ordenada, minimalista y
   similar a las demás hojas; noto unos símbolos que no se entienden; algunas tienen sell in y otra estimación; los indicadores de crecimiento o
   decremento no tienen colores; 'ver gráfico' no tiene sentido; las filas deben estar por categoría y aprovechar mejor los espacios") ----------
   - Por CATEGORÍA (productos[].cat, la misma de Resumen y en el mismo orden: datos.categorias o más pronóstico estimado arriba). Encabezado
     plegable con cuántos productos tiene y el subtotal de cada mes en la moneda elegida (precio de lista, igual que el pie). Dentro, los
     productos por valor del pronóstico estimado, como "Productos del mix"; con "Cerrados al final", los cerrados al final de su categoría.
   - La MISMA pista bajo todas las casillas: "est. N" = pronóstico estimado de ESE código (codigos[].calc.fc en su unidad; la suma de los códigos
     da productos[].alg). Sin pronóstico, "—". Forecast anterior, venta del año pasado, sell in y pedido sugerido van al tooltip y al detalle.
   - Total: siempre el total y "vs est." con la flecha de color de 0.9.2 (verde sube, rojo baja, gris 0 % o sin dato; flecha y signo se quedan).
   - Avisos en texto corto y sobrio ("Riesgo de quiebre", "Revisar unidades"…): uno a la vista y "+N"; todos en el title y para el lector.
   - Producto de varios códigos: su fila es el total del producto (por mes, en su unidad, y contra el estimado); los códigos debajo, en una línea.
   - La marca de la casa (EL CONTRASTE) no se repite en cada fila; las otras (ALABRILL, LIKE…) quedan como prefijo chico.
   - Producto de 300 px, los meses repartidos en el resto, Total y Valor juntos, "Cerrar" discreto. Sin "Ver gráfico": se toca el producto. */
const K95_CASA = /^(EL CONTRASTE|EL CONTRSTE|CONTRASTE)\s+(?=\S)/i, K95_MARCA = /^(ALABRILL|LIKE|ULTRALIM|ULTALIM)\s+(?=\S)/i;
const nomCap = p => p.cap.length === 1 ? descB(p.cap[0]) : descSI(p);      // descripción del sell in (T_SKU), como en Resumen
const nomVis = p => String(nomCap(p)).replace(K95_CASA, '');
const k95Nombre = p => { const nm = nomVis(p), m = nm.match(K95_MARCA); return m ? `<span class="mk">${esc(m[1])}</span> ${esc(nm.slice(m[0].length))}` : esc(nm); };
const k94Clase = p => S.dist === 'TODOS' && D.clases.length > 1 ? ' · ' + esc(p.clase) : '';
const k94UPill = c => `<span class="upill ${c.pzPorU > 1 ? 'emp' : 'pz'}">${esc(uCod(c))}</span>`;
const ICO_INFO = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.6v.2"/></svg>';
/* variación con la flecha de color de 0.9.2 (cls3: up / down / flat) */
const vsTit = d => !ok(d) ? 'sin pronóstico estimado para comparar' : Math.round(d * 100) > 0 ? 'por encima del pronóstico estimado' : Math.round(d * 100) < 0 ? 'por debajo del pronóstico estimado' : 'igual al pronóstico estimado';
const difHtml = d => `<span class="${cls3(d)}" title="${esc(vsTit(d))}">${ok(d) ? flecha(d) + fP(d) : '—'}</span>`;
/* pronóstico estimado de un código en un mes, en su unidad */
const k95ConFc = p => p._fc != null ? p._fc : (p._fc = p.codigos.some(x => x.calc && x.calc.fc && Object.keys(x.calc.fc).length > 0));
function k95Est(p, c, m) {
  const u = c.pzPorU; if (!u) return null;
  if (k95ConFc(p)) { const f = c.calc && c.calc.fc; return f && f[m] != null ? f[m] / u : null; }
  return c.cod === p.principal && p.alg && p.alg[m] != null ? p.alg[m] / u : null;      // datos sin calc.fc: el del producto en el código principal
}
const k95Pista = (p, c, m) => { const e = k95Est(p, c, m); return e == null ? '—' : 'est. ' + fN1(e); };
function k95Vs(p, c) { let k = 0, e = 0, hay = false; MK.forEach(m => { const x = k95Est(p, c, m); if (x != null) { hay = true; e += x; } k += kamU(c, m); }); return hay && e > 0 ? k / e - 1 : null; }
const k95PzMes = (p, m) => p.cap.reduce((a, c) => a + kamU(c, m) * (c.pzPorU || 0), 0);
const k95PzProd = p => MK.reduce((a, m) => a + k95PzMes(p, m), 0);
const k95ValProd = p => p.cap.reduce((a, c) => { const pr = precioU(p, c); return a + (pr ? MK.reduce((s, m) => s + kamU(c, m), 0) * pr : 0); }, 0);
function k95VsProd(p) { let k = 0, e = 0, hay = false; p.cap.forEach(c => { const u = c.pzPorU || 0; MK.forEach(m => { const x = k95Est(p, c, m); if (x != null) { hay = true; e += x * u; } k += kamU(c, m) * u; }); }); return hay && e > 0 ? k / e - 1 : null; }
/* columnas: producto 300 px | (anteriores) | meses repartidos en el resto | (siguientes) | total | valor | cerrar */
function k94Cols(ms) {
  const a = K82_ANT.length > 0, s = K82_SIG.length > 0;
  return { cols: ['300px', a ? '32px' : '', `repeat(${ms.length},minmax(86px,1fr))`, s ? '32px' : '', '104px', '104px', '76px'].filter(Boolean).join(' '),
    min: 300 + (a ? 32 : 0) + (s ? 32 : 0) + ms.length * 86 + 104 + 104 + 76 };
}
/* estado: solo se dibuja En progreso y Cerrado (Pendiente es lo normal: sin ícono); el texto va para el lector. Leyenda: filtros de estado de arriba */
const k94Pill = e => `<span class="k72-est k72-${e} k94-mini" title="${K72_EST[e]}">${e === 'pendiente' ? '' : K72_ICO[e]}<span class="vh">${K72_EST[e]}</span></span>`;
const k94Estado = p => `<span class="k72-g" data-k72-g="${esc(p.id)}">${k94Pill(k72Estado(p))}</span>`;
/* avisos en texto corto: el primero a la vista (en su color) y "+N"; todos en el title y para el lector de pantalla */
const K95_CORTO = [[/^Riesgo de quiebre/, 'Riesgo de quiebre'], [/^Sobrestock/, 'Sobrestock'], [/^Exceso/, 'Exceso de inventario'], [/muy arriba/, 'Muy arriba del est.'], [/muy abajo/, 'Muy abajo del est.'], [/^Sin precio/, 'Sin precio'], [/dato viejo/, 'Inventario viejo']];
const k95Corto = x => { for (const [r, t] of K95_CORTO) if (r.test(x)) return t; return x; };
function k95Avisos(p) {
  const a = [];
  if (unidPend(p).length) a.push(['bad', 'Revisar unidades', 'posible error de unidades: revisa el aviso debajo del producto']);
  alertas(p).forEach(([c, x]) => a.push([c, k95Corto(x), x]));
  avisosCaptura(p).forEach(([c, x]) => a.push([c === 'nota' ? '' : c, c === 'nota' ? 'Nota' : /no vende|sin venta/i.test(x) ? 'Sin venta reciente' : 'Revisar forecast', x]));
  if (!a.length) return '';
  a.sort((x, y) => ({ bad: 0, warn: 1 }[x[0]] ?? 2) - ({ bad: 0, warn: 1 }[y[0]] ?? 2));
  const todo = a.map(([, t, x]) => t === x ? t : t + ': ' + x).join(' · ');
  return `<span class="av ${a[0][0]}" title="${esc(todo)}">${esc(a[0][1])}${a.length > 1 ? ` <span class="av-mas">+${a.length - 1}</span>` : ''}<span class="vh">. Avisos: ${esc(todo)}</span></span>`;
}
/* detalle (ⓘ, junto al nombre) y cerrar / reabrir (discreto, a la derecha) */
const k94Det = p => `<button type="button" class="ib" data-p="${esc(p.id)}" aria-label="${esc('Detalle de ' + nomVis(p) + ' (' + p.clase + ')')}" title="Ver el detalle del producto">${ICO_INFO}</button>`;
function k94Acc(p) {
  const on = k72Cerrado(p), nm = nomVis(p) + ' (' + p.clase + ')', dis = k72Puede() ? '' : ` disabled title="${esc(k72PorQue())}"`;
  return `<button type="button" class="k72-btn k95-cerrar${on ? ' on' : ''}" data-k72="${esc(p.id)}" aria-label="${esc((on ? 'Reabrir ' : 'Cerrar producto ') + nm)}"${dis || ` title="${on ? 'Reabrir para cambiar sus números' : 'Cerrar producto: sus casillas quedan bloqueadas hasta reabrirlo'}"`}>${on ? 'Reabrir' : '<span aria-hidden="true">✓</span> Cerrar'}</button>`;
}
/* celda del producto: el nombre es el botón que filtra el gráfico; segunda línea: unidad, código, distribuidor y avisos */
function k94CeldaProd(p, c) {      // c = null: fila del producto de varios códigos
  const on = S.capProd === p.id, nm = nomCap(p);
  const meta = c ? `${k94UPill(c)}<span class="p2t">${esc(c.cod)}${k94Clase(p)}</span>` : `<span class="upill ${p.uPz > 1 && S.unidad !== 'pz' ? 'emp' : 'pz'}">${esc(uNom(p))}</span><span class="p2t k95-n">${p.cap.length} códigos${k94Clase(p)}</span>`;
  return `<div class="c-p" role="rowheader"><div class="p1">${k94Estado(p)}<button type="button" class="pr-sel" data-capsel="${esc(p.id)}" aria-pressed="${on}" title="${esc(nm + ' · ' + p.clase + ' · ' + fuenteProd(p) + '. Tócalo para verlo solo en el gráfico')}">${k95Nombre(p)}</button>${k94Det(p)}</div><div class="p2">${meta}<span class="avs" data-ga="${esc(p.id)}">${k95Avisos(p)}</span></div></div>`;
}
function k94Celda(p, c, m) {
  const iid = 'g-' + sid(c.id) + '-' + m, hid = iid + '-h';
  return `<div class="c-m st-abierto" role="cell" data-c="${esc(c.id)}" data-m="${m}"><span class="mlab" aria-hidden="true">${ml(m)}</span>`
    + `<input class="inp${editado(c, m) ? ' ed' : ''}${k82SinGuardar(c, m) ? ' k82-sg' : ''}${unidCelda(p, c, m)}" id="${iid}" data-line="${esc(c.id)}" data-mes="${m}" inputmode="numeric" enterkeyhint="next" autocomplete="off"${editable(m) ? '' : ' readonly'} value="${kamU(c, m)}" aria-label="${esc(c.cod + ' ' + mll(m))}" aria-describedby="${hid}">`
    + `<span class="hint" id="${hid}">${k95Pista(p, c, m)}</span></div>`;
}
/* 082-MESES en la grilla: mes fuera de la captura, bloqueado, con la misma pista */
function k94Fuera(p, c, m) {
  const e = estadoMes(m), v = k82Valor(c, m), iid = 'g-' + sid(c.id) + '-' + m + '-b';
  const que = m < MC ? 'forecast registrado en su momento' : e === 'curso' ? 'forecast ' + (OFICIAL_CURSO ? 'oficial' : 'vigente') + ' del mes en curso' : 'formulario vigente';
  return `<div class="c-m st-${e} k82-td" role="cell" data-c="${esc(c.id)}" data-m="${m}"><span class="mlab" aria-hidden="true">${ml(m)} ${ICO.lock}</span><span class="k82-w" title="${esc('Bloqueado: ' + que)}">${ICO.lock}<input class="k82-in" readonly tabindex="-1" value="${v == null ? '' : esc(v)}" placeholder="—" aria-label="${esc(c.cod + ' ' + mll(m) + ': ' + que + ', bloqueado')}" aria-describedby="${iid}-h"></span><span class="hint" id="${iid}-h">${k95Pista(p, c, m)}</span></div>`;
}
const k95Lad = k => k82Ms(k).length ? '<div class="c-l" aria-hidden="true"></div>' : '';
function k94Celdas(p, c, ms) { return `${k95Lad('ant')}<div class="ms">${ms.map(m => MK.includes(m) ? k94Celda(p, c, m) : k94Fuera(p, c, m)).join('')}</div>${k95Lad('sig')}`; }
/* fila del producto de varios códigos (o cerrado y plegado): total del producto por mes en su unidad, total contra el estimado y valor */
function k94Titulo(p, ms, pl) {
  const f = fac(p);
  const medio = pl ? `<div class="c-sum" role="cell" style="grid-column:span ${ms.length + (K82_ANT.length ? 1 : 0) + (K82_SIG.length ? 1 : 0)}"><span class="muted">${esc(k72CerradoTxt(p))} · ${p.cap.length === 1 ? 'código oculto' : 'códigos ocultos'}: toca Reabrir para cambiarlo</span></div>`
    : `${k95Lad('ant')}<div class="ms">${ms.map(m => `<div class="c-m k95-sum" role="cell"><span class="k95-r" data-gm="${m}">${MK.includes(m) ? fN1(k95PzMes(p, m) / f) : ''}</span></div>`).join('')}</div>${k95Lad('sig')}`;
  return `<div class="cr tit" role="row">${k94CeldaProd(p, pl && p.cap.length === 1 ? p.cap[0] : null)}${medio}`
    + `<div class="c-t" role="cell"><b data-gt="${esc(p.id)}">${fN1(k95PzProd(p) / f)}</b><small>vs est. <span data-gd="${esc(p.id)}">${difHtml(k95VsProd(p))}</span></small></div>`
    + `<div class="c-v" role="cell"><b data-gv="${esc(p.id)}">${fC(k95ValProd(p))}</b></div><div class="c-a" role="cell">${k94Acc(p)}</div></div>`;
}
/* fila de un código: producto de un código (fila completa) o código de un producto de varios (una línea: código y unidad) */
function k94Fila(p, c, ms, multi) {
  const pr = precioU(p, c), id = esc(c.id);
  const cp = multi ? `<div class="c-p k94-cod" role="rowheader" title="${esc(descB(c) + (c.cod === p.principal ? ' · código principal' : ''))}"><div class="p1"><b>${esc(c.cod)}</b></div><div class="p2">${k94UPill(c)}<span class="k94-mcl">${k94Clase(p)}</span></div></div>` : k94CeldaProd(p, c);
  return `<div class="cr${multi ? ' k94-cod' : ' uno'}" role="row" data-gp="${esc(p.id)}" data-pr="${pr == null ? '' : pr}">${cp}${k94Celdas(p, c, ms)}`
    + `<div class="c-t" role="cell"><b id="t-${id}"></b><small data-vs="${id}"><span class="k95-vt">vs est. </span>${difHtml(k95Vs(p, c))}</small></div>`
    + `<div class="c-v" role="cell" title="${esc(pr != null ? 'Precio de lista: ' + fC2(pr) + ' por ' + unNom(c, 1) : 'Sin precio de lista')}"><b id="v-${id}"></b>${pr == null ? '<small class="down">sin precio</small>' : ''}</div><div class="c-a" role="cell">${multi ? '' : k94Acc(p)}</div></div>`;
}
function k94Prod(p, ms) {
  const pl = k72Plegado(p), multi = p.cap.length > 1, u = unidHtml(p, 'g');
  p.cap.forEach(c => filasGrid.push(c.id));      // los plegados siguen sumando en el pie y en su categoría
  let h = `<div class="pr${S.capProd === p.id ? ' sel' : ''}${pl ? ' plegado' : ''}" data-g="${esc(p.id)}" role="rowgroup">`;
  if (pl || multi) h += k94Titulo(p, ms, pl);
  if (!pl) p.cap.slice().sort((a, b) => (b.cod === p.principal) - (a.cod === p.principal)).forEach(c => { h += k94Fila(p, c, ms, multi); });      // el código principal primero (en el celular va pegado al nombre)
  h += `<div class="unid-row" role="row" data-gu-tr="${esc(p.id)}"${u ? '' : ' hidden'}><div class="unid-g" role="cell" data-gu="${esc(p.id)}">${u}</div></div>`;      // 090-UNIDADES
  return h + '</div>';
}
/* categorías: mismo orden que Resumen (datos.categorias o más pronóstico estimado arriba); plegadas = las que el KAM cerró (se recuerda) */
const LS_K95 = 'portal-k95-cat';
const K95CAT = (() => { try { const g = JSON.parse(localStorage.getItem(LS_K95) || 'null'); return g && typeof g === 'object' ? g : {}; } catch (e) { return {}; } })();
const catDe = p => p.cat || 'Sin categoría';
function k95Grupos(L) {
  const g = new Map(); L.forEach(p => { const k = catDe(p); if (!g.has(k)) g.set(k, []); g.get(k).push(p); });
  const ORD = ordenCategorias(), pos = k => { const i = ORD ? ORD.indexOf(k) : -1; return i < 0 ? 1e6 : i; };
  return [...g.entries()].map(([k, ps]) => [k, ps, ps.reduce((a, p) => a + pv(p, algPz6(p)), 0)]).sort((a, b) => pos(a[0]) - pos(b[0]) || b[2] - a[2] || a[0].localeCompare(b[0]));
}
function k95CatCab(k, ps, ms) {
  const cerrada = !!K95CAT[k], n = ps.length;
  return `<div class="cr cat-r" role="row" data-catr="${esc(k)}"><div class="c-p" role="rowheader"><button type="button" class="cat-t" data-k95cat="${esc(k)}" aria-expanded="${!cerrada}"${descCat(k) ? ` title="${esc(descCat(k))}"` : ''}><span class="nm">${esc(nombreCat(k))}</span><span class="meta">${n} ${n === 1 ? 'producto' : 'productos'}</span></button></div>`
    + `${k95Lad('ant')}<div class="ms">${ms.map(m => `<div class="c-m" role="cell"><span class="k95-r" data-cm="${m}"></span></div>`).join('')}</div>${k95Lad('sig')}<div class="c-t" role="cell"></div><div class="c-v" role="cell" data-cv></div><div class="c-a" aria-hidden="true"></div></div>`;
}
const CEL = new Map();      // categoría → su encabezado (subtotales)
/* abre la categoría de un producto (para llevar el foco a él) */
function k95Mostrar(p) {
  const k = catDe(p); if (!K95CAT[k]) return;
  delete K95CAT[k]; try { localStorage.setItem(LS_K95, JSON.stringify(K95CAT)); } catch (e) { }
  const w = [...document.querySelectorAll('#grid .k95-cat')].find(e => e.dataset.cat === k); if (!w) return;
  const b = w.querySelector('[data-k95cat]'); if (b) b.setAttribute('aria-expanded', 'true');
  const c = w.querySelector('.k95-cps'); if (c) c.hidden = false;
}
document.addEventListener('click', ev => {
  const b = ev.target.closest && ev.target.closest('[data-k95cat]'); if (!b) return;
  const k = b.dataset.k95cat, abrir = b.getAttribute('aria-expanded') !== 'true';
  if (abrir) delete K95CAT[k]; else K95CAT[k] = 1;
  try { localStorage.setItem(LS_K95, JSON.stringify(K95CAT)); } catch (e) { }
  b.setAttribute('aria-expanded', String(abrir));
  const c = b.closest('.k95-cat').querySelector('.k95-cps'); if (c) c.hidden = !abrir;
});
function pintarGrid() {
  const L = listaCaptura(), ms = mesesCaptura(), lim = L.slice(0, S.capLim), cc = k94Cols(ms), g = $('#grid');
  filasGrid = []; prodGrid = lim; k94Min = cc.min; tipOcultar(0);
  g.style.setProperty('--cols', cc.cols); g.style.setProperty('--minw', cc.min + 'px');
  const lad = (k, x) => k82Ms(k).length ? x : '';
  let h = `<div class="cr cab" role="row"><div class="c-p" role="columnheader"><span class="k94-cpt">Producto <span class="muted">· ${L.length}</span></span><span class="k94-cgx" id="k94-cgx"></span></div>${lad('ant', `<div class="c-l" role="columnheader">${k82BotonTh('ant')}</div>`)}<div class="ms">`
    + ms.map(m => { const e = estadoMes(m), k = MK.includes(m); return `<div class="c-m st-${e}" role="columnheader"${m === MK[0] ? ' data-k82-ini' : ''}${m === MK[MK.length - 1] ? ' data-k82-fin' : ''}>${ml(m)}<small>${k ? '' : ICO.lock + ' '}${EST_C[e]}</small></div>`; }).join('')
    + `</div>${lad('sig', `<div class="c-l" role="columnheader">${k82BotonTh('sig')}</div>`)}<div class="c-t" role="columnheader">Total</div><div class="c-v" role="columnheader">Valor</div><div class="c-a" role="columnheader"><span class="vh">Cerrar</span></div></div>`;
  k95Grupos(lim).forEach(([k, ps]) => {
    h += `<div class="k95-cat" data-cat="${esc(k)}">${k95CatCab(k, ps, ms)}<div class="k95-cps"${K95CAT[k] ? ' hidden' : ''}>`;
    ps.forEach(p => { h += k94Prod(p, ms); });
    h += '</div></div>';
  });
  if (!L.length) h += '<div class="vacio" role="row"><span role="cell">Ningún producto cumple el filtro.</span></div>';
  h += `<div class="cr pie" role="row"><div class="c-p" role="rowheader">Total en ${monTxt()} (lista)${lim.length < L.length ? ' · productos mostrados' : ''}</div>${lad('ant', '<div class="c-l" aria-hidden="true"></div>')}<div class="ms">${ms.map(m => `<div class="c-m" role="cell"><span class="k95-r" id="f-${m}"></span></div>`).join('')}</div>${lad('sig', '<div class="c-l" aria-hidden="true"></div>')}<div class="c-t" role="cell"></div><div class="c-v" role="cell" id="f-tot"></div><div class="c-a" aria-hidden="true"></div></div>`;
  g.innerHTML = h;
  GEL.clear(); g.querySelectorAll('.pr').forEach(e => GEL.set(e.dataset.g, e)); K94SUC.clear();
  CEL.clear(); g.querySelectorAll('.cat-r').forEach(e => CEL.set(e.dataset.catr, e));
  $('#grid-mas').innerHTML = L.length > S.capLim ? `<div class="mas"><button type="button" class="btn" data-capmas>Mostrar ${Math.min(25, L.length - S.capLim)} productos más (${L.length - S.capLim} restantes)</button></div>` : '';
  filasGrid.forEach(totFila); pieGrid(); pintarResumenCap();
  k94Modo();
  k82Inicio([$('#grid-box .cap-wrap')]);      // 082-MESES: con los anteriores desplegados, se arranca en el primer mes de captura
}
/* ¿cabe a lo ancho? Si no, panel del alto disponible con scroll propio y columna de producto fija (.cap-x); en celular, tarjetas */
function k94Modo() {
  const w = $('#grid-box .cap-wrap'); if (!w) return;
  const x = !matchMedia('(max-width:760px)').matches && k94Min > w.clientWidth + 1;
  w.classList.toggle('cap-x', x);
  if (x) w.setAttribute('tabindex', '0'); else w.removeAttribute('tabindex');
}
(() => {
  const box = document.getElementById('grid-box'), g = document.getElementById('grid'); if (!box || !g) return;
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(() => { if (S.vista === 'capturar') k94Modo(); }).observe(box);
  /* celular con los meses anteriores desplegados: cada franja arranca en el primer mes de captura cuando su tarjeta entra a la pantalla */
  g.addEventListener('contentvisibilityautostatechange', ev => {
    if (ev.skipped || !K82.ant || !matchMedia('(max-width:760px)').matches) return;
    ev.target.querySelectorAll('.ms').forEach(s => { if (s.scrollLeft < 8) { const i = s.querySelector('.st-abierto'); if (i) s.scrollLeft = i.offsetLeft - s.offsetLeft - 10; } });
  });
})();
/* el encabezado pegado de la lista: con un producto en el gráfico, un único chip "Gráfico: <producto> ✕" que quita el filtro */
function k94CgCab(p) {
  const x = $('#k94-cgx'); if (!x) return;
  x.innerHTML = p ? `<button type="button" class="chip k94-cgf" data-k94-clr aria-label="${esc('Quitar el filtro del gráfico: ' + nomVis(p))}" title="Quitar el filtro del gráfico">Gráfico: ${esc(nomVis(p))} <span aria-hidden="true">✕</span></button>` : '';
}
document.addEventListener('click', ev => { const t = ev.target.closest && ev.target.closest('[data-k94-clr]'); if (t) selCap(null, true); });
function totFila(id) {
  const { p, c } = LINES[id], t = document.getElementById('t-' + id), v = document.getElementById('v-' + id);
  if (!t) return;
  const u = MK.reduce((a, m) => a + kamU(c, m), 0), pr = precioU(p, c);
  t.textContent = fN(u); v.textContent = pr != null ? fC(u * pr) : '—';
}
/* pie y subtotales de cada categoría: moneda a precio de lista (como el pie); data-v = el número sin formato (para las pruebas) */
function pieGrid() {
  const ms = mesesCaptura().filter(m => { const e = estadoMes(m); return e === 'abierto' || e === 'curso'; }), cat = new Map(), tot = {};
  filasGrid.forEach(id => { const { p, c } = LINES[id], pr = precioU(p, c); if (!pr) return; const k = catDe(p); if (!cat.has(k)) cat.set(k, {});
    const o = cat.get(k); ms.forEach(m => { const v = kamU(c, m) * pr; o[m] = (o[m] || 0) + v; tot[m] = (tot[m] || 0) + v; }); });
  let suma = 0;
  mesesCaptura().forEach(m => {
    const el = document.getElementById('f-' + m); if (!el) return;
    if (!ms.includes(m)) { el.textContent = ''; return; }
    if (estadoMes(m) === 'abierto') suma += tot[m] || 0; el.textContent = fC(tot[m] || 0);
  });
  const ft = $('#f-tot'); if (ft) ft.textContent = fC(suma);
  CEL.forEach((e, k) => { const o = cat.get(k) || {}; let s = 0;
    e.querySelectorAll('[data-cm]').forEach(x => { const m = x.dataset.cm; if (!ms.includes(m)) { x.textContent = ''; return; } const v = o[m] || 0; if (estadoMes(m) === 'abierto') s += v; x.textContent = fC(v); x.dataset.v = Math.round(v * 100) / 100; });
    const cv = e.querySelector('[data-cv]'); if (cv) { cv.textContent = fC(s); cv.dataset.v = Math.round(s * 100) / 100; } });
}
/* refresco de UN producto mientras se escribe (lo llama refrescarGrupo de app_3): solo dentro de su bloque */
function k94Refrescar(p) {
  const g = GEL.get(p.id); if (!g || !g.isConnected) return;
  const f = fac(p);
  g.querySelectorAll('[data-ga]').forEach(x => { x.innerHTML = k95Avisos(p); });
  g.querySelectorAll('[data-vs]').forEach(x => { const L = LINES[x.dataset.vs]; if (L) x.innerHTML = '<span class="k95-vt">vs est. </span>' + difHtml(k95Vs(p, L.c)); });
  g.querySelectorAll('[data-gm]').forEach(x => { if (MK.includes(x.dataset.gm)) x.textContent = fN1(k95PzMes(p, x.dataset.gm) / f); });
  const gt = g.querySelector('[data-gt]'); if (gt) gt.textContent = fN1(k95PzProd(p) / f);
  const gd = g.querySelector('[data-gd]'); if (gd) gd.innerHTML = difHtml(k95VsProd(p));
  const gv = g.querySelector('[data-gv]'); if (gv) gv.textContent = fC(k95ValProd(p));
}
function pintarResumenCap() {
  const sel = P.filter(enDist), r = resumen(sel);
  const nEd = sel.reduce((a, p) => a + p.codigos.filter(c => MK.some(m => editado(c, m))).length, 0);
  const ci = $('#cap-intro');      // 094: la explicación va plegada en "¿Cómo funciona?"; arriba queda una sola línea
  if (ci && !ci.dataset.ok) { ci.dataset.ok = '1'; ci.innerHTML = `<p>Escribe tu forecast de ${esc(rango(MK))} en la unidad de cada código ("cajas de 144 pz"). Lo escrito queda en un borrador hasta que tocas <b>Guardar</b> en la barra de abajo.</p>
    <ul><li>Los productos van por <b>categoría</b>, como en Resumen; toca el nombre de una categoría para plegarla. Su fila suma cada mes en ${monTxt()} a precio de lista.</li>
    <li><b>Toca un producto</b> (su nombre o cualquier parte libre de la fila) para verlo solo en el gráfico; tócalo otra vez para volver a todo. <b>ⓘ</b> abre su ficha.</li>
    <li>Bajo cada casilla: <b>est.</b> = pronóstico estimado de ese código en ese mes ("—" si no tiene). En Total, tu total y la diferencia contra el estimado (▲ verde arriba, ▼ rojo abajo).</li>
    <li>Pasa el mouse o entra a una casilla para ver tu forecast anterior, el año pasado, el sell in y el pedido sugerido; Alt+Enter: ¿de dónde sale?</li>
    <li>Los avisos (riesgo de quiebre, sobrestock, revisar unidades…) van en texto junto al código; el detalle sale al pasar el mouse. Íconos: <span aria-hidden="true">◑</span> en progreso, <span aria-hidden="true">✓</span> cerrado.</li>
    <li>Cuando termines un producto, <b>Cerrar</b>: sus casillas quedan bloqueadas hasta reabrirlo.</li></ul>`; }
  $('#cap-res').innerHTML = `<b>Tu forecast ${esc(rango(MK))}</b><span>${nb('k_kam', '<b>' + fC(r.kam) + '</b>')}</span><span class="muted k94-sec">pronóstico estimado ${nb('k_alg', fC(r.alg))}</span>${difHtml(r.difK)}<span class="muted k94-sec">${nEd} ${nEd === 1 ? 'cambiado' : 'cambiados'}</span>${VENCIDO ? `<span class="pill bad">Captura cerrada el ${esc(fechaCorta(CAP_HASTA))}: solo lectura</span>` : ''}`;
  const ku = $('#k94-unid'); if (ku) ku.innerHTML = unidContador();      // 094: contador de avisos fuera de la línea de resumen (en el celular va junto a "¿Cómo funciona?")
  pintarCapGraf();      // 070-GRAFICO: gráfico del producto que se captura (pintarGrid y refrescarResumen pasan por aquí)
  k72PintarAvance();      // 072-CIERRE: avance por distribuidor, estados y bloqueo de casillas de productos cerrados
}
/* se conservan: r92Cod (tooltip) y k94SugTxt (detalle, r92Refrescar) */
const R94S = { exceso: '✕', recortado: '▲', corto: '▼', coincide: '✓', sinPedido: '' };
const r92Cod = (p, c) => c.cod === p.principal || (!p.cap.some(x => x.cod === p.principal) && c === p.cap[0]);
const k94SugTxt = (v, e) => `sug. ${fN1(v)}${e && R94S[e] ? ' ' + R94S[e] : ''}<span class="vh">${e ? ' · ' + esc(R92E[e][1]) : ''}</span>`;
/* ---------- 094 · tooltip de la casilla: uno solo para toda la grilla (popover manual en la capa superior; sin Popover API, un div fijo).
   Se abre al pasar el mouse (con retardo) o al entrar a la casilla, se puede recorrer con el mouse (WCAG 1.4.13), Esc lo cierra y se
   reposiciona al desplazar. inspector(id, m) lo llaman los manejadores de app_3 al enfocar y al escribir. ---------- */
const TIP = { el: null, t: 0, h: 0, ancla: null, modo: '' };
function tipEl() {
  if (TIP.el) return TIP.el;
  const t = document.createElement('div'); t.id = 'cap-tip'; t.className = 'cap-tip'; t.setAttribute('role', 'tooltip');
  if (Object.prototype.hasOwnProperty.call(HTMLElement.prototype, 'popover')) t.setAttribute('popover', 'manual'); else t.hidden = true;
  t.addEventListener('pointerenter', () => clearTimeout(TIP.h));
  t.addEventListener('pointerleave', () => { if (TIP.modo === 'hover') tipOcultar(160); });
  t.addEventListener('mousedown', ev => { if (TIP.modo === 'foco') ev.preventDefault(); });      // tocar el botón no le quita el foco a la casilla
  document.body.appendChild(t); return (TIP.el = t);
}
const tipAbierto = () => !!TIP.el && (TIP.el.hasAttribute('popover') ? TIP.el.matches(':popover-open') : !TIP.el.hidden);
function tipMostrar(ancla, html, modo) {
  const det = $('#det'); if (det && det.open) return;
  const t = tipEl(); t.innerHTML = html; TIP.ancla = ancla; TIP.modo = modo; clearTimeout(TIP.h);
  if (!tipAbierto()) { if (t.hasAttribute('popover')) { try { t.showPopover(); } catch (e) { } } else t.hidden = false; }
  tipPosicion();
}
function tipPosicion() {
  const t = TIP.el, a = TIP.ancla; if (!t || !tipAbierto()) return;
  if (!a || !a.isConnected) { tipOcultar(0); return; }
  const r = a.getBoundingClientRect(), w = t.offsetWidth, h = t.offsetHeight, mg = 8, arriba = matchMedia('(pointer:coarse)').matches;
  let y = arriba ? r.top - h - 6 : r.bottom + 6;
  if (!arriba && y + h > innerHeight - mg) y = r.top - h - 6;
  if (arriba && y < mg) y = r.bottom + 6;
  const x = Math.max(mg, Math.min(r.left + r.width / 2 - w / 2, innerWidth - w - mg));
  t.style.left = Math.round(x) + 'px'; t.style.top = Math.round(Math.max(mg, Math.min(y, innerHeight - h - mg))) + 'px';
}
function tipOcultar(ms) {
  clearTimeout(TIP.h); clearTimeout(TIP.t);
  const f = () => { const t = TIP.el; if (!t) return; if (t.hasAttribute('popover')) { try { t.hidePopover(); } catch (e) { } } else t.hidden = true; TIP.ancla = null; TIP.modo = ''; };
  if (ms) TIP.h = setTimeout(f, ms); else f();
}
function tipHtml(id, m) {
  const { p, c } = LINES[id], u = c.pzPorU || 1, e = estadoMes(m), aa = addM(m, -12), pr = precioU(p, c), pc = c.cod === p.principal && c.pzPorU, un = plural(presDe(c)), cap = MK.includes(m);
  const v = cap ? kamU(c, m) : k82Valor(c, m), vg = vig(c, m), s = siU(p, c, aa);
  const fila = (k, x) => `<div class="tr"><span>${k}</span><b>${x}</b></div>`;
  let h = `<div class="tt">${esc(nomVis(p))}<small>${esc(c.cod)} · ${esc(mll(m))} · ${esc(EST_C[e])}</small></div>`;
  h += fila(cap ? 'Tu forecast' : m < MC ? 'Forecast registrado' : 'Forecast vigente', v == null ? '—' : fN(v) + ' ' + esc(un) + (u > 1 && v ? ' = ' + fN(v * u) + ' pz' : ''));
  const es = k95Est(p, c, m); h += fila('Pronóstico estimado', es == null ? '—' : fN1(es));      // 095: el de este código (la misma pista de la casilla)
  if (cap) h += fila('Forecast anterior', vg == null ? (CAL && (CAL.mesesSinFormulario || []).includes(m) ? 'sin formulario previo' : '—') : fN(vg));
  if (e === 'real') { if (pc) h += fila('Venta real', fN1((p.real[m] || 0) / u)); const s0 = siU(p, c, m); if (s0 != null) h += fila('Sell in', fN1(s0)); }
  if (e === 'curso') { const av = c.avanceU != null ? c.avanceU : (pc && p.avanceSellInPz && p.avanceSellInPz[m] != null ? p.avanceSellInPz[m] / u : null); if (av != null) h += fila('Facturado al ' + esc(fechaCorta(D.avanceHasta).slice(0, 5)), fN1(av)); }
  const ra = pc && p.real[aa] != null ? fN1(p.real[aa] / u) + ' venta' : '';
  if (ra || s != null) h += fila('Año pasado (' + esc(ml(aa)) + ')', [ra, s != null ? fN1(s) + ' sell in' : ''].filter(Boolean).join(' · '));
  if (c.u12 != null) h += fila('Sell in 12 meses', fN(c.u12) + ' ' + esc(un));
  if (pr != null && v) h += fila('Valor', fC(v * pr) + ` <small>(${fC2(pr)} c/u)</small>`);
  const f = r92(p) && r92Mes(p, m);
  if (f && !f.enCurso && r92Cod(p, c)) { const es = r92Estado(p, m); h += `<p class="tp e-${es}"><b>Pedido sugerido ${fN1(f.sugeridoPz / u)}${es ? ' · ' + esc(R92E[es][1].toLowerCase()) : ''}.</b> ${esc(r92Texto(p, m, true))}</p>`; }
  const a = cap && unidPend(p).find(x => x.m === m); if (a) h += `<p class="tp bad">${esc(textoUnid(p, [a]))}</p>`;
  if (cap) h += `<div class="tpie"><button type="button" class="lnk" data-exp="cel" data-c="${esc(c.id)}" data-m="${m}">¿De dónde sale?</button><span class="muted">Alt+Enter</span></div>`;
  return h;
}
function inspector(id, m) {      // al enfocar o escribir en una casilla de la grilla: tooltip junto a la casilla
  const i = document.activeElement, cel = i && i.closest ? i.closest('#grid .c-m') : null; if (!cel || !LINES[id]) return;
  clearTimeout(TIP.t); tipMostrar(cel, tipHtml(id, m), 'foco');
}
document.addEventListener('pointerover', ev => {
  if (ev.pointerType && ev.pointerType !== 'mouse') return;
  const t = ev.target, cel = t.closest && t.closest('#grid .c-m[data-c]');
  if (!cel) { if (TIP.modo === 'hover' && !(t.closest && t.closest('#cap-tip'))) tipOcultar(160); return; }
  if (TIP.modo === 'foco' || TIP.ancla === cel) { clearTimeout(TIP.h); return; }
  clearTimeout(TIP.t); clearTimeout(TIP.h);
  TIP.t = setTimeout(() => { if (cel.isConnected && cel.matches(':hover') && TIP.modo !== 'foco') tipMostrar(cel, tipHtml(cel.dataset.c, cel.dataset.m), 'hover'); }, tipAbierto() ? 60 : 380);
});
document.addEventListener('focusout', ev => { if (TIP.modo !== 'foco') return; const r = ev.relatedTarget; if (r && r.closest && r.closest('#cap-tip')) return; tipOcultar(0); });
document.addEventListener('keydown', ev => {
  const t = ev.target;
  if (ev.key === 'Escape' && tipAbierto() && t.closest && t.closest('#grid')) { tipOcultar(0); return; }
  if (ev.key === 'Enter' && ev.altKey && t.classList && t.classList.contains('inp') && t.closest('#grid')) { ev.preventDefault(); ev.stopImmediatePropagation(); tipOcultar(0); abrirExp(EXP.cel({ c: t.dataset.line, m: t.dataset.mes })); }
});
addEventListener('scroll', () => { if (TIP.modo === 'hover') tipOcultar(0); else if (TIP.modo === 'foco') requestAnimationFrame(tipPosicion); }, { capture: true, passive: true });
addEventListener('resize', () => { if (tipAbierto()) tipPosicion(); }, { passive: true });

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
  <section class="panel prosa"><h3>2. El pronóstico estimado (algoritmo) en 3 pasos</h3>
    <p><b>Paso 1 · Base</b>: cuánto vende en un mes normal. Promedio de los últimos 3, 6 y 12 meses <b>dividido entre los meses con venta</b>; si compró en ${(D.algoritmo || {}).intermitenteMeses || 4} meses o menos del año (compra pocas veces), se divide entre 3, 6 y 12 meses de calendario. Base = promedio de esos tres.</p>
    <p><b>Paso 2 · Temporada</b>: un índice por mes sale de la venta de ese mes en 2024 y 2025 contra un mes normal. 1,00 es un mes normal; 1,20 es un mes 20 % más fuerte. Se limita entre 0,4 y 2,0. A los que compran pocas veces no se les aplica.${(D.algoritmo || {}).temporada === 'solo cadenas' ? ' <b>Solo se aplica en cadenas</b> (venta al consumidor en tienda, que sí repite su temporada cada año); en distribuidores, exportación y venta directa las compras siguen pedidos y contenedores y el índice queda en 1,00.' : ''}</p>
    <p><b>Paso 3 · Reglas</b>: base × índice, redondeado. Si un código lleva <b>6 meses o más sin venta</b>, el pronóstico estimado lo deja en 0.</p>
    <div class="formula">pronóstico estimado del mes = (prom. 3M + prom. 6M + prom. 12M) ÷ 3 × índice del mes</div>
    ${c ? `<p>Ejemplo, <b>${esc(ej.nombre)}</b> en ${esc(ej.clase)} (${esc(un)}): (${fN1(c.l3 / f)} + ${fN1(c.l6 / f)} + ${fN1(c.l12 / f)}) ÷ 3 = ${fN1(base / f)}; × ${nf2.format((c.idx && c.idx[m0]) || 1)} en ${ml(m0)} = <b>${fN1(((c.fc && c.fc[m0]) || 0) / f)}</b>.</p>` : ''}</section>
  <section class="panel prosa"><h3>3. Qué tan bien funciona</h3>
    <p>Se probó pronosticando mayo a octubre de 2026 con datos solo hasta abril, con todos los KAM. Error típico: <b>${esc(D.bt.pc)} %</b> por producto y cliente, <b>${esc(D.bt.cliente)} %</b> por cliente y <b>${esc(D.bt.kam)} %</b> por KAM; en total pronosticó ${esc(D.bt.sesgo)} % de más. El modelo que se usaba antes fallaba ${esc(D.bt.antes)} % por producto.</p>
    ${pk ? `<p><b>Forecast anterior (KAM)</b> (${ml(pk.desde)} – ${ml(pk.hasta)}): ${esc(frasePasado(pk))}.${exclTxt(pk) ? ' ' + esc(exclTxt(pk).replace(/^./, c => c.toUpperCase())) + '.' : ''}${BI(' Contra la venta real: sesgo ' + fP(pk.sesgoReal) + ', precisión ' + (ok(pk.accReal) ? nf.format(pk.accReal * 100) + ' %' : '—') + '. ' + esc(pk.regla || ''))}</p>` : ''}
    <p>Por producto el pronóstico estimado sirve como punto de partida. Tu conocimiento del cliente (promociones, listados nuevos, quiebres) es lo que lo corrige. La tarjeta <b>Forecast anterior (KAM)</b> indica si el forecast tiende a quedar por encima o por debajo de la demanda.</p></section>
  <section class="panel prosa"><h3>4. Qué meses capturas</h3>
    <p>Estamos en el ciclo de <b>${mll(D.ciclo)}</b>. ${esc(mll(MC).replace(/^./, x => x.toUpperCase()))} ya está corriendo: su forecast queda con candado (${OFICIAL_CURSO ? 'el oficial' : 'el de tu formulario vigente'}). Se capturan los ${MK.length} meses siguientes: <b>${rango(MK)}</b>${CAP_HASTA ? ', hasta el ' + fechaCorta(CAP_HASTA) : ''}. Los meses después de la captura muestran el pronóstico estimado como referencia; en “Capturar forecast”, “◀ Meses anteriores” y “Meses siguientes ▶” muestran los demás meses de cada código, con candado.</p>
    <p>Tu forecast es el que usa Brinova para <b>planear producción y compras</b> y para la <b>meta de facturación</b>. El valor en colones es unidades × precio de lista de ese distribuidor. Cuando te separes mucho del pronóstico estimado (más de 50 %), deja un comentario con el motivo.</p>
    <p><b>Avisos de la captura</b>, por código y mes: el aviso <b>rojo</b> aparece solo cuando el forecast supera ${nf.format(X3)} veces el pronóstico estimado <b>y además</b> de ${nf.format(X3M)} veces el mejor mes de venta que ha tenido ese código; ahí conviene dejar el motivo. Si solo pasa de ${nf.format(X3)} veces el pronóstico estimado, verás una <b>nota gris</b>, sin alarma: es para que lo tengas presente. El aviso amarillo es para un código que lleva de ${SV.min} a ${SV.max} meses sin vender.</p></section>
  <section class="panel prosa"><h3>5. Unidades</h3>
    <p>Todo se suma en <b>piezas</b>, la unidad estándar del motor (1 alambrina, 1 esponja). Cada código tiene sus <b>piezas por unidad de venta</b>${BI(' (T_SKU · UNIDAD DE EMPAQUE)')}: una caja de 120 pz son 120 piezas.</p>
    <p>Un producto puede tener varios códigos (unidad, caja, pack). Brinova a veces factura uno y el distribuidor reporta otro, así que se juntan por producto. Con <b>Unidad del formulario</b> ves cada producto en la presentación de tu formulario; con <b>Piezas (unidad estándar)</b>, todo en piezas.</p></section>
  <section class="panel prosa"><h3>6. Inventario y lo que todavía no considera</h3>
    <p><b>Días de inventario</b> = (inventario del distribuidor${P.some(conTransito) ? ' + inventario en tránsito que cuenta' : ''}) ÷ su venta diaria de los últimos 3 meses.${P.some(conTransito) && reglaTransito() ? ' Tránsito que cuenta: ' + esc(reglaTransito()) + '.' : ''} ${umbTxt}</p>
    <p>Todavía no considera promociones y lanzamientos (los registra el KAM)${P.some(conTransito) ? '' : ', órdenes de compra en tránsito'} ni la historia completa de inventario de los distribuidores que no lo mandan cada mes.</p>
    ${D.formFuera && D.formFuera.length ? `<p>Tu formulario también tiene ${D.formFuera.map(esc).join(', ')}, que todavía no tiene fuente de venta para el pronóstico estimado; no aparece aquí.</p>` : ''}</section>
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
const etiquetaMedida = it => it.ejemplo ? ' (ejemplo)' : it.cubo ? ' (medida estimada: cubo de m³)' : it.estimada ? ' (sin medidas ni m³: tamaño estimado)' : '';      // 081-CONT: mismo texto que el 2D/3D
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
const FUENTES3 = [['kam', 'Forecast KAM'], ['alg', 'Pronóstico estimado'], ['programados', 'Pedidos programados'], ['transito', 'En tránsito']];
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
/* plan de carga: núcleo 3D con el factor de llenado de BI (T_PARAMETROS_EXPORTACION) */
const N3 = nucleo3D();
function empacar(items, k) { return N3.empacar(items, k, factorLlenado()); }

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
    <div class="panel-h"><h2 id="c3-t">Contenedores</h2><span class="nota">${esc(k.nombre)} · interior ${nf2.format(k.largo / 1000)} × ${nf2.format(k.ancho / 1000)} × ${nf2.format(k.alto / 1000)} m · ${nf1.format(k.largo * k.ancho * k.alto / 1e9)} m³${k.pesoMax ? ' · carga máxima ' + fN(k.pesoMax) + ' kg' : ''}</span></div>
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
      ${N3.barraHtml()}
      <div id="c3-escena" class="c3-escena" role="img" aria-label="${esc(cu ? `${k.nombre}, contenedor ${C3.idx + 1} de ${n}: ${cu.cajas.length} cajas, ${pct(cu.vol / plan.vol)} del volumen. El detalle está en la tabla Plan de carga.` : 'Contenedor vacío con estos filtros')}"><p class="c3-msg">Cargando…</p></div>
      <div class="c3-tip" id="c3-tip" hidden></div>
      <div class="c3-ctrl">
        <button type="button" class="btn" data-c3cam="34">Vista 3/4</button><button type="button" class="btn" data-c3cam="puerta">Desde la puerta</button><button type="button" class="btn" data-c3cam="planta">Planta</button>
        <button type="button" class="btn" id="c3-anim" data-c3anim>Repetir carga</button>
        ${n > 1 ? `<button type="button" class="btn" data-c3idx="${Math.max(0, C3.idx - 1)}"${C3.idx ? '' : ' disabled'} aria-label="Contenedor anterior">‹</button><button type="button" class="btn" data-c3idx="${Math.min(n - 1, C3.idx + 1)}"${C3.idx < n - 1 ? '' : ' disabled'} aria-label="Contenedor siguiente">›</button>` : ''}
      </div>
    </div>
    <div class="legend c3-ley">${leyenda3(cu)}</div>
    <p class="small muted"><span class="k81-solo3d">Arrastre para girar; rueda o pellizco para acercar. </span><span class="k81-solo2d">Planta y lateral a escala, con la misma carga que la vista 3D. </span>Al pasar el mouse o tocar una caja se muestran su producto, sus medidas, m³ y piezas. Las cajas no se acuestan: solo giran sobre su base. La carga va del fondo hacia la puerta, piso por piso, sin pasar la altura útil.</p>
    <details class="c3-plan"><summary>Plan de carga (tabla)</summary>${tablaPlan(plan)}</details>
  </section>`;
  dibujar3D(plan);
}
function leyenda3(cu) {
  if (!cu) return '';
  const g = new Map();
  cu.porItem.forEach((nC, it) => { const k = C3.color === 'cat' ? (it.p.cat || 'Sin categoría') : it.p.nombre; const o = g.get(k) || { color: it.color, cajas: 0 }; o.cajas += nC; g.set(k, o); });
  return [...g.entries()].sort((a, b) => b[1].cajas - a[1].cajas).map(([k, o]) => `<span><i class="sw col" style="background:${o.color}"></i>${esc(C3.color === 'cat' ? nombreCat(k) : k)} · ${fN(o.cajas)} cajas</span>`).join('') + N3.notaLeyenda(cu);      // 081-CONT
}
function tablaPlan(plan) {
  const filas = []; plan.conts.forEach((x, i) => x.porItem.forEach((nC, it) => filas.push([i + 1, it, nC])));
  if (!filas.length) return '<p class="small muted">Sin carga con estos filtros.</p>';
  return `<div class="tw" role="region" tabindex="0" aria-label="Plan de carga" style="max-height:320px"><table class="tbl"><thead><tr><th>Cont.</th><th class="l">Producto</th><th class="l">Presentación</th><th>Cajas</th><th>Piezas</th><th class="l">Caja (cm)</th><th>Kg por caja</th></tr></thead><tbody>
    ${filas.map(([i, it, nC]) => `<tr><td>${i}</td><td class="l" style="white-space:normal">${esc(descB(it.c))}</td><td class="l">${esc(cNom(it.c))}</td><td>${fN(nC)}</td><td>${fN(nC * it.pzCaja)}</td><td class="l">${nf.format(it.largo / 10)} × ${nf.format(it.ancho / 10)} × ${nf.format(it.alto / 10)}${etiquetaMedida(it)}</td><td>${nf1.format(it.peso)}</td></tr>`).join('')}
    </tbody></table></div>${plan.noCaben.length ? `<p class="aviso" style="margin-top:8px">No caben por medida en este contenedor: ${plan.noCaben.map(i => esc(descB(i.c))).join(', ')}.</p>` : ''}`;
}

/* ---------- escena 3D o 2D (núcleo al final del archivo) ----------
   081-CONT: N3.pintarVista elige 3D o 2D (elección guardada; 2D en celular, sin WebGL o si three.js no carga). El nombre dibujar3D
   queda por compatibilidad. three.js solo se descarga si se dibuja en 3D. */
async function dibujar3D(plan) {
  const el = $('#c3-escena'); if (!el) return;
  if (C3.escena) { C3.escena.destruir(); C3.escena = null; }
  const h = await N3.pintarVista(el, plan, plan.conts[C3.idx], { btn: $('#c3-anim'), tip: $('#c3-tip'), redibujar: () => dibujar3D(C3.plan), vigente: () => C3.plan === plan && $('#c3-escena') === el,
    tipHtml: (it, nC, k) => `<b>${esc(descB(it.c))}</b><span>${esc(cNom(it.c))}</span>${N3.lineasCaja(it, nC)}${capacidadBI(it.c.cod, k.id) ? `<span>Capacidad BI: ${fN(capacidadBI(it.c.cod, k.id).cajas)} cajas de este producto por contenedor</span>` : ''}` });
  if (h) C3.escena = h;
}

/* ======================================================================================================
   Núcleo 3D sin dependencias del portal del KAM (25-nov, módulo de órdenes de exportación): plan de carga por paredes y escena three.js.
   Es una declaración de función: existe antes de que se ejecute el resto del portal. El módulo de órdenes (app_4_ordenes.js, solo en la
   web) lo pide con window.iniciarPortal('nucleo3D') sin cargar los datos de un KAM; ver la primera línea de app_1_base.js.
   ops de escena3D: { btn: botón de animación, tip: caja del tooltip, tipHtml(it, cajasEnEste, contenedor) → HTML }.
   ====================================================================================================== */
function nucleo3D() {
  const MOV_REDUCIDO = () => !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  let tres = null;
  async function cargarTres() {
    if (tres) return tres;
    const [THREE, oc] = await Promise.all([import('three'), import('three/addons/controls/OrbitControls.js')]);      // import map de la plantilla
    return (tres = { THREE, OrbitControls: oc.OrbitControls });
  }
/* plan de carga por paredes con columnas mixtas: una pared tiene la profundidad de su primera caja; dentro de la pared se arman columnas
   a lo ancho y cada columna se apila hasta la altura útil, mezclando productos si la caja cabe (más angosta y no más profunda que la pared).
   Las cajas solo giran sobre su base (nunca se acuestan). Se carga del fondo hacia la puerta; con más peso que la carga máxima se abre otro contenedor. */
function empacar(items, k, factor) {
  const L = k.largo, W = k.ancho, H = k.alto, Pm = k.pesoMax || Infinity, conts = [], noCaben = [], Vutil = L * W * H * (factor || 1);      // factor de llenado de BI (T_PARAMETROS_EXPORTACION)
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
function escena3D(T, el, plan, cont, ops) {
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
  // 081-CONT · cotas del contenedor: UN LineSegments (largo, ancho, alto y sus topes) y 4 rótulos HTML fijos + 1 dinámico; nunca uno por caja
  const dC = 0.22, tp = 0.07, zC = Wm / 2 + dC, xC = Lm + dC, segC = [], L2 = (a, b) => segC.push(...a, ...b);
  L2([0, 0, zC], [Lm, 0, zC]); L2([0, 0, Wm / 2], [0, 0, zC + tp]); L2([Lm, 0, Wm / 2], [Lm, 0, zC + tp]);                                  // largo, al pie del costado
  L2([xC, 0, -Wm / 2], [xC, 0, Wm / 2]); L2([Lm, 0, -Wm / 2], [xC + tp, 0, -Wm / 2]); L2([Lm, 0, Wm / 2], [xC + tp, 0, Wm / 2]);          // ancho, frente a la puerta
  L2([0, 0, zC], [0, Hm, zC]); L2([0, Hm, Wm / 2], [0, Hm, zC + tp]);                                                                    // alto, esquina del fondo
  g0.add(new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(segC, 3)), new THREE.LineBasicMaterial({ color: '#46535C' })));
  const capa = document.createElement('div'); capa.className = 'k81-rotulos'; capa.setAttribute('aria-hidden', 'true'); el.appendChild(capa);
  const rot = (txt, x, y, z, cls) => { const d = document.createElement('span'); d.className = 'k81-rot' + (cls ? ' ' + cls : ''); d.textContent = txt; capa.appendChild(d); return { d, p: new THREE.Vector3(x - Lm / 2, y, z) }; };
  const rotulos = [rot('largo ' + m2K(Lm) + ' m', Lm / 2, 0, zC), rot('ancho ' + m2K(Wm) + ' m', xC, 0, 0), rot('alto ' + m2K(Hm) + ' m', 0, Hm / 2, zC),
    rot('puerta ' + m2K(pA) + ' × ' + m2K(pH) + ' m', Lm, pH + 0.12, 0, 'k81-rot-p')];
  const rCaja = rot('', 0, 0, 0, 'k81-rot-caja'); rCaja.d.hidden = true;
  const marcoCaja = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1)), new THREE.LineBasicMaterial({ color: '#14232C' })); marcoCaja.visible = false; g0.add(marcoCaja);
  const Vp = new THREE.Vector3(), Pc = new THREE.Vector3();
  function rotular() {      // proyecta 4-5 puntos por cuadro (solo cuando se dibuja: render a demanda)
    const w = el.clientWidth, h = el.clientHeight;
    for (const r of sel >= 0 ? rotulos.concat([rCaja]) : rotulos) {
      Vp.copy(r.p).project(camera);
      const fuera = Vp.z > 1 || Math.abs(Vp.x) > 1.6 || Math.abs(Vp.y) > 1.6;      // un poco fuera del cuadro: se pega al borde en vez de desaparecer
      r.d.style.visibility = fuera ? 'hidden' : '';
      if (fuera) continue;
      if (!r.w) r.w = r.d.offsetWidth || 80;      // ancho medido una vez por rótulo (el de la caja, al cambiar de caja)
      const px = Math.max(r.w / 2 + 2, Math.min(w - r.w / 2 - 2, (Vp.x + 1) / 2 * w)), py = Math.max(11, Math.min(h - 11, (1 - Vp.y) / 2 * h));
      r.d.style.transform = `translate(${px.toFixed(1)}px,${py.toFixed(1)}px) translate(-50%,-50%)`;
    }
  }
  let sel = -1, hoverEv = null;
  const perf = { cuadros: 0, msRender: 0, animCuadros: 0, animFps: null, rayos: 0, msRayo: 0, ultimo: -1 };
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
    if (anim) { anim(t); perf.animCuadros++; }
    if (hoverEv) { const a0 = performance.now(), i = rayo(hoverEv); perf.rayos++; perf.msRayo += performance.now() - a0; perf.ultimo = i; hoverEv = null; if (i !== sel) seleccionar(i); }      // 081-CONT: hover coalescido, un rayo por cuadro
    const mov = controls.update();
    const a = performance.now(); renderer.render(scene, camera); rotular(); perf.msRender += performance.now() - a; perf.cuadros++;
    if (anim || mov || vivo > 0) { vivo = Math.max(0, vivo - 1); raf = requestAnimationFrame(cuadro); }
  }
  const pedir = (frames = 2) => { vivo = Math.max(vivo, frames); if (!raf && !document.hidden) raf = requestAnimationFrame(cuadro); };
  const alOcultar = () => { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else pedir(2); };      // 081-CONT: pestaña oculta = sin cuadros
  document.addEventListener('visibilitychange', alOcultar);
  function camara(v) {      // encuadra todo el contenedor según el campo de visión y el ancho de la pantalla
    const d0 = vistas[v] || vistas['34'], len = Math.hypot(...d0), fov = camera.fov * Math.PI / 180, fovH = 2 * Math.atan(Math.tan(fov / 2) * camera.aspect);
    const R = Math.hypot(Lm, Hm, Wm) / 2, dist = R / Math.sin(Math.min(fov, fovH) / 2) * (v === 'puerta' ? 0.55 : v === 'planta' ? 0.62 : 0.72);
    camera.position.set(d0[0] / len * dist, Hm * 0.3 + d0[1] / len * dist, d0[2] / len * dist);
    controls.target.set(0, Hm * 0.3, 0); controls.maxDistance = dist * 2.2; controls.update(); pedir();
  }
  controls.addEventListener('change', () => pedir(2));
  // animación de carga: las cajas entran por la puerta en orden de carga; con movimiento reducido se muestra la carga final.
  // El botón la omite mientras corre (control visible para detener el movimiento) y la repite cuando termina.
  const btn = ops.btn || null;
  function cargar(animar) {
    if (!n) { pedir(); return; }
    if (!animar || MOV_REDUCIDO()) { anim = null; fin.forEach((p, i) => poner(i, p)); mesh.instanceMatrix.needsUpdate = true; mesh.computeBoundingSphere(); if (btn) btn.textContent = 'Repetir carga'; pedir(); return; }
    const dur = 420, paso = Math.min(14, 2600 / n), t0 = performance.now(), afuera = Lm + 1.2;
    if (btn) btn.textContent = 'Omitir animación';
    perf.animCuadros = 0; perf.animFps = null;
    anim = t => {
      let listo = true;
      for (let i = 0; i < n; i++) {
        const u = Math.min(1, Math.max(0, (t - t0 - i * paso) / dur)); if (u < 1) listo = false;
        const e = 1 - Math.pow(1 - u, 3), f = fin[i];
        if (u === 0) Pv.set(afuera + 3, f.y, f.z); else Pv.set(f.x + (afuera - f.x) * (1 - e), f.y + 0.25 * (1 - e), f.z);
        poner(i, Pv);
      }
      mesh.instanceMatrix.needsUpdate = true;
      if (listo) { anim = null; mesh.computeBoundingSphere(); perf.animFps = (perf.animCuadros + 1) / Math.max(0.001, (t - t0) / 1000); if (btn) btn.textContent = 'Repetir carga'; }
    };
    pedir();
  }
  // selección: tooltip con producto, presentación, cajas y piezas en este contenedor
  const ray = new THREE.Raycaster(), ptr = new THREE.Vector2(), tip = ops.tip || null;
  function rayo(ev) {
    const r = renderer.domElement.getBoundingClientRect(); ptr.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ptr, camera); const h = n ? ray.intersectObject(mesh)[0] : null;
    return h && h.instanceId != null ? h.instanceId : -1;
  }
  // 081-CONT: la caja en hover o tocada se marca con un contorno y UN rótulo con sus medidas (L × A × H cm)
  function seleccionar(i) {
    sel = i;
    if (i < 0) { marcoCaja.visible = false; rCaja.d.hidden = true; return; }
    const b = cajas[i]; mesh.getMatrixAt(i, M); Pc.setFromMatrixPosition(M);
    marcoCaja.position.copy(Pc); marcoCaja.scale.set(b.l / 1000, b.h / 1000, b.w / 1000); marcoCaja.visible = true;
    rCaja.p.set(Pc.x - Lm / 2, Pc.y + b.h / 2000 + 0.06, Pc.z);
    rCaja.d.textContent = cmCajaK(b.it) + (tipoMedidaK(b.it) !== 'real' ? ' · ' + textoMedidaK(b.it) : '');
    rCaja.d.hidden = false; rCaja.w = 0;
  }
  function tocar(ev) {
    const i = rayo(ev); seleccionar(i); pedir(1);
    if (i < 0 || !tip) { if (tip) tip.hidden = true; return; }
    const it = cajas[i].it, nC = cont.porItem.get(it) || 0;
    tip.innerHTML = ops.tipHtml ? ops.tipHtml(it, nC, k) : '';
    ponerTipK(tip, ev.clientX, ev.clientY);
  }
  let abajo = null;
  renderer.domElement.addEventListener('pointerdown', ev => { abajo = [ev.clientX, ev.clientY]; });
  renderer.domElement.addEventListener('pointerup', ev => { if (abajo && Math.hypot(ev.clientX - abajo[0], ev.clientY - abajo[1]) < 6) tocar(ev); abajo = null; });
  renderer.domElement.addEventListener('pointermove', ev => { if (ev.pointerType !== 'mouse' || ev.buttons) return; hoverEv = ev; pedir(1); });
  renderer.domElement.addEventListener('pointerleave', ev => { if (ev.pointerType !== 'mouse') return; hoverEv = null; if (sel >= 0) { seleccionar(-1); pedir(1); } });
  const ajustar = () => { const w = el.clientWidth || 600, h = el.clientHeight || 420; renderer.setSize(w, h, false); renderer.domElement.style.width = '100%'; renderer.domElement.style.height = '100%'; camera.aspect = w / h; camera.updateProjectionMatrix(); pedir(); };
  const ro3 = new ResizeObserver(ajustar); ro3.observe(el);
  ajustar(); camara('34'); cargar(true);
  return {
    camara, animando: () => !!anim, recargar: () => cargar(!anim), modo: '3d',
    // 081-CONT: al salir se libera todo: geometrías, materiales, buffers de instancias, el contexto WebGL y los rótulos
    destruir() { cancelAnimationFrame(raf); raf = 0; document.removeEventListener('visibilitychange', alOcultar); ro3.disconnect(); controls.dispose(); mesh.dispose(); scene.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) [].concat(o.material).forEach(m => m.dispose()); }); renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove(); capa.remove(); },
    medir() { const i = renderer.info; return { cajas: n, llamadas: i.render.calls, triangulos: i.render.triangles, geometrias: i.memory.geometries, texturas: i.memory.textures, cuadros: perf.cuadros, msRenderProm: perf.cuadros ? perf.msRender / perf.cuadros : null, fpsAnimacion: perf.animFps, rayos: perf.rayos, msRayoProm: perf.rayos ? perf.msRayo / perf.rayos : null, ultimoRayo: perf.ultimo }; },
    medirGiro(ms = 3000) {      // solo para la medición del informe: gira la cámara alrededor de la carga y cuenta cuadros
      return new Promise(res => {
        const off0 = camera.position.clone().sub(controls.target), eje = new THREE.Vector3(0, 1, 0), t0 = performance.now(); let nC = 0, msR = 0;
        const paso = t => {
          camera.position.copy(controls.target).add(off0.clone().applyAxisAngle(eje, (t - t0) / ms * Math.PI * 2)); camera.lookAt(controls.target);
          const a = performance.now(); renderer.render(scene, camera); rotular(); msR += performance.now() - a; nC++;
          if (t - t0 < ms) requestAnimationFrame(paso); else res({ fps: nC / ((t - t0) / 1000), msRenderProm: msR / nC, cuadros: nC });
        };
        requestAnimationFrame(paso);
      });
    },
  };
}
/* ------------------------------------------------------------------------------------------------------------------------------
   081-CONT · vista 3D o 2D, medidas en pantalla y regla de medidas de la caja. Todo vive dentro del núcleo (sin funciones del portal
   del KAM): el módulo de órdenes lo usa igual. Estrategia de rendimiento (INFORME_081_CONTENEDOR.md):
   · three.js solo se descarga al elegir 3D (import() dinámico de cargarTres); en 2D no se pide nada a la red.
   · 3D: una InstancedMesh con color por instancia (1 llamada de dibujo para todas las cajas), render a demanda, sin cuadros con la
     pestaña oculta, hover con un rayo por cuadro, 5 rótulos HTML como máximo y destruir() libera geometrías, buffers y el contexto WebGL.
   · 2D: <canvas> (no SVG): un contenedor lleno trae 2.000–3.500 cajas por vista; en SVG serían miles de nodos en el DOM. Se dibuja
     UNA vez por cambio (filtro, contenedor o ancho); el resaltado del mouse va en un segundo canvas encima y no redibuja la carga.
   ------------------------------------------------------------------------------------------------------------------------------ */
const K81 = { clave: 'k81-vista-contenedor', webgl: null, sesion: null, ms2D: null };
const nfK = new Intl.NumberFormat('es-CR', { maximumFractionDigits: 0 }), nfK1 = new Intl.NumberFormat('es-CR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const nfK2 = new Intl.NumberFormat('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), nfK3 = new Intl.NumberFormat('es-CR', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
const escK = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pctK = v => nfK.format(v * 100) + ' %';
function m2K(v) { return nfK2.format(v); }
/* regla única de medidas (3D, 2D, tooltip y leyenda): largo × ancho × alto de T_EMPAQUES si vienen las tres; si no, el cubo del m³
   por caja, rotulado "medida estimada (cubo de m³)". Los dos módulos marcan el ítem: órdenes con it.medida, KAM con it.cubo/estimada. */
const tipoMedidaK = it => it.medida || (it.ejemplo ? 'ejemplo' : it.cubo ? 'cubo' : it.estimada ? 'estimada' : 'real');
const TXT_MEDIDA_K = { real: '', cubo: 'medida estimada (cubo de m³)', estimada: 'sin medidas ni m³: tamaño estimado', ejemplo: 'medida de ejemplo' };
const textoMedidaK = it => TXT_MEDIDA_K[tipoMedidaK(it)] || '';
const cmCajaK = it => `${nfK.format(it.largo / 10)} × ${nfK.format(it.ancho / 10)} × ${nfK.format(it.alto / 10)} cm`;
function lineasCaja(it, nC) {      // líneas comunes del tooltip: medidas, m³, cajas y piezas
  const m3 = it.largo * it.ancho * it.alto / 1e9, tm = textoMedidaK(it);
  return `<span>Caja ${cmCajaK(it)}${tm ? ` · <i>${escK(tm)}</i>` : ''}</span><span>${nfK3.format(m3)} m³ por caja · ${nfK1.format(m3 * nC)} m³ en este contenedor</span>`
    + `<span>${nfK.format(nC)} cajas en este contenedor${it.pzCaja ? ' · ' + nfK.format(nC * it.pzCaja) + ' pz' : ''} · ${nfK.format(it.cajas)} cajas en total</span>`;
}
function notaLeyenda(cont) {      // la leyenda dice qué medidas son estimadas
  if (!cont) return '';
  const its = [...cont.porItem.keys()], cubo = its.filter(it => tipoMedidaK(it) === 'cubo').length, otras = its.filter(it => !['real', 'cubo'].includes(tipoMedidaK(it))).length;
  if (!cubo && !otras) return `<span class="k81-ley-est">Medidas de caja reales (T_EMPAQUES)</span>`;
  return `<span class="k81-ley-est"><i class="k81-sw-est" aria-hidden="true"></i>${cubo ? (cubo === its.length ? 'Todas las cajas: medida estimada (cubo de m³)' : `${nfK.format(cubo)} de ${nfK.format(its.length)} productos: medida estimada (cubo de m³)`) : ''}${cubo && otras ? ' · ' : ''}${otras ? `${nfK.format(otras)} con tamaño estimado (sin medidas ni m³)` : ''}</span>`;
}
function hayWebGL() {
  if (K81.webgl != null) return K81.webgl;
  try { const c = document.createElement('canvas'), g = c.getContext('webgl2') || c.getContext('webgl'); K81.webgl = !!g; const x = g && g.getExtension('WEBGL_lose_context'); if (x) x.loseContext(); }
  catch (e) { K81.webgl = false; }
  return K81.webgl;
}
const esCelular = () => !!(window.matchMedia && matchMedia('(max-width: 760px)').matches);
function modo(v) {      // sin argumento: el modo pedido (lo elegido antes; si nunca se eligió, 2D en celular y 3D en escritorio)
  if (v === '2d' || v === '3d') { K81.sesion = v; try { localStorage.setItem(K81.clave, v); } catch (e) { /* sin almacenamiento: vale para esta visita */ } return v; }
  if (K81.sesion) return K81.sesion;
  let g = null; try { g = localStorage.getItem(K81.clave); } catch (e) { g = null; }
  return g === '2d' || g === '3d' ? g : (esCelular() ? '2d' : '3d');
}
const barraHtml = () => { const m = modo(); return `<div class="k81-barra"><span class="k81-llenado"></span><div class="seg k81-modo" role="group" aria-label="Tipo de vista">`
  + `<button type="button" data-k81modo="3d" aria-pressed="${m === '3d'}">3D</button><button type="button" data-k81modo="2d" aria-pressed="${m === '2d'}">2D</button></div></div>`
  + `<p class="aviso info k81-aviso" role="status" hidden></p>`; };
function ponerTipK(tip, cx, cy) {      // tooltip dentro de su contenedor, sin salirse de los bordes
  tip.hidden = false;
  const host = tip.offsetParent || tip.parentElement, r = host.getBoundingClientRect(), tw = tip.offsetWidth || 240, th = tip.offsetHeight || 60;
  tip.style.left = Math.max(4, Math.min(r.width - tw - 4, cx - r.left + 12)) + 'px';
  tip.style.top = Math.max(4, Math.min(r.height - th - 4, cy - r.top + 12)) + 'px';
}
const usadoK = cont => (cont ? cont.cajas.reduce((m, b) => Math.max(m, b.x + b.l / 2), 0) : 0);
function marcar(el, m, plan, cont, aviso, ops) {
  const box = el.closest('.c3-escena-box') || el.parentElement, panel = el.closest('.c3') || box; if (!box) return;
  panel.dataset.k81vista = m;
  box.querySelectorAll('button[data-k81modo]').forEach(b => {
    b.setAttribute('aria-pressed', b.dataset.k81modo === m);
    if (b.dataset.k81modo === '3d') { b.disabled = !hayWebGL(); b.title = b.disabled ? 'Este equipo no puede dibujar 3D (sin WebGL)' : ''; }
  });
  const g = box.querySelector('.k81-modo');
  if (g && ops.redibujar) g.onclick = ev => { const b = ev.target.closest('button[data-k81modo]'); if (!b || b.disabled || b.getAttribute('aria-pressed') === 'true') return; modo(b.dataset.k81modo); ops.redibujar(); };
  const av = box.querySelector('.k81-aviso'); if (av) { av.hidden = !aviso; av.textContent = aviso || ''; }
  const ll = box.querySelector('.k81-llenado');
  if (ll) { const k = plan.k, u = usadoK(cont); ll.innerHTML = cont ? `Llenado: <b>${pctK(cont.vol / plan.vol)}</b> del volumen · <b>${pctK(u / k.largo)}</b> del largo (${m2K(u / 1000)} de ${m2K(k.largo / 1000)} m)` : 'Sin carga con estos filtros'; }
}
/* punto de entrada de los dos módulos: dibuja en 3D o 2D según la elección y devuelve la escena ({ destruir, camara, recargar, medir }).
   ops: tip, tipHtml(it, cajasEnEste, contenedor), btn (animación 3D), redibujar() (al cambiar 3D/2D), vigente() (sigue siendo la vista pedida) */
async function pintarVista(el, plan, cont, ops) {
  const turno = el._k81t = (el._k81t || 0) + 1, vale = () => el._k81t === turno && (!ops.vigente || ops.vigente());
  let m = modo(), aviso = '', T = null;
  if (m === '3d' && !hayWebGL()) { m = '2d'; aviso = 'Este equipo no puede dibujar 3D (sin WebGL): se muestra la vista 2D.'; }
  if (m === '3d') {
    marcar(el, '3d', plan, cont, '', ops);
    el.innerHTML = '<p class="c3-msg">Cargando la vista 3D…</p>';
    try { T = await cargarTres(); } catch (e) { m = '2d'; aviso = 'No se pudo descargar la librería 3D: se muestra la vista 2D.'; }
    if (!vale()) return null;
  }
  if (m === '3d') {
    try { marcar(el, '3d', plan, cont, '', ops); const h = escena3D(T, el, plan, cont, ops); el._k81 = h; return h; }
    catch (e) { m = '2d'; aviso = 'Este navegador no pudo dibujar 3D: se muestra la vista 2D.'; }
  }
  marcar(el, '2d', plan, cont, aviso, ops);
  const h = escena2D(el, plan, cont, ops); el._k81 = h; return h;
}
/* vista 2D: planta (desde arriba) y lateral (desde el costado), a escala y con las MISMAS posiciones de empacar() que el 3D.
   Ancho ≥ 560 px: el largo va horizontal y las vistas una debajo de la otra. Más angosto (celular): el largo va hacia abajo (fondo
   arriba, puerta abajo) y las dos vistas quedan lado a lado: casi el doble de escala en 390 px. */
function escena2D(el, plan, cont, ops) {
  const k = plan.k, L = k.largo, W = k.ancho, H = k.alto, cajas = cont ? cont.cajas : [], n = cajas.length, tip = ops.tip || null;
  const pA = Math.min(W, k.puertaAncho || W), pH = Math.min(H, k.puertaAlto || H), usado = usadoK(cont);
  el.innerHTML = ''; el.style.touchAction = 'pan-y'; el.style.minHeight = '0';
  const cv = document.createElement('canvas'), cvR = document.createElement('canvas');
  cv.className = 'k81-lienzo'; cvR.className = 'k81-lienzo k81-resalte';
  [cv, cvR].forEach(c => { c.setAttribute('aria-hidden', 'true'); el.appendChild(c); });
  // orden del pintor, una sola vez: en planta la caja más alta tapa a las de abajo; en el lateral, la más cercana tapa a las del fondo
  const ordP = Int32Array.from(cajas.map((b, i) => i).sort((a, b) => (cajas[a].y + cajas[a].h / 2) - (cajas[b].y + cajas[b].h / 2)));
  const ordL = Int32Array.from(cajas.map((b, i) => i).sort((a, b) => cajas[a].z - cajas[b].z));
  const tonos = new Map();
  const tono = (hex, t) => {      // color de la caja aclarado t (0 = color pleno); en caché por color y escalón
    const kk = hex + t; let c = tonos.get(kk);
    if (!c) { const ok = /^#[0-9a-f]{6}$/i.test(hex), x = ok ? parseInt(hex.slice(1), 16) : 0x8a949c, mx = v => Math.round(v + (255 - v) * t); c = `rgb(${mx(x >> 16 & 255)},${mx(x >> 8 & 255)},${mx(x & 255)})`; tonos.set(kk, c); }
    return c;
  };
  let V = [], hits = [], dpr = 1, ancho0 = 0, alto0 = 0;
  const R = (v, u0, u1, a0, a1) => v.vert ? [v.ox + a0 * v.s, v.oy + u0 * v.s, (a1 - a0) * v.s, (u1 - u0) * v.s] : [v.ox + u0 * v.s, v.oy + a0 * v.s, (u1 - u0) * v.s, (a1 - a0) * v.s];
  const aDe = (v, b) => v.id === 'planta' ? [b.z + W / 2 - b.w / 2, b.z + W / 2 + b.w / 2] : v.vert ? [b.y - b.h / 2, b.y + b.h / 2] : [H - b.y - b.h / 2, H - b.y + b.h / 2];
  function disposicion(w) {
    const vert = w < 560;
    if (!vert) {
      const mL = 40, mR = 86, tit = 20, cS = 26, gap = 16, esc = 44;
      const s = Math.min((w - mL - mR) / L, (Math.max(420, (window.innerHeight || 800) * 0.9) - (tit * 2 + cS * 2 + gap + esc)) / (W + H));
      const yP = tit + cS, yL = yP + W * s + gap + tit;
      V = [{ id: 'planta', titulo: 'Planta · vista desde arriba', span: W, ox: mL, oy: yP, s, vert }, { id: 'lateral', titulo: 'Lateral · vista desde el costado', span: H, ox: mL, oy: yL, s, vert }];
      return { h: yL + H * s + cS + esc, s, vert };
    }
    const mT = 52, mB = 74, mIz = 30, gapH = 40, mDe = 10;
    const s = Math.min((w - mIz - gapH - mDe) / (W + H), (Math.max(480, (window.innerHeight || 800) * 1.15) - mT - mB) / L);
    V = [{ id: 'planta', titulo: 'Planta', span: W, ox: mIz, oy: mT, s, vert }, { id: 'lateral', titulo: 'Lateral', span: H, ox: mIz + W * s + gapH, oy: mT, s, vert }];
    return { h: mT + L * s + mB, s, vert };
  }
  function cota(g, x1, y1, x2, y2, txt) {
    const vt = Math.abs(x2 - x1) < Math.abs(y2 - y1), t = 4;
    g.strokeStyle = '#46535C'; g.lineWidth = 1; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2);
    if (vt) { g.moveTo(x1 - t, y1); g.lineTo(x1 + t, y1); g.moveTo(x2 - t, y2); g.lineTo(x2 + t, y2); } else { g.moveTo(x1, y1 - t); g.lineTo(x1, y1 + t); g.moveTo(x2, y2 - t); g.lineTo(x2, y2 + t); }
    g.stroke();
    g.save(); g.translate((x1 + x2) / 2, (y1 + y2) / 2); if (vt) g.rotate(-Math.PI / 2);
    const tw = g.measureText(txt).width + 8; g.fillStyle = '#F4F7F9'; g.fillRect(-tw / 2, -8, tw, 16); g.fillStyle = '#14232C'; g.textAlign = 'center'; g.fillText(txt, 0, 0.5); g.restore();
  }
  function dibujar() {
    const t0 = performance.now(), w = Math.max(280, el.clientWidth || 600), lay = disposicion(w), hh = Math.ceil(lay.h);
    dpr = Math.min(window.devicePixelRatio || 1, 2); el.style.height = hh + 'px'; alto0 = hh;
    [cv, cvR].forEach(c => { c.width = Math.round(w * dpr); c.height = Math.round(hh * dpr); c.style.width = w + 'px'; c.style.height = hh + 'px'; });
    const g = cv.getContext('2d', { alpha: false }); g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.fillStyle = '#F4F7F9'; g.fillRect(0, 0, w, hh); g.textBaseline = 'middle';
    const F = '"Segoe UI",system-ui,-apple-system,Roboto,Arial,sans-serif';
    hits = V.map(v => {
      const [x, y, rw, rh] = R(v, 0, L, 0, v.span);
      g.font = '600 12.5px ' + F; g.fillStyle = '#14232C'; g.textAlign = 'left'; g.fillText(v.titulo, v.vert ? x : 0, v.vert ? 12 : y - 34 + 8);
      g.fillStyle = '#FFFFFF'; g.fillRect(x, y, rw, rh);
      const ord = v.id === 'planta' ? ordP : ordL, rect = new Float32Array(ord.length * 4);
      g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 1;
      for (let j = 0; j < ord.length; j++) {
        const b = cajas[ord[j]], [a0, a1] = aDe(v, b), r = R(v, b.x - b.l / 2, b.x + b.l / 2, a0, a1);
        const t = v.id === 'planta' ? 0.5 * (1 - (b.y + b.h / 2) / H) : 0.55 * (1 - (b.z + W / 2 + b.w / 2) / W);      // más clara = más baja (planta) o más al fondo (lateral)
        g.fillStyle = tono(b.it.color, Math.round(t * 10) / 10); g.fillRect(r[0], r[1], r[2], r[3]);
        if (r[2] > 4 && r[3] > 4) g.strokeRect(r[0] + 0.5, r[1] + 0.5, r[2] - 1, r[3] - 1);
        rect[j * 4] = r[0]; rect[j * 4 + 1] = r[1]; rect[j * 4 + 2] = r[2]; rect[j * 4 + 3] = r[3];
      }
      g.strokeStyle = '#5D6A73'; g.lineWidth = 1.5; g.strokeRect(x, y, rw, rh);
      // largo usado: línea punteada y texto en la zona vacía
      if (usado > 0 && usado < L - 5) {
        const [ux, uy] = v.vert ? [x, y + usado * v.s] : [x + usado * v.s, y];
        g.save(); g.setLineDash([4, 3]); g.strokeStyle = '#0A78AE'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(ux, uy); g.lineTo(v.vert ? x + rw : ux, v.vert ? uy : y + rh); g.stroke(); g.restore();
        if (v.id === 'lateral' || v.vert) { g.font = '11.5px ' + F; g.fillStyle = '#0A78AE'; g.textAlign = 'left'; const tx = 'usado ' + m2K(usado / 1000) + ' m';
          if (v.vert) { if (v.id === 'planta' && (L - usado) * v.s > 18) g.fillText(tx, x + 3, uy + 10); }
          else if ((L - usado) * v.s > g.measureText(tx).width + 10) g.fillText(tx, ux + 5, y + 11); else { const tw = g.measureText(tx).width; g.fillStyle = 'rgba(255,255,255,.92)'; g.fillRect(ux - tw - 9, y + 3, tw + 6, 16); g.fillStyle = '#0A78AE'; g.textAlign = 'right'; g.fillText(tx, ux - 5, y + 11); } }
      }
      // puerta: trazo grueso en el extremo de carga, con su medida
      const pa = v.id === 'planta' ? [(W - pA) / 2, (W + pA) / 2] : v.vert ? [0, pH] : [H - pH, H];
      g.strokeStyle = '#0A78AE'; g.lineWidth = 4; g.beginPath();
      if (v.vert) { g.moveTo(x + pa[0] * v.s, y + rh + 2); g.lineTo(x + pa[1] * v.s, y + rh + 2); } else { g.moveTo(x + rw + 2, y + pa[0] * v.s); g.lineTo(x + rw + 2, y + pa[1] * v.s); }
      g.stroke(); g.font = '600 11.5px ' + F; g.fillStyle = '#0A78AE';
      const pTxt = (v.id === 'planta' ? 'ancho ' : 'alto ') + m2K((v.id === 'planta' ? pA : pH) / 1000) + ' m';
      if (v.vert) { g.textAlign = 'center'; g.fillText('Puerta', x + rw / 2, y + rh + 14); g.font = '11px ' + F; g.fillText(pTxt, x + rw / 2, y + rh + 28); }
      else { g.textAlign = 'left'; g.fillText('Puerta', x + rw + 10, y + rh / 2 - 8); g.font = '11px ' + F; g.fillText(pTxt, x + rw + 10, y + rh / 2 + 8); }
      // cotas interiores del contenedor
      g.font = '12px ' + F;
      if (v.vert) { cota(g, x - 14, y, x - 14, y + rh, 'largo ' + m2K(L / 1000) + ' m'); cota(g, x, y - 12, x + rw, y - 12, m2K(v.span / 1000) + ' m'); g.font = '11px ' + F; g.fillStyle = '#5D6A73'; g.textAlign = 'left'; g.fillText(v.id === 'planta' ? 'ancho' : 'alto (piso a la izq.)', x, 27); }
      else { if (v.id === 'planta') cota(g, x, y - 12, x + rw, y - 12, 'largo ' + m2K(L / 1000) + ' m'); else cota(g, x, y + rh + 13, x + rw, y + rh + 13, 'largo ' + m2K(L / 1000) + ' m');
        cota(g, x - 14, y, x - 14, y + rh, (v.id === 'planta' ? 'ancho ' : 'alto ') + m2K(v.span / 1000) + ' m'); }
      return { v, ord, rect, x, y, rw, rh };
    });
    // escala gráfica
    const s = lay.s, mt = [0.5, 1, 2, 5].find(p => p * 1000 * s >= 34) || 5, seg = mt * 1000 * s, nT = Math.max(1, Math.min(4, Math.floor(Math.min(w * 0.45, 260) / seg)));
    const ex = V[0].ox, ey = hh - 22; g.lineWidth = 1; g.strokeStyle = '#14232C';
    for (let i = 0; i < nT; i++) { g.fillStyle = i % 2 ? '#FFFFFF' : '#14232C'; g.fillRect(ex + i * seg, ey, seg, 6); g.strokeRect(ex + i * seg + 0.5, ey + 0.5, seg - 1, 5); }
    g.font = '11px ' + F; g.fillStyle = '#46535C'; g.textAlign = 'center';
    for (let i = 0; i <= nT; i++) g.fillText(nfK1.format(i * mt).replace(/,0$/, '') + (i === nT ? ' m' : ''), ex + i * seg, ey + 15);
    g.textAlign = 'left'; g.fillText('escala', ex + nT * seg + 20, ey + 3);
    K81.ms2D = performance.now() - t0;
  }
  // hover / toque: el resaltado va en el canvas de arriba; la carga no se redibuja
  let pend = null, rafH = 0, actual = -1;
  function buscar(cx, cy) {
    const r = cv.getBoundingClientRect(), x = cx - r.left, y = cy - r.top;
    for (const h of hits) {
      if (x < h.x || y < h.y || x > h.x + h.rw || y > h.y + h.rh) continue;
      for (let j = h.ord.length - 1; j >= 0; j--) { const q = j * 4, R4 = h.rect; if (x >= R4[q] && x <= R4[q] + R4[q + 2] && y >= R4[q + 1] && y <= R4[q + 1] + R4[q + 3]) return h.ord[j]; }
      return -1;
    }
    return -1;
  }
  function resaltar(i, cx, cy) {
    if (i === actual && i >= 0) { if (tip && !tip.hidden) ponerTipK(tip, cx, cy); return; }
    actual = i;
    const g = cvR.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, cvR.width, cvR.height);
    if (i < 0) { if (tip) tip.hidden = true; return; }
    const it = cajas[i].it;
    g.strokeStyle = '#14232C'; g.lineWidth = 1.2;
    hits.forEach(h => { for (let j = 0; j < h.ord.length; j++) if (cajas[h.ord[j]].it === it) { const q = j * 4; g.strokeRect(h.rect[q] + 0.5, h.rect[q + 1] + 0.5, Math.max(1, h.rect[q + 2] - 1), Math.max(1, h.rect[q + 3] - 1)); } });
    g.lineWidth = 2.5; hits.forEach(h => { const j = h.ord.indexOf(i), q = j * 4; if (j >= 0) g.strokeRect(h.rect[q] - 1, h.rect[q + 1] - 1, h.rect[q + 2] + 2, h.rect[q + 3] + 2); });
    if (tip) { tip.innerHTML = ops.tipHtml ? ops.tipHtml(it, cont.porItem.get(it) || 0, k) : ''; ponerTipK(tip, cx, cy); }
  }
  const ac = new AbortController(), o = { signal: ac.signal };
  el.addEventListener('pointermove', ev => { if (ev.pointerType !== 'mouse') return; pend = ev; if (!rafH) rafH = requestAnimationFrame(() => { rafH = 0; const e = pend; pend = null; if (e) resaltar(buscar(e.clientX, e.clientY), e.clientX, e.clientY); }); }, o);
  el.addEventListener('pointerleave', ev => { if (ev.pointerType === 'mouse') { pend = null; resaltar(-1); } }, o);
  el.addEventListener('pointerup', ev => { if (ev.pointerType !== 'mouse') resaltar(buscar(ev.clientX, ev.clientY), ev.clientX, ev.clientY); }, o);
  const ro = new ResizeObserver(() => { const w = el.clientWidth; if (w && Math.abs(w - ancho0) > 1) { ancho0 = w; dibujar(); actual = -2; resaltar(-1); } });
  ancho0 = el.clientWidth; dibujar(); ro.observe(el);
  return {
    modo: '2d', camara() {}, recargar() {}, animando: () => false,
    destruir() { ro.disconnect(); ac.abort(); cancelAnimationFrame(rafH); cv.width = cv.height = cvR.width = cvR.height = 0; cv.remove(); cvR.remove(); el.style.height = ''; el.style.minHeight = ''; el.style.touchAction = ''; if (tip) tip.hidden = true; },
    medir: () => ({ cajas: n, msDibujo: K81.ms2D, alto: alto0, nodos: el.getElementsByTagName('*').length }),
    redibujar() { dibujar(); actual = -2; resaltar(-1); },
  };
}
  return { cargarTres, empacar, escena3D, escena2D, pintarVista, barraHtml, lineasCaja, notaLeyenda, modo, hayWebGL, textoMedida: textoMedidaK, tipoMedida: tipoMedidaK, cmCaja: cmCajaK };
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
  return `La venta de los últimos 3 meses (${fN1(p.d3 / f)} ${esc(uNom(p))}) va ${t == null ? 'sin base de comparación' : (t >= 0 ? 'arriba ' : 'abajo ') + fP(Math.abs(t)).replace('+', '') + ' contra el año anterior'}. Para ${ml(m0)} el pronóstico estimado propone <b>${fN1((p.alg[m0] || 0) / f)}</b> y el formulario vigente registra <b>${fN1(vigN)}</b>.${p.inv && dias(p) != null ? ` El distribuidor tiene inventario para <b>${diasTxt(dias(p))}</b>${invViejo(p.clase) ? ' (' + esc(viejoTxt(fechaInv(p.clase))) + ')' : ''}.` : ''}${sesgoProducto(p) != null ? ` En los últimos 12 meses el forecast de este producto estuvo <b>${fP(sesgoProducto(p))}</b> contra la venta real (meses con forecast).` : ''}`;
}
function bloqueCaptura(p, c) {
  const pr = precioU(p, c), desc = c.precio && c.precioFact ? 1 - c.precioFact / c.precio : null, av = c.avanceU != null ? c.avanceU : (c.cod === p.principal && c.pzPorU && p.avanceSellInPz && p.avanceSellInPz[MC] != null ? p.avanceSellInPz[MC] / c.pzPorU : null);
  let h = `<div class="cod"><div class="cod-nom"><b>${esc(descB(c))}</b>${nombreDist(p, c)}</div><div class="cod-h"><span class="muted">${esc(c.cod)}</span><span>${esc(cNom(c))}</span>
    <span class="pill kam">lista ${pr != null ? fC2(pr) : 'sin precio'}</span>
    ${c.precioFact ? `<span class="pill kam">facturado ${fC2(c.precioFact)}${desc != null ? ' · ' + nf.format(desc * 100) + ' % desc.' : ''}</span>` : ''}</div>
    <p class="small muted">${ICO.lock} ${ml(MC)} en curso: <b>${fN(vig(c, MC))}</b> ${esc(plural(presDe(c)))} (${OFICIAL_CURSO ? 'oficial' : 'vigente'}, no se cambia)${av != null ? ' · facturado al ' + esc(fechaCorta(D.avanceHasta)) + ': ' + fN1(av) : ''} · sell in 12 meses: ${fN(c.u12)} (${fN1((c.u12 || 0) / 12)} al mes)</p>
    ${K82_ANT.length || K82_SIG.length ? `<div class="k82-nav">${k82Boton('ant', 'chip')}${k82Boton('sig', 'chip')}</div>` : ''}
    <div class="meses${k82Tira() ? ' k82-tira' : ''}" data-k82-c="${esc(c.id)}">${k82MesesDet(p, c)}`;      // 082-MESES: anteriores + captura + siguientes
  h += `</div><div style="display:flex;gap:8px;flex-wrap:wrap">
    ${c.cod === p.principal && c.pzPorU ? `<button type="button" class="btn" data-usar-alg="${esc(c.id)}"${VENCIDO ? ' disabled' : ''}>Copiar el pronóstico estimado</button>` : ''}
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
  if (soloDirecto(p)) return 'Fuente: Facturación directa de Brinova' + (cl === 'PANAMA' ? ' a Supermercados Xtra (marca LIKE)' : ' a ' + cl) + ' (sell in), en ' + uNom(p);      // 0.7.1: la fuente es la del producto
  const o = origenProd(p), conDir = (o['sell in directo'] || 0) > 0;
  return 'Fuente: ' + base + (conDir && t !== 'sell in directo' ? ' + facturación directa a Supermercados Xtra' : '') + ', en ' + uNom(p);
}
function htmlOrigen(p) {
  const t = tipoDe(p.clase), dir = t === 'sell in directo', f = fac(p), L12 = MH.slice(-12), inc = INCOMP[p.clase] || [];
  const og = p.origenPz && Object.keys(p.origenPz).length ? p.origenPz : null, ogT = og ? Object.values(og).reduce((a, b) => a + b, 0) : 0;
  return `<div class="panel-h"><h2 id="or-t">Origen de la demanda</h2></div>
    <p class="origen-linea"><span>${esc(fuenteUnaLinea(p))}</span>${dir ? '' : nb('p_cierre', pill(p.cierre === 'OK' ? 'good' : 'warn', p.cierre === 'OK' ? 'cuadra con lo facturado' : p.cierre.toLowerCase()), `data-p="${esc(p.id)}"`)}</p>
    ${BI_DET('<p>' + fuenteLargaProd(p) + '.</p>', 'Detalle técnico de la fuente')}
    <details class="mas-info" style="margin-top:8px"><summary>Ver demanda y sell in por mes</summary><div style="margin-top:8px">
    ${og ? `<p class="prosa" style="margin-bottom:8px">Este producto, en 12 meses: ${Object.entries(og).sort((a, b) => b[1] - a[1]).map(([t, v]) => `<b>${esc((TIPO[t] || { c: t }).c)}</b> ${fN(v)} pz (${ogT ? nf.format(v / ogT * 100) : 0} %)`).join(' + ')}.</p>` : ''}
    <p class="aviso info solo-bi" style="margin-bottom:10px"><b>¿Qué demanda usa el pronóstico estimado (algoritmo)?</b> ${dir ? 'La facturación directa de Brinova: en este cliente es la demanda.' : t === 'sell out' ? 'El sell out (venta de las tiendas al consumidor). El sell in sirve para comprobar que los datos cuadran.' : 'El sell through: lo que ' + esc(p.clase) + ' le vende a sus clientes. El sell in (lo que Brinova le factura) sirve para comprobar que los datos cuadran.'}</p>
    <div class="tw" role="region" tabindex="0" aria-label="Demanda y sell in por mes" style="max-height:340px"><table class="tbl"><thead><tr><th class="l">Mes</th><th>Demanda (pz)</th>${dir ? '' : '<th>Sell in (pz)</th><th>Sell in − demanda</th>'}<th>Demanda en ${esc(uNom(p))}</th></tr></thead><tbody>
    ${L12.map(m => `<tr><td class="l">${ml(m)}${inc.includes(m) ? ' <span class="pill ' + (incRevisado(p.clase, m) ? '' : 'warn') + '" title="' + esc(incTxt(p.clase, m)) + '">▲ ' + esc(incRevisado(p.clase, m) ? 'sin reporte (revisado)' : incCorto(p.clase, m)) + '</span>' : (REV[p.clase] || {})[m] ? ' <span class="pill" title="' + esc(revNota(p.clase, m)) + '">' + esc(revTxt(p.clase, m)) + '</span>' : ''}</td><td>${fN(p.real[m] || 0)}</td>${dir ? '' : `<td>${fN(p.sellIn[m] || 0)}</td><td>${fN((p.sellIn[m] || 0) - (p.real[m] || 0))}</td>`}<td>${fN1((p.real[m] || 0) / f)}</td></tr>`).join('')}
    </tbody><tfoot><tr><th class="l" scope="row">12 meses</th><td>${fN(p.d12)}</td>${dir ? '' : `<td>${fN(p.s12)}</td><td>${fN(p.s12 - p.d12)}</td>`}<td>${nb('p_cierre', p.cierre === 'OK' ? 'cuadra' : esc(p.cierre.toLowerCase()), `data-p="${esc(p.id)}"`)}</td></tr></tfoot></table></div>
    <p class="prosa small" style="margin-top:8px">${textoCierre(p)}</p></div></details>
    <details class="rs sub solo-bi" id="lj-box" style="margin-top:12px"${RS.cache[p.id] ? ' open' : ''}><summary>Linaje real: del reporte a piezas <span class="pill">BI</span><span class="nota">archivo de origen, unidades del reporte, factor y piezas · se carga del rastreo al abrirlo</span></summary>
      <div id="lj-cuerpo" style="margin-top:10px">${RS.cache[p.id] ? htmlLinaje(p, RS.cache[p.id]) : ''}</div></details>`;
}
function htmlAlgoritmo(p) {
  const cs = p.codigos.filter(c => c.calc);
  if (!cs.length) return `<div class="panel-h"><h2>Cálculo del pronóstico estimado</h2></div><p class="prosa">Sin venta en el historial: el pronóstico estimado no tiene base para este producto.</p>`;
  const f = fac(p), ms = MF;      // 0.4.0: todo el horizonte del algoritmo, no solo la captura
  return `<div class="panel-h"><h2>Cálculo del pronóstico estimado en 3 pasos</h2><span class="nota">Por código, en ${esc(S.unidad === 'pz' ? 'piezas' : uNom(p))}</span></div>` + cs.map(c => {
    const k = c.calc, it = inter(k), base = k.base != null ? k.base : (k.l3 + k.l6 + k.l12) / 3, mx = Math.max(k.l3, k.l6, k.l12, base, 1), obs = k.estado !== 'ACTIVO';
    const aplica = k.idxAplica != null ? !!k.idxAplica : !it;
    const motivo = k.idxMotivo ? ({ todos: 'regla vigente: se aplica en todos los clientes', cadena: 'cadena', distribuidor: 'distribuidor', 'exportación': 'exportación', exportacion: 'exportación', intermitente: 'compra pocas veces' }[k.idxMotivo] || k.idxMotivo) : (it ? 'compra pocas veces' : '');
    const fu = k.idxFuente && Array.isArray(k.idxFuente.v1) ? k.idxFuente : null, an = fu ? (fu.anios || [2024, 2025]) : [2024, 2025];
    const fuente = m => { if (!fu) return null; const j = +m.slice(5, 7) - 1, a = fu.v1[j], b = fu.v2[j], vs = [a, b].filter(x => x != null), s = vs.reduce((x, y) => x + y, 0);
      return { a, b, n: vs.length, s, prom: fu.prom, idx: !vs.length || s <= 0 || !(fu.prom > 0) ? 1 : Math.min(2, Math.max(0.4, (s / vs.length) / fu.prom)) }; };
    const bar = (lb, v, cls) => `<div class="barra"><span>${lb}</span><span><span class="b ${cls || ''}" style="width:${(v / mx * 100).toFixed(1)}%"></span></span><span class="v">${fN1(v / f)}</span></div>`;
    const div = n => it ? n + ' meses (calendario)' : `meses con venta (${n === 3 ? k.mv3 : n === 6 ? k.mv6 : k.mv12} de ${n})`;
    return `<div style="border-top:1px solid var(--line);padding-top:12px;margin-top:4px"><p style="margin-bottom:10px"><b>${esc(descB(c))}</b> <span class="muted">${esc(c.cod)}</span> ${obs ? pill('warn', 'Sin venta ' + fN(k.sinVenta) + ' meses → 0') : pill('good', 'Activo')} ${it ? pill('acc', 'Compra pocas veces') : ''}</p>
    ${obs ? `<p class="aviso" style="margin-bottom:10px">Lleva ${fN(k.sinVenta)} meses sin venta (última: ${k.ultimo ? mll(k.ultimo) : 'sin registro'}). La regla deja el pronóstico estimado en 0 hasta que vuelva a venderse${MK.some(m => kamU(c, m) > 0) ? ', pero tu forecast tiene unidades: revisa si sigue vigente' : ''}.</p>` : ''}
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
        <div class="tw"><table class="tbl"><thead><tr><th class="l">Mes</th><th>Base × índ.</th><th>Pronóstico estimado</th></tr></thead><tbody>
        ${ms.map(m => `<tr${m === MC ? ' class="muted"' : ''}><td class="l">${ml(m)}${m === MC ? ' (en curso)' : ''}</td><td>${fN1(((k.prom && k.prom[m]) || 0) / f)}</td><td><b>${fN1(((k.fc && k.fc[m]) || 0) / f)}</b></td></tr>`).join('')}</tbody></table></div></div>
    </div></div>`;
  }).join('') + `<p class="small muted" style="margin-top:12px">El pronóstico estimado del producto suma todos sus códigos.</p>` + BI_DET(`<p class="tec">Fuente: ${FUENTE_ALG} → datos.json productos[].codigos[].calc (l3, l6, l12, mv3/6/12, idx, prom, fc).</p>`);
}
function htmlInventario(p) {
  const f = fac(p), i = p.inv, e = estInv(dias(p), p.clase), rz = riesgo(p.clase), ip = invPartes(p) || { dist: 0, tr: 0, tot: 0, ordenes: [] };
  /* 0.5.1: la barra usa los umbrales de la clase (T_DOH_OBJETIVO); el tope es 200 días o más si el exceso pasa de 180 */
  const ub = umbral(p.clase), tope = Math.max(200, Math.ceil(ub.exceso * 10 / 9 / 10) * 10), pc = v => v * 100 / tope;
  const dd = dias(p), pos = i && dd != null ? Math.min(100, dd * 100 / tope) : null;
  return `<div class="panel-h"><h2>Inventario y precio</h2></div><div class="det-dos${i ? '' : ' uno'}"><div class="det-col"><h3 class="det-col-t">Inventario del distribuidor</h3>
    ${i ? `<p class="prosa">${fechaVieja(i.fecha) || invViejo(p.clase) ? '<span class="pill warn">dato viejo</span> ' : ''}Al <b>${fechaCorta(i.fecha)}</b> ${esc(p.clase)} tenía <b>${k83Cant(ip.dist / f)} ${esc(uNom(p))}</b> (${fN(ip.dist)} pz)${ip.tr ? `; además vienen en camino <b>${k83Cant(ip.tr / f)} ${esc(uNom(p))}</b> (${fN(ip.tr)} pz en ${ip.ordenes.length || 'varias'} ${ip.ordenes.length === 1 ? 'orden' : 'órdenes'}${ip.ordenes.length ? ', primera llegada ' + esc(fmtEta([...ip.ordenes].map(ordEta).filter(Boolean).sort()[0])) : ''}). Inventario total: <b>${fN(ip.tot)} pz</b>` : ''}. ${k83NegTxt(p) ? k83NegTxt(p) : baseDoh(p).sinVenta ? `No vendió en los últimos ${baseDoh(p).meses.length} meses, así que ${nb('p_inv', '<b>no se pueden calcular días</b>', `data-p="${esc(p.id)}"`)}.` : `Vende en promedio ${fN1(ventaDoh(p) / baseDoh(p).meses.length / f)} al mes, así que le alcanza para ${nb('p_inv', '<b>' + (dd == null ? k83SinDias(p) : diasTxt(dd) + '') + '</b>', `data-p="${esc(p.id)}"`)}.`}${k83Reporte(i) ? ' ' + k83Reporte(i) : ''}</p>
      <p class="small muted k83-vent">${esc(k83Ventana(p))}</p>
      ${pos != null ? `<div class="escala" aria-hidden="true"><span style="width:${pc(rz)}%;background:#F6C9C6"></span><span style="width:${pc(ub.sobrestock - rz)}%;background:#CFEBDD"></span><span style="width:${pc(ub.exceso - ub.sobrestock)}%;background:#FBE6BF"></span><span style="width:${pc(tope - ub.exceso)}%;background:#F5D3A3"></span><span class="mk" style="left:calc(${pos.toFixed(1)}% - 1px)"></span></div>
      <div class="escala-l"><span>0</span><span>${fN(rz)} quiebre</span><span>${fN(ub.sobrestock)} sobrestock</span><span>${fN(ub.exceso)} exceso</span><span>${fN(tope)}+</span></div><p class="small" style="margin-top:4px">Estado: <b>${esc(e ? e[1] : '—')}</b>${ip.tr ? ' · los días incluyen el tránsito que cuenta' : ''}</p>` : ''}
      ${r92Transito(p) ? '<p class="small muted" style="margin-top:6px">El detalle de las órdenes en tránsito y los pedidos está debajo.</p>' : ip.tr ? `<div style="margin-top:8px">${tablaOrdenes(p)}${reglaTransito() ? `<p class="small muted" style="margin-top:6px">Tránsito que cuenta: ${esc(reglaTransito())}</p>` : ''}</div>` : ''}
      ${progDe(p) && !r92Transito(p) ? `<div style="margin-top:8px"><p class="prosa">Además hay <b>${fN(progDe(p).cajas)} cajas</b> (${fN(progDe(p).pz)} pz) en pedidos programados. ${PROG_KAM.replace('Pedidos programados: t', 'T')}</p>${tablaOrdenes(p, true)}${reglaProgramados() ? `<p class="small muted solo-bi" style="margin-top:6px">Regla completa (BI): ${esc(reglaProgramados())}</p>` : ''}</div>` : ''}
      ${(() => { const nh = Object.keys(i.hist || {}).length;      /* 070-DETALLE: sin cortes no se dibuja un gráfico vacío */
        return nh ? `<div class="chart" id="ch-inv" style="margin-top:10px"></div><p class="small muted">${nh < 3 ? esc(p.clase) + ' solo ha enviado ' + nh + (nh === 1 ? ' corte' : ' cortes') + ' de inventario: el historial es corto.' : 'Un corte de inventario por mes.'}</p>`
          : `<p class="small muted" style="margin-top:8px">Todavía no hay historial de cortes de inventario de este producto.</p>`; })()}`
      : `<p class="prosa">${tipoDe(p.clase) === 'sell in directo' ? esc(p.clase) + ' es venta directa de Brinova: no hay inventario de distribuidor.' : tipoDe(p.clase) === 'sell out' ? 'La cadena no envía inventario a BI.' : k83SinInvTxt(p) || 'Este distribuidor no ha enviado inventario de este producto.'}</p>`}
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
    <div class="badges">${pill('src', 'Demanda: ' + fuenteProd(p))}${a.map(([c, x]) => pill(c, x)).join('')}${conExportacion() ? `<button type="button" class="chip" data-c3prod="${esc(p.id)}">Ver en contenedor</button>` : ''}</div>
    ${(p.sustituidos || []).length ? `<div class="small muted">${p.sustituidos.map(x => 'Antes se vendía como ' + esc(x.descBrinova || x.cod) + BI(' · incluye el código anterior ' + esc(x.cod) + ' (sustituido por ' + esc(x.por) + ')')).join('<br>')}</div>` : ''}
    ${otros.length ? `<div class="small muted det-otros">También en: ${otros.map(o => `<button type="button" class="chip" data-p="${esc(o.id)}">${esc(o.clase)}</button>`).join(' ')}</div>` : ''}</div>
  <div id="det-avisos">${avisosHtml(av)}</div>
  <div class="unid-g" id="det-unid">${unidHtml(p, 'd')}</div>
  <div class="mini">
    <div class="kpi"><span class="lbl">Venta 3 meses</span><span class="big">${nb('p_venta3', fN1(p.d3 / f), `data-p="${esc(p.id)}"`)}</span><span class="vr ${cls3(t)}" title="${tit3(t)} contra el año anterior">${flecha(t)}${fP(t)} contra el año anterior</span>${(() => { const vl = ventaLocalDe(p.clase), vp = p.ventaLocal; return vl && vp && ok(vp.total3) ? `<span class="sub" title="${esc(vl.queEs || '')}">${esc(fMon(vp.total3, vl.moneda))} en ${esc(vl.moneda)}</span>` : ''; })()}</div>
    <div class="kpi"><span class="lbl">Inventario</span><span class="big">${inv ? nb('p_inv', k83Cant(invTot(p) / f), `data-p="${esc(p.id)}"`) : (p.sinInventario ? 'Sin inventario' : 'No aplica')}</span>${inv && conTransito(p) ? `<span class="sub">${k83Cant(invPartes(p).dist / f)} en el distribuidor + ${k83Cant(invPartes(p).tr / f)} en tránsito</span>` : ''}<span class="vr ${e ? (e[0] === 'good' ? 'up' : e[0] === 'bad' ? 'down' : 'warn') : 'muted'}">${inv ? (dias(p) == null ? k83SinDias(p) : diasTxt(dias(p)) + ' · ' + esc(e[1].toLowerCase())) : (tipoDe(p.clase) === 'sell in directo' || p.sinInventario ? 'venta directa' : 'sin reporte')}</span></div>
    <div class="kpi"><span class="lbl">Pronóstico estimado · ${esc(rango(MK))}</span><span class="big">${nb('p_alg', fN1(algPz6(p) / f), `data-p="${esc(p.id)}"`)}</span><span class="sub">${fC(pv(p, algPz6(p)))} a precio de lista</span></div>
    <div class="kpi"><span class="lbl">Tu forecast · ${esc(rango(MK))}</span><span class="big" id="det-kam">${nb('p_kam', fN1(kamPz6(p) / f), `data-p="${esc(p.id)}"`)}</span><span class="vr ${cls3(d)}" id="det-kam2">${flecha(d)}${fP(d)} contra el pronóstico estimado · ${fC(kamValM(p, MK))}</span></div>
  </div>
  <p class="lectura" id="det-lectura">${lecturaProducto(p)}</p>
  <section class="panel"><div class="panel-h"><h2>Mes a mes</h2><span class="nota">${esc(uNom(p))}</span>
    <span class="der"><button type="button" class="chip" id="b-desde2" aria-pressed="${S.desde === '2024-01'}">Desde 2024</button><button type="button" class="chip" data-tabla="ch-prod" aria-pressed="false">Ver tabla</button></span></div>
    <div class="chart" id="ch-prod"></div><div class="legend" id="lg-prod"></div><div id="ch-prod-tb"></div></section>
  ${r92Html(p)}
  <section class="panel"><div class="panel-h"><h2>Tu forecast</h2>${k72PillDet(p)}<span class="nota">En la unidad de cada código · ${esc(ml(MC))} en curso, no se cambia · los cambios se guardan al tocar Guardar</span></div>
    ${p.cap.map(c => bloqueCaptura(p, c)).join('') || '<p class="prosa">Este producto no tiene un código para capturar en este distribuidor.</p>'}
    <label class="mes" style="margin-top:10px">Comentario (motivo si te separas del pronóstico estimado: promociones, quiebres)<textarea id="nota-${sid(notaId)}" data-nota="${esc(notaId)}"${k82Pend(notaId) ? ' class="k82-sg"' : ''}>${esc(nota)}</textarea></label>
    <p class="prosa" style="margin-top:8px" id="det-afecta">${afecta(p)}</p>${k72BarraDet(p)}</section>
  <section class="panel">${htmlInventario(p)}${r92Transito(p)}</section>
  <section class="panel" aria-labelledby="or-t">${htmlOrigen(p)}</section>
  <section class="panel"><details class="mas-info"><summary>Cómo se calculó el pronóstico estimado</summary><div style="margin-top:10px">${htmlAlgoritmo(p)}</div></details></section>
  <section class="panel"><details class="rs" id="rs-box" data-p="${esc(p.id)}"><summary><span id="rs-tit">${esc(rsTitulo(p))}</span><span class="nota">${esc(rsNota(p))}</span></summary><div id="rs-cuerpo" style="margin-top:10px"></div></details></section>
  </div>`;
  RS.p = p.id; RS.m = null; RS.path = []; RS.dim = null; RS.lim = 200;
  k72Bloquear();      // 072-CIERRE: casillas y comentario de un producto cerrado quedan de solo lectura
  requestAnimationFrame(() => { k82Inicio($$('#det [data-k82-c]')); k82Barra(); });      // 082-MESES: cada tira arranca en el primer mes de captura (después de showModal) y la barra de cambios pasa al panel
  graficoProducto(p);
  if (inv) {
    const h = {}, ms = MH.filter(m => m >= addM(D.corte, -11)); ms.forEach(m => { if (inv.hist && inv.hist[m] != null) h[m] = inv.hist[m] / f; });
    grafico($('#ch-inv'), { meses: ms, series: [{ nombre: 'Inventario reportado', tipo: 'col', color: COL.inv, data: h }], eje: fCx, tip: v => fN1(v) + ' ' + uNom(p), h: 180, izq: 46, titulo: 'Inventario por corte' });
  }
}
function afecta(p) {
  const kv = kamValM(p, MK), av = pv(p, algPz6(p));
  if (!av && !kv) return 'Sin forecast en estos meses.';
  return `Valor de tu forecast: <b>${fC(kv)}</b> a precio de lista en ${esc(rango(MK))} (pronóstico estimado: ${fC(av)}).`;
}
function refrescarDetalle(p) {
  const f = fac(p), d = dif(p);
  graficoProducto(p);
  const k = $('#det-kam'); if (k) k.innerHTML = nb('p_kam', fN1(kamPz6(p) / f), `data-p="${esc(p.id)}"`);
  const k2 = $('#det-kam2'); if (k2) { k2.textContent = flecha(d) + fP(d) + ' contra el pronóstico estimado · ' + fC(kamValM(p, MK)); k2.className = 'vr ' + cls3(d); }      // 095: color de 0.9.2
  const af = $('#det-afecta'); if (af) af.innerHTML = afecta(p);
  const av = $('#det-avisos'); if (av) av.innerHTML = avisosHtml(avisosCaptura(p));
  unidPintarEn($('#det-unid'), p, 'd');      // 090-UNIDADES
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
/* 082-MESES · guardado explícito: lo que escribe el KAM queda en `local` (borrador en memoria, nunca en localStorage) hasta que toca Guardar.
   localStorage solo guarda la unidad elegida; un borrador viejo (versiones anteriores guardaban `local`) se ofrece una vez (k82Oferta). */
const K82_VIEJO = (() => { try { const g = JSON.parse(localStorage.getItem(LS) || 'null'); return g && g.local && typeof g.local === 'object' && Object.keys(g.local).length ? g.local : null; } catch (e) { return null; } })();
function guardarLocal() { try { localStorage.setItem(LS, JSON.stringify({ unidad: S.unidad })); } catch (e) { } }
function setKam(id, m, v) {
  if (!editable(m) || k72Cerrado((LINES[id] || {}).p)) return;    // nunca se guarda un mes fuera de la ventana de captura · 072-CIERRE: ni de un producto cerrado
  local[id] = local[id] || { meses: {} }; local[id].meses = local[id].meses || {}; local[id].meses[m] = v;
  k82Cambio();      // 082-MESES: queda en el borrador; se guarda al tocar Guardar
  const L = LINES[id]; if (L) document.dispatchEvent(new CustomEvent('fcst:captura', { detail: { clase: L.p.clase, cod: L.c.cod, mes: m, id, valor: v } }));      // 070-GRAFICO: contrato común (brief 0.7.0 › regla 4)
}
/* 090-UNIDADES: confirmaUnidades {mes: {...}} de la línea (lo guardado + el borrador), solo meses de captura; sin confirmaciones no se escribe el campo */
function unidCuerpo(l, r) { const o = soloVentana(Object.assign({}, r && r.confirmaUnidades, l && l.confirmaUnidades)); return Object.keys(o).length ? { confirmaUnidades: o } : {}; }
function soloVentana(o) { const r = {}; Object.keys(o || {}).forEach(m => { if (MK.includes(m)) r[m] = o[m]; }); return r; }
function guardar(id) {
  const { p, c } = LINES[id], r = remote[id] || {}, l = local[id] || {};
  const body = { clase: p.clase, cod: c.cod, producto: p.grupo, meses: soloVentana(Object.assign({}, r.meses || {}, l.meses || {})),
    nota: l.nota != null ? l.nota : (r.nota || ''), por: uid || '', en: new Date().toISOString(), ...k72Cuerpo(l, r), ...unidCuerpo(l, r) };      // 072-CIERRE: listo, listoEn, listoPor · 090-UNIDADES: confirmaUnidades
  /* 082-MESES: se pasa al guardado de una vez (remote) y se quita del borrador; si falla, el borrador vuelve (lo escrito después gana) */
  const prevL = local[id], prevR = remote[id];
  remote[id] = body; delete local[id];
  if (!db) { k82GuardarNavegador(); return Promise.resolve(); }
  pendientes++;
  const pr = (cadena[id] || Promise.resolve()).then(() => db.doc(`ciclos/${CID}/lineas/${id}`).set(body));
  cadena[id] = pr.catch(() => { });
  return pr.then(() => { pendientes--; }, e => { pendientes--; local[id] = Object.assign({}, prevL, local[id], { meses: Object.assign({}, prevL && prevL.meses, local[id] && local[id].meses) }); if (remote[id] === body) remote[id] = prevR; throw e; });
}
function sincronizarInputs() {
  document.querySelectorAll('.inp').forEach(el => {
    const L = LINES[el.dataset.line]; if (!L) return;
    const v = kamU(L.c, el.dataset.mes);
    if (document.activeElement !== el && String(v) !== el.value) el.value = v;
    el.classList.toggle('ed', editado(L.c, el.dataset.mes));
    el.classList.toggle('k82-sg', k82SinGuardar(L.c, el.dataset.mes));      // 082-MESES: editada y sin guardar
  });
}
/* ---------- 082-MESES · guardado explícito (borrador en memoria + barra "N cambios sin guardar · Guardar · Descartar") ----------
   Lo guardado = remote (OneDrive; sin OneDrive, LS_K82G en este navegador). Borrador = local. Un cambio = (código, mes de captura) o un comentario
   cuyo valor en el borrador difiere de lo guardado. El formato de lo que se manda (db.doc(...).set(body)) es el de siempre. */
const LS_K82G = LS + '-guardado';
const K82G = { listo: '', guardando: null, n: 0, oferta: null, ofertaHecha: false };
function k82GuardarNavegador() { try { localStorage.setItem(LS_K82G, JSON.stringify(remote)); } catch (e) { } }
const k82Guardado = (c, m) => { const r = remote[c.id]; return r && r.meses && r.meses[m] != null ? r.meses[m] : (vig(c, m) || 0); };
const k82NotaG = id => (remote[id] && remote[id].nota) || '';
function k82Pend(id) {
  const l = local[id], L = LINES[id]; if (!l || !L) return 0;
  let n = 0; if (l.meses) MK.forEach(m => { if (l.meses[m] != null && l.meses[m] !== k82Guardado(L.c, m)) n++; });
  if (l.nota != null && l.nota !== k82NotaG(id)) n++;
  if (l.confirmaUnidades) Object.keys(l.confirmaUnidades).forEach(m => { const g = remote[id] && remote[id].confirmaUnidades && remote[id].confirmaUnidades[m]; if (JSON.stringify(g || null) !== JSON.stringify(l.confirmaUnidades[m])) n++; });      // 090-UNIDADES: una confirmación sin guardar cuenta como cambio
  return n;
}
const k82N = () => Object.keys(local).reduce((a, id) => a + k82Pend(id), 0);
const k82PendProd = p => [...new Set(p.cap.map(c => c.id).concat([p.princ.id]))].reduce((a, id) => a + k82Pend(id), 0);
const k82SinGuardar = (c, m) => { const l = local[c.id]; return !!(l && l.meses && l.meses[m] != null && l.meses[m] !== k82Guardado(c, m)); };
window.portalSinGuardar = () => k82N();      // portal.js lo consulta antes de cambiar de KAM, ir a "Todos los KAM" o "Dejar de editar"
window.addEventListener('beforeunload', ev => { if (k82N() && !window.portalSalidaConfirmada) { ev.preventDefault(); ev.returnValue = ''; } });
function k82Cambio(sil) {
  const n = k82N();
  if (!sil && !K82G.guardando) { if (n) estado('Sin guardar', 'pend'); else if (!pendientes) estado(K82G.listo || 'Sin cambios', 'ok'); }
  k82Barra();
}
function k82Barra() {
  let b = document.getElementById('k82-barra');
  if (!b) { b = document.createElement('div'); b.id = 'k82-barra'; b.className = 'k82-barra'; b.setAttribute('role', 'region'); b.setAttribute('aria-label', 'Cambios sin guardar'); b.hidden = true; document.body.appendChild(b); }
  const det = $('#det'), dest = det && det.open ? det : document.body; if (b.parentNode !== dest) dest.appendChild(b);
  const n = k82N(), of = K82G.oferta, modo = of ? 'oferta' : K82G.guardando ? 'guardando' : n ? 'cambios' : '';
  if (b.dataset.modo !== modo) {
    b.dataset.modo = modo;
    b.innerHTML = modo === 'oferta' ? `<span class="k82-bt" role="status">Hay cambios de una sesión anterior sin guardar <span class="k82-r">(${of.n})</span></span><span class="k82-bb"><button type="button" class="btn pri" data-k82g="recuperar">Recuperar</button><button type="button" class="btn" data-k82g="olvidar">Descartar</button></span>`
      : modo === 'guardando' ? `<span class="k82-bt" role="status">Guardando…</span><span class="k82-bb"><button type="button" class="btn pri" disabled>Guardar</button><button type="button" class="btn" disabled>Descartar</button></span>`
      : modo === 'cambios' ? `<span class="k82-bt" role="status"><span class="k82-pt" aria-hidden="true"></span><b class="k82-n"></b></span><span class="k82-bb"><button type="button" class="btn pri" data-k82g="guardar">Guardar</button><button type="button" class="btn" data-k82g="descartar">Descartar</button></span>` : '';
  }
  const t = b.querySelector('.k82-n'); if (t) { const x = n + (n === 1 ? ' cambio sin guardar' : ' cambios sin guardar'); if (t.textContent !== x) t.textContent = x; }
  b.hidden = !modo; document.body.classList.toggle('k82-hay', !!modo);
}
function k82Despues(rs) {
  const mal = rs.filter(r => r.status === 'rejected');
  if (mal.length) { const e = mal[0].reason; estado(e && (e.code === 'not_granted' || e.code === 'permission_denied') ? 'No tienes permiso para guardar: avisa a BI' : 'No se pudo guardar; revisa la conexión', 'err'); }
  else { K82G.listo = 'Guardado ' + hora(); if (!k82N()) estado(K82G.listo, 'ok'); }
  sincronizarInputs(); $$('textarea[data-nota]').forEach(x => x.classList.toggle('k82-sg', k82Pend(x.dataset.nota) > 0));
  k82Cambio(true); refrescarResumen();
  return !mal.length;
}
function k82GuardarTodo() {
  if (K82G.guardando) return K82G.guardando;
  const ids = Object.keys(local).filter(id => LINES[id]), con = ids.filter(id => k82Pend(id) > 0 || local[id].listo != null);
  ids.filter(id => !con.includes(id)).forEach(id => { delete local[id]; });      // borrador igual a lo guardado: no se manda
  if (!con.length) { k82Cambio(); return Promise.resolve(true); }
  const n = k82N(); estado('Guardando…', 'pend');
  K82G.guardando = Promise.allSettled(con.map(guardar)).then(rs => { K82G.guardando = null; const okG = k82Despues(rs); if (okG) toast(n === 1 ? 'Se guardó 1 cambio' : `Se guardaron ${n} cambios`); return okG; });
  k82Barra();
  return K82G.guardando;
}
function k82Descartar() {
  const n = k82N(); local = {};
  $$('.inp').forEach(x => { const L = LINES[x.dataset.line]; if (L) x.value = kamU(L.c, x.dataset.mes); });      // también la casilla que tiene el foco
  sincronizarInputs(); $$('textarea[data-nota]').forEach(x => { x.value = k82NotaG(x.dataset.nota); x.classList.remove('k82-sg'); });
  $$('.inp').forEach(x => { if (x.dataset.line) totFila(x.dataset.line); }); pieGrid();
  if (S.vista === 'capturar') prodGrid.forEach(refrescarGrupo);
  refrescarResumen(); document.dispatchEvent(new CustomEvent('fcst:captura', { detail: { descartar: true } }));
  k82Cambio(); toast(n === 1 ? 'Se descartó 1 cambio' : `Se descartaron ${n} cambios`);
}
/* borrador de una versión anterior (localStorage › local): no se aplica solo; se ofrece una vez */
function k82Oferta() {
  if (!K82_VIEJO || K82G.ofertaHecha) return; K82G.ofertaHecha = true;
  if (VENCIDO || k72SoloLectura()) return;
  const x = {}; let n = 0;
  Object.entries(K82_VIEJO).forEach(([id, l]) => {
    const L = LINES[id]; if (!L || !l || k72Cerrado(L.p)) return;
    const y = { meses: {} }, ms = soloVentana(l.meses);
    Object.keys(ms).forEach(m => { const v = parseInt(ms[m], 10); if (editable(m) && isFinite(v) && v >= 0 && v !== k82Guardado(L.c, m)) { y.meses[m] = v; n++; } });
    if (typeof l.nota === 'string' && l.nota !== k82NotaG(id)) { y.nota = l.nota; n++; }
    if (Object.keys(y.meses).length || y.nota != null) x[id] = y;
  });
  if (!n) { guardarLocal(); return; }
  K82G.oferta = { x, n }; k82Barra();
}
document.addEventListener('click', ev => {
  const b = ev.target.closest && ev.target.closest('[data-k82g]'); if (!b) return;
  const a = b.dataset.k82g;
  if (a === 'guardar') { k82GuardarTodo(); return; }
  if (a === 'descartar') { k82Descartar(); return; }
  if (a === 'recuperar' || a === 'olvidar') {
    const of = K82G.oferta; K82G.oferta = null; guardarLocal();      // localStorage queda sin el borrador viejo
    if (a === 'recuperar' && of) {
      Object.entries(of.x).forEach(([id, y]) => { const l = local[id] = local[id] || { meses: {} }; l.meses = Object.assign(l.meses || {}, y.meses); if (y.nota != null) l.nota = y.nota; });
      sincronizarInputs(); $$('textarea[data-nota]').forEach(x => { if (local[x.dataset.nota] && local[x.dataset.nota].nota != null) { x.value = local[x.dataset.nota].nota; x.classList.add('k82-sg'); } });
      if (S.vista === 'capturar') pintarGrid(); refrescarResumen(); document.dispatchEvent(new CustomEvent('fcst:captura', { detail: { recuperar: true } }));
      toast('Se recuperaron los cambios: revisa y toca Guardar');
    }
    k82Cambio();
  }
});
$('#det').addEventListener('close', () => k82Barra());      // la barra vuelve a la página
function refrescarGrupo(p) {
  k94Refrescar(p);      // 094: totales, insignias y sugerido del producto, solo dentro de su bloque de la grilla (antes recorría toda la página)
  unidRepintar(p);      // 090-UNIDADES: el aviso de unidades se enciende o se apaga mientras escribes
  r92Refrescar(p);      // 092: estado del pedido sugerido contra lo que escribes
}
/* ---------- 090-UNIDADES · pintar, confirmar ("Es correcto" + motivo) y corregir (foco en la casilla). La regla está en app_1 (avisosUnid). ---------- */
function unidPintarEn(el, p, ctx) {
  if (!el) return;
  const mot = el.querySelector('.unid-mot'), v = mot ? mot.value : null, foco = mot && document.activeElement === mot;
  const h = unidHtml(p, ctx); if (el.innerHTML !== h) el.innerHTML = h;
  const tr = el.closest('.unid-row, tr.unid-tr'); if (tr) tr.hidden = !h;
  const m2 = el.querySelector('.unid-mot'); if (m2 && v != null) { m2.value = v; if (foco) m2.focus(); }
}
function unidRepintar(p) {
  const g = GEL.get(p.id), raices = [g, S.abierto === p.id ? $('#det') : null].filter(Boolean);      // 094: solo el bloque del producto y el detalle
  if (g) g.querySelectorAll('[data-gu]').forEach(e => unidPintarEn(e, p, 'g'));
  if (S.abierto === p.id) unidPintarEn($('#det-unid'), p, 'd');
  raices.forEach(r => r.querySelectorAll('.inp').forEach(x => { const L = LINES[x.dataset.line]; if (L && L.p === p) x.classList.toggle('unid-on', !!unidCelda(p, L.c, x.dataset.mes)); }));
  const ct = $('#unid-cont-w'); if (ct) ct.outerHTML = unidContador();
}
const unidProdsKam = () => P.filter(p => enDist(p) && p.cap.length);
function unidContador() {
  const n = unidProdsKam().filter(p => unidPend(p).length).length;
  return `<span id="unid-cont-w">${n ? `<button type="button" class="chip unid-cont" data-unid-ir title="Ir al primer producto con un posible error de unidades">${n} ${n === 1 ? 'aviso' : 'avisos'}<span class="k94-lgo"> de unidades por revisar</span></button>` : ''}</span>`;
}
function unidConfirmar(p, ctx) {
  const mot = (($(`#unid-mot-${sid(p.id)}-${ctx}`) || {}).value || '').trim().slice(0, 140), en = new Date().toISOString(), pend = unidPend(p);
  pend.forEach(a => {
    const c = a.c, l = local[c.id] = local[c.id] || { meses: {} }; l.meses = l.meses || {};
    l.confirmaUnidades = Object.assign({}, l.confirmaUnidades);
    l.confirmaUnidades[a.m] = { cod: c.cod, valor: kamU(c, a.m), pz: Math.round(a.kpz), veces: a.veces == null ? null : Math.round(a.veces * 10) / 10, refPz: Math.round(a.r.pz), base: a.r.base, motivo: mot, en, por: uid || '' };
  });
  UFORM = ''; k82Cambio(); unidRepintar(p); refrescarResumen();
  toast(pend.length === 1 ? 'Confirmado 1 mes: queda sin guardar hasta que toques Guardar' : `Confirmados ${pend.length} meses: quedan sin guardar hasta que toques Guardar`);
  const b = (ctx === 'd' ? $('#det-unid') : document.querySelector(`#grid [data-gu="${CSS.escape(p.id)}"]`)); if (b) { const x = b.querySelector('.unid-conf span') || b; x.setAttribute('tabindex', '-1'); x.focus({ preventScroll: true }); }
}
function unidCorregir(p, ctx) {
  const a = unidPend(p)[0]; if (!a) return;
  const sel = `.inp[data-line="${CSS.escape(a.c.id)}"][data-mes="${a.m}"]`;
  if (ctx !== 'd') k95Mostrar(p);      // 095
  let i = ctx === 'd' ? $('#det ' + sel) : $('#grid ' + sel);
  if (!i && ctx !== 'd') { abrir(p.id); i = $('#det ' + sel); }      // la fila de códigos puede estar plegada (producto cerrado) o fuera de la lista
  if (i) { i.focus(); i.select && i.select(); i.scrollIntoView({ block: 'nearest', inline: 'center' }); }
}
function unidIr() {
  const tiene = p => unidPend(p).length > 0;
  let L = listaCaptura(), p = L.find(tiene);
  if (!p) { S.q2 = ''; S.chip2 = 'aviso'; const q = $('#q2'); if (q) q.value = ''; pintarEncabezado(); L = listaCaptura(); p = L.find(tiene); }
  if (!p) return;
  const i = L.indexOf(p); if (i >= S.capLim) S.capLim = Math.ceil((i + 1) / 25) * 25;
  pintarGrid(); selCap(p.id); k95Mostrar(p);
  const tr = document.querySelector(`#grid [data-gu-tr="${CSS.escape(p.id)}"]`);
  if (tr) { tr.scrollIntoView({ block: 'center' }); const b = tr.querySelector('[data-unid-ok]'); if (b) b.focus({ preventScroll: true }); }
}
document.addEventListener('click', ev => {
  const t = ev.target.closest && ev.target.closest('[data-unid-ok],[data-unid-fix],[data-unid-si],[data-unid-no],[data-unid-ir]'); if (!t) return;
  const ds = t.dataset, enDet = !!t.closest('#det'), ctx = enDet ? 'd' : 'g';
  if ('unidIr' in ds) { unidIr(); return; }
  const p = PID[ds.unidOk || ds.unidFix || ds.unidSi || ds.unidNo]; if (!p) return;
  if (ds.unidOk) { UFORM = p.id + '|' + ctx; unidRepintar(p); const m = $(`#unid-mot-${sid(p.id)}-${ctx}`); if (m) m.focus(); return; }
  if (ds.unidNo) { UFORM = ''; unidRepintar(p); const b = (enDet ? $('#det') : document).querySelector(`[data-unid-ok="${CSS.escape(p.id)}"]`); if (b) b.focus(); return; }
  if (ds.unidSi) { unidConfirmar(p, ctx); return; }
  if (ds.unidFix) unidCorregir(p, ctx);
});
document.addEventListener('keydown', ev => {
  const t = ev.target; if (!t.classList || !t.classList.contains('unid-mot')) return;
  const w = t.closest('.unid-form'), b = w && w.querySelector(ev.key === 'Escape' ? '[data-unid-no]' : '[data-unid-si]');
  if ((ev.key === 'Enter' || ev.key === 'Escape') && b) { ev.preventDefault(); ev.stopPropagation(); b.click(); }
});
/* BI: avisos de unidades del KAM (pendientes, confirmados en este ciclo y confirmados en un ciclo anterior), en el Resumen */
function pintarUnidBI() {
  const box = $('#unid-bi-c'), tit = $('#unid-bi-t'); if (!box) return;
  const filas = [];
  P.filter(p => p.cap.length).forEach(p => gruposUnid(avisosUnid(p)).forEach(g => filas.push({ p, g, a: g[0], est: g[0].conf ? 'conf' : g[0].ant ? 'ant' : 'pend' })));
  const n = k => new Set(filas.filter(f => f.est === k).map(f => f.p.id)).size, ord = { pend: 0, conf: 1, ant: 2 };      // productos (un producto puede tener dos números distintos)
  tit.textContent = `Avisos de unidades (BI) · productos: ${n('pend')} pendientes · ${n('conf')} confirmados en este ciclo · ${n('ant')} confirmados en un ciclo anterior`;
  if (!filas.length) { box.innerHTML = '<p class="small muted">Ningún producto pasa la regla.</p>'; return; }
  filas.sort((x, y) => ord[x.est] - ord[y.est] || (y.a.veces ?? -1) - (x.a.veces ?? -1));      // las veces más altas primero; sin compras al final
  box.innerHTML = `<p class="small muted" style="margin:6px 0">Regla: forecast del mes en piezas ≥ ${fVeces(RU.umbral)}× el promedio mensual facturado a ese distribuidor (${RU.meses} meses${RU.desdePrimeraVenta ? ', desde su primer mes con venta' : ''}; sin sell in de la clase, la venta real). Referencia 0 = "sin compras". Parámetros: datos.json › reglasAvisos.unidades${RA.unidades ? '' : ' (no viene: valores por defecto de la página)'}.</p>
    <div class="tw" role="region" tabindex="0" aria-label="Avisos de unidades"><table class="tbl"><thead><tr><th class="l">Distribuidor</th><th class="l">Producto</th><th class="l">Código</th><th class="l">Meses</th><th>Forecast</th><th>Referencia pz/mes</th><th>Veces</th><th class="l">Estado</th></tr></thead><tbody>
    ${filas.map(({ p, g, a, est }) => { const x = a.conf || a.ant; return `<tr><td class="l">${esc(p.clase)}</td><td class="l"><button type="button" class="chip" data-p="${esc(p.id)}">${esc(p.nombre)}</button></td><td class="l">${esc(a.c.cod)}</td><td class="l">${esc(g.map(y => ml(y.m)).join(', '))}</td><td>${fN(kamU(a.c, a.m))} ${esc(unNom(a.c, kamU(a.c, a.m)))} = ${fN(a.kpz)} pz</td><td>${fN(a.r.pz)} <small class="muted">${esc(a.r.base)}</small></td><td>${a.veces == null ? 'sin compras' : fVeces(a.veces) + '×'}</td><td class="l">${est === 'pend' ? pill('bad', 'pendiente') : est === 'conf' ? pill('good', 'confirmado ' + (x.en ? fechaCorta(x.en) : '')) + esc(quienCorto(x)) : pill('', 'confirmado en ' + ml(x.ciclo))}${x && x.motivo ? `<small class="muted" style="display:block">“${esc(x.motivo)}”</small>` : ''}</td></tr>`; }).join('')}
    </tbody></table></div>`;
}
let tRef = null;
function refrescarResumen() {        // repinta solo lo visible
  clearTimeout(tRef);
  tRef = setTimeout(() => {
    if (S.vista === 'tendencia') { pintarHorizonte(); pintarKpis(); pintarTotal(); pintarLista(); }
    if (S.vista === 'distribuidores') pintarDistribuidores();
    if (S.vista === 'capturar') {      // 094: solo los productos tocados desde el último refresco (K94SUC); sin marca, todos
      const todos = !K94SUC.size || K94SUC.has('*'), ps = todos ? prodGrid : prodGrid.filter(p => K94SUC.has(p.id)); K94SUC.clear();
      filasGrid.forEach(totFila); pieGrid(); pintarResumenCap(); ps.forEach(refrescarGrupo);
    }
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
  k72PintarAvance();      // 072-CIERRE: avance en el botón y aviso de forecast listo (fecha y quién)
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
  if (ds.d) { S.dist = ds.d; S.lim = 60; S.capLim = CAP_LIM; if (S.dist !== 'TODOS') { C3.clase = S.dist; C3.prod = ''; C3.idx = 0; } pintarEncabezado(); vista(S.vista); return; }
  if (ds.v) { vista(ds.v); return; }
  /* 0.5.0 · contenedores 3D */
  if (ds.c3tipo) { C3.tipo = ds.c3tipo; C3.idx = 0; pintarContenedor(); return; }
  if (ds.c3fuente) { C3.fuente = ds.c3fuente; C3.orden = ''; C3.idx = 0; pintarContenedor(); return; }
  if (ds.c3idx != null) { C3.idx = +ds.c3idx; pintarContenedor(); return; }
  if (ds.c3cam) { if (C3.escena) C3.escena.camara(ds.c3cam); return; }
  if ('c3anim' in ds) { if (C3.escena) C3.escena.recargar(); return; }
  if (ds.c3prod) { const p = PID[ds.c3prod]; if (p) { C3.clase = p.clase; C3.prod = p.id; C3.pres = ''; C3.idx = 0; cerrar(); vista('contenedor'); } return; }
  if (ds.u) { S.unidad = ds.u; guardarLocal(); pintarEncabezado(); vista(S.vista); if (S.abierto) pintarDetalle(PID[S.abierto]); return; }
  if (ds.mon) { monSet(ds.mon); try { localStorage.setItem(LS_MON, ds.mon); } catch (e) { } pintarEncabezado(); vista(S.vista); if (S.abierto) pintarDetalle(PID[S.abierto]); return; }      // 092-USD
  if (ds.chip) { S.chip = ds.chip; S.lim = 60; pintarEncabezado(); pintarLista(); return; }
  if (ds.chip2) { S.chip2 = ds.chip2; S.capLim = CAP_LIM; pintarEncabezado(); pintarGrid(); return; }
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
    sincronizarInputs(); totFila(id); refrescarResumen(); toast(ds.usarAlg ? 'Se copió el pronóstico estimado en los meses de captura' : 'Volvió a tu formulario'); return;
  }
  if (t.id === 'b-listo') {
    if (VENCIDO) { toast('La captura de este ciclo ya cerró'); return; }
    if (!db) { toast('Para marcarlo como listo hay que abrir el enlace con sesión iniciada'); return; }
    const tot = P.reduce((a, p) => a + kamValM(p, MK), 0);
    t.disabled = true;
    (k82N() ? k82GuardarTodo() : Promise.resolve(true)).then(okG => { if (!okG) { t.disabled = false; return Promise.reject(); } return db.doc(`ciclos/${CID}`).set({ estado: 'listo', por: uid || '', en: new Date().toISOString(), valorLista: Math.round(tot) }); })      // 082-MESES: con cambios sin guardar, se guardan antes de marcar
      .then(() => toast('Forecast marcado como listo'), () => toast('No se pudo marcar; revisa tu permiso o la conexión'))
      .finally(() => { t.disabled = false; });
  }
});
document.addEventListener('keydown', ev => {
  const t = ev.target;
  if ((ev.key === 'Enter' || ev.key === ' ') && t.dataset && t.dataset.rsIr != null) { ev.preventDefault(); t.click(); return; }
  if (ev.key === 'Enter' && t.classList && t.classList.contains('inp')) {      // Enter baja a la casilla de abajo (como en Excel)
    ev.preventDefault();
    const caja = t.closest('dialog') || t.closest('#v-capturar') || document, todos = [...caja.querySelectorAll('.inp')].filter(o => o === t || !o.closest('[hidden]')), i = todos.indexOf(t);      // 095: sin las de categorías plegadas
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
  if (el.id === 'q2') { S.q2 = el.value; S.capLim = CAP_LIM; debounce(pintarGrid); return; }
  if (el.dataset.nota) { const id = el.dataset.nota; local[id] = local[id] || { meses: {} }; local[id].nota = el.value; el.classList.toggle('k82-sg', k82Pend(id) > 0); k82Cambio(); return; }
  if (el.classList.contains('inp')) {
    const id = el.dataset.line, m = el.dataset.mes;
    if (!editable(m)) { el.value = kamU(LINES[id].c, m); return; }
    const raw = el.value.replace(/[^\d]/g, ''); if (raw !== el.value) el.value = raw;
    const v = raw === '' ? 0 : parseInt(raw, 10);
    setKam(id, m, v);
    const gem = $$(`.inp[data-line="${CSS.escape(id)}"][data-mes="${m}"]`).filter(o => o !== el);      // 094: la misma casilla en el detalle (sin recorrer las 2 000 de la grilla)
    el.classList.toggle('ed', editado(LINES[id].c, m)); el.classList.toggle('k82-sg', k82SinGuardar(LINES[id].c, m));
    gem.forEach(o => { o.value = v; o.classList.toggle('ed', el.classList.contains('ed')); o.classList.toggle('k82-sg', el.classList.contains('k82-sg')); });
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

/* ---------- 072-CIERRE · cierre por producto y del formulario total ----------
   Un producto (productos[] con casillas, p.cap) se cierra cuando el KAM ya lo revisó: sus casillas, botones y comentario quedan bloqueados
   hasta reabrirlo. Se guarda en la captura, en CADA línea de captura del producto (lineas[CLASE__COD]): listo (true/false), listoEn (ISO) y
   listoPor (correo), junto con los valores (guardar › k72Cuerpo), así que se sincroniza como el resto (portal.js › almacen guarda el cuerpo tal cual).
   Estados (k72Estado): cerrado · progreso (editado o con comentario, sin cerrar) · pendiente (sin tocar). Ícono + texto, nunca solo color.
   Cierre total (#b-listo): muestra "N de M productos cerrados"; con productos sin cerrar abre #k72-dlg (pendientes por distribuidor,
   "Cerrar igual" o "Ir al primero pendiente"). Captura vencida (VENCIDO) o solo lectura de BI (body.solo-lectura): se ve todo, no se cierra.
   Ganchos en código ajeno: setKam, guardar, pintarEnvio, pintarDetalle (app_3); listaCaptura, grupoCap, pintarGrid, pintarResumenCap,
   pintarDistribuidores (app_2). Evento propio: fcst:cierre {clase, id, listo}. */
const K72 = { filtro: 'todos', plegar: true, forzar: false, ultimo: null, ro: false };
const LS_K72 = 'portal-k72-' + CID;
K72.avPl = matchMedia('(max-width:760px)').matches;      // 094: avance plegado (solo la barra); sin preferencia, plegado en el celular
try { const g = JSON.parse(localStorage.getItem(LS_K72) || 'null'); if (g && typeof g.plegar === 'boolean') K72.plegar = g.plegar; if (g && typeof g.avPl === 'boolean') K72.avPl = g.avPl; } catch (e) { }
function k72GuardarPref() { try { localStorage.setItem(LS_K72, JSON.stringify({ plegar: K72.plegar, avPl: K72.avPl })); } catch (e) { } }
const K72_EST = { pendiente: 'Pendiente', progreso: 'En progreso', cerrado: 'Cerrado' };
const K72_ICO = {
  pendiente: '<svg class="k72-i" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="5.6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-dasharray="2.4 1.9"/></svg>',
  progreso: '<svg class="k72-i" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="5.6" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 2.4a5.6 5.6 0 0 1 0 11.2z" fill="currentColor"/></svg>',
  cerrado: '<svg class="k72-i" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="7" fill="currentColor"/><path d="M4.8 8.2l2.2 2.2 4.2-4.6" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};
/* estado guardado de una línea: lo de esta sesión (local) gana a lo que trajo la captura (remote) */
function k72Linea(id) { const l = local[id], r = remote[id], x = l && l.listo != null ? l : r && r.listo != null ? r : null; return x ? { listo: !!x.listo, en: x.listoEn || '', por: x.listoPor || '' } : { listo: false, en: '', por: '' }; }
function k72Cuerpo(l, r) { const x = l && l.listo != null ? l : r && r.listo != null ? r : null; return x ? { listo: !!x.listo, listoEn: x.listoEn || '', listoPor: x.listoPor || '' } : {}; }
const k72Cerrado = p => !!p && p.cap.length > 0 && p.cap.every(c => k72Linea(c.id).listo);
function k72Nota(p) { const id = p.princ.id, l = local[id], r = remote[id]; return String(l && l.nota != null ? l.nota : (r && r.nota) || '').trim() !== ''; }
function k72Estado(p) { if (k72Cerrado(p)) return 'cerrado'; return p.cap.some(c => MK.some(m => editado(c, m))) || k72Nota(p) ? 'progreso' : 'pendiente'; }
const k72Prods = cl => P.filter(p => p.cap.length && (!cl || cl === 'TODOS' || p.clase === cl));
function k72Cuenta(ps) { const n = { cerrado: 0, progreso: 0, pendiente: 0, total: ps.length }; ps.forEach(p => { n[k72Estado(p)]++; }); return n; }
const k72SoloLectura = () => document.body.classList.contains('solo-lectura');
const k72Puede = () => !VENCIDO && !k72SoloLectura();
const k72PorQue = () => VENCIDO ? 'La captura de este ciclo ya cerró' : 'Solo lectura: vista de BI';
const k72Pasa = p => K72.filtro === 'todos' || k72Estado(p) === K72.filtro;
const k72Orden = p => K72.plegar && K72.filtro !== 'cerrado' && k72Cerrado(p) ? 1 : 0;
const k72Plegado = p => K72.plegar && K72.filtro !== 'cerrado' && k72Cerrado(p);
const k72Pill = e => `<span class="k72-est k72-${e}">${K72_ICO[e]}<span>${K72_EST[e]}</span></span>`;
function k72Quien(por) { if (!por) return ''; const yo = $('#persona span'); return por === uid && yo && yo.textContent ? yo.textContent : por; }
function k72Cuando(iso) { const f = new Date(iso); return isNaN(f) ? '' : f.toLocaleDateString('es-CR', { day: 'numeric', month: 'short' }) + ' ' + f.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' }); }
function k72CerradoTxt(p) { const x = k72Linea(p.cap[0].id); return 'Cerrado' + (x.en ? ' el ' + k72Cuando(x.en) : '') + (x.por ? ' · ' + k72Quien(x.por) : ''); }
function k72Boton(p) {
  const on = k72Cerrado(p), dis = k72Puede() ? '' : ` disabled title="${esc(k72PorQue())}"`;
  return `<button type="button" class="btn k72-btn${on ? '' : ' k72-cerrar'}" data-k72="${esc(p.id)}" aria-label="${esc((on ? 'Reabrir ' : 'Cerrar ') + p.nombre + ' de ' + p.clase)}"${dis}>${on ? 'Reabrir' : 'Cerrar producto'}</button>`;
}
/* fila de título del producto en la grilla de Capturar */
function k72Grupo(p) { const pl = k72Plegado(p); return `<span class="k72-g" data-k72-g="${esc(p.id)}">${k72Pill(k72Estado(p))}${k72Boton(p)}${pl ? `<span class="small muted">${esc(k72Cuando(k72Linea(p.cap[0].id).en))}${k72Cuando(k72Linea(p.cap[0].id).en) ? ' · ' : ''}códigos ocultos</span>` : ''}</span>`; }
/* detalle del producto: estado al lado de "Tu forecast" y, al final de la captura, cerrar / reabrir + siguiente pendiente */
const k72PillDet = p => p.cap.length ? `<span class="k72-g" data-k72-g="${esc(p.id)}">${k72Pill(k72Estado(p))}</span>` : '';
function k72BarraDet(p) {
  if (!p.cap.length) return '';
  const on = k72Cerrado(p);
  return `<div class="k72-det"><span class="small ${on ? '' : 'muted'}">${on ? esc(k72CerradoTxt(p)) + '. Para cambiar algo, reábrelo.' : 'Cuando termines de revisarlo, ciérralo: las casillas quedan bloqueadas hasta que lo reabras.'}</span>
    <span class="k72-det-b">${k72Boton(p)}<button type="button" class="btn" data-k72-sig>Siguiente pendiente</button></span></div>`;
}
function k72Barra(n) { const w = k => n.total ? (n[k] * 100 / n.total).toFixed(1) + '%' : '0%'; return `<span class="k72-bar" aria-hidden="true"><i class="c" style="width:${w('cerrado')}"></i><i class="p" style="width:${w('progreso')}"></i></span>`; }
const k72Resto = n => `${n.progreso} en progreso · ${n.pendiente} ${n.pendiente === 1 ? 'pendiente' : 'pendientes'}`;
/* columna de la pestaña Distribuidores */
function k72CeldaDist(cl) {
  const n = k72Cuenta(k72Prods(cl)); if (!n.total) return '—';
  return `<span class="k72-dc">${n.cerrado === n.total ? K72_ICO.cerrado : ''}${n.cerrado} de ${n.total} cerrados</span>${k72Barra(n)}<small class="muted" style="display:block">${k72Resto(n)}</small>`;
}
/* franja de avance de la pestaña Capturar (también repinta estados, bloqueo de casillas y el botón de cierre total) */
function k72PintarAvance(ligero) {      // 094: ligero = mientras se escribe (sin recorrer estados y casillas de toda la grilla)
  const box = $('#k72-avance');
  if (box) {
    const tot = k72Cuenta(k72Prods()), sel = k72Cuenta(k72Prods(S.dist)), cls = D.clases.filter(cl => k72Prods(cl).length);
    const fil = [['todos', 'Todos', sel.total], ['pendiente', 'Pendientes', sel.pendiente], ['progreso', 'En progreso', sel.progreso], ['cerrado', 'Cerrados', sel.cerrado]];
    const listo = envio && envio.estado === 'listo';
    /* 094 (revisión): una sola fila: plegar · barra total y "x de y cerrados" · chips por distribuidor con su x/y (desplazables) · Siguiente pendiente.
       Los filtros Pendientes / En progreso / Cerrados pasan a la fila de búsqueda (#k72-fil). */
    const fb = document.activeElement && document.activeElement.closest && document.activeElement.closest('#k72-avance') ? document.activeElement.dataset : null;
    box.innerHTML = `<button type="button" class="k94-avt" data-k94-av aria-label="Avance por distribuidor" aria-expanded="${!K72.avPl}" aria-controls="k94-avc" title="${K72.avPl ? 'Ver el avance por distribuidor' : 'Ocultar el avance por distribuidor'}"><span aria-hidden="true">${K72.avPl ? '▸' : '▾'}</span> <span id="k72-t">Avance</span></button>
      <span class="k94-avb">${k72Barra(tot)}<span class="k94-avn"><b>${tot.cerrado} de ${tot.total}</b><span class="k94-lgo"> cerrados</span><span class="muted"> · ${tot.progreso} en progreso</span></span></span>
      ${listo ? `<span class="pill good k94-listo" title="${esc('Forecast marcado como listo' + (envio.en ? ' el ' + k72Cuando(envio.en) : '') + (envio.por ? ' · ' + k72Quien(envio.por) : ''))}">${K72_ICO.cerrado} Listo</span>` : ''}
      <span class="k94-avc scrollx" id="k94-avc"${K72.avPl ? ' hidden' : ''} role="group" aria-label="Avance por distribuidor; toca uno para ver solo ese">${cls.length > 1 ? cls.map(cl => { const n = k72Cuenta(k72Prods(cl)), on = S.dist === cl;
        return `<button type="button" class="k72-d k94-d${n.cerrado === n.total ? ' completo' : ''}" data-d="${esc(on ? 'TODOS' : cl)}" data-k72-cl="${esc(cl)}" aria-pressed="${on}" title="${esc(cl + ': ' + n.cerrado + ' de ' + n.total + ' cerrados · ' + k72Resto(n))}">${n.cerrado === n.total ? K72_ICO.cerrado : ''}${esc(cl)} <b>${n.cerrado}/${n.total}</b>${k72Barra(n)}</button>`; }).join('') : ''}<button type="button" class="chip k94-pl" data-k72-plegar aria-pressed="${K72.plegar}" title="Los productos cerrados pasan al final de la lista y se ve solo su título">Cerrados al final</button></span>
      <button type="button" class="btn pri k94-sig" data-k72-sig>Siguiente pendiente</button>`;
    if (fb) { const sel2 = fb.k72Cl ? `[data-k72-cl="${CSS.escape(fb.k72Cl)}"]` : 'k94Av' in fb ? '[data-k94-av]' : 'k72Plegar' in fb ? '[data-k72-plegar]' : 'k72Sig' in fb ? '[data-k72-sig]' : null; const e2 = sel2 && box.querySelector(sel2); if (e2) e2.focus({ preventScroll: true }); }
    const ff = $('#k72-fil');
    if (ff) { const fa = document.activeElement && document.activeElement.closest && document.activeElement.closest('#k72-fil') ? document.activeElement.dataset.k72F : null;
      ff.innerHTML = fil.map(([k, t, n]) => `<button type="button" data-k72-f="${k}" aria-pressed="${K72.filtro === k}">${k === 'todos' ? '' : K72_ICO[k]}${t}<span class="c">${n}</span></button>`).join('');
      if (fa) { const e3 = ff.querySelector(`[data-k72-f="${fa}"]`); if (e3) e3.focus({ preventScroll: true }); } }
  }
  if (!ligero) { k72Badges(); k72Bloquear(); }
  k72PintarListo();
}
function k72Badge(el) { const p = PID[el.dataset.k72G]; if (!p) return; const e = k72Estado(p), s = el.querySelector('.k72-est'); if (s && !s.classList.contains('k72-' + e)) s.outerHTML = s.classList.contains('k94-mini') ? k94Pill(e) : k72Pill(e); }      // 094: en la grilla, solo el ícono
function k72Badges(id) { (id ? $$(`[data-k72-g="${CSS.escape(id)}"]`) : $$('[data-k72-g]')).forEach(k72Badge); }
function k72Bloquear() {
  const ro = k72SoloLectura();
  $$('.inp[data-line]').forEach(el => { const L = LINES[el.dataset.line]; if (!L) return; const c = k72Cerrado(L.p), v = ro || c || !editable(el.dataset.mes); if (el.readOnly !== v) el.readOnly = v; el.classList.toggle('k72-ro', c); });
  $$('textarea[data-nota]').forEach(el => { const L = LINES[el.dataset.nota]; if (L) el.readOnly = ro || k72Cerrado(L.p); });
  $$('[data-usar-alg],[data-volver]').forEach(b => { const L = LINES[b.dataset.usarAlg || b.dataset.volver]; if (L) b.disabled = VENCIDO || k72Cerrado(L.p); });
  $$('[data-k72]').forEach(b => { const v = !k72Puede(); if (b.disabled !== v) { b.disabled = v; if (v) b.title = k72PorQue(); else b.removeAttribute('title'); } });
}
/* botón existente "Marcar forecast como listo": avance de todo el formulario */
function k72PintarListo() {
  const b = $('#b-listo'); if (!b) return;
  const n = k72Cuenta(k72Prods()), listo = envio && envio.estado === 'listo';
  b.classList.add('k72-listo');
  b.innerHTML = `<span>${listo ? 'Volver a marcar como listo' : 'Marcar <span class="k94-lgo">forecast </span>como listo'}</span><small class="k72-av">${n.cerrado} de ${n.total} productos cerrados</small>`;
  if (!k72Puede()) b.disabled = true;
}
/* cerrar (on) o reabrir un producto: todas sus líneas de captura, con fecha y persona */
function k72Poner(p, on) {
  if (!k72Puede()) { toast(k72PorQue()); return false; }
  const en = new Date().toISOString(), por = uid || '';
  K72.guardados = k82PendProd(p);      // 082-MESES: los cambios sin guardar del producto se guardan junto con el cierre
  const ids = [...new Set(p.cap.map(c => c.id).concat(local[p.princ.id] ? [p.princ.id] : []))];
  p.cap.forEach(c => { const l = local[c.id] = local[c.id] || { meses: {} }; l.meses = l.meses || {}; Object.assign(l, on ? { listo: true, listoEn: en, listoPor: por } : { listo: false, listoEn: '', listoPor: '' }); });
  estado('Guardando…', 'pend');
  Promise.allSettled(ids.map(guardar)).then(rs => { k82Despues(rs); });
  k82Cambio(true);
  document.dispatchEvent(new CustomEvent('fcst:cierre', { detail: { clase: p.clase, id: p.id, listo: on } }));
  return true;
}
function k72Despues(p, on, btn) {
  const enDet = !!(btn && btn.closest('#det')), enGrid = !!(btn && btn.closest('#grid'));
  const i = prodGrid.indexOf(p), sig = enGrid && on ? prodGrid.slice(i + 1).find(x => !k72Cerrado(x)) || null : null;
  K72.ultimo = p.id;
  if (S.abierto && PID[S.abierto]) { const d = $('#det .det-in'), y = d ? d.scrollTop : 0; pintarDetalle(PID[S.abierto]); const d2 = $('#det .det-in'); if (d2) d2.scrollTop = y; }
  if (S.vista === 'capturar') pintarGrid(); else k72PintarAvance();
  if (S.vista === 'distribuidores') pintarDistribuidores();
  if (enDet) { const b = document.querySelector(`#det [data-k72="${CSS.escape(p.id)}"]`); if (b) b.focus(); return; }
  if (enGrid) {
    const q = sig || p, b = document.querySelector(`#grid [data-k72="${CSS.escape(q.id)}"]`);
    if (b) { k95Mostrar(q); b.focus({ preventScroll: true }); b.closest('.pr').scrollIntoView({ block: 'nearest' }); }
    if (sig) { S.capProd = sig.id; pintarCapGraf(); }
  }
}
/* siguiente producto sin cerrar, en el orden de la captura (distribuidor y valor); si el distribuidor elegido ya está todo cerrado, el siguiente distribuidor */
function k72Base() { return P.filter(p => enDist(p) && p.cap.length).sort((a, b) => a.clase.localeCompare(b.clase) || pv(b, algPz6(b)) - pv(a, algPz6(a))); }
function k72Siguiente(desde) {
  let L = k72Base();
  if (!L.some(p => !k72Cerrado(p)) && S.dist !== 'TODOS') {
    const otro = P.filter(p => p.cap.length && !k72Cerrado(p)).sort((a, b) => a.clase.localeCompare(b.clase))[0];
    if (otro) { toast(`${S.dist}: todo cerrado. Sigue ${otro.clase}`); S.dist = otro.clase; S.capLim = CAP_LIM; pintarEncabezado(); L = k72Base(); desde = null; }
  }
  const i = desde ? L.findIndex(p => p.id === desde) : -1;
  const orden = i >= 0 ? L.slice(i + 1).concat(L.slice(0, i)) : L;      // después del actual y, al final, vuelve al principio
  const sig = orden.find(p => !k72Cerrado(p)) || L.find(p => !k72Cerrado(p));
  if (!sig) toast('No quedan productos sin cerrar');
  return sig || null;
}
function k72IrA(p) {
  K72.ultimo = p.id;
  const movil = matchMedia('(max-width:760px)').matches;      // en el celular se captura desde el detalle
  if (!listaCaptura().includes(p)) { S.q2 = ''; const q = $('#q2'); if (q) q.value = ''; S.chip2 = 'todos'; K72.filtro = 'todos'; pintarEncabezado(); }
  const ix = listaCaptura().indexOf(p); if (ix >= S.capLim) S.capLim = Math.ceil((ix + 1) / 25) * 25;
  if ($('#det').open || movil) { vista(S.vista); abrir(p.id); return; }
  if (S.vista !== 'capturar') vista('capturar'); else pintarGrid();
  k95Mostrar(p);      // 095: si su categoría está plegada, se abre
  const fila = document.querySelector(`#grid .pr[data-g="${CSS.escape(p.id)}"]`); if (!fila) return;
  fila.scrollIntoView({ block: 'center' });
  const inp = [...fila.querySelectorAll('.inp')].find(e => !e.readOnly);
  if (inp) inp.focus({ preventScroll: true }); else { const b = fila.querySelector('[data-k72]'); if (b) b.focus({ preventScroll: true }); }
}
/* diálogo del cierre total con productos sin cerrar */
function k72Dialogo() {
  const d = $('#k72-dlg'); if (!d) return false;
  const n = k72Cuenta(k72Prods()), falta = n.total - n.cerrado;
  const filas = D.clases.map(cl => { const ps = k72Prods(cl).filter(p => !k72Cerrado(p)); return ps.length ? [cl, k72Cuenta(ps), ps.length] : null; }).filter(Boolean);
  d.innerHTML = `<div class="dx-h"><div><span class="eyebrow">Marcar forecast como listo</span><h1 id="k72-dlg-t">Quedan ${falta} ${falta === 1 ? 'producto' : 'productos'} sin cerrar</h1></div></div>
    <div class="dx-b"><p>Llevas ${n.cerrado} de ${n.total} productos cerrados. Puedes ir al primero pendiente o marcar el forecast como listo igual: lo que no cerraste queda con los números que tiene hoy.</p>
    <ul class="k72-pl" aria-label="Productos sin cerrar por distribuidor">${filas.map(([cl, c, k]) => `<li><span><b>${esc(cl)}</b> <span class="muted">${k} sin cerrar${c.progreso ? ' · ' + c.progreso + ' en progreso' : ''}</span></span><button type="button" class="chip" data-k72-ir="${esc(cl)}" aria-label="Ir al primero pendiente de ${esc(cl)}">Ir</button></li>`).join('')}</ul>
    <form method="dialog" class="k72-acc"><button class="btn" value="">Cancelar</button><button class="btn" value="cerrar">Cerrar igual</button><button class="btn pri" value="ir" autofocus>Ir al primero pendiente</button></form></div>`;
  d.returnValue = ''; d.showModal(); return true;
}
{ const d = $('#k72-dlg');
  if (d) d.addEventListener('close', () => {
    const v = d.returnValue; d.returnValue = '';
    if (v === 'ir') { const p = k72Siguiente(null); if (p) k72IrA(p); }
    if (v === 'cerrar') { K72.forzar = true; const b = $('#b-listo'); if (b) b.click(); }
  }); }
/* el cierre total pasa por aquí antes que el manejador de siempre (fase de captura): con productos sin cerrar, primero el diálogo */
document.addEventListener('click', ev => {
  const b = ev.target.closest && ev.target.closest('#b-listo'); if (!b) return;
  if (K72.forzar) { K72.forzar = false; return; }
  if (VENCIDO || k72SoloLectura() || !db) return;
  const n = k72Cuenta(k72Prods()); if (n.cerrado >= n.total) return;
  if (k72Dialogo()) { ev.stopImmediatePropagation(); ev.preventDefault(); }
}, true);
document.addEventListener('click', ev => {
  const t = ev.target.closest && ev.target.closest('[data-k72],[data-k72-f],[data-k72-sig],[data-k72-plegar],[data-k72-ir],[data-k94-av],.k72-d'); if (!t) return;
  const ds = t.dataset;
  if (ds.k72) { const p = PID[ds.k72]; if (!p) return; const on = !k72Cerrado(p); if (!k72Poner(p, on)) return; toast(on ? (K72.guardados ? `Se ${K72.guardados === 1 ? 'guardó 1 cambio' : 'guardaron ' + K72.guardados + ' cambios'} y se cerró el producto` : 'Producto cerrado: sus casillas quedan bloqueadas') : 'Producto reabierto'); k72Despues(p, on, t); return; }
  if (ds.k72F) { K72.filtro = ds.k72F; S.capLim = CAP_LIM; pintarGrid(); const b = document.querySelector(`[data-k72-f="${ds.k72F}"]`); if (b) b.focus(); return; }
  if ('k72Plegar' in ds) { K72.plegar = !K72.plegar; k72GuardarPref(); pintarGrid(); const b = document.querySelector('[data-k72-plegar]'); if (b) b.focus(); return; }
  if ('k94Av' in ds) { K72.avPl = !K72.avPl; k72GuardarPref(); k72PintarAvance(true); const b = document.querySelector('[data-k94-av]'); if (b) b.focus(); return; }
  if ('k72Sig' in ds) { const p = k72Siguiente(S.abierto || K72.ultimo); if (p) k72IrA(p); return; }
  if (ds.k72Ir) { const d = $('#k72-dlg'); if (d && d.open) d.close(); S.dist = ds.k72Ir; S.capLim = CAP_LIM; pintarEncabezado(); const p = k72Siguiente(null); if (p) k72IrA(p); return; }
  if (t.classList.contains('k72-d')) { const b = document.querySelector(`.k72-d[data-k72-cl="${CSS.escape(ds.k72Cl)}"]`); if (b) b.focus(); }      // el manejador de data-d ya filtró y repintó
});
document.addEventListener('focusin', ev => { const el = ev.target; if (el.classList && el.classList.contains('inp') && el.closest('#grid') && LINES[el.dataset.line]) K72.ultimo = LINES[el.dataset.line].p.id; });
let rafK72 = 0;
const K72SUC = new Set();      // 094: productos cuyo estado puede haber cambiado ('*' = todos)
const k72Pronto = ev => {
  const x = (ev && ev.detail) || {}, L = x.clase ? LINES[x.clase + '__' + x.cod] : null; K72SUC.add(L ? L.p.id : '*');
  cancelAnimationFrame(rafK72);
  rafK72 = requestAnimationFrame(() => { if (K72SUC.has('*')) k72Badges(); else K72SUC.forEach(id => k72Badges(id)); K72SUC.clear(); if (S.vista === 'capturar') k72PintarAvance(true); else k72PintarListo(); });
};
document.addEventListener('fcst:captura', k72Pronto);      // pendiente → en progreso mientras se escribe
document.addEventListener('input', ev => { if (ev.target.dataset && ev.target.dataset.nota) k72Pronto(); });
/* solo lectura de BI: portal.js pone body.solo-lectura después de arrancar la página */
new MutationObserver(() => { const ro = k72SoloLectura(); if (ro === K72.ro) return; K72.ro = ro; k72PintarAvance(); if (S.abierto && PID[S.abierto]) k72Bloquear(); }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
k72PintarAvance();

/* ---------- arranque ---------- */
/* ---------- 092 · tránsito validado, cálculo y amortización del pedido sugerido, montos en USD (26-nov-2026, pedido del usuario) ----------
   Campos opcionales de datos.json (generar_portal_kam.py + fcst/restriccion.py); sin ellos no se muestra nada nuevo:
   - productos[].restriccion {aplica, motivo | doh, lt, ltTramos, objetivoDias, ventaDiariaPz, pzPorCaja, meses: [{mes, enCurso, inicialPz, llegaPz,
     llega[], compraPz, ventaPz, proyectadoPz, enCaminoPz, alcanzaDias, objetivoPz, faltaPz, faltaDias, sugeridoCajas, sugeridoPz, finalPz, diasFinal,
     forecastPz, estado}]}: final de un mes = inicial del siguiente; sugerido = máx(0, objetivo − queda − en camino) redondeado hacia arriba a cajas.
   - productos[].transito / pedidosProgramados con fuente 'validacion' y productos[].ordenesRecibidas (VALIDACION_ORDENES_EXPORTACION.xlsx de Melissa).
   - parametrosRestriccion {ficticio, porClase {CLASE: {dohObj, lt, contenedor, contenedorMes}}} y transitoValidado {ordenes, regla}.
   El estado contra tu forecast se recalcula en vivo con lo que escribes (kamPz); el sugerido no cambia: es el plan si compras lo sugerido. */
const PR92 = D.parametrosRestriccion || null, TV92 = D.transitoValidado || null;
const r92 = p => (p && p.restriccion && p.restriccion.aplica && Array.isArray(p.restriccion.meses)) ? p.restriccion : null;
const r92Mes = (p, m) => { const r = r92(p); return r ? r.meses.find(f => f.mes === m) || null : null; };
const r92Prueba = () => PR92 && PR92.ficticio ? `<span class="pill warn" title="Los días objetivo, el lead time y el contenedor del libro de parámetros todavía son de prueba (DATO = FICTICIO). Cuando la analista los confirme, los números cambian.">parámetros de prueba</span>` : '';
const r92Cj = (pz, r) => ok(pz) ? fN(pz / (r.pzPorCaja || 1)) : '—';
const R92E = { exceso: ['bad', 'Exceso: no pedir'], recortado: ['warn', 'Recortado'], corto: ['warn', 'Tu forecast queda corto'], coincide: ['good', 'Coincide'], sinPedido: ['', 'Sin pedido'] };
function r92Estado(p, m) {
  const f = r92Mes(p, m), r = r92(p); if (!f || f.enCurso) return null;
  const k = kamPz(p, m), tol = (r.pzPorCaja || 1) + 0.5;
  if (!(f.faltaPz > 0)) return k > 0.5 ? 'exceso' : 'sinPedido';
  return k > f.sugeridoPz + tol ? 'recortado' : k < f.sugeridoPz - tol ? 'corto' : 'coincide';
}
const r92Obj = r => r.lt > 0 ? `${fN(r.doh)} días + ${fN(r.lt)} de tránsito` : `${fN(r.doh)} días`;
function r92Texto(p, m, conKam) {
  const r = r92(p), f = r92Mes(p, m); if (!f || f.enCurso) return '';
  const obj = r92Obj(r);
  let t;
  if (f.alcanzaDias == null) t = `En ${ml(m)} no hay venta reciente para medir días; con el inventario que tiene, no hace falta pedir.`;
  else if (!(f.faltaPz > 0)) t = `En ${ml(m)} tu inventario alcanza para ${diasTxt(f.alcanzaDias)}; el objetivo es ${obj}, así que te sobran ${diasTxt(Math.max(0, f.alcanzaDias - r.objetivoDias))}: no hace falta pedir.`;
  else t = `En ${ml(m)} tu inventario alcanza para ${diasTxt(f.alcanzaDias)}; el objetivo es ${obj}, así que te faltan ${diasTxt(f.faltaDias)} = ${fN(f.sugeridoCajas)} ${f.sugeridoCajas === 1 ? 'caja' : 'cajas'}.`;
  if (conKam) {
    const k = kamPz(p, m), e = r92Estado(p, m), kc = k / (r.pzPorCaja || 1);
    t += ` Tú pusiste ${k83Cant(kc)} ${Math.round(kc) === 1 ? 'caja' : 'cajas'}` + (e === 'exceso' ? ': con este inventario conviene no pedir ese mes.' : e === 'recortado' ? `: ${fN(kc - f.sugeridoCajas)} más de lo sugerido.` : e === 'corto' ? `: ${fN(f.sugeridoCajas - kc)} menos de lo sugerido (riesgo de quedar bajo el objetivo).` : '.');
  }
  return t;
}
/* pista junto a la casilla de Capturar (código principal, en la unidad del código): "sug. 80 · recortado" */
function r92Pista(p, c, m) {
  const r = r92(p), f = r92Mes(p, m); if (!r || !f || f.enCurso || !(c.cod === p.principal || (!p.cap.some(x => x.cod === p.principal) && c === p.cap[0]))) return '';
  const u = c.pzPorU || 1, e = r92Estado(p, m);
  return `<br><span class="r92-h e-${e}" data-r92h="${esc(p.id)}" data-m="${m}" title="${esc(r92Texto(p, m, true))}">sug. ${fN1(f.sugeridoPz / u)}${e ? ' · ' + esc(R92E[e][1].toLowerCase().replace('tu forecast queda corto', 'corto')) : ''}</span>`;
}
/* resumen en la fila del producto (Capturar) */
function r92Resumen(p) {
  const r = r92(p);
  if (!r) return p.restriccion && PR92 && !p.restriccion.aplica ? `<span class="pill" title="${esc(p.restriccion.motivo || '')}">sin restricción</span>` : '';
  const sug = MK.reduce((a, m) => a + ((r92Mes(p, m) || {}).sugeridoCajas || 0), 0), k = kamPzM(p, MK) / (r.pzPorCaja || 1);
  const ex = MK.filter(m => r92Estado(p, m) === 'exceso').length, rc = MK.filter(m => r92Estado(p, m) === 'recortado').length;
  return `<span class="r92-res" data-r92res="${esc(p.id)}">Pedido sugerido <b>${fN(sug)}</b> cajas · tú ${k83Cant(k)}${ex ? ` · ${pill('bad', ex + (ex === 1 ? ' mes' : ' meses') + ' exceso: no pedir')}` : ''}${rc ? ` · ${pill('warn', rc + (rc === 1 ? ' mes recortado' : ' meses recortados'))}` : ''}</span> <button type="button" class="chip" data-r92ver="${esc(p.id)}">Ver cálculo</button>`;
}
function r92Refrescar(p) {
  if (!r92(p)) return;
  const raices = [GEL.get(p.id), S.abierto === p.id ? $('#det') : null].filter(Boolean);      // 094: solo el bloque del producto y el detalle
  raices.forEach(raiz => {
    raiz.querySelectorAll('[data-r92h]').forEach(el => { const m = el.dataset.m, f = r92Mes(p, m), e = r92Estado(p, m), c = p.cap.find(x => x.cod === p.principal) || p.cap[0], u = (c && c.pzPorU) || 1;
      el.className = 'r92-h e-' + e;
      if (el.hasAttribute('data-corto')) { el.innerHTML = k94SugTxt(f.sugeridoPz / u, e); return; }      // 094: pista de una línea en la grilla (el porqué va en el tooltip)
      el.title = r92Texto(p, m, true); el.textContent = 'sug. ' + fN1(f.sugeridoPz / u) + (e ? ' · ' + R92E[e][1].toLowerCase().replace('tu forecast queda corto', 'corto') : ''); });
    raiz.querySelectorAll('[data-r92res]').forEach(el => { const w = document.createElement('span'); w.innerHTML = r92Resumen(p); el.replaceWith(w.firstElementChild); });
  });
  const sec = $('#r92-sec'); if (sec && S.abierto === p.id) sec.outerHTML = r92Html(p);
}
/* ---------- detalle: inventario reportado + órdenes en tránsito + pedidos + lo que ya llegó, y el total que cuenta ---------- */
const r92Est = o => o.recibida === 'NO' ? 'no recibida' : o.recibida === 'PARCIAL' ? `recibida en parte (${fN(o.cajasRecibidas || 0)} cajas)` : o.recibida === 'SI' ? 'recibida' : 'sin validar';
const r92Origen = o => o.origen === 'MELISSA' ? pill('good', 'Melissa') : o.origen === 'SIMULADO' ? `<span class="pill" title="Todavía no la valida Melissa: se estimó con las fechas (factura + lead time contra la foto del inventario)">simulado</span>` : pill('warn', 'sin validar');
const r92Corto = n => { const t = String(n || ''); return /^\d{9,}$/.test(t) ? t.slice(-4) : t; };      // factura de Softland 00100001090000000994 → 0994 (la completa va en el title)
const r92Num = o => (o.tipo === 'PEDIDO' ? 'Pedido ' : 'Factura ') + r92Corto(o.orden);
function r92Transito(p) {
  const tr = (p.transito && p.transito.ordenes) || [], pg = (progDe(p) || {}).ordenes || [], rc = p.ordenesRecibidas || [];
  if (!tr.length && !pg.length && !rc.length) return '';
  const ip = invPartes(p) || { dist: 0, tr: 0, tot: 0 }, cu = o => o.cajasProducto != null ? o.cajasProducto : o.cajas;
  const fila = (o, cajas, extra) => `<tr><td class="l" title="${esc(o.orden)}">${esc(r92Num(o))}</td><td class="l">${esc(fechaCorta(o.tipo === 'PEDIDO' ? o.fechaPedido : o.fechaFactura))}</td><td><b>${fN(cajas)}</b><small class="muted" style="display:block">de ${fN(o.cajasOrden)} de la orden</small></td><td class="l">~${esc(fechaCorta(o.fechaLlegada))}</td><td class="l" style="white-space:normal">${extra}</td></tr>`;
  const cab = (t, c4) => `<thead><tr><th class="l">${t}</th><th class="l">Fecha</th><th>Cajas de este producto</th><th class="l">Llegada estimada</th><th class="l">${c4}</th></tr></thead>`;
  const corte = (tr[0] || rc[0] || {}).fechaCorte;
  return `<div class="r92-tr">
    <p class="prosa"><b>Inventario que cuenta: ${fN(ip.dist)} pz reportadas</b> al ${esc(fechaCorta(p.inv && p.inv.fecha))}${corte && p.inv && corte !== p.inv.fecha ? ` (foto real del ${esc(fechaCorta(corte))})` : ''}${ip.tr ? ` <b>+ ${fN(ip.tr)} pz en tránsito = ${fN(ip.tot)} pz</b>` : ''}.${pg.length ? ` Los pedidos sin factura (${fN(pg.reduce((a, o) => a + (+o.pz || 0), 0))} pz) no suman días: el pedido sugerido los cuenta en el mes en que llegan.` : ''}</p>
    ${tr.length ? `<div class="tw" role="region" tabindex="0" aria-label="Órdenes en tránsito"><table class="tbl r92-ot"><caption>En tránsito: facturadas que no habían llegado cuando ${esc(quienLlama(p.clase))} tomó la foto del inventario (suman)</caption>${cab('Orden', 'Estado y quién lo dice')}<tbody>${tr.map(o => fila(o, o.cajas, `${esc(r92Est(o))} ${r92Origen(o)}${o.recibida === 'PARCIAL' ? '<small class="muted" style="display:block">cuentan las cajas pendientes</small>' : ''}`)).join('')}</tbody></table></div>` : ''}
    ${pg.length ? `<div class="tw" role="region" tabindex="0" aria-label="Pedidos sin factura"><table class="tbl r92-ot"><caption>Pedidos ya hechos, todavía sin factura (no suman días)</caption>${cab('Pedido', 'Estado')}<tbody>${pg.map(o => fila(o, cu(o), 'pedido en Softland, sin factura')).join('')}</tbody></table></div>` : ''}
    ${rc.length ? `<details class="mas-info"><summary>${rc.length} ${rc.length === 1 ? 'factura ya llegó' : 'facturas ya llegaron'} antes del corte: ya están en el inventario reportado, no se suman</summary><div class="tw" role="region" tabindex="0" aria-label="Órdenes ya recibidas"><table class="tbl r92-ot">${cab('Orden', 'Estado y quién lo dice')}<tbody>${rc.map(o => fila(o, cu(o), `${esc(r92Est(o))}${o.fechaRecepcion ? ' el ' + esc(fechaCorta(o.fechaRecepcion)) : ''} ${r92Origen(o)}`)).join('')}</tbody></table></div></details>` : ''}
    ${BI_DET(`<p class="tec">${esc((TV92 && TV92.regla) || '')} Archivo: ${esc((TV92 && TV92.archivo) || '')} (${esc((TV92 && TV92.modificado) || '')})${TV92 && TV92.enConstruccion ? ' · el libro dice "en construcción"' : ''}.</p>`)}
  </div>`;
}
/* ---------- detalle: cálculo y amortización mes a mes ---------- */
function r92Grafico(r) {
  const ms = r.meses.filter(f => !f.enCurso); if (!ms.length) return '';
  const W = 560, H = 150, iz = 34, dr = 8, top = 10, bot = 24, mx = Math.max(r.objetivoDias * 1.25, ...ms.map(f => Math.max(f.alcanzaDias || 0, f.diasFinal || 0)), 10);
  const y = v => top + (H - top - bot) * (1 - Math.min(v, mx) / mx), bw = (W - iz - dr) / ms.length;
  let g = `<line x1="${iz}" x2="${W - dr}" y1="${y(r.objetivoDias)}" y2="${y(r.objetivoDias)}" class="r92-gobj"/><text x="${W - dr}" y="${y(r.objetivoDias) - 4}" text-anchor="end" class="r92-gt">objetivo ${fN(r.objetivoDias)} días</text>`;
  [0, Math.round(mx / 2)].forEach(v => { g += `<text x="${iz - 4}" y="${y(v) + 4}" text-anchor="end" class="r92-gt">${fN(v)}</text>`; });
  ms.forEach((f, i) => { const x = iz + i * bw, a = f.alcanzaDias || 0, fi = f.diasFinal || 0;
    g += `<rect x="${(x + bw * 0.18).toFixed(1)}" y="${y(fi).toFixed(1)}" width="${(bw * 0.64).toFixed(1)}" height="${(y(0) - y(fi)).toFixed(1)}" class="r92-gfin"><title>${esc(ml(f.mes))}: con el sugerido, ${diasTxt(fi)}</title></rect>`
      + `<rect x="${(x + bw * 0.18).toFixed(1)}" y="${y(a).toFixed(1)}" width="${(bw * 0.64).toFixed(1)}" height="${(y(0) - y(a)).toFixed(1)}" class="r92-galc ${f.faltaPz > 0 ? '' : 'sobra'}"><title>${esc(ml(f.mes))}: sin comprar alcanza para ${diasTxt(a)}</title></rect>`
      + `<text x="${(x + bw / 2).toFixed(1)}" y="${H - 8}" text-anchor="middle" class="r92-gt">${esc(ml(f.mes))}</text>`; });
  return `<figure class="r92-g"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Días de inventario por mes: lo que alcanza sin comprar y con el pedido sugerido, contra el objetivo de ${fN(r.objetivoDias)} días">${g}</svg>
    <figcaption class="small muted"><span class="r92-k alc"></span> alcanza sin comprar · <span class="r92-k fin"></span> con el pedido sugerido · línea = objetivo</figcaption></figure>`;
}
function r92Html(p) {
  const r = r92(p);
  if (!r) return p.restriccion && PR92 ? `<section class="panel r92" id="r92-sec"><div class="panel-h"><h2>Cálculo del pedido sugerido</h2>${r92Prueba()}</div><p class="prosa">Sin restricción: ${esc(p.restriccion.motivo || 'no aplica')}. Tu forecast no se compara contra el inventario.</p></section>` : '';
  const ms = r.meses, m1 = MK.find(m => r92Mes(p, m)), cont = ((PR92.porClase || {})[p.clase] || {}).contenedorMes, cajaTxt = 'cajas de ' + fN(r.pzPorCaja) + ' pz';
  const th = ms.map(f => `<th scope="col"${f.enCurso ? ' class="r92-cur"' : ''}>${esc(ml(f.mes))}${f.enCurso ? '<small>en curso</small>' : ''}</th>`).join('');
  const fila = (lb, fn, cls, tit) => `<tr${cls ? ` class="${cls}"` : ''}><th scope="row" class="l"${tit ? ` title="${esc(tit)}"` : ''}>${lb}</th>${ms.map(f => `<td${f.enCurso ? ' class="r92-cur"' : ''}>${fn(f)}</td>`).join('')}</tr>`;
  const llegaT = f => f.llegaPz > 0 ? `<span title="${esc(f.llega.map(l => (l.tipo === 'pedido' ? 'Pedido ' : 'Factura ') + r92Corto(l.orden) + ': ' + fN(l.pz) + ' pz, llega ~' + fechaCorta(l.fecha)).join(' · '))}">+${r92Cj(f.llegaPz, r)}</span>` : '0';
  const est = f => { const e = r92Estado(p, f.mes); return e ? pill(R92E[e][0], R92E[e][1]) : '—'; };
  const enCamino = ms.some(f => f.enCaminoPz > 0);
  const contF = f => { const c = cont && cont.porMes && cont.porMes[f.mes]; return !c || !c.contenedores ? '—' : `<span title="${esc(fN1(c.m3) + ' m³ de todos los sugeridos de ' + p.clase + ' en ' + ml(f.mes) + '; ' + cont.tipo + ' útil ' + fN1(cont.m3Util) + ' m³')}">${c.contenedores} × ${esc(cont.tipo)}<small style="display:block">último al ${nf.format(c.llenadoUltimo * 100)} %</small></span>`; };
  const tramos = r.ltTramos && r.lt > 0 ? ` (${fN(r.ltTramos.pedidoFactura)} pedido→factura + ${fN(r.ltTramos.facturaEmbarque)} factura→embarque + ${fN(r.ltTramos.transito)} de viaje)` : '';
  return `<section class="panel r92" id="r92-sec" aria-labelledby="r92-t"><div class="panel-h"><h2 id="r92-t">¿Cuánto conviene pedir? Cálculo mes a mes</h2>${r92Prueba()}<span class="nota">en ${esc(cajaTxt)} · es una sugerencia: no bloquea tu captura</span></div>
    ${m1 ? `<p class="r92-lead">${esc(r92Texto(p, m1, true))}</p>` : ''}
    <div class="r92-par">
      <span><small>Venta diaria</small><b>${fN1(r.ventaDiariaPz)} pz</b><small>${r.ventana ? esc(rango(r.ventana.meses)) : ''}</small></span>
      <span><small>Días objetivo</small><b>${fN(r.doh)}</b><small>${r.dohFuente === 'producto' ? 'de este producto' + (r.dohMotivo ? ': ' + esc(r.dohMotivo) : '') : 'de ' + esc(p.clase)}</small></span>
      ${r.lt > 0 ? `<span><small>Lead time (tránsito)</small><b>${fN(r.lt)} días</b><small>${esc(tramos.replace(/^ \(|\)$/g, ''))}</small></span>` : `<span><small>Lead time</small><b>no aplica</b><small>Costa Rica: solo días objetivo</small></span>`}
      <span><small>Objetivo</small><b>${fN(r.objetivoDias)} días</b><small>= ${r92Cj(r.ventaDiariaPz * r.objetivoDias, r)} cajas</small></span>
    </div>
    ${r92Grafico(r)}
    <div class="tw r92-tw" role="region" tabindex="0" aria-label="Amortización mes a mes"><table class="tbl r92-t"><thead><tr><th class="l" scope="col">En ${esc(cajaTxt)}</th>${th}</tr></thead><tbody>
      ${fila('Inventario inicial', f => r92Cj(f.inicialPz, r))}
      ${fila('+ Llega (tránsito y pedidos)', llegaT)}
      ${fila(`+ Resto de tu forecast de ${esc(ml(MC))}`, f => f.enCurso ? r92Cj(f.compraPz, r) : '', '', 'El mes en curso no se captura: se suma lo que falta facturar de tu forecast oficial (sin contar lo que ya está facturado o pedido).')}
      ${fila('− Venta proyectada', f => `<span title="${esc(f.ventaFuente)}">−${r92Cj(f.ventaPz, r)}</span>`)}
      ${fila('= Queda al cierre', f => `<b>${r92Cj(f.proyectadoPz, r)}</b>${f.quiebre ? (f.enCurso ? '<small class="down" style="display:block">se acaba antes</small>' : '<small class="warn" style="display:block">sin pedir no alcanza el mes</small>') : ''}`, 'r92-sub', 'Antes del pedido del mes. Si es negativo, la venta del mes pasa lo que hay y el pedido de ese mes tiene que cubrirla.')}
      ${enCamino ? fila('Ya viene en camino (llega después)', f => f.enCaminoPz > 0 ? r92Cj(f.enCaminoPz, r) : '0', '', 'Ya está comprado: no se vuelve a pedir.') : ''}
      ${fila('Alcanza para', f => f.enCurso ? '' : f.alcanzaDias == null ? '—' : diasTxt(f.alcanzaDias))}
      ${fila('Objetivo', f => f.enCurso ? '' : diasTxt(f.objetivoDias), '', r.lt > 0 ? r92Obj(r) : 'días objetivo')}
      ${fila('Falta', f => f.enCurso ? '' : f.faltaPz > 0 ? r92Cj(f.faltaPz, r) + `<small style="display:block">${diasTxt(f.faltaDias)}</small>` : '0')}
      ${fila('Pedido sugerido', f => f.enCurso ? '' : `<b>${fN(f.sugeridoCajas)}</b>`, 'r92-sug', 'Lo que falta, redondeado hacia arriba a cajas completas')}
      ${fila('Inventario final (con el sugerido)', f => r92Cj(f.finalPz, r), '', 'Queda + sugerido. Es el inventario inicial del mes siguiente.')}
      ${fila('Días con el sugerido', f => f.enCurso || f.diasFinal == null ? '' : diasTxt(f.diasFinal))}
      ${cont ? fila('Contenedor (todos los sugeridos de ' + esc(p.clase) + ')', f => f.enCurso ? '' : contF(f)) : ''}
      ${fila('Tu forecast', f => k83Cant(kamPz(p, f.mes) / (r.pzPorCaja || 1)), 'r92-kam')}
      ${fila('Estado', f => f.enCurso ? '<small class="muted">no se captura</small>' : est(f))}
    </tbody></table></div>
    <p class="small muted" style="margin-top:6px">Cada mes: inicial + lo que llega − venta proyectada (pronóstico estimado) = queda. Falta = objetivo − queda${enCamino ? ' − lo que ya viene en camino' : ''}. El pedido sugerido redondea lo que falta a cajas completas, y el inventario final (queda + sugerido) es el inicial del mes siguiente.${r.lt > 0 ? ' En exportación el objetivo suma el lead time: lo que pides hoy llega en ' + diasTxt(r.lt) + '.' : ''}</p>
    <details class="mas-info"><summary>Leer mes por mes</summary><ul class="r92-ul">${MK.filter(m => r92Mes(p, m)).map(m => `<li>${esc(r92Texto(p, m, true))}</li>`).join('')}</ul></details>
  </section>`;
}
/* ---------- vista Distribuidores: inventario, tránsito y pedidos por distribuidor (órdenes completas) + venta facturada en USD ---------- */
function r92Dist() {
  const el = $('#r92-dist'); if (!el) return;
  const cls = D.clases.filter(cl => (TV92 && (TV92.ordenes || []).some(o => o.clase === cl)) || ((PR92 || {}).porClase || {})[cl]);
  if (!TV92 && !PR92 && !MON.tc) { el.hidden = true; return; }
  el.hidden = false;
  const usd = D.usd && D.usd.sellInUsd ? D.usd : null, tri = MH.slice(-3);
  const filas = cls.map(cl => {
    const ps = P.filter(p => p.clase === cl), rep = ps.reduce((a, p) => a + (p.inv ? (invPartes(p) || {}).dist || 0 : 0), 0), trz = ps.reduce((a, p) => a + (p.inv ? (invPartes(p) || {}).tr || 0 : 0), 0);
    const os = TV92 ? (TV92.ordenes || []).filter(o => o.clase === cl) : [], pc = ((PR92 || {}).porClase || {})[cl], d = D.distribuidores[cl] || {};
    const foto = os.map(o => o.fechaCorte).filter(Boolean).sort().pop(), pend = os.filter(o => o.tipo === 'PEDIDO'), fac = os.filter(o => o.tipo !== 'PEDIDO');
    const nr = ps.filter(r92).length, cm = pc && pc.contenedorMes;
    const tab = !os.length ? (pc && pc.tipo === 'EXPORTACION' && TV92 ? '<p class="small muted">Sin facturas ni pedidos de exportación en el libro de validación.</p>' : '') : `<div class="tw" role="region" tabindex="0" aria-label="Órdenes de ${esc(cl)}"><table class="tbl r92-ot"><thead><tr><th class="l">Orden</th><th class="l">Fecha</th><th>Cajas</th><th class="l">Llegada estimada</th><th class="l">Estado</th><th class="l">Respuesta</th><th>Piezas que suman</th></tr></thead><tbody>
      ${fac.concat(pend).map(o => `<tr><td class="l" title="${esc(o.orden)}">${esc(r92Num(o))}</td><td class="l">${esc(fechaCorta(o.tipo === 'PEDIDO' ? o.fechaPedido : o.fechaFactura))}</td><td>${fN(o.cajas)}</td><td class="l">~${esc(fechaCorta(o.fechaLlegada))}</td><td class="l">${o.tipo === 'PEDIDO' ? 'pedido sin factura' : esc(r92Est(o))}${o.aviso ? `<small class="warn" style="display:block">${esc(o.aviso)}</small>` : ''}</td><td class="l">${o.tipo === 'PEDIDO' ? '—' : r92Origen(o)}</td><td>${o.tipo === 'PEDIDO' ? '<small class="muted">no suman días</small>' : o.pzTransito > 0 ? '<b>' + fN(o.pzTransito) + '</b>' : '0 · ya llegó'}</td></tr>`).join('')}</tbody></table></div>`;
    const sv = usd && usd.sellInUsd[cl] ? tri.reduce((a, m) => a + (+usd.sellInUsd[cl][m] || 0), 0) : null;
    return `<details class="r92-d"${S.dist === cl || cls.length === 1 ? ' open' : ''}><summary><b>${esc(cl)}</b><span class="muted">${esc((d.fuente || []).filter(x => x !== cl).join('/') || '')}</span>
      <span>reportado <b>${fN(rep)} pz</b>${trz ? ` + tránsito <b>${fN(trz)} pz</b>` : ''}${pend.length ? ` · ${pend.length} ${pend.length === 1 ? 'pedido' : 'pedidos'} sin factura` : ''}</span>${sv != null ? `<span>facturado 3M <b>US$${fCx(sv)}</b></span>` : ''}</summary>
      <p class="prosa small">Inventario reportado al <b>${esc(fechaCorta(d.invFecha))}</b>${foto && foto !== d.invFecha ? ` (foto real del ${esc(fechaCorta(foto))})` : ''}: ${fN(rep)} pz. Suman además las facturas que no habían llegado a esa fecha (${fN(trz)} pz). Las que ya llegaron están dentro del inventario reportado y no se suman.${pc ? ` Parámetros: ${fN(pc.dohObj)} días objetivo${pc.lt > 0 ? ' + ' + fN(pc.lt) + ' de lead time' : ''}${pc.contenedor ? ' · contenedor ' + esc(pc.contenedor) : ''}${pc.aplica ? '' : ' · <b>sin restricción</b> (' + esc(pc.comentario || 'APLICA = NO') + ')'}.` : ''}${nr ? ` ${nr} productos con pedido sugerido.` : ''} ${r92Prueba()}</p>
      ${tab}
      ${cm && cm.porMes ? `<p class="small muted" style="margin-top:6px">Contenedor con todos los pedidos sugeridos: ${Object.entries(cm.porMes).map(([m, c]) => `${esc(ml(m))} ${fN1(c.m3)} m³ = ${c.contenedores} × ${esc(cm.tipo)}${c.contenedores ? ' (último al ' + nf.format(c.llenadoUltimo * 100) + ' %)' : ''}`).join(' · ')}.</p>` : ''}
      ${sv != null ? `<p class="small muted">Facturado por Brinova ${esc(rango(tri))}: US$${nf.format(sv)} (colones de DATA SELL IN ÷ tipo de cambio promedio de Softland de cada mes: ${tri.map(m => ml(m) + ' ' + nf2.format(usd.tcMes[m] || 0)).join(', ')}).</p>` : ''}
    </details>`;
  }).join('');
  el.innerHTML = `<div class="panel-h"><h2 id="r92-dt">Inventario, tránsito y pedidos por distribuidor</h2>${r92Prueba()}</div>${r93Resumen()}${filas || '<p class="prosa">Tus distribuidores no tienen órdenes de exportación ni parámetros de inventario.</p>'}`;
}
/* 093-TRANSITO (26-nov, pedido del usuario: "quiero verlo en mi web"): tabla resumen arriba de los bloques por distribuidor con TODO lo que está
   en tránsito (facturas que no habían llegado a la fecha del reporte de inventario, según Melissa o simulado por fechas), una fila por factura,
   con total; los pedidos sin factura van en una línea aparte (no suman como inventario). Fuente: datos.transitoValidado (libro de validación). */
function r93Resumen() {
  if (!TV92 || !(TV92.ordenes || []).length) return '';
  const tr = TV92.ordenes.filter(o => o.tipo !== 'PEDIDO' && (+o.pzTransito || 0) > 0).map(o => {
    const f = (+o.piezas || 0) > 0 ? (+o.pzTransito || 0) / (+o.piezas) : 1;
    return { o, cajas: (+o.cajas || 0) * f, pz: +o.pzTransito || 0, usd: (+o.montoUsd || 0) * f };
  }).sort((a, b) => b.usd - a.usd);
  const ped = TV92.ordenes.filter(o => o.tipo === 'PEDIDO');
  if (!tr.length && !ped.length) return '';
  const tot = tr.reduce((a, x) => ({ cajas: a.cajas + x.cajas, pz: a.pz + x.pz, usd: a.usd + x.usd }), { cajas: 0, pz: 0, usd: 0 });
  const pc = ped.reduce((a, o) => ({ cajas: a.cajas + (+o.cajas || 0), usd: a.usd + (+o.montoUsd || 0) }), { cajas: 0, usd: 0 });
  const sim = tr.some(x => (x.o.origen || '').toUpperCase() !== 'MELISSA');
  const th = 'Distribuidor|Cliente|Factura|Facturada|Llegada estimada|Corte del inventario|Cajas|Piezas|US$|Respuesta'.split('|');
  return `<div class="r93"><h3 style="margin:4px 0 6px">Producto en tránsito: ${tr.length} ${tr.length === 1 ? 'factura' : 'facturas'} · ${fN(tot.pz)} pz · US$${nf.format(Math.round(tot.usd))}</h3>
    <p class="small muted" style="margin:0 0 6px">Facturas que todavía no habían llegado cuando cada distribuidor tomó la foto de su inventario. Llegada estimada = fecha de factura + días de embarque y tránsito (lead time del libro de parámetros)${sim ? '; las respuestas marcadas “simulado” salen de las fechas y las confirma Melissa' : ''}.</p>
    <div class="tw" role="region" tabindex="0" aria-label="Producto en tránsito por distribuidor"><table class="tbl r93-t"><thead><tr>${th.map((h, i) => `<th${i < 3 || i === 9 ? ' class="l"' : ''}>${h}</th>`).join('')}</tr></thead><tbody>
    ${tr.map(x => `<tr><td class="l"><b>${esc(x.o.clase)}</b></td><td class="l">${esc(x.o.cliente || '')}</td><td class="l" title="${esc(x.o.orden)}">${esc(r92Corto(x.o.orden))}</td><td>${esc(fechaCorta(x.o.fechaFactura))}</td><td>${esc(fechaCorta(x.o.fechaLlegada))}</td><td>${esc(fechaCorta(x.o.fechaCorte))}</td><td>${fN(Math.round(x.cajas))}</td><td>${fN(x.pz)}</td><td>${nf.format(Math.round(x.usd))}</td><td class="l">${(x.o.origen || '').toUpperCase() === 'MELISSA' ? 'Melissa' : '<span class="muted">simulado</span>'}${x.o.recibida === 'PARCIAL' ? ' · parcial' : ''}</td></tr>`).join('')}
    <tr class="tot"><td class="l"><b>Total</b></td><td></td><td></td><td></td><td></td><td></td><td><b>${fN(Math.round(tot.cajas))}</b></td><td><b>${fN(tot.pz)}</b></td><td><b>${nf.format(Math.round(tot.usd))}</b></td><td></td></tr>
    </tbody></table></div>
    ${ped.length ? `<p class="small muted" style="margin:6px 0 10px">Además ${ped.length} ${ped.length === 1 ? 'pedido' : 'pedidos'} sin facturar (${esc([...new Set(ped.map(o => o.clase))].join(', '))}): ${fN(pc.cajas)} cajas · US$${nf.format(Math.round(pc.usd))}. No suman como inventario: van como pedidos programados.</p>` : ''}</div>`;
}
document.addEventListener('click', ev => {
  const b = ev.target.closest('[data-r92ver]'); if (!b) return;
  abrir(b.dataset.r92ver); requestAnimationFrame(() => { const s = $('#r92-sec'); if (s) s.scrollIntoView({ block: 'start' }); });
});
pintarEncabezado(); pintarMetodo(); vista('tendencia');
/* 25-nov · órdenes de exportación en vivo: si la cuenta puede leer ordenes.json (rol EXPORTACION), reemplaza el tránsito y los pedidos
   programados del generador (app_1_base.js › aplicarOrdenesVivo). Si no, queda lo de datos.json. Solo en la web (portal.js › portalOrdenes). */
if (typeof window.portalOrdenes === 'function' && conExportacion()) {
  window.portalOrdenes().then(x => {
    if (!x || !aplicarOrdenesVivo(x)) return;
    pintarEncabezado(); vista(S.vista); if (S.abierto) refrescarDetalle(PID[S.abierto]);
  }).catch(() => { });
}
if (VENCIDO) $('#b-listo').disabled = true;
(async () => {
  if (!window.claude || !window.claude.use) {
    try { const g = JSON.parse(localStorage.getItem(LS_K82G) || 'null'); if (g && typeof g === 'object') { remote = g; sincronizarInputs(); refrescarResumen(); pintarCiclo(); } } catch (e) { }      // 082-MESES: lo guardado en este navegador (sin OneDrive)
    K82G.listo = 'Sin conexión: Guardar lo deja en este navegador'; estado(K82G.listo, 'pend'); k82Oferta(); return;
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
    K82G.listo = K82G.listo && /^Guardado \d/.test(K82G.listo) ? K82G.listo : VENCIDO ? 'Captura cerrada · solo lectura' : snap.size ? 'Guardado al día' : 'Listo para capturar';
    if (!pendientes) { if (k82N()) estado('Sin guardar', 'pend'); else estado(K82G.listo, 'ok'); }      // 082-MESES
    sincronizarInputs(); refrescarResumen(); pintarCiclo();      // 094: la línea de BI dice cuándo se guardó la captura
  }, () => { clearTimeout(t10); estado('No se pudo leer lo guardado', 'err'); });
  db.doc(`ciclos/${CID}`).onSnapshot(d => { envio = d.exists ? d.data() : null; pintarEnvio(); }, () => { });
  k82Oferta();
})();

};
/* ======================================================================================================
   Órdenes de exportación (25-nov-2026) · módulo de la web (rol EXPORTACION: Melissa, Mónica y BI)
   Brief: 14 EXPORTACION/BRIEF_SISTEMA_ORDENES.md (contrato ordenes-v1).  Informe: 14 EXPORTACION/INFORME_WEB.md.
   - Solo en la web: construir_web.py lo agrega a app.js FUERA de iniciarPortal (no depende de los datos de un KAM).
     El portal de revisión que arma generar_portal_kam.py no lo incluye.
   - Lee datos_exportacion.json (maestros) y lee/escribe ordenes.json con eTag (If-Match): portal.js le da el "almacen".
     Si otra persona guardó antes (412/409), recarga, avisa y no pisa nada.
   - Derivados (no se guardan; misma regla que Python, Excel y el dataflow):
       PIEZAS = cajas × piezas por caja (T_SKU, vigente en fechaOc) · PRECIO = T_PRECIOS_EXPORTACION cliente + código con
       VIGENTE_DESDE ≤ fechaOc ≤ VIGENTE_HASTA (o precio manual) · M3 = m³ caja × cajas · MONTO OC = pedidas × precio ·
       MONTO FACTURA = confirmadas × precio · BO = pedidas − confirmadas · VALOR ₡ = USD × T_TIPO_CAMBIO vigente en fechaOc.
       Sin precio o sin m³ se avisa: nunca un 0 silencioso.
   - window.Ordenes.indicadores(): líneas en tránsito / programadas para el inventario del KAM (portal.js › portalOrdenes).
   - Contenedor 3D: núcleo de app_2_vistas.js (window.iniciarPortal('nucleo3D')).
   ====================================================================================================== */
(function () {
  'use strict';
  /* ---------- formatos ---------- */
  const MESC = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'];
  const MESL = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const nf0 = new Intl.NumberFormat('es-CR', { maximumFractionDigits: 0 });
  const nf1 = new Intl.NumberFormat('es-CR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const nf2 = new Intl.NumberFormat('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const ok = v => v != null && v !== '' && isFinite(v);
  const num = v => { if (v == null || v === '') return null; const n = +v; return isFinite(n) ? n : null; };
  const fN = v => ok(v) ? nf0.format(Math.round(v)) : '—';
  const fM3 = v => ok(v) ? nf1.format(v) : '—';
  const fUsd = v => ok(v) ? 'USD ' + nf0.format(Math.round(v)) : '—';
  const fCrc = v => ok(v) ? '₡' + nf0.format(Math.round(v)) : '—';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ml = m => /^\d{4}-\d{2}$/.test(m || '') ? MESC[+m.slice(5, 7) - 1] + ' ' + m.slice(2, 4) : (m || 'sin mes');
  const mll = m => /^\d{4}-\d{2}$/.test(m || '') ? MESL[+m.slice(5, 7) - 1] + ' ' + m.slice(0, 4) : 'Sin mes de embarque';
  const fecha = f => f ? String(f).slice(8, 10) + '/' + String(f).slice(5, 7) + '/' + String(f).slice(0, 4) : '—';
  const dosD = n => String(n).padStart(2, '0');
  const hoy = () => { const d = new Date(); return d.getFullYear() + '-' + dosD(d.getMonth() + 1) + '-' + dosD(d.getDate()); };
  const mesHoy = () => hoy().slice(0, 7);
  const ahoraIso = () => { const d = new Date(), o = -d.getTimezoneOffset(), s = o >= 0 ? '+' : '-', a = Math.abs(o);
    return `${d.getFullYear()}-${dosD(d.getMonth() + 1)}-${dosD(d.getDate())}T${dosD(d.getHours())}:${dosD(d.getMinutes())}:${dosD(d.getSeconds())}${s}${dosD(Math.floor(a / 60))}:${dosD(a % 60)}`; };
  const hora = iso => { const d = iso ? new Date(iso) : new Date(); return isNaN(d) ? '' : d.toLocaleDateString('es-CR', { day: 'numeric', month: 'short' }) + ' ' + d.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' }); };
  const uid = () => (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : 'o-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
  const sinT = s => String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '');
  const clave = s => sinT(s).trim().toUpperCase().replace(/\s+/g, ' ');
  const pk = (o, ...ks) => { if (!o) return null; for (const k of ks) if (o[k] != null && o[k] !== '') return o[k]; return null; };
  const si = v => v === true || /^(S[IÍ]|TRUE|1)$/i.test(String(v == null ? '' : v).trim());
  const lista = x => Array.isArray(x) ? x : x && typeof x === 'object' ? Object.entries(x).map(([k, v]) => Object.assign({ _k: k }, v)) : [];
  const dia = v => { if (!v) return null; const t = String(v); return /^\d{4}-\d{2}-\d{2}/.test(t) ? t.slice(0, 10) : null; };
  const copia = o => (typeof structuredClone === 'function' ? structuredClone(o) : JSON.parse(JSON.stringify(o)));

  /* ---------- maestros: datos_exportacion.json (acepta camelCase y los nombres de las tablas del libro) ---------- */
  const ESTADOS_RESPALDO = [      // solo si datos_exportacion.json no trae estados (T_ESTADOS_ORDEN al 24-nov)
    { estado: 'PROGRAMADO', prioridad: 5, pendiente: true, inventario: false, descripcion: 'OC recibida, todavía sin confirmar ni facturar.' },
    { estado: 'PARCIAL', prioridad: 4, pendiente: true, inventario: true, descripcion: 'Parte facturada, el resto en back order.' },
    { estado: 'EN TRANSITO', prioridad: 3, pendiente: true, inventario: true, descripcion: 'Ya salió de Brinova.' },
    { estado: 'ENTREGADO', prioridad: 2, pendiente: false, inventario: false, descripcion: 'Ya llegó al cliente.' },
    { estado: 'RETIRADA', prioridad: 1, pendiente: false, inventario: false, descripcion: 'Ya no va.' },
  ];
  const mmDe = v => { const n = +v; return isFinite(n) && n > 0 ? (n < 50 ? n * 1000 : n) : null; };
  function modelo(DX) {
    DX = DX || {};
    const M = { DX, clientes: new Map(), listaClientes: [], productos: new Map(), precios: new Map(), estados: new Map(), listaEstados: [], tc: [], contenedores: [], factor: null, respaldoEstados: false };
    lista(DX.clientes).forEach(c => {
      const cli = String(pk(c, 'cliente', 'CLIENTE', '_k') || '').trim(); if (!cli) return;
      const x = { cliente: cli, clase: String(pk(c, 'clase', 'CLASE') || '').trim().toUpperCase(), codCliente: pk(c, 'codCliente', 'COD. CLIENTE'), pais: pk(c, 'pais', 'PAIS') };
      M.clientes.set(clave(cli), x); M.listaClientes.push(x);
      const alias = pk(c, 'clienteTCustomer', 'CLIENTE_T_CUSTOMER'); if (alias && !M.clientes.has(clave(alias))) M.clientes.set(clave(alias), x);
    });
    M.listaClientes.sort((a, b) => a.cliente.localeCompare(b.cliente));
    lista(DX.productos).forEach(p => {
      const cod = String(pk(p, 'cod', 'COD. PRODUCTO', 'codigo', '_k') || '').trim().toUpperCase(); if (!cod) return;
      const hist = lista(pk(p, 'pzReglas', 'pzPorCajaHist', 'pzHist')).map(h => ({ clase: h.clase ? String(h.clase).toUpperCase() : null, desde: dia(pk(h, 'desde', 'vigenteDesde', 'VIGENTE_DESDE')), hasta: dia(pk(h, 'hasta', 'vigenteHasta', 'VIGENTE_HASTA')), pz: num(pk(h, 'pzPorCaja', 'pz', 'PIEZAS_POR_CAJA')) })).filter(h => h.pz > 0);
      M.productos.set(cod, {
        cod, desc: String(pk(p, 'descripcionBrinova', 'descBrinova', 'desc', 'descripcion', 'DESCRIPCION', 'DESCRIPCIÓN') || ''), cat: String(pk(p, 'categoria', 'cat', 'CATEGORIA', 'CATEGORÍA') || 'Sin categoría'),
        pz: num(pk(p, 'pzPorCajaTsku', 'pzPorCaja', 'piezasPorCaja', 'PIEZAS_POR_CAJA', 'PIEZAS_T_SKU')), pzHist: hist, pzFuente: pk(p, 'pzOrigen', 'pzFuente', 'fuentePz') || '',
        m3: num(pk(p, 'm3Caja', 'M3_CAJA')), largoCm: num(pk(p, 'largoCm', 'LARGO_CM')), anchoCm: num(pk(p, 'anchoCm', 'ANCHO_CM')), altoCm: num(pk(p, 'altoCm', 'ALTO_CM')), pesoKg: num(pk(p, 'pesoKg', 'PESO_KG')),
      });
    });
    lista(DX.precios).forEach(r => {
      const cli = pk(r, 'cliente', 'CLIENTE'), cod = String(pk(r, 'cod', 'COD. PRODUCTO', 'codigo') || '').trim().toUpperCase(), pr = num(pk(r, 'precioCajaUsd', 'precio', 'PRECIO'));
      if (!cli || !cod || pr == null) return;
      const k = clave(cli) + '|' + cod, a = M.precios.get(k) || [];
      a.push({ precio: pr, moneda: String(pk(r, 'moneda', 'MONEDA') || 'USD').toUpperCase(), desde: dia(pk(r, 'vigenteDesde', 'desde', 'VIGENTE_DESDE')), hasta: dia(pk(r, 'vigenteHasta', 'hasta', 'VIGENTE_HASTA')), fuente: pk(r, 'fuente', 'FUENTE') || '' });
      M.precios.set(k, a);
    });
    M.precios.forEach(a => a.sort((x, y) => String(y.desde || '').localeCompare(String(x.desde || ''))));
    let est = lista(DX.estados);
    if (!est.length) { est = ESTADOS_RESPALDO; M.respaldoEstados = true; }
    est.forEach(e => {
      const k = String(pk(e, 'estado', 'ESTADO', '_k') || '').trim().toUpperCase(); if (!k) return;
      const x = { estado: k, prioridad: num(pk(e, 'prioridad', 'PRIORIDAD')) || 0, descripcion: pk(e, 'descripcion', 'DESCRIPCION') || '',
        inventario: si(pk(e, 'cuentaComoInventario', 'inventario', 'CUENTA_COMO_INVENTARIO')), pendiente: si(pk(e, 'cuentaComoPendiente', 'pendiente', 'CUENTA_COMO_PENDIENTE')) };
      M.estados.set(k, x); M.listaEstados.push(x);
    });
    M.listaEstados.sort((a, b) => b.prioridad - a.prioridad);      // PROGRAMADO primero, como el flujo de una orden
    const tcs = Array.isArray(DX.tipoCambio) ? DX.tipoCambio : DX.tipoCambio ? [DX.tipoCambio] : [];
    M.tc = tcs.filter(t => !(t.usar === false || /^NO$/i.test(String(t.usar ?? t.USAR ?? t.USAR_PARA_MAESTROS ?? ''))))      // DATOS: solo filas con usar = true
      .map(t => ({ desde: dia(pk(t, 'vigenteDesde', 'desde', 'VIGENTE_DESDE')) || '0000-01-01', de: String(pk(t, 'de', 'MONEDA_ORIGEN') || 'USD').toUpperCase(), a: String(pk(t, 'a', 'MONEDA_DESTINO') || 'CRC').toUpperCase(), valor: num(pk(t, 'valor', 'TIPO_CAMBIO')) }))
      .filter(t => t.valor > 0 && t.de === 'USD' && t.a === 'CRC').sort((a, b) => b.desde.localeCompare(a.desde));
    M.contenedores = lista(DX.contenedores).map((x, i) => ({ id: String(pk(x, 'tipo', 'TIPO', 'id', '_k') || 'C' + i), nombre: String(pk(x, 'tipo', 'TIPO', 'nombre') || 'Contenedor ' + (i + 1)),
      largo: mmDe(pk(x, 'largoMm', 'largoM', 'LARGO_INT_M')), ancho: mmDe(pk(x, 'anchoMm', 'anchoM', 'ANCHO_INT_M')), alto: mmDe(pk(x, 'altoMm', 'altoM', 'ALTO_INT_M')),
      puertaAncho: mmDe(pk(x, 'puertaAnchoM', 'PUERTA_ANCHO_M')), puertaAlto: mmDe(pk(x, 'puertaAltoM', 'PUERTA_ALTO_M')), pesoMax: num(pk(x, 'cargaMaxKg', 'CARGA_MAX_KG', 'pesoMaxKg')),
      orden: num(pk(x, 'orden', 'ORDEN')) || i + 1 })).filter(x => x.largo && x.ancho && x.alto).sort((a, b) => a.orden - b.orden);
    const pr = DX.parametros || {}, f = pr.FACTOR_LLENADO ?? pr.factorLlenado ?? DX.factorLlenado, fv = num(f && typeof f === 'object' ? f.valor : f);
    M.factor = fv > 0 && fv <= 1 ? fv : null;
    return M;
  }
  const cliDe = (M, nombre) => M.clientes.get(clave(nombre)) || null;
  /* regla de DATOS (datos_exportacion.json › reglas.piezas): la regla de pzReglas que cubre la fecha; la de la clase de la orden gana a la
     que no tiene clase; si empatan, la de 'desde' más reciente; si ninguna, pzPorCajaTsku. Nunca lo que escribió Melissa. */
  function pzCaja(M, p, f, clase) {
    if (!p) return { pz: null };
    const cl = clase ? String(clase).toUpperCase() : null;
    const h = p.pzHist.filter(x => (!x.clase || x.clase === cl) && (!x.desde || x.desde <= f) && (!x.hasta || f <= x.hasta))
      .sort((a, b) => (b.clase ? 1 : 0) - (a.clase ? 1 : 0) || String(b.desde || '').localeCompare(String(a.desde || '')))[0];
    return h ? { pz: h.pz, fuente: 'T_FACTOR_SKU_HIST desde ' + fecha(h.desde) + (h.clase ? ' (' + h.clase + ')' : '') } : { pz: p.pz > 0 ? p.pz : null, fuente: p.pzFuente || 'T_SKU' };
  }
  function precioDe(M, cliente, cod, f) {
    const a = M.precios.get(clave(cliente) + '|' + cod) || [];
    const r = a.find(x => (!x.desde || x.desde <= f) && (!x.hasta || f <= x.hasta));
    if (r && r.moneda === 'CRC') {      // PRISMAR: lista en colones → USD = precio ÷ tipo de cambio vigente
      const tc = tcDe(M, f);
      return tc ? { precio: r.precio / tc.valor, desde: r.desde, hasta: r.hasta, fuente: r.fuente, crc: r.precio, tc: tc.valor } : { precio: null, motivo: 'precio en colones y no hay tipo de cambio' };
    }
    if (r) return { precio: r.precio, desde: r.desde, hasta: r.hasta, fuente: r.fuente };
    if (!a.length) return { precio: null, motivo: 'el cliente no tiene precio para este código en la lista' };
    const rangos = a.map(x => (x.desde ? 'desde ' + fecha(x.desde) : '') + (x.hasta ? ' hasta ' + fecha(x.hasta) : '')).join('; ');
    return { precio: null, motivo: `ningún precio vigente el ${fecha(f)} (la lista tiene: ${rangos})` };
  }
  function tcDe(M, f) { return M.tc.find(t => t.desde <= f) || M.tc[M.tc.length - 1] || null; }

  /* ---------- derivados ---------- */
  const fechaRef = o => dia(o.fechaOc) || (/^\d{4}-\d{2}$/.test(o.mesEmbarque || '') ? o.mesEmbarque + '-01' : hoy());      // DATOS: sin fechaOc, primer día del mes de embarque
  function derivarLinea(M, o, l) {
    const cod = String(l.cod || '').trim().toUpperCase(), p = cod ? M.productos.get(cod) : null, f = fechaRef(o);
    const ped = num(l.cajasPedidas) || 0, conf = num(l.cajasConfirmadas), confN = conf || 0;
    const cli = cliDe(M, o.cliente), pz = pzCaja(M, p, f, o.clase || (cli && cli.clase));
    const man = !!l.precioManual && num(l.precioCajaUsd) != null;
    const pr = man ? { precio: +l.precioCajaUsd, manual: true } : cod ? precioDe(M, o.cliente, cod, f) : { precio: null, motivo: 'sin código' };
    const precio = pr.precio, m3c = num(l.m3CajaManual) != null ? num(l.m3CajaManual) : p ? p.m3 : null;
    const av = [];
    if (!cod) av.push(['bad', 'Sin código']);
    else if (!p) av.push(['bad', 'Código desconocido']);
    if (p && !pz.pz) av.push(['warn', 'Sin piezas por caja']);
    if (precio == null && cod) av.push(['bad', 'Sin precio', pr.motivo]);
    if (cod && m3c == null) av.push(['warn', 'Sin m³']);
    if (!dia(o.fechaOc)) av.push(['info', 'Fecha OC supuesta', 'La orden no tiene fecha de OC: se usa el primer día del mes de embarque']);
    if (conf != null && conf > ped) av.push(['warn', 'Confirmadas > pedidas']);
    if (man) av.push(['info', 'Precio manual']);
    const bo = ped - confN;
    return { l, cod, p, desc: p ? p.desc : '', cat: p ? p.cat : 'Sin categoría', pz: pz.pz, pzFuente: pz.fuente, ped, conf, bo, fcst: num(l.cajasFcst),
      piezas: pz.pz ? ped * pz.pz : null, piezasConf: pz.pz ? confN * pz.pz : null, precio, precioInfo: pr,
      m3c, m3Oc: m3c != null ? ped * m3c : null, m3Fact: m3c != null ? confN * m3c : null,
      usdOc: precio != null ? ped * precio : null, usdFact: precio != null ? confN * precio : null, usdBo: precio != null ? bo * precio : null,
      cajasEnvio: confN > 0 ? confN : ped, avisos: av };
  }
  function derivarOrden(M, o) {
    const lineas = (o.lineas || []).map(l => derivarLinea(M, o, l)), tc = tcDe(M, fechaRef(o));
    const t = { cajas: 0, conf: 0, bo: 0, piezas: 0, m3Oc: 0, m3Fact: 0, usdOc: 0, usdFact: 0, usdBo: 0, sinPrecio: 0, sinM3: 0, desconocidos: 0, avisos: 0 };
    lineas.forEach(d => {
      t.cajas += d.ped; t.conf += d.conf || 0; t.bo += d.bo; t.piezas += d.piezas || 0;
      if (d.m3c != null) { t.m3Oc += d.m3Oc; t.m3Fact += d.m3Fact; } else t.sinM3++;
      if (d.precio != null) { t.usdOc += d.usdOc; t.usdFact += d.usdFact; t.usdBo += d.usdBo; } else t.sinPrecio++;
      if (!d.p) t.desconocidos++;
      t.avisos += d.avisos.filter(a => a[0] !== 'info').length;
    });
    return { o, cli: cliDe(M, o.cliente), lineas, tot: t, tc };
  }
  const estadoDe = (M, e) => M.estados.get(String(e || '').toUpperCase()) || null;

  /* ---------- indicadores para el portal del KAM (inventario en tránsito y pedidos programados) ----------
     Tránsito = estado con CUENTA_COMO_INVENTARIO = SI; cajas que viajan = confirmadas si hay, si no pedidas (igual que el generador).
     Programado = estado pendiente que no cuenta como inventario; cantidad = lo pedido. Fecha de llegada = ETA, si no fecha de
     embarque, si no el primer día del mes de embarque (la página del KAM decide con su corte si ya llegó). */
  function indicadores(M, doc) {
    const out = [];
    ((doc && doc.ordenes) || []).forEach(o => {
      const e = estadoDe(M, o.estado); if (!e) return;
      const prog = e.pendiente && !e.inventario; if (!e.inventario && !prog) return;
      const cli = cliDe(M, o.cliente), clase = String(o.clase || (cli && cli.clase) || '').toUpperCase(), f = fechaRef(o);
      const eta = dia(o.eta), emb = dia(o.fechaEmbarque), mes = /^\d{4}-\d{2}$/.test(o.mesEmbarque || '') ? o.mesEmbarque : null;
      const [lleg, fuente] = eta ? [eta, 'ETA'] : emb ? [emb, 'fecha de embarque'] : mes ? [mes + '-01', 'mes de embarque (primer día)'] : [null, 'sin fecha'];
      (o.lineas || []).forEach(l => {
        const cod = String(l.cod || '').trim().toUpperCase(); if (!cod) return;
        const p = M.productos.get(cod), pz = pzCaja(M, p, f, clase).pz, ped = num(l.cajasPedidas) || 0, conf = num(l.cajasConfirmadas) || 0, env = conf > 0 ? conf : ped;
        out.push({ orden: String(o.oc || ''), ordenId: o.id, cliente: o.cliente, clase, cod, desc: p ? p.desc : '', estado: e.estado,
          cuentaInventario: e.inventario, programado: prog, cajas: env, cajasPedidas: ped, cajasConfirmadas: conf || null, pzPorCaja: pz,
          pz: pz ? Math.round(env * pz) : 0, pzPedidas: pz ? Math.round(ped * pz) : 0, mesEmbarque: mes, eta, fechaEmbarque: emb,
          fechaLlegada: lleg, fechaLlegadaFuente: fuente, contenedor: o.contenedor || null, archivo: 'ordenes.json (web)' });
      });
    });
    return out;
  }

  /* ---------- pegar desde Excel (hoja BASE de Melissa) ----------
     Con encabezado: CLIENTE, OC, COD. SOFTLAND y CANTIDAD PEDIDA CAJAS (opcionales CANTIDAD CONFIRMADA CAJAS y FCST CAJAS).
     Sin encabezado: 4 columnas en ese orden, o la fila completa de BASE (CLIENTE=A, OC=B, COD=C, FCST=H, PEDIDA=L, CONFIRMADA=N). */
  function numPegado(t) {
    let s = String(t == null ? '' : t).trim().replace(/[\s ]/g, ''); if (!s || s === '-') return null;
    if (/^-?\d{1,3}([.,]\d{3})+$/.test(s)) s = s.replace(/[.,]/g, '');
    else if (/^-?\d+,\d+$/.test(s)) s = s.replace(',', '.');
    else if (/^-?\d{1,3}(,\d{3})+\.\d+$/.test(s)) s = s.replace(/,/g, '');
    else if (/^-?\d{1,3}(\.\d{3})+,\d+$/.test(s)) s = s.replace(/\./g, '').replace(',', '.');
    const n = +s; return isFinite(n) ? n : NaN;
  }
  function parsearPegado(texto) {
    const filas = String(texto || '').replace(/\r/g, '').split('\n').map(r => r.split('\t')).filter(r => r.some(c => c.trim()));
    if (!filas.length) return { lineas: [], errores: [], modo: '' };
    const h = filas[0].map(c => clave(c));
    let idx = null, desde = 0, modo = '';
    if (h.some(c => c === 'CLIENTE')) {
      const col = re => h.findIndex(c => re.test(c));
      idx = { cliente: col(/^CLIENTE$/), oc: col(/^(OC|ORDEN|ORDEN DE COMPRA)$/), cod: col(/^COD/), cajas: col(/^(CANTIDAD PEDIDA CAJAS|CAJAS PEDIDAS|CANTIDAD|CAJAS)$/),
        conf: col(/^(CANTIDAD CONFIRMADA CAJAS|CAJAS CONFIRMADAS|CONFIRMADAS)$/), fcst: col(/^(FCST CAJAS|CAJAS FCST)$/) };
      desde = 1; modo = 'encabezado';
      const falta = ['cliente', 'oc', 'cod', 'cajas'].filter(k => idx[k] < 0);
      if (falta.length) return { lineas: [], errores: ['Faltan columnas en el encabezado: ' + falta.map(k => ({ cliente: 'CLIENTE', oc: 'OC', cod: 'COD. SOFTLAND', cajas: 'CANTIDAD PEDIDA CAJAS' }[k])).join(', ')], modo };
    } else if (filas[0].length >= 12) { idx = { cliente: 0, oc: 1, cod: 2, cajas: 11, conf: 13, fcst: 7 }; modo = 'fila completa de BASE'; }
    else { idx = { cliente: 0, oc: 1, cod: 2, cajas: 3, conf: -1, fcst: -1 }; modo = '4 columnas'; }
    const lineas = [], errores = [];
    filas.slice(desde).forEach((r, i) => {
      const n = i + desde + 1, g = k => idx[k] >= 0 ? String(r[idx[k]] == null ? '' : r[idx[k]]).trim() : '';
      const cliente = g('cliente'), oc = g('oc'), cod = g('cod').toUpperCase(), cajas = numPegado(g('cajas')), conf = numPegado(g('conf')), fcst = numPegado(g('fcst'));
      if (!cliente && !oc && !cod && cajas == null) return;
      if (/^(TOTAL|TOTAL GENERAL)$/i.test(cliente)) return;
      if (!cliente || !oc) { errores.push(`Fila ${n}: falta ${!cliente ? 'CLIENTE' : 'OC'}`); return; }
      if (cajas == null || isNaN(cajas)) { errores.push(`Fila ${n} (${cliente} · OC ${oc}): la cantidad "${g('cajas')}" no es un número`); return; }
      lineas.push({ fila: n, cliente, oc, cod, cajas, conf: conf == null || isNaN(conf) ? null : conf, fcst: fcst == null || isNaN(fcst) || fcst === 0 ? null : fcst });
    });
    return { lineas, errores, modo };
  }

  /* ---------- historial: qué cambió entre dos versiones de una orden ---------- */
  const CAMPOS = [['cliente', 'cliente'], ['oc', 'OC'], ['fechaOc', 'fecha OC'], ['mesEmbarque', 'mes de embarque'], ['estado', 'estado'], ['contenedor', 'contenedor'], ['fechaEmbarque', 'fecha de embarque'], ['eta', 'ETA'], ['notas', 'notas']];
  const vTxt = v => v == null || v === '' ? '—' : String(v);
  function cambios(a, b) {
    const out = [];
    CAMPOS.forEach(([k, n]) => { if (vTxt(a[k]) !== vTxt(b[k])) out.push(k === 'notas' ? 'cambió las notas' : `${n}: ${vTxt(a[k])} → ${vTxt(b[k])}`); });
    const la = new Map(), lb = new Map();
    (a.lineas || []).forEach((l, i) => la.set(l.cod || '#' + i, l)); (b.lineas || []).forEach((l, i) => lb.set(l.cod || '#' + i, l));
    lb.forEach((l, k) => { if (!la.has(k)) out.push(`agregó ${l.cod || 'una línea sin código'} (${fN(l.cajasPedidas)} cajas)`); });
    la.forEach((l, k) => { if (!lb.has(k)) out.push(`quitó ${l.cod || 'una línea sin código'}`); });
    lb.forEach((l, k) => {
      const x = la.get(k); if (!x) return;
      [['cajasPedidas', 'pedidas'], ['cajasConfirmadas', 'confirmadas'], ['cajasFcst', 'FCST']].forEach(([c, n]) => { if (vTxt(x[c]) !== vTxt(l[c])) out.push(`${l.cod}: ${n} ${vTxt(x[c])} → ${vTxt(l[c])}`); });
      if (!!x.precioManual !== !!l.precioManual || (l.precioManual && vTxt(x.precioCajaUsd) !== vTxt(l.precioCajaUsd))) out.push(`${l.cod}: ${l.precioManual ? 'precio manual USD ' + vTxt(l.precioCajaUsd) : 'vuelve al precio de lista'}`);
    });
    return out;
  }

  /* Conflicto dentro del editor: se aplican SOLO los campos que cambió esta persona (base → mío) sobre la versión que guardó la otra
     (suyo). Si los dos cambiaron el mismo campo, queda el valor de la otra persona y se informa: nunca se pisa lo que otro guardó. */
  const CAMPOS_L = ['cajasPedidas', 'cajasConfirmadas', 'cajasFcst', 'precioCajaUsd', 'precioManual'];
  function combinar(base, mio, suyo) {
    const out = copia(suyo), choques = [], igual = (a, b) => vTxt(a) === vTxt(b);
    CAMPOS.forEach(([k, n]) => {
      if (igual(mio[k], base[k])) return;                    // no lo toqué: queda lo suyo
      if (igual(suyo[k], base[k]) || igual(suyo[k], mio[k])) out[k] = mio[k];
      else choques.push(`${n}: quedó «${vTxt(suyo[k])}» (tu valor: «${vTxt(mio[k])}»)`);
    });
    const key = (l, i) => l.cod || '#' + i, mapa = ls => new Map((ls || []).map((l, i) => [key(l, i), l]));
    const B = mapa(base.lineas), Mi = mapa(mio.lineas), Su = mapa(suyo.lineas);
    const lin = (out.lineas || []).slice();
    Mi.forEach((l, k) => {
      const b = B.get(k), s = Su.get(k);
      if (!b) { if (!s) lin.push(copia(l)); else choques.push(`${l.cod}: la otra persona también la agregó; quedó su línea`); return; }
      if (!s) { choques.push(`${l.cod}: la otra persona quitó esta línea; no se volvió a agregar`); return; }
      const x = lin.find((y, i) => key(y, i) === k);
      CAMPOS_L.forEach(c => {
        if (igual(l[c], b[c])) return;
        if (igual(s[c], b[c]) || igual(s[c], l[c])) x[c] = l[c];
        else choques.push(`${l.cod} · ${c === 'cajasPedidas' ? 'pedidas' : c === 'cajasConfirmadas' ? 'confirmadas' : c === 'cajasFcst' ? 'FCST' : 'precio'}: quedó ${vTxt(s[c])} (tu valor: ${vTxt(l[c])})`);
      });
    });
    B.forEach((b, k) => {                                     // líneas que quité yo
      if (Mi.has(k)) return; const s = Su.get(k); if (!s) return;
      if (CAMPOS_L.every(c => igual(s[c], b[c]))) { const i = lin.findIndex((y, j) => key(y, j) === k); if (i >= 0) lin.splice(i, 1); }
      else choques.push(`${b.cod}: la quitaste, pero la otra persona la cambió; quedó su línea`);
    });
    out.lineas = lin;
    return { orden: out, choques };
  }

  /* ======================================================================================================
     Pantalla
     ====================================================================================================== */
  const CSS = `
body.modo-ordenes>header.top:not(#ord-top),body.modo-ordenes>section.filtros:not(#ord-filtros),body.modo-ordenes>main:not(#ord-main){display:none!important}
#ord-app{min-height:100vh}
#ord-top .who h1{font-size:20px}
#ord-top .btn{padding:5px 10px;font-size:12.5px}
.ord-f{display:flex;flex-direction:column;gap:4px;font-size:12px;font-weight:600;color:var(--ink-3);min-width:0}
.ord-f select,.ord-f input,.ord-f textarea{border:1px solid var(--line-2);background:var(--surface);border-radius:8px;padding:6px 10px;min-height:var(--target);font-size:max(14px,1em);color:var(--ink);font-weight:400;min-width:0}
.ord-f textarea{min-height:60px;resize:vertical}
.ord-f :user-invalid,.ord-f [aria-invalid="true"]{border-color:var(--bad);background:var(--bad-bg)}
.ord-f .req::after{content:" *";color:var(--bad)}
#ord-filtros .wrap{align-items:flex-end}
.ord-mes{display:flex;flex-direction:column;gap:10px}
.ord-mes-h{display:flex;flex-wrap:wrap;gap:6px 14px;align-items:baseline}
.ord-mes-h h2{font-size:16px}
.ord-mes-h .der{margin-left:auto;display:flex;gap:8px;flex-wrap:wrap}
.ord-cont{container:ordtab/inline-size}
.tbl.ord-tab td.l,.tbl.ord-tab th.l{text-align:left}
.tbl.ord-tab select{border:1px solid var(--line-2);border-radius:6px;padding:3px 6px;background:var(--surface);min-height:var(--target);font-size:max(13px,1em)}
.ord-acc{display:flex;gap:6px;justify-content:flex-end;flex-wrap:wrap}
.ord-acc .btn{padding:4px 10px;font-size:12.5px}
.ord-av{display:flex;gap:4px;flex-wrap:wrap}
@container ordtab (width < 700px){
  .tbl.ord-tab,.tbl.ord-tab tbody,.tbl.ord-tab tr,.tbl.ord-tab td,.tbl.ord-tab th{display:block}
  .tbl.ord-tab thead{display:none}
  .tbl.ord-tab tr{border-bottom:1px solid var(--line-2);padding:8px 0}
  .tbl.ord-tab td,.tbl.ord-tab th{border:0;padding:3px 12px;text-align:left;white-space:normal}
  .tbl.ord-tab td[data-l]::before{content:attr(data-l) ": ";color:var(--ink-3);font-size:12px}
  .tbl.ord-tab tbody th{font-size:15px}
  .tbl.ord-tab tfoot{display:block}
  .ord-acc{justify-content:flex-start}
}
.ord-piv td.l,.ord-piv th.l{text-align:left}
.ord-piv tr.cli>*{background:var(--surface-2);font-weight:600}
.ord-piv tr.cat th{padding-left:34px;font-weight:400}
.ord-piv button.exp{all:unset;cursor:pointer;display:inline-flex;gap:6px;align-items:center;min-height:var(--target)}
.ord-piv button.exp:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.ord-piv button.exp::before{content:"▸";display:inline-block;width:12px;transition:transform .15s}
.ord-piv button.exp[aria-expanded="true"]::before{transform:rotate(90deg)}
.ord-piv tbody th{position:sticky;left:0;background:var(--surface);z-index:1}
.ord-piv tr.cli th{background:var(--surface-2)}
.ord-piv tfoot th{position:sticky;left:0}
@media (prefers-reduced-motion:reduce){.ord-piv button.exp::before{transition:none}}
.ord-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px 14px;border:0;padding:0;margin:0}
.ord-grid .ancho{grid-column:1/-1}
.ord-lin input{border:1px solid var(--line-2);border-radius:6px;padding:4px 6px;min-height:var(--target);font-size:max(13px,1em);background:var(--surface);width:100%;min-width:0;text-align:right;font-variant-numeric:tabular-nums}
.ord-lin input.cod{text-align:left;min-width:150px}
.ord-lin td{vertical-align:top}
.ord-lin td.desc{white-space:normal;min-width:200px;max-width:320px;text-align:left}
.ord-lin td.desc small{display:block;color:var(--ink-3)}
.ord-lin .w{width:86px}
.ord-lin .x{all:unset;cursor:pointer;color:var(--ink-3);padding:4px 8px;border-radius:6px;min-height:var(--target)}
.ord-lin .x:hover{color:var(--bad)}
.ord-lin .x:focus-visible{outline:2px solid var(--accent)}
.ord-pie{display:flex;gap:8px;flex-wrap:wrap;align-items:center;position:sticky;bottom:0;background:var(--bg);padding:10px 0 4px;border-top:1px solid var(--line)}
.ord-pie .der{margin-left:auto;display:flex;gap:8px;flex-wrap:wrap}
.btn.peligro{color:var(--bad);border-color:#E9B7B2}
.ord-hist{font-size:13px}
.ord-hist ol{margin:8px 0 0;padding-left:18px;display:flex;flex-direction:column;gap:4px}
.ord-hist small{color:var(--ink-3)}
.ord-res{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
.ord-res>div{border:1px solid var(--line);border-radius:var(--r);padding:10px 12px;background:var(--surface);display:flex;flex-direction:column;gap:2px;min-width:0}
.ord-res span{font-size:12px;font-weight:600;color:var(--ink-3)} .ord-res b{font-size:20px;font-variant-numeric:tabular-nums} .ord-res small{font-size:12px;color:var(--ink-3)}
@media (max-width:900px){.ord-res{grid-template-columns:repeat(2,minmax(0,1fr))}}
#ord-pg textarea{width:100%;min-height:140px;font:12.5px/1.4 ui-monospace,Consolas,monospace;border:1px solid var(--line-2);border-radius:8px;padding:8px;background:var(--surface)}
.ord-vacio{padding:24px;text-align:center;color:var(--ink-3)}
.ord-est-b{display:flex;flex-direction:column;gap:12px}
.ord-est-b .row{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap}
.vh{position:absolute;clip-path:inset(50%);width:1px;height:1px;margin:-1px;overflow:hidden;white-space:nowrap;border:0;padding:0}
@media (max-width:640px){#ord-top .ciclo{display:none}.ord-pie .der{margin-left:0}}
`;
  const PAL = ['#149CDC', '#D9661A', '#1A7F37', '#6250D6', '#C5281C', '#B07A00', '#2E8B8B', '#D35D8A', '#5D6A73', '#7A9A01'];

  function iniciar(opc) {
    const A = opc.almacen, persona = opc.persona || { nombre: '?' };
    const S = { DX: null, M: null, doc: null, etag: null, vista: 'lista', mes: '', estados: new Set(), moneda: 'USD', abiertos: new Set(), ed: null, c3: { tipo: null, orden: '', idx: 0, escena: null, plan: null }, guardando: false, soloLectura: false };
    const $ = s => document.querySelector(s);
    /* ---------- estructura ---------- */
    const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    document.body.classList.add('modo-ordenes'); document.body.classList.remove('cargando');
    document.title = 'Órdenes de exportación';
    const raiz = document.createElement('div'); raiz.id = 'ord-app';
    raiz.innerHTML = `
<header class="top" id="ord-top"><div class="wrap">
  <div class="who"><small>Brinova · Exportación</small><h1>Órdenes de exportación</h1></div>
  <div class="ciclo" id="ord-sub"></div>
  <div class="spacer"></div>
  <div class="estado" id="ord-estado" role="status"><span class="dot"></span><span>Cargando…</span></div>
  <div class="persona"><span>${esc(persona.nombre)}</span></div>
  ${opc.volver ? '<button type="button" class="btn" id="ord-volver">Volver al forecast</button>' : ''}
  ${opc.salir ? '<button type="button" class="btn" id="ord-salir">Salir</button>' : ''}
</div></header>
<section class="filtros" id="ord-filtros" aria-label="Filtros"><div class="wrap">
  <div class="seg" role="group" aria-label="Vista">
    <button type="button" data-ov="lista" aria-pressed="true">Órdenes</button>
    <button type="button" data-ov="pivot" aria-pressed="false">Resumen órdenes</button>
    <button type="button" data-ov="c3" aria-pressed="false">Contenedor</button>
  </div>
  <label class="ord-f"><span>Mes de embarque</span><select id="ord-f-mes"></select></label>
  <div class="ord-f"><span id="ord-f-est-l">Estado</span><div class="chips" id="ord-f-est" role="group" aria-labelledby="ord-f-est-l"></div></div>
  <div class="spacer"></div>
  <button type="button" class="btn" id="ord-pegar">Pegar desde Excel</button>
  <button type="button" class="btn pri" id="ord-nueva">Nueva orden</button>
</div></section>
<main class="wrap" id="ord-main">
  <div id="ord-aviso" role="status"></div>
  <section class="view" id="ord-v-lista"></section>
  <section class="view" id="ord-v-pivot" hidden></section>
  <section class="view" id="ord-v-c3" hidden></section>
</main>
<dialog class="det" id="ord-ed" aria-labelledby="ord-ed-t" closedby="none"></dialog>
<dialog class="det" id="ord-pg" aria-labelledby="ord-pg-t" closedby="any"></dialog>
<dialog class="dx" id="ord-est" aria-labelledby="ord-est-t" closedby="any"></dialog>
<datalist id="ord-dl-prod"></datalist>
<datalist id="ord-dl-cont"></datalist>
<div class="toast" id="ord-toast" role="status" hidden></div>`;
    document.body.appendChild(raiz);
    const toast = t => { const el = $('#ord-toast'); el.textContent = t; el.hidden = false; clearTimeout(el._t); el._t = setTimeout(() => { el.hidden = true; }, 3200); };
    const estado = (t, c) => { $('#ord-estado').innerHTML = `<span class="dot ${c || ''}"></span><span>${esc(t)}</span>`; };
    const aviso = (html, tipo) => { $('#ord-aviso').innerHTML = html ? `<p class="aviso ${tipo || ''}" style="margin:8px 0">${html}</p>` : ''; };
    if (opc.volver) $('#ord-volver').onclick = opc.volver;
    if (opc.salir) $('#ord-salir').onclick = opc.salir;

    /* ---------- carga ---------- */
    async function cargar() {
      estado('Cargando…', 'pend');
      let dx, od;
      try { [dx, od] = await Promise.all([A.leerDatos(), A.leerOrdenes()]); }
      catch (e) { estado('No se pudo leer OneDrive', 'err'); aviso(`No se pudieron leer las órdenes: ${esc(e.message || e)}. Revisá la conexión o pedí a BI acceso a la carpeta EXPORTACION.`, 'bad'); return; }
      if (!dx) { estado('Falta datos_exportacion.json', 'err'); aviso('La carpeta EXPORTACION no tiene <b>datos_exportacion.json</b> (clientes, precios, productos y contenedores). BI lo publica con el generador; sin él no se pueden calcular precios ni m³.', 'bad'); }
      S.DX = dx ? dx.datos : {}; S.M = modelo(S.DX);
      ponerDoc(od);
      llenarListas();
      if (S.M.respaldoEstados) aviso('datos_exportacion.json no trae T_ESTADOS_ORDEN: se usan los estados del 24-nov (PROGRAMADO, PARCIAL, EN TRANSITO, ENTREGADO, RETIRADA).', 'nota');
      if (!S.mes) { const ms = mesesDoc(); S.mes = ms.includes(mesHoy()) ? mesHoy() : ''; }
      estado(S.doc.actualizado ? 'Al día · ' + hora(S.doc.actualizado) + (S.doc.actualizadoPor ? ' · ' + S.doc.actualizadoPor : '') : 'Sin órdenes guardadas todavía', 'ok');
      pintar();
    }
    function ponerDoc(od) {
      S.doc = od && od.datos && Array.isArray(od.datos.ordenes) ? od.datos : { version: 'ordenes-v1', actualizado: null, actualizadoPor: null, ordenes: [] };
      S.etag = od ? od.etag : null;
      $('#ord-sub').textContent = `${S.doc.ordenes.length} ${S.doc.ordenes.length === 1 ? 'orden' : 'órdenes'}` + (S.DX && S.DX.generado ? ' · maestros del ' + hora(S.DX.generado) : '');
    }
    function llenarListas() {
      $('#ord-dl-prod').innerHTML = [...S.M.productos.values()].sort((a, b) => a.desc.localeCompare(b.desc)).map(p => `<option value="${esc(p.cod + ' · ' + p.desc)}"></option>`).join('');
      $('#ord-dl-cont').innerHTML = S.M.contenedores.map(k => `<option value="${esc(k.id)}"></option>`).join('');
    }
    const mesesDoc = () => [...new Set(S.doc.ordenes.map(o => o.mesEmbarque || ''))].sort().reverse();

    /* ---------- guardar con eTag: nunca pisa lo que otra persona guardó ---------- */
    async function guardar(mut, okMsg) {
      if (S.guardando) { toast('Espere: se está guardando el cambio anterior'); return false; }
      const nuevo = copia(S.doc); mut(nuevo);
      nuevo.version = 'ordenes-v1'; nuevo.actualizado = ahoraIso(); nuevo.actualizadoPor = persona.nombre;
      S.guardando = true; estado('Guardando…', 'pend'); document.body.classList.add('ord-guardando');
      try {
        const et = await A.escribirOrdenes(nuevo, S.etag);
        S.doc = nuevo; S.etag = et || null; ponerDoc({ datos: nuevo, etag: S.etag });
        estado('Guardado · ' + hora(nuevo.actualizado), 'ok'); aviso('');
        if (okMsg) toast(okMsg);
        pintar(); return true;
      } catch (e) {
        if (e.status === 412 || e.status === 409) {
          let rem = null; try { rem = await A.leerOrdenes(); } catch (e2) { }
          ponerDoc(rem); pintar();
          const quien = S.doc.actualizadoPor ? `${esc(S.doc.actualizadoPor)}, ${esc(hora(S.doc.actualizado))}` : 'otra pestaña o persona';
          aviso(`<b>No se guardó tu cambio.</b> Otra persona guardó las órdenes antes (${quien}). Se cargó la versión más reciente; revisá y volvé a guardar. Nada de lo que guardaron se perdió.`, 'bad');
          estado('Recargado: había cambios de otra persona', 'err');
          return 'conflicto';
        }
        if (e.status === 403 || e.status === 401 || e.code === 'permission_denied') {
          S.soloLectura = true; estado('Solo lectura: sin permiso para guardar', 'err');
          aviso('Tu cuenta puede ver las órdenes pero no guardarlas. Pedí a BI permiso de <b>edición</b> en la carpeta EXPORTACION.', 'bad');
          return false;
        }
        estado('No se pudo guardar', 'err'); aviso(`No se pudo guardar: ${esc(e.message || e)}. Tu cambio sigue en pantalla; probá de nuevo.`, 'bad');
        return false;
      } finally { S.guardando = false; document.body.classList.remove('ord-guardando'); }
    }

    /* ---------- filtros ---------- */
    function pintarFiltros() {
      const ms = mesesDoc(); if (S.mes && !ms.includes(S.mes)) ms.unshift(S.mes);
      $('#ord-f-mes').innerHTML = `<option value=""${S.mes === '' ? ' selected' : ''}>Todos los meses</option>` + [...new Set(ms)].sort().reverse().map(m => `<option value="${esc(m || '__sin')}"${m === S.mes ? ' selected' : ''}>${esc(mll(m))}</option>`).join('');
      const cnt = e => S.doc.ordenes.filter(o => (o.estado || '').toUpperCase() === e && pasaMes(o)).length;
      $('#ord-f-est').innerHTML = S.M.listaEstados.map(e => `<button type="button" class="chip" data-oest="${esc(e.estado)}" aria-pressed="${S.estados.has(e.estado)}">${esc(cap(e.estado))} <span class="muted">${cnt(e.estado)}</span></button>`).join('');
      document.querySelectorAll('[data-ov]').forEach(b => b.setAttribute('aria-pressed', b.dataset.ov === S.vista));
      $('#ord-nueva').disabled = $('#ord-pegar').disabled = S.soloLectura;
    }
    const cap = s => String(s || '').charAt(0) + String(s || '').slice(1).toLowerCase();
    const pasaMes = o => !S.mes || (S.mes === '__sin' ? !o.mesEmbarque : o.mesEmbarque === S.mes);
    const pasa = o => pasaMes(o) && (!S.estados.size || S.estados.has((o.estado || '').toUpperCase()));
    const visibles = () => S.doc.ordenes.filter(pasa);
    function pillEstado(e) { const x = estadoDe(S.M, e); const c = !x ? 'bad' : x.inventario ? 'acc' : x.pendiente ? 'warn' : 'good'; return `<span class="pill ${c}" title="${esc(x ? x.descripcion + (x.inventario ? ' Cuenta como inventario en tránsito.' : x.pendiente ? ' Pedido programado: no suma al inventario.' : '') : 'Estado que no está en T_ESTADOS_ORDEN')}">${esc(e || 'sin estado')}</span>`; }
    const pillsAv = avs => avs.map(a => `<span class="pill ${a[0]}"${a[2] ? ` title="${esc(a[2])}"` : ''}>${esc(a[1])}</span>`).join('');
    function resumenAvisos(d) {
      const g = new Map(); d.lineas.forEach(x => x.avisos.forEach(a => { if (a[0] !== 'info') g.set(a[1], [a[0], (g.get(a[1]) || [a[0], 0])[1] + 1]); }));
      return [...g.entries()].map(([t, [c, n]]) => [c, `${n} ${t.toLowerCase()}`]);
    }

    /* ---------- vista: lista de órdenes por mes de embarque ---------- */
    function pintarLista() {
      const box = $('#ord-v-lista'), os = visibles();
      if (!S.doc.ordenes.length) { box.innerHTML = `<section class="panel ord-vacio"><p><b>Todavía no hay órdenes.</b></p><p>Creá una con <b>Nueva orden</b> o pegá las filas de la hoja BASE de tu Excel con <b>Pegar desde Excel</b>.</p></section>`; return; }
      if (!os.length) { box.innerHTML = `<section class="panel ord-vacio">No hay órdenes con estos filtros.</section>`; return; }
      const porMes = new Map(); os.forEach(o => { const k = o.mesEmbarque || ''; if (!porMes.has(k)) porMes.set(k, []); porMes.get(k).push(o); });
      box.innerHTML = [...porMes.entries()].sort((a, b) => String(b[0]).localeCompare(String(a[0]))).map(([m, xs]) => {
        const ds = xs.map(o => derivarOrden(S.M, o)).sort((a, b) => a.o.cliente.localeCompare(b.o.cliente) || String(a.o.oc).localeCompare(String(b.o.oc)));
        const T = ds.reduce((t, d) => { ['cajas', 'conf', 'usdOc', 'm3Oc', 'sinPrecio', 'sinM3', 'avisos'].forEach(k => { t[k] += d.tot[k]; }); t.lin += d.lineas.length; return t; }, { cajas: 0, conf: 0, usdOc: 0, m3Oc: 0, sinPrecio: 0, sinM3: 0, avisos: 0, lin: 0 });
        const idt = 'ord-m-' + (m || 'sin');
        return `<section class="panel ord-mes" aria-labelledby="${idt}">
          <div class="ord-mes-h"><h2 id="${idt}">${esc(mll(m))}</h2>
            <span class="muted">${ds.length} ${ds.length === 1 ? 'orden' : 'órdenes'} · ${fN(T.lin)} líneas · <b>${fN(T.cajas)}</b> cajas · <b>${fUsd(T.usdOc)}</b> · <b>${fM3(T.m3Oc)}</b> m³${T.sinPrecio ? ` · <span class="warn">${T.sinPrecio} sin precio</span>` : ''}${T.sinM3 ? ` · <span class="warn">${T.sinM3} sin m³</span>` : ''}</span>
            <span class="der"><button type="button" class="btn" data-oc3mes="${esc(m)}">Ver el mes en contenedor</button></span></div>
          <div class="ord-cont"><div class="tw" role="region" tabindex="0" aria-labelledby="${idt}"><table class="tbl ord-tab"><thead><tr>
            <th class="l" scope="col">Cliente · OC</th><th class="l" scope="col">Estado</th><th scope="col">Líneas</th><th scope="col">Cajas</th><th scope="col">Confirmadas</th><th scope="col">Valor OC</th><th scope="col">m³ OC</th><th class="l" scope="col">Contenedor · ETA</th><th class="l" scope="col">Avisos</th><th scope="col"><span class="vh">Acciones</span></th></tr></thead><tbody>
            ${ds.map(d => { const o = d.o; return `<tr>
              <th class="l" scope="row">${esc(o.cliente)} · OC ${esc(o.oc)}<small class="muted" style="display:block;font-weight:400">${esc(d.cli ? d.cli.clase : 'cliente desconocido')} · OC del ${esc(fecha(o.fechaOc))}</small></th>
              <td class="l" data-l="Estado">${S.soloLectura ? pillEstado(o.estado) : `<select data-oestado="${esc(o.id)}" aria-label="Estado de la OC ${esc(o.oc)} de ${esc(o.cliente)}">${S.M.listaEstados.map(e => `<option value="${esc(e.estado)}"${e.estado === (o.estado || '').toUpperCase() ? ' selected' : ''}>${esc(e.estado)}</option>`).join('')}${estadoDe(S.M, o.estado) ? '' : `<option selected>${esc(o.estado || '')}</option>`}</select>`}</td>
              <td data-l="Líneas">${fN(d.lineas.length)}</td><td data-l="Cajas">${fN(d.tot.cajas)}</td><td data-l="Confirmadas">${d.tot.conf ? fN(d.tot.conf) : '—'}</td>
              <td data-l="Valor OC">${fUsd(d.tot.usdOc)}${d.tot.sinPrecio ? '<small class="warn" style="display:block">sin ' + d.tot.sinPrecio + ' línea' + (d.tot.sinPrecio > 1 ? 's' : '') + '</small>' : ''}</td>
              <td data-l="m³ OC">${fM3(d.tot.m3Oc)}</td>
              <td class="l" data-l="Contenedor · ETA">${esc(o.contenedor || '—')}${o.eta ? ' · ETA ' + esc(fecha(o.eta)) : ''}</td>
              <td class="l" data-l="Avisos"><span class="ord-av">${pillsAv(resumenAvisos(d)) || '<span class="muted">—</span>'}</span></td>
              <td><span class="ord-acc"><button type="button" class="btn" data-oedit="${esc(o.id)}">${S.soloLectura ? 'Ver' : 'Editar'}</button><button type="button" class="btn" data-oc3="${esc(o.id)}">Contenedor</button></span></td></tr>`; }).join('')}
          </tbody></table></div></div></section>`;
      }).join('');
    }

    /* ---------- vista: RESUMEN ORDENES (cliente × categoría) ---------- */
    function pintarPivot() {
      const box = $('#ord-v-pivot'), ds = visibles().map(o => derivarOrden(S.M, o));
      const crc = S.moneda === 'CRC', g = new Map(), tcs = new Map();
      const T = () => ({ cajas: 0, usdOc: 0, usdFact: 0, usdBo: 0, m3Oc: 0, m3Fact: 0, sinP: 0, sinM: 0 });
      const tot = T(), problemas = [];
      ds.forEach(d => {
        const tc = d.tc ? d.tc.valor : null; if (crc && d.tc) tcs.set(d.tc.desde + '|' + d.tc.valor, d.tc);
        const cli = d.o.cliente; if (!g.has(cli)) g.set(cli, { t: T(), cats: new Map() });
        const G = g.get(cli);
        d.lineas.forEach(x => {
          if (!G.cats.has(x.cat)) G.cats.set(x.cat, T());
          const k = crc ? (tc || 0) : 1;
          [G.t, G.cats.get(x.cat), tot].forEach(t => {
            t.cajas += x.ped;
            if (x.precio != null && (!crc || tc)) { t.usdOc += x.usdOc * k; t.usdFact += x.usdFact * k; t.usdBo += x.usdBo * k; } else t.sinP++;
            if (x.m3c != null) { t.m3Oc += x.m3Oc; t.m3Fact += x.m3Fact; } else t.sinM++;
          });
          if (x.precio == null || x.m3c == null || !x.p) problemas.push([d.o, x]);
        });
      });
      const fV = v => crc ? fCrc(v) : fUsd(v), mon = crc ? '₡' : 'USD';
      const celdas = t => `<td>${fN(t.cajas)}</td><td>${fV(t.usdOc)}${t.sinP ? `<small class="warn" title="${t.sinP} línea(s) sin precio no suman">*</small>` : ''}</td><td>${fV(t.usdFact)}</td><td>${fV(t.usdBo)}</td><td>${fM3(t.m3Oc)}${t.sinM ? `<small class="warn" title="${t.sinM} línea(s) sin m³ no suman">*</small>` : ''}</td><td>${fM3(t.m3Fact)}</td>`;
      const filas = [...g.entries()].sort((a, b) => b[1].t.usdOc - a[1].t.usdOc).map(([cli, G], i) => {
        const id = 'ord-pc-' + i, ab = S.abiertos.has(cli);
        return `<tr class="cli"><th class="l" scope="row"><button type="button" class="exp" aria-expanded="${ab}" aria-controls="${[...G.cats.keys()].map((_, j) => id + '-' + j).join(' ')}" data-opiv="${esc(cli)}">${esc(cli)}</button></th>${celdas(G.t)}</tr>`
          + [...G.cats.entries()].sort((a, b) => b[1].usdOc - a[1].usdOc).map(([cat, t], j) => `<tr class="cat" id="${id}-${j}"${ab ? '' : ' hidden'}><th class="l" scope="row">${esc(cat)}</th>${celdas(t)}</tr>`).join('');
      }).join('');
      const tcTxt = crc ? (tcs.size ? 'Tipo de cambio de T_TIPO_CAMBIO vigente en la fecha de cada OC: ' + [...tcs.values()].map(t => '₡' + nf2.format(t.valor) + ' desde ' + fecha(t.desde)).join('; ') + '.' : 'Sin tipo de cambio en datos_exportacion.json: no se puede mostrar en colones.') : '';
      const filtro = (S.mes ? mll(S.mes) : 'todos los meses') + (S.estados.size ? ' · ' + [...S.estados].map(cap).join(', ') : ' · todos los estados');
      box.innerHTML = `<section class="panel" aria-labelledby="ord-piv-t">
        <div class="panel-h"><h2 id="ord-piv-t">Resumen órdenes</h2><span class="nota">${esc(filtro)} · ${ds.length} ${ds.length === 1 ? 'orden' : 'órdenes'}</span>
          <span class="der"><span class="seg" role="group" aria-label="Moneda"><button type="button" data-omon="USD" aria-pressed="${!crc}">USD</button><button type="button" data-omon="CRC" aria-pressed="${crc}">Colones (₡)</button></span>
          <button type="button" class="chip" data-opivtodo="1">Expandir todo</button><button type="button" class="chip" data-opivtodo="0">Contraer todo</button></span></div>
        <div class="ord-res" style="margin-bottom:12px">
          <div><span>Cajas OC</span><b>${fN(tot.cajas)}</b><small>${fN(ds.reduce((a, d) => a + d.lineas.length, 0))} líneas</small></div>
          <div><span>Valor OC</span><b>${fV(tot.usdOc)}</b><small>${tot.sinP ? tot.sinP + ' línea(s) sin precio no suman' : 'todas las líneas con precio'}</small></div>
          <div><span>Monto BO</span><b>${fV(tot.usdBo)}</b><small>Factura: ${fV(tot.usdFact)}</small></div>
          <div><span>M3 OC</span><b>${fM3(tot.m3Oc)}</b><small>${tot.sinM ? tot.sinM + ' línea(s) sin m³ no suman' : 'Factura: ' + fM3(tot.m3Fact) + ' m³'}</small></div>
        </div>
        ${crc ? `<p class="small muted" style="margin-bottom:8px">${esc(tcTxt)}</p>` : ''}
        ${ds.length ? `<div class="tw" role="region" tabindex="0" aria-labelledby="ord-piv-t"><table class="tbl ord-piv"><thead><tr><th class="l" scope="col">Cliente / categoría</th><th scope="col">Cajas OC</th><th scope="col">Valor OC (${mon})</th><th scope="col">Valor factura (${mon})</th><th scope="col">Monto BO (${mon})</th><th scope="col">M3 OC</th><th scope="col">M3 factura</th></tr></thead>
          <tbody>${filas}</tbody><tfoot><tr><th class="l" scope="row">Total general</th>${celdas(tot)}</tr></tfoot></table></div>` : '<p class="ord-vacio">No hay órdenes con estos filtros.</p>'}
        <p class="small muted" style="margin-top:8px">Valor OC = cajas pedidas × precio · Valor factura = cajas confirmadas × precio · Monto BO = (pedidas − confirmadas) × precio · M3 = m³ por caja (T_EMPAQUES) × cajas. Precio de T_PRECIOS_EXPORTACION vigente en la fecha de la OC. * = hay líneas que no suman (ver abajo).</p>
        ${problemas.length ? `<details class="ord-hist" style="margin-top:8px"><summary><b>${problemas.length} línea(s) con aviso</b> (no suman en valor o en m³)</summary><div class="tw" style="margin-top:8px"><table class="tbl"><thead><tr><th class="l">Cliente · OC</th><th class="l">Código</th><th class="l">Producto</th><th>Cajas</th><th class="l">Aviso</th></tr></thead><tbody>
          ${problemas.map(([o, x]) => `<tr><td class="l">${esc(o.cliente)} · ${esc(o.oc)}</td><td class="l">${esc(x.cod || '—')}</td><td class="l" style="white-space:normal">${esc(x.desc || '')}</td><td>${fN(x.ped)}</td><td class="l" style="white-space:normal">${pillsAv(x.avisos.filter(a => a[0] !== 'info'))}${x.precioInfo && x.precioInfo.motivo ? `<small class="muted" style="display:block">${esc(x.precioInfo.motivo)}</small>` : ''}</td></tr>`).join('')}
        </tbody></table></div></details>` : ''}
      </section>`;
    }

    /* ---------- vista: contenedor 3D (núcleo de app_2_vistas.js) ---------- */
    let N3 = null;
    try { N3 = typeof window.iniciarPortal === 'function' ? window.iniciarPortal('nucleo3D') : null; } catch (e) { N3 = null; }
    function itemsC3() {
      const os = S.c3.orden ? S.doc.ordenes.filter(o => o.id === S.c3.orden) : visibles();
      const g = new Map(), cats = [...new Set([...S.M.productos.values()].map(p => p.cat))].sort();
      os.forEach(o => derivarOrden(S.M, o).lineas.forEach(x => {
        if (!x.cajasEnvio) return;
        const k = x.cod || '(sin código)', it = g.get(k) || { cod: k, desc: x.desc || k, cat: x.cat, cajas: 0, pz: x.pz, p: x.p }; it.cajas += x.cajasEnvio; g.set(k, it);
      }));
      return [...g.values()].map(it => {
        const p = it.p, cm = v => (v > 0 ? v * 10 : null);
        let L = p && cm(p.largoCm), W = p && cm(p.anchoCm), H = p && cm(p.altoCm), tipo = 'real';
        if (!(L && W && H)) { const lado = p && p.m3 > 0 ? Math.cbrt(p.m3) * 1000 : null; if (lado) { L = W = H = lado; tipo = 'cubo'; } else { L = 500; W = 350; H = 300; tipo = 'estimada'; } }
        return { cod: it.cod, desc: it.desc, cat: it.cat, cajas: Math.ceil(it.cajas - 1e-9), pzCaja: it.pz || 0, largo: L, ancho: W, alto: H, peso: p && p.pesoKg > 0 ? p.pesoKg : 0, sinPeso: !(p && p.pesoKg > 0), medida: tipo, color: PAL[Math.max(0, cats.indexOf(it.cat)) % PAL.length] };
      }).sort((a, b) => b.alto - a.alto || b.largo * b.ancho - a.largo * a.ancho);
    }
    function pintarC3() {
      const box = $('#ord-v-c3');
      if (S.c3.escena) { S.c3.escena.destruir(); S.c3.escena = null; }
      const ks = S.M.contenedores;
      if (!N3 || !ks.length) { box.innerHTML = `<section class="panel ord-vacio">${!N3 ? 'La vista del contenedor no está disponible en esta página.' : 'datos_exportacion.json no trae contenedores (T_CONTENEDORES).'}</section>`; return; }
      const k = ks.find(x => x.id === S.c3.tipo) || ks.find(x => /40' HC/i.test(x.id)) || ks[ks.length - 1]; S.c3.tipo = k.id;
      const items = itemsC3(), plan = N3.empacar(items, k, S.M.factor); S.c3.plan = plan; if (S.c3.idx >= plan.conts.length) S.c3.idx = 0;
      const cu = plan.conts[S.c3.idx], n = plan.conts.length, pct = x => nf0.format(x * 100) + ' %';
      const totC = items.reduce((a, i) => a + i.cajas, 0), volT = items.reduce((a, i) => a + i.cajas * i.largo * i.ancho * i.alto, 0) / 1e9;
      const ordSel = S.c3.orden ? S.doc.ordenes.find(o => o.id === S.c3.orden) : null;
      const opts = visibles().map(o => [o.id, `${o.cliente} · OC ${o.oc}`]);
      if (ordSel && !opts.some(x => x[0] === ordSel.id)) opts.unshift([ordSel.id, `${ordSel.cliente} · OC ${ordSel.oc}`]);
      const g = new Map(); if (cu) cu.porItem.forEach((nC, it) => { const o = g.get(it.cat) || { color: it.color, cajas: 0 }; o.cajas += nC; g.set(it.cat, o); });
      const filasPlan = []; plan.conts.forEach((x, i) => x.porItem.forEach((nC, it) => filasPlan.push([i + 1, it, nC])));
      box.innerHTML = `<section class="panel c3" aria-labelledby="ord-c3-t">
        <div class="panel-h"><h2 id="ord-c3-t">Contenedor</h2><span class="nota">${esc(ordSel ? `${ordSel.cliente} · OC ${ordSel.oc}` : (S.mes ? mll(S.mes) : 'todos los meses') + (S.estados.size ? ' · ' + [...S.estados].map(cap).join(', ') : ''))} · ${esc(k.nombre)} · interior ${nf2.format(k.largo / 1000)} × ${nf2.format(k.ancho / 1000)} × ${nf2.format(k.alto / 1000)} m</span></div>
        <div class="c3-filtros">
          <div class="c3-f"><span>Contenedor</span><div class="seg" role="group" aria-label="Tipo de contenedor">${ks.map(x => `<button type="button" data-oc3tipo="${esc(x.id)}" aria-pressed="${x.id === k.id}">${esc(x.id)}</button>`).join('')}</div></div>
          <label class="c3-f"><span>Órdenes</span><select id="ord-c3-orden"><option value="">Todas las del filtro (${visibles().length})</option>${opts.map(([v, t]) => `<option value="${esc(v)}"${v === S.c3.orden ? ' selected' : ''}>${esc(t)}</option>`).join('')}</select></label>
        </div>
        ${items.some(i => i.medida !== 'real') ? `<p class="small muted c3-ej">${items.some(i => i.medida === 'cubo') ? 'Las cajas sin largo, ancho y alto en T_EMPAQUES se dibujan como el cubo de su m³ por caja. ' : ''}${items.some(i => i.medida === 'estimada') ? 'Hay códigos sin medidas ni m³: se dibujan con un tamaño estimado. ' : ''}${S.M.factor ? 'Se llena hasta el ' + nf0.format(S.M.factor * 100) + ' % del volumen interior (factor de llenado).' : ''}</p>` : ''}
        <div class="c3-kpis">
          <div><span>Cajas a cargar</span><b>${fN(totC)}</b><small>${fM3(volT)} m³ · confirmadas si hay, si no pedidas</small></div>
          <div><span>Contenedores necesarios</span><b>${fN(n)}</b><small>${esc(k.nombre)}${plan.noCaben.length ? ' · ' + plan.noCaben.length + ' empaques no caben por medida' : ''}</small></div>
          <div><span>Contenedor ${n ? S.c3.idx + 1 : 0} de ${n}</span><b>${cu ? fN(cu.cajas.length) + ' cajas' : '—'}</b><small>${cu ? (n > 1 ? fN(totC - cu.cajas.length) + ' cajas van en los otros ' + (n - 1) : 'toda la carga cabe aquí') : 'sin carga con estos filtros'}</small></div>
          <div><span>Ocupación</span><b>${cu ? pct(cu.vol / plan.vol) + ' vol.' : '—'}</b><small>${cu && items.every(i => i.sinPeso) ? 'peso sin dato en T_EMPAQUES' : cu && k.pesoMax ? pct(cu.peso / k.pesoMax) + ' del peso' : ''}</small><span class="c3-bar" aria-hidden="true"><i style="width:${cu ? Math.min(100, cu.vol / plan.vol * 100).toFixed(1) : 0}%"></i></span></div>
        </div>
        ${n > 1 ? `<nav class="c3-nav" aria-label="Contenedores">${plan.conts.map((x, i) => `<button type="button" class="c3-mini" data-oc3idx="${i}" aria-pressed="${i === S.c3.idx}" aria-label="Contenedor ${i + 1}: ${fN(x.cajas.length)} cajas, ${pct(x.vol / plan.vol)} del volumen"><b>${i + 1}</b><span class="c3-bar" aria-hidden="true"><i style="width:${Math.min(100, x.vol / plan.vol * 100).toFixed(0)}%"></i></span><small>${pct(x.vol / plan.vol)}</small></button>`).join('')}</nav>` : ''}
        <div class="c3-escena-box">
          ${N3.barraHtml()}
          <div id="ord-c3-escena" class="c3-escena" role="img" aria-label="${esc(cu ? `${k.nombre}, contenedor ${S.c3.idx + 1} de ${n}: ${cu.cajas.length} cajas, ${pct(cu.vol / plan.vol)} del volumen. El detalle está en la tabla Plan de carga.` : 'Contenedor vacío con estos filtros')}"><p class="c3-msg">Cargando…</p></div>
          <div class="c3-tip" id="ord-c3-tip" hidden></div>
          <div class="c3-ctrl"><button type="button" class="btn" data-oc3cam="34">Vista 3/4</button><button type="button" class="btn" data-oc3cam="puerta">Desde la puerta</button><button type="button" class="btn" data-oc3cam="planta">Planta</button><button type="button" class="btn" id="ord-c3-anim" data-oc3anim>Repetir carga</button></div>
        </div>
        <div class="legend c3-ley">${[...g.entries()].sort((a, b) => b[1].cajas - a[1].cajas).map(([c, o]) => `<span><i class="sw col" style="background:${o.color}"></i>${esc(c)} · ${fN(o.cajas)} cajas</span>`).join('')}${N3.notaLeyenda(cu)}</div>
        <details class="c3-plan"><summary>Plan de carga (tabla)</summary>${filasPlan.length ? `<div class="tw" role="region" tabindex="0" aria-label="Plan de carga" style="max-height:320px"><table class="tbl"><thead><tr><th>Cont.</th><th class="l">Código</th><th class="l">Producto</th><th>Cajas</th><th>Piezas</th><th class="l">Caja (cm)</th></tr></thead><tbody>${filasPlan.map(([i, it, nC]) => `<tr><td>${i}</td><td class="l">${esc(it.cod)}</td><td class="l" style="white-space:normal">${esc(it.desc)}</td><td>${fN(nC)}</td><td>${it.pzCaja ? fN(nC * it.pzCaja) : '—'}</td><td class="l">${nf0.format(it.largo / 10)} × ${nf0.format(it.ancho / 10)} × ${nf0.format(it.alto / 10)}${it.medida === 'cubo' ? ' (cubo del m³)' : it.medida === 'estimada' ? ' (estimada)' : ''}</td></tr>`).join('')}</tbody></table></div>` : '<p class="small muted">Sin carga con estos filtros.</p>'}</details>
      </section>`;
      dibujarC3(plan);
    }
    async function dibujarC3(plan) {      // 081-CONT: 3D o 2D con N3.pintarVista (three.js solo se descarga en 3D)
      const el = $('#ord-c3-escena'); if (!el) return;
      if (S.c3.escena) { S.c3.escena.destruir(); S.c3.escena = null; }
      const h = await N3.pintarVista(el, plan, plan.conts[S.c3.idx], { btn: $('#ord-c3-anim'), tip: $('#ord-c3-tip'), redibujar: () => dibujarC3(S.c3.plan),
        vigente: () => S.c3.plan === plan && S.vista === 'c3' && $('#ord-c3-escena') === el,
        tipHtml: (it, nC) => `<b>${esc(it.desc)}</b><span>${esc(it.cod)} · ${esc(it.cat || '')}</span>${N3.lineasCaja(it, nC)}` });
      if (h) S.c3.escena = h;
    }

    function pintar() {
      pintarFiltros();
      ['lista', 'pivot', 'c3'].forEach(v => { $('#ord-v-' + v).hidden = v !== S.vista; });
      if (S.vista !== 'c3' && S.c3.escena) { S.c3.escena.destruir(); S.c3.escena = null; }
      if (S.vista === 'lista') pintarLista();
      if (S.vista === 'pivot') pintarPivot();
      if (S.vista === 'c3') pintarC3();
      if (S.ed && $('#ord-ed').open) refrescarTotalesEd();
    }

    /* ---------- editor de una orden ---------- */
    const dlgEd = $('#ord-ed');
    function nuevaOrden() {
      return { id: uid(), cliente: '', clase: '', oc: '', fechaOc: hoy(), mesEmbarque: S.mes && S.mes !== '__sin' ? S.mes : mesHoy(), estado: (S.M.listaEstados[0] || { estado: 'PROGRAMADO' }).estado, contenedor: '', fechaEmbarque: null, eta: null, notas: '', lineas: [lineaVacia()], historial: [] };
    }
    const lineaVacia = () => ({ cod: '', cajasPedidas: null, cajasConfirmadas: null, cajasFcst: null, precioCajaUsd: null, precioManual: false });
    function abrirEditor(id) {
      const o = id ? S.doc.ordenes.find(x => x.id === id) : null;
      if (id && !o) { toast('Esa orden ya no existe (otra persona la eliminó)'); return; }
      S.ed = { base: o ? copia(o) : null, d: o ? copia(o) : nuevaOrden(), sucio: false };
      if (!S.ed.d.lineas || !S.ed.d.lineas.length) S.ed.d.lineas = [lineaVacia()];
      pintarEditor(); dlgEd.showModal();
      const f = dlgEd.querySelector(o ? '#oe-estado' : '#oe-cliente'); if (f) f.focus();
    }
    function pintarEditor(msg) {
      const d = S.ed.d, ro = S.soloLectura, nuevo = !S.ed.base, e = estadoDe(S.M, d.estado), pideEta = !!(e && e.inventario);
      const cliOpts = S.M.listaClientes.map(c => `<option value="${esc(c.cliente)}"${clave(c.cliente) === clave(d.cliente) ? ' selected' : ''}>${esc(c.cliente)} · ${esc(c.clase)}</option>`).join('');
      dlgEd.innerHTML = `<div class="det-h"><div><span class="eyebrow">${nuevo ? 'Nueva orden de exportación' : 'Orden de exportación'}</span><h1 id="ord-ed-t" style="font-size:20px">${esc(d.cliente || 'Cliente sin elegir')}${d.oc ? ' · OC ' + esc(d.oc) : ''}</h1>
          <div class="meta">${S.ed.base && S.ed.base.historial && S.ed.base.historial.length ? 'Último cambio: ' + esc(hora(S.ed.base.historial[S.ed.base.historial.length - 1].fecha)) + ' · ' + esc(S.ed.base.historial[S.ed.base.historial.length - 1].por) : 'Sin guardar todavía'}</div></div>
          <button type="button" class="btn" data-oed="cerrar" style="margin-left:auto">Cerrar</button></div>
        <div class="det-in">
          <div id="oe-msg" role="alert">${msg || ''}</div>
          <form id="oe-form" novalidate>
          <fieldset class="ord-grid"${ro ? ' disabled' : ''}><legend class="vh">Datos de la orden</legend>
            <label class="ord-f"><span class="req">Cliente</span><select id="oe-cliente" required data-error="oe-e-cli"><option value="">Elegir cliente…</option>${cliOpts}${d.cliente && !cliDe(S.M, d.cliente) ? `<option selected value="${esc(d.cliente)}">${esc(d.cliente)} (no está en T_CLIENTES_EXPORTACION)</option>` : ''}</select></label>
            <label class="ord-f"><span class="req">OC</span><input id="oe-oc" required value="${esc(d.oc)}" autocomplete="off" spellcheck="false"></label>
            <label class="ord-f"><span class="req">Fecha de la OC</span><input id="oe-fecha" type="date" required value="${esc(d.fechaOc || '')}"></label>
            <label class="ord-f"><span class="req">Mes de embarque</span><input id="oe-mes" type="month" required value="${esc(d.mesEmbarque || '')}"></label>
            <label class="ord-f"><span>Estado</span><select id="oe-estado">${S.M.listaEstados.map(x => `<option value="${esc(x.estado)}"${x.estado === (d.estado || '').toUpperCase() ? ' selected' : ''}>${esc(x.estado)}</option>`).join('')}</select></label>
            <label class="ord-f"><span class="${pideEta ? 'req' : ''}">Contenedor</span><input id="oe-cont" list="ord-dl-cont" value="${esc(d.contenedor || '')}" placeholder="40' HC o número" autocomplete="off"${pideEta ? ' required' : ''}></label>
            <label class="ord-f"><span>Fecha de embarque</span><input id="oe-femb" type="date" value="${esc(d.fechaEmbarque || '')}"></label>
            <label class="ord-f"><span class="${pideEta ? 'req' : ''}">ETA (llegada)</span><input id="oe-eta" type="date" value="${esc(d.eta || '')}"${pideEta ? ' required' : ''}></label>
            <label class="ord-f ancho"><span>Notas</span><textarea id="oe-notas">${esc(d.notas || '')}</textarea></label>
          </fieldset>
          ${pideEta ? `<p class="aviso info" style="margin-top:10px">Estado <b>${esc(e.estado)}</b>: cuenta como inventario en tránsito del distribuidor (T_ESTADOS_ORDEN). Indicá la ETA y el contenedor.</p>` : ''}
          <div class="panel-h" style="margin-top:16px"><h2>Líneas</h2><span class="nota">Escribí el código o parte del nombre Brinova y elegí de la lista.</span>
            <span class="der">${ro ? '' : '<button type="button" class="btn" data-oed="linea">Agregar línea</button>'}</span></div>
          <div class="tw" role="region" tabindex="0" aria-label="Líneas de la orden"><table class="tbl ord-lin"><thead><tr><th class="l">Código</th><th class="l">Producto</th><th>Cajas pedidas</th><th>Confirmadas</th><th>FCST cajas</th><th>Precio caja USD</th><th>Piezas</th><th>m³</th><th>Monto OC</th><th>BO</th><th>Monto BO</th><th class="l">Avisos</th><th><span class="vh">Quitar</span></th></tr></thead>
            <tbody id="oe-lin">${d.lineas.map((l, i) => filaLinea(l, i, ro)).join('')}</tbody><tfoot id="oe-tot"></tfoot></table></div>
          ${histHtml()}
          <div class="ord-pie">
            ${ro ? '' : `<button type="submit" class="btn pri" id="oe-guardar">Guardar</button>`}
            <button type="button" class="btn" data-oed="cerrar">${ro ? 'Cerrar' : 'Cancelar'}</button>
            ${S.ed.base ? `<button type="button" class="btn" data-oc3="${esc(d.id)}">Ver en contenedor</button>` : ''}
            <span class="der">${!ro && S.ed.base ? '<button type="button" class="btn peligro" data-oed="borrar">Eliminar orden</button>' : ''}</span>
          </div>
          </form>
        </div>`;
      refrescarTotalesEd();
    }
    function filaLinea(l, i, ro) {
      const v = x => x == null ? '' : x, di = ro ? ' disabled' : '';
      return `<tr data-i="${i}"><td class="l"><input class="cod" list="ord-dl-prod" data-oc="cod" value="${esc(v(l.cod))}" aria-label="Código de la línea ${i + 1}" autocomplete="off" spellcheck="false"${di}></td>
        <td class="desc" data-k="desc"></td>
        <td><input class="w" inputmode="numeric" data-oc="cajasPedidas" value="${esc(v(l.cajasPedidas))}" aria-label="Cajas pedidas, línea ${i + 1}"${di}></td>
        <td><input class="w" inputmode="numeric" data-oc="cajasConfirmadas" value="${esc(v(l.cajasConfirmadas))}" aria-label="Cajas confirmadas, línea ${i + 1}"${di}></td>
        <td><input class="w" inputmode="numeric" data-oc="cajasFcst" value="${esc(v(l.cajasFcst))}" aria-label="FCST cajas, línea ${i + 1}"${di}></td>
        <td><input class="w" inputmode="decimal" data-oc="precio" value="${esc(l.precioManual ? v(l.precioCajaUsd) : '')}" aria-label="Precio manual por caja en USD, línea ${i + 1} (vacío = precio de lista)"${di}></td>
        <td data-k="pz"></td><td data-k="m3"></td><td data-k="usd"></td><td data-k="bo"></td><td data-k="usdbo"></td><td class="l" data-k="av"></td>
        <td>${ro ? '' : `<button type="button" class="x" data-oed="quitar" data-i="${i}" aria-label="Quitar la línea ${i + 1}">✕</button>`}</td></tr>`;
    }
    function histHtml() {
      const h = (S.ed.base && S.ed.base.historial) || [];
      return `<details class="ord-hist panel" style="margin-top:14px"><summary><b>Historial de cambios</b> (${h.length})</summary>${h.length ? `<ol>${h.slice().reverse().map(x => `<li><small>${esc(hora(x.fecha))} · ${esc(x.por || '?')}</small><br>${esc(x.cambio)}</li>`).join('')}</ol>` : '<p class="small muted">Sin cambios guardados todavía.</p>'}</details>`;
    }
    function refrescarTotalesEd() {
      if (!S.ed) return;
      const d = derivarOrden(S.M, S.ed.d);
      dlgEd.querySelectorAll('#oe-lin tr').forEach(tr => {
        const x = d.lineas[+tr.dataset.i]; if (!x) return;
        const c = k => tr.querySelector(`[data-k="${k}"]`);
        const coinc = !x.p && x.cod && clave(x.cod).length >= 3 ? [...S.M.productos.values()].filter(p => clave(p.desc).includes(clave(x.cod))).length : 0;
        c('desc').innerHTML = x.p ? `${esc(x.desc)}<small>${esc(x.cat)} · ${x.pz ? fN(x.pz) + ' pz por caja' : 'sin piezas por caja'}</small>`
          : coinc > 1 ? `<span class="warn">${coinc} productos contienen «${esc(x.cod)}»: elegí uno de la lista</span>` : x.cod ? '<span class="down">Código desconocido</span>' : '<span class="muted">—</span>';
        c('pz').textContent = fN(x.piezas); c('m3').textContent = x.m3c != null ? fM3(x.m3Oc) : '—';
        c('usd').innerHTML = x.precio != null ? `${fUsd(x.usdOc)}<small class="muted" style="display:block">${x.precioInfo.manual ? 'manual' : 'lista'} USD ${nf2.format(x.precio)}</small>` : '—';
        c('bo').textContent = fN(x.bo); c('usdbo').textContent = x.precio != null ? fUsd(x.usdBo) : '—';
        c('av').innerHTML = `<span class="ord-av">${pillsAv(x.avisos)}</span>`;
        const pin = tr.querySelector('[data-oc="precio"]'); if (pin && !x.precioInfo.manual) pin.placeholder = x.precio != null ? nf2.format(x.precio) : 'sin precio';
      });
      const t = d.tot, foot = dlgEd.querySelector('#oe-tot');
      if (foot) foot.innerHTML = `<tr><th class="l" colspan="2">Total · ${d.lineas.length} líneas${t.sinPrecio ? ` · <span class="warn">${t.sinPrecio} sin precio</span>` : ''}${t.sinM3 ? ` · <span class="warn">${t.sinM3} sin m³</span>` : ''}</th><td>${fN(t.cajas)}</td><td>${t.conf ? fN(t.conf) : '—'}</td><td></td><td></td><td>${fN(t.piezas)}</td><td>${fM3(t.m3Oc)}</td><td>${fUsd(t.usdOc)}</td><td>${fN(t.bo)}</td><td>${fUsd(t.usdBo)}</td><td class="l">${d.tc ? '<small class="muted">₡' + fN(t.usdOc * d.tc.valor) + ' (TC ' + nf2.format(d.tc.valor) + ')</small>' : ''}</td><td></td></tr>`;
    }
    function leerCampo(el) {
      const d = S.ed.d, id = el.id, v = el.value;
      const map = { 'oe-oc': 'oc', 'oe-fecha': 'fechaOc', 'oe-mes': 'mesEmbarque', 'oe-cont': 'contenedor', 'oe-femb': 'fechaEmbarque', 'oe-eta': 'eta', 'oe-notas': 'notas' };
      if (id === 'oe-cliente') { d.cliente = v; const c = cliDe(S.M, v); d.clase = c ? c.clase : ''; return 'cab'; }
      if (id === 'oe-estado') { d.estado = v; return 'estado'; }
      if (map[id]) { d[map[id]] = ['fechaOc', 'fechaEmbarque', 'eta'].includes(map[id]) ? (v || null) : v.trim ? (map[id] === 'notas' ? v : v.trim()) : v; return map[id] === 'fechaOc' ? 'precio' : 'cab'; }
      const tr = el.closest('tr[data-i]'); if (!tr || !el.dataset.oc) return null;
      const l = d.lineas[+tr.dataset.i], k = el.dataset.oc;
      if (k === 'cod') { const m = String(v).match(/^\s*([A-Za-z]{1,4}-?[\w.-]+?)\s*(·|$)/); l.cod = (m ? m[1] : v.split('·')[0]).trim().toUpperCase(); return 'linea'; }
      const n = numPegado(v);
      if (k === 'precio') { if (v.trim() === '') { l.precioManual = false; l.precioCajaUsd = null; } else if (isFinite(n)) { l.precioManual = true; l.precioCajaUsd = n; } return 'linea'; }
      l[k] = v.trim() === '' || !isFinite(n) ? null : n; return 'linea';
    }
    dlgEd.addEventListener('input', ev => { if (!S.ed || S.soloLectura) return; const r = leerCampo(ev.target); if (r) { S.ed.sucio = true; if (r !== 'cab' && r !== 'estado') refrescarTotalesEd(); if (ev.target.id === 'oe-oc') dlgEd.querySelector('#ord-ed-t').textContent = (S.ed.d.cliente || 'Cliente sin elegir') + (S.ed.d.oc ? ' · OC ' + S.ed.d.oc : ''); } });
    dlgEd.addEventListener('change', ev => {
      if (!S.ed || S.soloLectura) return;
      const r = leerCampo(ev.target); if (!r) return; S.ed.sucio = true;
      if (ev.target.dataset.oc === 'cod') {      // si se escribió parte del nombre y no se eligió de la lista: si coincide un solo producto, se toma ese
        const l = S.ed.d.lineas[+ev.target.closest('tr').dataset.i], txt = clave(ev.target.value.split('·').pop());
        if (l.cod && !S.M.productos.has(l.cod) && txt.length >= 3) { const c = [...S.M.productos.values()].filter(p => clave(p.desc).includes(txt)); if (c.length === 1) l.cod = c[0].cod; }
        ev.target.value = l.cod;
      }
      if (r === 'estado' || ev.target.id === 'oe-cliente') { pintarEditor(); const f = dlgEd.querySelector(r === 'estado' && estadoDe(S.M, S.ed.d.estado) && estadoDe(S.M, S.ed.d.estado).inventario && !S.ed.d.eta ? '#oe-eta' : '#' + ev.target.id); if (f) f.focus(); }
      else refrescarTotalesEd();
    });
    dlgEd.addEventListener('cancel', ev => { if (S.ed && S.ed.sucio && !confirm('Hay cambios sin guardar en esta orden. ¿Cerrar sin guardar?')) ev.preventDefault(); });
    dlgEd.addEventListener('close', () => { S.ed = null; });
    function validar(d) {
      const errs = [], e = estadoDe(S.M, d.estado);
      if (!d.cliente) errs.push(['oe-cliente', 'Elegí el cliente.']);
      else if (!cliDe(S.M, d.cliente)) errs.push(['oe-cliente', `El cliente "${d.cliente}" no está en T_CLIENTES_EXPORTACION.`]);
      if (!String(d.oc || '').trim()) errs.push(['oe-oc', 'Escribí el número de OC.']);
      if (!d.fechaOc) errs.push(['oe-fecha', 'Indicá la fecha de la OC (define el precio vigente).']);
      if (!/^\d{4}-\d{2}$/.test(d.mesEmbarque || '')) errs.push(['oe-mes', 'Indicá el mes de embarque.']);
      if (e && e.inventario) { if (!d.eta) errs.push(['oe-eta', `Para pasar a ${e.estado} indicá la ETA.`]); if (!String(d.contenedor || '').trim()) errs.push(['oe-cont', `Para pasar a ${e.estado} indicá el contenedor.`]); }
      const ls = d.lineas.filter(l => l.cod || num(l.cajasPedidas));
      if (!ls.length) errs.push([null, 'La orden no tiene líneas.']);
      ls.forEach((l, i) => { if (!(num(l.cajasPedidas) > 0)) errs.push([null, `La línea ${l.cod || i + 1} no tiene cajas pedidas.`]); });
      const dup = S.doc.ordenes.find(o => o.id !== d.id && clave(o.cliente) === clave(d.cliente) && String(o.oc).trim() === String(d.oc).trim());
      if (dup) errs.push(['oe-oc', `Ya existe la OC ${d.oc} de ${d.cliente} (${mll(dup.mesEmbarque)}).`]);
      return errs;
    }
    dlgEd.addEventListener('submit', async ev => {
      ev.preventDefault(); if (!S.ed || S.soloLectura) return;
      const d = S.ed.d; d.lineas = d.lineas.filter(l => l.cod || num(l.cajasPedidas) || num(l.cajasConfirmadas));
      const errs = validar(d);
      dlgEd.querySelectorAll('[aria-invalid="true"]').forEach(x => x.setAttribute('aria-invalid', 'false'));
      if (errs.length) {
        if (!d.lineas.length) d.lineas.push(lineaVacia());
        dlgEd.querySelector('#oe-msg').innerHTML = `<div class="aviso bad"><b>Falta completar:</b><ul style="margin:4px 0 0;padding-left:18px">${errs.map(x => `<li>${esc(x[1])}</li>`).join('')}</ul></div>`;
        errs.forEach(x => { if (x[0]) { const f = dlgEd.querySelector('#' + x[0]); if (f) f.setAttribute('aria-invalid', 'true'); } });
        const f = errs[0][0] && dlgEd.querySelector('#' + errs[0][0]);
        if (f) f.focus(); else { const m = dlgEd.querySelector('#oe-msg'); m.tabIndex = -1; m.focus(); }
        return;
      }
      const cambio = S.ed.base ? cambios(S.ed.base, d) : null;
      if (S.ed.base && !cambio.length) { dlgEd.close(); toast('Sin cambios'); return; }
      const nueva = copia(d);
      nueva.historial = (nueva.historial || []).concat([{ fecha: ahoraIso(), por: persona.nombre, cambio: cambio ? cambio.join('; ') : `creó la orden con ${nueva.lineas.length} líneas` }]);
      const id = nueva.id, base = S.ed.base ? JSON.stringify(S.ed.base) : null;
      const r = await guardar(doc => { const i = doc.ordenes.findIndex(o => o.id === id); if (i >= 0) doc.ordenes[i] = nueva; else doc.ordenes.push(nueva); }, S.ed.base ? 'Orden guardada' : 'Orden creada');
      if (r === true) { dlgEd.close(); return; }
      if (r === 'conflicto' && S.ed) {      // se recargó: el borrador sigue en el editor; si la misma orden cambió, se avisa
        const rem = S.doc.ordenes.find(o => o.id === id);
        let msg;
        if (!base) msg = 'Otra persona guardó órdenes mientras escribías. Tu orden nueva no se guardó todavía: revisala y tocá Guardar otra vez.';
        else if (!rem) msg = 'Otra persona <b>eliminó</b> esta orden mientras la editabas. Si la guardás de nuevo, se vuelve a crear con tus datos.';
        else if (JSON.stringify(rem) === base) msg = 'Otra persona guardó otras órdenes mientras editabas. Esta orden no cambió: tocá Guardar otra vez.';
        else {
          const cb = combinar(JSON.parse(base), d, rem);
          S.ed.d = cb.orden; if (!S.ed.d.lineas.length) S.ed.d.lineas.push(lineaVacia());
          msg = `Otra persona también cambió <b>esta orden</b> (${esc((rem.historial || []).slice(-1).map(h => h.por + ': ' + h.cambio).join('') || 'sin detalle')}). Se juntaron sus cambios con los tuyos y nada se guardó todavía: revisá y tocá Guardar.`
            + (cb.choques.length ? `<br><b>En esto cambiaron lo mismo; quedó lo de la otra persona</b> (si querés el tuyo, escribilo de nuevo):<ul style="margin:4px 0 0;padding-left:18px">${cb.choques.map(c => `<li>${esc(c)}</li>`).join('')}</ul>` : '');
        }
        S.ed.base = rem ? copia(rem) : null;
        if (rem) S.ed.d.historial = rem.historial;
        pintarEditor(`<div class="aviso bad">${msg}</div>`);
      }
    });
    dlgEd.addEventListener('click', async ev => {
      const b = ev.target.closest('button'); if (!b) return;
      const a = b.dataset.oed;
      if (a === 'cerrar') { if (S.ed && S.ed.sucio && !S.soloLectura && !confirm('Hay cambios sin guardar en esta orden. ¿Cerrar sin guardar?')) return; dlgEd.close(); return; }
      if (a === 'linea') { S.ed.d.lineas.push(lineaVacia()); const tb = dlgEd.querySelector('#oe-lin'); tb.insertAdjacentHTML('beforeend', filaLinea(S.ed.d.lineas[S.ed.d.lineas.length - 1], S.ed.d.lineas.length - 1, false)); refrescarTotalesEd(); tb.lastElementChild.querySelector('input').focus(); return; }
      if (a === 'quitar') { S.ed.d.lineas.splice(+b.dataset.i, 1); if (!S.ed.d.lineas.length) S.ed.d.lineas.push(lineaVacia()); S.ed.sucio = true; dlgEd.querySelector('#oe-lin').innerHTML = S.ed.d.lineas.map((l, i) => filaLinea(l, i, false)).join(''); refrescarTotalesEd(); return; }
      if (a === 'borrar') {
        const d = S.ed.base; if (!d || !confirm(`¿Eliminar la OC ${d.oc} de ${d.cliente}? Si la orden ya no va, es mejor pasarla a RETIRADA para que quede su historial.`)) return;
        const r = await guardar(doc => { doc.ordenes = doc.ordenes.filter(o => o.id !== d.id); }, 'Orden eliminada');
        if (r === true) dlgEd.close();
        return;
      }
      if (b.dataset.oc3) { if (S.ed && S.ed.sucio && !confirm('Hay cambios sin guardar. ¿Ir al contenedor sin guardar?')) return; S.ed = null; dlgEd.close(); verC3(b.dataset.oc3); }
    });

    /* ---------- cambio rápido de estado desde la lista (EN TRANSITO pide ETA y contenedor) ---------- */
    const dlgEst = $('#ord-est');
    async function cambiarEstado(id, nuevo, sel) {
      const o = S.doc.ordenes.find(x => x.id === id); if (!o) return;
      const e = estadoDe(S.M, nuevo), viejo = o.estado;
      const aplicar = async extra => {
        const d = Object.assign(copia(o), { estado: nuevo }, extra || {});
        const c = cambios(o, d); d.historial = (d.historial || []).concat([{ fecha: ahoraIso(), por: persona.nombre, cambio: c.join('; ') }]);
        const r = await guardar(doc => { const i = doc.ordenes.findIndex(x => x.id === id); if (i >= 0) doc.ordenes[i] = d; }, `OC ${o.oc}: ${nuevo}`);
        if (r !== true) pintar();
        return r;
      };
      if (!(e && e.inventario)) { await aplicar(); return; }
      dlgEst.innerHTML = `<div class="dx-h"><div><span class="eyebrow">${esc(o.cliente)} · OC ${esc(o.oc)}</span><h1 id="ord-est-t" style="font-size:16px">Pasar a ${esc(nuevo)}</h1></div></div>
        <form class="dx-b ord-est-b" method="dialog" novalidate>
          <p class="small">Desde este estado la orden cuenta como inventario en tránsito del distribuidor (T_ESTADOS_ORDEN). Indicá cuándo llega y en qué contenedor va.</p>
          <label class="ord-f"><span class="req">ETA (llegada)</span><input type="date" id="oest-eta" required value="${esc(o.eta || '')}" autofocus></label>
          <label class="ord-f"><span class="req">Contenedor</span><input id="oest-cont" list="ord-dl-cont" required value="${esc(o.contenedor || '')}" placeholder="40' HC o número" autocomplete="off"></label>
          <label class="ord-f"><span>Fecha de embarque</span><input type="date" id="oest-femb" value="${esc(o.fechaEmbarque || '')}"></label>
          <p id="oest-err" class="aviso bad" hidden></p>
          <div class="row"><button type="button" class="btn" value="cancelar" data-oest-btn="cancelar">Cancelar</button><button type="submit" class="btn pri" value="ok">Guardar</button></div>
        </form>`;
      const f = dlgEst.querySelector('form');
      dlgEst.querySelector('[data-oest-btn="cancelar"]').onclick = () => dlgEst.close('');
      dlgEst.onclose = () => { if (dlgEst.returnValue !== 'ok' && sel) sel.value = viejo; dlgEst.returnValue = ''; };
      f.onsubmit = async ev => {
        ev.preventDefault();
        const eta = dlgEst.querySelector('#oest-eta').value, cont = dlgEst.querySelector('#oest-cont').value.trim(), femb = dlgEst.querySelector('#oest-femb').value || null;
        const err = dlgEst.querySelector('#oest-err');
        dlgEst.querySelector('#oest-eta').setAttribute('aria-invalid', !eta); dlgEst.querySelector('#oest-cont').setAttribute('aria-invalid', !cont);
        if (!eta || !cont) { err.hidden = false; err.textContent = 'Faltan ' + [!eta && 'la ETA', !cont && 'el contenedor'].filter(Boolean).join(' y ') + '.'; (dlgEst.querySelector(!eta ? '#oest-eta' : '#oest-cont')).focus(); return; }
        dlgEst.returnValue = 'ok'; dlgEst.close('ok');
        await aplicar({ eta, contenedor: cont, fechaEmbarque: femb });
      };
      dlgEst.showModal();
    }

    /* ---------- pegar desde Excel ---------- */
    const dlgPg = $('#ord-pg');
    function abrirPegar() {
      dlgPg.innerHTML = `<div class="det-h"><div><span class="eyebrow">Migración desde el Excel de órdenes</span><h1 id="ord-pg-t" style="font-size:20px">Pegar filas de la hoja BASE</h1>
          <div class="meta">Copiá en Excel las columnas CLIENTE, OC, COD. SOFTLAND y CANTIDAD PEDIDA CAJAS (con o sin encabezado), o filas completas de BASE, y pegalas aquí.</div></div>
          <form method="dialog" style="margin-left:auto"><button class="btn" value="cerrar">Cerrar</button></form></div>
        <div class="det-in">
          <label class="ord-f"><span>Filas copiadas de Excel</span><textarea id="opg-txt" placeholder="CLIENTE&#9;OC&#9;COD. SOFTLAND&#9;CANTIDAD PEDIDA CAJAS" autofocus spellcheck="false"></textarea></label>
          <div class="ord-grid">
            <label class="ord-f"><span class="req">Mes de embarque</span><input type="month" id="opg-mes" value="${esc(S.mes && S.mes !== '__sin' ? S.mes : mesHoy())}" required></label>
            <label class="ord-f"><span class="req">Fecha de las OC</span><input type="date" id="opg-fecha" value="${hoy()}" required></label>
            <label class="ord-f"><span>Estado</span><select id="opg-est">${S.M.listaEstados.filter(e => !e.inventario).map(e => `<option${e.estado === 'PROGRAMADO' ? ' selected' : ''}>${esc(e.estado)}</option>`).join('')}</select></label>
            <label class="ord-f"><span>Si la OC ya existe</span><select id="opg-modo"><option value="agregar">Agregar las líneas</option><option value="reemplazar">Reemplazar sus líneas</option></select></label>
          </div>
          <div id="opg-prev" aria-live="polite"></div>
          <div class="ord-pie"><button type="button" class="btn pri" id="opg-ok" disabled>Crear órdenes</button><span class="small muted" id="opg-nota"></span></div>
        </div>`;
      dlgPg.showModal();
      const prev = () => pintarPrevia();
      ['opg-txt', 'opg-mes', 'opg-fecha', 'opg-modo'].forEach(id => dlgPg.querySelector('#' + id).addEventListener('input', prev));
      dlgPg.querySelector('#opg-ok').onclick = crearDesdePegado;
    }
    function agruparPegado() {
      const r = parsearPegado(dlgPg.querySelector('#opg-txt').value), g = new Map();
      const f = dlgPg.querySelector('#opg-fecha').value || hoy();
      r.lineas.forEach(l => {
        const k = clave(l.cliente) + '|' + String(l.oc).trim();
        if (!g.has(k)) g.set(k, { cliente: (cliDe(S.M, l.cliente) || { cliente: l.cliente }).cliente, conocido: !!cliDe(S.M, l.cliente), oc: String(l.oc).trim(), lineas: [] });
        g.get(k).lineas.push({ cod: l.cod, cajasPedidas: l.cajas, cajasConfirmadas: l.conf, cajasFcst: l.fcst, precioCajaUsd: null, precioManual: false });
      });
      const grupos = [...g.values()].map(x => { const o = { cliente: x.cliente, oc: x.oc, fechaOc: f, lineas: x.lineas }; return Object.assign(x, { d: derivarOrden(S.M, o), existe: S.doc.ordenes.find(e => clave(e.cliente) === clave(x.cliente) && String(e.oc).trim() === x.oc) || null }); });
      return { r, grupos };
    }
    function pintarPrevia() {
      const { r, grupos } = agruparPegado(), box = dlgPg.querySelector('#opg-prev'), btn = dlgPg.querySelector('#opg-ok');
      const malos = grupos.filter(x => !x.conocido), buenos = grupos.filter(x => x.conocido);
      const lin = buenos.reduce((a, x) => a + x.lineas.length, 0);
      btn.disabled = !buenos.length || S.soloLectura;
      btn.textContent = buenos.length ? `Crear ${buenos.filter(x => !x.existe).length} órdenes${buenos.some(x => x.existe) ? ' y actualizar ' + buenos.filter(x => x.existe).length : ''} (${fN(lin)} líneas)` : 'Crear órdenes';
      if (!r.lineas.length && !r.errores.length) { box.innerHTML = ''; return; }
      const T = grupos.reduce((t, x) => { t.c += x.d.tot.cajas; t.u += x.d.tot.usdOc; t.m += x.d.tot.m3Oc; return t; }, { c: 0, u: 0, m: 0 });
      box.innerHTML = `<p class="small muted">Formato reconocido: ${esc(r.modo)} · ${fN(r.lineas.length)} filas · ${fN(T.c)} cajas · ${fUsd(T.u)} · ${fM3(T.m)} m³ (precio vigente el ${esc(fecha(dlgPg.querySelector('#opg-fecha').value))})</p>
        ${r.errores.length ? `<div class="aviso bad"><b>${r.errores.length} fila(s) no se pueden leer:</b><ul style="margin:4px 0 0;padding-left:18px">${r.errores.slice(0, 12).map(e => `<li>${esc(e)}</li>`).join('')}</ul></div>` : ''}
        ${malos.length ? `<div class="aviso bad"><b>Cliente desconocido</b> (no está en T_CLIENTES_EXPORTACION; esas órdenes no se crean): ${malos.map(x => esc(x.cliente)).join(', ')}</div>` : ''}
        <div class="tw" role="region" tabindex="0" aria-label="Vista previa" style="margin-top:8px"><table class="tbl"><thead><tr><th class="l">Cliente · OC</th><th>Líneas</th><th>Cajas</th><th>Valor OC</th><th>m³</th><th class="l">Avisos</th></tr></thead><tbody>
        ${grupos.map(x => `<tr><td class="l">${esc(x.cliente)} · OC ${esc(x.oc)}${x.existe ? ' <span class="pill warn">ya existe</span>' : ''}</td><td>${x.lineas.length}</td><td>${fN(x.d.tot.cajas)}</td><td>${fUsd(x.d.tot.usdOc)}</td><td>${fM3(x.d.tot.m3Oc)}</td><td class="l" style="white-space:normal"><span class="ord-av">${pillsAv(resumenAvisos(x.d))}</span>${x.d.lineas.filter(l => l.avisos.some(a => a[0] !== 'info')).slice(0, 6).map(l => `<small class="muted" style="display:block">${esc(l.cod || 'sin código')} (${fN(l.ped)} cajas): ${esc(l.avisos.filter(a => a[0] !== 'info').map(a => a[1].toLowerCase()).join(', '))}</small>`).join('')}</td></tr>`).join('')}
        </tbody></table></div>`;
    }
    async function crearDesdePegado() {
      const { grupos } = agruparPegado(), buenos = grupos.filter(x => x.conocido); if (!buenos.length) return;
      const mes = dlgPg.querySelector('#opg-mes').value, f = dlgPg.querySelector('#opg-fecha').value, est = dlgPg.querySelector('#opg-est').value, modo = dlgPg.querySelector('#opg-modo').value;
      if (!/^\d{4}-\d{2}$/.test(mes) || !f) { dlgPg.querySelector('#opg-nota').textContent = 'Indicá el mes de embarque y la fecha de las OC.'; return; }
      const ahora = ahoraIso();
      const r = await guardar(doc => {
        buenos.forEach(x => {
          const ex = doc.ordenes.find(e => clave(e.cliente) === clave(x.cliente) && String(e.oc).trim() === x.oc);
          if (ex) {
            const antes = copia(ex);
            ex.lineas = modo === 'reemplazar' ? copia(x.lineas) : (ex.lineas || []).concat(copia(x.lineas));
            ex.historial = (ex.historial || []).concat([{ fecha: ahora, por: persona.nombre, cambio: `pegó ${x.lineas.length} líneas desde Excel (${modo === 'reemplazar' ? 'reemplazó las líneas' : 'agregadas'}): ` + cambios(antes, ex).slice(0, 8).join('; ') }]);
          } else {
            const c = cliDe(S.M, x.cliente);
            doc.ordenes.push({ id: uid(), cliente: c.cliente, clase: c.clase, oc: x.oc, fechaOc: f, mesEmbarque: mes, estado: est, contenedor: '', fechaEmbarque: null, eta: null, notas: '',
              lineas: copia(x.lineas), historial: [{ fecha: ahora, por: persona.nombre, cambio: `creó la orden pegando ${x.lineas.length} líneas desde Excel` }] });
          }
        });
      }, `${buenos.length} órdenes guardadas`);
      if (r === true) { S.mes = mes; dlgPg.close(); pintar(); }
    }

    function verC3(id, mes) {
      if (id) S.c3.orden = id; else { S.c3.orden = ''; if (mes != null) S.mes = mes; }
      S.c3.idx = 0; S.vista = 'c3'; pintar(); window.scrollTo({ top: 0 });
    }

    /* ---------- eventos de la pantalla ---------- */
    raiz.addEventListener('click', ev => {
      const b = ev.target.closest('button'); if (!b || b.closest('dialog')) return;
      const ds = b.dataset;
      if (ds.ov) { S.vista = ds.ov; if (ds.ov === 'c3') S.c3.idx = 0; pintar(); return; }
      if (ds.oest) { const e = ds.oest; S.estados.has(e) ? S.estados.delete(e) : S.estados.add(e); S.c3.orden = ''; pintar(); return; }
      if (b.id === 'ord-nueva') { abrirEditor(null); return; }
      if (b.id === 'ord-pegar') { abrirPegar(); return; }
      if (ds.oedit) { abrirEditor(ds.oedit); return; }
      if (ds.oc3) { verC3(ds.oc3); return; }
      if (ds.oc3mes != null) { verC3(null, ds.oc3mes); return; }
      if (ds.opiv) { S.abiertos.has(ds.opiv) ? S.abiertos.delete(ds.opiv) : S.abiertos.add(ds.opiv); pintarPivot(); const nb = [...document.querySelectorAll('[data-opiv]')].find(x => x.dataset.opiv === ds.opiv); if (nb) nb.focus(); return; }
      if (ds.opivtodo) { S.abiertos = ds.opivtodo === '1' ? new Set(S.doc.ordenes.map(o => o.cliente)) : new Set(); pintarPivot(); return; }
      if (ds.omon) { S.moneda = ds.omon; pintarPivot(); return; }
      if (ds.oc3tipo) { S.c3.tipo = ds.oc3tipo; S.c3.idx = 0; pintarC3(); return; }
      if (ds.oc3idx != null) { S.c3.idx = +ds.oc3idx; pintarC3(); return; }
      if (ds.oc3cam) { if (S.c3.escena) S.c3.escena.camara(ds.oc3cam); return; }
      if ('oc3anim' in ds) { if (S.c3.escena) S.c3.escena.recargar(); }
    });
    raiz.addEventListener('change', ev => {
      const t = ev.target; if (t.closest('dialog')) return;
      if (t.id === 'ord-f-mes') { S.mes = t.value; S.c3.orden = ''; S.c3.idx = 0; pintar(); return; }
      if (t.id === 'ord-c3-orden') { S.c3.orden = t.value; S.c3.idx = 0; pintarC3(); return; }
      if (t.dataset.oestado) cambiarEstado(t.dataset.oestado, t.value, t);
    });
    if (typeof HTMLDialogElement !== 'undefined' && !('closedBy' in HTMLDialogElement.prototype)) {      // Safari: cerrar al tocar fuera
      [dlgPg, dlgEst].forEach(dlg => {
        let fuera = false; const out = e => { const r = dlg.getBoundingClientRect(); return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom; };
        dlg.addEventListener('pointerdown', e => { fuera = out(e); }); dlg.addEventListener('pointerup', e => { if (fuera && out(e)) dlg.close(); });
      });
    }
    cargar();
    return { recargar: cargar };
  }

  window.Ordenes = { modelo, derivarOrden, derivarLinea, indicadores, parsearPegado, precioDe, tcDe, cambios, combinar, iniciar };
})();

