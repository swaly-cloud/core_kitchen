# 🍳 CoreKitchen

> SaaS de gestion culinaire professionnelle — recettes, coûts, nutrition, allergènes.

CoreKitchen est une plateforme SaaS pour les professionnels des métiers de bouche (restaurants, traiteurs, dark kitchens) leur permettant de standardiser leurs fiches techniques, calculer automatiquement leurs coûts et leurs valeurs nutritionnelles, et remplacer leurs fichiers Excel.

## 🚀 État du projet

**Phase 1 — Fondations + Auth** ✅ livrée

Les fondations sont en place : authentification JWT, multi-tenancy strict (Organizations), gestion de profil, infrastructure Docker complète.

| Phase | Module | Statut |
|------|---------|--------|
| 1 | Auth + multi-tenant + profile | ✅ Livré |
| 2 | Gestion des ingrédients | ✅ Livré |
| 3 | Recettes & sous-recettes | ✅ Livré |
| 4 | Cost engine | ✅ Livré |
| 5 | Calculs nutritionnels | ⏳ À venir |
| 6 | Dashboard avancé | ⏳ À venir |

## 🛠️ Stack

**Backend** : Java 21 · Spring Boot 3.3 · Spring Security 6 · PostgreSQL 16 · Flyway · JWT (jjwt) · springdoc-openapi

**Frontend** : Next.js 15 (App Router) · React 19 · TypeScript · TailwindCSS · TanStack Query · Zustand · React Hook Form · Zod · Axios

**Infra** : Docker · docker-compose · Testcontainers

## ⚡ Démarrage rapide

Pré-requis : Docker Desktop (ou Docker Engine + Compose v2).

```bash
git clone <repo> core_kitchen
cd core_kitchen
cp .env.example .env
docker compose up --build
```

À la première exécution, la stack télécharge les images puis :
- `postgres` démarre (port 5432)
- `backend` applique les migrations Flyway puis seed les users de démo
- `frontend` build et démarre Next.js (port 3000)

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| Health | http://localhost:8080/actuator/health |

### Comptes de démo

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| `admin@demo.com` | `Demo1234!` | ADMIN |
| `chef@demo.com`  | `Demo1234!` | CHEF |

Vous pouvez aussi créer un compte (et une nouvelle entreprise) via la page `/register`.

## 📂 Structure du repo

```
core_kitchen/
├── backend/                # Spring Boot 3 / Java 21
│   ├── src/main/java/com/corekitchen/
│   │   ├── auth/           # authentication + JWT
│   │   ├── users/          # users & profile
│   │   ├── organizations/  # tenants
│   │   ├── ingredients/    # phase 2 (placeholder)
│   │   ├── recipes/        # phase 3 (placeholder)
│   │   ├── costs/          # phase 4 (placeholder)
│   │   ├── nutrition/      # phase 5 (placeholder)
│   │   └── shared/         # config, exceptions, audit, tenant
│   └── src/main/resources/
│       ├── application.yml
│       └── db/migration/   # Flyway V1, V2, V3
├── frontend/               # Next.js 15
│   └── src/
│       ├── app/            # pages App Router
│       ├── components/     # UI + layout
│       ├── lib/            # axios + utils
│       ├── stores/         # Zustand authStore
│       └── hooks/          # TanStack Query hooks
├── docker-compose.yml
├── .env.example
└── README.md
```

## 🔐 Architecture multi-tenant

Chaque utilisateur appartient à une `Organization` (entreprise). Le `organization_id` est embarqué dans le JWT à la connexion, puis chargé dans un `TenantContext` (ThreadLocal) par le `JwtAuthenticationFilter` à chaque requête. Les services métier des phases suivantes filtreront systématiquement leurs requêtes par ce tenant ID, garantissant l'isolation des données entre clients.

## 🧪 Tests

### Backend

```bash
cd backend
./mvnw test
```

Lance les tests unitaires (`JwtServiceTest`) et les tests d'intégration `UserServiceTest` + `AuthControllerIT` (parcours complet register → login → me → refresh → logout) sur un PostgreSQL éphémère via Testcontainers.

### Frontend

```bash
cd frontend
npm install --legacy-peer-deps
npm run typecheck
npm run lint
```

## 🧰 Variables d'environnement

Toutes paramétrables via `.env` à la racine (voir `.env.example`) :

