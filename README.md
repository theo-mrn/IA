# Yner Chat - Assistant IA avec Recherche Web

Une application de chat intelligente propulsée par Ollama (Mistral) avec capacité de recherche web en temps réel via DuckDuckGo.

## 📋 Description

Yner Chat est une interface de chat moderne qui combine la puissance d'un modèle de langage local (Mistral via Ollama) avec des capacités de recherche web automatique. L'application effectue automatiquement une recherche web pour chaque requête, permettant d'obtenir des réponses enrichies avec des informations récentes et vérifiables.

## ✨ Fonctionnalités

- 🤖 **Chat IA Local** : Utilise Mistral via Ollama pour des réponses rapides et privées
- 🌐 **Recherche Web Automatique** : Chaque prompt déclenche une recherche web via DuckDuckGo
- 📊 **Affichage des Sources** : Les sources web sont affichées avec les réponses
- ⚡ **Streaming en Temps Réel** : Les réponses s'affichent progressivement
- 🎨 **Interface Moderne** : UI élégante avec animations Framer Motion
- 🐳 **Déploiement Docker** : Configuration complète avec Docker Compose
- 🔍 **Indicateurs Visuels** : Feedback visuel pendant la recherche web

## 🏗️ Architecture

Le projet est composé de trois services principaux :

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│  Frontend   │─────▶│  Backend    │─────▶│   Ollama    │
│  (Next.js)  │      │  (Express)  │      │  (Mistral)  │
│   Port 3000 │      │   Port 3001 │      │  Port 11434 │
└─────────────┘      └─────────────┘      └─────────────┘
                            │
                            ▼
                     ┌─────────────┐
                     │ DuckDuckGo  │
                     │    API      │
                     └─────────────┘
```

### Frontend (Next.js 15)
- React 19 avec TypeScript
- Tailwind CSS pour le styling
- Framer Motion pour les animations
- Interface de chat avec streaming en temps réel
- Affichage formaté des réponses avec sources

### Backend (Node.js/Express)
- API REST pour la génération de texte
- Intégration avec Ollama
- Recherche web automatique via DuckDuckGo
- Streaming des réponses
- Extraction et formatage des résultats web

### Ollama
- Modèle Mistral pour la génération de texte
- Exécution locale du modèle IA

## 🚀 Installation

### Prérequis

- [Docker](https://www.docker.com/get-started) (v20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2.0+)
- Au moins 8 GB de RAM disponible pour Ollama
- Connexion internet pour la recherche web

### Installation avec Docker (Recommandé)

#### 1. Cloner le projet

```bash
git clone <votre-repo>
cd IA
```

#### 2. Lancer l'application en production

```bash
docker-compose up -d
```

#### 3. Télécharger le modèle Mistral

```bash
docker exec -it ia-ollama-1 ollama pull mistral:latest
```

#### 4. Accéder à l'application

- Frontend : [http://localhost:3000](http://localhost:3000)
- Backend API : [http://localhost:3001](http://localhost:3001)
- Ollama : [http://localhost:11434](http://localhost:11434)

### Installation en mode développement

#### 1. Lancer avec hot-reload

```bash
docker-compose -f docker-compose.dev.yml up
```

Le mode développement inclut :
- Hot-reload pour le frontend (Next.js Turbopack)
- Nodemon pour le backend
- Volumes montés pour modification en temps réel

#### 2. Installer le modèle

```bash
docker exec -it ia-ollama-1 ollama pull mistral:latest
```

### Installation locale (sans Docker)

#### Backend

```bash
cd backend
npm install
npm run dev
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

**Note** : Pour l'installation locale, vous devez installer Ollama séparément depuis [ollama.ai](https://ollama.ai) et télécharger le modèle Mistral.

## ⚙️ Configuration

### Variables d'environnement

#### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

#### Backend (`backend/.env`)

```env
OLLAMA_URL=http://localhost:11434  # URL d'Ollama
NODE_ENV=development
SYSTEM_PROMPT="Votre prompt système personnalisé"
```

### Personnalisation du prompt système

Le prompt système peut être modifié dans `backend/server.js` (ligne 281) ou via la variable d'environnement `SYSTEM_PROMPT`.

## 📖 Utilisation

1. **Accéder à l'interface** : Ouvrez [http://localhost:3000](http://localhost:3000)

2. **Poser une question** : Tapez votre question dans la zone de texte
   - Exemple : "Quelles sont les dernières nouvelles en IA ?"
   - Exemple : "Explique-moi l'hypothèse de Riemann"

3. **Recherche automatique** : L'application effectue automatiquement une recherche web

4. **Visualiser la réponse** : 
   - La réponse s'affiche en temps réel (streaming)
   - Les sources web sont affichées en bas de la réponse
   - Cliquez sur les sources pour accéder aux sites d'origine

## 📁 Structure du projet

