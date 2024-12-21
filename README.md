# Project Management Tool (PMT)

Ce projet est une plateforme collaborative de gestion de projets, permettant aux utilisateurs de créer et gérer des projets, d'attribuer des tâches, et de collaborer efficacement au sein d'une équipe.

## Table des matières
1. [Introduction](#introduction)
2. [Prérequis](#prérequis)
3. [Installation et Lancement](#installation-et-lancement)
   - [Clonage du dépôt](#clonage-du-dépôt)
   - [Configurer la base de données et services auxiliaires](#configurer-la-base-de-données-et-services-auxiliaires)
   - [Lancement en local](#lancement-en-local)
4. [Tests](#tests)
   - [Tests Backend](#tests-backend)
   - [Tests Frontend](#tests-frontend)
5. [Procédure de déploiement avec Docker Compose](#procédure-de-déploiement-avec-docker-compose)
6. [Comptes de Test](#comptes-de-test)

---

## Introduction
PMT est une application conçue pour aider les équipes à collaborer efficacement en permettant la création, la gestion et le suivi des projets et des tâches. L'application utilise :
- **Frontend** : Angular
- **Backend** : Spring Boot
- **Base de données** : PostgreSQL
- **Pipeline CI/CD** : GitHub Actions pour l'intégration continue et le déploiement des images Docker sur Docker Hub.

---

## Prérequis
Assurez-vous d'avoir les outils suivants installés :
- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) (version 18 ou supérieure)
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Java JDK 17](https://openjdk.org/)

---

## Installation et Lancement

### Clonage du dépôt
Le projet utilise un sous-module Git pour le backend. Pour cloner correctement le projet avec tous les fichiers :
```bash
git clone --recurse-submodules https://github.com/votre-utilisateur/project-management-tool.git
```
Si le sous-module n'a pas été initialisé correctement :
```bash
git submodule update --init --recursive
```

### Configuration de la base de données et des services auxiliaires
L'application nécessite PostgreSQL comme base de données, pgAdmin pour la gestion de la base, et MailDev pour capturer les e-mails. Ces services sont configurés via Docker Compose.

#### Étapes pour configurer la base de données :

1. Assurez-vous que Docker est installé et en cours d'exécution sur votre machine.

2. Ouvrez un terminal dans le répertoire racine du projet.
   
3. Lancez les services auxiliaires en utilisant la commande suivante :

```bash
docker-compose up -d
```
#### Services disponibles :
Ce script lancera les services suivants :

**PostgreSQL** : Accessible via localhost:5432

**pgAdmin** : Accessible via http://localhost:5050 (email : pgadmin@pgadmin.org, mot de passe : admin)

**MailDev** : Accessible via http://localhost:1080

> **Note : Le fichier init.sql est utilisé pour initialiser la base de données avec les tables et les données par défaut.**

#### Accéder à la Base de Données :

  - pgAdmin est disponible à l'adresse http://localhost:5050. Connectez-vous avec les identifiants définis dans le fichier `docker-compose.yml`.
  - Une fois connecté à pgAdmin, créez une nouvelle connexion à la base de données PostgreSQL en utilisant les identifiants définis (wael/wael). Vous verrez que le projet backend crée automatiquement sa propre base de données lors de leur démarrage.

### Lancement en local
  1. **Backend :**

  ```bash
  cd project-management-backend
  ./mvnw spring-boot:run
  ```

  2. **Frontend :**

  ```bash
  cd project-management-frontend
  npm install
  ng serve
  ```

 3. **Accéder à l'application :**
    - **Frontend** : `http://localhost:4200`
    - **Backend API** : `http://localhost:8088`

### Migration des Données avec Flyway

Flyway gère la migration des données de la base de données.
  - **Script de création des tables** : `V1__create_db.sql`
  - **Script d'insertion des données** : `V2__Insert_Initial_Data.sql`

Les scripts sont exécutés automatiquement lors du démarrage du backend. Vous pouvez aussi les exécuter manuellement avec :

 ```bash
  ./mvnw flyway:migrate -Dflyway.url=jdbc:postgresql://localhost:5432/pmt -Dflyway.user=wael -Dflyway.password=wael
  ```
---

## Tests

### Tests Backend
Pour exécuter les tests (unitaires et intégrations) et générer un rapport de couverture :

  1. Lancez les tests avec Maven
  ```bash
  cd project-management-backend
  ./mvnw test
  ```
  2. Générer la couverture avec Jacoco
  ```bash
  ./mvn jacoco:report 
  ```
  > Le rapport de couverture Jacoco sera disponible dans **`target/site/jacoco/index.html`**.

### Tests Frontend
Pour exécuter les tests avec Jest et générer un rapport de couverture :
  
   ```bash
   cd project-management-frontend
   npm run test -- --watch=false --coverage
   ```
  > Le rapport sera généré dans **`project-management-frontend/coverage`**.

---

## Procédure de déploiement avec Docker Compose
Cette section explique comment déployer l'application en utilisant les images Docker disponibles sur Docker Hub ou en reconstruisant manuellement les images en cas de modifications dans le code.

- Les images Docker pour le backend et le frontend du projet **Project Management Tool (PMT)** sont disponibles sur Docker Hub.
- Vous pouvez les consulter et les utiliser directement en cliquant sur le lien ci-dessous :

  [**Docker Hub - wa2l99**](https://hub.docker.com/u/wa2l99)

  ### Images disponibles :
  
- **Backend API** : `wa2l99/pmt-api:latest`
- **Frontend** : `wa2l99/pmt-frontend:latest`

### Étape 1 : Préparation
Le fichier `docker-compose.yml` est configuré pour gérer l'ensemble des services nécessaires au bon fonctionnement de l'application : 

- Les services mentionnés précédemment **PostgreSQL**, **pgAdmin** et **MailDev**.
- Les images Docker du frontend et backend : 
  - **Frontend & Backend** (section initialement commenté dans le code) : Services principaux de l'application déployés sous forme de conteneurs Docker.

### Étape 2 : Utilisation des images Docker Hub
Les pipelines CI/CD sont configurés pour construire et pousser automatiquement les images Docker du frontend et du backend sur Docker Hub. Ces images sont accessibles et peuvent être utilisées directement sans nécessiter de reconstruction locale.
Suivez les étapes ci-dessous :

  1. **Décommenter la partie suivante dans `docker-compose.yml`**
     
```yaml
pmt-api:
  container_name: pmt-api
  image: wa2l99/pmt-api:latest
  ports:
    - 8088:8088
  networks:
    - pmt-net
  depends_on:
    - postgres
pmt-frontend:
  container_name: pmt-frontend
  image: wa2l99/pmt-frontend:latest
  ports:
    - 8081:80
  networks:
    - pmt-net
  depends_on:
    - pmt-api
```

3. **Lancer Docker Compose** :
    ```bash
    docker-compose up -d
    ```     

4. **Accéder aux services** : Sans avoir lancer le backend et le frontend en local
    - **Frontend** : [http://localhost:8081](http://localhost:8081)
    - **Backend API** : [http://localhost:8088](http://localhost:8088)

### Reconstruction manuelle des images
En cas de modifications du code source, il est nécessaire de reconstruire les images Docker pour refléter les changements. Voici les étapes à suivre :

#### Backend :
Sous le répetoire `/project-management-tool` :

```bash
docker build -t wa2l99/pmt-api:latest -f docker/backend/Dockerfile .
```

#### Frontend :

```bash
cd project-management-frontend
docker build -t wa2l99/pmt-frontend:1.0.0 -f ../docker/frontend/Dockerfile .
```

### Pusher les nouvelles images sur Docker Hub
Une fois les images Docker construites, vous pouvez les pousser sur Docker Hub pour les rendre accessibles pour un déploiement ultérieur.

  1. Connectez-vous à Docker Hub :
  
  ```bash
  docker login
  ```
  2. Poussez les images sur Docker Hub :
  
  ```bash
  docker push wa2l99/pmt-api:latest
  docker push wa2l99/pmt-frontend:latest
  ```

## Comptes de Test

Pour tester l'application et explorer les fonctionnalités, voici les comptes de test disponibles :

| **Rôle**             | **Email**                | **Mot de passe**     | **Description**                                                                 |
|----------------------|--------------------------|----------------------|---------------------------------------------------------------------------------|
| **Administrateur**   | john.doe@example.com     | password123          | Accès complet : peut créer des projets, gérer les membres, attribuer des rôles et gérer les tâches. |
| **Sans rôle**        | jane.smith@example.com   | password123          | Peut créer un projet pour devenir automatiquement administrateur du projet créé. |
| **Sans rôle**        | morgan.brown@example.com | password123          | Peut créer un projet pour devenir automatiquement administrateur du projet créé. |

### Instructions pour tester
1. Accédez à l'application frontend à l'adresse suivante : [http://localhost:8081](http://localhost:8081).
2. Connectez-vous avec le compte **Administrateur** (`john.doe@example.com`) pour explorer les fonctionnalités d'administration.
   - Créez un nouveau projet ou ouvrez un projet existant.
   - Ajoutez des membres au projet en les invitant via leur email.
   - Attribuez des rôles aux membres (par exemple : Membre ou Observateur) pour définir leurs permissions dans l'application.
3. Déconnectez-vous et connectez-vous avec les comptes des membres ou observateurs auxquels vous avez attribué des rôles :
   - Testez et Explorez les droits et restrictions associés à chaque rôle pour valider les fonctionnalités décrites dans le rapport.
4. Testez également le compte **Sans rôle** (`jane.smith@example.com`) pour explorer le flux de création de projet et son impact sur les permissions.

> **Remarque** : Ces comptes sont préconfigurés dans la base de données via les scripts d'initialisation et peuvent être utilisés directement après le déploiement.

## Conclusion

Ce README fournit les étapes essentielles pour configurer, tester et déployer l'application **Project Management Tool (PMT)**. Avec **Docker Compose**, des pipelines CI/CD, et des comptes de test, vous pouvez facilement explorer les fonctionnalités, tester les rôles et permissions, et déployer rapidement via **Docker Hub**. 

L'application est prête à l'emploi et adaptable à vos besoins.

