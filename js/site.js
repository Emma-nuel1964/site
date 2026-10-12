/* ==========================================================================
   Fluxia : comportements du site vitrine.
   - les icônes (dessins au trait, une seule source pour tout le site) ;
   - le menu sur téléphone ;
   - les apparitions douces au défilement ;
   - les onglets du téléphone (accueil) ;
   - la fenêtre « L'application arrive bientôt » (bouton « Télécharger l'application ») ;
   - le formulaire de contact, qui n'envoie encore rien ;
   - la vidéo de démonstration (pause au toucher, hors de l'écran) ;
   - les réseaux sociaux du pied de page, dont les adresses viendront plus tard ;
   - l'année du pied de page.
   Sans JavaScript, le site reste lisible : seules les icônes et les
   animations manquent.
   ========================================================================== */
(function () {
  'use strict';

  /* Numéro WhatsApp du support, au format international (même numéro que
     dans l'application : lib/core/config/support_contact.dart). */
  var WHATSAPP = '242053950223';
  var LIEN_PREVENIR = 'https://wa.me/' + WHATSAPP + '?text=' +
    encodeURIComponent("Bonjour, prévenez-moi quand l'application Fluxia sera disponible, s'il vous plaît.");

  /* ------------------------------------------------------------------------
     Icônes : chaque page les utilise avec <svg class="icone"><use href="#i-nom"></use></svg>.
     ------------------------------------------------------------------------ */
  var ICONES = {
    'menu': '<path d="M4 7h16M4 12h16M4 17h16"/>',
    'fermer': '<path d="M6 6l12 12M18 6 6 18"/>',
    'fleche-droite': '<path d="M5 12h14M13 6l6 6-6 6"/>',
    'fleche-diag': '<path d="M7 17 17 7M8 7h9v9"/>',
    // Logos des magasins d'applications (Simple Icons, domaine public).
    'apple': '<path fill="currentColor" stroke="none" d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>',
    'google-play': '<path fill="currentColor" stroke="none" d="M22.018 13.298l-3.919 2.218-3.515-3.493 3.543-3.521 3.891 2.202a1.49 1.49 0 0 1 0 2.594zM1.337.924a1.486 1.486 0 0 0-.112.568v21.017c0 .217.045.419.124.6l11.155-11.087L1.337.924zm12.207 10.065l3.258-3.238L3.45.195a1.466 1.466 0 0 0-.946-.179l11.04 10.973zm0 2.067l-11 10.933c.298.036.612-.016.906-.183l13.324-7.54-3.23-3.21z"/>',
    'eclair': '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"/>',
    'synchro': '<path d="M20 11a8 8 0 0 0-14.3-4.9L4 8M4 4v4h4M4 13a8 8 0 0 0 14.3 4.9L20 16M20 20v-4h-4"/>',
    'boutique': '<path d="M3 10l2-6h14l2 6M4 10v10h16V10M3 10h18M9 20v-6h6v6"/>',
    'bouclier': '<path d="M12 3 5 6v6c0 4.6 3 8 7 9 4-1 7-4.4 7-9V6l-7-3z"/><path d="m9 12 2 2 4-4"/>',
    'cadenas': '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    'cloche': '<path d="M18 16v-5a6 6 0 0 0-12 0v5l-2 2h16zM10 21a2 2 0 0 0 4 0"/>',
    'graphique': '<path d="M4 20V4M4 20h16M8 16v-4M12 16V8M16 16v-6"/>',
    'historique': '<path d="M3 12a9 9 0 1 0 2.6-6.4L3 8M3 3v5h5M12 7v5l3 2"/>',
    'smartphone': '<rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M11 18h2"/>',
    'appel': '<path d="M21.5 16.4v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 1.6 3.7 2 2 0 0 1 3.6 1.5h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L7.5 9.4a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.8 2.1z"/>',
    'message': '<path d="M21 11.5a8.4 8.4 0 0 1-12.3 7.5L3 21l2-5.6A8.5 8.5 0 1 1 21 11.5z"/>',
    'position': '<path d="M12 21s-7-6.1-7-11.5a7 7 0 0 1 14 0C19 14.9 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    'coche-cercle': '<circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.8 2.8L16 10"/>',
    'croix-cercle': '<circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/>',
    'poubelle': '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    'oeil-barre': '<path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6 0 9.5 7 9.5 7a17 17 0 0 1-2.6 3.4M6.6 6.6C3.9 8.4 2.5 12 2.5 12S6 19 12 19a9.5 9.5 0 0 0 4.4-1.1M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
    'etincelle': '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 15v4M17 17h4"/>',
    'coeur': '<path d="M20.4 5.6a5 5 0 0 0-7.1 0L12 6.9l-1.3-1.3a5 5 0 1 0-7.1 7.1L12 21l8.4-8.3a5 5 0 0 0 0-7.1z"/>',
    'carte': '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M16 15h2"/>',
    'info': '<circle cx="12" cy="12" r="9"/><path d="M12 16v-4.5M12 8h.01"/>',
    'chevron-bas': '<path d="m6 9 6 6 6-6"/>',
    'horloge': '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    'envoyer': '<path d="M21 3 10 14M21 3l-7 18-4-7-7-4z"/>',
    'calcul': '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01"/>',
    // Réseaux sociaux (pied de page), au trait comme les autres icônes.
    'instagram': '<rect x="2.5" y="2.5" width="19" height="19" rx="5.5"/><circle cx="12" cy="12" r="4.2"/><path d="M17.4 6.6h.01"/>',
    'facebook': '<path d="M17.5 2.5h-2.8a4.7 4.7 0 0 0-4.7 4.7v2.9H7.2v3.8H10v7.6h3.8v-7.6h2.9l.9-3.8h-3.8V7.6a1 1 0 0 1 1-1h2.7z"/>',
    'whatsapp': '<path d="M3 21l1.6-4.7a9 9 0 1 1 3.1 3.1z"/><g transform="translate(7.7 7.1) scale(.38)"><path fill="currentColor" stroke="none" d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2.1z"/></g>'
  };

  function insererIcones() {
    var symboles = Object.keys(ICONES).map(function (nom) {
      return '<symbol id="i-' + nom + '" viewBox="0 0 24 24">' + ICONES[nom] + '</symbol>';
    }).join('');
    document.body.insertAdjacentHTML('afterbegin',
      '<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" ' +
      'style="position:absolute;width:0;height:0;overflow:hidden">' + symboles + '</svg>');
  }

  /* ------------------------------------------------------------------------
     Menu sur téléphone
     ------------------------------------------------------------------------ */
  function activerMenu() {
    var entete = document.querySelector('[data-entete]');
    var bascule = document.querySelector('[data-nav-bascule]');
    if (!entete || !bascule) return;

    function basculer(ouvrir) {
      if (ouvrir) {
        entete.setAttribute('data-menu-ouvert', '');
      } else {
        entete.removeAttribute('data-menu-ouvert');
      }
      bascule.setAttribute('aria-expanded', String(ouvrir));
      bascule.setAttribute('aria-label', ouvrir ? 'Fermer le menu' : 'Ouvrir le menu');
    }

    bascule.addEventListener('click', function () {
      basculer(!entete.hasAttribute('data-menu-ouvert'));
    });
    entete.querySelectorAll('.nav a').forEach(function (lien) {
      lien.addEventListener('click', function () { basculer(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && entete.hasAttribute('data-menu-ouvert')) {
        basculer(false);
        bascule.focus();
      }
    });
  }

  /* ------------------------------------------------------------------------
     Apparitions au défilement
     ------------------------------------------------------------------------ */
  function activerApparitions() {
    var elements = document.querySelectorAll('[data-apparition]');
    var reduit = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduit || !('IntersectionObserver' in window)) {
      elements.forEach(function (el) { el.classList.add('visible'); });
      return;
    }

    var observateur = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (entree) {
        if (entree.isIntersecting) {
          entree.target.classList.add('visible');
          observateur.unobserve(entree.target);
        }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });

    elements.forEach(function (el) { observateur.observe(el); });
  }

  /* ------------------------------------------------------------------------
     Onglets du téléphone : chaque onglet montre une capture de l'application.
     ------------------------------------------------------------------------ */
  function activerOnglets() {
    document.querySelectorAll('[data-onglets]').forEach(function (groupe) {
      var onglets = Array.prototype.slice.call(groupe.querySelectorAll('[role="tab"]'));

      function choisir(choisi, focus) {
        onglets.forEach(function (onglet) {
          var actif = onglet === choisi;
          onglet.setAttribute('aria-selected', String(actif));
          onglet.tabIndex = actif ? 0 : -1;
          var panneau = document.getElementById(onglet.getAttribute('aria-controls'));
          if (panneau) panneau.hidden = !actif;
        });
        if (focus) choisi.focus();
      }

      onglets.forEach(function (onglet, i) {
        onglet.addEventListener('click', function () { choisir(onglet, false); });
        onglet.addEventListener('keydown', function (e) {
          var pas = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
          if (!pas) return;
          e.preventDefault();
          choisir(onglets[(i + pas + onglets.length) % onglets.length], true);
        });
      });
    });
  }

  /* ------------------------------------------------------------------------
     Fenêtre « L'application arrive bientôt ». Sans JavaScript (ou sans <dialog>),
     les boutons mènent directement à WhatsApp.
     ------------------------------------------------------------------------ */
  function activerFenetreSortie() {
    var declencheurs = document.querySelectorAll('[data-fenetre="sortie"]');
    if (!declencheurs.length) return;

    var fenetre = document.createElement('dialog');
    if (typeof fenetre.showModal !== 'function') return;

    fenetre.className = 'fenetre';
    fenetre.setAttribute('aria-labelledby', 'fenetre-sortie-titre');
    fenetre.innerHTML =
      '<div class="fenetre-contenu">' +
      '<span class="logos-fenetre" aria-hidden="true">' +
      '<span class="icone-carre"><svg class="icone"><use href="#i-apple"></use></svg></span>' +
      '<span class="icone-carre"><svg class="icone"><use href="#i-google-play"></use></svg></span>' +
      '</span>' +
      '<h2 id="fenetre-sortie-titre">L\'application arrive bientôt</h2>' +
      "<p>Fluxia sera bientôt disponible sur l'App&nbsp;Store et sur Google&nbsp;Play. Écrivez-nous sur " +
      "WhatsApp&nbsp;: nous vous préviendrons dès sa sortie.</p>" +
      '<div class="fenetre-actions">' +
      '<a class="bouton bouton-plein" href="' + LIEN_PREVENIR + '" target="_blank" rel="noopener">' +
      '<svg class="icone" aria-hidden="true"><use href="#i-message"></use></svg>Me prévenir sur WhatsApp</a>' +
      '<button class="bouton bouton-contour" type="button" data-fermer>Fermer</button>' +
      '</div></div>';
    document.body.appendChild(fenetre);

    var dernierDeclencheur = null;
    declencheurs.forEach(function (lien) {
      lien.addEventListener('click', function (e) {
        e.preventDefault();
        dernierDeclencheur = lien;
        fenetre.showModal();
      });
    });
    fenetre.querySelector('[data-fermer]').addEventListener('click', function () { fenetre.close(); });
    // Un toucher en dehors de la fenêtre la referme.
    fenetre.addEventListener('click', function (e) {
      if (e.target === fenetre) fenetre.close();
    });
    fenetre.addEventListener('close', function () {
      if (dernierDeclencheur) dernierDeclencheur.focus();
    });
  }

  /* ------------------------------------------------------------------------
     Formulaire de contact : il vérifie la saisie, puis explique qu'il n'est
     pas encore actif. Rien n'est envoyé ni enregistré, et le texte reste.
     ------------------------------------------------------------------------ */
  function activerFormulaire() {
    var formulaire = document.querySelector('[data-formulaire-contact]');
    if (!formulaire) return;

    var statut = formulaire.querySelector('[data-statut]');
    var champs = Array.prototype.slice.call(formulaire.querySelectorAll('[data-verifier]'));

    function erreurDe(champ) {
      var valeur = champ.value.trim();
      if (champ.required && !valeur) return champ.getAttribute('data-message-vide');
      if (champ.type === 'tel' && valeur && valeur.replace(/\D/g, '').length < 8) {
        return 'Ce numéro semble incomplet.';
      }
      return '';
    }

    function afficher(champ, message) {
      var zone = document.getElementById(champ.id + '-erreur');
      champ.setAttribute('aria-invalid', message ? 'true' : 'false');
      if (zone) {
        zone.textContent = message;
        zone.hidden = !message;
      }
    }

    champs.forEach(function (champ) {
      champ.addEventListener('input', function () {
        if (champ.getAttribute('aria-invalid') === 'true') afficher(champ, erreurDe(champ));
      });
    });

    formulaire.addEventListener('submit', function (e) {
      e.preventDefault();
      var premier = null;
      champs.forEach(function (champ) {
        var message = erreurDe(champ);
        afficher(champ, message);
        if (message && !premier) premier = champ;
      });
      if (premier) {
        statut.hidden = true;
        premier.focus();
        return;
      }
      statut.hidden = false;
      statut.focus();
    });
  }

  /* ------------------------------------------------------------------------
     Vidéo de démonstration (accueil), sans bouton : un toucher sur la vidéo
     la met en pause ou la relance. Elle ne démarre pas seule si le visiteur
     a demandé moins d'animations ou économise ses données (l'affiche reste
     visible), et se met en pause hors de l'écran.
     ------------------------------------------------------------------------ */
  function activerVideo() {
    var video = document.querySelector('[data-video-demo]');
    if (!video) return;

    var reduit = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var economie = navigator.connection && navigator.connection.saveData;
    // Pause choisie par le visiteur (ou par ses réglages) : on ne relance pas.
    var pauseVoulue = !!(reduit || economie);

    function lire() {
      var promesse = video.play();
      if (promesse && promesse.catch) promesse.catch(function () {});
    }

    if (pauseVoulue) {
      video.removeAttribute('autoplay');
      video.pause();
    }

    video.addEventListener('click', function () {
      pauseVoulue = !video.paused;
      if (pauseVoulue) {
        video.pause();
      } else {
        lire();
      }
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entrees) {
        if (entrees[0].isIntersecting) {
          if (!pauseVoulue && video.paused) lire();
        } else if (!video.paused) {
          video.pause();
        }
      }, { threshold: 0.2 }).observe(video);
    }
  }

  /* ------------------------------------------------------------------------
     Vidéo de présentation (accueil), avec le son : elle ne se charge et ne
     démarre qu'au toucher du bouton, puis le lecteur du navigateur prend le
     relais. À la fin, l'affiche et le bouton reviennent.
     ------------------------------------------------------------------------ */
  function activerLecteur() {
    document.querySelectorAll('[data-lecteur]').forEach(function (lecteur) {
      var video = lecteur.querySelector('video');
      var bouton = lecteur.querySelector('.lecteur-lancer');
      if (!video || !bouton) return;

      // Les commandes du navigateur (présentes sans JavaScript) attendent le
      // toucher du bouton.
      video.controls = false;

      bouton.addEventListener('click', function () {
        lecteur.classList.add('est-lance');
        video.controls = true;
        var promesse = video.play();
        if (promesse && promesse.catch) {
          promesse.catch(function () {
            // Lecture refusée par le navigateur : le bouton revient.
            lecteur.classList.remove('est-lance');
            video.controls = false;
          });
        }
        video.focus();
      });

      video.addEventListener('ended', function () {
        video.controls = false;
        video.load(); // l'affiche revient
        lecteur.classList.remove('est-lance');
        bouton.focus();
      });
    });
  }

  /* ------------------------------------------------------------------------
     Témoignages qui défilent (accueil) : la liste est doublée pour que le
     défilement reparte sans saut, et sa durée suit sa longueur. Rien ne bouge
     si le visiteur a demandé moins d'animations : les avis se font alors
     défiler à la main.
     ------------------------------------------------------------------------ */
  function activerTemoignages() {
    var reduit = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduit) return;
    document.querySelectorAll('[data-defile]').forEach(function (defile) {
      var piste = defile.querySelector('.defile-piste');
      if (!piste || !piste.children.length) return;
      Array.prototype.slice.call(piste.children).forEach(function (avis) {
        var copie = avis.cloneNode(true);
        copie.setAttribute('aria-hidden', 'true');
        piste.appendChild(copie);
      });
      defile.classList.add('est-pret');
      // Environ 40 pixels par seconde, quel que soit le nombre d'avis.
      var largeur = piste.scrollWidth / 2;
      piste.style.setProperty('--duree', Math.max(20, Math.round(largeur / 40)) + 's');
    });
  }

  /* ------------------------------------------------------------------------
     Réseaux sociaux du pied de page : tant qu'une adresse n'est pas connue
     (href="#"), un toucher ne fait rien, au lieu de remonter en haut de la
     page.
     ------------------------------------------------------------------------ */
  function activerReseaux() {
    document.querySelectorAll('[data-reseau-a-venir]').forEach(function (lien) {
      lien.addEventListener('click', function (e) { e.preventDefault(); });
    });
  }

  function mettreAnnee() {
    var annee = String(new Date().getFullYear());
    document.querySelectorAll('[data-annee]').forEach(function (el) { el.textContent = annee; });
  }

  insererIcones();
  activerMenu();
  activerApparitions();
  activerOnglets();
  activerFenetreSortie();
  activerFormulaire();
  activerVideo();
  activerLecteur();
  activerTemoignages();
  activerReseaux();
  mettreAnnee();
})();
