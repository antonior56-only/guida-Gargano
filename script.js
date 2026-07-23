// ═══════════════════════════════════════════════════════════
// LOGICA UI BASE E MODALI
// ═══════════════════════════════════════════════════════════
function showToast(msg){
  const t=document.getElementById('toast');
  if (t) {
    t.textContent=msg;t.classList.add('show');
    setTimeout(()=>t.classList.remove('show'),2500);
  }
}
function toggleSidebar(){document.getElementById('sidebar').classList.toggle('open')}
function closeModal(id){document.getElementById(id).classList.remove('open')}

// ── Accessibilità modali: role/aria, Escape per chiudere, focus-trap ──
function _focusables(root) {
  return [...root.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(el => el.offsetParent !== null);
}
let _lastFocusBeforeModal = null;
function _topOpenModal() {
  const open = document.querySelectorAll('.modal-overlay.open');
  return open.length ? open[open.length - 1] : null;
}
function setupModalA11y() {
  document.querySelectorAll('.modal-overlay').forEach(m => {
    m.setAttribute('role', 'dialog');
    m.setAttribute('aria-modal', 'true');
    new MutationObserver(() => {
      if (m.classList.contains('open')) {
        _lastFocusBeforeModal = document.activeElement;
        const fo = _focusables(m);
        if (fo.length) setTimeout(() => fo[0].focus(), 30);
      } else if (_lastFocusBeforeModal) {
        try { _lastFocusBeforeModal.focus(); } catch (e) {}
        _lastFocusBeforeModal = null;
      }
    }).observe(m, { attributes: true, attributeFilter: ['class'] });
  });
  document.addEventListener('keydown', e => {
    const m = _topOpenModal();
    if (!m) return;
    if (e.key === 'Escape') { e.preventDefault(); closeModal(m.id); return; }
    if (e.key === 'Tab') {
      const fo = _focusables(m);
      if (!fo.length) return;
      const first = fo[0], last = fo[fo.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setupModalA11y);
else setupModalA11y();
function closeInfo(){
  document.getElementById('info-panel').classList.remove('open');
  document.getElementById('chat-widget').style.display='flex';
  if(window.speechSynthesis) window.speechSynthesis.cancel();
}

function openLuogoModal() {
  ['luogo-nome','luogo-desc','luogo-lat','luogo-lng','luogo-gmaps-url'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  const msg=document.getElementById('luogo-gmaps-msg'); if(msg) msg.textContent='';
  aggiornaLinkGMaps('luogo', 'luogo-nome');
  document.getElementById('luogo-modal').classList.add('open');
}
function openSentieroModal() {
  ['trek-nome','trek-km','trek-h','trek-start','trek-desc','trek-url','trek-lat','trek-lng','trek-gmaps-url'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  const msg = document.getElementById('trek-gmaps-msg'); if (msg) msg.textContent = '';
  aggiornaLinkGMaps('trek', 'trek-nome');
  const limitReached = SENTIERI_CUSTOM.length >= 6;
  const limitMsg = document.getElementById('sentiero-limit-msg');
  if (limitMsg) limitMsg.style.display = limitReached ? 'block' : 'none';
  const btn = document.querySelector('#sentiero-modal .btn-gold');
  if (btn) {
    btn.disabled = limitReached;
    btn.style.opacity = limitReached ? '0.5' : '1';
    btn.style.cursor = limitReached ? 'not-allowed' : 'pointer';
  }
  document.getElementById('sentiero-modal').classList.add('open');
}
function openRistoranteModal() {
  ['rist-nome','rist-loc','rist-cucina','rist-desc','rist-web','rist-lat','rist-lng','rist-gmaps-url'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  const msg=document.getElementById('rist-gmaps-msg'); if(msg) msg.textContent='';
  aggiornaLinkGMaps('rist', 'rist-nome');
  document.getElementById('ristorante-modal').classList.add('open');
}
function openAlloggioModal() {
  ['alloggio-nome','alloggio-loc','alloggio-prezzo','alloggio-voto','alloggio-desc','alloggio-lat','alloggio-lng','alloggio-gmaps-url'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  const msg=document.getElementById('alloggio-gmaps-msg'); if(msg) msg.textContent='';
  aggiornaLinkGMaps('alloggio', 'alloggio-nome');
  document.getElementById('alloggio-modal').classList.add('open');
}

// ═══════════════════════════════════════════════════════════
// IMPORTAZIONE DA GOOGLE MAPS CON ARRICCHIMENTO AI
// ═══════════════════════════════════════════════════════════
const GMAPS_DEFAULT_URL = {
  luogo:    'https://www.google.com/maps/search/luoghi+da+visitare/@41.83,15.95,11z',
  rist:     'https://www.google.com/maps/search/ristoranti/@41.83,15.95,11z',
  trek:     'https://www.google.com/maps/search/sentieri/@41.83,15.95,11z',
  alloggio: 'https://www.google.com/maps/search/hotel/@41.83,15.95,11z',
};

function aggiornaLinkGMaps(prefix, nomeId) {
  const nomeEl = document.getElementById(nomeId);
  const linkEl = document.getElementById(`${prefix}-gmaps-open`);
  if (!nomeEl || !linkEl) return;
  nomeEl.oninput = () => {
    const q = nomeEl.value.trim();
    linkEl.href = q
      ? `https://www.google.com/maps/search/${encodeURIComponent(q + ' Gargano')}`
      : (GMAPS_DEFAULT_URL[prefix] || 'https://www.google.com/maps/search/Gargano');
  };
}

const GMAPS_FIELDS = {
  luogo:   { nome:'luogo-nome',    lat:'luogo-lat',    lng:'luogo-lng',    desc:'luogo-desc',    cat:'luogo-cat' },
  rist:    { nome:'rist-nome',     lat:'rist-lat',     lng:'rist-lng',     desc:'rist-desc',     cat:'rist-cat',  loc:'rist-loc', cucina:'rist-cucina' },
  trek:    { nome:'trek-nome',     lat:'trek-lat',     lng:'trek-lng',     desc:'trek-desc',     start:'trek-start' },
  alloggio:{ nome:'alloggio-nome', lat:'alloggio-lat', lng:'alloggio-lng', desc:'alloggio-desc', loc:'alloggio-loc', cat:'alloggio-form-tipo' },
};

const GMAPS_CATEGORIE = {
  luogo:   'borgo, cultura, natura, montagna, religioso, sport, gastronomia, scienza, artigianato, agriturismo',
  rist:    'ristorante, bar, caffe, gelateria',
  trek:    '(nessuna — difficoltà: F=Facile, M=Medio, D=Difficile, E=Esperto)',
  alloggio:'hotel, appartamento, villaggio',
};

const GARGANO_VIEWBOX = '15.55,42.05,16.35,41.55';

async function geocodeNominatim(query) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1`
      + `&viewbox=${GARGANO_VIEWBOX}&bounded=1`
      + `&q=${encodeURIComponent(query)}`;
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 6000);
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(tid);
    if (!res.ok) return { error: `HTTP ${res.status}` };
    const data = await res.json();
    if (data && data[0]) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    return { error: 'nessun risultato' };
  } catch(e) { return { error: 'fetch fallito: ' + e.message }; }
}

async function reverseGeocodeNominatim(lat, lng) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 6000);
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(tid);
    if (!res.ok) return null;
    const data = await res.json();
    const a = data.address || {};
    const nome = data.name || a.amenity || a.shop || a.tourism || a.leisure || a.building || '';
    const via  = [a.road, a.house_number].filter(Boolean).join(' ');
    const citta= a.village || a.town || a.city || a.hamlet || '';
    const cap  = a.postcode || '';
    return {
      nome,
      citta,
      indirizzo: [via, [cap, citta].filter(Boolean).join(' ')].filter(Boolean).join(', '),
      loc: citta,
      display: data.display_name || ''
    };
  } catch(e) { return null; }
}

async function importaDaGMapsAI(prefix) {
  const input  = document.getElementById(`${prefix}-gmaps-url`);
  const msgEl  = document.getElementById(`${prefix}-gmaps-msg`);
  const testo  = (input?.value || '').trim();

  const ok  = (msg) => { msgEl.style.color='#2e7d32'; msgEl.textContent='✅ '+msg; };
  const err = (msg) => { msgEl.style.color='#c62828'; msgEl.textContent='❌ '+msg; };
  const info= (msg) => { msgEl.style.color='#1565c0'; msgEl.textContent='⏳ '+msg; };

  if (!testo) { err('Incolla un link Google Maps, un nome o un testo descrittivo.'); return; }

  if (/(maps\.app\.goo\.gl|goo\.gl\/maps)/i.test(testo)) {
    err('Link breve non supportato: aprilo nel browser, poi copia l\'URL completo dalla barra degli indirizzi e incollalo qui.');
    return;
  }

  let lat = null, lng = null, nomeRegex = '';

  let m = testo.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (m) { lat = parseFloat(m[1]); lng = parseFloat(m[2]); }
  if (lat === null) {
    const m3 = testo.match(/!3d(-?\d+\.\d+)/), m4 = testo.match(/!4d(-?\d+\.\d+)/);
    if (m3 && m4) { lat = parseFloat(m3[1]); lng = parseFloat(m4[1]); }
  }
  if (lat === null) {
    m = testo.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (m) { lat = parseFloat(m[1]); lng = parseFloat(m[2]); }
  }
  let coordMatchStr = '';
  if (lat === null) {
    m = testo.match(/(-?\d{1,2}\.\d{3,})\s*,\s*(-?\d{1,2}\.\d{3,})/);
    if (m) { lat = parseFloat(m[1]); lng = parseFloat(m[2]); coordMatchStr = m[0]; }
  }
  if (lat === null) {
    const dms = testo.match(/(\d{1,3})°(\d{1,2})'([\d.]+)"?\s*([NS])\s*[, ]?\s*(\d{1,3})°(\d{1,2})'([\d.]+)"?\s*([EW])/i);
    if (dms) {
      const toDec = (d,mi,s,h) => (parseFloat(d)+parseFloat(mi)/60+parseFloat(s)/3600) * (/[SW]/i.test(h)?-1:1);
      lat = toDec(dms[1],dms[2],dms[3],dms[4]);
      lng = toDec(dms[5],dms[6],dms[7],dms[8]);
    }
  }
  const mn = testo.match(/\/maps\/(?:place|search)\/([^/@?&]+)/);
  if (mn) nomeRegex = decodeURIComponent(mn[1].replace(/\+/g,' '));
  if (/\d°\d+'/.test(nomeRegex)) nomeRegex = '';

  let testoBase = testo;
  if (coordMatchStr) testoBase = testoBase.replace(coordMatchStr, ' ');
  testoBase = testoBase.replace(/\n+/g, ', ').replace(/\s{2,}/g, ' ').replace(/^[\s,]+|[\s,]+$/g, '').trim();
  let nomeRilevato = nomeRegex;
  let indirizzoRilevato = '';
  const viaKeywords = /\b(via|viale|piazza|piazzale|strada|frazione|località|loc\.?|contrada|c\.da|s\.s\.|s\.p\.|vico|largo|corso)\b/i;
  let cittaRilevata = '';
  let soloCoordinate = false;
  if (/\b\d{5}\b/.test(testoBase)) {
    const parts = testoBase.split(',').map(s=>s.trim().replace(/\n/g,' '));
    let splitIdx = -1, viaFound = false;
    for (let i=1;i<parts.length;i++) { if (viaKeywords.test(parts[i])) { splitIdx = i; viaFound = true; break; } }
    if (splitIdx === -1) {
      for (let i=parts.length-1;i>=1;i--) { if (/\d{5}/.test(parts[i])) { splitIdx = i; break; } }
    }
    if (splitIdx >= 1) {
      if (viaFound || splitIdx >= 2) {
        nomeRilevato = nomeRilevato || parts.slice(0, splitIdx).join(', ');
        indirizzoRilevato = parts.slice(splitIdx).join(', ');
      } else {
        cittaRilevata = parts[0].replace(/\b\d{5}\b/g, '').trim();
        indirizzoRilevato = parts.slice(0, splitIdx).join(', ') + ', ' + parts.slice(splitIdx).join(', ');
        soloCoordinate = true;
      }
    } else if (splitIdx === 0) {
      indirizzoRilevato = testoBase;
      cittaRilevata = testoBase.replace(/\b\d{5}\b/g, '').replace(/\b[A-Z]{2}\b\s*$/,'').trim();
      soloCoordinate = !nomeRilevato;
    } else {
      indirizzoRilevato = testo;
    }
  }

  let finalLat = lat, finalLng = lng;
  let geoDebug = '';
  if ((!finalLat || !finalLng)) {
    info('Ricerca coordinate (OpenStreetMap)…');
    const tentativi = [];
    if (indirizzoRilevato) tentativi.push(indirizzoRilevato);
    tentativi.push(testo);
    let geo = null;
    for (const q of tentativi) {
      geo = await geocodeNominatim(q);
      if (geo && !geo.error) break;
      geoDebug += `[${q.slice(0,30)}→${geo?.error||'?'}] `;
    }
    if (geo && !geo.error) { finalLat = geo.lat; finalLng = geo.lng; geoDebug=''; }
  }

  let revHint = '';
  if (finalLat && finalLng && (!nomeRilevato || !indirizzoRilevato)) {
    info('Identificazione luogo (OpenStreetMap)…');
    const rev = await reverseGeocodeNominatim(finalLat, finalLng);
    if (rev) {
      if (!nomeRilevato && rev.nome) nomeRilevato = rev.nome;
      if (rev.display) revHint = rev.display;
      if (!indirizzoRilevato && rev.citta) indirizzoRilevato = rev.citta;
    }
  }

  info('Analisi AI in corso…');

  const campi = GMAPS_FIELDS[prefix];
  const cats  = GMAPS_CATEGORIE[prefix];

  const coordInfo = (finalLat !== null && finalLat !== undefined)
    ? `Coordinate già note: lat=${parseFloat(finalLat).toFixed(6)}, lng=${parseFloat(finalLng).toFixed(6)}.`
    : 'Coordinate non trovate.';

  const nomeHint = nomeRilevato ? `Nome rilevato: "${nomeRilevato}".` : '';
  const indirizzoHint = indirizzoRilevato ? `Indirizzo/città rilevati: "${indirizzoRilevato}".` : '';
  const revHintTxt = revHint ? `Luogo identificato per coordinate: "${revHint}".` : '';
  const noNomeHint = soloCoordinate ? 'ATTENZIONE: il testo NON contiene il nome di un locale, solo coordinate o città. Lascia "nome" vuoto.' : '';

  let extraFields = "";
  if (prefix === "rist")     extraFields += '\n- "loc": città/comune\n- "cucina": tipo di cucina';
  if (prefix === "trek")     extraFields += '\n- "start": punto di partenza';
  if (prefix === "alloggio") extraFields += '\n- "loc": città/comune';

  const prompt = 'Analizza questo testo/link Google Maps relativo al Gargano:\n\n"'
    + testo + '"\n\n' + coordInfo + ' ' + nomeHint + ' ' + indirizzoHint + ' ' + revHintTxt + ' ' + noNomeHint
    + '\n\nRestituisci SOLO un oggetto JSON valido (no markdown) con:\n'
    + '- "nome": nome del luogo\n'
    + '- "desc": descrizione max 120 caratteri\n'
    + '- "cat": categoria tra: ' + cats + extraFields;

  let aiData = {};
  try {
    const activeKey = await idbGet('gargano_gemini_key');
    if (!activeKey) throw new Error('Nessuna API Key');
    const model = await getGeminiModel(activeKey);
    const endpoint = geminiEndpoint(model, activeKey);
    const res = await fetchTimeout(endpoint, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ contents:[{ parts:[{ text: prompt }] }] })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    let raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    raw = raw.replace(/```json|```/g,'').trim();
    aiData = JSON.parse(raw);
  } catch(e) {
    aiData = { nome: nomeRilevato || revHint, desc:'', cat:'', loc: indirizzoRilevato };
  }

  const set = (id, val) => { if (!id || !val) return; const el = document.getElementById(id); if (el) el.value = val; };
  const setSelect = (id, val) => { if (!id || !val) return; const el = document.getElementById(id); if (el) el.value = val; };

  if ((!finalLat || !finalLng) && aiData.nome) {
    const geo2 = await geocodeNominatim(aiData.nome + (aiData.loc ? ', '+aiData.loc : '') + ', Gargano, Italia');
    if (geo2 && !geo2.error) { finalLat = geo2.lat; finalLng = geo2.lng; }
  }

  const nomeFinale = soloCoordinate ? '' : (aiData.nome || nomeRilevato || revHint);
  const locFinale  = cittaRilevata || aiData.loc;

  set(campi.nome,   nomeFinale);
  set(campi.desc,   soloCoordinate ? '' : aiData.desc);
  set(campi.lat,    finalLat ? parseFloat(finalLat).toFixed(6) : '');
  set(campi.lng,    finalLng ? parseFloat(finalLng).toFixed(6) : '');
  if (campi.loc)    set(campi.loc,    locFinale);
  if (campi.cucina) set(campi.cucina, aiData.cucina);
  if (campi.start)  set(campi.start,  aiData.start);
  if (campi.cat && aiData.cat && !soloCoordinate) setSelect(campi.cat, aiData.cat);

  const linkEl = document.getElementById(`${prefix}-gmaps-open`);
  if (linkEl && aiData.nome) {
    linkEl.href = `https://www.google.com/maps/search/${encodeURIComponent(aiData.nome + ' Gargano')}`;
  }

  const coordOk = finalLat && finalLng ? `📍 ${parseFloat(finalLat).toFixed(4)}, ${parseFloat(finalLng).toFixed(4)}` : `⚠️ Coordinate non trovate`;
  ok(`"${nomeFinale || '(nome)'}" importato. ${coordOk}`);
}

// ═══════════════════════════════════════════════════════════
// LAYER INDEXEDDB
// ═══════════════════════════════════════════════════════════
const IDB_NAME = 'gargano_db';
const IDB_STORE = 'kv';
const IDB_VER = 1;
let _idb = null;

function openIDB() {
  if (_idb) return Promise.resolve(_idb);
  return new Promise((res, rej) => {
    const req = indexedDB.open(IDB_NAME, IDB_VER);
    req.onupgradeneeded = e => e.target.result.createObjectStore(IDB_STORE);
    req.onsuccess = e => { _idb = e.target.result; res(_idb); };
    req.onerror = e => rej(e.target.error);
  });
}
async function idbGet(key) {
  const db = await openIDB();
  return new Promise((res, rej) => {
    const req = db.transaction(IDB_STORE,'readonly').objectStore(IDB_STORE).get(key);
    req.onsuccess = () => res(req.result ?? null);
    req.onerror = e => rej(e.target.error);
  });
}
async function idbSet(key, value) {
  const db = await openIDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(IDB_STORE,'readwrite');
    tx.objectStore(IDB_STORE).put(value, key);
    tx.oncomplete = () => res();
    tx.onerror = e => rej(e.target.error);
  });
}
async function idbDelete(key) {
  const db = await openIDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(IDB_STORE,'readwrite');
    tx.objectStore(IDB_STORE).delete(key);
    tx.oncomplete = () => res();
    tx.onerror = e => rej(e.target.error);
  });
}
async function idbKeys() {
  const db = await openIDB();
  return new Promise((res, rej) => {
    const req = db.transaction(IDB_STORE,'readonly').objectStore(IDB_STORE).getAllKeys();
    req.onsuccess = () => res(req.result);
    req.onerror = e => rej(e.target.error);
  });
}
async function safeParse(key, defaultValue) {
  try { const val = await idbGet(key); return val !== null ? val : defaultValue; }
  catch (e) { return defaultValue; }
}
async function saveData(key, value) {
  try { await idbSet(key, value); } catch(e) { console.error('IDB saveData error', e); }
}

function sanitize(str) {
  if (!str) return '';
  return str.toString().replace(/[&<>'"]/g, tag => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[tag]));
}

function fetchTimeout(url, opts = {}, ms = 10000) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, { ...opts, signal: ctrl.signal }).finally(() => clearTimeout(id));
}

function safeUrl(u) {
  let s = (u || '').toString().trim();
  if (!s) return '';
  if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(s)) s = 'https://' + s.replace(/^\/+/, '');
  try {
    const p = new URL(s);
    if (p.protocol !== 'http:' && p.protocol !== 'https:') return '';
    return p.href;
  } catch (e) { return ''; }
}

// ═══════════════════════════════════════════════════════════
// GESTIONE AI: MODELLO GEMINI E API KEY
// ═══════════════════════════════════════════════════════════
const GEMINI_MODEL_DEFAULT = 'gemini-2.5-flash';
const MODELLI_PREFERITI = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest', 'gemini-1.5-flash'];
let _discoveryFallita = false;

function geminiEndpoint(model, key) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
}

async function invalidaCacheModello() {
  await idbDelete('gargano_gemini_model_auto');
  _discoveryFallita = false;
}

async function setApiKey(nuovaKey) {
  await idbSet('gargano_gemini_key', nuovaKey.trim());
  await invalidaCacheModello();
}

async function getApiKeyOrAsk() {
  const key = await idbGet('gargano_gemini_key');
  if (key) return key;
  const nuova = await askForApiKeyModal();
  if (nuova && nuova.trim()) { await setApiKey(nuova); return nuova.trim(); }
  return null;
}

async function getGeminiModel(activeKey) {
  const manuale = await idbGet('gargano_gemini_model');
  if (manuale && manuale !== 'auto') return manuale;

  const auto = await idbGet('gargano_gemini_model_auto');
  if (auto) return auto;

  if (activeKey && !_discoveryFallita) {
    try {
      const url = 'https://generativelanguage.googleapis.com/v1beta/models?key=' + activeKey;
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), 6000);
      const res = await fetch(url, { signal: ctrl.signal });
      clearTimeout(tid);
      if (res.ok) {
        const data = await res.json();
        const disponibili = (data.models || [])
          .filter(m => (m.supportedGenerationMethods || []).includes('generateContent'))
          .map(m => (m.name || '').replace('models/', ''));
        for (const pref of MODELLI_PREFERITI) {
          if (disponibili.includes(pref)) {
            await idbSet('gargano_gemini_model_auto', pref);
            return pref;
          }
        }
        const flash = disponibili.find(m => m.includes('flash'));
        if (flash) { await idbSet('gargano_gemini_model_auto', flash); return flash; }
      }
    } catch(e) {}
    _discoveryFallita = true;
  }
  return GEMINI_MODEL_DEFAULT;
}

