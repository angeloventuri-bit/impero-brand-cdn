/* IMPERO — Diagnóstico de Marca (experiência) + 3 cenários no modo completo
 * MODE: 'diagnostico' | 'completo' (definido pela página) */

const MODE = window.APP_MODE
  || (new URLSearchParams(location.search).get('m') === 'diag' ? 'diagnostico' : 'completo');
const STORAGE_KEY = 'impero:diag-marca:' + MODE + ':v2';
const SUBMIT_ENDPOINT = (typeof CONFIG !== 'undefined' && CONFIG.sheetsUrl) ? CONFIG.sheetsUrl : '';

/* ============ ESTADO ============ */
const defaultState = () => {
  const diagnostico = {};
  DIAG.forEach(sec => sec.campos.forEach(c => {
    if (c.tipo === 'chips' || c.tipo === 'swatches') diagnostico[c.id] = [];
    else if (c.tipo === 'slider') diagnostico[c.id] = c.def ?? 50;
    else if (c.tipo === 'select') diagnostico[c.id] = c.opts[0];
    else diagnostico[c.id] = '';
  }));
  return {
    cliente: { nome: '', contato: '', email: '', tel: '', momento: (window.APP_TIPO && window.APP_TIPO !== 'completo' && window.APP_TIPO !== 'diagnostico') ? '' : 'nova' },
    diagnostico,
    escopo: { cenario: (typeof SCENARIOS !== 'undefined' ? (SCENARIOS.find(s => s.destaque) || SCENARIOS[1] || SCENARIOS[0]).id : '') },
    obs: '',
  };
};
let state = defaultState();
let submitted = false;

/* ============ HELPERS ============ */
const fmtBR = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const $ = (s) => document.querySelector(s);
const create = (tag, props = {}) => Object.assign(document.createElement(tag), props);
const scnById = (id) => (typeof SCENARIOS !== 'undefined' ? SCENARIOS.find(s => s.id === id) : null);
const esc = (s) => (s == null ? '' : String(s).replace(/[&<>"]/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[m])));

function save() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) {} }
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const p = JSON.parse(raw), d = defaultState();
    state = { ...d, ...p,
      cliente: { ...d.cliente, ...(p.cliente || {}) },
      diagnostico: { ...d.diagnostico, ...(p.diagnostico || {}) },
      escopo: { ...d.escopo, ...(p.escopo || {}) },
    };
  } catch (_) {}
}

/* ============ CENÁRIO ============ */
function computeQuote() {
  const scn = scnById(state.escopo.cenario) || (typeof SCENARIOS !== 'undefined' ? SCENARIOS[0] : null);
  const total = scn ? scn.preco : 0;
  return { scn, total };
}

/* ============ MARKDOWN (enviado pronto pra planilha) ============ */
const MOMENTOS = { nova: 'Marca nova', rebranding: 'Rebranding', expansao: 'Expansão', ajuste: 'Ajuste' };
function buildMarkdown(payload) {
  const c = payload.cliente || {}, d = payload.diagnostico || {}, est = payload.estimativa || {};
  const L = [];
  L.push('# Diagnóstico de Marca — ' + (c.nome || '(sem nome)'), '');
  L.push('> Tipo: ' + (payload.tipo === 'completo' ? 'diagnóstico + cenário' : 'diagnóstico'), '');
  L.push('## Identificação', '');
  L.push('- **Empresa / marca:** ' + (c.nome || '—'));
  L.push('- **Contato:** ' + (c.contato || '—'));
  L.push('- **E-mail:** ' + (c.email || '—'));
  L.push('- **WhatsApp:** ' + (c.tel || '—'));
  if (c.momento) L.push('- **Momento:** ' + (MOMENTOS[c.momento] || c.momento));
  L.push('');
  const rot = (l) => (/[?!.]$/.test(l) ? l : l + ':');
  DIAG.forEach(sec => {
    const linhas = [];
    sec.campos.forEach(campo => {
      const v = d[campo.id];
      if (v == null || v === '' || (Array.isArray(v) && !v.length)) return;
      const l = rot(campo.label);
      if (campo.tipo === 'slider') {
        const [a, b] = AXIS_READS[campo.id] || [campo.esq, campo.dir];
        const pos = Math.round(v / 10);
        const barra = '─'.repeat(pos) + '●' + '─'.repeat(10 - pos);
        linhas.push('- **' + l + '** ' + a + ' `' + barra + '` ' + b + '  _(' + v + '/100)_');
      } else if (Array.isArray(v)) {
        linhas.push('- **' + l + '** ' + v.join(campo.tipo === 'swatches' ? ' · ' : ', '));
      } else if (campo.tipo === 'textarea') {
        linhas.push('- **' + l + '**', '', '  > ' + String(v).replace(/\n/g, '\n  > '), '');
      } else {
        linhas.push('- **' + l + '** ' + v);
      }
    });
    if (linhas.length) L.push('## ' + sec.nome, '', ...linhas, '');
  });
  if (payload.tipo === 'completo' && est.cenario) {
    L.push('## Cenário escolhido', '');
    L.push('- **Plano:** ' + est.cenario + ' — ' + fmtBR.format(est.total || 0));
    L.push('- **Prazo:** ' + (est.prazo || '—'), '');
    (est.entregaveis || []).forEach(e => L.push('  - ' + e));
    L.push('');
  }
  if (payload.obs) L.push('## Observações', '', '> ' + String(payload.obs).replace(/\n/g, '\n> '), '');
  return L.join('\n');
}

