// VARIABLE GLOBALE DE TEST

// Variables d'état pour le filtrage et la recherche
let filtreActuel = "toutes"; 
let rechercheTexte = "";

// Variables globale pour la gestion des imagtes

let temp_image_publication = "";
const input_image = document.getElementById("publication_image_input");
const conteneur_apercu = document.getElementById("conteneur_apercu_image");
const image_apercu = document.getElementById("apercu_image_publication");
const btn_ajouter_image = document.getElementById("btn_ajouter_image");

// Stockage de l'utilisateur connecté (null s'il est déconnecté)
let utilisateur_connecte = null;

// Création d'une base de données de test pour simuler des publications
let publications = recupererPublicationsExistantes();

// FUNCTION QUI GERE L'AFFICHAGE DES FORMULAIRE DE CONNEXION ET D'INSCRIPTION AVEC LE PHOTO_PROFIL_CONTENEUR SWITCH
const btnConnexion = document.getElementById("switch_connexion");
const btnInscription = document.getElementById("switch_inscription");
const swtConteneur = document.querySelector(".switch");

const formConnexion = document.getElementById("formulaire_connexion");
const formInscription = document.getElementById("formulaire_inscription");

if (btnConnexion) 
{
    btnConnexion.addEventListener("click", () => 
    {
        formConnexion.classList.add("active");
        formInscription.classList.remove("active");

        btnConnexion.classList.add("active");
        btnInscription.classList.remove("active");

        // On retire la classe pour remettre le switch à sa position initiale (gauche)
        swtConteneur.classList.remove("signup-active");
    });
}

if (btnInscription) 
{
    btnInscription.addEventListener("click", () => 
    {
        formInscription.classList.add("active");
        formConnexion.classList.remove("active");

        btnInscription.classList.add("active");
        btnConnexion.classList.remove("active");

        // On ajoute la classe pour déplacer le switch vers la droite
        swtConteneur.classList.add("signup-active");
    });
}

// Fonction qui gère l'aperçu de la photo de profil dans le formulaire d'inscription
const inputImage = document.getElementById("image");
const photoProfilApercu = document.getElementById("photo_profil_apercu");

if (inputImage && photoProfilApercu) 
{
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
}

// Écouteur d'événement pour la soumission du formulaire d'inscription
if (formInscription) 
{
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

        const profils_existants = recuperationProfilsExistants();
        const email_existe = profils_existants.some(profil => profil.email === email);

        if (email_existe) 
        {
            ouvrirPopUp("erreur", "Cette adresse email est déjà utilisée.");
            return;
        }

        // Sauvegarde fonctionnelle
        enregistrementDonneeInscription(photoProfilApercu ? photoProfilApercu.src : "data/utilisateur.png", nom, prenom, email, mdp);
        
        // On cible le texte à l'intérieur du pop-up succès pour le modifier
        const texte_succes = document.querySelector(".pop_up.succes .pop_up_contenu p");
        if (texte_succes) 
        {
            texte_succes.textContent = "Inscription réussie !";
        }
        ouvrirPopUp("succes");  

        // On redirige vers la page de connexion
        formConnexion.classList.add("active");
        formInscription.classList.remove('active');

        btnConnexion.classList.add("active");
        btnInscription.classList.remove("active");

        // On remet le switch côté connexion
        swtConteneur.classList.remove("signup-active");

        // On nettoie le formulaire
        formInscription.reset();
        if (photoProfilApercu) photoProfilApercu.src = "data/utilisateur.png"; 
    });
}

// Gestion de la soumission du formulaire de connexion
if (formConnexion) 
{
    formConnexion.addEventListener("submit", (e) => 
    {
        e.preventDefault();
        const email_input = document.getElementById("email_connexion").value.trim();
        const mdp_input = document.getElementById("mdp_connexion").value;

        // Récupération des profils pour vérifier les identifiants
        const profils = recuperationProfilsExistants();
        const utilisateur_trouve = profils.find(p => p.email === email_input && p.mdp === mdp_input);

        if (utilisateur_trouve) 
        {
            // Connexion avec le compte trouvé dans le localStorage
            utilisateur_connecte = 
            {
                nom: utilisateur_trouve.prenom + " " + utilisateur_trouve.nom,
                email: utilisateur_trouve.email,
                image: utilisateur_trouve.image || "data/utilisateur.png"
            };
        } 
        else 
        {
            // Si aucun utilisateur n'est trouvé dans le localStorage, on bloque au lieu de créer un faux compte !
            ouvrirPopUp("erreur", "Identifiants incorrects ou compte supprimé.");
            return;
        }

        // Bascule des sections d'affichage
        document.getElementById("page_accueil").style.display = "none";
        document.getElementById("page_fil_actualite").style.display = "block"; 

        const avatar_profil = document.querySelector("#fils_actualite .gauche .photo_profil");
        const nom_profil = document.getElementById("nom_utilisateur_menu");

        if (avatar_profil) 
        {
            avatar_profil.src = utilisateur_connecte.image;
        }
        if (nom_profil) 
        {
            nom_profil.textContent = utilisateur_connecte.nom;
        }

        afficherPublication();
    });
}

