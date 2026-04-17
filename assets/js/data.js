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

// localStorage keys
const LS = {
  LOCAL: 'ng_local_crafts',       // user-added crafts
  DELETED: 'ng_deleted_ids',      // array of craft ids hidden/removed
  CAT_OVERRIDE: 'ng_cat_overrides', // { slug: {name, icon, color, desc} }
  CUSTOM_CATS: 'ng_custom_cats',    // { slug: {name, icon, color, desc} } for brand-new cats
};

function lsGet(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
  catch { return fallback; }
}
function lsSet(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

function getDeletedIds() { return new Set(lsGet(LS.DELETED, [])); }
function getCategoryOverrides() { return lsGet(LS.CAT_OVERRIDE, {}); }
function getCustomCategories() { return lsGet(LS.CUSTOM_CATS, {}); }

function catMeta(slug) {
  const base = CATEGORY_META[slug] || getCustomCategories()[slug];
  const override = getCategoryOverrides()[slug];
  const merged = Object.assign(
    { icon: '📦', color: '#94a3b8', desc: '', name: slug },
    base || {},
    override || {}
  );
  return merged;
}

function allCategorySlugs(craftList) {
  const s = new Set([
    ...Object.keys(CATEGORY_META),
    ...Object.keys(getCustomCategories()),
    ...(craftList || []).map(c => c.category),
  ]);
  return [...s];
}

async function loadCrafts({ includeDeleted = false } = {}) {
  // Cache-bust so the user sees their edits immediately.
  const res = await fetch('data/crafts.json?_=' + Date.now());
  if (!res.ok) throw new Error('Impossible de charger data/crafts.json');
  const wiki = await res.json();
  const local = lsGet(LS.LOCAL, []);
  const deleted = getDeletedIds();
  const catOverrides = getCategoryOverrides();

  // Local entries override wiki entries with the same id (used for edits).
  const localIds = new Set(local.map(c => c.id));
  let combined = [...wiki.filter(c => !localIds.has(c.id)), ...local];
  if (!includeDeleted) combined = combined.filter(c => !deleted.has(c.id));

  return combined.map(c => applyCategoryOverride(c, catOverrides));
}

function applyCategoryOverride(craft, overrides) {
  const o = overrides[craft.category];
  if (!o) return craft;
  return { ...craft, categoryName: o.name || craft.categoryName };
}