/* ============ LOADER + REVEALS ============ */
function dismissLoader() {
  const l = $('#loader');
  if (!l) return;
  setTimeout(() => l.classList.add('done'), 1550);
}
function observeReveals() {
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  els.forEach(e => io.observe(e));
}

/* ============ DIAGNÓSTICO ============ */
function buildDiag() {
  const wrap = $('#diag'); wrap.innerHTML = '';
  DIAG.forEach((sec, i) => {
    const card = create('div', { className: 'card reveal' });
    card.innerHTML = `<div class="sec-head">
        <div class="sec-num">${String(i + 2).padStart(2, '0')}</div>
        <div class="sec-titles"><div class="card-title">${sec.nome}</div>
        <div class="card-sub">${sec.desc}</div></div></div>`;
    const body = create('div');
    sec.campos.forEach(c => body.appendChild(buildField(c)));
    card.appendChild(body);
    wrap.appendChild(card);
  });
}

function buildField(c) {
  const box = create('div', { className: 'field mt' });
  const label = create('span', { className: 'field-label' });
  label.innerHTML = `${c.label} ${c.req ? '<em>obrigatório</em>' : ''}`;
  box.appendChild(label);
  const val = () => state.diagnostico[c.id];

  if (c.tipo === 'text' || c.tipo === 'textarea' || c.tipo === 'number') {
    const el = c.tipo === 'textarea'
      ? create('textarea', { className: 'input', rows: 3, placeholder: c.ph || '' })
      : create('input', { type: c.tipo === 'number' ? 'number' : 'text', className: 'input', placeholder: c.ph || '', inputmode: c.tipo === 'number' ? 'decimal' : 'text' });
    el.id = 'f-' + c.id; el.value = val();
    el.addEventListener('input', e => { state.diagnostico[c.id] = e.target.value; renderAll(); });
    box.appendChild(el);
  } else if (c.tipo === 'select') {
    const el = create('select', { className: 'input' }); el.id = 'f-' + c.id;
    el.innerHTML = c.opts.map(o => `<option value="${esc(o)}">${esc(o)}</option>`).join('');
    el.value = val();
    el.addEventListener('change', e => { state.diagnostico[c.id] = e.target.value; renderAll(); });
    box.appendChild(el);
  } else if (c.tipo === 'chips') {
    const chips = create('div', { className: 'chips' });
    c.opts.forEach(opt => {
      const chip = create('div', { className: 'chip' + (val().includes(opt) ? ' on' : ''), textContent: opt });
      chip.addEventListener('click', () => {
        const arr = state.diagnostico[c.id], i = arr.indexOf(opt);
        if (i >= 0) arr.splice(i, 1); else arr.push(opt);
        chip.classList.toggle('on'); renderAll();
      });
      chips.appendChild(chip);
    });
    box.appendChild(chips);
  } else if (c.tipo === 'swatches') {
    const sw = create('div', { className: 'swatches' });
    PALETTE.forEach(hex => {
      const s = create('div', { className: 'swatch' + (val().includes(hex) ? ' on' : '') });
      s.style.background = hex; s.title = hex;
      s.addEventListener('click', () => {
        const arr = state.diagnostico[c.id], i = arr.indexOf(hex);
        if (i >= 0) arr.splice(i, 1); else arr.push(hex);
        s.classList.toggle('on'); renderAll();
      });
      sw.appendChild(s);
    });
    box.appendChild(sw);
  } else if (c.tipo === 'slider') {
    const row = create('div', { className: 'axis' });
    row.innerHTML = `<span class="axis-end">${c.esq}</span>`;
    const inp = create('input', { type: 'range', className: 'axis-range', min: 0, max: 100, step: 1 });
    inp.value = val();
    inp.addEventListener('input', e => { state.diagnostico[c.id] = +e.target.value; renderAll(); });
    row.appendChild(inp);
    row.insertAdjacentHTML('beforeend', `<span class="axis-end right">${c.dir}</span>`);
    box.appendChild(row);
  }
  if (c.hint) box.insertAdjacentHTML('beforeend', `<small class="hint">${c.hint}</small>`);
  return box;
}

