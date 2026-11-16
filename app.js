/* Generado por herramientas/construir_web.py desde 07 MOTOR FCST/portal. No editar aquí. */
window.iniciarPortal = function (DATOS) {
'use strict';
/* ---------- datos y formatos ---------- */
const D = DATOS;
const P = D.productos;
const MK = D.mesesKam, MH = D.mesesHist, MF = D.mesesFc;
const CID = (D.kam || 'kam').toLowerCase().normalize('NFD').replace(/[^a-z0-9]/g, '') + '-' + D.ciclo;
const MES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'];
const MESL = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const ml = m => MES[+m.slice(5, 7) - 1] + ' ' + m.slice(2, 4);
const mll = m => MESL[+m.slice(5, 7) - 1] + ' ' + m.slice(0, 4);
const nf = new Intl.NumberFormat('es-CR', { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat('es-CR', { maximumFractionDigits: 1 });
const nf2 = new Intl.NumberFormat('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const ok = v => v != null && isFinite(v);
const fN = v => ok(v) ? nf.format(Math.round(v)) : '—';
const fC = v => { if (!ok(v)) return '—'; const a = Math.abs(v); if (a >= 1e6) return '₡' + nf1.format(v / 1e6) + ' M'; if (a >= 1e4) return '₡' + nf.format(v / 1e3) + ' mil'; return '₡' + nf.format(v); };
const fCx = v => { const a = Math.abs(v); if (a >= 1e6) return nf1.format(v / 1e6) + ' M'; if (a >= 1e3) return nf.format(v / 1e3) + ' mil'; return nf.format(v); };
const fP = v => ok(v) ? (v > 0 ? '+' : '') + nf.format(v * 100) + '%' : '—';
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const $ = s => document.querySelector(s);
const sum = (o, ms) => ms.reduce((a, m) => a + ((o && o[m]) || 0), 0);
const hora = () => new Date().toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' });

const LINES = {};
P.forEach(p => {
  p.codigos.forEach(c => { c.id = p.clase + '__' + c.cod; LINES[c.id] = { p, c }; });
  p.cap = p.codigos.filter(c => c.captura);
  p.princ = p.codigos.find(c => c.cod === p.principal) || p.codigos[0];
});

/* ---------- estado ---------- */
/* tipo de fuente de cada clase: 'sell through' (distribuidor), 'sell out' (cadena) o 'sell in directo' */
const tipoDe = c => (D.distribuidores[c] || {}).tipo || 'sell in directo';
const tipoSel = () => { if (S.dist !== 'TODOS') return tipoDe(S.dist); const t = [...new Set(D.clases.map(tipoDe))]; return t.length === 1 ? t[0] : 'mixto'; };
const nomVenta = t => t === 'sell in directo' ? 'Venta (facturación directa)' : t === 'sell out' ? 'Venta al consumidor' : t === 'mixto' ? 'Venta del cliente' : 'Venta del distribuidor';
const S = { dist: 'TODOS', vista: 'tendencia', unidad: 'form', q: '', cat: '', orden: 'valor', chip: 'todos', q2: '', chip2: 'todos', abierto: null, desde: '2025-01' };
let remote = {}, local = {}, uid = null, db = null, userCap = null, envio = null;
const LS = 'portal-' + CID;
try { const g = JSON.parse(localStorage.getItem(LS) || 'null'); if (g && g.unidad) S.unidad = g.unidad; } catch (e) { }

/* ---------- valores efectivos ---------- */
function kamU(c, m) {
  const l = local[c.id]; if (l && l.meses && l.meses[m] != null) return l.meses[m];
  const r = remote[c.id]; if (r && r.meses && r.meses[m] != null) return r.meses[m];
  return c.kam[m] || 0;
}
const editado = (c, m) => kamU(c, m) !== (c.kam[m] || 0);
const precioU = (p, c) => c.precio != null ? c.precio : (p.precioPz != null && c.pzPorU ? p.precioPz * c.pzPorU : null);
const kamPz = (p, m) => p.codigos.reduce((a, c) => a + kamU(c, m) * (c.pzPorU || 0), 0);
const kamVal = (p, m) => p.codigos.reduce((a, c) => { const pr = precioU(p, c); return a + (pr ? kamU(c, m) * pr : 0); }, 0);
const pv = (p, pz) => p.precioPz != null ? (pz || 0) * p.precioPz : 0;
const algPz6 = p => sum(p.alg, MK);
const kamPz6 = p => MK.reduce((a, m) => a + kamPz(p, m), 0);
const tend = p => p.d3ly > 0 ? p.d3 / p.d3ly - 1 : null;
const dias = p => p.inv ? p.inv.doh : null;
function dif(p) { const a = algPz6(p), k = kamPz6(p); if (a <= 0 && k <= 0) return null; if (a <= 0) return null; return k / a - 1; }
const fac = p => S.unidad === 'pz' ? 1 : (p.uPz || 1);
function uNom(p) {
  if (S.unidad === 'pz') return 'piezas';
  if (!p.uPz || p.uPz === 1) return 'unidades';
  const pr = (p.princ.pres || 'Caja').toLowerCase();
  const pl = pr === 'caja' ? 'cajas' : pr === 'unidad' ? 'unidades' : pr === 'pack oferta' ? 'packs' : pr;
  return pl + ' de ' + fN(p.uPz) + ' pz';
}
function alertas(p) {
  const a = [];
  if (p.cierre !== 'OK') a.push(['bad', p.cierre === 'REVISAR' ? 'Dato a revisar' : p.cierre.charAt(0) + p.cierre.slice(1).toLowerCase()]);
  const d = dias(p);
  if (d != null) { if (d < 15) a.push(['warn', 'Inventario bajo']); else if (d > 90) a.push(['warn', 'Inventario alto']); }
  const df = dif(p);
  if (df != null && Math.abs(df) > 0.5 && pv(p, algPz6(p) + kamPz6(p)) > 300000) a.push(['warn', 'Tu forecast ' + (df > 0 ? 'arriba' : 'abajo') + ' del algoritmo']);
  if (p.precioPz == null) a.push(['bad', 'Sin precio']);
  return a;
}
const pill = (cls, t) => `<span class="pill ${cls || ''}">${esc(t)}</span>`;
function pillTend(t) { if (t == null) return pill('', 'sin base'); return pill(t >= 0.05 ? 'good' : t <= -0.1 ? 'bad' : '', fP(t)); }
function pillDias(d) { if (d == null) return pill('', 'sin dato'); return pill(d < 15 ? 'warn' : d > 90 ? 'warn' : 'good', fN(d) + ' días'); }
function pillDif(d) { if (d == null) return pill('', '—'); return pill(Math.abs(d) <= 0.1 ? 'good' : Math.abs(d) <= 0.3 ? '' : 'warn', fP(d)); }

/* ---------- gráficos (SVG propio, un solo eje) ---------- */
function niceMax(v) { if (v <= 0) return 1; const e = Math.pow(10, Math.floor(Math.log10(v))); for (const f of [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (f * e >= v) return f * e; return 10 * e; }
const ro = new ResizeObserver(es => es.forEach(e => { if (e.target._w !== e.contentRect.width) dibujar(e.target); }));
function grafico(el, o) { el._o = o; if (!el._obs) { ro.observe(el); el._obs = true; } dibujar(el); }
function valS(s, m) { if (!s.dom.has(m)) return null; const v = s.data[m]; return v == null ? (s.tipo === 'dot' ? null : 0) : v; }
function dibujar(el) {
  const o = el._o; if (!o) return;
  const W = Math.max(300, el.clientWidth || 640); el._w = el.clientWidth;
  const H = o.h || 260, L = o.izq || 58, R = 12, T = 14, B = 26;
  const ms = o.meses, n = ms.length, bw = (W - L - R) / n;
  o.series.forEach(s => { if (!(s.dom instanceof Set)) s.dom = new Set(s.dom); });
  let mx = 0; o.series.forEach(s => ms.forEach(m => { const v = valS(s, m); if (v != null && v > mx) mx = v; }));
  const top = niceMax(mx * 1.05), y = v => T + (H - T - B) * (1 - v / top), x = i => L + bw * (i + 0.5);
  let g = '';
  for (let k = 0; k <= 4; k++) {
    const v = top * k / 4, yy = y(v).toFixed(1);
    g += `<line x1="${L}" x2="${W - R}" y1="${yy}" y2="${yy}" stroke="${k ? 'var(--line)' : 'var(--line-2)'}" stroke-width="1"/>`;
    g += `<text x="${L - 6}" y="${(+yy + 4).toFixed(1)}" text-anchor="end">${esc(o.eje(v))}</text>`;
  }
  const paso = [1, 2, 3, 6, 12].find(s => s * bw >= 42) || 12;
  ms.forEach((m, i) => { if ((+m.slice(5, 7) - 1) % paso === 0) g += `<text x="${x(i).toFixed(1)}" y="${H - 8}" text-anchor="middle">${ml(m)}</text>`; });
  const ci = ms.indexOf(o.corte);
  if (ci >= 0 && ci < n - 1) {
    const xx = (L + bw * (ci + 1)).toFixed(1);
    g += `<line x1="${xx}" x2="${xx}" y1="${T - 6}" y2="${H - B}" stroke="var(--ink-3)" stroke-dasharray="2 3"/>`;
    g += `<text x="${+xx + 5}" y="${T + 2}">pronóstico</text>`;
  }
  o.series.filter(s => s.tipo === 'col').forEach(s => {
    const w = Math.max(2, Math.min(bw * 0.62, 16)), r = Math.min(3, w / 2);
    ms.forEach((m, i) => {
      const v = valS(s, m); if (!v || v <= 0) return;
      const x0 = x(i) - w / 2, y0 = y(v), yb = y(0), rr = Math.min(r, yb - y0);
      g += `<path d="M${x0.toFixed(1)} ${yb.toFixed(1)}V${(y0 + rr).toFixed(1)}Q${x0.toFixed(1)} ${y0.toFixed(1)} ${(x0 + rr).toFixed(1)} ${y0.toFixed(1)}H${(x0 + w - rr).toFixed(1)}Q${(x0 + w).toFixed(1)} ${y0.toFixed(1)} ${(x0 + w).toFixed(1)} ${(y0 + rr).toFixed(1)}V${yb.toFixed(1)}Z" fill="${s.color}"/>`;
    });
  });
  o.series.filter(s => s.tipo === 'line' || s.tipo === 'dash').forEach(s => {
    let d = '', prev = false;
    ms.forEach((m, i) => { const v = valS(s, m); if (v == null) { prev = false; return; } d += (prev ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1); prev = true; });
    g += `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"${s.tipo === 'dash' ? ' stroke-dasharray="6 4"' : ''}/>`;
    if (s.marcas) ms.forEach((m, i) => { const v = valS(s, m); if (v != null) g += `<circle cx="${x(i).toFixed(1)}" cy="${y(v).toFixed(1)}" r="3.5" fill="${s.color}" stroke="var(--surface)" stroke-width="2"/>`; });
  });
  o.series.filter(s => s.tipo === 'dot').forEach(s => ms.forEach((m, i) => {
    const v = valS(s, m); if (v == null) return;
    g += `<circle cx="${x(i).toFixed(1)}" cy="${y(v).toFixed(1)}" r="4" fill="var(--surface)" stroke="${s.color}" stroke-width="2"/>`;
  }));
  g += `<line class="cruz" x1="0" x2="0" y1="${T}" y2="${H - B}" stroke="var(--ink-3)" stroke-width="1" visibility="hidden"/>`;
  g += `<rect class="hit" x="${L}" y="${T}" width="${W - L - R}" height="${H - T - B}" fill="transparent"/>`;
  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" height="${H}" role="img" aria-label="${esc(o.titulo || 'Gráfico mensual')}">${g}</svg><div class="tip" hidden></div>`;
  const svg = el.querySelector('svg'), tip = el.querySelector('.tip'), cruz = el.querySelector('.cruz');
  const mover = ev => {
    const r = svg.getBoundingClientRect(), px = (ev.clientX - r.left) * W / r.width;
    const i = Math.max(0, Math.min(n - 1, Math.floor((px - L) / bw))), m = ms[i];
    const filas = o.series.map(s => [s, valS(s, m)]).filter(([s, v]) => v != null && !(s.tipo === 'col' && !v));
    cruz.setAttribute('x1', x(i)); cruz.setAttribute('x2', x(i)); cruz.setAttribute('visibility', 'visible');
    tip.innerHTML = `<b>${mll(m)}</b>` + (filas.length ? filas.map(([s, v]) => `<div><span>${esc(s.nombre)}</span><span>${esc(o.tip(v))}</span></div>`).join('') : '<div><span>Sin datos</span></div>');
    tip.hidden = false;
    const left = x(i) * r.width / W;
    tip.style.left = (left + 190 > r.width ? left - 190 : left + 12) + 'px'; tip.style.top = '6px';
  };
  svg.addEventListener('pointermove', mover); svg.addEventListener('pointerdown', mover);
  svg.addEventListener('pointerleave', () => { tip.hidden = true; cruz.setAttribute('visibility', 'hidden'); });
}
function leyenda(series) {
  return series.map(s => {
    const cls = s.tipo === 'dash' ? 'sw dash' : s.tipo === 'col' ? 'sw col' : s.tipo === 'dot' ? 'sw dot' : 'sw';
    const st = s.tipo === 'col' ? `background:${s.color}` : `border-color:${s.color}`;
    return `<span><i class="${cls}" style="${st}"></i>${esc(s.nombre)}</span>`;
  }).join('');
}
function spark(p) {
  const a = MH.slice(-12).map(m => p.real[m] || 0), b = MK.map(m => p.alg[m] || 0), all = a.concat(b);
  const mx = Math.max(...all, 1), W = 120, H = 32, n = all.length, x = i => 2 + i * (W - 4) / (n - 1), y = v => H - 3 - (H - 6) * v / mx;
  const pa = a.map((v, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1)).join('');
  const idx = [a.length - 1].concat(b.map((_, j) => a.length + j));
  const pb = idx.map((i, k) => (k ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(all[i]).toFixed(1)).join('');
  return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-hidden="true"><line x1="2" x2="${W - 2}" y1="${H - 3}" y2="${H - 3}" stroke="var(--line)"/><path d="${pa}" fill="none" stroke="var(--s-real)" stroke-width="1.6"/><path d="${pb}" fill="none" stroke="var(--s-real)" stroke-width="1.6" stroke-dasharray="3 3"/><circle cx="${x(a.length - 1).toFixed(1)}" cy="${y(a[a.length - 1]).toFixed(1)}" r="2.5" fill="var(--s-real)"/></svg>`;
}

/* ---------- encabezado y filtros ---------- */
function pintarEncabezado() {
  $('#t-kam').textContent = D.kam;
  $('#t-ciclo').textContent = `Ciclo ${mll(D.ciclo)} · ventas reales hasta ${mll(D.corte)} · captura ${ml(MK[0])} a ${ml(MK[MK.length - 1])}`;
  const n = c => P.filter(p => c === 'TODOS' || p.clase === c).length;
  $('#f-dist').innerHTML = ['TODOS'].concat(D.clases).map(c =>
    `<button type="button" data-d="${c}" aria-pressed="${S.dist === c}">${c === 'TODOS' ? 'Todos' : esc(c)}<span class="c">${n(c)}</span></button>`).join('');
  const cats = [...new Set(P.map(p => p.cat).filter(Boolean))].sort();
  $('#f-cat').innerHTML = '<option value="">Todas las categorías</option>' + cats.map(c => `<option>${esc(c)}</option>`).join('');
  const ch = [['todos', 'Todos'], ['alerta', 'Con alerta'], ['invbajo', 'Inventario bajo'], ['invalto', 'Inventario alto'], ['dif', 'Lejos del algoritmo'], ['cae', 'Venta cayendo']];
  $('#chips').innerHTML = ch.map(([k, t]) => `<button type="button" class="chip" data-chip="${k}" aria-pressed="${S.chip === k}">${t}</button>`).join('');
  const ch2 = [['todos', 'Todos'], ['editados', 'Que cambié'], ['dif', 'Lejos del algoritmo']];
  $('#chips2').innerHTML = ch2.map(([k, t]) => `<button type="button" class="chip" data-chip2="${k}" aria-pressed="${S.chip2 === k}">${t}</button>`).join('');
  document.querySelectorAll('#f-unidad button').forEach(b => b.setAttribute('aria-pressed', b.dataset.u === S.unidad));
}
const enDist = p => S.dist === 'TODOS' || p.clase === S.dist;
const textoP = p => (p.nombre + ' ' + p.grupo + ' ' + p.codigos.map(c => c.cod + ' ' + c.desc).join(' ')).toLowerCase();
function pasaChip(p, k) {
  if (k === 'alerta') return alertas(p).length > 0;
  if (k === 'invbajo') return dias(p) != null && dias(p) < 15;
  if (k === 'invalto') return dias(p) != null && dias(p) > 90;
  if (k === 'dif') { const d = dif(p); return d != null && Math.abs(d) > 0.5; }
  if (k === 'cae') { const t = tend(p); return t != null && t <= -0.1; }
  if (k === 'editados') return p.codigos.some(c => MK.some(m => editado(c, m)));
  return true;
}
const filtrados = () => P.filter(p => enDist(p) && (!S.cat || p.cat === S.cat) && (!S.q || textoP(p).includes(S.q.toLowerCase())) && pasaChip(p, S.chip));

/* ---------- indicadores ---------- */
function pintarKpis() {
  const sel = P.filter(enDist);
  let algV = 0, kamV = 0, d3 = 0, d3ly = 0, inv = 0, d3st = 0, sinPrecio = 0, fechaInv = null;
  sel.forEach(p => {
    algV += pv(p, algPz6(p)); MK.forEach(m => kamV += kamVal(p, m));
    d3 += pv(p, p.d3); d3ly += pv(p, p.d3ly);
    if (p.inv) { inv += pv(p, p.inv.pz); d3st += pv(p, p.d3); fechaInv = fechaInv || p.inv.fecha; }
    if (p.precioPz == null) sinPrecio++;
  });
  const df = algV > 0 ? kamV / algV - 1 : null, t = d3ly > 0 ? d3 / d3ly - 1 : null;
  const doh = d3st > 0 ? inv / (d3st / 91.2) : null;
  const tri = MH.slice(-3), triLy = tri.map(m => (+m.slice(0, 4) - 1) + m.slice(4));
  const tSel = tipoSel(), sinInv = !sel.some(p => p.inv);
  const porQue = tSel === 'sell in directo' ? 'Es venta directa de Brinova' : tSel === 'sell out' ? 'Las cadenas no envían inventario a BI' : 'No hay reporte de inventario de este cliente';
  const fechas = [...new Set(sel.filter(p => p.inv).map(p => p.clase))].map(c => D.distribuidores[c].invFecha).filter(Boolean);
  $('#kpis').innerHTML = `
  <div class="kpi"><span class="lbl">Algoritmo · ${ml(MK[0])} a ${ml(MK[MK.length - 1])}</span><span class="big">${fC(algV)}</span>
    <span class="sub">Promedio de venta de 3, 6 y 12 meses, ajustado por temporada</span></div>
  <div class="kpi"><span class="lbl">Tu forecast · mismo periodo</span><span class="big">${fC(kamV)}</span>
    <span class="row">${pillDif(df)}<span class="sub">frente al algoritmo</span></span></div>
  <div class="kpi"><span class="lbl">Venta últimos 3 meses</span><span class="big">${fC(d3)}</span>
    <span class="row">${pillTend(t)}<span class="sub">${ml(tri[0])}–${ml(tri[2])} vs ${ml(triLy[0])}–${ml(triLy[2])}</span></span></div>
  <div class="kpi"><span class="lbl">Inventario en el distribuidor</span>
    ${sinInv ? `<span class="big">No aplica</span><span class="sub">${porQue}</span>` :
      `<span class="big">${doh == null ? '—' : fN(doh) + ' días'}</span><span class="sub">${fC(inv)} a precio de lista · corte ${fechas.length ? [...new Set(fechas)].map(f => f.slice(8, 10) + '/' + f.slice(5, 7)).join(', ') : '—'}</span>`}</div>`;
  const nAl = sel.filter(p => alertas(p).length).length;
  $('#nota-mix').textContent = `${sel.length} productos en el mix (de ${D.portafolio} del portafolio) · ${nAl} con alguna alerta${sinPrecio ? ' · ' + sinPrecio + ' sin precio de lista' : ''}`;
}

/* ---------- tendencia total ---------- */
function pintarTotal() {
  const sel = P.filter(enDist);
  const agg = (fn, ms) => { const o = {}; ms.forEach(m => { o[m] = sel.reduce((a, p) => a + fn(p, m), 0); }); return o; };
  const desde = S.desde, todos = MH.concat(MF.filter(m => !MH.includes(m))).filter(m => m >= desde);
  const pas = MH.filter(m => m >= '2025-01');
  const series = [];
  if (tipoSel() !== 'sell in directo') series.push({ nombre: 'Facturado por Brinova', tipo: 'col', color: 'var(--s-sin)', dom: MH, data: agg((p, m) => pv(p, p.sellIn[m]), MH) });
  series.push({ nombre: nomVenta(tipoSel()), tipo: 'line', color: 'var(--s-real)', dom: MH, data: agg((p, m) => pv(p, p.real[m]), MH) });
  const kp = agg((p, m) => pv(p, p.kamPasadoPz[m]), pas); Object.keys(kp).forEach(k => { if (!kp[k]) delete kp[k]; });
  series.push({ nombre: 'Tu forecast de cada mes', tipo: 'dot', color: 'var(--s-kam)', dom: pas, data: kp });
  series.push({ nombre: 'Algoritmo', tipo: 'dash', color: 'var(--s-alg)', dom: MF, data: agg((p, m) => pv(p, p.alg[m]), MF) });
  series.push({ nombre: 'Tu forecast actual', tipo: 'line', marcas: true, color: 'var(--s-kam)', dom: MK, data: agg((p, m) => kamVal(p, m), MK) });
  grafico($('#ch-total'), { meses: todos, series, corte: D.corte, eje: v => '₡' + fCx(v), tip: fC, titulo: 'Tendencia del mix en colones' });
  $('#lg-total').innerHTML = leyenda(series) + `<span><button type="button" class="chip" id="b-desde" aria-pressed="${S.desde === '2024-01'}">Ver desde 2024</button></span>`;
}

/* ---------- lista ---------- */
function pintarLista() {
  const ord = {
    valor: (a, b) => pv(b, algPz6(b)) - pv(a, algPz6(a)),
    tend: (a, b) => (tend(a) ?? 9) - (tend(b) ?? 9),
    dias: (a, b) => (dias(b) ?? -1) - (dias(a) ?? -1),
    dif: (a, b) => Math.abs(dif(b) ?? 0) - Math.abs(dif(a) ?? 0),
  }[S.orden];
  const L = filtrados().sort(ord);
  const head = `<div class="lhead"><span>Producto</span><span>12 meses + pronóstico</span><span class="r">Venta 3M</span><span class="r">Inventario</span><span class="r">Algoritmo ${ml(MK[0])}–${ml(MK[5])}</span><span class="r">Tu forecast</span><span class="r">Precio lista</span></div>`;
  if (!L.length) { $('#lista').innerHTML = head + '<div class="vacio">Ningún producto cumple el filtro. Prueba con “Todos”.</div>'; return; }
  $('#lista').innerHTML = head + L.map(p => {
    const f = fac(p), a = alertas(p), pr = precioU(p, p.princ);
    return `<button type="button" class="item" data-p="${esc(p.id)}">
      <span class="c-nm" style="min-width:0"><span class="nm">${esc(p.nombre)}</span>
        <span class="meta">${S.dist === 'TODOS' ? esc(p.clase) + ' · ' : ''}${esc(p.principal)} · ${esc(uNom(p))}</span>
        ${a.length ? `<span class="row" style="display:flex;gap:4px;flex-wrap:wrap;margin-top:4px">${a.slice(0, 2).map(([c, t]) => pill(c, t)).join('')}</span>` : ''}</span>
      <span>${spark(p)}</span>
      <span class="r">${pillTend(tend(p))}</span>
      <span class="r">${p.inv ? pillDias(dias(p)) + `<span class="meta" style="display:block">${fN(p.inv.pz / f)} u</span>` : '<span class="meta">venta directa</span>'}</span>
      <span class="r v">${fN(algPz6(p) / f)}<small>${fC(pv(p, algPz6(p)))}</small></span>
      <span class="r v">${fN(kamPz6(p) / f)}<small>${pillDif(dif(p))}</small></span>
      <span class="r v">${pr != null ? '₡' + nf.format(pr) : '<span class="pill bad">sin precio</span>'}</span>
    </button>`;
  }).join('');
}

/* ---------- captura (formato formulario) ---------- */
let filasGrid = [];
function pintarGrid() {
  const q = S.q2.toLowerCase();
  const L = P.filter(p => enDist(p) && p.cap.length && (!q || textoP(p).includes(q)) && pasaChip(p, S.chip2))
    .sort((a, b) => a.clase.localeCompare(b.clase) || pv(b, algPz6(b)) - pv(a, algPz6(a)));
  filasGrid = [];
  let h = `<thead><tr><th class="l">Producto / código</th><th class="l">Presentación</th><th>Precio lista</th>${MK.map(m => `<th>${ml(m)}</th>`).join('')}<th>Total</th><th>Valor</th></tr></thead><tbody>`;
  L.forEach(p => {
    const algU = p.princ.pzPorU ? sum(p.alg, MK) / p.princ.pzPorU : null;
    h += `<tr class="grp" data-p="${esc(p.id)}"><td colspan="${5 + MK.length}">${esc(p.nombre)}<small>${esc(p.clase)} · algoritmo ${fN(algU)} ${esc(p.princ.pres.toLowerCase() === 'caja' ? 'cajas' : 'u')} de ${esc(p.principal)} en 6 meses · ${pillDif(dif(p))}</small></td></tr>`;
    p.cap.forEach(c => {
      filasGrid.push(c.id);
      const pr = precioU(p, c);
      h += `<tr><td class="l"><b>${esc(c.cod)}</b><span class="hint">${esc(c.desc)}</span></td><td class="l">${esc(c.pres)}${c.pzPorU > 1 ? ' ×' + fN(c.pzPorU) : ''}</td><td>${pr != null ? '₡' + nf.format(pr) : '—'}</td>`;
      MK.forEach(m => {
        const al = c.cod === p.principal && c.pzPorU ? Math.round((p.alg[m] || 0) / c.pzPorU) : null;
        h += `<td><input class="inp${editado(c, m) ? ' ed' : ''}" id="i-${c.id}-${m}" data-line="${c.id}" data-mes="${m}" inputmode="numeric" value="${kamU(c, m)}" aria-label="${esc(c.cod)} ${ml(m)}">${al != null ? `<span class="hint">alg. ${fN(al)}</span>` : ''}</td>`;
      });
      h += `<td class="num" id="t-${c.id}"></td><td class="num" id="v-${c.id}"></td></tr>`;
    });
  });
  if (!L.length) h += `<tr><td class="l" colspan="${5 + MK.length}">Ningún producto cumple el filtro.</td></tr>`;
  h += `</tbody><tfoot><tr><td class="l" colspan="3">Total en colones (lista)</td>${MK.map(m => `<td id="f-${m}"></td>`).join('')}<td></td><td id="f-tot"></td></tr></tfoot>`;
  $('#grid').innerHTML = h;
  filasGrid.forEach(totFila); pieGrid();
}
function totFila(id) {
  const { p, c } = LINES[id], t = $('#t-' + CSS.escape(id)), v = $('#v-' + CSS.escape(id));
  if (!t) return;
  const u = MK.reduce((a, m) => a + kamU(c, m), 0), pr = precioU(p, c);
  t.textContent = fN(u); v.textContent = pr != null ? fC(u * pr) : '—';
}
function pieGrid() {
  let tot = 0;
  MK.forEach(m => {
    const s = filasGrid.reduce((a, id) => { const { p, c } = LINES[id], pr = precioU(p, c); return a + (pr ? kamU(c, m) * pr : 0); }, 0);
    tot += s; const el = $('#f-' + m); if (el) el.textContent = fC(s);
  });
  const ft = $('#f-tot'); if (ft) ft.textContent = fC(tot);
}

/* ---------- cómo se calcula: textos según las fuentes del KAM ---------- */
const lista = xs => xs.length <= 1 ? xs.join('') : xs.slice(0, -1).join(', ') + ' y ' + xs[xs.length - 1];
function textoFuentes() {
  const de = t => D.clases.filter(c => tipoDe(c) === t);
  const st = de('sell through'), so = de('sell out'), dir = de('sell in directo');
  const out = [];
  if (st.length) out.push(`<p><b>Venta del distribuidor</b>: el reporte mensual de ventas de ${esc(lista(st.map(c => { const f = D.distribuidores[c].fuente || []; return f.length && f[0] !== c ? f.join('/') + ' (' + c + ')' : c; })))} a sus clientes (sell through), convertido a productos Brinova.</p>`);
  if (so.length) out.push(`<p><b>Venta al consumidor</b>: lo que venden las tiendas de ${esc(lista(so))} según sus escáneres (sell out), convertido a productos Brinova. En Walmart solo cuentan las tiendas de Costa Rica.</p>`);
  if (dir.length) out.push(`<p>En <b>${esc(lista(dir))}</b> la venta es la facturación directa de Brinova.</p>`);
  if (D.clases.includes('PANAMA')) out.push('<p>En <b>PANAMA</b> se suma lo que Brinova le vende directo a Supermercados Xtra (marca LIKE).</p>');
  return out.join('');
}
function textoInventario() {
  const st = D.clases.filter(c => tipoDe(c) === 'sell through');
  if (!st.length) return '<p><b>Inventario</b>: las cadenas no envían inventario a BI, así que aquí no hay días de inventario.</p>';
  const mens = st.filter(c => D.distribuidores[c].invCortes >= 6), poc = st.filter(c => D.distribuidores[c].invCortes > 0 && D.distribuidores[c].invCortes < 6), nada = st.filter(c => !D.distribuidores[c].invCortes);
  return `<p><b>Inventario</b>: el último reporte de inventario de cada distribuidor.${mens.length ? ' ' + esc(lista(mens)) + (mens.length > 1 ? ' mandan' : ' manda') + ' uno casi cada mes.' : ''}${poc.length ? ' De ' + esc(lista(poc)) + ' hay pocos cortes.' : ''}${nada.length ? ' De ' + esc(lista(nada)) + ' no hay inventario.' : ''}</p>`;
}
/* ---------- cómo se calcula ---------- */
function pintarMetodo() {
  const ej = P.filter(p => tipoDe(p.clase) !== 'sell in directo' && p.princ.calc).sort((a, b) => pv(b, algPz6(b)) - pv(a, algPz6(a)))[0];
  const c = ej && ej.princ.calc, f = ej ? ej.uPz || 1 : 1, m0 = MK[0];
  const base = c ? (c.l3 + c.l6 + c.l12) / 3 : 0;
  $('#v-metodo').innerHTML = `<div class="metodo">
  <section class="panel prosa"><h3>1. De dónde salen los datos</h3>
    ${textoFuentes()}
    <p><b>Facturado por Brinova</b>: lo que Brinova le vendió al cliente (sell in). En un año, la venta del cliente y lo facturado deben parecerse; cuando no, el producto sale marcado como <i>dato a revisar</i>.</p>
    ${textoInventario()}
    <p>Datos reales hasta <b>${mll(D.corte)}</b>. Generado el ${esc(D.generado)}.</p></section>
  <section class="panel prosa"><h3>2. Cómo calcula el algoritmo</h3>
    <p>Para cada producto y distribuidor toma la venta promedio de los últimos 3, 6 y 12 meses (contando solo los meses en que hubo venta) y los promedia. Eso es la <b>base mensual</b>.</p>
    <p>Después la ajusta por <b>temporada</b>: un índice por mes sale de 2024 y 2025. 1,00 es un mes normal; 1,20 es un mes 20% más fuerte. Se limita entre 0,4 y 2,0.</p>
    <div class="formula">forecast del mes = (prom. 3M + prom. 6M + prom. 12M) ÷ 3 × índice del mes</div>
    ${c ? `<p>Ejemplo, <b>${esc(ej.nombre)}</b> en ${esc(ej.clase)} (${esc(uNom(ej))}): (${fN(c.l3 / f)} + ${fN(c.l6 / f)} + ${fN(c.l12 / f)}) ÷ 3 = ${fN(base / f)}; × ${nf2.format(c.idx[m0] || 1)} en ${ml(m0)} = <b>${fN((c.fc[m0] || 0) / f)}</b>.</p>` : ''}
    <p>Si un producto vendió en <b>4 meses o menos</b> del último año (un cliente que compra pocas veces), se promedia sobre todos los meses y sin índice de temporada: así no se multiplica una compra grande.</p>
    <p>Si un producto lleva <b>6 meses o más sin venta</b>, el algoritmo lo deja en 0.</p></section>
  <section class="panel prosa"><h3>3. Qué tan bien funciona</h3>
    <p>Se probó pronosticando mayo a octubre de 2026 con datos solo hasta abril, con todos los KAM. Error típico: <b>${D.bt.pc}%</b> por producto y cliente, <b>${D.bt.cliente}%</b> por cliente y <b>${D.bt.kam}%</b> por KAM; en total pronosticó ${D.bt.sesgo}% de más. El modelo que se usaba antes fallaba ${D.bt.antes}% por producto.</p>
    <p>Por producto el algoritmo sirve como punto de partida. Tu conocimiento del cliente (promociones, listados nuevos, quiebres) es lo que lo corrige.</p></section>
  <section class="panel prosa"><h3>4. En qué afecta tu número</h3>
    <p>Tu forecast es el que usa Brinova para <b>planear producción y compras</b> y para la <b>meta de facturación</b>. El valor en colones es unidades × precio de lista de ese distribuidor.</p>
    <p>Si pones mucho más que el algoritmo, se produce de más y el producto se queda en bodega. Si pones mucho menos, puede faltar producto. Cuando te separes mucho (más de 50%), deja un comentario con el motivo.</p>
    <p><b>Días de inventario</b> = inventario del distribuidor ÷ su venta diaria promedio de los últimos 3 meses. Menos de 15 días: riesgo de quiebre. Más de 90: tiene de más y comprará menos.</p></section>
  <section class="panel prosa"><h3>5. Unidades</h3>
    <p>Un mismo producto puede tener dos códigos: la <b>unidad</b> y la <b>caja</b>. Brinova a veces factura uno y el distribuidor reporta el otro, así que aquí se juntan por producto. Cada producto se muestra en la presentación que más usas (la de tu formulario). Con el botón <b>Piezas</b> arriba ves todo en piezas.</p></section>
  <section class="panel prosa"><h3>6. Lo que todavía no considera</h3>
    <p>Promociones y lanzamientos (los pones tú), órdenes de compra en tránsito, e historia completa de inventario de los distribuidores que no lo mandan cada mes. Se irán agregando.</p>
    ${D.formFuera && D.formFuera.length ? `<p>Tu formulario también tiene ${D.formFuera.map(esc).join(', ')}, que todavía no tiene fuente de venta para el algoritmo; no aparece aquí.</p>` : ''}</section>
  </div>`;
}

/* ---------- panel de producto ---------- */
function abrir(id) {
  const p = P.find(x => x.id === id); if (!p) return;
  S.abierto = id; pintarDetalle(p);
  $('#velo').hidden = false; $('#det').hidden = false; $('#det').scrollTop = 0;
  const b = $('#det .cerrar'); if (b) b.focus();
}
function cerrar() { S.abierto = null; $('#velo').hidden = true; $('#det').hidden = true; }
function seriesProducto(p) {
  const f = fac(p), div = o => { const r = {}; Object.keys(o).forEach(k => { r[k] = o[k] / f; }); return r; };
  const pas = MH.filter(m => m >= '2025-01');
  const s = [];
  if (tipoDe(p.clase) !== 'sell in directo') s.push({ nombre: 'Facturado por Brinova', tipo: 'col', color: 'var(--s-sin)', dom: MH, data: div(p.sellIn) });
  s.push({ nombre: nomVenta(tipoDe(p.clase)), tipo: 'line', color: 'var(--s-real)', dom: MH, data: div(p.real) });
  s.push({ nombre: 'Tu forecast de cada mes', tipo: 'dot', color: 'var(--s-kam)', dom: pas, data: div(p.kamPasadoPz) });
  s.push({ nombre: 'Algoritmo', tipo: 'dash', color: 'var(--s-alg)', dom: MF, data: div(p.alg) });
  const k = {}; MK.forEach(m => { k[m] = kamPz(p, m) / f; });
  s.push({ nombre: 'Tu forecast actual', tipo: 'line', marcas: true, color: 'var(--s-kam)', dom: MK, data: k });
  return s;
}
function graficoProducto(p) {
  const el = $('#ch-prod'); if (!el) return;
  const series = seriesProducto(p), todos = MH.concat(MF.filter(m => !MH.includes(m))).filter(m => m >= S.desde);
  grafico(el, { meses: todos, series, corte: D.corte, eje: fCx, tip: v => fN(v) + ' ' + uNom(p), titulo: 'Mes a mes de ' + p.nombre, izq: 50 });
  $('#lg-prod').innerHTML = leyenda(series);
}
function bloqueCalculo(p, c) {
  const f = fac(p), k = c.calc, base = (k.l3 + k.l6 + k.l12) / 3;
  let h = `<div class="cod"><div class="cod-h"><b>${esc(c.cod)}</b><span class="meta">${esc(c.desc)}</span></div>`;
  if (k.estado !== 'ACTIVO') h += `<div class="aviso">Lleva ${fN(k.sinVenta)} meses sin venta (última: ${k.ultimo ? mll(k.ultimo) : 'sin registro'}). El algoritmo lo deja en 0 hasta que vuelva a venderse.</div>`;
  h += `<dl class="calc">
    <dt>Promedio últimos 3 meses (${k.mv3} de 3 con venta)</dt><dd>${fN(k.l3 / f)}</dd>
    <dt>Promedio últimos 6 meses (${k.mv6} de 6 con venta)</dt><dd>${fN(k.l6 / f)}</dd>
    <dt>Promedio últimos 12 meses (${k.mv12} de 12 con venta)</dt><dd>${fN(k.l12 / f)}</dd>
    <dt class="tot">Base mensual = promedio de los tres</dt><dd class="tot">${fN(base / f)}</dd></dl>
    <div class="gridwrap" style="margin-top:8px"><table class="cap" style="min-width:0"><thead><tr><th class="l">Mes</th>${MK.map(m => `<th>${ml(m)}</th>`).join('')}</tr></thead><tbody>
    <tr><td class="l">Índice de temporada</td>${MK.map(m => `<td>${nf2.format(k.idx[m] || 1)}</td>`).join('')}</tr>
    <tr><td class="l">Base × índice</td>${MK.map(m => `<td>${fN((k.prom[m] || 0) / f)}</td>`).join('')}</tr>
    <tr><td class="l"><b>Algoritmo</b></td>${MK.map(m => `<td><b>${fN((k.fc[m] || 0) / f)}</b></td>`).join('')}</tr></tbody></table></div></div>`;
  return h;
}
function bloqueCaptura(p, c) {
  const pr = precioU(p, c), desc = c.precio && c.precioFact ? 1 - c.precioFact / c.precio : null;
  let h = `<div class="cod"><div class="cod-h"><b>${esc(c.cod)}</b><span>${esc(c.pres)}${c.pzPorU > 1 ? ' de ' + fN(c.pzPorU) + ' pz' : ''}</span>
    <span class="pill kam">lista ${pr != null ? '₡' + nf.format(pr) : 'sin precio'}</span>
    ${c.precioFact ? `<span class="pill kam">facturado ${'₡' + nf.format(c.precioFact)}${desc != null ? ' · ' + nf.format(desc * 100) + '% desc.' : ''}</span>` : ''}</div>
    <div class="meses">`;
  MK.forEach(m => {
    const al = c.cod === p.principal && c.pzPorU ? Math.round((p.alg[m] || 0) / c.pzPorU) : null;
    h += `<label class="mes">${ml(m)}<input class="inp${editado(c, m) ? ' ed' : ''}" id="d-${c.id}-${m}" data-line="${c.id}" data-mes="${m}" inputmode="numeric" value="${kamU(c, m)}">${al != null ? `<span class="hint">alg. ${fN(al)}</span>` : ''}</label>`;
  });
  h += `</div><div style="display:flex;gap:8px;flex-wrap:wrap">
    ${c.cod === p.principal && c.pzPorU ? `<button type="button" class="btn" data-usar-alg="${c.id}">Usar el algoritmo</button>` : ''}
    <button type="button" class="btn" data-volver="${c.id}">Volver a mi formulario</button></div></div>`;
  return h;
}
function textoCierre(p) {
  const t = tipoDe(p.clase);
  if (t === 'sell in directo') return `La venta de ${p.clase} es la facturación directa de Brinova, así que siempre cuadra.`;
  const r = `En 12 meses ${t === 'sell out' ? 'las tiendas vendieron al consumidor' : 'el distribuidor vendió'} ${fN(p.d12)} piezas y Brinova le facturó ${fN(p.s12)}.`;
  if (p.cierre === 'OK') return r + ' Cuadra: la tendencia es confiable.';
  if (p.cierre === 'COMPRA SIN VENDER') return r + ' El distribuidor compra pero no reporta venta de este producto: puede estar con otro código en su reporte. Avisa a BI si lo vende.';
  if (p.cierre === 'VENDE SIN COMPRAR') return r + ' Reporta venta sin compras en el año: inventario viejo o código cruzado. Tómalo con cuidado.';
  return r + ' No cuadra: puede ser un problema de unidad en el reporte del distribuidor. BI lo está revisando; usa tu criterio.';
}
function pintarDetalle(p) {
  const f = fac(p), t = tend(p), a = alertas(p), pr = precioU(p, p.princ);
  const kv = MK.reduce((s, m) => s + kamVal(p, m), 0), av = pv(p, algPz6(p));
  const notaId = p.princ.id, nota = (local[notaId] && local[notaId].nota != null) ? local[notaId].nota : ((remote[notaId] && remote[notaId].nota) || '');
  const calcs = p.codigos.filter(c => c.calc);
  const inv = p.inv;
  $('#det').innerHTML = `
  <div class="det-h"><div style="min-width:0"><h2>${esc(p.nombre)}</h2>
    <div class="meta">${esc(p.clase)} · ${esc(p.cat)} · se muestra en ${esc(uNom(p))} (${esc(p.principal)})</div>
    ${a.length ? `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px">${a.map(([c, x]) => pill(c, x)).join('')}</div>` : ''}</div>
    <button type="button" class="cerrar" aria-label="Cerrar">Cerrar</button></div>
  <div class="mini">
    <div class="kpi"><span class="lbl">Venta 3 meses</span><span class="big">${fN(p.d3 / f)}</span><span class="row">${pillTend(t)}<span class="sub">vs año anterior</span></span></div>
    <div class="kpi"><span class="lbl">Inventario</span><span class="big">${inv ? fN(inv.pz / f) : '—'}</span><span class="row">${inv ? pillDias(inv.doh) : `<span class="sub">${tipoDe(p.clase) === 'sell in directo' ? 'venta directa' : 'sin reporte'}</span>`}</span></div>
    <div class="kpi"><span class="lbl">Algoritmo ${ml(MK[0])}–${ml(MK[5])}</span><span class="big">${fN(algPz6(p) / f)}</span><span class="sub">${fC(av)}</span></div>
    <div class="kpi"><span class="lbl">Tu forecast</span><span class="big" id="det-kam">${fN(kamPz6(p) / f)}</span><span class="row" id="det-kam2">${pillDif(dif(p))}<span class="sub">${fC(kv)}</span></span></div>
  </div>
  <section class="panel"><div class="panel-h"><h2>Mes a mes</h2><span class="nota">${esc(uNom(p))}</span></div>
    <div class="chart" id="ch-prod"></div><div class="legend" id="lg-prod"></div></section>
  <section class="panel"><div class="panel-h"><h2>Tu forecast</h2><span class="nota">En la unidad de tu formulario. Se guarda solo.</span></div>
    ${p.cap.map(c => bloqueCaptura(p, c)).join('') || '<p class="prosa">Este producto no tiene un código para capturar en este distribuidor.</p>'}
    <label class="mes" style="margin-top:10px">Comentario (por qué te separas del algoritmo, promociones, quiebres)<textarea id="nota-${esc(notaId)}" data-nota="${esc(notaId)}">${esc(nota)}</textarea></label>
    <p class="prosa" style="margin-top:8px" id="det-afecta">${afecta(p)}</p></section>
  <div class="dos">
    <section class="panel"><div class="panel-h"><h2>Inventario y días</h2></div>${inv ? `
      <p class="prosa">Al ${inv.fecha ? inv.fecha.slice(8, 10) + '/' + inv.fecha.slice(5, 7) + '/' + inv.fecha.slice(0, 4) : '—'} el distribuidor tenía <b>${fN(inv.pz / f)} ${esc(uNom(p))}</b>. Vende en promedio ${fN(p.d3 / 3 / f)} al mes, así que le alcanza para <b>${inv.doh != null ? fN(inv.doh) + ' días' : '— (sin venta reciente)'}</b>.${inv.dohFuente != null ? ' Su propio reporte dice ' + fN(inv.dohFuente) + ' días.' : ''}</p>
      <div class="chart" id="ch-inv"></div>
      <p class="sub" style="color:var(--ink-3);font-size:12px">${Object.keys(inv.hist).length < 3 ? 'Este distribuidor solo ha mandado ' + Object.keys(inv.hist).length + ' cortes de inventario.' : 'Un corte de inventario por mes.'}</p>`
      : `<p class="prosa">${tipoDe(p.clase) === 'sell in directo' ? esc(p.clase) + ' es venta directa de Brinova: no hay inventario de distribuidor.' : tipoDe(p.clase) === 'sell out' ? 'La cadena no envía inventario a BI.' : 'Este distribuidor no ha enviado inventario de este producto.'}</p>`}</section>
    <section class="panel"><div class="panel-h"><h2>Precio y calidad del dato</h2></div>
      <p class="prosa">Precio de lista ${esc(p.clase)}: <b>${pr != null ? '₡' + nf2.format(pr) : 'sin precio'}</b> por ${esc(p.princ.pres.toLowerCase())}${p.princ.precioFact ? `; facturado en promedio (6 meses) ₡${nf2.format(p.princ.precioFact)}` : ''}.</p>
      <p class="prosa">${textoCierre(p)}</p></section>
  </div>
  <section class="panel"><div class="panel-h"><h2>De dónde sale el número del algoritmo</h2><span class="nota">${esc(uNom(p))}</span></div>
    ${calcs.length ? calcs.map(c => bloqueCalculo(p, c)).join('') : '<p class="prosa">Sin venta en el historial: el algoritmo no tiene base para este producto.</p>'}</section>`;
  graficoProducto(p);
  if (inv) {
    const h = {}; Object.keys(inv.hist).forEach(k => { h[k] = inv.hist[k] / f; });
    const ms = MH.filter(m => m >= '2025-10');
    grafico($('#ch-inv'), { meses: ms, series: [{ nombre: 'Inventario', tipo: 'col', color: 'var(--s-inv)', dom: ms, data: h }], eje: fCx, tip: v => fN(v) + ' ' + uNom(p), h: 150, izq: 46, titulo: 'Inventario por corte' });
  }
}
function afecta(p) {
  const kv = MK.reduce((s, m) => s + kamVal(p, m), 0), av = pv(p, algPz6(p));
  if (!av && !kv) return 'Sin forecast en estos meses.';
  return `Tu número vale <b>${fC(kv)}</b> a precio de lista en ${ml(MK[0])}–${ml(MK[5])}; el algoritmo, <b>${fC(av)}</b>. Es lo que Brinova planea producir y facturar para este distribuidor.`;
}

/* ---------- guardar ---------- */
const timers = {}, cadena = {};
let pendientes = 0;
function estado(t, cls) { $('#estado').innerHTML = `<span class="dot ${cls || ''}"></span><span>${esc(t)}</span>`; }
function guardarLocal() { try { localStorage.setItem(LS, JSON.stringify({ unidad: S.unidad, local: db ? {} : local })); } catch (e) { } }
function setKam(id, m, v) {
  local[id] = local[id] || { meses: {} }; local[id].meses = local[id].meses || {}; local[id].meses[m] = v;
  guardarLocal(); programar(id);
}
function programar(id) { clearTimeout(timers[id]); estado('Guardando…', 'pend'); timers[id] = setTimeout(() => guardar(id), 700); }
function guardar(id) {
  const { p, c } = LINES[id], r = remote[id] || {}, l = local[id] || {};
  const body = { clase: p.clase, cod: c.cod, producto: p.grupo, meses: Object.assign({}, r.meses || {}, l.meses || {}),
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
let tRef = null;
function refrescarResumen() {
  clearTimeout(tRef);
  tRef = setTimeout(() => {
    pintarKpis(); pintarTotal(); pintarLista(); filasGrid.forEach(totFila); pieGrid();
    if (S.abierto) {
      const p = P.find(x => x.id === S.abierto);
      graficoProducto(p);
      $('#det-kam').textContent = fN(kamPz6(p) / fac(p));
      $('#det-kam2').innerHTML = pillDif(dif(p)) + `<span class="sub">${fC(MK.reduce((s, m) => s + kamVal(p, m), 0))}</span>`;
      $('#det-afecta').innerHTML = afecta(p);
    }
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
}

/* ---------- eventos ---------- */
function vista(v) {
  S.vista = v;
  document.querySelectorAll('#f-vista button').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === v));
  $('#v-tendencia').hidden = v !== 'tendencia'; $('#v-capturar').hidden = v !== 'capturar'; $('#v-metodo').hidden = v !== 'metodo';
  if (v === 'capturar') pintarGrid();
  if (v === 'tendencia') { pintarKpis(); pintarTotal(); pintarLista(); }
}
function toast(t) { const el = $('#toast'); el.textContent = t; el.hidden = false; clearTimeout(el._t); el._t = setTimeout(() => { el.hidden = true; }, 2600); }
document.addEventListener('click', ev => {
  const t = ev.target.closest('button,tr.grp'); if (!t) return;
  if (t.dataset.d) { S.dist = t.dataset.d; pintarEncabezado(); vista(S.vista); return; }
  if (t.dataset.v) { vista(t.dataset.v); return; }
  if (t.dataset.u) { S.unidad = t.dataset.u; guardarLocal(); pintarEncabezado(); vista(S.vista); if (S.abierto) pintarDetalle(P.find(x => x.id === S.abierto)); return; }
  if (t.dataset.chip) { S.chip = t.dataset.chip; pintarEncabezado(); pintarLista(); return; }
  if (t.dataset.chip2) { S.chip2 = t.dataset.chip2; pintarEncabezado(); pintarGrid(); return; }
  if (t.id === 'b-desde') { S.desde = S.desde === '2024-01' ? '2025-01' : '2024-01'; pintarTotal(); if (S.abierto) graficoProducto(P.find(x => x.id === S.abierto)); return; }
  if (t.dataset.p) { abrir(t.dataset.p); return; }
  if (t.classList.contains('cerrar')) { cerrar(); return; }
  if (t.dataset.usarAlg || t.dataset.volver) {
    const id = t.dataset.usarAlg || t.dataset.volver, { p, c } = LINES[id];
    MK.forEach(m => { setKam(id, m, t.dataset.usarAlg ? Math.round((p.alg[m] || 0) / c.pzPorU) : (c.kam[m] || 0)); });
    sincronizarInputs(); refrescarResumen(); toast(t.dataset.usarAlg ? 'Se copió el algoritmo' : 'Volvió a tu formulario'); return;
  }
  if (t.id === 'b-listo') {
    if (!db) { toast('Para marcarlo como listo hay que abrir el enlace con sesión iniciada'); return; }
    const tot = P.reduce((a, p) => a + MK.reduce((s, m) => s + kamVal(p, m), 0), 0);
    t.disabled = true;
    db.doc(`ciclos/${CID}`).set({ estado: 'listo', por: uid || '', en: new Date().toISOString(), valorLista: Math.round(tot) })
      .then(() => toast('Forecast marcado como listo'), () => toast('No se pudo marcar; revisa tu permiso o la conexión'))
      .finally(() => { t.disabled = false; });
  }
});
$('#velo').addEventListener('click', cerrar);
document.addEventListener('keydown', ev => { if (ev.key === 'Escape' && S.abierto) cerrar(); });
document.addEventListener('input', ev => {
  const el = ev.target;
  if (el.id === 'q') { S.q = el.value; pintarLista(); return; }
  if (el.id === 'q2') { S.q2 = el.value; pintarGrid(); return; }
  if (el.dataset.nota) { const id = el.dataset.nota; local[id] = local[id] || { meses: {} }; local[id].nota = el.value; guardarLocal(); programar(id); return; }
  if (el.classList.contains('inp')) {
    const raw = el.value.replace(/[^\d]/g, ''), v = raw === '' ? 0 : parseInt(raw, 10);
    const id = el.dataset.line, m = el.dataset.mes;
    setKam(id, m, v);
    const otro = document.getElementById((el.id.startsWith('i-') ? 'd-' : 'i-') + id + '-' + m); if (otro) otro.value = v;
    el.classList.toggle('ed', editado(LINES[id].c, m));
    totFila(id); pieGrid(); refrescarResumen();
  }
});
document.addEventListener('change', ev => {
  if (ev.target.id === 'f-cat') { S.cat = ev.target.value; pintarLista(); }
  if (ev.target.id === 'f-orden') { S.orden = ev.target.value; pintarLista(); }
});

/* ---------- arranque ---------- */
pintarEncabezado(); pintarMetodo(); vista('tendencia');
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
    if (!pendientes) estado(snap.size ? 'Guardado al día' : 'Listo para capturar', 'ok');
    sincronizarInputs(); refrescarResumen();
  }, () => { clearTimeout(t10); estado('No se pudo leer lo guardado', 'err'); });
  db.doc(`ciclos/${CID}`).onSnapshot(d => { envio = d.exists ? d.data() : null; pintarEnvio(); }, () => { });
})();

};