```
IA/
├── backend/
│   ├── server.js              # Serveur Express principal
│   ├── package.json           # Dépendances backend
│   ├── Dockerfile             # Image Docker production
│   └── Dockerfile.dev         # Image Docker développement
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx          # Page principale du chat
│   │   ├── layout.tsx        # Layout Next.js
│   │   ├── globals.css       # Styles globaux
│   │   └── test/
│   │       └── page.tsx      # Page de test
│   ├── components/
│   │   ├── ui/
│   │   │   ├── animated-ai-chat.tsx        # Composant de chat (non utilisé)
│   │   │   └── formatted-response.tsx      # Formatage des réponses
│   │   └── theme-provider.tsx
│   ├── lib/
│   │   └── utils.ts          # Utilitaires (cn, etc.)
│   ├── public/               # Ressources statiques
│   ├── package.json          # Dépendances frontend
│   ├── next.config.ts        # Configuration Next.js
│   ├── tailwind.config.js    # Configuration Tailwind
│   ├── tsconfig.json         # Configuration TypeScript
│   ├── Dockerfile            # Image Docker production
│   └── Dockerfile.dev        # Image Docker développement
│
├── docker-compose.yml         # Configuration Docker production
├── docker-compose.dev.yml     # Configuration Docker développement
└── README.md                  # Ce fichier
```

## 🛠️ Technologies utilisées

### Frontend
- **Next.js 15** : Framework React avec App Router
- **React 19** : Bibliothèque UI
- **TypeScript** : Typage statique
- **Tailwind CSS** : Framework CSS utilitaire
- **Framer Motion** : Animations fluides
- **Lucide React** : Icônes modernes

### Backend
- **Node.js** : Runtime JavaScript
- **Express** : Framework web
- **Axios** : Client HTTP
- **Cheerio** : Parsing HTML
- **dotenv** : Gestion des variables d'environnement

### IA & Infrastructure
- **Ollama** : Exécution locale de modèles IA
- **Mistral** : Modèle de langage
- **DuckDuckGo API** : Recherche web
- **Docker & Docker Compose** : Conteneurisation

## 🔧 Développement

### Commandes utiles

#### Logs des services

```bash
# Tous les services
docker-compose logs -f

# Service spécifique
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f ollama
```

#### Redémarrer un service

```bash
docker-compose restart backend
docker-compose restart frontend
```

#### Arrêter l'application

```bash
docker-compose down
```

#### Supprimer les volumes (réinitialisation complète)

```bash
docker-compose down -v
```

### Tester la recherche web

Le backend expose l'endpoint `/api/generate` qui accepte un POST avec :

```json
{
  "prompt": "Votre question"
}
```

Exemple avec curl :

```bash
curl -X POST http://localhost:3001/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Quelles sont les dernières nouvelles en IA ?"}'
```

### Lister les modèles Ollama disponibles

```bash
curl http://localhost:11434/api/tags
```

Ou via l'API backend :

```bash
curl http://localhost:3001/api/models
```

## 🐛 Dépannage

### Le modèle Mistral n'est pas trouvé

```bash
# Vérifier que le conteneur Ollama fonctionne
docker ps | grep ollama

# Télécharger le modèle
docker exec -it ia-ollama-1 ollama pull mistral:latest

# Lister les modèles installés
docker exec -it ia-ollama-1 ollama list
```

### Le frontend ne se connecte pas au backend

1. Vérifier que le backend est en ligne : `curl http://localhost:3001/api/models`
2. Vérifier la variable `NEXT_PUBLIC_API_URL` dans le frontend
3. Vérifier les logs : `docker-compose logs backend`

### La recherche web ne fonctionne pas

1. Vérifier la connexion internet
2. Vérifier les logs backend pour voir les erreurs de recherche
3. DuckDuckGo peut avoir des limites de taux - attendre quelques minutes

### Performances lentes

1. Augmenter la RAM allouée à Docker (minimum 8 GB recommandé)
2. Ajuster les paramètres du modèle dans `server.js` :
   - `num_ctx` : Contexte (défaut: 4096)
   - `num_thread` : Threads CPU (défaut: 4)
   - `temperature` : Créativité (défaut: 0.7)

## 📝 Améliorations futures

- [ ] Historique des conversations
- [ ] Support de plusieurs modèles IA
- [ ] Export des conversations
- [ ] Mode sombre/clair
- [ ] Support multilingue
- [ ] Cache des recherches web
- [ ] API de gestion des sources
- [ ] Tests unitaires et E2E

## 📄 Licence

Ce projet est sous licence ISC.

## 👨‍💻 Auteur

Créé avec ❤️ par Theo

---

**Note** : Ce projet utilise Ollama pour exécuter des modèles IA localement. Assurez-vous d'avoir suffisamment de ressources système pour faire fonctionner Mistral correctement.