async function salvaModelloGemini(val) {
  if (val === 'auto') {
    await idbDelete('gargano_gemini_model');
    await invalidaCacheModello();
    showToast('🔄 Modalità automatica attiva');
  } else {
    await idbSet('gargano_gemini_model', val);
    showToast(`Modello salvato: ${val}`);
  }
}

async function apriModaleApiKey() {
  closeModal('settings-modal');
  const newKey = await askForApiKeyModal();
  if (newKey && newKey.trim() !== '') {
    await setApiKey(newKey);
    showToast('✅ API Key salvata!');
  }
}

async function apriImpostazioni() {
  document.getElementById('settings-modal').classList.add('open');
  let manuale = null;
  try { manuale = await idbGet('gargano_gemini_model'); } catch(e) {}
  const sel = document.getElementById('select-gemini-model');
  if (sel) sel.value = (manuale && manuale !== 'auto') ? manuale : 'auto';

  const info = document.getElementById('modello-attivo-info');
  if (info) {
    if (manuale && manuale !== 'auto') {
      info.textContent = '';
    } else {
      let auto = null;
      try { auto = await idbGet('gargano_gemini_model_auto'); } catch(e) {}
      info.textContent = auto ? `In uso: ${auto}` : `Nessun modello ancora rilevato`;
    }
  }

  const iconEl = document.getElementById('apikey-status-icon');
  const textEl = document.getElementById('apikey-status-text');
  const btnEl  = document.querySelector('#apikey-status-row button');
  if (!iconEl || !textEl) return;

  let key = null;
  try { key = await idbGet('gargano_gemini_key'); } catch(e) {}

  if (!key) {
    iconEl.textContent = '❌';
    textEl.textContent = 'Nessuna chiave inserita';
    textEl.style.color = '#c62828';
    if (btnEl) btnEl.textContent = 'Inserisci';
    return;
  }
  if (btnEl) btnEl.textContent = 'Cambia';

  const short = key.slice(0, 8) + '…';
  iconEl.textContent = '⏳';
  textEl.textContent = 'Verifica in corso…';
  
  try {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 6000);
    const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + key, { signal: ctrl.signal });
    clearTimeout(tid);
    const d = await r.json().catch(() => ({}));
    if (r.ok && d.models && d.models.length > 0) {
      iconEl.textContent = '✅';
      textEl.textContent = 'Attiva e funzionante — ' + short;
      textEl.style.color = '#2e7d32';
    } else {
      iconEl.textContent = '❌';
      textEl.textContent = 'Chiave non valida';
      textEl.style.color = '#c62828';
    }
  } catch(e) {
    iconEl.textContent = '⚠️';
    textEl.textContent = 'Verifica non riuscita';
    textEl.style.color = '#b5622b';
  }
}

async function rimuoviApiKey() {
  try { localStorage.removeItem('gargano_gemini_key'); } catch(e) {}
  await idbDelete('gargano_gemini_key');
  await invalidaCacheModello();
  showToast("API Key rimossa");
  closeModal('settings-modal');
}

