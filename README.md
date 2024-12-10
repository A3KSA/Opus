<h1>README.md Outil interne A3K</h1>
   
## Description
Backend principal de l'outil interne A3K pour différentes applications utilisées par nos collaborateurs. Le projet est basé sur un modèle MVC(s). <img src="https://img.shields.io/badge/Javascript-yellow" /> <img src="https://img.shields.io/badge/-node.js-green" /> <img src="https://img.shields.io/badge/-MVC-blue" />

## Installation (Windows)
- Installer la dernière version LTS (>v18.16.0) de nodeJS
- Verfiier que nodeJS est bien installé avec la commande <b>node -v</b>
- Vérfier que npm est bien installé avec la commande <b>npm -v</b>

Concernant les bases de données, elles sont présentes sur différents serveurs de l'entreprise donc aucune installation nécessaire. I lfaut être connecté au réseau interne (VPN si vous n'êtes pas au bureau.

## Démarrage (Windows)
- Ouvrir un terminal
- Se déplacer dans le répertoire du projet Nodejs (Ou se trouve le fichier "server.js"
- Lancer la commande node <b>server.js</b>

## Applications 
L'outil regroupe différentes applications:

- Inventaire des STEPS
- Cahier de projets
- Gestion du stock
- Wiki A3K
- Gestion des heures
- Générateur Eplan

Cette liste n'est pas actuelle, cela veut dire que pas toutes les applications ont été implémentées. Actuellement la liste des applications implémentées est:

- Inventaire des STEPS
- Cahier de projets

## App en développement  
Actuellement, on développe le générateur Eplan pour facilité le travail aux dessinateurs de Josef Piller.

## Documentation API

Vous pouvez accéder à toutes les API RESTful disponible sur: http://10.10.6.103:3000/api-docs Elle vous permet de voir toutes les fonctions disponible à l'utilisation.