| Variable | Description | Défaut |
|----------|-------------|--------|
| `POSTGRES_USER` | Utilisateur DB | `corekitchen` |
| `POSTGRES_PASSWORD` | Mot de passe DB | `corekitchen_dev_password` |
| `POSTGRES_DB` | Nom de la base | `corekitchen` |
| `JWT_SECRET` | Secret JWT (≥ 32 chars) | — (à changer en prod !) |
| `JWT_ACCESS_TTL_MIN` | Durée access token | `15` minutes |
| `JWT_REFRESH_TTL_DAYS` | Durée refresh token | `7` jours |
| `NEXT_PUBLIC_API_URL` | URL backend pour le frontend | `http://localhost:8080` |

## 🧭 Endpoints disponibles

### Phase 1 — Auth & Profil
```
POST  /api/auth/register      → Crée organization + user ADMIN, renvoie tokens
POST  /api/auth/login         → Authentifie, renvoie tokens
POST  /api/auth/refresh       → Rotate refresh token, renvoie nouveau couple
POST  /api/auth/logout        → Révoque le refresh token

GET   /api/users/me           → Utilisateur connecté
PATCH /api/users/me           → Update profil (firstName, lastName)
POST  /api/users/me/password  → Change mot de passe
```

### Phase 2 — Ingrédients
```
GET    /api/ingredients        → Liste paginée (search, sort, filtre catégorie)
POST   /api/ingredients        → Créer un ingrédient
GET    /api/ingredients/{id}   → Détail
PUT    /api/ingredients/{id}   → Modifier
DELETE /api/ingredients/{id}   → Supprimer
```

### Phase 3 — Recettes
```
GET    /api/recipes            → Liste paginée (search, status, sort)
POST   /api/recipes            → Créer une recette
GET    /api/recipes/{id}       → Détail (ingrédients, sous-recettes, étapes, allergènes)
PUT    /api/recipes/{id}       → Modifier
PATCH  /api/recipes/{id}/status → Changer le statut (DRAFT / PUBLISHED / ARCHIVED)
DELETE /api/recipes/{id}       → Supprimer
```

### Phase 4 — Cost Engine
```
GET    /api/recipes/{id}/cost  → Coût calculé à la volée
                                  { totalCost, costPerPortion, foodCostPercentage, lines[] }
```

> **Devise** : TND (Dinar Tunisien). Le champ `sellingPrice` (optionnel) sur les recettes active le calcul du food cost %.
> Les unités supportées : KG, G, L, ML, CL (conversion automatique), PIECE, BUNCH, PORTION (pas de conversion inter-famille).

Toutes les routes protégées attendent `Authorization: Bearer <accessToken>`. Voir Swagger UI pour les schémas détaillés.

## 🐳 Commandes utiles

```bash
docker compose up --build           # Build + démarrage
docker compose up                   # Démarrage (après premier build)
docker compose down                 # Stop tout
docker compose down -v              # Stop + remove volumes (reset DB)
docker compose logs -f backend      # Logs backend en suivi
docker compose exec postgres psql -U corekitchen -d corekitchen  # Shell DB
```

## 📐 Décisions d'architecture

- **Monolith modulaire** : un seul backend Spring Boot organisé en modules (auth, users, ingredients...). Plus simple à déployer qu'une approche microservices pour un MVP, mais structure prête à extraire des services plus tard.
- **Stateless JWT** : pas de session côté serveur. Refresh tokens hashés stockés en DB pour pouvoir les révoquer (logout, rotation à chaque refresh).
- **BCrypt cost 10** pour le hash des passwords.
- **Multi-tenancy via `tenant_id`** (shared schema). Plus simple qu'un schema-per-tenant pour le MVP, encore performant à plusieurs milliers de tenants.
- **Flyway** pour toute évolution de schéma. Le DataSeeder Java seed les users de démo en utilisant le BCryptPasswordEncoder de Spring (cohérence garantie).
- **TanStack Query** côté front : caching automatique, invalidation propre, gestion d'erreur centralisée.

## ⚠️ Notes de sécurité

- Le `JWT_SECRET` du `.env.example` est explicitement marqué comme dev-only. **Générer une vraie clé** (≥ 32 octets) avant tout déploiement (`openssl rand -base64 64`).
- Le refresh token est stocké en `localStorage` côté frontend pour la simplicité du MVP — vulnérable aux XSS. **À migrer vers un cookie `httpOnly` Secure** côté backend avant la mise en production.

## 📝 Licence

Privé — © 2026 CoreKitchen.