async function cancellaTuttiIDati() {
  closeModal('settings-modal');
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay open';
  overlay.style.zIndex = '10005';
  overlay.innerHTML = `
    <div class="modal-box">
      <h2 style="color:var(--rust)">⚠️ Conferma Reset</h2>
      <p style="font-size:13px;color:var(--muted);margin-bottom:16px">Vuoi eliminare tutti i dati e ripristinare l'app?</p>
      <div class="modal-actions">
        <button class="btn btn-outline" id="btn-annulla-reset">Annulla</button>
        <button class="btn" style="background:#c62828;color:white" id="btn-conferma-reset">Sì, cancella tutto</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  document.getElementById('btn-annulla-reset').onclick = () => document.body.removeChild(overlay);
  document.getElementById('btn-conferma-reset').onclick = async () => {
    const allKeys = await idbKeys();
    for (const key of allKeys) {
      if (key.toString().startsWith('gargano_')) await idbDelete(key);
    }
    document.body.removeChild(overlay);
    showToast("Dati resettati. Riavvio in corso...");
    setTimeout(() => location.reload(), 2000);
  };
}

// ═══════════════════════════════════════════════════════════
// DATASETS
// ═══════════════════════════════════════════════════════════
const LUOGHI = [
  {name:"Baia delle Zagare",cat:"montagna",coords:[41.7486, 16.1466],desc:"Baia iconica con i suoi faraglioni.",pop:true},
  {name:"Cagnano Varano",cat:"borgo",coords:[41.8273, 15.7725],desc:"Borgo affacciato sull'omonimo lago, famoso per la Grotta di San Michele.",pop:false},
  {name:"Carpino",cat:"borgo",coords:[41.8436, 15.8577],desc:"La città dell'olio e del folklore, nota per il Carpino Folk Festival.",pop:true},
  {name:"Castello Svevo di Vieste",cat:"cultura",coords:[41.8808, 16.1786],desc:"Imponente fortezza a picco sul mare.",pop:true},
  {name:"Foresta Umbra",cat:"natura",coords:[41.8203, 16.0288],desc:"Faggete vetuste patrimonio UNESCO.",pop:true},
  {name:"Ischitella",cat:"borgo",coords:[41.9039, 15.8974],desc:"Borgo panoramico che domina il mare e il Lago di Varano.",pop:false},
  {name:"Isole Tremiti",cat:"natura",coords:[42.1216, 15.5015],desc:"Arcipelago paradisiaco al largo del Gargano.",pop:true},
  {name:"Lesina",cat:"borgo",coords:[41.8601, 15.3524],desc:"Famosa per il suo lago costiero e le tradizionali anguille.",pop:false},
  {name:"Manfredonia",cat:"borgo",coords:[41.6288, 15.9126],desc:"La porta del Gargano, con il suo castello svevo-angioino.",pop:true},
  {name:"Mattinata",cat:"borgo",coords:[41.7119, 16.0506],desc:"La farfalla bianca del Gargano.",pop:true},
  {name:"Monte Sant'Angelo",cat:"borgo",coords:[41.7072, 15.9546],desc:"Sito UNESCO, sede del Santuario di San Michele.",pop:true},
  {name:"Peschici",cat:"borgo",coords:[41.9464, 16.0145],desc:"Borgo bianco a strapiombo sul mare.",pop:true},
  {name:"Rignano Garganico",cat:"borgo",coords:[41.6775, 15.5843],desc:"Il 'Balcone delle Puglie', noto per i suoi panorami mozzafiato.",pop:false},
  {name:"Rodi Garganico",cat:"borgo",coords:[41.9288, 15.8845],desc:"Borgo marinaro circondato da agrumeti storici.",pop:true},
  {name:"San Giovanni Rotondo",cat:"religioso",coords:[41.7061, 15.7275],desc:"Meta di pellegrinaggio legata a Padre Pio.",pop:true},
  {name:"San Marco in Lamis",cat:"borgo",coords:[41.7118, 15.6358],desc:"Sede dello storico Santuario di San Matteo.",pop:false},
  {name:"San Nicandro Garganico",cat:"borgo",coords:[41.8347, 15.5684],desc:"Ricco di fenomeni carsici, tra cui la Dolina Pozzatina.",pop:false},
  {name:"Santuario San Michele",cat:"cultura",coords:[41.7078, 15.9547],desc:"Grotta sacra dedicata all'Arcangelo Michele.",pop:true},
  {name:"Vico del Gargano",cat:"borgo",coords:[41.8953, 15.9567],desc:"Il borgo dell'amore e degli agrumi.",pop:true},
  {name:"Vieste",cat:"borgo",coords:[41.8825, 16.1772],desc:"La perla del Gargano, famosa per il Pizzomunno.",pop:true}
];

const SENTIERI = [
  {name:"Ascesa a Monte Saraceno",diff:"M",km:5,h:"2.5h",start:"Mattinata",coords:[[41.7119, 16.0506],[41.7100, 16.0800]],url:"https://it.wikiloc.com",desc:"Trekking archeologico verso la necropoli dei Dauni."},
  {name:"Periplo di San Domino",diff:"M",km:8,h:"3h",start:"Isole Tremiti (San Domino)",coords:[[42.1216, 15.5015],[42.1250, 15.5100]],url:"https://www.alltrails.com",desc:"Giro completo dell'isola tra pinete e calette spettacolari."},
  {name:"Sentiero dei Trabucchi",diff:"F",km:7,h:"3h",start:"Peschici",coords:[[41.9464, 16.0145],[41.9500, 16.0500]],url:"https://www.alltrails.com",desc:"Percorso costiero alla scoperta delle antiche macchine da pesca."},
  {name:"Sentiero Laghetto d'Umbra",diff:"F",km:3,h:"1.5h",start:"Foresta Umbra",coords:[[41.8150, 15.9860],[41.8200, 15.9900]],url:"https://it.wikiloc.com",desc:"Passeggiata facile e ombreggiata attorno al laghetto."},
  {name:"Sentiero Mergoli - Vignanotica",diff:"M",km:6,h:"3h",start:"Baia delle Zagare",coords:[[41.7486, 16.1466],[41.7610, 16.1550]],url:"https://www.parcogargano.it",desc:"Il Sentiero dell'Amore, a picco sulle falesie bianche."},
  {name:"Valle del Tesoro",diff:"D",km:12,h:"5h",start:"Monte Sant'Angelo",coords:[[41.7072, 15.9546],[41.8000, 15.9500]],url:"https://it.wikiloc.com",desc:"Immersione nella natura selvaggia del Parco Nazionale."}
];

const RISTORANTI = [
  {name:"Agriturismo Monte Sacro",loc:"Mattinata",cat:"agriturismo",price:"€€",cucina:"Tradizionale",coords:[41.7538, 16.0290],desc:"Prodotti biologici locali e olio extravergine.",piatto:"Caciocavallo podolico alla piastra"},
  {name:"Al Trabucco da Mimì",loc:"Peschici",cat:"ristorante",price:"€€€",cucina:"Pesce e Crudi",coords:[41.9476, 16.0304],desc:"Storico ristorante su un vero trabucco."},
  {name:"Gelateria Artigianale Maggiore",loc:"Vieste",cat:"gelateria",price:"€",cucina:"Gelato",coords:[41.8833, 16.1775],desc:"Gelateria artigianale storica."},
  {name:"Agriturismo Falcare",loc:"Cagnano Varano",cat:"agriturismo",price:"€€",cucina:"Km 0",coords:[41.7801, 15.8335],desc:"Immersi nella natura del Gargano.",piatto:"Orecchiette fresche"},
  {name:"Medioevo",loc:"Monte Sant'Angelo",cat:"ristorante",price:"€€",cucina:"Tradizionale",coords:[41.7076, 15.9540],web:"https://ristorante-medioevo.it",desc:"Tradizione garganica e carne podolica."},
  {name:"Osteria degli Archi",loc:"Vieste",cat:"ristorante",price:"€€",cucina:"Pesce e Garganica",coords:[41.8825, 16.1830],desc:"Nel centro storico di Vieste."},
  {name:"Osteria del Borgo",loc:"Mattinata",cat:"osteria",price:"€€",cucina:"Terra e Mare",coords:[41.7097, 16.0519],desc:"Paste fresche e sapori di terra."},
  {name:"Il Forno Moretti 1960",loc:"Monte Sant'Angelo",cat:"bakery",price:"€",cucina:"Forno tipico",coords:[41.7063, 15.9627],desc:"Forno storico dal 1960.",piatto:"Ostie ripiene"},
  {name:"Porta di Basso",loc:"Peschici",cat:"ristorante",price:"€€€",cucina:"Creativa",coords:[41.9470, 16.0130],desc:"Ristorante stellato a strapiombo sul mare."},
  {name:"Ristorante Il Capriccio",loc:"Vieste",cat:"ristorante",price:"€€€",cucina:"Gourmet Marinara",coords:[41.8856, 16.1779],web:"https://www.ilcapricciovieste.it",desc:"Alta cucina di mare sul porto."},
  {name:"Trabucco San Lorenzo",loc:"Vieste",cat:"ristorante",price:"€€",cucina:"Pesce",coords:[41.8955, 16.1611],desc:"Cenare sospesi sul mare.",piatto:"Troccoli ai frutti di mare"},
  {name:"Vecchia Vieste Ristorante Tipico",loc:"Vieste",cat:"ristorante",price:"€€",cucina:"Pugliese",coords:[41.8828, 16.1830],desc:"Antico edificio in pietra nel centro storico."}
];

const ALLOGGI_DEFAULT = [
  {name:"B&B A Casa di Gaia",coords:[41.8960, 15.9550],tipo:"b&b",prezzo:75,stelle:3,voto:"9.0 ⭐",loc:"Vico del Gargano",url:"https://www.acasadigaia.it",desc:"Nel centro storico di Vico."},
  {name:"B&B Marina Piccola",coords:[41.8837, 16.1803],tipo:"b&b",prezzo:90,stelle:3,voto:"9.1 ⭐",loc:"Vieste",desc:"Affaccio diretto sul mare in centro."},
  {name:"Baia delle Zagare Hotel",coords:[41.7473, 16.1448],tipo:"resort",prezzo:280,stelle:4,voto:"9.3 🌟",loc:"Mattinata",url:"https://www.baia-delle-zagare.it",desc:"Accesso privato alla spiaggia."},
  {name:"Centro di Spiritualità Padre Pio",coords:[41.7062, 15.7070],tipo:"hotel",prezzo:80,stelle:3,voto:"8.9 ⭐",loc:"San Giovanni Rotondo",url:"https://www.centrospiritualepadrepio.it",desc:"Accoglienza per pellegrini."},
  {name:"Gusmay Resort",coords:[41.9398, 16.0633],tipo:"resort",prezzo:210,stelle:4,voto:"8.9 ⭐",loc:"Peschici",url:"https://www.valturbaiadelgusmay.com",desc:"Struttura elegante nella baia."},
  {name:"Hotel D'Amato",coords:[41.9449, 16.0090],tipo:"hotel",prezzo:140,stelle:4,voto:"8.5 ⭐",loc:"Peschici",url:"https://www.hoteldamato.it",desc:"Piscine e vista mare."},
  {name:"Palace Hotel San Michele",coords:[41.7075, 15.9495],tipo:"hotel",prezzo:120,stelle:4,voto:"8.8 ⭐",loc:"Monte Sant'Angelo",desc:"Antico palazzo del '900."},
  {name:"Pizzomunno Vieste Palace Hotel",coords:[41.8719, 16.1739],tipo:"hotel",prezzo:250,stelle:5,voto:"9.2 🌟",loc:"Vieste",url:"https://www.hotelpizzomunno.it",desc:"Resort esclusivo sulla spiaggia."},
  {name:"Villaggio San Matteo Resort",coords:[41.7036, 16.0642],tipo:"villaggio",prezzo:130,stelle:4,voto:"8.6 ⭐",loc:"Mattinata",desc:"Tra ulivi e mare."}
];

const ITINERARI_PREDEFINITI = [
  {name:"Cuore Verde del Gargano",tema:"natura",giorni:1,desc:"Immersione totale nelle faggete patrimonio UNESCO.",tappe:["Foresta Umbra","Sentiero Laghetto d'Umbra","Vico del Gargano","Osteria del Borgo"],km:15,coords:[[41.8150, 15.9860],[41.8150, 15.9860],[41.8953, 15.9567],[41.8960, 15.9570]]},
  {name:"I Sentieri della Fede",tema:"storico",giorni:2,desc:"Percorso mistico tra il Santuario e San Giovanni Rotondo.",tappe:["Monte Sant'Angelo","Santuario San Michele","Medioevo","San Giovanni Rotondo","Osteria degli Archi"],km:25,coords:[[41.7072, 15.9546],[41.7078, 15.9547],[41.7080, 15.9530],[41.7061, 15.7275],[41.7050, 15.7300]]},
  {name:"Le Perle della Costa Garganica",tema:"borghi",giorni:2,desc:"Viaggio lungo la costa tra faraglioni e trabucchi.",tappe:["Vieste","Castello Svevo di Vieste","Ristorante Il Capriccio","Peschici","Al Trabucco da Mimì"],km:25,coords:[[41.8825, 16.1772],[41.8808, 16.1786],[41.8840, 16.1750],[41.9464, 16.0145],[41.9515, 16.0230]]},
  {name:"Tour dei Sapori Garganici",tema:"gastronomico",giorni:3,desc:"Dai crudi di mare alla carne podolica.",tappe:["Peschici","Al Trabucco da Mimì","Vico del Gargano","Monte Sant'Angelo","Panificio Biscotti"],km:60,coords:[[41.9464, 16.0145],[41.9515, 16.0230],[41.8953, 15.9567],[41.7072, 15.9546],[41.7075, 15.9550]]},
  {name:"Trekking Vista Mare",tema:"trekking",giorni:2,desc:"Percorsi mozzafiato tra falesie e acque cristalline.",tappe:["Mattinata","Ascesa a Monte Saraceno","Baia delle Zagare","Sentiero Mergoli - Vignanotica"],km:20,coords:[[41.7119, 16.0506],[41.7119, 16.0506],[41.7486, 16.1466],[41.7486, 16.1466]]}
];

let LUOGHI_CUSTOM       = [];
let SENTIERI_CUSTOM     = [];
let SENTIERI_NASCOSTI   = [];
let RISTORANTI_CUSTOM   = [];
let RISTORANTI_NASCOSTI = new Set();
let ALLOGGI_CONSIGLIATI = [...ALLOGGI_DEFAULT];
let ALLOGGI_CUSTOM = [];
let ITINERARI_CUSTOM    = [];
let ITINERARI_NASCOSTI  = [];
let VALUTAZIONI         = {};
let CHECKINS            = [];

async function migraAlloggiSnapshot() {
  const snapshot = await safeParse('gargano_alloggi_consigliati', null);
  if (snapshot === null || !Array.isArray(snapshot)) return;
  const nomiDefault  = ALLOGGI_DEFAULT.map(d => d.name);
  const nomiSnapshot = snapshot.map(a => a.name);
  const nascosti = await safeParse('gargano_alloggi_nascosti', []);
  ALLOGGI_DEFAULT.forEach(d => {
    if (!nomiSnapshot.includes(d.name) && !nascosti.includes(d.name)) nascosti.push(d.name);
  });
  await saveData('gargano_alloggi_nascosti', nascosti);
  const custom = await safeParse('gargano_alloggi_custom', []);
  const nomiCustom = custom.map(c => c.name);
  snapshot.forEach(a => {
    if (nomiDefault.includes(a.name) || nomiCustom.includes(a.name)) return;
    if (a.custom === true || !nomiDefault.includes(a.name)) custom.push({ ...a, custom: true });
  });
  await saveData('gargano_alloggi_custom', custom);
  await idbDelete('gargano_alloggi_consigliati');
}

async function costruisciAlloggi() {
  const nascosti = await safeParse('gargano_alloggi_nascosti', []);
  ALLOGGI_CONSIGLIATI = ALLOGGI_DEFAULT.filter(a => !nascosti.includes(a.name));
  ALLOGGI_CUSTOM.forEach(c => {
    if (!ALLOGGI_CONSIGLIATI.find(a => a.name === c.name)) ALLOGGI_CONSIGLIATI.unshift(c);
  });
}

async function initData() {
  LUOGHI_CUSTOM       = await safeParse('gargano_luoghi_custom', []);
  SENTIERI_CUSTOM     = await safeParse('gargano_sentieri_custom', []);
  SENTIERI_NASCOSTI   = await safeParse('gargano_sentieri_nascosti', []);
  RISTORANTI_CUSTOM   = await safeParse('gargano_ristoranti_custom', []);
  RISTORANTI_NASCOSTI = new Set(await safeParse('gargano_ristoranti_nascosti', []));
  ALLOGGI_CUSTOM      = await safeParse('gargano_alloggi_custom', []);
  await migraAlloggiSnapshot();
  ALLOGGI_CUSTOM      = await safeParse('gargano_alloggi_custom', []);
  await costruisciAlloggi();
  ITINERARI_CUSTOM    = await safeParse('gargano_itin', []);
  ITINERARI_NASCOSTI  = await safeParse('gargano_itin_nascosti', []);
  VALUTAZIONI         = await safeParse('gargano_valutazioni', {});
  CHECKINS            = await safeParse('gargano_checkins', []);

  LUOGHI_CUSTOM.forEach(c => { if (!LUOGHI.find(l => l.name === c.name && l.custom)) LUOGHI.push(c); });
  SENTIERI_CUSTOM.forEach(c => { if (!SENTIERI.find(s => s.name === c.name && s.custom)) SENTIERI.push(c); });
  RISTORANTI_CUSTOM.forEach(c => { if (!RISTORANTI.find(r => r.name === c.name && r.custom)) RISTORANTI.push(c); });
}

let map; 
let markerClusterGroup;
let allMarkers = [];
let routeLine = null;
let currentRouteCoords = [];
let currentRouteNames = [];
let _routeGen = 0;
let premiumMarker = null;

const CAT_COLORS = {
  borgo:'#0d4f6e', cultura:'#2e9ec9', natura:'#27ae60', trekking:'#1565c0',
  ristorante:'#c75c1a', religioso:'#7b1fa2', sport:'#e65100',
  scienza:'#00838f', gastronomia:'#8d6e63', agriturismo:'#558b2f', artigianato:'#6d4c41',
  montagna:'#0277bd', osteria:'#c62828', trattoria:'#b5622b', bar:'#f57c00', pasticceria:'#ad1457',
  enoteca:'#6a1b9a', pizzeria:'#e65100', gelateria:'#0277bd', bakery:'#e65100', evento:'#c9a84c'
};
const CAT_EMOJI = {
  borgo:'🏛', cultura:'🏛', natura:'🌿', trekking:'🥾',
  ristorante:'🍽', religioso:'⛪', sport:'⚽',
  scienza:'🔭', gastronomia:'🍇', agriturismo:'🌾', artigianato:'🪵',
  montagna:'🏔', osteria:'🍷', trattoria:'🍝', bar:'☕', pasticceria:'🥐',
  enoteca:'🍷', pizzeria:'🍕', gelateria:'🍦', bakery:'🥖', evento:'📅'
};
const TIPO_ICON  = {hotel:"🏨", villaggio:"🏖", resort:"🌟", camping:"⛺", appartamento: "🏡"};
const TIPO_COLOR = {hotel:"#0d4f6e", villaggio:"#e8a020", resort:"#c75c1a", camping:"#2e7d32", appartamento: "#4a148c"};

function getColor(cat){return CAT_COLORS[cat]||'#6b6055'}
function makeIcon(cat){
  const c = getColor(cat);
  const e = CAT_EMOJI[cat] || '📍';
  return L.divIcon({
    className:'marker-icon-custom',
    html:`<div style="background:${c};color:#fff;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:14px;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3);transition:all 0.3s">${e}</div>`,
    iconSize:[28,28],iconAnchor:[14,14]
  });
}

function clearMapMarkers(){
  if(markerClusterGroup) {
    markerClusterGroup.clearLayers();
  } else {
    allMarkers.forEach(m => map.removeLayer(m));
  }
  allMarkers = [];
}

function handleCardClick(name, type, coords) {
  showInfoByName(name, type);
  document.querySelectorAll('.selected-card').forEach(c => c.classList.remove('selected-card'));
  const cards = document.querySelectorAll(`.list-card[data-name="${name.replace(/"/g, '\\"')}"]`);
  cards.forEach(c => c.classList.add('selected-card'));
  const pt = Array.isArray(coords[0]) ? coords[0] : coords;
  map.flyTo(pt, 15, {duration: 1.5});
  if(premiumMarker) map.removeLayer(premiumMarker);
  const icon = L.divIcon({
    className:'',
    html:'<div class="poi-premium"></div>',
    iconSize:[42,42],
    iconAnchor:[21,21]
  });
  premiumMarker = L.marker(pt, {icon}).addTo(map);
  premiumMarker.bindPopup('<b>'+name+'</b>').openPopup();
}

function updateMap() {
  clearMapMarkers();
  if(!markerClusterGroup && map) {
    markerClusterGroup = L.markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 40,
      iconCreateFunction: function(cluster) {
        return L.divIcon({ html: '<div><span>' + cluster.getChildCount() + '</span></div>', className: 'marker-cluster-custom', iconSize: L.point(40, 40) });
      }
    });
    map.addLayer(markerClusterGroup);
  }

  let visibleCount = 0;
  const qL = document.getElementById('search-luoghi').value.toLowerCase();
  LUOGHI.forEach(p => {
    const catOK = activeLuoghiCats.has('tutte') || activeLuoghiCats.has(p.cat);
    const txtOK = !qL || (p.name+p.desc+p.cat).toLowerCase().includes(qL);
    if(catOK && txtOK && p.coords) {
      const m = L.marker(p.coords, {icon: makeIcon(p.cat)});
      m.on('click', () => handleCardClick(p.name, 'luogo', p.coords));
      markerClusterGroup.addLayer(m);
      allMarkers.push(m);
      visibleCount++;
    }
  });

  const qT = document.getElementById('search-trek').value.toLowerCase();
  SENTIERI.forEach(s => {
    const dOK = activeDiff === 'tutte' || s.diff === activeDiff;
    const tOK = !qT || (s.name+s.desc+s.start).toLowerCase().includes(qT);
    const visOK = s.custom || !SENTIERI_NASCOSTI.includes(s.name);
    if(dOK && tOK && visOK && s.coords && s.coords.length > 0) {
      const startPt = s.coords[0];
      const m = L.marker(startPt, {icon: makeIcon('trekking')});
      m.on('click', () => handleCardClick(s.name, 'trekking', s.coords));
      markerClusterGroup.addLayer(m);
      allMarkers.push(m);
      visibleCount++;
    }
  });

  const qR = document.getElementById('search-rest').value.toLowerCase();
  const cR = document.getElementById('filter-rest-city').value;
  RISTORANTI.forEach(r => {
    if (RISTORANTI_NASCOSTI.has(r.name) && !r.custom) return;
    const pOK = activePriceF === 'all' || r.price === activePriceF;
    const cityOK = cR === 'tutte' || r.loc === cR;
    const tOK = !qR || (r.name+r.desc+r.cucina+r.loc).toLowerCase().includes(qR);
    if(pOK && cityOK && tOK && r.coords) {
      const m = L.marker(r.coords, {icon: makeIcon(r.cat)});
      m.on('click', () => handleCardClick(r.name, 'ristorante', r.coords));
      markerClusterGroup.addLayer(m);
      allMarkers.push(m);
      visibleCount++;
    }
  });

  const qA = document.getElementById('search-alloggi').value.toLowerCase();
  const cA = document.getElementById('filter-alloggi-city').value;
  ALLOGGI_CONSIGLIATI.forEach(a => {
    const pOK = activeAlloggiPrice === 'all' || getFasciaAlloggio(a.prezzo) === activeAlloggiPrice;
    const cityOK = cA === 'tutte' || a.loc === cA;
    const tipoOK = activeAlloggiTipo === 'tutti' || a.tipo === activeAlloggiTipo;
    const tOK = !qA || (a.name+(a.desc||'')+a.loc).toLowerCase().includes(qA);
    if(pOK && cityOK && tipoOK && tOK && a.coords) {
      const col = TIPO_COLOR[a.tipo] || '#0d4f6e';
      const ic  = TIPO_ICON[a.tipo]  || '🏨';
      const icon = L.divIcon({className:'marker-icon-custom',
        html:`<div style="background:${col};color:#fff;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:14px;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3);cursor:pointer;transition:all 0.3s">${ic}</div>`,
        iconSize:[28,28], iconAnchor:[14,14]});
      const m = L.marker(a.coords, {icon});
      m.on('click', () => handleCardClick(a.name, 'alloggio', a.coords));
      markerClusterGroup.addLayer(m);
      allMarkers.push(m);
      visibleCount++;
    }
  });

  document.getElementById('stat-visible').textContent = visibleCount;
}

