# R2.02-Projet - Kampus : Mini Réseau Social Étudiant

Kampus (inspiré de MiniBook) est une application web interactive conçue pour permettre aux étudiants d'échanger, de s'entraider et de partager leur vie universitaire au quotidien. Cette plateforme fonctionne intégralement côté client sans aucun rechargement de page

## Fonctionnalités implémentées

L'application répond de manière exhaustive aux exigences du cahier des charges initial :
- [**Authentification complète** : Système d'inscription avec validation de formulaire (champs obligatoires, email valide, unicité de l'adresse, correspondance des mots de passe)]et interface de connexion.
- **Gestion du Profil** : Téléversement d'une photo de profil via un `FileReader`, modification des informations personnelles et gestion d'un avatar par défaut[cite: 11, 12, 36].
- **Fil d'actualité dynamique** : Publication instantanée de messages (textuels ou accompagnés d'images), mise à jour du flux en temps réel sans recharger le navigateur
- **Moteur de recherche & Filtrage** : Recherche en temps réel par contenu ou par nom d'auteur, avec un affichage dédié lorsqu'aucun résultat n'est trouvé.
- **Interactions & Réseau** :
  - Système d'abonnement complet (**Follow / Unfollow**) avec tri prioritaire des publications des étudiants suivis dans le flux principal.
  - Bouton **Like** pour interagir avec les contenus publiés.
  - Bouton **Supprimer** exclusif aux publications dont l'utilisateur connecté est l'auteur.
- **Dashboard Statistique** : Visualisation analytique des activités de l'utilisateur (nombre de publications, mentions J'aime reçues, abonnements actifs).

## Contraintes techniques respectées

- **Technologies** : HTML5, CSS3 (Polices Google Fonts Poppins/Roboto et icônes FontAwesome) et JavaScript Vanilla (ES6+) uniquement.
- **Aucune dépendance externe** : Aucun framework lourd (pas de React, Vue) ni bibliothèque de gestion de données tierce.
- **Persistance des données** : Utilisation exclusive et obligatoire du mécanisme `localStorage` du navigateur avec sérialisation au format JSON pour conserver les profils et les messages d'une session à l'autre.

## Structure du projet

La séparation nette entre structure, présentation et logique applicative a été rigoureusement respectée:
├── index.html      # Structure globale des interfaces (Accueil, Flux, Profils)
├── style.css       # Charte graphique moderne, mise en page et design responsive
├── script.js      # Logique métier, gestion du DOM, filtrages et persistance localStorage
└── data/
    └── utilisateur.png  # Avatar par défaut utilisé par le système