/* ============ TERRITÓRIO ============ */
function renderTerritory() {
  const d = state.diagnostico, el = $('#territory');
  if (!el) return;
  const axesHtml = Object.keys(AXIS_READS).filter(k => d[k] !== undefined).map(k => {
    const [a, b] = AXIS_READS[k], v = d[k];
    return `<div class="t-axis"><div class="t-axis-top"><span>${a}</span><span>${b}</span></div>
      <div class="t-axis-track"><div class="t-axis-dot" style="left:${v}%"></div></div></div>`;
  }).join('');
  const cores = (d.paleta || []).map(c => `<span class="t-sw" style="background:${esc(c)}"></span>`).join('') || '<span class="t-empty">—</span>';
  const tag = (arr) => (arr && arr.length) ? arr.map(x => `<span class="t-tag">${esc(x)}</span>`).join('') : '<span class="t-empty">—</span>';
  el.innerHTML = `
    <div><div class="t-label">Arquétipo</div><div class="t-val">${esc(d.arquetipo || '—')}${d.arquetipo2 && d.arquetipo2 !== '—' ? ' + ' + esc(d.arquetipo2) : ''}</div></div>
    <div><div class="t-label">Deve significar</div><div class="t-tags">${tag(d.significados)}</div></div>
    <div><div class="t-label">Paleta de referência</div><div class="t-sws">${cores}</div></div>
    <div><div class="t-label">Deve provocar</div><div class="t-tags">${tag(d.percepcao)}</div></div>
    <div><div class="t-label">Eixos semióticos</div>${axesHtml}</div>`;
}

/* ============ CENÁRIOS (modo completo) ============ */
function buildScenarios() {
  const wrap = $('#scenarios'); if (!wrap) return;
  wrap.innerHTML = '';
  SCENARIOS.forEach(scn => {
    const el = create('div', { className: 'scn' + (state.escopo.cenario === scn.id ? ' on' : '') });
    el.innerHTML = `${scn.destaque ? '<span class="scn-badge">Mais escolhido</span>' : ''}
      <div class="scn-top">
        <div><div class="scn-name">${scn.nome}</div><div class="scn-tag">${scn.tag}</div></div>
        <div class="scn-price">${fmtBR.format(scn.preco)}<small>projeto fechado</small></div>
      </div>
      <div class="scn-resumo">${scn.resumo}</div>
      <ul class="scn-list">${scn.entregaveis.map(e => `<li>${e}</li>`).join('')}</ul>
      <div class="scn-foot"><span>Prazo estimado: ${scn.prazo}</span><span class="scn-pick">${state.escopo.cenario === scn.id ? 'Selecionado' : 'Escolher este'}</span></div>`;
    el.addEventListener('click', () => { state.escopo.cenario = scn.id; buildScenarios(); renderAll(); });
    wrap.appendChild(el);
  });
}

function renderQuote() {
  if (MODE !== 'completo') return;
  const q = computeQuote();
  if (!q.scn) return;
  $('#quote-name').textContent = q.scn.nome;
  $('#quote-price').textContent = fmtBR.format(q.total);
  $('#quote-meta').textContent = `Projeto fechado · prazo ${q.scn.prazo}`;
  $('#pay-entrada').textContent = fmtBR.format(q.total * 0.5);
  $('#pay-parcela').textContent = fmtBR.format(q.total / 3);
  const list = $('#incl-list'); list.innerHTML = '';
  q.scn.entregaveis.forEach(e => { const li = create('li', { textContent: e }); list.appendChild(li); });
  $('#quote-for').textContent = state.cliente.nome || 'Sua marca';
}

/* ============ PROGRESSO ============ */
function renderProgress() {
  const c = state.cliente, d = state.diagnostico;
  const checks = [!!c.nome, !!c.contato, !!c.email, !!c.tel];
  DIAG.forEach(sec => sec.campos.forEach(f => {
    if (f.tipo === 'slider' || f.tipo === 'select') return;
    const v = d[f.id];
    checks.push(Array.isArray(v) ? v.length > 0 : !!v);
  }));
  const pct = Math.round((checks.filter(Boolean).length / checks.length) * 100);
  $('#progress-fill').style.width = pct + '%';
  $('#progress-pct').textContent = pct + '%';
}

function renderAll() { renderTerritory(); renderQuote(); renderProgress(); save(); }