// Déconnexion
const btnDeconnexion = document.getElementById("btn_deconnexion");
if (btnDeconnexion) 
{
    btnDeconnexion.addEventListener("click", () => 
    {
        utilisateur_connecte = null;
        document.getElementById("page_accueil").style.display = "flex";
        document.getElementById("page_fil_actualite").style.display = "none";
    });
}

// Fonction globale d'affichage dynamique des publications
function afficherPublication() {
    const zone_publications = document.getElementById("zone_publications");
    if (!zone_publications) return;
    
    zone_publications.innerHTML = ''; 

    // Filtrage logique
    let publicationsFiltrees = publications.filter(pub => {
        const correspondTexte = 
            pub.contenu.toLowerCase().includes(rechercheTexte.toLowerCase()) ||
            pub.nom_auteur.toLowerCase().includes(rechercheTexte.toLowerCase()) ||
            pub.email_auteur.toLowerCase().includes(rechercheTexte.toLowerCase());

        let correspondCategorie = true;
        if (filtreActuel === "mes_publications" && utilisateur_connecte) {
            correspondCategorie = (pub.email_auteur === utilisateur_connecte.email);
        } else if (filtreActuel === "aimees" && utilisateur_connecte) {
            correspondCategorie = pub.liked_by.includes(utilisateur_connecte.email);
        }

        return correspondTexte && correspondCategorie;
    });

    // Affichage si vide
    if (publicationsFiltrees.length === 0) {
        zone_publications.innerHTML = `
            <div class="carte_publication publication_recherche_vide">
                <i class="fa-solid fa-magnifying-glass"></i>
                <p>Aucune publication ne correspond à vos critères.</p>
            </div>
        `;
        return;
    }

    // Génération des cartes publication
    publicationsFiltrees.forEach(pub => {
        const carte = document.createElement('div');
        carte.className = 'carte_publication';

        const estMonMessage = utilisateur_connecte && pub.email_auteur === utilisateur_connecte.email;
        const boutonSupprimer = estMonMessage 
            ? `<button onclick="supprimerPublication(${pub.id})" id="btn_suppr" title="Supprimer ma publication"><i class="fa-solid fa-trash"></i></button>`
            : '';

        const dejaLike = utilisateur_connecte && pub.liked_by.includes(utilisateur_connecte.email);
        const classeLike = dejaLike ? 'class="publication_like_actif"' : '';

        carte.innerHTML = `
            <div class="entete_publication">
                <img src="${pub.avatar_auteur}" alt="Photo de profil" class="publication_photo_profil">
                <div>
                    <div class="publication_auteur">${pub.nom_auteur} <span class="publication_auteur_email">(${pub.email_auteur})</span></div>
                    <div class="publication_date">${formaterDate(pub.date)}</div>
                </div>
                ${boutonSupprimer}
            </div>
            <div class="ligne_claire"></div>
            <div class="publication_contenu">
                ${pub.contenu}
            </div>

            ${pub.image_contenu ? `
                <div class="publication_image_zone">
                    <img src="${pub.image_contenu}" alt="Image">
                </div>
            ` : ''}
            
            <div class="publication_actions">
                <button onclick="likerPublication(${pub.id})" ${classeLike}><i class="fa-solid fa-thumbs-up"></i> J'aime (${pub.likes})</button>
                <button onclick="basculerZoneCommentaires(${pub.id})"><i class="fa-solid fa-comment"></i> Commenter (${pub.commentaires.length})</button>
                <button onclick="partagerPublication(${pub.id})"><i class="fa-solid fa-share"></i> Partager</button>
            </div>

            <div id="zone-commentaires-${pub.id}" class="zone_commentaires_bloc">
                <div id="liste-commentaires-${pub.id}" class="liste_commentaires_boite">
                    ${pub.commentaires.map(c => `
                        <div class="commentaire_unitaire">
                            <strong>${c.auteur} :</strong> ${c.texte}
                        </div>
                    `).join('')}
                </div>
                <div class="zone_saisie_commentaire">
                    <input type="text" id="input-commentaire-${pub.id}" placeholder="Écrire un commentaire..." class="input_nouveau_commentaire">
                    <button onclick="ajouterCommentaire(${pub.id})" class="btn_envoyer_commentaire"><i class="fa-solid fa-paper-plane"></i></button>
                </div>
            </div>
        `;
        zone_publications.appendChild(carte);       
    });
}      
// Déclencher le clic sur l'input quand on clique sur le bouton "Image"
if (btn_ajouter_image && input_image) {
    btn_ajouter_image.addEventListener("click", () => {
        input_image.click();
    });
}

