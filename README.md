# Lost & Found — Backend API

Backend application for managing lost and found objects (Node.js / Express / MongoDB Mongoose, ES Modules).

---

## Binôme 2 — Search & Exploration

### 1. Contexte & Mission
Le binôme 2 est responsable du moteur de recherche et de l'exploration des déclarations. L'objectif est de permettre aux utilisateurs de retrouver rapidement des objets perdus ou trouvés grâce à une recherche multicritères fluide, performante et tolérante.

* **Endpoint unique :** `GET /api/posts/search`
* **Format des réponses (200 OK) :**
  ```json
  {
    "data": [ /* liste des déclarations */ ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 142,
      "totalPages": 8,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "suggestions": [ /* conseils d'élargissement si 0 résultat */ ]
  }
  ```

---

### 2. Paramètres de Requête (Filtres)

| Paramètre | Type | Validation / Contraintes | Description |
|---|---|---|---|
| `q` | String | Max 200 caractères | Recherche plein texte (titre & description) |
| `intent` | String | `lost` ou `found` | Type d'intention |
| `category` | String | Max 50 caractères | Catégorie (insensible à la casse) |
| `lat`, `lng` | Number | `[-90, 90]` et `[-180, 180]` (interdépendants) | Coordonnées GPS du centre de recherche |
| `radius` | Number | Min 0.1, Max 100 km (défaut: 5) | Rayon de recherche en km |
| `from`, `to` | Date ISO | `to >= from` | Fenêtre temporelle de recherche |
| `status` | String | `active` (défaut), `resolved`, `expired` | Statut de la déclaration |
| `sort` | String | `recent` (défaut), `oldest`, `relevance` | Ordre de tri |
| `page` | Integer | Min 1 (défaut: 1) | Numéro de page |
| `limit` | Integer | Min 1, Max 50 (défaut: 20) | Nombre de résultats par page |

---

### 3. Architecture du Module

Le module respecte une séparation stricte des responsabilités :

```
src/
├── routes/search.routes.js         # Déclaration de la route GET /api/posts/search
├── validators/search.validator.js  # Validation Joi stricte de req.query (source = "query")
├── controllers/search.controller.js# Contrôleur mince : req.validated.query -> service -> res
├── services/search.service.js      # Logique métier : Promise.all([find, count]) + suggestions
├── utils/
│   ├── buildSearchQuery.js         # Traduction filtres HTTP -> filtre Mongoose & projection
│   ├── geo.js                      # Approximation bounding-box + distance Haversine
│   └── pagination.js               # Calcul skip/limit/sort et métadonnées de pagination
└── models/post.js                  # Modèle Post avec schémas & index MongoDB
```

---

### 4. Index MongoDB & Optimisations

Afin d'éviter tout `COLLSCAN` (parcours complet de collection) et garantir des temps de réponse en millisecondes, même sur 100 000 déclarations :

1. **Index composé :** `{ intent: 1, status: 1, category: 1, start: -1 }`
   * Optimise la combinaison de filtres la plus fréquente.
2. **Index texte :** `{ title: "text", description: "text" }`
   * Permet la recherche par mots-clés (`q`) avec calcul de pertinence (`score: { $meta: "textScore" }`).
3. **Index géographique :** `{ lat: 1, lng: 1 }`
   * Accélère les requêtes par boîte englobante (*bounding box*).
4. **Index temporel :** `{ created_at: -1 }`
   * Accélère le tri chronologique par défaut.

---

### 5. Règles de Conception à Justifier à l'Oral

* **Seuls les posts `status = active` sont cherchés par défaut :** les déclarations résolues ou expirées sont masquées pour ne pas encombrer les résultats pertinents.
* **Fenêtre temporelle par chevauchement :** pour trouver un objet perdu/trouvé, on teste le chevauchement d'intervalles (`post.start <= to` ET `post.end >= from`).
* **Géolocalisation par boîte englobante :** conversion du rayon en boîte lat/lng via formule géodésique, filtrage rapide par index `{ lat: 1, lng: 1 }`, puis calcul précis de la distance Haversine et tri par proximité.
* **Gestion du 0 résultat :** retour HTTP 200 avec `data: []` accompagné de `suggestions` actionnables (élargir le rayon, enlever la catégorie, étendre les dates).
* **Scalabilité & performance :**
  * Utilisation systématique de `.lean()` pour éviter l'instanciation coûteuse des documents Mongoose.
  * Limitation stricte à `limit <= 50` par page.
  * Au-delà de 100 000 enregistrements, recommandation d'une pagination par curseur (*keyset pagination* sur `_id` / `created_at`).

---

### 6. Scripts de Test & Benchmark

#### Peuplement de la base (Seeding)
```bash
# Génère 500 déclarations (valeur par défaut)
node scripts/seed.js 500

# Pour les tests de charge : 20, 10 000 ou 100 000 déclarations
node scripts/seed.js 20
node scripts/seed.js 10000
node scripts/seed.js 100000
```

#### Benchmark & Analyse des Index (`explain()`)
```bash
node scripts/benchmark.js
```
Le script exécute les requêtes clés, mesure le temps d'exécution en millisecondes et affiche `explain("executionStats")` pour valider l'utilisation des index (`IXSCAN` vs `COLLSCAN`).

---

### 7. Collection Postman

Le fichier [`postman/search.json`](postman/search.json) contient la suite ordonnée de tests automatisés avec assertions `pm.test` :
1. Recherche simple (1 filtre: `intent`)
2. Recherche combinée (4 filtres : `intent`, `category`, `sort`, `limit`)
3. Cas 0 résultat avec vérification du tableau de suggestions
4. Erreur de validation (HTTP 422 avec détails Joi)
5. Navigation page 2 (validation de la pagination)
6. Tri chronologique croissant (`sort=oldest`)
7. Recherche par rayon géographique (présence de `distance_km`)

---

### 8. Documentation OpenAPI / Swagger

La spécification OpenAPI 3.0 complète est disponible dans le dossier [`docs/openapi.yaml`](docs/openapi.yaml).