function getFasciaAlloggio(p) {
  if (p < 60) return '€';
  if (p <= 120) return '€€';
  return '€€€';
}

function popolaFiltroCitta(selectId, lista) {
  const el = document.getElementById(selectId);
  if (!el) return;
  const scelto = el.value || 'tutte';
  const citta = [...new Set(lista.map(x => x.loc).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, 'it'));
  el.innerHTML = '<option value="tutte">📍 Tutte le città</option>' +
    citta.map(x => `<option value="${sanitize(x)}">${sanitize(x)}</option>`).join('');
  el.value = (scelto === 'tutte' || citta.includes(scelto)) ? scelto : 'tutte';
}

function showInfoByName(name, type) {
  let p = null;
  if(type === 'luogo') p = LUOGHI.find(x => x.name === name);
  if(type === 'trekking') p = SENTIERI.find(x => x.name === name);
  if(type === 'ristorante') p = RISTORANTI.find(x => x.name === name);
  if(type === 'alloggio') p = ALLOGGI_CONSIGLIATI.find(x => x.name === name);
  if(!p) return;

  document.getElementById('info-name').textContent = p.name;
  document.getElementById('info-desc').textContent = p.desc || '';
  
  const bd = document.getElementById('info-badges');
  bd.innerHTML = `<span class="badge cat-${p.cat||'alloggio'}">${p.cat||p.tipo}</span>`;
  if(p.km) bd.innerHTML += `<span class="badge">📏 ${p.km} km</span><span class="badge">⏱ ${p.h}</span>`;
  if(p.price) bd.innerHTML += `<span class="badge">${p.price}</span>`;
  if(p.prezzo) bd.innerHTML += `<span class="badge">€${p.prezzo} / Notte</span>`;
  if(p.voto) bd.innerHTML += `<span class="badge">⭐ ${p.voto}</span>`;
  if(p.loc) bd.innerHTML += `<span class="badge">📍 ${p.loc}</span>`;
  
  const ex = document.getElementById('info-extra');
  ex.innerHTML = '';
  if(p.start) ex.innerHTML += `<p style="font-size:12px;color:var(--muted);margin-top:4px">🚩 Partenza: ${p.start}</p>`;
  if(p.cucina) ex.innerHTML += `<p style="font-size:12px;color:var(--muted);margin-top:4px">🍴 Cucina: ${p.cucina}</p>`;

  if(type === 'ristorante'){
    if(p.piatto){
      ex.innerHTML += `
      <div style="margin-top:10px;padding:10px;background:#fff7e8;border:1px solid #f0d18a;border-radius:10px">
        <div style="font-weight:700;font-size:13px;margin-bottom:4px">🍝 Piatto tipico</div>
        <div style="font-size:13px;color:#444">${p.piatto}</div>
      </div>`;
    }
    const btnHtml = `
    <button class="btn"
      style="background:linear-gradient(135deg,#8d6e63,#5d4037);
      color:#fff;margin-top:10px;width:100%;
      font-size:13px;padding:10px;border:1px solid #795548;
      box-shadow:0 2px 8px rgba(93,64,55,.3)"
      data-n="${p.name}"
      data-l="${p.loc||''}"
      data-c="${p.cucina||''}"
      onclick="chiediSommelierAI(this.dataset.n, this.dataset.l, this.dataset.c)">
      🧑‍🍳 Cosa ordino qui? (Consiglio AI)
    </button>`;
    ex.innerHTML += btnHtml;
  }

  const webBtnEl = document.getElementById('info-web-btn');
  webBtnEl.innerHTML = '';
  const sitoUfficiale = safeUrl(p.url || p.web || '');
  if (sitoUfficiale) {
    webBtnEl.innerHTML = `<a href="${sanitize(sitoUfficiale)}" target="_blank" rel="noopener noreferrer" class="btn" style="background:var(--sky);color:#fff;display:inline-block;text-decoration:none">🌐 Sito Web</a>`;
  } else {
    const q = encodeURIComponent(`${p.name} ${p.loc || ''} Gargano`.trim().replace(/\s+/g, ' '));
    webBtnEl.innerHTML = `<a href="https://www.google.com/search?q=${q}" target="_blank" rel="noopener noreferrer" class="btn" style="background:var(--muted);color:#fff;display:inline-block;text-decoration:none">🔍 Cerca online</a>`;
  }

  renderRatingBtns(document.getElementById('info-rating'), name);
  
  const meteoEl = document.getElementById('info-meteo');
  const btnGoogle = document.getElementById('btn-naviga-google');
  
  if (p.coords) {
    const lat = Array.isArray(p.coords[0]) ? p.coords[0][0] : p.coords[0];
    const lon = Array.isArray(p.coords[0]) ? p.coords[0][1] : p.coords[1];
    meteoEl.innerHTML = '<span style="opacity:.6">⏳ Meteo in carico…</span>';
    fetchMeteo(lat, lon, meteoEl);
    btnGoogle.href = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
    btnGoogle.style.display = 'inline-block';
  } else {
    meteoEl.innerHTML = '';
    btnGoogle.style.display = 'none';
  }

  const addRouteBtn = document.getElementById('btn-add-current-route');
  addRouteBtn.onclick = () => addPopupToRouteByName(p.name, type);

  const infoAddRoute = document.getElementById('info-add-route');
  let checkinBtn = document.getElementById('btn-checkin');
  if(!checkinBtn) {
    checkinBtn = document.createElement('button');
    checkinBtn.id = 'btn-checkin';
    checkinBtn.className = 'btn checkin-btn';
    infoAddRoute.appendChild(checkinBtn);
  }
  
  if (CHECKINS.includes(p.name)) {
    checkinBtn.innerHTML = '✅ Visitato';
    checkinBtn.disabled = true;
    checkinBtn.onclick = null;
  } else {
    checkinBtn.innerHTML = '📍 Fai Check-in';
    checkinBtn.disabled = false;
    checkinBtn.onclick = () => eseguiCheckIn(p.name, p.coords);
  }

  const oldAudioBtn = document.getElementById('btn-audioguida');
  if (oldAudioBtn) oldAudioBtn.remove();

  let aiToggleWrapper = document.getElementById('ai-toggle-wrapper');
  if (!aiToggleWrapper) {
      aiToggleWrapper = document.createElement('div');
      aiToggleWrapper.id = 'ai-toggle-wrapper';
      aiToggleWrapper.style.cssText = "width:100%; margin-top:10px; background:#eef5f0; border-radius:8px; display:flex; border:1px solid #c8e0d0; overflow:hidden;";
      
      const labelDiv = document.createElement('div');
      labelDiv.style.cssText = "padding:8px 12px; background:var(--sage); color:#fff; font-size:12px; font-weight:700; display:flex; align-items:center; justify-content:center;";
      labelDiv.innerHTML = "✨ Guida AI";
      
      const btnAudio = document.createElement('button');
      btnAudio.id = 'btn-ai-audio';
      btnAudio.style.cssText = "flex:1; border:none; border-left:1px solid #c8e0d0; background:transparent; padding:8px; font-size:12px; font-weight:600; color:var(--forest); cursor:pointer; transition:background 0.2s;";
      
      const btnTesto = document.createElement('button');
      btnTesto.id = 'btn-ai-testo';
      btnTesto.style.cssText = "flex:1; border:none; border-left:1px solid #c8e0d0; background:transparent; padding:8px; font-size:12px; font-weight:600; color:var(--forest); cursor:pointer; transition:background 0.2s;";
      
      aiToggleWrapper.appendChild(labelDiv);
      aiToggleWrapper.appendChild(btnAudio);
      aiToggleWrapper.appendChild(btnTesto);
      infoAddRoute.appendChild(aiToggleWrapper);
  }

  const btnAudio = document.getElementById('btn-ai-audio');
  const btnTesto = document.getElementById('btn-ai-testo');
  btnAudio.innerHTML = "🎧 Ascolta";
  btnTesto.innerHTML = "📄 Leggi";
  btnAudio.style.background = 'transparent';
  btnTesto.style.background = 'transparent';
  
  btnAudio.onclick = () => richiediGuidaAI(p.name, type, 'audio');
  btnTesto.onclick = () => richiediGuidaAI(p.name, type, 'testo');

  let aiResultBox = document.getElementById('info-ai-result');
  if(!aiResultBox) {
      aiResultBox = document.createElement('div');
      aiResultBox.id = 'info-ai-result';
      aiResultBox.style.cssText = "margin-top:10px; font-size:13px; color:var(--text); background:#f4f8fb; padding:12px; border-radius:8px; border-left:4px solid var(--sage); display:none; line-height:1.5;";
      document.getElementById('info-panel').appendChild(aiResultBox);
  }
  aiResultBox.style.display = 'none';
  aiResultBox.innerHTML = '';

  let altimetriaEl = document.getElementById('info-altimetria');
  if(!altimetriaEl) {
    altimetriaEl = document.createElement('div');
    altimetriaEl.id = 'info-altimetria';
    altimetriaEl.style.cssText = "margin-top:8px;font-size:12px;color:var(--forest);background:#eef5f0;padding:8px;border-radius:8px;display:none;border-left:3px solid var(--sage)";
    document.getElementById('info-extra').parentNode.insertBefore(altimetriaEl, document.getElementById('info-add-route'));
  }
  if(type === 'trekking' && p.coords) {
     altimetriaEl.style.display = 'block';
     fetchElevationProfile(p.coords, altimetriaEl);
  } else {
     altimetriaEl.style.display = 'none';
  }

  document.getElementById('info-panel').classList.add('open');
  if(window.innerWidth<768){
    document.getElementById('chat-widget').style.display='none';
    toggleSidebar();
  }
}

// ═══════════════════════════════════════════════════════════
// METEO
// ═══════════════════════════════════════════════════════════
const WMO = {0:'☀️ Sereno',1:'🌤 Quasi sereno',2:'⛅ Parzialmente nuvoloso',3:'☁️ Nuvoloso',51:'🌦 Pioggerella',61:'🌧 Pioggia',71:'🌨 Neve',95:'⛈ Temporale'};
async function fetchMeteo(lat, lon, el) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode,windspeed_10m&wind_speed_unit=kmh&timezone=Europe%2FRome`;
    const r = await fetchTimeout(url);
    const d = await r.json();
    const c = d.current;
    const desc = WMO[c.weathercode] || '🌡 Meteo';
    el.innerHTML = `${desc}  ·  <b>${Math.round(c.temperature_2m)}°C</b>  ·  💨 ${Math.round(c.windspeed_10m)} km/h`;
  } catch(e) { el.innerHTML = ''; }
}

// ═══════════════════════════════════════════════════════════
// PERCORSO
// ═══════════════════════════════════════════════════════════
function distanzaKm(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) return 0;
  const toRad = d => d * Math.PI / 180;
  const R = 6371;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const s = Math.sin(dLat/2)**2 + Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng/2)**2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}

function addPopupToRouteByName(name, type) {
  let p = null;
  if(type === 'luogo') p = LUOGHI.find(x => x.name === name);
  if(type === 'trekking') p = SENTIERI.find(x => x.name === name);
  if(type === 'ristorante') p = RISTORANTI.find(x => x.name === name);
  if(type === 'alloggio') p = ALLOGGI_CONSIGLIATI.find(x => x.name === name);
  if(!p || !p.coords) return;
  const c = Array.isArray(p.coords[0]) ? p.coords[0] : p.coords;
  currentRouteCoords.push(c);
  currentRouteNames.push(p.name);
  drawRoute();
  showToast(`"${p.name}" aggiunto al percorso`);
}

function fetchRouteOSRM(latlngs) {
  const coordStr = latlngs.map(c => `${c[1]},${c[0]}`).join(';');
  const servers = [
    `https://router.project-osrm.org/route/v1/driving/${coordStr}`,
    `https://routing.openstreetmap.de/routed-car/route/v1/driving/${coordStr}`
  ];
  const tryServer = async (base) => {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 6000);
    try {
      const r = await fetch(`${base}?overview=full&geometries=geojson`, { signal: ctrl.signal });
      if (!r.ok) return null;
      const d = await r.json();
      const route = d.routes && d.routes[0];
      if (!route || !route.geometry) return null;
      return { line: route.geometry.coordinates.map(p => [p[1], p[0]]), km: route.distance / 1000 };
    } catch (e) { return null; }
    finally { clearTimeout(tid); }
  };
  return (async () => {
    for (const base of servers) { const res = await tryServer(base); if (res) return res; }
    return null;
  })();
}

function drawRoute(){
  if(routeLine) map.removeLayer(routeLine);
  if(currentRouteCoords.length < 2){
    document.getElementById('route-info').textContent=''; 
    document.getElementById('btn-share-route').style.display='none';
    return;
  }
  const gen = ++_routeGen;
  const coordsSnap = currentRouteCoords.slice();
  const nTappe = currentRouteNames.length;
  const info = document.getElementById('route-info');
  routeLine = L.polyline(coordsSnap,{color:'#c9a84c',weight:4,dashArray:'8,4'}).addTo(map);
  map.fitBounds(routeLine.getBounds().pad(0.1));
  let dist=0;
  for(let i=1;i<coordsSnap.length;i++) dist += map.distance(coordsSnap[i-1],coordsSnap[i])/1000;
  info.textContent=`🛣 Percorso: ${nTappe} tappe · ${dist.toFixed(1)} km`;
  document.getElementById('btn-share-route').style.display='inline-block';
  fetchRouteOSRM(coordsSnap).then(res => {
    if (gen !== _routeGen || !res) return;
    if (routeLine) map.removeLayer(routeLine);
    routeLine = L.polyline(res.line,{color:'#c9a84c',weight:4}).addTo(map);
    info.textContent=`🛣 Percorso: ${nTappe} tappe · ${res.km.toFixed(1)} km`;
  });
}

function clearRoute(){
  _routeGen++;
  currentRouteCoords = []; currentRouteNames = [];
  if(routeLine) map.removeLayer(routeLine);
  document.getElementById('route-info').textContent = '';
  document.getElementById('btn-share-route').style.display = 'none';
  updateMap();
  showToast('Percorso resettato');
}

function condividiPercorso() {
  if (!currentRouteNames.length) return;
  let dist = 0;
  for (let i = 1; i < currentRouteCoords.length; i++) dist += map.distance(currentRouteCoords[i-1], currentRouteCoords[i]) / 1000;
  const tappe = currentRouteNames.map((n,i) => `📍 Tappa ${i+1}: ${n}`).join('\n');
  const testo = `🗺 *Itinerario Gargano*\n${tappe}\n📏 Distanza: ~${dist.toFixed(1)} km\n🌐 gargano-turismo.app`;
  window.open('https://wa.me/?text=' + encodeURIComponent(testo), '_blank');
}

function fitAll() {
  if (allMarkers.length === 0) return;
  const group = new L.featureGroup(allMarkers);
  map.fitBounds(group.getBounds().pad(0.1));
}

// ═══════════════════════════════════════════════════════════
// TABS & PANNELLI
// ═══════════════════════════════════════════════════════════
function switchTab(tab){
  document.querySelectorAll('.tab').forEach((t,i)=>{
    const tabs=['luoghi','trekking','ristoranti','alloggi','eventi','itinerari'];
    t.classList.toggle('active',tabs[i]===tab);
  });
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
  document.getElementById('panel-'+tab).classList.add('active');
  
  if(tab==='luoghi') renderLuoghi();
  else if(tab==='trekking') renderTrek();
  else if(tab==='ristoranti') renderRest();
  else if(tab==='alloggi') renderAlloggi();
  else if(tab==='eventi') renderEventi();
  else if(tab==='itinerari') renderItinerari();
  
  updateMap();
}

