# Lost & Found — Module Search & Exploration (Binôme 2)

Service de recherche et d'exploration des déclarations d'objets perdus et trouvés pour le centre commercial (Node.js, Express, MongoDB/Mongoose, ES Modules).

---

## 1. Spécification de l'API

* **Endpoint :** `GET /api/posts/search`
* **Format de réponse standard (HTTP 200) :**

```json
{
  "data": [
    {
      "_id": "673a388f63bbd067cba12345",
      "intent": "lost",
      "category": "téléphone",
      "zone": "Food Court",
      "title": "Téléphone perdu",
      "description": "Objet perdu près de la cafétéria.",
      "lat": 36.8065,
      "lng": 10.1815,
      "start": "2026-11-10T14:30:00.000Z",
      "end": "2026-11-10T16:00:00.000Z",
      "status": "active",
      "user": "673a388f63bbd067cba54321",
      "created_at": "2026-11-10T16:05:00.000Z",
      "updated_at": "2026-11-10T16:05:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  },
  "suggestions": []
}
```

---

## 2. Paramètres de Requête (Filtres)

Tous les filtres sont optionnels et combinables :

| Paramètre | Type | Contraintes & Validation | Description |
|---|---|---|---|
| `q` | String | Max 200 caractères | Recherche plein texte sur le titre et la description |
| `intent` | String | `lost` ou `found` | Type d'intention |
| `category` | String | Max 50 caractères | Catégorie (insensible à la casse) |
| `zone` | String | Max 100 caractères | Zone du centre commercial (ex: `Food Court`) |
| `lat`, `lng` | Number | `[-90, 90]` et `[-180, 180]` | Coordonnées du centre de recherche (interdépendants) |
| `radius` | Number | Min 0.1, Max 100 km (défaut : 5) | Rayon de recherche |
| `from`, `to` | Date ISO | `to >= from` | Fenêtre temporelle de recherche |
| `status` | String | `active` (défaut), `resolved`, `expired` | Statut de la déclaration |
| `sort` | String | `recent` (défaut), `oldest`, `relevance` | Ordre de tri |
| `page` | Integer | Min 1 (défaut : 1) | Numéro de page |
| `limit` | Integer | Min 1, Max 50 (défaut : 20) | Nombre de résultats par page |

---

## 3. Architecture du Module

Séparation stricte des responsabilités en couches :

```
src/
├── routes/search.routes.js         # Déclaration des routes Express
├── validators/search.validator.js  # Schéma de validation Joi (req.query)
├── controllers/search.controller.js# Contrôleur HTTP (délégation au service)
├── services/search.service.js      # Logique métier : Promise.all([find, count]) + suggestions
├── utils/
│   ├── buildSearchQuery.js         # Conversion des paramètres HTTP en requête Mongoose
│   ├── geo.js                      # Boîte englobante (bounding-box) & calcul Haversine
│   └── pagination.js               # Calcul du skip/limit et métadonnées de pagination
└── models/post.js                  # Modèle Post et définition des index MongoDB
```

---

## 4. Indexation MongoDB & Performance

Index configurés pour garantir des requêtes optimisées en `IXSCAN` et éviter tout `COLLSCAN` :

1. **Index composé :** `{ intent: 1, status: 1, category: 1, start: -1 }`  
   Optimise la combinaison de filtres la plus fréquente.
2. **Index plein texte :** `{ title: "text", description: "text" }`  
   Recherche textuelle pondérée avec score de pertinence (`$meta: "textScore"`).
3. **Index géographique :** `{ lat: 1, lng: 1 }`  
   Accélère le filtrage par boîte englobante.
4. **Index de zone :** `{ zone: 1 }`  
   Accélère le filtrage direct par zone de centre commercial.
5. **Index chronologique :** `{ created_at: -1 }`  
   Optimise le tri par date de publication.

---

## 5. Choix Techniques & Règles Métier

* **Filtrage par statut :** Par défaut, seuls les posts `active` sont retournés afin d'isoler les annonces en cours des déclarations archivées ou résolues.
* **Fenêtre temporelle par chevauchement :** Deux intervalles se chevauchent si et seulement si `post.start <= to` ET `post.end >= from`.
* **Approximation géographique à deux niveaux :** Pré-filtrage rapide en base via index 2D (`{ lat: 1, lng: 1 }`) sur une boîte englobante (`boundingBox`), puis calcul précis de la distance réelle (`haversineKm`) et tri par proximité.
* **Tolérance aux recherches infructueuses :** En cas d'absence de résultat, l'API renvoie un statut HTTP 200 avec `data: []` accompagné de recommandations ciblées (`suggestions`) pour guider l'utilisateur.
* **Haute scalabilité :**
  * Utilisation systématique de `.lean()` pour limiter l'empreinte mémoire.
  * Plafonnement strict des pages à `limit <= 50`.
  * Requêtes d'indexation prévues pour supporter plus de 100 000 documents sans dégradation.

---

## 6. Scripts de Test & Benchmark

### Seeding (Génération de données de test)
```bash
# Générer 500 déclarations (valeur par défaut)
node scripts/seed.js 500

# Tests de charge : 20, 10 000 ou 100 000 déclarations
node scripts/seed.js 20
node scripts/seed.js 10000
node scripts/seed.js 100000
```

### Benchmark de performance (`explain`)
```bash
node scripts/benchmark.js
```
Mesure les temps d'exécution et extrait les statistiques réelles d'exécution MongoDB (`executionStats`) pour valider l'utilisation des index.

---

## 7. Collection Postman

La collection automatisée [`postman/search.json`](postman/search.json) valide les 9 scénarios clés :
1. Recherche simple (1 filtre : `intent`)
2. Recherche combinée (4 filtres : `intent`, `category`, `sort`, `limit`)
3. Cas 0 résultat avec validation des suggestions
4. Gestion des erreurs de validation (HTTP 422)
5. Pagination (navigation page 2)
6. Tri chronologique (`sort=oldest`)
7. Filtrage géographique avec calcul de `distance_km`
8. Filtrage par zone (`zone=Food Court`)
9. Autocomplétion instantanée (`GET /api/posts/search/autocomplete?q=tél`)

---

## 8. Spécification OpenAPI / Swagger

La documentation complète OpenAPI 3.0 est disponible dans le fichier [`docs/openapi.yaml`](docs/openapi.yaml).
