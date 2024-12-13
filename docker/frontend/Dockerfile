# Étape 1 : Construction de l'application
FROM node:18 AS build-stage

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier les fichiers package.json et package-lock.json dans le conteneur
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste des fichiers du projet dans le conteneur
COPY . .

# Construire l'application
RUN npm run build --prod

# Étape 2 : Configuration pour servir l'application
# Utilisation d'une image NGINX pour servir les fichiers statiques
FROM nginx:alpine

# Supprimez la configuration par défaut
RUN rm /etc/nginx/conf.d/default.conf

# Copier le fichier de configuration NGINX personnalisé
COPY nginx.conf /etc/nginx/nginx.conf

# Copier les fichiers de build dans le répertoire de NGINX
COPY --from=build-stage /app/dist/project-management-frontend/browser /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]

# Exposer le port 80 pour accéder à l'application
EXPOSE 80