function filterLuoghi() { renderLuoghi(); updateMap(); }
function filterTrek() { renderTrek(); updateMap(); }
function filterRest() { renderRest(); updateMap(); }
function filterAlloggi() { renderAlloggi(); updateMap(); }

function debounce(fn, ms = 200) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }
window.filterLuoghiD = debounce(filterLuoghi);
window.filterTrekD = debounce(filterTrek);
window.filterRestD = debounce(filterRest);
window.filterAlloggiD = debounce(filterAlloggi);

const CATS_LUOGHI=[
  {id:'tutte',label:'Tutte'}, {id:'borgo',label:'🏘 Borghi'}, {id:'cultura',label:'🏛 Cultura'}, 
  {id:'natura',label:'🌿 Natura'}, {id:'montagna',label:'🏖 Mare'}, {id:'religioso',label:'⛪ Religioso'}, 
  {id:'sport',label:'⚽ Sport'}, {id:'gastronomia',label:'🍇 Gastronomia'}, {id:'scienza',label:'🔭 Scienza'}, 
  {id:'artigianato',label:'🪵 Artigianato'}, {id:'agriturismo',label:'🌾 Agriturismo'}
];
let activeLuoghiCats = new Set(['tutte']);
const flEl = document.getElementById('filter-luoghi');
if (flEl) {
  CATS_LUOGHI.forEach(c => {
    const el = document.createElement('span');
    el.className = 'chip' + (c.id==='tutte'?' active':'');
    el.textContent = c.label;
    el.dataset.id = c.id;
    el.onclick = () => {
      if(c.id === 'tutte'){
        activeLuoghiCats = new Set(['tutte']);
        flEl.querySelectorAll('.chip').forEach(x=>x.classList.toggle('active',x.dataset.id==='tutte'));
      } else {
        activeLuoghiCats.delete('tutte');
        if(activeLuoghiCats.has(c.id)) activeLuoghiCats.delete(c.id); else activeLuoghiCats.add(c.id);
        if(activeLuoghiCats.size===0) activeLuoghiCats.add('tutte');
        flEl.querySelectorAll('.chip').forEach(x=>x.classList.toggle('active', activeLuoghiCats.has(x.dataset.id)));
      }
      renderLuoghi(); updateMap();
    };
    flEl.appendChild(el);
  });
}

function renderLuoghi(){
  const q = document.getElementById('search-luoghi').value.toLowerCase();
  const filtered = LUOGHI.filter(p => {
    const catOK = activeLuoghiCats.has('tutte') || activeLuoghiCats.has(p.cat);
    const txtOK = !q || (p.name+p.desc+p.cat).toLowerCase().includes(q);
    return catOK && txtOK;
  });
  const list = document.getElementById('list-luoghi');
  list.innerHTML = '';
  document.getElementById('count-luoghi').textContent = `${filtered.length} luoghi`;
  
  filtered.forEach(p => {
    const d = document.createElement('div');
    d.className = 'list-card';
    d.dataset.name = p.name;
    const rv = VALUTAZIONI[p.name] || '';
    d.innerHTML = `<h3>${sanitize(p.name)}
      ${p.pop?'<span class="badge" style="background:#fff3cd;color:#856404;margin-left:5px">⭐ Pop</span>':''}
      ${p.custom?'<span class="badge" style="background:#e8f0fe;color:#1565c0;margin-left:5px">✏️ Mio</span>':''}
      ${rv?`<span style="margin-left:4px;font-size:14px">${rv}</span>`:''}
    </h3>
    <div class="badge-row"><span class="badge cat-${p.cat}">${p.cat}</span></div>
    <p>${sanitize(p.desc)}</p>
    <div style="display:flex;gap:6px;margin-top:7px;flex-wrap:wrap">
      <button data-n="${p.name}" onclick="event.stopPropagation(); showInfoByName(this.dataset.n, 'luogo')" style="font-size:11px;background:var(--sky);color:#fff;border:none;border-radius:6px;padding:3px 10px;cursor:pointer;font-weight:600">🔍 Dettagli</button>
      <button data-n="${p.name}" onclick="event.stopPropagation(); eliminaLuogoCustom(this.dataset.n)" style="font-size:11px;background:#c62828;color:#fff;border:none;border-radius:6px;padding:3px 8px;cursor:pointer;font-weight:600">🗑 Rimuovi</button>
    </div>`;
    d.onclick = () => handleCardClick(p.name, 'luogo', p.coords);
    list.appendChild(d);
  });
}

function salvaLuogo() {
  const nome = document.getElementById('luogo-nome').value.trim();
  const cat  = document.getElementById('luogo-cat').value;
  const desc = document.getElementById('luogo-desc').value.trim() || 'Luogo aggiunto.';
  const lat  = parseFloat(document.getElementById('luogo-lat').value);
  const lng  = parseFloat(document.getElementById('luogo-lng').value);
  if (!nome || isNaN(lat) || isNaN(lng)) { showToast('Compila nome e coordinate!'); return; }
  const nuovo = { name: nome, cat, coords: [lat, lng], desc, pop: false, custom: true };
  LUOGHI_CUSTOM.push(nuovo); LUOGHI.push(nuovo);
  saveData('gargano_luoghi_custom', LUOGHI_CUSTOM);
  closeModal('luogo-modal'); renderLuoghi(); updateMap(); showToast(`"${nome}" aggiunto! ✅`);
}

function eliminaLuogoCustom(name) {
  LUOGHI_CUSTOM = LUOGHI_CUSTOM.filter(x => x.name !== name);
  const idx = LUOGHI.findIndex(x => x.name === name); if(idx > -1) LUOGHI.splice(idx, 1);
  saveData('gargano_luoghi_custom', LUOGHI_CUSTOM);
  renderLuoghi(); updateMap(); showToast("Luogo rimosso");
}

let activeDiff = 'tutte';
function setDiff(el){
  activeDiff = el.dataset.diff;
  document.querySelectorAll('#filter-diff .chip').forEach(c=>c.classList.toggle('active',c.dataset.diff===activeDiff));
  renderTrek(); updateMap();
}
function renderTrek(){
  const q = document.getElementById('search-trek').value.toLowerCase();
  const DIFF_ORDER={'F':1,'M':2,'D':3,'E':4};
  const filtered = SENTIERI.filter(s => {
    const dOK = activeDiff === 'tutte' || s.diff === activeDiff;
    const tOK = !q || (s.name+s.desc+s.start).toLowerCase().includes(q);
    const visOK = s.custom || !SENTIERI_NASCOSTI.includes(s.name);
    return dOK && tOK && visOK;
  }).sort((a,b)=>(DIFF_ORDER[a.diff]||9)-(DIFF_ORDER[b.diff]||9));
  
  const list = document.getElementById('list-trek');
  list.innerHTML = '';
  document.getElementById('count-trek').textContent = `${filtered.length} sentieri`;
  
  const ripEl = document.getElementById('trek-ripristina');
  ripEl.style.display = SENTIERI_NASCOSTI.length > 0 ? 'inline' : 'none';
  ripEl.textContent = `↩ Ripristina ${SENTIERI_NASCOSTI.length} rimoss${SENTIERI_NASCOSTI.length===1?'o':'i'}`;
  
  filtered.forEach(s => {
    const d = document.createElement('div');
    d.className = 'list-card';
    d.dataset.name = s.name;
    d.innerHTML = `<h3>${sanitize(s.name)} ${s.custom ? '<span class="badge" style="background:#e8f0fe;color:#1565c0;margin-left:5px">✏️ Mio</span>' : ''}</h3>
      <div class="badge-row">
        <span class="badge diff-${s.diff}">${s.diff==='F'?'🟢 Facile':s.diff==='M'?'🟡 Medio':s.diff==='D'?'🔴 Difficile':'⚫ Esperto'}</span>
        <span class="badge">📏 ${s.km} km</span><span class="badge">⏱ ${s.h}</span>
      </div>
      <p>🚩 ${sanitize(s.start)} · ${sanitize(s.desc)}</p>
      <div style="display:flex;gap:6px;margin-top:7px;flex-wrap:wrap">
        ${s.url ? `<button data-u="${s.url}" onclick="event.stopPropagation(); window.open(this.dataset.u,'_blank')" style="font-size:11px;background:#00b562;color:#fff;border:none;border-radius:6px;padding:3px 10px;cursor:pointer;font-weight:600">🌐 Web</button>` : ''}
        ${s.custom
          ? `<button data-n="${s.name}" onclick="event.stopPropagation(); eliminaSentieroCustom(this.dataset.n)" style="font-size:11px;background:transparent;border:1px solid #ddd;border-radius:6px;padding:3px 8px;cursor:pointer;color:var(--rust)">🗑 Rimuovi</button>`
          : `<button data-n="${s.name}" onclick="event.stopPropagation(); nascondiSentiero(this.dataset.n)" style="font-size:11px;background:transparent;border:1px solid #ddd;border-radius:6px;padding:3px 8px;cursor:pointer;color:var(--rust)">🗑 Rimuovi</button>`
        }
      </div>`;
    d.onclick = () => { if(s.coords && s.coords.length > 0) handleCardClick(s.name, 'trekking', s.coords); };
    list.appendChild(d);
  });
}
function salvaSentiero() {
  if (SENTIERI_CUSTOM.length >= 6) { showToast('Limite di 6 sentieri raggiunto.'); return; }
  const nome  = sanitize(document.getElementById('trek-nome').value.trim());
  const diff  = document.getElementById('trek-diff').value;
  const km    = parseFloat(document.getElementById('trek-km').value) || 0;
  const h     = sanitize(document.getElementById('trek-h').value.trim()) || '–';
  const start = sanitize(document.getElementById('trek-start').value.trim()) || '–';
  const desc  = sanitize(document.getElementById('trek-desc').value.trim());
  const url   = sanitize(document.getElementById('trek-url').value.trim());
  const lat   = parseFloat(document.getElementById('trek-lat').value);
  const lng   = parseFloat(document.getElementById('trek-lng').value);
  if (!nome || isNaN(lat) || isNaN(lng)) { showToast('Compila nome e coordinate!'); return; }
  const nuovo = { name:nome, diff, km, h, start, desc, url, coords:[[lat,lng]], custom:true };
  SENTIERI_CUSTOM.push(nuovo); SENTIERI.push(nuovo);
  saveData('gargano_sentieri_custom', SENTIERI_CUSTOM);
  closeModal('sentiero-modal'); renderTrek(); updateMap(); showToast(`"${nome}" aggiunto! ✅`);
}
function nascondiSentiero(name) {
  if (!SENTIERI_NASCOSTI.includes(name)) SENTIERI_NASCOSTI.push(name);
  saveData('gargano_sentieri_nascosti', SENTIERI_NASCOSTI);
  renderTrek(); updateMap(); showToast(`Sentiero nascosto`);
}
function ripristinaSentieri() {
  SENTIERI_NASCOSTI = [];
  saveData('gargano_sentieri_nascosti', []);
  renderTrek(); updateMap(); showToast('Sentieri ripristinati');
}
function eliminaSentieroCustom(name) {
  SENTIERI_CUSTOM = SENTIERI_CUSTOM.filter(x => x.name !== name);
  const idx = SENTIERI.findIndex(x => x.name === name); if(idx > -1) SENTIERI.splice(idx, 1);
  saveData('gargano_sentieri_custom', SENTIERI_CUSTOM);
  renderTrek(); updateMap(); showToast("Sentiero rimosso");
}

let activePriceF = 'all';
function setPriceFilter(el){
  activePriceF = el.dataset.p;
  document.querySelectorAll('#filter-rest-price .star-chip').forEach(c=>c.classList.toggle('active',c.dataset.p===activePriceF));
  renderRest(); updateMap();
}
function renderRest(){
  popolaFiltroCitta('filter-rest-city', RISTORANTI.filter(r => !(RISTORANTI_NASCOSTI.has(r.name) && !r.custom)));
  const q = document.getElementById('search-rest').value.toLowerCase();
  const c = document.getElementById('filter-rest-city').value;
  const filtered = RISTORANTI.filter(r => {
    if (RISTORANTI_NASCOSTI.has(r.name) && !r.custom) return false;
    const pOK = activePriceF === 'all' || r.price === activePriceF;
    const cityOK = c === 'tutte' || r.loc === c;
    const tOK = !q || (r.name+r.desc+r.cucina+r.loc).toLowerCase().includes(q);
    return pOK && cityOK && tOK;
  });
  
  const list = document.getElementById('list-rest');
  list.innerHTML = '';
  document.getElementById('count-rest').textContent = `${filtered.length} ristoranti`;
  
  filtered.forEach(r => {
    const d = document.createElement('div');
    d.className = 'list-card';
    d.dataset.name = r.name;
    d.innerHTML = `<h3>${sanitize(r.name)} ${r.custom ? '<span class="badge" style="background:#e8f0fe;color:#1565c0;margin-left:5px">✏️ Mio</span>' : ''}</h3>
      <div class="badge-row">
        <span class="badge cat-ristorante">${r.cat}</span>
        <span class="badge">${r.price}</span>
        ${r.voto ? `<span class="badge">⭐ ${r.voto}</span>` : ''}
        <span class="badge">📍 ${sanitize(r.loc)}</span>
      </div>
      <p>${sanitize(r.cucina)} · ${sanitize(r.desc)}</p>
      <div style="display:flex;gap:6px;margin-top:7px;flex-wrap:wrap">
        ${r.custom 
          ? `<button data-n="${r.name}" onclick="event.stopPropagation(); eliminaRistoranteCustom(this.dataset.n)" style="font-size:11px;background:transparent;border:1px solid #ddd;border-radius:6px;padding:3px 8px;cursor:pointer;color:var(--rust)">🗑 Rimuovi</button>` 
          : `<button data-n="${r.name}" onclick="event.stopPropagation(); nascondiRistorante(this.dataset.n)" style="font-size:11px;background:transparent;border:1px solid #ddd;border-radius:6px;padding:3px 8px;cursor:pointer;color:var(--rust)">🗑 Rimuovi</button>`}
      </div>`;
    d.onclick = () => handleCardClick(r.name, 'ristorante', r.coords);
    list.appendChild(d);
  });
}
function salvaRistorante() {
  const name  = document.getElementById('rist-nome').value.trim();
  const loc   = document.getElementById('rist-loc').value.trim();
  const cat   = document.getElementById('rist-cat').value;
  const price = document.getElementById('rist-price').value;
  const cucina= document.getElementById('rist-cucina').value.trim();
  const desc  = document.getElementById('rist-desc').value.trim();
  const web   = sanitize(document.getElementById('rist-web').value.trim());
  const lat   = parseFloat(document.getElementById('rist-lat').value);
  const lng   = parseFloat(document.getElementById('rist-lng').value);
  if (!name || !loc || isNaN(lat) || isNaN(lng)) { showToast('Compila nome, città e coordinate!'); return; }
  const nuovo = { name, loc, cat, price, cucina, desc, web, coords:[lat,lng], custom:true };
  RISTORANTI_CUSTOM.push(nuovo); RISTORANTI.push(nuovo);
  saveData('gargano_ristoranti_custom', RISTORANTI_CUSTOM);
  closeModal('ristorante-modal'); renderRest(); updateMap(); showToast(`"${name}" aggiunto! ✅`);
}
function nascondiRistorante(name) {
  RISTORANTI_NASCOSTI.add(name);
  saveData('gargano_ristoranti_nascosti', [...RISTORANTI_NASCOSTI]);
  renderRest(); updateMap(); showToast("Ristorante nascosto");
}
function eliminaRistoranteCustom(name) {
  RISTORANTI_CUSTOM = RISTORANTI_CUSTOM.filter(x => x.name !== name);
  const idx = RISTORANTI.findIndex(x => x.name === name); if(idx > -1) RISTORANTI.splice(idx, 1);
  saveData('gargano_ristoranti_custom', RISTORANTI_CUSTOM);
  renderRest(); updateMap(); showToast("Ristorante rimosso");
}
function openTripAdvisor() {
  const city = document.getElementById('filter-rest-city').value;
  if (city === 'tutte') { showToast('Seleziona prima una città!'); return; }
  const taCat = document.getElementById('filter-ta-cat').value;
  const query = city + ' ristoranti Gargano ' + (taCat ? ' categoria' : '');
  window.open('https://www.tripadvisor.it/Search?q=' + encodeURIComponent(query), '_blank');
}