/* ============ CLIENTE ============ */
function buildCliente() {
  const bind = (sel, key) => { const el = $(sel); if (!el) return; el.value = state.cliente[key] || ''; el.addEventListener('input', e => { state.cliente[key] = e.target.value; renderAll(); }); };
  bind('#c-nome', 'nome'); bind('#c-contato', 'contato'); bind('#c-email', 'email'); bind('#c-tel', 'tel');
  const mom = $('#c-momento');
  if (mom) { mom.value = state.cliente.momento; mom.addEventListener('change', e => { state.cliente.momento = e.target.value; renderAll(); }); }
  const obs = $('#obs');
  if (obs) { obs.value = state.obs; obs.addEventListener('input', e => { state.obs = e.target.value; save(); }); }
}

/* ============ VALIDAÇÃO ============ */
function validate() {
  let firstBad = null;
  const mark = (el, bad) => { if (!el) return; el.classList.toggle('invalid', bad); if (bad && !firstBad) firstBad = el; };
  mark($('#c-nome'), !state.cliente.nome.trim());
  mark($('#c-contato'), !state.cliente.contato.trim());
  const email = state.cliente.email.trim();
  mark($('#c-email'), !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
  mark($('#c-tel'), !state.cliente.tel.trim());
  DIAG.forEach(sec => sec.campos.forEach(c => {
    if (!c.req) return;
    const v = state.diagnostico[c.id];
    const bad = Array.isArray(v) ? !v.length : !String(v || '').trim();
    mark($('#f-' + c.id), bad);
    if (bad && !firstBad) firstBad = $('#f-' + c.id) || $('#diag');
  }));
  return { ok: !firstBad, firstBad };
}

/* ============ ENVIO ============ */
async function submitBriefing() {
  if (submitted) return;
  const v = validate();
  if (!v.ok) {
    showMsg('err', 'Preencha os campos obrigatórios para enviar.');
    if (v.firstBad) v.firstBad.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  const payload = { tipo: (window.APP_TIPO || MODE), cliente: state.cliente, diagnostico: state.diagnostico, obs: state.obs, origem: location.href, enviadoEm: new Date().toISOString() };
  if (MODE === 'completo') {
    const q = computeQuote();
    if (q.scn) payload.estimativa = { cenario: q.scn.nome, cenarioId: q.scn.id, total: q.total, prazo: q.scn.prazo, entregaveis: q.scn.entregaveis };
  }
  payload.markdown = buildMarkdown(payload);
  if (!SUBMIT_ENDPOINT) {
    showMsg('err', 'Envio ainda não configurado (falta a URL do Google Apps Script em brand.js).');
    return;
  }
  setSubmitting(true);
  showMsg('loading', 'Enviando o seu diagnóstico...');
  try {
    // Apps Script Web App: enviamos como text/plain para evitar preflight CORS.
    // A resposta é opaca (no-cors); se o fetch não falhar, consideramos enviado.
    await fetch(SUBMIT_ENDPOINT, {
      method: 'POST', mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    });
    submitted = true;
    showMsg('ok', '✓ Recebemos o seu diagnóstico! Nossa equipe vai analisar e voltar com a proposta em breve. Obrigado, ' + (state.cliente.contato || '') + '.');
    try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
  } catch (err) {
    setSubmitting(false);
    showMsg('err', 'Não conseguimos enviar agora. Tente novamente em instantes — ou nos chame direto.');
  }
}
function setSubmitting(on) { ['#btn-submit', '#btn-submit-top'].forEach(s => { const b = $(s); if (b) b.disabled = on; }); }
function showMsg(type, text) { const el = $('#submit-msg'); el.className = 'submit-msg ' + type; el.textContent = text; el.hidden = false; el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }

/* ============ INIT ============ */
function init() {
  load();
  dismissLoader();
  // modo "sem orçamento": esconde os blocos que só existem no completo
  if (MODE === 'diagnostico') {
    document.querySelectorAll('[data-only-completo]').forEach(el => { el.style.display = 'none'; });
  }
  buildCliente();
  buildDiag();
  if (MODE === 'completo') buildScenarios();
  observeReveals();
  $('#btn-submit').addEventListener('click', submitBriefing);
  const top = $('#btn-submit-top'); if (top) top.addEventListener('click', submitBriefing);
  const rst = $('#btn-reset');
  if (rst) rst.addEventListener('click', () => {
    if (!confirm('Limpar todas as respostas?')) return;
    state = defaultState(); submitted = false; setSubmitting(false);
    $('#submit-msg').hidden = true; save();
    buildCliente(); buildDiag();
    if (MODE === 'completo') buildScenarios();
    document.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
    renderAll();
  });
  renderAll();
}
document.addEventListener('DOMContentLoaded', init);
