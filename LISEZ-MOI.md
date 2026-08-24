# Créneaux — mise en service sur mobile

Application autonome. Aucune dépendance, aucun compte, aucun serveur :
les données restent dans le navigateur de l'appareil.

## Contenu

| Fichier | Rôle |
|---|---|
| `index.html` | l'application entière (interface + logique) |
| `manifest.json` | déclaration PWA : nom, icônes, mode plein écran |
| `sw.js` | service worker — met l'app en cache pour l'usage hors ligne |
| `icon-*.png` | icônes 192 / 512 / 512 maskable |

## Étape 1 — mettre les fichiers en ligne (HTTPS obligatoire)

L'installation sur écran d'accueil et la génération d'un `.apk` exigent
toutes deux une origine sécurisée. Le fichier ouvert en `file://` fonctionne
pour tester, mais le service worker ne s'y enregistrera pas.

**GitHub Pages**, gratuit et suffisant :

1. Créer un dépôt public, par exemple `creneaux`.
2. Y déposer les six fichiers **à la racine**, pas dans un sous-dossier.
3. Settings → Pages → Source : `Deploy from a branch`, branche `main`, dossier `/ (root)`.
4. Attendre une minute. L'URL est `https://<utilisateur>.github.io/creneaux/`.

Netlify Drop (glisser-déposer du dossier sur `app.netlify.com/drop`) donne
le même résultat sans dépôt Git.

## Étape 2a — installer sans passer par le store

Ouvrir l'URL dans Chrome sur Android, puis menu `⋮` → **Installer l'application**
(ou *Ajouter à l'écran d'accueil*). L'icône apparaît dans le tiroir d'applications,
l'app s'ouvre en plein écran sans barre d'adresse et fonctionne hors ligne.

C'est la voie la plus courte. Pour un usage personnel, elle suffit :
le résultat est indiscernable d'une application installée.

## Étape 2b — obtenir un vrai fichier .apk

Si tu veux le paquet Android signé, par exemple pour l'installer sur
plusieurs appareils sans passer par le navigateur :

1. Aller sur `pwabuilder.com`.
2. Coller l'URL de l'étape 1, lancer l'analyse.
3. `Package for stores` → **Android**.
4. Laisser `Signing key: Create new`, puis télécharger.

L'archive contient un `.apk` (installation directe) et un `.aab`
(dépôt sur le Play Store). **Conserve le fichier `signing.keystore`
et son mot de passe** : sans lui, aucune mise à jour ultérieure ne
pourra être installée par-dessus, il faudra désinstaller d'abord.

Pour installer l'`.apk` : le transférer sur le téléphone et autoriser
l'installation depuis des sources inconnues pour le gestionnaire de fichiers.

## Sauvegarde

Le stockage navigateur disparaît si tu effaces les données du site ou
désinstalles l'application. Le bouton **Exporter** en bas de page produit
un `tournois.json`. **Importer** le relit — c'est aussi la façon de passer
ton planning d'un appareil à l'autre.

## Trajets

Le calcul enchaîne deux services publics gratuits, sans clé d'API :

- **Base Adresse Nationale** (`api-adresse.data.gouv.fr`) pour convertir un lieu en coordonnées ;
- **OSRM** (`router.project-osrm.org`) pour l'itinéraire routier.

Conséquences : les lieux doivent être **français** et écrits assez précisément
(`12 rue de la Paix, 75002 Paris` plutôt que `Paris`). Le serveur OSRM public
est un serveur de démonstration — largement suffisant pour quelques requêtes,
mais il peut être lent ou indisponible. En cas d'échec, saisis la durée à la main :
une valeur manuelle n'est jamais écrasée par un recalcul.