let activeAlloggiTipo = 'tutti';
let activeAlloggiPrice = 'all';
function setAlloggiTipo(el){
  activeAlloggiTipo = el.dataset.tipo;
  document.querySelectorAll('#filter-alloggi-tipo .chip').forEach(c=>c.classList.toggle('active',c.dataset.tipo===activeAlloggiTipo));
  renderAlloggi(); updateMap();
}
function setAlloggiPriceFilter(el){
  activeAlloggiPrice = el.dataset.p;
  document.querySelectorAll('#filter-alloggi-price .star-chip').forEach(c=>c.classList.toggle('active',c.dataset.p===activeAlloggiPrice));
  renderAlloggi(); updateMap();
}
function renderAlloggi(){
  popolaFiltroCitta('filter-alloggi-city', ALLOGGI_CONSIGLIATI);
  const q = document.getElementById('search-alloggi').value.toLowerCase();
  const c = document.getElementById('filter-alloggi-city').value;
  const filtered = ALLOGGI_CONSIGLIATI.filter(a => {
    const pOK = activeAlloggiPrice === 'all' || getFasciaAlloggio(a.prezzo) === activeAlloggiPrice;
    const cityOK = c === 'tutte' || a.loc === c;
    const tipoOK = activeAlloggiTipo === 'tutti' || a.tipo === activeAlloggiTipo;
    const tOK = !q || (a.name+(a.desc||'')+a.loc).toLowerCase().includes(q);
    return pOK && cityOK && tipoOK && tOK;
  });
  
  const list = document.getElementById('list-alloggi');
  list.innerHTML = '';
  document.getElementById('count-alloggi').textContent = `${filtered.length} alloggi locali`;

  const nascostiCount = ALLOGGI_DEFAULT.length - ALLOGGI_CONSIGLIATI.filter(a => ALLOGGI_DEFAULT.some(d => d.name === a.name)).length;
  let ripEl = document.getElementById('rip-alloggi-btn');
  if (!ripEl) {
    ripEl = document.createElement('button');
    ripEl.id = 'rip-alloggi-btn';
    ripEl.className = 'btn btn-outline';
    ripEl.style.cssText = 'font-size:11px;margin-bottom:8px;width:100%';
    ripEl.onclick = ripristinaAlloggi;
    list.parentNode.insertBefore(ripEl, list);
  }
  ripEl.style.display = nascostiCount > 0 ? 'block' : 'none';
  if (nascostiCount > 0) ripEl.textContent = `↩ Ripristina ${nascostiCount} rimoss${nascostiCount===1?'o':'i'}`;
  
  filtered.forEach((a) => {
    const d = document.createElement('div');
    d.className = 'list-card';
    d.dataset.name = a.name;
    d.style.borderLeft = `4px solid ${TIPO_COLOR[a.tipo]||'#000'}`;
    d.innerHTML = `<h3>${sanitize(a.name)}</h3>
      <div class="badge-row">
        <span class="badge" style="background:#e8f4fd;color:#003580">${a.tipo}</span>
        <span class="badge">€${a.prezzo} / notte</span>
        ${a.voto ? `<span class="badge">⭐ ${a.voto}</span>` : ''}
        <span class="badge">📍 ${sanitize(a.loc)}</span>
      </div>
      <p>${sanitize(a.desc||'')}</p>
      <div style="display:flex;gap:6px;margin-top:7px;flex-wrap:wrap;justify-content:flex-end">
        <button data-n="${a.name}" onclick="event.stopPropagation(); eliminaAlloggioConsigliato(this.dataset.n)" style="font-size:11px;background:transparent;border:1px solid #ddd;border-radius:6px;padding:3px 8px;cursor:pointer;color:var(--rust)">🗑 Rimuovi</button>
      </div>`;
    d.onclick = () => handleCardClick(a.name, 'alloggio', a.coords);
    list.appendChild(d);
  });
}
function salvaAlloggio() {
  const name   = sanitize(document.getElementById('alloggio-nome').value.trim());
  const loc    = sanitize(document.getElementById('alloggio-loc').value.trim());
  const tipo   = document.getElementById('alloggio-form-tipo').value;
  const prezzo = parseFloat(document.getElementById('alloggio-prezzo').value);
  const voto   = sanitize(document.getElementById('alloggio-voto').value.trim()) || '8.5';
  const desc   = sanitize(document.getElementById('alloggio-desc').value.trim());
  const url    = sanitize(document.getElementById('alloggio-url').value.trim());
  const lat    = parseFloat(document.getElementById('alloggio-lat').value);
  const lng    = parseFloat(document.getElementById('alloggio-lng').value);
  if (!name || !loc || isNaN(prezzo) || isNaN(lat) || isNaN(lng)) { showToast('Compila nome, città, prezzo e coordinate!'); return; }
  const nuovo = { name, loc, tipo, prezzo, voto, desc, url, coords:[lat,lng], custom: true };
  ALLOGGI_CUSTOM.push(nuovo);
  ALLOGGI_CONSIGLIATI.unshift(nuovo);
  saveData('gargano_alloggi_custom', ALLOGGI_CUSTOM);
  closeModal('alloggio-modal'); renderAlloggi(); updateMap(); showToast(`"${name}" aggiunto! ✅`);
}
async function eliminaAlloggioConsigliato(name) {
  const isDefault = ALLOGGI_DEFAULT.some(x => x.name === name);
  if (isDefault) {
    const nascosti = await safeParse('gargano_alloggi_nascosti', []);
    if (!nascosti.includes(name)) {
      nascosti.push(name);
      await saveData('gargano_alloggi_nascosti', nascosti);
    }
  }
  ALLOGGI_CUSTOM = ALLOGGI_CUSTOM.filter(x => x.name !== name);
  await saveData('gargano_alloggi_custom', ALLOGGI_CUSTOM);
  const idx = ALLOGGI_CONSIGLIATI.findIndex(x => x.name === name);
  if (idx > -1) ALLOGGI_CONSIGLIATI.splice(idx, 1);
  renderAlloggi(); updateMap(); showToast("Alloggio rimosso");
}

async function ripristinaAlloggi() {
  await saveData('gargano_alloggi_nascosti', []);
  await costruisciAlloggi();
  renderAlloggi(); updateMap();
  showToast('Alloggi ripristinati ✅');
}
function cercaAlloggiPartner(portale) {
  let c = document.getElementById('filter-alloggi-city').value;
  let text = document.getElementById('search-alloggi').value.trim();
  let searchLoc = c !== 'tutte' ? c : (text ? text : 'Gargano');
  let url = '';
  if(portale === 'expedia') url = `https://www.expedia.it/Hotel-Search?destination=${encodeURIComponent(searchLoc + ', Puglia, Italia')}`;
  else if(portale === 'booking') url = `https://www.booking.com/searchresults.it.html?ss=${encodeURIComponent(searchLoc + ' Gargano')}`;
  else if(portale === 'airbnb') url = `https://www.airbnb.it/s/${encodeURIComponent(searchLoc + ' Puglia')}/homes`;
  else if(portale === 'tripadvisor') url = `https://www.tripadvisor.it/Search?q=${encodeURIComponent(searchLoc + ' hotel')}&ssrc=h`;
  else if(portale === 'campeggi') url = `https://www.campeggi.com/italia/camping/puglia/foggia`;
  window.open(url, '_blank');
}

function renderEventi() {
  const RICERCHE_RAPIDE = [
    { label:"🎉 Sagre", q:"sagre Gargano" }, { label:"🎵 Concerti", q:"concerti Gargano estate" },
    { label:"⛪ Feste religiose", q:"feste patronali Gargano" }, { label:"🏖 Estate", q:"eventi estivi Gargano" },
    { label:"🍋 Gastronomia", q:"sagre gastronomiche Gargano" }, { label:"🚴 Sport outdoor", q:"eventi sport Gargano trekking" },
    { label:"🎬 Festival", q:"festival Gargano" }, { label:"🌿 Natura", q:"escursioni Parco Nazionale Gargano" }
  ];
  
  const oggi = new Date();
  const mesi = ['gennaio','febbraio','marzo','aprile','maggio','giugno','luglio','agosto','settembre','ottobre','novembre','dicembre'];
  const idxMese = oggi.getDate() > 20 ? (oggi.getMonth() + 1) % 12 : oggi.getMonth();
  const annoMese = (oggi.getDate() > 20 && oggi.getMonth() === 11) ? oggi.getFullYear() + 1 : oggi.getFullYear();
  const meseTesto = mesi[idxMese] + ' ' + annoMese;

  const lbl = document.getElementById('eventi-date-label');
  if(lbl) lbl.textContent = 'Eventi di ' + mesi[oggi.getMonth()] + '–' + mesi[(oggi.getMonth()+1)%12] + ' ' + oggi.getFullYear();

  const el2 = document.getElementById('ricerca-eventi-rapida');
  if(el2) {
    el2.innerHTML = RICERCHE_RAPIDE.map(r => {
      const query = encodeURIComponent(r.q + ' ' + meseTesto);
      return `<a href="https://www.google.com/search?q=${query}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:5px;background:var(--sky);color:#fff;border-radius:20px;padding:7px 14px;font-size:12px;font-weight:600;text-decoration:none;transition:all .2s;white-space:nowrap">${r.label}</a>`;
    }).join('');
  }

  const SOCIAL_EVENTI = [
    { nome: "Facebook", url: 'https://www.google.com/search?q=' + encodeURIComponent('eventi gargano ' + mesi[idxMese] + ' ' + annoMese + ' site:facebook.com'), desc: "Eventi Facebook via Google.", icon: "👥" },
    { nome: "Instagram", url: "https://www.instagram.com/explore/tags/garganoeventi/", desc: "Foto e storie.", icon: "📸" },
    { nome: "Google Maps", url: "https://www.google.com/maps/search/eventi+Gargano/", desc: "Cerca sulla mappa.", icon: "📍" }
  ];
  const el3 = document.getElementById('social-eventi');
  if (el3) {
    el3.innerHTML = SOCIAL_EVENTI.map(s => `
      <a href="${sanitize(safeUrl(s.url))}" target="_blank" rel="noopener noreferrer" style="display:flex;align-items:center;gap:10px;background:#fff;border:1px solid var(--border);border-radius:12px;padding:10px 13px;margin-bottom:8px;text-decoration:none;color:var(--text);transition:all .2s;">
        <span style="font-size:22px">${s.icon}</span>
        <div><div style="font-size:13px;font-weight:600;color:var(--forest)">${s.nome}</div><div style="font-size:11px;color:var(--muted);margin-top:2px">${s.desc}</div></div>
        <span style="margin-left:auto;font-size:13px;color:var(--muted)">↗</span>
      </a>`).join('');
  }
}

function renderItinerari() {
  const list = document.getElementById('list-itin');
  list.innerHTML = '';
  
  const ripEl = document.getElementById('itin-ripristina');
  ripEl.style.display = ITINERARI_NASCOSTI.length > 0 ? 'inline' : 'none';
  ripEl.textContent = `↩ Ripristina ${ITINERARI_NASCOSTI.length} rimoss${ITINERARI_NASCOSTI.length===1?'o':'i'}`;

  ITINERARI_PREDEFINITI.filter(it => !ITINERARI_NASCOSTI.includes(it.name)).forEach(it => {
    const card = document.createElement('div');
    card.className = 'itin-card';
    card.innerHTML = `<h3>${sanitize(it.name)}</h3>
      <div class="itin-meta"><span>⏱ ${it.giorni} gg</span><span>📏 ${it.km} km</span><span>🚩 ${it.tappe.length} tappe</span></div>
      <p>${sanitize(it.desc)}</p>
      <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap">
        <button class="btn" data-n="${it.name}" onclick="loadItinRouteByName(this.dataset.n, false)">🗺 Carica mappa</button>
        <button class="btn" data-n="${it.name}" onclick="stampaItinerarioByName(this.dataset.n, false)" style="background:var(--stone)">🖨 Stampa</button>
        <button data-n="${it.name}" onclick="nascondiItinerario(this.dataset.n)" style="font-size:11px;background:transparent;border:1px solid #ddd;border-radius:6px;padding:3px 8px;cursor:pointer;color:var(--rust)">🗑 Rimuovi</button>
      </div>`;
    list.appendChild(card);
  });

  ITINERARI_CUSTOM.forEach(it => {
    const card = document.createElement('div');
    card.className = 'itin-card'; card.style.borderLeft = '3px solid var(--gold)';
    card.innerHTML = `<h3>⭐ ${sanitize(it.name)}</h3>
      <div class="itin-meta"><span>⏱ ${it.giorni} gg</span><span>📏 ${it.km} km</span><span>🚩 ${it.tappe.length} tappe</span></div>
      <p>${sanitize(it.desc)}</p>
      <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap">
        <button class="btn" data-n="${it.name}" onclick="loadItinRouteByName(this.dataset.n, true)">🗺 Carica mappa</button>
        <button class="btn" data-n="${it.name}" onclick="stampaItinerarioByName(this.dataset.n, true)" style="background:var(--stone)">🖨 Stampa</button>
        <button data-n="${it.name}" onclick="eliminaItinCustom(this.dataset.n)" style="font-size:11px;background:transparent;border:1px solid #ddd;border-radius:6px;padding:3px 8px;cursor:pointer;color:var(--rust)">🗑 Elimina</button>
      </div>`;
    list.appendChild(card);
  });
}
function loadItinRouteByName(name, isCustom) {
  const list = isCustom ? ITINERARI_CUSTOM : ITINERARI_PREDEFINITI;
  const it = list.find(x => x.name === name);
  if(!it) return;
  currentRouteCoords = [...it.coords];
  currentRouteNames = [...it.tappe];
  drawRoute();
  showToast(`Itinerario "${it.name}" caricato`);
}
function stampaItinerarioByName(name, isCustom) {
  const list = isCustom ? ITINERARI_CUSTOM : ITINERARI_PREDEFINITI;
  const it = list.find(x => x.name === name);
  if(!it) return;
  let kmTot = 0;
  const tappe = it.tappe.map((t,i)=>{
    const c = it.coords && it.coords[i], cPrev = it.coords && it.coords[i-1];
    let seg = '';
    if (i>0 && Array.isArray(c) && Array.isArray(cPrev)) { const k = distanzaKm(cPrev, c); kmTot += k; seg = k.toFixed(1) + ' km'; }
    return `<tr><td style="padding:6px 10px;border-bottom:1px solid #eee;font-weight:600">${i+1}</td><td style="padding:6px 10px;border-bottom:1px solid #eee">${t}</td><td style="padding:6px 10px;border-bottom:1px solid #eee;color:#666;font-size:13px;white-space:nowrap">${seg}</td></tr>`;
  }).join('');
  const kmTotStr = kmTot > 0 ? kmTot.toFixed(1) : (it.km || 0);
  const html = `<!DOCTYPE html><html lang="it"><head><meta charset="UTF-8"><title>Stampa Itinerario</title>
    <style>body{font-family:Georgia,serif;max-width:680px;margin:40px auto;color:#222;padding:0 20px} h1{color:#0d4f6e;border-bottom:2px solid #0d4f6e;padding-bottom:8px} .meta{display:flex;gap:20px;color:#666;font-size:14px;margin:12px 0 20px} table{width:100%;border-collapse:collapse;margin-top:10px} th{background:#0d4f6e;color:#fff;padding:8px 10px;text-align:left} p{line-height:1.6;color:#444} .footer{margin-top:30px;font-size:12px;color:#999;border-top:1px solid #eee;padding-top:10px}</style></head><body>
    <h1>🗺 ${it.name}</h1>
    <div class="meta"><span>⏱ ${it.giorni} gg</span><span>📏 ${kmTotStr} km</span><span>🚩 ${it.tappe.length} tappe</span></div>
    <p>${sanitize(it.desc)}</p>
    <table><thead><tr><th>#</th><th>Tappa</th><th>Tratto</th></tr></thead><tbody>${tappe}</tbody></table>
    </body></html>`;
  const w = window.open('','_blank','width=750,height=600');
  if (w) { w.document.write(html); w.document.close(); w.focus(); setTimeout(()=>w.print(), 400); }
}
function generateItinerary() {
  const tema = document.getElementById('itin-tema').value;
  const match = ITINERARI_PREDEFINITI.find(i=>i.tema===tema) || ITINERARI_PREDEFINITI[0];
  loadItinRouteByName(match.name, false);
}
function nascondiItinerario(name) {
  if (!ITINERARI_NASCOSTI.includes(name)) ITINERARI_NASCOSTI.push(name);
  saveData('gargano_itin_nascosti', ITINERARI_NASCOSTI);
  renderItinerari(); showToast(`Itinerario rimosso`);
}
function eliminaItinCustom(name) {
  ITINERARI_CUSTOM = ITINERARI_CUSTOM.filter(x => x.name !== name);
  saveData('gargano_itin', ITINERARI_CUSTOM);
  renderItinerari(); showToast(`Itinerario eliminato`);
}
function ripristinaItinerari() {
  ITINERARI_NASCOSTI = [];
  saveData('gargano_itin_nascosti', []);
  renderItinerari(); showToast('Itinerari ripristinati');
}

