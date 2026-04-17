# NG Crafts — Wiki des crafts NationsGlory

Site web statique qui recense tous les crafts de NationsGlory, avec recherche, filtres et ajouts personnalisés.

Données de base scrapées depuis le [wiki NationsGlory Dark](https://nationsglory-dark.fandom.com/fr/wiki/Crafts).

## Structure

```
.
├── index.html          # Accueil (catégories + crafts récents)
├── crafts.html         # Liste complète avec recherche et filtres
├── craft.html          # Détail d'un craft (?id=...)
├── admin.html          # Formulaire pour ajouter des crafts
├── assets/
│   ├── css/style.css
│   └── js/data.js
├── data/
│   ├── crafts.json     # ← Fichier à éditer pour ajouter des crafts
│   └── raw/            # Wikitext brut (peut être supprimé)
└── scripts/
    └── scrape_wiki.py  # Refresh des données depuis le wiki
```

## Ajouter un craft

### Option 1 — Via l'interface (recommandé)

1. Ouvre `admin.html`
2. Remplis le formulaire (nom, catégorie, ingrédients)
3. Clique sur **💾 Sauvegarder localement** pour le tester sur ton navigateur
4. Clique sur **📋 Copier JSON** pour récupérer l'objet JSON
5. Colle-le dans `data/crafts.json` (dans le tableau principal, avant `]`)

### Option 2 — Éditer `data/crafts.json` directement

Ajoute un objet dans le tableau avec cette structure :

```json
{
  "id": "ma-categorie-mon-craft",
  "name": "Mon Craft",
  "category": "armes-communes",
  "categoryName": "Armes Communes",
  "image": null,
  "ingredients": [
    { "qty": 3, "name": "Lingot de Fer" },
    { "qty": 1, "name": "Stick" }
  ],
  "source": "user"
}
```

**Catégories disponibles :** `crafts-de-base`, `armes-communes`, `armes-peu-communes`, `armures`, `outils`, `minerais`, `parchemins`, `personnalise`.

## Rafraîchir les données depuis le wiki

```bash
python3 scripts/scrape_wiki.py
```

Le script conserve les crafts marqués `"source": "user"` et remplace les `"source": "wiki"`.

## Tester en local

Sers le dossier avec n'importe quel serveur HTTP :

```bash
# Python
python3 -m http.server 8000

# Node
npx http-server
```

Puis ouvre http://localhost:8000

> **Note :** ouvrir `index.html` directement dans le navigateur ne fonctionne pas (les requêtes `fetch()` vers `data/crafts.json` sont bloquées par CORS). Il faut passer par un serveur local.

## Déploiement sur GitHub Pages

1. **Créer un repo GitHub** et pousser ce dossier :
   ```bash
   cd "Site Nationsglory"
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<TON_USER>/<TON_REPO>.git
   git push -u origin main
   ```

2. **Activer GitHub Pages** :
   - Va sur ton repo → **Settings** → **Pages**
   - Source : **GitHub Actions**

3. Le workflow `.github/workflows/deploy.yml` se déclenche automatiquement à chaque push sur `main` et déploie le site.

L'URL sera `https://<ton_user>.github.io/<ton_repo>/`.

## Licence

Contenu du wiki © NationsGlory / contributeurs Fandom. Ce projet est une interface communautaire non-officielle.
