# LokalPay - Plateforme de Paiement Local

LokalPay est une plateforme innovante de paiement local conçue pour faciliter les échanges économiques au sein des communautés. Elle transforme les transactions invisibles en historique fiable, permettant aux commerçants et utilisateurs d'accéder à des crédits basés sur la réputation.

## Fonctionnalités

- **Évaluation des partenaires** : Système de notation pour construire la confiance entre utilisateurs.
- **Transactions sécurisées** : Intégration avec Supabase pour une gestion fiable des données.
- **Interface moderne** : Utilisation de React, TypeScript et Tailwind CSS pour une expérience utilisateur fluide.
- **Multilingue** : Support de l'internationalisation avec i18next.
- **Authentification** : Gestion des utilisateurs via Supabase Auth.
- **Dashboard interactif** : Visualisation des transactions, évaluations et statistiques.

## Technologies utilisées

- **Frontend** : React 18, TypeScript, Vite
- **UI/UX** : Tailwind CSS, Shadcn/ui, Radix UI
- **Backend** : Supabase (Base de données PostgreSQL, Auth, Storage)
- **Outils** : ESLint, Vitest, PostCSS
- **Internationalisation** : i18next
- **Icônes** : Lucide React
- **Graphiques** : Recharts

## Installation

### Prérequis

- Node.js (version LTS recommandée, ex. 20.x ou 22.x)
- npm ou yarn
- Git

### Étapes d'installation

1. **Clonez le dépôt** :
   ```bash
   git clone <url-du-depot>
   cd divine-design-connect
   ```

2. **Installez les dépendances** :
   ```bash
   npm install
   ```

3. **Configurez les variables d'environnement** :
   Créez un fichier `.env` à la racine avec vos clés Supabase :
   ```
   VITE_SUPABASE_URL=votre-url-supabase
   VITE_SUPABASE_ANON_KEY=votre-cle-anonyme
   ```

4. **Lancez le serveur de développement** :
   ```bash
   npm run dev
   ```

   L'application sera accessible sur `http://localhost:5173`.

## Scripts disponibles

- `npm run dev` : Lance le serveur de développement
- `npm run build` : Construit l'application pour la production
- `npm run build:dev` : Construit en mode développement
- `npm run lint` : Vérifie et corrige le code avec ESLint
- `npm run preview` : Prévisualise la version de production
- `npm test` : Lance les tests avec Vitest
- `npm run test:watch` : Lance les tests en mode surveillance

## Structure du projet

```
src/
├── components/
│   ├── ui/          # Composants réutilisables (boutons, dialogues, etc.)
│   ├── landing/     # Pages d'accueil
│   ├── dashboard/   # Composants du tableau de bord
│   └── ...
├── contexts/        # Contextes React (Auth, etc.)
├── hooks/           # Hooks personnalisés
├── i18n/            # Configuration d'internationalisation
├── integrations/    # Intégrations externes (Supabase)
├── lib/             # Utilitaires et configurations
├── pages/           # Pages de l'application
└── test/            # Tests
```

## Configuration Supabase

Le projet utilise Supabase pour la base de données et l'authentification. Assurez-vous de :

1. Créer un projet Supabase
2. Configurer les tables nécessaires (voir migrations dans `supabase/migrations/`)
3. Mettre à jour les variables d'environnement

## Tests

Les tests sont écrits avec Vitest et @testing-library/react. Lancez-les avec :

```bash
npm test
```

## Contribution

1. Forkez le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/nouvelle-fonction`)
3. Commitez vos changements (`git commit -am 'Ajoute nouvelle fonctionnalité'`)
4. Poussez vers la branche (`git push origin feature/nouvelle-fonction`)
5. Ouvrez une Pull Request

## Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.

## Contact

Pour toute question ou suggestion, contactez l'équipe de développement.
