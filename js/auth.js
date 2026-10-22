/* ==========================================================================
   Fluxia — page /auth/ : les liens des emails de Fluxia (confirmation
   d'adresse, nouveau mot de passe) ouverts sans l'application (ordinateur,
   téléphone sans Fluxia). Sur un téléphone où Fluxia est installée, Android
   ouvre directement l'application et cette page ne s'affiche pas.

   - Confirmation : la vérification ne part qu'au toucher du bouton. Les
     logiciels qui ouvrent les liens des emails pour les analyser ne
     consomment donc pas le lien, qui ne sert qu'une fois.
   - Nouveau mot de passe : le lien est vérifié à l'envoi du formulaire, le
     mot de passe est changé, puis la session ouverte par le lien est
     aussitôt refermée.

   Seule la clé publique du projet figure ici (elle est faite pour une page
   web). Rien n'est enregistré dans le navigateur.
   ========================================================================== */
(function () {
  'use strict';

  var SUPABASE = 'https://xgryvsihnewjbutxahzf.supabase.co';
  var CLE_PUBLIQUE = 'sb_publishable_vuyhrwROl98YED-JdpPiig_73ZLReUc';
  var PAQUET_ANDROID = 'com.fluxia.fluxia';

  /* Type du lien (paramètre « type ») -> bloc de la page. */
  var BLOCS = { email: 'confirmation', signup: 'confirmation', recovery: 'nouveau-mot-de-passe' };

  var MESSAGE_RESEAU = 'Connexion impossible. Vérifiez votre connexion internet, puis réessayez.';
  var MESSAGE_TROP = 'Trop de tentatives. Réessayez dans quelques minutes.';

  var racine = document.querySelector('[data-auth]');
  if (!racine) return;

  var statut = racine.querySelector('[data-statut]');
  var statutTexte = racine.querySelector('[data-statut-texte]');

  var parametres = new URLSearchParams(window.location.search);
  var type = parametres.get('type');
  var jetonLien = parametres.get('token_hash');
  var lienValide = !!(BLOCS[type] && jetonLien && /^[A-Za-z0-9_-]{10,200}$/.test(jetonLien));

  // L'adresse affichée ne garde pas le lien à usage unique (historique,
  // copie, partage).
  try {
    window.history.replaceState(null, '', window.location.pathname);
  } catch (e) {
    // Navigateur qui le refuse : sans conséquence pour la suite.
  }

  function montrer(nom) {
    var blocs = racine.querySelectorAll('[data-etat]');
    for (var i = 0; i < blocs.length; i++) {
      blocs[i].hidden = blocs[i].getAttribute('data-etat') !== nom;
    }
    statut.hidden = true;
  }

  function afficherStatut(texte) {
    statutTexte.textContent = texte;
    statut.hidden = false;
    statut.focus();
  }

  /* Appel au service de connexion (Supabase Auth). Renvoie toujours
     { ok, code, donnees } ; seule une coupure réseau est une erreur. */
  function appeler(methode, chemin, corps, jeton) {
    var entetes = { 'Content-Type': 'application/json', apikey: CLE_PUBLIQUE };
    if (jeton) entetes.Authorization = 'Bearer ' + jeton;
    return fetch(SUPABASE + '/auth/v1' + chemin, {
      method: methode,
      headers: entetes,
      body: corps ? JSON.stringify(corps) : undefined
    }).then(function (reponse) {
      return reponse.text().then(function (texte) {
        var donnees = null;
        try {
          donnees = texte ? JSON.parse(texte) : null;
        } catch (e) {
          donnees = null;
        }
        return { ok: reponse.ok, code: reponse.status, donnees: donnees };
      });
    });
  }

  /* Vérifie le lien : ouvre une session de ce compte et renvoie son jeton. */
  function verifierLien() {
    return appeler('POST', '/verify', { type: type, token_hash: jetonLien }).then(function (r) {
      if (r.ok && r.donnees && r.donnees.access_token) return r.donnees.access_token;
      var erreur = new Error('lien refusé');
      erreur.code = r.code;
      throw erreur;
    });
  }

  /* Referme la session ouverte par le lien : le compte s'utilise dans
     l'application, pas dans le navigateur. */
  function fermerSession(jeton) {
    return appeler('POST', '/logout?scope=local', null, jeton).catch(function () {});
  }

  /* Lien refusé (expiré, déjà servi), trop d'essais, ou coupure réseau. */
  function traiterEchec(erreur) {
    if (erreur && erreur.code === 429) {
      afficherStatut(MESSAGE_TROP);
    } else if (erreur && erreur.code >= 400 && erreur.code < 500) {
      montrer('invalide');
    } else {
      afficherStatut(MESSAGE_RESEAU);
    }
  }

  if (!lienValide) {
    montrer('incomplet');
    return;
  }

  // Sur Android, le lien peut aussi être ouvert dans l'application, si elle
  // est installée ; sinon le navigateur revient sur cette page.
  if (/Android/i.test(navigator.userAgent)) {
    var adresse = 'appfluxia.com/auth/?type=' + encodeURIComponent(type) +
      '&token_hash=' + encodeURIComponent(jetonLien);
    var intention = 'intent://' + adresse + '#Intent;scheme=https;package=' + PAQUET_ANDROID +
      ';S.browser_fallback_url=' + encodeURIComponent('https://' + adresse) + ';end';
    var liens = racine.querySelectorAll('[data-ouvrir-app]');
    for (var i = 0; i < liens.length; i++) {
      liens[i].href = intention;
      liens[i].hidden = false;
    }
  }

  montrer(BLOCS[type]);

  /* ---- Confirmation de l'adresse ---------------------------------------- */
  var boutonConfirmer = racine.querySelector('[data-confirmer]');
  boutonConfirmer.addEventListener('click', function () {
    boutonConfirmer.disabled = true;
    statut.hidden = true;
    verifierLien()
      .then(fermerSession)
      .then(function () {
        montrer('confirmee');
      })
      .catch(function (erreur) {
        boutonConfirmer.disabled = false;
        traiterEchec(erreur);
      });
  });

  /* ---- Nouveau mot de passe --------------------------------------------- */
  var formulaire = racine.querySelector('form[data-etat="nouveau-mot-de-passe"]');
  var boutonEnregistrer = formulaire.querySelector('button[type="submit"]');
  // Gardé si l'enregistrement échoue : le lien ne sert qu'une fois, on
  // réessaie donc sans le revérifier.
  var jetonSession = null;

  function erreurChamp(nom, message) {
    var champ = formulaire.elements[nom];
    var texte = document.getElementById(nom + '-erreur');
    if (message) {
      champ.setAttribute('aria-invalid', 'true');
      texte.textContent = message;
      texte.hidden = false;
    } else {
      champ.removeAttribute('aria-invalid');
      texte.textContent = '';
      texte.hidden = true;
    }
    return !message;
  }

  formulaire.addEventListener('submit', function (evenement) {
    evenement.preventDefault();
    var motDePasse = formulaire.elements['mot-de-passe'].value;
    var confirmation = formulaire.elements.confirmation.value;

    // Mêmes règles que dans l'application : 8 caractères au moins.
    var correct = erreurChamp('mot-de-passe', motDePasse.length < 8 ? 'Au moins 8 caractères.' : null);
    correct = erreurChamp('confirmation', confirmation !== motDePasse
      ? 'Les mots de passe ne correspondent pas.' : null) && correct;
    if (!correct) return;

    boutonEnregistrer.disabled = true;
    statut.hidden = true;
    (jetonSession ? Promise.resolve(jetonSession) : verifierLien())
      .then(function (jeton) {
        jetonSession = jeton;
        return appeler('PUT', '/user', { password: motDePasse }, jeton);
      })
      .then(function (r) {
        if (r.ok) {
          var jeton = jetonSession;
          jetonSession = null;
          return fermerSession(jeton).then(function () {
            montrer('mot-de-passe-change');
          });
        }
        boutonEnregistrer.disabled = false;
        var code = r.donnees && (r.donnees.error_code || r.donnees.code);
        if (code === 'same_password') {
          erreurChamp('mot-de-passe', 'Choisissez un mot de passe différent de l\'ancien.');
        } else if (code === 'weak_password') {
          erreurChamp('mot-de-passe', 'Ce mot de passe est trop facile à deviner. Choisissez-en un autre.');
        } else if (r.code === 401 || r.code === 403) {
          jetonSession = null;
          montrer('invalide');
        } else {
          afficherStatut('Le mot de passe n\'a pas pu être enregistré. Réessayez.');
        }
      })
      .catch(function (erreur) {
        boutonEnregistrer.disabled = false;
        traiterEchec(erreur);
      });
  });
})();
