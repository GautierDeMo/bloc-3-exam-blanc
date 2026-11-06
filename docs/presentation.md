# Blog Node — Fonctionnalité Commentaires

Examen blanc — Bloc 3

- Site en ligne : https://bloc-3-exam-blanc-front.onrender.com
- Code source : https://github.com/GautierDeMo/bloc-3-exam-blanc

---

# Objectif

Permettre aux utilisateurs connectés de commenter les articles.

- Lire les commentaires : tout le monde
- Commenter : utilisateur connecté
- Modifier / supprimer : **uniquement l'auteur**
- Table `comments` avec suppression en cascade
- Respect du design existant, sécurité mise en avant

---

# Démo

https://bloc-3-exam-blanc-front.onrender.com

[IMAGE : vue de l'auteur, boutons Modifier / Supprimer]

[IMAGE : vue d'un visiteur non connecté]

---

# Modélisation — Architecture

[IMAGE : diagramme d'architecture]

- Client React → API Express → MariaDB
- Chaque requête : routes → middlewares → contrôleurs → base

Détail : https://github.com/GautierDeMo/bloc-3-exam-blanc/blob/main/docs/modelisation.md

---

# Modélisation — Cas d'utilisation

[IMAGE : diagramme des cas d'utilisation]

- 4 acteurs : visiteur, connecté, auteur d'article, auteur de commentaire
- Modifier / supprimer : réservé à l'auteur

---

# Modélisation — Modifier un commentaire

[IMAGE : diagramme de séquence]

Chaque contrôle arrête la requête :

- Token absent ou invalide → 403 / 401
- Contenu vide → 400
- Commentaire introuvable sur cet article → 404
- Pas l'auteur → 403

---

# Choix des composants

**Créés**

- Front : `CommentSection` (liste + formulaire), `CommentItem` (un commentaire + édition)
- Back : `comment.routes.js` (routes imbriquées sous l'article), `comment.controller.js`

**Réutilisés**

- `verifyToken` (JWT), mysql2, design `.glass` / `.btn`
- Aucune nouvelle dépendance

Détail : https://github.com/GautierDeMo/bloc-3-exam-blanc/blob/main/docs/choix-composants.md

---

# Schéma de la base de données

[IMAGE : schéma entité-relation]

- `comments` : contenu, auteur (`user_id`), article (`article_id`)
- `ON DELETE CASCADE` sur les deux clés étrangères
- MySQL 8 en local, MariaDB 11.8 en production

Détail : https://github.com/GautierDeMo/bloc-3-exam-blanc/blob/main/docs/schema-bdd.md

---

# Sécurité — Ce qui est en place

- Requêtes SQL paramétrées → pas d'injection
- Routes d'écriture protégées par JWT
- Auteur vérifié **côté serveur** (403), pas seulement en masquant les boutons
- Contenu validé (400)
- Affichage échappé par React → pas de XSS

[IMAGE : un autre utilisateur connecté, sans boutons Modifier / Supprimer]

---

# Sécurité — Limites identifiées

- `.env` versionné, avec le secret JWT
- Token absent → 403 au lieu de 401
- HTML / Markdown affichés en texte brut (rendu sûr : librairie Markdown + DOMPurify)
- CORS ouvert à tous les domaines
- URL des images en dur (projet de départ)

---

# Procédure de tests

- **Script automatisé** : 17 scénarios sur l'API, dont les tentatives non autorisées
- **Checklist manuelle** de l'interface, par type d'utilisateur

[IMAGE : sortie du script, 17 PASS]

Détail : https://github.com/GautierDeMo/bloc-3-exam-blanc/blob/main/docs/procedure-tests.md

---

# Déploiement

- Front : Render (site statique)
- API : Render (service web)
- Base : alwaysdata
- 100 % gratuit — compromis : l'API se met en veille (réveil ~1 min)

---

# Fichiers sources

- Dépôt : https://github.com/GautierDeMo/bloc-3-exam-blanc
- Tout ce qui a changé depuis le projet initial : https://github.com/GautierDeMo/bloc-3-exam-blanc/compare/0ed0647...main

---

# Bilan

**Réalisé** : CRUD des commentaires, réservé à l'auteur, testé et déployé

**Pistes d'amélioration**

- Rendu Markdown / HTML sécurisé
- Secrets hors du dépôt
- Codes HTTP 401 / 403 conformes
- Tests automatisés en intégration continue

---

# Merci — Questions ?

- Site : https://bloc-3-exam-blanc-front.onrender.com
- Code : https://github.com/GautierDeMo/bloc-3-exam-blanc
