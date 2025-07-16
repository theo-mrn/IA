# Étape 1 : base Node.js
FROM node:20

# Répertoire de travail dans le container
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste de l'app
COPY . .

# Exposer le port utilisé par ton serveur (ex: 3001)
EXPOSE 3001

# Lancer l'application
CMD ["npm", "start"]