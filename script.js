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
        contenu: "Est-ce que quelqu'un aurait les notes du cours de developpement Web de mardi dernier ? J'ai manqué la fin à cause d'un rdv. Merci d'avance !", // <-- Virgule ajoutée ici
        likes: 4,
        liked_by: [], // Stocke les emails (clef) des gens qui ont laissé un like
        commentaires: [
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

    if (nom === "") { message_erreur.push("Le nom est requis."); }
    if (prenom === "") { message_erreur.push("Le prénom est requis."); }
    if (!email.includes("@")) { message_erreur.push("L'email n'est pas valide."); }
    if (profilsExistants.some(profil => profil.email === email)) 
    {
        message_erreur.push("Cet email est déjà utilisé.");
    }
    if (mdp === "") { message_erreur.push("Le mot de passe est requis."); }
    if (mdp !== mdp_confirmation) { message_erreur.push("Les mots de passe ne correspondent pas."); }
    if (!reglementOK) { message_erreur.push("Vous devez accepter les conditions d'utilisation."); }

    // Gestion du message d'erreur
    const erreur = document.getElementById("message_erreur");

    if (message_erreur.length > 0)
    {
        const boite_pop_up = document.querySelector(".pop_up.erreur");
        const contenu_pop_up = boite_pop_up.querySelector(".pop_up_contenu");

        boite_pop_up.classList.remove("fond_disparition");
        contenu_pop_up.classList.remove("en_fermeture");

        void boite_pop_up.offsetWidth;

        boite_pop_up.classList.add("active");
        erreur.innerHTML = `<ul>${message_erreur.map(msg => `<li>${msg}</li>`).join("")}</ul>`;
    }
    else
    {
        // Attention : stocker un objet File complet en localStorage ne marchera pas directement.
        // Idéalement, il faudrait convertir l'image en Base64 avant.
        enregistrementDonneeInscription(pdp ? pdp.name : "data/utilisateur.png", nom, prenom, email, mdp);
        document.querySelector(".pop_up.succes").classList.add("active"); 
        
        document.getElementById("formulaire_inscription").reset();
        document.getElementById("photo_profil_apercu").src = "data/utilisateur.png";
        document.getElementById("switch_connexion").click();
    }
});

// GESTION DU FORMULAIRE DE CONNEXION
document.getElementById("formulaire_connexion").addEventListener("submit", function (event)
{
    event.preventDefault();

    const email = document.getElementById("email_connexion").value.trim();
    const mdp = document.getElementById("mdp_connexion").value;

    const profils_existants = recuperationProfilsExistants();
    const profil_trouve = profils_existants.find(profil => profil.email === email && profil.mdp === mdp);

    const erreur = document.getElementById("message_erreur");

    if (profil_trouve)
    {
        // Assigner l'utilisateur connecté globalement
        utilisateurConnecte = profil_trouve;
        afficherFilActualite();
        afficherPublication(); // On charge les publications à la connexion
    }
    else
    {
        const boite_pop_up = document.querySelector(".pop_up.erreur");
        const contenu_pop_up = boite_pop_up.querySelector(".pop_up_contenu");

        boite_pop_up.classList.remove("fond_disparition");
        contenu_pop_up.classList.remove("en_fermeture");

        void boite_pop_up.offsetWidth;

        boite_pop_up.classList.add("active");
        contenu_pop_up.querySelector("h2").textContent = "Erreur de connexion";
        erreur.textContent = "Email ou mot de passe incorrect.";
    }
});

// GESTION DES POP-UPS
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

function recuperationProfilsExistants()
{
    const profils = localStorage.getItem("profils");
    return profils ? JSON.parse(profils) : [];
}

function enregistrementDonneeInscription(image, nom, prenom, email, mdp)
{
    const profils = recuperationProfilsExistants();

    const nouveau_profil = {
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
function afficherFilActualite()
{
    const page_accueil = document.querySelector("#page_accueil");
    const fil_actualite = document.querySelector("#page_fil_actualite");

    if(page_accueil) page_accueil.style.display = "none";
    if(fil_actualite) fil_actualite.style.display = "block";
}

// Fonction qui gère la déconnexion
document.getElementById('btn_deconnexion').addEventListener('click', () => 
{
    utilisateurConnecte = null;
    // Ajustement des IDs pour correspondre à ton HTML
    if(document.getElementById('page_accueil')) document.getElementById('page_accueil').style.display = "block";      
    if(document.getElementById('page_fil_actualite')) document.getElementById('page_fil_actualite').style.display = "none";
});

// GESTION DES PUBLICATIONS
const zone_publications = document.getElementById("zone_publications");
const form_nouvelle_publication = document.getElementById("form_nouvelle_publication");

// Fonction qui génère le code HTML des publications
function afficherPublication()
{
    zone_publications.innerHTML = '';
    
    // Correction de la syntaxe du forEach (ajout de la flèche =>)
    publications.forEach(pub => 
    {
        const carte = document.createElement("div");
        carte.className = "carte_publication";

        const est_mon_message = utilisateurConnecte && pub.email_auteur === utilisateurConnecte.email;

        // Correction de la string template (remplacé les backticks erronés par de vrais guillemets)
        const bouton_suppr = est_mon_message
            ? `<button class="btn_supprimer" onclick="supprimerPublication(${pub.id})" style="color: #ef4444; margin-left: 10px; background: transparent; border: none; cursor: pointer;"><i class="fa-solid fa-trash"></i></button>` 
            : '';

        // Correction des variables (pub.avatar_auteur, pub.nom_auteur, etc.)
        const checkLike = utilisateurConnecte && pub.liked_by.includes(utilisateurConnecte.email) ? 'color: #3b82f6; font-weight: bold;' : '';

        carte.innerHTML = `
            <div class="entete_publication">
            <img src="${pub.avatar_auteur}" alt="Profil" class="publication_photo_profil">
                <div>
                    <div class="publication_auteur">${pub.nom_auteur} <span style="font-size:11px; color:#94a3b8; font-weight:normal;">(${pub.email_auteur})</span></div>
                    <div class="publication_date">${pub.date}</div>
                </div>
                <div style="margin-left: auto; display: flex; align-items: center;">
                    ${bouton_suppr}
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
                <button onclick="likerPublication(${pub.id})" id="btn-like-action-${pub.id}" style="${checkLike}">
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
    
    if(!utilisateurConnecte) {
        alert("Vous devez être connecté pour publier.");
        return;
    }

    const texte = document.getElementById('publication_texte').value;

    const nouvellePub = {
        id: Date.now(), 
        nom_auteur: utilisateurConnecte.nom,
        email_auteur: utilisateurConnecte.email,
        avatar_auteur: utilisateurConnecte.image || "data/utilisateur.png",
        date: "À l'instant",
        contenu: texte,
        likes: 0,
        liked_by: [],
        commentaires: []
    };

    publications.unshift(nouvellePub);                      
    document.getElementById('publication_texte').value = ''; 
    afficherPublication(); // Correction du nom de la fonction
});

// Supprimer une publication
function supprimerPublication(id) {
    publications = publications.filter(pub => pub.id !== id);
    afficherPublication(); // Correction du nom de la fonction
    
    // Remplacement de ouvrirPopUp (non définie) par une alerte ou ta logique personnalisée
    alert("Votre publication a bien été supprimée."); 
}