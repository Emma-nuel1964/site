# Site vitrine de Fluxia

Le site est fait de HTML, CSS et JavaScript, sans outil à installer.

## Ouvrir le site
Double-cliquez sur `index.html` : le site s'ouvre dans le navigateur, sans serveur ni connexion internet.

## Les pages
| Fichier | Page |
|---|---|
| `index.html` | Accueil |
| `abonnement.html` | L'offre, et plus tard le paiement de l'abonnement |
| `a-propos.html` | À propos de nous : le mot du fondateur, la mission, la vision et les valeurs |
| `contact.html` | Contact, avec le formulaire |
| `politique-confidentialite.html` | Politique de confidentialité (**produite par un outil, ne pas modifier à la main**) |
| `suppression-compte.html` | Supprimer son compte (**produite par un outil, ne pas modifier à la main**) |
| `404.html` | Page introuvable |

## Où modifier quoi
- **Les textes** : directement dans chaque fichier `.html`.
- **Les polices** : tout le site est en **Inter**, comme le site de Mova (mova-mobility.com).
  - Les grands titres sont en graisse moyenne (500), aux lettres resserrées : `.titre-1` et `.titre-2`.
  - Les sous-titres sont en demi-gras (600) : `.titre-3` et les autres titres.
  - La police des titres se règle dans `css/style.css`, avec la variable `--police-titre`.
  - L'ancienne police des titres, Inter Tight, n'est plus utilisée. Son fichier est resté dans `polices/`.
- **Les couleurs** : en tête de `css/style.css`, dans le bloc `:root`. Les boutons reprennent le bleu des cartes de l'application (`--degrade-app`) : un dégradé du bleu nuit `#0B2D45` au bleu vif `#2E6FE0`.
- **Le bouton « Télécharger l'application »**, avec les logos de l'App Store et de Google Play : il ouvre pour l'instant la fenêtre « L'application arrive bientôt » (`js/site.js`). Le jour de la publication, il faudra le faire pointer vers les magasins, et utiliser les badges officiels d'Apple et de Google, que leurs règles imposent.
- **Le menu et le pied de page** : ils sont recopiés dans chaque page. Une modification doit être faite **dans toutes les pages et dans `modeles/page-legale.html`**.
- **Le numéro WhatsApp et de téléphone** (05 395 02 23) : il apparaît dans toutes les pages, dans `js/site.js` (constante `WHATSAPP`) et dans l'application (`lib/core/config/support_contact.dart`). Pour le changer, cherchez `053950223` et `05&nbsp;395&nbsp;02&nbsp;23` dans tous les fichiers.
- **Les icônes** : elles sont dessinées dans `js/site.js` (liste `ICONES`) et utilisées dans les pages avec `<svg class="icone"><use href="#i-nom"></use></svg>`.
- **Les réseaux sociaux** (pied de page de toutes les pages, sous la phrase de présentation) : Instagram, Facebook et WhatsApp.
  - Instagram et Facebook attendent leur adresse : pour l'instant, leur lien est `href="#"`, et un toucher ne fait rien.
  - Quand une page existera, remplacez `href="#"` par son adresse, et retirez `data-reseau-a-venir`. Faites-le dans toutes les pages et dans `modeles/page-legale.html`, puis relancez l'outil des pages légales (voir plus bas).
  - WhatsApp ouvre déjà la discussion avec le numéro du support (05 395 02 23).
- **Les témoignages** (accueil, section `id="temoignages"`) : chaque avis est un élément `<li class="temoignage">` de la liste.
  - Pour en ajouter un, copiez un élément entier, puis changez le texte, les initiales et le nom. Le défilement s'adapte tout seul au nombre d'avis.
  - Les clients n'ont pas voulu de photo : un rond affiche leurs initiales.
  - Pour ajouter le commerce et la ville sous le nom, remplacez `<strong>Nom</strong>` par `<span><strong>Nom</strong><span>Commerce · Ville</span></span>`.
  - **Uniquement de vrais avis**, donnés avec l'accord du client. Pour une case d'attente, la classe `temoignage--a-remplacer` l'encadre d'orange en pointillés.

