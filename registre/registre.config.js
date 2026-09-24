// @ts-check
/* ═══════════════════════════════════════════════════════════════════
   REGISTRE — fichier de configuration éditoriale
   ───────────────────────────────────────────────────────────────────
   C'est le seul fichier à modifier pour mettre le relevé à jour.
   La page (index.html) et le script (registre.js) lisent tout ici.

   Règles d'écriture :
   · les textes s'écrivent tels qu'ils doivent s'afficher (les capitales
     sont appliquées par la page quand il le faut) ;
   · les dates s'écrivent AAAA-MM-JJ (ex. 2026-09-15) ;
   · ne jamais ajouter de prix, de valorisation ou d'estimation d'une
     œuvre ART hollOw : ce champ n'existe pas, volontairement.

   Les annotations @type servent à l'éditeur (VS Code, etc.) : il signale
   une faute de type pendant la saisie, sans rien changer à la page.
   ═══════════════════════════════════════════════════════════════════ */

/**
 * @typedef {Object} Compteur
 * @property {string} libelle  Nom de la série, tel qu'affiché (ex. "APÔTRES").
 * @property {number} fait     Nombre de pièces terminées (entier ≥ 0).
 * @property {number} total    Nombre de pièces prévues (entier ≥ 1).
 */

/**
 * @typedef {Object} Acte
 * @property {string} libelle  Nom de l'acte (ex. "ACTE I").
 * @property {"EN COURS" | "DORMANT"} etat
 *   "EN COURS" : le voyant pulse en rouge. "DORMANT" : voyant fixe, éteint.
 */

/**
 * @typedef {Object} LigneProtocole
 * @property {string} libelle  Nom de la mesure (ex. "RÉSERVOIR").
 * @property {string} valeur   Valeur affichée telle quelle (ex. "100%", "00").
 */

/**
 * @typedef {Object} Depeche
 * @property {string} date   Date AAAA-MM-JJ. Les entrées sont triées par la page,
 *                           de la plus récente à la plus ancienne.
 * @property {string} texte  Une à deux lignes. Ton sec, déclaratif, sans « ! ».
 */

/**
 * @typedef {Object} Oeuvre
 * @property {string} numero  Numéro de registre, avec le dièse (ex. "#040").
 *                            Plus le numéro est grand, plus l'entrée est récente.
 * @property {string} titre   Titre de l'œuvre, tel qu'affiché.
 * @property {string} image   Chemin de l'image, relatif à la page registre
 *                            (ex. "../assets/hollow-finish/040-hollow-bot.png").
 *                            Pour une œuvre animée, mettre son affiche fixe.
 */

/**
 * @typedef {Object} ConfigRegistre
 * @property {{actif: boolean, empreinte: string}} acces
 *   Verrou d'entrée. actif : true pour demander un code, false pour ouvrir la page directement.
 *   empreinte : empreinte SHA-256 (64 caractères hexadécimaux) du code, écrit en CAPITALES.
 *   Le code n'est jamais écrit en clair ici. Pour le changer, calculer l'empreinte du
 *   nouveau code en capitales (ex. sur un site « SHA-256 online » ou avec la commande
 *   PowerShell donnée plus bas) et la coller à la place.
 * @property {string} bandeau              Texte du bandeau rouge défilant (module 0).
 * @property {Oeuvre[]} oeuvres            Toutes les œuvres du registre. L'ordre de saisie n'a pas d'importance.
 * @property {number} piecesAffichees      Nombre de pièces montrées en tête de page (00) : la plus récente en grand,
 *                                         les suivantes en grille (5 = 1 grande + 4 petites).
 * @property {Compteur[]} atelier           Compteurs du relevé d'atelier (module 1), dans l'ordre d'affichage.
 * @property {string} derniereEntree       Date AAAA-MM-JJ affichée sous l'atelier : « DERNIÈRE ENTRÉE — … ».
 * @property {Acte[]} actes                Voyants de l'état des actes (module 2), dans l'ordre d'affichage.
 * @property {LigneProtocole[]} protocole  État du protocole en sommeil, replié sous le dernier acte.
 * @property {Object} cotation             Sources des chiffres de marché (module 3). Aucune clé API.
 * @property {number} cotation.cacheSecondes
 *   Durée pendant laquelle un relevé réussi est réutilisé avant d'être redemandé
 *   (3600 = une heure). Mettre 0 pour redemander à chaque visite.
 * @property {number} cotation.delaiSecondes
 *   Temps maximum d'attente d'une source ; au-delà, la ligne affiche SIGNAL PERDU.
 * @property {string} cotation.nftCollection
 *   Identifiant CoinGecko de la collection NFT dont on relève le volume 24 h,
 *   tel qu'il apparaît dans l'URL de la collection sur CoinGecko.
 * @property {string} cotation.nftLibelle  Nom affiché pour cette collection.
 * @property {string} cotation.ligneArtiste  Nom affiché sur la ligne de l'artiste.
 * @property {Depeche[]} depeches          Fil des dépêches (module 5). Seules les 8 plus récentes s'affichent.
 * @property {string} pied                 Mention du pied de page (module 6).
 * @property {{libelle: string, href: string}[]} liens
 *   Liens du site affichés dans le pied de page. href relatif à la page registre.
 */

