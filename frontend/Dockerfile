# Étape 1 : Build de l'application
FROM node:20 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Argument de build pour l'API URL
ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN npm run build

# Étape 2 : Exécution avec Next.js
FROM node:20-alpine

WORKDIR /app

# Copier le dossier `.next`, le code et les deps nécessaires
COPY --from=builder /app ./

EXPOSE 3000

# Démarrage de l'app Next.js en mode production
CMD ["npm", "start"]