// Lire l'image sélectionnée et l'afficher en aperçu
if (input_image) {
    input_image.addEventListener("change", (e) => {
        const fichier = e.target.files[0];
        if (fichier) {
            const reader = new FileReader();
            reader.onload = function(e) {
                temp_image_publication = e.target.result; // Stocke l'image en Base64
                if (image_apercu && conteneur_apercu) {
                    image_apercu.src = e.target.result;
                    conteneur_apercu.style.display = "block"; // Affiche l'aperçu
                }
            }
            reader.readAsDataURL(fichier);
        }
    });
}
// Écouteur d'événement de création d'une nouvelle publication
const form_nouvelle_publication = document.getElementById("form_nouvelle_publication");

if (form_nouvelle_publication) 
{
    form_nouvelle_publication.addEventListener('submit', (e) => 
    {
        e.preventDefault(); 

        if(!utilisateur_connecte) 
        {
            return;
        }

        const texte = document.getElementById('publication_texte').value.trim();
        
        // On utilise la bonne variable image définie à la fin du script
        if(texte === '' && (!temp_image_publication || temp_image_publication === '')) 
        {
            ouvrirPopUp("erreur", "Votre publication ne peut pas être vide.");
            return;
        }

        const nouvelle_pub = {
            id: Date.now(), 
            nom_auteur: utilisateur_connecte.nom,
            email_auteur: utilisateur_connecte.email,
            // Suppression de cyber_image_security qui n'est pas défini pour éviter un crash
            avatar_auteur: utilisateur_connecte.image,
            date: Date.now(),
            contenu: texte,
            image_contenu: temp_image_publication || "", // Utilisation de la bonne variable
            likes: 0,
            liked_by: [],
            commentaires: []
        };

        publications.unshift(nouvelle_pub);                      
        document.getElementById('publication_texte').value = ''; 
        
        // Nettoyage de l'aperçu après publication avec les bonnes variables globales
        temp_image_publication = "";
        if (image_apercu)
        {
            image_apercu.src = "";
        } 
        if (conteneur_apercu)
        {
            conteneur_apercu.style.display = "none";
        }
        if (input_image) 
        {
            input_image.value = "";
        }
        
        sauvegarderPublications(); 
        afficherPublication();
    });
}

// Gestion des Likes (Compteur + Sécurité compte unique)
function likerPublication(id) 
{
    const pub = publications.find(p => p.id === id);
    if (!pub || !utilisateur_connecte) return;

    const mon_email = utilisateur_connecte.email;

    if (pub.liked_by.includes(mon_email)) 
    {
        pub.likes--;
        pub.liked_by = pub.liked_by.filter(email => email !== mon_email);
    } 
    else 
    {
        pub.likes++;
        pub.liked_by.push(mon_email);
    }
    afficherPublication();
}

