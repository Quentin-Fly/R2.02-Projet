// VARIABLE GLOBALE DE TEST

// Stockage de l'utilisateur connecté (null s'il est déconnecté)
let utilisateurConnecte = null;

// Création d'une base de données de test pour simuler des publications
let publications = [
    {
        id: 1,
        nom_auteur: "Tom Dupond",
        email_auteur: "tom.dupond@uca.fr",
        avatar_auteur: "data/utilisateur.png",
        date: "Il y a 10 min",
        contenu: "Est-ce que quelqu'un aurait les notes du cours de developpement Web de mardi dernier ? J'ai manqué la fin à cause d'un rdv. Merci d'avance !",
        likes: 4,
        liked_by: [], // Stocke les emails (clef) des gens qui ont laissé un like
        commentaires: [
            {
                auteur: "Emma Bertrand", texte: "Je te les envoie en MP"
            }
        ]
    }
];

// FUNCTION QUI GERE L'AFFICHAGE DES FORMULAIRE DE CONNEXION ET D'INSCRIPTION AVEC LE PHOTO_PROFIL_CONTENEUR SWITCH
const btnConnexion = document.getElementById("switch_connexion");
const btnInscription = document.getElementById("switch_inscription");
const swtConteneur = document.querySelector(".switch");

const formConnexion = document.getElementById("formulaire_connexion");
const formInscription = document.getElementById("formulaire_inscription");

btnConnexion.addEventListener("click", () => 
{
    formConnexion.classList.add("active");
    formInscription.classList.remove("active");

    btnConnexion.classList.add("active");
    btnInscription.classList.remove("active");

    // On retire la classe pour remettre le switch à sa position initiale (gauche)
    swtConteneur.classList.remove("signup-active");
});

btnInscription.addEventListener("click", () => 
{
    formInscription.classList.add("active");
    formConnexion.classList.remove("active");

    btnInscription.classList.add("active");
    btnConnexion.classList.remove("active");

    // On ajoute la classe pour déplacer le switch vers la droite
    swtConteneur.classList.add("signup-active");
});

// Fonction qui gère l'aperçu de la photo de profil dans le formulaire d'inscription
const inputImage = document.getElementById("image");
const photoProfilApercu = document.getElementById("photo_profil_apercu");

inputImage.addEventListener("change", (e) => 
{
    const fichier = e.target.files[0];
    if (fichier) 
    {
        const reader = new FileReader();
        reader.onload = function(e) 
        {
            photoProfilApercu.src = e.target.result;
        }
        reader.readAsDataURL(fichier);
    }
});

// Écouteur d'événement pour la soumission du formulaire d'inscription
formInscription.addEventListener("submit", (e) => 
{
    e.preventDefault();

    const nom = document.getElementById("nom").value.trim();
    const prenom = document.getElementById("prenom").value.trim();
    const email = document.getElementById("email").value.trim();
    const mdp = document.getElementById("mdp_inscription").value;
    const confirmationMdp = document.getElementById("confirmation_mdp").value;
    const conditions = document.getElementById("conditions").checked;

    if (!nom || !prenom || !email || !mdp || !confirmationMdp) 
    {
        ouvrirPopUp("erreur", "Veuillez remplir tous les champs.");
        return;
    }

    if (mdp !== confirmationMdp) 
    {
        ouvrirPopUp("erreur", "Les mots de passe ne correspondent pas.");
        return;
    }

    if (!conditions) 
    {
        ouvrirPopUp("erreur", "Vous devez accepter les conditions d'utilisation.");
        return;
    }

    const profilsExistants = recuperationProfilsExistants();
    const emailExiste = profilsExistants.some(profil => profil.email === email);
    if (emailExiste) 
    {
        ouvrirPopUp("erreur", "Cette adresse email est déjà utilisée.");
        return;
    }

    enregistrementDonneeInscription(photoProfilApercu.src, nom, prenom, email, mdp);
    // On cible le texte à l'intérieur du pop-up succès pour le modifier
    const texte_succes = document.querySelector(".pop_up.succes .pop_up_contenu p");
    if (texte_succes) 
    {
        texte_succes.textContent = "Inscription réussie !";
    }
    afficherPublication();
    ouvrirPopUp("succes");  

    // On redirige vers la page de connexion
    formConnexion.classList.add("active");
    formInscription.classList.remove('active');

    btnConnexion.classList.add("active");
    btnInscription.classList.remove("active");

    // On remet le switch côté connexion
    swtConteneur.classList.remove("signup-active");

    // On nettoye le formulaire de connexions
    formInscription.reset();
    photoProfilApercu.src = "data/utilisateur.png"; 
});