## La vidéo de démonstration
- **Ce qu'elle montre** : en haut de l'accueil, la vidéo de 20 secondes (`videos/fluxia-demo.mp4`) montre le téléphone seul, **sans aucun texte autour**, avec les vrais écrans de Fluxia, le commerce **d'exemple** « Emmanuel » et des montants inventés :
  - on enregistre un paiement ;
  - on le retrouve dans l'historique.

  À la fin, le téléphone fait un tour sur lui-même et revient à la première image : la boucle ne se voit pas.
- **Le format** : portrait (4:5), pour que le téléphone soit grand. Le cadre de l'accueil a le même format (`.cadre-video`, dans `css/style.css`).
- **Les fichiers** :
  - `images/video-affiche.jpg` : l'image affichée avant le démarrage, qui est aussi la première image de la vidéo ;
  - `videos/fluxia-demo-1080.mp4` : la version en haute qualité (1080 × 1350, le format portrait de Facebook et d'Instagram), à partager.
- **La lecture** : elle démarre seule, sans le son, et en boucle. Il n'y a pas de bouton : un toucher sur la vidéo la met en pause ou la relance. Elle ne démarre pas seule si le visiteur a demandé moins d'animations ou économise ses données (l'affiche reste visible).
- **Si les écrans de l'application changent**, la vidéo doit être refaite. Elle a été tournée image par image à partir de l'application, puis assemblée avec ffmpeg (installé dans `C:\Users\Emmanuel Brayane\outils\ffmpeg`).

## La vidéo de présentation
- **Où** : dans la section « L'application » de l'accueil (`id="application"`), sur toute la largeur, au format 16:9.
- **Ce qu'elle raconte (52 secondes, avec le son)** :
  1. **Le problème** : un cahier, une calculatrice, des oublis… « À la fin du mois, combien avez-vous vraiment gagné ? »
  2. **Fluxia apparaît** : « Fluxia fait les comptes à votre place. »
  3. **Tous les secteurs** : « Quelle que soit votre activité, une gestion facile. »
     - Quatre photos de commerces apparaissent : une boutique, des taxis, un restaurant et une boutique de prêt-à-porter.
     - Les secteurs que propose l'application apparaissent ensuite, avec leurs icônes : Boutique, Taxi, Restaurant, Salon de coiffure et Autres.
     - Les photos ont été fournies le 12/10/2026. Elles sont rangées dans `C:\Users\Emmanuel Brayane\outils\video_fluxia\photos`.
  4. **Toutes les fonctions, sur les vrais écrans** :
     - tous ses commerces dans un seul compte (jusqu'à 4) ;
     - un mot de passe par commerce ;
     - noter un encaissement en quelques secondes ;
     - corriger une erreur le jour même (le paiement porte la mention « Modifié ») ;
     - retrouver chaque jour et chaque mois ;
     - voir son activité progresser (courbe, clients, chiffre d'affaires) ;
     - les notifications : nouvel appareil connecté, fin de l'essai gratuit.
  5. **La fin** : « Pilotez votre activité en toute clarté », 14 jours d'essai gratuit, bientôt sur l'App Store et Google Play.
- **Les chiffres** : ce sont **les vrais chiffres du commerce « Emmanuel »** (salon de coiffure), lus dans Supabase le 12/10/2026, du 26 septembre au 11 octobre 2026. Ils sont **visibles par tous** les visiteurs du site.
  - On les voit dans l'historique (les mois de septembre et d'octobre, et les jours) et dans les statistiques d'octobre.
  - Ils sont copiés dans `donnees-emmanuel.json` (dans `C:\Users\Emmanuel Brayane\outils\video_fluxia\video`), que le tournage lit tout seul. Sans ce fichier, la vidéo reprend des chiffres d'exemple.
  - Les paiements du jour montrés à l'écran sont des exemples.
  - Les deux autres commerces (« Emmanuel Resto » et « Emmanuel Boutique ») sont des exemples : les vrais s'appellent « Moi ».
- **Le son** :
  - la musique a été écrite note par note par un programme, sans aucun enregistrement extérieur : il n'y a donc **aucun droit à payer** ;
  - les bruitages (crayon, touches, validation, transitions) tombent exactement sur l'image.
- **Les fichiers** :
  - `videos/fluxia-presentation.mp4` : la version du site (1280 × 720, 3,9 Mo) ;
  - `videos/fluxia-presentation-1080.mp4` : la version en haute qualité (1920 × 1080), à partager ;
  - `images/presentation-affiche.jpg` : l'affiche (1920 × 1080). C'est l'image de la vidéo à 4 secondes : « Un cahier. Une calculatrice. Des oublis. », avec le cahier et la calculatrice qui affiche « Erreur ». Pour la refaire à partir de la vidéo, dans le dossier de ffmpeg :
    ```
    ffmpeg -i videos/fluxia-presentation-1080.mp4 -vf "select=eq(n\,122)" -frames:v 1 -q:v 3 images/presentation-affiche.jpg
    ```
- **La lecture** :
  - rien n'est téléchargé avant que le visiteur touche le bouton de lecture : ses données mobiles sont épargnées ;
  - le lecteur du navigateur prend ensuite le relais (pause, volume, plein écran) ;
  - à la fin, l'affiche et le bouton reviennent ;
  - sans JavaScript, la vidéo garde les commandes du navigateur.
- **Si les écrans de l'application changent**, elle doit être refaite, comme la vidéo de démonstration.

## Les pages légales
Leur texte est celui de l'application : `lib/core/legal/privacy_policy.dart`, dans le dossier `fluxia`.

Après une modification de ce texte, dans le dossier `fluxia`, lancez :

```
dart run tool/politique_web.dart ../fluxia_site
```

L'outil reprend le gabarit `modeles/page-legale.html` (menu, pied de page, style) et réécrit les deux pages.

## À compléter
- [ ] **Ta photo** : un portrait net, au format vertical (4 × 5), à placer dans `images/fondateur.jpg`. Le commentaire en haut du bloc du fondateur, dans `a-propos.html`, explique la ligne à remplacer.
- [ ] **Le mot du fondateur**, dans `a-propos.html` : c'est un brouillon, à valider ou à remplacer avant la mise en ligne.
- [ ] **La disponibilité**, dans `contact.html` : « 24h/24, 7 jours sur 7 », comme dans l'application. À confirmer.
- [ ] **Les droits des quatre photos** de la vidéo de présentation (boutique, taxis, restaurant, prêt-à-porter) : si elles viennent d'internet, il faut l'accord de leur auteur ou une licence avant la mise en ligne. Sinon, il faut les remplacer par des photos libres de droits ou prises par vous.
- [ ] **L'adresse email de contact**, quand elle existera : à ajouter dans la page Contact, dans le pied de page et dans la politique de confidentialité.
## Plus tard
- **La mise en ligne** : le site fonctionne chez n'importe quel hébergeur de sites statiques. Il suffit de copier le dossier entier, sauf `modeles/` et ce fichier. Une fois le nom de domaine choisi, il faudra ajouter :
  - l'adresse complète des pages dans les balises `og:` (aperçu des liens partagés sur WhatsApp) ;
  - les fichiers `robots.txt` et `sitemap.xml`.
- **Le paiement de l'abonnement** : il prendra place dans le bloc « Payer mon abonnement » de `abonnement.html` (`id="paiement"`).
- **L'envoi du formulaire de contact** : pour l'instant, `js/site.js` vérifie la saisie et propose WhatsApp, sans rien envoyer.

## Ce que le site respecte
- **Aucune ressource extérieure** : les polices sont dans `polices/`, avec leur licence. Aucun cookie n'est déposé et aucune mesure d'audience n'est faite.
- **Les animations s'arrêtent** si le visiteur a demandé à les réduire dans son téléphone.
- **Sans JavaScript, le contenu reste lisible** : seules les icônes et les animations manquent.
- **La vidéo du haut** montre un commerce et des montants **d'exemple**. **La vidéo de présentation** montre les vrais chiffres du commerce « Emmanuel », sauf les paiements du jour et les deux autres commerces. Les anciennes captures `images/app-*.jpg` ne sont plus utilisées par aucune page.
