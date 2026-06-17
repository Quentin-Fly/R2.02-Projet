// Variables d'état pour le filtrage et la recherche
let filtreActuel = "toutes"; 
let rechercheTexte = "";

// Variables globales pour la gestion des images
let temp_image_publication = "";
const input_image = document.getElementById("publication_image_input");
const conteneur_apercu = document.getElementById("conteneur_apercu_image");
const image_apercu = document.getElementById("apercu_image_publication");
const btn_ajouter_image = document.getElementById("btn_ajouter_image");

// Stockage de l'utilisateur connecté (null s'il est déconnecté)
let utilisateur_connecte = null;

// Création d'une base de données de test pour simuler des publications
let publications = recupererPublicationsExistantes();

// GESTION DE L'AFFICHAGE DES FORMULAIRES DE CONNEXION ET D'INSCRIPTION
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

        if (swtConteneur) 
        {
            swtConteneur.classList.remove("signup-active");
        }
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

        if (swtConteneur) 
        {
            swtConteneur.classList.add("signup-active");
        }
    });
}

// Aperçu de la photo de profil (Inscription)
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

// Soumission Inscription
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

        enregistrementDonneeInscription(photoProfilApercu ? photoProfilApercu.src : "data/utilisateur.png", nom, prenom, email, mdp);
        
        const text_succes = document.querySelector(".pop_up.succes .pop_up_contenu p");
        if (text_succes) 
        {
            text_succes.textContent = "Inscription réussie !";
        }
        ouvrirPopUp("succes");  

        formConnexion.classList.add("active");
        formInscription.classList.remove('active');

        if (btnConnexion) 
        {
            btnConnexion.classList.add("active");
        }
        if (btnInscription) 
        {
            btnInscription.classList.remove("active");
        }
        if (swtConteneur) 
        {
            swtConteneur.classList.remove("signup-active");
        }

        formInscription.reset();
        if (photoProfilApercu) 
        {
            photoProfilApercu.src = "data/utilisateur.png"; 
        }
    });
}