async function exportData(){
  const ALLOGGI_NASCOSTI = await safeParse('gargano_alloggi_nascosti', []);
  const data={ LUOGHI_CUSTOM, SENTIERI_CUSTOM, RISTORANTI_CUSTOM, ALLOGGI_CUSTOM, ALLOGGI_NASCOSTI, ITINERARI_CUSTOM, VALUTAZIONI, CHECKINS }; 
  const blob=new Blob([JSON.stringify(data)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a'); a.href=url; a.download='gargano_backup.json';
  a.click(); showToast("Backup esportato");
}
function importData(e){
  const file=e.target.files[0]; if(!file)return;
  if(!file.name.toLowerCase().endsWith('.json')){ showToast("Carica un file .json valido"); return; }
  const reader=new FileReader();
  reader.onload=(ev)=>{
    try{
      const d=JSON.parse(ev.target.result);
      if(d.LUOGHI_CUSTOM) saveData('gargano_luoghi_custom', d.LUOGHI_CUSTOM);
      if(d.SENTIERI_CUSTOM) saveData('gargano_sentieri_custom', d.SENTIERI_CUSTOM);
      if(d.RISTORANTI_CUSTOM) saveData('gargano_ristoranti_custom', d.RISTORANTI_CUSTOM);
      if(d.ALLOGGI_CUSTOM) saveData('gargano_alloggi_custom', d.ALLOGGI_CUSTOM);
      if(d.ALLOGGI_NASCOSTI) saveData('gargano_alloggi_nascosti', d.ALLOGGI_NASCOSTI);
      if(d.ALLOGGI_CONSIGLIATI && !d.ALLOGGI_NASCOSTI) saveData('gargano_alloggi_consigliati', d.ALLOGGI_CONSIGLIATI);
      if(d.ITINERARI_CUSTOM) saveData('gargano_itin', d.ITINERARI_CUSTOM);
      if(d.VALUTAZIONI) saveData('gargano_valutazioni', d.VALUTAZIONI);
      if(d.CHECKINS) saveData('gargano_checkins', d.CHECKINS);
      showToast("Dati importati! Ricarico l'app...");
      setTimeout(()=>location.reload(), 1500);
    }catch(err){ showToast("Errore nel formato del file"); }
  };
  reader.readAsText(file);
}

function usaGPS(prefix) {
  if (!navigator.geolocation) { showToast('GPS non disponibile'); return; }
  showToast('Rilevamento posizione…');
  navigator.geolocation.getCurrentPosition(pos => {
    document.getElementById(`${prefix}-lat`).value = pos.coords.latitude.toFixed(6);
    document.getElementById(`${prefix}-lng`).value = pos.coords.longitude.toFixed(6);
    showToast('Coordinate inserite ✅');
  }, () => showToast('Posizione non disponibile'));
}

let pickingMapPointFor = null;
let pickingMapModalId = null;

function scegliDaMappa(prefix, modalId) {
  closeModal(modalId);
  pickingMapPointFor = prefix;
  pickingMapModalId = modalId;
  showToast("👆 Clicca su un punto della mappa");
  _showPickBanner();
  document.getElementById('map-container').style.cursor = 'crosshair';
  if(window.innerWidth < 768) { document.getElementById('sidebar').classList.remove('open'); }
  map.off('click', mapClickHandler);
  map.on('click', mapClickHandler);
}

function mapClickHandler(e) {
  if (!pickingMapPointFor) return;
  document.getElementById(pickingMapPointFor + '-lat').value = e.latlng.lat.toFixed(6);
  document.getElementById(pickingMapPointFor + '-lng').value = e.latlng.lng.toFixed(6);
  document.getElementById('map-container').style.cursor = '';
  _hidePickBanner();
  document.getElementById(pickingMapModalId).classList.add('open');
  showToast("Coordinate acquisite! ✅");
  pickingMapPointFor = null;
  pickingMapModalId = null;
  map.off('click', mapClickHandler);
}

function _showPickBanner() {
  let b = document.getElementById('pick-banner');
  if (!b) {
    b = document.createElement('div');
    b.id = 'pick-banner';
    b.style.cssText = 'position:fixed;top:12px;left:50%;transform:translateX(-50%);z-index:3000;background:var(--sky,#0d4f6e);color:#fff;padding:10px 14px;border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,.25);display:flex;align-items:center;gap:12px;font-size:14px;max-width:92vw';
    b.innerHTML = '<span>👆 Clicca sulla mappa per scegliere il punto</span>';
    const btn = document.createElement('button');
    btn.textContent = 'Annulla';
    btn.style.cssText = 'background:#fff;color:var(--sky,#0d4f6e);border:none;border-radius:6px;padding:5px 10px;font-weight:700;cursor:pointer';
    btn.onclick = annullaSceltaMappa;
    b.appendChild(btn);
    document.body.appendChild(b);
  }
  b.style.display = 'flex';
}
function _hidePickBanner() {
  const b = document.getElementById('pick-banner');
  if (b) b.style.display = 'none';
}
function annullaSceltaMappa() {
  document.getElementById('map-container').style.cursor = '';
  map.off('click', mapClickHandler);
  _hidePickBanner();
  if (pickingMapModalId) document.getElementById(pickingMapModalId).classList.add('open');
  pickingMapPointFor = null;
  pickingMapModalId = null;
  showToast('Selezione annullata');
}

function locateUser(){
  if(!navigator.geolocation){showToast('Geolocalizzazione non supportata');return}
  showToast('📍 Ricerca posizione…');
  navigator.geolocation.getCurrentPosition(pos=>{
    const{latitude:lat,longitude:lon}=pos.coords;
    L.marker([lat,lon],{icon:L.divIcon({className:'',html:`<div style="width:16px;height:16px;background:#e74c3c;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(231,76,60,.5)"></div>`,iconSize:[16,16],iconAnchor:[8,8]})})
      .addTo(map).bindPopup('📍 La tua posizione').openPopup();
    map.setView([lat, lon], 12);
  },()=>showToast('Posizione non disponibile'));
}

function setValutazione(nome, val) {
  if (VALUTAZIONI[nome] === val) delete VALUTAZIONI[nome];
  else VALUTAZIONI[nome] = val;
  saveData('gargano_valutazioni', VALUTAZIONI);
  renderRatingBtns(document.getElementById('info-rating'), nome);
  if (document.getElementById('panel-luoghi').classList.contains('active')) renderLuoghi();
}
function renderRatingBtns(el, nome) {
  if(!el) return;
  const v = VALUTAZIONI[nome];
  el.innerHTML = ['✅','⭐','❤️'].map(s =>
    `<button data-n="${nome}" data-v="${s}" onclick="setValutazione(this.dataset.n, this.dataset.v)" style="font-size:16px;background:${v===s?'var(--gold)':'transparent'};border:1px solid ${v===s?'var(--gold)':'#ddd'};border-radius:6px;padding:2px 8px;cursor:pointer;transition:all .15s">${s}</button>`
  ).join('');
}

function eseguiCheckIn(nome, coordsArray) {
  if (!navigator.geolocation) { showToast('GPS non disponibile per il check-in.'); return; }
  const btn = document.getElementById('btn-checkin');
  if(btn) { btn.innerHTML = '<span class="spinner" style="border-top-color:#fff"></span> Verifica...'; btn.disabled = true; }

  navigator.geolocation.getCurrentPosition(pos => {
    const userLat = pos.coords.latitude;
    const userLng = pos.coords.longitude;
    const poiLat = Array.isArray(coordsArray[0]) ? coordsArray[0][0] : coordsArray[0];
    const poiLng = Array.isArray(coordsArray[0]) ? coordsArray[0][1] : coordsArray[1];
    const dist = map.distance([userLat, userLng], [poiLat, poiLng]);

    if (dist <= 300) {
      if(!CHECKINS.includes(nome)) {
        CHECKINS.push(nome);
        saveData('gargano_checkins', CHECKINS);
      }
      showToast(`🎉 Check-in effettuato a ${nome}!`);
      if(btn) { btn.innerHTML = '✅ Visitato'; }
    } else {
      showToast(`Sei a ${Math.round(dist/1000)} km di distanza! Avvicinati a meno di 300m.`);
      if(btn) { btn.innerHTML = '📍 Fai Check-in'; btn.disabled = false; }
    }
  }, () => {
    showToast('Errore GPS.');
    if(btn) { btn.innerHTML = '📍 Fai Check-in'; btn.disabled = false; }
  }, { enableHighAccuracy: true, timeout: 10000 });
}

function mostraPassaporto() {
  const list = document.getElementById('passaporto-list');
  list.innerHTML = '';
  document.getElementById('passaporto-count').textContent = CHECKINS.length;

  if(CHECKINS.length === 0) {
    list.innerHTML = '<li>🌱 Nessun luogo visitato. Fai check-in con il GPS!</li>';
  } else {
    list.innerHTML = CHECKINS.map(nome => `<li style="padding:8px 0; border-bottom:1px solid var(--border);">✅ <b>${sanitize(nome)}</b></li>`).join('');
  }

  const badgesEl = document.getElementById('passaporto-badges');
  const traguardi = [
    { count: 1, name: "Esploratore Novizio", icon: "🌱" },
    { count: 3, name: "Viaggiatore Seriale", icon: "🧭" },
    { count: 5, name: "Guida del Gargano", icon: "🦅" },
    { count: 10, name: "Leggenda Locale", icon: "👑" }
  ];

  badgesEl.innerHTML = traguardi.map(t => {
    if (CHECKINS.length >= t.count) {
      return `<span class="badge-unlocked" title="Sbloccato">${t.icon} ${t.name}</span>`;
    } else {
      return `<span class="badge-locked" title="Richiede ${t.count} visite">🔒 ${t.count} visite</span>`;
    }
  }).join('');

  document.getElementById('passaporto-modal').classList.add('open');
}

function toggleChat() { document.getElementById('chat-panel').classList.toggle('open'); }

function askForApiKeyModal() {
  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:10000;display:flex;align-items:center;justify-content:center;padding:16px;';
    overlay.innerHTML = `
      <div style="background:#fff;padding:28px 24px;border-radius:18px;width:100%;max-width:400px;text-align:center;box-shadow:0 16px 48px rgba(0,0,0,0.35)">
        <div style="font-size:36px;margin-bottom:8px">🔑</div>
        <h3 style="color:var(--forest);font-size:20px;font-weight:700;margin-bottom:6px">API Key Gemini richiesta</h3>
        <p style="font-size:12px;color:var(--muted);line-height:1.5;margin-bottom:14px">
          Per usare le funzioni AI serve una chiave gratuita di Google.<br>
          <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" style="color:var(--forest);font-weight:700;text-decoration:underline">
            👉 Ottienila gratis su aistudio.google.com
          </a>
        </p>
        <div style="position:relative;margin-bottom:14px">
          <input type="password" id="temp-api-key" placeholder="Incolla qui la chiave AIza…" style="width:100%;padding:10px 40px 10px 12px;border:1px solid var(--border);border-radius:8px;font-size:13px;outline:none;box-sizing:border-box">
          <button type="button" onclick="const i=document.getElementById('temp-api-key');i.type=i.type==='password'?'text':'password';this.textContent=i.type==='password'?'👁':'🙈'" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;font-size:16px">👁</button>
        </div>
        <div style="display:flex;gap:8px">
          <button id="btn-cancel-key" style="flex:1;background:transparent;border:1px solid var(--border);color:var(--stone);padding:10px;border-radius:8px;cursor:pointer;font-weight:600">Annulla</button>
          <button id="btn-save-key" style="flex:1;background:var(--forest);color:#fff;border:none;padding:10px;border-radius:8px;cursor:pointer;font-weight:700">✅ Salva</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    document.getElementById('btn-cancel-key').onclick = () => { document.body.removeChild(overlay); resolve(""); };
    document.getElementById('btn-save-key').onclick = () => {
      const val = document.getElementById('temp-api-key').value.trim();
      document.body.removeChild(overlay);
      resolve(val);
    };
    document.getElementById('temp-api-key').addEventListener('keydown', e => {
      if (e.key === 'Enter') document.getElementById('btn-save-key').click();
    });
  });
}

const PROMPT_ANTI_ALLUCINAZIONE = "Rispondi SOLO in base ai risultati di ricerca. Non inventare mai menù, piatti, prezzi, orari o servizi. Se le fonti non contengono un'informazione richiesta, scrivi chiaramente: 'Non ho trovato informazioni verificate su questo aspetto, ti consiglio di contattare direttamente la struttura.'";

async function fetchGeminiGrounded(payload, retryCount = 0, _keyRetry = false) {
  const activeKey = await getApiKeyOrAsk();
  if (!activeKey) throw new Error('API Key necessaria');

  let model = GEMINI_MODEL_DEFAULT;
  try { model = await getGeminiModel(activeKey) || GEMINI_MODEL_DEFAULT; } catch(e) {}

  const toolName = /gemini-1\.5/i.test(model) ? 'google_search_retrieval' : 'google_search';
  if (!payload.generationConfig) payload.generationConfig = { maxOutputTokens: 1500, thinkingConfig: { thinkingBudget: 0 } };
  const groundedPayload = JSON.parse(JSON.stringify(payload));
  groundedPayload.tools = [{ [toolName]: {} }];

  const callApi = async (body) => {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 45000);
    try {
      const resp = await fetch(geminiEndpoint(model, activeKey), { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body), signal: ctrl.signal });
      if (!resp.ok) {
        const err = new Error(`HTTP ${resp.status}`);
        err.status = resp.status;
        throw err;
      }
      return await resp.json();
    } finally { clearTimeout(tid); }
  };

  const estrai = (data) => {
    const cand = data.candidates?.[0];
    const text = cand?.content?.parts?.map(p => p.text || '').join('') || '';
    const gm = cand?.groundingMetadata;
    const sources = (gm?.groundingChunks || [])
      .map(c => ({ title: c.web?.title || c.web?.uri || '', url: c.web?.uri || '' }))
      .filter(s => s.url);
    return { text, sources, queries: gm?.webSearchQueries || [], verified: !!gm };
  };

  try {
    return estrai(await callApi(groundedPayload));
  } catch (e) {
    if ((e.status === 503 || e.status === 429 || e.status === 500) && retryCount < 2) {
      const delay = (retryCount + 1) * 2000;
      await new Promise(r => setTimeout(r, delay));
      return fetchGeminiGrounded(payload, retryCount + 1, _keyRetry);
    }
    try {
      return estrai(await callApi(payload));
    } catch (e2) {
      if ((e2.status === 400 || e2.status === 403) && !_keyRetry) {
        await idbDelete('gargano_gemini_key');
        await invalidaCacheModello();
        const nuova = await askForApiKeyModal();
        if (nuova && nuova.trim()) {
          await setApiKey(nuova);
          return fetchGeminiGrounded(payload, retryCount, true);
        }
        throw new Error("API Key non fornita");
      }
      throw e2;
    }
  }
}

function renderGroundingBadge(res) {
  const badge = res.verified
    ? `<div class="grounding-badge verified">✓ Verificato dal web</div>`
    : `<div class="grounding-badge unverified">⚠ Non verificato</div>`;
  let fonti = '';
  if (res.sources && res.sources.length) {
    fonti = `<div class="fonti-box"><b>Fonti:</b> ` +
      res.sources.map(s => `<a href="${sanitize(safeUrl(s.url))}" target="_blank" rel="noopener noreferrer">${sanitize((s.title||s.url).slice(0,60))}</a>`).join(' · ') +
      `</div>`;
  }
  return badge + fonti;
}

async function fetchGeminiWithRetry(payload, isJson = false, isVision = false, retryCount = 0, _keyRetry = false) {
  const MAX_RETRIES = 2;
  const activeKey = await getApiKeyOrAsk();
  if (!activeKey) throw new Error('API Key necessaria');

  if (isJson) {
    const gcBase = payload.generationConfig || { maxOutputTokens: 4096, thinkingConfig: { thinkingBudget: 0 } };
    payload.generationConfig = Object.assign({}, gcBase, {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT", properties: {
          name: { type: "STRING" }, desc: { type: "STRING" }, giorni: { type: "INTEGER" },
          km: { type: "INTEGER" }, tappe: { type: "ARRAY", items: { type: "STRING" } }
        }, required: ["name", "desc", "giorni", "km", "tappe"]
      }
    });
  } else if (!payload.generationConfig) {
    payload.generationConfig = { maxOutputTokens: 1500, thinkingConfig: { thinkingBudget: 0 } };
  }

  const model = await getGeminiModel(activeKey);
  const endpoint = geminiEndpoint(model, activeKey);

  const ctrl = new AbortController();
  const tid = setTimeout(() => ctrl.abort(), 45000);
  let response;
  try {
    response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: ctrl.signal });
  } finally { clearTimeout(tid); }

  if (!response.ok) {
    if ((response.status === 503 || response.status === 429 || response.status === 500) && retryCount < MAX_RETRIES) {
      const delay = (retryCount + 1) * 2000;
      await new Promise(r => setTimeout(r, delay));
      return fetchGeminiWithRetry(payload, isJson, isVision, retryCount + 1, _keyRetry);
    }
    if ((response.status === 400 || response.status === 403) && !_keyRetry) {
      await idbDelete('gargano_gemini_key');
      await invalidaCacheModello();
      const newKey = await askForApiKeyModal();
      if (newKey && newKey.trim()) {
        await setApiKey(newKey);
        return fetchGeminiWithRetry(payload, isJson, isVision, retryCount, true);
      }
      throw new Error("API Key non fornita");
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  const textResult = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textResult) throw new Error('Risposta AI vuota');
  return isJson ? JSON.parse(textResult) : textResult;
}

function getAppDati() {
  return `LUOGHI: ${LUOGHI.map(l=>l.name).join(', ')}.\nRISTORANTI: ${RISTORANTI.map(r=>r.name).join(', ')}.\nSENTIERI: ${SENTIERI.map(s=>s.name).join(', ')}.`;
}

async function inviaMessaggioAI() {
  const input = document.getElementById('chat-input');
  const txt = input.value.trim(); if (!txt) return;
  const msgBox = document.getElementById('chat-messages');
  msgBox.innerHTML += `<div class="chat-bubble user">${txt}</div>`; input.value = '';
  const loaderId = 'loader-' + Date.now();
  msgBox.innerHTML += `<div class="chat-bubble ai" id="${loaderId}"><div class="ai-typing"><span></span><span></span><span></span></div></div>`;
  msgBox.scrollTop = msgBox.scrollHeight;

  const payload = {
    contents: [{ parts: [{ text: txt }] }],
    systemInstruction: { parts: [{ text: `${PROMPT_ANTI_ALLUCINAZIONE}\n\nSei una guida turistica del Gargano. Dati app: ${getAppDati()}.` }] }
  };

  try {
    const res = await fetchGeminiGrounded(payload);
    document.getElementById(loaderId).outerHTML = `<div class="chat-bubble ai">${(res.text||'').replace(/\n/g, '<br>')}${renderGroundingBadge(res)}</div>`;
  } catch (e) {
    document.getElementById(loaderId).outerHTML = `<div class="chat-bubble ai" style="color:var(--rust)">Errore: ${sanitize(e.message || 'AI non disponibile')}</div>`;
  }
  msgBox.scrollTop = msgBox.scrollHeight;
}

function avviaAscolto() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) { showToast("Riconoscimento vocale non supportato."); return; }
  const recognition = new SpeechRecognition();
  recognition.lang = 'it-IT';
  recognition.onstart = () => showToast("🎙️ In ascolto...");
  recognition.onresult = (e) => {
    const transcript = e.results[0][0].transcript;
    document.getElementById('chat-input').value = transcript;
    inviaMessaggioAI();
  };
  recognition.onerror = () => showToast("Errore microfono.");
  recognition.start();
}

function leggiAdAltaVoce(testo) {
  if(!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(testo);
  u.lang = 'it-IT';
  u.rate = 0.95;
  window.speechSynthesis.speak(u);
}

async function richiediGuidaAI(nome, tipo, modalita) {
  const btnAudio = document.getElementById('btn-ai-audio');
  const btnTesto = document.getElementById('btn-ai-testo');
  const resultBox = document.getElementById('info-ai-result');

  if (!await getApiKeyOrAsk()) {
    showToast('API Key necessaria');
    return;
  }
  
  if(window.speechSynthesis) window.speechSynthesis.cancel();
  
  if(modalita === 'audio') {
     btnAudio.innerHTML = "⏳ Genero..."; btnAudio.disabled = true;
     btnTesto.disabled = true;
  } else {
     btnTesto.innerHTML = "⏳ Genero..."; btnTesto.disabled = true;
     btnAudio.disabled = true;
     resultBox.style.display = 'block';
     resultBox.innerHTML = '<span class="spinner" style="border-top-color:var(--sage)"></span> Generazione...';
  }
  
  try {
     const prompt = `Sei una guida turistica del Gargano. Racconta di "${nome}" (tipo: ${tipo || 'luogo'}).`;
     const payload = {
       contents: [{ parts: [{ text: prompt }] }],
       systemInstruction: { parts: [{ text: PROMPT_ANTI_ALLUCINAZIONE }] }
     };
     const result = await fetchGeminiGrounded(payload);
     const text = result.text;

     if(modalita === 'audio') {
         btnAudio.innerHTML = "🔊 In ascolto";
         btnAudio.disabled = false;
         btnTesto.disabled = false;
         btnAudio.style.background = '#dcede2';
         btnTesto.style.background = 'transparent';
         leggiAdAltaVoce(text.replace(/\*/g, ''));
         showToast("Audioguida avviata");
         resultBox.style.display = 'block';
         resultBox.innerHTML = renderGroundingBadge(result);
     } else {
         btnTesto.innerHTML = "📄 Lettura";
         btnTesto.disabled = false;
         btnAudio.disabled = false;
         btnTesto.style.background = '#dcede2';
         btnAudio.style.background = 'transparent';
         let htmlText = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');
         resultBox.innerHTML = `<b>✨ Racconto AI:</b><br><br>${htmlText}${renderGroundingBadge(result)}`;
     }
  } catch (e) {
     btnAudio.innerHTML = "🎧 Ascolta"; btnAudio.disabled = false;
     btnTesto.innerHTML = "📄 Leggi"; btnTesto.disabled = false;
     const msg = e.message || 'errore';
     if (modalita === 'testo') resultBox.innerHTML = `<span style="color:var(--rust)">Errore: ${msg}</span>`;
     showToast("Errore guida AI: " + msg);
  }
}

async function fetchElevationProfile(coordsArray, el) {
   el.innerHTML = '<span class="spinner" style="width:12px;height:12px;border-top-color:var(--sage)"></span> Altimetria...';
   try {
     const start = Array.isArray(coordsArray[0]) ? coordsArray[0] : coordsArray;
     const end = Array.isArray(coordsArray[coordsArray.length - 1]) ? coordsArray[coordsArray.length - 1] : coordsArray;
     if(!start[0] || !end[0]) { el.style.display='none'; return; }
     
     const url = `https://api.open-meteo.com/v1/elevation?latitude=${start[0]},${end[0]}&longitude=${start[1]},${end[1]}`;
     const res = await fetchTimeout(url);
     const data = await res.json();
     
     if(data.elevation && data.elevation.length >= 2) {
        const e1 = Math.round(data.elevation[0]); 
        const e2 = Math.round(data.elevation[data.elevation.length - 1]);
        const diff = e2 - e1;
        el.innerHTML = `🏔️ <b>Altimetria stimata</b><br>Partenza: <b>${e1}m</b> | Arrivo: <b>${e2}m</b> <br>Dislivello: <b>${diff > 0 ? '+' : ''}${diff}m</b>`;
     } else {
        el.innerHTML = "Dati altimetrici non disponibili.";
     }
   } catch(e) { el.style.display = 'none'; }
}

async function generaItinerarioAI() {
  const promptEl = document.getElementById('itin-ai-prompt');
  const input = promptEl.value.trim();
  if (!input) { showToast("Descrivi il tuo itinerario ideale!"); return; }
  
  const btn = document.getElementById('btn-itin-ai');
  btn.innerHTML = `<span class="spinner" style="border-top-color:#fff"></span> Generazione...`;
  btn.disabled = true;

  const payload = {
    contents: [{ parts: [{ text: input }] }],
    systemInstruction: { parts: [{ text: `Sei un travel planner. Crea un itinerario scegliendo le tappe ESATTAMENTE dall'elenco fornito:\n${getAppDati()}` }] }
  };

  try {
    const itinData = await fetchGeminiWithRetry(payload, true);
    const tappeValide = []; const coordsValide = [];
    const allPlaces = [...LUOGHI, ...RISTORANTI, ...SENTIERI];
    
    itinData.tappe.forEach(tNome => {
      const tLower = (tNome || '').toLowerCase().trim();
      let match = allPlaces.find(p => p.name.toLowerCase().trim() === tLower) || allPlaces.find(p => p.name.toLowerCase().includes(tLower) || tLower.includes(p.name.toLowerCase()));
      if (match && match.coords && !tappeValide.includes(match.name)) {
        tappeValide.push(match.name);
        coordsValide.push(Array.isArray(match.coords[0]) ? match.coords[0] : match.coords);
      }
    });

    if (tappeValide.length === 0) throw new Error("Nessuna tappa valida trovata");

    const nuovoItin = {
      name: "✨ " + sanitize(itinData.name), desc: sanitize(itinData.desc), giorni: itinData.giorni || 1, km: itinData.km || 0,
      tappe: tappeValide, coords: coordsValide, custom: true
    };

    ITINERARI_CUSTOM.unshift(nuovoItin);
    saveData('gargano_itin', ITINERARI_CUSTOM);
    renderItinerari();
    loadItinRouteByName(nuovoItin.name, true);
    document.getElementById('chat-panel').classList.remove('open');
    promptEl.value = '';
    showToast("Itinerario AI creato! ✅");
  } catch (e) {
    showToast("Errore durante la creazione.");
  } finally {
    btn.innerHTML = `✨ Crea Itinerario AI`; btn.disabled = false;
  }
}

async function analizzaFotoAI(event) {
  const file = event.target.files[0]; if (!file) return;
  showToast("⏳ Analisi foto...");
  document.getElementById('chat-widget').style.display = 'flex';
  document.getElementById('chat-panel').classList.add('open');
  const reader = new FileReader();
  reader.onload = async (e) => {
    const base64Data = e.target.result.split(',')[1];
    const msgBox = document.getElementById('chat-messages');
    msgBox.innerHTML += `<div class="chat-bubble user">📸 [Foto inviata]</div>`;
    const loaderId = 'loader-' + Date.now();
    msgBox.innerHTML += `<div class="chat-bubble ai" id="${loaderId}"><div class="ai-typing"><span></span><span></span><span></span></div></div>`;
    msgBox.scrollTop = msgBox.scrollHeight;

    const payload = {
      contents: [{ role: "user", parts: [ { text: "Identifica questo luogo o cibo del Gargano in 2-3 frasi." }, { inlineData: { mimeType: file.type, data: base64Data } }] }]
    };

    try {
      const risposta = await fetchGeminiWithRetry(payload, false, true);
      document.getElementById(loaderId).outerHTML = `<div class="chat-bubble ai">👁️ <b>Analisi visiva:</b><br>${risposta.replace(/\n/g, '<br>')}</div>`;
    } catch (err) {
      document.getElementById(loaderId).outerHTML = `<div class="chat-bubble ai" style="color:var(--rust)">Impossibile analizzare la foto.</div>`;
    }
    msgBox.scrollTop = msgBox.scrollHeight;
  };
  reader.readAsDataURL(file);
}

async function chiediConsiglioMeteoAI() {
  showToast("Controllo meteo...");
  document.getElementById('chat-widget').style.display = 'flex';
  document.getElementById('chat-panel').classList.add('open');
  const msgBox = document.getElementById('chat-messages');
  msgBox.innerHTML += `<div class="chat-bubble user">Cosa mi consigli di fare oggi in base al meteo?</div>`;
  msgBox.scrollTop = msgBox.scrollHeight;
  if (!navigator.geolocation) { elaboraConsiglioMeteo(41.8825, 16.1772, "Vieste"); return; }
  navigator.geolocation.getCurrentPosition(
    (pos) => elaboraConsiglioMeteo(pos.coords.latitude, pos.coords.longitude, "la tua posizione"),
    () => elaboraConsiglioMeteo(41.8825, 16.1772, "Vieste")
  );
}

async function elaboraConsiglioMeteo(lat, lon, locationName) {
  const msgBox = document.getElementById('chat-messages');
  const loaderId = 'loader-' + Date.now();
  msgBox.innerHTML += `<div class="chat-bubble ai" id="${loaderId}"><div class="ai-typing"><span></span><span></span><span></span></div></div>`;
  msgBox.scrollTop = msgBox.scrollHeight;

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode&timezone=Europe%2FRome`;
    const r = await fetchTimeout(url); const d = await r.json();
    const meteoDesc = WMO[d.current.weathercode] || 'Meteo variabile';
    const temp = Math.round(d.current.temperature_2m);
    const promptTesto = `Meteo a ${locationName}: ${meteoDesc} con ${temp}°C. Suggerisci attività basandoti sui dati dell'app: ${getAppDati()}.`;
    
    const payload = { contents: [{ parts: [{ text: promptTesto }] }] };
    const risposta = await fetchGeminiWithRetry(payload, false);
    document.getElementById(loaderId).outerHTML = `<div class="chat-bubble ai">⛅ <b>Consiglio Meteo:</b><br>${risposta.replace(/\n/g, '<br>')}</div>`;
  } catch(e) {
    document.getElementById(loaderId).outerHTML = `<div class="chat-bubble ai" style="color:var(--rust)">Errore meteo.</div>`;
  }
  msgBox.scrollTop = msgBox.scrollHeight;
}

