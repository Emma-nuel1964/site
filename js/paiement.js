/* ==========================================================================
   Fluxia — paiement de l'abonnement (abonnement.html, bloc « Payer mon
   abonnement »), par la page de paiement hébergée de Yabetoo.

   1. Le commerçant se connecte avec son compte Fluxia (service de connexion
      de Supabase). La connexion ne vaut que pour cet onglet, une heure au
      plus, et se referme une fois le paiement confirmé.
   2. « Payer 2 500 FCFA (1 mois) » demande au serveur Fluxia (fonction
      paiement-abonnement) une page de paiement Yabetoo. Le prix est fixé par
      le serveur : la page n'envoie aucun montant.
   3. Le commerçant paie chez Yabetoo (MTN MoMo, Airtel Money), puis revient
      ici. Le serveur relit lui-même le paiement chez Yabetoo avant de
      prolonger l'abonnement : le retour sur cette page ne prouve rien à lui
      seul.

   Protections : aucun script extérieur (politique de sécurité du contenu,
   dans abonnement.html) ; départ uniquement vers une adresse de Yabetoo, en
   https ; rien du paiement ne s'affiche si la page est montrée dans le cadre
   d'un autre site. Seule la clé publique du projet figure ici (elle est
   faite pour une page web) ; aucun secret.
   ========================================================================== */