// Soumission Connexion
if (formConnexion) 
{
    formConnexion.addEventListener("submit", (e) => 
    {
        e.preventDefault();
        const email_input = document.getElementById("email_connexion").value.trim();
        const mdp_input = document.getElementById("mdp_connexion").value;

        const profils = recuperationProfilsExistants();
        const utilisateur_trouve = profils.find(p => p.email === email_input && p.mdp === mdp_input);

        if (utilisateur_trouve) 
        {
            utilisateur_connecte = 
            {
                nom: utilisateur_trouve.prenom + " " + utilisateur_trouve.nom,
                email: utilisateur_trouve.email,
                image: utilisateur_trouve.image || "data/utilisateur.png",
                abonnements: utilisateur_trouve.abonnements || []
            };
        } 
        else 
        {
            ouvrirPopUp("erreur", "Identifiants incorrects ou compte supprimé.");
            return;
        }

        document.getElementById("page_accueil").style.display = "none";
        document.getElementById("page_fil_actualite").style.display = "block"; 

        document.querySelectorAll(".globale_avatar").forEach(img => 
        {
            img.src = utilisateur_connecte.image;
        });
        document.querySelectorAll(".globale_nom").forEach(div => 
        {
            div.innerText = utilisateur_connecte.nom;
        });
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

// Affichage dynamique des publications
function afficherPublication() 
{
    const zone_publications = document.getElementById("zone_publications");
    if (!zone_publications) 
    {
        return;
    }
    
    zone_publications.innerHTML = ''; 

    let publicationsFiltrees = publications.filter(pub => {
        const correspondTexte = 
            pub.contenu.toLowerCase().includes(rechercheTexte.toLowerCase()) ||
            pub.nom_auteur.toLowerCase().includes(rechercheTexte.toLowerCase()) ||
            pub.email_auteur.toLowerCase().includes(rechercheTexte.toLowerCase());

        let correspondCategorie = true;
        if (filtreActuel === "mes_publications" && utilisateur_connecte) 
        {
            correspondCategorie = (pub.email_auteur === utilisateur_connecte.email);
        } 
        else if (filtreActuel === "aimees" && utilisateur_connecte) 
        {
            correspondCategorie = pub.liked_by.includes(utilisateur_connecte.email);
        }

        return correspondTexte && correspondCategorie;
    });

    if (utilisateur_connecte && utilisateur_connecte.abonnements) 
    {
        publicationsFiltrees.sort((a, b) =>
        {
            const aSuivi = utilisateur_connecte.abonnements.includes(a.email_auteur) ? 1 : 0;
            const bSuivi = utilisateur_connecte.abonnements.includes(b.email_auteur) ? 1 : 0;
            return bSuivi - aSuivi;
        });
    }

    if (publicationsFiltrees.length === 0) 
    {
        zone_publications.innerHTML = `
            <div class="carte_publication publication_recherche_vide">
                <i class="fa-solid fa-magnifying-glass"></i>
                <p>Aucune publication ne correspond à vos critères.</p>
            </div>
        `;
        return;
    }

    publicationsFiltrees.forEach(pub => 
    {
        const carte = document.createElement('div');
        carte.className = 'carte_publication';

        const estMonMessage = utilisateur_connecte && pub.email_auteur === utilisateur_connecte.email;
        const boutonSupprimer = estMonMessage 
            ? `<button onclick="supprimerPublication(${pub.id})" id="btn_suppr" title="Supprimer ma publication"><i class="fa-solid fa-trash"></i></button>`
            : '';

        let boutonFollow = '';
        if (utilisateur_connecte && !estMonMessage) 
        {
            const dejaSuivi = utilisateur_connecte.abonnements.includes(pub.email_auteur);
            boutonFollow = dejaSuivi 
                ? `<button onclick="basculerSuivi('${pub.email_auteur}')" class="btn_unfollow">Ne plus suivre</button>`
                : `<button onclick="basculerSuivi('${pub.email_auteur}')" class="btn_follow">Suivre</button>`;
        }

        const dejaLike = utilisateur_connecte && pub.liked_by.includes(utilisateur_connecte.email);
        const classeLike = dejaLike ? 'class="publication_like_actif"' : '';

        carte.innerHTML = `
            <div class="entete_publication">
                <img src="${pub.avatar_auteur}" alt="Photo de profil" class="publication_photo_profil">
                <div>
                    <div class="publication_auteur">${pub.nom_auteur} <span class="publication_auteur_email">(${pub.email_auteur})</span></div>
                    <div class="publication_date">${formaterDate(pub.date)}</div>
                </div>
                ${boutonFollow}
                ${boutonSupprimer}
            </div>
            <div class="ligne_claire"></div>
            <div class="publication_contenu">${pub.contenu}</div>

            ${pub.image_contenu ? `
                <div class="publication_image_zone">
                    <img src="${pub.image_contenu}" alt="Image">
                </div>
            ` : ''}
            
            <div class="publication_actions">
                <button onclick="likerPublication(${pub.id})" ${classeLike}><i class="fa-solid fa-thumbs-up"></i> J'aime (${pub.likes})</button>
                <button onclick="basculerZoneCommentaires(${pub.id})"><i class="fa-solid fa-comment"></i> Commenter (${pub.commentaires.length})</button>
            </div>

            <div id="zone-commentaires-${pub.id}" class="zone_commentaires_bloc" style="display:none;">
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

if (btn_ajouter_image && input_image) 
{
    btn_ajouter_image.addEventListener("click", () => {
        input_image.click();
    });
}

if (input_image) 
{
    input_image.addEventListener("change", (e) => {
        const fichier = e.target.files[0];
        if (fichier) 
        {
            const reader = new FileReader();
            reader.onload = function(e) {
                temp_image_publication = e.target.result;
                if (image_apercu && conteneur_apercu) 
                {
                    image_apercu.src = e.target.result;
                    conteneur_apercu.style.display = "block";
                }
            }
            reader.readAsDataURL(fichier);
        }
    });
}

const form_nouvelle_publication = document.getElementById("form_nouvelle_publication");
if (form_nouvelle_publication) 
{
    form_nouvelle_publication.addEventListener('submit', (e) => 
    {
        e.preventDefault(); 

        if (!utilisateur_connecte) 
        {
            return;
        }

        const texte = document.getElementById('publication_texte').value.trim();
        
        if (texte === '' && (!temp_image_publication || temp_image_publication === '')) 
        {
            ouvrirPopUp("erreur", "Votre publication ne peut pas être vide.");
            return;
        }

        const nouvelle_pub = {
            id: Date.now(), 
            nom_auteur: utilisateur_connecte.nom,
            email_auteur: utilisateur_connecte.email,
            avatar_auteur: utilisateur_connecte.image,
            date: Date.now(),
            contenu: texte,
            image_contenu: temp_image_publication || "", 
            likes: 0,
            liked_by: [],
            commentaires: []
        };

        publications.unshift(nouvelle_pub);                      
        document.getElementById('publication_texte').value = ''; 
        
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

function likerPublication(id) 
{
    const pub = publications.find(p => p.id === id);
    if (!pub || !utilisateur_connecte) 
    {
        return;
    }

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

function basculerSuivi(email_auteur)
{
    if (!utilisateur_connecte) 
    {
        return;
    }
    
    const index = utilisateur_connecte.abonnements.indexOf(email_auteur);
    if (index > -1)
    {
        utilisateur_connecte.abonnements.splice(index, 1);
    }
    else
    {
        utilisateur_connecte.abonnements.push(email_auteur);
    }

    const profils = recuperationProfilsExistants();
    const p_index = profils.findIndex(p => p.email === utilisateur_connecte.email);
    
    if (p_index > -1)
    {
        profils[p_index].abonnements = utilisateur_connecte.abonnements;
        localStorage.setItem("profils", JSON.stringify(profils));
    }

    afficherPublication();
    if (document.getElementById("page_profil").style.display === "block")
    {
        genererDashboardProfil();
    }
}

function basculerZoneCommentaires(id) 
{
    const zone = document.getElementById(`zone-commentaires-${id}`);
    if (!zone) 
    {
        return;
    }

    const styleReel = window.getComputedStyle(zone).display;
    zone.style.display = (styleReel === "none") ? "block" : "none";
}

function ajouterCommentaire(id) 
{
    const input = document.getElementById(`input-commentaire-${id}`);
    if (!input) 
    {
        return;
    }

    const texte = input.value.trim();
    if (texte === '') 
    {
        return;
    }

    const pub = publications.find(p => p.id === id);
    if (!pub || !utilisateur_connecte) 
    {
        return;
    }

    pub.commentaires.push({
        auteur: utilisateur_connecte.nom,
        texte: texte
    });

    input.value = '';
    sauvegarderPublications();
    afficherPublication();
    document.getElementById(`zone-commentaires-${id}`).style.display = 'block'; 
}

function supprimerPublication(id) 
{
    publications = publications.filter(pub => pub.id !== id);

    const text_succes = document.querySelector(".pop_up.succes .pop_up_contenu p");
    if (text_succes)
    {
        text_succes.textContent = "Publication supprimée avec succès !";
    }
    sauvegarderPublications();
    afficherPublication();
    ouvrirPopUp("succes");
}
function ouvrirPopUp(type, message = "") 
{
    const boite_pop_up = document.querySelector(`.pop_up.${type}`);
    if (!boite_pop_up) 
    {
        return;
    }

    if (type === "erreur" && message) 
    {
        const msg_err = document.getElementById("message_erreur");
        if (msg_err) 
        {
            msg_err.textContent = message;
        }
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

const barreRecherche = document.getElementById("barre_recherche");
if (barreRecherche) 
{
    barreRecherche.addEventListener("input", (e) => 
    {
        rechercheTexte = e.target.value.trim();
        afficherPublication(); 
    });
}

const btn_filtre = document.getElementById("btn_filtre_burger");
if (btn_filtre)
{
    btn_filtre.addEventListener("click", () => 
    {
        const popUp_filtre = document.getElementById("pop_up_filtre");
        if (popUp_filtre) 
        {
            popUp_filtre.classList.add("active");
        }
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
    const btn_filtre_el = document.getElementById("btn_filtre_burger");
    if (btn_filtre_el) 
    {
        if (typeFiltre === "mes_publications") 
        {
            btn_filtre_el.style.color = "#3b82f6";
        }
        else if (typeFiltre === "aimees") 
        {
            btn_filtre_el.style.color = "#ef4444";
        }
        else 
        {
            btn_filtre_el.style.color = "";
        }
    }
    fermerPopUpFiltre();
    afficherPublication();
}

function recuperationProfilsExistants()
{
    const profils = localStorage.getItem("profils");
    return profils ? JSON.parse(profils) : [];
}

setInterval(() => 
{
    if (utilisateur_connecte) 
    {
        afficherPublication();
    }
}, 60000); 

function enregistrementDonneeInscription(image, nom, prenom, email, mdp)
{
    const profils = recuperationProfilsExistants();
    const nouveau_profil = { image, nom, prenom, email, mdp, abonnements: [] };
    profils.push(nouveau_profil);
    localStorage.setItem("profils", JSON.stringify(profils));
}

function recupererPublicationsExistantes() 
{
    const localPubs = localStorage.getItem("publications_kampus");
    if (localPubs) 
    {
        return JSON.parse(localPubs);
    }
    
    return [
        {
            id: 1,
            nom_auteur: "Tom Dupond",
            email_auteur: "tom.dupond@uca.fr",
            avatar_auteur: "data/utilisateur.png",
            date: 1781605560000, 
            contenu: "Est-ce que quelqu'un aurait les notes du cours de developpement Web de mardi dernier ?",
            likes: 4,
            liked_by: [], 
            commentaires: [{ auteur: "Emma Bertrand", texte: "Je te les envoie en MP" }]
        }
    ];
}

function sauvegarderPublications() 
{
    localStorage.setItem("publications_kampus", JSON.stringify(publications));
}

function formaterDate(timestamp) 
{
    const maintenant = Date.now();
    const delta_secondes = Math.floor((maintenant - timestamp) / 1000);

    if (delta_secondes < 60) 
    {
        return "À l'instant";
    }

    const delta_minutes = Math.floor(delta_secondes / 60);
    if (delta_minutes < 60) 
    {
        return `Il y a ${delta_minutes} min`;
    }

    const delta_heures = Math.floor(delta_minutes / 60);
    if (delta_heures < 24) 
    {
        return `Il y a ${delta_heures} h`;
    }

    return new Date(timestamp).toLocaleDateString("fr-FR");
}

function ouvrirPageProfil()
{
    document.getElementById("vue_fils_actualite").style.display = "none";
    document.getElementById("page_abonnements").style.display = "none";
    
    document.getElementById("page_profil").style.display = "flex";
    
    genererDashboardProfil();
}

function ouvrirPageAbonnements() 
{

    document.getElementById("vue_fils_actualite").style.display = "none";
    document.getElementById("page_profil").style.display = "none";
    document.getElementById("page_abonnements").style.display = "flex";

    genererListeAbonnements();
}

function retournerAuFilActualite() 
{
    document.getElementById("page_profil").style.display = "none";
    document.getElementById("page_abonnements").style.display = "none";
    
    document.getElementById("page_fil_actualite").style.display = "block";
    document.getElementById("vue_fils_actualite").style.display = "flex";
    
    afficherPublication();
}


document.addEventListener("DOMContentLoaded", () =>
{
    // Clic sur l'encadré profil à gauche pour ouvrir le profil
    const menu_accueil = document.querySelector(".gauche .profil_carte");
    if (menu_accueil)
    {
        menu_accueil.style.cursor = "pointer";
        menu_accueil.addEventListener("click", ouvrirPageProfil);
    }

    // NAVIGATION GLOBALE : Clic sur les boutons "Fil d'actualité"
    document.querySelectorAll(".link_vers_accueil").forEach(btn => 
    {
        btn.addEventListener("click", retournerAuFilActualite);
    });

    // NAVIGATION GLOBALE : Clic sur les boutons "Mon Profil"
    document.querySelectorAll(".link_vers_profil").forEach(btn => 
    {
        btn.addEventListener("click", ouvrirPageProfil);
    });

    // NAVIGATION GLOBALE : Clic sur les boutons "Abonnements"
    document.querySelectorAll(".link_vers_abonnements").forEach(btn => 
    {
        btn.addEventListener("click", ouvrirPageAbonnements);
    });

    // Boutons de déconnexion
    document.querySelectorAll(".btn_deconnexion_commune").forEach(btn =>
    {
        btn.addEventListener("click", () => {
            utilisateur_connecte = null;
            document.getElementById("page_profil").style.display = "none";
            document.getElementById("page_abonnements").style.display = "none";
            document.getElementById("page_accueil").style.display = "flex";
        });
    });

    // ACTIVATION ET GESTION DU MODE SOMBRE
    const btnThemes = document.getElementById("btn_themes");
    if (btnThemes) 
    {
        btnThemes.addEventListener("click", () => {
            document.body.classList.toggle("dark-mode");
            
            // Changement d'icône dynamique (soleil / lune)
            const icone = btnThemes.querySelector("i");
            if (icone) 
            {
                if (document.body.classList.contains("dark-mode")) 
                {
                    icone.className = "fa-solid fa-moon";
                } 
                else 
                {
                    icone.className = "fa-solid fa-sun";
                }
            }
        });
    }
});

function genererDashboardProfil() 
{
    if (!utilisateur_connecte) 
    {
        return;
    }

    document.querySelectorAll(".pdp_dynamique").forEach(img => {
        img.src = utilisateur_connecte.image || "data/utilisateur.png";
    });
    document.querySelectorAll(".nom_utilisateur_dynamique").forEach(el => {
        el.textContent = utilisateur_connecte.nom;
    });

    const mes_pubs = (publications || []).filter(p => p.email_auteur === utilisateur_connecte.email);
    const nb_publications = mes_pubs.length;

    let nb_likes_recus = 0;
    let nb_commentaires_recus = 0;

    mes_pubs.forEach(p =>
    {
        nb_likes_recus += p.likes || 0;
        if (p.commentaires) 
        {
            nb_commentaires_recus += p.commentaires.length;
        }
    });

    const conteneur_profil = document.getElementById("zone_contenu_profil");
    if (!conteneur_profil) 
    {
        return;
    }

    conteneur_profil.innerHTML = `
        <div class="carte_profil_conteneur">
            <h3 class="titre__profil_conteneur">
                <i class="fa-solid fa-id-card icone-bleue"></i> Informations personnelles
            </h3>
            <div class="ligne_claire"></div>
            <div class="infos_utilisateur">
                <img src="${utilisateur_connecte.image || 'data/utilisateur.png'}" class="pdp-grand-format" alt="Photo de profil">
                <div class="texte-details-utilisateur">
                    <p><strong>Nom :</strong> ${utilisateur_connecte.nom.split(' ')[1] || ''}</p>
                    <p><strong>Prénom :</strong> ${utilisateur_connecte.nom.split(' ')[0] || ''}</p>
                    <p><strong>Email :</strong> ${utilisateur_connecte.email}</p>
                </div>
            </div>
        </div>

        <div class="carte_profil_conteneur">
            <h3 class="titre__profil_conteneur">
                <i class="fa-solid fa-chart-pie icone-verte"></i> Statistiques utilisateur (Dashboard)
            </h3>
             <div class="ligne_claire"></div>
            <p class="sous-titre_conteneur">Quantité cumulée de vos interactions sur la plateforme</p>
            
            <div class="grille_stat_dashboard">
                <div class="statistique barre_vert">
                    <div class="valeur_statistique texte_vert">${nb_publications}</div>
                    <div class="label_statistique lab_vert">Publications</div>
                </div>
                <div class="statistique barre_bleu">
                    <div class="val_stat texte_bleu">${nb_likes_recus}</div>
                    <div class="label_stat lab_bleu">Likes reçus</div>
                </div>
                <div class="statistique barre_orange">
                    <div class="val_stat texte_orange">${nb_commentaires_recus}</div>
                    <div class="label-stat lab_orange">Commentaires reçus</div>
                </div>
            </div>
        </div>
    `;
}

function genererListeAbonnements() 
{
    if (!utilisateur_connecte) 
    {
        return;
    }

    document.querySelectorAll(".pdp_dynamique").forEach(img => {
        img.src = utilisateur_connecte.image || "data/utilisateur.png";
    });
    document.querySelectorAll(".nom_utilisateur_dynamique").forEach(el => {
        el.textContent = utilisateur_connecte.nom;
    });

    const conteneur_cartes = document.getElementById("zone_carte_suivi");
    if (!conteneur_cartes) 
    {
        return;
    }

    if (!utilisateur_connecte.abonnements) 
    {
        utilisateur_connecte.abonnements = [];
    }

    let tous_les_profils = [];
    try 
    {
        tous_les_profils = JSON.parse(localStorage.getItem("profils")) || [];
    } 
    catch (e) 
    {
        tous_les_profils = [];
    }

    const mes_suivis = tous_les_profils.filter(p => utilisateur_connecte.abonnements.includes(p.email));

    if (mes_suivis.length === 0) 
    {
        conteneur_cartes.innerHTML = `
            <div class="boite_liste_vide_abonnement">
                <i class="fa-solid fa-user-plus icone_liste_vide"></i>
                <p class="texte_principal_vide">Vous ne suivez aucun utilisateur pour le moment.</p>
                <p class="texte_secondaire_vide">Abonnez-vous à des profils depuis le fil d'actualité pour les voir ici !</p>
            </div>`;
        return;
    }

    let grille_html = `<div class="grille_abo">`;

    mes_suivis.forEach(p => 
    {
        grille_html += `
            <div class="carte_suivi">
                <img src="${p.image || 'data/utilisateur.png'}" style="width:80px; height:80px; border-radius:50%; object-fit:cover;">
                <div>
                    <h4>${p.prenom} ${p.nom}</h4>
                    <span style="font-size: 0.85rem; color:#64748b; display:block; margin-top:4px;">${p.email}</span>
                </div>
                <button onclick="gererUnfollowDepuisPage('${p.email}')" class="btn_unfollow">
                    <i class="fa-solid fa-user-minus"></i> Ne plus suivre
                </button>
            </div>
        `;
    });
    
    grille_html += `</div>`;
    conteneur_cartes.innerHTML = grille_html;
}

function gererUnfollowDepuisPage(email_auteur)
{
    if (!utilisateur_connecte || !utilisateur_connecte.abonnements) 
    {
        return;
    }

    const index = utilisateur_connecte.abonnements.indexOf(email_auteur);
    if (index > -1) 
    {
        utilisateur_connecte.abonnements.splice(index, 1);
        
        let profils = recuperationProfilsExistants();
        const idx = profils.findIndex(p => p.email === utilisateur_connecte.email);
        if (idx > -1) 
        {
            profils[idx].abonnements = utilisateur_connecte.abonnements;
            localStorage.setItem("profils", JSON.stringify(profils));
        }
    }
    genererListeAbonnements();
}
function appliquerFiltre(typeFiltre) 
{
    appliquerFiltrePopUp(typeFiltre);
}