// Shared data loading + category metadata.
const CATEGORY_META = {
  'crafts-de-base': { icon: '⚒️', color: '#4ade80', desc: 'Composants et matériaux de base' },
  'armes-communes': { icon: '🗡️', color: '#f87171', desc: 'Armes standards de NationsGlory' },
  'armes-peu-communes': { icon: '⚔️', color: '#fb923c', desc: 'Armes améliorées et rares' },
  'armures': { icon: '🛡️', color: '#38bdf8', desc: 'Pièces d\'armure et équipements' },
  'outils': { icon: '🔧', color: '#a78bfa', desc: 'Outils et instruments' },
  'minerais': { icon: '💎', color: '#22d3ee', desc: 'Minerais et ressources brutes' },
  'parchemins': { icon: '📜', color: '#fbbf24', desc: 'Parchemins magiques' },
  'personnalise': { icon: '✨', color: '#ec4899', desc: 'Crafts personnalisés' },
};

function catMeta(slug) {
  return CATEGORY_META[slug] || { icon: '📦', color: '#94a3b8', desc: '' };
}

async function loadCrafts() {
  // Cache-bust so the user sees their edits immediately.
  const res = await fetch('data/crafts.json?_=' + Date.now());
  if (!res.ok) throw new Error('Impossible de charger data/crafts.json');
  const wiki = await res.json();
  // Merge locally-added crafts (stored in localStorage until the user commits them).
  let local = [];
  try { local = JSON.parse(localStorage.getItem('ng_local_crafts') || '[]'); } catch (_) {}
  return [...wiki, ...local];
}

// Resolve relative data path for subpages too.
function resolveDataPath() {
  // Keep simple: all HTML pages sit at root.
  return 'data/crafts.json';
}
