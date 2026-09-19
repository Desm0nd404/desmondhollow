// @ts-check
/* ═══════════════════════════════════════════════════════════════════
   REGISTRE — rendu de la page à partir de registre.config.js
   Rien d'éditorial ici : tout texte affiché vient de la config, sauf les
   libellés fixes des lignes de cotation et les chiffres de marché relevés.
   ═══════════════════════════════════════════════════════════════════ */

(() => {
  /** @type {any} */
  const CONFIG = /** @type {any} */ (window).REGISTRE_CONFIG;
  if (!CONFIG) return;

  const $ = (/** @type {string} */ id) => document.getElementById(id);

  /** crée un élément avec une classe et un texte */
  const el = (/** @type {string} */ tag, /** @type {string} */ cls = '', /** @type {string} */ text = '') => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text) node.textContent = text;
    return node;
  };

  const pad2 = (/** @type {number} */ n) => String(n).padStart(2, '0');

  /* tout le registre ne se construit qu'une fois le verrou levé */
  function ouvrirRegistre(){

  /* ── 0 · bandeau : le texte est répété deux fois pour boucler sans saut ── */
  const bandeau = $('bandeau');
  if (bandeau){
    const segment = `${CONFIG.bandeau} · `;
    const repeat = Math.max(2, Math.ceil(2400 / Math.max(segment.length * 9, 1)));
    for (let half = 0; half < 2; half++){
      bandeau.appendChild(el('span', '', segment.repeat(repeat)));
    }
    const note = bandeau.parentElement;
    if (note) note.setAttribute('aria-label', CONFIG.bandeau);
  }

  /* ── 00 · pièces au registre : ordre d'entrée, jamais de prix ─────── */
  const pieces = $('pieces');
  if (pieces && Array.isArray(CONFIG.oeuvres) && CONFIG.oeuvres.length){
    const rang = (/** @type {any} */ o) => parseInt(String(o.numero).replace(/\D/g, ''), 10) || 0;
    const recentes = [...CONFIG.oeuvres]
      .sort((a, b) => rang(b) - rang(a))
      .slice(0, Math.max(1, Number(CONFIG.piecesAffichees) || 5));

    /** une pièce : l'image, son numéro, et le lien vers l'accueil qui la pose sur l'aplat */
    const carte = (/** @type {any} */ o, /** @type {boolean} */ vedette) => {
      const a = el('a', `piece${vedette ? ' vedette' : ''}`);
      a.setAttribute('href', `../#oeuvre-${String(o.numero).replace('#', '')}`);
      a.setAttribute('title', `${o.numero} ${o.titre}`);
      const img = /** @type {HTMLImageElement} */ (el('img'));
      img.src = o.image;
      img.alt = `${o.numero} ${o.titre}`;
      img.loading = vedette ? 'eager' : 'lazy';
      img.decoding = 'async';
      a.append(img, el('span', 'tag lib', o.numero));
      if (vedette) a.appendChild(el('span', 'tag tag-bas lib', 'Dernière entrée'));
      return a;
    };

    const [premiere, ...suite] = recentes;
    pieces.appendChild(carte(premiere, true));
    if (suite.length){
      const grille = el('div', 'pieces-grille');
      suite.forEach(o => grille.appendChild(carte(o, false)));
      pieces.appendChild(grille);
    }
    const compte = $('pieces-compte');
    if (compte) compte.textContent = `${pad2(CONFIG.oeuvres.length)} pièces`;
  }

  /* ── 1 · relevé d'atelier ─────────────────────────────────────────── */
  const atelier = $('atelier');
  if (atelier){
    CONFIG.atelier.forEach((/** @type {any} */ c) => {
      const row = el('div', 'compteur');
      row.appendChild(el('span', 'lib', c.libelle));
      const value = el('span', 'valeur');
      value.append(pad2(c.fait), el('span', 'sep', '/'), pad2(c.total));
      value.setAttribute('aria-label', `${c.fait} sur ${c.total}`);
      row.appendChild(value);
      atelier.appendChild(row);
    });
  }
  const derniere = $('derniere-entree');
  if (derniere) derniere.textContent = `DERNIÈRE ENTRÉE — ${CONFIG.derniereEntree}`;

  /* ── 2 · état des actes ───────────────────────────────────────────── */
  const actes = $('actes');
  if (actes){
    CONFIG.actes.forEach((/** @type {any} */ a, /** @type {number} */ i) => {
      const enCours = a.etat === 'EN COURS';
      const row = el('div', `acte${enCours ? '' : ' dormant'}`);
      const voyant = el('span', `voyant ${enCours ? 'allume' : 'eteint'}`);
      voyant.setAttribute('aria-hidden', 'true');
      row.append(voyant, el('span', 'lib', a.libelle), el('span', 'lib etat', a.etat));
      actes.appendChild(row);

      /* le protocole en sommeil se replie sous le dernier acte */
      if (i === CONFIG.actes.length - 1 && CONFIG.protocole.length){
        const details = el('details', 'protocole');
        details.appendChild(el('summary', 'lib', 'Protocole en sommeil'));
        const dl = el('dl');
        CONFIG.protocole.forEach((/** @type {any} */ p) => {
          dl.append(el('dt', '', p.libelle), el('dd', '', p.valeur));
        });
        details.appendChild(dl);
        actes.appendChild(details);
      }
    });
  }

  /* ── 3 · cotation du jour ─────────────────────────────────────────── */
  const cotation = $('cotation');
  const C = CONFIG.cotation;
  const fr = (/** @type {number} */ n, /** @type {number} */ digits = 2) =>
    n.toLocaleString('fr-FR', { minimumFractionDigits:digits, maximumFractionDigits:digits });
  const signe = (/** @type {number} */ n, /** @type {string} */ unite, /** @type {number} */ digits = 1) =>
    `${n > 0 ? '+' : n < 0 ? '−' : '±'}${fr(Math.abs(n), digits)} ${unite}`;
  const prix = (/** @type {number} */ n) =>
    `$${fr(n, n >= 100 ? 0 : n >= 1 ? 2 : n >= 0.01 ? 4 : 6)}`;

  /** une ligne libellé / valeur / variation ; renvoie une fonction de remplissage */
  const ligne = (/** @type {string} */ libelle) => {
    const row = el('div', 'ligne');
    const l = el('span', 'l', libelle);
    const v = el('span', 'v');
    const d = el('span', 'd');
    row.append(l, v, d);
    if (cotation) cotation.appendChild(row);
    return {
      ok: (/** @type {string} */ lib, /** @type {string} */ val, /** @type {string} */ vari, telQuel = false) => {
        l.textContent = lib;
        if (telQuel) l.classList.add('tel-quel');
        v.textContent = val;
        d.textContent = vari;
      },
      perdu: () => {
        v.textContent = 'SIGNAL PERDU';
        v.className = 'v perdu';
        d.textContent = '';
      },
    };
  };

  /** relevé avec délai maximum, et réutilisation d'un relevé réussi récent */
  const releve = async (/** @type {string} */ cle, /** @type {string} */ url) => {
    const store = (() => { try { return window.localStorage; } catch { return null; } })();
    const key = `registre:${cle}`;
    if (store && C.cacheSecondes > 0){
      try {
        const saved = JSON.parse(store.getItem(key) || 'null');
        if (saved && Date.now() - saved.t < C.cacheSecondes * 1000) return saved.data;
      } catch { /* relevé illisible : on redemande */ }
    }
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), C.delaiSecondes * 1000);
    try {
      const res = await fetch(url, { signal:ctrl.signal, headers:{ accept:'application/json' } });
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      if (store && C.cacheSecondes > 0){
        try { store.setItem(key, JSON.stringify({ t:Date.now(), data })); } catch { /* quota : tant pis */ }
      }
      return data;
    } finally {
      clearTimeout(timer);
    }
  };

  if (cotation){
    /* token en plus forte hausse sur 24 h, parmi les 250 premières capitalisations */
    const token = ligne('HAUSSE 24 H');
    releve('coingecko-marches',
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&price_change_percentage=24h')
      .then(list => {
        const best = (Array.isArray(list) ? list : [])
          .filter(t => typeof t.price_change_percentage_24h === 'number' && typeof t.current_price === 'number')
          .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)[0];
        if (!best) throw new Error('vide');
        token.ok(`HAUSSE 24 H · ${String(best.symbol).toUpperCase()}`, prix(best.current_price),
          signe(best.price_change_percentage_24h, '%'));
      })
      .catch(() => token.perdu());

    /* marché de prédiction le plus actif du jour : question telle quelle, cote de la première issue */
    const pari = ligne('MARCHÉ LE PLUS ACTIF');
    releve('polymarket-actif',
      'https://gamma-api.polymarket.com/markets?active=true&closed=false&order=volume24hr&ascending=false&limit=1')
      .then(list => {
        const m = Array.isArray(list) ? list[0] : null;
        if (!m || !m.question) throw new Error('vide');
        const issues = JSON.parse(m.outcomes || '[]');
        const cotes = JSON.parse(m.outcomePrices || '[]').map(Number);
        if (!issues.length || !Number.isFinite(cotes[0])) throw new Error('cote');
        const variation = Number(m.oneDayPriceChange);
        pari.ok(m.question, `${String(issues[0]).toUpperCase()} ${fr(cotes[0] * 100, 0)} %`,
          Number.isFinite(variation) ? signe(variation * 100, 'PTS') : '', true);
      })
      .catch(() => pari.perdu());

    /* volume NFT sur 24 h d'une collection */
    const nft = ligne(`VOLUME NFT 24 H · ${C.nftLibelle}`);
    releve(`coingecko-nft-${C.nftCollection}`,
      `https://api.coingecko.com/api/v3/nfts/${encodeURIComponent(C.nftCollection)}`)
      .then(data => {
        const usd = data && data.volume_24h && data.volume_24h.usd;
        const vari = data && data.volume_24h_percentage_change && data.volume_24h_percentage_change.usd;
        if (typeof usd !== 'number') throw new Error('vide');
        nft.ok(`VOLUME NFT 24 H · ${C.nftLibelle}`, `$${fr(usd, 0)}`,
          typeof vari === 'number' ? signe(vari, '%') : '');
      })
      .catch(() => nft.perdu());

    /* la ligne de l'artiste : même typographie, même taille, sous un filet */
    const artiste = el('div', 'ligne artiste');
    artiste.append(el('span', 'l tel-quel', C.ligneArtiste), el('span', 'v', 'DERNIÈRE VENTE'), el('span', 'd', '—'));
    cotation.appendChild(artiste);
  }

  /* ── 4 · compteur d'attention : depuis le chargement, à la seconde ─── */
  const chrono = $('chrono');
  if (chrono){
    const debut = Date.now();
    const tick = () => {
      const s = Math.floor((Date.now() - debut) / 1000);
      chrono.textContent = `${pad2(Math.floor(s / 3600))}:${pad2(Math.floor(s / 60) % 60)}:${pad2(s % 60)}`;
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ── 5 · dépêches : les 8 plus récentes ───────────────────────────── */
  const depeches = $('depeches');
  if (depeches){
    [...CONFIG.depeches]
      .sort((a, b) => String(b.date).localeCompare(String(a.date)))
      .slice(0, 8)
      .forEach((/** @type {any} */ d, /** @type {number} */ i) => {
        const item = el('li', 'depeche');
        const time = el('time', '', d.date);
        time.setAttribute('datetime', d.date);
        const p = el('p');
        const texte = String(d.texte);
        if (i === 0 && texte.length > 1){
          /* lettrine sur la dépêche la plus récente */
          p.append(el('span', 'lettrine', texte[0]), texte.slice(1));
        } else {
          p.textContent = texte;
        }
        item.append(time, p);
        depeches.appendChild(item);
      });
  }

  /* ── 6 · pied de page ─────────────────────────────────────────────── */
  const pied = $('pied');
  if (pied) pied.textContent = CONFIG.pied;
  const liens = $('liens');
  if (liens){
    CONFIG.liens.forEach((/** @type {any} */ l) => {
      const a = el('a', '', l.libelle);
      a.setAttribute('href', l.href);
      liens.appendChild(a);
    });
  }
  }

  /* ── verrou : un code avant le registre ───────────────────────────────
     Le code n'est pas écrit en clair : on compare son empreinte SHA-256 à
     celle de la config. Ce n'est pas une protection forte (le contenu de la
     page reste lisible dans la source), c'est une porte. */
  const ACCES = CONFIG.acces || { actif:false };
  const CLE_SESSION = 'registre:ouvert';

  /* SHA-256 en JavaScript pur : crypto.subtle n'existe pas sur une adresse
     http de réseau local (ex. 192.168.x.x), il faut pouvoir s'en passer */
  const sha256 = (/** @type {string} */ texte) => {
    const bytes = new TextEncoder().encode(texte);
    const K = [];
    const H = [];
    let n = 2, trouves = 0;
    const frac = (/** @type {number} */ x) => ((x - Math.floor(x)) * 0x100000000) >>> 0;
    while (trouves < 64){
      let premier = true;
      for (let d = 2; d * d <= n; d++) if (n % d === 0){ premier = false; break; }
      if (premier){
        if (trouves < 8) H[trouves] = frac(Math.pow(n, 1 / 2));
        K[trouves++] = frac(Math.pow(n, 1 / 3));
      }
      n++;
    }
    const longueur = bytes.length;
    const total = Math.ceil((longueur + 9) / 64) * 64;
    const bloc = new Uint8Array(total);
    bloc.set(bytes);
    bloc[longueur] = 0x80;
    const bits = longueur * 8;
    const vue = new DataView(bloc.buffer);
    vue.setUint32(total - 8, Math.floor(bits / 0x100000000));
    vue.setUint32(total - 4, bits >>> 0);
    const W = new Uint32Array(64);
    const rotr = (/** @type {number} */ x, /** @type {number} */ r) => (x >>> r) | (x << (32 - r));
    for (let off = 0; off < total; off += 64){
      for (let i = 0; i < 16; i++) W[i] = vue.getUint32(off + i * 4);
      for (let i = 16; i < 64; i++){
        const s0 = rotr(W[i - 15], 7) ^ rotr(W[i - 15], 18) ^ (W[i - 15] >>> 3);
        const s1 = rotr(W[i - 2], 17) ^ rotr(W[i - 2], 19) ^ (W[i - 2] >>> 10);
        W[i] = (W[i - 16] + s0 + W[i - 7] + s1) >>> 0;
      }
      let [a, b, c, d, e, f, g, h] = H;
      for (let i = 0; i < 64; i++){
        const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
        const ch = (e & f) ^ (~e & g);
        const t1 = (h + S1 + ch + K[i] + W[i]) >>> 0;
        const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
        const maj = (a & b) ^ (a & c) ^ (b & c);
        const t2 = (S0 + maj) >>> 0;
        h = g; g = f; f = e; e = (d + t1) >>> 0;
        d = c; c = b; b = a; a = (t1 + t2) >>> 0;
      }
      H[0] = (H[0] + a) >>> 0; H[1] = (H[1] + b) >>> 0; H[2] = (H[2] + c) >>> 0; H[3] = (H[3] + d) >>> 0;
      H[4] = (H[4] + e) >>> 0; H[5] = (H[5] + f) >>> 0; H[6] = (H[6] + g) >>> 0; H[7] = (H[7] + h) >>> 0;
    }
    return H.map(x => x.toString(16).padStart(8, '0')).join('');
  };

  const session = (() => { try { return window.sessionStorage; } catch { return null; } })();
  const empreinte = String(ACCES.empreinte || '').toLowerCase();
  const dejaOuvert = session && empreinte && session.getItem(CLE_SESSION) === empreinte;

  const verrou = $('verrou');
  if (!ACCES.actif || !empreinte || dejaOuvert || !verrou){
    document.body.classList.remove('verrouille');
    if (verrou) verrou.hidden = true;
    ouvrirRegistre();
    return;
  }

  document.body.classList.add('verrouille');
  verrou.hidden = false;
  const form = /** @type {HTMLFormElement} */ ($('verrou-form'));
  const champ = /** @type {HTMLInputElement} */ ($('verrou-code'));
  const etat = $('verrou-etat');
  if (champ) champ.focus();
  if (form) form.addEventListener('submit', event => {
    event.preventDefault();
    const saisie = (champ ? champ.value : '').trim().toUpperCase();
    if (saisie && sha256(saisie) === empreinte){
      if (session){ try { session.setItem(CLE_SESSION, empreinte); } catch { /* navigation privée */ } }
      verrou.hidden = true;
      document.body.classList.remove('verrouille');
      ouvrirRegistre();
      window.scrollTo(0, 0);
    } else {
      if (etat) etat.textContent = 'CODE REFUSÉ';
      if (champ){ champ.value = ''; champ.focus(); }
    }
  });
})();
