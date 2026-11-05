# Schéma de la base de données

Base composée de trois tables : **MySQL 8** en local (`blog_db`, conteneur Docker) et **MariaDB 11.8** en production (hébergée sur alwaysdata). Le schéma est identique et compatible avec les deux moteurs. La table comments est celle ajoutée pour la fonctionnalité : chaque commentaire est rattaché à son auteur (user_id) et à l'article commenté (article_id).



Les tables sont créées au démarrage de l'API, dans [`server/config/db.js`](../server/config/db.js) (`CREATE TABLE IF NOT EXISTS`).

```mermaid
erDiagram
    users ||--o{ articles : "écrit"
    users ||--o{ comments : "écrit"
    articles ||--o{ comments : "reçoit"

    users {
        INT id PK "AUTO_INCREMENT"
        VARCHAR(50) username UK "NOT NULL"
        VARCHAR(100) email UK "NOT NULL"
        VARCHAR(255) password "NOT NULL, hash bcrypt"
        TEXT bio "NULL"
        VARCHAR(255) avatar "NULL, chemin du fichier"
        TIMESTAMP created_at "DEFAULT CURRENT_TIMESTAMP"
    }

    articles {
        INT id PK "AUTO_INCREMENT"
        VARCHAR(255) title "NOT NULL"
        TEXT content "NOT NULL"
        VARCHAR(255) image "NULL, chemin du fichier"
        INT user_id FK "NOT NULL, ON DELETE CASCADE"
        TIMESTAMP created_at "DEFAULT CURRENT_TIMESTAMP"
        TIMESTAMP updated_at "ON UPDATE CURRENT_TIMESTAMP"
    }

    comments {
        INT id PK "AUTO_INCREMENT"
        TEXT content "NOT NULL"
        INT article_id FK "NOT NULL, ON DELETE CASCADE"
        INT user_id FK "NOT NULL, ON DELETE CASCADE"
        TIMESTAMP created_at "DEFAULT CURRENT_TIMESTAMP"
    }
```

**Lecture des relations** (notation « patte de corbeau ») :

- Un **utilisateur** écrit **0 à n articles** et **0 à n commentaires**.
- Un **article** reçoit **0 à n commentaires**.
- Un commentaire appartient à **exactement un** article et **exactement un** auteur : ses deux clés étrangères sont `NOT NULL`.
