# Procédure de tests — Commentaires

La fonctionnalité est vérifiée de deux façons complémentaires :

1. **Tests automatisés de l'API** : un script envoie de vraies requêtes HTTP et contrôle chaque réponse, y compris les tentatives d'accès non autorisées.
2. **Vérifications manuelles de l'interface** : ce que voit et peut faire chaque type d'utilisateur dans le navigateur.

---

## 1. Tests automatisés de l'API

### Prérequis

- La base MySQL tourne dans Docker (`cd server && docker-compose up -d`).
- L'API tourne sur le port 5030 (`cd server && node server.js`).
- Les articles 1 et 2 existent (données de départ créées automatiquement au premier lancement).

### Lancement

```bash
bash server/tests/comments.api.test.sh
```

Le script crée deux utilisateurs de test (A et B), déroule les scénarios, puis **supprime tout ce qu'il a créé** : la base revient à son état initial.

### Scénarios couverts

| Thème | Scénario | Attendu |
|---|---|---|
| **Authentification** | Créer un commentaire sans token | 403 |
| **Validation** | Contenu vide ou composé d'espaces | 400 |
| | Contenu qui n'est pas du texte (`42`) | 400 |
| | Commenter un article inexistant | 404 |
| **Lecture** | Le commentaire apparaît sur son article… | ✓ |
| | … et pas sur un autre article | ✓ |
| **Autorisation** | B modifie le commentaire de A | **403** |
| | B supprime le commentaire de A | **403** |
| **Cohérence** | Modifier via l'URL d'un autre article | 404 |
| **Modification** | Contenu vide, puis contenu valide par l'auteur | 400, puis 200 |
| **Suppression** | Suppression par l'auteur, puis nouvelle tentative | 200, puis 404 |
| **Intégrité** | Supprimer un article supprime ses commentaires (`ON DELETE CASCADE`) | 0 commentaire restant |

### Résultat attendu

Toutes les lignes doivent afficher `PASS` :

```text
PASS  POST without token -> 403
PASS  POST empty content -> 400
...
PASS  CASCADE on article delete -> 0
      test users removed
```

---

## 2. Vérifications manuelles de l'interface

À faire sur la page d'un article (`/article/1`), avec **deux comptes** pour les tests d'auteur.

### Visiteur non connecté

- [ ] Les commentaires de l'article s'affichent, avec l'auteur et la date.
- [ ] À la place du formulaire, un message invite à se connecter, avec un lien vers `/login`.
- [ ] Aucun bouton « Modifier » ni « Supprimer » n'apparaît.

### Utilisateur connecté

- [ ] Le bouton « Commenter » reste désactivé tant que la zone de texte est vide ou ne contient que des espaces.
- [ ] Après publication, le commentaire apparaît en tête de liste, le compteur augmente et la zone de texte se vide.
- [ ] Les retours à la ligne saisis sont conservés à l'affichage.
- [ ] Aucun bouton « Modifier » ni « Supprimer » sur les commentaires **des autres** utilisateurs.

### Auteur du commentaire

- [ ] Les boutons « Modifier » et « Supprimer » apparaissent sur **ses** commentaires.
- [ ] « Modifier » affiche une zone de texte pré-remplie. « Annuler » revient à l'affichage sans rien changer.
- [ ] « Enregistrer » met à jour le contenu, et reste désactivé si la zone est vide.
- [ ] « Supprimer » demande une confirmation. Refuser ne change rien, accepter retire le commentaire et le compteur diminue.

### Sécurité et design

- [ ] Un commentaire contenant `<script>alert('xss')</script>` s'affiche **comme du texte**, sans qu'aucune alerte ne s'ouvre.
- [ ] Après déconnexion, plus aucun bouton d'édition n'est visible.