// Déploiement/Repliement du volet de commentaires
function basculerZoneCommentaires(id) 
{
    const zone = document.getElementById(`zone-commentaires-${id}`);
    if (!zone) return;

    const styleReel = window.getComputedStyle(zone).display;

    if (styleReel === "none") 
    {
        zone.style.display = "block";
    } 
    else 
    {
        zone.style.display = "none";
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
    if (!pub || !utilisateur_connecte) return;

    pub.commentaires.push({
        auteur: utilisateur_connecte.nom,
        texte: texte
    });

    input.value = '';
    // On sauvagarde la publication et affiche
    sauvegarderPublications();
    afficherPublication();
    document.getElementById(`zone-commentaires-${id}`).style.display = 'block'; 
}

// Suppression d'un message si l'ID correspond
function supprimerPublication(id) 
{
    publications = publications.filter(pub => pub.id !== id);

    const texte_succes = document.querySelector(".pop_up.succes .pop_up_contenu p");
    if (texte_succes)
    {
        texte_succes.textContent = "Publication supprimée avec succès !";
    }
    // On sauvegarde et on affiche
    sauvegarderPublications();
    afficherPublication();
    ouvrirPopUp("succes");
}

// Simulation du système de partage via l'affichage d'une alerte
function partagerPublication(id) 
{
    const pub = publications.find(p => p.id === id);
    if (!pub) return;
    alert(`Lien de partage généré pour la publication de ${pub.nom_auteur} !`);
}

// FONCTION POUR OUVRIR/FERMER LA POP UP
function ouvrirPopUp(type, message = "") 
{
    const boite_pop_up = document.querySelector(`.pop_up.${type}`);
    if (!boite_pop_up) return;

    if (type === "erreur" && message) 
    {
        const msg_err = document.getElementById("message_erreur");
        if (msg_err) msg_err.textContent = message;
    }

    boite_pop_up.classList.add("active");
}
function fermerPopUp(type) 
{
    const boite_pop_up = document.querySelector(`.pop_up.${type}`);
    if (boite_pop_up) 
    {
        boite_pop_up.classList.remove("active");
    }
}
// GESTION DES FILTRES ET RECHERCHE
// Écouteur sur la barre de recherche
const barreRecherche = document.getElementById("barre_recherche");
if (barreRecherche) 
{
    barreRecherche.addEventListener("input", (e) => 
    {
        rechercheTexte = e.target.value.trim();
        afficherPublication(); 
    });
}

// Gestion des actions de la pop-up de filtrage
const btn_filtre = document.getElementById("btn_filtre_burger");
if (btn_filtre)
{
    btn_filtre.addEventListener("click", () => 
    {
        const popUp_filtre = document.getElementById("pop_up_filtre");
        if (popUp_filtre) popUp_filtre.classList.add("active");
    });
}

function fermerPopUpFiltre() 
{
    const popUp_filtre = document.getElementById("pop_up_filtre");
    const contenu = popUp_filtre ? popUp_filtre.querySelector(".pop_up_contenu") : null;
    if (popUp_filtre && contenu) 
    {
        contenu.classList.add("en_fermeture");
        popUp_filtre.classList.add("fond_disparition");
        setTimeout(() => 
        {
            popUp_filtre.classList.remove("active");
            contenu.classList.remove("en_fermeture");
            popUp_filtre.classList.remove("fond_disparition");
        }, 300);
    }
}

function appliquerFiltrePopUp(typeFiltre) 
{
    filtreActuel = typeFiltre;
    const btn_filtre = document.getElementById("btn_filtre_burger");
    if (btn_filtre) 
    {
        if (typeFiltre === "mes_publications") 
        {
            btn_filtre.style.color = "#3b82f6";
        }
        else if (typeFiltre === "aimees") 
        {
            btn_filtre.style.color = "#ef4444";
        }
        else btn_filtre.style.color = "";
    }
    fermerPopUpFiltre();
    afficherPublication();
}
// FONCTION DE GESTION DE DONNEES
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
// Relance l'affichage des publications toutes les 60 secondes
setInterval(() => 
{
    if (utilisateur_connecte) 
    {
        afficherPublication();
    }
}, 60000); // 60 000 ms -> 60 sec

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
// Récupère les publications du localStorage ou charge la publication par défaut
function recupererPublicationsExistantes() 
{
    const localPubs = localStorage.getItem("publications_kampus");
    if (localPubs) 
    {
        return JSON.parse(localPubs);
    }
    
    // Si la base locale est vide, on retourne la publication par défaut
    return [
        {
            id: 1,
            nom_auteur: "Tom Dupond",
            email_auteur: "tom.dupond@uca.fr",
            avatar_auteur: "data/utilisateur.png",
            date: 1781605560000, // Timetemp aux 16/06 à 12h26 (UTC)
            contenu: "Est-ce que quelqu'un aurait les notes du cours de developpement Web de mardi dernier ? J'ai manqué la fin à cause d'un rdv. Merci d'avance !",
            likes: 4,
            liked_by: [], 
            commentaires: [
                {
                    auteur: "Emma Bertrand", texte: "Je te les envoie en MP"
                }
            ]
        }
    ];
}

// Sauvegarde le tableau des publications dans le localStorage
function sauvegarderPublications() 
{
    localStorage.setItem("publications_kampus", JSON.stringify(publications));
}
// FONCTION QUI GERE LE TEMPS
// Fonction qui transforme un timestamp en texte relatif (Ex: "Il y a 5 min")
function formaterDate(timestamp) 
{
    const maintenant = Date.now();
    const delta_secondes = Math.floor((maintenant - timestamp) / 1000);

    if (delta_secondes < 60)    // En dessous de 60 secondes on affiche "à l'instant"
    {
        return "À l'instant";
    }

    const delta_minutes = Math.floor(delta_secondes / 60);
    if (delta_minutes < 60)     // En dessous de 60 minutes on affiche "il y a X min"
    {
        return `Il y a ${delta_minutes} min`;
    }

    const delta_heures = Math.floor(delta_minutes / 60); // En dessous de 24h on affiche "il y a X h"
    if (delta_heures < 24) {
        return `Il y a ${delta_heures} h`;
    }

    // Au-delà de 24h, on affiche une date classique
    const dateEcheance = new Date(timestamp);
    return dateEcheance.toLocaleDateString("fr-FR");
}