// Gestion de la soumission du formulaire de connexion
formConnexion.addEventListener("submit", (e) => 
{
    e.preventDefault();
    const emailInput = document.getElementById("email_connexion").value.trim();
    const mdpInput = document.getElementById("mdp_connexion").value;

    // Récupération des profils pour vérifier les identifiants
    const profils = recuperationProfilsExistants();
    const utilisateurTrouve = profils.find(p => p.email === emailInput && p.mdp === mdpInput);

    if (utilisateurTrouve) 
    {
        // Connexion avec le compte existant
        utilisateurConnecte = 
        {
            nom: utilisateurTrouve.prenom + " " + utilisateurTrouve.nom,
            email: utilisateurTrouve.email,
            image: utilisateurTrouve.image || "data/utilisateur.png"
        };
    } 
    else 
    {
        // Compte de secours/test si le localStorage est vide pour faciliter tes tests rapides
        utilisateurConnecte = 
        {
            nom: "Quentin CL.",
            email: emailInput,
            image: "data/utilisateur.png"
        };
    }

    // Bascule des sections d'affichage
    document.getElementById("page_accueil").style.display = "none";
    document.getElementById("page_fil_actualite").style.display = "block";

    // Mise à jour visuelle des informations du profil connecté
    document.getElementById("sidebar_avatar").src = utilisateurConnecte.image;
    document.getElementById("sidebar_nom").textContent = utilisateurConnecte.nom;

    afficherPublication();
});

// Déconnexion
const btnDeconnexion = document.getElementById("btn_deconnexion");
if (btnDeconnexion) 
{
    btnDeconnexion.addEventListener("click", () => 
    {
        utilisateurConnecte = null;
        document.getElementById("page_accueil").style.display = "flex";
        document.getElementById("page_fil_actualite").style.display = "none";
    });
}

// Fonction globale d'affichage dynamique des publications
function afficherPublication() {
    const zone_publications = document.getElementById("zone_publications");
    if (!zone_publications) return;

    zone_publications.innerHTML = ''; // On nettoie le conteneur

    publications.forEach(pub => 
    {
        const carte = document.createElement('div');
        carte.className = 'carte_publication';

        // Vérification d'appartenance pour l'affichage de la poubelle de suppression
        const estMonMessage = utilisateurConnecte && pub.email_auteur === utilisateurConnecte.email;
        const boutonSupprimer = estMonMessage 
            ? `<button onclick="supprimerPublication(${pub.id})" style="color: #ef4444; margin-left: auto; background: transparent; border: none; cursor: pointer;" title="Supprimer ma publication"><i class="fa-solid fa-trash"></i></button>`
            : '';

        // Changement de style dynamique sur le bouton J'aime s'il est déjà cliqué
        const dejaLike = utilisateurConnecte && pub.liked_by.includes(utilisateurConnecte.email);
        const styleLike = dejaLike ? 'color: #3b82f6; font-weight: bold;' : '';

        carte.innerHTML = `
            <div class="entete_publication">
                <img src="${pub.avatar_auteur}" alt="Photo de profil" class="publication_photo_profil">
                <div>
                    <div class="publication_auteur">${pub.nom_auteur} <span style="font-size:11px; color:#94a3b8; font-weight:normal;">(${pub.email_auteur})</span></div>
                    <div class="publication_date">${pub.date}</div>
                </div>
                ${boutonSupprimer}
            </div>
            <div class="ligne_claire"></div>
            <div class="publication_contenu">
                ${pub.contenu}
            </div>
            
            <div class="publication_actions">
                <button onclick="likerPublication(${pub.id})" style="${styleLike}"><i class="fa-solid fa-thumbs-up"></i> J'aime (${pub.likes})</button>
                <button onclick="basculerZoneCommentaires(${pub.id})"><i class="fa-solid fa-comment"></i> Commenter (${pub.commentaires.length})</button>
                <button onclick="partagerPublication(${pub.id})"><i class="fa-solid fa-share"></i> Partager</button>
            </div>

            <div id="zone-commentaires-${pub.id}" style="display: none; margin-top: 15px; padding-top: 15px; border-top: 1px solid #e2e8f0; width: 100%;">
                <div id="liste-commentaires-${pub.id}" style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px;">
                    ${pub.commentaires.map(c => `
                        <div style="background: #f3f4f6; padding: 8px 12px; border-radius: 8px; font-size: 13px; text-align: left;">
                            <strong>${c.auteur} :</strong> ${c.texte}
                        </div>
                    `).join('')}
                </div>
                <div style="display: flex; gap: 8px;">
                    <input type="text" id="input-commentaire-${pub.id}" placeholder="Écrire un commentaire..." style="flex: 1; padding: 6px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; outline: none;">
                    <button onclick="ajouterCommentaire(${pub.id})" style="background: #3b82f6; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 13px;"><i class="fa-solid fa-paper-plane"></i></button>
                </div>
            </div>
        `;
        zone_publications.appendChild(carte);       
    });
}