async function chiediSommelierAI(nome, loc, cucina) {
  document.getElementById('chat-widget').style.display = 'flex';
  document.getElementById('chat-panel').classList.add('open');
  const msgBox = document.getElementById('chat-messages');
  msgBox.innerHTML += `<div class="chat-bubble user">Cosa ordino da ${nome} (${loc})?</div>`;
  const loaderId = 'loader-' + Date.now();
  msgBox.innerHTML += `<div class="chat-bubble ai" id="${loaderId}"><div class="ai-typing"><span></span><span></span><span></span></div></div>`;
  msgBox.scrollTop = msgBox.scrollHeight;

  try {
    const promptTesto = `Consiglia cosa ordinare al ristorante "${nome}" (cucina: ${cucina}) a ${loc} con abbinamento vini locali.`;
    const payload = {
      contents: [{ parts: [{ text: promptTesto }] }],
      systemInstruction: { parts: [{ text: PROMPT_ANTI_ALLUCINAZIONE }] }
    };
    const result = await fetchGeminiGrounded(payload);
    document.getElementById(loaderId).outerHTML = `<div class="chat-bubble ai">🍷 <b>Consiglio:</b><br>${result.text.replace(/\n/g, '<br>')}${renderGroundingBadge(result)}</div>`;
  } catch(e) {
    document.getElementById(loaderId).outerHTML = `<div class="chat-bubble ai" style="color:var(--rust)">Errore: ${sanitize(e.message)}</div>`;
  }
  msgBox.scrollTop = msgBox.scrollHeight;
}

window.onload = async function() {
  if (typeof L === 'undefined') {
    document.getElementById('map-container').innerHTML = '<div style="padding:40px;text-align:center;">Mappa non disponibile. Ricarica la pagina.</div>';
    return;
  }
  await initData();
  const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OSM' });
  const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19, attribution: 'Tiles © Esri' });
  
  map = L.map('map-container', { layers: [osmLayer] }).setView([41.83, 15.95], 10);

  L.control.layers({
    "🗺 Mappa Base": osmLayer,
    "🛰 Satellite (Esri)": satelliteLayer
  }).addTo(map);

  renderTrek();
  renderRest();
  renderAlloggi();
  renderEventi();
  renderItinerari();
  
  switchTab('luoghi');
};