# Full-Stack Blog Application (MERN with MySQL)

Une application de blog complète utilisant Node.js, Express, React (Vite) et MySQL.

## Version en ligne

| Service | Hébergeur | URL |
| --- | --- | --- |
| **API** (Express) | Render | [https://bloc-3-exam-blanc-api.onrender.com](https://bloc-3-exam-blanc-api.onrender.com) |
| **Site** (React) | Netlify | [https://bloc-3-exam-blanc.netlify.app](https://bloc-3-exam-blanc.netlify.app) |
| **Base de données** (MariaDB) | alwaysdata | _non accessible publiquement_ |

**Pour l'utiliser :**

1. **Ouvrir d'abord l'URL de l'API** pour la réveiller : l'offre gratuite de Render met le service en veille après quelques minutes d'inactivité, et le réveil peut prendre jusqu'à une minute.
2. Attendre que la page affiche **`Blog API is running...`**.
3. **Ouvrir ensuite l'URL du site**, puis se connecter avec le [compte administrateur](#identifiants-par-défaut) ou créer un compte.

## Documentation

- [Modélisation de l'application](docs/modelisation.md)
- [Choix des composants et justifications](docs/choix-composants.md)
- [Procédure de tests](docs/procedure-tests.md)
- [Schéma de la base de données](docs/schema-bdd.md)

## Démarrage Rapide

### 1. Base de données (Docker)

Si vous utilisez Docker, lancez la base de données :

```bash
cd server
docker-compose up -d
```

### 2. Lancer l'application

Depuis la racine du projet :

```bash
npm run setup
npm run dev
```

## Identifiants par défaut

Au premier lancement, la base de données est automatiquement peuplée avec un utilisateur administrateur et quelques articles.

**Compte Administrateur :**

- **Email :** `admin@blog.com`
- **Mot de passe :** `password123`

## Cahier des Charges

Le fichier [`Cahier des charges - Bloc Blanc 3 SJ2.pdf`](<Cahier des charges - Bloc Blanc 3 SJ2.pdf>) contient les instructions pour la fonctionnalité à implémenter.
