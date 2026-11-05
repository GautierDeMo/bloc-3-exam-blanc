# Choix des composants et justifications

Ce document porte uniquement sur **ce qui a été ajouté** au projet de départ (commit d'initialisation). La stack technique était imposée : elle n'est pas justifiée ici, seules les briques réutilisées par la fonctionnalité sont mentionnées.

---

## 1. Briques existantes réutilisées

La fonctionnalité **n'ajoute aucune dépendance** : elle s'appuie sur ce que le projet fournissait déjà.

| Brique réutilisée | Ce qu'elle apporte aux commentaires |
| --- | --- |
| **Middleware `verifyToken`** (JWT) | Protège les routes d'écriture. L'identité de l'auteur (`req.userId`) vient du token signé par le serveur, pas du client. |
| **mysql2** | Requêtes **paramétrées** (`?`) : le contenu d'un commentaire ne peut pas modifier une requête SQL. |
| **React (JSX)** | Le contenu des commentaires est **échappé automatiquement** à l'affichage : du HTML saisi s'affiche comme du texte, sans être exécuté. |
| **Styles `.glass`, `.btn` et variables CSS** | Respect du design de la page, exigé par le cahier des charges, sans nouvelle feuille de style. |

---

## 2. Composants de la fonctionnalité commentaires

### Front

| Composant | Responsabilité | Justification |
| --- | --- | --- |
| **`CommentSection`** | Charge la liste, affiche le formulaire de création (ou un lien de connexion), et affiche la liste. | Un seul point d'entrée, intégré en une ligne dans `ArticleDetail` : `<CommentSection articleId={id} />`. |
| **`CommentItem`** | Affiche **un** commentaire, avec son mode édition et ses boutons Modifier / Supprimer. | Chaque commentaire gère **son propre état d'édition**, donc pas de risque d'interférence entre commentaires. Les fichiers restent courts et lisibles. |

### Back

| Composant | Responsabilité | Justification |
| --- | ---| --- |
| **`comment.routes.js`** | Déclare les 4 routes (GET, POST, PUT, DELETE), montées sous `/api/articles/:articleId/comments`. | Un fichier par ressource. L'option `mergeParams: true` permet de lire `articleId` défini dans l'URL de montage. |
| **`comment.controller.js`** | Valide les données, vérifie les droits, puis interroge la base. | Toute la logique des commentaires au même endroit, sur le même modèle que `article.controller.js`. |
| **`verifyToken`** (réutilisé) | Vérifie le JWT et fournit `req.userId`. | Middleware existant : il protège les routes d'écriture **sans dupliquer de code**. |

---

## 3. Choix de conception

| Choix retenu | Pourquoi |
| --- | --- |
| **Routes imbriquées** : `/api/articles/:articleId/comments` | L'URL reflète la relation « un commentaire appartient à un article ». |
| **Recharger la liste** après chaque création, modification ou suppression | Le serveur reste la **seule source de vérité**, pour un coût négligeable à l'échelle d'un blog. |
| **Composant `CommentItem` séparé** | Responsabilités séparées, et un état d'édition propre à chaque commentaire. |
| **Double contrôle de l'auteur** : boutons masqués côté front, **403** côté API | Cacher un bouton n'est pas une sécurité : seule la vérification serveur protège réellement. |

> **En résumé :** la fonctionnalité réutilise la stack, le design et le middleware d'authentification existants. Les nouveaux composants n'ont qu'une responsabilité chacun, et la sécurité est garantie côté serveur.
