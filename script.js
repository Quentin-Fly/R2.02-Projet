// VARIABLE GLOBALE DE TESTE

// Stockage de l'utilisateur connecté (null si il est déco)
let utilisateurConnecte = null;

// Création du base de donnée de test pour simulée des publication
let publications = [
    {
        id : 1,
        nom_auteur : "Tom Dupond",
        email_auteur : "tom.dupond@uca.fr",
        avatar_auteur : "data/utilisateur.png",
        date : "Il y a 10 min",
        contenu : "Est-ce que quelqu'un aurait les notes du cours de developpement Web de mardi dernier ? J'ai manqué la fin à cause d'un rdv. Merci d'avance !"
        likes : 4,
        liked_by: []// Stocke les emails (clef) des gens qui on laissé un like
        commentaires : [
            {
                auteur: "Emma Bertrand", texte: "Je te les envoie en MP"
            }
        ]
    }
];
// GESTION DU SWITCH
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

// GESTION DE L'APERCU DE LA PP
const inputImage = document.getElementById("image");
const photoProfilApercu = document.getElementById("photo_profil_apercu");

inputImage.addEventListener("change", () =>
{
    const fichier = inputImage.files[0];
    if (fichier)
    {
        const lecteur = new FileReader();
        lecteur.onload = () =>
        {
            photoProfilApercu.src = lecteur.result;
        }
        lecteur.readAsDataURL(fichier);
    }
});

// GESTION DU FORMULAIRE D'INSCRIPTION
document.getElementById("formulaire_inscription").addEventListener("submit", function (event)
{
    event.preventDefault();
    
    // Récupération des valeurs du formulaire
    const pdp = document.getElementById("image").files[0];
    const nom = document.getElementById("nom").value.trim();
    const prenom = document.getElementById("prenom").value.trim();
    const email = document.getElementById("email").value.trim();
    const mdp = document.getElementById("mdp_inscription").value;
    const mdp_confirmation = document.getElementById("confirmation_mdp").value;
    const reglementOK = document.getElementById("conditions").checked;

    // Récupération des profils existants
    const profilsExistants = recuperationProfilsExistants();

    // Validation des données
    let message_erreur = [];

    if (nom === "")
    { 
        message_erreur.push("Le nom est requis."); 
    }
    if (prenom === "") 
    { 
        message_erreur.push("Le prénom est requis."); 
    }
    if (!email.includes("@")) 
    { 
        message_erreur.push("L'email n'est pas valide."); 
    }
    if (profilsExistants.some(profil => profil.email === email)) 
    {
        message_erreur.push("Cet email est déjà utilisé.");
    }
    if (mdp === "")
    { 
        message_erreur.push("Le mot de passe est requis."); 
    }
    if (mdp !== mdp_confirmation) 
    { 
        message_erreur.push("Les mots de passe ne correspondent pas."); 
    }
    if (!reglementOK) 
    { 
        message_erreur.push("Vous devez accepter les conditions d'utilisation."); 
    }

    // Gestion du message d'erreur
    const erreur = document.getElementById("message_erreur");

    if (message_erreur.length > 0)
    {
        // Cible spécifiquement la pop-up d'erreur
        const boite_pop_up = document.querySelector(".pop_up.erreur");
        const contenu_pop_up = boite_pop_up.querySelector(".pop_up_contenu");

        // Nettoyage des classes d'animation de fermeture
        boite_pop_up.classList.remove("fond_disparition");
        contenu_pop_up.classList.remove("en_fermeture");

        void boite_pop_up.offsetWidth;

        // Affichage du pop-up d'erreur
        boite_pop_up.classList.add("active");
        erreur.innerHTML = `<ul>${message_erreur.map(msg => `<li>${msg}</li>`).join("")}</ul>`;
    }
    else
    {
        enregistrementDonneeInscription(pdp, nom, prenom, email, mdp);
        document.querySelector(".pop_up.succes").classList.add("active"); // Affiche le pop-up de succès
        
        // Réinitialisation du formulaire
        document.getElementById("formulaire_inscription").reset();
        document.getElementById("photo_profil_apercu").src = "data/utilisateur.png";
        document.getElementById("switch_connexion").click();
    }
});