(function () {
  'use strict';

  /* Interrupteur du paiement : à false, la page remet le bloc de secours
     (« indisponible ») à la place du paiement, par exemple en cas de panne. */
  var EN_SERVICE = true;

  /* Serveur Fluxia (projet Supabase de production). */
  var PROJET = {
    adresse: 'https://xgryvsihnewjbutxahzf.supabase.co',
    cle: 'sb_publishable_vuyhrwROl98YED-JdpPiig_73ZLReUc'
  };

  var racine = document.querySelector('[data-paiement]');
  if (!racine || !EN_SERVICE) return;

  // Page montrée dans le cadre d'un autre site : le paiement ne s'affiche
  // pas, pour qu'aucun faux bouton posé par-dessus ne puisse le déclencher.
  if (window.top !== window.self) return;

  var CLE_SESSION = 'fluxia-paiement';
  var UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  // Au retour de Yabetoo, la vérification se répète toutes les 5 secondes
  // pendant une minute : le temps de valider sur le téléphone.
  var ESSAIS = 12;
  var PAUSE = 5000;

  var MESSAGE_RESEAU = 'Connexion impossible. Réessayez.';
  var MESSAGE_TROP = 'Trop de tentatives. Réessayez dans quelques minutes.';
  var MESSAGE_EXPIREE = 'Session expirée. Reconnectez-vous.';
  var MESSAGE_SERVEUR = 'Le service de paiement ne répond pas. Réessayez dans un instant.';
  var MESSAGE_RETOUR = 'Connectez-vous pour voir le résultat de votre paiement.';

  var statut = racine.querySelector('[data-statut]');
  var statutTexte = racine.querySelector('[data-statut-texte]');
  var formulaire = racine.querySelector('form[data-etat="connexion"]');
  var boutonConnexion = formulaire.querySelector('button[type="submit"]');
  var boutonPayer = racine.querySelector('[data-payer]');
  var textePayer = boutonPayer.textContent;

  var session = lireSession();
  var paiement = null;       // paiement à vérifier, au retour de Yabetoo
  var retourAnnule = false;  // retour par le bouton d'annulation de Yabetoo
  var minuterie = null;

  /* ---- Retour de Yabetoo : ?paiement=…&retour=succes|annule ------------ */
  var parametres = new URLSearchParams(window.location.search);
  if (parametres.has('paiement')) {
    if (UUID.test(parametres.get('paiement') || '')) {
      paiement = parametres.get('paiement');
      retourAnnule = parametres.get('retour') === 'annule';
    }
    // L'adresse affichée ne garde pas les paramètres du retour (historique,
    // copie, partage).
    try {
      window.history.replaceState(null, '', window.location.pathname + '#paiement');
    } catch (e) {
      // Navigateur qui le refuse : sans conséquence pour la suite.
    }
  }

  /* ---- Connexion, gardée dans l'onglet ---------------------------------- */
  function lireSession() {
    try {
      var s = JSON.parse(window.sessionStorage.getItem(CLE_SESSION) || 'null');
      if (s && typeof s.jeton === 'string' && typeof s.id === 'string' && UUID.test(s.id) &&
          typeof s.expireLe === 'number') {
        return s;
      }
    } catch (e) {
      // Stockage refusé ou illisible : il faudra se reconnecter.
    }
    return null;
  }

  function garderSession() {
    try {
      window.sessionStorage.setItem(CLE_SESSION, JSON.stringify(session));
    } catch (e) {
      // Stockage refusé : il faudra se reconnecter au retour de Yabetoo.
    }
  }

  function oublierSession() {
    session = null;
    try {
      window.sessionStorage.removeItem(CLE_SESSION);
    } catch (e) {
      // Rien à effacer.
    }
  }

  /* Connecté, pour encore une minute au moins. */
  function connecte() {
    if (session && session.expireLe > Date.now() + 60000) return true;
    if (session) oublierSession();
    return false;
  }

  /* ---- Appels au serveur Fluxia (Supabase) ------------------------------ */
  /* Renvoie toujours { ok, code, donnees } ; seule une coupure réseau est
     une erreur. */
  function appeler(methode, chemin, corps, jeton) {
    var entetes = { apikey: PROJET.cle };
    if (corps) entetes['Content-Type'] = 'application/json';
    if (jeton) entetes.Authorization = 'Bearer ' + jeton;
    return fetch(PROJET.adresse + chemin, {
      method: methode,
      headers: entetes,
      body: corps ? JSON.stringify(corps) : undefined,
      cache: 'no-store'
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

  function appelerPaiement(corps) {
    return appeler('POST', '/functions/v1/paiement-abonnement', corps, session.jeton);
  }

  /* Ferme la session chez Supabase, pas seulement dans la page. */
  function seDeconnecter() {
    var jeton = session && session.jeton;
    oublierSession();
    if (jeton) appeler('POST', '/auth/v1/logout?scope=local', null, jeton).catch(function () {});
  }

  /* Seules adresses de départ permises : celles de Yabetoo, en https. Sa
     page de paiement est sur pay.yabetoo.com, son serveur sur
     yabetoopay.com. */
  function adresseYabetoo(texte) {
    try {
      var adresse = new URL(texte);
      return adresse.protocol === 'https:' && !adresse.username && !adresse.password &&
        /(^|\.)yabetoo(pay)?\.com$/.test(adresse.hostname);
    } catch (e) {
      return false;
    }
  }

  /* ---- Affichage --------------------------------------------------------- */
  function montrer(nom, focus) {
    var blocs = racine.querySelectorAll('[data-etat]');
    for (var i = 0; i < blocs.length; i++) {
      blocs[i].hidden = blocs[i].getAttribute('data-etat') !== nom;
    }
    statut.hidden = true;
    if (focus) {
      var titre = racine.querySelector('[data-etat="' + nom + '"] h2');
      titre.tabIndex = -1;
      titre.focus();
    }
  }

  function afficherStatut(texte) {
    statutTexte.textContent = texte;
    statut.hidden = false;
    statut.focus();
  }

  /* « 1er décembre 2026 », ou « 1er décembre » sans l'année. */
  function jour(date, sansAnnee) {
    var texte = date.toLocaleDateString('fr-FR', sansAnnee
      ? { day: 'numeric', month: 'long' }
      : { day: 'numeric', month: 'long', year: 'numeric' });
    return date.getDate() === 1 ? texte.replace(/^1(?!\d)/, '1er') : texte;
  }

  function francs(montant) {
    return Number(montant).toLocaleString('fr-FR') + ' FCFA';
  }

  function demanderConnexion(message) {
    oublierSession();
    montrer('connexion', true);
    if (message) afficherStatut(message);
  }

  /* [lignes] : la ligne d'abonnement du compte (aucune avant le premier
     commerce), ou null si elle n'a pas pu être lue. */
  function afficherAbonnement(lignes) {
    var boite = racine.querySelector('[data-abonnement]');
    var titre = boite.querySelector('[data-abonnement-titre]');
    var ligne = lignes ? lignes[0] || null : null;
    var fin = ligne && ligne.expires_at ? new Date(ligne.expires_at) : null;
    var actif = !!(ligne && ligne.status === 'active' && fin && fin.getTime() > Date.now());

    boite.classList.toggle('paiement-etat--expire', !!ligne && !actif);
    if (!lignes) {
      titre.textContent = 'Abonnement momentanément indisponible';
    } else if (!ligne) {
      titre.textContent = 'Essai gratuit pas encore commencé';
    } else if (actif && ligne.plan === 'trial') {
      titre.textContent = 'Essai gratuit jusqu\'au ' + jour(fin);
    } else if (actif) {
      titre.textContent = 'Abonnement actif jusqu\'au ' + jour(fin);
    } else {
      titre.textContent = fin ? 'Abonnement expiré depuis le ' + jour(fin) : 'Abonnement expiré';
    }
  }

  /* [paiements] : les paiements réussis, les plus récents d'abord, ou null
     s'ils n'ont pas pu être lus. */
  function afficherHistorique(paiements) {
    var liste = racine.querySelector('[data-historique]');
    var vide = racine.querySelector('[data-historique-vide]');
    while (liste.firstChild) liste.removeChild(liste.firstChild);

    (paiements || []).forEach(function (p) {
      var debut = new Date(p.periode_debut);
      var fin = new Date(p.periode_fin);
      var ligne = document.createElement('li');
      var textes = document.createElement('div');
      var date = document.createElement('strong');
      date.className = 'paiement-date';
      date.textContent = 'Payé le ' + jour(new Date(p.paye_le));
      var periode = document.createElement('span');
      periode.className = 'paiement-periode';
      periode.textContent = 'Du ' + jour(debut, debut.getFullYear() === fin.getFullYear()) + ' au ' + jour(fin);
      var montant = document.createElement('span');
      montant.className = 'paiement-montant';
      montant.textContent = francs(p.montant);
      textes.appendChild(date);
      textes.appendChild(periode);
      ligne.appendChild(textes);
      ligne.appendChild(montant);
      liste.appendChild(ligne);
    });

    liste.hidden = !paiements || paiements.length === 0;
    vide.hidden = !liste.hidden;
    vide.textContent = paiements ? 'Aucun paiement.' : 'Historique momentanément indisponible.';
  }

  /* L'état de l'abonnement et les paiements du compte, puis le bouton
     « Payer ». Ne lit que les lignes du compte connecté (et la base n'en
     montre pas d'autres). */
  function chargerCompte(focus) {
    if (!connecte()) {
      demanderConnexion(MESSAGE_EXPIREE);
      return Promise.resolve();
    }
    montrer('chargement');
    var jeton = session.jeton;
    var compte = '&profile_id=eq.' + encodeURIComponent(session.id);
    return Promise.all([
      appeler('GET', '/rest/v1/subscriptions?select=plan,status,expires_at' + compte + '&limit=1', null, jeton),
      appeler('GET', '/rest/v1/paiements_abonnement?select=id,montant,paye_le,periode_debut,periode_fin' +
        '&statut=eq.paye' + compte + '&order=paye_le.desc&limit=12', null, jeton)
    ]).then(function (r) {
      if (r[0].code === 401 || r[1].code === 401) return demanderConnexion(MESSAGE_EXPIREE);
      afficherCompte(
        r[0].ok && Array.isArray(r[0].donnees) ? r[0].donnees : null,
        r[1].ok && Array.isArray(r[1].donnees) ? r[1].donnees : null,
        focus
      );
    }, function () {
      afficherCompte(null, null, focus);
      afficherStatut(MESSAGE_RESEAU);
    });
  }

  function afficherCompte(abonnement, paiements, focus) {
    racine.querySelector('[data-email]').textContent = session ? session.email : '';
    afficherAbonnement(abonnement);
    afficherHistorique(paiements);
    boutonPayer.disabled = false;
    boutonPayer.textContent = textePayer;
    montrer('compte', focus);
  }

  /* ---- Retour de Yabetoo : le serveur relit le paiement chez Yabetoo ---- */
  function verifier(essai) {
    window.clearTimeout(minuterie);
    if (!connecte()) return demanderConnexion(MESSAGE_RETOUR);
    if (essai === 0) montrer('verification', true);

    return appelerPaiement({ action: 'verifier', paiement_id: paiement }).then(function (r) {
      if (r.code === 401) return demanderConnexion(MESSAGE_RETOUR);
      if (r.code === 400 || r.code === 404) {
        // Paiement d'un autre compte, ou adresse de retour abîmée.
        paiement = null;
        return chargerCompte(true).then(function () {
          if (session) {
            afficherStatut('Ce paiement ne correspond pas à ce compte.');
          }
        });
      }

      var etat = r.ok && r.donnees ? r.donnees.statut : null;
      if (etat === 'paye') return confirmer(r.donnees.abonnement);
      if (etat === 'a_verifier') return montrer('a-verifier', true);
      if (etat === 'annule' || etat === 'expire' || etat === 'echoue') {
        paiement = null;
        return montrer('non-abouti', true);
      }
      if (etat === 'en_attente' && !retourAnnule && essai + 1 < ESSAIS) {
        minuterie = window.setTimeout(function () {
          verifier(essai + 1);
        }, PAUSE);
        return;
      }
      montrer('en-attente', true);
      if (!r.ok) afficherStatut(MESSAGE_SERVEUR);
    }, function () {
      montrer('en-attente', true);
      afficherStatut(MESSAGE_RESEAU);
    });
  }

  function confirmer(abonnement) {
    var fin = abonnement && abonnement.expires_at ? new Date(abonnement.expires_at) : null;
    if (fin) {
      racine.querySelector('[data-paye-texte]').textContent =
        'Votre abonnement est actif jusqu\'au ' + jour(fin) + '.';
    }
    paiement = null;
    seDeconnecter();
    montrer('paye', true);
  }

  /* ---- Formulaire de connexion ------------------------------------------ */
  function erreurChamp(nom, message) {
    var champ = formulaire.elements[nom];
    var texte = document.getElementById('paiement-' + nom + '-erreur');
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

  ['email', 'mot-de-passe'].forEach(function (nom) {
    formulaire.elements[nom].addEventListener('input', function () {
      erreurChamp(nom, null);
    });
  });

  formulaire.addEventListener('submit', function (evenement) {
    evenement.preventDefault();
    var email = formulaire.elements.email.value.trim();
    var motDePasse = formulaire.elements['mot-de-passe'].value;

    var correct = erreurChamp('email', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ? null : 'Adresse email invalide.');
    correct = erreurChamp('mot-de-passe', motDePasse ? null : 'Saisissez votre mot de passe.') && correct;
    if (!correct) return;

    boutonConnexion.disabled = true;
    statut.hidden = true;
    appeler('POST', '/auth/v1/token?grant_type=password', { email: email, password: motDePasse })
      .then(function (r) {
        boutonConnexion.disabled = false;
        var d = r.donnees;
        if (r.ok && d && typeof d.access_token === 'string' && d.user && UUID.test(d.user.id || '')) {
          // Le mot de passe ne reste pas dans la page. La connexion n'est
          // jamais prolongée : passé une heure, il faut se reconnecter.
          formulaire.reset();
          session = {
            jeton: d.access_token,
            expireLe: Date.now() + (Number(d.expires_in) || 3600) * 1000,
            id: d.user.id,
            email: d.user.email || email
          };
          garderSession();
          if (paiement) verifier(0);
          else chargerCompte(true);
          return;
        }
        var code = d && (d.error_code || d.code);
        if (r.code === 429) {
          afficherStatut(MESSAGE_TROP);
        } else if (code === 'email_not_confirmed') {
          afficherStatut('Confirmez d\'abord votre adresse email.');
        } else if (r.code === 400 || r.code === 401 || r.code === 422) {
          afficherStatut('Adresse email ou mot de passe incorrect.');
        } else {
          afficherStatut(MESSAGE_SERVEUR);
        }
      })
      .catch(function () {
        boutonConnexion.disabled = false;
        afficherStatut(MESSAGE_RESEAU);
      });
  });

  /* ---- Boutons ----------------------------------------------------------- */
  boutonPayer.addEventListener('click', function () {
    if (!connecte()) {
      demanderConnexion(MESSAGE_EXPIREE);
      return;
    }
    boutonPayer.disabled = true;
    boutonPayer.textContent = 'Ouverture du paiement…';
    statut.hidden = true;

    appelerPaiement({ action: 'creer' }).then(function (r) {
      var adresse = r.ok && r.donnees ? r.donnees.url : null;
      if (typeof adresse === 'string' && adresseYabetoo(adresse)) {
        // Départ vers la page de paiement de Yabetoo.
        window.location.assign(adresse);
        return;
      }
      boutonPayer.disabled = false;
      boutonPayer.textContent = textePayer;
      if (r.code === 401) {
        demanderConnexion(MESSAGE_EXPIREE);
      } else if (!r.ok && r.donnees && typeof r.donnees.erreur === 'string') {
        afficherStatut(r.donnees.erreur);
      } else if (typeof adresse === 'string') {
        // Adresse qui n'est pas celle de Yabetoo : la page ne part pas.
        afficherStatut('Impossible d\'ouvrir la page de paiement. Réessayez plus tard.');
      } else {
        afficherStatut(MESSAGE_SERVEUR);
      }
    }, function () {
      boutonPayer.disabled = false;
      boutonPayer.textContent = textePayer;
      afficherStatut(MESSAGE_RESEAU);
    });
  });

  // Retour arrière depuis la page de Yabetoo (page gardée en mémoire par le
  // navigateur) : le bouton redevient utilisable.
  window.addEventListener('pageshow', function (evenement) {
    if (evenement.persisted) {
      boutonPayer.disabled = false;
      boutonPayer.textContent = textePayer;
    }
  });

  racine.querySelector('[data-deconnecter]').addEventListener('click', function () {
    seDeconnecter();
    montrer('connexion', true);
  });

  racine.querySelector('[data-reverifier]').addEventListener('click', function () {
    retourAnnule = false;
    verifier(0);
  });

  Array.prototype.forEach.call(racine.querySelectorAll('[data-retour-compte]'), function (bouton) {
    bouton.addEventListener('click', function () {
      paiement = null;
      chargerCompte(true);
    });
  });

  /* ---- Ouverture de la page ---------------------------------------------- */
  if (!connecte()) {
    montrer('connexion');
    if (paiement) afficherStatut(MESSAGE_RETOUR);
  } else if (paiement) {
    verifier(0);
  } else {
    chargerCompte(false);
  }
})();