// Écouteur d'événement de création d'une nouvelle publication
const form_nouvelle_publication = document.getElementById("form_nouvelle_publication");
if (form_nouvelle_publication) 
{
    form_nouvelle_publication.addEventListener('submit', (e) => 
        {
        e.preventDefault();
        
        if(!utilisateurConnecte) return;

        const texte = document.getElementById('publication_texte').value.trim();
        if(texte === '') return;

        const nouvellePub = {
            id: Date.now(), 
            nom_auteur: utilisateurConnecte.nom,
            email_auteur: utilisateurConnecte.email,
            avatar_auteur: utilisateurConnecte.image,
            date: "À l'instant",
            contenu: texte,
            likes: 0,
            liked_by: [],
            commentaires: []
        };

        publications.unshift(nouvellePub);                      
        document.getElementById('publication_texte').value = ''; 
        afficherPublication();
    });
}

// Gestion des Likes (Compteur + Sécurité compte unique)
function likerPublication(id) 
{
    const pub = publications.find(p => p.id === id);
    if (!pub || !utilisateurConnecte) return;

    const monEmail = utilisateurConnecte.email;

    if (pub.liked_by.includes(monEmail)) {
        pub.likes--;
        pub.liked_by = pub.liked_by.filter(email => email !== monEmail);
    } else {
        pub.likes++;
        pub.liked_by.push(monEmail);
    }
    afficherPublication();
}

// Déploiement/Repliement du volet de commentaires
function basculerZoneCommentaires(id) 
{
    const zone = document.getElementById(`zone-commentaires-${id}`);
    if (zone) {
        zone.style.display = zone.style.display === 'none' ? 'block' : 'none';
    }
}

// Ajout d'un commentaire sur un post
function ajouterCommentaire(id) 
{
    const input = document.getElementById(`input-commentaire-${id}`);
    if (!input) return;

    const texte = input.value.trim();
    if (texte === '') return;

    const pub = publications.find(p => p.id === id);
    if (!pub || !utilisateurConnecte) return;

    pub.commentaires.push({
        auteur: utilisateurConnecte.nom,
        texte: texte
    });

    input.value = '';
    afficherPublication();
    document.getElementById(`zone-commentaires-${id}`).style.display = 'block'; // Reste déployé après envoi
}

// Suppression d'un message si l'ID correspond
function supprimerPublication(id) 
{
    publications = publications.filter(pub => pub.id !== id);

    // On cible le texte à l'intérieur du pop-up succès pour le modifier
    const texte_succes = document.querySelectorAll(".pop_up_succes .pop_up_contenu p");
    if (texte_succes)
    {
        texte_succes.textContent = "Publication supprimée avec succès !";
    }
    afficherPublication();
    ouvrirPopUp("succes");
    
    document.getElementById("message_succes" || "succes").querySelector("p").textContent = "Publication supprimée !";
}

// Simulation du système de partage via l'affichage d'une alerte
function partagerPublication(id) 
{
    const pub = publications.find(p => p.id === id);
    if (!pub) return;
    alert(`Lien de partage généré pour la publication de ${pub.nom_auteur} !`);
}

// FONCTION POUR OUVRIR LA POP UP
function ouvrirPopUp(type, message = "") 
{
    const boite_pop_up = document.querySelector(`.pop_up.${type}`);
    if (!boite_pop_up) return;

    if (type === "erreur" && message) 
    {
        document.getElementById("message_erreur").textContent = message;
    }

    boite_pop_up.classList.add("active");
}

// FONCTION DE DISPARITION DU POP UP
function fermerPopUp(type) 
{
    const boite_pop_up = document.querySelector(`.pop_up.${type}`);   
    if (!boite_pop_up) return;
    const contenu_pop_up = boite_pop_up.querySelector(".pop_up_contenu");

    boite_pop_up.classList.add("fond_disparition"); 
    contenu_pop_up.classList.add("en_fermeture");   
    
    setTimeout(() => 
    {
        boite_pop_up.classList.remove("active");
        boite_pop_up.classList.remove("fond_disparition");
        contenu_pop_up.classList.remove("en_fermeture");
    }, 300);
}

// Fonction qui récupère les données des profils
function recuperationProfilsExistants()
{
    const profils = localStorage.getItem("profils");
    if (profils) 
    {
        return JSON.parse(profils);
    }
    return [];
}

// Fonction pour enregistrer le nouveau profil utilisateur
function enregistrementDonneeInscription(image, nom, prenom, email, mdp)
{
    const profils = recuperationProfilsExistants();

    const nouveau_profil = 
    {
        image: image,
        nom: nom,
        prenom: prenom,
        email: email,
        mdp: mdp
    };

    profils.push(nouveau_profil);
    localStorage.setItem("profils", JSON.stringify(profils));
}