// GESTION DU FORMULAIRE D'INSCRIPTION
document.getElementById("formulaire_connexion").addEventListener("submit", function (event)
{
    event.preventDefault();

    // Récupération des valeurs du formulaire
    const email = document.getElementById("email_connexion").value.trim();
    const mdp = document.getElementById("mdp_connexion").value;

    // Récupération des profils existants
    const profils_existants = recuperationProfilsExistants();

    // Validation des données
    const profil_trouve = profils_existants.find(profil => profil.email === email && profil.mdp === mdp);

    // Récupération du message d'erreur
    const erreur = document.getElementById("message_erreur");


    if (profil_trouve)
    {
        // Redirection vers le fils d'actualité
        afficherFilActualite();
    }
    else
    {
        // Affichage pop up message erreur
        const boite_pop_up = document.querySelector(".pop_up.erreur");
        const contenu_pop_up = boite_pop_up.querySelector(".pop_up_contenu");

        // Nettoyage des classes d'animation de fermeture
        boite_pop_up.classList.remove("fond_disparition");
        contenu_pop_up.classList.remove("en_fermeture");

        void boite_pop_up.offsetWidth;

        // Affichage du pop-up d'erreur
        boite_pop_up.classList.add("active");
        contenu_pop_up.querySelector("h2").textContent = "Erreur de connexion";
        erreur.textContent = "Email ou mot de passe incorrect.";
        
    }
});
// GESTION DES POP-UPS
// Fonction pour fermer la pop-up d'erreur ou de succès avec une animation de disparition
function fermerPopUp(type)
{
    const boite_pop_up = document.querySelector(`.pop_up.${type}`);   
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
// ENREGOSTREMENT DU NOUVEAU PROFILS
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
// GESTION DE L'AFFICHAGE
// Fonction pour faire disparaître la section page d'acceuil et afficher la section : fils d'actualité
function afficherFilActualite()
{
    const page_accueil = document.querySelector("#page_accueil");
    const fil_actualite = document.querySelector("#page_fil_actualite");

    page_accueil.style.display = "none";
    fil_actualite.style.display = "block";
}
// Fonction qui gère la déconnexion, affiche la page de connexion
document.getElementById('btn_deconnexion').addEventListener('click', () => 
{
    utilisateurConnecte = null;
    document.getElementById('page_connexion').style.display = "block";      // Affiche la page de connexion
    document.getElementById('page_fil_actualite').style.display = "none"    // Cache la page du fils d'actualité
})

// GESTION DES PUBLICATION (Affichage, création, suppression)
const zone_publications = document.getElementById("zone_publications");
const form_nouvelle_publication = document.getElementById("form_nouvelle_publication");

// Fonction qui génère le code HTML des publication
function afficherPublication()
{
    // On vide la zone avant de la reconstruire
    zone_publications.innerHTML = ''
    // On parcourt tout les publications et les crées
    publications.forEach(pub)
    {
        // On créer une nouvelle publication avec la class "carte_publication"
        const carte = document.createElement("div");
        carte.className = "carte_publication";

        // On vérifie si la publication appartient à l'utilisateur
        const est_mon_message = utilisateurConnecte && pub.email_auteur === utilisateurConnecte.email;

        // On affiche le bouton supprimer uniquement si le message nous appartien
        const bouton_suppr = est_mon_message
            ? '<button class="btn_supprimer" onclick="supprimerPublication(${pub.id})" style="color: #ef4444; margin-left: 10px; background: transparent; border: none; cursor: pointer;"><i class="fa-solid fa-trash"></i></button>`' : '';

        // On construit le HTML de la carte publication
        carte.innerHTML = `
            <div class="entete_publication">
            <img src="${pub.avatar}" alt="Profil" class="publication_photo_profil">
                <div>
                    <div class="publication_auteur">${pub.auteurNom} <span style="font-size:11px; color:#94a3b8; font-weight:normal;">(${pub.auteurEmail})</span></div>
                    <div class="publication_date">${pub.date}</div>
                </div>
                <div style="margin-left: auto; display: flex; align-items: center;">
                    ${boutonSupprimer}
                </div>
            </div>
            
            <div class="publication_contenu">
                ${pub.contenu}
            </div>

            <div style="display: flex; gap: 15px; font-size: 13px; color: #6b7280; padding-bottom: 10px; border-bottom: 1px solid #f1f5f9; margin-bottom: 10px;">
                <span><i class="fa-solid fa-thumbs-up" style="color: #3b82f6;"></i> <span id="compteur-like-${pub.id}">${pub.likes}</span> J'aime</span>
                <span><i class="fa-solid fa-comment"></i> ${pub.commentaires.length} Commentaire(s)</span>
            </div>
            
            <div class="publication_actions">
                <button onclick="likerPublication(${pub.id})" id="btn-like-action-${pub.id}" style="${pub.likedBy.includes(utilisateurConnecte.email) ? 'color: #3b82f6; font-weight: bold;' : ''}">
                    <i class="fa-solid fa-thumbs-up"></i> J'aime
                </button>
                <button onclick="basculerCommentaires(${pub.id})"><i class="fa-solid fa-comment"></i> Commenter</button>
                <button onclick="partagerPublication(${pub.id})"><i class="fa-solid fa-share"></i> Partager</button>
            </div>

            <div id="zone-commentaires-${pub.id}" style="display: none; margin-top: 15px; padding-top: 15px; border-top: 1px solid #f1f5f9;">
                <div id="liste-commentaires-${pub.id}" style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 15px;">
                    ${pub.commentaires.map(c => `
                        <div style="background: #f8f9fa; padding: 10px; border-radius: 8px; font-size: 13px;">
                            <strong>${c.auteur} :</strong> ${c.texte}
                        </div>
                    `).join('')}
                </div>
                <div style="display: flex; gap: 10px;">
                    <input type="text" id="input-commentaire-${pub.id}" placeholder="Écrire un commentaire..." style="flex: 1; padding: 8px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 13px; outline: none;">
                    <button onclick="ajouterCommentaire(${pub.id})" style="background: #3b82f6; color: white; border: none; padding: 8px 15px; border-radius: 6px; cursor: pointer; font-size: 13px;"><i class="fa-solid fa-paper-plane"></i></button>
                </div>
            </div>`;
        zone_publications.appendChild(carte);       

    });
}
// Créer une nouvelle publication
form_nouvelle_publication.addEventListener('submit', (e) => {
    e.preventDefault();
    const texte = document.getElementById('publication_texte').value;

    const nouvellePub = 
    {
        id: Date.now(), // Génère un ID unique basé sur le temps
        nom_auteur: utilisateurConnecte.nom,
        email_auteur: utilisateurConnecte.email,
        avatar: utilisateurConnecte.avatar,
        date: "À l'instant",
        contenu: texte,
        likes: 0,
        likedBy: [],
        commentaires: []
    };

    publications.unshift(nouvellePub);                      // On ajoute au début du tableau
    document.getElementById('publication_texte').value = ''; // On vide le champ
    afficherPublications();                                  // On rafraîchit l'affichage
});

// Supprimer une publication
function supprimerPublication(id) {
    // Filtrer le tableau pour retirer la publication choisie
    publications = publications.filter(pub => pub.id !== id);
    afficherPublications();
    ouvrirPopUp("Succès", "Votre publication a bien été supprimée.");
}