/** @type {ConfigRegistre} */
window.REGISTRE_CONFIG = {

  /* ── VERROU ──────────────────────────────────────────────────────── */
  // Code actuel : celui dont l'empreinte est ci-dessous (provisoire : HOLLOW).
  // La saisie est mise en capitales avant comparaison : « hollow » passe aussi.
  // Nouvelle empreinte en PowerShell (remplacer NOUVEAUCODE, en capitales) :
  //   $b=[Text.Encoding]::UTF8.GetBytes('NOUVEAUCODE'); ([Security.Cryptography.SHA256]::Create().ComputeHash($b) | % { $_.ToString('x2') }) -join ''
  // Attention : c'est une porte, pas un coffre. Le contenu de la page reste
  // lisible dans la source par qui sait regarder.
  acces: {
    actif: true,
    empreinte: "2dff4c10b51222c92e9ba93075157ad40e16503bb82b8bca796a1bb6c6d8ac40",
  },

  /* ── 0 · BANDEAU D'AVERTISSEMENT ─────────────────────────────────── */
  bandeau: "RELEVÉ PUBLIC · ACTE I · AUCUNE VALEUR DE MARCHÉ ÉTABLIE · LES CHIFFRES CI-DESSOUS NE VOUS APPARTIENNENT PAS",

  /* ── 00 · PIÈCES AU REGISTRE ────────────────────────────────────── */
  // Les pièces les plus récentes (numéro le plus grand) s'affichent en tête :
  // la dernière entrée en grand, les précédentes en grille. Aucun prix, jamais.
  // Ajouter une œuvre : { numero: "#041", titre: "…", image: "../assets/…" }.
  oeuvres: [
    { numero: "#001", titre: "Sans Cote", image: "../assets/hollow-finish/001-azerzrazea.png" },
    { numero: "#002", titre: "Second Passeport", image: "../assets/hollow-finish/002-cbcbcbcb.png" },
    { numero: "#003", titre: "Propriété Fractionnée", image: "../assets/hollow-finish/003-colorspock.png" },
    { numero: "#004", titre: "Acheteur Vérifié", image: "../assets/hollow-finish/004-cvbfdfd.png" },
    { numero: "#005", titre: "Parité Garantie", image: "../assets/hollow-finish/005-dfhhfd.png" },
    { numero: "#006", titre: "Non Coté", image: "../assets/hollow-finish/006-dhdhg.png" },
    { numero: "#007", titre: "Enchère Garantie", image: "../assets/hollow-finish/007-dithered.png" },
    { numero: "#008", titre: "Carnet d’Ordres", image: "../assets/hollow-finish/008-dsdfdf.png" },
    { numero: "#009", titre: "Compensation Carbone", image: "../assets/hollow-finish/009-eryqyert.png" },
    { numero: "#010", titre: "Avant Estimation", image: "../assets/hollow-finish/010-fyufgyyhu.png" },
    { numero: "#012", titre: "Stockage Longue Durée", image: "../assets/hollow-finish/012-greenforest.png" },
    { numero: "#013", titre: "Certificat Inclus", image: "../assets/hollow-finish/013-hgdhgfd.png" },
    { numero: "#014", titre: "La Main Gauche", image: "../assets/hollow-finish/014-hgkyghkj.png" },
    { numero: "#015", titre: "Appel de Marge", image: "../assets/hollow-finish/015-hkbjjbkjbk.png" },
    { numero: "#016", titre: "Contenu Partenaire", image: "../assets/hollow-finish/016-image.png" },
    { numero: "#017", titre: "Bénéficiaire Effectif", image: "../assets/hollow-finish/017-kkkkkkkkkkkkkkkkkk.png" },
    { numero: "#019", titre: "Destruction de Jetons", image: "../assets/hollow-finish/019-burn.png" },
    { numero: "#020", titre: "Conserver la Position", image: "../assets/hollow-finish/019-reverse.png" },
    { numero: "#021", titre: "Pavillon de Complaisance", image: "../assets/hollow-finish/020-rghfth.png" },
    { numero: "#022", titre: "Feuille de Route", image: "../assets/hollow-finish/021-rtydssrt.png" },
    { numero: "#023", titre: "Attribution Probable", image: "../assets/hollow-finish/023-tyey.png" },
    { numero: "#024", titre: "Fonds Ségrégués", image: "../assets/hollow-finish/024-tyyyyyyyyyyyyy.png" },
    { numero: "#025", titre: "Symphony in Red", image: "../assets/hollow-finish/025-violone.png" },
    { numero: "#026", titre: "Preuve de Réserves", image: "../assets/hollow-finish/026-yhhy.png" },
    { numero: "#027", titre: "Coffre Surprise", image: "../assets/hollow-finish/027-ytjyjghgj.png" },
    { numero: "#029", titre: "Liquidation en Cours", image: "../assets/hollow-finish/posters/029-jujuhjj.png" },
    { numero: "#031", titre: "Frappe Publique", image: "../assets/hollow-finish/posters/031-machine.png" },
    { numero: "#032", titre: "Solde Affiché", image: "../assets/hollow-finish/posters/032-rtyytryrt.png" },
    { numero: "#033", titre: "Fruit de Saison", image: "../assets/hollow-finish/033-appledead.png" },
    { numero: "#034", titre: "Grâce Accordée", image: "../assets/hollow-finish/034-hjjjjjj.png" },
    { numero: "#035", titre: "Frais de Représentation", image: "../assets/hollow-finish/035-blue-monochrome.png" },
    { numero: "#036", titre: "Volume 24 h", image: "../assets/hollow-finish/036-pink.png" },
    { numero: "#037", titre: "Frais de Réseau", image: "../assets/hollow-finish/037-griser.png" },
    { numero: "#038", titre: "Avantage Maison", image: "../assets/hollow-finish/038-green.png" },
    { numero: "#039", titre: "Prévente Privée", image: "../assets/hollow-finish/039-orange-monochrome.png" },
    { numero: "#040", titre: "Enchérisseur Mandaté", image: "../assets/hollow-finish/040-hollow-bot.png" },
    { numero: "#041", titre: "Équipe Anonyme", image: "../assets/hollow-finish/posters/041-rose-baby.png" },
    { numero: "#042", titre: "The Last Expression", image: "../assets/hollow-finish/posters/042-dark-glitch.png" },
    { numero: "#043", titre: "Bougie Verte", image: "../assets/hollow-finish/043-dragon-vert.png" },
    { numero: "#044", titre: "Valeur Sûre", image: "../assets/hollow-finish/044-dragon-bleu.png" },
    { numero: "#045", titre: "Enveloppe Rouge", image: "../assets/hollow-finish/045-dragon-rouge.png" },
    { numero: "#046", titre: "Adossé à l’Or", image: "../assets/hollow-finish/046-dragon-jaune.png" },
    { numero: "#047", titre: "Réseau de Test", image: "../assets/hollow-finish/047-dragon-cyan.png" },
    { numero: "#048", titre: "Partenariat Stratégique", image: "../assets/hollow-finish/048-dragon-magenta.png" },
    { numero: "#049", titre: "Version Originale", image: "../assets/hollow-finish/049-dragon-cl-jaune.png" },
    { numero: "#050", titre: "Droit de Suite", image: "../assets/hollow-finish/050-dragon-cl-rouge.png" },
    { numero: "#051", titre: "Jeton Jumeau", image: "../assets/hollow-finish/051-dragon-cl-rose.png" },
    { numero: "#052", titre: "Marché Secondaire", image: "../assets/hollow-finish/052-dragon-cl-vert.png" },
    { numero: "#053", titre: "Garantie de Rachat", image: "../assets/hollow-finish/053-dragon-cl-bleu.png" },
    { numero: "#054", titre: "Tirage Illimité", image: "../assets/hollow-finish/054-dragon-cl-cyan.png" },
    { numero: "#055", titre: "Clause de Non-Responsabilité", image: "../assets/hollow-finish/055-dragon-noir.png" },
    { numero: "#056", titre: "Livre Blanc", image: "../assets/hollow-finish/056-dragon-gris.png" },
  ],
  piecesAffichees: 5,

  /* ── 1 · RELEVÉ D'ATELIER ────────────────────────────────────────── */
  atelier: [
    { libelle: "APÔTRES",      fait: 7, total: 20 },
    { libelle: "ŒIL ABSTRAIT", fait: 2, total: 10 },
    { libelle: "PIÈCES 1/1",   fait: 0, total: 3 },
  ],

  // Date de la dernière mise à jour de l'atelier (AAAA-MM-JJ).
  derniereEntree: "2026-09-15",

  /* ── 2 · ÉTAT DES ACTES ──────────────────────────────────────────── */
  actes: [
    { libelle: "ACTE I",  etat: "EN COURS" },
    { libelle: "ACTE II", etat: "DORMANT" },
  ],

  // Replié et en gris sous le dernier acte.
  protocole: [
    { libelle: "RÉSERVOIR",       valeur: "100%" },
    { libelle: "SIGNAL / MARCHÉ", valeur: "00" },
    { libelle: "SIGNAL / PARIS",  valeur: "00" },
    { libelle: "SIGNAL / BRUIT",  valeur: "00" },
  ],

  /* ── 3 · COTATION DU JOUR ────────────────────────────────────────── */
  cotation: {
    cacheSecondes: 3600,
    delaiSecondes: 8,
    /* Laisser vide : aucune ligne de volume NFT n'est relevee. Pour en
       suivre une, mettre ici son identifiant CoinGecko (celui de l'URL de
       la collection) et, si on veut le nommer a l'ecran, son libelle. */
    nftCollection: "",
    nftLibelle: "",
    ligneArtiste: "ART hollOw",
  },

  /* ── 5 · DÉPÊCHES ────────────────────────────────────────────────── */
  // Ajouter une entrée : { date: "AAAA-MM-JJ", texte: "…" }. L'ordre de saisie
  // n'a pas d'importance, la page trie par date.
  depeches: [
    { date: "2026-09-15", texte: "Le relevé public est ouvert. Il ne contient aucun prix." },
    { date: "2026-09-14", texte: "Trente-deux fichiers ont reçu une couleur. Aucun n'a reçu d'offre." },
    { date: "2026-09-13", texte: "Le fichier #040 a été enregistré sous le nom Enchérisseur Mandaté." },
    { date: "2026-09-12", texte: "Une œuvre regardée quatre secondes a été regardée plus longtemps que la moyenne." },
    { date: "2026-09-09", texte: "La porte est restée fermée. Huis clos maintenu." },
    { date: "2026-09-08", texte: "Les titres ont été changés. Les fichiers sont restés les mêmes." },
    { date: "2026-09-05", texte: "Trois blocs-machines ajoutés au registre. Volume 24 h : non mesuré." },
    { date: "2026-09-04", texte: "Cinq fichiers retirés du registre. Aucune plainte déposée." },
    { date: "2026-09-01", texte: "Ouverture du registre FINISH." },
  ],

  /* ── 6 · PIED DE PAGE ────────────────────────────────────────────── */
  pied: "ART hollOw · ACTE I · RELEVÉ MIS À JOUR MANUELLEMENT",
  liens: [
    { libelle: "ACCUEIL",  href: "../" },
    { libelle: "REGISTRE", href: "./" },
  ],
};
